# 부모 조사 보완 — 미학·시간·자산·패키징

조사일: 2026-11-08 KST. 연구 및 구현 프롬프트 작성을 위한 기록이다. 구현·설치·테스트·렌더는 실행하지 않았다. 아래의 구현 항목은 아직 없는 기능의 **제안**이며, 기존 지원 여부와 구분한다.

## Showreel에서 실제 확인한 것

- 설치본 `assets/engine/engine.js`에는 `REEL.scene`, `overlay`, keyframe/easing, spring, noise, stagger 등 공용 API가 있다.
- `assets/engine/fx.js` 마지막의 `window.FX`에는 camera, impact, floor, dust, rays, wipe, flash, leak, letterbox, vignette, grain, hud, subtitles의 13개 구현이 있다.
- `references/techniques.md`는 22개 표현 기법과 코드·제작법을 담는다. 일부는 긴 예제 코드이고 일부는 설명·다른 프로젝트 참조다. 모두 독립 import 모듈이라는 뜻은 아니다.
- `assets/engine/scenes.js`는 API 사용 예시다. 파일 머리에서 새 프로젝트의 `_example_scenes.js`로 복사하지만 영상에는 자동으로 불러오지 않는다고 명시한다.
- 설치본 기법 문서는 콘셉트에서 필요한 기법을 가져와 조정하고, 목록의 조합만으로 작품이 획일화되지 않도록 설명한다. 웹 `main`에서 관찰한 문구와 설치본의 서문은 차이가 있으므로 버전을 섞어 인용하지 않는다.

공식 출처: [Showreel 저장소](https://github.com/revfactory/showreel), [기법 문서](https://github.com/revfactory/showreel/blob/main/references/techniques.md), [실제 FX 코드](https://github.com/revfactory/showreel/blob/main/assets/engine/fx.js). 로컬 코드와 웹 자료를 직접 읽었다.

사용자의 이해에서 맞는 부분은 **실제 구현된 표현 도구를 축적한 뒤 제작에 재사용한다**는 구조다. 특정 영화의 미학 전체를 버튼 하나로 구현하는 도구가 갖춰졌다는 해석까지 뒷받침되지는 않는다. Cinewright의 미학팩은 이 구조를 더 명시적인 공개 API·자산 규약·스타일 recipe로 발전시키는 설계가 될 수 있다.

## 실제 제작자·연구 자료가 보여 주는 추가 구성

### 스타일은 렌더 효과와 동작·연출이 결합한 결과

[Sony Pictures Imageworks의 Spider-Verse 제작 기록](https://dev.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse)은 graphic shape, composition, halftone/hatching과 함께 동작의 프레임 유지, 빠른 동작의 형상 변형·속도선, 카메라와의 관계를 설명한다. 이 자료에서 얻는 설계상 함의는 다음과 같다. 이는 해당 영화 파이프라인을 재현했다는 주장이 아니다.

- 셰이더·재질만으로 미학팩을 정의하지 않는다. 형태와 실루엣, 포즈, 노출 시간, 카메라·편집도 구성에 포함한다.
- 캐릭터와 카메라가 서로 다른 시간 해상도를 쓸 수 있어야 한다.
- 속도 표현을 자동 모션 블러 하나로 고정하지 않는다. smear 형상, 선, 잔상은 별도 선택지다.
- 장면의 2D 그래픽과 3D 구조가 섞일 때 필요한 depth/mask/motion 정보를 명확히 한다.

[Disney의 Paperman 연구](https://www.disneyanimation.com/publications/computer-assisted-animation-of-line-and-paint-in-disneys-paperman/)는 CG의 공간·시간 안정성과 저작한 선의 표현을 결합하는 문제를 다룬다. 설계에서는 3D 표면/포즈와 2D 선·마스크를 연결할 데이터가 필요하다는 근거로 쓴다. 이 시스템 자체가 JS에 제공되거나 일반 toon material로 동일 품질이 나온다는 뜻은 아니다.

### 선의 흔들림도 시간에 따라 설계해야 한다

[Disney Research의 Temporal Noise Control for Sketchy Animation](https://studios.disneyresearch.com/2011/06/11/temporal-noise-control-for-sketchy-animation/)은 선의 시간적 변화량을 제어하는 문제를 다룬다. 이 연구의 복잡한 알고리즘을 1차 구현에 요구하기보다, 다음의 명시적 API를 설계할 근거로 삼는다.

- 표면/종이/물체/화면 중 텍스처가 고정되는 좌표계를 선택한다.
- `seed`, 개체 ID, 유지 프레임을 통해 선 변화의 주기를 제어한다.
- 같은 정지 포즈를 재생할 때 선이 안정적으로 유지되는 모드와 의도한 line boil 모드를 구별한다.
- 임의 시점 조회의 재현성과, 연속 재생에서 눈에 거슬리는 깜박임이 없는지는 서로 다른 검증이다.

## 공용 JS 라이브러리 후보를 추가로 대조한 내용

### Rough.js

[공식 사이트](https://roughjs.com/)와 [공식 API](https://github.com/rough-stuff/rough/wiki)에서 Canvas/SVG 경로와 sketch/hachure 계열 기능을 확인했다. 선·면 패턴을 재사용하는 후보이며, 수채 안료·리그·카메라·편집을 제공하는 완성 미학팩으로 취급하지 않는다. 채택 전에 seed와 출력 명령 재사용, 현재 프로젝트의 로컬 import/freeze를 확인해야 한다. 설치나 벤치마크는 하지 않았다.

### Inkwell

[저자 저장소](https://github.com/VelkinaStudio/inkwell)는 vanilla Three 및 React Three Fiber에서 posterize, outline, halftone, misregistration과 stepped-time helper를 제시한다. 이는 사용자가 원하는 방향과 가까운 **참고 후보**다. README의 성능·품질 주장은 저자 설명이며 이번에 실행 검증하지 않았다. Three r180 호환성, `postprocessing` 의존성, 효과 pass 순서·깊이 입력, license, 로컬 번들링과 임의 seek를 확인하기 전에는 채택 확정으로 기록하지 않는다. R3F용 화면 예제를 이유로 현재 런타임에 React를 도입할 필요는 없다.

### Three.js r180의 실제 제공 범위

- 로컬 `node_modules/three/src/animation/AnimationMixer.js`에 `setTime`이 있다. action/loop/weight/timeScale 및 초기 상태를 고정한 절대시간 평가가 필요하다.
- r180의 `examples/jsm/loaders/GLTFLoader.js`는 `BufferGeometryUtils.js`를 import한다. loader 파일 한 개만 복사하면 의존성 폐포가 완성되지 않는다.
- r180의 `examples/jsm/utils/SkeletonUtils.js`에는 `retargetClip`이 있다. 사용 가능성의 근거이며, 임의 rig 사이의 고품질 리타게팅 보장은 아니다.
- r180 `OutputPass.js`도 `Pass.js`와 `OutputShader.js`를 참조한다. 후처리 코드를 추가할 때 이 파일들까지 실제 revision에 담아야 한다.

온라인 1차 자료: [r180 GLTFLoader 소스](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/loaders/GLTFLoader.js), [r180 SkeletonUtils 소스](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/utils/SkeletonUtils.js), [MeshToonMaterial 공식 설명](https://threejs.org/docs/pages/MeshToonMaterial.html), [Three 색관리](https://threejs.org/manual/pages/color-management.html).

### PixiJS

[공식 scene objects/filter 문서](https://pixijs.com/8.x/guides/components/scene-objects)와 [v8 migration](https://pixijs.com/8.x/guides/migrations/v8)을 대조했다. GPU sprite/filter 기능의 후보지만 또 다른 renderer와 filter 자원 관리·시간 구동을 추가한다. 현재 스택에서 표현·성능의 구체적인 부족이 확인되면 도입하는 편이 합리적이다. 별도 측정 없이 성능 우위를 단정하지 않는다.

## 현재 코드에 직접 확인한 통합 공백

다음은 실제 읽은 저장소 코드에 대한 관찰이다. 해결 코드는 작성하지 않았다.

1. `scripts/revisions.mjs`의 `freeze`는 프로젝트 파일, runtime, Three build의 `three.core.js`·`three.module.js`, LICENSE, 제한된 tools를 고정한다. Three addon과 새 bare import dependency는 자동 수집하지 않는다. addon의 명시적 의존성 목록 또는 프로젝트 내부 배포 도구가 필요하다.
2. `runtime/compositor.mjs`의 모듈 진입점은 `prepare(api, config)`와 선택적 `evaluate(t)`, 필수 `draw(g,t,state)`다. 연구자가 제안한 다른 인자 순서를 그대로 도입해 기존 계약을 바꾸지 않는다. 공용 내부 helper를 만들더라도 이 진입점에 adapter로 연결한다.
3. 같은 compositor의 반환은 현재 `{manifest, draw}`다. 모듈/renderer를 반복 교체할 때 optional `dispose` 및 소유 자원 정리를 호출하는 통합 계약은 없다. GPU 스타일팩을 만들면 실제 호출자까지 포함하는 하위 호환 확장을 검토해야 한다.
4. compositor는 `t.frame`과 `t.exposed`를 둘 다 전달한다. 모션 cadence 때문에 카메라·모든 효과까지 동일하게 양자화하지 않는다. 효과별로 소비할 시간을 명시한다.
5. `scripts/server.mjs`는 revision에 있는 파일만 읽기 전용으로 제공한다. `.glb` MIME은 있지만 `.gltf`, codec WASM 등 새로운 자원은 별도 검토가 필요하다. 외부 CDN 없이 동작하는 local asset/import 경로를 설계한다.
6. `scripts/materialize-kit.mjs`는 현재 motion/focus/accent/particles/artwork의 명시적 catalog와 소유권 ledger다. 이를 보존하면서 미학팩·필요 자산·효과의 실제 파일 폐포를 물질화하는 경로가 필요하다.
7. `skills/cinewright/SKILL.md`는 루트 `SKILL.md`를 정본으로 안내하는 얇은 wrapper다. 스킬 지침을 여러 위치에 복제해 불일치를 만들기보다 정본과 references의 소유 관계를 정한다.

## 구현 프롬프트에 포함할 원칙

- **넓은 조사 목록과 실제 구현 완료 범위를 따로 둔다.** 최소 세 미학팩, 공용 2D/3D FX, 자산/동작·recipe·스킬·데모·검증은 1차 결과의 일부다. 나머지 연구 후보는 확장 경로로 남긴다.
- **미학 차이를 세 팔레트로 증명하지 않는다.** 형태·질감·공간·움직임·시간·카메라/편집에서 각 팩의 필수 특징을 정한다.
- **동작은 저작 데이터로 교체할 수 있어야 한다.** 도구 안에 데모 인형과 특정 곡의 keyframe을 숨겨 넣지 않는다. rig/shape/clip/시간 입력을 교체한 두 내용의 데모로 재사용성을 확인한다.
- **스타일 스킬과 구현 모듈이 같은 지원 목록을 참조한다.** 스킬은 실제 존재하는 도구/API와 입력 조건을 안내하고, 지원하지 않는 고급 표현은 후속/실험으로 명시한다.
- **정지 프레임만으로 완료하지 않는다.** 각 스타일의 동작 데모, 효과별 분리 데모, 조합 데모, 경계·seek/freeze 회귀가 필요하다.
- **품질 한계는 실제 관찰에 연결한다.** 같은 머신의 픽셀 재현성, 다른 환경의 허용 오차, 시각적 적합성, 사람의 평가 여부를 분리한다.

이 문서는 다른 모델의 연구 결과를 대신하지 않으며, 최종 범위는 세 연구 보고서를 함께 읽은 뒤 구현 프롬프트에 확정한다.
