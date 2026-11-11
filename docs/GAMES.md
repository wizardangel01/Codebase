# Game guide

Every module ends with a game that the learner plays **by writing Python**. A game is one file, `content/python/<module>/game.md`, made of 6 to 10 short **levels**. This guide covers the file format, the engines that exist, how to design levels that teach, and how to add an engine.

Read `content/python/meet-python/game.md` (a rover game) and `content/python/data-and-variables/game.md` (a judge game) first. They are the models to copy.

## 1. How a game is played

The learner reads the briefing, writes Python in the editor, presses **Run**, and the board shows what happened. A level is cleared when the program does what the briefing asks. Fewer lines of code earn more stars (three stars at or under `par` lines). Hints appear one at a time. Viewing the solution is allowed, but caps that level at one star. Progress is saved per level `id`, so never rename a level id once a game is published.

Rules for every game:

- A level teaches **one idea** from its module. The briefing names the idea and shows a tiny example of it.
- Use only what the module's lessons (and earlier modules) have taught. See [`CURRICULUM.md`](CURRICULUM.md).
- Levels get steadily harder. The first level can be cleared in two or three lines. The last is a boss that combines everything.
- No trick levels. If a level needs a rule (for example "use a loop"), say so in the briefing.
- The tests are fair: a correct, honest solution passes them. Hidden tests probe the same idea with different values, never an unrelated trap.

## 2. The file

```
---
title: Launch Control
engine: rover
---
Story and how to play. Markdown. This is the first thing the learner sees (in a panel they can close).

%% level l1 | First steps
Briefing: the mission, the idea, one tiny example. Markdown.
%% config
par: 3
%% map
#######
#.....#
#R..G.#
#.....#
#######
%% starter
# Drive the rover onto the green pad.

%% solution
move()
move()
move()
%% hint
First nudge.
%% hint
More specific.
%% hint
Almost the answer.
%% end
```

- Front matter: `title` (must equal `gameTitle` in `module.json`) and `engine` (`rover`, `judge`, `canvas` or `arena`).
- Level header: `%% level <id> | <Title>`. Use ids `l1`, `l2`, and so on.
- Sections every level has: `%% config` (key: value lines), `%% starter`, `%% solution`, at least **two** `%% hint`. Engines add their own sections (`%% map`, `%% in`, `%% test`, ...).
- `%% solution` is the model answer. It must earn **three stars** (be at or under `par` code lines; blank lines and comment-only lines do not count). The checker enforces this.
- The `%% starter` must not already pass, and an empty program must not pass.

Config keys that every engine understands:

| Key | Meaning |
| --- | --- |
| `par` | lines of code for three stars (two stars up to 1.5 times par, otherwise one) |
| `forbid` | words the program may not use, for example `for while` or `if`. Words are Python constructs (`for while if def class import lambda try with return yield comprehension listcomp setcomp dictcomp genexp ifexp match walrus star fstring list dict set tuple slice global assert raise decorator await and or not`; `if` also covers a conditional expression, and `star` is a starred name such as `*rest`) or the name of a function that may not be called (`sorted`, `len`, ...) |
| `forbid_note` | a friendly sentence shown when the rule is broken |
| `require` | words the program must use (same vocabulary as `forbid`) |
| `comments` | minimum number of `#` comment lines |
| `max_lines` | the most code lines allowed |
| `theme` | board theme: `space` (default) |

### Checking a game

```
node tools/check-game.mjs content/python/<module>/game.md
```

For every level the checker runs your `%% solution` (must pass with three stars), the `%% starter` (must not pass), an empty program (must not pass), and the solution a second time (the result must be the same). It also warns about missing hints, unknown config keys and so on. The module validator (`node tools/validate.mjs python/<module>`) runs it too.

The checker only proves that **your** solution is accepted. To prove that wrong, slow and forbidden programs are **rejected** and that other correct styles are **accepted**, write them in a variants file and run them the way a learner does:

```
node tools/try-game.mjs content/python/<module>/game.md --variants variants.txt
node tools/try-game.mjs content/python/<module>/game.md l3 my_answer.py     (one program, with every test listed)
node tools/try-game.mjs content/python/<module>/game.md l3 -c 'def f(): ...'
```

A variants file is a list of programs. Each starts with a line `#### <level id> <pass|fail> <note>`, and the program follows until the next such line. The tool prints the ones whose verdict is not the expected one (`VERBOSE=1` prints every verdict). A run that takes longer than the level's `timeout` (10 seconds by default) is stopped and counts as a fail, as in the browser; `TRY_TIMEOUT=3` shortens the limit while you experiment.

## 3. Writing good levels

**Briefing.** Open with the story in one sentence. Then say what to do. Then introduce **only the new thing** the level needs, with a tiny example. Keep it to about 60 to 120 words. Use `code` formatting for commands.

**Starter.** One or two comment lines saying what to do, or a few lines of code to complete. Never leave a starter that already half-solves the level.

**Hints.** Three, each a little more helpful: (1) a question or nudge, (2) the idea in words, (3) almost the code. Hints are Markdown and may contain code blocks.

**Par.** Count the lines of your solution and set `par` to that number, unless a smarter solution exists. Do not set a par that only a golfed solution can reach.

**Difficulty curve (8 levels).** 1 and 2 are gentle (the new idea once). 3 to 5 apply it in new settings. 6 and 7 combine it with earlier ideas from the module. 8 is the boss: it needs everything and has hidden tests or several maps.

**Do not leak.** The briefing teaches the idea, not the answer. Hints reveal the answer step by step.

**Test the unhappy paths.** Run your game with a lazy answer (hard-coded output, the wrong operator) and check that it fails.

## 4. The rover engine (`engine: rover`)

The learner drives a rover on a grid with Python commands. Used in modules 1, 3 and 4.

A level has one or more `%% map` sections. **Several maps in one level** make the same program run on each map (tabs show each), which forces a general solution (for example one that uses `if` or loops). Name a map with `%% map Sandy start`.

Map symbols:

| Symbol | Meaning |
| --- | --- |
| `#` | rock (the rover cannot enter) |
| `.` | floor |
| `R` | the rover's start square (exactly one) |
| `G` | the goal pad |
| `x` | lava (the mission fails if the rover enters) |
| `c` | a crystal |
| `k` | a key (picked up automatically when driven over) |
| `D` | a locked door (needs a key; one key opens one door) |

The rover starts facing `east` unless `facing: north|south|west` is set.

Commands (choose which are available with `commands:`; the default is `basic`):

| Group | Commands |
| --- | --- |
| `basic` | `move()`, `turn_left()`, `turn_right()`, `pick_up()`, `say("text")` |
| `sensors` | `front_is_clear()`, `left_is_clear()`, `right_is_clear()`, `on_goal()`, `on_crystal()`, `has_key()`, `crystals_left()`, `facing()`, `position()` |

`commands: basic sensors` gives both groups. You can also list single names (`commands: move turn_left`). Sensors are free; every other command costs one unit of battery.

Rover config keys: `facing`, `commands`, `battery` (default 150, the number of actions allowed), `win` (what must be true: `goal`, `crystals`; default: reach the goal if there is one, and collect every crystal if there are any), `expect_say` (the rover must `say` this text, or a list of texts in order), `exact_say` (`true`: the rover must say exactly the `expect_say` texts and nothing else), `say_on_goal`, plus the common keys.

Design tips:

- A short battery (`battery: 12`) makes long hand-written routes impossible, which rewards loops and conditions.
- Use `forbid: for while` in an early level so the learner first does it the long way, then give a later level a small battery so that loops are needed.
- A crash into a rock stops the mission. Say so in a briefing the first time it can happen.
- Hand-trace the solution yourself, then trust the checker: it plays the level.

## 5. The judge engine (`engine: judge`)

The learner's program is run against **test cases**, like an online coding judge. Each test lights up green or red, hidden tests only show pass or fail. Used for most modules. There are three modes, set with `mode:` in the level's `%% config`.

### io mode (the default)

The program reads with `input()` and answers with `print()`. Write one pair per test:

```
%% in Label for this test
12
30
%% out
42
%% in hidden
250
1000
%% out
1250
```

- Each line of `%% in` is one `input()` call. The text after `%% in` is a label (optional). The word `hidden` hides the values and shows only pass or fail.
- `%% out` is the exact expected output. Trailing spaces and blank lines at the start and end are ignored. `ignore_case: true` and `ignore_space: true` (collapse all whitespace) loosen the comparison.
- **Prompts passed to `input("...")` are not part of the output**, so learners may use prompts or not.
- Give **two visible** tests and **one or two hidden** ones. Make at least one hidden test an edge case (zero, empty text, a single item, a negative number).
- Numbers: compare text, so say exactly how to format them in the briefing (`{x:.2f}`). Pick test values that avoid float rounding ties.

### function mode

The learner defines a function. Each test is an expression and the value it must give:

```
%% config
mode: function
function: average
%% call Three numbers
average([2, 4, 6])
%% returns
4.0
```

`%% call` is any Python expression that uses the function, `%% returns` is an expression for the expected value. `approx: 0.01` lets floats differ a little. The learner's program is run once first (so a missing function is reported kindly), then each call is evaluated.

### script mode (the most flexible)

Each `%% test` is a few lines of Python that exercise the learner's code. The test passes when it finishes without a failed check.

```
%% config
mode: script
function: make_counter
%% test Counts up
c = make_counter()
expect(c(), 1)
expect(c(), 2)
%% test Does not print
check(printed(make_counter) == "", "make_counter should not print anything")
%% test hidden Two counters are independent
a, b = make_counter(), make_counter()
a(); a()
expect(b(), 1)
```

Helpers inside a `%% test`, together with every name the learner's program defined:

| Helper | Meaning |
| --- | --- |
| `check(condition, message)` | fail with `message` unless the condition is true |
| `expect(actual, expected, label="")` | fail unless the two values are equal (honours `approx`) |
| `raises(ExcType, fn, *args)` | `True` when `fn(*args)` raises that exception |
| `printed(fn, *args, **kwargs)` | call `fn` and return everything it printed |
| `run(stdin="")` | run the learner's whole program again and return what it printed |
| `source()` | the learner's source code |
| `uses("for")` | does the program use that construct, or call that function? |

An uncaught exception in a test is reported to the learner with the line of **their** code that raised it. Visible tests show the test code, so the learner can read exactly what is being checked. Hidden tests show only pass or fail.

### Judge extras (all modes)

- `%% prelude`: hidden Python that runs first. Every name it defines is available to the learner's program and to the tests (a list of data, a helper class). The learner cannot see it, so describe what it provides in the briefing.
- `%% file notes.txt`: a text file that exists for every run of this level, for programs that use `open()`.
- `function: name` in `%% config` works in every mode: if the learner has not defined it, they get a friendly message.
- The visible **Run** executes the program once (io mode uses the first visible test's input) so the learner sees output in the console. The result panel then judges every test.

### Designing judge levels

- Pick tasks a beginner can picture: a till, a timetable, a score board, a secret code.
- In io mode, show a concrete example of input and output in the briefing.
- Make the starter a comment or a function skeleton with `pass`.
- Check the **par**: count the lines of your solution.
- Beware of tests that pass for the wrong reason (a program that prints a constant). Use several inputs with different answers.
- Put at least one test with a **visible** label and a clear message on every important idea, because a failing hidden test only says that it failed.
- **Levels about speed** need a way to make a slow solution fail and to tell the learner why. Count the work with a helper class in the `%% prelude` (reads of a list, comparisons, function calls) and raise an error with a clear message when the budget is spent, or fall back on `timeout:` when the work cannot be counted. The recipes, the budgets that worked and the traps are in [DEV_NOTES.md](DEV_NOTES.md), and a finished example is `content/python/algorithms/game.md`.

## 6. The canvas engine (`engine: canvas`) and the arena engine (`engine: arena`)

These two engines are documented in their own files, written by the engines' authors:

- [`GAME-ENGINE-CANVAS.md`](GAME-ENGINE-CANVAS.md): a drawing board for Module 7 (functions).
- [`GAME-ENGINE-ARENA.md`](GAME-ENGINE-ARENA.md): a battle arena for Modules 10 and 11 (classes and inheritance).

## 7. Writing a new engine

An engine has three parts. Nothing else in the site needs to change.

1. **A Python harness**, `games/harness/<engine>.py`. The site joins `games/harness/common.py` and this file into one program, so the harness can use everything in `common.py` (`sec`, `secs`, `cfg`, `words`, `code_lines`, `rule_problems`, `stars_for`, `short`, `friendly_error`, `uses`) without importing it. It defines two functions:

   ```python
   def setup(level):
       """Runs before the learner's code. Returns
       {"names": {...},      # names put in the learner's namespace (commands, helper classes)
        "modules": {...}}    # names importable as modules, for `from rover import *`
       """

   def finish(ctx):
       """Runs after the learner's code. `ctx` is
       {"ns", "ok", "error", "stdout", "stderr", "source", "level", "exit_code"}.
       Returns a dict the stage will display. It must contain:
       passed (bool), stars (0..3), message (str), detail (str), stats ({"lines": int, "par": ...})
       plus whatever the stage needs."""
   ```

   `level` is `{"id", "title", "config", "sections", "starter", "solution"}`; `sections` maps a section name to a list of `{"arg", "text"}`. The harness may call `run_source(source, names=None, files=None, stdin=None)` to run the learner's code again silently in a fresh namespace (used to test one program on several maps or inputs). It returns `{"ns", "stdout", "stderr", "error"}`. Do not let a bad level crash the harness: raise `ValueError` with a clear message for authoring mistakes (the checker reports it).

   Always call `rule_problems(source, level)` and `stars_for(source, level, passed)` so `par`, `forbid`, `require`, `comments` and `max_lines` work in every engine.

2. **A stage**, `js/games/<engine>-stage.js`, exporting `create<Name>Stage()` that returns:

   ```js
   {
     el,                       // the element to put on the page
     preview(level),           // draw the level before anything has run
     async show(result, opts), // display the result object finish() returned (opts.autoplay)
     stop(), destroy(),
   }
   ```

   and `<name>Info(level)` returning `{ commands: [{ sig, text, insert?, line? }] }`, the chips shown above the editor (`line: true` for whole statements, which are inserted on a new line). Build the stage with the `h()` helper from `js/lib/util.js`, respect `prefersReducedMotion()`, use the CSS variables from `css/base.css` for colours so light and dark themes work, make it fit a 360 px wide phone, and put styles in `css/games-<engine>.css`.

3. **Registration**: add the engine to `ENGINES` in `js/games/levels.js`, to `STAGES` and `engineInfo` in `js/games/engines.js`, and list its config keys and section names in `KNOWN` in `tools/lib/games.mjs` so the checker can warn about typos.

Test an engine three ways: `node tools/check-game.mjs` on a real game file, the browser (`node tools/serve.mjs 8091`, then open `#/c/python/<module>/game`), and a mobile-width screenshot.
