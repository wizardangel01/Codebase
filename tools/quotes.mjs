// Motivational quotes test. The quotes must come at intervals and must never get in the way of the work.
// It opens the site in a real browser with a fake clock (so minutes pass in a moment) and checks that a quote
// arrives on time, goes away by itself, can be closed and switched off, and that it stays away while the learner
// is typing, running code, in a quiz, in a dialog, reading a toast, or has the tab in the background. It also checks
// the card on a phone, with reduced motion, in print, and the list of quotes itself.
//
//   node tools/quotes.mjs
//   node tools/quotes.mjs --shots=/some/dir     keep screenshots of the card
//
// Needs Playwright for Node and a Chromium browser (see tools/smoke.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from './serve.mjs';
import { unlockContext } from './lib/unlock.mjs';
import { QUOTES } from '../js/quotes.js';
import { QUOTE_TIMING as T } from '../js/config.js';

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

const shots = (process.argv.slice(2).find((a) => a.startsWith('--shots=')) || '').slice(8);
if (shots) fs.mkdirSync(shots, { recursive: true });

const problems = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) problems.push(what);
};

// ---- 0. the list itself (no browser needed) ----------------------------------------------------------------------
{
  const texts = QUOTES.map((q) => q.text);
  check(QUOTES.length >= 30, `there are plenty of quotes (${QUOTES.length}), so they do not repeat soon`);
  check(new Set(texts).size === texts.length, 'no quote is listed twice');
  check(QUOTES.every((q) => q.text.trim() === q.text && q.text.length >= 15), 'every quote has real text, with no spaces around it');
  const longest = Math.max(...texts.map((t) => t.length));
  check(longest <= 130, `every quote is short enough for the small card on a phone (longest ${longest} characters)`);
  check(QUOTES.every((q) => q.by === '' || q.by.startsWith('— ')), 'a name, when there is one, is written as "— Name"');
  check(QUOTES.every((q) => !/\s{2,}|["“”]/.test(q.text)), 'no double spaces or quotation marks inside the text (the card adds its own style)');
  check(T.quietPlaces.test('#/c/python/meet-python/quiz') && T.quietPlaces.test('#/c/python/meet-python/game') && !T.quietPlaces.test('#/c/python/meet-python/hello-world') && !T.quietPlaces.test('#/play'), 'quizzes and games are quiet places; lessons and the playground are not (typing decides there)');
  check(T.maxShowMs >= T.showMs && T.askedMs >= T.maxShowMs && T.retryMs < 60000, 'the timing values make sense together');
}

const server = createServer(ROOT);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;
const { chromium } = loadPlaywright();
const browser = await chromium.launch();

const card = (page) => page.locator('.quote-card');
const shown = async (page) => (await page.locator('.quote-card.in').count()) > 0;
const fakeNow = (page) => page.evaluate(() => Date.now());

/** A fresh, logged-in browser with a fake clock that is stopped a moment after the site has started. */
async function start(url, { width = 1100, height = 800, mobile = false, dark = false, text = 16, reducedMotion = 'no-preference', name = 'page' } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, colorScheme: dark ? 'dark' : 'light', reducedMotion, serviceWorkers: 'block' });
  await unlockContext(context);
  const page = await context.newPage();
  page.on('pageerror', (e) => problems.push(`${name}: page error: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`${name}: console error: ${m.text()}`);
  });
  if (text !== 16) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Page.setFontSizes', { fontSizes: { standard: text, fixed: Math.round(text * 0.8333) } });
  }
  await page.clock.install({ time: new Date('2026-11-10T10:00:00') });
  await page.goto(base + url);
  await page.locator('header.site-head').waitFor({ timeout: 30000 });
  await page.locator('main h1').first().waitFor({ timeout: 30000 });
  await page.clock.pauseAt(new Date((await fakeNow(page)) + 100));
  return { context, page };
}

/** Lets time pass in small steps until a card is on the screen. Returns the seconds it took, or -1 when none came. */
async function secondsUntilQuote(page, maxSeconds, step = 5) {
  for (let s = 0; s <= maxSeconds; s += step) {
    if (await shown(page)) return s;
    await page.clock.runFor(step * 1000);
  }
  return (await shown(page)) ? maxSeconds : -1;
}
/** The same for the card going away. */
async function secondsUntilGone(page, maxSeconds, step = 1) {
  for (let s = 0; s <= maxSeconds; s += step) {
    if ((await card(page).count()) === 0) return s;
    await page.clock.runFor(step * 1000);
  }
  return -1;
}
const go = async (page, hash) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await page.clock.runFor(1500);
  await page.locator('main h1').first().waitFor({ timeout: 30000 });
};
async function shot(page, name) {
  await page.waitForTimeout(450); // the fade-in is a real-time CSS transition, not part of the fake clock
  if (shots) await page.screenshot({ path: path.join(shots, `quotes-${name}.png`) });
}

try {
  // ---- 1. it arrives, stays a while, goes away, comes again ----------------------------------------------------------
  {
    const { context, page } = await start('#/', { name: 'rhythm' });
    check(!(await shown(page)), 'nothing is shown when the site opens');
    const before = await page.evaluate(() => document.activeElement && document.activeElement.tagName);
    const first = await secondsUntilQuote(page, 90);
    check(first >= 25 && first <= 40, `the first quote comes about half a minute after the site opened (${first} s)`);

    const c = card(page).first();
    check(((await c.locator('.quote-text').innerText()) || '').length > 10, 'it shows a quote');
    check((await page.evaluate(() => document.activeElement && document.activeElement.tagName)) === before, 'it does not take the keyboard focus');
    check((await page.locator('#quote-live').innerText()) === '', 'it is not announced to a screen reader (nobody is interrupted)');
    check((await c.evaluate((el) => getComputedStyle(el).pointerEvents)) === 'none', 'every click and tap goes through the card to the page underneath');
    check((await page.locator('.quote-x').evaluate((el) => getComputedStyle(el).pointerEvents)) === 'auto', 'only its own close button can be pressed');
    const box = await c.boundingBox();
    const head = await page.locator('header.site-head').boundingBox();
    check(!!box && box.x < 60 && box.y + box.height <= 800 && box.y > head.y + head.height, 'it sits in the bottom corner, clear of the top bar');
    const through = await page.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return !!el && !el.closest('.quote-card'); }, [box.x + 20, box.y + box.height / 2]);
    check(through, 'a click on the card reaches what is underneath it');
    await shot(page, 'desktop');

    const shownAt = await fakeNow(page);
    const gone = await secondsUntilGone(page, 40);
    check(gone >= 8 && gone <= 22, `it goes away by itself after ${gone} seconds`);

    let next = -1;
    for (let s = 0; s <= 420; s += 5) {
      if (await shown(page)) {
        next = Math.round(((await fakeNow(page)) - shownAt) / 1000);
        break;
      }
      await page.clock.runFor(5000);
    }
    check(next >= 295 && next <= 312, `the next one comes five minutes after the last (${next} s)`);
    await context.close();
  }

  // ---- 2. never while typing ---------------------------------------------------------------------------------------
  {
    const { context, page } = await start('#/', { name: 'typing' });
    await page.evaluate(() => {
      const t = document.createElement('textarea');
      t.id = 'probe';
      t.setAttribute('aria-label', 'probe');
      t.style.cssText = 'position:fixed;left:0;top:60px;width:200px;height:60px;opacity:.02';
      document.body.append(t);
      t.focus();
    });
    let leaked = 0;
    for (let i = 0; i < 16; i++) {
      await page.keyboard.type('a');
      await page.clock.runFor(10000);
      if (await shown(page)) leaked++;
    }
    check(leaked === 0, 'no quote in more than two minutes of typing (a key every 10 seconds, past the first half minute)');
    const idle = await secondsUntilQuote(page, 90);
    check(idle >= 20 && idle <= 50, `after the typing stops, the quote waits for a while even with the cursor still in the box (${idle} s)`);
    await page.keyboard.type('z');
    check(!(await shown(page)), 'typing while a quote is showing makes it step aside at once');
    await page.clock.runFor(500);
    check((await card(page).count()) === 0, '... and it is removed');
    await context.close();
  }

  // ---- 2b. never while scrolling (someone who scrolls is reading) -------------------------------------------------------
  {
    const { context, page } = await start('#/', { name: 'scrolling' });
    await page.mouse.move(300, 400);
    let leaked = 0;
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, i % 2 ? -250 : 250);
      await page.clock.runFor(2000);
      if (await shown(page)) leaked++;
    }
    check(leaked === 0, 'no quote in more than a minute and a half of scrolling (a scroll every 2 seconds, past the first half minute)');
    const calmAgain = await secondsUntilQuote(page, 40);
    check(calmAgain >= 0 && calmAgain <= 25, `once the scrolling stops the quote follows within a moment (${calmAgain} s)`);
    await context.close();
  }

  // ---- 3. never in a quiz, back again afterwards ------------------------------------------------------------------------
  {
    const { context, page } = await start('#/', { name: 'quiz' });
    await go(page, '#/c/python/meet-python/quiz');
    check((await secondsUntilQuote(page, 180, 10)) === -1, 'no quote in three minutes of a quiz');
    await go(page, '#/');
    const back = await secondsUntilQuote(page, 60);
    check(back >= 0 && back <= 35, `back on a normal page the quote comes within a moment (${back} s)`);
    await context.close();
  }

  // ---- 4. never over a toast, a dialog or running code; a toast clears the card ------------------------------------------
  {
    const { context, page } = await start('#/', { name: 'busy' });
    const toast = (ms) => page.evaluate(async (m) => (await import('./js/ui/toast.js')).toast('Test toast', { ms: m }), ms);
    await toast(900000);
    check((await secondsUntilQuote(page, 120, 10)) === -1, 'no quote while a toast is on the screen');
    await page.evaluate(() => document.querySelector('#toasts .toast').remove());

    await page.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<div role="dialog" id="probe-dialog" aria-label="probe">x</div>'));
    check((await secondsUntilQuote(page, 120, 10)) === -1, 'no quote while a dialog is open');
    await page.evaluate(() => document.getElementById('probe-dialog').remove());

    await page.evaluate(async () => ((await import('./js/py/runner.js')).runner.status = 'running'));
    check((await secondsUntilQuote(page, 120, 10)) === -1, 'no quote while a program is running');
    await page.evaluate(async () => ((await import('./js/py/runner.js')).runner.status = 'idle'));

    const after = await secondsUntilQuote(page, 60);
    check(after >= 0 && after <= 40, `as soon as the moment is calm again the quote comes (${after} s)`);
    await toast(900000);
    await page.waitForFunction(() => !document.querySelector('.quote-card.in'), null, { timeout: 5000 }).catch(() => {});
    check(!(await shown(page)), 'a toast arriving while a quote shows takes the corner: the quote steps aside');
    await context.close();
  }

  // ---- 5. a tab in the background does not use up the interval ------------------------------------------------------------
  {
    const { context, page } = await start('#/', { name: 'hidden tab' });
    const setHidden = (hidden) =>
      page.evaluate((hide) => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => hide });
        document.dispatchEvent(new Event('visibilitychange'));
      }, hidden);
    await setHidden(true);
    check((await secondsUntilQuote(page, 900, 30)) === -1, 'no quote while the tab is in the background (fifteen minutes)');
    await setHidden(false);
    const back = await secondsUntilQuote(page, 90);
    check(back >= 20 && back <= 40, `coming back, the wait carries on where it stopped (${back} s of the half minute that was left)`);
    await context.close();
  }

  // ---- 6. the switch on the Help page, and "Show one now" -------------------------------------------------------------------
  {
    const { context, page } = await start('#/help', { name: 'help page' });
    const select = page.locator('#quote-freq');
    check((await select.inputValue()) === '5', 'the Help page offers the switch, set to every 5 minutes at first');
    check((await page.getByRole('button', { name: 'Show one now' }).count()) === 1, '... with a "Show one now" button');

    await select.selectOption('off');
    check((await page.evaluate(() => localStorage.getItem('cq:pref:quotes'))) === 'off', 'choosing Off is remembered on this device');
    check((await secondsUntilQuote(page, 1800, 30)) === -1, 'Off: no quote in half an hour');

    await select.selectOption('3');
    const three = await secondsUntilQuote(page, 260);
    check(three >= 170 && three <= 200, `Every 3 minutes: the quote comes after 3 minutes (${three} s)`);
    await secondsUntilGone(page, 40);

    // "Show one now": at once, announced, stays long enough to read
    await page.evaluate(() => document.querySelector('#quote-freq').blur());
    await page.getByRole('button', { name: 'Show one now' }).click();
    check(await shown(page), 'Show one now: the card appears at once');
    const said = ((await page.locator('#quote-live').innerText()) || '').trim();
    const written = (((await card(page).locator('.quote-text').innerText()) || '') + ' ' + ((await card(page).locator('.quote-by').count()) ? await card(page).locator('.quote-by').innerText() : '')).trim();
    check(said.length > 10 && said === written, 'Show one now: a screen reader is told the quote, because it was asked for');
    await page.clock.runFor(25000);
    check(await shown(page), 'Show one now: the card is still there after 25 seconds');
    await page.clock.runFor(8000);
    check((await card(page).count()) === 0, 'Show one now: and gone after 30');

    // close button, Escape, keyboard
    await page.getByRole('button', { name: 'Show one now' }).click();
    await page.locator('.quote-x').click();
    check(!(await shown(page)), 'the close button hides the card');
    await page.clock.runFor(500);
    check((await card(page).count()) === 0, '... and removes it');

    await page.getByRole('button', { name: 'Show one now' }).click();
    await page.locator('.quote-x').focus();
    await page.clock.runFor(60000);
    check(await shown(page), 'while the close button has the keyboard focus the card waits (it does not vanish under the cursor)');
    await page.keyboard.press('Escape');
    check(!(await shown(page)), 'Escape closes it');
    await page.clock.runFor(500);

    await page.getByRole('button', { name: 'Show one now' }).click();
    await page.locator('.quote-x').focus();
    await page.locator('.quote-x').blur();
    check((await secondsUntilGone(page, 8)) >= 0, 'leaving the close button lets it fade away by itself');

    // no repeats among the first dozen
    const seen = [];
    for (let i = 0; i < 12; i++) {
      await page.getByRole('button', { name: 'Show one now' }).click();
      seen.push(((await page.locator('#quote-live').innerText()) || '').trim());
    }
    check(new Set(seen).size === 12, `twelve quotes in a row are all different (${new Set(seen).size} different)`);
    await context.close();
  }

  // ---- 7. a reload does not bring a second quote at once -----------------------------------------------------------------------
  {
    const { context, page } = await start('#/', { name: 'reload' });
    await secondsUntilQuote(page, 90);
    await page.reload();
    await page.locator('main h1').first().waitFor({ timeout: 30000 });
    check((await secondsUntilQuote(page, 120, 10)) === -1, 'after a reload the next quote is not shown for a good while');
    await context.close();
  }

  // ---- 8. the card on a phone, with big text, with reduced motion, and in print ------------------------------------------------
  for (const [label, opts] of [
    ['phone 390 px', { width: 390, height: 844, mobile: true }],
    ['phone 390 px, dark', { width: 390, height: 844, mobile: true, dark: true }],
    ['small phone 320 px, text at 150%', { width: 320, height: 640, mobile: true, text: 24 }],
    ['tablet 768 px', { width: 768, height: 1024, mobile: true }],
  ]) {
    const { context, page } = await start('#/help', { ...opts, name: label });
    await page.getByRole('button', { name: 'Show one now' }).tap();
    const c = card(page).first();
    await c.waitFor({ timeout: 5000 });
    const [box, vw, vh] = [await c.boundingBox(), ...(await page.evaluate(() => [document.documentElement.clientWidth, window.innerHeight]))];
    const nav = await page.locator('.site-nav').boundingBox();
    const bottomNav = (await page.locator('.site-nav').evaluate((el) => getComputedStyle(el).position)) === 'fixed';
    check(!!box && box.x >= 0 && box.x + box.width <= vw + 0.5, `${label}: the card is inside the screen`);
    check(!!box && box.height <= vh * 0.55, `${label}: the card is small (${Math.round(box.height)} px of ${vh})`);
    if (bottomNav) check(box.y + box.height <= nav.y + 0.5, `${label}: it sits above the bottom navigation, not on it`);
    const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    check(scroll <= client + 1, `${label}: the card does not make the page scroll sideways`);
    const size = await c.locator('.quote-text').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    check(size >= 15, `${label}: the text is easy to read (${size} px)`);
    const close = await c.locator('.quote-x').boundingBox();
    check(close.width >= 36 && close.height >= 36, `${label}: the close button is big enough to tap (${Math.round(close.width)} x ${Math.round(close.height)})`);
    const through = await page.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return !!el && !el.closest('.quote-card'); }, [box.x + 14, box.y + box.height / 2]);
    check(through, `${label}: a tap on the card reaches what is underneath`);
    if (label === 'phone 390 px') await shot(page, 'phone');
    if (label === 'phone 390 px, dark') await shot(page, 'phone-dark');
    await context.close();
  }
  {
    const { context, page } = await start('#/help', { name: 'reduced motion', reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Show one now' }).click();
    const style = await card(page).first().evaluate((el) => ({ t: parseFloat(getComputedStyle(el).transitionDuration), tf: getComputedStyle(el).transform }));
    check(style.t < 0.01 && (style.tf === 'none' || style.tf === 'matrix(1, 0, 0, 1, 0, 0)'), 'with reduced motion the card just appears and disappears (no slide, no long fade)');
    await page.emulateMedia({ media: 'print' });
    check((await page.locator('#quote-slot').evaluate((el) => getComputedStyle(el).display)) === 'none', 'in print the card is left out');
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
console.log('\nThe quotes work, and they stay out of the way.');
