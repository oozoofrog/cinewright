import fs from 'node:fs/promises';
import path from 'node:path';
import { ffmpeg, run } from './execution.mjs';

export const rate = 48000;
export const sampleAt = (frame, fps) => Math.round(frame * rate / fps);

export async function mix(snapshot, dir, options = {}) {
  const { manifest, paths, root } = snapshot;
  const duration = sampleAt(manifest.frames, manifest.fps);
  const target = path.join(dir, 'mix.wav');
  const clips = manifest.audio ?? [];
  const args = ['-hide_banner', '-loglevel', 'warning', '-y'];
  const filters = [];
  const inputs = [];
  const sources = [];
  for (const [i, { asset, at, sourceIn, sourceOut, gain = 1 }] of clips.entries()) {
    if (!paths.has('project/' + asset)) throw new Error(`Missing audio source: ${asset}`);
    const file = path.join(dir, `decoded-${i}.f32`);
    await run(ffmpeg, [...args, '-i', path.join(root, 'project', asset), '-map', '0:a:0',
      '-ar', String(rate), '-ac', '2', '-f', 'f32le', file], options);
    const decoded = (await fs.stat(file)).size / 8;
    if (sourceOut > decoded) throw new Error(`Audio sourceOut exceeds decoded length: ${asset} (${decoded})`);
    const start = sourceIn + Math.max(0, -at);
    const out = Math.min(sourceOut, start + duration - Math.max(0, at));
    sources.push({ asset, decoded, sourceIn, sourceOut, at, gain, used: out > start ? [start, out] : null });
    if (out <= start) continue;
    const stream = filters.length;
    inputs.push('-f', 'f32le', '-ar', String(rate), '-ac', '2', '-channel_layout', 'stereo', '-i', file);
    filters.push(`[${stream}:a]atrim=start_sample=${start}:end_sample=${out},asetpts=PTS-STARTPTS,volume=${gain},adelay=${Math.max(0, at)}S:all=1[a${stream}]`);
  }
  // A silent reference gives every mix the same zero point and exact duration.
  const count = filters.length;
  const base = [...args, ...inputs, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'];
  filters.push(`[${count}:a]atrim=end_sample=${duration}[base]`);
  filters.push(`[base]${Array.from({ length: count }, (_, i) => `[a${i}]`).join('')}amix=inputs=${count + 1}:duration=first:normalize=0[out]`);
  await run(ffmpeg, [...base, '-filter_complex', filters.join(';'), '-map', '[out]', '-c:a', 'pcm_s16le', target], options);
  return { file: target, rate, duration, sources };
}
