import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { browser, ffmpeg, ffprobe } from '../../../scripts/execution.mjs';
import { reviewSite } from '../../../scripts/review.mjs';
import { openRevision, readJSON, writeJSON } from '../../../scripts/revisions.mjs';
import { task4Paths, reserveInspection, recordedCommand, assertStillcutsJob, waitForVideoReady } from './task4-run.mjs';

const paths = task4Paths(process.argv[2]);
const outputsPath = path.join(paths.evidence, 'outputs.json');
const outputs = await readJSON(outputsPath);
await reserveInspection(paths, outputs);
const evidence = paths.inspectionEvidence;
process.env.TMPDIR = outputs.tmpdir;
const record = paths.inspectionRecord;
const receipt = { runId: paths.runId, phase: 'inspecting', outputs: outputsPath,
  store: outputs.store, tmpdir: outputs.tmpdir, record, examples: {},
  limitation: 'Automatic playback and frame comparisons do not establish uninterrupted direct human viewing, listening or creative acceptance. Intentional silence excludes the observe audio-peak gate and authored audio-sync claims.' };
await writeJSON(path.join(evidence, 'receipt.json'), receipt);

async function media(label, executable, args) {
  const result = await recordedCommand(evidence, label, executable, args);
  return result.stdout;
}

let client;
try {
  client = await browser();
  const page = await client.newPage();
  for (const [name, item] of Object.entries(outputs.examples)) {
    const snapshot = await openRevision(outputs.store, item.frozen.revision);
    const work = snapshot.manifest;
    assert.deepEqual([item.size, item.fps, item.frames], [work.size, work.fps, work.frames]);
    const ranges = Object.fromEntries(['frame', 'span', 'full'].map(mode =>
      [mode, assertStillcutsJob(item.commands[mode], snapshot, mode)]));
    const directory = path.join(record, name);
    const decoded = path.join(directory, 'decoded');
    await fs.mkdir(decoded, { recursive: true });
    const summaries = {};
    for (const mode of ['span', 'full']) {
      const job = item.commands[mode];
      const probe = JSON.parse(await media(`${name}-${mode}-probe`, ffprobe,
        ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', job.output]));
      const video = probe.streams.find(stream => stream.codec_type === 'video');
      const audio = probe.streams.find(stream => stream.codec_type === 'audio');
      const timestamps = JSON.parse(await media(`${name}-${mode}-pts`, ffprobe,
        ['-v', 'error', '-select_streams', 'v:0', '-show_frames', '-show_entries',
          'frame=best_effort_timestamp_time', '-of', 'json', job.output])).frames.map(frame => Number(frame.best_effort_timestamp_time));
      const expectedFrames = ranges[mode].frames;
      const maxPTSError = Math.max(...timestamps.map((time, frame) => Math.abs(time - frame / work.fps)));
      assert.equal(video.codec_name, 'h264');
      assert.equal(video.pix_fmt, 'yuv420p');
      assert.deepEqual([video.width, video.height], work.size);
      assert.equal(video.avg_frame_rate, `${work.fps}/1`);
      assert.equal(Number(video.nb_frames), expectedFrames);
      assert.equal(timestamps.length, expectedFrames);
      assert.ok(maxPTSError < 0.000001);
      assert.ok(Math.abs(Number(video.duration) - ranges[mode].seconds) < 0.000001);
      assert.equal(audio.codec_name, 'aac');
      assert.equal(Number(audio.sample_rate), 48000);
      assert.equal(audio.channels, 2);
      assert.ok(Math.abs(Number(audio.duration) - ranges[mode].seconds) < 0.001);
      summaries[mode] = { authoredRange: [ranges[mode].from, ranges[mode].to], codec: video.codec_name, pixelFormat: video.pix_fmt, size: work.size,
        fps: video.avg_frame_rate, frames: timestamps.length, seconds: Number(video.duration),
        firstPTS: timestamps[0], lastPTS: timestamps.at(-1), maxPTSErrorSeconds: maxPTSError,
        audio: { codec: audio.codec_name, rate: Number(audio.sample_rate), channels: audio.channels, duration: Number(audio.duration) } };
    }
    const frames = item.directFull.frames;
    await media(`${name}-decode`, ffmpeg, ['-v', 'error', '-y', '-i', item.commands.full.output,
      '-vf', `select=${frames.map(frame => `eq(n\\,${frame})`).join('+')}`,
      '-fps_mode', 'passthrough', '-start_number', '0', path.join(decoded, '%04d.png')]);
    const comparisons = [];
    const images = [];
    for (const [index, frame] of frames.entries()) {
      const live = path.join(item.liveDirectory, `${String(frame).padStart(4, '0')}.png`);
      const decode = path.join(decoded, `${String(index).padStart(4, '0')}.png`);
      const pair = { live: (await fs.readFile(live)).toString('base64'), decoded: (await fs.readFile(decode)).toString('base64') };
      const metrics = await page.evaluate(async pair => {
        const pixels = await Promise.all(Object.values(pair).map(async data => {
          const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
          const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          const g = canvas.getContext('2d'); g.drawImage(image, 0, 0);
          return g.getImageData(0, 0, canvas.width, canvas.height).data;
        }));
        let absolute = 0, squared = 0, maximum = 0, changed = 0;
        for (let i = 0; i < pixels[0].length; i += 4) {
          let pixelMaximum = 0;
          for (let channel = 0; channel < 3; channel++) {
            const delta = Math.abs(pixels[0][i + channel] - pixels[1][i + channel]);
            absolute += delta; squared += delta * delta; pixelMaximum = Math.max(pixelMaximum, delta);
          }
          maximum = Math.max(maximum, pixelMaximum); if (pixelMaximum > 16) changed++;
        }
        const count = pixels[0].length / 4;
        return { meanAbsoluteRGB: absolute / (count * 3), rmseRGB: Math.sqrt(squared / (count * 3)),
          maximumRGB: maximum, fractionPixelsAbove16: changed / count };
      }, pair);
      assert.ok(metrics.meanAbsoluteRGB < 6, `Unexpected decoded difference at ${name}:${frame}: ${JSON.stringify(metrics)}`);
      comparisons.push({ frame, decodedIndex: index, live, decoded: decode, ...metrics });
      images.push({ frame, ...pair });
    }
    await writeJSON(path.join(directory, 'decode-comparison.json'), comparisons);
    const strips = {};
    for (const [kind, indices] of [['boundary', item.boundaries], ['dense', item.dense]]) {
      strips[kind] = { frames: indices };
      for (const medium of ['live', 'decoded']) {
        const selected = indices.map(frame => images.find(image => image.frame === frame));
        const png = await page.evaluate(async ({ selected, medium, kind, size }) => {
          const columns = kind === 'boundary' ? 4 : 6;
          const width = kind === 'boundary' ? 320 : 160;
          const height = Math.round(width * size[1] / size[0]), label = 22;
          const canvas = document.createElement('canvas');
          canvas.width = columns * width; canvas.height = Math.ceil(selected.length / columns) * (height + label);
          const g = canvas.getContext('2d'); g.fillStyle = '#171a20'; g.fillRect(0, 0, canvas.width, canvas.height);
          g.font = '14px monospace';
          for (const [index, entry] of selected.entries()) {
            const image = new Image(); image.src = `data:image/png;base64,${entry[medium]}`; await image.decode();
            const x = index % columns * width, y = Math.floor(index / columns) * (height + label);
            g.drawImage(image, x, y, width, height);
            g.fillStyle = '#fff'; g.fillText(`${entry.frame}f · ${medium}`, x + 7, y + height + 16);
          }
          return canvas.toDataURL().split(',')[1];
        }, { selected, medium, kind, size: work.size });
        const file = path.join(directory, `${kind}-${medium}.png`);
        await fs.writeFile(file, Buffer.from(png, 'base64'));
        strips[kind][medium] = file;
      }
    }
    const pcmFile = path.join(directory, 'decoded-audio.f32');
    await media(`${name}-silent-audio`, ffmpeg, ['-v', 'error', '-y', '-i', item.commands.full.output,
      '-vn', '-ac', '2', '-ar', '48000', '-f', 'f32le', pcmFile]);
    const pcm = await fs.readFile(pcmFile);
    let peak = 0;
    for (let at = 0; at < pcm.length; at += 4) peak = Math.max(peak, Math.abs(pcm.readFloatLE(at)));
    assert.equal(peak, 0);
    receipt.examples[name] = {
      revision: item.frozen.revision, size: work.size, fps: work.fps, frames: work.frames, authoredRanges: ranges,
      commands: { freeze: item.frozen.command, play: item.commands.play.command,
        frame: item.commands.frame.command, span: item.commands.span.command, full: item.commands.full.command },
      playServer: { pid: item.commands.play.pid, terminated: true, exitCode: item.commands.play.exitCode },
      jobs: Object.fromEntries(['frame', 'span', 'full'].map(mode => [mode,
        { id: item.commands[mode].id, output: item.commands[mode].output, sha256: item.commands[mode].outputSha256,
          settings: item.commands[mode].settings }])),
      point: 'touch', span: 'contact-review', directCli: item.directCli,
      directFull: { equalPNG: item.directFull.equalPNG, frameCount: item.directFull.frames.length,
        frames: 'Union of boundary and dense indices below; per-frame results in comparison.' },
      strips, decodedDirectory: decoded, comparison: path.join(directory, 'decode-comparison.json'),
      decodedSummary: { evaluatedFrames: comparisons.length,
        maximumMeanAbsoluteRGB: Math.max(...comparisons.map(result => result.meanAbsoluteRGB)),
        maximumRMSE: Math.max(...comparisons.map(result => result.rmseRGB)),
        maximumPixelRGBDifference: Math.max(...comparisons.map(result => result.maximumRGB)),
        note: 'Lossy H.264 differences are measured, not required to be pixel-identical.' },
      probe: summaries, silentAudio: { peak, channels: 2, rate: 48000, decodedSamplesPerChannel: pcm.length / 8,
        note: 'AAC decode may retain encoder padding; stream durations are checked separately. No listening or event-sync claim.' },
      livePlayback: { wallMs: item.commands.play.playback.wallMs,
        presentedCount: item.commands.play.playback.presented.length,
        firstPresented: item.commands.play.playback.presented[0], lastPresented: item.commands.play.playback.presented.at(-1),
        finalFrame: item.commands.play.playback.final.frame, playbackRate: item.commands.play.playback.playbackRate,
        canvas: item.commands.play.playback.canvas, display: item.commands.play.playback.display,
        rawObservation: outputsPath },
    };
    await writeJSON(path.join(evidence, 'receipt.json'), receipt);
    console.log(JSON.stringify({ example: name, ...receipt.examples[name].decodedSummary, peak }));
  }
  const site = await reviewSite(outputs.store, Object.values(outputs.examples).map(item => item.commands.full.id), 0);
  try {
    const examples = Object.values(receipt.examples);
    const width = Math.max(...examples.map(item => item.size[0]));
    const height = Math.max(...examples.map(item => item.size[1]));
    const review = await client.newPage({ viewport: { width: Math.max(900, width + 100), height: Math.max(900, height + 300) } });
    await review.goto(site.url);
    await review.waitForFunction(() => document.querySelectorAll('video').length === 2);
    await review.evaluate(sizes => {
      document.getElementById('films').style.gridTemplateColumns = `${Math.max(...sizes.map(size => size[0]))}px`;
      for (const [index, video] of [...document.querySelectorAll('video')].entries()) {
        video.style.width = `${sizes[index][0]}px`; video.style.height = `${sizes[index][1]}px`;
      }
    }, examples.map(item => item.size));
    for (const [index, name] of ['a', 'b'].entries()) {
      const video = review.locator('video').nth(index);
      await video.scrollIntoViewIfNeeded();
      await video.evaluate(waitForVideoReady, { timeoutMs: 15000 });
      const expected = receipt.examples[name];
      const observation = await video.evaluate(async (video, timeoutMs) => {
        video.currentTime = 0; video.muted = false; video.playbackRate = 1;
        const mediaTimes = [];
        let callback;
        const frame = (_, metadata) => { mediaTimes.push(metadata.mediaTime); callback = video.requestVideoFrameCallback(frame); };
        callback = video.requestVideoFrameCallback(frame);
        const started = performance.now();
        const ended = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('MP4 playback timeout')), timeoutMs);
          video.addEventListener('ended', () => { clearTimeout(timeout); resolve(); }, { once: true });
          video.addEventListener('error', () => { clearTimeout(timeout); reject(new Error('MP4 playback error')); }, { once: true });
        });
        await Promise.all([video.play(), ended]); video.cancelVideoFrameCallback(callback);
        const box = video.getBoundingClientRect();
        return { wallMs: performance.now() - started, duration: video.duration, currentTime: video.currentTime,
          ended: video.ended, playbackRate: video.playbackRate, muted: video.muted,
          naturalSize: [video.videoWidth, video.videoHeight], displaySize: [box.width, box.height],
          played: Array.from({ length: video.played.length }, (_, i) => [video.played.start(i), video.played.end(i)]),
          mediaTimes, playbackQuality: video.getVideoPlaybackQuality().toJSON?.() ?? {
            totalVideoFrames: video.getVideoPlaybackQuality().totalVideoFrames,
            droppedVideoFrames: video.getVideoPlaybackQuality().droppedVideoFrames } };
      }, Math.ceil(expected.frames / expected.fps * 1000) + 15000);
      assert.equal(observation.ended, true);
      assert.deepEqual(observation.displaySize, expected.size);
      assert.deepEqual(observation.naturalSize, expected.size);
      assert.equal(observation.playbackRate, 1);
      assert.ok(Math.abs(observation.duration - expected.frames / expected.fps) < 0.001);
      assert.ok(observation.mediaTimes.length > expected.frames / 2);
      const raw = path.join(record, name, 'mp4-playback.json');
      await writeJSON(raw, observation);
      const { mediaTimes, ...summary } = observation;
      receipt.examples[name].mp4Playback = { ...summary, presentedCount: mediaTimes.length,
        firstPresentedTime: mediaTimes[0], lastPresentedTime: mediaTimes.at(-1), rawObservation: raw };
      const screenshot = path.join(record, name, 'mp4-playback-ended.png');
      await video.screenshot({ path: screenshot });
      receipt.examples[name].mp4Playback.screenshot = screenshot;
      await writeJSON(path.join(evidence, 'receipt.json'), receipt);
    }
    await review.close();
  } finally { await site.close(); }
  receipt.phase = 'completed';
  await writeJSON(path.join(evidence, 'receipt.json'), receipt);
} catch (error) {
  receipt.phase = 'failed';
  receipt.error = error.stack ?? String(error);
  await writeJSON(path.join(evidence, 'receipt.json'), receipt);
  throw error;
} finally { await client?.close(); }
