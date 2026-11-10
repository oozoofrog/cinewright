const $ = id => document.getElementById(id);
const entries = [];
try {
  const response = await fetch('/clips.json');
  if (!response.ok) throw new Error('출력 목록을 읽을 수 없습니다.');
  const clips = await response.json();
  for (const clip of clips) {
    const panel = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = `${clip.title} · ${clip.revision.slice(0, 12)} · ${clip.from}–${clip.to - 1}f · ${clip.scale}×`;
    const video = document.createElement('video');
    video.src = clip.url;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', clip.title);
    video.addEventListener('play', () => {
      for (const other of entries) if (other.video !== video) other.video.pause();
    });
    const restart = document.createElement('button');
    restart.textContent = '이 작품을 처음부터 재생';
    restart.onclick = async () => {
      try { video.currentTime = 0; await video.play(); }
      catch (error) { $('status').textContent = String(error); }
    };
    panel.append(caption, video, restart);
    $('films').append(panel);
    entries.push({ video, clip });
  }
  $('compare').disabled = false;
  $('compare').onclick = () => {
    const seconds = $('time').valueAsNumber;
    if (!Number.isFinite(seconds) || seconds < 0) { $('status').textContent = '0 이상의 시각을 입력하세요.'; return; }
    for (const { video, clip } of entries) {
      const frame = Math.floor(seconds * clip.fps);
      if (frame < clip.from || frame >= clip.to || !Number.isFinite(video.duration)) {
        $('status').textContent = `이 시각을 비교할 수 없습니다. ${clip.title}`;
        return;
      }
    }
    for (const { video, clip } of entries) {
      video.pause();
      const frame = Math.floor(seconds * clip.fps);
      video.currentTime = (frame - clip.from + 0.25) / clip.fps;
    }
    $('status').textContent = `${seconds.toFixed(3)}초에 해당하는 각 출력 프레임`;
  };
} catch (error) {
  $('status').textContent = String(error);
}
