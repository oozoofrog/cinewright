import { ease, progress, lerp } from '../motion.mjs';

/** Stationary book-fold aperture. Frames [from,to] open from a slit to a panel.
 * Rectangles and focus center are logical pixels; the caller supplies the revealed drawing.
 */
export function prepare({ from, to, box, center = [0.5, 0.5] }) {
  progress(from, from, to);
  if (!Array.isArray(box) || box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0) throw new Error('focus: positive box required');
  if (!Array.isArray(center) || center.length !== 2 || !center.every(v => Number.isFinite(v) && v >= 0 && v <= 1)) throw new Error('focus: normalized center required');
  const bounds = [...box], anchor = [...center];
  function evaluate(t) {
    const amount = ease(progress(t.exposed ?? t.frame, from, to));
    const [x, y, w, h] = bounds;
    return { amount, box: [lerp(x + w * anchor[0], x, amount), lerp(y + h * anchor[1], y, amount), w * amount, h * amount] };
  }
  return {
    evaluate,
    draw(g, t, state, content) {
      const s = state ?? evaluate(t);
      if (!s.amount) return;
      g.save();
      try {
        g.beginPath(); g.rect(...s.box); g.clip();
        content(g);
      } finally { g.restore(); }
    },
  };
}
