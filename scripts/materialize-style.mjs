import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {writeOwnedFiles} from './materialize-kit.mjs';
import {validateStyleImages} from './style-images.mjs';
import {inspectGLB} from '../modules/fx3d/glb.mjs';
import {validate,projectPath} from '../runtime/timeline.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
export async function listStyles(){return JSON.parse(await fs.readFile(path.join(root,'catalog/styles.json'),'utf8'));}
async function closure(entry,files,seen=new Set()){
 if(seen.has(entry))return;seen.add(entry);projectPath(entry);if(!entry.startsWith('modules/'))throw new Error(`Import outside module tree: ${entry}`);const code=await fs.readFile(path.join(root,entry),'utf8');files[entry]=code;
 for(const m of code.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)){const name=m[1];if(name==='three')continue;if(!name.startsWith('.'))throw new Error(`Unpackaged import: ${name}`);const next=path.posix.normalize(path.posix.join(path.posix.dirname(entry),name));if(next.startsWith('vendor/'))continue;await closure(next,files,seen);}
}
async function noLinks(file){const abs=path.resolve(file),parts=abs.split(path.sep).filter(Boolean);let cur=path.parse(abs).root;for(const p of parts){cur=path.join(cur,p);if((await fs.lstat(cur)).isSymbolicLink())throw new Error(`Symlink not allowed: ${file}`);}return abs;}
/** Stage all bytes, validate, publish. Updates preserve authored bytes and reject changed owned files. */
export async function materializeStyle({project,style,scene,assets={},seed=scene?.seed??17,update=false}){
 if(!path.isAbsolute(project))throw new Error('materializeStyle requires absolute project');const registry=await listStyles();const item=registry.styles.find(s=>s.id===style);if(!item)throw new Error(`Unknown style: ${style}`);
 const authored=structuredClone(scene);if(!authored||authored.version!==1||authored.style!==style)throw new Error('scene version/style mismatch');authored.seed=seed;
 const {validateScene,collectAssets}=await import(pathToFileURL(path.join(root,item.entry)));validateScene(authored);
 const manifest=validate({version:1,title:authored.title??style,size:authored.size??[1920,1080],fps:authored.fps??24,frames:authored.frames??192,background:authored.background??'#eee8d8',points:{start:0,finish:(authored.frames??192)-1},spans:{whole:[0,authored.frames??192]},audio:[],layers:[{id:'style',module:item.entry,config:{scene:authored}}]});
 const files={};await closure(item.entry,files);
 if(style==='expressionist-space'){const {collectExpressionistVendor}=await import('./style-vendor-expressionist.mjs');Object.assign(files,await collectExpressionistVendor());}
 for(const [name,source]of Object.entries(assets)){projectPath(name);if(!name.startsWith('assets/'))throw new Error('Assets must be under assets/');const local=await noLinks(source);if(!(await fs.stat(local)).isFile())throw new Error('Asset must be regular');files[name]=await fs.readFile(local);}
 const references=new Set();function assetReferences(v){if(typeof v==='string'&&v.startsWith('assets/')){projectPath(v);references.add(v);}else if(Array.isArray(v))v.forEach(assetReferences);else if(v&&typeof v==='object')Object.values(v).forEach(assetReferences);}
 assetReferences(authored);for(const name of references)if(!Object.hasOwn(files,name))throw new Error(`Missing required local asset: ${name}`);
 const imageDecodes=[];
 for(const asset of collectAssets?.(authored)??[]){const bytes=Buffer.from(files[asset.path]??[]);if(asset.kind==='glb')inspectGLB(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));else if(['rig','motion','watercolor-bake'].includes(asset.kind)){
 if(bytes.length>64*1024*1024)throw new Error('JSON asset exceeds 64 MiB');const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(asset.kind==='rig'){const {validateRig}=await import('../modules/animation/auto-rig.mjs');validateRig(value);}else if(asset.kind==='motion'){const {validateRetargetMotion}=await import('../modules/animation/retarget.mjs');validateRetargetMotion(value);}else {const {validateBake}=await import('../modules/fx2d/watercolor.mjs');validateBake(value);if(value.header.frames!==authored.frames)throw new Error('watercolor bake frame count mismatch');}
 }else if(asset.kind==='image'){
 const ext=path.extname(asset.path).toLowerCase();let ok=false;if(bytes.length>16*1024*1024)throw new Error('Alpha image exceeds 16 MiB');
 if(ext==='.svg'){const xml=new TextDecoder('utf-8',{fatal:true}).decode(bytes);ok=/<svg(?:\s|>)/.test(xml)&&(/<\/svg\s*>/.test(xml)||/<svg[^>]*\/\s*>/.test(xml))&&!/<(?:script|foreignObject)\b/i.test(xml)&&!/(?:href|xlink:href)\s*=\s*["'](?!#|data:)/i.test(xml);}
 if(ext==='.png')ok=bytes.length>=33&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.toString('ascii',12,16)==='IHDR'&&bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0;
 if(['.jpg','.jpeg'].includes(ext))ok=bytes.length>4&&bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217;
 if(ext==='.webp')ok=bytes.length>=16&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
 if(!ok)throw new Error(`Invalid or unsupported local alpha image: ${asset.path}`);
 imageDecodes.push({name:asset.path,type:({'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'})[ext],data:bytes.toString('base64')});
 }else throw new Error('Unknown asset kind: '+asset.kind);}
 // Cross-asset rest compatibility is checked before publishing too.
 for(const o of authored.objects??[])if(o.rig&&o.motion){const {createRiggedMesh}=await import('../modules/animation/auto-rig.mjs'),{createRetargetPlayer}=await import('../modules/animation/retarget.mjs');const r=createRiggedMesh(JSON.parse(files[o.rig]));try{const player=createRetargetPlayer(r,JSON.parse(files[o.motion]));player.dispose();}finally{r.dispose();}}
 await validateStyleImages(imageDecodes);
 files['work.json']=JSON.stringify(manifest,null,2)+'\n';files['style-scene.json']=JSON.stringify(authored,null,2)+'\n';
 files['style-version.json']=JSON.stringify({style,version:item.version,seed,dependencies:item.dependencies,files:Object.fromEntries(Object.entries(files).map(([n,b])=>[n,createHash('sha256').update(b).digest('hex')]))},null,2)+'\n';
 await fs.mkdir(path.dirname(project),{recursive:true});project=path.join(await fs.realpath(path.dirname(project)),path.basename(project));let exists=false;try{const st=await fs.lstat(project);if(st.isSymbolicLink()||!st.isDirectory())throw new Error('Project must be a regular directory');exists=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 if(exists&&!update)throw new Error('New style project requires unused directory; opt into update');if(update&&!exists)throw new Error('Update requires existing generated project');
 const stage=await fs.mkdtemp(path.join(path.dirname(project),'.style-stage-'));let backup;
 try{
  if(exists){await noLinks(project);await fs.cp(project,stage,{recursive:true,errorOnExist:false,force:true,filter:async src=>{if((await fs.lstat(src)).isSymbolicLink())throw new Error('Project symlinks unsupported');return true;}});await fs.access(path.join(stage,'.cinewright-style.json'));}
  const receipt=await writeOwnedFiles({project:stage,files,registry:'.cinewright-style.json'});validate(JSON.parse(await fs.readFile(path.join(stage,'work.json'),'utf8')));
  if(exists){backup=project+'.style-backup-'+randomUUID();await fs.rename(project,backup);}
  try{await fs.rename(stage,project);}catch(e){if(backup){await fs.rename(backup,project);backup=null;}throw e;}
  if(backup){await fs.rm(backup,{recursive:true});backup=null;}return {project,style,version:item.version,files:receipt};
 }finally{await fs.rm(stage,{recursive:true,force:true});}
}
