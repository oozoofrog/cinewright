import {createReconstruction} from '../../fx2d/watercolor-reconstruct.mjs';
import * as lineWash from '../line-wash/index.mjs';
import {validateBake,decodeWatercolor} from '../../fx2d/watercolor.mjs';
export function validateScene(s){if(!s||s.version!==1||s.style!=='watercolor-physical'||!Array.isArray(s.size)||s.size.length!==2||s.size.some(x=>!Number.isInteger(x)||x<16||x>4096||x%2)||!Number.isInteger(s.frames)||s.frames<1||!Number.isInteger(s.fps)||s.fps<1||s.fps>120||typeof s.bake!=='string'||!/^assets\/[\w./-]+\.json$/.test(s.bake)||s.bake.split('/').includes('..'))throw Error('watercolor: invalid scene');if(s.reconstruction!==undefined&&!['cells','linear','cubic'].includes(s.reconstruction))throw Error('watercolor: invalid reconstruction');if(s.density!==undefined&&(!Number.isFinite(s.density)||s.density<0||s.density>10000))throw Error('watercolor: invalid density');if(s.overlay!==undefined){lineWash.validateScene(s.overlay);if(s.overlay.frames!==s.frames||s.overlay.fps!==s.fps||s.overlay.size.some((v,i)=>v!==s.size[i]))throw Error('watercolor: overlay timeline or size mismatch');}return true;}
export function collectAssets(s){validateScene(s);return [{path:s.bake,kind:'watercolor-bake'},...(s.overlay&&lineWash.collectAssets?lineWash.collectAssets(s.overlay):[])];}
export async function prepare(api,config={}){
 const s=structuredClone(config.scene??await api.json(config.sceneFile));validateScene(s);
 const b=await api.json(s.bake);validateBake(b);if(b.header.frames!==s.frames)throw Error('watercolor: frame count mismatch');
 const overlay=s.overlay?await lineWash.prepare(api,{scene:s.overlay,transparentPaper:true}):null;
 const mode=s.reconstruction??'cubic',rw=Math.min(api.width,960),rh=Math.min(api.height,540);
 let buffer,ctx,recon,paper,imageData,disposed=false;
 // Keep Node evaluate/preflight allocation-free; canvas resources are needed only for drawing.
 function ensureBuffer(){
  if(buffer)return;
  buffer=new OffscreenCanvas(rw,rh);ctx=buffer.getContext('2d');
  ctx.fillStyle=s.paper??'#faf6e9';ctx.fillRect(0,0,1,1);paper=Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3);
  recon=createReconstruction(b.header.width,b.header.height,rw,rh,{seed:b.header.seed,method:mode,grain:mode==='linear'?0:.12});
  imageData=ctx.createImageData(rw,rh);
 }
 return {
  evaluate(t){if(disposed)throw Error('watercolor disposed');return decodeWatercolor(b,t.frame)},
  draw(g,t,state){
   if(disposed)throw Error('watercolor disposed');const f=state??decodeWatercolor(b,t.frame),{width,height,colors}=b.header;
   g.save();g.fillStyle=s.paper??'#faf6e9';g.fillRect(0,0,api.width,api.height);
   if(mode!=='cells'){
    ensureBuffer();imageData.data.set(recon.draw(f,colors,{density:s.density??15,paper}));ctx.putImageData(imageData,0,0);
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(buffer,0,0,api.width,api.height);
   }else{
    const cw=api.width/width,ch=api.height/height;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let j=0;j<colors.length;j++){
     const alpha=1-Math.exp(-f[j][y*width+x]*(s.density??15));if(alpha<.001)continue;
     g.fillStyle=`rgba(${colors[j].join(',')},${alpha})`;g.fillRect(x*cw,y*ch,cw+.5,ch+.5);
    }
   }
   g.restore();if(overlay)overlay.draw(g,t,overlay.evaluate(t));
  },
  dispose(){if(disposed)return;disposed=true;overlay?.dispose?.();if(buffer){buffer.width=2;buffer.height=2;}buffer=ctx=recon=imageData=null;},
  getStats(){return {cells:b.header.width*b.header.height,frames:b.header.frames,reconstruction:mode,bufferBytes:(recon?.bytes??0)+(imageData?.data.byteLength??0)}}
 };
}
