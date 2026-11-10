import fs from 'node:fs/promises';
import {Vector3} from 'three';
import {createRiggedMesh} from '../modules/animation/auto-rig.mjs';
import {createRetargetPlayer} from '../modules/animation/retarget.mjs';
const out='evidence/cinematic-animation-implementation-2026-11-08/validation',rows=[];
for(const name of ['original','reader']){
 const base=name==='original'?'examples/styles/phase02-rig/assets/tall/character':'examples/styles/phase02-rig/assets/reader/reader';
 const a=JSON.parse(await fs.readFile(base+'.rig.json')),m=JSON.parse(await fs.readFile(base+'.motion.json')),rig=createRiggedMesh(a),player=createRetargetPlayer(rig,m,{fps:24});let prev,maxStep=0;const frames=[];
 for(let f=0;f<192;f++){
  // Match the original demonstration's two-frame exposure.
  player.evaluate(f-f%2);rig.mesh.updateMatrixWorld(true);rig.skeleton.update();
  const p=[];for(let i=0;i<a.geometry.positions.length;i+=3){const v=rig.mesh.applyBoneTransform(i/3,new Vector3(...a.geometry.positions.slice(i,i+3)));if(!v.toArray().every(Number.isFinite))throw Error('nonfinite deformation');p.push(v);}
  const idx=a.geometry.indices??p.map((_,i)=>i);let volume=0;
  for(let i=0;i<idx.length;i+=3)volume+=p[idx[i]].dot(p[idx[i+1]].clone().cross(p[idx[i+2]]))/6;
  let step=0;if(prev)for(let i=0;i<p.length;i++)step=Math.max(step,p[i].distanceTo(prev[i]));maxStep=Math.max(maxStep,step);frames.push({frame:f,absoluteSignedVolume:Math.abs(volume),maxVertexStep:step});prev=p;
 }
 const volumes=frames.map(f=>f.absoluteSignedVolume),relativeSteps=frames.slice(1).map((r,i)=>Math.abs(r.absoluteSignedVolume-volumes[i])/volumes[i]);
 rows.push({name,vertices:a.geometry.positions.length/3,frames,minVolume:Math.min(...volumes),maxVolume:Math.max(...volumes),maxRelativeVolumeStep:Math.max(...relativeSteps),maxVertexStep:maxStep,method:'CPU skinned vertices at native24 with original every=2 exposure; signed mesh volume, not perceptual acceptance'});player.dispose();rig.dispose();
}
await fs.writeFile(out+'/rig-deformation.json',JSON.stringify(rows,null,2));console.log(rows.map(({frames,...r})=>r));
