const ink = '#f7c17a';
const pale = '#ffe6b8';
const blue = '#82c7c5';
const lerp = (a, b, x) => a + (b - a) * x;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => (x = clamp(x), x * x * (3 - 2 * x));
const lamp = [747, 285];

function stroke(g, points, color, width = 1) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  for (const [index, [x, y]] of points.entries()) index ? g.lineTo(x, y) : g.moveTo(x, y);
  g.stroke();
}
function disk(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
}
function text(g, value, x, y, color = '#be9c76', size = 11) {
  g.font = `${size}px "Courier New", monospace`;
  g.fillStyle = color;
  g.fillText(value, x, y);
}

export async function prepare(api, { variant }) {
  const art = await api.image('assets/shore.jpg');
  const { width, height, point, frames } = api;
  const start = point('instrument');
  const back = point('return');
  const late = point('arrival');
  const marks = [point('first-light'), point('second-light'), late];
  const routeAlpha = frame => ease((frame - back - 4) / 34);

  function pulse(g, age, x, y, weight) {
    if (age < 0 || age >= 33) return;
    const spread = age * (1.25 + 0.2 * weight);
    g.save();
    g.globalAlpha = (1 - age / 33) * 0.55;
    for (let i = 0; i < 4; i++) {
      const distance = spread * (1 + 0.19 * i);
      const position = y + 44 + i * 5 + age * 1.3;
      stroke(g, [[x - distance * 1.95, position], [x - distance * 0.65, position + 0.6]], ink, 1.3);
      stroke(g, [[x - distance * 0.37, position], [x + distance * 0.62, position]], pale, 0.75);
    }
    g.restore();
  }
  function paper(g, t, state) {
    g.drawImage(art, 0, 0, width, height);
    const darkness = g.createLinearGradient(0, 0, 0, height);
    darkness.addColorStop(0, 'rgba(1,10,16,0.10)');
    darkness.addColorStop(0.62, 'rgba(1,10,16,0.00)');
    darkness.addColorStop(1, 'rgba(1,10,16,0.13)');
    g.fillStyle = darkness;
    g.fillRect(0, 0, width, height);
    for (let i = 0; i < 21; i++) {
      const x = (Math.sin(i * 75.4) * 0.5 + 0.5) * 440;
      const y = 341 + i * 9;
      const drift = 13 * Math.sin(t.exposed / 31 + i * 0.81);
      const intensity = 0.1 + 0.08 * Math.sin(t.exposed / 18 + i);
      stroke(g, [[x + drift, y], [x + drift + 11 + i * 3.9, y - 1]], `rgba(200,184,146,${intensity})`, 0.85);
    }
    if (variant === 'return' && t.frame < start && t.frame >= start - 19) {
      const a = ease((t.frame - start + 19) / 18);
      g.save(); g.globalAlpha = a * 0.63;
      stroke(g, [[747, 286], [657, 286], [517, 247]], ink, 1.25);
      disk(g, 517, 247, 2.6, pale);
      g.restore();
    }
    if (t.frame >= back) {
      const { lane, boat } = state;
      const alpha = routeAlpha(t.frame);
      const b = ease((t.frame - back + 5) / (late - back + 2));
      g.save();
      g.globalAlpha = alpha * (variant === 'map' ? 0.75 : 0.42);
      g.setLineDash([5, 14]);
      stroke(g, lane, blue, 1.7);
      g.restore();
      const [x, y] = boat;
      g.save();
      g.globalAlpha = ease((t.frame - back + 1) / 16);
      g.translate(x, y);
      const size = lerp(0.72, 1.2, b);
      g.scale(size, size);
      for (let i = 0; i < 4; i++) {
        stroke(g, [[-11 - 3 * i, i * 2 + 2], [-30 - 7 * i, i * 3 + 2]], i % 2 ? ink : blue, 1 - i * 0.14);
      }
      g.fillStyle = '#091521';
      g.beginPath(); g.moveTo(-19, 0); g.lineTo(17, -2); g.lineTo(10, 6); g.lineTo(-12, 6); g.fill();
      stroke(g, [[-19, 0], [17, -2], [10, 6], [-12, 6], [-19, 0]], pale, 1.25);
      g.fillStyle = '#102631'; g.fillRect(-4, -7, 9, 6);
      stroke(g, [[-4, -1], [-4, -7], [5, -7], [5, -2]], pale);
      stroke(g, [[1, -7], [1, -14]], ink);
      disk(g, 1, -14, 1.55, pale);
      g.restore();
      if (variant === 'map') {
        g.save();
        g.globalAlpha = ease((t.frame - back) / 24);
        for (let i = 0; i < 7; i++) {
          const yy = 340 + i * 23;
          stroke(g, [[34, yy], [67 + i * 17, yy]], blue, 0.8);
          if (i % 2 === 0) text(g, `0${i * 2}`, 22, yy + 4, pale, 9);
        }
        text(g, 'LANE OPEN', 32, 56, pale, 13);
        g.restore();
      }
    }
    for (let i = 0; i < marks.length; i++) {
      const age = t.frame - marks[i];
      pulse(g, age, lamp[0] - 45 - i * 15, 305, 1 + i * 0.32);
      if (age >= 0 && age < (i === 2 ? frames - late : 16)) {
        const alpha = age < 3 ? 1 : (i === 2 ? 0.72 : 1 - (age - 3) / 13);
        g.save();
        g.globalAlpha = alpha;
        const glow = g.createRadialGradient(lamp[0], lamp[1], 1, lamp[0], lamp[1], 31);
        glow.addColorStop(0, 'rgba(246,155,74,.80)');
        glow.addColorStop(1, 'rgba(246,155,74,0)');
        g.fillStyle = glow;
        g.fillRect(lamp[0] - 31, lamp[1] - 31, 62, 62);
        g.fillStyle = pale; g.fillRect(740, 278, 14, 17);
        g.fillStyle = ink; g.fillRect(745, 278, 1.2, 17);
        g.restore();
      }
    }
  }

  return {
    evaluate(t) {
      if (t.frame < start) return;
      const ray = t.read('projection', 'canvas');
      if (t.frame < back) return { ray };
      const [, contact, exit] = ray;
      const heading = (exit[1] - contact[1]) / 310;
      const y = 441 + heading * 89;
      const startX = variant === 'map' ? 76 : 32;
      const lane = [[startX, y], [238, 407 + heading * 30], [456, 361 + heading * 22]];
      const u = ease((t.frame - back + 8) / (late - back + 17));
      const boat = [lerp(startX, lane[2][0], u), lerp(y, lane[2][1], u) + Math.sin(Math.PI * u) * 12];
      t.write('route', lane);
      return { lane, boat };
    },
    draw(g, t, state) {
      if (t.frame < start || t.frame >= back) { paper(g, t, state); return; }
      g.fillStyle = '#0f2128'; g.fillRect(0, 0, width, height);
      const center = state.ray[0];
      const [cx, cy] = center;
      for (let i = 1; i <= 5; i++) {
        g.strokeStyle = i === 3 ? '#415b59' : '#274246';
        g.lineWidth = 1;
        g.beginPath(); g.arc(cx, cy, i * 42, 0, Math.PI * 2); g.stroke();
      }
      stroke(g, [[32, cy], [width - 32, cy]], '#365357');
      stroke(g, [[cx, 38], [cx, height - 38]], '#365357');
      for (let i = 0; i < 23; i++) {
        const y = 60 + i * 19;
        stroke(g, [[38, y], [i % 4 === 0 ? 55 : 45, y]], '#486261');
      }
      text(g, '02   /   BEARING', 36, 43, '#eac7a0', 14);
      const [, contact, exit] = state.ray;
      stroke(g, [[748, 285], [683, 285], center], '#d29864', 2);
      stroke(g, [center, contact, exit], '#50c4c8', 2.7);
      stroke(g, [contact, exit], '#cde1b9', 0.7);
      disk(g, ...exit, 4.7, pale);
      for (const hit of [point('turn-one'), point('turn-two')]) {
        const elapsed = t.frame - hit;
        if (elapsed < 0 || elapsed >= 22) continue;
        g.strokeStyle = `rgba(255,198,112,${1 - elapsed / 22})`;
        g.beginPath(); g.arc(...exit, 5 + elapsed * 1.27, 0, Math.PI * 2); g.stroke();
      }
      const count = Math.floor((t.frame - start) / 12);
      text(g, `SIGNAL     ${String(count + 1).padStart(2, '0')}`, 36, height - 36, '#94a9a0', 12);
    },
  };
}
