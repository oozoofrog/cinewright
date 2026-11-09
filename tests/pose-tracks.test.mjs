import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import {pathToFileURL} from 'node:url';
import {prepareTrack,preparePoseTracks,prepareCorrections,prepareContacts,constrainTarget} from '../modules/animation/pose-tracks.mjs';
import {ease} from '../modules/motion.mjs';
test('prepared scalar/vector segments preserve smoothstep, exact hold boundaries and immutable random access',()=>{
 const keys=[{frame:0,value:[0,2]},{frame:10,value:[10,4],interpolation:'hold'},{frame:20,value:[30,6],interpolation:'linear'},{frame:30,value:[40,8]}],t=prepareTrack(keys);
 keys[0].value[0]=999;
 for(const f of [0,1,3.5,9,10])assert.deepEqual(t.at(f),[10*ease(f/10),2+2*ease(f/10)]);
 assert.deepEqual(t.at(19.9),[10,4]);assert.deepEqual(t.at(20),[30,6]);assert.deepEqual(t.at(25),[35,7]);
 const canonical=Array.from({length:31},(_,f)=>t.at(f));for(const f of [30,20,10,0,7,19,7])assert.deepEqual(t.at(f),canonical[f]);
 t.at(0)[0]=100;assert.deepEqual(t.at(-5),[0,2]);
 const smooth=prepareTrack([{frame:0,value:0,interpolation:{bezier:[.1,.6]}},{frame:10,value:1}]);let prev=0;for(let f=0;f<=10;f++){assert(smooth.at(f)>=prev);prev=smooth.at(f);}
});
test('reject malformed authoring early, including invalid corrections/contact/target geometry',()=>{
 for(const k of [[],[{frame:0,value:NaN}],[{frame:0,value:1},{frame:0,value:2}],[{frame:0,value:[0,1]},{frame:1,value:2}],[{frame:0,value:1,interpolation:'catmull'}],[{frame:0,value:1,interpolation:{bezier:[.9,.1]}}]])assert.throws(()=>prepareTrack(k));
 assert.throws(()=>prepareTrack([{frame:0,value:0}]).at(Infinity));
 assert.throws(()=>prepareCorrections([{center:0,radius:0,delta:{x:1}}]));
 assert.throws(()=>prepareCorrections([{center:0,radius:1,delta:{x:1}},{center:1,radius:1,delta:{x:[1,2]}}]));
 assert.throws(()=>prepareContacts([{channel:'toe',from:0,to:5,target:[0,0]},{channel:'toe',from:4,to:6,target:[0,0]}]));
 assert.throws(()=>constrainTarget([0,0],[2,3],{min:4,max:3}));
});
test('all vector APIs reject missing coordinates before evaluation',()=>{
 for(const gap of [[,1],[1,,3],new Array(4)]){
  assert.throws(()=>prepareTrack([{frame:0,value:gap},{frame:10,value:[2,3]}]));
  assert.throws(()=>prepareCorrections([{center:0,radius:1,delta:{offset:gap}}]));
  assert.throws(()=>prepareContacts([{channel:'toe',from:0,to:10,target:gap}]));
  assert.throws(()=>constrainTarget(gap.map(()=>0),gap,{max:5}));
  assert.throws(()=>constrainTarget(Array(gap.length).fill(0),gap,{max:5}));
  assert.throws(()=>constrainTarget(gap,Array(gap.length).fill(0),{max:5}));
 }
});
test('second case: telescoping crane geometry, linear trolley and held hook with pose-space clearance',()=>{
 const tracks=preparePoseTracks({trolley:[{frame:0,value:[0,0],interpolation:'linear'},{frame:10,value:[60,0]}],hook:[{frame:0,value:[0,20],interpolation:'hold'},{frame:10,value:[0,40]}]});
 const contacts=prepareContacts([{channel:'hook',from:2,to:5,target:[0,20]}]);
 const c=prepareCorrections([{center:30,radius:30,delta:{clearance:[0,-4]}}]);
 for(const f of [0,5,10,7,3,10,0]){const s=tracks.at(f),r=constrainTarget(s.trolley,s.hook,{min:5,max:35});assert(Math.hypot(...r.point.map((v,i)=>v-s.trolley[i]))<=35+1e-12);assert.equal(r.reachable,r.distance>=5&&r.distance<=35);}
 assert.deepEqual(c.at(30).clearance,[0,-4]);assert.deepEqual(c.at(60).clearance,[0,0]);assert.deepEqual(contacts.at(2),{hook:[0,20]});assert.deepEqual(contacts.at(5),{});
 assert.deepEqual(constrainTarget([0,0],[0,0],{min:3,max:5}).point,[3,0]);
});
test('actual dancer preserves all out-of-scope poses and arm lengths; exposes cloth/contact channels',async(t)=>{
 const root='.direction/productions/music-box-dancer-redesign-20261108/intro-16/';
 try {await fs.access(root+'store/revisions/8e02b50a1855380296b60c83de79114d048381fef83da9cbfa7a566788ca865a/project/model-v8.mjs');} catch {t.skip('private production baseline is absent');return;}
 const {pose}=await import('../'+root+'project/model-v8.mjs');
 const {returnDiagnostics,returnTracks}=await import('../'+root+'project/return-craft.mjs');
 const baseline=await import(pathToFileURL(process.cwd()+'/'+root+'store/revisions/8e02b50a1855380296b60c83de79114d048381fef83da9cbfa7a566788ca865a/project/model-v8.mjs'));
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 for(let f=0;f<384;f++){
  const p=pose(f),old=baseline.pose(f);
  if(f<=330||f>=372)assert.deepEqual(p,old,`protected f${f}`);
  else {assert.deepEqual(p.far,old.far);assert(Math.abs(distance(p.near.S,p.near.E)-86)<1e-10);assert(Math.abs(distance(p.near.E,p.near.W)-distance(old.near.E,old.near.W))<1e-10);for(const k of ['clothL','clothR','clothLift'])assert.equal(p[k],old[k]);}
  const d=returnDiagnostics(f,p);assert(Object.values(d.contactResiduals).every(x=>x<1e-10));assert(d.reach.reachable);
 }
 assert.notDeepEqual(pose(346).near,baseline.pose(346).near);
 const canonical=Array.from({length:384},(_,f)=>pose(f));
 for(const f of [372,346,331,0,143,346])assert.deepEqual(pose(f),canonical[f]);
 assert.equal(returnTracks.at(348).clothL,-5);
});
