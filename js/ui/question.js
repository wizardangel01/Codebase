// Questions used inline in lessons ("check yourself") and in module quizzes.
//
//   %% question <id> | <type>        type: choice | multi | predict | fill | order
//   prompt (Markdown, may contain a code fence)
//   %% choice [correct]              (choice, multi)  one per option
//   %% answer                        (predict: expected output; fill: one line per blank, alternatives split by " | ")
//   %% lines                         (order: the lines in the correct order, indentation kept)
//   %% distractors                   (order: extra lines that do not belong)
//   %% explain                       shown after answering
//   %% stdin                         (predict) lines fed to input()
//   %% end

import { h, mulberry32, hashString, shuffle } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { renderMarkdown, renderInline, splitBlocks } from '../lib/markdown.js';
import { highlight } from '../lib/highlight.js';
import { stdinLines } from '../lib/doc.js';
import { questionSpec, normalizeOutput, blankAnswers, correctAnswerText } from '../lib/specs.js';
import { store } from '../store.js';
import { runner } from '../py/runner.js';
import { createConsole } from './console.js';
import { runInto, requestFor } from './run.js';

export { questionSpec, normalizeOutput, blankAnswers, correctAnswerText };

/**
 * @param node  parsed %% question block
 * @param opts  { key, mode: 'inline' | 'quiz', onResult(correct:boolean), index, total }
 */
export function createQuestion(node, { key = '', mode = 'inline', onResult = null } = {}) {
  const spec = questionSpec(node);
  const sKey = `${key}#${spec.id}`;
  const already = mode === 'inline' && store.isCheckDone(sKey);
  let answered = false;
  let attempts = 0;

  const feedback = h('div.q-feedback', { hidden: true, role: 'status', 'aria-live': 'polite' });
  const checkBtn = h('button.btn.btn-primary', { type: 'button', onclick: () => doCheck() }, icon('check', 16), 'Check');
  const actions = h('div.q-actions', checkBtn);
  const body = h('div.q-body');
  let getAnswer = () => null;
  let evaluate = () => ({ correct: false });
  let reveal = () => {};
  let lock = () => {};

  const promptHtml = (() => {
    // predict and fill render their own code block; other types render the prompt as is
    return renderMarkdown(spec.prompt);
  })();

  // ---------------------------------------------------------------- choice / multi
  if (spec.type === 'choice' || spec.type === 'multi') {
    const multi = spec.type === 'multi';
    const name = 'q-' + sKey.replace(/\W+/g, '-') + '-' + Math.random().toString(36).slice(2, 7);
    const items = spec.choices.map((c, i) => {
      const input = h('input', { type: multi ? 'checkbox' : 'radio', name, value: i });
      const label = h('label.q-choice', input, h('span.q-mark'), h('span.q-text', { html: renderInline(c.text) }));
      return { input, label, c };
    });
    body.append(h('p.q-hint', multi ? 'Select all that apply.' : 'Choose one answer.'), h('div.q-choices', { role: multi ? 'group' : 'radiogroup' }, items.map((i) => i.label)));
    getAnswer = () => items.filter((i) => i.input.checked).map((i) => i.c);
    evaluate = () => {
      const picked = items.filter((i) => i.input.checked);
      const correct = items.every((i) => i.input.checked === i.c.correct) && picked.length > 0;
      items.forEach((i) => {
        i.label.classList.toggle('is-correct', i.c.correct && (answered || correct));
        i.label.classList.toggle('is-wrong', i.input.checked && !i.c.correct);
      });
      return { correct, empty: picked.length === 0 };
    };
    reveal = () => items.forEach((i) => i.label.classList.toggle('is-correct', i.c.correct));
    lock = () => items.forEach((i) => (i.input.disabled = true));
  }

  // ---------------------------------------------------------------- predict
  let runCode = null;
  if (spec.type === 'predict') {
    const fence = splitBlocks(spec.prompt).find((b) => b.type === 'fence');
    runCode = fence ? fence.code : null;
    const area = h('textarea.q-predict', { rows: Math.min(8, Math.max(2, spec.answer.split('\n').length + 1)), spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'What does the program print?', placeholder: 'Type exactly what the program prints' });
    body.append(h('p.q-hint', 'Type what the program prints, line by line. Nothing is printed for a line that has no print().'), area);
    getAnswer = () => area.value;
    evaluate = () => ({ correct: normalizeOutput(area.value) === normalizeOutput(spec.answer), empty: !area.value.trim() });
    reveal = () => {
      if (normalizeOutput(area.value) !== normalizeOutput(spec.answer)) {
        body.append(h('div.q-answer', h('strong', 'The program prints:'), h('pre.code-static.output', spec.answer)));
      }
    };
    lock = () => (area.readOnly = true);
  }

  // ---------------------------------------------------------------- fill
  if (spec.type === 'fill') {
    const accepted = blankAnswers(spec.answer);
    const fence = splitBlocks(spec.prompt).find((b) => b.type === 'fence');
    const code = fence ? fence.code : '';
    let n = 0;
    const slots = [];
    const html = highlight(code).replace(/___/g, () => `<span class="blank-slot" data-i="${n++}"></span>`);
    const pre = h('pre.code-static.q-fill-code', { html: `<code>${html}</code>` });
    pre.querySelectorAll('.blank-slot').forEach((slot) => {
      const i = +slot.dataset.i;
      const width = Math.max(4, ...(accepted[i] || ['xxxx']).map((a) => a.length + 2));
      const input = h('input.q-blank', { type: 'text', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': `Blank ${i + 1}`, style: { width: width + 'ch' } });
      slots.push(input);
      slot.replaceWith(input);
    });
    body.append(h('p.q-hint', 'Fill in each blank.'), pre);
    getAnswer = () => slots.map((s) => s.value.trim());
    evaluate = () => {
      let all = true;
      slots.forEach((s, i) => {
        const ok = (accepted[i] || []).includes(s.value.trim());
        s.classList.toggle('is-correct', ok);
        s.classList.toggle('is-wrong', !ok && s.value.trim() !== '');
        if (!ok) all = false;
      });
      return { correct: all, empty: slots.every((s) => !s.value.trim()) };
    };
    reveal = () =>
      slots.forEach((s, i) => {
        if (!(accepted[i] || []).includes(s.value.trim())) {
          s.value = (accepted[i] || [''])[0];
          s.classList.add('is-revealed');
        }
      });
    lock = () => slots.forEach((s) => (s.readOnly = true));
  }

  // ---------------------------------------------------------------- order (Parsons problem)
  if (spec.type === 'order') {
    const all = [...spec.lines.map((text, i) => ({ text, i, real: true })), ...spec.distractors.map((text, i) => ({ text, i: 1000 + i, real: false }))];
    const pool = shuffle(all, mulberry32(hashString(sKey))).map((x, idx) => ({ ...x, uid: idx }));
    let program = [];
    const poolEl = h('ul.q-pool', { 'aria-label': 'Available lines' });
    const progEl = h('ol.q-program', { 'aria-label': 'Your program' });
    const counter = h('p.q-hint');
    const redraw = () => {
      poolEl.replaceChildren(
        ...pool
          .filter((p) => !program.includes(p))
          .map((p) =>
            h('li', h('button.q-piece', { type: 'button', title: 'Add to your program', onclick: () => (program.push(p), redraw()) }, h('code', { html: highlight(p.text) })))
          )
      );
      progEl.replaceChildren(
        ...program.map((p, idx) =>
          h(
            'li',
            { dataset: { right: p.real && spec.lines[idx] === p.text ? '1' : '0' } },
            h('button.q-piece.in-program', { type: 'button', title: 'Put back', onclick: () => (program.splice(idx, 1), redraw()) }, h('code', { html: highlight(p.text) })),
            h('span.q-move', h('button.btn.btn-ghost.btn-icon', { type: 'button', 'aria-label': 'Move up', disabled: idx === 0, onclick: () => ([program[idx - 1], program[idx]] = [program[idx], program[idx - 1]], redraw()) }, icon('arrow-up', 14)), h('button.btn.btn-ghost.btn-icon', { type: 'button', 'aria-label': 'Move down', disabled: idx === program.length - 1, onclick: () => ([program[idx + 1], program[idx]] = [program[idx], program[idx + 1]], redraw()) }, icon('arrow-down', 14)))
          )
        )
      );
      counter.textContent = `${program.length} of ${spec.lines.length} lines placed. Tap a line to move it.`;
      if (!program.length) progEl.appendChild(h('li.q-placeholder', 'Your program starts here'));
    };
    body.append(h('p.q-hint', 'Put the lines in the right order. Indentation is already part of each line.'), h('div.q-order', h('div', h('h4', 'Lines'), poolEl), h('div', h('h4', 'Your program'), progEl)), counter);
    redraw();
    getAnswer = () => program.map((p) => p.text);
    evaluate = () => {
      const got = program.map((p) => p.text);
      const correct = got.length === spec.lines.length && got.every((t, i) => t === spec.lines[i]);
      const right = program.filter((p, i) => spec.lines[i] === p.text).length;
      return { correct, empty: !program.length, detail: correct ? '' : `${right} of ${spec.lines.length} lines are in the right place.` };
    };
    reveal = () => {
      program = spec.lines.map((t) => all.find((a) => a.text === t && a.real) || { text: t, real: true });
      redraw();
    };
    lock = () => body.querySelectorAll('button').forEach((b) => (b.disabled = true));
  }

  // ---------------------------------------------------------------- shared
  function showFeedback(correct, extra = '') {
    feedback.hidden = false;
    feedback.className = 'q-feedback ' + (correct ? 'is-ok' : 'is-bad');
    feedback.replaceChildren(
      icon(correct ? 'check' : 'x', 18),
      h(
        'div',
        h('strong', correct ? 'Correct.' : mode === 'quiz' ? 'Not quite.' : 'Not quite. Try again.'),
        extra ? h('span', ' ' + extra) : null,
        spec.explain && (correct || mode === 'quiz' || attempts >= 2) ? h('div.q-explain', { html: renderMarkdown(spec.explain) }) : null
      )
    );
  }

  const con = createConsole({ title: 'Run it to see' });
  con.el.hidden = true;
  const runBtn = h(
    'button.btn.btn-ghost',
    {
      type: 'button',
      hidden: true,
      onclick: async () => {
        con.el.hidden = false;
        await runInto({ con, request: requestFor({ code: runCode, stdin: spec.stdin }) });
      },
    },
    icon('play', 15),
    'Run it and see'
  );

  async function doCheck() {
    if (answered) return;
    const r = evaluate();
    if (r.empty) {
      feedback.hidden = false;
      feedback.className = 'q-feedback is-bad';
      feedback.replaceChildren(icon('info', 18), h('div', h('strong', 'Pick or type an answer first.')));
      return;
    }
    attempts += 1;
    if (r.correct || mode === 'quiz' || (spec.type !== 'choice' && attempts >= 3)) {
      answered = true;
      lock();
      checkBtn.hidden = true;
      if (!r.correct) reveal();
      if (runCode) runBtn.hidden = false;
    }
    showFeedback(r.correct, r.detail || '');
    if (r.correct && mode === 'inline') {
      const gained = store.completeCheck(sKey);
      root.classList.add('is-done');
      if (gained) root.dispatchEvent(new CustomEvent('check-passed', { bubbles: true }));
    }
    if (answered && onResult) onResult(r.correct, { id: spec.id, attempts });
  }

  const root = h(
    'section.question.type-' + spec.type + (already ? '.is-done' : ''),
    { id: mode === 'inline' ? 'q-' + spec.id : null },
    h('header.q-head', icon(mode === 'inline' ? 'bulb' : 'list', 18), h('h3', mode === 'inline' ? 'Check yourself' : 'Question')),
    spec.type === 'fill' || spec.type === 'predict' || spec.type === 'order' ? h('div.prose.q-prompt', { html: spec.type === 'fill' ? proseOnly(spec.prompt) : spec.type === 'order' ? promptHtml : promptHtml }) : h('div.prose.q-prompt', { html: promptHtml }),
    body,
    actions,
    runBtn,
    feedback,
    con.el
  );
  root.question = { spec, evaluate: () => evaluate(), isAnswered: () => answered };
  return root;
}

function proseOnly(md) {
  return splitBlocks(md)
    .filter((b) => b.type === 'prose')
    .map((b) => renderMarkdown(b.text))
    .join('\n');
}
