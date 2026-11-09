import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildExpressionist} from './build.mjs';
import {writeOwnedFiles} from '../../../scripts/materialize-kit.mjs';
import {validate} from '../../../runtime/timeline.mjs';
export async function buildMixed(project,{update=false}={}){
 project=path.resolve(project);
 await buildExpressionist(project,{recipe:'laboratory',update});
 const manifest=JSON.parse(await fs.readFile(path.join(project,'work.json'),'utf8'));
 manifest.title='Laboratory / projected Canvas annotation and shared lamp event';
 const scene=manifest.layers[0].config.scene;
 scene.eventBinding={channel:'lamp.event',light:1,gain:1};
 scene.projectBinding={object:'specimen',channel:'specimen.screen'};
 manifest.channels={
  'lamp.event':{producer:'$data',consumers:['style','annotation'],space:'unit',kind:'number',mode:'linear',from:0,to:192,data:{keys:[[0,.3],[48,.3],[96,1],[144,1],[191,.5]]}},
  'specimen.screen':{producer:'style',consumers:['annotation'],space:'canvas',kind:'vec2',from:0,to:192},
 };
 manifest.layers.push({id:'annotation',module:'modules/mixed-overlay.mjs'});
 validate(manifest);
 const files={
  'work.json':JSON.stringify(manifest,null,2)+'\n',
  'style-scene.json':JSON.stringify(scene,null,2)+'\n',
  'modules/mixed-overlay.mjs':await fs.readFile(new URL('mixed-overlay.mjs',import.meta.url)),
 };
 const version=JSON.parse(await fs.readFile(path.join(project,'style-version.json'),'utf8'));
 for(const [name,bytes]of Object.entries(files))version.files[name]=createHash('sha256').update(bytes).digest('hex');
 files['style-version.json']=JSON.stringify(version,null,2)+'\n';
 await writeOwnedFiles({project,registry:'.cinewright-style.json',files});
 return {project};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(await buildMixed(process.argv[2],{update:process.argv.includes('--update')}));
