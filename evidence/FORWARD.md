# 야간 분류함 제작 및 재생 검토

6초, 540×720, 24fps, 144프레임. 새 컨텍스트에서 별도 [창작 의뢰](forward-input/BRIEF.md)와 [음원](forward-input/hits.wav)을 받아 패키지의 스킬과 CLI로 제작했다. 앞선 구현 상태와 완료 기준을 복구하는 과정에서 기존 검증 기록도 읽었다. 기존 작품의 모듈을 가져오지 않고 표찰을 그리는 [새 모듈](../examples/night-sorter/motion.mjs)을 추가했다. 스킬의 자동 발견과 완전히 격리된 별도 실행 환경은 검증 범위에 포함되지 않는다.

## 재생에서 확인한 변화

초안과 최종 MP4를 Chromium에서 각각 끝까지 재생했다. 초안은 0.75초에 표찰 방향이 맞춰졌지만 작은 화면에서 전후 차이가 약했다. 최종안에서는 한 줄이 지나가며 표찰의 왼쪽 위를 차례로 밝힌다. 2.5초에는 흩어진 표찰이 칸에 들어가며 개별 방향에서 격자 배열로 시선이 옮겨간다. 4.75초에는 같은 표찰이 순차적으로 뒤집힌다. 마지막 화면을 유지하는 동안 초승달과 별을 함께 볼 수 있다. 중간에 표찰이 겹치고 화면이 잠시 빽빽해진다. 최종 이미지가 나오기 전 배열 자체에서 초승달을 예상할 수 있는지는 관객 확인이 필요하다. [초안 캡처](forward-draft-playback.jpg) · [최종 캡처](forward-playback.jpg)

브라우저는 0초부터 마지막 표시 시각인 5.9583초까지 재생을 완료했다. 관찰 기록은 표시된 프레임 103개와 오디오 신호 표본을 담는다. 화면 표시 콜백의 간격 때문에 초안에서는 첫 타격의 피크를 놓쳤고 최종 재생 로그에서도 첫 타격의 최댓값은 잡히지 않았다. 세 타격의 수치는 아래의 파일 디코드로 확인했다. 직접 청취, 관객 관찰, 사용자 수락은 미확인이다. [재생 로그](forward-playback.json) · [초안 재생 로그](forward-draft-playback.json)

## 렌더 및 동기

- 원본은 48 kHz 스테레오 288,000 샘플이다. 원본과 AAC 인코딩 직전 믹스를 동일한 signed PCM으로 디코드해 바이트 단위로 대조했다. 0초 배치와 무가공 믹스가 일치했다. [PCM 비교](forward-pcm.log)
- MP4 전체 디코드가 오류 없이 끝났다. 화면 표식은 18·60·114프레임에 표시됐다. 각각의 오디오 피크는 화면 기준 +2.396ms, +4.021ms, +3.208ms였다. 평균 차이는 +3.208ms, 첫 타격에서 마지막 타격까지의 차이는 +0.813ms였다. 허용 오차는 1프레임(41.667ms)이다. 두 스트림의 길이는 6초로 같다. [동기 검사](forward-sync.json) · [스트림](forward-ffprobe.json)
- [최종 MP4](../outputs/night-sorter.mp4) · [작품 설정](../examples/night-sorter/work.json) · [개정본](forward-freeze.json) · [작업 상태](forward-render.json) · [전체 렌더 로그](forward-execution.log) · [SHA-256](forward-sha256.txt)

패키지 루트에서 같은 개정본을 재생하거나 다시 출력할 수 있다.

```sh
node scripts/direction.mjs play 6cdf31d770fd21e1c09af9e97a18ab87623e2f5ffe9f183a91693fd490f3a9b8
node scripts/direction.mjs render 6cdf31d770fd21e1c09af9e97a18ab87623e2f5ffe9f183a91693fd490f3a9b8
node scripts/direction.mjs review 2d6a1977-6641-4bbc-8643-f250f2628a43 b0ef21a7-19be-47ab-aca0-21aa9ef876bf
```
