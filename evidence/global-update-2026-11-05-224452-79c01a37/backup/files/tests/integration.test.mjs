import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { browser } from '../scripts/execution.mjs';
import { mix } from '../scripts/audio.mjs';
import { freeze, readJSON, toolkit, writeJSON } from '../scripts/revisions.mjs';
import { host } from '../scripts/server.mjs';

const exec = promisify(execFile);
const cli = path.join(toolkit, 'scripts/direction.mjs');
const root = path.join(toolkit, '.direction/test-runs');
await fs.mkdir(root, { recursive: true });
const store = await fs.mkdtemp(path.join(root, 'integration-'));
console.log(`Integration records: ${store}`);

async function command(args, { env = process.env, expected = 0 } = {}) {
  try {
    const r = await exec(process.execPath, [cli, ...args, '--store', store], { env });
    assert.equal(expected, 0);
    return JSON.parse(r.stdout);
  } catch (error) {
    assert.equal(error.code, expected, error.stderr ?? String(error));
    return JSON.parse(error.stdout);
  }
}

async function live(t, client, snapshot, scale = 0.5) {
  const work = await fs.mkdtemp(path.join(store, 'play-'));
  const audio = await mix(snapshot, work, { log: path.join(work, 'audio.log') });
  const site = await host({ snapshot, audio: audio.file });
  t.after(site.close);
  const page = await client.newPage();
  t.after(() => page.close());
  await page.goto(`${site.url}/?scale=${scale}&muted=1`);
  await page.waitForFunction(() => window.direction || window.failure);
  assert.equal(await page.evaluate(() => window.failure), undefined);
  return page;
}
function capture(page, frame) {
  return page.evaluate(f => ({
    state: window.direction.seek(f), image: document.getElementById('picture').toDataURL().split(',')[1],
  }), frame);
}

test('continuous playback, direct seek, authored substitutions and offline frame use the same state and pixels', { timeout: 40000 }, async t => {
  const project = path.join(store, 'new-expression');
  await fs.mkdir(project);
  const module = `export function prepare() { return { draw(g, t) {
    g.fillStyle = t.value;
    g.fillRect(t.exposed * 4, 18, 30, 30);
  } }; }`;
  await fs.writeFile(path.join(project, 'paint.mjs'), module);
  const work = {
    version: 1, title: 'Expression integration', size: [192, 108], fps: 6, frames: 24, points: { hard: 8 },
    spans: { arbitrary: [3, 11], loop: [4, 8] }, layers: [{
      id: 'paint', module: 'paint.mjs', exposure: [{ from: 0, to: 8, every: 4, value: '#ffbb66' },
        { from: 8, to: 15, every: 1, value: '#aa44ff' }, { from: 17, to: 24, value: '#22ccaa' }],
    }],
  };
  await writeJSON(path.join(project, 'work.json'), work);
  const snapshot = await freeze(project, store);
  const client = await browser();
  t.after(() => client.close());
  const page = await live(t, client, snapshot, 1);
  const playback = await page.evaluate(async () => {
    const canvas = document.getElementById('picture');
    const observed = {};
    function onFrame(event) {
      observed[event.detail.frame] = { state: event.detail, image: canvas.toDataURL().split(',')[1] };
    }
    window.addEventListener('directionframe', onFrame);
    await window.direction.play();
    await new Promise(resolve => {
      const timer = setInterval(() => {
        if (window.direction.status().playing) return;
        clearInterval(timer);
        resolve();
      }, 20);
    });
    window.removeEventListener('directionframe', onFrame);
    return observed;
  });
  const presented = Object.keys(playback).map(Number);
  // A real-time clock may drop display frames. All presented frames must match direct evaluation.
  assert.ok(presented.length >= 6 && presented.at(-1) >= 21, JSON.stringify(presented));
  for (const f of presented) assert.deepEqual(await capture(page, f), playback[f]);
  const indices = [14, 3, 8, 7, 9, 17, 15, 16, 4, 5, 6];
  const direct = {};
  for (const f of indices) {
    direct[f] = await capture(page, f);
    if (playback[f]) assert.deepEqual(direct[f], playback[f]);
  }
  assert.equal(direct[4].image, direct[5].image);
  assert.equal(direct[5].image, direct[6].image);
  assert.notEqual(direct[7].image, direct[8].image);
  assert.notEqual(direct[8].image, direct[9].image);
  assert.equal(direct[15].image, direct[16].image);
  assert.notEqual(direct[14].image, direct[15].image);
  assert.notEqual(direct[16].image, direct[17].image);
  assert.equal(direct[3].state.exposures.paint.frame, 0);
  assert.equal(direct[8].state.exposures.paint.value, '#aa44ff');
  await page.locator('#loop').selectOption('loop');
  await page.locator('#play').click();
  await delay(1400);
  const loop = await page.evaluate(() => window.direction.status());
  assert.equal(loop.playing, true);
  assert.ok(loop.frame >= 4 && loop.frame < 8, JSON.stringify(loop));
  await page.locator('#play').click();
  assert.equal(await page.evaluate(() => window.direction.status().playing), false);
  await page.locator('#jump').selectOption('8');
  assert.equal(await page.evaluate(() => window.direction.status().frame), 8);

  const output = await command(['frame', snapshot.revision, 'hard']);
  assert.equal((await fs.readFile(output.output)).toString('base64'), direct[8].image);
  assert.deepEqual(await readJSON(path.join(path.dirname(output.output), 'frame.json')), direct[8].state);
  delete work.spans;
  await writeJSON(path.join(project, 'work.json'), work);
  const noSpans = await live(t, client, await freeze(project, store), 1);
  assert.deepEqual(await capture(noSpans, 3), direct[3]);
});

test('changing a steering input invalidates revision and drives 3D and both consumers across a cut', { timeout: 40000 }, async t => {
  const project = path.join(store, 'variation');
  await fs.cp(path.join(toolkit, 'examples/harbor-landfall'), project, { recursive: true });
  const before = await freeze(project, store);
  const work = before.manifest;
  const turn = work.points['turn-two'];
  const ret = work.points.return;
  work.channels.steering.data.keys.at(-1)[1] = -0.56;
  await writeJSON(path.join(project, 'work.json'), work);
  const changed = await freeze(project, store);
  assert.notEqual(before.revision, changed.revision);
  const client = await browser();
  t.after(() => client.close());
  const first = await live(t, client, before);
  const second = await live(t, client, changed);
  const a = await capture(first, ret - 1);
  const b = await capture(second, ret - 1);
  assert.notDeepEqual(a.state.values.projection, b.state.values.projection);
  assert.notEqual(a.image, b.image);
  const oldRoute = await capture(first, ret + 48);
  const newRoute = await capture(second, ret + 48);
  assert.notDeepEqual(oldRoute.state.values.route, newRoute.state.values.route);
  assert.notEqual(oldRoute.image, newRoute.image);
  assert.deepEqual((await capture(first, ret)).state.values.projection, a.state.values.projection);
  assert.deepEqual((await capture(second, ret)).state.values.projection, b.state.values.projection);
  assert.deepEqual((await capture(first, turn - 10)).state.values, (await capture(second, turn - 10)).state.values);
  assert.deepEqual(await capture(first, ret + 48), oldRoute);
  const high = await live(t, client, before, 1);
  assert.deepEqual((await capture(high, ret + 48)).state, oldRoute.state);
  assert.deepEqual((await capture(high, ret - 1)).state, a.state);
});

test('missing assets and tool failure cannot publish; cancellation retains partial frames and retries into a new job',
  { timeout: 60000 }, async () => {
    const project = path.join(store, 'integrity');
    await command(['init', project, '--frames', '48']);
    const work = await readJSON(path.join(project, 'work.json'));
    work.layers.unshift({ id: 'missing', asset: 'missing.png' });
    await writeJSON(path.join(project, 'work.json'), work);
    const bad = await command(['frame', project, '0', '--scale', '0.25'], { expected: 1 });
    assert.equal(bad.status, 'failed');
    assert.match(bad.error, /Image decode failed: missing.png/);
    assert.equal(bad.output, undefined);
    const badRetry = await command(['retry', bad.id], { expected: 1 });
    assert.equal(badRetry.revision, bad.revision);
    assert.equal(badRetry.retryOf, bad.id);

    work.layers.shift();
    await writeJSON(path.join(project, 'work.json'), work);
    const frozen = await freeze(project, store);
    const tool = await command(['render', frozen.revision, '--to', '6', '--scale', '0.25'], {
      env: { ...process.env, DIRECTION_FFMPEG: '/unavailable/direction-ffmpeg' }, expected: 1,
    });
    assert.match(tool.error, /ENOENT/);
    const success = await command(['retry', tool.id]);
    assert.equal(success.status, 'completed');
    assert.equal(success.revision, tool.revision);
    assert.deepEqual(success.settings, tool.settings);
    assert.equal((await readJSON(path.join(store, 'jobs', tool.id, 'job.json'))).status, 'failed');

    const child = spawn(process.execPath, [cli, 'render', frozen.revision, '--store', store], { stdio: ['ignore', 'pipe', 'pipe'] });
    const end = new Promise(resolve => child.once('close', resolve));
    let stderr = '';
    let stdout = '';
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.stdout.on('data', chunk => { stdout += chunk; });
    let id;
    for (let i = 0; i < 500; i++) {
      id = stderr.match(/Job ([0-9a-f-]{36})/)?.[1];
      if (id) {
        const frames = path.join(store, 'jobs', id, 'frames');
        if ((await fs.readdir(frames)).length >= 2) break;
      }
      await delay(15);
    }
    child.kill('SIGINT');
    assert.equal(await end, 130, stderr);
    const cancelled = JSON.parse(stdout);
    assert.equal(cancelled.status, 'cancelled');
    assert.equal(cancelled.output, undefined);
    const cancelledDir = path.join(store, 'jobs', cancelled.id);
    assert.ok((await fs.readdir(path.join(cancelledDir, 'frames'))).length >= 2);
    await assert.rejects(fs.access(path.join(cancelledDir, 'work.mp4')));
    const full = await command(['retry', cancelled.id]);
    assert.equal(full.status, 'completed');
    assert.equal(full.retryOf, cancelled.id);
    assert.equal(full.frames, 48);
    assert.ok((await fs.stat(full.output)).size > 1000);
  });

test('precomputed exchange data is loaded and evaluated out of order', { timeout: 30000 }, async t => {
  const project = path.join(store, 'baked-project');
  await fs.mkdir(project);
  await writeJSON(path.join(project, 'measured.json'), { from: 1, values: [[12, 6], [30, 9], [54, 28]] });
  await fs.writeFile(path.join(project, 'baked.mjs'), `export function prepare() {
    return {
      evaluate(t) { return t.read('position', 'canvas'); },
      draw(g, t, [x, y]) { g.fillStyle = '#fff'; g.fillRect(x, y, 5, 5); },
    };
  }`);
  await writeJSON(path.join(project, 'work.json'), {
    version: 1, title: 'Baked sample', size: [192, 108], fps: 24, frames: 5,
    channels: { position: { producer: '$data', consumers: ['marks'], kind: 'vec2', space: 'canvas',
      from: 1, to: 4, data: { file: 'measured.json' } } },
    layers: [{ id: 'marks', module: 'baked.mjs', in: 1, out: 4 }],
  });
  const client = await browser();
  t.after(() => client.close());
  const page = await live(t, client, await freeze(project, store), 1);
  const captures = [];
  for (const frame of [3, 0, 1, 2, 3, 4]) captures.push(await capture(page, frame));
  assert.deepEqual(captures.map(x => x.state.values.position ?? null), [[54, 28], null, [12, 6], [30, 9], [54, 28], null]);
  assert.deepEqual(captures[0], captures[4]);
  assert.notEqual(captures[0].image, captures[2].image);
});
