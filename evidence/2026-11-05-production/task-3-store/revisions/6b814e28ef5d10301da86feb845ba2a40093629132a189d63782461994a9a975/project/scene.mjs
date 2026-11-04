import { prepare as prepareArtwork } from './modules/artwork.mjs';

// 이 작품의 작은 장면 코드다. 모든 동작 시간은 생성된 span/exposure에서 읽는다.
export async function prepare(api, config) {
  const phases = config.phases;
  const roomArt = {}, keyArt = {}, handArt = {};
  for (const [id, phase] of Object.entries(phases)) {
    roomArt[id] = { asset: 'assets/room.svg', placement: { fit: 'contain' } };
    keyArt[id] = { asset: 'assets/keys.svg', placement: { anchor: [20, 37], at: config.keyAt, scale: 1 } };
    const origin = phase.hand === 'open' ? 200 : 0;
    handArt[id] = {
      asset: 'assets/hand-atlas.svg', crop: [origin, 0, 200, 200],
      placement: { anchor: [origin + 100, 160], at: config.handAt, scale: 1 },
    };
  }
  const room = config.role === 'scene' ? await prepareArtwork(api, { artworks: roomArt }) : null;
  const keys = config.role === 'scene' ? await prepareArtwork(api, { artworks: keyArt }) : null;
  const hand = config.role === 'scene' ? await prepareArtwork(api, { artworks: handArt }) : null;
  const progress = (name, frame) => {
    const [from, to] = api.span(name);
    const slot = config.exposure.find(entry => entry.from === from && entry.to === to);
    if (!slot) throw new Error(`stillcuts: motion span ${name} must match a compiled exposure`);
    const last = from + Math.floor((to - from - 1) / slot.every) * slot.every;
    return api.sample([[from, 0], [Math.max(from + 1, last), 1]], frame, 'linear');
  };
  function state(t) {
    const phase = phases[t.value];
    if (!phase) throw new Error(`stillcuts: unknown phase ${String(t.value)}`);
    let lowering = 0;
    if (phase.motion === 'poised') lowering = 1;
    if (phase.motion === 'lower') lowering = (1 - progress(config.loweringSpan, t.exposed)) ** 2;
    const withdrawal = phase.motion === 'withdraw' ? progress(config.withdrawalSpan, t.exposed) : 0;
    const travel = withdrawal * withdrawal * (3 - 2 * withdrawal);
    return {
      phase,
      keyOffset: config.lowerOffset.map(value => value * lowering),
      handOffset: config.lowerOffset.map((value, index) => value * lowering + config.exitOffset[index] * travel),
      lightX: api.sample([[0, config.light.fromX], [api.frames - 1, config.light.toX]], t.frame, 'linear'),
    };
  }
  return {
    evaluate: state,
    draw(g, t, supplied) {
      const s = supplied ?? state(t);
      const { scale, focus, at } = s.phase.view;
      g.save();
      try {
        g.translate(at[0], at[1]);
        g.scale(scale, scale);
        g.translate(-focus[0], -focus[1]);
        if (config.role === 'light') {
          // 벽의 반사광만 노출 시간과 독립적으로 변한다. 카메라는 고정한다.
          g.fillStyle = `rgba(255, 246, 214, ${config.light.opacity})`;
          g.beginPath();
          g.moveTo(s.lightX, 46);
          g.lineTo(s.lightX + 62, 46);
          g.lineTo(s.lightX + 105, 253);
          g.lineTo(s.lightX + 35, 253);
          g.closePath();
          g.fill();
          return;
        }
        room.draw(g, t);
        if (s.phase.keys) {
          const height = Math.abs(config.lowerOffset[1]);
          g.fillStyle = `rgba(56, 46, 36, ${0.07 + 0.11 * (1 + s.keyOffset[1] / height)})`;
          g.beginPath();
          g.ellipse(config.keyAt[0] + 31, config.keyAt[1] + 1, 53, 2.5, 0, 0, Math.PI * 2);
          g.fill();
          g.save();
          g.translate(...s.keyOffset);
          keys.draw(g, t);
          g.restore();
        }
        if (s.phase.hand) {
          g.save();
          g.translate(...s.handOffset);
          hand.draw(g, t);
          g.restore();
        }
      } finally {
        g.restore();
      }
    },
  };
}
