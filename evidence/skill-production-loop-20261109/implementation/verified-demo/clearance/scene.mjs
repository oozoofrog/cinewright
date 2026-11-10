import {preparePoseTracks, prepareCorrections, prepareContacts, constrainTarget} from './modules/animation/pose-tracks.mjs';

// Original vector diagram: no external art or audio. Coordinates are canvas pixels.
export function makeEvaluator(source) {
  const tracks=preparePoseTracks(source.tracks);
  const corrections=source.corrections.length ? prepareCorrections(source.corrections) : null;
  const contacts=prepareContacts(source.contacts);
  const {geometry:g,timing}=source;
  return frame=>{
    const authored=tracks.at(frame);
    const offset=corrections?.at(authored.hook[0]).hook ?? [0,0];
    const requested=authored.hook.map((v,i)=>v+offset[i]);
    const origin=[requested[0],g.boomY];
    const reach=constrainTarget(origin,requested,{max:g.maxCable});
    const hook=reach.point;
    // Explicit scene policy applies the target to the parcel, not to the crane.
    // prepareContacts itself performs no constraint or IK solve.
    const target=contacts.at(frame).parcel;
    const parcel=target ?? [hook[0],hook[1]+g.sling];
    const [x,y]=parcel, [w,h]=g.parcelSize, o=g.obstacle;
    const collision=x+w/2>o.x && x-w/2<o.x+o.width && y+h/2>o.y && y-h/2<o.y+o.height;
    return {hook,parcel,reach,collision,attached:frame<timing.release,
      contactResidual:target?Math.hypot(x-target[0],y-target[1]):null};
  };
}
export async function prepare(api,config) {
  const source=await api.json(config.source), evaluate=makeEvaluator(source);
  return {evaluate:t=>evaluate(t.frame),draw(ctx,t,s){
    const g=source.geometry;
    ctx.fillStyle='#f5f0e6';ctx.fillRect(0,0,api.width,api.height);
    ctx.fillStyle='#d5c9ad';ctx.fillRect(0,g.floorY,api.width,api.height-g.floorY);
    ctx.fillStyle='#435765';ctx.fillRect(36,g.boomY,18,g.floorY-g.boomY);ctx.fillRect(36,g.boomY-12,api.width-72,12);
    ctx.fillStyle='#b79969';const o=g.obstacle;ctx.fillRect(o.x,o.y,o.width,o.height);
    for(const p of g.platforms){ctx.fillStyle='#667c80';ctx.fillRect(p.x,p.y,p.width,p.height);}
    ctx.strokeStyle='#435765';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.hook[0],g.boomY);ctx.lineTo(...s.hook);ctx.stroke();
    ctx.fillStyle='#435765';ctx.fillRect(s.hook[0]-13,g.boomY-5,26,16);
    ctx.beginPath();ctx.arc(s.hook[0],s.hook[1],6,0,Math.PI);ctx.stroke();
    if(s.attached){ctx.beginPath();ctx.moveTo(...s.hook);ctx.lineTo(s.parcel[0]-12,s.parcel[1]-g.parcelSize[1]/2);ctx.moveTo(...s.hook);ctx.lineTo(s.parcel[0]+12,s.parcel[1]-g.parcelSize[1]/2);ctx.stroke();}
    ctx.fillStyle='#c36443';ctx.fillRect(s.parcel[0]-g.parcelSize[0]/2,s.parcel[1]-g.parcelSize[1]/2,...g.parcelSize);
    ctx.strokeStyle='#f5d7a3';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.parcel[0],s.parcel[1]-g.parcelSize[1]/2);ctx.lineTo(s.parcel[0],s.parcel[1]+g.parcelSize[1]/2);ctx.stroke();
  }};
}
