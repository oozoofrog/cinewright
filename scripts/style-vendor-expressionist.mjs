import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
/** Read-only exact r180 addon closure. Project paths -> Buffer; never writes node_modules/vendor. */
export async function collectExpressionistVendor(){
 const root=path.dirname(path.dirname(require.resolve('three'))),pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
 if(pkg.version!=='0.180.0')throw new Error('expressionist vendor requires three 0.180.0');
 const files={},allowed=new Set(['loaders/GLTFLoader.js','utils/BufferGeometryUtils.js']);
 async function visit(name){const dest='vendor/three/addons/'+name;if(files[dest])return;if(!allowed.has(name))throw new Error('Unapproved Three addon dependency: '+name);const bytes=await fs.readFile(path.join(root,'examples/jsm',name));files[dest]=bytes;
  for(const match of bytes.toString().replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/(?:^|\n)\s*import\s+(?:[\w*{},\s]+?\s+from\s*)?['"]([^'"]+)['"]/g)){const spec=match[1];if(spec==='three')continue;if(!spec.startsWith('.'))throw new Error('Unpackaged addon dependency '+spec);await visit(path.posix.normalize(path.posix.join(path.posix.dirname(name),spec)));}
 }
 await visit('loaders/GLTFLoader.js');
 files['vendor/three/LICENSE']=await fs.readFile(path.join(root,'LICENSE'));
 files['vendor/three/package.json']=Buffer.from(JSON.stringify({name:'three',version:pkg.version,type:'module',license:'MIT'}));return files;
}
