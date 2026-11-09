# Expressionist-space package

Renderer: `modules/styles/expressionist-space/index.mjs`. Authoring and honest limits: [style guide](../../../references/styles/expressionist-space.md). Exact exports: [descriptor](../../../modules/styles/expressionist-space/descriptor.json).

`author.mjs` deterministically authors original station/laboratory/portrait JSON and two embedded UV/animation GLBs. `effects.mjs` authors the isolated material/deformation/clip fixture. `build.mjs PROJECT station|laboratory|portrait|effects [--update]` calls the shared materializer with an explicit local asset map. `build-mixed.mjs PROJECT [--update]` adds a Canvas layer sharing a light event and the actual 3D specimen's projected screen origin. Both builders retain generated-file ownership protection. Mixed builder's second write is preflighted but not a second atomic directory transaction; on failure a valid base project may remain and `--update` can finish it.

Focused CPU tests: `node --test tests/expressionist*.test.mjs`.

Full frozen browser/media checks: `node examples/styles/validate.mjs PROJECT STORE OUTPUT`. It covers reverse/random seeks and PNG hashes, source detachment/reload, autoplay, four prepare/dispose cycles, 192-frame 540p and 1080p video jobs, ffprobe PTS and flash screening. Run for station, laboratory, effects and mixed. Portrait: append `--no-video`.

Extra actual color/alpha and resource probes: `node examples/styles/expressionist-space/browser-probes.mjs PROJECT STORE OUTPUT` (use effects project). This checks a known sRGB gray plane with opaque and half alpha on black/white, transparent corners, actual shader compilation, local GLB loading, repeated lifecycle and failed clip preparation followed by valid preparation. Both browser scripts acquire the common GPU lock once and release it in finally. An occupied lock fails fast; coordinator runs them when available.

Evidence is in `evidence/aesthetic-toolkit-2026-11-08/C/`. Read the handoff for what actually ran; commands are not success evidence. No independent review or human aesthetic acceptance is implied.
