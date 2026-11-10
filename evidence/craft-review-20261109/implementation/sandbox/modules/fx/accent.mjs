import { eventEnvelope, clamp } from '../motion.mjs';

/** Local ink contact marks, not a full-screen flash. Radius in pixels, duration in frames. */
export function prepare({ events, at = [0, 0], radius = 24, attack = 0, release = 8, color = '#b34f38' }) {
  if (!Array.isArray(events) || events.some((e, i) => !Number.isFinite(e.frame) || (i && e.frame < events[i - 1].frame))) throw new Error('accent: sorted frame events required');
  if (!Array.isArray(at) || at.length !== 2 || !at.every(Number.isFinite) || !Number.isFinite(radius) || radius <= 0) throw new Error('accent: finite position/positive radius required');
  const hits = events.map(e => ({ ...e })), origin = [...at];
  eventEnvelope([], 0, { attack, release });
  const evaluate = t => ({ amount: eventEnvelope(hits, t.exposed ?? t.frame, { attack, release }) });
  return {
    evaluate,
    draw(g, t, state) {
      const amount = clamp((state ?? evaluate(t)).amount);
      if (!amount) return;
      g.save();
      try {
        g.strokeStyle = color; g.lineWidth = 2; g.globalAlpha *= amount * 0.8;
        g.translate(...origin);
        for (const sign of [-1, 1]) {
          g.beginPath();
          g.moveTo(sign * radius * 0.65, -radius * (0.15 + 0.15 * amount));
          g.lineTo(sign * radius, -radius * (0.4 + 0.15 * amount));
          g.stroke();
        }
      } finally { g.restore(); }
    },
  };
}
