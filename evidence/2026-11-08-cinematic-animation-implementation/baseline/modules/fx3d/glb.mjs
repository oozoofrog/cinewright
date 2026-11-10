/** Validate before GLTFLoader can request dependent files or decoders. */
export function inspectGLB(buffer){
 const v=new DataView(buffer);if(v.byteLength<20||v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==v.byteLength||v.getUint32(16,true)!==0x4e4f534a)throw new Error('GLB: invalid binary glTF 2 header');
 if(v.byteLength>16*1024*1024)throw new Error('GLB: file budget exceeded (16 MiB)');
 const n=v.getUint32(12,true);if(n>v.byteLength-20)throw new Error('GLB: truncated JSON');
 const json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,n)));
 if(json.extensionsRequired?.length)throw new Error('GLB: required extensions unsupported: '+json.extensionsRequired.join(','));
 if(JSON.stringify(json).match(/KHR_draco_mesh_compression|EXT_meshopt_compression|KHR_texture_basisu/))throw new Error('GLB: compression unsupported');
 for(const item of [...(json.buffers??[]),...(json.images??[])])if(item.uri)throw new Error('GLB: dependent URI unsupported; embed buffers/textures');
 let offset=12,binaryBytes=0;while(offset<v.byteLength){if(offset+8>v.byteLength)throw new Error('GLB: truncated chunk header');const length=v.getUint32(offset,true),type=v.getUint32(offset+4,true);if(length%4||offset+8+length>v.byteLength)throw new Error('GLB: invalid chunk length');if(type===0x004e4942)binaryBytes+=length;offset+=8+length;}
 for(const buffer of json.buffers??[])if(!Number.isSafeInteger(buffer.byteLength)||buffer.byteLength<0||buffer.byteLength>binaryBytes)throw new Error('GLB: embedded buffer exceeds binary chunk');
 for(const view of json.bufferViews??[]){const length=json.buffers?.[view.buffer??0]?.byteLength;if(!Number.isInteger(view.byteLength)||view.byteLength<0||!Number.isInteger(view.byteOffset??0)||(view.byteOffset??0)<0||length===undefined||(view.byteOffset??0)+view.byteLength>length)throw new Error('GLB: bufferView outside embedded buffer');}
 return json;
}
export async function loadLocalGLB(api,asset){
 if(typeof asset!=='string'||!/^assets\/[\w./-]+\.glb$/.test(asset)||asset.split('/').includes('..'))throw new Error('GLB: local assets/*.glb required');
 const response=await fetch(api.path(asset));if(!response.ok)throw new Error('GLB fetch failed '+response.status);const bytes=await response.arrayBuffer();inspectGLB(bytes);
 const {GLTFLoader}=await import('../../vendor/three/addons/loaders/GLTFLoader.js');
 return new GLTFLoader().parseAsync(bytes,'');
}
