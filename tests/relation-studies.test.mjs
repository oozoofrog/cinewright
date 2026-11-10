import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {studies} from '../examples/relation-studies/studies.mjs';
import {makeEvaluator as cups} from '../examples/relation-studies/cups.mjs';
import {makeEvaluator as doorway} from '../examples/relation-studies/doorway.mjs';
import {makeEvaluator as fold} from '../examples/relation-studies/fold.mjs';
import {build} from '../examples/relation-studies/build.mjs';
import {freeze,openRevision} from '../scripts/revisions.mjs';

test('authored histories, spatial cut and fold retain their distinct time relations under arbitrary seek',()=>{
 const a=cups(studies.cups),b=doorway(studies.doorway),c=fold(studies.fold);
 assert.equal(a(59).traces.length,0);assert.equal(a(60).traces.length,1);
 assert.equal(a(263).traces.length,1);assert.equal(a(264).traces.length,2);
 assert.deepEqual(a(479).positions[1],a(240).positions[0]);
 const noVisit=structuredClone(studies.cups);noVisit.placements.shift();
 assert.deepEqual(cups(noVisit)(479).positions,a(479).positions);
 assert.notDeepEqual(cups(noVisit)(479).traces,a(479).traces);
 assert.equal(b(119).inside,false);assert.equal(b(120).inside,true);
 assert.equal(b(0).opening,0);assert.equal(b(84).opening,1);assert.equal(b(180).light,0);
 assert.equal(c(48).left,0);assert.equal(c(96).left,Math.PI);assert.equal(c(96).right,0);
 assert.equal(c(156).right,Math.PI);for(const v of Object.values(c(240)))assert(Math.abs(v-.45)<1e-12);
 for(const [at,total] of [[a,480],[b,240],[c,288]]){
  const baseline=Array.from({length:total},(_,f)=>at(f));
  for(let f=total-1;f>=0;f--)assert.deepEqual(at(f),baseline[f]);
  for(let i=0;i<total;i++){const f=i*137%total;assert.deepEqual(at(f),baseline[f]);}
 }
});

test('three self-contained projects survive freeze/import and refuse to replace existing author files',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'cinewright-relations-'));
 try{
  for(const name of Object.keys(studies)){
   const project=path.join(root,name);await build({name,project});
   const source=await fs.readFile(path.join(project,'source.json'));
   const snapshot=await freeze(project,path.join(root,'store'));
   const frozen=await openRevision(path.join(root,'store'),snapshot.revision);
   const {prepare}=await import(pathToFileURL(path.join(frozen.root,'project/scene.mjs')));
   const writes={};const api={json:async name=>JSON.parse(await fs.readFile(path.join(frozen.root,'project',name),'utf8'))};
   const layer=await prepare(api,{role:'table'});
   const state=layer.evaluate({frame:studies[name].frames-1,write:(k,v)=>writes[k]=v});
   assert(state);assert.equal(typeof layer.draw,'function');
   if(name==='cups'){
    const consumer=await prepare(api,{role:'vessels'});
    assert.deepEqual(consumer.evaluate({read:k=>writes[k]}),state.positions);
   }
   assert.equal(snapshot.manifest.audio[0].sourceOut,studies[name].frames*2000);
   const wav=await fs.readFile(path.join(project,'score.wav'));
   assert.equal(wav.length,44+studies[name].frames*2000*4);
   assert(wav.subarray(-4800).every(v=>v===0),'authored score must finish in digital silence');
   await assert.rejects(build({name,project}),/EEXIST/);
   assert.deepEqual(await fs.readFile(path.join(project,'source.json')),source);
  }
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
