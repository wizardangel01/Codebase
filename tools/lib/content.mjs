// Content validator. Opens every course, module, lesson, quiz, cheat sheet and game and checks
// that it is well formed AND that it works: every runnable code block is executed with the same
// Python host the website uses, every exercise solution must pass its tests (and the starter must
// not), every question must have a consistent answer, and every game level must be winnable.
//
// Used through tools/validate.mjs. All checks report to a Report (problems fail the run,
// warnings are advice).

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './pyhost-node.mjs';
import { parseDoc, parseInfo, stdinLines } from '../../js/lib/doc.js';
import { splitBlocks } from '../../js/lib/markdown.js';
import { exerciseSpec, questionSpec, normalizeOutput, blankAnswers } from '../../js/lib/specs.js';
import { checkGame } from './games.mjs';
import { parseGame } from '../../js/games/levels.js';
import { findLeaks } from './gate.mjs';

let CONTENT = path.join(ROOT, 'content');
/** Where in the course the file being checked sits: the concept gate allows only earlier ideas. */
const GATE = { module: 0, lesson: 0 };
const LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
const QUESTION_TYPES = new Set(['choice', 'multi', 'predict', 'fill', 'order']);
const KNOWN_LANGS = new Set(['python', 'py', 'output', 'text', 'console', 'bash', 'sh', 'json', 'csv', 'html', 'css', 'js', 'javascript', 'yaml', 'toml', 'ini', 'diff', 'sql', 'md', 'markdown']);
const PY = new Set(['python', 'py']);
const ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export class Report {
  constructor() {
    this.problems = [];
    this.warnings = [];
    this.notes = [];
    this.stats = {};
  }
  problem(where, message) {
    this.problems.push({ where, message });
  }
  warn(where, message) {
    this.warnings.push({ where, message });
  }
  note(message) {
    this.notes.push(message);
  }
  count(key, n = 1) {
    this.stats[key] = (this.stats[key] || 0) + n;
  }
}

const readJson = (file, rep, where) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    rep.problem(where, `cannot read JSON: ${e.message}`);
    return null;
  }
};
const exists = (p) => fs.existsSync(p);
const rel = (p) => path.relative(CONTENT, p).split(path.sep).join('/');
const brief = (s, n = 90) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};

/** 1-based line of the n-th occurrence of `needle` inside a markdown node, for error messages. */
function lineIn(node, cursor, needle) {
  const idx = node.text.indexOf(needle, cursor.pos);
  if (idx === -1) return node.line;
  cursor.pos = idx + needle.length;
  return node.line + node.text.slice(0, idx).split('\n').length - 1;
}

// ---------------------------------------------------------------------------------------------
// Style rules from docs/AUTHORING.md that a machine can check
// ---------------------------------------------------------------------------------------------
const STYLE_RULES = [
  { id: 'feel', re: /\b(simply|obviously|trivial|trivially|of course|easy|easily|just)\b/gi, msg: 'words that can make a struggling learner feel stupid. Rewrite the sentence without them' },
  {
    id: 'us',
    re: /\b(color|colors|colored|coloring|behavior|behaviors|organize|organizes|organized|organizing|organization|initialize|initializes|initialized|initializing|initialization|recognize|recognizes|recognized|recognizing|center|centers|centered|favorite|favorites|analyze|analyzes|analyzed|customize|customized|optimize|optimized|optimizing|optimization|summarize|summarized|visualize|visualizes|visualized|visualization|neighbor|neighbors|gray|catalog|fulfill)\b/gi,
    msg: 'American spelling. The course uses British English (colour, behaviour, organise, centre)',
  },
  { id: 'dash', re: /[—–]/g, msg: 'em or en dashes. Use a comma, a colon, a full stop or brackets' },
];

/** Blank out code (so only prose is judged) but keep every newline so line numbers stay right. */
function proseOnly(text) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return String(text ?? '').replace(/```[\s\S]*?```/g, blank).replace(/`[^`\n]*`/g, blank).replace(/https?:\/\/\S+/g, blank);
}

/** Look for style problems in a piece of prose; startLine is the 1-based line where `text` starts. */
function scanStyle(text, startLine, ctx) {
  if (!ctx || !ctx.style) return;
  const clean = proseOnly(text);
  for (const rule of STYLE_RULES) {
    for (const m of clean.matchAll(rule.re)) {
      const line = startLine + (clean.slice(0, m.index).match(/\n/g) || []).length;
      (ctx.style[rule.id] ||= []).push({ word: m[0], line });
    }
  }
}

function reportStyle(ctx, where, rep) {
  for (const rule of STYLE_RULES) {
    const hits = (ctx.style && ctx.style[rule.id]) || [];
    if (!hits.length) continue;
    const shown = hits.slice(0, 6).map((h) => `"${h.word}" (line ${h.line})`).join(', ');
    rep.warn(where, `${hits.length} use(s) of ${rule.msg}: ${shown}${hits.length > 6 ? ', ...' : ''}`);
  }
}

// ---------------------------------------------------------------------------------------------
// The concept gate (see lib/gate.mjs): code may only use ideas the course has already taught
// ---------------------------------------------------------------------------------------------
function pythonFences(text) {
  const out = [];
  for (const part of splitBlocks(String(text ?? ''))) {
    if (part.type === 'prose') continue;
    const info = parseInfo(part.info);
    if (PY.has(info.lang || 'text') && !info.flags.has('preview')) out.push(part.code);
  }
  return out;
}

async function gateSnippets(run, snippets, rep, where) {
  if (!GATE.module || !snippets.length) return;
  rep.count('gatedSnippets', snippets.length);
  let found;
  try {
    found = await findLeaks((code, files) => run.run(code, { files, where: `${where} (teaching-order check)` }), snippets, GATE);
  } catch (e) {
    rep.problem(where, e.message);
    return;
  }
  const byKey = new Map();
  found.forEach((list, i) => {
    for (const f of list) {
      const g = byKey.get(f.key) || { ...f, places: [] };
      g.places.push(snippets[i].what ? snippets[i].what : `line ${f.line}`);
      byKey.set(f.key, g);
    }
  });
  for (const g of byKey.values()) {
    const places = [...new Set(g.places)].slice(0, 5).join(', ');
    rep.warn(where, `teaching order: uses ${g.label} (${places}), but the course only teaches it in module ${g.first[0]}, lesson ${g.first[1]}. Rewrite the code without it, or if this is a deliberate preview mark the fence "python preview".`);
  }
}

// ---------------------------------------------------------------------------------------------
// Python execution helpers
// ---------------------------------------------------------------------------------------------
class Runner {
  constructor(execute, rep) {
    this.execute = execute;
    this.rep = rep;
  }
  async run(code, { stdin = '', files = {}, where = '', seed = null } = {}) {
    this.rep.count('programsRun');
    return this.execute({ mode: 'run', code, stdin: stdinLines(stdin), files, seed }, where);
  }
  async test(code, tests, { stdin = '', files = {}, seed = null, where = '' } = {}) {
    this.rep.count('testRuns');
    return this.execute({ mode: 'test', code, tests, stdin: stdinLines(stdin), files, seed }, where);
  }
  async trace(code, { stdin = '', files = {}, where = '' } = {}) {
    this.rep.count('programsRun');
    return this.execute({ mode: 'trace', code, stdin: stdinLines(stdin), files }, where);
  }
}

const errText = (res) => (res.error ? `${res.error.type}: ${res.error.message}${res.error.line ? ` (line ${res.error.line})` : ''}` : '');

// ---------------------------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------------------------
async function checkQuestion(node, where, run, rep, seen, { lesson = true } = {}) {
  const q = questionSpec(node);
  rep.count('questions');
  if (!q.id || !ID.test(q.id)) rep.problem(where, `question id "${q.id || ''}" must be lower-case words joined by dashes, for example q-print-quote`);
  else if (seen.has(q.id)) rep.problem(where, `duplicate question id "${q.id}"`);
  else seen.add(q.id);
  if (!QUESTION_TYPES.has(q.type)) {
    rep.problem(where, `unknown question type "${q.type}" (use ${[...QUESTION_TYPES].join(', ')})`);
    return;
  }
  if (!q.prompt.trim()) rep.problem(where, `question ${q.id} has no prompt text`);
  if (!q.explain.trim()) rep.warn(where, `question ${q.id} has no "%% explain" section. Explain why the answer is right.`);

  if (q.type === 'choice' || q.type === 'multi') {
    const n = q.choices.length;
    const right = q.choices.filter((c) => c.correct).length;
    if (n < 3) rep.problem(where, `question ${q.id} needs at least three options (has ${n})`);
    if (q.type === 'choice' && right !== 1) rep.problem(where, `question ${q.id} (choice) must have exactly one "%% choice correct" (has ${right})`);
    if (q.type === 'multi') {
      if (right < 2) rep.problem(where, `question ${q.id} (multi) needs at least two correct options (has ${right}). Use type "choice" for a single answer.`);
      if (right === n) rep.problem(where, `question ${q.id} (multi) has no wrong option`);
    }
    const texts = q.choices.map((c) => c.text.trim());
    if (new Set(texts).size !== texts.length) rep.problem(where, `question ${q.id} has two identical options`);
    if (q.choices.some((c) => !c.text.trim())) rep.problem(where, `question ${q.id} has an empty option`);
    return;
  }

  const fence = splitBlocks(q.prompt).find((b) => b.type === 'fence');
  if (q.type === 'predict') {
    if (!fence) return rep.problem(where, `question ${q.id} (predict) needs a python code block in the prompt`);
    if (!q.answer.trim()) return rep.problem(where, `question ${q.id} (predict) has no "%% answer" section`);
    const res = await run.run(fence.code, { stdin: q.stdin, where: `${where} ${q.id}` });
    if (res.error) return rep.problem(where, `question ${q.id}: the code block raises ${errText(res)}. Predict questions must run cleanly.`);
    if (normalizeOutput(res.stdout) !== normalizeOutput(q.answer)) rep.problem(where, `question ${q.id}: the code prints\n${indent(normalizeOutput(res.stdout))}\nbut the answer says\n${indent(normalizeOutput(q.answer))}`);
    return;
  }
  if (q.type === 'fill') {
    if (!fence) return rep.problem(where, `question ${q.id} (fill) needs a python code block with ___ blanks in the prompt`);
    const blanks = (fence.code.match(/___/g) || []).length;
    const answers = blankAnswers(q.answer);
    if (!blanks) return rep.problem(where, `question ${q.id} (fill) has no ___ blank in its code block`);
    if (blanks !== answers.length) return rep.problem(where, `question ${q.id} (fill) has ${blanks} blank(s) but ${answers.length} answer line(s)`);
    let i = 0;
    const code = fence.code.replace(/___/g, () => answers[i++][0]);
    const res = await run.run(code, { stdin: q.stdin, where: `${where} ${q.id}` });
    if (res.error) return rep.problem(where, `question ${q.id}: with the first answers filled in, the code raises ${errText(res)}`);
    if (q.expected !== undefined && normalizeOutput(res.stdout) !== normalizeOutput(q.expected)) rep.problem(where, `question ${q.id}: the completed code prints\n${indent(normalizeOutput(res.stdout))}\nbut "%% expected" says\n${indent(normalizeOutput(q.expected))}`);
    return;
  }
  if (q.type === 'order') {
    if (q.lines.length < 3) return rep.problem(where, `question ${q.id} (order) needs at least three lines under "%% lines"`);
    const clash = q.distractors.filter((d) => q.lines.includes(d));
    if (clash.length) rep.problem(where, `question ${q.id} (order): a distractor is also a real line: ${brief(clash[0])}`);
    const res = await run.run(q.lines.join('\n'), { stdin: q.stdin, where: `${where} ${q.id}` });
    if (res.error) return rep.problem(where, `question ${q.id} (order): the lines in the stated order raise ${errText(res)}`);
    if (q.expected !== undefined && normalizeOutput(res.stdout) !== normalizeOutput(q.expected)) rep.problem(where, `question ${q.id} (order): the program prints\n${indent(normalizeOutput(res.stdout))}\nbut "%% expected" says\n${indent(normalizeOutput(q.expected))}`);
  }
}

const indent = (t) => String(t).split('\n').map((l) => '      | ' + l).join('\n');

/** The code inside a question, as runnable text, for the concept gate. */
function questionCode(q) {
  if (q.type === 'order') return [q.lines.join('\n')];
  const fences = pythonFences(q.prompt);
  if (q.type !== 'fill') return fences;
  const answers = blankAnswers(q.answer);
  return fences.map((code) => {
    let i = 0;
    return code.replace(/___/g, () => (answers[i++] || ['x'])[0]);
  });
}

/** Style-scan everything a learner reads in a question. */
function scanQuestion(q, line, ctx) {
  scanStyle(q.prompt, line, ctx);
  scanStyle(q.explain, line, ctx);
  for (const c of q.choices) scanStyle(c.text, line, ctx);
}

// ---------------------------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------------------------
async function checkExercise(node, where, run, rep, seen, files) {
  const ex = exerciseSpec(node);
  rep.count('exercises');
  const w = `${where} ${ex.id || '?'}`;
  if (!ex.id || !ID.test(ex.id)) rep.problem(where, `exercise id "${ex.id || ''}" must be lower-case words joined by dashes`);
  else if (seen.has(ex.id)) rep.problem(where, `duplicate exercise id "${ex.id}"`);
  else seen.add(ex.id);
  if (!node.args[1]) rep.warn(w, 'the exercise has no title. Write "%% exercise id | Title".');
  if (!ex.prompt.trim()) rep.problem(w, 'the exercise has no prompt text');
  if (!ex.solution.trim()) return rep.problem(w, 'the exercise has no "%% solution" section');
  if (!ex.tests.trim()) return rep.problem(w, 'the exercise has no "%% tests" section');
  if (ex.hints.length === 0) rep.problem(w, 'the exercise has no hints. Add two or three "%% hint" sections.');
  else if (ex.hints.length < 2) rep.warn(w, 'only one hint. Two or three progressive hints work best.');
  const all = { ...files, ...ex.files };
  const seed = ex.config.seed ?? null;

  const sol = await run.test(ex.solution, ex.tests, { stdin: ex.stdin, files: all, seed, where: w + ' (solution)' });
  if (!sol.tests_ok) {
    const failing = (sol.tests || []).filter((t) => !t.ok).map((t) => `${t.label}${t.detail ? ': ' + brief(t.detail, 140) : ''}`);
    rep.problem(w, `the solution does not pass its own tests${sol.error ? ` (${errText(sol)})` : ''}${failing.length ? '\n      ' + failing.slice(0, 4).join('\n      ') : ''}`);
    return;
  }
  const checks = (sol.tests || []).length;
  if (checks < 2) rep.warn(w, `only ${checks} check. Several small checks give the learner clearer feedback.`);

  if (!ex.config.starter_passes) {
    const st = await run.test(ex.starter, ex.tests, { stdin: ex.stdin, files: all, seed, where: w + ' (starter)' });
    if (st.tests_ok) rep.problem(w, 'the starter code already passes the tests, so the exercise is already solved. Make the tests stricter or the starter emptier.');
    if (ex.starter.trim()) {
      const empty = await run.test('', ex.tests, { stdin: ex.stdin, files: all, seed, where: w + ' (empty)' });
      if (empty.tests_ok) rep.problem(w, 'an empty program passes the tests');
    }
  }
  // the solution should not rely on a leaked hint
  const sourceLines = ex.solution.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).length;
  if (sourceLines > 40) rep.warn(w, `the solution is ${sourceLines} lines long. Consider a smaller exercise.`);
}

// ---------------------------------------------------------------------------------------------
// Markdown blocks: code examples
// ---------------------------------------------------------------------------------------------
async function checkMarkdown(node, where, run, rep, ctx) {
  const parts = splitBlocks(node.text);
  const cursor = { pos: 0 };
  let prev = null;
  for (const part of parts) {
    if (part.type === 'prose') {
      lintProse(part.text, where, node, rep, ctx);
      const at = node.text.indexOf(part.text, cursor.pos);
      scanStyle(part.text, node.line + (at > 0 ? node.text.slice(0, at).split('\n').length - 1 : 0), ctx);
      prev = null;
      continue;
    }
    const line = lineIn(node, cursor, part.fence + part.info);
    const w = `${where}:${line}`;
    const info = parseInfo(part.info);
    const lang = info.lang || 'text';
    if (PY.has(lang) && !info.flags.has('preview') && ctx.snips) ctx.snips.push({ code: part.code, base: line });
    if (!KNOWN_LANGS.has(lang) && lang !== 'text') rep.warn(w, `code block language "${lang}" is not one the highlighter knows`);
    if (PY.has(lang)) {
      const flags = info.flags;
      for (const f of flags) if (!['run', 'trace', 'error', 'nocheck', 'preview'].includes(f)) rep.warn(w, `unknown code block flag "${f}"`);
      if (flags.has('run') && flags.has('trace')) rep.problem(w, 'a code block cannot have both "run" and "trace"');
      const stdin = info.attrs.stdin || '';
      if (flags.has('trace')) {
        rep.count('traceBlocks');
        const res = await run.trace(part.code, { stdin, files: ctx.files, where: w });
        if (res.error) rep.problem(w, `the trace example raises ${errText(res)}`);
        else if (res.trace_truncated) rep.warn(w, 'the trace example is too long to show in full. Shorten it.');
        else if ((res.steps || []).length < 4) rep.warn(w, 'the trace example is too short to be worth stepping through');
        prev = null;
      } else if (flags.has('run')) {
        rep.count('runBlocks');
        ctx.runBlocks++;
        const res = await run.run(part.code, { stdin, files: ctx.files, where: w });
        if (flags.has('error')) {
          if (!res.error) rep.problem(w, 'this example is marked "error" (it should fail) but it ran without an error');
        } else if (res.error) rep.problem(w, `the example raises ${errText(res)}. If it should fail, mark the fence "python run error".`);
        prev = { python: true, ran: true, res, flags, line };
      } else {
        prev = { python: true, ran: false, code: part.code, info, flags, line, stdin };
      }
    } else if (lang === 'output') {
      if (prev && prev.python && !prev.flags.has('error') && !prev.flags.has('nocheck')) {
        if (!prev.ran) {
          prev.res = await run.run(prev.code, { stdin: prev.stdin, files: ctx.files, where: w + ' (output check)' });
          prev.ran = true;
          rep.count('outputBlocks');
          if (prev.res.error) {
            rep.problem(`${where}:${prev.line}`, `this code is followed by an output block, so it was run, but it raises ${errText(prev.res)}. Make the snippet complete, or add "nocheck" to its fence.`);
            prev = null;
            continue;
          }
        } else rep.count('outputBlocks');
        if (!prev.res.error && normalizeOutput(prev.res.stdout) !== normalizeOutput(part.code)) {
          rep.problem(w, `the output block does not match what the code above prints.\n    the code prints:\n${indent(normalizeOutput(prev.res.stdout))}\n    the block shows:\n${indent(normalizeOutput(part.code))}`);
        }
      }
      prev = null;
    } else prev = null;
  }
}

function lintProse(text, where, node, rep, ctx) {
  const words = text.replace(/`[^`]*`/g, ' ').split(/\s+/).filter(Boolean).length;
  ctx.words += words;
  if (/\bTODO\b|\bFIXME\b|\bXXX\b/.test(text)) rep.problem(where, 'leftover TODO/FIXME text');
  if (/^%%/m.test(text)) rep.problem(where, 'a line starts with %% inside prose (unknown directive?)');
  if (/—/.test(text)) ctx.emDashes++;
  for (const m of text.matchAll(/\]\((#\/[^)\s]*)\)/g)) ctx.links.push({ where, href: m[1] });
  if (/!\[[^\]]*\]\((?!https?:|\.|\/|data:)/.test(text)) rep.warn(where, 'image path should be relative to the lesson or an absolute https URL');
}

// ---------------------------------------------------------------------------------------------
// Lessons, quizzes, cheat sheets
// ---------------------------------------------------------------------------------------------
async function checkLesson(file, lesson, run, rep, links) {
  const where = rel(file);
  const doc = parseDoc(fs.readFileSync(file, 'utf8'), { file: where });
  rep.count('lessons');
  for (const e of doc.errors) rep.problem(`${where}:${e.line}`, `format: ${e.message}`);
  if (!doc.meta.title) rep.warn(where, 'no "title:" in the front matter');
  else if (lesson && lesson.title && doc.meta.title !== lesson.title) rep.warn(where, `front matter title "${doc.meta.title}" differs from module.json title "${lesson.title}"`);
  const files = {};
  for (const n of doc.nodes) if (n.type === 'container' && n.name === 'file') files[n.args[0] || n.head] = n.main + '\n';
  const ctx = { files, words: 0, runBlocks: 0, emDashes: 0, links, snips: [], style: {} };
  const exSeen = new Set();
  const qSeen = new Set();
  let exercises = 0;
  let questions = 0;
  let headings = 0;
  for (const node of doc.nodes) {
    if (node.type === 'md') {
      headings += (node.text.match(/^## /gm) || []).length;
      await checkMarkdown(node, where, run, rep, ctx);
    } else if (node.type === 'container') {
      const w = `${where}:${node.line}`;
      if (node.name === 'exercise') {
        exercises++;
        await checkExercise(node, w, run, rep, exSeen, files);
        const ex = exerciseSpec(node);
        ctx.words += ex.prompt.split(/\s+/).length;
        ctx.snips.push({ code: ex.starter, base: 0, what: `exercise ${ex.id}, starter code` }, { code: ex.solution, base: 0, what: `exercise ${ex.id}, solution` });
        scanStyle(ex.prompt, node.line, ctx);
        for (const hint of ex.hints) scanStyle(hint, node.line, ctx);
      } else if (node.name === 'question') {
        questions++;
        await checkQuestion(node, w, run, rep, qSeen);
        const q = questionSpec(node);
        for (const code of questionCode(q)) ctx.snips.push({ code, base: 0, what: `question ${q.id}` });
        scanQuestion(q, node.line, ctx);
      } else if (['tip', 'warn', 'note', 'key'].includes(node.name)) {
        if (!node.main.trim()) rep.problem(w, `empty "${node.name}" callout`);
        lintProse(node.main, w, { line: node.line, text: node.main }, rep, ctx);
        scanStyle(node.main, node.line, ctx);
      } else if (node.name === 'file') {
        if (!node.args[0] && !node.head) rep.problem(w, '"%% file" needs a file name');
      } else rep.warn(w, `block "%% ${node.name}" is not used in lessons`);
    }
  }
  if (!headings) rep.warn(where, 'no "## " section headings');
  if (ctx.words < 750) rep.warn(where, `only about ${ctx.words} words of prose. Lessons should teach in some depth (aim for 1,000 to 1,800).`);
  if (ctx.runBlocks < 5) rep.warn(where, `only ${ctx.runBlocks} runnable example(s). Let learners run code often (aim for 6 to 12).`);
  if (exercises < 3) rep.warn(where, `only ${exercises} exercise(s). Aim for three or four: one warm-up, one or two standard, one challenge.`);
  if (questions < 2) rep.warn(where, `only ${questions} inline question(s). Aim for at least two "check yourself" questions.`);
  if (ctx.emDashes > 3) rep.warn(where, `${ctx.emDashes} em dashes found. Prefer commas, colons or full stops.`);
  if (!/^## What you learned/m.test(fs.readFileSync(file, 'utf8'))) rep.warn(where, 'no "## What you learned" recap at the end');
  const minutes = lesson && lesson.minutes;
  if (minutes && exercises + ctx.runBlocks > 0) {
    const est = Math.round(ctx.words / 180 + exercises * 4 + questions + ctx.runBlocks * 0.4);
    if (minutes < est * 0.5 || minutes > est * 2.2) rep.warn(where, `module.json says ${minutes} minutes but the content suggests about ${est}`);
  }
  await gateSnippets(run, ctx.snips, rep, where);
  reportStyle(ctx, where, rep);
  return { exercises, questions };
}

async function checkQuiz(file, mod, run, rep, links) {
  const where = rel(file);
  const doc = parseDoc(fs.readFileSync(file, 'utf8'), { file: where });
  rep.count('quizzes');
  for (const e of doc.errors) rep.problem(`${where}:${e.line}`, `format: ${e.message}`);
  const pass = doc.meta.pass;
  if (pass === undefined) rep.warn(where, 'no "pass:" percentage in the front matter (default 70)');
  else if (typeof pass !== 'number' || pass < 50 || pass > 100) rep.problem(where, `"pass" should be a number from 50 to 100 (is ${JSON.stringify(pass)})`);
  const seen = new Set();
  const types = {};
  const ctx = { words: 0, emDashes: 0, links, snips: [], style: {} };
  let n = 0;
  for (const node of doc.nodes) {
    if (node.type === 'md') {
      lintProse(node.text, where, node, rep, ctx);
      scanStyle(node.text, node.line, ctx);
    } else if (node.type === 'container') {
      const w = `${where}:${node.line}`;
      if (node.name !== 'question') rep.warn(w, `block "%% ${node.name}" is not used in quizzes`);
      else {
        n++;
        const q = questionSpec(node);
        types[q.type] = (types[q.type] || 0) + 1;
        await checkQuestion(node, w, run, rep, seen, { lesson: false });
        for (const code of questionCode(q)) ctx.snips.push({ code, base: 0, what: `question ${q.id}` });
        scanQuestion(q, node.line, ctx);
      }
    }
  }
  await gateSnippets(run, ctx.snips, rep, where);
  reportStyle(ctx, where, rep);
  if (n < 5) rep.problem(where, `a quiz needs at least five questions (has ${n})`);
  else if (n < 8) rep.warn(where, `only ${n} questions. Aim for 8 to 12 so the quiz covers the whole module.`);
  if (n >= 6 && Object.keys(types).length < 3) rep.warn(where, `question types used: ${Object.keys(types).join(', ')}. Mix at least three types.`);
  const choiceCount = types.choice || 0;
  if (n >= 6 && choiceCount / n > 0.6) rep.warn(where, 'more than 60% of the questions are single-choice. Add predict, fill or order questions.');
}

async function checkCheatsheet(file, rep, links, run) {
  const where = rel(file);
  const doc = parseDoc(fs.readFileSync(file, 'utf8'), { file: where });
  rep.count('cheatsheets');
  for (const e of doc.errors) rep.problem(`${where}:${e.line}`, `format: ${e.message}`);
  const text = doc.nodes.filter((n) => n.type === 'md').map((n) => n.text).join('\n');
  if (text.split(/\s+/).length < 60) rep.warn(where, 'the cheat sheet is very short');
  if (!/```python/.test(text)) rep.warn(where, 'the cheat sheet has no python code examples');
  const ctx = { words: 0, emDashes: 0, links, snips: [], style: {} };
  lintProse(text, where, { line: 1, text }, rep, ctx);
  scanStyle(text, 1, ctx);
  if (run) {
    const cheatDoc = parseDoc(fs.readFileSync(file, 'utf8'), { file: where });
    for (const node of cheatDoc.nodes) if (node.type === 'md') for (const code of pythonFences(node.text)) ctx.snips.push({ code, base: 0, what: 'a code block' });
    await gateSnippets(run, ctx.snips, rep, where);
  }
  reportStyle(ctx, where, rep);
}

// ---------------------------------------------------------------------------------------------
// Course / module structure
// ---------------------------------------------------------------------------------------------
function checkModuleJson(mod, dir, courseLines, rep) {
  const where = rel(path.join(dir, 'module.json'));
  const need = (k, test, msg) => {
    if (!test(mod[k])) rep.problem(where, `"${k}" ${msg}`);
  };
  need('title', (v) => typeof v === 'string' && v.trim(), 'must be a non-empty string');
  need('summary', (v) => typeof v === 'string' && v.length >= 40, 'must be a sentence of at least 40 characters');
  if (!LEVELS.has(mod.level)) rep.problem(where, `"level" must be one of ${[...LEVELS].join(', ')}`);
  if (!Array.isArray(mod.outcomes) || mod.outcomes.length < 3) rep.problem(where, '"outcomes" must list at least three things the learner can do afterwards');
  else if (mod.outcomes.some((o) => typeof o !== 'string' || o.length < 12)) rep.warn(where, 'an outcome is very short. Write full statements such as "Use a for loop to repeat work".');
  if (mod.line && courseLines && !courseLines.has(mod.line)) rep.warn(where, `"line" ${mod.line} is not a line in course.json`);
  if (!Array.isArray(mod.lessons) || !mod.lessons.length) {
    rep.problem(where, '"lessons" must list at least one lesson');
    return;
  }
  if (mod.lessons.length < 3) rep.warn(where, `only ${mod.lessons.length} lesson(s). Most modules need three to five.`);
  const ids = new Set();
  for (const l of mod.lessons) {
    if (!l.id || !ID.test(l.id)) rep.problem(where, `lesson id "${l.id}" must be lower-case words joined by dashes`);
    if (ids.has(l.id)) rep.problem(where, `duplicate lesson id "${l.id}"`);
    ids.add(l.id);
    if (!l.title) rep.problem(where, `lesson ${l.id} has no title`);
    if (!l.summary || l.summary.length < 20) rep.warn(where, `lesson ${l.id} needs a one-sentence summary`);
    if (!Number.isFinite(l.minutes) || l.minutes < 5 || l.minutes > 60) rep.warn(where, `lesson ${l.id}: "minutes" should be a number from 5 to 60`);
  }
  if (mod.game) {
    if (!mod.gameTitle) rep.problem(where, '"gameTitle" is required when the module has a game');
    if (!mod.gameSummary) rep.problem(where, '"gameSummary" is required when the module has a game');
  } else rep.warn(where, 'the module has no game. Every module should end with one.');
  if (!mod.quiz) rep.warn(where, 'the module has no quiz');
  if (!mod.cheatsheet) rep.warn(where, 'the module has no cheat sheet');
}

export async function validateContent(execute, options = {}) {
  const { filters = [], run = true, strict = false, games = true, log = () => {}, contentDir = path.join(ROOT, 'content'), playground = true } = options;
  CONTENT = contentDir;
  const rep = new Report();
  const runner = new Runner(execute, rep);
  const links = [];
  const known = { modules: new Map(), courses: new Set() };
  const wanted = (p) => !filters.length || filters.some((f) => p.startsWith(f) || f.startsWith(p));

  const index = readJson(path.join(CONTENT, 'courses.json'), rep, 'courses.json');
  if (!index || !Array.isArray(index.courses)) {
    rep.problem('courses.json', 'must be { "courses": ["python"] }');
    return rep;
  }
  let missing = 0;
  for (const cid of index.courses) {
    const cdir = path.join(CONTENT, cid);
    const course = readJson(path.join(cdir, 'course.json'), rep, `${cid}/course.json`);
    if (!course) continue;
    known.courses.add(cid);
    if (!course.title) rep.problem(`${cid}/course.json`, 'missing "title"');
    if (!course.subtitle) rep.warn(`${cid}/course.json`, 'missing "subtitle"');
    const lineIds = new Set();
    const seenModules = new Set();
    for (const line of course.lines || []) {
      if (!line.id || !line.title || !line.summary) rep.problem(`${cid}/course.json`, `each line needs id, title and summary (${JSON.stringify(line.id)})`);
      lineIds.add(line.id);
      for (const mid of line.modules || []) {
        if (seenModules.has(mid)) rep.problem(`${cid}/course.json`, `module ${mid} is listed twice`);
        seenModules.add(mid);
      }
    }
    if (!(course.lines || []).length && !course.modules) rep.problem(`${cid}/course.json`, 'needs "lines" with "modules" lists');
    for (const mid of [...seenModules]) known.modules.set(`${cid}/${mid}`, { lessons: new Set() });

    for (const mid of seenModules) {
      const mdir = path.join(cdir, mid);
      const mpath = `${cid}/${mid}`;
      if (!wanted(`content/${mpath}`)) continue;
      if (!exists(path.join(mdir, 'module.json'))) {
        missing++;
        if (strict) rep.problem(mpath, 'module is listed in course.json but has no module.json');
        continue;
      }
      log(`  ${mpath}`);
      rep.count('modules');
      GATE.module = [...seenModules].indexOf(mid) + 1;
      GATE.lesson = 0;
      const mod = readJson(path.join(mdir, 'module.json'), rep, `${mpath}/module.json`);
      if (!mod) continue;
      if (mod.status === 'soon' && !filters.some((f) => f.startsWith(`content/${mpath}`))) {
        log(`  ${mpath} is marked "status": "soon" (not published yet), skipped. Name it to check it: validate.mjs ${cid}/${mid}`);
        rep.count('modules', -1);
        continue;
      }
      checkModuleJson(mod, mdir, lineIds, rep);
      const rec = known.modules.get(mpath);
      for (const l of mod.lessons || []) rec.lessons.add(l.id);
      rec.quiz = !!mod.quiz;
      rec.game = !!mod.game;
      let lessonNo = 0;
      for (const l of mod.lessons || []) {
        lessonNo++;
        GATE.lesson = lessonNo;
        const f = path.join(mdir, l.file || `${l.id}.md`);
        if (!exists(f)) {
          rep.problem(`${mpath}/module.json`, `lesson file ${rel(f)} is missing`);
          continue;
        }
        if (run) await checkLesson(f, l, runner, rep, links);
        else {
          const doc = parseDoc(fs.readFileSync(f, 'utf8'));
          doc.errors.forEach((e) => rep.problem(`${rel(f)}:${e.line}`, `format: ${e.message}`));
          rep.count('lessons');
        }
      }
      GATE.lesson = 99; // the quiz, cheat sheet and game come after every lesson of the module
      for (const kind of ['quiz', 'cheatsheet', 'game']) {
        if (!mod[kind]) continue;
        if (kind === 'game' && !games) continue; // --no-games: somebody else may still be writing it
        const f = path.join(mdir, mod[kind]);
        if (!exists(f)) {
          rep.problem(`${mpath}/module.json`, `${kind} file ${rel(f)} is missing`);
          continue;
        }
        if (kind === 'quiz' && run) await checkQuiz(f, mod, runner, rep, links);
        else if (kind === 'cheatsheet') await checkCheatsheet(f, rep, links, run ? runner : null);
        else if (kind === 'game' && run && games) {
          rep.count('games');
          const grep = await checkGame(execute, fs.readFileSync(f, 'utf8'), rel(f));
          rep.count('gameLevels', grep.levels.length);
          for (const p of grep.problems) rep.problem(rel(f), p);
          for (const w of grep.warnings) rep.warn(rel(f), w);
          if (mod.gameTitle && grep.title && grep.title !== mod.gameTitle) rep.warn(rel(f), `game title "${grep.title}" differs from module.json gameTitle "${mod.gameTitle}"`);
          if (grep.levels.length && grep.levels.length < 5) rep.warn(rel(f), `only ${grep.levels.length} levels. Aim for six to ten, from easy to hard.`);
          const gdoc = parseDoc(fs.readFileSync(f, 'utf8'), { file: rel(f) });
          const game = parseGame(gdoc);
          const gctx = { snips: [], style: {} };
          scanStyle(game.intro, 1, gctx);
          for (const lv of game.levels) {
            gctx.snips.push({ code: lv.starter, base: 0, what: `level ${lv.id}, starter code` }, { code: lv.solution, base: 0, what: `level ${lv.id}, solution` });
            scanStyle(lv.briefing, lv.line, gctx);
            for (const hint of lv.hints) scanStyle(hint, lv.line, gctx);
          }
          await gateSnippets(runner, gctx.snips, rep, rel(f));
          reportStyle(gctx, rel(f), rep);
        }
      }
    }
  }
  if (missing) rep.note(`${missing} module(s) are listed in course.json but not written yet.`);

  // playground examples
  if (run && playground && !filters.length) {
    try {
      const { EXAMPLES } = await import(pathToFileURL(path.join(ROOT, 'js', 'examples.js')).href);
      for (const ex of EXAMPLES) {
        rep.count('playgroundExamples');
        const res = await runner.run(ex.code, { stdin: ex.stdin || '', where: `playground ${ex.id}` });
        if (res.error) rep.problem(`js/examples.js`, `playground example "${ex.id}" raises ${errText(res)}`);
      }
    } catch (e) {
      rep.problem('js/examples.js', `cannot load: ${e.message}`);
    }
  }

  // internal links
  for (const { where, href } of links) {
    const p = href.replace(/^#/, '').split('?')[0].replace(/\/$/, '');
    const parts = p.split('/').filter(Boolean);
    let ok = false;
    if (['play', 'progress', 'help'].includes(parts[0]) && parts.length === 1) ok = true;
    else if (parts[0] === 'certificate' && parts.length === 2) ok = known.courses.has(parts[1]);
    else if (parts[0] === 'c' && known.courses.has(parts[1])) {
      if (parts.length === 2) ok = true;
      else {
        const m = known.modules.get(`${parts[1]}/${parts[2]}`);
        if (m) ok = parts.length === 3 || (parts.length === 4 && (m.lessons.has(parts[3]) || (parts[3] === 'quiz' && m.quiz) || (parts[3] === 'game' && m.game)));
        else if (parts.length === 3) ok = false;
      }
    }
    if (!ok) rep.problem(where, `link ${href} does not lead to a page that exists`);
  }
  return rep;
}

export function printReport(rep, log = console.log, { failOnWarn = false } = {}) {
  const group = (list) => {
    const by = new Map();
    for (const x of list) {
      const key = x.where.split(':')[0].split(' ')[0];
      (by.get(key) || by.set(key, []).get(key)).push(x);
    }
    return by;
  };
  for (const [file, list] of group(rep.problems)) {
    log(`\nPROBLEMS in ${file}`);
    for (const x of list) log(`  ✗ ${x.where}: ${x.message}`);
  }
  if (rep.warnings.length) {
    log(failOnWarn ? '\nWarnings (these fail the run, because of --fail-on-warn)' : '\nWarnings (advice, they do not fail the run)');
    for (const [file, list] of group(rep.warnings)) {
      log(`  ${file}`);
      for (const x of list) log(`    - ${x.where === file ? '' : x.where.slice(file.length) + ' '}${x.message}`);
    }
  }
  for (const n of rep.notes) log(`\nNote: ${n}`);
  const s = rep.stats;
  log(
    `\nChecked ${s.modules || 0} modules, ${s.lessons || 0} lessons, ${s.runBlocks || 0} runnable examples, ${s.outputBlocks || 0} output blocks, ${s.exercises || 0} exercises, ${s.questions || 0} questions, ${s.quizzes || 0} quizzes, ${s.cheatsheets || 0} cheat sheets, ${s.games || 0} games (${s.gameLevels || 0} levels), ${s.playgroundExamples || 0} playground examples. ${s.programsRun || 0} programs and ${s.testRuns || 0} test runs executed.`
  );
  log(rep.problems.length ? `\n${rep.problems.length} problem(s) found.` : `\nNo problems found${rep.warnings.length ? ` (${rep.warnings.length} warning(s))` : ''}.`);
  if (failOnWarn && rep.warnings.length && !rep.problems.length) log(`Not finished: ${rep.warnings.length} warning(s) still have to be fixed.`);
  return rep.problems.length === 0;
}
