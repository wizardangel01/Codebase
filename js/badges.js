// Badge definitions. Badges are derived from progress, so they can be re-evaluated at any
// time: `evaluateBadges(courses)` grants anything newly earned and returns the new ones.

import { store } from './store.js';
import { moduleProgress } from './content.js';

export const STATIC_BADGES = [
  { id: 'first-run', title: 'First run', text: 'Ran your first Python program.', icon: 'play', test: (s) => s.stats.runs >= 1 },
  { id: 'first-lesson', title: 'Lesson learned', text: 'Finished a lesson.', icon: 'book', test: (s) => Object.keys(s.lessons).length >= 1 },
  { id: 'first-exercise', title: 'Exercise solved', text: 'Passed every check on an exercise.', icon: 'check', test: (s) => Object.values(s.exercises).some((e) => e.done) },
  { id: 'bug-squasher', title: 'Bug squasher', text: 'Fixed a failing exercise after a failed attempt.', icon: 'bug', test: (s) => s.stats.fixes >= 1 },
  { id: 'no-hints', title: 'Clean solves', text: 'Solved 5 exercises without hints or the solution.', icon: 'bulb', test: (s) => s.stats.cleanSolves >= 5 },
  { id: 'quiz-ace', title: 'Quiz ace', text: 'Scored 100% on a module quiz.', icon: 'award', test: (s) => Object.values(s.quizzes).some((q) => q.perfect) },
  { id: 'game-on', title: 'Game on', text: 'Cleared a game level.', icon: 'gamepad', test: (s) => Object.values(s.games).some((g) => Object.keys(g.levels).length >= 1) },
  { id: 'three-stars', title: 'Three stars', text: 'Earned 3 stars on a game level.', icon: 'star', test: (s) => Object.values(s.games).some((g) => Object.values(g.levels).some((l) => l.stars >= 3)) },
  { id: 'streak-3', title: 'Three-day streak', text: 'Learned on 3 days in a row.', icon: 'flame', test: (s) => s.streak.best >= 3 },
  { id: 'streak-7', title: 'Week streak', text: 'Learned on 7 days in a row.', icon: 'flame', test: (s) => s.streak.best >= 7 },
  { id: 'explorer', title: 'Explorer', text: 'Ran 5 programs in the playground.', icon: 'terminal', test: (s) => s.stats.playgroundRuns >= 5 },
  { id: 'sharer', title: 'Show and tell', text: 'Shared a playground link.', icon: 'link', test: (s) => s.stats.shares >= 1 },
];

export function allBadgeDefs(courses = []) {
  const defs = [...STATIC_BADGES];
  for (const c of courses) {
    for (const m of c.modules) {
      if (m.missing) continue;
      defs.push({
        id: `module:${m.key}`,
        title: m.title,
        text: `Finished every lesson, the quiz and the game in “${m.title}”.`,
        icon: 'flag',
        line: m.line && m.line.id,
        module: m,
        test: (s) => moduleProgress(m, s).complete,
      });
    }
    for (const l of c.lineList || []) {
      const mods = l.modules.filter((m) => !m.missing);
      if (!mods.length) continue;
      defs.push({
        id: `line:${c.id}/${l.id}`,
        title: `${l.title} line`,
        text: `Completed every module on the ${l.title} line.`,
        icon: 'map',
        line: l.id,
        test: (s) => mods.every((m) => moduleProgress(m, s).complete),
      });
    }
    const real = c.modules.filter((m) => !m.missing);
    if (real.length) {
      defs.push({
        id: `course:${c.id}`,
        title: `${c.title} graduate`,
        text: `Completed every module of the ${c.title} course.`,
        icon: 'trophy',
        test: (s) => real.every((m) => moduleProgress(m, s).complete),
      });
    }
  }
  return defs;
}

/** Grant any badge that is now earned. Returns the list of newly granted definitions. */
export function evaluateBadges(courses) {
  const s = store.state;
  const fresh = [];
  const hour = new Date().getHours();
  const defs = allBadgeDefs(courses);
  for (const d of defs) {
    if (!store.hasBadge(d.id) && d.test(s)) {
      store.grantBadge(d.id);
      fresh.push(d);
      // Finishing a module also pays a one-off XP bonus.
      if (d.id.startsWith('module:')) store.completeModuleBonus(d.id.slice(7));
    }
  }
  if (s.stats.runs >= 1) {
    if (hour < 5 && !store.hasBadge('night-owl')) {
      store.grantBadge('night-owl');
      fresh.push({ id: 'night-owl', title: 'Night owl', text: 'Ran code in the small hours.', icon: 'moon' });
    }
    if (hour >= 5 && hour < 7 && !store.hasBadge('early-bird')) {
      store.grantBadge('early-bird');
      fresh.push({ id: 'early-bird', title: 'Early bird', text: 'Ran code before breakfast.', icon: 'sun' });
    }
  }
  return fresh;
}

export const EXTRA_BADGES = [
  { id: 'night-owl', title: 'Night owl', text: 'Ran code in the small hours.', icon: 'moon' },
  { id: 'early-bird', title: 'Early bird', text: 'Ran code before breakfast.', icon: 'sun' },
];
