# Phase02 retarget — completed implementation handoff

Completed 2026-11-08. No subordinate agents, shared style edits, Git index/commit/reset/stash/clean/push/PR, deployment, global install or media upload. All work below is within retarget ownership. Original phase01 evidence/media were not changed. Coordinator owns full regression and shared integration; this handoff does not claim its result. Human continuous viewing and aesthetic/accessibility acceptance are **unverified**.

## Stable coordinator integration

Keep the name already used by expressionist-space: **`createRetargetPlayer(rigged, motionJSON, options)`**, exported by `modules/animation/retarget.mjs`. **`prepareRetargetPlayback` is the same function alias**, not a second protocol. Both are stable.

```js
import {createRetargetPlayer, validateRetargetMotion} from '../../animation/retarget.mjs';
const rigged = createRiggedMesh(await api.json(s.rig), materials[s.material]);
const player = createRetargetPlayer(rigged, await api.json(s.motion), {
  fps: spec.fps, ...s.playback,
});
holder.add(rigged.mesh);
// Every evaluate(t), using the same absolute/exposure policy as the object:
player.evaluate(frameFor(s, t) ?? 0);
// Dispose in this order:
player.dispose(); rigged.dispose();
```

`rigged` is exactly `{mesh:SkinnedMesh,bones:Map<semantic,Bone>,skeleton,dispose}` from the coordinator factory. The factory is tested against the actual `modules/animation/auto-rig.mjs`, not only the independent fixture loader. Options are `fps`, `loop`, `weight`, `timeScale`, `rootMotion:'apply'|'extract'|'inPlace'`. `evaluate(integerFrame)` returns `{seconds,root:[x,y,z]}`. It applies complete local pose, refreshes mesh/skeleton matrices, restores initial rest on idempotent dispose, and owns no GPU objects. Instantiate in target rest. It rejects rest-parent/position/quaternion incompatibility.

Motion JSON is `version:1,kind:'cinewright-motion'`; `validateRetargetMotion(json)` checks the publication header/arrays. It contains **matching target bone names**, semantic/parent/rest transforms, root displacement, fps/duration and inclusive pose samples, without a source clip URL, source track or fixture generator dependency. Frozen package audits assert exact target names and no authored-source tracks. Main module imports only `three`; no vendor addon closure is needed.

Coordinator says shared `object.rig`, `object.motion`, optional `object.playback`, materialize prevalidation and mutual-rest checks are already integrated. Exact shared contract to retain:

```json
{"id":"performer","rig":"assets/copper.rig.json","motion":"assets/copper.motion.json","playback":{"loop":true,"weight":1,"timeScale":1,"rootMotion":"apply"},"material":"ink"}
```

`collectAssets` should expose rig and motion paths as local assets, validation must invoke `validateRig`, `validateRetargetMotion`, then factory rest compatibility against the actual chosen target before publication. Materializer dependency closure needs `animation/retarget.mjs` and `animation/auto-rig.mjs`; the comparison-stage module is optional. Existing scene defaults remain unchanged. Reference/catalog/skill integration should point to `references/styles/retarget.md` and advertise **common-rig JSON motion bake plus bounded ground-plane IK**, not arbitrary mocap/DCC support or automatic contact detection. No other shared edits are requested from this child.

## Delivered implementation and authoring

- `modules/animation/retarget.mjs`: semantic and explicit-name mapping, source/target rest world orientation correction, orthonormal right-handed coordinate conversion, unit or proportional/custom scale, root apply/extract/inPlace, random-access frame sampling and blend/negative timeScale, bounded two-bone knee-plane IK, contact diagnostics, source-independent bake and browser factory.
- `modules/animation/retarget-stage.mjs`: reusable manifest-v1 comparison module calling actual public rig/player/NPR hatch/Canvas adapter APIs; fully local inputs and resource disposal.
- `scripts/retarget-bake.mjs`: file API and Node CLI, atomic no-overwrite publication, staging cleanup and AbortSignal checks.
- `examples/styles/phase02-retarget/{fixtures,build,evidence,audit}.mjs`: independent generated static skinned meshes/source motions, local package authoring, public renderer and browser evidence, frozen closure/license audit. Fixture surfaces are original CC0-1.0. These demonstrate retargeting, not automatic rig inference.
- `tests/retarget-core.test.mjs`, `tests/retarget-publication.test.mjs`: **13 passing focused tests**.
- `references/styles/retarget.md`: schemas, equations, units, exact API, reuse decisions, licenses and limits.

Authoring API: `createRetargeter(sourceRig,targetRig,sourceMotion,options)` and `bakeRetarget(...)`. Source tracks use complete local normalized quaternion/position keys and seconds. All rig source data are immutable. Retarget desired world rotation is `C S(t) S0^-1 C^-1 T0`; parent inverse recovers local target pose. Target limb translations are preserved; proportional root scale uses rest left-leg length. IK clamps reach/flexion without stretching and preserves foot orientation. A solution exceeding the configured total movement bound is rejected and diagnosed.

## Actual artifacts and metrics

Local editable standard manifest packages:

- `.direction/aesthetic-toolkit-phase02-2026-11-08/retarget/projects/stride/`
- `.direction/aesthetic-toolkit-phase02-2026-11-08/retarget/projects/salute/`

Each contains `work.json`, copied reusable modules, and `assets/{source,reed,copper}.{rig,motion}.json`, plus LICENSE and measured metrics. No authored-source tracks are necessary for replay. Every rig has 17 bones and 2,739 skin vertices; Reed has longer limbs, unrelated names and rotated rest frames; Copper has shorter limbs, a wider body/A arms, unrelated names and Z-up native axes. Both source motions are applied to both targets (four distinct retarget bakes), plus source reference playback.

Videos and reports are in `evidence/2026-11-08-aesthetic-toolkit-phase02/retarget/`:

| File | Actual video | Frozen revision |
| --- | --- | --- |
| `stride.mp4` | 960×540, 24 fps, 192 frames, 8.000 s | `2e6f03125d583104b85df3da5df70d09289ba1d476db0bf513f8952fc421dc63` |
| `salute.mp4` | 960×540, 24 fps, 216 frames, 9.000 s | `a99e8a0c4eab2d2007358f290c034eb85b7eb08df62c389d3be311b9cfc71c98` |

Contact metrics use sampled foot **origins** at a target-native ground height of 0.14 m, continuous contact, 0.35 m correction bound, full weight. They do not measure the entire sole or guarantee no skin penetration/skating.

| Source motion → target | Root scale | RMS error before | RMS error after | Max correction |
| --- | ---: | ---: | ---: | ---: |
| Stride → Reed | 1.420061 | 0.041273 m | 2.74e-16 m | 0.091553 m |
| Stride → Copper | 0.695765 | 0.023351 m | 9.71e-16 m | 0.051396 m |
| Salute → Reed | 1.420061 | 0.139496 m | 2.40e-16 m | 0.234445 m |
| Salute → Copper | 0.695765 | 0.071013 m | 1.10e-15 m | 0.120214 m |

All four bakes had zero unreachable or bound-rejected samples; separate tests exercise unreachable, coincident, pole degeneracy, knee flexion limits, zero-length rejection, and rejection under an intentionally impossible contact target. Actual coordinator-created mesh foot positions agree with recorded residuals within 1e-6 m.

## Verification receipts

- `cpu-tests.txt`: 13/13 focused tests, including rest/axis/name conversion, unit/proportional/root policies, IK geometry/bounds, exact same-frame pose and skin equality across direct/reverse/repeat/end-start, weight 0, negative timeScale, JSON roundtrip with removed source data, target rest mismatch, publication failure/no-overwrite/cancellation and cleanup.
- `evidence.json`, `render.log`: both movies rendered through frozen public `jobs.mjs`; original author project path was renamed away for the whole frozen render/browser check and restored in finally. Browser used localhost-only requests, no page errors. All 408 PTS match `frame/24`; final PTS are 7.958333 and 8.958333. Six reference pixel hashes per movie are identical under reverse, repeated and end→start queries.
- `stride-flash.json`, `salute-flash.json`: every decoded frame screened by existing public flash tool; 0 flagged windows and 0 qualifying large-area transitions. This reduced-resolution screen is not human accessibility acceptance or safety certification.
- Actual MP4 browser playback advanced ~0.89 s, decoded 20 frames, dropped 0 in the short automated playback check; near-end seek and reset to zero passed. This is **not** a claim of continuous human viewing.
- `package-audit.json`: all target names match; original source tracks absent; frozen retarget/stage modules match current live bytes; resources reach **0 geometries / 0 textures** after disposal, from 4 geometries / 7 textures / 10,598 rendered triangles. Two prepare/dispose cycles showed stable counts. Browser evaluate time for all three characters was 0.014–0.019 ms/frame in measured loops (not a rendering-performance guarantee). JSON bake assets are 60–222 KB; decoded JS heap was not profiled.
- `sources.json`: exact Three version 0.180.0, SkeletonUtils and MIT LICENSE SHA256, bare `three`-only import closure, author IK reference and generated asset license. SkeletonUtils was inspected and not adopted. No author article code/assets were copied.
- `stride-frame053.png`, `salute-frame053.png`: actual rendered frame samples inspected for complete visible comparison composition. No aesthetic acceptance inferred from still inspection.

Browser: Chromium 157.0.8103.38 with software WebGL via existing public browser launcher. FFmpeg 9.0.2; Node v26.12.1. Shared GPU lock was acquired with an owner and released in finally for both rendering and resource audit. All own GPU work finished before coordinator's requested regression quiet period; no new GPU work is pending.

Commands actually run:

```sh
node --test tests/retarget-core.test.mjs tests/retarget-publication.test.mjs
node examples/styles/phase02-retarget/build.mjs .direction/aesthetic-toolkit-phase02-2026-11-08/retarget/projects/stride stride
node examples/styles/phase02-retarget/build.mjs .direction/aesthetic-toolkit-phase02-2026-11-08/retarget/projects/salute salute
node examples/styles/phase02-retarget/evidence.mjs
node examples/styles/phase02-retarget/audit.mjs
```

The initial CPU run exposed ~1e-16 floating drift at negative-loop sample boundaries; exact near-integer bake sample snapping fixed reverse equality. An audit regex initially counted a JSDoc import example; stripping comments fixed source-import evidence. Final runs above pass; no implementation/test failure remains known.

## Material limits

Ground projection is explicitly authored continuous/windows contact, not automatic foot-contact inference or horizontal anchor locking. Bone lengths and knee plane are handled analytically; no pelvis correction, obstacle collision, foot sole collision, human joint envelope or skin-volume preservation. Fractional bake interpolation and weight <1 can introduce residual ground error. Source non-root translation is not copied into target limb lengths. Loop root translation wraps without accumulating travel. Only explicit right-handed, positive unit-scale common rig JSON is supported; arbitrary Three skeletons require schema conversion. No BVH/FBX/glTF ingestion, arbitrary topology or mirrored/nonuniform bone-scale promise. Human aesthetics and accessibility acceptance remain open for coordinator/user review.
