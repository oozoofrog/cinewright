// Cut-based spatial reversal: no interpolated camera and no accumulated traces.
const ramp=(f,a,b)=>{const x=Math.max(0,Math.min(1,(f-a)/(b-a)));return x*x*(3-2*x);};
function poly(g,p,c){g.fillStyle=c;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
export function makeEvaluator(){return frame=>({inside:frame>=120,opening:ramp(frame,48,84),light:1-ramp(frame,156,180)});}
export function prepare(){const at=makeEvaluator();return {evaluate:t=>at(t.frame),draw(g,t,s){
  g.fillStyle=s.inside?'#e6cf9c':'#213b49';g.fillRect(0,0,960,540);
  if(!s.inside){
    poly(g,[[0,436],[960,369],[960,540],[0,540]],'#172c37');
    g.fillStyle='#11252e';g.fillRect(568,72,201,360);
    g.fillStyle='#ad7755';g.fillRect(578,82,181,350);
    g.fillStyle='#e9cd8d';g.fillRect(587,90,163*s.opening,342);
    poly(g,[[587,432],[587+163*s.opening,432],[587+283*s.opening,540],[587-223*s.opening,540]],'#d7b57a');
    const edge=587+150*s.opening;
    poly(g,[[edge,90],[750,90],[750,432],[edge,432-45*s.opening]],'#44606b');
    g.fillStyle='#e0b780';g.fillRect(edge+16,252,6,12);
  }else{
    // Reverse shot: the former bright opening becomes the dark outside.
    poly(g,[[0,410],[960,479],[960,540],[0,540]],'#b87b55');
    g.fillStyle='#b27b51';g.fillRect(195,52,221,412);
    g.fillStyle='#162e3c';g.fillRect(207,64,197,400);
    poly(g,[[207,464],[404,464],[522,540],[116,540]],'#674d3e');
    g.fillStyle='#d1a36f';g.fillRect(211,65,9,394);
    // An empty patch of wall is exposed only after the reverse cut.
    g.fillStyle='#f2dca7';g.globalAlpha=s.light;g.fillRect(608,141,134,192);g.globalAlpha=1;
    g.strokeStyle='#a87550';g.lineWidth=3;g.strokeRect(607,140,136,194);
  }
}};}
