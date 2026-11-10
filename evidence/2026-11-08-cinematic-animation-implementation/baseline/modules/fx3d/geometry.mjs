import {BoxGeometry,SphereGeometry,CylinderGeometry,TorusGeometry,BufferGeometry,Float32BufferAttribute,LatheGeometry,Vector2} from 'three';
/** Pure allocation/parameter validation shared by public factory and scene preflight. */
export function validateGeometry(s){
 if(!s||!['box','sphere','cylinder','torus','lathe','leaf','buffer'].includes(s.type))throw new Error('geometry: supported type required');
 const a=s.args??[],maxArgs={box:6,sphere:7,cylinder:8,torus:5};
 if(!Array.isArray(a)||a.length>(maxArgs[s.type]??0)||a.some((x,i)=>s.type==='cylinder'&&i===5?typeof x!=='boolean':!Number.isFinite(x)||x<0||x>128))throw new Error('geometry: invalid bounded constructor args');
 const positive=(i,fallback)=>{const x=a[i]??fallback;if(!Number.isFinite(x)||x<=0)throw new Error('geometry: dimensions/angle lengths must be positive');};
 const segments=(i,fallback,min)=>{const x=a[i]??fallback;if(!Number.isInteger(x)||x<min||x>128)throw new Error('geometry: integer subdivisions required');};
 if(s.type==='box'){[0,1,2].forEach(i=>positive(i,1));[3,4,5].forEach(i=>segments(i,1,1));}
 if(s.type==='sphere'){positive(0,1);segments(1,32,3);segments(2,16,2);positive(4,Math.PI*2);positive(6,Math.PI);}
 if(s.type==='cylinder'){if((a[0]??1)===0&&(a[1]??1)===0)throw new Error('geometry: cylinder radii cannot both be zero');positive(2,1);segments(3,8,3);segments(4,1,1);positive(7,Math.PI*2);}
 if(s.type==='torus'){positive(0,1);positive(1,.4);segments(2,12,3);segments(3,48,3);positive(4,Math.PI*2);}
 return true;
}
function checkedGeometry(g){for(const key of ['position','normal','uv'])if(g.attributes[key]?.array.some(v=>!Number.isFinite(v))){g.dispose();throw new Error('geometry: generated nonfinite '+key);}return g;}
/** Leaf grid has lengthwise u / widthwise v; custom buffers preserve authored UV. */
export function createGeometry(s){
 if(!s||!['box','sphere','cylinder','torus','lathe','leaf','buffer'].includes(s.type))throw new Error('geometry: supported type required');
 validateGeometry(s);const a=s.args??[];
 if(s.type==='leaf'&&(!Number.isInteger(s.segments??32)||(s.segments??32)<4||(s.segments??32)>128||![s.length??4,s.width??1.5].every(x=>Number.isFinite(x)&&x>0&&x<=20)||!Number.isFinite(s.bend??.8)||Math.abs(s.bend??.8)>10))throw new Error('geometry: bounded leaf length/width/bend/segments required');
 if(s.type==='lathe'&&(!Array.isArray(s.points)||s.points.length<2||s.points.length>128||s.points.some(p=>!Array.isArray(p)||p.length!==2||p.some(x=>!Number.isFinite(x)||Math.abs(x)>128))||!Number.isInteger(s.segments??24)||(s.segments??24)<3||(s.segments??24)>128))throw new Error('geometry: lathe points and segments invalid');
 if(s.type==='buffer'&&(!Array.isArray(s.positions)||s.positions.length<9||s.positions.length%3||s.positions.length>150000||s.positions.some(x=>!Number.isFinite(x)||Math.abs(x)>1000)||!Array.isArray(s.uv)||s.uv.length!==s.positions.length/3*2||s.uv.some(x=>!Number.isFinite(x))||(s.indices&&(s.indices.length>300000||s.indices.length%3||s.indices.some(x=>!Number.isInteger(x)||x<0||x>=s.positions.length/3)))))throw new Error('geometry: bounded position/UV/index buffers required');
 if(s.type==='box')return checkedGeometry(new BoxGeometry(...a));
 if(s.type==='sphere')return checkedGeometry(new SphereGeometry(...a));
 if(s.type==='cylinder')return checkedGeometry(new CylinderGeometry(...a));
 if(s.type==='torus')return checkedGeometry(new TorusGeometry(...a));
 if(s.type==='lathe')return checkedGeometry(new LatheGeometry(s.points.map(p=>new Vector2(...p)),s.segments??24));
 const g=new BufferGeometry();
 if(s.type==='buffer'){g.setAttribute('position',new Float32BufferAttribute(s.positions,3));g.setAttribute('uv',new Float32BufferAttribute(s.uv,2));if(s.indices)g.setIndex(s.indices);}
 else if(s.type==='leaf'){
  const {length=4,width=1.5,bend=.8,segments=32}=s,positions=[],uv=[],indices=[];
  for(let i=0;i<=segments;i++){const u=i/segments;for(let j=0;j<=8;j++){const v=j/4-1;positions.push(v*width*Math.pow(Math.sin(Math.PI*u),.8),u*length,bend*u*u+Math.abs(v)*.18*Math.sin(Math.PI*u));uv.push(u,(v+1)/2);}}
  for(let i=0;i<segments;i++)for(let j=0;j<8;j++){const k=i*9+j;indices.push(k,k+1,k+9,k+1,k+10,k+9);}g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);
 }else throw new Error('unsupported geometry '+s.type);
 g.computeVertexNormals();g.computeBoundingSphere();return checkedGeometry(g);
}
