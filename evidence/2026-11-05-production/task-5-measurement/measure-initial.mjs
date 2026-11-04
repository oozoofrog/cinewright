// This task's bounded measurement only. It does not add a public command or QA framework.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { compileCuts } from '../../modules/cuts.mjs';
import { freeze, openRevision, loadTool, toolkit, readJSON, writeJSON, checksum } from '../../scripts/revisions.mjs';

const evidence = path.dirname(fileURLToPath(import.meta.url));
const script = fileURLToPath(import.meta.url);
const planPath = path.join(evidence, 'measurement-plan.json');
const outputPath = path.join(evidence, 'performance.json');
const root = path.join(evidence, 'task-5-measurement');
const plan = await readJSON(planPath);
const digest = data => createHash('sha256').update(data).digest('hex');
const now = () => new Date().toISOString();
const relative = target => path.relative(toolkit, target);
const stats = values => {
  const sorted = [...values].sort((a, b) => a - b);
  return { n: values.length, min: sorted[0], median: (sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2,
    max: sorted.at(-1), mean: values.reduce((a, b) => a + b, 0) / values.length };
};

async function exclusiveJSON(file, value) {
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
}

// lstat avoids following Chromium's profile symlinks. Live profile walks are non-atomic.
async function disk(directory) {
  const result = { path: relative(directory), regularFiles: 0, logicalBytes: 0, directories: 0,
    symlinks: 0, specialFiles: 0, vanishedDuringWalk: 0, errors: [] };
  async function visit(file) {
    let stat;
    try { stat = await fs.lstat(file); }
    catch (error) {
      if (error.code === 'ENOENT') { result.vanishedDuringWalk++; return; }
      result.errors.push({ path: relative(file), code: error.code }); return;
    }
    if (stat.isSymbolicLink()) { result.symlinks++; return; }
    if (stat.isFile()) { result.regularFiles++; result.logicalBytes += stat.size; return; }
    if (!stat.isDirectory()) { result.specialFiles++; return; }
    result.directories++;
    let names;
    try { names = await fs.readdir(file); }
    catch (error) {
      if (error.code === 'ENOENT') result.vanishedDuringWalk++;
      else result.errors.push({ path: relative(file), code: error.code });
      return;
    }
    for (const name of names.sort()) await visit(path.join(file, name));
  }
  await visit(directory);
  return result;
}

async function command(executable, args, options = {}) {
  const child = spawn(executable, args, { cwd: toolkit, env: options.env ?? process.env,
    stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '', spawnError;
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  child.on('error', error => { spawnError = error; });
  const status = await new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
  const result = { command: [executable, ...args], pid: child.pid, ...status, stdout, stderr,
    error: spawnError?.stack };
  if (options.log) await exclusiveJSON(options.log, result);
  if (spawnError) throw spawnError;
  assert.equal(status.code, 0, `${path.basename(executable)} failed: ${stderr}`);
  return result;
}

async function rss() {
  const sampledAt = now();
  const raw = await command('/bin/ps', ['-axo', 'pid=,ppid=,rss=,comm=']);
  const rows = raw.stdout.trim().split('\n').map(line => {
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/);
    return match && { pid: +match[1], ppid: +match[2], rssKiB: +match[3], executable: path.basename(match[4]) };
  }).filter(Boolean);
  const scoped = new Set([process.pid]);
  for (let changed = true; changed;) {
    changed = false;
    for (const row of rows) if (scoped.has(row.ppid) && !scoped.has(row.pid)) { scoped.add(row.pid); changed = true; }
  }
  const node = rows.find(row => row.pid === process.pid);
  assert.ok(node, 'Node worker PID must be visible in RSS snapshot');
  const children = rows.filter(row => scoped.has(row.pid) && row.pid !== process.pid && row.pid !== raw.pid);
  const browser = children.filter(row => /chrome|chromium/i.test(row.executable));
  const otherDescendants = children.filter(row => !browser.includes(row));
  return { sampledAt, node, browser, browserSumKiB: browser.reduce((sum, row) => sum + row.rssKiB, 0),
    otherDescendants, excludedSamplerPid: raw.pid, unit: 'KiB', scope: 'fresh worker and current browser descendants' };
}

async function worker(configPath) {
  const config = await readJSON(configPath);
  const { id, repetition, store, revision, audioFile, fixture, tmpdir, runDirectory, casePlan } = config;
  assert.equal(process.env.TMPDIR, tmpdir);
  const resultFile = path.join(runDirectory, 'result.json');
  const result = { case: id, repetition, status: 'running', startedAt: now(), nodePid: process.pid,
    tmpdir: relative(tmpdir), revision, stages: [], seeks: {}, browserEvents: [], assetRequests: [],
    command: [process.execPath, script, '--worker', configPath] };
  await exclusiveJSON(resultFile, result);
  const eventsFile = path.join(runDirectory, 'browser-events.jsonl');
  await fs.writeFile(eventsFile, '', { flag: 'wx' });
  const pendingEvents = [];
  function event(kind, detail) {
    const item = { at: now(), kind, ...detail };
    result.browserEvents.push(item);
    pendingEvents.push(fs.appendFile(eventsFile, JSON.stringify(item) + '\n'));
  }
  const scopes = { fixture, store, audio: path.dirname(audioFile), temporary: tmpdir, run: runDirectory };
  async function sample(stage) {
    const memory = await rss();
    const files = {};
    for (const [name, directory] of Object.entries(scopes)) files[name] = await disk(directory);
    const snapshot = { stage, rss: memory, disk: files,
      scopedLogicalBytes: Object.values(files).reduce((sum, value) => sum + value.logicalBytes, 0) };
    result.stages.push(snapshot);
    await writeJSON(resultFile, result);
    console.log(JSON.stringify({ case: id, repetition, stage, nodeKiB: memory.node.rssKiB,
      browserKiB: memory.browserSumKiB, temporaryBytes: files.temporary.logicalBytes }));
  }
  async function retainReadback(value, name, expectedFrame) {
    assert.equal(value.failure, undefined);
    assert.equal(value.state.frame, expectedFrame);
    assert.deepEqual(value.canvas, plan.size);
    const expectedArt = `art-${String(Math.floor(expectedFrame / plan.framesPerCut) % casePlan.uniqueAssets).padStart(2, '0')}`;
    assert.equal(value.state.exposures.artwork.value, expectedArt);
    assert.equal(value.state.exposures.artwork.frame, expectedFrame);
    assert.match(value.png, /^data:image\/png;base64,/);
    const png = Buffer.from(value.png.slice(value.png.indexOf(',') + 1), 'base64');
    assert.equal(png.readUInt32BE(16), plan.size[0]);
    assert.equal(png.readUInt32BE(20), plan.size[1]);
    const target = path.join(runDirectory, 'readbacks', `${name}.png`);
    await fs.writeFile(target, png, { flag: 'wx' });
    return { state: value.state, canvas: value.canvas, image: relative(target), pngBytes: png.length, sha256: digest(png) };
  }
  let server, client, page, failure;
  try {
    const snapshot = await openRevision(store, revision);
    assert.deepEqual(snapshot.manifest.size, plan.size);
    assert.equal(snapshot.manifest.frames, casePlan.frames);
    const serverTool = await loadTool(snapshot, 'server.mjs');
    const execution = await loadTool(snapshot, 'execution.mjs');
    server = await serverTool.host({ snapshot, audio: audioFile });
    result.url = server.url;
    result.browserExecutable = execution.chrome;
    await sample('beforeBrowser');
    const launchStart = performance.now();
    client = await execution.browser();
    result.browserLaunchMs = performance.now() - launchStart;
    result.browserVersion = client.version();
    await sample('browserLaunched');
    page = await client.newPage({ viewport: { width: 640, height: 480 }, deviceScaleFactor: 1 });
    page.on('console', message => event('console', { type: message.type(), text: message.text() }));
    page.on('pageerror', error => event('pageerror', { error: error.stack ?? String(error) }));
    page.on('requestfailed', request => event('requestfailed', { url: request.url(), error: request.failure() }));
    page.on('response', response => { if (response.status() >= 400) event('http-error', { url: response.url(), status: response.status() }); });
    const requestedAssets = new Set();
    page.on('request', request => { const route = new URL(request.url()).pathname;
      if (route.startsWith('/project/assets/')) requestedAssets.add(route); });
    const navigationStart = performance.now();
    await page.goto(`${server.url}/?scale=1&muted=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.failure || window.direction?.status().frame === 0, undefined, { timeout: 30000 });
    result.navigationToReadyMs = performance.now() - navigationStart;
    const first = await page.evaluate(() => ({ failure: window.failure, state: window.direction?.status().last,
      canvas: [document.getElementById('picture').width, document.getElementById('picture').height],
      png: document.getElementById('picture').toDataURL('image/png') }));
    result.navigationToFirstFrameReadbackMs = performance.now() - navigationStart;
    result.firstFrame = await retainReadback(first, 'first-frame-0', 0);
    result.assetRequests = [...requestedAssets].sort();
    assert.equal(result.assetRequests.length, casePlan.uniqueAssets);
    assert.equal(await page.evaluate(() => fetch('/revision').then(response => response.text())), revision);
    await sample('firstFrame0');
    for (const group of plan.timing.seekGroups) {
      result.seeks[group] = [];
      for (const [index, frame] of casePlan[group].entries()) {
        const start = performance.now();
        const value = await page.evaluate(frame => ({ state: window.direction.seek(frame),
          png: document.getElementById('picture').toDataURL('image/png'), failure: window.failure,
          canvas: [document.getElementById('picture').width, document.getElementById('picture').height] }), frame);
        const elapsedMs = performance.now() - start;
        const returned = await retainReadback(value, `${group}-${index}-${frame}`, frame);
        result.seeks[group].push({ requestedFrame: frame, elapsedMs, ...returned });
      }
      await sample(`after${group[0].toUpperCase()}${group.slice(1)}`);
    }
    result.seekSummariesMs = Object.fromEntries(Object.entries(result.seeks).map(([group, values]) =>
      [group, stats(values.map(value => value.elapsedMs))]));
    assert.deepEqual(result.browserEvents.filter(value => ['pageerror', 'requestfailed', 'http-error'].includes(value.kind)), []);
    result.status = 'measured';
  } catch (error) {
    failure = error;
    result.status = 'failed';
    result.error = error.stack ?? String(error);
  } finally {
    try { await page?.close(); await client?.close(); await server?.close(); }
    catch (error) { failure ??= error; result.status = 'failed'; result.cleanupError = error.stack ?? String(error); }
    await Promise.allSettled(pendingEvents);
    try {
      await sample('afterBrowserClose');
      assert.equal(result.stages.at(-1).rss.browser.length, 0, 'Owned browser descendants still present after close');
    } catch (error) { failure ??= error; result.status = 'failed'; result.finalSampleError = error.stack ?? String(error); }
    result.finishedAt = now();
    if (!failure) result.status = 'completed';
    await writeJSON(resultFile, result);
  }
  if (failure) throw failure;
}

async function makeCase(casePlan) {
  const fixture = path.join(root, 'fixtures', casePlan.id);
  const store = path.join(root, 'stores', casePlan.id);
  const audioDirectory = path.join(root, 'audio', casePlan.id);
  for (const directory of [path.join(fixture, 'assets'), path.join(fixture, 'modules'), store, audioDirectory])
    await fs.mkdir(directory, { recursive: true });
  for (const name of ['cuts.mjs', 'artwork.mjs']) await fs.copyFile(path.join(toolkit, 'modules', name), path.join(fixture, 'modules', name));
  const artworks = {};
  for (let index = 0; index < casePlan.uniqueAssets; index++) {
    const name = `art-${String(index).padStart(2, '0')}`;
    const color = ((0x204060 + index * 0x07130b) & 0xffffff).toString(16).padStart(6, '0');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="36" viewBox="0 0 64 36"><rect width="64" height="36" fill="#${color}"/><circle cx="18" cy="18" r="10" fill="#ecd8ad"/><rect x="38" y="10" width="16" height="16" fill="#d17652"/></svg>\n`;
    await fs.writeFile(path.join(fixture, 'assets', `${name}.svg`), svg, { flag: 'wx' });
    artworks[name] = { asset: `assets/${name}.svg`, placement: { fit: 'contain' } };
  }
  const source = { frames: casePlan.frames, artworks,
    boundaries: Array.from({ length: casePlan.cuts + 1 }, (_, index) => ({ name: `edge-${index}`, frame: index * plan.framesPerCut })),
    cuts: Array.from({ length: casePlan.cuts }, (_, index) => ({ name: `cut-${index}`, from: `edge-${index}`,
      to: `edge-${index + 1}`, every: plan.every, artwork: `art-${String(index % casePlan.uniqueAssets).padStart(2, '0')}` })) };
  const compiled = compileCuts(source);
  const work = { version: 1, title: `성능 측정 ${casePlan.id}`, size: plan.size, fps: plan.fps, frames: casePlan.frames,
    background: '#101016', points: compiled.points, spans: compiled.spans, audio: [],
    layers: [{ id: 'artwork', module: 'modules/artwork.mjs', exposure: compiled.exposure, config: { artworks } }] };
  await exclusiveJSON(path.join(fixture, 'source.json'), source);
  await exclusiveJSON(path.join(fixture, 'work.json'), work);
  const actualWork = await readJSON(path.join(fixture, 'work.json'));
  const actualSource = await readJSON(path.join(fixture, 'source.json'));
  const files = [...new Set(Object.values(actualWork.layers[0].config.artworks).map(value => value.asset))];
  const assetFiles = [];
  for (const file of files) assetFiles.push({ file, bytes: (await fs.stat(path.join(fixture, file))).size,
    sha256: await checksum(path.join(fixture, file)), uses: actualSource.cuts.filter(cut => artworks[cut.artwork].asset === file).length });
  const counts = { cuts: actualSource.cuts.length, frames: actualWork.frames, fps: actualWork.fps, size: actualWork.size,
    assetReferences: actualSource.cuts.length, uniqueFiles: files.length, uniqueContents: new Set(assetFiles.map(file => file.sha256)).size,
    reuseReferences: actualSource.cuts.length - files.length, assetLogicalBytes: assetFiles.reduce((sum, file) => sum + file.bytes, 0) };
  assert.equal(counts.cuts, casePlan.cuts); assert.equal(counts.frames, casePlan.frames);
  assert.equal(counts.uniqueFiles, casePlan.uniqueAssets); assert.equal(counts.uniqueContents, casePlan.uniqueAssets);
  const preparation = { fixtureGenerated: await disk(fixture) };
  const freezeStart = performance.now();
  const snapshot = await freeze(fixture, store);
  const freezeMs = performance.now() - freezeStart;
  preparation.afterFreeze = await disk(store);
  const audioTool = await loadTool(snapshot, 'audio.mjs');
  const audioStart = performance.now();
  const mixed = await audioTool.mix(snapshot, audioDirectory, { log: path.join(audioDirectory, 'mix.log') });
  const audioMixMs = performance.now() - audioStart;
  preparation.afterMix = await disk(audioDirectory);
  return { id: casePlan.id, fixture, store, audioFile: mixed.file, revision: snapshot.revision,
    counts, assetFiles, freezeMs, audioMixMs, preparation, runs: [] };
}

async function coordinator() {
  assert.deepEqual(plan.caseOrder, plan.cases.map(value => value.id));
  assert.equal(plan.repetitions, 3); assert.equal(plan.cases.length, 3);
  for (const item of plan.cases) for (const group of plan.timing.seekGroups) {
    assert.equal(item[group].length, 8);
    for (const frame of item[group]) assert.ok(Number.isInteger(frame) && frame >= 0 && frame < item.frames);
  }
  // Refuse to reuse an existing directory or output; this script never retries itself.
  await fs.mkdir(root);
  process.env.TMPDIR = path.join(root, 'tmp', 'coordinator');
  await fs.mkdir(process.env.TMPDIR, { recursive: true });
  await fs.mkdir(path.join(root, 'runs'));
  const result = { schema: 1, status: 'preparing', startedAt: now(), plan: relative(planPath), planSha256: await checksum(planPath),
    measurementCodeSha256: await checksum(script), scope: plan, coordinatorPid: process.pid,
    coordinatorMemoryExcluded: true, sourceHead: null, versions: {}, cases: [], failures: [],
    claims: { peakMemory: false, uniquePhysicalRAM: false, coldOSCache: false, scalability: false, wholeVideoRendered: false,
      physicalDisplayPresentationMeasured: false, finalAcceptance: false } };
  await exclusiveJSON(outputPath, result);
  try {
    const git = await command('git', ['rev-parse', 'HEAD'], { log: path.join(root, 'git-head.json') });
    result.sourceHead = git.stdout.trim();
    await command('git', ['status', '--short'], { log: path.join(root, 'git-status-before.json') });
    const ffmpeg = await command(process.env.DIRECTION_FFMPEG || 'ffmpeg', ['-version'], { log: path.join(root, 'ffmpeg-version.json') });
    const sw = await command('/usr/bin/sw_vers', [], { log: path.join(root, 'host-version.json') });
    result.versions = { node: process.version, v8: process.versions.v8,
      playwrightCore: (await readJSON(path.join(toolkit, 'node_modules/playwright-core/package.json'))).version,
      three: (await readJSON(path.join(toolkit, 'node_modules/three/package.json'))).version,
      ffmpeg: ffmpeg.stdout.split('\n')[0], os: { platform: os.platform(), release: os.release(), version: os.version(),
        arch: os.arch(), cpuModel: os.cpus()[0].model, logicalCPUs: os.cpus().length, totalMemoryBytes: os.totalmem(), swVers: sw.stdout.trim() } };
    result.sourceHashes = {};
    for (const file of ['modules/cuts.mjs', 'modules/artwork.mjs', 'runtime/compositor.mjs', 'runtime/player.mjs',
      'runtime/timeline.mjs', 'scripts/revisions.mjs', 'scripts/server.mjs', 'scripts/execution.mjs', 'scripts/audio.mjs', 'package-lock.json'])
      result.sourceHashes[file] = await checksum(path.join(toolkit, file));
    for (const casePlan of plan.cases) {
      const current = await makeCase(casePlan);
      result.cases.push(current);
      result.status = 'measuring';
      await writeJSON(outputPath, result);
      for (let repetition = 1; repetition <= plan.repetitions; repetition++) {
        const name = `${casePlan.id}-r${repetition}`;
        const tmpdir = path.join(root, 'tmp', name);
        const runDirectory = path.join(root, 'runs', name);
        await fs.mkdir(tmpdir); await fs.mkdir(path.join(runDirectory, 'readbacks'), { recursive: true });
        const configPath = path.join(runDirectory, 'config.json');
        await exclusiveJSON(configPath, { id: casePlan.id, repetition, store: current.store, revision: current.revision,
          audioFile: current.audioFile, fixture: current.fixture, tmpdir, runDirectory, casePlan });
        const record = { repetition, directory: relative(runDirectory), startedAt: now(), status: 'running' };
        current.runs.push(record); await writeJSON(outputPath, result);
        const stdout = await fs.open(path.join(runDirectory, 'stdout.log'), 'wx');
        const stderr = await fs.open(path.join(runDirectory, 'stderr.log'), 'wx');
        let spawnError;
        const child = spawn(process.execPath, [script, '--worker', configPath], { cwd: toolkit,
          env: { ...process.env, TMPDIR: tmpdir, DEBUG: 'pw:browser' }, stdio: ['ignore', stdout.fd, stderr.fd] });
        child.once('error', error => { spawnError = error; });
        const exit = await new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
        await stdout.close(); await stderr.close();
        Object.assign(record, { pid: child.pid, ...exit, finishedAt: now(), status: exit.code === 0 ? 'completed' : 'failed' });
        await exclusiveJSON(path.join(runDirectory, 'process.json'), record);
        await writeJSON(outputPath, result);
        if (spawnError) throw spawnError;
        assert.equal(exit.code, 0, `${name} failed; full logs are in ${runDirectory}`);
        const measured = await readJSON(path.join(runDirectory, 'result.json'));
        assert.equal(measured.status, 'completed');
        record.result = relative(path.join(runDirectory, 'result.json'));
        record.browserVersion = measured.browserVersion;
        record.navigationToReadyMs = measured.navigationToReadyMs;
        record.navigationToFirstFrameReadbackMs = measured.navigationToFirstFrameReadbackMs;
        record.browserLaunchMs = measured.browserLaunchMs;
        record.seekSummariesMs = measured.seekSummariesMs;
        record.nodeSampledMaximumKiB = Math.max(...measured.stages.map(stage => stage.rss.node.rssKiB));
        record.browserSampledMaximumSumKiB = Math.max(...measured.stages.map(stage => stage.rss.browserSumKiB));
        record.temporarySampledMaximumLogicalBytes = Math.max(...measured.stages.map(stage => stage.disk.temporary.logicalBytes));
        record.temporaryAfterCloseLogicalBytes = measured.stages.at(-1).disk.temporary.logicalBytes;
        record.scopeDiskAfterClose = measured.stages.at(-1).disk;
        console.log(JSON.stringify({ case: current.id, repetition, navigationToReadyMs: record.navigationToReadyMs,
          navigationToFirstFrameReadbackMs: record.navigationToFirstFrameReadbackMs,
          seekMediansMs: Object.fromEntries(Object.entries(record.seekSummariesMs).map(([name, value]) => [name, value.median])),
          nodeSampledMaximumKiB: record.nodeSampledMaximumKiB, browserSampledMaximumSumKiB: record.browserSampledMaximumSumKiB }));
        await writeJSON(outputPath, result);
      }
      current.summary = {};
      for (const name of ['navigationToReadyMs', 'navigationToFirstFrameReadbackMs', 'browserLaunchMs',
        'nodeSampledMaximumKiB', 'browserSampledMaximumSumKiB', 'temporarySampledMaximumLogicalBytes'])
        current.summary[name] = stats(current.runs.map(run => run[name]));
      current.summary.perRunSeekMediansMs = Object.fromEntries(plan.timing.seekGroups.map(group =>
        [group, stats(current.runs.map(run => run.seekSummariesMs[group].median))]));
      await writeJSON(outputPath, result);
    }
    for (const [file, expected] of Object.entries(result.sourceHashes))
      assert.equal(await checksum(path.join(toolkit, file)), expected, `Source changed during measurement: ${file}`);
    result.status = 'completed';
  } catch (error) {
    result.status = 'failed'; result.failures.push({ at: now(), error: error.stack ?? String(error) });
    throw error;
  } finally {
    result.finishedAt = now();
    result.measurementDirectory = await disk(root);
    await writeJSON(outputPath, result);
  }
}

if (process.argv[2] === '--worker') await worker(process.argv[3]);
else { assert.equal(process.argv.length, 2, 'Only this task coordinator or its declared worker invocation is supported'); await coordinator(); }
