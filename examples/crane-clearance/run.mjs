import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from './build.mjs';
import {freeze,openRevision,checksum} from '../../scripts/revisions.mjs';
import {render,findJob} from '../../scripts/jobs.mjs';

// This is an example recipe, not a new rendering engine or art evaluator.
const [destination]=process.argv.slice(2);
if(!destination)throw Error('Usage: node examples/crane-clearance/run.mjs NEW_OUTPUT_DIRECTORY');
const root=path.resolve(destination);await fs.mkdir(root);
const store=path.join(root,'store'), results=[];
for(const label of ['first-pass','clearance']) {
  const source=JSON.parse(await fs.readFile(new URL(`./${label}.json`,import.meta.url),'utf8'));
  const project=path.join(root,label);await build({source,project});
  const snapshot=await freeze(project,store);
  const job=await render(snapshot,store,{mode:'video',from:0,to:source.frames,scale:1});
  if(job.status!=='completed')throw Error(`Render failed: ${job.log}`);
  // Canonical existing tools bind diagnostics to bytes actually rendered.
  const canonical=await findJob(store,job.id);
  const frozen=await openRevision(store,canonical.revision);
  const frozenSource=JSON.parse(await fs.readFile(path.join(frozen.root,'project/source.json'),'utf8'));
  const {makeEvaluator}=await import(pathToFileURL(path.join(frozen.root,'project/scene.mjs')));
  const evaluate=makeEvaluator(frozenSource);
  const rows=Array.from({length:source.frames},(_,frame)=>({frame,...evaluate(frame)}));
  results.push({label,revision:canonical.revision,job:canonical.id,output:canonical.output,
    outputSha256:await checksum(canonical.output),sourceSha256:await checksum(path.join(frozen.root,'project/source.json')),rows});
}
await fs.writeFile(path.join(root,'comparison.json'),JSON.stringify({scope:'Original vector functional study; geometric collision evidence, not artistic acceptance',store,results},null,2)+'\n');
console.log(JSON.stringify({root,comparison:path.join(root,'comparison.json'),results:results.map(({rows,...r})=>({...r,collisionFrames:rows.filter(r=>r.collision).map(r=>r.frame)}))},null,2));
