# Cinewright

## Plugin installation

Codex and Claude Code use `skills/cinewright/SKILL.md`, which routes to the current root `SKILL.md`. Install only the plugin; remove an older standalone Cinewright skill after verifying the plugin. Node.js 22+, FFmpeg/FFprobe, and Chromium are required.

For an existing Codex marketplace installation:

```sh
codex plugin marketplace upgrade cinewright-local
codex plugin add cinewright@cinewright-local
```

For a new installation, run `codex plugin marketplace add https://github.com/oozoofrog/cinewright.git`, then install Cinewright. Claude Code uses `/plugin marketplace add oozoofrog/cinewright` and `/plugin install cinewright@cinewright-marketplace`.

Run `npm ci` **from the installed plugin root** after each update. Run its `scripts/direction.mjs` by absolute path from your project directory. The default `.direction/` store belongs to the working directory; use `--store` to select another location. Start a new chat to load the refreshed skill instructions.

```sh
cd <installed-plugin-root>
npm ci
node scripts/direction.mjs doctor
node scripts/direction.mjs init <new-project-path>
node scripts/direction.mjs freeze <new-project-path> --store <local-store-path>
```

[SKILL.md](SKILL.md)에서 제작을 시작한다. 작품의 시간, 자산, 개별 표현과 선택적 교환 값을 작성하면 같은 개정본으로 대화형 재생, 프레임 추출, 구간·전체 렌더와 MP4 비교를 할 수 있다.

미완성 의뢰는 [제작 전 협의](references/direction.md)에서 목적·필수 행동·대안·위임으로 구체화한다. [여섯 분야의 작법](references/craft.md)은 출처 내용과 애니메이션 적용을 구분한다. [스틸컷 지침](references/stillcuts.md)은 원화 선택·시간·배치와 두 재사용 helper의 계약을 다룬다.

[하루를 내려놓는 자리](examples/stillcuts/README.md)는 같은 가상 의뢰를 넓은 구도의 긴 hold와 세부에서 방으로 확장하는 컷으로 구성한 8초·7초 예제다. 두 프로젝트는 같은 자체 SVG 3개와 복사한 helper를 쓴다. `node examples/stillcuts/build.mjs`로 다시 생성한다. [수정본 영상·기술 검증·제한된 성능 기록](evidence/2026-11-05-production/RESULT.md)과 [구간별 독립 검토 종합](evidence/2026-11-05-production/REVIEW.md)에서 확인 범위와 남은 감상 판단을 구분한다.

| 작품 | 재생 파일 | 프로젝트 |
| --- | --- | --- |
| 신호의 항구 · 밤의 통로 | [24초 MP4](outputs/harbor-v2/harbor-v2.mp4), [기존안과 비교](outputs/harbor-v2/index.html) | [work.json](examples/harbor-v2/work.json) |
| 신호의 항구 · 착안 | [18초 MP4](outputs/harbor-landfall.mp4), [컷 앞뒤 2초](outputs/harbor-cut-review.mp4) | [work.json](examples/harbor-landfall/work.json) |
| 인쇄기 · 러프 | [9초 MP4](outputs/press-rough.mp4) | [work.json](examples/press/work.json) |
| 야간 분류함 | [6초 MP4](outputs/night-sorter.mp4) | [work.json](examples/night-sorter/work.json) |
| 항구 비교 | [귀환안 18초](outputs/alternatives/harbor-draft.mp4), [해도안 19초](outputs/alternatives/harbor-map-draft.mp4), [착안 러프 18초](outputs/alternatives/harbor-landfall-draft.mp4) | `examples/harbor*` |

## 실행

이 디렉터리에서 실행한다. Node.js 22 이상, FFmpeg/FFprobe, Chromium이 필요하다. 기존 의존성이 준비되어 있으면 재설치하지 않는다. 준비되지 않은 체크아웃에서만 `npm ci`를 먼저 실행한다.

```sh
npm test
node scripts/direction.mjs doctor
node scripts/direction.mjs play examples/harbor-landfall
node scripts/direction.mjs frame examples/harbor-landfall return
node scripts/direction.mjs render examples/harbor-landfall --span '연결 검토'
node scripts/direction.mjs render examples/harbor-landfall
```

`play`가 출력한 로컬 주소에서 재생·일시 정지·탐색과 이름 붙인 구간 반복을 쓸 수 있다. 전체 또는 구간 렌더가 출력한 작업 ID로 `review JOB_ID OTHER_JOB_ID`를 실행하면 개별 재생과 같은 시각 비교를 할 수 있다.

항로에 다른 방향을 시험하려면 `examples/harbor-landfall/work.json`의 `channels.steering.data.keys`를 수정한다. 같은 명령으로 새 개정본을 만들고 방위계와 귀환 뒤 항로를 함께 확인한다. `freeze`에서 받은 해시를 프로젝트 경로 대신 넘기면 이전 개정본으로 재실행할 수 있다.

[도구와 복구](references/tools.md) · [입력과 모듈](references/format.md) · [제작 및 기술 검토](evidence/2026-11-04-initial-production/RESULTS.md) · [별도 창작 의뢰 재현](evidence/2026-11-04-night-sorter/FORWARD.md)

《밤의 통로》의 창작 입력은 [스타일과 스토리](evidence/2026-11-04-harbor-v2/STYLE-STORY.md) 두 항목이다. 세부 연출과 구현은 제작 과정에서 도출했다. [검토와 재실행](evidence/2026-11-04-harbor-v2/REVIEW.md) · [스킬 수정 근거](evidence/2026-11-04-harbor-v2/SKILL-CHANGES.md)

## 저장소 구성

`scripts/`와 `runtime/`은 실행 도구, `modules/`는 프로젝트에 복사하는 컷·원화 helper, `examples/`는 제작 입력, `tests/`는 회귀 검사다. `SKILL.md`와 `references/`에 제작 지침을 둔다. `outputs/`와 `evidence/`에는 현재 검증 작품과 제작 근거를 함께 보관한다.

`node_modules/`와 `.direction/`은 로컬 실행 데이터다. 새 체크아웃에서는 `npm ci`를 실행하고 예제 경로로 렌더한다. 기존 개정본 해시와 작업 ID를 사용하는 명령은 해당 `.direction/` 기록이 있는 환경에서 실행한다.

이전 제작 기록의 절대 경로는 당시 실행 환경을 가리킨다. 독립 경로 구성과 실행 검증은 [설정 기록](evidence/2026-11-04-standalone-setup/RESULT.md)에 있다.

## 로컬 음악 기반 MV

[음악 워크플로](references/music.md): `music init PROJECT FILE --fps 24`로 원본을 보존하고 실제 디코드 길이의 음악 프로젝트를 만든다. `music analyze/derive/build`, 기존 `play/review/preview/render`, `flash JOB_ID`, 검증된 원본 AAC `music remux`를 재사용한다. [Music Box Dancer의 서로 다른 두 안과 재사용 recipe](examples/music-box-dancer/README.md)는 사용자 미디어를 포함하지 않는 원본 Canvas2D 예제다. 분석은 잠정적이며 flash screen은 안전/WCAG 인증이 아니다.

## Reusable aesthetic toolkit

`node scripts/direction.mjs style list` lists versioned style entries and their actual support status. [Style authoring](references/styles/index.md) connects authored scene recipes and local assets to the existing manifest-v1 renderer, with optional resource disposal and generated-file ownership checks. The initial packs are silhouette-theatre, line-wash, and expressionist-space; integrated acceptance evidence is recorded separately from implementation status under `evidence/2026-11-08-aesthetic-toolkit`. No global skill installation or original-media replacement is part of this toolkit work.

Phase02 선택 기능: [물리 수채 bake](references/styles/watercolor-physical.md), [제한된 biped 자동 rig/skin](references/styles/auto-rig.md), [cross-skeleton retarget/contact](references/styles/retarget.md). 기존 스타일 기본 동작을 유지하는 실험 API이며, See [style references](references/styles/index.md) for supported inputs and limitations.
