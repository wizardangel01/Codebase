// Self-test for the content validator. A validator that can never fail proves nothing, so
// this script builds a small course in a temporary folder, once with correct content and once
// with deliberately broken content, and checks that the validator accepts the first and reports
// every mistake in the second.
//
//   node tools/test-validator.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startHost } from './lib/pyhost-node.mjs';
import { validateContent } from './lib/content.mjs';
import { checkGame } from './lib/games.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cq-validator-'));
const write = (rel, text) => {
  const f = path.join(tmp, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, typeof text === 'string' ? text : JSON.stringify(text, null, 2));
};

const moduleJson = (title, lessons, extra = {}) => ({
  title,
  summary: 'A module that exists only to test the content validator.',
  line: 'l',
  level: 'beginner',
  outcomes: ['Do the first thing well', 'Do the second thing well', 'Do the third thing well'],
  lessons: lessons.map((id) => ({ id, title: `Lesson ${id}`, summary: `A short lesson called ${id}.`, minutes: 10 })),
  quiz: 'quiz.md',
  game: 'game.md',
  gameTitle: 'Test game',
  gameSummary: 'A tiny game for the test.',
  cheatsheet: 'cheatsheet.md',
  ...extra,
});

write('content/courses.json', { courses: ['demo'] });
write('content/demo/course.json', { title: 'Demo', subtitle: 'Demo course', lines: [{ id: 'l', title: 'Line', summary: 'The only line.', modules: ['good', 'bad', 'leaky'] }] });

// ---------------------------------------------------------------------------------------
// A correct module: nothing here may produce a problem.
// ---------------------------------------------------------------------------------------
write('content/demo/good/module.json', moduleJson('Good', ['one']));
write(
  'content/demo/good/one.md',
  `---
title: Lesson one
---
## Running code

\`\`\`python run
print("hello")
\`\`\`

\`\`\`python
print(1 + 2)
\`\`\`

\`\`\`output
3
\`\`\`

\`\`\`python run error
print(1 / 0)
\`\`\`

See [the quiz](#/c/demo/good/quiz) or [this lesson](#/c/demo/good/one).

%% question q1 | choice
Pick one.
%% choice
no
%% choice correct
yes
%% choice
maybe
%% explain
Because.
%% end

%% question q2 | predict
What prints?

\`\`\`python
print("a")
print("b")
\`\`\`
%% answer
a
b
%% explain
In order.
%% end

%% question q3 | fill
Fill in.

\`\`\`python
print(___ + 1)
\`\`\`
%% answer
41
%% expected
42
%% explain
41 plus 1.
%% end

%% question q4 | order
Order.
%% lines
print("x")
print("y")
print("z")
%% distractors
Print("w")
%% expected
x
y
z
%% explain
Top to bottom.
%% end

%% exercise ex-one | Say hi
Print hi.
%% starter
# your code
%% solution
print("hi")
%% tests
expect_output("hi")
check(calls("print"), "uses print()")
%% hint
Use print.
%% hint
Use quotation marks.
%% end

## What you learned

- It works.
`
);
write('content/demo/good/quiz.md', `---\npass: 70\n---\n${[1, 2, 3, 4, 5]
  .map((n) => `%% question z${n} | choice\nQuestion ${n}?\n%% choice correct\nyes\n%% choice\nno\n%% choice\nmaybe\n%% explain\nBecause.\n%% end\n`)
  .join('\n')}`);
write('content/demo/good/cheatsheet.md', '## Cheat\n\n```python\nprint("hi")\n```\n\n' + 'Short reminder text. '.repeat(20));
write(
  'content/demo/good/game.md',
  `---
title: Test game
engine: rover
---
Intro text.

%% level a1 | Walk
Walk to the pad.
%% config
par: 2
%% map
#####
#R.G#
#####
%% starter
# go
%% solution
move()
move()
%% hint
Two moves.
%% hint
move() twice.
%% end
`
);

// ---------------------------------------------------------------------------------------
// A broken module: every numbered mistake must be reported.
// ---------------------------------------------------------------------------------------
write('content/demo/bad/module.json', moduleJson('Bad', ['broken', 'missing-file', 'unclosed']));
write(
  'content/demo/bad/broken.md',
  `---
title: Broken
---
## Mistakes

\`\`\`python run
print(undefined_name)
\`\`\`

\`\`\`python run error
print("this does not fail")
\`\`\`

\`\`\`python
print(1 + 2)
\`\`\`

\`\`\`output
4
\`\`\`

TODO write this properly. See [nowhere](#/c/demo/bad/not-a-lesson).

%% question dup | choice
First.
%% choice correct
a
%% choice
b
%% choice
c
%% explain
x
%% end

%% question dup | choice
Second with the same id.
%% choice correct
a
%% choice correct
b
%% choice
c
%% explain
x
%% end

%% question q-weird | riddle
Unknown type.
%% end

%% question q-predict | predict
What prints?

\`\`\`python
print("a")
\`\`\`
%% answer
b
%% explain
x
%% end

%% question q-fill | fill
Two blanks.

\`\`\`python
print(___ + ___ + ___)
\`\`\`
%% answer
1
2
%% explain
x
%% end

%% question q-order | order
Wrong expected.
%% lines
print("x")
print("y")
print("z")
%% expected
z
y
x
%% explain
x
%% end

%% exercise bad-solution | Wrong solution
Print hi.
%% starter
# nothing
%% solution
print("bye")
%% tests
expect_output("hi")
%% hint
a
%% hint
b
%% end

%% exercise lazy-starter | Already solved
Print hi.
%% starter
print("hi")
%% solution
print("hi")
%% tests
expect_output("hi")
%% hint
a
%% hint
b
%% end

%% exercise no-hints | No hints
Print hi.
%% starter
# nothing
%% solution
print("hi")
%% tests
expect_output("hi")
%% end
`
);
write('content/demo/bad/unclosed.md', `---\ntitle: Unclosed\n---\n%% exercise never-ends | Never ends\nPrint hi.\n%% solution\nprint("hi")\n`);
write('content/demo/bad/quiz.md', `---\npass: 70\n---\n%% question only-one | choice\nToo few questions.\n%% choice correct\na\n%% choice\nb\n%% choice\nc\n%% explain\nx\n%% end\n`);
write('content/demo/bad/cheatsheet.md', '## Cheat\n');
write(
  'content/demo/bad/game.md',
  `---
title: Test game
engine: rover
---
Intro.

%% level b1 | Too short
Walk to the pad, which is two squares away.
%% config
par: 1
%% map
#####
#R.G#
#####
%% starter
# go
%% solution
move()
%% hint
a
%% hint
b
%% end
`
);


// ---------------------------------------------------------------------------------------
// A module that is the third in the course but uses ideas taught later, and breaks style rules.
// ---------------------------------------------------------------------------------------
write('content/demo/leaky/module.json', moduleJson('Leaky', ['peek']));
write(
  'content/demo/leaky/peek.md',
  `---
title: Lesson peek
---
This is simply the easiest example, of course. The color of the box is blue — or green.

\`\`\`python run
for i in range(3):
    print(i)
\`\`\`

\`\`\`python run
names = ["Ada", "Tunde"]
print(names)
\`\`\`

\`\`\`python run
ages = {"Ada": 36}
print(ages)
\`\`\`

\`\`\`python run
def hello():
    print("hi")
hello()
\`\`\`

\`\`\`python run
name = "Ada"
print(f"Hello, {name}")
print(name[0])
\`\`\`

A preview of something later is allowed when the fence says so.

\`\`\`python preview
try:
    print(1 / 0)
except ZeroDivisionError:
    print("no")
\`\`\`

%% question q-math | predict
What does this print?

\`\`\`python
import math
print(math.floor(2.5))
\`\`\`
%% answer
2
%% explain
It rounds down.
%% end

%% exercise leaky-ex | Squares
Print the squares.
%% starter
# squares
%% solution
print([n * n for n in range(1, 4)])
%% tests
expect_output("[1, 4, 9]")
check(calls("print"), "uses print()")
%% hint
a
%% hint
b
%% end
`
);
write('content/demo/leaky/quiz.md', `---\npass: 70\n---\n${[1, 2, 3, 4, 5].map((n) => `%% question z${n} | choice\nQuestion ${n}?\n%% choice correct\nyes\n%% choice\nno\n%% choice\nmaybe\n%% explain\nBecause.\n%% end\n`).join('\n')}`);
write('content/demo/leaky/cheatsheet.md', '## Cheat\n\n```python\nprint("hi")\n```\n\n' + 'Short reminder text. '.repeat(20));
write('content/demo/leaky/game.md', `---\ntitle: Test game\nengine: rover\n---\nIntro.\n\n%% level a1 | Walk\nWalk to the pad.\n%% config\npar: 2\n%% map\n#####\n#R.G#\n#####\n%% starter\n# go\n%% solution\nfor _ in range(2):\n    move()\n%% hint\na\n%% hint\nb\n%% end\n`);

// ---------------------------------------------------------------------------------------
const { execute } = await startHost({ log: () => {} });
let failures = 0;
const expect = (ok, label, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${!ok && detail ? '\n' + detail : ''}`);
  if (!ok) failures++;
};

console.log('Good module (must pass cleanly):');
const good = await validateContent(execute, { contentDir: path.join(tmp, 'content'), filters: ['content/demo/good'], playground: false });
expect(good.problems.length === 0, 'no problems reported for correct content', good.problems.map((p) => `   ${p.where}: ${p.message}`).join('\n'));
expect((good.stats.exercises || 0) === 1 && (good.stats.questions || 0) >= 9 && (good.stats.games || 0) === 1, 'it really checked the exercise, the questions and the game', JSON.stringify(good.stats));

console.log('\nBroken module (every mistake must be found):');
const bad = await validateContent(execute, { contentDir: path.join(tmp, 'content'), filters: ['content/demo/bad'], playground: false });
const all = bad.problems.map((p) => `${p.where}: ${p.message}`);
const has = (re) => all.some((m) => re.test(m));
const cases = [
  [/raises NameError/, 'a runnable example that crashes'],
  [/marked "error".*ran without an error/, 'an "error" example that does not fail'],
  [/output block does not match/, 'an output block that disagrees with the code'],
  [/link #\/c\/demo\/bad\/not-a-lesson does not lead/, 'a link to a lesson that does not exist'],
  [/leftover TODO/, 'a leftover TODO'],
  [/duplicate question id "dup"/, 'two questions with one id'],
  [/exactly one "%% choice correct"/, 'a single-choice question with two right answers'],
  [/unknown question type "riddle"/, 'an unknown question type'],
  [/code prints[\s\S]*but the answer says/, 'a predict question whose answer is wrong'],
  [/3 blank\(s\) but 2 answer line/, 'a fill question with the wrong number of answers'],
  [/"%% expected" says/, 'an order question whose expected output is wrong'],
  [/does not pass its own tests/, 'an exercise whose solution fails its tests'],
  [/starter code already passes/, 'an exercise that is solved before the learner starts'],
  [/has no hints/, 'an exercise with no hints'],
  [/never closed/, 'a block that is never closed'],
  [/lesson file .*missing-file\.md is missing/, 'a lesson listed in module.json but not written'],
  [/needs at least five questions/, 'a quiz that is too short'],
  [/solution does not pass/, 'a game level that cannot be won'],
];
for (const [re, label] of cases) expect(has(re), `finds ${label}`, `   problems were:\n   ${all.join('\n   ')}`);


console.log('\nTeaching order and style (module 3 of the demo course uses later ideas):');
const leaky = await validateContent(execute, { contentDir: path.join(tmp, 'content'), filters: ['content/demo/leaky'], playground: false });
const warned = leaky.warnings.map((w) => `${w.where}: ${w.message}`);
const hasWarn = (re) => warned.some((m) => re.test(m));
const leakCases = [
  [/teaching order: uses a for loop/, 'a for loop used before loops are taught'],
  [/teaching order: uses a list /, 'a list used before lists are taught'],
  [/teaching order: uses a dictionary/, 'a dictionary used before dictionaries are taught'],
  [/teaching order: uses a function definition/, 'a function used before functions are taught'],
  [/teaching order: uses a comprehension/, 'a comprehension inside an exercise solution'],
  [/teaching order: uses the math module/, 'an import inside a question'],
  [/teaching order: uses range\(\)/, 'range() used before it is taught'],
  [/level a1, solution/, 'a loop inside a game solution'],
  [/words that can make a struggling learner feel stupid/, 'the words "simply", "easiest" and "of course"'],
  [/American spelling/, 'an American spelling'],
  [/em or en dashes/, 'an em dash'],
];
for (const [re, label] of leakCases) expect(hasWarn(re), `finds ${label}`, `   warnings were:\n   ${warned.join('\n   ')}`);
expect(!hasWarn(/uses try/), 'a fence marked "python preview" is left alone');
expect(!hasWarn(/f-string|indexing/), 'an f-string and an index are allowed in module 3 (taught in module 2)');
const goodStyle = good.warnings.filter((w) => /teaching order|American spelling|em or en dashes|feel stupid/.test(w.message));
expect(goodStyle.length === 0, 'correct content raises no teaching-order or style warning', goodStyle.map((w) => `   ${w.where}: ${w.message}`).join('\n'));

console.log('\nPython host (the program runs inside a real __main__ module):');
const hostCode = `
import doctest, pickle, unittest
from dataclasses import dataclass
from typing import get_type_hints

class T(unittest.TestCase):
    def test_pass(self):
        self.assertEqual(1 + 1, 2)
    def test_fail(self):
        self.assertEqual(1 + 1, 3)

def twice(x):
    '''
    >>> twice(2)
    4
    '''
    return x * 2

@dataclass
class P:
    x: "int"
    y: int = 0

class Dog:
    def __init__(self, n):
        self.n = n

print(doctest.testmod().attempted)
print(get_type_hints(P)["x"].__name__)
print(pickle.loads(pickle.dumps(Dog(3))).n)
unittest.main(exit=False)
print(__name__)
`;
const hostRes = await execute({ mode: 'run', code: hostCode, stdin: [], files: {} });
expect(!hostRes.error && hostRes.stdout.trim().split('\n').join(',') === '1,int,3,__main__', 'doctest, typing, pickle and __name__ all work for classes the program defines', JSON.stringify({ out: hostRes.stdout, err: hostRes.error }));
expect(/Ran 2 tests/.test(hostRes.stderr) && /FAILED \(failures=1\)/.test(hostRes.stderr), 'unittest.main(exit=False) finds and runs the tests the program defines', hostRes.stderr);
const hostAgain = await execute({ mode: 'run', code: 'import sys\nprint(sys.modules["__main__"].__name__, hasattr(sys.modules["__main__"], "Dog"))', stdin: [], files: {} });
expect(hostAgain.stdout.trim() === '__main__ False', 'nothing from one run is left in the next one', hostAgain.stdout);

console.log('\nJudge features (script tests, prelude, files, quiet prompts):');
const fixture = fs.readFileSync(new URL('./fixtures/judge-modes.md', import.meta.url), 'utf8');
const judgeOk = await checkGame(execute, fixture, 'judge-modes.md');
expect(judgeOk.problems.length === 0 && judgeOk.levels.length === 4 && judgeOk.levels.every((l) => l.ok), 'the four sample judge levels all pass with three stars', judgeOk.problems.map((p) => '   ' + p).join('\n'));
const broken = fixture.replace('return n * 2', 'return n + 2');
const judgeBad = await checkGame(execute, broken, 'judge-broken.md');
expect(judgeBad.problems.some((p) => /solution does not pass/.test(p)), 'a script-mode solution that fails a test is reported');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(failures ? `\n${failures} check(s) failed. The validator is not trustworthy yet.` : '\nThe validator accepts good content and catches every kind of mistake tested.');
process.exit(failures ? 1 : 0);
