// Main-thread controller for the Python worker.
//
//   import { runner } from './py/runner.js';
//   const res = await runner.run({ mode:'run', code:'print(1)' }, { onOut, onInput });
//
// - Starts the worker lazily (the first run downloads ~13 MB of Python once).
// - Runs one program at a time; extra requests wait their turn.
// - Enforces a time limit by terminating the worker (a stuck `while True` cannot
//   freeze the page). Time spent waiting for the learner to type does not count.

const WORKER_URL = new URL('./worker.js', import.meta.url);

export class PyRunner extends EventTarget {
  constructor() {
    super();
    this.worker = null;
    this.ready = null; // Promise resolved when the worker is ready
    this.status = 'idle'; // idle | starting | ready | running
    this.jspi = null;
    this.progress = { loaded: 0, total: 1 };
    this.current = null;
    this.tail = Promise.resolve();
    this.nextId = 1;
    this.lastError = null;
  }

  static supported() {
    return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined' && location.protocol !== 'file:';
  }

  _set(status) {
    this.status = status;
    this.dispatchEvent(new CustomEvent('status', { detail: status }));
  }

  /** Begin loading in the background (call on hover/focus so it feels instant). */
  warm() {
    if (!this.worker && PyRunner.supported()) this.ensureReady().catch(() => {});
  }

  ensureReady() {
    if (this.ready) return this.ready;
    if (!PyRunner.supported()) {
      return Promise.reject(new Error(location.protocol === 'file:' ? 'file-protocol' : 'unsupported'));
    }
    this._set('starting');
    this.progress = { loaded: 0, total: 1 };
    const worker = new Worker(WORKER_URL, { type: 'module' });
    this.worker = worker;
    this.ready = new Promise((resolve, reject) => {
      worker.onmessage = (e) => this._onMessage(worker, e.data, resolve, reject);
      worker.onerror = (e) => {
        const msg = (e && e.message) || 'The Python worker failed to start';
        if (this.worker === worker) this._reset();
        this._crashCurrent(msg);
        reject(new Error(msg));
      };
    });
    this.ready.catch(() => {});
    return this.ready;
  }

  _reset() {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {}
    }
    this.worker = null;
    this.ready = null;
    this._set('idle');
  }

  _onMessage(worker, m, resolveReady, rejectReady) {
    if (worker !== this.worker) return;
    switch (m.type) {
      case 'progress':
        this.progress = { loaded: m.loaded, total: m.total };
        this.dispatchEvent(new CustomEvent('progress', { detail: this.progress }));
        break;
      case 'ready':
        this.jspi = !!m.info.can_run_sync;
        this.info = m.info;
        this._set('ready');
        resolveReady(m.info);
        break;
      case 'init-error':
        this.lastError = m.message;
        this._reset();
        rejectReady(new Error(m.message));
        break;
      case 'out': {
        const cur = this.current;
        if (!cur || cur.id !== m.id) break;
        for (const [kind, text] of m.chunks) {
          if (kind === 'stdout') cur.stdout += text;
          else if (kind === 'stderr') cur.stderr += text;
          if (cur.onOut) cur.onOut(kind, text);
        }
        break;
      }
      case 'input': {
        const cur = this.current;
        if (!cur || cur.id !== m.id) break;
        this._pauseTimer(cur);
        Promise.resolve(cur.onInput ? cur.onInput(m.prompt) : null)
          .catch(() => null)
          .then((text) => {
            if (this.current !== cur) return;
            this._resumeTimer(cur);
            worker.postMessage({ type: 'input-reply', rid: m.rid, text: text === undefined ? null : text });
          });
        break;
      }
      case 'result': {
        const cur = this.current;
        if (!cur || cur.id !== m.id) break;
        this._finish(cur, m.result);
        break;
      }
      case 'fatal': {
        // The engine died (for example the stack ran out in very deep recursion). Restart it.
        const cur = this.current;
        if (!cur || cur.id !== m.id) break;
        this._reset();
        this._finish(cur, this._synthetic(cur, { kind: 'crash', type: 'EngineError', message: m.message || 'The Python engine stopped unexpectedly' }));
        break;
      }
    }
  }

  _startTimer(cur, ms) {
    cur.remaining = ms;
    cur.timerStart = performance.now();
    cur.timer = setTimeout(() => this._timeout(cur), ms);
  }
  _pauseTimer(cur) {
    if (!cur.timer) return;
    clearTimeout(cur.timer);
    cur.timer = null;
    cur.remaining = Math.max(500, cur.remaining - (performance.now() - cur.timerStart));
  }
  _resumeTimer(cur) {
    if (cur.timer || cur.done) return;
    cur.timerStart = performance.now();
    cur.timer = setTimeout(() => this._timeout(cur), cur.remaining);
  }

  _finish(cur, result) {
    if (cur.done) return;
    cur.done = true;
    clearTimeout(cur.timer);
    if (this.current === cur) this.current = null;
    if (this.status === 'running') this._set('ready');
    cur.resolve(result);
  }

  _synthetic(cur, error) {
    return { mode: cur.mode, ok: false, stdout: cur.stdout, stderr: cur.stderr, error, truncated: false, ms: Math.round(performance.now() - cur.t0) };
  }

  _timeout(cur) {
    if (cur.done) return;
    const seconds = Math.round(cur.limit / 1000);
    this._reset();
    this._finish(cur, this._synthetic(cur, { kind: 'timeout', type: 'TimeoutError', message: `The program ran for more than ${seconds} seconds`, seconds }));
  }

  _crashCurrent(message) {
    const cur = this.current;
    if (cur && !cur.done) this._finish(cur, this._synthetic(cur, { kind: 'crash', type: 'EngineError', message }));
  }

  /** Stop the running program (and restart the Python engine in the background). */
  stop() {
    const cur = this.current;
    if (cur && !cur.done) {
      cur.stopped = true;
      this._reset();
      this._finish(cur, this._synthetic(cur, { kind: 'stopped', type: 'KeyboardInterrupt', message: 'Stopped' }));
    }
  }

  /**
   * @param request  { mode, code, stdin?, files?, tests?, harness?, level?, seed?, interactive? }
   * @param handlers { onOut(kind,text), onInput(prompt)->Promise<string|null>, timeoutMs }
   */
  run(request, handlers = {}) {
    const job = this.tail.then(() => this._runNow(request, handlers));
    this.tail = job.catch(() => {});
    return job;
  }

  async _runNow(request, handlers) {
    const id = this.nextId++;
    const cur = {
      id,
      mode: request.mode || 'run',
      onOut: handlers.onOut,
      onInput: handlers.onInput,
      stdout: '',
      stderr: '',
      t0: performance.now(),
      limit: handlers.timeoutMs || 10000,
      done: false,
    };
    this.current = cur;
    let info;
    try {
      info = await this.ensureReady();
    } catch (err) {
      this.current = null;
      if (cur.stopped) return this._synthetic(cur, { kind: 'stopped', type: 'KeyboardInterrupt', message: 'Stopped' });
      return this._synthetic(cur, { kind: 'engine', type: 'EngineError', message: err.message || String(err) });
    }
    if (cur.done) return cur.result;
    return new Promise((resolve) => {
      cur.resolve = resolve;
      this._set('running');
      this._startTimer(cur, cur.limit);
      const interactive = request.interactive !== false && info.can_run_sync && !!handlers.onInput;
      this.worker.postMessage({ type: 'run', id, request: { ...request, interactive } });
    });
  }
}

export const runner = new PyRunner();
