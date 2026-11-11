// Checks a game.md file by playing it: every level's solution must pass with three stars, and
// its starter code (and an empty program) must not pass. Uses the same parser, harness source and
// Python host as the website, so a green check here means the level works in the browser.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './pyhost-node.mjs';
import { parseDoc, stdinLines } from '../../js/lib/doc.js';
import { parseGame, pythonLevel, harnessSource, firstInput, levelFiles, ENGINES } from '../../js/games/levels.js';

const COMMON = ['par', 'forbid', 'forbid_note', 'require', 'comments', 'max_lines', 'theme', 'timeout'];
const KNOWN = {
  rover: { config: [...COMMON, 'facing', 'commands', 'battery', 'win', 'expect_say', 'exact_say', 'say_on_goal'], sections: ['map'] },
  judge: { config: [...COMMON, 'mode', 'function', 'approx', 'ignore_case', 'ignore_space'], sections: ['in', 'out', 'call', 'returns', 'test', 'prelude', 'file'] },
  canvas: { config: null, sections: null }, // the canvas engine's author lists its keys here
  arena: { config: null, sections: null }, // the arena engine's author lists its keys here
};

const readText = async (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function request(game, lv, code, harness) {
  return { mode: 'game', code, stdin: stdinLines(game.engine === 'judge' ? firstInput(lv) : ''), files: levelFiles(lv), harness, level: pythonLevel(lv), interactive: false, forward: false };
}

/**
 * @param execute  (request) => Promise<result>   from tools/lib/pyhost-node.mjs
 * @param text     the game.md source
 * @returns { title, engine, levels: [{ id, title, stars, lines, ok, notes }], problems: string[], warnings: string[] }
 */
export async function checkGame(execute, text, file = 'game.md') {
  const problems = [];
  const warnings = [];
  const out = { file, title: '', engine: '', levels: [], problems, warnings };
  const doc = parseDoc(text, { file });
  const game = parseGame(doc);
  out.title = String(doc.meta.title || '');
  out.engine = game.engine;
  for (const e of doc.errors) problems.push(`line ${e.line}: ${e.message}`);
  if (!ENGINES[game.engine]) {
    problems.push(`unknown engine "${game.engine}" (expected ${Object.keys(ENGINES).join(', ')})`);
    return out;
  }
  if (!game.levels.length) {
    problems.push('the game has no levels');
    return out;
  }
  if (!game.intro) warnings.push('no introduction text before the first level');
  let harness;
  try {
    harness = await harnessSource(game.engine, readText);
  } catch (e) {
    problems.push(`cannot read the ${game.engine} harness: ${e.message}`);
    return out;
  }

  const ids = new Set();
  for (const lv of game.levels) {
    const row = { id: lv.id, title: lv.title, stars: 0, lines: 0, ok: false, notes: [] };
    out.levels.push(row);
    const bad = (msg) => {
      problems.push(`${lv.id || '(no id)'} (line ${lv.line}): ${msg}`);
      row.notes.push(msg);
    };
    const warn = (msg) => warnings.push(`${lv.id} (line ${lv.line}): ${msg}`);

    if (!lv.id) {
      bad('the level has no id. Write "%% level l1 | Title".');
      continue;
    }
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(lv.id)) warn(`level id "${lv.id}" should use letters, digits and dashes only`);
    if (ids.has(lv.id)) bad(`duplicate level id "${lv.id}"`);
    ids.add(lv.id);
    if (!lv.title || lv.title === lv.id) warn('the level has no title. Write "%% level l1 | Title".');
    if (!lv.briefing.trim()) bad('the level has no briefing text');
    if (!lv.solution.trim()) {
      bad('the level has no "%% solution" section');
      continue;
    }
    if (!lv.hints.length) warn('no hints. Add at least two "%% hint" sections.');
    else if (lv.hints.length < 2) warn('only one hint. Two or three progressive hints work best.');
    const known = KNOWN[game.engine];
    if (known.config) for (const k of Object.keys(lv.config)) if (!known.config.includes(k)) warn(`unknown config key "${k}"`);
    if (known.sections) for (const k of Object.keys(lv.sections)) if (!known.sections.includes(k)) warn(`unknown section "%% ${k}" for the ${game.engine} engine`);

    // 1. the solution must pass with three stars
    const sol = await execute(request(game, lv, lv.solution, harness));
    const g = sol.game;
    if (!g) {
      bad(`solution: no game result (${sol.error ? sol.error.type + ': ' + sol.error.message : 'unknown'})`);
      continue;
    }
    if (g.harness_error) {
      bad('solution: the engine failed: ' + g.harness_error.split('\n').slice(-4).join(' | '));
      continue;
    }
    row.stars = g.stars || 0;
    row.lines = (g.stats && g.stats.lines) || 0;
    if (!g.passed) bad(`solution does not pass: ${g.message}`);
    else if (g.stars !== 3) bad(`solution earns ${g.stars} stars, not 3 (${g.detail || 'check par'})`);
    if (sol.error && sol.error.kind !== 'runtime') bad(`solution raised ${sol.error.type}: ${sol.error.message}`);

    // 2. the starter must not already pass
    const st = await execute(request(game, lv, lv.starter, harness));
    if (!st.game || st.game.harness_error) bad('starter: the engine failed: ' + ((st.game && st.game.harness_error) || (st.error && st.error.message) || 'no result').split('\n').slice(-4).join(' | '));
    else if (st.game.passed) bad('the starter code already passes the level');

    // 3. an empty program must not pass
    if (lv.starter.trim()) {
      const em = await execute(request(game, lv, '', harness));
      if (em.game && em.game.passed) bad('an empty program passes the level');
    }

    // 4. the solution must also pass when run a second time (no hidden state left over)
    const again = await execute(request(game, lv, lv.solution, harness));
    if (!again.game || again.game.passed !== g.passed || again.game.stars !== g.stars) bad('the result changes between two identical runs (the level keeps state)');

    row.ok = !row.notes.length;
  }
  return out;
}

/** Print a report. Returns true when there are no problems. */
export function printReport(rep, log = console.log) {
  log(`\n${rep.file}  (${rep.title || 'untitled'}, engine: ${rep.engine || '?'})`);
  for (const l of rep.levels) log(`  ${l.ok ? 'ok ' : 'FAIL'} ${String(l.id).padEnd(12)} ${l.title}${l.ok ? `  [${l.stars} stars, ${l.lines} lines]` : ''}`);
  for (const w of rep.warnings) log(`  warning: ${w}`);
  for (const p of rep.problems) log(`  PROBLEM: ${p}`);
  return rep.problems.length === 0;
}
