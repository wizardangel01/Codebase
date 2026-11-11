---
title: Functional tools and pattern matching
---
In Python, a function is a value like any other. You can store it in a variable, pass it to another function, and get it back from a call. This lesson shows the everyday tools that make use of that idea (`map`, `filter`, `any`, `all`, `zip` and the `key=` argument), and then two newer parts of the language that make code shorter and clearer: **unpacking** with the star, and **pattern matching** with `match` and `case`.

## map and filter

You know `lambda` from module 7: a small unnamed function in one expression, such as `lambda n: n * 2`. The function `sorted(words, key=lambda w: len(w))` already passes a function to another function. Two more built-ins work in the same way. The call `map(function, items)` applies the function to **every** item, and `filter(function, items)` keeps the items for which the function gives a true value:

```python run
numbers = [1, 2, 3, 4, 5, 6]

doubled = map(lambda n: n * 2, numbers)
print(type(doubled).__name__)
print(list(doubled))
print(list(doubled))

print(list(filter(lambda n: n % 2 == 0, numbers)))
print(list(map(str, numbers)))
print(", ".join(map(str, numbers)))
print(list(map(int, ["4", "8", "15"])))
print(list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30])))
print(list(filter(None, [0, 1, "", "a", [], [2], None])))
```

Both return **iterators**, as lesson 2 explained, so you wrap them in `list(...)` to see the items, and they can be used only once (the second `list(doubled)` is empty). With two sequences, `map` hands the function one item from each. With `None` as the function, `filter` keeps the items that are truthy.

Which is better, `map` and `filter` or a comprehension? Usually the comprehension, because it reads more like a sentence: `[n * 2 for n in numbers]` beats `list(map(lambda n: n * 2, numbers))`. But when you already have a **named function**, `map` is shorter and clean. The idioms `list(map(int, words))` and `", ".join(map(str, numbers))` are everywhere in Python code, and you should recognise them.

%% question q-mapfilter-predict | predict
What does this program print?

```python
print(list(map(lambda n: n + 1, filter(lambda n: n > 2, [1, 2, 3, 4]))))
```
%% answer
[4, 5]
%% explain
The `filter` runs first and keeps the numbers greater than 2, which are 3 and 4. Then `map` adds 1 to each of them, which gives 4 and 5.
%% end

## any and all

Two small functions answer questions about a whole sequence. `any(items)` is `True` when **at least one** item is true, and `all(items)` is `True` when **every** item is true. They are usually fed with a generator expression:

```python run
scores = [72, 85, 90, 64]

print(any(score > 89 for score in scores))
print(all(score >= 60 for score in scores))
print(all(score >= 70 for score in scores))

password = "Tr0ub4dor"
print(any(ch.isdigit() for ch in password))
print(all(ch.isalpha() for ch in password))
print(any([]), all([]))
```

The last line holds a famous surprise. For an **empty** sequence, `any` is `False` (there is no item that is true), and `all` is `True` (there is no item that breaks the rule). Remember it when a list can be empty.

Both functions **stop early**. As soon as `any` sees a true item, or `all` sees a false item, the answer is certain, and the rest of the sequence is never looked at. With a generator expression, the remaining items are never even **made**:

```python run
def check(n):
    print("checking", n)
    return n > 2

print(any(check(n) for n in [1, 2, 3, 4, 5]))
```

Only three checks run. The same test written as `any([check(n) for n in ...])` would build the whole list first, and check all five numbers.

%% question q-anyall-multi | multi
Select every expression that is `True`.
%% choice correct
`any([0, "", 3])`
%% choice correct
`all([1, "a", [0]])`
%% choice correct
`all([])`
%% choice
`any([])`
%% choice
`all([1, 0])`
%% explain
In the first list, the number 3 is truthy. In the second list every item is truthy, even `[0]`, because a list that is not empty is true. An empty sequence makes `all` true and `any` false. And `all([1, 0])` is false because of the 0.
%% end

## zip, enumerate and reversed

You have used these three since module 5. Here they are with their best tricks:

```python run
names = ["Ada", "Ben", "Cy"]
ages = [36, 31, 22]

print(list(zip(names, ages)))
print(dict(zip(names, ages)))
print(list(zip("abc", [1, 2])))
print(list(enumerate(names, start=1)))
print(list(reversed(names)))

rows = [[1, 2, 3], [4, 5, 6]]
print(list(zip(*rows)))
print(max(names, key=len), min(ages), sum(ages))
print(sorted(zip(ages, names)))
```

- `zip(a, b)` pairs the items at the same position, and it stops at the **shortest** sequence. `dict(zip(keys, values))` is the usual way to build a dictionary from two lists.
- `zip(*rows)` (with the star from the next section) **transposes** a table: the rows become the columns.
- `sorted(zip(ages, names))` sorts the pairs by age first. This is a short way to sort one list by the values of another.
- `max`, `min` and `sorted` take a `key=` function. With `max(names, key=len)` you get the **longest** name, and not the biggest in the alphabet.

When two sequences must have the same length, ask `zip` to check it. This turns a silent loss of data into an error:

```python run error
print(list(zip("abc", [1, 2], strict=True)))
```

%% question q-zip-fill | fill
Fill in the blank so that the program prints `{'a': 1, 'b': 2}`.

```python
print(dict(___(["a", "b"], [1, 2])))
```
%% answer
zip
%% expected
{'a': 1, 'b': 2}
%% explain
The function `zip` pairs `"a"` with 1 and `"b"` with 2, and `dict` turns the pairs into a dictionary.
%% end

## Unpacking with the star

You know that `a, b = 1, 2` unpacks a pair. A star lets one name collect **the rest** of the items, and it can also spread a sequence into a call or a new collection:

```python run
first, *rest = [10, 20, 30, 40]
print(first, rest)

*start, last = [10, 20, 30, 40]
print(start, last)

head, *middle, tail = "python"
print(head, middle, tail)

a, b = 1, 2
a, b = b, a
print(a, b)
```

The starred name always gets a **list**, even when it collects nothing (an empty list). Only one star is allowed on the left. The swap `a, b = b, a` needs no temporary variable, because the right side is a tuple that is made first.

The star also works the other way round, in calls and in collections. One star spreads a sequence, and two stars spread a dictionary:

```python run
def total(x, y, z):
    return x + y + z

args = [1, 2, 3]
print(total(*args))

options = {"x": 1, "y": 2, "z": 3}
print(total(**options))

print(*args)
print([*args, 4, *"ab"])

defaults = {"colour": "red", "size": "M"}
print({**defaults, "size": "L", "price": 5})
print(defaults | {"size": "XL"})

for name, (x, y) in [("a", (1, 2)), ("b", (3, 4))]:
    print(name, x + y)
```

The call `total(*args)` passes the three items as three arguments, and `total(**options)` passes the keys as argument names. The call `print(*args)` is how you print the items of a list without brackets. In a dictionary, the later value wins when keys clash, so `{**defaults, "size": "L"}` is a copy of `defaults` with a few changes, and the `|` operator on two dictionaries does the same. The last loop unpacks **nested** structures in the loop header.

%% question q-unpack-predict | predict
What does this program print?

```python
first, *middle, last = [1, 2, 3, 4, 5]
print(first, middle, last)
```
%% answer
1 [2, 3, 4] 5
%% explain
The first and the last name take one item each, and the starred name collects everything in between, as a list.
%% end

## The walrus operator

The operator `:=` **assigns a value and uses it in the same expression**. It is called the walrus operator, because `:=` looks like the eyes and tusks of a walrus. It must be written in brackets in most places:

```python run
data = [4, 9, 16, 25, 36]
if (n := len(data)) > 3:
    print(f"{n} items, too many")

print([y for x in [3, 8, 12, 5] if (y := x * x) > 50])
```

In the first example, `len(data)` is computed once, stored in `n`, and compared, and you can still use `n` afterwards. In the comprehension, `y` holds the square, so the comprehension tests it **and** puts it in the list, without computing `x * x` twice. The best use is the loop that reads until a signal value. It replaces the `while True:` with `break` pattern that you wrote in module 4:

```python run stdin="Ada\nBen\ndone"
names = []
while (line := input()) != "done":
    names.append(line)
print(names)
```

The loop reads a line, stores it in `line`, and compares it with `"done"`, all in one condition. Use the walrus operator for these cases, and **not** to squeeze many steps into one line.

%% question q-walrus-choice | choice
What does the line `if (n := len(data)) > 3:` do?
%% choice
It compares `n` with 3 and gives an error when `n` does not exist yet
%% choice correct
It stores the length of `data` in `n`, and then tests whether it is greater than 3
%% choice
It compares the length of `data` with 3 and then deletes `n`
%% choice
It is the same as `if n == len(data) > 3:`
%% explain
The operator `:=` assigns the value of the expression on its right to the name on its left, and the whole bracket still has that value for the comparison. So `n` exists after the line, and you can use it inside the `if` block.
%% end

## Pattern matching with match and case

The `match` statement compares **the shape** of a value with a list of patterns, and runs the first one that fits. It is like a chain of `if` and `elif`, but it can also take values apart. The simplest patterns are literal values. A `|` between patterns means "or", and the underscore `_` matches anything:

```python run
def describe(command):
    match command:
        case "go" | "walk":
            return "moving"
        case "stop":
            return "stopping"
        case _:
            return "unknown"

print(describe("go"), describe("walk"), describe("stop"), describe("fly"))
```

### Sequence patterns

A pattern written like a list matches a list or a tuple with that shape, and a plain name inside it **captures** the item at that place. A starred name captures the rest. This is perfect for commands that arrive as words:

```python run
def handle(words):
    match words:
        case ["quit"]:
            return "bye"
        case ["say", message]:
            return f"saying {message}"
        case ["move", direction, steps]:
            return f"moving {direction} by {steps}"
        case ["add", first, *rest]:
            return f"adding {first} and {len(rest)} more"
        case []:
            return "nothing"
        case _:
            return "?"

for line in ["quit", "say hello", "move left 3", "add a b c", "", "jump"]:
    print(handle(line.split()))
```

### Guards and class patterns

A **guard** is an `if` after a pattern. The case matches only when the pattern fits **and** the guard is true. A class name followed by brackets checks the type of the value, so `int()` matches any whole number:

```python run
def classify(n):
    match n:
        case 0:
            return "zero"
        case int() if n < 0:
            return "negative"
        case int() if n % 2 == 0:
            return "even"
        case int():
            return "odd"
        case float():
            return "a float"
        case _:
            return "something else"

print([classify(x) for x in [0, -4, 8, 7, 2.5, "x"]])
```

Class patterns can also look **inside** an object, by attribute name. This works with every class, and it is very convenient with the dataclasses from module 10:

```python run
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

def where(point):
    match point:
        case Point(x=0, y=0):
            return "origin"
        case Point(x=0):
            return "on the y axis"
        case Point(y=0):
            return "on the x axis"
        case Point(x=a, y=b) if a == b:
            return "on the diagonal"
        case Point():
            return "somewhere else"

for p in [Point(0, 0), Point(0, 5), Point(3, 0), Point(2, 2), Point(1, 4)]:
    print(where(p))
```

### Mapping patterns

A pattern written like a dictionary matches a dictionary that **has those keys** with those values. Extra keys are allowed, and that makes mapping patterns ideal for data from JSON files and web services:

```python run
def event_text(event):
    match event:
        case {"type": "click", "pos": [x, y]}:
            return f"click at {x},{y}"
        case {"type": "key", "key": key}:
            return f"key {key}"
        case {"type": "scroll", "delta": delta} if delta < 0:
            return "scroll up"
        case {"type": "scroll"}:
            return "scroll down"
        case _:
            return "ignored"

events = [
    {"type": "click", "pos": [4, 9]},
    {"type": "key", "key": "q", "shift": True},
    {"type": "scroll", "delta": -3},
    {"type": "scroll", "delta": 5},
    {"type": "hover"},
]
for event in events:
    print(event_text(event))
```

Notice how the patterns are nested: `"pos": [x, y]` takes the position apart inside the dictionary. The second event has an extra key, `"shift"`, and it still matches the `"key"` case.

%% warn A plain name in a pattern captures, it does not compare
In a `case`, a bare name such as `RED` is a **capture pattern**: it matches anything and stores the value under that name. It does not compare with a variable that is called `RED`.
%% end

Python is so sure that this is a mistake that it refuses a program in which a capture makes the later cases unreachable:

```python run error
RED = "red"

def colour(value):
    match value:
        case RED:
            return "it is red"
        case _:
            return "other"
```

To compare with a constant, use a literal (`case "red":`) or a **dotted name** such as `Colour.RED`. A word of warning about strings: a sequence pattern never matches a `str`, so `case [a, b]` does not take apart the text `"hi"`. The word `match` is a *soft* keyword, so a variable that is called `match` still works.

%% question q-match-predict | predict
What does this program print?

```python
def f(x):
    match x:
        case [a, b]:
            return a + b
        case [a, *rest]:
            return len(rest)
        case _:
            return -1

print(f([1, 2]), f([1, 2, 3]), f("x"))
```
%% answer
3 2 -1
%% explain
The list `[1, 2]` fits `[a, b]`, so the result is 1 + 2. The list `[1, 2, 3]` has three items, so it skips the first case, and `[a, *rest]` captures `[2, 3]`, whose length is 2. A string is never matched by a sequence pattern, so `"x"` reaches the final case.
%% end

## Your turn

%% exercise password-check | Password check
Read a password. Print one line for each of four rules, as `yes` or `no`: `Length` (at least 8 characters), `Digit` (at least one digit), `Upper` (at least one capital letter) and `Lower` (at least one lower case letter). Then print `Verdict: Strong` when **all** the rules are met, and `Verdict: Weak` otherwise. Use `any` for the letter rules and `all` for the verdict. For the input below the program prints:

```output
Length: yes
Digit: yes
Upper: yes
Lower: yes
Verdict: Strong
```
%% stdin
Tr0ub4dor
%% starter
password = input()
# Check the four rules, print them, and print the verdict.
%% solution
password = input()
checks = [
    ("Length", len(password) >= 8),
    ("Digit", any(ch.isdigit() for ch in password)),
    ("Upper", any(ch.isupper() for ch in password)),
    ("Lower", any(ch.islower() for ch in password)),
]
for name, passed in checks:
    print(f"{name}: {'yes' if passed else 'no'}")
verdict = all(passed for name, passed in checks)
print("Verdict:", "Strong" if verdict else "Weak")
%% tests
expect_output("Length: yes\nDigit: yes\nUpper: yes\nLower: yes\nVerdict: Strong")
check(rerun("abc").strip() == "Length: no\nDigit: no\nUpper: no\nLower: yes\nVerdict: Weak", "a short password")
check(rerun("PASSWORD1").strip() == "Length: yes\nDigit: yes\nUpper: yes\nLower: no\nVerdict: Weak", "no lower case letter")
check(rerun("\n").strip() == "Length: no\nDigit: no\nUpper: no\nLower: no\nVerdict: Weak", "an empty password")
check(calls("any"), "uses any")
check(calls("all"), "uses all")
%% hint
`any(ch.isdigit() for ch in password)` is true when at least one character is a digit. The methods `isupper()` and `islower()` work in the same way.
%% hint
Keep the four results in a list of `(name, passed)` pairs. Then one loop prints the four lines, and nothing is repeated.
%% hint
The verdict is `all(passed for name, passed in checks)`. Print `Strong` when it is true, and `Weak` when it is not.
%% end

%% exercise walrus-average | Average with the walrus
Read whole numbers, one per line, until the line `done`. Read each line with a `while` loop that uses the walrus operator `:=`. Print `Count:`, `Total:` and `Average:` (two decimals). When there are no numbers, print `No numbers` instead. For the input below the program prints:

```output
Count: 6
Total: 108
Average: 18.00
```
%% stdin
4
8
15
16
23
42
done
%% starter
numbers = []
# Read the lines with a while loop and the walrus operator.
%% solution
numbers = []
while (line := input()) != "done":
    numbers.append(int(line))
if numbers:
    print(f"Count: {len(numbers)}")
    print(f"Total: {sum(numbers)}")
    print(f"Average: {sum(numbers) / len(numbers):.2f}")
else:
    print("No numbers")
%% tests
expect_output("Count: 6\nTotal: 108\nAverage: 18.00")
check(rerun("5\ndone").strip() == "Count: 1\nTotal: 5\nAverage: 5.00", "one number")
check(rerun("1\n2\ndone").strip() == "Count: 2\nTotal: 3\nAverage: 1.50", "two numbers")
check(rerun("done").strip() == "No numbers", "no numbers")
check(uses("NamedExpr"), "uses the walrus operator")
%% hint
The loop header can read and test at the same time: `while (line := input()) != "done":`.
%% hint
Inside the loop, convert the line with `int(line)` and append it to the list.
%% hint
After the loop, check `if numbers:` first. The report needs `len(numbers)` and `sum(numbers)`, and the average is their quotient with the format `:.2f`.
%% end

%% exercise robot-console | Robot console
Read commands, one per line, until the line `quit`. Handle each command with `match` and `case`:

- `move N` (where `N` is a whole number) prints `Moving N steps`.
- `turn left` and `turn right` print `Turning left` and `Turning right`.
- `stop` prints `Stopping`.
- `say` followed by one or more words prints `Saying:` and the words.
- A blank line is ignored, and anything else prints `Unknown command:` and the line.

For the input below the program prints:

```output
Moving 5 steps
Turning left
Saying: hello there
Unknown command: dance
Unknown command: move far
Stopping
```
%% stdin
move 5
turn left
say hello there
dance
move far
stop
quit
%% starter
# Read the commands until "quit", and handle each one with match and case.
%% solution
while (line := input()) != "quit":
    match line.split():
        case ["move", steps] if steps.isdigit():
            print(f"Moving {steps} steps")
        case ["turn", ("left" | "right") as side]:
            print(f"Turning {side}")
        case ["stop"]:
            print("Stopping")
        case ["say", *words] if words:
            print("Saying: " + " ".join(words))
        case []:
            pass
        case _:
            print(f"Unknown command: {line}")
%% tests
expect_output("Moving 5 steps\nTurning left\nSaying: hello there\nUnknown command: dance\nUnknown command: move far\nStopping")
check(rerun("turn up\nsay\nquit").strip() == "Unknown command: turn up\nUnknown command: say", "bad turn and an empty say")
check(rerun("move 12\nturn right\nquit").strip() == "Moving 12 steps\nTurning right", "other commands")
check(rerun("\nquit").strip() == "", "a blank line is ignored")
check(uses("Match"), "uses match and case")
%% hint
Split each line into words with `line.split()`, and use that list as the subject: `match line.split():`.
%% hint
Sequence patterns fit the commands: `["stop"]`, `["move", steps]` with the guard `if steps.isdigit()`, and `["say", *words]` with the guard `if words`.
%% hint
For `turn`, the pattern `["turn", ("left" | "right") as side]` captures the direction. A blank line gives the empty list `[]`, so `case []:` can ignore it. The final `case _:` prints the unknown command.
%% end

%% exercise event-router | Challenge: Event router
Read lines until the line `end`. Each line is one **event** written as JSON, so read it with `json.loads`. Print one line for each event, using `match` with mapping patterns:

- `{"type": "click", "pos": [x, y]}` prints `Click at (x, y)`.
- `{"type": "key", "key": k, "shift": true}` prints `Key SHIFT+k`. A key event without `"shift": true` prints `Key k`.
- `{"type": "scroll", "delta": d}` prints `Scroll up N` when `d` is negative, and `Scroll down N` when `d` is positive. `N` is the size of `d` without a minus sign.
- Everything else prints `Ignored`: another type, a missing key, a click whose `pos` does not have exactly two items, a scroll of 0, or a JSON value that is not an object.

For the input below the program prints:

```output
Click at (4, 9)
Key SHIFT+q
Key w
Scroll up 3
Scroll down 5
Ignored
Ignored
```
%% stdin
{"type": "click", "pos": [4, 9]}
{"type": "key", "key": "q", "shift": true}
{"type": "key", "key": "w"}
{"type": "scroll", "delta": -3}
{"type": "scroll", "delta": 5}
{"type": "hover"}
[1, 2]
end
%% starter
import json

# Read the lines until "end", and match every event.
%% solution
import json

while (line := input()) != "end":
    match json.loads(line):
        case {"type": "click", "pos": [x, y]}:
            print(f"Click at ({x}, {y})")
        case {"type": "key", "key": key, "shift": True}:
            print(f"Key SHIFT+{key}")
        case {"type": "key", "key": key}:
            print(f"Key {key}")
        case {"type": "scroll", "delta": int(delta)} if delta < 0:
            print(f"Scroll up {-delta}")
        case {"type": "scroll", "delta": int(delta)} if delta > 0:
            print(f"Scroll down {delta}")
        case _:
            print("Ignored")
%% tests
expect_output("Click at (4, 9)\nKey SHIFT+q\nKey w\nScroll up 3\nScroll down 5\nIgnored\nIgnored")
check(rerun('{"type": "click", "pos": [1, 2, 3]}\nend').strip() == "Ignored", "a click with three numbers")
check(rerun('{"type": "scroll", "delta": 0}\nend').strip() == "Ignored", "a scroll of zero")
check(rerun('{"type": "key", "key": "a", "shift": false}\nend').strip() == "Key a", "shift is false")
check(rerun('"just text"\nend').strip() == "Ignored", "not an object")
check(rerun('end').strip() == "", "no events")
check(uses("Match"), "uses match and case")
%% hint
Read each line in a `while (line := input()) != "end":` loop, and match the result of `json.loads(line)`.
%% hint
A mapping pattern lists the keys that must be there: `{"type": "click", "pos": [x, y]}`. The list pattern inside it takes the position apart, and it only fits when there are exactly two items.
%% hint
Put the key event with `"shift": True` before the plain key event. For scrolling, use a guard such as `case {"type": "scroll", "delta": int(delta)} if delta < 0:`. The last case is `_`, which prints `Ignored`.
%% end

## What you learned

- `map(function, items)` and `filter(function, items)` return **iterators**. Prefer a comprehension when you would write a `lambda`, and use `map` with a named function, as in `list(map(int, words))` and `", ".join(map(str, numbers))`.
- `any` is true when at least one item is true, and `all` when every item is true. Both stop early, `any([])` is `False`, and `all([])` is `True`.
- `zip` pairs sequences (and stops at the shortest, unless `strict=True`), `zip(*rows)` transposes a table, and `dict(zip(keys, values))` builds a dictionary. `max`, `min` and `sorted` accept `key=`.
- A **star** collects or spreads items: `first, *rest = items`, `f(*args)`, `f(**options)`, `[*a, *b]` and `{**d1, **d2}`.
- The **walrus operator** `:=` assigns inside an expression. Its best use is `while (line := input()) != "done":`.
- `match` compares a value with patterns: literals and `|`, sequences such as `["move", steps]`, mappings such as `{"type": "click"}`, classes such as `Point(x=0)`, captures, `_`, and guards with `if`. A bare name in a pattern **captures**, and a sequence pattern never matches a string.
