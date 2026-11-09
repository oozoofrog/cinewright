import {SkinnedMesh,MeshBasicMaterial,BackSide} from 'three';
/** Shares parent geometry/skeleton; owns only material/child. Extrusion precedes skinning. */
export function createSkinnedOutline(mesh,{width=.025,color='#111820'}={}){
 if(!mesh?.isSkinnedMesh||!Number.isFinite(width)||width<=0||width>.2)throw Error('skinned outline: mesh and width (0,.2] required');
 const material=new MeshBasicMaterial({color,side:BackSide});material.onBeforeCompile=s=>{s.uniforms.cwWidth={value:width};s.vertexShader='uniform float cwWidth;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normal * cwWidth;');};material.customProgramCacheKey=()=> 'cw-skinned-outline-r180-v1';
 const object=new SkinnedMesh(mesh.geometry,material);object.name='skinned-outline';object.userData.cwOutline=true;object.bindMode=mesh.bindMode;object.bind(mesh.skeleton,mesh.bindMatrix);object.frustumCulled=false;mesh.add(object);return {object,dispose(){mesh.remove(object);material.dispose();}};
}
