import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// compiler를 주입하면 저장소 build에서도 같은 생성 경로를 쓴다.
// 복사한 프로젝트의 CLI 실행은 그 프로젝트 안의 cuts.mjs만 불러온다.
export function compileProject(source, compileCuts) {
  if (source.manifest.frames !== source.cutSpec.frames) throw new Error('stillcuts: manifest.frames and cutSpec.frames must match');
  const derived = compileCuts(source.cutSpec);
  const config = { ...source.scene, phases: source.cutSpec.artworks, exposure: derived.exposure };
  const work = {
    ...source.manifest, points: derived.points, spans: derived.spans,
    layers: [
      { id: 'tableau', module: 'scene.mjs', exposure: derived.exposure, config: { ...config, role: 'scene' } },
      { id: 'window-light', module: 'scene.mjs', exposure: derived.exposure, config: { ...config, role: 'light' } },
    ],
  };
  return { work, derived };
}

const invoked = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (invoked) {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  const { compileCuts } = await import('./modules/cuts.mjs');
  const source = JSON.parse(await fs.readFile(path.join(directory, 'source.json'), 'utf8'));
  const { work, derived } = compileProject(source, compileCuts);
  await fs.writeFile(path.join(directory, 'work.json'), `${JSON.stringify(work, null, 2)}\n`);
  await fs.writeFile(path.join(directory, 'cuts.json'), `${JSON.stringify(derived, null, 2)}\n`);
  console.log(JSON.stringify({ project: directory, frames: work.frames, points: work.points, spans: work.spans }, null, 2));
}
