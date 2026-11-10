import { ease, lerp, progress, seeded, pathPoint } from '../motion.mjs';

/** Sample an owned polyline into a fixed-count shape, preserving index correspondence. */
export function shapePoints(points, count = 72) {
  if (!Number.isSafeInteger(count) || count < 2 || count > 2048) throw new Error('shapePoints: count in [2,2048] required');
  return Array.from({ length: count }, (_, i) => pathPoint(points, i / (count - 1)));
}

/** Formation/dispersal/reformation: indexed paper tiles, no physics history.
 * shapes: same-length arrays of logical pixel vec2; '$scatter' is reserved.
 * keys: increasing {frame,shape}; holds are expressed by repeating a shape.
 */
export function prepare({ shapes, keys, scatter = [0, 0, 100, 100], seed = 17, radius = 3, color = '#c26743' }) {
  const entries = Object.entries(shapes ?? {});
  const count = entries[0]?.[1]?.length;
  if (!count || count > 2048 || entries.some(([name, points]) => name === '$scatter' || !Array.isArray(points) || points.length !== count || points.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite)))) throw new Error('particles: equally sized nonempty vec2 shapes required');
  if (!Array.isArray(scatter) || scatter.length !== 4 || !scatter.every(Number.isFinite) || scatter[2] <= 0 || scatter[3] <= 0 || !Number.isFinite(radius) || radius <= 0) throw new Error('particles: invalid scatter box/radius');
  const targets = Object.fromEntries(entries.map(([name, points]) => [name, points.map(p => [...p])]));
  targets.$scatter = Array.from({ length: count }, (_, i) => [scatter[0] + scatter[2] * seeded(seed, i * 2), scatter[1] + scatter[3] * seeded(seed, i * 2 + 1)]);
  if (!Array.isArray(keys) || keys.length < 2 || keys.some((k, i) => !Number.isFinite(k.frame) || (i && k.frame <= keys[i - 1].frame) || !Object.hasOwn(targets, k.shape))) throw new Error('particles: increasing keys naming known shapes required');
  const track = keys.map(k => ({ ...k }));
  function evaluate(t) {
    const frame = t.exposed ?? t.frame;
    let right = track.findIndex(k => k.frame > frame);
    if (right < 0) right = track.length;
    const a = track[Math.max(0, right - 1)], b = track[Math.min(track.length - 1, right)];
    const amount = a === b ? 0 : ease(progress(frame, a.frame, b.frame));
    return { points: targets[a.shape].map((p, i) => p.map((v, j) => lerp(v, targets[b.shape][i][j], amount))) };
  }
  return {
    evaluate,
    draw(g, t, state) {
      const s = state ?? evaluate(t);
      g.save();
      try {
        g.fillStyle = color;
        for (const [x, y] of s.points) g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      } finally { g.restore(); }
    },
  };
}
