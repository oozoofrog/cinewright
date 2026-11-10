# Music Box Dancer: 기술·조형·인체 움직임 참고자료

2026-11-09 KST. **핵심 자료 24건 수집 / Astra 원문 8건 표본 대조 완료 / 작은 비교시험은 미실행.** 기술 8건, 예술 7건, 인체·무용 7건, 동작 데이터 2건이다. 같은 자료군의 버전·사용조건·노출 설명 보조페이지는 중복 집계하지 않았다.

이 자료집은 1080p·24fps·384프레임의 [16초 개발본](../../../.direction/productions/music-box-dancer-redesign-20261108/intro-16/handoff.md)에 관한 후속 연구다. 구현·영상·자산·모델·도구 설치를 변경하지 않았다. [상세 메모](research-notes.md)에는 출처별 요약·작품 적용·검증방법·한계를, [출처장부](sources.json)에는 정확한 제목·저자·URL·열람 범위·사용조건을 기록했다.

## 지금 작품에 필요한 발견

1. **귀환 팔은 관절 좌표와 화면 형태를 함께 봐야 한다.** IK는 chain의 관절 회전을 계산하고, skinning/포즈별 보정은 표면 형태를 다룬다. 같은 손끝 조건에서도 팔꿈치의 위치·전완 호·손 방향·가림은 다른 그림을 만든다. f342–349의 각짐을 새 solver의 필요성으로 바로 해석하기보다 중간 포즈 두 안을 비교할 근거다. 이는 도구 설명과 논문을 작품에 연결한 추론이다. [T01: Autodesk IK](https://help.autodesk.com/cloudhelp/2022/ENU/Maya-CharacterAnimation/files/GUID-07C3BA47-32BB-477B-B6C5-1090E5C9B81C.htm), [T02: Lewis 등, 2000](https://scribblethink.org/Work/PSD/PSD.pdf)
2. **곡선이 매끈해도 동작이 잘 읽힌다는 보장은 없다.** 실제 화면의 부위별 간격과 호, 무엇을 언제 읽게 하는지 확인해야 한다. 동일 이징으로 모든 부위를 동시에 출발·정지시키면 머리·흉곽·손·천의 역할이 희미해질 수 있다. [A02: Kevin Koch](https://www.animationmentor.com/blog/slow-in-and-slow-out-the-12-basic-principles-of-animation/), [A03: Drew Adams](https://www.animationmentor.com/blog/follow-through-and-overlapping-action-the-12-basic-principles-of-animation/)
3. **발 고정은 접촉 증거이고, 체중 수용은 별도 판단이다.** 무용 실험은 COM과 COP를 3D 표지·힘판으로 구분했다. 현재 2D 발 코어나 치마 중심을 실제 COM·압력으로 부를 수 없다. 오르골 지지축의 외력까지 있어 인간의 자유 지지 모델을 그대로 강제할 수도 없다. [B01: MIT](https://underactuated.mit.edu/humanoids.html), [B02: Lin 등, 2019](https://www.frontiersin.org/journals/bioengineering-and-biotechnology/articles/10.3389/fbioe.2019.00290/full)
4. **port de bras의 참고 대상은 팔만이 아니다.** ABT는 몸·머리·어깨와 팔의 관계를 설명하고, IADMS는 견갑·쇄골·상완과 몸통·골반의 통합을 다룬다. 인간의 양식을 참고하되, 절제된 오르골 조형을 과도한 흔들림으로 바꿀 이유는 없다. [B05: ABT](https://www.abt.org/explore/learn/ballet-dictionary/), [B06: IADMS](https://iadms.azurewebsites.net/media/5785/iadms-resource-paper-shoulder-complex.pdf)
5. **천의 풍부함은 주름 수나 흔들림 크기만으로 생기지 않는다.** 재질·부착점·구동 동작에 맞는 후행, 앞·옆·밑면의 일관된 겹침부터 검토할 수 있다. 물리 천은 질량·mesh·힘·제약·적분을 요구하며, 현재 저작한 후행 면과 구별해야 한다. [A03](https://www.animationmentor.com/blog/follow-through-and-overlapping-action-the-12-basic-principles-of-animation/), [T04: Baraff·Witkin, 1998](https://www.cs.cmu.edu/~baraff/papers/sig98.pdf)
6. **음악 분석과 직접 청취는 다른 증거다.** RAD는 박에 맞는 timing과 프레이징·강약·분위기에 반응하는 음악성을 구분한다. 동작의 시작·정점·정착이 매 박과 일치해야 한다는 결론은 나오지 않는다. 현재 개발본의 원속도 음악적 호흡은 여전히 미검증이다. [A06: RAD, 인쇄 167쪽](https://assets.royalacademyofdance.org/wp-content/uploads/2025/06/RAD-Specifications-012025_9.pdf#page=167), [A07: Dancing Notes](https://balanchine.org/dancing-notes/)

## 꼭 읽을 여섯 자료

| 순서 | 자료 | 읽을 부분과 지금의 용도 |
|---|---|---|
| 1 | [A02 · Slow In and Slow Out](https://www.animationmentor.com/blog/slow-in-and-slow-out-the-12-basic-principles-of-animation/) | 화면 속 spacing, timing과의 차이. 14.25–14.55초 팔 귀환의 첫 진단. |
| 2 | [A04 · Anthony Wong 포즈 강의의 공식 글](https://www.animationmentor.com/blog/tutorial-building-appealing-character-poses-for-animation/) | 실루엣·action line·negative space·손과 얼굴의 초점. 영상 전체는 이번에 보지 않았다. |
| 3 | [B05 · ABT Ballet Dictionary](https://www.abt.org/explore/learn/ballet-dictionary/) | port de bras, épaulement, fondu. 무용의 양식적 언어를 분명하게 하기. |
| 4 | [B06 · IADMS Shoulder Complex](https://iadms.azurewebsites.net/media/5785/iadms-resource-paper-shoulder-complex.pdf) | PDF 3–8, 18, 20–22쪽. 어깨를 한 점 힌지로 보지 않기. 신체 연습은 이 연구 범위가 아니다. |
| 5 | [T02 · Pose Space Deformation](https://scribblethink.org/Work/PSD/PSD.pdf) | PDF 2–3쪽 §2.3, 5–6쪽 §4. 관절·표면·저작 보정의 책임 구분. |
| 6 | [B02 · 발레 회전의 균형 실험](https://www.frontiersin.org/journals/bioengineering-and-biotechnology/articles/10.3389/fbioe.2019.00290/full) | Methods, Ending Phase, Limitations. 접촉 좌표와 체중·균형 측정의 차이. |

분야별 보충은 상세 메모의 **T01–T08**(제작법·시간·합성), **A01–A07**(시선·조형·음악), **B01–B07**(균형·어깨·손·하지)에서 고른다. 데이터는 **D01 CMU / D02 AMASS** 두 후보만 다룬다. CMU 원본 정책을 AMASS 변환본이나 body model 파일에 적용하면 안 된다.

## 작은 후속시험 다섯 가지 — 모두 미실행

아래 변경안은 연구 제안이며 구현 승인·실행·개선 검증을 뜻하지 않는다. 비교할 때 현재 개발본을 기준으로 보존하고, 수정한 하나의 변수와 손실된 단서도 함께 기록한다.

| 시험 | 필요한 자료·기술 | 관찰할 성공 / 실패 |
|---|---|---|
| **1. 14.25–14.55초 팔·손 두 안** | f330–372 원본, A 원화, A02/A04/B05. 기존 키·윤곽·방향은행으로 팔꿈치 경로와 손 방향의 중간 포즈를 두 안으로 설계. 원래 길이는 유지. | 성공: 1배속에서 귀환이 한 몸짓으로 읽히고 f342–349의 각이 불필요한 주목을 끌지 않음. 실패: 팔 호만 둥글고 손이 튀거나, 머리/몸통과 접선·가림 반전이 생김. 손목뿐 아니라 팔꿈치·손끝의 프레임 간 간격도 비교. |
| **2. 접촉 코어를 유지한 지지측 포즈** | f300–338, B01/B02/B06. 기존 접촉 제약을 유지하며 골반–흉곽 상대 기울기·지지 무릎/발목의 화면 형태만 작은 범위로 비교. | 성공: 13.33초 재접촉 뒤 몸이 받아지는 순서가 읽힘. 실패: 고정발 위에서 몸만 출렁이거나 다리 길이·겹침이 바뀜. 이 판정은 지각되는 무게이며 실제 COM/COP 인증이 아님. |
| **3. 치마 면·후행 두 안** | f240–281 또는 f330–372, A 원화, A03/T04/T07. 허리 부착과 주름 대응을 유지한 채 큰 주름군·밑면·후행 정착 순서를 저작. | 성공: 바깥 윤곽과 내부 면이 같은 천으로 움직이며 허리 고정과 밑단 정착이 함께 읽힘. 실패: 주름이 떠다니거나 면이 교체·반전되고 몸보다 큰 독립 진동을 보임. 물리 시뮬레이션이라고 부르지 않음. |
| **4. 원속도 음악 시청 기록** | 기존 최종 MP4, 원곡 [0,16), A06/A07. 같은 기기·음량에서 1배속 전체를 먼저 보고 들은 뒤, 무음·음성 포함 구간을 나누어 관찰시각을 기록. | 성공: 시작·열림·정착·hold가 어떤 청취 사건과 연결되는지 구체적인 시각으로 설명 가능. 실패: 파형/예상 박만 근거로 삼거나 반복 재생으로 익숙해진 것을 개선으로 오인. 특히 5.75–10.5 / 10.5–13.9 / 13.75–15.5 / 15.5–16초를 기록. |
| **5. 손·얼굴·천 경계와 노출 점검** | 같은 revision의 PNG·MP4 디코드 표본, T03/T05/T06/T07. 원해상도·납품 크기와 밝고 어두운 바탕에서 합성 경계 확인; 방향은행 전환 전후 및 정/역 seek 표본을 비교. | 성공: 형태·선폭·색·표면에 붙은 디테일이 안정되고 의도한 hold가 유지됨. 실패: alpha 테두리·색 변환 오류·aliasing·전환 팝·시간 이력에 따른 차이. 24fps 전체를 일괄 twos로 바꾸지 않음. |

## 열람·검증의 경계

- 작품 문서 네 건, A 원화, 최종 대표 포즈 시트와 f346 전신을 직접 열었다. 전 프레임·원속도 영상·음악을 직접 감상한 연구는 아니다.
- 기술은 공식 문서와 원저자 논문, 예술은 공식 제작·전문교육 자료, 인체는 실험 논문과 교육자료를 구별했다. 예술적 선택은 출처가 보증하는 효과로 쓰지 않았다.
- Blender 공식 매뉴얼은 검색했으나 원문 접근이 402/403으로 실패했다. 읽은 자료 수에 넣지 않았다. Toon Boom 일부 페이지는 웹 도구 오류 후 동일 공식 HTML을 직접 열어 확인했다.
- 유료 책 본문, 연결 강의·무용 영상 전체, AMASS 논문 전문·body model별 약관은 열람하지 않았다. 데이터 다운로드·가입·구매·외부 업로드는 하지 않았다.
- 24개 ID와 본문 링크·장부 URL을 대조했다. Astra는 T02/T08/A02/A06/B02/B03/B05/D02의 원문과 핵심 주장을 별도로 대조했다. B02의 단일지지 대체 지표 설명은 원문에 맞게 구체화했다. A04/B06은 부모 검증 시 타임아웃/접근 오류가 나 수집 담당의 열람 기록만 유지했다. 나머지 출처를 부모가 전수 재검증한 것은 아니다. [검증 기록](source-verification.md). 실제 시험은 미실행이다.

## 후속 구현

연구 이후 승인된 첫 구현과 실제 검증은 [구현 인계](../../../.direction/productions/music-box-dancer-redesign-20261108/intro-16/craft-implementation-handoff.md)에 기록했다. 위 연구 시점의 미실행 표시는 당시 상태다. 공용 API는 [포즈 트랙](../../../references/pose-tracks.md)을 참조한다.
