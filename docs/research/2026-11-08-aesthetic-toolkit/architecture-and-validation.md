# 미학 툴킷: 제작 아키텍처와 검증 연구

확인일: 2026-11-08. 조사 전용. 구현·설치·테스트·렌더를 수행하지 않았다. 아래 ‘제안’은 현재 지원 API가 아니다. 다른 연구자의 스타일/작품 분석과 부모의 통합을 전제로 한다.

## 근거와 현재 계약

직접 읽은 로컬 자료: package.json, references/{format,tools,craft,direction}.md, scripts/{materialize-kit,revisions}.mjs, skills/cinewright/SKILL.md, modules/fx/particles.mjs, tests/{motion,fx}.test.mjs, integration/porcelain-study 테스트의 seek·freeze 관련 부분, 두 music-box-dancer handoff의 상태 부분. 전체 런타임 소스나 모든 테스트를 정독하거나 실행한 것은 아니다.

현재 명시된 의존성은 Node >=22, playwright-core 1.64.1, three 0.180.0이다. manifest v1과 정수 프레임, 반개구간, prepare/evaluate/draw, 노출/연속 시간 구별을 보존한다. channels는 number/vec2/boolean/string/path이며 mat4·quaternion·depth texture 전송은 현재 계약에 없다. 3D 데이터는 우선 모듈 내부 또는 로컬 JSON으로 소유하고 기존 channel에 억지로 직렬화하지 않는다.

materializeKit의 실제 catalog는 motion/focus/accent/particles/artwork이며 의존 모듈을 재귀 복사한다. writeOwnedFiles는 소유 ledger 해시가 맞는 생성 파일만 교체하며 모든 목적지를 먼저 점검한다. 다만 여러 파일 쓰기의 트랜잭션 rollback을 구현한 것으로 읽으면 안 된다. 확장 시 staging/게시 실패 정책을 별도로 정해야 한다. revisions는 regular file/directory만 수집하며 파일 해시를 사용한다. freeze가 외부 네트워크 자산이나 임의 외부 import를 자동 보존한다는 보장은 없다.

particles는 같은 점 개수의 형태 사이 인덱스 보간과 seeded scatter다. 물리 충돌·유체·범용 emitter라고 표시하면 안 된다. fx 테스트는 모의 context의 호출과 상태를 검사한다. 화면의 미학적 적합성 근거가 아니다. porcelain 테스트에는 역순/임의 seek 비교가 있으나 이번 연구에서 실행 성공을 확인하지 않았다.

## 1차 자료 대조

모든 URL 확인일은 2026-11-08이다.

- [Three r180 AnimationMixer 원본](https://raw.githubusercontent.com/mrdoob/three.js/r180/src/animation/AnimationMixer.js): 객체별 animation player와 시간 상태를 제공한다. 제안: clip을 절대 시간에 평가하는 adapter를 두고 fade/loop/완료 이벤트가 seek 순서에 영향을 주는지 별도 검증한다. mixer를 쓴다는 사실만으로 무상태성이 확보되지 않는다.
- [Three r180 WebGLRenderer 원본](https://raw.githubusercontent.com/mrdoob/three.js/r180/src/renderers/WebGLRenderer.js): WebGL2 대상이며 alpha/premultipliedAlpha/preserveDrawingBuffer 옵션이 있다. 제안: renderer 경계에서 색공간·tone mapping·알파 정책을 고정하고 Canvas 합성까지 검증한다. 최신 문서의 기능을 r180에 자동 적용하지 않는다. threejs.org의 구형 animation/color-management URL 두 곳은 404여서 근거로 사용하지 않았다.
- [Khronos glTF 공식 자료](https://www.khronos.org/gltf/): scenes/nodes/meshes/materials/textures/skins/animations의 전달 형식이다. 제안: 재사용 리그·clip의 입력 후보로 GLB를 지원하되 영화별 재질·리깅 의미를 자동 보존한다고 약속하지 않는다. 프로젝트에서 loader/addon과 확장 decoder가 실제 패키징되는지는 후속 확인 사항이다.
- [Showreel 공식 저장소](https://github.com/revfactory/showreel), [공식 FX 원본](https://raw.githubusercontent.com/revfactory/showreel/main/assets/engine/fx.js): 실제 선택형 FX와 결정적 HTML 제작 도구다. 로컬 설치본 engine.js/fx.js의 주석·앞부분 및 techniques.md의 목차·규칙을 읽었다. engine은 REEL.scene/overlay/seek 및 시간 기반 모션, fx는 camera/impact/wipe/floor/dust/rays/flash/letterbox/vignette/grain/leak/hud/subtitles 13종이다. techniques의 22항목은 코드 레시피이며 모두 import API가 아니다. 웹 FX의 공개 시그니처는 읽은 설치본 주석과 일치하지만 전체 바이트/커밋 동등성은 확인하지 않았다. REEL DOM 전역을 Cinewright 모듈에 그대로 import할 수 없다. 순수 수학과 설계를 검토해 adapter로 옮기는 별도 작업이 필요하다. 설치본 스킬의 제작 실행 지침은 이번 조사에 적용하지 않았다. 영화별 완성 스타일 라이브러리라는 근거는 없다.

## 제안: 다섯 층과 정본

| 층 | 책임과 산출물 | 경계 |
|---|---|---|
| 스킬 | 레퍼런스 분석, 형태·재질·연기·구도·편집 판단, 사용/회피 조건, capability 선택 | 픽셀 구현이나 렌더 성공을 주장하지 않음 |
| 스타일 팩 | 팔레트·형태 규칙·재질·움직임 문법·구도/컷 규칙, 추천 preset과 금지 조합 | 후처리 LUT 하나로 대체 불가 |
| recipe/scene specification | 내용·자산 슬롯·사건·샷·camera·exposure·pack/version을 선언 | manifest v1로 컴파일하는 제작 입력, 새 필수 런타임 schema 아님 |
| JS 라이브러리 | geometry/mask, rig/pose, sampler, particles, materials, renderer, compositing | 절대 frame 평가·명시적 단위·입력 복제·bounds/errors |
| 자산/증거 | 로컬 geometry/rig/clip/texture/font, provenance, bake와 검토 기록 | 사용자 원본·private .direction 보존 |

초기는 기존 Cinewright 진입 스킬 하나와 styles의 독립 references 최소 3개를 권고한다. 공통 설치/시간/검증 지침 중복을 막으면서 스타일 인덱스에 썸네일·적합한 과제·필요 자산·지원 상태를 넣으면 발견성을 확보할 수 있다. 각 팩을 별도 스킬로 분리할 조건은 독립 의뢰 유형·도구 의존성·충돌하는 제작 절차가 실제로 생겼을 때다. 스타일 수가 3이라는 이유로 3개 스킬이 필수는 아니다. 정본은 repo modules/references/recipes이며 설치본은 버전 있는 배포 산출물로 두고 양방향 수동 편집을 피한다.

capability registry에는 id/version/status(implemented/experimental/planned/unsupported), export/API, input/output/units, renderer 요구, dependency/license, deterministic mode, limits, 호환 팩, fallback, demo/evidence 경로를 둔다. ‘라이브러리 설치됨’, ‘도구 발견됨’, ‘실제 호출 성공’, ‘작품 품질 검토’를 서로 다른 상태로 기록한다.

## 초기 세 팩 후보와 재사용 범위

아래는 구현 후보이며 작품사·작가 재현의 사실 주장이 아니다. 부모는 다른 연구자의 1차 작품 자료와 대조해 최종 선택해야 한다.

1. 종이 실루엣 극장: 분절 shape와 hinge rig, 겹침/가림, 제한색, 단계적 포즈, 평면 무대/패럴랙스. 공용 mask·벡터 경로·pose sampler·contact shadow 사용. 인물 대화와 식물/기계 작동 두 내용으로 검증한다. 한 장 이미지의 자동 관절 복원은 범위 밖이다.
2. 잉크/판화 그래픽: 윤곽과 면 분리, seeded hatch/stipple, 제한된 번짐과 인쇄 어긋남, hold와 burst의 대비, 여백 중심 컷. 공용 contour mask·texture field·indexed particles 사용. 생물 이동과 도시 변화에 적용한다. 진짜 유체/종이 흡수 재현은 후속이며 화면 전체 noise를 덮는 방식은 불합격이다.
3. 입체 미니어처/스톱모션: 공용 procedural geometry·rig/pose·roughness/light rig·접지 그림자·절제된 카메라와 포즈 노출. 인형과 운송/건축 장면에 적용한다. 도자기 샘플 코드의 일반화가 필요하며 그 샘플만 재포장해서 완료로 삼지 않는다.

최소 공용 2D FX는 mask reveal/occlusion, hatch field, keyed particle formation; 3D FX는 object-space deformation, contact/shadow setup, seeded instanced particles를 후보로 삼는다. 각각 별도 isolation demo로 입력·최소/추천/최대값·시간 변화·알파 배경·실패 예를 보여야 한다. 모든 FX를 모든 팩에 사용하지 않는다.

## 데이터와 실행 정책

자산 계약에는 content hash, source/author/license/attribution, 생성·수정 도구와 버전, 원본/파생 관계, 좌표축·단위·pivot·bounds, mask 의미와 alpha, depth의 metric/relative 여부와 near/far, rig bone 이름/rest pose/clip FPS·loop/contact를 둔다. RGB 이미지에서 얻은 추정 depth/rig는 측정값과 구별한다. 폰트·texture·GLB 종속 이미지·decoder까지 로컬 패키징하고 모델별 라이선스는 코드 라이선스와 분리한다.

motion은 pose/shape hold와 camera/light 연속 시간을 분리한다. 상호작용은 producer/consumer 순서와 space를 문서화한다. recipe는 shot size·시선/진행 방향·safe region·foreground/background 밀도·camera 범위·cut 동기를 보유한다. 2D normalized/canvas와 3D world/camera 변환은 renderer adapter가 소유한다.

입자는 seed+id+절대 age의 닫힌 식을 우선 사용한다. 누적 simulation은 고정 timestep과 초기조건·seed·solver 버전을 기록하고 bake한다. checkpoint replay는 비용 상한과 seek 검증이 마련된 뒤 도입한다. GPU 병렬 계산의 다른 머신 픽셀 동일성은 약속하지 않는다.

materialize에는 registry의 의존 폐쇄와 pack/API 버전·소스 hash를 기록한다. 추천 preset은 독립 데이터로 두고 숫자 범위·메모리/개수 상한·불가능 조합을 사전 거부한다. 업데이트는 사용자가 수정한 생성 파일을 보존하고 새 버전 경로 또는 명시적 migration을 제공한다. freeze 뒤 외부 URL 접근 없이 재생 가능한지를 수용조건으로 삼는다.

WebGL2 불가 시 2D 팩 또는 사전 bake만 명시적으로 선택한다. 3D가 필요했던 장면을 조용히 평면으로 바꾸지 않는다. 생성 도구·외부 DCC는 texture/rig/복잡한 유체·cloth bake에 선택적으로 쓰되, 이번 연구에서 Blender/생성 커넥터의 callable 여부는 확인하지 않았다. 지원 상태는 미확인이다. 기본 세 팩은 이 도구 없이 소유 가능한 간단 자산으로 성립하도록 설계한다.

## 단계·의존관계·수용기준

1. 부모가 모델별 결과를 주장/근거/상충/비용/미지원 표로 통합하고 세 팩과 미학 성공 기준을 선택한다. CE/CO 모델 다양성을 이 문서 단독으로 충족했다고 보고하면 안 된다.
2. 부모가 파일 범위·실제 exports·asset 계약·작업 순서·검증 명령·시각 검토 기준을 포함한 실행 프롬프트를 사용자에게 제시한다. **확인 전 구현 금지**. 이 문서는 구현 허가가 아니다.
3. 확인 후 공통 registry/spec/materialize 계약 → pure primitives → 2D/3D adapter → 세 팩 recipes → 데모/문서 순으로 진행한다. renderer별 작업은 공통 좌표·색·시간 계약 이후 가능하다.
4. 팩마다 최소 두 서로 다른 콘텐츠의 짧은 움직이는 데모(제안 6–10초), 대표 프레임, 최소 사용코드, 파라미터 설명을 제공한다. 총 여섯 데모에서 같은 라이브러리를 재사용하고 장면별 새 엔진 작성은 피한다.
5. 각 primitive isolation과 negative input 검사 후 headless 실제 렌더, 순차/임의/역순 seek의 상태·동일 환경 이미지 비교, freeze 후 원본 변경 독립성, 오프라인 dependency 확인, 첫/마지막/컷 경계와 errors/bounds를 확인한다.
6. 제안 검증 규격은 540p preview와 1080p export, 가로/세로 구성이다. 시간/메모리/GPU 수치와 기준 머신을 기록해 예산을 부모가 확정한다. 임의의 실시간 성능을 보장하지 않는다. 색 patch와 반투명 edge를 검정/흰 배경에서 확인하고 PNG→Canvas→MP4 색/alpha 차이를 기록한다. MP4 투명 출력은 기존 계약에 없다.
7. autoplay는 음소거/사용자 제스처/오디오 실패를 나누고 실제 브라우저 정책에서 재생을 확인한다. flash 검사는 자동 위험 선별이며 안전 인증이 아니다. observe의 기존 유음 조건을 무음 데모에 강요하지 않는다. 음악이 있으면 직접 청취·동기 검토를 별도로 남긴다.
8. 기술 테스트 보고와 시각 보고를 분리한다. 시각 보고는 형태 가독성·재질 일관성·포즈 무게·접지·가림·구도·컷 의미·스타일 차이를 실제 움직임 시청으로 판단한다. 사람 시청/청취 불가 시 미확인으로 남기며 사용자 수락을 대체하지 않는다.

실패 시: 불안정 simulation은 bake/닫힌 식으로 축소, 느린 FX는 명시적 품질 단계로 감소, 미학 차이가 약하면 palette 변경보다 형태/움직임/구도 규칙부터 재설계한다. 불가한 자산/도구는 registry에 unsupported와 이유를 남기고 사용자 요구를 보존하는 대안을 부모가 제시한다.

## 후속 확장과 미확인 사항

후속 후보는 수채 유체·고급 NPR/outline, volumetric light, cloth/hair, 복잡한 캐릭터 리타기팅, 외부 DCC bake, 더 많은 미학 팩이다. 최초 세 팩은 모든 영화·예술 애니메이션을 표현하는 완성 라이브러리가 아니다. 전체 Music Box Dancer 확장, 웹 편집기, 기존 영상 복제, 자동 예술 품질 판정은 비목표다.

paused handoff 본문은 역사 기록이며 최신 visual-study도 사용자 수락 대기다. git status에는 기존 코드/문서/테스트의 광범위한 미커밋 변경이 있어 HEAD만을 현재 사실로 삼으면 안 된다. runtime shader/addon import와 freeze vendor coverage, 실제 Chrome/FFmpeg/GPU 환경, Showreel 설치 커밋/웹 전체 차이, 기존 테스트의 현재 통과 여부, 자산별 재배포 권한은 구현 전 추가 확인이 필요하다. 이번에는 지정한 연구 문서만 작성했다.
