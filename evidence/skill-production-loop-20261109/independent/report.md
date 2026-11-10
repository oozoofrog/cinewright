# Independent executed capability review: Paper greeting

The public skill route supported a new original vector subject and a subsequent faithful refinement. This is evidence for portable author-driven creation/revision, not an automatic illustrator or universal scene generator. No supported P2 capability defect was established in this run. One documentation edge case is recorded below.

## Scope and provenance

Started from root SKILL.md on the existing dirty `main` checkout, then followed references/direction.md (subject understanding), references/craft-execution.md, references/format.md, references/tools.md, and references/pose-tracks.md. Read references/craft.md for its subject/material and negative-space framing; did not verify or rely on its external historical sources. Consulted routed public materialize-kit.mjs and openRevision export. Did not read crane scene/config/runner, music-box examples, private production, handoff, .agent-loop contents, prior worker output, or memory. No descendants, installs, external services, source edits, backups, commits, or browser UI. All task artifacts are inside this independent directory. Existing headless renderer used isolated TMPDIR and store.

User delegated composition/colors/timing and later clarified artistry/readability as higher aims above technical quality. This authorized refinement did not require an invented failure. The study remains deliberately modest.

## Subject and expressive choices

Original design: an asymmetric angular teal paper bird, an ochre folded wing with pale reverse facet, a small ochre beak, an exposed round hinge, and a narrow dark stem. Cream negative space surrounds a single stationary subject. Paper is expressed by rigid planar facets and crease lines, not cloth deformation. A side-profile fixed shot was selected over a frontal symmetrical view (which could merge beak/wing) or a rotating view (which could obscure the mounting). These were authoring choices within delegated scope, not skill-generated artwork.

Action: 120 frames at 24 fps, 640×480, 5 seconds. Quiet start through frame 18; one wing opening through 44; open hold through 62; closure through 88; final hold through 119. A small 8-degree head response peaks at 58 and returns by 70. No walking, body translation, oscillatory settling, flutter, camera drift, or perpetual flapping. The still-backed intention is a restrained paper greeting followed by a small acknowledgment. No actual audience response is available.

## Canonical artifacts

| Version | Revision | Video job | Artifact |
|---|---|---|---|
| Initial | `68484f6314fa50269f6953a3ba9ee496cc2a1484bafdc38b9d2adb5fa1f5006c` | `6ed0a4ea-06e1-4ef3-9dd7-34a79ce79445` | `store/jobs/6ed0a4ea-06e1-4ef3-9dd7-34a79ce79445/work.mp4` |
| Broader greeting | `12e8108e288eac934950af77dc6ed2a55e3809d8d2a8eca7d3f7dbdeaa123d0e` | `359ad378-7735-468c-9ad1-b7eac644e8be` | `store/jobs/359ad378-7735-468c-9ad1-b7eac644e8be/work.mp4` |

Both jobs completed 120/120 frames. `comparison.json` binds source, scene, video and key-frame SHA-256 to each revision/job. `revision.json` stores complete frozen-file hashes; openRevision verified them. Each canonical job has a nonempty raw execution.log, and logs/ retains CLI output and probes.

## Observed initial output → cause → choice → correction

Before authoring the refinement, viewed initial raw PNG frames 0 and 44 at 640×480. The subject, fixed support, folded wing and beak were already readable. At peak, the wing's silhouette stayed relatively close to the tail/body. This was a restrained legitimate initial design, not an intentionally defective first pass.

The request was for a broader opening while keeping identity, mount and duration. Chose a pose-space rotation correction, adding up to 40 degrees to the original 60-degree peak. Driver is uncorrected wing angle / 60; center 1, radius 1, delta.wing 40. The scene explicitly applies the returned delta to the hinge angle. No stretched paper, new wing shape, enlarged beak, camera trick, changed duration, new topology or human movement was introduced. The source configs differ only in corrections. The scene module and work.json are byte-identical.

Then inspected both decoded MP4 contact sheets (initial-sheet.png and broader-sheet.png). Row-major frames: 0,18,30,43 / 44,45,58,62 / 75,87,88,119. Also inspected revised raw frame 44 at full 640×480. At the revised peak the ochre wing rises above the back with a more distinct upright gesture, while the beak remains on the opposite side. The initial pose had a lower, rearward fan-like silhouette. The revised pose better supports the intended raised greeting in these stills; the shape remains angular and mounted. This is a concrete readability judgment, not proof that a larger angle is intrinsically more artistic. The palette, crease treatment, composition and restrained head response remain coherent. The small head response is visible in frame 58 but its subtlety at normal playback is unverified. No professional-artwork claim.

## Checks and limits

`check.mjs` evaluates the frozen scene source across all 120 frames in forward and reverse order. It verifies identical direct/reverse evaluations, fixed mount and wing pivot, rigid wing area, one monotonic opening/closure, peak hold, unchanged head geometry/motion, and exact resting states through the final hold. Thus all integer frames around the event boundaries are checked, not just the selected contact-sheet frames. Frame 44 differs between jobs; start/end PNGs match, and frames 88 and 119 match. Geometry and key-frame hashes are in comparison.json. These deterministic checks are scene-specific and were authored for this task.

A separate public `frame REVISION 44` job (`09a19cf5-882e-4b57-8c80-8dd722bc5691`) produced the same PNG SHA-256 as frame 44 of the revision's full render. logs/seek-compare.log records this check. FFprobe confirms both videos at 24 fps, 120 frames and 5 seconds. There are no source audio clips; renderer-generated silent audio is not a listening observation.

The original and refined studies meet the scoped geometric/action invariants and are visually distinguishable. This reviewer authored these studies, so the visual assessment is not a second independent art review of its own output. Parent review remains separate. No normal-speed human playback/listening, audience response, user acceptance, physical mechanism fidelity, or professional final quality is claimed. `preview`, `review` UI, `play` UI, and observe were not used under the explicit no-browser constraint; no silent-observe failure was manufactured.

## Guidance used vs authored knowledge

Skill guidance supplied subject-first reasoning, preservation of identity, selection of rigid vector/pivot representation, event poses and holds, prepare/evaluate/draw contract, pose-track/correction APIs, materialization, frozen imports, render/revision separation, source binding, and cause/choice/correction review. It explicitly leaves new-subject drawing and evaluation to the author. Custom work supplied the bird polygon design, transform mathematics, palette/composition, timing values, correction choice, evaluator assertions and contact-sheet commands. Their success is not evidence that the skill taught those exact choices.

## Execution issue and severity

The first attempted integration called prepareCorrections([]), which failed with `corrections: samples required` before rendering any frames. Failed job `d6240ece-bee9-4af2-8f8d-6afb7236b2d4`, revision `7e181fb0b2f2f3de16a0bc4064b61d453f7180e3fbe80fc26491c2d93030f489`, and raw log are retained. Added an explicit empty-list no-op branch in the study's scene, then froze a new revision. This technical correction precedes the valid initial artistic result and is not counted as the requested refinement.

Potential documentation clarification: craft-execution.md says an empty config corrections array means no correction in its example route; pose-tracks.md does not state that prepareCorrections itself requires nonempty samples. A new author can reasonably miss the necessary guard. The observed failure supports documenting the guard/nonempty precondition. It does not prove the documented crane builder is broken, and it did not prevent completing this portable workflow. Treat as low-severity API guidance ambiguity, not an established P2 blocker. No other consequential mismatch was observed within the allowed still/headless evidence scope.

## Actual execution route

From repository root; B denotes `evidence/skill-production-loop-20261109/independent`. Render/freeze/doctor/frame used `TMPDIR="$PWD/$B/tmp"`; persistent jobs used `--store "$B/store"`.

1. Read public root/reference paths listed above; inspected cwd, git status and branch without changing existing work.
2. `node scripts/direction.mjs doctor` → logs/doctor.log.
3. `node scripts/direction.mjs init "$B/initial" --title 'Paper greeting' --frames 120 --fps 24` → logs/init.log.
4. Authored author.mjs and original scene.mjs; `node "$B/author.mjs"` materialized pose-tracks plus required motion dependency → logs/materialize.log. Replaced the generated starter module with the original bird scene.
5. `node scripts/direction.mjs freeze "$B/initial" --store "$B/store"`; rendered failed integration revision; retained logs/freeze-initial.log and render-initial.log.
6. Added study-local empty correction guard; froze initial again → logs/freeze-initial-valid.log; `node scripts/direction.mjs render 68484f6314fa50269f6953a3ba9ee496cc2a1484bafdc38b9d2adb5fa1f5006c --store "$B/store"` → logs/render-initial-valid.log.
7. Viewed initial PNG 0 and 44. Authored revise.mjs, then `node "$B/revise.mjs"` created a distinct broader project and materialized its helpers → logs/materialize-broader.log.
8. Freeze broader → logs/freeze-broader.log; render revision 12e8108e288eac934950af77dc6ed2a55e3809d8d2a8eca7d3f7dbdeaa123d0e → logs/render-broader.log.
9. `node "$B/check.mjs"` → logs/check.log and comparison.json. FFmpeg selected the 12 listed frames from each MP4, scaled to 320×240, tiled 4×3 → sheet PNGs and logs/sheet-*.log. Viewed both sheets and revised raw frame 44.
10. `node scripts/direction.mjs frame 12e8108e288eac934950af77dc6ed2a55e3809d8d2a8eca7d3f7dbdeaa123d0e 44 --store "$B/store"` → logs/seek44.log; compared output PNG SHA-256 with full render. FFprobe `-show_entries stream=codec_type,nb_frames,r_frame_rate,duration -of json` on both MP4s → logs/probe-*.log.

No broad suite was run. Existing successful render/check evidence was retained rather than repeated.
