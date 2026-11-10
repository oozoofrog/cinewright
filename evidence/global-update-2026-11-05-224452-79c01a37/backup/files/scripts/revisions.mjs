import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { projectPath, validate } from '../runtime/timeline.mjs';

export const toolkit = fileURLToPath(new URL('..', import.meta.url));
export const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
export async function writeJSON(file, value) {
  const next = `${file}.tmp`;
  await fs.writeFile(next, JSON.stringify(value, null, 2) + '\n');
  await fs.rename(next, file);
}

async function files(root, prefix = '', exclusions = []) {
  const list = [];
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    if (exclusions.includes(entry.name)) continue;
    projectPath(entry.name);
    const name = prefix + entry.name;
    if (entry.isDirectory()) list.push(...await files(path.join(root, entry.name), name + '/', exclusions));
    else if (entry.isFile()) list.push(name);
    else throw new Error(`Only regular files and directories can be frozen: ${name}`);
  }
  return list.sort();
}
export async function checksum(file) {
  const digest = createHash('sha256');
  const stream = (await fs.open(file)).createReadStream();
  for await (const chunk of stream) digest.update(chunk);
  return digest.digest('hex');
}
function identify(entries) {
  return createHash('sha256').update(JSON.stringify(entries)).digest('hex');
}

export async function freeze(project, store) {
  const realProject = await fs.realpath(project);
  const relativeStore = path.relative(realProject, store);
  if (!relativeStore || (!relativeStore.startsWith('..' + path.sep) && relativeStore !== '..' &&
      !path.isAbsolute(relativeStore) && relativeStore.split(path.sep)[0] !== '.direction')) {
    throw new Error('Use an external store or a store inside the project .direction directory');
  }
  const base = path.join(store, 'revisions');
  await fs.mkdir(base, { recursive: true });
  const staging = await fs.mkdtemp(path.join(base, '.staging-'));
  try {
    const groups = [
      [project, 'project', await files(project, '', ['.git', '.direction', '.DS_Store', 'node_modules'])],
      [path.join(toolkit, 'runtime'), 'runtime', await files(path.join(toolkit, 'runtime'))],
      [path.join(toolkit, 'node_modules/three/build'), 'vendor/three', ['three.core.js', 'three.module.js']],
      [path.join(toolkit, 'node_modules/three'), 'vendor/three', ['LICENSE']],
      [toolkit, 'tools', ['package-lock.json']],
      [path.join(toolkit, 'scripts'), 'tools', ['audio.mjs', 'execution.mjs', 'jobs.mjs', 'revisions.mjs', 'server.mjs']],
    ];
    const entries = [];
    for (const [root, prefix, names] of groups) {
      for (const name of names) {
        const relative = `${prefix}/${name}`;
        const target = path.join(staging, relative);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.copyFile(path.join(root, name), target);
        entries.push([relative, await checksum(target)]);
      }
    }
    const revision = identify(entries);
    validate(await readJSON(path.join(staging, 'project/work.json')));
    await writeJSON(path.join(staging, 'revision.json'), { revision, entries });
    try {
      await fs.rename(staging, path.join(base, revision));
    } catch (error) {
      if (!['EEXIST', 'ENOTEMPTY'].includes(error.code)) throw error;
    }
    return await openRevision(store, revision);
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}

export async function openRevision(store, id) {
  if (!/^[a-f0-9]{64}$/.test(id)) throw new Error(`Invalid revision: ${id}`);
  const root = path.join(store, 'revisions', id);
  const { revision, entries } = await readJSON(path.join(root, 'revision.json'));
  if (revision !== id || identify(entries) !== id) throw new Error('Revision index mismatch');
  const paths = new Set();
  for (const [name, digest] of entries) {
    projectPath(name);
    const file = path.join(root, name);
    if (!(await fs.lstat(file)).isFile() || await checksum(file) !== digest) throw new Error(`Revision bytes changed: ${name}`);
    paths.add(name);
  }
  const manifest = validate(await readJSON(path.join(root, 'project/work.json')));
  return { root, revision, manifest, paths };
}

export async function loadTool(snapshot, name) {
  const relative = 'tools/' + projectPath(name);
  if (!snapshot.paths.has(relative)) throw new Error(`Missing revision tool: ${name}`);
  return import(pathToFileURL(path.join(snapshot.root, relative)).href);
}
