# Cinewright 관객 수용 지침 개편

이제 에이전트는 프레임 사이 팔 자세 변화만으로 필수 결함을 확정하거나 원속도 검토가 가능해질 때까지 전체 제작을 멈추지 않는다. **확인 지점**으로 위치·관찰을 사용자나 원속도 검토자에게 넘기고 합의 범위를 계속 제작한다. 관찰 자체가 없는 시간 경험은 **미검증**으로 남긴다. 명시된 필수 행동은 이행하며, 형태·실루엣·명암·구도·정보 밀도·인물 일관성은 정지화면에서 계속 판단한다.

## 지침과 용어

루트의 기존 목표 문장을 통합해 관객 수용을 목적과 완료 판단의 출발점으로 삼았다. 자연스러움은 설득력 있는 창조성·예술성·핍진성의 영역에 속하는 작품의 성질이며 동작의 속성이 아니다. 연속성·보간의 매끄러움·사실성과 구별했다. 관객 수용은 실제 관객 반응 측정이나 검토자 합의와 같지 않다.

대중성은 의도한 관객과 맥락에서 무엇이 읽히고 기억되는지에 관한 기존 제작 관점이다. 핍진성은 작품이 세운 세계와 양식 안의 그럴듯함이다. 둘을 치환하지 않았고 핍진성을 양식화 판단에도 연결했다. 의도·일관성은 그 판단 근거이지 핍진성의 다른 이름이 아니다.

동작·접촉·물성·포즈·편집 지침은 삭제하지 않고, 명시된 필수 동작·접촉·물성을 수행하거나 원속도에서 실제 관찰한 관객 수용 저해의 원인을 조사할 때 사용하도록 한정했다. 힘·무게·재질, 포즈→breakdown→프레임 배분, 경계 전후 프레임, 0.1초 이하 띠 검사를 보존했다. 프레임 검사는 형태·경계·합성 회귀를 살피며 시간 경험을 판정하지 않는다. 구절·변주·여백과 미출력 찻잔 사례는 필요한 작품이 선택하는 수단이다.

필수 결함은 명시된 필수 행동·사실·정체성·인과관계의 누락/훼손, 원속도에서 실제 관찰한 관객 수용 저해, 작품 전달의 기술 실패로 한정했다. 예제의 실패 징후·표현 수정 의견은 자동으로 필수 결함이 되지 않는다. 정지화면 판단에 따른 수정은 계속하되 필수 결함으로 분류할 때는 세 범위 중 근거를 명시한다. 기능 검사와 결함 제거만으로 창작 목표를 달성했다고 보고하지 않는다.

고친 문장별 이전 지시·이유·이후 결정은 [문장 조사](../../../evidence/audience-acceptance-20261110/inventory.md)와 [감사 후 문장별 보완](../../../evidence/audience-acceptance-20261110/audit-changes.md)에 있다.

## 변경 파일과 보존

이번 기준선 대비 수정한 스킬 문서는 다음과 같다.

- [루트 SKILL](../../../SKILL.md), [플러그인 진입점](../../../skills/cinewright/SKILL.md)
- [craft-execution](../../../references/craft-execution.md), [direction](../../../references/direction.md), [craft](../../../references/craft.md), [stillcuts](../../../references/stillcuts.md), [music-box](../../../references/music-box.md), [music](../../../references/music.md)
- styles의 [index](../../../references/styles/index.md), [line-wash](../../../references/styles/line-wash.md), [silhouette-theatre](../../../references/styles/silhouette-theatre.md), [expressionist-space](../../../references/styles/expressionist-space.md), [retarget](../../../references/styles/retarget.md), [watercolor-physical](../../../references/styles/watercolor-physical.md)

편집 전 git diff와 문서 사본·해시는 [baseline](../../../evidence/audience-acceptance-20261110/baseline/)에 보존했다. 기존 미커밋 변경은 되돌리지 않았다. 이번에 편집하지 않은 format.md도 기준선과 바이트가 같다. [전체 패치](../../../evidence/audience-acceptance-20261110/baseline-to-current.patch)와 [최종 해시](../../../evidence/audience-acceptance-20261110/current-sha256.txt)를 남겼다. 초기 기계적 조사 목록은 inventory-initial.md로 보존한 뒤 의미에 따른 조사로 보완했다. 같은 날 motion-authoring 문서·증거는 읽기 전용으로 다뤘다.

## 용어 감사와 반영

독립 Claude Opus 5.5(high, claudeAgent)는 감사 당시 문서와 사용자 용어 정의만 읽었다. [지시·답변 원문](../../../evidence/audience-acceptance-20261110/terminology-audit.md), [감사 당시 사본](../../../evidence/audience-acceptance-20261110/audited-documents/), [항목별 처리](../../../evidence/audience-acceptance-20261110/terminology-disposition.md)를 보존했다.

확인 지점/미검증 혼용, 모호한 acceptance·예술 수락, 밋밋함이나 독립 검토를 완료 관문으로 읽는 문장, 부드러움/매끄러움 혼용은 고쳤다. 연속성과 자연스러움도 직접 구별했다. ‘대중성이 핍진성을 대신한다’와 ‘정지화면 문제·예제 실패가 곧 필수 결함이다’라는 해석은 그대로 채택하지 않았다. 기존 대중성 관점과 정지화면 판단을 유지하면서 핍진성의 적용과 필수 결함 분류 근거를 명확히 했다. 뜻이 다른 설득용 해설·연속 숏 등은 유지했다.

감사 후 작은 수정은 리드가 직접 반영하고 정의와 재대조했다. Claude 재감사는 하지 않았다.

## 독립 행동시험

각 시험에 문서 구현에 참여하지 않은 새 Sol(medium, codex-oozoofrog) 두 명씩, 총 네 명을 사용했다. 각 쌍은 같은 질문을 받고 기준선 또는 개편 후 문서 하나만 읽었다. 개편 목적·기대 답변·다른 응답은 주지 않았다. 모든 작업은 shared였고 추가 위임을 금지했다. 비활성 provider codex는 사용하지 않았다.

**판정 시험:** [기준선 답변](../../../evidence/audience-acceptance-20261110/decision-baseline.md)도 한 프레임 전환의 결함 확정은 유보했다. 그러나 원속도로 짧은 구절을 확인·수정한 뒤 전체로 확장하겠다고 해 현 환경에서는 12초 제작을 보류했다. [개편 후 답변](../../../evidence/audience-acceptance-20261110/decision-revised.md)은 확인 지점으로 분류하고 12초 제작을 계속했다. 보간·중간 포즈를 선행 조건으로 삼지 않았고 위치·관찰·미검증 영향을 인계하며 정지화면 판단은 유지했다.

**제작 계획 시험:** [기준선 답변](../../../evidence/audience-acceptance-20261110/plan-baseline.md)은 접는 과정의 구도·속도에서 출발해 짧은 동작 시험에 가장 큰 단일 작업 시간을 배분했다. [개편 후 답변](../../../evidence/audience-acceptance-20261110/plan-revised.md)은 관객이 8초 동안 발견할 것과 필수 조건에서 출발했다. 접는 핵심 구간을 전체 초안에 연결하고 전체 시간 경험을 검토하는 작업을 구분했다. 펼침/접힘 두 화면으로 과정을 생략하지 않는다고 명시하여 필수 행동을 보존했다. 시간 단위와 작업 묶음이 달라 효율·시간 절감으로 비교하지 않았다.

[상세 대조](../../../evidence/audience-acceptance-20261110/behavior-comparison.md)에 분류·계속 제작·인계, 출발점·배분·완료·중단을 기록했다. 각각 한 쌍의 계획·판단 비교이며 영상 품질이나 관객 수용을 증명하지 않는다. 시험은 감사 직전 문서로 시행했다. 감사 후 용어 명료화는 리드가 확인했으며 행동시험을 반복하지 않았다. 실제 제작 준수나 다른 모델·의뢰에서의 재현성은 검증하지 않았다.

## 검사와 한계

- 기존 music-integration·craft-execution·craft-binding 테스트 11개 통과. [로그](../../../evidence/audience-acceptance-20261110/node-tests.log)
- 감사 후 루트 변경에 따라 문서 문자열 테스트를 재실행해 통과. 원본 테스트와 검사 문서의 바이트가 같은 저장소 밖 임시 사본에서 실행했다. [최종 로그](../../../evidence/audience-acceptance-20261110/node-doc-test-final.log)
- 상대 링크·앵커 일회성 검사 및 git diff --check 통과. 저장소에 테스트는 추가하지 않았다. [최종 링크 결과](../../../evidence/audience-acceptance-20261110/link-check-final.txt)
- 리드가 기준선 해시, 변경 범위, 패치, 캐시 해시, 테스트 로그·관련 소스, 핵심 지시와 네 답변 원문을 직접 대조했다. [검증 기록](../../../evidence/audience-acceptance-20261110/lead-verification.txt)
- quick_validate는 Python yaml 모듈 부재로 실패했다. 의존성을 설치하거나 통과로 기록하지 않았다. [오류](../../../evidence/audience-acceptance-20261110/quick-validate.log)
- 전체 저장소 테스트, 영상 생성·원속도 시청·청취·관객 반응·사용자 수락은 검증하지 않았다. Music Box Dancer를 재판정하거나 12초 제작을 재개하지 않았다.

첫 기존 테스트가 .direction/music-integration/run-l2Pjg9에 임시 출력을 만든 것은 경로 제약을 지키지 못한 실행이었다. 작업자가 해당 폴더만 제거했고 리드는 잔존하지 않음을 확인했다. [경위](../../../evidence/audience-acceptance-20261110/test-scratch-cleanup.txt)를 남겼다. 기존 제작물을 편집했다는 증거는 없지만 전체 .direction의 사전 해시를 수집하지 않아 모든 기존 파일의 불변성을 독립 입증하지는 못했다. 최종 문자열 재검사는 저장소 밖에서 수행했다.

## 설치본과 후속 절차

설치 캐시 /Users/oozoofrog/.codex/plugins/cache/cinewright-local/cinewright/1.1.0을 읽기 전용으로 비교했다. 이번 변경 문서 14개와 보존한 기존 format.md는 모두 작업본과 캐시의 해시가 다르다. [파일별 SHA-256](../../../evidence/audience-acceptance-20261110/cache-sha256.md)에 근거를 남겼다. 해시 차이는 바이트 차이이며 행동 개선의 증거는 아니다.

현재 결과는 저장소 작업본이다. 캐시 갱신·설치, 커밋·푸시·배포는 하지 않았다. 사용자가 정할 후속 절차는 개편 채택과 설치본 반영 여부, 이후 12초 제작 재개의 범위다. 이번 작업에서는 이를 실행하지 않는다.
