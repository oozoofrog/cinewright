/** Frame-domain exposure. Half-open entries, absolute output time. */
export function sampleExposure(frame, options={}) {
  const {every=1,from=0,track}=options;
  if (!Number.isSafeInteger(frame)||!Number.isSafeInteger(from)||!Number.isSafeInteger(every)||every<1) throw new Error('exposure: integer frame/from and positive every required');
  if(track){let end=-Infinity;for(const e of track){if(!Number.isSafeInteger(e.from)||!Number.isSafeInteger(e.to)||e.from<end||e.to<=e.from||!Number.isSafeInteger(e.every??1)||(e.every??1)<1)throw new Error('exposure: ordered half-open track required');end=e.to;}const e=track.find(e=>e.from<=frame&&frame<e.to);return e?sampleExposure(frame,e):null;}
  return {frame:from+Math.floor((frame-from)/every)*every,...(Object.hasOwn(options,'value')?{value:options.value}:{})};
}
export function poseAt(keys,frame,{mode='linear'}={}){
  if(!['linear','hold'].includes(mode)||!Number.isFinite(frame)||!Array.isArray(keys)||!keys.length)throw new Error('poseAt: keys/time/mode invalid');
  let prior=-Infinity;const layout=Object.keys(keys[0].pose??{}).sort().join('|');for(const k of keys){if(!Number.isSafeInteger(k.frame)||k.frame<=prior||!k.pose||Object.keys(k.pose).sort().join('|')!==layout||Object.values(k.pose).some(v=>!Number.isFinite(v)))throw new Error('poseAt: ordered finite pose keys required');prior=k.frame;}
  if(frame<=keys[0].frame)return {...keys[0].pose};const right=keys.findIndex(k=>frame<k.frame);if(right<0)return {...keys.at(-1).pose};const a=keys[right-1],b=keys[right];if(mode==='hold')return {...a.pose};
  if(Object.keys(a.pose).sort().join('|')!==Object.keys(b.pose).sort().join('|'))throw new Error('poseAt: corresponding bone keys required');const p=(frame-a.frame)/(b.frame-a.frame);return Object.fromEntries(Object.keys(a.pose).map(id=>[id,a.pose[id]+(b.pose[id]-a.pose[id])*p]));
}
