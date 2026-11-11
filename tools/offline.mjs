// Offline test. It opens the site in a real browser, lets the service worker cache what the learner
// visits, switches the network off, and checks that the lesson still opens and Python still runs.
//
//   node tools/offline.mjs              the site at the root of a server
//   node tools/offline.mjs --subpath    the site under /codequest-academy/, the way GitHub Pages serves a project
//                                       site (every request outside that folder fails, so a link that forgets the
//                                       folder shows up here)
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

const first = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'python', 'meet-python', 'module.json'), 'utf8')).lessons[0].id;
const lessonHash = `#/c/python/meet-python/${first}`;

const prefix = process.argv.includes('--subpath') ? '/codequest-academy/' : '/';
const server = createServer(ROOT, prefix === '/' ? '' : prefix);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
await unlockContext(context);
const page = await context.newPage();

const problems = [];
const failedRequests = [];
page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base.slice(0, base.indexOf('/', 8)))) failedRequests.push(`${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '')}`); });
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) problems.push(what);
};

async function runFirstExample(pg = page) {
  const fig = pg.locator('figure.runblock').first();
  await fig.waitFor({ timeout: 30000 });
  await fig.locator('.rb-bar .btn-primary').click();
  const deadline = Date.now() + 150000;
  for (;;) {
    const status = (((await fig.locator('.con-status').first().textContent()) || '').trim());
    if (/^(Finished|Error|Exited|Stopped)/.test(status)) return status;
    if (Date.now() > deadline) return 'did not finish';
    await pg.waitForTimeout(100);
  }
}

/** Runs the starter code of the first level of a game and reports what the game said (it needs the game harness and Python). */
async function playFirstLevel(pg, hash) {
  await pg.goto(base + 'index.html' + hash);
  await pg.locator('.game-bar .btn-primary').waitFor({ timeout: 30000 });
  await pg.locator('.game-bar .btn-primary').click();
  const result = pg.locator('.game-result:not([hidden])').first();
  await result.waitFor({ timeout: 150000 });
  return ((await result.innerText()) || '').replace(/\s+/g, ' ');
}

try {
  // 1. the first visit installs the service worker
  await page.goto(base + lessonHash);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  check(true, 'the service worker is registered and active');

  // 2. a reload puts the page, and the worker that runs Python, under the service worker's control,
  //    so everything they load from now on is cached (Python itself the first time it is used)
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
  const online = await runFirstExample();
  check(/^Finished/.test(online), `online: the first example runs (${online})`);
  const cacheNames = await page.evaluate(() => caches.keys());
  check(cacheNames.some((n) => n.startsWith('cq-static-')) && cacheNames.some((n) => n.startsWith('cq-heavy-')), `the offline caches exist (${cacheNames.join(', ')})`);

  // 3. the network goes away
  await context.setOffline(true);
  await page.reload();
  const heading = page.locator('h1').first();
  await heading.waitFor({ timeout: 30000 });
  check(((await heading.textContent()) || '').trim().length > 0, `offline: the lesson page opens ("${(((await heading.textContent()) || '').trim()).slice(0, 50)}")`);
  const offline = await runFirstExample();
  check(/^Finished/.test(offline), `offline: Python still runs (${offline})`);

  // 4. a page that was never visited fails politely, and the app still works
  await page.goto(base + '#/c/python/classes');
  await page.waitForTimeout(1500);
  const body = ((await page.locator('body').innerText()) || '').replace(/\s+/g, ' ');
  check(body.length > 40, 'offline: a page that was never visited still shows the app, not a blank screen');
  await page.goto(base + '#/');
  await page.locator('h1').first().waitFor({ timeout: 15000 });
  check(true, 'offline: the home page opens');
  // 5. "Save for offline use": one button keeps the whole course, so even lessons and games that were never opened work offline
  const saveContext = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  await unlockContext(saveContext);
  const savePage = await saveContext.newPage();
  await savePage.goto(base + '#/help');
  await savePage.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await savePage.reload();
  await savePage.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
  const saveBtn = savePage.locator('.offline-card button.btn');
  await saveBtn.waitFor({ state: 'visible', timeout: 20000 });
  const before = ((await savePage.locator('.offline-status').textContent()) || '').trim();
  check(/^Not saved yet/.test(before), `Help: before saving, the card says so ("${before.slice(0, 60)}")`);
  await saveBtn.click();
  await savePage.waitForFunction(() => /^Saved\. All \d+ files/.test((document.querySelector('.offline-status') || {}).textContent || ''), null, { timeout: 240000 });
  const after = ((await savePage.locator('.offline-status').textContent()) || '').trim();
  check(true, `Help: after saving, the card says so ("${after.slice(0, 70)}")`);

  await saveContext.setOffline(true);
  await savePage.goto(base + 'index.html#/c/python/classes/objects-and-classes');
  await savePage.locator('h1').first().waitFor({ timeout: 30000 });
  const lessonTitle = (((await savePage.locator('h1').first().textContent()) || '').trim());
  check(lessonTitle.length > 0 && !/not found|could not load/i.test(lessonTitle), `saved: a lesson that was never opened works offline ("${lessonTitle.slice(0, 40)}")`);
  const savedRun = await runFirstExample(savePage);
  check(/^Finished/.test(savedRun), `saved: its first example runs offline (${savedRun})`);
  const rover = await playFirstLevel(savePage, '#/c/python/loops/game');
  check(!/could not be checked|Something is wrong/.test(rover), `saved: a rover game level runs offline ("${rover.slice(0, 50)}")`);
  const judge = await playFirstLevel(savePage, '#/c/python/functions/game');
  check(!/could not be checked|Something is wrong/.test(judge), `saved: a judge game level runs offline ("${judge.slice(0, 50)}")`);
  await savePage.goto(base + 'index.html#/play');
  await savePage.locator('.play-editor textarea.ed-ta').waitFor({ timeout: 30000 });
  check(true, 'saved: the playground opens offline');
  await savePage.goto(base + 'index.html#/c/python/algorithms/quiz');
  await savePage.locator('h1, h2').first().waitFor({ timeout: 30000 });
  const quizText = ((await savePage.locator('#main').innerText()) || '').replace(/\s+/g, ' ');
  check(!/not found|could not load/i.test(quizText.slice(0, 200)), 'saved: a quiz opens offline');
  await saveContext.close();

  // 6. nothing the page asked for may have failed (the one page that was never visited is allowed to)
  const unexpected = failedRequests.filter((f) => !f.includes('/classes'));
  check(unexpected.length === 0, `no request failed${unexpected.length ? ': ' + unexpected.slice(0, 5).join(', ') : ''}`);
} catch (err) {
  check(false, `the test stopped with an error: ${err.message}`);
} finally {
  await browser.close();
  server.close();
}

console.log(problems.length ? `\n${problems.length} problem(s).` : '\nThe site works offline after one visit.');
process.exit(problems.length ? 1 : 0);
