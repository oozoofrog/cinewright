import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { browser } from '../../../scripts/execution.mjs';
import { readJSON, toolkit, writeJSON } from '../../../scripts/revisions.mjs';
import { task4Paths, reserveProduction, recordedCommand, assertStillcutsJob } from './task4-run.mjs';

const paths = task4Paths(process.argv[2]);
await reserveProduction(paths);
const { evidence, store, record, tmpdir } = paths;
process.env.TMPDIR = tmpdir;
const cli = path.join(toolkit, 'scripts/direction.mjs');
const receipt = { ...paths, phase: 'producing', examples: {} };
await writeJSON(path.join(evidence, 'outputs.json'), receipt);

async function command(label, args) {
  const argv = [cli, ...args, '--store', store];
  const result = await recordedCommand(evidence, label, process.execPath, argv);
  return { command: result.command, logs: result.logs, ...JSON.parse(result.stdout) };
}

let client;
try {
  client = await browser();
  for (const name of ['a', 'b']) {
    const frozen = await command(`${name}-freeze`, ['freeze', path.join(toolkit, 'examples/stillcuts', name)]);
    const work = await readJSON(path.join(frozen.snapshot, 'project/work.json'));
    const directory = path.join(record, name);
    const liveDirectory = path.join(directory, 'live');
    await fs.mkdir(liveDirectory, { recursive: true });
    const boundaries = [...new Set([0, work.frames - 1, ...Object.values(work.points)
      .flatMap(frame => [frame - 1, frame, frame + 1])])].filter(frame => frame >= 0 && frame < work.frames).sort((a, b) => a - b);
    const dense = Array.from({ length: work.points.quiet - work.points.lower + 5 }, (_, i) => work.points.lower - 2 + i)
      .filter(frame => frame >= 0 && frame < work.frames);
    const indices = [...new Set([...boundaries, ...dense])].sort((a, b) => a - b);
    const item = receipt.examples[name] = { frozen, frames: work.frames, fps: work.fps, size: work.size,
      points: work.points, spans: work.spans, boundaries, dense, liveDirectory, commands: {} };
    await writeJSON(path.join(evidence, 'outputs.json'), receipt);
    const playArgs = [cli, 'play', frozen.revision, '--store', store];
    const playLogs = path.join(evidence, `${name}-play`);
    await fs.mkdir(playLogs);
    const playStatus = { command: [process.execPath, ...playArgs], tmpdir, started: new Date().toISOString() };
    const child = spawn(process.execPath, playArgs, { cwd: toolkit, stdio: ['ignore', 'pipe', 'pipe'] });
    let spawnError;
    child.once('error', error => { spawnError = error; });
    const end = new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    let page;
    try {
      for (let i = 0; i < 300 && !stdout.includes('url'); i++) {
        if (spawnError) throw spawnError;
        assert.equal(child.exitCode, null, stderr);
        await delay(50);
      }
      assert.match(stdout, /"url"/, 'Play server readiness timeout');
      const { url } = JSON.parse(stdout);
      page = await client.newPage({ viewport: { width: Math.max(900, work.size[0] + 100), height: Math.max(900, work.size[1] + 300) } });
      await page.goto(`${url}&muted=1`);
      await page.waitForFunction(() => window.direction || window.failure);
      assert.equal(await page.evaluate(() => window.failure), undefined);
      assert.equal(await page.evaluate(() => fetch('/revision').then(r => r.text())), frozen.revision);
      await page.locator('#picture').evaluate((canvas, [width, height]) => {
        canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      }, work.size);
      const stateByFrame = {};
      for (const frame of indices) {
        const value = await page.evaluate(frame => ({ state: window.direction.seek(frame),
          image: document.getElementById('picture').toDataURL().split(',')[1] }), frame);
        stateByFrame[frame] = value.state;
        await fs.writeFile(path.join(liveDirectory, `${String(frame).padStart(4, '0')}.png`), Buffer.from(value.image, 'base64'));
      }
      await writeJSON(path.join(directory, 'live-states.json'), stateByFrame);
      const playback = await page.evaluate(async timeoutMs => {
        window.direction.seek(0);
        const presented = [];
        const observe = event => presented.push(event.detail.frame);
        window.addEventListener('directionframe', observe);
        const started = performance.now();
        let requested = false;
        const finished = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => { clearInterval(timer); reject(new Error('Live playback timeout')); }, timeoutMs);
          const timer = setInterval(() => {
            if (window.failure) { clearInterval(timer); clearTimeout(timeout); reject(new Error(window.failure)); }
            else if (requested && !window.direction.status().playing) { clearInterval(timer); clearTimeout(timeout); resolve(); }
          }, 30);
        });
        await Promise.all([window.direction.play().then(() => { requested = true; }), finished]);
        window.removeEventListener('directionframe', observe);
        const sound = document.getElementById('sound');
        const canvas = document.getElementById('picture');
        return { wallMs: performance.now() - started, presented, final: window.direction.status(),
          audioDuration: sound.duration, playbackRate: sound.playbackRate, muted: sound.muted,
          canvas: [canvas.width, canvas.height], display: [canvas.clientWidth, canvas.clientHeight] };
      }, Math.ceil(work.frames / work.fps * 1000) + 15000);
      assert.equal(playback.final.frame, work.frames - 1);
      assert.equal(playback.playbackRate, 1);
      assert.deepEqual(playback.canvas, work.size);
      assert.deepEqual(playback.display, work.size);
      assert.ok(playback.presented.length > work.frames / 2);
      item.commands.play = { command: [process.execPath, ...playArgs], logs: playLogs, url, pid: child.pid, playback };
      await page.locator('#picture').screenshot({ path: path.join(directory, 'live-final.png') });
    } finally {
      await page?.close().catch(() => {});
      child.kill('SIGTERM');
      const watchdog = setTimeout(() => child.kill('SIGKILL'), 5000);
      const { code, signal } = await end;
      clearTimeout(watchdog);
      Object.assign(playStatus, { exitCode: code, signal, error: spawnError?.message, finished: new Date().toISOString() });
      await fs.writeFile(path.join(playLogs, 'stdout'), stdout, { flag: 'wx' });
      await fs.writeFile(path.join(playLogs, 'stderr'), stderr, { flag: 'wx' });
      await fs.writeFile(path.join(playLogs, 'status.json'), JSON.stringify(playStatus, null, 2) + '\n', { flag: 'wx' });
      if (item.commands.play) item.commands.play.exitCode = code;
    }
    for (const [mode, args] of [
      ['frame', ['frame', frozen.revision, 'touch']],
      ['span', ['render', frozen.revision, '--span', 'contact-review']],
      ['full', ['render', frozen.revision]],
    ]) {
      const job = await command(`${name}-${mode}`, args);
      assertStillcutsJob(job, { revision: frozen.revision, manifest: work }, mode);
      item.commands[mode] = job;
      await writeJSON(path.join(evidence, 'outputs.json'), receipt);
    }
    const point = await fs.readFile(item.commands.frame.output);
    assert.deepEqual(point, await fs.readFile(path.join(liveDirectory, `${String(work.points.touch).padStart(4, '0')}.png`)));
    item.directCli = { point: 'touch', frame: work.points.touch, equalPNG: true };
    const mismatches = [];
    for (const frame of indices) {
      const live = await fs.readFile(path.join(liveDirectory, `${String(frame).padStart(4, '0')}.png`));
      const rendered = await fs.readFile(path.join(path.dirname(item.commands.full.output), 'frames', `${String(frame).padStart(7, '0')}.png`));
      if (!live.equals(rendered)) mismatches.push(frame);
    }
    assert.deepEqual(mismatches, []);
    item.directFull = { frames: indices, equalPNG: true };
    await writeJSON(path.join(evidence, 'outputs.json'), receipt);
    console.log(JSON.stringify({ example: name, revision: frozen.revision,
      frame: item.commands.frame.id, span: item.commands.span.id, full: item.commands.full.id, compared: indices.length }));
  }
  receipt.phase = 'completed';
  await writeJSON(path.join(evidence, 'outputs.json'), receipt);
} catch (error) {
  receipt.phase = 'failed';
  receipt.error = error.stack ?? String(error);
  await writeJSON(path.join(evidence, 'outputs.json'), receipt);
  throw error;
} finally { await client?.close(); }
