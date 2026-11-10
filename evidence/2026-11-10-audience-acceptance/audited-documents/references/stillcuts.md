# 스틸컷: 원화, 시간, 배치

스틸컷은 가능한 표현 중 하나다. 원화 수·효과 수·움직임의 양·부드러움으로 완성도를 대신하지 않는다. 정지화면에서는 형태·실루엣·명암·구도·정보 밀도·인물 일관성을 판단하고, 시간 관계는 원래 속도와 평가할 크기의 재생으로 판단한다. 아래 동작·접촉·물성·포즈·편집의 구현과 검사는 의뢰가 해당 동작·접촉·물성을 필수로 명시했거나 원속도에서 관객 수용이 깨진 것으로 실제 관찰되어 원인을 찾을 때 사용한다. 다른 경우 작품에 필요한 수단을 선택하며 이 순서와 검사를 기본 통과 조건으로 삼지 않는다. 벡터·절차적 그래픽·활자·음향·3D·연속 동작도 같은 목적에 따라 선택한다.

## 원화를 고르고 시간을 정하기

[제작 판단 사슬](direction.md#시퀀스의-판단-사슬)을 구간 단위로 쓴다. 원문의 의미에서 필수 행동, 읽을 단서, 화면·소리 선택, 필요한 움직임, 구현과 실패 조건까지 연결한다. 사용자가 이 기록을 작성하게 하지 않는다.

| 선택 | 확인할 관계 | 실패하면 |
| --- | --- | --- |
| 원화와 크롭 | 실루엣·명암·방향·크기와 필요한 행동이 실제 크기에서 읽힌다. | 먼저 보여 줄 사실과 시점을 다시 정한다. 크롭을 늘리는 것만으로 해결하지 않는다. |
| hold와 교체 | 앞 원화를 읽은 뒤 변화의 의미를 알아차릴 시간이 있다. | 무조건 짧게 하거나 움직임을 채우지 말고 hold의 목적·단서를 확인한다. |
| 시선 연결 | 컷 전후의 주요 대상·방향·물건·반응을 이어 읽을 수 있다. | 컷 순서·배치·원화 선택을 바꾼다. |
| 자세 교체 | 크기·실루엣·명암을 직접 판단한다. 위 적용 조건에 해당하면 신발·좌석·손·물건의 접촉도 확인한다. | 원화 불일치는 수정한다. 접촉·물성 구현을 조사할 때 anchor 수치와 실제 윤곽·하중 지점을 따로 검사한다. |
| 정지와 변화 | 무엇이 멈추고 무엇이 변하는지 장면 목적과 맞는다. | 모든 시간을 함께 멈추거나 기본 카메라 드리프트로 빈 시간을 채우지 않는다. |
| 음악과 침묵 | 프레이즈·쉼·긴장·이완과 사건의 관계가 읽힌다. | 매 박자 교체를 기본 규칙으로 쓰지 않는다. 목적 없는 소리를 추가하지 않는다. |

위 적용 조건에서 동작을 구현하거나 원인을 조사할 때 힘의 원인·무게·재질에서 속도 분포를 정한다. 예비 동작과 프레임 간 간격은 사건의 시작과 힘을 알린다. 넘침·안착은 재질에 맞게 쓰며 모든 물건을 튕기지 않는다. 겹침·후속 동작·2차 반응은 주 동작의 결과를 드러낼 때 쓴다. 접촉·가림·빛·배경의 반응도 실제 동작 시험에서 본다.

구도 선택은 [영화의 고정·컷·크롭·공간 이동 구분](craft.md#구도를-유지하거나-바꾸는-선택)에 연결한다. 음악은 프레이즈·쉼·긴장 속에서 언제 유지하고 언제 바꿀지 정한다. 의도한 beat mapping은 컷뿐 아니라 동작·환경 사건에도 배분할 수 있다. 분석된 beat/phase와 source 코드를 읽은 사실은 직접 청취가 아니다.

완전한 정지, 침묵, hold, stepped exposure와 hard cut은 유효하다. 의도한 정지를 결함으로 자동 판정하지 않는다. 반대로 “의도”라는 설명만으로 읽히지 않는 행동을 통과시키지 않는다. 대표 스틸과 가능한 원속도 출력, 전체 초안을 보고 **유지·수정·재설계**를 정한다. 가장 약한 구간의 원인이 구도·행동 단서·전개이면 수치 조정 대신 시점·원화·순서·시간 구조를 다시 정한다.

인접 프레임 사이 형태·위치가 이어지는 기술 속성인 연속성과 서사 가독성이 맞아도 카메라 감각·속도감·음악 관계를 확인한 것은 아니다. 그 판단은 원래 속도의 시청·청취 범위에 한정한다. 재생하지 못한 항목은 미검증으로 남기며 그 항목에 ‘유지’를 확대 적용하지 않는다. 프레임에서만 드러난 시간적 관찰은 위치와 함께 확인 지점으로 넘기고 합의 범위의 제작을 계속한다. 정지화면에서 직접 판단할 수 있는 형태·구도의 문제는 이 인계로 미루지 않는다. 사용자가 실제 출력에 대해 준 과도한 감정·반복 확대 등의 평가는 해당 사용자의 반응 근거로 수정에 사용한다. 모든 관객의 반응으로 일반화하지 않는다.

## 컷 목록의 정본과 생성물

정본 코드는 [`modules/cuts.mjs`](../modules/cuts.mjs)다. 공개 export는 하나다.

```js
import { compileCuts } from './modules/cuts.mjs';
const derived = compileCuts({
  frames: 24,
  boundaries: [
    { name: 'start', frame: 0 },
    { name: 'touch', frame: 8 },
    { name: 'end', frame: 24 },
  ],
  artworks: { raised: {}, resting: {} },
  cuts: [
    { name: 'lowering', from: 'start', to: 'touch', artwork: 'raised', every: 2 },
    { name: 'rest', from: 'touch', to: 'end', artwork: 'resting' },
  ],
  spans: [{ name: 'whole', from: 'start', to: 'end' }],
});
// derived = { exposure, points, spans }
// exposure.value는 'raised' 또는 'resting'이다. 원화 payload는 복사하지 않는다.
// points에는 start: 0, touch: 8만 있다. spans.whole은 [0, 24]다.
```

이 compiler는 패키지·런타임을 import하지 않는다. 입력을 바꾸지 않고 새 JSON 호환 배열·객체를 반환한다. 각 단계의 contract는 다음과 같다.

- `frames`는 양의 safe integer다. `boundaries`는 2개 이상이며 작성 순서대로 0에서 frames까지 엄격히 증가한다. 이름은 중복할 수 없다. 사용하지 않은 내부 경계도 point가 된다.
- `cuts`는 1개 이상이며 작성 순서대로 `[0,frames)` 전체를 빈틈·중첩 없이 분할한다. 각 컷은 알려진 `from/to` 경계를 참조하고 길이가 양수여야 한다. 경계·컷을 정렬하거나 보정하지 않는다.
- 일반 컷의 `artwork`는 `artworks`의 own key다. `artworks`의 payload와 추가 속성은 compiler가 해석하지 않는다. `every`는 생략할 때만 1이며, 지정하면 양의 safe integer다. 컷보다 큰 every도 허용한다. sampling이나 중간 원화를 생성하지 않는다.
- 의도한 빈 구간은 `empty: true`로 쓴다. 이때 `artwork`와 `every`를 아예 생략한다. 빈 컷은 span을 만들지만 exposure를 만들지 않는다. 런타임은 이전 원화를 연장하지 않고 해당 레이어를 생략한다. 다른 레이어의 배경은 남을 수 있다.
- 모든 컷은 **컷 이름 그대로** span이 된다. 선택적 `spans`는 알려진 두 경계 사이 양의 구간을 만든다. 추가 span끼리 겹쳐도 되지만 이름은 생성된 컷 span 및 다른 추가 span과 중복할 수 없다.
- point와 span 이름 공간은 별도다. 한 경계와 컷의 이름이 같아도 된다. 이름·참조는 공백 아닌 글자를 포함한 문자열이며 trim·정규화하지 않는다. `__proto__`, `constructor` 같은 own key도 보존한다. 상속된 artwork 키는 참조할 수 없다.
- 유효 point는 `0..frames-1`이다. 마지막 경계 `frames`는 span 끝에만 쓴다. 기존 CLI는 숫자만 있는 `AT`를 먼저 프레임 번호로 해석한다. 명명한 `frame`·`--from/--to` 조회에는 `touch`처럼 숫자만으로 구성되지 않은 경계 이름을 쓴다. compiler가 숫자 이름을 금지하는 것은 아니다.

오류는 `compileCuts: `로 시작하는 `Error`다. 잘못된 객체·배열·sparse 항목, 비정수·비유한·범위 초과 값, 역전·0길이·중첩·누락, 중복 이름·생성 이름 충돌과 잘못된 참조를 거부한다. 경로·배열 index·유효한 작성 이름·필드·이유를 표시한다. 첫 오류를 결정적으로 보고하고 일부 결과를 반환하지 않는다. 예: `compileCuts: cuts[0] ("lowering").artwork: unknown own artwork key "missing"`.

시간 경계는 편집 원본에 한 번 쓴다. `touch`를 옮긴 뒤 다시 생성하면 양옆 exposure, point와 관련 spans가 함께 바뀐다. 장면 코드도 생성된 `t.value`, `api.point`·`api.span`을 읽어야 동작이 따라간다. 장면 코드에 같은 경계의 프레임 상수를 다시 쓰지 않는다.

## 원화 배치의 정본과 공개 함수

정본 코드는 [`modules/artwork.mjs`](../modules/artwork.mjs)다. 패키지·런타임 import가 없으며 다음 두 함수를 공개한다.

```js
artworkPlacement({ sourceSize, crop, placement, canvasSize });
// { source: [sx, sy, sw, sh], destination: [dx, dy, dw, dh], scale, clip }

await prepare(api, { artworks });
// -> { draw(g, t) }
// artworks[id] = { asset, crop?, placement }
```

`sourceSize`는 원본의 양의 유한 `[width,height]`다. `crop`을 생략하면 전체 원본이다. 지정한 crop은 `[x,y,width,height]`이며 원본 안에 있어야 한다. `x/y`는 0 이상, 크기는 양수, 모두 유한 값이다. 명시적 `undefined`는 생략과 다르다.

두 배치 방식은 섞지 않는다.

| 방식 | 입력·결과 |
| --- | --- |
| 기준점 | `placement: { anchor: [ax,ay], at: [x,y], scale }`. anchor는 **crop 내부가 아닌 원본 이미지 픽셀 좌표**다. `dx = x - (ax - crop.x) * scale`, y도 같다. 하나의 양의 유한 scale을 두 축에 쓴다. |
| 화면·box 맞춤 | `placement: { fit: 'contain' 또는 'cover', box?: [x,y,w,h] }`. box를 생략하면 `canvasSize` 전체를 쓴다. contain은 작은 균일 배율로 중앙 정렬하여 여백을 남긴다. cover는 큰 배율로 중앙 정렬하고 box 밖을 clip한다. |

anchor와 target은 유한한 좌표 쌍이며 소수도 허용한다. anchor가 crop·원본 밖이거나 target이 화면 밖인 배치는 유효하다. 의도한 화면 밖 배치를 입력 오류로 보정하지 않는다. fit의 box 원점도 화면 밖일 수 있다. `fit`과 `anchor/at/scale`을 함께 주거나 fit 없이 box를 주면 오류다. box를 생략한 fit에는 canvasSize가 필요하다. 다른 방식에는 생략할 수 있지만, canvasSize를 주면 항상 양의 유한 크기로 검사한다.

반환 `clip`은 anchor·contain에서 null, cover에서 box다. 반환 배열은 입력을 공유하지 않는다. 오류는 `artworkPlacement:`와 필드·이유를 표시한다. 잘못된 crop·배율·좌표·크기, 결과 계산의 overflow·underflow를 거부한다. 이미지의 종횡비를 축마다 다르게 늘리지 않는다.

`prepare`는 양의 유한 `api.width/height`, `api.image(asset)`와 객체 `config.artworks`를 요구한다. 빈 사전은 허용한다. 각 own 문자열 key의 자산을 미리 읽으며 크기는 디코드한 이미지의 `naturalWidth/naturalHeight`를 쓴다. crop·placement는 위 계약을 따른다. 자산 경로와 디코드는 기존 API가 검사한다. 누락·디코드·항목 접근 실패는 artwork ID·asset과 원래 `cause`를 포함해 거부한다.

`draw`는 문자열 `t.value`와 일치하는 준비된 own key를 선택한다. unknown·누락·상속 key에 첫 원화로 대체하는 동작은 없다. draw 중 이미지 로드·시계 조회·보간을 하지 않는다. 준비 뒤 config를 바꿔도 준비된 geometry는 바뀌지 않는다. 변경 후 다시 prepare한다.

원본 alpha를 가진 이미지를 `save/drawImage/restore`로 그린다. helper는 alpha·blend·filter를 설정하지 않으며 기존 compositor의 opacity·mask·blend를 그대로 받는다. cover는 별도 `Path2D`로 clip하여 호출자의 현재 path를 덮어쓰지 않는다. Node import·prepare에는 브라우저 global이 필요하지 않지만 실제 cover draw에는 Canvas의 `Path2D`가 필요하다. 원본 alpha의 보존과 최종 MP4의 투명도는 다른 계약이다. 현재 MP4는 H.264 yuv420p다.

## 시간 선택은 작품 코드가 맡는다

`exposure`는 `[from,to)`이며 `every`는 `t.exposed`만 양자화한다. `t.frame`과 `t.seconds` 또는 다른 레이어를 함께 멈추지 않는다. 유지할 위치·원화에는 exposed를 사용하고, 독립적인 빛 등에는 frame/seconds를 쓴다. `sample` 기본은 linear이므로 값 유지가 필요하면 `'hold'`를 명시한다. 원화 선택 자체는 exposure.value의 hard substitution이다. 중간 원화·프레임 블렌드·모션 블러는 자동 생성되지 않는다.

`examples/stillcuts/scene.mjs`는 이 구분을 보여 주는 작품 코드다. helper의 보간 API가 아니다. 손·열쇠 위치는 `t.exposed`와 생성된 lowering/withdrawal spans를 읽는다. 별도 빛 레이어는 `t.frame`을 읽는다. 원화 교체와 구도는 `t.value`로 선택한다. 벽시계·이전 프레임 상태·씨드 없는 난수를 쓰지 않는다. 순방향·역방향·임의 탐색이 같은 화면을 내는지는 출력에서 따로 확인한다.

## 고정 구도와 독립적인 환경 시간

[기존 열쇠 예제](../examples/stillcuts/README.md)의 가상 의뢰는 지친 감정을 과장하지 않되 내려놓는 행동을 보여 달라는 것이다. A는 넓은 고정 구도에서 손의 접촉·해제·퇴장을 보이고 남은 열쇠와 시간을 유지한다. 얼굴 연기나 연속 확대를 더하지 않아도 사물과 행동의 순서로 하루의 끝을 제안한다. B는 같은 행동을 가까이 보인 뒤 방으로 컷한다. 두 선택은 의뢰에 대한 적용안이며 A가 보편적으로 우월하다는 뜻은 아니다. 확대의 반복이나 큰 연기가 목적이라면 그에 맞는 원화와 시간 구조를 선택한다.

환경의 시간은 별도로 저작되어 있다. `examples/stillcuts/source.mjs`의 `light`와 `scene.mjs`의 `role: 'light'`는 벽의 반사광만 이동시킨다. 인물·방·열쇠를 한 이미지로 합친 뒤 전체를 움직이는 방식과 다르다. A의 마지막 `room-rest`는 `[102,192)`이며 같은 원화·고정 view·정지한 열쇠를 유지한다. 그 안의 f108과 f109는 `every: 12`로 같은 exposed 102를 쓰지만 빛은 `t.frame`을 읽어 달라진다. 두 frozen frame에서 방·열쇠·구도를 유지하며 반사광 영역이 바뀌는지 확인할 수 있다. 이 검사는 환경 시간의 독립성을 보여 준다. 무음 예제이므로 음악 적합성이나 카메라 리듬의 예술적 성공은 증명하지 않는다.

이 경로를 다른 장면에 쓰려면 원화 발주 전에 어떤 환경 사건이 필요한지 선택한다. 가림이 필요하면 [기존 layer·mask 규약](format.md)에 따라 인물과 환경 영역을 분리한다. 빛의 이동은 이 예제의 선택이며 다른 작품에 자동으로 복사할 배경 효과가 아니다. 음악이 있는 작품에서는 선택한 사건과 프레이즈·쉼 또는 의도한 박자의 관계를 실제 음원과 함께 재생해 판단한다.

## 복사, 생성, 다시 생성하기

[두 예제](../examples/stillcuts/README.md)의 정본은 `source.mjs`, `assets/`, `scene.mjs`, `rebuild.mjs`, 저장소 `modules/`다. 경계 수정 검증의 정본은 예제와 독립적인 `fixtures/boundary-input.json`이다. 루트에서 실행한다.

```sh
node examples/stillcuts/build.mjs
```

이 명령은 a/b에 자산 3개·scene·rebuild·두 helper를 **파일로 복사**하고, `source.json`·`cuts.json`·`work.json`을 생성한다. symlink와 전역 설치본 import를 쓰지 않는다. 저장소 예제는 `source.mjs`를 수정한 뒤 위 명령을 다시 실행한다. 생성된 a/b의 work·cuts·복사 helper를 직접 고치지 않는다. 시간·원화·배치·장면 코드·helper가 바뀌면 다시 생성한다.

같은 명령은 `fixtures/boundary-input.json`의 고정 source와 edit를 읽어 `boundary-before.json`·`boundary-after.json`을 생성한다. 현재 검증 입력은 기준 A에서 고정한 touch 60→66이다. 편집 중인 A를 읽어 이 검증 입력을 덮어쓰지 않으므로 A의 유효한 경계 편집과 충돌하지 않는다. builder는 이 검증 입력의 변경 유무와 두 compiler 결과를 예제 쓰기 전에 확인한다. 로그에는 실제 변경 필드·전후 값·변경 수를 남긴다. 이 fixture는 별도 작품이 아니며, 현재 A를 수정한 결과라는 의미도 아니다.

복사 프로젝트를 별도 작품으로 편집할 때는 그 복사본의 `source.json`이 편집 원본이다. `rebuild.mjs`는 **복사본의** `./modules/cuts.mjs`로 work와 cuts를 다시 만든다. 프로젝트 경로와 무관하게 실행할 수 있다.

```sh
# 승인된 작업 저장소 내부의 별도 경로를 예로 든다.
cp -R examples/stillcuts/a ./copied-stillcut
# copied-stillcut/source.json의 cutSpec 경계 또는 원화 설정을 편집한다.
node copied-stillcut/rebuild.mjs
node scripts/direction.mjs freeze copied-stillcut --store .direction/stillcuts
```

`scene.mjs`의 `./modules/artwork.mjs`와 모든 runtime 자산이 프로젝트 안에 있다. 고정 개정본도 이 파일들을 포함한다. 새로운 source·scene·자산으로 다시 freeze하면 새 revision이 생긴다. 이전 revision을 재생할 때는 현재 편집 파일을 읽지 않는다. 경로만 복사한 사실, 복사본의 실행, 고정 개정본의 실행은 별도의 검증 항목이다. 예제의 경계 전후 fixture와 실제 실행 기록을 함께 확인한다.
