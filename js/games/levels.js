// Turns a parsed game.md into level objects. Pure (no DOM), so the browser and the Node
// validator use exactly the same code.
//
//   ---
//   title: Launch Control          front matter: title, engine (rover | judge | canvas | arena), intro text is the first paragraph
//   engine: rover
//   ---
//   Story / how to play (Markdown, optional)
//
//   %% level l1 | First steps       id | title
//   Briefing (Markdown)
//   %% config / %% starter / %% solution / %% hint (repeat) / engine sections (%% map, %% in, %% out ...)
//   %% end

import { getSection, getSections, parseKV } from '../lib/doc.js';

export const ENGINES = {
  rover: { harness: 'rover.py', stage: 'scene' },
  judge: { harness: 'judge.py', stage: 'judge' },
  canvas: { harness: 'canvas.py', stage: 'canvas' },
  arena: { harness: 'arena.py', stage: 'arena' },
};

const KNOWN = new Set(['config', 'starter', 'solution', 'hint']);

export function levelSpec(node) {
  const sections = {};
  for (const s of node.sections) {
    if (KNOWN.has(s.name)) continue;
    (sections[s.name] ||= []).push({ arg: s.arg || '', text: s.text });
  }
  return {
    id: node.args[0],
    title: node.args[1] || node.args[0],
    briefing: node.main,
    config: parseKV(getSection(node, 'config') || ''),
    starter: getSection(node, 'starter') ?? '',
    solution: getSection(node, 'solution') ?? '',
    hints: getSections(node, 'hint').map((s) => s.text),
    sections,
    line: node.line,
  };
}

export function parseGame(doc) {
  const levels = doc.nodes.filter((n) => n.type === 'container' && n.name === 'level').map(levelSpec);
  const intro = doc.nodes.find((n) => n.type === 'md');
  return { meta: doc.meta, engine: String(doc.meta.engine || 'rover'), intro: intro ? intro.text : '', levels, errors: doc.errors };
}

/** The `level` object that Python's setup()/finish() receive. */
export function pythonLevel(level) {
  return { id: level.id, title: level.title, config: level.config, sections: level.sections, starter: level.starter, solution: level.solution };
}

/** Files a level provides to the learner's program: every `%% file name` section. */
export function levelFiles(level) {
  const files = {};
  for (const f of level.sections.file || []) if (f.arg) files[f.arg] = f.text + '\n';
  return files;
}

/** Python source for an engine: the shared helpers followed by the engine's own file. */
export async function harnessSource(engine, readText) {
  const info = ENGINES[engine];
  if (!info) throw new Error(`Unknown game engine "${engine}".`);
  const [common, own] = await Promise.all([readText('games/harness/common.py'), readText('games/harness/' + info.harness)]);
  return common + '\n\n' + own + '\n';
}

/**
 * Standard-input lines for the visible run of a judge level: the first test that is not hidden.
 * (The harness then re-runs the program silently for every test.)
 */
export function firstInput(level) {
  const mode = String(level.config.mode || 'io').toLowerCase();
  if (mode !== 'io') return '';
  const open = (level.sections.in || []).find((s) => !/\bhidden\b/i.test(s.arg || ''));
  return open ? open.text : '';
}
