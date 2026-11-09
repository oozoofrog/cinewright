# 준비된 포즈 트랙과 저작 보정

`modules/animation/pose-tracks.mjs`는 프레임 단위로 평가한다. 시간 이력이나 전역 난수 상태를 사용하지 않는다. scalar 또는 길이 2–4의 벡터를 지원한다. 키를 준비할 때 순서·차원·유한값을 검사하고 입력을 복사한다.

```js
import {preparePoseTracks, prepareCorrections, prepareContacts, constrainTarget}
  from './modules/animation/pose-tracks.mjs';
const tracks = preparePoseTracks({
  wrist: [
    {frame: 0, value: [0, 0], interpolation: 'linear'},
    {frame: 12, value: [30, 20], interpolation: 'hold'},
    {frame: 18, value: [30, 20]}
  ]
});
tracks.at(6); // {wrist: [15, 10]}
```

- `prepareTrack(keys).at(frame)`: 기본 `smoothstep`, `linear`, `hold` 또는 `{bezier:[a,b]}`. 보간은 출발 키의 설정을 쓴다. 범위 밖에서는 끝값을 유지한다. `hold`는 다음 키 직전까지 유지한다. smoothstep은 기존 helper의 산술을 유지한다.
- `bezier`는 `0 <= a <= b <= 1`인 두 ordinate를 쓴다. 시간은 선형 정규화한다. CSS cubic-bezier처럼 x를 역산하지 않는다. 중간 포즈를 대체하지 않는다. 실제 dancer는 기존 smoothstep을 유지한다.
- `preparePoseTracks(channels).at(frame)`: 채널별 scalar/vector 결과를 반환한다. 단위는 저작자가 정한다. 각도 최단경로 보정이나 자동 unwrap은 없다.
- `prepareCorrections([{center,radius,delta}]).at(driver)`: scalar 포즈 변수 주위에 compact support를 갖는 가산 보정을 반환한다. 샘플은 하나 이상이어야 하며 `prepareCorrections([])`는 오류다. `delta`의 채널·차원은 모두 같아야 한다. 겹치는 가중치 합이 1을 넘으면 정규화한다. 보간 weight에는 smoothstep을 쓴다. 학습 기반 변형이나 물리 모델이 아니다.
- `prepareContacts([{channel,from,to,target}]).at(frame)`: 반열린 구간 `[from,to)`의 저작 접촉 목표를 반환한다. 채널별 시간순·비중첩 구간이 필요하다. 목표를 자동으로 적용하거나 발을 잠그지 않는다.
- `constrainTarget(origin,target,{min:0,max}).point`: 같은 차원의 벡터를 반경 도달 범위로 제한한다. `distance`, `residual`, `reachable`을 함께 반환한다. 영거리에서 최소 반경이 필요하면 첫 축의 양의 방향을 쓴다. 관절 solver가 아니다.

보정 없는 초안도 같은 장면 코드에서 실행하려면 빈 목록을 호출 전에 분기한다. 아래 `offset`은 장면에서 정한 delta 채널 이름이며, 반환값을 좌표에 적용하는 것도 장면의 책임이다.

```js
const correction = samples.length ? prepareCorrections(samples) : null;
const offset = correction?.at(driver).offset ?? [0, 0];
```

`materializeKit`은 helper와 `motion` 의존성을 프로젝트의 같은 상대 구조에 복사한다. 저장소 루트에서 다음 공개 예제를 실행한다. `./pose-demo`는 새 프로젝트 디렉터리다.

```sh
node --input-type=module <<'JS'
import {materializeKit} from './scripts/materialize-kit.mjs';
console.log(await materializeKit({project:'./pose-demo', modules:['pose-tracks']}));
const {prepareTrack} = await import('./pose-demo/modules/animation/pose-tracks.mjs');
console.log(prepareTrack([
  {frame:0,value:[0,0],interpolation:'linear'},
  {frame:10,value:[10,20]}
]).at(5)); // [5, 10]
JS
```

생성 파일은 `modules/animation/pose-tracks.mjs`, `modules/motion.mjs`, 소유권 ledger `.cinewright-kit.json`이다. 기존 프로젝트에도 같은 호출을 쓸 수 있다. 생성 후 저작자가 수정한 파일이나 ledger에 없는 수동 복사본은 덮어쓰지 않는다. 기존 수동 복사본을 자동으로 소유권에 편입하지 않는다.

Freeze는 프로젝트 안의 파일만 수집한다. 프로젝트 모듈에서 helper를 상대 import한다. 원본 저장소의 절대 경로나 상위 경로를 frozen 코드에 넣지 않는다. API와 복사 검증은 private production 없이 `node --test tests/pose-materialize.test.mjs`로 실행할 수 있다.

테스트: `node --test tests/pose-tracks.test.mjs`. 두 번째 사례는 길이가 다른 crane의 trolley/hook 트랙·도달 제한·접촉 구간·포즈별 clearance 보정이다. 비공개 dancer baseline이 없는 체크아웃에서는 dancer 회귀 사례만 skip한다.

새 제작과 실제 출력의 수정은 [작법 실행 경로](craft-execution.md)를 따른다. 공개 크레인 예제는 사용자 저작 geometry·키·시간·pose correction을 materialize/freeze/render하고 두 revision을 기존 job으로 비교한다.
