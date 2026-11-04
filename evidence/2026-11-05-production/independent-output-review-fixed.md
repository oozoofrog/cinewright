# Cinewright 예제 A·B 접촉 수정 재검토

**A와 B 모두 해결됨(ADDRESSED).** 수정본의 640×360 디코드 프레임에서 손가락이 열리기 전에 열쇠가 상판에 닿아 보인다. 손이 빠진 뒤에도 열쇠가 같은 자리에 남으며, B에서는 하드 컷 전후에 접점이 이어진다. 접촉 수정과 관련해 확인한 프레임에서 새 필수 결함은 발견하지 않았다. [가상 의뢰](output-review-brief.md) · [1차 독립 검토](independent-output-review.md)

| 안 | 검토한 수정본 | 판정 |
| --- | --- | --- |
| A · 192프레임, 8초 | `f1d51eaa10567cba25eb1787fa5e65d8776f4da185c1c2bd4e290a0a658abc04` · [MP4](../../.direction/production/jobs/b030aad5-33a8-4a71-9977-994c046e3b50/work.mp4) | ADDRESSED |
| B · 168프레임, 7초 | `4355e5ec4829e994785e96c7788387d0a61f44dd43d2aa566cb3124cdd86fac0` · [MP4](../../.direction/production/jobs/c5d57e2c-0459-4def-a8c2-b8f49ea5748c/work.mp4) | ADDRESSED |

## 구간별 판정

| 안 | 유지 구간 | 화면에서 확인한 내용 |
| --- | --- | --- |
| A | 하강과 접촉 f50–71 (2.08–2.96초) | f50에서 열쇠 밑에 간격이 보인다. f54와 f57에서 그 간격이 줄어든다. f60과 f71에는 손가락이 닫혀 있고, 고리 하단과 큰 열쇠의 톱니 하단이 상판의 어두운 접점에 이어진다. [f50](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0021.png) · [f54](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0025.png) · [f57](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0028.png) · [f60](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0031.png) · [f71](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0042.png) |
| A | 손가락 열기와 퇴장 f72–94 (3.00–3.92초) | f72에 손가락이 벌어진다. f82에는 손끝이 고리에서 떨어져 위로 올라가고 f94에는 손이 프레임 밖으로 나간다. 열쇠와 접점의 위치가 유지된다. [f72](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0043.png) · [f82](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0053.png) · [f94](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0065.png) |
| A | 넓은 구도의 정지 f94–191 (3.92초부터 8.00초 종료까지) | f94와 마지막 f191에서 고리와 큰 열쇠가 같은 자리에 있고 하단이 상판과 이어진다. [f94](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0065.png) · [f191](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decoded/0076.png) |
| B | 하강과 접촉 f39–59 (1.63–2.46초) | f39에는 열쇠 아래의 간격이 남는다. f42와 f45에서 간격이 줄고 f48과 f59에서는 닫힌 손가락 아래에서 고리와 큰 열쇠의 톱니 하단이 그림자에 닿는다. 1차 검토에서 지적한 상판색 띠가 접점에서 끊긴다. [f39](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0025.png) · [f42](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0028.png) · [f45](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0031.png) · [f48](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0034.png) · [f59](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0045.png) |
| B | 손가락 열기, 퇴장, 근접 정지 f60–119 (2.50–4.96초) | f60에 손가락이 벌어진다. f70에 손끝이 고리에서 떨어져 있고 f76에는 손이 보이지 않는다. 열쇠는 f119까지 같은 위치와 방향을 유지한다. [f60](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0046.png) · [f70](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0056.png) · [f76](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0062.png) · [f119](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0079.png) |
| B | 하드 컷과 넓은 구도의 정지 f119→120 (4.96→5.00초), f120–167 | 컷 뒤 열쇠가 작아져도 고리와 두 열쇠의 방향, 탁자 경계와의 배치가 이어진다. f120과 f167에서 열쇠 하단이 상판의 어두운 접점에 이어진다. [f119](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0079.png) · [f120](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0080.png) · [f167](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decoded/0082.png) |

남은 확인 지점은 **A f54–60의 짧은 접촉 전환**이다. 넓은 구도에서는 열쇠가 작고 접점의 색이 탁자 경계와 비슷하다. 640×360 정지 화면에서 접점은 확인했다. 1배속에서 첫 시청자가 f72의 손가락 열기 전에 그 접점을 알아보는지는 미확인이다. 연속 시청에서 같은 순서로 읽히는지 확인한다.

## 증거와 확인 범위

- 수정본의 경계 띠와 A f34–104, B f16–92의 동작 띠를 직접 봤다. 표에는 별도로 확인한 640×360 PNG를 링크했다. 프레임 번호는 0부터 시작한다. PNG 파일명은 추출 순번이므로 대응표로 시간축 프레임을 확인했다. [A 경계](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/boundary-decoded.png) · [A 동작](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/dense-decoded.png) · [A 대응표](../../.direction/production/task-4-runs/contact-fix-1/inspection/a/decode-comparison.json) · [B 경계](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/boundary-decoded.png) · [B 동작](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/dense-decoded.png) · [B 대응표](../../.direction/production/task-4-runs/contact-fix-1/inspection/b/decode-comparison.json)
- 기록상 두 안은 640×360, 24fps다. 640×360에서 1배속 자동 재생은 끝까지 도달했다. 브라우저는 A 1프레임, B 0프레임 드롭을 보고했다. 두 안은 의도된 무음이며 디코드 PCM 피크는 0이었다. [수정본 기술 기록](task-4/runs/contact-fix-1/inspection/receipt.json)
- 검토자는 MP4 영상 스트림을 연속 시청하거나 오디오를 직접 청취하지 않았다. 이번 판정은 기존 접촉 결함과 그 수정에 따른 화면 변화에 한정한다. 실제 관객 반응과 사용자 수락은 별도다.
