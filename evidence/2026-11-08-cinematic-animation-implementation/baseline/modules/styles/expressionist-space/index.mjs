import {Scene,Group,PerspectiveCamera,OrthographicCamera,Vector3} from 'three';
import {sampleExposure} from '../../animation/exposure.mjs';
import {prepareClip3D} from '../../animation/clip3d.mjs';
import {createCanvasAdapter} from '../../fx3d/adapter.mjs';
import {createHatchAtlas,createHatchMaterial} from '../../fx3d/material.mjs';
import {createRigidOutline,createInternalLines} from '../../fx3d/outline.mjs';
import {createGeometry} from '../../fx3d/geometry.mjs';
import {createLightRig,createShadowOverlay,setDepthFog} from '../../fx3d/light.mjs';
import {createDust} from '../../fx3d/particles.mjs';
import {prepareDeformation} from '../../fx3d/deform.mjs';
import {loadLocalGLB} from '../../fx3d/glb.mjs';
import {Mesh} from 'three';
import {createRiggedMesh} from '../../animation/auto-rig.mjs';
import {createRetargetPlayer} from '../../animation/retarget.mjs';
import {createSkinnedOutline} from '../../fx3d/skinned-outline.mjs';
import {validateScene} from './validate.mjs';
export {validateScene};
export function sampleKeys(spec,frame){
 const keys=spec.keys;if(!keys?.length)return {};
 if(frame<=keys[0].frame)return keys[0];let r=keys.findIndex(k=>frame<k.frame);if(r<0)return keys.at(-1);const a=keys[r-1],b=keys[r],p=(frame-a.frame)/(b.frame-a.frame),value={};
 for(const k of Object.keys(a))if(k!=='frame')value[k]=Array.isArray(a[k])?a[k].map((v,i)=>v+(b[k][i]-v)*p):a[k]+(b[k]-a[k])*p;return value;
}
function frameFor(spec,t){return sampleExposure(spec.time==='exposed'?t.exposed:t.frame,spec.exposure??{every:1})?.frame??null;}
function transform(object,s,k={}){object.position.fromArray(k.position??s.position??[0,0,0]);object.rotation.fromArray([...(k.rotation??s.rotation??[0,0,0]),'XYZ']);object.scale.fromArray(k.scale??s.scale??[1,1,1]);}
/** Node-compatible entry; browser GLTFLoader loaded only while preparing a local asset. */
export function collectAssets(scene){return scene.objects.flatMap(o=>[...(o.asset?[{path:o.asset,kind:'glb'}]:[]),...(o.rig?[{path:o.rig,kind:'rig'}]:[]),...(o.motion?[{path:o.motion,kind:'motion'}]:[])]);}
export async function prepare(api,config={}){
 if(!config.scene&&typeof config.sceneFile!=='string')throw new Error('expressionist-space requires config.scene or sceneFile');
 const spec=structuredClone(config.scene??await api.json(config.sceneFile));validateScene(spec);
 const resources=[],ownedTextures=new Set(),scene=new Scene(),objects=[],clips=[];let adapter,disposed=false;
 const own=r=>(resources.push(r),r);
 function dispose(){if(disposed)return;disposed=true;const errors=[];for(const r of resources.reverse())try{r.dispose?.();}catch(e){errors.push(e);}for(const t of ownedTextures)try{t.source?.data?.close?.();t.dispose();}catch(e){errors.push(e);}try{adapter?.dispose();}catch(e){errors.push(e);}scene.clear();if(errors.length)throw new AggregateError(errors,'expressionist cleanup failed');}
 try{
  adapter=createCanvasAdapter(api);const atlas=own(createHatchAtlas()),materials={};for(const [id,s]of Object.entries(spec.materials))materials[id]=own(createHatchMaterial(s,atlas)).material;
  const c=spec.camera,aspect=api.width/api.height,camera=c.type==='perspective'?new PerspectiveCamera(c.fov??42,aspect,c.near??.1,c.far??100):new OrthographicCamera(-(c.height??12)*aspect/2,(c.height??12)*aspect/2,(c.height??12)/2,-(c.height??12)/2,c.near??.1,c.far??100);
  const lightRig=own(createLightRig(scene,spec.lights));if(spec.fog)setDepthFog(scene,spec.fog);
  for(const s of spec.objects){
   const holder=new Group();holder.name=s.id;scene.add(holder);const meshes=[],deforms=[];let overlay;
   if(s.rig){const rig=own(createRiggedMesh(await api.json(s.rig),materials[s.material]));holder.add(rig.mesh);meshes.push(rig.mesh);if(s.motion){const player=own(createRetargetPlayer(rig,await api.json(s.motion),{fps:spec.fps,...s.playback}));clips.push({player,spec:s});}}
   else if(s.asset){const gltf=await loadLocalGLB(api,s.asset);holder.add(gltf.scene);gltf.scene.traverse(o=>{if(o.isMesh){meshes.push(o);own(o.geometry);if(o.isSkinnedMesh)own(o.skeleton);for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m))if(v?.isTexture)ownedTextures.add(v);own(m);}}});if(s.clip){const clip=typeof s.clip.name==='string'?gltf.animations.find(a=>a.name===s.clip.name):gltf.animations[s.clip.index??0];if(!clip)throw new Error('GLB clip not found: '+s.asset);const player=own(prepareClip3D(gltf.scene,clip,{fps:spec.fps,...s.clip}));clips.push({player,spec:s});}}
   else if(s.shadow){overlay=own(createShadowOverlay(s.shadow));holder.add(overlay.object);}
   else{const geometry=own(createGeometry(s.geometry));const mesh=new Mesh(geometry,materials[s.material]);holder.add(mesh);meshes.push(mesh);}
   for(const mesh of meshes){if(mesh.isSkinnedMesh&&(s.deform||s.lines?.length))throw new Error('expressionist-space: skinned deform/internal lines unsupported; use authored skin geometry');if(!mesh.geometry.attributes.uv)throw new Error('hatch requires authored UV: '+s.id);mesh.material=materials[s.material];mesh.castShadow=s.castShadow??true;mesh.receiveShadow=s.receiveShadow??true;if(s.deform)deforms.push(prepareDeformation(mesh.geometry,s.deform));if(s.outline)own(mesh.isSkinnedMesh?createSkinnedOutline(mesh,s.outline):createRigidOutline(mesh,s.outline));}
   for(const line of s.lines??[])holder.add(own(createInternalLines(line.points,line)).object);
   objects.push({holder,spec:s,deforms,overlay});
  }
  const dust=spec.dust?own(createDust({seed:spec.seed,...spec.dust})):null;if(dust)scene.add(dust.object);
  const evaluate=t=>{
   if(disposed)throw new Error('expressionist-space disposed');
   const cf=frameFor(c,t)??0,ck=sampleKeys(c,cf);camera.position.fromArray(ck.position??c.position);camera.lookAt(new Vector3(...(ck.target??c.target)));camera.updateMatrixWorld();
   for(const {holder,spec:s,deforms,overlay}of objects){const f=frameFor(s,t);holder.visible=f!==null&&(!s.visible||(t.frame>=s.visible[0]&&t.frame<s.visible[1]));const k=sampleKeys(s,f??0);transform(holder,s,k);for(const d of deforms)d.evaluate((f??0)/spec.fps);if(overlay)overlay.object.material.opacity=k.opacity??s.shadow.opacity??.8;}
   for(const {player,spec:s}of clips)player.evaluate(frameFor(s,t)??0);
   for(let i=0;i<spec.lights.length;i++){const s=spec.lights[i],l=lightRig.lights[i],k=sampleKeys(s,frameFor(s,t)??0);l.position.fromArray(k.position??s.position??[0,5,0]);l.target?.position.fromArray(k.target??s.target??[0,0,0]);l.intensity=k.intensity??s.intensity;}
   if(spec.eventBinding){const b=spec.eventBinding,value=t.read(b.channel,b.space??'unit');if(!Number.isFinite(value))throw new Error('eventBinding requires number channel');lightRig.lights[b.light].intensity*=Math.max(0,Math.min(1,value))*(b.gain??1);}
   dust?.evaluate(t.frame/spec.fps);scene.updateMatrixWorld(true);for(const {holder}of objects)holder.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update();});
   if(spec.projectBinding){const b=spec.projectBinding,p=objects.find(o=>o.spec.id===b.object).holder.getWorldPosition(new Vector3()).project(camera);t.write(b.channel,[(p.x+1)*api.width/2,(1-p.y)*api.height/2]);}
   return {frame:t.frame,cameraFrame:cf,objects:objects.map(o=>({id:o.spec.id,visible:o.holder.visible,position:o.holder.position.toArray()}))};
  };
  return {evaluate,draw(g,t){if(disposed)throw new Error('expressionist-space disposed');adapter.draw(g,scene,camera);},getStats:()=>({...adapter.getStats(),objects:objects.length,clips:clips.length}),dispose};
 }catch(error){try{dispose();}catch(cleanup){throw new AggregateError([error,cleanup],'expressionist prepare and cleanup failed');}throw error;}
}
