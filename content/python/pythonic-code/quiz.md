---
title: Pythonic code: module quiz
pass: 70
---
Twelve questions on everything in this module: comprehensions, iterators and generators, the functional tools, pattern matching and clean style. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | predict
What does this program print?

```python
print([n if n % 2 == 0 else -n for n in range(1, 6)])
```
%% answer
[-1, 2, -3, 4, -5]
%% explain
The conditional expression `n if n % 2 == 0 else -n` comes **before** the `for`, so it decides what each item is, and no number is dropped. Even numbers stay as they are, and odd numbers change sign. Five numbers go in and five come out.
%% end

%% question q2 | multi
Select every expression that is **lazy**: it does not build all of its values at once.
%% choice correct
`(n * n for n in range(5))`
%% choice correct
`map(str, range(5))`
%% choice correct
`filter(None, [0, 1, 2])`
%% choice
`[n * n for n in range(5)]`
%% choice
`sorted(range(5))`
%% explain
A generator expression (round brackets), `map` and `filter` each hand out one value at a time, when something asks for it. A list comprehension builds the whole list straight away, and `sorted` has to see every value before it can return, so it gives back a finished list.
%% end

%% question q3 | predict
What does this program print?

```python
squares = (n * n for n in range(4))
print(sum(squares), sum(squares))
```
%% answer
14 0
%% explain
A generator can be used **once**. The first `sum` adds 0, 1, 4 and 9, which is 14, and uses the generator up. The second `sum` finds nothing left, so its result is 0.
%% end

%% question q4 | choice
What happens at the moment that you **call** a generator function, such as `evens(7)`?
%% choice
Python runs the body up to the first `yield` and returns that value
%% choice
Python runs the whole body and returns a list of the yielded values
%% choice correct
Python returns a generator object, and none of the body has run yet
%% choice
Python raises `StopIteration` until you call `next`
%% explain
A function that contains `yield` does not run when you call it. Python creates a generator object and hands it back. The body starts at the first `next` (which a `for` loop or `list` does for you), and it pauses at every `yield`.
%% end

%% question q5 | fill
Fill in the blank so that the generator gives the items of `first`, and then the items of `second`.

```python
def chain(first, second):
    ___ first
    yield from second

print(list(chain([1, 2], [3])))
```
%% answer
yield from
%% expected
[1, 2, 3]
%% explain
Inside a generator, `yield from` hands over every item of another iterable, one by one. Two of them in a row give the items of `first`, and then the items of `second`.
%% end

%% question q6 | order
Put the lines in order so that the program prints `[0, 2, 4, 6]`. One line does not belong.
%% lines
def evens(limit):
    for n in range(limit):
        if n % 2 == 0:
            yield n
print(list(evens(7)))
%% distractors
            return n
%% expected
[0, 2, 4, 6]
%% explain
The function comes first, with the loop inside it, then the `if` that keeps the even numbers, and the `yield` inside the `if`. The `print` that uses the generator comes last. The distractor `return n` would end the function at the first even number and give back the plain number 0, which `list` cannot loop over.
%% end

%% question q7 | predict
What does this program print?

```python
numbers = iter([10, 20])
print(next(numbers), next(numbers), next(numbers, "done"))
```
%% answer
10 20 done
%% explain
Each `next` takes the following item. When the iterator is used up, `next` raises `StopIteration`, unless you give it a second argument, which it returns instead. So the third call gives the string `done`, and `print` shows it without quotes.
%% end

%% question q8 | choice
A list called `votes` is empty. What do `any(votes)` and `all(votes)` return?
%% choice
`False` and `False`
%% choice correct
`False` and `True`
%% choice
`True` and `False`
%% choice
`True` and `True`
%% explain
The function `any` asks whether there is at least one true item, and an empty list has none, so the answer is `False`. The function `all` asks whether any item breaks the rule, and an empty list has none that does, so the answer is `True`. Remember this when a list can be empty.
%% end

%% question q9 | predict
What does this program print?

```python
def describe(point):
    match point:
        case (0, 0):
            return "origin"
        case (x, 0):
            return f"x-axis at {x}"
        case (0, y):
            return f"y-axis at {y}"
        case _:
            return "elsewhere"

print(describe((5, 0)), describe((0, 0)), describe((2, 3)))
```
%% answer
x-axis at 5 origin elsewhere
%% explain
The pair `(5, 0)` does not match `(0, 0)`, but it matches `(x, 0)`, which **captures** `x` as 5. The pair `(0, 0)` matches the first pattern. The pair `(2, 3)` matches none of the three patterns, so the wildcard `_` catches it.
%% end

%% question q10 | multi
Select every change that improves the readability of a program **without** changing what it does.
%% choice correct
Replace the bare number `0.2` with a constant called `TAX_RATE`
%% choice correct
Rename a variable called `t` to `total`
%% choice correct
Split a function that reads, calculates and prints into three functions
%% choice
Add a comment above each line that repeats what the line does
%% choice
Delete the docstrings to make the file shorter
%% explain
Named constants, descriptive names and small functions that do one job each let the code explain itself. A comment that only repeats the code adds noise, and a docstring is the official place to say what a function does, so deleting it removes information.
%% end

%% question q11 | predict
What does this program print?

```python
from contextlib import suppress

with suppress(KeyError):
    print("a")
    {}["x"]
    print("b")
print("c")
```
%% answer
a
c
%% explain
The statement `{}["x"]` raises a `KeyError`, which leaves the `with` block at once, so `b` is never printed. The context manager `suppress(KeyError)` swallows the error, so the program carries on after the block and prints `c`.
%% end

%% question q12 | choice
The list `names` has three items and the list `scores` has two. How many pairs does `list(zip(names, scores))` contain?
%% choice correct
Two, because `zip` stops at the shortest sequence
%% choice
Three, and the missing score is `None`
%% choice
Five, because `zip` joins the two lists
%% choice
None: `zip` raises an error when the lengths differ
%% explain
The function `zip` stops as soon as one of its inputs runs out, so it gives two pairs and the third name is left out without a warning. Since Python 3.10 you can ask for an error with `zip(names, scores, strict=True)`.
%% end
