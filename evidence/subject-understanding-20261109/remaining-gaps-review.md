# Remaining gaps — independent omission audit

Reviewed 2026-11-09. English report to lead. Repository: `/Volumes/eyedisk/develop/cinewright`, branch `main`, existing dirty worktree preserved. This report is the only file written. No delegation, source/skill/production edit, render, installation, commit, UI browsing, or broad test run.

**Conclusion:** Three consequential follow-ups remain: revision-bound reproduction, public discovery/materialization of the pose helper, and application of the new subject-understanding gate to the actual production. The last is an outstanding production assessment, not a demonstrated defect in the revised guidance or proof of bad rendered art. No new ordinary-input pose-evaluation defect was established in this audit.

Paths below are repository-relative. `P` abbreviates `.direction/productions/music-box-dancer-redesign-20261108`; `I` abbreviates `P/intro-16`.

## 1. P2 — regeneration can overwrite r2 evidence and label current-source diagnostics as r2

**Classification:** Reproduction/evidence-binding defect.

- `I/authoring/craft-render.mjs:6–17` accepts a label argument but defaults to `dancer-craft-20261109-r2`. It copies current modules, freezes current project sources, and overwrites the selected label's module/job reports and MP4.
- `I/authoring/craft-diagnostics.mjs:2–12` imports the mutable `project/model-v8.mjs` and `project/return-craft.mjs`, hardcodes the r2 label, then stamps the current-source rows with the revision/job read from the r2 job report. There is no check that those sources belong to that revision.
- `I/authoring/craft-comparison.py:4–6,37–38` hardcodes r2 and combines that job's frames with those landmarks. It does not check that the landmarks' revision/job match the selected frames. `I/authoring/craft-playback.mjs:3–6` also always selects r2.
- `I/craft-implementation-handoff.md:33–44` says labels may be changed and warns about overwrites, but the executable recipe still invokes the default render and hardcoded r2 consumers. The r3 addendum at lines 59–65 preserves r2 as historical evidence without supplying an r3-safe regeneration recipe. `I/README.md:26` points users to `craft-render.mjs` without a label.

**Reproduction by source trace; deliberately not executed:** Following the recipe without arguments now freezes the sparse-vector-fixed source under the r2 report names. Passing a fresh label only to `craft-render.mjs` leaves subsequent diagnostics/comparison/playback targeting r2. After a future pose edit, diagnostics can certify mutable new poses under an old r2 revision identifier. This is stronger than a cosmetic stale label.

**Smallest follow-up:** Require or consistently accept one fresh label through render, diagnostics, comparison, and automatic playback. Load candidate diagnostic modules from the selected job's frozen revision; assert matching revision/job before comparison. Update the recipe to pass the same label throughout and preserve the existing r2/r3 records. Verify argument selection and evidence binding without rendering again merely to rename evidence.

**Existing evidence remains usable:** This finding does not invalidate the lead's r3 equality result. Current pose/module sources and render script match all five SHA entries in `evidence/dancer-increment-20261109/review-closure-r3.json`. That closure explicitly records identical r2/r3 PNGs and mixed PCM. The risk is regeneration and future edits, not a newly established mismatch in the stored r3 output.

## 2. P2 — reusable pose support stops before the normal discovery and module-copy path

**Classification:** Incomplete reuse integration, not failure of direct imports.

`scripts/materialize-kit.mjs:7–26` has no pose-tracks entry. Lines 79–94 reject any name outside the catalog before reading or writing files. The following read-only negative probe was executed from the repository root:

```js
import {materializeKit} from './scripts/materialize-kit.mjs';
try {
  await materializeKit({
    project: '/dev/null/omission-review-must-not-write',
    modules: ['pose-tracks']
  });
} catch (error) { console.log(error.message); }
// materializeKit: unknown module pose-tracks
```

The destination is never reached: rejection occurs at line 83 before `writeOwnedFiles` at line 94. No temporary project was created.

`references/pose-tracks.md:25` instead instructs manual copying of the helper and `modules/motion.mjs`. Its example is functional with those copies, and the production implements this manually at `I/authoring/craft-render.mjs:9–10`. However, root `SKILL.md`, `references/tools.md`, and `README.md` contain no pose-tracks route. A fresh user following the primary skill/tool entrypoints has no cue to find the reference. Discovery currently depends on the research README (`docs/research/2026-11-09-dancer-craft/README.md:51`) or private production handoff. The API reference's concrete copy/SHA example itself points into private `.direction` production material.

**Smallest follow-up:** Add `pose-tracks` to the materialization catalog with dependency `motion`; add one task-relevant entrypoint link and a public materialization example in the pose reference. Add a focused materialization check covering both copied files and a working relative import. Reuse the existing ownership and freeze conventions. A new CLI, rendered crane production, editor, or broader engine is not needed.

## 3. P2 — the new subject gate has not closed the actual production assessment

**Classification:** Outstanding application/validation step. Not a hidden failure of the skill-only assignment and not evidence that the figure must be rigid.

The new rule is explicit: `references/direction.md:23–29` requires source-backed subject features, permitted choices, and observed success/failure in the actual shot. `references/music-box.md:7–9,15–26` distinguishes subject types, preserves approved arm action, and labels its living-figurine example as conditional rather than a diagnosis of this production. `references/craft.md:7` routes craft decisions through that assessment.

The inspected production documents do not close that chain:

- `P/reports/integration-notes.md:13–15` selects the painted cel character and music-box setting, then identifies costume/pose continuity issues. It does not establish the current figure's material, drive/support interpretation, or which deformations express that subject.
- Earlier `P/motion/handoff.md:26,47` already notices rigid material versus cloth and asks the lead to reconcile the living-figurine scope if rigid limbs conflict with the action. This is useful prior conditional reasoning; it is not a recorded resolution under the new gate.
- `I/project/return-craft.mjs:9–17,25–31` retains cloth channels and authored toe targets; `I/craft-implementation-handoff.md:12–16,29,65` documents the bounded arm change and limitations. Neither establishes that the actual subject's identity/support/material is read successfully in r3. Toe residual zero does not answer that question.
- `evidence/subject-understanding-20261109/validation.md:5–7,28–32` explicitly excludes assessment/modification of the current animation and leaves judging the shot to the lead.
- `independent-application.md:5,20,31,42,55,59–63` contains four hypothetical planning responses, all without rendered output or listening. Its stated scope is accurate. It is not a measured old/new behavior comparison and cannot discharge the actual-shot gate.

**Smallest follow-up:** Apply the new guidance to the existing approved assets, direction, and r3 output. Record a short production-specific chain: source location → confirmed feature or explicit hypothesis → allowed movement/material/support choices → observed output time and verdict. Preserve the approved arm opening/return and identity. Treat uncertain material as uncertain; do not assume porcelain, a rigid skirt, clockwork timing, or human balance requirements. Inspect existing output before deciding whether any edit is necessary. This requires assessment, not automatic rerendering or redesign.

The normal-speed viewing/listening gap remains separately disclosed in `I/README.md:5–7`, `I/craft-implementation-handoff.md:65`, and the r3 closure. Complete that review before claiming motion phrasing, musical relationship, or final artistic acceptance. This audit performed no viewing/listening and makes no new aesthetic pass/fail claim.

## Boundaries and evidence preserved

- **Sparse-vector defect is closed.** `modules/animation/pose-tracks.mjs:3` now uses `Array.from(v).every(Number.isFinite)`. `tests/pose-tracks.test.mjs:22–30` covers missing coordinates. The r3 closure records focused tests 5/5. All five current-source hashes in that closure were independently recomputed and match. No redundant test run was needed for this omission audit.
- **Full-suite scope stays historical.** 481/481 is pre-fix; `I/craft-implementation-handoff.md:61` says so. Do not report it as a post-r3 run. Existing r2 still/strip review can be reused within its original scope because the lead records pixel identity. It does not become normal-speed viewing or listening evidence.
- **Guidance is discoverable and appropriately conditional.** `skills/cinewright/SKILL.md:8` routes to root; root `SKILL.md:12` links the subject section and music-box reference. The inspected guidance distinguishes facts, hypotheses, and authored choices. The scenario exercise does not reveal a mandatory instruction correction. Adding a rigid-figure mandate would contradict approved-action preservation.
- **Installation is a disclosed deployment limitation.** Read-only existence checks confirm `/Users/oozoofrog/.codex/skills/cinewright` lacks `modules/animation/pose-tracks.mjs`, `references/pose-tracks.md`, and `references/music-box.md`; its entrypoint also lacks the new root guidance. `README.md:30` explains that installation is a separate copy. `P/brief.md:34` excludes global updates, and the skill update report preserves that boundary. Do not classify this as an unauthorized missed installation or install during this audit.
- **No new optional scope disguised as a defect.** Contact application/foot locking, exact physical support simulation, automatic material inference, learned corrections, a rendered second production, and statistical old/new skill evaluation are not promised by this bounded implementation. The crane case proves fixture-level API reuse only. The report above asks for the missing integration and assessment, not these expansions.

Recommended order: repair revision binding and the reproduction recipe; finish pose discovery/materialization; apply the subject gate to existing r3 evidence and perform the still-outstanding direct playback/listening review before final artistic closure. Keep current production unchanged unless that assessment identifies a concrete failure.
