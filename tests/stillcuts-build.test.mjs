import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { examples } from '../examples/stillcuts/source.mjs';

const repository = fileURLToPath(new URL('..', import.meta.url));
const runs = path.join(repository, '.direction/test-runs');
await fs.mkdir(runs, { recursive: true });
const run = await fs.mkdtemp(path.join(runs, 'stillcuts-build-'));
console.log(`Stillcuts build records: ${run}`);
const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const authored = Object.fromEntries(examples.a.cutSpec.boundaries.map(({ name, frame }) => [name, frame]));

for (const scenario of [
  { name: 'unchanged', edit: null, touch: authored.touch, release: authored.release },
  { name: 'touch-equals-fixture-target', edit: ['touch', 66], touch: 66, release: 72 },
  { name: 'release-before-fixture-target', edit: ['release', 64], touch: 60, release: 64 },
]) {
  test(`real stillcuts build preserves valid ${scenario.name} input and reports a distinct boundary fixture`, async () => {
    const copy = path.join(run, scenario.name);
    const example = path.join(copy, 'examples/stillcuts');
    await fs.mkdir(path.dirname(example), { recursive: true });
    await fs.cp(path.join(repository, 'examples/stillcuts'), example, { recursive: true });
    await fs.mkdir(path.join(copy, 'modules'), { recursive: true });
    for (const helper of ['cuts.mjs', 'artwork.mjs']) {
      await fs.copyFile(path.join(repository, 'modules', helper), path.join(copy, 'modules', helper));
    }
    await fs.mkdir(path.join(copy, 'tmp'));
    if (scenario.edit) {
      const [boundary, frame] = scenario.edit;
      // Regression cases start from the fixed valid fixture, independently of authored edits.
      await fs.appendFile(path.join(example, 'source.mjs'),
        `\nconst fixture = JSON.parse(await (await import('node:fs/promises')).readFile(new URL('./fixtures/boundary-input.json', import.meta.url), 'utf8'));\n`
        + `examples.a = structuredClone(fixture.source);\n`
        + `examples.a.cutSpec.boundaries.find(boundary => boundary.name === ${JSON.stringify(boundary)}).frame = ${frame};\n`);
    }
    const result = spawnSync(process.execPath, [path.join(example, 'build.mjs')], {
      cwd: copy, encoding: 'utf8', env: { ...process.env, TMPDIR: path.join(copy, 'tmp') },
    });
    await fs.writeFile(path.join(copy, 'build.stdout'), result.stdout);
    await fs.writeFile(path.join(copy, 'build.stderr'), result.stderr);
    assert.equal(result.status, 0, result.stderr);

    const work = await readJSON(path.join(example, 'a/work.json'));
    assert.equal(work.points.touch, scenario.touch);
    assert.equal(work.points.release, scenario.release);
    assert.deepEqual(work.spans.lowering, [scenario.edit ? 36 : authored.lower, scenario.touch]);
    assert.deepEqual(work.spans['contact-hold'], [scenario.touch, scenario.release]);
    const source = await readJSON(path.join(example, 'a/source.json'));
    assert.equal(source.cutSpec.boundaries.find(boundary => boundary.name === 'touch').frame, scenario.touch);
    assert.equal(source.cutSpec.boundaries.find(boundary => boundary.name === 'release').frame, scenario.release);

    // The fixed demonstration must remain valid and nonempty after either ordinary edit.
    const before = await readJSON(path.join(example, 'fixtures/boundary-before.json'));
    const after = await readJSON(path.join(example, 'fixtures/boundary-after.json'));
    assert.equal(before.work.points.touch, 60);
    assert.equal(after.work.points.touch, 66);
    assert.deepEqual(before.work.spans.lowering, [36, 60]);
    assert.deepEqual(after.work.spans.lowering, [36, 66]);
    assert.deepEqual(before.work.spans['contact-hold'], [60, 72]);
    assert.deepEqual(after.work.spans['contact-hold'], [66, 72]);
    assert.equal(before.derived.exposure.find(slot => slot.value === 'descending').to, 60);
    assert.equal(after.derived.exposure.find(slot => slot.value === 'descending').to, 66);
    assert.equal(after.derived.exposure.find(slot => slot.value === 'contact').from, 66);
    const restored = structuredClone(after.source);
    restored.cutSpec.boundaries.find(boundary => boundary.name === 'touch').frame = 60;
    assert.deepEqual(restored, before.source, 'the fixture changes exactly one source field');

    const receipt = result.stdout.trim().split('\n').map(line => JSON.parse(line)).find(item => item.boundaryFixture);
    assert.ok(receipt, 'the real build must report the fixture it generated');
    assert.equal(receipt.boundaryFixture, 'touch: 60 -> 66');
    assert.equal(receipt.changedSourceFields, 1);
  });
}

for (const example of ['a', 'b']) {
  for (const artwork of ['ordinary-contact', '__proto__']) {
    test(`copied stillcuts ${example} draws all three artworks after editing the source ID to ${artwork}`, async () => {
      const project = path.join(repository, 'examples/stillcuts', example);
      const source = await readJSON(path.join(project, 'source.json'));
      const original = source.cutSpec.cuts.find(cut => cut.name === 'contact-hold').artwork;
      source.cutSpec.artworks = Object.fromEntries(Object.entries(source.cutSpec.artworks)
        .map(([id, phase]) => [id === original ? artwork : id, phase]));
      for (const cut of source.cutSpec.cuts) {
        if (cut.artwork === original) cut.artwork = artwork;
      }
      const { compileProject } = await import(pathToFileURL(path.join(project, 'rebuild.mjs')));
      const { compileCuts } = await import(pathToFileURL(path.join(project, 'modules/cuts.mjs')));
      const { prepare } = await import(pathToFileURL(path.join(project, 'scene.mjs')));
      const work = JSON.parse(JSON.stringify(compileProject(source, compileCuts).work));
      const config = work.layers[0].config;
      const exposure = config.exposure.find(slot => slot.value === artwork);
      assert.ok(Object.hasOwn(config.phases, artwork));
      assert.equal(config.phases[artwork].keys, true);
      assert.equal(config.phases[artwork].hand, 'grip');

      const record = path.join(run, `own-artwork-${example}-${artwork}`);
      await fs.mkdir(record);
      await fs.writeFile(path.join(record, 'source.json'), `${JSON.stringify(source, null, 2)}\n`);
      await fs.writeFile(path.join(record, 'work.json'), `${JSON.stringify(work, null, 2)}\n`);
      const sizes = { 'assets/room.svg': [640, 360], 'assets/keys.svg': [120, 40], 'assets/hand-atlas.svg': [400, 300] };
      // Image/Canvas stand-ins isolate the copied scene's own-key lookup; this is not a native pixel test.
      const scene = await prepare({
        width: work.size[0], height: work.size[1], frames: work.frames,
        image: async asset => ({ asset, naturalWidth: sizes[asset][0], naturalHeight: sizes[asset][1] }),
        span: name => work.spans[name], sample: () => 0,
      }, config);
      const draws = [];
      const context = {
        save() {}, restore() {}, translate() {}, scale() {}, beginPath() {}, ellipse() {}, fill() {},
        drawImage(image, ...rectangles) { draws.push({ asset: image.asset, rectangles }); },
      };
      try {
        scene.draw(context, { frame: exposure.from, exposed: exposure.from, value: exposure.value });
      } finally {
        await fs.writeFile(path.join(record, 'draws.json'), `${JSON.stringify(draws, null, 2)}\n`);
      }
      assert.deepEqual(draws.map(draw => draw.asset), ['assets/room.svg', 'assets/keys.svg', 'assets/hand-atlas.svg']);
      assert.ok(draws.every(draw => draw.rectangles.length === 8 && draw.rectangles.every(Number.isFinite)));
    });
  }
}
