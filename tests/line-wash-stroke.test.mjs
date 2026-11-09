import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareStroke, strokeAt } from '../modules/fx2d/stroke.mjs';
test('arc-length reveal and input immutability', () => {
 const points=[[0,0,1],[3,0,.5],[3,4,0]]; const s=prepareStroke({points});
 assert.deepEqual(strokeAt(s,.5),[[0,0,1],[3,0,.5],[3,.5,.4375]]);
 assert.deepEqual(points,[[0,0,1],[3,0,.5],[3,4,0]]);
 assert.deepEqual(strokeAt(s,0),[[0,0,1]]);
});
test('rejects invalid pressure and zero length',()=>{
 assert.throws(()=>prepareStroke({points:[[0,0,2],[1,1,1]]}));
 assert.throws(()=>prepareStroke({points:[[0,0,1],[0,0,1]]}));
});
