# Cross-skeleton retarget (v1)

`modules/animation/retarget.mjs` is browser-safe ESM for Three **0.180.0**. It imports only `three`. There is no network loader or addon dependency. The stable expressionist integration factory is:

```js
import {createRetargetPlayer, validateRetargetMotion} from './modules/animation/retarget.mjs';
const playback = createRetargetPlayer(rigged, motionJSON, {
  fps: 24, loop: true, weight: 1, timeScale: 1, rootMotion: 'apply',
});
const {seconds, root} = playback.evaluate(absoluteIntegerFrame);
playback.dispose();
```

`rigged` is the common `createRiggedMesh(asset, material)` result with `mesh`, semantic `bones:Map`, and `skeleton`. Playback restores its captured rest transforms on disposal, owns no mesh/material/GPU resources, rejects fractional frames and mismatching rest hierarchy, and reads no source motion. Instantiate at the target's unanimated rest pose. Add the mesh under any scene placement holder; the motion is local to its rig. Geometry/skeleton belong to the rig factory, material belongs to the caller. Dispose playback before disposing its rig.

## Authoring and local publication

`createRetargeter(sourceRig, targetRig, sourceMotion, options)` returns `{scale,unitRatio,evaluate(frame,playbackOptions),dispose()}`. Its output has complete local `positions`, `quaternions`, extracted `root` displacement, `seconds`, and contact diagnostics. `bakeRetarget(sourceRig,targetRig,sourceMotion,{fps:24,...options})` returns standalone JSON `version:1,kind:'cinewright-motion'`, with target names/semantics/parents/rest transforms and sampled poses. Inclusive last sample enables clamped endpoint playback; looping wraps at `duration`. `validateRetargetMotion(json)` validates the bake before packaging. `createRetargetPlayer` is an alias-compatible original name of `prepareRetargetPlayback`.

Source motion is `{version:1,kind:'cinewright-source-motion',duration:positiveSeconds,tracks:[{bone,property,times,values}]}`. `bone` is an exact source semantic or name. `property` is `quaternion` (normalized XYZW, SLERP) or `position` (XYZ, linear). Times are strictly increasing seconds in `[0,duration]`. Quaternion tracks are complete **local orientations**, not delta Euler angles. Missing tracks use rest. Source non-root translations affect source FK, but target non-root local translations remain rest, preserving limb lengths.

```sh
node scripts/retarget-bake.mjs source.rig.json target.rig.json source.motion.json output.motion.json options.json
```

CLI publishes with an atomic hard link and refuses an existing output. Staging is removed on failure/cancellation. Async file function accepts `AbortSignal`; synchronous computation is bounded and checks cancellation before/after baking. It cannot interrupt the middle of synchronous baking. No global installation or media upload.

Options: `mapping` maps target semantic/name to source semantic/name; otherwise semantic identity is required. `scale:'proportional'` (default) uses left-leg rest length ratio; `scale:'units'` converts `m/cm/mm`; a positive numeric scale is explicit native-coordinate multiplier. `rootMotion:'apply'` includes translated root in local poses; `extract` and `inPlace` leave translation at rest and expose the displacement separately. All three preserve animated root rotation. The playback factory can change root policy on a baked file. Default scale is proportional and fps is 24 for authoring; playback defaults to bake fps. Weight blends the solved pose against rest, and timeScale can be zero or negative. The runtime does not accumulate root displacement over loops.

## Transform and contact model

For source/rest world rotations `S(t), S0`, target rest `T0`, and coordinate rotation `C=Btarget Bsource^-1`, target desired world orientation is `C S(t) S0^-1 C^-1 T0`. Parent inverse converts it to target local quaternion. Both basis matrices must be orthonormal and right-handed. Root displacement is `scale C (p(t)-p0)` added to target rest root. Parent-before-child FK is reconstructed every evaluation; there is no mixer clock or previous-frame dependency.

`contact:{ground:0,maxCorrection:.3,minFlexion:.02,maxFlexion:2.7,pole:[...],windows:{left:[[start,end]],right:[[start,end]]}}` enables two-link knee-plane IK for foot **origins**. Ground is measured along target native `coordinate.up`; lengths and bounds are native target units; pole is a native direction (default target forward). Omit windows for continuous contact, or specify seconds per side (inclusive endpoints). Every configured contact projects vertically toward the ground plane by at most `maxCorrection`. The law of cosines clamps reach and flexion, uses deterministic pole fallback, preserves segment lengths and foot orientation. If unreachable/angle-limited projection would exceed the total correction bound, the entire leg correction is rejected and reported. Diagnostics expose before/after signed ground error, requested/achieved correction, bound rejection, unreachable and solved flexion. Weight blending is after IK: contact residual is recomputed after weight, so weight <1 need not stay grounded.

This is a bounded ground-plane correction, not automatic contact detection, world anchor locking, terrain collision, a pelvis balance solver, or a complete character controller. It does not prevent horizontal skating. Foot-origin error does not measure the whole sole or skin penetration. Quaternion interpolation between baked frames may introduce additional subframe ground error; reported bake metrics apply to sampled frames. No guarantee for arbitrary topology, mirrored coordinates, nonuniform bone scale, disconnected missing semantic chains, fingers/twist bones, compressed clips, DCC formats, or non-root translation retargeting. Common 17-semantic rig JSON is supported; external Three skeletons require conversion to this rig schema first.

## Reuse review and sources

- [Three r180 SkeletonUtils source](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/utils/SkeletonUtils.js): reviewed exact installed r180 and upstream. Single bare `three` import, no relative addon imports. Candidate offers name mapping, offset handling and sequential clip sampling; its clip bake advances an AnimationMixer, and it has no ground-contact solver. This implementation uses its own absolute FK/IK and does not vendor SkeletonUtils. The broad GLTFLoader closure is unnecessary.
- [Three r180 license](https://github.com/mrdoob/three.js/blob/r180/LICENSE): MIT, Three.js authors 2010–2025. Frozen packages already include exact Three core/module builds and LICENSE via the public freeze pipeline. Preserve these when sharing.
- [Ryan Juckett, Analytic Two-Bone IK in 2D (2008-12-29)](https://www.ryanjuckett.com/analytic-two-bone-ik-in-2d/): derivation reference for planar two-link geometry, selected bend direction and unreachable reach intervals. The implementation derives the 3D plane construction independently; no article code or illustrations are copied. Article/sample redistribution rights were not assumed.

Generated independent fixture geometry, rigs, and motions are original CC0-1.0 assets, not imported motion capture. Code retains repository terms. Each demo uses a source with Y-up identity rest rotations, Reed with long limbs and rotated rest bone frames, and Copper with short limbs, wider trunk, A arms, Z-up coordinates and unrelated bone names. These are authored fixtures for retarget evidence, not auto-rig quality evidence. The same two source motions are baked onto both targets through the same public API.

## Reproduction

```sh
node --test tests/retarget-core.test.mjs tests/retarget-publication.test.mjs
node examples/styles/phase02-retarget/build.mjs .direction/aesthetic-toolkit-phase02-2026-11-08/retarget/projects/stride stride
node examples/styles/phase02-retarget/build.mjs .direction/aesthetic-toolkit-phase02-2026-11-08/retarget/projects/salute salute
node examples/styles/phase02-retarget/evidence.mjs
```

Evidence runner acquires the shared GPU lock and exits with status 3 if occupied. Both manifest-v1 films use reusable `modules/animation/retarget-stage.mjs`, actual public rig factory, NPR hatch material, canvas adapter, freeze, frozen jobs renderer and browser playback. It removes the author project from its original path during frozen rendering and checks local-only requests, exact reverse/random/end-start pixel hashes, resource lifecycle, moving decoded video, all-frame PTS and flash screening. Human continuous viewing and aesthetic/accessibility acceptance are unverified. Existing evidence outputs are not overwritten by the flash reporter; use a fresh phase02 run directory to preserve a prior full run.

Contact options are validated at construction, including inactive windows: finite pole vec3, 0≤minFlexion≤maxFlexion≤PI, left/right window arrays with finite ordered seconds inside motion duration. Empty per-side arrays intentionally disable that side. Missing sides retain the continuous-contact default.
