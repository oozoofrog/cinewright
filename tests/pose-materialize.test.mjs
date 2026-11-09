import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {materializeKit} from '../scripts/materialize-kit.mjs';

test('pose-tracks public materialization closes imports and preserves authored and unrelated files', async () => {
  const project=await fs.mkdtemp(path.join(os.tmpdir(),'pose-kit-'));
  try {
    await fs.writeFile(path.join(project,'keep.txt'),'authored');
    const first=await materializeKit({project,modules:['pose-tracks']});
    assert.deepEqual(first.modules,['motion','pose-tracks']);
    assert.deepEqual(first.files.map(f=>f.file),['modules/motion.mjs','modules/animation/pose-tracks.mjs']);
    for(const f of first.files) assert.deepEqual(await fs.readFile(path.join(project,f.file)),await fs.readFile(new URL('../'+f.file,import.meta.url)));
    const {prepareTrack}=await import(pathToFileURL(path.join(project,'modules/animation/pose-tracks.mjs')));
    assert.deepEqual(prepareTrack([{frame:0,value:[0,0],interpolation:'linear'},{frame:10,value:[10,20]}]).at(5),[5,10]);
    const ledger=await fs.readFile(path.join(project,'.cinewright-kit.json'));
    assert.deepEqual(await materializeKit({project,modules:['pose-tracks']}),first);
    assert.deepEqual(await fs.readFile(path.join(project,'.cinewright-kit.json')),ledger);
    for(const file of ['modules/motion.mjs','modules/animation/pose-tracks.mjs']) {
      const original=await fs.readFile(path.join(project,file));
      await fs.appendFile(path.join(project,file),'\n// authored\n');
      await assert.rejects(materializeKit({project,modules:['pose-tracks']}),/authored\/unknown/);
      assert.match(await fs.readFile(path.join(project,file),'utf8'),/authored/);
      assert.deepEqual(await fs.readFile(path.join(project,'.cinewright-kit.json')),ledger);
      await fs.writeFile(path.join(project,file),original);
    }
    assert.equal(await fs.readFile(path.join(project,'keep.txt'),'utf8'),'authored');
    assert.deepEqual((await fs.readdir(project)).sort(),['.cinewright-kit.json','keep.txt','modules']);
  } finally {await fs.rm(project,{recursive:true,force:true});}
});
