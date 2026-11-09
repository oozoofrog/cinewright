import test from 'node:test';
import assert from 'node:assert/strict';
import { prepare as focus } from '../modules/fx/focus.mjs';
import { prepare as accent } from '../modules/fx/accent.mjs';
import { prepare as particles, shapePoints } from '../modules/fx/particles.mjs';

function context() {
  const calls=[];
  return { calls, globalAlpha:1, save(){calls.push(['save']);},restore(){calls.push(['restore']);},beginPath(){},rect(...v){calls.push(['rect',...v]);},clip(){calls.push(['clip']);},fillRect(...v){calls.push(['fillRect',...v]);},translate(...v){calls.push(['translate',...v]);},moveTo(...v){calls.push(['moveTo',...v]);},lineTo(...v){calls.push(['lineTo',...v]);},stroke(){calls.push(['stroke']);} };
}

test('focus stationary aperture uses exposure time and exact closed/open bounds', () => {
  const box=[10,20,100,60], fx=focus({from:10,to:20,box}); box[0]=999;
  assert.deepEqual(fx.evaluate({frame:0}),{amount:0,box:[60,50,0,0]});
  assert.deepEqual(fx.evaluate({frame:30}),{amount:1,box:[10,20,100,60]});
  assert.deepEqual(fx.evaluate({frame:19,exposed:15}),{amount:.5,box:[35,35,50,30]});
  const g=context(); let draws=0;
  fx.draw(g,{frame:0},undefined,()=>draws++); assert.equal(draws,0);
  fx.draw(g,{frame:20},undefined,()=>draws++); assert.equal(draws,1);
  assert.deepEqual(g.calls,[['save'],['rect',10,20,100,60],['clip'],['restore']]);
  assert.throws(()=>fx.draw(g,{frame:20},undefined,()=>{throw new Error('content');}));
  assert.deepEqual(g.calls.at(-1),['restore']);
  assert.throws(()=>focus({from:0,to:0,box:[0,0,1,1]}));
});

test('accent is a bounded local two-mark contact and ends exactly at release', () => {
  const events=[{frame:10,strength:.8}], fx=accent({events,at:[30,40],radius:20,release:6});
  events[0].frame=100;
  assert.equal(fx.evaluate({frame:9}).amount,0);
  assert.equal(fx.evaluate({frame:10}).amount,.8);
  assert.equal(fx.evaluate({frame:16}).amount,0);
  const g=context(); fx.draw(g,{frame:10});
  assert.equal(g.calls.filter(c=>c[0]==='stroke').length,2);
  assert.deepEqual(g.calls.find(c=>c[0]==='translate'),['translate',30,40]);
  assert.equal(g.calls.filter(c=>c[0]==='fillRect').length,0,'never a canvas flash');
  assert.throws(()=>accent({events:[{frame:4},{frame:2}]}));
});

test('particles form, disperse and reform indexed glyphs with no accumulated state', () => {
  const a=shapePoints([[0,0],[10,0],[10,10]],5), b=shapePoints([[30,30],[40,30],[40,40]],5);
  const config={shapes:{a,b},keys:[{frame:0,shape:'a'},{frame:10,shape:'a'},{frame:20,shape:'$scatter'},{frame:30,shape:'b'},{frame:40,shape:'a'}],scatter:[-100,-100,200,200],seed:2};
  const fx=particles(config), other=particles(config);
  const reference=new Map([0,10,15,20,30,40,100].map(frame=>[frame,fx.evaluate({frame})]));
  assert.deepEqual(reference.get(0).points,a); assert.deepEqual(reference.get(10).points,a);
  assert.deepEqual(reference.get(30).points,b); assert.deepEqual(reference.get(40).points,a);
  assert.deepEqual(reference.get(100).points,a); assert.notDeepEqual(reference.get(20).points,a);
  for(const frame of [40,0,20,15,10,100,30]) {
    assert.deepEqual(fx.evaluate({frame}),reference.get(frame));
    assert.deepEqual(other.evaluate({frame}),reference.get(frame));
  }
  a[0][0]=999; assert.equal(fx.evaluate({frame:0}).points[0][0],0,'prepare snapshots input');
  const g=context(); fx.draw(g,{frame:20});
  assert.equal(g.calls.filter(c=>c[0]==='fillRect').length,5);
  assert.ok(g.calls.filter(c=>c[0]==='fillRect').every(c=>c.slice(1).every(Number.isFinite)));
  assert.throws(()=>particles({...config,keys:[{frame:0,shape:'missing'},{frame:1,shape:'a'}]}));
  assert.throws(()=>shapePoints([[0,0],[1,1]],1));
});
