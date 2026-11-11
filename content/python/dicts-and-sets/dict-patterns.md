---
title: Dictionary patterns
---
Once you know the basics, a handful of patterns cover most of what dictionaries are used for: counting things, grouping things, turning a dictionary around, finding the best entry and replacing long chains of `elif`. Each pattern is only a few lines long, and you will use them again and again.

## Counting

How often does each letter appear in a text? Keep a dictionary from letter to count. For each letter, read the old count (or 0 if there is none), add 1 and store it:

```python run
text = "hello world"
counts = {}
for letter in text:
    if letter != " ":
        counts[letter] = counts.get(letter, 0) + 1
print(counts)
```

The key to the pattern is `counts.get(letter, 0) + 1`. For a new letter, `get` gives the default 0, so the count becomes 1. For a letter that is already there, it gives the existing count. The same lines count words when the loop runs over `text.split()`.

%% question q-count-predict | predict
What does this program print?

```python
counts = {}
for ch in "abca":
    counts[ch] = counts.get(ch, 0) + 1
print(counts)
```
%% answer
{'a': 2, 'b': 1, 'c': 1}
%% explain
The letter `a` is seen twice, and `b` and `c` once each. A dictionary keeps the order of first appearance, so the keys are `a`, `b` and `c`.
%% end

## Grouping

Grouping is counting's big sister. Instead of a number, every key holds a **list** of the items that belong to it. The method `setdefault(key, default)` is perfect: when the key is missing it stores the default and returns it, and otherwise it returns what is already stored:

```python run
words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = {}
for word in words:
    first = word[0]
    groups.setdefault(first, []).append(word)
print(groups)
```

Without `setdefault`, the same job needs a check:

```python run
words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = {}
for word in words:
    first = word[0]
    if first not in groups:
        groups[first] = []
    groups[first].append(word)
print(groups)
```

%% question q-setdefault-choice | choice
What does `groups.setdefault("b", [])` do when the key `"b"` is missing from `groups`?
%% choice
It raises a KeyError.
%% choice correct
It stores an empty list under `"b"` and returns that list.
%% choice
It returns `None` and changes nothing.
%% choice
It deletes the key `"b"`.
%% explain
`setdefault` makes sure that the key exists. The new default value is stored and also returned, so you can call `.append(...)` on the result in the same line. If the key already exists, nothing is replaced.
%% end

## Turning a dictionary around

Sometimes you have a dictionary from names to colours and you want colours to names. When every value is different, you can swap in a loop:

```python run
codes = {"A": 1, "B": 2, "C": 3}
swapped = {}
for letter, number in codes.items():
    swapped[number] = letter
print(swapped)
```

When values repeat, a plain swap would overwrite entries. Group instead, so that each colour keeps a list of names:

```python run
colours = {"apple": "red", "banana": "yellow", "cherry": "red"}
inverted = {}
for fruit, colour in colours.items():
    inverted.setdefault(colour, []).append(fruit)
print(inverted)
```

## The best entry and the ranking

`max` and `sorted` accept a `key` option that says how to compare the items. For a dictionary, the method `get` is a perfect key, because it turns each key into its value. Write `get` without brackets, because you are handing over the method and not calling it:

```python run
scores = {"Ada": 91, "Grace": 85, "Linus": 91, "Margaret": 78}
best = max(scores, key=scores.get)
print(best, scores[best])
ranking = sorted(scores, key=scores.get, reverse=True)
print(ranking)
```

`max` returns the **key** with the biggest value. When two keys tie, the one that comes first in the dictionary wins, and `sorted` keeps tied keys in their original order.

%% question q-max-key | predict
What does this program print?

```python
ages = {"Ada": 36, "Grace": 45, "Linus": 28}
print(max(ages, key=ages.get))
```
%% answer
Grace
%% explain
`max` compares the keys by their values. The biggest value is 45, which belongs to the key `"Grace"`, and `max` returns the key, not the value.
%% end

## Lookup tables instead of long elif chains

A chain of `elif` statements that turns one value into another is better written as a dictionary. The data sits in one place, the code is short, and a default is a small change:

```python run stdin="B"
grade = input("Grade: ")
points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
print("Points:", points.get(grade, "unknown grade"))
```

## Records and lists of records

A dictionary with a few fixed keys is a **record**: one student, one product, one crew member. A list of records is a table, and loops can process it:

```python run
team = [
    {"name": "Ada", "role": "captain", "age": 36},
    {"name": "Grace", "role": "pilot", "age": 45},
    {"name": "Linus", "role": "engineer", "age": 28},
]
for member in team:
    print(member["name"], "-", member["role"])
total = 0
for member in team:
    total += member["age"]
print("Average age:", round(total / len(team), 1))
```

## A small project: word frequency

Counting and ranking together make a real tool, the word-frequency counter. It reads a sentence, counts every word and prints the words from the most common to the least common:

```python run stdin="the cat and the dog and the bird"
words = input("Text: ").split()
counts = {}
for word in words:
    counts[word] = counts.get(word, 0) + 1
for word in sorted(counts, key=counts.get, reverse=True):
    print(word, counts[word])
```

Change the text and run it again. With a bigger text you could find the words that a writer uses most.

%% question q-lookup-fill | fill
Fill in the blank so that the program prints `unknown`.

```python
days = {"Mon": "Monday", "Tue": "Tuesday"}
print(days.___("Fri", "unknown"))
```
%% answer
get
%% expected
unknown
%% explain
`get` returns the second argument when the key is missing. There is no `"Fri"` key, so `unknown` is printed.
%% end

## Your turn

%% exercise letter-count | Letter count
Read a word. Print each different letter with the number of times it appears, one per line, in the order of first appearance, in the form `l: 2`. For the input `hello` the program prints:

```output
h: 1
e: 1
l: 2
o: 1
```
%% stdin
hello
%% starter
# Count the letters with a dictionary.

%% solution
word = input()
counts = {}
for letter in word:
    counts[letter] = counts.get(letter, 0) + 1
for letter, number in counts.items():
    print(f"{letter}: {number}")
%% tests
expect_output("h: 1\ne: 1\nl: 2\no: 1")
check(rerun("aaa").strip() == "a: 3", "one repeated letter")
check(rerun("abca").strip() == "a: 2\nb: 1\nc: 1", "a repeat at the end")
%% hint
Start with an empty dictionary, and update it once for every letter.
%% hint
The new count is `counts.get(letter, 0) + 1`.
%% hint
Print with `for letter, number in counts.items():` after the counting loop.
%% end

%% exercise group-by-length | Group by length
Read a line of words. Group the words by their length. Print one line for each length, from the shortest to the longest, in the form `3: cat dog`. The words in a line keep their original order. For the input `cat dog bird fish ox` the program prints:

```output
2: ox
3: cat dog
4: bird fish
```
%% stdin
cat dog bird fish ox
%% starter
# Use the length of a word as the key.

%% solution
groups = {}
for word in input().split():
    groups.setdefault(len(word), []).append(word)
for length in sorted(groups):
    joined = " ".join(groups[length])
    print(f"{length}: {joined}")
%% tests
expect_output("2: ox\n3: cat dog\n4: bird fish")
check(rerun("a bb cc d").strip() == "1: a d\n2: bb cc", "two groups")
check(rerun("xyz").strip() == "3: xyz", "one word")
%% hint
The key is a number: `len(word)`. Each value is a list of words.
%% hint
`groups.setdefault(len(word), []).append(word)` does the grouping in one line.
%% hint
`sorted(groups)` gives the lengths from the smallest to the biggest.
%% end

%% exercise top-scorer | Top scorer
Read lines of the form `name score` until a line says `end`. Every name appears once. Print the best player in the form `Best: Ada (91)`. If two players have the same top score, print the one that came first. For the input `Ada 91`, `Grace 85` and `end` the program prints:

```output
Best: Ada (91)
```
%% stdin
Ada 91
Grace 85
end
%% starter
# Store the scores, then find the best one.

%% solution
scores = {}
while True:
    line = input()
    if line == "end":
        break
    name, score = line.split()
    scores[name] = int(score)
best = max(scores, key=scores.get)
print(f"Best: {best} ({scores[best]})")
%% tests
expect_output("Best: Ada (91)")
check(rerun("x 5\ny 9\nz 7\nend").strip() == "Best: y (9)", "the best is in the middle")
check(rerun("a 3\nb 3\nend").strip() == "Best: a (3)", "a tie goes to the first player")
check(rerun("solo 1\nend").strip() == "Best: solo (1)", "a single player")
%% hint
Store each score as a number, so that the comparison is numeric.
%% hint
`max(scores, key=scores.get)` returns the name with the biggest score.
%% hint
Print the result with an f-string that uses both `best` and `scores[best]`.
%% end

%% exercise top-three-words | Challenge: Top three words
Read a line of text. Print the three most common words, one per line, in the form `the 3`, from the most common to the least common. Words with the same count keep their order of first appearance. If there are fewer than three different words, print them all. For the input `the cat and the dog and the bird` the program prints:

```output
the 3
and 2
cat 1
```
%% stdin
the cat and the dog and the bird
%% starter
# Count the words, rank them, print the first three.

%% solution
words = input().split()
counts = {}
for word in words:
    counts[word] = counts.get(word, 0) + 1
ranking = sorted(counts, key=counts.get, reverse=True)
for word in ranking[:3]:
    print(word, counts[word])
%% tests
expect_output("the 3\nand 2\ncat 1")
check(rerun("a a b").strip() == "a 2\nb 1", "fewer than three words")
check(rerun("x").strip() == "x 1", "one word")
check(rerun("b a b a c").strip() == "b 2\na 2\nc 1", "ties keep their order")
%% hint
Count first, then rank the keys with `sorted(counts, key=counts.get, reverse=True)`.
%% hint
A slice of the ranking, `ranking[:3]`, gives at most three words.
%% hint
Print each word with its count inside a `for` loop over that slice.
%% end

## What you learned

- Counting uses `counts[key] = counts.get(key, 0) + 1`. Grouping uses `groups.setdefault(key, []).append(item)`.
- To invert a dictionary, loop over `.items()`. Group the keys into lists when the values repeat.
- `max(d, key=d.get)` gives the key with the biggest value, and `sorted(d, key=d.get, reverse=True)` ranks the keys.
- A dictionary can replace a long `elif` chain, with `get(key, default)` as the final `else`.
- A dictionary with fixed keys is a record, and a list of records is a table.
- Counting and ranking together make a word-frequency counter.
