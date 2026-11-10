# 창작과 수정의 실행 경로

새 작품은 관객이 시간 속에서 발견할 관계와 의도에서 시작한다. 기존 결과 수정은 선택한 revision의 실제 출력과 요청된 변화에서 시작한다. 두 경우 모두 아래 경로를 사용한다. 기존 정체성·필수 행동·통과 구간은 유지한다. 이 문서는 전문 작화를 자동 생성하는 엔진이 아니라, 저작 판단을 기존 도구로 실행하는 방법이다.

## 표현 목표에서 제작안 선택까지

새 작업에서는 먼저 누구에게 어디에서 보여 줄지, 무엇을 읽거나 느끼게 할지 기존 의뢰에서 찾는다. 핵심이 비어 있을 때만 질문한다. 창조성·예술성·대중성은 하나의 점수로 합산하지 않는다.

- **창조성:** 이 대상·행동·매체의 관계에서만 나오는 발상을 찾는다. 눈에 띄는 효과를 추가하기보다 시점·생략·사건의 순서·움직임의 성격이 다른 안을 비교한다.
- **예술성:** 선택한 형태·색·여백·질감·포즈·리듬·소리가 어떤 인상과 관계를 만드는지 구체화한다. 정교함의 양보다 작품 전체의 표현과 각 구간의 강약을 판단한다.
- **대중성:** 의도한 관객과 재생 맥락에서 시선이 어디로 가고, 행동·관계가 얼마나 읽히며, 무엇이 기억에 남을지 설계한다. 설명문 없이 실제 크기·길이의 출력으로 살핀다. 이해하기 쉬운 것과 의미를 모두 설명하는 것은 구분하고, 의도한 여백과 모호함은 보존한다. 실제 관객 반응을 얻지 않았다면 인기·몰입·감동을 검증했다고 쓰지 않는다.

품질 기준은 별도로 유지한다. 깨진 형상·접촉·소리·시간 연결처럼 의도를 훼손하는 결함을 표현상의 장점과 평균내어 통과시키지 않는다. 양식화로 선택한 거침·정지·비사실성은 그 의도와 일관성으로 판단한다.

제작 전에는 구조가 다른 안 중 왜 하나를 택하는지 짧게 남기고, 그 차이를 읽을 짧은 화면·소리 출력을 먼저 만든다. 예를 들어 같은 종이 새의 인사도 크게 반복해 퍼덕이기, 작은 펼침 뒤 머리가 늦게 응답하기, 접힌 면의 색이 드러났다 사라지기 중 어떤 관계를 표현할지 다르다. 특정 안이 항상 더 예술적이라는 뜻은 아니다. 대상과 의뢰의 표현 목표에 맞춰 선택한다.

수정할 때는 **실제 출력의 관찰 → 약한 표현 또는 지시와의 차이 → 원인 가설 → 바꿀 수단 → 보존할 조건 → 새 출력 판단**을 연결한다. 사용자가 더 넓은 동작이나 다른 분위기를 요청했다면 결함을 꾸며내지 않고 그 요청을 수정 근거로 삼는다. 위임 범위에서 원화·리그·표현 방식까지 바꿀 수 있다. 원인이 원화나 연출 구조에 있는데 곡선 숫자만 반복 조정하지 않는다. 기능 연구 예제는 이 실행 경로를 검증할 뿐, 사람에게 전달되는 예술적 성취를 대신하지 않는다.

## 단서에서 저작 입력까지

먼저 묻는다. **관객이 시간 속에서 무엇을 발견하는가? 형태·공간·소리는 어떤 관계인가? 무엇을 유지·변화·생략하는가?** 요청의 의도·정체성·필수 행동과 권한을 불변 조건으로 남기고, 사건을 화면과 소리에 배치한다. 관계는 반복과 차이, 동시성, 지연, 거리, 침묵이나 정지 등 작품에 맞는 방식으로 저작한다. 규칙 → 예외 → 흔적은 가능한 한 방식이지 필수 구조가 아니다.

매체·자산·코드와 수작업을 선택하고 짧은 실제 출력을 만든다. 원래 속도와 크기로 보고 수정한 뒤 전체로 전개한다. 필수 행동을 추상화나 생략으로 지우지 않는다. 사람·기계·물성의 사실적 작화는 필요할 때 [대상 이해](direction.md#대상-이해)와 아래 선택 경로를 쓴다. 비사실적 작품도 입자·추상 도형·노이즈·오디오 반응을 기본값으로 삼지 않는다.

시간 관계를 코드로 시험하는 방법: `points`/`spans`는 이름 붙인 시간표이며 그 자체로 실행하지 않는다. 장면이 이를 읽어 사건을 그리거나 소리를 배치해야 한다. 앞 레이어의 `evaluate`가 `t.write`한 값을 뒤 레이어가 `t.read`해 같은 프레임의 관계를 만들 수 있다. 키 보간과 hold는 저자가 정한 값 사이를 평가한다. 형태의 의미 있는 대응점은 저자가 정해야 하며 자동 생성되지 않는다. 이전 사건의 흔적이 필요하면 과거 사건을 현재 프레임까지 결정적으로 다시 평가하거나 기록된 프레임별 데이터를 사용한다. `eventEnvelope`는 가장 최근 사건의 일시적 반응이며 사건의 누적이 아니다. 직접 seek와 역순 조회에서도 같은 결과인지 확인한다. 자세한 계약은 [입력 규약](format.md)이다.

다음으로 표현 수단을 선택한다.

| 필요한 표현 | 기존 도구와 저작할 것 |
| --- | --- |
| 고정 형태의 이동·회전, 명확한 접합 | SVG/Canvas 자체 작화 또는 분리된 원화와 `artwork`; 관절 계층은 `rig2d.prepareRig2D/evaluateRig2D`. pivot·rest·회전 pose는 저작자가 정한다. |
| 연속 제어값·중간 포즈 | `preparePoseTracks`: scalar/vector 키와 출발 키별 linear/hold/smoothstep/bezier. 각도 unwrap·중간 작화는 저작해야 한다. |
| 특정 자세에서만 형상/경로 조정 | `prepareCorrections`: driver·support radius·delta를 저작한다. 반환 delta를 장면 코드가 좌표·형상에 명시적으로 적용한다. 자동 biomechanics가 아니다. |
| 착지·붙잡기·놓기 | `prepareContacts`: 목표와 반열린 시간 창을 저작한다. scene이 목표 적용·parent 전환·release를 구현한다. `constrainTarget`은 도달 범위 제한/잔차이며 관절 solver가 아니다. |
| 의도한 정지·교체, 다른 관점의 원화 | `exposure`, `compileCuts`, 명시적 hold. 새 시점·실루엣·표정은 새 원화/벡터 또는 별도 승인된 작화 도구가 필요하다. |
| 인물의 hold와 독립적인 환경 사건 | 원화를 평면으로 합치기 전에 움직일 빛·배경 영역과 시간, 필요한 자산·가림을 정한다. 별도 layer·mask·blend 또는 scene의 시간별 Canvas/SVG drawing을 사용한다. [고정 카메라·반사광 적용](stillcuts.md#고정-구도와-독립적인-환경-시간)을 참고한다. |
| 부드러운 피부·천의 복잡한 변형 | 해당 mesh/skin·변형 모델 또는 중간 원화를 제작한다. pose 보간만으로 topology·볼륨·주름을 복원하지 않는다. |

`prepare/evaluate/draw`와 입력 구조는 [format.md](format.md), 트랙 API와 materialization은 [pose-tracks.md](pose-tracks.md)를 읽는다. 자산이 없으면 그 사실을 남기고 범위 안의 original vector나 필요한 작화를 만든다. 아래 크레인의 사각형을 인물 원화의 대용품으로 제시하지 않는다.

환경 사건은 인물의 속뜻을 보조하는 secondary action이나 주 동작에 따른 수동적인 follow-through와 구분한다. 선택한 공간·사건에 필요한 움직임만 저작한다. 바람·입자·창문 깜빡임·상시 움직임을 공통 기본값으로 넣지 않는다.

포즈·접촉이 필요한 행동에서는 **시작·전환·접촉·해제·끝** 중 해당하는 포즈를 먼저 만든다. 형상과 실루엣을 정지 화면에서 읽은 뒤 키 사이의 breakdown을 만든다. 장애물 위를 지나야 한다면 위로 든 중간 pose 또는 그 구간의 경로 보정을 저작한다. 그다음 사건의 프레임과 hold를 배분한다. 정지 포즈가 틀리면 easing을 먼저 바꾸지 않는다. 모든 채널을 늘 같은 interpolation으로 묶을 필요도 없다.

## 공개 관계 연구: 대표와 두 변주

새 자작 예제는 대표 정물극과 두 변주를 각각 코드·자작 소리로 저작한다. 제작자의 최종 실행 결과는 [구현 기록](../docs/implementation/2026-11-10-code-expression/implementation.md)과 [영상·검증 인수인계](../docs/implementation/2026-11-10-code-expression/README.md)에 있다. 저장소 루트에서 아래처럼 새 출력 경로를 지정한다.

```sh
node examples/relation-studies/run.mjs ./relation-study
```

`./relation-study`는 아직 존재하지 않는 출력 경로의 예다.

대표 1안과 변주 2안의 **서로 다른 저작 선택**을 각각 소스와 영상에 연결해 살핀다. 색상 차이만이 아니라 사건 순서·거리·유지·소리 등 실제로 달라진 선택을 확인한다. 원속도 전체 비교에서 읽힌 관계와 약한 구간을 기록하고, 한 선택을 수정한 새 source·revision·영상과 이전 결과를 비교한다. 이 예제에는 수정 전후 영상과 흔적 제거 비교가 있다. 기술 검증과 표현 판단은 분리하며, 원속도 시청·청취와 예술 수락은 별도로 확인한다.

## 공개 실행 예제: 크레인 운반 기능 연구

저장소 루트에서 실행한다. Node/Chrome/FFmpeg 준비는 [tools.md](tools.md)를 따른다. 외부 곡·원화·비공개 production은 필요하지 않다. 화면은 자작 벡터 기능 연구이며 전문 미술 완성도의 증거가 아니다. `run.mjs`는 기존 builder/materialize/freeze/render를 연결한 예제 recipe다. 출력 경로는 새 경로여야 한다.

```sh
node examples/crane-clearance/run.mjs ./crane-study
```

이 명령은 `first-pass/`, `clearance/` 두 프로젝트와 `store/`를 만든다. `comparison.json`은 각 canonical job, revision, 영상·source SHA-256 및 frozen source에서 평가한 행을 연결한다. 처음에는 두 끝 포즈의 직선 경로가 장애물을 통과한다. 수정본은 다른 데이터를 그대로 두고 `corrections`의 수직 경로 보정만 적용한다. 이는 빠진 중간 경로를 보충하는 시연이며 미술 점수 비교가 아니다. 각 job의 `frames/0000000.png`부터 전체 프레임이 남는다.

처음부터 이 운반 경로를 제작할 때는 수정된 저작 입력으로 바로 시작할 수 있다. 실패 초안의 생성이나 이전 store는 필요하지 않다.

```sh
node examples/crane-clearance/build.mjs examples/crane-clearance/clearance.json ./new-transfer
node scripts/direction.mjs freeze ./new-transfer --store ./new-transfer-store
```

새 주제나 다른 수치를 저작하려면 example config를 원하는 이름의 JSON으로 복사하고 수정한다. 예제의 강체 화물 운반을 유지하는 경우 다음 입력을 바꿀 수 있다. 다른 대상은 `scene.mjs`의 drawing/evaluator도 저작한다. 임의 JSON이 자동으로 새 대상을 만들지는 않는다.

| 입력 | 단위·의미와 함께 바꿀 값 |
| --- | --- |
| `size`, `fps`, `frames` | 캔버스 px, 정수 fps와 끝 제외 프레임 수. 크기 변경 시 geometry도 같은 좌표계로 저작한다. |
| `geometry` | boom/floor 높이, cable 최대 길이, sling 길이, 화물 폭·높이, obstacle 및 platform 사각형. 충돌 검사는 이 화물/장애물의 axis-aligned 사각형에 한정한다. |
| `tracks.hook` | `{frame,value:[x,y],interpolation}`. 좌상단 원점, 아래쪽 양수. 시작·출발·도착·release·끝 키. |
| `timing` | departure/arrival/release 표식. 키와 contact 창도 같이 저작한다. 자동 retime하지 않는다. |
| `corrections` | `{center,radius,delta:{hook:[dx,dy]}}`. driver는 이 예제에서 **보정 전 hook x**다. 이 예제의 adapter는 빈 배열을 무보정으로 분기한다. `prepareCorrections([])`를 직접 호출하면 오류이므로 다른 장면도 이 분기가 필요하다. radius 바깥에서는 delta가 0이다. |
| `contacts` | parcel 중심의 목표 좌표와 `[from,to)` 창. 화물은 target에 고정되고 hook은 release 뒤 올라간다. landing에서 parcel bottom과 platform top이 일치하도록 목표를 저작한다. |

예제 runner는 배포된 두 config의 시연이다. 사용자가 수정한 config는 아래 일반 경로로 렌더한다. `build.mjs`는 새 디렉터리만 생성하며 기존 프로젝트를 덮어쓰지 않는다. 생성 뒤에는 프로젝트 안의 `source.json`, `scene.mjs`, `work.json`을 직접 저작하고 새로 freeze한다. `work.json`에 구워진 시간/크기는 source와 함께 갱신한다.

```sh
node examples/crane-clearance/build.mjs ./my-transfer.json ./my-transfer
node scripts/direction.mjs freeze ./my-transfer --store ./transfer-store
# freeze 출력의 revision을 아래 REVISION 자리에 사용한다.
node scripts/direction.mjs frame REVISION 30 --store ./transfer-store
node scripts/direction.mjs render REVISION --store ./transfer-store
# JOB_A/B는 같은 store에 있는 render 출력의 job ID다.
node scripts/direction.mjs review JOB_A JOB_B --store ./transfer-store
```

## 실제 출력에서 원인을 선택하고 고치기

짧은 출력과 전체 렌더를 원래 속도로 보고, 필요한 사건 경계의 전·해당·후와 중간 상태를 확인한다. 아래 크레인 예제는 무음이다. `observe` 음량 통과를 얻으려고 소리를 추가하지 않는다. PNG만 확인했다면 동작 재생 확인과 구분한다. 변경 전 revision/job과 관찰한 프레임·화면 크기, 지켜야 할 행동, 원인과 한 가지 수정 가설을 남긴다.

| 관찰과 조건 | 원인 확인 → 수정 → 검사 |
| --- | --- |
| 양 끝은 맞지만 화물이 중간 장애물을 관통 | 궤적 geometry 확인 → 위로 든 breakdown 또는 예제의 hook-y pose correction → 운반 전체 collision과 도착 pose 확인. 속도 변경은 같은 공간 관통을 해결하지 않는다. |
| 목표 수치는 맞지만 손과 물체 사이에 틈 | drawing anchor·좌표계·transform과 contact 적용 확인 → 잘못된 anchor/parent를 수정. target 선언만으로 solver를 추가했다고 쓰지 않는다. |
| 실루엣이 몸에 겹쳐 팔 동작이 안 읽힘 | 고정 frame에서 구도·near/far 순서 확인 → 허용된 팔 pose·시점·layer 순서 수정. 원화에 팔 구분이 없으면 분리/재작화한다. |
| 끝 포즈는 좋지만 중간 천/얼굴이 찌그러짐 | 대응점·mesh topology·skin weights·형상 보정 확인 → 해당 pose-space delta 또는 새 breakdown 원화. blur/easing으로 숨기지 않는다. |
| 형태는 맞고 행동이 너무 빨리 지나감 | 원래 속도로 사건의 가독 시간 확인 → 키 시각/hold/exposure 수정. 전체를 다시 보되 정체성/접촉은 유지한다. |
| 수정한 source가 frozen frame에 반영되지 않음 | 선택 revision/job·import·해시 확인 → 새 freeze 및 새 job. 이전 job에 새 source의 측정값을 붙이지 않는다. |
| source 원화 자체가 다른 대상으로 읽힘 | pose 수치가 아니라 art-source/디자인 문제 → 필요한 재작화 범위를 밝히고 승인된 정체성을 보존해 저작. 숫자 보정으로 해결했다고 주장하지 않는다. |

같은 시간 구조는 같은 frame으로 비교한다. timing을 바꾸면 사건 표식을 맞추고 각각 처음부터 재생한다. 기존 `review`는 job ID로 영상을 연결한다. `comparison.json`의 절대 경로는 로컬 편의 정보다. store를 이동하면 revision/job ID와 상대 구조로 다시 찾고 `openRevision`으로 해시를 검증한다. 영상·PNG·source를 공유할 때 store의 해당 revision/job을 함께 보존한다.

의도에 맞는 질문을 골라 표현을 검토한다. 설명 없이 관계가 읽히는가, 시간 배치가 기대·긴장·여운을 만드는가, 음악과 화면의 선택은 필요한 만큼 절제되어 있는가, 앞 사건이 뒤에 영향을 주는가, 효과를 제거하면 선택이 더 선명해지는가, 전체를 본 뒤 앞부분의 의미가 달라지는가. 이들은 선택적 질문이며 자동 점수나 체크리스트 통과가 예술 수락은 아니다. 작품이 모호함·직접성·과잉·정지 중 무엇을 의도했는지에 따라 판단한다.

변경은 새 revision/job으로 렌더하고 동일 불변 조건을 확인한다. 예제에서는 화물 크기·양 끝 pose·착지 접촉·해제 후 정지, cable 도달 가능성과 임의 seek 일관성을 검사한다. 통과한 조건을 유지하고 선택한 표현 목표와 요청된 수정이 실제 출력에서 충족되면 멈춘다. 기능만 통과했는데 표현이 약하면 위 판단으로 해당 원화·구도·동작·시간을 수정한다. 유효한 결과에 변화 자체를 목적으로 수정을 반복하지 않는다. unresolved art-source나 실제 시청·청취·사용자 수락의 부재는 기술 통과와 별도로 남긴다.
