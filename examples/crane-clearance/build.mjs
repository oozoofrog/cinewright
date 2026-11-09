import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {materializeKit} from '../../scripts/materialize-kit.mjs';
import {validate} from '../../runtime/timeline.mjs';
import {makeEvaluator} from './scene.mjs';

export async function build({source,project}) {
  // Validate using the same prepared APIs that the materialized scene will use.
  const evaluate=makeEvaluator(source);
  const work={version:1,title:source.title,size:source.size,fps:source.fps,frames:source.frames,
    points:{departure:source.timing.departure,arrival:source.timing.arrival,release:source.timing.release},
    spans:{transfer:[source.timing.departure,source.timing.arrival+1]},
    layers:[{id:'crane',module:'scene.mjs',config:{source:'source.json'}}]};
  validate(work);
  for(const frame of Object.values(work.points)) if(!Number.isInteger(frame)||frame<0||frame>=work.frames)throw Error('invalid timing');
  for(let f=0;f<source.frames;f++)evaluate(f);
  await fs.mkdir(project); // Exclusive new project: never overwrite an author's scene/config.
  await materializeKit({project,modules:['pose-tracks']});
  await fs.writeFile(path.join(project,'scene.mjs'),(await fs.readFile(new URL('./scene.mjs',import.meta.url),'utf8')).replace("'../../modules/animation/pose-tracks.mjs'","'./modules/animation/pose-tracks.mjs'"));
  await fs.writeFile(path.join(project,'source.json'),JSON.stringify(source,null,2)+'\n');
  await fs.writeFile(path.join(project,'work.json'),JSON.stringify(work,null,2)+'\n');
  return {project,work};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [config,project]=process.argv.slice(2);
  if(!config||!project)throw Error('Usage: node examples/crane-clearance/build.mjs CONFIG.json NEW_PROJECT');
  console.log(JSON.stringify(await build({source:JSON.parse(await fs.readFile(config,'utf8')),project:path.resolve(project)}),null,2));
}
