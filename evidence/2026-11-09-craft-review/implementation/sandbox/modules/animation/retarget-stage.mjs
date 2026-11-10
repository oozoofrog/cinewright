import {Scene,Group,PerspectiveCamera,AmbientLight,DirectionalLight,Mesh,PlaneGeometry,MeshStandardMaterial,Vector3} from 'three';
import {createRiggedMesh} from './auto-rig.mjs';
import {prepareRetargetPlayback,coordinateQuaternion} from './retarget.mjs';
import {createCanvasAdapter} from '../fx3d/adapter.mjs';
import {createHatchAtlas,createHatchMaterial} from '../fx3d/material.mjs';
/** Reusable manifest-v1 comparison stage. All inputs are local rig/bake JSON.
 * Factory owns rig, material, stage and adapter; no authored-source motion needed. */
export async function prepare(api,config){
 const scene=new Scene(),resources=[],players=[],labels=[],adapter=createCanvasAdapter(api);let disposed=false;
 const own=r=>(resources.push(r),r),camera=new PerspectiveCamera(35,api.width/api.height,.1,100),atlas=own(createHatchAtlas());
 function dispose(){if(disposed)return;disposed=true;for(const p of players)p.dispose();for(const r of resources.reverse())r.dispose?.();scene.clear();adapter.dispose();}
 try{
 scene.add(new AmbientLight('#e4e4ff',2));const light=new DirectionalLight(config.mode==='salute'?'#ffcf92':'#b7dbff',3);light.position.set(-3,6,4);scene.add(light);
 const floorGeometry=own(new PlaneGeometry(200,200)),floorMaterial=own(new MeshStandardMaterial({color:config.mode==='salute'?'#292431':'#162b37',roughness:1})),floor=new Mesh(floorGeometry,floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-.015;scene.add(floor);
 for(const [i,s]of config.performers.entries()){
  const [rig,motion]=await Promise.all([api.json(s.rig),api.json(s.motion)]),material=own(createHatchMaterial({color:s.color,hatch:5,strength:.45},atlas)),built=own(createRiggedMesh(rig,material.material)),player=prepareRetargetPlayback(built,motion,{fps:api.fps,loop:true});players.push(player);
  const holder=new Group();holder.quaternion.copy(coordinateQuaternion(rig.coordinate).invert());holder.add(built.mesh);const anchor=new Group();anchor.position.set((i-1)*2.8,0,0);anchor.add(holder);scene.add(anchor);labels.push(s.label);
 }
 return {evaluate(t){if(disposed)throw new Error('retarget-stage disposed');for(const p of players)p.evaluate(t.frame);const phase=t.frame/api.fps*.16;camera.position.set(config.mode==='salute'?Math.sin(phase)*.7:.4,3.2,11.8);camera.lookAt(new Vector3(0,1.2,0));scene.updateMatrixWorld(true);return {frame:t.frame};},draw(g,t){adapter.draw(g,scene,camera);g.fillStyle='#ece5d5';g.font='600 26px sans-serif';g.fillText(config.title,34,46);g.font='15px sans-serif';g.fillStyle='#acb5c4';g.fillText(config.subtitle,34,72);g.font='600 16px sans-serif';g.fillStyle='#ece5d5';for(let i=0;i<labels.length;i++)g.fillText(labels[i],api.width*(.14+i*.3),api.height-62);g.fillStyle='#aab6c4';g.font='13px sans-serif';g.fillText('LOCAL BAKE  /  17 SEMANTICS  /  ABSOLUTE FRAME '+String(t.frame).padStart(3,'0'),34,api.height-28);g.fillStyle='#73b8aa';g.fillRect(34,api.height-14,(api.width-68)*(t.frame+1)/api.frames,2);},getStats:()=>adapter.getStats(),dispose};
 }catch(e){dispose();throw e;}
}
