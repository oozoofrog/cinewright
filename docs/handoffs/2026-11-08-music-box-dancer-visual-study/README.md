# Music Box Dancer — 시각 개선 샘플 인계

**2026-11-08 KST. 현재 단계: 재개한 개발 완료, 16–28초 샘플의 사용자 검토 대기.** 사용자의 “남은 작업을 T3에 위임” 지시와 구현 sub-agent의 구체적 범위에 따라 직접 구현했다. 재개 허락을 재질문하지 않았다. 추가 하위 에이전트, commit/push/PR/배포, 외부 업로드는 하지 않았다. [이전 중지 기록](../2026-11-07-music-box-dancer-paused/README.md)의 본문은 역사 기록으로 보존했고 현재 인계 링크만 앞에 추가했다.

이번 결과는 **기술적으로 재생·비교 가능한 개선 샘플**이다. 사용자 최종 수락이나 전체 곡의 새 표현 완성을 뜻하지 않는다.

## 바로 검토할 결과

모두 로컬 파일이다. 링크의 왼쪽 A는 기존 종이 무대, 오른쪽은 새 도자기 오르골이다. 동일 원곡16–28초이며 비교 영상에는 오디오를 한 번만 넣었다.

- [새 1080p 샘플 — 12초 MP4](../../../.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/music-box-dancer-porcelain-16-28s-1080p.mp4)
- [전/후 동시 비교 — 왼쪽 기존 A / 오른쪽 새 샘플](../../../.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/before-after-16-28s.mp4)
- [원곡22초 전/후 프레임](../../../.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/before-after-22s.png)
- [새 12장 프레임 시트](../../../.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-contact.png)
- [다리 확장 — 원곡18.958초](../../../.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-18.958s.png) · [회전 — 22초](../../../.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-22s.png) · [마지막 유효 프레임 — 27.958초](../../../.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-27.958s.png)

절대 경로의 공통 생산 폴더 `Q`:

```text
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02
```

주요 절대 경로:

```text
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/music-box-dancer-porcelain-16-28s-1080p.mp4
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/before-after-16-28s.mp4
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/before-after-22s.png
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-contact.png
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-16s.png
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-18.958s.png
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-22s.png
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-26.167s.png
/Volumes/eyedisk/develop/cinewright/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/frames/after-27.958s.png
```

기존 A/B·원본·완곡·revision·이전 증거는 교체하지 않았다.

| 항목 | 실제 값 |
| --- | --- |
| 새 단독 영상 | 1920×1080, H.264 yuv420p, 24fps, 288프레임, 12.000초 |
| 원곡 범위 | source frame **[384,672)** = **[16,28)초** |
| 오디오 | stereo 48kHz AAC, 기존 A와 같은 preview 구간 재인코딩 |
| 새 project | `Q/porcelain-v2/` (전체 오디오는 유지, scene은 해당 구간에만 활성) |
| frozen revision | `ea1485872bfdc95e205dd849bfbe572de151e5832043105ff364a320f5ed023f` |
| 최종 1080p job | `d24bf0e4-d1e4-4da0-a9d0-4f04d23f3338` |
| 540p 초안 job | `6fa3b426-caa6-4bbf-acfa-fcc30d2da9ab` — 같은 revision |
| 최종 MP4 SHA-256 | `a1a58ffc81a714dccbd45700ad621efc946b32c7d934f92e46172c17b4c714e0` |
| 기존 A | `integration-01/store/jobs/11c8e04e-3a0d-4636-a5df-c3779b1ef522/work.mp4` |
| 기존 B | `integration-01/store/jobs/62c2964b-a124-4c49-ac6e-b3a3f55ff8a0/work.mp4` |

## 무엇을 바꿨고 왜 선택했는가

기존22초 대표 프레임을 실제로 열었다. 인물은 단순 원/삼각형 몸체와 굵은 선 팔다리였고, 제한된 자세로 실루엣·부피·동작의 차이를 읽기 어려웠다. 인물을 유지해야 이전 문제에 답했는지 직접 비교할 수 있다고 판단해 **도자기 발레 인형이 있는 입체 오르골**을 선택했다. 추상화나 FX 추가만으로 인물 품질 문제를 우회하지 않았다.

실제 구현은 회전체 몸통, 테이퍼 다리, 어깨·팔꿈치·손의 연결, 세 겹 주름 튀튀, 발끝 축 회전, 팔 펼침/머리 위 동작→다리 확장→회전→재개방이다. 고정 3/4 구도에서 도자기/에나멜/금속 재질과 입체 뚜껑·실린더·빗살, 조명·접촉 그림자로 깊이를 구성했다. 초안 이미지에서 팔이 머리 앞으로 교차하는 부호 오류, 회전 중간마다 속도가 끊기는 문제를 찾아 수정했다.

이미 설치된 **Three.js 0.180.0**의 geometry/material/조명/그림자/AnimationMixer를 실제 호출한다. Cinewright의 기존 `harbor-landfall/instrument.mjs`처럼 WebGL 캔버스를 Canvas2D compositor에 합성한다. Three.js 자체를 품질 보증으로 보지 않으며, **준비된 외부 캐릭터나 mocap을 가져온 것은 아니다.** 조형·동작은 이 샘플을 위해 저작한 절차적 인형이다. 손/얼굴/해부학과 조명의 단순함은 여전히 남는다.

Showreel 설치본의 `engine.js`, `fx.js`, `techniques.md`, `engine.md`, LICENSE를 조사했다. exact-time animation·preserved drawing buffer·시간 함수와 형태 변화로 리듬을 만드는 방식을 참고했다. Showreel 코드는 복사/import하지 않았다. FX의 REEL·DOM/CSS 결합과 seconds timeline을 검토했고, 카탈로그 전체를 완제품 라이브러리로 간주하지 않았다. Three.js는 MIT 고지를 project 및 frozen vendor에 보존했다. 외부 자산/폰트/모델, 원본 영상 프레임·공연자 이미지를 쓰지 않았다.

[자세한 선택·출처·계약 기록](../../../.direction/productions/music-box-dancer-20261106-232634/visual-quality-02/reports/SOURCES.md) · [소스 사용 설명과 공식 문서](../../../examples/music-box-dancer/porcelain/README.md).

## 계약과 이번 실행의 검증

manifest v1, 정수 frame/[from,to), prepare/evaluate/draw, `music.energy` typed channel 읽기, 임의/역순 seek, freeze/local imports를 유지했다. 원본 템포·gain·구조·끝을 변경하지 않았다. 음원 ingest/analyze와 기존 완곡 렌더를 처음부터 반복하지 않았다.

| 검사 | **이번에 실제 실행한 결과** | 증거 (`Q` 기준) |
| --- | --- | --- |
| 전체 회귀 | `npm test` **394/394 통과**, fail/skip/cancel0, 27.52초. 기존392 + 새2. 옛 통과 기록을 재사용하지 않음 | `logs/npm-test.log` |
| 새 동작/동결 회귀 | finite/bounded poses, 각속도 연속성·단조 회전, canonical/audio 보존, 기존 목적지 거부, frozen local Three/LICENSE, mutable scene 삭제 후 pixel 일치, [384,672) 경계 | 위 로그, `.direction/test-runs/porcelain-yEBQ9k/validation.json` |
| 실제 production 탐색 | 1080p **21개 고유 프레임/28번 탐색** 정방향·임의·역순·끝→처음. live player PNG가 offline render PNG와 매번 SHA-256 일치. cue384/loop 선택 유지, page/console 오류0, 외부 요청0 | `reports/seek-validation.json`, `logs/seek-validation.log`, `reports/verify-seek.mjs` |
| 렌더·디코드·PTS | 288프레임 완성, FFmpeg 전체 A/V decode 오류0. 모든 PTS `i/24`, 시작0, 마지막11.958333초, 영상/오디오 각각12.000초 | `reports/media-validation.json`, `logs/media-validation.log`, job `execution.log` |
| 자동 재생 | 실제 MP4 끝까지12초 재생. callback250개, 마지막11.958333초, 오디오 peak0.71356. 첫 callback0.375초로 실시간 표시 누락이 있었으며 모든288프레임을 사람이 본 증거가 아님 | `reports/playback-1080p.json`, `store/review/observe-*/` |
| 오디오 구간·싱크 | PCM source **[768000,1344000)** =576000 stereo frames 정확 일치. whole audio descriptor/음악 파일 전부 동일. A/새1080p/비교의 AAC packet hash 동일, A/새 decoded hash 동일. A/V start0, duration12 | `reports/media-validation.json` |
| 수정된 섬광 검사 | 단독1080p와 좌우 비교 각각 **288프레임** 검사, 둘 다 `screen-negative`, flagged0, maxTransitions0 | `reports/flash-1080p.json`, `reports/flash-comparison.json` |
| 보존 | 원본/기존 완곡/A/B와 시작 시 Git 수정·untracked 파일의 해시 대조. 중지 문서에는 안내문만 추가하고 원문 본문 보존. HEAD/index 불변 | `reports/before.json`, `reports/preservation.json` |

AAC packet hash: `10127bd6896c7f5635a0261797198c15a8c9bc2b28ef614a3789330fbb42e50f`.
A와 새 샘플의 decoded s16 hash: `0d58c1981dac9e24cbce6b3bfdbc2214f80fc28bcb7c20ba5835de56a2461eeb`.

**샘플은 48k preview의 AAC 재인코딩이다. 원본44.1k AAC 패킷 보존본이 아니다.** 기존 `integration-01/music-box-dancer-final-original-aac.mp4`는 수정하지 않았으며 SHA-256도 이전 값 그대로다. 샘플을 만들기 위해 full-song 원본 AAC 보존 계약을 바꾸지 않았다.

초기 새 테스트는 favicon 404를 오류로 잡아1/2 실패했다. fixture에 data favicon을 명시해 해결했고 이후 전체394/394가 통과했다. 실패 로그는 `logs/porcelain-test-initial*.log`에 남겼다. 작업 중 프레임 복사 경로를 source frame 번호로 잘못 지정해 첫 복사가 실패했으며, job의 `frame-from` 인덱스로 고쳐 대표 PNG 다섯 장의 생성을 확인했다. 실패한 작업을 통과 기록으로 바꾸지 않았다. 초기 조형 revision과 540p 초안도 보존했다.

GPU ReadPixels 성능 경고는 있었지만 shader/page/render 오류는 없었다. 같은 머신·브라우저에서의 픽셀 일치이며, GPU/OS 간 bit-exact 보장은 아니다. 섬광 screen-negative는 축소160×90의 제한된 자동 검사이고 인간 접근성 검토/의료·WCAG 인증이 아니다.

## Git 변경과 보존

공유 checkout의 기존 수정25개 파일 및 다른 untracked evidence를 유지했다. 브랜치 main/HEAD `f33ea610613d902cdbc995f08d60f810621a8fc2`. 이번에 추가/수정한 것은 다음뿐이다.

- 새 `examples/music-box-dancer/porcelain/{scene.mjs,choreography.mjs,materialize.mjs,README.md}`
- 새 `tests/porcelain-study.test.mjs`
- 새 `docs/handoffs/2026-11-08-music-box-dancer-visual-study/README.md` (이 문서)
- 기존 `docs/handoffs/2026-11-07-music-box-dancer-paused/README.md` 상단에 최신 상태·인계 링크 추가. 이전 본문은 바꾸지 않음.

`package.json`/lock/runtime/기존 A/B/음악 처리/섬광 검사 코드는 변경하지 않았다. `.direction/` 아래 private 제작자료·원본 미디어는 Git 추가하지 않았다. commit/stage/stash/reset/clean/push/PR 없음. 생산 폴더는 새 `visual-quality-02`이고 기존 integration 폴더를 덮어쓰지 않았다.

## 재실행과 다음 단계

저장소 루트에서:

```sh
Q="$PWD/.direction/productions/music-box-dancer-20261106-232634/visual-quality-02"
open "$Q/music-box-dancer-porcelain-16-28s-1080p.mp4"
open "$Q/before-after-16-28s.mp4"
node scripts/direction.mjs play ea1485872bfdc95e205dd849bfbe572de151e5832043105ff364a320f5ed023f --store "$Q/store"
# 플레이어에서 study.start 또는 porcelain.study 반복 선택
```

필요한 경우에만 같은 revision의 `render --from 384 --to 672`를 실행한다. 완성본이 있으므로 이유 없이 재렌더하지 않는다. `materializeStudy`는 새 디렉터리를 요구한다. `porcelain-v2`의 scene은 이 구간에만 있으므로 전체 곡을 렌더해 새 완곡이라고 부르지 않는다.

사용자가 판단할 것은 새 인물/재질/동작/구도의 선호와 음악적 호흡이다. **직접 청취·인간의 연속 시청·접근성 평가·사용자 수락은 미확인**이다. 모델이 연 표본 이미지와 자동 재생을 그 증거로 대체하지 않았다. 추가 에이전트를 만들지 말라는 범위에 따라 이번 샘플의 독립 검토도 수행하지 않았다.

샘플 피드백 이후에만 전체 곡의 장면 전개, 추가 자세/성부·전환/엔딩, 마지막 분석창 수동 교정, 새 완곡 렌더·원본 AAC remux·전체 검사로 확장한다. **지금 부모에게 인계하는 완료 범위는 짧은 검토용 샘플까지**다.
