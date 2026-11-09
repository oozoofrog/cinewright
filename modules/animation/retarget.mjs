import {Vector3,Quaternion,Matrix4} from 'three';

export const RETARGET_VERSION='1.0.0';
const V=a=>new Vector3().fromArray(a),Q=a=>new Quaternion().fromArray(a),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fail=m=>{throw new Error('retarget: '+m);};
const finite=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(Number.isFinite);
function quat(a){return finite(a,4)&&Math.abs(Math.hypot(...a)-1)<1e-4;}
export function coordinateQuaternion(c={up:[0,1,0],left:[1,0,0],forward:[0,0,1],unit:'m'}){
 const a=[c.left,c.up,c.forward];if(a.some(x=>!finite(x,3)||Math.abs(V(x).length()-1)>1e-6)||Math.abs(V(a[0]).dot(V(a[1])))>1e-6||V(a[0]).cross(V(a[1])).distanceTo(V(a[2]))>1e-6)fail('right-handed orthonormal coordinate axes required');
 if(!['m','cm','mm'].includes(c.unit))fail('unit m/cm/mm required');
 return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(...a.map(V)));
}
export function validateRetargetRig(rig){
 if(rig?.version!==1||rig.kind!=='cinewright-rig'||!Array.isArray(rig.bones)||!rig.bones.length||rig.bones.length>256)fail('rig v1, 1..256 bones required');coordinateQuaternion(rig.coordinate);
 const names=new Set(),semantics=new Set();rig.bones.forEach((b,i)=>{if(typeof b.name!=='string'||!b.name||names.has(b.name)||typeof b.semantic!=='string'||!b.semantic||semantics.has(b.semantic)||!Number.isInteger(b.parent)||b.parent< -1||b.parent>=i||!finite(b.position,3)||!quat(b.quaternion))fail('invalid bone '+i);names.add(b.name);semantics.add(b.semantic);});if(!semantics.has('hips'))fail('hips semantic required');return rig;
}
function pose(rig){return rig.bones.map(b=>({position:V(b.position),quaternion:Q(b.quaternion)}));}
// Parent-before-child FK, independent of scene transforms and previous evaluations.
function fk(rig,p){const w=[];p.forEach((b,i)=>{const a=w[rig.bones[i].parent];w.push(a?{position:b.position.clone().applyQuaternion(a.quaternion).add(a.position),quaternion:a.quaternion.clone().multiply(b.quaternion)}:{position:b.position.clone(),quaternion:b.quaternion.clone()});});return w;}
function index(rig,s){return rig.bones.findIndex(b=>b.semantic===s);}
function legLength(rig,w){const ids=['leftUpperLeg','leftLowerLeg','leftFoot'].map(s=>index(rig,s));if(ids.some(i=>i<0))fail('left leg semantics required for proportional scale');return w[ids[0]].position.distanceTo(w[ids[1]].position)+w[ids[1]].position.distanceTo(w[ids[2]].position);}
function sampleTrack(track,t){const n=track.times.length;let hi=track.times.findIndex(v=>v>t);if(hi<0)hi=n-1;const lo=Math.max(0,hi-1),f=hi===lo?0:clamp((t-track.times[lo])/(track.times[hi]-track.times[lo]),0,1);return track.property==='quaternion'?Q(track.values[lo]).slerp(Q(track.values[hi]),f):V(track.values[lo]).lerp(V(track.values[hi]),f);}
export function validateSourceMotion(m,rig){
 if(m?.version!==1||m.kind!=='cinewright-source-motion'||!Number.isFinite(m.duration)||m.duration<=0||!Array.isArray(m.tracks)||m.tracks.length>512)fail('source motion v1 required');const used=new Set();
 for(const t of m.tracks){const key=t.bone+':'+t.property;if(used.has(key)||!['quaternion','position'].includes(t.property)||!Array.isArray(t.times)||!t.times.length||t.times.length>100000||t.times.length!==t.values?.length||t.times.some((x,i)=>!Number.isFinite(x)||x<0||x>m.duration||(i&&x<=t.times[i-1]))||t.values.some(x=>t.property==='quaternion'?!quat(x):!finite(x,3)))fail('invalid/duplicate source track');used.add(key);if(rig&&!rig.bones.some(b=>b.semantic===t.bone||b.name===t.bone))fail('unmapped source track '+t.bone);}
 return m;
}
/** Analytic knee-plane solve. Angles are flexion: 0=straight, pi=folded.
 * Distance and flexion clamp; no stretch. Pole is a world direction. */
export function solveTwoBoneIK({hip,target,pole=[0,0,1],upperLength,lowerLength,minFlexion=0,maxFlexion=2.8}){
 if(!finite(hip,3)||!finite(target,3)||!finite(pole,3)||![upperLength,lowerLength,minFlexion,maxFlexion].every(Number.isFinite)||upperLength<=1e-8||lowerLength<=1e-8||minFlexion<0||maxFlexion<minFlexion||maxFlexion>Math.PI)fail('invalid IK lengths/limits');
 const a=upperLength,b=lowerLength,h=V(hip),delta=V(target).sub(h),distance=delta.length(),axis=distance>1e-10?delta.clone().divideScalar(distance):new Vector3(0,-1,0);
 const flexion=clamp(Math.acos(clamp((distance*distance-a*a-b*b)/(2*a*b),-1,1)),minFlexion,maxFlexion);
 const reach=Math.max(1e-10,Math.sqrt(Math.max(0,a*a+b*b+2*a*b*Math.cos(flexion))));
 const x=(a*a-b*b+reach*reach)/(2*reach),height=Math.sqrt(Math.max(0,a*a-x*x));
 let bend=V(pole).addScaledVector(axis,-V(pole).dot(axis));if(bend.lengthSq()<1e-12){bend=new Vector3(Math.abs(axis.x)<.8?1:0,Math.abs(axis.x)<.8?0:1,0);bend.addScaledVector(axis,-bend.dot(axis));}bend.normalize();
 const knee=h.clone().addScaledVector(axis,x).addScaledVector(bend,height),end=h.clone().addScaledVector(axis,reach);
 return {knee:knee.toArray(),end:end.toArray(),flexion,unreachable:Math.abs(reach-distance)>1e-7,error:end.distanceTo(V(target))};
}
function setWorldRotation(rig,p,w,i,q){const parent=rig.bones[i].parent;p[i].quaternion.copy(parent<0?q:w[parent].quaternion.clone().invert().multiply(q));}
/** Inputs are immutable rig JSON and authored local tracks. Mapping is target semantic/name -> source semantic/name. */
export function createRetargeter(sourceRig,targetRig,motion,{mapping={},scale='proportional',rootMotion='apply',contact=null}={}){
 validateRetargetRig(sourceRig);validateRetargetRig(targetRig);validateSourceMotion(motion,sourceRig);
 if(!['apply','extract','inPlace'].includes(rootMotion))fail('rootMotion apply/extract/inPlace');
 const sr=pose(sourceRig),tr=pose(targetRig),sw=fk(sourceRig,sr),tw=fk(targetRig,tr),sq=coordinateQuaternion(sourceRig.coordinate),tq=coordinateQuaternion(targetRig.coordinate),conversion=tq.clone().multiply(sq.clone().invert()),inverse=conversion.clone().invert();
 const unit=c=>({m:1,cm:.01,mm:.001}[c.unit]),unitRatio=unit(sourceRig.coordinate)/unit(targetRig.coordinate);
 const factor=scale==='proportional'?legLength(targetRig,tw)/legLength(sourceRig,sw):scale==='units'?unitRatio:typeof scale==='number'&&scale>0&&Number.isFinite(scale)?scale:fail('invalid scale');
 const map=targetRig.bones.map(b=>{const name=mapping[b.semantic]??mapping[b.name]??b.semantic;const i=sourceRig.bones.findIndex(s=>s.semantic===name||s.name===name);if(i<0)fail('missing mapping '+b.semantic);return i;});
 const tracks=motion.tracks.map(t=>({...t,index:sourceRig.bones.findIndex(b=>b.semantic===t.bone||b.name===t.bone)}));const si=index(sourceRig,'hips'),ti=index(targetRig,'hips');
 if(sourceRig.bones[si].parent!==-1||targetRig.bones[ti].parent!==-1)fail('hips must be rig root');
 const up=V(targetRig.coordinate.up),forward=V(targetRig.coordinate.forward);
 if(contact){if(!Number.isFinite(contact.ground??0)||!Number.isFinite(contact.maxCorrection??.3)||(contact.maxCorrection??.3)<=0)fail('invalid contact ground/bound');for(const side of ['left','right'])for(const part of ['UpperLeg','LowerLeg','Foot'])if(index(targetRig,side+part)<0)fail('contact requires two legs');}
 if(contact){
  if(contact.pole!==undefined&&!finite(contact.pole,3))fail('contact pole must be finite vec3');
  const min=contact.minFlexion??.02,max=contact.maxFlexion??2.7;if(!Number.isFinite(min)||!Number.isFinite(max)||min<0||max>Math.PI||min>max)fail('contact flexion bounds require 0 <= min <= max <= PI');
  if(contact.windows!==undefined){if(!contact.windows||typeof contact.windows!=='object'||Array.isArray(contact.windows)||Object.keys(contact.windows).some(k=>!['left','right'].includes(k)))fail('contact windows require left/right arrays');for(const [side,windows]of Object.entries(contact.windows)){if(!Array.isArray(windows)||windows.some(w=>!finite(w,2)||w[0]<0||w[0]>w[1]||w[1]>motion.duration))fail('contact '+side+' windows require finite ordered seconds in [0,duration]');}}
 }
 let disposed=false;
 return {scale:factor,unitRatio,evaluate(frame,{fps=24,loop=true,weight=1,timeScale=1}={}){
  if(disposed)fail('disposed');if(!Number.isInteger(frame)||!Number.isFinite(fps)||fps<=0||!Number.isFinite(timeScale)||!Number.isFinite(weight)||weight<0||weight>1||typeof loop!=='boolean')fail('integer absolute frame and valid playback options required');
  let t=frame/fps*timeScale;t=loop?((t%motion.duration)+motion.duration)%motion.duration:clamp(t,0,motion.duration);
  const sp=pose(sourceRig);for(const track of tracks)sp[track.index][track.property].copy(sampleTrack(track,t));const current=fk(sourceRig,sp),p=pose(targetRig),w=[];
  const root=current[si].position.clone().sub(sw[si].position).applyQuaternion(conversion).multiplyScalar(factor);
  for(let i=0;i<p.length;i++){const j=map[i],delta=conversion.clone().multiply(current[j].quaternion).multiply(sw[j].quaternion.clone().invert()).multiply(inverse),desired=delta.multiply(tw[i].quaternion);const parent=targetRig.bones[i].parent;p[i].quaternion.copy(parent<0?desired:w[parent].quaternion.clone().invert().multiply(desired));if(i===ti&&rootMotion==='apply')p[i].position.add(root);w.push(parent<0?{position:p[i].position.clone(),quaternion:p[i].quaternion.clone()}:{position:p[i].position.clone().applyQuaternion(w[parent].quaternion).add(w[parent].position),quaternion:w[parent].quaternion.clone().multiply(p[i].quaternion)});}
  const contacts=[];
  if(contact)for(const side of ['left','right']){
   const active=contact.windows?.[side]?.some(([a,b])=>t>=a&&t<=b)??true;if(!active)continue;
   const ids=['UpperLeg','LowerLeg','Foot'].map(s=>index(targetRig,side+s)),[h,k,f]=ids;let cw=fk(targetRig,p);const initial=cw[f].position.clone(),ground=contact.ground??0,error=initial.dot(up)-ground,max=contact.maxCorrection??.3,target=initial.clone().addScaledVector(up,clamp(-error,-max,max));
   const solution=solveTwoBoneIK({hip:cw[h].position.toArray(),target:target.toArray(),pole:contact.pole??forward.toArray(),upperLength:tw[h].position.distanceTo(tw[k].position),lowerLength:tw[k].position.distanceTo(tw[f].position),minFlexion:contact.minFlexion??.02,maxFlexion:contact.maxFlexion??2.7});
   const beforePose=p.map(b=>b.quaternion.clone()),footQ=cw[f].quaternion.clone();for(const [i,child,goal]of [[h,k,solution.knee],[k,f,solution.end]]){cw=fk(targetRig,p);const from=cw[child].position.clone().sub(cw[i].position).normalize(),to=V(goal).sub(cw[i].position).normalize(),q=new Quaternion().setFromUnitVectors(from,to).multiply(cw[i].quaternion);setWorldRotation(targetRig,p,cw,i,q);}cw=fk(targetRig,p);setWorldRotation(targetRig,p,cw,f,footQ);cw=fk(targetRig,p);
   const boundRejected=initial.distanceTo(cw[f].position)>max+1e-8;if(boundRejected){p.forEach((b,i)=>b.quaternion.copy(beforePose[i]));cw=fk(targetRig,p);}
   contacts.push({side,boundRejected,before:error,after:cw[f].position.dot(up)-ground,correction:initial.distanceTo(cw[f].position),requestedCorrection:Math.min(Math.abs(error),max),unreachable:solution.unreachable,flexion:solution.flexion});
  }
  // Blend complete solved pose with rest, never with the previous frame.
  p.forEach((b,i)=>{b.position.lerpVectors(tr[i].position,b.position,weight);b.quaternion.copy(tr[i].quaternion.clone().slerp(b.quaternion,weight));});
  if(contact){const final=fk(targetRig,p);for(const c of contacts)c.after=final[index(targetRig,c.side+'Foot')].position.dot(up)-(contact.ground??0);}
  return {seconds:t,positions:p.map(b=>b.position.toArray()),quaternions:p.map(b=>b.quaternion.toArray()),root:root.multiplyScalar(weight).toArray(),contacts};
 },dispose(){disposed=true;}};
}
export function bakeRetarget(sourceRig,targetRig,motion,{fps=24,...options}={}){
 if(!Number.isInteger(fps)||fps<1||fps>120||motion.duration*fps>36000)fail('bake fps 1..120 and <=36000 frames');
 const retarget=createRetargeter(sourceRig,targetRig,motion,options),count=Math.ceil(motion.duration*fps),samples=[];try{for(let f=0;f<=count;f++)samples.push(retarget.evaluate(f,{fps,loop:false}));}finally{retarget.dispose();}
 return {version:1,kind:'cinewright-motion',generator:'retarget/'+RETARGET_VERSION,fps,duration:count/fps,bones:targetRig.bones.map(b=>({name:b.name,semantic:b.semantic,parent:b.parent,position:[...b.position],quaternion:[...b.quaternion]})),rootPolicy:options.rootMotion??'apply',samples,diagnostics:{scale:retarget.scale,unitRatio:retarget.unitRatio,contactMode:options.contact?'bounded-ground-plane':'none'}};
}
export function validateRetargetMotion(m){
 if(m?.version!==1||m.kind!=='cinewright-motion'||!Number.isInteger(m.fps)||m.fps<1||m.fps>120||!Number.isFinite(m.duration)||m.duration<=0||!Array.isArray(m.samples)||m.samples.length<2||m.samples.length>36001||Math.abs((m.samples.length-1)/m.fps-m.duration)>1e-8||!Array.isArray(m.bones)||!m.bones.length||m.bones.length>256||!['apply','extract','inPlace'].includes(m.rootPolicy))fail('invalid motion v1 header');
 const seen=new Set();for(const [i,b]of m.bones.entries()){if(!b.semantic||seen.has(b.semantic)||!Number.isInteger(b.parent)||b.parent< -1||b.parent>=i||!finite(b.position,3)||!quat(b.quaternion))fail('motion rest bone');seen.add(b.semantic);}
 for(const s of m.samples)if(!finite(s.root,3)||s.positions?.length!==m.bones.length||s.quaternions?.length!==m.bones.length||s.positions.some(a=>!finite(a,3))||s.quaternions.some(a=>!quat(a)))fail('invalid baked pose');return m;
}
/** Browser-safe coordinator factory. Owns pose state only; dispose restores initial rest.
 * rigged = createRiggedMesh(asset, material); never owns mesh/material/skeleton. */
export function createRetargetPlayer(rigged,motion,{fps=motion.fps,loop=true,weight=1,timeScale=1,rootMotion=motion.rootPolicy}={}){
 validateRetargetMotion(motion);if(!rigged?.mesh?.isSkinnedMesh||!(rigged.bones instanceof Map)||!Number.isFinite(fps)||fps<=0||typeof loop!=='boolean'||!Number.isFinite(weight)||weight<0||weight>1||!Number.isFinite(timeScale)||!['apply','extract','inPlace'].includes(rootMotion))fail('invalid rigged mesh/playback options');
 const bones=motion.bones.map(b=>{const bone=rigged.bones.get(b.semantic);if(!bone)fail('missing target '+b.semantic);return bone;});
 bones.forEach((b,i)=>{const r=motion.bones[i],parent=r.parent<0?null:bones[r.parent];if((b.parent?.isBone?b.parent:null)!==parent||b.position.distanceTo(V(r.position))>1e-5||b.quaternion.angleTo(Q(r.quaternion))>1e-4)fail('motion target rest mismatch '+r.semantic);});
 const rest=bones.map(b=>({position:b.position.clone(),quaternion:b.quaternion.clone(),scale:b.scale.clone()}));let disposed=false;const hip=motion.bones.findIndex(b=>b.semantic==='hips');if(hip<0)fail('motion hips required');
 return {evaluate(frame){if(disposed)fail('disposed');if(!Number.isInteger(frame))fail('integer absolute frame required');let t=frame/fps*timeScale;t=loop?((t%motion.duration)+motion.duration)%motion.duration:clamp(t,0,motion.duration);const raw=t*motion.fps,at=Math.abs(raw-Math.round(raw))<1e-9?Math.round(raw):raw,a=Math.min(Math.floor(at),motion.samples.length-1),b=Math.min(a+1,motion.samples.length-1),f=at-a,A=motion.samples[a],B=motion.samples[b],root=V(A.root).lerp(V(B.root),f);
 bones.forEach((bone,i)=>{const pos=V(A.positions[i]).lerp(V(B.positions[i]),f);if(i===hip){if(motion.rootPolicy==='apply'&&rootMotion!=='apply')pos.sub(root);else if(motion.rootPolicy!=='apply'&&rootMotion==='apply')pos.add(root);}bone.position.lerpVectors(rest[i].position,pos,weight);bone.quaternion.copy(rest[i].quaternion).slerp(Q(A.quaternions[i]).slerp(Q(B.quaternions[i]),f),weight);bone.scale.copy(rest[i].scale);});rigged.mesh.updateMatrixWorld(true);rigged.skeleton.update();return {seconds:t,root:root.multiplyScalar(weight).toArray()};},dispose(){if(disposed)return;disposed=true;bones.forEach((b,i)=>{b.position.copy(rest[i].position);b.quaternion.copy(rest[i].quaternion);b.scale.copy(rest[i].scale);});rigged.mesh.updateMatrixWorld(true);rigged.skeleton.update();}};
}

/** Stable expressionist integration name; same contract as createRetargetPlayer. */
export const prepareRetargetPlayback=createRetargetPlayer;
