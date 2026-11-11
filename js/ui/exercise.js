// A graded coding exercise: prompt, editor, Run / Check, hints, solution, saved draft.
//
// Content shape (parsed by lib/doc.js):
//   %% exercise <id> | <title>
//   prompt…
//   %% starter / %% solution / %% tests / %% hint (repeat) / %% stdin / %% file <path> / %% config
//   %% end

import { h, debounce } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { renderMarkdown } from '../lib/markdown.js';
import { stdinLines } from '../lib/doc.js';
import { exerciseSpec } from '../lib/specs.js';
import { XP } from '../config.js';
import { createEditor } from './editor.js';
import { createConsole } from './console.js';
import { runInto, requestFor, INPUT_RE } from './run.js';
import { runner } from '../py/runner.js';
import { store } from '../store.js';
import { toast } from './toast.js';

export { exerciseSpec };

export function createExercise(node, { key, files: lessonFiles = {} }) {
  const spec = exerciseSpec(node);
  const sKey = `${key}#${spec.id}`;
  const files = { ...lessonFiles, ...spec.files };
  const saved = store.getDraft(sKey);
  const startValue = saved !== null && saved !== undefined ? saved : spec.starter;

  const ed = createEditor({
    value: startValue,
    minLines: Math.min(Math.max(spec.starter.split('\n').length + 1, 4), 14),
    maxLines: 28,
    onRun: () => check(),
    onFocus: () => runner.warm(),
  });
  const con = createConsole();
  const results = h('div.ex-results', { hidden: true });
  const hintsBox = h('div.ex-hints');
  const solutionBox = h('div.ex-solution', { hidden: true });
  const banner = h('div.ex-banner', { hidden: true, role: 'status' });
  const stdinArea = h('textarea.stdin-area', { rows: 2, spellcheck: 'false', 'aria-label': 'Program input, one line per input() call' });
  stdinArea.value = spec.stdin;
  const stdinBox = h('div.stdin', { hidden: !INPUT_RE.test(startValue) }, h('label', 'Program input'), h('span.muted', ' One line per input() call.'), stdinArea);

  let hintsShown = 0;
  let busy = false;
  let solved = !!store.exercise(sKey).done;

  const stateChip = h('span.ex-state');
  const checkBtn = h('button.btn.btn-primary', { type: 'button', onclick: () => check(), onpointerenter: () => runner.warm() }, icon('check', 16), 'Check my code');
  const runBtn = h('button.btn.btn-secondary', { type: 'button', onclick: () => run() }, icon('play', 15), 'Run');
  const stopBtn = h('button.btn.btn-danger', { type: 'button', hidden: true, onclick: () => runner.stop() }, icon('stop', 14), 'Stop');
  const hintBtn = h('button.btn.btn-ghost', { type: 'button', onclick: () => showHint(), disabled: !spec.hints.length }, icon('bulb', 16), '');
  const solBtn = h('button.btn.btn-ghost', { type: 'button', hidden: true, onclick: () => showSolution() }, icon('eye', 16), 'Show solution');
  const resetBtn = h('button.btn.btn-ghost', { type: 'button', title: 'Put the starter code back', onclick: () => reset() }, icon('reset', 15), 'Start over');

  function refreshHeader() {
    stateChip.className = 'ex-state' + (solved ? ' is-solved' : '');
    stateChip.replaceChildren(...(solved ? [icon('check', 14), 'Solved'] : [`+${XP.exercise} XP`]));
    const left = spec.hints.length - hintsShown;
    hintBtn.lastChild.textContent = left > 0 ? (hintsShown ? `Another hint (${left} left)` : 'Hint') : 'No more hints';
    hintBtn.disabled = left <= 0;
    const e = store.exercise(sKey);
    solBtn.hidden = !(solved || e.attempts >= 2 || (spec.hints.length > 0 && hintsShown >= spec.hints.length));
  }

  function showHint() {
    if (hintsShown >= spec.hints.length) return;
    const text = spec.hints[hintsShown++];
    hintsBox.appendChild(h('div.ex-hint', icon('bulb', 16), h('div', { html: renderMarkdown(text) })));
    refreshHeader();
  }

  function showSolution() {
    solutionBox.hidden = false;
    solutionBox.replaceChildren(
      h('h4', 'One way to solve it'),
      createEditor({ value: spec.solution, readOnly: true, minLines: 2, maxLines: 24, ariaLabel: 'Model solution' }).el,
      h('div.ex-bar', h('button.btn.btn-secondary.btn-sm', { type: 'button', onclick: () => ed.setValue(spec.solution) }, 'Copy into my editor'), h('button.btn.btn-ghost.btn-sm', { type: 'button', onclick: () => (solutionBox.hidden = true) }, 'Hide'))
    );
    usedSolution = true;
    solutionBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  let usedSolution = !!store.exercise(sKey).solution;

  function reset() {
    if (ed.getValue() !== spec.starter && !confirm('Replace your code with the starter code?')) return;
    ed.setValue(spec.starter);
    store.clearDraft(sKey);
    results.hidden = true;
    banner.hidden = true;
    con.reset();
  }

  const saveDraft = debounce((v) => {
    if (v === spec.starter) store.clearDraft(sKey);
    else store.setDraft(sKey, v);
  }, 500);
  ed.onChange((v) => {
    saveDraft(v);
    stdinBox.hidden = !INPUT_RE.test(v) && !spec.stdin;
  });

  function setBusy(b) {
    busy = b;
    checkBtn.disabled = runBtn.disabled = b;
    stopBtn.hidden = !b;
  }

  async function run() {
    if (busy) return;
    setBusy(true);
    try {
      await runInto({ con, editor: ed, request: requestFor({ code: ed.getValue(), stdin: stdinArea.value, files }), timeoutMs: (spec.config.timeout || 10) * 1000 });
    } finally {
      setBusy(false);
    }
  }

  function renderResults(res) {
    results.hidden = false;
    const tests = res.tests || [];
    const passed = tests.filter((t) => t.ok).length;
    results.replaceChildren(
      h('h4', tests.length ? `Checks: ${passed} of ${tests.length} passed` : 'Checks'),
      tests.length
        ? h(
            'ul.checks',
            tests.map((t) =>
              h(
                'li' + (t.ok ? '.is-ok' : '.is-bad'),
                icon(t.ok ? 'check' : 'x', 16),
                h('div', h('span.check-label', t.label), t.detail ? h('pre.check-detail', t.detail) : null)
              )
            )
          )
        : h('p.muted', res.error ? 'Your program stopped with an error before the checks could run. Read the message below, fix it and check again.' : 'No checks ran.')
    );
  }

  async function check() {
    if (busy) return;
    setBusy(true);
    banner.hidden = true;
    try {
      const res = await runInto({
        con,
        editor: ed,
        request: requestFor({ code: ed.getValue(), stdin: stdinArea.value || spec.stdin, files, mode: 'test', extra: { tests: spec.tests, seed: spec.config.seed ?? null } }),
        timeoutMs: (spec.config.timeout || 10) * 1000,
      });
      if (res.error && (res.error.kind === 'stopped' || res.error.kind === 'engine')) return;
      renderResults(res);
      const ok = !!res.tests_ok;
      const gained = store.recordExerciseAttempt(sKey, ok, { hints: hintsShown, solution: usedSolution });
      if (ok) {
        solved = true;
        banner.hidden = false;
        banner.className = 'ex-banner is-ok';
        banner.replaceChildren(icon('check', 20), h('div', h('strong', 'All checks passed.'), h('span', gained ? ` You earned ${gained} XP.` : ' Nicely done again.')));
        root.classList.add('just-solved');
        setTimeout(() => root.classList.remove('just-solved'), 1200);
        root.dispatchEvent(new CustomEvent('exercise-solved', { bubbles: true, detail: { id: spec.id } }));
      } else {
        banner.hidden = false;
        banner.className = 'ex-banner is-bad';
        banner.replaceChildren(icon('info', 20), h('div', h('strong', res.error ? 'Your code hit an error.' : 'Not quite yet.'), h('span', res.error ? ' Fix the error shown below, then check again.' : ' Read the failed checks, change your code and check again.')));
      }
      refreshHeader();
    } finally {
      setBusy(false);
    }
  }

  refreshHeader();
  const root = h(
    'section.exercise' + (solved ? '.is-solved' : ''),
    { id: 'ex-' + spec.id },
    h('header.ex-head', h('span.ex-icon', icon('terminal', 18)), h('h3', spec.title), stateChip),
    h('div.prose.ex-prompt', { html: renderMarkdown(spec.prompt) }),
    ed.el,
    stdinBox,
    h('div.ex-bar', checkBtn, runBtn, stopBtn, hintBtn, solBtn, resetBtn),
    banner,
    results,
    hintsBox,
    solutionBox,
    con.el
  );
  root.exercise = { spec, isSolved: () => solved, editor: ed, check };
  store.subscribe(() => {
    const now = !!store.exercise(sKey).done;
    if (now !== solved) {
      solved = now;
      root.classList.toggle('is-solved', solved);
      refreshHeader();
    }
  });
  return root;
}
