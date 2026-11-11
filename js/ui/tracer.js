// Step-through visualizer: runs the code once under a tracer, then lets the learner move
// back and forth through every executed line and watch variables change.

import { h, clear } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { createEditor } from './editor.js';
import { createConsole } from './console.js';
import { runner } from '../py/runner.js';
import { requestFor } from './run.js';
import { prefersReducedMotion } from '../lib/util.js';

export function createTraceBlock({ code, stdin = '', files = {}, label = 'Step through' }) {
  const ed = createEditor({ value: code, readOnly: true, minLines: 3, maxLines: 22, ariaLabel: 'Code being traced' });
  const con = createConsole({ title: 'Output so far', placeholder: 'Nothing printed yet.' });
  con.el.classList.add('con-mini');

  let steps = [];
  let result = null;
  let i = 0;
  let timer = null;

  const slider = h('input.tr-slider', { type: 'range', min: 0, max: 0, value: 0, 'aria-label': 'Step', oninput: (e) => go(+e.target.value) });
  const counter = h('span.tr-count', { 'aria-live': 'polite' });
  const btn = (name, title, fn) => h('button.btn.btn-ghost.btn-icon', { type: 'button', title, 'aria-label': title, onclick: fn }, icon(name, 18));
  const first = btn('skip-back', 'First step', () => go(0));
  const prev = btn('chevron-left', 'Previous step', () => go(i - 1));
  const playBtn = h('button.btn.btn-primary.btn-sm', { type: 'button', onclick: () => togglePlay() }, icon('play', 15), 'Play');
  const next = btn('chevron-right', 'Next step', () => go(i + 1));
  const last = btn('skip-forward', 'Last step', () => go(steps.length - 1));
  const note = h('p.tr-note', { 'aria-live': 'polite' });
  const cutShort = h('p.tr-trunc', { hidden: true });
  const vars = h('div.tr-vars');
  const controls = h('div.tr-controls', first, prev, playBtn, next, last, slider, counter);

  const startBtn = h('button.btn.btn-primary', { type: 'button', onclick: () => start() }, icon('play', 16), 'Visualise this code');
  const intro = h('div.tr-intro', startBtn, h('span.muted', 'Runs the code once, then lets you step through it line by line.'));
  const stage = h('div.tr-stage', { hidden: true }, h('div.tr-side', h('h4', 'Variables'), vars, note, cutShort), con.el);
  const body = h('div.tr-body', ed.el, stage);
  const root = h('figure.traceblock', h('div.rb-head', h('span.rb-file', icon('eye', 15), label)), body, controls, intro);
  controls.hidden = true;

  async function start() {
    startBtn.disabled = true;
    startBtn.textContent = 'Running…';
    const res = await runner.run(requestFor({ code, stdin, files, mode: 'trace' }), { timeoutMs: 10000 });
    startBtn.disabled = false;
    startBtn.textContent = '';
    startBtn.append(icon('play', 16), 'Visualise this code');
    result = res;
    if (!res.steps || !res.steps.length) {
      con.begin();
      con.end(res, { source: code });
      stage.hidden = false;
      return;
    }
    steps = res.steps;
    // the recorder keeps a limited number of steps; the program itself still runs to the end
    cutShort.hidden = !res.trace_truncated;
    if (res.trace_truncated) cutShort.textContent = `This program runs more than ${steps.length - 1} lines, so only the first ${steps.length - 1} steps were recorded. The last step shows where the program ended up.`;
    intro.hidden = true;
    stage.hidden = false;
    controls.hidden = false;
    slider.max = steps.length - 1;
    go(0);
  }

  function go(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    const s = steps[i];
    const before = i > 0 ? steps[i - 1] : null;
    slider.value = i;
    counter.textContent = `Step ${i + 1} of ${steps.length}`;
    first.disabled = prev.disabled = i === 0;
    next.disabled = last.disabled = i === steps.length - 1;
    ed.clearMarks();
    if (s.line) {
      ed.setMark('current', s.line);
      ed.scrollToLine(s.line);
    }
    // variables
    clear(vars);
    s.frames.forEach((f, fi) => {
      const prevFrame = before && before.frames[fi] && before.frames[fi].name === f.name ? before.frames[fi] : null;
      const rows = Object.entries(f.vars).map(([name, [type, rep]]) => {
        const changed = !prevFrame || !prevFrame.vars[name] || prevFrame.vars[name][1] !== rep;
        return h('tr' + (changed ? '.is-changed' : ''), h('th', { scope: 'row' }, name), h('td', h('code', rep), h('span.tr-type', type)));
      });
      vars.appendChild(
        h(
          'div.tr-frame' + (fi === s.frames.length - 1 ? '.is-top' : ''),
          h('div.tr-frame-name', f.name === 'Global' ? 'Global variables' : `Inside ${f.name}()`),
          rows.length ? h('table', h('tbody', rows)) : h('p.muted', 'No variables yet.')
        )
      );
    });
    // message
    let msg = '';
    if (s.ev === 'end') {
      msg = result.error ? 'The program stopped with an error (see the output below).' : 'The program has finished.';
      if (result.trace_truncated) msg += ' The variables show where it ended up.';
    }
    else if (s.ev === 'return') msg = `${s.func === '<module>' ? 'The program' : s.func + '()'} returns ${s.ret}.`;
    else if (s.ev === 'exception') msg = `An error is raised here: ${s.exc}`;
    else msg = `About to run line ${s.line}.`;
    note.textContent = msg;
    // output so far
    con.reset();
    con.write('stdout', (result.stdout || '').slice(0, s.out));
    if (s.ev === 'end' && result.error) con.end(result, { source: code });
  }

  function togglePlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
      playBtn.replaceChildren(icon('play', 15), 'Play');
      return;
    }
    if (i >= steps.length - 1) go(0);
    playBtn.replaceChildren(icon('pause', 15), 'Pause');
    timer = setInterval(() => {
      if (i >= steps.length - 1) return togglePlay();
      go(i + 1);
    }, prefersReducedMotion() ? 1200 : 750);
  }

  root.traceBlock = { start, go };
  return root;
}
