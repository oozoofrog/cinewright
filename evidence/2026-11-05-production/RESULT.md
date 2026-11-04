# Cinewright 제작 지침·스틸컷 모듈 검증 결과

두 재사용 helper와 제작 지침, 가상 의뢰의 A/B 예제, 수정본 출력 검증과 제한된 성능 측정 기록을 준비했다. 수정본 A/B의 접촉 결함은 독립 재검토에서 **ADDRESSED**로 판정됐다. 현재 소스의 전체 회귀는 **364/364**이며 영상 검증 당시 **360/360** 기록도 유지했다. 성능 측정은 선언한 **3조건×3회**를 수행했으며, 중간에 발생한 측정 가드 실패를 원본 그대로 보존했다. [마지막 수정 범위의 독립 재검토](../../.superpowers/sdd/2026-11-05-cinewright-production/final-fix-1-re-review.md)와 [리더의 변경 파일·소유권 확인](primary-final-source-scope.json)을 마쳤다. 로컬 작업 결과의 전달이 승인됐다.

현재 결과는 개발 저장소 `/Volumes/eyedisk/develop/cinewright`에 있다. 기준은 `main`, `5bd6d89763dd500d0fd85903bf8c288775e4ac0e`다. 전역 설치본에 반영하거나 커밋·배포한 결과가 아니다. A의 넓은 구도에서 접촉을 1배속 첫 시청 중 알아보는지, 두 안의 실제 감상 효과와 사용자 수락은 미확인이다.

## 변경 목적과 범위

제작 대화에서는 사용자의 원문·필수 사실·해석을 구분하고, 실질적으로 다른 후보와 기대 효과를 제시한다. 실제 합의나 유효한 위임 뒤에는 이미 맡긴 선택을 다시 묻지 않는다. 작법 경험과 삶의 경험·취향·판단을 혼동하지 않는다. [제작 전 협의](../../references/direction.md)와 [작법 참고](../../references/craft.md)에 이 기준을 반영했다.

- [modules/cuts.mjs](../../modules/cuts.mjs)는 명명한 경계에서 exposure·points·spans를 생성한다. 타이밍 원본을 한 곳에 둔다. 빈 구간과 연속성·이름·범위 오류를 검사한다.
- [modules/artwork.mjs](../../modules/artwork.mjs)는 crop·원본 좌표 anchor·등방 배율·contain/cover 배치를 계산한다. 준비한 원화를 기존 asset 레이어와 Canvas 합성에 연결한다.
- [스틸컷 계약](../../references/stillcuts.md), [입력 형식](../../references/format.md), [도구 안내](../../references/tools.md), [예제와 복사 경로](../../examples/stillcuts/README.md)를 보완했다. 기존 manifest version 1, CLI, 채널·오디오 시계, alpha·opacity·mask·blend 경로는 유지했다.
- 기존 60개 추적 runtime·CLI·패키지·원래 테스트·예제 파일은 기준과 같다. 새 helper, 새 스틸컷 예제·검사와 문서가 추가됐다. [기존 소스 보존 기록](preserved-existing-source.json)

입력 범위인 정수 FPS 1–120, 짝수 해상도 각 변 16–4096은 성능 보장이 아니다. 유효 프레임은 `[0,frames)`, point는 `0..frames-1`, span의 끝은 `frames`까지다. `every`는 `t.exposed`만 양자화한다. `sample` 기본은 linear이며 hold는 명시한다. 자동 중간 작화·블렌드·블러나 투명 MP4 지원을 추가했다고 주장하지 않는다.

## 조사와 적용

리더가 직접 확인한 원문 위치·내용·한계는 [조사 기록](research-notes.md)에 있다. [craft.md](../../references/craft.md)는 출처의 주장과 Cinewright에 적용한 판단을 구분한다. 원문 이미지·음악·영상은 예제 자산으로 복사하지 않았다.

| 분야 | 확인한 원문과 적용 범위 |
| --- | --- |
| 영화 | [Hitchcock의 연출 방법, BFI](https://www.bfi.org.uk/sight-and-sound/features/alfred-hitchcock-my-own-methods). 손·물건·반응의 주의 순서를 컷과 크롭으로 검토한다. 필수 행동을 생략할 근거로 쓰지 않는다. |
| 만화 | [Abel·Madden, Bridging the Gap](https://dw-wp.com/2010/03/chapter-4-bridging-the-gap/). 보이지 않은 사이를 추론하는 기능을 접근 과정의 생략에 적용한다. 필수 하강·접촉은 직접 보인다. |
| 철학 | [Bergson, Time and Free Will, 제2장](https://www.gutenberg.org/files/56852/56852-h/56852-h.htm). hold를 앞뒤 사건과 함께 판단할 관점으로 사용한다. 신경과학 법칙이나 프레임 계산의 대안으로 쓰지 않는다. |
| 시각예술 | [MoMA의 Matisse Cut-Outs 해설](https://www.moma.org/audio/playlist/6/307). 형태와 주변 빈 공간을 함께 보고 실제 크기의 실루엣·대비를 확인한다. |
| 연극 | [RSC의 Sculpting 활동](https://www.rsc.org.uk/learn/schools-and-teachers/teacher-resources/rehearsal-room-approaches-to-shakespeare/example-activities-for-the-classroom), [Macbeth 교사 자료](https://cdn2.rsc.org.uk/sitefinity/education-pdfs/teacher-packs/edu-macbeth-teacherpack-2011.pdf?sfvrsn=2). 인물·사물의 거리와 관계를 읽는 기능을 그림 배치로 옮긴다. |
| 뮤지컬 | [Horowitz, Library of Congress Magazine, 2025년 9–10월 p.19](https://loc.gov/lcm/pdf/LCM_2025_0910.pdf), [Tashkiran의 Peter Darling 인터뷰 pp.129–130](https://crco.cssd.ac.uk/id/eprint/1717/1/9781350054479_web.pdf#page=142), [Blustein의 연구 초록](https://edspace.american.edu/nblustein/research/). 프레이즈·쉼·반복의 극적 기능을 참고한다. 박자마다 컷을 바꾸거나 모든 예제에 음악·춤을 넣는 규칙은 아니다. |

가상 의뢰는 영화의 주의 순서, 만화의 접근 과정 생략, 시각예술의 여백을 선택했다. 조사 분야의 수나 정상 렌더를 표현 성공의 근거로 삼지 않는다.

## 원본·복사·재생성

작품의 편집 원본은 [source.mjs](../../examples/stillcuts/source.mjs), [scene.mjs](../../examples/stillcuts/scene.mjs), `examples/stillcuts/assets/{room,hand-atlas,keys}.svg`다. `node examples/stillcuts/build.mjs`가 A/B에 source.json·work.json·cuts.json을 생성하고 scene·rebuild·두 helper·SVG를 복사한다. helper 정본은 저장소 `modules/`다. 각 프로젝트는 자기 안의 파일만 import하며 전역 설치본이나 symlink를 사용하지 않는다.

복사한 프로젝트를 편집할 때는 그 복사본의 `source.json`을 바꾸고 `node <복사본>/rebuild.mjs`를 실행한다. 이후 새 freeze로 새 개정본을 만든다. 원본 저장소 예제는 source.mjs·SVG·scene 수정 뒤 build.mjs를 다시 실행한다. 생성된 A/B를 직접 수정하면 다음 생성에서 덮어쓴다.

[boundary-input.json](../../examples/stillcuts/fixtures/boundary-input.json)은 편집 중인 A와 분리된 고정 검증 입력이다. touch 60→66의 한 경계 변경에서 point·인접 exposure·span·장면 샘플이 함께 바뀌는지 확인한다. 복사·고정 개정본의 단독 실행과 과거 개정본 보존은 Task 4 native 검사에서 검증했다.

최종 통합 검토에서 복사한 scene의 세 원화 사전이 `__proto__` own key를 잃는 결함을 발견했다. scene의 사전을 null-prototype 객체로 바꾸고 build.mjs로 A/B 복사본을 다시 생성했다. 편집한 source→복사본의 compileProject·compileCuts→JSON 왕복→실제 복사 scene의 접촉 구간 draw에서 일반 이름과 `__proto__`를 검사한다. 두 안 모두 방·열쇠·손의 draw를 확인했다. 이 새 검사는 Node의 이미지·Canvas 대역을 쓰므로 native 픽셀 검증으로 부르지 않는다. [RED 5/7](final-fix-1/targeted-red.log) · [GREEN 7/7](final-fix-1/targeted-green.log) · [일반 이름의 접촉 drawImage 호출 비교](final-fix-1/ordinary-control-draw-parity.json)

## 검토한 영상과 역사적 출력

[가상 의뢰](BRIEF.md)의 공통 행동은 손의 하강→열쇠 접촉→손가락 열기→손 퇴장→남은 열쇠다. A는 빈 방을 먼저 보여 주고 마지막 넓은 hold에 시간을 둔다. B는 손과 열쇠를 크게 보여 준 뒤 방으로 넓어진다. A는 쉼의 여백을, B는 놓는 행동의 세부를 우선하는 제안이다. 이것은 제작 의도이며 실제 관객 효과의 검증 결과가 아니다.

아래 영상과 출력 검토는 **scene의 own key 보강 전 고정 개정본**에 해당한다. 현재 scene 소스를 새로 freeze하면 다른 revision이 된다. 실제 A/B는 일반 이름을 쓰며 source·work·cuts·SVG·helper와 타이밍은 그대로다. 이번 보강에서 전체 영상을 다시 렌더하지 않았다. 아래 여섯 미디어와 기존 고정 개정본을 보존했다. [수정 범위·생성 파일·미디어 해시 대조](final-fix-1/preservation.json)

| 안 | 검토한 영상 개정본 | frame job · 범위 | span job · 범위 | full job · 범위 |
| --- | --- | --- | --- | --- |
| A | `f1d51eaa10567cba25eb1787fa5e65d8776f4da185c1c2bd4e290a0a658abc04` | `625649a9-cab3-4934-bb64-a7caeaf63fdf` · `[60,61)` | `a515dfc7-fd57-4f78-aa76-77e336d9d78f` · `[36,78)` | `b030aad5-33a8-4a71-9977-994c046e3b50` · `[0,192)` |
| B | `4355e5ec4829e994785e96c7788387d0a61f44dd43d2aa566cb3124cdd86fac0` | `9e39ea24-e8af-46df-b502-6dff54a5c791` · `[48,49)` | `88c9ab45-8bf1-49fd-95ff-42f376b1cf79` · `[18,66)` | `c5d57e2c-0459-4def-a8c2-b8f49ea5748c` · `[0,168)` |

- 현재 영상: [A 8초 MP4](../../.direction/production/jobs/b030aad5-33a8-4a71-9977-994c046e3b50/work.mp4) · [B 7초 MP4](../../.direction/production/jobs/c5d57e2c-0459-4def-a8c2-b8f49ea5748c/work.mp4).
- 현재 접촉 구간: [A 1.75초](../../.direction/production/jobs/a515dfc7-fd57-4f78-aa76-77e336d9d78f/work.mp4) · [B 2초](../../.direction/production/jobs/88c9ab45-8bf1-49fd-95ff-42f376b1cf79/work.mp4).
- 현재 접촉 프레임: [A f60](../../.direction/production/jobs/625649a9-cab3-4934-bb64-a7caeaf63fdf/frame.png) · [B f48](../../.direction/production/jobs/9e39ea24-e8af-46df-b502-6dff54a5c791/frame.png).

기술 정본은 [contact-fix-1/inspection/receipt.json](task-4/runs/contact-fix-1/inspection/receipt.json)이다. 실제 명령 배열·소스 해시·job·출력 해시·저작 범위·미디어 검사를 담는다. 리더는 여섯 출력의 해시·개정본·완료 상태·고정 manifest 범위를 [별도로 대조](primary-final-media.json)했다. 전체 실행 로그는 [fix-1-produce.log](task-4/fix-1-produce.log), [fix-1-inspect.log](task-4/fix-1-inspect.log)이며, 각 자식 명령의 stdout·stderr·status는 [contact-fix-1 실행 폴더](task-4/runs/contact-fix-1)에 있다.

과거 A `b80a591239cabcf6a440cf9a3bf788a74b7f7094f4eca89e0b2d9f267930fb79`와 B `f48dddf994816b294cbf1ec79764643241f3342afbb48b99afd219b52569ccd5`의 기술 기록은 [기존 receipt](task-4/receipt.json)에 보존했다. 첫 독립 검토에서 접촉 가독성이 부족했다. `keys.svg` 원본과 A/B 복사본만 고친 뒤 현재 개정본을 생성했다. 시간·구도·배치는 바꾸지 않았다. [1차 검토](independent-output-review.md) · [수정 보고](../../.superpowers/sdd/2026-11-05-cinewright-production/output-contact-fix-report.md) · [수정본 독립 재검토](independent-output-review-fixed.md)

## 실행 명령

저장소 루트에서 실행한다. 아래는 현재 고정 개정본과 job을 사용하는 재현 명령이다. 기존 `.direction/production` 기록이 있는 환경에 해당한다. play/review는 종료할 때 Ctrl+C를 쓴다. 새 frame/render 실행은 새 job을 만들며 위 job을 덮어쓰지 않는다.

```sh
export TMPDIR="$PWD/.direction/production/task-4-runs/contact-fix-1/tmp"
CW_REV_A=f1d51eaa10567cba25eb1787fa5e65d8776f4da185c1c2bd4e290a0a658abc04
CW_REV_B=4355e5ec4829e994785e96c7788387d0a61f44dd43d2aa566cb3124cdd86fac0
node scripts/direction.mjs play "$CW_REV_A" --store .direction/production
node scripts/direction.mjs frame "$CW_REV_A" touch --store .direction/production
node scripts/direction.mjs render "$CW_REV_A" --span contact-review --store .direction/production
node scripts/direction.mjs render "$CW_REV_A" --store .direction/production
node scripts/direction.mjs play "$CW_REV_B" --store .direction/production
node scripts/direction.mjs frame "$CW_REV_B" touch --store .direction/production
node scripts/direction.mjs render "$CW_REV_B" --span contact-review --store .direction/production
node scripts/direction.mjs render "$CW_REV_B" --store .direction/production
node scripts/direction.mjs review b030aad5-33a8-4a71-9977-994c046e3b50 c5d57e2c-0459-4def-a8c2-b8f49ea5748c --store .direction/production
```

보존 영상의 수정본을 만든 freeze 명령은 `node scripts/direction.mjs freeze examples/stillcuts/a --store .direction/production`과 같은 명령의 `b` 경로다. Task 4는 반환된 실제 개정본으로 play·frame·구간·전체 render를 실행했다. Task 5는 이 영상 명령이나 전체 테스트를 중복 실행하지 않았다. 마지막 own key 보강 뒤에는 전체 테스트를 한 번 실행했으며, 보존 영상을 새 소스의 출력으로 바꾸어 부르지 않는다.

## 기술 검증과 관찰 범위

| 검사 | 확인한 결과 | 근거 |
| --- | --- | --- |
| 현재 소스 전체 회귀 | scene의 own key 보강과 새 회귀 4개를 포함해 364 passed, 0 failed/skipped/cancelled. 기존 native integration도 통과 | [final-fix-1/npm-test.log](final-fix-1/npm-test.log) |
| 영상 검증 당시 전체 회귀 · 역사적 기록 | 수정된 SVG와 증거 도구를 포함해 360 passed, 0 failed/skipped/cancelled | [fix-1-npm-test.log](task-4/fix-1-npm-test.log) |
| native 픽셀·상태·복사 격리 | 실제 Canvas의 crop·투명 가장자리·contain/cover·anchor·hold/advance·노출 밖 비활성·역방향/고정 임의 순서·CLI PNG·복사본 재생·고정 개정본 보존을 검사 | [Task 4 보고](../../.superpowers/sdd/2026-11-05-cinewright-production/task-4-report.md) 및 현재 receipt의 nativeFixture |
| live와 출력 PNG | 접촉 frame job은 exact. 경계·조밀 구간의 full-render PNG는 A 77장, B 83장 exact | [현재 receipt](task-4/runs/contact-fix-1/inspection/receipt.json) |
| 인코딩·시간 | H.264/yuv420p, 640×360, 24fps. A 전체 192프레임·8초, 구간 42프레임·1.75초. B 전체 168프레임·7초, 구간 48프레임·2초. 최대 PTS 반올림 오차 약 0.0000003334초 | 현재 receipt의 probe |
| 디코드 RGB | 프레임별 mean absolute RGB 차이의 최댓값 A 0.7878/255, B 0.7018/255. 손실 압축 차이로 기록하며 동일 픽셀을 요구하지 않음 | 현재 receipt의 decodedSummary |
| 오디오 | AAC 48kHz 스테레오. 디코드 PCM peak 0. 두 안의 의도된 무음과 일치 | 현재 receipt의 silentAudio |
| 자동 재생 | live는 A f191, B f167까지 도달. MP4는 원래 640×360·1배속에서 각각 8초·7초 ended=true. 드롭 A 1프레임, B 0프레임 | 현재 receipt의 livePlayback·mp4Playback |
| 독립 출력 관찰 | 수정본 A/B 접촉 ADDRESSED. 경계·조밀 동작 띠와 실제 크기 PNG에서 남은 필수 결함 없음 | [독립 재검토](independent-output-review-fixed.md), [종합 검토](REVIEW.md) |

native alpha 검사와 불투명 yuv420p MP4 검사는 다르다. `observe`의 작은 PCM peak 실패 조건은 의도된 무음 예제의 통과 기준으로 쓰지 않았다. 오디오 사건 동기화나 직접 청취를 입증하지 않는다. 자동 끝 도달과 독립 정지 프레임 관찰은 중단 없는 직접 연속 시청을 대신하지 않는다.

기존 baseline 8/8·doctor·help는 입력이 유지돼 재사용했다. 문서 대화 지침의 다섯 가상 행동 검사는 [BEHAVIOR.md](BEHAVIOR.md)에 있다. 검사 뒤 후보의 정서·서사 효과를 가설로 명시하는 작은 문구가 추가됐다. [검사 소스 해시](behavior-source-receipt.json)는 그 문구 추가 전 상태이며 다섯 응답을 최종 소스의 새 실행으로 바꾸지 않았다.

## 제한된 성능 측정

사전 [계획](MEASUREMENT.md)과 [정확한 입력·탐색 인덱스](measurement-plan.json)를 고정했다. 실측 원본은 [performance.json](performance.json), 코드와 범위는 [measure.mjs](measure.mjs)다. 각 조건에서 새 Node worker와 새 headless Chrome을 세 번 시작했다. 총 **9 worker, 216 seek, frame 0을 포함한 225 PNG readback**이다. 전체 영상은 렌더하지 않았다. [리더의 별도 증거 감사](primary-performance-audit.json)는 이 수와 해시·상태·PID·요약값·소스 보존을 재확인했다.

환경은 macOS 27.2(26B123), arm64 Apple M4 Pro, 논리 CPU 12개, RAM 24GiB다. Node v26.12.1, Chrome 156.0.8078.80, playwright-core 1.64.1, three 0.180.0, FFmpeg 9.0.2를 사용했다. 기존 SwiftShader 플래그, viewport 640×480, deviceScaleFactor 1, Canvas 320×180, 24fps다. OS 파일 캐시는 비우지 않았다. 다른 앱의 전체 부하는 통제하지 않았다. 소유한 렌더·재생 작업은 중단된 상태였다.

| 실제 조건 | 컷·프레임 | 고유 SVG 파일·내용 | 컷 참조·재사용 참조 | SVG 논리 바이트 |
| --- | --- | --- | --- | ---: |
| baseline-4 | 4·96 | 4·4 | 4·0 | 964 |
| reused-24 | 24·576 | 4·4 | 24·20 | 964 |
| unique-24 | 24·576 | 24·24 | 24·0 | 5,784 |

SVG는 64×36의 작은 자체 합성 도형이다. 한 원화 레이어에 배치했다. 재사용 조건은 자산 하나를 6컷에서 참조한다. 세 조건의 실제 고정 개정본은 performance.json에 있다. 이 입력은 A/B 작품이나 복잡한 장면의 대표 표본이 아니다.

시간 단위는 ms다. 준비 시간은 페이지 탐색 직전부터 `window.direction`의 frame 0 준비 대기 반환까지다. 첫 readback은 같은 시작점에서 frame 0 상태·PNG 문자열이 Node로 돌아올 때까지다. seek는 한 `page.evaluate`의 `direction.seek`·전체 Canvas PNG 인코딩·상태/문자열 직렬화·프로토콜 반환을 포함한다. PNG 저장·해시·검증과 RSS·디스크 순회는 타이머 밖이다. 오디오 seek 완료와 물리 화면 표시는 측정하지 않았다. freeze·무음 준비·worker/브라우저 시작·페이지 생성도 이 두 startup 값에서 제외했다.

| 조건·회차 | 탐색→준비 | 탐색→첫 readback | 순방향 8회 중앙값 | 역방향 8회 중앙값 | 고정 임의 8회 중앙값 |
| --- | ---: | ---: | ---: | ---: | ---: |
| baseline-4 r1 | 729.082 | 1,111.409 | 8.986 | 1.427 | 1.378 |
| baseline-4 r2 | 600.754 | 1,081.632 | 4.727 | 1.453 | 1.515 |
| baseline-4 r3 | 904.765 | 1,249.363 | 4.376 | 1.477 | 1.521 |
| reused-24 r1 | 844.424 | 1,108.975 | 5.066 | 1.460 | 1.524 |
| reused-24 r2¹ | 595.305 | 1,062.646 | 5.599 | 1.633 | 1.468 |
| reused-24 r3 | 737.863 | 1,136.211 | 8.276 | 1.925 | 1.658 |
| unique-24 r1¹ | 611.280 | 1,085.721 | 6.190 | 1.641 | 1.938 |
| unique-24 r2 | 599.919 | 1,073.010 | 6.458 | 1.671 | 1.834 |
| unique-24 r3¹ | 598.820 | 1,068.467 | 5.461 | 1.434 | 1.778 |

¹ `/audio.wav`의 `net::ERR_ABORTED`가 기록된 회차다. 아래 실패 기록을 함께 읽는다. raw seek 216개의 개별 시간·상태·PNG 해시는 [실행별 result.json](task-5-measurement/runs)에 보존했다.

| 조건 | 첫 readback 최소 / 중앙 / 최대 ms | 세 실행의 순방향 중앙값 최소–최대 | 역방향 | 고정 임의 | 개별 순방향 seek+readback 최대 ms |
| --- | --- | --- | --- | --- | ---: |
| baseline-4 | 1,081.632 / 1,111.409 / 1,249.363 | 4.376–8.986 | 1.427–1.477 | 1.378–1.521 | 506.128 |
| reused-24 | 1,062.646 / 1,108.975 / 1,136.211 | 5.066–8.276 | 1.460–1.925 | 1.468–1.658 | 433.934 |
| unique-24 | 1,068.467 / 1,073.010 / 1,085.721 | 5.461–6.458 | 1.434–1.671 | 1.778–1.938 | 448.583 |

마지막 열은 각 조건의 원본 3회×8회, 총 24개 순방향 측정값에서 다시 계산한 개별 최댓값이다. [원본 해시와 재계산 근거](final-fix-1/forward-maxima.json)에 해당 회차·인덱스를 남겼다. 중앙값보다 긴 지연이 실제로 있었으며 이를 제거하거나 다시 측정하지 않았다. 탐색 순서는 고정했고 OS 캐시를 비우지 않았으며 다른 앱의 부하는 통제하지 않았다. 이 차이의 원인이나 보편적인 지연 상한·실시간 프레임 예산을 확정하지 않는다.

freeze와 무음 준비는 조건당 한 번이었다. 각각 baseline 15.332/38.566ms, reused 14.585/56.357ms, unique 19.870/59.217ms다. 브라우저 시작의 세 실행 중앙값은 각각 317.571, 339.028, 326.533ms이며 별도 값이다. 고정 순서·세 번의 관찰로 조건 간 일반 성능 우열이나 확장성을 추론하지 않는다.

RSS는 `beforeBrowser`, `browserLaunched`, `firstFrame0`, `afterForward`, `afterReverse`, `afterRandom`, `afterBrowserClose`의 **7회 스냅샷**이다. 아래는 각 실행의 스냅샷 중 최댓값이다. KiB는 1024바이트다. 브라우저 값은 그 시점의 Chrome/Chromium 하위 PID RSS 합이다. 공유 페이지를 중복 계산할 수 있다. peak 메모리나 고유 물리 RAM이 아니다. coordinator Node·부모·형제·다른 앱·종료/재부모화된 프로세스는 제외했다. PID·PPID·실행 파일명과 단계별 원값은 각 result.json에 있다.

| 조건·회차 | Node RSS KiB | 브라우저 RSS 합 KiB | TMPDIR 스냅샷 최대 논리 바이트 | 종료 뒤 TMPDIR 바이트 | 종료 단계 run 파일 바이트² |
| --- | ---: | ---: | ---: | ---: | ---: |
| baseline-4 r1 | 149,008 | 1,268,736 | 7,259,262 | 0 | 143,471 |
| baseline-4 r2 | 149,648 | 1,265,120 | 7,259,262 | 0 | 143,867 |
| baseline-4 r3 | 148,000 | 1,259,488 | 7,259,262 | 0 | 143,880 |
| reused-24 r1 | 146,464 | 1,279,664 | 7,259,246 | 0 | 144,004 |
| reused-24 r2 | 146,720 | 1,281,600 | 7,259,246 | 0 | 144,338 |
| reused-24 r3 | 146,720 | 1,276,288 | 7,259,246 | 0 | 143,998 |
| unique-24 r1 | 145,424 | 1,283,968 | 7,259,246 | 0 | 144,286 |
| unique-24 r2 | 163,328 | 1,286,096 | 7,259,246 | 0 | 143,945 |
| unique-24 r3 | 147,296 | 1,285,888 | 7,259,246 | 0 | 144,264 |

² run 디렉터리의 PNG·config·부분 result·로그를 해당 순회 시점에 센 값이다. 그 뒤의 최종 result·process 기록 쓰기는 포함하지 않는다. 브라우저 종료 뒤 모든 실행에서 남은 소유 브라우저 하위 PID는 0개였다.

| 보존 디렉터리의 준비 직후 논리 바이트 | baseline-4 | reused-24 | unique-24 |
| --- | ---: | ---: | ---: |
| `fixtures/<조건>` · helper·JSON·SVG | 14,133 | 21,397 | 31,457 |
| `stores/<조건>` · 고정 project/runtime/vendor/tools | 2,063,979 | 2,071,243 | 2,083,723 |
| `audio/<조건>` · mix.wav와 mix.log | 768,433 | 4,608,433 | 4,608,433 |

위 경로는 모두 `evidence/2026-11-05-production/task-5-measurement/` 아래다. 일시 디렉터리는 `tmp/<조건>-r<회차>`, 실행 자료는 `runs/<조건>-r<회차>`다. Playwright의 정상 종료 정리 뒤 TMPDIR의 일반 파일 바이트가 0이었다. 수동 증거 삭제는 하지 않았다. 마지막 측정 폴더 순회는 431개 일반 파일, 17,654,697바이트였다. 이 누적 감사 값에는 원본 측정 코드와 중단 당시 JSON도 포함된다. 폴더 밖의 performance.json·계획·설명·최상위 실행 로그는 제외한다.

논리 바이트는 `lstat.size`이며 실제 할당 블록이나 APFS 물리 사용량이 아니다. symlink는 따라가지 않았다. 실측 순회에서 파일 소실·읽기 오류는 없었다. 다만 순회는 원자적이지 않다. repo-local TMPDIR 밖 OS 임시 파일·캐시·swap·OS 메모리는 측정하지 못했다.

## 실패·수정·재개 기록

성능 측정의 최초 명령은 `TMPDIR="$PWD/evidence/2026-11-05-production/task-5-launch-tmp" node evidence/2026-11-05-production/measure.mjs`였다. [전체 로그](task-5-measurement.log)는 exit 1을 보존한다. `reused-24-r2`가 24회 seek·25개 readback·7회 스냅샷을 마친 뒤, 전체 네트워크 오류가 없어야 한다는 가드가 `/audio.wav`의 `net::ERR_ABORTED` 한 건을 거부했다. 이 요청 취소의 정확한 내부 원인은 직접 관찰하지 않았다. 빠른 currentTime 변경은 가능한 원인이지만 확정하지 않는다.

PNG·상태 타이머 자체는 실패하지 않았다. [원래 failed result](task-5-measurement/runs/reused-24-r2/result.json), [stderr](task-5-measurement/runs/reused-24-r2/stderr.log), exit 1 process 기록, [중단 당시 performance](task-5-measurement/performance-interrupted.json), [최초 코드](task-5-measurement/measure-initial.mjs)를 유지했다. [별도 조정 기록](task-5-measurement/audio-abort-reconciliation.json)은 선언한 인덱스·25 PNG 해시/크기·완료된 단계·종료 상태를 대조했다. 리더도 이 근거를 별도로 확인했다. 해당 회차의 원본 failed 상태를 성공으로 고치지 않았으며 최종 집계에는 명시적으로 표시했다.

이후 가드는 정확히 `/audio.wav`의 `net::ERR_ABORTED`만 별도 기록한다. player failure, pageerror, HTTP 오류와 다른 자산 요청 실패는 계속 거부한다. 타이머·fixture·탐색 순서·샘플링 코드는 바꾸지 않았다. 이미 측정한 다섯 worker는 다시 실행하지 않았다. [continue-measurement.mjs](continue-measurement.mjs)로 **미실행 네 worker만** 이어서 실행했다. [재개 로그](task-5-continuation.log)는 exit 0이다. unique-24 r1/r3에서도 같은 종류의 오디오 취소를 각각 한 건 보존했다. 오디오 seek 완료는 원래 계획부터 측정 범위 밖이었다.

headless Chrome stderr에는 allocator 중복 로드, `CVDisplayLinkCreateWithCGDisplay failed`, macOS `SetApplicationIsDaemon`의 `paramErr -50` 진단도 있다. [예시 stderr](task-5-measurement/runs/baseline-4-r1/stderr.log)와 나머지 실행별 전체 stderr를 보존했다. 이를 깨끗한 브라우저 출력이라고 표현하지 않는다. 이 환경 관찰만으로 새 제품 결함이나 수치의 원인을 단정하지 않는다.

이전 단계의 실패도 유지했다. Task 3의 소매 잘림, signed zero를 깊은 동등성으로 비교한 검사 오류, 편집 중인 A에서 고정 경계 fixture를 파생한 결함은 [Task 3 보고](../../.superpowers/sdd/2026-11-05-cinewright-production/task-3-report.md)에 있다. Task 4의 fixture 문자열 문법 오류, JSON에서 빠지는 `undefined` 비교 오류와 build 기대값 드리프트는 [Task 4 보고](../../.superpowers/sdd/2026-11-05-cinewright-production/task-4-report.md)의 RED/GREEN 로그에 있다. exit 7·잘못된 미디어·대기 timeout·잘못된 범위 검사는 의도된 음성 대조군이며 제작 실행 실패와 구분한다. 수정된 입력과 증거 코드에 한해 관련 검증을 다시 실행했다. 이전 356/356·360/360과 현재 364/364는 각각의 실행 기록으로 남겼다.

## 보호 범위와 남은 단계

사전·사후 비교의 원본 기록은 로컬에 보관한다. 비교 범위는 다음과 같다.

- 전역 설치본의 `node_modules`를 제외한 소스·리소스 **64개**: 변경·추가·삭제 없음.
- Counting Star의 지정 comparison 하위 경로 **1,011개**: 변경·추가·삭제 없음.
- Counting Star의 추적 Git 상태와 HEAD: 기준과 같음. 기존의 추적 수정 상태도 그대로다.
- [기존 개발 소스 60개](preserved-existing-source.json): 기준 commit과 같음.
- [접촉 수정 전 증거 928개](contact-pre-fix-preservation-after.json): 목록에 든 raw 영상·PNG·개정본·기록 모두 같음.

이 보호 기록은 설치본의 제외한 의존성이나 Counting Star의 다른 ignored 경로 전체를 증명하지 않는다. Task 5와 마지막 own key 보강은 보호 receipt를 덮어쓰지 않았다. 이번 보강의 해시 대조는 저장소 안의 기존 파일·미디어·보호 기록을 대상으로 했으며 외부 보호 경로를 새로 조사한 결과가 아니다. 리더가 [최종 소스·변경 파일·소유권](primary-final-source-scope.json)을 확인했다. 검토한 소스·검사 해시가 일치하며 Git에 보이는 변경 경로는 승인 범위 안에 있다.

Task 5의 추가 범위는 측정 코드·고정 계획·fixture·로그·performance.json, 이 RESULT와 REVIEW, 예제 README의 마지막 상태 절과 루트 README의 결과 링크다. A/B 입력·scene·SVG·module·runtime·CLI·패키지·테스트는 Task 5에서 수정하지 않았다. 구현 호출의 요청값은 `gpt-6-astra` / `max`다. 이는 요청 메타데이터이며 제공자 런타임 식별이나 service mode의 독립 증명이 아니다.

최종 통합 검토에서 지적한 own key 결함의 수정 경로는 scene 정본·생성 A/B scene·기존 build 테스트와 이 결과 문서·REVIEW·예제 README다. [수정 보고](../../.superpowers/sdd/2026-11-05-cinewright-production/final-fix-1-report.md)에 정확한 diff와 검증 기록을 남겼다. [마지막 수정 범위의 독립 재검토](../../.superpowers/sdd/2026-11-05-cinewright-production/final-fix-1-re-review.md)는 own key 결함과 최대 지연 공개를 해결된 것으로 판정했다. 남은 소스·증거 지적 없이 로컬 전달을 승인했다.

남은 판단은 A f54–60의 정상 속도 접촉 가독성, 중단 없는 직접 연속 시청·청취, 실제 관객 반응과 실제 사용자 수락이다. 설치·공개·배포·커밋은 하지 않았다. [구간별 판단과 출처](REVIEW.md)에서 제작 의도·제작자 관찰·독립 판정·자동 재생을 구분한다.
