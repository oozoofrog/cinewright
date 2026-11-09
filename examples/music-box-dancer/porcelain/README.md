# Porcelain music-box study

A **16–28s study only**, alongside the existing theatre/counterpoint examples.
It replaces the flat pinned figure with sculptural porcelain/enamel forms, layered
scalloped tutu geometry, a planted supporting toe, full arm/leg articulation and
a turn with continuous angular velocity. A fixed three-quarter camera keeps the
silhouette and contact visible. The cylinder/comb gives the music a second,
spatially separate mechanical voice. No background flash, added particle overlay,
source-video imagery, downloaded character or replacement soundtrack is used.

`scene.mjs` uses the installed **Three.js 0.180.0** renderer, LatheGeometry,
TubeGeometry, physical/standard materials, lights, shadows and AnimationMixer.
Animation tracks are baked once from authored source-frame poses; every draw sets
an absolute mixer time. Geometry, choreography and composition are newly authored
for this study, not a claim to a ready-made high-quality character library or
motion capture. Gold lines follow actual cloth/lid surfaces. Three opaque cloth
shells avoid transparency sorting changing the image with seek order.

`choreography.mjs` declares source-frame keys. Selected gesture endpoints use
nearby heuristic onsets from the existing analysis (406, 433, 455, 483, 505, 527,
554, 576, 599, 628, 648); these are authored presentation choices, not confirmed
beats, downbeats, music structure or a directly heard choreography judgment.

## Materialize in an unused private folder

```js
import { materializeStudy } from './examples/music-box-dancer/porcelain/materialize.mjs';
await materializeStudy({ sourceProject: '/absolute/existing/theatre',
  project: '/absolute/unused/porcelain-study' });
```

The utility copies existing local `music/` files byte-for-byte, preserves the
entire original manifest audio descriptor, fps, duration and typed channels,
and refuses an existing destination. It adds a `porcelain.study` span and a
single `scene` layer active only on **[384,672)**. The source project's files are
not edited. Outside the study the scene is deliberately absent; a full-song
render of this study manifest is not an extended treatment.

```sh
node scripts/direction.mjs render /absolute/porcelain-study \
  --span porcelain.study --store /absolute/private-store
node scripts/direction.mjs play /absolute/porcelain-study --store /absolute/private-store
```

The existing freeze mechanism vendors Three's modules and LICENSE; browser
imports use its local import map. Materialization also includes the installed
Three LICENSE. No CDN, requestAnimationFrame loop, delta clock, random cursor,
external model loader, physics history, REEL, DOM or CSS dependency is added.

## Sources and license

- Three.js 0.180.0, already a pinned repository dependency: MIT, copyright
  2010–2025 three.js authors. The exact license ships in each project and frozen
  revision. [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html),
  [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html),
  [r180 license](https://github.com/mrdoob/three.js/blob/r180/LICENSE).
- Existing Cinewright `examples/harbor-landfall/instrument.mjs` establishes the
  offscreen WebGL canvas → Canvas2D composition contract used here.
- Local Showreel reference: the locally installed `showreel` skill;
  `references/engine.md` (WebGL / exact `mixer.setTime` / preserved drawing buffer),
  `references/techniques.md` (time-based evaluation and geometric rhythm),
  `assets/engine/engine.js`, `assets/engine/fx.js` (helper/FX architecture).
  Its LICENSE is MIT, copyright 2026 Minho Hwang (revfactory). These were inspected
  as technique references; **no Showreel source code was copied or imported**.
  Its global FX are coupled to REEL, DOM/CSS and its seconds-based timeline,
  and do not solve character form or articulation. Its whole catalogue is not
  treated as a ready-made asset library.

Tests in `tests/porcelain-study.test.mjs` cover angular continuity, finite poses,
canonical/audio preservation, unused-destination protection, locally frozen
imports, half-open boundaries and pixel identity on reverse/random seeks,
including returning from the final key. Synthetic test silence is transport-only.
Production music/media and rendered samples remain local under `.direction/`.

This is a procedural figurine study, with simplified anatomy and authored motion.
Sampled images and automated checks do not establish artistic acceptance, direct
listening, human accessibility review, or portability of exact pixels across GPUs.
