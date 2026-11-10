import {sampleExposure,poseAt} from '../../animation/exposure.mjs';
import {prepareRig2D,evaluateRig2D} from '../../animation/rig2d.mjs';
import {evaluateShot,projectPlanes} from '../../animation/shot.mjs';
import {makePath,validateShape} from '../../fx2d/mask.mjs';
import {transitionAt,drawTransitionMask} from '../../fx2d/transition.mjs';
import {seeded} from '../../motion.mjs';
const finite=Number.isFinite;
const vec=(v,n)=>Array.isArray(v)&&v.length===n&&v.every(finite);
export function validateScene(s){
 if(!s||s.version!==1||s.style!=='silhouette-theatre'||!Number.isSafeInteger(s.seed??17)||!vec(s.size,2)||s.size.some(v=>v<16||v>4096||v%2)||!Number.isInteger(s.frames)||s.frames<1||!Number.isInteger(s.fps)||s.fps<1||s.fps>120)throw new Error('silhouette: scene v1, size, seed, fps/frames required');
 if(!Array.isArray(s.planes)||!s.planes.length||s.planes.length>16||!s.shapes||typeof s.shapes!=='object'||Object.keys(s.shapes).length>512)throw new Error('silhouette: 1..16 planes and <=512 shapes required');
 const ids=new Set();let count=0;
 for(const p of s.planes){if(!finite(p.depth)||p.depth<0||p.depth>1||!Array.isArray(p.objects))throw new Error('silhouette: plane depth/objects invalid');for(const o of p.objects){if(!o.id||ids.has(o.id)||++count>256)throw new Error('silhouette: unique ids; max 256 objects');ids.add(o.id);if(!Number.isInteger(o.from??0)||!Number.isInteger(o.to??s.frames)||(o.from??0)<0||(o.to??s.frames)>s.frames||(o.to??s.frames)<=(o.from??0))throw new Error('silhouette: object requires [from,to) within scene');if(!['shape','puppet','shadow','halo','alpha'].includes(o.type))throw new Error(`silhouette: unknown object type ${o.type}`);if(['shape','shadow'].includes(o.type)&&!o.shape)throw new Error('silhouette: shape required');if(o.shape&&!s.shapes[o.shape])throw new Error(`silhouette: unknown shape ${o.shape}`);if(o.type==='puppet'){const r=prepareRig2D(o.rig);if(!o.poses?.length)throw new Error('silhouette: puppet requires pose bank');for(const b of o.rig.bones)if(b.shape&&!s.shapes[b.shape])throw new Error('silhouette: bone shape missing');for(const k of o.poses)evaluateRig2D(r,k.pose);poseAt(o.poses,0,{mode:o.poseMode??'linear'});}if(o.type==='alpha'&&(!o.asset||!vec(o.bounds,4)))throw new Error('silhouette: alpha asset and bounds required');for(const k of o.keys??[]){if(!Number.isInteger(k.frame)||Object.values(k).some(v=>!finite(v)))throw new Error('silhouette: finite ordered transform keys required');}for(let i=1;i<(o.keys?.length??0);i++)if(o.keys[i].frame<=o.keys[i-1].frame)throw new Error('silhouette: transform key order');if(o.type==='alpha'&&(typeof o.asset!=='string'||!/^assets\/[\w./-]+$/.test(o.asset)||o.asset.split('/').includes('..')||o.bounds[2]<=0||o.bounds[3]<=0))throw new Error(`silhouette ${o.id}: local alpha asset and positive bounds required`);
 if(o.type==='halo'&&(!finite(o.radius??250)||(o.radius??250)<=0||(o.radius??250)>8192))throw new Error(`silhouette ${o.id}: halo radius out of range`);
 if(o.type==='shadow'&&(!finite(o.opacity??.25)||(o.opacity??.25)<0||(o.opacity??.25)>1||!finite(o.flatten??.14)||(o.flatten??.14)<=0))throw new Error(`silhouette ${o.id}: shadow opacity/flatten invalid`);
 if(o.clock!==undefined&&!['frame','exposed'].includes(o.clock)||o.transformClock!==undefined&&!['frame','pose'].includes(o.transformClock))throw new Error(`silhouette ${o.id}: unknown clock`);
 for(const k of o.keys??[]){if(k.opacity!==undefined&&(k.opacity<0||k.opacity>1)||k.scale!==undefined&&(k.scale<=0||k.scale>32)||k.scaleX===0||k.scaleY===0)throw new Error(`silhouette ${o.id}: opacity/scale out of range`);}
 for(const pair of o.criticalPairs??[]){if(o.type!=='puppet'||!o.rig.bones.some(b=>b.id===pair.a)||!o.rig.bones.some(b=>b.id===pair.b)||!finite(pair.minDistance)||pair.minDistance<0)throw new Error(`silhouette ${o.id}: invalid critical pair`);}
 if(!Number.isInteger(o.every??2)||(o.every??2)<1)throw new Error('silhouette: exposure every >=1');}}
 for(const shape of Object.values(s.shapes))validateShape(shape);
 if(s.reveal){transitionAt(0,s.reveal);if(s.reveal.from<0||s.reveal.to>s.frames)throw new Error('silhouette: reveal outside scene');if(s.reveal.kind==='match'&&!s.shapes[s.reveal.shape])throw new Error('silhouette: match reveal requires authored shape');}
 evaluateShot(s.camera,0);return true;
}
function transformAt(keys,frame){const defaults={x:0,y:0,rotation:0,scale:1,scaleX:1,scaleY:1,opacity:1};if(!keys?.length)return defaults;const i=keys.findIndex(k=>k.frame>frame),a=keys[Math.max(0,i<0?keys.length-1:i-1)],b=i<0?a:keys[i],p=a===b?0:Math.max(0,(frame-a.frame)/(b.frame-a.frame));return Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,(a[k]??v)+((b[k]??v)-(a[k]??v))*p]));}
export function collectAssets(scene){return scene.planes.flatMap(p=>p.objects.filter(o=>o.type==='alpha').map(o=>({path:o.asset,kind:'image'})));}
export async function prepare(api,config={}){
 const s=structuredClone(config.scene??await api.json(config.sceneFile));validateScene(s);
 const paths=Object.fromEntries(Object.entries(s.shapes).map(([id,shape])=>[id,makePath(shape)]));const rigs=new Map(),images=new Map();
 for(const p of s.planes)for(const o of p.objects){if(o.type==='puppet')rigs.set(o.id,prepareRig2D(o.rig));if(o.type==='alpha')images.set(o.id,await api.image(o.asset));}
 const stage=new OffscreenCanvas(api.pixelWidth,api.pixelHeight),g=stage.getContext('2d');
 const tile=new OffscreenCanvas(64,64),tg=tile.getContext('2d');tg.fillStyle='#897e66';for(let i=0;i<380;i++)tg.fillRect(seeded(s.seed,i*2)*64,seeded(s.seed,i*2+1)*64,0.7,0.7);const texture=tg.createPattern(tile,'repeat');let disposed=false;
 function evaluate(t){if(disposed)throw new Error('silhouette disposed');const camera=evaluateShot(s.camera,t.frame),planes=projectPlanes(s.planes,camera,{width:api.width,height:api.height}),diagnostics=[];const objects={};
  for(const p of planes){for(const msg of p.diagnostics)diagnostics.push(`${p.id}: ${msg}`);for(const o of p.objects){const exposed=o.clock==='frame'?t.frame:sampleExposure(t.exposed??t.frame,{every:o.every??2}).frame;const transform=transformAt(o.keys,o.transformClock==='pose'?exposed:t.frame),rig=o.type==='puppet'?evaluateRig2D(rigs.get(o.id),poseAt(o.poses,exposed,{mode:o.poseMode??'linear'})):null;objects[o.id]={transform,exposed,rig};if(rig)for(const pair of o.criticalPairs??[]){const a=rig[pair.a]?.pivot,b=rig[pair.b]?.pivot;if(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<pair.minDistance)diagnostics.push(`${o.id}: critical overlap ${pair.a}/${pair.b}`);}}}return {planes,objects,camera,diagnostics};
 }
 function shape(id){const a=s.shapes[id];g.fillStyle=a.fill??s.ink??'#101720';g.fill(paths[id],a.fillRule??'evenodd');if(a.edge!==false){g.save();g.strokeStyle=texture;g.globalAlpha*=0.5;g.lineWidth=a.edgeWidth??1.8;g.stroke(paths[id]);g.restore();}}
 function draw(target,t,state=evaluate(t)){
  if(disposed)throw new Error('silhouette disposed');g.reset();g.scale(api.pixelWidth/api.width,api.pixelHeight/api.height);
  if(s.backdrop){const grad=g.createLinearGradient(0,0,0,api.height);for(const [at,color]of s.backdrop)grad.addColorStop(at,color);g.fillStyle=grad;g.fillRect(0,0,api.width,api.height);}
  for(const p of state.planes){g.save();g.transform(...p.transform);for(const o of p.objects){const st=state.objects[o.id],a=st.transform;if((o.from??0)>t.frame||t.frame>=(o.to??s.frames))continue;g.save();g.translate(a.x,a.y);g.rotate(a.rotation);g.scale(a.scale*a.scaleX,a.scale*a.scaleY);g.globalAlpha=a.opacity;
    if(o.type==='halo'){const r=o.radius??250,gradient=g.createRadialGradient(0,0,0,0,0,r);gradient.addColorStop(0,o.color??'#ffedb077');gradient.addColorStop(1,'#ffeebb00');g.fillStyle=gradient;g.fillRect(-r,-r,2*r,2*r);}
    else if(o.type==='alpha')g.drawImage(images.get(o.id),...o.bounds);
    else if(o.type==='puppet'){for(const b of rigs.get(o.id).bones){if(!b.shape)continue;g.save();g.transform(...st.rig[b.id].matrix);shape(b.shape);g.restore();}}
    else {if(o.type==='shadow'){g.globalAlpha*=o.opacity??0.25;g.scale(1,o.flatten??0.14);}shape(o.shape);}
    g.restore();}g.restore();}
  if(s.reveal){g.save();g.globalCompositeOperation='destination-in';drawTransitionMask(g,transitionAt(t.frame,s.reveal),{width:api.width,height:api.height,path:s.reveal.shape?paths[s.reveal.shape]:undefined});g.restore();}
  target.save();target.drawImage(stage,0,0,api.width,api.height);target.restore();
 }
 return {evaluate,draw,diagnostics:t=>evaluate(t).diagnostics,dispose(){if(disposed)return;disposed=true;images.clear();rigs.clear();stage.width=2;stage.height=2;tile.width=2;tile.height=2;},getStats:()=>({objects:s.planes.reduce((n,p)=>n+p.objects.length,0),paths:Object.keys(paths).length,pixelBuffers:2})};
}
