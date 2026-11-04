import fs from 'node:fs/promises';
import path from 'node:path';
import { ffmpeg, ffprobe, run } from './execution.mjs';
import { rate } from './audio.mjs';
import { findJob } from './jobs.mjs';
import { checksum, openRevision, toolkit, writeJSON } from './revisions.mjs';
import { host } from './server.mjs';

async function completed(store, id) {
  const job = await findJob(store, id);
  if (job.status !== 'completed' || job.settings.mode !== 'video') throw new Error(`Completed video required: ${id}`);
  const snapshot = await openRevision(store, job.revision);
  await fs.access(job.output);
  if (job.outputSha256 && await checksum(job.output) !== job.outputSha256) throw new Error('Output checksum mismatch');
  return { job, snapshot };
}
export async function reviewSite(store, ids, port) {
  const runtime = path.join(toolkit, 'runtime');
  const dir = path.join(store, 'review');
  await fs.mkdir(dir, { recursive: true });
  const review = await fs.mkdtemp(path.join(dir, 'run-'));
  const files = new Map([
    ['/', path.join(runtime, 'review.html')],
    ['/runtime/review-player.mjs', path.join(runtime, 'review-player.mjs')],
    ['/runtime/style.css', path.join(runtime, 'style.css')],
    ['/clips.json', path.join(review, 'clips.json')],
  ]);
  const clips = await Promise.all(ids.map(async id => {
    const { job, snapshot } = await completed(store, id);
    const url = `/clip/${id}.mp4`;
    files.set(url, job.output);
    return { url, title: snapshot.manifest.title, revision: job.revision, fps: snapshot.manifest.fps, ...job.settings };
  }));
  await writeJSON(files.get('/clips.json'), clips);
  return host({ files, port });
}

export async function sync(store, id, signal) {
  const { job, snapshot } = await completed(store, id);
  const { fps, frames, probes = [] } = snapshot.manifest;
  if (job.settings.from !== 0 || job.settings.to !== frames || probes.length < 2) {
    throw new Error('Sync needs a whole-work file and at least two authored probes');
  }
  const dir = path.dirname(job.output);
  const options = { signal, capture: true, log: path.join(dir, 'sync.log') };
  const probe = JSON.parse(await run(ffprobe, ['-v', 'error', '-show_streams', '-of', 'json', job.output], options));
  const video = probe.streams.find(s => s.codec_type === 'video');
  const audio = probe.streams.find(s => s.codec_type === 'audio');
  if (!video || !audio) throw new Error('MP4 does not contain video and audio');
  const pcm = await run(ffmpeg, ['-v', 'error', '-i', job.output, '-vn', '-ac', '1', '-ar', String(rate), '-f', 'f32le', '-'], options);
  const timestamps = JSON.parse(await run(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_frames',
    '-show_entries', 'frame=best_effort_timestamp_time', '-of', 'json', job.output], options))
    .frames.map(frame => Number(frame.best_effort_timestamp_time));
  const cadenceErrorMs = Math.max(...timestamps.map((seconds, frame) => Math.abs(seconds - (timestamps[0] + frame / fps)))) * 1000;
  const checks = [];
  for (const p of [...probes].sort((a, b) => a.frame - b.frame)) {
    const from = Math.max(0, p.frame - 3);
    const to = Math.min(frames, p.frame + 4);
    const x = Math.floor(video.width * p.box[0]);
    const y = Math.floor(video.height * p.box[1]);
    const w = Math.max(2, Math.floor(video.width * p.box[2]) - x);
    const h = Math.max(2, Math.floor(video.height * p.box[3]) - y);
    const luma = await run(ffmpeg, ['-v', 'error', '-i', job.output, '-an', '-vf',
      `trim=start_frame=${from}:end_frame=${to},format=gray,crop=${w}:${h}:${x}:${y},scale=1:1:flags=area`,
      '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], options);
    if (luma.length !== to - from) throw new Error('Unexpected decoded video probe length');
    let visualFrame = null;
    let jump = 0;
    for (let i = 1; i < luma.length; i++) {
      const delta = luma[i] - luma[i - 1];
      if (delta > jump && delta >= p.threshold) { visualFrame = from + i; jump = delta; }
    }
    const expected = Math.round(p.frame * rate / fps);
    const around = Math.round((p.audioSearch ?? 90) * rate / 1000);
    let peak = 0;
    let peakIndex = null;
    for (let i = Math.max(0, expected - around); i < Math.min(pcm.length / 4, expected + around); i++) {
      const level = Math.abs(pcm.readFloatLE(i * 4));
      if (level > peak) { peak = level; peakIndex = i; }
    }
    const audioSeconds = peak >= 0.12 ? peakIndex / rate + Number(audio.start_time) : null;
    const videoSeconds = visualFrame === null ? null : (timestamps[visualFrame] ?? null);
    const offsetMs = audioSeconds === null || videoSeconds === null ? null : 1000 * (audioSeconds - videoSeconds);
    checks.push({ label: p.label, authoredFrame: p.frame, visualFrame, luma: [...luma], jump, audioSeconds, videoSeconds, peak, offsetMs });
  }
  const toleranceMs = 1000 / fps;
  const offsets = checks.map(c => c.offsetMs).filter(Number.isFinite);
  const fixedOffsetMs = offsets.length === checks.length ? offsets.reduce((sum, n) => sum + n, 0) / offsets.length : null;
  const driftMs = offsets.length === checks.length ? offsets.at(-1) - offsets[0] : null;
  const durationDeltaMs = 1000 * (Number(audio.duration) - Number(video.duration));
  const pass = Number(video.nb_frames) === frames && timestamps.length === frames && cadenceErrorMs <= 0.1 && Math.abs(durationDeltaMs) <= toleranceMs &&
    fixedOffsetMs !== null && Math.abs(driftMs) <= toleranceMs &&
    checks.every(c => c.visualFrame === c.authoredFrame && Math.abs(c.offsetMs) <= toleranceMs);
  const result = { job: id, pass, toleranceMs, fixedOffsetMs, driftMs, durationDeltaMs, cadenceErrorMs, videoStart: video.start_time,
    audioStart: audio.start_time, videoFrames: Number(video.nb_frames), checks };
  await writeJSON(path.join(dir, 'sync.json'), result);
  return result;
}
