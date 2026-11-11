// Scene player: draws a tile board and replays the frames a game harness recorded.
//
// A scene is { cols, rows, tiles: ["#####", "#...#"], theme }.
// A frame is { ents: [[id, kind, x, y, props?], ...], msg?, hud?, fx?: [...], say?: [id, text] }.
// Entities are matched by id between frames, so a changed x/y animates as movement, and an
// id that disappears fades out. Kinds with artwork: rover, crystal, key, door, token.
// Nothing here knows about any particular game; the harness decides what happens.

import { h, prefersReducedMotion } from '../lib/util.js';
import { icon } from '../lib/icons.js';

const SPEEDS = [
  { label: '0.5×', ms: 560 },
  { label: '1×', ms: 320 },
  { label: '2×', ms: 160 },
  { label: '4×', ms: 70 },
];
const ROT = (dir) => dir * 90;

function sprite(kind, props = {}) {
  const svg = (children) => h('svg.art', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' }, children);
  switch (kind) {
    case 'rover':
      return svg([
        h('rect', { x: 3, y: 9.5, width: 3.2, height: 10, rx: 1.4, class: 's-wheel' }),
        h('rect', { x: 17.8, y: 9.5, width: 3.2, height: 10, rx: 1.4, class: 's-wheel' }),
        h('rect', { x: 5, y: 8.5, width: 14, height: 12, rx: 3.2, class: 's-body' }),
        h('path', { d: 'M12 2.4 L16.6 8.6 H7.4 Z', class: 's-nose' }),
        h('circle', { cx: 12, cy: 14.4, r: 2.7, class: 's-eye' }),
        h('circle', { cx: 12, cy: 14.4, r: 1.1, class: 's-pupil' }),
      ]);
    case 'crystal':
      return svg([h('polygon', { points: '12,2.5 19.5,10 12,21.5 4.5,10', class: 's-crystal' }), h('path', { d: 'M4.5 10 H19.5 M12 2.5 L9 10 L12 21.5 L15 10 Z', class: 's-facet' })]);
    case 'key':
      return svg([h('circle', { cx: 8.5, cy: 9, r: 4.2, class: 's-key' }), h('circle', { cx: 8.5, cy: 9, r: 1.5, class: 's-hole' }), h('path', { d: 'M11.6 12 L19 19.4 M16.4 16.8 L18.8 14.4 M18.4 18.8 L20.4 16.8', class: 's-keyline' })]);
    case 'door':
      return svg([h('rect', { x: 3.5, y: 3.5, width: 17, height: 17, rx: 2.2, class: 's-door' }), h('path', { d: 'M8 3.5 V20.5 M12 3.5 V20.5 M16 3.5 V20.5', class: 's-doorbar' }), h('circle', { cx: 12, cy: 12, r: 2.2, class: 's-lock' })]);
    default: {
      // generic token: coloured disc with a short label
      const label = String(props.label ?? '').slice(0, 3);
      return svg([h('circle', { cx: 12, cy: 12, r: 9.5, class: 's-token', style: props.color ? { fill: props.color } : {} }), label ? h('text', { x: 12, y: 15.6, 'text-anchor': 'middle', class: 's-label' }, label) : null]);
    }
  }
}

export function createSceneStage() {
  let scene = null;
  let scenarios = [];
  let cur = 0;
  let frames = [];
  let idx = 0;
  let playing = false;
  let timer = null;
  let speed = 1;
  let rotations = new Map(); // id -> cumulative degrees
  let lastDir = new Map();
  const ents = new Map(); // id -> { el, kind }

  const tilesEl = h('div.scene-tiles', { 'aria-hidden': 'true' });
  const entsEl = h('div.scene-ents');
  const flash = h('div.scene-flash', { 'aria-hidden': 'true' });
  const board = h('div.scene-board', { role: 'img', 'aria-label': 'Game board' }, tilesEl, entsEl, flash);
  const hud = h('div.scene-hud', { 'aria-hidden': 'true' });
  const log = h('p.scene-log', { role: 'status', 'aria-live': 'polite' });
  const tabs = h('div.scene-tabs', { role: 'tablist', hidden: true });
  const slider = h('input.scene-slider', { type: 'range', min: 0, max: 0, value: 0, 'aria-label': 'Step', oninput: (e) => (pause(), go(+e.target.value)) });
  const counter = h('span.scene-count');

  const btn = (name, title, fn) => h('button.btn.btn-ghost.btn-icon', { type: 'button', title, 'aria-label': title, onclick: fn }, icon(name, 18));
  const bFirst = btn('skip-back', 'Back to the start', () => (pause(), go(0)));
  const bPrev = btn('chevron-left', 'Previous step', () => (pause(), go(idx - 1)));
  const bPlay = h('button.btn.btn-primary.btn-sm.scene-play', { type: 'button', onclick: () => toggle() });
  const bNext = btn('chevron-right', 'Next step', () => (pause(), go(idx + 1)));
  const bLast = btn('skip-forward', 'Jump to the end', () => (pause(), go(frames.length - 1)));
  const speedSel = h(
    'select.scene-speed',
    { 'aria-label': 'Playback speed', onchange: (e) => (speed = +e.target.value) },
    SPEEDS.map((s, i) => h('option', { value: i, selected: i === speed }, s.label))
  );
  const controls = h('div.scene-controls', h('div.sc-buttons', bFirst, bPrev, bPlay, bNext, bLast, speedSel), h('div.sc-scrub', slider, counter));
  const root = h('figure.scene', { dataset: { theme: 'space' } }, tabs, h('div.scene-frame', board, hud), log, controls);

  function paintPlay() {
    bPlay.replaceChildren(icon(playing ? 'pause' : 'play', 15), playing ? 'Pause' : frames.length && idx >= frames.length - 1 ? 'Replay' : 'Play');
  }

  // ---- building the board ---------------------------------------------------------------------
  function buildBoard(sc) {
    scene = sc;
    root.dataset.theme = sc.theme || 'space';
    board.style.setProperty('--cols', sc.cols);
    board.style.setProperty('--rows', sc.rows);
    board.style.aspectRatio = `${sc.cols} / ${sc.rows}`;
    board.dataset.big = sc.cols * sc.rows > 150 ? '1' : '0';
    tilesEl.replaceChildren(
      ...sc.tiles.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const kind = ch === '#' ? 'rock' : ch === 'G' ? 'goal' : ch === 'x' ? 'lava' : ch === '~' ? 'water' : 'floor';
          return h('div.tile.tile-' + kind + ((x + y) % 2 ? '.alt' : ''), { dataset: { x, y } });
        })
      )
    );
    entsEl.replaceChildren();
    ents.clear();
    rotations = new Map();
    lastDir = new Map();
    board.classList.remove('is-win', 'is-fail');
  }

  function entityEl(id, kind, props) {
    const art = h('div.ent-art', sprite(kind, props));
    const el = h('div.ent.ent-' + kind, { dataset: { id } }, art);
    entsEl.appendChild(el);
    const rec = { el, art, kind, bar: null, bubble: null };
    ents.set(id, rec);
    return rec;
  }

  function renderFrame(i, { jump = false } = {}) {
    const f = frames[i];
    if (!f) return;
    if (jump) board.classList.add('is-jump');
    board.classList.remove('is-win', 'is-fail');
    const seen = new Set();
    for (const [id, kind, x, y, props = {}] of f.ents || []) {
      seen.add(id);
      const rec = ents.get(id) || entityEl(id, kind, props);
      rec.el.classList.remove('is-gone');
      rec.el.style.setProperty('--x', x);
      rec.el.style.setProperty('--y', y);
      if (props.dir !== undefined) {
        let deg;
        if (!rotations.has(id) || jump) deg = ROT(props.dir);
        else {
          const prev = lastDir.get(id);
          const delta = ((props.dir - prev + 6) % 4) - 2; // shortest way round: -1, 0, 1 or 2
          deg = rotations.get(id) + (delta === -2 ? 180 : delta * 90);
        }
        rotations.set(id, deg);
        lastDir.set(id, props.dir);
        rec.art.style.setProperty('--rot', deg + 'deg');
      }
      if (props.hp !== undefined) {
        if (!rec.bar) {
          rec.bar = h('div.hp', h('i'));
          rec.el.appendChild(rec.bar);
        }
        rec.bar.firstChild.style.width = Math.max(0, Math.min(100, (props.hp / (props.max || props.hp || 1)) * 100)) + '%';
      }
      if (props.label !== undefined && kind === 'token') {
        const t = rec.art.querySelector('text');
        if (t) t.textContent = String(props.label).slice(0, 3);
      }
      rec.el.classList.remove('fx-bump', 'fx-burn', 'fx-pick', 'fx-dead');
    }
    for (const [id, rec] of ents) {
      if (!seen.has(id)) {
        rec.el.classList.add('is-gone');
        if (!jump) setTimeout(() => rec.el.classList.contains('is-gone') && rec.el.style.setProperty('visibility', 'hidden'), 320);
        else rec.el.style.setProperty('visibility', 'hidden');
      } else rec.el.style.removeProperty('visibility');
    }
    // speech bubbles
    for (const rec of ents.values()) if (rec.bubble) (rec.bubble.remove(), (rec.bubble = null));
    if (f.say) {
      const rec = ents.get(f.say[0]);
      if (rec) {
        const y = +rec.el.style.getPropertyValue('--y');
        rec.bubble = h('div.bubble' + (y < 1 ? '.below' : ''), String(f.say[1]));
        rec.el.appendChild(rec.bubble);
      }
    }
    // effects
    for (const fx of f.fx || []) {
      const rover = ents.get('rover') || [...ents.values()][0];
      if (fx === 'bump' && rover) rover.el.classList.add('fx-bump');
      if (fx === 'burn' && rover) rover.el.classList.add('fx-burn');
      if (fx === 'dead' && rover) rover.el.classList.add('fx-dead');
      if (fx === 'pick' && rover) rover.el.classList.add('fx-pick');
      if (fx === 'win') board.classList.add('is-win');
      if (fx === 'fail') board.classList.add('is-fail');
    }
    // hud + log
    hud.replaceChildren(...Object.entries(f.hud || {}).map(([k, v]) => h('span.hud-item', h('small', k), h('strong', String(v)))));
    log.textContent = f.msg || '';
    slider.value = i;
    counter.textContent = frames.length > 1 ? `Step ${i} of ${frames.length - 1}` : '';
    bFirst.disabled = bPrev.disabled = i === 0;
    bNext.disabled = bLast.disabled = i >= frames.length - 1;
    idx = i;
    paintPlay();
    if (jump) requestAnimationFrame(() => requestAnimationFrame(() => board.classList.remove('is-jump')));
  }

  function go(i) {
    const n = Math.max(0, Math.min(frames.length - 1, i));
    renderFrame(n, { jump: Math.abs(n - idx) !== 1 });
  }

  function tick() {
    if (!playing) return;
    if (idx >= frames.length - 1) return pause();
    renderFrame(idx + 1);
    timer = setTimeout(tick, SPEEDS[speed].ms);
  }
  function play() {
    if (!frames.length) return;
    if (idx >= frames.length - 1) renderFrame(0, { jump: true });
    playing = true;
    paintPlay();
    clearTimeout(timer);
    timer = setTimeout(tick, SPEEDS[speed].ms);
  }
  function pause() {
    playing = false;
    clearTimeout(timer);
    paintPlay();
  }
  function toggle() {
    playing ? pause() : play();
  }

  function setFrames(sc, fr) {
    pause();
    if (!scene || scene !== sc) buildBoard(sc);
    else {
      // same board: keep elements, just reset
      entsEl.replaceChildren();
      ents.clear();
      rotations = new Map();
      lastDir = new Map();
    }
    frames = fr && fr.length ? fr : [{ ents: [], msg: '' }];
    slider.max = frames.length - 1;
    idx = 0;
    renderFrame(0, { jump: true });
  }

  function drawTabs() {
    tabs.hidden = scenarios.length < 2;
    tabs.replaceChildren(
      ...scenarios.map((s, i) =>
        h(
          'button.scene-tab' + (i === cur ? '.is-current' : '') + (s.passed ? '.is-pass' : '.is-fail'),
          { type: 'button', role: 'tab', 'aria-selected': i === cur ? 'true' : 'false', onclick: () => select(i, true) },
          icon(s.passed ? 'check' : 'x', 14),
          s.name
        )
      )
    );
  }

  function select(i, autoplay) {
    cur = i;
    const s = scenarios[i];
    drawTabs();
    setFrames(s.scene, s.frames);
    if (autoplay) {
      if (prefersReducedMotion()) go(frames.length - 1);
      else play();
    }
  }

  return {
    el: root,
    /** Show a still picture before the program has run. */
    preview(sc, frame) {
      scenarios = [];
      drawTabs();
      scene = null;
      setFrames(sc, [frame]);
      counter.textContent = '';
      controls.hidden = true;
    },
    /** Replay the result of a run. `result.scenarios` is a list of { name, passed, scene, frames }. */
    show(result, { autoplay = true } = {}) {
      scenarios = result.scenarios || [];
      if (!scenarios.length) return;
      controls.hidden = false;
      const firstBad = scenarios.findIndex((s) => !s.passed);
      scene = null;
      select(firstBad === -1 ? 0 : firstBad, autoplay);
    },
    stop: pause,
    destroy() {
      pause();
    },
  };
}
