# Line and wash

Use this pack for paper-space drawing where the appearance and disappearance of individual marks carry the action. The rain study leaves much of the paper empty; the commuter uses drawn contours, clothing folds and a change of hand-held object. It is less suitable for photoreal wet paint, automatic rotoscoping, or unprovided character performance. It does not simulate fluid, absorption or the range of any historical painting tradition.

## Authoring grammar

Scene v1 uses canvas pixels, origin at top left, positive y down, and integer output frames. `size`, `fps`, `frames`, `seed`, `strokes`, `washes`, and optional `erasures`, `hatches`, `stipples` are JSON data. Each stroke has a unique `id`, `points` of `[x,y,pressure]` (pressure 0–1), or cubic `segments` of four such points, plus `width`, `color`, `from`, `to`. Reveal is proportional to centerline arc length between the frame endpoints; zero-length centerlines are rejected. Cubics subdivide until the control points are within the requested paper-pixel tolerance of their chord, or throw at the depth limit. Pressure interpolates through the subdivision. Avoid extreme magnification without reducing tolerance.

A stroke may have a `bank` of `{frame,points}` with identical point counts and ordering, `mode: "hold"` or `"linear"`, `every` exposure in frames, and optional `boil` amplitude in pixels. Correspondence is authored; mismatched topology throws. `boil: 0` holds lines stable. The bank consumes exposed time; reveal and erasure consume output frame. Each erasure `{id,from,to,residue}` attenuates that stroke from full opacity to residue and persists after `to`; overlapping unmasked events multiply. An optional `mask: [x,y,width,height]` confines one event per stroke to a paper-space rectangle; the remainder stays intact. This reconstructs marks from the event ledger rather than a previous canvas.

Wash polygons specify `points`, `color`, `alpha`, `layers`, `edge`, `from`, `to`: repeated translucent fills and an edge stroke approximate glaze and pigment, without fluid. Hatches and stipples accept bounds, tone, and `anchor` (`paper`, `object`, or `screen`); callers choose the coordinate transform. Dabs and grain use fixed seeds and paper coordinates. Leave deliberate open areas and keep a meaningful contact baseline. Limit camera changes and hold the pose long enough to read it. Replacing the arrays changes geometry and content; there are no scene-name switches.

## Use

```js
import {prepareStroke, strokeAt, drawStroke} from './modules/fx2d/stroke.mjs';
import {redrawAt} from './modules/fx2d/redraw.mjs';
import {erasureAt} from './modules/fx2d/erase.mjs';
const pen = prepareStroke({points:[[0,0,.2],[100,50,1]], width:4, from:0, to:24});
const tip = strokeAt(pen, .5); // arc-length sample
const opacity = erasureAt([{id:'ink',from:24,to:36,residue:.1}], 30, 'ink');
// drawStroke(context, pen, .5); then combine with other Canvas layers.
```

The style entry exports synchronous `validateScene(scene)` and asynchronous `prepare(api,{scene})` or `prepare(api,{sceneFile})`; the result supports `evaluate(t)`, `draw(g,t,state)`, and idempotent `dispose()`. `evaluate` requires `frame` and optionally `exposed`; output is plain JSON-compatible state. Draw into a Canvas2D context in the logical canvas coordinate system. No new channel kinds or GPU resources are used. Other reusable exports are `brushDabs`, `drawDabs`, `paperGrain`, `drawWash`, `hatchLines`, `stipplePoints`, `interpolatePoints`, and `redrawAt` in their respective `modules/fx2d` files.

Build with `node examples/styles/line-wash/build.mjs PROJECT rain` (or `commuter`, `portrait`). Freeze and test using `node examples/styles/validate.mjs PROJECT STORE OUTPUT`; it performs actual frozen browser, seek, autoplay, disposal and full 540p/1080p jobs. Frames 0, 48, 72, 104, 144 and 191 expose start, change and settle. In rain, look for the disappearing diagonals and emerging puddle and leaves; in commuter, inspect feet around 72, the folded letter around 104 and its replacement around 144. Failure signs include a moving paper grain, mismatched line topology, illegible hands, sliding feet, or muddy overlapping glazes. Automated tests cannot establish artistic acceptance or continuous human viewing.

Each scene includes authored replaceable data; source and CC0 provenance/hash are in `examples/styles/line-wash/assets/provenance.json`. The current figures are hand-authored point contours, not a general anatomy or motion system. Pigment edges are strokes, not diffusion; hatch lines are not automatically clipped, and the renderer paints an opaque paper background, so use helpers directly for transparent mixed compositions. Maximums and cleanup appear in the style descriptor.

Independent-review correction: cubic subdivision also bounds pressure deviation (0.005), so a geometrically straight curve can retain varying pressure; total flattened points are capped at65536 and derived length must remain finite. The commuter now has explicit `contacts` ranges with fixed paper-space shoe poses during stance and raised swing poses. Matching ankle contours are authored with the same points (`author-contact.py`); this improves contact without claiming an IK solver. The revised videos are in B/commuter-reviewed. Public dab spacing and wash finite-alpha validation fail before drawing.
