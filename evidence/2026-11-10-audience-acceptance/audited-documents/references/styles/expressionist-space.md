# Expressionist space — authored 3D print grammar

Use `expressionist-space` for a threshold, withheld arrival, a threatening corridor or an unfamiliar organic interior where perspective and cast shadow carry the event. It uses real rigid meshes and cameras with a four-density UV hatch atlas, a toon light ramp and selectively authored lines. It is unsuitable for photoreal glass, physically wet ink, automatically traced animation or arbitrary skinned-character engraving.

The narrow station lets a **graphic shadow arrive first**, frames 24–72; the rigid traveler appears at 88 and the train at 112. The laboratory uses broad curved leaves, a moving directional light, independent specimen clip exposure and a continuous camera. Both use the same renderer with replaceable JSON. These are original scenes, not copied film assets. No public renderer branches on a title or demo ID.

## Real entry and data contract

```js
import {prepare,validateScene} from './modules/styles/expressionist-space/index.mjs';
validateScene(scene); // synchronous, no mutation, Node compatible
const layer = await prepare(api, {scene}); // or {sceneFile:'assets/scene.json'}
const state = layer.evaluate(t);
layer.draw(g, t, state);
layer.dispose(); // idempotent, includes renderer/context and clip resources
```

Scene v1 has `style`, `title`, `size`, `fps`, `frames`, `seed`, `materials`, `camera`, `lights`, `objects`; optional `fog`, `dust`, `eventBinding`, `projectBinding`. Copy a recipe from `recipes/styles/expressionist-space/`. Coordinates are right-handed, +Y up, metres; rotations XYZ radians. Canvas projection is logical author pixels, origin top left. Material colors are sRGB hex; lighting works in linear space, NoToneMapping, one sRGB output conversion. Hatch atlas/gobo/ramp are linear data. The transparent WebGL2 canvas uses premultiplied alpha and composites through `drawImage`. MP4 remains opaque H.264 yuv420p.

`objects` accepts a unique `id`, `material`, `geometry` or `asset` or `shadow`, position/rotation/scale, optional `keys`, `visible:[from,to)`, `outline`, `lines`, `deform`, `clip`, `time`, `exposure`. Geometry types are box/sphere/cylinder/torus (Three constructor `args`), lathe (`points:[radius,y]`, `segments`), leaf (`length,width,bend,segments`) and buffer (`positions,uv,indices`). UV is mandatory on imported meshes. Use baked local buffers for arbitrary sets. `asset` is an embedded uncompressed local `assets/*.glb`; every required extension and external URI is rejected. Supplied GLBs have original UVs, rigid parts and named animation clips. Automatic UV remains unsupported. Phase02 adds an explicit local rig/motion JSON route described in [auto-rig](auto-rig.md) and [retarget](retarget.md).

Keys are ordered `{frame,position?,rotation?,scale?,target?,intensity?,opacity?}`; fields must correspond between keys. Linear interpolation clamps at endpoints. `visible` is half-open. Each object's `time:'frame'|'exposed'` selects the runtime source; its `exposure:{every,from,track}` quantizes that source independently. Camera/light default to output frame. No RAF delta, prior framebuffer or accumulated physics is used. `clip` selects `name` or `index`, `loop`, `weight`, `timeScale` (including negative), and its own exposure. Mixer evaluation resets the action and seeks absolute time. Clip owns mixer only; style owns loaded geometry/material/texture resources.

The camera is perspective (`fov` degrees) or orthographic (`height` world units), plus `position,target,near,far,keys,exposure`. When the [root implementation and inspection conditions](../../SKILL.md#제작과-검토) apply—explicitly required motion/contact/material or investigation of an actually observed original-speed break in 관객 수용—keep dolly movement restrained and avoid rotating every object when a single light can reveal its plane. These are authoring means, not a default order or acceptance condition for every work. Use the station's clear floor seams and opening to establish perspective before changing space. Leaf width, bend and longitudinal UVs should agree with the authored veins.

## Materials, lights, lines and effects

- `createHatchMaterial({color,ink,tones,hatch,strength,doubleSide},atlas)` returns `{material,dispose}`. Tones: ordered 2–8 values in [0,1]. Hatch: 0–32 repeats per UV span (5 default); strength [0,1]. `createHatchAtlas()` builds four nested tiles. Density follows lit linear luminance and interpolates atlas bands. Derivative suppression reduces undersampled marks; it is not a full tonal-art-map LOD system. The material retains Three toon lights, shadow maps and depth fog. Hatch follows mesh UV under rotation, not screen coordinates.
- `createRigidOutline(mesh,{width,color})` normal-extrudes a BackSide shell, width in world units (0–.2, typically .018–.035); caller owns shared geometry. It is selectable per object, does not solve open-mesh seams/intersection gaps and is not for skinned meshes. `createInternalLines(points,{color})` is an authored local vec3 polyline; WebGL lines are nominally one output pixel. Internal lines do not automatically follow a deformation field; author them for a rigid surface or deform/bake them separately.
- `createLightRig(scene,specs)` supports ambient, directional and spot lights. `shadow:true` uses actual depth-map shadowing (256/512/1024/2048 map size); spot `gobo:true` projects a generated barred light mask. A gobo modulates illumination. `createShadowOverlay({points,color,opacity})` instead creates a convex local-XY polygon with depth testing and no depth write; it is an authored graphic shadow. It deliberately can precede its actor. It is not a physical shadow or arbitrary-surface decal projector.
- `prepareDeformation(geometry,{amplitude,frequency,phase})` captures rest positions and evaluates world-time bend absolutely. `createDust({count,seed,bounds,life,speed,color})` uses one instanced mesh with deterministic seed/id/age positions; no stateful simulation. `setDepthFog(scene,{color,near,far})` uses camera-space depth, opaque material fog, not volumetric scattering. Dust is inexpensive geometric motes, not smoke.
- `createCanvasAdapter(api)` requires WebGL2, dimensions 16–4096. It exposes `renderer`, `draw`, `getStats`, `dispose`; fails explicitly without a browser canvas/context. It owns its renderer/context only. Materials, textures, geometries, shadow rigs, instanced mesh and mixer owners each dispose their allocations. Public style cleans its own partial preparation failure.

## Rebuild and validate

```sh
node examples/styles/expressionist-space/author.mjs
node examples/styles/expressionist-space/effects.mjs
node examples/styles/expressionist-space/build.mjs "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/station" station
node examples/styles/expressionist-space/build.mjs "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/laboratory" laboratory
node examples/styles/expressionist-space/build.mjs "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/portrait" portrait
node examples/styles/expressionist-space/build.mjs "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/effects" effects
node examples/styles/expressionist-space/build-mixed.mjs "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/mixed"
node --test tests/expressionist*.test.mjs
node examples/styles/validate.mjs "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/station" "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/store" "$PWD/evidence/aesthetic-toolkit-2026-11-08/C/station"
```

Use an unused build destination; `build.mjs --update` explicitly updates unchanged generated files through coordinator materializer. Run validation likewise for laboratory, effects and mixed (full 540p/1080p jobs); use `--no-video` for a portrait browser/seek check. Validator acquires the common mkdir GPU lock and releases it in `finally`; do not remove another process's lock or poll it. The addon collector returns bytes only and pins installed Three 0.180.0. Frozen project has loader, BufferGeometryUtils and MIT LICENSE; the runtime supplies the pinned core import map. No global install, CDN or compression decoder is needed.

## Mixed composition

`build-mixed.mjs` materializes the laboratory then adds a Canvas annotation layer. `$data` produces `lamp.event` (`number`, space `unit`) for both style and annotation; style's `eventBinding:{channel:'lamp.event',light:1,gain:1}` reads it and multiplies that light's keyed intensity. `projectBinding:{object:'specimen',channel:'specimen.screen'}` publishes the object's actual camera-projected origin as `vec2` in `canvas` pixels. The later annotation layer reads it and draws a ring/leader. Projection may be outside the viewport; it does not imply visibility or depth access. GPU state, matrices and textures never enter channels. For A/B composition use these same number/vec2 bindings and existing z/blend/mask/opacity contracts.

## Success/failure frames and limits

Station: frame 0 establishes the narrow threshold; 72 should show an extended shadow while no actor/train is visible; 104 should show the traveler still separate from the train; 191 should read as arrival at rest. Failure: shadow moves away from viewer, dark actor merges with wall, or a ceiling beam cuts the threshold. Laboratory: 0/96/191 should show attached hatching and veins on rotating leaves under the changed light. Failure: dense hatch erases the curved silhouette, line seams appear in open shells, or the bright light flattens all tones. Portrait re-frames the plant; it is not an automatic responsive layout. `effects.json` isolates flat/curved hatch, outlines, rest deformation and reverse local clip. Evidence report records actual checks; these criteria alone are not evidence of human acceptance. Judge form, silhouette, tonal values, composition, information density and character consistency directly in still frames. Use the frame examples for form, boundary and compositing regressions, not the experience of time. If original-speed viewing and listening are unavailable, hand unresolved temporal observations over as 확인 지점 with their locations and continue the agreed production scope.

Limits: 256 objects, 64 materials, 8 lights, 4096 dust instances, 50k vertices per authored buffer, 128 lines/object and 4096 points/line; limits prevent accidental expansion, not guarantee realtime. Prefer <100 meshes, <200 dust, one shadow light at 1024. Rigid-outline width changes with perspective and output resolution; internal lines are one pixel. UV seams, coplanar depth artifacts and shadow bias can remain; use author review at both resolutions. Clip root translation plus authored placement compose. Embedded uncompressed GLB skins and local rig/motion bakes now support actual skinning, UV hatch and skinned outline. Contact correction belongs to the offline retarget bake; GLB clip playback does not infer contacts. Skinned rest deform/internal lines, advanced blending, external images, arbitrary extensions, path tracing, temporal filtering, cloth and volumetric fog remain unsupported. Same-machine pixel determinism does not guarantee cross-GPU equality. Automated playback/flash screening are not human continuous viewing, accessibility certification or aesthetic acceptance.

Assets: `examples/styles/expressionist-space/assets/metadata.json` records source, author, CC0 license, hashes, scale, axes, pivot, UV, alpha, rest, clip loop/contact and tools. Example geometry is original; Three code is MIT. No movie frames or external art were copied. Status remains experimental until coordinator acceptance; required code paths are implemented rather than promised.

For explicit alpha/color patches, renderer statistics, repeated resource disposal and a partial missing-clip failure, also run:

```sh
node examples/styles/expressionist-space/browser-probes.mjs "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/effects" "$PWD/.direction/aesthetic-toolkit-2026-11-08/C/store" "$PWD/evidence/aesthetic-toolkit-2026-11-08/C/probes"
```

The helper asserts sRGB gray 128 (±2), half-alpha composition near 64 over black / 192 over white, clear corners and explicit failure recovery. These are executable checks, not claims that they have run; consult C's handoff.

Actual delivered validation: [C handoff](../../evidence/aesthetic-toolkit-2026-11-08/C/HANDOFF.md) and [summary](../../evidence/aesthetic-toolkit-2026-11-08/C/validation-summary.json) record15 focused tests, five frozen browser checks, eight final videos and final alpha/resource probes. Human acceptance and coordinator independent review remain separate.

Phase02 objects may use `rig:"assets/character.rig.json"`, optional `motion:"assets/character.motion.json"` and `playback:{loop,weight,timeScale,rootMotion}`. The rig route rejects geometry/asset/clip/deform/internal-lines conflicts. Skinned GLB rejects deform/internal lines during prepare. Public materialization validates rig, motion and their mutual rest compatibility before publication.
