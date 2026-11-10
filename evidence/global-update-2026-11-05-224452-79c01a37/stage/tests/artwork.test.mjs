import test from 'node:test';
import assert from 'node:assert/strict';

async function helper() {
  try {
    return await import('../modules/artwork.mjs');
  } catch (error) {
    assert.fail(`Artwork helper must be importable in Node: ${error.message}`);
  }
}

test('provides only the geometry and prepare entry points without browser globals', async () => {
  const module = await helper();
  assert.deepEqual(Object.keys(module).sort(), ['artworkPlacement', 'prepare']);
  assert.equal(typeof module.artworkPlacement, 'function');
  assert.equal(typeof module.prepare, 'function');
});

function anchored() {
  return {
    sourceSize: [200, 100],
    crop: [40, 20, 80, 40],
    placement: { anchor: [60, 30], at: [120, 80], scale: 2 },
    canvasSize: [320, 180],
  };
}

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

async function placementRejects(spec, field) {
  const { artworkPlacement } = await helper();
  assert.throws(() => artworkPlacement(spec), error => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /^artworkPlacement: /);
    assert.ok(error.message.includes(field), error.message);
    return true;
  });
}

test('places an original-image anchor at its target with one scalar', async () => {
  const { artworkPlacement } = await helper();
  assert.deepEqual(artworkPlacement(anchored()), {
    source: [40, 20, 80, 40], destination: [80, 60, 160, 80], scale: 2, clip: null,
  });
});

test('keeps the same original anchor at its target after moving the crop origin', async () => {
  const { artworkPlacement } = await helper();
  const spec = anchored();
  spec.crop = [80, 40, 80, 40];
  // The anchor [60,30] lies outside this crop; its target remains [120,80].
  assert.deepEqual(artworkPlacement(spec), {
    source: [80, 40, 80, 40], destination: [160, 100, 160, 80], scale: 2, clip: null,
  });
});

test('defaults crop to the whole source and permits an off-canvas target without canvasSize', async () => {
  const { artworkPlacement } = await helper();
  assert.deepEqual(artworkPlacement({
    sourceSize: [160, 80], placement: { anchor: [0, 0], at: [-20, 500], scale: 0.5 },
  }), {
    source: [0, 0, 160, 80], destination: [-20, 500, 80, 40], scale: 0.5, clip: null,
  });
});

test('supports fractional coordinates and anchors outside the source', async () => {
  const { artworkPlacement } = await helper();
  assert.deepEqual(artworkPlacement({
    sourceSize: [3, 2], crop: [0.25, 0.5, 2, 1],
    placement: { anchor: [-1, 2], at: [1.25, -2], scale: 0.5 },
  }), {
    source: [0.25, 0.5, 2, 1], destination: [1.875, -2.75, 1, 0.5], scale: 0.5, clip: null,
  });
});

test('contain centers a wide image in the default canvas box without clipping or stretching', async () => {
  const { artworkPlacement } = await helper();
  assert.deepEqual(artworkPlacement({
    sourceSize: [200, 100], placement: { fit: 'contain' }, canvasSize: [100, 100],
  }), {
    source: [0, 0, 200, 100], destination: [0, 25, 100, 50], scale: 0.5, clip: null,
  });
});

test('cover centers a wide image and clips overflow to the default canvas box', async () => {
  const { artworkPlacement } = await helper();
  assert.deepEqual(artworkPlacement({
    sourceSize: [200, 100], placement: { fit: 'cover' }, canvasSize: [100, 100],
  }), {
    source: [0, 0, 200, 100], destination: [-50, 0, 200, 100], scale: 1, clip: [0, 0, 100, 100],
  });
});

test('fits the cropped dimensions inside an explicit box without requiring canvasSize', async t => {
  const { artworkPlacement } = await helper();
  for (const [fit, destination, scale, clip] of [
    ['contain', [10, 50, 80, 40], 1, null],
    ['cover', [-50, 20, 200, 100], 2.5, [10, 20, 80, 100]],
  ]) {
    await t.test(fit, () => assert.deepEqual(artworkPlacement({
      sourceSize: [200, 100], crop: [40, 20, 80, 40], placement: { fit, box: [10, 20, 80, 100] },
    }), { source: [40, 20, 80, 40], destination, scale, clip }));
  }
});

test('fits a tall image into an off-canvas box using the other limiting dimension', async t => {
  const { artworkPlacement } = await helper();
  for (const [fit, destination, scale, clip] of [
    ['contain', [-5, -20, 30, 60], 0.3, null],
    ['cover', [-50, -110, 120, 240], 1.2, [-50, -20, 120, 60]],
  ]) {
    await t.test(fit, () => assert.deepEqual(artworkPlacement({
      sourceSize: [100, 200], placement: { fit, box: [-50, -20, 120, 60] },
    }), { source: [0, 0, 100, 200], destination, scale, clip }));
  }
});

test('does not mutate input or expose its arrays through placement output', async () => {
  const { artworkPlacement } = await helper();
  const spec = freeze({
    sourceSize: [200, 100], crop: [40, 20, 80, 40],
    placement: { fit: 'cover', box: [10, 20, 80, 100] },
  });
  const result = artworkPlacement(spec);
  const other = artworkPlacement(spec);
  assert.ok(result);
  result.source[0] = 99;
  result.destination[0] = 99;
  result.clip[0] = 99;
  assert.deepEqual(spec.crop, [40, 20, 80, 40]);
  assert.deepEqual(spec.placement.box, [10, 20, 80, 100]);
  assert.deepEqual(other, {
    source: [40, 20, 80, 40], destination: [-50, 20, 200, 100], scale: 2.5, clip: [10, 20, 80, 100],
  });
});

test('inherited optional crop and canvasSize cannot change anchored placement', async () => {
  const { artworkPlacement } = await helper();
  const spec = Object.assign(Object.create({ crop: [10, 10, 1, 1], canvasSize: null }), {
    sourceSize: [20, 10], placement: { anchor: [0, 0], at: [0, 0], scale: 1 },
  });
  assert.deepEqual(artworkPlacement(spec), {
    source: [0, 0, 20, 10], destination: [0, 0, 20, 10], scale: 1, clip: null,
  });
});

test('inherited fit and box cannot switch anchored placement mode', async () => {
  const { artworkPlacement } = await helper();
  const spec = anchored();
  spec.placement = Object.assign(Object.create({ fit: 'cover', box: [0, 0, 1, 1] }), spec.placement);
  assert.deepEqual(artworkPlacement(spec), {
    source: [40, 20, 80, 40], destination: [80, 60, 160, 80], scale: 2, clip: null,
  });
});

test('inherited box or anchored controls cannot change fit placement', async () => {
  const { artworkPlacement } = await helper();
  assert.deepEqual(artworkPlacement({
    sourceSize: [200, 100], canvasSize: [100, 100],
    placement: Object.assign(Object.create({ box: [0, 0, 1, 1], anchor: [0, 0], at: [0, 0], scale: 9 }), { fit: 'contain' }),
  }), {
    source: [0, 0, 200, 100], destination: [0, 25, 100, 50], scale: 0.5, clip: null,
  });
});

test('rejects invalid root, placement, and missing anchored fields', async t => {
  for (const [label, spec, field] of [
    ['missing root', undefined, 'spec'], ['null root', null, 'spec'], ['array root', [], 'spec'],
    ['text root', 'pose', 'spec'], ['missing placement', { sourceSize: [1, 1] }, 'placement'],
    ...[null, [], 'contain'].map((placement, i) => [`placement shape ${i}`, { ...anchored(), placement }, 'placement']),
    ...['anchor', 'at', 'scale'].map(field => {
      const spec = anchored();
      delete spec.placement[field];
      return [`missing ${field}`, spec, field];
    }),
  ]) await t.test(label, () => placementRejects(spec, field));
});

test('rejects source sizes that are not two finite positive numbers', async t => {
  const sizes = [undefined, null, [], [1], [1, 2, 3], [0, 1], [1, -1], [NaN, 1], [1, Infinity], ['1', 1], [1, ,]];
  for (const [index, sourceSize] of sizes.entries()) {
    await t.test(`size ${index}`, () => placementRejects({ ...anchored(), sourceSize }, 'sourceSize'));
  }
});

test('rejects invalid crop shapes, nonfinite coordinates, and crops beyond the source', async t => {
  const crops = [
    undefined, null, [], [0, 0, 1], [0, 0, 1, 1, 1], [0, 0, 0, 1], [0, 0, 1, -1],
    [-1, 0, 1, 1], [0, -1, 1, 1], [NaN, 0, 1, 1], [0, Infinity, 1, 1], [0, 0, Infinity, 1],
    [199, 0, 2, 1], [0, 99, 1, 2], [200, 0, 1, 1], ['0', 0, 1, 1], [0, 0, , 1],
  ];
  for (const [index, crop] of crops.entries()) {
    await t.test(`crop ${index}`, () => placementRejects({ ...anchored(), crop }, 'crop'));
  }
});

test('rejects anchors and targets that are not finite coordinate pairs', async t => {
  for (const field of ['anchor', 'at']) {
    for (const [index, value] of [null, [], [1], [1, 2, 3], [NaN, 0], [0, Infinity], [-Infinity, 0], ['1', 0], [0, ,]].entries()) {
      const spec = anchored();
      spec.placement[field] = value;
      await t.test(`${field} ${index}`, () => placementRejects(spec, field));
    }
  }
});

test('rejects zero, negative, nonfinite, and non-scalar scales', async t => {
  for (const [index, scale] of [0, -1, NaN, Infinity, -Infinity, '2', null, undefined, [2, 2]].entries()) {
    const spec = anchored();
    spec.placement.scale = scale;
    await t.test(`scale ${index}`, () => placementRejects(spec, 'scale'));
  }
});

test('rejects unknown fit modes and explicit invalid optional controls', async t => {
  for (const [index, fit] of ['stretch', 'Contain', '', null, undefined, false].entries()) {
    await t.test(`fit ${index}`, () => placementRejects({ sourceSize: [1, 1], placement: { fit }, canvasSize: [1, 1] }, 'fit'));
  }
  await t.test('explicit undefined box', () => placementRejects({
    sourceSize: [1, 1], placement: { fit: 'contain', box: undefined }, canvasSize: [1, 1],
  }, 'box'));
  await t.test('no default scale', () => placementRejects({
    sourceSize: [1, 1], placement: { anchor: [0, 0], at: [0, 0] },
  }, 'scale'));
});

test('rejects mixing fit and anchored controls even when their own value is undefined', async t => {
  for (const field of ['anchor', 'at', 'scale']) {
    await t.test(field, () => placementRejects({
      sourceSize: [1, 1], canvasSize: [1, 1], placement: { fit: 'contain', [field]: undefined },
    }, field));
  }
  await t.test('box without fit', () => {
    const spec = anchored();
    spec.placement.box = [0, 0, 1, 1];
    return placementRejects(spec, 'box');
  });
});

test('rejects inherited required anchored fields', async t => {
  for (const field of ['anchor', 'at', 'scale']) {
    const spec = anchored();
    const value = spec.placement[field];
    delete spec.placement[field];
    spec.placement = Object.assign(Object.create({ [field]: value }), spec.placement);
    await t.test(field, () => placementRejects(spec, field));
  }
});

test('requires canvasSize for the default fit box and validates it whenever supplied', async t => {
  await t.test('missing default canvas', () => placementRejects({
    sourceSize: [1, 1], placement: { fit: 'contain' },
  }, 'canvasSize'));
  for (const [index, canvasSize] of [undefined, null, [], [1], [0, 1], [1, -1], [NaN, 1], [1, Infinity], ['1', 1]].entries()) {
    await t.test(`anchored canvas ${index}`, () => placementRejects({ ...anchored(), canvasSize }, 'canvasSize'));
  }
  await t.test('unused explicit-box canvas', () => placementRejects({
    sourceSize: [1, 1], placement: { fit: 'cover', box: [0, 0, 1, 1] }, canvasSize: [0, 1],
  }, 'canvasSize'));
});

test('rejects fit boxes with invalid shape, coordinates, or dimensions', async t => {
  for (const [index, box] of [null, [], [0, 0, 1], [0, 0, 0, 1], [0, 0, 1, -1], [NaN, 0, 1, 1], [0, Infinity, 1, 1], [0, 0, Infinity, 1], ['0', 0, 1, 1]].entries()) {
    await t.test(`box ${index}`, () => placementRejects({
      sourceSize: [1, 1], placement: { fit: 'cover', box },
    }, 'box'));
  }
});

test('rejects finite inputs whose derived scale or destination is not drawable', async t => {
  const cases = [
    { sourceSize: [2, 1], placement: { anchor: [0, 0], at: [0, 0], scale: Number.MAX_VALUE } },
    { sourceSize: [1, 1], placement: { anchor: [-Number.MAX_VALUE, 0], at: [Number.MAX_VALUE, 0], scale: 1 } },
    { sourceSize: [Number.MIN_VALUE, 1], placement: { fit: 'cover', box: [0, 0, 1, 1] } },
    { sourceSize: [1, 1], crop: [0, 0, Number.MIN_VALUE, 1], placement: { anchor: [0, 0], at: [0, 0], scale: 0.5 } },
  ];
  for (const [index, spec] of cases.entries()) {
    await t.test(`unrepresentable result ${index}`, () => placementRejects(spec, 'result'));
  }
});

test('does not impose an arbitrary size limit on representable finite geometry', async () => {
  const { artworkPlacement } = await helper();
  assert.deepEqual(artworkPlacement({
    sourceSize: [1, 1], placement: { anchor: [0, 0], at: [0, 0], scale: Number.MAX_VALUE },
  }), {
    source: [0, 0, 1, 1], destination: [0, 0, Number.MAX_VALUE, Number.MAX_VALUE],
    scale: Number.MAX_VALUE, clip: null,
  });
});

test('copies validated indexed crop and box coordinates instead of custom iterator output', async t => {
  const { artworkPlacement } = await helper();
  await t.test('crop iterator cannot inject nonfinite or extra source coordinates', () => {
    const crop = [40, 20, 80, 40];
    crop[Symbol.iterator] = function* () { yield* [NaN, 20, 80, 40, 999]; };
    assert.deepEqual(artworkPlacement({
      sourceSize: [200, 100], crop, placement: { fit: 'contain' }, canvasSize: [100, 100],
    }), {
      source: [40, 20, 80, 40], destination: [0, 25, 100, 50], scale: 1.25, clip: null,
    });
  });
  await t.test('box iterator cannot replace coordinates or extend the clip rectangle', () => {
    const box = [10, 20, 80, 100];
    box[Symbol.iterator] = function* () { yield* [30, 20, 80, 100, 999]; };
    assert.deepEqual(artworkPlacement({
      sourceSize: [200, 100], placement: { fit: 'cover', box },
    }), {
      source: [0, 0, 200, 100], destination: [-50, 20, 200, 100], scale: 1, clip: [10, 20, 80, 100],
    });
  });
});

test('reads each input coordinate once and validates the same value used for placement', async () => {
  const { artworkPlacement } = await helper();
  const crop = [40, 20, 80, 40];
  const reads = [0, 0, 0, 0];
  for (const [index, value] of [40, 20, 80, 40].entries()) {
    Object.defineProperty(crop, index, { get() { return ++reads[index] === 1 ? value : NaN; } });
  }
  assert.deepEqual(artworkPlacement({
    sourceSize: [200, 100], crop, placement: { fit: 'contain' }, canvasSize: [100, 100],
  }), {
    source: [40, 20, 80, 40], destination: [0, 25, 100, 50], scale: 1.25, clip: null,
  });
  assert.deepEqual(reads, [1, 1, 1, 1]);
});

function drawingContext({ drawError } = {}) {
  const calls = [];
  const context = {
    save() { calls.push(['save']); },
    restore() { calls.push(['restore']); },
    clip(path) { calls.push(['clip', path.rectangle]); },
    drawImage(...args) {
      calls.push(['drawImage', ...args]);
      if (drawError) throw drawError;
    },
    beginPath() { assert.fail('Artwork drawing must preserve the caller current path'); },
  };
  // These setters catch attempts to replace compositor alpha, blend, or transforms.
  for (const key of ['globalAlpha', 'globalCompositeOperation', 'filter', 'fillStyle']) {
    Object.defineProperty(context, key, { set() { assert.fail(`Artwork must not assign ${key}`); } });
  }
  return { context, calls };
}

function pathStandIn(t) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'Path2D');
  Object.defineProperty(globalThis, 'Path2D', {
    configurable: true, writable: true,
    value: class {
      rect(...rectangle) { this.rectangle = rectangle; }
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'Path2D', previous);
    else delete globalThis.Path2D;
  });
}

async function prepared(api, config) {
  const { prepare } = await helper();
  const result = await prepare(api, config);
  assert.equal(typeof result?.draw, 'function', 'prepare must return a draw function');
  return result;
}

function imageAPI(image, extra = {}) {
  return { width: 320, height: 180, async image() { return image; }, ...extra };
}

function artworkConfig() {
  const { crop, placement } = anchored();
  return { artworks: { pose: { asset: 'assets/pose.svg', crop, placement } } };
}

test('prepare loads every artwork and draws the selected image using natural dimensions', async () => {
  const images = {
    'assets/pose.svg': freeze({ naturalWidth: 200, naturalHeight: 100, width: 20, height: 10 }),
    'assets/other.svg': freeze({ naturalWidth: 80, naturalHeight: 160, width: 1, height: 1 }),
  };
  const loaded = [];
  const api = imageAPI(null, {
    width: 100, height: 100, pixelWidth: 50, pixelHeight: 50,
    async image(asset) { loaded.push(asset); return images[asset]; },
  });
  const config = artworkConfig();
  config.artworks.other = { asset: 'assets/other.svg', placement: { fit: 'contain' } };
  freeze(config);
  const module = await prepared(api, config);
  assert.deepEqual(loaded, ['assets/pose.svg', 'assets/other.svg']);
  const { context, calls } = drawingContext();
  module.draw(context, { frame: 12, exposed: 10, seconds: 0.5, value: 'other' });
  module.draw(context, { frame: 2, exposed: 2, seconds: 1 / 12, value: 'pose' });
  assert.deepEqual(calls, [
    ['save'], ['drawImage', images['assets/other.svg'], 0, 0, 80, 160, 25, 0, 50, 100], ['restore'],
    ['save'], ['drawImage', images['assets/pose.svg'], 40, 20, 80, 40, 80, 60, 160, 80], ['restore'],
  ]);
  assert.deepEqual(loaded, ['assets/pose.svg', 'assets/other.svg']);
});

test('cover clips with a separate Path2D and restores state after drawing', async t => {
  pathStandIn(t);
  const image = { naturalWidth: 200, naturalHeight: 100 };
  const module = await prepared(imageAPI(image), {
    artworks: { pose: { asset: 'assets/pose.svg', placement: { fit: 'cover', box: [10, 20, 80, 100] } } },
  });
  const { context, calls } = drawingContext();
  module.draw(context, { value: 'pose' });
  assert.deepEqual(calls, [
    ['save'], ['clip', [10, 20, 80, 100]],
    ['drawImage', image, 0, 0, 200, 100, -50, 20, 200, 100], ['restore'],
  ]);
});

test('restores saved state when drawImage throws', async t => {
  pathStandIn(t);
  const image = { naturalWidth: 200, naturalHeight: 100 };
  const module = await prepared(imageAPI(image), {
    artworks: { pose: { asset: 'assets/pose.svg', placement: { fit: 'cover', box: [0, 0, 100, 100] } } },
  });
  const failure = new Error('Canvas draw failed');
  const { context, calls } = drawingContext({ drawError: failure });
  assert.throws(() => module.draw(context, { value: 'pose' }), error => error === failure);
  assert.deepEqual(calls, [
    ['save'], ['clip', [0, 0, 100, 100]],
    ['drawImage', image, 0, 0, 200, 100, -50, 0, 200, 100], ['restore'],
  ]);
});

test('prepares cover without Path2D and restores state if its draw-time construction fails', async t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'Path2D');
  Reflect.deleteProperty(globalThis, 'Path2D');
  t.after(() => { if (previous) Object.defineProperty(globalThis, 'Path2D', previous); });
  const module = await prepared(imageAPI({ naturalWidth: 200, naturalHeight: 100 }), {
    artworks: { pose: { asset: 'assets/pose.svg', placement: { fit: 'cover' } } },
  });
  const { context, calls } = drawingContext();
  assert.throws(() => module.draw(context, { value: 'pose' }), /Path2D/);
  assert.deepEqual(calls, [['save'], ['restore']]);
});

test('selects own artwork keys including prototype-like and nonenumerable names', async () => {
  const image = { naturalWidth: 200, naturalHeight: 100 };
  const entry = artworkConfig().artworks.pose;
  const artworks = Object.fromEntries(['__proto__', 'constructor', 'toString', '7'].map(id => [id, entry]));
  Object.setPrototypeOf(artworks, { inherited: entry });
  Object.defineProperty(artworks, 'hidden', { value: entry });
  const loaded = [];
  const module = await prepared(imageAPI(image, { async image(asset) { loaded.push(asset); return image; } }), { artworks });
  assert.equal(loaded.length, 5);
  const { context, calls } = drawingContext();
  for (const value of ['__proto__', 'constructor', 'toString', '7', 'hidden']) module.draw(context, { value });
  assert.equal(calls.filter(([method]) => method === 'drawImage').length, 5);
  assert.throws(() => module.draw(context, { value: 'inherited' }), /inherited/);
  assert.throws(() => module.draw(context, { value: 7 }), /value/);
  assert.equal(calls.length, 15);
});

test('rejects unknown or missing values before changing the graphics state', async t => {
  const module = await prepared(imageAPI({ naturalWidth: 200, naturalHeight: 100 }), artworkConfig());
  for (const [index, time] of [
    undefined, null, {}, { value: undefined }, { value: null }, { value: 'missing' },
    { value: '__proto__' }, { value: 'toString' }, { value: 0 }, { value: {} }, { value: ['pose'] },
  ].entries()) {
    await t.test(`value ${index}`, () => {
      const { context, calls } = drawingContext();
      assert.throws(() => module.draw(context, time), /value/);
      assert.deepEqual(calls, []);
    });
  }
});

test('draw uses prepared geometry consistently across frame order and later config edits', async () => {
  const image = { naturalWidth: 200, naturalHeight: 100 };
  const config = artworkConfig();
  const module = await prepared(imageAPI(image), config);
  config.artworks.pose.crop[0] = 0;
  config.artworks.pose.placement.at[0] = 999;
  config.artworks.new = config.artworks.pose;
  delete config.artworks.pose;
  const { context, calls } = drawingContext();
  for (const frame of [12, 0, 8]) module.draw(context, { frame, exposed: frame - 1, seconds: frame / 24, value: 'pose' });
  assert.deepEqual(calls.filter(([method]) => method === 'drawImage'), [
    ['drawImage', image, 40, 20, 80, 40, 80, 60, 160, 80],
    ['drawImage', image, 40, 20, 80, 40, 80, 60, 160, 80],
    ['drawImage', image, 40, 20, 80, 40, 80, 60, 160, 80],
  ]);
  assert.throws(() => module.draw(context, { value: 'new' }), /new/);
});

test('empty artwork dictionaries can prepare but have no implicit draw fallback', async () => {
  const module = await prepared(imageAPI(null, { image() { assert.fail('No image should be requested'); } }), { artworks: {} });
  const { context, calls } = drawingContext();
  assert.throws(() => module.draw(context, { value: 'pose' }), /pose/);
  assert.deepEqual(calls, []);
});

test('preparation ignores inherited optional crop data', async () => {
  const image = { naturalWidth: 200, naturalHeight: 100 };
  const entry = Object.assign(Object.create({ crop: [40, 20, 80, 40] }), {
    asset: 'assets/pose.svg', placement: { anchor: [0, 0], at: [0, 0], scale: 1 },
  });
  const module = await prepared(imageAPI(image), { artworks: { pose: entry } });
  const { context, calls } = drawingContext();
  module.draw(context, { value: 'pose' });
  assert.deepEqual(calls, [['save'], ['drawImage', image, 0, 0, 200, 100, 0, 0, 200, 100], ['restore']]);
});

test('image rejection and synchronous loader failure retain artwork ID, asset, and cause', async t => {
  const { prepare } = await helper();
  for (const asynchronous of [true, false]) {
    await t.test(asynchronous ? 'rejection' : 'throw', async () => {
      const failure = new Error('Image decode failed');
      const api = imageAPI(null, { image() { if (asynchronous) return Promise.reject(failure); throw failure; } });
      await assert.rejects(prepare(api, artworkConfig()), error => {
        assert.ok(error.message.includes('pose'), error.message);
        assert.ok(error.message.includes('assets/pose.svg'), error.message);
        assert.ok(error.message.includes(failure.message), error.message);
        assert.equal(error.cause, failure);
        return true;
      });
    });
  }
});

test('throwing artwork and asset getters retain the artwork ID and unavailable asset context', async t => {
  const { prepare } = await helper();
  for (const field of ['artwork', 'asset']) {
    await t.test(field, async () => {
      const failure = new Error(`${field} lookup failed`);
      const config = artworkConfig();
      const target = field === 'artwork' ? config.artworks : config.artworks.pose;
      Object.defineProperty(target, field === 'artwork' ? 'pose' : 'asset', {
        get() { throw failure; }, enumerable: true,
      });
      const api = imageAPI(null, { image() { assert.fail('Failed lookup must not request an image'); } });
      await assert.rejects(prepare(api, config), error => {
        assert.ok(error.message.includes('pose'), error.message);
        assert.ok(error.message.includes('asset <unavailable>'), error.message);
        assert.ok(error.message.includes(failure.message), error.message);
        assert.equal(error.cause, failure);
        return true;
      });
    });
  }
});

test('invalid decoded image dimensions never fall back to displayed dimensions', async t => {
  const { prepare } = await helper();
  for (const [index, image] of [
    null, {}, { width: 200, height: 100 },
    { naturalWidth: 0, naturalHeight: 100, width: 200, height: 100 },
    { naturalWidth: 200, naturalHeight: NaN }, { naturalWidth: Infinity, naturalHeight: 100 },
  ].entries()) {
    await t.test(`image ${index}`, () => assert.rejects(prepare(imageAPI(image), artworkConfig()), error => {
      assert.ok(error.message.includes('pose'), error.message);
      assert.ok(error.message.includes('assets/pose.svg'), error.message);
      return true;
    }));
  }
});

test('invalid artwork objects, asset names, crops, and placement carry artwork context', async t => {
  const { prepare } = await helper();
  const entry = artworkConfig().artworks.pose;
  const entries = [
    null, [], {}, { ...entry, asset: '' }, { ...entry, asset: 7 },
    { ...entry, crop: undefined }, { ...entry, crop: [190, 0, 20, 20] },
    { asset: 'assets/pose.svg' }, { ...entry, placement: { anchor: [0, 0], at: [0, 0], scale: 0 } },
  ];
  for (const [index, value] of entries.entries()) {
    await t.test(`artwork ${index}`, () => assert.rejects(prepare(imageAPI({ naturalWidth: 200, naturalHeight: 100 }), {
      artworks: { pose: value },
    }), error => {
      assert.ok(error.message.includes('pose'), error.message);
      assert.ok(error.message.includes('asset'), error.message);
      if (value?.asset === 'assets/pose.svg') assert.ok(error.message.includes('assets/pose.svg'), error.message);
      return true;
    }));
  }
});

test('rejects invalid preparation API or configuration with field context', async t => {
  const { prepare } = await helper();
  const api = imageAPI({ naturalWidth: 200, naturalHeight: 100 });
  const config = artworkConfig();
  const cases = [
    [undefined, config, 'api'], [null, config, 'api'], [[], config, 'api'],
    [{ ...api, image: undefined }, config, 'image'],
    [{ ...api, width: 0 }, config, 'width'], [{ ...api, height: Infinity }, config, 'height'],
    [api, undefined, 'config'], [api, null, 'config'], [api, [], 'config'],
    [api, {}, 'artworks'], [api, { artworks: null }, 'artworks'], [api, { artworks: [] }, 'artworks'],
  ];
  for (const [index, [candidateAPI, candidateConfig, field]] of cases.entries()) {
    await t.test(`shape ${index}`, () => assert.rejects(prepare(candidateAPI, candidateConfig), error => {
      assert.ok(error.message.includes(field), error.message);
      return true;
    }));
  }
});
