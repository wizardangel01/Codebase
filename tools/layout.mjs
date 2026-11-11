// Layout checks that the big browser test (smoke.mjs) does not cover.
//
//   node tools/layout.mjs            both checks
//   node tools/layout.mjs --header   only the top bar
//   node tools/layout.mjs --pages    only the pages
//
// 1. The top bar. A learner's XP, rank name, streak and the "Offline" notice change how wide the bar is, so it is
//    measured at widths from 320 to 1280 px, for six different learners, with the browser's text size at
//    100%, 125% and 150%. Nothing may stick out, overlap or squeeze the logo.
// 2. The pages. A sample of twelve pages must not scroll sideways at 320 px with the text enlarged to 150%
//    (the narrowest phone and a learner who has turned the text size up).
//
// Needs Playwright for Node and a Chromium browser (see tools/smoke.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from './serve.mjs';
import { unlockContext } from './lib/unlock.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

const args = new Set(process.argv.slice(2));
const doHeader = args.has('--header') || !args.has('--pages');
const doPages = args.has('--pages') || !args.has('--header');

// first lesson of the first module, so the page list follows the content
const firstId = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'python', 'course.json'), 'utf8')).lines[0].modules[0];
const firstLesson = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'python', firstId, 'module.json'), 'utf8')).lessons[0].id;

const server = createServer(ROOT);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;
const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const problems = [];

/** A page whose browser text size is `text` px (16 is the normal size) and that already knows a learner. */
async function openPage(width, text, learner) {
  const context = await browser.newContext({ viewport: { width, height: 700 }, serviceWorkers: 'block' });
  await unlockContext(context);
  if (learner) {
    const today = new Date().toISOString().slice(0, 10);
    await context.addInitScript(
      ([xp, count, day]) => {
        try {
          localStorage.setItem(
            'cq:v1',
            JSON.stringify({ v: 1, created: Date.now(), name: '', xp, streak: { last: day, count, best: count }, lessons: {}, exercises: {}, checks: {}, quizzes: {}, games: {}, badges: {}, stats: { runs: 0, errors: 0, fixes: 0, cleanSolves: 0, playgroundRuns: 0, shares: 0 }, last: null })
          );
        } catch {}
      },
      [learner.xp, learner.streak, today]
    );
  }
  const page = await context.newPage();
  if (text !== 16) {
    // what a person does when they turn up the text size in the browser settings
    const cdp = await context.newCDPSession(page);
    await cdp.send('Page.setFontSizes', { fontSizes: { standard: text, fixed: Math.round(text * 0.8333) } });
  }
  return { context, page };
}

// ---- 1. the top bar ------------------------------------------------------------------------------------------
if (doHeader) {
  const learners = [
    { name: 'new learner', xp: 0, streak: 0 },
    { name: 'Developer, 1,348 XP, 5-day streak', xp: 1348, streak: 5 },
    { name: 'Architect, 2,900 XP, 12-day streak', xp: 2900, streak: 12 },
    { name: 'Pythonista, 4,100 XP, 120-day streak', xp: 4100, streak: 120 },
    { name: 'Guru, 5,500 XP, 365-day streak', xp: 5500, streak: 365 },
    { name: 'Guru, 12,345 XP, 365-day streak, offline', xp: 12345, streak: 365, offline: true, maxText: 20 },
  ];
  const widths = [320, 360, 390, 430, 600, 700, 760, 761, 768, 800, 810, 820, 834, 900, 960, 1024, 1100, 1280];
  const texts = [16, 20, 24];
  let checks = 0;
  for (const text of texts) {
    for (const learner of learners) {
      if (learner.maxText && text > learner.maxText) continue;
      const { context, page } = await openPage(1000, text, learner);
      await page.goto(base + '#/');
      await page.locator('.site-head').waitFor();
      if (learner.offline) await page.evaluate(() => window.dispatchEvent(new Event('offline')));
      for (const width of widths) {
        await page.setViewportSize({ width, height: 700 });
        await page.waitForTimeout(60);
        const m = await page.evaluate(() => {
          const doc = document.documentElement;
          const head = document.querySelector('.site-head');
          const navFixed = getComputedStyle(document.querySelector('.site-nav')).position === 'fixed';
          const parts = [...head.children].filter((k) => !(navFixed && k.classList.contains('site-nav'))).map((k) => k.getBoundingClientRect());
          const brand = document.querySelector('.brand').getBoundingClientRect();
          const nav = document.querySelector('.site-nav').getBoundingClientRect();
          const tools = document.querySelector('.head-tools').getBoundingClientRect();
          return {
            scroll: doc.scrollWidth,
            client: doc.clientWidth,
            right: Math.max(...parts.map((r) => r.right)),
            overlap: (navFixed ? brand.right : nav.right) > tools.left + 1,
            mark: document.querySelector('.brand-mark').getBoundingClientRect().width,
            markWanted: parseFloat(getComputedStyle(doc).fontSize) * 1.9,
          };
        });
        checks++;
        const why = [];
        if (m.scroll > m.client + 1) why.push(`the page is ${m.scroll} px wide`);
        if (m.right > m.client - 8) why.push(`the bar reaches ${Math.round(m.right)} px`);
        if (m.overlap) why.push('the logo, links and tools overlap');
        if (m.mark < m.markWanted - 1) why.push('the logo is squeezed');
        if (why.length) problems.push(`top bar at ${width} px, text ${Math.round((text / 16) * 100)}%, ${learner.name}: ${why.join('; ')}`);
      }
      await context.close();
    }
  }
  console.log(`top bar: ${checks} combinations of width, text size and learner checked`);
}

// ---- 2. the pages --------------------------------------------------------------------------------------------
if (doPages) {
  const routes = ['#/', '#/c/python', `#/c/python/${firstId}`, `#/c/python/${firstId}/${firstLesson}`, `#/c/python/${firstId}/quiz`, `#/c/python/${firstId}/game`, '#/c/python/decisions/comparisons', '#/c/python/lists/list-basics', '#/c/python/algorithms/search-and-sort', '#/play', '#/progress', '#/help'];
  const { context, page } = await openPage(320, 24, null);
  for (const route of routes) {
    await page.goto(base + route);
    await page.locator('h1').first().waitFor({ timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(700);
    const out = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth <= w + 1) return [];
      const scrolls = (el) => {
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const o = getComputedStyle(n).overflowX;
          if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true;
        }
        return false;
      };
      const sticks = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.right > w + 1 && !scrolls(el) && getComputedStyle(el).position !== 'fixed';
      };
      const names = [];
      for (const el of document.querySelectorAll('body *')) {
        if (!sticks(el) || [...el.querySelectorAll('*')].some(sticks)) continue; // only the innermost culprits
        const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '';
        names.push(`${el.tagName.toLowerCase()}${cls} (right edge ${Math.round(el.getBoundingClientRect().right)} px)`);
      }
      return names.slice(0, 4).length ? names.slice(0, 4) : [`the page is ${document.documentElement.scrollWidth} px wide`];
    });
    if (out.length) problems.push(`${route} at 320 px with 150% text sticks out: ${out.join('; ')}`);
  }
  await context.close();
  console.log(`pages: ${routes.length} pages checked at 320 px with the text at 150%`);
}

await browser.close();
server.close();
if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems.slice(0, 40)) console.log('  ' + p);
  if (problems.length > 40) console.log(`  ... and ${problems.length - 40} more`);
  process.exit(1);
}
console.log('\nThe layout holds.');
