import {ease, clamp, lerp} from '../motion.mjs';
const finite = (v, label) => { if (!Number.isFinite(v)) throw Error(`${label}: finite number required`); return v; };
const shape = v => Number.isFinite(v) ? 0 : Array.isArray(v) && v.length >= 2 && v.length <= 4 && Array.from(v).every(Number.isFinite) ? v.length : -1;
const copy = v => Array.isArray(v) ? [...v] : v;
const blend = (a,b,t) => Array.isArray(a) ? a.map((v,i)=>lerp(v,b[i],t)) : lerp(a,b,t);
function curve(mode='smoothstep') {
 if (mode==='smoothstep') return ease;
 if (mode==='linear') return t=>t;
 if (mode==='hold') return ()=>0;
 // Monotone cubic Bezier ordinate; time is normalized linear, no ambiguous x inversion.
 if (mode && Array.isArray(mode.bezier) && mode.bezier.length===2 && mode.bezier.every(Number.isFinite)) {
  const [a,b]=mode.bezier;
  if (a>=0 && a<=b && b<=1) return t=>3*(1-t)**2*t*a+3*(1-t)*t*t*b+t**3;
 }
 throw Error('track: invalid interpolation');
}
/** Compile once. Keys are {frame,value,interpolation?}; interpolation belongs to the outgoing segment. */
export function prepareTrack(keys) {
 if (!Array.isArray(keys)||!keys.length) throw Error('track: keys required');
 const dimension=shape(keys[0].value); let previous=-Infinity;
 const rows=keys.map(k=>{
  finite(k.frame,'frame');
  if(k.frame<=previous||dimension<0||shape(k.value)!==dimension) throw Error('track: ordered keys with matching finite scalar/vector values required');
  previous=k.frame; return {frame:k.frame,value:copy(k.value),hold:k.interpolation==='hold',curve:curve(k.interpolation)};
 });
 return Object.freeze({at(frame){
  finite(frame,'frame');
  if(frame<=rows[0].frame)return copy(rows[0].value);
  let lo=0,hi=rows.length;
  while(lo<hi){const m=(lo+hi)>>>1;if(rows[m].frame<frame)lo=m+1;else hi=m;}
  if(lo===rows.length)return copy(rows.at(-1).value);
  const a=rows[lo-1],b=rows[lo];if(a.hold&&frame===b.frame)return copy(b.value);return blend(a.value,b.value,a.curve((frame-a.frame)/(b.frame-a.frame)));
 }});
}
export function preparePoseTracks(channels) {
 if(!channels||!Object.keys(channels).length)throw Error('tracks: channels required');
 const tracks=Object.entries(channels).map(([id,keys])=>[id,prepareTrack(keys)]);
 return Object.freeze({at:frame=>Object.fromEntries(tracks.map(([id,t])=>[id,t.at(frame)]))});
}
/** Authored additive pose-space samples. Compact support, weighted average; no learned deformation. */
export function prepareCorrections(samples) {
 if(!Array.isArray(samples)||!samples.length)throw Error('corrections: samples required');
 const layout=Object.keys(samples[0].delta).sort().join('|');
 const rows=samples.map(s=>{
  finite(s.center,'center');finite(s.radius,'radius');
  if(s.radius<=0||Object.keys(s.delta).sort().join('|')!==layout||Object.values(s.delta).some(v=>shape(v)<0))throw Error('corrections: invalid radius/delta');
  return structuredClone(s);
 });
 for(const id of Object.keys(rows[0].delta))if(rows.some(s=>shape(s.delta[id])!==shape(rows[0].delta[id])))throw Error('corrections: mismatched shape');
 return Object.freeze({at(driver){
  finite(driver,'driver');const weights=rows.map(s=>ease(1-clamp(Math.abs(driver-s.center)/s.radius))),total=Math.max(1,weights.reduce((a,b)=>a+b,0));
  return Object.fromEntries(Object.keys(rows[0].delta).map(id=>{
   const zero=Array.isArray(rows[0].delta[id])?rows[0].delta[id].map(()=>0):0;
   return [id,rows.reduce((v,s,i)=>Array.isArray(v)?v.map((x,j)=>x+s.delta[id][j]*weights[i]/total):v+s.delta[id]*weights[i]/total,zero)];
  }));
 }});
}
/** Half-open contact windows. Output is an authored target, not a foot-lock or IK solver. */
export function prepareContacts(windows) {
 if(!Array.isArray(windows))throw Error('contacts: windows required');
 const end=new Map();const rows=windows.map(w=>{
  finite(w.from,'from');finite(w.to,'to');
  if(typeof w.channel!=='string'||!w.channel||w.to<=w.from||w.from<(end.get(w.channel)??-Infinity)||shape(w.target)<2)throw Error('contacts: invalid/overlapping windows');
  end.set(w.channel,w.to);return structuredClone(w);
 });
 return Object.freeze({at(frame){finite(frame,'frame');return Object.fromEntries(rows.filter(w=>w.from<=frame&&frame<w.to).map(w=>[w.channel,copy(w.target)]));}});
}
/** Radial target constraint with inner/outer reach diagnostics, dimension-independent (vec2..4). */
export function constrainTarget(origin,target,{min=0,max}={}) {
 if(shape(origin)<2||shape(origin)!==shape(target)||!Number.isFinite(min)||min<0||!Number.isFinite(max)||max<=0||max<min)throw Error('target: finite matching vectors and 0 <= min <= max required');
 const d=target.map((v,i)=>v-origin[i]),distance=Math.hypot(...d),reach=clamp(distance,min,max);
 const point=origin.map((v,i)=>v+(distance?d[i]*reach/distance:i===0?reach:0));
 return {point,distance,residual:Math.abs(distance-reach),reachable:distance>=min&&distance<=max};
}
