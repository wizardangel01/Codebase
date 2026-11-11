// Motivational quotes that show up now and then without getting in the way.
//
// What "without getting in the way" means here (tools/quotes.mjs tests each point):
//  - it is a small card in the corner, not a dialog: it never takes the focus, it lets every click and tap through to
//    the page underneath (only its own close button can be pressed) and it goes away by itself;
//  - it waits for a calm moment: not just after a key press, a click or scrolling, not while a text box is in use,
//    not while Python runs, not while a dialog or a toast is open, not in a quiz or a game, and never while the tab
//    is hidden (the clock stops there too);
//  - it never speaks over a screen reader: only a quote that was asked for ("Show one now" on the Help page) is announced;
//  - with reduced motion it simply appears and disappears, and it is left out of printouts;
//  - one switch on the Help page turns it off or changes how often it comes.
// The timing is in config.js (QUOTE_TIMING) and the quotes are in js/quotes.js.
import { h, clamp } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { QUOTE_TIMING as T } from '../config.js';
import { QUOTES } from '../quotes.js';
import { prefs } from '../store.js';
import { runner } from '../py/runner.js';

export const QUOTE_CHOICES = [
  { value: 'off', label: 'Off' },
  { value: '3', label: 'Every 3 minutes' },
  { value: '5', label: 'Every 5 minutes' },
  { value: '10', label: 'Every 10 minutes' },
  { value: '20', label: 'Every 20 minutes' },
];
const DEFAULT = '5';

/** 'off', or the minutes between two quotes, as text. Kept on this device like the other preferences. */
export function quoteSetting() {
  const v = prefs.get('quotes', DEFAULT);
  return QUOTE_CHOICES.some((c) => c.value === v) ? v : DEFAULT;
}
const everyMs = () => (quoteSetting() === 'off' ? 0 : Number(quoteSetting()) * 60000);

// A box where text is typed. (Check boxes, buttons and sliders are not.)
const TEXT_FIELD = 'textarea, select, input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="range"]), [contenteditable]:not([contenteditable="false"])';

let started = false;
let slot = null; // #quote-slot: holds the card and a hidden message area for screen readers
let live = null;
let card = null; // the card that is on the screen, if any
let timer = 0; // "time for the next quote"
let dueAt = 0;
let leftWhenHidden = 0; // how long was still to wait when the tab went into the background
let hideTimer = 0; // "time to take the card away"
let lastKey = 0; // when a key was last pressed, when the screen was last touched or clicked, and when it last scrolled
let lastTouch = 0;
let lastScroll = 0;

const inQuietPlace = () => T.quietPlaces.test(location.hash.split('?')[0]);

/** Is this a moment when nobody is concentrating? */
function calm() {
  const now = Date.now();
  if (document.hidden || card || inQuietPlace()) return false;
  if (now - lastKey < T.typingMs || now - lastTouch < T.clickMs || now - lastScroll < T.scrollMs) return false;
  const a = document.activeElement;
  if (a && a.matches && a.matches(TEXT_FIELD) && now - Math.max(lastKey, lastTouch) < T.workingMs) return false;
  if (runner.status === 'running') return false;
  if (document.querySelector('dialog[open], [role="dialog"], [aria-modal="true"]')) return false;
  const toasts = document.getElementById('toasts');
  if (toasts && toasts.children.length) return false;
  return true;
}

/** A quote that was not among the last few shown. */
function pick() {
  let recent = [];
  try {
    recent = JSON.parse(prefs.get('quote-recent', '[]'));
  } catch {}
  if (!Array.isArray(recent)) recent = [];
  const pool = QUOTES.map((_, i) => i).filter((i) => !recent.includes(i));
  const i = pool.length ? pool[Math.floor(Math.random() * pool.length)] : Math.floor(Math.random() * QUOTES.length);
  prefs.set('quote-recent', JSON.stringify([i, ...recent].slice(0, Math.min(T.keepRecent, QUOTES.length - 1))));
  return QUOTES[i];
}

function ensureSlot() {
  if (slot && document.body.contains(slot)) return slot;
  live = h('div#quote-live.sr-only', { 'aria-live': 'polite', 'aria-atomic': 'true' });
  slot = h('div#quote-slot', live);
  document.body.append(slot);
  return slot;
}

const arm = (ms) => {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => hide(), ms);
};

function hide(now = false) {
  clearTimeout(hideTimer);
  if (live) live.textContent = '';
  const el = card;
  if (!el) return;
  card = null;
  el.classList.remove('in');
  if (now) el.remove();
  else setTimeout(() => el.remove(), 350);
}

/** Puts the card on the screen. `asked`: the learner pressed "Show one now", so it is also announced and stays longer. */
function show(q, asked) {
  hide(true);
  ensureSlot();
  const close = h('button.quote-x', { type: 'button', 'aria-label': 'Hide this quote', title: 'Hide', onclick: () => hide() }, icon('x', 16));
  const el = h('aside.quote-card', { 'aria-label': 'A quote for you' }, h('blockquote.quote-text', q.text), q.by ? h('p.quote-by', q.by) : null, close);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  // someone who reaches the close button with the keyboard gets time to use it
  el.addEventListener('focusin', () => clearTimeout(hideTimer));
  el.addEventListener('focusout', () => arm(4000));
  slot.append(el);
  card = el;
  void el.offsetWidth; // so that the fade-in starts from the hidden state
  el.classList.add('in');
  live.textContent = asked ? [q.text, q.by].filter(Boolean).join(' ') : '';
  arm(asked ? T.askedMs : clamp(T.showMs + q.text.length * T.perCharMs, T.showMs, T.maxShowMs));
  prefs.set('quote-last', Date.now());
}

// ---- the clock -------------------------------------------------------------------------------
function schedule(ms) {
  clearTimeout(timer);
  timer = 0;
  if (!started || !everyMs()) return;
  if (document.hidden) {
    leftWhenHidden = ms;
    return;
  }
  dueAt = Date.now() + ms;
  timer = setTimeout(tick, ms);
}

function tick() {
  timer = 0;
  if (!everyMs()) return;
  if (calm()) {
    show(pick(), false);
    schedule(everyMs());
  } else {
    schedule(T.retryMs); // not now: try again a little later
  }
}

function onVisibility() {
  if (document.hidden) {
    hide(true);
    if (timer) {
      leftWhenHidden = Math.max(1000, dueAt - Date.now());
      clearTimeout(timer);
      timer = 0;
    }
  } else if (started && everyMs() && !timer) {
    schedule(leftWhenHidden || everyMs());
    leftWhenHidden = 0;
  }
}

function watch() {
  document.addEventListener(
    'keydown',
    (e) => {
      lastKey = Date.now();
      // typing in a text box while a card is showing: the card gets out of the way at once
      if (card && e.target && e.target.matches && e.target.matches(TEXT_FIELD)) hide();
    },
    true
  );
  document.addEventListener('pointerdown', () => (lastTouch = Date.now()), true);
  document.addEventListener('scroll', () => (lastScroll = Date.now()), { capture: true, passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('hashchange', () => {
    if (inQuietPlace()) hide();
  });
  // a toast (XP earned, badge unlocked) is news the learner asked for with their work: it wins the corner
  const toasts = document.getElementById('toasts');
  if (toasts) new MutationObserver(() => card && toasts.children.length && hide()).observe(toasts, { childList: true });
}

// ---- what the rest of the app uses ---------------------------------------------------------------
/** Called once when the site has been built. The first quote comes a little later, then one every few minutes. */
export function startQuotes() {
  if (started) return;
  started = true;
  ensureSlot();
  watch();
  const every = everyMs();
  if (every) {
    const sinceLast = Date.now() - (Number(prefs.get('quote-last', 0)) || 0); // a reload does not bring another one at once
    schedule(clamp(every - Math.max(0, sinceLast), T.firstMs, every));
  }
}

/** The switch on the Help page: 'off', '3', '5', '10' or '20'. */
export function setQuoteSetting(value) {
  prefs.set('quotes', value);
  leftWhenHidden = 0;
  schedule(everyMs());
  if (!everyMs()) hide();
}

/** The "Show one now" button: shows a quote at once, and announces it to a screen reader. */
export function showQuoteNow() {
  show(pick(), true);
  schedule(everyMs());
}
