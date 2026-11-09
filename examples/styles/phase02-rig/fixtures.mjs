/** Original CC0 voxel-union static surfaces; no bones, labels or rigging metadata. */
export function staticBiped({height=4,shoulder=.58,arm=2.25,leg=.4,depth=.28,step=.075}={}){
 const cells=new Set(),key=(x,y,z)=>`${x},${y},${z}`;
 for(let y=0;y<Math.ceil(height/step);y++)for(let x=-Math.ceil(arm/step);x<=Math.ceil(arm/step);x++)for(let z=-Math.ceil((depth+.15)/step);z<=Math.ceil((depth+.15)/step);z++){
  const X=(x+.5)*step,Y=(y+.5)*step,Z=(z+.5)*step,q=Y/height;
  const torso=q>.43&&q<.77&&Math.abs(X)<shoulder&&Math.abs(Z)<depth;
  const legs=q<=.47&&Math.abs(Math.abs(X)-leg)<shoulder*.37&&Math.abs(Z)<depth*.75;
  const arms=q>.715&&q<.785&&Math.abs(X)<arm&&Math.abs(Z)<depth*.65;
  const neck=q>.76&&q<.88&&Math.abs(X)<shoulder*.32&&Math.abs(Z)<depth*.65;
  const head=(X/(shoulder*.68))**2+((q-.91)/.09)**2+(Z/(depth*1.1))**2<1;
  if(torso||legs||arms||neck||head)cells.add(key(x,y,z));
 }
 const faces=[[[1,0,0],[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]],[[-1,0,0],[[0,0,1],[0,1,1],[0,1,0],[0,0,0]]],[[0,1,0],[[0,1,1],[1,1,1],[1,1,0],[0,1,0]]],[[0,-1,0],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]],[[0,0,1],[[1,0,1],[1,1,1],[0,1,1],[0,0,1]]],[[0,0,-1],[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]]];
 const positions=[],uv=[];for(const s of cells){const [x,y,z]=s.split(',').map(Number);for(const [d,c]of faces){if(cells.has(key(x+d[0],y+d[1],z+d[2])))continue;for(const i of [0,1,2,0,2,3]){const p=c[i].map((v,k)=>([x,y,z][k]+v)*step);positions.push(...p);uv.push(p[0]/(arm*2)+.5,p[1]/height);}}}return {positions,uv};
}
