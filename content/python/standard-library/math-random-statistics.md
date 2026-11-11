---
title: Numbers: math, random and statistics
---
Python's built-in arithmetic (`+`, `-`, `*`, `/`, `**`, `round`, `sum`, `min`, `max`) covers a lot, and then you need more: a square root, a random card, the average of a thousand measurements. Three modules of the standard library cover most of what comes next. `math` has the mathematical functions, `random` makes chance, and `statistics` summarises data. A fourth part of this lesson, `decimal` and `fractions`, is about numbers that must be **exact**.

## The math module

```python run
import math

print(math.sqrt(144), math.pi)
print(math.floor(2.7), math.ceil(2.1), math.trunc(-2.7))
print(math.floor(-2.5), math.ceil(-2.5), round(2.5), round(3.5))
print(math.gcd(12, 18), math.factorial(5), math.comb(5, 2))
```

The module has more than fifty functions. These are the ones that you will meet most often:

| Name | What it gives |
| --- | --- |
| `math.sqrt(x)` | the square root, always a float |
| `math.floor(x)`, `math.ceil(x)` | round down, round up (toward minus and plus infinity) |
| `math.trunc(x)` | cut off the decimals (toward zero) |
| `math.gcd(a, b)`, `math.lcm(a, b)` | greatest common divisor, least common multiple |
| `math.factorial(n)` | 1 times 2 times ... times n |
| `math.comb(n, k)`, `math.perm(n, k)` | ways to pick k of n things, when the order does not matter, and when it does |
| `math.hypot(a, b)` | the length of the longest side of a right triangle |
| `math.log(x)`, `math.log10(x)`, `math.log2(x)` | natural, base-10 and base-2 logarithms |
| `math.sin`, `math.cos`, `math.tan` and `math.atan` | trigonometry, with angles in **radians** |
| `math.radians(d)`, `math.degrees(r)` | convert between degrees and radians |
| `math.pi`, `math.e`, `math.inf`, `math.nan` | constants, including infinity and "not a number" |
| `math.isclose(a, b)` | are two floats equal, apart from rounding error? |

Compare the four ways of rounding in the example above. For `-2.5`, `floor` gives `-3` and `ceil` gives `-2`, and `trunc(-2.7)` gives `-2`. The built-in `round` goes to the nearest whole number, and a tie goes to the **even** neighbour: `round(2.5)` is `2`, and `round(3.5)` is `4`.

A function refuses an input that has no answer, with a `ValueError`. The error says that the number is outside the domain of the function:

```python run error
import math

print(math.sqrt(16))
print(math.sqrt(-1))
```

## Comparing floats

You met this surprise in module 2: floats are stored in binary, and most decimal fractions cannot be stored exactly. The tiny errors make `==` unreliable for floats. `math.isclose` compares with a small tolerance instead:

```python run
import math

angle = math.radians(30)
print(math.sin(angle))
print(math.sin(angle) == 0.5)
print(math.isclose(math.sin(angle), 0.5))
print(0.1 + 0.2 == 0.3, math.isclose(0.1 + 0.2, 0.3))
print(math.degrees(math.pi), math.log(math.e), math.log10(1000), math.log2(8))
```

The sine of 30 degrees is exactly one half in mathematics, and `0.49999999999999994` in the computer. Whenever you compare the **results of calculations** with floats, use `math.isclose`, or take the absolute difference of the two numbers and compare it with a small limit.

%% question q-round-predict | predict
What does this program print?

```python
import math

print(math.floor(-2.5), math.ceil(2.1), round(2.5), int(-2.7))
```
%% answer
-3 3 2 -2
%% explain
`floor` rounds toward minus infinity, so `-2.5` becomes `-3`. `ceil` rounds up, so `2.1` becomes `3`. The built-in `round` sends the tie `2.5` to the even neighbour `2`. And `int` cuts off the decimals of `-2.7`, which gives `-2`.
%% end

%% question q-isclose-fill | fill
Fill in the blank so that the program prints `True`.

```python
import math

print(math.___(0.1 + 0.2, 0.3))
```
%% answer
isclose
%% expected
True
%% explain
`0.1 + 0.2` is `0.30000000000000004` in floating point, so `==` would give `False`. The function `math.isclose` accepts a tiny difference and gives `True`.
%% end

## The random module

The `random` module makes numbers that look random. They come from a formula, so they are **pseudo-random**, which is perfect for games, simulations and tests, and not good enough for passwords (the module `secrets` is made for those). Here are the functions that you will use:

| Name | What it gives |
| --- | --- |
| `random.random()` | a float from 0 up to, but not including, 1 |
| `random.uniform(a, b)` | a float between `a` and `b` |
| `random.randint(a, b)` | a whole number from `a` to `b`, **both ends included** |
| `random.randrange(start, stop)` | like `range`: the stop is **not** included |
| `random.choice(items)` | one item of a list, chosen at random |
| `random.choices(items, k=n)` | `n` items **with** replacement, so repeats are possible |
| `random.sample(items, n)` | `n` **different** items |
| `random.shuffle(items)` | puts a list in a random order, **in place**, and returns `None` |
| `random.seed(n)` | restarts the generator at a fixed point |

```python run
import random

random.seed(42)
print(random.randint(1, 6))
print(random.choice(["rock", "paper", "scissors"]))
print(random.random() < 1)
cards = ["A", "K", "Q", "J"]
random.shuffle(cards)
print(cards)
print(random.sample(range(1, 50), 6))
print(random.choices(["H", "T"], k=5))
```

The numbers that you see come from the **seed**. Starting the generator with the same seed gives the same numbers in the same order, which is how a program with chance can still be tested:

```python run
import random

random.seed(10)
first = [random.randint(1, 100), random.randint(1, 100), random.randint(1, 100)]
random.seed(10)
second = [random.randint(1, 100), random.randint(1, 100), random.randint(1, 100)]
print(first == second)
print(first)
```

Without a call to `random.seed`, Python starts from a different point each time, and every run is different. A very common mistake is to use the result of `shuffle`. The function changes the list itself, and it returns `None`:

```python run
import random

cards = ["A", "K", "Q"]
result = random.shuffle(cards)
print(result)
print(len(cards))
```

%% question q-randint-choice | choice
Which call can return the number 6?
%% choice
`random.randrange(1, 6)`
%% choice correct
`random.randint(1, 6)`
%% choice
`random.sample(range(1, 6), 1)`
%% choice
`random.uniform(1, 6)` always returns a whole number
%% explain
`randint` includes **both** ends, so it can return 1 and 6. `randrange` works like `range`, and `range(1, 6)` stops at 5. The values of `uniform` are floats, and a float such as `5.7` is not a whole number.
%% end

%% question q-seed-predict | predict
What does this program print?

```python
import random

random.seed(5)
a = [random.randint(1, 100), random.randint(1, 100)]
random.seed(5)
b = [random.randint(1, 100), random.randint(1, 100)]
print(a == b)
```
%% answer
True
%% explain
Starting from the same seed gives the same sequence of numbers, so both lists hold the same two values. That is what a seed is for: it makes "random" behaviour repeatable.
%% end

## The statistics module

When you have a list of measurements, you want to summarise it. The `statistics` module has the usual summaries, and each one is a single function call:

```python run
import statistics

scores = [72, 85, 90, 85, 60, 98, 85]
print(statistics.mean(scores))
print(statistics.median(scores))
print(statistics.mode(scores))
print(round(statistics.stdev(scores), 2))
print(round(statistics.pstdev(scores), 2))
print(statistics.median([7, 1, 5, 3]))
print(statistics.multimode([1, 1, 2, 2, 3]))
```

- `mean(data)` is the **average**: the sum divided by the count.
- `median(data)` is the **middle** value of the sorted data. With an even count, it is the average of the two middle values.
- `mode(data)` is the **most common** value, and `multimode(data)` gives a list of all values that share the highest count. It also works for text.
- `stdev(data)` measures the **spread**: roughly how far the values are from the mean. It is the *sample* standard deviation, for data that is a sample of something bigger. `pstdev(data)` is the *population* version, for data that is everything.

The mean and the median can tell different stories. One extreme value drags the mean along, and hardly moves the median:

```python run
import statistics

salaries = [1, 2, 3, 4, 100]
print(statistics.mean(salaries))
print(statistics.median(salaries))
```

The functions refuse data that is too small to summarise. They raise `StatisticsError`, which is a kind of `ValueError`, so you can handle it with the `try` and `except` of module 9:

```python run
import statistics

for data in [[4, 8], [5], []]:
    try:
        print(round(statistics.stdev(data), 4))
    except statistics.StatisticsError as e:
        print("Error:", e)
```

%% question q-stats-predict | predict
What does this program print?

```python
import statistics

print(statistics.median([7, 1, 5, 3]), statistics.mean([1, 2, 3, 4]), statistics.mode(["a", "b", "a"]))
```
%% answer
4.0 2.5 a
%% explain
The sorted data `[1, 3, 5, 7]` has two middle values, 3 and 5, and their average is `4.0`. The mean of 1, 2, 3 and 4 is `10 / 4`, which is `2.5`. The text `"a"` appears twice, so it is the mode.
%% end

## Exact numbers: decimal and fractions

Floats are fast, and they are approximate. For **money**, where a cent must never vanish, use `Decimal`. For exact **ratios**, use `Fraction`. Both live in modules of their own:

```python run
from decimal import Decimal
from fractions import Fraction

print(0.1 + 0.2)
print(Decimal("0.1") + Decimal("0.2"))
print(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))
print(Fraction(1, 3) + Fraction(1, 6))
print(Fraction(3, 4) * 2, float(Fraction(1, 8)))

price = Decimal("19.99")
total = price * 3
print(total, total.quantize(Decimal("0.1")))
```

Create a `Decimal` from a **string**, as in `Decimal("0.1")`. If you write `Decimal(0.1)`, the float error is copied into the decimal. The method `quantize` rounds to the pattern that you give, so `Decimal("0.01")` means cents. A `Decimal` and a float cannot be added together, because Python refuses to guess how to mix exact and approximate numbers. Convert one of them first.

## A project: estimating pi by chance

A throw of a dart at a square with a quarter circle inside it lands inside the circle with a probability of pi divided by four. So the share of random points that land inside, times four, estimates pi. The program uses all three modules: `random` for the points, `math` for the distance, and `statistics` to summarise ten runs:

```python run
import math
import random
import statistics

random.seed(2026)

def estimate_pi(points):
    inside = 0
    for i in range(points):
        x = random.random()
        y = random.random()
        if math.hypot(x, y) <= 1:
            inside += 1
    return 4 * inside / points

for points in [100, 1000, 10000, 100000]:
    estimate = estimate_pi(points)
    error = abs(estimate - math.pi)
    print(f"{points:>6} points: {estimate:.4f} (error {error:.4f})")

runs = []
for i in range(10):
    runs.append(estimate_pi(2000))
print(f"mean of 10 runs: {statistics.mean(runs):.4f}")
print(f"spread (stdev):  {statistics.stdev(runs):.4f}")
```

More points give a better estimate **in general**, but the error of one run can still go up and down. Change the seed, run it again, and see the spread. The `stdev` of the ten runs tells you how much a single run is worth.

## Your turn

%% exercise hypotenuse | Right triangle
Read two numbers on one line: the lengths of the two short sides of a right triangle. Print the length of the long side (the hypotenuse) with two decimals, and the angle between the first short side and the hypotenuse in degrees with one decimal. Use the `math` module. For the input `3 4` the program prints:

```output
Hypotenuse: 5.00
Angle: 53.1 degrees
```
%% stdin
3 4
%% starter
import math

# Read the two sides, then print the hypotenuse and the angle.

%% solution
import math

a, b = input().split()
a = float(a)
b = float(b)
print(f"Hypotenuse: {math.hypot(a, b):.2f}")
print(f"Angle: {math.degrees(math.atan(b / a)):.1f} degrees")
%% tests
expect_output("Hypotenuse: 5.00\nAngle: 53.1 degrees")
check(calls("hypot") or "sqrt" in source(), "uses math.hypot or math.sqrt")
check(rerun("5 12").strip() == "Hypotenuse: 13.00\nAngle: 67.4 degrees", "another triangle")
check(rerun("1 1").strip() == "Hypotenuse: 1.41\nAngle: 45.0 degrees", "equal sides")
%% hint
Split the line, and convert both parts with `float`.
%% hint
`math.hypot(a, b)` gives the long side. The angle is `math.atan(b / a)`, and it is in radians.
%% hint
`math.degrees(...)` converts radians to degrees. Format with `:.2f` and `:.1f`.
%% end

%% exercise seeded-dice | Repeatable dice
Read two lines: a **seed** and a number of rolls. Call `random.seed(seed)`, then roll that many dice with `random.randint(1, 6)`, one after the other. Print the rolls on one line, separated by spaces, and then the mean of the rolls with two decimals, using `statistics.mean`. For the input below the program prints:

```output
3 2 4 6 1
Mean: 3.20
```
%% stdin
7
5
%% starter
import random
import statistics

# Read the seed and the number of rolls.

%% solution
import random
import statistics

seed = int(input())
count = int(input())
random.seed(seed)
rolls = []
words = []
for i in range(count):
    roll = random.randint(1, 6)
    rolls.append(roll)
    words.append(str(roll))
print(" ".join(words))
print(f"Mean: {statistics.mean(rolls):.2f}")
%% tests
expect_output("3 2 4 6 1\nMean: 3.20")
import random, statistics
random.seed(11)
expected_rolls = []
words = []
for i in range(4):
    roll = random.randint(1, 6)
    expected_rolls.append(roll)
    words.append(str(roll))
want = " ".join(words) + "\nMean: " + format(statistics.mean(expected_rolls), ".2f")
check(rerun("11\n4").strip() == want, "the same seed gives the same rolls")
check(calls("seed"), "calls random.seed")
%% hint
Read the seed and the count with `int(input())`, and call `random.seed(seed)` **before** the first roll.
%% hint
Roll in a loop: `rolls.append(random.randint(1, 6))`. Keep the rolls in a list.
%% hint
To print the rolls, turn each one into text and join them with spaces. Then `statistics.mean(rolls)` gives the mean for the last line.
%% end

%% exercise stats-report | A statistics report
Read one line of numbers separated by spaces. Print a report with the count, and the mean, median, mode and standard deviation (`stdev`), each with two decimals. If there are fewer than two numbers, print `Need at least two numbers` instead. For the input below the program prints:

```output
Count: 7
Mean: 82.14
Median: 85.00
Mode: 85.00
Stdev: 12.46
```
%% stdin
72 85 90 85 60 98 85
%% starter
import statistics

# Read the numbers and print the report.

%% solution
import statistics

numbers = []
for text in input().split():
    numbers.append(float(text))
if len(numbers) < 2:
    print("Need at least two numbers")
else:
    print(f"Count: {len(numbers)}")
    print(f"Mean: {statistics.mean(numbers):.2f}")
    print(f"Median: {statistics.median(numbers):.2f}")
    print(f"Mode: {statistics.mode(numbers):.2f}")
    print(f"Stdev: {statistics.stdev(numbers):.2f}")
%% tests
expect_output("Count: 7\nMean: 82.14\nMedian: 85.00\nMode: 85.00\nStdev: 12.46")
check(rerun("5").strip() == "Need at least two numbers", "a single number")
check(rerun("\n").strip() == "Need at least two numbers", "no numbers")
check(rerun("2 4 4 4 5 5 7 9").strip() == "Count: 8\nMean: 5.00\nMedian: 4.50\nMode: 4.00\nStdev: 2.14", "another data set")
check(calls("stdev") and calls("median") and calls("mode"), "uses the statistics functions")
%% hint
Read the line with `input().split()`, and convert each part with `float`. Store them in a list.
%% hint
Check `len(numbers) < 2` first. Otherwise, each line of the report is one call: `statistics.mean(numbers)`, `median`, `mode` and `stdev`.
%% hint
Format every statistic with `:.2f`, for example `f"Mean: {statistics.mean(numbers):.2f}"`. The count is a plain number.
%% end

%% exercise birthday | Challenge: The birthday problem
How many people must be in a room before two of them probably share a birthday? Use 365 days and ignore leap years. The chance that **at least two** of `n` people share a birthday is `1 - perm(365, n) / 365 ** n`, where `perm` is `math.perm`. Read numbers `n` until `done`, and for each one print `n people: ` and the chance as a percentage with one decimal. After `done`, print the **smallest** group size whose chance is above 50 percent, found with a loop. For the input below the program prints:

```output
10 people: 11.7%
23 people: 50.7%
60 people: 99.4%
First group above 50%: 23
```
%% stdin
10
23
60
done
%% starter
import math

# Write a loop that reads the sizes, and one that finds the first size above 50%.

%% solution
import math

def chance(n):
    return 1 - math.perm(365, n) / 365 ** n

while True:
    text = input()
    if text == "done":
        break
    n = int(text)
    print(f"{n} people: {chance(n):.1%}")

size = 2
while chance(size) <= 0.5:
    size += 1
print(f"First group above 50%: {size}")
%% tests
expect_output("10 people: 11.7%\n23 people: 50.7%\n60 people: 99.4%\nFirst group above 50%: 23")
check(calls("perm"), "uses math.perm")
check(rerun("1\n366\ndone").strip() == "1 people: 0.0%\n366 people: 100.0%\nFirst group above 50%: 23", "the smallest and the largest groups")
check(rerun("done").strip() == "First group above 50%: 23", "no sizes")
%% hint
The chance for `n` people is `1 - math.perm(365, n) / 365 ** n`. A function `chance(n)` keeps the code short.
%% hint
Format a probability as a percentage with the format `:.1%`. For example, `f"{0.507:.1%}"` gives `50.7%`.
%% hint
For the last line, start with `size = 2` and use a `while` loop: `while chance(size) <= 0.5:` adds 1 to `size`. When the loop ends, `size` is the first group above 50 percent.
%% end

## What you learned

- `math` has the mathematical functions: `sqrt`, `floor`, `ceil`, `trunc`, `gcd`, `factorial`, `comb`, `perm`, `hypot`, logarithms and trigonometry (in **radians**), and the constants `pi`, `e` and `inf`. An input outside the domain raises `ValueError`.
- Floats carry tiny errors, so compare the results of calculations with `math.isclose`, not with `==`.
- `random` is pseudo-random. `randint` includes both ends, `randrange` is like `range`, `choice` picks one, `choices` repeats, `sample` does not, and `shuffle` changes the list in place and returns `None`.
- `random.seed(n)` makes the sequence repeatable, which is how random programs are tested.
- `statistics` gives `mean`, `median`, `mode`, `multimode`, `stdev` (sample) and `pstdev` (population). One extreme value moves the mean far more than the median. Too little data raises `StatisticsError`.
- For exact numbers use `Decimal` (create it from a **string**, round with `quantize`) for money, and `Fraction` for ratios.
