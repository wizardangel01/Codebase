---
title: Loops: cheat sheet
---
## for loops

```python
for i in range(5):            # i is 0, 1, 2, 3, 4
    print(i)

for letter in "Python":       # one round per character
    print(letter)

for _ in range(3):            # _ means "I do not need the number"
    print("Hip hip hooray!")
```

| Call | Numbers |
| --- | --- |
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(2, 6)` | 2, 3, 4, 5 |
| `range(0, 10, 2)` | 0, 2, 4, 6, 8 |
| `range(5, 0, -1)` | 5, 4, 3, 2, 1 |

The stop number is never included. To count from `a` to `b` with both ends, write `range(a, b + 1)`. The number of rounds for step 1 is `stop - start`.

## while loops

```python
count = 1                     # set up
while count <= 3:             # test, before every round
    print(count)
    count += 1                # change, or the loop never ends
```

- If the condition is false at the start, the body never runs.
- A loop that never ends is stopped after 10 seconds on this site. On your own computer press Ctrl+C.
- `while True:` with a `break` inside repeats until something happens.

## break and continue

```python
for n in range(1, 10):
    if n % 3 == 0:
        continue              # skip to the next round
    if n == 8:
        break                 # leave the loop now
    print(n)
```

In nested loops, `break` and `continue` only affect the innermost loop.

## Nested loops

```python
for row in range(1, 4):
    for column in range(1, 4):
        print(f"{row * column:3}", end="")   # end="" stays on the line
    print()                                    # finishes the row
```

The inner body runs `outer rounds * inner rounds` times. `"*" * 5` repeats a string.

## Recipes

```python
# count matches
count = 0
for letter in text:
    if letter in "aeiou":
        count += 1

# total and average
total = 0
for _ in range(n):
    total += int(input())
average = total / n

# largest so far: start with a real value from the data
largest = first
for _ in range(n - 1):
    value = int(input())
    if value > largest:
        largest = value

# search with a flag
found = False
for letter in text:
    if letter.isdigit():
        found = True
        break

# take a number apart
while n > 0:
    digit = n % 10
    n = n // 10

# read until a sentinel
while True:
    text = input()
    if text == "stop":
        break
```

## Random numbers

```python
import random
random.seed(7)                # optional: repeatable numbers
random.randint(1, 6)          # 1 to 6, both ends included
```

## Common mistakes

| Mistake | Fix |
| --- | --- |
| `range(1, 10)` when you wanted 10 | `range(1, 11)` |
| `total = 0` inside the loop | put it before the loop |
| nothing changes the `while` condition | add the update line |
| `largest = 0` for any numbers | start with the first value |
| `print()` indented too far in a grid | indent it to the inner `for` level |
| `range(2.5)` | use whole numbers: `int()` or `//` |
