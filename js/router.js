// Hash router: works on GitHub Pages without any server configuration.
//   #/                       home
//   #/c/python               course map
//   #/c/python/<module>      module page
//   #/c/python/<module>/<lesson> | quiz | game
//   #/play  #/progress  #/help  #/certificate/python

import { h, clear } from './lib/util.js';
import { icon } from './lib/icons.js';
import { runner } from './py/runner.js';

const routes = [];
let mountEl = null;
let cleanup = null;
let token = 0;

export function route(pattern, name, view) {
  const keys = [];
  const re = new RegExp(
    '^' +
      pattern.replace(/:([a-z]+)/g, (_, k) => {
        keys.push(k);
        return '([^/]+)';
      }) +
      '/?$'
  );
  routes.push({ re, keys, name, view });
}

export function parseHash(hash = location.hash) {
  let p = hash.replace(/^#/, '') || '/';
  let query = '';
  const q = p.indexOf('?');
  if (q !== -1) {
    query = p.slice(q + 1);
    p = p.slice(0, q);
  }
  return { path: p.startsWith('/') ? p : '/' + p, query: new URLSearchParams(query) };
}

export function href(path) {
  return '#' + path;
}

export function navigate(path, { replace = false } = {}) {
  const target = '#' + path;
  if (replace) history.replaceState(null, '', target);
  else location.hash = target;
  if (replace) render();
}

function match(path) {
  for (const r of routes) {
    const m = r.re.exec(path);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { route: r, params };
    }
  }
  return null;
}

function loadingView() {
  return h('div.page-loading', { role: 'status' }, h('span.spinner'), h('span', 'Loading…'));
}

function errorView(err, retry) {
  console.error(err);
  return h(
    'section.page.narrow',
    h('h1', 'This page could not load'),
    h('p', 'Something went wrong while loading the content. Check your connection and try again.'),
    h('pre.code-static.output', h('code', String((err && err.message) || err))),
    h('div.btn-row', h('button.btn.btn-primary', { type: 'button', onclick: retry }, 'Try again'), h('a.btn.btn-secondary', { href: '#/' }, 'Go to the home page'))
  );
}

export async function render() {
  const my = ++token;
  const { path, query } = parseHash();
  if (cleanup) {
    try {
      cleanup();
    } catch (e) {
      console.error(e);
    }
    cleanup = null;
  }
  if (runner.status === 'running') runner.stop();
  const found = match(path);
  clear(mountEl);
  mountEl.appendChild(loadingView());
  mountEl.setAttribute('aria-busy', 'true');
  let out;
  try {
    if (!found) throw Object.assign(new Error('There is no page at ' + path), { notFound: true });
    out = await found.route.view(found.params, query);
  } catch (err) {
    if (my !== token) return;
    clear(mountEl);
    mountEl.appendChild(
      err && err.notFound
        ? h('section.page.narrow', h('h1', 'Page not found'), h('p', err.message), h('a.btn.btn-primary', { href: '#/' }, icon('home', 16), 'Back to the home page'))
        : errorView(err, () => render())
    );
    mountEl.removeAttribute('aria-busy');
    document.title = 'Something went wrong';
    window.scrollTo(0, 0);
    return;
  }
  if (my !== token) return; // a newer navigation won
  clear(mountEl);
  mountEl.appendChild(out.node);
  mountEl.removeAttribute('aria-busy');
  cleanup = out.cleanup || null;
  document.title = out.title ? `${out.title} · Learn Python` : 'CodeQuest Academy';
  document.dispatchEvent(new CustomEvent('route', { detail: { name: found.route.name, path, params: found.params } }));
  if (!out.keepScroll) window.scrollTo(0, 0);
  const focusTarget = mountEl.querySelector('h1');
  if (focusTarget) {
    focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: true });
  }
  if (out.after) out.after();
}

export function start(el) {
  mountEl = el;
  window.addEventListener('hashchange', render);
  render();
}
