---
title: Clean, readable Python
---
A program is written once and read many times: by your teammates, and by you, six months from now, when you have forgotten how it works. Code that is **readable** is code that is safe to change and hard to break. Python has a long tradition of readable style, and this lesson collects its habits: the naming and layout rules of the official style guide, docstrings, small functions, named constants, the idioms that Python programmers expect, the `with` statement that you can now write yourself, and a refactoring that turns a messy program into a clean one.

## The style guide: PEP 8

The official style guide is called **PEP 8** (a PEP is a *Python Enhancement Proposal*). It is not a law, but nearly every Python project follows it, so code that follows it feels familiar to everyone. Compare these two functions. They do exactly the same work:

```python run
def f(l,x=3):
    r=[]
    for i in l:
        if i>x:r.append(i)
    return r
print(f([1,5,2,8]))
```

```python run
def numbers_above(numbers, limit=3):
    result = []
    for number in numbers:
        if number > limit:
            result.append(number)
    return result

print(numbers_above([1, 5, 2, 8]))
```

The second function says what it does in its name and in its variables, and every statement has a line of its own. The main rules are these:

- **Names** carry meaning: `total_price`, not `tp`, and never `l`, `O` or `I`, which look like digits. A short name is fine for a tiny scope, such as `i` in a counting loop.
- **Layout**: four spaces for each level of indentation, a space on both sides of an operator (`a + b`) and after a comma, and no space directly inside brackets. Put two blank lines between top-level functions and classes, and one blank line between the methods of a class.
- **Line length**: at most 79 characters. Long lines are broken inside brackets.
- **Imports** are at the top, one module per line, in three groups: the standard library, other packages, and your own modules.

The style of a name tells the reader what kind of thing it is:

| Kind of name | Style | Example |
| --- | --- | --- |
| variable, function, method, module | lower case with underscores | `total_price`, `read_scores` |
| class | each word capitalised | `ShoppingCart` |
| constant | capitals with underscores | `MAX_ATTEMPTS` |
| private, by convention | a leading underscore | `_cache` |

Tools such as `black`, `ruff` and `flake8` check and fix the layout for you. They run on your own computer, and not in the browser, but it is worth installing one when you start real projects.

%% question q-names-multi | multi
Select every name that follows PEP 8 for the thing that it names.
%% choice correct
`total_price` for a variable
%% choice correct
`ShoppingCart` for a class
%% choice correct
`MAX_ATTEMPTS` for a constant
%% choice
`getUserName` for a function
%% choice
`l` for a list of customers
%% explain
Variables and functions use lower case with underscores, classes use capitalised words, and constants use capitals. The name `getUserName` is the style of other languages, and the letter `l` can be mistaken for the digit 1, and it says nothing about the contents.
%% end

## Docstrings and comments

A **docstring** is a string literal placed as the **first statement** of a function, class or module. It is the official place to say what the code does. Python keeps it, so `help()` can show it, and tools can read it. A one-line docstring is enough for a simple function. A longer one has a summary line, a blank line, and the details. The `doctest` module from module 9 can even run the examples that you put inside it:

```python run
def average(numbers):
    """Return the mean of a list of numbers.

    Raise ValueError when the list is empty.

    >>> average([2, 4, 9])
    5.0
    """
    if not numbers:
        raise ValueError("average() needs at least one number")
    return sum(numbers) / len(numbers)

help(average)
print(average.__doc__.splitlines()[0])

import doctest
print(doctest.testmod())
```

Write the first line as a command ("Return the mean", "Read the scores"), and say **what** the function gives back and **when** it fails. A **comment** has a different job: it explains **why**. A comment that repeats the code, such as `# add 1 to i` above `i += 1`, only adds noise. A comment that explains a surprising decision, such as `# the server counts from 1, not from 0`, is a gift to the next reader.

%% question q-doc-fill | fill
Fill in the blank so that the program prints the docstring of the function.

```python
def average(numbers):
    """Return the mean."""
    return sum(numbers) / len(numbers)

print(average.___)
```
%% answer
__doc__
%% expected
Return the mean.
%% explain
Python stores the docstring of a function in its attribute `__doc__`. The `help` function reads it from there.
%% end

## Small functions and named constants

A function should do **one job**, and its name should say which. A function that reads data, calculates a result and prints a report is three functions in one. It cannot be tested without the keyboard, and it cannot be reused. When you cannot name a function without the word "and", split it.

The second habit is about **magic numbers**: a bare number in the middle of the code, which the reader must guess the meaning of. Give it a name, in capitals, at the top of the file:

```python run
# Hard to read: what are 18, 0.2 and 12?
age = 25
price = 50
print(age >= 18, price * 1.2, price * 12)

# Clear: the names carry the meaning, and there is one place to change them.
ADULT_AGE = 18
TAX_RATE = 0.2
MONTHS_PER_YEAR = 12

print(age >= ADULT_AGE, price * (1 + TAX_RATE), price * MONTHS_PER_YEAR)
```

Python does not forbid you to change a constant. The capitals are a promise to the reader that nobody will. The numbers 0 and 1 are usually clear on their own, so they are not magic.

## Idioms: the way Python programmers write

An **idiom** is the usual way to say something in a language. When you use the idiom, readers understand it at a glance. Here are the ones that you will meet most:

| Instead of | Write | Why |
| --- | --- | --- |
| `if len(items) > 0:` | `if items:` | an empty collection is false |
| `if flag == True:` | `if flag:` | it is a boolean already |
| `if value == None:` | `if value is None:` | there is only one `None` |
| `for i in range(len(items)):` | `for item in items:` | the loop gives the items |
| `items[i]` with a counter | `for i, item in enumerate(items):` | position and item together |
| `if 0 <= x and x < 10:` | `if 0 <= x < 10:` | a chained comparison |
| `text = text + word` in a loop | `" ".join(words)` | one pass, not many copies |
| `if key in d:` then `d[key]`, else a default | `d.get(key, default)` | shorter |

```python run
items = []
if not items:
    print("empty")

value = None
print(value is None)

age = 25
print(18 <= age < 65)

words = ["a", "b", "c"]
for number, word in enumerate(words, start=1):
    print(number, word)
print("-".join(words))

settings = {"volume": 7}
print(settings.get("brightness", 5))
```

The idea behind the first line is **truthiness**. Empty collections, empty strings, `0` and `None` count as false in a condition, and everything else is true. So `if items:` means "if there is anything in the list".

%% question q-truth-predict | predict
What does this program print?

```python
print(bool([]), bool(""), bool(0), bool([0]))
```
%% answer
False False False True
%% explain
An empty list, an empty string and the number 0 are all false. The list `[0]` is **not** empty, because it holds one item, so it is true, even though that item is a zero.
%% end

### Debugging with f-strings

The **`=` specifier** of an f-string prints an expression, an equals sign and its value. It is the quickest way to write a debugging line:

```python run
x = 42
words = ["a", "b", "c"]
price = 3.5

print(f"{x = }")
print(f"{x=}")
print(f"{x * 2 = }")
print(f"{price = :.2f}")
print(f"{len(words)=}")
```

You get the name and the value without typing the name twice, and the line stays correct when you rename the variable.

%% question q-fstring-predict | predict
What does this program print?

```python
x = 6
print(f"{x * 2 = }")
```
%% answer
x * 2 = 12
%% explain
The `=` specifier prints the expression exactly as you wrote it, here `x * 2`, then ` = `, and then its value, which is 12.
%% end

## The with statement, and writing your own

The statement `with open("notes.txt") as f:` guarantees that the file is closed at the end of the block, even when an error happens inside it. The object after `with` is a **context manager**. You can write your own. A context manager is any object with two special methods: `__enter__` runs when the block starts (and its result goes to the name after `as`), and `__exit__` runs when the block ends, **whatever the reason**:

```python run
class Section:
    def __init__(self, title):
        self.title = title

    def __enter__(self):
        print(f"<{self.title}>")
        return self

    def __exit__(self, exc_type, exc, traceback):
        print(f"</{self.title}>")
        return False

with Section("report"):
    print("inside")
    with Section("table"):
        print("rows")
```

The three arguments of `__exit__` describe the exception that ended the block, and they are `None` when there was none. The method runs **even when an error occurs**, which is the whole point:

```python run error
class Section:
    def __init__(self, title):
        self.title = title

    def __enter__(self):
        print(f"<{self.title}>")
        return self

    def __exit__(self, exc_type, exc, traceback):
        print(f"</{self.title}>")
        return False

with Section("risky"):
    print("before")
    1 / 0
```

The closing tag is printed, and then the error goes on its way. That is because `__exit__` returned `False`. If it returned `True`, the exception would be **swallowed**, and the program would carry on after the `with` block, so do that only when you mean it.

Writing a class for a small job is long. The module `contextlib` offers shortcuts. The function `suppress` makes a block that ignores one kind of error, and the decorator `contextmanager` turns a **generator function** from lesson 2 into a context manager:

```python run
from contextlib import suppress

with suppress(FileNotFoundError):
    open("missing.txt").read()
print("carried on")
```

```python preview run
from contextlib import contextmanager

@contextmanager
def section(title):
    print(f"<{title}>")
    try:
        yield
    finally:
        print(f"</{title}>")

with section("report"):
    print("inside")
```

The line that starts with `@` is a **decorator**, and module 14 explains how decorators work. For now, read this function as: the code before `yield` runs when the block starts, the block itself runs at the `yield`, and the code after it runs when the block ends. The `try` and `finally` make sure that the closing line is printed even after an error.

%% question q-with-predict | predict
What does this program print?

```python
class Tag:
    def __enter__(self):
        print("open")
        return self

    def __exit__(self, exc_type, exc, tb):
        print("close")

with Tag():
    print("inside")
```
%% answer
open
inside
close
%% explain
The method `__enter__` runs when the block starts, the body of the block runs next, and `__exit__` runs when the block ends. The method returns nothing here, which counts as false, so an error would not be swallowed.
%% end

## One more habit: the main guard

You met the line `if __name__ == "__main__":` in lesson 1 of module 12. It keeps the code that **runs the program** apart from the code that **defines** things. A file that has the guard can be imported by another file to reuse its functions, and the program only starts when the file is run itself. Put the work of the program in a function called `main`, and call it under the guard, as the next section does.

## A refactoring: from messy to clean

Here is a short program, as it might arrive from a colleague in a hurry. It prints the total of a shopping basket, with a discount for big baskets and then tax:

```python run
def p(i):
    t=0
    for x in i:
        t=t+x[1]*x[2]
    if t>100:t=t*0.9
    print("Total: "+str(round(t*1.2,2)))
p([("pen",2,3.5),("book",1,45),("bag",1,60)])
```

It works, but nobody can tell what `p`, `t` or `0.9` mean, and the calculation is mixed with the printing. Here is the same program after a refactoring. Each function has one job and a docstring, the numbers have names, and the program starts from `main`:

```python run
DISCOUNT_THRESHOLD = 100
DISCOUNT_RATE = 0.10
TAX_RATE = 0.20


def line_total(item):
    """Return the cost of one line: the quantity times the unit price."""
    name, quantity, unit_price = item
    return quantity * unit_price


def basket_total(items):
    """Return the total of all lines, with a discount for big baskets."""
    total = sum(line_total(item) for item in items)
    if total > DISCOUNT_THRESHOLD:
        total *= 1 - DISCOUNT_RATE
    return total


def with_tax(amount):
    """Return the amount plus tax."""
    return amount * (1 + TAX_RATE)


def main():
    """Print the total of a sample basket."""
    basket = [("pen", 2, 3.5), ("book", 1, 45), ("bag", 1, 60)]
    total = with_tax(basket_total(basket))
    print(f"Total: {total:.2f}")


if __name__ == "__main__":
    main()
```

The output is the same, and the program is longer, but every part can now be read, tested and changed on its own. You can call `with_tax(100)` in a test without any basket. When the tax rate changes, there is one line to edit. This is what refactoring means: **changing the structure of the code without changing what it does**. Always keep the output the same and check it after each step.

%% question q-split-choice | choice
A function of 60 lines reads the scores from the keyboard, calculates the average and prints a report. What is the best way to improve it?
%% choice
Add more comments to explain each part
%% choice
Make the names shorter, so that the lines fit in the window
%% choice correct
Split it into small functions, so that each one does a single job
%% choice
Move all the code into one long comprehension
%% explain
A function with three jobs is hard to test and impossible to reuse. Reading, calculating and printing become three functions with clear names, and the calculation can be tested without a keyboard.
%% end

## Your turn

%% exercise debug-prints | Debug prints
The program below sets two numbers. Use the **`=` specifier of f-strings** to print three debugging lines that show each expression and its value. The program must print:

```output
x = 6
y = 7
x * y = 42
```
%% starter
x = 6
y = 7
# Print the three lines with f-strings that use the = specifier.
%% solution
x = 6
y = 7
print(f"{x = }")
print(f"{y = }")
print(f"{x * y = }")
%% tests
expect_output("x = 6\ny = 7\nx * y = 42")
check(source().replace(" ", "").count("=}") >= 3, "use the = specifier of f-strings three times")
%% hint
An f-string with `{x = }` prints the text `x = ` and then the value of `x`.
%% hint
The specifier works on any expression: `{x * y = }` prints `x * y = 42`.
%% hint
Write three `print` calls, each with one f-string.
%% end

%% exercise tag-manager | Tag manager
Write a **context manager class** `Tag` that prints an opening tag when the block starts and a closing tag when it ends, with two spaces of indentation for each level of nesting. The current level is kept in a **class attribute** called `depth`. The method `say(text)` prints a line of text, indented by the current depth. The closing tag must be printed even when an error happens inside the block. The program below uses your class and must print:

```output
<html>
  <body>
    hello
    world
  </body>
</html>
```
%% starter
class Tag:
    # A context manager: __enter__ prints <name>, __exit__ prints </name>.
    pass

with Tag("html"):
    with Tag("body") as body:
        body.say("hello")
        body.say("world")
%% solution
class Tag:
    depth = 0

    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print("  " * Tag.depth + f"<{self.name}>")
        Tag.depth += 1
        return self

    def __exit__(self, exc_type, exc, traceback):
        Tag.depth -= 1
        print("  " * Tag.depth + f"</{self.name}>")
        return False

    def say(self, text):
        print("  " * Tag.depth + text)

with Tag("html"):
    with Tag("body") as body:
        body.say("hello")
        body.say("world")
%% tests
expect_output("<html>\n  <body>\n    hello\n    world\n  </body>\n</html>")
import io, contextlib
buffer = io.StringIO()
with contextlib.redirect_stdout(buffer):
    try:
        with Tag("x"):
            raise ValueError("boom")
    except ValueError:
        pass
check(buffer.getvalue() == "<x>\n</x>\n", "the closing tag is printed even after an error")
check(Tag.depth == 0, "the depth is 0 again after the error")
check(hasattr(Tag, "__enter__") and hasattr(Tag, "__exit__"), "the class has __enter__ and __exit__")
%% hint
`__enter__` prints the opening tag, adds 1 to `Tag.depth`, and returns `self`. `__exit__(self, exc_type, exc, traceback)` takes 1 off the depth, and then prints the closing tag.
%% hint
Indent with `"  " * Tag.depth`. The closing tag is printed **after** the depth goes down, so that it lines up with the opening tag.
%% hint
`__exit__` can return `False`. The error then goes on, but the closing tag has been printed already. The method `say` prints `"  " * Tag.depth + text`.
%% end

%% exercise idioms | Idioms
The program below works, but it is full of habits that Python programmers avoid. Rewrite it so that it prints the **same output** with idiomatic code: no `range(len(...))`, no `== None`, no `len(...) > 0`, no `.keys()`, a **chained comparison** in place of the two comparisons joined by `and`, `enumerate` for the numbers, and `"\n".join(...)` in place of building the text with `+`. The program must print:

```output
1. Ada
3. Cy
Dee has no score
```
%% starter
scores = {"Ada": 92, "Ben": 78, "Cy": 85}
names = list(scores.keys())
report = ""
for i in range(len(names)):
    if scores[names[i]] >= 80 and scores[names[i]] <= 100:
        report = report + str(i + 1) + ". " + names[i] + "\n"
if len(report) > 0:
    print(report.strip())
bonus = scores.get("Dee")
if bonus == None:
    print("Dee has no score")
%% solution
scores = {"Ada": 92, "Ben": 78, "Cy": 85}
lines = []
for number, name in enumerate(scores, start=1):
    if 80 <= scores[name] <= 100:
        lines.append(f"{number}. {name}")
if lines:
    print("\n".join(lines))
if scores.get("Dee") is None:
    print("Dee has no score")
%% tests
expect_output("1. Ada\n3. Cy\nDee has no score")
text = source()
check("range(len(" not in text, "loop over the items, or use enumerate, not range(len(...))")
check("== None" not in text and "!= None" not in text, "compare with None using is")
check("> 0" not in text, "test whether a collection is empty by its truth value, not with len(...) > 0")
check(not calls("keys"), "a dictionary can be looped over without .keys()")
check(calls("enumerate"), "uses enumerate")
check(calls("join"), "builds the text with join")
import ast
chained = False
for node in ast.walk(ast.parse(text)):
    if isinstance(node, ast.Compare) and len(node.ops) >= 2:
        chained = True
check(chained, "uses a chained comparison such as 80 <= score <= 100")
%% hint
Looping over a dictionary gives its keys, and `enumerate(scores, start=1)` adds the numbers. You do not need `names` or `range(len(...))`.
%% hint
The two comparisons become one: `80 <= scores[name] <= 100`. Collect the lines in a list, and print them with `"\n".join(lines)` when the list is not empty (`if lines:`).
%% hint
Compare with `None` using `is`. You can also test the lookup directly: `if scores.get("Dee") is None:`.
%% end

%% exercise tidy-till | Challenge: Tidy the till
The program below reads the lines of a shopping basket (`name quantity price`) until the line `done`. It prints the total with a discount for big baskets, and then tax. It works, but nobody can read it. **Refactor** it so that it prints exactly the same, and so that it passes these checks:

- at least **three functions**, each with a **docstring**,
- **descriptive names**: no function, parameter or variable name shorter than 3 characters,
- **no magic numbers**: every number except 0 and 1 is the value of a constant written in capitals at the top of the file,
- a function `main()` that is called under `if __name__ == "__main__":`,
- no line longer than 79 characters.

For the input below the program prints:

```output
Total: 120.96
```
%% stdin
pen 2 3.5
book 1 45
bag 1 60
done
%% starter
def p(i):
    t=0
    for x in i:
        t=t+x[1]*x[2]
    if t>100:t=t*0.9
    return t*1.2
L=[]
while True:
    s=input()
    if s=="done":break
    a=s.split()
    L.append((a[0],int(a[1]),float(a[2])))
print("Total: %.2f"%p(L))
%% solution
DISCOUNT_THRESHOLD = 100
DISCOUNT_RATE = 0.10
TAX_RATE = 0.20


def read_basket():
    """Read 'name quantity price' lines until 'done'; return the items."""
    items = []
    while (line := input()) != "done":
        name, quantity, price = line.split()
        items.append((name, int(quantity), float(price)))
    return items


def basket_total(items):
    """Return the total of all lines, with a discount for big baskets."""
    total = 0
    for name, quantity, price in items:
        total += quantity * price
    if total > DISCOUNT_THRESHOLD:
        total *= 1 - DISCOUNT_RATE
    return total


def with_tax(amount):
    """Return the amount plus tax."""
    return amount * (1 + TAX_RATE)


def main():
    """Read a basket and print the total with discount and tax."""
    total = with_tax(basket_total(read_basket()))
    print(f"Total: {total:.2f}")


if __name__ == "__main__":
    main()
%% tests
expect_output("Total: 120.96")
check(rerun("pen 1 2\ndone").strip() == "Total: 2.40", "a small basket has no discount")
check(rerun("done").strip() == "Total: 0.00", "an empty basket")
check(rerun("tv 1 200\ndone").strip() == "Total: 216.00", "a big basket gets the discount")
import ast
tree = ast.parse(source())
functions = []
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        functions.append(node)
check(len(functions) >= 3, "split the work into at least 3 functions")
missing = []
for function in functions:
    if not ast.get_docstring(function):
        missing.append(function.name)
check(not missing, "add a docstring to: " + ", ".join(missing))
names = []
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        names.append(node.name)
        for arg in node.args.args:
            names.append(arg.arg)
    elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
        names.append(node.id)
short = sorted(set(name for name in names if len(name) < 3))
check(not short, "use descriptive names, not: " + ", ".join(short))
allowed = set()
for node in tree.body:
    if isinstance(node, ast.Assign) and all(isinstance(t, ast.Name) and t.id.isupper() for t in node.targets):
        for inner in ast.walk(node.value):
            allowed.add(id(inner))
magic = []
for node in ast.walk(tree):
    if isinstance(node, ast.Constant) and type(node.value) in (int, float) and id(node) not in allowed and node.value not in (0, 1):
        magic.append(str(node.value))
check(not magic, "give these numbers a name in capitals: " + ", ".join(magic))
guard = False
for node in tree.body:
    if isinstance(node, ast.If) and isinstance(node.test, ast.Compare) and isinstance(node.test.left, ast.Name) and node.test.left.id == "__name__":
        guard = True
check(guard, "call main() under if __name__ == \"__main__\":")
longest = 0
for line in source().splitlines():
    longest = max(longest, len(line))
check(longest <= 79, "keep every line at 79 characters or fewer")
%% hint
Split the work: one function reads the basket, one calculates the total with the discount, one adds the tax, and `main` prints the result. Each one needs a docstring, which is a string on the first line of the body.
%% hint
Move 100, 0.9 and 1.2 into constants at the top: for example `DISCOUNT_THRESHOLD = 100`, `DISCOUNT_RATE = 0.10` and `TAX_RATE = 0.20`. Then write `1 - DISCOUNT_RATE` and `1 + TAX_RATE` in the formulas.
%% hint
Rename `p`, `i`, `t`, `x`, `L`, `s` and `a` to names that say what they hold, such as `items`, `total`, `quantity`, `price` and `line`. End the file with `if __name__ == "__main__":` and a call of `main()`.
%% end

## What you learned

- **PEP 8** is the style guide that nearly all Python code follows: lower case names with underscores for variables and functions, capitalised words for classes, capitals for constants, four spaces of indentation, spaces around operators, and lines of at most 79 characters. Tools such as `black` and `ruff` apply it for you on your own computer.
- A **docstring** is the first statement of a function, class or module. `help()` and `__doc__` show it. A comment explains **why**, not what.
- A function does **one job**, and its name says which. A **magic number** gets a name in capitals, such as `TAX_RATE`.
- Idioms: `if items:`, `is None`, `for item in items:`, `enumerate`, chained comparisons such as `0 <= x < 10`, `" ".join(...)` and `d.get(key, default)`. The f-string specifier `{x = }` prints an expression with its value.
- A **context manager** has `__enter__` and `__exit__`, and `__exit__` runs even after an error. `contextlib.suppress` ignores one kind of error, and `contextlib.contextmanager` turns a generator function into a context manager (decorators come in module 14).
- **Refactoring** changes the structure of code without changing its behaviour: split the work into small functions, name the numbers, put the program in `main()`, and keep the output the same.
