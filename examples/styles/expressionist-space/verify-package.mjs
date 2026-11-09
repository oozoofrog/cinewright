// CPU-only packaging and freeze evidence. Does not acquire or use the GPU.
import {createHash}from 'node:crypto';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {buildExpressionist} from './build.mjs';import {buildMixed} from './build-mixed.mjs';import {freeze,openRevision}from '../../../scripts/revisions.mjs';
const root=path.resolve('.direction/aesthetic-toolkit-2026-11-08/C'),output=path.resolve('evidence/aesthetic-toolkit-2026-11-08/C');const results=[];
for(const recipe of ['station','laboratory','portrait','effects','mixed']){
 const project=path.join(root,recipe);if(recipe==='mixed')await buildMixed(project,{update:true});else await buildExpressionist(project,{recipe,update:true});
 const version=JSON.parse(await fs.readFile(path.join(project,'style-version.json'),'utf8'));for(const [name,hash]of Object.entries(version.files))assert.equal(createHash('sha256').update(await fs.readFile(path.join(project,name))).digest('hex'),hash,'provenance hash '+name);
 const snapshot=await freeze(project,path.join(root,'store'));
 for(const file of ['project/modules/styles/expressionist-space/index.mjs','project/vendor/three/addons/loaders/GLTFLoader.js','project/vendor/three/addons/utils/BufferGeometryUtils.js','project/vendor/three/LICENSE','project/assets/traveler.glb','project/assets/specimen.glb','vendor/three/three.core.js','vendor/three/three.module.js'])assert.ok(snapshot.paths.has(file),file);
 const code=await fs.readFile(path.join(snapshot.root,'project/modules/fx3d/glb.mjs'),'utf8'),relative=code.match(/import\('([^']+)'\)/)[1];assert.equal(path.posix.normalize(path.posix.join('project/modules/fx3d',relative)),'project/vendor/three/addons/loaders/GLTFLoader.js');
 const source=path.join(project,'assets/specimen.glb'),bytes=await fs.readFile(source);try{await fs.writeFile(source,Buffer.from('detached authored source for CPU freeze check'));await openRevision(path.join(root,'store'),snapshot.revision);assert.deepEqual(await fs.readFile(path.join(snapshot.root,'project/assets/specimen.glb')),bytes);}finally{await fs.writeFile(source,bytes);}
 results.push({recipe,project,revision:snapshot.revision,files:snapshot.paths.size,frames:snapshot.manifest.frames,size:snapshot.manifest.size,frozenAssetIsolation:true,localLoaderPath:'project/vendor/three/addons/loaders/GLTFLoader.js'});
}
await fs.writeFile(path.join(output,'package-verification.json'),JSON.stringify({node:process.version,results,browser:'CPU-only verification; see separate browser validation reports'},null,2)+'\n');console.log(JSON.stringify(results,null,2));
