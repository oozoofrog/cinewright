import fs from 'node:fs/promises';
import path from 'node:path';
import {studies} from '../../examples/relation-studies/studies.mjs';
import {build} from '../../examples/relation-studies/build.mjs';
import {freeze,checksum} from '../../scripts/revisions.mjs';
import {render} from '../../scripts/jobs.mjs';
const root=path.resolve('evidence/code-expression-20261110'),store=path.join(root,'final/store');
const records=[];
for(const label of ['fold-shadow-fixed','without-traces','without-first-visit']){
 const name=label==='fold-shadow-fixed'?'fold':'cups',source=structuredClone(studies[name]);
 if(label==='without-traces')source.placements=[];
 if(label==='without-first-visit'){
  source.placements.shift();source.tracks.a=source.tracks.a.filter(k=>k.frame>=264);
  source.tracks.a.unshift({frame:0,value:[440,330],interpolation:'hold'});
 }
 const project=path.join(root,label);await build({name,source,project});
 const snapshot=await freeze(project,store),job=await render(snapshot,store,{mode:'video',from:0,to:source.frames,scale:1});
 if(job.status!=='completed')throw Error(job.error);
 records.push({label,revision:snapshot.revision,job:job.id,output:job.output,sha256:await checksum(job.output)});
 if(label==='fold-shadow-fixed'){
  const final=path.join(root,'final'),results=JSON.parse(await fs.readFile(path.join(final,'results.json')));
  const old=results.results.find(r=>r.name==='fold');
  await fs.writeFile(path.join(root,'fold-r1.json'),JSON.stringify(old,null,2)+'\n');
  await fs.rename(path.join(final,'fold.mp4'),path.join(final,'fold-r1.mp4'));
  await fs.copyFile(job.output,path.join(final,'fold.mp4'));
  Object.assign(old,{revision:snapshot.revision,job:job.id,canonicalOutput:job.output,sha256:await checksum(job.output)});
  await fs.writeFile(path.join(final,'results.json'),JSON.stringify(results,null,2)+'\n');
 }
 await fs.writeFile(path.join(root,'comparisons.json'),JSON.stringify(records,null,2)+'\n');
}
