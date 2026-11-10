// Output-bound integration evidence. PNG identity is local to the recorded Chrome version.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {openRevision,checksum} from '../../scripts/revisions.mjs';
import {render,findJob} from '../../scripts/jobs.mjs';
import {host} from '../../scripts/server.mjs';
import {browser,run,ffmpeg,ffprobe} from '../../scripts/execution.mjs';
const [destination]=process.argv.slice(2);
if(!destination)throw Error('Usage: node examples/relation-studies/verify.mjs OUTPUT_FROM_RUN');
const root=path.resolve(destination),{store,results}=JSON.parse(await fs.readFile(path.join(root,'results.json')));
const evidence=path.join(root,'verification');await fs.mkdir(evidence);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={scope:'Technical identity only; automatic playback is not human viewing/listening or artistic acceptance.',results:[]};
const client=await browser();
try{
 for(const result of results){
  const snapshot=await openRevision(store,result.revision),canonical=await findJob(store,result.job),work=snapshot.manifest;
  assert.equal(canonical.revision,result.revision);
  assert.equal(await checksum(canonical.output),canonical.outputSha256);
  assert.equal(await checksum(result.output),canonical.outputSha256);
  const site=await host({snapshot,audio:canonical.audio.file});
  const page=await client.newPage();
  try{
   await page.goto(`${site.url}/?muted=1`);await page.waitForFunction(()=>window.direction||window.failure);
   assert.equal(await page.evaluate(()=>window.failure),undefined);
   const baseline=[];
   for(let f=0;f<work.frames;f++)baseline.push(await checksum(path.join(path.dirname(canonical.output),'frames',`${String(f).padStart(7,'0')}.png`)));
   for(const order of ['forward','reverse','direct']){
    for(let i=0;i<work.frames;i++){
     const f=order==='forward'?i:order==='reverse'?work.frames-1-i:i*137%work.frames;
     const image=await page.evaluate(f=>{window.direction.seek(f);return document.getElementById('picture').toDataURL().split(',')[1];},f);
     assert.equal(sha(Buffer.from(image,'base64')),baseline[f],`${result.name} ${order} ${f}`);
    }
   }
   // Collect a complete 1x audio-clock run without interpreting the experience.
   const playback=await page.evaluate(async()=>{
    const shown=[];const seen=e=>shown.push(e.detail.frame);window.addEventListener('directionframe',seen);
    window.direction.seek(0);const began=performance.now();await window.direction.play();
    await new Promise((resolve,reject)=>{const timer=setInterval(()=>{
     if(window.failure||performance.now()-began>30000){clearInterval(timer);reject(Error(window.failure||'Playback timeout'));}
     else if(!window.direction.status().playing){clearInterval(timer);resolve();}
    },25);});
    window.removeEventListener('directionframe',seen);
    return {wallMs:performance.now()-began,presented:shown,final:window.direction.status().frame};
   });
   assert.equal(playback.final,work.frames-1);
   assert(playback.presented.length>work.frames*.5);
   const boundary=result.name==='cups'?264:result.name==='doorway'?120:156;
   const frameJobs=[];
   for(const f of [0,boundary,work.frames-1]){
    const job=await render(snapshot,store,{mode:'frame',from:f,to:f+1,scale:1});assert.equal(job.status,'completed',job.error);
    assert.equal(await checksum(job.output),baseline[f]);frameJobs.push({frame:f,job:job.id,output:job.output});
   }
   const from=boundary-1,to=result.name==='cups'?338:result.name==='doorway'?181:203;
   const segment=await render(snapshot,store,{mode:'video',from,to,scale:1});assert.equal(segment.status,'completed',segment.error);
   for(let f=from;f<to;f++)assert.equal(await checksum(path.join(path.dirname(segment.output),'frames',`${String(f-from).padStart(7,'0')}.png`)),baseline[f]);
   const audio={};
   for(const [label,file] of [['source',path.join(snapshot.root,'project/score.wav')],['mix',canonical.audio.file],['aac',canonical.output],['segment',segment.output]]){
    const out=path.join(evidence,`${result.name}-${label}.s16`);
    await run(ffmpeg,['-v','error','-i',file,'-map','0:a:0','-f','s16le','-ac','2','-ar','48000',out]);
    audio[label]=await fs.readFile(out);
   }
   assert.deepEqual(audio.mix,audio.source,'PCM mix must preserve authored source samples at at=0');
   assert.equal(audio.source.length,work.frames*2000*4);
   const compare=(encoded,reference)=>{
    const n=Math.min(encoded.length,reference.length)/2;let dot=0,a2=0,b2=0,error=0;
    for(let i=0;i<n;i++){const a=encoded.readInt16LE(i*2),b=reference.readInt16LE(i*2);dot+=a*b;a2+=a*a;b2+=b*b;error+=(a-b)**2;}
    return {samplesPerChannel:encoded.length/4,correlation:dot/Math.sqrt(a2*b2),rmsError:Math.sqrt(error/n)/32768};
   };
   const encoded=compare(audio.aac,audio.source),trim=compare(audio.segment,audio.source.subarray(from*2000*4,to*2000*4));
   assert(encoded.correlation>.98&&encoded.rmsError<.01,JSON.stringify(encoded));assert(trim.correlation>.98&&trim.rmsError<.01,JSON.stringify(trim));
   const probe=JSON.parse((await run(ffprobe,['-v','error','-show_streams','-of','json',canonical.output],{capture:true})).toString());
   const video=probe.streams.find(s=>s.codec_type==='video');assert.equal(Number(video.nb_frames),work.frames);
   // Original note onset positions survive the shared mix, including deliberate silence.
   const source=JSON.parse(await fs.readFile(path.join(snapshot.root,'project/source.json')));
   const onset=audio.source.findIndex((v,i)=>i%4===0&&(audio.source.readInt16LE(i)!==0||audio.source.readInt16LE(i+2)!==0))/4;
   const expected=source.score[0].frame*2000;assert(onset>=expected&&onset<=expected+4,`${onset} vs ${expected}`);
   const points=[...new Set([0,work.frames-1,...Object.values(work.points).flatMap(f=>[f-1,f,f+1]).filter(f=>f>=0&&f<work.frames)])].sort((a,b)=>a-b);
   const boundaryDir=path.join(evidence,result.name);await fs.mkdir(boundaryDir);
   for(const f of points)await fs.copyFile(path.join(path.dirname(canonical.output),'frames',`${String(f).padStart(7,'0')}.png`),path.join(boundaryDir,`f${String(f).padStart(4,'0')}.png`));
   report.results.push({name:result.name,revision:result.revision,job:result.job,pixelChecks:{forward:work.frames,reverse:work.frames,direct:work.frames,boundaries:points},frameJobs,
    segment:{job:segment.id,from,to,output:segment.output,allFramesMatch:true},pcmBitExact:true,sourceSamples:audio.source.length/4,firstNonzeroSample:onset,expectedOnsetSample:expected,
    aac:encoded,segmentAAC:trim,playback,video:{frames:Number(video.nb_frames),fps:video.r_frame_rate,width:video.width,height:video.height}});
   await fs.writeFile(path.join(evidence,'report.json'),JSON.stringify(report,null,2)+'\n');
   console.log(`${result.name}: seek, frame, segment, PCM/AAC placement and automatic playback passed`);
  }finally{await page.close();await site.close();}
 }
}finally{await client.close();}
