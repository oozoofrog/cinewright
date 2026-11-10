import fs from 'node:fs/promises';
import {materializeKit} from '../../../scripts/materialize-kit.mjs';
const base=new URL('./',import.meta.url),initial=new URL('initial/',base),revision=new URL('broader/',base);
await fs.mkdir(revision);
for(const file of ['source.json','scene.mjs','work.json']) await fs.copyFile(new URL(file,initial),new URL(file,revision));
const c=JSON.parse(await fs.readFile(new URL('source.json',revision)));c.corrections=[{center:1,radius:1,delta:{wing:40}}];await fs.writeFile(new URL('source.json',revision),JSON.stringify(c,null,2)+'\n');
console.log(JSON.stringify(await materializeKit({project:revision.pathname,modules:['pose-tracks']}),null,2));
