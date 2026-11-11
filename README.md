# CodeQuest Academy

A free, static website that teaches programming by letting learners run real code in the browser. The first course, **Python from Zero to Pro**, takes a complete beginner to advanced Python in 15 modules. Every lesson has live examples, exercises that check your code, and questions. Every module ends with a quiz, a cheat sheet and a **game that you play by writing Python**.

- **Real Python in the page.** Python 3.14 runs in the browser through [Pyodide](https://pyodide.org), served from this repository. There is no server, no sign-up and nothing to install.
- **Interactive.** Run buttons, a code editor, a step-by-step visualiser (in the lessons and, with the "Step through" button, for the learner's own code in the playground), auto-checked exercises with hints, quizzes, and games with stars.
- **Responsive.** Built mobile first, with light and dark themes. It works as an installable app and keeps working offline after the first visit. On the Help page, one button ("Save the course for offline use") keeps all 15 MB on the learner's device, which helps where data is expensive or the connection comes and goes.
- **Yours.** Progress, XP, badges and the certificate are stored in the learner's own browser.
- **A password, if you want one.** The site opens with a login screen. One command sets or changes the password, and another turns the screen off. It is a door for visitors, not a vault: read "The password and the quotes" below before you rely on it.
- **Motivational quotes.** A small card with a quote appears every few minutes. It waits for a calm moment (never while the learner is typing, scrolling, running code, taking a quiz or playing a game), never takes the focus, fades away by itself and can be turned off or slowed down on the Help page.
- **Easy to extend.** Lessons are plain Markdown files. A checker runs every example, exercise and game level with the same Python, so a broken lesson cannot be published by accident.

## What is inside

**Python from Zero to Pro** is finished: 15 modules in five lines (Foundations, Flow, Functions, Objects, Pro), with 60 lessons, about 740 runnable examples, 248 exercises, 460 lesson questions, 15 module quizzes, 15 cheat sheets and 15 games with 120 levels. The checker runs every one of them with the same Python that learners get.

| Line | Modules |
|---|---|
| Foundations | Meet Python, Data and variables, Decisions |
| Flow | Loops, Lists, Dictionaries and sets |
| Functions | Functions, Text and files, Errors and debugging |
| Objects | Classes, Inheritance, The standard library |
| Pro | Pythonic code, Decorators and types, Algorithms |

Two game engines are built: `rover` (drive a rover with code) and `judge` (an online-judge style game with visible and hidden tests, a par for the length of your code and, in the last module, budgets that stop slow solutions). The names `canvas` and `arena` are reserved for future engines and are not built; no course game uses them.

## Run it on your computer

```
node tools/serve.mjs 8080          open http://localhost:8080
```

Any static server works too, for example `python3 -m http.server 8080`. Open the page through a server, not as a file, because browsers do not allow modules and workers from `file://`.

On your computer you meet the password screen too: type the password once, and that browser remembers it for 30 days. The password check needs `http://localhost` or `https://`, so use `localhost` (not your computer's network address) when you test on the same machine.

## Publish it on GitHub Pages

1. Create a new public repository on GitHub, for example `codequest-academy`.
2. Push this folder to it:
   ```
   git init -b main
   git add .
   git commit -m "CodeQuest Academy"
   git remote add origin https://github.com/YOUR-NAME/codequest-academy.git
   git push -u origin main
   ```
3. On GitHub open **Settings > Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab. The workflow *Deploy to GitHub Pages* runs on every push to `main`. When it turns green (about a minute), your site is at `https://YOUR-NAME.github.io/codequest-academy/`.
5. Optional: put the repository address in `js/config.js` (`repoUrl`) so the footer links to it.

There is no build step, so the plain option also works: **Settings > Pages > Deploy from a branch > main, folder / (root)**. The workflow adds one extra: it stamps the offline cache with the commit so that returning learners always get fresh files.

## The password and the quotes

**The password screen.** The site asks for a password before it builds the course. A link to a lesson still opens that lesson once the right password has been typed. "Keep me logged in on this device" (on by default) remembers the visitor for 30 days, and "Log out" in the footer forgets it (progress is kept).

```
node tools/set-password.mjs "a new password"       choose the password (writes js/auth-config.js)
node tools/set-password.mjs --off                  turn the password screen off
node tools/set-password.mjs --check "a password"   say whether a password matches the current setting
```

Commit and push `js/auth-config.js` afterwards. Everybody is asked again, because a remembered login belongs to the password it was made with. The file holds only a salted hash (PBKDF2, 250,000 rounds), never the password, and no file in this repository contains the password. Keep it that way: do not write it into the README, an issue or a test (`tools/login.mjs` takes it from the `CQ_TEST_PASSWORD` environment variable).

*What this protects, honestly.* GitHub Pages serves plain files, so the password is checked in the visitor's browser. That keeps out casual visitors and stops a link from being passed around without the password, but it is a door, not a vault:

- The lessons are ordinary files at ordinary addresses. Someone who knows how to open a file by its address, or reads the repository (if it is public), can read them without the password.
- A short password (one word or one name) can be guessed by a program from the published hash. A phrase of three or four words is far harder.
- The check needs a secure address (`https://`, or `http://localhost`), which GitHub Pages is. On another plain `http://` address the screen says so instead of letting anyone in.

If the lessons themselves must stay private, serve them from a host that checks the password on a server. On GitHub, a Pages site that only people with access can open ("private publishing") needs an organization on GitHub Enterprise Cloud (see [GitHub's plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans)).

**The quotes.** The list is `js/quotes.js`: one line per quote, `["the quote", "who said it"]` (leave the name empty for none). Add your favourites and delete the ones you do not like. The first lines are written for this course; the named ones are proverbs and authors from long ago, because many modern "famous quotes" are credited to the wrong person. Learners choose how often a quote comes (off, or every 3, 5, 10 or 20 minutes) in the Motivational quotes card on the Help page, which also has a "Show one now" button. The timing rules (how long a card stays, which moments count as calm) are in `QUOTE_TIMING` in `js/config.js`.

## Add or change content

Everything learners see is a text file in `content/`:

```
content/courses.json                       the list of courses
content/python/course.json                 the five lines and their modules
content/python/<module>/module.json        title, outcomes, lesson list
content/python/<module>/<lesson>.md        a lesson
content/python/<module>/quiz.md           the module quiz
content/python/<module>/cheatsheet.md    the one-page summary
content/python/<module>/game.md          the game
```

Read [`docs/AUTHORING.md`](docs/AUTHORING.md) for the file format, [`docs/CURRICULUM.md`](docs/CURRICULUM.md) for the teaching order, [`docs/GAMES.md`](docs/GAMES.md) for games, [`docs/AUTHOR-BRIEF.md`](docs/AUTHOR-BRIEF.md) for the writing method, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the site works and [`docs/DEV_NOTES.md`](docs/DEV_NOTES.md) for the quirks of Python in the browser. A module whose `module.json` contains `"status": "soon"` shows as "Coming soon"; delete that line to publish it. To add a whole new course, create `content/<course>/course.json`, list it in `content/courses.json`, and add modules the same way.

## Check your work

```
node tools/validate.mjs                        check everything (runs every example, test and game level)
node tools/validate.mjs python/loops           check one module
node tools/check-game.mjs content/python/loops/game.md
node tools/try-game.mjs content/python/algorithms/game.md --variants variants.txt   right, wrong and slow programs against a game
node tools/py.mjs -c 'print(1 / 3)'            run Python exactly as the site does
node tools/smoke.mjs python/loops              play a module in a real browser (also --mobile, --tablet and --dark)
node tools/layout.mjs                          check the top bar and the pages on small screens and with enlarged text
node tools/offline.mjs                         check that the site and Python work after the network is switched off, and that "Save for offline use" keeps the whole course
node tools/offline.mjs --subpath               the same, with the site under /codequest-academy/ the way GitHub Pages serves a project
node tools/playground.mjs                      check the playground and its "Step through" button (also --mobile)
node tools/login.mjs                           check the password screen (with CQ_TEST_PASSWORD="the password" it also tests a correct login)
node tools/quotes.mjs                          check that quotes come on time and never get in the way (uses a fake clock, so it takes a minute, not an hour)
```

First run `cd tools && npm ci` once (it installs the Pyodide package that the checker uses; Node 22 is needed). The browser test also needs Playwright: `npm i -g playwright && npx playwright install chromium`. GitHub runs the validator on every push (`.github/workflows/validate.yml`).

## Credits and licence

Pyodide and the fonts are bundled under their own licences, listed in [`THIRD_PARTY.md`](THIRD_PARTY.md). Add a `LICENSE` file for your own choice of licence for the lessons and the code before you share the repository.
