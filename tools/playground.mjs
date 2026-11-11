// Playground test. It opens the playground in a real browser and checks what the lesson tests do not:
// Run, and "Step through" on the learner's own code (a normal program, a program that asks for input,
// a long program whose recording is cut short, a program that fails, and a program with a syntax error).
//
//   node tools/playground.mjs             desktop size
//   node tools/playground.mjs --mobile    phone size (390 px), also checks that the page does not scroll sideways
//   node tools/playground.mjs --shots=/some/dir   keep screenshots
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

const args = process.argv.slice(2);
const mobile = args.includes('--mobile');
const shots = (args.find((a) => a.startsWith('--shots=')) || '').slice(8);
if (shots) fs.mkdirSync(shots, { recursive: true });

const server = createServer(ROOT);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1100, height: 800 }, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 1 });
await unlockContext(context);
const page = await context.newPage();

const problems = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) problems.push(what);
};
page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`console error: ${m.text()}`);
});

const editor = () => page.locator('.play-editor textarea.ed-ta');
const stdinBox = () => page.locator('textarea.stdin-area');
const stepBtn = () => page.getByRole('button', { name: 'Step through', exact: true });
const traceVisible = () => page.locator('.play-trace:not([hidden]) figure.traceblock');
const counter = () => page.locator('figure.traceblock .tr-count');
const note = () => page.locator('figure.traceblock .tr-note');

async function setCode(code) {
  await editor().fill(code);
  await page.waitForTimeout(150);
}
async function startTrace() {
  await stepBtn().click();
  await counter().waitFor({ state: 'visible', timeout: 60000 });
}
async function lastStep() {
  await page.locator('figure.traceblock button[aria-label="Last step"]').click();
}
async function closeTrace() {
  await page.locator('.play-trace-bar').getByRole('button', { name: 'Close' }).click();
}
async function shot(name) {
  if (shots) await page.screenshot({ path: path.join(shots, `${mobile ? 'phone' : 'desktop'}-${name}.png`), fullPage: true });
}
async function noSideScroll(where) {
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  check(scroll <= client + 1, `${where}: the page does not scroll sideways (${scroll} px on a ${client} px screen)`);
}

try {
  await page.goto(base + '#/play');
  await editor().waitFor({ timeout: 30000 });
  check(true, 'the playground opens');

  // 1. Run
  await page.locator('.toolbar').getByRole('button', { name: 'Run', exact: true }).click();
  const status = page.locator('.play-side .con-status').first();
  await page.waitForFunction((sel) => /^(Finished|Error)/.test((document.querySelector(sel)?.textContent || '').trim()), '.play-side .con-status', { timeout: 150000 });
  check(/^Finished/.test(((await status.textContent()) || '').trim()), 'Run: the first example runs');
  if (mobile) await noSideScroll('playground');

  // 2. Step through a normal program
  await setCode('total = 0\nfor n in range(3):\n    total = total + n\nprint(total)\n');
  await startTrace();
  const m = /Step 1 of (\d+)/.exec((await counter().textContent()) || '');
  check(!!m && Number(m[1]) >= 8, `Step through: the recording starts at "Step 1 of ${m ? m[1] : '?'}"`);
  await shot('trace-first');
  await lastStep();
  check(/finished/.test((await note().textContent()) || ''), 'Step through: the last step says the program has finished');
  const vars = ((await page.locator('figure.traceblock .tr-vars').innerText()) || '').replace(/\s+/g, ' ');
  check(/total\s*3/.test(vars) && /n\s*2/.test(vars), `Step through: the variables show total = 3 and n = 2 (${vars.slice(0, 60)})`);
  const out = ((await page.locator('figure.traceblock .con').innerText()) || '').replace(/\s+/g, ' ');
  check(/\b3\b/.test(out), 'Step through: the output so far shows what was printed');
  await shot('trace-last');
  if (mobile) await noSideScroll('step through');
  await closeTrace();
  check((await traceVisible().count()) === 0, 'Close: the step-through panel goes away');

  // 3. a program that asks for input
  await setCode('name = input("Name? ")\nprint("Hi " + name)\n');
  await stdinBox().waitFor({ state: 'visible' });
  await stepBtn().click();
  await page.waitForTimeout(800);
  check((await traceVisible().count()) === 0, 'Step through: a program that asks for input does not start without answers');
  await stdinBox().fill('Ada');
  await startTrace();
  await lastStep();
  const out2 = ((await page.locator('figure.traceblock .con').innerText()) || '').replace(/\s+/g, ' ');
  check(/Hi Ada/.test(out2), `Step through: input() takes its answer from the Program input box (${out2.slice(0, 40)})`);
  await closeTrace();
  await stdinBox().fill('');

  // 4. a long program: the recording is cut short and says so
  await setCode('count = 0\nfor i in range(1000):\n    count += 1\nprint(count)\n');
  await startTrace();
  const cut = page.locator('figure.traceblock .tr-trunc');
  check(await cut.isVisible(), 'Step through: a long program says that only the first steps were recorded');
  check(/\b400\b/.test((await cut.textContent()) || ''), `Step through: the notice names the limit ("${(((await cut.textContent()) || '').slice(0, 70))}...")`);
  await lastStep();
  const vars3 = ((await page.locator('figure.traceblock .tr-vars').innerText()) || '').replace(/\s+/g, ' ');
  check(/count/.test(vars3) && /1000/.test(vars3), 'Step through: the last step still shows where the program ended up (count = 1000)');
  check(/ended up/.test((await note().textContent()) || ''), 'Step through: the last step explains that the variables are the final ones');
  await shot('trace-cut-short');
  await closeTrace();

  // 5. a program that fails
  await setCode('x = 1\nprint(x / 0)\n');
  await startTrace();
  await lastStep();
  const out3 = ((await page.locator('figure.traceblock .con').innerText()) || '').replace(/\s+/g, ' ');
  check(/zero/i.test(out3), `Step through: a failing program ends with its error message (${out3.slice(0, 60)})`);
  check(/stopped with an error/.test((await note().textContent()) || ''), 'Step through: the last step of a failing program says it stopped with an error');
  await closeTrace();

  // 6. a syntax error: nothing to step through, the error is shown instead
  await setCode('print("hi"\n');
  await stepBtn().click();
  await page.locator('.play-trace figure.traceblock .con').first().waitFor({ state: 'visible', timeout: 60000 });
  await page.waitForTimeout(500);
  const out4 = ((await page.locator('.play-trace figure.traceblock .con').first().innerText()) || '').replace(/\s+/g, ' ');
  check(out4.trim().length > 10, `Step through: a syntax error is explained (${out4.slice(0, 70)})`);
  check(/Step 1 of 1/.test((await counter().textContent()) || ''), 'Step through: a program that could not start has a single step');
  check(/stopped with an error/.test((await note().textContent()) || ''), `Step through: that step says the program stopped with an error ("${(((await note().textContent()) || '').slice(0, 60))}")`);
  await shot('trace-syntax-error');
  await closeTrace();

  // 7. an empty editor
  await setCode('');
  await stepBtn().click();
  await page.waitForTimeout(400);
  check((await traceVisible().count()) === 0, 'Step through: an empty editor does not start a trace');
} catch (err) {
  problems.push(`the test stopped with an error: ${err.message}`);
  await shot('error').catch(() => {});
} finally {
  await browser.close();
  server.close();
}

if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems.slice(0, 20)) console.log('  ' + p.split('\n')[0].slice(0, 240));
  process.exit(1);
}
console.log('\nThe playground works.');
