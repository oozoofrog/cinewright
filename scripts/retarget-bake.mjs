import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bakeRetarget,validateRetargetMotion} from '../modules/animation/retarget.mjs';
/** Atomic, no-overwrite publication. No server, network or GPU. */
export async function retargetBakeFile({source,target,motion,output,options={},signal}){
 signal?.throwIfAborted();const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
 const [s,t,m]=await Promise.all([read(source),read(target),read(motion)]);signal?.throwIfAborted();const bake=bakeRetarget(s,t,m,options);validateRetargetMotion(bake);signal?.throwIfAborted();
 await fs.mkdir(path.dirname(path.resolve(output)),{recursive:true});const staging=await fs.mkdtemp(path.join(path.dirname(path.resolve(output)),'.retarget-'));
 try{const temp=path.join(staging,'motion.json');await fs.writeFile(temp,JSON.stringify(bake)+'\n');signal?.throwIfAborted();await fs.link(temp,output);return {output,samples:bake.samples.length,bytes:(await fs.stat(output)).size};}finally{await fs.rm(staging,{recursive:true,force:true});}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [source,target,motion,output,optionsFile]=process.argv.slice(2);if(!output)throw new Error('Usage: node scripts/retarget-bake.mjs SOURCE.rig.json TARGET.rig.json SOURCE.motion.json OUTPUT.motion.json [OPTIONS.json]');
 console.log(JSON.stringify(await retargetBakeFile({source,target,motion,output,options:optionsFile?JSON.parse(await fs.readFile(optionsFile,'utf8')):{}})));
}
