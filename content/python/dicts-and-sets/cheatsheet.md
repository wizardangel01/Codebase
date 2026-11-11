---
title: Dictionaries and sets: cheat sheet
---
## Dictionaries: create, read, change

```python
phone = {"Ada": "0803-111", "Grace": "0805-222"}
phone["Ada"]                  # "0803-111" (KeyError if the key is missing)
phone.get("Zed")              # None
phone.get("Zed", "unknown")   # "unknown"
phone["Linus"] = "0807-333"   # add a key, or replace its value
del phone["Grace"]            # remove (KeyError if missing)
phone.pop("Zed", None)        # remove and return, with a default
"Ada" in phone                # True: in checks the keys
len(phone)                    # number of entries
```

Keys must be immutable: strings, numbers and tuples are fine, lists, dictionaries and sets are not. Each key appears once, and a dictionary keeps the order of insertion.

## Looping and views

```python
for key in phone: ...
for key, value in phone.items(): ...
for value in phone.values(): ...
list(phone.keys())
```

## Building and combining

```python
dict(zip(names, ages))     # two lists become one dictionary
a.update(b)                # copy the entries of b into a
c = a | b                  # a new dictionary, the right side wins
```

## Patterns

```python
counts[k] = counts.get(k, 0) + 1              # count
groups.setdefault(k, []).append(item)         # group
inverted[value] = key                         # swap (values are unique)
inverted.setdefault(value, []).append(key)    # swap (values repeat)
max(d, key=d.get)                             # key with the biggest value
sorted(d, key=d.get, reverse=True)            # keys ranked by value
points.get(grade, "unknown")                  # lookup table instead of elif
```

## Sets

```python
unique = set(items)    # remove repeats (the order is lost)
empty = set()          # {} is an empty dictionary!
s.add(x)               # put in
s.remove(x)            # take out (KeyError if missing)
s.discard(x)           # take out (no error)
x in s                 # fast test
sorted(s)              # a list in a fixed order
```

```python
a = {1, 2, 3}
b = {3, 4}
a | b      # {1, 2, 3, 4}   union: in a or in b
a & b      # {3}            intersection: in both
a - b      # {1, 2}         difference: in a, not in b
a ^ b      # {1, 2, 4}      in exactly one of the two
a <= b     # False          is a inside b?
```

## Choosing a container

| Container | Use it for | Find an item by |
| --- | --- | --- |
| list | ordered items that change | position |
| tuple | a fixed group of values | position |
| dictionary | values looked up by a name | key |
| set | different items, "is it there?" | `in` |

## Nested data and copies

```python
shop["products"][1]["name"]     # one pair of brackets for each level
import copy
backup = copy.deepcopy(shop)    # copy() is shallow: inner containers are shared
```
