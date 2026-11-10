# Astra 독립 최종 검토

경로 정리와 작업별 로컬 커밋은 구현됐다. 다만 **모든 요청 조건을 충족했다고 판정하지 않는다**. 새로 추적된 store 텍스트 22개, 최초 임시 백업의 소실, 일부 콘텐츠 커밋의 순서 예외가 남는다. 추적 해제·이력 재작성은 하지 않았다. 브라우저 실행을 제한한 테스트 결과도 완전한 브라우저 검증을 뜻하지 않는다.

검토 대상 구현 HEAD는 `6faf5686ed15190b84c9cdffb3375f85fdb2be0d`다. 리드가 직접 수행한 [해시·Git·개정 검증](lead-review.json)을 남겼다. `main`은 `36ab1241d58cb4ccb5af6b7ac42922adf8969d45` 그대로다. 이후 리드 보완 커밋은 이 문서, 색인 연결, figures ignore 예외와 검토 증거만 포함한다.

- 대체 원본 기준 14,994개 최종 파일을 실제 읽어 SHA-256을 재계산했다. 대응 경로는 모두 고유하고 불일치·누락은 0개다. 동일 바이트 14,700개와 경로 보정 텍스트 294개는 [예외 목록](path-only-original-exceptions.json)으로 구분한다. 최초 임시 명세와의 독립 대조는 불가능하므로 최초 시점부터의 완전 보존 증명으로 확대하지 않는다.
- 첫째·둘째 개정 커밋을 각각 남아 있는 편집 전 사본과 직접 대조했다. 셋째 개정의 15개 문서 해시는 외부 대체 사본과 일치한다. 이후 스킬 문서 12개는 동일하고, `references/styles/expressionist-space.md`, `silhouette-theatre.md`, `watercolor-physical.md` 세 파일에는 evidence 경로 문자열만 바뀌었다.
- 순수 이동 커밋 `41bb19a`, `83e0f1d`, `482ec1d`의 1,569·37·2개 변경을 전부 `R100`으로 확인했다. 제품 modules/runtime/package 및 의존성 diff는 없다. 근거 루트의 낱개 파일은 0개이고 미분류 항목은 없다.
- 기존 추적 미디어 428개의 Git blob을 이전 HEAD와 대조해 모두 유지됨을 확인했다. 새 미디어 blob 추가는 0개다. 대표 이미지가 없는 현재 상태에서도 향후 `evidence/<작업 ID>/figures/`의 png/jpg/jpeg/webp/gif를 추적할 수 있도록 빠진 ignore 예외를 보완했다. Git ignore는 크기를 판별하지 못하므로 500KB 제한은 스테이징 전 개별 확인 규칙이다.
- 전후 테스트 원문 해시와 집계는 각각 489개 중 468개 통과·21개 실패·skip 0으로 일치한다. 실패 제목도 동일하다. native Chromium은 삭제 금지 준수를 위해 실행하지 않았으므로 21개는 이 실행 조건의 한계다. 원문 기록을 재검사했으며 제품 코드 변경이 없어 전체 테스트를 반복하지 않았다.
- 추적 용량 기준은 시작 시 미커밋 문서를 포함한 작업 트리 143,458,509바이트다. 원래 HEAD의 Git blob 합계 143,426,238바이트와 구별한다. 구현 HEAD는 154,495,433바이트이고 리드 검토 파일만큼 최종 합계가 더 늘어난다. 최종 수치는 리드 커밋 뒤 인계에 적는다.
- 기존 다른 loop 70개와 `.direction` 경로는 유지했다. 테스트가 만든 `.direction` 폴더 452개·파일 914개 목록은 [기록](direction-final-summary.json)에 있다.

[링크 재검사](lead-links-summary.json)는 같은 검사기를 리드가 다시 실행한 결과다. 검사기는 코드 블록을 제외하고 Markdown 인라인·참조형·이미지·HTML 링크와 앵커를 다루며, `.git/node_modules/.direction/.agent-loop`의 문서는 검사 범위에서 제외한다. 새 보고서와 색인 연결까지 포함해 신규 끊김 0을 확인한다. 이전부터 누락된 경로 432개(.direction 178개, 기타 내부 경로 254개)와 참조 문법 경고 2개는 보존했다. 본문에 적힌 누락 절대 경로는 [별도 상세 목록](historical-broken-references.json)에 있다.

남은 결정은 이 브랜치의 병합 여부, 향후 push·플러그인 배포 여부, store 텍스트 22개의 추적 해제를 별도로 허용할지 여부다. 미분류 자료에 관한 결정은 없다. 최초 백업 소실과 이미 발생한 커밋 순서 예외는 현재 금지 조건 아래에서 소급해 해소할 수 없다. 현 상태와 한계를 보고하고 사용자 승인이나 전체 요건 충족을 대신 기록하지 않는다.

## 로컬 커밋 목록

작업 ID는 각 커밋 본문에서도 확인할 수 있다. 마지막 리드 보완 커밋의 자기 해시는 포함할 수 없으므로 `git log -1 --format='%H %s'`로 확인한다.

| 해시 | 제목 | 작업 단위 |
| --- | --- | --- |
| `483dba6756a753996569fcddd38630effade0eee` | Document authored code expression and relation studies | 2026-11-10-code-expression |
| `036582dcee577e66dfe0d49be71fb1dfaad431c4` | Document motion authoring guidance and verification | 2026-11-10-motion-authoring |
| `2bb71d099a9986025e28d88728b39ca7c703a181` | Clarify audience acceptance and required defects | 2026-11-10-audience-acceptance |
| `d3e435e333d13bdd0d28a2cc776019e86f76eb09` | Preserve aesthetic toolkit research and review evidence | 2026-11-08-aesthetic-toolkit |
| `ee7a9bac694b7103e483311630d2e6ea7a79b993` | Preserve phase02 toolkit contracts and verification | 2026-11-08-aesthetic-toolkit-phase02 |
| `4538a79b59ec41cc26530085ae0165903314b370` | Preserve cinematic animation implementation evidence | 2026-11-08-cinematic-animation-implementation |
| `80c84e3d46b9ed5c6d32babb2a3fccec36c1879c` | Preserve cinematic animation independent reviews | 2026-11-08-cinematic-animation-review |
| `105122854c2df2b2824137c631d06099b1ebfcb9` | Preserve established craft review and source research | 2026-11-09-craft-review, 2026-11-09-dancer-craft |
| `88d40296d65d789f539e340c6213eba2abedb1b5` | Preserve dancer increment validation records | 2026-11-09-dancer-increment |
| `af5fb96ad556664e360070e747ab5e010e52c43f` | Preserve gap closure and source fingerprint evidence | 2026-11-09-gap-closure |
| `df5239819d2c7a8cbe90e17f2c5b9551bd168d1b` | Preserve skill production loop verification | 2026-11-09-skill-production-loop |
| `f43963408a6617ca4da4aca1f6ae20b89191b090` | Preserve subject understanding verification | 2026-11-09-subject-understanding |
| `260e72db23c06ceefe63dd808abf0012d25057fa` | Preserve global update preparation and verification | 2026-11-05-global-update-224452-79c01a37 |
| `29e3f84119ad09f7b027c8a64100f42920b05670` | Preserve music box dancer pause and visual study handoffs | 2026-11-07-music-box-dancer-paused, 2026-11-08-music-box-dancer-visual-study |
| `6903afd85c9379c69e7b75dc958c231f7b09ca42` | Preserve the initial production plan | 2026-11-05-production |
| `41bb19a1ea58bb7c0dac1ec09890f56a6bb85c5b` | Organize artifacts by dated work unit | 2026-11-04-global-install, 2026-11-04-harbor-v2, 2026-11-04-initial-production, 2026-11-04-night-sorter, 2026-11-04-standalone-setup, 2026-11-05-global-update-224452-79c01a37, 2026-11-08-aesthetic-toolkit, 2026-11-08-aesthetic-toolkit-phase02, 2026-11-08-cinematic-animation-implementation, 2026-11-08-cinematic-animation-review, 2026-11-09-craft-review, 2026-11-09-dancer-increment, 2026-11-09-gap-closure, 2026-11-09-release, 2026-11-09-skill-production-loop, 2026-11-09-subject-understanding, 2026-11-10-audience-acceptance, 2026-11-10-code-expression, 2026-11-10-motion-authoring |
| `b0ce81e8b97fbf0f829c0d11b599e42a89fabef5` | Preserve historical release and installation evidence | 2026-11-09-release |
| `83e0f1d5567c9393774f18c9fa35881ba1589d8d` | Normalize the historical release evidence directory | 2026-11-09-release |
| `896a3dba8d676d9ab2addbaa801d76c56ab44774` | Preserve locally excluded production closure records | 2026-11-05-production |
| `b50a93943cba1a4b04bbd9141b1be9027dcc1990` | Preserve source licenses with historical text evidence | 2026-11-08-cinematic-animation-implementation, 2026-11-05-global-update-224452-79c01a37 |
| `482ec1d40094011d06c45ec2db1b62ec939116d8` | Place historical licenses with their work units | 2026-11-08-cinematic-animation-implementation, 2026-11-05-global-update-224452-79c01a37 |
| `7302c592f25b228e876344281b273de83197ccba` | Repair references to organized artifact paths | 2026-11-10-artifact-organization |
| `6faf5686ed15190b84c9cdffb3375f85fdb2be0d` | Document work index and artifact retention policy | 2026-11-10-artifact-organization |
| 최종 HEAD | Verify artifact organization and complete figures policy | 2026-11-10-artifact-organization |
