# Cinewright 미학·2D/3D FX 라이브러리 구현 프롬프트

**2026-11-08 사용자 실행 승인.** 최신 사용자 요청: “작성한 프롬프트로 T3 에 다중 팀구성 작업을 위임해주세요.” 아래 구현 범위를 T3 다중 팀 작업으로 실행하도록 승인받았다. 최초 검토본의 본문과 말미에 있는 ‘진행 요청 전 실행하지 않는다’는 조건은 이 최신 지시로 충족됐다. [실행·팀 구성 기록](../../handoffs/2026-11-08-aesthetic-toolkit-execution.md)을 따른다. 아래 구현 요구사항은 변경하지 않았다.

관련 연구: [종합 판단](README.md), [12계열 미학](aesthetics.md), [FX/런타임](effects-and-runtime.md), [구조/검증](architecture-and-validation.md), [부모 보완 조사](integration-notes.md).

---

## 실행 역할과 목적

당신은 `/Volumes/eyedisk/develop/cinewright`의 구현 담당자다. 사용자 확인 후 이 프롬프트를 받았다면, 아래 전체 초기 납품 범위를 구현·시각 검토·검증하고 결과를 인계하라.

목적은 서로 다른 예술 애니메이션·영화의 표현 원리를 재사용할 **JS 미학 라이브러리 최소 세 종**, 이를 지원하는 **공용 2D 및 3D 특수효과 라이브러리**, 실제 제작에서 이를 선택·활용하는 **스킬 지침과 recipe·자산·motion 계약**을 갖추는 것이다. 한 장면을 그때그때 새로 작성하는 부담을 줄이고, 작품의 자산·내용·동작·구도를 교체해도 같은 도구를 재사용할 수 있게 만든다.

이번 초기 결과에는 A/B/C 세 팩을 모두 포함한다. 연구만 다시 수행하거나 API 이름·지원 예정 항목·색 프리셋만 만들고 완료하지 않는다. 작품별 완성 영화의 복제나 모든 미학을 자동 생성하는 시스템을 약속하지 않는다. 실제 구현한 범위와 저작 자산이 필요한 범위를 정확히 표시한다.

## 1. 시작 상태와 보존할 계약

1. 해당 경로의 AGENTS.md 및 프로젝트 `SKILL.md`, `references/format.md`, 연구 문서 다섯 개, `docs/handoffs/music-box-dancer-visual-study.md`를 먼저 읽는다. 문서가 과거 기록이면 현재 코드와 구분한다.
2. Git status·HEAD·index·기존 수정/untracked 목록을 기록한다. main에는 이전 구현과 제작 근거가 미커밋으로 있다. HEAD만으로 현재 기능을 판단하거나 reset/clean/stash·중복 patch·기존 자료 정리를 하지 않는다. 새 작업으로 생긴 변경과 이전 변경을 구분한다.
3. 기존 `.direction/productions/music-box-dancer-20261106-232634/`와 Downloads의 원본, evidence/global-update 자료, 완곡·샘플·revision을 보존한다. 이번 데모는 새 제작 폴더를 사용한다. 사용자가 제공한 원곡으로 라이브러리를 검증해야 한다고 가정하지 않는다.
4. Node ESM, manifest v1, 정수 FPS/frame, `[from,to)`, `prepare(api,config) → {evaluate?,draw}`, 기존 asset layer와 typed channel의 동작, `t.frame`/`t.exposed` 구별, 임의/역순 seek, freeze·player·render를 유지한다. 새로운 저작 spec은 기존 manifest를 생성하는 입력으로 두고 필수 런타임 schema 교체를 피한다.
5. 현재 채널에는 number/vec2/boolean/string/path만 있다. GPU texture·mat4·skeleton을 기존 채널로 전달한다고 주장하지 않는다. 해당 데이터는 모듈 내부/명시적 로컬 자산·adapter가 소유한다.
6. Three 기준은 설치된 **0.180.0**이다. 최신 WebGPU/TSL/API를 검증 없이 섞지 않는다. 새로운 dependency는 재사용 이득·정확한 버전·라이선스·freeze 경로를 확인하고 필요한 것만 고정한다.
7. 기존 테스트 기록 394개 통과는 참고다. 승인 후 현재 checkout에서 기준 검사를 실행해 실제 결과를 기록한다. 이번 작업의 통과 수로 과거 기록을 재사용하지 않는다.

## 2. 구현할 다섯 층

### 2.1 제작 스킬과 미학 문법

기존 Cinewright 진입 스킬 하나를 유지하고 세 스타일의 references를 추가한다. 루트 SKILL.md가 정본이고 `skills/cinewright/SKILL.md`는 안내 wrapper다. 공통 규약을 여러 스킬에 복제하지 않는다.

각 스타일 문서에는 레퍼런스의 어떤 표현 원리를 쓰는지, 적합/부적합한 의도, 형태·재질·동작·노출·공간·카메라·편집 규칙, 필요한 자산과 실제 API, 최소 사용 예제, 성공/실패 프레임, 지원 한계를 포함한다. 지침에서 존재하지 않는 라이브러리·자동화 기능을 호출하라고 하지 않는다.

독립된 의뢰 유형·의존성·제작 절차가 생길 때 별도 스킬로 분리할 수 있게 스타일 자료를 모듈화한다. 초기 완료 조건은 독립 SKILL.md 세 개가 아니라, 세 미학을 실제 도구로 제작하도록 안내하는 재사용 지식이다.

### 2.2 스타일 팩

스타일 팩은 palette만이 아니라 입력 자산, 형상/재료 처리, pose/exposure, 공간·샷 규칙과 추천 효과 조합을 제공한다. 아래 A/B/C 각각을 public library entry와 교체 가능한 preset/recipe로 구현한다. 작품/곡 이름이나 데모 keyframe을 공용 함수 안에 넣지 않는다.

### 2.3 Scene recipe와 저작 데이터

자산 슬롯, 인물/물체, pose/stroke/clip, shot/camera, 사건과 노출, 사용할 pack/effect 및 버전을 선언하는 데이터와 생성기를 둔다. 결과는 기존 `work.json`과 프로젝트 내부 모듈/자산이다.

공통으로 id·좌표계·단위·pivot·bounds·시간 범위를 명시한다. 스타일마다 필요한 데이터가 다르면 명시적 type으로 나누고 모든 매체를 한 거대한 schema로 억지로 통합하지 않는다. JSON 직렬화 데이터와 Canvas/WebGL 객체를 분리한다.

### 2.4 공용 JS·2D/3D FX

마스크·획·워시·해칭·노출·rig·카메라·재질·그림자·입자·전환을 아래 공개 경계에 따라 재사용한다. 스타일 팩이 내부 함수를 복제하는 대신 이 계층을 소비하게 한다. 기존 `modules/fx/`와 `motion.mjs`의 사용자는 깨뜨리지 않는다.

### 2.5 자산·리그·motion·증거

라이브러리를 실제 쓸 수 있는 소형 예제 자산과 pose/stroke/UV/clip 데이터를 함께 제공한다. 예제 자산의 품질도 납품의 일부다. 저작·출처가 확인되는 벡터·texture·mesh·motion을 활용하고 좋은 자산이 있으면 재사용한다. 단순 원/막대 인물만 만들어 캐릭터 품질 문제가 해결됐다고 기록하지 않는다.

작품 원본 이미지/영상을 복사하는 대신 표현 원리를 참고하고 데모 내용을 새로 만든다. 자산별 source/author/license/attribution, 원본/파생, 도구·버전·hash, scale/axis/pivot, color-space/alpha, rig/rest pose/clip FPS와 loop/contact를 기록한다. 외부 모델과 코드의 라이선스를 하나로 취급하지 않는다.

## 3. 필수 미학팩 A — 실루엣 다중평면

**ID: `silhouette-theatre`.** Reiniger 자료에서 확인한 관절 실루엣과 적층 공간을 참고한다. 주된 표현 단위는 실루엣·내부 구멍·간격·가림·pose/exposure다.

필수 기능:

- SVG path/명령 데이터와 복수 subpath·구멍, 투명 alpha asset을 입력받는다. fill rule과 mask의 의미를 명확히 한다.
- 부모/자식 hinge rig, pivot, rest pose, 회전 제한과 교체 가능한 자세표를 제공한다. pose hold와 보간을 분리한다. silhouette shape와 rig는 데이터로 교체한다.
- 최소 전경/중경/후경을 지원하는 depth plane과 카메라 이동·가림을 제공한다. 카메라는 연속, 인물은 hold 같은 혼합 노출이 가능해야 한다.
- 장막/iris 또는 전경 마스크를 이용한 reveal, backlight/halo, 종이 좌표에 고정된 가장자리 질감을 제공한다.
- 실루엣 puppet, 바닥에 드리우는 그림자, 그래픽 장식을 별도 구성으로 다룬다. 중요한 팔다리/얼굴이 겹쳐 읽히지 않거나 카메라가 자산 밖 빈 영역을 노출하면 진단할 수 있게 한다.

필수 데모 두 내용:

1. 숲에서 길을 찾는 두 동물: 서로 다른 보행·정지, 전경이 열리는 사건, 인물 간 가림을 보여준다.
2. 항구에서 배를 인도하는 등대: 인물 리그 없이도 파도층·배·회전 빛·원경에 같은 공간/노출 도구를 재사용한다.

자동 사진 분절이나 이미지 한 장의 관절/해부 복원은 초기 약속에 포함하지 않는다. 기존 종이 무대 샘플과 모양만 다른 장면이 아니라 데이터 입력과 재사용을 증명한다.

## 4. 필수 미학팩 B — 선·워시 드로잉

**ID: `line-wash`.** 선·워시 작품의 여백, 획의 출현·지움, 재그리기와 hold를 참고한다. 주된 표현 단위는 압력 획·영역 워시·지움·노출표다.

필수 기능:

- 중심선/Bezier·압력·폭·색·시작/종료 프레임을 받는 stroke와 호길이 기반 reveal. 곡선 근사 오차와 zero-length stroke의 처리를 정의한다.
- seeded dab/변폭 획, 종이 좌표에 고정된 grain, 중첩 glaze, edge pigment의 **명시적인 근사 재료**. 면과 획별로 제어하며 화면 전체 blur/noise를 덮는 것으로 대체하지 않는다.
- 저작한 redraw bank, stop/redraw exposure, 대응점이 있는 선의 보간. topology/대응이 맞지 않으면 오류나 명시적 교체로 처리한다.
- erasure mask와 사건 목록 또는 준비된 atlas로 지움/잔흔을 재구성한다. 이전에 canvas에 그렸던 결과가 있어야 현재 프레임이 나오는 숨은 누적 상태를 사용하지 않는다.
- 같은 포즈에서 선을 유지하는 모드와 의도한 line boil을 별도 제어한다. seed와 노출 ID, stroke ID로 변화가 결정되게 한다.

필수 데모 두 내용:

1. 비가 멈추며 잎과 물웅덩이가 나타나는 정물: 워시·겹침·경계 농도·여백·지움을 보여준다.
2. 통근자가 걷다가 편지를 펼치는 인물 장면: 저작한 pose/stroke 자산으로 접지·동작·선 생략·지움 전환을 보여준다.

압력 획·워시·지움·redraw는 필수다. 실제 젖음/안료 유체, 물리적 종이 흡수, 자동 인물 작화·영상 로토스코프는 후속이다. 근사 재료를 ‘완전한 수채 시뮬레이션’이나 수묵 전통 전체 구현이라고 부르지 않는다.

## 5. 필수 미학팩 C — 표현주의 판화 공간

**ID: `expressionist-space`.** 표현주의 세트와 판화/NPR의 명암·선 원리를 결합한다. 주된 표현 단위는 실제 3D 세트·투영·조명·그림자·표면 고정 해칭이다. 영화 느와르 전체를 대표한다는 이름을 사용하지 않는다.

필수 기능:

- 문·계단·복도·식물 등 교체 가능한 geometry/mesh를 받아 shot별 공간 변형을 적용한다. 변형은 rest geometry와 절대시간에서 평가한다.
- orthographic/perspective camera, 제한된 dolly/구도 키, 명시적 light rig와 그림자 동선을 제공한다. 실제 light shadow와 저작 shadow decal/gobo를 구분한다.
- 제한 tone ramp/toon material, UV에 고정된 hatch atlas와 톤별 밀도, 선택 가능한 외곽/내부선 처리를 제공한다. 곡면/평면·회전·조명 변화에서 해칭이 붙어 있는지 확인한다.
- 초기 대상은 UV가 준비된 단순 세트와 rigid mesh다. 선 두께·해칭 주파수/LOD를 최종 해상도에 맞춰 조정한다. 외곽선 방식의 내부선 누락·틈·알파/교차 한계를 표시한다.
- depth 기반 안개/가림 합성과 배우·카메라의 독립 exposure를 제공한다. 모든 장면에 과한 기울기/비네트를 강제하지 않는다.
- 로컬 비압축 GLB와 기본 animation clip을 가져와 절대시간으로 평가하는 adapter를 제공한다. loader의 전이 import·texture·LICENSE를 고정한다. 고급 압축 decoder·자동 rig retargeting·임의 skinned mesh의 안정된 자동 선 추적은 후속이다.

필수 데모 두 내용:

1. 좁은 역의 마지막 열차: 인물/열차보다 먼저 도착하는 긴 그림자, 문턱과 원근, 제한된 톤을 보여준다.
2. 거대한 잎이 있는 식물 연구실: 다른 내용에서 같은 표면·조명·카메라·가림 도구를 쓴다. 곡면과 이동 조명에서 선과 형태의 가독성을 확인한다.

toon material 하나나 화면 해칭 필터만으로 완료하지 않는다. 임의 표면 방향장/자동 UV·원 논문의 전체 tonal art map 시스템을 재현했다고 주장하지 않는다. 이 범위의 UV atlas 접근과 품질 한계를 문서화한다.

## 6. 공용 효과·애니메이션의 필수 범위

아래는 구현 목표와 제안 이름이다. 코드를 읽어 중복 없이 배치하고, 이름을 정하면 문서·registry·실제 exports·예제를 일치시킨다. 최소 사용 예제는 실제 실행되게 한다.

### 시간·애니메이션·공간

- `sampleExposure` / `poseAt`: frame/hold/on-twos/비균일 exposure 및 절대 pose 평가. 카메라·재료·캐릭터별 시간 선택을 분리한다.
- `prepareRig2D` / `evaluateRig2D`: rest transform·부모 계층·hinge 제한과 pose 표. 입력을 보존하고 cycle/잘못된 parent/범위를 검증한다. 간단한 2-bone IK는 실제 데모에 필요하면 추가하되 범용 캐릭터 자동 리깅으로 표시하지 않는다.
- `evaluateShot` / `projectPlanes`: camera/shot/2.5D 투영·안전 영역·가림의 공용 처리. 2D canvas와 3D world/camera 좌표 변환을 adapter가 소유한다.
- `prepareClip3D`: clip, loop, weight, timeScale와 노출을 명시적으로 고정한 절대시간 평가. 임의/역순 seek에서 action 이벤트·fade·이전 상태가 결과를 바꾸지 않게 한다.

### 공용 2D FX

- 복합 path/alpha mask와 reveal·erase·occlusion.
- 압력 획·seeded brush/dab·재료 고정 grain.
- 중첩 wash/glaze와 제한된 edge-pigment 근사.
- 톤/방향을 받는 hatch/stipple. 화면/종이/물체 중 anchor 좌표를 선택한다.
- 장막/iris·mask match transition과 명시적 경계.
- seed+ID+절대 age로 평가되는 2D emitter/형태 형성, 독립 시각 샘플을 합성하는 analytic trail. 기존 particles가 실제 제공하는 형상 보간과 일반 emitter를 구별한다.

### 공용 3D FX

- tone-ramp/toon·UV hatch material, 선택적 rigid mesh outline.
- 재사용 가능한 light/shadow/gobo 설정과 저작 shadow overlay.
- rest mesh 기반의 제한된 세트/유기 형상 변형.
- seed+ID+age 기반 instanced particle/dust. draw 이전 상태나 누적 physics에 의존하지 않는다.
- depth fog와 WebGL→Canvas 투명 합성 adapter.

각 효과는 스타일과 독립된 입력·출력·단위·기본/권장 범위·개수/메모리 상한·실패 조건·dispose 소유권을 가진다. 각 스타일은 필요한 효과를 조합하며 모든 효과를 기본으로 켜지 않는다. 고급 fluid/cloth/volumetric/temporal denoise를 이 목록의 단순 효과와 혼동하지 않는다.

### 미학을 유지하는 시간 규칙

`frame`은 출력 시각이고 `exposed`는 저작한 유지 시각이다. 인물·획·camera·grain·light가 어느 시간을 소비하는지 spec에 명시한다. `Math.random`, 벽시계, draw 호출 횟수, RAF delta 누적, 이전 출력 버퍼에 의존하지 않는다. seed는 revision/개체/효과/노출 ID와 안정적으로 연결한다.

유체·물리 등 누적 방식이 꼭 필요해지는 후속 작업은 고정 timestep/초기조건/solver/seed를 기록하고 bake/checkpoint를 별도 설계한다. 이번 초기 세 팩이 그 미구현 확장에 의존하지 않게 한다.

## 7. 공개 API·파일 구조·생성 경로

권장 구조는 다음과 같다. 실제 기존 구조와 맞춰 소규모로 조정할 수 있으나 공용 라이브러리·스타일 구현·자산·데모의 소유 경계를 유지한다.

```text
modules/
  animation/          exposure, rig2d, clip3d, shot/camera
  fx2d/               mask, stroke, wash, hatch, transition, emitter/trail
  fx3d/               toon/hatch, outline, light/shadow, deform, particles, fog
  styles/             silhouette-theatre, line-wash, expressionist-space
catalog/
  styles.json         버전·실제 지원 기능·의존성·예제 인덱스
recipes/styles/       스타일별 기본 recipe와 예제 입력
scripts/
  materialize-style.mjs
examples/styles/      세 팩의 소형 자산·서로 다른 두 내용·재생성 코드
references/styles/    index + 세 미학의 제작 지침
tests/                수학·입력·통합·렌더·seek/freeze 회귀
```

각 style module은 기존 레이어 계약을 따른다.

```js
// 미래 구현의 공개 진입점. 현재 존재하는 export라고 주장하지 않는다.
export async function prepare(api, config) {
  // 자산을 로드/검증하고 소유 renderer/geometry/brush 등을 한 번 준비한다.
  return {
    evaluate(t) { /* frame/exposed/channels -> 직접 평가한 상태 */ },
    draw(g, t, state) { /* 현재 상태의 합성만 수행 */ },
    dispose() { /* 자신이 소유한 자원만 해제 */ }
  };
}
```

`dispose`는 새 하위 호환 optional 계약이다. 현재 compositor가 자동 호출한다고 가정하지 말고 compositor/player/테스트 등 실제 생성·교체·종료 경로까지 연결한다. 기존 `{manifest,draw}` 사용자는 유지하고 부분 prepare 실패도 자원을 정리한다.

제안 제작 API:

```js
await materializeStyle({
  project: '/absolute/unused/project',
  style: 'line-wash',
  scene: authoredSceneSpec,
  assets: localAssetManifest,
  seed: 17
});
```

이 제작 API는 manifest/modules/assets/preset/version 정보를 생성한다. 새 프로젝트 생성과 기존 generated 파일 업데이트의 정책을 구분한다. `writeOwnedFiles`의 소유권 ledger 보호를 재사용하며 사용자가 고친 파일을 덮지 않는다. 기존 함수가 여러 파일 쓰기의 완전한 rollback을 제공한다고 가정하지 않는다. staged 생성·검증·게시와 실패 시 남기는 상태를 정의한다.

CLI도 실제 연결한다. 예를 들어 `direction style list`, `direction style build STYLE --scene SPEC --project NEW` 같은 동작으로 스타일과 입력·지원 상태를 조회하고 프로젝트를 생성할 수 있게 한다. 정확한 명령은 구현 시 하나로 확정하고 help·문서·스킬·테스트를 맞춘다. 기존 play/frame/render/freeze 경로로 이어지게 하며 별도 편집 앱은 만들지 않는다.

registry에는 id/version/status, 실제 export, input/output/units, renderer/dependency, deterministic mode, 한계·호환 조합·fallback, 예제·증거를 담는다. `implemented`, `experimental`, `planned`, `unsupported`를 구별한다. 첫 A/B/C의 필수 기능을 planned로 남겨 완료 수를 채우지 않는다.

## 8. 외부 라이브러리와 배포

기본은 Canvas2D/SVG와 이미 설치된 Three r180이다. 이미 검증된 코드·자산을 재사용할 실제 이득을 먼저 찾는다. 필요한 도구를 모두 새로 만들거나 설치 목록만 늘리지 않는다.

- Rough.js: sketch/hachure, Paper.js: 준비 단계 path 처리, Inkwell: NPR 효과 구성, PixiJS: GPU sprite/filter, GSAP: 저작 타임라인 등의 후보를 필요에 따라 평가한다. 라이브러리 이름을 스타일 구현의 근거로 대신하지 않는다.
- 도입 전 정확한 버전과 API, local import/전이 의존성, seed/seek, 색/alpha, license, 실제 작은 장면의 결과를 확인한다. 채택/미채택 이유와 근거를 남긴다. React/R3F가 없어도 가능한 기능 때문에 UI 스택을 확대하지 않는다.
- Three addon은 build 파일 둘의 기존 freeze만으로 따라오지 않는다. 사용한 r180 addon과 전이 import·decoder·texture·LICENSE를 명시적으로 로컬 패키징한다. 비압축 GLB의 지원 한계를 알리고 미지원 extension은 설명과 함께 실패시킨다.
- 외부 CDN, 전역 설치 경로, mutable node_modules가 없어도 frozen 프로젝트가 같은 환경에서 동작하게 한다. 허용한 package 파일만 복사하며 프로젝트 밖 임의 경로를 참조하지 않는다.
- 종이·stroke·hatch atlas·font·GLB 종속 자산도 revision에 포함한다. WebGL2가 필요하면 capability를 검사하고, 미지원 환경에서는 명시적으로 실패하거나 사용자가 선택할 수 있는 bake/2D 대안을 안내한다. 표현을 조용히 바꾸지 않는다.
- GPU resource의 geometry/material/texture/render target/composer/mixer 소유권을 명시한다. 반복 준비/해제와 renderer 교체에서 누수를 검사한다.

## 9. 색·투명도·공간 해상도

1. 저작 sRGB·linear 조명·최종 display/영상 변환 경계를 명시한다. tone mapping·output conversion을 두 번 적용하지 않는다. color texture와 normal/depth/roughness 등 data texture를 구별한다.
2. premultiplied alpha와 straight alpha의 경계를 결정한다. WebGL→Canvas, mask/blur/glaze와 export에서 검정·흰 배경의 fringe를 확인한다.
3. 선 폭·hatch/종이 주파수·mask 해상도·shadow 해상도의 단위를 문서화하고 540p/1080p에서 확인한다. 물체 UV·종이·화면 좌표를 혼동하지 않는다.
4. 최종 MP4는 기존 H.264 yuv420p/AAC 계약이다. 내부 alpha 합성이 투명 MP4를 지원한다는 뜻은 아니다. PNG/내부 합성과 인코딩 결과의 차이를 기록한다.

## 10. 구현 순서와 중간 산출물

### 단계 0 — 기준·공개 계약·작은 기술 확인

기존 동작 기준을 기록하고 registry/자산·시간·자원 계약, 파일 소유 경계를 먼저 확정한다. 필요한 외부 코드 재사용과 r180 addon/freeze 경로를 작은 실행으로 확인한다. 이 단계의 보고만으로 전체 작업을 완료하지 않는다.

### 단계 1 — 공통 기반과 A

노출/pose·rig2d·path/mask·multiplane·transition·materialize를 구현하고 A 두 내용을 렌더한다. 한 장면의 도형·keyframe이 공용 코드에 묶이지 않았는지 확인한다.

### 단계 2 — B와 재료·획 도구

압력 획·워시·지움·redraw·종이 고정 재료를 구현하고 B 두 내용을 렌더한다. 과거 렌더 순서 없이 동일 프레임을 재구성하는지, 동작 중 선·종이가 불필요하게 흔들리지 않는지 확인한다.

### 단계 3 — 3D 기반과 C

로컬 GLB/clip adapter와 GPU lifecycle, toon/hatch·outline·light/shadow·geometry/camera/fog·3D particles를 구현한다. C 두 내용과 표면·카메라·clip의 임의 seek를 검증한다.

### 단계 4 — 조합·스킬·문서·최종 검증

공용 FX 단독 데모, 2D/3D 혼합 장면, 세 팩의 스킬 references와 registry·CLI 도움말, 반복 재생성 예제를 완성한다. 기술·시각 검토와 독립 검토 결과를 인계한다. 첫 세 팩을 완성하기 전에 네 번째 팩으로 범위를 분산하지 않는다.

## 11. 데모와 재사용의 수용 기준

- A/B/C마다 서로 다른 내용의 **6–10초 움직이는 데모 최소 두 개**, 총 최소 여섯 개를 제공한다. 기본 24fps, 540p preview와 1080p export. 각 style마다 세로 구성의 대표 구도도 한 번 확인한다.
- 두 내용은 동일 library export를 사용하고 주로 spec/자산/연출 데이터를 바꾼다. 데모마다 새 renderer·새 rig 평가기·새 brush를 작성해 범용성을 대신하지 않는다.
- 각 데모는 단순 효과 나열보다 시작→변화→마무리의 읽히는 사건을 가진다. 주요 pose·질감·공간·가림이 출력 크기에서 읽혀야 한다.
- 공용 효과는 별도 분리 예제로 기본값, 범위 끝, 시간 변화, 투명 합성, 대표 실패 조건을 확인한다. 하나의 effects reel로 묶어도 되지만 개별 효과와 실제 API를 찾을 수 있게 한다.
- 2D/3D 혼합 예제에서는 공유 사건/카메라 또는 가림·합성 중 한 관계를 실제로 연결한다. 기존 typed channel로 전달할 값과 모듈 내부 값을 구분한다.
- 소형 자산·recipe·재생성 명령·대표 프레임·revision/job/log·사용 코드·출처를 함께 남긴다. 범용성 증거가 한 인형의 색 교체에 그치지 않게 한다.
- 무음 데모는 허용한다. 기존 observe의 유음 조건 때문에 의미 없는 소리를 몰래 추가하지 않는다. 음악을 쓰는 경우 출처·사용 범위·싱크를 기록하고 직접 청취 여부를 구분한다.

## 12. 기술·시각 검증과 완료 판정

적절한 검증을 구현과 함께 실행한다. implementation을 그대로 따라 쓰는 테스트를 늘리는 대신 실제 계약·실패·재사용·합성 회귀를 검증한다.

필수 기술 검사:

1. 입력/범위/단위, rig cycle·잘못된 path/pressure/correspondence, preset·unsupported 조합, 과도한 개체/해상도, 오류 메시지와 입력 불변성.
2. 첫/마지막 유효 프레임과 각 cut/exposure/clip 경계의 전·해당·후 프레임. `[from,to)`와 on-twos/비균일 hold, 연속 camera와 held pose 혼합.
3. 같은 프레임의 정방향·무작위·역순·반복·끝→처음 seek 상태와 실제 이미지. 같은 renderer·브라우저/GPU 환경에서는 픽셀 비교를 우선하고, 차이가 나면 원인과 허용 오차를 근거로 명시한다. 서로 다른 GPU/OS bit exact를 약속하지 않는다.
4. freeze 후 저작 소스/원본 자산을 변경하거나 분리해도 frozen 결과가 유지되는지, 모든 import와 자산이 로컬인지, 기존 revision은 변하지 않는지.
5. 실제 headless 렌더의 page/console/shader/decode 오류, 전체 프레임 수와 PTS, 중간 실패 산출물 게시 방지, 새 데모의 자동 재생 완료. 자동 재생은 사람이 연속 시청했다는 증거로 쓰지 않는다.
6. 540p/1080p의 선·구멍·해칭·mask, 색 patch·검정/흰 배경 반투명 edge와 최종 인코딩 프레임. surface/material이 카메라에 따라 미끄러지거나 의도치 않게 flicker하는지.
7. 고정 기준 장면·해상도·장비에서 준비 시간과 warm-up 후 frame 시간(p50/p95), 측정 가능한 memory/draw call을 보고한다. API 입력 상한과 품질 단계를 둔다. 장비/GPU memory 등 측정 불가능한 항목은 미측정으로 남기고 근거 없는 실시간 성능을 약속하지 않는다.
8. 반복 prepare/dispose·부분 실패 후 cleanup과 같은 자원 반복 사용, `npm test` 전체 회귀 및 필요한 CLI/packaging 검사. 오래된 통과 수를 가져오지 않는다.
9. 완성 여섯 영상과 effects/혼합 reel에 현행 수정된 flash-risk 검사를 적용한다. 결과는 제한된 자동 선별로 보고하고 인간 접근성/의료·WCAG 인증이나 예술적 수락으로 확대하지 않는다.

시각 검토는 별도로 기록한다. A는 실루엣·관절·가림·공간, B는 획·워시·여백·선의 시간 안정성·인물 접지, C는 형상/원근·그림자·표면선·암부의 행동 가독성을 본다. 세 미학의 차이를 팔레트 설명 없이도 실제 출력에서 확인할 수 있어야 한다. 경계/대표 프레임만으로 동작 전체의 품질을 인정하지 않는다.

현재 허용된 독립 검토 수단이 있으면 제작에 참여하지 않은 검토자에게 실제 요청·지원 계약·출력과 근거를 제공한다. 사용자의 모델 다양성 요청을 구현/검토에 적용할 경우 실제 CE/CO·모델·역할·thread를 기록한다. 도구 실행 없는 감사는 근거 감사로 구별한다. 독립 검토나 사람의 연속 시청·직접 청취를 수행하지 못하면 정확히 미확인으로 남긴다.

필수 기능/데모가 실패했으면 수정·재검증한다. 일정이나 토큰을 이유로 B를 blur, C를 대비 필터로 대체하거나 세 번째 미학을 planned로 남겨 완료 처리하지 않는다. 해결할 수 없는 막힘은 실패 근거와 요구를 유지하는 대안을 보고한다.

## 13. 협업·범위 관리·최종 인계

T3로 위임하는 경우 사용자에게 보여 준 범위 안에서 실행한다. 공용 API와 파일 소유자를 먼저 정하고 공유 checkout의 같은 파일을 여러 구현자가 동시에 바꾸지 않는다. worktree를 쓰려면 T3가 관리하는 isolation을 사용하며, 미커밋 기준 코드가 자동 포함되지 않는 문제를 해결한 후에만 맡긴다. 부모 commit 기준의 빈 구현을 새 정본으로 삼지 않는다. workflow나 새 top-level thread를 임의로 만들 필요는 없다.

초기 범위 밖의 연구 후보는 직접 필름/기하학 음악, 콜라주, 현대 그래픽 셀, 망점/리소, 촉각적 스톱모션, 고급 수채 유체·retarget·cloth·임의 mesh 자동 선 추적·외부 DCC bake다. 공용 기반에서 어떻게 추가할지 extension point와 현재 unsupported/planned 상태를 문서화하되 첫 A/B/C를 대신하지 않는다.

이번 범위는 라이브러리·스킬·자산/recipe·데모다. Music Box Dancer 완곡 재제작, 범용 웹 편집기/DAW/SaaS, 사용자 미디어의 공개/외부 업로드, 전역 스킬 설치 변경, commit/push/PR/배포는 별도 사용자 요청 없이 수행하지 않는다.

최종 인계에는 다음을 포함한다.

- 무엇을 재사용했고 무엇을 새로 구현했는지, 세 팩과 공용 2D/3D FX의 실제 API·지원표.
- 여섯 데모·효과 단독/혼합 예제·대표 프레임의 절대 경로와 재생성 명령.
- 자산/라이브러리 출처·고정 버전·LICENSE, 스타일별 선택 근거·한계.
- 기존 변경과 이번 변경 목록, 테스트/시각 검사/독립 검토의 실제 결과와 남은 미확인 사항.
- 소스 정본·배포·materialize 업데이트 방법, 새 미학팩을 추가하는 짧은 예제.

완료 조건은 세 미학팩과 실제 공용 효과를 다른 내용에 재사용해 렌더·검토할 수 있는 상태다. 사용자의 최종 미학 수락은 별도로 받으며 테스트 통과만으로 작품 취향·수락까지 완료했다고 기록하지 않는다.

---

**실행 전 상태를 다시 확인한다: 이 프롬프트는 사용자 검토용이며, 사용자의 진행 요청 전에는 실행하지 않는다.**
