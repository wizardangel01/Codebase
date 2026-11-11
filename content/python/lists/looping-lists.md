---
title: Looping over lists
---
A list is only as useful as the things you can do with all of its items: greet every player, add up every price, find every score above 50. Loops are the tool for that. In this lesson you combine the `for` loop from the last module with lists. You will visit every item, number the items, walk through two lists together and build new lists as you go.

## Visiting every item

A `for` loop can take its values straight from a list. The loop variable receives the items one at a time, from the first to the last:

```python run
crew = ["Ada", "Grace", "Linus"]
for name in crew:
    print("Hello,", name)
```

Choose a loop variable name that says what one item is: `name` for a list of `crew`, `score` for a list of `scores`. That makes the loop read like a sentence.

## Why not range(len())?

Programmers who know other languages often loop over positions instead. It works, but it is clumsy:

```python run
crew = ["Ada", "Grace", "Linus"]
for i in range(len(crew)):
    print(i, crew[i])
```

The version that visits the items directly is shorter and cannot go out of range. Use the positions only when you really need them, and then use `enumerate`, which is the next idea.

## enumerate: items with numbers

`enumerate(items)` hands you the position and the item together. The loop line has two variable names, and Python fills them in with the pair. The option `start=1` makes the numbering begin at 1, which is how people count:

```python run
crew = ["Ada", "Grace", "Linus"]
for number, name in enumerate(crew, start=1):
    print(number, name)
```

Without `start`, the numbering begins at 0, which is how Python counts. The next lesson explains what the pair really is.

%% question q-enumerate-predict | predict
What does this program print?

```python
total = 0
for index, value in enumerate([10, 20, 30]):
    total += index * value
print(total)
```
%% answer
80
%% explain
Without `start`, the positions are 0, 1 and 2. The products are 0 * 10, 1 * 20 and 2 * 30, which add up to 0 + 20 + 60 = 80.
%% end

## zip: two lists side by side

When two lists belong together, `zip` walks through them at the same time and gives you one item from each:

```python run
names = ["Ada", "Grace", "Linus"]
scores = [90, 85, 70]
for name, score in zip(names, scores):
    print(name, "scored", score)
```

If the lists have different lengths, `zip` stops when the shorter one runs out. No error is raised, so the extra items of the longer list are silently ignored.

%% question q-zip-predict | predict
What does this program print?

```python
a = [1, 2, 3, 4]
b = [10, 20]
total = 0
for x, y in zip(a, b):
    total += x * y
print(total)
```
%% answer
50
%% explain
`zip` stops after two pairs, because `b` has only two items. The pairs are (1, 10) and (2, 20), so the total is 10 + 40 = 50. The items 3 and 4 are never used.
%% end

## Building a new list

Many loops create a new list. Start with an empty list, add an item in every round, and use the result after the loop. This is the **map** pattern, in which every item is turned into another item:

```python run
prices = [100, 250, 80]
discounted = []
for price in prices:
    discounted.append(price - 10)
print(discounted)
```

If you add an `if`, you get the **filter** pattern, in which only some items are kept:

```python run
scores = [45, 82, 67, 91, 38]
passed = []
for score in scores:
    if score >= 50:
        passed.append(score)
print(passed)
```

%% question q-filter-fill | fill
Fill in the blank so that the program prints `[8, 12, 7]`.

```python
numbers = [3, 8, 5, 12, 7]
big = []
for n in numbers:
    if n ___ 6:
        big.append(n)
print(big)
```
%% answer
>
%% expected
[8, 12, 7]
%% explain
The items 8, 12 and 7 are the ones above 6. The filter keeps the items for which the condition is true, and it keeps them in their original order.
%% end

## Do not change a list while you loop over it

Removing items from the list that the loop is walking through makes the loop skip items:

```python run
numbers = [2, 4, 6, 8]
for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)
```

Every number is even, so the loop should have emptied the list, but `[4, 8]` is left. When the loop removes the item at position 0, the next item slides into position 0, and the loop moves on to position 1 and never sees it. The fix is to build a new list with the filter pattern, and leave the original alone.

%% warn Build a new list instead
Adding to or removing from a list while looping over it gives confusing results. Write the items that you want to keep into a second list, as in the filter pattern.
%% end

## From a line of text to a list

`input().split()` turns a line such as `4 8 15` into the list `["4", "8", "15"]`. The items are still text, so convert each one in a loop:

```python run stdin="4 8 15 16 23 42"
numbers = []
for text in input("Numbers: ").split():
    numbers.append(int(text))
print(numbers)
print("Total:", sum(numbers))
```

## From a list to a line of text

The opposite of `split` is `join`. Write the text that goes **between** the items, then `.join(list)`:

```python run
words = ["Python", "is", "fun"]
print(" ".join(words))
print("-".join(words))
print("".join(words))
```

`join` only works when every item is a string. A list of numbers must be converted first:

```python run error
numbers = [1, 2, 3]
print(", ".join(numbers))
```

Python reports a **TypeError**. Build a second list of strings, with `str(number)` in a loop, and join that.

%% question q-join-error | choice
Why does `", ".join([1, 2, 3])` raise an error?
%% choice
Because `join` needs a space as its separator.
%% choice correct
Because `join` only works on strings, and the items are numbers.
%% choice
Because lists cannot be joined.
%% choice
Because the list needs a fourth item.
%% explain
`join` glues strings together, so every item has to be a string. Convert the numbers with `str()` first, and the join works.
%% end

## Sorting with options

`sorted` has two options that you will use often. `reverse=True` puts the biggest first, and `key=len` sorts by length instead of alphabetically:

```python run
words = ["pear", "fig", "banana", "kiwi"]
print(sorted(words))
print(sorted(words, reverse=True))
print(sorted(words, key=len))
```

Items with the same key keep their original order, so `pear` stays in front of `kiwi`. The option `key` says which part of each item to compare. Here it is the length of the word. A later module explains how to write your own keys.

## Your turn

%% exercise numbered-list | Numbered list
Read one line of words separated by spaces. Print every word on its own line, numbered from 1, in the form `1. Ada`. For the input `Ada Grace Linus` the program prints:

```output
1. Ada
2. Grace
3. Linus
```
%% stdin
Ada Grace Linus
%% starter
# Split the line, then number the words.

%% solution
words = input().split()
for number, word in enumerate(words, start=1):
    print(f"{number}. {word}")
%% tests
expect_output("1. Ada\n2. Grace\n3. Linus")
check(rerun("solo").strip() == "1. solo", "a single word")
check(rerun("a b c d e").strip() == "1. a\n2. b\n3. c\n4. d\n5. e", "five words")
check(calls("enumerate"), "uses enumerate()")
%% hint
`enumerate` hands you the number and the word together.
%% hint
Use `enumerate(words, start=1)` so that the numbering begins at 1.
%% hint
`print(f"{number}. {word}")` inside the loop.
%% end

%% exercise above-average | Above average
Read one line of whole numbers. Print the numbers that are **above** the average, as a list, in their original order. For the input `10 20 30 40` the average is 25, so the program prints:

```output
[30, 40]
```
%% stdin
10 20 30 40
%% starter
# Convert the numbers, work out the average, then filter.

%% solution
numbers = []
for text in input().split():
    numbers.append(int(text))
average = sum(numbers) / len(numbers)
result = []
for number in numbers:
    if number > average:
        result.append(number)
print(result)
%% tests
expect_output("[30, 40]")
check(rerun("5 5 5").strip() == "[]", "nothing is above the average")
check(rerun("1 2 3 10").strip() == "[10]", "one number is above")
check(rerun("90 60 70 80").strip() == "[90, 80]", "the order is kept")
%% hint
Build the list of numbers first, converting each word with `int()`.
%% hint
The average is `sum(numbers) / len(numbers)`.
%% hint
Use the filter pattern: a second list, a loop, and an `if number > average:`.
%% end

%% exercise pair-up | Pair up
Read two lines. The first holds names separated by spaces, and the second holds scores separated by spaces. Print one line for each person, in the form `Ada: 90`. For the input `Ada Grace` and `90 85` the program prints:

```output
Ada: 90
Grace: 85
```
%% stdin
Ada Grace
90 85
%% starter
# Read the names, then the scores, then walk through both.

%% solution
names = input().split()
scores = input().split()
for name, score in zip(names, scores):
    print(f"{name}: {score}")
%% tests
expect_output("Ada: 90\nGrace: 85")
check(rerun("X\n7").strip() == "X: 7", "one person")
check(rerun("a b c\n1 2 3").strip() == "a: 1\nb: 2\nc: 3", "three people")
check(calls("zip"), "uses zip()")
%% hint
Split both lines into lists first.
%% hint
`zip(names, scores)` gives one name and one score together in every round.
%% hint
`for name, score in zip(names, scores):` with an f-string inside.
%% end

%% exercise longest-first | Challenge: Longest first
Read a line of words. Print the words sorted by length, longest first, on one line separated by spaces. Words of the same length keep their original order. For the input `pear fig banana kiwi` the program prints:

```output
banana pear kiwi fig
```
%% stdin
pear fig banana kiwi
%% starter
# Sort by length, then join with spaces.

%% solution
words = input().split()
print(" ".join(sorted(words, key=len, reverse=True)))
%% tests
expect_output("banana pear kiwi fig")
check(rerun("a bb ccc").strip() == "ccc bb a", "three lengths")
check(rerun("to be or not").strip() == "not to be or", "equal lengths keep their order")
%% hint
`sorted` accepts both `key=len` and `reverse=True` at the same time.
%% hint
`sorted` gives a list, and the output must be one line of text, so use `" ".join(...)`.
%% hint
`print(" ".join(sorted(words, key=len, reverse=True)))`
%% end

## What you learned

- `for item in items:` visits every item. Name the loop variable after one item, and avoid `range(len(items))` unless you really need positions.
- `enumerate(items, start=1)` gives numbered items, and `zip(a, b)` walks through two lists together and stops at the shorter one.
- The map pattern builds a new list from every item, and the filter pattern keeps some of the items with an `if`.
- Do not add to or remove from a list while looping over it. Write the result into a second list.
- `input().split()` makes a list of words, and `"separator".join(items)` makes one line of text from a list of strings.
- `sorted(items, reverse=True)` puts the biggest first, and `sorted(words, key=len)` sorts by length.
