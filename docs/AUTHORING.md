# Authoring guide

How to write lessons, exercises, questions, quizzes and cheat sheets for CodeQuest Academy. Read this together with:

- [`CURRICULUM.md`](CURRICULUM.md): what each module teaches, and in what order. **Never use an idea before the module that teaches it.**
- [`GAMES.md`](GAMES.md): how to write the game that ends a module.
- `content/python/meet-python/` (all four lessons, `quiz.md`, `cheatsheet.md`, `game.md`): the finished module to copy the voice and structure from. Start with `hello-world.md` and `calculator.md`.

Everything is plain text. There is no build step. A lesson you save is a lesson on the website.

## 1. What a module contains

```
content/python/<module-id>/
  module.json        title, summary, outcomes, the lesson list, quiz/game/cheat sheet file names
  <lesson-id>.md     four lessons (the ids and titles are fixed by module.json)
  quiz.md            10 to 12 questions that cover the whole module
  cheatsheet.md      a one-page summary to keep
  game.md            the game that ends the module (see GAMES.md)
```

`module.json` already exists for every module, generated from `CURRICULUM.md`. Keep the lesson `id` values and file names. You may improve titles, summaries and `minutes` so they match what you actually wrote.

**Publishing.** While a module is unfinished its `module.json` contains `"status": "soon"`. The website then shows the module on the map as "Coming soon", and the whole-course validator and smoke test skip it. Name the module to check it while you work (`node tools/validate.mjs python/<module-id>`). When the module passes the definition of done below, **delete the `status` line**: the module is then live.

## 2. The definition of done

From the project root:

```
node tools/validate.mjs python/<module-id> --fail-on-warn
node tools/check-game.mjs content/python/<module-id>/game.md      (when the module has a game you wrote)
```

(For a game, also try wrong and slow programs with `node tools/try-game.mjs`: see GAMES.md, "Checking a game".) Both commands must finish with **no problems and no warnings**. The validator really runs Python (the same Python 3.14 that the website uses). It executes every runnable example, every exercise starter and solution, every quiz question, and plays every game level. If it says an example is wrong, the example is wrong.

Do not weaken a test or delete an example to make a message go away. Fix the content.

Until every file of a module exists, the validator reports "file is missing" problems for the files you have not written yet. Ignore those while you work. Use `--no-games` when somebody else writes the module's game.

### The validator's rules, in one list

- **Everything runs.** Examples, exercise starters and solutions, question answers, game levels.
- **Teaching order (the concept gate).** Python's own parser lists every construct, built-in, method, decorator and import that your code uses, and the validator warns when one is used before the lesson that teaches it (the table is in `tools/lib/gate.mjs`). It checks code examples, exercise starters and solutions, code in questions, quizzes, cheat sheets and game levels. The fix is to rewrite the code with ideas the learner already has. If the curriculum map itself calls for a short **preview** of a later idea, write ```` ```python preview ```` on that fence and keep the preview to one short paragraph. Do not use `preview` to get around the rule.
- **Style.** Warnings for the words `just`, `simply`, `easy`, `easily`, `obviously`, `trivial` and `of course`, for American spellings (colour, behaviour, organise, centre, initialise, recognise, analyse, visualise) and for em or en dashes. Code and inline `code` are not checked, so `color` in a function name is fine.
- **Size.** A lesson needs about 750 words of prose or more (aim for 1,000 to 1,800), at least five runnable examples, at least three exercises and two inline questions. A quiz needs 8 or more questions, at least three question types, and at most 60 percent single-choice. `minutes` in `module.json` must be believable for the content.

### Handy tools

```
node tools/py.mjs -c 'print(10 / 3)'                 run Python with the exact engine the site uses (3.14)
node tools/py.mjs prog.py --stdin 'Ada\n36'           give input() its lines
node tools/validate.mjs python/<module> --structure   fast check that runs no Python
node tools/smoke.mjs python/<module>                  play the module in a real browser (needs Playwright)
```

The computer's own `python3` is an older version. Always use `tools/py.mjs` to check what a program prints or which error message appears, because messages change between versions.

A module is only done when a learner who has read the lessons in order could do every exercise and every game level **without ever meeting an idea that was not taught yet**.

## 3. File format

### 3.1 Lesson files

```
---
title: Variables
---
Opening paragraph…

## First idea

Text, then a runnable example.

```python run
x = 5
print(x)
```

%% question q-example | choice
…
%% end

## Your turn

%% exercise ex-id | Title
…
%% end

## What you learned

- …
```

The front matter holds only `title` (it must equal the lesson title in `module.json`). Do not write a `#` heading. The page title comes from the front matter. Use `##` for sections and `###` for sub-sections.

A line that starts with `%%` in column 0 is a directive. Python code never starts a line with `%%`, so code is never confused with a directive.

### 3.2 Markdown you may use

Paragraphs, `**bold**`, `*italic*` (underscores do **not** make italics, on purpose, because of `snake_case`), `` `code` ``, links `[text](https://…)`, bullet and numbered lists (nest by indenting), tables, `> quotes`, `---` rules and fenced code. Raw HTML is not supported.

Do not use images. Draw small diagrams as text in a ```` ```text ```` block.

Links to other pages of the course use the hash route: `[the loops module](#/c/python/loops)`, `[for loops](#/c/python/loops/for-loops)`. The validator checks that every link leads somewhere that exists.

### 3.3 Code blocks

````
```python run            a live example: the learner gets Run, Reset and the output panel
```python run error      a live example that is SUPPOSED to fail (the validator checks that it fails)
```python run stdin="Ada\n36"   a live example that calls input(); the text prefills the input box
```python trace title="Watch the loop"   a step-through visualiser (variables, current line, output)
```python                static, highlighted, not runnable (snippets, "do not do this" code)
```output                shows what a program prints (see below)
```text                  plain text: diagrams, file contents
````

Rules the validator enforces:

- Every `python run` block must run to the end without an error, unless it is marked `error`.
- Every `python run` block that calls `input()` **needs** `stdin="…"` (use `\n` between lines). The validator has no keyboard.
- A static `python` block that is **immediately followed by** an `output` block is run, and its real output must match the `output` block exactly. Use this to show results of code that is not runnable. Add `nocheck` to the python fence to skip the check (rare).
- Programs that use `random` must call `random.seed(...)` when the output is shown in an `output` block, so the output is stable.
- A program has 10 seconds on this site. Keep examples tiny.
- `python trace` needs a short program (at most about 60 steps) that is worth stepping through, ideally with variables that change.

Where a lesson needs a data file, put it in the lesson with a file block, and the file exists for every run block, exercise and trace in that lesson:

````
%% file notes.txt
first line
second line
%% end
````

### 3.4 Callouts

```
%% tip Short title
One or two sentences.
%% end
```

Kinds: `tip` (a helpful trick), `warn` (a common trap), `note` (extra detail), `key` (the one idea to remember). Use at most one per section, and no more than four per lesson. A callout with a title and a short body is better than a long one.

### 3.5 Inline questions

An inline question sits in the lesson, checks one idea, and shows an explanation after the learner answers. Put one after every one or two sections. Five types:

````
%% question q-print-quote | choice            exactly one "choice correct"
Which line displays the word `Python`?
%% choice
`print(Python)`
%% choice correct
`print("Python")`
%% choice
`Print("Python")`
%% explain
Why the answer is right, and why the tempting wrong answers are wrong.
%% end

%% question q-select | multi                  two or more "choice correct", at least one wrong
Select every line that runs without an error.
%% choice correct
`print("Hi")`
…
%% explain
…
%% end

%% question q-predict | predict               the FIRST python fence in the prompt is run for real
What does this program print?

```python
print("one")
print("two")
```
%% answer
one
two
%% explain
…
%% end

%% question q-fill | fill                     ___ blanks in the first python fence
Fill in the blank so the program prints `8`.

```python
print(2 ___ 3)
```
%% answer
**
%% expected
8
%% explain
…
%% end
````

For `fill`, the `%% answer` section has **one line per blank** in order. Write alternatives on one line with `|` (for example `"Hi"|'Hi'`). The `%% expected` section is the output of the completed program, and the validator checks it by filling the first answer in each blank.

````
%% question q-order | order                   Parsons problem: put lines in order
Put the lines in order so the program prints Ready, Set, Go!. One line does not belong.
%% lines
print("Ready")
print("Set")
print("Go!")
%% distractors
Print("Stop")
%% expected
Ready
Set
Go!
%% explain
…
%% end
````

For `order`, `%% lines` holds the lines in the **correct** order (the site shuffles them), `%% distractors` holds wrong extra lines (optional), and `%% expected` is the output of the correct order. Indented lines keep their indentation.

Question ids (`q-…`) must be unique inside the file, lower-case words joined by dashes. Every question needs an `%% explain` section.

Write distractors that reflect **real mistakes** learners make (a missing quote, an off-by-one, the wrong operator), not silly options. Never write "all of the above" or "none of the above".

### 3.6 Exercises

````
%% exercise pizza-party | Share the pizza
The task, in plain words. Say exactly what the program must print or return.

```output
3
2
```
%% starter
# Seventeen slices, five friends.

%% solution
print(17 // 5)
print(17 % 5)
%% tests
expect_output("3\n2")
check(uses("FloorDiv"), "uses // for the whole slices")
check(uses("Mod"), "uses % for the leftovers")
%% hint
First nudge, without the answer.
%% hint
A more specific hint.
%% hint
Almost the answer.
%% end
````

Required: an id (unique in the file), a title, a clear prompt, `%% starter`, `%% solution`, `%% tests`, and **two or three progressive hints**. The validator runs the solution against the tests (must pass), runs the starter (must fail), and runs an empty program (must fail).

Optional sections: `%% stdin` (lines given to `input()`), `%% file name` (a data file for this exercise), and `%% config` with `seed: 7` (fixes `random`) or `timeout: 5`.

**Prompts.** State the task first, show the expected output in an `output` block, and say anything the tests insist on ("use a loop", "do not type the answer"). If the tests check the structure of the code, the prompt must say so. A learner should never be failed by a rule they could not know.

**Level.** Each lesson ends with three or four exercises of rising difficulty: a one-line warm-up, one or two standard exercises that use the lesson's new idea, and a challenge that combines it with earlier ideas. Name the challenge "Challenge: …".

**Tests** are Python statements. Each `check(...)`, `expect(...)`, `expect_output(...)` and each `assert` becomes one line of feedback. Give them clear labels, because the learner reads them. Use **several small checks** rather than one big one, so the feedback says what is wrong.

The helpers (all available in `%% tests`, together with every name the learner's program defined):

| Helper | What it does |
| --- | --- |
| `expect_output(text)` | the program printed exactly this (surrounding blank space and trailing spaces ignored; `ignore_case=True` optional) |
| `expect_in_output(text)` | the output contains this text (case-insensitive by default) |
| `expect(actual, expected, label)` | the two values are equal (`approx=0.01` for floats) |
| `check(condition, label)` | a plain true or false check with a label |
| `raises(ExcType, fn, *args)` | `True` when calling `fn(*args)` raises that exception |
| `output()` / `stdout_lines()` | everything printed, or the non-empty lines printed |
| `source()` | the learner's source code as text |
| `uses("For", "While", ...)` | the program contains any of these syntax nodes: use the **Python `ast` class names**, for example `For`, `While`, `If`, `FunctionDef`, `ClassDef`, `Lambda`, `ListComp`, `Add`, `Mult`, `FloorDiv`, `Mod`, `Pow`, `keyword` (for named arguments such as `sep=`) |
| `calls("print")` | the program calls a function or method with this name |
| `defines("area")` | the program defines a function or class with this name |
| `count_lines()` | number of lines of code (blank lines and comments do not count) |
| `rerun(stdin)` | run the program again with other input lines and return what it printed |
| `ns` | the dictionary of names the program defined, for example `ns["total"]` |

If the learner's program defines a function `area`, a test can simply call `area(3, 4)`. If the test needs to call a function that raises an error, use `raises`.

To test a program that reads input with several different inputs, give the default input in `%% stdin`, and then use `rerun`:

```
%% stdin
Ada
%% tests
expect_output("Hello, Ada!")
check(rerun("Grace").strip() == "Hello, Grace!", "works for another name")
```

Do **not** test the learner's own variable names unless the prompt asks for those exact names. Test results and behaviour.

### 3.7 Quiz files

```
---
title: Loops: module quiz
pass: 70
---
One or two sentences of introduction.

%% question q1 | choice
…
%% end
```

A quiz has **10 to 12** questions across **all four lessons**, starting easy. Mix the types: no more than 40 percent single-choice, and use at least `predict`, `fill` and either `multi` or `order`. The validator runs every `predict`, `fill` and `order` question.

### 3.8 Cheat sheets

One screen of reference, with `##` sections, short tables and tiny code blocks. No exercises or questions. It is what a learner prints and pins up. Use static `python` blocks with comments for results, or `python` followed by `output`.

## 4. Style

**Voice.** Friendly, direct and calm. Talk to the learner as "you". Short paragraphs of two to four sentences. Plain words. Introduce a new term in **bold** the first time, with a one-line definition, then use it consistently. Explain *why* before *how*, and give a real reason to care.

**Spelling.** British English: colour, behaviour, organise, initialise, recognise, centre, maths, tidy. Python names stay as they are (`color` in a library call stays `color`).

**Never** use em dashes or en dashes. Use a comma, a colon, a full stop or brackets. Do not write "simply", "just", "obviously", "easy", "trivial" or "of course", which make a struggling learner feel stupid. No emoji. Avoid exclamation marks except in an actual program's output.

**Examples.** Concrete and small. Use a mix of names (Ada, Tunde, Amara, Chidi, Priya, Wei, Sam, Zainab, Emeka) and everyday settings (shops, schools, football, cooking, buses, music, space missions). Money may be in naira, pounds or dollars. Avoid examples about alcohol, gambling, weapons, politics or religion.

**Pace.** One new idea at a time. Show it working, let the learner run it, change it, then name it. Reuse an earlier idea in each lesson so learners keep practising old ideas. Show errors on purpose (`python run error`) when it teaches something.

**Errors and honesty.** Tell the truth, including about limits ("Python is slow at this", "this trick is rare in real code"). If a concept has a common wrong intuition, name it and fix it.

**Size of a lesson.** About 1,000 to 1,800 words of prose, 6 to 12 runnable examples, 2 to 4 inline questions, 3 to 4 exercises, and 14 to 22 minutes (put the real estimate in `module.json`). A lesson shorter than 700 words of prose is not teaching enough.

**Structure of a lesson.**

1. An opening of two or three short paragraphs: what the lesson is about and why it matters. No heading.
2. Four to seven `##` sections, each with a runnable example, an explanation and something to try. An inline question after every one or two sections.
3. `## Your turn` with the exercises.
4. `## What you learned`: four to seven bullets that restate the lesson in the learner's own terms.

**Using earlier lessons.** The last lessons of a module should mix in ideas from the module's earlier lessons and from earlier modules. Say "remember" and show it, so the learner sees the ideas as one toolbox.

**Accessibility.** Do not rely on colour. Do not write "see the picture". Keep code lines under 80 characters so they fit on a phone.

## 5. The Python that runs on this site

The same Python (3.14, via Pyodide) runs in the browser and in the validator.

- No network, no `pip`, no third-party packages (no NumPy). Most of the standard library works. `tkinter`, `turtle`, `curses` and `readline` do not exist. Threads, subprocesses and sockets cannot do real work.
- Each run starts in a fresh, empty temporary folder. Files a program writes disappear when it ends. Lessons supply files with `%% file`.
- `input()` is interactive in the browser (the program pauses and asks). The validator uses the `stdin` you provide.
- A program that runs longer than 10 seconds is stopped.
- Output is limited in size, so do not print thousands of lines.
- Top-level `await` and `asyncio.run(...)` both work.
- Error messages are the real Python 3.14 messages. When a lesson quotes one, copy it from the real thing (run it in a `python run error` block and copy the text from the validator or the console).

## 6. Checking your work by eye

The validator proves the code is right. It cannot tell whether the writing is good. Before you finish, read each lesson once as a beginner and ask:

- Does the opening make me want to read on?
- Is any word or idea used before it was explained?
- Could I do every exercise with only what I have read? Are the hints really progressive?
- Is each example the smallest one that shows the idea?
- Would I still be interested at the end of the quiz?

Fix what fails. Then run the validator one last time.
