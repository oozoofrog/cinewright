# 코드 표현 개편 인수인계

시간 속 관계를 중심으로 작법과 제작 경로를 개편하고, 공개 자작 예제 대표 1편과 변주 2편을 구현했다. [작법 변경 목록과 이유](craft-redesign.md) · [구현·저작·검증 상세](implementation.md) · [예제 소스와 저작 설명](../../../examples/relation-studies/README.md)

## 산출물

- 대표 [둘이 지난 자리 — cups.mp4](../../../evidence/2026-11-10-code-expression/delivery/cups.mp4): 두 잔의 위치 변화와 과거 배치의 흔적.
- 변주 [건너편 — doorway.mp4](../../../evidence/2026-11-10-code-expression/delivery/doorway.mp4): 구도의 전환과 빛의 소거.
- 변주 [접힌 사이 — fold.mp4](../../../evidence/2026-11-10-code-expression/delivery/fold.mp4): 짝지은 형태와 접힘의 시간차.

각 영상의 revision·canonical job·SHA-256은 [results.json](../../../evidence/2026-11-10-code-expression/delivery/results.json)에 있다. [수정 전후와 제거 비교](implementation.md#비교-증거와-추론), [시간구조 이미지](../../../evidence/2026-11-10-code-expression/time-structure.png)도 보존했다. 부모는 세 delivery 영상과 각 canonical 영상의 SHA 일치 및 시간구조 이미지 열람을 확인했다.

## 재현과 기술 검증

저장소 루트에서 실행한다. 출력 경로는 존재하지 않아야 한다. 아래 예시는 기존 delivery를 덮어쓰지 않는다.

```sh
node scripts/direction.mjs doctor
node examples/relation-studies/run.mjs ./relation-study
node --test tests/relation-studies.test.mjs
node examples/relation-studies/verify.mjs ./relation-study
```

제작자는 최종 출력의 전체 1,008프레임을 정순·역순·직접 조회해 전체 render와 비교하고, 경계·별도 frame 및 구간 render, PCM과 AAC, 무음 자동재생을 검사했다. 신규 테스트 2개와 관련 기존 회귀 179개가 통과했다. 전체 `npm test`는 실행하지 않았다. 결과와 환경·제약은 [검증 보고서](../../../evidence/2026-11-10-code-expression/delivery/verification/report.json)와 [구현 기록](implementation.md#기술-검증과-제한)에 있다. 자동재생은 직접 시청·청취가 아니다.

## 남은 검토와 배포

[독립 프레임·코드 검토](../../../evidence/2026-11-10-code-expression/independent-review.md)를 완료했다. 확인 범위에서 확정적 필수 수정은 없었고, 작법 개편이 세 편의 서로 다른 제작 선택으로 이어진 점을 확인했다. 납품 영상·소스 해시와 기술 증거도 일치했다. 이는 세 편 모두의 완성작 수락을 뜻하지 않는다. 특히 `fold`는 접기 동작 시연의 성격이 강해 작품으로서의 판단을 유보했다.

원속도 시청·직접 청취, 실제 관객 반응과 예술 수락은 미검증이다. 다음 검토에는 [중립 입력](../../../evidence/2026-11-10-code-expression/review-brief.md)과 세 영상을 먼저 사용한다. cups의 마지막 정지와 자리 이전, doorway의 음과 컷 및 공간 연결, fold의 시간차가 단순 순차 동작 이상의 관계로 경험되는지를 소리 포함 전체 재생으로 확인한다. 부모는 독립 보고서와 최종 인수인계를 대조했으며, 추가 소스·영상 변경은 하지 않았다.

활성 `cinewright@cinewright-local` 플러그인 캐시에는 이번 개편을 배포하지 않았다. 완성된 패키지와 별도 배포 권한·원격 revision을 확인한 뒤 기존 설치를 지원 명령으로 갱신한다. 정확한 명령과 설치 후 검증은 [플러그인 배포 준비](craft-redesign.md#플러그인-배포-준비--읽기-전용-조사)에 기록했다. 독립 스킬을 다시 만들거나 다른 계정에 중복 설치하지 않는다.
