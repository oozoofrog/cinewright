# 움직임 저작 문서 변경

기준선은 `evidence/motion-authoring-20261110/baseline/`의 워킹트리 사본이다. 기존 [루트 제작·검토](../../../SKILL.md#제작과-검토)는 시간 속 관계와 사건 배치에서 짧은 출력으로 이어졌지만, 좌표 이전에 구절의 길이·순서와 변주 주체를 정하는 과정은 구체적이지 않았다. 스틸만으로 움직임을 통과시키지 않는 원칙은 이미 direction의 실제 출력 검토에 있으므로, 이번에는 그 원칙을 구절의 시간적 매력 판단에도 연결했다. [작법 실행의 저작 입력](../../../references/craft-execution.md#단서에서-저작-입력까지)도 관계와 사건을 중심으로 설명했다. 사건의 전달을 유지하면서 움직임을 보는 경험을 별도로 설계하고 실제 재생으로 수정할 수 있도록 두 곳을 보완했다. 기존 선택적 표현 검토 산문에도 과정·변주·여백·정지·형태·음악을 작품에 맞춰 판단하는 관점을 통합했다.

기존의 움직임 성격이 다른 안과 종이 새 변주는 [작법 실행의 표현 목표](../../../references/craft-execution.md#표현-목표에서-제작안-선택까지), 간격·예비 동작·안착은 [동작 시험](../../../references/direction.md#스틸-동작-시험-전체-초안), 박자 반응 기본값을 피하는 선택은 [음악 지침](../../../references/music.md), 기존 선택적 질문은 [실제 출력 검토](../../../references/craft-execution.md#실제-출력에서-원인을-선택하고-고치기)에 있다.

기준선 대비 수정 파일은 `SKILL.md`, `references/craft-execution.md`이며 이 보고서는 새 파일이다. 허용된 나머지 래퍼와 참조 문서는 기준선과 같은 내용을 유지한다. 기존 워킹트리 변경을 HEAD와 비교해 되돌리지 않았다.

[두 찻잔의 춤](../../../references/craft-execution.md#미출력-저작-예시-두-찻잔의-춤)은 제안된 미출력 사례다. 기존 cups 소스와 영상은 수정하지 않았다. 회전·방향 및 손잡이 변화와 받침의 시간차는 구현하거나 검증하지 않았고 새 렌더도 없다. 소스에서 `preparePoseTracks`의 보간, `motion`의 진행·경로·사건 함수와 `exposure`의 표본·포즈 함수를 직접 읽어 설명했다. 구절의 변환과 반복은 작품 코드의 저작이며 공용 API가 아니다. 문서 작업자는 소스로 API 설명을 확인했고, 리드의 대표 호출 검증 결과는 아래에 구분했다.

[독립 제작 계획 대조](../../../evidence/motion-authoring-20261110/plans/comparison.md)에서 기준선 계획도 반복·주도권 교대·정지를 저작했다. 개편 후 계획은 첫 구절을 6f 준비→12f 넓은 호→6f 정리→6f 멈춤으로 나누고, 둘째의 경로·진행 길이·강세를 따로 설계했다. 중심 간 거리를 유지하는 공동 원호 뒤 여백을 좁히고, 응답이 복제처럼 보이면 경로·준비·정지부터 수정하도록 했다. 두 계획 모두 무음을 선택했으므로 음악 관계의 변화는 확인되지 않았다. 문서 편집에 참여하지 않은 두 Sol 작업자에게 같은 의뢰와 각 문서 묶음만 주었고 목적·기대 답은 알리지 않았다. 여섯 항목을 형식적으로 채운 결과가 아니므로 계획 수준 수락 조건을 충족한다. 같은 찻잔 사례를 읽은 한 쌍의 비교라 다른 주제로의 일반화나 영상 매력을 증명하지는 않는다. 

그 밖의 리드 검증은 다음과 같다. 제품·참조 문서와 최종 보고서·계획 대조의 상대 링크·앵커 58개가 통과했고, `node scripts/direction.mjs --help`와 CLI 분기로 freeze/play/frame/render 및 구간 옵션을 확인했다. 실제 exports를 import하여 키 보간·hold·bezier, 진행·지연·경로·최근 사건, 노출·포즈 평가를 호출했다. 새 찻잔 장면의 실행이나 재생을 확인한 것은 아니다.

`node --test --test-concurrency=1 tests/music-integration.test.mjs tests/motion.test.mjs tests/pose-tracks.test.mjs tests/pose-materialize.test.mjs tests/relation-studies.test.mjs tests/craft-execution.test.mjs`는 21개 통과, 실패·skip 0이었다. 실행 전후 관련 입력 해시도 같았다. `git diff --check`가 통과했다. [검증 증거](../../../evidence/motion-authoring-20261110/verification/)에는 로그, 링크 결과, API 호출 결과, 기준선 대비 diff와 보존 검사를 남겼다. 테스트나 공용 코드는 추가·수정하지 않았다. 기준선에서 보관한 14,852개 기존 파일 중 바뀐 것은 위 제품 문서 두 개뿐이며, 기존 run 두 개·예제·영상·검토 증거는 그대로다.

[캐시 해시 비교](../../../evidence/motion-authoring-20261110/verification/cache-comparison.json)에서 `plugin.json`은 양쪽 모두 1.1.0이고 파일 해시도 같지만, 기준선의 편집 대상 8개 문서는 모두 캐시와 다르다. 현재 작업 트리의 지침은 `/Users/oozoofrog/.codex/plugins/cache/cinewright-local/cinewright/1.1.0`에 미반영이다. 캐시는 읽기만 했고 `~/.agents/skills/cinewright`의 끊어진 링크도 그대로 뒀다.

찻잔 사례의 새 렌더, 원속도 시청·직접 청취, 예술 수락은 수행하지 않았다. 프레임 열람이나 자동 재생을 대신 수행했다고 기록하지도 않는다. 회전·손잡이 변화·받침 시간차와 최종 영상의 매력은 미검증이다. 배포 후속 명령은 기존 [craft-redesign 기록](../2026-11-10-code-expression/craft-redesign.md#플러그인-배포-준비--읽기-전용-조사)의 `env CODEX_HOME=/Users/oozoofrog/.codex codex plugin marketplace upgrade cinewright-local --json`, `env CODEX_HOME=/Users/oozoofrog/.codex codex plugin add cinewright@cinewright-local --json`, `env CODEX_HOME=/Users/oozoofrog/.codex codex plugin list --marketplace cinewright-local --json`을 인용한다. 실행하거나 배포하지 않았다. marketplace는 원격 소스를 읽으므로 로컬 미커밋 변경만으로 갱신되지 않는다. 사용자가 커밋·푸시 범위와 배포할 원격 revision을 결정한 뒤 별도 배포 절차로 진행해야 한다.
