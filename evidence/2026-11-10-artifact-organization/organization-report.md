# 산출물 정리 인계

`chore/organize-work-artifacts`에서 문서 개정 복원, 작업별 텍스트 기록, 실제 경로 정규화, 참조 보정과 관리 규칙을 구현했다. `main`은 `36ab1241d58cb4ccb5af6b7ac42922adf8969d45` 그대로다. push·배포·캐시·전역 설정 변경은 수행하지 않았다. 모든 실행은 기존 체크아웃의 단독 작업자가 순서대로 진행했다. 최종 독립 검토는 Astra 리드의 몫으로 남긴다.

[작업 인덱스](../../docs/work-index.md)는 26개 작업 단위의 보고서·근거·로컬 run·제작 경로·커밋·배포 확인 범위와 끊어진 과거 참조를 연결한다. [최종 관리 커밋 전의 전체 커밋 기록](commits-before-final.json)에 각 해시·영문 제목·작업 ID·명시적 스테이징 경로를 남겼다. 최종 관리 커밋의 자기 해시는 이 파일에 넣지 않았으며 `git log -1 --format='%H %s'`로 확인한다.

## 커밋과 이동

첫 세 커밋은 옛 경로에서 각각 code expression, motion authoring, audience acceptance 상태를 복원했다. [개정별 파일 범위](revision-reconstruction.json)와 [세 번째 커밋 직후의 15개 문서 바이트 대조](three-revisions-byte-proof.json)를 보존했다. 첫 커밋 본문에는 stillcuts 등 먼저 존재하던 사용자 편집을 현재 근거만으로 분리할 수 없다고 명시했다. 스타일 문서는 먼저 바뀌지 않은 단계에 억지로 포함하지 않았다.

초기 이동에서 폴더 22곳과 개별 파일 126개를 옮겼다. 개별 파일에는 근거 루트의 94개 파일과 일회성 스크립트 15개가 포함된다. [순수 이동 대조](pure-move-proof.json)는 당시 15,002개 파일의 바이트가 모두 같음을 확인했다. 원본 범위에서 최종 위치가 달라진 파일은 13,702개다. 이후 발견한 release 텍스트 37개와 라이선스 2개의 별도 이동을 합치면 Git의 순수 rename 항목은 1,608개다. 분류하지 못해 남겨 둔 근거 루트 파일은 없다. [경로 대응](path-map.json)에 정확한 분류를 적었다.

기존 로컬 exclude에 숨어 있던 release·production 기록과 확장자 없는 라이선스를 다른 단위 이동 뒤에 발견했다. 원본 바이트를 원래 경로에서 먼저 커밋하고 해당 파일의 이동을 별도로 남겼다. 전체 커밋 순서에 생긴 이 예외는 관련 커밋 본문과 [스테이징 감사](staging-audits-summary.json)에 기록했다. `.git/info/exclude`는 바꾸지 않았다.

초기 콘텐츠 필터가 `draft-store`라는 이름을 놓쳐 작은 텍스트 22개를 추적한 예외도 있다. 파일을 삭제하거나 추적을 해제하거나 이력을 다시 쓰지 않고 그대로 보존했다. 해당 파일의 정확한 경로와 크기는 스테이징 감사에 있다. 새 미디어와 500,000바이트 초과 파일을 커밋한 경우는 없다. 기존 추적 미디어는 모두 보존했다. 상업 음원 및 그 파생 미디어는 새로 추적하지 않았다. 원래 보고서에 실제 이미지 삽입이 없어 새 `figures/` 이미지도 없다.

`watercolor-memory.mjs`는 스킬이 안내하는 도구로 `scripts/`에 남겼다. 다른 실행 도구의 내부 의존성도 유지했다. [스크립트 감사](script-path-audit.json)는 바뀐 스크립트의 문법 검사 62개와 상대 import 84개의 실제 대상 존재를 확인했다. 이동한 Python 스크립트의 저장소 기준 위치와 MJS의 저장소 루트 실행 전제를 보정했다. 제품 `modules/`, `runtime/`, 패키지와 의존성은 변경하지 않았다.

## 검사 결과

변경 전·후 실제 명령은 `npm test -- --test-timeout=60000`이다. 두 실행 모두 **489개 중 468개 통과, 21개 실패, 취소·skip 0개**였으며 실패 제목도 같다. [비교와 한계](tests-comparison.json), [변경 전 원문](npm-before.log), [변경 후 원문](npm-after.log)을 남겼다. 기존 실패를 고치거나 테스트 로직을 수정하지 않았다.

삭제 금지를 지키기 위해 저장소 밖의 Node preload가 `fs.rm/unlink/rmdir`의 동기·콜백·Promise와 named ESM export를 같은 파일시스템의 격리 폴더로 rename한다. 삭제 후 원래 경로의 부재를 유지하며 missing/force 및 파일·디렉터리 오류 조건을 검사했다. 두 볼륨의 fixture 20개와 이동 후 해시 검사는 [smoke 결과](nondeletion-smoke-result.json)에 있다. 네이티브 Chromium이 직접 수행하는 임시 파일 삭제는 Node에서 안전하게 가로챌 수 없어 실행을 제한했다. 따라서 브라우저 관련 21개 실패는 이 제한된 환경에서 관찰된 결과이며, 기존 제품 결함이나 브라우저 검증 통과로 주장하지 않는다. OS의 모든 race·권한 오류·옵션 검증을 똑같이 재현하는 어댑터도 아니다.

Markdown 검사는 저장소의 모든 `.md`를 대상으로 하고 `.git`, `node_modules`, 로컬 `.direction` 및 `.agent-loop` 내부는 제외했다. 보관된 baseline·검토 사본은 포함했고, 코드 블록·inline code의 예시 문자열은 링크에서 제외했다. inline·이미지·reference/collapsed/shortcut·HTML href/src와 Markdown/HTML anchor를 구현하고 외부 임시 fixture로 별도 확인했다. 원본 281개 Markdown에서 로컬 링크·앵커 1,739개, 그중 fragment가 있는 참조 195개를 검사했다. 네트워크 링크 295개는 접속하지 않았다. 최종 새 문서의 링크도 포함해 다시 검사한다.

기존 경로 끊김은 **432개**, 보수적으로 판독한 참조 문법 경고는 **2개**다. 경로 없음 254개, 로컬 `.direction` 경로 없음 178개, 정의되지 않은 reference로 판독한 항목 2개다. 마지막 두 항목은 기존 로컬 `.superpowers` 보고서의 `[0]`·`[1]` 문자열이며 검사기의 보수적 판독이다. source·target·fragment·종류의 다중집합을 경로 대응으로 비교하여 **신규 끊김 0개**를 확인했다. 다른 환경의 절대 경로와 과거 제작 경로는 역사 기록으로 남겼다. 최종 정확한 집계는 [링크 비교](links-final-comparison.json)와 [과거 참조 목록](historical-broken-references.json)에 있다.

## 원본 보존과 Git 관리

[보존 요약](preservation-final-summary.json) 기준 원본 범위 **14,994개**에 각각 고유한 최종 경로가 있다. **14,700개는 바이트가 같고 294개는 명시한 텍스트 경로 보정**이다. 누락·설명되지 않은 손실은 0개다. 수정하지 않은 파일의 동일 해시 개수도 비교하여 같은 내용의 다른 파일로 손실을 숨기지 않았다. [예외 파일 목록](path-only-original-exceptions.json)과 [참조 보정 명세](path-reference-repairs.json)에 파일별 전후 해시가 있다. 전체 원본→최종 대응 14,994행은 로컬 `original-final-map.jsonl`에 보존하고 크기 때문에 추적하지 않는다. 그 파일의 SHA-256은 `239235b0e60ec06f942905cfb87345ab119fbdce674ddc25c7e701c207058128`다.

보존된 미디어는 11,860개, 1,842,100,302바이트다. 기존 다른 `.agent-loop` 파일 70개의 바이트도 그대로다. `.direction`의 기존 경로와 크기는 유지했고, 테스트로 새 폴더 452개와 파일 914개가 생겼다. [정확한 새 폴더 목록](direction-final-summary.json)에 모두 기록했다. `.direction` 사전 SHA-256 명세는 없으므로 이 디렉터리의 전체 바이트 불변성까지 주장하지 않는다.

초기 추적 파일은 1,539개·143,458,509바이트였다. 최종 관리 커밋 전에는 2,923개·153,461,779바이트다. 최종 추적 합계와 clean 상태는 커밋 뒤 외부 확인 결과와 인계 답변에 기록한다. [Git·ignore 검사](git-policy-before-final.json)는 실제 무시 경계, 근거 루트의 파일 0개, 새 미디어 추가 0개와 main 불변을 확인했다. 큰 텍스트의 경로·크기·추적 결정은 인덱스와 [전체 결정 목록](large-text-decisions.json), [선택한 제외 경로](local-text-decisions.json)에 있다. JSON·log를 모두 제외하는 규칙은 쓰지 않았다. 원문 `git status --ignored`와 `git log --stat`는 로컬 대용량 근거로 남겼다.

## 외부 백업·격리와 남은 한계

전달받은 임시 원본 경로 `/var/folders/tf/wn7gzzvd6l7f7_ttdx84ps880000gn/T/cinewright-artifact-backup-pcnomfs2/`는 테스트·이동 전에 사라져 있었다. 그 안의 명세와 독립적으로 바이트를 재대조할 수는 없다. 이 작업자가 삭제 명령을 실행한 적은 없다. 앞선 `preservation-check.json`의 14,994개 무변경 기록을 보존했고, 그대로 남은 체크아웃에서 현재 정리 작업의 추가 파일 8개를 제외해 같은 원본 범위를 복원했다. 현재 run 상태만 이미 baseline 시도 2로 진행한 상태였다. 이 출처 한계를 숨기지 않고, 원본 범위 명세·15개 문서·전체 실제 파일 복사본을 안정적인 외부 볼륨에 다시 보존했다.

- 대체 원본·14,994행 명세: `/Volumes/eyedisk/cinewright-artifact-quarantine-sauealit/organization-work/replacement-originals`
- 임시 스크립트·전체 diff·커밋별 cached stat·size/type 감사: `/Volumes/eyedisk/cinewright-artifact-quarantine-sauealit/organization-work`
- 같은 볼륨 삭제 대체 격리: `/Volumes/eyedisk/cinewright-artifact-quarantine-sauealit`
- 격리 요청 142개의 source→destination: `/Volumes/eyedisk/cinewright-artifact-quarantine-sauealit/organization-work/quarantine-mappings.jsonl`
- 시스템 볼륨 격리의 안정적 복사본: `/Volumes/eyedisk/cinewright-artifact-quarantine-sauealit/organization-work/internal-quarantine-preserved`

[격리 요약](quarantine-summary.json)에 모든 이동된 바이트의 보존 확인과 경로를 적었다. 다른 볼륨으로 copy+delete하는 동작은 하지 않았다. 이 작업에 쓴 검증 도구는 저장소 밖에 두었고 의존성이나 상시 인프라를 추가하지 않았다. 리드는 실제 브라우저 검증의 한계, 사라진 최초 임시 명세의 출처 한계, store 텍스트 22개와 늦게 발견한 콘텐츠의 커밋 순서 예외를 검토해야 한다. 최종 독립 검토와 사용자 수락을 대신 완료했다고 표시하지 않는다.

## 리드 검토 결과

Astra가 구현 HEAD의 파일 해시·개정 복원·순수 이동·기존 미디어 보존·테스트 원문을 직접 확인했다. [독립 검토 기록](lead-review.md)에 보완 사항과 충족하지 못한 조건을 구분했다. 이 검토는 구현 완료를 확인하되 전체 요청의 무조건적 수락을 뜻하지 않는다.
