import { h, plural, download, formatDate } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { loadCourseList, loadCourse, moduleProgress } from '../content.js';
import { store, rankFor } from '../store.js';
import { allBadgeDefs, EXTRA_BADGES } from '../badges.js';
import { RANKS } from '../config.js';
import { toast } from '../ui/toast.js';

export async function progressView() {
  const list = await loadCourseList();
  const courses = await Promise.all(list.map((c) => loadCourse(c.id)));
  const s = store.state;
  const rank = rankFor(s.xp);

  const lessonsDone = Object.keys(s.lessons).length;
  const exercisesDone = Object.values(s.exercises).filter((e) => e.done).length;
  const quizzesPassed = Object.values(s.quizzes).filter((q) => q.passed).length;
  const levels = Object.values(s.games).reduce((n, g) => n + Object.keys(g.levels).length, 0);
  const stars = Object.values(s.games).reduce((n, g) => n + Object.values(g.levels).reduce((k, l) => k + l.stars, 0), 0);
  const totalLessons = courses.reduce((n, c) => n + c.modules.reduce((k, m) => k + m.lessons.length, 0), 0);

  const rankCard = h(
    'section.rank-card',
    h('div.rank-main', h('p.rank-level', `Rank ${rank.level}`), h('h2', rank.name), h('p.rank-xp', h('strong', s.xp.toLocaleString()), ' XP')),
    h(
      'div.rank-next',
      rank.next ? h('p', `${(rank.next.xp - s.xp).toLocaleString()} XP to ${rank.next.name}`) : h('p', 'You have reached the top rank.'),
      h('div.progress-bar', { role: 'progressbar', 'aria-valuenow': rank.pct, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'Progress to next rank' }, h('i', { style: { width: rank.pct + '%' } }))
    ),
    h('div.streak', icon('flame', 22), h('div', h('strong', plural(s.streak.count, 'day')), h('span', `streak · best ${s.streak.best}`)))
  );

  const tiles = h(
    'ul.tiles',
    tile('book', lessonsDone, `of ${totalLessons}`, 'lessons finished'),
    tile('terminal', exercisesDone, '', 'exercises solved'),
    tile('list', quizzesPassed, '', 'quizzes passed'),
    tile('gamepad', levels, '', 'game levels cleared'),
    tile('star', stars, '', 'game stars')
  );

  const modulesSection = h(
    'section.prog-modules',
    h('h2', 'Modules'),
    courses.map((c) =>
      h(
        'ul.mod-bars',
        c.modules
          .filter((m) => !m.missing)
          .map((m) => {
            const p = moduleProgress(m, s);
            return h('li', { dataset: { line: m.line.id } }, h('a', { href: `#/c/${c.id}/${m.id}` }, h('span.mb-title', `${m.index + 1}. ${m.title}`), h('span.mb-pct', p.complete ? 'Complete' : p.pct + '%')), h('div.progress-bar', { 'aria-hidden': 'true' }, h('i', { style: { width: p.pct + '%' } })));
          })
      )
    )
  );

  const defs = [...allBadgeDefs(courses), ...EXTRA_BADGES];
  const earnedCount = defs.filter((d) => s.badges[d.id]).length;
  const badgesSection = h(
    'section.badges',
    h('h2', 'Badges'),
    h('p.muted', `${earnedCount} of ${defs.length} earned`),
    h(
      'ul.badge-grid',
      defs.map((d) => {
        const at = s.badges[d.id];
        return h('li.badge' + (at ? '.is-earned' : ''), { dataset: d.line ? { line: d.line } : {}, title: at ? `Earned ${formatDate(at)}` : 'Not earned yet' }, h('span.badge-icon', icon(at ? d.icon : 'lock', 22)), h('div', h('strong', d.title), h('span', d.text)));
      })
    )
  );

  const courseDone = courses.length && courses.every((c) => c.modules.filter((m) => !m.missing).every((m) => moduleProgress(m, s).complete));
  const certSection = h(
    'section.cert-card',
    h('h2', 'Certificate'),
    courseDone ? h('p', 'You have finished every module. You can print a certificate of completion.') : h('p', 'Finish every lesson, quiz and game in the course to unlock a printable certificate of completion.'),
    courseDone ? h('a.btn.btn-primary', { href: `#/certificate/${courses[0].id}` }, icon('award', 16), 'Open my certificate') : null
  );

  const nameInput = h('input.input', { type: 'text', maxlength: 60, value: s.name, placeholder: 'Your name (used on the certificate)', 'aria-label': 'Your name', onchange: (e) => store.setName(e.target.value.trim()) });
  const fileInput = h('input', {
    type: 'file',
    accept: 'application/json,.json',
    hidden: true,
    onchange: async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        store.importJson(await f.text());
        toast('Progress restored', { icon: 'check' });
        location.reload();
      } catch (err) {
        toast(err.message || 'Could not read that file', { kind: 'error' });
      }
    },
  });
  const dataSection = h(
    'section.data-card',
    h('h2', 'Your data'),
    h('p', 'Your progress is saved only in this browser. To keep it safe, or to move to another device, download a backup file and restore it there.'),
    h('div.field', h('label', 'Name'), nameInput),
    h(
      'div.btn-row',
      h('button.btn.btn-secondary', { type: 'button', onclick: () => download(`codequest-backup-${new Date().toISOString().slice(0, 10)}.json`, store.exportJson(), 'application/json') }, icon('download', 16), 'Download backup'),
      h('button.btn.btn-secondary', { type: 'button', onclick: () => fileInput.click() }, icon('upload', 16), 'Restore from backup'),
      fileInput,
      h(
        'button.btn.btn-ghost.btn-danger-text',
        {
          type: 'button',
          onclick: () => {
            if (confirm('Erase all progress, badges and saved code in this browser? This cannot be undone.')) {
              store.reset();
              toast('Progress erased');
              location.hash = '#/';
              location.reload();
            }
          },
        },
        icon('trash', 15),
        'Erase everything'
      )
    )
  );

  const node = h('section.page.progress-page', h('h1', 'Your progress'), rankCard, tiles, modulesSection, badgesSection, certSection, dataSection, h('details.rank-ladder', h('summary', 'All ranks'), h('ol', RANKS.map((r) => h('li' + (r.name === rank.name ? '.is-current' : ''), h('strong', r.name), h('span', `${r.xp.toLocaleString()} XP`))))));
  return { node, title: 'Progress' };
}

function tile(ic, n, of, label) {
  return h('li.tile', icon(ic, 20), h('strong', String(n), of ? h('small', ` ${of}`) : null), h('span', label));
}
