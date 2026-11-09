import fs from 'node:fs/promises';
const s=JSON.parse(await fs.readFile(new URL('../../../recipes/styles/expressionist-space/laboratory.json',import.meta.url),'utf8'));
s.title='UV hatch / rigid outline / rest deformation / local clip specimen';s.camera={type:'orthographic',height:7,position:[7,4,12],target:[0,1.2,0]};s.objects=[
{id:'curved',geometry:{type:'sphere',args:[1.2,32,24]},material:'chalk',position:[-3,1.3,0],outline:{width:.035},keys:[{frame:0,rotation:[0,0,0]},{frame:191,rotation:[0,2.2,0]}]},
{id:'flat',geometry:{type:'box',args:[1.8,2.3,1.2]},material:'stone',position:[0,1.3,0],outline:{width:.025},lines:[{points:[[-.7,-.7,.61],[.7,.7,.61]],color:'#152331'}],keys:[{frame:0,rotation:[0,-.5,0]},{frame:191,rotation:[0,.8,0]}]},
{id:'organic',geometry:{type:'leaf',length:2.8,width:.7,bend:1},material:'leaf',position:[2,0,0],deform:{amplitude:.16,frequency:1.2}},
{id:'clip',asset:'assets/specimen.glb',material:'brass',position:[4.1,0,0],clip:{name:'seed-rise',timeScale:-1,weight:.7,exposure:{every:2}}}
];s.dust={count:64,bounds:[10,4,4],life:8};await fs.writeFile(new URL('../../../recipes/styles/expressionist-space/effects.json',import.meta.url),JSON.stringify(s,null,2)+'\n');
