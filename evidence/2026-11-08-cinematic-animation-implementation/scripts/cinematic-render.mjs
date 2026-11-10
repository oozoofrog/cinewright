import fs from 'node:fs/promises';
import path from 'node:path';
import {materializeStyle} from '../../../scripts/materialize-style.mjs';
import {freeze} from '../../../scripts/revisions.mjs';
import {host} from '../../../scripts/server.mjs';
import {browser,run} from '../../../scripts/execution.mjs';
const root=process.cwd(),ev=path.resolve('evidence/2026-11-08-cinematic-animation-implementation'),base=path.resolve('.direction/cinematic-animation-implementation-2026-11-08');
const map={S01:['silhouette-theatre','forest'],S02:['silhouette-theatre','harbor'],S03:['line-wash','rain'],S04:['line-wash','commuter'],S05:['expressionist-space','station'],S06:['expressionist-space','laboratory']};
const args=process.argv.slice(2),mode=args.shift()??'stills',ids=args.length?args:Object.keys(map);
const keyframes={S01:[24,72,100,126,156,178],S02:[60,88,144,178,191],S03:[24,120,156],S04:[44,72,88,100,126,156],S05:[70,80,87,88,94,104,156,174],S06:[48,120,156],P01:[24,72,144],P02:[24,72,144],P03:[24,54,64,69,120]};
await fs.mkdir(base,{recursive:true});await fs.mkdir(ev,{recursive:true});
const client=await browser();
try{for(const id of ids){
 let scene,assets={};const originalId=id.split('-')[0];
 if(map[originalId]){const [style,name]=map[originalId];scene=JSON.parse(await fs.readFile(`recipes/styles/${style}/${name}.json`));
 const collect=v=>{if(typeof v==='string'&&v.startsWith('assets/'))assets[v]=path.resolve(`examples/styles/${style}/${v}`);else if(v&&typeof v==='object')Object.values(v).forEach(collect)};collect(scene);
 if(id.endsWith('wash')){scene.strokes=[];scene.hatches=[];scene.stipples=[];scene.erasures=[];}
 }else if(['P01','P02'].includes(originalId)){
 const name=originalId==='P01'?'wet':'overlap';scene={version:1,style:'watercolor-physical',size:[1920,1080],fps:24,frames:192,seed:17,bake:'assets/watercolor.json',density:9};assets[scene.bake]=path.resolve(`.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd-v3/${name}-bake.json`);
 if(id===originalId||id.includes('96')){assets[scene.bake]=path.join(ev,`watercolor/${name}-96x54.json`);scene.density=36;}if(id.endsWith('linear'))scene.reconstruction='linear';if(id.endsWith('cells'))scene.reconstruction='cells';
 }else if(originalId==='P03'){
 scene=JSON.parse(await fs.readFile('.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd/projects/tall.authoring-absent/style-scene.json'));
 for(const name of ['character.rig.json','character.motion.json'])assets['assets/'+name]=path.resolve('examples/styles/phase02-rig/assets/tall/'+name);
 if(id.includes('designed')){assets['assets/character.rig.json']=path.join(ev,'assets/reader.rig.json');assets['assets/character.motion.json']=path.join(ev,'assets/reader.motion.json');scene.objects[0].outline={width:.012,color:'#263c38'};scene.materials.body.hatch=2;scene.materials.body.strength=.15;scene.materials.floor.strength=.08;}
 if(id.includes('inferred'))assets['assets/character.rig.json']=path.join(ev,'assets/reader-inferred.rig.json');
 if(id.includes('no-outline')||id.includes('flat'))delete scene.objects[0].outline;
 if(id.includes('flat')){scene.lights=[{type:'ambient',color:'#ffffff',intensity:3.141592653589793}];for(const m of Object.values(scene.materials)){m.hatch=0;m.strength=0;m.tones=[1,1];}}
 if(id.includes('side'))scene.camera.position=[8,3.4,3];
 }
 if(!scene)throw Error('Unknown '+id);scene.size=[1920,1080];
 const tag=`${id}-${mode}-${Date.now()}`,project=path.join(base,'projects',tag);await materializeStyle({project,style:scene.style,scene,assets});
 const snapshot=await freeze(project,path.join(base,'store')),site=await host({snapshot});const page=await client.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{await page.goto(site.url);await page.waitForFunction(()=>window.direction||window.failure,{},{timeout:120000});const failure=await page.evaluate(()=>window.failure);if(failure)throw Error(JSON.stringify(failure));
 const out=path.join(ev,id,mode);await fs.mkdir(out,{recursive:true});const frames=mode==='video'?Array.from({length:192},(_,i)=>i):keyframes[originalId];const start=performance.now();
 for(const f of frames){const data=await page.evaluate(({f,png})=>{window.direction.seek(f);return document.querySelector('#picture').toDataURL(png?'image/png':'image/jpeg',.96).split(',')[1]},{f,png:mode!=='video'});await fs.writeFile(path.join(out,`f${String(f).padStart(3,'0')}.${mode==='video'?'jpg':'png'}`),Buffer.from(data,'base64'));}
 const elapsed=performance.now()-start;const seek=await page.evaluate(()=>{const d=window.direction,c=document.querySelector('#picture'),a={};for(const f of [24,72,144]){d.seek(f);a[f]=c.toDataURL();}for(const f of [144,24,72,24]){d.seek(f);if(a[f]!==c.toDataURL())return false;}return true;});
 if(errors.length||!seek)throw Error(JSON.stringify({errors,seek}));
 if(mode==='video')await run('ffmpeg',['-y','-v','error','-framerate','24','-start_number','0','-i',path.join(out,'f%03d.jpg'),'-c:v','libx264','-crf','16','-pix_fmt','yuv420p',path.join(ev,id,'1080p24.mp4')]);
 await fs.writeFile(path.join(out,'render.json'),JSON.stringify({id,mode,revision:snapshot.revision,project,frames,width:1920,height:1080,fps:24,elapsedMs:elapsed,averageMs:elapsed/frames.length,seekDeterministic:seek,errors,method:'offline canvas seek/capture; not realtime viewing'},null,2));console.log(id,mode,Math.round(elapsed)+'ms',out);
 }finally{await page.close();await site.close();}
}}finally{await client.close();}
