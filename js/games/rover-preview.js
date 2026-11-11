// Draws a rover level before the program has run, using the same map rules as
// games/harness/rover.py (the ids c0, k0, d0 are numbered in reading order, like Python does).

const DIR = { north: 0, east: 1, south: 2, west: 3 };

export function roverPreview(level) {
  const maps = level.sections.map || [];
  if (!maps.length) return { scene: { cols: 3, rows: 1, tiles: ['...'], theme: 'space' }, frame: { ents: [], msg: 'This level has no map.' } };
  const rows = maps[0].text.split('\n').map((r) => r.replace(/\s+$/, ''));
  const w = Math.max(...rows.map((r) => r.length));
  const ents = [];
  let start = null;
  const counts = { c: 0, k: 0, d: 0 };
  const tiles = rows.map((row, y) =>
    row
      .padEnd(w, '#')
      .split('')
      .map((ch, x) => {
        if (ch === 'R') {
          start = [x, y];
          return '.';
        }
        if (ch === 'c' || ch === 'k' || ch === 'D') {
          const key = ch === 'D' ? 'd' : ch;
          const kind = ch === 'c' ? 'crystal' : ch === 'k' ? 'key' : 'door';
          ents.push([key + counts[key]++, kind, x, y]);
          return '.';
        }
        return ch === '#' || ch === 'G' || ch === 'x' ? ch : '.';
      })
      .join('')
  );
  const facing = DIR[String(level.config.facing || 'east').toLowerCase()] ?? 1;
  if (start) ents.push(['rover', 'rover', start[0], start[1], { dir: facing }]);
  const crystals = counts.c;
  const hud = { battery: String(level.config.battery || 150) };
  if (crystals) hud.crystals = `0 / ${crystals}`;
  if (counts.k) hud.keys = '0';
  // doors, keys and crystals are drawn under the rover
  ents.sort((a, b) => (a[1] === 'rover') - (b[1] === 'rover'));
  return { scene: { cols: w, rows: rows.length, tiles, theme: level.config.theme || 'space' }, frame: { ents, msg: 'Ready. Write your program and press Run.', hud } };
}
