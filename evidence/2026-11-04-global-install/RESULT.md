# Cinewright 전역 설치

전역 경로는 `/Users/oozoofrog/.codex/skills/cinewright`다. 개발 저장소 `/Volumes/eyedisk/develop/cinewright`의 `3991bed4c56b822fafa634174c47ffd9739762ec`에서 64개 파일을 복사했다. 스킬, 참조 문서, 실행 코드, 예제, 테스트와 패키지 잠금 파일을 포함했다. `npm ci --omit=dev`로 의존성을 설치했다. 개발 저장소로 연결하는 심볼릭 링크가 아니므로 개발 폴더의 변경을 자동으로 반영하지 않는다.

Counting Star의 이전 `multimedia-direction-toolkit/SKILL.md`를 제거했다. 삭제 전 개발 원본과 전역 설치본의 SHA-256이 모두 같은 것을 확인했다. 이전 경로의 README는 전역 스킬을 가리킨다. 기존 영상·입력·검증 근거와 별도 `counting-star-animation` 스킬은 보존했다.

전역 설치 경로의 64개 파일이 원본과 일치한다. 스킬 형식 검증과 `doctor`의 Chromium, Canvas 2D, WebGL 2, FFmpeg/FFprobe 확인이 통과했다. 개발 폴더 밖의 새 임시 작업 경로에서 전역 CLI로 `init`과 24프레임·1초 MP4 렌더를 실행했다. FFprobe의 프레임 수·길이와 전체 디코드를 확인했다. 전체 회귀 테스트 8개는 앞선 독립 경로 구성 때 통과했으며, 이번 설치에서는 반복하지 않았다.

설치 파일과 실제 실행을 확인했다. 현재 대화의 스킬 목록에 대한 재발견과 다음 요청의 스킬 채택은 아직 관찰하지 않았다.

[설치 파일·해시](installation.json) · [의존성](npm-ci.log) · [형식 검사](skill-validator.log) · [환경](doctor.json) · [출력 기록](render.json) · [검증 영상](smoke.mp4) · [스트림](ffprobe.json) · [디코드](decode.log) · [최종 확인](verification.json)
