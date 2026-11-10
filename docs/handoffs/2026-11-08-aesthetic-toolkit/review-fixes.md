# Independent review 01 대응

Original report: evidence/2026-11-08-aesthetic-toolkit/independent-review-01/report.md. It requested changes; the original evidence/scripts remain unchanged. Coordinator fixes below are implementation claims pending independent recheck, not reviewer approval.

| Finding | Implemented correction | Direct regression / output |
|---|---|---|
| R1 contact gait | original authored planted-shoe intervals, raised swings, matching ankle contours and stable stop before letter; no IK claim | author-contact.py, scene.contacts; style-review-regression.test; B/commuter-reviewed |
| R2 A preflight | required shapes per type, all pose-bank correspondence, object/reveal spans, alpha bounds/local paths, halo/shadow/clock/transform/critical-pair data checked before prepare | style-review-regression + silhouette/style-common tests |
| R3 assets | style-owned collectAssets for A/C, complete local scene references, image header/local SVG restrictions and embedded GLB chunk/buffer bounds checked before stage writes; missing/invalid required asset cannot publish | materialize-style, collectAssets; malformed GLB/missing alpha tests; existing update authored-byte protection retained |
| R4 pressure | subdivision considers pressure deviation0.005 as well as geometric flatness, preserving interior pressure of a straight cubic | midpoint pressure0.25 regression; B rain/effects output refreshed |
| R5 helper validation | positive finite dabSpacing, finite wash alpha/edge, bounded stroke coordinates±1e6/width≤4096/tolerance1e-6..64 and finite derived length; integer scene intervals | negative/overflow/invalid interval tests; valid scenes preserved |
| R6 allocations | max65536 flattened points/stroke, max250000 prepared points/line-wash scene including redraw banks; early actionable errors | near-limit/over-limit probe + effects bounds tests; docs/catalog limits updated |
| R7 geometry | pure validateGeometry shared in factory/scene; constructor-specific positive integer subdivisions/dimensions; generated position/normal/UV finite check with cleanup | box/sphere/cylinder/torus invalid subdivision regressions; C current-source pixels compared to final videos |
| R8 match reveal | authored reveal.shape resolved to prepared Path2D and passed to common transition helper | specific runtime independent recheck requested; direct sample bridge test included in prior reviewer probe |
| R9 portrait | foreground opening widened, retaining end-state face separation; original portrait-v2 retained | reviewed-source/A/portrait PNG and current browser checks |
| R10 transition | finite output frame, exact finite vec2 center, bounded span and clamp tested before/from/to-1/to/after | style-effects-limits and review regression |
| R11 provenance | circular self hash removed, payload hashes retained; exact Python interpreter version in A/B metadata | exact SHA regressions and new generated assets |

Additional evidence gaps: C completed all five final validations/eight videos and final color/alpha/resources probes after reviewer snapshot. Root 2D numeric pixel probes passed on retry, with half-alpha 127/128 rounding explicitly allowed; failure logs retained. First complete npm regression passed423/423 before these fixes; final post-fix suite must be reported separately. Existing valid A/C videos are tied to new source by browser pixel equivalence, rather than silently relabeling earlier revisions. B gait/pressure and affected effects receive new videos. A portrait receives fresh browser/representative frames.

C loader partial-decoding failure before returning a GLTF object remains uninstrumented. Pre-publication binary/chunk/local dependency checks reduce malformed inputs, but no claim of arbitrary corrupt-texture loader cleanup is made. Valid load, missing clip after load, compositor partial prepare failure, repeated style/renderer disposal and resource counters are actually checked. Human continuous viewing/listening/accessibility and aesthetic acceptance remain unverified.
