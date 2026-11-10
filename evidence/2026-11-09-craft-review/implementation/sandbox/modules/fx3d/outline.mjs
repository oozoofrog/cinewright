import {Mesh,MeshBasicMaterial,BackSide,BufferGeometry,Float32BufferAttribute,Line,LineBasicMaterial} from 'three';
/** Rigid normal extrusion. Shared geometry is owned by caller. Width is WORLD units. */
export function createRigidOutline(mesh,{width=.025,color='#111820'}={}){
 if(!mesh?.isMesh||!Number.isFinite(width)||width<=0||width>.2)throw new Error('outline: rigid mesh and width (0,.2] required');
 if(mesh.isSkinnedMesh)throw new Error('outline: skinned meshes unsupported');
 const material=new MeshBasicMaterial({color,side:BackSide});
 material.onBeforeCompile=s=>{s.uniforms.cwWidth={value:width};s.vertexShader='uniform float cwWidth;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normal * cwWidth;');};
 material.customProgramCacheKey=()=> 'cw-outline-v1';const object=new Mesh(mesh.geometry,material);object.name='rigid-outline';object.userData.cwOutline=true;mesh.add(object);
 return {object,dispose(){mesh.remove(object);material.dispose();}};
}
export function createInternalLines(points,{color='#18232b'}={}){
 if(!Array.isArray(points)||points.length<2||points.length>4096||points.some(p=>!Array.isArray(p)||p.length!==3||p.some(v=>!Number.isFinite(v))))throw new Error('internal lines: 2..4096 finite vec3 points');
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(points.flat(),3));const material=new LineBasicMaterial({color});const object=new Line(geometry,material);
 return {object,dispose(){geometry.dispose();material.dispose();}};
}
