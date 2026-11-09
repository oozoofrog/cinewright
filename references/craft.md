# 장면의 기능을 빌리는 여섯 작법

아래의 **출처 내용**은 확인한 원문의 요약이다. **애니메이션 적용**은 Cinewright의 제작 판단이다. 원문은 기술 지원·영상 품질·관객 반응을 증명하지 않는다. 장·절·표제가 있는 자료는 그 위치로 찾는다. 확인하지 않은 쪽 번호를 붙이지 않는다.

배우가 몸으로 연기하는 영화·연극·뮤지컬을 그대로 재현할 필요는 없다. 초점 이동, 관계 변화, 기대와 생략을 컷·원화·여백·사물·빛·형태·화면과 소리의 관계로 옮긴다. 배우의 이동이 담당한 초점 전환을 컷 순서나 여백 속 빛으로 만들 수도 있다. 작품에 필요한 인물과 명시된 가시적 행동은 유지한다. 한 작품에 여섯 분야를 모두 넣지 않는다.

작법을 고르기 전에 [대상 이해](direction.md#대상-이해)에서 정한 특징과 필수 행동을 확인한다. 구도·크기·재질·빛·여백, 소리와 움직임의 관계가 그 대상을 드러내도록 작법을 선택한다. 인간 배우의 무게 이동이나 옷의 후행을 모든 대상에 그대로 붙이지 않는다. 실제 숏이 선택한 대상으로 읽히는지 별도로 검토하며, 오르골 관련 조건은 [조건부 참고](music-box.md)를 따른다.

## 영화 — 보는 순서로 관계를 드러내기

**출처 내용.** Alfred Hitchcock은 《Sabotage》의 식탁 장면에서 손·눈·칼·반응의 편집을 설명한다. 다른 인물의 목소리 동안 한 인물의 화면을 유지하는 방법도 다룬다. 이는 Hitchcock의 방법이며 연속 숏을 금지하는 법칙이 아니다.

- **상황·목적:** 작은 물건과 인물의 반응 사이에 중요한 인과관계가 있을 때.
- **애니메이션 적용·단서:** 전체 공간, 물건의 세부, 뒤따른 반응의 순서를 선택한다. 크롭 전후의 방향·물건 형태로 같은 사건임을 알린다. 요구된 행동의 과정을 단순 반응 숏으로 대신하지 않는다.
- **현재 구현·자산:** `compileCuts`의 exposure/value와 points, `artwork.prepare`의 crop·anchor. 전체 원화와 세부 크롭 또는 반응 원화가 필요하다. 목소리를 쓰면 별도 오디오 자산과 배치가 필요하다.
- **실패 관찰:** 해설 없이 어떤 물건이 누구의 반응을 일으켰는지 연결되는가. 잘린 손이 다른 인물처럼 보이거나, 컷 사이에서 필수 행동이 사라지지 않는가.
- **원문:** Alfred Hitchcock, [Alfred Hitchcock: my own methods](https://www.bfi.org.uk/sight-and-sound/features/alfred-hitchcock-my-own-methods), BFI / Sight and Sound. 《Sabotage》의 식탁·칼 설명 및 **Getting the audience into the picture** 절. 웹 문서, 쪽 번호 없음.

## 만화 — 사이에 생략한 사건을 추론하게 하기

**출처 내용.** Jessica Abel과 Matt Madden의 학습 안내는 패널 사이의 추론을 설명하며 closure 개념을 Scott McCloud에게 귀속한다. 패널 사이 시간, 보이는 대상과 장면 변화도 질문한다. 여기서 확인한 자료는 두 저자의 안내이며 McCloud의 책 전체가 아니다.

- **상황·목적:** 이동의 모든 순간보다 전후 관계와 기다림이 중요하고, 중간 동작이 필수 조건이 아닐 때.
- **애니메이션 적용·단서:** 앞 상태를 읽을 hold, 빈 공간, 뒤 상태의 원화를 연결한다. 방향·물건·정체성 중 필요한 공통 단서를 남긴다. 패널 여백의 폭을 고정 프레임 수로 환산하지 않는다.
- **현재 구현·자산:** 서로 다른 길이의 컷과 명시적 `empty: true`, hold sampling, 공유 원화. 빈 exposure는 해당 레이어의 생략이므로 배경까지 비우려면 별도로 설계한다.
- **실패 관찰:** 의도한 생략인지 자산 누락인지 구분되는가. 행동의 주체·방향이 뒤바뀌거나, 반드시 보여야 할 움직임까지 관객 추론에 맡기지 않았는가.
- **원문:** Jessica Abel·Matt Madden, [Student guide chapter 4: Bridging The Gap](https://dw-wp.com/2010/03/chapter-4-bridging-the-gap/), *Drawing Words & Writing Pictures*. 도입, **Prep questions**, **Homework → Closure comics**, **Extra credit / Resources → Five-card Nancy**. 웹 문서, 쪽 번호 없음.

## 철학 — 앞뒤 경험 안에서 지속을 판단하기

**출처 내용.** Henri Bergson은 계량하여 나란히 놓은 시간과 질적으로 경험하는 지속을 구별한다. 서로 이어져 하나의 전체로 들리는 음들을 예로 쓴다.

- **상황·목적:** 같은 정지 화면이 앞선 사건 때문에 다르게 경험되는지 검토할 때.
- **애니메이션 적용·단서:** 행동 전의 빈 탁자와 행동 후 열쇠가 남은 탁자를 각자의 순서·길이로 본다. 기다림이 무엇을 향하는지 바뀌는 지점을 찾는다.
- **현재 구현·자산:** 정수 프레임의 points·spans와 원래 타이밍의 전체 `play`·`review`. 별도 시간 엔진이나 자산은 필요하지 않다.
- **실패 관찰:** 같은 프레임만 맞춰 비교하여 전개 차이를 지우지 않았는가. 긴 hold를 의도라고만 부르면서 단서가 읽히지 않는 시간을 방치하지 않았는가.
- **한계:** 철학적 관점을 제작 판단의 질문으로 사용한다. 검증된 지각·심리·신경과학 법칙이나 정수 프레임 규약의 대체로 제시하지 않는다.
- **원문:** Henri Bergson, F. L. Pogson 번역, [Time and Free Will](https://www.gutenberg.org/files/56852/56852-h/56852-h.htm), **Chapter II**, 인쇄면 **100–106쪽**의 지속·이어지는 음 논의. HTML의 해당 쪽 표기를 확인했다.

## 시각예술 — 형태와 남은 여백을 함께 보기

**출처 내용.** MoMA의 Matisse 작품 해설에서 Karl Buchberg는 잘라낸 형태와 그 주위에 남은 형태가 구성에서 함께 작동함을 설명한다.

- **상황·목적:** 작은 사물 하나와 빈 공간의 관계로 시선 순서를 만들 때.
- **애니메이션 적용·단서:** 사물의 실루엣·명암과 주변 여백을 함께 정한다. 빛·질감이 주인공의 형태를 덮는지 확인한다. 여백을 기본 카메라 이동이나 효과로 채우지 않는다.
- **현재 구현·자산:** 투명 SVG/PNG, crop·균일 scale·contain/cover, 기존 opacity·blend. 필요한 경우 작품 코드에서 빛을 따로 그린다.
- **실패 관찰:** 실제 재생 크기에서 형태가 읽히는가. crop 때문에 대상이 잘리거나 배경 대비·빛이 초점을 빼앗지 않는가. 작은 anchor 일치만으로 실루엣 일관성을 통과시키지 않는다.
- **원문:** MoMA, Glenn Lowry·Karl Buchberg·Jodi Hauptman, [Henri Matisse. Composition, Black and Red. 1947](https://www.moma.org/audio/playlist/6/307), *Henri Matisse: The Cut-Outs*, 오디오 대본 **7/18**, 작품 표제 아래의 양·음 형태 설명. 웹 대본, 쪽 번호 없음. 원문은 애니메이션 타이밍 규칙을 제시하지 않는다.

## 연극 — 정지한 배치에서도 관계를 읽기

**출처 내용.** Royal Shakespeare Company는 자세·집단 배치·정지 장면으로 인물의 관계와 편을 탐색하는 활동을 설명한다. 《Macbeth》 자료는 정지한 관계를 비교하고, 언어를 더한 뒤 다시 보며, 물리적 거리로 감정의 강도를 표현하는 활동을 다룬다.

- **상황·목적:** 대사나 연속 이동이 없어도 누구와 무엇이 가까워지거나 멀어졌는지 보여야 할 때.
- **애니메이션 적용·단서:** 몸·사물의 방향과 거리, 원화 사이의 가림, 빈 자리를 바꾼다. 초점 전환에 빛이나 화면 밖 소리를 선택할 수 있지만 이는 이 문서의 적용 판단이다. 인물이 필요한 장면을 사물로 임의 대체하지 않는다.
- **현재 구현·자산:** 인물·사물 원화, anchor 배치, layer z, exposure와 작품 코드의 빛. 필수 몸짓이 있으면 그 동작을 보여 줄 원화나 결정적 움직임을 만든다.
- **실패 관찰:** 거리·방향·접촉이 화면에서 보이는가. 배치만 바꿔 관계가 달라진 것인지, 서로 다른 인물이 된 것인지 구분되는가. 좌석·신발 접촉과 가림이 교체 전후로 끊기지 않는가.
- **원문:** Royal Shakespeare Company, [Example Activities for the Classroom](https://www.rsc.org.uk/learn/schools-and-teachers/teacher-resources/rehearsal-room-approaches-to-shakespeare/example-activities-for-the-classroom), **3. Discovering the characters → Sculpting**. [Macbeth teacher pack (2011)](https://cdn2.rsc.org.uk/sitefinity/education-pdfs/teacher-packs/edu-macbeth-teacherpack-2011.pdf?sfvrsn=2), **ACTIVITY: Instant images**, 인쇄면 **5쪽**, 후반의 **ACTIVITY: Emotion Imaging**. 후자의 쪽 번호는 특정하지 않았다. 이 출처에 조명 규칙을 귀속하지 않는다.

## 뮤지컬 — 노래 안에서도 사건과 생각을 전개하기

**출처 내용.** Mark Horowitz는 특정 노래의 초점 인물이 리허설에서 바뀌었고, 짧은 프레이즈가 Glynis Johns의 발성 조건과 연결되며, 스케치에 인물의 속뜻이 남아 있음을 설명한다. Peter Darling은 뮤지컬 넘버에서도 이야기가 계속되어야 하며 가사의 상황·목적·행동을 읽고 움직임을 주제와 연결한다고 말한다. Blustein의 연구 초록은 반복 음악이 맥락과 가사 등의 변화로 다른 극적 의미를 얻는 유형을 분석한다.

- **상황·목적:** 노래의 프레이즈·쉼·생각의 전환이나 되풀이되는 선율이 사건과 내면을 바꾸는 작품.
- **애니메이션 적용·단서:** 화면 교체를 매 박자에 맞추기보다 프레이즈의 끝·숨·긴장과 이완·관계 변화에 연결한다. 리프라이즈에 같은 원화를 쓰면 이전 사건 때문에 무엇이 달라졌는지 보이게 한다. 안무의 기능은 형태·사물·컷의 관계로 옮길 수 있다.
- **현재 구현·자산:** 권한 있는 노래·자체 음원, 48kHz 샘플 배치, 명명한 points·spans, 원화·연속 모듈. 기존 오디오 시계와 gain·`normalize=0`을 유지한다. 보편적인 LUFS 목표나 별도 마스터링을 추가하지 않는다.
- **실패 관찰:** 리듬에 맞췄지만 사건은 멈춰 있지 않은가. 재현된 그림이 새 관계를 보여 주는가. 프레이즈·쉼을 침범하거나 끝을 자르지 않는가. 직접 듣지 못한 경우 청취 확인으로 기록하지 않는다.
- **원문 1:** Mark Horowitz, [Isn't It Rich?](https://loc.gov/lcm/pdf/LCM_2025_0910.pdf), *Library of Congress Magazine*, 2025년 9/10월호, 인쇄면 **19쪽**. 한 노래의 사례이며 보편적 규칙이 아니다. 가사는 인용하지 않는다.
- **원문 2:** Ayse Tashkiran, [Movement Directors in Contemporary Theatre: Conversations on Craft](https://crco.cssd.ac.uk/id/eprint/1717/1/9781350054479_web.pdf#page=142), Methuen Drama, 2020, **Chapter 10 Peter Darling**, 2018년 인터뷰, 인쇄면 **129–130쪽**.
- **원문 3:** Nathan Beary Blustein, [연구 초록](https://edspace.american.edu/nblustein/research/), **“Meet the Blob”: Solo-to-Ensemble “Reverse Reprises” in Merrily We Roll Along** (2018), **Playwriting in Song: “Reprise types” in Stephen Sondheim's Sweeney Todd** (2016). 연구자의 분석이며 Sondheim 저작의 직접 인용이 아니다.

[스틸컷의 선택·구현·검토](stillcuts.md) · [출처 확인 기록](../evidence/2026-11-05-production/research-notes.md)
