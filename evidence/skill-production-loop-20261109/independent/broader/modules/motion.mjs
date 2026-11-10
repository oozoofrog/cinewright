/** All time arguments are frames (fractional frames allowed); positions are logical canvas pixels. */
export const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
export const lerp = (a, b, amount) => a + (b - a) * amount;
export const ease = amount => { const u = clamp(amount); return u * u * (3 - 2 * u); };
export function progress(frame, from, to) {
  if (![frame, from, to].every(Number.isFinite) || to <= from) throw new Error('progress: finite frame and from < to required');
  return clamp((frame - from) / (to - from));
}

/** Indexed hash: no random cursor, global state, or dependence on previous evaluations. */
export function seeded(seed, index = 0) {
  if (!Number.isSafeInteger(seed) || !Number.isSafeInteger(index)) throw new Error('seeded: integer seed/index required');
  let h = (seed ^ Math.imul(index, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
export function noise(seed, position) {
  if (!Number.isFinite(position)) throw new Error('noise: finite position required');
  const index = Math.floor(position);
  return lerp(seeded(seed, index), seeded(seed, index + 1), ease(position - index));
}

/** Events must be frame-sorted; return the last event at/before frame, or -1. */
export function eventIndex(events, frame) {
  let low = 0, high = events.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (events[mid].frame <= frame) low = mid + 1;
    else high = mid;
  }
  return low - 1;
}
/** Latest-event envelope; [event,event+attack+release), never sums overlapping hits. */
export function eventEnvelope(events, frame, { attack = 1, release = 8 } = {}) {
  if (!Number.isFinite(attack) || attack < 0 || !Number.isFinite(release) || release <= 0) throw new Error('eventEnvelope: invalid durations');
  const index = eventIndex(events, frame);
  if (index < 0) return 0;
  const age = frame - events[index].frame;
  const strength = clamp(events[index].strength ?? 1);
  if (age >= attack + release) return 0;
  return strength * (age < attack ? ease(age / attack) : 1 - ease((age - attack) / release));
}
export function stagger(frame, index, { from = 0, duration, delay = 0 }) {
  if (!Number.isInteger(index) || index < 0 || !Number.isFinite(delay) || delay < 0) throw new Error('stagger: nonnegative index/delay required');
  return ease(progress(frame, from + index * delay, from + index * delay + duration));
}
/** Arc-length path sampling, clamped to endpoints. Duplicate vertices are permitted. */
export function pathPoint(points, amount) {
  if (!Array.isArray(points) || points.length < 2 || points.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))) throw new Error('pathPoint: at least two finite vec2 points required');
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = lengths.reduce((a, b) => a + b, 0);
  if (!total) return [...points[0]];
  let remaining = clamp(amount) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] && lengths[i] > 0) return points[i].map((v, j) => lerp(v, points[i + 1][j], remaining / lengths[i]));
    remaining -= lengths[i];
  }
  return [...points.at(-1)];
}
