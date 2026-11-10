# Line-wash evidence and reproduction

From repository root:

```sh
node --test tests/line-wash*.test.mjs
node examples/styles/line-wash/build.mjs .direction/aesthetic-toolkit-2026-11-08/B/rain rain
node examples/styles/line-wash/build.mjs .direction/aesthetic-toolkit-2026-11-08/B/commuter commuter
node examples/styles/line-wash/build.mjs .direction/aesthetic-toolkit-2026-11-08/B/portrait portrait
node examples/styles/validate.mjs .direction/aesthetic-toolkit-2026-11-08/B/rain .direction/aesthetic-toolkit-2026-11-08/B/store evidence/aesthetic-toolkit-2026-11-08/B/rain-final
node examples/styles/validate.mjs .direction/aesthetic-toolkit-2026-11-08/B/commuter .direction/aesthetic-toolkit-2026-11-08/B/store evidence/aesthetic-toolkit-2026-11-08/B/commuter-final
```

Build paths must be unused; for owned projects use `build({project,variant,update:true})` from the module. Validator exclusively acquires the toolkit GPU lock and fails immediately when busy. Full validation reports frame count, PTS, browser seek and flash-screen scope; this is not human viewing or acceptance. `rain-full` and `commuter-full` are earlier frozen revisions, before final authored refinements. The `rain` directory is an earlier browser-only run. See the separate final reports for the corresponding revisions.
