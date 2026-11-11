---
title: Measuring efficiency
---
Two programs can give exactly the same answer, and yet one finishes in a blink while the other keeps you waiting for hours. The difference is the **algorithm**: the method that the program follows. In this lesson you will learn to tell a fast algorithm from a slow one without guessing. You will **count steps**, describe how the work **grows** as the input grows (the famous **Big-O** notation), and **measure** real programs with a clock. These tools stay useful for as long as you write code, and the next three lessons use them all the time.

## What is an algorithm?

An **algorithm** is a precise list of steps that solves a problem, and almost every problem has more than one. Take the question "Is this number prime?". The plain method divides the number by every smaller number. A cleverer method notices that if a number has a divisor, it also has one that is no bigger than its square root, so it can stop much earlier. Both methods give the same answers. Here they are, each one counting the divisions that it tries:

```python run
def is_prime_slow(n):
    steps = 0
    if n < 2:
        return False, steps
    for divisor in range(2, n):
        steps += 1
        if n % divisor == 0:
            return False, steps
    return True, steps

def is_prime_fast(n):
    steps = 0
    if n < 2:
        return False, steps
    divisor = 2
    while divisor * divisor <= n:
        steps += 1
        if n % divisor == 0:
            return False, steps
        divisor += 1
    return True, steps

for number in (97, 7919, 1_000_003):
    print(number, is_prime_slow(number), is_prime_fast(number))
```

Each function returns two values: the answer and the number of divisions that it tried. For the prime 1,000,003 the slow function needs a million steps and the fast one needs 999. The answers are identical, so the only thing that separates a good solution from a poor one is **how much work it does**.

## Count steps, not seconds

You could time the two functions with a stopwatch, but seconds depend on the computer, on the other programs that are running, and even on the temperature of the processor. A count of steps depends on the algorithm and the input only. A "step" is any small piece of work, such as one comparison or one addition. It does not matter exactly what you count, as long as you count the same kind of piece in every version that you compare.

What matters most is how the count **changes when the input gets bigger**. Here are two small functions. The first looks at every item once, and the second looks at every pair of items:

```python run
def largest(numbers):
    comparisons = 0
    best = numbers[0]
    for number in numbers[1:]:
        comparisons += 1
        if number > best:
            best = number
    return best, comparisons

def count_pairs(items):
    steps = 0
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            steps += 1
    return steps

for n in (10, 20, 40, 80):
    print(n, largest(list(range(n)))[1], count_pairs(list(range(n))))
```

Read the three columns. The comparisons in `largest` are always one fewer than `n`, so doubling `n` **doubles** the work. The pairs grow much faster: the count goes from 45 to 190 to 780 to 3,160, so every doubling of `n` makes the work about **four times** bigger. For a list of a million items, the first function needs a million comparisons, and the second needs about 500 billion.

%% question q-nested-predict | predict
What does this program print?

```python
count = 0
for i in range(4):
    for j in range(3):
        count += 1
print(count)
```
%% answer
12
%% explain
The inner loop runs 3 times for every pass of the outer loop, and the outer loop makes 4 passes, so the body runs 4 x 3 = 12 times. A loop inside a loop **multiplies** the counts. With n passes in each loop, that gives n x n steps.
%% end

## Big-O: a name for the growth

Computer scientists describe growth with **Big-O notation**. The symbol O(n) is read "order n" and means "the work grows in proportion to n". Big-O keeps only the **shape** of the growth, and it throws away two details:

- **Constant factors.** A loop that does 3 steps for each item is O(n), like a loop that does 1 step for each item. Both double when the input doubles.
- **Smaller terms.** A program that needs n^2 + 5n + 20 steps is O(n^2), because for a large n the n^2 part is so much bigger that the rest does not matter.

These are the shapes that you meet most often, from the best to the worst:

| Big-O | Name | Typical example | What happens as n grows |
|---|---|---|---|
| O(1) | constant | reading the first item of a list | the work does not change |
| O(log n) | logarithmic | halving a range again and again | doubling n adds one step |
| O(n) | linear | looking at every item once | doubling n doubles the work |
| O(n log n) | linearithmic | a good sorting algorithm | doubling n slightly more than doubles it |
| O(n^2) | quadratic | comparing every pair of items | doubling n makes the work four times bigger |
| O(2^n) | exponential | trying every subset of the items | one more item doubles the work |

A **logarithm** answers the question "how many times can I halve this number before I reach 1?". Halving 64 takes 6 steps (64, 32, 16, 8, 4, 2, 1), and halving a million takes only about 20. That is why logarithmic algorithms are so fast: a huge input costs only a few more steps. Run the next program and compare the six shapes with your own eyes:

```python run
def constant(n):
    return 1

def logarithmic(n):
    steps = 0
    while n > 1:
        n //= 2
        steps += 1
    return steps

def linear(n):
    steps = 0
    for _ in range(n):
        steps += 1
    return steps

def linearithmic(n):
    steps = 0
    size = 1
    while size < n:              # about log n rounds ...
        for _ in range(n):       # ... of n steps each
            steps += 1
        size *= 2
    return steps

def quadratic(n):
    steps = 0
    for _ in range(n):
        for _ in range(n):
            steps += 1
    return steps

def exponential(n):
    steps = 0
    for _ in range(2 ** n):
        steps += 1
    return steps

sizes = (4, 8, 16, 20)
print(f"{'':<14}" + "".join(f"{n:>10}" for n in sizes))
for func in (constant, logarithmic, linear, linearithmic, quadratic, exponential):
    print(f"{func.__name__:<14}" + "".join(f"{func(n):>10,}" for n in sizes))
```

Look at the last two rows. With only 20 items, the quadratic function needs 400 steps, but the exponential one already needs more than a million. Exponential growth is brutal, as this estimate shows for a computer that does a million steps per second:

```python run
steps_per_second = 1_000_000
for n in (20, 40, 60, 80):
    seconds = 2 ** n / steps_per_second
    years = seconds / (60 * 60 * 24 * 365)
    print(f"2^{n}: {seconds:,.0f} seconds, or {years:,.4f} years")
```

An algorithm that tries every subset of 60 items would need tens of thousands of years. No faster computer rescues it. Only a **better algorithm** does, and finding one is what the rest of this module is about.

%% question q-halving-predict | predict
What does this program print?

```python
n = 64
steps = 0
while n > 1:
    n //= 2
    steps += 1
print(steps)
```
%% answer
6
%% explain
The value of `n` goes 64, 32, 16, 8, 4, 2, 1, which is six halvings. The loop runs once for each halving, so it prints 6. This is the shape of a **logarithmic** algorithm: the problem shrinks by half in every step.
%% end

## Reading the Big-O of code

You can often read the growth straight from the shape of the code. Each function below says what its cost is:

```python
def first_item(items):                 # O(1): one step, however long the list is
    return items[0]

def total(items):                      # O(n): one pass over the items
    result = 0
    for item in items:
        result += item
    return result

def has_pair(items, wanted):           # O(n^2): a loop inside a loop
    for a in items:
        for b in items:
            if a + b == wanted:
                return True
    return False

def digits(n):                         # O(log n): n shrinks ten times in every step
    count = 0
    while n > 0:
        n //= 10
        count += 1
    return count

def report(items):                     # O(n) + O(n) = O(n): loops one after the other
    for item in items:
        print(item)
    for item in items:
        print(item * 2)
```

These rules of thumb cover most cases:

- One loop over `n` items is **O(n)**. A loop inside a loop, both over the items, is **O(n^2)**.
- Loops one after the other **add**, and the biggest one wins. The cost O(n) + O(n^2) is O(n^2).
- A loop that cuts the problem down by a fixed fraction in every step, such as halving it, is **O(log n)**.
- A function that calls itself twice for every call can be **exponential**. You will see this in lesson 3.
- Many built-in tools **hide a loop**. The calls `sum(items)`, `max(items)`, `x in a_list`, `a_list.index(x)` and `a_list.count(x)` all look at the items one by one, so each of them is O(n). The call `sorted(items)` is O(n log n).

%% key Big-O is about growth, not speed
An O(n) algorithm is not always faster than an O(n^2) one. For small inputs the constant factors can decide the winner, and Big-O ignores them on purpose. It tells you what happens when the input becomes **big**, and that is when a slow algorithm hurts the most.
%% end

The work can also depend on **which** input of a given size you get. A linear search for the first item of a list finishes in one step, and a search for a missing item looks at all `n` items. Those are the **best case** and the **worst case**. Unless somebody says otherwise, Big-O describes the worst case, because that is the one that you must be ready for.

%% question q-growth-choice | choice
An algorithm needs 5 steps for 10 items, 6 steps for 20 items and 7 steps for 40 items. How does its work grow?
%% choice correct
Logarithmic: every doubling of the input adds one step
%% choice
Linear: every doubling of the input doubles the steps
%% choice
Quadratic: every doubling of the input makes the steps four times bigger
%% choice
Constant: the steps never change
%% explain
The steps do not double or quadruple. They only go up by **one** each time the input doubles, and that is the sign of a logarithmic algorithm. A constant algorithm would need 5 steps every time.
%% end

## Measuring time with a clock

Counting steps predicts the cost, and a clock **confirms** it. You met `time.perf_counter()` in Module 12. It returns seconds as a float, and only the difference between two readings means anything. A small helper makes it quick to reuse:

```python run
import time

def measure(func, *args):
    start = time.perf_counter()
    func(*args)
    return time.perf_counter() - start

def total_loop(n):
    total = 0
    for number in range(n):
        total += number
    return total

for n in (100_000, 200_000, 400_000):
    print(f"n = {n:>7,}: {measure(total_loop, n):.4f} seconds")
```

Run it a few times. The numbers change a little on every run, because other work on your computer disturbs the clock, and the numbers in a browser are different from the numbers on a desktop computer. So compare **ratios**, not exact seconds. Here, doubling `n` roughly doubles the time, as O(n) predicts.

For tiny pieces of code, a single reading is too coarse and too noisy. The `timeit` module runs a piece of code many times and reports the total time. Its function `repeat` does that several times over, and the **smallest** result is the most trustworthy one, because a larger value only means that something else was busy:

```python run
from timeit import timeit, repeat

numbers_list = list(range(100_000))
numbers_set = set(numbers_list)

in_list = timeit("99_999 in numbers_list", globals=globals(), number=200)
in_set = timeit("99_999 in numbers_set", globals=globals(), number=1_000_000)
print(f"200 lookups in the list: {in_list:.4f} s")
print(f"1,000,000 lookups in the set: {in_set:.4f} s")
print(f"one lookup: list {in_list / 200 * 1e6:,.1f} microseconds, set {in_set / 1_000_000 * 1e6:.3f} microseconds")

best = min(repeat("sorted(numbers_list)", globals=globals(), number=20, repeat=3))
print(f"sorting the list 20 times: {best:.4f} s")
```

The code to time is a **string**, and `globals=globals()` lets it see the names of your program. The argument `number` says how many times to run it. The set needed a million repeats, because a few hundred lookups finish faster than a clock can tell, and the last line divides the total by the number of repeats to get the cost of **one** lookup. A set wins by thousands of times, because it does not scan: it calculates where the value would be stored and looks there. A list must compare the target with item after item, so its cost is O(n) against O(1) for the set.

%% question q-perf-fill | fill
Fill in the blank so that the program prints `True`.

```python
import time

start = time.___()
total = sum(range(1000))
elapsed = time.perf_counter() - start
print(elapsed >= 0)
```
%% answer
perf_counter
%% expected
True
%% explain
The function `time.perf_counter()` is the clock for measuring short durations. Two readings are taken, and their difference is the elapsed time, which can never be negative.
%% end

## Growth experiments: the doubling test

Here is a trick that works on any code, even code that you did not write. Run it for a size `n`, then for `2n`, then for `4n`, and look at the **ratio** between neighbouring times. A ratio near 2 means linear, and a ratio near 4 means quadratic:

```python run
import time

def seconds(func, n):
    data = list(range(n))
    start = time.perf_counter()
    func(data)
    return time.perf_counter() - start

def one_pass(data):               # O(n)
    total = 0
    for item in data:
        total += item
    return total

def all_pairs(data):              # O(n^2)
    count = 0
    for i in range(len(data)):
        for j in range(i + 1, len(data)):
            if data[i] == data[j]:
                count += 1
    return count

for func, sizes in ((one_pass, (100_000, 200_000, 400_000)), (all_pairs, (400, 800, 1600))):
    print(func.__name__)
    previous = None
    for n in sizes:
        taken = seconds(func, n)
        note = f"   x{taken / previous:.1f}" if previous else ""
        print(f"  n = {n:>7,}: {taken:.4f} s{note}")
        previous = taken
```

The `x` column is the ratio to the line above. For `one_pass` it stays near 2, and for `all_pairs` it stays near 4. The doubling test is a **growth detector**, and you will write a small one yourself in the exercises.

%% question q-double-choice | choice
An algorithm with quadratic growth takes 2 seconds for 1,000 items. About how long will it take for 2,000 items?
%% choice
About 4 seconds
%% choice correct
About 8 seconds
%% choice
About 16 seconds
%% choice
About 2 seconds
%% explain
Doubling n multiplies n^2 by 4, so the time grows from 2 seconds to about 2 x 4 = 8 seconds. Four seconds would be the answer for a **linear** algorithm, and sixteen would need a growth of 8 times, as in an O(n^3) algorithm.
%% end

## Time versus memory

Speed is only one resource. The other is **memory**. Many fast algorithms **spend memory to save time**. The two functions below find the numbers that appear in both lists. The slow one needs almost no extra memory but compares every pair. The fast one builds sets, which costs memory, but then every lookup takes one step:

```python run
import time

def common_slow(first, second):
    shared = []
    for a in first:
        for b in second:                 # a full scan of `second` for every item
            if a == b and a not in shared:
                shared.append(a)
    return sorted(shared)

def common_fast(first, second):
    return sorted(set(first) & set(second))     # two sets: more memory, far fewer steps

first = list(range(0, 4000, 2))
second = list(range(0, 4000, 3))

start = time.perf_counter()
slow_answer = common_slow(first, second)
slow_time = time.perf_counter() - start

start = time.perf_counter()
fast_answer = common_fast(first, second)
fast_time = time.perf_counter() - start

print(slow_answer == fast_answer, len(fast_answer))
print(f"slow: {slow_time:.4f} s, fast: {fast_time:.5f} s")
```

Memory can also be saved. A list of a million numbers keeps a million references. A `range` keeps only its start, stop and step, and a generator keeps only a small recipe, so both stay tiny however long the sequence is:

```python run
import sys

numbers = list(range(1_000_000))
lazy = range(1_000_000)
squares = (n * n for n in range(1_000_000))

print(sys.getsizeof(numbers) > 1000 * sys.getsizeof(lazy))
print(sys.getsizeof(squares) < 1000)
print(sum(squares))
```

The first line prints `True` because the list is thousands of times bigger than the range. The generator is equally small, and `sum` pulls the squares out one at a time. You met this idea in Module 13. The best algorithm for a job depends on which resource is scarce, and **memoisation** in lesson 3 is the best known case of paying memory for speed.

## What common operations cost

Choosing the right **container** is often the biggest speed-up of all. These are the costs of the operations that you use every day:

| Operation | list | dict or set | deque |
|---|---|---|---|
| add at the end | O(1) | O(1) | O(1) |
| add or remove at the front | O(n) | not available | O(1) |
| `x in container` | O(n) | O(1) | O(n) |
| read by position or key | O(1) | O(1) | O(n) in the middle |
| remove a given value | O(n) | O(1) | O(n) |
| sort | O(n log n) | not available | not available |

Two notes. First, O(1) for a dictionary or a set is an **average**: it relies on hashing, and a rare unlucky case is slower. Second, `append` on a list is called **amortised** O(1): now and then Python must move the list to a bigger block of memory, but spread over many appends the cost of each one is still constant.

The front of a list is the classic trap. When you insert at position 0, every other item must move one place to the right. A `deque` (from the `collections` module) is built for work at both ends, so it does not move anything:

```python run
import time
from collections import deque

def fill_back(n):
    items = []
    for i in range(n):
        items.append(i)

def fill_front(n):
    items = []
    for i in range(n):
        items.insert(0, i)

def fill_front_deque(n):
    items = deque()
    for i in range(n):
        items.appendleft(i)

for func in (fill_back, fill_front, fill_front_deque):
    start = time.perf_counter()
    func(40_000)
    print(f"{func.__name__:<18} {time.perf_counter() - start:.4f} s")
```

The middle line is by far the slowest, although all three functions do the same number of operations. Each one of the operations has a different **cost**, and the cost is what Big-O describes.

%% question q-fast-multi | multi
Select every operation that takes about the same time however many items the container holds (constant time on average).
%% choice correct
`numbers.append(x)` on a list
%% choice correct
`x in some_set`
%% choice correct
`scores["Ada"]` on a dictionary
%% choice
`x in some_list`
%% choice
`numbers.insert(0, x)` on a list
%% explain
Adding at the end of a list, a set membership test and a dictionary lookup all take one step on average. Looking for a value in a list means scanning it, which is O(n), and inserting at the front moves every other item, which is O(n) as well.
%% end

%% tip Measure before you optimise
Most code is fast enough as it is. Make the program **correct** first, then **clear**, and speed it up only where a measurement shows that it matters. A faster algorithm in the part of the program where the time goes is worth far more than clever tricks everywhere else.
%% end

## Your turn

%% exercise steps-to-find | Count the steps of a search
A **linear search** looks at the items of a list one by one, from the start, and stops as soon as it finds the target. Write `steps_to_find(items, target)` that returns **how many items** the search looks at. When the target is missing, the search looks at every item, so the answer is `len(items)`. The program below shows the best case, a middle case, the last item, and a missing target. It must print:

```output
1
500
1000
1000
```
%% starter
def steps_to_find(items, target):
    # Look at the items one by one, and count each item that you look at.
    pass

items = list(range(1, 1001))        # 1, 2, 3, ... 1000
print(steps_to_find(items, 1))      # the best case
print(steps_to_find(items, 500))    # a middle case
print(steps_to_find(items, 1000))   # the last item
print(steps_to_find(items, 5000))   # missing: every item is looked at
%% solution
def steps_to_find(items, target):
    steps = 0
    for item in items:
        steps += 1
        if item == target:
            return steps
    return steps

items = list(range(1, 1001))        # 1, 2, 3, ... 1000
print(steps_to_find(items, 1))      # the best case
print(steps_to_find(items, 500))    # a middle case
print(steps_to_find(items, 1000))   # the last item
print(steps_to_find(items, 5000))   # missing: every item is looked at
%% tests
expect_output("1\n500\n1000\n1000")
expect(steps_to_find([], 3), 0)
expect(steps_to_find(["a", "b", "c"], "b"), 2)
expect(steps_to_find([5, 5, 5], 5), 1)
expect(steps_to_find([1, 2, 3], 9), 3)
check(uses("For", "While"), "look at the items in a loop")
check(not calls("index"), "write the loop yourself, without .index")
%% hint
You need a counter that starts at 0. Every time that you look at an item, add 1 to it.
%% hint
Loop over `items`. Count the item first, and then compare it with `target`. As soon as they are equal, return the counter.
%% hint
When the loop ends without a match, every item was looked at, so return the counter after the loop (it is equal to `len(items)`).
%% end

%% exercise doubling-test | The doubling test
You can find out how an algorithm grows without reading its code. Compare the work for `n = 1000` with the work for `n = 2000`. Write `growth(steps)`. The argument `steps` is a function that takes `n` and returns the number of steps that an algorithm needs for `n` items. Work out the ratio `steps(2000) / steps(1000)` and round it to the nearest whole number. Return `"constant"` when it is 1, `"linear"` when it is 2, `"quadratic"` when it is 4, and `"other"` for every other value. The program below must print:

```output
constant
linear
quadratic
other
```
%% starter
def growth(steps):
    # Compare steps(2000) with steps(1000).
    pass

print(growth(lambda n: 7))
print(growth(lambda n: 3 * n + 5))
print(growth(lambda n: n * n // 2))
print(growth(lambda n: n ** 3))
%% solution
def growth(steps):
    ratio = steps(2000) / steps(1000)
    names = {1: "constant", 2: "linear", 4: "quadratic"}
    return names.get(round(ratio), "other")

print(growth(lambda n: 7))
print(growth(lambda n: 3 * n + 5))
print(growth(lambda n: n * n // 2))
print(growth(lambda n: n ** 3))
%% tests
expect_output("constant\nlinear\nquadratic\nother")
expect(growth(lambda n: 100), "constant")
expect(growth(lambda n: n), "linear")
expect(growth(lambda n: 10 * n + 1000), "linear")
expect(growth(lambda n: n * (n - 1) // 2), "quadratic")
expect(growth(lambda n: 2 * n * n + n), "quadratic")
expect(growth(lambda n: n * n * n), "other")
%% hint
Call `steps(1000)` and `steps(2000)`, and divide the second result by the first.
%% hint
The call `round(ratio)` turns a ratio such as 1.998 into 2. Then you only need to turn 1, 2 and 4 into words.
%% hint
A dictionary such as `{1: "constant", 2: "linear", 4: "quadratic"}` with `.get(rounded, "other")` avoids a chain of `if` statements.
%% end

%% exercise no-duplicates | A faster duplicate check
A list has a **duplicate** when some value appears in it twice. Write `has_duplicates(items)` that returns `True` or `False`. The slow way compares every pair of items, which is about n^2 / 2 comparisons. A **set** needs only about n steps. The tests count the comparisons that your code makes, so a nested loop is rejected on a long list. The program below must print:

```output
False
True
True
False
```
%% starter
def has_duplicates(items):
    # Use a set to remember the items that you have already seen.
    pass

print(has_duplicates([1, 2, 3, 4]))
print(has_duplicates([1, 2, 3, 1]))
print(has_duplicates(list("hello")))
print(has_duplicates([]))
%% solution
def has_duplicates(items):
    seen = set()
    for item in items:
        if item in seen:
            return True
        seen.add(item)
    return False

print(has_duplicates([1, 2, 3, 4]))
print(has_duplicates([1, 2, 3, 1]))
print(has_duplicates(list("hello")))
print(has_duplicates([]))
%% tests
expect_output("False\nTrue\nTrue\nFalse")
expect(has_duplicates([7]), False)
expect(has_duplicates(["a", "b", "a"]), True)
expect(has_duplicates([(1, 2), (2, 1), (1, 2)]), True)
class Counted:
    compares = 0
    def __init__(self, value):
        self.value = value
    def __eq__(self, other):
        Counted.compares += 1
        return self.value == other.value
    def __hash__(self):
        return hash(self.value)
unique = [Counted(i) for i in range(400)]
expect(has_duplicates(unique), False)
check(Counted.compares < 2000, "400 different items need far fewer than 80 000 comparisons", "your code made " + str(Counted.compares) + " comparisons: use a set instead of comparing every pair")
Counted.compares = 0
twice = [Counted(i % 200) for i in range(400)]
expect(has_duplicates(twice), True)
check(Counted.compares < 2000, "a repeated item is found with very few comparisons", "your code made " + str(Counted.compares) + " comparisons")
%% hint
A **set** remembers values, and it answers the question "have I seen this value before?" in about one step.
%% hint
Walk through the items with a loop. When the item is already in the set `seen`, return `True`. Otherwise add the item to the set.
%% hint
When the loop ends without finding a repeat, return `False`. A shorter solution compares sizes: `len(set(items)) != len(items)`.
%% end

%% exercise two-sum | Challenge: Two numbers that add up
Write `two_sum(numbers, target)` that returns a tuple `(i, j)` with `i < j` and `numbers[i] + numbers[j] == target`, or `None` when there is no such pair. When there are several pairs, any one of them is accepted. The obvious solution tries every pair, which is about n^2 / 2 steps. The tests count how many times your function **reads the list**, so a fast solution is needed: one that looks at every number only a few times. The program below must print:

```output
(0, 1)
(2, 4)
None
```
%% starter
def two_sum(numbers, target):
    # For each number, ask: have I already seen the partner that I need?
    pass

numbers = [2, 7, 11, 15, 3]
print(two_sum(numbers, 9))      # 2 + 7
print(two_sum(numbers, 14))     # 11 + 3
print(two_sum(numbers, 100))    # no pair
%% solution
def two_sum(numbers, target):
    seen = {}
    for j, number in enumerate(numbers):
        i = seen.get(target - number)
        if i is not None:
            return (i, j)
        seen[number] = j
    return None

numbers = [2, 7, 11, 15, 3]
print(two_sum(numbers, 9))      # 2 + 7
print(two_sum(numbers, 14))     # 11 + 3
print(two_sum(numbers, 100))    # no pair
%% tests
expect_output("(0, 1)\n(2, 4)\nNone")
expect(two_sum([5, 1, 4], 9), (0, 2))
expect(two_sum([3, 3], 6), (0, 1))
expect(two_sum([], 1), None)
expect(two_sum([4], 8), None)
expect(two_sum([-3, 4, 3, 90], 0), (0, 2))
class Spy(list):
    reads = 0
    def __getitem__(self, index):
        if isinstance(index, slice):
            Spy.reads += len(range(*index.indices(len(self))))
        else:
            Spy.reads += 1
        return list.__getitem__(self, index)
    def __iter__(self):
        for position in range(len(self)):
            Spy.reads += 1
            yield list.__getitem__(self, position)
    def __contains__(self, value):
        Spy.reads += len(self)
        return list.__contains__(self, value)
    def index(self, *args):
        Spy.reads += len(self)
        return list.index(self, *args)
    def count(self, value):
        Spy.reads += len(self)
        return list.count(self, value)
big = Spy(range(600))
answer = two_sum(big, 1197)
expect(answer, (598, 599))
check(Spy.reads <= 3600, "a list of 600 numbers is read only a few times", "your function read the list " + str(Spy.reads) + " times; a fast solution reads about 600 times")
%% hint
For each number, the partner that you need is `target - number`. The real question is how to find out quickly whether you have already seen that partner.
%% hint
A dictionary that maps each number to its index answers the question in one step. Go through the list once. Before you store the current number, look for its partner in the dictionary.
%% hint
Use `seen.get(partner)` and compare the result with `None`. Do not write `if seen.get(partner):`, because the index 0 is a valid answer, and 0 counts as false.
%% end

## What you learned

- An **algorithm** is a precise method for solving a problem, and one problem usually has many algorithms. Two of them can give the same answers and still differ enormously in the work that they do.
- **Count steps, not seconds.** A count of steps depends on the algorithm and the input only, and what matters is how the count grows when the input gets bigger.
- **Big-O notation** names the shape of the growth and ignores constant factors and smaller terms. The common shapes are O(1), O(log n), O(n), O(n log n), O(n^2) and O(2^n). Doubling the input doubles a linear algorithm, quadruples a quadratic one, and adds only one step to a logarithmic one.
- You can read the growth from the code: one loop is O(n), a loop in a loop is O(n^2), halving is O(log n), and many built-in tools (`sum`, `max`, `in` on a list, `sorted`) hide a loop. Big-O usually describes the **worst case**.
- **Measure with a clock** using `time.perf_counter()`, or with `timeit` for tiny pieces of code (take the smallest of several repeats). Compare ratios between sizes, because exact seconds change from one computer to the next.
- The **doubling test** reveals the growth of any code: a ratio near 2 means linear, and a ratio near 4 means quadratic.
- Fast algorithms often **spend memory to save time**. Sets and dictionaries make lookups O(1) on average, a `list` is slow at the front, and a `deque` is fast at both ends. Choosing the right container is often the biggest speed-up.
- Make the code correct and clear first, and measure before you optimise.
