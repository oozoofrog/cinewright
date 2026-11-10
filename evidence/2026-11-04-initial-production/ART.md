# 자산 기록

- 해안 원화는 이 세션에서 ImageGen을 호출해 만들었다. 결과 원본은 [shore-original.png](shore-original.png)에 보존했다. `sips -s format jpeg -s formatOptions 94`로 각 항구 프로젝트의 `assets/shore.jpg`를 만들었다. 기준 구도는 오른쪽의 해안 등화와 왼쪽의 열린 수면이다.
- 방위계는 `examples/harbor-landfall/instrument.mjs`에서 직접 작성한 3D 형상, 재질, 조명과 카메라를 사용한다. 포인터 끝의 월드 좌표를 화면에 투영한다. 벡터 선, 항로, 배와 등화는 이 패키지에서 직접 작성했다.
- 두 작품의 음악은 `evidence/2026-11-04-initial-production/scripts/make_examples.py`에서 직접 합성했다. 오디오 큐는 합성기 입력에 맞춰 작성했다. 자동 음악 분석과 관객 청취 확인은 수행하지 않았다. 인쇄기의 로제트 SVG와 활자 배치는 이 패키지에서 만들었다.
- 기존 Counting Star 영상, 캐릭터, 원화, 리그, 음악과 렌더러는 이 작품의 입력으로 사용하지 않았다.
- Three.js r180은 npm 잠금 파일로 고정했다. 벤더 소스의 MIT 라이선스는 각 개정본에 들어 있다. Showreel은 고정 커밋의 문서와 소스를 조사했다. 이 패키지에 Showreel 코드를 포함하지 않았다.
