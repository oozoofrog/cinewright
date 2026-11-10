import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {materializeStyle} from '../../../scripts/materialize-style.mjs';
export async function buildExpressionist(project,{recipe='station',update=false}={}){
 if(!['station','laboratory','portrait','effects'].includes(recipe))throw new Error('recipe: station/laboratory/portrait/effects');
 const scene=JSON.parse(await fs.readFile(new URL(`../../../recipes/styles/expressionist-space/${recipe}.json`,import.meta.url),'utf8'));
 const assets=Object.fromEntries(['traveler.glb','specimen.glb','metadata.json','LICENSE'].map(name=>['assets/'+name,fileURLToPath(new URL('assets/'+name,import.meta.url))]));
 return materializeStyle({project:path.resolve(project),style:'expressionist-space',scene,assets,update});
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(await buildExpressionist(process.argv[2],{recipe:process.argv[3]??'station',update:process.argv.includes('--update')}),null,2));
