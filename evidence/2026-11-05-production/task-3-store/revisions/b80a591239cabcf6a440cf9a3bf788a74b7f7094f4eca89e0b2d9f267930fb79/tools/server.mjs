import http from 'node:http';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const mime = {
  '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.html': 'text/html', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.wav': 'audio/wav', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary',
};

export async function host({ snapshot, audio, files = new Map(), port = 0 }) {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self'; worker-src 'self' blob:");
    try {
      const route = new URL(req.url, 'http://127.0.0.1').pathname;
      if (snapshot && route === '/revision') return res.end(snapshot.revision);
      const relative = route === '/' ? 'runtime/index.html' : route.slice(1);
      const file = files.get(route) ?? (route === '/audio.wav' ? audio : null) ??
        (snapshot?.paths.has(relative) && !relative.startsWith('tools/') ? path.join(snapshot.root, relative) : null);
      if (!file || !['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const { size } = await fs.stat(file);
      const type = mime[path.extname(file)] ?? 'application/octet-stream';
      const range = req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
      let start = 0;
      let end = size - 1;
      if (range) {
        if (range[1]) {
          start = Number(range[1]);
          if (range[2]) end = Math.min(end, Number(range[2]));
        } else if (range[2]) {
          start = Math.max(0, size - Number(range[2]));
        }
        if (start > end || start >= size) {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` });
          return res.end();
        }
        res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
      }
      res.writeHead(range ? 206 : 200, {
        'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': Math.max(0, end - start + 1),
      });
      if (req.method === 'HEAD' || !size) return res.end();
      const stream = createReadStream(file, { start, end });
      stream.on('error', error => res.destroy(error));
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      if (res.headersSent) res.destroy(error);
      else { res.writeHead(500); res.end('Read failed'); }
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }),
  };
}
