import fs from 'node:fs/promises';
import {bakeWatercolor} from '../modules/fx2d/watercolor.mjs';
import {createReconstruction} from '../modules/fx2d/watercolor-reconstruct.mjs';
const dir='evidence/cinematic-animation-implementation-2026-11-08/watercolor';await fs.mkdir(dir,{recursive:true});const rows=[];
for(const name of ['wet','overlap']){
 const original=JSON.parse(await fs.readFile(`.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd-v3/${name}-bake.json`));
 for(const scale of [1,2]){
  const input=structuredClone(original.header);input.width*=scale;input.height*=scale;input.dt/=scale*scale;input.stepsPerFrame*=scale*scale;input.coefficients.waterDiffusion*=scale*scale;input.coefficients.pigmentDiffusion*=scale*scale;
  for(const e of input.events){e.x=(e.x+.5)*scale-.5;e.y=(e.y+.5)*scale-.5;e.radius*=scale;}
  const start=performance.now(),bake=bakeWatercolor(input),bakeMs=performance.now()-start,bytes=Buffer.byteLength(JSON.stringify(bake));
  if(scale===2)await fs.writeFile(`${dir}/${name}-96x54.json`,JSON.stringify(bake));
  for(const method of ['linear','cubic']){const r=createReconstruction(input.width,input.height,960,540,{method,seed:input.seed,grain:method==='linear'?0:.12});const start=performance.now();for(const f of [24,72,144])r.draw(bake.frames[f],input.colors,{density:9*scale*scale});rows.push({name,scale,method,bakeMs,bakeBytes:bytes,drawMs:(performance.now()-start)/3,buffersBytes:r.bytes,input,notes:'Same physical event/time/total pigment; 2x grid uses 4x diffusion rate and substeps, 1/4 dt, 4x optical density. Solver deposition dt*absorption term is not exactly resolution invariant.'});}
 }
}
await fs.writeFile(`${dir}/cost-comparison.json`,JSON.stringify(rows,null,2));console.log(rows.map(({input,...r})=>r));
