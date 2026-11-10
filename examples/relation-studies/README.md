# 시간 속의 관계 세 편

외부 곡·사진·폰트 없이 직접 그린 Canvas 장면과 자작 합성음으로 만든 짧은 작품이다. 관객이 읽을 관계를 먼저 정하고, 같은 Cinewright manifest v1의 freeze/play/frame/render 경로로 출력한다. 전문 작품의 자동 생성기나 예술 수락의 증거가 아니다.

```sh
# 저장소 루트, Node 22+, 준비된 npm 의존성, Chrome, FFmpeg/FFprobe
node scripts/direction.mjs doctor
node examples/relation-studies/run.mjs ./new-relation-output
```

**새 경로**만 받는다. 기존 경로이면 시작 전에 실패하며 덮어쓰지 않는다. 컵 20초, 문 10초, 종이 12초를 960×540, 24fps로 렌더한다. `cups.mp4`, `doorway.mp4`, `fold.mp4`, 저작 가능한 프로젝트 `cups/`, `doorway/`, `fold/`, canonical store와 `results.json`이 생긴다. `results.json`은 revision/job, 영상 SHA-256, 원본 프로젝트/영상 경로를 연결한다. 재실행은 다른 새 경로를 쓴다.

## 작품 선택과 시간

제작 권한은 이번 사용자의 “먼저 의도와 시간구조를 정하고 자율선택” 지시다. 다음 해석은 제작자가 정한 새 자작 작품이며 기존 곡이나 확정 서사를 재해석한 것이 아니다. 세 편의 관객 가설은 설명 없이 영상을 먼저 보고 검토해야 한다.

| 작품 | 선택한 관계와 구성 | 시간구조와 소리 | 생략·실패 단서 |
| --- | --- | --- | --- |
| **둘이 지난 자리 / Two, after** | 두 찻잔의 간격, 떠난 자리, 다른 잔이 물려받는 위치. 큰 테이블보와 비대칭 창빛에 작은 녹색/상아색 잔을 둔다. 수평에 가까운 잔 경로와 사선의 공간을 대비한다. | 0–2.5초 분리된 정지, 2.5–5초 녹색 잔 접근, 7–10초 상아 잔 응답, 10–11초 함께 정지, 11–13초 녹색 잔 퇴장, 14–16초 상아 잔이 앞 잔의 자리를 차지, 16–20초 hold. 마지막 음은 16초, 끝 1.2초는 디지털 무음. | 누가 잔을 움직이는지·인간 서사는 정하지 않는다. 두 잔이 같이 움직이거나 흔적이 너무 약하면 먼저/나중 관계가 줄어든다. 감정은 가설이다. |
| **건너편 / The other side** | 같은 문을 밝은 입구와 어두운 출구로 뒤집어 본다. 바깥에서는 문을 오른쪽, 안에서는 왼쪽에 두고 남은 벽의 빈 사각형을 드러낸다. | 0–2초 정지, 2–3.5초 문 열림, 5초 hard cut으로 안쪽, 6.5–7.5초 벽의 빛 소거, 7.5–10초 hold. 4.5초 상성부가 컷을 앞서고 5.33초 낮은 음이 뒤따른다. | 카메라 이동·누적 흔적을 사용하지 않는다. 공간의 역전이 연결되지 않으면 두 무관한 방처럼 읽힐 수 있다. |
| **접힌 사이 / Held in the fold** | 펼친 세 면이 순서대로 닫히며 다른 색을 보이고, 다시 열렸을 때 같은 두 날개로 돌아온다. 넓은 여백, 청록 앞면·황색 뒷면·적갈색 중심을 고정한다. | 2–4초 왼쪽, 4–6.5초 오른쪽 접힘, 6.5–8초 닫힌 정지, 8–10초 순차 개방, 10–12초 정지. 소리는 첫 접힘보다 먼저, 둘째 접힘과 마지막 개방보다 늦다. | 형태 대응은 두 힌지와 꼭짓점을 직접 저작했다. 자동 의미 보간·물리 종이 solver가 아니다. 두 날개가 동시에 접히면 대답하는 순서가 줄어든다. |

상세한 관찰·수정·독립 검토 대기와 실제 출력은 [implementation.md](../../docs/implementation/2026-11-10-code-expression/implementation.md)에 기록한다. 이미지 프레임 분석, 자동재생, 원속도 직접 시청·청취, 관객 수락은 별개다.

## 표현 결정과 내부 값

| 저자가 정한 표현 | 실행에 쓰는 값·코드 | 바꾸면 함께 확인할 것 |
| --- | --- | --- |
| 누가 먼저 다가가고 어느 자리가 남는가 | `studies.mjs`의 `cups.tracks`, `placements`. `cups.mjs`가 현재 프레임까지의 사건 목록을 매번 평가한다. `placements`는 녹색 잔의 받침 자국만 뜻한다. | 위치를 바꾸면 사건의 위치도 저작한다. 자동 접촉 검출이 아니다. `from`은 포함하며 녹색 잔이 떠나면서 자국을 드러낸다. |
| 잔이 떠난 뒤에도 남는 자국의 명암 | `traceAlpha`와 `cups.mjs`의 끊어진 호. 수정 전 .12/균일 호, 수정 후 .34/끊긴 호. | 장면의 주목 순서·영상 압축 후 가독성. 값을 높이는 것이 항상 개선은 아니다. |
| 두 화면이 공간을 뒤집는 순간 | `doorway.mjs`의 `frame>=120` 분기. | 양쪽 문 색·방향, 컷 전후 소리의 지속. `points.reverse`만 바꿔도 컷이 자동으로 바뀌지는 않는다. |
| 종이의 전후면과 순차 응답 | `fold.tracks`, `fold.mjs`의 명시적 힌지·cosine 투영·z 순서. | 앞뒷면 대응, 접힌 폭과 그림자 폭, 소리의 지연. 트랙은 수치 보간만 제공한다. |
| sparse score의 음높이·음간격·침묵 | 각 작품의 `score`와 `score.mjs`의 직접 합성. frame, MIDI 음높이, 길이(초), 진폭, pan. | 실제 청취의 호흡·레벨·끝 여운. MIDI는 이 파일의 주파수 표기이며 외부 MIDI 음원은 없다. |
| 출력·편집 표식 | `fps`, `frames`, `size`, `points`, `spans` → 기존 work.json v1. | 표식은 UI 탐색용이다. tracks·scene·score의 사건을 자동 재배치하지 않는다. 시간 변경 시 관련 저작값도 함께 바꾼다. |

새 공용 엔진은 만들지 않았다. `preparePoseTracks`를 두 작품의 서로 다른 대상(잔 이동/종이 각도)에 재사용한다. `cups`의 table 레이어가 같은 프레임의 두 잔 좌표를 기존 `path` 채널로 게시하고 vessels 레이어가 소비한다. 채널 자체는 과거를 축적하지 않는다. 장면 코드가 과거 `placements`를 평가하며, 재생 이력·벽시계·난수는 사용하지 않는다. 문 작품에는 흔적 계산이 전혀 없다.

`score.wav`는 직접 합성한 48 kHz stereo PCM 원본이다. work.json의 샘플 단위 배치로 기존 mixer/player/render가 같은 신호를 사용한다. 최종 MP4는 H.264/AAC이며 **AAC는 원본 비트 보존이 아니다.** 예제의 새 그림·합성음·소스 이용 허용은 [LICENSE.txt](LICENSE.txt)에 적었다. 복사되는 기존 도구·라이브러리는 원래 권리를 유지한다.

## 수정·재출력·검증

전체 재생성 없이 작품 하나로 시작할 수 있다.

```sh
node examples/relation-studies/build.mjs cups ./my-cups
# 생성된 source.json / scene.mjs / work.json을 직접 저작한다.
node scripts/direction.mjs freeze ./my-cups --store ./my-store
node scripts/direction.mjs play REVISION --store ./my-store
node scripts/direction.mjs frame REVISION departure --store ./my-store
node scripts/direction.mjs render REVISION --from 263 --to 338 --store ./my-store
node scripts/direction.mjs render REVISION --store ./my-store
# 두 실제 렌더 작업을 기존 review로 비교한다.
node scripts/direction.mjs review JOB_A JOB_B --store ./my-store
```

`REVISION`과 `JOB_A/B`는 해당 실행의 반환값을 쓴다. 생성된 프로젝트는 필요한 scene, source, score.wav, pose-tracks/motion 복사본을 포함해 freeze 안에서 외부 example import 없이 실행된다. 프로젝트 이동 시 원래 store의 절대경로는 갱신해야 한다.

```sh
node --test tests/relation-studies.test.mjs
# run 결과마다 한 번: verification/ 새 경로에 증거 생성. 기존 검증 폴더는 덮어쓰지 않는다.
node examples/relation-studies/verify.mjs ./new-relation-output
```

검증은 모든 프레임의 정·역·임의 seek PNG, 사건 경계 전/해당/후와 첫/끝, 별도 frame job, 구간/전체 모든 PNG 일치, PCM 샘플과 AAC 디코드 비교, 자동 1배속 audio-clock 재생을 기록한다. 같은 로컬 Chrome 환경에서의 기술적 일치이며 시청·청취·의미 전달·전문 품질·사용자 수락을 통과시키지 않는다.
