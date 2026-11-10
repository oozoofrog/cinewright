import {AmbientLight,DirectionalLight,SpotLight,DataTexture,RGBAFormat,LinearFilter,BufferGeometry,Float32BufferAttribute,MeshBasicMaterial,Mesh,DoubleSide,Fog,Color} from 'three';
export function createLightRig(scene,specs=[]){
 if(!scene?.isScene||!Array.isArray(specs)||specs.length>8)throw new Error('light rig: Scene and max eight lights required');
 for(const s of specs){if(!['ambient','spot','directional'].includes(s.type)||!Number.isFinite(s.intensity)||s.intensity<0||s.intensity>100||!/^#[0-9a-f]{6}$/i.test(s.color)||[s.position??[0,5,0],s.target??[0,0,0]].some(p=>!Array.isArray(p)||p.length!==3||p.some(x=>!Number.isFinite(x)))||(s.gobo&&s.type!=='spot')||(s.shadowSize&&![256,512,1024,2048].includes(s.shadowSize)))throw new Error('light rig: type/color/intensity/position/target/gobo/shadow invalid');for(const [value,min,max]of [[s.angle??.65,.01,1.55],[s.distance??60,0,1000],[s.penumbra??.15,0,1],[s.decay??0,0,4]])if(!Number.isFinite(value)||value<min||value>max)throw new Error('light rig: bounded angle/distance/penumbra/decay required');}
 const lights=[],textures=[];
 for(const s of specs){
  const l=s.type==='ambient'?new AmbientLight(s.color,s.intensity):s.type==='spot'?new SpotLight(s.color,s.intensity,s.distance??60,s.angle??.65,s.penumbra??.15, s.decay??0):new DirectionalLight(s.color,s.intensity);
  l.position.fromArray(s.position??[0,5,0]);
  if(l.target){l.target.position.fromArray(s.target??[0,0,0]);scene.add(l.target);l.castShadow=s.shadow??false;l.shadow.mapSize.set(s.shadowSize??1024,s.shadowSize??1024);l.shadow.bias=-.0005;l.shadow.normalBias=.025;if(l.isDirectionalLight)Object.assign(l.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.1,far:70});}
  if(s.gobo){if(!l.isSpotLight)throw new Error('gobo requires spot light');const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const v=x%16<5||y%32<3?20:255;data.set([v,v,v,255],(y*size+x)*4);}const texture=new DataTexture(data,size,size,RGBAFormat);texture.minFilter=texture.magFilter=LinearFilter;texture.needsUpdate=true;l.map=texture;textures.push(texture);}
  scene.add(l);lights.push(l);
 }
 return {lights,dispose(){for(const l of lights){scene.remove(l);if(l.target)scene.remove(l.target);l.dispose?.();}for(const t of textures)t.dispose();}};
}
/** Authored graphic shadow on local XY, not a lighting prediction or physical decal projector. */
export function createShadowOverlay({points,color='#101722',opacity=.8}={}){
 if(!Array.isArray(points)||points.length<3||points.length>128||points.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)))||!Number.isFinite(opacity)||opacity<0||opacity>1)throw new Error('shadow overlay: convex 3..128 vec2 polygon / opacity 0..1');
 let winding=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],c=points[(i+2)%points.length],cross=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.abs(cross)>1e-9){if(winding&&Math.sign(cross)!==winding)throw new Error('shadow overlay requires convex polygon');winding=Math.sign(cross);}}if(!winding)throw new Error('shadow overlay requires nonzero area');
 const vertices=[];for(let i=1;i<points.length-1;i++)vertices.push(...points[0],0,...points[i],0,...points[i+1],0);
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();const material=new MeshBasicMaterial({color,opacity,transparent:true,side:DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});const object=new Mesh(geometry,material);object.renderOrder=2;
 return {object,dispose(){geometry.dispose();material.dispose();}};
}
export function setDepthFog(scene,{color='#29343a',near=8,far=35}={}){if(!Number.isFinite(near)||!Number.isFinite(far)||near<0||far<=near)throw new Error('fog: 0 <= near < far');scene.fog=new Fog(new Color(color),near,far);return scene.fog;}
