// 편집 원본. build.mjs가 a/b에 source.json과 독립 실행 파일을 생성한다.
export const brief = {
  provenance: '예제 제작자가 정한 가상 의뢰. 실제 사용자 취향·작품 수락 기록이 아니다.',
  request: '집에 돌아와 열쇠를 내려놓는 순간이 좋아요. 하루가 끝났다는 느낌이면 좋겠어요. 지친 걸 과장하지는 않았으면 해요. 손이 열쇠를 탁자에 내려놓고 빠지는 건 보여 주세요.',
  purpose: '열쇠를 놓은 뒤 더 서두르지 않아도 되는 시간을 남긴다.',
  invariants: ['같은 손·열쇠·탁자', '내려놓는 과정', '접촉 뒤 놓기', '손의 퇴장 뒤 정지한 열쇠', '비과장된 톤'],
  audio: '의도한 무음',
};
export const assets = ['room.svg', 'hand-atlas.svg', 'keys.svg'];
const wide = { scale: 1, focus: [320, 180], at: [320, 180] };
const close = { scale: 1.85, focus: [340, 237], at: [320, 206] };
const phase = (view, hand, keys = true, motion = 'rest') => ({ view, hand, keys, motion });
const cut = (name, from, to, artwork, every = 1) => ({ name, from, to, artwork, every });
const common = {
  version: 1, size: [640, 360], fps: 24, background: '#d9d5c8', audio: [],
};
const scene = {
  keyAt: [328, 264], handAt: [328, 235], lowerOffset: [0, -52], exitOffset: [-220, -300],
  loweringSpan: 'lowering', withdrawalSpan: 'withdrawal',
  light: { fromX: 174, toX: 202, opacity: 0.09 },
};
export const examples = {
  a: {
    brief, assets, manifest: { ...common, title: '하루를 내려놓는 자리 · A 빈 자리의 시간', frames: 192 }, scene,
    cutSpec: {
      frames: 192,
      boundaries: [
        { name: 'start', frame: 0 }, { name: 'arrive', frame: 24 }, { name: 'lower', frame: 36 },
        { name: 'touch', frame: 60 }, { name: 'release', frame: 72 }, { name: 'leave', frame: 78 },
        { name: 'quiet', frame: 102 }, { name: 'end', frame: 192 },
      ],
      artworks: {
        emptyRoom: phase(wide, null, false), poised: phase(wide, 'grip', true, 'poised'),
        descending: phase(wide, 'grip', true, 'lower'), contact: phase(wide, 'grip'),
        released: phase(wide, 'open'), withdrawing: phase(wide, 'open', true, 'withdraw'),
        remaining: phase(wide, null),
      },
      cuts: [
        cut('room-hold', 'start', 'arrive', 'emptyRoom', 6),
        cut('poised-hold', 'arrive', 'lower', 'poised', 6),
        cut('lowering', 'lower', 'touch', 'descending', 3),
        cut('contact-hold', 'touch', 'release', 'contact', 6),
        cut('release-hold', 'release', 'leave', 'released', 3),
        cut('withdrawal', 'leave', 'quiet', 'withdrawing', 2),
        cut('room-rest', 'quiet', 'end', 'remaining', 12),
      ],
      spans: [
        { name: 'action', from: 'arrive', to: 'quiet' },
        { name: 'contact-review', from: 'lower', to: 'leave' },
        { name: 'ending', from: 'quiet', to: 'end' },
      ],
    },
  },
  b: {
    brief, assets, manifest: { ...common, title: '하루를 내려놓는 자리 · B 손에서 방으로', frames: 168 }, scene,
    cutSpec: {
      frames: 168,
      boundaries: [
        { name: 'start', frame: 0 }, { name: 'lower', frame: 18 }, { name: 'touch', frame: 48 },
        { name: 'release', frame: 60 }, { name: 'leave', frame: 66 }, { name: 'quiet', frame: 90 },
        { name: 'room', frame: 120 }, { name: 'end', frame: 168 },
      ],
      artworks: {
        poised: phase(close, 'grip', true, 'poised'), descending: phase(close, 'grip', true, 'lower'),
        contact: phase(close, 'grip'), released: phase(close, 'open'),
        withdrawing: phase(close, 'open', true, 'withdraw'), detailRest: phase(close, null),
        remaining: phase(wide, null),
      },
      cuts: [
        cut('poised-hold', 'start', 'lower', 'poised', 6),
        cut('lowering', 'lower', 'touch', 'descending', 3),
        cut('contact-hold', 'touch', 'release', 'contact', 6),
        cut('release-hold', 'release', 'leave', 'released', 3),
        cut('withdrawal', 'leave', 'quiet', 'withdrawing', 2),
        cut('detail-rest', 'quiet', 'room', 'detailRest', 12),
        cut('room-rest', 'room', 'end', 'remaining', 12),
      ],
      spans: [
        { name: 'action', from: 'start', to: 'quiet' },
        { name: 'contact-review', from: 'lower', to: 'leave' },
        { name: 'ending', from: 'quiet', to: 'end' },
      ],
    },
  },
};
