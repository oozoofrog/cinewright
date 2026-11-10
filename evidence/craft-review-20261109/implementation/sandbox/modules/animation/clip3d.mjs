import {AnimationMixer,LoopOnce} from 'three';
import {sampleExposure} from './exposure.mjs';
/** Owns a mixer, never the root's geometry/materials. Absolute frame seek. */
export function prepareClip3D(root,clip,{fps=24,loop=true,weight=1,timeScale=1,exposure={every:1}}={}){
 if(!root?.isObject3D||!clip||!Number.isFinite(clip.duration)||clip.duration<=0)throw new Error('clip3d: root and positive-duration clip required');
 if(!Number.isFinite(fps)||fps<=0||!Number.isFinite(timeScale)||!Number.isFinite(weight)||weight<0||weight>1||typeof loop!=='boolean')throw new Error('clip3d: invalid fps/loop/weight/timeScale');
 sampleExposure(0,exposure);
 const mixer=new AnimationMixer(root),action=mixer.clipAction(clip);action.setLoop(LoopOnce,1);action.clampWhenFinished=true;let disposed=false;
 return {evaluate(frame){if(disposed)throw new Error('clip3d disposed');const e=sampleExposure(frame,exposure);let seconds=(e?.frame??0)/fps*timeScale;seconds=loop?((seconds%clip.duration)+clip.duration)%clip.duration:Math.max(0,Math.min(clip.duration,seconds));action.reset().setEffectiveWeight(weight).play();mixer.setTime(seconds);return seconds;},dispose(){if(disposed)return;disposed=true;mixer.stopAllAction();mixer.uncacheRoot(root);}};
}
