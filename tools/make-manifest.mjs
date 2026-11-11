// Writes asset-manifest.json: the list of every file the site needs. The "Save for offline use" button on the
// Help page reads it and asks the service worker (sw.js) to keep all of these files on the learner's device.
//
//   node tools/make-manifest.mjs <folder>     writes <folder>/asset-manifest.json
//
// The deploy workflow (.github/workflows/pages.yml) runs this on the assembled site, so the list is always
// complete and never needs to be edited by hand. The local server (tools/serve.mjs) builds the same list on
// the fly, so the button also works while you develop. Do not commit the file (it is in .gitignore).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** What the site is made of. This is the list the deploy workflow copies, minus the files the browser fetches by itself. */
export const SHIPPED = ['index.html', 'manifest.webmanifest', 'css', 'js', 'content', 'vendor', 'fonts', 'icons', 'games'];
export const MANIFEST_NAME = 'asset-manifest.json';

/** { version, bytes, files: [{ path, size }] } for the site in `dir`, in a stable order. */
export function buildManifest(dir) {
  const files = [];
  const hash = crypto.createHash('sha1');
  const walk = (rel) => {
    const abs = path.join(dir, rel);
    const st = fs.statSync(abs, { throwIfNoEntry: false });
    if (!st) return;
    if (st.isDirectory()) {
      for (const name of fs.readdirSync(abs).sort()) if (!name.startsWith('.')) walk(`${rel}/${name}`);
      return;
    }
    files.push({ path: rel, size: st.size });
    hash.update(rel + '\0');
    hash.update(fs.readFileSync(abs));
  };
  for (const entry of SHIPPED) walk(entry);
  return { version: hash.digest('hex').slice(0, 10), bytes: files.reduce((n, f) => n + f.size, 0), files };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = path.resolve(process.argv[2] || '.');
  if (!fs.existsSync(path.join(dir, 'index.html'))) {
    console.error(`${dir} does not look like the site (no index.html).`);
    process.exit(1);
  }
  const manifest = buildManifest(dir);
  fs.writeFileSync(path.join(dir, MANIFEST_NAME), JSON.stringify(manifest) + '\n');
  console.log(`${MANIFEST_NAME}: ${manifest.files.length} files, ${(manifest.bytes / 1048576).toFixed(1)} MB, version ${manifest.version}`);
}
