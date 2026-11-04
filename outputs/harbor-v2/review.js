
const videos = Array.from(document.querySelectorAll('video'));
for (const video of videos) video.addEventListener('play', () => {
  for (const other of videos) if (other !== video) other.pause();
});
for (const button of document.querySelectorAll('[data-at]')) button.addEventListener('click', () => {
  const video = document.getElementById('new');
  video.pause();
  video.currentTime = Number(button.dataset.at);
});
document.querySelector('[data-at="0"]').addEventListener('click', () => {
  document.getElementById('new').play().catch(() => {});
});
