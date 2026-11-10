import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {materializeKit} from '../../scripts/materialize-kit.mjs';
import {validate} from '../../runtime/timeline.mjs';
import {studies} from './studies.mjs';
import {writeScore} from './score.mjs';
export async function build({name,project,source=structuredClone(studies[name])}){
  if(!studies[name]||!source)throw Error('Unknown study');
  const work={version:1,title:source.title,size:source.size,fps:source.fps,frames:source.frames,
    points:source.points,spans:source.spans,layers:name==='cups'?[
      {id:'table',module:'scene.mjs',config:{role:'table'}},{id:'vessels',module:'scene.mjs',config:{role:'vessels'}}
    ]:[{id:'scene',module:'scene.mjs'}],
    ...(name==='cups'?{channels:{vessels:{producer:'table',consumers:['vessels'],kind:'path',space:'canvas-px',from:0,to:source.frames}}}:{}),
    audio:[{asset:'score.wav',sourceIn:0,sourceOut:source.frames*48000/source.fps,at:0,gain:1,
      provenance:'Original additive composition in score.mjs. Authored timings, not music analysis or listening verification.'}]};
  validate(work);
  await fs.mkdir(project); // Exclusive: existing author files are never replaced.
  if(source.tracks)await materializeKit({project,modules:['pose-tracks']});
  const module=await fs.readFile(new URL(source.module,import.meta.url),'utf8');
  await fs.writeFile(path.join(project,'scene.mjs'),module.replace("'../../modules/animation/pose-tracks.mjs'","'./modules/animation/pose-tracks.mjs'"));
  await fs.writeFile(path.join(project,'source.json'),JSON.stringify(source,null,2)+'\n');
  const audio=await writeScore(path.join(project,'score.wav'),source);
  await fs.writeFile(path.join(project,'work.json'),JSON.stringify(work,null,2)+'\n');
  return {project,work,audio};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [name,destination]=process.argv.slice(2);if(!destination)throw Error('Usage: node examples/relation-studies/build.mjs cups|doorway|fold NEW_PROJECT');
 console.log(JSON.stringify(await build({name,project:path.resolve(destination)}),null,2));
}
