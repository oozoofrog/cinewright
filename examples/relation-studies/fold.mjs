import {preparePoseTracks} from '../../modules/animation/pose-tracks.mjs';
export function makeEvaluator(source){const tracks=preparePoseTracks(source.tracks);return frame=>tracks.at(frame);}
function poly(g,p,c){g.fillStyle=c;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
export async function prepare(api){const s=await api.json('source.json'),at=makeEvaluator(s);return {evaluate:t=>at(t.frame),draw(g,t,state){
  g.fillStyle='#e6dfcc';g.fillRect(0,0,960,540);
  const edges=[390,570,390-150*Math.cos(state.left),570+150*Math.cos(state.right)];
  const lo=Math.min(...edges),hi=Math.max(...edges);
  poly(g,[[lo,352],[hi,352],[hi+40,380],[lo+40,380]],'#c6bfad');
  // Vertices retain explicit correspondence around two authored hinge lines.
  // Cosine is a chosen orthographic fold, not generated semantic morphing.
  poly(g,[[390,219],[570,219],[570,351],[390,351]],'#c56348');
  for(const [side,angle] of [[-1,state.left],[1,state.right]]){
    const hinge=side<0?390:570;
    const edge=hinge+side*150*Math.cos(angle),lift=-65*Math.sin(angle);
    const face=Math.cos(angle)>=0?'#477b80':'#f3c672';
    poly(g,[[hinge,219],[edge,219+lift],[edge,351+lift],[hinge,351]],face);
    g.strokeStyle='#d7ad6c';g.lineWidth=1.5;g.beginPath();g.moveTo(hinge,219);g.lineTo(hinge,351);g.stroke();
    if(Math.cos(angle)<-.92){
      // A small printed line is revealed on the reverse, stays attached to the paper.
      g.strokeStyle='#b86b4d';g.lineWidth=2;g.beginPath();g.moveTo(hinge-side*20,259);g.lineTo(edge+side*22,259+lift*.6);g.stroke();
    }
  }
}};}
