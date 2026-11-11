import { h, plural } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { loadCourseList, loadCourse } from '../content.js';
import { store } from '../store.js';
import { SITE } from '../config.js';
import { createRunBlock } from '../ui/runblock.js';
import { renderRouteMap } from '../ui/route-map.js';

const DEMO = `name = "Ada"
for step in range(1, 4):
    print(f"Step {step}: hello, {name}!")
`;

export async function homeView() {
  const list = await loadCourseList();
  const course = await loadCourse(list[0].id);
  const state = store.state;
  const real = course.modules.filter((m) => !m.missing);
  const lessonCount = real.reduce((n, m) => n + m.lessons.length, 0);
  const gameCount = real.filter((m) => m.game).length;
  const first = real[0];

  const last = state.last && state.last.route && state.last.route.startsWith('/c/') ? state.last : null;
  const startHref = last ? '#' + last.route : first ? `#/c/${course.id}/${first.id}` : `#/c/${course.id}`;

  const demo = createRunBlock({ code: DEMO.trimEnd(), label: 'hello.py', minLines: 3 });
  const con = demo.runBlock.console;
  con.write('stdout', 'Step 1: hello, Ada!\nStep 2: hello, Ada!\nStep 3: hello, Ada!\n');
  con.el.classList.add('is-ghost');

  const node = h(
    'div.home',
    h(
      'section.hero',
      h(
        'div.hero-copy',
        h('h1', 'Python, from your first print() to production code'),
        h('p.lede', `${plural(real.length, 'module')} of short lessons, exercises that check your code, and a game at the end of every module. Everything runs in your browser, so there is nothing to install.`),
        h(
          'div.btn-row',
          h('a.btn.btn-primary.btn-lg', { href: startHref }, icon('play', 18), last ? 'Continue learning' : 'Start with module 1'),
          h('a.btn.btn-secondary.btn-lg', { href: '#/play' }, icon('terminal', 18), 'Open the playground')
        ),
        last ? h('p.hero-last', 'Last visit: ', h('a', { href: '#' + last.route }, last.title || 'your last lesson')) : h('p.hero-last.muted', 'Free. No account. Your progress stays in this browser.')
      ),
      h('div.hero-demo', h('p.demo-label', 'Try it now. Change the code and press Run.'), demo)
    ),
    h(
      'section.route-section',
      h('div.section-head', h('h2', 'The route'), h('p', `${plural(lessonCount, 'lesson')}, ${plural(gameCount, 'game')}, five lines. Take them in order, or jump to any station.`)),
      renderRouteMap(course, state, { compact: true }),
      h('p.route-more', h('a.btn.btn-secondary', { href: `#/c/${course.id}` }, icon('map', 16), 'See the full course map'))
    ),
    h(
      'section.parts',
      h('div.section-head', h('h2', 'What you do in every module')),
      h(
        'ol.parts-list',
        part('book', 'Lessons', 'Short readings with code you can edit and run. Step-through diagrams show what each line does.'),
        part('terminal', 'Exercises', 'Write code, press Check, and get feedback that names exactly what is wrong. Hints are there when you need them.'),
        part('list', 'A quiz', 'Questions that make you predict output, fill gaps and put lines in order.'),
        part('gamepad', 'A game', 'Every module ends with a game you play by writing Python, using what the module taught.')
      )
    )
  );
  return { node, title: 'Learn Python' };
}

function part(ic, title, text) {
  return h('li.part', h('span.part-icon', icon(ic, 22)), h('div', h('h3', title), h('p', text)));
}
