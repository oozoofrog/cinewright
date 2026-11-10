import {preparePoseTracks,prepareCorrections} from './modules/animation/pose-tracks.mjs';
export const transform=(p,a,o)=>{const r=a*Math.PI/180;return [o[0]+p[0]*Math.cos(r)-p[1]*Math.sin(r),o[1]+p[0]*Math.sin(r)+p[1]*Math.cos(r)];};
export function makeEvaluator(c){const tracks=preparePoseTracks(c.tracks),correction=c.corrections.length?prepareCorrections(c.corrections):{at:()=>({})};return f=>{const p=tracks.at(f),angle=p.wing+(correction.at(p.wing/60).wing??0);return {angle,headAngle:p.head,hinge:c.hinge,mount:c.mount,wing:c.wing.map(q=>transform(q,angle,c.hinge)),head:c.head.map(q=>transform(q,p.head,c.headPivot)),beak:c.beak.map(q=>transform(q,p.head,c.headPivot))};};}
export async function prepare(api,config){const c=await api.json(config.source),evaluate=makeEvaluator(c);return {evaluate:t=>evaluate(t.frame),draw(g,t,s){
const poly=(pts,fill,stroke='#25484b')=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=stroke;g.lineWidth=1.6;g.stroke();};
const line=(a,b,color,width=1.2)=>{g.beginPath();g.moveTo(...a);g.lineTo(...b);g.strokeStyle=color;g.lineWidth=width;g.stroke();};
g.fillStyle='#f4efdf';g.fillRect(0,0,api.width,api.height);
line([210,404],[426,404],'#d4cdbb');
line([310,403],c.mount,'#25484b',5);poly([[291,403],[329,403],[338,410],[282,410]],'#25484b');
poly(c.body,'#347f80');poly([[220,257],[279,226],[310,261]],'#79aaa0');poly([[220,257],[176,234],[204,273],[265,284]],'#448d88');
poly(s.head,'#79aaa0');poly(s.beak,'#d69349');line(c.headPivot,transform([30,3],s.headAngle,c.headPivot),'#25484b');
const eye=transform([38,-30],s.headAngle,c.headPivot);g.beginPath();g.arc(...eye,3,0,Math.PI*2);g.fillStyle='#203f42';g.fill();
poly(s.wing,'#e2a35d');poly([s.wing[0],s.wing[1],s.wing[3]],'#f1c984');line(s.wing[0],s.wing[2],'#ab713d');
g.beginPath();g.arc(...c.hinge,5,0,Math.PI*2);g.fillStyle='#f4efdf';g.fill();g.strokeStyle='#25484b';g.stroke();
line([310,296],[310,308],'#25484b',5);
}};}
