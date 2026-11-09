const finite=(v)=>typeof v==='number'&&Number.isFinite(v);
function multiply(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
export function prepareRig2D(spec){
 const bones=structuredClone(spec?.bones);if(!Array.isArray(bones)||!bones.length||bones.length>256)throw new Error('rig2d: 1..256 bones required');const byId=new Map();for(const b of bones){if(typeof b.id!=='string'||!b.id||byId.has(b.id)||!Array.isArray(b.pivot)||b.pivot.length!==2||!b.pivot.every(finite)||!finite(b.rest??0)||b.limits&&(!Array.isArray(b.limits)||b.limits.length!==2||!b.limits.every(finite)||b.limits[0]>b.limits[1]))throw new Error('rig2d: invalid id/pivot/rest/limits');byId.set(b.id,b);}
 const order=[],visiting=new Set(),done=new Set();function visit(b){if(done.has(b.id))return;if(visiting.has(b.id))throw new Error('rig2d: parent cycle');visiting.add(b.id);if(b.parent){if(!byId.has(b.parent))throw new Error('rig2d: unknown parent');visit(byId.get(b.parent));}visiting.delete(b.id);done.add(b.id);order.push(b);}bones.forEach(visit);return Object.freeze({bones:order.map(b=>Object.freeze({...b,pivot:Object.freeze(b.pivot),limits:b.limits&&Object.freeze(b.limits)}))});
}
export function evaluateRig2D(rig,pose={}){
 const result=Object.create(null);for(const id of Object.keys(pose))if(!rig.bones.some(b=>b.id===id))throw new Error(`rig2d: unknown pose bone ${id}`);
 for(const b of rig.bones){let angle=(b.rest??0)+(pose[b.id]??0);if(!finite(angle))throw new Error('rig2d: finite angle required');if(b.limits)angle=Math.max(b.limits[0],Math.min(b.limits[1],angle));const c=Math.cos(angle),s=Math.sin(angle),m=[c,s,-s,c,...b.pivot];const matrix=b.parent?multiply(result[b.parent].matrix,m):m;result[b.id]={matrix,angle,pivot:[matrix[4],matrix[5]]};}return result;
}
