# Reusable creation/correction capability — implementation handoff

The root skill now routes both new creation and existing-result correction to `references/craft-execution.md`. That reference maps subject evidence and accepted action to representation/assets, authored keys/breakdowns and timing, existing prepare/evaluate/draw plus materialization, actual rendering, cause-specific correction, and bounded evidence/stop decisions. It distinguishes geometry, pose, timing, deformation, compositing, and art-source failures with conditional examples. Existing subject guidance and authority rules are retained.

## Product writes

- `SKILL.md`: focused route and runnable command, appended within the existing production section.
- `references/craft-execution.md`: focused operational reference, input/config guide, independent first-pass and correction commands, different-subject adaptation, diagnosis and revision binding.
- `references/tools.md`, `references/pose-tracks.md`: execution-reference links; preceding edits preserved.
- `examples/crane-clearance/{build.mjs,scene.mjs,run.mjs,first-pass.json,clearance.json}`: one original vector functional study. Builder creates exclusive fresh projects using existing materializeKit. Project-local relative imports work frozen. Runner connects existing freeze/render/findJob/openRevision/checksum, records two independent revisions/jobs, and diagnoses frozen source. No new engine, editor, schema requirement, dependency, or public generic helper was necessary.
- `tests/craft-execution.test.mjs`: meaningful collision/endpoints/contact/release/reach/random-seek and changed-geometry/timing materialization/import/prepare/freeze invariants, plus overwrite refusal.

No `.agent-loop` state, private production, existing output, global install/settings, commits, publication, backups, or memory writes. Existing uncommitted work was retained. Main branch, original checkout.

## Fresh commands (repository root)

```sh
node examples/crane-clearance/run.mjs ./crane-study
# Direct creation with authored clearance: no first-pass store is required.
node examples/crane-clearance/build.mjs examples/crane-clearance/clearance.json ./new-transfer
node scripts/direction.mjs freeze ./new-transfer --store ./new-transfer-store
# Use returned revision and job IDs with normal frame/render/review.
node scripts/direction.mjs render REVISION --store ./new-transfer-store
```

For a different crane, copy/edit either JSON and pass its path to build.mjs. For another subject, author the drawing/evaluator/assets using the reference's decision table; crane config is not a universal automatic subject generator. New destinations must not exist. Generated source/work/scene are directly authorable and frozen normally. Timing/size fields baked into work.json must be updated with source.json. No private baseline, home path, frame interval or song is in product source.

## Produced outputs and observed correction

Evidence root: `evidence/skill-production-loop-20261109/implementation/verified-demo`.

- First pass revision `d73936b8be740e5e1446017e62309e2ba0cbde2a6a03f93f52ee141784752b1a`, job `0339fcf8-9377-40f7-a5f2-36d81a8c8c4f`.
- Clearance revision `e3f5775da83aaf3e87c7fdb255c66a46482c6f214e41c5a2a9bb62bba2da02e0`, job `e3f6dcf8-428e-45b7-aa39-7507a133995d`.
- Each `store/jobs/JOB/work.mp4` is 640x360, 24fps, 72 frames; each job retains all PNGs, execution.log and job.json. `comparison.json` binds canonical job/revision IDs, output/source SHA-256 and all frozen-source evaluation rows. Both use the same public builder/materialize/freeze/render path.

First-pass endpoint interpolation places the parcel through the obstacle on frames 25–35. This is a plausible omitted intermediate path, not an intentionally distorted art baseline. The correction config changes only one authored pose-space sample: driver = uncorrected hook x, center 300, radius 180, hook delta [0,-110]. It lifts the transfer arc; timing, parcel geometry, endpoints and landing remain unchanged. Geometric collision count becomes zero across all 72 rendered integer frames. Endpoint poses are identical; cable remains reachable; parcel remains on the platform during hook release/lift.

Direct image inspection: compared both rendered frame 30 PNGs. Before: orange parcel overlaps the vertical tan obstacle. After: parcel is suspended entirely above it. Also inspected corrected frames 25,48,60,71: clearance at approach; parcel bottom on the right platform; hook disconnects; parcel stays while hook lifts. These are direct still observations, not direct normal-speed playback/listening or subjective professional-art acceptance. Outputs have no production-process explanatory text.

## Checks and evidence

- `final-regressions.log`: 16 passed, 0 failed/skipped. Command: `node --test tests/craft-execution.test.mjs tests/pose-materialize.test.mjs tests/pose-tracks.test.mjs tests/motion.test.mjs tests/phase02-materialize.test.mjs tests/craft-binding.test.mjs`. Existing optional private tests happened to execute in this checkout; they are not prerequisites of this increment.
- `public-only-tests.log`: 3 passed, 0 failed/skipped, new capability plus public materialization only. These tests run without private production; temporary fresh directories are created and cleaned up. Tests import project-local generated modules and frozen modules and change geometry/timing.
- `verified-demo.log`: full successful public build/import/freeze/evaluate/render run, two full videos; job execution logs retained under verified-demo/store/jobs.
- `demo.log`: initial runner integration failure after successful first video: snapshot field was incorrectly named dir instead of root. Fixed, then reran to exclusive `verified-demo` destination. Initial outputs/logs retained.
- `skill-validation.log`: requested skill-creator validator attempted but unavailable because Python lacks `yaml` (`ModuleNotFoundError`). No dependencies installed. Routed local links and unchanged root frontmatter manually checked; see link-and-hash-check.log. This is not a full validator pass.
- `sources-before.json`, `sources-final-before-checks.json`, `sources-final-after-checks.json`, `sources-delivered.json`: before/during/after SHA-256. Final regression inputs unchanged across the test run. Only subsequent product edit added direct-first-pass commands to craft-execution.md; public-only checks rerun. See delivery-check.log. status-before.txt preserves initial dirty inventory.

## Limits

The example demonstrates authored rigid 2D vector transport and a spatial-path correction. Collision uses axis-aligned rectangle geometry, not a physical collision solver. Contact targets are applied explicitly by scene policy; reach is radial cable constraint, not IK. Pose curves and correction samples are authored, not automatic biomechanics or professional art generation. Other subjects require source artwork, representation and scene-specific control mapping. Full repository suite, independent fresh-agent different-subject use, direct real-time playback, audience/user acceptance and integration/loop closure remain with the root. No independent review was prewritten or simulated.
