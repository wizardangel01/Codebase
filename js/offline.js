// "Save for offline use": keeps every file of the site on the learner's device, so the whole course works
// without internet. The service worker (sw.js) does the downloading and caching; this module gives it the
// list of files and reports how far it got.
//
// The list is asset-manifest.json. The deploy workflow writes it (tools/make-manifest.mjs) and the local
// server builds it on request. When it is missing (a copy of the site that was not built that way) the
// feature says so and everything else works as before.

const MANIFEST = 'asset-manifest.json';

export const offlineSupported = () => 'serviceWorker' in navigator && 'caches' in window && window.isSecureContext !== false;

/** The address of a site file, whatever folder the site lives in (a GitHub Pages project is not at the root). */
const abs = (p) => new URL(p, document.baseURI).href;

/** { version, bytes, files: [{ path, size }] }, or throws when this copy of the site has no list. */
export async function loadManifest() {
  const res = await fetch(MANIFEST, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`no file list (${res.status})`);
  const m = await res.json();
  if (!m || !Array.isArray(m.files) || !m.files.length) throw new Error('the file list is empty');
  return m;
}

/** How many of the site's files are already on this device, and how many bytes they make up. */
export async function savedSoFar(manifest) {
  let have = 0;
  let bytes = 0;
  await Promise.all(
    manifest.files.map(async (f) => {
      let hit = await caches.match(abs(f.path));
      // the start page is saved under the folder address, not under index.html
      if (!hit && f.path === 'index.html') hit = await caches.match(abs('./'));
      if (hit) {
        have++;
        bytes += f.size;
      }
    })
  );
  return { have, bytes, total: manifest.files.length };
}

/**
 * Asks the service worker to download and keep every file. `onProgress({ done, total, bytes })` is called after
 * each file. Resolves with { failed: [urls], total } when all are done.
 */
export async function saveAll(manifest, onProgress = () => {}) {
  // `ready` never settles when no service worker was registered (an address that is not https, a blocked browser)
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, no) => setTimeout(() => no(new Error('The offline helper is not running. Open the site from its https:// address and try again.')), 10000)),
  ]);
  const worker = reg.active;
  if (!worker) throw new Error('The offline helper is not running yet. Reload the page and try again.');
  // ask the browser not to throw the saved files away when it needs space (it may say no, and that is fine)
  try {
    navigator.storage && navigator.storage.persist && navigator.storage.persist();
  } catch {}
  const urls = [abs('./'), ...manifest.files.map((f) => abs(f.path))];
  const sizeOf = new Map(manifest.files.map((f) => [abs(f.path), f.size]));
  return new Promise((resolve, reject) => {
    let bytes = 0;
    let timer = null;
    const stop = () => {
      clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
    const arm = () => {
      clearTimeout(timer);
      // no news for two minutes: the helper was stopped (or the connection is gone)
      timer = setTimeout(() => {
        stop();
        reject(new Error('The download stopped. Check your connection and try again.'));
      }, 120000);
    };
    const onMessage = (e) => {
      const d = e.data || {};
      if (d.type === 'precache-progress') {
        bytes += sizeOf.get(d.url) || 0;
        onProgress({ done: d.done, total: d.total, bytes });
        arm();
      } else if (d.type === 'precache-done') {
        stop();
        resolve({ failed: d.failed || [], total: urls.length });
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    if (navigator.serviceWorker.startMessages) navigator.serviceWorker.startMessages();
    arm();
    worker.postMessage({ type: 'precache', urls });
  });
}

export const megabytes = (n) => (n / 1048576 < 10 ? (n / 1048576).toFixed(1) : Math.round(n / 1048576)) + '\u00a0MB';
