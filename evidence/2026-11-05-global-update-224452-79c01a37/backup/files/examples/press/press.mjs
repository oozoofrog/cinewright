const palettes = [
  ['#f6e7bd', '#182540', '#bc3828'],
  ['#d84631', '#f6e7bd', '#182540'],
  ['#213452', '#ffe2a9', '#ec624b'],
  ['#f6e7bd', '#182540', '#c33c2a'],
];
const words = ['SET', 'TAP', 'INK', 'PRINT'];

export async function prepare({ image, width, height, point, frames }) {
  const rosette = await image('assets/rosette.svg');
  const final = point('lock');
  return {
    draw(g, t) {
      const f = t.exposed;
      const step = Math.floor(f / 12);
      const block = Math.min(3, Math.floor(step / 4));
      const local = step % 4;
      const [paper, ink, accent] = palettes[block];
      g.fillStyle = paper; g.fillRect(0, 0, width, height);
      g.strokeStyle = ink; g.lineWidth = 2;
      g.strokeRect(30, 30, width - 60, height - 60);
      g.fillStyle = ink;
      g.font = 'bold 13px "Courier New", monospace';
      g.fillText('REGISTER   /   04', 48, 58);
      g.textAlign = 'right';
      g.fillText(`IMPRESSION ${String(step + 1).padStart(2, '0')}`, width - 48, 58);
      const last = f >= final;
      const glyph = words[last ? 3 : local];
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      if (block < 2 || last) {
        g.font = `900 ${last ? 181 : block === 1 ? 159 : 195}px system-ui`;
        const x = last ? width / 2 : width / 2 + [0, -45, 55, 0][local];
        g.fillStyle = accent; g.fillText(glyph, x + 6, height / 2 + 10);
        g.fillStyle = ink; g.fillText(glyph, x, height / 2);
      } else {
        const columns = local + 2;
        g.font = '900 64px system-ui';
        for (let x = 0; x < columns; x++) {
          for (let y = 0; y < 3; y++) {
            g.fillStyle = (x + y + step) % 2 ? ink : accent;
            g.fillText(glyph, 100 + (width - 200) * (x + 0.5) / columns, 154 + 100 * y);
          }
        }
      }
      for (let i = 0; i <= local; i++) {
        const x = 54 + i * 29;
        if (block % 2) g.drawImage(rosette, x - 9, height - 67, 19, 19);
        else { g.fillStyle = accent; g.fillRect(x - 7, height - 63, 15, 15); }
      }
      for (let i = 0; i < 4; i++) {
        g.fillStyle = i === block ? accent : ink;
        g.fillRect(width - 76 - i * 19, height - 60, 10, 3);
      }
      if (last) {
        const remaining = frames - f;
        g.fillStyle = ink;
        g.fillRect(370, 385, 220 * Math.min(1, remaining / 48), 3);
      }
    },
  };
}
