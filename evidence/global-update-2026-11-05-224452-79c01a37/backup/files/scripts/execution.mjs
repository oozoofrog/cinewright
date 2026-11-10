import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export const ffmpeg = process.env.DIRECTION_FFMPEG || 'ffmpeg';
export const ffprobe = process.env.DIRECTION_FFPROBE || 'ffprobe';
export const chrome = process.env.DIRECTION_CHROME ||
  (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
export async function run(executable, args, { signal, log, capture = false } = {}) {
  signal?.throwIfAborted();
  const file = log ? await fs.open(log, 'a') : null;
  try {
    if (file) await file.writeFile(`\n${JSON.stringify([executable, ...args])}\n`);
    return await new Promise((resolve, reject) => {
      const child = spawn(executable, args, { stdio: ['ignore', capture ? 'pipe' : 'ignore', file ? file.fd : 'pipe'], signal });
      const stdout = [];
      const stderr = [];
      let spawnError;
      child.stdout?.on('data', chunk => stdout.push(chunk));
      child.stderr?.on('data', chunk => stderr.push(chunk));
      child.once('error', error => { spawnError = error; });
      child.once('close', (code, killedBy) => {
        if (spawnError) reject(spawnError);
        else if (code === 0) resolve(Buffer.concat(stdout));
        else reject(new Error(`${path.basename(executable)} exited ${code ?? killedBy}: ${log ?? Buffer.concat(stderr).toString().trim()}`));
      });
    });
  } finally {
    await file?.close();
  }
}

export async function browser() {
  const { chromium } = await import('playwright-core');
  return chromium.launch({
    executablePath: chrome,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
}
