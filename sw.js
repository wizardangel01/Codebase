// CodeQuest service worker.
// Goal: after the first visit, the site (and Python itself) keeps working without a connection.
//   * Python runtime and fonts: cache first. They are large and never change in place.
//   * Everything else: network first (so lessons you edit show up straight away), with the cache
//     as a fallback when offline or when the network is slow.
// The deploy workflow replaces __BUILD__ with the commit hash; locally it stays "dev".

const BUILD = '__BUILD__';
const PYODIDE = '314.0.7';
const STATIC = 'cq-static-' + BUILD;
const HEAVY = 'cq-heavy-' + PYODIDE;
const KEEP = new Set([STATIC, HEAVY]);
const SLOW_MS = 4000;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key.startsWith('cq-') && !KEEP.has(key)) await caches.delete(key);
      await self.clients.claim();
    })()
  );
});

const isHeavy = (url) => url.pathname.includes('/vendor/pyodide/') || url.pathname.includes('/fonts/');

async function put(cacheName, request, response) {
  if (!response || !response.ok || response.status === 206 || response.type === 'opaque') return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

async function cacheFirst(request) {
  const hit = await caches.match(request, { cacheName: HEAVY });
  if (hit) return hit;
  const res = await fetch(request);
  await put(HEAVY, request, res);
  return res;
}

async function networkFirst(request) {
  const cached = await caches.match(request, { cacheName: STATIC });
  const network = fetch(request).then(async (res) => {
    await put(STATIC, request, res);
    return res;
  });
  if (!cached) {
    try {
      return await network;
    } catch (err) {
      if (request.mode === 'navigate') {
        const shell = await caches.match('index.html', { cacheName: STATIC }) || (await caches.match('./', { cacheName: STATIC }));
        if (shell) return shell;
      }
      throw err;
    }
  }
  // we have a copy: use the network if it answers quickly, otherwise the copy
  network.catch(() => {});
  return Promise.race([network, new Promise((resolve) => setTimeout(() => resolve(cached), SLOW_MS))]).catch(() => cached);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(isHeavy(url) ? cacheFirst(request) : networkFirst(request));
});

// The page can ask for a list of files to be saved for offline use (the "Save for offline use" button, js/offline.js).
//   postMessage({ type: 'precache', urls: [...] })
//   replies { type: 'precache-progress', done, total, url } after every file, and { type: 'precache-done', failed } at the end.
// Big files that are already saved (the Python runtime, the fonts) are not downloaded again.
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type !== 'precache' || !Array.isArray(data.urls)) return;
  const client = event.source;
  event.waitUntil(
    (async () => {
      const urls = data.urls.filter((u) => typeof u === 'string');
      let done = 0;
      const failed = [];
      const queue = urls.slice();
      const worker = async () => {
        while (queue.length) {
          const u = queue.shift();
          try {
            const req = new Request(u, { cache: 'reload' });
            const url = new URL(req.url);
            if (url.origin !== self.location.origin) throw new Error('other site');
            if (isHeavy(url) && (await caches.match(req, { cacheName: HEAVY }))) {
              // already on this device
            } else {
              const res = await fetch(req);
              await put(isHeavy(url) ? HEAVY : STATIC, req, res);
              if (!res.ok) failed.push(u);
            }
          } catch {
            failed.push(u);
          }
          done++;
          if (client) client.postMessage({ type: 'precache-progress', done, total: urls.length, url: u });
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      if (client) client.postMessage({ type: 'precache-done', failed });
    })()
  );
});
