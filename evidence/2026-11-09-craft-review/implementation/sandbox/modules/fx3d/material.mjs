import {MeshToonMaterial,DataTexture,RGBAFormat,NearestFilter,LinearFilter,NoColorSpace,Color,DoubleSide} from 'three';
/** Four authored nested hatch tiles; data values, not sRGB colors. */
export function createHatchAtlas({tile=64}={}) {
 if(!Number.isInteger(tile)||tile<16||tile>256)throw new Error('hatch: tile 16..256');
 const data=new Uint8Array(tile*tile*4*4);
 for(let band=0;band<4;band++)for(let y=0;y<tile;y++)for(let x=0;x<tile;x++){
  const diagonal=(x+y)%16<2, cross=(x-y+tile*2)%16<2, dense=(x+y+8)%16<2;
  const ink=(band>0&&diagonal)||(band>1&&cross)||(band>2&&dense),i=(y*tile*4+band*tile+x)*4;
  data.set([ink?255:0,ink?255:0,ink?255:0,255],i);
 }
 const texture=new DataTexture(data,tile*4,tile,RGBAFormat);texture.colorSpace=NoColorSpace;texture.minFilter=texture.magFilter=LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;return texture;
}
/** UV anchoring happens before fog/output conversion; lights and shadow maps remain Three's. */
export function createHatchMaterial({color='#c3bea3',ink='#171b23',tones=[.15,.42,.72,1],hatch=5,strength=.62,doubleSide=false}={},atlas) {
 if(!Array.isArray(tones)||tones.length<2||tones.length>8||tones.some((v,i)=>!Number.isFinite(v)||v<0||v>1||(i&&v<tones[i-1]))||!Number.isFinite(hatch)||hatch<0||hatch>32||!Number.isFinite(strength)||strength<0||strength>1)throw new Error('material: ordered 2..8 tones, hatch 0..32, strength 0..1');
 if(atlas&&(!atlas.isTexture||!atlas.image||atlas.image.width!==atlas.image.height*4))throw new Error('material: four-column hatch atlas required');
 const bytes=new Uint8Array(tones.length*4);tones.forEach((v,i)=>bytes.set([v*255,v*255,v*255,255],i*4));
 const ramp=new DataTexture(bytes,tones.length,1,RGBAFormat);ramp.minFilter=ramp.magFilter=NearestFilter;ramp.needsUpdate=true;
 const ownAtlas=!atlas;atlas??=createHatchAtlas();
 const material=new MeshToonMaterial({color,gradientMap:ramp,...(doubleSide?{side:DoubleSide}:{})});
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{cwAtlas:{value:atlas},cwFrequency:{value:hatch},cwInset:{value:.5/atlas.image.height},cwStrength:{value:strength},cwInk:{value:new Color(ink)}});
  shader.vertexShader='varying vec2 cwUV;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\ncwUV = uv;');
  shader.fragmentShader='varying vec2 cwUV;\nuniform sampler2D cwAtlas;\nuniform float cwFrequency;\nuniform float cwStrength;\nuniform float cwInset;\nuniform vec3 cwInk;\n'+shader.fragmentShader.replace('#include <opaque_fragment>',`
   float cwLuma = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722));
   float density = clamp((1.0 - cwLuma) * 3.0, 0.0, 3.0);
   vec2 tileUV = fract(cwUV * cwFrequency);
   vec2 insetUV = mix(vec2(cwInset), vec2(1.0-cwInset), tileUV);
   float lo = floor(density); float hi = min(lo + 1.0, 3.0);
   float a = texture2D(cwAtlas, vec2((insetUV.x + lo) / 4.0, insetUV.y)).r;
   float b = texture2D(cwAtlas, vec2((insetUV.x + hi) / 4.0, insetUV.y)).r;
   float footprint = max(length(dFdx(cwUV * cwFrequency)), length(dFdy(cwUV * cwFrequency)));
   float inkCoverage = mix(a, b, fract(density)) * (1.0 - smoothstep(0.12, 0.38, footprint));
   outgoingLight = mix(outgoingLight, cwInk, inkCoverage * cwStrength * step(0.001, cwFrequency));
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=> 'cw-uv-hatch-r180-v1';
 return {material,dispose(){material.dispose();ramp.dispose();if(ownAtlas)atlas.dispose();}};
}
