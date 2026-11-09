import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {fixtureRig,fixtureMotion} from './fixtures.mjs';import {bakeRetarget} from '../../../modules/animation/retarget.mjs';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
export async function buildRetarget(project,mode='stride'){
 if(!['stride','salute'].includes(mode))throw new Error('mode stride/salute');await fs.mkdir(project,{recursive:true});
 const source=fixtureRig(),motion=fixtureMotion(source,mode),metrics={mode,targets:{}};
 for(const file of ['animation/retarget.mjs','animation/retarget-stage.mjs','animation/auto-rig.mjs','fx3d/adapter.mjs','fx3d/material.mjs']){const dest=path.join(project,'modules',file);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(path.join(repo,'modules',file),dest);}
 const performers=[];await fs.mkdir(path.join(project,'assets'),{recursive:true});
 for(const [i,kind]of ['source','reed','copper'].entries()){
  const rig=kind==='source'?source:fixtureRig(kind),bake=bakeRetarget(source,rig,motion,kind==='source'?{}:{contact:{ground:.14,maxCorrection:.35}}),contacts=bake.samples.flatMap(x=>x.contacts);
  const rms=key=>Math.sqrt(contacts.reduce((sum,c)=>sum+c[key]**2,0)/(contacts.length||1));metrics.targets[kind]={vertices:rig.geometry.positions.length/3,bones:rig.bones.length,samples:bake.samples.length,bakeBytes:Buffer.byteLength(JSON.stringify(bake)),scale:bake.diagnostics.scale,groundRmsBefore:rms('before'),groundRmsAfter:rms('after'),groundMaxAfter:Math.max(0,...contacts.map(x=>Math.abs(x.after))),maxCorrection:Math.max(0,...contacts.map(x=>x.correction)),unreachable:contacts.filter(x=>x.unreachable).length,boundRejected:contacts.filter(x=>x.boundRejected).length};
  await fs.writeFile(path.join(project,'assets',kind+'.rig.json'),JSON.stringify(rig));await fs.writeFile(path.join(project,'assets',kind+'.motion.json'),JSON.stringify(bake));
  performers.push({rig:`assets/${kind}.rig.json`,motion:`assets/${kind}.motion.json`,label:['SOURCE / authored','REED / long limbs','COPPER / Z-up, compact'][i],color:['#c8ced7','#8bbcb2','#d7a77e'][i]});
 }
 await fs.writeFile(path.join(project,'assets/LICENSE.txt'),'Original generated fixture surfaces, skeletons and motion: Cinewright phase02, CC0-1.0. No imported media. Code retains repository terms. Three.js r180 MIT; see frozen vendor/three/LICENSE.\n');
 const work={version:1,title:mode==='stride'?'The same stride, three bodies':'A salute in three proportions',size:[960,540],fps:24,frames:mode==='stride'?192:216,background:mode==='stride'?'#17212e':'#292431',layers:[{id:'retarget',module:'modules/animation/retarget-stage.mjs',config:{mode,title:mode==='stride'?'THE SAME STRIDE, THREE BODIES':'A SALUTE IN THREE PROPORTIONS',subtitle:mode==='stride'?'Rest-frame and axis correction · proportional root transfer · bounded ground IK':'Independent source motion · expressive upper body · two retargeted meshes',performers}}],audio:[],points:{start:0,middle:96},spans:{full:[0,mode==='stride'?192:216]}};
 await fs.writeFile(path.join(project,'work.json'),JSON.stringify(work,null,2));await fs.writeFile(path.join(project,'metrics.json'),JSON.stringify(metrics,null,2));return metrics;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(await buildRetarget(path.resolve(process.argv[2]),process.argv[3]),null,2));
