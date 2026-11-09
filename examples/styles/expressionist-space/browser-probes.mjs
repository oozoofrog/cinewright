// Run only under the shared GPU lock. Small actual alpha/color/lifecycle/GLB shader probes.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {freeze}from '../../../scripts/revisions.mjs';import {host}from '../../../scripts/server.mjs';import {browser}from '../../../scripts/execution.mjs';import {mix}from '../../../scripts/audio.mjs';
const project=path.resolve(process.argv[2]),store=path.resolve(process.argv[3]),output=path.resolve(process.argv[4]);
const lock=path.resolve('.direction/aesthetic-toolkit-gpu.lock');await fs.mkdir(lock);
let site,client;const errors=[];try{
 await fs.mkdir(output,{recursive:true});const snapshot=await freeze(project,store),audio=await mix(snapshot,output,{log:path.join(output,'audio.log')});site=await host({snapshot,audio:audio.file});client=await browser();const page=await client.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(site.url+'/?scale=.25&muted=1');await page.waitForFunction(()=>window.direction||window.failure);assert.equal(await page.evaluate(()=>window.failure),undefined);
 const report=await page.evaluate(async()=>{
  const {Scene,Mesh,PlaneGeometry,MeshBasicMaterial,OrthographicCamera}=await import('three');
  const {createCanvasAdapter}=await import('/project/modules/fx3d/adapter.mjs');
  const adapter=createCanvasAdapter({width:128,height:128}),scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
  const geometry=new PlaneGeometry(1,1),material=new MeshBasicMaterial({color:'#808080'});scene.add(new Mesh(geometry,material));
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const g=canvas.getContext('2d');adapter.draw(g,scene,camera);const pixel=(x,y)=>Array.from(g.getImageData(x,y,1,1).data);const opaque=pixel(64,64),clear=pixel(4,4);material.transparent=true;material.opacity=.5;material.needsUpdate=true;
  g.clearRect(0,0,128,128);adapter.draw(g,scene,camera);const alpha=pixel(64,64);g.fillStyle='#000000';g.fillRect(0,0,128,128);adapter.draw(g,scene,camera);const black=pixel(64,64);g.fillStyle='#ffffff';g.fillRect(0,0,128,128);adapter.draw(g,scene,camera);const white=pixel(64,64);const stats=adapter.getStats();geometry.dispose();material.dispose();adapter.dispose();adapter.dispose();const disposedStats=adapter.getStats();
  const {prepare}=await import('/project/modules/styles/expressionist-space/index.mjs');const spec=(await(await fetch('/project/work.json')).json()).layers[0].config.scene;
  const api={width:320,height:180,pixelWidth:320,pixelHeight:180,fps:24,frames:192,path:p=>'/project/'+p};const cycles=[];
  for(let i=0;i<3;i++){const layer=await prepare(api,{scene:spec});const c=document.createElement('canvas');c.width=320;c.height=180;const g=c.getContext('2d');const t=f=>({frame:f,exposed:f,seconds:f/24,read:()=>.7,write:()=>{}});for(const f of [0,191,96,0]){layer.evaluate(t(f));layer.draw(g,t(f));}const before=layer.getStats();layer.dispose();layer.dispose();cycles.push({before,after:layer.getStats()});}
  // Missing named clip fails after local GLB allocations; subsequent valid prepare must still work.
  const bad=structuredClone(spec);const object=bad.objects.find(o=>o.asset);object.clip={name:'missing-authored-clip'};let partialFailure;try{await prepare(api,{scene:bad});}catch(e){partialFailure=String(e);}
  const afterFailure=await prepare(api,{scene:spec});afterFailure.dispose();
  return {opaque,clear,alpha,black,white,stats,disposedStats,cycles,partialFailure};
 });
 assert.deepEqual(report.clear,[0,0,0,0]);assert.ok(report.opaque.slice(0,3).every(x=>Math.abs(x-128)<=2));assert.equal(report.opaque[3],255);assert.ok(Math.abs(report.alpha[3]-128)<=2);assert.ok(report.black.slice(0,3).every(x=>Math.abs(x-64)<=2));assert.ok(report.white.slice(0,3).every(x=>Math.abs(x-192)<=2));assert.equal(report.disposedStats.disposed,true);assert.ok(report.cycles.every(x=>x.before.geometries>0&&x.after.disposed&&x.after.geometries===0&&x.after.textures===0),'rendered resources return to zero after each dispose');assert.match(report.partialFailure,/clip not found/);assert.equal(errors.length,0,JSON.stringify(errors));
 await fs.writeFile(path.join(output,'probes.json'),JSON.stringify({revision:snapshot.revision,browser:client.version(),...report,errors},null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await client?.close();await site?.close();await fs.rmdir(lock);}
