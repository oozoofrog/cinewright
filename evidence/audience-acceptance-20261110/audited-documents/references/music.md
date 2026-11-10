# 로컬 음악 기반 제작

기존 제작 위임·의도·원본 보존 지침을 그대로 따른다. 별도 웹 편집기를 만들지 않는다. 기존 `play`가 브라우저 재생·탐색·cue·구간 반복 UI이며 `review`는 렌더 A/B 비교다. 유저가 제공한 음악은 요청한 로컬 사용 범위로 다루며 공개 저작권 허가를 추정하지 않는다. 사용자 음원·원본 영상·분석용 PCM·전체 렌더는 커밋하지 않는다.

음악과 화면의 관계는 박마다 반응하는 효과로 미리 정하지 않는다. 반복·어긋남·침묵·화면의 독립 사건 등 의도에 맞게 배치하고, 소리와 화면이 서로 무엇을 바꾸는지 짧은 출력으로 시험한다. 직접 청취하지 못하면 음악적 효과는 미검증이다. 자작 공개 관계 연구의 진입점은 [작법 실행](craft-execution.md#공개-관계-연구-대표와-두-변주)이며 통합 후 실행 상태를 확인한다.

## 실행

```sh
node scripts/direction.mjs music init ./private-song /absolute/source.mp4 --fps 24 --variant theatre
node scripts/direction.mjs music analyze ./private-song
node scripts/direction.mjs music derive ./private-song --overrides ./manual.json
node scripts/direction.mjs music build ./private-song --variant theatre
node scripts/direction.mjs preview ./private-song --store ./private-store
node scripts/direction.mjs play ./private-song --store ./private-store
node scripts/direction.mjs render ./private-song --from 384 --to 672 --store ./private-store
node scripts/direction.mjs render ./private-song --store ./private-store
node scripts/direction.mjs flash JOB_ID --store ./private-store
node scripts/direction.mjs music remux ./private-song FULL_VIDEO.mp4 ./new-final.mp4
```

`music init`은 사용하지 않은 디렉터리에만 ingest → analyze → derive → 예제 build를 실행한다. 일반 영상 제작은 기존 `init`을 쓴다. 음악 작업은 원본 fps가 아니라 정수 시각 fps를 정하며 기본 24fps다. `music build`의 두 안은 [paper theatre / printed counterpoint](../examples/music-box-dancer/README.md)다. 다른 창작 의뢰를 이 예제로 제한하지 않는다. 수정된 생성 파일은 소유권 해시가 달라지면 덮어쓰지 않는다. 새 디렉터리에서 다시 만들거나 생성 이후 직접 작성한다.

- `music/source.json`: 원본 SHA-256·스트림, native decoded identity, 48k stereo s16 preview WAV, 선택적 검증 AAC 보관본. 실제 디코드된 샘플 수로 `ceil(samples * fps / 48000)` 프레임을 계산해 끝을 자르지 않는다. 원본 컨테이너 duration과 실제 디코드 duration은 다를 수 있다.
- `music/analysis.json`: 10ms 창 RMS/근사 low·mid·high 활동, positive novelty onset, 로컬 자기상관 기반 잠정 beat 후보. loudness·정확한 박자·4/4·downbeat·곡 구조 판정이 아니다. 무음·모호한 구간은 manual-required이며 half/double tempo와 공격음 장식에 취약하다. 파형 분석은 직접 청취가 아니다.
- `music/derived.json`: 원래 seconds와 프레임 양자화 오차를 함께 가진 `events.onsets/beats`, **`tracks.energy = [[frame,value],…]`** (low/mid/high도 동일), `[from,to)` sections, `manifest.points/spans/channels`. `music.*` 채널은 `$data` producer, 기본 `['scene']` consumers다. 분석 JSON은 derive로 덮어쓰지 않는다. 기본 `music.full`은 단지 원본 범위이며 곡 구조가 아니다.
- manual.json 예: `{"beats":[{"seconds":0.5,"strength":1}],"sections":[{"name":"opening","from":0,"to":240}]}`. 지정 배열이 후보를 교체하며 빈 배열은 의도적으로 제거한다. 구간은 현재 fps의 정수 프레임이다. `derive` 뒤 기존 work.json을 쓰려면 `music build`를 다시 실행한다. fps 변경은 source/derived timing을 일치시키는 새 ingest로 한다.

A/B는 동일 canonical 데이터·오디오를 두 **서로 다른** private 프로젝트 디렉터리에 복사해 두 variant로 build한다. 비교 구간과 fps·크기·원본 샘플 범위를 동일하게 유지하고 선택 근거를 기록한다. 전체 초안을 제작하고 가능한 출력을 원속도로 보고 들으며 최종 렌더한다. 형태·경계·합성 회귀를 확인할 필요가 있으면 대표 프레임·컷 전후·마지막 유효 프레임을 살핀다. 직접 보거나 들을 수 없는 시간 경험은 미검증으로 남기고 확인 지점을 인계하며 합의 범위를 계속 제작한다. 추론/저작한 시각 phase를 청취로 확인한 음악 구조라 부르지 않는다.

## 보존과 위험 검사

Preview/mixer는 48kHz stereo PCM을 사용하므로 44.1k 원본의 리샘플링이 생긴다. 일반 render MP4의 AAC는 재인코딩이다. 원본이 zero-start MP4/M4A AAC이고 단일 전체 음원·offset 0·gain 1·trim/tempo 변경 없음·fps-ceiled 전체 길이인 경우에만 `music remux`로 원본 보관 AAC를 stream-copy한다. 패킷과 native decoded SHA-256, 샘플 수·start·길이를 검사한다. `-shortest`를 쓰지 않으며 기존 output을 덮어쓰지 않는다. 부적격 입력에는 자동 손실 fallback이 없다. 최종 출력의 실제 stream timing과 디코드 길이를 별도로 기록한다.

`flash JOB_ID`는 완료된 영상 작업의 모든 디코드 프레임을 160×90으로 스트리밍 검사하고 작업 아래 고유 `flash-*/report.json`, `execution.log`를 남긴다. 1초 내 큰 면적의 반대 방향 휘도/포화 red 변화가 반복되면 `risk-detected`와 exit 1이다. 결과의 정확한 threshold와 coverage를 읽는다. `screen-negative`는 **안전 판정이 아니다**. 축소로 놓치는 국소 패턴·공간 주파수·시야각·디스플레이 휘도·개인 민감성은 미검증이며 WCAG 인증이 아니다. 인간 접근성 검토를 대신하지 않는다.

`sync`의 의미는 바뀌지 않는다. 작성한 휘도 probe와 고립된 오디오 피크만 측정하며 일반 음악의 음악적 동기·직접 청취·음질이나 flash 안전 검사를 뜻하지 않는다. 자동 재생·샘플 이미지·모델 판단·직접 청취·독립 검토·관객 반응·사용자 수락을 구분한다. 로컬 전체 출력이 있어도 독립 검토는 별도 게이트다.

공개 서비스: `scripts/music.mjs`의 named-object `ingestMusic`, `analyzeMusic`, `deriveMusic`, `remuxSourceAudio`; 브라우저 stateless helper는 `modules/music.mjs`. motion/focus/accent/particles는 `scripts/materialize-kit.mjs`로 의존성까지 프로젝트 안에 복사한다. freeze한 프로젝트는 toolkit 외부 import 없이 재생한다. 원본 입력은 읽기 전용이며 원본 비디오 프레임/공연자 이미지는 이 예제에서 사용하지 않는다.
