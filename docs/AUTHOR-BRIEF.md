# Writing a module: method, quality bar and pitfalls

This is the working method for whoever writes a module (a person or an AI assistant). It adds to [`AUTHORING.md`](AUTHORING.md) (file formats and rules), [`CURRICULUM.md`](CURRICULUM.md) (what to teach, in what order) and [`GAMES.md`](GAMES.md) (the game that ends the module). Read those first.

## 1. The job

A module is four lessons, a quiz, a cheat sheet and a game, all under `content/python/<module-id>/`. Learners start the module knowing only what earlier modules taught, and finish it able to do what `module.json` promises ("outcomes"). Everything you write is plain text. There is no build step.

Write only inside your own module folder. Never edit `js/`, `css/`, `tools/`, `docs/` or another module. If you believe the platform or the validator is wrong, work around it in your content and say so in your final report, with the file and what happened.

## 2. Method

1. **Read** the three guides, the exemplar module `content/python/meet-python/` (read `hello-world.md` and `calculator.md` completely; skim the other lessons; read its `quiz.md`, `cheatsheet.md` and `game.md`), and your `module.json`.
2. **Take stock of the allowed toolbox.** List what the learner already knows: every "Covers" line of the earlier modules, plus your own earlier lessons. This list is the only vocabulary your code may use. The validator enforces it ("teaching order" warnings).
3. **Plan before writing.** For each lesson, write down the sections (four to seven), the one new idea of each, the runnable example for it, the inline question, and the three or four exercises (warm-up, standard, challenge). Check that every exercise can be done with what the lesson and earlier lessons taught.
4. **Write one file at a time**, then run `node tools/validate.mjs python/<module-id> --no-games` (or without `--no-games` when you write the game yourself). Until all files exist you will see "file is missing" problems for the files you have not written yet. Ignore those. Fix every other problem and warning for the file you just wrote before moving on. The validator takes a few seconds.
5. **Try code with the real engine**: `node tools/py.mjs -c 'print(1 / 3)'` or `node tools/py.mjs file.py --stdin 'a\nb'`. The computer's own `python3` is a different version and may print different messages. Copy real error messages from the real engine.
6. **Finish with the definition of done** (section 5), then a reading pass (section 4).

Order of writing: lessons 1 to 4, then the quiz, then the cheat sheet, then the game (if it is yours). Write the game last so that it only uses what the lessons really taught.

## 3. Quality bar

**Teach, do not list.** Each section introduces one idea: why it exists, the smallest example, the learner runs it, you explain what happened, they change it and run it again, then a name for the idea. A lesson that reads like a reference page has failed. Imagine an intelligent 12-year-old, or an adult with no technical background, sitting next to you.

**Examples.** Concrete, small, varied: shops, football, buses, cooking, music, space missions, school marks. Names from many backgrounds (Ada, Tunde, Amara, Chidi, Priya, Wei, Sam, Zainab, Emeka). Use `python trace` where watching variables, loops or calls change helps (at least one per module where it fits). Show a mistake on purpose (`python run error`) when it teaches something.

**Prose.** British English. No em dashes or en dashes. Never "just", "simply", "easy", "easily", "obviously", "trivial" or "of course". No emoji. Short paragraphs. Define each new word in **bold** the first time. Say what is not obvious. Be honest about limits ("Python is slow at this", "you will rarely write this by hand").

**Questions.** Two to four inline questions per lesson, mixed types (do not write only `choice`). Distractors are real mistakes. Every question has an `%% explain` that teaches, including why the tempting wrong answer is wrong.

**Exercises.** Three or four per lesson, rising in difficulty. The prompt states exactly what the program must do and print and any rule the tests enforce ("use a loop"). At least two progressive hints. Several small `check(...)` lines in `%% tests` with labels the learner can read. Never test variable names the prompt did not ask for. Test behaviour with more than one input where it matters (`rerun`, or call the function with several arguments). Starters are a comment or a skeleton, never half the answer. The last exercise of a lesson ("Challenge: ...") reaches back to earlier ideas.

**Quiz.** 10 to 12 questions across all four lessons, starting gentle. At most 40 percent single-choice. Include `predict`, `fill` and `order` or `multi`.

**Cheat sheet.** One screen: headings, small tables, tiny code blocks with the result in a comment. It is what a learner prints.

**Game.** Follow `GAMES.md`. Eight levels. One idea per level, rising difficulty, a boss at the end. The solutions earn three stars, the starters fail, hidden tests prevent hard-coded answers, hints are progressive and never give the answer in the briefing.

**Recycling.** The last lesson of a module, the quiz and the game mix in ideas from earlier modules. Say "remember ..." and show it, so the learner sees one toolbox rather than a pile of topics.

**Honesty.** If you are not sure how Python behaves, run it. Do not write a claim you have not checked, especially about versions, speed, memory and error messages. The site runs Python 3.14.

## 4. Reading pass

Read every lesson once from the top, as a beginner who has only read what the course taught so far, and ask:

- Does the opening make me want to read on?
- Is any word or idea used before it was explained? (The validator catches code, not words in prose.)
- Could I do every exercise with only what I have read? Are the hints really progressive?
- Is each example the smallest one that shows the idea?
- Would I still be interested at the end of the quiz?

Fix what fails, then run the validator again.

## 5. Definition of done

```
node tools/validate.mjs python/<module-id> --fail-on-warn
node tools/check-game.mjs content/python/<module-id>/game.md      (when you wrote the game)
```

Both finish with no problems and no warnings. For a module whose game another person writes, use `--no-games` on the first command. Do not weaken a test, shorten an example or delete a question to silence a message. Fix the content.

## 6. Pitfalls that break content

- **Output that changes between runs.** Never show or test: the current time or date, `random` without `random.seed(...)`, `id()`, default object representations such as `<__main__.Dog object at 0x7f...>`, `hash()` of text, timing numbers (`perf_counter`), or the order of a **set of strings** (it changes from run to run: print `sorted(the_set)` instead). A dictionary keeps insertion order, so dictionaries are safe.
- **`input()`**: every runnable block that calls it needs `stdin="..."` (use `\n` between lines). In exercises put the default input in `%% stdin`.
- **Files**: a program starts in an empty folder and files it writes vanish when it ends. A lesson supplies data files with `%% file name ... %% end`. The same file exists for every example and exercise in that lesson.
- **Speed**: a program may run for at most 10 seconds on a phone. Keep examples tiny, and keep game solutions well under one second on this machine so a slow device still passes.
- **No network, no `pip`, no third-party packages**, no `tkinter`, `turtle` or `curses`. Threads, sockets and subprocesses cannot do real work. `asyncio.run(...)` and top-level `await` both work.
- **Standard error**: text sent to `stderr` (for example by `logging` or a traceback) is shown in red on the site, but the validator compares only `stdout`. Do not put it in an `output` block.
- **The `%%` prefix** starts a directive in column 0. A line of prose that begins with `%%` is an error.
- **Lines over 80 characters** are awkward on a phone. Wrap code and keep `check(...)` labels short.
- **Names of buttons**: examples show **Run**, **Stop** and **Reset**. Exercises show **Check my code**, **Run**, **Hint**, **Show solution** and **Start over**. Questions show **Check**. Step-through blocks show **Visualise this code**. Lessons end with **Finish lesson**. Quote them exactly.

## 7. Final report

Reply with fewer than 150 words and no pasted content: the files you wrote, rough counts (words of prose, runnable examples, exercises, inline questions, quiz questions, game levels), anything unfinished, and any platform or validator problem you hit (file, line, what happened).
