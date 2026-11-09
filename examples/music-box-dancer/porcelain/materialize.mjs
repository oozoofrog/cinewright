import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from '../../../runtime/timeline.mjs';
import { study } from './choreography.mjs';

// Study-only authoring utility, deliberately separate from the two existing variants.
// Uses an unused destination and leaves canonical music bytes and audio untouched.
export async function materializeStudy({sourceProject,project,size=[1920,1080]}) {
  const base=path.dirname(fileURLToPath(import.meta.url));
  const work=JSON.parse(await fs.readFile(path.join(sourceProject,'work.json'),'utf8'));
  if(work.fps!==24 || work.frames<study[1] || work.audio.length!==1 || work.audio[0].gain!==1 || work.audio[0].at!==0) throw new Error('Study requires unchanged 24fps music source');
  work.title='Music Box Dancer — Porcelain Study (16–28s only)';work.size=[...size];work.background='#102d31';
  work.points['study.start']=study[0];work.points['study.end']=study[1]-1;
  work.spans['porcelain.study']=[...study];
  work.layers=[{id:'scene',module:'scene.mjs',in:study[0],out:study[1],exposure:[{from:study[0],to:study[1],every:1,value:'porcelain'}],config:{bindings:work.layers[0].config.bindings}}];
  validate(work);
  await fs.mkdir(project); // EEXIST is intentional; never replace a previous study.
  await fs.cp(path.join(sourceProject,'music'),path.join(project,'music'),{recursive:true,errorOnExist:true,force:false});
  for(const name of ['scene.mjs','choreography.mjs']) await fs.copyFile(path.join(base,name),path.join(project,name),fs.constants.COPYFILE_EXCL);
  await fs.copyFile(path.join(base,'../../../node_modules/three/LICENSE'),path.join(project,'THREE-LICENSE.txt'),fs.constants.COPYFILE_EXCL);
  await fs.writeFile(path.join(project,'work.json'),JSON.stringify(work,null,2)+'\n',{flag:'wx'});
  return {project:path.resolve(project),range:study,fps:work.fps};
}
