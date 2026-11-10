# Right review: established craft, selection, execution, and acceptance

Review date: 2026-11-09. Read-only review; only this artifact was written. No descendants, implementation edits, installation, publication, commits, or memory writes.

## Conclusion

Repeated zooms do exist in established filmmaking. They are not inherently amateurish, and beat synchronization is not inherently wrong. The supported diagnosis here is narrower: repeated image enlargement carries much of the visible motion while the chosen dramatic situation changes little; environmental animation requested in the latest feedback is absent; and frame-based approval cannot settle the reported camera awkwardness or musical pacing. Cinewright already warns against these defaults. The smallest effective change is to make its existing craft guidance operational at shot selection and review, not add a new directing doctrine or another general checklist.

The original production brief also matters. `DIRECTION.md:3` says this fresh run intentionally ignored earlier revision instructions. Therefore the latest restraint/background-rhythm feedback is the current review requirement, not proof that the original worker knowingly violated that earlier instruction. Do not import older v2 style requests.

## Evidence and limits

- Repository `/Volumes/eyedisk/develop/cinewright`, HEAD `36ab124`; existing untracked material preserved. Root `SKILL.md` and the five inspected references match the corresponding installed 1.1.0 files by `diff -q`.
- Film directory, abbreviated **F** below: `/Volumes/eyedisk/Videos/MusicVideos/Counting Star/animation-v2/cinewright/scenes01-03-skill110-20261109`.
- Independently read `F/film/scene.mjs` and viewed `F/contact-sheet.png` before reading the producer and independent reviews. Sheet frame mapping is documented in `F/REVIEW.md:15`: 0, 144, 240, 360, 396, 480, 510, 520, 533, 534, 558, 582.
- Narrative source: `/Volumes/eyedisk/Videos/MusicVideos/Counting Star/animation-v2/story/다시-하늘-cinewright-스토리라인.md:3-5`: absent stars, cat under the same sky, light from the magical bag. This review does not require a later physical approach within the excerpt.
- No direct full-rate playback or listening occurred in this review. Implementation and sampled images support the mechanism findings; perceived smoothness, phrase timing, emotional intensity over time, and audience response remain outside direct verification. Current user dissatisfaction is evidence of that user's response, not a population result.
- Memory quick pass used only the repository/artifact verification boundary in `MEMORY.md:44-46`; no historical aesthetic judgment was imported. Current paths and source were checked live.

## Established craft sources and their actual scope

1. **Zooms can carry repeated, specific expressive functions.** [Benjamin B, “Zsigmond Zooms,” ASC](https://theasc.com/post/the-film-book/zsigmonds-zooms/) combines an interview with cinematographer Vilmos Zsigmond and the author's analysis of the end of *McCabe & Mrs. Miller*. Zsigmond describes learning zoom use from Altman and combining zoom with dolly/pan/tilt. The article documents three closing zoom-ins. Its interpretation—Miller's isolation/introspection, McCabe's death, then Miller's inward withdrawal—is the article author's analysis, not a quoted statement of Altman's intent. This is a concrete counterexample to a universal zoom ban. Its expressive progression does not validate every repeated enlargement.
2. **Restrained emotion can be carried by objects, looks, and editing.** [Hitchcock, “My own methods,” BFI / Sight and Sound](https://www.bfi.org.uk/sight-and-sound/features/alfred-hitchcock-my-own-methods), *Sabotage* passage: Hitchcock explains the hand/eyes/knife sequence and explicitly contrasts it with exaggerated facial acting. This is a director's account of a specific method, not a rule that close-ups or broad acting are forbidden. It already underlies `references/craft.md:9-17`, but the reference omits the source's especially relevant restraint rationale.
3. **Music-video beat alignment is a choice, not the whole timing vocabulary.** [Michel Gondry in the Walker Art Center Regis Dialogue with Jonathan Rosenbaum, 2007, PDF p.3](https://s3.amazonaws.com/wac-imgix/cms/Michel-Gondry-Regis-Dialogue-Formatted.pdf): Gondry describes his early insistence on cutting on the beat as restrictive and stiff, then distinguishes his deliberate return to it in *Star Guitar* and *The Hardest Button to Button*. On pp.10–11, Rosenbaum reads the latter video's treatment: instrument duplication and performer displacement follow musical events. This supports deliberate audiovisual mapping; it does not establish that every music video should avoid beats or use camera movement. For this user, assigning rhythmic life to the environment is a project-specific choice consistent with that distinction.
4. **Animation acting can develop within a pose.** [Dana Boadway-Masson, Animation Mentor, “10 Advanced Acting Performance Tips for Animators”](https://www.animationmentor.com/blog/10-advanced-acting-performance-tips-for-animators/), sections 1–4: simplify acting, combine stillness with motion, let a change of thought motivate major pose changes, and give emotional transitions readable time. Her lesson also discusses layered rhythms and occasional audiovisual emphasis. Application here: replacing every hold with a new emphatic pose or crop is unnecessary; a restrained performance can retain a pose while attention changes. This does not impose restrained acting on unrelated genres.
5. **Background animation is not synonymous with secondary action.** [Kevin Koch, Animation Mentor, “Secondary Action”](https://www.animationmentor.com/blog/secondary-action-the-12-basic-principles-of-animation/): secondary action is subordinate behavioral business that supports character/subtext; hair or hat motion caused by another motion belongs to secondary motion/follow-through. Thus environmental motion, character secondary action, and physical follow-through must not be merged into one vague “add secondary animation” instruction. The user's requested environmental rhythm need not involve extra emotional gestures.
6. **Editing rhythm follows information and performance as well as duration.** [Walter Murch interview, MovieMaker, “Cutting from the Heart”](https://www.moviemaker.com/walter-murch-cutting-from-the-heart-3217/), questions about rhythm/transitions and genre: Murch describes attention shifting when information has landed, performance rhythms influencing cuts, and landscape duration depending on preceding rhythms. Application: evaluate the waiting–discovery progression and the viewing context rather than impose uniform holds or fixed numerical limits.
7. **Crop movement is a valid still-image technique with a limited claim.** [Apple Education, “iMovie for Mac: Photos”](https://education.apple.com/learning-center/T024625A-en_US), “Make photos move”: customize pan/zoom to reveal important details or emphasize a significant image region. This confirms the technique and its possible information function. It is not independent cinematography authority or evidence that this excerpt's camera work succeeds.

These sources were opened and read during this review. Film excerpts embedded in sources were not watched here. No recalled production example is used as direct playback evidence.

## Supported findings

### 1. Main priority: existing anti-default guidance is not being converted into shot decisions

**Evidence.** `F/film/scene.mjs:6-10` samples a rectangular region of one raster panel and stretches it to the full output. At f96–191, scale grows from 1 to 1.12; f192–287 adds another 1 to 1.045 ramp; f288–395 holds at 1.10; f450–509 adds a 1 to 1.035 ramp (`:17-23`). The girl/sky search is reiterated across these early images. The f534–557 reaction is a fixed 2.25 crop, then a cut to a wider view at f558 (`:29-30`), not another animated zoom.

**Contract.** `SKILL.md:33`, `references/direction.md:76-78`, and `references/stillcuts.md:11-16` already reject default camera drift and replacing missing temporal purpose with movement. `references/craft-execution.md:17` says to change art/direction when curve tuning cannot address the cause.

**Impact and interpretation.** Several changing crop scales provide conspicuous formal activity without corresponding new scene action. The source comment calls the opening move motivated by the girl's gaze (`:16`), but a label does not establish what the changing frame reveals. My sampled-image judgment is that the gesture, upturned face, and enlargement repeatedly emphasize searching; the user reports this as overly explicit and awkward. The code confirms repetition, not the universal aesthetic verdict.

**Scope/confidence.** High for crop mechanism and existing guidance; moderate for redundant emphasis; no direct pacing judgment. There is no beat input or detection in this scene implementation, so do not describe it as technically beat-synced. Its initial motion begins at f96, which the producer identifies as music onset, but that is not recurring beat binding.

**Minimal response.** Extend the existing film/stillcut selection paragraph with a practical distinction: a static composition preserves a relation; a cut changes selected information/viewpoint; a crop move changes emphasis within an existing image; a spatial camera move changes viewpoint and may change parallax/occlusion. Choose the means for the particular attention change or an explicit formal pattern. Whole-panel crop cannot create independent environmental movement or newly visible scene geometry. Keep expressive/repeated zoom available. Do not introduce a zoom quota, magnitude limit, or compulsory camera justification form.

### 2. The selected asset form cannot supply the requested environmental rhythm

**Evidence.** `F/film/scene.mjs:4-12,15-30` uses one six-panel image and radial glow overlays. There are no independently animated background elements. The opening glow and bag glow are genuine animated overlay values; saying “nothing is animated” would be inaccurate. `F/DIRECTION.md:15-17` explicitly selects six paintings, limited camera/light change, and pose replacement.

**Contract.** The latest user request wants environmental animation to carry rhythm, with restrained emotion. `SKILL.md:21,32-33` requires visible means to implement the chosen intention. `references/stillcuts.md:15,18` already distinguishes what changes and asks for relevant environmental response.

**Impact.** Reducing zoom amplitude alone will leave essentially static environment art. A change to asset separation or authored environmental animation is needed if that request is later implemented. This is a production-choice limitation, not evidence of a missing renderer capability.

**Minimal response.** In the existing means-to-assets table (`references/craft-execution.md:25-34`), add environmental motion as a separately authored layer/region/time behavior. Tie it to the selected scene and musical phrase, preserving the main point of attention. Do not prescribe universal drifting particles, flickering windows, wind, parallax, or constant motion. No actual environment motif has been approved in this review.

### 3. The film reference underuses its own primary source for restrained staging

**Evidence.** `references/craft.md:11-16` reduces the Hitchcock example chiefly to space → object detail → reaction. The source explicitly addresses avoiding exaggerated facial emotion. `F/DIRECTION.md:6-7,13` favors clearer face expression and an added searching pose; f240 shows the large shielding-eyes pose and f534 isolates the reacting face. Both are legitimate devices, but their accumulation is relevant to this user's stated discomfort.

**Impact.** The current formulation can be executed as repeated emotional illustration instead of inference through selected information. This is a limited guidance gap plus a project-specific artistic mismatch, not proof that a close-up or shielding gesture is intrinsically defective.

**Minimal response.** Expand the existing Hitchcock entry by one application sentence: when restraint is intended, let a look, object, spatial relation, and the order of disclosure carry the inference before intensifying pose or face. Retain the visible bag-light → notice relationship. Reuse the current source rather than add an unrelated canon or rewrite all six disciplines.

**Continuity boundary.** The f396 wide establishes girl and cat in shared space; f450 isolates the upward-looking cat; f510 bag detail, f534 downward look, and f558 shared view provide a plausible causal/spatial sequence. No confirmed axis violation is found. Whether the cat reads as independently watching the sky or already watching the girl is ambiguous in the sampled images, and was subsequently noted in `F/independent-review.md:16`. A generic 180-degree checklist would not resolve that semantic eyeline target. Left should verify the intended target and exact frames before recommending any staging change.

### 4. Review scope is honestly disclosed, but cannot certify this specific craft result

**Evidence.** `F/REVIEW.md:9,23,25` leaves waiting duration and direct viewing/listening unverified. `F/independent-review.md:3,11,23,29` explicitly approves only presenting an initial excerpt for user review, from frame-based evidence. It does not claim real-time viewing or audience acceptance.

**Contract and impact.** `SKILL.md:12,35-38` and `references/direction.md:82,94-98` already distinguish technical checks, original-time playback, independent criticism, and user acceptance. Therefore the previous review is not fraudulent or a proven bad gate on its own. The acceptance failure would be promoting “no observed blocking visual defect for presentation” into “camera rhythm/emotional tone passed.” That promotion must not occur now, especially after the user's negative response.

**Minimal response.** Retain the existing evidence separation and mark motion/pacing judgments unresolved until direct playback with the source audio. Then assess the chosen user intent, not just continuity or artifact absence. No new numeric artistic score, mandatory repeated review rounds, or new gate system is needed.

## Minimal integrated recommendation

Preserve the root workflow. Make a compact amendment in the existing craft/stillcut guidance covering camera/crop selection, restrained inference using the already-cited Hitchcock passage, and the distinction between environmental motion and character performance. Add only the needed environment asset row to craft execution. Link musical timing to the existing phrase/rest/tension guidance (`references/stillcuts.md:16`), with Gondry as a short sourced example of deliberate synchronization versus automatic beat cutting. Do not rewrite music ingestion or pretend analysis data is listening. Apply current playback/acceptance requirements rather than expand the checklist.

## Conclusions Left should verify

1. Confirm the scene/frozen-output identity and exact crop ranges before treating live source as final-render evidence; my review checked live source and the existing contact sheet, not the frozen revision contents.
2. Confirm no other imported drawing path supplies independent environmental animation or beat binding; the inspected scene has none.
3. Check the f396/f450 cat eyeline against the “same sky” intent and f510/f534/f558 causal continuity. Do not convert ambiguity into a confirmed continuity defect.
4. Check whether any parent handoff actually upgraded frame-review approval to full artistic acceptance. The reviewer itself explicitly limits the claim.
5. Confirm that proposed amendments supplement existing guidance rather than duplicate it, and preserve zoom, broad acting, stylization, stillness, and beat mapping when deliberately appropriate to another brief.

Full-rate camera feel, musical phrasing, and the user's acceptance remain for direct review; neither this report nor source citations settle them.
