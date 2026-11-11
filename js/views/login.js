// The password screen. It is shown instead of the site until the right password has been typed
// (js/main.js decides when; js/auth.js does the checking).
import { h } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { brandMark } from '../ui/brand.js';
import { SITE } from '../config.js';
import { canCheck, checkPassword, unlock } from '../auth.js';

// The same words for every wrong guess. They say nothing about what the password looks like.
const WRONG = 'That password is not right. Passwords are case-sensitive, so check the capital letters.';

/** Shows the screen inside `app` and resolves once the right password has been typed (and has been remembered). */
export function showLogin(app) {
  document.title = `Log in · ${SITE.name}`;
  return new Promise((resolve) => {
    const secure = canCheck();

    const pw = h('input.input#login-pw', {
      type: 'password',
      name: 'password',
      autocomplete: 'current-password',
      autocapitalize: 'none',
      autocorrect: 'off',
      spellcheck: 'false',
      enterkeyhint: 'go',
      required: true,
      disabled: !secure,
      'aria-describedby': 'login-caps login-msg',
    });
    const show = h('button.btn.btn-secondary.login-show', { type: 'button', 'aria-controls': 'login-pw', 'aria-label': 'Show password', disabled: !secure }, 'Show');
    // Both messages are always in the page (empty at first), so a screen reader announces them when text appears.
    const caps = h('p.login-caps#login-caps', { 'aria-live': 'polite' });
    const msg = h('p.login-msg#login-msg', { role: 'alert' });
    const remember = h('input', { type: 'checkbox', id: 'login-remember', checked: true });
    const idle = () => [icon('lock', 18), 'Log in'];
    const go = h('button.btn.btn-primary.btn-lg.login-go', { type: 'submit', disabled: !secure }, ...idle());

    const form = h(
      'form.login-card',
      { novalidate: true, onsubmit: submit },
      h('div.login-brand', brandMark(), h('span', SITE.name)),
      h('h1', 'Log in to continue'),
      h('p.login-lede', 'Type the password to open the course.'),
      secure ? null : h('div.notice.is-warn', { role: 'alert' }, icon('warn', 18), h('span', 'This address is not secure, so the browser cannot check the password. Open the site from its https:// address (the GitHub Pages link), or from http://localhost.')),
      h('label.login-label', { for: 'login-pw' }, 'Password'),
      h('div.login-field', pw, show),
      caps,
      msg,
      h('label.login-remember', { for: 'login-remember' }, remember, h('span', 'Keep me logged in on this device')),
      go,
      h('p.login-note.muted', 'Lost the password? Ask the person who gave you the link. Your progress is saved on this device only.')
    );

    show.addEventListener('click', () => {
      const reveal = pw.type === 'password';
      pw.type = reveal ? 'text' : 'password';
      show.textContent = reveal ? 'Hide' : 'Show';
      show.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      pw.focus();
    });

    // The password is case-sensitive, so a Caps Lock that was left on deserves a word.
    const watchCaps = (e) => {
      if (e.getModifierState) caps.textContent = e.getModifierState('CapsLock') ? 'Caps Lock is on.' : '';
    };
    pw.addEventListener('keydown', watchCaps);
    pw.addEventListener('keyup', watchCaps);
    pw.addEventListener('blur', () => (caps.textContent = ''));
    pw.addEventListener('input', () => {
      if (msg.textContent) msg.textContent = '';
      pw.removeAttribute('aria-invalid');
    });

    function fail(text) {
      // clear first, so that the same sentence is announced again after a second wrong guess
      msg.textContent = '';
      setTimeout(() => (msg.textContent = text), 40);
      pw.setAttribute('aria-invalid', 'true');
      form.classList.remove('is-wrong');
      void form.offsetWidth;
      form.classList.add('is-wrong');
      pw.focus();
    }

    let busy = false;
    async function submit(e) {
      e.preventDefault();
      if (busy || !secure) return;
      if (!pw.value.trim()) return fail('Type the password first.');
      busy = true;
      go.disabled = true;
      go.replaceChildren('Checking…');
      let ok = false;
      try {
        ok = await checkPassword(pw.value);
      } catch (err) {
        console.warn('Password check failed:', err);
        busy = false;
        go.disabled = false;
        go.replaceChildren(...idle());
        return fail('Your browser could not check the password. Try again, or use a recent version of Chrome, Edge, Firefox or Safari.');
      }
      if (ok) {
        unlock(remember.checked);
        app.replaceChildren();
        resolve();
        return;
      }
      busy = false;
      go.disabled = false;
      go.replaceChildren(...idle());
      fail(WRONG);
      pw.select();
    }

    app.replaceChildren(h('main.login-page#main', { tabindex: '-1' }, form));
    if (secure) pw.focus();
  });
}
