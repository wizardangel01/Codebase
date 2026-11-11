---
title: Lists: cheat sheet
---
## Creating and reading

```python
crew = ["Ada", "Grace", "Linus", "Margaret"]
crew[0]            # "Ada": the first item
crew[-1]           # "Margaret": the last item
crew[1:3]          # ["Grace", "Linus"]: a new list
len(crew)          # 4
"Ada" in crew      # True
```

Indexes start at 0, and an index that is too big raises an IndexError. A slice never raises one.

## Changing a list

| Method | What it does |
| --- | --- |
| `items.append(x)` | add one item at the end |
| `items.insert(i, x)` | add one item at position `i` |
| `items.extend(more)` | add every item of another list |
| `items.remove(x)` | delete the first item equal to `x` (ValueError if missing) |
| `items.pop()` | remove and return the last item |
| `items.pop(i)` | remove and return the item at `i` |
| `del items[i]` | delete by position, `del items[a:b]` deletes a slice |
| `items.clear()` | empty the list |
| `items[i] = x` | replace one item |

## Searching, counting and sorting

```python
items.index(x)         # position of the first match (ValueError if missing)
items.count(x)         # how many times x occurs
sorted(items)          # a new sorted list
items.sort()           # sorts in place, returns None
items.reverse()        # reverses in place
sorted(items, reverse=True)
sorted(words, key=len)
min(items), max(items), sum(items)
```

## Looping

```python
for item in items: ...
for number, item in enumerate(items, start=1): ...
for a, b in zip(list_a, list_b): ...

result = []                    # build a new list
for item in items:
    if item > 0:               # filter: keep some
        result.append(item * 2)  # map: change each
```

Never add to or remove from a list while you loop over it.

## From text to list and back

```python
words = "to be or not".split()      # ["to", "be", "or", "not"]
numbers = []
for text in line.split():
    numbers.append(int(text))
" ".join(words)                      # "to be or not"
", ".join(["a", "b"])                # "a, b" (items must be strings)
```

## Tuples, unpacking and copies

```python
point = (3, 4)           # immutable
single = (5,)            # one item needs a comma
x, y = point             # unpacking
first, *rest = items     # rest gets the remaining items
a, b = b, a              # swap

b = a                    # same list, two names!
b = a.copy()             # real copies: a.copy(), a[:], list(a)
```

## Grids

```python
grid = [[1, 2, 3], [4, 5, 6]]
grid[1][2]               # row 1, column 2: 6
board = []
for _ in range(3):       # never [[0] * 3] * 3
    board.append([0] * 3)
```

## Recipes

```python
unique = []                         # remove repeats, keep order
for x in items:
    if x not in unique:
        unique.append(x)

stack: append(x) and pop()          # last in, first out
queue: append(x) and pop(0)         # first in, first out
items[::-1]   items[::2]            # reverse, every second item
items[k:] + items[:k]               # rotate left by k
```

## Common mistakes

| Mistake | Fix |
| --- | --- |
| `items = items.sort()` | `items.sort()` on its own line |
| `b = a` to copy | `b = a.copy()` |
| `append([1, 2])` meaning two items | `extend([1, 2])` |
| `", ".join(numbers)` | convert with `str()` first |
| removing items inside a `for` loop | build a new list instead |
| `[[0] * 3] * 3` | build the rows in a loop |
