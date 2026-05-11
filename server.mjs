import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { createServer } from 'node:http';

const root = resolve('.');
const port = Number(process.env.PORT || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

const safePath = (urlPath) => {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const clean = normalize(decoded === '/' ? '/index.html' : decoded).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, clean);
  return file.startsWith(root) ? file : join(root, 'index.html');
};

createServer((req, res) => {
  const file = safePath(req.url || '/');
  let stat;

  try {
    stat = statSync(file);
  } catch (_) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const type = types[extname(file)] || 'application/octet-stream';
  const range = req.headers.range;
  const isHeroScrubAsset = file.includes(`${sep}media${sep}hero-frames${sep}`) && extname(file) === '.webp';
  const cacheControl = isHeroScrubAsset ? 'public, max-age=3600' : 'no-store';

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match && match[1] ? Number(match[1]) : 0;
    const end = match && match[2] ? Number(match[2]) : stat.size - 1;

    if (!match || start >= stat.size || end >= stat.size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      res.end();
      return;
    }

    res.writeHead(206, {
      'Accept-Ranges': 'bytes',
      'Cache-Control': cacheControl,
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Content-Length': end - start + 1,
      'Content-Type': type,
    });
    createReadStream(file, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    'Accept-Ranges': 'bytes',
    'Cache-Control': cacheControl,
    'Content-Length': stat.size,
    'Content-Type': type,
  });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Serving http://127.0.0.1:${port}`);
});
