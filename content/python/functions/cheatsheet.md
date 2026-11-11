---
title: Functions: cheat sheet
---
## Defining and calling

```python
def area(width, height):
    """Return the area of a rectangle."""
    return width * height

area(3, 4)                   # 12, arguments by position
area(height=4, width=3)      # 12, arguments by name
```

`return` hands a value back and ends the function, while `print` only shows it. A function that ends without `return` gives back `None`. Test for it with `if result is None:`.

## Parameters

```python
def greet(name, greeting="Hello"): ...     # a default value
def total(*numbers): ...                   # extra arguments arrive as a tuple
def profile(name, **details): ...          # extra keywords arrive as a dictionary
def join(words, *, sep=" "): ...           # sep must be given by keyword
```

The order is: ordinary parameters, `*args`, keyword-only parameters, `**kwargs`.

```python
f(*items)                         # spread a list or tuple into arguments
f(**options)                      # spread a dictionary into keyword arguments
low, high = min_max(numbers)      # return a, b gives a tuple, unpack it
```

Never use a list, dictionary or set as a default value. Use `None` instead:

```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

## Scope

| Where | Rule |
| --- | --- |
| Local | names made in a function, and its parameters, exist only during the call |
| Global | a function may read them, but assigning to the name makes a new local one |
| Built-in | `print`, `len`, `sorted` and so on: never use them as variable names |
| Search order | Local, Enclosing, Global, Built-in (LEGB) |

Prefer parameters and `return` over the `global` keyword.

## Functions as values

```python
say = shout                           # a second name for the function
actions = {"shout": shout}            # functions in a dictionary
sorted(words, key=len)                # pass len, do not call it
sorted(players, key=lambda p: p[1])   # a lambda is one expression
```

`f` is the function, and `f()` calls it.

## Recursion

```python
def factorial(n):
    if n <= 1:                       # base case: answer directly
        return 1
    return n * factorial(n - 1)      # recursive case: a smaller problem
```

- Every call has its own frame on the call stack.
- No base case, or no progress towards it, ends in a RecursionError (about a thousand calls deep).
- The same value worked out again and again? Remember it in a dictionary, or use a loop.
- Recursion suits nested or branching problems. A loop is clearer for plain counting.
