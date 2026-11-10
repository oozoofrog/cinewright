import { cues, exchange, exposure, integer, projectPath, sample, validate } from './timeline.mjs';

async function json(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.json();
}

export async function open(canvas, scale = 1) {
  const manifest = validate(await json('/project/work.json'));
  const [width, height] = manifest.size;
  canvas.width = Math.max(2, Math.round(width * scale / 2) * 2);
  canvas.height = Math.max(2, Math.round(height * scale / 2) * 2);
  const ctx = canvas.getContext('2d',{willReadFrequently:false});
  const scratch = new OffscreenCanvas(canvas.width, canvas.height);
  const layerContext = scratch.getContext('2d',{willReadFrequently:false});
  const imageCache = new Map();
  const path = name => `/project/${projectPath(name)}`;
  function image(name) {
    if (!imageCache.has(name)) {
      imageCache.set(name, new Promise((resolve, reject) => {
        const art = new Image();
        art.onload = () => resolve(art);
        art.onerror = () => reject(new Error(`Image decode failed: ${name}`));
        art.src = path(name);
      }));
    }
    return imageCache.get(name);
  }

  const named = cues(manifest.points, manifest.spans, manifest.frames);
  const api = {
    width, height, pixelWidth: canvas.width, pixelHeight: canvas.height, fps: manifest.fps,
    frames: manifest.frames, path, image, json: name => json(path(name)), ...named, sample,
  };
  const channels = manifest.channels ?? {};
  const authored = await Promise.all(Object.entries(channels)
    .filter(([, channel]) => channel.producer === '$data')
    .map(async ([name, { from, to, data, mode }]) => {
      if (data.file) {
        const baked = await api.json(data.file);
        if (baked.from !== from || !Array.isArray(baked.values) || baked.values.length !== to - from) {
          throw new Error(`Baked coverage mismatch: ${name}`);
        }
        return [name, from, to, frame => baked.values[frame - from]];
      }
      if (data.keys) {
        let previous = from - 1;
        if (!data.keys.length) throw new Error(`Empty keys: ${name}`);
        for (const [at, value] of data.keys) {
          integer(at, name, previous + 1, to - 1);
          if (!Number.isFinite(value)) throw new Error(`Invalid numeric key: ${name}`);
          previous = at;
        }
        return [name, from, to, frame => sample(data.keys, frame, mode)];
      }
      return [name, from, to, () => data.value];
    }));
  const modules = [];
  let disposed = false;
  function dispose() {
    if (disposed) return; disposed = true;
    const errors=[];
    for (const {module} of [...modules].reverse()) { try { module.dispose?.(); } catch(e) { errors.push(e); } }
    modules.length=0; imageCache.clear(); scratch.width=2; scratch.height=2;
    if(errors.length) throw new AggregateError(errors, "Layer disposal failed");
  }
  try {
  for (const [index, spec] of manifest.layers.entries()) {
    const mask = spec.mask ? await image(spec.mask) : null;
    let module;
    if (spec.module) {
      const loaded = await import(path(spec.module));
      if (typeof loaded.prepare !== 'function') throw new Error(`Missing prepare(): ${spec.module}`);
      module = await loaded.prepare(api, spec.config ?? {});
      if (!module || typeof module.draw !== 'function') { module?.dispose?.(); throw new Error(`Missing draw(): ${spec.module}`); }
    } else {
      const assets = new Map();
      for (const name of new Set([spec.asset, ...((spec.exposure ?? []).map(entry => entry.value))].filter(Boolean))) {
        assets.set(name, await image(name));
      }
      module = { draw: (g, t) => g.drawImage(assets.get(t.value ?? spec.asset), 0, 0, width, height) };
    }
    modules.push({ spec, module, mask, index });
  }
  } catch(error) { try { dispose(); } catch(cleanup) { throw new AggregateError([error,cleanup], "Preparation and cleanup failed"); } throw error; }
  const drawOrder = [...modules].sort((a, b) => (a.spec.z ?? a.index) - (b.spec.z ?? b.index));
  const scaleX = canvas.width / width;
  const scaleY = canvas.height / height;

  function draw(frame) {
    if(disposed) throw new Error('Compositor disposed');
    integer(frame, 'frame', 0, manifest.frames - 1);
    const bus = exchange(channels, frame);
    for (const [name, from, to, value] of authored) {
      if (from <= frame && frame < to) bus.write('$data', name, value(frame));
    }
    const active = new Map();
    for (const { spec, module } of modules) {
      const { id, in: from = 0, out: to = manifest.frames, exposure: track } = spec;
      if (frame < from || frame >= to) continue;
      const slot = track ? exposure(track, frame) : { frame, value: undefined };
      if (!slot) continue;
      const t = {
        frame, seconds: frame / manifest.fps, exposed: slot.frame, value: slot.value,
        read: (name, space) => bus.read(id, name, space),
        write: (name, value) => bus.write(id, name, value),
      };
      active.set(id, { t, state: module.evaluate?.(t) });
    }
    const values = bus.finish();
    ctx.reset();
    ctx.fillStyle = manifest.background ?? '#101016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const { spec, module, mask } of drawOrder) {
      const entry = active.get(spec.id);
      if (!entry) continue;
      layerContext.reset();
      layerContext.scale(scaleX, scaleY);
      module.draw(layerContext, entry.t, entry.state);
      if (mask) {
        layerContext.setTransform(scaleX, 0, 0, scaleY, 0, 0);
        layerContext.globalAlpha = 1;
        layerContext.globalCompositeOperation = 'destination-in';
        layerContext.drawImage(mask, 0, 0, width, height);
      }
      ctx.globalAlpha = spec.opacity ?? 1;
      ctx.globalCompositeOperation = spec.blend ?? 'source-over';
      ctx.drawImage(scratch, 0, 0);
    }
    return {
      frame, values,
      exposures: Object.fromEntries([...active].map(([id, { t }]) => [id, { frame: t.exposed, value: t.value }])),
    };
  }
  return { manifest, draw, dispose };
}
