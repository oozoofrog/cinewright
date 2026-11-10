# 하루를 내려놓는 자리

같은 손이 열쇠를 탁자에 내려놓고 빠진 뒤, 열쇠만 남는다. A는 넓은 방과 긴 마지막 hold를 사용한다. B는 손과 열쇠를 가까이에서 본 뒤 방으로 넓어진다. 두 안의 목적·필수 행동은 [가상 의뢰](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/BRIEF.md)에 고정했다. 가상 의뢰와 방향은 예제 제작자가 선택하도록 위임받은 범위이며 실제 사용자 취향·작품 수락 기록이 아니다.

| 안 | 입력 | 길이·크기 | 주요 points | 검토 spans |
| --- | --- | --- | --- | --- |
| A · 빈 자리의 시간 | [work.json](a/work.json) | 192프레임, 8초, 640×360, 24fps | arrive 24, lower 36, touch 60, release 72, leave 78, quiet 102 | lowering [36,60), contact-review [36,78), ending [102,192) |
| B · 손에서 방으로 | [work.json](b/work.json) | 168프레임, 7초, 640×360, 24fps | lower 18, touch 48, release 60, leave 66, quiet 90, room 120 | lowering [18,48), contact-review [18,66), ending [90,168) |

정지한 원화와 위치는 의도한 hold다. 벽의 약한 반사광만 별도 시간으로 변한다. 두 안은 무음이며, 재생·렌더는 기존 오디오 시계와 무음 믹스를 사용한다. 의미를 설명하는 자막이나 별도 플레이어는 넣지 않았다.

## 편집과 재생

저장소 루트에서 실행한다. 아래 명령의 REV_A·REV_B·JOB_A·JOB_B는 각 명령이 출력한 값을 넣는 자리다. 실행 결과를 미리 주장하는 ID가 아니다.

```sh
node examples/stillcuts/build.mjs
node scripts/direction.mjs freeze examples/stillcuts/a --store .direction/stillcuts
node scripts/direction.mjs freeze examples/stillcuts/b --store .direction/stillcuts
node scripts/direction.mjs play REV_A --store .direction/stillcuts
node scripts/direction.mjs frame REV_A touch --store .direction/stillcuts
node scripts/direction.mjs render REV_A --span contact-review --store .direction/stillcuts
node scripts/direction.mjs render REV_A --store .direction/stillcuts
node scripts/direction.mjs play REV_B --store .direction/stillcuts
node scripts/direction.mjs frame REV_B release --store .direction/stillcuts
node scripts/direction.mjs render REV_B --span contact-review --store .direction/stillcuts
node scripts/direction.mjs render REV_B --store .direction/stillcuts
node scripts/direction.mjs review JOB_A JOB_B --store .direction/stillcuts
```

play/review는 출력한 로컬 주소를 열고 종료할 때 Ctrl+C를 쓴다. 각 안 안에서 같은 revision을 play·frame·구간·전체 render에 사용한다. A와 B가 같은 revision일 필요는 없다. 바뀐 입력에는 새 revision을 만들고 이전 결과와 구분한다. 구조 비교는 각 안을 처음부터 원래 시간으로 본다. 동일 프레임 비교는 경계·배치·합성 회귀에 쓴다.

의존성이 준비되어 있으면 재설치하지 않는다. 검증용 store·TMPDIR·로그는 작업 저장소 안에 둔다. 현재 `observe`는 무음의 PCM peak가 작다는 이유로 실패할 수 있으므로 이 예제의 통과 조건으로 쓰지 않는다. 실제 재생과 필요한 브라우저 관찰을 사용하고 자동 기록·직접 시청·독립 검토를 구별한다.

## 편집 원본과 복사본

- **자체 작성 원본:** [source.mjs](source.mjs)의 가상 의뢰·두 안·컷 경계·위치 설정, [scene.mjs](scene.mjs)의 작품 코드, [rebuild.mjs](rebuild.mjs), [build.mjs](build.mjs), `assets/room.svg`, `assets/hand-atlas.svg`, `assets/keys.svg`.
- **고정 검증 입력:** [boundary-input.json](fixtures/boundary-input.json)은 기준 A에서 고정한 source와 touch를 66으로 옮기는 edit다. 편집 중인 source.mjs와 독립적이다.
- **공유 helper 정본:** 저장소 `modules/cuts.mjs`, `modules/artwork.mjs`. 기존 helper를 수정하지 않고 복사한다.
- **생성된 a/b:** 각각 `source.json`, `cuts.json`, `work.json`, 복사한 `scene.mjs`·`rebuild.mjs`·`modules/`·`assets/`. runtime import와 자산 참조는 모두 각 프로젝트 내부다. symlink와 전역 설치본 import는 없다.
- **생성 fixture:** [boundary-before.json](fixtures/boundary-before.json), [boundary-after.json](fixtures/boundary-after.json). 고정 검증 입력의 touch 경계 한 곳을 60에서 66으로 옮긴 입력과 모든 파생 결과다. 현재 편집 중인 A의 변경 내역이나 세 번째 작품이 아니다.

저장소 예제는 source·원본 SVG·scene을 수정하고 `node examples/stillcuts/build.mjs`를 다시 실행한다. a/b의 생성 파일을 직접 고치면 다음 생성에서 덮어쓴다. helper 정본을 갱신했을 때도 다시 생성하여 복사본을 맞춘다.

경계 fixture는 별도 boundary-input.json에서 생성한다. builder는 예제를 쓰기 전에 이 입력의 실제 변경과 컴파일을 확인하고, 로그에 바뀐 필드·전후 값·변경 수를 남긴다. A의 touch를 이미 66으로 바꾸거나 release를 64로 바꿔도 이 고정 검증은 독립적으로 실행된다. fixture 자체를 편집할 때는 source와 edit를 함께 검토한다. 같은 프레임을 다시 지정하거나 유효하지 않은 경계를 만들면 오류로 중단한다.

다른 작업으로 복사한 프로젝트에서는 그 복사본의 `source.json`을 편집한다. `node <복사본>/rebuild.mjs`가 해당 프로젝트의 `modules/cuts.mjs`만 사용해 work와 cuts를 다시 만든다. 복사한 scene과 asset도 그 프로젝트의 원본으로 관리한다. [재사용 계약](../../references/stillcuts.md#복사-생성-다시-생성하기)에 전체 경로와 오류 계약이 있다.

## 기술적으로 드러나는 차이

- hold의 길이는 서로 다르다. A는 빈 방 24프레임, 쥔 손 12프레임, 마지막 방 90프레임이다. B는 첫 손 18프레임, 놓인 열쇠의 세부 30프레임, 마지막 방 48프레임이다.
- A의 arrive와 B의 room은 hard cut이다. 손가락의 grip/open 교체도 exposure.value 경계에서 바뀐다. 자동 블렌드나 중간 원화를 쓰지 않는다.
- hand atlas의 crop은 `[0,0,200,300]`과 `[200,0,200,300]`이다. anchor `[100,260]`과 `[300,260]`은 각각 **원본 좌표**다. 둘 다 같은 손의 목표 위치에 놓인다.
- 내려오는 위치는 lowering span과 `t.exposed`로 계산한다. every 3 때문에 3프레임씩 같은 위치를 유지한다. 빛 레이어는 같은 exposure를 받으면서도 `t.frame`을 읽어 매 프레임 변한다. 카메라는 각 컷 안에서 고정한다.
- 고정 fixture의 touch를 60→66으로 바꾸면 lowering의 끝, contact-hold의 시작, touch point와 두 cut spans가 함께 바뀐다. scene도 새 span의 마지막 노출 샘플을 사용한다. 편집 중인 A/B도 자신의 source에서 같은 생성 경로를 쓴다. 경계가 아닌 위치·배율 숫자는 장면 설정으로 남는다.

anchor 계산의 일치는 손의 형태·무게·접촉을 증명하지 않는다. 실제 출력에서 열쇠가 닿은 뒤 손이 열리고 빠지는지, 열쇠가 따라 올라가지 않는지 확인한다.

## 현재 증거

접촉 작화를 수정한 A/B의 전체 출력과 기술 재검증을 마쳤다. 아래는 검토한 영상의 고정 개정본이다. 접촉 가독성은 독립 재검토에서 두 안 모두 **ADDRESSED**로 판정됐다. 확인한 프레임에 남은 필수 결함은 없었다. A의 넓은 구도에서 접촉을 1배속 첫 시청 중 알아보는지와 두 안의 실제 감상 효과는 미확인이다. [전체 결과](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/RESULT.md) · [구간별 검토](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/REVIEW.md)

보존 영상은 **scene의 own key 보강 전 고정 개정본**이다. 현재 scene과 A/B 복사본은 `__proto__` 이름을 보존하도록 원화 사전을 수정했다. 현재 소스로 새 freeze를 실행하면 아래와 다른 revision이 된다. 실제 A/B의 일반 이름·작화·타이밍은 그대로이며 이번 보강에서 전체 영상을 다시 렌더하지 않았다. [생성 파일과 보존 미디어 해시](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/final-fix-1/preservation.json)

| 현재 출력 | revision | 전체 job·영상 | 접촉 구간 |
| --- | --- | --- | --- |
| A · 192프레임, 8초 | `f1d51eaa10567cba25eb1787fa5e65d8776f4da185c1c2bd4e290a0a658abc04` | `b030aad5-33a8-4a71-9977-994c046e3b50` · [MP4](/Volumes/eyedisk/develop/cinewright/.direction/production/jobs/b030aad5-33a8-4a71-9977-994c046e3b50/work.mp4) | [f36–77 · 1.75초](/Volumes/eyedisk/develop/cinewright/.direction/production/jobs/a515dfc7-fd57-4f78-aa76-77e336d9d78f/work.mp4) |
| B · 168프레임, 7초 | `4355e5ec4829e994785e96c7788387d0a61f44dd43d2aa566cb3124cdd86fac0` | `c5d57e2c-0459-4def-a8c2-b8f49ea5748c` · [MP4](/Volumes/eyedisk/develop/cinewright/.direction/production/jobs/c5d57e2c-0459-4def-a8c2-b8f49ea5748c/work.mp4) | [f18–65 · 2초](/Volumes/eyedisk/develop/cinewright/.direction/production/jobs/88c9ab45-8bf1-49fd-95ff-42f376b1cf79/work.mp4) |

보존 영상의 store는 `.direction/production`이다. 저장소 루트에서 아래 명령으로 검토한 고정 개정본과 영상을 연다. 위의 편집·새 freeze 명령과 달리 실제 보존된 ID를 사용한다.

```sh
export TMPDIR="$PWD/.direction/production/task-4-runs/contact-fix-1/tmp"
node scripts/direction.mjs play f1d51eaa10567cba25eb1787fa5e65d8776f4da185c1c2bd4e290a0a658abc04 --store .direction/production
node scripts/direction.mjs play 4355e5ec4829e994785e96c7788387d0a61f44dd43d2aa566cb3124cdd86fac0 --store .direction/production
node scripts/direction.mjs review b030aad5-33a8-4a71-9977-994c046e3b50 c5d57e2c-0459-4def-a8c2-b8f49ea5748c --store .direction/production
```

같은 영상 개정본에서 play·frame·구간/전체 render를 검증했다. 당시 전체 회귀 [360/360](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/task-4/fix-1-npm-test.log), A 77장·B 83장의 live/render PNG 일치, H.264/yuv420p·24fps·PTS·의도된 무음을 확인했다. 640×360·1배속 MP4 자동 재생은 두 안 모두 끝까지 도달했고 드롭은 A 1프레임, B 0프레임이었다. [수정본 기술 receipt](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/task-4/runs/contact-fix-1/inspection/receipt.json)와 [독립 재검토](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/independent-output-review-fixed.md)는 직접 연속 시청·청취, 관객 반응이나 사용자 수락을 뜻하지 않는다.

own key 보강 뒤 현재 소스의 전체 회귀는 [364/364](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/final-fix-1/npm-test.log)이며 기존 native integration도 통과했다. 새 네 검사는 source 편집·JSON 왕복 뒤 복사한 A/B scene에서 일반 이름과 `__proto__`로 방·열쇠·손을 그리는 경로를 확인한다. 이 네 검사는 Node 대역을 사용하며 새 native 픽셀 출력의 근거가 아니다.

원래 출력의 접촉 결함은 `keys.svg`와 두 복사본에서 고쳤다. 시간·구도·배치는 유지했다. [첫 독립 검토](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/independent-output-review.md)와 이전 출력은 보존했다. [성능 기록](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/MEASUREMENT.md)은 별도 작은 합성 입력의 3조건×3회 측정이며 이 작품의 성능 보장이 아니다. [마지막 소스 수정 범위의 독립 재검토](/Volumes/eyedisk/develop/cinewright/.superpowers/sdd/2026-11-05-cinewright-production/final-fix-1-re-review.md)와 [리더의 변경 파일·소유권 확인](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-05-production/primary-final-source-scope.json)을 마쳤고 로컬 전달이 승인됐다.

### 초기 PNG smoke · 역사적 증거

입력 생성과 제한된 native Canvas PNG smoke를 실행했다. 최초 A 접촉 프레임에서 소매가 화면 안에서 잘리는 것을 발견하여 원본 SVG를 늘리고 다시 생성했다. 이전 결과는 삭제하지 않았다. 수정된 A의 접촉 프레임과 B의 놓는 프레임은 직접 이미지로 열어 확인했다. 이는 정지 프레임 관찰이며 하강·퇴장·전체 시간의 성공 판단이 아니다.

| smoke | revision | 작업 ID·프레임 |
| --- | --- | --- |
| A 수정 후 | `b80a591239cabcf6a440cf9a3bf788a74b7f7094f4eca89e0b2d9f267930fb79` | `ef923fbe-ebb0-438e-937a-61cf3683f6cc`, touch 60 |
| B | `f48dddf994816b294cbf1ec79764643241f3342afbb48b99afd219b52569ccd5` | `ee9bd33f-d589-45fd-859d-9bb308056b5a`, release 60 |

이 smoke의 store는 `evidence/2026-11-05-production/task-3-store`다. 명령·실행 로그·초기 결과와 소매 수정 근거는 [Task 3 보고](/Volumes/eyedisk/develop/cinewright/.superpowers/sdd/2026-11-05-cinewright-production/task-3-report.md)에 있다. 이 표의 개정본은 이후 접촉 수정 전 상태다. 보존된 전체 출력·경계·PTS·복사 격리·독립 재검토는 위의 접촉 수정본 기록을 사용한다. 현재 소스의 회귀는 own key 보강 뒤 기록을 사용한다.
