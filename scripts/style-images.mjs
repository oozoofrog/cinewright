import {browser} from './execution.mjs';
/** Decode local alpha assets in the same browser image decoder as the runtime.
 * No server, external requests, WebGL context or persistent browser is created.
 */
export async function validateStyleImages(images){
 if(!images.length)return;
 const client=await browser();
 try{
  const page=await client.newPage();
  await page.route('**/*',route=>route.abort());
  const result=await page.evaluate(async images=>{
   for(const {name,type,data} of images){let url;
    try{
     const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
     if(type==='image/svg+xml'){
      const doc=new DOMParser().parseFromString(new TextDecoder().decode(bytes),'image/svg+xml');
      if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg')throw Error('malformed SVG XML');
     }
     url=URL.createObjectURL(new Blob([bytes],{type}));
     const image=new Image();image.src=url;await image.decode();
     if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth>4096||image.naturalHeight>4096)throw Error('decoded dimensions must be 1..4096');
    }catch(error){return {name,error:String(error)};}finally{if(url)URL.revokeObjectURL(url);}
   }return null;
  },images);
  if(result)throw new Error(`Invalid local alpha image: ${result.name}: ${result.error}`);
 }finally{await client.close();}
}
