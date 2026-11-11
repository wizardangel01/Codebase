// The output panel shown under every runnable code block: streams program output,
// shows download progress for the Python engine, hosts inline input() prompts and
// explains errors in plain language.

import { h, clear } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { explainError } from '../lib/errors.js';
import { runner } from '../py/runner.js';

const MAX_CHARS = 300000;

export function createConsole({ title = 'Output', placeholder = 'Output appears here when you run the code.', emptyNote = 'The program finished without printing anything. Use print() to show something here.' } = {}) {
  const status = h('span.con-status');
  const clearBtn = h('button.btn.btn-ghost.btn-sm', { type: 'button', title: 'Clear output', 'aria-label': 'Clear output', onclick: () => api.reset() }, icon('trash', 15));
  const head = h('div.con-head', h('span.con-title', title), status, clearBtn);
  const bar = h('i');
  const loadText = h('span');
  const loading = h('div.con-loading', { hidden: true }, h('div.con-bar', { role: 'progressbar', 'aria-label': 'Downloading Python' }, bar), loadText);
  const out = h('pre.con-out', { role: 'log', 'aria-live': 'off', tabindex: '0', 'aria-label': title });
  const hint = h('p.con-empty', placeholder);
  const errBox = h('div.con-error', { hidden: true });
  const root = h('div.con', head, loading, hint, out, errBox);

  let last = null; // { kind, node }
  let chars = 0;
  let listening = false;
  let finished = true;

  const setStatus = (text, kind = '') => {
    status.textContent = text;
    status.className = 'con-status' + (kind ? ' is-' + kind : '');
  };

  function onProgress(e) {
    const { loaded, total } = e.detail;
    const pct = Math.min(100, Math.round((loaded / total) * 100));
    bar.style.width = pct + '%';
    loadText.textContent = pct < 100 ? `Downloading Python… ${pct}% (about 13 MB, saved for next time)` : 'Starting Python…';
  }
  function onStatus() {
    if (runner.status === 'ready' || runner.status === 'running') hideLoading();
  }
  function showLoading() {
    loading.hidden = false;
    bar.style.width = Math.round((runner.progress.loaded / runner.progress.total) * 100) + '%';
    loadText.textContent = 'Preparing Python…';
    if (!listening) {
      listening = true;
      runner.addEventListener('progress', onProgress);
      runner.addEventListener('status', onStatus);
    }
  }
  function hideLoading() {
    loading.hidden = true;
    if (listening) {
      listening = false;
      runner.removeEventListener('progress', onProgress);
      runner.removeEventListener('status', onStatus);
    }
  }

  function nearBottom() {
    return out.scrollHeight - out.scrollTop - out.clientHeight < 40;
  }

  const api = {
    el: root,
    get hasOutput() {
      return chars > 0;
    },
    reset() {
      clear(out);
      last = null;
      chars = 0;
      errBox.hidden = true;
      clear(errBox);
      hint.hidden = false;
      setStatus('');
      hideLoading();
    },
    /** Call when a run starts. */
    begin() {
      api.reset();
      finished = false;
      root.classList.add('is-active');
      setStatus('Running…', 'run');
      if (runner.status === 'idle' || runner.status === 'starting') showLoading();
    },
    write(kind, text) {
      if (!text) return;
      hint.hidden = true;
      const stick = nearBottom();
      const cls = kind === 'stderr' ? 'e' : kind === 'echo' ? 'echo' : 'o';
      if (last && last.kind === cls && last.node.isConnected) {
        last.node.firstChild.appendData(text);
      } else {
        const node = h('span.' + cls, document.createTextNode(text));
        out.appendChild(node);
        last = { kind: cls, node };
      }
      chars += text.length;
      while (chars > MAX_CHARS && out.firstChild && out.firstChild !== (last && last.node)) {
        chars -= out.firstChild.textContent.length;
        out.removeChild(out.firstChild);
      }
      if (stick) out.scrollTop = out.scrollHeight;
    },
    /** Inline input() prompt. Resolves to the typed line, or null for "end of input". */
    ask(prompt) {
      hint.hidden = true;
      return new Promise((resolve) => {
        const input = h('input.con-input', {
          type: 'text',
          autocomplete: 'off',
          autocapitalize: 'off',
          autocorrect: 'off',
          spellcheck: 'false',
          enterkeyhint: 'send',
          'aria-label': prompt ? `Program input. ${prompt}` : 'Program input',
        });
        const eof = h('button.btn.btn-ghost.btn-sm', { type: 'button', title: 'Tell the program there is no more input' }, 'No more input');
        const row = h('span.con-ask', input, eof);
        out.appendChild(row);
        last = null;
        setStatus('Waiting for your input', 'wait');
        out.scrollTop = out.scrollHeight;
        input.focus();
        input.scrollIntoView({ block: 'nearest' });
        const done = (value) => {
          const echo = value === null ? '' : value + '\n';
          const span = h('span.echo', document.createTextNode(echo));
          row.replaceWith(span);
          last = { kind: 'echo', node: span };
          setStatus('Running…', 'run');
          resolve(value);
        };
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            done(input.value);
          }
        });
        eof.addEventListener('click', () => done(null));
      });
    },
    /** Call with the result object returned by runner.run(). */
    end(result, { source = '' } = {}) {
      finished = true;
      hideLoading();
      root.classList.remove('is-active');
      const err = result && result.error;
      if (result && result.truncated) api.write('stderr', '\n(output was cut off because it was very long)\n');
      if (err && err.kind !== 'stopped' && err.kind !== 'timeout' && err.kind !== 'internal' && err.kind !== 'engine' && err.trace) {
        if (out.textContent && !out.textContent.endsWith('\n')) api.write('stdout', '\n');
        api.write('stderr', err.trace + '\n');
      }
      if (err) {
        const info = explainError(err, source);
        if (err.kind === 'stopped') setStatus('Stopped', 'warn');
        else setStatus(err.kind === 'timeout' ? 'Stopped: took too long' : 'Error' + (err.line ? ` on line ${err.line}` : ''), 'error');
        if (info && err.kind !== 'stopped') {
          clear(errBox);
          errBox.hidden = false;
          errBox.append(
            ...[
              h('div.con-error-head', icon(err.kind === 'timeout' ? 'clock' : 'bug', 18), h('strong', info.title)),
              info.body ? h('p', info.body) : null,
              info.tips && info.tips.length ? h('ul', info.tips.map((t) => h('li', t))) : null,
              err.kind === 'internal' || err.kind === 'engine' ? h('p.muted', err.message) : null,
            ].filter(Boolean)
          );
        }
      } else {
        const ms = result && typeof result.ms === 'number' ? result.ms : null;
        const code = result && result.exit_code;
        setStatus(code ? `Exited with code ${code}` : ms !== null ? `Finished in ${ms < 1000 ? ms + ' ms' : (ms / 1000).toFixed(1) + ' s'}` : 'Finished', code ? 'warn' : 'ok');
        if (!chars) {
          hint.hidden = false;
          hint.textContent = emptyNote;
        }
      }
    },
    setPlaceholder(text) {
      hint.textContent = text;
    },
    get finished() {
      return finished;
    },
  };
  return api;
}

/** Handlers object to pass to runner.run() so output streams into a console. */
export function consoleHandlers(con, extra = {}) {
  return {
    onOut: (kind, text) => con.write(kind, text),
    onInput: (prompt) => con.ask(prompt),
    ...extra,
  };
}
