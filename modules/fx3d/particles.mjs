import {InstancedMesh,IcosahedronGeometry,MeshBasicMaterial,Object3D} from 'three';
function hash(seed,id,n){let x=(seed^Math.imul(id+1,0x9e3779b9)^Math.imul(n+1,0x85ebca6b))>>>0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return ((x^(x>>>16))>>>0)/4294967296;}
export function sampleDust(id,seconds,{seed=17,bounds=[8,5,12],life=8,speed=.2}={}){
 const age=((seconds+hash(seed,id,0)*life)%life+life)%life;
 return {age,position:[(hash(seed,id,1)-.5)*bounds[0]+Math.sin(age*.7+id)*.09,hash(seed,id,2)*bounds[1]+age*speed,(hash(seed,id,3)-.5)*bounds[2]],scale:Math.sin(age/life*Math.PI)*(.012+hash(seed,id,4)*.025)};
}
export function createDust({count=100,seed=17,bounds=[8,5,12],life=8,speed=.2,color='#c9bd8d'}={}){
 if(!Number.isInteger(count)||count<0||count>4096||!Number.isInteger(seed)||!Array.isArray(bounds)||bounds.length!==3||bounds.some(x=>!Number.isFinite(x)||x<=0||x>100)||!Number.isFinite(life)||life<=0||!Number.isFinite(speed)||Math.abs(speed)>10)throw new Error('dust: bounded count/seed/bounds/life/speed required');
 const geometry=new IcosahedronGeometry(1,0),material=new MeshBasicMaterial({color,transparent:true,opacity:.45,depthWrite:false});const object=new InstancedMesh(geometry,material,count);object.frustumCulled=false;const helper=new Object3D();
 return {object,evaluate(seconds){if(!Number.isFinite(seconds))throw new Error('dust: finite seconds');for(let id=0;id<count;id++){const p=sampleDust(id,seconds,{seed,bounds,life,speed});helper.position.fromArray(p.position);helper.scale.setScalar(p.scale);helper.updateMatrix();object.setMatrixAt(id,helper.matrix);}object.instanceMatrix.needsUpdate=true;},dispose(){object.dispose();geometry.dispose();material.dispose();}};
}
