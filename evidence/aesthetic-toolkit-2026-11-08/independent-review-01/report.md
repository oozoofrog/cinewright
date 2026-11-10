# Independent review 01 — aesthetic toolkit

Review verdict: **request changes; technical and aesthetic completion is not established**. This is an independent reviewer/tester run against the dirty shared checkout, not an implementation contribution. The implementation has real reusable A/B/C modules and actual media. The issues below concern missing required performance, incorrect public API behavior, incomplete validation, and evidence coverage. Passing tests do not establish aesthetic acceptance.

Scope: the complete 297-line `docs/research/2026-11-08-aesthetic-toolkit/IMPLEMENTATION-PROMPT.md`, the handoff contract, actual root SKILL/wrapper, style/effects references and catalogs, public animation/FX/style modules, materializer/CLI/runtime/freeze/render paths, recipes/assets, actual validation logs and media. No applicable AGENTS.md was found in the repository or checked ancestors. Research and prior handoffs were treated as background, not execution evidence.

No production file or shared test was edited. All reviewer writes are below this evidence directory or `.direction/aesthetic-toolkit-2026-11-08/review-01/`. No agents, threads, workflow, full npm test, preview UI, stage/commit/push/PR, global installation, upload or media cleanup was performed. Baseline status/HEAD are saved here. C was active; its paths were read, never edited. Its output status below is a read snapshot, not a claim about its eventual completion.

## What I actually executed

- `node --test tests/style-common.test.mjs tests/silhouette.test.mjs tests/line-wash-core.test.mjs tests/line-wash-stroke.test.mjs tests/expressionist-core.test.mjs tests/expressionist-package.test.mjs`: **28/28 pass**, directly rerun, `focused-tests.log`. These are the existing focused tests, not new shared tests.
- Standalone reviewer scripts: **29 checks, 16 pass and 13 failed contract assertions**, `checks.json`. Several assertions expose the same underlying issue; this is not a count of 13 distinct defects. The scripts catch assertions to retain all results, so process exit 0 is not a clean review. An initial reviewer harness used `catalog.effects` instead of the actual `catalog.entries`; this was corrected and actually rerun. All **43 listed exports** exist. Initial raw receipt and correction are retained.
- Actual public API execution covers all ten recipe validators and source immutability; irregular half-open exposure/gaps; rig hierarchy, limits and cycle rejection; B's full 192-frame evaluation plus 192 permuted seeks; held versus boiled redraw and erasure boundaries; Three clip loop/nonloop, negative timeScale, weight 0/.5/1, held exposure, reverse/repeated/end-to-start evaluation and disposal; Node GLB/package tests; provenance hashes; and the failures below.
- Exact CLI `--help`, `style list` and `style build STYLE --scene ... --assets ... --project ...` calls executed. Three first smoke variations and three subsequent production-size forward studies were generated and frozen locally. The final studies retain normal authored resolution, add A alpha appearance/range and a new camera, a new corresponding B stroke and masked erasure, and a new independently exposed/deformed C leaf plus orthographic camera. See `forward-test.json`, `forward-{A,B,C}-cli.log`, and scratch `forward-{A,B,C}`. All remain manifest **v1**. No private music was needed.
- New/update policy directly exercised: a successful update retained an unknown authored note; editing a generated B module caused a later update to reject; the authored edit and existing work.json remained byte-for-byte intact. CLI-generated projects have real local module closure. C freezes include the local r180 loader, BufferGeometryUtils, core, assets and license. Frozen asset/module/manifest bytes remained intact after review-owned source alteration; final forward-study source manifests and early C sources were restored. The deliberate B authored-edit fixture remains.
- Direct `ffprobe` decoding checked **16 existing MP4s**: A forest-v3/harbor, B rain-final/commuter-final, effects2d, and available C station/laboratory/effects, each at 540p and 1080p. All have 192 decoded frames, 24/1 fps, 8.000000 seconds, yuv420p and PTS `i/24` within 2 microseconds, ending 7.958333. See `evidence-audit.json`. This is my media inspection, not a rerender.
- The current `screenFlashes` implementation was directly rerun on **all ten A/B/effects2d final MP4s**, both sizes: all screen-negative. Reports/logs are retained here. C flash results were source-log audited, not independently rerun. This limited reduced-resolution screen is neither safety/WCAG certification nor human viewing.
- Direct CPU decoding sampled final effects MP4 color patches at both sizes: half red on black `[126,0,0]`, half red on white `[254,127,126]`, gray `[126,126,126]`, within the probe's 5-level tolerance of Canvas reference values. This checks encoding differences for these interior patches, not all antialiased edges.
- Local image viewing inspected representative A/B/effects/C PNGs and CPU-extracted A forest, B rain and B commuter contact sheets at frames **0,24,48,72,104,144,191**. Selected A/B 1080p originals and A portrait 96/191 were also inspected. These are sampled frames, not continuous human viewing; no listening or user aesthetic acceptance is claimed.
- **No direct browser/GPU test ran.** The one permitted atomic mkdir attempt found `.direction/aesthetic-toolkit-gpu.lock` busy. It was not removed or polled. `browser.json` records the skip. Existing seek/autoplay/dispose evidence below is a source-log audit, and new forward variations have CPU/package proof only.

The actual coordinator baseline receipt reports 394/394 in `baseline-npm-test.log`; I did not use it as implementation proof or rerun the whole suite. Final integrated npm regression remains the coordinator's responsibility after C.

## Findings requiring fixes

Severity: P1 = blocks a required delivered behavior; P2 = functional/input/visual contract defect requiring correction; P3 = metadata accuracy. File/line references identify the reviewed checkout; hashes are in `reviewed-source-hashes.json`.

### R1 — P1: commuter locomotion is sliding, with no swing/contact gait

Locations: `recipes/styles/line-wash/commuter.json:1954` (`shoeleft`), `:2112` (`shoeright`), related legs at `:1588`/`:1771`; playback consumes these banks through `modules/styles/line-wash/index.mjs:10`.

Direct reproduction: prepare the real commuter scene and evaluate both shoe point arrays at every frame 0–72. Every corresponding Y coordinate is constant for all 73 frames. Sole heights are 845 and 843. The shoes translate 108 and 172 authored pixels horizontally respectively. Even after the strokes are fully revealed at frame 45, frames 46–72 move them another **70.06 / 38.28 px** at the same height. There is no lifted swing and no stationary planted shoe interval in those interpolated segments. See `checks.json` entry “commuter shoe contact trajectories…” and `commuter-contact.png` extracted from the actual final MP4.

Observed: the final samples show a figure spreading/sliding its feet before the letter changes. Inferring a successful walk from body translation and a ground-colored polygon is unsupported. This fails the mandatory “commuter walks then unfolds a letter” and contact/weight requirements (§4, §11–12), independently of taste.

Required fix: reauthor a short gait with explicit planted contact and lifted swing poses, then a stable stop before opening the letter. Preserve the reusable redraw API. Inspect and record shoe trajectories, near-contact frames and an actual motion review at both sizes. Regenerate final B commuter evidence and provenance if assets change.

### R2 — P2: A's validator accepts scenes that fail later or silently suppress objects

Locations: `modules/styles/silhouette-theatre/index.mjs:13`, `:15`, `:25`, `:27`, `:37`; `modules/animation/exposure.mjs:9` (poseAt validation).

Direct reproductions in the reviewer probes:

1. A scene with `shapes:{}` and one `{id:'missing',type:'shape'}` returns true from `validateScene`, prepares, then throws `TypeError: Cannot read properties of undefined (reading 'fill')` from its actual draw function. The draw test used a mock context, so this is execution-path/error proof, not raster proof.
2. A two-bone puppet with poses `{frame:0,pose:{a:0}}`, `{frame:24,pose:{b:1}}` passes scene validation. Validation samples poseAt only at 0, which returns before checking correspondence. Interior interpolation can throw “corresponding bone keys required”.
3. A harbor object with `from:100,to:20` and an unsupported reveal kind passes validation. Draw suppresses the reversed-range object; the reveal fails later.

Other related checks are absent here: required shapes for shadow objects, positive alpha bounds, halo radius, opacity/scale limits, clock enums and reveal configuration. This is an observed validation design gap, not a claim that every missing check was browser-reproduced.

Required fix: validate complete per-type object data, all pose key correspondence independent of sampled time, ranges and reveal configuration before prepare/materialize. Include object/field IDs in errors. Test that malformed scenes fail before any project publication. Keep unknown or deliberately unsupported properties explicit.

### R3 — P2: staged generation publishes projects with missing required local assets

Locations: `scripts/materialize-style.mjs:18`, `:22`, `:30` (only scene/header validation and supplied map copying); A asset use at `modules/styles/silhouette-theatre/index.mjs:21`.

Direct reproduction: add an alpha object referencing `assets/nonexistent.png`, call `materializeStyle` with an unused project path and `assets:{}`. It resolves successfully and publishes `review-01/invalid-missing-asset/`. That project also contains a required moon reference from the underlying harbor variant. The staged manifest validator cannot check nested config asset references. No asset closure check runs before rename. Runtime image loading would request nonexistent project assets; that later browser failure is inferred from the API, not independently executed in this review.

Required fix: enumerate required assets through a style-owned collector/schema and validate their existence, safe local path, file type and relevant parseability in the stage before publication. Do this for update as well as new generation; on failure retain the prior project and discard only the owned stage. C's required GLBs should get CPU header/embedding checks before publication. The successful authored-edit protection test should remain passing.

### R4 — P2: straight cubic strokes discard authored interior pressure

Locations: `modules/fx2d/stroke.mjs:7`–`:9`, `:14`.

Direct reproduction:

```js
const p = prepareStroke({segments:[[
  [0,0,1], [30,0,0], [60,0,0], [90,0,1]
]]});
strokeAt(p, .5).at(-1); // observed [45,0,1]
```

Observed: the flatness rule considers only XY. It collapses the cubic to two endpoints, both pressure 1, losing the control pressures. Cubic interpolation at the midpoint is pressure .25. This is a valid authored input with visibly meaningful width variation, not invalid data. The public representation and guide say pressure interpolates through subdivision.

Required fix: preserve the parameter/pressure curve independently of geometric flatness, or add a bounded pressure interpolation error criterion. Define pressure semantics explicitly if not cubic. Verify a straight line with nonconstant pressure, a curved line, and reveal sampling without input mutation. Do not change only the demo.

### R5 — P2: B and public stroke/wash helpers do not consistently reject invalid/overflowing data

Locations: `modules/styles/line-wash/index.mjs:8`, `:11`; `modules/fx2d/stroke.mjs:3`–`:12`; `modules/fx2d/wash.mjs:2`.

Direct observations:

- `rain.strokes[0].dabSpacing=0` still passes `validateScene`. The actual style draw function throws `brush: invalid spacing/jitter` at frame 24 (mock context, no raster claim). A scene accepted for materialization can fail only after it starts drawing.
- Public `drawWash` accepts `alpha:NaN` because `<0` and `>1` both return false. The style's own wash validation is stricter than the public helper. Invalid Canvas alpha assignment can retain an earlier value; exact browser pixels were not tested here.
- `prepareStroke({points:[[-1e308,0,1],[1e308,0,1]]})` accepts finite inputs and returns an infinite derived length. The missing rejection was directly asserted; derived-length math and later reveal behavior are not bounded by the input's finite check.

Required fix: validate all brush settings used by draw at scene validation; reject nonfinite alpha/edge in public wash; bound coordinate/width magnitudes and verify finite lengths and subdivision arithmetic. Validate frames/units consistently with the documented integer-frame scene contract. Keep low-level helper and style validation policies aligned. Add targeted negative tests, not copies of the implementation.

### R6 — P2: adaptive cubic output has no effective aggregate allocation budget

Locations: `modules/fx2d/stroke.mjs:6`–`:12`; `references/styles/effects.md:17` (stroke bounds); B descriptor/catalog limits.

Direct reproduction: a single ordinary cubic `[[0,0,1],[0,100,1],[100,100,1],[100,0,1]]` with `tolerance:1e-6,maxDepth:20` produces **16,385 points**. No accumulated output cap exists. The accepted input permits 1024 cubics and depth 20, and a scene permits 1000 strokes. Polyline's 10k input limit does not constrain flattened output.

Observed: 16k points allocated from one segment. Inferred: combinations of valid count/tolerance settings can expand to millions or far more points and exhaust memory before a useful error. I deliberately did not run an OOM stress test. A finite theoretical recursion depth is not a practical memory limit.

Required fix: add a documented per-stroke flattened-point/work budget checked before appending/subdividing and a preparation budget across scene strokes. Reject excessive expansion with an actionable tolerance/quality message. Demonstrate a near-limit success and just-over-limit failure without allocating the full excess. Also state a bounded quality tier instead of implying the full Cartesian product of maxima is safe.

### R7 — P2: C accepts primitive subdivisions that generate nonfinite meshes

Locations: `modules/fx3d/geometry.mjs:6`, `:10`; `modules/styles/expressionist-space/validate.mjs:10`.

Direct reproduction: replace a valid laboratory object's geometry with `{type:'box',args:[1,1,1,0,1,1]}`. Both scene validation and `createGeometry` accept it. The returned geometry has **16 vertices, 8 nonfinite position components and 8 nonfinite UV components**. This is a CPU Three r180 execution, not inferred shader output. It was disposed after inspection.

Required fix: validate constructor-specific dimensions and subdivision counts (positive integer minima, bounded maxima), rather than applying the same 0..128 check to every argument. Check nonfinite generated attributes before handing geometry to a renderer. Include cylinder/torus segment cases. C is active; this finding is for the coordinator/C owner, with no reviewer edit.

### R8 — P2: A catalog advertises a match mask that the style cannot supply

Locations: `catalog/styles.json` silhouette `support` (“iris/curtain/match mask”); `modules/styles/silhouette-theatre/index.mjs:37`; `modules/fx2d/transition.mjs:2`.

Direct reproduction: prepare a valid A scene with an authored `aperture` shape and `reveal:{kind:'match',from:0,to:24,center:[320,180],shape:'aperture'}`. Scene validation succeeds, but actual draw throws **“match transition requires Path2D”**. A's draw call passes only width/height; it never passes a path, regardless of JSON data. There is no JSON-to-path bridge for this reveal mode.

The common `drawTransitionMask` helper does support a caller-owned Path2D; that does not make the advertised style capability functional.

Required fix: define an authored shape reference for match reveal, validate it, resolve a prepared local path and pass it into the helper. Alternatively correct the A-specific support claim while retaining independently documented common match behavior; confirm which scope fulfils the approved transition requirement. Do not leave a style mode that validates and then necessarily throws.

### R9 — P2: A portrait's foreground obscures the subjects at the review/end pose

Locations: `recipes/styles/silhouette-theatre/portrait.json:1665` left curtain and `:1696` right tree; action placement at `:235`/`:947`. Output: `A/portrait-v2/frame-96-540p.png` and `frame-191-540p.png`.

Direct visual observation: the left branch crosses a substantial part of the fox torso/tail, and the right branch covers the hare's head/front torso. The rabbit's ears/eye merge into the foreground at 96 and it remains largely blocked at 191. The landscape representative is much more legible; this is a portrait composition failure, not an unsupported claim that the renderer lacks occlusion.

Required fix: reframe or reauthor the foreground opening/action positions so both faces and the essential pose survive the portrait end state. Keep intentional occlusion at the reveal beat, then expose a readable reason/result. Existing hinge-distance diagnostics do not cover foreground-vs-character silhouette intersection; record visual review separately. Re-render the portrait browser evidence after the recipe fix.

### R10 — P2: public transition accepts nonfinite time and the wrong center dimension

Location: `modules/fx2d/transition.mjs:1`.

Direct reproduction: `transitionAt(NaN,{from:0,to:24})` returns a state with NaN progress, and `transitionAt(2,{from:0,to:24,center:[1]})` returns a one-component center. Both expected rejection assertions fail. `center.every(Number.isFinite)` checks neither Array shape nor length; a later spread into `arc` is invalid.

Required fix: validate output frame and exact vec2 center before producing draw state; apply the same policy through A reveal validation. Test from-1/from/to-1/to/to+1, NaN/infinity, missing and extra coordinates. The existing progress clamp is not an invalid-data check.

### R11 — P3: A provenance contains an incorrect self hash

Location: `examples/styles/silhouette-theatre/assets/provenance.json:22`.

Direct SHA-256 comparison: recorded self hash `0f97ac...` differs from current `660d8b...`. Cutouts/moon, B authored-strokes, and both C GLBs match their recorded hashes. C assets are 55,552 and 63,944 bytes as declared. Code and asset licenses are kept distinct (Three MIT, original example assets declared CC0).

Required fix: remove the provenance document's recursive self hash or define an explicit excluded-field canonical hashing scheme; retain exact hashes for actual payloads. Prefer recording the document's byte hash in an external version/freeze receipt. Add exact tool versions where A/B currently give only “Python 3”/“3 stdlib”; these provenance statements identify authorship but are not reproducible environment pins. Asset authorship/license declarations were audited, not independently proven legal provenance.

## Evidence audit and scope gaps

`evidence-audit.json` contains the actual per-output source logs, independent ffprobe results and frozen-source comparisons. Existing A/B/effects logs each record 55 reverse/permuted/repeat seek image checks, no page errors/external requests, source-isolation true, autoplay reaching frame191 and four repeated dispose cycles rejecting later draw. Portrait logs omit video intentionally. These are credible saved execution receipts, but they are not browser runs performed by this reviewer and do not prove the defects above are absent.

| Output snapshot | Log audit | Independent media execution | Visual review |
|---|---|---|---|
| A forest-v3 / harbor | validation.json read; 55 seeks, freeze, autoplay, dispose | both sizes: frame count/PTS and flash rerun | landscape frames, forest contact sheet and 1080p104; reusable animal/harbor content is distinct |
| A portrait-v2 | same browser checks recorded, no MP4 expected | PNG inspection only | subjects obscured at 96/191: R9 |
| B rain-final / commuter-final | validation.json read; 55 seeks, freeze, autoplay, dispose | both sizes: frame count/PTS and flash rerun | contact sheets and 1080p104; letter replacement reads, gait fails R1 |
| B portrait | same browser checks recorded | PNG inspection only | open paper composition reads, simple polygon wash/line study |
| effects2d | same browser/media validation recorded | both sizes: frame count/PTS/flash and encoded patch RGB | actual six-panel reel; nominal values, not exhaustive boundary acceptance |
| C station / laboratory / effects | successful validation.json existed at read snapshot | both sizes: frame count/PTS directly decoded; flash source-log audit | 104 samples, station191; no continuous viewing |
| C mixed / portrait | validation.json missing when this audit read them | not run | pending separate integration/review; no polling/waiting on C |

G1. **Some saved evidence is not the current source version.** Frozen A forest-v3/harbor/portrait differ in exposure, mask and A index; B differs in exposure; effects2d differs in exposure/mask/emitter. `evidence-source-diff.patch` shows the changes: A adds stricter path validation, exposure rewrites argument handling, emitter tightens vectors/seed. These appear intended to preserve valid scene output, but I did not execute browser equivalence for the new bytes. They are evidence of earlier valid outputs, not proof that the changed entry points were GPU-tested. Refresh builds/freezes and relevant seek/lifecycle/color diagnostics after fixes, or supply explicit current-vs-old pixel equivalence. The effects entry is a generated module copied from `examples/styles/effects2d/scene.mjs`; its different repo path is not itself a missing-code bug.

G2. **The root effects2d numeric browser-probe receipt is a lock failure.** `effects2d-probes.log` contains only EEXIST acquiring the GPU lock, not a successful probes.json. The diagnostic reel exists and was decoded/viewed here, and its encoded interior color patches passed my CPU samples; the specific helper assertions for evenodd/nonzero hole, erase alpha and repeated ink are still missing current execution proof. Do not report the failed acquisition as a pass. Re-run when the coordinator owns the lock.

G3. **C has meaningful current evidence, but final integration was incomplete at this audit snapshot.** C station/laboratory/effects reports and files were present; the blanket historical C handoff “GPU not run” is superseded for those outputs by real logs/files. `C/probes/probes.json` was read: sRGB gray128, alpha128, black64, white191, clear corners; three full prepare/dispose cycles report 8 geometries/7 textures before and zero after; a missing-clip error is recorded with no page errors. This is source-log audit, not independent resource measurement. C mixed/portrait reports were missing at the moment of reading and are to be integrated separately, as the user anticipated. The active owner may finish them after this snapshot; no absence is treated as a permanent code failure.

G4. **Whole regression, independent browser execution and continuous visual acceptance remain open.** My 28 focused test passes and the current 394 baseline cannot replace the final integrated suite. Browser acquisition was skipped once because busy. Forward A/B/C scene studies were validated/materialized/frozen, not independently rendered. No statement here certifies animation-wide stability, human accessibility, listening or user taste.

G5. **Per-effect validation and budget evidence do not yet cover the approved full diagnostic matrix.** The 2D reel shows six nominal compositions and color patches; existing tests exercise several failure limits, but do not demonstrate every helper's default, range endpoint, invalid input, and memory limit. R4–R7/R10 expose concrete missing cases. Add focused isolation results for those, compound alpha/fill boundaries, nonuniform exposure and mixed clock controls, and representative near-limit counts. GPU memory is correctly left unmeasured; generic validator timings measure synchronous submission/composite, not completed GPU work or universal realtime. Its extra WebGL renderer string does not identify all device/driver details. Preserve that distinction and record machine/software metadata with final performance receipts.

G6. **Dependency rationale and metadata should be finalized.** The runtime stays on installed Three 0.180.0 and reuses the actual loader/BufferGeometryUtils closure rather than a CDN. This is sound and the frozen files were verified. No new major dependency was added. Research lists Rough/Paper/Inkwell/Pixi/GSAP candidates, but a dedicated implementation adoption/nonadoption decision record was not located in the final guides/handoff via text search. Add a short reason for the selected Canvas/Three approach, exact dependency/license list and the practical scope/quality limits; research itself is not a measured implementation comparison. This is a documentation gap, not a demand to install those libraries.

## Reuse/API/grammar assessment

The key architecture is substantive. A consumes arbitrary shape/alpha/rig/pose/plane/camera data; forest and harbor are different content through one renderer. B consumes replaceable pressure centerlines/cubics, explicit redraw banks, polygon glazes and event-based erasure. C builds actual Three geometry, UV atlas materials, real camera/light/depth fog and distinguishes mapped shadows/gobo from an authored graphic overlay. `prepareDeformation` captures rest positions; dust/emitter/trail evaluate from absolute age. No demo title/subject switch was found in the public renderers. The packs are not palette-only or screen-filter substitutes.

Public helpers are mostly separated below the style layer; the 43 catalog exports are real. Root SKILL links one set of modular style references; wrapper points back to the root. API docs generally describe actual behavior and unsupported fluid/retarget/skin/full-TAM limits honestly. Manifest remains v1, channels remain number/vec2/boolean/string/path. C's mixed code reads a number light event and writes the real projected actor origin as vec2 for the Canvas overlay. This is a meaningful composition relationship in code; its final mixed output was not available in the audited snapshot.

The actual reuse limits matter: B's stock paper layer is opaque, so transparent combinations should use the FX helpers as documented. Erasure masks are one rectangle per stroke, not arbitrary inferred anatomy/rotoscoping. C outlines are rigid inverted shells, internal lines authored, hatch UV seams and geometric train simplicity remain visible. C station's boxed train at 191 is weakly differentiated from a slab; improve authored detail if “train arrival” is a required reading. That is a sampled-frame production concern, not a claim that C lacks 3D or a definitive user aesthetic rejection. Rain uses deliberate empty paper and simple angular wash polygons, not convincing wet-paint fluid; this is documented approximation rather than a false fluid claim.

Lifecycle code audit: compositor disposes previously prepared layers on later prepare failure, aggregates cleanup exceptions and rejects draw after dispose; player pagehide and render-job finally invoke disposal. A/B clone scene data. C registers owned geometries/materials/textures/atlas/light rigs/mixers/renderer, with cleanup on caught prepare failures; shared outline geometry and clip root ownership are documented. I did not independently instrument browser/GPU failure cleanup because the lock was busy. A loader that fails internally before returning a GLTF object is not exercised by the saved missing-clip test (which fails after a successful load); this narrower partial-decode cleanup path remains unverified, not a proven leak.

## Required handback/recheck

Fix R1–R10 and correct R11 metadata; keep catalog experimental until the required content and current evidence are integrated. Refresh affected materialized projects and frozen revisions without overwriting authored edits. The final coordinator should run the integrated suite after C GPU work, execute the missing effects numeric probes, finish C mixed/portrait evidence, and have a new independent reviewer recheck the concrete fixes and outputs. Preserve all current reports/media as historical receipts; do not replace source-log audit with claims of direct execution.

Primary reproducible artifacts: `checks.json`, `focused-tests.log`, reviewer scripts (`probes.mjs`, `followup-probes.mjs`, `extra-probes.mjs`, `forward-test.mjs`), `forward-test.json`, `evidence-audit.json`, `evidence-source-diff.patch`, `provenance.json`, contact sheets and flash reports in this directory. The generation scripts intentionally use new scratch destinations; rerunning them in the same used paths will correctly hit the unused-project guard. Use fresh review destinations for a future independent recheck. No fixes were applied by this reviewer.
