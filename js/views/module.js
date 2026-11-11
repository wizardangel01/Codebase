import { h, plural, minutesLabel } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { loadCourse, findModule, moduleProgress, loadOptionalDoc } from '../content.js';
import { store } from '../store.js';
import { renderMarkdown } from '../lib/markdown.js';
import { stripMarkdown } from '../lib/markdown.js';

const LEVEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export async function moduleView({ course: cid, module: mid }) {
  const course = await loadCourse(cid);
  const m = findModule(course, mid);
  if (!m || m.missing) throw Object.assign(new Error('There is no module called “' + mid + '”.'), { notFound: true });
  const state = store.state;
  const p = moduleProgress(m, state);

  // find the "next up" station
  let nextKey = null;
  for (const l of m.lessons) if (!state.lessons[l.key]) { nextKey = l.key; break; }
  if (!nextKey && m.quiz && !p.quizDone) nextKey = 'quiz';
  if (!nextKey && m.game && !p.gameDone) nextKey = 'game';

  const rows = m.lessons.map((l, i) => {
    const done = !!state.lessons[l.key];
    return stationRow({
      href: `#/c/${cid}/${mid}/${l.id}`,
      kind: 'lesson',
      label: String(i + 1),
      title: l.title,
      text: l.summary,
      meta: l.minutes ? minutesLabel(l.minutes) : '',
      done,
      next: nextKey === l.key,
    });
  });
  if (m.quiz) {
    const q = store.quiz(m.key);
    rows.push(stationRow({ href: `#/c/${cid}/${mid}/quiz`, kind: 'quiz', icon: 'list', title: 'Module quiz', text: 'Check what you remember. 70% passes.', meta: q ? `Best ${q.best}/${q.total}` : '', done: p.quizDone, next: nextKey === 'quiz' }));
  }
  if (m.game) {
    const g = store.game(m.key);
    const levels = Object.keys(g.levels).length;
    rows.push(stationRow({ href: `#/c/${cid}/${mid}/game`, kind: 'game', icon: 'gamepad', title: m.gameTitle || 'Module game', text: m.gameSummary || 'Play with the module’s ideas by writing Python.', meta: levels ? `${levels} level${levels === 1 ? '' : 's'} cleared` : '', done: p.gameDone, next: nextKey === 'game' }));
  }

  const idx = course.modules.indexOf(m);
  const prevM = course.modules.slice(0, idx).reverse().find((x) => !x.missing);
  const nextM = course.modules.slice(idx + 1).find((x) => !x.missing);

  // cheat sheet loads on demand
  let cheat = null;
  if (m.cheatsheet) {
    const body = h('div.prose.cheat-body');
    cheat = h('details.cheatsheet', { ontoggle: async (e) => {
      if (!e.target.open || body.dataset.loaded) return;
      body.dataset.loaded = '1';
      const doc = await loadOptionalDoc(cid, mid, m.cheatsheet);
      body.innerHTML = doc ? doc.nodes.filter((n) => n.type === 'md').map((n) => renderMarkdown(n.text)).join('\n') : '<p>The cheat sheet could not be loaded.</p>';
    } }, h('summary', icon('book', 16), 'Cheat sheet for this module'), body);
  }

  const node = h(
    'article.page.module-page',
    { dataset: { line: m.line.id } },
    h('p.crumbs', h('a', { href: `#/c/${cid}` }, course.title), h('span', ' / '), h('span', `${m.line.title} line`)),
    h(
      'header.mod-head',
      h('div.mod-badge', h('span', String(m.index + 1))),
      h(
        'div',
        h('h1', m.title),
        h('p.lede', m.summary),
        h('div.mod-meta', h('span.chip.chip-level', LEVEL[m.level] || m.level || ''), h('span', plural(m.lessons.length, 'lesson')), m.minutes ? h('span', minutesLabel(m.minutes)) : null, m.game ? h('span.with-icon', icon('gamepad', 14), 'Ends with a game') : null)
      )
    ),
    h('div.progress-bar', { role: 'progressbar', 'aria-valuenow': p.pct, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'Module progress' }, h('i', { style: { width: p.pct + '%' } })),
    m.outcomes && m.outcomes.length ? h('section.outcomes', h('h2', 'By the end you can'), h('ul', m.outcomes.map((o) => h('li', o)))) : null,
    h('section.mod-route', h('h2.sr-only', 'Stations'), h('ol.mod-stations', rows)),
    cheat,
    h(
      'nav.pager',
      { 'aria-label': 'Other modules' },
      prevM ? h('a.pager-link', { href: `#/c/${cid}/${prevM.id}` }, icon('arrow-left', 16), h('span', h('small', 'Previous module'), prevM.title)) : h('span'),
      nextM ? h('a.pager-link.is-next', { href: `#/c/${cid}/${nextM.id}` }, h('span', h('small', 'Next module'), nextM.title), icon('arrow-right', 16)) : h('span')
    )
  );
  return { node, title: m.title };
}

function stationRow({ href, kind, label, icon: ic, title, text, meta, done, next }) {
  return h(
    'li.mstation.is-' + kind + (done ? '.is-done' : '') + (next ? '.is-next' : ''),
    h(
      'a',
      { href },
      h('span.mdot', done ? icon('check', 16) : ic ? icon(ic, 16) : label),
      h('span.mstation-main', h('span.mstation-title', title), text ? h('span.mstation-text', text) : null),
      h('span.mstation-side', meta ? h('span.mstation-meta', meta) : null, next ? h('span.chip.chip-next', 'Next up') : done ? h('span.chip.chip-done', 'Done') : null)
    )
  );
}
