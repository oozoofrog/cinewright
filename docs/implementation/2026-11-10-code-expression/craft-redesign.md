# 코드 표현 중심 작법 개편

## 관찰과 변경

- 기존 상위 지침은 여러 매체를 허용했지만 실행 경로의 첫 질문과 순서가 대상의 구동, 포즈, 접촉에 집중되어 있었다. 시작 질문을 관객이 시간 속에서 발견할 관계, 형태·공간·소리의 관계, 유지·변화·생략으로 바꾸었다.
- 의도·불변 조건 → 시간 속 관계 → 화면·소리 사건 배치 → 매체·자산·규칙·수작업 → 짧은 출력 → 원속도 검토·수정 → 전체 전개로 연결했다. 포즈·물성·크레인은 필요한 경우의 경로로 남겼다. 이미 있던 환경 사건과 출처 관련 미커밋 문구도 보존했다.
- 시간 표식은 실행기가 아니며 레이어 값 교환은 같은 프레임의 관계를 전달한다. `eventEnvelope`는 최근 사건 반응이다. 누적은 결정적인 과거 평가 또는 베이크로 저작한다. 점 보간은 저자가 제공한 대응을 사용한다. 이 한계를 실행 지침과 입력 규약에 명시했다.
- 의도별 표현 질문을 추가하고 점수·체크리스트와 예술 수락을 분리했다. 인체 사실성, 추상 도형·입자·노이즈·오디오 반응, 규칙→예외→흔적을 기본 공식으로 강제하지 않는다. 필수 행동·정체성은 추상화를 이유로 삭제하지 않는다. 회화·3D·인체 도구와 기존 재생·렌더·오디오 경로는 유지한다.
- 새 공개 예제의 실행 경로와 대표 1안·변주 2안의 소스, 영상, 수정 비교 방법을 연결했다. 기존 곡은 요구하지 않는다. 크레인은 별도의 경로·접촉 기능 연구로 남겼다.

## 추론과 반례

같은 구도의 장시간 정지, 의미 변화 없는 반복 자체, 직접적인 노래와 과장된 움직임도 의도에 따라 유효하다. 앞 사건의 흔적이나 효과 제거를 모든 작품에 의무화하면 이런 선택을 잘못 배제하므로 평가 질문은 선택적으로 쓴다. 이는 작법 판단이며 관객 반응의 관찰 결과가 아니다.

## 통합 결과와 검증 범위

- `examples/relation-studies/`는 대표와 두 변주의 소스·자작 음원·최종 영상 및 수정 비교를 포함한다. 제작자의 실행·검증 범위는 [구현 기록](implementation.md), 최종 경로는 [인수인계](README.md)에 있다. 부모는 delivery 세 MP4와 canonical 출력의 SHA 일치 및 시간구조 이미지 열람을 확인했다.
- 실제 원속도 시청·청취, 예술 수락, 독립 검토는 이 문서 작업에서 수행하지 않았다. 자동 재생과 프레임 분석을 직접 감상으로 취급하지 않는다.
- 설치 상태와 복구 보류 근거는 아래 후속 확인에 기록했다. 저장소 변경은 활성 플러그인 캐시에 자동 동기화된 것으로 확인하지 않았다.
- 원본 자산과 기존 미커밋 변경을 보존했다. 기술 검증, 표현 판단, 독립 검토, 실제 관객 반응과 사용자 수락은 별도로 기록한다.

## 전역 연결 후속 확인 — 복구 보류

**관찰:** 이전 `evidence/global-install/installation.json`은 `/Users/oozoofrog/.codex/skills/cinewright`에 독립 복사본을 설치한 기록이다. 2026-11-09 22:33 KST의 `36ab124`는 README에서 그 전역 설치 안내를 삭제하고, 플러그인 검증 후 오래된 독립 스킬을 제거하고 플러그인만 설치하라고 명시했다. 실제 Codex 설정에서 `cinewright@cinewright-local`은 활성화되어 있으며, 캐시 `cinewright/1.1.0` 디렉터리는 22:33:56에, 전역 skills 디렉터리는 22:34:32에 변경됐다. 두 기존 링크는 여전히 사라진 독립 스킬을 가리킨다. eyemacworld 전용 스킬 경로에는 Cinewright 항목이 없다.

**판단:** 최신의 명시적 제거 지침, 활성 플러그인, 시간상 이어진 디렉터리 변경은 이전 독립 설치의 의도적 제거를 강하게 뒷받침한다. 정확한 삭제 명령이나 행위자는 확인하지 못했다. 사용자가 지정한 예외 조건에 따라 전역 경로와 eyemacworld 경로를 복구하거나 기존 링크를 고치지 않았다. 검토 명령: `git show 36ab124 -- README.md`, `ls -ldT /Users/oozoofrog/.codex/skills /Users/oozoofrog/.codex/plugins/cache/cinewright-local/cinewright/1.1.0`, Codex 설정의 `plugins."cinewright@cinewright-local"` 확인. 쓰기 명령은 이 문서 기록뿐이며 설치·삭제·링크 생성은 없다.

저장소의 `SKILL.md`가 직접 링크하는 로컬 문서와 `examples/stillcuts/README.md`는 읽기 검사를 통과했다. `examples/relation-studies/run.mjs`는 이후 제작자가 실행해 세 영상을 생성하고 기술 검증을 기록했다. 문서 담당이 다시 실행하거나 영상을 원속도로 감상하지는 않았다. 활성 플러그인의 캐시는 저장소 변경을 포함한다고 확인하지 않았고, 새 작법의 전역 배포 및 다음 세션에서의 로딩은 미검증이다. 두 끊어진 링크와 eyemacworld 경로를 어떻게 정리할지는 부모에게 전달한다.

## 플러그인 배포 준비 — 읽기 전용 조사

**관찰:** `evidence/release-20261109/REPORT.md`의 Removal은 앞서 추론했던 제거를 명시적으로 확인한다. 기존 독립 설치는 플러그인 검증 후 삭제됐다. 기본 Codex 홈 `/Users/oozoofrog/.codex`의 설정에서 `cinewright@cinewright-local`은 활성화되어 있고 1.1.0 캐시가 존재한다. 사용자가 지정한 기본 계정은 eyerama다. `codex-oozoofrog`와 `codex-eyemacworld`의 각각의 설정에는 Cinewright 플러그인 항목이 없고 확인한 별도 캐시에도 이름이 없다. 설정·캐시 검사이며 각 계정의 새 세션에서 실제 스킬 탐색을 실행한 결과는 아니다. 기존의 끊어진 독립 스킬 링크는 그대로다.

2026-11-10 확인 시 기본 캐시와 저장소의 SHA-256 비교: 루트 `SKILL.md`, `skills/cinewright/SKILL.md`, `references/craft-execution.md`, `craft.md`, `direction.md`, `format.md`, `music.md`, `stillcuts.md`가 다르다. 나머지 확인한 references 11개는 같다. `stillcuts.md`의 미커밋 변경은 기존 사용자 작업이다. 저장소의 새 지침이 캐시에 배포되어 있지 않다는 뜻이며, 캐시를 수정하지 않았다.

**지원 경로와 선행 조건:** README와 직전 릴리스 기록은 플러그인 marketplace upgrade 후 같은 plugin ID의 `add`를 사용한다. 직전 기록에서 이 `add`는 이미 설치된 1.1.0을 지원 경로로 갱신했으며 별도 독립 스킬을 만들지 않았다. 현재 marketplace는 GitHub 원격을 가리킨다. 따라서 로컬의 미커밋 변경만으로 다음 명령에 새 내용이 들어간다고 가정할 수 없다. 예제와 기술 검증이 준비된 이후에도 패키지 구성·소스 범위와 독립 검토를 확인한 뒤, 별도로 권한을 받은 공개/배포 절차를 거쳐 marketplace가 읽을 원격 revision을 확정해야 한다. 이번 작업은 커밋·푸시·게시·갱신을 승인하거나 수행하지 않았다.

완료 후 기본 Codex 홈에서 기존 플러그인을 갱신할 때 README와 직전 증거에 기록된 명령은 다음과 같다. 실제 배포 권한과 원격 revision을 먼저 확인한다. 다른 계정에 중복 설치하지 않는다.

```sh
env CODEX_HOME=/Users/oozoofrog/.codex codex plugin marketplace upgrade cinewright-local --json
env CODEX_HOME=/Users/oozoofrog/.codex codex plugin add cinewright@cinewright-local --json
env CODEX_HOME=/Users/oozoofrog/.codex codex plugin list --marketplace cinewright-local --json
```

갱신 결과의 `installedPath`와 설치·활성 상태를 확인하고, 그 실제 플러그인 루트에서 `npm ci`를 실행한다. 이어서 `node <실제-플러그인-루트>/scripts/direction.mjs doctor`, 새 임시 프로젝트의 `init`·`freeze`, 예제의 새 출력 경로 실행을 검사한다. 배포 revision의 추적 파일과 설치 파일 해시를 비교하고 wrapper가 해당 루트 SKILL과 references/examples를 읽는지 확인한다. 이전 릴리스는 app-server `skills/list`의 `forceReload=true`로 플러그인 항목 하나를 확인했다. 새 세션에서 갱신된 지침을 사용하는지도 별도로 확인한다. 자동 재생·기술 검증과 실제 시청·청취·예술 수락은 분리한다. 위 명령과 검사는 미래 절차이며 이번에는 실행하지 않았다.
