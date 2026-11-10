# Team C implementation handoff

Complete C CPU package and actual browser/media validation are delivered in C-owned paths. No C render remains blocked or pending. Coordinator regression, independent review and human aesthetic acceptance remain separate. Existing shared changes and media were not reset, staged, committed or uploaded. No agents or threads were started. Shared modules were not edited.

## Delivered

- `modules/styles/expressionist-space/index.mjs`: synchronous immutable `validateScene`; async `prepare(api,{scene|sceneFile})` returning evaluate/draw/dispose/getStats; `sampleKeys` absolute transform sampler. One renderer consumes station, laboratory, portrait and effect scene data, never switches on demo names.
- `modules/fx3d/`: material (toon ramp + four-density UV atlas), optional rigid inverted-hull outline, local internal lines, ambient/directional/spot shadow rig, projected light gobo, separate graphic shadow polygon, absolute rest deformation, instanced analytic dust, camera-depth fog, transparent WebGL2/Canvas adapter, geometry factories and local GLB loader.
- Existing `prepareClip3D` retained and additionally tested for negative timeScale, weighted rest mixing, loop boundaries and reverse seeks. Core clip owns mixer only. Style owns loaded resources, materials, ramps/atlas, shadow textures, instanced buffers and renderer/context. Own partial failures clean registered allocations. Shader compilation errors throw explicitly.
- Three pinned to **0.180.0**. `collectExpressionistVendor()` reads installed addon transitive imports, allowlists the loader and BufferGeometryUtils, includes LICENSE and package pin, and returns paths→Buffers without shared mutations. `../../vendor/...` from `modules/fx3d/glb.mjs` resolves to project/vendor, proven by CPU frozen closure checks; successful browser loading is a separate test.
- Original local `traveler.glb` (55,552 bytes) and `specimen.glb` (63,944 bytes), each embedded uncompressed UV mesh with basic named clip. CC0 metadata includes source/author/hash/scale/axis/pivot/alpha/rest/rig/clip loop/contact. Procedural hatch atlas hash also recorded. Three code license is separately MIT.
- Authored 192-frame, 24fps station and laboratory JSON, plus portrait and isolated effects JSON. `author.mjs` and `effects.mjs` regenerate the data. Build helper imports coordinator materializer and passes a local asset map. Mixed helper keeps ledger and provenance hashes in sync.
- Full authoring/API guide: `references/styles/expressionist-space.md`; exact exports/limits/support/ownership in the style descriptor. README has commands and caveats.

## Actual CPU evidence

`unit-tests.log`: **15/15 passed**, Node v26.12.1. Tests include actual installed GLTFLoader parsing both assets (CPU), UV presence, scene immutability/validation, rest deformation reverse seek, atlas nesting/UV shader anchoring, dust seek identity, clip loop/weight/negative-timeScale/hold/boundaries, explicit missing WebGL2 failure and allocation limit rejection. No whole npm test was run; coordinator owns regression.

`package-verification.json` / `.log`: station, laboratory, portrait, effects and mixed successfully materialized, manifest-validated and frozen. All provenance hashes match actual project bytes. Frozen addon closure/core/licenses/assets exist. Temporarily changed the generated source GLB, verified frozen asset bytes/revision remain intact, then restored source bytes. This is CPU source isolation proof, not browser pixel proof. Latest revisions are in that JSON; older build receipts represent earlier iterations.

## Actual browser and video evidence

`validation-summary.json` / `.log` consolidate the final revisions, browser, job IDs, performance, frame/PTS and flash results. `station-final/validation.json`, `laboratory-final/validation.json`, `effects/validation.json`, `mixed/validation.json`, `portrait/validation.json` retain the detailed canonical states/image hashes.

All five final projects passed **55 random/reverse/repeated seek image comparisons each**, frozen source-detachment/reload, automated playback through frame191, four repeated compositor lifecycle cycles, zero page/shader errors and zero external requests. Station, laboratory, effects and mixed each completed **both 540p and 1080p**: eight final videos, each192 frames / 24fps /8.000s /yuv420p. Every decoded PTS is `i/24`, first0 and last7.958333. All eight flash screenings are **screen-negative**, not accessibility certification.

Final main artifacts (absolute root `/Volumes/eyedisk/develop/cinewright/evidence/aesthetic-toolkit-2026-11-08/C`):

- `station-final/1080p.mp4`, `station-final/540p.mp4`; exact-job PNGs include frame72 (shadow before actor/train),104 and191.
- `laboratory-final/1080p.mp4`, `laboratory-final/540p.mp4`; PNGs include0,96,104,191.
- `effects/1080p.mp4`, `effects/540p.mp4` and frame104.
- `mixed/1080p.mp4`, `mixed/540p.mp4` and frame104.
- `portrait/frame-96-540p.png` is540×960; portrait browser checks passed. No portrait video was requested by the representative-portrait acceptance check.

`probes-final/probes.json` is the successful extra probe on the **same final effects revision**: actual local GLB loading and shader compilation, sRGB opaque gray `[128,128,128,255]`, transparent corner`[0,0,0,0]`, half-alpha gray`[128,128,128,128]`, composite64 over black and191 over white, three additional style lifecycle cycles returning **geometries=0/textures=0** after disposal, and missing clip failure followed by successful preparation. Before disposal:8 geometries/7 textures/10 calls/5400 triangles in the small effects probe. Browser Chromium157.0.8103.38. GPU memory is unavailable. The earlier probe used an earlier common exposure implementation; it was repeated against the final revision after source comparison found that shared change.

60 synchronous draw-submission timing samples per final scene: station p50≈0.2ms/p95≈30.7ms; laboratory0.3/23.3; effects0.1/0.2; mixed0.3/23.0; portrait0.2/0.5. These include submission/composite, **not a GPU-completion benchmark or realtime guarantee**. JS heaps recorded in the summary; full GPU memory unmeasured.

Initial `browser-station.log` is only a historical EEXIST acquisition failure and is not counted as proof. Initial `station/` and `laboratory/` successful renders are preserved but superseded by the `-final` scenes after visual corrections. `visual-review.md` records model PNG inspection: train-facing windows/cab added, and leaf yaw/spread adjusted for readable separate leaves. No continuous human viewing or independent review is claimed. GPU lock was released; browsers/servers closed by the validators' finally blocks.

## Reproduce (no remaining C GPU work)

From `/Volumes/eyedisk/develop/cinewright`, use the existing projects in `.direction/aesthetic-toolkit-2026-11-08/C/`. For a fresh rebuild, use `examples/styles/expressionist-space/build.mjs NEW_PROJECT station|laboratory|portrait|effects`; mixed uses `build-mixed.mjs NEW_PROJECT`. `--update` explicitly updates unchanged generated bytes through the ownership ledger. Assets are supplied through the local asset map; no CDN.

```sh
node --test tests/expressionist*.test.mjs
node examples/styles/expressionist-space/verify-package.mjs
node examples/styles/expressionist-space/browser-probes.mjs .direction/aesthetic-toolkit-2026-11-08/C/effects .direction/aesthetic-toolkit-2026-11-08/C/store evidence/aesthetic-toolkit-2026-11-08/C/probes-final
node examples/styles/validate.mjs .direction/aesthetic-toolkit-2026-11-08/C/station .direction/aesthetic-toolkit-2026-11-08/C/store evidence/aesthetic-toolkit-2026-11-08/C/station-final
node examples/styles/validate.mjs .direction/aesthetic-toolkit-2026-11-08/C/laboratory .direction/aesthetic-toolkit-2026-11-08/C/store evidence/aesthetic-toolkit-2026-11-08/C/laboratory-final
node examples/styles/validate.mjs .direction/aesthetic-toolkit-2026-11-08/C/effects .direction/aesthetic-toolkit-2026-11-08/C/store evidence/aesthetic-toolkit-2026-11-08/C/effects
node examples/styles/validate.mjs .direction/aesthetic-toolkit-2026-11-08/C/mixed .direction/aesthetic-toolkit-2026-11-08/C/store evidence/aesthetic-toolkit-2026-11-08/C/mixed
node examples/styles/validate.mjs .direction/aesthetic-toolkit-2026-11-08/C/portrait .direction/aesthetic-toolkit-2026-11-08/C/store evidence/aesthetic-toolkit-2026-11-08/C/portrait --no-video
node examples/styles/expressionist-space/summarize-validation.mjs
```

Run browser commands sequentially with the common GPU lock. Do not rerun them just to recreate existing proof; outputs above already passed.

## Mixed API and integration

`build-mixed.mjs` generates a real manifest with `$data` number channel `lamp.event`, space `unit`. C's `eventBinding:{channel:'lamp.event',light:1,gain:1}` calls `t.read(channel,'unit')` and scales the keyed light. The later Canvas annotation consumes the same scalar. `projectBinding:{object:'specimen',channel:'specimen.screen'}` computes the actual camera projection and calls `t.write` once during evaluate; Canvas reads the existing `vec2` channel in `canvas` author-pixel space. It is projection of the object's origin, not a visibility/depth result. No new typed kinds, GPU texture or matrix exchange.

Coordinator needs: keep root catalog experimental pending GPU/visual acceptance; adopt descriptor support/limits and guide links as appropriate. No shared implementation change is currently requested. Existing materializer/runtime optional dispose and bare-three import map are sufficient. Full regression and independent review remain coordinator-owned.

## Technical limitations

Rigid embedded GLB only; no skinned mesh, compression, required extension, remote dependent URI, auto UV, retargeting or foot-contact solver. The traveler is rigid stylized translation with case-sway, not a claimed walk-cycle solver. Leaf internal lines are authored geometry and rotate with the leaf; generic rest deformation does not automatically deform those lines. Rigid shell outlines can show cracks at hard normals/open surfaces; lines are nominal one output pixel and outlines use world width. UV seams remain authored seams. Four atlas densities with derivative suppression are not a full tonal-art-map algorithm. Gobo changes illumination, graphic polygon shadows are explicitly authored and can precede actors. Shadow bias/depth overlap require output review. Fog is depth fog, dust is analytic motes, not volumes/physics. Same-environment deterministic input does not imply cross-GPU pixel equality. Synchronous draw timings and representative image inspection are recorded above; they do not establish full GPU completion speed or universal image quality.
