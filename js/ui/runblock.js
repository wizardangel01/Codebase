// Runnable code example: editable code, Run / Stop, optional input box, console.

import { h } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { copyText } from '../lib/util.js';
import { createEditor } from './editor.js';
import { createConsole } from './console.js';
import { runInto, requestFor, INPUT_RE } from './run.js';
import { runner } from '../py/runner.js';
import { toast } from './toast.js';

export function createRunBlock({ code, label = 'main.py', stdin = '', files = {}, failsOnPurpose = false, minLines, maxLines = 26, caption = '' }) {
  const original = code;
  const lines = code.split('\n').length;
  const ed = createEditor({
    value: code,
    minLines: minLines || Math.min(Math.max(lines, 2), 12),
    maxLines,
    onRun: () => run(),
    onFocus: () => runner.warm(),
  });
  const con = createConsole();

  const stdinArea = h('textarea.stdin-area', {
    rows: 2,
    spellcheck: 'false',
    'aria-label': 'Input for the program, one line per input() call',
    placeholder: 'One line per input() call',
  });
  stdinArea.value = stdin;
  const stdinHelp = h('span.muted');
  const stdinBox = h('div.stdin', { hidden: true }, h('label', 'Program input'), stdinHelp, stdinArea);

  const runBtn = h('button.btn.btn-primary.btn-sm', { type: 'button', onclick: () => run(), onpointerenter: () => runner.warm() }, icon('play', 15), 'Run');
  const stopBtn = h('button.btn.btn-danger.btn-sm', { type: 'button', hidden: true, onclick: () => runner.stop() }, icon('stop', 14), 'Stop');
  const resetBtn = h('button.btn.btn-ghost.btn-sm', { type: 'button', hidden: true, title: 'Restore the original example', onclick: () => ed.setValue(original) }, icon('reset', 15), 'Reset');
  const copyBtn = h(
    'button.btn.btn-ghost.btn-sm',
    {
      type: 'button',
      title: 'Copy code',
      'aria-label': 'Copy code',
      onclick: async () => {
        if (await copyText(ed.getValue())) toast('Code copied', { icon: 'check' });
      },
    },
    icon('copy', 15)
  );

  const syncExtras = () => {
    const v = ed.getValue();
    resetBtn.hidden = v === original;
    const needs = INPUT_RE.test(v);
    stdinBox.hidden = !needs;
    if (needs) {
      stdinHelp.textContent = runner.jspi === false ? ' Type your answers here before you run, one per line.' : ' Optional: type answers here, or leave it empty and answer in the output panel.';
    }
  };
  ed.onChange(syncExtras);
  syncExtras();

  let running = false;
  async function run() {
    if (running) return;
    running = true;
    runBtn.disabled = true;
    stopBtn.hidden = false;
    try {
      await runInto({ con, editor: ed, request: requestFor({ code: ed.getValue(), stdin: stdinArea.value, files }) });
    } finally {
      running = false;
      runBtn.disabled = false;
      stopBtn.hidden = true;
      runBtn.focus({ preventScroll: true });
    }
  }

  const root = h(
    'figure.runblock' + (failsOnPurpose ? '.is-fails' : ''),
    h('div.rb-head', h('span.rb-file', icon('code', 15), label), failsOnPurpose ? h('span.chip.chip-warn', 'This example fails on purpose') : null, h('span.rb-tools', resetBtn, copyBtn)),
    ed.el,
    stdinBox,
    h('div.rb-bar', runBtn, stopBtn, h('span.rb-note', 'Change the code and run it again.')),
    con.el,
    caption ? h('figcaption', caption) : null
  );
  root.runBlock = { editor: ed, run, console: con };
  return root;
}
