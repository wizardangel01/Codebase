// Web Worker that owns the Pyodide instance. Running Python off the main thread keeps
// the page responsive and lets the page stop runaway programs by terminating this worker.
//
// Messages in :  { type:'run', id, request }  { type:'input-reply', rid, text }
// Messages out:  { type:'progress', loaded, total }  { type:'ready', info }  { type:'init-error', message }
//                { type:'out', id, chunks:[[kind,text],…] }  { type:'input', id, rid, prompt }
//                { type:'result', id, result }  { type:'fatal', id, message }

import { loadPyodide } from '../../vendor/pyodide/pyodide.mjs';
import { createHost } from './host.js';

const post = (m) => self.postMessage(m);
const base = new URL('../../vendor/pyodide/', import.meta.url).href;

// Big files are fetched here (not by Pyodide) so we can report real download progress,
// then handed to Pyodide through a tiny fetch shim, so nothing downloads twice.
const ASSETS = [
  { file: 'pyodide.asm.wasm', type: 'application/wasm', size: 9650000 },
  { file: 'python_stdlib.zip', type: 'application/zip', size: 2600000 },
  { file: 'pyodide-lock.json', type: 'application/json', size: 120000 },
];

async function prefetch() {
  const total = ASSETS.reduce((n, a) => n + a.size, 0);
  let loaded = 0;
  let lastPost = 0;
  const store = new Map();
  for (const a of ASSETS) {
    const url = base + a.file;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not download ${a.file} (HTTP ${res.status})`);
    const parts = [];
    if (res.body && res.body.getReader) {
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        loaded += value.length;
        const now = performance.now();
        if (now - lastPost > 80) {
          lastPost = now;
          post({ type: 'progress', loaded: Math.min(loaded, total), total });
        }
      }
    } else {
      const buf = new Uint8Array(await res.arrayBuffer());
      parts.push(buf);
      loaded += buf.length;
    }
    const blob = new Blob(parts, { type: a.type });
    store.set(url, { blob, type: a.type });
  }
  post({ type: 'progress', loaded: total, total });
  const realFetch = self.fetch.bind(self);
  self.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const hit = store.get(url);
    if (hit) return Promise.resolve(new Response(hit.blob, { status: 200, headers: { 'content-type': hit.type } }));
    return realFetch(input, init);
  };
}

// --- output batching ------------------------------------------------------
let activeId = 0;
let buf = [];
let bufLen = 0;
let lastFlush = 0;
function flush() {
  if (buf.length) {
    post({ type: 'out', id: activeId, chunks: buf });
    buf = [];
    bufLen = 0;
  }
  lastFlush = performance.now();
}
function emit(kind, text) {
  buf.push([kind, text]);
  bufLen += text.length;
  if (bufLen > 4000 || performance.now() - lastFlush > 40) flush();
}

// --- interactive input (needs JSPI; see docs/ARCHITECTURE.md) -----------------
const pendingInputs = new Map();
let inputSeq = 0;
function requestInput(prompt) {
  flush();
  return new Promise((resolve) => {
    const rid = ++inputSeq;
    pendingInputs.set(rid, resolve);
    post({ type: 'input', id: activeId, rid, prompt });
  });
}

let host = null;
let running = false;

// A fatal engine error, for example the JavaScript stack running out inside very deep
// recursion (a recursive function wrapped by a C helper such as functools.cache can do
// that before Python raises RecursionError), surfaces here as an unhandled rejection that no
// promise of ours receives. Report it at once, so the page need not wait for the time limit.
const FATAL = /Maximum call stack|call stack size|memory access out of bounds|unreachable|Aborted|fatal error/i;
function fatal(reason) {
  if (!running) return;
  const text = String((reason && reason.message) || reason || '');
  if (!(reason && reason.pyodide_fatal_error) && !FATAL.test(text)) return;
  running = false;
  post({ type: 'fatal', id: activeId, message: text });
}
self.addEventListener('unhandledrejection', (e) => fatal(e.reason));
self.addEventListener('error', (e) => fatal(e.error || e.message));

(async () => {
  try {
    await prefetch();
    const pyodide = await loadPyodide({ indexURL: base, stdout: () => {}, stderr: () => {} });
    const hostSource = await (await fetch(new URL('./host.py', import.meta.url))).text();
    host = await createHost(pyodide, hostSource, { emit, requestInput });
    post({ type: 'ready', info: host.info });
  } catch (err) {
    post({ type: 'init-error', message: String((err && err.message) || err) });
  }
})();

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === 'input-reply') {
    const resolve = pendingInputs.get(m.rid);
    if (resolve) {
      pendingInputs.delete(m.rid);
      resolve(m.text);
    }
    return;
  }
  if (m.type === 'run') {
    activeId = m.id;
    lastFlush = 0;
    running = true;
    let result;
    try {
      if (!host) throw new Error('Python is not ready yet');
      result = await host.execute(m.request);
    } catch (err) {
      result = { ok: false, stdout: '', stderr: '', error: { kind: 'internal', type: 'EngineError', message: String((err && err.message) || err) } };
    }
    running = false;
    flush();
    post({ type: 'result', id: m.id, result });
  }
};
