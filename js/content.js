// Loads course content (JSON + Markdown files) and caches it.
// Layout on disk:
//   content/courses.json                     { "courses": ["python"] }
//   content/<course>/course.json
//   content/<course>/<module>/module.json
//   content/<course>/<module>/<lesson-id>.md, quiz.md, game.md, cheatsheet.md

import { SITE } from './config.js';
import { parseDoc } from './lib/doc.js';

const textCache = new Map();
const docCache = new Map();
let coursesCache = null;
const courseCache = new Map();

export const url = (...parts) => `${SITE.contentRoot}/${parts.join('/')}`;

export async function fetchText(path) {
  if (textCache.has(path)) return textCache.get(path);
  const p = fetch(path).then(async (r) => {
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    return r.text();
  });
  textCache.set(path, p);
  p.catch(() => textCache.delete(path));
  return p;
}

async function fetchJson(path) {
  return JSON.parse(await fetchText(path));
}

export async function loadCourseList() {
  if (!coursesCache) {
    coursesCache = (async () => {
      const index = await fetchJson(url('courses.json'));
      return Promise.all(index.courses.map((id) => fetchJson(url(id, 'course.json')).then((c) => ({ ...c, id }))));
    })();
    coursesCache.catch(() => (coursesCache = null));
  }
  return coursesCache;
}

/** "data-and-variables" -> "Data and variables" (used for modules that are not written yet). */
const prettify = (id) => {
  const t = String(id).replace(/[-_]+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/**
 * Full course with modules and lesson lists resolved.
 * course.json lists each line's modules:  lines: [{ id, title, summary, modules: ["a", "b"] }]
 * (a plain top-level "modules" array is also accepted; then each module.json names its line).
 */
export async function loadCourse(id) {
  if (courseCache.has(id)) return courseCache.get(id);
  const p = (async () => {
    const course = { ...(await fetchJson(url(id, 'course.json'))), id };
    const lines = new Map((course.lines || []).map((l) => [l.id, l]));
    const lineOf = new Map();
    for (const l of course.lines || []) for (const mid of l.modules || []) lineOf.set(mid, l);
    const ids = course.modules || (course.lines || []).flatMap((l) => l.modules || []);
    const modules = await Promise.all(
      ids.map(async (mid, index) => {
        const declared = lineOf.get(mid);
        try {
          const m = await fetchJson(url(id, mid, 'module.json'));
          if (m.status === 'soon') {
            // Planned but not published yet: it shows on the map as "Coming soon" (remove "status" from module.json to publish it).
            return { id: mid, index, course: id, key: `${id}/${mid}`, title: m.title || prettify(mid), summary: m.summary, level: m.level, missing: true, soon: true, lessons: [], line: declared || lines.get(m.line) || (course.lines || [])[0] };
          }
          const lessons = (m.lessons || []).map((l, i) => ({ ...l, index: i, file: l.file || `${l.id}.md`, key: `${id}/${mid}/${l.id}` }));
          return {
            ...m,
            id: mid,
            index,
            course: id,
            key: `${id}/${mid}`,
            lessons,
            line: declared || lines.get(m.line) || (course.lines || [])[0] || { id: 'x', title: '' },
            minutes: m.minutes || lessons.reduce((n, l) => n + (l.minutes || 0), 0),
          };
        } catch {
          return { id: mid, index, course: id, key: `${id}/${mid}`, title: prettify(mid), missing: true, lessons: [], line: declared || (course.lines || [])[0] };
        }
      })
    );
    course.modules = modules;
    course.lineList = (course.lines || []).map((l) => ({ ...l, modules: modules.filter((m) => m.line && m.line.id === l.id) }));
    return course;
  })();
  courseCache.set(id, p);
  p.catch(() => courseCache.delete(id));
  return p;
}

export async function loadDoc(course, moduleId, file) {
  const path = url(course, moduleId, file);
  if (docCache.has(path)) return docCache.get(path);
  const p = fetchText(path).then((text) => parseDoc(text, { file: path }));
  docCache.set(path, p);
  p.catch(() => docCache.delete(path));
  return p;
}

export async function loadOptionalDoc(course, moduleId, file) {
  if (!file) return null;
  try {
    return await loadDoc(course, moduleId, file);
  } catch {
    return null;
  }
}

/** Flat list of every lesson in order (for next/previous across modules). */
export function flattenLessons(course) {
  const out = [];
  for (const m of course.modules) for (const l of m.lessons) out.push({ module: m, lesson: l });
  return out;
}

export function findModule(course, moduleId) {
  return course.modules.find((m) => m.id === moduleId) || null;
}

/** Progress summary of one module from the store state. */
export function moduleProgress(m, state) {
  const lessonsDone = m.lessons.filter((l) => state.lessons[l.key]).length;
  const quiz = state.quizzes[m.key];
  const game = state.games[m.key];
  const hasQuiz = !!m.quiz;
  const hasGame = !!m.game;
  const quizDone = !hasQuiz || !!(quiz && quiz.passed);
  const gameDone = !hasGame || !!(game && game.done);
  const parts = m.lessons.length + (hasQuiz ? 1 : 0) + (hasGame ? 1 : 0);
  const done = lessonsDone + (hasQuiz && quizDone ? 1 : 0) + (hasGame && gameDone ? 1 : 0);
  return {
    lessonsDone,
    lessonsTotal: m.lessons.length,
    quizDone: hasQuiz && quizDone,
    gameDone: hasGame && gameDone,
    hasQuiz,
    hasGame,
    done,
    parts,
    pct: parts ? Math.round((done / parts) * 100) : 0,
    complete: parts > 0 && done === parts,
  };
}
