// Browser-safe, stateless helpers. Frames are timeline frames, seconds are source time.
export function sampleMusic(keys, frame, mode = 'linear') {
  if (!Number.isFinite(frame)) throw new Error('music frame must be finite');
  if (!keys?.length) return 0;
  if (mode !== 'linear' && mode !== 'hold') throw new Error('music mode must be linear or hold');
  let lo = 0, hi = keys.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (keys[mid][0] <= frame) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return keys[0][1];
  if (lo === keys.length || mode === 'hold') return keys[lo - 1][1];
  const [from, a] = keys[lo - 1], [to, b] = keys[lo];
  return a + (b - a) * (frame - from) / (to - from);
}

// Half-open [from,to); sorted events are the arrays emitted by deriveMusic.
export function musicEvents(events, from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) throw new Error('invalid music interval');
  let lo = 0, hi = events.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (events[mid].frame < from) lo = mid + 1;
    else hi = mid;
  }
  const result = [];
  for (let i = lo; i < events.length && events[i].frame < to; i++) result.push(events[i]);
  return result;
}

// Causal exponential accent in seconds, cut off at duration (half-open).
// Each event is evaluated independently: seeking backward needs no reset.
export function musicEnvelope(events, seconds, { decay = 0.12, duration = decay * 6 } = {}) {
  if (!Number.isFinite(seconds) || !Number.isFinite(decay) || decay <= 0 || !Number.isFinite(duration) || duration <= 0) {
    throw new Error('invalid music envelope time');
  }
  let lo = 0, hi = events.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (events[mid].seconds <= seconds) lo = mid + 1;
    else hi = mid;
  }
  let value = 0;
  for (let i = lo - 1; i >= 0; i--) {
    const age = seconds - events[i].seconds;
    if (age >= duration) break;
    value = Math.max(value, (events[i].strength ?? 1) * Math.exp(-age / decay));
  }
  return value;
}
