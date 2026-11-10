# Left Brain implementation report

Completed the two assigned implementation/integration gaps. No agents, loop-state writes, production pose/draw/audio edits, rerender, install, backup, commit, publication, or memory writes. Existing dirty work was retained. Branch: main. Subject assessment belongs to Right Brain/parent.

## Confirmed contracts and changes

- `craft-render.mjs` previously defaulted to r2; diagnostics imported mutable project modules; comparison/playback hardcoded r2. All four now require an explicit selected label through `craft-selection.mjs`. Render preflights a fresh namespace across reports/renders/stills before project writes or freeze. Existing r2/r3 invocation fails immediately. Legacy manually copied modules are not adopted into a ledger: matching bytes remain in place, missing files may be copied, divergent authored bytes fail before mutation.
- The helper checks the selected report against canonical `store/jobs/<id>/job.json`, requires completed full-size 384-frame video settings, constrains output to that job's `work.mp4`, and calls existing `openRevision` for content verification. Diagnostics import candidate modules from that frozen snapshot and validate/import the frozen baseline. Comparison uses the helper before opening frames, checks candidate and baseline revision/job plus the complete landmark frame sequence, and derives frame directories from canonical jobs. An arbitrary absolute output path cannot substitute for the selected job.
- Consumers accept `SELECTED_LABEL [NEW_REPORT_LABEL]`; the second argument is a safe report namespace, not a renamed job or arbitrary output directory. Existing reports/stills are refused. New diagnostics labels are preflighted across the evidence namespace. Automatic playback includes selected revision/job identity and explicit direct-viewing/listening false flags.
- `pose-tracks` is now in `materializeKit` with dependency `motion`. The public API reference has a working materialization/import example independent of `.direction`. `references/tools.md` supplies the discovery route. Existing ownership checks are reused; pose API behavior is unchanged.

Exact source/docs/test writes (12):

1. `scripts/materialize-kit.mjs`
2. `tests/pose-materialize.test.mjs` (new)
3. `tests/craft-binding.test.mjs` (new)
4. `references/pose-tracks.md`
5. `references/tools.md`
6. `.direction/productions/music-box-dancer-redesign-20261108/intro-16/README.md`
7. `.direction/productions/music-box-dancer-redesign-20261108/intro-16/craft-implementation-handoff.md`
8. `.direction/productions/music-box-dancer-redesign-20261108/intro-16/authoring/craft-selection.mjs` (new)
9. `.direction/productions/music-box-dancer-redesign-20261108/intro-16/authoring/craft-render.mjs`
10. `.direction/productions/music-box-dancer-redesign-20261108/intro-16/authoring/craft-diagnostics.mjs`
11. `.direction/productions/music-box-dancer-redesign-20261108/intro-16/authoring/craft-comparison.py`
12. `.direction/productions/music-box-dancer-redesign-20261108/intro-16/authoring/craft-playback.mjs`

## Current checks

All paths below are relative to this evidence directory unless stated otherwise. Full logs are nonempty.

- `targeted-regressions.log`: **16 passed, 0 failed, 0 skipped**, using `node --test tests/pose-materialize.test.mjs tests/craft-binding.test.mjs tests/pose-tracks.test.mjs tests/music-box-dancer.test.mjs tests/phase02-materialize.test.mjs`. Includes public materialization byte equality/import operation, dependency and helper authored-modification protection, ledger/content idempotence, unrelated-file preservation, selected frozen module import despite a conflicting mutable test-owned module, stale report/landmark and altered frozen bytes rejection, escaped output rejection, missing/existing render-label refusal, existing pose regressions, materializer integrations, and synthetic headless frozen-frame seek. That integration records its own evidence at `.direction/test-runs/music-box-dancer-Bh25jQ`.
- `initial-tests.log`: first fixture run failed because the new minimal revision fixture used an invalid empty layer array. Fixed the test-owned manifest. `focused-development.log`: 3/3 passed after correction. These preliminary runs precede the final source snapshot; they are not the final fingerprint-bound run.
- `r3-diagnostics.log`: actual existing r3 frozen revision, 384 rows, 343 protected pose objects, authored contact-target assertions passed.
- `stale-comparison-rejection.log`: deliberately selected r2 with newly generated r3 landmarks. Exited nonzero with `Landmark revision/job mismatch` before creating stills or opening frame data.
- `r3-comparison.log`: correct r3 selection passed; 343 protected PNGs including 96 v9 PNGs match baseline; final hold identical; contact and reach residuals zero. These are technical checks, not artistic acceptance.
- `r3-automatic-playback.log`: headless existing `observe` completed. 383 callbacks, first 0, last 15.958333 seconds; duration 16 seconds, audioPeak 0.37671998143196106. The JSON report contains full observation details. This is automatic playback, not direct viewing/listening.

All actual production checks selected `dancer-craft-20261109-r3`, revision `b4639dfd33a88003d48108c547d3345ce9872029b19e26ae718c8ff0b2dac963`, job `a63eb813-e8f5-4bea-ab3f-b006da01da31`. New report label: `dancer-craft-r3-gap-closure-20261109`. No render or cloned job record was needed. New outputs are three `intro-16/reports/<report-label>-{landmarks,comparison,automatic-playback}.json`, five PNGs under `intro-16/stills/<report-label>/`, and automatic observation samples in `intro-16/store/review/observe-qwwfb1/`. Exact artifact paths and hashes: `generated-artifacts.json`.

## Source/evidence binding

`sources-before.json` and `sources-final.json` enumerate SHA-256 for changed sources plus relevant check inputs. Their common fingerprint is `550749c6f233d852905bab46a19b94a5a9ebd6704a7efdfad124373a5f099163`. Captured before and after the final regression/actual-r3 checks; inputs remained identical. `fingerprint-before.log`, `fingerprint-after.log`, and `fingerprint-verification.json` contain the check results. `preserved-before.json` records all **3,326** pre-existing files under intro-16 project/store/reports/renders/stills, including frozen revisions/jobs and old r2/r3 evidence. Every recorded hash still matches after checks. The immutable baseline manifest is evidence, not a backup copy.

## Limits and remaining concerns

No expensive full render or full repository suite was repeated. Fresh-render success is not newly claimed; missing/existing label refusal and actual frozen-job consumption are checked. Historical 481/481 and r2 seek evidence retain their historical scope. The new private-production binding tests skip when this untracked/private authoring directory is absent; the public pose materialization test has no private dependency. Global installed Cinewright remains unchanged. Direct normal-speed viewing/listening, subject assessment, final art acceptance, and loop closure remain with the parent; technical residuals and automatic playback do not discharge those items.
