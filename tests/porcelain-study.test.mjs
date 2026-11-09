import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { poseAt,poseSamples,study } from '../examples/music-box-dancer/porcelain/choreography.mjs';
import { materializeStudy } from '../examples/music-box-dancer/porcelain/materialize.mjs';
import { freeze } from '../scripts/revisions.mjs';
import { host } from '../scripts/server.mjs';
import { browser } from '../scripts/execution.mjs';

const root=fileURLToPath(new URL('../.direction/test-runs/',import.meta.url));
await fs.mkdir(root,{recursive:true});
const scratch=await fs.mkdtemp(path.join(root,'porcelain-'));
console.log(`Porcelain SYNTHETIC fixture evidence: ${scratch}`);

test('turn keeps continuous angular velocity, finite poses and a bounded study',()=>{
  const samples=poseSamples();assert.equal(samples.length,288);
  assert.deepEqual(poseAt(-100),poseAt(384));assert.deepEqual(poseAt(900),poseAt(671));
  assert.throws(()=>poseAt(NaN),/finite/);
  for(const p of samples) assert.ok(Object.values(p).every(Number.isFinite));
  for(let f=506;f<554;f++) assert.ok(poseAt(f+1).yaw-poseAt(f).yaw>.025,'turn must not stop on intermediate pose keys');
  for(const f of [505,527,554]) {
    const left=(poseAt(f).yaw-poseAt(f-.001).yaw)/.001;
    const right=(poseAt(f+.001).yaw-poseAt(f).yaw)/.001;
    assert.ok(Math.abs(left-right)<.0001,'no angular velocity jump at key');
  }
  for(let f=384;f<671;f++)assert.ok(poseAt(f+1).yaw>=poseAt(f).yaw,'no unintended direction reversal');
  assert.ok(poseAt(671).yaw-poseAt(384).yaw>Math.PI*2);
});

test('study preserves canonical bytes/audio, freezes locally, and renders reverse/random seeks identically', {timeout:120000},async t=>{
  const sourceProject=path.join(scratch,'source'),project=path.join(scratch,'study');
  await fs.mkdir(path.join(sourceProject,'music'),{recursive:true});
  const frames=720,keys=[[0,.2],[500,.7],[719,.1]];
  const binding={name:'music.energy',space:'normalized',kind:'number',from:0,to:frames};
  const work={version:1,title:'SYNTHETIC TEST SILENCE',size:[640,360],fps:24,frames,points:{},spans:{},channels:{'music.energy':{producer:'$data',consumers:['scene'],kind:'number',space:'normalized',from:0,to:frames,mode:'linear',data:{keys}}},layers:[{id:'scene',module:'unused.mjs',config:{bindings:[binding]}}],audio:[{asset:'music/silence.wav',sourceIn:0,sourceOut:1,at:0,gain:1}]};
  // Transport-only one-sample silence; never production music. Freeze does not mix.
  const wav=Buffer.alloc(48);wav.write('RIFF');wav.writeUInt32LE(40,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(48000,24);wav.writeUInt32LE(192000,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(4,40);
  await fs.writeFile(path.join(sourceProject,'work.json'),JSON.stringify(work));
  await fs.writeFile(path.join(sourceProject,'music/silence.wav'),wav);
  const canonical='{ "test": "synthetic only", "frames":720 }\n';
  await fs.writeFile(path.join(sourceProject,'music/derived.json'),canonical);
  await materializeStudy({sourceProject,project,size:[640,360]});
  await assert.rejects(materializeStudy({sourceProject,project}),/EEXIST/);
  assert.equal(await fs.readFile(path.join(project,'music/derived.json'),'utf8'),canonical);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(project,'work.json'))).audio,work.audio);
  const snapshot=await freeze(project,path.join(scratch,'store'));
  assert.ok(snapshot.paths.has('vendor/three/LICENSE'));
  await fs.rm(path.join(project,'scene.mjs'));await fs.rm(path.join(project,'choreography.mjs'));
  const html=path.join(scratch,'fixture.html');
  await fs.writeFile(html,`<!doctype html><link rel="icon" href="data:,"><canvas></canvas><script type="importmap">{"imports":{"three":"/vendor/three/three.module.js"}}</script><script type="module">import {open} from '/runtime/compositor.mjs';try{window.fixture=await open(document.querySelector('canvas'));}catch(e){window.failure=e.stack;}</script>`);
  const site=await host({snapshot,files:new Map([['/fixture.html',html]])});t.after(site.close);
  const client=await browser();t.after(()=>client.close());
  const page=await client.newPage();t.after(()=>page.close());
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`${site.url}/fixture.html`);await page.waitForFunction(()=>window.fixture||window.failure);
  assert.equal(await page.evaluate(()=>window.failure),undefined);
  const capture=f=>page.evaluate(frame=>{window.fixture.draw(frame);return document.querySelector('canvas').toDataURL();},f);
  const reference={},framesToTest=[383,384,406,433,455,483,505,527,554,576,599,628,648,671,672];
  for(const frame of framesToTest)reference[frame]=await capture(frame);
  for(const frame of [672,671,384,554,433,671,505,383,527,406,648,455,599,628,483,576])assert.equal(await capture(frame),reference[frame],`pixel determinism at ${frame}`);
  assert.equal(reference[383],reference[672],'half-open study boundaries have no scene');
  assert.notEqual(reference[384],reference[383]);assert.notEqual(reference[671],reference[672]);
  assert.equal(new Set(framesToTest.filter(f=>f>=384&&f<672).map(f=>reference[f])).size,13,'poses produce distinct visible states');
  assert.deepEqual(errors,[]);
  const hashes=Object.fromEntries(Object.entries(reference).map(([f,png])=>[f,createHash('sha256').update(png).digest('hex')]));
  await fs.writeFile(path.join(scratch,'validation.json'),JSON.stringify({revision:snapshot.revision,study,hashes,errors,mutableSceneRemoved:true},null,2));
});
