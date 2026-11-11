// Play-test one or more game files:
//   node tools/check-game.mjs content/python/meet-python/game.md [more files…]
// Every level's solution must pass with three stars; starters must not pass.
import fs from 'node:fs';
import path from 'node:path';
import { startHost, ROOT } from './lib/pyhost-node.mjs';
import { checkGame, printReport } from './lib/games.mjs';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node tools/check-game.mjs <game.md> [...]');
  process.exit(2);
}
const { execute } = await startHost({ log: () => {} });
let ok = true;
for (const f of files) {
  const file = path.resolve(f);
  const text = fs.readFileSync(file, 'utf8');
  const rep = await checkGame(execute, text, path.relative(ROOT, file));
  ok = printReport(rep) && ok;
}
console.log(ok ? '\nAll games check out.' : '\nSome levels have problems.');
process.exit(ok ? 0 : 1);
