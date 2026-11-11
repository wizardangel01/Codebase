// Site-wide settings. Change these to rebrand the site.
export const SITE = {
  name: 'CodeQuest Academy',
  short: 'CodeQuest',
  tagline: 'Learn to code by running real programs in your browser.',
  // Shown in the footer. Put your GitHub repository URL here after you publish it.
  repoUrl: '',
  // Courses are listed in content/courses.json. The first one opens from the home page.
  contentRoot: 'content',
  // Bump this when you change content in a way learners should pick up immediately.
  version: '1.0.0',
};

// XP awarded for each kind of progress. Each reward is paid once.
export const XP = {
  lesson: 10,
  exercise: 15,
  exerciseAfterSolution: 5,
  check: 3, // inline "check yourself" question
  quizPerQuestion: 5, // × correct answers on first pass
  quizPass: 20,
  gameLevel: 20,
  gameStar: 5, // per star above the first
  gameComplete: 50,
  module: 40,
};

// Rank titles by total XP.
export const RANKS = [
  { xp: 0, name: 'Newcomer' },
  { xp: 120, name: 'Scripter' },
  { xp: 350, name: 'Coder' },
  { xp: 700, name: 'Builder' },
  { xp: 1200, name: 'Developer' },
  { xp: 1900, name: 'Engineer' },
  { xp: 2800, name: 'Architect' },
  { xp: 3900, name: 'Pythonista' },
  { xp: 5200, name: 'Guru' },
];

// Motivational quotes (js/ui/quote-card.js). How often they come is the learner's choice on the Help page
// (off, or every 3, 5, 10 or 20 minutes, 5 by default). The rest is here. All times are in milliseconds.
export const QUOTE_TIMING = {
  firstMs: 30000, // the first quote of a visit comes this long after the site opened (later if one was shown a moment ago)
  retryMs: 15000, // when the moment is not calm (see calm() in quote-card.js), ask again after this long
  typingMs: 12000, // never within this long of a key press
  clickMs: 5000, // never within this long of a click or tap
  scrollMs: 4000, // never within this long of scrolling (someone who scrolls is reading)
  workingMs: 30000, // never while a text box has the focus and anything was pressed or touched within this long
  showMs: 9000, // how long a card stays: this much, plus perCharMs for every character of the quote ...
  perCharMs: 80,
  maxShowMs: 20000, // ... but never longer than this
  askedMs: 30000, // a card that was asked for ("Show one now") stays this long, so there is time to read it
  keepRecent: 12, // a quote is not repeated until this many others have been shown
  quietPlaces: /^#\/c\/[^/]+\/[^/]+\/(quiz|game)\/?$/, // no quotes at all in a quiz or a game (the address says where we are)
};
