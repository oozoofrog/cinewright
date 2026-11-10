import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=path.join(root,'evidence/aesthetic-toolkit-phase02-2026-11-08/independent-review'),base=path.join(root,'.direction/aesthetic-toolkit-phase02-2026-11-08/independent-review');
const hash=b=>createHash('sha256').update(b).digest('hex');
async function walk(dir){const list=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())list.push(...await walk(p));else if(e.isFile())list.push(p);}return list;}
const sources=[...(await Promise.all(['modules','scripts','catalog','references/styles','skills/cinewright','examples/styles/phase02-rig','examples/styles/phase02-retarget'].map(walk))).flat(),'SKILL.md','package.json','package-lock.json','docs/research/aesthetic-toolkit-phase02-2026-11-08/COMMON-CONTRACT.md','docs/handoffs/2026-11-08-aesthetic-toolkit-followup-execution.md','node_modules/three/src/objects/SkinnedMesh.js','node_modules/three/src/objects/Skeleton.js','node_modules/three/src/renderers/shaders/ShaderChunk/skinning_vertex.glsl.js','node_modules/three/examples/jsm/utils/SkeletonUtils.js','node_modules/three/examples/jsm/exporters/GLTFExporter.js','node_modules/three/examples/jsm/loaders/GLTFLoader.js','node_modules/three/LICENSE'];
await fs.writeFile(path.join(out,'source-hashes-before.json'),JSON.stringify(Object.fromEntries(await Promise.all(sources.map(async p=>[p,hash(await fs.readFile(p))]))),null,2));
const {materializeStyle}=await import(pathToFileURL(path.join(root,'scripts/materialize-style.mjs'))),{freeze}=await import(pathToFileURL(path.join(root,'scripts/revisions.mjs')));
await fs.mkdir(base,{recursive:true});const cases=[];
for(const k of ['tall','broad','wet','overlap','stride','salute']){
 const src=path.join(root,k==='tall'||k==='broad'?`.direction/aesthetic-toolkit-phase02-2026-11-08/coordinator/${k}`:k==='wet'||k==='overlap'?`examples/styles/phase02-watercolor/${k}`:`.direction/aesthetic-toolkit-phase02-2026-11-08/retarget/projects/${k}`),project=path.join(base,k);
 const work=JSON.parse(await fs.readFile(path.join(src,'work.json'),'utf8'));
 if(['stride','salute'].includes(k)){
  await fs.cp(src,project,{recursive:true});
  for(const p of (await walk('modules')).filter(p=>/\.(mjs|js)$/.test(p))){const to=path.join(project,p);await fs.mkdir(path.dirname(to),{recursive:true});await fs.copyFile(p,to);}
 }else{
  const assets={};for(const p of await walk(path.join(src,'assets')))assets[path.relative(src,p)]=p;
  await materializeStyle({project,style:work.layers[0].config.scene.style,scene:work.layers[0].config.scene,assets});
 }
 const snapshot=await freeze(project,path.join(base,'store'));await fs.rm(project,{recursive:true});
 cases.push({key:k,revision:snapshot.revision,root:snapshot.root,paths:[...snapshot.paths],port:48730+cases.length,manifest:snapshot.manifest,sourceAbsent:!(await fs.stat(project).catch(()=>null))});
}
await fs.writeFile(path.join(out,'cases.json'),JSON.stringify(cases,null,2));console.log(cases.map(x=>({key:x.key,port:x.port,revision:x.revision,sourceAbsent:x.sourceAbsent})));
