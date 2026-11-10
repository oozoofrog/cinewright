/** SVG/commands are local 2D coordinates. Holes use explicit evenodd/nonzero winding. */
const arity={M:2,L:2,H:1,V:1,C:6,S:4,Q:4,T:2,A:7,Z:0};
export function validateShape(shape){
 if(!shape||!['evenodd','nonzero'].includes(shape.fillRule??'evenodd'))throw new Error('shape: fillRule must be evenodd or nonzero');const input=shape.path??shape.commands;
 if(typeof input==='string'){
  if(!input.trim()||input.length>100000)throw new Error('shape: empty or excessive SVG path');
  const pattern=/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g;
  if(input.replace(pattern,'').replace(/[\s,]/g,''))throw new Error('shape: invalid SVG token');const tokens=input.match(pattern)??[];if(!/^[Mm]$/.test(tokens[0]))throw new Error('shape: SVG must begin with moveto');
  for(let i=0;i<tokens.length;){const op=tokens[i++].toUpperCase();if(!(op in arity))throw new Error('shape: SVG command required');const values=[];while(i<tokens.length&&!/^[a-zA-Z]$/.test(tokens[i]))values.push(Number(tokens[i++]));const n=arity[op];if((n===0?values.length!==0:values.length===0||values.length%n)||values.some(v=>!Number.isFinite(v)||Math.abs(v)>1e6))throw new Error('shape: invalid SVG command arity/range');if(op==='A')for(let j=0;j<values.length;j+=7)if(values[j]<0||values[j+1]<0||![0,1].includes(values[j+3])||![0,1].includes(values[j+4]))throw new Error('shape: invalid arc radii/flags');}
 }else{
  if(!Array.isArray(input)||!input.length||input.length>20000||input[0]?.[0]!=='M')throw new Error('shape: commands must begin with M');for(const command of input){if(!Array.isArray(command))throw new Error('shape: command array required');const [op,...v]=command;if(!['M','L','C','Q','Z'].includes(op)||v.length!==arity[op]||!v.every(Number.isFinite))throw new Error('shape: invalid path command');}
 }return true;
}
export function makePath(shape){validateShape(shape);const input=shape.path??shape.commands;if(typeof input==='string')return new Path2D(input);const p=new Path2D(),fn={M:'moveTo',L:'lineTo',C:'bezierCurveTo',Q:'quadraticCurveTo',Z:'closePath'};for(const [op,...v]of input)p[fn[op]](...v);return p;}
export function drawShape(g,shape,path=makePath(shape)){g.save();g.fillStyle=shape.fill??'#12131b';g.fill(path,shape.fillRule??'evenodd');g.restore();}
export function composeMask(g,drawMask,{mode='reveal',opacity=1}={}){if(!['reveal','erase'].includes(mode)||!Number.isFinite(opacity)||opacity<0||opacity>1)throw new Error('mask: invalid mode/opacity');g.save();g.globalAlpha=opacity;g.globalCompositeOperation=mode==='erase'?'destination-out':'destination-in';drawMask(g);g.restore();}
