// Lets a test browser past the password screen without typing the password: it plants the same "unlocked" note that
// js/auth.js writes after a correct password. (tools/login.mjs tests the screen itself, with the real password.)
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { AUTH_KEY } from '../../js/auth.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** The note as text, or null when the site has no password. `valid` is how many days it should stay valid. */
export async function unlockNote(valid = 30) {
  const { AUTH } = await import(pathToFileURL(path.join(ROOT, 'js', 'auth-config.js')).href + '?t=' + Date.now());
  if (!AUTH || !AUTH.enabled) return null;
  return JSON.stringify({ f: String(AUTH.hash).slice(0, 12), until: Date.now() + valid * 864e5 });
}

/**
 * Call right after browser.newContext(...): every page of that context then starts unlocked.
 * `{ quotes: 'off' }` also switches the motivational quotes off, for long tests where a card that appears now and
 * then would only be in the way (tools/quotes.mjs tests the quotes themselves).
 */
export async function unlockContext(context, { quotes = '' } = {}) {
  const note = await unlockNote();
  await context.addInitScript(
    ([key, value, quoteSetting]) => {
      try {
        if (value) localStorage.setItem(key, value);
        if (quoteSetting) localStorage.setItem('cq:pref:quotes', quoteSetting);
      } catch {}
    },
    [AUTH_KEY, note || '', quotes]
  );
}
