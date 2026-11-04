# 프로젝트와 모듈 규약

작업 디렉터리에 `work.json`과 그 개정에 필요한 파일을 둔다. 경로는 프로젝트 루트 기준이다. 경로 구성 요소에는 영문, 숫자, 점, 밑줄, 하이픈을 사용한다. 내부 심볼릭 링크는 허용하지 않는다. 모듈은 로컬에서 신뢰하는 JavaScript다. 사용자 입력에서 내려받은 임의의 코드는 실행 전에 확인한다.

## 시간

- `version: 1`, `title`, `size: [width,height]`, `fps`, `frames`, `layers`가 필수다. 각 변 16–4096의 짝수 픽셀, 1–120의 정수 FPS가 현재 입력 범위다. 실시간 성능 보장은 아니다. 분수 FPS는 현재 규약에서 지원하지 않는다.
- 프레임 범위는 `[0, frames)`다. 프레임 `f`의 시작 시각은 `f / fps`다. `points`는 이름에서 `0..frames-1`의 프레임으로, `spans`는 이름에서 반개구간 `[from,to)`로 대응한다. span.to는 frames까지 허용하지만 종료 경계의 point는 만들지 않는다. 박, 프레이즈, 성부, 음색, 음성·가사를 필요에 따라 이름으로 연결한다. 표식 변경만으로 모듈이 생성되거나 사라지지 않는다. 모듈이 표식을 직접 사용한 경우 그 참조의 결과는 바뀐다.
- `layers[].in/out`은 선택한 합성 범위다. `exposure`는 정렬된 `{from,to,every,value}` 목록이다. `to`는 제외한다. `every`는 기본 1이며 `from`에서 정렬된다. 구간이 비면 생략한다. 자산 레이어의 `value`는 파일 경로다. 모듈은 `t.exposed`를 써서 해당 요소를 실제로 유지한다. 다른 요소에 연속 변형이 필요하면 `t.frame`이나 `t.seconds`를 쓴다.
- `sample([[frame,number], …], frame, 'linear' | 'hold')`는 스칼라 트랙을 평가한다. 기본은 linear이며 값 유지가 필요하면 hold를 명시한다. 처음과 마지막 키 밖에서는 값을 유지한다. 저자가 정렬한 키를 전달한다. 이 수치 보간과 별개로 엔진은 중간 원화, 프레임 블렌드, 모션 블러를 자동 생성하지 않는다. 영상을 별도 플랫폼에 업로드하면 플랫폼 재생 변환은 별도로 확인한다.

컷의 공유 경계·exposure·points·spans를 한 편집 원본에서 만들려면 [컷 목록 helper](stillcuts.md#컷-목록의-정본과-생성물)를 쓴다. 기존 manifest version 1을 생성하는 제작 단계 도구다. 새로운 manifest schema나 필수 마이그레이션이 아니다.

## 레이어

`{id, asset}`은 이미지·SVG를 전체 캔버스에 맞춘다. `{id,module,config}`는 ES 모듈을 읽는다. 선택적으로 `z`, `opacity`, Canvas 2D `blend`, 전체 캔버스의 알파를 쓰는 이미지 `mask`를 지정한다. 기본 합성은 `source-over`다. 평가는 선언 순서다. 합성은 `z` 순서며, `z`를 생략하면 선언 위치를 쓴다. 해상도가 달라도 모듈이 그리는 좌표는 `size` 기준이다.

원본 좌표 anchor·atlas crop·균일 scale·contain/cover가 필요하면 [원화 배치 helper](stillcuts.md#원화-배치의-정본과-공개-함수)를 프로젝트 안으로 복사한다. 기존 asset 레이어의 전체 캔버스 배치 동작을 바꾸지 않는다. helper의 crop과 source alpha, compositor의 opacity·mask·blend는 함께 적용할 수 있다. 프로젝트 밖의 임의 import는 freeze가 보존한다고 가정하지 않는다.

```js
export async function prepare(api, config) {
  const art = await api.image(config.art);
  return {
    evaluate(t) { return api.sample(config.alphaKeys, t.frame, 'hold'); },
    draw(g, t, alpha) {
      g.globalAlpha = alpha;
      g.drawImage(art, 0, 0, api.width, api.height);
    },
  };
}
```

- `api`는 `width, height, pixelWidth, pixelHeight, fps, frames`, `point(name)`, `span(name)`, `sample`, `path(name)`, `image(name)`, `json(name)`을 제공한다.
- `evaluate(t)`는 선택 사항이다. 필요한 공유 값을 먼저 계산한다. 반환값은 `draw(g,t,state)`에서 사용한다. `g`는 변환이 초기화된 레이어별 2D 컨텍스트다. 투명 레이어의 마스크와 알파는 합성기가 적용한다. `t`는 `frame, seconds, exposed, value, read, write`를 제공한다.
- 어떤 순서로 조회하든 결과가 같아야 한다. 시간 누적, 벽시계, 씨드 없는 난수에 의존하지 않는다. 누적 모션은 시드와 생성 방법을 기록하고 결정적으로 다시 계산하거나 프레임별 자산으로 베이크한다.
- 벡터는 SVG 또는 `Path2D`로 그릴 수 있다. 활자는 `CanvasRenderingContext2D`에서 그린다. 시스템 폰트가 바뀌면 줄바꿈이나 글자 폭이 달라질 수 있다. 같은 디자인으로 재출력해야 하면 프로젝트가 보유한 폰트를 파일에 넣고 `prepare`에서 `FontFace`를 불러오거나 글자를 경로로 변환한다.
- 3D 모듈은 `import * as THREE from 'three'`로 고정 버전 Three.js를 쓴다. 자체 렌더러, 투명 배경, 카메라, 조명, 형상, 재질 또는 `ShaderMaterial`을 구성한 뒤 렌더러의 캔버스를 `g.drawImage`로 합성한다. `examples/harbor-landfall/instrument.mjs`가 실행 예다. 외부 3D 도구를 쓸 때는 실제 호출을 확인하고, 베이크한 프레임이나 모듈이 읽을 모델과 필요한 타임 데이터를 보존한다. 기본 런타임은 별도 외부 DCC를 호출하지 않는다.

## 선택적 값 교환

`channels.NAME`에 `producer, consumers, space, kind, from, to`를 쓴다. `kind`는 `number`, `vec2`, `boolean`, `string`, `path` 중 하나다. `path`는 2D 점의 배열이다. 좌표계나 단위는 `space`에 기재한다. 예제의 `canvas`는 저자 픽셀 단위의 좌상단 원점이며 `radian`은 각도 단위다. 단위 변환은 이를 소유하는 모듈이 한다.

- 제공자는 `evaluate(t)`에서 `t.write(name,value)`를 한 번 호출한다. 사용자는 뒤에 선언한 레이어의 `evaluate(t)`에서 `t.read(name,space)`를 호출한다. `z`는 이 순서에 영향을 주지 않는다. 유효 구간에 값이 없거나 제공자, 사용자, 단위, 값 형식이 틀리면 작업이 실패한다.
- `producer: "$data"`는 작성한 상수 `data: {value}`, 수치 트랙 `data: {keys}` 및 `mode: "linear" | "hold"`, 또는 프레임별 JSON `data: {file}`을 읽는다. JSON은 `{from, values}`이며 정확히 `to-from`개의 값을 담는다. 레이어 평가 전에 게시한다.
- 배경과 피사체에 같은 카메라나 깊이가 필요 없는 경우 이 값을 공유할 필요가 없다. 시뮬레이션을 베이크하면 생성 도구, 시드, 범위, 좌표 기준을 소스에 기록한다.

## 오디오와 동기 검증

`audio`는 선택한 오디오 클립 배열이다. 각 항목에 `asset, sourceIn, sourceOut, at`을 쓴다. 단위는 스테레오 48 kHz로 디코드한 샘플이다. `sourceOut`은 제외한다. `at`은 프로젝트에서 `sourceIn`을 놓을 위치다. 음수 오프셋은 프로젝트 시작 전 부분을 잘라낸다. `gain` 기본값은 1이다. `provenance`에 소스와 직접 작성·분석 추정·청취 확인 여부를 기록한다. 합성은 `normalize=0`으로 레벨을 자동 정규화하지 않는다. 여러 트랙을 쓸 때 합산 피크를 검토한다. 대화형 플레이어와 영상 렌더는 같은 함수로 48 kHz PCM을 배치한다. 최종 MP4는 H.264 yuv420p 영상과 AAC 오디오다. 합성의 alpha 지원이 투명 MP4 지원을 뜻하지 않는다.

`probes`는 반복 측정할 시청각 사건을 정의한다. 각 항목에 `label, frame, box, threshold, audioSearch`를 쓴다. `box`는 좌상단과 우하단을 0…1로 정규화한 좌표다. `threshold`는 8비트 평균 휘도의 최소 상승 폭이다. `audioSearch`는 사건 주변에서 가장 강한 샘플 피크를 찾는 양쪽 범위(ms)다. 초반과 후반에 다른 소리와 구별되는 사건을 선택한다. 피크를 자동으로 찾기 어려운 사운드는 제작자가 파형과 화면 사건을 대조한다. 현재 검사는 밝아지는 화면 사건과 고립된 타격음에 맞춘 것이다.
