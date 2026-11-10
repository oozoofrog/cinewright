# 영화·애니메이션·미술 종합 검토

2026-11-08. 대상: 미학 툴킷의 장면 데모 6개(S01–S06), 후속 재질·rig·retarget 연구 6개(P01–P06), FX·혼합 예제 3개(F01–F03).

## 판정

세 미학의 차이와 재사용할 기능은 화면에서 확인된다. 실루엣의 명도층·외곽, 선화의 여백·선 굵기, NPR 공간의 깊이·긴 그림자는 유지할 기반이다. 그러나 **현재 대표 장면을 영화·애니메이션의 완성도 기준으로 채택하기에는 행동·재질·주목성의 보완이 필요하다.** 기술적 회귀 통과를 예술적 수락으로 바꿔 기록하지 않는다.

다음 제작에서는 **의미가 읽히는 포즈와 소품 관계, 재질별 표현 규칙, 그 규칙을 재사용할 샷 저작**을 연결해야 한다. 공용 도구에서 명확히 확인된 우선 과제는 수채의 셀 확대 출력이다. 다른 주요 지적은 기존 자산·포즈·recipe에서 먼저 해결할 수 있다.

FX 분리판과 골격 비교판은 기능 연구로서 유효하다. 모든 연구 예제에 서사·인물 연기를 요구하지 않는다. 정물, 단순화, 여백, 의도된 hold도 유지할 수 있다.

## 근거와 한계

검토는 타임스탬프가 있는 추출 프레임, 전편의 12fps 표본 시트, 선택 구간의 누락 없는 24fps 연속 프레임에 기반한다. **원속도 연속 재생을 감상한 평가는 아니다.** 실제 재생에서의 감정·리듬·음악과의 관계, 인간의 미학·접근성 수락은 남아 있다. 24fps 연속 프레임은 시간 순서의 관찰 근거이며 실시간 감상을 뜻하지 않는다.

세 검토자는 다른 보고서를 읽지 않고 먼저 시각 관찰을 기록한 뒤 관련 구현 일부를 확인했다. 종합 작성자는 핵심 프레임과 선택된 소스를 대조했다. 검토자의 실제 관찰 범위와 미확인 사항은 각 보고서에 있다.

| 담당 | 실행 설정 | 상세 보고서 |
|---|---|---|
| 연출·촬영·편집 | CO / gpt-6-astra / ultra | [촬영·연출](/Volumes/eyedisk/develop/cinewright/docs/reviews/2026-11-08-cinematic-animation-review/cinematography.md) |
| 연기·타이밍·접지 | CE / gpt-6.1-terra / ultra | [애니메이션](/Volumes/eyedisk/develop/cinewright/docs/reviews/2026-11-08-cinematic-animation-review/animation.md) |
| 미술·재질·스타일 도구 | CO / gpt-6.1-sol / ultra | [미술](/Volumes/eyedisk/develop/cinewright/docs/reviews/2026-11-08-cinematic-animation-review/art-direction.md) |

원본 경로·해상도·frame 수·SHA는 [검토 manifest](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/manifest.json)에 있다. 시간은 0-based source frame / 24다. 보고서 작성 후 **원본 MP4 15개 전부가 최초 SHA와 일치**함을 확인했다([보존 확인](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/integrity-after-review.json)). 이는 매체 보존 검사이며 시각 품질 통과를 뜻하지 않는다. 구현·기존 자산·기존 영상은 수정하지 않았고, 이번 검토를 위해 회귀 테스트를 재실행하지 않았다.

## 다음 수정의 우선순위

우선 1은 다음 시각 검토 전에 해결할 항목, 우선 2는 작품용 대표 샷을 완성하기 전에 해결할 항목이다. 서로 다른 산출물의 우선 1을 단일 점수나 고정된 작업 순서로 합산하지 않는다.

| 우선 | 대상·관찰 근거 | 해결 위치와 제안 | 재검토 기준 |
|---|---|---|---|
| 1 | **S04 편지 행동** — 약 4.67–6.50초. 종이는 펼쳐지지만 손의 쥐기와 머리·시선이 행동을 충분히 설명하지 못한다. [연속 프레임](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/native24-f120-131.jpg), [6.50초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/f156.jpg) | **자산·포즈·recipe.** 잡음/펼침 손 외곽, 종이 피벗, 턱·목 방향을 연결한다. 감속과 정지의 체중 전달도 함께 저작한다. | 잡음→펼침→읽기 세 포즈에서 어느 손이 어디를 잡는지, 종이가 어떤 축으로 열리는지 읽힌다. 작은 화면에서도 손·편지·얼굴의 관계가 유지된다. |
| 1 | **S05 인물 등장·주목성** — f87→88, 3.625→3.667초에 전신이 나타난다. 후반에는 기둥·그림자·해칭에 인물이 묻힌다. [등장 경계](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-native24-f84-95.jpg), [7.25초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S05/f174.jpg) | **recipe·배치·가림.** 걸어나오는 의도라면 문틀 뒤 이동과 순차 노출을 저작한다. 앞선 그림자와 뒤의 열차 접근은 유지한다. 인물 뒤에 깨끗한 명도면과 가방의 여백을 둔다. | native24에서 등장 경로가 이어지고, f104/f156/f174를 25%·흑백으로 보아도 인물·가방이 배경에서 분리된다. 초현실적 순간 출현을 택한다면 그 의도를 별도로 명시한다. |
| 1 | **P01/P02 수채 출력** — 6초 원해상도에서 약 40px 사각 셀이 먼저 읽힌다. [단일 안료](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P01/f144.jpg), [두 안료](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P02/f144.jpg) | **공용 출력 도구.** 선택 bake의 48×27 셀을 1080p에 직접 확대하는 경로를 개선한다. 재구성·해상도를 먼저 다루고 얇은 색층·침전·경계의 제어를 평가한다. | 같은 사건의 f24/f72/f144를 100%·50%로 비교해 격자가 먼저 보이지 않는다. 단순히 흐린 원이 되지 않고 내부·가장자리 차이가 읽히며 연속 프레임에서 경계가 튀지 않는다. |
| 1 | **S05/S06 NPR 재질·초점** — 벽·바닥·잎·화분의 비슷한 교차선과 창살 그림자가 경쟁한다. [S06 5초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S06/f120.jpg) | **recipe·조명·UV 자산 우선.** 배경과 밝은 면의 선 밀도를 낮추고 잎맥·나무결 등 형태의 축을 저작한다. 기존 strength/frequency/tones 이후에도 남는 방향·국소 제어만 도구 보완 후보로 삼는다. | 같은 구도에서 잎·병·탁자·배경의 우선순위가 읽히고, 최소 세 재질이 선 밀도·방향·형태로 구별된다. 해칭이 표면에서 미끄러지는지는 해당 native24 구간으로 확인한다. |
| 1 | **S01 길찾기·S02 도착** — 숲의 두 동물은 진행/선택 포즈가 비슷하다. 항구 후반에는 선체·바위·파도가 합쳐진다. [S01 5.25초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S01/f126.jpg), [S02 7.42초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S02/f178.jpg) | **포즈·자산·recipe.** 선행 동물의 멈춤·살핌과 후행 반응을 구별한다. 등대 빛의 변화와 배의 대응을 연결하고 선체 주변에 수면 틈 또는 명확한 정박 자세를 남긴다. | 진행→살핌→방향 선택이 다른 외곽으로 읽힌다. 항구 종결에서도 항로·선체가 구별되고 빛이 배의 행동과 연결된다. |
| 2 | **S03/S04 워시 형태** — 잎 뒤 오각형, 코트 뒤 사각 색면의 형태 관계가 약하다. [S03 5초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S03/f120.jpg), [S04 6.50초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/f156.jpg) | **색면 자산·미학 규칙 우선.** 어디서 선을 넘고 어디에 종이를 남길지 정한다. 움직이는 코트의 워시가 포즈를 따라야 한다면 변형/부착 경로가 공용 도구 후보가 된다. | 선화를 꺼도 잎 덩어리와 코트 방향이 읽힌다. 동작에서 색면이 형태를 따르거나 일관된 어긋남 규칙을 지킨다. 여백을 채우는 것으로 해결하지 않는다. |
| 2 | **P03 rig의 미술·변형 검증** — 2.25–2.88초 어깨 안쪽의 어두운 삼각형과 블록형 손·발. [연속 프레임](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/animation/P03-f054-069.jpg) | **진단 패스·캐릭터 자산.** 무음영/outline-off/다른 각도로 그림자·겹침·skin 변형을 분리한다. 지원 체형 안에서 손·발·어깨가 설계된 캐릭터 하나로 확인한다. | 극단 두 포즈와 연속 구간에서 의도하지 않은 쐐기·부피 급변이 없다. voxel fixture의 동작 성공과 작품 캐릭터의 품질을 구분해 기록한다. |

S04와 S01의 행동 전달은 세 검토가 함께 지적했다. S05는 연출 검토의 등장 경계와 미술 검토의 인물/배경 분리가 연결된다. 수채 셀은 미술 검토가 추가로 발견한 출력 문제다. 검토마다 우선순위가 다른 것은 담당 산출물의 차이이며, 다수결 평균 점수로 결론내리지 않았다.

## 잘못 확정하지 않을 사항

- **실제 발 미끄러짐과 무게의 가독성은 다르다.** S04에는 발 위치 유지 저작과 이를 검사하는 기존 회귀가 있다. 표본의 약한 체중 전달만으로 접지 solver 실패를 확정하지 않는다. P05는 고정 측면/3/4 구도와 지면 기준을 추가해야 접지·stride를 판단하기 좋다.
- **P03의 어두운 틈 원인은 미확정이다.** 조명·자기 가림·outline·표면·skin을 분리하기 전에 자동 rig 알고리즘 결함으로 분류하지 않는다.
- **P06의 이름이 동작 목표를 대신하지 않는다.** `salute`가 어떤 인사인지 먼저 정하고 체형별 손 목표·정착 포즈를 확인한다. 군대식 이마 접촉을 임의의 필수 조건으로 만들지 않는다.
- S02 천체/등대 접선, 디오라마 절단면, 더 거친 종이, 채도·카메라 운동량은 선택 사항이다. 선체 합침·주목성 같은 가독성 문제와 구별한다.
- S03은 정물로 유지할 수 있다. 비와 남은 물의 인과를 의도한다면 같은 위치의 마지막 빗방울–잔물결을 연결하는 정도부터 검토한다. S06도 인물 서사를 추가할 필요 없이 주된 관찰 대상을 정한 정물 샷으로 개선할 수 있다.

## 다음 제작 단계 제안

1. **세 미학 각각의 기준 정지화면과 핵심 포즈를 먼저 저작한다.** 실루엣의 음각 공간, 선·워시의 경계 규칙, NPR의 재질별 획과 명암 배분을 짧은 미술 지침에 고정한다. 캐릭터·소품의 외곽과 행동의 접점도 이 단계에서 결정한다.
2. **기존 도구로 미학별 대표 숏 하나씩 다듬는다.** S01 또는 S02, S04, S05를 우선 후보로 삼고 관객이 무엇을 언제 알아야 하는지 shot beat로 저작한다. S06은 별도의 정물·재질 기준으로 유지할 수 있다. 컷 수나 FX 종류 증가는 수락 기준이 아니다.
3. **수채 출력은 별도 재질 과제로 보완한다.** 동일 안료 사건으로 전후를 비교한다. 워시 부착·재질별 해칭은 기존 저작으로 남는 구체적 한계가 확인된 범위만 확장한다.
4. **승인된 저작 규칙을 skill/reference와 recipe에 함께 남긴다.** skill에는 무엇을 왜 선택하는지, 자산·포즈·샷에는 실제 실행 사례를 둔다. 반복되는 표현 연산만 공용 JS 도구로 올린다. 현재 검토에서는 이 구현이나 skill 수정을 시작하지 않았다.
5. **같은 구도의 정지·연속 프레임 비교 뒤 원속도 감상을 한다.** 핵심 손 접촉·등장·변형 구간은 native24로 확인하고, 전체 영상은 사람이 원속도로 보며 리듬·정서·접근성을 별도로 수락한다. 원속도 감상 결과 없이 영화적 최종 승인을 기록하지 않는다.

## 추적 자료

- [종합 작성자의 관찰·원인 대조](/Volumes/eyedisk/develop/cinewright/docs/reviews/2026-11-08-cinematic-animation-review/integration-notes.md)
- [증거 안내와 전체 영상 식별](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/README.md)

실제 위임 실행:

- <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3A19481da4-cef1-4261-a8eb-a39d90bc72b9%3Adelegate-task%3Ad6a59594-839e-45b8-b12c-24f263787b56>
- <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3A19481da4-cef1-4261-a8eb-a39d90bc72b9%3Adelegate-task%3A97d8c24a-68a0-424e-9f3a-a5ee8065063a>
- <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3A19481da4-cef1-4261-a8eb-a39d90bc72b9%3Adelegate-task%3A5ec79f42-0d34-4a80-94a8-8737000d6b42>
