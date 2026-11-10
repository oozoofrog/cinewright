import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve('evidence/2026-11-08-aesthetic-toolkit/C');const results=[];
for(const name of ['station-final','laboratory-final','effects','mixed','portrait']){
 const report=JSON.parse(await fs.readFile(path.join(root,name,'validation.json'),'utf8'));
 assert.equal(report.errors.length,0);assert.equal(report.network.length,0);assert.equal(report.freezeSourceIsolation,true);assert.equal(report.autoplay.completed,true);assert.ok(report.lifecycle.every(x=>x.disposedDrawRejected));
 if(name!=='portrait'){assert.equal(report.jobs.length,2);for(const job of report.jobs){assert.equal(job.pts.count,192);assert.equal(job.probe.streams[0].duration,'8.000000');}}
 results.push({scene:name,revision:report.revision,browser:report.browser,seekChecks:report.seek.checks,freezeSourceIsolation:report.freezeSourceIsolation,autoplay:report.autoplay,lifecycle:report.lifecycle,errors:report.errors,network:report.network,performance:report.performance,jobs:report.jobs.map(job=>({id:job.id,file:job.copy,probe:job.probe,pts:job.pts,flash:job.flash.status}))});
}
const probes=JSON.parse(await fs.readFile(path.join(root,'probes-final/probes.json'),'utf8'));
await fs.writeFile(path.join(root,'validation-summary.json'),JSON.stringify({results,probes,notes:['Automated browser playback, no human continuous viewing or aesthetic acceptance','Representative images inspected separately; same-machine pixels, not cross-GPU guarantee','GPU memory not measured; synchronous draw timing is not full GPU completion time']},null,2)+'\n');
console.log(JSON.stringify(results.map(x=>({scene:x.scene,revision:x.revision,seek:x.seekChecks,jobs:x.jobs.map(j=>({id:j.id,file:j.file,flash:j.flash}))})),null,2));
