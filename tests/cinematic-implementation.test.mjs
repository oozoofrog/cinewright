import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createReconstruction} from '../modules/fx2d/watercolor-reconstruct.mjs';
import {prepare,validateScene} from '../modules/styles/line-wash/index.mjs';
import {sampleKeys} from '../modules/styles/expressionist-space/index.mjs';
const read=async p=>JSON.parse(await fs.readFile(new URL('../'+p,import.meta.url)));
test('reconstruction preserves flat concentrations, layer order and deterministic paper, without square plateaus',()=>{
 const r=createReconstruction(4,4,64,64,{grain:0}),field=Array(16).fill(.1),p=r.draw([field],[[30,80,150]],{density:9});
 for(let i=4;i<p.length;i+=4)assert.deepEqual(p.slice(i,i+4),p.slice(0,4));
 const peak=Array(16).fill(0);peak[5]=.2;const a=Uint8Array.from(r.draw([peak],[[30,80,150]],{density:9}));r.draw([field],[[200,30,40]]);assert.deepEqual(Uint8Array.from(r.draw([peak],[[30,80,150]],{density:9})),a);
 assert.ok(new Set(Array.from(a).filter((_,i)=>i%4===0)).size>30);
 const grain=createReconstruction(4,4,64,64,{seed:17});const ga=Uint8Array.from(grain.draw([field],[[30,80,150]]));assert.ok(new Set(Array.from(ga).filter((_,i)=>i%4===0)).size>5);assert.deepEqual(Uint8Array.from(grain.draw([field],[[30,80,150]])),ga);
 assert.throws(()=>createReconstruction(0,2,64,64));assert.throws(()=>createReconstruction(4,4,4096,4096));assert.throws(()=>createReconstruction(4,4,64,64,{grain:NaN}));
});
test('commuter continuous grips stay on the SAME paper corners, pose read lifts paper, feet remain planted',async()=>{
 const s=await read('recipes/styles/line-wash/commuter.json'),layer=await prepare({},{scene:s});let last;
 for(let f=102;f<192;f++){
  const lines=Object.fromEntries(layer.evaluate({frame:f,exposed:f}).lines.map(l=>[l.id,l.points]));
  for(const [hand,index]of [['handleft',5],['handright',2]])assert.deepEqual(lines[hand][3].slice(0,2),lines.letter[index].slice(0,2));
  if(last)for(let i=0;i<7;i++)assert.ok(Math.hypot(...lines.letter[i].slice(0,2).map((v,j)=>v-last[i][j]))<10,'no paper jump');
  last=lines.letter;
 }
 const at=f=>layer.evaluate({frame:f,exposed:f}).lines.find(l=>l.id==='letter').points;
 assert.ok(at(140)[2][0]-at(104)[2][0]>180);assert.ok(at(140)[5][1]-at(156)[5][1]>45);
 for(const side of ['left','right'])for(const [start,end]of s.contacts[side]){
  const initial=layer.evaluate({frame:start,exposed:start}).lines.find(l=>l.id==='shoe'+side).points;
  for(let f=start;f<end;f++){const a=Object.fromEntries(layer.evaluate({frame:f,exposed:f}).lines.map(l=>[l.id,l.points]));assert.deepEqual(a['shoe'+side],initial);assert.deepEqual(a['leg'+side][2],a['shoe'+side][0]);assert.deepEqual(a['leg'+side][3],a['shoe'+side].at(-1));}
 }
 layer.dispose();
});
test('wash bank rejects topology/time failures and draws corresponding shapes on reverse seeks',async()=>{
 const s=await read('recipes/styles/line-wash/commuter.json');
 for(const mutate of [w=>{for(const k of w.bank)k.points=k.points.slice(0,2)},w=>w.bank[1].points.pop(),w=>w.bank[1].frame=0,w=>w.bank[1].points[0][0]=NaN,w=>w.bank.at(-1).frame=192]){const b=structuredClone(s);mutate(b.washes[1]);assert.throws(()=>validateScene(b));}
 // Recording polygon move/line commands exercises actual wash draw, not only evaluate().
 const wash={...s,strokes:[],hatches:[],erasures:[]},layer=await prepare({width:1920,height:1080},{scene:wash});let commands=[];
 const g=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...v)=>{if(['moveTo','lineTo'].includes(k))commands.push([k,...v]);}});
 const draw=f=>{commands=[];layer.draw(g,{frame:f,exposed:f});return JSON.stringify(commands)};
 const a=draw(44),b=draw(156);assert.notEqual(a,b);assert.equal(draw(44),a);assert.equal(draw(156),b);layer.dispose();
});
test('traveler is continuously transformed behind opaque jamb and train/shadow cues retain timing',async()=>{
 const s=await read('recipes/styles/expressionist-space/station.json'),o=s.objects.find(o=>o.id==='traveler');assert.equal(o.visible,undefined);assert.ok(s.objects.some(o=>o.id==='door-jamb-occluder'));assert.equal(o.exposure.every,1);
 let last=sampleKeys(o,70).position;for(let f=71;f<=156;f++){const p=sampleKeys(o,f).position;assert.ok(Math.hypot(...p.map((v,i)=>v-last[i]))<.2);last=p;}
 assert.deepEqual(s.objects.find(o=>o.id==='train-body').visible,[112,192]);
 const old=await read('tests/fixtures/station-before-cinematic.json');assert.deepEqual(s.objects.find(o=>o.id==='early-shadow'),old.objects.find(o=>o.id==='early-shadow'));
});

test('public station and designed reader builders package their actual authored assets',async t=>{
 const {mkdtemp,rm}=await import('node:fs/promises'),os=await import('node:os'),path=await import('node:path'),{buildExpressionist}=await import('../examples/styles/expressionist-space/build.mjs');
 const dir=await mkdtemp(path.join(os.tmpdir(),'cine-public-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 for(const recipe of ['station','reader']){const project=path.join(dir,recipe);await buildExpressionist(project,{recipe});const scene=JSON.parse(await fs.readFile(path.join(project,'style-scene.json')));for(const o of scene.objects)for(const key of ['asset','rig','motion'])if(o[key])assert.ok((await fs.stat(path.join(project,o[key]))).size>0);}
});
