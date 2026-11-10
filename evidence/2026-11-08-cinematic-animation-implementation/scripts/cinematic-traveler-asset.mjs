// Derivative asset only: keep the original GLB and its animation untouched.
import fs from 'node:fs/promises';
const source='examples/styles/expressionist-space/assets/traveler.glb';const b=await fs.readFile(source),jl=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+jl).toString()),tail=b.subarray(20+jl);
const bag=j.nodes.find(n=>n.name==='case');bag.translation[0]=.73;bag.translation[2]=.12;
const sleeve=j.nodes.find(n=>n.name==='rightSleeve');sleeve.translation=[.49,1.15,.06];sleeve.rotation=[0,0,Math.sin(.22),Math.cos(.22)];
j.asset.generator+=' / cinematic bag negative-space authoring';
let bytes=Buffer.from(JSON.stringify(j));bytes=Buffer.concat([bytes,Buffer.alloc((4-bytes.length%4)%4,32)]);const h=Buffer.from(b.subarray(0,20));h.writeUInt32LE(20+bytes.length+tail.length,8);h.writeUInt32LE(bytes.length,12);
await fs.writeFile('examples/styles/expressionist-space/assets/traveler-readable.glb',Buffer.concat([h,bytes,tail]));
