import {preparePoseTracks} from '../../modules/animation/pose-tracks.mjs';
export function makeEvaluator(source){
  const tracks=preparePoseTracks(source.tracks);
  return frame=>{
    const {a,b}=tracks.at(frame);
    const traces=source.placements.filter(e=>e.from<=frame).map(e=>[...e.position]);
    return {positions:[a,b],traces};
  };
}
function poly(g,points,color){g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
function ellipse(g,x,y,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();}
function cup(g,[x,y],green){
  ellipse(g,x+10,y+29,68,15,'#172e32');
  ellipse(g,x,y+21,61,19,green?'#74928a':'#d6c6a6');
  ellipse(g,x,y+18,56,16,green?'#9bad97':'#f2e3be');
  // Authored ceramic silhouette; no physics or human grip is implied.
  g.strokeStyle=green?'#9ab39f':'#efe4c9';g.lineWidth=9;g.beginPath();g.ellipse(x+36,y-15,17,16,-.16,0,Math.PI*2);g.stroke();
  g.fillStyle=green?'#456c61':'#d9cbb0';g.beginPath();g.moveTo(x-34,y-31);g.bezierCurveTo(x-34,y+17,x-24,y+24,x,y+24);g.bezierCurveTo(x+25,y+24,x+34,y+13,x+34,y-31);g.closePath();g.fill();
  poly(g,[[x-29,y-27],[x-20,y-28],[x-17,y+12],[x-24,y+7]],green?'#648678':'#eee1c5');
  ellipse(g,x,y-31,34,12,green?'#a5b69c':'#fcf0cd');
  ellipse(g,x,y-31,28,8,'#3b302a');
  g.strokeStyle=green?'#d7d4ab':'#fff0cd';g.lineWidth=1.5;g.beginPath();g.ellipse(x,y-32,31,10,0,Math.PI,Math.PI*2);g.stroke();
}
export async function prepare(api,config){
  const source=await api.json('source.json'),at=makeEvaluator(source);
  if(config.role==='vessels')return {
    evaluate(t){return t.read('vessels','canvas-px');},
    draw(g,t,positions){positions.forEach((p,i)=>cup(g,p,i===0));}
  };
  return {evaluate(t){const s=at(t.frame);t.write('vessels',s.positions);return s;},draw(g,t,s){
    g.fillStyle='#182f34';g.fillRect(0,0,960,540);
    poly(g,[[695,0],[895,0],[704,222],[445,222]],'#304c4e');
    poly(g,[[0,210],[960,172],[960,540],[0,540]],'#a96047');
    poly(g,[[104,214],[764,190],[915,540],[8,540]],'#d7c399');
    poly(g,[[695,190],[775,205],[907,512],[516,540]],'#e9d6a7');
    // The offscreen window changes the reading of the space without a camera drift.
    poly(g,[[728,192],[741,192],[660,540],[633,540]],'#b5a580');
    poly(g,[[122,407],[844,374],[854,388],[119,422]],'#c1ae88');
    for(const [x,y] of s.traces){
      g.save();g.globalAlpha=source.traceAlpha;g.strokeStyle='#4d5543';g.lineWidth=3;
      g.beginPath();g.ellipse(x,y+21,55,16,0,.34,Math.PI*1.12);g.stroke();
      g.beginPath();g.ellipse(x,y+21,55,16,0,Math.PI*1.23,Math.PI*1.88);g.stroke();
      g.lineWidth=1.4;g.beginPath();g.ellipse(x+1,y+23,51,15,0,.6,Math.PI*1.6);g.stroke();g.restore();
    }
    // A cut cloth edge, not simulated paper grain.
    g.strokeStyle='#eddbb5';g.lineWidth=2;g.beginPath();g.moveTo(104,214);g.lineTo(764,190);g.stroke();
  }};
}
