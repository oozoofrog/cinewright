import fs from 'node:fs/promises';
import {materializeKit} from '../../../scripts/materialize-kit.mjs';
const base=new URL('./',import.meta.url); const project=new URL('initial/',base);
const config={size:[640,480],fps:24,frames:120,hinge:[294,259],mount:[310,296],headPivot:[365,244],wing:[[0,0],[-106,32],[-77,76],[-26,7]],body:[[220,257],[279,226],[349,231],[381,257],[342,296],[310,304],[265,284]],head:[[0,0],[0,-38],[35,-53],[62,-28],[30,3]],beak:[[61,-29],[93,-18],[60,-12]],tracks:{wing:[{frame:0,value:0},{frame:18,value:0},{frame:44,value:60,interpolation:'hold'},{frame:62,value:60},{frame:88,value:0},{frame:119,value:0}],head:[{frame:0,value:0},{frame:48,value:0},{frame:58,value:8},{frame:70,value:0},{frame:119,value:0}]},corrections:[]};
await fs.writeFile(new URL('source.json',project),JSON.stringify(config,null,2)+'\n');
await fs.writeFile(new URL('work.json',project),JSON.stringify({version:1,title:'Paper greeting',size:config.size,fps:24,frames:120,points:{start:0,departure:18,open:44,response:58,close:62,settled:88,last:119},spans:{whole:[0,120]},layers:[{id:'bird',module:'scene.mjs',config:{source:'source.json'}}]},null,2)+'\n');
await fs.rm(new URL('motion.mjs',project));
console.log(JSON.stringify(await materializeKit({project:project.pathname,modules:['pose-tracks']}),null,2));
