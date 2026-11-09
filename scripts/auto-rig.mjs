import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {autoRig,createRiggedMesh} from '../modules/animation/auto-rig.mjs';import {MeshStandardMaterial} from 'three';
/** Embedded, uncompressed GLB with actual JOINTS_0/WEIGHTS_0 and inverse bind matrices. */
export async function exportRigGLB(asset){
 const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
 const previous=globalThis.FileReader;
 if(!previous)globalThis.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(x=>{this.result=x;this.onloadend?.();});}readAsDataURL(b){b.arrayBuffer().then(x=>{this.result='data:'+b.type+';base64,'+Buffer.from(x).toString('base64');this.onloadend?.();});}};
 const material=new MeshStandardMaterial({color:'#c2a778'}),r=createRiggedMesh(asset,material);
 try{return Buffer.from(await new GLTFExporter().parseAsync(r.mesh,{binary:true}));}finally{r.dispose();material.dispose();if(!previous)delete globalThis.FileReader;}
}
export async function writeRig({input,output,options={},glb=false}){const g=JSON.parse(await fs.readFile(input,'utf8')),a=autoRig(g,options),b=glb?await exportRigGLB(a):JSON.stringify(a);await fs.mkdir(path.dirname(output),{recursive:true});const dir=await fs.mkdtemp(path.join(path.dirname(path.resolve(output)),'.auto-rig-'));try{const tmp=path.join(dir,'asset');await fs.writeFile(tmp,b);await fs.link(tmp,output);}finally{await fs.rm(dir,{recursive:true,force:true});}return {output,vertices:a.geometry.positions.length/3,diagnostics:a.diagnostics};}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [input,output,profileFile]=process.argv.slice(2);if(!input||!output||!profileFile)throw Error('usage: node scripts/auto-rig.mjs STATIC.json OUTPUT.rig.json PROFILE.json [--glb]');console.log(JSON.stringify(await writeRig({input,output,options:JSON.parse(await fs.readFile(profileFile,'utf8')),glb:process.argv.includes('--glb')}),null,2));}
