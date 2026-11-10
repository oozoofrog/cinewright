import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from './build.mjs';
import {studies} from './studies.mjs';
import {freeze,checksum,openRevision} from '../../scripts/revisions.mjs';
import {render,findJob} from '../../scripts/jobs.mjs';
const [destination]=process.argv.slice(2);
if(!destination)throw Error('Usage: node examples/relation-studies/run.mjs NEW_OUTPUT_DIRECTORY');
const root=path.resolve(destination);await fs.mkdir(root);
const store=path.join(root,'store'),results=[];
for(const name of Object.keys(studies)){
 const {audio}=await build({name,project:path.join(root,name)});
 const snapshot=await freeze(path.join(root,name),store);
 const job=await render(snapshot,store,{mode:'video',from:0,to:studies[name].frames,scale:1});
 if(job.status!=='completed')throw Error(`Render failed: ${job.id}: ${job.log}`);
 const canonical=await findJob(store,job.id);await openRevision(store,canonical.revision);
 const output=path.join(root,`${name}.mp4`);await fs.copyFile(canonical.output,output);
 results.push({name,revision:canonical.revision,job:canonical.id,canonicalOutput:canonical.output,output,sha256:await checksum(output),audio});
 await fs.writeFile(path.join(root,'results.json'),JSON.stringify({store,results},null,2)+'\n');
}
console.log(JSON.stringify({root,store,results},null,2));
