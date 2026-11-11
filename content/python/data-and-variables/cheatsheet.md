---
title: Data and variables: cheat sheet
---
## Variables

```python
price = 250             # assign: the name goes on the left
price += 50             # update: price is now 300
a, b = 1, 2             # several at once
a, b = b, a             # swap two values
SERVICE_CHARGE = 250    # UPPER_CASE marks a constant
```

Names use letters, digits and underscores, never start with a digit, and are case sensitive. Write them in snake_case. A variable stores a value, not a formula.

| Shortcut | Means |
| --- | --- |
| `x += 3`, `x -= 3` | add, subtract |
| `x *= 3`, `x /= 3` | multiply, divide |
| `x //= 3`, `x %= 3`, `x **= 3` | whole division, remainder, power |

## Kinds of data

| Type | Examples | Notes |
| --- | --- | --- |
| `int` | `42`, `-7`, `1_000_000` | any size; `//` and `%` keep ints |
| `float` | `3.14`, `2.0` | `/` always gives a float; `0.1 + 0.2` is not exactly 0.3 |
| `str` | `"hello"`, `'Ada'` | `"7" + "7"` is `"77"` |
| `bool` | `True`, `False` | counts as 1 and 0 in arithmetic |
| `NoneType` | `None` | "no value yet" |

```python
type(42)              # <class 'int'>
int("42")             # 42
int(3.9)              # 3  (cuts, does not round)
float("2.5")          # 2.5
str(12)               # "12"
round(2.567, 1)       # 2.6
int("3.5")            # ValueError: use int(float("3.5"))
```

## Reading input

```python
name = input("Name: ")            # always text
age = int(input("Age: "))         # whole number
price = float(input("Price: "))   # decimal number
w, h = input("W H: ").split()     # two pieces of text
x, y = input("x,y: ").split(",")  # split at commas
```

Plan a talking program in four steps: ask, convert, calculate, show.

## f-strings

```python
f"{name} is {age} years old"
f"{price:.2f}"        # 1234.50
f"{price:,.2f}"       # 1,234.50
f"{7:02d}"            # 07
f"{'hi':>8}"          # right-aligned in 8
f"{'hi':<8}"          # left-aligned
f"{'hi':^8}"          # centred
```

## Text tools

```text
 P  y  t  h  o  n
 0  1  2  3  4  5
-6 -5 -4 -3 -2 -1
```

```python
s = "Python"
len(s)          # 6
s[0], s[-1]     # 'P', 'n'
s[1:4]          # 'yth'   (stops before 4)
s[:2], s[3:]    # 'Py', 'hon'
s[::2]          # 'Pto'
s[::-1]         # 'nohtyP'
"thon" in s     # True
```

| Method | Result |
| --- | --- |
| `upper()`, `lower()`, `title()`, `capitalize()` | change the case |
| `strip()`, `lstrip()`, `rstrip()` | remove spaces at the ends |
| `replace(old, new)` | swap pieces |
| `count(part)`, `find(part)` | how many, where (`-1` if missing) |
| `startswith(x)`, `endswith(x)` | `True` or `False` |
| `isdigit()`, `isalpha()` | what is it made of? |

Strings never change: a method returns a new string, so store it. Chain methods from left to right: `name.strip().title()`.
