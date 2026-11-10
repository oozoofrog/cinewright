import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { browser } from '../scripts/execution.mjs';
import { mix } from '../scripts/audio.mjs';
import { freeze, readJSON, toolkit, writeJSON } from '../scripts/revisions.mjs';
import { host } from '../scripts/server.mjs';

const exec = promisify(execFile);
const runs = path.join(toolkit, '.direction/test-runs');
await fs.mkdir(runs, { recursive: true });
const store = await fs.mkdtemp(path.join(runs, 'stillcuts-integration-'));
process.env.TMPDIR = path.join(store, 'tmp');
await fs.mkdir(process.env.TMPDIR);
console.log(`Stillcuts integration records: ${store}`);
const project = path.join(store, 'copied-project');
await fs.mkdir(path.join(project, 'modules'), { recursive: true });
await fs.mkdir(path.join(project, 'assets'));
for (const helper of ['cuts.mjs', 'artwork.mjs']) {
  await fs.copyFile(path.join(toolkit, 'modules', helper), path.join(project, 'modules', helper));
}
await fs.writeFile(path.join(project, 'assets/atlas.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="16">
  <path fill="#ff0000" d="M0 0h8v16H0z"/><path fill="#00ff00" d="M16 0h8v16h-8z"/>
  <path fill="#0000ff" fill-opacity="0.5" d="M24 0h8v16h-8z"/></svg>`);
await fs.writeFile(path.join(project, 'assets/mask.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="108"><path fill="white" d="M0 0h26v108H0z"/></svg>');
await fs.writeFile(path.join(project, 'assets/legacy.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="108"><path fill="#ff00ff" d="M4 84h12v12H4z"/></svg>');
await fs.writeFile(path.join(project, 'scene.mjs'), `import { prepare as artwork } from './modules/artwork.mjs';
export async function prepare(api, config) {
  if (config.marker) return { draw(g, t) { g.fillStyle = '#ffffff'; g.fillRect(4 + t.frame * 2, 60, 2, 4); } };
  const art = await artwork(api, config);
  return { draw(g, t) { g.save(); g.translate(config.moving ? t.exposed % 4 * 2 : 0, 0); art.draw(g, t); g.restore(); } };
}`);
const source = {
  frames: 10,
  boundaries: [{ name: 'start', frame: 0 }, { name: 'change', frame: 4 },
    { name: 'gap', frame: 6 }, { name: 'resume', frame: 8 }, { name: 'end', frame: 10 }],
  artworks: {
    crop: { asset: 'assets/atlas.svg', crop: [16, 0, 16, 16], placement: { anchor: [24, 8], at: [24, 24], scale: 1 } },
    red: { asset: 'assets/atlas.svg', crop: [0, 0, 8, 16], placement: { anchor: [8, 8], at: [24, 24], scale: 1 } },
  },
  cuts: [{ name: 'held', from: 'start', to: 'change', artwork: 'crop', every: 2 },
    { name: 'red-hold', from: 'change', to: 'gap', artwork: 'red', every: 2 },
    { name: 'empty', from: 'gap', to: 'resume', empty: true },
    { name: 'return', from: 'resume', to: 'end', artwork: 'crop', every: 2 }],
};
await writeJSON(path.join(project, 'source.json'), source);
await fs.writeFile(path.join(project, 'generate.mjs'), `import fs from 'node:fs/promises';
import { compileCuts } from './modules/cuts.mjs';
const source = JSON.parse(await fs.readFile(new URL('./source.json', import.meta.url), 'utf8'));
const derived = compileCuts(source);
const work = { version: 1, title: 'Native stillcuts fixture', size: [192, 108], fps: 24, frames: source.frames,
  background: '#204060', points: derived.points, spans: derived.spans, layers: [
    { id: 'legacy', asset: 'assets/legacy.svg' },
    { id: 'pose', module: 'scene.mjs', exposure: derived.exposure, opacity: 0.5, mask: 'assets/mask.svg',
      config: { artworks: source.artworks, moving: true } },
    { id: 'blend', module: 'scene.mjs', opacity: 0.5, blend: 'screen', exposure: [{ from: 0, to: source.frames, value: 'red' }],
      config: { artworks: { red: { asset: 'assets/atlas.svg', crop: [0, 0, 8, 16], placement: { anchor: [0, 0], at: [64, 16], scale: 1 } } } } },
    { id: 'marker', module: 'scene.mjs', config: { marker: true } },
  ] };
await fs.writeFile(new URL('./work.json', import.meta.url), JSON.stringify(work, null, 2) + '\\n');
`);
await exec(process.execPath, [path.join(project, 'generate.mjs')]);
const before = await freeze(project, store);

async function live(t, client, snapshot) {
  const work = await fs.mkdtemp(path.join(store, 'play-'));
  const audio = await mix(snapshot, work, { log: path.join(work, 'audio.log') });
  const site = await host({ snapshot, audio: audio.file });
  t.after(site.close);
  const page = await client.newPage();
  t.after(() => page.close());
  await page.goto(`${site.url}/?scale=1&muted=1`);
  await page.waitForFunction(() => window.direction || window.failure);
  assert.equal(await page.evaluate(() => window.failure), undefined);
  return page;
}

function capture(page, frame) {
  return page.evaluate(f => {
    const state = window.direction.seek(f);
    const canvas = document.getElementById('picture');
    const g = canvas.getContext('2d');
    const pose = document.createElement('canvas');
    pose.width = 48; pose.height = 32;
    pose.getContext('2d').drawImage(canvas, 0, 8, 48, 32, 0, 0, 48, 32);
    const samples = [[15, 20], [16, 20], [24, 20], [26, 20], [66, 20], [6, 86], [4, 20]];
    return { state, image: canvas.toDataURL().split(',')[1], pose: pose.toDataURL(),
      pixels: samples.map(([x, y]) => [...g.getImageData(x, y, 1, 1).data]) };
  }, frame);
}

test('native pixels, frame order, CLI frames and copied frozen helpers preserve the stillcut contract', { timeout: 120000 }, async t => {
  const client = await browser();
  t.after(() => client.close());
  const page = await live(t, client, before);
  const indices = [0, 3, 4, 5, 6, 7, 8, 9];
  const direct = {};
  for (const frame of [...indices, 1, 2]) direct[frame] = await capture(page, frame);
  for (const order of [[...indices].reverse(), [7, 0, 9, 3, 8, 4, 6, 5]]) {
    for (const frame of order) assert.deepEqual(await capture(page, frame), direct[frame]);
  }
  assert.deepEqual(direct[0].pixels, [
    [32, 64, 96, 255], [16, 160, 48, 255], [24, 48, 136, 255],
    [32, 64, 96, 255], [144, 64, 96, 255], [255, 0, 255, 255], [32, 64, 96, 255],
  ], 'crop, original anchor, source alpha, mask, opacity, screen blend and legacy placement');
  assert.equal(direct[0].pose, direct[1].pose, 't.exposed holds artwork position');
  assert.notEqual(direct[0].image, direct[1].image, 't.frame continues moving the marker');
  assert.notEqual(direct[0].pose, direct[2].pose);
  assert.equal(direct[1].state.exposures.pose.frame, 0);
  assert.equal(direct[2].state.exposures.pose.frame, 2);
  assert.equal(direct[4].state.exposures.pose.value, 'red');
  for (const frame of [6, 7]) {
    assert.equal(direct[frame].state.exposures.pose, undefined);
    assert.deepEqual(direct[frame].pixels[1], [32, 64, 96, 255]);
  }
  assert.equal(direct[6].pose, direct[7].pose);
  assert.equal(direct[8].state.exposures.pose.value, 'crop');

  const playback = await page.evaluate(async () => {
    window.direction.seek(0);
    const presented = [];
    const observe = event => presented.push({ state: event.detail,
      image: document.getElementById('picture').toDataURL().split(',')[1] });
    window.addEventListener('directionframe', observe);
    await window.direction.play();
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { clearInterval(timer); reject(new Error('Copied fixture playback timeout')); }, 10000);
      const timer = setInterval(() => {
        if (window.direction.status().playing) return;
        clearTimeout(timeout); clearInterval(timer); resolve();
      }, 20);
    });
    window.removeEventListener('directionframe', observe);
    return { presented, final: window.direction.status().frame };
  });
  assert.equal(playback.final, 9);
  assert.ok(playback.presented.length >= 2);
  for (const item of playback.presented) {
    assert.deepEqual(item.state, direct[item.state.frame].state);
    assert.equal(item.image, direct[item.state.frame].image);
  }

  const cli = [];
  for (const frame of indices) {
    const args = [path.join(toolkit, 'scripts/direction.mjs'), 'frame', before.revision,
      frame === 4 ? 'change' : String(frame), '--store', store];
    const result = await exec(process.execPath, args);
    await fs.writeFile(path.join(store, `cli-${frame}.stdout`), result.stdout);
    await fs.writeFile(path.join(store, `cli-${frame}.stderr`), result.stderr);
    const job = JSON.parse(result.stdout);
    assert.equal(job.status, 'completed');
    assert.equal((await fs.readFile(job.output)).toString('base64'), direct[frame].image);
    // CLI state is JSON; omitted undefined exposure values retain the same meaning.
    assert.deepEqual(await readJSON(path.join(path.dirname(job.output), 'frame.json')),
      JSON.parse(JSON.stringify(direct[frame].state)));
    cli.push({ frame, id: job.id, output: job.output, equal: true });
  }
  const required = ['modules/cuts.mjs', 'modules/artwork.mjs', 'scene.mjs', 'generate.mjs',
    'source.json', 'work.json', 'assets/atlas.svg', 'assets/mask.svg', 'assets/legacy.svg'];
  for (const file of required) assert.ok(before.paths.has(`project/${file}`), file);
  for (const file of required.filter(file => file.endsWith('.mjs'))) {
    const code = await fs.readFile(path.join(project, file), 'utf8');
    assert.ok(!code.includes(toolkit), 'copied helpers must not embed the canonical path');
    const imports = [...code.matchAll(/(?:from\s+|import\s*\()(['"])(.*?)\1/g)].map(match => match[2]);
    assert.ok(imports.every(name => name.startsWith('./') || name.startsWith('node:')), `${file}: ${imports}`);
  }

  source.boundaries.find(boundary => boundary.name === 'change').frame = 5;
  await writeJSON(path.join(project, 'source.json'), source);
  const art = await fs.readFile(path.join(project, 'assets/atlas.svg'), 'utf8');
  await fs.writeFile(path.join(project, 'assets/atlas.svg'), art.replace('#00ff00', '#ffff00'));
  await exec(process.execPath, [path.join(project, 'generate.mjs')]);
  const after = await freeze(project, store);
  assert.notEqual(before.revision, after.revision);
  const changed = await live(t, client, after);
  const changedAt4 = await capture(changed, 4);
  assert.equal(changedAt4.state.exposures.pose.value, 'crop');
  assert.notEqual(changedAt4.image, direct[4].image);
  assert.notEqual((await capture(changed, 0)).image, direct[0].image);
  await fs.rename(project, `${project}-moved`);
  const reopened = await live(t, client, before);
  for (const frame of indices) assert.deepEqual(await capture(reopened, frame), direct[frame]);
  assert.deepEqual(await capture(changed, 4), changedAt4);
  for (const frame of indices) await fs.writeFile(path.join(store, `direct-${frame}.png`), Buffer.from(direct[frame].image, 'base64'));
  await writeJSON(path.join(store, 'receipt.json'), { before: before.revision, after: after.revision,
    indices, orders: ['forward', 'reverse', [7, 0, 9, 3, 8, 4, 6, 5]], cli, required,
    frozenAfterSourceMove: true, playback: { frames: playback.presented.map(item => item.state.frame), final: playback.final },
    pixels: direct[0].pixels, tmpdir: process.env.TMPDIR });
});

test('actual Canvas cover clipping preserves alpha, caller graphics state and current path', { timeout: 30000 }, async t => {
  const client = await browser();
  t.after(() => client.close());
  const page = await live(t, client, before);
  const result = await page.evaluate(async () => {
    const { prepare } = await import('/project/modules/artwork.mjs');
    const image = new Image();
    image.src = '/project/assets/atlas.svg';
    await image.decode();
    const api = { width: 192, height: 108, image: async () => image };
    const cover = await prepare(api, { artworks: { red: { asset: 'assets/atlas.svg', crop: [0, 0, 8, 16],
      placement: { fit: 'cover', box: [70, 10, 12, 8] } } } });
    const alpha = await prepare(api, { artworks: { atlas: { asset: 'assets/atlas.svg',
      placement: { anchor: [0, 0], at: [0, 70], scale: 1 } } } });
    const canvas = document.createElement('canvas'); canvas.width = 192; canvas.height = 108;
    const g = canvas.getContext('2d');
    alpha.draw(g, { value: 'atlas' });
    g.translate(3, 2);
    g.globalAlpha = 0.5; g.globalCompositeOperation = 'screen'; g.fillStyle = '#778899'; g.lineWidth = 3;
    const callerClip = new Path2D(); callerClip.rect(0, 0, 120, 100); g.clip(callerClip);
    g.beginPath(); g.rect(4, 40, 8, 8);
    const state = () => ({ transform: [...g.getTransform().toFloat64Array()], alpha: g.globalAlpha,
      blend: g.globalCompositeOperation, fill: g.fillStyle, filter: g.filter, lineWidth: g.lineWidth });
    const before = state();
    cover.draw(g, { value: 'red' });
    const after = state();
    g.fillStyle = '#00ff00'; g.fill();
    g.fillRect(90, 10, 4, 4); g.fillRect(130, 10, 4, 4);
    const locations = [[78, 14], [78, 8], [78, 22], [8, 44], [94, 14], [134, 14], [10, 74], [26, 74]];
    return { before, after, locations, pixels: locations.map(([x, y]) => [...g.getImageData(x, y, 1, 1).data]),
      png: canvas.toDataURL().split(',')[1] };
  });
  assert.deepEqual(result.after, result.before);
  assert.deepEqual(result.pixels, [
    [255, 0, 0, 128], [0, 0, 0, 0], [0, 0, 0, 0], [0, 255, 0, 128],
    [0, 255, 0, 128], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 255, 128],
  ]);
  await fs.writeFile(path.join(store, 'cover-alpha.png'), Buffer.from(result.png, 'base64'));
  delete result.png;
  await writeJSON(path.join(store, 'cover-alpha.json'), result);
});
