// Toasts: short messages in the corner (XP earned, badge unlocked, copied…).
import { h } from '../lib/util.js';
import { icon } from '../lib/icons.js';

let host = null;
function ensureHost() {
  if (host && document.body.contains(host)) return host;
  host = document.getElementById('toasts');
  if (!host) {
    host = h('div#toasts', { 'aria-live': 'polite', 'aria-atomic': 'false' });
    document.body.appendChild(host);
  }
  return host;
}

/**
 * toast('Copied', { kind: 'info' | 'xp' | 'badge' | 'error', icon: 'check', ms: 2600 })
 */
export function toast(text, { kind = 'info', icon: ic, ms = 2800, detail } = {}) {
  const root = ensureHost();
  const el = h(
    'div.toast.is-' + kind,
    { role: kind === 'error' ? 'alert' : 'status' },
    ic ? icon(ic, 18) : null,
    h('div.toast-body', h('strong', text), detail ? h('span', detail) : null)
  );
  root.appendChild(el);
  // two toasts of the same text in a row: keep only the newest
  const dup = Array.from(root.children).filter((c) => c !== el && c.textContent === el.textContent);
  dup.forEach((d) => d.remove());
  requestAnimationFrame(() => el.classList.add('in'));
  const remove = () => {
    el.classList.remove('in');
    setTimeout(() => el.remove(), 250);
  };
  setTimeout(remove, ms);
  el.addEventListener('click', remove);
  while (root.children.length > 3) root.firstChild.remove();
  return el;
}
