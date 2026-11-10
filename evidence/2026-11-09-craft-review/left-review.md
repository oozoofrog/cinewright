# Left review: Cinewright 1.1.0 craft selection and execution

## Conclusion

The main supported failure is a **decision-to-execution gap**, followed by a **review coverage gap**. Cinewright already says not to fill empty time with default camera drift, not to equate readable emotion with explaining everything, and not to approve movement from stills. This production nevertheless implements most temporal variation as whole-painting magnification and pose cuts. It contains almost no independently animated environment. A better result is feasible with the same installed skill and runtime; no engine replacement, new rig system, beat detector, or generic testing framework is necessary.

There is a smaller documentation gap: the general intent chain does not concretely route **camera change, environmental motion, and performance** to separate authored choices and assets. The existing film reference demonstrates causal editing, not camera movement selection. A compact, source-grounded worked application would help more than another broad checklist or additional disciplines.

This audit does not establish a universal prohibition on repeated zooms, close-ups, emphatic acting, or stylization. It also does not establish real-time rhythmic awkwardness independently of the user's report. It identifies what this output actually does and why its implementation cannot deliver the requested separation of camera and background rhythm.

## Scope and evidence

- Repository: `/Volumes/eyedisk/develop/cinewright`, HEAD `36ab124`; pre-existing untracked work preserved.
- Installed root: `/Users/oozoofrog/.codex/plugins/cache/cinewright-local/cinewright/1.1.0`. Compared root `SKILL.md` and `references/{craft,direction,craft-execution,stillcuts,music}.md`: all byte-identical to repository versions. The wrapper routes to root `SKILL.md` (`skills/cinewright/SKILL.md:8-12`). This is not an installed-versus-source drift diagnosis.
- Output root, abbreviated **FILM** below: `/Volumes/eyedisk/Videos/MusicVideos/Counting Star/animation-v2/cinewright/scenes01-03-skill110-20261109`.
- `FILM/film/{scene.mjs,work.json}` byte-identical to `FILM/.direction/revisions/0ed9297715aaac0b49a1a9567e084143146d9338a718156161dc009ab16a5861/project/` copies. MP4 SHA-256 independently verified: `eb95fad2fdb07d546d42553fdc5eded4ac0c927eb630587c134bfa5669676016`.
- Read original storyline at `animation-v2/story/다시-하늘-cinewright-스토리라인.md:3-5,19,23`. It specifies absence of stars, shared sky, bag-light discovery, pantomime, and leaves emotional/magical presentation open.
- Independently inspected code and decoded frame states before reading `independent-review.md`. Viewed supplied contact/motion sheets, then extracted frames directly from MP4. `left-decoded-frames.png` contains zero-based frames `[0,95,96,144,191,192,240,287,288,360,395,396,450,480,509,510,533,534,557,558]`, in row order. `left-decode.log` records extraction coverage.
- Direct normal-speed playback and listening: **not performed**. Temporal implementation follows from source; perceived pacing and musical fit remain unverified here. No full test suite, installation, publication, memory write, or implementation edit.
- The latest critique defines the review objective. It should not be retroactively attributed to the original generation brief: `FILM/DIRECTION.md:3` explicitly describes fresh production without subsequent revision instructions. Older v2 style/acting instructions were not used.

## Prioritized findings

### 1. Camera motivation is asserted, while the implemented change primarily enlarges an unchanged tableau

**Evidence:** `FILM/film/scene.mjs:4-10,15-23` reads one six-panel raster atlas, crops one panel, and draws that crop across the complete output. f96–191 applies 1.00→1.12 magnification; f192–287 uses a new pose with a 1.00→1.045 magnification that settles early; f288–395 returns to panel 0 at fixed 1.10. f450–509 repeats a small 1.00→1.035 enlargement on the cat portrait. Decoded f96/144/191 and f450/480/509 show the same painted states at differing scales. No new sky information or changed gaze is authored inside these moves.

The comment at `scene.mjs:16` calls the first move motivated by her gaze. `FILM/REVIEW.md:7` repeats that it follows her gaze. But her gaze is baked into the unchanged image; the code changes its crop, not its direction, and the same sky remains empty throughout. A static gaze can motivate a camera move, so this is **not proof that every such move is unmotivated**. It is proof that the stated justification was not tested against a visible information/relationship change or a reason to emphasize this particular moment.

**Existing contract:** `SKILL.md:32-36`, `references/direction.md:76,88`, and `references/stillcuts.md:11,15` require purpose-specific choices, checking repeated default camera movement, and changing the shot/art/time structure when the cue is weak. These rules already exist.

**Consequence:** camera motion becomes the reusable treatment for held images. It can repeatedly intensify the girl/cat without advancing the opening search. This mechanism supports the user's complaint; the strength of that perceptual effect still needs normal-speed viewing.

**Minimal recommendation:** apply the existing chain to the actual camera choice: what is newly revealed or emphasized, why now, and why change framing rather than hold it? In the current opening, compare a fixed-camera version with the same narrative states. Retain a move where it demonstrably serves the selected purpose. Do not prescribe a maximum zoom count or ban slow zooms.

**Confidence:** high for implementation and documentary disconnect; limited for perceived pacing.

### 2. The asset plan cannot supply independent background rhythm

**Evidence:** `FILM/DIRECTION.md:15-17` selects six complete gouache panels, pose swaps, holds, limited camera movement, and light changes. `FILM/film/work.json:45-49` contains one active scene layer. One layer alone is not the defect: a Canvas module could animate many elements. Here, however, `scene.mjs:4-12,15-30` draws each city/character tableau as one opaque crop; the only independently time-varying painted additions are low-alpha radial glows at f96–191 and f510–533. The final glow is constant. Windows, foliage, sky, clothing, and cat remain baked into the panel. `film/motion.mjs` is not referenced by the manifest and supplies no production background animation.

**Existing support:** `references/format.md:9,16-18,33-36` supports independent layers, masks/blend, module drawing, and separate frame/exposure clocks. `references/stillcuts.md:95-97` explains that a held artwork does not stop another layer. `examples/stillcuts/scene.mjs:38,51-60` already implements independently changing reflected light with a fixed camera. `references/craft-execution.md:27-34` permits separate artwork or authored Canvas/SVG. This is an **asset/authoring choice**, not missing runtime capability or unavailable dependencies.

**Consequence:** when an environmental rhythm is requested, global enlargement moves every painted object together. It cannot make the environment breathe while keeping the character and framing quiet.

**Minimal recommendation:** decide the environmental event before commissioning artwork. Preserve the hold; author only the selected background/light element separately, with its own timing and occlusion where needed. For this story, city illumination is causally relevant; the exact event and musical relation require artistic selection and listening. Do not automatically add wind, rain, particles, or pulsing lights as a generic solution.

**True documentation gap:** the craft-execution routing table is mostly about object/pose mechanics and has no concrete environmental-time case. Add one short routing/application example using the **existing** fixed-camera reflected-light capability. A cross-link is enough initially; no new API is required.

**Confidence:** high. This evaluates fit to the latest request, not a claim that the earlier producer ignored a background-animation requirement already present in that production brief.

### 3. Readable feeling was narrowed to explicit performance and framing; the alternative lost for an untested reason

**Evidence:** `FILM/DIRECTION.md:6-7` favors gaze-linked close views partly because a shared wide makes longing weaker through a small face. `:13` maps longing to upturned face, shielding-eyes pose, and waiting. Decoded f192/240 foreground the raised hand and upward face. The storyline `:3` establishes habitual waiting and absence of stars; it does not require this emphatic gesture. At f534–557 the code uses panel 5 with fixed 2.25 crop (`scene.mjs:29`), then cuts to the full panel at f558. **This is a static reaction insert followed by a cut, not a continuous 2.25× zoom.**

**Existing contract:** `references/craft-execution.md:11,15,17` explicitly distinguishes readability from explaining all meaning and asks for representative tests of structurally different choices. `SKILL.md:22,32` requires alternatives and their causal choices. `references/craft.md:14-17` already supports object→reaction editing; the bag→noticing sequence is a real successful application worth preserving.

**Consequence:** a broad emotion label becomes a reason to enlarge the face or strengthen a pose before the wide/negative-space relation is tried. This gives a concrete origin for the current over-explicit feeling. It does not prove that the pose is universally bad acting or that close-ups must be removed.

**Minimal recommendation:** preserve the bag-light discovery and required directional attention. Compare the actual understated alternative at representative duration and size before rejecting it on face size alone. Add one compact worked craft comparison showing how the same intent can be carried by relation/absence, a small performance change, or an explicit reaction. Tie selection to this user's desired degree of explicitness; do not institutionalize subtle acting as the only correct style.

**Confidence:** high for the decision trace; moderate artistic interpretation, strengthened by the user's explicit rejection of overt expression.

### 4. Frame-based acceptance identified narrative legibility but left the consequential camera/pacing question open

**Evidence:** `FILM/REVIEW.md:7-13` retains nearly all intervals, flags f288–395 as needing playback, and fixes compositing/exposure. `:23-25` acknowledges weak waiting, magnified art resolution, and absent direct viewing/listening. `FILM/independent-review.md:3,11` explicitly limits its favorable verdict to frame review; `:23` identifies weak opening progression and says timing needs playback. `:29` says no required fixes **before user review**, not that artistic quality is proven.

**Existing contract:** `SKILL.md:12,35-38`, `references/direction.md:78,82,94-98`, and `references/music.md:35` separate technical checks, full-time experience, independent review, audience response, and acceptance. These are already adequate distinctions. The producer and reviewer honestly disclosed missing playback; no evidence supports accusing them of fabricating listening or user approval.

**Consequence:** no identity replacement, no compositing seam, and readable light→reaction were sufficient for presenting the excerpt, while repeated crop movement and weak emotional progression did not receive a temporal judgment. That verdict cannot answer the user's subsequent criticism about camera rhythm. Frame sampling also emphasized f510 onward; the provided dense motion strip does not examine the opening zooms.

**Minimal recommendation:** retain “usable initial excerpt” as a limited delivery judgment. Record camera/temporal/acting fit as unresolved until a normal-speed viewing/listening review that addresses the actual critique. Reuse the stable technical evidence. When playback is unavailable, do not turn “no observed blocking defect” into “keep” for the unobserved temporal quality; either leave that dimension unverified or rely on actual user playback feedback, clearly attributed. Do not add another mechanical gate or scoring system.

**Confidence:** high for coverage and verdict limits. Whether any earlier lead overstated this verdict is outside the inspected evidence.

## What is genuinely missing, versus already written

| Area | Existing guidance | Supported smallest adjustment |
| --- | --- | --- |
| Camera drift / filling holds | Explicitly discouraged in root skill, direction, stillcuts | Enforce against actual framing choices; add a short concrete application, not another prohibition |
| Environmental motion with held character | Supported API and fixed-camera light example already exist | Route to this example when rhythm belongs in the world; select/supply the needed asset before rasterizing everything together |
| Emotional restraint | Preserve ambiguity; compare structural alternatives; explicitness is a choice | Demonstrate an alternative whose meaning comes from relation/absence, and connect choice to the current brief |
| Causal editing | Hitchcock-derived object/reaction guidance already present and applied | Preserve the useful bag insert→reaction→shared space sequence; do not claim it justifies unrelated opening enlargement |
| Playback and acceptance | Evidence separation already explicit | Keep temporal quality unresolved when unobserved; act on current audience/user feedback without invalidating stable technical checks |

## Recommended scope for the orchestrator

1. First fix the selection/execution habit using the existing criteria: separately decide what changes in framing, world, and performance. This is a compact production decision, not an obligatory multi-field form for every shot.
2. If changing the skill, make one small entry/reference routing adjustment and one relevant worked application. A general motion-mechanics demo alone cannot teach this particular selection judgment. Use established craft sources only for the claims they actually make; the present Hitchcock citation concerns causal editing, not a theory of zooms.
3. If a later authorized production trial is useful, use the same runtime: fixed framing through a meaningful hold, a separately authored environmental event, and the existing causal discovery cuts. Treat this as a comparison candidate, not a newly invented directing rule or promised audience response.
4. Obtain a normal-speed camera/pacing assessment against the exact user critique. No new technical regression suite is justified by this read-only diagnosis.

No proposal diff or implementation changes were made. Only this review and its scoped decoded-frame evidence were created.
