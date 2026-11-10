import test from 'node:test';
import assert from 'node:assert/strict';
import { compileCuts } from '../modules/cuts.mjs';
import { cues, exposure } from '../runtime/timeline.mjs';

function fixture() {
  return {
    frames: 12,
    boundaries: [
      { name: 'start', frame: 0 }, { name: 'turn', frame: 4 },
      { name: 'return', frame: 6 }, { name: 'end', frame: 12 },
    ],
    artworks: { waiting: {}, turned: {} },
    cuts: [
      { name: 'wait', from: 'start', to: 'turn', artwork: 'waiting', every: 2 },
      { name: 'gap', from: 'turn', to: 'return', empty: true },
      { name: 'answer', from: 'return', to: 'end', artwork: 'turned' },
    ],
    spans: [{ name: 'exchange', from: 'turn', to: 'end' }],
  };
}

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function rejects(spec, ...fragments) {
  assert.throws(() => compileCuts(spec), error => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /^compileCuts: /);
    for (const fragment of fragments) assert.ok(error.message.includes(fragment), error.message);
    return true;
  });
}

test('compiles authored cuts and explicit empty intervals into runtime tables', () => {
  assert.deepEqual(compileCuts(fixture()), {
    exposure: [
      { from: 0, to: 4, every: 2, value: 'waiting' },
      { from: 6, to: 12, every: 1, value: 'turned' },
    ],
    points: { start: 0, turn: 4, return: 6 },
    spans: { wait: [0, 4], gap: [4, 6], answer: [6, 12], exchange: [4, 12] },
  });
});

test('compiled output keeps runtime exposure half-open and terminal boundaries out of points', () => {
  const result = compileCuts(fixture());
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 11, 12].map(frame => exposure(result.exposure, frame)), [
    { frame: 0, value: 'waiting' }, { frame: 0, value: 'waiting' },
    { frame: 2, value: 'waiting' }, { frame: 2, value: 'waiting' },
    null, null, { frame: 6, value: 'turned' }, { frame: 11, value: 'turned' }, null,
  ]);
  const mark = cues(result.points, result.spans, 12);
  assert.equal(mark.point('return'), 6);
  assert.deepEqual(mark.span('answer'), [6, 12]);
  assert.deepEqual(mark.span('gap'), [4, 6]);
  assert.throws(() => mark.point('end'), /end/);
});

test('moving one boundary updates every dependent exposure, point, and span', () => {
  const spec = fixture();
  spec.boundaries[1].frame = 3;
  assert.deepEqual(compileCuts(spec), {
    exposure: [
      { from: 0, to: 3, every: 2, value: 'waiting' },
      { from: 6, to: 12, every: 1, value: 'turned' },
    ],
    points: { start: 0, turn: 3, return: 6 },
    spans: { wait: [0, 3], gap: [3, 6], answer: [6, 12], exchange: [3, 12] },
  });
});

test('compilation accepts frozen input, returns fresh data, and survives a JSON round trip', () => {
  const spec = freeze(fixture());
  const before = JSON.stringify(spec);
  const first = compileCuts(spec);
  const second = compileCuts(spec);
  assert.equal(JSON.stringify(spec), before);
  assert.deepEqual(first, second);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
  first.exposure[0].value = 'changed';
  first.points.turn = 99;
  first.spans.wait[1] = 99;
  assert.deepEqual(second.exposure[0], { from: 0, to: 4, every: 2, value: 'waiting' });
  assert.equal(second.points.turn, 4);
  assert.deepEqual(second.spans.wait, [0, 4]);
  assert.equal(JSON.stringify(spec), before);
});

test('point names and generated or additional span names are separate namespaces', () => {
  const spec = fixture();
  spec.cuts[0].name = 'turn';
  spec.spans[0].name = 'return';
  const result = compileCuts(spec);
  const mark = cues(result.points, result.spans, spec.frames);
  assert.equal(mark.point('turn'), 4);
  assert.deepEqual(mark.span('turn'), [0, 4]);
  assert.equal(mark.point('return'), 6);
  assert.deepEqual(mark.span('return'), [4, 12]);
});

test('prototype-like names remain own JSON properties and valid own artwork keys', () => {
  const spec = {
    frames: 2,
    boundaries: [{ name: '__proto__', frame: 0 }, { name: 'constructor', frame: 1 }, { name: 'end', frame: 2 }],
    artworks: Object.fromEntries([['toString', {}], ['__proto__', {}]]),
    cuts: [
      { name: '__proto__', from: '__proto__', to: 'constructor', artwork: 'toString' },
      { name: 'constructor', from: 'constructor', to: 'end', artwork: '__proto__' },
    ],
    spans: [{ name: 'toString', from: '__proto__', to: 'end' }],
  };
  const result = compileCuts(spec);
  assert.ok(Object.hasOwn(result.points, '__proto__'));
  assert.ok(Object.hasOwn(result.spans, '__proto__'));
  assert.deepEqual(result.spans.__proto__, [0, 1]);
  assert.deepEqual(result.spans.constructor, [1, 2]);
  assert.deepEqual(result.spans.toString, [0, 2]);
  assert.deepEqual(result.exposure.map(entry => entry.value), ['toString', '__proto__']);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  const mark = cues(result.points, result.spans, spec.frames);
  assert.equal(mark.point('__proto__'), 0);
  assert.deepEqual(mark.span('__proto__'), [0, 1]);
});

test('one-frame empty work has a span without exposure and needs no additional spans', () => {
  assert.deepEqual(compileCuts({
    frames: 1,
    boundaries: [{ name: 'start', frame: 0 }, { name: 'end', frame: 1 }],
    artworks: {},
    cuts: [{ name: 'silence', from: 'start', to: 'end', empty: true }],
  }), { exposure: [], points: { start: 0 }, spans: { silence: [0, 1] } });
});

test('inherited empty marker cannot authorize a cut without artwork', () => {
  const spec = fixture();
  spec.cuts = [Object.assign(Object.create({ empty: true }), {
    name: 'shot', from: 'start', to: 'end',
  })];
  rejects(spec, 'cuts[0]', 'shot', '.artwork');
});

test('inherited empty marker does not reject a cut with its own artwork', () => {
  const spec = fixture();
  spec.cuts = [Object.assign(Object.create({ empty: true }), {
    name: 'shot', from: 'start', to: 'end', artwork: 'waiting',
  })];
  assert.deepEqual(compileCuts(spec), {
    exposure: [{ from: 0, to: 12, every: 1, value: 'waiting' }],
    points: { start: 0, turn: 4, return: 6 },
    spans: { shot: [0, 12], exchange: [4, 12] },
  });
});

test('unused interior boundaries remain points and artwork data is not copied', () => {
  const spec = fixture();
  spec.cuts = [{ name: 'whole', from: 'start', to: 'end', artwork: 'waiting', every: 20 }];
  spec.artworks.waiting = { asset: 'still.svg' };
  const result = compileCuts(spec);
  assert.deepEqual(result.points, { start: 0, turn: 4, return: 6 });
  assert.deepEqual(result.exposure, [{ from: 0, to: 12, every: 20, value: 'waiting' }]);
  assert.deepEqual(result.spans.whole, [0, 12]);
});

test('rejects invalid root and collection shapes with field context', async t => {
  for (const value of [null, undefined, [], 12, 'spec']) {
    await t.test(`root ${String(value)}`, () => rejects(value, 'spec'));
  }
  const cases = [
    ['boundaries', null], ['boundaries', {}], ['boundaries', []],
    ['artworks', null], ['artworks', []], ['artworks', 'waiting'],
    ['cuts', null], ['cuts', {}], ['cuts', []],
    ['spans', null], ['spans', {}],
  ];
  for (const [field, value] of cases) {
    await t.test(`${field} ${JSON.stringify(value)}`, () => {
      const spec = fixture();
      spec[field] = value;
      rejects(spec, field);
    });
  }
  for (const field of ['boundaries', 'artworks', 'cuts']) {
    await t.test(`missing ${field}`, () => {
      const spec = fixture();
      delete spec[field];
      rejects(spec, field);
    });
  }
  for (const field of ['boundaries', 'cuts', 'spans']) {
    await t.test(`${field} entry is not an object`, () => {
      const spec = fixture();
      spec[field][0] = null;
      rejects(spec, `${field}[0]`);
    });
    await t.test(`${field} sparse entry`, () => {
      const spec = fixture();
      delete spec[field][0];
      rejects(spec, `${field}[0]`);
    });
  }
});

test('rejects non-positive, non-finite, fractional, and unsafe frame counts', async t => {
  for (const value of [0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, '12', null, undefined]) {
    await t.test(String(value), () => {
      const spec = fixture();
      spec.frames = value;
      rejects(spec, 'frames');
    });
  }
});

test('rejects invalid boundary frames without sorting or repairing them', async t => {
  const cases = [
    ['nonzero first', 0, 1], ['negative', 1, -1], ['out of range', 1, 13],
    ['duplicate frame', 1, 0], ['reversed', 1, 7], ['fractional', 1, 3.5],
    ['NaN', 1, NaN], ['infinite', 1, Infinity], ['string', 1, '4'],
    ['unsafe', 1, Number.MAX_SAFE_INTEGER + 1], ['short terminal', 3, 11],
  ];
  for (const [name, index, frame] of cases) {
    await t.test(name, () => {
      const spec = fixture();
      spec.boundaries[index].frame = frame;
      rejects(spec, 'boundaries[', '.frame');
    });
  }
  await t.test('single boundary', () => {
    const spec = fixture();
    spec.boundaries = [{ name: 'start', frame: 0 }];
    rejects(spec, 'boundaries');
  });
});

test('rejects empty or non-string names and duplicate names within each namespace', async t => {
  for (const field of ['boundaries', 'cuts', 'spans']) {
    for (const name of ['', '   ', 1, null, undefined]) {
      await t.test(`${field} name ${String(name)}`, () => {
        const spec = fixture();
        spec[field][0].name = name;
        rejects(spec, `${field}[0]`, '.name');
      });
    }
    await t.test(`duplicate ${field}`, () => {
      const spec = fixture();
      if (field === 'spans') spec.spans.push({ name: 'exchange', from: 'start', to: 'return' });
      else spec[field][1].name = spec[field][0].name;
      rejects(spec, `${field}[1]`, '.name', spec[field][0].name);
    });
  }
  await t.test('additional span collides with generated empty cut span', () => {
    const spec = fixture();
    spec.spans[0].name = 'gap';
    rejects(spec, 'spans[0]', '.name', 'gap');
  });
});

test('rejects missing, inherited, or non-string boundary references', async t => {
  for (const field of ['cuts', 'spans']) {
    for (const endpoint of ['from', 'to']) {
      for (const name of ['missing', 'toString', '__proto__', '', 4, null, undefined]) {
        await t.test(`${field} ${endpoint} ${String(name)}`, () => {
          const spec = fixture();
          spec[field][0][endpoint] = name;
          rejects(spec, `${field}[0]`, `.${endpoint}`, spec[field][0].name);
        });
      }
    }
  }
});

test('rejects reversed, empty, overlapping, unordered, or uncovered cut intervals', async t => {
  const cases = [
    ['reversed', spec => { spec.cuts[0].from = 'return'; }, 'cuts[0]', 'wait'],
    ['zero length', spec => { spec.cuts[0].to = 'start'; }, 'cuts[0]', 'wait'],
    ['initial gap', spec => { spec.cuts[0].from = 'turn'; spec.cuts[0].to = 'return'; }, 'cuts[0]', 'wait'],
    ['overlap', spec => { spec.cuts[1].from = 'start'; }, 'cuts[1]', 'gap'],
    ['implicit interior gap', spec => { spec.cuts.splice(1, 1); }, 'cuts[1]', 'answer'],
    ['unordered author input', spec => { [spec.cuts[0], spec.cuts[1]] = [spec.cuts[1], spec.cuts[0]]; }, 'cuts[0]', 'gap'],
    ['terminal gap', spec => { spec.cuts.pop(); }, 'cuts', 'gap'],
  ];
  for (const [name, change, field, cut] of cases) {
    await t.test(name, () => {
      const spec = fixture();
      change(spec);
      rejects(spec, field, cut);
    });
  }
});

test('rejects reversed or empty additional spans', async t => {
  for (const to of ['start', 'turn']) {
    await t.test(to, () => {
      const spec = fixture();
      spec.spans[0].to = to;
      rejects(spec, 'spans[0]', '.to', 'exchange');
    });
  }
});

test('rejects missing or inherited artwork references and malformed exposure intervals', async t => {
  for (const artwork of ['missing', 'toString', '__proto__', '', 1, null, undefined]) {
    await t.test(`artwork ${String(artwork)}`, () => {
      const spec = fixture();
      spec.cuts[0].artwork = artwork;
      rejects(spec, 'cuts[0]', '.artwork', 'wait');
    });
  }
  await t.test('custom inherited artwork', () => {
    const spec = fixture();
    spec.artworks = Object.create({ waiting: {} });
    spec.artworks.turned = {};
    rejects(spec, 'cuts[0]', '.artwork', 'wait', 'waiting');
  });
  await t.test('missing artwork field', () => {
    const spec = fixture();
    delete spec.cuts[0].artwork;
    rejects(spec, 'cuts[0]', '.artwork', 'wait');
  });
  for (const every of [0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, '2', null, undefined]) {
    await t.test(`every ${String(every)}`, () => {
      const spec = fixture();
      spec.cuts[0].every = every;
      rejects(spec, 'cuts[0]', '.every', 'wait');
    });
  }
});

test('empty cuts cannot silently carry artwork or exposure cadence', async t => {
  for (const [field, value] of [['artwork', 'waiting'], ['artwork', undefined], ['every', 1], ['every', undefined]]) {
    await t.test(`${field} ${String(value)}`, () => {
      const spec = fixture();
      spec.cuts[1][field] = value;
      rejects(spec, 'cuts[1]', `.${field}`, 'gap');
    });
  }
  for (const empty of [1, 'true', null, undefined]) {
    await t.test(`empty ${String(empty)}`, () => {
      const spec = fixture();
      spec.cuts[1].empty = empty;
      rejects(spec, 'cuts[1]', '.empty', 'gap');
    });
  }
});
