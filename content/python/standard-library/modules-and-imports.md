---
title: Modules and imports
---
%% file helpers.py
"""Small helper functions for the lesson."""

print("helpers.py is being loaded")

def greet(name):
    """Return a friendly greeting for the name."""
    return f"Hello, {name}!"

def average(numbers):
    """Return the mean of a list of numbers."""
    return sum(numbers) / len(numbers)

if __name__ == "__main__":
    print("helpers.py is running as a program")
    print(greet("test"))
%% end

%% file dice.py
"""Dice helpers."""

import random

def roll(sides=6):
    """Roll one die with the given number of sides."""
    return random.randint(1, sides)

def roll_many(count, sides=6):
    """Roll several dice and return the results as a list."""
    results = []
    for i in range(count):
        results.append(roll(sides))
    return results

def describe(results):
    """Return the rolls as text, with their total."""
    parts = []
    for result in results:
        parts.append(str(result))
    return " + ".join(parts) + " = " + str(sum(results))
%% end

Python is often described as "batteries included". When you install it, you also get hundreds of **modules**: ready-made code for maths, dates, files, text, data formats and much more. You have already used a few of them, such as `random`, `json`, `csv` and `re`. This module of the course makes you at home in the **standard library**. This first lesson is about the machinery that all the modules share: how `import` works, how to find out what a module offers, and how to write a module of your own.

## What is a module?

A **module** is a file of Python code. When you write `import random`, Python finds the file `random.py` in its standard library, runs it **once**, and gives your program a name, `random`, that refers to the module. The names defined in the file, such as the function `randint`, become **attributes** of that name:

```python run
import random

print(type(random).__name__)
print(random.__name__)
random.seed(3)
print(random.randint(1, 6) in [1, 2, 3, 4, 5, 6])
```

The module is an object like any other, with the type `module`. Its attributes are reached with a dot, which keeps the names of different modules apart: `random.choice` and `string.choice` (if it existed) would not clash.

## Four ways to import

| Statement | What you get | You write |
| --- | --- | --- |
| `import json` | the module under its own name | `json.dumps(x)` |
| `from json import dumps` | only that name | `dumps(x)` |
| `import json as js` | the module under a new name | `js.dumps(x)` |
| `from json import dumps as to_text` | one name under a new name | `to_text(x)` |

```python run
import json
from json import dumps
import json as js
from json import dumps as to_text

data = {"name": "Ada", "age": 36}
print(json.dumps(data))
print(dumps(data))
print(js.dumps(data))
print(to_text(data))
print(json is js)
```

All four lines print the same text, and `json is js` is `True`: an alias is only another name for the **same** module object. Use `as` for long names that you type often, or to avoid a clash.

Notice what each form does **not** create. After `from json import dumps as to_text`, the name `json` does not exist in your program.

%% question q-alias-predict | predict
What does this program print?

```python
from json import dumps as to_text

try:
    print(json)
except NameError:
    print("no json")
print(to_text([1, 2]))
```
%% answer
no json
[1, 2]
%% explain
The statement `from json import dumps as to_text` creates only the name `to_text`. The name `json` was never defined, so `print(json)` raises a `NameError`, which the `except` clause turns into the words `no json`. The call `to_text([1, 2])` still works and gives the text `[1, 2]`.
%% end

A short form that looks tempting is `from json import *`, which brings in **every** public name. Avoid it. You lose track of where a name came from, and a later import can silently replace a name of yours. The same silent replacement happens in this smaller example:

```python run
from random import choice

def choice(options):
    return options[-1]

print(choice(["a", "b", "c"]))
```

The `def` came after the import, so the function replaced the imported `choice`. Python does not warn you. With `import random` and the call `random.choice(...)`, this mistake is impossible, which is why most programmers prefer the plain `import module` form unless a name is used very often.

%% question q-clash-predict | predict
What does this program print?

```python
from random import choice

def choice(options):
    return options[-1]

print(choice(["a", "b", "c"]))
```
%% answer
c
%% explain
The function that you define after the import has the same name, so it replaces the imported one. It returns the last item of the list, which is `"c"`.
%% end

## Exploring a module: dir(), help() and getattr()

How do you find out what a module offers? You ask it. The built-in function `dir(obj)` lists the names that an object has, `help(obj)` prints its documentation, and the attribute `__doc__` holds the documentation text. Names that begin with an underscore are internal, and you can ignore them:

```python run
import random

names = []
for name in dir(random):
    if not name.startswith("_"):
        names.append(name)
print(len(names) > 20)
help(random.choice)
```

The function `getattr(obj, "name")` does the same as `obj.name`, but the name is a **text** that can come from a variable. Together with `hasattr`, it lets you ask a module about names that you only know at run time:

```python run
import random

for name in ["randint", "choice", "pi"]:
    if hasattr(random, name):
        print(name, "is in random")
    else:
        print(name, "is not in random")

function = getattr(random, "randint")
print(function.__doc__.splitlines()[0])
```

Get into the habit of asking `dir` and `help` before you search the web. The answer is right there, and it belongs to the version of Python that you are running.

## Your own module

Any Python file can be a module. The file `helpers.py` below is available in this lesson, so that the examples can import it:

```python
"""Small helper functions for the lesson."""

print("helpers.py is being loaded")

def greet(name):
    """Return a friendly greeting for the name."""
    return f"Hello, {name}!"

def average(numbers):
    """Return the mean of a list of numbers."""
    return sum(numbers) / len(numbers)

if __name__ == "__main__":
    print("helpers.py is running as a program")
    print(greet("test"))
```

The first string in a file or a function is its **docstring**, which `help` shows. Now import the module twice and use it:

```python run
import helpers
import helpers

print(helpers.greet("Ada"))
print(helpers.average([2, 4, 9]))
print(helpers.__name__)
```

Two things happened. The message `helpers.py is being loaded` appeared **once**, even though the program imports the module twice: the first `import` runs the file from top to bottom, and the second finds the finished module in a cache and does nothing. And the lines under `if __name__ == "__main__":` did not run.

## The main guard

Every module has a name in the variable `__name__`. When Python **imports** a file, `__name__` is the name of the module (`"helpers"`). When you **run** a file as the program, `__name__` is the special text `"__main__"`. The test `if __name__ == "__main__":` therefore means "only if this file was started as a program". It lets one file be useful in both ways: as a module that other programs import, and as a program with its own demonstration or self-test:

```python run
def main():
    print("doing the work")

print(__name__)
if __name__ == "__main__":
    main()
```

The usual pattern is to put the work of the program in a function called `main`, and to call it under the guard. Without the guard, importing the file would start the program every time, which is rarely what the importer wants.

%% question q-main-fill | fill
Fill in the blank so that the program prints `running`.

```python
def main():
    print("running")

if __name__ == "___":
    main()
```
%% answer
__main__
%% expected
running
%% explain
When a file is run as the program, Python sets `__name__` to the text `"__main__"`, so the condition is true and `main()` is called. When the file is imported, `__name__` is the module's own name and nothing happens.
%% end

## Where does Python look?

When you write `import something`, Python searches a list of folders, called `sys.path`. It looks first in the folder of your program, and then in the standard library and in the places where extra packages are installed. The **first file that matches wins**.

%% warn Do not name your file like a module
If you save your own program as `random.py`, then `import random` in that folder finds **your file** first, and the standard module is hidden. A call such as `random.randint(1, 6)` then fails with an `AttributeError` (module `random` has no attribute `randint`), and the program looks as if Python itself were broken. Never name your files `random.py`, `math.py`, `json.py`, `string.py`, `time.py` or `test.py`. A name such as `dice.py` or `helpers.py` is safe.
%% end

A group of modules in a folder is a **package**, and its parts are reached with dots: `import os.path` imports the module `path` that lives inside the package `os`, and `from os import path` gets the same module. A package is a folder with modules, usually with a file called `__init__.py`, and that is all you need to know for now:

```python run
import os.path
from os import path as p

print(os.path.join("data", "notes.txt"))
print(p.splitext("report.final.pdf"))
print(p is os.path)
```

## The standard library and the rest

Everything in this module is part of the **standard library**, which comes with Python and works the same way on every computer. Thousands of other packages exist on the Python Package Index, such as NumPy, Pandas and Requests. They are **third-party** packages, and you install them with the command `pip install`, usually in a virtual environment. This website has no network and no `pip`, so the course uses only the standard library. The skills of this lesson (import, `dir`, `help`, your own modules) work in exactly the same way for third-party packages when you use Python on your own computer.

## A project: a dice module

Here is a module that uses another module. The file `dice.py` is in this lesson, and it imports `random` to roll dice, so a `random.seed` call in the main program also controls the dice:

```python run
import random
import dice

random.seed(7)
rolls = dice.roll_many(5)
print(rolls)
print(dice.describe(rolls))
help(dice.roll)
```

There is only **one** `random` module in memory. Both the main program and `dice.py` hold a name that refers to it, so the seed set in the main program decides the rolls made inside `dice.py`. Run the program again, and you get the same dice every time. This is what makes random programs testable.

%% question q-shadow-choice | choice
A folder contains your program and a file `random.py` with your own code. What happens when your program runs `import random`?
%% choice
Python imports the standard module, because it always comes first
%% choice correct
Python imports your file, because the folder of the program is searched first
%% choice
Python reports an error because two modules have the same name
%% choice
Both modules are imported and merged
%% explain
The folder of your program is at the front of `sys.path`, and the first match wins. The standard module is hidden, which is why you must not name your own files like standard modules.
%% end

## Your turn

%% exercise use-textkit | Use a ready-made module
The file `textkit.py` is in the folder. It has the functions `shout(text)` and `count_vowels(text)`. Import them with **`from textkit import ...`**. The program reads lines until `done`, and for each line it prints the shouted text and the number of vowels. For the input below the program prints:

```output
HELLO! 2
PYTHON! 1
```
%% file textkit.py
"""Text helpers."""

def shout(text):
    return text.upper() + "!"

def count_vowels(text):
    total = 0
    for letter in text.lower():
        if letter in "aeiou":
            total += 1
    return total
%% stdin
hello
Python
done
%% starter
# Import shout and count_vowels from the module textkit.

%% solution
from textkit import shout, count_vowels

while True:
    text = input()
    if text == "done":
        break
    print(shout(text), count_vowels(text))
%% tests
expect_output("HELLO! 2\nPYTHON! 1")
check("from textkit import" in source(), "uses from textkit import ...")
check(rerun("sky\nAEIOU\ndone").strip() == "SKY! 0\nAEIOU! 5", "other words")
check(rerun("done").strip() == "", "no words, no output")
%% hint
The first line of the program is `from textkit import shout, count_vowels`.
%% hint
Read lines in a loop that stops at `done`: `text = input()`, then `if text == "done": break`.
%% hint
Print both results on one line: `print(shout(text), count_vowels(text))`.
%% end

%% exercise main-guard | A program that is also a module
Write a function `average(numbers)` that returns the mean of a list of numbers, and a function `main()` that reads one line of numbers separated by spaces and prints `Average: ` and the mean with one decimal. Call `main()` **only when the file is run as a program**, so that another program can import the file without anything happening. For the input `4 8 9` the program prints:

```output
Average: 7.0
```
%% stdin
4 8 9
%% starter
# Write average(numbers) and main(), then call main() under the guard.

%% solution
def average(numbers):
    return sum(numbers) / len(numbers)

def main():
    numbers = []
    for text in input().split():
        numbers.append(float(text))
    print(f"Average: {average(numbers):.1f}")

if __name__ == "__main__":
    main()
%% tests
expect_output("Average: 7.0")
expect(average([2, 4]), 3.0, "average works as a function")
import io, contextlib
buf = io.StringIO()
fake = {"__name__": "imported_module"}
with contextlib.redirect_stdout(buf):
    exec(source(), fake)
expect(buf.getvalue(), "", "importing the file must print nothing")
check("average" in fake and "main" in fake, "the file defines average and main")
check('__name__' in source() and '"__main__"' in source().replace("'", '"'), "uses the main guard")
%% hint
`average` returns `sum(numbers) / len(numbers)`. `main` reads the line with `input().split()` and converts each item with `float`.
%% hint
Print the result with an f-string and a format: `f"Average: {average(numbers):.1f}"`.
%% hint
The last two lines of the file are `if __name__ == "__main__":` and, indented under it, `main()`.
%% end

%% exercise module-index | Challenge: An index of a module
The file `toolbox.py` is in the folder. Write the function `index(module)` that returns a **list of lines**, one for each public function of the module, in the order that `dir()` gives. A public function has a name that does not start with an underscore, and it is callable. Each line is `name: summary`, where the summary is the **first line** of the docstring, or `(no description)` when the function has no docstring. The starter prints the index of `toolbox`. It prints:

```output
bare: (no description)
clamp: Keep x between low and high.
double: Return twice the number.
shout: Return the text in capitals.
```
%% file toolbox.py
"""A small toolbox."""

VERSION = "1.0"

def double(x):
    """Return twice the number."""
    return x * 2

def shout(text):
    """Return the text in capitals.

    The text is not changed in place.
    """
    return text.upper()

def _secret():
    """Not part of the public interface."""

def clamp(x, low, high):
    """Keep x between low and high."""
    return max(low, min(high, x))

def bare(x):
    return x
%% starter
import toolbox

# Write the function index(module) here.

for line in index(toolbox):
    print(line)

%% solution
import toolbox

def index(module):
    lines = []
    for name in dir(module):
        if name.startswith("_"):
            continue
        item = getattr(module, name)
        if callable(item):
            summary = (item.__doc__ or "(no description)").splitlines()[0]
            lines.append(f"{name}: {summary}")
    return lines

for line in index(toolbox):
    print(line)
%% tests
expect_output("bare: (no description)\nclamp: Keep x between low and high.\ndouble: Return twice the number.\nshout: Return the text in capitals.")
check(calls("dir"), "uses dir()")
import types
fake = types.ModuleType("fake")
def first():
    """Does the first thing.

    And more.
    """
def second():
    pass
fake.first = first
fake.second = second
fake.LIMIT = 10
expect(index(fake), ["first: Does the first thing.", "second: (no description)"], "a module that the tests build")
expect(index(types.ModuleType("empty")), [], "a module with no functions")
%% hint
Loop over `dir(module)`. Skip a name that starts with an underscore (`name.startswith("_")`).
%% hint
`getattr(module, name)` gives the object. Keep it only if `callable(item)` is true, which leaves out constants such as `VERSION`.
%% hint
`item.__doc__` is the docstring, or `None`. Use `(item.__doc__ or "(no description)").splitlines()[0]` for the first line, and add the text `f"{name}: {summary}"` to the list.
%% end

## What you learned

- A **module** is a Python file. `import name` runs it once, and gives you a name for the module object. Its attributes are reached with a dot.
- The four forms: `import m`, `from m import x`, `import m as alias` and `from m import x as alias`. A plain `import m` keeps names apart. Avoid `from m import *`, and remember that a later definition can silently replace an imported name.
- Explore with `dir(obj)` (the names), `help(obj)` (the documentation), `obj.__doc__`, and `getattr` or `hasattr` when the name is in a variable.
- Your own file is a module too, and a second `import` finds it in a cache. Put the work of a program in `main()`, and call it under `if __name__ == "__main__":`, so that the file can be both imported and run.
- Python searches `sys.path`, starting with the folder of your program. A file with the name of a standard module, such as `random.py`, hides it, so never name your files like that.
- A package is a folder of modules, reached with dots (`os.path`). The standard library comes with Python, and third-party packages need `pip`, which is not available on this site.
