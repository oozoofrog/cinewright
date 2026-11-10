import {WebGLRenderer,SRGBColorSpace,NoToneMapping} from 'three';
/** Transparent premultiplied WebGL canvas -> Canvas2D; owns renderer only. */
export function createCanvasAdapter({width,height,pixelWidth=width,pixelHeight=height,canvas}={}){
 for(const n of [width,height,pixelWidth,pixelHeight])if(!Number.isInteger(n)||n<16||n>4096)throw new Error('adapter: dimensions must be integers 16..4096');
 canvas??=globalThis.document?.createElement('canvas');if(!canvas)throw new Error('adapter: browser canvas required');
 const context=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:true,preserveDrawingBuffer:true});if(!context)throw new Error('expressionist-space requires WebGL2; no 2D fallback');
 let renderer;try{renderer=new WebGLRenderer({canvas,context,alpha:true,premultipliedAlpha:true,antialias:true});renderer.setSize(pixelWidth,pixelHeight,false);renderer.setClearColor(0,0);renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=NoToneMapping;renderer.shadowMap.enabled=true;renderer.debug.onShaderError=(gl,program,vs,fs)=>{throw new Error("expressionist shader: "+[gl.getProgramInfoLog(program),gl.getShaderInfoLog(vs),gl.getShaderInfoLog(fs)].join("\n"));};}catch(e){context.getExtension('WEBGL_lose_context')?.loseContext();throw e;}
 let disposed=false;
 return {renderer,draw(g,scene,camera){if(disposed)throw new Error('adapter disposed');renderer.render(scene,camera);g.drawImage(canvas,0,0,width,height);},getStats(){return {disposed,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};},dispose(){if(disposed)return;disposed=true;renderer.dispose();renderer.forceContextLoss();canvas.width=canvas.height=1;}};
}
