// Try programs against game levels, the way a learner does when pressing Run.
//
//   node tools/try-game.mjs content/python/pythonic-code/game.md l1 my_answer.py
//   node tools/try-game.mjs content/python/pythonic-code/game.md l1 -c 'def shout(words): return []'
//   node tools/try-game.mjs content/python/pythonic-code/game.md --variants variants.txt
//
// A variants file holds many programs. Each starts with a line "#### <level id> <pass|fail> [note]",
// and the program follows until the next such line. The tool runs every program and reports the ones
// whose result is not the expected one, so you can check that wrong answers fail, that forbidden
// constructs are refused and that other correct answers (golfed ones, for example) pass.
// A program that runs longer than the level's `timeout` (10 s by default) is stopped and counts as a
// fail, like in the browser. TRY_TIMEOUT=3 shortens the limit; VERBOSE=1 prints every verdict.
import fs from 'node:fs';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { startHost, ROOT } from './lib/pyhost-node.mjs';
import { parseDoc, stdinLines } from '../js/lib/doc.js';
import { parseGame, pythonLevel, harnessSource, firstInput, levelFiles } from '../js/games/levels.js';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node tools/try-game.mjs <game.md> <level id> <file.py | -c "code"> | --variants <file>');
  process.exit(2);
}
const file = path.resolve(args[0]);
const text = fs.readFileSync(file, 'utf8');
const game = parseGame(parseDoc(text, { file: args[0] }));
const readText = async (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const harness = await harnessSource(game.engine, readText);
const { pyodide, execute } = await startHost({ log: () => {} });

// The browser stops a run that takes longer than the level's `timeout` (default 10 s). Node cannot do that
// by itself, so a helper thread writes SIGINT into Pyodide's interrupt buffer once the time is up, and
// the run is reported as a timeout. Set TRY_TIMEOUT=<seconds> to use a shorter limit while experimenting.
const interrupt = new Int32Array(new SharedArrayBuffer(4));
pyodide.setInterruptBuffer(interrupt);

function startWatchdog(ms) {
  const worker = new Worker(
    `const { workerData } = require('node:worker_threads');
     const flag = new Int32Array(workerData.sab);
     const sleeper = new Int32Array(new SharedArrayBuffer(4));
     const end = Date.now() + workerData.ms;
     for (;;) { Atomics.wait(sleeper, 0, 0, 25); if (Date.now() >= end) flag[0] = 2; }`,
    { eval: true, workerData: { sab: interrupt.buffer, ms } }
  );
  return () => {
    worker.terminate();
    interrupt[0] = 0;
  };
}

function request(lv, code) {
  return { mode: 'game', code, stdin: stdinLines(game.engine === 'judge' ? firstInput(lv) : ''), files: levelFiles(lv), harness, level: pythonLevel(lv), interactive: false, forward: false };
}

async function play(levelId, code) {
  const lv = game.levels.find((l) => l.id === levelId);
  if (!lv) throw new Error(`no level "${levelId}" (levels: ${game.levels.map((l) => l.id).join(', ')})`);
  const limitMs = (Number(process.env.TRY_TIMEOUT) || Number(lv.config && lv.config.timeout) || 10) * 1000;
  const stop = startWatchdog(limitMs);
  const started = Date.now();
  let res;
  try {
    res = await execute(request(lv, code));
  } catch (err) {
    res = { error: { message: String(err && err.message ? err.message : err) } };
  } finally {
    stop();
  }
  if (Date.now() - started >= limitMs) return { passed: false, timedOut: true, message: `TIMEOUT: the run was still going after ${limitMs / 1000} s` };
  return res.game || { passed: false, message: 'no game result', detail: res.error ? res.error.message : '' };
}

function summary(g) {
  const bits = [g.passed ? `PASS ${g.stars} star${g.stars === 1 ? '' : 's'}` : 'FAIL'];
  if (g.message) bits.push(g.message);
  if (g.detail) bits.push(String(g.detail).split('\n').slice(0, 3).join(' | '));
  return bits.join(' - ');
}

let bad = 0;
if (args[1] === '--variants') {
  const body = fs.readFileSync(path.resolve(args[2]), 'utf8');
  const parts = body.split(/^#### /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const head = part.slice(0, nl).trim().split(/\s+/);
    const code = part.slice(nl + 1);
    const [levelId, want, ...note] = head;
    const g = await play(levelId, code);
    const got = g.passed ? 'pass' : 'fail';
    const ok = got === want;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'BAD '} ${levelId} expected ${want}: ${note.join(' ')}`);
    if (!ok || process.env.VERBOSE) console.log('       ' + summary(g));
  }
  console.log(bad ? `\n${bad} unexpected result(s).` : '\nAll variants behave as expected.');
} else {
  const code = args[2] === '-c' ? args[3] : fs.readFileSync(path.resolve(args[2]), 'utf8');
  const g = await play(args[1], code);
  console.log(summary(g));
  const cases = g.cases || g.tests || [];
  for (const t of cases) {
    const detail = t.error || t.message || (t.ok === false && !t.hidden && t.expected !== undefined ? `expected ${t.expected} but got ${t.got}` : '');
    console.log(`  ${t.ok || t.passed ? 'ok ' : 'BAD'} ${t.hidden ? '(hidden) ' : ''}${t.name}${detail ? ': ' + String(detail).slice(0, 240) : ''}`);
  }
}
process.exit(bad ? 1 : 0);
