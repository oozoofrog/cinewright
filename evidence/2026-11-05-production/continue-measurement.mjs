// One-time continuation of the already recorded five measured workers. No repetition is rerun.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { makeCase, stats, disk } from './measure.mjs';
import { toolkit, readJSON, writeJSON, checksum } from '../../scripts/revisions.mjs';

const base = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(base, 'task-5-measurement');
const script = path.join(base, 'measure.mjs');
const resultPath = path.join(base, 'performance.json');
const plan = await readJSON(path.join(base, 'measurement-plan.json'));
const result = await readJSON(resultPath);
const reconciliation = await readJSON(path.join(root, 'audio-abort-reconciliation.json'));
const relative = file => path.relative(toolkit, file);
const now = () => new Date().toISOString();
assert.equal(result.status, 'failed');
assert.equal(result.cases.length, 2);
assert.deepEqual(result.cases.map(item => item.runs.length), [3, 2]);
assert.equal(result.planSha256, await checksum(path.join(base, 'measurement-plan.json')));
assert.equal(result.measurementCodeSha256, await checksum(path.join(root, 'measure-initial.mjs')));
assert.equal(reconciliation.rawResultSha256, await checksum(path.join(root, 'runs/reused-24-r2/result.json')));
assert.equal(reconciliation.readbacksVerified, 25);
for (const [file, expected] of Object.entries(result.sourceHashes)) assert.equal(await checksum(path.join(toolkit, file)), expected);
process.env.TMPDIR = path.join(root, 'tmp', 'continuation');
await fs.mkdir(process.env.TMPDIR); // refuse a second continuation invocation

function summarize(record, measured) {
  record.result = relative(path.join(root, 'runs', `${measured.case}-r${measured.repetition}`, 'result.json'));
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
  record.audioRequestAborts = measured.browserEvents.filter(value => value.kind === 'requestfailed'
    && new URL(value.url).pathname === '/audio.wav' && value.error?.errorText === 'net::ERR_ABORTED');
}

const reconciledRecord = result.cases[1].runs[1];
summarize(reconciledRecord, await readJSON(path.join(root, 'runs/reused-24-r2/result.json')));
reconciledRecord.status = 'measured-with-recorded-audio-abort';
reconciledRecord.rawStatus = 'failed';
reconciledRecord.reconciliation = relative(path.join(root, 'audio-abort-reconciliation.json'));
result.continuation = { startedAt: now(), coordinatorPid: process.pid, coordinatorMemoryExcluded: true,
  reason: 'Post-measurement audio request guard interrupted original coordinator. All five completed measurements retained; execute only four missing workers.',
  originalPerformance: relative(path.join(root, 'performance-interrupted.json')), reconciliation: reconciledRecord.reconciliation,
  command: [process.execPath, fileURLToPath(import.meta.url)],
  code: { firstFive: { path: relative(path.join(root, 'measure-initial.mjs')), sha256: result.measurementCodeSha256 },
    remainingFour: { path: relative(script), sha256: await checksum(script) },
    continuation: { path: relative(fileURLToPath(import.meta.url)), sha256: await checksum(fileURLToPath(import.meta.url)) } },
  changes: 'Only post-timing audio-abort classification and import entry guard changed; fixture generation, timers, readback, indices and sampling are unchanged.' };
result.status = 'continuing';
await writeJSON(resultPath, result);

try {
  for (const casePlan of plan.cases) {
    let current = result.cases.find(item => item.id === casePlan.id);
    if (!current) { current = await makeCase(casePlan); result.cases.push(current); await writeJSON(resultPath, result); }
    for (let repetition = current.runs.length + 1; repetition <= plan.repetitions; repetition++) {
      const name = `${casePlan.id}-r${repetition}`;
      const tmpdir = path.join(root, 'tmp', name);
      const runDirectory = path.join(root, 'runs', name);
      await fs.mkdir(tmpdir); await fs.mkdir(runDirectory); await fs.mkdir(path.join(runDirectory, 'readbacks'));
      const configPath = path.join(runDirectory, 'config.json');
      await fs.writeFile(configPath, JSON.stringify({ id: casePlan.id, repetition, store: current.store, revision: current.revision,
        audioFile: current.audioFile, fixture: current.fixture, tmpdir, runDirectory, casePlan }, null, 2) + '\n', { flag: 'wx' });
      const record = { repetition, directory: relative(runDirectory), startedAt: now(), status: 'running' };
      current.runs.push(record); await writeJSON(resultPath, result);
      const stdout = await fs.open(path.join(runDirectory, 'stdout.log'), 'wx');
      const stderr = await fs.open(path.join(runDirectory, 'stderr.log'), 'wx');
      let spawnError;
      const child = spawn(process.execPath, [script, '--worker', configPath], { cwd: toolkit,
        env: { ...process.env, TMPDIR: tmpdir, DEBUG: 'pw:browser' }, stdio: ['ignore', stdout.fd, stderr.fd] });
      child.once('error', error => { spawnError = error; });
      const exit = await new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
      await stdout.close(); await stderr.close();
      Object.assign(record, { pid: child.pid, ...exit, finishedAt: now(), status: exit.code === 0 ? 'completed' : 'failed' });
      await fs.writeFile(path.join(runDirectory, 'process.json'), JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
      await writeJSON(resultPath, result);
      if (spawnError) throw spawnError;
      assert.equal(exit.code, 0, `${name} failed; preserve records and reconcile before any further execution`);
      const measured = await readJSON(path.join(runDirectory, 'result.json'));
      assert.equal(measured.status, 'completed');
      summarize(record, measured);
      console.log(JSON.stringify({ case: current.id, repetition, navigationToReadyMs: record.navigationToReadyMs,
        navigationToFirstFrameReadbackMs: record.navigationToFirstFrameReadbackMs,
        seekMediansMs: Object.fromEntries(Object.entries(record.seekSummariesMs).map(([group, value]) => [group, value.median])),
        audioRequestAborts: record.audioRequestAborts.length }));
      await writeJSON(resultPath, result);
    }
    current.summary = {};
    for (const metric of ['navigationToReadyMs', 'navigationToFirstFrameReadbackMs', 'browserLaunchMs',
      'nodeSampledMaximumKiB', 'browserSampledMaximumSumKiB', 'temporarySampledMaximumLogicalBytes'])
      current.summary[metric] = stats(current.runs.map(run => run[metric]));
    current.summary.perRunSeekMediansMs = Object.fromEntries(plan.timing.seekGroups.map(group =>
      [group, stats(current.runs.map(run => run.seekSummariesMs[group].median))]));
    await writeJSON(resultPath, result);
  }
  for (const [file, expected] of Object.entries(result.sourceHashes)) assert.equal(await checksum(path.join(toolkit, file)), expected);
  assert.deepEqual(result.cases.map(item => item.runs.length), [3, 3, 3]);
  assert.equal(new Set(result.cases.flatMap(item => item.runs.map(run => run.pid))).size, 9);
  result.status = 'measured-with-recorded-interruption';
} catch (error) {
  result.status = 'failed'; result.failures.push({ at: now(), continuation: true, error: error.stack ?? String(error) });
  throw error;
} finally {
  result.continuation.finishedAt = now(); result.finishedAt = now();
  result.measurementDirectory = await disk(root);
  await writeJSON(resultPath, result);
}
