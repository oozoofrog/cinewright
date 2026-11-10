import fs from 'node:fs/promises';
import path from 'node:path';
import { browser } from './execution.mjs';
import { writeJSON } from './revisions.mjs';
import { reviewSite } from './review.mjs';

export async function observe(store, id, signal) {
  const site = await reviewSite(store, [id], 0);
  const dir = await fs.mkdtemp(path.join(store, 'review', 'observe-'));
  let client;
  const close = () => client?.close().catch(() => {});
  try {
    client = await browser();
    signal?.addEventListener('abort', close, { once: true });
    signal?.throwIfAborted();
    const page = await client.newPage({ viewport: { width: 980, height: 720 } });
    await page.goto(site.url);
    await page.locator('video').waitFor();
    const result = await page.evaluate(async () => {
      const video = document.querySelector('video');
      if (video.readyState < 2) await new Promise((resolve, reject) => {
        video.addEventListener('loadeddata', resolve, { once: true });
        video.addEventListener('error', () => reject(new Error('Video decode failed')), { once: true });
      });
      const context = new AudioContext();
      const audio = context.createMediaElementSource(video);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      const silent = context.createGain();
      silent.gain.value = 0;
      audio.connect(analyser).connect(silent).connect(context.destination);
      await context.resume();
      const { duration, videoWidth, videoHeight } = video;
      const picture = new OffscreenCanvas(Math.min(480, videoWidth), Math.round(Math.min(480, videoWidth) * videoHeight / videoWidth));
      const ctx = picture.getContext('2d');
      const bins = new Float32Array(analyser.fftSize);
      const periods = [];
      const samples = [];
      const targets = Array.from({ length: 12 }, (_, i) => i * duration / 12);
      let next = 0;
      let since = 0;
      let audioPeak = 0;
      let frameCount = 0;
      let firstFrame = null;
      let lastFrame = null;
      let pending;
      const started = performance.now();
      const playback = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Playback timeout')), duration * 1000 + 10000);
        video.addEventListener('ended', () => { clearTimeout(timer); resolve(); }, { once: true });
        video.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Playback error')); }, { once: true });
      });
      function capture(_now, { mediaTime }) {
        firstFrame ??= mediaTime;
        lastFrame = mediaTime;
        frameCount++;
        analyser.getFloatTimeDomainData(bins);
        let peak = 0;
        for (const sample of bins) peak = Math.max(peak, Math.abs(sample));
        audioPeak = Math.max(audioPeak, peak);
        since = Math.max(since, peak);
        if (mediaTime + 0.001 >= targets[next]) {
          const requested = targets[next];
          while (mediaTime + 0.001 >= targets[next]) next++;
          periods.push({ requestedSeconds: requested, seconds: mediaTime, audioPeakSincePrevious: since });
          since = 0;
          ctx.drawImage(video, 0, 0, picture.width, picture.height);
          samples.push(picture.convertToBlob({ type: 'image/jpeg', quality: 0.84 }).then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(reader.error);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          })));
        }
        if (!video.ended) pending = video.requestVideoFrameCallback(capture);
      }
      pending = video.requestVideoFrameCallback(capture);
      await video.play();
      await playback;
      video.cancelVideoFrameCallback(pending);
      await context.close();
      return { duration, frameCount, firstFrame, lastFrame, audioPeak, periods, samples: await Promise.all(samples), wallSeconds: (performance.now() - started) / 1000 };
    });
    const { samples, ...stats } = result;
    await Promise.all(samples.map((image, index) => fs.writeFile(path.join(dir, `sample-${String(index).padStart(2, '0')}.jpg`), Buffer.from(image, 'base64'))));
    const record = { id, ...stats, sampleDirectory: dir };
    await writeJSON(path.join(dir, 'playback.json'), record);
    if (stats.audioPeak < 0.005 || stats.lastFrame < stats.duration - 0.2 || stats.frameCount < 4) {
      throw new Error(`Playback ended without expected picture/audio evidence: ${dir}`);
    }
    return record;
  } finally {
    signal?.removeEventListener('abort', close);
    await close();
    await site.close();
  }
}
