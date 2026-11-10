# 도구 사용과 복구

Node.js 22 이상, FFmpeg/FFprobe, Chromium 계열 브라우저가 필요하다. 패키지 루트에서 `npm ci`를 실행한다. macOS는 기본적으로 `/Applications/Google Chrome.app`을 쓴다. 다른 실행 파일은 `DIRECTION_CHROME`으로 지정한다. Linux에서는 시스템 Chromium 경로를 지정하거나 Playwright가 기대하는 Chromium을 별도로 확보한다. 브라우저, Canvas 2D, WebGL 2와 FFmpeg 실행 여부는 `doctor`에서 확인한다. 실제 배포 포맷에서 코덱이 동작하는지는 렌더로 확인한다.

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

## 기록과 재시도

- 기본 저장소는 현재 디렉터리의 `.direction`이다. `--store PATH`로 바꿀 수 있다. 프로젝트 안에 둘 때는 `.direction` 아래를 사용한다.
- 개정본은 `revisions/<hash>/`에 프로젝트, 런타임, 벤더 소스, 실행 코드, 잠금 파일, 파일별 SHA-256을 저장한다. 입력과 적용 코드를 식별한다. 브라우저와 FFmpeg 버전은 실행 기록에 남는다. 동일 머신과 도구 조합에서 프레임 동일성을 검사한다. 다른 OS, 폰트와 GPU 조합 간 픽셀 동일성은 보장 범위에 포함하지 않는다.
- 작업은 `jobs/<id>/job.json`에 실행 단계, 작업 프레임 수, 상태, 오디오 배치, 개정본, 결과 경로와 출력 해시를 기록한다. 전체 명령과 오류는 `execution.log`에 남는다. `frame`은 PNG와 `frame.json`을, 영상 명령은 MP4를 게시한다. 생성 중에는 `frames/`와 임시 결과에 쓴다. 게시한 파일은 결과 경로와 해시로 확인한다.
- SIGINT와 SIGTERM은 취소를 기록한다. 미완성 프레임, 오디오와 인코더 임시 파일을 남긴다. `retry JOB_ID`는 실패 또는 취소된 작업의 동일 개정본과 설정을 새 작업에서 처음부터 실행한다. 자산 자체를 보완한 경우 `freeze` 후 새 작업을 실행한다. 프로세스 강제 종료나 전원 손실 시 `running` 기록과 임시 결과가 남을 수 있다. PID와 마지막 파일을 확인한 후 개정본으로 새 작업을 실행한다. 프레임 재사용과 강제 종료 자동 복구는 구현하지 않았다.
- 임의 시각 비교는 `review`의 같은 시각 이동을 쓴다. 다른 구조의 비교는 각 영상의 처음부터 재생 버튼을 쓴다. `observe`는 실제 시간으로 MP4를 재생하며 동영상 표시 콜백, PCM 진폭과 캡처 프레임을 기록한다. 스피커 출력은 0으로 두고 캡처는 음소거 전 신호에서 한다. 청취나 예술적 판단을 자동화하는 도구가 아니다.
- `sync`는 MP4의 디코드한 화면과 오디오를 측정한다. 화면은 작성한 프레임 주변의 평균 휘도 상승을 찾고 컨테이너의 실제 프레임 PTS를 읽는다. 오디오는 지정 범위에서 강한 샘플 피크를 찾는다. 초반과 후반의 차이로 누적 드리프트를 구분한다. 기본 허용 오차는 한 프레임이며 비디오 PTS 간격 오차는 0.1 ms 이하다. 평균 고정 오프셋은 각 사건의 피크 차이 평균이며, 음색의 공격 시간도 이 값에 들어갈 수 있다.
