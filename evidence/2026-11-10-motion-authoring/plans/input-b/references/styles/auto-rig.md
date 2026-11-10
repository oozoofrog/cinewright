# Automatic biped rig/skin — experimental section profile v1

`modules/animation/auto-rig.mjs` exports `autoRig`, `validateRig`, `createRiggedMesh`, `RIG_VERSION`. Three 0.180.0 (MIT) is reused for bind, skeletal linear blend skinning, inverse bind matrices, UV toon/hatch shaders, GLTF export/load and animation. Original section inference and weights are repository code; fixtures are original CC0 assets. No DCC/service, model download, pretrained weights or uploaded media is needed.

## Input class and algorithm

Explicit `profile:'upright-biped'`: one connected, bilaterally symmetric, centered static surface with two separated straight legs and two extended nearly horizontal arms (T or low A pose). UVs required. Left/up/forward must be an orthonormal right-handed basis; coordinates use metres. Mesh triangles may duplicate vertices; connectivity welds coordinates at 1e-7 m. Closed-leg/overlapping-limb silhouettes, skirts, bent arms, severely asymmetric bodies, animals, fingers, faces and arbitrary topology are outside this profile. It is a deterministic section heuristic, not a semantic neural anatomy estimator. Its support evidence is two original voxel-union figures of different proportions; smooth production characters remain unverified.

The code measures 80 horizontal surface sections, finds the highest lower-body central gap, the outer arm band, torso width, narrow upper neck section and bilateral lower-leg center. It fits a fixed 17-semantic hierarchy to these measured extents; elbow/knee split lengths use a midpoint prior (not inferred anatomical joint evidence). It assigns four normalized inverse-distance-to-segment weights, distance regularizer 2.5% of measured height, inverse fourth power, with side/height candidate restriction. This avoids opposite-limb influence but is not volumetric heat diffusion. All inferred local positions, bind inverses, indices/weights, algorithm version and supplied landmarks are saved. Optional `landmarks:{semantic:[x,y,z]}` overrides the estimated position in authored coordinates and is explicitly recorded in provenance; no hidden manual hints are used by the two fixtures.

Failures include unknown profile, invalid/left-handed axes, non-finite/budget/UV errors, disconnected islands, no central leg gap, arms outside the supported band, excessive leg asymmetry, invalid hierarchy, negative/non-normalized weights, out-of-range skin indices, inverse-bind inconsistency. Passing these diagnostics is not proof of anatomical or artistic quality. Surface cross-section inference is sampling-sensitive and midpoint joints can be inaccurate. Volume loss, crease collapse, candy-wrapper twisting and surface self-intersections remain limits of this simple linear skin model; use authored landmarks or a different rigging tool for production correction.

## Public API and local assets

```js
import {autoRig,createRiggedMesh} from './modules/animation/auto-rig.mjs';
const asset=autoRig(staticGeometry,{profile:'upright-biped',
  left:[1,0,0],up:[0,1,0],forward:[0,0,1]});
const rig=createRiggedMesh(asset,material);
// rig.mesh is an actual Three SkinnedMesh; rig.bones is a Map by semantic.
// pose bones from absolute frame, update matrixWorld and skeleton.
rig.dispose(); // geometry/skeleton; caller retains supplied material
```

Geometry input is a Three BufferGeometry or `{positions,normals?,uv,indices?}`. JSON rig v1 stores geometry plus `skinIndices`/`skinWeights`, parent-before-child bone rest transforms and optional stored inverseBind. Max 50,000 vertices, 100,000 triangles, 128 bones. Four weights per vertex. File decoder/materializer ceiling is 64 MiB; JSON transient heap is larger. Mesh name is never consulted. `createRiggedMesh` recreates bind data and checks stored inverses before use. GPU frustum culling is disabled on these dynamic meshes so stale rest bounding spheres cannot hide deformations.

```sh
node scripts/auto-rig.mjs STATIC.json OUTPUT.rig.json PROFILE.json
node scripts/auto-rig.mjs STATIC.json OUTPUT.glb PROFILE.json --glb
node examples/styles/phase02-rig/build.mjs /absolute/unused/project tall
node examples/styles/phase02-rig/build.mjs /absolute/unused/project broad
```

The CLI refuses an existing output. GLB is actual embedded uncompressed glTF2 with JOINTS_0/WEIGHTS_0 and inverseBindMatrices, exported through r180 GLTFExporter; no external decoder. Generated static JSON, rig JSON, GLB, local motion bake and CC0 notice live under `examples/styles/phase02-rig/assets/{tall,broad}`. Preserve source separately from revision snapshots.

Style selection is explicit: expressionist-space object `{id,rig:'assets/character.rig.json',motion:'assets/character.motion.json',material,outline?,playback?}`. `motion` is optional, and uses retarget's source-independent bake. Camera/light/actor exposure stay separate. Embedded GLB skins with optional local GLB clip are also supported. Skinned outlines share actual skin attributes/skeleton and extrude before skinning; UV hatch follows deforming UVs. Authored rigid internal lines or rest deformation together with skinning are rejected with diagnostics, never silently rendered rigid. All assets/modules/vendor loader dependencies and license are copied by materializeStyle/freeze; no runtime authoring source dependency.

## Verification and source assessment

CPU tests recreate rest vertices through actual Three `applyBoneTransform`, inspect hierarchy/inverses, finite normalized weights and bounds, demonstrate changed vertices under arm bend and measure triangle stretch (<5 in the fixture deformation), export and reload both actual GLBs. Fixture rest maximum vertex error is <2e-7 m; this is bind numerical error, not anatomy estimation error. The estimated crotch/shoulder and relative joint locations are in diagnostics; no external anatomical ground truth is claimed. Browser tests load source-deleted frozen snapshots, exercise UV/hatch/skinned outline shaders, alpha, unsupported combinations, disposal and permuted/reverse/end-start image seeking. Same-browser image equality does not imply cross-GPU equality. Actual 192-frame 24fps 960x540 eight-second renders, video timing/flash and final tests are indexed by the phase02 final handoff.

Research/reuse examined: [Baran & Popović 2007, author institution](https://projects.csail.mit.edu/publications/abstracts/abstracts07/ibaran/ibaran.html) demonstrates skeleton embedding and heat-diffusion attachment; [author supplementary penalty functions](https://people.csail.mit.edu/ibaran/papers/2007-SIGGRAPH-Pinocchio-Penalty.pdf) defines fitting constraints. Pinocchio's native library requires its own build/meshing assumptions; it is not adopted or claimed implemented here. This narrower section profile avoids a native DCC dependency and must not inherit Pinocchio's broader capability claims. [Three r180 SkinnedMesh](https://github.com/mrdoob/three.js/blob/r180/src/objects/SkinnedMesh.js), [Skeleton](https://github.com/mrdoob/three.js/blob/r180/src/objects/Skeleton.js), [GLTFExporter](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/exporters/GLTFExporter.js) are actual reused implementation sources. Retarget reuse/limitations are in [retarget.md](retarget.md).
