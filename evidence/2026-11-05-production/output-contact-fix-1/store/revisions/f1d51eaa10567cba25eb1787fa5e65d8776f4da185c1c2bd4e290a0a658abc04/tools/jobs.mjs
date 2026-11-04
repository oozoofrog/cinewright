import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { integer } from '../runtime/timeline.mjs';
import { ffmpeg, browser, run } from './execution.mjs';
import { mix, sampleAt } from './audio.mjs';
import { checksum, loadTool, openRevision, readJSON, writeJSON } from './revisions.mjs';
import { host } from './server.mjs';

export async function findJob(store, id) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error(`Invalid job: ${id}`);
  return readJSON(path.join(store, 'jobs', id, 'job.json'));
}
export async function render(snapshot, store, settings, { signal, retryOf, browserFactory = browser } = {}) {
  const { manifest: work, revision } = snapshot;
  const { mode = 'video', from = 0, to = work.frames, scale = 1 } = settings;
  integer(from, 'from', 0, work.frames - 1);
  integer(to, 'to', from + 1, work.frames);
  if (!['video', 'frame'].includes(mode) || (mode === 'frame' && to !== from + 1)) throw new Error('Invalid render mode');
  if (!Number.isFinite(scale) || scale < 0.125 || scale > 1) throw new Error('Scale must be 0.125 through 1');
  const id = randomUUID();
  const dir = path.join(store, 'jobs', id);
  const frames = path.join(dir, 'frames');
  await fs.mkdir(frames, { recursive: true });
  const log = path.join(dir, 'execution.log');
  const record = {
    id, revision, retryOf, settings: { mode, from, to, scale }, status: 'running',
    phase: 'preparing', frames: 0, totalFrames: to - from, pid: process.pid,
    started: new Date().toISOString(), log,
  };
  const update = () => writeJSON(path.join(dir, 'job.json'), record);
  await update();
  // The first line gives operators the ID while the process is still running.
  console.error(`Job ${id} · ${dir}`);
  let site;
  let client;
  let closeBrowser;
  try {
    const options = { signal, log };
    record.ffmpeg = (await run(ffmpeg, ['-version'], { ...options, capture: true })).toString().split('\n')[0];
    const audio = await mix(snapshot, dir, options);
    record.audio = audio;
    signal?.throwIfAborted();
    site = await host({ snapshot, audio: audio.file });
    client = await browserFactory();
    closeBrowser = () => client.close().catch(() => {});
    signal?.addEventListener('abort', closeBrowser, { once: true });
    signal?.throwIfAborted();
    record.browser = client.version();
    record.phase = 'frames';
    await update();
    const page = await client.newPage();
    const diagnostics = [];
    page.on('pageerror', error => diagnostics.push(error.stack ?? String(error)));
    page.on('console', message => {
      if (['warning', 'error'].includes(message.type())) diagnostics.push(message.text());
    });
    try {
      await page.goto(`${site.url}/?scale=${scale}&muted=1`);
      await page.waitForFunction(() => window.direction || window.failure, null, { timeout: 20000 });
      for (let frame = from; frame < to; frame++) {
        signal?.throwIfAborted();
        const result = await page.evaluate(at => {
          if (window.failure) throw new Error(window.failure);
          const state = window.direction.seek(at);
          const image = document.getElementById('picture').toDataURL();
          return { state, bytes: image.split(',')[1] };
        }, frame);
        await fs.writeFile(path.join(frames, `${String(frame - from).padStart(7, '0')}.png`), Buffer.from(result.bytes, 'base64'));
        if (mode === 'frame') await writeJSON(path.join(dir, 'frame.json'), result.state);
        record.frames++;
        if (record.frames % Math.max(1, work.fps) === 0) await update();
      }
    } finally {
      if (diagnostics.length) await fs.appendFile(log, diagnostics.join('\n') + '\n');
    }
    signal?.throwIfAborted();
    record.phase = mode === 'video' ? 'encoding' : 'publishing';
    await update();
    const output = path.join(dir, mode === 'frame' ? 'frame.png' : 'work.mp4');
    const partial = path.join(dir, mode === 'frame' ? 'partial.png' : 'partial.mp4');
    if (mode === 'frame') {
      await fs.copyFile(path.join(frames, '0000000.png'), partial);
    } else {
      const start = sampleAt(from, work.fps);
      const end = sampleAt(to, work.fps);
      await run(ffmpeg, ['-hide_banner', '-loglevel', 'info', '-y', '-framerate', String(work.fps),
        '-i', path.join(frames, '%07d.png'), '-i', audio.file,
        '-af', `atrim=start_sample=${start}:end_sample=${end},asetpts=PTS-STARTPTS`,
        '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-preset', 'fast',
        '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
        '-ar', '48000', '-movflags', '+faststart', partial], options);
    }
    const digest = await checksum(partial);
    signal?.throwIfAborted();
    await fs.rename(partial, output);
    record.status = 'completed';
    record.phase = 'published';
    record.outputSha256 = digest;
    record.output = output;
  } catch (error) {
    record.status = signal?.aborted ? 'cancelled' : 'failed';
    record.error = error.stack ?? String(error);
    await fs.appendFile(log, `\n${record.error}\n`);
  } finally {
    signal?.removeEventListener('abort', closeBrowser ?? (() => {}));
    await client?.close().catch(() => {});
    await site?.close();
    record.finished = new Date().toISOString();
    await update();
  }
  return record;
}

export async function retry(store, id, options) {
  const previous = await findJob(store, id);
  if (!['failed', 'cancelled'].includes(previous.status)) throw new Error('Retry requires a failed or cancelled job');
  const snapshot = await openRevision(store, previous.revision);
  const frozen = await loadTool(snapshot, 'jobs.mjs');
  return frozen.render(snapshot, store, previous.settings, { ...options, retryOf: id });
}
