---
title: Recursion, memoisation and dynamic programming
---
In Module 4 you wrote functions that call themselves, and you saw the price of a careless one: the recursive Fibonacci function repeats the same work again and again. This lesson turns that observation into a **toolkit** for solving big problems by solving small ones **once**. You will draw the tree of calls to see where the work is wasted, then fix it with **memoisation** (remember answers) and **dynamic programming** (fill a table from the smallest problem up). You will solve the classic problems of coin change, longest common subsequence and knapsack, and you will meet **backtracking**, the technique for listing and searching through all the possibilities. The lesson ends with **divide and conquer**, which you already used in merge sort and binary search.

## Seeing the waste: the recursion tree

Every call of a recursive function makes smaller calls, and together the calls form a **tree**. Print the tree of `fib(5)`, one call on each line, indented by its depth, and count how often each argument appears:

```python run
calls = {}

def fib(n, depth=0):
    calls[n] = calls.get(n, 0) + 1
    print("  " * depth + f"fib({n})")
    if n < 2:
        return n
    return fib(n - 1, depth + 1) + fib(n - 2, depth + 1)

fib(5)
print(calls)
```

Look at the tree. The call `fib(3)` appears twice, `fib(2)` three times and `fib(1)` five times, and every copy of `fib(3)` repeats exactly the same work as the others. These repeated calls are called **overlapping subproblems**. They are why the plain version is so slow, and the waste **grows with the input**:

```python run
def count_calls(n):
    total = 0

    def fib(n):
        nonlocal total
        total += 1
        if n < 2:
            return n
        return fib(n - 1) + fib(n - 2)

    fib(n)
    return total

for n in (10, 20, 25):
    print(n, count_calls(n))
```

Going from `n = 10` to `n = 25` multiplies the number of calls by more than a thousand, and the growth is **exponential**: each extra step makes the work about 1.6 times bigger. Two properties tell you that a problem can be fixed in a better way:

- **Overlapping subproblems**: the same smaller problem is needed many times.
- **Optimal substructure**: the best answer to the big problem is built from the best answers to smaller problems.

A problem with both properties is a candidate for **dynamic programming**: solve each subproblem **once**, remember the answer, and reuse it.

## Memoisation: remember the answers

The first way is **memoisation** (also called top-down dynamic programming). You keep the recursive function exactly as it is, and add a dictionary that remembers the answer for each argument. Step through the program and watch `seen` fill up. Each answer is calculated once, and every other request finds it in the dictionary:

```python trace title="The dictionary fills up"
seen = {}

def fib(n):
    if n in seen:
        return seen[n]
    if n < 2:
        return n
    seen[n] = fib(n - 1) + fib(n - 2)
    return seen[n]

print(fib(5))
print(seen)
```

You do not have to write the dictionary yourself. The decorator `functools.cache` from Module 14 does it, and it can report how well it worked:

```python run
from functools import cache

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
print(fib.cache_info())
fib.cache_clear()
print(fib.cache_info())
```

The call `fib(80)` finished at once, although the plain version would need more calls than there are grains of sand on Earth. The report says that there were **81 misses** (one calculation for each of the numbers 0 to 80) and **78 hits** (answers that came straight from the cache). The work dropped from exponential to **O(n)**. Memoisation has three rules:

- The function must be **pure**: the same arguments always give the same result, and the function changes nothing outside itself. Otherwise a remembered answer could be wrong.
- The arguments must be **hashable**, because they are the keys of the dictionary. Numbers, strings and tuples are fine. A list is not, so turn it into a tuple first.
- The cache costs **memory**: one entry for every different argument. For a very long run, `@lru_cache(maxsize=1000)` keeps only the most recently used entries.

```python run error
from functools import cache

@cache
def total(items):
    return sum(items)

print(total((1, 2, 3)))        # a tuple is hashable
print(total([1, 2, 3]))        # a list is not
```

%% question q-cache-predict | predict
What does this program print?

```python
from functools import cache

@cache
def f(n):
    print("computing", n)
    return n if n < 2 else f(n - 1) + f(n - 2)

print(f(3))
print(f(3))
```
%% answer
computing 3
computing 2
computing 1
computing 0
2
2
%% explain
The first call computes `f(3)`, which needs `f(2)` and `f(1)`. Computing `f(2)` needs `f(1)` and `f(0)`, so the lines `computing 2`, `computing 1` and `computing 0` follow in that order. When `f(3)` later asks for `f(1)` again, the cache already has it, so nothing is printed. The second call `f(3)` is a cache hit, so it prints only the result.
%% end

%% question q-repeat-choice | choice
Why does the plain recursive `fib(40)` take so long?
%% choice correct
It solves the same smaller problems again and again
%% choice
Recursion is always a million times slower than a loop
%% choice
Python cannot add big numbers quickly
%% choice
Its call stack uses up all the memory
%% explain
The number of calls grows exponentially, because every call makes two more calls and most of them repeat work that was done elsewhere in the tree. Memoisation removes the repeats. Recursion itself is not the problem, and `fib(40)` never goes deeper than 40 levels.
%% end

## The limit of top-down: recursion depth

Memoisation has a weak spot. The answer for `n` is found by recursion, and Python allows only about **1,000 nested calls**. A hand-written memo with `n = 900` still works, and `n = 2000` does not:

```python run error
def fib(n, seen):
    if n in seen:
        return seen[n]
    if n < 2:
        return n
    seen[n] = fib(n - 1, seen) + fib(n - 2, seen)
    return seen[n]

print(len(str(fib(900, {}))))     # a number with 188 digits: fine
print(len(str(fib(2000, {}))))    # 2000 levels deep: too many
```

%% warn The recursion limit is lower for @cache on this site
Python stops a chain of plain recursive calls at about 1,000 levels, with a `RecursionError`. A recursive function that is wrapped by `@cache` uses more room for each level, and the engine in your browser gives up at about 800 levels. It then restarts, and tells you that the recursion went too deep. In every case the cure is the same: build the answer **from the bottom up**, with a loop.
%% end

## Bottom-up: fill a table

The second way starts from the **smallest** problems and builds up to the big one. There is no recursion, so there is no depth limit. You decide the **order** in which the answers are needed, store them in a list (the **table**), and read the final answer from it:

```python run
def fib_table(n):
    table = [0, 1] + [0] * (n - 1)
    for i in range(2, n + 1):
        table[i] = table[i - 1] + table[i - 2]
    return table[n]

def fib_two(n):                  # only the last two entries are ever needed
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(len(str(fib_table(2000))))     # 418 digits, with no recursion at all
print(fib_two(80))
```

The second function shows a bonus of the table method. When each entry needs only the last few entries, you can throw the rest away, and the memory drops from O(n) to O(1). Here is the plan to follow for every dynamic programming problem:

%% key The recipe for dynamic programming
First define the **subproblem**: what does one entry of the table mean? Then write the **recurrence**: how is an entry made from smaller entries? Then set the **base cases**, the entries that you know without calculating. Then choose the **order**, so that every entry is filled after the entries that it needs. The answer is the last entry, or the best entry.
%% end

A first example is **climbing stairs**. You can climb 1 or 2 steps at a time. How many different ways are there to reach step `n`? The last move was either a 1-step from step `n - 1` or a 2-step from step `n - 2`, so `ways[n] = ways[n - 1] + ways[n - 2]`:

```python run
def climb(n):
    ways = [1, 1] + [0] * (n - 1)       # one way to stay at step 0, one way to reach step 1
    for step in range(2, n + 1):
        ways[step] = ways[step - 1] + ways[step - 2]
    return ways[n]

print([climb(n) for n in range(1, 11)])
print(climb(100))
```

The table method and the memoised method give the same answers. They differ in style, and each one has its place:

| Question | Top-down (memoisation) | Bottom-up (table) |
|---|---|---|
| How is it written? | the recursive function plus a cache | loops that fill a list |
| Which subproblems does it solve? | only the ones that are needed | all of them, in order |
| Is there a depth limit? | yes, about 1,000 levels | no |
| Can it save memory? | rarely | often, by keeping only the last rows |
| Is it quick to write from the recurrence? | very | needs a good choice of order |

%% question q-ways-predict | predict
What does this program print?

```python
ways = [1, 1, 0, 0, 0, 0]
for step in range(2, 6):
    ways[step] = ways[step - 1] + ways[step - 2]
print(ways)
```
%% answer
[1, 1, 2, 3, 5, 8]
%% explain
Every entry from position 2 on is the sum of the two entries before it, so the loop fills in 1 + 1 = 2, then 1 + 2 = 3, then 2 + 3 = 5, and then 3 + 5 = 8. This is the Fibonacci sequence again.
%% end

## Coin change: when greedy fails

You owe 6 pence, and the coins are worth 1, 3 and 4 pence. What is the **fewest** coins that make the amount? A **greedy** method takes the biggest coin that fits, again and again. It takes 4, then 1, then 1, which is 3 coins. But 3 + 3 is only 2 coins, so the greedy method is wrong here. Dynamic programming is always right. Let `best[a]` be the fewest coins for the amount `a`. The last coin was one of the coins `c`, so `best[a]` is one more than the smallest `best[a - c]`:

```python run
def min_coins_greedy(coins, amount):
    count = 0
    for coin in sorted(coins, reverse=True):
        count += amount // coin
        amount %= coin
    return count if amount == 0 else -1

def min_coins(coins, amount):
    unreachable = amount + 1                # more coins than could ever be needed
    best = [0] + [unreachable] * amount
    for total in range(1, amount + 1):
        for coin in coins:
            if coin <= total and best[total - coin] + 1 < best[total]:
                best[total] = best[total - coin] + 1
    return best[amount] if best[amount] != unreachable else -1

print(min_coins_greedy([1, 3, 4], 6), min_coins([1, 3, 4], 6))
print(min_coins_greedy([1, 5, 12], 15), min_coins([1, 5, 12], 15))
print(min_coins([2], 3), min_coins([1, 5, 10, 25], 63), min_coins([1, 5, 10, 25], 10_000))
```

The table has `amount + 1` entries, and each one tries every coin, so the work is **O(amount x coins)**. That is 40,000 steps for 10,000 pence and four coins. A plain recursive solution that tries every combination would never finish.

## Longest common subsequence

A **subsequence** keeps the order of the letters, but it may skip some. The text `"GTAB"` is a subsequence of `"AGGTAB"` and of `"GXTXAYB"`. The **longest common subsequence** (LCS) of two texts is the longest one that they share. Programs that compare two versions of a file, or two strands of DNA, solve this problem.

The subproblem needs two numbers. Let `table[i][j]` be the length of the LCS of the first `i` letters of `a` and the first `j` letters of `b`. When the two last letters are equal, they extend the LCS of the shorter texts. Otherwise, the answer is the better one of "drop the last letter of `a`" and "drop the last letter of `b`":

```python run
def lcs_table(a, b):
    rows, cols = len(a) + 1, len(b) + 1
    table = [[0] * cols for _ in range(rows)]
    for i in range(1, rows):
        for j in range(1, cols):
            if a[i - 1] == b[j - 1]:
                table[i][j] = table[i - 1][j - 1] + 1
            else:
                table[i][j] = max(table[i - 1][j], table[i][j - 1])
    return table

def lcs(a, b):
    table = lcs_table(a, b)
    i, j = len(a), len(b)
    letters = []
    while i > 0 and j > 0:               # walk back from the corner to find the letters
        if a[i - 1] == b[j - 1]:
            letters.append(a[i - 1])
            i -= 1
            j -= 1
        elif table[i - 1][j] >= table[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(letters))

table = lcs_table("AGGTAB", "GXTXAYB")
print("  " + " ".join("-GXTXAYB"))
for letter, row in zip("-AGGTAB", table):
    print(letter, " ".join(str(value) for value in row))
print("length:", table[-1][-1], " subsequence:", lcs("AGGTAB", "GXTXAYB"))
```

The number in the bottom right corner is the length of the LCS. Walking back from the corner, along the cells where the letters matched, spells out the subsequence itself. The table has `len(a) x len(b)` cells, so the work is **O(n x m)**, and a plain recursion would be exponential.

## Knapsack: choose the best items

You have a bag that holds a weight of at most `capacity`, and a pile of items with a weight and a value. Each item can be taken **once**. Which items give the most value? This is the **0/1 knapsack** problem. Trying every subset needs 2^n checks. A table does it in **O(n x capacity)**. Let `best[w]` be the most value that fits into weight `w`. The items are handled one at a time:

```python run
def knapsack(items, capacity):
    best = [0] * (capacity + 1)
    for weight, value in items:
        for w in range(capacity, weight - 1, -1):          # backwards: each item is used once
            best[w] = max(best[w], best[w - weight] + value)
    return best[capacity]

treasure = [(1, 1), (3, 4), (4, 5), (5, 7)]               # (weight, value)
print(knapsack(treasure, 7))
```

The loop goes **backwards** on purpose. Going backwards, `best[w - weight]` has not been changed by the current item yet, so the item cannot be counted twice. If you loop forwards, the same item may be taken again and again, which solves a different problem (an unlimited supply of each item).

%% question q-dp-multi | multi
Select every statement that is **true**.
%% choice correct
Memoisation stores the answer of each subproblem the first time that it is calculated
%% choice correct
A bottom-up solution has no recursion, so the recursion limit does not apply to it
%% choice correct
Dynamic programming helps when the same subproblems appear again and again
%% choice
A function that takes a list as its argument can be decorated with `@cache` without any change
%% choice
Always taking the biggest coin first gives the fewest coins
%% explain
The first three statements are the heart of the lesson. A list is not hashable, so `@cache` raises a `TypeError` for it, and a tuple is the usual fix. The greedy method fails for some coin sets: with coins 1, 3 and 4, the amount 6 needs 2 coins, but greedy takes 3.
%% end

## Backtracking: try, explore, undo

Dynamic programming finds the **best** answer. Sometimes you need **all** the answers, or you need to search a maze of choices where no formula helps. **Backtracking** builds a solution one choice at a time. After each choice it explores the rest by recursion, and then it **undoes** the choice to try the next one. The pattern is: **choose, explore, un-choose**.

Here are all the **subsets** of a list. For each item there are two choices: leave it out, or put it in:

```python run
def subsets(items):
    result = []
    chosen = []

    def explore(position):
        if position == len(items):
            result.append(chosen[:])            # a copy, because chosen keeps changing
            return
        explore(position + 1)                   # choice 1: leave the item out
        chosen.append(items[position])          # choice 2: put it in ...
        explore(position + 1)
        chosen.pop()                            # ... and take it out again: the undo step

    explore(0)
    return result

print(subsets([1, 2, 3]))
```

Two details matter. The copy `chosen[:]` is needed, because without it every entry of `result` would be the same list, which ends up empty. And the `pop()` is the **undo**: it restores `chosen` so that the next branch starts from a clean state. Here are the **permutations** (all the orders) of the letters of a word. A list of flags remembers which items are already used:

```python run
def permutations(items):
    result = []
    chosen = []
    used = [False] * len(items)

    def explore():
        if len(chosen) == len(items):
            result.append(chosen[:])
            return
        for i, item in enumerate(items):
            if used[i]:
                continue
            used[i] = True                      # choose
            chosen.append(item)
            explore()                           # explore
            chosen.pop()                        # un-choose
            used[i] = False

    explore()
    return result

print(["".join(p) for p in permutations("abc")])
print(len(permutations(range(6))))
```

A list of n items has 2^n subsets and n! permutations, so listing everything is only possible for small n. The real power of backtracking is **pruning**: dropping a branch as soon as you can tell that it cannot lead to a solution. The classic example is the **n-queens** puzzle: place n queens on an n x n chess board so that none attacks another. Place one queen in each row, and skip any column or diagonal that is already attacked:

```python run
def count_queens(n):
    columns = set()
    diagonals = set()              # row - column is the same along one diagonal
    anti_diagonals = set()         # row + column is the same along the other

    def place(row):
        if row == n:
            return 1
        total = 0
        for column in range(n):
            if column in columns or row - column in diagonals or row + column in anti_diagonals:
                continue                                    # attacked: do not even try
            columns.add(column)
            diagonals.add(row - column)
            anti_diagonals.add(row + column)
            total += place(row + 1)
            columns.remove(column)
            diagonals.remove(row - column)
            anti_diagonals.remove(row + column)
        return total

    return place(0)

print([count_queens(n) for n in range(1, 9)])
```

On an 8 x 8 board there are 92 solutions. Trying every way of putting 8 queens on 64 squares would need billions of checks, while the pruned search visits only a few thousand positions.

%% question q-binary-strings-order | order
Put the lines in order so that the program prints the four binary strings `00`, `01`, `10` and `11`, one on each line. One line does not belong.
%% lines
def binary(n, prefix=""):
    if len(prefix) == n:
        print(prefix)
        return
    binary(n, prefix + "0")
    binary(n, prefix + "1")
binary(2)
%% distractors
    n = n - 1
%% expected
00
01
10
11
%% explain
The function stops when the prefix has the full length: it prints the prefix and returns. Otherwise it makes two recursive calls, first with a `"0"` added and then with a `"1"` added, so the strings come out in order. The distractor `n = n - 1` would shrink the target length, so the function would stop too early and print the wrong strings.
%% end

## Divide and conquer

You already know the third technique. In **divide and conquer** you split a problem into smaller copies of itself, **conquer** each part with the same method, and **combine** the answers. Merge sort splits a list in two halves and merges the sorted halves. Binary search splits the range in two and keeps only one half. Unlike dynamic programming, the parts are **independent**, so there is no repeated work to remember.

A short example is **fast exponentiation**. To calculate `x` to the power `n`, you do not need `n` multiplications. Calculate the power for `n // 2`, and square it, with one extra `x` when `n` is odd. The number of multiplications is about **log n**:

```python run
def power(base, exponent):
    if exponent == 0:
        return 1
    half = power(base, exponent // 2)
    if exponent % 2 == 0:
        return half * half
    return half * half * base

print(power(2, 10), power(3, 200) == 3 ** 200)
print(power(7, 100_000).bit_length())
```

The last line calculates 7 to the power 100,000, a number of more than 280,000 bits, with only 18 levels of recursion. Because the problem halves each time, the depth is **O(log n)**, so divide and conquer never meets the recursion limit.

Which technique should you try? These signs help:

| Sign in the problem | Technique to try |
|---|---|
| "How many ways?", "the smallest cost", "the longest", and the same subproblems come back | dynamic programming |
| "List every arrangement", "find a placement that obeys the rules" | backtracking, with pruning |
| The problem splits into independent halves that are combined | divide and conquer |
| One question about sorted data | binary search |

%% tip Test small cases by hand first
Before you write a recurrence, work out the answers for the smallest inputs on paper: n = 0, 1, 2, 3. They give you the base cases, they help you to see the pattern, and they become your first tests.
%% end

## Your turn

%% exercise climb-stairs | Climbing stairs, up to three steps at a time
A staircase has `n` steps. You may climb **1, 2 or 3** steps at a time. Write `ways(n)` that returns the number of different ways to reach the top. The number `ways(0)` is 1, because there is one way to do nothing. For `n = 3` there are 4 ways: 1+1+1, 1+2, 2+1 and 3. The tests ask for `ways(4000)`, a number with more than a thousand digits, and a recursive function would go far past the recursion limit, so build the answer **from the bottom up** with a loop. The program below must print:

```output
[1, 2, 4, 7, 13, 24, 44, 81]
53798080
```
%% starter
def ways(n):
    # ways(0) = 1, ways(1) = 1, ways(2) = 2.
    # After that, ways(n) is the sum of the three entries before it.
    pass

print([ways(n) for n in range(1, 9)])
print(ways(30))
%% solution
def ways(n):
    table = [1, 1, 2] + [0] * max(0, n - 2)
    for step in range(3, n + 1):
        table[step] = table[step - 1] + table[step - 2] + table[step - 3]
    return table[n]

print([ways(n) for n in range(1, 9)])
print(ways(30))
%% tests
expect_output("[1, 2, 4, 7, 13, 24, 44, 81]\n53798080")
expect(ways(0), 1)
expect(ways(1), 1)
expect(ways(2), 2)
expect(ways(10), 274)
a, b, c = 1, 1, 2
for _ in range(4000 - 2):
    a, b, c = b, c, a + b + c
expect(ways(4000), c, "ways(4000) is correct (build the answer with a loop)")
%% hint
The last move to reach step `n` was 1, 2 or 3 steps, so you came from step `n - 1`, `n - 2` or `n - 3`. That gives `ways(n) = ways(n - 1) + ways(n - 2) + ways(n - 3)`.
%% hint
Make a list `table` that starts with the answers for 0, 1 and 2 steps: `[1, 1, 2]`. Then loop `step` from 3 up to `n` and fill in `table[step]` from the three entries before it.
%% hint
A recursive solution would be 4,000 levels deep, and Python stops at about 1,000. With the loop there is no limit. Return `table[n]`, and be careful that the list is also long enough when `n` is 0, 1 or 2.
%% end

%% exercise fewest-coins | Fewest coins
Write `fewest_coins(coins, amount)` that returns the **smallest number of coins** that add up to `amount`. Each kind of coin can be used as often as you like. When the amount cannot be made, return `-1`. A **greedy** method, always taking the biggest coin, is wrong for some coin sets: with coins 1, 5 and 12 the amount 15 needs only 3 coins (5 + 5 + 5), but greedy takes 12 + 1 + 1 + 1. Use a table where `best[a]` is the fewest coins for the amount `a`. The tests use amounts up to 20,000. The program below must print:

```output
2
3
-1
0
6
```
%% starter
def fewest_coins(coins, amount):
    # best[a] = the fewest coins that make the amount a.
    pass

print(fewest_coins([1, 3, 4], 6))
print(fewest_coins([1, 5, 12], 15))
print(fewest_coins([2], 3))
print(fewest_coins([5, 10], 0))
print(fewest_coins([1, 5, 10, 25], 63))
%% solution
def fewest_coins(coins, amount):
    unreachable = amount + 1
    best = [0] + [unreachable] * amount
    for total in range(1, amount + 1):
        for coin in coins:
            if coin <= total:
                best[total] = min(best[total], best[total - coin] + 1)
    return best[amount] if best[amount] != unreachable else -1

print(fewest_coins([1, 3, 4], 6))
print(fewest_coins([1, 5, 12], 15))
print(fewest_coins([2], 3))
print(fewest_coins([5, 10], 0))
print(fewest_coins([1, 5, 10, 25], 63))
%% tests
expect_output("2\n3\n-1\n0\n6")
expect(fewest_coins([186, 419, 83, 408], 6249), 20)
expect(fewest_coins([1, 5, 10, 25, 50], 20_000), 400)
expect(fewest_coins([2], 19_999), -1)
expect(fewest_coins([7], 20_000), -1)
def reference(coins, amount):
    from collections import deque
    seen = {0}
    queue = deque([(0, 0)])
    while queue:
        total, used = queue.popleft()
        if total == amount:
            return used
        for coin in coins:
            following = total + coin
            if following <= amount and following not in seen:
                seen.add(following)
                queue.append((following, used + 1))
    return -1
import random
rng = random.Random(5)
cases = [(rng.sample(range(1, 15), rng.randrange(1, 4)), rng.randrange(0, 60)) for _ in range(40)]
mismatches = [case for case in cases if fewest_coins(*case) != reference(*case)]
check(not mismatches, "agrees with a slow reference on 40 random cases", "different for (coins, amount) such as " + str(mismatches[:2]))
%% hint
Make a list `best` where `best[a]` is the fewest coins for the amount `a`. The entry `best[0]` is 0, because no coins make 0.
%% hint
For every amount from 1 up to `amount`, try each coin that is not bigger than that amount. Using that coin means one coin plus the best answer for what is left: `best[total - coin] + 1`. Keep the smallest result.
%% hint
Fill the table with a number that is bigger than any real answer, such as `amount + 1`, to mean "cannot be made". At the end, when `best[amount]` is still that number, return `-1`.
%% end

%% exercise brackets | Every balanced bracket string
Write `brackets(n)` that returns a list of **all** the balanced strings that use `n` pairs of round brackets, in alphabetical order (`"("` comes before `")"`). For `n = 3` there are five: `((()))`, `(()())`, `(())()`, `()(())` and `()()()`. Use **backtracking**: build each string one character at a time, add `"("` while you have pairs left, and add `")"` only when there is an open bracket to close. Do not generate every possible string and filter them afterwards, because that would take far too long. The program below must print:

```output
['((()))', '(()())', '(())()', '()(())', '()()()']
['()']
['']
1430
```
%% starter
def brackets(n):
    # Build the strings one character at a time.
    # Keep track of how many "(" and how many ")" have been used so far.
    pass

print(brackets(3))
print(brackets(1))
print(brackets(0))
print(len(brackets(8)))
%% solution
def brackets(n):
    result = []

    def build(current, opened, closed):
        if len(current) == 2 * n:
            result.append(current)
            return
        if opened < n:
            build(current + "(", opened + 1, closed)
        if closed < opened:
            build(current + ")", opened, closed + 1)

    build("", 0, 0)
    return result

print(brackets(3))
print(brackets(1))
print(brackets(0))
print(len(brackets(8)))
%% tests
expect_output("['((()))', '(()())', '(())()', '()(())', '()()()']\n['()']\n['']\n1430")
expect(brackets(2), ["(())", "()()"])
if calls("permutations") or calls("product") or calls("combinations"):
    check(False, "build the strings one character at a time, not with itertools")
else:
    expect(len(brackets(10)), 16796)
    four = brackets(4)
    check(four == sorted(four), "the results are in alphabetical order")
    def balanced(text):
        depth = 0
        for character in text:
            depth += 1 if character == "(" else -1
            if depth < 0:
                return False
        return depth == 0
    six = brackets(6)
    check(len(six) == 132 and len(set(six)) == 132 and all(balanced(text) and len(text) == 12 for text in six), "132 different balanced strings for n = 6")
%% hint
Write a helper `build(current, opened, closed)` inside `brackets`. It adds one character at a time. When `current` has `2 * n` characters, the string is complete: save it.
%% hint
You may add `"("` when `opened < n`. You may add `")"` only when `closed < opened`, because otherwise there is nothing to close and the string could never be balanced.
%% hint
Try `"("` before `")"`, and the results come out in alphabetical order. Strings cannot be changed, so passing `current + "("` to the next call needs no separate undo step.
%% end

%% exercise best-value | Challenge: The treasure bag
Write `best_value(items, capacity)`. Each item is a pair `(weight, value)`, and the bag holds a total weight of at most `capacity`. Choose items, each **at most once**, to get the biggest possible total value, and return that value. Trying every subset needs 2^n checks, which is impossible for 100 items. Use a table `best[w]`, the biggest value that fits into weight `w`, and update it once for each item. The program below must print:

```output
9
0
0
220
```
%% starter
def best_value(items, capacity):
    # best[w] = the biggest value that fits into weight w. Update it once for each item.
    pass

print(best_value([(1, 1), (3, 4), (4, 5), (5, 7)], 7))
print(best_value([], 10))
print(best_value([(5, 10)], 4))
print(best_value([(10, 60), (20, 100), (30, 120)], 50))
%% solution
def best_value(items, capacity):
    best = [0] * (capacity + 1)
    for weight, value in items:
        for w in range(capacity, weight - 1, -1):
            best[w] = max(best[w], best[w - weight] + value)
    return best[capacity]

print(best_value([(1, 1), (3, 4), (4, 5), (5, 7)], 7))
print(best_value([], 10))
print(best_value([(5, 10)], 4))
print(best_value([(10, 60), (20, 100), (30, 120)], 50))
%% tests
expect_output("9\n0\n0\n220")
expect(best_value([(2, 3)], 0), 0)
expect(best_value([(2, 3), (2, 4)], 3), 4)
expect(best_value([(1, 5)], 10), 5, "an item can be taken only once")
def brute(items, capacity):
    best = 0
    for mask in range(1 << len(items)):
        weight = value = 0
        for index, (w, v) in enumerate(items):
            if mask >> index & 1:
                weight += w
                value += v
        if weight <= capacity:
            best = max(best, value)
    return best
import random
rng = random.Random(9)
cases = [([(rng.randrange(1, 9), rng.randrange(1, 20)) for _ in range(rng.randrange(0, 9))], rng.randrange(0, 25)) for _ in range(30)]
mismatches = [case for case in cases if best_value(*case) != brute(*case)]
check(not mismatches, "agrees with a brute-force search on 30 random cases", "different for " + str(mismatches[:1]))
def table_reference(items, capacity):
    rows = [[0] * (capacity + 1) for _ in range(len(items) + 1)]
    for i, (weight, value) in enumerate(items, start=1):
        for w in range(capacity + 1):
            rows[i][w] = rows[i - 1][w]
            if weight <= w:
                rows[i][w] = max(rows[i][w], rows[i - 1][w - weight] + value)
    return rows[-1][capacity]
big = [(rng.randrange(1, 31), rng.randrange(1, 101)) for _ in range(100)]
expect(best_value(big, 1000), table_reference(big, 1000), "100 items and a capacity of 1000 are solved quickly")
kept = list(big)
best_value(big, 500)
expect(big, kept, "the list of items is not changed")
%% hint
Keep a list `best` of length `capacity + 1`. Entry `best[w]` is the biggest value that fits into weight `w`. At the start every entry is 0, because with no items nothing has any value.
%% hint
Handle the items one at a time. For an item `(weight, value)`, the entry `best[w]` may improve to `best[w - weight] + value`. Take the bigger of the old and the new number, for every `w` from `weight` up to `capacity`.
%% hint
Loop `w` **downwards**, with `range(capacity, weight - 1, -1)`. Then `best[w - weight]` still belongs to the situation without the current item, so the item is used at most once. The answer is `best[capacity]`.
%% end

## What you learned

- A recursive function makes a **tree of calls**. When the same smaller problem appears again and again (**overlapping subproblems**), the work grows exponentially, as in the plain `fib`.
- **Memoisation** (top-down) remembers the answer of each call in a dictionary. `@functools.cache` does it for you, and `cache_info()` shows the hits and misses. The function must be pure, and its arguments must be hashable.
- Recursion is limited to about **1,000 levels** in Python, and less through `@cache` on this site. **Bottom-up** dynamic programming fills a table with a loop, so it has no depth limit, and it can often keep only the last few entries to save memory.
- The recipe for dynamic programming is: define the subproblem, write the recurrence, set the base cases, choose the order, and read the answer from the table.
- **Coin change** shows that greedy methods can fail and a table does not. **Longest common subsequence** uses a two-dimensional table (O(n x m)), and **0/1 knapsack** loops the capacity **backwards** so that each item is used once.
- **Backtracking** builds all solutions by choosing, exploring and then **undoing** the choice. It lists subsets and permutations, and **pruning** the branches that cannot work makes searches such as n-queens practical.
- **Divide and conquer** splits a problem into independent parts and combines the answers, as in merge sort, binary search and fast exponentiation (about log n multiplications).
- Work out the smallest cases by hand first, because they give you the base cases and your first tests.
