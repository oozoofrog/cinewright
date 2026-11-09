import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { ingestMusic, analyzeMusic, deriveMusic, remuxSourceAudio } from '../scripts/music.mjs';
import { run, ffmpeg, browser } from '../scripts/execution.mjs';
import { freeze } from '../scripts/revisions.mjs';
import { host } from '../scripts/server.mjs';
import { mix } from '../scripts/audio.mjs';
import { validate, sample } from '../runtime/timeline.mjs';
import { sampleMusic, musicEvents, musicEnvelope } from '../modules/music.mjs';

const root = fileURLToPath(new URL('../.direction/music-tests/', import.meta.url));
await fs.mkdir(root, { recursive: true });
const scratch = await fs.mkdtemp(path.join(root, 'run-'));
console.log(`Music test records: ${scratch}`);
const json = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const write = (file, value) => fs.writeFile(file, JSON.stringify(value));
const hash = async file => createHash('sha256').update(await fs.readFile(file)).digest('hex');

// Synthetic audio fixtures are created privately at test time; no user media.
async function fixture(name, { seconds = 4.013, silent = false, aac = true } = {}) {
  const wav = path.join(scratch, `${name}.wav`), rate = 44100, frames = Math.round(seconds * rate);
  const buffer = Buffer.alloc(44 + frames * 4);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 4, 28); buffer.writeUInt16LE(4, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(frames * 4, 40);
  for (let i = 0; i < frames; i++) {
    const time = i / rate, since = (time + 0.25) % 0.5;
    const envelope = since < 0.1 ? Math.exp(-since * 45) : 0;
    const value = silent ? 0 : Math.round(17000 * envelope * (0.7 * Math.sin(time * Math.PI * 2 * 440) + 0.3 * Math.sin(time * Math.PI * 2 * 1800)));
    buffer.writeInt16LE(value, 44 + i * 4); buffer.writeInt16LE(-value, 46 + i * 4);
  }
  await fs.writeFile(wav, buffer);
  if (!aac) return wav;
  const mp4 = path.join(scratch, `${name}.mp4`);
  await run(ffmpeg, ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=32x32:r=24', '-i', wav, '-t', String(seconds), '-c:v', 'libx264', '-c:a', 'aac', '-b:a', '160k', mp4]);
  return mp4;
}
async function project(name) {
  const directory = path.join(scratch, name);
  await fs.mkdir(directory);
  return directory;
}
async function videoFor(project, source, name = 'visual.mp4', frames = source.frames) {
  const output = path.join(project, name);
  await run(ffmpeg, ['-v', 'error', '-f', 'lavfi', '-i', `color=c=navy:s=32x32:r=${source.fps}`, '-frames:v', String(frames), '-c:v', 'libx264', output]);
  return output;
}

let sourceFile, source, directory, analysis;
test('ingest real MP4 audio into sample-domain mixer and preserve original AAC/native identity', async () => {
  sourceFile = await fixture('impulses');
  const before = await hash(sourceFile);
  directory = await project('ingest');
  source = await ingestMusic({ project: directory, file: sourceFile });
  assert.equal(source.input.sha256, before);
  assert.equal(await hash(sourceFile), before);
  assert.equal(source.version, 1);
  assert.equal(source.decoded.rate, 48000);
  assert.equal(source.decoded.channels, 2);
  assert.equal(source.duration, source.decoded.frames / 48000);
  assert.equal(source.frames, Math.ceil(source.duration * 24));
  assert.ok(source.frames / 24 >= source.duration);
  assert.ok(source.frames / 24 - source.duration < 1 / 24);
  assert.equal(source.audio.sourceOut, source.decoded.frames);
  assert.equal(source.native.rate, 44100);
  assert.equal(source.passthrough.eligible, true);
  assert.equal(source.passthrough.native.sha256, source.native.sha256);
  assert.equal((await fs.readdir(path.join(directory, path.dirname(source.audio.asset)))).some(file => file.endsWith('.s16')), false);
  assert.deepEqual(await json(path.join(directory, 'music/source.json')), source);
  await assert.rejects(ingestMusic({ project: directory, file: sourceFile }), /already exists/);
  const mixed = await fs.mkdtemp(path.join(scratch, 'mix-'));
  const asset = `project/${source.audio.asset}`;
  const freeze = path.join(mixed, 'project', path.dirname(source.audio.asset));
  await fs.mkdir(freeze, { recursive: true });
  await fs.copyFile(path.join(directory, source.audio.asset), path.join(mixed, 'project', source.audio.asset));
  const result = await mix({ manifest: { fps: 24, frames: source.frames, audio: [source.audio] }, paths: new Set([asset]), root: mixed }, mixed);
  assert.equal(result.sources[0].decoded, source.decoded.frames);
  assert.deepEqual(result.sources[0].used, [0, source.decoded.frames]);
});

test('PCM onset/normalized band analysis and local beat diagnostics are based on audio, including stereo antiphase', async () => {
  analysis = await analyzeMusic({ project: directory });
  assert.equal(analysis.decodedFrames, source.decoded.frames);
  assert.equal(analysis.hopFrames, 480);
  assert.ok(analysis.events.onsets.length >= 6, JSON.stringify(analysis.diagnostics));
  assert.ok(analysis.events.onsets.some(event => Math.abs(event.seconds - 0.25) < 0.04));
  assert.ok(analysis.events.beats.length > 0);
  assert.ok(analysis.diagnostics.beatWindows[0].candidates.some(candidate => Math.abs(candidate.bpm - 120) < 5));
  assert.equal(analysis.diagnostics.status, 'tentative');
  assert.ok(analysis.diagnostics.limitations.length);
  for (const keys of Object.values(analysis.tracks)) {
    assert.ok(keys.length > 300);
    assert.ok(keys.every(([seconds, value]) => seconds >= 0 && seconds < source.duration && value >= 0 && value <= 1));
    assert.ok(keys.some(([, value]) => value > 0));
  }
  assert.deepEqual(await json(path.join(directory, 'music/analysis.json')), analysis);
  await assert.rejects(analyzeMusic({ project: directory, options: { minBpm: 200, maxBpm: 60 } }), /Invalid analysis/);
  await assert.rejects(analyzeMusic({ project: directory, options: { accidental: true } }), /Unknown analysis/);
});

test('derive keeps analysis immutable; boundaries, collisions, manual corrections and typed channels are explicit', async () => {
  const originalAnalysis = await hash(path.join(directory, 'music/analysis.json'));
  const fps = 24, frames = source.frames;
  const overrides = { beats: [{ seconds: source.duration - 0.00001 }, { seconds: 0.01, strength: 0.4 }, { seconds: 0 }],
    onsets: [], sections: [{ name: 'intro', from: 0, to: 12 }, { name: 'music.rest', from: 12, to: frames }] };
  const derived = await deriveMusic({ project: directory, overrides });
  assert.equal(await hash(path.join(directory, 'music/analysis.json')), originalAnalysis);
  assert.deepEqual(derived.events.beats.map(event => event.frame), [0, 0, frames - 1]);
  assert.equal(derived.events.beats[1].seconds, 0.01);
  assert.equal(derived.events.beats[1].quantizationErrorSeconds, -0.01);
  assert.equal(derived.events.beats[0].provenance, 'manual override');
  assert.deepEqual(derived.events.onsets, []);
  assert.deepEqual(derived.overrides, overrides);
  assert.deepEqual(derived.manifest.spans['music.intro'], [0, 12]);
  assert.deepEqual(derived.manifest.channels['music.energy'].consumers, ['scene']);
  assert.equal(derived.manifest.channels['music.energy'].space, 'music');
  for (const keys of Object.values(derived.tracks)) {
    assert.equal(keys[0][0], 0); assert.equal(keys.at(-1)[0], frames - 1);
    assert.ok(keys.every(([frame], i) => !i || frame > keys[i - 1][0]));
  }
  validate({ version: 1, title: 'Music seam', size: [32, 32], fps, frames, audio: [source.audio],
    layers: [{ id: 'scene', module: 'scene.mjs' }], ...derived.manifest });
  const collision = await deriveMusic({ project: directory, fps: 1, overrides: { sections: [], beats: [], onsets: [] } });
  assert.deepEqual(collision.sections, []);
  assert.equal(collision.frames, Math.ceil(source.duration));
  const defaultDerived = await deriveMusic({ project: directory });
  assert.deepEqual(defaultDerived.manifest.spans['music.full'], [0, frames]);
  assert.ok(defaultDerived.events.onsets.length);
  for (const bad of [{ beats: [{ seconds: source.duration }] }, { beats: [{ seconds: -1 }] }, { beats: [{ seconds: 0, strength: 2 }] },
    { sections: [{ name: 'bad', from: 0, to: frames + 1 }] }, { sections: [{ name: 'bad', from: 1, to: 1 }] },
    { sections: [{ name: 'same', from: 0, to: 1 }, { name: 'music.same', from: 1, to: 2 }] }, { beats: null }, { sections: null }, { consumers: ['$data'] }, { typo: [] }]) {
    await assert.rejects(deriveMusic({ project: directory, overrides: bad }));
  }
});

test('silence and short material require manual fallback; non-AAC source cannot claim passthrough', async () => {
  const file = await fixture('silence', { silent: true, seconds: 0.013, aac: false });
  const projectPath = await project('silence-project');
  const silent = await ingestMusic({ project: projectPath, file });
  assert.equal(silent.frames, 1);
  assert.equal(silent.passthrough.eligible, false);
  const measured = await analyzeMusic({ project: projectPath });
  assert.equal(measured.diagnostics.silent, true);
  assert.equal(measured.diagnostics.status, 'manual-required');
  assert.deepEqual(measured.events, { onsets: [], beats: [] });
  const derived = await deriveMusic({ project: projectPath, overrides: { beats: [{ seconds: 0 }], sections: [{ name: 'hold', from: 0, to: 1 }] } });
  assert.deepEqual(derived.tracks.energy, [[0, 0]]);
  assert.equal(derived.events.beats[0].frame, 0);
  await assert.rejects(remuxSourceAudio({ project: projectPath, video: file, output: path.join(projectPath, 'out.mp4') }), /Ineligible/);
});

test('nonzero source start is explicitly ineligible and missing-audio inputs never publish source metadata', async () => {
  const shiftedFile = path.join(scratch, 'shifted.m4a');
  await run(ffmpeg, ['-v', 'error', '-itsoffset', '0.25', '-i', sourceFile, '-map', '0:a:0', '-c:a', 'copy', shiftedFile]);
  const shiftedProject = await project('shifted-project');
  const shifted = await ingestMusic({ project: shiftedProject, file: shiftedFile });
  assert.ok(Number(shifted.input.stream.start_time) > 0);
  assert.equal(shifted.passthrough.eligible, false);
  assert.match(shifted.audio.provenance.timeOrigin, /First decoded audio sample/);
  const noAudioProject = await project('no-audio-project');
  const noAudio = await videoFor(noAudioProject, source);
  await assert.rejects(ingestMusic({ project: noAudioProject, file: noAudio }), /no audio stream/);
  await assert.rejects(fs.access(path.join(noAudioProject, 'music/source.json')), /ENOENT/);
});

test('AAC remux proves packet and decoded identity, preserves end, refuses trim/gain/offset/multiple clips or overwrite', async () => {
  const visual = await videoFor(directory, source);
  const output = path.join(directory, 'final.mp4');
  const work = { fps: 24, frames: source.frames, audio: [source.audio] };
  await write(path.join(directory, 'work.json'), work);
  const result = await remuxSourceAudio({ video: visual, project: directory, output });
  assert.equal(result.bitPreserved, true);
  assert.equal(result.packetSha256, source.passthrough.packetSha256);
  assert.deepEqual(result.native, source.native);
  assert.equal(result.audioStart, 0);
  assert.ok(Math.abs(result.videoDuration - source.frames / 24) < 0.001);
  const before = await hash(output);
  await assert.rejects(remuxSourceAudio({ video: visual, project: directory, output }), /EEXIST/);
  assert.equal(await hash(output), before);
  const short = await videoFor(directory, source, 'short.mp4', source.frames - 2);
  await assert.rejects(remuxSourceAudio({ video: short, project: directory, output: path.join(directory, 'too-short.mp4') }), /full-length video/);
  for (const mutation of [{ gain: 0.5 }, { sourceIn: 1 }, { sourceOut: source.audio.sourceOut - 1 }, { at: 1 }]) {
    await write(path.join(directory, 'work.json'), { ...work, audio: [{ ...source.audio, ...mutation }] });
    await assert.rejects(remuxSourceAudio({ video: visual, project: directory, output: path.join(directory, 'bad.mp4') }), /rejects edited/);
  }
  await write(path.join(directory, 'work.json'), { ...work, audio: [source.audio, source.audio] });
  await assert.rejects(remuxSourceAudio({ video: visual, project: directory, output: path.join(directory, 'bad.mp4') }), /rejects edited/);
  await write(path.join(directory, 'work.json'), { ...work, frames: source.frames - 1 });
  await assert.rejects(remuxSourceAudio({ video: visual, project: directory, output: path.join(directory, 'bad.mp4') }), /rejects edited/);
  await write(path.join(directory, 'work.json'), work);
});

test('source identity tampering and cancellation reject instead of producing misleading derivatives', async () => {
  const sourceJSON = path.join(directory, 'music/source.json');
  await write(sourceJSON, { ...source, input: { ...source.input, sha256: 'wrong' } });
  await assert.rejects(deriveMusic({ project: directory }), /identity mismatch/);
  await write(sourceJSON, source);
  const pcm = path.join(directory, source.audio.asset), handle = await fs.open(pcm, 'r+');
  const byte = Buffer.alloc(1); await handle.read(byte, 0, 1, 100); const original = byte[0];
  byte[0] ^= 1; await handle.write(byte, 0, 1, 100); await handle.close();
  await assert.rejects(analyzeMusic({ project: directory }), /PCM identity changed/);
  await assert.rejects(deriveMusic({ project: directory }), /PCM identity changed/);
  await assert.rejects(remuxSourceAudio({ project: directory, video: path.join(directory, 'visual.mp4'), output: path.join(directory, 'bad-pcm.mp4') }), /PCM identity changed/);
  const restore = await fs.open(pcm, 'r+'); await restore.write(Buffer.from([original]), 0, 1, 100); await restore.close();
  const encoded = path.join(directory, source.passthrough.asset);
  const bytes = await fs.readFile(encoded); await fs.appendFile(encoded, 'changed');
  await assert.rejects(remuxSourceAudio({ video: path.join(directory, 'visual.mp4'), project: directory, output: path.join(directory, 'changed.mp4') }), /AAC identity changed/);
  await fs.writeFile(encoded, bytes);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(ingestMusic({ project: path.join(scratch, 'cancelled'), file: sourceFile, signal: controller.signal }), /abort/i);
  await assert.rejects(analyzeMusic({ project: directory, signal: controller.signal }), /abort/i);
  await assert.rejects(deriveMusic({ project: directory, signal: controller.signal }), /abort/i);
  await assert.rejects(remuxSourceAudio({ project: directory, video: path.join(directory, 'visual.mp4'), output: path.join(directory, 'cancelled.mp4'), signal: controller.signal }), /abort/i);
  assert.equal((await fs.readdir(directory)).some(file => file.includes('.tmp')), false);
});

test('browser music helpers are random-access, half-open and agree with runtime key interpolation', async t => {
  const keys = [[0, 0.2], [4, 1], [10, 0]], events = [{ seconds: 0, frame: 0, strength: 0.5 }, { seconds: 0.5, frame: 12 }, { seconds: 1, frame: 24 }];
  for (const frame of [20, -1, 3, 10, 4, 0, 3]) {
    assert.equal(sampleMusic(keys, frame), sample(keys, frame));
    assert.equal(sampleMusic(keys, frame, 'hold'), sample(keys, frame, 'hold'));
  }
  assert.equal(sampleMusic([], 0), 0);
  assert.deepEqual(musicEvents(events, 0, 12), [events[0]]);
  assert.deepEqual(musicEvents(events, 12, 24), [events[1]]);
  assert.deepEqual(musicEvents(events, 24, 24), []);
  assert.equal(musicEnvelope(events, -1), 0);
  assert.equal(musicEnvelope(events, 0), 0.5);
  assert.equal(musicEnvelope(events, 0.5), 1);
  assert.equal(musicEnvelope(events, 2, { duration: 1 }), 0);
  assert.throws(() => musicEnvelope(events, 1, { decay: 0 }), /invalid/);
  assert.throws(() => musicEvents(events, 2, 1), /invalid/);
  assert.throws(() => sampleMusic(keys, NaN), /finite/);
  const client = await browser(); t.after(() => client.close());
  const page = await client.newPage(); t.after(() => page.close());
  const module = await fs.readFile(fileURLToPath(new URL('../modules/music.mjs', import.meta.url)), 'utf8');
  const values = await page.evaluate(async ({ module, keys, events }) => {
    const api = await import(URL.createObjectURL(new Blob([module], { type: 'text/javascript' })));
    return [api.sampleMusic(keys, 3), api.musicEnvelope(events, 0.5), api.musicEvents(events, 12, 24)];
  }, { module, keys, events });
  assert.deepEqual(values, [sampleMusic(keys, 3), 1, [events[1]]]);

  // Exercise the actual immutable project + player $data channel seam, not just
  // schema validation. There are no toolkit-external imports in the scene.
  const runtimeProject = await project('runtime-project');
  const derived = await deriveMusic({ project: directory });
  await fs.mkdir(path.join(runtimeProject, path.dirname(source.audio.asset)), { recursive: true });
  await fs.copyFile(path.join(directory, source.audio.asset), path.join(runtimeProject, source.audio.asset));
  await write(path.join(runtimeProject, 'work.json'), { version: 1, title: 'Music runtime seam', size: [32, 32], fps: 24, frames: source.frames,
    ...derived.manifest, audio: [source.audio], layers: [{ id: 'scene', module: 'scene.mjs' }] });
  await fs.writeFile(path.join(runtimeProject, 'scene.mjs'), `export function prepare() { return {
    evaluate(t) { return t.read('music.energy', 'music'); },
    draw(g, t, value) { g.fillStyle = '#fff'; g.fillRect(0,0,32*value,32); }
  }; }`);
  const snapshot = await freeze(runtimeProject, path.join(scratch, 'revisions'));
  const site = await host({ snapshot, audio: path.join(runtimeProject, source.audio.asset) }); t.after(site.close);
  await page.goto(`${site.url}/?muted=1`);
  await page.waitForFunction(() => window.direction || window.failure);
  assert.equal(await page.evaluate(() => window.failure), undefined);
  for (const frame of [source.frames - 1, 2, 16, 0, 16]) {
    const state = await page.evaluate(frame => window.direction.seek(frame), frame);
    assert.equal(state.values['music.energy'], sampleMusic(derived.tracks.energy, frame));
  }
});
