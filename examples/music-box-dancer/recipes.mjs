import { eventIndex, eventEnvelope, ease, clamp } from '../../modules/motion.mjs';
import { prepare as prepareParticles, shapePoints } from '../../modules/fx/particles.mjs';

/** Recipe 1: four exposed paper poses. The supporting foot never translates.
 * Frames/fps are the only clock; events are authored or measured frame onsets.
 */
export function limitedPose({ frame, events, fps }) {
  const index = eventIndex(events, frame);
  const age = index < 0 ? Infinity : (frame - events[index].frame) / fps;
  const next = events[index + 1];
  let pose = 'rest', lift = 0;
  if (age < 0.10) pose = 'contact';
  else if (age < 0.27) pose = 'hold';
  else if (age < 0.50) { pose = 'release'; lift = 1 - ease((age - 0.27) / 0.23); }
  else if (next && (next.frame - frame) / fps < 0.12) { pose = 'anticipate'; lift = 1; }
  return { pose, lift, index, foot: [0, 0], facing: index < 0 || index % 2 === 0 ? 1 : -1 };
}

/** Recipe 2: each onset belongs to one of three voices. Delayed answers stay local;
 * silence returns to held grid positions instead of a perpetual oscillator.
 */
export function groupCounterpoint({ frame, events, fps, groups = 3 }) {
  if (!Number.isInteger(groups) || groups < 1 || groups > 12) throw new Error('groupCounterpoint: groups in [1,12] required');
  return Array.from({ length: groups }, (_, group) => {
    const voice = events.filter((_, i) => i % groups === group).map(e => ({ ...e, frame: e.frame + Math.round(group * fps * 0.08) }));
    const amount = eventEnvelope(voice, frame, { attack: Math.max(1, fps * 0.08), release: fps * 0.48 });
    return { group, amount, travel: (group % 2 ? -1 : 1) * 90 * amount, turn: amount * Math.PI / 2 };
  });
}

/** Recipe 3: key outline -> dispersed paper -> stylized figure -> rosette -> key return.
 * Deliberate full-track holds and asymmetrical durations, not a tiled loop.
 */
export function shapeMatch({ frames, color = '#bf6143', radius = 2.6 }) {
  if (!Number.isInteger(frames) || frames < 2) throw new Error('shapeMatch: at least two frames required');
  const key = [[-170,-45],[-190,-20],[-190,25],[-160,45],[-130,25],[-130,0],[150,0],[150,30],[120,30],[120,0],[80,0],[80,25],[50,25],[50,-15],[-130,-15],[-130,-35],[-170,-45]];
  const figure = [[0,-140],[-20,-125],[-18,-100],[0,-92],[18,-100],[20,-125],[0,-140],[0,-92],[0,-35],[-95,-70],[0,-45],[95,-95],[0,-35],[-65,55],[65,55],[0,-35],[0,55],[-45,125],[0,55],[45,125]];
  const rosette = Array.from({ length: 65 }, (_, i) => { const a = i * Math.PI / 32, r = i % 2 ? 90 : 135; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const authored = [[0,'key'],[0.14,'key'],[0.24,'$scatter'],[0.36,'figure'],[0.48,'figure'],[0.61,'rosette'],[0.72,'rosette'],[0.82,'$scatter'],[0.93,'key'],[1,'key']];
  // Short fixtures still have strictly increasing keys; later entries win collapsed frames.
  const keys = [...new Map(authored.map(([u, shape]) => [Math.round(u * (frames - 1)), shape])).entries()].map(([frame, shape]) => ({ frame, shape }));
  return prepareParticles({ shapes: { key: shapePoints(key), figure: shapePoints(figure), rosette: shapePoints(rosette) }, keys, scatter: [-230, -125, 460, 250], seed: 1979, radius, color });
}

/** Authored visual phrasing, NOT a claim about the recording's formal sections.
 * Canonical analysis sections become anchors only when they cover the entire track.
 */
export function visualPhases(derived, frames) {
  const roles = ['opening', 'solo', 'duet', 'unfold', 'ensemble', 'return', 'coda'];
  const sections = derived.sections ?? [];
  const contiguous = sections.length >= 3 && sections[0].from === 0 && sections.at(-1).to === frames && sections.every((s, i) => Number.isInteger(s.from) && Number.isInteger(s.to) && s.to > s.from && (!i || s.from === sections[i - 1].to));
  if (contiguous) return sections.map((s, i) => ({ from: s.from, to: s.to, role: roles[Math.min(6, Math.floor(i * 7 / sections.length))], anchor: s.name, provenance: 'Authored visual role; canonical section boundary' }));
  const boundaries = [0, .10, .27, .43, .60, .78, .91, 1];
  return boundaries.slice(0, -1).map((u, i) => ({ from: Math.round(u * frames), to: Math.round(boundaries[i + 1] * frames), role: roles[i], provenance: 'Authored proportional visual phrase; not measured musical form' })).filter(s => s.to > s.from);
}

/** Linear scalar track reader with clamped endpoints; canonical keys stay untouched. */
export function energyAt(keys, frame) {
  if (!keys?.length) return 0;
  const right = keys.findIndex(([at]) => at > frame);
  if (right === 0) return clamp(keys[0][1]);
  if (right < 0) return clamp(keys.at(-1)[1]);
  const [a, x] = keys[right - 1], [b, y] = keys[right];
  return clamp(x + (y - x) * (frame - a) / (b - a));
}
