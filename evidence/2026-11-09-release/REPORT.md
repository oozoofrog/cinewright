# Cinewright 1.1.0 release evidence

Authorized: publish main, update installed Codex plugin through supported machinery, remove standalone skill after replacement validation. No backup, memory edit, unrelated settings, or session restart.

Preflight: owned by oozoofrog; main and origin/main at f33ea610613d902cdbc995f08d60f810621a8fc2. Existing dirty source preserved. No additional filesystem AGENTS.md found in repository ancestry. Public origin: git@github.com:oozoofrog/cinewright.git. No established tags or GitHub release workflow found.

Curated scope: 232 files. Latest root skill and craft-execution/subject-understanding guidance; animation/pose tracks, motion, FX, experimental styles, rig/retarget/watercolor, music ingest/analysis/remux/flash, compositor lifecycle, authored examples/assets/recipes/catalogs, regression tests, plugin-only installation instructions, synchronized package/lock/manifests/marketplace versions. Full staged file list: staged-files.txt.

Excluded: .agent-loop, docs research/reviews/handoffs/working plans, all new evidence/media/stores, private production .direction, local audit/render/evidence scripts. Existing tracked history preserved. Only git info/exclude changed locally to exclude this evidence directory.

Provenance: repository records describe silhouette/line-wash assets, GLBs and rig fixtures as original procedural/authored CC0 work. Inspected expressionist metadata, derivative traveler provenance/hash, and rig LICENSE files. Music examples contain original geometry/SVG and no source audio/video; publication clearance for a source recording is not claimed. Three remains pinned MIT with materializers/freeze retaining licenses. No external art/film/font/recording was added by this release. This records repository provenance evidence, not independent legal clearance.

Packaging: root and wrapper quick validation; version parity; staged diff check; staged private-path/generated-media audit. Python validator initially lacked PyYAML; rerun successfully with temporary uv dependency environment. Static imports in materialized effects2d and GLTFLoader vendor modules are resolved by materialization, not source-relative standalone import.

Verification: checkout npm test: 487 passed, zero failures. See npm-test.log. Copied staged source npm ci and doctor/init/freeze succeeded, see copied-npm-ci.log and copied-smoke.log. Full copied suite result follows. Tests establish implementation behavior, not artistic quality, audience response, actual recording clearance, or user acceptance.

Standalone audit: no non-dependency file absent from development checkout. Local-only research and authoring scripts have identical source copies. Differing source files are older versions of release changes, not unique projects; see standalone-audit.json and standalone-differences.diff. Native fresh discovery initially confirmed two standalone entries and one plugin entry, see skills-before.json.


Publication: commit 36ab1241d58cb4ccb5af6b7ac42922adf8969d45 pushed normally to origin/main. Remote SHA verified. No tag/release created because no established tag/release workflow exists. Copied-source suite: 487 tests, 483 passed, zero failures, 4 skipped (two private craft-production checks, one actual dancer baseline check, one historical frozen watercolor comparison). Checkout suite exercised all 487 successfully. Logs: copied-npm-test.log and npm-test.log.

Native installation: `codex plugin marketplace upgrade cinewright-local --json` succeeded with no errors, marketplace snapshot HEAD matches release. `codex plugin add cinewright@cinewright-local --json` installed version 1.1.0 at /Users/oozoofrog/.codex/plugins/cache/cinewright-local/cinewright/1.1.0. plugins-after.json confirms installed=true and enabled=true. No manual cache replacement. installed-hash-parity.json confirms all 1,539 published tracked files match SHA-256 exactly. Wrapper routes to installed root SKILL.md. Installed root npm ci, doctor (Canvas/WebGL2/media/browser), init, freeze and style list passed. Logs: installed-npm-ci.log, installed-smoke.log, installed-styles.json.

Removal: /Users/oozoofrog/.codex/skills/cinewright deleted after replacement passed validation. No unique user projects/data found; every non-dependency file had an owning source counterpart. No backups created. Inventory hashes only: removed-standalone-inventory.json. Current development/source copies of internal documents and authoring scripts remain local.

Fresh discovery: supported app-server `skills/list` with forceReload=true returns exactly ONE Cinewright entry, cinewright:cinewright, enabled with pluginId cinewright@cinewright-local, rooted at version 1.1.0. See skills-after.json and skills-after-summary.json. Existing running sessions may retain previously loaded skill instructions; use a new chat for the refreshed instructions. No active T3/Codex session was restarted or killed. Verification used its own short-lived app-server protocol client without an agent/model run.

Remaining dirty files: only untracked local-only .agent-loop/, docs/, new evidence directories, and 13 production/audit scripts. See remaining-status.txt. Tracked worktree and index are clean. Source publication, installation, and technical verification are complete; no new artistic/audience verification was performed.
