#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { cues, integer } from '../runtime/timeline.mjs';
import { browser, ffmpeg, ffprobe, run } from './execution.mjs';
import { findJob, retry } from './jobs.mjs';
import { freeze, loadTool, openRevision } from './revisions.mjs';
import { host } from './server.mjs';
import { init } from './scaffold.mjs';
import { reviewSite, sync } from './review.mjs';
import { observe } from './observe.mjs';

const help = `direction <command> [inputs] [options]

  doctor                             Execute browser and media dependency checks
  init PROJECT [--title TITLE]        Create a new project in an unused directory
  freeze PROJECT                     Write a content-addressed revision
  play PROJECT_OR_REVISION           Serve the live composited preview
  frame PROJECT_OR_REVISION AT       Extract authored frame number or named cue
  render PROJECT_OR_REVISION         Render the entire work to MP4
  preview PROJECT_OR_REVISION        Render a 0.5-scale whole-work draft to MP4
  render … --span NAME               Render a named half-open range
  render … --from AT --to AT         Render a half-open range
  status JOB_ID                      Read progress and result metadata
  retry JOB_ID                       Re-run the recorded revision and settings as a new job
  review JOB_ID [JOB_ID …]           Serve completed clips for independent playback and comparison
  observe JOB_ID                     Play one MP4 in real time and capture playback evidence
  sync JOB_ID                        Measure authored probes in a whole-work muxed MP4

Shared options: --store PATH (default: ./.direction), --port N (play/review), --scale N (0.125–1)
init options: --title TITLE, --frames N, --fps N
Environment: DIRECTION_CHROME, DIRECTION_FFMPEG, DIRECTION_FFPROBE
Ctrl+C cancels work and retains its job record. Use local trusted project modules.
`;
const print = data => console.log(JSON.stringify(data, null, 2));

async function main() {
  const { positionals: [cmd, input, ...rest], values: opts } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' }, store: { type: 'string' }, port: { type: 'string' },
      title: { type: 'string' }, frames: { type: 'string' }, fps: { type: 'string' },
      span: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' }, scale: { type: 'string' },
    },
  });
  if (!cmd || opts.help) { console.log(help); return; }
  const store = path.resolve(opts.store ?? '.direction');
  const controller = new AbortController();
  const stop = () => controller.abort(new Error('Cancelled by signal'));
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  const signal = controller.signal;
  const requireInput = () => { if (!input) throw new Error(`${cmd} requires an input`); };
  const port = () => integer(Number(opts.port ?? 0), 'port', 0, 65535);
  const scale = fallback => {
    const value = Number(opts.scale ?? fallback);
    if (!Number.isFinite(value) || value < 0.125 || value > 1) throw new Error('Scale must be 0.125 through 1');
    return value;
  };
  const snapshot = () => {
    requireInput();
    return /^[a-f0-9]{64}$/.test(input)
      ? openRevision(store, input) : freeze(path.resolve(input), store);
  };
  async function serve(site, url = site.url) {
    print({ url });
    try {
      if (!signal.aborted) await new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
    } finally {
      await site.close();
    }
  }
  function result(record) {
    print(record);
    if (record.status !== 'completed') process.exitCode = record.status === 'cancelled' ? 130 : 1;
  }
  switch (cmd) {
    case 'doctor': {
      const versions = await Promise.all([ffmpeg, ffprobe].map(bin => run(bin, ['-version'], { capture: true })));
      const client = await browser();
      try {
        const page = await client.newPage();
        const graphics = await page.evaluate(() => {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl2');
          return { canvas: Boolean(new OffscreenCanvas(2, 2).getContext('2d')), webgl2: Boolean(gl) };
        });
        print({ node: process.version, ffmpeg: versions[0].toString().split('\n')[0], ffprobe: versions[1].toString().split('\n')[0],
          chromium: client.version(), ...graphics });
        if (!graphics.canvas || !graphics.webgl2) process.exitCode = 1;
      } finally { await client.close(); }
      break;
    }
    case 'init':
      requireInput();
      await init(path.resolve(input), { title: opts.title, fps: integer(Number(opts.fps ?? 24), 'fps', 1, 120),
        frames: integer(Number(opts.frames ?? 144), 'frames', 1) });
      print({ project: path.resolve(input) });
      break;
    case 'freeze': {
      const work = await snapshot();
      print({ revision: work.revision, snapshot: work.root, title: work.manifest.title });
      break;
    }
    case 'play': {
      const work = await snapshot();
      const resolution = scale(1);
      const base = path.join(store, 'play');
      await fs.mkdir(base, { recursive: true });
      const dir = await fs.mkdtemp(path.join(base, 'run-'));
      const { mix } = await loadTool(work, 'audio.mjs');
      const audio = await mix(work, dir, { signal, log: path.join(dir, 'audio.log') });
      const site = await host({ snapshot: work, audio: audio.file, port: port() });
      await serve(site, `${site.url}/?scale=${resolution}`);
      break;
    }
    case 'frame':
    case 'render':
    case 'preview': {
      const work = await snapshot();
      const { manifest: m } = work;
      const marks = cues(m.points, m.spans, m.frames);
      const at = value => /^\d+$/.test(value) ? Number(value) : marks.point(value);
      let from = opts.from == null ? 0 : at(opts.from);
      let to = opts.to == null ? m.frames : at(opts.to);
      if (opts.span) {
        if (opts.from != null || opts.to != null || cmd === 'frame') throw new Error('--span requires a video command without --from or --to');
        [from, to] = marks.span(opts.span);
      }
      if (cmd === 'frame') { from = at(rest[0]); to = from + 1; }
      const { render } = await loadTool(work, 'jobs.mjs');
      result(await render(work, store, { mode: cmd === 'frame' ? 'frame' : 'video', from, to, scale: scale(cmd === 'preview' ? 0.5 : 1) }, { signal, browserFactory: browser }));
      break;
    }
    case 'status': requireInput(); print(await findJob(store, input)); break;
    case 'retry': requireInput(); result(await retry(store, input, { signal, browserFactory: browser })); break;
    case 'review': requireInput(); await serve(await reviewSite(store, [input, ...rest], port())); break;
    case 'observe': requireInput(); print(await observe(store, input, signal)); break;
    case 'sync': {
      requireInput();
      const checks = await sync(store, input, signal);
      print(checks);
      if (!checks.pass) process.exitCode = 1;
      break;
    }
    default: throw new Error(`Unknown command: ${cmd}`);
  }
}
main().catch(error => { console.error(error.stack ?? String(error)); process.exitCode = 1; });
