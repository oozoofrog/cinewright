// Original additive composition; no samples, stochastic noise, external melody or codec input.
import fs from 'node:fs/promises';
export const rate=48000;
export async function writeScore(file,source){
  const count=source.frames*rate/source.fps,pcm=new Float64Array(count*2);
  for(const note of source.score){
    const start=Math.round(note.frame*rate/source.fps),length=Math.round(note.length*rate),freq=440*2**((note.midi-69)/12);
    if(!Number.isInteger(note.frame)||start<0||!Number.isFinite(length)||length<2400||start+length>count||!Number.isFinite(freq)||!Number.isFinite(note.amp)||note.amp<0||!Number.isFinite(note.pan)||Math.abs(note.pan)>1)throw Error('Score note outside authored range');
    for(let j=0;j<length&&start+j<count;j++){
      const t=j/rate,attack=1-Math.exp(-t*95),tail=Math.min(1,(length-j)/2400);
      const value=note.amp*attack*Math.exp(-t*2.1)*tail*(Math.sin(2*Math.PI*freq*t)+.23*Math.sin(2*Math.PI*freq*2.003*t)+.08*Math.sin(2*Math.PI*freq*4.01*t));
      pcm[(start+j)*2]+=value*Math.sqrt((1-note.pan)/2);pcm[(start+j)*2+1]+=value*Math.sqrt((1+note.pan)/2);
    }
  }
  const bytes=Buffer.alloc(44+count*4);bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(2,22);bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*4,28);bytes.writeUInt16LE(4,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(count*4,40);
  let peak=0;
  for(let i=0;i<pcm.length;i++){peak=Math.max(peak,Math.abs(pcm[i]));if(Math.abs(pcm[i])>=1)throw Error('Score clips');bytes.writeInt16LE(Math.round(pcm[i]*32767),44+i*2);}
  await fs.writeFile(file,bytes);return {rate,samples:count,peak};
}
