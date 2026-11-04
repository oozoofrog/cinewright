function fail(field, reason) {
  throw new Error(`compileCuts: ${field}: ${reason}`);
}

function object(value, field) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(field, 'expected an object');
  }
}

function array(value, field, minimum = 0) {
  if (!Array.isArray(value) || value.length < minimum) {
    fail(field, `expected an array with at least ${minimum} entries`);
  }
}

function integer(value, field, minimum, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    fail(field, `expected an integer in [${minimum}, ${maximum}]`);
  }
}

function name(value, field) {
  if (typeof value !== 'string' || !value.trim()) fail(field, 'expected a nonempty string');
}

function namedEntry(entry, field) {
  object(entry, field);
  name(entry.name, `${field}.name`);
  return `${field} (${JSON.stringify(entry.name)})`;
}

function boundary(value, field, frames) {
  name(value, field);
  if (!frames.has(value)) fail(field, `unknown boundary ${JSON.stringify(value)}`);
  return frames.get(value);
}

function interval(entry, field, frames) {
  const from = boundary(entry.from, `${field}.from`, frames);
  const to = boundary(entry.to, `${field}.to`, frames);
  if (to <= from) fail(`${field}.to`, `expected a boundary after .from at frame ${from}`);
  return [from, to];
}

export function compileCuts(spec) {
  object(spec, 'spec');
  integer(spec.frames, 'frames', 1);
  array(spec.boundaries, 'boundaries', 2);
  object(spec.artworks, 'artworks');
  array(spec.cuts, 'cuts', 1);
  const extraSpans = Object.hasOwn(spec, 'spans') ? spec.spans : [];
  array(extraSpans, 'spans');

  const boundaryFrames = new Map();
  let previousFrame = -1;
  for (const [index, entry] of spec.boundaries.entries()) {
    const field = namedEntry(entry, `boundaries[${index}]`);
    if (boundaryFrames.has(entry.name)) fail(`${field}.name`, 'duplicate boundary name');
    integer(entry.frame, `${field}.frame`, 0, spec.frames);
    if (index === 0 && entry.frame !== 0) fail(`${field}.frame`, 'first boundary must be 0');
    if (entry.frame <= previousFrame) {
      fail(`${field}.frame`, `expected a frame greater than previous boundary frame ${previousFrame}`);
    }
    if (index === spec.boundaries.length - 1 && entry.frame !== spec.frames) {
      fail(`${field}.frame`, `last boundary must equal frames (${spec.frames})`);
    }
    boundaryFrames.set(entry.name, entry.frame);
    previousFrame = entry.frame;
  }

  const exposure = [];
  const spans = new Map();
  let nextFrame = 0;
  for (const [index, entry] of spec.cuts.entries()) {
    const field = namedEntry(entry, `cuts[${index}]`);
    if (spans.has(entry.name)) fail(`${field}.name`, 'duplicate cut name');
    const [from, to] = interval(entry, field, boundaryFrames);
    if (from !== nextFrame) {
      fail(`${field}.from`, `expected contiguous cut at frame ${nextFrame}, received ${from}`);
    }
    if (Object.hasOwn(entry, 'empty') && typeof entry.empty !== 'boolean') {
      fail(`${field}.empty`, 'expected a boolean');
    }
    if (Object.hasOwn(entry, 'empty') && entry.empty === true) {
      if (Object.hasOwn(entry, 'artwork')) fail(`${field}.artwork`, 'empty cut must omit artwork');
      if (Object.hasOwn(entry, 'every')) fail(`${field}.every`, 'empty cut must omit every');
    } else {
      name(entry.artwork, `${field}.artwork`);
      if (!Object.hasOwn(spec.artworks, entry.artwork)) {
        fail(`${field}.artwork`, `unknown own artwork key ${JSON.stringify(entry.artwork)}`);
      }
      const every = Object.hasOwn(entry, 'every') ? entry.every : 1;
      integer(every, `${field}.every`, 1);
      exposure.push({ from, to, every, value: entry.artwork });
    }
    spans.set(entry.name, [from, to]);
    nextFrame = to;
    if (index === spec.cuts.length - 1 && nextFrame !== spec.frames) {
      fail(`${field}.to`, `final cut must end at frames (${spec.frames}), received ${nextFrame}`);
    }
  }

  for (const [index, entry] of extraSpans.entries()) {
    const field = namedEntry(entry, `spans[${index}]`);
    if (spans.has(entry.name)) fail(`${field}.name`, 'duplicate span name, including generated cut spans');
    spans.set(entry.name, interval(entry, field, boundaryFrames));
  }

  return {
    exposure,
    points: Object.fromEntries([...boundaryFrames].slice(0, -1)),
    spans: Object.fromEntries(spans),
  };
}
