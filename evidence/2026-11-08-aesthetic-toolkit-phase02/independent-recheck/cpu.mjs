import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import * as W from '../../../modules/fx2d/watercolor.mjs';
import {validateRig,createRiggedMesh} from '../../../modules/animation/auto-rig.mjs';
import {materializeStyle} from '../../../scripts/materialize-style.mjs';
import {fixtureRig,fixtureMotion} from '../../../examples/styles/phase02-retarget/fixtures.mjs';
import {createRetargeter} from '../../../modules/animation/retarget.mjs';
const out=path.dirname(new URL(import.meta.url).pathname),base=path.resolve('.direction/aesthetic-toolkit-phase02-2026-11-08/independent-recheck');
const hash=b=>createHash('sha256').update(b).digest('hex'),sum=a=>a.reduce((a,b)=>a+b,0),report={water:[],negativeInputs:[],legacy:[],rig:[],contact:[],publication:[],defects:[]};
const original=JSON.parse(await fs.readFile('evidence/2026-11-08-aesthetic-toolkit-phase02/independent-review/water-drying-repro.json'));
function check(c,label){
 const source=JSON.stringify(c),s=W.createSolver(c);let maxBalance=0,min=Infinity,last;
 try{for(let f=0;f<c.frames;f++){
  const x=s.advance(); last=x;
  for(const a of [x.water,...x.mobile,...x.deposited])for(const v of a){assert.ok(Number.isFinite(v),label+' finite');assert.ok(v>=0,label+' nonnegative '+v);min=Math.min(min,v);}
  assert.ok(x.totals.absorbed>=0&&x.totals.evaporated>=0);
  maxBalance=Math.max(maxBalance,Math.abs(sum(x.water)+x.totals.absorbed+x.totals.evaporated-x.totals.waterInput));
  for(let j=0;j<c.colors.length;j++)maxBalance=Math.max(maxBalance,Math.abs(sum(x.mobile[j])+sum(x.deposited[j])-x.totals.pigmentInput[j]));
 }assert.ok(maxBalance<1e-9);assert.equal(JSON.stringify(c),source);report.water.push({label,frames:c.frames,min,maxBalance,finalWater:sum(last.water),absorbed:last.totals.absorbed,evaporated:last.totals.evaporated});return last;
 }catch(e){report.defects.push({label,error:e.message,input:c});return null;}
}
check(original,'exact prior failing frame58');
const tiny=water=>({...structuredClone(original),width:3,height:3,frames:40,dt:1,stepsPerFrame:1,coefficients:{waterDiffusion:.125,pigmentDiffusion:.125,absorption:0,evaporation:0,deposition:0},events:[{frame:0,x:1,y:1,radius:.01,water,pigment:[3,2]}]});
const N=2**-1022;
for(const water of [0,Number.MIN_VALUE,3*Number.MIN_VALUE,N/2,N-Number.MIN_VALUE,N,N+Number.MIN_VALUE,2*N,1e-300]){
 const c=tiny(water);check(c,'threshold '+water);
 for(const [absorption,evaporation] of [[1,0],[0,1],[.37,.63],[.21,.34]]){const a=structuredClone(c);a.coefficients.absorption=absorption;a.coefficients.evaporation=evaporation;check(a,`threshold sinks ${water}/${absorption}/${evaporation}`);}
}
// Below threshold neither water nor carried pigment moves; independent diffusion and deposition still operate.
for(const [pd,dep] of [[0,0],[.125,0],[0,.4],[.125,.4]]){const c=tiny(N/2);c.frames=1;c.coefficients.waterDiffusion=.125;c.coefficients.pigmentDiffusion=pd;c.coefficients.deposition=dep;const x=check(c,`dry-policy diffusion=${pd} deposition=${dep}`);assert.equal(x.water[4],N/2);assert.equal(sum(x.water),N/2);assert.equal(x.mobile[0][0],0);assert.equal(x.mobile[0][1]>0,pd>0);assert.equal(sum(x.deposited[0])>0,dep>0);}
// Each independent sink and their split against an analytic one-cell decay, without transport.
for(const [a,e]of [[.7,0],[0,.3],[.7,.3]]){const c=tiny(10);c.frames=8;c.dt=.25;c.coefficients={waterDiffusion:0,pigmentDiffusion:0,absorption:a,evaporation:e,deposition:0};const x=check(c,`analytic independent sinks ${a}/${e}`),expected=10*(1-c.dt*(a+e))**c.frames;assert.ok(Math.abs(sum(x.water)-expected)<1e-14);assert.ok(Math.abs(x.totals.absorbed-(10-expected)*(a/(a+e)))<1e-14);assert.equal(sum(x.mobile[0]),3);}
// New seed distribution, high losses, varied dry transitions and delayed fresh wet input.
let seed=0x8badf00d;const rnd=()=>((seed=(Math.imul(seed,1103515245)+12345)>>>0)/2**32);
for(let trial=0;trial<160;trial++){
 const c=structuredClone(original);c.frames=72;c.dt=.02+rnd()*.4;c.stepsPerFrame=1+Math.floor(rnd()*6);const D=(trial%4===0?1:.85+rnd()*.15)/4/c.dt,ratio=rnd(),loss=(trial%5===0?1:.8+rnd()*.2)/c.dt;
 c.coefficients={waterDiffusion:D*ratio,pigmentDiffusion:D*(1-ratio),absorption:loss*.375,evaporation:loss*.625,deposition:rnd()/c.dt};
 // Avoid creating a coefficient sum one ulp outside declared validation.
 if(4*c.dt*(c.coefficients.waterDiffusion+c.coefficients.pigmentDiffusion)>1)c.coefficients.pigmentDiffusion*=1-Number.EPSILON*2;
 if(c.dt*(c.coefficients.absorption+c.coefficients.evaporation)>1)c.coefficients.evaporation*=1-Number.EPSILON*2;
 c.events[0].water=trial%3===0?N*(.5+rnd()):trial%3===1?0:10;c.events[1].frame=29;
 check(c,'new-seed trajectory '+trial);
}
for(const [label,mutate]of [['negative water',c=>c.events[0].water=-Number.MIN_VALUE],['negative pigment',c=>c.events[0].pigment[0]=-Number.MIN_VALUE],['NaN water',c=>c.events[0].water=NaN],['unstable losses',c=>c.coefficients.absorption=100]]){const c=structuredClone(original);mutate(c);assert.throws(()=>W.createSolver(c));report.negativeInputs.push(label);}
for(const k of ['wet','overlap']){const file=`examples/styles/phase02-watercolor/${k}/assets/watercolor.json`,bytes=await fs.readFile(file),b=JSON.parse(bytes);assert.equal(b.solver,'grid-transport-1');assert.equal(W.validateBake(b),true);const frames=[0,7,37,95,191,191,95,0],hashes=frames.map(f=>hash(JSON.stringify(W.decodeWatercolor(b,f))));assert.equal(hashes[0],hashes.at(-1));assert.equal(hash(await fs.readFile(file)),hash(bytes));report.legacy.push({file,solver:b.solver,sha256:hash(bytes),frames,hashes});}
const rebake=W.bakeWatercolor(original);assert.equal(rebake.solver,'grid-transport-2');assert.equal(hash(JSON.stringify(rebake)),hash(JSON.stringify(W.bakeWatercolor(original))));report.newBakeHash=hash(JSON.stringify(rebake));
// All public validation paths, with no motion. Test rotated hierarchy too rather than translations only.
const good=JSON.parse(await fs.readFile('examples/styles/phase02-rig/assets/tall/character.rig.json'));
for(const [label,mutate]of [['root inverse translation',r=>r.inverseBind[0][12]+=1],['child inverse rotation',r=>r.inverseBind[6][0]+=.01],['changed rest child',r=>r.bones[6].position[0]+=.1],['changed rest rotation',r=>r.bones[0].quaternion=[0,Math.sin(.2),0,Math.cos(.2)]],['nonfinite bind',r=>r.inverseBind[3][4]=Infinity]]){const r=structuredClone(good);mutate(r);for(const fn of [validateRig,createRiggedMesh])assert.throws(()=>fn(r));report.rig.push({label,rejected:true});}
validateRig(good);const r=createRiggedMesh(good);r.dispose();r.dispose();const noInverse=structuredClone(good);delete noInverse.inverseBind;const rotated=structuredClone(noInverse);rotated.bones[0].quaternion=[0,Math.sin(.2),0,Math.cos(.2)];const rr=createRiggedMesh(rotated);rotated.inverseBind=rr.skeleton.boneInverses.map(m=>m.toArray());rr.dispose();assert.equal(validateRig(rotated),true);report.rig.push({label:'valid recomputed rotated bind',accepted:true});
const pub=path.join(base,'publication');await fs.rm(pub,{recursive:true,force:true});await fs.mkdir(pub,{recursive:true});const source=path.join(pub,'rig.json'),project=path.join(pub,'valid'),scene={version:1,style:'expressionist-space',title:'rig only',size:[96,54],fps:24,frames:24,seed:1,camera:{type:'perspective',position:[0,2,7],target:[0,2,0]},materials:{body:{color:'#aabbcc'}},objects:[{id:'a',rig:'assets/rig.json',material:'body'}],lights:[]},assets={'assets/rig.json':source};
await fs.writeFile(source,JSON.stringify(good));await materializeStyle({project,style:scene.style,scene,assets});
async function tree(dir){const rows={};for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())Object.assign(rows,await tree(f));else rows[path.relative(project,f)]=hash(await fs.readFile(f));}return rows;}
const before=await tree(project);const bad=structuredClone(good);bad.inverseBind[0][12]+=1;await fs.writeFile(source,JSON.stringify(bad));
for(const update of [false,true]){let error;try{await materializeStyle({project:update?project:path.join(pub,'bad'),style:scene.style,scene,assets,update});}catch(e){error=e.message;}assert.match(error,/inverse bind/);assert.deepEqual(await tree(project),before);assert.equal((await fs.readdir(pub)).filter(s=>s==='bad'||s.startsWith('.style-')||s.includes('.style-backup-')).length,0);report.publication.push({update,error,allPackageHashesPreserved:true,stageOrBadOutputs:0});}
await fs.writeFile(path.join(out,'publication-hashes.json'),JSON.stringify(before,null,2));
// Independent bake CLI failure should preserve an existing destination and leave no temporary bytes.
const config=path.join(base,'cli-input.json'),dest=path.join(base,'protected-bake.json');await fs.writeFile(config,JSON.stringify({...tiny(1),frames:1}));await fs.writeFile(dest,'review sentinel');let result=spawnSync(process.execPath,['scripts/watercolor-bake.mjs',config,dest]);assert.notEqual(result.status,0);assert.equal(await fs.readFile(dest,'utf8'),'review sentinel');assert.equal((await fs.readdir(base)).filter(f=>f.startsWith('.protected-bake')).length,0);report.publication.push({bakeExistingDestinationRefused:true,retainedSentinel:true,temporaryFiles:0});
const rig=fixtureRig(),motion=fixtureMotion(rig),duration=motion.duration;
for(const contact of [{windows:{left:[[2,1]],right:[]}},{windows:{left:[[NaN,1]]}},{windows:{left:[[-1,0]]}},{windows:{left:[[0,duration+.01]]}},{windows:{left:[[0]]}},{windows:{left:[[0,1,2]]}},{windows:{left:null}},{windows:[]},{windows:{wrong:[]}},{windows:{left:[],right:[]},pole:[0,0,Infinity]},{windows:{left:[],right:[]},pole:[0,1]},{windows:{left:[],right:[]},minFlexion:-.001},{windows:{left:[],right:[]},minFlexion:2,maxFlexion:1},{windows:{left:[],right:[]},maxFlexion:Math.PI+.001},{windows:{left:[],right:[]},maxFlexion:NaN}]){let error;try{createRetargeter(rig,rig,motion,{contact});}catch(e){error=e.message;}assert.match(error,/contact/);report.contact.push({contact,error});}
for(const contact of [{windows:{left:[],right:[]}},{windows:{left:[[0,duration]],right:[]},pole:[0,0,0],minFlexion:0,maxFlexion:Math.PI},{windows:{left:[[0,0],[duration,duration]],right:[]}}]){const p=createRetargeter(rig,rig,motion,{contact}),a=p.evaluate(0,{loop:false}),b=p.evaluate(Math.round(duration*24),{loop:false});if(contact.windows.left.length===0)assert.deepEqual(a.contacts,[]);report.contact.push({contact,accepted:true,atStart:a.contacts.length,atEnd:b.contacts.length});p.dispose();}
await fs.writeFile(path.join(out,'cpu.json'),JSON.stringify(report,null,2));
console.log({trajectories:report.water.length,maxBalance:Math.max(...report.water.map(x=>x.maxBalance)),defects:report.defects,legacy:report.legacy.map(x=>x.solver),rigCases:report.rig.length,contactCases:report.contact.length,publication:report.publication});assert.equal(report.defects.length,0);
