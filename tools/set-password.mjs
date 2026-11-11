// Sets, checks or removes the password that the site asks for before it starts.
//
//   node tools/set-password.mjs "the new password"             choose a password (writes js/auth-config.js)
//   CQ_PASSWORD="the new password" node tools/set-password.mjs  the same, but the password stays out of your shell history
//   node tools/set-password.mjs --check "a password"            say whether it matches the current settings
//   node tools/set-password.mjs --off                           turn the password screen off
//
// Only a salted hash is written (PBKDF2 with SHA-256), never the password. Spaces at the start and the end are
// ignored, upper and lower case are not. The browser (js/auth.js) computes the same hash and compares.
// Accented letters are normalised first (NFC) so that every keyboard produces the same bytes.
//
// A password on a static site is a door for casual visitors, not a vault: see docs/DEV_NOTES.md.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'js', 'auth-config.js');
const ITERATIONS = 250000;

/** What is hashed: the password without spaces at the ends, in NFC form. js/auth.js does exactly the same. */
export const prepare = (password) => String(password).trim().normalize('NFC');

/** The same arithmetic as js/auth.js: PBKDF2-HMAC-SHA256 over the UTF-8 password, 32 bytes, base64. */
export function hashPassword(password, saltBase64, iterations = ITERATIONS) {
  return crypto.pbkdf2Sync(Buffer.from(prepare(password), 'utf8'), Buffer.from(saltBase64, 'base64'), iterations, 32, 'sha256').toString('base64');
}

const HEADER = `// Written by tools/set-password.mjs. Do not edit by hand: run the tool again to change the password.
//
// The site asks for a password before it starts (js/auth.js, js/views/login.js). Only a salted PBKDF2 hash is kept
// here, never the password itself. This is a door for casual visitors, not a vault: the lessons are ordinary files on
// a public web host, so anyone who knows how to read them can. See docs/DEV_NOTES.md ("The password screen").
`;

function writeConfig(auth) {
  const body =
    auth.enabled === false
      ? "export const AUTH = {\n  enabled: false,\n};\n"
      : `export const AUTH = {\n  enabled: true,\n  algorithm: 'PBKDF2-SHA256',\n  iterations: ${auth.iterations},\n  salt: '${auth.salt}',\n  hash: '${auth.hash}',\n};\n`;
  fs.writeFileSync(FILE, HEADER + body);
}

async function currentConfig() {
  const mod = await import(pathToFileURL(FILE).href + '?t=' + Date.now());
  return mod.AUTH;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = args.find((a) => a.startsWith('--'));
  const rest = args.filter((a) => !a.startsWith('--'));

  if (flag === '--off') {
    writeConfig({ enabled: false });
    console.log('The password screen is off. Set a password again to turn it on.');
  } else if (flag === '--check') {
    const cfg = await currentConfig();
    const pw = rest[0] ?? process.env.CQ_PASSWORD ?? '';
    if (!cfg.enabled) {
      console.log('The password screen is off, so there is nothing to check.');
    } else if (hashPassword(pw, cfg.salt, cfg.iterations) === cfg.hash) {
      console.log('That password is correct.');
    } else {
      console.log('That password does not match.');
      process.exit(1);
    }
  } else if (flag) {
    console.error(`Unknown option ${flag}. See the top of tools/set-password.mjs.`);
    process.exit(2);
  } else {
    const pw = prepare(rest[0] ?? process.env.CQ_PASSWORD ?? '');
    if (!pw) {
      console.error('Give the new password:  node tools/set-password.mjs "the new password"');
      process.exit(2);
    }
    const salt = crypto.randomBytes(16).toString('base64');
    writeConfig({ enabled: true, iterations: ITERATIONS, salt, hash: hashPassword(pw, salt, ITERATIONS) });
    console.log(`Password set. Only its hash was written, to ${path.relative(process.cwd(), FILE) || FILE}.`);
    if (pw.length < 10) console.log('Note: a longer password with digits or symbols is harder to guess. Run the tool again any time to change it.');
    console.log('Publish the change (commit and push) and everyone has to log in again with the new password.');
  }
}
