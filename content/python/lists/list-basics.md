---
title: Lists
---
Until now every variable has held one value: a name, a number, a `True` or `False`. Real programs deal with **collections**: the players in a team, the marks of a class, the items in a shopping basket. Python's answer is the **list**, a single value that holds many values in order. You can add to a list, remove from it, sort it, search it and loop over it.

This lesson shows you how to create lists, how to read and change their items, and the methods that you will use every day. The next lesson shows how to loop over them.

## Creating a list

A list is written with square brackets, and its items are separated by commas:

```python run
crew = ["Ada", "Grace", "Linus"]
numbers = [4, 8, 15, 16, 23, 42]
empty = []
print(crew)
print(numbers)
print(empty)
print(type(crew))
print(len(crew), len(numbers), len(empty))
```

`len()` counts the items, in the same way that it counts the characters of a string. An empty list `[]` is a good starting point when you plan to add items later. A list can hold items of different types, for example `["Ada", 36, True]`, but most lists hold one kind of thing.

%% key A list is ordered, and it can change
"Ordered" means that every item has a fixed position. "Can change" means that you can replace, add and remove items after the list exists. Strings are ordered too, but they cannot change. That is the big difference between the two.
%% end

## Reading items by position

Every item has a position called its **index**. Counting starts at 0, as it does for the characters of a string, and negative indexes count from the end:

| Item | `"Ada"` | `"Grace"` | `"Linus"` | `"Margaret"` |
| --- | --- | --- | --- | --- |
| Index | 0 | 1 | 2 | 3 |
| Negative index | -4 | -3 | -2 | -1 |

```python run
crew = ["Ada", "Grace", "Linus", "Margaret"]
print(crew[0])
print(crew[2])
print(crew[-1])
print(crew[-2])
```

The last item is always `crew[-1]`, whatever the length. Asking for a position that does not exist is an error:

```python run error
crew = ["Ada", "Grace"]
print(crew[2])
```

The message is **IndexError: list index out of range**. A list with 2 items has the indexes 0 and 1. The valid indexes run from `0` to `len(crew) - 1`.

%% question q-last-index | predict
What does this program print?

```python
colours = ["red", "green", "blue", "pink"]
print(colours[1], colours[-1])
```
%% answer
green pink
%% explain
Index 1 is the second item, `"green"`, and index -1 is the last item, `"pink"`. `print` separates the two values with a space.
%% end

## Slicing

A slice takes a part of a list. It works exactly like slicing a string: the first number is included, the second is not, and the result is a **new list**:

```python run
numbers = [10, 20, 30, 40, 50]
print(numbers[1:4])
print(numbers[:2])
print(numbers[3:])
print(numbers[-2:])
print(numbers)
```

The last line shows that the original list has not changed.

## Changing an item

Lists are **mutable**, which means that you can change them after you create them. Assign to a position to replace an item:

```python run
scores = [70, 85, 90]
scores[1] = 88
print(scores)
scores[-1] = scores[-1] + 5
print(scores)
```

Try the same with a string and Python refuses, because strings are immutable. For lists it works, and this ability to change in place is what makes lists so useful.

## Adding items

Three methods add items. `append` puts one item at the end, `insert` puts one at a position that you choose, and `extend` adds every item of another list:

```python run
tasks = ["email", "lunch"]
tasks.append("gym")
print(tasks)
tasks.insert(0, "wake up")
print(tasks)
tasks.extend(["read", "sleep"])
print(tasks)
```

These methods change the list itself and give nothing back. Be careful when you give `append` a list, because it adds that list as a **single item**:

```python run
a = [1, 2]
a.append([3, 4])
print(a)
b = [1, 2]
b.extend([3, 4])
print(b)
```

%% question q-append-extend | choice
What is `len(items)` after this program?

```python
items = [1, 2]
items.append([3, 4, 5])
```
%% choice
5
%% choice
2
%% choice correct
3
%% choice
4
%% explain
`append` adds its argument as one single item, even when the argument is a list. The list now holds `1`, `2` and `[3, 4, 5]`, so its length is 3. With `extend` the length would be 5.
%% end

## Removing items

```python run
fruits = ["apple", "banana", "cherry", "banana"]
fruits.remove("banana")
print(fruits)
last = fruits.pop()
print(last, fruits)
first = fruits.pop(0)
print(first, fruits)
fruits.clear()
print(fruits)
```

- `remove(value)` deletes the **first** item that equals the value.
- `pop()` removes the last item and **gives it back**. `pop(position)` removes the item at that position.
- `clear()` empties the list.

The statement `del` removes by position, and it can also remove a slice:

```python run
numbers = [10, 20, 30, 40, 50]
del numbers[1]
print(numbers)
del numbers[:2]
print(numbers)
```

Removing something that is not there is an error:

```python run error
fruits = ["apple", "cherry"]
fruits.remove("kiwi")
```

Python reports a **ValueError**. You can protect against it with `if "kiwi" in fruits:`, which the next section explains.

## Searching: in, index and count

```python run
crew = ["Ada", "Grace", "Linus", "Ada"]
print("Grace" in crew)
print("Zed" in crew)
print(crew.index("Linus"))
print(crew.count("Ada"))
```

The word `in` gives `True` or `False`. `index` gives the position of the first match, and it raises a ValueError when there is none, so test with `in` first. `count` says how many times a value occurs.

## Joining and repeating

The operators `+` and `*` work on lists as they work on strings. They build a new list and leave the old ones alone:

```python run
a = [1, 2]
b = [3, 4]
print(a + b)
print(a * 3)
print(a, b)
```

## Sorting and reversing

```python run
scores = [70, 95, 60, 88]
print(sorted(scores))
print(scores)
scores.sort()
print(scores)
scores.reverse()
print(scores)
```

`sorted(list)` gives a **new** sorted list and leaves the original alone. The method `list.sort()` sorts the list **in place**, and `reverse()` flips the order in place. Text sorts alphabetically, with capital letters before small letters. A very common mistake follows from the fact that the in-place methods give back nothing:

```python run
scores = [3, 1, 2]
scores = scores.sort()
print(scores)
```

The program prints `None`. The `sort()` method sorted the list and returned `None`, and the assignment replaced the list with that value. Write `scores.sort()` on a line of its own, or use `sorted(scores)` when you want a result.

%% question q-sort-none | choice
What does `print(numbers)` show after this program?

```python
numbers = [3, 1, 2]
numbers = numbers.sort()
print(numbers)
```
%% choice
[1, 2, 3]
%% choice
[3, 1, 2]
%% choice correct
None
%% choice
An error message
%% explain
`sort()` changes the list in place and returns `None`. The assignment then stores that `None` in `numbers`, so the sorted list is lost.
%% end

## min, max and sum

```python run
temps = [31, 28, 35, 30]
print(min(temps), max(temps), sum(temps))
print("Average:", sum(temps) / len(temps))
```

These three built-in functions work on any list of numbers. `min` and `max` also work on text. They give you totals and averages without writing a loop.

## Your turn

%% exercise edit-list | Edit the crew
The list `crew` is set up for you. Replace `"Grace"` with `"Hopper"`, add `"Margaret"` to the end, and print the list. The program must print:

```output
['Ada', 'Hopper', 'Linus', 'Margaret']
```
%% starter
crew = ["Ada", "Grace", "Linus"]
# Change the list, then print it.

%% solution
crew = ["Ada", "Grace", "Linus"]
crew[1] = "Hopper"
crew.append("Margaret")
print(crew)
%% tests
expect_output("['Ada', 'Hopper', 'Linus', 'Margaret']")
check(ns["crew"][1] == "Hopper", "the second item is now Hopper")
check(ns["crew"][-1] == "Margaret", "Margaret is the last item")
check(len(ns["crew"]) == 4, "the list has four items")
%% hint
Replace an item by assigning to its index: the first item has index 0.
%% hint
`"Grace"` is at index 1, and `append` adds an item at the end.
%% hint
`crew[1] = "Hopper"` and then `crew.append("Margaret")`, followed by `print(crew)`.
%% end

%% exercise shopping-list | Shopping list
Read three items, one per line, into a list. Print the list in alphabetical order. For the input `pears`, `apples` and `bananas` the program prints:

```output
['apples', 'bananas', 'pears']
```
%% stdin
pears
apples
bananas
%% starter
# Read three items into a list, then print the sorted list.

%% solution
items = []
for _ in range(3):
    items.append(input())
print(sorted(items))
%% tests
expect_output("['apples', 'bananas', 'pears']")
check(rerun("kiwi\nfig\nDate").strip() == "['Date', 'fig', 'kiwi']", "capital letters sort first")
check(rerun("a\na\nb").strip() == "['a', 'a', 'b']", "repeated items stay")
%% hint
Start with an empty list and add each line to it with `append`.
%% hint
A `for _ in range(3):` loop reads three lines. Use `sorted(items)` to get the alphabetical list.
%% hint
`print(sorted(items))` goes after the loop.
%% end

%% exercise stats-line | Statistics line
Read a whole number `n`, and then read `n` whole numbers, one per line. Print the smallest, the largest and the total on one line, separated by spaces. For the input `4`, `12`, `7`, `30` and `18` the program prints:

```output
7 30 67
```
%% stdin
4
12
7
30
18
%% starter
# Read n, then n numbers into a list.

%% solution
n = int(input())
numbers = []
for _ in range(n):
    numbers.append(int(input()))
print(min(numbers), max(numbers), sum(numbers))
%% tests
expect_output("7 30 67")
check(rerun("1\n5").strip() == "5 5 5", "a single number")
check(rerun("3\n-2\n0\n9").strip() == "-2 9 7", "negative numbers")
%% hint
Convert every line with `int()` before you append it to the list.
%% hint
After the loop, `min`, `max` and `sum` work on the whole list.
%% hint
`print(min(numbers), max(numbers), sum(numbers))` prints the three values separated by spaces.
%% end

%% exercise trim-ends | Challenge: Trim the ends
Read one line of words separated by spaces. Print the words without the first and the last one, as a list. If there are fewer than three words, print an empty list. For the input `a b c d` the program prints:

```output
['b', 'c']
```
%% stdin
a b c d
%% starter
# Split the line, then slice away both ends.

%% solution
words = input().split()
print(words[1:-1])
%% tests
expect_output("['b', 'c']")
check(rerun("a b").strip() == "[]", "two words")
check(rerun("a").strip() == "[]", "one word")
check(rerun("x y z").strip() == "['y']", "three words")
%% hint
`input().split()` turns the line into a list of words.
%% hint
A slice can start at 1 and stop at -1, so that it leaves out the first and the last item.
%% hint
`words[1:-1]` also gives an empty list when there are fewer than three words.
%% end

## What you learned

- A list holds many values in order: `[4, 8, 15]`. `len()` counts the items, and an empty list is `[]`.
- Indexes start at 0, and negative indexes count from the end, so `items[-1]` is the last item. A position that does not exist causes an IndexError.
- A slice `items[a:b]` is a new list. Lists are mutable, so `items[i] = value` replaces an item.
- `append`, `insert` and `extend` add items. `remove`, `pop`, `del` and `clear` take them away.
- `in`, `index` and `count` search. `+` and `*` build new lists.
- `sorted(items)` returns a new sorted list, while `items.sort()` sorts in place and returns `None`. `min`, `max` and `sum` summarise a list of numbers.
