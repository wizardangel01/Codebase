// Browser smoke test. It drives the real website in a real browser, the way a learner would:
// it opens every module page, lesson, quiz and game, runs the code examples, answers every
// question correctly, types every exercise solution into the editor and presses "Check",
// and plays every game level with its model solution. It also looks for console errors, failed
// downloads and pages that are wider than the screen.
//
//   node tools/smoke.mjs                          everything, desktop size
//   node tools/smoke.mjs python/meet-python       one module (filters work like validate.mjs)
//   node tools/smoke.mjs --mobile                 phone size (390 x 844, touch)
//   node tools/smoke.mjs --tablet                 tablet size (768 x 1024, touch)
//   node tools/smoke.mjs --dark                   dark colour scheme
//   node tools/smoke.mjs --fast                   skip the "wrong answer first" checks
//   node tools/smoke.mjs --no-games --no-quiz --no-lessons --no-runs
//   node tools/smoke.mjs --workers=2              test two modules at the same time
//   node tools/smoke.mjs --shots --out=/some/dir  keep a screenshot of every page type
//   node tools/smoke.mjs --headed                 watch it happen
//
// Needs Playwright for Node and a Chromium browser:  npm i -g playwright && npx playwright install chromium

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from './serve.mjs';
import { unlockContext } from './lib/unlock.mjs';
import { parseDoc, parseInfo } from '../js/lib/doc.js';
import { splitBlocks } from '../js/lib/markdown.js';
import { exerciseSpec, questionSpec, blankAnswers } from '../js/lib/specs.js';
import { parseGame } from '../js/games/levels.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const INPUT_RE = /\binput\s*\(|\bsys\s*\.\s*stdin\b/;

// ------------------------------------------------------------------------------ options
const argv = process.argv.slice(2);
const opt = (name, fallback = false) => {
  const a = argv.find((x) => x === `--${name}` || x.startsWith(`--${name}=`));
  if (!a) return fallback;
  return a.includes('=') ? a.split('=').slice(1).join('=') : true;
};
const filters = argv.filter((a) => !a.startsWith('--'));
const TABLET = !!opt('tablet');
const MOBILE = !!opt('mobile') || TABLET;
const DARK = !!opt('dark');
const HEADED = !!opt('headed');
const FAST = !!opt('fast');
const SHOTS = !!opt('shots');
const TOASTS = !!opt('toasts');
const DO = { lessons: !opt('no-lessons'), quiz: !opt('no-quiz'), games: !opt('no-games'), runs: !opt('no-runs') };
const WORKERS = Math.max(1, Number(opt('workers', 1)) || 1);
const OUT = path.resolve(String(opt('out', path.join(ROOT, 'tools', '.smoke'))));
const SIZE = TABLET ? 'tablet' : MOBILE ? 'phone' : 'desktop';
const LABEL = `${SIZE}, ${DARK ? 'dark' : 'light'}`;

// ------------------------------------------------------------------------------ playwright
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {}
  const roots = [];
  if (process.env.NODE_PATH) roots.push(...process.env.NODE_PATH.split(path.delimiter));
  try {
    roots.push(execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim());
  } catch {}
  for (const r of roots.filter(Boolean)) {
    try {
      return require(path.join(r, 'playwright'));
    } catch {}
  }
  throw new Error('Playwright for Node is not installed. Run:  npm i -g playwright && npx playwright install chromium');
}

// ------------------------------------------------------------------------------ content
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function inventory(doc) {
  const inv = { runs: [], traces: [], questions: [], exercises: [] };
  for (const node of doc.nodes) {
    if (node.type === 'md') {
      for (const part of splitBlocks(node.text)) {
        if (part.type === 'prose') continue;
        const info = parseInfo(part.info);
        const lang = info.lang || 'text';
        if (lang !== 'python' && lang !== 'py') continue;
        if (info.flags.has('run')) inv.runs.push({ code: part.code, fails: info.flags.has('error'), stdin: info.attrs.stdin || '' });
        else if (info.flags.has('trace')) inv.traces.push({ code: part.code });
      }
    } else if (node.type === 'container') {
      if (node.name === 'question') inv.questions.push(questionSpec(node));
      else if (node.name === 'exercise') inv.exercises.push(exerciseSpec(node));
    }
  }
  return inv;
}

function loadModules() {
  const out = [];
  const index = readJson(path.join(CONTENT, 'courses.json'));
  for (const cid of index.courses) {
    const course = readJson(path.join(CONTENT, cid, 'course.json'));
    const ids = course.modules || (course.lines || []).flatMap((l) => l.modules || []);
    for (const mid of ids) {
      const dir = path.join(CONTENT, cid, mid);
      const file = path.join(dir, 'module.json');
      if (!fs.existsSync(file)) continue;
      const meta = readJson(file);
      const named = filters.some((f) => f === `${cid}/${mid}` || f === mid || f === `content/${cid}/${mid}`);
      if (meta.status === 'soon' && !named) continue;
      const want = !filters.length || filters.some((f) => f === cid || f === `${cid}/${mid}` || f === mid || f === `content/${cid}/${mid}`);
      if (!want) continue;
      const doc = (name) => parseDoc(fs.readFileSync(path.join(dir, name), 'utf8'), { file: path.join(dir, name) });
      const lessons = (meta.lessons || []).map((l) => {
        const f = l.file || `${l.id}.md`;
        return fs.existsSync(path.join(dir, f)) ? { ...l, file: f, inv: inventory(doc(f)) } : null;
      }).filter(Boolean);
      const quizDoc = meta.quiz && fs.existsSync(path.join(dir, meta.quiz)) ? doc(meta.quiz) : null;
      const gameDoc = meta.game && fs.existsSync(path.join(dir, meta.game)) ? doc(meta.game) : null;
      out.push({
        course: cid,
        id: mid,
        meta,
        lessons,
        quiz: quizDoc ? quizDoc.nodes.filter((n) => n.type === 'container' && n.name === 'question').map(questionSpec) : null,
        game: gameDoc ? parseGame(gameDoc) : null,
        hasCheatsheet: !!(meta.cheatsheet && fs.existsSync(path.join(dir, meta.cheatsheet))),
      });
    }
  }
  return out;
}

// ------------------------------------------------------------------------------ reporting
const problems = [];
const warnings = [];
const counts = {};
const count = (k, n = 1) => (counts[k] = (counts[k] || 0) + n);
let shotNo = 0;

class Driver {
  constructor(browser, base, name) {
    this.browser = browser;
    this.base = base;
    this.name = name;
    this.errors = new Map();
    this.warm = false;
    this.interactiveDone = false;
  }

  log(...a) {
    console.log(this.name ? `[${this.name}]` : '', ...a);
  }

  async init() {
    this.ctx = await this.browser.newContext({
      viewport: TABLET ? { width: 768, height: 1024 } : MOBILE ? { width: 390, height: 844 } : { width: 1280, height: 900 },
      deviceScaleFactor: MOBILE ? 2 : 1,
      isMobile: MOBILE,
      hasTouch: MOBILE,
      colorScheme: DARK ? 'dark' : 'light',
      serviceWorkers: 'block',
    });
    await unlockContext(this.ctx, { quotes: 'off' }); // a quote card now and then would only be in the way of a test that clicks fast
    this.page = await this.ctx.newPage();
    this.page.setDefaultTimeout(20000);
    await this.page.addInitScript(() => {
      document.addEventListener('route', (e) => {
        window.__lastRoute = e.detail;
      });
    });
    const page = this.page;
    const note = (text) => this.errors.set(text, (this.errors.get(text) || 0) + 1);
    page.on('console', (m) => {
      if (m.type() === 'error') note(`console.error: ${m.text().slice(0, 300)}`);
    });
    page.on('pageerror', (e) => note(`uncaught error: ${String(e.message).slice(0, 300)}`));
    page.on('response', (r) => {
      if (r.status() >= 400) note(`HTTP ${r.status()} for ${r.url().replace(this.base, '/')}`);
    });
    page.on('requestfailed', (r) => {
      const err = (r.failure() && r.failure().errorText) || '';
      // Chromium sometimes reports a fully downloaded, streamed file as "aborted". The Python
      // engine files are read as streams (for the progress bar); if one were really missing,
      // Python would not start and every run in this test would fail.
      if (/ERR_ABORTED/.test(err) && /\/vendor\/pyodide\//.test(r.url())) return;
      note(`request failed: ${r.url().replace(this.base, '/')} (${err})`);
    });
    await page.goto(this.base, { waitUntil: 'domcontentloaded' });
    if (!TOASTS) await page.addStyleTag({ content: '#toasts{display:none !important}' });
    await page.waitForSelector('main#main .page, main#main section, main#main article', { timeout: 30000 });
  }

  async close() {
    await this.ctx.close();
  }

  // ---- bookkeeping
  fail(where, message, { shot = true } = {}) {
    const msg = String(message).split('\n').slice(0, 4).join(' | ').slice(0, 600);
    problems.push({ where, message: msg });
    this.log(`  FAIL ${where}: ${msg}`);
    if (shot && shotNo < 40) {
      shotNo++;
      fs.mkdirSync(OUT, { recursive: true });
      this.page.screenshot({ path: path.join(OUT, `fail-${String(shotNo).padStart(2, '0')}.png`) }).catch(() => {});
    }
  }

  async step(where, fn) {
    try {
      await fn();
    } catch (e) {
      this.fail(where, e && e.message ? e.message : e);
    }
  }

  drainErrors(where) {
    for (const [text, n] of this.errors) this.fail(where, `${text}${n > 1 ? ` (x${n})` : ''}`, { shot: false });
    this.errors.clear();
  }

  async shot(name) {
    if (!SHOTS) return;
    fs.mkdirSync(OUT, { recursive: true });
    await this.page.screenshot({ path: path.join(OUT, `${SIZE}-${DARK ? 'dark' : 'light'}-${name}.png`), fullPage: true });
  }

  // ---- navigation
  async visit(hash) {
    const page = this.page;
    const p = hash.replace(/^#/, '').split('?')[0];
    const current = await page.evaluate(() => location.hash);
    if (current === hash) {
      await page.evaluate(() => {
        window.__lastRoute = null;
        location.hash = '#/help';
      });
      await page.waitForFunction(() => window.__lastRoute && window.__lastRoute.path === '/help');
    }
    await page.evaluate((h) => {
      window.__lastRoute = null;
      location.hash = h;
    }, hash);
    await page.waitForFunction(
      (path) => {
        if (window.__lastRoute && window.__lastRoute.path === path) return true;
        const h1 = document.querySelector('#main h1');
        return !!h1 && /Page not found|could not load/.test(h1.textContent);
      },
      p,
      { timeout: 30000 }
    );
    const bad = await page.evaluate(() => {
      const h1 = document.querySelector('#main h1');
      return h1 && /Page not found|could not load/.test(h1.textContent) ? document.querySelector('#main').innerText.replace(/\s+/g, ' ').slice(0, 300) : null;
    });
    if (bad) throw new Error('the page did not load: ' + bad);
  }

  /** The page must not scroll sideways. Reports the elements that stick out. */
  async checkLayout(where) {
    const bad = await this.page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth <= w + 1) return null;
      const scrolls = (el) => {
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const o = getComputedStyle(n).overflowX;
          if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true;
        }
        return false;
      };
      const out = [];
      // the whole page, not only #main: the top bar once spilled past the edge on a tablet and went unnoticed
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > w + 1 && !scrolls(el) && getComputedStyle(el).position !== 'fixed') {
          out.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} (right edge ${Math.round(r.right)} px, screen ${w} px)`);
          if (out.length >= 3) break;
        }
      }
      return out.length ? out : [`the page is ${document.documentElement.scrollWidth} px wide on a ${w} px screen`];
    });
    if (bad) this.fail(where, 'the page scrolls sideways: ' + bad.join('; '));
    count('layout checks');
  }

  async checkNames(where) {
    const bad = await this.page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('#main button, #main a[href], #main input:not([type=hidden]), #main textarea, #main select')) {
        const named = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.title || (el.textContent || '').trim() || (el.labels && el.labels.length) || el.getAttribute('placeholder');
        if (!named) out.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : ''));
      }
      return out.slice(0, 3);
    });
    if (bad.length) warnings.push({ where, message: 'controls without a name for screen readers: ' + bad.join(', ') });
  }

  // ---- running code
  async finishRun(scope, { answers = [] } = {}) {
    const page = this.page;
    const deadline = Date.now() + (this.warm ? 30000 : 150000);
    let k = 0;
    for (;;) {
      const st = ((await scope.locator('.con-status').first().textContent()) || '').trim();
      if (/^(Finished|Error|Exited|Stopped)/.test(st)) {
        this.warm = true;
        return st;
      }
      if (/^Waiting for your input/.test(st)) {
        const input = scope.locator('.con-input');
        await input.fill(String(answers[k++] ?? '1'));
        await input.press('Enter');
      }
      if (Date.now() > deadline) throw new Error(`the program did not finish (status "${st}")`);
      await page.waitForTimeout(50);
    }
  }

  async consoleText(scope) {
    return ((await scope.locator('.con-out').first().innerText()) + ' ' + ((await scope.locator('.con-error').first().innerText().catch(() => '')) || '')).replace(/\s+/g, ' ').trim().slice(0, 240);
  }

  async runBlocks(where, inv) {
    const figs = this.page.locator('figure.runblock');
    const n = await figs.count();
    if (n !== inv.runs.length) this.fail(where, `the page shows ${n} runnable code blocks but the lesson file has ${inv.runs.length}`);
    for (let i = 0; i < Math.min(n, inv.runs.length); i++) {
      const spec = inv.runs[i];
      await this.step(`${where}, code example ${i + 1}`, async () => {
        const fig = figs.nth(i);
        const stdin = await fig.locator('textarea.stdin-area').inputValue();
        const needsInput = INPUT_RE.test(spec.code);
        if (needsInput && !stdin.trim()) {
          if (this.interactiveDone) return count('examples skipped (they ask for typed input)');
          this.interactiveDone = true;
          await fig.locator('.rb-bar .btn-primary').click();
          const st = await this.finishRun(fig, { answers: ['3', '4', '5', '6'] });
          if (!/^(Finished|Error)/.test(st)) throw new Error('an example that asks for input ended with "' + st + '"');
          count('examples run by typing into the console');
          return;
        }
        await fig.locator('.rb-bar .btn-primary').click();
        const st = await this.finishRun(fig);
        count('code examples run');
        if (spec.fails) {
          if (!/^Error/.test(st)) throw new Error(`the example is marked "error" but ended with "${st}"`);
          if (await fig.locator('.con-error').first().isHidden()) throw new Error('an example that fails on purpose shows no explanation of the error');
        } else if (!/^Finished/.test(st)) {
          throw new Error(`the example ended with "${st}": ${await this.consoleText(fig)}`);
        }
      });
    }
    const traces = this.page.locator('figure.traceblock');
    const tn = await traces.count();
    if (tn !== inv.traces.length) this.fail(where, `the page shows ${tn} step-through blocks but the lesson file has ${inv.traces.length}`);
    for (let i = 0; i < Math.min(tn, inv.traces.length); i++) {
      await this.step(`${where}, step-through ${i + 1}`, async () => {
        const tb = traces.nth(i);
        await tb.locator('.tr-intro button').click();
        await tb.locator('.tr-controls').waitFor({ state: 'visible', timeout: this.warm ? 20000 : 150000 });
        this.warm = true;
        const first = (await tb.locator('.tr-count').textContent()).trim();
        const m = /^Step 1 of (\d+)$/.exec(first);
        if (!m) throw new Error(`unexpected step counter "${first}"`);
        await tb.locator('button[aria-label="Last step"]').click();
        const last = (await tb.locator('.tr-count').textContent()).trim();
        if (last !== `Step ${m[1]} of ${m[1]}`) throw new Error(`the last step shows "${last}"`);
        if (!(await tb.locator('.tr-vars').first().innerText()).trim() && Number(m[1]) > 1) this.log(`  (note) ${where}, step-through ${i + 1}: no variables were shown`);
        count('step-through blocks');
      });
    }
  }

  // ---- questions
  async orderLines(scope, lines) {
    for (const line of lines) {
      const idx = await scope.evaluate((el, text) => [...el.querySelectorAll('ul.q-pool button.q-piece')].findIndex((b) => b.textContent === text), line);
      if (idx < 0) throw new Error(`the line "${line.trim()}" is not offered in the ordering question`);
      await scope.locator('ul.q-pool button.q-piece').nth(idx).click();
    }
  }

  async answer(scope, spec, kind = 'right') {
    const labels = scope.locator('label.q-choice');
    if (kind === 'right') {
      if (spec.type === 'choice') {
        await labels.nth(spec.choices.findIndex((c) => c.correct)).click();
      } else if (spec.type === 'multi') {
        for (const [i, c] of spec.choices.entries()) {
          if (c.correct) await labels.nth(i).click();
        }
      } else if (spec.type === 'predict') {
        await scope.locator('textarea.q-predict').fill(spec.answer);
      } else if (spec.type === 'fill') {
        const acc = blankAnswers(spec.answer);
        for (let i = 0; i < acc.length; i++) await scope.locator('input.q-blank').nth(i).fill(acc[i][0]);
      } else if (spec.type === 'order') {
        await this.orderLines(scope, spec.lines);
      } else {
        throw new Error(`unknown question type ${spec.type}`);
      }
      return;
    }
    // a deliberately wrong answer
    if (spec.type === 'choice' || spec.type === 'multi') {
      const wrong = spec.choices.findIndex((c) => !c.correct);
      await labels.nth(wrong >= 0 ? wrong : 0).click();
    } else if (spec.type === 'predict') {
      await scope.locator('textarea.q-predict').fill('zzz not the output');
    } else if (spec.type === 'fill') {
      await scope.locator('input.q-blank').first().fill('zzz');
    } else if (spec.type === 'order') {
      await scope.locator('ul.q-pool button.q-piece').first().click();
    }
  }

  async check(scope) {
    await scope.locator('.q-actions .btn-primary').click();
  }

  async questions(where, specs, { negative = !FAST } = {}) {
    const secs = this.page.locator('.lesson-body section.question');
    const n = await secs.count();
    if (n !== specs.length) this.fail(where, `the page shows ${n} questions but the lesson file has ${specs.length}`);
    for (let i = 0; i < Math.min(n, specs.length); i++) {
      const spec = specs[i];
      await this.step(`${where}, question "${spec.id}" (${spec.type})`, async () => {
        const q = this.page.locator(`#q-${spec.id}`);
        await q.scrollIntoViewIfNeeded();
        if (negative && (spec.type === 'choice' || spec.type === 'predict' || spec.type === 'fill')) {
          await this.answer(q, spec, 'wrong');
          await this.check(q);
          await q.locator('.q-feedback.is-bad').waitFor({ timeout: 5000 });
          if (spec.type === 'choice') await q.locator('label.q-choice.is-wrong').first().waitFor({ timeout: 3000 });
        }
        if (spec.type === 'predict') await q.locator('textarea.q-predict').fill('');
        await this.answer(q, spec, 'right');
        await this.check(q);
        await q.locator('.q-feedback.is-ok').waitFor({ timeout: 5000 });
        if (spec.explain.trim() && !(await q.locator('.q-feedback .q-explain').count())) throw new Error('the explanation is not shown after a correct answer');
        count('lesson questions answered');
      });
    }
  }

  // ---- exercises
  async exercises(where, specs) {
    const secs = this.page.locator('section.exercise');
    const n = await secs.count();
    if (n !== specs.length) this.fail(where, `the page shows ${n} exercises but the lesson file has ${specs.length}`);
    for (let i = 0; i < Math.min(n, specs.length); i++) {
      const spec = specs[i];
      await this.step(`${where}, exercise "${spec.id}"`, async () => {
        const ex = this.page.locator(`#ex-${spec.id}`);
        await ex.scrollIntoViewIfNeeded();
        const checkBtn = ex.locator('.ex-bar .btn-primary');
        const warmWait = this.warm ? 30000 : 150000;
        // 1. the starter code must not pass
        if (!spec.config.starter_passes) {
          await checkBtn.click();
          await ex.locator('.ex-banner.is-bad:not([hidden])').waitFor({ timeout: warmWait });
          this.warm = true;
          count('starter codes rejected');
        }
        // 2. the model solution must pass
        await this.page.evaluate(([id, code]) => document.getElementById('ex-' + id).exercise.editor.setValue(code), [spec.id, spec.solution]);
        await checkBtn.click();
        await ex.locator('.ex-banner.is-ok:not([hidden])').waitFor({ timeout: warmWait });
        this.warm = true;
        await this.page.waitForFunction((id) => document.getElementById('ex-' + id).classList.contains('is-solved'), spec.id, { timeout: 5000 });
        const summary = (await ex.locator('.ex-results h4').first().textContent()) || '';
        const m = /(\d+) of (\d+) passed/.exec(summary);
        if (m && m[1] !== m[2]) throw new Error(`the page says "${summary}" although the banner says all checks passed`);
        count('exercises solved');
      });
    }
    // the hint button works (once per lesson)
    if (specs.length && specs[0].hints.length) {
      await this.step(`${where}, hints`, async () => {
        const ex = this.page.locator(`#ex-${specs[0].id}`);
        await ex.locator('.ex-bar .btn-ghost').first().click();
        await ex.locator('.ex-hint').first().waitFor({ timeout: 3000 });
      });
    }
  }

  // ---- lessons
  async lesson(M, lesson) {
    const where = `${M.id}/${lesson.id}`;
    try {
      await this.visit(`#/c/${M.course}/${M.id}/${lesson.id}`);
    } catch (e) {
      return this.fail(where, e.message);
    }
    const title = (await this.page.locator('article.lesson-page h1').first().textContent().catch(() => '')) || '';
    if (title.trim() !== lesson.title) this.fail(where, `the page title is "${title.trim()}" but module.json says "${lesson.title}"`);
    await this.shot(`${M.id}-${lesson.id}-top`);
    if (DO.runs) await this.runBlocks(where, lesson.inv);
    await this.questions(where, lesson.inv.questions);
    await this.exercises(where, lesson.inv.exercises);
    await this.step(`${where}, finish button`, async () => {
      const btn = this.page.locator('.finish-row button');
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await this.page.locator('.finish-row button', { hasText: 'Lesson finished' }).waitFor({ timeout: 3000 });
    });
    await this.checkLayout(where);
    await this.checkNames(where);
    this.drainErrors(where);
    count('lessons opened');
    this.log(`  lesson ${lesson.id}: ${lesson.inv.runs.length} examples, ${lesson.inv.questions.length} questions, ${lesson.inv.exercises.length} exercises`);
  }

  // ---- quiz
  async quiz(M, mode) {
    const where = `${M.id}/quiz${mode === 'wrong' ? ' (all answers wrong)' : ''}`;
    const specs = M.quiz;
    const page = this.page;
    const stage = page.locator('.quiz-stage');
    try {
      await this.visit(`#/c/${M.course}/${M.id}/quiz`);
    } catch (e) {
      return this.fail(where, e.message);
    }
    if (mode === 'right') await this.shot(`${M.id}-quiz-intro`);
    await this.step(where, async () => {
      await stage.locator('.btn-primary.btn-lg').click();
      for (let i = 0; i < specs.length; i++) {
        await page.locator('.quiz-progress span', { hasText: `Question ${i + 1} of ${specs.length}` }).waitFor({ timeout: 5000 });
        const q = stage.locator('section.question');
        await this.answer(q, specs[i], mode);
        await this.check(q);
        await q.locator(`.q-feedback.${mode === 'right' ? 'is-ok' : 'is-bad'}`).waitFor({ timeout: 5000 });
        if (i === 0 && mode === 'right') await this.shot(`${M.id}-quiz-question`);
        await stage.locator('.q-next button').click();
      }
      await stage.locator('.quiz-result').waitFor({ timeout: 5000 });
      const cls = (await stage.locator('.quiz-result').first().getAttribute('class')) || '';
      const score = (await stage.locator('.quiz-result .score').first().innerText()).replace(/\s+/g, ' ');
      if (mode === 'right') {
        if (!cls.includes('is-pass')) throw new Error(`answering every question correctly did not pass (${score})`);
        if (!new RegExp(`^${specs.length} of ${specs.length}$`).test(score)) throw new Error(`the score reads "${score}" instead of ${specs.length} of ${specs.length}`);
        if (await stage.locator('.quiz-review').count()) throw new Error('the review list appears although every answer was right');
        await this.shot(`${M.id}-quiz-result`);
      } else {
        if (!cls.includes('is-fail')) throw new Error(`answering every question wrongly still "passed" (${score})`);
        const shown = await stage.locator('.quiz-review .review-item').count();
        const got = Number(/^(\d+)/.exec(score)[1]);
        if (shown !== specs.length - got) throw new Error(`the review list shows ${shown} items for ${specs.length - got} missed questions`);
        await stage.locator('.quiz-result .btn-secondary').click(); // "Try again" starts over
        await page.locator('.quiz-progress span', { hasText: `Question 1 of ${specs.length}` }).waitFor({ timeout: 5000 });
      }
      count('quizzes completed');
    });
    await this.checkLayout(where);
    this.drainErrors(where);
  }

  // ---- game
  async game(M) {
    const where = `${M.id}/game`;
    const g = M.game;
    const page = this.page;
    try {
      await this.visit(`#/c/${M.course}/${M.id}/game`);
    } catch (e) {
      return this.fail(where, e.message);
    }
    await this.shot(`${M.id}-game`);
    const rail = page.locator('.game-rail .rail-stop');
    const n = await rail.count();
    if (n !== g.levels.length) this.fail(where, `the page lists ${n} levels but game.md has ${g.levels.length}`);
    let stars = 0;
    for (let i = 0; i < Math.min(n, g.levels.length); i++) {
      const lv = g.levels[i];
      await this.step(`${where}, level ${i + 1} "${lv.id}"`, async () => {
        await rail.nth(i).click();
        await page.waitForFunction((t) => (document.querySelector('.level-head h2') || {}).textContent === t, lv.title, { timeout: 5000 });
        const editor = page.locator('.game-ed textarea.ed-ta');
        const runBtn = page.locator('.game-bar .btn-primary');
        const result = page.locator('.game-result:not([hidden])');
        const wait = this.warm ? 40000 : 150000;
        // the starter code must not clear the level
        if (!FAST || i === 0) {
          await runBtn.click();
          await result.first().waitFor({ timeout: wait });
          this.warm = true;
          const cls = (await result.first().getAttribute('class')) || '';
          if (cls.includes('is-pass')) throw new Error('the starter code clears the level');
          if (cls.includes('is-fail') && /could not be checked|Something is wrong/.test(await result.first().innerText())) throw new Error('the level reports an engine problem: ' + (await result.first().innerText()).replace(/\s+/g, ' ').slice(0, 200));
          count('game starters rejected');
        }
        // the model solution must earn three stars
        await editor.fill(lv.solution);
        await runBtn.click();
        await page.locator('.game-result.is-pass').first().waitFor({ timeout: wait }).catch(async () => {
          const t = (await page.locator('.game-result').first().innerText().catch(() => '')) || '(no result shown)';
          throw new Error('the model solution did not clear the level: ' + t.replace(/\s+/g, ' ').slice(0, 240));
        });
        const on = await page.locator('.game-result .gr-head .star.is-on').count();
        if (on !== 3) throw new Error(`the model solution earned ${on} star(s), expected 3`);
        stars += on;
        count('game levels cleared');
        if (i === 0) await this.shot(`${M.id}-game-cleared`);
      });
    }
    await this.step(`${where}, finished`, async () => {
      if (!(await page.locator('.game-result .gr-done').count())) throw new Error('after clearing every level the game does not show its "you finished" panel');
      const label = (await page.locator('.game-stats').innerText()).replace(/\s+/g, ' ');
      if (!label.includes(`${g.levels.length} of ${g.levels.length} levels cleared`)) throw new Error(`the stats read "${label}"`);
    });
    await this.checkLayout(where);
    this.drainErrors(where);
    this.log(`  game: ${g.levels.length} levels, ${stars} stars`);
  }

  // ---- module
  async module(M) {
    const where = M.id;
    this.log(`module ${M.id}`);
    try {
      await this.visit(`#/c/${M.course}/${M.id}`);
    } catch (e) {
      this.fail(where, e.message);
      return;
    }
    await this.step(`${where}, module page`, async () => {
      const h1 = ((await this.page.locator('article.module-page h1').first().textContent()) || '').trim();
      if (h1 !== M.meta.title) throw new Error(`the heading is "${h1}" but module.json says "${M.meta.title}"`);
      const want = (M.meta.lessons || []).length + (M.meta.quiz ? 1 : 0) + (M.meta.game ? 1 : 0);
      const got = await this.page.locator('.mod-stations > li').count();
      if (got !== want) throw new Error(`the page lists ${got} stations, expected ${want}`);
      if (M.hasCheatsheet) {
        await this.page.locator('details.cheatsheet > summary').click();
        await this.page.waitForFunction(() => (document.querySelector('.cheat-body') || { textContent: '' }).textContent.trim().length > 40, null, { timeout: 5000 });
        count('cheat sheets opened');
      }
      await this.shot(`${M.id}-module`);
      await this.checkLayout(where);
    });
    this.drainErrors(where);
    if (DO.lessons) for (const lesson of M.lessons) await this.lesson(M, lesson);
    if (DO.quiz && M.quiz) {
      if (!FAST && M === this.firstModule) await this.quiz(M, 'wrong');
      await this.quiz(M, 'right');
    }
    if (DO.games && M.game) await this.game(M);
    await this.step(`${where}, saved progress`, async () => {
      const s = await this.page.evaluate(() => JSON.parse(localStorage.getItem('cq:v1') || '{}'));
      const key = `${M.course}/${M.id}`;
      if (DO.lessons) for (const l of M.lessons) if (!(s.lessons || {})[`${key}/${l.id}`]) throw new Error(`lesson "${l.id}" is not saved as finished`);
      if (DO.quiz && M.quiz && !((s.quizzes || {})[key] || {}).passed) throw new Error('the quiz is not saved as passed');
      if (DO.games && M.game && !((s.games || {})[key] || {}).done) throw new Error('the game is not saved as finished');
    });
  }
}

// ------------------------------------------------------------------------------ main
const modules = loadModules();
if (!modules.length) {
  console.error('No modules matched. Filters:', filters.join(' ') || '(none)');
  process.exit(2);
}
const { chromium } = loadPlaywright();
const server = createServer();
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ headless: !HEADED });
console.log(`Smoke test (${LABEL}): ${modules.length} module(s) at ${base}`);
const started = Date.now();
const queue = modules.slice();
const drivers = [];
try {
  for (let w = 0; w < Math.min(WORKERS, modules.length); w++) {
    const d = new Driver(browser, base, WORKERS > 1 ? `w${w + 1}` : '');
    await d.init();
    d.firstModule = modules[0];
    drivers.push(d);
  }
  await Promise.all(
    drivers.map(async (d) => {
      for (let M = queue.shift(); M; M = queue.shift()) {
        count('modules');
        try {
          await d.module(M);
        } catch (e) {
          d.fail(M.id, 'the test itself crashed: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
        }
      }
    })
  );

  // the certificate: locked until everything is finished, unlocked afterwards
  if (drivers.length === 1 && !filters.length && DO.lessons && DO.quiz && DO.games) {
    const d = drivers[0];
    const cid = modules[0].course;
    await d.step('certificate', async () => {
      await d.visit(`#/certificate/${cid}`);
      const text = await d.page.locator('main#main').innerText();
      const allDone = problems.length === 0;
      if (allDone && !/Certificate of completion/.test(text)) throw new Error('every module is finished but the certificate is still locked: ' + text.replace(/\s+/g, ' ').slice(0, 160));
      if (allDone) await d.shot('certificate');
      await d.checkLayout('certificate');
      count('certificate checked');
    });
    d.drainErrors('certificate');
  }
} finally {
  await browser.close().catch(() => {});
  server.close();
}

const secs = Math.round((Date.now() - started) / 1000);
console.log(`\nChecked in ${secs} s (${LABEL}):`);
for (const [k, v] of Object.entries(counts)) console.log(`  ${String(v).padStart(5)}  ${k}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  const seen = new Set();
  for (const w of warnings) {
    const line = `  ${w.where}: ${w.message}`;
    if (!seen.has(line)) {
      seen.add(line);
      console.log(line);
    }
  }
}
if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems) console.log(`  ${p.where}: ${p.message}`);
  console.log(`\nScreenshots of failures are in ${OUT}`);
  process.exit(1);
}
console.log('\nNo problems: every page loaded, every example ran, every answer and solution was accepted, every game level was cleared.');
