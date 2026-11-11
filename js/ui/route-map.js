// The "route map": each learning line is a coloured rail, each module a station on it.
// Used full-size on the course page and compact on the home page.

import { h, plural, minutesLabel } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { moduleProgress } from '../content.js';

const LEVEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

function station(course, m, p, { compact, current }) {
  const dot = h('span.station-dot', p.complete ? icon('check', 18) : String(m.index + 1));
  if (m.missing) {
    return h('li.station.is-missing', h('div.station-link', dot, h('span.station-main', h('span.station-title', m.title), h('span.station-sum', 'Coming soon'))));
  }
  const lessonDots = h(
    'span.station-dots',
    { 'aria-hidden': 'true' },
    ...m.lessons.map((l, i) => h('i.sdot' + (i < p.lessonsDone ? '.is-done' : ''))),
    m.quiz ? h('i.sdot.is-quiz' + (p.quizDone ? '.is-done' : '')) : null,
    m.game ? h('i.sdot.is-game' + (p.gameDone ? '.is-done' : '')) : null
  );
  return h(
    'li.station' + (p.complete ? '.is-done' : p.done ? '.is-started' : '') + (current ? '.is-current' : ''),
    h(
      'a.station-link',
      { href: `#/c/${course.id}/${m.id}`, 'aria-label': `Module ${m.index + 1}: ${m.title}. ${p.pct}% complete.` },
      dot,
      h(
        'span.station-main',
        h('span.station-title', m.title),
        compact ? null : h('span.station-sum', m.summary || ''),
        compact
          ? null
          : h(
              'span.station-meta',
              h('span.chip.chip-level', LEVEL[m.level] || m.level || ''),
              h('span', plural(m.lessons.length, 'lesson')),
              m.minutes ? h('span', minutesLabel(m.minutes)) : null,
              m.game ? h('span.with-icon', icon('gamepad', 14), 'Game') : null,
              lessonDots
            ),
        compact || !p.done ? null : h('span.station-progress', p.complete ? 'Complete' : `${p.pct}% done`)
      )
    )
  );
}

export function renderRouteMap(course, state, { compact = false } = {}) {
  const wrap = h('div.route' + (compact ? '.is-compact' : ''));
  let currentAssigned = false;
  for (const line of course.lineList) {
    const mods = line.modules;
    if (!mods.length) continue;
    const progresses = mods.map((m) => (m.missing ? { pct: 0, complete: false, done: 0 } : moduleProgress(m, state)));
    const fill = Math.round(progresses.reduce((n, p) => n + p.pct, 0) / mods.length);
    const rail = h('ol.rail');
    mods.forEach((m, i) => {
      const isCurrent = !currentAssigned && !m.missing && !progresses[i].complete;
      if (isCurrent) currentAssigned = true;
      rail.appendChild(station(course, m, progresses[i], { compact, current: isCurrent }));
    });
    wrap.appendChild(
      h(
        'section.rline',
        { dataset: { line: line.id }, style: { '--fill': fill + '%' } },
        h('header.rline-head', h('h3', line.title), !compact && line.summary ? h('p', line.summary) : null),
        rail
      )
    );
  }
  return wrap;
}
