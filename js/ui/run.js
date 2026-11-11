// Shared "run this code into that console" logic used by lesson examples, exercises,
// the playground and games, so stats, error marks and timeouts behave the same everywhere.

import { runner } from '../py/runner.js';
import { store } from '../store.js';
import { consoleHandlers } from './console.js';
import { stdinLines } from '../lib/doc.js';

export const INPUT_RE = /\binput\s*\(|\bsys\s*\.\s*stdin\b/;

/**
 * Run a request, streaming output into `con` and marking the failing line in `editor`.
 * Returns the runner result.
 */
export async function runInto({ con, editor, request, timeoutMs = 10000, source = '', countAs = 'runs' }) {
  con.begin();
  if (editor) editor.clearMarks();
  const res = await runner.run(request, consoleHandlers(con, { timeoutMs }));
  con.end(res, { source: source || request.code });
  if (request.mode === 'run' || request.mode === 'trace') {
    store.bump('runs');
    if (countAs === 'playground') store.bump('playgroundRuns');
  }
  const err = res.error;
  if (err && (err.kind === 'runtime' || err.kind === 'syntax')) {
    store.bump('errors', 0);
    if (editor && err.line) {
      editor.setMark('error', err.line);
      editor.scrollToLine(err.line);
    }
  }
  return res;
}

export function requestFor({ code, stdin, files, mode = 'run', extra = {} }) {
  return { mode, code, stdin: typeof stdin === 'string' ? stdinLines(stdin) : stdin || [], files: files || {}, ...extra };
}

/** Friendly message when Python can't start at all (old browser, file:// etc.). */
export function engineProblem(res) {
  const e = res && res.error;
  if (!e || (e.kind !== 'engine' && e.kind !== 'crash')) return null;
  if (e.message === 'file-protocol') return 'This page was opened straight from a file. Python needs a web address to start: open the site from GitHub Pages, or run “python -m http.server” in the project folder and visit http://localhost:8000.';
  if (e.message === 'unsupported') return 'This browser does not support what is needed to run Python (Web Workers and WebAssembly). Try a recent version of Chrome, Edge, Firefox or Safari.';
  return null;
}
