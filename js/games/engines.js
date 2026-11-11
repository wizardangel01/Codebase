// Browser-side registry of game engines. An engine is a Python harness (games/harness/*.py)
// plus a "stage" that shows what happened. Every stage has the same small interface:
//
//   stage.el                         the element to put on the page
//   stage.preview(level)             draw the level before the learner has run anything
//   await stage.show(result, opts)   play back / display the result the harness returned
//   stage.stop() / stage.destroy()
//
// To add an engine: write games/harness/<name>.py (setup + finish), add a stage here, and
// list it in ENGINES in levels.js.

import { createSceneStage } from './scene.js';
import { createJudgeStage, declaredCases } from './judge-stage.js';
import { roverPreview } from './rover-preview.js';
import { createCanvasStage, canvasInfo } from './canvas-stage.js';
import { createArenaStage, arenaInfo } from './arena-stage.js';

function sceneStage(previewFor) {
  const stage = createSceneStage();
  return {
    el: stage.el,
    preview(level) {
      const { scene, frame } = previewFor(level);
      stage.preview(scene, frame);
    },
    show: (result, opts) => stage.show(result, opts),
    stop: () => stage.stop(),
    destroy: () => stage.destroy(),
  };
}

const STAGES = {
  rover: () => sceneStage(roverPreview),
  judge: () => createJudgeStage(),
  canvas: () => createCanvasStage(),
  arena: () => createArenaStage(),
};

export function createStage(engine) {
  const make = STAGES[engine];
  if (!make) throw new Error(`The game engine "${engine}" has no stage in js/games/engines.js.`);
  return make();
}

// ---- what the learner may use in a level ---------------------------------------------------------
// `line: true` commands are whole statements (tapping the chip adds a new line to the program);
// the others are values you use inside an expression (tapping inserts them at the cursor).
const ROVER_DOCS = [
  { group: 'basic', name: 'move', sig: 'move()', line: true, text: 'Drive one square forward. Driving into a rock stops the mission.' },
  { group: 'basic', name: 'turn_left', sig: 'turn_left()', line: true, text: 'Turn a quarter turn to the left without moving.' },
  { group: 'basic', name: 'turn_right', sig: 'turn_right()', line: true, text: 'Turn a quarter turn to the right without moving.' },
  { group: 'basic', name: 'pick_up', sig: 'pick_up()', line: true, text: 'Pick up the crystal on this square.' },
  { group: 'basic', name: 'say', sig: 'say("text")', insert: 'say("Hello")', line: true, text: 'Show a message in a speech bubble. It works like print().' },
  { group: 'sensors', name: 'front_is_clear', sig: 'front_is_clear()', text: 'True when the square in front is free to drive onto.' },
  { group: 'sensors', name: 'left_is_clear', sig: 'left_is_clear()', text: 'True when the square on the left is free.' },
  { group: 'sensors', name: 'right_is_clear', sig: 'right_is_clear()', text: 'True when the square on the right is free.' },
  { group: 'sensors', name: 'on_goal', sig: 'on_goal()', text: 'True when the rover is standing on the goal pad.' },
  { group: 'sensors', name: 'on_crystal', sig: 'on_crystal()', text: 'True when there is a crystal on this square.' },
  { group: 'sensors', name: 'has_key', sig: 'has_key()', text: 'True when the rover is carrying a key.' },
  { group: 'sensors', name: 'crystals_left', sig: 'crystals_left()', text: 'How many crystals are still on the map.' },
  { group: 'sensors', name: 'facing', sig: 'facing()', text: 'The direction the rover faces: "north", "east", "south" or "west".' },
  { group: 'sensors', name: 'position', sig: 'position()', text: 'The rover’s (column, row), counted from 1 at the top left.' },
];

function roverCommands(level) {
  const raw = String(level.config.commands || 'basic').replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  const names = new Set();
  for (const w of raw) {
    if (w === 'basic' || w === 'sensors') ROVER_DOCS.filter((d) => d.group === w).forEach((d) => names.add(d.name));
    else if (w === 'all') ROVER_DOCS.forEach((d) => names.add(d.name));
    else names.add(w);
  }
  return ROVER_DOCS.filter((d) => names.has(d.name));
}

/** { commands: [{ sig, text, insert?, line? }] } shown as chips above the editor. */
export function engineInfo(engine, level) {
  if (engine === 'rover') return { commands: roverCommands(level) };
  if (engine === 'canvas') return canvasInfo(level);
  if (engine === 'arena') return arenaInfo(level);
  if (engine === 'judge') {
    const mode = String(level.config.mode || 'io').toLowerCase();
    if ((mode === 'function' || mode === 'script') && level.config.function) return { commands: [{ sig: `def ${level.config.function}(…)`, text: `Define a function with this name. The tests call it and check what it returns.` }] };
    if (mode === 'io') return { commands: [{ sig: 'input()', text: 'Reads one line of the test input.' }, { sig: 'print()', text: 'Prints the answer. The tests compare what you print.' }] };
  }
  return { commands: [] };
}

/** How many tests a judge level has (for the stage heading before a run). */
export { declaredCases };
