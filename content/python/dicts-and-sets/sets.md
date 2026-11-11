---
title: Sets
---
Sometimes you do not care **where** an item is, or how many times it appears. You only care whether it is **there**. Did this visitor come yesterday? Which hobbies do two friends share? How many different words are in this text? A **set** is the container for these questions. It holds each item at most once, it keeps no order, and it answers "is this item in the set?" almost at once, even when the set is very big.

Sets also come with the operations that you may know from school mathematics: union, intersection and difference. With them, comparing two groups takes one line instead of a loop.

## Creating a set

A set is written with curly brackets, like a dictionary, but it holds single values and has no colons:

```python run
colours = {"red", "green", "blue", "red"}
print(sorted(colours))
print(len(colours))
print(type(colours))
```

The word `red` was written twice, but the set keeps it once, so `len` counts 3. Notice that the example prints `sorted(colours)`. A set has **no order**, so Python is free to show its items in any order. When the order matters, ask for `sorted(...)`, which gives a list in alphabetical or numeric order.

%% warn An empty pair of curly brackets is a dictionary
`{}` creates an empty **dictionary**, because dictionaries came first. To create an empty set, write `set()`.
%% end

```python run
empty = set()
print(len(empty))
print(type({}))
print(type(empty))
```

%% question q-empty-set | choice
How do you create an empty set?
%% choice
`{}`
%% choice correct
`set()`
%% choice
`[]`
%% choice
`set[]`
%% explain
`set()` is the way to write an empty set. The brackets `{}` make an empty dictionary, and `[]` makes an empty list.
%% end

## Sets from other values

`set(...)` makes a set out of anything that you can loop over. A list with repeated items becomes a set of different items, and a string becomes a set of its letters:

```python run
numbers = [4, 8, 4, 15, 8, 16, 23, 42]
different = set(numbers)
print(sorted(different))
print(len(numbers), "numbers,", len(different), "different")
print(sorted(set("mississippi")))
```

This is the quickest way to remove the duplicates from a list, and to count how many different items it holds. The original order of the list is lost, because a set keeps no order.

%% question q-set-predict | predict
What does this program print?

```python
letters = set("banana")
print(len(letters))
```
%% answer
3
%% explain
The letters of `banana` are b, a, n, a, n, a. A set keeps each letter once, so only `b`, `a` and `n` remain, and `len` gives 3.
%% end

## Adding and removing

The method `add` puts an item into a set. The methods `remove` and `discard` take an item out:

```python run
seen = {"Ada", "Grace"}
seen.add("Linus")
seen.add("Ada")
print(sorted(seen))
seen.remove("Grace")
seen.discard("Zed")
print(sorted(seen))
```

Adding an item that is already there does nothing: there is no error and no duplicate. `remove` raises a KeyError when the item is missing, while `discard` stays quiet. Choose `remove` when a missing item means that something went wrong, and `discard` when it does not matter:

```python run error
seen = {"Ada"}
seen.remove("Zed")
```

## No order, no index

Because a set keeps no order, its items have no positions, so you cannot write `colours[0]`:

```python run error
colours = {"red", "green"}
print(colours[0])
```

Python reports **TypeError: 'set' object is not subscriptable**. If you need the items one at a time, use a `for` loop. If you need them in a fixed order, loop over `sorted(...)`:

```python run
colours = {"red", "green", "blue"}
for colour in sorted(colours):
    print(colour)
```

## Fast membership tests

The `in` operator asks whether an item is in the set, and Python can answer at once, however many items the set holds. For a list, `in` has to look at the items one after another, which takes longer and longer as the list grows. So when you collect items and often ask "have I seen this?", a set is the right container:

```python run
banned = {"spam", "scam", "fake"}
message = "this is not spam but it is a scam".split()
for word in message:
    if word in banned:
        print("Blocked word:", word)
```

%% key Use a set when only "is it there?" matters
When you do not need positions, counts or values, a set stores less and answers faster than a list or a dictionary. The questions "is it in?" and "how many different?" are what sets are made for.
%% end

## Sets of tuples

The items of a set must be immutable, exactly like the keys of a dictionary. A string, a number or a tuple is fine, and a list is not. A set of tuples is a neat way to remember positions, for example the squares of a grid that a robot has already visited:

```python run
visited = {(0, 0), (0, 1), (1, 1)}
position = (1, 1)
if position in visited:
    print("Been here before")
visited.add((2, 1))
print(len(visited))
```

## Comparing two groups

Now for the part that makes sets special. Take two groups of students, and ask who is in both, who is in either, and who is in only one of them:

```python run
maths = {"Ada", "Grace", "Linus", "Margaret"}
art = {"Grace", "Zed", "Margaret"}
print("Both:", sorted(maths & art))
print("Either:", sorted(maths | art))
print("Maths only:", sorted(maths - art))
print("Art only:", sorted(art - maths))
print("Exactly one:", sorted(maths ^ art))
```

Each operator answers one question:

- `a | b` is the **union**: every item that is in `a`, in `b`, or in both.
- `a & b` is the **intersection**: the items that are in both.
- `a - b` is the **difference**: the items of `a` that are not in `b`. The order matters here, because `b - a` is a different set.
- `a ^ b` is the **symmetric difference**: the items that are in exactly one of the two.

Every operation builds a new set and leaves `a` and `b` unchanged. The operations also exist as methods with long names: `union`, `intersection`, `difference` and `symmetric_difference`. A method accepts any list as its argument, while an operator needs a set on both sides:

```python run
maths = {"Ada", "Grace", "Linus"}
print(sorted(maths.union(["Zed", "Ada"])))
print(sorted(maths.intersection(["Grace", "Zed"])))
print(sorted(maths.difference(["Ada"])))
```

%% question q-set-ops | choice
Which expression gives the items that are in `a` but **not** in `b`?
%% choice
`a & b`
%% choice
`a | b`
%% choice correct
`a - b`
%% choice
`a ^ b`
%% explain
`a - b` is the difference. `a & b` keeps the items that are in both, `a | b` keeps the items that are in either, and `a ^ b` keeps the items that are in exactly one of the two.
%% end

## Subsets and missing items

You can ask whether one set fits inside another with `<=` or the method `issubset`, and the other way round with `>=` or `issuperset`. The difference is perfect for the question "what is missing?":

```python run
needed = {"flour", "eggs", "milk"}
pantry = {"flour", "eggs", "milk", "sugar", "salt"}
print(needed <= pantry)
print(needed.issubset(pantry))
print(pantry.issuperset(needed))
print(needed - pantry)
print(sorted(pantry - needed))
```

Notice that `needed - pantry` prints `set()`, which is how Python shows an empty set. An empty difference means that nothing is missing. An empty set also counts as false in an `if`, which gives a short test:

```python run
needed = {"flour", "eggs", "butter"}
pantry = {"flour", "eggs", "milk"}
missing = needed - pantry
if missing:
    print("Please buy:", ", ".join(sorted(missing)))
else:
    print("You have everything.")
```

Here is a small project that uses a subset. A **pangram** is a sentence that uses every letter of the alphabet. The program below turns the alphabet and the sentence into sets, and checks whether the alphabet fits inside the letters of the sentence:

```python run stdin="The quick brown fox jumps over the lazy dog"
text = input("Sentence: ").lower()
alphabet = set("abcdefghijklmnopqrstuvwxyz")
letters = set(text)
if alphabet <= letters:
    print("A pangram: it uses every letter.")
else:
    print("Missing:", "".join(sorted(alphabet - letters)))
```

Change the sentence and run the program again to see the missing letters.

%% question q-set-facts | multi
Select every true statement about sets.
%% choice correct
A set keeps each item at most once.
%% choice correct
`x in s` tells you whether `x` is in the set `s`.
%% choice correct
`s.add(x)` puts `x` into the set `s`.
%% choice
A set keeps its items in the order in which they were added.
%% choice
`s[0]` gives the first item of the set `s`.
%% explain
Sets keep every item once, answer `in` quickly and grow with `add`. They keep no order, so there is no first item and no index.
%% end

## Duplicates and order

`set(numbers)` removes the duplicates but loses the order. When you need to keep the order of first appearance, there is a short trick with a dictionary. `dict.fromkeys(items)` builds a dictionary whose keys are the items. Keys are unique, and a dictionary remembers the order of insertion, so the result is the list without repeats, in the original order:

```python run
names = ["ada", "grace", "ada", "linus", "grace"]
print(sorted(set(names)))
print(list(dict.fromkeys(names)))
```

Python also has a `frozenset`, which is a set that can never change. Because it is immutable, it can be used as a dictionary key or as an item of another set. You will rarely need it, but it is good to know that it exists.

## Your turn

%% exercise different-words | Different words
Read a line of text. Print how many **different** words it contains. Treat capital letters and small letters as the same, so `The` and `the` count once. For the input `to be or not to be` the program prints:

```output
4
```
%% stdin
to be or not to be
%% starter
# Make the text lowercase, split it, then use a set.

%% solution
words = input().lower().split()
print(len(set(words)))
%% tests
expect_output("4")
check(rerun("The the THE cat").strip() == "2", "capital letters do not matter")
check(rerun("one").strip() == "1", "a single word")
check(rerun("a b c d").strip() == "4", "all different")
%% hint
Make all the letters small first with `.lower()`, so that `The` and `the` become the same word.
%% hint
Split the text into a list of words with `.split()`.
%% hint
`len(set(words))` counts the different words.
%% end

%% exercise shared-hobbies | Shared hobbies
Two friends each type their hobbies on one line, separated by spaces. Print the hobbies that both of them have, in alphabetical order, separated by spaces. If they share no hobby, print `none`. For the input `chess music art` and `music football chess` the program prints:

```output
chess music
```
%% stdin
chess music art
music football chess
%% starter
# One set for each friend.

%% solution
first = set(input().split())
second = set(input().split())
shared = first & second
if shared:
    print(" ".join(sorted(shared)))
else:
    print("none")
%% tests
expect_output("chess music")
check(rerun("a b\nc d").strip() == "none", "no shared hobby")
check(rerun("x y z\nz").strip() == "z", "one shared hobby")
check(rerun("b a\na b").strip() == "a b", "the answer is in alphabetical order")
%% hint
Turn each line into a set with `set(input().split())`.
%% hint
The operator `&` gives the items that are in both sets.
%% hint
Print `" ".join(sorted(shared))` when the set is not empty, and `none` otherwise.
%% end

%% exercise class-overlap | Class overlap
Read two lines of names: the students of class A and the students of class B. Print how many students are in both classes, only in the first class and only in the second class. For the input `ada grace linus` and `grace linus zed margaret` the program prints:

```output
Both: 2
Only first: 1
Only second: 2
```
%% stdin
ada grace linus
grace linus zed margaret
%% starter
# Build two sets, then compare them.

%% solution
first = set(input().split())
second = set(input().split())
print("Both:", len(first & second))
print("Only first:", len(first - second))
print("Only second:", len(second - first))
%% tests
expect_output("Both: 2\nOnly first: 1\nOnly second: 2")
check(rerun("a\nb").strip() == "Both: 0\nOnly first: 1\nOnly second: 1", "no overlap")
check(rerun("a a b\nb b").strip() == "Both: 1\nOnly first: 1\nOnly second: 0", "a name typed twice counts once")
%% hint
Make a set from each line, so that a name typed twice counts once.
%% hint
`first & second` is the students in both. `first - second` is the students only in the first class.
%% hint
Print each label with `len(...)` of the matching set operation.
%% end

%% exercise first-repeat | Challenge: First repeat
Read a line of whole numbers separated by spaces. Read the numbers from left to right, and print the first number that appears for the **second** time. If no number repeats, print `no repeats`. For the input `4 7 1 7 4` the program prints `7`, because 7 is seen again before 4 is:

```output
7
```
%% stdin
4 7 1 7 4
%% starter
# Keep a set of the numbers that you have already seen.

%% solution
seen = set()
answer = "no repeats"
for text in input().split():
    number = int(text)
    if number in seen:
        answer = number
        break
    seen.add(number)
print(answer)
%% tests
expect_output("7")
check(rerun("1 2 3").strip() == "no repeats", "nothing repeats")
check(rerun("5 5").strip() == "5", "an immediate repeat")
check(rerun("3 1 3 1").strip() == "3", "the first repeat wins")
check(rerun("9 8 7 8 9 7").strip() == "8", "a repeat in the middle")
%% hint
Keep a set of the numbers that you have already seen.
%% hint
For each number, test `number in seen` before you add it to the set.
%% hint
When a number is already in the set, store it and leave the loop with `break`. If the loop ends without a repeat, print `no repeats`.
%% end

## What you learned

- A set holds each item at most once and keeps no order. Write it with curly brackets, `{1, 2, 3}`, and write an empty one as `set()`, because `{}` is an empty dictionary.
- `set(items)` removes duplicates and `len(set(items))` counts the different items. Use `sorted(a_set)` when you need a fixed order, and `dict.fromkeys(items)` when you need to keep the original order.
- `add` puts an item in, `remove` takes it out (and raises a KeyError when it is missing), and `discard` takes it out quietly.
- `x in a_set` is fast. Sets have no index, so `a_set[0]` is an error. The items must be immutable, which is why a set can hold tuples but not lists.
- `a | b` is the union, `a & b` the intersection, `a - b` the difference and `a ^ b` the symmetric difference. `a <= b` asks whether `a` fits inside `b`, and `needed - have` shows what is missing.
