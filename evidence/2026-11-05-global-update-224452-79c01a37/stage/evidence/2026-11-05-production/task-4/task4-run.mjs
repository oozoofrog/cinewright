import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { toolkit } from '../../../scripts/revisions.mjs';

const exec = promisify(execFile);

// These paths and checks belong only to the two Task 4 stillcuts output scripts.
export function task4Paths(runId, repository = toolkit) {
  assert.match(runId ?? '', /^[a-z0-9][a-z0-9-]{0,63}$/, 'Supply a fresh Task 4 run ID, e.g. contact-fix-1');
  const store = path.join(repository, '.direction/production');
  const evidence = path.join(repository, 'evidence/2026-11-05-production/task-4/runs', runId);
  const record = path.join(store, 'task-4-runs', runId);
  return { runId, store, evidence, record, tmpdir: path.join(record, 'tmp'),
    inspectionEvidence: path.join(evidence, 'inspection'), inspectionRecord: path.join(record, 'inspection') };
}

async function reserveFresh(directories) {
  // Check both destinations before creating either; any existing partial run also refuses reuse.
  for (const directory of directories) {
    try { await fs.lstat(directory); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    throw new Error(`Refusing existing Task 4 destination: ${directory}`);
  }
  for (const directory of directories) {
    await fs.mkdir(path.dirname(directory), { recursive: true });
    await fs.mkdir(directory); // Exclusive reservation also catches a competing invocation.
  }
}

export async function reserveProduction(paths) {
  await reserveFresh([paths.evidence, paths.record]);
  await fs.mkdir(paths.tmpdir);
}

export async function reserveInspection(paths, outputs) {
  for (const key of ['runId', 'store', 'evidence', 'record', 'tmpdir']) assert.equal(outputs[key], paths[key], `Run ${key} mismatch`);
  assert.equal(outputs.phase, 'completed', 'Inspection requires this run\'s completed outputs');
  await reserveFresh([paths.inspectionEvidence, paths.inspectionRecord]);
}

export async function recordedCommand(evidence, label, executable, args) {
  assert.match(label, /^[a-z0-9-]+$/);
  const logs = path.join(evidence, label);
  await fs.mkdir(logs); // Refuse a repeated command label before starting a subprocess.
  const status = { command: [executable, ...args], tmpdir: process.env.TMPDIR,
    started: new Date().toISOString(), exitCode: null, signal: null };
  let result;
  let failure;
  try {
    result = await exec(executable, args, { cwd: toolkit, maxBuffer: 8 * 1024 * 1024 });
    status.exitCode = 0;
  } catch (error) {
    result = error;
    failure = error;
    status.exitCode = Number.isInteger(error.code) ? error.code : null;
    status.errorCode = typeof error.code === 'string' ? error.code : null;
    status.signal = error.signal ?? null;
    status.error = error.message;
  }
  status.finished = new Date().toISOString();
  await fs.writeFile(path.join(logs, 'stdout'), result.stdout ?? '', { flag: 'wx' });
  await fs.writeFile(path.join(logs, 'stderr'), result.stderr ?? '', { flag: 'wx' });
  await fs.writeFile(path.join(logs, 'status.json'), JSON.stringify(status, null, 2) + '\n', { flag: 'wx' });
  if (failure) throw failure;
  return { ...result, command: status.command, logs };
}

export function assertStillcutsJob(job, snapshot, mode) {
  const work = snapshot.manifest;
  const expected = mode === 'frame' ? [work.points.touch, work.points.touch + 1]
    : mode === 'span' ? work.spans['contact-review'] : [0, work.frames];
  assert.ok(['frame', 'span', 'full'].includes(mode));
  assert.equal(job.status, 'completed');
  assert.equal(job.revision, snapshot.revision);
  assert.equal(job.settings.mode, mode === 'frame' ? 'frame' : 'video');
  assert.equal(job.settings.scale, 1);
  assert.deepEqual([job.settings.from, job.settings.to], expected, `${mode} range must equal the frozen manifest`);
  assert.equal(job.frames, expected[1] - expected[0]);
  return { from: expected[0], to: expected[1], frames: expected[1] - expected[0],
    seconds: (expected[1] - expected[0]) / work.fps };
}

// Playwright evaluates this function on the actual video element.
export async function waitForVideoReady(video, { timeoutMs = 15000 } = {}) {
  if (video.error) throw new Error(`MP4 readiness error: ${video.error.code}`);
  if (video.readyState >= 2) return;
  await new Promise((resolve, reject) => {
    const finish = error => {
      clearTimeout(timer);
      video.removeEventListener('loadeddata', ready);
      video.removeEventListener('error', failed);
      if (error) reject(error); else resolve();
    };
    const ready = () => finish();
    const failed = () => finish(new Error(`MP4 readiness error: ${video.error?.code ?? 'unknown'}`));
    const timer = setTimeout(() => finish(new Error('MP4 readiness timeout')), timeoutMs);
    video.addEventListener('loadeddata', ready, { once: true });
    video.addEventListener('error', failed, { once: true });
    if (video.error) failed(); else if (video.readyState >= 2) ready();
  });
}
