# 도구 사용과 복구

Node.js 22 이상, FFmpeg/FFprobe, Chromium 계열 브라우저가 필요하다. 선언한 패키지는 `playwright-core 1.64.1`, `three 0.180.0`이다. 기존 의존성이 준비되어 있으면 재설치하지 않는다. 준비되지 않은 체크아웃에서만 패키지 루트의 `npm ci`를 쓴다. macOS는 기본적으로 `/Applications/Google Chrome.app`을 쓴다. 다른 실행 파일은 `DIRECTION_CHROME`으로 지정한다. Linux에서는 시스템 Chromium 경로를 지정하거나 Playwright가 기대하는 Chromium을 별도로 확보한다. 설치·도구 발견·실제 실행을 구별한다. 브라우저, Canvas 2D, WebGL 2와 FFmpeg 실행 여부는 `doctor`에서 확인한다. 실제 배포 포맷에서 코덱이 동작하는지는 렌더로 확인한다.

```sh
node scripts/direction.mjs --help
node scripts/direction.mjs doctor
node scripts/direction.mjs init ./my-film --title '작품 이름' --frames 144 --fps 24
node scripts/direction.mjs freeze ./my-film
node scripts/direction.mjs play REVISION --scale 0.5
node scripts/direction.mjs frame REVISION 48
node scripts/direction.mjs preview REVISION
node scripts/direction.mjs render REVISION --from 48 --to 96
node scripts/direction.mjs render REVISION
node scripts/direction.mjs status JOB_ID
node scripts/direction.mjs review JOB_ID OTHER_JOB_ID
node scripts/direction.mjs observe JOB_ID
node scripts/direction.mjs sync JOB_ID
```

`REVISION`은 `freeze`가 출력한 64자 해시다. 작업 경로를 대신 넘기면 그 시점의 입력을 새로 스냅샷에 담는다. `frame`에는 표식 이름도 쓸 수 있다. `render --span NAME`으로 이름 붙인 구간을 출력한다. 끝 프레임은 제외한다. `play`와 `review`는 로컬 주소를 출력하고 Ctrl+C까지 실행한다. `play`는 음원 위치로 시계를 잡고 현재 프레임을 직접 평가한다. 브라우저가 느리면 화면 갱신이 건너뛸 수 있다. 오프라인 렌더는 모든 프레임을 출력한다. 음소거는 오디오 시계를 바꾸지 않는다.

`frame`과 `--from/--to`의 숫자만 있는 입력은 point 이름보다 프레임 번호로 먼저 해석한다. 이름으로 조회할 경계에는 `touch`처럼 숫자만으로 구성되지 않은 이름을 쓴다. 종료 프레임은 point가 아니다. 끝까지 출력하려면 `--span` 또는 유효한 숫자 `--to frames`를 쓴다.

[스틸컷 예제](../examples/stillcuts/README.md)는 `node examples/stillcuts/build.mjs`로 생성한다. 복사본의 source를 편집하면 `node <복사본>/rebuild.mjs`를 실행한다. 생성 원본·helper 복사·입출력 계약은 [stillcuts.md](stillcuts.md)에 있다. 검증 기록은 `--store`로 승인된 작업 경로 안에 격리하고, TMPDIR도 같은 작업 경로의 실제 디렉터리로 지정한다.

포즈 채널·저작 보정·접촉 목표가 필요하면 [pose tracks API와 공개 materialization 예제](pose-tracks.md)를 사용한다. `materializeKit({project, modules:['pose-tracks']})`는 `motion` 의존성도 복사하고 기존 소유권 검사를 적용한다.

## 기록과 재시도

- 기본 저장소는 현재 디렉터리의 `.direction`이다. `--store PATH`로 바꿀 수 있다. 프로젝트 안에 둘 때는 `.direction` 아래를 사용한다.
- 개정본은 `revisions/<hash>/`에 프로젝트, 런타임, 벤더 소스, 실행 코드, 잠금 파일, 파일별 SHA-256을 저장한다. 입력과 적용 코드를 식별한다. 브라우저와 FFmpeg 버전은 실행 기록에 남는다. 동일 머신과 도구 조합에서 프레임 동일성을 검사한다. 다른 OS, 폰트와 GPU 조합 간 픽셀 동일성은 보장 범위에 포함하지 않는다.
- 작업은 `jobs/<id>/job.json`에 실행 단계, 작업 프레임 수, 상태, 오디오 배치, 개정본, 결과 경로와 출력 해시를 기록한다. 전체 명령과 오류는 `execution.log`에 남는다. `frame`은 PNG와 `frame.json`을, 영상 명령은 MP4를 게시한다. 생성 중에는 `frames/`와 임시 결과에 쓴다. 게시한 파일은 결과 경로와 해시로 확인한다.
- SIGINT와 SIGTERM은 취소를 기록한다. 미완성 프레임, 오디오와 인코더 임시 파일을 남긴다. `retry JOB_ID`는 실패 또는 취소된 작업의 동일 개정본과 설정을 새 작업에서 처음부터 실행한다. 자산 자체를 보완한 경우 `freeze` 후 새 작업을 실행한다. 프로세스 강제 종료나 전원 손실 시 `running` 기록과 임시 결과가 남을 수 있다. PID와 마지막 파일을 확인한 후 개정본으로 새 작업을 실행한다. 프레임 재사용과 강제 종료 자동 복구는 구현하지 않았다.
- 임의 시각 비교는 `review`의 같은 시각 이동을 쓴다. 다른 구조의 비교는 각 영상의 처음부터 재생 버튼을 쓴다. `observe`는 실제 시간으로 MP4를 재생하며 동영상 표시 콜백, PCM 진폭과 캡처 프레임을 기록한다. 스피커 출력은 0으로 두고 캡처는 음소거 전 신호에서 한다. 청취나 예술적 판단을 자동화하는 도구가 아니다.
- 현재 `observe`는 PCM peak가 0.005 미만이면 다른 재생 조건을 충족해도 실패한다. 따라서 의도한 무음 작품의 보편적 통과 조건으로 쓰지 않는다. 무음 예제에는 기존 `play`·`review`와 범위를 정한 브라우저 재생 관찰을 사용하고 실제로 확인한 항목만 기록한다. 이 검사를 통과하려고 소리를 덧붙이지 않는다.
- `sync`는 MP4의 디코드한 화면과 오디오를 측정한다. 화면은 작성한 프레임 주변의 평균 휘도 상승을 찾고 컨테이너의 실제 프레임 PTS를 읽는다. 오디오는 지정 범위에서 강한 샘플 피크를 찾는다. 초반과 후반의 차이로 누적 드리프트를 구분한다. 기본 허용 오차는 한 프레임이며 비디오 PTS 간격 오차는 0.1 ms 이하다. 평균 고정 오프셋은 각 사건의 피크 차이 평균이며, 음색의 공격 시간도 이 값에 들어갈 수 있다.
- `sync`는 선택한 휘도 상승과 고립된 피크의 검사다. 모든 시청각 의미의 동기·대사 명료도·음질로 확대하지 않는다. 로그·파형·캡처는 직접 청취의 근거가 아니다. 직접 화면·소리를 확인할 수 없으면 그 한계를 남긴다.

## 음악과 flash-risk

`music init/analyze/derive/build/remux`와 `flash JOB_ID`의 입력·예제·한계는 [music.md](music.md)를 따른다. 기존 player가 음악 작업의 웹 검토 UI다. `sync`의 probe 기반 검사 범위는 확장하지 않는다.

Phase02 선택 도구: `node scripts/watercolor-bake.mjs INPUT.json OUTPUT.json`, `node scripts/auto-rig.mjs STATIC.json OUTPUT.rig.json PROFILE.json [--glb]`, `node scripts/retarget-bake.mjs SOURCE.rig.json TARGET.rig.json SOURCE.motion.json OUTPUT.motion.json [OPTIONS.json]`. 실제 입력/상한/출처는 [수채](styles/watercolor-physical.md)·[rig](styles/auto-rig.md)·[retarget](styles/retarget.md) 참조. 스타일 빌드는 기존 `direction style build`를 사용하며 새 watercolor-physical와 expressionist-space rig/motion 자산을 local freeze한다.

새 제작과 실제 출력의 수정은 [작법 실행 경로](craft-execution.md)를 따른다. 공개 크레인 예제는 사용자 저작 geometry·키·시간·pose correction을 materialize/freeze/render하고 두 revision을 기존 job으로 비교한다.
