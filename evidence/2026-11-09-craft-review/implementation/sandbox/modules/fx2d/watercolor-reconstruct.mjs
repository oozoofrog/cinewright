// Reconstruct concentration BEFORE optical compositing. No screen-space blur.
// The baked total pigment is not a mobile/deposited decomposition.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function cubic(a,b,c,d,t){return b+.5*t*(c-a+t*(2*a-5*b+4*c-d+t*(3*(b-c)+d-a)));}
export function createReconstruction(width,height,outWidth,outHeight,{seed=17,method='cubic',grain=.12}={}){
 if(![width,height,outWidth,outHeight].every(v=>Number.isInteger(v)&&v>=2&&v<=4096)||outWidth*outHeight>4194304||!['cubic','linear'].includes(method)||!Number.isSafeInteger(seed)||!Number.isFinite(grain)||grain<0||grain>1)throw Error('watercolor reconstruction: invalid dimensions/options');
 const rows=new Float32Array(height*outWidth),pixels=new Uint8ClampedArray(outWidth*outHeight*4),texture=new Float32Array(outWidth*outHeight);
 for(let y=0;y<outHeight;y++)for(let x=0;x<outWidth;x++){
  let h=Math.imul(x+seed,374761393)^Math.imul(y+1,668265263);h=Math.imul(h^(h>>>13),1274126177);const n=((h^(h>>>16))>>>0)/4294967295;
  texture[y*outWidth+x]=1+grain*(2*n-1); // stationary paper tooth, no temporal randomness
 }
 const sample=(a,b,c,d,t)=>method==='linear'?b+(c-b)*t:clamp(cubic(a,b,c,d,t),Math.min(a,b,c,d),Math.max(a,b,c,d));
 function draw(fields,colors,{density=15,paper=[250,246,233]}={}){
  if(fields.length!==colors.length||fields.some(a=>a.length!==width*height)||!Number.isFinite(density)||density<0)throw Error('watercolor reconstruction: field/density mismatch');
  for(let i=0;i<pixels.length;i+=4){pixels[i]=paper[0];pixels[i+1]=paper[1];pixels[i+2]=paper[2];pixels[i+3]=255;}
  for(let j=0;j<fields.length;j++){
   const field=fields[j];
   for(let y=0;y<height;y++)for(let x=0;x<outWidth;x++){
    const sx=(x+.5)*width/outWidth-.5,k=Math.floor(sx),t=sx-k;
    rows[y*outWidth+x]=sample(...[-1,0,1,2].map(d=>field[y*width+clamp(k+d,0,width-1)]),t);
   }
   for(let y=0;y<outHeight;y++){
    const sy=(y+.5)*height/outHeight-.5,k=Math.floor(sy),t=sy-k,ri=[-1,0,1,2].map(d=>clamp(k+d,0,height-1)*outWidth);
    for(let x=0;x<outWidth;x++){
     const i=y*outWidth+x,c=Math.max(0,sample(rows[ri[0]+x],rows[ri[1]+x],rows[ri[2]+x],rows[ri[3]+x],t));
     const alpha=-Math.expm1(-c*density*texture[i]);
     for(let channel=0;channel<3;channel++)pixels[i*4+channel]+=(colors[j][channel]-pixels[i*4+channel])*alpha;
    }
   }
  }
  return pixels;
 }
 return {draw,pixels,bytes:rows.byteLength+pixels.byteLength+texture.byteLength};
}
