function fail(field, reason) {
  throw new Error(`${field}: ${reason}`);
}

function object(value, field) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(field, 'expected an object');
  }
}

function numbers(value, length, field, positiveFrom = length) {
  if (!Array.isArray(value) || value.length !== length) {
    fail(field, `expected an array of ${length} finite numbers`);
  }
  const copy = [];
  for (let index = 0; index < length; index++) {
    const coordinate = value[index];
    if (!Number.isFinite(coordinate)) fail(`${field}[${index}]`, 'expected a finite number');
    if (index >= positiveFrom && coordinate <= 0) {
      fail(`${field}[${index}]`, 'expected a positive number');
    }
    copy.push(coordinate);
  }
  return copy;
}

function positive(value, field) {
  if (!Number.isFinite(value) || value <= 0) fail(field, 'expected a finite positive number');
  return value;
}

/** Return source/destination rectangles in image and logical canvas coordinates. */
export function artworkPlacement(spec) {
  const field = 'artworkPlacement';
  object(spec, `${field}: spec`);
  const sourceSize = numbers(spec.sourceSize, 2, `${field}: sourceSize`, 0);
  const canvasSize = Object.hasOwn(spec, 'canvasSize')
    ? numbers(spec.canvasSize, 2, `${field}: canvasSize`, 0) : undefined;
  const source = Object.hasOwn(spec, 'crop')
    ? numbers(spec.crop, 4, `${field}: crop`, 2) : [0, 0, ...sourceSize];
  if (source[0] < 0 || source[1] < 0
      || source[2] > sourceSize[0] - source[0] || source[3] > sourceSize[1] - source[1]) {
    fail(`${field}: crop`, 'expected a rectangle inside sourceSize');
  }

  const placement = spec.placement;
  object(placement, `${field}: placement`);
  let scale;
  let destination;
  let clip = null;
  if (Object.hasOwn(placement, 'fit')) {
    for (const key of ['anchor', 'at', 'scale']) {
      if (Object.hasOwn(placement, key)) {
        fail(`${field}: placement.${key}`, 'fit and anchored fields cannot be mixed');
      }
    }
    if (placement.fit !== 'contain' && placement.fit !== 'cover') {
      fail(`${field}: placement.fit`, 'expected contain or cover');
    }
    let box;
    if (Object.hasOwn(placement, 'box')) {
      box = numbers(placement.box, 4, `${field}: placement.box`, 2);
    } else {
      if (!canvasSize) fail(`${field}: canvasSize`, 'required when placement.box is omitted');
      box = [0, 0, ...canvasSize];
    }
    const fitScale = placement.fit === 'contain' ? Math.min : Math.max;
    scale = fitScale(box[2] / source[2], box[3] / source[3]);
    const width = source[2] * scale;
    const height = source[3] * scale;
    destination = [box[0] + (box[2] - width) / 2, box[1] + (box[3] - height) / 2, width, height];
    if (placement.fit === 'cover') clip = box;
  } else {
    if (Object.hasOwn(placement, 'box')) {
      fail(`${field}: placement.box`, 'box requires a fit placement');
    }
    const anchor = numbers(Object.hasOwn(placement, 'anchor') ? placement.anchor : undefined,
      2, `${field}: placement.anchor`);
    const at = numbers(Object.hasOwn(placement, 'at') ? placement.at : undefined,
      2, `${field}: placement.at`);
    scale = positive(Object.hasOwn(placement, 'scale') ? placement.scale : undefined,
      `${field}: placement.scale`);
    destination = [
      at[0] - (anchor[0] - source[0]) * scale,
      at[1] - (anchor[1] - source[1]) * scale,
      source[2] * scale, source[3] * scale,
    ];
  }
  positive(scale, `${field}: result.scale`);
  numbers(destination, 4, `${field}: result.destination`, 2);
  return { source, destination, scale, clip };
}

/** Prepare still artwork once; the caller owns exposure timing and any animation. */
export async function prepare(api, config) {
  object(api, 'artwork.prepare: api');
  if (typeof api.image !== 'function') fail('artwork.prepare: api.image', 'expected a function');
  const canvasSize = [
    positive(api.width, 'artwork.prepare: api.width'),
    positive(api.height, 'artwork.prepare: api.height'),
  ];
  object(config, 'artwork.prepare: config');
  object(config.artworks, 'artwork.prepare: config.artworks');
  const prepared = new Map();
  for (const id of Object.getOwnPropertyNames(config.artworks)) {
    let assetLabel = '<unavailable>';
    try {
      const artwork = config.artworks[id];
      const asset = artwork?.asset;
      assetLabel = typeof asset === 'string' ? JSON.stringify(asset) : '<invalid>';
      object(artwork, 'artwork');
      if (typeof asset !== 'string' || !asset.trim()) fail('asset', 'expected a nonempty string');
      const image = await api.image(asset);
      const spec = {
        sourceSize: [image?.naturalWidth, image?.naturalHeight],
        placement: artwork.placement,
        canvasSize,
      };
      if (Object.hasOwn(artwork, 'crop')) spec.crop = artwork.crop;
      prepared.set(id, { image, ...artworkPlacement(spec) });
    } catch (error) {
      const context = `artwork.prepare: artwork ${JSON.stringify(id)}, asset ${assetLabel}`;
      throw new Error(`${context}: ${error?.message ?? String(error)}`, { cause: error });
    }
  }

  return {
    draw(g, t) {
      const value = t?.value;
      if (typeof value !== 'string' || !prepared.has(value)) {
        const received = typeof value === 'string' ? JSON.stringify(value) : typeof value;
        fail('artwork.draw: t.value', `unknown own artwork key ${received}`);
      }
      const { image, source, destination, clip } = prepared.get(value);
      g.save();
      try {
        if (clip) {
          const path = new Path2D();
          path.rect(...clip);
          g.clip(path);
        }
        g.drawImage(image, ...source, ...destination);
      } finally {
        g.restore();
      }
    },
  };
}
