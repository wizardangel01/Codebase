// Stage for "judge" games: a list of test cases that light up as your program passes or fails them.
// Visible cases show what goes in and what must come out. Hidden cases only report pass or fail.

import { h, sleep, prefersReducedMotion } from '../lib/util.js';
import { icon } from '../lib/icons.js';

export function parseCaseArg(arg) {
  const parts = String(arg || '').split(/\s+/).filter(Boolean);
  return { hidden: parts.some((p) => p.toLowerCase() === 'hidden'), label: parts.filter((p) => p.toLowerCase() !== 'hidden').join(' ') };
}

/** The test cases a level declares, before anything has run. */
export function declaredCases(level) {
  const mode = String(level.config.mode || 'io').toLowerCase();
  if (mode === 'script') {
    return (level.sections.test || []).map((x, i) => {
      const { hidden, label } = parseCaseArg(x.arg);
      return { name: label || `Test ${i + 1}`, hidden, input: x.text, expected: '' };
    });
  }
  const [a, b] = mode === 'io' ? ['in', 'out'] : ['call', 'returns'];
  const ins = level.sections[a] || [];
  const outs = level.sections[b] || [];
  return ins.map((x, i) => {
    const { hidden, label } = parseCaseArg(x.arg);
    return { name: label || `Test ${i + 1}`, hidden, input: x.text, expected: (outs[i] || {}).text || '' };
  });
}

/** Lines of `text` as spans, marking the ones that differ from the same line of `other`. */
function diffLines(text, other) {
  const mine = String(text).split('\n');
  const theirs = other === null ? null : String(other).split('\n');
  return mine.map((ln, i) => h('span.dl' + (theirs && theirs[i] !== ln ? '.is-diff' : ''), ln === '' ? ' ' : ln, '\n'));
}

const STATUS_ICON = { wait: () => icon('clock', 16), run: () => h('span.spinner.is-small'), ok: () => icon('check', 16), bad: () => icon('x', 16) };

export function createJudgeStage() {
  let token = 0;
  let mode = 'io';
  let declared = [];
  const summary = h('p.judge-summary', { role: 'status', 'aria-live': 'polite' });
  const list = h('ol.judge-cases');
  const root = h('figure.judge', h('figcaption.judge-head', icon('list', 16), h('strong', 'Tests'), summary), list);

  /** One card. `result` is null before a run. */
  function card(c, result) {
    const script = mode === 'script';
    const label = mode === 'io' ? 'Input' : script ? 'Test' : 'Call';
    const codeCol = (text) => h('div.case-col', h('h4', label), h('pre.case-pre', text || '(nothing)'));
    const status = h('span.case-status');
    const body = h('div.case-body', { hidden: true });
    const el = h('li.case', h('div.case-head', status, h('strong', c.name), c.hidden ? h('span.chip', { title: 'The test values are hidden' }, h('span.with-icon', icon('lock', 12), 'hidden')) : null), body);

    function set(state) {
      el.className = 'case is-' + state;
      status.replaceChildren(STATUS_ICON[state]());
      if (state === 'ok' || state === 'bad' || (state === 'wait' && !c.hidden)) body.hidden = !body.childNodes.length;
      else body.hidden = true;
    }

    // body content
    if (!result) {
      if (c.hidden) body.append(h('p.case-note', 'Hidden test: same idea, different values.'));
      else if (script) body.append(codeCol(c.input));
      else body.append(h('div.case-col', h('h4', label), h('pre.case-pre', c.input || '(nothing)')), h('div.case-col', h('h4', 'Expected'), h('pre.case-pre', c.expected || '(nothing)')));
    } else if (c.hidden) {
      if (!result.ok) body.append(h('p.case-note', 'A hidden test failed. Try other values: zero, negative numbers, very large or very small ones, empty text.'));
      if (result.error) body.append(h('p.case-error', icon('bug', 14), h('span', result.error)));
    } else if (result.ok) {
      if (script) body.append(codeCol(result.input));
      else body.append(h('div.case-col', h('h4', label), h('pre.case-pre', result.input || '(nothing)')), h('div.case-col', h('h4', 'Output'), h('pre.case-pre', result.got === '' ? '(nothing)' : result.got)));
    } else if (script) {
      body.append(codeCol(result.input));
      if (result.error) body.append(h('p.case-error', icon('bug', 14), h('span', result.error)));
    } else {
      body.append(h('div.case-col', h('h4', label), h('pre.case-pre', result.input || '(nothing)')), h('div.case-col', h('h4', 'Expected'), h('pre.case-pre', diffLines(result.expected, result.got))));
      if (!result.error) body.append(h('div.case-col', h('h4', 'Your program'), h('pre.case-pre.is-got', result.got === '' ? '(nothing printed)' : diffLines(result.got, result.expected))));
      if (result.error) body.append(h('p.case-error', icon('bug', 14), h('span', result.error)));
    }
    set('wait');
    return { el, set };
  }

  return {
    el: root,

    /** Before a run: list what the level will test. */
    preview(level) {
      token++;
      mode = String(level.config.mode || 'io').toLowerCase();
      declared = declaredCases(level);
      summary.textContent = `${declared.length} tests. Run your program to see how it does.`;
      list.replaceChildren(...declared.map((c) => card(c, null).el));
    },

    /** After a run: `result.cases` from games/harness/judge.py. */
    async show(result, { autoplay = true } = {}) {
      const my = ++token;
      mode = result.mode || mode;
      const cases = result.cases || [];
      const cards = cases.map((c) => card(c, c));
      list.replaceChildren(...cards.map((x) => x.el));
      const animate = autoplay && !prefersReducedMotion();
      for (let i = 0; i < cases.length; i++) {
        if (animate) {
          cards[i].set('run');
          await sleep(130);
          if (my !== token) return;
        }
        cards[i].set(cases[i].ok ? 'ok' : 'bad');
      }
      const failed = cases.filter((c) => !c.ok).length;
      summary.textContent = failed ? `${cases.length - failed} of ${cases.length} tests passed.` : `All ${cases.length} tests passed.`;
    },

    stop() {
      token++;
    },
    destroy() {
      token++;
    },
  };
}
