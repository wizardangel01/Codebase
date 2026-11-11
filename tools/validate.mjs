// Content validator: proves that every lesson, exercise, quiz question and game works.
//
//   node tools/validate.mjs                      check everything
//   node tools/validate.mjs python/meet-python   check one module (path under content/)
//   node tools/validate.mjs --structure          fast check that does not run any Python
//   node tools/validate.mjs --strict             modules listed in course.json must exist
//   node tools/validate.mjs --fail-on-warn       treat warnings as failures too
//   node tools/validate.mjs --no-games           skip the game play-tests
//
// It runs the same Python (Pyodide) and the same parsers that the website uses, so a green
// run means the content works in the browser.

import { startHost } from './lib/pyhost-node.mjs';
import { validateContent, printReport } from './lib/content.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};
const help = flag('--help') || flag('-h');
const strict = flag('--strict');
const failOnWarn = flag('--fail-on-warn');
const structure = flag('--structure');
const noGames = flag('--no-games');
const quiet = flag('--quiet');
const filters = args.map((a) => a.replace(/^\.?\/?content\//, '').replace(/\/$/, '')).filter(Boolean).map((a) => 'content/' + a);

if (help) {
  console.log(`Usage: node tools/validate.mjs [options] [module paths…]

  module paths   limit the check, for example python/meet-python
  --structure    check structure only, run no Python (fast)
  --strict       modules listed in course.json must exist
  --fail-on-warn warnings fail the run too
  --no-games     skip game play-tests
  --quiet        only print problems and the summary`);
  process.exit(0);
}

const t0 = Date.now();
let execute = async () => {
  throw new Error('Python is not loaded in --structure mode');
};
if (!structure) {
  process.stdout.write('Starting Python… ');
  const host = await startHost({ log: () => {} });
  execute = host.execute;
  console.log(`ready (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}

const rep = await validateContent(execute, {
  filters,
  run: !structure,
  games: !noGames,
  strict,
  log: quiet ? () => {} : (m) => console.log(m),
});
const ok = printReport(rep, quiet ? (m) => (/^\s*(✗|PROBLEMS|Checked|No problems|\d+ problem|Not finished)/.test(m) ? console.log(m) : undefined) : console.log, { failOnWarn });
console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
const failed = !ok || (failOnWarn && rep.warnings.length > 0);
process.exit(failed ? 1 : 0);
