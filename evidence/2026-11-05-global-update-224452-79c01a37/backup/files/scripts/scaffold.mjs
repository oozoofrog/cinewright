import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJSON } from './revisions.mjs';

const starter = `export function prepare({ width, height, frames }) {
  return {
    draw(g, t) {
      const travel = t.frame / Math.max(1, frames - 1);
      g.fillStyle = '#e5b98d';
      g.fillRect(width * (0.18 + travel * 0.58), height * 0.44, height * 0.12, height * 0.12);
    },
  };
}
`;
export async function init(project, { title = '새 작품', frames = 144, fps = 24 } = {}) {
  await fs.mkdir(project);
  await fs.writeFile(path.join(project, 'motion.mjs'), starter);
  await writeJSON(path.join(project, 'work.json'), {
    version: 1, title, size: [960, 540], fps, frames,
    points: { start: 0 }, spans: { whole: [0, frames] },
    layers: [{ id: 'motion', module: 'motion.mjs' }],
  });
}
