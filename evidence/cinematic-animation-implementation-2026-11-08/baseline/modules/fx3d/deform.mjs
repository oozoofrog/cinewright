/** Mutates owned geometry from a captured rest array, never from last frame. */
export function prepareDeformation(geometry,{amplitude=.1,frequency=1,phase=0}={}){
 if(!geometry?.attributes?.position||![amplitude,frequency,phase].every(Number.isFinite)||Math.abs(amplitude)>10)throw new Error('deform: position geometry and bounded finite parameters required');
 const position=geometry.attributes.position,rest=position.array.slice();
 return {evaluate(seconds){if(!Number.isFinite(seconds))throw new Error('deform: finite seconds required');for(let i=0;i<position.count;i++){const j=i*3;position.array[j]=rest[j]+amplitude*Math.sin(rest[j+1]*frequency+seconds+phase)*rest[j+1];position.array[j+1]=rest[j+1];position.array[j+2]=rest[j+2];}position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();},rest};
}
