# 공개 자작 예제 구현·출력 인계

구현 작업자, 2026-11-10 KST. 사용자가 이번 구현 담당에게 위임한 “대표 작품 1편 + 표현선택이 다른 작은 변주 2편, 먼저 의도와 시간구조를 정하고 자율선택” 범위에서 제작했다. 다른 작업자·하위 에이전트를 만들지 않았다. 원곡 Counting Star나 기존 확정 서사는 사용하지 않았다.

## 관찰: 실제 변경과 실행

새 공개 진입점 `node examples/relation-studies/run.mjs <새 출력 경로>`가 실제로 세 프로젝트·자작 PCM 음원·전체 영상·frozen revision·canonical job을 생성한다. 마지막 소스 수정 후 아래 명령을 다시 처음부터 실행한 **delivery/** 가 최종 인계다. `draft-*`, `final/`, `fold-recheck/`는 보존한 이전 제작·진단 이력이다.

```sh
node scripts/direction.mjs doctor
node examples/relation-studies/run.mjs evidence/2026-11-10-code-expression/delivery
node --test tests/relation-studies.test.mjs
node examples/relation-studies/verify.mjs evidence/2026-11-10-code-expression/delivery
node --test --test-concurrency=1 tests/craft-execution.test.mjs tests/pose-tracks.test.mjs tests/cuts.test.mjs tests/timeline.test.mjs tests/music.test.mjs tests/music-integration.test.mjs tests/integration.test.mjs
```

임의의 새 디렉터리에 같은 `run.mjs` 명령을 사용할 수 있다. 기존 디렉터리는 EEXIST로 거절한다. 전체 저장소 npm test는 실행하지 않았고 변경에 관련된 기존 회귀 179개를 실행했다. 신규 검사는 서로 다른 시간 관계·결정적 과거 평가와 self-contained freeze/prepare/덮어쓰기 거절/PCM 끝 무음을 두 검사로 묶었다. 검사 개수를 목표로 늘리지 않았다.

**출력:** 저장소 기준 `evidence/2026-11-10-code-expression/delivery/`. 원본 자산은 각 프로젝트의 `score.wav`와 scene/source 코드다. 새로 작성한 Canvas 그림과 합성음·예제 소스는 `examples/relation-studies/LICENSE.txt`에 재사용·수정·재배포 허용을 명시했다. 외부 노래·샘플·사진·폰트·영상·이미지 생성 서비스를 사용하지 않았다. 복사한 기존 Cinewright 모듈·도구 및 라이브러리 권리를 재정의하지 않는다.

| 작품 | 최종 revision | 전체 render job | 영상 |
| --- | --- | --- | --- |
| 둘이 지난 자리, 20초 | `c5aa4ad8f24dee659526807136d4dd7ffd69b6ef74fb3559c2df831c0231ffd6` | `c465a0b6-7dc5-4b55-9fe9-469d4e1d7a05` | [cups.mp4](../../../evidence/2026-11-10-code-expression/delivery/cups.mp4) |
| 건너편, 10초 | `bfc7411768e8a9bf444833c20e3e40791c16363e13c92ab10f41379de45aa9b0` | `ef9ee569-b93f-47f4-99cf-fceff8c321ae` | [doorway.mp4](../../../evidence/2026-11-10-code-expression/delivery/doorway.mp4) |
| 접힌 사이, 12초 | `517cfa5582aea710236af06ec30937d4488027828dbce4f22b38d18b0c9845f4` | `0b4094ce-1feb-4e3f-a14e-dc5db1efb58a` | [fold.mp4](../../../evidence/2026-11-10-code-expression/delivery/fold.mp4) |

세 영상은 960×540, 24fps H.264/AAC다. 정확한 경로·SHA-256·원본 PCM 샘플 수와 peak는 [delivery/results.json](../../../evidence/2026-11-10-code-expression/delivery/results.json)에 있다. 컵·문은 서로 다른 새 경로의 두 번의 공개 run 결과에서 revision과 영상 SHA-256까지 같았다. 종이는 후속 수정 후 새 공개 run으로 출력했다. `run.json`/`final/results.json`은 최종 인덱스가 아니다.

환경 doctor 관찰: Node v26.12.1, Chromium 157.0.8103.38, FFmpeg/FFprobe 9.0.2, Canvas/WebGL2 true. 설치나 의존성 갱신 없이 기존 도구를 사용했다. 브라우저·FFmpeg 버전은 각 canonical job.json에도 남는다.

## 구현과 저작의 구분

관객이 먼저/나중의 위치를 읽고, 빈 자리와 남은 자리의 차이를 발견하는 정물극을 대표로 선택했다. 다른 후보인 공간 역전과 접힘의 응답은 별도 짧은 작품으로 제작했다. 세 작품에 같은 흔적 서사나 사건 공식은 적용하지 않았다. 구체적인 색·구도·음간격·정지 구간·성공/실패 가설은 [공개 README](../../../examples/relation-studies/README.md)의 표에 있다. 이것은 제작자 해석이며 관객 반응의 관찰이 아니다.

- 대표의 녹색·상아색 잔과 비대칭 창빛/테이블보는 직접 Canvas로 작화했다. `preparePoseTracks`의 수치 트랙으로 두 잔을 다른 시각에 움직인다. table 레이어가 `path` 타입으로 현재 프레임의 두 좌표를 write하고 vessels 레이어가 read해 그린다. 레이어 교환은 과거 기억을 만들지 않는다.
- 녹색 잔의 두 이전 받침 자리는 저작된 `placements` 사건 목록에서 `from<=frame`인 항목만 매번 평가한다. 이후 방문 프레임 수, 렌더 순서, 벽시계, seed 없는 난수에 의존하지 않는다. 자국은 받침의 완전한 물리 얼룩이 아닌 직접 그린 그래픽 호다. 자동 사건 감지나 유체 시뮬레이션을 주장하지 않는다.
- 문 작품은 두 구도의 hard cut과 문 열림/빛 소거를 직접 저작한다. 누적 흔적도 음량 반응도 없다. 컷 후 어두운 출구와 빈 벽의 비중이 바뀐다.
- 종이 작품은 명시적으로 짝지은 힌지·꼭짓점·앞뒷면과 가림 순서를 사용한다. 같은 pose-tracks API를 잔 이동과 종이 각도에 각각 재사용했다. 보간이 의미 있는 형태 대응을 자동으로 찾아내지는 않는다.
- 음악은 `score.mjs`의 직접 additive synthesis다. 각 작품의 score 이벤트에 음높이·시각·길이·pan을 저작했다. 영상 프레임에서 추출한 비트나 분석 추정 음악 구조가 아니다. MIDI 숫자는 주파수 지정이며 외부 음원은 없다. 마지막 음의 끝이 프로젝트를 넘으면 오류로 거절한다.
- 새 manifest/규칙 언어, 공용 누적 엔진, 런타임 API를 추가하지 않았다. 기존 manifest v1, compositor, mixer, freeze, player, frame, render를 그대로 사용한다. 각 프로젝트에는 필요한 pose-tracks/motion 복사본이 들어가며 frozen project 밖의 example 파일을 import하지 않는다.

실제 수정 파일은 `examples/relation-studies/{README.md,LICENSE.txt,studies.mjs,cups.mjs,doorway.mjs,fold.mjs,score.mjs,build.mjs,run.mjs,verify.mjs}`, `tests/relation-studies.test.mjs`, 이 implementation.md 및 `evidence/2026-11-10-code-expression/` 안의 출력·진단 스크립트·로그다. 기존 modules/runtime/scripts 파일은 수정하지 않았다. SKILL.md, references, craft-redesign.md 및 다른 작업자의 파일은 수정하지 않았다. 원본 자산·기존 사용자 미커밋 변경을 보존했다. 커밋·푸시·외부 게시·구매·전역 설치 작업은 하지 않았다.

Terra 문서 확인: [craft-redesign.md](craft-redesign.md)와 현재 SKILL/references의 진입점은 실제 명령과 일치한다. `references/craft-execution.md` 공개 예제 절에 남은 “통합 중/실행 미확인”은 이 작업 후에는 과거 상태다. 소유권 때문에 수정하지 않았다. 부모/문서 담당이 위 실제 evidence를 확인하고 해당 상태 문구만 갱신할 수 있다.

## 관찰: 렌더에서 발견한 약점과 수정

첫 컵 전체 렌더 `c2c60793c87f1e2eaf6fccc68421344b873c6db7f60a4d84b39ac609dff57e23` / job `fe6d9c47-e866-4e85-a2c5-4341c530ee65`를 보존했다. 실제 f240·f320 PNG에서 두 자국의 낮은 농도와 균일한 호를 보았다. 젖은 흔적보다 표시선처럼 읽힐 위험은 **제작자 추론**이다. 농도 .12→.34와 끊긴 호로 수정했고, 같은 f320에서 자국 부분 2,508픽셀이 달라지고 나머지 구도는 유지됨을 확인했다. “슬픔/기억이 더 잘 전달된다”는 관객 검증은 하지 않았다.

종이의 첫 전체 렌더 `7bc926b1fee89b31c4ecb5dd41492c5f218418ddb8f0d1e100f151d579301e17` / job `c4e61a5b-b897-4756-b97a-717165bc260f`에서는 f156의 종이는 닫혀 있는데 그림자가 펼친 폭으로 남았다. 그림자 폭을 현재 힌지 좌표의 투영 폭으로 계산했다. 순수 그림자 수정 비교 revision `e3f770f2de3d147ccb58bff26b62d473b4f6959903de7e72c9e63b3587aee60a` / job `9c60bad0-993f-4860-a880-e2358f205e4e`는 음원을 유지해 비교 가능하다. 해당 f156에서 y352–379 영역 6,168픽셀만 달라졌다. 그 뒤 원본 score의 마지막 두 음이 12초 범위를 넘는 것을 코드·샘플에서 확인하여 길이를 줄이고, 끝에 약 .37초 디지털 무음을 확보한 최종 revision을 다시 렌더했다. 직접 청취로 클릭의 유무를 판정한 것은 아니다.

문은 닫힌 f0에서도 바닥 빛 사각형의 아래 두 꼭짓점이 벌어져 있던 도형을 코드에서 발견해, 문 열림과 함께 폭이 생기도록 첫 공개 변주 렌더 전에 수정했다. 수정 전 문 영상은 존재하지 않으므로 영상 비교가 있다고 주장하지 않는다.

실제 표본은 위 프레임, 최종 첫/끝을 포함한 [시간구조 시트](../../../evidence/2026-11-10-code-expression/time-structure.png), [수정 전후 시트](../../../evidence/2026-11-10-code-expression/revision-comparison.png)를 직접 열람했다. 원속도 영상·음악을 직접 감상한 것은 아니다. 경계 전/해당/후의 PNG들은 검증 폴더에 복사해 준비했고 자동 픽셀 일치를 확인했다. 모든 경계 이미지를 사람이 하나씩 감상했다고 보고하지 않는다.

## 비교 증거와 추론

[컵 수정 전 영상](../../../evidence/2026-11-10-code-expression/cups-before.mp4), [종이 수정 전 영상](../../../evidence/2026-11-10-code-expression/final/fold-r1.mp4), [그림자만 수정한 영상](../../../evidence/2026-11-10-code-expression/fold-shadow-fixed.mp4)을 보존했다. 비교 revision/job은 [comparisons.json](../../../evidence/2026-11-10-code-expression/comparisons.json), 동일 프레임 차이 범위는 [pixel-comparisons.json](../../../evidence/2026-11-10-code-expression/pixel-comparisons.json)에 있다.

대표의 [흔적 제거본](../../../evidence/2026-11-10-code-expression/without-traces.mp4)은 동작·음악을 그대로 두고 placements만 비웠다. [첫 자리 이동 생략본](../../../evidence/2026-11-10-code-expression/without-first-visit.mp4)은 녹색 잔이 이미 가운데에서 시작하고 첫 배치 사건만 없앴다. 마지막 현재 잔 위치는 원안과 같지만 f479의 첫 자국 영역 980픽셀은 달라진다. 따라서 과거 사건의 차이가 같은 현재 위치의 화면에도 남는 것은 관찰된 사실이다. “흔적이 없으면 관객의 기다림과 여운이 약해진다”는 **미검증 가설**이며 독립 검토에서 두 영상을 각기 전체 1배속으로 비교해야 한다. 효과 제거를 다른 두 작품의 의무 기준으로 적용하지 않는다.

## 기술 검증과 제한

최종 검증 결과는 [delivery/verification/report.json](../../../evidence/2026-11-10-code-expression/delivery/verification/report.json), 전체 실행은 [verify-delivery.log](../../../evidence/2026-11-10-code-expression/verify-delivery.log)에 기록된다. 각 결과는 최종 revision/job을 가리킨다. 세 최종 revision 모두 검증을 완료했다. 이전 final/fold-recheck 검증은 제작 이력이며 이 최종 결과를 대체하지 않는다.

검사 범위: 각 작품 전체 480/240/288프레임에 대해 정순·역순·137프레임 보폭 임의 조회 PNG를 전체 render와 대조한다. 사건 point 각각의 전/해당/후 및 첫/마지막 유효 프레임을 보존한다. 각 작품 첫/핵심경계/끝 별도 frame job, 컵 [263,338), 문 [119,181), 종이 [155,203) 구간 render의 모든 PNG를 전체 렌더와 비교한다. 기존 179개 회귀에는 실시간 play/직접 seek/오프라인 frame의 픽셀 일치, 값 교환, 컷/hold, audio trim/gain/배치, freeze/재시도 경로가 포함된다.

48 kHz stereo 원본 PCM과 실제 mixer PCM은 전체 샘플이 일치하고, 첫 비영 샘플은 저작한 첫 음 frame의 샘플 위치(attack 때문에 최대 4샘플 뒤)에서 시작한다. 각 작품은 정확한 프로젝트 길이의 PCM을 가지며 끝 25ms 이상 디지털 무음이다. MP4의 AAC와 구간 AAC는 디코드 후 원본/해당 trim의 상관·RMS 오차를 측정하며 원본 비트 보존으로 부르지 않는다. 별도의 감지하기 어려운 밝기 probe를 억지로 추가하지 않았다.

브라우저 자동재생은 1배속 audio clock으로 끝까지 진행되는지, 실제 제시된 frame 수·wall time·끝 frame을 기록한다. 음소거된 자동재생이며 직접 시청·청취·감정적 리듬 평가가 아니다. 같은 로컬 Chrome/FFmpeg 환경의 기술 검증이며 다른 OS/GPU/코덱 조합의 비트 동일성을 보장하지 않는다. 전문 품질, 독립 검토, 실제 관객 반응과 사용자 예술 수락은 미검증이다.

최종 수치 관찰: 정·역·임의 seek는 총 1,008프레임 각각 세 순서에서 모두 일치했다. AAC/PCM 상관은 컵 0.99999488, 문 0.99999444, 종이 0.99999323이고, 정규화 RMS 오차는 각각 약 0.0000637/0.0000542/0.0000656이었다. 자동재생 wall time은 20.055/10.052/12.053초, 제시된 프레임은 478/239/287개이며 모두 마지막 유효 frame으로 끝났다. 이 숫자는 감상 품질 점수가 아니다. 최종 영상 해시·canonical job·revision·검증 보고서의 상호 일치도 별도로 확인해 [delivery-audit.json](../../../evidence/2026-11-10-code-expression/delivery-audit.json)에 기록했다.

제거 비교의 실제 frozen source도 다시 열어, 흔적 제거본은 480프레임 모든 잔 위치가 같고 첫 이동 생략본은 f264 이후 216프레임 모든 잔 위치가 같으며 두 비교본 모두 원본 score.wav SHA-256이 같음을 확인했다. [ablation-audit.json](../../../evidence/2026-11-10-code-expression/ablation-audit.json)에 최종 현재 위치와 남은 흔적의 차이를 기록했다.

최초 신규 검사에서는 보간 결과 `0.4500000000000002`를 리터럴 `0.45`와 엄격 비교한 assertion이 실패했다. 런타임을 변경하지 않고 수치 목표 비교에 1e-12 허용오차를 적용했다. 실패 로그 `example-tests.log`와 통과 로그 `example-tests-delivery-tail.log`를 모두 보존했다. 최종 신규 검사 2개와 관련 기존 회귀 179개는 통과했다.

## 부모의 독립 검토에 넘길 것

먼저 [중립 검토 입력](../../../evidence/2026-11-10-code-expression/review-brief.md)과 **delivery 세 영상**만 전달하고, 본 구현 해설·제작자 가설은 나중에 읽는 편을 제안한다. 제작자 권한으로 독립 검토 에이전트를 생성하지 않았다. 다음 구간은 원래 속도·소리 포함 검토가 특히 필요하다.

- 대표 전체 0–20초, 특히 7–11초 두 잔의 응답·거리, 11–16초 퇴장/자리 이전, 16–20초 hold와 여운. 제거본 두 편도 각각 전체 1배속으로 비교한다.
- 문 전체 0–10초, 특히 4.5–5.4초 음의 선행·hard cut·후행과 6.5–10초 빈 벽/정지.
- 종이 전체 0–12초, 특히 2–6.5초 두 날개의 순서, 6.5–8초 닫힌 hold, 8–12초 재개방·최종 정지와 음의 끝.

제안: 설명을 듣기 전 무엇이 보이고 들렸는지, 어느 관계가 남았는지, 가장 약한 구간이 어디인지 독립 검토자가 먼저 적는다. 기술 검증은 이 판단을 대신하지 않는다.
