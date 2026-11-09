import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const authoring=new URL('../.direction/productions/music-box-dancer-redesign-20261108/intro-16/authoring/',import.meta.url);
const available=await fs.access(new URL('craft-selection.mjs',authoring)).then(()=>true,()=>false);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
test('craft selected frozen job rejects stale records, escaped outputs and stale landmarks before consumption', {skip:!available}, async()=>{
 const {selectJob,argumentsFor,freshLabel,freshPaths,assertLandmarks,baselineRevision,baselineJob}=await import(new URL('craft-selection.mjs',authoring));
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'craft-bind-')));
 try {
  assert.throws(()=>argumentsFor([]),/Usage/);assert.throws(()=>argumentsFor(['../r2']),/label/);
  assert.deepEqual(argumentsFor(['r3','new-report']),{selected:'r3',report:'new-report'});
  const manifest=JSON.stringify({version:1,title:'fixture',size:[16,16],fps:24,frames:384,layers:[{id:"fixture",module:"model.mjs"}]});
  const model='export const pose=()=>"frozen";';
  const entries=[['project/work.json',hash(manifest)],['project/model.mjs',hash(model)]];
  const revision=hash(JSON.stringify(entries));const rev=path.join(root,'store/revisions',revision);
  await fs.mkdir(path.join(rev,'project'),{recursive:true});
  await fs.writeFile(path.join(rev,'project/work.json'),manifest);await fs.writeFile(path.join(rev,'project/model.mjs'),model);
  await fs.writeFile(path.join(rev,'revision.json'),JSON.stringify({revision,entries}));
  const dir=path.join(root,'store/jobs/test-job');await fs.mkdir(dir,{recursive:true});
  const output=path.join(dir,'work.mp4');await fs.writeFile(output,'test-owned fixture, not video evidence');
  const job={id:'test-job',revision,status:'completed',frames:384,settings:{mode:'video',from:0,to:384,scale:1},output,outputSha256:'fixture'};
  await fs.writeFile(path.join(dir,'job.json'),JSON.stringify(job));await fs.mkdir(path.join(root,'reports'));
  const report=path.join(root,'reports/r3-job.json');await fs.writeFile(report,JSON.stringify(job));
  const selected=await selectJob(root,'r3');assert.equal(selected.job.id,job.id);
  await fs.mkdir(path.join(root,'project'));await fs.writeFile(path.join(root,'project/model.mjs'),'throw Error("mutable must not load")');
  assert.equal((await import(pathToFileURL(path.join(selected.snapshot.root,'project/model.mjs')))).pose(),'frozen');
  await assert.rejects(freshLabel(root,'r3'),/already exists/);await assert.rejects(freshPaths([report]),/overwrite/);
  await freshLabel(root,'fresh');
  const landmarks={revision,job:job.id,baselineRevision,baselineJob,rows:Array.from({length:384},(_,frame)=>({frame}))};
  assertLandmarks(landmarks,job);
  for(const change of [{revision:'0'.repeat(64)},{job:'stale'},{baselineRevision:'stale'},{rows:[{frame:3}]}]) assert.throws(()=>assertLandmarks({...landmarks,...change},job),/mismatch/);
  await fs.writeFile(report,JSON.stringify({...job,revision:'0'.repeat(64)}));await assert.rejects(selectJob(root,'r3'),/mismatch/);
  await fs.writeFile(report,JSON.stringify(job));
  await fs.writeFile(path.join(dir,'job.json'),JSON.stringify({...job,output:path.join(root,'elsewhere.mp4')}));await assert.rejects(selectJob(root,'r3'),/outside/);
  await fs.writeFile(path.join(dir,'job.json'),JSON.stringify(job));await fs.appendFile(path.join(rev,'project/model.mjs'),'// changed');await assert.rejects(selectJob(root,'r3'),/bytes changed/);
 } finally {await fs.rm(root,{recursive:true,force:true});}
});
test('craft render requires a fresh label before modifying production', {skip:!available},async()=>{
 for(const args of [[],['dancer-craft-20261109-r2'],['dancer-craft-20261109-r3']]) {
  const result=spawnSync(process.execPath,[new URL('craft-render.mjs',authoring).pathname,...args],{encoding:'utf8'});
  assert.notEqual(result.status,0);assert.match(result.stderr,/Usage|already exists/);
 }
});
