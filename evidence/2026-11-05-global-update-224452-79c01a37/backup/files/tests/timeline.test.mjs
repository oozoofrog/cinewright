import test from 'node:test';
import assert from 'node:assert/strict';
import { cues, exposure, sample, exchange } from '../runtime/timeline.mjs';

test('held exposure and hard substitution are half-open, including a hole', () => {
  const track = [{ from: 1, to: 4, every: 2, value: 'a' }, { from: 4, to: 6, value: 'b' }];
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(f => exposure(track, f)), [
    null, { frame: 1, value: 'a' }, { frame: 1, value: 'a' }, { frame: 3, value: 'a' },
    { frame: 4, value: 'b' }, { frame: 5, value: 'b' }, null,
  ]);
});
test('linear and stepped properties are stable in random access', () => {
  const track = [[2, 10], [6, 30]];
  assert.deepEqual([6, 0, 4, 5, 2].map(f => sample(track, f)), [30, 10, 20, 25, 10]);
  assert.equal(sample(track, 5, 'hold'), 10);
  assert.equal(sample(track, 6, 'hold'), 30);
});
test('cues are descriptive and spans remain independent of them', () => {
  const mark = cues({ fold: 3 }, { final: [5, 7] }, 8);
  assert.equal(mark.point('fold'), 3);
  assert.deepEqual(mark.span('final'), [5, 7]);
  assert.throws(() => mark.point('missing'), /missing/);
  assert.throws(() => cues({}, { bad: [5, 9] }, 8), /bad/);
});
test('channel contracts enforce provider, consumer, space, validity and presence', () => {
  const bus = exchange({
    exit: { producer: 'shape', consumers: ['line'], space: 'canvas', kind: 'vec2', from: 2, to: 4 },
  }, 2);
  assert.throws(() => bus.read('line', 'exit', 'canvas'), /missing/);
  assert.throws(() => bus.write('other', 'exit', [1, 2]), /producer/);
  assert.throws(() => bus.write('shape', 'exit', [Infinity, 2]), /vec2/);
  bus.write('shape', 'exit', [1, 2]);
  assert.deepEqual(bus.read('line', 'exit', 'canvas'), [1, 2]);
  assert.throws(() => bus.read('line', 'exit', 'world'), /space/);
  assert.throws(() => bus.write('shape', 'exit', [3, 4]), /duplicate/);
  assert.throws(() => exchange({
    exit: { producer: 'shape', consumers: ['line'], space: 'canvas', kind: 'vec2', from: 2, to: 4 },
  }, 4).read('line', 'exit', 'canvas'), /inactive/);
});
