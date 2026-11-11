---
title: Loops inside loops
---
A clock is a loop inside a loop. For every hour that passes, the minute hand goes all the way round once. A calendar works in the same way: every week has seven days. Tables, grids, chessboards and pictures made of characters all have **rows** and **columns**, and a program that draws them needs one loop for the rows and another loop for the columns, placed inside the first.

This lesson shows you how to put one loop inside another, how to work out how often the inner code runs, and how to draw patterns with `print(end="")`.

## A loop inside a loop

The body of a loop can contain any statements, including another loop. Run this program:

```python run
for hour in range(2):
    for minute in range(3):
        print(hour, minute)
```

Six lines appear. The outer loop (`hour`) has two rounds. In **every** round of the outer loop, the inner loop (`minute`) starts again from the beginning and finishes all of its rounds. Step through the program and watch which variable changes faster:

```python trace title="The inner loop moves faster"
for hour in range(2):
    for minute in range(3):
        print(hour, minute)
```

%% key The inner loop restarts every time
The inner loop runs completely, from its first round to its last, once for every round of the outer loop. The outer loop only moves on when the inner loop has finished.
%% end

Each loop needs its own indentation. The inner loop is indented by four spaces, and its body is indented by eight.

## How many times does the inner body run?

If the outer loop has `n` rounds and the inner loop has `m` rounds, the inner body runs `n * m` times. You can check this with a counter:

```python run
count = 0
for a in range(4):
    for b in range(5):
        count += 1
print(count)
```

The answer is 20, which is 4 times 5. This small calculation helps you predict how slow a program will be. A nested loop with 1000 rounds in each loop runs its body a million times.

%% question q-inner-count | choice
How many times does `print("*")` run?

```python
for a in range(3):
    for b in range(4):
        print("*")
```
%% choice
7 times
%% choice correct
12 times
%% choice
4 times
%% choice
3 times
%% explain
The outer loop has 3 rounds. In each of them the inner loop has 4 rounds, so the body runs 3 times 4, which is 12 times.
%% end

## Staying on one line

Normally `print` finishes every message with a new line. To change that, give it the `end` option. Whatever you write in `end` is printed **instead of** the new line:

```python run
for n in range(1, 6):
    print(n, end=" ")
print()
```

The numbers stay on one line, separated by spaces. The empty `print()` after the loop finishes the line. Use `end=""` (an empty string) when you want characters to touch each other.

%% question q-end-fill | fill
Fill in the blank so the program prints `1-2-3-` on one line.

```python
for n in range(1, 4):
    print(n, end=___)
print()
```
%% answer
"-"|'-'
%% expected
1-2-3-
%% explain
The text in `end` is printed after every number instead of the new line, so each number is followed by a dash. The final `print()` only moves the cursor to the next line.
%% end

## Drawing a rectangle

A grid needs one inner loop for the columns and one outer loop for the rows. The inner loop writes one complete row, and then `print()` moves to the next line:

```python run
for row in range(3):
    for column in range(5):
        print("#", end="")
    print()
```

Notice the position of the last line. The `print()` is indented to the level of the **inner** loop, so it runs once per row, after the inner loop has finished. If you indented it one level further, it would run after every `#` and the rectangle would turn into a column.

## Rows that grow

The inner loop does not need a fixed number of rounds. It can depend on the outer variable. In this triangle, row 1 gets one star, row 2 gets two stars, and so on:

```python run
for row in range(1, 6):
    for column in range(row):
        print("*", end="")
    print()
```

Python can also repeat a string for you, so the inner loop can be replaced by one multiplication:

```python run
for row in range(1, 6):
    print("*" * row)
```

A pyramid adds spaces on the left, so that the stars are centred. A row needs `height - row` spaces and `2 * row - 1` stars:

```python run
height = 4
for row in range(1, height + 1):
    spaces = " " * (height - row)
    stars = "*" * (2 * row - 1)
    print(spaces + stars)
```

%% question q-triangle-count | predict
What does this program print?

```python
count = 0
for i in range(5):
    for j in range(i):
        count += 1
print(count)
```
%% answer
10
%% explain
The inner loop runs `i` times, and `i` is 0, 1, 2, 3 and 4 in the five rounds of the outer loop. The body runs 0 + 1 + 2 + 3 + 4 = 10 times.
%% end

## Tables

A multiplication table is a grid in which each cell holds a calculation. The format `:4` from module 2 pads every number to a width of four characters, so the columns line up:

```python run
for row in range(1, 6):
    for column in range(1, 6):
        print(f"{row * column:4}", end="")
    print()
```

Change `range(1, 6)` to `range(1, 11)` in both loops and you have the full 10 by 10 table.

## break and continue inside nested loops

A `break` or a `continue` affects only the **innermost** loop that contains it. The outer loop carries on as if nothing had happened:

```python run
for row in range(1, 4):
    for column in range(1, 4):
        if column == 2:
            break
        print(row, column)
```

Each time the inner loop reaches column 2, it stops. The outer loop then moves to the next row. That is why the output has one line for each row.

%% question q-break-inner | predict
What does this program print?

```python
count = 0
for a in range(3):
    for b in range(5):
        if b == 2:
            break
        count += 1
print(count)
```
%% answer
6
%% explain
In each of the 3 rounds of the outer loop, the inner loop counts for `b` equal to 0 and 1, and then `break` ends it when `b` reaches 2. That is 2 additions per round, so 3 times 2 is 6.
%% end

## All the pairs

Nested loops are also the way to try **every combination** of two things. Here are all the pairs of dice that add up to 7:

```python run
for a in range(1, 7):
    for b in range(1, 7):
        if a + b == 7:
            print(a, "+", b)
```

The inner body runs 36 times, once for each combination of two dice, and the `if` keeps only the six pairs that you want.

## Your turn

%% exercise rectangle | Rectangle
Read the width on the first line and the height on the second line. Print a rectangle made of `#` characters with that many columns and rows. For the input `5` and `3` the program prints:

```output
#####
#####
#####
```
%% stdin
5
3
%% starter
# Read width and height, then draw the rectangle.

%% solution
width = int(input())
height = int(input())
for row in range(height):
    for column in range(width):
        print("#", end="")
    print()
%% tests
expect_output("#####\n#####\n#####")
check(rerun("2\n4").strip() == "##\n##\n##\n##", "2 columns and 4 rows")
check(rerun("1\n1").strip() == "#", "a single square")
check(uses("For"), "uses a for loop")
%% hint
The outer loop counts the rows (the height). The inner loop counts the columns (the width).
%% hint
Inside the inner loop use `print("#", end="")`. After the inner loop, a plain `print()` starts the next row.
%% hint
The last `print()` must be indented to the level of the inner `for`, not further.
%% end

%% exercise triangle | Triangle
Read a whole number `n` and print a triangle of `n` rows. Row number `k` contains `k` stars. For the input `4` the program prints:

```output
*
**
***
****
```
%% stdin
4
%% starter
# Print n rows of stars.

%% solution
n = int(input())
for row in range(1, n + 1):
    for column in range(row):
        print("*", end="")
    print()
%% tests
expect_output("*\n**\n***\n****")
check(rerun("1").strip() == "*", "one row")
check(rerun("6").strip() == "*\n**\n***\n****\n*****\n******", "six rows")
check(uses("For"), "uses a for loop")
%% hint
The rows are numbered from 1 to `n`, so the outer loop is `range(1, n + 1)`.
%% hint
The inner loop runs as many times as the row number.
%% hint
`for column in range(row):` prints one star per round with `end=""`. Finish the row with `print()`.
%% end

%% exercise grid-table | Number grid
Read a whole number `n` and print an `n` by `n` multiplication table. Each row is a line of numbers separated by spaces. A space at the end of a line is fine. For the input `3` the program prints:

```output
1 2 3
2 4 6
3 6 9
```
%% stdin
3
%% starter
# Print the n by n table.

%% solution
n = int(input())
for row in range(1, n + 1):
    for column in range(1, n + 1):
        print(row * column, end=" ")
    print()
%% tests
check([line.split() for line in rerun("3").strip().splitlines()] == [["1", "2", "3"], ["2", "4", "6"], ["3", "6", "9"]], "the 3 by 3 table")
check([line.split() for line in rerun("4").strip().splitlines()] == [["1", "2", "3", "4"], ["2", "4", "6", "8"], ["3", "6", "9", "12"], ["4", "8", "12", "16"]], "the 4 by 4 table")
check(uses("For"), "uses for loops")
%% hint
Each cell holds `row * column`. You need one loop for the rows and one for the columns.
%% hint
Both loops run from 1 to `n`, so use `range(1, n + 1)` twice.
%% hint
Print each cell with `print(row * column, end=" ")` and finish each row with `print()`.
%% end

%% exercise dice-pairs | Challenge: Dice pairs
Read a whole number `target`. Print every pair of two dice (each from 1 to 6) whose sum is the target, one pair per line in the form `a + b`, in order of the first die. For the input `7` the program prints:

```output
1 + 6
2 + 5
3 + 4
4 + 3
5 + 2
6 + 1
```
%% stdin
7
%% starter
# Try every pair of dice.

%% solution
target = int(input())
for a in range(1, 7):
    for b in range(1, 7):
        if a + b == target:
            print(a, "+", b)
%% tests
expect_output("1 + 6\n2 + 5\n3 + 4\n4 + 3\n5 + 2\n6 + 1")
check(rerun("12").strip() == "6 + 6", "only one way to make 12")
check(rerun("2").strip() == "1 + 1", "only one way to make 2")
check(rerun("13").strip() == "", "no pair makes 13")
check(uses("For"), "uses for loops")
%% hint
Use two nested loops, each running over the numbers 1 to 6.
%% hint
Inside the inner loop, test `a + b == target` with an `if`.
%% hint
`print(a, "+", b)` gives the right format, because `print` separates its values with spaces.
%% end

## What you learned

- A loop can contain another loop. The inner loop restarts and finishes all of its rounds for every round of the outer loop.
- An inner body runs `n * m` times when the loops have `n` and `m` rounds. A triangle is the case in which the inner count depends on the outer variable.
- `print(x, end="")` keeps the output on the same line. An empty `print()` after the inner loop ends each row.
- Rows and columns need one loop each. Strings can be repeated with `*`, for example `"*" * 5`, and `f"{value:4}"` lines up columns.
- `break` and `continue` only affect the innermost loop.
- Nested loops try every combination of two things, such as all the pairs of dice.
