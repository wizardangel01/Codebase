---
title: Pythonic code: cheat sheet
---
## Comprehensions

```python
squares = [n * n for n in range(10)]                  # map: one result for each item
evens = [n for n in numbers if n % 2 == 0]            # filter: the if comes AFTER the for
signs = [n if n >= 0 else -n for n in numbers]        # choose: if and else come BEFORE the for
pairs = [(x, y) for x in range(3) for y in range(3)]  # nested: the outer loop comes first
flat = [item for row in rows for item in row]         # flatten a list of lists
by_name = {p.name: p for p in people}                 # dictionary comprehension
unique = {word.lower() for word in words}             # set comprehension
total = sum(n * n for n in numbers)                   # generator expression, no extra brackets
```

- Read a comprehension as a sentence: "give me `n * n` for every `n` in `numbers` if `n` is even".
- A comprehension has its own scope: the loop variable does not leak out.
- Use a plain `for` loop when the comprehension needs more than one `if`, more than two `for` parts, or a side effect such as `print`.
- `{}` is an empty **dictionary**. Write `set()` for an empty set.

## Iterators and generators

```python
numbers = iter([1, 2, 3])        # an iterator remembers its place
next(numbers)                    # 1
next(numbers, "done")            # a default, instead of StopIteration at the end

def countdown(start):
    while start > 0:
        yield start              # pause here, hand out a value, resume on the next request
        start -= 1

list(countdown(3))               # [3, 2, 1]
gen = (n * n for n in range(5))  # a generator expression

def flatten(rows):
    for row in rows:
        yield from row           # hand over every item of another iterable

from itertools import count, islice, takewhile
list(islice(count(1), 5))        # the first 5 items of an infinite sequence
list(takewhile(lambda n: n < 40, count(1, 10)))

class Countdown:                 # the protocol written by hand
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1
```

- A function with `yield` returns a **generator object** when called, and the body runs only when something asks for a value.
- An iterator can be used **once**. Make a new one to start again.
- Generators keep one item in memory at a time, so they can handle a huge or endless stream. Use `sum`, `max`, `any` and `list` to consume them.
- An **iterable** (a list, a string, a class with `__iter__`) can give you a new iterator each time. An **iterator** has `__next__` and is itself iterable.

## Functional tools

```python
list(map(str.upper, words))                   # apply a function to every item (lazy)
list(filter(str.isdigit, words))              # keep the items for which the function is true
any(n > 90 for n in scores)                   # is at least one true?    any([]) is False
all(n >= 50 for n in scores)                  # are all of them true?    all([]) is True

for number, word in enumerate(words, start=1): ...
for name, score in zip(names, scores): ...    # stops at the shortest
dict(zip(keys, values))                       # two lists become a dictionary
list(zip(*rows))                              # transpose a table
zip(names, scores, strict=True)               # raises ValueError if the lengths differ
reversed(items)                               # a lazy reverse
sorted(words, key=len, reverse=True)
max(people, key=lambda person: person.age)
```

- `map` and `filter` return **iterators**, so wrap them in `list(...)` to see the items. A comprehension usually reads better.
- A `lambda` is a small function without a name: `lambda x: x * 2`. A function with a name is clearer once it needs more than one line.
- `any` and `all` stop as soon as the answer is known.

## Unpacking and the walrus operator

```python
first, *middle, last = [1, 2, 3, 4, 5]       # middle is [2, 3, 4], always a list
head, *tail = "abc"                          # head is "a", tail is ["b", "c"]
a, b = b, a                                  # swap without a temporary variable
print(*items, sep=", ")                      # spread a list into separate arguments
merged = {**defaults, **options}             # merge dictionaries: later keys win

if (count := len(items)) > 3:                # assign and test in one step
    print(f"{count} items")

while (line := input()) != "done":           # read until a stop word
    process(line)
```

- Only one starred name is allowed on the left of an assignment.
- Put the walrus expression in brackets. Use it to avoid a second call, and not to squeeze more into a line.

## Pattern matching

```python
match command.split():
    case ["go", direction]:                  # exactly two items, and it captures direction
        ...
    case ["pick", *things]:                  # a star collects the rest
        ...
    case ["quit"] | ["exit"]:                # alternatives
        ...
    case [x, y] if x == y:                   # a guard: an extra condition
        ...
    case {"type": "click", "x": x}:          # a mapping: these keys must exist, others may too
        ...
    case Point(x=0, y=0):                    # a class pattern (a dataclass works well)
        ...
    case _:                                  # the wildcard matches anything
        ...
```

- The cases are tried from top to bottom, and **the first match wins**.
- A bare name in a pattern **captures** a value. To compare with a constant, use a literal or a dotted name such as `Color.RED`.
- A string is not treated as a sequence, so `case [a, b]` does not match `"ab"`.

## Clean, readable Python

| Kind of name | Style | Example |
| --- | --- | --- |
| variable, function, method, module | lower case with underscores | `total_price` |
| class | each word capitalised | `ShoppingCart` |
| constant | capitals with underscores | `MAX_ATTEMPTS` |
| private, by convention | a leading underscore | `_cache` |

| Instead of | Write |
| --- | --- |
| `if len(items) > 0:` | `if items:` |
| `if flag == True:` | `if flag:` |
| `if value == None:` | `if value is None:` |
| `for i in range(len(items)):` | `for item in items:` or `enumerate(items)` |
| `if 0 <= x and x < 10:` | `if 0 <= x < 10:` |
| a `+` in a loop to build text | `" ".join(words)` |
| `if key in d` then `d[key]` | `d.get(key, default)` |

```python
TAX_RATE = 0.20                       # a named constant, not a magic number

def average(numbers):
    """Return the mean of a list of numbers."""   # a docstring: the first statement
    return sum(numbers) / len(numbers)

help(average)                         # prints the docstring
average.__doc__                       # the docstring as a string

print(f"{total = }")                  # prints: total = 42
print(f"{price = :.2f}")              # the = specifier takes a format too

class Section:                        # a context manager
    def __enter__(self):
        print("<section>")
        return self                   # this goes to the name after as

    def __exit__(self, exc_type, exc, traceback):
        print("</section>")
        return False                  # True would swallow the error

with Section():
    ...

from contextlib import suppress
with suppress(FileNotFoundError):     # ignore one kind of error
    open("missing.txt").read()
```

- **PEP 8** is the style guide: four spaces, spaces around operators, lines of at most 79 characters, imports at the top. Tools such as `black` and `ruff` apply it for you.
- A **comment** explains why. A **docstring** says what the function does and when it fails.
- A function does **one job**. When the name needs the word "and", split it.
- Put the work of a program in `main()` and call it under `if __name__ == "__main__":`.
- **Refactoring** changes the structure of the code, not what it does. Check that the output is the same after each step.
- Preview of module 14: `@contextmanager` turns a generator function into a context manager.
