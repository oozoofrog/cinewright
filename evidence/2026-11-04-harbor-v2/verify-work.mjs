import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browser } from '../../scripts/execution.mjs';
import { freeze, openRevision } from '../../scripts/revisions.mjs';
import { host } from '../../scripts/server.mjs';
import { mix } from '../../scripts/audio.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidence = path.join(root, 'evidence/2026-11-04-harbor-v2');
const store = path.join(root, '.direction');
const snapshot = process.argv[2]
  ? await openRevision(store, process.argv[2])
  : await freeze(path.join(root, 'examples/harbor-v2'), store);
await fs.mkdir(path.join(store, 'play'), { recursive: true });
const dir = await fs.mkdtemp(path.join(store, 'play/check-'));
const audio = await mix(snapshot, dir, { log: path.join(dir, 'audio.log') });
const site = await host({ snapshot, audio: audio.file });
const client = await browser();
try {
  const page = await client.newPage({ viewport: { width: 1100, height: 800 } });
  await page.goto(site.url + '/?scale=0.5&muted=1');
  await page.waitForFunction(() => window.direction || window.failure);
  assert.equal(await page.evaluate(() => window.failure), undefined);
  const points = [0, 23, 24, 25, 100, 168, 264, 360, 503, 504, 505, 552, 575];
  const rendered = {};
  for (const frame of points) {
    rendered[frame] = await page.evaluate(f => {
      window.direction.seek(f);
      return document.querySelector('canvas').toDataURL();
    }, frame);
    if ([24, 168, 264, 360, 504, 575].includes(frame)) {
      await fs.writeFile(path.join(evidence, 'check-' + frame + '.png'), Buffer.from(rendered[frame].split(',')[1], 'base64'));
    }
  }
  for (const frame of [575, 24, 503, 0, 264, 504, 100, 168, 25]) {
    const repeated = await page.evaluate(f => {
      window.direction.seek(f);
      return document.querySelector('canvas').toDataURL();
    }, frame);
    assert.equal(repeated, rendered[frame], 'direct repeated frame ' + frame);
  }
  const playback = await page.evaluate(async () => {
    window.direction.seek(0);
    const observed = [];
    let last = -48;
    const record = event => {
      const frame = event.detail.frame;
      if (frame - last < 48) return;
      last = frame;
      observed.push({ frame, image: document.querySelector('canvas').toDataURL() });
    };
    window.addEventListener('directionframe', record);
    await window.direction.play();
    await new Promise((resolve, reject) => {
      const deadline = performance.now() + 40000;
      const timer = setInterval(() => {
        if (!window.direction.status().playing) {
          clearInterval(timer); resolve();
        } else if (performance.now() > deadline) {
          clearInterval(timer); reject(new Error('Live playback timeout'));
        }
      }, 30);
    });
    window.removeEventListener('directionframe', record);
    return observed;
  });
  assert.ok(playback.length >= 8, 'live samples across full work');
  assert.ok(playback.at(-1).frame >= 480, 'live playback reaches final section');
  for (const { frame, image } of playback) {
    const sought = await page.evaluate(f => {
      window.direction.seek(f);
      return document.querySelector('canvas').toDataURL();
    }, frame);
    assert.equal(sought, image, 'live/direct frame ' + frame);
  }
  const detail = await page.evaluate(async () => {
    const { prepare, routeAt } = await import('/project/harbor.mjs');
    const manifest = window.direction.manifest;
    const module = prepare({
      width: 1600, height: 900, pixelWidth: 800, pixelHeight: 450,
      fps: 24, frames: 576, point: name => manifest.points[name]
    });
    const first = module.evaluate({ frame: 24 });
    const last = module.evaluate({ frame: 504 });
    const trajectory = Array.from({ length: 576 }, (_, f) => routeAt(f / 24).toArray());
    return { first, last, trajectory };
  });
  // The hull needs 0.75 world units beyond its route center at these rocks and buoys.
  const obstacles = [
    { name: 'west rock', x: -1.5, z: 1, radius: 2.0 },
    { name: 'east rock', x: 7, z: 2.5, radius: 2.1 },
    { name: 'inner buoy', x: -.6, z: -3.3, radius: .4 }
  ];
  const clearances = obstacles.map(obstacle => {
    const distance = Math.min(...detail.trajectory.map(([x,,z]) => Math.hypot(x - obstacle.x, z - obstacle.z)));
    assert.ok(distance > obstacle.radius + .75, obstacle.name + ' hull clearance');
    return { obstacle: obstacle.name, centerDistance: distance, required: obstacle.radius + .75 };
  });
  const result = { revision: snapshot.revision, pass: true, repeatedFrames: 9, sampledFrames: points, playbackFrames: playback.map(p => p.frame),
    clearances, cues: { first: detail.first, last: detail.last }, directListening: 'unverified' };
  await fs.writeFile(path.join(evidence, 'work-check.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await client.close();
  await site.close();
}
