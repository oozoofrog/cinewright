import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { ffmpeg, ffprobe, run } from './execution.mjs';
import { rate } from './audio.mjs';
import { integer, projectPath } from '../runtime/timeline.mjs';

const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
async function writeJSON(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
  await fs.rename(temporary, file);
}
async function hashFile(file, signal) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file, { signal })) hash.update(chunk);
  return hash.digest('hex');
}
async function probe(file, signal) {
  return JSON.parse((await run(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { signal, capture: true })).toString());
}
const audioStream = metadata => metadata.streams.find(s => s.codec_type === 'audio');
const zeroStart = stream => Math.abs(Number(stream?.start_time ?? NaN)) < 1e-6;
const identityFields = stream => ({ codec_name: stream.codec_name, sample_rate: stream.sample_rate, channels: stream.channels, channel_layout: stream.channel_layout });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
async function packetHash(file, signal) {
  const text = (await run(ffmpeg, ['-v', 'error', '-i', file, '-map', '0:a:0', '-c:a', 'copy', '-f', 'hash', '-hash', 'sha256', '-'], { signal, capture: true })).toString().trim();
  if (!/^SHA256=[0-9a-f]{64}$/.test(text)) throw new Error('Cannot establish encoded audio packet identity');
  return text.slice(7);
}
async function nativeIdentity(file, stream, directory, signal) {
  const raw = path.join(directory, `identity-${randomUUID()}.s16`);
  try {
    await run(ffmpeg, ['-v', 'error', '-i', file, '-map', '0:a:0', '-vn', '-c:a', 'pcm_s16le', '-f', 's16le', raw], { signal });
    const bytes = (await fs.stat(raw)).size;
    const frames = bytes / (2 * stream.channels);
    if (!Number.isSafeInteger(frames) || frames < 1) throw new Error('Empty or invalid native audio decode');
    return { rate: Number(stream.sample_rate), channels: stream.channels, frames, format: 's16le', sha256: await hashFile(raw, signal) };
  } finally {
    await fs.rm(raw, { force: true });
  }
}

// Parse chunk headers rather than assume a 44-byte WAV; ffmpeg may emit LIST/JUNK.
async function pcmInfo(file) {
  const handle = await fs.open(file, 'r');
  try {
    const size = (await handle.stat()).size;
    async function bytes(at, count) {
      const value = Buffer.alloc(count);
      if ((await handle.read(value, 0, count, at)).bytesRead !== count) throw new Error('Truncated PCM WAV');
      return value;
    }
    const header = await bytes(0, 12);
    if (header.toString('ascii', 0, 4) !== 'RIFF' || header.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Expected RIFF PCM WAV');
    let format, data;
    for (let at = 12; at + 8 <= size;) {
      const chunk = await bytes(at, 8), length = chunk.readUInt32LE(4), name = chunk.toString('ascii', 0, 4);
      if (at + 8 + length > size) throw new Error('Truncated WAV chunk');
      if (name === 'fmt ') {
        if (length < 16) throw new Error('Invalid PCM format');
        const fmt = await bytes(at + 8, 16);
        format = { encoding: fmt.readUInt16LE(0), channels: fmt.readUInt16LE(2), rate: fmt.readUInt32LE(4), align: fmt.readUInt16LE(12), bits: fmt.readUInt16LE(14) };
      }
      if (name === 'data') data = { offset: at + 8, bytes: length };
      at += 8 + length + (length % 2);
    }
    if (!format || format.encoding !== 1 || format.channels !== 2 || format.rate !== rate || format.bits !== 16 || format.align !== 4 || !data || data.bytes % 4 || !data.bytes) {
      throw new Error('Expected nonempty 48k stereo s16 PCM');
    }
    return { ...data, frames: data.bytes / 4, rate, channels: 2 };
  } finally { await handle.close(); }
}

async function sourceAt(project) {
  const source = await readJSON(path.join(project, 'music/source.json'));
  if (source.version !== 1 || !source.decoded || source.decoded.rate !== rate || source.decoded.channels !== 2 || !Number.isSafeInteger(source.decoded.frames) || source.decoded.frames < 1 || source.audio?.sourceOut !== source.decoded.frames || source.duration !== source.decoded.frames / rate) {
    throw new Error('Invalid music source metadata');
  }
  projectPath(source.audio.asset);
  return source;
}

// The mixer uses 48k stereo sample frames (not seconds). Native identity is kept
// separately: resampling is preview-only, never the AAC passthrough provenance.
export async function ingestMusic({ project, file, fps = 24, signal }) {
  integer(fps, 'fps', 1, 120);
  signal?.throwIfAborted();
  project = path.resolve(project);
  file = path.resolve(file);
  const music = path.join(project, 'music');
  await fs.mkdir(music, { recursive: true });
  try { await fs.access(path.join(music, 'source.json')); throw new Error('music/source.json already exists; use a new project'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const metadata = await probe(file, signal), stream = audioStream(metadata);
  if (!stream) throw new Error('Input has no audio stream');
  const input = { file: path.basename(file), bytes: (await fs.stat(file)).size, sha256: await hashFile(file, signal), stream, format: metadata.format, streams: metadata.streams };
  const directory = await fs.mkdtemp(path.join(music, 'assets-'));
  const asset = path.relative(project, path.join(directory, 'preview.wav')).split(path.sep).join('/');
  try {
    await run(ffmpeg, ['-v', 'error', '-i', file, '-map', '0:a:0', '-vn', '-ar', String(rate), '-ac', '2', '-c:a', 'pcm_s16le', path.join(project, asset)], { signal });
    const pcm = await pcmInfo(path.join(project, asset));
    const decoded = { rate, channels: 2, frames: pcm.frames, duration: pcm.frames / rate, format: 's16le', sha256: await hashFile(path.join(project, asset), signal) };
    const native = await nativeIdentity(file, stream, directory, signal);
    const source = { version: 1, input, native, decoded, duration: decoded.duration, fps, frames: Math.ceil(decoded.frames * fps / rate),
      audio: { asset, sourceIn: 0, sourceOut: pcm.frames, at: 0, gain: 1,
        provenance: { inputSha256: input.sha256, streamIndex: stream.index, timeOrigin: 'First decoded audio sample; original container start is recorded in input.stream.start_time', conversion: '48kHz stereo s16 PCM; preview resampling/channel conversion may occur' } } };
    source.passthrough = { eligible: false, reason: 'Requires AAC in MP4/M4A, zero audio start, and verified packet/native decode identity' };
    if (stream.codec_name === 'aac' && metadata.format.format_name.split(',').some(name => name === 'mov' || name === 'mp4' || name === 'm4a') && zeroStart(stream)) {
      const encoded = path.join(directory, 'original.m4a');
      await run(ffmpeg, ['-v', 'error', '-i', file, '-map', '0:a:0', '-vn', '-c:a', 'copy', '-map_metadata', '-1', encoded], { signal });
      const encodedStream = audioStream(await probe(encoded, signal));
      const packets = await packetHash(file, signal);
      const encodedNative = await nativeIdentity(encoded, encodedStream, directory, signal);
      if (packets !== await packetHash(encoded, signal) || !same(native, encodedNative) || !same(identityFields(stream), identityFields(encodedStream)) || !zeroStart(encodedStream)) {
        throw new Error('AAC extraction changed packet/native audio identity or start');
      }
      source.passthrough = { eligible: true, asset: path.relative(project, encoded).split(path.sep).join('/'), sha256: await hashFile(encoded, signal), packetSha256: packets,
        inputSha256: input.sha256, stream: identityFields(encodedStream), start: 0, duration: native.frames / native.rate, native,
        policy: 'Only unchanged full-length single-source audio; no trim, offset, gain or tempo changes. No automatic lossy fallback.' };
    }
    if (input.sha256 !== await hashFile(file, signal)) throw new Error('Source changed during ingest');
    await writeJSON(path.join(music, 'source.json'), source);
    return source;
  } catch (error) {
    await fs.rm(directory, { recursive: true, force: true });
    throw error;
  }
}

const percentile = (values, q) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * q)];
};
const normalize = values => {
  const scale = percentile(values, 0.95);
  return { scale, values: values.map(value => scale > 1e-9 ? Math.min(1, value / scale) : 0) };
};

// Bounded-memory PCM processing: a 10ms hop, stereo RMS and approximate bands
// from one-pole 400/4000Hz lowpasses. Bands are activity proxies, not a spectral EQ.
async function measurePCM(file, pcm, hop, signal) {
  const energy = [], low = [], mid = [], high = [];
  let count = 0, sums = [0, 0, 0, 0], lp400 = [0, 0], lp4000 = [0, 0];
  const a = 1 - Math.exp(-2 * Math.PI * 400 / rate), b = 1 - Math.exp(-2 * Math.PI * 4000 / rate);
  function flush() {
    for (const [i, track] of [energy, low, mid, high].entries()) track.push(Math.sqrt(sums[i] / (count * 2)));
    sums = [0, 0, 0, 0]; count = 0;
  }
  for await (const chunk of createReadStream(file, { start: pcm.offset, end: pcm.offset + pcm.bytes - 1, highWaterMark: 65536, signal })) {
    for (let at = 0; at < chunk.length; at += 4) {
      for (let c = 0; c < 2; c++) {
        const value = chunk.readInt16LE(at + c * 2) / 32768;
        lp400[c] += a * (value - lp400[c]); lp4000[c] += b * (value - lp4000[c]);
        const bands = [value, lp400[c], lp4000[c] - lp400[c], value - lp4000[c]];
        for (let i = 0; i < 4; i++) sums[i] += bands[i] * bands[i];
      }
      if (++count === hop) flush();
    }
  }
  if (count) flush();
  return { energy, low, mid, high };
}

function onsetAnalysis(raw, step, { onsetSensitivity, minimumOnsetSeconds }) {
  const novelty = raw.energy.map((value, i) => i ? Math.max(0, Math.log1p(value * 100) - Math.log1p(raw.energy[i - 1] * 100))
    + ['low', 'mid', 'high'].reduce((sum, band) => sum + Math.max(0, Math.log1p(raw[band][i] * 100) - Math.log1p(raw[band][i - 1] * 100)), 0) / 3 : 0);
  const peaks = [], radius = Math.max(1, Math.round(0.2 / step));
  for (let i = 1; i < novelty.length - 1; i++) {
    if (novelty[i] <= novelty[i - 1] || novelty[i] < novelty[i + 1] || raw.energy[i] < 1e-5) continue;
    const local = novelty.slice(Math.max(0, i - radius), i + radius + 1);
    const median = percentile(local, 0.5), deviation = percentile(local.map(value => Math.abs(value - median)), 0.5);
    if (novelty[i] <= median + onsetSensitivity * Math.max(deviation, 0.015)) continue;
    const event = { seconds: i * step, strength: novelty[i], provenance: 'inferred: positive log-RMS/band activity peak' };
    if (peaks.length && event.seconds - peaks.at(-1).seconds < minimumOnsetSeconds) {
      if (event.strength > peaks.at(-1).strength) peaks[peaks.length - 1] = event;
    } else peaks.push(event);
  }
  const scale = percentile(peaks.map(event => event.strength), 0.95) || 1;
  return { novelty, onsets: peaks.map(event => ({ ...event, strength: Math.min(1, event.strength / scale) })) };
}

function beatAnalysis(novelty, onsets, step, duration, { minBpm, maxBpm }) {
  const windows = [], beats = [];
  // Local eight-second estimates permit tempo drift; no meter/downbeat claim.
  for (let from = 0; from < duration; from += 8) {
    const to = Math.min(duration, from + 8), start = Math.floor(from / step), end = Math.min(novelty.length, Math.ceil(to / step));
    const candidates = [];
    for (let lag = Math.ceil(60 / maxBpm / step); lag <= Math.floor(60 / minBpm / step); lag++) {
      let dot = 0, aa = 0, bb = 0;
      for (let i = start + lag; i < end; i++) {
        dot += novelty[i] * novelty[i - lag]; aa += novelty[i] ** 2; bb += novelty[i - lag] ** 2;
      }
      candidates.push({ bpm: 60 / (lag * step), periodSeconds: lag * step, correlation: aa && bb ? dot / Math.sqrt(aa * bb) : 0 });
    }
    candidates.sort((a, b) => b.correlation - a.correlation);
    const best = candidates[0];
    const local = onsets.filter(event => event.seconds >= from && event.seconds < to);
    const accepted = best?.correlation >= 0.12 && local.length >= 3 && to - from >= 2;
    windows.push({ fromSeconds: from, toSeconds: to, status: accepted ? 'tentative' : 'manual-required', candidates: candidates.slice(0, 5),
      diagnostic: 'Normalized novelty autocorrelation, not confidence; half/double tempo and phase ambiguity remain.' });
    if (!accepted) continue;
    const period = best.periodSeconds, tolerance = Math.min(0.12, period * 0.2);
    // Choose a locally supported phase and only keep onset-backed events. Missing
    // beats are not invented; adjacent windows may have different phase/meter.
    const phase = [...local].sort((a, b) => {
      const score = event => local.reduce((sum, other) => {
        const distance = Math.abs(other.seconds - event.seconds);
        return sum + (Math.abs(distance - Math.round(distance / period) * period) <= tolerance ? other.strength : 0);
      }, 0);
      return score(b) - score(a);
    })[0].seconds;
    let last = -Infinity;
    for (const event of local) {
      const distance = Math.abs(event.seconds - phase);
      if (Math.abs(distance - Math.round(distance / period) * period) > tolerance || event.seconds - last < period * 0.5) continue;
      beats.push({ ...event, localBpm: best.bpm, provenance: 'inferred: onset-backed local beat candidate; not a downbeat' });
      last = event.seconds;
    }
  }
  return { beats, windows };
}

export async function analyzeMusic({ project, options = {}, signal }) {
  const source = await sourceAt(project), file = path.join(project, source.audio.asset);
  const settings = { onsetSensitivity: 3, minimumOnsetSeconds: 0.08, minBpm: 60, maxBpm: 180, ...options };
  for (const key of Object.keys(options)) if (!['onsetSensitivity', 'minimumOnsetSeconds', 'minBpm', 'maxBpm'].includes(key)) throw new Error(`Unknown analysis option: ${key}`);
  if (!Object.values(settings).every(value => Number.isFinite(value) && value > 0) || settings.onsetSensitivity > 20 || settings.minimumOnsetSeconds > 2 || settings.minBpm < 30 || settings.maxBpm > 300 || settings.maxBpm < settings.minBpm) throw new Error('Invalid analysis options');
  if (source.decoded.sha256 !== await hashFile(file, signal)) throw new Error('Preview PCM identity changed');
  const pcm = await pcmInfo(file);
  if (pcm.frames !== source.decoded.frames) throw new Error('Preview PCM sample length changed');
  const hop = 480, step = hop / rate;
  const raw = await measurePCM(file, pcm, hop, signal), onset = onsetAnalysis(raw, step, settings);
  const beat = beatAnalysis(onset.novelty, onset.onsets, step, source.duration, settings);
  const normalization = Object.fromEntries(Object.entries(raw).map(([name, values]) => [name, normalize(values)]));
  const analysis = { version: 1, inputSha256: source.input.sha256, pcmSha256: source.decoded.sha256, rate, decodedFrames: pcm.frames, duration: source.duration, hopFrames: hop, options: settings,
    events: { onsets: onset.onsets, beats: beat.beats },
    tracks: Object.fromEntries(Object.entries(normalization).map(([name, track]) => [name, track.values.map((value, i) => [i * step, value])])),
    sections: [], diagnostics: { status: beat.beats.length ? 'tentative' : 'manual-required', onsetCount: onset.onsets.length, beatCount: beat.beats.length,
      rmsPeak: raw.energy.reduce((peak, value) => Math.max(peak, value), 0), rmsP95: normalization.energy.scale, silent: normalization.energy.scale < 1e-9,
      normalization: 'Each RMS activity track divided by its own 95th percentile, clamped to [0,1]; not loudness or genre detection.',
      bandMethod: 'Approximate 400/4000Hz one-pole crossover activity; overlapping bands, not calibrated spectral powers.',
      timing: '10ms nonoverlapping PCM windows; timestamps are window starts, with at least one-hop uncertainty; not sample-accurate attacks.',
      beatWindows: beat.windows, limitations: ['No direct listening, meter, downbeat or structural segmentation claim.', 'Piano attacks/ornaments and half/double tempo can mislead onset/beat estimates.', 'Local beat windows can disagree; use manual beat/section overrides when needed.'],
      manualFallback: 'deriveMusic({project, overrides:{beats:[{seconds:0.5}], onsets:[{seconds:0.5,strength:1}], sections:[{name:"intro",from:0,to:120}]}}). Event arrays replace estimates; sections use half-open timeline frames. Empty arrays intentionally remove estimates.' } };
  signal?.throwIfAborted();
  await writeJSON(path.join(project, 'music/analysis.json'), analysis);
  return analysis;
}

function quantizeEvents(events, fps, frames, duration, manual) {
  if (!Array.isArray(events)) throw new Error('Music event overrides must be arrays');
  return events.map(event => {
    if (!event || !Number.isFinite(event.seconds) || event.seconds < 0 || event.seconds >= duration || (event.strength !== undefined && (!Number.isFinite(event.strength) || event.strength < 0 || event.strength > 1))) throw new Error('Music event outside source duration or invalid strength');
    const frame = Math.min(frames - 1, Math.round(event.seconds * fps));
    return { ...event, frame, quantizationErrorSeconds: frame / fps - event.seconds, ...(manual ? { provenance: 'manual override' } : {}) };
  }).sort((a, b) => a.seconds - b.seconds);
}

// Overrides replace event arrays and/or authored sections; analysis.json is never
// modified. Sections are explicit [from,to) timeline frames at the requested fps.
export async function deriveMusic({ project, fps = 24, overrides = {}, signal }) {
  integer(fps, 'fps', 1, 120);
  signal?.throwIfAborted();
  const source = await sourceAt(project), analysis = await readJSON(path.join(project, 'music/analysis.json'));
  if (analysis.version !== 1 || analysis.inputSha256 !== source.input.sha256 || analysis.pcmSha256 !== source.decoded.sha256 || analysis.decodedFrames !== source.decoded.frames) throw new Error('Analysis/source identity mismatch');
  if (source.decoded.sha256 !== await hashFile(path.join(project, source.audio.asset), signal)) throw new Error('Preview PCM identity changed');
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) throw new Error('Expected music overrides object');
  for (const key of Object.keys(overrides)) {
    if (!['onsets', 'beats', 'sections', 'consumers'].includes(key)) throw new Error(`Unknown music override: ${key}`);
    if (!Array.isArray(overrides[key])) throw new Error(`Music override ${key} must be an array`);
  }
  const frames = Math.ceil(source.decoded.frames * fps / rate);
  const events = Object.fromEntries(['onsets', 'beats'].map(name => [name, quantizeEvents(overrides[name] ?? analysis.events[name], fps, frames, source.duration, Object.hasOwn(overrides, name))]));
  const tracks = {};
  for (const [name, keys] of Object.entries(analysis.tracks)) {
    const result = new Map();
    for (const [seconds, value] of keys) {
      const frame = Math.min(frames - 1, Math.round(seconds * fps));
      result.set(frame, Math.max(result.get(frame) ?? 0, value));
    }
    if (!result.has(0)) result.set(0, keys[0]?.[1] ?? 0);
    if (!result.has(frames - 1)) result.set(frames - 1, keys.at(-1)?.[1] ?? 0);
    tracks[name] = [...result].sort((a, b) => a[0] - b[0]);
  }
  const sections = (overrides.sections ?? [{ name: 'full', from: 0, to: frames, provenance: 'inferred: source extent only, not musical segmentation' }]).map(section => {
    if (!section || typeof section.name !== 'string' || !/^(music\.)?[\w.-]+$/.test(section.name)) throw new Error('Invalid music section name');
    integer(section.from, 'section.from', 0, frames - 1);
    integer(section.to, 'section.to', section.from + 1, frames);
    return { ...section, name: section.name.startsWith('music.') ? section.name : `music.${section.name}`, provenance: overrides.sections ? 'manual override' : section.provenance };
  });
  if (new Set(sections.map(section => section.name)).size !== sections.length) throw new Error('Duplicate music section name');
  const consumers = overrides.consumers ?? ['scene'];
  if (!Array.isArray(consumers) || !consumers.length || !consumers.every(name => typeof name === 'string' && name && name !== '$data') || new Set(consumers).size !== consumers.length) throw new Error('Invalid music channel consumers');
  const channels = Object.fromEntries(Object.entries(tracks).map(([name, keys]) => [`music.${name}`, { producer: '$data', consumers, kind: 'number', space: 'music', from: 0, to: frames, mode: 'linear', data: { keys } }]));
  const points = Object.fromEntries(Object.entries(events).flatMap(([name, list]) => list.map((event, i) => [`music.${name}.${i}`, event.frame])));
  const derived = { version: 1, fps, frames, inputSha256: source.input.sha256, events, tracks, sections, manifest: { points, spans: Object.fromEntries(sections.map(section => [section.name, [section.from, section.to]])), channels }, overrides,
    diagnostics: { analysisStatus: analysis.diagnostics.status, manualEvents: ['onsets', 'beats'].filter(name => Object.hasOwn(overrides, name)),
      quantization: 'Nearest visual frame, clamped below exclusive end; original seconds and signed frame/fps-minus-seconds error retained. Same-frame events are retained.',
      trackQuantization: '10ms activity keys mapped to nearest frame, colliding keys reduced by maximum; linear interpolation.',
      paddedSeconds: frames / fps - source.duration, limitations: analysis.diagnostics.limitations } };
  signal?.throwIfAborted();
  await writeJSON(path.join(project, 'music/derived.json'), derived);
  return derived;
}

export async function remuxSourceAudio({ video, project, output, signal }) {
  const source = await sourceAt(project), pass = source.passthrough;
  if (!pass?.eligible) throw new Error(`Ineligible audio passthrough: ${pass?.reason ?? 'not preserved'}; no automatic fallback`);
  const expected = source.audio;
  if (source.decoded.sha256 !== await hashFile(path.join(project, expected.asset), signal)) throw new Error('Preview PCM identity changed');
  if (expected.sourceIn !== 0 || expected.sourceOut !== source.decoded.frames || expected.at !== 0 || expected.gain !== 1 || pass.inputSha256 !== source.input.sha256) throw new Error('Passthrough requires unchanged full-length source audio');
  let work;
  try { work = await readJSON(path.join(project, 'work.json')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (work && (work.audio?.length !== 1 || !['asset', 'sourceIn', 'sourceOut', 'at', 'gain'].every(key => (work.audio[0][key] ?? (key === 'gain' ? 1 : undefined)) === expected[key]) || work.frames !== Math.ceil(source.decoded.frames * work.fps / rate))) throw new Error('Passthrough rejects edited/trimmed/multiple-source project audio or duration');
  projectPath(pass.asset);
  const encoded = path.join(project, pass.asset), directory = path.dirname(encoded);
  if (pass.sha256 !== await hashFile(encoded, signal) || pass.packetSha256 !== await packetHash(encoded, signal)) throw new Error('Preserved AAC identity changed');
  const encodedStream = audioStream(await probe(encoded, signal));
  if (!zeroStart(encodedStream) || !same(identityFields(encodedStream), pass.stream) || !same(pass.native, source.native) || !same(await nativeIdentity(encoded, encodedStream, directory, signal), source.native)) throw new Error('Preserved AAC native identity/start changed');
  const info = await probe(video, signal), visual = info.streams.find(stream => stream.codec_type === 'video');
  const fps = work?.fps ?? source.fps;
  integer(fps, 'fps', 1, 120);
  const duration = Number(visual?.duration), start = Number(visual?.start_time ?? NaN);
  const expectedDuration = Math.ceil(source.decoded.frames * fps / rate) / fps;
  if (!visual || Math.abs(start) > 1e-6 || !Number.isFinite(start) || !Number.isFinite(duration) || duration + 1e-6 < source.duration || Math.abs(duration - expectedDuration) > 0.001) throw new Error('Passthrough requires zero-start, full-length video ceiled to project fps; no trimming or retiming');
  output = path.resolve(output);
  if ([path.resolve(video), path.resolve(encoded), path.resolve(project, source.audio.asset)].includes(output)) throw new Error('Output cannot replace a source asset');
  await fs.mkdir(path.dirname(output), { recursive: true });
  const temporary = `${output}.${randomUUID()}.mp4`;
  try {
    // No -shortest: retain every source packet, including encoder padding/edit list.
    await run(ffmpeg, ['-v', 'error', '-i', video, '-i', encoded, '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-map_metadata', '-1', '-movflags', '+faststart', temporary], { signal });
    const resultInfo = await probe(temporary, signal), resultStream = audioStream(resultInfo);
    const packets = await packetHash(temporary, signal), native = await nativeIdentity(temporary, resultStream, directory, signal);
    if (!zeroStart(resultStream) || !same(identityFields(resultStream), pass.stream) || packets !== pass.packetSha256 || !same(native, source.native)) throw new Error('Remux changed original AAC packet/native decoded identity or start');
    // Atomic no-clobber publication, including when output already exists.
    await fs.link(temporary, output);
    return { output, audio: 'source AAC stream copy', inputSha256: source.input.sha256, packetSha256: packets, native, audioStart: Number(resultStream.start_time), audioDuration: native.frames / native.rate,
      videoDuration: Number(resultInfo.streams.find(stream => stream.codec_type === 'video').duration), bitPreserved: true,
      limitations: ['Preview/mixer PCM is resampled; this output uses preserved original AAC instead.', 'Local requested use only; no copyright/publication clearance is implied.'] };
  } finally { await fs.rm(temporary, { force: true }); }
}
