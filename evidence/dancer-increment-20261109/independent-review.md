# Independent review — dancer bounded increment

Reviewed 2026-11-09 in `/Volumes/eyedisk/develop/cinewright`. Review only; no delegation, source edits, installs, browser UI, commits, backups, deployment, or memory changes.

**Verdict:** The bounded visual increment is acceptable at the inspected still/sequence level. No production-blocking regression was found. One P2 API validation defect requires correction before treating the reusable module's finite-input contract as complete. This is not normal-speed playback approval, listening approval, or final art acceptance.

Baseline job: `3adacb52-9f7c-40a7-8049-e88b2fcead97`. Candidate job: `c06457a6-6994-4041-88ee-3378a8cc4204`. Candidate revision: `5ab6b666890a0d782985d4c1ef5f98fc0f540d033b73353473b31635d614f6df`. Candidate media: `.direction/productions/music-box-dancer-redesign-20261108/intro-16/renders/dancer-craft-20261109-r2.mp4`.

## Required fix — P2: reject sparse vectors before evaluation

**Location:** `modules/animation/pose-tracks.mjs:3`; affected consumers at lines 20–24, 46–54, 63–66, and 70–73. The identical project and frozen module copies contain the same defect. `tests/pose-tracks.test.mjs:14–20` does not cover missing vector components.

`Array.prototype.every` skips holes, so `shape([, 1])` incorrectly returns dimension 2. This contradicts the finite-coordinate validation documented in `references/pose-tracks.md:3`. A missing authored coordinate can pass preparation and poison geometry instead of producing an early error. This affects all four vector consumers, not just interpolation.

Reproduction from the repository root (executed during this review):

```js
import {
  prepareTrack, prepareCorrections, prepareContacts, constrainTarget
} from './modules/animation/pose-tracks.mjs';
const gap = [, 1];
prepareTrack([
  {frame: 0, value: gap}, {frame: 10, value: [2, 3]}
]).at(5);
// [NaN, 2]
prepareCorrections([
  {center: 0, radius: 1, delta: {offset: gap}}
]).at(0);
// {offset: [<1 empty item>, 1]}
prepareContacts([
  {channel: 'toe', from: 0, to: 10, target: gap}
]).at(5);
// {toe: [undefined, 1]}
constrainTarget([0, 0], gap, {max: 5});
// {point: [NaN, 0], distance: NaN, residual: NaN, reachable: false}
```

Required change: validate every coordinate index, including holes, and reject sparse vectors consistently. Add focused regressions for these public entry points. Synchronize the project copy using the existing packaging procedure; preserve the historical frozen revision. The present candidate uses dense finite vectors, so this finding does not invalidate its existing image comparisons.

## Source and semantic assessment

- `prepareTrack` copies input values and returns fresh arrays. Evaluation has no history or randomness. Binary-search selection, exact hold transitions, out-of-range holds, and outgoing-segment interpolation are consistent with the documented contract. Bezier parameters are captured by value. No additional ordinary-input correctness defect was identified.
- Corrections are compact-support additive samples driven by one scalar pose variable. The implementation divides by `max(1, weightSum)`, so isolated corrections fade toward zero and overlapping weights above one normalize. This matches the documentation; it is not a learned deformation model.
- Contacts are authored targets in half-open windows, with ordering and overlap checks per channel. `returnDiagnostics` compares existing pose toes to those targets. It does not apply contact targets to the pose. `constrainTarget` performs a radial point clamp and reports residual/reach; it does not solve joints or lock feet.
- `return-craft.mjs:28–31` uses a fixed diagnostic reach envelope of 8–164. This is not an exact frame-dependent two-bone feasibility certificate. The actual arm is constructed from explicit segment lengths in lines 21–24; tests separately verify those lengths. No solver claim should be inferred from the reach flag.
- `model-v8.mjs:44` restricts the new pose adapter to `330 < frame < 372`. Its baseline function is otherwise unchanged. `dancer.mjs:11,18` introduces optional elbow rounding and forearm bow; default values retain the prior geometry. The far arm, face, background, and cloth authoring remain intact. The near-arm timing still follows the far arm into the closing gesture.
- Repository, project, and frozen copies of both `pose-tracks.mjs` and its sole dependency `motion.mjs` were independently hashed during review. All three copies match for each file. Module SHA-256 is `9968603057349e0c77c363c6f7f68034db21b05cd6fdd76b772586d73c09a620`; dependency SHA-256 is `fea589f724d62f7cdf9cf39ff82cf635f37becf60cfb9bcb85d3ffa02ed19619`. Relative imports form a self-contained copied package.

## Independent visual observations

I opened all five requested images before reading audit results or producer aesthetic conclusions: `return-comparison.png`, `candidate-every-frame.png`, `baseline-every-frame.png`, `f346-native-detail.png`, and `landmark-trails.png`, under `intro-16/stills/dancer-craft-20261109-r2/`.

The comparison shows the candidate near forearm staying extended longer before lowering and folding inward. At f346 the baseline elbow has a sharper transition into the descending forearm; the candidate elbow/forearm transition is rounder. The candidate hand stays attached and retains a readable silhouette. The closing action remains legible, with the far hand leading and the near hand arriving afterward. The sampled f360 and f372 poses agree visually.

Across the f330–372 strips, I did not observe a new contour break, detached hand, abrupt silhouette replacement, or loss of the closing gesture. The landmark trails show a continuous altered wrist arc; they do not establish velocity quality by themselves. The strips are reduced crops, so this conclusion is bounded to visible sequence continuity and the f346 native detail. They do not certify every frame's native-resolution contours or normal-speed rhythm. No playback or listening was performed.

## Evidence reused and acceptance limits

- Read `repository-tests.log`: 481 passed, 0 failed, 0 skipped. Read `focused-tests-final.log`: 4 passed, 0 failed, 0 skipped. These are existing execution records; I did not rerun the expensive suite.
- Read `final-audit.json` and `lead-verification.json`. The lead's complete hash comparison reports changed PNGs only at **f335–359 inclusive (25 frames)**, with **359 identical PNGs**. The producer's 343 protected PNGs is the minimum scoped preservation assertion, not the actual unchanged-frame count. I reused that exhaustive comparison rather than recomputing it.
- Protected v9 f48–143 and the final hold are covered by the preserved-frame evidence. The media report records matching input PCM and preserved v9 audio range; AAC output is lossy. Audio preservation evidence is not listening evidence.
- The second case at `tests/pose-tracks.test.mjs:22–28` exercises different crane coordinates, linear and held tracks, radial constraint geometry, contact boundaries, and clearance correction outputs without dancer dependencies. This establishes fixture-level API reuse. It does not establish a rendered crane production or an integrated contact/correction solver. Those are limits, not additional required scope for this bounded increment.
- Review-time work was limited to source inspection, image inspection, the malformed-vector probes above, and copy hashes. Full probe outputs are preserved in the required-fix section. Source diffs confirmed the scoped adapter and contour additions; `diff` returned 1 because the expected differences exist, not because execution failed.

Accept the current candidate as a bounded visual increment on this evidence. Fix the P2 malformed-vector contract before declaring the reusable API complete. Final art acceptance remains a separate decision based on actual viewing and listening.
