// Learner progress, saved in this browser's localStorage (nothing is sent anywhere).
// All reads and writes are wrapped in try/catch: private windows and blocked storage
// must not break the site, they just mean progress lasts until the tab closes.

import { RANKS, XP } from './config.js';
import { dayKey, daysBetween } from './lib/util.js';

const KEY = 'cq:v1';
const DRAFT = 'cq:v1:draft:';
const mem = new Map(); // fallback when storage is unavailable

const fresh = () => ({
  v: 1,
  created: Date.now(),
  name: '',
  xp: 0,
  streak: { last: '', count: 0, best: 0 },
  lessons: {},
  exercises: {},
  checks: {},
  quizzes: {},
  games: {},
  badges: {},
  stats: { runs: 0, errors: 0, fixes: 0, cleanSolves: 0, playgroundRuns: 0, shares: 0 },
  last: null,
});

function safeGet(k) {
  try {
    const v = localStorage.getItem(k);
    return v === null ? mem.get(k) ?? null : v;
  } catch {
    return mem.get(k) ?? null;
  }
}
function safeSet(k, v) {
  mem.set(k, v);
  try {
    localStorage.setItem(k, v);
  } catch {}
}
function safeDel(k) {
  mem.delete(k);
  try {
    localStorage.removeItem(k);
  } catch {}
}

function load() {
  try {
    const raw = safeGet(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 1) return { ...fresh(), ...s, stats: { ...fresh().stats, ...(s.stats || {}) } };
    }
  } catch {}
  return fresh();
}

let state = load();
const listeners = new Set();
const awardListeners = new Set();

function save() {
  safeSet(KEY, JSON.stringify(state));
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error(e);
    }
  });
}

function award(xp, reason) {
  if (!xp) return;
  state.xp += xp;
  awardListeners.forEach((fn) => fn({ xp, reason, total: state.xp }));
}

function touchStreak() {
  const today = dayKey();
  const s = state.streak;
  if (s.last === today) return;
  s.count = s.last && daysBetween(s.last, today) === 1 ? s.count + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best, s.count);
}

export function rankFor(xp) {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k;
  const cur = RANKS[i];
  const next = RANKS[i + 1] || null;
  const pct = next ? Math.round(((xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100;
  return { level: i + 1, name: cur.name, next, pct, xp };
}

export const store = {
  get state() {
    return state;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  onAward(fn) {
    awardListeners.add(fn);
    return () => awardListeners.delete(fn);
  },
  rank: () => rankFor(state.xp),

  // --- identity & navigation ------------------------------------------------
  setName(name) {
    state.name = String(name || '').slice(0, 60);
    save();
  },
  setLast(route, title) {
    state.last = { route, title, ts: Date.now() };
    save();
  },
  // --- lessons -----------------------------------------------------------------
  isLessonDone: (key) => !!state.lessons[key],
  completeLesson(key) {
    touchStreak();
    if (state.lessons[key]) {
      save();
      return false;
    }
    state.lessons[key] = Date.now();
    award(XP.lesson, 'Lesson finished');
    save();
    return true;
  },
  // --- exercises ---------------------------------------------------------------
  exercise: (key) => state.exercises[key] || { done: 0, attempts: 0, hints: 0, solution: false },
  recordExerciseAttempt(key, passed, { hints = 0, solution = false } = {}) {
    touchStreak();
    const e = (state.exercises[key] = { ...this.exercise(key) });
    const failedBefore = e.attempts > 0 && !e.done;
    e.attempts += 1;
    e.hints = Math.max(e.hints, hints);
    e.solution = e.solution || solution;
    let gained = 0;
    if (passed && !e.done) {
      e.done = Date.now();
      gained = solution ? XP.exerciseAfterSolution : XP.exercise;
      award(gained, 'Exercise solved');
      if (failedBefore) state.stats.fixes += 1;
      if (!hints && !solution) state.stats.cleanSolves += 1;
    }
    save();
    return gained;
  },
  // --- inline checks -------------------------------------------------------------
  isCheckDone: (key) => !!state.checks[key],
  completeCheck(key) {
    if (state.checks[key]) return 0;
    state.checks[key] = Date.now();
    award(XP.check, 'Check passed');
    save();
    return XP.check;
  },
  // --- quizzes ---------------------------------------------------------------------
  quiz: (key) => state.quizzes[key] || null,
  recordQuiz(key, correct, total, passMark = 0.7) {
    touchStreak();
    const prev = state.quizzes[key];
    const passed = total > 0 && correct / total >= passMark;
    let gained = 0;
    if (!prev || !prev.passed) {
      gained += correct * XP.quizPerQuestion;
      if (passed) gained += XP.quizPass;
    }
    state.quizzes[key] = {
      best: Math.max(prev ? prev.best : 0, correct),
      total,
      passed: passed || !!(prev && prev.passed),
      perfect: (prev && prev.perfect) || correct === total,
      ts: Date.now(),
    };
    if (prev && prev.passed) gained = 0;
    award(gained, passed ? 'Quiz passed' : 'Quiz practice');
    save();
    return gained;
  },
  // --- games -------------------------------------------------------------------------
  game: (key) => state.games[key] || { levels: {}, done: 0 },
  recordGameLevel(key, levelId, stars, totalLevels) {
    touchStreak();
    const g = (state.games[key] = { ...this.game(key), levels: { ...this.game(key).levels } });
    const prev = g.levels[levelId];
    const prevStars = prev ? prev.stars : 0;
    stars = Math.max(1, Math.min(3, stars));
    let gained = 0;
    if (!prev) gained += XP.gameLevel + (stars - 1) * XP.gameStar;
    else if (stars > prevStars) gained += (stars - prevStars) * XP.gameStar;
    g.levels[levelId] = { stars: Math.max(stars, prevStars), ts: Date.now() };
    let completed = false;
    if (!g.done && totalLevels && Object.keys(g.levels).length >= totalLevels) {
      g.done = Date.now();
      gained += XP.gameComplete;
      completed = true;
    }
    award(gained, completed ? 'Game complete' : 'Level cleared');
    save();
    return { gained, completed };
  },
  // --- modules ---------------------------------------------------------------------------
  completeModuleBonus(key) {
    const k = 'module:' + key;
    if (state.badges[k]) return false;
    award(XP.module, 'Module complete');
    return true;
  },
  // --- badges & stats --------------------------------------------------------------------
  hasBadge: (id) => !!state.badges[id],
  grantBadge(id) {
    if (state.badges[id]) return false;
    state.badges[id] = Date.now();
    save();
    return true;
  },
  bump(stat, n = 1) {
    state.stats[stat] = (state.stats[stat] || 0) + n;
    touchStreak();
    save();
  },
  // --- code drafts (kept out of the main record so it stays small) -------------------------
  getDraft: (key) => safeGet(DRAFT + key),
  setDraft: (key, code) => safeSet(DRAFT + key, code),
  clearDraft: (key) => safeDel(DRAFT + key),

  // --- backup & reset ---------------------------------------------------------------------
  exportJson() {
    const drafts = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(DRAFT)) drafts[k.slice(DRAFT.length)] = localStorage.getItem(k);
      }
    } catch {}
    return JSON.stringify({ app: 'codequest', exported: new Date().toISOString(), state, drafts }, null, 2);
  },
  importJson(text) {
    const data = JSON.parse(text);
    if (!data || data.app !== 'codequest' || !data.state || data.state.v !== 1) throw new Error('This file is not a CodeQuest backup.');
    state = { ...fresh(), ...data.state, stats: { ...fresh().stats, ...(data.state.stats || {}) } };
    for (const [k, v] of Object.entries(data.drafts || {})) safeSet(DRAFT + k, v);
    save();
  },
  reset() {
    try {
      const del = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k === KEY || k.startsWith(DRAFT))) del.push(k);
      }
      del.forEach((k) => localStorage.removeItem(k));
    } catch {}
    mem.clear();
    state = fresh();
    save();
  },
};

// Settings that must be readable before the app boots (theme) live in their own keys.
export const prefs = {
  get: (k, d) => {
    const v = safeGet('cq:pref:' + k);
    return v === null ? d : v;
  },
  set: (k, v) => safeSet('cq:pref:' + k, String(v)),
};
