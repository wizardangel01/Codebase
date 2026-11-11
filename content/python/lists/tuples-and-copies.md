---
title: Tuples, copies and nested lists
---
Lists can change, and that is wonderful until it surprises you. This lesson covers three ideas that come from that fact. A **tuple** is a list-like value that cannot change, which makes it ideal for a group of values that belong together, such as a point on a map. **Aliasing** is what happens when two names refer to one list, and it explains the strangest bugs that beginners meet. And a list can hold other lists, which gives you tables and grids.

## Tuples

A tuple is written with round brackets. It is ordered like a list, and you read it with the same indexes, but it is **immutable**, so it can never be changed after it is created:

```python run
point = (3, 4)
print(point)
print(point[0], point[1])
print(len(point))
print(point + (5,))
```

The brackets are optional when the meaning is clear, so `point = 3, 4` creates the same tuple. A tuple with **one** item needs a comma, because brackets alone are only used for grouping, as in `(2 + 3) * 4`:

```python run
print(type((5)))
print(type((5,)))
```

Trying to change a tuple is an error:

```python run error
point = (3, 4)
point[0] = 10
```

%% question q-tuple-choice | choice
Which line creates a tuple with a single item?
%% choice
`x = (5)`
%% choice correct
`x = (5,)`
%% choice
`x = [5]`
%% choice
`x = 5`
%% explain
A comma is what makes a tuple. `(5)` is only the number 5 in brackets, `[5]` is a list, and `5` is a plain number. `(5,)` is a tuple that holds one item.
%% end

## Unpacking

You can pull a tuple apart into separate variables in one line. This is called **unpacking**, and the number of names on the left must match the number of items:

```python run
point = (3, 4)
x, y = point
print(x, y)
name, age, score = ("Ada", 17, 91.5)
print(name, "is", age, "and scored", score)
```

If the numbers do not match, Python stops with a ValueError:

```python run error
a, b = (1, 2, 3)
```

A name with a star in front takes **all the remaining items** as a list. It works for lists as well as tuples:

```python run
first, *rest = [10, 20, 30, 40]
print(first)
print(rest)
*start, last = [10, 20, 30, 40]
print(start, last)
```

The swap that you used in module 2 is unpacking too. The right side `b, a` is a tuple that is built first, and then it is unpacked into `a, b`:

```python run
a, b = 1, 2
a, b = b, a
print(a, b)
```

You have already met tuples without knowing it. `enumerate` and `zip` hand you one tuple in every round of a loop, and the loop line unpacks it:

```python run
for pair in enumerate(["a", "b"]):
    print(pair)
```

%% question q-unpack-fill | fill
Fill in the blank so that the program prints `[2, 3, 4]`.

```python
first, ___ = [1, 2, 3, 4]
print(rest)
```
%% answer
*rest
%% expected
[2, 3, 4]
%% explain
The star collects everything that is left after `first` has taken the first item, and it always gives a list. So `rest` is `[2, 3, 4]`.
%% end

## Tuples as records

A tuple is a good **record**: a fixed group of values about one thing. A list of tuples is a small table:

```python run
players = [("Ada", 91), ("Grace", 85), ("Linus", 70)]
for name, score in players:
    print(name, score)
best = players[0]
print(best[1])
```

Tuples are also how Python gives back more than one answer. The built-in `divmod` returns the quotient and the remainder together, and you unpack them at once. Later in the course you will write your own functions that do the same:

```python run
quotient, remainder = divmod(17, 5)
print(quotient, remainder)
```

## Two names, one list

Now for the idea that surprises everyone. Assigning a list to another variable does **not** copy the list:

```python run
a = [1, 2, 3]
b = a
b.append(4)
print(a)
print(b)
```

The list `a` changed, although only `b` was used. The assignment `b = a` gives the same list a second name, like two labels stuck on one box:

```text
a --\
     +--> [1, 2, 3, 4]
b --/
```

This is called **aliasing**. Numbers and strings do not show the effect, because they cannot be changed in place, so `y = x` followed by `y += 1` leaves `x` alone. Lists can be changed in place, so every name that refers to the list sees the change.

%% question q-alias-predict | predict
What does this program print?

```python
a = [1, 2]
b = a
b[0] = 99
print(a)
```
%% answer
[99, 2]
%% explain
`b = a` does not copy the list, so `a` and `b` are two names for one list. Changing item 0 through `b` changes the list that `a` also refers to.
%% end

## Making a real copy

To get an independent list, copy it. There are three common ways, and they all do the same job:

```python run
a = [1, 2, 3]
b = a.copy()
c = a[:]
d = list(a)
b.append(4)
c.append(5)
d.append(6)
print(a)
print(b, c, d)
```

Now each name has its own list, and the original is untouched. Copy a list whenever a function or a loop will change it and you still need the original afterwards.

## Lists of lists

A list can hold lists. A list of rows is the natural way to store a table, a game board or an image. Read an item with **two** indexes: the row first, then the column:

```python run
grid = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
print(grid[1])
print(grid[1][2])
grid[0][0] = 100
print(grid[0])
```

A nested loop visits every cell. The outer loop takes one row after another, and the inner loop takes the values of that row:

```python run
grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
total = 0
for row in grid:
    for value in row:
        total += value
print(total)
```

## When a copy is not deep enough

The copy methods above copy only the **outer** list. The inner lists are still shared, which is called a **shallow copy**:

```python run
grid = [[1, 2], [3, 4]]
duplicate = grid.copy()
duplicate[0][0] = 99
print(grid)
print(duplicate)
```

Both grids changed, because the two outer lists hold the very same inner lists. To copy every level you can build new inner lists with a loop. The standard library also offers `copy.deepcopy(grid)`, which does it for you. You will meet imports in more detail later in the course.

## The trap in [[0] * 3] * 3

Here is the mistake that most people make with grids at least once. The star operator repeats **the same inner list**:

```python run
board = [[0] * 3] * 3
board[0][0] = 1
print(board)
```

All three rows changed, because the board holds three references to one row. Build a separate row in every round of a loop instead:

```python run
board = []
for _ in range(3):
    board.append([0] * 3)
board[0][0] = 1
print(board)
```

The repeated list `[0] * 3` is fine inside the loop, because it creates a brand new list on each round. The star is only a problem when it repeats a list that holds lists.

%% question q-board-trap | predict
What does this program print?

```python
board = [[0] * 2] * 2
board[1][1] = 7
print(board)
```
%% answer
[[0, 7], [0, 7]]
%% explain
The outer star repeats a reference to the same inner list, so both rows are one list. Setting item 1 of the second row changes the shared row, and both rows show the change.
%% end

## Your turn

%% exercise swap-ends | Swap the ends
Read one line of words separated by spaces. Swap the first and the last word, and print the list. For the input `a b c d` the program prints:

```output
['d', 'b', 'c', 'a']
```
%% stdin
a b c d
%% starter
# Split the line, swap the ends with unpacking, print.

%% solution
words = input().split()
words[0], words[-1] = words[-1], words[0]
print(words)
%% tests
expect_output("['d', 'b', 'c', 'a']")
check(rerun("x y").strip() == "['y', 'x']", "two words")
check(rerun("solo").strip() == "['solo']", "one word stays as it is")
check(rerun("1 2 3").strip() == "['3', '2', '1']", "three words")
%% hint
Index 0 is the first word and index -1 is the last one.
%% hint
A swap needs no extra variable: `a, b = b, a` swaps two names.
%% hint
`words[0], words[-1] = words[-1], words[0]`
%% end

%% exercise backup-list | Backup copy
The list `scores` is set up for you. Make an independent copy called `backup`, then add 100 to the end of `scores` only. Print `scores` and then `backup`. The program must print:

```output
[10, 20, 30, 100]
[10, 20, 30]
```
%% starter
scores = [10, 20, 30]
# Make backup, change scores, print both.

%% solution
scores = [10, 20, 30]
backup = scores.copy()
scores.append(100)
print(scores)
print(backup)
%% tests
expect_output("[10, 20, 30, 100]\n[10, 20, 30]")
check(ns["scores"] == [10, 20, 30, 100], "scores has the new item")
check(ns["backup"] == [10, 20, 30], "backup keeps the old values")
check(ns["backup"] is not ns["scores"], "backup is a separate list")
%% hint
`backup = scores` is not a copy. It gives the same list a second name.
%% hint
Use `scores.copy()`, or `scores[:]`, or `list(scores)`.
%% hint
Make the copy **before** you append to `scores`.
%% end

%% exercise grid-sums | Grid sums
Read three lines of three whole numbers each. Print the sum of the main diagonal (the top left, the middle and the bottom right cell) and then the sum of every cell. For the input `1 2 3`, `4 5 6` and `7 8 9` the program prints:

```output
Diagonal: 15
Total: 45
```
%% stdin
1 2 3
4 5 6
7 8 9
%% starter
# Build the grid as a list of lists of numbers.

%% solution
grid = []
for _ in range(3):
    row = []
    for text in input().split():
        row.append(int(text))
    grid.append(row)
diagonal = grid[0][0] + grid[1][1] + grid[2][2]
total = 0
for row in grid:
    total += sum(row)
print("Diagonal:", diagonal)
print("Total:", total)
%% tests
expect_output("Diagonal: 15\nTotal: 45")
check(rerun("2 0 0\n0 3 0\n0 0 4").strip() == "Diagonal: 9\nTotal: 9", "a diagonal grid")
check(rerun("1 1 1\n1 1 1\n1 1 1").strip() == "Diagonal: 3\nTotal: 9", "all ones")
%% hint
Build one row at a time: split the line, convert every word with `int()`, then append the row to the grid.
%% hint
The diagonal cells are `grid[0][0]`, `grid[1][1]` and `grid[2][2]`.
%% hint
`sum(row)` adds up one row. A loop over the rows adds the rows together.
%% end

%% exercise transpose | Challenge: Transpose
Read two lines of three words each (a grid with 2 rows and 3 columns). Print the **transposed** grid: 3 lines with 2 words each, separated by a space. The first line holds the first column, and so on. For the input `1 2 3` and `4 5 6` the program prints:

```output
1 4
2 5
3 6
```
%% stdin
1 2 3
4 5 6
%% starter
# Read the two rows, then print the columns.

%% solution
grid = []
for _ in range(2):
    grid.append(input().split())
for col in range(3):
    line = []
    for row in grid:
        line.append(row[col])
    print(" ".join(line))
%% tests
expect_output("1 4\n2 5\n3 6")
check(rerun("a b c\nd e f").strip() == "a d\nb e\nc f", "letters instead of numbers")
check(rerun("x x x\ny y y").strip() == "x y\nx y\nx y", "repeated values")
%% hint
Store the two rows in a list of lists. Every row is the result of `input().split()`.
%% hint
Loop over the column numbers `0`, `1` and `2`. For each column, collect `row[col]` from every row.
%% hint
Finish each output line with `" ".join(line)`.
%% end

## What you learned

- A tuple is an immutable list-like value, written `(3, 4)`. A tuple with one item needs a comma: `(5,)`.
- Unpacking assigns the items of a tuple or list to several names: `x, y = point`. A starred name, as in `first, *rest = items`, collects what is left.
- Swapping `a, b = b, a` is unpacking, and `enumerate`, `zip` and `divmod` give you tuples.
- `b = a` does not copy a list, it gives the same list a second name (aliasing). Make a real copy with `a.copy()`, `a[:]` or `list(a)`.
- A list of lists is a grid, read as `grid[row][col]`. A nested loop visits every cell.
- A copy of a nested list is shallow: the inner lists are shared. `[[0] * 3] * 3` repeats one row three times, so build the rows in a loop.
