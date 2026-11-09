import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from '../examples/crane-clearance/build.mjs';
import {freeze,openRevision} from '../scripts/revisions.mjs';
import {makeEvaluator} from '../examples/crane-clearance/scene.mjs';
const read=async name=>JSON.parse(await fs.readFile(new URL(`../examples/crane-clearance/${name}.json`,import.meta.url),'utf8'));

test('authored clearance removes intermediate collision while preserving endpoints, contact and release',async()=>{
 const before=await read('first-pass'),after=await read('clearance');
 const stripped=structuredClone(after);stripped.corrections=[];assert.deepEqual(stripped,before);
 const a=makeEvaluator(before),b=makeEvaluator(after);
 const failed=[],fixed=[];
 for(let f=0;f<before.frames;f++){
  const x=a(f),y=b(f);if(x.collision)failed.push(f);if(y.collision)fixed.push(f);
  assert(y.reach.reachable);assert.equal(x.hook[0],y.hook[0]);
  assert.equal(y.parcel[0],x.parcel[0]);
  if(f<=before.timing.departure||f>=before.timing.arrival)assert.deepEqual(y,x);
  if(f>=after.timing.arrival){assert.equal(y.contactResidual,0);assert.deepEqual(y.parcel,[480,254]);assert.equal(y.parcel[1]+after.geometry.parcelSize[1]/2,after.geometry.platforms[1].y);}
 }
 assert(failed.length>0);assert.deepEqual(fixed,[]);
 assert.equal(b(59).attached,true);assert.equal(b(60).attached,false);assert(b(71).hook[1]<b(60).hook[1]);
 const reference=Array.from({length:72},(_,f)=>b(f));for(const f of [71,30,0,48,12,30])assert.deepEqual(b(f),reference[f]);
});

test('fresh materialization/import/prepare evaluates modified geometry and timing; refuses overwrite',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'cinewright-craft-'));
 try{
  const source=await read('clearance');source.frames=96;source.timing.release=80;
  source.tracks.hook.at(-2).frame=80;source.tracks.hook.at(-1).frame=95;
  source.contacts[0].to=96;source.geometry.parcelSize=[44,28];
  const project=path.join(root,'fresh');await build({source,project});
  const {prepare}=await import(pathToFileURL(path.join(project,'scene.mjs')));
  const module=await prepare({json:async name=>JSON.parse(await fs.readFile(path.join(project,name),'utf8'))},{source:'source.json'});
  assert.equal(module.evaluate({frame:79}).attached,true);assert.equal(module.evaluate({frame:80}).attached,false);
  assert.deepEqual(module.evaluate({frame:95}).parcel,[480,254]);
  const frozen=await freeze(project,path.join(root,'store'));
  const verified=await openRevision(path.join(root,'store'),frozen.revision);
  const frozenScene=await import(pathToFileURL(path.join(verified.root,'project/scene.mjs')));
  const frozenSource=JSON.parse(await fs.readFile(path.join(verified.root,'project/source.json'),'utf8'));
  assert.deepEqual(frozenScene.makeEvaluator(frozenSource)(95),module.evaluate({frame:95}));
  const original=await fs.readFile(path.join(project,'source.json'));
  await assert.rejects(build({source,project}),/EEXIST/);
  assert.deepEqual(await fs.readFile(path.join(project,'source.json')),original);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
