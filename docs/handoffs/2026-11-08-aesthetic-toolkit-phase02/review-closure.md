# Phase02 독립 지적 수정과 재검증

첫 독립 CO/Sol 보고서 `2026-11-08-phase02-independent-review.md`는 당시의 request-changes 판정으로 보존한다. 아래는 총괄이 직접 수정한 내용이다. 총괄의 검증을 독립 승인으로 바꾸지 않으며, 새 독립 재검토는 별도 delegate로 시작한다.

1. **수채 drying 실패**: Float64 subnormal 물에서 `f/w`가 실제 계수보다 크게 양자화되는 문제였다. 새 solver `grid-transport-2`는 양쪽 물이 모두 2^-1022 미만인 pair의 물/이류 수송을 멈추며, 독립 안료 확산/침착은 계속한다. 안료를 지우거나 예외만 없애지 않았다. 흡수/증발은 남을 물을 먼저 계산하고 실제 제거량을 나누므로 개별 반올림으로 물보다 많은 sink가 나가지 않는다. v1 완성 bake decode는 유지한다. 원래 60frame 입력의 finite/비음수/물·안료 수지와 subnormal 두 sink fixture를 새 회귀에 추가했다. 독립 검토의 원래 80trajectory를 같은 seed로 재실행해 모두 완료·실패0, 최대 수지 오차 3.20e-13을 확인했다(`coordinator/fix-recheck/water-sweep.json`).
2. **rig-only inverse-bind 게시**: `validateRig`가 rest hierarchy의 world 행렬을 parent 순서로 계산해 inverseBind와 1e-5 tolerance로 비교한다. motion 유무와 관계없이 public materializeStyle이 corrupt bind를 사전 거부한다. motion rest 호환성의 추가 검사는 유지한다. 새 생성/update에서 기존 rig bytes 보존과 stage 잔해0을 검증했다.
3. **contact 옵션**: 생성 시점에 left/right window 배열, finite 2원소, 0≤from≤to≤duration, finite pole vec3, 0≤minFlexion≤maxFlexion≤PI를 검사한다. 모든 window가 비활성이어도 잘못된 pole/flexion을 거부한다. 빈 배열은 명시적 side 비활성으로 유지한다.
4. **Canvas 결정성 경계**: direct API 호출자가 context를 처음 만들 때 명시적 `willReadFrequently:true/false`를 선택하도록 문서화했다. compositor도 output/scratch에 false를 명시한다. default 자동 backend 전환의 반올림 차이를 무제한 동일 브라우저 결정성으로 주장하지 않는다. 두 명시 모드×540p/1080p에서 public draw의 반복/역순 readback hash 검사를 추가했다. 이전 overlay의 첫 fillRect proxy 설명은 현재 transparentPaper 옵션 설명으로 정리했다.
5. **1080p 움직이는 증거**: 6개 모두 현재 public 코드로 1920×1080·24fps 영상을 추가했다. 원래 540p 영상은 보존했다. 수채는 v2 재bake, rig는 현재 자동 생성 결과, retarget은 같은 2motion×2대상이다. public materializer/build→freeze→frozen jobs renderer를 사용하고 저작 project 경로를 rename하여 원본 경로 없이 render했다. 모든 fullhd 모듈과 현재 repo bytes가 일치한다(`coordinator/fullhd/source-audit.json`). 6개 PTS/전체 decode flash/대표 frame과 8–9초 전체 native 자동 재생/seek는 `coordinator/fullhd/media.json`에 기록했다.

추가 회귀는 `tests/phase02-review-fixes.test.mjs` 3개와 `tests/phase02-context.test.mjs` 1개다. 수정 직후 집중 CPU 23개가 통과했다. 최종 전체 회귀 결과는 final 인계의 최신 기록을 따른다. 새 로그는 `evidence/2026-11-08-aesthetic-toolkit-phase02/coordinator/fix-recheck/`다. 실제 사람의 연속 시청·청취·미학/접근성 수락은 미확인으로 유지한다.

## 두 번째 독립 검토의 P3 두 건 — 총괄 최종 수정

새 독립 재검토는 원래 P2/나머지 지적과 1080p 자료를 확인했고, 두 극미량 경계 문제만 남겼다. 보고서는 `2026-11-08-phase02-independent-recheck.md`에 당시 판정으로 보존했다. 이 작은 지적은 총괄이 직접 수정했으며 제3의 독립 승인으로 표현하지 않는다.

- **물의 음수 quantum**: normal donor 바로 위 임계값에서 4개 edge 합의 반올림으로 `old+dw`가 -Number.MIN_VALUE가 될 수 있었다. solver3은 고정 pair 순서대로 donor budget을 차감하고 별도 incoming credit을 더한다. 각 양을 남은 budget 이하로 제한하므로 음수 material을 버리는 clamp 없이 물의 비음수를 유지한다. 원래 3×3 fixture와 임계값 주변 320개 조합이 finite/비음수/수지 검사를 통과했다.
- **sink label underflow**: `removed*absorption/sum` 대신 계수 비율을 먼저 만든 후 removed를 곱한다. absorption=0 또는 evaporation=0인 ledger가 정확히0이다. 원래 fixture와 양방향90개 subnormal 조합을 검사했다.

출력 solver version을 `grid-transport-3`으로 올리고 v1/v2 저장 bake decode를 보존했다. 수채 두 영상은 v3으로 새 bake·1080p render했으며 이전 v1/v2 영상도 그대로 유지한다. 다른 네 1080p 영상은 source가 바뀌지 않아 기존 검증을 재사용한다. 최신 6개 source audit와 media index는 `coordinator/fullhd-current/`, v3 수채 원본 실행 근거는 `coordinator/fullhd-v3/`다. 새 CPU focused 11개 통과 뒤 최종 전체 회귀를 실행한다. 사람의 예술/접근성 수락은 여전히 별도다.

최종 결과: solver3 전체 `npm test` 472/472 통과(실패0), 114.3초. protected13,007파일 변경/누락0 및 HEAD/index불변. 소형 수치·자산·media·source 보존의 통합 인덱스는 coordinator/final-evidence-index.json이다.
