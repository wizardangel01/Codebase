---
title: Dictionaries and sets: module quiz
pass: 70
---
Twelve questions on everything in this module: dictionaries, the counting and grouping recipes, sets and the choice between containers. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | choice
The dictionary `prices` has no key `"eggs"`. Which expression gives `0` instead of an error?
%% choice
`prices["eggs"]`
%% choice
`prices.get("eggs")`
%% choice correct
`prices.get("eggs", 0)`
%% choice
`prices.pop("eggs")`
%% explain
`get` takes a default as its second argument and returns it for a missing key. `prices["eggs"]` and `prices.pop("eggs")` raise a KeyError, and `prices.get("eggs")` returns `None`.
%% end

%% question q2 | predict
What does this program print?

```python
d = {"a": 1, "b": 2}
d["c"] = 3
d["a"] += 10
del d["b"]
print(d)
```
%% answer
{'a': 11, 'c': 3}
%% explain
`d["c"] = 3` adds a key, `d["a"] += 10` changes the value 1 to 11, and `del d["b"]` removes the key `b`. A dictionary keeps the order of insertion, so `a` comes before `c`.
%% end

%% question q3 | multi
Select every expression that runs **without** an error.
%% choice correct
`{"a": 1}["a"]`
%% choice correct
`{(1, 2): "p"}[(1, 2)]`
%% choice
`{[1, 2]: "p"}`
%% choice
`{"a": 1}["b"]`
%% choice correct
`{"a": 1}.get("b")`
%% explain
A string key that exists and a tuple key that exists are fine, and `get` never raises a KeyError. A list cannot be a key (a TypeError), and looking up a missing key with square brackets raises a KeyError.
%% end

%% question q4 | fill
Fill in the blank so that the program prints `{'a': 2, 'b': 1}`.

```python
counts = {}
for ch in "aab":
    counts[ch] = counts.___(ch, 0) + 1
print(counts)
```
%% answer
get
%% expected
{'a': 2, 'b': 1}
%% explain
`counts.get(ch, 0)` gives the old count, or 0 for a letter that has not been counted yet. Adding 1 and storing the result counts every letter.
%% end

%% question q5 | order
Put the lines in order so that the program prints `{'a': ['apple', 'avocado'], 'b': ['banana']}`. One line does not belong.
%% lines
words = ["apple", "avocado", "banana"]
groups = {}
for word in words:
    groups.setdefault(word[0], []).append(word)
print(groups)
%% distractors
groups[word[0]].append(word)
%% expected
{'a': ['apple', 'avocado'], 'b': ['banana']}
%% explain
The word list and the empty dictionary come first. `setdefault` creates the list for a new first letter and returns the list that is stored, so `append` works for old and new letters alike. The line `groups[word[0]].append(word)` fails with a KeyError the first time a letter appears.
%% end

%% question q6 | choice
What does `max(scores, key=scores.get)` return when `scores` is a dictionary from names to numbers?
%% choice
The biggest number.
%% choice correct
The name that has the biggest number.
%% choice
The name that comes last in the alphabet.
%% choice
A pair of the name and the number.
%% explain
`max` looks at the keys, and `key=scores.get` tells it to compare them by their values. The result is the key with the biggest value, and the value itself is found with `scores[best]`.
%% end

%% question q7 | predict
What does this program print?

```python
a = {1, 2, 3}
b = {3, 4}
print(sorted(a | b), len(a & b))
```
%% answer
[1, 2, 3, 4] 1
%% explain
`a | b` is the union, `{1, 2, 3, 4}`, and `sorted` turns it into a list. `a & b` is the intersection, which holds only the number 3, so its length is 1.
%% end

%% question q8 | multi
Select every job that a set does best.
%% choice correct
Remove the repeats from a list of IDs.
%% choice correct
Check quickly whether a name has been seen before.
%% choice correct
Find the items that two groups share.
%% choice
Store the price of each product.
%% choice
Keep scores in the order in which they were entered.
%% explain
Sets keep different items, answer `in` quickly and have the operators `|`, `&` and `-`. Prices belong to names, which is a job for a dictionary, and an order of entry is a job for a list.
%% end

%% question q9 | predict
What does this program print?

```python
shop = {"items": [{"name": "tea", "price": 300}]}
print(shop["items"][0]["price"] + 50)
```
%% answer
350
%% explain
Read the path from left to right: the dictionary `shop`, the list under `"items"`, its first item (a dictionary), and the number under `"price"`, which is 300. Adding 50 gives 350.
%% end

%% question q10 | choice
After the following lines, what does `backup["members"]` hold?

```python
team = {"name": "Rockets", "members": ["Ada"]}
backup = team.copy()
team["members"].append("Zed")
```
%% choice
`["Ada"]`
%% choice correct
`["Ada", "Zed"]`
%% choice
`[]`
%% choice
Nothing: the last line raises an error.
%% explain
`copy()` is shallow. The two dictionaries are separate, but they share the same list of members, so the new member shows up in both. `copy.deepcopy(team)` would have made the backup independent.
%% end

%% question q11 | fill
Fill in the blank so that the program prints `{'red': ['apple', 'cherry']}`.

```python
colours = {"apple": "red", "cherry": "red"}
inverted = {}
for fruit, colour in colours.items():
    inverted.___(colour, []).append(fruit)
print(inverted)
```
%% answer
setdefault
%% expected
{'red': ['apple', 'cherry']}
%% explain
Two fruits share the colour red, so the inverted dictionary needs a list for each colour. `setdefault` creates an empty list for a new colour and returns the list that is stored.
%% end

%% question q12 | choice
A robot program must remember every square (row, column) that the robot has visited, and quickly test whether a square was visited before. Which container fits best?
%% choice correct
A set of (row, column) tuples.
%% choice
A list of lists, searched one by one.
%% choice
A tuple of tuples that is rebuilt after every move.
%% choice
A dictionary that maps each row to one column.
%% explain
Only "has it been visited?" matters, and every square counts once, which is the job of a set. Tuples can be set items because they are immutable. A dictionary from row to one column could not hold two squares of the same row.
%% end
