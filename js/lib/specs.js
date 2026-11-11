// Pure helpers that turn parsed content blocks into plain data objects. They have no DOM
// dependencies, so the browser UI (ui/exercise.js, ui/question.js) and the Node validator
// (tools/validate.mjs) read exercises and questions in exactly the same way.

import { getSection, getSections, parseKV } from './doc.js';

export function exerciseSpec(node) {
  const files = {};
  for (const s of getSections(node, 'file')) files[s.arg] = s.text + '\n';
  return {
    id: node.args[0],
    title: node.args[1] || 'Exercise',
    prompt: node.main,
    starter: getSection(node, 'starter') ?? '',
    solution: getSection(node, 'solution') ?? '',
    tests: getSection(node, 'tests') ?? '',
    hints: getSections(node, 'hint').map((s) => s.text),
    stdin: getSection(node, 'stdin') ?? '',
    files,
    config: parseKV(getSection(node, 'config') || ''),
  };
}

export function questionSpec(node) {
  const type = (node.args[1] || 'choice').toLowerCase();
  const choices = getSections(node, 'choice').map((s) => ({ text: s.text, correct: /\bcorrect\b/i.test(s.arg) }));
  const lines = (getSection(node, 'lines') ?? '').split('\n');
  return {
    id: node.args[0],
    type,
    prompt: node.main,
    choices,
    answer: getSection(node, 'answer') ?? '',
    lines: lines.filter((l) => l.trim() !== ''),
    distractors: (getSection(node, 'distractors') ?? '').split('\n').filter((l) => l.trim() !== ''),
    explain: getSection(node, 'explain') ?? '',
    stdin: getSection(node, 'stdin') ?? '',
    expected: getSection(node, 'expected'),
  };
}

export const normalizeOutput = (s) =>
  String(s ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .trim();

/** Fill-in-the-blank answers: one line per blank, alternatives separated by "|". */
export const blankAnswers = (answerText) =>
  answerText
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((l) => l.split('|').map((a) => a.trim()));

/** Plain-text version of the right answer (for quiz review screens). */
export function correctAnswerText(spec) {
  if (spec.type === 'choice' || spec.type === 'multi') return spec.choices.filter((c) => c.correct).map((c) => c.text).join(' / ');
  if (spec.type === 'predict') return spec.answer;
  if (spec.type === 'fill') return blankAnswers(spec.answer).map((a, i) => `${i + 1}: ${a[0]}`).join('   ');
  if (spec.type === 'order') return spec.lines.join('\n');
  return '';
}
