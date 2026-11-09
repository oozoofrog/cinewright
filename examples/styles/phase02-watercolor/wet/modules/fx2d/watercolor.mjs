// Watercolor grid model v1. Quantities are per-cell amounts, time in seconds.
const fail = m => { throw Error(`watercolor: ${m}`); };
const num = (v,min,max) => Number.isFinite(v)&&v>=min&&v<=max;
export function validateInput(c) {
 if(!c||c.version!==1||!Number.isSafeInteger(c.seed)||!Number.isInteger(c.width)||!Number.isInteger(c.height)||c.width<2||c.height<2||c.width>256||c.height>256||!Number.isInteger(c.frames)||c.frames<1||c.frames>2000||!num(c.dt,0.000001,1)||!Number.isInteger(c.stepsPerFrame)||c.stepsPerFrame<1||c.stepsPerFrame>100) fail('invalid header');
 const k=c.coefficients;if(!k||!['waterDiffusion','pigmentDiffusion','absorption','evaporation','deposition'].every(x=>num(k[x],0,100))||4*c.dt*(k.waterDiffusion+k.pigmentDiffusion)>1||c.dt*(k.absorption+k.evaporation)>1||c.dt*k.deposition>1) fail('unstable coefficients');
 if(!Array.isArray(c.colors)||!c.colors.length||c.colors.length>4||c.colors.some(a=>!Array.isArray(a)||a.length!==3||a.some(v=>!num(v,0,255)))) fail('colors');
 if(!Array.isArray(c.events)||c.events.length>1000||c.events.some(e=>!Number.isInteger(e.frame)||e.frame<0||e.frame>=c.frames||!num(e.x,0,c.width-1)||!num(e.y,0,c.height-1)||!num(e.radius,0.01,256)||!num(e.water,0,100)||!Array.isArray(e.pigment)||e.pigment.length!==c.colors.length||e.pigment.some(v=>!num(v,0,100)))) fail('events');
 const bytes=c.width*c.height*c.frames*c.colors.length*8;if(!Number.isSafeInteger(c.budgetBytes??67108864)||(c.budgetBytes??67108864)<1||bytes>(c.budgetBytes??67108864)||bytes>268435456) fail('bake budget exceeded');
 return true;
}
export function createSolver(input){
 const c=structuredClone(input);validateInput(c);const n=c.width*c.height, count=c.colors.length;
 let water=new Float64Array(n), mobile=Array.from({length:count},()=>new Float64Array(n)), deposited=Array.from({length:count},()=>new Float64Array(n));
 const totals={waterInput:0,absorbed:0,evaporated:0,pigmentInput:Array(count).fill(0)};let frame=0;
 function step(){const k=c.coefficients,dt=c.dt, dw=new Float64Array(n),dp=mobile.map(()=>new Float64Array(n));
  function pair(a,b){const f=dt*k.waterDiffusion*(water[a]-water[b]);dw[a]-=f;dw[b]+=f;for(let j=0;j<count;j++){const adv=f>=0?(water[a]>0?(f/water[a])*mobile[j][a]:0):(water[b]>0?(f/water[b])*mobile[j][b]:0);const dif=dt*k.pigmentDiffusion*(mobile[j][a]-mobile[j][b]);dp[j][a]-=adv+dif;dp[j][b]+=adv+dif;}}
  // Combined coefficient bound makes total pairwise outflow nonnegative.
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const a=y*c.width+x;if(x+1<c.width)pair(a,a+1);if(y+1<c.height)pair(a,a+c.width);}
  for(let i=0;i<n;i++){water[i]+=dw[i];for(let j=0;j<count;j++){mobile[j][i]+=dp[j][i];if(mobile[j][i]<-1e-10) fail('negative pigment: reduce diffusion coefficients');mobile[j][i]=Math.max(0,mobile[j][i]);}const absorbed=water[i]*dt*k.absorption,evaporated=water[i]*dt*k.evaporation;water[i]-=absorbed+evaporated;totals.absorbed+=absorbed;totals.evaporated+=evaporated;for(let j=0;j<count;j++){const amount=mobile[j][i]*dt*k.deposition*(1+Math.min(1,dt*k.absorption));const d=Math.min(mobile[j][i],amount);mobile[j][i]-=d;deposited[j][i]+=d;}}
 }
 function advance(){if(frame>=c.frames)fail('past end');for(const e of c.events.filter(e=>e.frame===frame)){const cells=[];for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if((x-e.x)**2+(y-e.y)**2<=e.radius**2)cells.push(y*c.width+x);if(!cells.length)fail('event covers no cells');for(const i of cells){water[i]+=e.water/cells.length;for(let j=0;j<count;j++)mobile[j][i]+=e.pigment[j]/cells.length;}totals.waterInput+=e.water;e.pigment.forEach((v,j)=>totals.pigmentInput[j]+=v);}
 for(let s=0;s<c.stepsPerFrame;s++)step();frame++;return snapshot();}
 function snapshot(){return {water:Array.from(water),mobile:mobile.map(a=>Array.from(a)),deposited:deposited.map(a=>Array.from(a)),totals:structuredClone(totals)};}
 return {advance,snapshot};
}
export function bakeWatercolor(input,{signal}={}){validateInput(input);const solver=createSolver(input),frames=[];for(let i=0;i<input.frames;i++){if(signal?.aborted)fail('cancelled');const s=solver.advance();frames.push(s.mobile.map((a,j)=>a.map((v,k)=>v+s.deposited[j][k])));}return {version:1,kind:'cinewright-watercolor-bake',solver:'grid-transport-1',header:structuredClone(input),boundary:'closed-no-flux',initial:'dry-empty',frames,totals:solver.snapshot().totals};}
export function validateBake(b){if(!b||b.version!==1||b.kind!=='cinewright-watercolor-bake'||b.solver!=='grid-transport-1')fail('unsupported bake');validateInput(b.header);const n=b.header.width*b.header.height;if(!Array.isArray(b.frames)||b.frames.length!==b.header.frames||b.frames.some(f=>!Array.isArray(f)||f.length!==b.header.colors.length||f.some(a=>!Array.isArray(a)||a.length!==n||a.some(v=>!num(v,0,1e12)))))fail('invalid frames');return true;}
export function decodeWatercolor(b,frame){if(!Number.isInteger(frame)||frame<0||frame>=b.header.frames)fail('frame out of range');return b.frames[frame];}
