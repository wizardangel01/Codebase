# Architecture

CodeQuest Academy is a **static site**: HTML, CSS, JavaScript modules, Markdown content and the Pyodide files. There is no server and no build step. GitHub Pages only has to hand out files. This page explains how the parts fit together, so you can change one of them without breaking the others.

## The big picture

```
 index.html ── js/main.js ── js/router.js ── js/views/*.js     pages (home, course, module, lesson, quiz, game ...)
                    │                              │
                    │                              ├── js/ui/*.js        editor, console, exercises, questions, tracer
                    │                              └── js/games/*.js     game stages (rover, judge)
                    │
   js/content.js ───┴── fetches content/**/*.json and *.md, parsed by js/lib/doc.js and js/lib/markdown.js
   js/store.js          progress in localStorage (XP, stars, badges, drafts)
   js/auth.js           the password screen's logic (js/views/login.js is the screen, js/auth-config.js holds the hash)
   js/ui/quote-card.js  motivational quotes now and then (the list is js/quotes.js)
   js/py/runner.js ──── js/py/worker.js ──── js/py/host.js + host.py ──── vendor/pyodide/   (Python 3.14 in WebAssembly)
   sw.js                service worker: offline cache
```

Everything is plain ES modules loaded by the browser. A page is drawn by a **view** function that returns a DOM node, built with the small `h()` helper from `js/lib/util.js`. There is no framework.

## Folders

| Path | What lives there |
|---|---|
| `index.html`, `404.html`, `manifest.webmanifest`, `sw.js` | The shell: the page, the GitHub Pages 404 redirect, the installable-app manifest and the service worker |
| `css/` | `base.css` (tokens, themes, typography), `components.css`, `views.css`, `games*.css`, `fonts.css` |
| `js/` | The application (see below) |
| `content/` | Everything learners read: `courses.json`, one folder per course, one folder per module |
| `games/harness/` | The Python side of the game engines: `common.py`, `rover.py`, `judge.py` |
| `vendor/pyodide/` | Pyodide 314.0.7, the Python 3.14 runtime that the page loads (about 13 MB, downloaded once, then cached) |
| `fonts/`, `icons/` | IBM Plex fonts (bundled, no external requests) and the app icons |
| `tools/` | The checkers: `validate`, `check-game`, `try-game`, `py`, `smoke`, `layout`, `offline`, `playground`, `login`, `quotes`, `serve`, `test-validator`, `make-manifest` (writes the file list for the offline button) and `set-password` (sets, checks or removes the password) |
| `docs/` | These documents |

## Pages and routing

`js/router.js` is a hash router (`#/c/python/loops/loops-basics`), so it works on GitHub Pages without any server rules. Each route maps to a view in `js/views/`. A view returns `{ node, title, cleanup }`. The router mounts the node, sets the page title and calls `cleanup` when the learner leaves, which stops timers and releases the editor. Routes: home, course map, module page, lesson, quiz, game, playground (`#/play`), progress, help and the certificate.

## Content

`js/content.js` fetches `courses.json`, `course.json`, `module.json` and the Markdown files, and caches them. A Markdown file is read in two steps:

1. `js/lib/doc.js` splits the file into front matter, prose and **directive blocks** (the lines that start with `%%`: exercises, questions, callouts, game levels).
2. `js/lib/markdown.js` turns the prose into HTML. It is a small Markdown renderer written for this project: headings, lists, tables, code fences with flags (`run`, `trace`, `error`, `nocheck`, `preview`), callouts and inline code.

`js/lib/specs.js` turns an exercise or a question block into a plain object (`exerciseSpec`, `questionSpec`), which the UI in `js/ui/` renders and the checker in `tools/` runs. Both use the same specs, so what the validator proves is what the learner gets. The file format itself is in [AUTHORING.md](AUTHORING.md).

## Running Python

Python runs in a **module Web Worker**, so a stuck `while True` can be stopped without freezing the page.

- `js/py/runner.js` runs on the main thread. It starts the worker lazily, runs one request at a time, collects output, forwards `input()` prompts to the console, and enforces the time limit by **terminating the worker** and starting a fresh one. Time that the learner spends typing an answer to `input()` does not count.
- `js/py/worker.js` owns the Pyodide instance. It downloads the big files itself (to show real progress), loads Pyodide from `vendor/pyodide/`, and passes each request to the host. Messages in: `run`, `input-reply`. Messages out: `progress`, `ready`, `init-error`, `out`, `input`, `result`, `fatal`.
- `js/py/host.js` and `js/py/host.py` build the execution environment. Every program runs as a real `__main__` module (so `__name__`, `doctest`, `pickle` and `unittest` behave), with output captured, `input()` replaced, a small virtual file system for `open()`, the recursion limit reset, a fixed random seed for tests and games, and nothing left over from the last run. The host has four modes: `run` (a plain program), `trace` (records every step for the step-through visualiser), `test` (runs an exercise's `%% tests` section with the helpers `check`, `expect`, `raises`, `uses`, `calls`, `rerun` and so on) and `game` (hands the result to a game harness).

### When the engine itself breaks

A Python error is caught and shown in plain words by `js/lib/errors.js`. A few things cannot be caught inside Python, because they stop WebAssembly itself: a JavaScript stack overflow (very deep recursion through a C function such as `functools.cache`), or out-of-bounds memory access. The worker listens for these (`unhandledrejection`, `error`, and results that carry `pyodide_fatal_error`) and posts a `fatal` message while a program is running. The runner then restarts the engine and ends the run at once with `kind: 'crash'`, instead of waiting for the time limit. `errors.js` and `js/views/game.js` turn a crash that mentions the call stack into a friendly "the recursion went too deep" message. See [DEV_NOTES.md](DEV_NOTES.md) for the numbers.

## Exercises, questions and quizzes

- **Exercises** (`js/ui/exercise.js`): an editor with the starter code, **Run**, **Check**, three progressive hints and a solution. Check sends the code and the `%% tests` text to the host in `test` mode and shows each test result. Hidden tests show only that they failed.
- **Questions** (`js/ui/question.js`): `choice`, `multi`, `predict`, `fill` and `order`. The prediction and fill questions run the real code to compare. An `order` question can include distractor lines.
- **Quizzes** (`js/views/quiz.js`): twelve mixed questions with a pass mark, a review of wrong answers and XP.

## Games

A game is a Python **harness** plus a browser **stage**, registered in `js/games/engines.js` and `js/games/levels.js`:

- The harness (`games/harness/<engine>.py`) has `setup(level)` and `finish(ctx)`. `finish` receives the learner's namespace and output and returns a result: pass or fail, stars, a message and whatever the stage needs to show.
- The stage (`js/games/*-stage.js`) shows the level before the run and plays back or lists the result after it.

Two engines are built:

| Engine | Harness | Stage | Used by |
|---|---|---|---|
| `rover` | `rover.py` | `scene.js` (animated board) | Modules 1, 3 and 4 (`meet-python`, `decisions`, `loops`) |
| `judge` | `judge.py` | `judge-stage.js` (list of tests) | The other twelve modules |

The names `canvas` and `arena` are reserved. Their stages are placeholders that print "This game board is not ready yet", and no course game uses them. [GAMES.md](GAMES.md) describes the level format, both engines, the star rules and how to write a new engine.

## Progress and storage

`js/store.js` keeps one JSON object in `localStorage` (`cq:v1`) and drafts of the learner's code under `cq:v1:draft:`. Every read and write is wrapped in `try`/`catch`, with an in-memory fallback, so a private window or blocked storage never breaks the site. The store pays each XP reward once, tracks streaks, stars per game level, quiz scores and badges (`js/badges.js`), and unlocks the certificate when every module is finished. Nothing is sent anywhere. XP values, rank names and the site name live in `js/config.js`.

## Offline and installing

`sw.js` is the service worker. The Python runtime and the fonts are served **cache first**, because they are large and never change in place. Everything else is **network first** with the cache as a fallback, so edited lessons show up at once and the site still opens without a connection. The cache name carries `__BUILD__`, which the deploy workflow replaces with the commit hash, so returning learners always get fresh files. `manifest.webmanifest` and the icons make the site installable.

Pages that a learner has opened are kept automatically. The **Save for offline use** button on the Help page (`js/offline.js`) keeps all of them at once: it reads `asset-manifest.json`, a list of every file of the site, and asks the service worker to download them (the `precache` message in `sw.js`; the big Python files that are already saved are skipped). The deploy workflow writes the list with `tools/make-manifest.mjs` from the assembled site, so it is never out of date and is not committed; `tools/serve.mjs` builds it on request while you develop. A new deploy renews the cache (the name changes), so a learner presses the button again to refresh their copy. If the list is missing, the card says so and the rest of the site is unaffected.

## The password screen

`js/main.js` starts the site in two steps (`startup()`): if `js/auth.js` says a password is set (`gateOn()`) and this browser has not been let in (`isUnlocked()`), it shows `js/views/login.js` inside `#app` and waits. Only after the right password does `boot()` build the header, the footer and the router, so no lesson is downloaded before the password and the address (`#/c/python/...`) is untouched meanwhile: the router then opens the page the link was for.

`js/auth-config.js` is written by `tools/set-password.mjs` and holds `{ enabled, iterations, salt, hash }`: PBKDF2-SHA256 over the password with spaces at the ends removed, in NFC form. `checkPassword()` does the same arithmetic with Web Crypto and compares. After a right answer `unlock(remember)` writes a small note under `cq:v1:auth` (`{ f, until }`): in `localStorage` for 30 days, or in `sessionStorage` when "Keep me logged in" is off. `f` is the start of the current hash, so choosing a new password invalidates every note. The key is neither `cq:v1` nor `cq:v1:draft:...`, so "Reset my progress" and the progress backup leave it alone. "Log out" (footer) calls `lock()`, clears the address and reloads. Everything is local, so logging in also works offline. Web Crypto exists only on secure addresses; elsewhere the screen shows a notice and switches itself off rather than refuse every password. The limits of this design are in DEV_NOTES.md ("The password screen").

## Quotes

`js/ui/quote-card.js` shows one quote from `js/quotes.js` in a small card (`#quote-slot`, created once, bottom left; above the bottom bar on phones). A single timer counts down the interval (the learner's choice, `cq:pref:quotes`: off, 3, 5, 10 or 20 minutes). When it fires, `calm()` decides: not while the tab is hidden (the countdown stops and resumes with what was left), a card is already showing, the page is a quiz or a game, a key was pressed in the last 12 s, the screen was clicked in the last 5 s or scrolled in the last 4 s, a text box has the focus and anything happened in the last 30 s, Python is running (`runner.status`), a dialog is open, or a toast is on the screen. If the moment is not calm it asks again 15 s later. The card never takes the focus, lets clicks through (only its close button can be pressed), steps aside when the learner types or a toast arrives, and is not announced to screen readers unless it was asked for ("Show one now" on the Help page). A quote is not repeated until twelve others have been shown, and a reload does not bring a second one at once (`cq:pref:quote-last`, `cq:pref:quote-recent`). All numbers are in `QUOTE_TIMING` (`js/config.js`).

## Look and feel

CSS custom properties (tokens) in `css/base.css` define colours, spacing and type for a light and a dark theme. The theme follows the system setting and can be switched in the header. The layout is mobile first: one column on a phone, wider layouts from tablet width, and every page is checked for horizontal overflow at 390 and 768 pixels by the browser test. Below 760 px (in `rem`, so it moves with the text size) the navigation becomes a bottom bar. The top bar's width depends on the learner, so `js/main.js` measures it (`fitHeader`) and drops the streak, then the wordmark, then the word "Offline" when it does not fit.

## Tools and checks

| Command | What it proves |
|---|---|
| `node tools/validate.mjs` | Every lesson example, exercise solution, exercise starter, quiz question and game level runs in real Python (the same Pyodide) and behaves as written. It also checks the teaching order of Python features, style rules and the length of each lesson. |
| `node tools/check-game.mjs <game.md>` | Each level's model solution earns three stars, each starter fails, and an empty program fails. |
| `node tools/try-game.mjs <game.md> --variants <file>` | Many hand-written programs (right, wrong, too slow, forbidden) get the verdict that the author expects. Slow programs are stopped at the level's time limit, as in the browser. |
| `node tools/py.mjs -c '...'` | Runs Python exactly as the site does. |
| `node tools/smoke.mjs` | Plays the real site in Chromium: opens every page, runs every example, answers every question, solves every exercise and game level, and looks for console errors and horizontal overflow. Also `--mobile` (390 px), `--tablet` (768 px) and `--dark`. |
| `node tools/layout.mjs` | The top bar fits at every width from 320 to 1280 px for six different learners (rank, XP, streak, offline) and at three text sizes, and twelve sample pages do not scroll sideways at 320 px with the text at 150%. |
| `node tools/offline.mjs` | After one visit the lesson page opens and Python runs with the network switched off, and a page that was never visited does not break the app. Then it presses "Save for offline use", switches the network off and opens a lesson, a rover game, a judge game, the playground and a quiz that were never opened. `--subpath` serves the site under `/codequest-academy/` like a GitHub Pages project, and fails on any request that forgets the folder. |
| `node tools/playground.mjs` | Run, and "Step through" on the learner's own code: a normal program, one that asks for input, a long one whose recording is cut short, one that fails and one with a syntax error. |
| `node tools/login.mjs` | The password screen: nothing of the site shows before the password, wrong guesses (and an empty box) are refused with the same words, the right one (with `CQ_TEST_PASSWORD`) lets the visitor in to the page their link was for and is remembered for 30 days (or only for the session), "Log out" forgets it and keeps progress, old or invalid login notes are ignored, what was typed is never sent anywhere, an insecure address gets a notice, and the card fits phones, dark mode and text at 150%. |
| `node tools/quotes.mjs` | With a fake clock: the first quote comes after about 30 s and the next after the chosen interval, it leaves by itself, the close button and Escape work, it stays away while typing, scrolling, in a quiz, with a toast or dialog open, while Python runs and while the tab is hidden, Off and the interval work, "Show one now" is announced, quotes do not repeat, and the card fits phones, reduced motion and print. It also checks the list of quotes. |
| `node tools/test-validator.mjs` | The checkers themselves catch every kind of mistake that they should. |

Two GitHub workflows use them: `validate.yml` runs the validator and its tests on every push, and `pages.yml` assembles the site (only the folders the browser needs) and deploys it.
