// Turns a parsed lesson document into DOM: prose, code examples, callouts, exercises and
// inline questions. Returns the element plus a table of contents.

import { h, copyText } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { renderMarkdown, splitBlocks } from '../lib/markdown.js';
import { highlight } from '../lib/highlight.js';
import { parseInfo } from '../lib/doc.js';
import { createRunBlock } from './runblock.js';
import { createTraceBlock } from './tracer.js';
import { createExercise } from './exercise.js';
import { createQuestion } from './question.js';
import { toast } from './toast.js';

const CALLOUT = {
  tip: { icon: 'bulb', title: 'Tip' },
  warn: { icon: 'warn', title: 'Watch out' },
  note: { icon: 'info', title: 'Note' },
  key: { icon: 'key', title: 'Key idea' },
};

export function staticCode(code, { lang = 'python', label = '' } = {}) {
  const isPy = lang === 'python' || lang === 'py';
  const pre = h('pre.code-static', { dataset: { lang } }, h('code', { html: isPy ? highlight(code) : escapeHtml(code) }));
  const copy = h(
    'button.cb-copy.btn.btn-ghost.btn-icon',
    {
      type: 'button',
      title: 'Copy code',
      'aria-label': 'Copy code',
      onclick: async () => {
        if (await copyText(code)) toast('Code copied', { icon: 'check' });
      },
    },
    icon('copy', 15)
  );
  return h('figure.codeblock', label ? h('figcaption.cb-label', label) : null, copy, pre);
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderDoc(doc, { key }) {
  const root = h('div.doc');
  const mdState = { ids: new Map() };
  const files = {};
  for (const n of doc.nodes) if (n.type === 'container' && n.name === 'file') files[n.args[0] || n.head] = n.main + '\n';

  const exercises = [];
  const questions = [];

  for (const node of doc.nodes) {
    if (node.type === 'md') {
      for (const part of splitBlocks(node.text)) {
        if (part.type === 'prose') {
          root.appendChild(h('div.prose', { html: renderMarkdown(part.text, mdState) }));
          continue;
        }
        const info = parseInfo(part.info);
        const lang = info.lang || 'text';
        if ((lang === 'python' || lang === 'py') && info.flags.has('run')) {
          root.appendChild(createRunBlock({ code: part.code, stdin: info.attrs.stdin || '', files, failsOnPurpose: info.flags.has('error'), label: info.attrs.file || 'main.py', caption: info.attrs.caption || '' }));
        } else if ((lang === 'python' || lang === 'py') && info.flags.has('trace')) {
          root.appendChild(createTraceBlock({ code: part.code, stdin: info.attrs.stdin || '', files, label: info.attrs.title || 'Step through this code' }));
        } else if (lang === 'output' || lang === 'text' || lang === 'console') {
          root.appendChild(h('figure.codeblock.is-output', h('figcaption.cb-label', lang === 'output' ? 'Output' : lang === 'console' ? 'Console' : 'Text'), h('pre.code-static.output', h('code', part.code))));
        } else {
          root.appendChild(staticCode(part.code, { lang: lang === 'py' ? 'python' : lang, label: info.attrs.file || '' }));
        }
      }
      continue;
    }
    if (node.type !== 'container') continue;
    if (CALLOUT[node.name]) {
      const c = CALLOUT[node.name];
      root.appendChild(
        h('aside.callout.is-' + node.name, { role: 'note' }, h('div.callout-icon', icon(c.icon, 20)), h('div.callout-body', h('strong.callout-title', node.args[0] || c.title), h('div.prose', { html: renderMarkdown(node.main, mdState) })))
      );
    } else if (node.name === 'exercise') {
      const el = createExercise(node, { key, files });
      exercises.push(el);
      root.appendChild(el);
    } else if (node.name === 'question') {
      const el = createQuestion(node, { key, mode: 'inline' });
      questions.push(el);
      root.appendChild(el);
    }
  }

  const toc = [];
  root.querySelectorAll('.prose > h2').forEach((el) => toc.push({ id: el.id, text: el.textContent, el }));
  exercises.forEach((el) => toc.push({ id: el.id, text: el.querySelector('h3').textContent, el, exercise: true }));
  toc.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  return { el: root, toc, exercises, questions, files };
}
