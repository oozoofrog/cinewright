// Authored ballet study, keyed in source frames. Not a beat/downbeat transcription.
// Selected gesture keys align to local heuristic onsets (406/433/455/483/505/527/554/576/599/628/648);
// they are presentation choices, not confirmed beats. All times are absolute source frames; only this 16–28s study is commissioned.
export const study = [384, 672];
const keys = [
  // frame, yaw, left upper, left elbow, right upper, right elbow, free hip, free knee, torso lean
  [384, -.48, 1.22, .35, -1.14, -.46, -.30, .55, -.04],
  [406, -.30, 1.85, .70, -.65, -.65, -.72, .85, -.08],
  [433, -.12, 2.45, .82, -.28, -.80, -1.18, .45, -.12],
  [455, .18, 2.68, .85, -.40, -.72, -1.32, .20, -.10],
  [483, .50, 2.35, .72, -1.15, -.42, -.80, 1.15, -.03],
  [505, 1.35, 2.60, .80, -2.60, -.80, -.45, 1.85, 0],
  [527, 3.25, 2.70, .82, -2.70, -.82, -.42, 1.90, 0],
  [554, 5.55, 2.62, .80, -2.62, -.80, -.42, 1.85, 0],
  [576, 5.98, 1.80, .50, -1.45, -.50, -.65, .80, -.04],
  [599, 6.04, 1.25, .38, -1.20, -.38, -1.20, .20, -.10],
  [628, 6.10, 1.10, .35, -1.10, -.35, -1.34, .10, -.12],
  [648, 6.14, 1.70, .65, -1.00, -.40, -.65, .72, -.05],
  [671, 6.18, 2.30, .82, -.80, -.65, -.30, .55, -.03],
];
export const poseNames = ['yaw','leftArm','leftElbow','rightArm','rightElbow','freeHip','freeKnee','lean'];
export function poseAt(frame) {
  if (!Number.isFinite(frame)) throw new Error('finite frame required');
  const f = Math.max(keys[0][0], Math.min(keys.at(-1)[0], frame));
  let i = 0;
  while (i < keys.length - 2 && f > keys[i+1][0]) i++;
  const a = keys[i], b = keys[i+1], p = (f-a[0])/(b[0]-a[0]);
  const u = p*p*(3-2*p);
  const result=Object.fromEntries(poseNames.map((name,j)=>[name,a[j+1]+(b[j+1]-a[j+1])*u]));
  // Monotone Hermite yaw: continuous angular velocity through the turn keys.
  const slope=k=>(keys[k+1][1]-keys[k][1])/(keys[k+1][0]-keys[k][0]);
  const tangent=k=>k===0||k===keys.length-1?0:2/(1/slope(k-1)+1/slope(k));
  const h=b[0]-a[0],m0=tangent(i),m1=tangent(i+1);
  result.yaw=(2*p**3-3*p*p+1)*a[1]+(p**3-2*p*p+p)*h*m0+(-2*p**3+3*p*p)*b[1]+(p**3-p*p)*h*m1;
  // Left shoulder extends left; both hands curve inward above the head.
  for(const name of ['leftArm','leftElbow','rightArm','rightElbow'])result[name]*=-1;
  return result;
}
// Bake smooth frame poses into Three.js tracks once. AnimationMixer.setTime then
// samples an absolute time, including reverse seeks; no physics/clock accumulation.
export function poseSamples() {
  return Array.from({length:study[1]-study[0]},(_,i)=>({frame:study[0]+i,...poseAt(study[0]+i)}));
}
