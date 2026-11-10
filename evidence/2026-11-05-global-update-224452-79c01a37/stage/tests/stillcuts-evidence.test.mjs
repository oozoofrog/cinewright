import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { browser } from '../scripts/execution.mjs';
import { toolkit } from '../scripts/revisions.mjs';
import { task4Paths, reserveProduction, reserveInspection, recordedCommand, assertStillcutsJob,
  waitForVideoReady } from '../evidence/2026-11-05-production/task-4/task4-run.mjs';

const runs = path.join(toolkit, '.direction/test-runs');
await fs.mkdir(runs, { recursive: true });
const root = await fs.mkdtemp(path.join(runs, 'stillcuts-evidence-'));
process.env.TMPDIR = path.join(root, 'tmp');
await fs.mkdir(process.env.TMPDIR);
console.log(`Stillcuts evidence records: ${root}`);

test('Task 4 refuses completed and partial destinations without changing retained records', async () => {
  const paths = task4Paths('completed', root);
  await reserveProduction(paths);
  const outputs = { ...paths, phase: 'completed', enriched: { keep: true } };
  const original = JSON.stringify(outputs);
  await fs.writeFile(path.join(paths.evidence, 'outputs.json'), original);
  await assert.rejects(reserveProduction(paths), /Refusing existing/);
  assert.equal(await fs.readFile(path.join(paths.evidence, 'outputs.json'), 'utf8'), original);
  await reserveInspection(paths, outputs);
  const receipt = path.join(paths.inspectionEvidence, 'receipt.json');
  await fs.writeFile(receipt, '{"manualReview":"keep"}');
  await assert.rejects(reserveInspection(paths, outputs), /Refusing existing/);
  assert.equal(await fs.readFile(receipt, 'utf8'), '{"manualReview":"keep"}');
  for (const kind of ['evidence', 'record']) {
    const partial = task4Paths(`partial-${kind}`, root);
    await fs.mkdir(partial[kind], { recursive: true });
    await fs.writeFile(path.join(partial[kind], 'retained'), 'partial bytes');
    await assert.rejects(reserveProduction(partial), /Refusing existing/);
    assert.equal(await fs.readFile(path.join(partial[kind], 'retained'), 'utf8'), 'partial bytes');
    await assert.rejects(fs.access(partial[kind === 'evidence' ? 'record' : 'evidence']), { code: 'ENOENT' });
  }
  const partialInspection = task4Paths('partial-inspection', root);
  await reserveProduction(partialInspection);
  await fs.mkdir(partialInspection.inspectionRecord);
  await assert.rejects(reserveInspection(partialInspection, { ...partialInspection, phase: 'completed' }), /Refusing existing/);
  await assert.rejects(fs.access(partialInspection.inspectionEvidence), { code: 'ENOENT' });
});

test('deliberate subprocess failure retains stdout, stderr and status before rejection', async () => {
  const evidence = path.join(root, 'failure-control');
  await fs.mkdir(evidence);
  const args = ['-e', "process.stdout.write('control stdout\\n'); process.stderr.write('control stderr\\n'); process.exit(7)"];
  await assert.rejects(recordedCommand(evidence, 'exit-seven', process.execPath, args), { code: 7 });
  const logs = path.join(evidence, 'exit-seven');
  assert.equal(await fs.readFile(path.join(logs, 'stdout'), 'utf8'), 'control stdout\n');
  assert.equal(await fs.readFile(path.join(logs, 'stderr'), 'utf8'), 'control stderr\n');
  const status = JSON.parse(await fs.readFile(path.join(logs, 'status.json'), 'utf8'));
  assert.equal(status.exitCode, 7);
  assert.equal(status.signal, null);
  assert.equal(status.tmpdir, process.env.TMPDIR);
  assert.deepEqual(status.command, [process.execPath, ...args]);
  await assert.rejects(recordedCommand(evidence, 'exit-seven', process.execPath, ['-e', 'process.exit(0)']), { code: 'EEXIST' });
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(logs, 'status.json'), 'utf8')), status);
});

test('frozen authored bounds reject a same-length wrong span and wrong frame/full ranges', () => {
  const snapshot = { revision: 'fixture', manifest: { frames: 20, fps: 12, points: { touch: 5 }, spans: { 'contact-review': [3, 11] } } };
  const job = (mode, from, to) => ({ revision: 'fixture', status: 'completed', frames: to - from,
    settings: { mode, from, to, scale: 1 } });
  assert.deepEqual(assertStillcutsJob(job('video', 3, 11), snapshot, 'span'), { from: 3, to: 11, frames: 8, seconds: 8 / 12 });
  assert.equal(assertStillcutsJob(job('frame', 5, 6), snapshot, 'frame').frames, 1);
  assert.equal(assertStillcutsJob(job('video', 0, 20), snapshot, 'full').frames, 20);
  assert.throws(() => assertStillcutsJob(job('video', 4, 12), snapshot, 'span'), /range must equal the frozen manifest/);
  assert.throws(() => assertStillcutsJob(job('frame', 6, 7), snapshot, 'frame'), /range must equal the frozen manifest/);
  assert.throws(() => assertStillcutsJob(job('video', 1, 20), snapshot, 'full'), /range must equal the frozen manifest/);
});

test('actual video readiness has bounded timeout and media-error paths', { timeout: 15000 }, async t => {
  const client = await browser();
  t.after(() => client.close());
  const page = await client.newPage();
  await page.setContent('<video></video>');
  const video = page.locator('video');
  await assert.rejects(video.evaluate(waitForVideoReady, { timeoutMs: 80 }), /MP4 readiness timeout/);
  await video.evaluate(video => { video.src = 'data:video/mp4;base64,AAAA'; video.load(); });
  await assert.rejects(video.evaluate(waitForVideoReady, { timeoutMs: 2000 }), /MP4 readiness error/);
});
