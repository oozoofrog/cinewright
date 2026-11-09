// Original procedural models and authored scenes; deterministic regeneration, Three r180.
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createHatchAtlas} from '../../../modules/fx3d/material.mjs';
import {BoxGeometry,SphereGeometry,CylinderGeometry,LatheGeometry,Vector2} from 'three';
const here=new URL('./',import.meta.url), recipes=new URL('../../../recipes/styles/expressionist-space/',import.meta.url);
await fs.mkdir(new URL('assets/',here),{recursive:true});await fs.mkdir(recipes,{recursive:true});
function glb(parts,animation){
 const chunks=[],views=[],accessors=[],meshes=[],nodes=[];let size=0;
 const put=(array,type,count,min,max)=>{const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength);const view=views.length;views.push({buffer:0,byteOffset:size,byteLength:bytes.length});chunks.push(bytes);size+=bytes.length;const pad=(4-size%4)%4;if(pad){chunks.push(Buffer.alloc(pad));size+=pad;}const idx=accessors.length;accessors.push({bufferView:view,componentType:5126,count,type,...(min?{min,max}:{})});return idx;};
 for(const part of parts){let g=part.geometry.toNonIndexed();const pos=g.attributes.position,normal=g.attributes.normal,uv=g.attributes.uv;g.computeBoundingBox();const mesh=meshes.length;meshes.push({primitives:[{attributes:{POSITION:put(pos.array,'VEC3',pos.count,g.boundingBox.min.toArray(),g.boundingBox.max.toArray()),NORMAL:put(normal.array,'VEC3',normal.count),TEXCOORD_0:put(uv.array,'VEC2',uv.count)}}]});nodes.push({name:part.name,mesh,translation:part.position??[0,0,0],...(part.scale?{scale:part.scale}:{})});g.dispose();part.geometry.dispose();}
 const times=put(new Float32Array(animation.times),'SCALAR',animation.times.length,[0],[animation.times.at(-1)]),values=put(new Float32Array(animation.values),animation.path==='rotation'?'VEC4':'VEC3',animation.times.length);
 const json={asset:{version:'2.0',generator:'Cinewright original asset author.mjs / three 0.180.0'},scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],nodes,meshes,buffers:[{byteLength:size}],bufferViews:views,accessors,animations:[{name:animation.name,samplers:[{input:times,output:values,interpolation:'LINEAR'}],channels:[{sampler:0,target:{node:animation.node,path:animation.path}}]}]};
 let j=Buffer.from(JSON.stringify(json));j=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]);const bin=Buffer.concat(chunks),header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+j.length+8+bin.length,8);jh.writeUInt32LE(j.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,jh,j,bh,bin]);
}
const traveler=glb([
 {name:'coat',geometry:new LatheGeometry([[.24,0],[.31,.12],[.29,.8],[.21,1.2],[.1,1.28]].map(p=>new Vector2(...p)),12),position:[0,.45,0]},
 {name:'face',geometry:new SphereGeometry(.19,12,8),position:[0,1.98,0],scale:[.78,1.2,.85]},
 {name:'hatBrim',geometry:new CylinderGeometry(.3,.3,.055,16),position:[0,2.12,0]},
 {name:'hatCrown',geometry:new CylinderGeometry(.18,.22,.22,12),position:[0,2.23,0]},
 {name:'leftBoot',geometry:new BoxGeometry(.15,.5,.27),position:[-.16,.25,.04]},
 {name:'rightBoot',geometry:new BoxGeometry(.15,.5,.27),position:[.16,.25,-.02]},
 {name:'leftSleeve',geometry:new CylinderGeometry(.08,.095,.82,8),position:[-.32,1.17,0]},
 {name:'rightSleeve',geometry:new CylinderGeometry(.08,.095,.82,8),position:[.32,1.17,0]},
 {name:'case',geometry:new BoxGeometry(.48,.32,.17),position:[.4,.6,.03]},
 {name:'collar',geometry:new CylinderGeometry(.15,.23,.16,8),position:[0,1.72,0]}
],{name:'case-sway',node:8,path:'rotation',times:[0,.5,1,1.5,2],values:[0,0,0,1,0,0,.08,.9968,0,0,0,1,0,0,-.08,.9968,0,0,0,1]});
const specimen=glb([
 {name:'vessel',geometry:new LatheGeometry([[.25,0],[.46,.12],[.55,.7],[.28,1.1],[.18,1.2],[.18,1.55],[.25,1.6]].map(p=>new Vector2(...p)),24)},
 {name:'stopper',geometry:new CylinderGeometry(.22,.17,.18,16),position:[0,1.66,0]},
 {name:'suspendedSeed',geometry:new SphereGeometry(.22,16,10),position:[0,2.12,0],scale:[1,1.5,1]}
],{name:'seed-rise',node:2,path:'translation',times:[0,2,4],values:[0,2.12,0,0,2.35,0,0,2.12,0]});
await fs.writeFile(new URL('assets/traveler.glb',here),traveler);await fs.writeFile(new URL('assets/specimen.glb',here),specimen);
const palette={stone:{color:'#a0b6b0',hatch:5,strength:.58},chalk:{color:'#e8d8ab',hatch:3,strength:.38},dark:{color:'#26313c',hatch:3,strength:.5},brass:{color:'#bca277',hatch:4,strength:.5},leaf:{color:'#9db9a0',hatch:4,strength:.65,doubleSide:true},paper:{color:'#f0dba5',hatch:2,strength:.22}};
const base={version:1,style:'expressionist-space',title:'',size:[1920,1080],fps:24,frames:192,seed:17,background:'#182630',coordinateSystem:'right-handed +Y up, camera looks at target; world units metres; angles radians',materials:palette};
const box=(id,position,size,material='stone',extra={})=>({id,geometry:{type:'box',args:size},material,position,...extra});
const cylinder=(id,position,args,material='brass',extra={})=>({id,geometry:{type:'cylinder',args},material,position,...extra});
const station={...structuredClone(base),title:'The shadow keeps the last train',camera:{type:'perspective',position:[8,5.4,13],target:[0,1,-5],fov:42,keys:[{frame:0,position:[8,5.4,13],target:[0,1,-5]},{frame:191,position:[7.1,4.9,11.5],target:[0,1,-5.5]}]},fog:{color:'#263a43',near:16,far:45},lights:[{type:'ambient',color:'#c5d6db',intensity:.6},{type:'directional',color:'#ffe0a6',intensity:2.1,position:[-4,9,-12],target:[1,0,0],shadow:true},{type:'spot',color:'#e8c28b',intensity:8,position:[-4,7,-8],target:[1,0,-1],angle:.75,gobo:true}],dust:{count:85,bounds:[7,5,20],speed:.12},objects:[]};
const so=station.objects;
so.push(box('platform',[0,-.3,-5],[7,.6,29]),box('track-bed',[5,-.7,-5],[3,.3,30],'dark'),box('rail-a',[4.4,-.4,-5],[.08,.12,30],'brass'),box('rail-b',[5.6,-.4,-5],[.08,.12,30],'brass'),box('left-wall',[-3.8,3.3,-5],[.45,6.6,29],'stone',{deform:{amplitude:.035,frequency:.5},outline:{width:.025}}),box('far-wall',[0,3.5,-19],[8,7,.5],'dark'));
for(let i=0;i<10;i++){const z=7-i*2.6;so.push(box('edge-'+i,[3.2,.02,z],[.32,.04,1.7],'chalk'),box('floor-seam-'+i,[0,.01,z],[6.3,.025,.025],'dark'));}
for(let i=0;i<6;i++){const z=5-i*4;so.push(box('pier-'+i,[-3.3,2.7,z],[.42,5.4,.52],'dark',{rotation:[0,0,-.04]}),box('beam-'+i,[.1,5.45,z],[7.5,.3,.4],'dark',{rotation:[0,0,-.035]}),box('lamp-'+i,[.2,5.15,z],[1.15,.08,.3],'paper'));}
so.push(box('threshold-left',[-1.4,1.9,-14],[.34,3.8,.4],'chalk',{rotation:[0,0,-.08],outline:{width:.035}}),box('threshold-right',[1.5,1.9,-14],[.34,3.8,.4],'chalk',{rotation:[0,0,.08],outline:{width:.035}}),box('threshold-top',[0,3.9,-14],[3.5,.3,.4],'chalk'),box('threshold-step',[0,.15,-13.8],[3,.3,1],'brass'),box('door-light',[0,1.9,-14.4],[2.7,3.8,.1],'paper'));
so.push(box('bench-seat',[-2,.65,-1],[1.3,.18,3.5],'brass',{outline:{width:.025}}),box('bench-back',[-2.55,1.1,-1],[.12,.85,3.5],'stone'),box('bench-foot-a',[-2,.3,-2.2],[1,.6,.15],'dark'),box('bench-foot-b',[-2,.3,.2],[1,.6,.15],'dark'));
so.push({id:'early-shadow',shadow:{points:[[-.28,0],[.28,0],[.72,9],[-.72,9]],color:'#111923',opacity:.86},position:[.3,.025,-14],rotation:[Math.PI/2,0,.1],keys:[{frame:0,scale:[1,.015,1]},{frame:24,scale:[1,.1,1]},{frame:72,scale:[1,1.1,1]},{frame:128,scale:[1,1.3,1]},{frame:191,scale:[.7,.8,1]}]});
so.push({id:'traveler',asset:'assets/traveler.glb',material:'dark',outline:{width:.018},position:[0,0,-14],time:'exposed',exposure:{every:2},visible:[88,192],clip:{name:'case-sway',loop:true,weight:1,timeScale:1,exposure:{every:2}},keys:[{frame:0,position:[0,0,-14]},{frame:88,position:[0,0,-14]},{frame:156,position:[.5,0,-6]},{frame:191,position:[.5,0,-6]}]});
so.push(box('train-body',[5.3,1.25,-35],[2.4,3.2,18],'stone',{visible:[112,192],outline:{width:.028},keys:[{frame:0,position:[5.3,1.25,-35]},{frame:112,position:[5.3,1.25,-30]},{frame:176,position:[5.3,1.25,-7]},{frame:191,position:[5.3,1.25,-7]}]}));
for(let i=0;i<7;i++)so.push(box('train-window-'+i,[4.07,1.85,-35+i*2.3],[.04,.9,1.5],'paper',{visible:[112,192],keys:[{frame:0,position:[4.07,1.85,-42+i*2.3]},{frame:112,position:[4.07,1.85,-37+i*2.3]},{frame:176,position:[4.07,1.85,-14+i*2.3]},{frame:191,position:[4.07,1.85,-14+i*2.3]}]}));
// Visible cab face and camera-side windows identify the arriving train from this shot.
const trainDetail=(id,offset,size,material='dark')=>box(id,[5.3+offset[0],1.25+offset[1],-35+offset[2]],size,material,{visible:[112,192],keys:[{frame:0,position:[5.3+offset[0],1.25+offset[1],-35+offset[2]]},{frame:112,position:[5.3+offset[0],1.25+offset[1],-30+offset[2]]},{frame:176,position:[5.3+offset[0],1.25+offset[1],-7+offset[2]]},{frame:191,position:[5.3+offset[0],1.25+offset[1],-7+offset[2]]}]});
so.push(trainDetail('cab-window-left',[-.57,.65,9.02],[.8,.9,.04]),trainDetail('cab-window-right',[.57,.65,9.02],[.8,.9,.04]),trainDetail('cab-belt',[0,-.25,9.03],[2.3,.15,.06],'brass'),trainDetail('cab-light-left',[-.8,-.7,9.04],[.23,.25,.08],'paper'),trainDetail('cab-light-right',[.8,-.7,9.04],[.23,.25,.08],'paper'),trainDetail('cab-bumper',[0,-1.35,9.05],[2,.22,.22],'dark'));
for(let i=0;i<7;i++)so.push(trainDetail('camera-train-window-'+i,[1.22,.6,-7+i*2.3],[.04,.9,1.5],'dark'));
const lab={...structuredClone(base),title:'A light in the giant-leaf laboratory',background:'#23313b',camera:{type:'orthographic',height:10.3,position:[9,6.5,13],target:[0,2.4,0],exposure:{every:1},keys:[{frame:0,position:[9,6.5,13],target:[0,2.4,0]},{frame:191,position:[8,6,13.5],target:[0,2.5,0]}]},fog:{color:'#344752',near:18,far:42},lights:[{type:'ambient',color:'#c0d8cf',intensity:.55},{type:'directional',color:'#ffe5b2',intensity:2,position:[-6,8,4],target:[0,2,0],shadow:true,keys:[{frame:0,position:[-6,8,4]},{frame:96,position:[5,6,1]},{frame:191,position:[-2,8,-4]}]},{type:'spot',color:'#e4c392',intensity:5,position:[-4,7,3],target:[0,1,-2],angle:.65,gobo:true}],dust:{count:120,bounds:[10,5,8],speed:.1},objects:[]};
const lo=lab.objects;
lo.push(box('floor',[0,-.25,0],[17,.5,12],'stone'),box('back-wall',[0,3.4,-5.2],[17,7,.2],'stone'),box('left-wall',[-7.6,3.4,0],[.2,7,10],'dark'));
for(let i=0;i<7;i++)lo.push(box('window-upright-'+i,[-6+i*2,3.8,-5],[.09,5.8,.1],'dark'));
for(let i=0;i<3;i++)lo.push(box('window-cross-'+i,[0,2+i*1.8,-5],[15,.09,.1],'dark'));
lo.push(box('bench-top',[0,1.3,0],[8,.22,3],'brass',{outline:{width:.025}}));for(let x of [-3.5,3.5])for(let z of [-1,1])lo.push(box('bench-leg-'+x+'-'+z,[x,.6,z],[.17,1.3,.17],'dark'));
lo.push({id:'main-pot',geometry:{type:'lathe',points:[[.6,0],[.8,.1],[1.05,1.1],[1.1,1.2],[.95,1.27]],segments:32},material:'brass',position:[-.5,1.42,0],outline:{width:.025}});
for(let i=0;i<5;i++){
 const angle=-1.15+i*.58,L=[3.8,4.4,4.7,4,3.2][i],width=[.85,1,1.25,1,.8][i];
 const lines=[{points:Array.from({length:25},(_,j)=>{const u=j/24;return [0,u*L,.9*u*u+.025];}),color:'#32483d'}];
 for(let j=1;j<7;j++){const u=j/8;for(const sign of [-1,1])lines.push({points:[[0,u*L,.9*u*u+.025],[sign*width*.5*Math.sin(Math.PI*(u+.05)),(u+.05)*L,.9*(u+.05)**2+.1],[sign*width*.9*Math.sin(Math.PI*(u+.1)),(u+.1)*L,.9*(u+.1)**2+.17]],color:'#43574a'});}
 lo.push({id:'leaf-'+i,geometry:{type:'leaf',length:L,width,bend:.9,segments:40},material:'leaf',position:[-.5,2.45,0],rotation:[-.25,.4+angle*.2,angle*.95],lines,keys:[{frame:0,rotation:[-.25,.4+angle*.2,angle*.95]},{frame:96,rotation:[-.1,.65+angle*.2,angle*.95-.08]},{frame:191,rotation:[-.22,.85+angle*.2,angle*.95-.03]}]});
}
lo.push({id:'curling-shoot',geometry:{type:'leaf',length:2.4,width:.45,bend:1.2},material:'leaf',position:[-.5,2.4,.2],rotation:[.2,.8,-.4],deform:{amplitude:.08,frequency:1.7,phase:1}});
lo.push({id:'specimen',asset:'assets/specimen.glb',material:'chalk',position:[2.7,1.42,.5],scale:[.7,.7,.7],outline:{width:.02},clip:{name:'seed-rise',loop:true,timeScale:1,weight:1,exposure:{every:3}}});
lo.push(box('notebook',[-2.8,1.47,1],[1,.08,.65],'paper',{rotation:[0,.25,0]}),cylinder('stool',[4.8,.85,1],[.65,.65,.16,24],'brass'),cylinder('stool-stem',[4.8,.4,1],[.09,.15,.8,12],'dark'));
for(let i=0;i<3;i++)lo.push(cylinder('bottle-'+i,[-3+i*.5,1.8,-.5],[.12,.19,.75,16],'chalk',{outline:{width:.018}}));
const portrait=structuredClone(lab);portrait.title='Giant leaf / portrait';portrait.size=[1080,1920];portrait.camera={type:'perspective',position:[5,5,11],target:[-.4,3.3,0],fov:45};portrait.dust.count=45;
for(const [name,s]of [['station',station],['laboratory',lab],['portrait',portrait]])await fs.writeFile(new URL(name+'.json',recipes),JSON.stringify(s,null,2)+'\n');
const metadata={version:1,author:'Cinewright / original procedural authorship for this implementation',license:'CC0-1.0',source:'author.mjs; no third-party model, texture, animation or film image',tools:{node:process.version,three:'0.180.0'},units:'metres',axis:'+Y up; right-handed',pivot:'each mesh local origin, grouped actor origin at floor contact',colorSpace:'GLB has no textures; hatch atlas is generated linear data; material colors authored sRGB',alpha:'GLB opaque; adapter transparent premultiplied canvas',rig:'Rigid named node hierarchy, no skinning; no retargeting',rest:'traveler upright at y=0, coat/case/hat; vessel bottom at y=0',uv:'Three parametric UV; seams are intentional and may remain visible',assets:[['traveler.glb',traveler,'case-sway',2,'case z rotation, actor translation separately authored'],['specimen.glb',specimen,'seed-rise',4,'suspended seed y translation; vessel static']].map(([file,b,clip,duration,motion])=>({file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,scale:1,clip:{name:clip,duration,authoringFps:24,loop:true,contact:'vessel/boots remain on authored ground; no IK',motion}}))};
const atlas=createHatchAtlas();metadata.proceduralMaterials={hatchAtlas:{source:'modules/fx3d/material.mjs createHatchAtlas',width:atlas.image.width,height:atlas.image.height,sha256:createHash('sha256').update(atlas.image.data).digest('hex'),license:'CC0-1.0',anchor:'object UV, 4 nested density tiles',colorSpace:'linear data',alpha:'opaque data texture; not an image layer'},gobo:{source:'modules/fx3d/light.mjs createLightRig',width:64,height:64,license:'CC0-1.0',anchor:'spot-light projection'}};atlas.dispose();
await fs.writeFile(new URL('assets/metadata.json',here),JSON.stringify(metadata,null,2)+'\n');await fs.writeFile(new URL('assets/LICENSE',here),'Original assets and authored scene data dedicated to the public domain under CC0 1.0 Universal.\nhttps://creativecommons.org/publicdomain/zero/1.0/\nNo third-party models or motion copied. Three.js code retains its separate MIT license.\n');
console.log('Authored station, laboratory, portrait, and two embedded GLBs');
