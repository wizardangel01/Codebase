// The password screen's logic. The site asks for a password before it starts; js/views/login.js is the screen.
//
// js/auth-config.js holds a salted PBKDF2 hash of the password (tools/set-password.mjs writes it). When someone
// types a password, the browser works out the same hash with Web Crypto and compares the two. When they match, a
// small "unlocked" note is kept on this device (30 days, or until the browser is closed) so that they are not asked
// again at every visit. The note names the hash it was made for, so choosing a new password logs everybody out.
//
// This is a door for casual visitors, not a vault. Every file of the site can be fetched by anyone who knows how to
// look, and a short password can be guessed offline from the published hash. See docs/DEV_NOTES.md.
import { AUTH } from './auth-config.js';

// Neither 'cq:v1' itself nor 'cq:v1:draft:…', so "Reset my progress" and the progress backup leave the note alone.
export const AUTH_KEY = 'cq:v1:auth';
const REMEMBER_DAYS = 30;
const SESSION_HOURS = 12;
const DAY = 864e5;

// For browsers where no storage works at all: the answer then lasts until the page is closed.
let unlockedHere = false;

/** True when the site is set up to ask for a password. */
export const gateOn = () => !!(AUTH && AUTH.enabled && AUTH.salt && AUTH.hash && AUTH.iterations);

/** The browser can only do the arithmetic on a secure address: https://, http://localhost or http://127.0.0.1. */
export const canCheck = () => !!(globalThis.crypto && globalThis.crypto.subtle && typeof globalThis.crypto.subtle.deriveBits === 'function');

const fingerprint = () => String(AUTH.hash).slice(0, 12);
const fromBase64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));

/** Compares two strings without stopping at the first difference. */
function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Resolves true or false. Throws when the browser cannot do the arithmetic (see canCheck).
 * What is hashed: the password without spaces at the ends, in NFC form (tools/set-password.mjs does the same).
 */
export async function checkPassword(password) {
  if (!canCheck()) throw new Error('This address is not secure, so the browser cannot check passwords here.');
  const bytes = new TextEncoder().encode(String(password).trim().normalize('NFC'));
  const key = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64(AUTH.salt), iterations: AUTH.iterations }, key, 256);
  return same(toBase64(bits), String(AUTH.hash));
}

/** The storage areas that can be read right now (reading them throws in some private windows). */
function areas() {
  const list = [];
  for (const name of ['localStorage', 'sessionStorage']) {
    try {
      list.push(window[name]);
    } catch {}
  }
  return list;
}

/** Has this browser already been let in, with the password that is current now? Always true when no password is set. */
export function isUnlocked() {
  if (!gateOn()) return true;
  if (unlockedHere) return true;
  for (const area of areas()) {
    try {
      const note = JSON.parse(area.getItem(AUTH_KEY) || 'null');
      if (note && note.f === fingerprint() && Number(note.until) > Date.now()) return true;
    } catch {}
  }
  return false;
}

/**
 * Remember that the right password was typed. `remember`: keep the note for 30 days on this device.
 * Otherwise it only lasts for this browser session (the tab, and 12 hours at most).
 */
export function unlock(remember = true) {
  unlockedHere = true;
  const note = (days) => JSON.stringify({ f: fingerprint(), until: Date.now() + days * DAY });
  try {
    if (remember) {
      localStorage.setItem(AUTH_KEY, note(REMEMBER_DAYS));
    } else {
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.setItem(AUTH_KEY, note(SESSION_HOURS / 24));
    }
  } catch {}
}

/** Forget it: the next visit asks for the password again. Progress is not touched. */
export function lock() {
  unlockedHere = false;
  for (const area of areas()) {
    try {
      area.removeItem(AUTH_KEY);
    } catch {}
  }
}
