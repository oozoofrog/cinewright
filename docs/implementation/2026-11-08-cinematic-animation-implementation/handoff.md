# 개발 인수인계

작업 루트: `/Volumes/eyedisk/develop/cinewright`
결과 루트: `evidence/cinematic-animation-implementation-2026-11-08/`

[결과·수락 한계](report.md), [미술 지침·shot beat](art-guide.md)를 함께 읽는다. 커밋·reset·원본 영상 교체는 수행하지 않았다. 최초 git status는 `baseline/git-status.txt`, 수정 전 모듈/recipe/추가 수정 파일은 `baseline/`에 있다. 이 작업 이전부터 있던 미추적 파일 전체를 신규 구현으로 계산하면 안 된다. `changes.json`이 이번 변경만 식별한다.

## 변경

| 위치 | 내용 |
|---|---|
| `recipes/styles/line-wash/{commuter,rain}.json` | 편지 접점/포즈/감속/시선 및 형태를 따르는 워시 |
| `recipes/styles/silhouette-theatre/{forest,harbor}.json` | 선행·후행 반응 차이, 빛과 감속·정박 연결 |
| `recipes/styles/expressionist-space/{station,laboratory}.json` | 실제 가림 뒤 등장, 가방 여백, 재질별 밀도/선/명암 |
| `recipes/styles/expressionist-space/reader.json` | 지원 체형의 별도 설계 캐릭터 |
| `recipes/styles/watercolor-physical/{wet,overlap}.json` | 고해상도 bake용 density와 cubic 출력 설정 |
| `modules/fx2d/watercolor-reconstruct.mjs` | 농도장 보간·종이에 고정된 입자·안료 순차 합성 |
| `modules/styles/watercolor-physical/index.mjs` | cells/linear/cubic 선택, lazy canvas, 버퍼 해제, Node evaluate 유지 |
| `modules/styles/line-wash/index.mjs` | 동일 topology wash bank, 시간/개수/좌표 검증 |
| `examples/styles/expressionist-space/assets/traveler-readable.glb` | 원본을 보존한 가방·팔 배치 파생 자산, provenance 별도 |
| `examples/styles/phase02-rig/assets/reader/` | rig/motion/GLB/LICENSE. 원래 tall/broad fixture 보존 |
| `examples/styles/expressionist-space/build.mjs` | 새 traveler 자산과 reader recipe의 공개 materialize 지원 |
| `tests/cinematic-implementation.test.mjs` | 실제 접점/발 고정·이동 연속·wash draw·재구성·공개 패키징 검사 |
| `tests/line-wash-core.test.mjs` | 삭제된 folded-paper erasure에 의존하던 검사를 자체 invalid-mask fixture로 교체 |
| `scripts/cinematic-*` | 저작·파생 자산·수채 비교·렌더·증거·rig 수치 검사 재현 |

`washes[].bank`는 `[{frame,points:[[x,y],...]}]`, 기준 points와 같은 개수, scene 범위 안 정수 frame을 요구한다. 기본 linear/every=1이며 같은 frame에서 선과 색면을 샘플한다. 기존 고정 wash는 그대로 동작한다.

수채 기본은 cubic이며 원출력 회귀/비교에는 `reconstruction:'cells'`, 후보에는 `'linear'`를 사용한다. 렌더 단계에만 OffscreenCanvas가 생성되어 Node의 prepare/evaluate 검사가 유지된다. bake solver 자체의 공용 식을 변경하지 않았다. NPR shader와 공용 autoRig 알고리즘도 변경하지 않았다.

## 재현

필요 환경: Node 22 이상(실행 v26.12.1), Python+Pillow(실행 3.15.2), ffmpeg/ffprobe(실행 9.0.2), package.json의 three/playwright-core, 로컬 Google Chrome. `DIRECTION_CHROME`으로 실행 파일을 지정할 수 있다.

아래 저작 명령은 **보존된 baseline에서 지정 recipe를 재생성**한다. 이후 사람이 그 recipe를 편집했다면 먼저 별도 보존한다. 렌더는 새 `.direction/.../projects/<ID>-<mode>-<timestamp>`와 frozen store를 만들고 기존 원본을 읽기만 한다. 결과 evidence 폴더는 재실행 시 갱신된다.

```sh
cd /Volumes/eyedisk/develop/cinewright
node scripts/cinematic-traveler-asset.mjs
python3 scripts/cinematic-author.py
node scripts/cinematic-rig-asset.mjs
node scripts/cinematic-watercolor-compare.mjs
node scripts/cinematic-render.mjs stills S01 S02 S03 S04 S05 S06 P01 P02 P03-designed
node scripts/cinematic-render.mjs video S01 S02 S03 S04 S05 S06 P01 P02 P03-designed
node scripts/cinematic-render.mjs stills S03-wash S04-wash P03 P03-no-outline P03-flat P03-flat-side P03-designed-flat P03-designed-flat-side P03-designed-inferred P03-designed-inferred-no-outline
python3 scripts/cinematic-evidence.py
node scripts/cinematic-rig-check.mjs
```

수채 대안: `node scripts/cinematic-render.mjs stills P01-linear P02-linear P01-96 P02-96`. 최종 ID P01/P02는 96×54, `-linear`는 원 48×27의 linear, `-96`은 96×54 cubic을 명시한다. 48×27 cubic은 최종 교체 전에 `P01-48/`, `P02-48/`로 보존되어 있다.

최종 회귀 명령:

```sh
node --test --test-concurrency=1 tests/cinematic-implementation.test.mjs tests/style-review-regression.test.mjs tests/line-wash-core.test.mjs tests/line-wash-stroke.test.mjs tests/silhouette.test.mjs tests/expressionist-core.test.mjs tests/expressionist-package.test.mjs tests/auto-rig.test.mjs tests/watercolor.test.mjs tests/style-lifecycle.test.mjs tests/style-effects-limits.test.mjs tests/phase02-review-fixes.test.mjs
```

로그: `validation/tests-final.log`. 초기 수정에서 드러난 Node OffscreenCanvas 초기화 실패는 lazy allocation으로 수정했다. invalid-mask 검사는 유효 residue를 가진 자체 fixture로 보정했다. 최종 통과 결과를 따른다. 전체 npm test는 기존 evidence를 다시 생성하는 테스트도 포함하므로 이번에는 관련 회귀 집합과 새 frozen 렌더/seek 검증을 실행했다.

## 인수인계 파일

- `comparison-manifest.json`: 전후 영상과 핵심 구간.
- 각 수정본 `video/render.json`: frozen revision, project, 전체 frame 목록, 캡처 시간, 에러/seek 검사.
- `original-integrity.json`: 기존 영상 15개 최초 SHA와 최종 SHA.
- `validation/watercolor-equivalence.json`: 동일 사건·시드·시간 및 해상도 환산.
- `watercolor/cost-comparison.json`: 원형 안료 사건 두 종류 × 해상도/재구성 비교 입력과 비용.
- `validation/rig-deformation.json`: 192프레임 CPU 변형/부피 변화.
- `rig-ablation.jpg`: 같은 평활 geometry에서 outline 및 가중치 원인 분리.
- `review-gallery.html`: 대표 화면 전후와 비용 비교를 여는 요약 뷰.

다음 검토에서는 기술 검사를 다시 미학 승인으로 대체하지 않는다. report.md의 미해결 인간 수락 항목을 원속도 영상으로 확인하고, 수채의 실제 침전 표현이 더 필요하면 합계 농도 외 mobile/deposited 분리 출력부터 설계한다.
