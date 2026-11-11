---
title: for loops and range()
---
Imagine you have to print the message `Well done!` one thousand times. Without loops you would write one thousand lines, and changing the message later would mean editing all of them. Computers are very good at repeating work, and a **loop** is how you ask Python to do it. In this lesson you meet the `for` loop, which repeats a block of code a number of times that you know in advance.

By the end you will be able to count, to add up numbers, to step through a piece of text one letter at a time, and to avoid the most famous loop mistake in programming: the off-by-one error.

## Repeating a block

Here is the smallest useful loop. Run it:

```python run
for i in range(3):
    print("Hello!")
```

The message appears three times. The first line of a loop has four parts:

- `for` starts the loop.
- `i` is the **loop variable**. Python gives it a new value in every round.
- `in range(3)` says how many rounds there are and which values `i` takes.
- The colon `:` ends the line. The **indented block** underneath is the body that is repeated, in the same way as the block of an `if`.

## The loop variable

Before each round, Python puts the next number into `i`. Print `i` to see the numbers:

```python run
for i in range(5):
    print(i)
```

The output is 0, 1, 2, 3 and 4. Two facts are worth remembering. Counting starts at **0**, because that is how Python counts everything, and `range(5)` stops **before** 5, which gives exactly five numbers. Step through a loop to watch the variable change:

```python trace title="Follow the loop variable"
for i in range(3):
    print("Round", i)
print("Done")
```

When the numbers run out, Python moves on to the first line after the loop. That line is not indented, so it runs once.

The loop variable is an ordinary variable, so you can use it in calculations:

```python run
for i in range(5):
    print(i, "times 3 is", i * 3)
```

## Choosing where to start and stop

`range` accepts up to three numbers:

| Call | Numbers produced |
| --- | --- |
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(2, 6)` | 2, 3, 4, 5 |
| `range(0, 10, 2)` | 0, 2, 4, 6, 8 |
| `range(5, 0, -1)` | 5, 4, 3, 2, 1 |

With two numbers, the first is where counting **starts** and the second is where it **stops**. The stop number is never included. With three numbers, the last one is the **step**, the amount added in every round. A negative step counts down, and then the start has to be bigger than the stop.

```python run
for n in range(1, 6):
    print(n, "x 7 =", n * 7)
```

```python run
for n in range(5, 0, -1):
    print(n)
print("Lift off!")
```

%% question q-range-count | choice
How many times does the body of `for i in range(2, 7):` run?
%% choice
7 times
%% choice
6 times
%% choice correct
5 times
%% choice
2 times
%% explain
The loop takes the values 2, 3, 4, 5 and 6, because the stop number 7 is never included. For a step of 1, the number of rounds is the stop number minus the start number: 7 - 2 = 5.
%% end

## Looping over text

A string is a row of characters, and a `for` loop can visit them one by one. The loop variable takes each character in turn:

```python run
for letter in "Python":
    print(letter.upper())
```

There is no `range` here, because the text itself says how many rounds there are: one for each character. You can use this to count the letters of a word yourself:

```python run
count = 0
for letter in "banana":
    count += 1
print("banana has", count, "letters")
```

%% question q-count-letters | predict
What does this program print?

```python
count = 0
for letter in "hello":
    if letter == "l":
        count += 1
print(count)
```
%% answer
2
%% explain
The loop visits `h`, `e`, `l`, `l` and `o`. The `if` is true for the two letters `l`, so `count` goes up twice and the program prints 2.
%% end

## Adding things up: the accumulator

Many loops build up an answer. The recipe has three steps: **start** with a value before the loop, **update** it inside the loop, and **use** it after the loop. A variable that collects a result like this is called an **accumulator**.

```python run
total = 0
for i in range(1, 6):
    total += i
print("1 + 2 + 3 + 4 + 5 =", total)
```

Step through a shorter version to watch the total grow:

```python trace title="Watch the total grow"
total = 0
for i in range(1, 5):
    total += i
print(total)
```

The accumulator is created **before** the loop. If you wrote `total = 0` inside the loop, it would reset to zero in every round, and you would only see the last value.

%% warn Start the accumulator outside the loop
A line such as `total = 0` belongs above the `for`. Inside the loop it would wipe out the running total in every round.
%% end

Python has a built-in shortcut for adding numbers: `sum()`. Give it a range and it adds the whole range:

```python run
print(sum(range(1, 101)))
```

The answer, 5050, is the sum that the young mathematician Carl Gauss is said to have worked out in his head at school. You will often write the loop by hand, because it lets you do more than add.

%% question q-sum-fill | fill
Fill in the blank so the program prints `15`.

```python
total = 0
for i in range(1, ___):
    total += i
print(total)
```
%% answer
6
%% expected
15
%% explain
The loop must add 1, 2, 3, 4 and 5, which gives 15. The stop number is never included, so the stop has to be 6.
%% end

## A name for rounds you do not count

Sometimes you repeat something and do not care about the number of the round. By tradition, programmers then name the loop variable `_` (an underscore), which tells the reader "I am not using this":

```python run
for _ in range(3):
    print("Hip hip hooray!")
```

## Off by one

The most common loop mistake is a loop that runs one time too many or one time too few. Suppose you want to print the numbers 1 to 10:

```python run
for n in range(1, 10):
    print(n)
```

The output stops at 9, because the stop number is never included. The correct call is `range(1, 11)`. Remember this habit: to count from `a` to `b` **including** both ends, write `range(a, b + 1)`. When a loop misbehaves, work out the first round and the last round on paper before you change anything.

## When things go wrong

The numbers in `range()` must be whole numbers. A float causes an error:

```python run error
for i in range(2.5):
    print(i)
```

Python reports a TypeError. If a calculation produces a float, convert it with `int()` or use whole-number division `//` before you give it to `range`. A loop also needs its colon and its indentation, like an `if`:

```python run error
for i in range(3):
print(i)
```

## Your turn

%% exercise countdown | Countdown
Read a whole number `n` that is at least 1. Print the numbers from `n` down to 1, each on its own line, and then print `Lift off!`. For the input `3` the program prints:

```output
3
2
1
Lift off!
```
%% stdin
3
%% starter
# Count down from n to 1, then print Lift off!

%% solution
n = int(input())
for i in range(n, 0, -1):
    print(i)
print("Lift off!")
%% tests
expect_output("3\n2\n1\nLift off!")
check(rerun("1").strip() == "1\nLift off!", "a countdown from 1")
check(rerun("5").strip() == "5\n4\n3\n2\n1\nLift off!", "a countdown from 5")
check(uses("For"), "uses a for loop")
%% hint
Convert the input with `int()`, then use `range` with a negative step.
%% hint
The loop must start at `n` and stop **after** 1. Because the stop number is never included, the stop is 0.
%% hint
`for i in range(n, 0, -1):` with `print(i)` inside, then `print("Lift off!")` outside the loop.
%% end

%% exercise times-table | Times table
Read a whole number and print its multiplication table from 1 to 10, one line per row, in the form `3 x 4 = 12`. For the input `3` the program prints:

```output
3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27
3 x 10 = 30
```
%% stdin
3
%% starter
# Print the table for the number that was read.

%% solution
n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")
%% tests
expect_output("\n".join(f"3 x {i} = {3 * i}" for i in range(1, 11)))
check(rerun("12").strip() == "\n".join(f"12 x {i} = {12 * i}" for i in range(1, 11)), "the table for 12")
check(uses("For"), "uses a for loop")
%% hint
The loop variable must go from 1 to 10 **including** 10.
%% hint
Use `range(1, 11)`. Inside the loop build one line of the table with an f-string.
%% hint
`print(f"{n} x {i} = {n * i}")`
%% end

%% exercise sum-to-n | Sum to n
Read a whole number `n` that is at least 1 and print the sum 1 + 2 + 3 + ... + n. Use a loop and an accumulator. For the input `10` the program prints:

```output
55
```
%% stdin
10
%% starter
# Add up the numbers from 1 to n.

%% solution
n = int(input())
total = 0
for i in range(1, n + 1):
    total += i
print(total)
%% tests
expect_output("55")
check(rerun("1").strip() == "1", "the sum for 1")
check(rerun("100").strip() == "5050", "the sum for 100")
check(uses("For"), "uses a for loop")
%% hint
Start an accumulator called `total` at 0 before the loop.
%% hint
The loop has to include `n` itself, so the stop number is `n + 1`.
%% hint
Inside the loop write `total += i`, and print `total` after the loop.
%% end

%% exercise word-ladder | Challenge: Word ladder
Read a word and print it growing one letter at a time, one line per step. For the input `cat` the program prints:

```output
c
ca
cat
```
%% stdin
cat
%% starter
# Print the first letter, then the first two letters, and so on.

%% solution
word = input()
for i in range(1, len(word) + 1):
    print(word[:i])
%% tests
expect_output("c\nca\ncat")
check(rerun("Python").strip() == "P\nPy\nPyt\nPyth\nPytho\nPython", "the word Python")
check(rerun("a").strip() == "a", "a one-letter word")
%% hint
The number of lines equals the length of the word. `len(word)` gives that length.
%% hint
On line number `i` print the first `i` letters. A slice `word[:i]` gives them.
%% hint
Loop with `range(1, len(word) + 1)` and print `word[:i]` in the body.
%% end

## What you learned

- `for variable in range(...)` repeats an indented block. The loop variable takes a new value in every round.
- `range(stop)` counts from 0 to stop - 1. `range(start, stop)` begins at `start`. `range(start, stop, step)` adds `step` each time, and a negative step counts down. The stop number is never included.
- A `for` loop can also step through the characters of a string.
- An accumulator is a variable that is created before the loop and updated inside it, such as `total += i`. `sum(range(...))` is a shortcut for adding a range.
- Use `_` as the loop variable when you do not need the number.
- Off-by-one mistakes come from the excluded stop number. To include `b`, use `range(a, b + 1)`.
