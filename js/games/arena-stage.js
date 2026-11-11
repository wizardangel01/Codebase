// Stage for "arena" games. PLACEHOLDER: the arena engine has not been built yet.
// Replace this file with the real stage (see docs/GAMES.md, "Writing a new engine").
import { h } from '../lib/util.js';

export function createArenaStage() {
  const el = h('figure.arena-stage', h('p.muted', 'This game board is not ready yet.'));
  return {
    el,
    preview() {},
    async show() {},
    stop() {},
    destroy() {},
  };
}

/** Commands shown as chips above the editor: { commands: [{ sig, text, insert?, line? }] } */
export function arenaInfo() {
  return { commands: [] };
}
