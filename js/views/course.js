import { h, plural, minutesLabel } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { loadCourse, moduleProgress } from '../content.js';
import { store } from '../store.js';
import { renderRouteMap } from '../ui/route-map.js';

export async function courseView({ course: id }) {
  const course = await loadCourse(id);
  const state = store.state;
  const real = course.modules.filter((m) => !m.missing);
  const progress = real.map((m) => moduleProgress(m, state));
  const doneModules = progress.filter((p) => p.complete).length;
  const pct = real.length ? Math.round(progress.reduce((n, p) => n + p.pct, 0) / real.length) : 0;
  const minutes = real.reduce((n, m) => n + (m.minutes || 0), 0);
  const lessons = real.reduce((n, m) => n + m.lessons.length, 0);

  const nextIdx = progress.findIndex((p) => !p.complete);
  const next = nextIdx === -1 ? null : real[nextIdx];

  const node = h(
    'section.page.course-page',
    h(
      'header.course-head',
      h('h1', course.title),
      course.subtitle ? h('p.lede', course.subtitle) : null,
      h(
        'div.course-stats',
        h('div', h('strong', String(real.length)), h('span', real.length === 1 ? 'module' : 'modules')),
        h('div', h('strong', String(lessons)), h('span', lessons === 1 ? 'lesson' : 'lessons')),
        h('div', h('strong', minutesLabel(minutes) || '-'), h('span', 'of material')),
        h('div', h('strong', `${doneModules}/${real.length}`), h('span', 'modules complete'))
      ),
      h('div.progress-bar', { role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'Course progress' }, h('i', { style: { width: pct + '%' } })),
      next ? h('p', h('a.btn.btn-primary', { href: `#/c/${course.id}/${next.id}` }, icon('play', 16), progress[nextIdx].done ? `Continue: ${next.title}` : `Start: ${next.title}`)) : h('p.callout-inline', icon('trophy', 18), 'You have completed every module. Open the Progress page to print your certificate.')
    ),
    renderRouteMap(course, state)
  );
  return { node, title: course.title };
}
