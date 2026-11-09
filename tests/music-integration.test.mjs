import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { run, ffmpeg, browser } from '../scripts/execution.mjs';
import { remuxSourceAudio } from '../scripts/music.mjs';
import { buildMusicBoxProject } from '../examples/music-box-dancer/build.mjs';
import { freeze, loadTool } from '../scripts/revisions.mjs';
import { screenFlashes, flashAccumulator } from '../scripts/flash.mjs';
import { host } from '../scripts/server.mjs';

const root = fileURLToPath(new URL('../.direction/music-integration/', import.meta.url));
await fs.mkdir(root, { recursive: true });
const scratch = await fs.mkdtemp(path.join(root, 'run-'));
const cli = fileURLToPath(new URL('../scripts/direction.mjs', import.meta.url));
const solid = value => Buffer.alloc(160 * 90 * 3, value);

test('flashAccumulator bounds scope and distinguishes holds, small accents and full-field reversal', () => {
  const held = flashAccumulator(24), flash = flashAccumulator(24), local = flashAccumulator(24), red = flashAccumulator(24);
  for (let i = 0; i < 48; i++) {
    held.push(solid(200));
    flash.push(solid(Math.floor(i / 3) % 2 ? 255 : 0));
    const frame = solid(200);
    frame.fill(i % 2 ? 0 : 255, 0, 1200);
    local.push(frame);
    const redFrame = solid(0);
    for (let p = 0; p < redFrame.length; p += 3) redFrame[p] = Math.floor(i / 3) % 2 ? 255 : 0;
    red.push(redFrame);
  }
  assert.equal(held.result().maxTransitionsInOneSecond, 0);
  assert.equal(local.result().flaggedWindows, 0);
  assert.ok(flash.result().flaggedWindows > 0);
  assert.ok(red.result().flaggedWindows > 0);
  assert.ok(flash.result().examples.length <= 20);
  assert.throws(() => flashAccumulator(NaN), /fps/);
  assert.throws(() => held.push(Buffer.alloc(1)), /frame size/);
});

test('flashAccumulator counts counterphase panels without doubling simultaneous transitions', () => {
  for (const redOnly of [false, true]) {
    const screen = flashAccumulator(24);
    for (let i = 0; i < 48; i++) {
      const frame = solid(0);
      const phase = Math.floor(i / 3) % 2;
      for (let p = 0; p < frame.length; p += 3) {
        if ((p / 3 % 160 < 80) === Boolean(phase)) {
          // Dark red stays below the luminance thresholds, isolating red risk.
          frame[p] = redOnly ? 180 : 255;
          if (!redOnly) frame[p + 1] = frame[p + 2] = 255;
        }
      }
      screen.push(frame);
      // Each exchange qualifies in both directions, but is only one instant.
      if (i === 3) assert.equal(screen.result().maxTransitionsInOneSecond, 1);
    }
    assert.equal(screen.result().maxTransitionsInOneSecond, 8);
    assert.ok(screen.result().flaggedWindows > 0);
  }
  const mixed = flashAccumulator(24), panels = solid(0);
  panels.fill(255, 0, panels.length / 2);
  mixed.push(panels);
  mixed.push(panels.map(value => 255 - value));
  mixed.push(solid(255));
  mixed.push(solid(0));
  assert.equal(mixed.result().maxTransitionsInOneSecond, 3);
  assert.equal(mixed.result().flaggedWindows, 0);
});

test('music CLI uses real services, canonical energy arrays, frozen scene, full-end render and original AAC', { timeout: 90000 }, async t => {
  // Signal-generated AAC fixture only; the actual user recording is separately
  // validated under the private production root, never in the repository.
  const input = path.join(scratch, 'fixture.m4a');
  await run(ffmpeg, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100:duration=1.03', '-ac', '2', '-c:a', 'aac', input]);
  const project = path.join(scratch, 'project'), store = path.join(scratch, 'store');
  const initialized = JSON.parse((await run(process.execPath, [cli, 'music', 'init', project, input], { capture: true })).toString());
  assert.equal(initialized.work.fps, 24);
  const source = JSON.parse(await fs.readFile(path.join(project, 'music/source.json')));
  const canonical = await fs.readFile(path.join(project, 'music/derived.json'));
  const derived = JSON.parse(canonical);
  assert.ok(Array.isArray(derived.tracks.energy));
  assert.equal(source.frames, Math.ceil(source.decoded.frames * 24 / 48000));
  assert.deepEqual(initialized.work.audio, [source.audio]);
  assert.equal(initialized.work.frames, source.frames);
  await buildMusicBoxProject({ project, source, derived });
  assert.deepEqual(await fs.readFile(path.join(project, 'music/derived.json')), canonical);
  await assert.rejects(buildMusicBoxProject({ project, source: { ...source, decoded: { ...source.decoded, frames: source.decoded.frames - 1 } }, derived }), /entire decoded/);
  const { prepare } = await import(pathToFileURL(path.join(project, 'scene.mjs')));
  const scene = await prepare({ width: 320, height: 180, frames: derived.frames, fps: 24, json: async () => derived, image: async () => ({ naturalWidth: 1920, naturalHeight: 1080 }) });
  assert.equal(scene.evaluate({ frame: 0 }).energy, derived.tracks.energy[0][1]);
  // Dense attacks must still permit actual release/anticipation pose families.
  const dense = { ...derived, frames: 240, events: { onsets: Array.from({ length: 120 }, (_, i) => ({ frame: i * 2, seconds: i / 12, strength: 1 })) } };
  const denseScene = await prepare({ width: 320, height: 180, frames: 240, fps: 24, json: async () => dense, image: async () => ({ naturalWidth: 1920, naturalHeight: 1080 }) });
  const poses = new Set(Array.from({ length: 240 }, (_, frame) => denseScene.evaluate({ frame }).pose.pose));
  assert.ok(poses.has('release'));
  assert.ok(poses.has('anticipate'));
  const snapshot = await freeze(project, store);
  await fs.rm(path.join(project, 'scene.mjs'));
  await fs.rm(path.join(project, 'modules'), { recursive: true });
  const frozen = await loadTool(snapshot, 'jobs.mjs');
  const job = await frozen.render(snapshot, store, { scale: .125 });
  assert.equal(job.status, 'completed', job.error);
  assert.equal(job.frames, source.frames);
  assert.deepEqual(job.audio.sources[0].used, [0, source.decoded.frames]);
  const remuxed = await remuxSourceAudio({ project, video: job.output, output: path.join(scratch, 'original-aac.mp4') });
  assert.equal(remuxed.bitPreserved, true);
  assert.equal(remuxed.native.frames, source.native.frames);
  const screening = await screenFlashes({ file: remuxed.output, report: path.join(scratch, 'screen.json') });
  assert.equal(screening.frames, source.frames);
  assert.equal(screening.status, 'screen-negative');
  const flashCLI = JSON.parse((await run(process.execPath, [cli, 'flash', job.id, '--store', store], { capture: true })).toString());
  assert.equal(flashCLI.status, 'screen-negative');
  const help = (await run(process.execPath, [cli, '--help'], { capture: true })).toString();
  assert.match(help, /music init PROJECT FILE/);
  assert.match(help, /NOT safety\/WCAG certification/);
  await assert.rejects(run(process.execPath, [cli, 'music', 'init', project, input], { capture: true }), /unused project/);
  // Show the frozen module remains independent with no direct toolkit imports.
  const client = await browser(); t.after(() => client.close());
  const site = await host({ snapshot }); t.after(site.close);
  const page = await client.newPage();
  const external = [];
  page.on('request', req => { if (!req.url().startsWith(site.url)) external.push(req.url()); });
  await page.goto(site.url + '/?muted=1&scale=0.125');
  await page.waitForFunction(() => window.direction || window.failure);
  assert.equal(await page.evaluate(() => window.failure), undefined);
  assert.deepEqual(external, []);
  await page.close();
});

test('streaming screen detects encoded full-field flashing and retains no false safe claim', { timeout: 30000 }, async () => {
  const input = path.join(scratch, 'flash.mp4');
  await run(ffmpeg, ['-v', 'error', '-f', 'lavfi', '-i', "nullsrc=s=160x90:r=24:d=2,geq=lum='if(mod(floor(N/3),2),235,16)':cb=128:cr=128", '-c:v', 'libx264', '-pix_fmt', 'yuv420p', input]);
  const report = await screenFlashes({ file: input });
  assert.equal(report.frames, 48);
  assert.equal(report.status, 'risk-detected');
  assert.match(report.limitations[0], /Not WCAG/);
  await assert.rejects(screenFlashes({ file: path.join(scratch, 'missing.mp4') }), /exited/);
  const controller = new AbortController(); controller.abort(new Error('test cancellation'));
  await assert.rejects(screenFlashes({ file: input, signal: controller.signal }), /test cancellation/);
});

test('screenFlashes detects encoded half-screen counterphase exchanges', { timeout: 30000 }, async () => {
  const input = path.join(scratch, 'counterphase.mp4');
  await run(ffmpeg, ['-v', 'error', '-f', 'lavfi', '-i', "nullsrc=s=160x90:r=24:d=2,geq=lum='if(eq(lt(X,W/2),mod(floor(N/3),2)),235,16)':cb=128:cr=128", '-c:v', 'libx264', '-pix_fmt', 'yuv420p', input]);
  const report = await screenFlashes({ file: input });
  assert.equal(report.frames, 48);
  assert.equal(report.maxTransitionsInOneSecond, 8);
  assert.equal(report.status, 'risk-detected');
});

test('plugin skill entrypoint stays rooted and music guidance does not widen sync claims', async () => {
  const toolkit = fileURLToPath(new URL('../', import.meta.url));
  const mirrored = await fs.readFile(path.join(toolkit, 'skills/cinewright/SKILL.md'), 'utf8');
  const skill = await fs.readFile(path.join(toolkit, 'SKILL.md'), 'utf8');
  assert.match(mirrored, /\.\.\/\.\.\/SKILL.md/);
  assert.match(skill, /references\/music.md/);
  for (const file of ['plugin.json', '.claude-plugin/plugin.json', '.agents/plugins/marketplace.json']) JSON.parse(await fs.readFile(path.join(toolkit, file)));
});

test('asynchronous browser module failures prevent publication and retain the job log', { timeout: 30000 }, async () => {
  const project = path.join(scratch, 'page-error'), store = path.join(scratch, 'page-error-store');
  await fs.mkdir(project);
  await fs.writeFile(path.join(project, 'scene.mjs'), `export function prepare() {
    queueMicrotask(() => { throw new Error('unhandled module failure'); });
    return { draw(g) { g.fillRect(0,0,16,16); } };
  }`);
  await fs.writeFile(path.join(project, 'work.json'), JSON.stringify({ version:1, title:'error regression', size:[32,32], fps:24, frames:2, layers:[{id:'scene',module:'scene.mjs'}] }));
  const snapshot = await freeze(project, store), frozen = await loadTool(snapshot, 'jobs.mjs');
  const job = await frozen.render(snapshot, store, { mode:'frame', from:0, to:1 });
  assert.equal(job.status, 'failed');
  assert.equal(job.output, undefined);
  assert.match(job.error, /Browser page error.*unhandled module failure/);
  assert.match(await fs.readFile(job.log, 'utf8'), /unhandled module failure/);
});
