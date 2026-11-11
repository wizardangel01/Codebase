---
title: Comprehensions
---
You have written many loops that build a list: start with an empty list, loop over something, and `append` to the list. The pattern is so common that Python has a shorter way to say it, the **comprehension**. A comprehension builds a list, a dictionary or a set from another sequence in one expression. Used well, it is shorter **and** clearer than the loop. Used badly, it is a puzzle. This lesson teaches both halves: how to write comprehensions, and when to stop.

## From a loop to a list comprehension

Here are two programs that do the same job. The first uses a loop, and the second uses a list comprehension:

```python run
numbers = [1, 2, 3, 4, 5]

squares = []
for n in numbers:
    squares.append(n * n)
print(squares)

squares = [n * n for n in numbers]
print(squares)
```

Read the comprehension aloud: "`n * n` **for** each `n` **in** `numbers`". It has three parts inside square brackets: the **expression** that makes each new item (`n * n`), the name for the current item (`n`), and the sequence to take the items from (`numbers`). The result is a **new list**, and the original is not changed.

The expression can be anything that gives a value, so a comprehension can transform items in any way:

```python run
words = ["apple", "fig", "banana"]
print([word.upper() for word in words])
print([len(word) for word in words])
print([f"{number:02d}" for number in range(1, 4)])
```

The loop variable lives **inside** the comprehension. When the comprehension has finished, the name is gone, so it cannot clash with a variable of the same name in the rest of your program:

```python run error
squares = [n * n for n in range(3)]
print(squares)
print(n)
```

## Filtering with if

An `if` at the **end** of a comprehension keeps only the items that pass a test. The others are skipped:

```python run
numbers = [3, 8, 1, 12, 7, 20, 5]

print([n for n in numbers if n > 5])
print([n * 10 for n in numbers if n % 2 == 0])

words = ["apple", "fig", "banana", "kiwi", "cherry"]
print([word.title() for word in words if len(word) > 4])
```

So a comprehension can do two jobs at once. The expression at the front **transforms** each item (what programmers call a *map*), and the `if` at the end **selects** items (a *filter*). The second line above reads: "ten times `n`, for each `n` in `numbers`, if `n` is even".

%% question q-squares-predict | predict
What does this program print?

```python
print([n * n for n in range(6) if n % 2 == 0])
```
%% answer
[0, 4, 16]
%% explain
The numbers from 0 to 5 are tested, and only the even ones pass: 0, 2 and 4. The expression squares each one, which gives 0, 4 and 16.
%% end

### A conditional expression inside

An `if` and an `else` in the **front** part of the comprehension do something different. They do not skip any item. They choose which **value** to put in the new list for each item. This is the conditional expression from module 4, placed in front of the `for`:

```python run
numbers = [3, 8, 1, 12]

print(["even" if n % 2 == 0 else "odd" for n in numbers])
print([n if n > 5 else 0 for n in numbers])
```

The two forms look alike, so keep this rule in mind. An `if` **after** the `for` is a filter, and it never has an `else`. An `if ... else` **before** the `for` is a choice of value. Mixing them up is a syntax error:

```python run error
numbers = [3, 8, 1, 12]
print([n for n in numbers if n > 5 else 0])
```

%% question q-ifelse-predict | predict
What does this program print?

```python
print(["big" if n > 2 else "small" for n in range(4)])
```
%% answer
['small', 'small', 'small', 'big']
%% explain
Every number from 0 to 3 produces **one** value, because the `if ... else` is in the front part and does not filter. Only 3 is greater than 2, so it gives `'big'`, and the others give `'small'`.
%% end

## More than one loop

A comprehension can have several `for` clauses. They are written in the **same order** as the nested loops would be: the outer loop first, and the inner loop after it.

```python run
colours = ["red", "blue"]
sizes = ["S", "M", "L"]

options = []
for colour in colours:
    for size in sizes:
        options.append(colour + "-" + size)
print(options)

print([colour + "-" + size for colour in colours for size in sizes])

grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print([number for row in grid for number in row])
print([[row[i] for row in grid] for i in range(3)])
```

The first two lines give the same list. The third shows how to **flatten** a list of lists: take each `row` in the grid, and then each `number` in the row. The last line puts a comprehension **inside** another one. The inner comprehension `[row[i] for row in grid]` collects column number `i`, and the outer one repeats this for each column. The result is the grid **transposed**: rows and columns swap places.

%% question q-nested-predict | predict
What does this program print?

```python
print([(a, b) for a in "ab" for b in (1, 2)])
```
%% answer
[('a', 1), ('a', 2), ('b', 1), ('b', 2)]
%% explain
The first `for` is the outer loop, so `a` stays the same while `b` goes through 1 and 2. Then `a` moves on to `'b'`, and `b` goes through 1 and 2 again.
%% end

## Dictionary and set comprehensions

Curly brackets build the other two kinds of container. With a **colon** between a key and a value, you get a dictionary. With a single expression and no colon, you get a set:

```python run
words = ["apple", "fig", "banana", "kiwi"]

lengths = {word: len(word) for word in words}
print(lengths)

prices = {"tea": 2.5, "cake": 4.0, "juice": 3.0}
print({item: round(price * 1.2, 2) for item, price in prices.items()})
print({item: price for item, price in prices.items() if price >= 3})

flipped = {value: key for key, value in {"a": 1, "b": 2}.items()}
print(flipped)

print(sorted({word[0] for word in words}))
print({n % 3 for n in range(10)})
```

Dictionary comprehensions are very good at **reshaping** data. They add tax to every price, keep only some entries, or flip the keys and values. A set comprehension throws away duplicates, so it answers "which different values are there?". Two details to remember:

- An empty `{}` is an empty **dictionary**. You make an empty set with `set()`.
- When two items give the same key, a dictionary comprehension keeps the **last** value for it.

%% question q-dict-choice | choice
Which expression builds a dictionary that maps each name in `names` to the length of the name?
%% choice
`{len(name) for name in names}`
%% choice correct
`{name: len(name) for name in names}`
%% choice
`[name: len(name) for name in names]`
%% choice
`(name, len(name) for name in names)`
%% explain
A colon between the key and the value, inside curly brackets, makes a dictionary comprehension. The first option has no colon, so it builds a **set** of lengths. The last two are syntax errors.
%% end

## Generator expressions

Change the square brackets of a list comprehension into round brackets, and you have a **generator expression**. It does not build a list. It makes the values **one at a time**, when something asks for them. That suits a function that reads its input once, such as `sum`, `max`, `min`, `sorted` and `"".join`:

```python run
numbers = [1, 2, 3, 4, 5]

print(sum(n * n for n in numbers))
print(max(len(word) for word in ["apple", "fig", "banana"]))
print(", ".join(str(n) for n in numbers))
print(sorted((n % 3, n) for n in numbers))

squares = (n * n for n in numbers)
print(type(squares).__name__)
print(list(squares))
print(list(squares))
```

When the generator expression is the only argument of a function, you can leave out the extra round brackets, as in `sum(n * n for n in numbers)`. Notice the last two lines of the example: a generator can be used **once**. The first `list(squares)` takes all the values, and nothing is left for the second. Lesson 2 explains how generators work. For now, remember a simple choice. Use a **list comprehension** when you need a list that you will index, print or use again. Use a **generator expression** when you feed the values straight into a function.

The difference in memory can be huge, because the generator never holds the whole sequence:

```python run
import sys

big_list = [n for n in range(100_000)]
lazy = (n for n in range(100_000))
print(sys.getsizeof(big_list) > 100_000)
print(sys.getsizeof(lazy) < 1_000)
print(sum(lazy) == sum(big_list))
```

%% question q-once-predict | predict
What does this program print?

```python
squares = (n * n for n in range(4))
print(sum(squares), sum(squares))
```
%% answer
14 0
%% explain
The squares of 0, 1, 2 and 3 are 0, 1, 4 and 9, and they add up to 14. The generator is used up by the first `sum`, so the second `sum` finds nothing and gives 0.
%% end

## When not to use a comprehension

A comprehension is a tool for **building a collection** with one clear idea. It is the wrong tool in three situations.

1. **It has become hard to read.** If a comprehension needs more than one condition and more than two loops, or you have to read it three times, write a loop, or give a name to a part of it with a small function.
2. **You only want the side effect.** A comprehension that calls `print` builds a useless list of `None` values. Use a plain `for` loop.
3. **It repeats the same work.** If you call the same method twice in one comprehension, store the result first, or use a helper.

```python run
words = ["Level", "Python", "radar", "code", "Noon"]

# Hard to read: the same work is repeated, and the test is hidden in a long line.
print([w for w in words if w.lower() == w.lower()[::-1] and len(w) > 3])

# Clearer: a function with a name that says what the test is.
def is_palindrome(text):
    text = text.lower()
    return text == text[::-1]

print([w for w in words if len(w) > 3 and is_palindrome(w)])

# A side effect: this prints, and it also builds a list of None values.
print([print(n) for n in range(2)])
```

A good rule: a comprehension should fit on one line and read like a sentence. If it does not, the loop version is not a failure of style. It is the better code.

## A project: a score report

This program uses all four kinds of comprehension on one small data set. Some lines are damaged on purpose: `cy,n/a` has no number, and `Gus,` has an empty score.

```python run
raw = ["Ada,92", "Ben,78", "cy,n/a", "Dee,85", "Eli,61", "fay,88", "Gus,", "Hal,100"]

pairs = [line.split(",") for line in raw]
scores = {name.title(): int(score) for name, score in pairs if score.isdigit()}
print(scores)

average = sum(scores.values()) / len(scores)
print(f"Average: {average:.1f}")
print("Top:", max(scores, key=scores.get))

grades = {name: "pass" if score >= 70 else "retake" for name, score in scores.items()}
print(grades)
print("Retake:", sorted(name for name, grade in grades.items() if grade == "retake"))
print("Initials:", sorted({name[0] for name in scores}))
```

The first comprehension splits every line. The second builds the dictionary, and its `if` drops the damaged lines. The third uses a conditional expression to turn scores into words. The last two use a generator expression and a set comprehension. Every line does one clear job, and none of them is long. That is what a good comprehension looks like.

## Your turn

%% exercise odd-squares | Odd squares
Read one line of whole numbers separated by spaces. Print a **list** with the squares of the **odd** numbers, in the same order. Use a list comprehension. For the input below the program prints:

```output
[9, 1, 49]
```
%% stdin
3 8 1 12 7
%% starter
words = input().split()
# Turn the words into numbers, then print the list of squares of the odd ones.

%% solution
numbers = [int(word) for word in input().split()]
print([n * n for n in numbers if n % 2 == 1])
%% tests
expect_output("[9, 1, 49]")
check(rerun("2 4 6").strip() == "[]", "no odd numbers")
check(rerun("-3 5").strip() == "[9, 25]", "a negative odd number")
check(uses("ListComp"), "uses a list comprehension")
%% hint
Convert the words first: `[int(word) for word in words]` gives a list of numbers.
%% hint
An odd number leaves the remainder 1 when you divide by 2: `n % 2 == 1`. Put that test at the **end** of the comprehension, after the `for`.
%% hint
The expression at the front of the comprehension is `n * n`. Print the whole comprehension, so that the list appears in square brackets.
%% end

%% exercise price-list | Price list
Read lines of the form `item price` until the line `done`. Print every item with its price **plus 20 percent tax**, in alphabetical order of the item, as `item: price`, with two decimals. Build the new prices with a **dictionary comprehension**. For the input below the program prints:

```output
cake: 4.80
juice: 3.60
tea: 3.00
```
%% stdin
tea 2.50
cake 4.00
juice 3.00
done
%% starter
prices = {}
# Read the lines until "done" and fill the dictionary.

%% solution
prices = {}
while True:
    line = input()
    if line == "done":
        break
    item, price = line.split()
    prices[item] = float(price)
taxed = {item: price * 1.2 for item, price in prices.items()}
for item in sorted(taxed):
    print(f"{item}: {taxed[item]:.2f}")
%% tests
expect_output("cake: 4.80\njuice: 3.60\ntea: 3.00")
check(rerun("done").strip() == "", "no items")
check(rerun("lamp 10\nbook 7.50\ndone").strip() == "book: 9.00\nlamp: 12.00", "other prices")
check(uses("DictComp"), "uses a dictionary comprehension")
%% hint
Read in a `while True` loop, and `break` when the line is `done`. Split each line into the item and the price, and store `float(price)` in the dictionary.
%% hint
The new prices come from one dictionary comprehension: `{item: price * 1.2 for item, price in prices.items()}`.
%% hint
Loop over `sorted(taxed)`, and print each line with the format `{taxed[item]:.2f}`.
%% end

%% exercise grid-tools | Grid tools
Read a number `n`, and then `n` lines with `n` whole numbers each: a square grid. Print three lines: the grid **flattened** into one list, the **columns** as a list of lists, and the **diagonal** from the top left to the bottom right. Build each one with a list comprehension. For the input below the program prints:

```output
Flat: [1, 2, 3, 4, 5, 6, 7, 8, 9]
Columns: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
Diagonal: [1, 5, 9]
```
%% stdin
3
1 2 3
4 5 6
7 8 9
%% starter
n = int(input())
grid = []
for i in range(n):
    row = []
    for word in input().split():
        row.append(int(word))
    grid.append(row)

# Print the three lines, each one built with a list comprehension.

%% solution
n = int(input())
grid = []
for i in range(n):
    row = []
    for word in input().split():
        row.append(int(word))
    grid.append(row)

print("Flat:", [value for row in grid for value in row])
print("Columns:", [[row[i] for row in grid] for i in range(n)])
print("Diagonal:", [grid[i][i] for i in range(n)])
%% tests
expect_output("Flat: [1, 2, 3, 4, 5, 6, 7, 8, 9]\nColumns: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]\nDiagonal: [1, 5, 9]")
check(rerun("2\n1 2\n3 4").strip() == "Flat: [1, 2, 3, 4]\nColumns: [[1, 3], [2, 4]]\nDiagonal: [1, 4]", "a 2 by 2 grid")
check(rerun("1\n7").strip() == "Flat: [7]\nColumns: [[7]]\nDiagonal: [7]", "a 1 by 1 grid")
import ast
found = 0
for node in ast.walk(ast.parse(source())):
    if isinstance(node, ast.ListComp):
        found += 1
check(found >= 3, "builds the lines with list comprehensions")
%% hint
To flatten, take each row and then each number in it: `[value for row in grid for value in row]`.
%% hint
Column `i` is `[row[i] for row in grid]`. Put that comprehension inside another one that goes through `range(n)`.
%% hint
The diagonal holds the items `grid[0][0]`, `grid[1][1]`, and so on: `[grid[i][i] for i in range(n)]`.
%% end

%% exercise triples | Challenge: Pythagorean triples
A Pythagorean triple is three whole numbers `a`, `b` and `c` with `a <= b <= c` and `a * a + b * b == c * c`. Read a number `n`. Print every triple with `c` up to `n`, one per line as `a b c`, in order of `a`, then `b`, then `c`. The last line is `Triples:` and the number of triples. Make the list with **one list comprehension** that has three `for` clauses and an `if`, and solve the whole task in **at most 6 lines**. For the input `20` the program prints:

```output
3 4 5
5 12 13
6 8 10
8 15 17
9 12 15
12 16 20
Triples: 6
```
%% stdin
20
%% starter
n = int(input())
# One list comprehension makes the triples. Print them, and then the count.

%% solution
n = int(input())
triples = [(a, b, c) for a in range(1, n + 1) for b in range(a, n + 1) for c in range(b, n + 1) if a * a + b * b == c * c]
for a, b, c in triples:
    print(a, b, c)
print(f"Triples: {len(triples)}")
%% tests
expect_output("3 4 5\n5 12 13\n6 8 10\n8 15 17\n9 12 15\n12 16 20\nTriples: 6")
check(rerun("4").strip() == "Triples: 0", "no triples")
check(rerun("5").strip() == "3 4 5\nTriples: 1", "one triple")
check(rerun("30").strip() == "3 4 5\n5 12 13\n6 8 10\n7 24 25\n8 15 17\n9 12 15\n10 24 26\n12 16 20\n15 20 25\n18 24 30\n20 21 29\nTriples: 11", "a bigger limit")
check(uses("ListComp"), "uses a list comprehension")
check(count_lines() <= 6, "at most 6 lines")
%% hint
Start with `a` from 1 up to `n`. Let `b` start at `a`, and let `c` start at `b`, so that `a <= b <= c`. That gives three `for` clauses.
%% hint
Write `(a, b, c)` as the expression, the three `for` clauses with `range(..., n + 1)`, and the test `if a * a + b * b == c * c` at the end.
%% hint
Print the triples with a loop: `for a, b, c in triples:` and `print(a, b, c)`. The count is `len(triples)`.
%% end

%% question q-filter-fill | fill
Fill in the blank so that the program prints `[4, 7]`.

```python
numbers = [4, -1, 7, -3, 0]
print([n for n in numbers ___ n > 0])
```
%% answer
if
%% expected
[4, 7]
%% explain
The keyword `if` at the end of a comprehension is a filter: only the items for which the test is true are kept. The numbers 4 and 7 are greater than zero.
%% end

## What you learned

- A **list comprehension** `[expression for item in sequence]` builds a new list in one expression. An `if` at the **end** filters the items, and an `if ... else` at the **front** chooses a value for each item.
- Several `for` clauses read like nested loops, with the outer loop first. A comprehension inside a comprehension makes a list of lists, for example the columns of a grid.
- **Dictionary** comprehensions `{key: value for ...}` and **set** comprehensions `{expression for ...}` reshape data and remove duplicates. `{}` is an empty dictionary, and `set()` is an empty set.
- A **generator expression** (round brackets) makes values one at a time and can be used only once. It suits `sum`, `max`, `min`, `sorted` and `join`, and it saves memory.
- Use a comprehension for one clear idea. Switch to a loop (or a named helper function) when it is hard to read, when it has side effects such as `print`, or when it repeats work.
