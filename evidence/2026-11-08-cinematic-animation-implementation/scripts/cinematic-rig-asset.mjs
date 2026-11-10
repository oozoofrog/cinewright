import fs from 'node:fs/promises';
import {BufferGeometry,Float32BufferAttribute,Quaternion,Vector3} from 'three';
import {autoRig,validateRig} from '../../../modules/animation/auto-rig.mjs';
import {bakeRetarget} from '../../../modules/animation/retarget.mjs';
import {exportRigGLB} from '../../../scripts/auto-rig.mjs';
const out='evidence/2026-11-08-cinematic-animation-implementation/assets';await fs.mkdir(out,{recursive:true});
const source=JSON.parse(await fs.readFile('examples/styles/phase02-rig/assets/tall/static.json'));
// Weld the original connected surface, then author a soft coat, rounded mittens and projecting toes.
const vertices=[],indices=[],map=new Map();for(let i=0;i<source.positions.length;i+=3){const p=source.positions.slice(i,i+3),key=p.map(v=>v.toFixed(7)).join(',');if(!map.has(key)){map.set(key,vertices.length);vertices.push(p);}indices.push(map.get(key));}
const neighbors=vertices.map(()=>new Set());for(let i=0;i<indices.length;i+=3)for(let j=0;j<3;j++){let a=indices[i+j],b=indices[i+(j+1)%3];neighbors[a].add(b);neighbors[b].add(a);}
let smooth=vertices;
for(let pass=0;pass<8;pass++)smooth=smooth.map((p,i)=>p.map((v,k)=>v*.55+[...neighbors[i]].reduce((a,j)=>a+smooth[j][k],0)/neighbors[i].size*.45));
for(const p of smooth){
 const [x,y,z]=p;
 if(y<.3)p[2]+=Math.max(0,1-y/.3)*.19; // short rounded boot toe, readable side/3/4
 if(y>1.8&&y<2.7){const t=(y-1.8)/.9;p[0]*=1+.06*(1-t);} // coat hem
 if(Math.abs(x)>1.95)p[1]+=Math.max(0,(Math.abs(x)-1.95)/.3)*.025;
}
const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(smooth.flat(),3));geometry.setAttribute('uv',new Float32BufferAttribute(smooth.flatMap(p=>[p[0]/4.5+.5,p[1]/4]),2));geometry.setIndex(indices);geometry.computeVertexNormals();
const rig=autoRig(geometry,{profile:'upright-biped'});
await fs.writeFile(out+'/reader-inferred.rig.json',JSON.stringify(rig));
// Authored shoulder weights: continuous blend over adjacent vertices, with normalized top-four influences.
const smoothstep=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
let weights=smooth.map(([x,y],i)=>{
 const w=Array(17).fill(0);for(let k=0;k<4;k++)w[rig.geometry.skinIndices[i*4+k]]+=rig.geometry.skinWeights[i*4+k];
 if(y<2.0)return w;
 const chest=smoothstep(2.0,2.7,y),head=smoothstep(3.25,3.5,y),arm=smoothstep(.45,.82,Math.abs(x))*(1-smoothstep(3.18,3.4,y))*smoothstep(2.6,2.85,y);
 w.fill(0);w[1]=(1-chest)*(1-arm);w[2]=chest*(1-head)*(1-arm);w[4]=head*(1-arm);
 const upper=x>=0?5:8,elbow=smoothstep(1.25,1.62,Math.abs(x)),hand=smoothstep(1.95,2.2,Math.abs(x));
 w[upper]=arm*(1-elbow);w[upper+1]=arm*elbow*(1-hand);w[upper+2]=arm*elbow*hand;return w;
});
for(let i=0;i<weights.length;i++){const sorted=weights[i].map((w,j)=>({w,j})).sort((a,b)=>b.w-a.w).slice(0,4),sum=sorted.reduce((a,b)=>a+b.w,0);for(let k=0;k<4;k++){rig.geometry.skinIndices[i*4+k]=sorted[k].j;rig.geometry.skinWeights[i*4+k]=sorted[k].w/sum;}}
rig.provenance.authored='Reader: welded/smoothed connected voxel surface; rounded boots and coat hem; continuous authored chest/shoulder/elbow weight fields. Common autoRig unchanged.';validateRig(rig);
const times=[0,1,2,3,4,5,6,7,8],tracks=['leftUpperArm','leftLowerArm','rightUpperArm','rightLowerArm','head'].map((bone,i)=>({bone,property:'quaternion',times,values:times.map(t=>new Quaternion().setFromAxisAngle(new Vector3(...(i<2?[0,0,1]:[0,1,0])),Math.sin(t*Math.PI/2+i)*.6).toArray())}));
const motion=bakeRetarget(rig,rig,{version:1,kind:'cinewright-source-motion',duration:8,tracks},{fps:24,rootMotion:'inPlace'});
await fs.writeFile(out+'/reader.rig.json',JSON.stringify(rig));await fs.writeFile(out+'/reader.motion.json',JSON.stringify(motion));await fs.writeFile(out+'/reader.glb',await exportRigGLB(rig));await fs.writeFile(out+'/LICENSE','CC0-1.0. Original authored derivative of Cinewright CC0 fixture.\n');
console.log({vertices:smooth.length,triangles:indices.length/3,diagnostics:rig.diagnostics});geometry.dispose();

const published="examples/styles/phase02-rig/assets/reader";await fs.mkdir(published,{recursive:true});for(const n of ["reader.rig.json","reader.motion.json","reader.glb","LICENSE"])await fs.copyFile(out+"/"+n,published+"/"+n);
