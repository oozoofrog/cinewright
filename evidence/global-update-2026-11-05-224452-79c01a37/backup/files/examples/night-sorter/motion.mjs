const columns = 11;
const rows = 12;
const pitch = 34;
const gridLeft = 100;
const gridTop = 178;

function random(index, salt) {
  const value = Math.sin(index * 112.23 + salt * 81.53) * 43758.5453;
  return value - Math.floor(value);
}
const clamp = value => Math.max(0, Math.min(value, 1));
const ease = value => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

function cards() {
  return Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const u = col - 5;
    const v = row - 5.5;
    const moon = Math.hypot(u + 0.3, v) <= 4.7 && Math.hypot(u - 1.7, v + 1.1) >= 4.0;
    const star = (col === 8 && row >= 3 && row <= 5) || (row === 4 && Math.abs(col - 8) <= 1);
    const rank = (index * 47 + 13) % (rows * columns);
    return {
      x: gridLeft + col * pitch, y: gridTop + row * pitch,
      scatterX: gridLeft + (rank % columns) * pitch + (random(index, 1) - 0.5) * 37,
      scatterY: gridTop + Math.floor(rank / columns) * pitch + (random(index, 2) - 0.5) * 37,
      tilt: (random(index, 3) - 0.5) * 2.8,
      tint: random(index, 4), registration: random(index, 5) * 5,
      row, col, moon, star
    };
  });
}

function paintShell(g, stage, frame, hits, grain) {
  const backdrop = g.createLinearGradient(0, 0, 540, 720);
  backdrop.addColorStop(0, '#251c37');
  backdrop.addColorStop(0.52, '#131827');
  backdrop.addColorStop(1, '#0b0e19');
  g.fillStyle = backdrop;
  g.fillRect(0, 0, 540, 720);
  g.drawImage(grain, 0, 0);
  g.strokeStyle = '#67586e';
  g.lineWidth = 1;
  g.strokeRect(42.5, 50.5, 455, 619);
  g.strokeStyle = '#35394b';
  g.strokeRect(53.5, 61.5, 433, 597);
  g.fillStyle = '#f0c7a1';
  g.font = 'bold 16px monospace';
  g.fillText('NIGHT SORTER', 77, 100);
  g.fillStyle = '#b1a1b5';
  g.font = '10px monospace';
  g.fillText('NOCTURNAL INDEX', 78, 119);
  g.fillText('23:48  /  TRAY 04', 78, 630);
  g.textAlign = 'right';
  g.fillText(['00 / LOOSE', '01 / REGISTER', '02 / INDEX', '03 / CONTACT'][stage], 462, 630);
  g.textAlign = 'left';
  g.fillStyle = '#0c101c';
  g.fillRect(71, 143, 398, 459);
  g.strokeStyle = '#3a3b50';
  g.strokeRect(71.5, 143.5, 397, 458);
  if (stage >= 2) {
    g.fillStyle = '#39394d';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = gridLeft + col * pitch;
        const y = gridTop + row * pitch;
        g.fillRect(x - 15, y - 15, 3, 1);
        g.fillRect(x - 15, y - 15, 1, 3);
      }
    }
  }
  const lastHit = hits[stage - 1] ?? -100;
  const pulse = Math.exp(-Math.max(0, frame - lastHit) * 0.28);
  g.fillStyle = '#373047';
  g.fillRect(421, 83, 43, 14);
  g.fillStyle = pulse > 0.55 ? '#ffe0a4' : '#6d4259';
  g.fillRect(432, 85, 16, 10);
  g.fillStyle = '#dca77d';
  for (let i = 0; i < stage; i++) g.fillRect(426 + i * 14, 104, 8, 2);
}

function paintRegistration(g, frame, orient) {
  const scan = clamp((frame - orient + 1) / 21);
  if (scan <= 0 || scan >= 1) return;
  const y = mix(151, 594, scan);
  const falloff = Math.sin(scan * Math.PI);
  const light = g.createLinearGradient(0, y - 32, 0, y + 6);
  light.addColorStop(0, '#f3bb7900');
  light.addColorStop(1, `rgba(243, 187, 121, ${0.15 * falloff})`);
  g.fillStyle = light;
  g.fillRect(72, y - 32, 396, 38);
  g.fillStyle = `rgba(250, 200, 147, ${0.55 * falloff})`;
  g.fillRect(72, y + 6, 396, 1);
}

function paintCard(g, card, frame, hits) {
  const [orient, sort, reveal] = hits;
  const aligned = ease((frame - orient + 1 - card.registration) / 10);
  const seated = ease((frame - sort + 1 - card.row * 0.68) / 14);
  const flip = clamp((frame - reveal + 1 - (card.col + card.row) * 0.31) / 10);
  const drift = (1 - aligned) * Math.sin(frame * 0.11 + card.tint * 6) * 4;
  const x = mix(card.scatterX + drift, card.x, seated);
  const y = mix(card.scatterY - drift, card.y, seated);
  const front = flip < 0.5;
  const lit = card.moon || card.star;
  const warm = card.star ? '#f8d4a3' : card.tint < 0.45 ? '#dbaa80' : '#edc59b';
  g.save();
  g.translate(x, y);
  g.rotate(card.tilt * (1 - aligned) + (1 - seated) * aligned * 0.05);
  g.scale(Math.max(0.06, Math.abs(Math.cos(Math.PI * flip))), 1);
  g.fillStyle = '#060811';
  g.fillRect(-13, -11, 30, 29);
  g.fillStyle = front ? (card.tint < 0.55 ? '#383e57' : '#49425a') : lit ? warm : '#232b43';
  g.fillRect(-14, -14, 28, 28);
  g.fillStyle = front ? '#a48e9c' : lit ? '#ffe6bb' : '#353e59';
  g.fillRect(-13, -13, 26, 1);
  if (front) {
    const scanFrame = (card.scatterY - 151) / 443 * 21;
    const scanned = frame - orient + 1 >= scanFrame;
    g.fillStyle = scanned ? '#ffc588' : '#886e80';
    g.fillRect(-10, -9, 7, scanned ? 3 : 2);
    if (scanned) g.fillRect(-10, -6, 2, 3);
    g.fillStyle = '#aca2b2';
    g.fillRect(-10, 2, 13, 1);
    g.fillRect(-10, 5, 9, 1);
    g.fillRect(6, 7, 3, 3);
  } else {
    g.fillStyle = lit ? '#a06662' : '#48536f';
    g.fillRect(8, 8, 2, 2);
  }
  g.restore();
}

export function prepare({ width, height, point }) {
  const layout = cards();
  const hits = ['orient', 'sort', 'reveal'].map(point);
  const grain = document.createElement('canvas');
  grain.width = width;
  grain.height = height;
  const ink = grain.getContext('2d');
  for (let dot = 0; dot < 5600; dot++) {
    ink.fillStyle = dot % 2 ? '#f3d9bd12' : '#070a1550';
    ink.fillRect(random(dot, 8) * width, random(dot, 9) * height, dot % 3 + 1, 1);
  }
  return {
    draw(g, { frame }) {
      const stage = hits.filter(hit => frame >= hit).length;
      paintShell(g, stage, frame, hits, grain);
      for (const card of layout) paintCard(g, card, frame, hits);
      paintRegistration(g, frame, hits[0]);
    }
  };
}
