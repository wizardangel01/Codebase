// App entry: builds the header and footer, registers routes, wires up rewards.

import { h } from './lib/util.js';
import { icon } from './lib/icons.js';
import { SITE } from './config.js';
import { prefs, store, rankFor } from './store.js';
import { route, start } from './router.js';
import { toast } from './ui/toast.js';
import { evaluateBadges } from './badges.js';
import { loadCourseList, loadCourse } from './content.js';
import { runner } from './py/runner.js';
import { gateOn, isUnlocked, lock } from './auth.js';
import { brandMark } from './ui/brand.js';
import { startQuotes } from './ui/quote-card.js';

// ---- routes (views load on demand) ------------------------------------------
const view = (path, name, file, fn) => route(path, name, async (p, q) => (await import(file))[fn](p, q));
view('/', 'home', './views/home.js', 'homeView');
view('/c/:course', 'course', './views/course.js', 'courseView');
view('/c/:course/:module', 'module', './views/module.js', 'moduleView');
view('/c/:course/:module/quiz', 'quiz', './views/quiz.js', 'quizView');
view('/c/:course/:module/game', 'game', './views/game.js', 'gameView');
view('/c/:course/:module/:lesson', 'lesson', './views/lesson.js', 'lessonView');
view('/play', 'play', './views/play.js', 'playView');
view('/play/:code', 'play', './views/play.js', 'playView');
view('/progress', 'progress', './views/progress.js', 'progressView');
view('/certificate/:course', 'certificate', './views/certificate.js', 'certificateView');
view('/help', 'help', './views/help.js', 'helpView');

// ---- theme --------------------------------------------------------------------
function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'light' || mode === 'dark') root.dataset.theme = mode;
  else delete root.dataset.theme;
}
const effectiveTheme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// ---- header / footer ------------------------------------------------------------
const NAV = [
  { id: 'course', href: '#/c/python', label: 'Course', icon: 'map' },
  { id: 'play', href: '#/play', label: 'Playground', icon: 'terminal' },
  { id: 'progress', href: '#/progress', label: 'Progress', icon: 'trophy' },
  { id: 'help', href: '#/help', label: 'Help', icon: 'info' },
];
const ROUTE_NAV = { course: 'course', module: 'course', lesson: 'course', quiz: 'course', game: 'course', play: 'play', progress: 'progress', certificate: 'progress', help: 'help' };

function buildHeader() {
  const rankName = h('span.xp-rank');
  const xpText = h('span.xp-num');
  const streak = h('span.xp-streak', { hidden: true });
  const chip = h('a.xp-chip', { href: '#/progress', title: 'Your progress' }, icon('zap', 15), rankName, xpText, streak);
  const refresh = () => {
    const s = store.state;
    const r = rankFor(s.xp);
    rankName.textContent = r.name;
    xpText.textContent = `${s.xp.toLocaleString()} XP`;
    streak.hidden = s.streak.count < 2;
    streak.replaceChildren(icon('flame', 14), String(s.streak.count));
    streak.title = `${s.streak.count}-day streak`;
  };
  refresh();
  store.subscribe(refresh);

  const themeBtn = h('button.btn.btn-ghost.btn-icon.theme-btn', { type: 'button', 'aria-label': 'Switch between light and dark theme', onclick: toggleTheme });
  function paintThemeBtn() {
    const dark = effectiveTheme() === 'dark';
    themeBtn.replaceChildren(icon(dark ? 'sun' : 'moon', 19));
    themeBtn.title = dark ? 'Switch to the light theme' : 'Switch to the dark theme';
  }
  function toggleTheme() {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    prefs.set('theme', next);
    applyTheme(next);
    paintThemeBtn();
  }
  paintThemeBtn();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintThemeBtn);

  const nav = h(
    'nav.site-nav',
    { 'aria-label': 'Main' },
    NAV.map((n) => h('a.nav-link', { href: n.href, dataset: { nav: n.id } }, icon(n.icon, 20), h('span', n.label)))
  );
  const offline = h('span.offline-chip', { hidden: navigator.onLine !== false, title: 'You are offline. Lessons you have opened before still work.' }, icon('wifi_off', 14), h('span.offline-text', 'Offline'));
  window.addEventListener('online', () => (offline.hidden = true));
  window.addEventListener('offline', () => (offline.hidden = false));

  document.addEventListener('route', (e) => {
    const active = ROUTE_NAV[e.detail.name];
    nav.querySelectorAll('.nav-link').forEach((a) => {
      const on = a.dataset.nav === active;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  });

  const head = h('header.site-head', h('a.brand', { href: '#/', 'aria-label': `${SITE.name} home` }, brandMark(), h('span.brand-name', SITE.short)), nav, h('div.head-tools', offline, chip, themeBtn));
  fitHeader(head);
  return head;
}

// Keeps the top bar on the screen. When it is too wide (a long streak, the offline notice, enlarged text,
// a narrow phone) the less important parts go, one step at a time: first the streak, then the wordmark,
// then the word "Offline" (its icon stays). The CSS for the steps is in base.css (.is-tight and so on).
const TIGHT = ['is-tight', 'is-tighter', 'is-tightest'];
function fitHeader(head) {
  const tools = head.querySelector('.head-tools');
  const fit = () => {
    head.classList.remove(...TIGHT);
    if (!head.isConnected || !head.clientWidth) return;
    const room = head.clientWidth - (parseFloat(getComputedStyle(head).paddingRight) || 0) + 0.5;
    for (const step of TIGHT) {
      if (tools.getBoundingClientRect().right <= room) break;
      head.classList.add(step);
    }
  };
  if (typeof ResizeObserver === 'function') {
    const watcher = new ResizeObserver(fit);
    watcher.observe(head);
    watcher.observe(tools);
    watcher.observe(head.querySelector('.brand'));
  }
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  requestAnimationFrame(fit);
}

// Forgets the password note on this device and shows the password screen again. Progress is not touched.
function logOut() {
  lock();
  try {
    history.replaceState(null, '', location.pathname + location.search);
  } catch {}
  location.reload();
}

function buildFooter() {
  return h(
    'footer.site-foot',
    h('p', `${SITE.name}. Lessons, exercises and games run in your browser with Python 3 (Pyodide). Progress is stored on this device only.`),
    h(
      'p.foot-links',
      h('a', { href: '#/help' }, 'Help'),
      h('a', { href: '#/help' }, 'Use offline'),
      h('a', { href: '#/progress' }, 'Back up my progress'),
      SITE.repoUrl ? h('a', { href: SITE.repoUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Source on GitHub') : null,
      gateOn() ? h('button.foot-btn', { type: 'button', onclick: logOut }, 'Log out') : null
    )
  );
}

// ---- rewards ---------------------------------------------------------------------------
function wireRewards() {
  store.onAward(({ xp, reason }) => toast(`+${xp} XP`, { kind: 'xp', icon: 'zap', detail: reason }));
  let timer;
  const check = async () => {
    try {
      const list = await loadCourseList();
      const courses = await Promise.all(list.map((c) => loadCourse(c.id)));
      const fresh = evaluateBadges(courses);
      fresh.forEach((b, i) => setTimeout(() => toast(`Badge unlocked: ${b.title}`, { kind: 'badge', icon: 'award', detail: b.text, ms: 5000 }), 700 + i * 700));
    } catch (e) {
      console.warn('Badge check skipped:', e.message);
    }
  };
  store.subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(check, 500);
  });
}

// ---- boot ---------------------------------------------------------------------------------
function boot() {
  const app = document.getElementById('app');
  if (location.protocol === 'file:') {
    app.before(h('div.banner.is-warn', { role: 'alert' }, icon('warn', 18), h('span', 'This page was opened from a file. Lessons load, but Python cannot start from a file address. Open the site from GitHub Pages, or run “python -m http.server” in the project folder and visit http://localhost:8000.')));
  }
  document.body.prepend(buildHeader());
  const main = h('main#main', { tabindex: '-1' });
  app.replaceWith(main);
  document.body.append(buildFooter());
  wireRewards();
  startQuotes();
  start(main);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  // Start downloading Python quietly once the page is idle on lesson-like pages.
  document.addEventListener('route', (e) => {
    if (['lesson', 'game', 'play'].includes(e.detail.name) && runner.status === 'idle' && !navigator.connection?.saveData) {
      const warm = () => runner.warm();
      if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 });
      else setTimeout(warm, 2500);
    }
  });
}

// ---- start-up ------------------------------------------------------------------------------
// When a password is set (js/auth-config.js) and this browser has not been let in yet, the password screen comes
// first and the rest of the site is only built after the right password was typed. The address (#/c/python/...)
// is left alone meanwhile, so a link to a lesson still opens that lesson afterwards.
async function startup() {
  applyTheme(prefs.get('theme', 'auto'));
  if (gateOn() && !isUnlocked()) {
    const { showLogin } = await import('./views/login.js');
    await showLogin(document.getElementById('app'));
  }
  boot();
}

window.addEventListener('unhandledrejection', (e) => console.warn('Unhandled promise rejection:', e.reason));
startup().catch((err) => {
  console.error(err);
  const where = document.getElementById('app') || document.getElementById('main');
  if (where) where.replaceChildren(h('div.page.narrow', h('h1', 'The site could not start'), h('p', 'Reload the page. If this keeps happening, check your connection and try again.'), h('p.muted', String((err && err.message) || err))));
});
