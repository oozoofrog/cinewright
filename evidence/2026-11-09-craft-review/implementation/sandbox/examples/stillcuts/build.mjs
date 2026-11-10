import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileCuts } from '../../modules/cuts.mjs';
import { examples, assets } from './source.mjs';
import { compileProject } from './rebuild.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const writeJSON = (file, data) => fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);

// 이 고정 검증 입력은 편집 중인 A/B와 독립적이다. 예제를 쓰기 전에 검증한다.
const fixture = JSON.parse(await fs.readFile(path.join(root, 'fixtures/boundary-input.json'), 'utf8'));
const before = fixture.source;
const after = structuredClone(before);
const index = before.cutSpec.boundaries.findIndex(boundary => boundary.name === fixture.edit.boundary);
if (index < 0) throw new Error(`stillcuts boundary fixture: unknown boundary ${fixture.edit.boundary}`);
const from = before.cutSpec.boundaries[index].frame;
after.cutSpec.boundaries[index].frame = fixture.edit.frame;
const to = after.cutSpec.boundaries[index].frame;
const changes = from === to ? [] : [{ field: `cutSpec.boundaries[${index}].frame`, from, to }];
if (changes.length === 0) throw new Error('stillcuts boundary fixture: edit must change the boundary frame');
const beforeResult = { source: before, ...compileProject(before, compileCuts) };
const afterResult = { source: after, ...compileProject(after, compileCuts) };

for (const [name, source] of Object.entries(examples)) {
  const project = path.join(root, name);
  await fs.mkdir(path.join(project, 'assets'), { recursive: true });
  await fs.mkdir(path.join(project, 'modules'), { recursive: true });
  for (const asset of assets) await fs.copyFile(path.join(root, 'assets', asset), path.join(project, 'assets', asset));
  for (const helper of ['cuts.mjs', 'artwork.mjs']) {
    await fs.copyFile(path.join(root, '../../modules', helper), path.join(project, 'modules', helper));
  }
  for (const file of ['scene.mjs', 'rebuild.mjs']) await fs.copyFile(path.join(root, file), path.join(project, file));
  const { work, derived } = compileProject(source, compileCuts);
  await writeJSON(path.join(project, 'source.json'), source);
  await writeJSON(path.join(project, 'work.json'), work);
  await writeJSON(path.join(project, 'cuts.json'), derived);
  console.log(JSON.stringify({ example: name, project, frames: work.frames, seconds: work.frames / work.fps }));
}
// 세 번째 작품이 아닌 한 경계의 입력/출력 근거다. 실제 변경값을 보고한다.
await writeJSON(path.join(root, 'fixtures/boundary-before.json'), beforeResult);
await writeJSON(path.join(root, 'fixtures/boundary-after.json'), afterResult);
console.log(JSON.stringify({ boundaryFixture: `${fixture.edit.boundary}: ${from} -> ${to}`, changedSourceFields: changes.length, changes }));
