import { open } from './compositor.mjs';
const $ = id => document.getElementById(id);
const canvas = $('picture');
const sound = $('sound');
const params = new URLSearchParams(location.search);
function fail(error) {
  window.failure = String(error);
  $('error').hidden = false;
  $('error').textContent = window.failure;
  $('play').disabled = true;
  sound.pause();
}
try {
  const { manifest, draw } = await open(canvas, Number(params.get('scale') ?? 1));
  const { fps, frames, spans = {}, points = {}, title } = manifest;
  $('title').textContent = title;
  $('revision').textContent = `개정 ${await (await fetch('/revision')).text()} · ${fps} fps · ${frames} 프레임`;
  $('scrub').max = frames - 1;
  const state = { frame: -1, playing: false, raf: 0, loop: null, last: null };
  sound.muted = params.get('muted') === '1';
  $('mute').checked = sound.muted;
  $('mute').onchange = () => { sound.muted = $('mute').checked; };

  function show(frame) {
    const result = draw(frame);
    state.frame = frame;
    state.last = result;
    $('scrub').value = frame;
    $('position').textContent = `${frame} / ${frames - 1} · ${(frame / fps).toFixed(3)}초`;
    return result;
  }

  let playRequest = 0;
  function pause() {
    playRequest++;
    state.playing = false;
    sound.pause();
    cancelAnimationFrame(state.raf);
    $('play').textContent = '재생';
  }
  function seek(frame) {
    pause();
    const result = show(frame);
    sound.currentTime = frame / fps;
    return result;
  }
  function tick() {
    if (!state.playing) return;
    try {
      const frame = Math.floor(sound.currentTime * fps);
      if (state.loop && frame >= state.loop[1]) {
        sound.currentTime = state.loop[0] / fps;
        show(state.loop[0]);
      } else if (sound.ended || frame >= frames) {
        show(frames - 1);
        pause();
        return;
      } else if (frame !== state.frame && !sound.seeking) {
        const next = Math.min(frames - 1, frame);
        show(next);
        window.dispatchEvent(new CustomEvent('directionframe', { detail: state.last }));
      }
      state.raf = requestAnimationFrame(tick);
    } catch (error) {
      pause();
      fail(error);
    }
  }
  sound.addEventListener('ended', () => {
    if (state.playing && state.loop) {
      sound.currentTime = state.loop[0] / fps;
      sound.play().catch(fail);
    }
  });
  sound.addEventListener('error', () => fail(new Error('배치한 오디오를 재생할 수 없습니다.')));
  async function play() {
    if (state.playing) return;
    if (state.loop && (state.frame < state.loop[0] || state.frame >= state.loop[1])) seek(state.loop[0]);
    else if (state.frame === frames - 1) seek(0);
    const request = ++playRequest;
    sound.currentTime = state.frame / fps;
    try { await sound.play(); } catch (error) { if (request === playRequest) throw error; }
    if (request !== playRequest) return;
    state.playing = true;
    $('play').textContent = '일시 정지';
    state.raf = requestAnimationFrame(tick);
  }
  for (const [name, frame] of Object.entries(points)) $('jump').add(new Option(name, frame));
  for (const [name, [start]] of Object.entries(spans)) {
    $('jump').add(new Option(name, start));
    $('loop').add(new Option(name, name));
  }
  $('play').onclick = () => { if (state.playing) pause(); else play().catch(fail); };
  const go = frame => { try { seek(frame); } catch (error) { fail(error); } };
  $('scrub').oninput = () => go(Number($('scrub').value));
  $('jump').onchange = () => { if ($('jump').value !== '') go(Number($('jump').value)); };
  $('loop').onchange = () => {
    state.loop = spans[$('loop').value] ?? null;
    if (state.loop) go(state.loop[0]);
  };
  window.direction = { manifest, seek, play, pause, status: () => ({ ...state, audio: sound.currentTime }) };
  show(0);
  $('play').disabled = false;
} catch (error) {
  fail(error);
}
