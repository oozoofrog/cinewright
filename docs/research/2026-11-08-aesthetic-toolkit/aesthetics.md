# Cinewright 미학 도구 연구 — 형태·시간·공간의 문법

작성/출처 확인: **2026-11-08**. 연구 전용. 구현·설치·prototype·테스트·렌더를 수행하지 않았다. 이 문서의 API 이름은 명시하지 않은 한 **설계 제안이며 현재 export가 아니다**. 부모가 실행 프롬프트를 작성하고 사용자가 확인한 뒤에만 구현한다. 전체 곡 확장은 범위 밖이다.

## 판단과 증거의 범위

추천 초기 구성은 **A 그림자 다중평면 극장(2D/2.5D), B 선·워시 드로잉(2D), C 표현주의 판화 공간(3D/NPR)**이다. A는 실루엣과 가림, B는 획과 지움의 시간, C는 조명·원근·표면 방향을 표현의 기본 단위로 삼는다. 팔레트 세 개가 아니라 데이터와 제작 행위가 다른 라이브러리다. 예산이 허용되면 D 직접 필름/기하학 음악을 독립 소형팩으로 추가한다. 처음부터 12개 완성을 목표로 하지 않는다.

직접 읽은 로컬 근거: 두 music-box-dancer handoff, references/{format,craft,direction,tools}.md의 도구 출력 범위(긴 합본 출력은 일부 잘림), scripts/materialize-kit.mjs의 catalog/소유권 처리, modules/motion.mjs 및 fx export·시간 참조, Showreel engine.js/fx.js/techniques.md/scenes.js의 앞부분. 기존 샘플을 이번 조사에서 재생하거나 시각 품질을 직접 검증하지 않았다. handoff의 통과 기록은 이전 작업자의 보고다.

Showreel 설치본은 REEL.scene/setup/render와 결정적 시간 함수, 실제 13종 FX, T01–T22 레시피를 구별한다. scenes.js도 API 예제이며 작품의 기본 템플릿이 아니라고 명시한다. [공식 저장소](https://github.com/revfactory/showreel)는 제작 워크플로를 제공하지만 영화별 완성 스타일팩이라는 근거가 아니다. 이번에는 웹 HEAD와 설치본의 바이트/커밋 동등성을 검증하지 않았으므로 동일 버전이라고 단정하지 않는다. 초 기반 이벤트 및 셔터 규약을 Cinewright 프레임 규약으로 그대로 복사하면 안 된다.

아래 출처의 작품 설명은 기관/제작자 주장이다. **각 계열의 규칙·알고리즘·우선순위는 그 설명에서 발전시킨 본 연구자의 설계 제안**이며 원작 제작 공정을 그대로 재현했다는 뜻이 아니다. 공식 작품 페이지·스틸·제작 자료를 1차 시각 참고 위치로 연결했다. 전체 영상 연속 시청 및 프레임별 측정은 하지 않았으므로 원작의 정확한 노출표·렌즈·컷 길이는 주장하지 않는다. 각 링크의 확인일은 모두 위 날짜다.

## 12계열 비교 연구

### 1. 실루엣/그림자 컷아웃 — 초기 A

대표: Lotte Reiniger, *The Adventures of Prince Achmed*. [미 의회도서관의 보존 프레임·제작 설명](https://blogs.loc.gov/inside_adams/2025/04/lotte-reiniger/)은 관절 실루엣과 적층 촬영대를 설명한다. 역사적 최초성의 세부 논쟁은 이 연구의 구현 근거로 삼지 않는다.

문법 제안: 검은 면의 외곽과 내부 구멍, 측면 몸짓, 인물 사이 음영 없는 간격이 표정을 대신한다. 관절 회전의 호, 준비→강조 자세→정지의 노출, 앞뒤 장막의 가림을 중심으로 고정 전경 또는 느린 횡이동 카메라와 장면 단위 컷을 사용한다. 입력은 구멍을 포함한 path, 관절 pivot, 자세표, 깊이별 배경이다. Canvas2D clip/복합 path, 계층 affine transform, 깊이별 이동과 뒤광 마스크가 핵심. 흐림·톤은 후처리 가능하나 실루엣 판독성과 관절 해부는 필터로 만들 수 없다. 작은 장식이 출력 축소에서 사라지는 것이 주요 한계다.

### 2. 종이/콜라주 — A 이후 확장

대표: Martha Colburn, *Triumph of the Wild*. [MoMA 소장 기록](https://www.moma.org/collection/works/130870)은 콜라주와 인형이라는 매체를 명시하며 [작가의 스틸](https://marthacolburn.com/still/)은 회화·콜라주 재료 참고다.

문법 제안: 이질적 사진·그림 크기를 일부러 충돌시키고 잘린 가장자리와 겹침을 노출한다. 공간은 원근의 통일보다는 조각의 배치로 만든다. 교체 자세, 가위식 회전, 짧은 점프와 정지를 사용하고 카메라는 복사대 또는 제한된 층 이동, 컷은 의미 충돌에 둔다. 입력은 alpha 조각, 앞/뒤 면, 절단선, 원출처·권리, 교체표다. Canvas mask, 가장자리 거리장, 약한 두께/접촉 그림자, replacement scheduler가 필요하다. 종이 grain은 후처리 가능하지만 조각 분할·콜라주의 의미는 불가능하다. 자동 그림자 과용은 평평한 그래픽을 값싼 카드 UI로 만든다.

### 3. 수묵/수채 워시 — 초기 B의 제한 구현

대표: Caroline Leaf, *The Street*. [NFB 작품 설명](https://www.nfb.ca/film/the_street/)은 수채와 잉크 워시를 명시한다. 이를 동아시아 수묵 전통 전체와 동일시하지 않는다. 수묵의 서예적 붓 운용은 별도 작가·필법 조사와 자산이 필요하다.

문법 제안: 여백, 번진 경계, 농도 중첩, 선보다 덩어리의 출현·소멸을 우선한다. 고정 화면 안에서 형태 변형으로 공간을 연결하고 정지 시간을 충분히 둔다. 카메라 줌보다 번짐/지움 전환을 사용한다. 입력은 stroke 중심선·압력·폭·시각, 색소/종이 텍스처, 영역 마스크, authored 변형 키다. seed 고정 dab stamp, edge pooling 근사, alpha glaze가 1차 도구다. [Curtis 등 저자 프로젝트](https://grail.cs.washington.edu/projects/watercolor/)의 모델은 얕은 물 시뮬레이션과 Kubelka–Munk 합성의 다층 glaze다. 이것을 단순 blur와 동일하다고 부르지 않는다. 후처리는 이미 존재하는 면의 경계·종이 질감까지만 가능하다. 젖음의 역사를 가진 유체는 seek 가능한 bake/checkpoint가 필요하므로 후속이다.

### 4. 판화/해칭 — 초기 C의 표면 체계

대표 자료: Praun·Hoppe·Webb·Finkelstein의 [Real-Time Hatching 저자 페이지·결과 이미지](https://gfx.cs.princeton.edu/proj/hatching/). 역사적 판화와 이 CG 방법은 구분한다.

문법 제안: 큰 흑백 덩어리와 물체 방향을 따르는 선 밀도, 밝은 여백, 선이 잠식하는 암부를 사용한다. 공간은 원근·법선·명암으로 읽히되 재질은 선으로 만든다. 노출된 자세를 유지해 선의 기어다님을 억제하고 천천히 도는 카메라·명암 매치 컷을 쓴다. 입력은 UV/방향장, 톤별 hatch atlas, geometry, 조명이다. 논문의 tonal art map은 톤과 해상도 사이 획 일관성을 준비한다. 초기 구현은 저작 UV와 제한된 atlas blend로 좁힌다. 화면 해칭 후처리는 평면 포스터에는 가능하지만 표면 고정과 곡률 추종에는 부족하다. 자동 곡률 기반 patch 구성은 후속이다.

### 5. 현대 그래픽/UPA 계열 셀 — 후속 후보, 역사 근거 보강 필요

후보 작품은 UPA/John Hubley의 *Rooty Toot Toot*이나 이번 탐색에서는 충분한 공식 작품·제작 자료를 확보하지 못했다. 따라서 원작 분석을 완료했다고 주장하지 않는다. 검증된 대체 비교 자료는 [NFB의 Ryan Larkin, Walking](https://www.nfb.ca/film/walking/?ctlgsrc=mr): 선화와 색 워시로 다양한 걸음을 표현한다는 설명이다. 이 작품을 UPA 작품이라고 분류하지 않는다.

제안 문법은 비대칭 색면, 선과 채색의 의도적 어긋남, 생략된 배경, 선택적 신체 움직임이다. 공간은 기호적 무대, 움직임은 hold/강한 breakdown/짧은 smear, 카메라는 정면 배치와 그래픽 매치 컷이다. 입력은 자세별 벡터, 색면, 입/눈 교체표, 노출표. shape substitution, sparse rig, smear shape가 필요하다. 색 분리 후처리는 가능하지만 포즈 디자인·타이밍 생략은 불가능하다. 모든 동작을 같은 twos로 낮추는 방식은 이 문법을 충족하지 않는다.

### 6. 직접 필름/기하학 음악 — 선택적 초기 D

대표: McLaren·Lambart의 *Begone Dull Care*. [NFB 제작·소장 설명](https://collection.nfb.ca/film/begone_dull_care)은 Oscar Peterson Trio 음악에 맞춰 필름에 직접 칠하고 새겼다고 명시한다.

문법 제안: 화면을 공간의 창보다 시간의 악보로 본다. 점·긁힘·띠·색면의 밀도와 방향을 성부별로 배정하고 반복→변주→휴지를 둔다. 카메라는 없어도 되며 컷은 모티프 교체다. 입력은 phrase/cue, 저작 motif 경로, seed, 밀도·빈 공간 곡선이다. analytic oscillator, stroke reveal, 도형 격자 변형, 결정적 scratch가 핵심. grain은 후처리 가능하나 음악 구문과 모티프 발전은 불가능하다. onset마다 원을 터뜨리는 오디오 시각화로 축소될 위험이 있다.

### 7. 표현주의/누아르 공간 — 초기 C의 연출 체계

대표: *The Cabinet of Dr. Caligari*. [BFI 아카이브 기관 해설](https://www.bfi.org.uk/features/100-years-cabinet-dr-caligari)은 표현주의 세트 디자인을 강조한다. 누아르 전체를 이 작품 하나로 대표하지 않고, 초기 구현 이름을 표현주의 공간으로 좁힌다.

문법 제안: 비뚤어진 문·압박하는 벽·과장된 그림자로 심리적 공간을 만든다. 인물의 작은 이동과 길어진 그림자의 큰 변화를 대비한다. 원근은 의도적으로 왜곡하고 카메라는 고정 tableau와 제한된 dolly, 컷은 문턱·시선·암부의 연결에 둔다. 입력은 변형 가능한 세트 geometry, 인물 proxy, light/gobo, shot별 투영·구도. Three.js camera/geometry/그림자와 별도 저작 shadow decal, 톤 분할, 해칭을 조합한다. 대비와 vignette만 후처리로 가능하다. 공간 왜곡·차폐·그림자 동선은 모델과 조명 데이터가 필요하다. 모든 컷을 Dutch angle로 만드는 것은 연출 대체물이 아니다.

### 8. 스톱모션 재질 — 후속 독립팩

대표: LAIKA, *Coraline*. [공식 협력 전시의 인형 자료](https://www.laikahiddenworlds.com/coraline), [LAIKA 제작 영상](https://www.youtube.com/watch?v=LjpZatodaKA)은 제작된 인형이 핵심 자산임을 보여준다.

문법 제안: 재료별 두께·모서리·표면 흔적, 실제 지지되는 관절, 접촉 그림자, 작은 세트의 공간을 만든다. 재료가 점토인지 종이인지 모형인지 먼저 정한다. 자세별 hold와 비균일 노출, 관성의 선택적 생략, 제한된 초점과 촬영 위치, 물체 행동을 잇는 컷을 사용한다. 입력은 mesh/rig, replacement 얼굴, scale, UV·normal·roughness, 접촉점. Three PBR+pose replacement+stable surface noise가 필요하다. 후처리는 미세 grain/노출 흔들림까지만 가능하다. fps 저하와 범용 noise는 촉각·무게를 만들지 못한다. 현재 도자기 샘플은 출발 자산일 뿐 범용 인형 시스템의 증거가 아니다.

### 9. 초현실 변형 — B/C 이후

대표: Jacques Drouin, *Mindscape*. [NFB](https://www.nfb.ca/film/mindscape/)는 pinscreen과 그림 속으로 들어가는 작가를 명시한다. 추가로 [Chris Landreth의 Ryan](https://www.nfb.ca/film/ryan/)은 CG 인물로 인터뷰를 구성한다. 두 작품의 기법을 동일시하지 않는다.

문법 제안: 원인이 되는 형상 일부를 남기면서 다른 사물로 읽히게 한다. 액체 같은 변형 중간에 읽히는 자세를 두고 공간 자체를 전환으로 이용한다. 카메라는 변형의 기준점을 유지하고 컷은 유사 윤곽/의미에 둔다. 입력은 대응점·중간 키·위상 변경 이벤트·가림 마스크다. path resampling, SDF blend, mesh morph target, 교체 마스크를 구분한다. 단순 dissolve는 가능하지만 구멍 생성·사지 분기·의미 있는 중간형은 자동 필터로 해결되지 않는다. 임의 mesh morph를 범용 기능이라고 약속하지 않는다.

### 10. 로토스코프/스케치 — B 확장

대표 비교: Larkin의 [Walking](https://www.nfb.ca/film/walking/?ctlgsrc=mr)은 관찰된 걸음과 선/색 표현 자료이지 이 페이지만으로 로토스코프 공정을 입증하지 않는다. Disney의 [Paperman 공식 작품](https://www.disneyanimation.com/shorts/paperman/)과 [제작자 논문](https://media.disneyanimation.com/uploads/production/publication_asset/122/asset/pman.pdf)은 선과 CG 결합의 별도 조사 출발점이다. 후자 논문 본문은 이번에 정독하지 않았으므로 내부 알고리즘을 검증했다고 주장하지 않는다.

문법 제안: 무게중심·접지·개별 걸음의 리듬을 유지하며 선을 생략한다. 카메라는 원본 참조 또는 설계된 shot에 묶고, 주요 자세를 충분히 노출하며 행동 연결 컷을 쓴다. 입력은 권리 있는 reference 영상/포즈, 수동 landmark, stroke correspondence, 노출표다. 선 보간과 자세별 redraw bank를 제공하되 영상 자동 추적은 후속이다. 윤곽 필터는 질감 흉내까지만 가능하고 해부·연기·가려진 선 복원은 불가능하다.

### 11. 망점/리소/만화 NPR — C 후속

대표: *Spider-Man: Into the Spider-Verse*. [Sony Imageworks 제작 설명·breakdown](https://www.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse)은 사실성보다 작가의 디자인 의도를 강조한다. 리소그래프 인쇄와 영화 제작법이 동일하다는 뜻은 아니다.

문법 제안: 제한된 색판, 점·선의 명암, 수동 강조선, 피사체별 노출을 조합한다. 공간은 3D지만 인쇄 기호가 깊이 정보를 보충한다. 카메라와 인물의 노출을 분리하고 action pose/그래픽 insert로 컷을 구성한다. 입력은 색분판·material ID·depth/normal·UV·선 자산·노출표. screen/object anchored halftone, 판별 registration offset, 선택적 contour가 필요하다. 고정 화면의 망점은 후처리 가능하나 안정된 표면선·포즈·컷은 불가능하다. 작은 점의 moiré와 카메라 이동 시 swimming이 품질 한계다.

### 12. 다중 평면/2.5D — A의 공간 기반, 독립 미학으로 과대계산 금지

대표: Reiniger의 [적층 촬영 자료](https://blogs.loc.gov/inside_adams/2025/04/lotte-reiniger/), Colburn의 [작가 진술에 포함된 multiplane glass stand](https://www.headlands.org/artist/martha-colburn/).

문법 제안: 전경의 큰 가림, 중경 행동, 후경의 느린 변화로 공간을 만든다. 카메라 이동 중 인물은 노출을 유지할 수 있고, 층 사이로 드러나는 사건을 컷의 동기로 삼는다. 입력은 depth가 붙은 alpha plane, 확장 여백, 피벗, 카메라 경로, 가림 규칙. affine parallax 또는 Three plane projection과 frustum coverage 계산이 필요하다. 한 장 그림의 zoom은 후처리 가능하지만 새로 드러날 배경과 진짜 가림은 불가능하다. 2.5D 자체는 기법이므로 스타일 수를 늘리는 별도 이름표로 세지 않는다.

## 초기팩의 실제 제공 기능과 재사용 증거

다음은 구현 후 충족할 요구이며 이번에 만든 기능이 아니다. 데모는 작품 장면을 복제하지 않는 새 내용으로, 같은 라이브러리 export를 사용하고 주로 데이터·자산·연출만 바꿔야 한다.

### A. 그림자 다중평면 극장

필수 코드: 구멍 있는 silhouette shape; pivot/부모 계층과 관절 제한; pose library와 hold/interpolate 구분; 인물 silhouette 겹침 진단; plane depth와 카메라 투영; 전경 가림; 장막 전환; 뒤광 halo; seed 고정 종이 가장자리; 화면 밖 노출 영역 진단. 그림자 puppet와 물체가 바닥에 드리우는 shadow를 별도 타입으로 둔다.

제안 API 데이터: `prepare({shapes, rigs, poses, exposure, planes, shots, cues, seed}) → {evaluate(t, channels), draw(target,state)}`. A의 draw는 Canvas2D 우선. geometry/자산 생성은 prepare, 자세·투영은 evaluate, 화면 합성만 draw에 둔다.

데모 1: 숲에서 길을 찾는 두 동물—가림과 서로 다른 보행. 데모 2: 항구에서 배를 인도하는 등대—인물 없이 파도층·회전 빛·원경 이동. 둘 다 종이 무대의 똑같은 춤을 재장식하는 것이 아니어야 한다. 판독 가능한 실루엣, 깊이감, 전경이 열리는 사건이 승인 기준이다.

### B. 선·워시 드로잉

필수 코드: 압력/폭/시간이 있는 stroke; 길이 기반 reveal; seed 고정 dab; 종이 좌표에 고정한 grain; 획별 redraw bank; authored path correspondence 검증; glaze와 edge pigment 근사; 지우기 mask/event ledger; 지운 흔적의 강도; 정지/재그리기 노출표. 초기에는 물리 유체 대신 명시적으로 이름 붙인 근사 재료를 제공한다.

제안 데이터: `strokes[{id,points,pressure,width,from,to,redraws}], washes[{mask,pigment,opacity}], erasures[], exposure, paper, seed`. 과거를 누적 그리는 canvas를 evaluate의 숨은 상태로 쓰지 않는다. 지움은 사건 목록에서 재구성하거나 prepare에서 고정 상태 atlas로 준비한다.

데모 1: 비가 멈추며 잎과 물웅덩이가 나타나는 정물—워시와 여백. 데모 2: 통근자가 걷다가 편지를 펼치는 인물 장면—접지·선 생략·지움 전환. 원·선 자동생성만으로 인물 품질을 해결했다고 하지 않는다. 두 번째 데모를 위해 포즈 저작 자산이 실제로 필요하다.

### C. 표현주의 판화 공간

필수 코드: shot별 세트 변형 파라미터; orthographic/perspective 카메라; 재사용 가능한 문·계단·복도 geometry; gobo/저작 shadow; 제한된 톤 ramp; UV 고정 hatch atlas; 외곽/내부선 선택; 인물과 카메라의 독립 노출; 안개 depth 합성; 카메라 안전 영역; 선 밀도 LOD. 초기엔 단순 세트/정적 표면 중심으로 제한하고 임의 skinned mesh의 완벽한 선 추적을 제외한다.

제안 데이터: `sets, surfaces[{hatchAtlas,uvScale,toneRamp}], lights, shadowDecals, actors, exposure, shots`. Three.js 0.180.0에 맞는 adapter를 고정한다. [r180 MeshToonMaterial 원본](https://raw.githubusercontent.com/mrdoob/three.js/r180/src/materials/MeshToonMaterial.js)에서 gradientMap과 nearest filtering 지침을 확인했다. toon 재질만으로 해칭·외곽선·연출이 제공되지는 않는다. [현재 공식 문서](https://threejs.org/docs/)는 이동하는 최신 문서이므로 최신 TSL/WebGPU 예제를 r180 WebGL에 호환 확인 없이 가져오지 않는다.

데모 1: 좁은 역의 마지막 열차—인물보다 먼저 도착하는 긴 그림자와 원근. 데모 2: 식물 연구실의 거대한 잎—인물 없이 곡면/겹침/이동 조명. 두 내용에서 같은 해칭 표면·카메라·조명 도구가 쓰여야 한다. 회전 시 선이 표면에 붙어 있는지, 암부에서도 행동이 읽히는지를 판단한다.

### D. 선택 가능한 소형 추가팩

직접 필름 모티프/phrase compositor: motif registry, 음악 구간별 변주, 면적·밝기 예산, analytic trail, scratch, pause. 데모는 타악 중심 기하학 대화와 느린 현악 중심 선의 성장으로 대비한다. 자산 부담이 적지만 이것만 먼저 끝내면 인물/공간 문제를 다시 미룰 수 있다.

## 스타일 스킬과 JS 도구의 경계

스킬은 무엇을 왜 선택할지 판단한다. 예를 들어 A 스킬은 ‘손과 얼굴을 배경에서 분리하고 중요한 제스처를 silhouette로 읽을 시간을 확보하라’, B는 ‘워시의 빈 공간을 다음 형태의 씨앗으로 남겨라’, C는 ‘문턱의 밝기와 원근을 인물의 선택에 연결하라’라는 연출 규칙과 실패 사례를 제공한다. 규칙 위반을 무조건 오류로 만들지 않고 의도와 근거를 기록한다.

JS는 명시 데이터로 반복 가능하게 수행한다. `poseAt`, `projectPlanes`, `sampleStroke`, `composeGlazes`, `toneToHatch`, `evaluateShot` 같은 제안 함수가 입력·출력·경계·자원 수명을 가진다. ‘누아르처럼 만들어라’라는 문자열을 받아 범용 필터를 적용하는 API는 충분하지 않다. 양쪽을 연결하는 도구는 asset schema 검사, materialize, 접촉/가림/프레임 범위 진단, 승인용 shot sheet와 데모 실행 명령이다. 스타일 스킬이 라이브러리에 없는 기능을 이미 제공하는 것으로 기술해서는 안 된다.

[Paper.js Path 공식 문서](https://paperjs.org/reference/path/)는 segment/Bezier와 SVG path 입력 후보 근거다. 복수 subpath에는 CompoundPath 등이 필요하다는 제약이 있다. 선택적 준비 단계 도구로 평가하며 설치·버전 선택·실행 호환은 이번에 하지 않았다. 단순 컷아웃에는 추가 의존성 없이 Canvas path로 시작할 수 있다.

## 놓치기 쉬운 공통 구성요소

- **자산 저작 계약**: 그림·rig·pose·UV·stroke correspondence·노출표가 실질적인 비용이다. 절차적 도형만으로 모든 인물·배경을 생성하겠다는 약속을 피한다. 자산의 원본/파생/권리/scale/pivot/alpha/color-space를 함께 보관한다.
- **시간 도메인**: `t.frame`과 `t.exposed`를 구분하고 카메라·재질 noise·인물 pose 각각 어느 시간을 쓰는지 선언한다. 움직임을 멈춰도 grain이 계속 바뀔지 설계해야 한다. 컷의 `[from,to)` 밖 상태가 섞이지 않아야 한다.
- **결정성**: frame별 random 대신 object ID/seed/exposure key 사용. 붓·지움·시뮬레이션은 과거 재생을 강제하지 않는 고정 데이터로 준비한다. GPU/OS 간 bit exact와 같은 환경 seek 일치를 구분한다.
- **표면 좌표**: 화면 grain, 종이 grain, 물체 UV hatch는 서로 다른 좌표계다. 구분하지 않으면 카메라가 움직일 때 재료가 미끄러진다.
- **렌더 계약**: premultiplied alpha, linear/sRGB 경계, tone mapping, mask 해상도, viewport, line width, 안티앨리어싱을 명시한다. 최종 해상도에서 작은 구멍·망점이 살아남는지 확인할 요구를 포함한다.
- **카메라와 편집**: shot별 시선·행동 축·화면 방향·전경/중경의 역할이 자산만큼 중요하다. 음악 energy를 카메라 흔들림에 직결하는 공통 습관은 피한다.
- **배포와 소유권**: 기존 materialize-kit은 catalog와 의존 복사/소유 해시를 관리한다. 신규팩도 원작별 복사 스크립트가 아니라 이 경로에 연결할 후보로 삼는다. immutable revision에는 필요한 atlas/라이선스/로컬 의존성이 포함되어야 한다.
- **승인 뒤 검증 요구**: 각 팩 2개 내용, 임의/역순 seek, 경계·노출 혼합, freeze 후 독립 실행, 해상도 변경의 선/질감 안정성, 사람의 연속 시청을 포함한다. 이 문서는 그 검증의 통과 증거가 아니다.

## 대안·반대 의견과 부모의 결정

A가 기존 종이 샘플의 반복이라는 반론은 타당하다. 새 A는 단일 무대의 모양 변경이 아니라 구멍·관절·노출표·가림·카메라를 데이터화하고 동물/항구 두 내용으로 증명해야 한다. 그렇지 못하면 A 대신 현대 그래픽 셀을 선택하되 먼저 UPA 1차 자료를 보강한다.

B는 예술적 차별성이 크지만 자산 저작과 시간 일관성 비용이 높다. 일정이 짧으면 B를 물리 수채가 아닌 선+워시 근사로 명확히 좁히거나 D를 먼저 구현한다. ‘수채 시뮬레이션’이라는 이름으로 blur를 납품하지 않는다.

C는 가장 큰 공간 확장을 주지만 shader만 만들고 끝날 위험이 있다. 범용 인물 생성 대신 단순 세트·그림자·표면·shot 도구에 집중하는 편이 재사용성이 높다. 기존 도자기 인형을 계속 개선하는 것보다 독립성이 크다. 반대로 사용자의 최우선 취향이 촉각적 미니어처라면 C를 스톱모션 재질팩으로 교체할 수 있으며, 그 경우 모델/rig 공급 범위를 먼저 정해야 한다.

부모가 정할 항목은 (1) A/B/C와 선택 D의 우선순위, (2) 각 팩의 자산 저작까지 포함할 예산, (3) B의 물리 시뮬레이션 제외·C의 임의 mesh 자동 해칭 제외라는 1차 한계, (4) 공통 shot/exposure/asset schema의 소유 모듈, (5) 사용자가 실제 승인할 데모 내용이다. 최소 세 미학은 목표지만 반드시 세 개로 종료한다는 뜻은 아니다. CE/CO 모델별 비교 결과와 최종 실행 프롬프트는 부모가 종합하며, 이 독립 조사에서 다른 모델을 실행하거나 구현을 시작하지 않았다.
