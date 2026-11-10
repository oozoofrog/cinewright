# 영화적 연출·촬영·편집 독립 검토 — 2026-11-08

현재 S 장면은 공간·재질·동작을 보여주는 연출 샘플로 유효하다. 그러나 화면에서 확인되는 움직임과 제목이 약속하는 사건 사이에는 격차가 있다. 특히 S01의 ‘길 찾기’, S02의 ‘등대의 안내’, S04의 ‘편지를 읽는 인물’은 이동·회전·선의 출현보다 약하게 읽힌다. S05에는 **그림자 → 인물 → 열차**라는 정보 순서가 실제로 있으며, 이를 없다고 평가하면 잘못이다. S06은 빛·가림의 정물 연구로 성립하지만 관찰의 중심을 더 명확히 정할 수 있다. 컷 수나 움직임의 양을 늘리는 것이 공통 해법은 아니다.

**관찰 방법과 평가 범위**

이 검토는 **타임스탬프가 있는 추출 프레임/연속 프레임 분석**이다. MP4를 원속도로 연속 감상한 것이 아니다. 아래 이미지는 모두 `view_image`로 실제 열었다. 디코드 성공, 파일명, 구현자 설명·점수·테스트 통과를 시각적 성공의 근거로 삼지 않았다. 원속도에서 느끼는 긴장, 호흡, 가속감, 컷의 체감 길이와 피로도는 최종 판정하지 않는다. 소리·음질은 평가하지 않았으며 사람의 수락·접근성 인증도 주장하지 않는다.

먼저 입력 [README](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/README.md)와 [manifest](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/manifest.json)에서 파일 위치·목적·메타데이터를 확인했다. 의도 문구는 평가할 가설이며, 화면에서 실제 읽혔다는 증거로 쓰지 않았다. S/P/F 기본 이미지와 아래 추가 이미지의 최초 관찰을 [독립 기록](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/independent-observations.txt)에 저장한 **뒤에** 관련 recipe와 구현 일부를 읽었다. 다른 reviewer 보고서와 이전 성공 보고서는 읽지 않았다. 이후 소스가 지시한 인물 등장 경계는 추가 native24 구간으로 다시 확인했다.

프레임 번호는 0 기반, 시각은 `f/24`다. 모든 입력은 1920×1080, 24fps이며 S01–S06, P01–P05, F01–F03은 8초/192프레임, P06은 9초/216프레임이다. MP4 절대 경로와 입력 SHA-256은 manifest에 있다. 해시를 별도 재검산하지 않았다. 12fps 시트는 **소스 매 2프레임**이며 24fps 전 프레임 관찰과 같지 않다.

| 실제 연 기본 이미지 | 실제 평가 구간·해상도 한계 |
|---|---|
| S01 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S01/overview.jpg), [sequence](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S01/sequence-12fps.jpg) | 0–7.917초, f0–190 짝수 96장. 전체 배치·정보 순서 평가 |
| S02 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S02/overview.jpg), [sequence](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S02/sequence-12fps.jpg) | 같은 범위. 원형 오픈·배 이동·빛 방향·종결 구도 |
| S03 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S03/overview.jpg), [sequence](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S03/sequence-12fps.jpg) | 같은 범위. 비 소거→수면·식물 드로잉 순서 |
| S04 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S04/overview.jpg), [sequence](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S04/sequence-12fps.jpg) | 같은 범위. 인물 생성→발 변화→종이 등장·펼침 |
| S05 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S05/overview.jpg), [sequence](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S05/sequence-12fps.jpg) | 같은 범위. 축소판에서 인물을 놓쳐 추가 구도로 보완 |
| S06 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S06/overview.jpg), [sequence](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S06/sequence-12fps.jpg) | 같은 범위. 정물의 시점·빛·가림 변화 |
| P01 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P01/overview.jpg), P02 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P02/overview.jpg) | 각 f0,12,26,38,50,64,76,88,102,114,126,140,152,164,178,190. 색 덩어리와 제시 방법만 평가 |
| P03 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P03/overview.jpg), P04 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P04/overview.jpg), P05 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P05/overview.jpg) | 위와 같은 16개 시점. 전신/비교 구도 평가. 미세 접지·cadence 판정 아님 |
| P06 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P06/overview.jpg) | f0,14,28,42,58,72,86,100,114,128,142,156,172,186,200,214, 0–8.917초. 팔 동작·체형 비교 제시 평가 |
| F01 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/F01/overview.jpg), F02 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/F02/overview.jpg), F03 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/F03/overview.jpg) | 각 위 8초 overview와 같은 16개 시점. 기능 비교/통합 구도 평가. F03은 S06과 유사해도 별도로 열었으며 동일 파일로 간주하지 않음 |

P/F의 12fps 전체 시트는 열지 않았다. 따라서 그 사이의 모든 동작을 보았다고 주장하지 않는다. S의 전 구간도 짝수 프레임만을 기본으로 보았으며, 홀수 프레임을 포함해 확인한 구간은 다음뿐이다.

| 추가로 생성하고 실제 연 이미지 | 소스 프레임·목적 |
|---|---|
| [S01 구도](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S01-composition.jpg), [S02 구도](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S02-composition.jpg), [S03 구도](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S03-composition.jpg) | 각각 f0,96,190 / 0,4,7.917초; 패널 폭 960px. 실루엣 접선·수면/식물 분리 확인 |
| [S04 구도](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S04-composition.jpg), [S05 구도](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-composition.jpg), [S06 구도](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S06-composition.jpg) | 같은 프레임·크기. 편지/얼굴, 작은 인물, 표면 무늬 확인 |
| [S01 native24](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S01-native24-f60-83.jpg) | f60–83 전부, 2.500–3.458초; 패널 폭 480px. 발/꼬리와 배경 상대 변화 확인 |
| [S04 native24](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S04-native24-f112-135.jpg) | f112–135 전부, 4.667–5.625초; 480px. 팔이 모이는 과정과 종이 선 출현 확인 |
| [S05 사건](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-action-beats.jpg) | f48,72,86,88,96,112,132,156 / 2–6.5초; 640px. 그림자→인물→열차 순서 |
| [S05 등장 native24](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-native24-f84-95.jpg) | f84–95 전부, 3.500–3.958초; 640px. f87→88의 전신 출현 확인 |
| [S05 종결 native24](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-native24-f168-191.jpg) | f168–191 전부, 7–7.958초; 480px. 열차 전경 확대와 인물의 최종 위치 |
| [S06 native24](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S06-native24-f96-119.jpg) | f96–119 전부, 4–4.958초; 480px. 시점/잎/빛의 작은 연속 변화 확인 |
| [P02 f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/P02-f096.jpg), [P05 f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/P05-f096.jpg), [F01 f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/F01-f096.jpg), [F02 f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/F02-f096.jpg) | 각 4초, 1920px 폭. 셀 경계, 비교 라벨, FX 패널, 재질 구도 확인 |

[추출 기록](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/extraction-log.json)에 원본 경로와 선택 프레임이 있다. FFmpeg로 새 JPEG를 추출하고 시트는 축소·배열·라벨만 적용했다. 대비 보정이나 생성 이미지로 원본을 대체하지 않았다. 생성된 개별 JPEG 전부를 각각 별도로 연 것은 아니며, 위 시트 안에서 확인했다. 새 증거는 지정된 `cinematography/`에만 저장했다.

**최우선 개선 5개**

해결 위치: **(a)** 저작 자산, **(b)** pose/spacing/cadence, **(c)** 샷·배치·편집 recipe, **(d)** 실제 공용 툴의 표현 한계. 다음은 수정 지시안이며 구현한 결과가 아니다.

1. **S05: 등장 경로와 인물의 주목도를 먼저 고친다 — (c), 필요 시 (a)(b).** [f84–95 / 3.5–3.958초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-native24-f84-95.jpg): f87까지 빈 문 앞에 f88에서 모자·몸·가방이 함께 생긴다. [f48–156](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-action-beats.jpg)에서는 인물보다 먼저 긴 그림자가 나오므로 예고 자체는 있다. 그러나 등장 순간을 문턱 통과로 읽을 중간 실루엣이 없고, 인물은 바닥·벤치보다 작고 어둡다. **제안:** 그림자 선행은 유지하고, 문틀 뒤 가림에서 어깨→몸→가방이 드러나게 배치한다. 출현 동안 문 앞의 명암 분리를 확보하고 바닥 격자의 대비를 낮춘다. **재검토 기준:** 동일 구도에서 f87→88 같은 전신 점멸 없이 경계를 넘어오는 연속 실루엣이 보이는가; 열차를 보기 전에 인물의 위치와 진행 방향을 지정할 수 있는가. 초현실적 순간 출현이 의도라면 문턱 통과 대신 그 의도를 드러내는 명확한 반복/반응을 택한다.
2. **S04: 손–종이–시선의 연결을 만든다 — (a)(b)(c).** [f112–135 / 4.667–5.625초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S04-native24-f112-135.jpg), [f190 / 7.917초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S04-composition.jpg): 두 팔이 오른쪽 종이 쪽으로 모이고 종이 외곽이 넓어지지만 머리는 거의 직립이며, 펼침은 외곽선이 그려지는 변화로도 읽힌다. ‘손으로 열고 읽는다’는 원인·결과와 정지의 이유가 약하다. **제안:** 접힌 모서리를 잡는 손 pose, 종이가 벌어질 때의 손 간격 변화, 마지막에 종이로 향하는 머리 기울기를 함께 저작한다. **재검토 기준:** 설명 없이 접기 전/펼치는 중/읽기 세 상태를 구별하고, 종이 접힘과 손 위치가 대응하며 마지막 hold가 읽기 pose를 담는가. 실제 읽을 문장이나 얼굴 클로즈업은 필수 아님.
3. **S02: 안내 신호와 종결 위치를 연결한다 — (c), 필요 시 (b).** [f96·190 / 4·7.917초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S02-composition.jpg): 배는 오른쪽 등대로 접근하지만 광선은 주로 배 위의 하늘에 펼쳐지고, 마지막 선체는 등대 바위·전경 파도와 같은 어둠으로 붙는다. 항구의 존재는 읽혀도 ‘빛을 따라 안전한 곳에 도착’은 화면이 충분히 입증하지 않는다. **제안:** 배가 신호를 받는 순간을 한 번 정하고 광선 방향·배의 회전 또는 감속을 시차로 연결한다. 마지막에는 바위와 선체 사이 수면 틈을 남긴다. **재검토 기준:** 신호 전후의 배 상태가 달라지고, 최종 정박/통과 위치를 충돌이나 소실과 구별할 수 있는가. 광선이 선체에 물리적으로 닿는 연출만이 정답은 아니다.
4. **S01: 두 동물의 관계를 정지 이후에도 읽히게 한다 — (a)(b)(c).** [f96–190 / 4–7.917초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S01/sequence-12fps.jpg), [큰 구도](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S01-composition.jpg): 두 동물은 오른쪽을 향한 채 같은 공간에 남고, 작은 머리/꼬리 변화는 있으나 상대를 기다리는지, 길을 고르는지, 무언가를 발견했는지 분명하지 않다. **제안:** 선행 토끼의 멈춤→시선 대상→뒤 동물의 한 박자 늦은 반응 중 한 관계를 택한다. 큰 이동을 더하기보다 귀/머리 방향과 두 몸 사이 간격을 쓴다. **재검토 기준:** 처음·전환·마지막 세 프레임만으로 누가 먼저 무엇에 반응했는지 설명 가능한가. ‘길 찾기’가 아니라 단순 숲 통과 시연이라면 관계 추가는 필수가 아니며 목적 문구를 좁힌다.
5. **S06: 빛과 무늬가 설명할 대상을 하나 정한다 — (c), 필요 시 (a); (d)는 후순위.** [f0·96·190](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S06-composition.jpg): 큰 잎, 벽, 바닥, 화분 모두 촘촘한 사선/격자를 가지며 창살까지 중첩된다. 빛은 변하지만 작은 병 모양 오브젝트보다 잎과 벽 무늬가 계속 우세하다. **제안:** 잎의 겹침을 설명하는 샷인지, 작은 표본을 드러내는 샷인지 정하고 나머지 면의 hatch 강도를 낮춘다. 전자라면 잎 한 장의 명암·겹침 변화로 마무리해도 충분하다. **재검토 기준:** 밝고 어두운 두 시점에서 같은 주대상을 먼저 식별하고, 변화 후 무엇의 형태/관계가 더 잘 드러났는지 말할 수 있는가. 모든 면에 새 FX를 추가할 필요는 없다.

**S01 — 숲: 구성 유지, 관계 beat 수정**

관찰: f0에서는 밝은 상단 원과 어두운 좌측 수목이 강한 시각적 후보이며 두 동물은 하단 중경에 있다. 전경의 양쪽 나무·고사리, 중경 동물·지면, 후경 언덕·광원의 층이 분명하다. f0의 여우 꼬리는 좌측 나무와 겹치지만 [f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S01-composition.jpg)에는 떨어져 보인다. 크기가 다른 두 실루엣과 귀 모양으로 캐릭터를 구별할 수 있다. 동물 둘의 행동축은 왼쪽→오른쪽으로 일치하고 반대 방향 컷은 없다. 다만 둘이 서로 보는 관계는 약하다. 숲의 실제 규모는 제한적이지만, 수목이 동물보다 크다는 상대 규모는 읽힌다.

시간: [f0–190 sequence](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S01/sequence-12fps.jpg)에서 초반 전경이 옆으로 물러나며 두 몸이 더 잘 드러나고, 중반까지 위치·다리 간격이 변한다. [f60–83 native24](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S01-native24-f60-83.jpg)에도 발 자세 차이가 있으므로 ‘정지 그림을 통째로 밀기만 한다’고 단정하지 않는다. 후반에는 큰 배치 변화보다 머리·꼬리와 잔여 카메라 이동이 남는다. 카메라는 초반 가림 해제와 층위 설명에는 이유가 있지만, 후반 새 정보나 시선 대상을 공개하는 기능은 작다. 컷이 없어도 이 구도는 유지할 만하다.

해석/제안: ‘두 동물이 같은 방향을 향함’까지는 읽힌다. ‘함께 길을 찾음’은 미확인이다. 위 우선 수정 4를 적용하고, 토끼가 바라볼 방향의 빈 공간은 유지한다. **판정:** 실루엣·다층 배치 기능 시연으로 유효, 관계를 전달하는 연출 샘플로 보완 필요. 전체 미술 재설계는 불필요하다.

**S02 — 항구: 원형 오픈·좌우 축 유지, 안내와 도착 구도 수정**

관찰: [f0–24 / 0–1초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S02/sequence-12fps.jpg)는 회색 화면에서 원형으로 항구를 연다. 원형 마스크가 처음에는 풍경 조각만 보여주고 확대되며 등대와 배를 포함한다. 후경 언덕, 중경 등대/선박, 전경 물결의 층이 읽힌다. 완전히 열린 뒤 첫 주목점은 밝은 원과 등대의 결합이다. [f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S02-composition.jpg)에서 원이 등대 지붕에 붙어 있어 달인지 거대한 램프인지 도상 해석이 갈릴 수 있다. 이 결합은 포스터적 선택일 수 있으므로 그 자체를 결함으로 확정하지 않는다.

시간/축: 배는 왼쪽→오른쪽, 등대는 오른쪽의 기준점이다. 앞 물결이 선체 하단을 가려 수면감을 만들고 돛은 배경과 구별된다. 빛이 위아래로 방향을 바꾸지만 배가 그 변화에 반응하는 뚜렷한 pose/방향 전환은 읽기 어렵다. 전체는 단일샷과 오픈 전환이며 작은 카메라 이동은 배의 출발·도착을 새롭게 설명하지는 않는다. f190에서 배가 등대 바위와 붙어 끝나는 것이 가장 먼저 해결할 구도 문제다.

해석/제안: 항해 풍경으로는 성립한다. 안내를 사건으로 만들려면 우선 수정 3을 적용한다. 달과 등대 사이 틈을 둘지는 **선택적 취향 조정**이다. 이때 재검토 기준은 ‘광원의 종류가 의도대로 읽히는가’이지 ‘무조건 분리됐는가’가 아니다. **판정:** 기능 시연으로 유효, 안내 장면으로는 보완 필요. 배·등대 자산의 전면 교체는 우선 아님.

**S03 — 비·정물: 정적 구도 유지, 물과 식물의 관계를 선택적으로 명료화**

관찰: [f0–50 / 0–2.083초](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/S03/sequence-12fps.jpg)에서는 넓은 밝은 종이와 상단의 매우 옅은 비 선이 주 정보다. f50 이후 왼쪽 하단 수면과 오른쪽 식물 선이 드러나며, f126 이후 두 잎의 윤곽이 읽힌다. 최종 [f190](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S03-composition.jpg)의 수면은 수평, 줄기는 대각선이라 두 형태가 구분된다. 전경/중경/후경을 사실적으로 나누기보다 종이 위 두 도형의 균형을 택한 화면이다. 눈높이·지평선·실제 크기는 정의되지 않는다. 이는 정물·회화 시연에서 허용되는 선택이다.

차이: 줄기 하단은 수면 위쪽 오른편에서 끝나 접촉하지 않는다. 잎 뒤 색면은 넓은 다각형이고 선의 잎 외곽과 어긋난다. 비는 상단에서 사라지고 물은 다른 위치에서 출현하므로, 관찰 가능한 것은 ‘비 이미지 소거 후 정물 그림 완성’이다. ‘비가 이 웅덩이를 만들고 식물이 그 물에 반응’하는 물리적 사건까지는 읽히지 않는다. 카메라/컷이 없고 말미 hold가 있는 것은 이 목적에 적합하다.

제안 **(a)(c)**: 장면의 의도가 ‘비 뒤의 고요’라면 수면을 초반에도 희미하게 두어 같은 장소의 시간 변화라는 연결만 강화한다. 비가 끝난 후 수면의 마지막 파문과 식물의 완성 윤곽을 남긴다. 식물과 물의 직접 접촉이 필요하지 않다면 현재 간격은 유지해도 된다. 회화적 색면 어긋남 역시 취향 선택이지만, 식물 자체의 실루엣이 목적이면 색면 모양을 잎 덩어리에 가깝게 저작한다. **재검토 기준:** 상단 비가 없어지는 순간과 하단 수면의 변화가 같은 사건으로 이어지는가; 마지막 두 형태가 희미함 속에서도 구별되는가. 밝기·대비를 수치 인증한 것은 아니다. **판정:** 정물/선 출현 시연으로 유효, 강한 극적 재설계 불필요. 물리적 비 장면으로 쓰려면 관계 보완 필요.

**S04 — 통근자: 여백 유지, 핵심 행동 pose 재설계**

관찰: f0는 거의 빈 종이이고 f12–45 부근에 머리·옷·다리가 순차적으로 드러난다. 이후 인물이 유일한 주대상이며 별도 배경 사건은 없다. 지면을 대신하는 옅은 면은 발 아래를 받치고, 오른쪽 여백은 종이를 펼칠 자리를 확보한다. 앞뒤 공간보다 인물의 전신 가독성을 택한 구도다. 옷과 종이의 wash는 윤곽선과 어긋나 있지만 선이 형태를 지탱한다. f26–76에는 다리 각도와 무게 배치 변화가 있으나 이동 경로/목적지를 설명할 환경은 없다. 화면만으로 직업·통근을 확정할 수 없다.

시간/시선: f82 이후 손 옆 작은 종이가 드러나고 f115 이후 큰 종이의 외곽이 생긴다. [native24 f112–135](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S04-native24-f112-135.jpg)에는 팔의 접근이 보인다. [f190](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S04-composition.jpg)에서 손은 종이에 가까우나 머리 방향과 종이의 낮은 위치가 충분히 연결되지 않는다. 행동의 좌우 축은 안정적이나 눈→종이의 축이 약하다. 카메라 고정은 전신 행동을 비교하기 좋고, 편지 인서트 컷은 필수가 아니다. 다만 말미 hold가 ‘읽는 행위’보다 ‘완성된 그림 전시’로도 보인다.

제안: 우선 수정 2의 손·머리·종이 pose를 중심으로 재설계한다. 초반 드로잉 등장과 걷기를 동시에 보여주면 다리가 완성되기 전에 보행 정보가 지나가므로, 걷기가 핵심이면 전신을 더 일찍 읽히게 한다 **(b)(c)**. **재검토 기준:** 초반에 전신 걸음→정지가 구별되고, 말미에 종이 내용 없이도 읽기/망설임 중 선택한 행위가 구별되는가. **판정:** 선/wash 및 pose 변화 시연으로 유효; 편지에 반응하는 연기로 작품에 바로 쓰기에는 행동 설계 보완이 크다.

**S05 — 역: 사건 순서 유지, 등장·시선 배분 수정**

관찰: [f0](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-composition.jpg)의 첫 주목 후보는 황색 벤치와 밝은 플랫폼이다. 전경의 바닥·레일 대각선은 후경 문 쪽으로 시선을 이끌고, 중경 기둥의 반복이 깊이·인간 규모를 만든다. 문은 이 축 끝에 있지만 인물이 나타날 때에도 상대적으로 작다. 원근 공간은 여섯 장면 중 구체적으로 읽히는 편이다. 실제 촬영 공간보다 무대 모형 같은 외곽/검은 여백은 양식 선택이며 오류로 간주하지 않는다.

정보 순서: [f48→72→86](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-action-beats.jpg)에서 문 쪽 긴 어두운 면이 자라고, [f87→88](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-native24-f84-95.jpg)에서 전신 인물이 생긴다. f96→156에서 인물이 플랫폼 앞쪽으로 이동하고, f112에는 후경 열차가 보이며 f168 이후 열차가 오른쪽 전경을 크게 차지한다. 따라서 단순 카메라 순회가 아니다. 레일과 열차의 진행 방향은 일관되고 컷에 의한 축 혼란은 없다. 다만 얼굴/몸 방향이 작게 보여 인물이 열차를 보고 멈춘 것인지는 확실하지 않다. ‘늦은’ 열차라는 시간 맥락은 시계·이전 기다림 정보 없이 판정할 수 없다.

카메라/마무리: 점진적인 접근은 원근을 강조하나 인물을 주대상으로 키우는 효과보다 열차를 키우는 효과가 크다. [f168–191](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S05-native24-f168-191.jpg)의 마지막에는 사람과 열차가 함께 남지만 탑승/포기/기다림 중 무엇을 선택했는지 특정되지 않는다. ‘도착 전경’으로 끝나는 의도라면 이 hold는 유효하고, 별도 결말을 강제할 필요는 없다.

제안: 우선 수정 1 후, 인물·열차의 마지막 관계를 한 가지로 정한다 **(b)(c)**. 고개를 열차 쪽으로 돌리고 한 번 멈추는 것만으로 충분할 수 있다. 인물 그림자가 다른 기둥 그림자와 섞이지 않는 구간을 확보한다. **재검토 기준:** 그림자의 주인을 인물 출현 뒤 거슬러 연결할 수 있는가; 열차가 커져도 인물의 최종 pose가 가려지지 않는가; 문에서 플랫폼으로 진행하는 과정이 ‘갑작스러운 생성’으로 읽히지 않는가. **판정:** 연출 샘플의 사건 구조는 유지. 현재 상태에서 완성 장면으로 채택하려면 등장 연결을 우선 수정한다.

**S06 — 연구실: 정물·조명 연구 유지, 주대상과 가림의 목적 수정**

관찰: 큰 밝은 잎 덩어리가 첫 주목점이다. 전경은 책상 전면·의자·바닥, 중경은 화분·병 모양 물체·작은 용기들, 후경은 창살과 벽이다. 잎 크기는 작은 의자/용기와 비교되지만, 잎이 비정상적으로 큰 표본인지 단순 과장된 정물인지는 화면만으로 확정되지 않는다. 행동축은 인물 동선 대신 잎의 겹침·창빛 방향으로 형성된다. 좁은 각도 변화 안에서는 좌우 관계가 유지된다.

시간/카메라: [f0·96·190](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S06-composition.jpg)의 바닥 그림자와 잎 명암은 달라진다. [f96–119 native24](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/S06-native24-f96-119.jpg)에도 작은 시점/겹침 변화가 있으므로 ‘완전 정지’가 아니다. 다만 처음부터 큰 잎과 작은 표본이 모두 공개되고 말미도 같은 정물군이다. 카메라가 움직였기에만 새로 알게 되는 정보가 제한적이다. 빛·가림 시연이 목표라면 이 변화 자체가 사건이며 별도 인물이나 서사가 필수는 아니다.

차이/제안: 큰 잎의 실루엣과 내부 형태를 보여주려는 순간에 표면 hatch·창살·벽 그림자가 함께 경쟁한다. 우선 수정 5를 적용한다. 작은 표본이 주제라면 지금 크기의 소품 흔들림만으로는 중요한 변화로 읽기 어려우므로 별도의 더 가까운 배치나 가림 해제를 선택한다 **(a)(c)**. **재검토 기준:** 첫 장면에서 무엇을 관찰할지 정해지고, 마지막에 그 대상의 다른 면/상태가 보이는가. **판정:** 조명·공간·가림 기능 시연으로 유효. ‘연구실에서 무슨 일이 일어남’을 전달하는 작품 장면으로 쓰려면 사건 재설계가 필요하나, 정물 연구 목적에는 강제하지 않는다.

**현재 관찰에 연결한 shot beat 제안**

아래 시간은 8초를 유지하는 초안이다. 원속도 감상 후 길이를 조절해야 하며, 실제 완성 리듬으로 인증한 값이 아니다. 모두 단일샷으로 가능하고 새 FX 제작을 전제로 하지 않는다.

| 장면·연결 근거 | 0–2초 | 2–5초 | 5–8초 | 바뀌었는지 볼 기준·담당 |
|---|---|---|---|---|
| S01: 후반 두 동물의 관계가 약함 | 기존 수목 틀 안에서 토끼가 앞서고 여우가 뒤따름. 귀와 발을 가리지 않음 | 토끼가 멈추고 오른쪽 틈을 봄. 여우는 한 걸음 더 간 뒤 멈춤 | 토끼의 머리 방향을 따라 여우도 고개를 들고 두 몸 사이 간격이 정리됨. 마지막 pose hold | 두 정지 시점이 구별되고 같은 대상을 보는 축이 생기는가. (a)(b)(c) |
| S02: 빛과 배의 변화가 분리됨 | 원형 오픈은 유지하되 배–등대 관계가 먼저 들어오는 중심/범위를 선택 | 빛이 한 번 신호 방향에 머문 뒤 배가 회전/감속. 변화 전후를 구별할 정지 간격 확보 | 바위 앞에 들이대지 않고 수면의 열린 틈에 배를 남김. 광선·돛·바위가 각기 읽히는 끝 구도 | 신호→반응→안정 위치가 보이는가. (b)(c) |
| S04: 선 생성이 펼침 행동을 대신함 | 전신을 일찍 읽히게 하고 마지막 걸음과 정지. 편지가 있는 손을 알아볼 수 있게 함 | 머리가 손 쪽으로 먼저 기울고 양손이 접힌 모서리를 잡은 다음 벌어짐 | 종이를 조금 몸 쪽으로 당겨 시선축에 놓고 읽기 pose hold | 외곽선 출현을 보지 않아도 손과 종이 형태로 펼침을 읽는가. (a)(b)(c) |
| S05: 그림자 예고는 있으나 전신이 갑자기 등장 | 빈 플랫폼, 문에서 이어지는 그림자를 첫 주목점으로 두고 벤치를 보조로 낮춤 | 그림자가 자란 뒤 문틀 가림에서 인물이 나오고, 열차 등장 전에 인물 위치를 잠시 읽힘 | 열차 접근에 인물이 고개/몸을 돌리고 멈춤. 열차와 인물 모두 식별되는 두 대상 구도로 종료 | 인물의 실루엣 출현·진행·반응이 분리되는가. 탑승까지 강요하지 않음. (a)(b)(c) |
| S06: 처음과 끝에 같은 정보가 동등하게 나옴 | 기존 정물에서 잎의 겹침 한 곳을 명암으로 주대상화 | 현재 빛 이동을 이용해 그 잎의 앞/뒤 면과 겹침 경계를 드러냄. 카메라는 이 변화에 도움이 되는 경우만 이동 | 새로 드러난 면/틈을 남긴 채 hold. 작은 표본의 움직임은 보조로 낮춤 | 단순 각도 변경과 형태 정보 공개가 구분되는가. (a)(c) |

**P/F: 제작 목적에 맞춘 제한적 판정**

| 클립·실제 관찰 근거 | 유지할 점과 목적별 판정 | 보완 제안 → 검토 기준 |
|---|---|---|
| P01 f26→190, [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P01/overview.jpg) | 단독 파란 영역이 퍼지는 변화가 다른 요소에 방해받지 않음. 재료 동작 시연으로 유효. 서사/카메라 추가 불필요 | 셀/물감 경계를 확인할 확대와 전체를 함께 제시 (c). 확대에서 물감 경계 변화와 단순 투명도/크기 변화를 구분 가능한가. 물리 정확성은 이번 검토 미확인 |
| P02 f50→190 및 [f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/P02-f096.jpg) | 두 색 투입과 접경의 변화가 읽힘. 비교 연구로 유효 | 원본에도 사각 셀이 선명하므로 완성 수채 클로즈업으로 즉시 사용할 품질이라고 보기는 어려움. 표시 해상도/저작 출력 조건을 먼저 확인 (c), 공용 표현 한계 여부 (d)는 미확인. 동일 구도에서 접경의 불규칙성과 매체 결이 보이는지 재검토 |
| P03 f0→64→114, [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P03/overview.jpg) | 팔의 상승/하강 실루엣이 배경에서 분리됨. 리그 구동 제시로 유효 | 변형 비교가 목적이면 현재의 시점 변화와 별도로 고정각 비교 구간을 둠 (c). 관절 변화와 카메라 원근 변화를 구별 가능한가. 연기 감정 부족을 실패로 평가하지 않음 |
| P04 f0→50→102, [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P04/overview.jpg) | 넓은 체형과 다리 벌어짐 차이를 읽을 수 있음. 기능 시연으로 유효 | 바닥 그리드 기준은 유지하고 발바닥/골반이 보이는 고정 3/4 구간을 선택 (c). 좌우 하중을 판정할 충분한 투영 정보가 있는가. 현재 샘플만으로 foot slide 단정 안 함 |
| P05 f0–190 overview 및 [f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/P05-f096.jpg) | 세 체형·색 구분·좌우 대응과 원본 라벨은 명확함. 비교판으로 유효. ‘작다’는 축소판 첫 인상은 원본에서 수정 | 정면은 앞뒤 보폭과 접지를 압축하므로, 같은 보행 위상의 측면/3/4 보조 구간이 유용 (c). 전진·발 접촉과 체형 차이를 함께 읽을 수 있는가. 미세 cadence/IK 성능은 판정하지 않음 |
| P06 f14·42·86·128 등 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/P06/overview.jpg) | 팔이 큰 각도로 올라갔다 내려오고 세 체형의 대응을 비교하기 쉬움. 기능 시연으로 유효 | 필요하면 최대 pose에서 손–머리 관계를 같은 각도로 잠시 제시 (b)(c). 같은 인사 동작이 체형마다 어느 부분에서 달라지는지 읽히는가. 완성 인물 연기로의 전환은 별도 자산/연기 저작 필요 |
| F01 overview 및 [f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/F01-f096.jpg) | 6칸과 제목으로 기능을 분리하고 원본 크기에서 라벨이 읽힘. 기술 비교판으로 적합 | 원색 패널이 작고 옅은 emitter보다 우세. 발표용이라면 해당 칸을 순서대로 강조하거나 개별 카드도 제공 (c). 작은 효과의 시작·끝을 다른 패널의 고채도 색에 빼앗기지 않고 찾는가. 이야기·공간 깊이 부족을 실패로 평가하지 않음 |
| F02 overview 및 [f96](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/cinematography/F02-f096.jpg) | 네 물체의 외형·재질과 이동하는 명암을 분리 관찰 가능. 무대/지면 부재는 isolation 목적에 적합 | 잎과 박스가 겹쳐 색/그림자의 원인을 오독할 수 있고 기능별 명칭이 화면에 없음. 간단한 대상 라벨과 단독→겹침 순서 권장 (c). 어떤 물체의 어떤 차이를 보는지 알 수 있는가 |
| F03 [overview](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-cinematic-animation-review/F03/overview.jpg), f0–190 중 16점 | 실제 정물 안에서 여러 표면·빛이 함께 작동하는 통합 구도. 기능 통합 시연으로 유효 | S06과 유사한 전체 인상 외에 2D/3D 혼합의 차이를 이 샘플링만으로 분리하지 못함. 주목할 합성 경계나 전후 비교를 특정하는 제시 방식 (c)이 필요. 미세 overlay 결함/정렬의 존재 여부는 미확인 |

**원인 확인: 현재 recipe·자산과 공용 도구 범위를 분리**

다음은 독립 관찰 뒤 현재 저장소를 읽어 확인한 범위다. 현재 recipe가 해당 MP4의 렌더 당시 소스와 바이트 단위로 같은지는 별도로 검증하지 않았으므로, 화면의 증거를 대체하지 않는 원인 설명이다.

- **S01/S02 배치·관계는 우선 recipe 문제다.** [forest recipe](/Volumes/eyedisk/develop/cinewright/recipes/styles/silhouette-theatre/forest.json)는 여우의 위치를 f104 이후, 토끼의 위치를 f80 이후 유지한다. 카메라는 별도 f192 키까지 이동한다. [harbor recipe](/Volumes/eyedisk/develop/cinewright/recipes/styles/silhouette-theatre/harbor.json)의 배 이동 키와 광선 회전 키는 독립적으로 저작되어 있다. 이는 관찰한 ‘후반 정지 뒤 카메라만 남는 인상’ 및 ‘신호와 배 행동 연결 부족’과 부합한다. [silhouette 모듈](/Volumes/eyedisk/develop/cinewright/modules/styles/silhouette-theatre/index.mjs)은 별도 pose bank, transform, exposure와 plane depth를 이미 처리한다. 반응의 의미는 새 엔진보다 pose와 배치 저작 **(a)(b)(c)**에서 먼저 해결할 수 있다.
- **실제 확인한 제한 (d): 2D shot의 보간 선택은 좁다.** [shot.mjs](/Volumes/eyedisk/develop/cinewright/modules/animation/shot.mjs)의 `evaluateShot`은 x/y/zoom을 키 사이 선형 보간한다. 다양한 카메라 가감속을 직접 선택하는 인터페이스는 이 함수에 없다. 키를 더 저작하거나 고정 카메라를 쓸 수 있으므로, 이번 장면의 의미 부족을 이 제한 탓으로 돌릴 수는 없다. 필요성이 확인될 때만 비트별 hold·가감속 저작 편의가 공용 지원 후보가 된다.
- **S03/S04는 선·색면 저작과 정보 순서가 먼저다.** [rain recipe](/Volumes/eyedisk/develop/cinewright/recipes/styles/line-wash/rain.json)에는 수면 f50–100, 줄기 f55–100, 잎과 잎맥의 후속 출현 시간이 따로 있다. [commuter recipe](/Volumes/eyedisk/develop/cinewright/recipes/styles/line-wash/commuter.json)의 접힌 종이 f82–105와 펼친 종이 f115–147은 주로 선 진행으로 등장한다. [line-wash 모듈](/Volumes/eyedisk/develop/cinewright/modules/styles/line-wash/index.mjs)은 stroke bank와 지우기·wash 출현을 지원한다. 손/머리/접힘 상태를 저작하는 것이 **(a)(b)**의 핵심이며, 순서는 **(c)**다. 이 style의 draw 경로에 별도 카메라 파라미터가 없다는 것은 확인했지만, 전체 시스템이 확대/편집을 못 한다는 뜻은 아니다. group transform·접힌 소품의 상태 저작은 제작 편의 요구로 기록하되 신규 구현 필요 여부는 미확인이다.
- **S05 출현과 이동은 공용 툴의 필연적 한계가 아니다.** [station recipe](/Volumes/eyedisk/develop/cinewright/recipes/styles/expressionist-space/station.json)에 traveler `visible:[88,192]`가 있고 f88의 위치는 문 앞이다. 앞선 그림자는 독립 polygon overlay이며 길이 키를 갖는다. 화면의 f87→88 출현과 맞는다. 실제 가림 뒤에서 이동시키는 배치, 시야에서 먼저 보일 부위, 기둥/문 자산과의 관계는 **(a)(b)(c)**에서 해결할 수 있다. [expressionist 모듈](/Volumes/eyedisk/develop/cinewright/modules/styles/expressionist-space/index.mjs)은 카메라 position/target, 물체 transform/visible, light 키를 이미 처리한다. 문턱 통과를 자동 연출해 주는 도구는 아니며, 모델 파일에 clip 이름이 있다는 사실도 설득력 있는 걸음의 증거는 아니다.
- **S06 hatch 경쟁은 우선 material recipe와 UV/자산 문제다.** [laboratory recipe](/Volumes/eyedisk/develop/cinewright/recipes/styles/expressionist-space/laboratory.json)는 leaf strength 0.65, stone 0.58 등 여러 면에 강한 hatch를 배정하고 카메라·광원·잎 회전을 동시에 키로 움직인다. [material.mjs](/Volumes/eyedisk/develop/cinewright/modules/fx3d/material.mjs)에는 strength, frequency, ink, tone 조절이 이미 있다. 이를 낮추거나 면마다 다르게 저작하는 **(a)(c)**를 먼저 검토한다. 실제 공용 한계 **(d)**는 기본 atlas가 정해진 대각/교차무늬이고 표면 방향은 UV에 의존한다는 점이다. 자유로운 손맛·재료별 선 결을 자동 산출한다고 볼 수 없다. 기존 대비 조정으로 충분하면 공용 효과를 새로 만들 이유는 없다.
- **빛/그림자의 지원 범위와 연출 책임을 분리한다.** [light.mjs](/Volumes/eyedisk/develop/cinewright/modules/fx3d/light.mjs)의 graphic shadow overlay는 물리적 투영을 계산하는 것이 아니라 저작 polygon을 놓는 기능이다. 따라서 S05의 그림자-인물 연결을 자동으로 보장하지 않는다. 기본 gobo 패턴도 정해져 있다. 라이브러리는 밝기/방향·가림·재현 가능한 시간 평가를 제공하고, 누가 그림자의 주인인지와 언제 드러낼지는 **(c)**가 담당해야 한다.

제작용 recipe가 지원해야 할 범위는 **주대상 지정, 시선 대상과 행동축, 가림 전/중/후의 pose·화면 위치, 변화가 일어난 뒤의 hold, 최종 배치**다. 지원이라는 말은 반드시 새 API를 뜻하지 않는다. 현재 가능한 키·pose·material 조합을 이 항목별로 저작하고 검토할 수 있게 만드는 것이 먼저다. 비교용 P/F recipe에는 고정 기준각·동일 위상·확대 구간·효과 이름을 제공하는 편이 유용하다. 반대로 ‘감정’, ‘통근’, ‘길 찾기’, ‘늦음’은 파일명이나 파라미터만으로 생성되지 않는다.

**유지·우선 수정·선택 사항의 경계**

유지할 것은 S01의 크기가 다른 실루엣과 층위, S02의 좌우 항해축과 물결 가림, S03의 여백과 정적 마무리, S04의 행동을 펼칠 오른쪽 공간, S05의 그림자 선행 및 원근 동선, S06의 정물 규모 대비다. P/F의 비교판·단독 시험 구도도 유지한다.

우선 수정은 위 다섯 항목이다. 모두 관찰된 주목도·행동 연결·종결 구도에서 출발하며, 코드 테스트 수나 효과 수와 무관하다. S01/S02/S05는 기존 구조를 살려 수정하고, S04는 핵심 손·시선 행동을 재설계한다. S03은 목적에 따라 관계만 보강하고, S06은 정물 연구를 유지할지 사건 샷으로 재설계할지 목적부터 구분한다.

달–등대 접선의 도상적 사용, S03의 색면 어긋남, 3D 장면의 무대 모형 같은 외곽, 선택적인 인서트 컷은 취향·작품 의도에 따라 결정할 사항이다. 정적 hold나 한 샷이라는 이유로 실패 판정을 하지 않는다. 최종 리듬·정서 강도는 원속도 연속 감상과, 현재 미관찰인 native 구간을 포함한 후속 검토가 남아 있다.
