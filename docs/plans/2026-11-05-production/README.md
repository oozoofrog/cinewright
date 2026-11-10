# Cinewright 제작 절차와 재사용 모듈 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 사용자가 구현·검증을 이미 지시했다. 별도 설계 인터뷰나 재승인 없이 지정된 실행 담당자가 이어서 수행한다.

**Goal:** 작법·제작 비전문가의 의도를 구체화하는 제작 절차와 두 재사용 모듈을 작은 두 예제, 실제 출력과 제한된 성능 측정으로 검증한다.

**Architecture:** `modules/cuts.mjs`가 편집 원본을 기존 exposure·points·spans로 변환한다. `modules/artwork.mjs`는 기존 `prepare/draw` 계약 안에서 원본 좌표 anchor와 균일 배율 배치를 제공한다. 지침·작법 참조·예제·검증은 이 두 모듈을 사용하는 하나의 산출물이며 새 manifest나 런타임은 만들지 않는다.

**Tech Stack:** Node.js >=22, ESM, `node:test`, Canvas 2D, 기존 playwright-core 1.64.1·three 0.180.0, Chromium, FFmpeg/FFprobe. 준비된 의존성을 사용한다.

**Spec:** [사용자가 실행을 지시한 전체 명세](</Users/oozoofrog/.codex/attachments/719e1e4f-035f-4c52-a332-e075fee4c60a/붙여넣은 텍스트.txt>). 이 계획은 명세를 대체하지 않는다. 명세는 최종 프롬프트와 마지막 개행 유무만 다르다.

## 공통 제약

- 구현 모델은 `gpt-6-astra` / `max`다. 작업 저장소는 `/Volumes/eyedisk/develop/cinewright`다. 사전 기준은 `main`, `5bd6d89763dd500d0fd85903bf8c288775e4ac0e`다. 현재 변경을 먼저 확인하고 보존한다.
- `/Volumes/eyedisk/Videos/MusicVideos/Counting Star` 전체와 `/Users/oozoofrog/.codex/skills/cinewright`에는 쓰지 않는다. 새 파일·실행 기록은 작업 저장소 안에 둔다. 새 브랜치·워크트리·채팅·앱 프로젝트, 커밋·푸시, 설치·배포, persona·team-coordination은 금지다.
- 기존 manifest version 1, CLI, asset 레이어 배치, 예제, 고정 개정본, 채널과 오디오 시계를 유지한다. 유효 프레임은 `[0,frames)`이며 points는 `0..frames-1`, span.to는 `frames`까지다.
- 정수 FPS 1–120, 짝수 해상도 각 변 16–4096은 입력 범위다. 성능 보장으로 쓰지 않는다. `every`는 `t.exposed`만 양자화하며 `sample` 기본은 linear다. hold는 명시한다.
- 원본 alpha·opacity·mask·blend, 48kHz 스테레오 배치, gain·`normalize=0`, H.264 yuv420p/AAC 출력을 유지한다. 중간 작화·블렌드·블러와 투명 MP4를 자동 지원한다고 하지 않는다.
- 두 예제와 원본 SVG 상당 자산 3–4개로 제한한다. 새 편집기·장면 관리·캐시·lazy loading·범용 QA·마스터링·애니메이션 체계를 만들지 않는다.
- 작법·제작의 비전문성은 경험·감상·취향·판단의 부족이 아니다. 명시적 행동·스타일·사실을 지키고, 기존 위임을 재질문하지 않는다. 가상 예제의 선택 권한은 이미 주어졌으며 실제 사용자 합의와 구분한다.
- 리더가 `evidence/2026-11-05-production/protected-before.json`, 보호 경로 사후 기록과 `research-notes.md`를 소유한다. 실행 담당자는 이 파일을 덮어쓰지 않는다. 보호 스냅샷은 설치본 64개 소스·리소스, 비교 하위 경로 1,011개 파일과 Counting Star의 추적 Git 상태에 한정한다.
- 리더가 확인한 기준선은 기존 테스트 8/8, doctor와 help 통과다. 입력이 바뀌지 않은 기준 검사를 중복 실행하지 않는다. 변경 후 필요한 전체 회귀는 수행한다.

## 검토에서 놓치기 쉬운 조건

1. crop 원점이 바뀌어도 원본 anchor의 목표는 같다. anchor가 crop 밖에 있다는 이유만으로 오류 처리하지 않는다. → 작업 2의 좌표·화면 밖 배치 검사.
2. 마지막 경계는 span의 끝이지만 탐색 point가 아니다. 빈 구간은 이전 원화를 유지하지 않는다. → 작업 1·4의 종료·빈 구간 검사.
3. 잘못된 이름·상속된 키·겹치는 컷과 디코드 실패를 조용히 대체하지 않는다. → 작업 1·2의 오류 검사.
4. 작업 저장소의 원본이 바뀌거나 없어도 복사한 프로젝트와 이전 revision이 실행된다. → 작업 4의 독립 복사·고정 개정본 검사.
5. 풍부하지만 비전문적인 요청이나 피드백을 단순화하지 않는다. 실제 위임이 없으면 실행 승인을 지어내지 않는다. → 작업 3·5의 제작 절차 행동 검증.

## 파일과 책임

| 파일 | 책임 |
| --- | --- |
| 새 `modules/cuts.mjs` | 외부 의존성 없는 순수 컷 변환기 |
| 새 `modules/artwork.mjs` | 순수 배치 계산과 기존 prepare/draw 어댑터 |
| 새 `tests/cuts.test.mjs`, `tests/artwork.test.mjs` | 변환·기하·오류 계약 |
| 새 `tests/stillcuts.integration.test.mjs` | 실제 Canvas·CLI·복사·freeze 회귀 |
| 수정 `SKILL.md`, `references/direction.md`, `references/format.md`, `references/tools.md`, `README.md` | 제작 대화·판단·검토, 두 모듈 사용과 실행 근거 |
| 새 `references/craft.md`, `references/stillcuts.md` | 여섯 분야의 출처와 실용적 전이, 스틸컷·모듈 계약 |
| 새 `examples/stillcuts/source.mjs`, `build.mjs`, `scene.mjs`, `assets/`와 생성한 `a/`, `b/` | 하나의 가상 의뢰, 두 안, 자체 완결 프로젝트 |
| 새 `evidence/2026-11-05-production/BRIEF.md`, `REVIEW.md`, `RESULT.md`, `measure.mjs`, `performance.json` | 가상 대화·판단, 실제 검토, 결과와 제한된 측정 |

런타임·기존 CLI·패키지 선언은 변경 대상이 아니다. 테스트 결과가 현재 계약의 결함을 드러내면 원인과 최소 수정 필요를 먼저 기록하고 명세 범위 안에서 판단한다.

## 작업 1: 컷 편집 원본을 기존 시간 계약으로 변환

**Interfaces:** `compileCuts(spec) -> { exposure, points, spans }`를 `modules/cuts.mjs`에서 export한다. 입력을 변경하지 않고 새 JSON 호환 객체를 반환한다. 이 모듈은 런타임 파일이나 외부 패키지를 import하지 않는다.

```js
const spec = {
  frames: 12,
  boundaries: [
    { name: 'start', frame: 0 }, { name: 'turn', frame: 4 },
    { name: 'return', frame: 6 }, { name: 'end', frame: 12 },
  ],
  artworks: { waiting: {}, turned: {} },
  cuts: [
    { name: 'wait', from: 'start', to: 'turn', artwork: 'waiting', every: 2 },
    { name: 'gap', from: 'turn', to: 'return', empty: true },
    { name: 'answer', from: 'return', to: 'end', artwork: 'turned' },
  ],
  spans: [{ name: 'exchange', from: 'turn', to: 'end' }],
};
```

- `boundaries`는 이름과 숫자를 한 번만 정의하는 엄격한 오름차순 배열이다. 첫 경계 0, 끝 경계 frames를 요구한다. cuts는 저자가 쓴 순서대로 전체 범위를 연속 분할한다. 빈 구간은 `empty:true`로 명시한다. 자동 정렬·구간 보정은 하지 않는다.
- 각 일반 컷의 `artwork`는 `artworks`의 own key여야 한다. 이 값이 exposure.value가 된다. 기본 every는 1이다. 빈 컷은 artwork와 every를 갖지 않고 exposure에서 빠진다.
- points는 종료 경계를 제외한 모든 boundary 이름이다. spans는 모든 cut 이름과 추가 spans다. 추가 span이 생성 cut span과 충돌하면 거부한다. points·spans는 런타임처럼 별도 이름 공간이다.
- 비정수·비유한 수, 역전·중첩·범위 초과·암묵적 구멍, 중복 boundary/cut/span 이름, 없는 참조와 생성 이름 충돌은 필드·이름을 포함한 일관된 오류로 드러낸다.

- [ ] `tests/cuts.test.mjs`를 작성하고 `node --test tests/cuts.test.mjs`에서 모듈 부재의 RED를 기록한다. 위 입력은 exposure가 `[{from:0,to:4,every:2,value:'waiting'},{from:6,to:12,every:1,value:'turned'}]`, points가 `{start:0,turn:4,return:6}`, spans.exchange가 `[4,12]`임을 검사한다. 기존 `cues`와 `exposure`로 frames 4·5의 비활성과 종료 계약도 검사한다.
- [ ] 같은 입력에서 turn만 4→3으로 바꿔 앞 컷 끝·빈 컷 시작·points.turn·spans.wait/gap/exchange가 모두 갱신되는지 검사한다. 위 오류 조건과 `artwork:'toString'` 같은 상속 키 참조도 검사한다.
- [ ] `compileCuts`를 구현하고 해당 테스트를 통과시킨다. 입력 불변성, 같은 입력의 동일 출력과 생성 이름 정책을 검사한다. 별도 schema 버전이나 direction CLI 명령은 추가하지 않는다.

## 작업 2: 원본 좌표 anchor와 균일 배율 배치

**Interfaces:** `modules/artwork.mjs`는 다음 두 export만 제공한다. Node·브라우저 양쪽에서 import 가능하며 외부 의존성이 없다.

```js
artworkPlacement({ sourceSize: [width, height], crop, placement, canvasSize })
// -> { source: [sx,sy,sw,sh], destination: [dx,dy,dw,dh], scale, clip }
prepare(api, { artworks }) // async -> { draw(g, t) }

// artworks[id]
{
  asset: 'assets/pose.svg', crop: [40, 20, 80, 40],
  placement: { anchor: [60, 30], at: [120, 80], scale: 2 }
}
// 또는 placement: { fit: 'contain' | 'cover', box?: [x,y,width,height] }
```

- crop 기본은 원본 전체다. source 크기·crop은 유한하고 양수인 범위를 요구하며 crop은 원본 안에 있어야 한다. anchor와 at은 유한 좌표다. scale은 유한 양수의 스칼라다. anchor가 crop 밖이거나 결과가 캔버스 밖인 것은 허용한다.
- anchored 배치에서 `dx=at.x-(anchor.x-crop.x)*scale`, `dy`도 같은 식이다. source와 destination의 종횡비를 보존한다.
- fit과 anchored 필드는 섞지 않는다. fit 기본 box는 전체 캔버스다. contain은 최소 배율로 가운데 배치하고 여백을 투명하게 둔다. cover는 최대 배율로 가운데 배치하고 해당 box로 clip한다.
- prepare는 모든 artwork를 `api.image(asset)`로 준비한다. `naturalWidth/naturalHeight`로 계산하고 오류에는 artwork ID·asset을 남긴다. draw는 `t.value`의 own key로 원화를 선택하며 알 수 없는 값은 거부한다. save/restore로 상태를 보존하고 source alpha나 합성기의 opacity·mask·blend를 덮어쓰지 않는다.
- 시간 트랙 API를 추가하지 않는다. 작품 wrapper가 유지할 위치를 `t.exposed`로, 독립적인 빛 등을 `t.frame`/`t.seconds`로 계산하고 helper를 호출한다.

- [ ] `tests/artwork.test.mjs`에서 RED를 확인한다. 위 anchored 입력의 destination은 `[80,60,160,80]`이다. 다른 crop 원점으로 바꿔도 같은 원본 anchor가 `[120,80]`에 놓이는지, contain/cover가 균일 배율인지 검사한다.
- [ ] 0·음수·NaN·Infinity 배율, 비유한 좌표, 잘못된 크기·crop, fit/anchor 혼합, 잘못된 fit, 알 수 없는 value, 이미지 준비 실패를 검사한다. 화면 밖 목표와 crop 밖 anchor는 정상 입력으로 검사한다.
- [ ] 두 export를 구현하고 단위 검사를 통과시킨다. source alpha·mask·blend의 실제 픽셀 결과는 작업 4에서 기존 합성기를 통해 검사한다.

## 작업 3: 제작 절차와 작법을 두 작은 예제로 연결

**Interfaces:** `source.mjs`는 공통 가상 의뢰·공유 자산과 두 안의 manifest 기본값·cut spec을 export한다. `node examples/stillcuts/build.mjs`는 작업 1의 결과를 기존 `work.json`에 넣고 a/b 프로젝트를 생성한다. 두 프로젝트에 원본 자산·scene.mjs·필요한 helper를 파일로 복사하여 런타임 import가 프로젝트 밖으로 나가지 않게 한다. 생성 입력을 `source.json`으로 함께 보존한다. symlink는 사용하지 않는다.

- [ ] 리더의 `research-notes.md`에서 원문이 확인된 영화·만화·철학·시각예술·연극·뮤지컬 자료를 받아 `references/craft.md`에 정리한다. 분야마다 상황·장면 목적, 표현·관객 단서, 현재 구현·자산, 실패 관찰, 저자·제목·직접 링크·장/절/쪽을 적는다. 출처 주장과 애니메이션 전이를 구분하며 연극과 뮤지컬을 합치지 않는다. 미확인 출처는 확인된 것처럼 쓰지 않는다.
- [ ] `SKILL.md`와 direction 참조를 사용자 원문→의도 확인→단서→2–3개 대안·권장→선택/기존 위임→제작·검토 흐름으로 갱신한다. 기억·취향·반응을 존중하고 소수의 의미 중심 질문, 짧은 합의 요약, 가상 대화를 넣는다. 필수 지시와 해석 가설을 분리하며 기술 설문·반복 승인을 요구하지 않는다. 기존 구조 비교·전체 초안·매체 상호작용·증거 구분을 유지한다.
- [ ] `references/stillcuts.md`에 원화 선택·hold·교체·크롭·시선·무게·접촉, 판단 사슬, 움직임 성격·간격·안착·후속 반응, 의도적 정지·침묵과 재설계 기준을 연결한다. 두 helper의 정본·복사·생성 명령·재생성 시점과 입력/출력/오류 계약을 문서화한다. README·format·tools의 링크와 기존 의존성 준비 시 재설치하지 않는 안내를 맞춘다.
- [ ] 예제 제작자가 가상 의뢰와 반드시 보여야 할 행동·사실을 `BRIEF.md`에 고정한다. 두 안은 각각 정지·여백·생략 중심, 구도·시각 처리·시간 관계의 차이로 구성한다. 각 안은 6–8초, 640×360, 24fps 이내로 만들고 3–4개의 작은 자체 SVG를 공유한다. 작은 규모는 스킬·모듈 검증 때문이며 취향의 수준과 무관하다. 오디오는 목적이나 동기 검증에 필요한 경우만 작은 자체 자산을 쓴다.
- [ ] 동일 helper를 사용해 a/b를 생성한다. 길이가 다른 hold, hard cut, atlas crop·anchor, 노출 시간에 머무는 위치와 독립 시간의 빛, 경계 수정 전후를 예제 또는 작은 fixture에서 드러낸다. 생성 파일을 직접 편집하는 대신 source와 build 경로를 사용한다. 2–3개 방향 비교 기록과 최종 두 출력의 목적 차이를 연결한다.
- [ ] 리더와 같은 행동 검증 상황으로 갱신 후 응답을 확인한다. 기존 기준선은 두 대안·우산 기울임·젖은 어깨·귀엽지 않은 톤을 보존했다. 선택/위임을 명시적으로 요청하지 않았지만 실제 제작을 시작하지도 않았다. 이를 무조건 실패로 바꾸지 않는다. 갱신 후에는 미위임/기존 위임, 명시적 행동/모호한 수단, 경험 있는 비전문가의 피드백을 구분하는지 기록한다. 이 제한된 검사가 모든 의뢰의 효과를 증명하지는 않는다.

## 작업 4: 실제 출력·복사·고정 개정본 검증

**Interfaces:** `tests/stillcuts.integration.test.mjs`는 기존 integration의 `browser`, `freeze`, `host`, `mix`와 CLI 실행 패턴을 따른다. 기록 경로는 `.direction/test-runs/` 또는 `.direction/production/` 안에 둔다. 새 범용 테스트 프레임워크는 만들지 않는다.

- [ ] 192×108 또는 320×180의 작은 fixture에서 RED/GREEN을 수행한다. 투명 SVG·crop·원본 anchor·기존 asset 레이어·opacity·mask·blend를 실제 Canvas 픽셀로 확인한다. 원화 위치가 t.exposed로 유지되는 동안 다른 요소가 t.frame으로 달라지고 gap에서는 해당 레이어가 사라지는지 검사한다.
- [ ] `[0, 경계-1, 경계, 경계+1, frames-1]` 중 유효한 프레임을 정방향·역방향·고정 임의 순서로 조회한다. 같은 frame의 상태와 PNG가 동일해야 한다. 같은 해상도의 CLI frame PNG도 직접 평가와 같아야 한다. 종료 경계 frames를 seek하지 않는다.
- [ ] canonical 두 helper를 별도 프로젝트에 복사하고 프로젝트 내부 import로 생성·freeze·재생한다. 필요한 파일이 revision index에 포함되었는지 확인한다. 원본 프로젝트의 경계·원화를 바꾼 새 revision이 달라지고 이전 revision은 같은 상태·화면을 계속 내는지 검사한다. canonical 절대 경로에 의존하는 import가 없는지 확인한다.
- [ ] `npm test`로 기존·신규 전체 회귀를 수행하고 전체 로그를 보존한다. 관련 변경이 없는 doctor/help는 리더 기준선을 재사용한다. 환경이나 실행 파일이 바뀌었다면 해당 검사를 다시 한다.
- [ ] 두 안을 각각 freeze한 뒤 같은 revision으로 `play`, `frame REVISION POINT`, `render REVISION --span NAME`, 전체 `render REVISION`을 실행한다. 모두 `--store .direction/production`으로 격리하고 실제 hash·point·span·job ID·명령·출력을 RESULT에 적는다. CLI `play` 서버는 검증 뒤 종료한다.
- [ ] 전체 MP4를 각 안의 실제 타이밍·평가 크기로 재생한다. ffprobe로 길이·FPS·프레임 수·PTS를 확인하고 decode한 경계와 핵심 동작 띠를 PNG·live 결과와 비교한다. MP4 압축을 픽셀 동일성 조건으로 만들지 않는다. alpha는 투명 합성/PNG에서 확인한다. 오디오가 있으면 끝 잘림·피크·해당 사건의 동기를 확인하되 기존 probe의 한계를 지킨다. 로그·스크린샷·파형은 청취가 아니다.

## 작업 5: 제한된 성능 측정과 최종 검토

**Interfaces:** `evidence/2026-11-05-production/measure.mjs`는 이번 측정 전용이며 `performance.json`과 전체 로그를 출력한다. 공개 CLI나 자동 품질 점수 엔진으로 만들지 않는다.

- [ ] 실행 전에 다음 입력과 횟수를 기록한다. 모든 입력은 320×180·24fps다. 기준은 4컷·4자산·96프레임, 비교는 24컷·4자산 재사용·576프레임과 24컷·24개 작은 합성 fixture 자산·576프레임이다. 조건마다 새 브라우저로 3회 측정한다. 큰 입력의 전체 영상은 렌더하지 않는다.
- [ ] freeze 뒤 페이지 탐색 시작→준비 완료·첫 frame 0까지의 시간, 지정 탐색 8회·역방향 8회·미리 고정한 임의 탐색 8회를 측정한다. 각 seek와 화면 readback의 범위를 명시한다. 각 실행의 Node·브라우저 하위 프로세스 RSS와 측정 디렉터리의 파일 바이트를 기록한다. 브라우저 시작·freeze·디스크 범위의 포함 여부를 적고 OS 임시 경로를 측정하지 못하면 한계로 남긴다. 실제 컷·고유 파일·재사용 수와 도구·호스트 버전을 함께 기록한다.
- [ ] 실제 두 출력에 대해 핵심 구간별 유지·수정·재설계, timestamp/frame, 관찰, 원인, 다음 확인을 REVIEW에 적는다. 매 회차 가장 약한 구간을 지목한다. 구조를 고친 경우 자기 타이밍으로 다시 재생하고 같은 시각 비교는 회귀에만 사용한다. 대표 스틸 외에 조밀한 핵심 동작 띠와 전환 경계를 확인한다.
- [ ] 리더가 원래 요청·확정한 해석과 제약·의도한 hold/정지·실제 출력을 독립 검토자에게 전달한다. 제작자 설득이나 자체 점수는 제외한다. 필요한 결함을 고친 뒤 관련 검사만 반복한다. 독립 관찰 수단이 없으면 미검증으로 남긴다. 검토자 유지 판정, 제작자 판단, 관객 반응과 사용자 수락을 구분한다.
- [ ] 리더의 보호 경로 사후 확인과 변경 파일 목록을 받아 RESULT를 완성한다. 보호 근거의 제한된 범위를 명시한다. 변경 목적·조사·복사 방법·실행 명령·테스트·revision/job ID·출력/전체 로그·표현 차이·성능 조건·실패와 재시도·미확인을 보고한다. 작품의 차이는 사용자 목적·경험·취향과 연결하며 기법 수나 정상 렌더만으로 표현 성공을 주장하지 않는다.

## 완료 기준과 인계

두 helper의 의미 있는 회귀, 기존 전체 테스트, 두 안의 동일 revision 실행, 독립 복사와 이전 revision의 재현, 필요한 출력 검사, 정해 둔 성능 측정, 문서·출처와 검토 기록이 갖춰지면 완료한다. 관찰·청취·독립 검토가 불가능한 항목은 수행한 것으로 기록하지 않는다. 코드·문서의 완료와 예술적 불확실성·사용자 수락을 구분한다. 이 계획에는 커밋·설치·배포나 새 채팅 생성 단계가 없다.
