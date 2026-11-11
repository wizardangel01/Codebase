// A small code editor: a transparent <textarea> on top of a syntax-highlighted <pre>.
// Because the real typing surface is a native textarea, mobile keyboards, selection,
// undo/redo and screen readers all behave normally.
//
//   const ed = createEditor({ value: 'print(1)', onRun: () => … });
//   parent.append(ed.el);  ed.getValue();  ed.setMark('error', 3);

import { h } from '../lib/util.js';
import { highlight } from '../lib/highlight.js';

const OPEN = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
const CLOSE = new Set([')', ']', '}', '"', "'"]);
const SYMBOLS = [
  ['Tab', '    ', 'Indent (4 spaces)'],
  [':', ':'],
  ['( )', '()'],
  ['[ ]', '[]'],
  ['{ }', '{}'],
  ['" "', '""'],
  ["' '", "''"],
  ['=', '='],
  ['_', '_'],
  ['#', '#'],
  ['.', '.'],
  [',', ','],
  ['+', '+'],
  ['-', '-'],
  ['*', '*'],
  ['/', '/'],
  ['%', '%'],
  ['<', '<'],
  ['>', '>'],
  ['!', '!'],
  ['\\', '\\'],
];

function insertAtCursor(ta, text) {
  ta.focus();
  let ok = false;
  try {
    ok = document.execCommand('insertText', false, text);
  } catch {}
  if (!ok) {
    const s = ta.selectionStart;
    ta.setRangeText(text, s, ta.selectionEnd, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export function createEditor(options = {}) {
  const o = {
    value: '',
    readOnly: false,
    lineNumbers: true,
    minLines: 3,
    maxLines: 32,
    ariaLabel: 'Python code editor',
    symbols: true,
    placeholder: '',
    onChange: null,
    onRun: null,
    onFocus: null,
    ...options,
  };

  const ta = h('textarea.ed-ta', {
    spellcheck: 'false',
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    wrap: 'off',
    rows: 1,
    'aria-label': o.ariaLabel,
    placeholder: o.placeholder || null,
  });
  ta.value = o.value;
  if (o.readOnly) ta.readOnly = true;

  const codeEl = h('code');
  const pre = h('pre.ed-hl', { 'aria-hidden': 'true' }, codeEl);
  const marks = h('div.ed-marks', { 'aria-hidden': 'true' });
  const body = h('div.ed-body', marks, pre, ta);
  const gutter = h('div.ed-gutter', { 'aria-hidden': 'true' });
  const scroll = h('div.ed-scroll', o.lineNumbers ? gutter : null, body);
  scroll.style.setProperty('--min-lines', o.minLines);
  scroll.style.setProperty('--max-lines', o.maxLines);

  let escaped = false;
  let lastLines = -1;
  const markLines = {};
  const changeHandlers = new Set(o.onChange ? [o.onChange] : []);

  function render() {
    const v = ta.value;
    codeEl.innerHTML = highlight(v) + '\n';
    if (o.lineNumbers) {
      const n = v.split('\n').length;
      if (n !== lastLines) {
        lastLines = n;
        gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
      }
    }
    placeMarks();
  }

  function lineHeight() {
    return parseFloat(getComputedStyle(pre).lineHeight) || 24;
  }
  function placeMarks() {
    marks.textContent = '';
    const lh = lineHeight();
    for (const [kind, line] of Object.entries(markLines)) {
      if (!line) continue;
      const m = h('div.ed-mark.is-' + kind);
      m.style.top = `calc(var(--ed-pad) + ${(line - 1) * lh}px)`;
      m.style.height = lh + 'px';
      marks.appendChild(m);
    }
  }

  function emitChange() {
    changeHandlers.forEach((fn) => fn(ta.value));
  }

  const insert = (text) => insertAtCursor(ta, text);

  function indentLines(dedent) {
    const v = ta.value;
    const s = ta.selectionStart;
    let e = ta.selectionEnd;
    if (e > s && v[e - 1] === '\n') e -= 1;
    const a = v.lastIndexOf('\n', s - 1) + 1;
    let b = v.indexOf('\n', e);
    if (b === -1) b = v.length;
    const lines = v.slice(a, b).split('\n');
    const out = lines.map((l) => (dedent ? l.replace(/^( {1,4}|\t)/, '') : l.length ? '    ' + l : l)).join('\n');
    ta.setSelectionRange(a, b);
    insert(out);
    ta.setSelectionRange(a, a + out.length);
  }

  function toggleComment() {
    const v = ta.value;
    const s = ta.selectionStart;
    let e = ta.selectionEnd;
    if (e > s && v[e - 1] === '\n') e -= 1;
    const a = v.lastIndexOf('\n', s - 1) + 1;
    let b = v.indexOf('\n', e);
    if (b === -1) b = v.length;
    const lines = v.slice(a, b).split('\n');
    const body = lines.filter((l) => l.trim());
    const allCommented = body.length > 0 && body.every((l) => /^\s*#/.test(l));
    const minIndent = Math.min(...body.map((l) => /^\s*/.exec(l)[0].length), 1e9);
    const out = lines
      .map((l) => {
        if (!l.trim()) return l;
        if (allCommented) return l.replace(/^(\s*)# ?/, '$1');
        return l.slice(0, minIndent) + '# ' + l.slice(minIndent);
      })
      .join('\n');
    ta.setSelectionRange(a, b);
    insert(out);
    ta.setSelectionRange(a, a + out.length);
  }

  ta.addEventListener('input', () => {
    render();
    if (markLines.error) {
      markLines.error = null;
      placeMarks();
    }
    emitChange();
  });

  ta.addEventListener('beforeinput', (e) => {
    if (o.readOnly) return;
    if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
      e.preventDefault();
      const v = ta.value;
      const s = ta.selectionStart;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const before = v.slice(lineStart, s);
      const indent = /^[ \t]*/.exec(before)[0];
      const opensBlock = /:\s*(#.*)?$/.test(before.trimEnd()) && before.trim() !== '';
      const prev = v[s - 1];
      const next = v[ta.selectionEnd];
      if (prev && OPEN[prev] && prev !== '"' && prev !== "'" && next === OPEN[prev]) {
        // Enter between brackets: put the closing bracket on its own line
        insert('\n' + indent + '    ' + '\n' + indent);
        const pos = s + 1 + indent.length + 4;
        ta.setSelectionRange(pos, pos);
      } else insert('\n' + indent + (opensBlock ? '    ' : ''));
      return;
    }
    if (e.inputType === 'insertText' && e.data && e.data.length === 1) {
      const ch = e.data;
      const v = ta.value;
      const s = ta.selectionStart;
      const en = ta.selectionEnd;
      const prev = v[s - 1] || '';
      const next = v[en] || '';
      if (CLOSE.has(ch) && s === en && next === ch) {
        e.preventDefault();
        ta.setSelectionRange(s + 1, s + 1);
        return;
      }
      if (ch in OPEN) {
        if (s !== en) {
          e.preventDefault();
          const sel = v.slice(s, en);
          insert(ch + sel + OPEN[ch]);
          ta.setSelectionRange(s + 1, s + 1 + sel.length);
          return;
        }
        if (ch === '"' || ch === "'") {
          if (/\w/.test(prev) || /\w/.test(next) || prev === ch) return; // apostrophes, triple quotes
        } else if (/\w/.test(next)) return;
        e.preventDefault();
        insert(ch + OPEN[ch]);
        ta.setSelectionRange(s + 1, s + 1);
      }
    }
  });

  ta.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'Enter') {
      e.preventDefault();
      o.onRun && o.onRun();
      return;
    }
    if (o.readOnly) return;
    if (e.key === 'Escape') {
      escaped = true;
      return;
    }
    if (e.key === 'Tab') {
      if (escaped) {
        escaped = false;
        return; // let focus move on
      }
      e.preventDefault();
      const s = ta.selectionStart;
      const en = ta.selectionEnd;
      if (e.shiftKey || ta.value.slice(s, en).includes('\n')) indentLines(e.shiftKey);
      else {
        const col = s - (ta.value.lastIndexOf('\n', s - 1) + 1);
        insert(' '.repeat(4 - (col % 4)));
      }
      return;
    }
    escaped = false;
    if (mod && e.key === '/') {
      e.preventDefault();
      toggleComment();
      return;
    }
    if (e.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) {
      const v = ta.value;
      const s = ta.selectionStart;
      const prev = v[s - 1];
      if (prev && OPEN[prev] && v[s] === OPEN[prev]) {
        e.preventDefault();
        ta.setSelectionRange(s - 1, s + 1);
        insert('');
        return;
      }
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const before = v.slice(lineStart, s);
      if (before.length >= 4 && /^ +$/.test(before) && before.length % 4 === 0) {
        e.preventDefault();
        ta.setSelectionRange(s - 4, s);
        insert('');
      }
    }
  });

  ta.addEventListener('blur', () => (escaped = false));
  ta.addEventListener('focus', () => o.onFocus && o.onFocus());

  const root = h('div.ed' + (o.readOnly ? '.is-readonly' : ''), scroll);
  if (o.symbols && !o.readOnly) {
    const bar = h(
      'div.ed-symbols',
      { role: 'toolbar', 'aria-label': 'Symbols for typing code' },
      SYMBOLS.map(([label, text, title]) =>
        h(
          'button.ed-sym',
          {
            type: 'button',
            title: title || `Insert ${label}`,
            'aria-label': title || `Insert ${label}`,
            // keep the keyboard open: don't let the button take focus
            onpointerdown: (e) => e.preventDefault(),
            onmousedown: (e) => e.preventDefault(),
            onclick: () => {
              insert(text);
              if (text.length === 2 && OPEN[text[0]] === text[1]) {
                const p = ta.selectionStart - 1;
                ta.setSelectionRange(p, p);
              }
            },
          },
          label
        )
      )
    );
    root.appendChild(bar);
  }
  if (!o.readOnly) {
    root.appendChild(h('p.ed-hint', 'Press Esc, then Tab, to leave the editor with the keyboard. Ctrl+Enter runs the code.'));
  }

  render();

  const api = {
    el: root,
    textarea: ta,
    getValue: () => ta.value,
    setValue(v) {
      ta.value = v;
      Object.keys(markLines).forEach((k) => (markLines[k] = null));
      render();
      emitChange();
    },
    insert,
    focus: () => ta.focus(),
    setMark(kind, line) {
      markLines[kind] = line || null;
      placeMarks();
    },
    clearMarks() {
      Object.keys(markLines).forEach((k) => (markLines[k] = null));
      placeMarks();
    },
    scrollToLine(line) {
      const lh = lineHeight();
      const top = (line - 1) * lh;
      const view = scroll.clientHeight;
      if (top < scroll.scrollTop || top + lh > scroll.scrollTop + view) scroll.scrollTop = Math.max(0, top - view / 3);
    },
    setReadOnly(b) {
      ta.readOnly = !!b;
      root.classList.toggle('is-readonly', !!b);
    },
    onChange(fn) {
      changeHandlers.add(fn);
      return () => changeHandlers.delete(fn);
    },
    refresh: render,
  };
  root.editor = api;
  return api;
}
