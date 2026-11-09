import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildMusicBoxProject } from '../examples/music-box-dancer/build.mjs';
import { limitedPose, groupCounterpoint, shapeMatch, visualPhases } from '../examples/music-box-dancer/recipes.mjs';
import { materializeKit } from '../scripts/materialize-kit.mjs';
import { validate } from '../runtime/timeline.mjs';
import { freeze } from '../scripts/revisions.mjs';
import { host } from '../scripts/server.mjs';
import { browser } from '../scripts/execution.mjs';

const runs=fileURLToPath(new URL('../.direction/test-runs/',import.meta.url));
await fs.mkdir(runs,{recursive:true});
const scratch=await fs.mkdtemp(path.join(runs,'music-box-dancer-'));
console.log(`Music Box Dancer SYNTHETIC ONLY evidence: ${scratch}`);
async function fixture(name,frames=720) {
  const project=path.join(scratch,name), fps=24, samples=frames*2000;
  await fs.mkdir(path.join(project,'assets'),{recursive:true});
  // Synthetic SILENCE is a test transport fixture only, never production music.
  const wav=Buffer.alloc(44+samples*4);
  wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
  wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(48000,24);wav.writeUInt32LE(192000,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples*4,40);
  await fs.writeFile(path.join(project,'assets/synthetic-silence.wav'),wav);
  const source={version:1,fps,frames,audio:{asset:'assets/synthetic-silence.wav',sourceIn:0,sourceOut:samples,at:0,gain:1,provenance:'TEST ONLY synthetic silence; not recording analysis'}};
  const onsets=Array.from({length:Math.floor((frames-24)/16)},(_,i)=>({frame:24+i*16,seconds:(24+i*16)/fps,strength:.4+(i%3)*.2,quantizationError:0}));
  const keys=[[0,.2],[Math.floor(frames/2),.85],[frames-1,.1]];
  const derived={version:1,fps,frames,events:{onsets,beats:[]},tracks:{energy:keys},sections:[],manifest:{points:{'music.first':24},spans:{'music.all':[0,frames]},channels:{'music.energy':{producer:'$data',consumers:['scene'],kind:'number',space:'normalized',from:0,to:frames,mode:'linear',data:{keys}}}},diagnostics:{provenance:'SYNTHETIC TEST ONLY',limitations:['No audio structure claim']}};
  await fs.mkdir(path.join(project,'music'));
  await fs.writeFile(path.join(project,'music/source.json'),JSON.stringify(source));
  // Deliberately non-pretty formatting must survive the builder byte-for-byte.
  await fs.writeFile(path.join(project,'music/derived.json'),JSON.stringify(derived));
  return {project,source,derived};
}

test('three executable recipes expose planted contact/hold, independent voices and shape return', () => {
  const events=[{frame:24,strength:1},{frame:48,strength:1},{frame:72,strength:1}];
  assert.equal(limitedPose({frame:23,events,fps:24}).pose,'anticipate');
  assert.equal(limitedPose({frame:24,events,fps:24}).pose,'contact');
  assert.equal(limitedPose({frame:28,events,fps:24}).pose,'hold');
  assert.equal(limitedPose({frame:33,events,fps:24}).pose,'release');
  assert.deepEqual(limitedPose({frame:24,events,fps:24}).foot,[0,0]);
  assert.deepEqual(limitedPose({frame:40,events,fps:24}).foot,[0,0]);
  const voices=groupCounterpoint({frame:26,events,fps:24});
  assert.ok(voices[0].amount>0); assert.equal(voices[1].amount,0); assert.equal(voices[2].amount,0);
  assert.ok(groupCounterpoint({frame:53,events,fps:24})[1].amount>0);
  assert.ok(groupCounterpoint({frame:1000,events,fps:24}).every(v=>v.amount===0));
  const formation=shapeMatch({frames:100});
  assert.deepEqual(formation.evaluate({frame:0}),formation.evaluate({frame:99}));
  assert.notDeepEqual(formation.evaluate({frame:0}),formation.evaluate({frame:36}));
  assert.equal(visualPhases({sections:[]},720).length,7);
  assert.notEqual(visualPhases({sections:[]},720)[1].role,visualPhases({sections:[]},720)[4].role);
  assert.ok(visualPhases({sections:[]},720).every(p=>p.provenance.startsWith('Authored')));
  const anchored=visualPhases({sections:[{name:'a',from:0,to:80},{name:'b',from:80,to:500},{name:'c',from:500,to:720}]},720);
  assert.equal(anchored[1].from,80); assert.equal(anchored[1].anchor,'b');
});

test('materialize-kit closes dependencies, is idempotent, and refuses unknown, authored or symlink paths', async () => {
  const project=path.join(scratch,'kit');
  const first=await materializeKit({project,modules:['particles','focus']});
  assert.deepEqual(first.modules,['motion','particles','focus']);
  assert.deepEqual(await materializeKit({project,modules:['particles','focus']}),first);
  const copied=await import(pathToFileURL(path.join(project,'modules/fx/particles.mjs')));
  assert.equal(typeof copied.prepare,'function');
  await fs.appendFile(path.join(project,'modules/motion.mjs'),'\n// authored edit\n');
  await assert.rejects(materializeKit({project,modules:['motion']}),/authored\/unknown/);
  const unknown=path.join(scratch,'unknown');await fs.mkdir(path.join(unknown,'modules'),{recursive:true});
  await fs.writeFile(path.join(unknown,'modules/motion.mjs'),'original');
  await assert.rejects(materializeKit({project:unknown,modules:['motion']}),/authored\/unknown/);
  assert.equal(await fs.readFile(path.join(unknown,'modules/motion.mjs'),'utf8'),'original');
  const links=path.join(scratch,'links');await fs.mkdir(links);await fs.symlink(path.join(project,'modules'),path.join(links,'modules'));
  await assert.rejects(materializeKit({project:links,modules:['focus']}),/not regular/);
  await assert.rejects(materializeKit({project,modules:['../motion']}),/unknown module/);
});

for(const variant of ['theatre','counterpoint']) {
  test(`Music Box Dancer ${variant} preserves canonical data/audio and evaluates every phase without frame history`, async () => {
    const input=await fixture(variant);
    const canonical=await fs.readFile(path.join(input.project,'music/derived.json'));
    const source=await fs.readFile(path.join(input.project,'music/source.json'));
    const before=structuredClone(input);
    const result=await buildMusicBoxProject({...input,variant,size:[960,540]});
    assert.deepEqual(input,before);
    assert.deepEqual(await fs.readFile(path.join(input.project,'music/derived.json')),canonical);
    assert.deepEqual(await fs.readFile(path.join(input.project,'music/source.json')),source);
    assert.deepEqual(validate(result.work).audio,[input.source.audio]);
    assert.equal(result.work.frames,720);assert.equal(result.work.fps,24);
    assert.equal(result.work.layers[0].id,'scene');
    assert.deepEqual(result.work.channels,input.derived.manifest.channels);
    const sceneCode=await fs.readFile(path.join(input.project,'scene.mjs'),'utf8');
    assert.ok(!sceneCode.includes('../../modules/'));
    const {prepare}=await import(pathToFileURL(path.join(input.project,'scene.mjs')));
    const scene=await prepare({width:960,height:540,frames:720,fps:24,json:async()=>input.derived,image:async()=>({naturalWidth:1920,naturalHeight:1080})},result.work.layers[0].config);
    const reads=[];
    const time=frame=>({frame,exposed:frame-frame%(variant==='theatre'?2:1),read:(name,space)=>{reads.push([name,space]);return .5;}});
    const states=new Map([0,80,220,360,500,600,719].map(frame=>[frame,scene.evaluate(time(frame))]));
    for(const frame of [719,0,600,80,500,220,360]) assert.deepEqual(scene.evaluate(time(frame)),states.get(frame));
    assert.ok(reads.some(([name,space])=>name==='music.energy' && space==='normalized'));
    // Every draw path runs against a finite-coordinate context before native pixel validation below.
    let operations=0;
    const g=new Proxy({globalAlpha:1}, {get(target,key){ if(key in target)return target[key];return (...args)=>{operations++;for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),String(key));};},set(target,key,value){target[key]=value;return true;}});
    for(const [frame,state] of states)scene.draw(g,time(frame),state);
    assert.ok(operations>300);
    await buildMusicBoxProject({...input,variant,size:[960,540]});
    await fs.appendFile(path.join(input.project,'scene.mjs'),'\n// authored\n');
    await assert.rejects(buildMusicBoxProject({...input,variant,size:[960,540]}),/authored\/unknown/);
  });
}

test('builder rejects changed analysis, missing source audio, mismatched timing and foreign channel consumers', async () => {
  const input=await fixture('invalid');
  await assert.rejects(buildMusicBoxProject({...input,source:{...input.source,audio:undefined}}),/source.audio/);
  await assert.rejects(buildMusicBoxProject({...input,source:{...input.source,frames:721}}),/timing/);
  await assert.rejects(buildMusicBoxProject({...input,derived:{...input.derived,diagnostics:{changed:true}}}),/differs/);
  const foreign=structuredClone(input.derived);foreign.manifest.channels['music.energy'].consumers=['other'];
  await assert.rejects(buildMusicBoxProject({...input,derived:foreign}),/target only scene/);
  await fs.symlink(path.join(input.project,input.source.audio.asset),path.join(input.project,'assets/link.wav'));
  await assert.rejects(buildMusicBoxProject({...input,source:{...input.source,audio:{...input.source.audio,asset:'assets/link.wav'}}}),/symlinks/);
});

test('silent native browser frames from frozen projects are distinct and deterministic on random seek', {timeout:120000}, async t => {
  const client=await browser();t.after(()=>client.close());
  const hashes={};
  for(const variant of ['theatre','counterpoint']) {
    const input=await fixture(`native-${variant}`);
    await buildMusicBoxProject({...input,variant,size:[960,540]});
    const snapshot=await freeze(input.project,path.join(scratch,`frozen-${variant}`));
    // Delete mutable generated scene and kit: successful native frames must use the frozen copies.
    await fs.rm(path.join(input.project,'modules'),{recursive:true});await fs.rm(path.join(input.project,'scene.mjs'));
    const html=path.join(scratch,`native-${variant}.html`);
    await fs.writeFile(html,'<!doctype html><style>body{margin:0}canvas{display:block}</style><canvas id="picture"></canvas><script type="module">import {open} from "/runtime/compositor.mjs"; try { window.fixture=await open(document.querySelector("canvas")); } catch(e) { window.failure=e.stack; }</script>');
    const site=await host({snapshot,files:new Map([['/fixture.html',html]])});t.after(site.close);
    const page=await client.newPage({viewport:{width:960,height:540}});t.after(()=>page.close());
    await page.goto(`${site.url}/fixture.html`);await page.waitForFunction(()=>window.fixture||window.failure);
    assert.equal(await page.evaluate(()=>window.failure),undefined);
    const capture=frame=>page.evaluate(f=>{window.fixture.draw(f);return document.querySelector('canvas').toDataURL();},frame);
    const frames=[0,80,220,360,500,600,719], reference={};
    for(const frame of frames) {
      reference[frame]=await capture(frame);
      await page.locator('canvas').screenshot({path:path.join(scratch,`${variant}-${frame}.png`)});
    }
    for(const frame of [719,80,0,500,220,600,360])assert.equal(await capture(frame),reference[frame]);
    if(variant==='theatre') assert.equal(await capture(80),await capture(81),'paper exposure holds on twos');
    else {
      await capture(0);
      const keyShaft=await page.evaluate(()=>[...document.querySelector('canvas').getContext('2d').getImageData(365,290,1,1).data]);
      assert.deepEqual(keyShaft,[180,82,62,255],'printed key retains an ink shaft after its paper-colored hole');
    }
    hashes[variant]=Object.fromEntries(frames.map(frame=>[frame,createHash('sha256').update(reference[frame]).digest('hex')]));
    assert.ok(new Set(Object.values(hashes[variant])).size>=6,'full-track roles are visibly different, not a padded short loop');
    await fs.writeFile(path.join(scratch,`${variant}-revision.json`),JSON.stringify({revision:snapshot.revision,frames:hashes[variant]},null,2));
  }
  for(const frame of [0,80,220,360,500,600,719])assert.notEqual(hashes.theatre[frame],hashes.counterpoint[frame]);
});
