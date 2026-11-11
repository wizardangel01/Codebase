import { h, plural, minutesLabel } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { loadCourse, findModule, loadDoc } from '../content.js';
import { store } from '../store.js';
import { renderDoc } from '../ui/doc-render.js';
import { toast } from '../ui/toast.js';

/** Where "next" leads from a lesson: next lesson, the quiz, the game, or the next module. */
export function nextAfterLesson(course, m, lesson) {
  const i = m.lessons.indexOf(lesson);
  const base = `#/c/${course.id}/${m.id}`;
  if (i < m.lessons.length - 1) return { href: `${base}/${m.lessons[i + 1].id}`, label: m.lessons[i + 1].title, kind: 'lesson' };
  if (m.quiz) return { href: `${base}/quiz`, label: 'Module quiz', kind: 'quiz' };
  if (m.game) return { href: `${base}/game`, label: m.gameTitle || 'Module game', kind: 'game' };
  const nm = course.modules.slice(m.index + 1).find((x) => !x.missing);
  return nm ? { href: `#/c/${course.id}/${nm.id}`, label: nm.title, kind: 'module' } : { href: `#/c/${course.id}`, label: 'Course map', kind: 'course' };
}

export async function lessonView({ course: cid, module: mid, lesson: lid }) {
  const course = await loadCourse(cid);
  const m = findModule(course, mid);
  const lesson = m && m.lessons.find((l) => l.id === lid);
  if (!m || !lesson) throw Object.assign(new Error('There is no lesson called “' + lid + '” in this module.'), { notFound: true });
  const doc = await loadDoc(cid, mid, lesson.file);
  if (doc.errors.length) console.warn('Lesson has formatting problems:', doc.errors);
  const { el, toc, exercises } = renderDoc(doc, { key: lesson.key });
  const route = `/c/${cid}/${mid}/${lid}`;
  store.setLast(route, `${m.title}: ${lesson.title}`);

  const i = m.lessons.indexOf(lesson);
  const prev = i > 0 ? m.lessons[i - 1] : null;
  const next = nextAfterLesson(course, m, lesson);

  // --- header ---
  const steps = h(
    'nav.lesson-steps',
    { 'aria-label': 'Lessons in this module' },
    m.lessons.map((l, k) =>
      h('a.lstep' + (l === lesson ? '.is-current' : '') + (store.isLessonDone(l.key) ? '.is-done' : ''), { href: `#/c/${cid}/${mid}/${l.id}`, title: l.title, 'aria-label': `Lesson ${k + 1}: ${l.title}`, 'aria-current': l === lesson ? 'page' : null }, String(k + 1))
    )
  );
  const exCount = exercises.length;
  const meta = h('p.lesson-meta', lesson.minutes ? h('span.with-icon', icon('clock', 15), minutesLabel(lesson.minutes)) : null, exCount ? h('span.with-icon', icon('terminal', 15), plural(exCount, 'exercise')) : null);

  // --- finish bar ---
  const finishBtn = h('button.btn.btn-primary.btn-lg', { type: 'button', onclick: () => finish() });
  const nextLink = h('a.btn.btn-secondary.btn-lg', { href: next.href }, next.kind === 'quiz' ? icon('list', 18) : next.kind === 'game' ? icon('gamepad', 18) : null, h('span', `Next: ${next.label}`), icon('arrow-right', 18));
  const finishNote = h('p.finish-note', { role: 'status' });
  const solvedCount = () => exercises.filter((e) => e.exercise.isSolved()).length;
  function refreshFinish() {
    const done = store.isLessonDone(lesson.key);
    finishBtn.className = 'btn btn-lg ' + (done ? 'btn-done' : 'btn-primary');
    finishBtn.replaceChildren(icon('check', 18), done ? 'Lesson finished' : 'Finish lesson');
    finishBtn.disabled = done;
    nextLink.className = 'btn btn-lg ' + (done ? 'btn-primary' : 'btn-secondary');
    if (exCount && !done) finishNote.textContent = solvedCount() === exCount ? 'All exercises solved.' : `${solvedCount()} of ${exCount} exercises solved. You can finish now and come back to the rest.`;
    else finishNote.textContent = '';
  }
  function finish() {
    store.completeLesson(lesson.key);
    refreshFinish();
    nextLink.focus();
  }
  refreshFinish();
  el.addEventListener('exercise-solved', refreshFinish);

  // --- table of contents ---
  const tocLinks = toc.map((t) =>
    h('li' + (t.exercise ? '.is-exercise' : ''), h('button.toc-link', { type: 'button', onclick: () => t.el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }) }, t.exercise ? icon('terminal', 13) : null, t.text))
  );
  const tocEl = toc.length > 1 ? h('aside.lesson-toc', { 'aria-label': 'On this page' }, h('h2', 'On this page'), h('ul', tocLinks)) : null;
  let observer = null;

  const node = h(
    'article.page.lesson-page',
    { dataset: { line: m.line.id } },
    h('p.crumbs', h('a', { href: `#/c/${cid}` }, course.title), h('span', ' / '), h('a', { href: `#/c/${cid}/${mid}` }, m.title)),
    h('header.lesson-head', m.lessons.length > 1 ? steps : null, h('h1', lesson.title), meta),
    h('div.lesson-layout', h('div.lesson-body', el), tocEl),
    h(
      'footer.lesson-foot',
      h('div.finish-row', finishBtn, nextLink),
      finishNote,
      prev ? h('nav.pager', { 'aria-label': 'Lesson navigation' }, h('a.pager-link', { href: `#/c/${cid}/${mid}/${prev.id}` }, icon('arrow-left', 16), h('span', h('small', 'Previous lesson'), prev.title)), h('span')) : null
    )
  );

  return {
    node,
    title: `${lesson.title} · ${m.title}`,
    after() {
      if (tocEl && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                const idx = toc.findIndex((t) => t.el === e.target);
                tocLinks.forEach((li, k) => li.classList.toggle('is-active', k === idx));
              }
            }
          },
          { rootMargin: '-20% 0px -70% 0px' }
        );
        toc.forEach((t) => observer.observe(t.el));
      }
    },
    cleanup() {
      if (observer) observer.disconnect();
    },
  };
}
