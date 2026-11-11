// Password screen test. It opens the site in a real browser with no saved login and checks the screen the way a
// visitor meets it: that nothing of the site shows before the password, that wrong guesses are refused, that the
// right one lets the visitor in (to the page they asked for), that the login is remembered and can be forgotten,
// and that the screen fits a phone.
//
//   CQ_TEST_PASSWORD="the password" node tools/login.mjs
//   CQ_TEST_PASSWORD="the password" node tools/login.mjs --shots=/some/dir     keep screenshots
//   node tools/login.mjs                                                      without the password only the checks that do not need it run
//
// The password is never written down in this repository, so the test takes it from the environment.
// Needs Playwright for Node and a Chromium browser (see tools/smoke.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from './serve.mjs';
import { AUTH_KEY } from '../js/auth.js';
import { unlockNote } from './lib/unlock.mjs';

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

const PASSWORD = process.env.CQ_TEST_PASSWORD || '';
const shots = (process.argv.slice(2).find((a) => a.startsWith('--shots=')) || '').slice(8);
if (shots) fs.mkdirSync(shots, { recursive: true });

const server = createServer(ROOT);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;
const DEEP = '#/c/python/meet-python/hello-world';

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const problems = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) problems.push(what);
};

/** A fresh browser (no saved login) and a page that reports script errors. */
async function open({ width = 1100, height = 800, mobile = false, dark = false, text = 16, init, name = 'page' } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, colorScheme: dark ? 'dark' : 'light', serviceWorkers: 'block' });
  if (init) await context.addInitScript(init.fn, init.arg);
  const page = await context.newPage();
  page.on('pageerror', (e) => problems.push(`${name}: page error: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`${name}: console error: ${m.text()}`);
  });
  if (text !== 16) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Page.setFontSizes', { fontSizes: { standard: text, fixed: Math.round(text * 0.8333) } });
  }
  return { context, page };
}

const card = (page) => page.locator('.login-card');
const field = (page) => page.locator('#login-pw');
const logIn = (page) => page.getByRole('button', { name: 'Log in', exact: true });
const message = (page) => page.locator('#login-msg');
const siteShown = (page) => page.locator('header.site-head').count().then((n) => n > 0);
const note = (page, area = 'localStorage') => page.evaluate(([a, k]) => window[a].getItem(k), [area, AUTH_KEY]);

async function guess(page, text) {
  await field(page).fill(text);
  await logIn(page).click();
}
async function wrongAnswerShown(page) {
  await page.waitForFunction(() => (document.querySelector('#login-msg')?.textContent || '').length > 0, null, { timeout: 5000 });
}
async function shot(page, name) {
  if (shots) await page.screenshot({ path: path.join(shots, `login-${name}.png`) });
}
async function noSideScroll(page, where) {
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  check(scroll <= client + 1, `${where}: the screen does not scroll sideways (${scroll} px on a ${client} px screen)`);
}

try {
  // ---- 1. what a visitor sees first ------------------------------------------------------------------------
  {
    const { context, page } = await open({ name: 'first visit' });
    const asked = [];
    page.on('request', (r) => asked.push(r.url()));
    await page.goto(base + DEEP);
    await card(page).waitFor({ timeout: 20000 });
    check(true, 'the password screen opens first');
    check(!(await siteShown(page)), 'the site itself (top bar, lesson) is not built before the password');
    check(((await page.title()) || '').startsWith('Log in'), `the tab says what this is ("${await page.title()}")`);
    check((await page.evaluate(() => document.activeElement && document.activeElement.id)) === 'login-pw', 'the cursor is already in the password box');
    check((await field(page).getAttribute('type')) === 'password', 'the box hides what is typed');
    check((await field(page).getAttribute('autocomplete')) === 'current-password', 'the browser knows it is a password (password managers can fill it)');
    check(!!(await page.getByLabel('Password', { exact: true }).count()), 'the box has a label that a screen reader reads');
    check(!asked.some((u) => /\/content\//.test(u)), 'no lesson file was downloaded before the password');
    await shot(page, 'desktop-light');

    // Show / Hide
    const show = page.getByRole('button', { name: 'Show password' });
    await field(page).fill('abc');
    await show.click();
    check((await field(page).getAttribute('type')) === 'text', 'Show: the letters can be seen');
    await page.getByRole('button', { name: 'Hide password' }).click();
    check((await field(page).getAttribute('type')) === 'password', 'Hide: the letters are hidden again');

    // nothing typed
    await field(page).fill('');
    await logIn(page).click();
    await wrongAnswerShown(page);
    check(/Type the password/.test((await message(page).textContent()) || ''), 'an empty box says to type the password');

    // wrong guesses
    await guess(page, 'definitely-not-it');
    await wrongAnswerShown(page);
    const said = (await message(page).textContent()) || '';
    check(/not right/.test(said), `a wrong password is refused ("${said}")`);
    check((await message(page).getAttribute('role')) === 'alert', 'the refusal is announced to a screen reader');
    check((await field(page).getAttribute('aria-invalid')) === 'true', 'the box is marked as holding a wrong value');
    check(!(await siteShown(page)) && (await note(page)) === null, 'a wrong password opens nothing and saves nothing');
    await shot(page, 'wrong');
    await field(page).fill('x');
    check(((await message(page).textContent()) || '') === '', 'typing again clears the refusal');

    // the same refusal for every wrong guess: it must not say anything about the password
    await guess(page, 'another wrong one');
    await wrongAnswerShown(page);
    check(((await message(page).textContent()) || '') === said, 'every wrong guess gets the same answer, which gives nothing away');
    await context.close();
  }

  // ---- 2. a screen that cannot check the password -------------------------------------------------------------
  {
    const { context, page } = await open({ name: 'insecure address', init: { fn: () => Object.defineProperty(window.crypto, 'subtle', { value: undefined, configurable: true }) } });
    await page.goto(base);
    await card(page).waitFor({ timeout: 20000 });
    check(/not secure/.test((await card(page).innerText()) || ''), 'on an address the browser calls not secure the screen says so');
    check(await field(page).isDisabled(), 'and the box is switched off instead of refusing every password');
    await context.close();
  }

  // ---- 3. the password switched off ---------------------------------------------------------------------------
  {
    const { context, page } = await open({ name: 'password off' });
    await page.route('**/js/auth-config.js', (route) => route.fulfill({ contentType: 'text/javascript', body: 'export const AUTH = { enabled: false };' }));
    await page.goto(base);
    await page.locator('header.site-head').waitFor({ timeout: 20000 });
    check((await card(page).count()) === 0, 'with the password switched off the site opens straight away');
    check((await page.getByRole('button', { name: 'Log out' }).count()) === 0, 'and there is no "Log out" in the footer');
    await context.close();
  }

  // ---- 4. a login note that is out of date ----------------------------------------------------------------------
  const fingerprint = JSON.parse(await unlockNote()).f;
  for (const [what, value] of [
    ['made for an older password', JSON.stringify({ f: 'XXXXXXXXXXXX', until: Date.now() + 864e5 })],
    ['that has run out', JSON.stringify({ f: fingerprint, until: Date.now() - 1000 })],
    ['that is not valid', 'not json'],
  ]) {
    const { context, page } = await open({
      name: 'old note',
      init: {
        fn: ([k, v]) => {
          try {
            localStorage.setItem(k, v);
          } catch {}
        },
        arg: [AUTH_KEY, value],
      },
    });
    await page.goto(base);
    await card(page).waitFor({ timeout: 20000 });
    check(true, `a saved login ${what} does not let anyone in`);
    await context.close();
  }

  // ---- 5. the right password ------------------------------------------------------------------------------------
  if (!PASSWORD) {
    console.log('\nSKIPPED the checks that need the password. Run again with CQ_TEST_PASSWORD="the password".\n');
  } else {
    const { context, page } = await open({ name: 'right password' });
    const sent = [];
    page.on('request', (r) => sent.push(`${r.url()} ${r.postData() || ''}`));
    await page.goto(base + DEEP);
    await card(page).waitFor({ timeout: 20000 });

    // case matters, spaces at the ends do not
    const flipped = PASSWORD === PASSWORD.toLowerCase() ? PASSWORD.toUpperCase() : PASSWORD.toLowerCase();
    await guess(page, flipped);
    await wrongAnswerShown(page);
    check(!(await siteShown(page)), 'the password is case-sensitive');

    await guess(page, `  ${PASSWORD}  `);
    await page.locator('header.site-head').waitFor({ timeout: 30000 });
    check((await card(page).count()) === 0, 'the right password (with spaces around it) opens the site');
    check(!sent.some((s) => s.includes(PASSWORD) || s.includes(encodeURIComponent(PASSWORD))), 'what was typed was never sent anywhere');
    check(new URL(page.url()).hash === DEEP, 'the visitor lands on the page the link was for, not on the home page');
    await page.locator('main h1').first().waitFor({ timeout: 20000 });
    check(((await page.locator('main h1').first().innerText()) || '').length > 3, 'and that lesson is shown');

    const saved = JSON.parse((await note(page)) || 'null');
    const days = saved ? (saved.until - Date.now()) / 864e5 : 0;
    check(!!saved && days > 29 && days <= 30.01, `the login is remembered on this device for 30 days (${days.toFixed(1)})`);
    check((await note(page, 'sessionStorage')) === null, 'the browser-session copy is not used when the login is kept');
    await shot(page, 'after-login');

    await page.reload();
    await page.locator('header.site-head').waitFor({ timeout: 30000 });
    check((await card(page).count()) === 0, 'a reload does not ask again');

    // the footer link and the login are separate from progress
    await page.evaluate(() => localStorage.setItem('cq:pref:test-marker', '1'));
    await page.getByRole('button', { name: 'Log out' }).click();
    await card(page).waitFor({ timeout: 20000 });
    check((await note(page)) === null, 'Log out: the saved login is gone');
    check(!(await siteShown(page)), 'Log out: the password screen is back');
    check((await page.evaluate(() => localStorage.getItem('cq:pref:test-marker'))) === '1', 'Log out: nothing else on the device was erased (progress stays)');
    check(new URL(page.url()).hash === '', 'Log out: the address no longer points at the lesson');
    await context.close();
  }

  if (PASSWORD) {
    // "Keep me logged in" switched off: only this browser session
    {
      const { context, page } = await open({ name: 'not remembered' });
      await page.goto(base);
      await card(page).waitFor({ timeout: 20000 });
      await page.getByLabel('Keep me logged in on this device').uncheck();
      await guess(page, PASSWORD);
      await page.locator('header.site-head').waitFor({ timeout: 30000 });
      check((await note(page)) === null && !!(await note(page, 'sessionStorage')), 'without "Keep me logged in" the note lives only in this browser session');
      await page.reload();
      await page.locator('header.site-head').waitFor({ timeout: 30000 });
      check(true, 'a reload in the same tab does not ask again');
      const other = await context.newPage();
      await other.goto(base);
      await card(other).waitFor({ timeout: 20000 });
      check(true, 'a new tab does ask again');
      await context.close();
    }

    // Enter submits
    {
      const { context, page } = await open({ name: 'enter key' });
      await page.goto(base);
      await card(page).waitFor({ timeout: 20000 });
      await field(page).fill(PASSWORD);
      await field(page).press('Enter');
      await page.locator('header.site-head').waitFor({ timeout: 30000 });
      check(true, 'the Enter key sends the password');
      await context.close();
    }
  }

  // ---- 6. phones, dark theme and big text ------------------------------------------------------------------------
  for (const [label, opts] of [
    ['phone 390 px', { width: 390, height: 844, mobile: true }],
    ['phone 390 px, dark', { width: 390, height: 844, mobile: true, dark: true }],
    ['small phone 320 px', { width: 320, height: 640, mobile: true }],
    ['small phone 320 px, text at 150%', { width: 320, height: 640, mobile: true, text: 24 }],
    ['tablet 768 px', { width: 768, height: 1024, mobile: true }],
  ]) {
    const { context, page } = await open({ ...opts, name: label });
    await page.goto(base);
    await card(page).waitFor({ timeout: 20000 });
    await noSideScroll(page, label);
    const box = await card(page).boundingBox();
    const vw = await page.evaluate(() => document.documentElement.clientWidth);
    check(!!box && box.x >= 0 && box.x + box.width <= vw + 0.5, `${label}: the card is inside the screen`);
    for (const sel of ['#login-pw', '.login-show', '.login-go']) {
      const b = await page.locator(sel).boundingBox();
      check(!!b && b.x >= 0 && b.x + b.width <= vw + 0.5 && b.width >= 40 && b.height >= 38, `${label}: ${sel} is inside the screen and big enough to tap (${b ? Math.round(b.width) + ' x ' + Math.round(b.height) : '?'})`);
    }
    if (opts.dark) await shot(page, 'phone-dark');
    else if (opts.width === 390) await shot(page, 'phone-light');
    await context.close();
  }
} catch (err) {
  problems.push(`the test stopped with an error: ${err.message}`);
} finally {
  await browser.close();
  server.close();
}

if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems.slice(0, 25)) console.log('  ' + p.split('\n')[0].slice(0, 260));
  process.exit(1);
}
console.log(`\nThe password screen works${PASSWORD ? '' : ' (the checks that need the password were skipped)'}.`);
