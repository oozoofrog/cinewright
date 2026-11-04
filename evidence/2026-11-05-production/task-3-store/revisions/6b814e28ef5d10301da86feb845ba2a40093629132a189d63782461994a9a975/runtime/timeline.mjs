export function integer(value, label, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${label}: expected integer in [${min}, ${max}]`);
  }
  return value;
}

export function cues(points = {}, spans = {}, length) {
  for (const [name, at] of Object.entries(points)) integer(at, name, 0, length - 1);
  for (const [name, [from, to]] of Object.entries(spans)) {
    integer(from, name, 0, length - 1);
    integer(to, name, from + 1, length);
  }
  function get(table, name) {
    if (!Object.hasOwn(table, name)) throw new Error(`Unknown cue: ${name}`);
    return table[name];
  }
  return { point: name => get(points, name), span: name => [...get(spans, name)] };
}

export function exposure(track, frame) {
  const entry = track.find(({ from, to }) => from <= frame && frame < to);
  if (!entry) return null;
  const { from, every = 1, value } = entry;
  return { frame: from + Math.floor((frame - from) / every) * every, value };
}

export function sample(keys, frame, mode = 'linear') {
  if (frame <= keys[0][0]) return keys[0][1];
  const right = keys.findIndex(([at]) => frame < at);
  if (right < 0) return keys.at(-1)[1];
  const [from, a] = keys[right - 1];
  if (mode === 'hold') return a;
  const [to, b] = keys[right];
  return a + (b - a) * ((frame - from) / (to - from));
}

const types = {
  number: value => Number.isFinite(value),
  vec2: value => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite),
  boolean: value => typeof value === 'boolean',
  string: value => typeof value === 'string',
  path: value => Array.isArray(value) && value.every(typesVec2),
};
function typesVec2(value) { return types.vec2(value); }

export function exchange(contracts, frame) {
  const values = new Map();
  function channel(name) {
    if (!Object.hasOwn(contracts, name)) throw new Error(`Unknown channel: ${name}`);
    const entry = contracts[name];
    if (frame < entry.from || frame >= entry.to) throw new Error(`Channel ${name} inactive at ${frame}`);
    return entry;
  }
  return {
    write(owner, name, value) {
      const { producer, kind } = channel(name);
      if (owner !== producer) throw new Error(`Wrong producer for ${name}: ${owner}`);
      if (values.has(name)) throw new Error(`Channel ${name} has duplicate value at ${frame}`);
      if (!Object.hasOwn(types, kind) || !types[kind](value)) throw new Error(`Channel ${name} requires ${kind}`);
      values.set(name, structuredClone(value));
    },
    read(owner, name, space) {
      const entry = channel(name);
      if (!entry.consumers.includes(owner)) throw new Error(`Wrong consumer for ${name}: ${owner}`);
      if (entry.space !== space) throw new Error(`Wrong coordinate space for ${name}: ${space}`);
      if (!values.has(name)) throw new Error(`Channel ${name} missing at ${frame}`);
      return structuredClone(values.get(name));
    },
    finish() {
      for (const [name, { from, to }] of Object.entries(contracts)) {
        if (from <= frame && frame < to && !values.has(name)) throw new Error(`Channel ${name} missing at ${frame}`);
      }
      return Object.fromEntries(values);
    },
  };
}

export function validate(manifest) {
  const { title, size, fps, frames, layers, channels = {}, audio = [], probes = [] } = manifest;
  if (manifest.version !== 1 || typeof title !== 'string' || !title.trim()) throw new Error('Expected version 1 and a title');
  if (!Array.isArray(size) || size.length !== 2) throw new Error('Expected [width,height]');
  size.forEach(n => { integer(n, 'dimension', 16, 4096); if (n % 2) throw new Error('Use even dimensions'); });
  integer(fps, 'fps', 1, 120);
  integer(frames, 'frames', 1);
  cues(manifest.points, manifest.spans, frames);
  const ids = new Set();
  if (!Array.isArray(layers) || layers.length === 0) throw new Error('Expected layers');
  for (const { id, module, asset, in: from = 0, out: to = frames, exposure: track } of layers) {
    if (typeof id !== 'string' || !id || id === '$data' || ids.has(id)) throw new Error(`Invalid or duplicate layer id: ${id}`);
    ids.add(id);
    if (module) projectPath(module);
    if (asset) projectPath(asset);
    if (!module && !asset && !track) throw new Error(`Layer ${id} needs a module or an asset`);
    integer(from, id, 0, frames - 1);
    integer(to, id, from + 1, frames);
    let previous = from;
    for (const entry of track ?? []) {
      integer(entry.from, id, previous, to - 1);
      integer(entry.to, id, entry.from + 1, to);
      integer(entry.every ?? 1, id, 1);
      if (!Object.hasOwn(entry, 'value')) throw new Error(`Missing exposure value: ${id}`);
      if (!module) projectPath(entry.value);
      previous = entry.to;
    }
  }
  for (const [name, channel] of Object.entries(channels)) {
    const { producer, consumers, kind, space, from, to, data, mode } = channel;
    if ((producer !== '$data' && !ids.has(producer)) || !consumers?.length || !consumers.every(id => ids.has(id))
        || !Object.hasOwn(types, kind) || typeof space !== 'string' || !space) {
      throw new Error(`Invalid channel: ${name}`);
    }
    integer(from, name, 0, frames - 1);
    integer(to, name, from + 1, frames);
    if (producer === '$data') {
      if (data?.file) projectPath(data.file);
      else if (Array.isArray(data?.keys) && mode !== 'linear' && mode !== 'hold') throw new Error(`Choose key mode: ${name}`);
      else if (!Array.isArray(data?.keys) && !Object.hasOwn(data ?? {}, 'value')) throw new Error(`Missing channel data: ${name}`);
    }
  }
  for (const clip of audio) {
    projectPath(clip.asset);
    integer(clip.sourceIn, 'sourceIn');
    integer(clip.sourceOut, 'sourceOut', clip.sourceIn + 1);
    integer(clip.at, 'at', -Number.MAX_SAFE_INTEGER);
    if (!Number.isFinite(clip.gain ?? 1) || (clip.gain ?? 1) < 0) throw new Error('Invalid audio gain');
  }
  for (const { frame, box, threshold, audioSearch } of probes) {
    integer(frame, 'probe frame', 1, frames - 1);
    if (!Array.isArray(box) || box.length !== 4 || !box.every(n => Number.isFinite(n) && n >= 0 && n <= 1)
        || box[0] >= box[2] || box[1] >= box[3]) throw new Error('Probe box must be a normalized nonempty rectangle');
    integer(threshold, 'probe threshold', 1, 255);
    integer(audioSearch ?? 90, 'probe search in milliseconds', 1, 1000);
  }
  return manifest;
}

export function projectPath(value) {
  if (typeof value !== 'string' || !value || value.split('/').some(part => !/^[\w.-]+$/.test(part) || part === '.' || part === '..')) {
    throw new Error(`Invalid project path: ${value}`);
  }
  return value;
}
