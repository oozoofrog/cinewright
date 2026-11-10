# 미학 툴킷 phase02 후속 인계

2026-11-08. **승인된 세 축의 구현·통합·독립 검토 2회·지적 수정·재검증을 완료했다. 최종 전체 회귀는 472/472 통과다.** 최신 수락 기록은 이 문서 말미에 추가한다. 승인 정본은 `2026-11-08-aesthetic-toolkit-followup-execution.md`다.

## 실제 구현

물리 수채는 기존 `wash.mjs` polygon glaze와 별도인 `modules/fx2d/watercolor.mjs`다. 닫힌 격자의 쌍별 물 확산/안료 이류·확산, 종이 흡수·증발 sink, mobile→deposited 침착을 계산한다. 초기 dry-empty, solver 버전, seed, dt/step, 해상도, 계수·brush event가 bake에 들어간다. 완성된 frame 배열을 직접 조회하므로 역순 seek가 과거 재생을 요구하지 않는다. CLI worker는 실행 중 signal 취소와 임시 파일 cleanup을 지원하며, hard-link 게시로 기존 파일을 교체하지 않는다. 실제 물감의 유체역학·광학 전체 재현이 아닌 제한된 수송 모형이다. 방정식·수지·안정성·단위·비용은 [수채 reference](../../references/styles/watercolor-physical.md), 팀 검사/영상은 [수채 인계](2026-11-08-phase02-watercolor.md)에 있다. `watercolor-physical` 새 스타일을 명시적으로 선택하며 `scene.overlay`로 line-wash를 선택 합성한다. line-wash 기본 paper/glaze 동작은 유지했다.

자동 rig는 정적 UV 표면의 80개 단면에서 사지/몸통 위치를 측정하는 `autoRig`다. 기존 rig 로더가 아니며 메쉬 이름 분기가 없다. 서로 다른 비율의 연결된 정적 biped 두 개에 같은 코드로 bone hierarchy/rest bind 및 4개 skin indices/weights를 생성했다. 선택 landmark가 있으면 추정값을 덮는 수동 힌트로 출처를 기록한다. 데모 두 개는 힌트 없이 생성됐다. 대상은 기준축이 명시된 대칭 직립 T/낮은 A 포즈이며, 곧은 사지와 분리된 다리가 필요하다. elbow/knee의 중간점 prior와 거리 기반 weight이므로 임의 인체의 해부학 자동 추정·손/얼굴·동물·옷을 지원하지 않는다. Three 실제 SkinnedMesh와 JOINTS_0/WEIGHTS_0·inverseBindMatrices를 갖는 GLB로 저장/재로딩한다. 원본 표면·profile·rig·GLB·motion·CC0 notice는 `examples/styles/phase02-rig/assets/{tall,broad}`다. 자세한 API/실패 진단/연구·라이선스는 [auto-rig reference](../../references/styles/auto-rig.md)에 있다.

리타게팅은 `C S(t) S0^-1 C^-1 T0`로 rest world 회전과 좌표축을 보정하고, 부모 역회전으로 local pose를 복원한다. 단위/비율 root scale, semantic/name mapping, root apply/extract/inPlace, loop/weight/timeScale, absolute integer frame sampling과 source 없는 local pose bake를 제공한다. 두 source motion을 비율·bone 이름·rest frame·축이 다른 Reed/Copper에 모두 적용했다. author가 명시한 contact window/연속 접촉에서 발 원점을 ground plane으로 보정하는 bounded analytic two-bone IK가 있다. knee plane/도달 불가/관절 flexion/최대 보정량을 진단하며 발바닥 충돌·수평 foot-lock·접촉 자동 추정·pelvis balance는 지원하지 않는다. [retarget API/출처/한계](../../references/styles/retarget.md), [실제 수치/팀 인계](2026-11-08-phase02-retarget.md)를 함께 읽는다.

expressionist-space 1.1은 명시적 `object.rig`/`motion`/`playback`과 embedded uncompressed GLB skin을 지원한다. UV hatch와 skinning 전 extrusion outline을 실제 deforming mesh에 적용한다. skinned rest deform/저작 rigid 내부선 조합은 진단하며 rigid fallback을 하지 않는다. camera/light/actor exposure는 분리된다. `materializeStyle`은 64MiB JSON 자산 byte ceiling, solver/rig/motion validation 및 rig↔motion rest 호환성을 게시 전에 검사한다. 모듈·자산·기존 GLTFLoader→BufferGeometryUtils closure와 Three r180 MIT notice를 local freeze한다. SkeletonUtils는 실제 r180 소스·전이 import를 검토했으나 채택하지 않았으므로 새 숨은 addon 의존성은 없다. Node ESM, manifest v1, `[from,to)`, 기존 typed channel/prepare/evaluate/draw/dispose 계약을 보존했다.

## 실제 사용

```sh
# 공용 제작과 스타일 목록
node scripts/direction.mjs style list
node scripts/direction.mjs style build watercolor-physical --scene SCENE.json --assets ASSET-MAP.json --project /absolute/unused/project

# 물리 bake (출력 존재 시 거부)
node scripts/watercolor-bake.mjs INPUT.json OUTPUT.json
node scripts/watercolor-examples.mjs

# 정적 geometry JSON → 추정 rig 또는 실제 skin GLB
node scripts/auto-rig.mjs STATIC.json OUTPUT.rig.json PROFILE.json
node scripts/auto-rig.mjs STATIC.json OUTPUT.glb PROFILE.json --glb
node examples/styles/phase02-rig/build.mjs /absolute/unused/tall tall
node examples/styles/phase02-rig/build.mjs /absolute/unused/broad broad

# 다른 골격으로 motion bake
node scripts/retarget-bake.mjs SOURCE.rig.json TARGET.rig.json SOURCE.motion.json OUTPUT.motion.json OPTIONS.json
node examples/styles/phase02-retarget/build.mjs /absolute/unused/stride stride
node examples/styles/phase02-retarget/build.mjs /absolute/unused/salute salute

# 기존 공용 freeze/renderer 사용
node scripts/direction.mjs freeze /absolute/project --store /absolute/store
node scripts/direction.mjs render /absolute/project --store /absolute/store
npm test
```

```js
import {autoRig,createRiggedMesh} from './modules/animation/auto-rig.mjs';
import {bakeRetarget,createRetargetPlayer} from './modules/animation/retarget.mjs';
import {bakeWatercolor,decodeWatercolor} from './modules/fx2d/watercolor.mjs';
const rigJSON=autoRig(staticGeometry,{profile:'upright-biped',left:[1,0,0],up:[0,1,0],forward:[0,0,1]});
const rig=createRiggedMesh(rigJSON,material);
const bake=bakeRetarget(sourceRigJSON,rigJSON,sourceMotionJSON,{fps:24,rootMotion:'apply',contact:{ground:.14,maxCorrection:.35}});
const player=createRetargetPlayer(rig,bake,{fps:24,loop:true,weight:1,timeScale:1});
player.evaluate(96); player.evaluate(0); player.evaluate(96);
player.dispose(); rig.dispose(); // supplied material is caller-owned
const waterBake=bakeWatercolor(waterInput); const frame=decodeWatercolor(waterBake,96);
```

source motion은 기존 Three AnimationClip을 그대로 받는 형식이 아니라 문서화한 local quaternion/position tracks JSON이다. 공개 예제의 JavaScript와 JSON을 재사용하며 전역 설치가 필요하지 않다.

## 최종 움직이는 자료와 대표 프레임

현재 코드의 정본은 아래 1920×1080·24fps 영상 6개다. 다섯 개는 8초/192frame이고 salute는 9초/216frame이다. 수채는 solver3으로 새로 bake했다. 기존 540p 6개와 이전 solver2의 1080p 수채 2개도 보존하여, 이번 후속 과정에서 만든 영상은 총14개다. 이전 결과를 최신 성공으로 바꿔 기록하지 않았다.

| 내용 | 최신 1080p 영상 | 대표 프레임 |
| --- | --- | --- |
| wet-on-wet·흡수 | [영상](/Volumes/eyedisk/develop/cinewright/.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd-v3/store/jobs/2781fec5-694d-4db9-ab44-cafc538ab406/work.mp4) | [frame63](/Volumes/eyedisk/develop/cinewright/evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/fullhd-v3/wet-video-63.png) |
| 두 안료 겹침·건조 | [영상](/Volumes/eyedisk/develop/cinewright/.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd-v3/store/jobs/171a8060-5da8-45cd-b4a8-d23250096281/work.mp4) | [frame63](/Volumes/eyedisk/develop/cinewright/evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/fullhd-v3/overlap-video-63.png) |
| tall 자동 rig 변형 | [영상](/Volumes/eyedisk/develop/cinewright/.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd/store/jobs/d4f706ac-2b7f-40ec-a1eb-d25ace2fca61/work.mp4) | [frame63](/Volumes/eyedisk/develop/cinewright/evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/fullhd/tall-video-63.png) |
| broad 자동 rig 변형 | [영상](/Volumes/eyedisk/develop/cinewright/.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd/store/jobs/298b7180-cd24-4101-a1d2-0f79621eb87f/work.mp4) | [frame63](/Volumes/eyedisk/develop/cinewright/evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/fullhd/broad-video-63.png) |
| stride 세 골격 비교 | [영상](/Volumes/eyedisk/develop/cinewright/.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd/store/jobs/a24bb8c5-65d3-4db4-8fa5-66d329016c57/work.mp4) | [frame63](/Volumes/eyedisk/develop/cinewright/evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/fullhd/stride-video-63.png) |
| salute 세 골격 비교 | [영상](/Volumes/eyedisk/develop/cinewright/.direction/aesthetic-toolkit-phase02-2026-11-08/fullhd/store/jobs/a1c96d56-d09b-4b45-a448-3c2ecf9951cb/work.mp4) | [frame63](/Volumes/eyedisk/develop/cinewright/evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/fullhd/salute-video-63.png) |

현재 6개 revision/job/hash/파일·프레임·PTS·flash·전체 길이 native 자동 재생 기록은 `evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/fullhd-current/`에 모았다. 각 저작 project 경로를 없앤 상태로 public frozen renderer를 실행했다. 모든 frozen module/runtime bytes가 현재 소스와 일치한다. source와 snapshot은 별도로 남겨 재제작할 수 있다.

## 검사와 실제 한계

이번에 baseline436/436, 첫 통합466/466, 첫 독립 지적 수정 후470/470을 각각 실행했다. 최신 결과는 마지막 확인 기록을 따른다. 기존 숫자를 새 성공으로 재사용하지 않았다. 물/안료 수지·비음수·finite·경계·brush event·재bake hash·CLI 취소/게시 실패, rig rest/bind/정규화/범위/연결/축/변형/stretch/실제 GLB 재로딩, retarget rest/축/비율/root/접지/도달불가/loop/weight/timeScale을 검사한다. 직접·역순·반복·end→start pose/skin/image seek와 source 없는 frozen decode/import, shader/alpha/색/두 해상도, 실패 cleanup/dispose도 검증했다. 전체 test 파일을 순차 실행해 GPU 검사 충돌을 피한다.

- 수채: 단순 닫힌 격자의 수송·흡수 sink이며 종이 내부 물의 별도 장, 압력 유체, 섬유/광학/실물 안료 혼색 교정은 생략한다. seed는 현재 metadata다. 눈에 보이는 격자와 기존 polygon보다 큰 저장/준비 비용이 있다. JSON byte/수치 배열 budget은 전체 JS heap 상한이 아니다. Float64 극미량 경계 정책을 문서화했다.
- rig: 정면축·연결·대칭·분리된 곧은 사지의 T/낮은 A 포즈가 필요하다. 두 voxel 표면은 재사용 증거이며 임의 production 인체를 보장하지 않는다. 측정 단면과 midpoint elbow/knee prior, 거리 weight이므로 crease/부피 붕괴·자기 교차가 남는다. 실제 rest bind 오차 <2e-7m는 해부학 추정 오차가 아니다.
- retarget: 두 motion×두 target에서 sample foot-origin RMS 오차 0.023–0.139m가 약1e-15m로 줄었고, 최대 보정0.051–0.234m는 설정 상한0.35m 이하다. 발바닥·스킨 관통·수평 미끄러짐의 측정이 아니다. window/continuous 접촉은 명시하며 자동 접촉 추정·수평 anchor lock·terrain·pelvis balance는 없다. weight<1 또는 subframe 보간에서는 접지 오차가 다시 생길 수 있다.

rig는20,280/19,800정점, JSON약2.8MB다. 관측 Node 추정은약34–47ms, 재구성약3ms였으며 GC를 통제한 성능 보장이 아니다. RSS/heap은 `coordinator/rig-performance.json`, 수채의 준비/JSON/heap 관측은 `watercolor/memory-measurements.json`과 reference에 있다. solver3은 donor budget/incoming 분리로 scratch Float64 grid 하나가 늘었다(256×256에서512KiB). 다른 GPU/OS의 pixel 일치는 보장하지 않는다. 직접 Canvas readback 결정성은 최초 context의 명시적 willReadFrequently 정책과 테스트 환경에 한정한다.

## 독립 검토와 수정 이력

[첫 독립 보고서](2026-11-08-phase02-independent-review.md)는 당시 request-changes다. 수채 frame58 실패, rig-only inverse-bind 사전 검증 누락, contact 옵션 검증, Canvas context 정책과 1080p 증거를 총괄이 보완했다. [새 독립 재검토](2026-11-08-phase02-independent-recheck.md)는 원래 주요 지적의 해소와 1080p 6개를 직접 확인했고, P2는 새로 찾지 않았다. 마지막으로 극미량 물의 음수 quantum과 비활성 sink label이라는 P3 두 건을 남겼다.

총괄은 이 작은 지적을 직접 수정해 solver3으로 기록했다. donor budget 방식은 음수 물을 버리는 clamp 없이 수송량을 제한하고, sink 계수 비율을 먼저 계산해 비활성 sink가 정확히0이 되게 한다. 임계값320개와 sink90개, 원래 실패 입력 및80개 drying 궤적을 다시 검사했다. 완성된 v1/v2 bake decode는 유지한다. [구체 수정·재검증](2026-11-08-phase02-review-closure.md)에 각 근거가 있다. 두 독립 보고서는 수정 전 판정으로 보존하며, 마지막 총괄 수정을 제3의 독립 승인으로 표현하지 않는다.

## 실제 모델·팀과 보존

공용 계약과 파일 소유권은 `docs/research/aesthetic-toolkit-phase02-2026-11-08/COMMON-CONTRACT.md`, 실제 API receipt는 같은 폴더의 `TEAM-RECEIPTS.json` 및 `INDEPENDENT-RECHECK-RECEIPT.json`이다. capabilities에서 지정 provider/model을 확인한 뒤 shared dirty checkout으로 직접 child 동시 최대2를 지켰고 구현 child의 추가 하위 팀은 없었다.

- 총괄·rig·통합: `codex-eyemacworld` / `gpt-6.1-sol`, reasoningEffort `ultra`.
- 수채: `codex-oozoofrog` / `gpt-6.1-terra`, reasoningEffort `ultra`. <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3Ab88709ec-8074-49e1-adc4-fdc0404c54cd%3Adelegate-task%3A505c9e10-babc-43f8-97f1-c23b459fec21>
- retarget: `codex-eyemacworld` / `gpt-6-astra`, reasoningEffort `ultra`. <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3Ab88709ec-8074-49e1-adc4-fdc0404c54cd%3Adelegate-task%3A1da56e1f-4579-47b3-abda-ef12ff74425a>
- 독립 검토: `codex-oozoofrog` / `gpt-6.1-sol`, reasoningEffort `ultra`. <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3Ab88709ec-8074-49e1-adc4-fdc0404c54cd%3Adelegate-task%3A4f16e02f-1fbc-4aed-9bba-eff981a71547>
- 새 독립 재검토: `codex-oozoofrog` / `gpt-6.1-sol`, reasoningEffort `ultra`. <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3Ab88709ec-8074-49e1-adc4-fdc0404c54cd%3Adelegate-task%3Ae9528ba1-e29f-4857-bc41-ab79c96b2d6d>

최초 baseline의 보호13,007파일은 초기 증거/원곡/Music Box Dancer/연구/global-update를 포함하며 hash 변경·누락0이다. 독립 재검토는 당시 기존14,691파일까지 별도 감사해 변경0을 확인했다. HEAD/index는 그대로이며 commit/stage/reset/stash/clean/push/PR/배포·전역 설치·원본 미디어 외부 전송을 하지 않았다. 새 bake/render/evidence는 모두 phase02 경로에 있다.

## 마지막 확인 기록

최종 solver3 상태에서 `npm test` **472/472 통과, 실패0**, 114.3초다. 로그는 [final-v3/regression.log](../../evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/final-v3/regression.log)다. 마지막 두 P3 수정의 CPU focused 11개와 v3 수채 두 frozen 영상의 역순/반복/end→start 각각9개 pixel 비교, 임계값320개/sink90개와80개 drying 궤적, v3 수채 영상의 전체 native 자동 재생/PTS/flash, 최신6개 frozen source audit를 확인했다. 모든 최신 영상은1920×1080/24fps이며 현재 source 경로 없이 재생된다. 최종 source/미디어/보존 근거는 [final-evidence-index.json](../../evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/final-evidence-index.json)에 모았다.

초기 보호13,007파일 변경·누락0, HEAD/index불변이며 스킬 validator도 통과했다. 첫 독립검토와 새 독립재검토의 지적은 모두 구체 수정·직접 재검증했다. 마지막 P3 수정에 대한 제3의 독립 무조건 승인은 없으며 당시 request-changes 보고서를 보존한다. 승인된 제한 입력 범위의 구현 납품은 완료로 판정한다. 사람의 직접 연속 시청·청취·예술/접근성 수락은 별도 미확인이다.

재현 시 기존 결과를 덮지 않는 새 run tag를 쓴다:

```sh
node scripts/phase02-fullhd.mjs NEW-RUN-TAG wet overlap tall broad stride salute
node scripts/phase02-fullhd-check.mjs NEW-RUN-TAG wet overlap tall broad stride salute
```

