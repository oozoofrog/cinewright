# 공용 효과와 렌더링 런타임 조사

조사일 2026-11-08. 이 문서는 설계 제안이며 구현·렌더·테스트는 수행하지 않았다. 웹 자료는 확인일 모두 2026-11-08. 현재 설치판과 웹 최신 문서는 동일 버전임이 보장되지 않는다. 특히 Three.js는 프로젝트의 **0.180.0**이 기준이며 아래 최신 문서의 API를 그대로 사용하기 전에 해당 버전 소스와 제공 경로를 확인해야 한다.

## 읽은 기존 코드와 함의

`package.json`: Node ≥22, three 0.180.0 및 playwright-core 1.64.1. `modules/motion.mjs`: frame 기반 순수 보간, 인덱스 해시 `seeded`, 선형 보간 noise, 정렬 이벤트 탐색과 폴리라인 호길이 샘플링. `modules/fx/focus.mjs`, `accent.mjs`, `particles.mjs`: prepare에서 입력을 복사하고 evaluate에서 `t.exposed ?? t.frame`을 읽으며 Canvas draw에서 save/restore. particles는 물리 시뮬레이션이 아니라 동일 인덱스 형상 사이 보간이다. 이 패턴은 재사용 가능하지만 별도 물리, 리그, 색공간, GPU 자원 계약은 없다. `scripts/materialize-kit.mjs`는 명시적 catalog와 의존성 폐포만 복사하고 소유 해시가 맞는 파일만 덮는다. 새 모듈은 catalog·전이 의존성 등록이 필요하며 addon과 외부 asset까지 자동 수집하지 않는다.

설치 Showreel `assets/engine/engine.js`를 읽었다: 초 단위 장면 시간과 seek, 결정적 rand/noise, easing/keyframe을 제공하며 누적 RAF와 이전 프레임 의존을 금한다. `fx.js`에는 camera, impact, dust, rays, wipe, grain 등 실제 함수가 있다. 이는 공용 모션/효과 선례이지 영화별 완성 스타일 라이브러리가 아니다. [공식 저장소](https://github.com/revfactory/showreel). techniques의 레시피를 import 가능한 공용 API로 취급하지 않는다. 해당 recipes 및 scenes 전체와 기존 handoff는 이번 조사에서 충분히 읽지 못했다.

## 선택할 기반

| 후보 | 실제 이득과 결정 |
|---|---|
| Canvas2D/SVG | 경로, clip, stroke, `destination-in/out` matte와 벡터 자산. 1차 기본. [합성 사양 설명](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation). |
| Three r180 | 기존 의존성으로 3D 카메라·mesh·그림자·애니메이션. addon은 별도 import이며 배포 시 동일 r180 소스와 그 전이 import를 로컬로 묶어야 한다. 최신 [OutlinePass](https://threejs.org/docs/pages/OutlinePass.html)는 선택 객체 외곽선이며 임의의 일러스트 선 전체 해결책이 아니다. |
| PixiJS | GPU 다수 스프라이트·필터·render texture가 병목일 때 검토. [v8 마이그레이션](https://pixijs.com/8.x/guides/migrations/v8)은 texture source 변경을 설명한다. 새로운 renderer와 텍스처 수명 비용 때문에 기본 의존성 보류. |
| Paper.js | 복잡한 벡터 boolean/offset의 오프라인 저작에 유리. [Path 문서](https://paperjs.org/reference/path/)는 boolean 결과에서 일부 stroke profile이 보존되지 않음을 설명한다. 단순 path 렌더만을 위해 도입하지 않음. |
| GSAP | 풍부한 저작 타임라인 및 seek 가능([공식 시트](https://gsap.com/cheatsheet/gsap-3-cheat-sheet.pdf)). 콜백·상태 및 타임라인 초기화가 seek 결과에 미치는 영향을 별도 검증해야 하므로 1차는 기존 순수 보간. |
| regl / 2D IK 패키지 | 전자는 저수준 GPU 추상화 중복; 후자는 좌표계·제약·라이선스·절대시간 평가 적합성을 특정 후보별 검증해야 한다. 지금 채택 근거 부족. 단순 2관절 해석 IK부터 자체 구현 제안. |

## 효과별 구현 제안

아래는 외부 출처의 기능 보장이 아니라 설계안이다. 입출력은 좌표·단위를 명시하며 공통 상태는 직렬화 가능한 데이터로 유지한다.

| 기술 / 우선순위 | 입력 → 출력 및 재사용·난점 |
|---|---|
| 경로·mask·matte·stroke 필수 | SVG path 또는 명령 배열, transform, fill rule → Canvas/SVG 경로와 alpha. clip은 하드 경계, 별도 오프스크린의 destination-in은 연속 alpha matte. winding, self-intersection, stroke 확대/해상도 경계를 명시. |
| 브러시·종이·잉크/수채 선택 | 중심선·압력·seed·종이 텍스처 → stamp 또는 변폭 폴리곤, 경계 alpha. 종이 좌표에 고정된 noise와 다층 반투명 안료로 근사; 실제 흡수·번짐 시뮬레이션이 아니며 작은 스케일에서 반복·탁해짐을 조절. |
| 해칭/하프톤 선택 | 밝기/방향장, cell 크기, seed → 선/점. 화면 또는 물체 좌표 중 고정 방식을 명시; 모아레와 리사이즈 aliasing 방지. |
| 팔레트 필수 | 명시적 sRGB 색과 역할 → 렌더 색/선택적 양자화. 조명 계산은 linear, 출력 변환은 한 번. [Three 색관리](https://threejs.org/manual/pages/color-management.html)는 색 텍스처 sRGB, 데이터 텍스처 비색 공간, 후처리 OutputPass를 설명한다. r180에서 확인 후 적용. |
| 멀티플레인 필수 | 깊이·카메라·레이어 transform → 각 평면 projection. Canvas 행렬 또는 Three 평면을 사용; 패럴랙스의 가장자리 여백과 정렬 필요. |
| 2D 관절·키프레임 필수 / IK 선택 | 부모 인덱스·rest transform·회전 키·타깃 → 절대 관절 행렬. 2-bone IK는 길이와 굽힘 방향, 도달 불가능 타깃 clamp; 손 접촉과 캐릭터 실루엣은 별도 저작 필요. 키는 프레임 및 보간 종류를 명시. |
| toon/ramp·윤곽 필수 | 법선·조명·ramp·mesh → 계단 음영; inverted hull 또는 depth/normal edge → 선. 내부선 누락, hull 틈·두께 및 투명 교차가 한계. OutlinePass를 전체 만화선과 동일시하지 않는다. |
| 3D 재질·조명·그림자 필수 | roughness·색·방향광·카메라·shadow map → 장면. 자기 그림자 bias, 접촉, 그림자 해상도 및 transparent sorting을 장면별 조율. 피사계심도는 선택 후처리: depth discontinuity halo와 투명체 취급 검증. |
| glTF rig/clip 선택 | glTF skeleton, clip, 시간 → 포즈. [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer)는 `setTime` 절대 초를 지원하나 timeScale 적용; action 활성화·weight·loop를 매 평가 재설정해야 한다. retarget은 bone mapping, rest pose, 비율, root motion을 정하고 오프라인 bake 후 재생 검증; 자동 품질 보장 아님. |
| 입자·연기·추상 형상 선택 | seed·입자 ID·생성 시각·수명 → 해석적 위치/alpha. 기존 particles 확장; 연기는 겹친 sprite/noise 근사, 진짜 유체와 다름. 변형은 rest geometry + 시간 함수로 산출하며 법선·bounding box 갱신 비용 고려. |
| 잔상/smear·hold 필수 | 임의 샘플 시각과 가중치 또는 수작업 smear 형상 → 합성 레이어. 이전 출력 누적 대신 각 샘플 독립 재평가; 빠른 사지의 smear는 도형 저작이 필요. exposure/on-twos는 노출 프레임 양자화와 hold 구간으로 모델링하고 원래 `t.frame`은 보존. |
| 전환·합성 필수 | 두 레이어·마스크·진행도 → 이미지; wipe/crossfade에서 [from,to) 경계 정의. premultiplied alpha를 경계마다 명시하고 투명 픽셀 RGB와 이중 premultiply로 생기는 검은 테두리 검증. |

## 공개 경계 제안

`prepare(spec, resources)`는 입력을 복사하고 검증하여 불변 revision에 묶인 핸들을 반환한다. `evaluate(time, channels)`는 `{frame, exposed, fps}`에서 순수 상태를 반환하고, `draw2D(ctx, state)` 또는 `apply3D(scene, state)`는 모든 관련 속성을 덮어쓴다. `dispose()`는 소유 texture/material/geometry/render target을 해제한다. geometry·asset은 콘텐츠 해시와 revision으로 캐시하고 참조 계수와 소유권을 명시한다. 렌더러별 내부 객체를 직렬화 가능한 스타일 데이터에 노출하지 않는다. 각 미학팩은 형태·팔레트·동작 규칙과 공용 효과의 파라미터를 제공하며, 공용 FX는 특정 작품의 디렉션을 소유하지 않는다. 종이 컷아웃, 잉크 드로잉, 도자기 인형 같은 세 계열 모두 mask·cadence·palette·camera·composite를 공유할 수 있다.

`frame`은 실제 출력 시각, `exposed`는 hold된 노출 시각이다. 어느 효과가 어느 시간을 소비하는지 명시한다. seed는 revision/효과/개체 ID에서 안정적으로 파생하고 셰이더에 명시 전달한다. RAF, delta 누적, Math.random 및 이전 프레임 의존 필터는 금지. 불가피한 유체나 temporal denoise는 고정 초기조건에서 정해진 스텝으로 재생하거나 버전·시드·시간별 checkpoint를 bake하고 역방향 seek 비용을 공개한다. GPU/드라이버/OS별 부동소수점 및 래스터 차이 때문에 플랫폼 간 bit-identical을 약속하지 않는다.

WebGL→Canvas는 같은 프레임 렌더 후 명시적으로 drawImage/합성하고 context 설정, 투명도 및 색 변환을 고정한다. 읽기 동기화와 중간 버퍼 복사 비용을 측정한다. CSS 크기와 실제 픽셀 크기, devicePixelRatio, 출력 해상도, FFmpeg의 색 태그/전송 특성을 명시하며 샘플 및 최종 해상도에서 선 두께와 텍스처 주파수를 확인한다. 후처리 타깃, 텍스처, mixer, 캐시는 revision 교체와 dispose에 연결한다.

## 구현 순서와 검증 계획

1. 시간·자원·색/alpha 경계와 Canvas mask, 키프레임, 팔레트, 멀티플레인부터. 2. 2D rig와 toon/윤곽·조명, 절대시간 clip 평가. 3. 브러시·인쇄·입자·smear. 4. DOF, retarget/bake, 유체 및 고급 GPU 효과는 필요와 비용을 입증한 후. 구현 불확실성은 브러시의 품질과 temporal 재현, 실루엣 윤곽, retarget이 특히 높다.

향후 검증은 동일 프레임을 순방향·역방향·무작위·반복 seek해 상태 및 이미지 비교, hold 경계의 `frame`/`exposed` 차이 확인, freeze 전후 같은 revision 재현과 변경된 revision 격리, 여러 워커/해상도/투명 배경 합성 확인을 포함한다. 동일 환경은 픽셀 비교, 다른 GPU는 허용 오차와 시각 검토를 병행한다. 투명 흰색/검정 배경 합성, 색 차트 및 최종 인코딩 프레임을 비교하고 자원 반복 생성·해제, draw call, GPU 메모리와 프레임 시간을 측정한다. 자동 검사는 시각적 캐릭터 연기·형상·리그 품질을 보증하지 않는다. 셰이더나 텍스처만으로 좋은 실루엣, 관절 접촉, 타이밍 및 구도를 만들 수 없다.
