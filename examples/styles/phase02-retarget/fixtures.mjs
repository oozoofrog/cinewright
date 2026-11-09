import {Vector3,Quaternion,Matrix4,Bone,Skeleton,SkinnedMesh,BufferGeometry,Float32BufferAttribute,Uint16BufferAttribute,CylinderGeometry,SphereGeometry} from 'three';
import {coordinateQuaternion} from '../../../modules/animation/retarget.mjs';
const v=a=>new Vector3(...a),q=a=>new Quaternion(...a);
/** Independent authored fixtures, not auto-rig evidence. Three distinct static surfaces/proportions/axes/rest frames. */
export function fixtureRig(kind='source'){
 const tall=kind==='reed',short=kind==='copper',C=short?new Quaternion().setFromAxisAngle(new Vector3(1,0,0),Math.PI/2):new Quaternion(),leg=tall?1.35:short?.66:.95,torso=tall?.68:short?.9:.72,arm=tall?.61:short?.38:.48,hip=leg+.14;
 const rows=[['hips',-1,[0,hip,0]],['spine',0,[0,hip+torso*.34,0]],['chest',1,[0,hip+torso*.76,0]],['neck',2,[0,hip+torso+.03,0]],['head',3,[0,hip+torso+.22,0]]];
 for(const [side,sign]of [['left',1],['right',-1]]){const j=rows.length;rows.push([side+'UpperArm',2,[sign*.23,hip+torso*.8,0]],[side+'LowerArm',j,[sign*(.23+arm),hip+torso*.8-(short?.13:0),0]],[side+'Hand',j+1,[sign*(.23+arm*1.85),hip+torso*.8-(short?.3:0),.02]]);}
 for(const [side,sign]of [['left',1],['right',-1]]){const j=rows.length;rows.push([side+'UpperLeg',0,[sign*(short?.23:.16),hip,0]],[side+'LowerLeg',j,[sign*(short?.23:.16),.14+leg*.49,.025]],[side+'Foot',j+1,[sign*(short?.23:.16),.14,0]]);}
 const wp=rows.map(r=>v(r[2]).applyQuaternion(C)),wq=rows.map((_,i)=>C.clone().multiply(new Quaternion().setFromAxisAngle(new Vector3(0,0,1),kind==='source'?0:(i%3-1)*.31)));
 const bones=rows.map(([semantic,parent],i)=>({semantic,name:kind==='source'?'src_'+semantic:short?'joint_'+i:'reed_'+semantic.toUpperCase(),parent,position:(parent<0?wp[i]:wp[i].clone().sub(wp[parent]).applyQuaternion(wq[parent].clone().invert())).toArray(),quaternion:(parent<0?wq[i]:wq[parent].clone().invert().multiply(wq[i])).toArray()}));
 const positions=[],normals=[],uv=[],skinIndices=[],skinWeights=[],indices=[];
 function append(g,m,bone,next=bone){g.applyMatrix4(m);const base=positions.length/3;positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);for(let i=0;i<g.attributes.position.count;i++){const point=new Vector3().fromBufferAttribute(g.attributes.position,i),a=wp[bone],b=wp[next],d=b.clone().sub(a),t=d.lengthSq()?Math.max(0,Math.min(1,point.clone().sub(a).dot(d)/d.lengthSq())):0;const blend=next!==bone?Math.max(0,(t-.75)*.8):0;skinIndices.push(bone,next,0,0);skinWeights.push(1-blend,blend,0,0);}indices.push(...Array.from(g.index.array,x=>x+base));g.dispose();}
 for(let i=1;i<rows.length;i++){const p=rows[i][1],a=wp[p],b=wp[i],d=b.clone().sub(a);if(rows[i][0].includes('Upper'))continue;const r=rows[i][0].includes('Leg')?.09:rows[i][0].includes('Foot')?.08:rows[i][0].includes('Arm')||rows[i][0].includes('Hand')?.065:.14;
 const orient=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),d.clone().normalize());append(new CylinderGeometry(r*.85,r,d.length(),8,5),new Matrix4().compose(a.clone().lerp(b,.5),orient,new Vector3(1,1,1)),p,i);}
 for(let i=0;i<rows.length;i++){const name=rows[i][0],isHead=name==='head',isFoot=name.includes('Foot');const size=isHead?[short?.25:.19,short?.23:.25,.19]:isFoot?[.105,.13,.22]:name==='hips'?[short?.32:.25,.16,.16]:[.095,.095,.095];append(new SphereGeometry(1,10,8),new Matrix4().compose(wp[i].clone().add(isFoot?new Vector3(0,-.01,.08).applyQuaternion(C):new Vector3()),C,v(size)),i);}
 return {version:1,kind:'cinewright-rig',coordinate:{left:[1,0,0],up:short?[0,0,1]:[0,1,0],forward:short?[0,-1,0]:[0,0,1],unit:'m'},bones,geometry:{positions,normals,uv,indices,skinIndices,skinWeights},diagnostics:{fixture:true},provenance:{author:'Cinewright phase02 retarget',license:'CC0-1.0',kind}};
}
/** Fixture loader mirrors common rig factory contract; owns geometry/skeleton, caller owns material. */
export function createFixtureMesh(asset,material){
 const g=new BufferGeometry(),a=asset.geometry;g.setAttribute('position',new Float32BufferAttribute(a.positions,3));g.setAttribute('normal',new Float32BufferAttribute(a.normals,3));g.setAttribute('uv',new Float32BufferAttribute(a.uv,2));g.setAttribute('skinIndex',new Uint16BufferAttribute(a.skinIndices,4));g.setAttribute('skinWeight',new Float32BufferAttribute(a.skinWeights,4));g.setIndex(a.indices);
 const list=asset.bones.map(b=>{const x=new Bone();x.name=b.name;x.position.fromArray(b.position);x.quaternion.fromArray(b.quaternion);return x;}),mesh=new SkinnedMesh(g,material);asset.bones.forEach((b,i)=>(b.parent<0?mesh:list[b.parent]).add(list[i]));mesh.updateMatrixWorld(true);const skeleton=new Skeleton(list);mesh.bind(skeleton);mesh.frustumCulled=false;const bones=new Map(asset.bones.map((b,i)=>[b.semantic,list[i]]));let disposed=false;return {mesh,bones,skeleton,dispose(){if(disposed)return;disposed=true;mesh.removeFromParent();g.dispose();skeleton.dispose();}};
}
export function fixtureMotion(rig,kind='stride'){
 const duration=kind==='stride'?2:3,tracks=[],times=Array.from({length:73},(_,i)=>duration*i/72),root=rig.bones.find(b=>b.semantic==='hips');
 const valuesFor=(semantic,fn)=>{const b=rig.bones.find(b=>b.semantic===semantic);tracks.push({bone:b.name,property:'quaternion',times,values:times.map(t=>q(b.quaternion).multiply(fn(t)).toArray())});};
 if(kind==='stride'){
  for(const [side,sign]of [['left',1],['right',-1]]){valuesFor(side+'UpperLeg',t=>new Quaternion().setFromAxisAngle(v([1,0,0]),.42*Math.sin(t/duration*Math.PI*2)*sign));valuesFor(side+'LowerLeg',t=>new Quaternion().setFromAxisAngle(v([1,0,0]),-.52*Math.max(0,Math.sin(t/duration*Math.PI*2)*sign)));valuesFor(side+'UpperArm',t=>new Quaternion().setFromAxisAngle(v([0,0,1]),sign*(-.85+.22*Math.sin(t/duration*Math.PI*2))));}
  valuesFor('chest',t=>new Quaternion().setFromAxisAngle(v([0,1,0]),.13*Math.sin(t/duration*Math.PI*2)));
 }else{
  valuesFor('leftUpperArm',t=>new Quaternion().setFromAxisAngle(v([0,0,1]),.55+.55*Math.sin(t/duration*Math.PI*2)));
  valuesFor('leftLowerArm',t=>new Quaternion().setFromAxisAngle(v([0,1,0]),.55*Math.sin(t/duration*Math.PI*4)));
  valuesFor('rightUpperArm',t=>new Quaternion().setFromAxisAngle(v([0,0,1]),1.1));
  valuesFor('spine',t=>new Quaternion().setFromAxisAngle(v([0,0,1]),.16*Math.sin(t/duration*Math.PI*2)));
  for(const side of ['left','right']){valuesFor(side+'UpperLeg',t=>new Quaternion().setFromAxisAngle(v([1,0,0]),.23*(1-Math.cos(t/duration*Math.PI*2))));valuesFor(side+'LowerLeg',t=>new Quaternion().setFromAxisAngle(v([1,0,0]),-.46*(1-Math.cos(t/duration*Math.PI*2))));}
 }
 tracks.push({bone:root.name,property:'position',times,values:times.map(t=>[root.position[0]+(kind==='stride'?.1:.13)*Math.sin(t/duration*Math.PI*2),root.position[1]-(kind==='stride'?.05:.09)*(1-Math.cos(t/duration*Math.PI*4)),root.position[2]])});
 return {version:1,kind:'cinewright-source-motion',name:kind,duration,tracks,provenance:{author:'Cinewright phase02 retarget',license:'CC0-1.0',method:'analytic authored local motion, no external motion/media'}};
}
