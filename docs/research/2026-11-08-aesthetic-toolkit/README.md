# Cinewright 미학 라이브러리 조사 종합

2026-11-08 KST. **조사 및 구현 프롬프트 작성 완료 / 사용자 T3 다중 팀 실행 승인.**

실행 정본: [IMPLEMENTATION-PROMPT.md](IMPLEMENTATION-PROMPT.md). 사용자가 “작성한 프롬프트로 T3 에 다중 팀구성 작업을 위임해주세요”라고 지시해 구현 실행을 승인했다. [실행·팀 구성 기록](../../handoffs/2026-11-08-aesthetic-toolkit-execution.md)에서 현재 상태를 관리한다. 아래 연구 내용은 구현의 통과 증거가 아니다.

## 요청과 연구 범위

사용자는 단일 Music Box Dancer 샘플의 개선보다, 독특한 예술 애니메이션·영화의 표현을 재사용할 JS 라이브러리와 이를 안내하는 스킬 기반을 먼저 요구했다. 최소 세 미학 스타일과 이를 지원하는 공용 2D·3D 특수효과가 필요하다. CE/CO의 다양한 모델로 넓게 연구한 뒤, 실제 구현용 프롬프트부터 제시하라는 최신 요청에 따른다.

조사에서는 12계열을 검토했다: 실루엣, 종이/콜라주, 선·워시, 판화/해칭, 현대 그래픽 셀, 직접 필름/기하학 음악, 표현주의 공간, 스톱모션 재질, 초현실 변형, 로토스코프/스케치, 망점/만화 NPR, 다중평면. 다중평면은 공간 기법으로 보고 별도의 네 번째 미학으로 중복 계산하지 않는다. 이 12계열은 조사 분류이며 모두 초기 구현 약속은 아니다.

## 실제 조사 분담과 기록

아래 계정·모델은 `delegate_task` 반환 및 완료된 `t3_thread_read`의 실행 메타데이터에서 확인했다. 다른 모델을 실행했다고 자기 선언한 문장을 근거로 삼지 않았다. 세 작업은 모두 research 역할, shared checkout, 지정 Markdown만 작성하는 범위였다. 모델 이름을 지정한 호출의 options는 `[]`로 반환됐으며 특정 추론 강도가 적용됐다고 주장하지 않는다.

- **CE / codex-eyemacworld / gpt-6-astra**: [미학·작품·기법](aesthetics.md). 12계열, 자산과 알고리즘, 초기 A/B/C 및 선택 D 제안.
  <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3Aac1fec1c-3804-4fd1-892d-eef9f4bdf565%3Adelegate-task%3Afb2eefeb-29da-4986-ae41-5e205aa0bb15>
- **CO / codex-oozoofrog / gpt-6.1-terra**: [2D·3D FX·런타임](effects-and-runtime.md). Canvas/Three와 외부 후보, 시간·색·alpha·자원 계약 및 검증.
  <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3Aac1fec1c-3804-4fd1-892d-eef9f4bdf565%3Adelegate-task%3A714f664e-2299-4163-843a-32cc13241148>
- **CO / codex-oozoofrog / gpt-6.1-sol**: [스킬·구조·검증](architecture-and-validation.md). 다섯 층의 역할, registry/materialize/자산 계약과 수용 기준.
  <t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/thread:delegated-task:command%3Amcp%3Aac1fec1c-3804-4fd1-892d-eef9f4bdf565%3Adelegate-task%3A9acc4be5-31f2-4749-937b-18484b316feb>
- **부모 통합 조사**: [코드·제작자 자료 대조와 보완](integration-notes.md). Showreel 실제 구조, 선의 시간 안정성, 자산·애니메이션 재사용, r180 addon 배포와 compositor lifecycle 공백을 확인했다.

## Showreel에 대한 결론

사용자의 핵심 이해는 맞다. Showreel에는 실제 공용 엔진·모션 API, 13종 FX, 22종 기법의 코드·레시피가 있다. 이 자산을 장면 제작에 재사용한다. 다만 모든 기법이 import 모듈인 것은 아니며, 특정 영화 스타일 전체를 제공하는 완성 라이브러리로 확인되지는 않았다. [공식 저장소](https://github.com/revfactory/showreel), [FX 소스](https://github.com/revfactory/showreel/blob/main/assets/engine/fx.js), [기법 문서](https://github.com/revfactory/showreel/blob/main/references/techniques.md).

Cinewright의 초기 목표는 이러한 재사용 구조를 **실행 가능한 JS API + 미학별 연출 규칙 + 자산/동작 계약 + 실제 데모**로 더 명시하는 것이다. Three.js 도입이나 단일 절차적 인형의 개선만으로는 이 목표가 충족되지 않는다.

## 권장 초기 구현 세 미학

### A. 실루엣 다중평면 — `silhouette-theatre`

관절이 있는 실루엣, 내부 구멍, 자세 유지와 강조, 전경 가림과 깊이별 이동을 기본 단위로 한다. 같은 도구에 동물/항구처럼 서로 다른 내용을 넣을 수 있어야 한다. 원본/자산은 완성 실루엣 path와 pivot·rig·pose 데이터다. 이미지 한 장에서 좋은 관절·실루엣을 자동 추정하는 기능은 약속하지 않는다.

표현 참고: [의회도서관의 Reiniger 자료](https://blogs.loc.gov/inside_adams/2025/04/lotte-reiniger/). 해당 자료는 작품과 촬영 방식의 참고이며 이번 구현의 픽셀 복제 목표가 아니다.

### B. 선·워시 드로잉 — `line-wash`

압력과 시간이 있는 획, 지움, 종이에 고정된 질감, 중첩 워시, 저작한 redraw를 기본 단위로 한다. 여백과 형태 출현·소멸, hold와 재그리기를 제어한다. 초기 재료는 결정적 stamp/glaze/edge-pigment 근사다. 실제 유체·종이 흡수와 자동 인물 작화는 별도 확장이다.

표현 참고: [NFB의 Caroline Leaf, The Street](https://www.nfb.ca/film/the_street/). 물리 수채와의 차이는 [Curtis 등 저자 연구](https://grail.cs.washington.edu/projects/watercolor/)를 기준으로 명시한다. 이를 동아시아 수묵 전통 전체의 구현으로 부르지 않는다.

### C. 표현주의 판화 공간 — `expressionist-space`

왜곡된 세트, 구성된 원근, 조명과 저작 그림자, 제한 톤과 물체에 붙는 해칭, 선택적 윤곽선을 기본 단위로 한다. Three r180의 실제 3D geometry·camera·material·lighting을 사용한다. 연기와 공간이 읽혀야 하며, 명암 필터나 Dutch angle만으로 완료하지 않는다. 초기 해칭은 저작 UV/atlas와 rigid mesh 중심이다.

표현 참고: [BFI의 Caligari 세트 해설](https://www.bfi.org.uk/features/100-years-cabinet-dr-caligari), [Real-Time Hatching 저자 논문](https://hhoppe.com/hatching.pdf). 원 논문의 임의 표면 방향장/자동 patch 전체를 초기 구현에 포함한다는 뜻은 아니다.

## 모델별 차이와 통합 판단

- Astra는 A/B/C와 선택적 직접 필름 D를 추천했다. Sol은 실루엣/잉크·판화/입체 미니어처를 후보로 냈다. Terra는 특정 작품보다 공용 renderer·시간·효과 경계를 우선했다.
- 초기 범위는 **Astra의 A/B/C를 채택**하고 Sol의 자산·rig·recipe·검증 구조, Terra의 공용 효과와 renderer 계약을 결합한다. 실루엣·획·3D 공간이라는 서로 다른 입력과 저작 행위가 세 미학의 차이를 가장 명확히 만든다고 판단했다.
- 미니어처는 기존 도자기 샘플과 가깝다. 그 자산/코드는 보존하고 재사용 후보로 남기되, 최초 세 팩의 독립성을 높이기 위해 별도 후속팩으로 둔다.
- 고급 브러시를 선택 항목으로만 두면 B가 완성되지 않는다. **압력 획·워시·지움·종이 고정 재료는 필수**, 물리 유체만 후속으로 분리한다.
- 해칭도 일반 FX 후보 수준으로 남기면 C의 정체성이 약하다. **안정된 UV 해칭·톤·세트·조명은 필수**, 임의 skinned surface 자동 선 추적·자동 UV 생성은 후속으로 분리한다.
- 직접 필름 D는 추가하기 쉬운 후보지만 A/B/C를 대신해 최소 세 팩의 수만 채우는 용도로 쓰지 않는다. 콜라주·셀·망점·스톱모션 등 확장 방향은 registry의 planned 항목으로 남길 수 있다.

## 함께 만들어야 할 기반

1. **공용 2D·3D FX**: 경로/mask, 압력 획·워시, 해칭, 노출과 시간 샘플링, 다중평면, 조명·그림자, toon/윤곽, analytic 입자·전환. 실제 API와 단독 데모를 제공한다.
2. **자산·rig·motion**: 자산의 좌표·pivot·scale·alpha·색공간, pose/clip/UV·저작 이력을 보관한다. 자산과 안무를 데모 코드 안에 숨기지 않는다. 소형 예제 자산도 첫 납품 범위에 포함한다.
3. **스타일 스킬과 recipe**: 기존 Cinewright 스킬 하나와 최소 세 스타일 references로 시작한다. 각 지침이 실제 구현된 API·입력·실패 예에 연결되게 한다. 독립 의뢰·도구·절차가 생길 때 별도 스킬로 분리한다.
4. **패키징·lifecycle**: 새 addon/import·자산을 로컬 revision에 포함하고 GPU 자원을 해제한다. 기존 module prepare/evaluate/draw와 manifest v1은 보존한다.
5. **재사용과 시각 검증**: 팩마다 서로 다른 내용의 6–10초 데모 두 개, 총 최소 여섯 개. 공용 효과 단독 데모와 2D/3D 조합도 확인한다. 테스트 통과, 실제 시각적 적합성, 사람의 평가를 구분한다.

## 라이브러리 채택 방향

현재 Canvas2D/SVG·Three 0.180.0을 기본으로 하고 외부 코드의 재사용 이득을 먼저 확인한다. Rough.js는 sketch/hachure, Paper.js는 준비 단계의 복잡한 path, Inkwell은 NPR pass 구조의 후보다. PixiJS는 GPU sprite/filter의 구체적인 필요가 있을 때 검토하고, GSAP/regl/Rive 등은 시간 구동·패키징·추가 의존성을 함께 따진다. 이들은 이번에 설치하거나 실행 비교하지 않았으므로 호환·성능 채택을 확정하지 않았다.

이 선택은 모든 기능을 손으로 새로 구현하라는 뜻이 아니다. 승인 후 첫 단계에서 실제 r180 호환·local freeze·seed/seek·라이선스·시각 이득을 확인하고 재사용 또는 얇은 adapter를 선택한다. 조사에 등장한 모든 라이브러리를 기본 의존성에 넣지는 않는다.

## 연구의 범위와 한계

작품/제작자·기관 자료와 논문/공식 코드·문서를 읽어 표현 문법과 구현 방법을 설계했다. 모든 원작의 전체 영상 연속 시청·노출표 측정·알고리즘 재현 실험을 수행한 연구는 아니다. UPA의 세부 미학은 Astra 조사에서 보강 필요로 남았다. 부모가 [MoMA 작품 기록](https://www.moma.org/collection/works/510020)과 [공식 배급사의 UPA 소개](https://parkcircus.com/latest/P2154-UPA-Cartoons)를 추가 확인했으나, 세부 shot/노출 분석까지 완료한 것은 아니다. 초기 세 팩의 선택을 바꾸는 근거로 사용하지 않았다.

Princeton hatching 페이지는 부모 재확인에서 403이 발생해 저자 Hugues Hoppe의 논문 페이지/PDF로 보완했다. 다른 보고서의 기존 로그·테스트 통과 수는 이번 실행 결과가 아니다. 이번 변경은 이 연구 폴더의 문서 작성뿐이며 기존 구현/미디어/테스트를 변경하거나 실행하지 않았다.
