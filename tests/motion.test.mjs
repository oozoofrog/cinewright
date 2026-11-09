import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, ease, lerp, progress, seeded, noise, eventIndex, eventEnvelope, stagger, pathPoint } from '../modules/motion.mjs';

test('motion frames clamp, ease holds endpoints, stagger has explicit per-item delay', () => {
  assert.equal(clamp(-2),0); assert.equal(clamp(5),1); assert.equal(lerp(2,4,.5),3);
  assert.equal(progress(-4,0,10),0); assert.equal(progress(10,0,10),1);
  assert.equal(ease(-1),0); assert.equal(ease(2),1); assert.equal(ease(.5),.5);
  assert.equal(stagger(10,2,{from:0,duration:10,delay:5}),0);
  assert.equal(stagger(20,2,{from:0,duration:10,delay:5}),1);
  assert.throws(()=>progress(0,1,1)); assert.throws(()=>stagger(0,-1,{duration:2}));
});

test('motion seeded/noise is indexed and reproducible in arbitrary order, including negative positions', () => {
  const positions=[-2.5,0,3.7,4,100];
  const baseline=positions.map(p=>noise(99,p));
  for(const i of [4,0,3,1,2]) assert.equal(noise(99,positions[i]),baseline[i]);
  assert.ok(baseline.every(v=>v>=0 && v<1));
  assert.equal(noise(99,4),seeded(99,4));
  assert.notEqual(seeded(99,1),seeded(100,1));
  assert.ok(Math.abs(noise(99,1-1e-6)-noise(99,1+1e-6))<1e-8);
  assert.throws(()=>seeded(.5)); assert.throws(()=>noise(1,Infinity));
});

test('motion latest-event envelope has explicit attack, release and half-open end', () => {
  const events=[{frame:10,strength:.5},{frame:15,strength:1}];
  assert.equal(eventIndex(events,9),-1); assert.equal(eventIndex(events,15),1);
  assert.equal(eventEnvelope(events,9),0); assert.equal(eventEnvelope(events,10),0);
  assert.equal(eventEnvelope(events,11),.5);
  assert.equal(eventEnvelope(events,15),0,'new attack replaces previous tail, no summation');
  assert.equal(eventEnvelope(events,16),1);
  assert.equal(eventEnvelope(events,24),0);
  assert.equal(eventEnvelope(events,15,{attack:0,release:5}),1);
  assert.equal(eventEnvelope(events,20,{attack:0,release:5}),0);
  assert.throws(()=>eventEnvelope([],0,{release:0}));
});

test('motion path is arc-length sampled, clamped, handles zero-length segments without mutation', () => {
  const path=Object.freeze([Object.freeze([0,0]),Object.freeze([0,0]),Object.freeze([3,0]),Object.freeze([3,1])]);
  assert.deepEqual(pathPoint(path,-1),[0,0]); assert.deepEqual(pathPoint(path,.5),[2,0]);
  assert.deepEqual(pathPoint(path,1),[3,1]); assert.deepEqual(pathPoint(path,9),[3,1]);
  assert.deepEqual(pathPoint([[4,5],[4,5]],.5),[4,5]);
  assert.throws(()=>pathPoint([[1,2]],0));
});
