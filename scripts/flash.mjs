import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { ffmpeg, ffprobe, run } from './execution.mjs';

const width = 160, height = 90, pixels = width * height;
const linear = Array.from({ length: 256 }, (_, i) => {
  const s = i / 255;
  return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
});

/** Conservative reduced-resolution transition screen, not a clinical/WCAG test.
 * All decoded CFR frames are examined; only previous frame and one second of
 * qualifying transitions are retained. Opposing large-area changes are counted.
 */
export function flashAccumulator(fps) {
  if (!Number.isFinite(fps) || fps <= 0 || fps > 120) throw new Error('Unsupported screening fps');
  let previous, frames = 0, transitions = [], maxTransitions = 0, flaggedWindows = 0;
  const examples = [];
  return {
    push(rgb) {
      if (rgb.length !== pixels * 3) throw new Error('Invalid screening frame size');
      const now = frames++ / fps;
      if (previous) {
        const changes = [0, 0, 0, 0];
        for (let p = 0; p < rgb.length; p += 3) {
          const light = b => .2126 * linear[b[p]] + .7152 * linear[b[p + 1]] + .0722 * linear[b[p + 2]];
          const a = light(previous), b = light(rgb), delta = b - a;
          if (Math.abs(delta) >= .10 && Math.max(a, b) >= .20) changes[delta > 0 ? 0 : 1]++;
          const red = b => b[p] / Math.max(1, b[p] + b[p + 1] + b[p + 2]);
          const redDelta = (rgb[p] - previous[p]) / 255;
          if (Math.max(red(previous), red(rgb)) >= .80 && Math.abs(redDelta) >= .20) changes[redDelta > 0 ? 2 : 3]++;
        }
        // Same-direction pixel area, not a mean that could cancel opposing regions.
        const directions = changes.map(n => n / pixels >= .25);
        transitions = transitions.filter(t => now - t.seconds < 1);
        if (directions.some(Boolean)) transitions.push({ seconds: now, directions });
        const alternating = offset => {
          let rising = 0, falling = 0;
          for (const t of transitions) {
            // Keep both possible endings for counterphase regions. Read only
            // prior counts so one decoded transition cannot count twice.
            const nextRising = t.directions[offset] ? Math.max(rising, falling + 1) : rising;
            const nextFalling = t.directions[offset + 1] ? Math.max(falling, rising + 1) : falling;
            rising = nextRising;
            falling = nextFalling;
          }
          return Math.max(rising, falling);
        };
        const count = Math.max(alternating(0), alternating(2));
        maxTransitions = Math.max(maxTransitions, count);
        if (count >= 6) {
          flaggedWindows++;
          if (examples.length < 20) examples.push({ fromSeconds: Math.max(0, now - 1), toSeconds: now, transitions: count });
        }
      }
      previous = Buffer.from(rgb);
    },
    result() { return { frames, maxTransitionsInOneSecond: maxTransitions, flaggedWindows, examples }; },
  };
}

export async function screenFlashes({ file, report, log, signal }) {
  const info = JSON.parse((await run(ffprobe, ['-v', 'error', '-show_streams', '-of', 'json', file], { capture: true, signal, log })).toString());
  const video = info.streams.find(s => s.codec_type === 'video');
  const ratio = text => { const [a, b] = (text ?? '').split('/').map(Number); return a / b; };
  const fps = ratio(video?.avg_frame_rate);
  if (!video || !Number.isFinite(fps) || Math.abs(fps - ratio(video.r_frame_rate)) > 1e-6) throw new Error('Flash screen requires constant-frame-rate video');
  const screen = flashAccumulator(fps);
  signal?.throwIfAborted();
  const args = ['-v', 'error', '-i', file, '-map', '0:v:0', '-an', '-vf', `scale=${width}:${height}`, '-fps_mode', 'passthrough', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1'];
  const handle = log ? await fs.open(log, 'a') : null;
  if (handle) await handle.writeFile(JSON.stringify([ffmpeg, ...args]) + '\n');
  const child = spawn(ffmpeg, args, { stdio: ['ignore', 'pipe', handle ? handle.fd : 'pipe'], signal });
  let failure, stderr = '';
  child.stderr?.on('data', chunk => { stderr = (stderr + chunk).slice(-8192); });
  child.on('error', error => { failure = error; });
  const finished = new Promise(resolve => child.once('close', code => resolve(code)));
  let carry = Buffer.alloc(0), code;
  try {
    for await (const chunk of child.stdout) {
      const bytes = carry.length ? Buffer.concat([carry, chunk]) : chunk;
      let at = 0;
      while (at + pixels * 3 <= bytes.length) { screen.push(bytes.subarray(at, at + pixels * 3)); at += pixels * 3; }
      carry = Buffer.from(bytes.subarray(at));
    }
    code = await finished;
  } finally {
    if (code === undefined) { child.kill(); await finished; }
    await handle?.close();
  }
  if (failure) throw failure;
  if (code !== 0 || carry.length) throw new Error(`Flash decode failed (${code}): ${stderr}`);
  const measured = screen.result();
  if (!measured.frames || (video.nb_frames && Number(video.nb_frames) !== measured.frames)) throw new Error('Flash decode frame coverage mismatch');
  const result = { version: 1, file, fps, resolution: [width, height], ...measured,
    status: measured.flaggedWindows ? 'risk-detected' : 'screen-negative',
    scope: 'Every decoded CFR frame at 160x90; >=25% same-direction area, linear luminance delta >=0.10 (peak >=0.20) or saturated-red delta >=0.20; >=6 alternating transitions in a rolling second flags risk (both polarities retained for simultaneous opposing regions, at most one count per decoded transition).',
    limitations: ['Not WCAG certification, medical advice, or a guarantee of safety.', 'Downscaling can miss small/local patterns; no spatial-frequency, visual-angle or display-luminance model.', 'Screen-negative is not safe; human accessibility review remains required.'] };
  if (report) await fs.writeFile(report, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  return result;
}
