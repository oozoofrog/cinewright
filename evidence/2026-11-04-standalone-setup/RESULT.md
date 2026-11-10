# Cinewright 독립 개발 환경

개발 경로는 /Volumes/eyedisk/develop/cinewright다. 이 디렉터리에 main 브랜치의 독립 Git 저장소를 초기화했다.

Counting Star 내부의 multimedia-direction-toolkit에서 소스, 스킬, 예제 입력, 완성 영상과 검증 근거 307개 파일을 복사했다. 복사 직후 모든 파일의 SHA-256이 원본과 일치했다. 새 저장소의 README에 개발 경로와 실행 데이터의 범위를 추가하고 .gitignore에 macOS 메타데이터 제외 규칙을 추가했다. 원래 경로의 README는 새 개발 경로를 안내한다.

node_modules, .direction과 Python 캐시는 Git 추적에서 제외한다. 필요한 의존성은 잠금 파일로 설치한다. 예제 자산, 완성 영상과 제작 근거는 저장소에 포함했다.

문서에서 사용하는 개정본 4개와 완료 작업 4개를 로컬 .direction에 가져왔다. 개정본의 바이트와 식별자를 유지하고, 작업 기록의 결과 파일 위치를 새 루트로 연결했다. 각 작업의 원래 job.json은 job.source.json으로 함께 보관했다. 과거 로그의 절대 경로는 당시 실행 환경을 나타낸다.

새 체크아웃에서는 npm ci 후 예제 경로로 실행한다. 개정본 해시나 작업 ID를 직접 사용하는 명령에는 대응하는 로컬 .direction 기록이 필요하다.

새 개발 경로에서 다음을 확인했다.

- npm ci가 잠금 파일의 의존성 두 개를 설치했다.
- npm test의 단위·브라우저 통합 테스트 8개가 통과했다.
- doctor가 Chromium, Canvas 2D, WebGL 2, FFmpeg와 FFprobe 실행을 확인했다.
- harbor-v2 예제의 call 프레임을 새 경로에서 렌더했다.
- 가져온 개정본 4개의 파일 해시 검증이 통과했다.
- 가져온 영상 4개가 새 경로의 미디어 서버에서 바이트 범위 요청에 206과 지정한 100바이트를 반환했다.
- 스킬 형식 검증기가 통과했다.

[복사 및 로컬 기록](import.json) · [의존성 설치](npm-ci.log) · [테스트](tests.log) · [환경](doctor.json) · [프레임 렌더](frame.json) · [재생 경로](import-check.json) · [스킬 검증](skill-validator.log)
