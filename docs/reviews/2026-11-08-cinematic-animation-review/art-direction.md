# 미술·스타일·재질 검토 — 2026-11-08

담당: 미술 및 제작에 재사용할 미학 도구의 적합성. 구현, 리팩토링, 새 효과 제작, 테스트 실행·확장은 하지 않았다. 원본 영상·기존 evidence·코드·자산은 수정하지 않았다.

**판정:** 세 계열은 화면에서 구별된다. 실루엣의 큰 명도층, 선·워시의 종이색 여백, 3D의 사선 공간·긴 그림자는 유지할 기반이다. 그러나 현재 장면을 곧바로 작품용 미술의 기준 샷으로 삼기는 어렵다. 가장 먼저 해결할 것은 **수채의 셀 노출, NPR의 재질별 선 밀도, 캐릭터와 행동의 실루엣**이다. 기능의 종류를 더 늘리는 것보다 기존 도구의 출력 표현과 아티스트 자산·style grammar·샷 저작을 연결하는 작업이 우선이다.

## 1. 관찰 방법과 실제 범위

이 평가는 **타임스탬프가 있는 추출 프레임/연속 프레임 분석**이다. MP4를 원속도로 연속 감상하는 도구는 사용하지 않았다. FFmpeg 디코딩은 추출 수단이며 모델의 연속 감상이나 인간의 관람을 뜻하지 않는다. 원속도에서 느끼는 정서, 기다림의 체감 길이, 박자와 잔상은 확정하지 않는다. 소리·음악·음질, 사람의 수락, 접근성 인증도 평가하지 않았다.

아래 이미지들을 실제 `view_image`로 열었다. 파일 목록만 확인한 것을 관찰로 세지 않았다. 최초 시각 관찰을 [독립 관찰 메모](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/independent-observations.md)에 먼저 고정한 뒤 공개 모듈·recipe·자산 생성 코드 일부를 읽었다. 다른 reviewer의 보고서는 열지 않았으며 구현자의 성공 설명·점수·테스트 통과는 판정 근거에서 제외했다.

### 제공된 시트

각 overview는 영상 전반의 16개 표본이다. 상세 sequence는 24fps 원본의 **매 2 source frame**으로, 12fps 표본이다. 모든 상세 sequence의 f000–190, 즉 0.000–7.917초 표본을 열어 전후 상태를 비교했다. 시트의 작은 칸만으로 선끝·재질을 판단하지 않고 아래 원해상도 추출로 보완했다.

| clip / 원본 길이 | 실제 연 overview | 실제 연 상세 sequence |
|---|---|---|
| S01 숲 / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S01/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S01/sequence-12fps.jpg) |
| S02 항구 / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S02/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S02/sequence-12fps.jpg) |
| S03 비·정물 / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S03/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S03/sequence-12fps.jpg) |
| S04 통근자 / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S04/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S04/sequence-12fps.jpg) |
| S05 역 / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S05/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S05/sequence-12fps.jpg) |
| S06 연구실 / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S06/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S06/sequence-12fps.jpg) |
| P01 wet / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P01/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P01/sequence-12fps.jpg) |
| P02 overlap / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P02/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P02/sequence-12fps.jpg) |
| P03 tall / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P03/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P03/sequence-12fps.jpg) |
| P04 broad / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P04/overview.jpg) | 열지 않음 — 동작 세부 판정 제외 |
| P05 stride / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P05/overview.jpg) | [f000–190, 매2frame](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P05/sequence-12fps.jpg) |
| P06 salute / 9초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P06/overview.jpg) | 열지 않음 — 미세 cadence 판정 제외 |
| F01 2D FX / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/F01/overview.jpg) | 열지 않음 |
| F02 3D FX / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/F02/overview.jpg) | 열지 않음 |
| F03 mixed / 8초 | [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/F03/overview.jpg) | 열지 않음 |

원본 MP4 절대 경로, duration/fps/frames/hash의 식별 근거는 제공된 [manifest](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/manifest.json)다. 메타데이터와 해시를 별도로 재검증한 것은 아니다. P06은 216 frames, 나머지는 192 frames이며 모두 24fps/1920×1080으로 제공되었다.

### 원본에서 추가 추출하여 실제 연 이미지

frame 번호는 **0-based**, 초는 `frame/24`다. 다음 정지 프레임은 1920×1080 JPEG로 열었다. native24 띠는 연속 12장을 칸당 400×225로 배열했고, 빠진 홀수 프레임도 포함한다. 추출한 94개 JPEG 전부를 개별 원해상도로 열었다는 뜻은 아니다. 아래 정지화면 및 6개 띠가 실제 관찰 범위다.

| clip | 별도로 연 원해상도 정지화면 | 추가로 연 native24 구간 |
|---|---|---|
| S01 | [f126 / 5.250초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S01/f126.jpg) | [f048–059 / 2.000–2.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S01/native24-f048-059.jpg) |
| S02 | [f060 / 2.500초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S02/f060.jpg), [f178 / 7.417초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S02/f178.jpg) | 없음 |
| S03 | [f024 / 1.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S03/f024.jpg), [f120 / 5.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S03/f120.jpg) | 없음 |
| S04 | [f044 / 1.833초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/f044.jpg), [f156 / 6.500초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/f156.jpg) | [f120–131 / 5.000–5.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/native24-f120-131.jpg) |
| S05 | [f024 / 1.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S05/f024.jpg), [f174 / 7.250초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S05/f174.jpg) | 없음 |
| S06 | [f120 / 5.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S06/f120.jpg) | [f048–059 / 2.000–2.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S06/native24-f048-059.jpg) |
| P01 | [f144 / 6.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P01/f144.jpg) | [f024–035 / 1.000–1.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P01/native24-f024-035.jpg) |
| P02 | [f144 / 6.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P02/f144.jpg) | 없음 |
| P03 | [f024 / 1.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P03/f024.jpg), [f064 / 2.667초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P03/f064.jpg) | [f048–059 / 2.000–2.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P03/native24-f048-059.jpg) |
| P05 | [f018 / 0.750초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P05/f018.jpg), [f036 / 1.500초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P05/f036.jpg) | [f024–035 / 1.000–1.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P05/native24-f024-035.jpg) |
| F01 / F02 / F03 | 각 f126 / 5.250초: [F01](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/F01/f126.jpg), [F02](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/F02/f126.jpg), [F03](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/F03/f126.jpg) | 없음 |

추출 명령과 source frame 목록은 [extraction-manifest.json](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/extraction-manifest.json)에 있다. native24를 확인한 구간 밖의 on-ones 미세동작이나 전편의 선 떨림 안정성은 미확인이다.

## 2. 세 미학의 차이와 유지할 장점

| 계열 | 실제 읽히는 형태·색·공간의 문법 | 유지할 근거 | 현재 용도 판정 |
|---|---|---|---|
| 실루엣 다중평면 — S01/S02 | 남색 덩어리, 회녹색 거리층, 노란 하늘/천체. 내부 묘사보다 외곽과 구멍, 전경의 잎 반복으로 공간을 만든다. | S01 f126에서 귀·꼬리·주둥이만으로 두 종이 구별된다. 양옆 식물의 조밀함과 가운데 열린 하늘이 대조된다. S02 f060의 돛·등대·별도 같은 도형 어휘다. | **미학 기반과 기능 시연으로 유효 / 연출 샘플로 보완 필요.** 움직이는 그림책·컷아웃에 쓸 가능성이 가장 명료하다. |
| 선·워시 — S03/S04, 재질 연구 P01/P02 | 크림색 종이, 회녹색 선, 매우 옅은 색면. 외곽선과 가는 내부선의 차이, 그리지 않은 면적이 중심이다. | S04 f156에서 코트 외곽과 얇은 옷주름·편지선은 구분된다. S03의 넓은 여백은 비가 사라진 뒤 작은 정물에 집중할 기반이다. | **선화·드로잉 기능 시연으로 유효.** 현재 워시/수채를 물감 재질 기준 샷으로 쓰기는 어렵다. |
| 표현주의 3D/NPR — S05/S06, F02/F03 | 청록 어둠/황토 하이라이트, 사선 원근·기둥·창틀, 큰 투사 그림자와 교차선. 입체와 인쇄 표면을 결합한다. | S05 f024의 레일·플랫폼 선은 깊이와 이동 방향을 만든다. S06 f120의 큰 잎 군집과 따뜻한 탁자가 초점 덩어리를 이룬다. F02 구의 명암 띠와 잎의 굽힘도 구별된다. | **공간·빛·NPR 기능 시연으로 유효 / 재질과 장소 저작 보완 필요.** 현재는 인쇄 무늬를 입힌 모형 무대의 인상이 강하다. |

의도된 hold, 정적 구도, 단순화, 여백 자체는 결함으로 보지 않는다. 아래 지적은 그 선택 안에서 **주요 형태와 사건이 읽히는가**에 관한 것이다. 특정 영화나 작가의 스타일을 재현했다는 전제도 두지 않는다.

## 3. 실루엣 다중평면 — 우선 보완 3가지

해결 위치: **(a)** 저작 자산, **(b)** pose/spacing/cadence, **(c)** 샷·배치·편집 recipe, **(d)** 실제 공용 툴의 표현 한계. 우선순위 1은 다음 미술 검토 전에 해결할 항목, 2는 작품용 대표 샷 전에 해결할 항목이다.

### A1. 동물의 종류는 읽히지만, 길찾기의 선택이 화면에 없다 — 우선 1, (b)+(c)

**증거:** S01 [f048–059 / 2.000–2.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S01/native24-f048-059.jpg), [f126 / 5.250초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S01/f126.jpg), 전체 12fps 시트.

**관찰:** 두 동물은 오른쪽을 향해 유사한 간격으로 놓인다. 전경의 상대 위치와 꼬리는 달라지지만, 이 native 구간에서는 발·몸통의 변화보다 그것들이 먼저 읽힌다. 후반 표본에서도 둘의 방향과 관계가 크게 달라지지 않는다.

**해석:** '두 동물이 숲에 있다'는 명료하다. '길을 찾는다'는 선택·탐색의 사건은 약하다. hold의 길이보다 **구별되는 의미 포즈가 없는 것**이 문제다.

**제안:** 한 동물이 멈춰 귀/머리를 돌리고 다른 동물이 뒤늦게 따라보는 두 상태를 저작한다. 기존 프레임 안에 출구나 가지 사이의 통로를 두고, 발 접지와 몸통 이동을 그 상태에 연결한다. 전경 이동량 증가나 FX 추가는 우선 해결책이 아니다.

**Visual acceptance:** 같은 8초의 f024/f072/f126을 제목 없이 놓았을 때 '진행–살핌–방향 선택'이 서로 다른 실루엣으로 읽혀야 한다. 선택 전후에도 귀·주둥이·동물 사이 음각 공간이 식물에 묻히지 않아야 한다. 변경 구간의 native24에서 접지한 발과 몸통의 관계도 확인한다.

### A2. 컷아웃 캐릭터의 관절 덩어리가 개성보다 먼저 보인다 — 우선 2, (a)+(b)

**증거:** S01 [f126 / 5.250초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S01/f126.jpg).

**관찰:** 귀·큰 꼬리는 종을 명확히 만든다. 반면 몸통 밑 두꺼운 다리와 길게 꺾인 발끝은 두 동물 모두 신발 같은 덩어리이고, 몸통/허벅지 경계는 둥근 부품의 접합처럼 보인다.

**해석:** 분절 인형 미학으로 사용할 수 있지만, 여우와 토끼의 몸 사용 차이까지 설득하는 영화 캐릭터 자산은 아직 아니다. 세부 털이나 눈을 추가할 필요보다 **관절이 움직일 때 유지될 외곽 설계**가 부족하다.

**제안:** 같은 색과 단순화를 유지하면서 여우의 지면 가까운 발/뒤꿈치와 토끼의 접힌 뒷다리 덩어리를 다르게 디자인한다. 몸통과 관절의 겹침 마스크·피벗은 그 외곽에 맞춘다.

**Visual acceptance:** 정지/진행/고개 돌림 세 포즈를 25% 크기와 단색으로 비교해 종의 차이, 앞뒤 다리의 구분, 접힌 관절이 유지되어야 한다. 극단 포즈에서 부품 사이 틈이나 뜻하지 않은 직각 발 덩어리가 새로 드러나지 않아야 한다.

### A3. 항구의 실루엣 합침이 도착의 의미를 흐린다 — 우선 1, (c), 필요 시 (a)

**증거:** S02 [f060 / 2.500초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S02/f060.jpg) → [f178 / 7.417초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S02/f178.jpg), 전체 12fps 시트.

**관찰:** 돛배가 오른쪽으로 접근하고 빛의 부채꼴 방향이 달라진다. 후반 선체 오른쪽과 등대섬의 바위, 물결이 같은 어두운 면으로 이어진다. 큰 밝은 천체는 등대 꼭대기와 맞닿는다.

**해석:** '등대와 배'의 포스터 구성은 안정적이다. 그러나 후반에는 안전한 통과/정박과 바위에 붙음 중 어느 상태인지 모호하고, 빛이 배의 결정을 도왔다는 원인·결과도 약하다. 실제 충돌했다고 단정할 수는 없다.

**제안:** 선체가 섬과 겹칠 때 남길 물의 음각 띠 또는 정박 위치를 먼저 설계한다. 빛이 통로를 드러내는 상태와 배의 방향/spacing 변화를 묶는다. 천체 접선은 등대 램프를 강조하려는 의도라면 유지할 수 있으나 램프와 천체의 역할을 구별할 배치를 검토한다.

**Visual acceptance:** f144–190에서 선체와 섬의 경계 또는 항로가 계속 읽혀야 한다. 시작/빛의 변화/도착 세 프레임만으로 배가 어디로 가는지 설명 가능해야 한다. 천체 이동은 선택 사항이며, 합침을 해소했다는 기준과 혼동하지 않는다.

## 4. 선·워시와 수채 — 우선 보완 4가지

### B1. 워시가 형태와 관계없는 반투명 도형으로 읽힌다 — 우선 1, (a)+(c), 요구 수준에 따라 (d)

**증거:** S03 [f120 / 5.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S03/f120.jpg), S04 [f044 / 1.833초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/f044.jpg) 및 [f156 / 6.500초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/f156.jpg).

**관찰:** 잎 뒤에 큰 오각형 색면이 남고 잎 끝·잎 배·줄기와 농담의 관계가 약하다. 코트 뒤 워시는 어깨와 옷자락을 따라가지 않는 사각형이다. 물웅덩이도 각진 면과 거의 균일한 농도로 보인다. 단순히 선 밖으로 색이 나간 것이 아니라 **선과 색면이 서로 다른 대상을 그리는 듯한 관계**다.

**해석:** 느슨한 선·색 분리는 유효한 미술 선택이다. 현재는 그 어긋남에 형태를 설명하는 규칙이 적어 종이 콜라주/도형 초안의 인상이 앞선다. 젖은 물감의 잃어버린 edge, 쌓인 edge, 내부의 얇고 진한 부분은 뚜렷하지 않다.

**제안:** 먼저 기존 points/alpha/edge/layers만으로 잎의 큰 배와 옷의 어깨·옷자락을 설명하는 면을 저작한다. 어디는 선을 넘고 어디는 종이를 남길지 정한 style grammar가 필요하다. 모든 경계를 흐리거나 모든 선에 noise를 주는 일은 필요하지 않다. 실제 흡수·번짐을 목표로 할 때만 B2의 출력 보완을 적용한다.

**Visual acceptance:** S03 f120과 S04 f044/f156을 선 없이 보아도 각각 잎 덩어리와 코트의 몸 방향이 읽혀야 한다. 선을 켰을 때 최소 한쪽 경계는 형태를 지지하고 다른 쪽의 어긋남은 의도된 색 여백으로 읽혀야 한다. 종이색과 넓은 빈 면적은 유지한다.

### B2. 수채 연구는 변화가 보이지만 물감의 표면 증거가 부족하다 — 우선 1, (d) → (c)+(a)

**증거:** P01 [f024–035 / 1.000–1.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P01/native24-f024-035.jpg), [f144 / 6.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P01/f144.jpg), P02 [f144 / 6.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P02/f144.jpg)와 양쪽 전체 sequence.

**관찰:** 원형의 파란 중심이 퍼지고 P02에는 붉은 영역과 중간색 접촉부가 생긴다. 원본 해상도에서도 약 40px 단위의 큰 사각 셀이 보인다. 중심은 균일하고 외곽은 동심 농담으로 희미해진다. 건조 후 국소적으로 농도가 모이거나 종이 결을 따라 경계가 갈라지는 모습은 분명하지 않다.

**해석:** **영역 확장·색 접촉의 기능 시연으로 유효**하다. 계산 설명을 듣지 않고 보면 흐릿한 셀 농도장에 더 가깝다. 이를 '고완성도 수채'의 증거로 쓰기는 어렵다. 물리 solver의 존재/정확도와 눈에 보이는 재질의 설득력은 별도다.

**제안:** 출력에서 셀 경계가 주인공이 되지 않도록 해상도·재구성 방식을 먼저 다룬다. 단순 blur만으로 종이와 물감을 얻었다고 보지 않는다. 그다음 한 안료의 얇은 내부/국소 침전/서로 다른 경계, 두 안료의 겹침 색을 아트 디렉션할 수 있는지 작은 재질 견본으로 확인한다. 종이 결, 흡수의 공간 변화, 젖음/마름의 edge를 제어할 수 없다면 이 부분이 실제 capability 후보다. 새 FX 종류 추가가 우선은 아니다.

**Visual acceptance:** 같은 크기·색·사건의 f024/f072/f144를 100%와 50%로 보았을 때 사각 셀의 격자가 먼저 보이지 않아야 한다. 얇은 내부와 국소적으로 쌓인 가장자리를 구별할 수 있어야 하며, P02 접촉부는 단순 두 흐린 원의 포개짐 이상의 경계 변화를 보여야 한다. 변경한 번짐 구간은 native24로 edge가 프레임마다 튀지 않는지도 확인한다. 이것은 후속 시각 기준이며 현재 충족했다고 주장하지 않는다.

### B3. 편지의 펼침은 보이지만 손·시선·소품의 관계가 약하다 — 우선 1, (a)+(b)+(c)

**증거:** S04 [f120–131 / 5.000–5.458초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/native24-f120-131.jpg) → [f156 / 6.500초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S04/f156.jpg).

**관찰:** 종이의 선이 펼쳐지고 후반에는 가운데 접힌 두 면이 보인다. 손은 작은 마름모/꺾은 선이고 두 팔의 선은 몸통과 종이 근처에서 가까워진다. 얼굴은 종이 쪽을 향하는 고개·시선 변화가 약하다. 걷는 듯한 다리 상태에서 멈춘 상태로 바뀌지만 후반 사건은 주로 종이 외형이 담당한다.

**해석:** '편지 크기의 물체를 펼친다'는 표본 비교로 확인된다. '인물이 편지를 열어 읽는다'는 감정 행동을 전달하기엔 손과 물체의 접점, 머리 방향이 부족하다. 사실적인 손가락 묘사가 필요한 것은 아니다.

**제안:** 최소 두 개의 손 실루엣(잡음/펼침)을 저작하고 접힌 종이의 피벗과 연결한다. 턱/목의 방향을 편지 쪽으로 바꾸는 포즈를 둔다. 전체적으로 확대하기 전에 종이 주변의 선 겹침과 명도 차이를 정리한다.

**Visual acceptance:** f120/f131/f156에서 어느 손이 어느 가장자리를 잡는지, 종이가 어떤 축으로 열리는지 단색 선화만으로 구별되어야 한다. 작은 화면에서도 손·종이·얼굴이 하나의 행동 삼각형을 이루어야 한다. 머리·몸통 hold는 유지해도 된다.

### B4. 비의 배열과 정물의 등장이 같은 공간의 사건으로 연결되지 않는다 — 우선 2, (a)+(b)+(c)

**증거:** S03 [f024 / 1.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S03/f024.jpg) → [f120 / 5.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S03/f120.jpg), 전체 sequence f000–140.

**관찰:** 상부 빗줄기는 유사한 길이·각도의 반복 열이다. 비가 옅어진 뒤 하부 물면과 우측 식물의 선·색면이 순차적으로 그려진다. 물면의 짧은 내부선은 보이지만, 빗줄기와 물면의 접촉 사건은 두드러지지 않는다.

**해석:** 그려졌다가 사라지는 드로잉 데모로는 읽힌다. '비가 멎은 뒤 남은 물과 잎'의 인과보다 다른 도형의 출현에 가깝다. 빈 배경 자체가 문제가 아니며 배경 전체를 채울 필요가 없다.

**제안:** 물면의 일부를 비가 끝나기 전에 남기거나, 마지막 빗줄기 한두 개와 물면의 작은 변화에 위치 관계를 준다. 규칙적인 열을 유지하더라도 주된 빗줄기 하나에 다른 길이/간격을 저작해 기상과 패턴 견본을 구별한다.

**Visual acceptance:** f024/f060/f120에서 최소 한 위치가 '비가 있던 자리–남은 물면'으로 연결되어야 한다. 비의 퇴장과 정물의 등장을 대비시킨 의도가 제목 없이 읽혀야 한다. 원속도에서 멈춤의 여운이 적절한지는 별도 연속 재생 검토가 필요하다.

## 5. 표현주의 3D/NPR — 우선 보완 4가지

### C1. 해칭이 형태를 돕는 부분보다 화면을 덮는 공통 무늬가 우세하다 — 우선 1, (c)+(a) 우선, 이후 필요한 (d)

**증거:** S05 [f024 / 1.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S05/f024.jpg), S06 [f120 / 5.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S06/f120.jpg), F02 [f126 / 5.250초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/F02/f126.jpg).

**관찰:** 구에서는 명암에 따라 교차선의 보임이 달라지고 병 몸통에서는 선이 돌아가는 방향이 보인다. 이 부분은 입체 표면을 돕는다. 반면 S06의 잎·화분·벽·바닥, S05의 벽·바닥·열차는 비슷한 대각 교차선으로 덮인다. 밝은 큰 잎에서도 그물망이 잎맥보다 먼저 읽히고 넓은 벽의 선이 사선 그림자와 경쟁한다.

**해석:** UV를 따라 붙은 인쇄 표면의 기반은 있다. 현재는 목재/잎/벽돌·석재의 구조 차이보다 '전 물체에 같은 망을 입힘'이 강하다. 해칭을 전부 없애자는 지적이 아니다.

**제안:** recipe에서 벽·밝은 바닥의 강도/빈도를 먼저 낮추고 잎맥 주변에 선의 휴지 영역을 둔다. 나무결/잎맥/화분의 둘레처럼 형태의 축에 맞는 UV·선 자산을 저작한다. 현재 scalar 조절로 휴지 영역·방향·재질별 획군을 만들 수 없을 때만 그 제어를 capability로 올린다.

**Visual acceptance:** S06 f120을 축소했을 때 잎 군집, 병, 탁자, 배경이 선 밀도로도 구분되어야 한다. 100%에서는 잎맥이 교차선에 먹히지 않고, 그림자 경계와 해칭 방향이 구별되어야 한다. 정지화면 개선 후 같은 native24 구간에서 무늬가 표면을 미끄러지거나 선 밀도가 갑자기 뒤집히는지 추가 확인한다. 현재 전편의 시간적 안정성은 미확인이다.

### C2. 재질 이름과 장소의 시각 단서가 좁다 — 우선 2, (a)+(c); 유리 요구 시에만 (d)

**증거:** S06 [f120 / 5.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S06/f120.jpg), F02 [f126 / 5.250초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/F02/f126.jpg).

**관찰:** 커다란 잎, 화분, 낮은 탁자, 작은 병 모양 물체와 떠 있는 타원체가 있다. 병은 불투명하고 황토/회녹 계열이며 화분·탁자와 비슷한 교차선이다. 연구를 하는 도구나 표본을 구별하는 단서는 약하다.

**해석:** 정물 무대·환상적 온실로는 성립할 수 있다. 그러나 '연구실'의 용도와 병/화분/탁자의 재질 차이를 화면만으로 알아내기는 어렵다. 사실적 유리가 모든 NPR 작품의 필수 조건은 아니다.

**제안:** 아티스트가 표본병, 기록물 또는 측정 도구 중 장소를 규정할 한두 자산을 디자인한다. 불투명 도자기 병이면 형태와 표면을 그에 맞게 선언한다. 유리병을 원할 때만 투명도·반사/내부 실루엣을 지원할 실제 공용 재질 경로를 별도로 검토한다.

**Visual acceptance:** f120에서 병과 화분을 색 차이 없이도 형태/표면/내용물 중 두 단서로 구분할 수 있어야 한다. 장소의 주된 작업이 하나의 소품 관계로 읽혀야 한다. 설명용 텍스트를 더한 것만으로 통과시키지 않는다.

### C3. 역의 인물이 건축과 그림자에 묻힌다 — 우선 1, (c)+(a)

**증거:** S05 [f174 / 7.250초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S05/f174.jpg), 전체 sequence f088–190.

**관찰:** 후반 열차의 두 검은 전면창과 밝은 외곽은 열차로 읽힌다. 그 옆 인물은 모자·가방을 가진 작은 검은 덩어리이고 뒤쪽 기둥과 바닥 그림자에 가까운 값이다. 문턱은 장방형 프레임으로 있지만 인물보다 주목성이 높지 않다.

**해석:** 열차의 접근은 실제 보이는 사건이다. 반면 '누군가 기다리다 도착을 마주함'은 건축의 명암·패턴 아래 묻힌다. 밝은 의상이나 카메라 이동을 무조건 추가할 이유는 없다.

**제안:** 인물을 밝은 바닥/벽의 깨끗한 면에 놓거나 기둥과의 간격을 바꾼다. 가방과 몸통의 음각 공간을 확보하고 인물이 있는 배경의 해칭만 줄인다. 문턱의 대비도 이 관계 안에서 배분한다.

**Visual acceptance:** f104/f156/f174를 25% 크기·흑백으로 보아도 인물의 위치와 모자/가방 외곽이 기둥과 분리되어야 한다. 열차는 계속 우측 접근 방향을 유지하고 인물과 문턱 사이 경로가 보존되어야 한다.

### C4. 기하학적 무대의 개성은 있으나 장소마다 다른 형태 문법은 약하다 — 우선 2, (a)+(c)

**증거:** S05 [f024](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S05/f024.jpg)와 [f174](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S05/f174.jpg), S06 [f120](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/S06/f120.jpg).

**관찰:** 역은 반복 상자 기둥·평판 벤치·직육면체 열차, 연구실은 상자 바닥/벽·평판 탁자·유사한 잎 군집이다. 긴 사선 그림자와 기울어진 배치는 있으나 물체 외곽 자체는 대부분 정규 도형이다. 양쪽 모두 무대 바닥의 절단면이 보인다.

**해석:** 의도된 디오라마라면 절단면은 유지할 수 있다. 표현주의의 낯선 공간을 기대할 때는 빛의 효과에 비해 건축·가구·소품의 비대칭과 비례 관계가 덜 저작되어 있다. 배경 디테일 양이 아니라 **어떤 형태를 반복하고 어디서 깨뜨릴지**의 문제다.

**제안:** 역은 문턱·기둥·차창, 연구실은 잎·병·탁자의 외곽에서 각각 한 가지 비례 규칙을 정한다. 중요한 한 물체를 제외한 반복은 절제한다. 모형 무대 목적이면 절단면을 유지하고, 내부 공간 목적이면 프레이밍으로 그것을 정리한다.

**Visual acceptance:** 해칭과 먼지를 끈 저작용 비교 이미지에서도 역과 연구실이 각각 독자적인 형태 문법으로 구별되어야 한다. 재료/빛을 켰을 때 그 형태가 더 잘 읽혀야 한다. 더 많은 소품이나 새로운 FX 개수로 대체하지 않는다.

## 6. 자동 rig·retarget 자산과 FX 예제의 목적별 판정

### D1. 자동 rig 대상은 기능 fixture로 유효하나 영화 캐릭터 자산으로는 부족 — 우선 1, (a), 변형 문제 확인 후 (d)

**증거:** P03 [f024 / 1.000초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P03/f024.jpg), [f064 / 2.667초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P03/f064.jpg), [f048–059 native24](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/art-direction/P03/native24-f048-059.jpg), P04 overview.

**관찰:** P03에서 팔을 올리고 내리는 변화, P04 overview에서 체형과 다리 상태 차이는 보인다. P03 두상은 수평 계단의 돌출이 드러나고 손·발은 사각 끝단이다. f064의 팔 아래/옆구리에는 검은 삼각 쐐기와 접힌 면이 보이며 f048–059에서도 옆구리의 어두운 틈이 생긴다.

**해석/미확인:** 블록 자산 자체는 rig의 대상 범위를 설명하기 좋다. 표정·복식·손의 방향이 없는 형태로 영화 캐릭터의 매력을 입증할 수는 없다. 두상의 계단은 뒤에서 확인한 voxel 자산 생성과 일치하지만, 옆구리의 검은 부분이 열린 면인지 강한 음영/변형/outline인지 분리 확인하지 않았다. 자동 rig 알고리즘 결함으로 단정하지 않는다.

**제안:** 먼저 지원하는 입력 범위 안에서 손끝·발바닥·어깨·옷의 외곽을 설계한 단일 캐릭터를 만든다. 같은 극단 포즈에서 자산 단면과 스킨/outline을 각각 비교하여 옆구리 원인을 찾는다. 추가 표정 시스템이나 임의 체형 자동화부터 시작할 근거는 부족하다.

**Visual acceptance:** f024/f064에 대응하는 극단에서 겨드랑이/옆구리의 표면이 의도대로 이어지고 실루엣의 갑작스러운 쐐기가 없어야 한다. 손·발 방향이 명확하고, 3개 포즈의 외곽만으로도 같은 인물의 형태가 유지되어야 한다. 해당 구간 native24에서 부피/선 경계가 갑자기 변하지 않는지 확인한다. P04는 native 상세를 보지 않아 동일 현상이 있다는 결론을 내리지 않는다.

| 예제 | 실제 관찰과 기능적 장점 | 목적별 판정·남은 격차 |
|---|---|---|
| P05/P06 | P05 f018/f036와 native24에서 세 색·세 비율의 관절 구와 막대가 분리된다. P06 overview에서도 세 대상의 팔 방향 차이가 보인다. | **비교판으로 유효.** P05의 둥근 발끝·막대 몸통은 관절 비교를 쉽게 하지만 옷·근육·캐릭터 실루엣의 변형 품질을 입증하지 않는다. P06의 세부 손동작·cadence는 미확인이다. 높은 미술 완성도의 근거로 바꾸지 않는다. |
| F01 | f126에서 여섯 칸, 구멍/압력 변화 선/해칭/소거/입자/색 경계가 분리된다. 칸 02의 가늘다 굵어지는 검은 곡선은 재사용할 획의 가능성을 보인다. | **FX 카탈로그로 유효.** 체크무늬와 RGB 패치는 기능 비교 목적이므로 서사·미술 결함으로 취급하지 않는다. 칸 02의 오각형 워시는 B1과 같은 재질 격차가 있지만 기능 가독성과 별도다. |
| F02 | f126에서 구/상자/잎/병을 한 화면에서 비교할 수 있고 곡면의 명암 띠가 보인다. | **NPR 표면 시험으로 유효.** 공통 교차선이 재질 차이를 줄이는 C1을 확인하는 견본이다. 이 배열에 서사나 복잡한 캐릭터가 없다는 이유로 감점하지 않는다. |
| F03 | f126에서 병 밑 황금색 링·짧은 리더선이 실제 보인다. 낮은 대비의 작은 표식이라 큰 잎 군집의 구도는 유지된다. | **혼합 레이어 시연으로 유효 / 연출용 주목 장치로는 보완 필요.** 지금 프레임에서 링이 병 밑/탁자와 겹쳐 무엇을 지시하는지 약하다. (c) 리더의 끝/여백/대비를 재배치한 뒤, 동일 f126을 축소해 표식의 대상이 하나로 읽히는지 확인할 것. 가림·움직임 중 부착 안정성은 단일 고해상도 표본과 overview만으로 미확인이다. |

## 7. 시각 관찰 뒤 확인한 원인과 공용 도구의 경계

다음은 화면의 판정을 뒤집는 기술 성과가 아니라 **어디에서 수정할지 정하기 위한 확인**이다. 현재 공개 소스와 선택된 렌더 프로젝트가 모두 완전히 같은 revision이라고 가정하지 않았다. P01/P02는 `fullhd-v3/projects/*.authoring-absent`의 watercolor 스타일·solver 모듈이 현재 공개 모듈과 byte hash가 같음을 읽기만 하여 확인했다. 다른 계열은 공개 저작 경로와 화면의 대응을 확인한 수준이다.

| 읽은 일부 | 확인한 사실 | 수정 위치에 미치는 의미 |
|---|---|---|
| [silhouette prepare/evaluate/draw](/Volumes/eyedisk/develop/cinewright/modules/styles/silhouette-theatre/index.mjs:33), [forest](/Volumes/eyedisk/develop/cinewright/recipes/styles/silhouette-theatre/forest.json:242), [harbor](/Volumes/eyedisk/develop/cinewright/recipes/styles/silhouette-theatre/harbor.json:154) | shape·puppet·평면 depth, 개별 pose/transform clock, 카메라, shadow/halo 경로가 존재한다. | A1/A3에 새 카메라·FX 기능부터 요구할 이유가 적다. 포즈 뱅크·외곽 자산·겹침·항로의 저작이 우선이다. |
| [drawWash](/Volumes/eyedisk/develop/cinewright/modules/fx2d/wash.mjs:1), [line-wash draw](/Volumes/eyedisk/develop/cinewright/modules/styles/line-wash/index.mjs:11), [rain washes](/Volumes/eyedisk/develop/cinewright/recipes/styles/line-wash/rain.json:599), [commuter washes](/Volumes/eyedisk/develop/cinewright/recipes/styles/line-wash/commuter.json:4757) | 워시는 points의 직선 다각형을 동일 면으로 여러 번 채우고 일정 두께의 edge를 그린다. draw는 워시를 먼저 그린 뒤 선화 bank를 그린다. 현재 워시에는 선화 bank처럼 포즈에 따른 points bank가 없다. | B1의 각진/고정 색면은 단순 취향 설명이 아니라 자산 points와 renderer 경로에 연결된다. 정물은 현재 recipe로 고칠 여지가 크고, 움직이는 코트에 색면을 계속 붙이려면 워시 변형/부착 저작 경로가 capability 후보다. |
| [watercolor draw](/Volumes/eyedisk/develop/cinewright/modules/styles/watercolor-physical/index.mjs:5), [solver 입력·bake](/Volumes/eyedisk/develop/cinewright/modules/fx2d/watercolor.mjs:5), [선택 v3 wet bake](/Volumes/eyedisk/develop/cinewright/.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd-v3/wet-bake.json) | 선택 v3 입력은 48×27, 192 frames다. draw는 각 셀을 `fillRect`로 화면에 확대한다. 1920/48=1080/27=40px로 관찰한 셀 크기와 맞는다. 입력은 전역 diffusion/absorption/evaporation/deposition과 원형 이벤트이며 종이의 위치별 흡수/결 제어는 이 입력 경로에 없다. | B2의 가장 큰 화면 문제는 공용 출력 경로에 있다. 계수 조절만으로 40px 사각 셀을 없앨 수 없다. 격자 개선 다음에야 종이·경계의 미술 제어를 평가할 수 있다. solver가 계산된다는 사실로 재질 통과를 선언하지 않는다. |
| [hatch material](/Volumes/eyedisk/develop/cinewright/modules/fx3d/material.mjs:3), [light/gobo](/Volumes/eyedisk/develop/cinewright/modules/fx3d/light.mjs:10), [lab palette](/Volumes/eyedisk/develop/cinewright/recipes/styles/expressionist-space/laboratory.json:14) | 4개 밀도의 diagonal/cross atlas와 UV 빈도, strength, ink, tones를 쓴다. 실제 outgoing light에 따라 밀도가 바뀐다. palette별 scalar는 있지만 획군은 공통이다. 별도 gobo도 있어 화면의 모든 선을 해칭 하나의 결과로 볼 수 없다. | C1은 우선 기존 strength/hatch/tones와 조명/자산 UV로 해결한다. 방향·국소 배제·재질별 atlas를 공개 recipe에서 저작할 경로가 필요한지는 그 다음 판단한다. 전 화면 overlay라고 단정하지 않는다. |
| [3D 자산 material 할당](/Volumes/eyedisk/develop/cinewright/modules/styles/expressionist-space/index.mjs:43), [lab specimen](/Volumes/eyedisk/develop/cinewright/recipes/styles/expressionist-space/laboratory.json:2641) | 가져온 mesh도 지정한 hatch material로 교체된다. 이 material 함수는 toon color/ramp/hatch 경로다. | 아티스트가 GLB에 다른 표면을 넣기만 해서는 그 차이가 최종 화면에 그대로 유지된다고 기대할 수 없다. 유리/금속 같은 다른 반응을 원할 때 C2는 실제 재질 경로의 과제가 된다. 다만 현재 장면은 불투명 인쇄 미학으로 먼저 정리 가능하다. |
| [rig fixture](/Volumes/eyedisk/develop/cinewright/examples/styles/phase02-rig/fixtures.mjs:1), [demo build](/Volumes/eyedisk/develop/cinewright/examples/styles/phase02-rig/build.mjs:3), [auto-rig](/Volumes/eyedisk/develop/cinewright/modules/animation/auto-rig.mjs:39) | 입력 자산은 voxel union으로 만든 단일 표면이다. 코드에 손가락·얼굴·twist bone이 없는 범위와 선형 skinning 부피 한계가 명시된다. | 두상 계단을 smoothing/캐릭터 저작 없이 rig 기능 추가로 해결할 문제로 보지 않는다. D1의 틈은 이 사실만으로 원인을 확정하지 않는다. |

## 8. 다음 제작 투자 순서와 승인용 시각 기준

새 기능 구현을 이 보고서에서 시작하지 않는다. 다음 미술 패스의 **저작 자산 / recipe / 공용 capability** 작업을 분리하면 다음과 같다.

| 순서 | 먼저 할 일 / 주 소유 | 왜 먼저인가 | 다음 검토에 가져올 최소 시각 증거 |
|---|---|---|---|
| 1 | **수채 출력의 셀 노출 해결** — (d) 공용 도구 | 현재 P01/P02의 100% 화면에서 재질보다 40px 셀이 먼저 보인다. | 같은 사건·색·크기의 f024/f072/f144와 변화 구간 native24. 격자가 먼저 보이지 않고 얇은 색층/경계 차이가 읽힐 것. blur된 원만으로 통과하지 않음. |
| 1 | **NPR 선 밀도·명암 배분** — (c) recipe, (a) UV·선 자산 | 기능은 이미 조절 가능하나 거의 모든 면이 같은 교차선이다. | S05 f024/f174, S06 f120의 동일 구도 비교. 인물/배경 분리, 잎맥/배경 무늬 분리, 최소 3재질의 밀도 차이를 확인. |
| 1 | **행동용 캐릭터·소품 실루엣 저작** — (a)+(b) | S01 길찾기와 S04 편지 읽기의 의미가 도형의 존재보다 약하다. P03은 fixture의 형태 제약이 선명하다. | S01 의미 포즈 3장, S04 손·종이·시선 3장, P03 대응 극단 2장과 native24. 캐릭터가 무엇을 하는지 외곽과 접점으로 설명 가능할 것. |
| 2 | **선·워시 형태 grammar와 부착 방식** — 정물 (a)+(c), 움직이는 색면 (d) 후보 | 선과 무관한 큰 오각형·사각형은 물성보다 도형을 강조한다. 현재 선화는 bank가 있고 워시는 고정 points다. | S03 선 on/off, S04 f044/f156 선 on/off. 워시만으로 형태가 읽히고 동작에서 색면이 몸을 따라가거나 의도된 어긋남 규칙을 유지할 것. |
| 2 | **장소를 규정할 소수의 좋은 자산** — (a)+(c) | 연구실·역의 빛은 구별되지만 소품·가구·건축은 일반 도형 수준이 많다. | 해칭 없는 형태 비교와 최종 재질 샷. 연구 대상/문턱·대기의 관계가 소품 수 증가 없이 읽힐 것. |
| 3 | **국소 해칭 제어·종이/안료 edge 제어** — (d), 위 패스 후 잔여 한계만 | 현재 scalar 조절/points/UV로 먼저 해소할 몫이 있다. | 기존 파라미터로 만들 수 없는 구체적 전후 견본이 있을 때만 capability 작업으로 승격. 기능 목록이나 테스트 수로 대체하지 않음. |

공용 툴로 먼저 올릴 것은 **물감 출력의 재구성 품질**이다. 다음 후보는 **움직이는 워시의 형태 부착**, 이후 **재질별·국소적 해칭 저작**이다. 반면 실루엣 항로, 인물 배치, 광역 선 밀도, 소품의 주목성은 recipe에서 먼저 해결할 수 있다. 캐릭터의 손·발·얼굴 방향, 형태가 살아 있는 소품, 잎맥/나무결의 방향 설계는 아티스트 자산이 필요하다. 이 셋을 하나의 '더 많은 feature' 요구로 묶지 않는다.

## 9. 선택적 취향 조정과 미확인 항목

**선택적 취향:** S01/S02의 더 거친 종이 edge, S02 천체와 등대 접선의 분리, S05/S06 디오라마 절단면 유지 여부, 워시의 더 진한 채도는 작품의 선택이다. 현재 제한 팔레트·빈 종이·cutout 평면성은 유지해도 된다. 모든 샷에 카메라·FX를 더하라는 권고는 없다.

**미확인:** 전편의 on-ones edge 안정성, 실제 재생 시 hold의 감정적 길이, S05의 그림자가 관객에게 언제 사건으로 감지되는지, P04/P06의 native 동작 품질, P03 옆구리 쐐기의 렌더/표면/스킨 원인, F03의 가림 중 표식 안정성은 이번 관찰로 확정하지 못했다. 각각 전체 native 구간 또는 분리된 저작용 비교 패스가 필요하다. 이는 현재 장면의 장점·부족에 대한 정지/연속 표본 관찰과 구별한다.
