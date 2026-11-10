# Subject-understanding correction — 2026-11-09

## Scope and real failure

The user corrected the skill with: “뮤직 박스의 특징이 뭔지 더 캐치를 스킬이 할 수 있어야합니다.” The implementation brief reports that earlier work overfocused on anatomy and smoothness. This update makes subject identity a prior decision and a separate shot-review gate. It does not assess or modify the current animation or finalize its pose API.

Source context inspected: [paper/printed examples](../../examples/music-box-dancer/README.md), [articulated porcelain study](../../examples/music-box-dancer/porcelain/README.md), [production brief](../../.direction/productions/music-box-dancer-redesign-20261108/brief.md), and [integration decisions](../../.direction/productions/music-box-dancer-redesign-20261108/reports/integration-notes.md). These contain authored choices, not universal music-box properties. The current assignment explicitly requires preserving accepted arm actions and character/story identity. No new listening or playback was performed.

## Four scenario walkthroughs — author self-review only

These are hypothetical inputs, not additional user quotations or executed productions. The decision column records this editor's application of the revised guidance. The last column is a future output check, not an observed pass.

| Scenario input | Decision from revised guidance | Concrete output check |
| --- | --- | --- |
| Reference footage establishes a rigid fixed figurine rotating with its base; the skirt is sculpted. No independent limb action is requested. | Preserve relative pose and sculpted skirt. Use the evidenced axis/support and timing; smooth rotation is permitted. Choose scale, light and surrounding space so the attachment and material can read. Do not add human weight transfer, skirt flutter or winding gestures. | Fail if limbs dance independently, the skirt flutters without a selected transformation, or framing hides the defining support relationship. Smoothness alone cannot pass. |
| Accepted fantasy direction establishes an externally supported figurine coming to life and explicitly opening its arms. Construction is only partly shown. | Preserve the arm action, character and story. Allow articulation/life alongside the music-box setting. Inspect assets before deciding which parts deform; do not invent rigid cloth or freeze the arms. Apply support criteria to the actual support rather than demand unassisted human balance. Ask only if unresolved construction changes the core interpretation. | Fail if the arm opening disappears, identity changes, support continuity breaks, or added anatomical realism makes the shot read as an unrelated human dance. |
| Only the song title Music Box Dancer is supplied; no physical object or instrumental source is established. | Do not infer a mechanism, porcelain figure, instrument, mood or beat synchronization. Inspect supplied recording/direction/assets first. Record acoustic claims only from listening or identified sources. If an object-versus-dancer distinction remains essential, ask that distinction; otherwise retain it as an open authored choice. | Fail if the title is cited as proof of instrumentation or mechanism, or an unheard attack/decay is reported as observed. |
| Accepted direction depicts a living human dancer outdoors in a textile dress, with no mechanical conceit. | Use the accepted human identity, material and movement intent. Select appropriate weight, deformation, composition and phrasing criteria. The music-box reference does not impose mechanical timing, fixed pose or rotation. | Fail if the skill adds joints, a base, rigid clothing or repetitive clockwork behavior merely because it learned this correction. |

Self-review finding: all four decisions have an explicit route in the revised instructions. The living-figurine case preserves the requested action; the title-only case withholds unsupported facts; the human case prevents mechanical overgeneralization. This is author reasoning against scenarios, not independent forward-testing or measured model behavior.

## Static checks and packaging boundary

[Full check log](checks.log) preserves the initial `ModuleNotFoundError: No module named 'yaml'`. The existing `.direction/aesthetic-toolkit-2026-11-08/validation-venv/bin/python3.15` then ran the requested `quick_validate.py` successfully on both repository root and `skills/cinewright`. No environment installation was needed.

Local Markdown destinations and referenced heading anchors in the two entrypoints and three references resolve. The two marketplace descriptors still target `./`; the unchanged thin router resolves `../../SKILL.md`. Tracked-source `git diff --check` passes. These are syntax/link/source-routing checks, not behavior tests or deployment proof.

Changes are confined to local repository skill guidance and this evidence directory. No animation, production output, pose tests, lead-owned dancer evidence, installed skill/cache, commit, deployment, backup or memory write is part of this update. Installed paths and manifests are unchanged. The new reference belongs beside existing references under the repository root; a later authorized installation must carry it with the root entrypoint. Installed content and new-session loading were not checked. Independent behavior validation and judging the resulting production shot remain for the lead; no delegate was started.

## Lead closure

The separate reviewer applied the revised guidance to four hypothetical briefs without reading the author walkthrough. See [independent application](independent-application.md). The lead read all four responses and confirmed fixed-figure rigidity, preservation of fantasy arm actions, restraint on title-only acoustic/mechanical claims, and the nonmechanical human case. No required instruction changes were identified. This is bounded forward application, not measured improvement over the old skill or rendered subject recognition. One report attribution was corrected: the hypothetical briefs were authored by the lead, not quoted from the user. Repository source validation is complete; installed/global copies remain unchanged.
