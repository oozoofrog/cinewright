# 미학 툴킷 후속 실행 — 물리 수채·자동 rig·retarget

2026-11-08 KST. 상태: **사용자 후속 실행 승인, T3 다중 팀 총괄 위임 시작.**

## 승인과 범위

사용자 최신 요청: “후속범위 진행해주세요”. 직전 최종 인계에서 후속으로 명시한 물리 수채, 자동 리깅, 리타게팅을 우선 실행한다. 기존의 T3·CE/CO 다중 팀 위임 방식과 라이브러리/스킬/데모/검증 요구를 이어간다. 구현 프롬프트를 다시 승인받는 단계는 요구하지 않았다.

참고 정본: [초기 구현 인계](2026-11-08-aesthetic-toolkit-final.md), [초기 승인 프롬프트](../research/2026-11-08-aesthetic-toolkit/IMPLEMENTATION-PROMPT.md). 초기 프롬프트에서 후속으로 제외했던 아래 세 항목의 구현 범위는 이번 최신 요청으로 확장됐다. 과거 지원 한계와 성공 기록을 당시 사실로 보존한다.

## 이번 후속 납품의 세 축

1. **재현 가능한 수채 물리 bake**: 기존 polygon glaze와 별도의 물/안료 이동·확산, 종이 흡수·건조·침착을 계산하는 제한된 격자 모델. 고정 step/seed/입력/solver 버전과 bake/cache를 소유하고 임의·역순 seek를 지킨다. 근사 모델의 방정식·보존/손실·안정성·자산 비용과 한계를 밝힌다. blur나 기존 glaze를 물리 solver로 이름만 바꾸지 않는다.
2. **지원 범위가 명시된 자동 rig/skin**: 정적 메쉬에서 skeleton·bind·skin weights를 생성하는 실제 코드와 진단을 제공한다. 초기 대상의 rest pose/축·인체 계열 등 조건, 자동 추정과 선택 landmark 지침의 차이를 명확히 한다. 이미 rig된 메쉬를 로드하는 것만으로 자동 rig를 완료했다고 하지 않는다. 실패하는 임의 메쉬를 지원한다고 주장하지 않는다.
3. **골격·비율이 다른 자산의 동작 retarget**: bone mapping/rest pose/축/scale/root motion/loop·absolute sampling을 처리한다. foot/contact 보정과 실제 skinned mesh 재생·NPR 합성을 검증한다. 기존 rigid clip player만 재포장하지 않는다.

초기 스타일과 이전 프로젝트는 기본 동작을 유지한다. 새 모드·버전·자산 계약은 명시적으로 선택하며 이전 frozen revision과 미디어를 교체하지 않는다. 추가 독립 미학팩·cloth·volumetric·autoUV·임의 영상의 자동 작화는 이 세 항목을 검증 없이 대체하는 수단으로 쓰지 않으며 더 큰 확장 목록으로 남긴다.

## 팀과 책임

- **총괄·통합·rig 팀 — CE/Sol**: 기존 구현 보존, 현재 기준 검사, 공통 API/파일 소유권, 자동 rig와 실제 skinning, 스타일/CLI/materialize/catalog/스킬 통합 및 최종 인계.
- **수채 물리 팀 — CO/Terra**: solver·bake·물리/수치 검증, 두 내용의 수채 데모, 소유 자산과 문서.
- **동작·retarget 팀 — CE/Astra**: cross-skeleton pose/clip 변환, root/contact 처리, 두 비율/메쉬와 여러 clip의 증거·데모.
- **독립 검증 팀 — 별도 CO/Sol delegate**: 코드·수치·영상·재사용·seek/freeze를 검사하고 구체 지적을 전달한다. 총괄이 수정하고 재검증한다.

예정 역할이며 실제 생성된 child/model/thread와 산출물은 총괄이 실행 receipt로 남긴다. 동시 직접 child는 최대 둘, 공용 파일은 총괄이 소유한다. 각 구현 child는 직접 수행하고 추가 하위 팀을 만들지 않는다.

## 완료 기준

- 세 항목의 실제 공개 API·CLI/생성·스타일 통합, 자산·스킬 지침·지원/미지원 표.
- 서로 다른 두 수채 입력, 서로 다른 두 정적 메쉬에서 생성한 rig/weights, 서로 다른 두 동작의 골격/비율 변경 retarget을 증명하는 새 영상·비교 자료.
- 정지 자세의 bind 재현·weight 정규화·범위, 접지/관절 오차, 수치 안정성과 물/안료 수지, 전체 임의/역순 seek·freeze/local packaging·dispose·색/alpha·실제 렌더/재생/섬광·기존 회귀 검증.
- 독립 검토 지적의 수정·재검증, 새 산출물과 실행 근거를 연결한 후속 인계. 사람의 시청·미학 수락은 별도로 기록.
- shared dirty checkout, 초기 증거·미디어·원본·HEAD·index 보존. 새 제작·bake 데이터는 별도 경로 사용. 사용자 미요청 commit/push/PR/배포·전역 설치·미디어 외부 전송은 하지 않는다.

이번 기록은 실행 범위와 승인을 남긴 것이며 위 기능이 이미 구현됐거나 검증을 통과했다는 뜻은 아니다.
