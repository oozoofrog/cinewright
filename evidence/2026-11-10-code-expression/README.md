# 코드 표현 실행 증거

최종 인계는 **delivery/** 다. `final/`, `draft-*`, `fold-recheck/`는 이전 제작·진단 이력이며 지우지 않았다.

- 최종 영상: `delivery/cups.mp4`, `delivery/doorway.mp4`, `delivery/fold.mp4`.
- 최종 revision/job/해시: `delivery/results.json`.
- 최종 기술 검증: `delivery/verification/report.json`, `verify-delivery.log`.
- 원본 저작 프로젝트와 PCM 음악: `delivery/{cups,doorway,fold}/`.
- 중립 독립 검토 입력: `review-brief.md`.
- 수정 전후: `cups-before.mp4`, `final/fold-r1.mp4`, `fold-shadow-fixed.mp4`, `revision-comparison.png`, `pixel-comparisons.json`.
- 제거 비교: `without-traces.mp4`, `without-first-visit.mp4`, `comparisons.json`.
- 프레임으로만 확인하는 시간 구조: `time-structure.png`.
- 회귀 179개: `regression.log`. 새 예제 2개와 음원 끝 검증: `example-tests-delivery-tail.log`.
- 최초 새 검사 실패(0.45의 부동소수점 엄격 비교)는 `example-tests.log`에 보존. 이후 허용오차 1e-12로 검사하고 통과했다. 렌더 실패를 감춘 기록이 아니다.

자동 1배속 플레이어 재생과 PCM/AAC 분석은 직접 시청·청취가 아니다. 독립 검토·실제 관객 반응·예술 수락은 별도로 필요하다. 구현 변경과 제한은 `../../docs/implementation/2026-11-10-code-expression/implementation.md`에 있다.
