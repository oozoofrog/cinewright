export function prepare(api, config) {
  return {
    evaluate(t) { return t.read('route', 'canvas'); },
    draw(g, t, route) {
      const age = t.frame - api.point('return');
      if (age < 18) return;
      g.save();
      g.globalAlpha = Math.min(0.85, (age - 18) / 45);
      g.fillStyle = '#bce0c9';
      for (const [i, [x, y]] of route.entries()) {
        const bump = 1 + Math.max(0, Math.sin((t.exposed - 8 * i) / 13));
        g.fillRect(x - bump, y - bump, 2 * bump, 2 * bump);
      }
      if (config.variant === 'map') {
        g.font = '11px "Courier New"';
        g.fillText('III', route[2][0] + 8, route[2][1] - 6);
      }
      g.restore();
    },
  };
}
