// The game screen for a module: pick a level, read the briefing, write Python, press Run and
// watch what your program does. The engines (rover, judge, ...) live in games/harness (Python)
// and js/games (stages). This file only wires the pieces together.

import { h, plural, debounce, setChildren } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { loadCourse, findModule, loadDoc, fetchText } from '../content.js';
import { store } from '../store.js';
import { XP } from '../config.js';
import { renderMarkdown } from '../lib/markdown.js';
import { createEditor } from '../ui/editor.js';
import { createConsole } from '../ui/console.js';
import { runInto, requestFor, engineProblem } from '../ui/run.js';
import { runner } from '../py/runner.js';
import { parseGame, pythonLevel, harnessSource, firstInput, levelFiles, ENGINES } from '../games/levels.js';
import { createStage, engineInfo } from '../games/engines.js';

const words = (v) => String(v ?? '').replace(/,/g, ' ').split(/\s+/).filter(Boolean);

export function starRow(n, total = 3) {
  return h(
    'span.stars',
    { role: 'img', 'aria-label': `${n} of ${total} stars` },
    Array.from({ length: total }, (_, i) => h('span.star' + (i < n ? '.is-on' : ''), icon('star', 16)))
  );
}

/** Short rule chips for a level: [icon, text, longer explanation]. */
function ruleChips(level) {
  const c = level.config;
  const out = [];
  if (c.battery) out.push(['zap', `Battery: ${c.battery} actions`, 'Every move, turn and pick-up uses one unit of battery. Sensors are free.']);
  if (c.par) out.push(['star', `3 stars: ${c.par} lines or fewer`, 'Lines of code count. Blank lines and comment lines do not.']);
  if (c.require) out.push(['check', `Use: ${words(c.require).join(', ')}`, 'This level needs these Python features.']);
  if (c.forbid) out.push(['x', `Not yet: ${words(c.forbid).join(', ')}`, c.forbid_note || 'This level practises something simpler first.']);
  if (c.comments) out.push(['edit', `${plural(+c.comments, 'comment')} needed`, 'A comment is a line that starts with #. Python ignores it.']);
  if (c.max_lines) out.push(['list', `At most ${c.max_lines} lines`, 'Lines of code count. Blank lines and comment lines do not.']);
  if (c.expect_say) {
    const said = Array.isArray(c.expect_say) ? c.expect_say : [c.expect_say];
    out.push(['info', `Must say ${said.map((t) => `“${t}”`).join(', then ')}`, said.length > 1 ? 'Spelled exactly like that, in this order.' : 'Spelled exactly like that.']);
  }
  return out;
}

export async function gameView({ course: cid, module: mid }, query) {
  const course = await loadCourse(cid);
  const m = findModule(course, mid);
  if (!m || m.missing || !m.game) throw Object.assign(new Error('This module has no game.'), { notFound: true });
  const doc = await loadDoc(cid, mid, m.game);
  const game = parseGame(doc);
  if (game.errors.length) console.warn('Game file has formatting problems:', game.errors);
  if (!ENGINES[game.engine]) throw new Error(`The game file asks for an engine called “${game.engine}”, which does not exist.`);
  if (!game.levels.length) throw new Error('This game has no levels yet.');
  const levels = game.levels;
  const title = m.gameTitle || game.meta.title || 'Module game';
  const harness = harnessSource(game.engine, fetchText);
  harness.catch(() => {});

  const gameKey = m.key;
  const rec = () => store.game(gameKey);
  const best = (lv) => (rec().levels[lv.id] || {}).stars || 0;
  const cleared = (lv) => !!rec().levels[lv.id];

  // which level to open first
  const wanted = query && query.get('level');
  let idx = Math.max(0, levels.findIndex((l) => l.id === wanted));
  if (!wanted || !levels.some((l) => l.id === wanted)) {
    const open = levels.findIndex((l) => !cleared(l));
    idx = open === -1 ? 0 : open;
  }
  let level = levels[idx];

  // ---- state for the level on screen ----
  let busy = false;
  let failedRuns = 0;
  let hintsShown = 0;
  let usedSolution = false;

  // ---- pieces ----
  const stage = createStage(game.engine);
  const ed = createEditor({ value: '', minLines: 8, maxLines: 26, ariaLabel: 'Your Python program', onRun: () => run(), onFocus: () => runner.warm() });
  const con = createConsole({ title: 'Program output', placeholder: 'What your program prints appears here.', emptyNote: 'Nothing was printed. That is fine here: watch the board to see what your program did.' });
  const railEl = h('ol.game-rail');
  const statsEl = h('p.game-stats');
  const briefEl = h('section.game-brief');
  const resultEl = h('div.game-result', { hidden: true, role: 'status', 'aria-live': 'polite' });
  const hintsEl = h('div.ex-hints');
  const solutionEl = h('div.ex-solution', { hidden: true });

  const runBtn = h('button.btn.btn-primary.btn-lg', { type: 'button', onclick: () => run(), onpointerenter: () => runner.warm() }, icon('play', 16), 'Run');
  const stopBtn = h('button.btn.btn-danger', { type: 'button', hidden: true, onclick: () => runner.stop() }, icon('stop', 14), 'Stop');
  const hintBtn = h('button.btn.btn-ghost', { type: 'button', onclick: () => showHint() }, icon('bulb', 16), h('span', 'Hint'));
  const solBtn = h('button.btn.btn-ghost', { type: 'button', hidden: true, onclick: () => showSolution() }, icon('eye', 16), 'Show a solution');
  const resetBtn = h('button.btn.btn-ghost', { type: 'button', title: 'Put the starter code back', onclick: () => resetCode() }, icon('reset', 15), 'Start over');
  const bar = h('div.ex-bar.game-bar', runBtn, stopBtn, hintBtn, solBtn, resetBtn);

  const codeArea = h('section.game-code', { 'aria-label': 'Your program' }, h('div.game-ed', ed.el), bar, hintsEl, solutionEl, con.el);
  const side = h('aside.game-side', { 'aria-label': 'Board' }, stage.el, resultEl);

  // ---- rail (level picker) ----
  function drawRail() {
    const next = levels.findIndex((l) => !cleared(l));
    railEl.replaceChildren(
      ...levels.map((lv, i) => {
        const stars = best(lv);
        const done = cleared(lv);
        return h(
          'li' + (done ? '.is-done' : ''),
          h(
            'button.rail-stop' + (i === idx ? '.is-current' : '') + (done ? '.is-done' : '') + (i === next ? '.is-next' : ''),
            {
              type: 'button',
              'aria-current': i === idx ? 'step' : null,
              'aria-label': `Level ${i + 1}: ${lv.title}${done ? `, cleared with ${stars} ${stars === 1 ? 'star' : 'stars'}` : i === next ? ', next up' : ''}`,
              title: lv.title,
              onclick: () => openLevel(i),
            },
            h('span.rail-dot', done ? icon('check', 15) : String(i + 1)),
            h('span.rail-stars', { 'aria-hidden': 'true' }, [1, 2, 3].map((n) => h('i' + (n <= stars ? '.is-on' : ''))))
          )
        );
      })
    );
    // keep the current level in view when the rail scrolls sideways (phones)
    const wrap = railEl.parentElement;
    const cur = railEl.querySelector('.is-current');
    if (wrap && cur && wrap.scrollWidth > wrap.clientWidth) {
      const a = cur.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      wrap.scrollLeft += a.left + a.width / 2 - (w.left + w.width / 2);
    }
    const total = levels.reduce((n, l) => n + best(l), 0);
    const count = levels.filter(cleared).length;
    statsEl.replaceChildren(h('span.with-icon', icon('flag', 15), `${count} of ${levels.length} levels cleared`), h('span.with-icon', icon('star', 15), `${total} of ${levels.length * 3} stars`));
  }

  // ---- briefing ----
  function insertCommand(cmd) {
    const ta = ed.textarea;
    const text = cmd.insert || cmd.sig;
    const v = ta.value;
    let start = ta.selectionStart;
    let end = ta.selectionEnd;
    let piece = text;
    if (cmd.line) {
      const lineStart = v.lastIndexOf('\n', start - 1) + 1;
      let lineEnd = v.indexOf('\n', end);
      if (lineEnd === -1) lineEnd = v.length;
      const lineText = v.slice(lineStart, lineEnd);
      const indent = /^[ \t]*/.exec(lineText)[0];
      if (lineText.trim() === '') {
        start = lineStart + indent.length;
        end = lineEnd;
      } else {
        const deeper = /:\s*(#.*)?$/.test(lineText.trimEnd()) ? '    ' : '';
        start = end = lineEnd;
        piece = '\n' + indent + deeper + text;
      }
    }
    ta.setRangeText(piece, start, end, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ed.scrollToLine(ta.value.slice(0, ta.selectionStart).split('\n').length);
    ed.el.classList.add('is-flash');
    setTimeout(() => ed.el.classList.remove('is-flash'), 500);
  }

  function drawBrief() {
    const info = engineInfo(game.engine, level);
    const rules = ruleChips(level);
    const stars = best(level);
    setChildren(briefEl, 
      h(
        'header.level-head',
        h('span.level-tag', `Level ${idx + 1} of ${levels.length}`),
        h('h2', { tabindex: '-1' }, level.title),
        stars || cleared(level) ? h('span.level-best', { title: 'Your best result on this level' }, starRow(stars)) : null
      ),
      h('div.prose.level-brief', { html: renderMarkdown(level.briefing || '') }),
      rules.length ? h('ul.rule-chips', rules.map(([ic, text, why]) => h('li', { title: why }, icon(ic, 14), h('span', text)))) : null,
      info.commands.length
        ? h(
            'div.cmds',
            h('h3', 'Your commands', h('small', ' tap one to add it to your code')),
            h(
              'div.cmd-row',
              info.commands.map((c) =>
                h('button.cmd-chip', { type: 'button', title: c.text, onpointerdown: (e) => e.preventDefault(), onmousedown: (e) => e.preventDefault(), onclick: () => insertCommand(c) }, h('code', c.sig))
              )
            ),
            h('details.cmd-help', h('summary', 'What do these do?'), h('dl', info.commands.flatMap((c) => [h('dt', h('code', c.sig)), h('dd', c.text)])))
          )
        : null
    );
  }

  // ---- hints, solution, reset ----
  function refreshButtons() {
    const left = level.hints.length - hintsShown;
    hintBtn.hidden = !level.hints.length;
    hintBtn.disabled = left <= 0;
    hintBtn.lastChild.textContent = left <= 0 ? 'No more hints' : hintsShown ? `Another hint (${left} left)` : 'Hint';
    solBtn.hidden = !(level.solution && (cleared(level) || failedRuns >= 2 || (level.hints.length > 0 && hintsShown >= level.hints.length && failedRuns >= 1)));
  }

  function showHint() {
    if (hintsShown >= level.hints.length) return;
    const text = level.hints[hintsShown++];
    hintsEl.appendChild(h('div.ex-hint', icon('bulb', 16), h('div', { html: renderMarkdown(text) })));
    refreshButtons();
  }

  function showSolution() {
    if (!usedSolution && !cleared(level)) usedSolution = true;
    solutionEl.hidden = false;
    setChildren(solutionEl, 
      h('h4', 'One way to solve it'),
      cleared(level) ? null : h('p.muted', 'Once you have seen the solution, passing this level earns one star. You can replay it for more.'),
      createEditor({ value: level.solution, readOnly: true, minLines: 2, maxLines: 24, ariaLabel: 'Model solution' }).el,
      h('div.ex-bar', h('button.btn.btn-secondary.btn-sm', { type: 'button', onclick: () => ed.setValue(level.solution) }, 'Copy into my editor'), h('button.btn.btn-ghost.btn-sm', { type: 'button', onclick: () => (solutionEl.hidden = true) }, 'Hide'))
    );
    solutionEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  const draftKey = () => `${gameKey}/game#${level.id}`;
  const saveDraft = debounce((key, v, starter) => (v === starter ? store.clearDraft(key) : store.setDraft(key, v)), 400);
  ed.onChange((v) => saveDraft(draftKey(), v, level.starter));
  function flushDraft() {
    const v = ed.getValue();
    if (v === level.starter) store.clearDraft(draftKey());
    else store.setDraft(draftKey(), v);
  }

  function resetCode() {
    if (ed.getValue() !== level.starter && !confirm('Replace your code with the starter code?')) return;
    ed.setValue(level.starter);
    store.clearDraft(draftKey());
    ed.clearMarks();
  }

  // ---- opening a level ----
  let loaded = false; // false until the first level has been put in the editor
  function openLevel(i, { focus = true } = {}) {
    if (busy) return;
    if (loaded) flushDraft();
    loaded = true;
    stage.stop();
    idx = Math.max(0, Math.min(levels.length - 1, i));
    level = levels[idx];
    failedRuns = 0;
    hintsShown = 0;
    usedSolution = false;
    const draft = store.getDraft(draftKey());
    ed.setValue(draft !== null && draft !== undefined ? draft : level.starter);
    ed.clearMarks();
    ed.textarea.setSelectionRange(ed.getValue().length, ed.getValue().length);
    con.reset();
    resultEl.hidden = true;
    resultEl.replaceChildren();
    hintsEl.replaceChildren();
    solutionEl.hidden = true;
    stage.preview(level);
    drawBrief();
    drawRail();
    refreshButtons();
    store.setLast(`/c/${cid}/${mid}/game`, `${title}: ${level.title}`);
    try {
      history.replaceState(null, '', `#/c/${cid}/${mid}/game?level=${encodeURIComponent(level.id)}`);
    } catch {}
    if (focus) {
      const head = briefEl.querySelector('h2');
      if (head) head.focus({ preventScroll: true });
      briefEl.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  // ---- running ----
  function setBusy(b) {
    busy = b;
    runBtn.disabled = b;
    stopBtn.hidden = !b;
    resetBtn.disabled = b;
  }

  function showFail(message, detail, kind = 'bad') {
    resultEl.hidden = false;
    resultEl.className = 'game-result is-fail';
    setChildren(resultEl, 
      h('div.gr-head', icon(kind === 'warn' ? 'warn' : 'info', 20), h('strong', kind === 'warn' ? 'Something is wrong with this level' : 'Not yet')),
      h('p', message),
      detail ? h('p.muted', detail) : null
    );
  }

  function nextHref() {
    const nm = course.modules.slice(m.index + 1).find((x) => !x.missing);
    return nm ? { href: `#/c/${cid}/${nm.id}`, label: `Next module: ${nm.title}` } : { href: `#/c/${cid}`, label: 'Back to the course map' };
  }

  function showPass(g, stars, outcome) {
    const allDone = levels.every(cleared);
    const last = idx === levels.length - 1;
    const nextIdx = levels.findIndex((l, i) => i > idx && !cleared(l));
    const stats = [g.stats && g.stats.lines ? plural(g.stats.lines, 'line') + ' of code' : null, g.stats && g.stats.actions ? plural(g.stats.actions, 'action') : null].filter(Boolean).join(' · ');
    const buttons = [];
    if (!allDone && nextIdx !== -1) buttons.push(h('button.btn.btn-primary', { type: 'button', onclick: () => openLevel(nextIdx) }, 'Next level', icon('arrow-right', 16)));
    else if (!last && !allDone) buttons.push(h('button.btn.btn-primary', { type: 'button', onclick: () => openLevel(idx + 1) }, 'Next level', icon('arrow-right', 16)));
    if (stars < 3 && !usedSolution) buttons.push(h('button.btn.btn-secondary', { type: 'button', onclick: () => ed.focus() }, icon('star', 15), 'Go for more stars'));
    resultEl.hidden = false;
    resultEl.className = 'game-result is-pass' + (stars === 3 ? ' is-perfect' : '');
    setChildren(resultEl, 
      h('div.gr-head', icon('trophy', 22), h('strong', outcome.completed ? 'Game complete!' : 'Level cleared!'), starRow(stars)),
      h('p', g.message || 'Mission complete.'),
      stats ? h('p.muted', stats) : null,
      g.detail ? h('p.gr-par', icon('star', 14), g.detail) : null,
      usedSolution && stars === 1 && g.stars > 1 ? h('p.muted', 'You looked at the solution, so this counts as one star. Replay the level later to earn more.') : null,
      outcome.gained ? h('p.gr-xp', icon('zap', 14), `+${outcome.gained} XP`) : null,
      allDone
        ? h(
            'div.gr-done',
            h('h3', outcome.completed || rec().done ? `You finished ${title}` : 'Every level is cleared'),
            h('p', `${levels.reduce((n, l) => n + best(l), 0)} of ${levels.length * 3} stars collected. Go back for the missing stars any time.`),
            h('div.btn-row', h('a.btn.btn-primary', { href: `#/c/${cid}/${mid}` }, 'Back to the module', icon('arrow-right', 16)), h('a.btn.btn-secondary', { href: nextHref().href }, nextHref().label))
          )
        : null,
      buttons.length ? h('div.btn-row', buttons) : null
    );
  }

  async function run() {
    if (busy) return;
    setBusy(true);
    stage.stop();
    resultEl.hidden = true;
    try {
      let harnessText;
      try {
        harnessText = await harness;
      } catch (err) {
        showFail('The game engine files could not be loaded. Check your connection and try again.', String(err.message || err), 'warn');
        return;
      }
      const code = ed.getValue();
      const res = await runInto({
        con,
        editor: ed,
        request: requestFor({ code, stdin: game.engine === 'judge' ? firstInput(level) : '', files: levelFiles(level), mode: 'game', extra: { harness: harnessText, level: pythonLevel(level), interactive: false } }),
        timeoutMs: (Number(level.config.timeout) || 10) * 1000,
      });
      store.bump('runs');
      const e = res.error;
      const problem = engineProblem(res);
      if (problem) return showFail(problem, '', 'warn');
      if (e && e.kind === 'stopped') return;
      if (e && e.kind === 'timeout') {
        failedRuns++;
        refreshButtons();
        return showFail(`Your program ran for more than ${e.seconds || 10} seconds without finishing.`, 'A loop that never ends is the usual cause: check what makes the loop stop. If the loop does end on small inputs, the method may be too slow for the big ones: look for a way to do less work.');
      }
      if (e && e.kind === 'crash' && /call stack|recursion/i.test(String(e.message || ''))) {
        failedRuns++;
        refreshButtons();
        return showFail('Your recursion went too deep.', 'A function called itself so many times that the engine ran out of room. Python allows about 1,000 nested calls. Use a loop, or build the answer from the bottom up in a list.');
      }
      if (e && (e.kind === 'engine' || e.kind === 'crash' || e.kind === 'internal')) return showFail('Python stopped unexpectedly.', e.message, 'warn');
      const g = res.game;
      if (!g || g.harness_error) {
        console.error('Game harness error:', g && g.harness_error);
        return showFail('This level could not be checked. This is a problem with the level, not with your code.', g && g.harness_error ? g.harness_error.split('\n').slice(-3).join('\n') : '', 'warn');
      }
      // show what happened, then the verdict
      stage.show(g, { autoplay: true });
      if (matchMedia('(max-width: 979px)').matches) stage.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (g.passed) {
        const stars = usedSolution ? Math.min(1, g.stars || 1) : g.stars || 1;
        const outcome = store.recordGameLevel(gameKey, level.id, stars, levels.length);
        drawRail();
        drawBrief();
        refreshButtons();
        showPass(g, stars, outcome);
      } else {
        failedRuns++;
        refreshButtons();
        showFail(g.message || 'The program did not finish the mission.', g.detail || (game.engine === 'rover' ? 'Replay the board and use the step buttons to see where it went wrong.' : ''));
      }
    } finally {
      setBusy(false);
    }
  }

  // ---- page ----
  const intro = game.intro
    ? h('details.game-story', h('summary', icon('book', 16), 'The story and how to play'), h('div.prose', { html: renderMarkdown(game.intro) }))
    : null;

  const node = h(
    'article.page.game-page',
    { dataset: { line: m.line.id, engine: game.engine } },
    h('p.crumbs', h('a', { href: `#/c/${cid}` }, course.title), h('span', ' / '), h('a', { href: `#/c/${cid}/${mid}` }, m.title), h('span', ' / '), h('span', 'Game')),
    h('header.game-head', h('div', h('p.eyebrow', h('span.with-icon', icon('gamepad', 15), 'Module game')), h('h1', title), m.gameSummary ? h('p.lede', m.gameSummary) : null), statsEl),
    intro,
    h('nav.game-rail-wrap', { 'aria-label': 'Levels' }, railEl),
    h('div.game-layout', briefEl, side, codeArea)
  );

  openLevel(idx, { focus: false });
  const unsubscribe = store.subscribe(() => {
    drawRail();
  });

  return {
    node,
    title: `${title} · ${m.title}`,
    cleanup() {
      unsubscribe();
      flushDraft();
      stage.destroy();
    },
  };
}
