import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { host } from '../../scripts/server.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const files = new Map();
const folder = 'outputs/harbor-v2';
for (const file of await fs.readdir(path.join(root, folder))) {
  files.set('/' + folder + '/' + file, path.join(root, folder, file));
}
files.set('/outputs/harbor-v2/', path.join(root, folder, 'index.html'));
files.set('/outputs/harbor-landfall.mp4', path.join(root, 'outputs/harbor-landfall.mp4'));
for (const file of ['README.md', 'evidence/2026-11-04-harbor-v2/REVIEW.md', 'evidence/2026-11-04-harbor-v2/STYLE-STORY.md']) {
  files.set('/' + file, path.join(root, file));
}
const site = await host({ files, port: Number(process.argv[2] ?? 8198) });
console.log(JSON.stringify({ url: site.url + '/outputs/harbor-v2/' }));
process.once('SIGINT', async () => { await site.close(); process.exit(0); });
process.once('SIGTERM', async () => { await site.close(); process.exit(0); });
