// Tiny static file server for previewing the site locally.
//   node tools/serve.mjs [port]        (default port 8080)
//   node tools/serve.mjs 8080 --subpath   serve under /codequest-academy/ like a GitHub Pages project site
// The site is plain static files, so any static server works (for example
// `python3 -m http.server`), but this one sends correct MIME types for .mjs and
// .wasm and never caches, which makes development less confusing.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest, MANIFEST_NAME } from './make-manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || process.env.PORT || 8080);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

// `prefix` imitates a GitHub Pages project site, which lives under /<repository>/ and not at the root:
// createServer(dir, '/codequest-academy/') answers only for addresses that start with the prefix.
export function createServer(rootDir = root, prefix = '') {
  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let rel = decodeURIComponent(url.pathname);
      if (prefix) {
        if (!rel.startsWith(prefix)) { res.writeHead(404, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }).end('Not found (outside ' + prefix + ')'); return; }
        rel = '/' + rel.slice(prefix.length);
      }
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.normalize(path.join(rootDir, rel));
      if (!file.startsWith(rootDir)) { res.writeHead(403).end('Forbidden'); return; }
      // The deploy workflow writes asset-manifest.json (see make-manifest.mjs); locally it is built when asked for.
      if (rel === '/' + MANIFEST_NAME && !fs.existsSync(file)) {
        res.writeHead(200, { 'Content-Type': types['.json'], 'Cache-Control': 'no-store' }).end(JSON.stringify(buildManifest(rootDir)));
        return;
      }
      fs.stat(file, (err, st) => {
        if (err || !st.isFile()) {
          const nf = path.join(rootDir, '404.html');
          res.writeHead(404, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' });
          fs.existsSync(nf) ? fs.createReadStream(nf).pipe(res) : res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
          'Content-Length': st.size,
          'Cache-Control': 'no-store',
        });
        fs.createReadStream(file).pipe(res);
      });
    } catch (e) {
      res.writeHead(500).end(String(e));
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sub = process.argv.find((a) => a.startsWith('--subpath'));
  const prefix = sub ? (sub.split('=')[1] || '/codequest-academy/') : '';
  createServer(root, prefix).listen(port, () => {
    console.log(`CodeQuest Academy is running at http://localhost:${port}${prefix || '/'}`);
  });
}
