// Run Python with the very same engine as the website (Python 3.14 in Pyodide).
// Useful when you write lessons: check what a program prints, and copy real error messages.
//
//   node tools/py.mjs -c 'print(1 / 0)'
//   node tools/py.mjs program.py
//   node tools/py.mjs program.py --stdin 'Ada\n36'        (lines for input(), \n between lines)
//   node tools/py.mjs program.py --file notes.txt=./notes.txt     (a file the program can open)
//
// The program runs in a fresh empty folder, exactly as in a lesson. It prints what the program
// printed, then the error (with the traceback a learner would see) if there was one.

import fs from 'node:fs';
import { startHost } from './lib/pyhost-node.mjs';
import { stdinLines } from '../js/lib/doc.js';

const args = process.argv.slice(2);
const take = (name) => {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === name) {
      out.push(args[i + 1]);
      args.splice(i, 2);
      i--;
    }
  }
  return out;
};
const inline = take('-c');
const stdin = take('--stdin')[0] || '';
const fileArgs = take('--file');
let code = inline[0];
if (code === undefined) {
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) {
    console.error('Usage: node tools/py.mjs program.py [--stdin "a\\nb"] [--file name=path]   or   node tools/py.mjs -c "print(1)"');
    process.exit(2);
  }
  code = fs.readFileSync(file, 'utf8');
}
const files = {};
for (const f of fileArgs) {
  const [name, src] = f.split('=');
  files[name] = fs.readFileSync(src, 'utf8');
}

const { execute, host } = await startHost({ log: () => {} });
const res = await execute({ mode: 'run', code, stdin: stdinLines(stdin.replace(/\\n/g, '\n')), files });
process.stdout.write(res.stdout || '');
if (res.stdout && !res.stdout.endsWith('\n')) process.stdout.write('\n');
if (res.stderr) {
  console.log('--- stderr (shown in red on the site) ---');
  process.stdout.write(res.stderr.endsWith('\n') ? res.stderr : res.stderr + '\n');
}
if (res.error) {
  console.log(`--- ${res.error.kind} error${res.error.line ? ` on line ${res.error.line}` : ''} ---`);
  console.log(res.error.trace || `${res.error.type}: ${res.error.message}`);
}
console.log(`--- Python ${host.info.python}, ${res.ms ?? '?'} ms ---`);
process.exit(res.error ? 1 : 0);
