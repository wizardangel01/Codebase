# Developer notes

Things that were learned the hard way while building the site. Read this before you write a lesson that measures time or recursion, or a game level about speed.

## What Pyodide (Python 3.14 in WebAssembly) can and cannot do

| Fact | What to do about it |
|---|---|
| The runtime is 32-bit WebAssembly. Integers take 28 bytes and `sys.getsizeof(list(range(1_000_000)))` is 4,000,028. | Quote sizes only after you have run them with `node tools/py.mjs`. |
| Threads, `subprocess` and sockets do not exist. `zoneinfo` has no time zone database. | Show `threading` and `subprocess` only in code that is not run. `asyncio` works. Use fixed offsets instead of named zones. |
| Turning an integer with more than 4,300 digits into text (`str`, `print`, f-strings) raises `ValueError`. | Print `n.bit_length()` or the number of digits of a smaller number instead. |
| Python stops plain recursion at 1,000 frames with a clean `RecursionError`. The limit is reset before every run. | Use it in lessons as it is. |
| Recursion that passes through a C function, such as `functools.cache`, `lru_cache` or `sorted(key=...)`, uses the **JavaScript** stack and runs out at about 900 levels (800 is safe). That is a fatal engine error, not a `RecursionError`. | Do not teach deep `@cache` recursion. The worker detects the crash, restarts the engine and reports "the recursion went too deep" at once (see ARCHITECTURE.md). |
| `time.perf_counter()` is `performance.now()`, which browsers round to 0.1 ms or coarser. Node is much finer. | Never divide by a measured time without a guard, and repeat a tiny operation until the total is several milliseconds. The browser test caught a `ZeroDivisionError` in a lesson that the validator in Node had passed. |
| Default run time limit is 10 seconds. A game level can set `timeout:` (seconds). | A correct solution should use a tenth of the limit on this machine, because a phone is three to five times slower. |

Speeds measured with Pyodide on a normal computer, useful when you design a level: a loop of 1,000,000 iterations takes 0.1 to 0.15 s; `x in a_set` against `x in a_list` of 100,000 items is about 12,000 times faster; `list.insert(0, x)` 40,000 times takes about half a second; merge sort of 50,000 numbers takes 0.2 s; Dijkstra on 30,000 nodes with 90,000 edges takes 0.05 s; a breadth-first search over a 150 x 150 grid takes 0.03 s; an insertion sort of 4,000 objects that count their comparisons takes about 3 s (avoid).

## Writing lessons

- **Honest minutes.** Put `5` for every lesson in `module.json`, run `node tools/validate.mjs <module>`, read "content suggests about N" for each lesson and write `round(0.8 * N / 5) * 5`. The validator warns when the figure is under half or over 2.2 times the estimate.
- **Teaching order.** The validator knows which Python features are taught in which module (the `TABLE` in `tools/lib/gate.mjs`) and warns when a lesson uses one earlier. If a snippet deliberately previews a later idea, put the word `preview` on its code fence (```` ```python preview ````); otherwise teach the feature first or move the lesson.
- **Style lint.** No "just", "simply", "easy", "easily", "easier", "easiest", "obviously", "trivial" or "of course"; British spelling; no em or en dashes. Check callout titles and table cells too.
- **Tables.** Do not put `|` inside a table cell, not even inside a code span.
- **Verify before you write.** Run every number and output that a lesson quotes (`node tools/py.mjs`). Wrong numbers were found this way more than once, for example `bisect_left([10, 20, 20, 20, 30], 25)` is 4, not 3.

## Layout on phones and tablets

The browser tests at 390 pixels (`node tools/smoke.mjs --mobile`) and 768 pixels (`--tablet`) found what desktop tests cannot see. Run both after you add a new kind of block, and run `node tools/layout.mjs` after you touch the top bar or a grid.

- **A grid or flex child cannot shrink below its content.** This is the usual cause of a page that scrolls sideways. Give grid tracks `minmax(0, 1fr)` and children `min-width: 0`, so that a long line of code scrolls inside its own box (`overflow-x: auto`).
- **A track with a fixed minimum width is a trap when the text is enlarged.** `repeat(auto-fill, minmax(17rem, 1fr))` needs 17 rem, and a learner who turned the browser text up to 150% has 433 px of rem on a 320 px screen. Write `minmax(min(17rem, 100%), 1fr)`.
- **Long words and inline code need `overflow-wrap: anywhere`** where a narrow column has to hold them (course map titles, answer options). Buttons are `max-width: 100%` and may wrap their label on a phone.
- **The top bar depends on the learner.** Its width changes with the rank name (Newcomer to Pythonista), the digits of the XP, the streak and the "Offline" notice. A test with a fresh learner passes while a learner in the middle of the course gets a bar that is 70 px too wide. `fitHeader` in `js/main.js` measures the bar and, if needed, drops the streak, then the wordmark, then the word "Offline" (classes `is-tight`, `is-tighter`, `is-tightest`). Between 761 and 980 px the CSS also hides the rank name and tightens the links. The bottom-bar breakpoint is written in `rem` (`47.5rem`), so it moves with the learner's text size, as the bar's contents do.
- **The overflow check looks at the whole page,** header and footer included. It once looked only at `#main` and reported "the page is 776 px wide" without a culprit.
- **To test enlarged text in Playwright** use a CDP session: `cdp.send('Page.setFontSizes', { fontSizes: { standard: 24, fixed: 20 } })`, set before the page is opened. 16 is the normal size, 20 is 125% and 24 is 150%. This changes `rem` and the `rem` media queries, which a zoom does not.

## The password screen

What it is, in one line: a door for casual visitors, not a vault. Know the limits before you promise anyone more.

- **The check runs in the browser, so everything it guards is public.** `js/auth-config.js` is served to everybody, and so are `content/`, `js/` and the rest. The screen only decides whether the app is built. Anyone who types the address of a lesson file (`content/python/loops/...md`) or reads the repository gets the lesson. If a course must really be private, host it where a server checks the password.
- **The hash is public too.** It is salted PBKDF2-SHA256 with 250,000 rounds, which makes each guess slow, but a short password (one name or word) is still guessable offline by a program that tries many. The note in the README says so, and `tools/set-password.mjs` prints a hint for short passwords. A phrase of three or four words is the cheap fix.
- **The "logged in" note can be forged.** It is a line in `localStorage` (`cq:v1:auth`). Anyone who can write to their own storage can write it. That is acceptable for a door and not for a vault.
- **The password never enters the repository.** Not in docs, tests, comments or commit messages. `tools/login.mjs` takes it from `CQ_TEST_PASSWORD`; every other browser test gets past the screen with `unlockContext()` from `tools/lib/unlock.mjs`, which plants the same note the site writes after a correct password. If you add a test tool that opens the site, call `unlockContext(context)` right after `browser.newContext(...)`, or it will only ever see the login screen.
- **Same arithmetic in two places.** `tools/set-password.mjs` (Node `crypto.pbkdf2Sync`) and `js/auth.js` (Web Crypto) must hash identically: trim, NFC, UTF-8, PBKDF2-HMAC-SHA256, 32 bytes, base64. If you change one, change the other and run `tools/login.mjs` with the real password.
- **Web Crypto needs a secure address.** `crypto.subtle` is missing on plain `http://` addresses other than localhost (for example `http://192.168.1.20:8080` on a phone in the same Wi-Fi). The screen then shows a notice and disables the box. A pure-JavaScript fallback was left out on purpose: it would be 250,000 rounds of SHA-256 on the main thread, and the hosted site is always `https://`.
- **Changing the password logs everybody out** because the note stores the start of the hash. Turning the screen off (`--off`) lets everybody in again.
- **The screen is built before the site.** `boot()` has not run yet, so there is no header, no router and no service-worker registration on the login page. After the first successful visit the service worker caches the files, and logging in works offline because nothing is fetched to check a password.

## The quotes: how they stay out of the way

"Running at an interval without interrupting the work" is the whole point, so each rule below has a test in `tools/quotes.mjs`, which uses Playwright's fake clock (`page.clock`) so that half an hour passes in a second.

- The timer only counts time when the tab is visible (the remaining time is kept while the tab is hidden).
- When the timer fires, `calm()` in `js/ui/quote-card.js` must say yes: no key in the last 12 s, no click in the last 5 s, no scrolling in the last 4 s, no focused text box with activity in the last 30 s, Python not running, no open dialog, no toast, not in a quiz or a game (the address says so: `QUOTE_TIMING.quietPlaces`), and no card already on the screen. Otherwise it tries again after 15 s. If you add a new kind of modal screen, make sure it is a `dialog`, has `role="dialog"` or `aria-modal="true"`, or add it to `calm()`; the test "no quote while a dialog is open" shows how.
- The card is `pointer-events: none` except its close button, so it can never block a tap on what it covers. Do not "fix" that to make the card clickable.
- It is not a live region: a scheduled quote is not read aloud over a screen reader. Only "Show one now" fills the hidden `#quote-live` area.
- Timing numbers live in `QUOTE_TIMING` (`js/config.js`), the learner's choice of interval in `cq:pref:quotes`.
- **Testing with the fake clock:** install it before `page.goto`, wait until the page has started, then `pauseAt` a moment later so that only `runFor(ms)` moves time. CSS transitions run in real time, so wait a few hundred milliseconds before a screenshot, or the card looks half transparent.
- The quote list is data (`js/quotes.js`). `tools/quotes.mjs` checks that there are at least 30, that none is repeated and that none is longer than 130 characters. Prefer proverbs and very old authors for named quotes; many modern "famous quotes" are credited to the wrong person.

## Writing a game level about speed

A slow solution must fail, and the learner must be told why. The judge engine gives you three ways, in order of preference.

1. **Count the work, not the seconds.** Put a hidden class in the level's `%% prelude`. Its names reach the learner's program and the tests, and it raises an error as soon as the budget is spent, so a slow solution fails in milliseconds with your message. The Algorithm Gauntlet (`content/python/algorithms/game.md`) uses three helpers:
   - `Reads(list)` counts every way a program can read the list (`[i]`, a slice, `for`, `in`, `.index`, `.count`, `.copy`, `reversed`). Use it for searching and for hash-table levels.
   - `Weight` wraps a number and counts every comparison made with it. Use it for sorting levels. A budget of about six times `n log2 n` lets merge sort, heap sort and quicksort pass and stops every quadratic sort.
   - `calls_limit(limit, message)` is a context manager built on `sys.setprofile`. It counts Python function calls and raises when the limit is passed, so an exponential recursion stops after 100,000 calls (about 0.05 s). Use it for recursion and dynamic programming levels. A bottom-up loop makes no calls at all.
2. **Use the clock** (`timeout:` in `%% config`) when the cost cannot be counted, as in the stack, queue and heap levels. The runner stops the whole run, so the learner sees only "ran for more than N seconds" and no per-test results. Make the slow method at least ten times over the limit, for example 1,000,000 characters for a method that rewrites the text on every round (it needs minutes).
3. **Make the problem too big for the slow method to fit in memory or recursion**, for example a staircase of 3,000 steps for recursion. Catch `RecursionError` in the test and give a message that says what to do.

Rules that keep such levels fair:

- Put a **visible** test with the big input, because only visible tests show their message. Hidden tests show that they failed, nothing more.
- The budget must allow every reasonable fast solution. Measure the reference and two or three other fast styles (bisect, a heap, quicksort with three lists) before you fix the number.
- Avoid inputs that are accidentally bad for a common correct method. A repeating pattern such as `i % 1000` makes a quicksort with a middle pivot choose the smallest value every time. Scramble data with `(i * 7919) % 10007`.
- Compute expected values with the reference solution in the generator script and **cross-check them with a different algorithm** (a layered search against a queue, repeated relaxing against a heap, a matrix power against a table).
- Run `node tools/try-game.mjs <game.md> --variants <file>` with right, wrong, slow and forbidden solutions (the Gauntlet has 67). Slow ones are stopped at the level's time limit, as in the browser. `TRY_TIMEOUT=3` shortens the limit while you experiment.
- A fatal engine error kills the Node process that runs `try-game`, so test deep `@cache` recursion in the browser (`tools/smoke.mjs` or Playwright), not there.

## Known gaps and ideas

- The password screen is a client-side door (see "The password screen"). A real access control needs a server. A hosted password check (for example a small serverless function that returns the lesson files only after a valid token) would be the next step if that is ever needed.
- Quotes are shown on every page except quizzes and games. If learners find them distracting in lessons too, add `'lesson'` to the places in `QUOTE_TIMING.quietPlaces` (it is a regular expression over the address).

- The `canvas` and `arena` game engines are placeholders (see GAMES.md, "Writing a new engine"). No shipped game uses them.
- Not built yet: more screenshots of the exercise and quiz pages for the README, and a button that shows how much space the saved copy takes (the browser's own site settings show it).
- A second course (for example JavaScript) needs `content/<course>/course.json`, an entry in `content/courses.json` and its own runtime. Only the Python runner exists.
