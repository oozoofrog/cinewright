# 미학 툴킷 구현 인계

2026-11-08. **요청한 세 팩·공용 FX·자산·영상·CLI의 초기 구현·통합·검증을 마쳤다.** 마지막 수락 상태와 최신 검사 수치는 이 문서 말미의 확인 기록을 따른다. 사용자 미학 수락·인간의 연속 시청·접근성 평가는 별도 미확인이다.

## 구현과 사용 경로

세 독립 팩은 `modules/styles/{silhouette-theatre,line-wash,expressionist-space}/index.mjs`의 실제 `validateScene`/`prepare`를 공개한다. 동일 renderer에 scene/자산/pose/shot을 바꾸어 각 두 내용의8초·192frame·24fps 영상을 만들었다. 팔레트/화면 필터로 팩을 세지 않았다.

- A: SVG/commands/구멍/alpha, 부모 hinge rig와 제한·pose bank, hold/연속 camera 분리, plane/가림/coverage, iris/curtain/match·halo·종이 가장자리·별도 그래픽 그림자. 숲의 여우/토끼, 등대가 배를 인도하는 항구.
- B: 압력 cubic/중심선·호길이 reveal, seeded dab·종이 고정 grain, glaze/edge-pigment 근사, redraw/boil/대응점, ledger/사각 mask 지움과 잔흔. 비가 멎는 잎/웅덩이, 접지 후 편지를 펼치는 통근자.
- C: 실제 Three geometry/카메라/UV, toon/ramp·표면 고정 atlas·rigid outline/저작 내부선, 조명/shadow map/gobo·별도 그래픽 그림자, rest 변형·analytic instanced dust·depth fog·투명 Canvas adapter, 로컬 embedded GLB/절대 clip. 마지막 열차의 역, 거대 잎 연구실.

정본은 repo의 modules/recipes/examples/references다. 루트 SKILL은 기존 단일 진입점이며 wrapper는 정본을 가리킨다. [스타일 지침](../../../references/styles/index.md), [효과 API·기본값·상한·dispose](../../../references/styles/effects.md), `catalog/styles.json`/`effects.json`이 실제 exports와 연결된다. Node ESM, manifest v1, `[from,to)`, 기존 number/vec2/boolean/string/path 채널을 유지했다. GPU 객체는 내부 소유이며 채널로 전달하지 않는다.

```sh
node scripts/direction.mjs style list
node examples/styles/silhouette-theatre/build.mjs /absolute/unused/forest forest
node examples/styles/line-wash/build.mjs /absolute/unused/rain rain
node examples/styles/expressionist-space/build.mjs /absolute/unused/station station
node scripts/direction.mjs preview /absolute/unused/forest --store /absolute/store
node scripts/direction.mjs render /absolute/unused/forest --store /absolute/store
```

직접 API는 `materializeStyle({project:absolute,style,scene,assets:{'assets/name':absoluteFile},seed,update:false})`. CLI는 `direction style build STYLE --scene SPEC --assets MAP --project NEW [--update]`. 저작 데이터를 기존 manifest로 컴파일하며 자산·의존 모듈·버전/해시·소유 ledger를 패키징한다. 누락/잘못된 필수 자산은 게시 전 거부한다. 새 프로젝트는 stage 검증 후 rename한다. update는 전체 stage 복사와 생성 파일 해시 검사 후 디렉터리를 교환하며, 사용자 수정·unknown 파일을 보존한다. 외부 동시 편집을 잠그는 서비스는 아니며 중단 시 이웃 `.style-backup-*` 복구 경로가 남을 수 있다. 기본 `writeOwnedFiles`를 원자적 다중 파일 트랜잭션이라고 주장하지 않는다.

새 팩은 ID/버전과 validateScene/prepare/선택 collectAssets를 추가하고, 명시적인 module dependency closure·자산 map·catalog·두 내용의 recipe/예제·집중 reference·검증을 연결한다. 추가 런타임 schema나 별도 웹 편집 앱은 필요하지 않다.

## 영상과 대표 프레임

절대 루트: `/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/`. 각 디렉터리에 `540p.mp4`, `1080p.mp4`, 대표 `frame-104-{540p,1080p}.png`, 상세 validation/job/revision/PTS/flash가 있다. 아래 A 숲/C 영상은 유효 장면의 그림을 바꾸지 않은 입력 검사/metadata 보완 후 **현재 source와 기존 영상 revision의 픽셀 동등성**을 reviewed-source-final에서 별도로 확인한다. 항구와2D FX는 zero-progress reveal 수정 후 새 영상으로 교체했다. 옛 revision을 새 revision으로 바꿔 부르지 않는다.

| 팩/내용 | 1080p 영상 절대 경로 | 540p·대표 frame·근거 |
|---|---|---|
| A 숲 | [forest](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/A/forest-v3/1080p.mp4) | 같은 디렉터리540p/frame104, 최신 source는 reviewed-source-final/A/forest |
| A 항구 | [harbor](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/A/harbor-closed-reveal/1080p.mp4) | 같은 디렉터리540p/frame104, 진행률0 수정 후 새 revision |
| B 비/정물 | [rain](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/B/rain-reviewed/1080p.mp4) | 수정 압력 renderer, 같은 디렉터리540p/frame104 |
| B 통근자 | [commuter](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/B/commuter-reviewed/1080p.mp4) | 새 contact bank, 같은 디렉터리540p/frame104 |
| C 마지막 열차 | [station](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/C/station-final/1080p.mp4) | 같은 디렉터리540p/frame72/104/191, 최신 source 동등성 별도 |
| C 식물 연구실 | [laboratory](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/C/laboratory-final/1080p.mp4) | 같은 디렉터리540p/frame104, 최신 source 동등성 별도 |

공용 단독/혼합 예제:

- [2D effects](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/effects2d-closed-reveal/1080p.mp4): mask/구멍/iris, 압력/dab/glaze, object hatch/paper stipple, redraw/erase, emitter/trail, 흑백 배경 color/alpha 패널. `examples/styles/effects2d`의 실제 import 코드를 재사용한다.
- [3D effects](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/C/effects/1080p.mp4): 곡면·평면·rest 변형·로컬 clip을 분리. 별도 alpha/color/resource probe가 있다.
- [2D/3D mixed](/Volumes/eyedisk/develop/cinewright/evidence/2026-11-08-aesthetic-toolkit/C/mixed/1080p.mp4): 하나의 number 사건이 실제 조명과 Canvas annotation을 함께 바꾼다. 실제 카메라 투영한 specimen 원점 vec2를 다음 Canvas layer가 읽는다. 투영점은 가시성/depth 판정이 아니다.

위 세 예제에도 같은 디렉터리의540p/frame104가 있다. 세로 대표는 `post-recheck-source/A/portrait/frame-96-540p.png`, `reviewed-source-final/B/portrait/frame-96-540p.png`, `C/portrait/frame-96-540p.png`다. A 세로 가림 문제를 수정한 새 구도를 사용한다. 무음 작품이며 의미 없는 음악은 넣지 않았다. 기존 player/MP4 계약의 silent transport AAC는 청취 검증이 아니다.

기존 생성 프로젝트는 `.direction/aesthetic-toolkit-2026-11-08/{A,B,C}/`, job/revision/store는 각 팀 아래다. 검증 재생성은 `node examples/styles/validate.mjs PROJECT STORE NEW_EVIDENCE`. GPU 명령은 공통 잠금을 획득하고 finally에서 해제하며 서버/브라우저도 닫는다. 완성 영상을 이유 없이 재렌더할 필요는 없다.

## 승인 정본 대조표

| 요구 | 실제 지원/산출물 | 검사/한계 |
|---|---|---|
| §1 보존·호환 | baseline 상태/patch/427개 hash, 기존 dirty checkout, manifest v1·typed channel | preservation-audit.json의 HEAD/index 동일·허용 외 변경0 |
| §2 스킬·팩·scene·FX·자산5층 | root SKILL→3개 reference, public entries, JSON recipes, animation/fx2d/fx3d, original vector/UV/GLB/pose/clip | actual export map과 CLI 생성 검사; 별도 스킬3개를 만들었다고 세지 않음 |
| §3 A 필수 | 복합 path/구멍/alpha, hinge/pose, plane/camera/가림, reveal/halo/paper-edge, 별도 shadow/진단 | 숲/항구2내용·세로·mask alpha·rig cycle/범위·match bridge; 자동 해부복원 미지원 |
| §4 B 필수 | pressure/arc reveal/dab/wash/glaze/edge/grain/redraw/boil/대응/erase | 비/통근자2내용, 압력/접지 지적 수정·다시 렌더; 물리 유체/흡수/자동 로토 미지원 |
| §5 C 필수 | 실제3D/UV/카메라/조명·그림자·toon/hatch/outline·fog·clip·변형 | 역/연구실2내용, local r180 loader/자산 parse·shader·seek·alpha·dispose; rigid/embedded 한정 |
| §6 시간·공용효과 | exposure/pose/rig/shot/clip; Canvas mask/stroke/wash/hatch/transition/emitter/trail; Three material/light/outline/deform/dust/fog/adapter | 독립 FX reel·기본/상한/invalid CPU 및 색/alpha actual pixel; 누적 physics/feedback 아님 |
| §7 공개 생성 | catalog/styles+effects, materializeStyle, style list/build/help, 기존 play/frame/render/freeze | new/update 보호·필수 자산 사전 검사·현재 exports 대조; 동시 외부 편집 잠금은 제공 안 함 |
| §8 패키징 | Three0.180.0+allowlisted loader 전이 import+MIT LICENSE, local texture/GLB/clip·freeze | offline-local 요청/원본 분리·hash검사; CDN·전역 경로·decoder 의존 없음 |
| §9 색/alpha/해상도 | sRGB 저작·Three linear 조명·한 번 output conversion; premultiplied WebGL/Canvas | 흑백 반투명/구멍/glaze probes, 540/1080 PNG·MP4 색 patch; MP4는 opaque yuv420p |
| §10–11 데모/재사용 | 6개8초 moving demo, 각2해상도, 팩별세로, 2D/3D effect+mixed | 동일 entry 데이터 교체, 원본/명령/대표frame/job/revision/log 함께 보관 |
| §12 기술검증 | invalid/범위/불변·경계·reverse/repeat/end→start seek·freeze·전체frame/PTS·자동재생·섬광·성능·cleanup | 최신 테스트 로그와 각validation; 같은환경 pixels, GPU memory 미측정; full GPU completion 성능 주장 없음 |
| §12 시각·독립검토 | 모델의 표본/접지 좌표 검사와 CO sol 독립 테스트·미디어decode·flash·수정·새 재검토 | 첫 검토 request-changes 보존; 최신 재검토 결과를 말미에 기록; 인간 연속 시청/취향 수락 미확인 |
| §13 팀·인계 | CE sol 총괄/A, CO Terra B, CE Astra C, 별도 CO sol review; 실제 receipts | 초기 B/C partial을 완료로 세지 않고 같은 계정/모델로 보완; 동시 직접child≤2, PR 없음 |

## 실제 검증·남은 한계

각 영상의 정상 완료·프레임 수·PTS·섬광 결과는 validation.json/flash JSON으로 확인한다. 기본 브라우저 검사55회 seek는 source PNG hash와 상태를 비교하고, freeze 뒤 저작 manifest를 잠시 분리/복구하여 frozen pixel을 확인하며, 전체 자동 재생이191frame에 도달하고, 반복 prepare/dispose가 다시 draw를 거부함을 확인한다. 렌더 job은 전체192장을 저장하고 성공 인코딩 후에만 최종 출력으로 rename한다. 기존 실패/cancel 회귀도 full npm test에 포함된다.

첫 독립 검토01은 직접28개focused test,29개standalone 검사,16개영상decode,10개flash 재검사를 수행하고11개수정을 요청했다. 브라우저 잠금 때문에 직접GPU는 미실행이었다. [지적·수정 대응](review-fixes.md)과 원본 report를 모두 남겼다. 수정 후 source 동등성, 영향 영상 재렌더·회귀·새 독립 재검토는 이전 결과에 섞지 않는다.

Canvas 반투명 byte rounding127/128은 수치 probe의0.5alpha 허용치로 명시했으며, seek PNG 비교에는 오차를 주지 않았다. 인코딩 RGB patch 차이는 최대5수준 검사이며 색/alpha 전반의 무오류 보장은 아니다. C 성공 load·missing clip 뒤 복구·반복 dispose의 geometry/texture counter0은 확인했지만 loader가 내부 decode 도중 실패하기 전 모든 자원의 cleanup은 별도 미계측이다.

제약: B 워시는 polygon glaze/edge 근사, 지움 mask는 획당 사각형 하나다. 저작 대응점/접지는 작은 자산 예제이며 자동 작화·범용 해부·IK solver가 아니다. C는 rigid GLB·저작 UV·기본 clip·고정 atlas4density·shell outline/저작 내부선이며 임의 skinned mesh/autoUV/retarget·volumetric·cloth/fluid는 미지원이다. 내부선은 일반 mesh 변형을 자동 추종하지 않는다. 의도한 가림·발·선 주파수/UV seam은 실제 새 자산에서 다시 검토해야 한다.

자산별 라이선스/author/hash/좌표·pivot/alpha/rig/clip은 examples/styles/*/assets의 provenance/metadata에 있다. [의존성 선택·고정 버전·장비/측정 한계](dependencies.md)를 함께 읽는다. 기존 motion/hash/ownership/runtime/pipeline을 재사용했고, 시간·rig·shot/FX/스타일/저작 자산·생성/카탈로그·lifecycle은 이번 범위에서 새로 구현·통합했다. repo-local skill 검사만 private venv PyYAML을 사용했고 전역 설치는 바꾸지 않았다.

## 최종 확인 기록

최종 전체 npm test: **436/436 통과, 실패0** (`final-closed-reveal-npm-test.log`). 이전434개 통과 로그는 마지막 두 결함 수정 전의 별도 기록이다. 여섯 데모+3개효과/혼합 예제의 **18개영상** 모두192frame/24fps/8s, PTS검사와 자동flash screen-negative. A/C 현재 source의 표본 픽셀 동등성은 reviewed-source-final/summary.json, B의 최신 source 대조는 reviewed-source-final/B/summary.json에 별도 기록한다. 최종 미디어/job/프레임/API 근거 인덱스는 final-evidence-index.json. 마지막 reveal 수정 뒤 숲/세로 소스 동등성은 post-recheck-source/summary.json, 항구의 인코딩 첫 프레임 검사는 A/harbor-closed-reveal/encoded-endpoints.json에 있다. 독립 재검토02가 기존 구체 지적을 확인하고 PNG 디코딩·zero-progress reveal 두 문제를 추가로 남겼다. 총괄이 두 문제를 직접 수정하고 실제 브라우저 회귀로 검증했다. 독립 보고서의 request-changes 판정은 당시 상태로 보존하며, 최종 두 수정에 대한 제3의 독립 승인으로 바꿔 기록하지 않는다. [마지막 수정·직접 재검증](recheck-closure.md)을 함께 읽는다.

최종 소스 감사: **12개 scene snapshot의118개 module byte 비교가 현재 repo와 모두 일치** (`final-source-audit.json`). 최종 HEAD/index 동일, 시작 시427개 파일의 허용 외 변경0 (`preservation-audit-final.json`). 생성·렌더·테스트용 브라우저/서버는 finally에서 닫혔고 공통GPU lock은 해제됐다. commit/stage/push/PR/배포·전역 스킬 설치·기존 미디어 정리는 하지 않았다. 구현 인계 상태는 완료이며, 남은 것은 사용자의 시각 취향·연속 감상과 인간 접근성 판단이다.
