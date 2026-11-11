---
title: List recipes
---
Most list programs are made from a small set of recipes: filtering, removing repeats, using a list as a stack or as a queue, searching, rotating and sorting records. You have met some of the pieces already. This lesson puts them together into patterns that you can reuse, and it ends with a complete program that works as a to-do list.

## Recipe: filtering

To keep only the items that pass a test, start with an empty list and append the items that pass. The same pattern works for numbers, words and records:

```python run
readings = [21.5, -999, 22.0, -999, 23.5]
valid = []
for value in readings:
    if value != -999:
        valid.append(value)
print(valid)
print("Average:", sum(valid) / len(valid))
```

The value `-999` is a common way for a sensor to say "no reading". Filtering removes it before the average is calculated, so the average is not ruined.

## Recipe: removing repeats

To remove duplicates and keep the order, add an item to the result only if the result does not have it yet:

```python run
names = ["Ada", "Grace", "Ada", "Linus", "Grace"]
unique = []
for name in names:
    if name not in unique:
        unique.append(name)
print(unique)
```

%% question q-dup-fill | fill
Fill in the blank so that the program prints `['Ada', 'Grace']`.

```python
names = ["Ada", "Grace", "Ada"]
unique = []
for name in names:
    if name ___ unique:
        unique.append(name)
print(unique)
```
%% answer
not in
%% expected
['Ada', 'Grace']
%% explain
An item is added only when it is **not already** in the result. The second `"Ada"` is already there, so it is skipped.
%% end

## Recipe: a stack

A **stack** works like a pile of plates. You put a plate on top and take a plate from the top, so the last item in is the first item out. With a list, `append` pushes and `pop()` takes the item from the top:

```python run
stack = []
stack.append("a")
stack.append("b")
stack.append("c")
print(stack.pop())
print(stack)
```

Stacks are what lie behind the **undo** button of an editor. Every action is pushed, and undo pops the latest one:

```python run stdin="hello\nworld\nundo\nagain\nend"
text = []
while True:
    line = input("> ")
    if line == "end":
        break
    if line == "undo":
        if text:
            text.pop()
    else:
        text.append(line)
print(" ".join(text))
```

Notice the check `if text:`. An empty list is false, and popping from an empty list would raise an IndexError.

%% question q-stack-predict | predict
What does this program print?

```python
stack = []
stack.append("a")
stack.append("b")
stack.append("c")
stack.pop()
stack.append("d")
print(stack)
```
%% answer
['a', 'b', 'd']
%% explain
After three appends the stack is `['a', 'b', 'c']`. `pop()` removes `'c'`, and `'d'` is pushed in its place, so the final stack is `['a', 'b', 'd']`.
%% end

## Recipe: a queue

A **queue** works like a line at a shop. The first person to arrive is the first to be served. With a list, you add at the end and take from the front with `pop(0)`:

```python run
queue = ["Ada", "Grace", "Linus"]
queue.append("Margaret")
served = queue.pop(0)
print(served, "was served")
print("Waiting:", queue)
```

Taking from the front makes Python shift every other item, which is slow for very long lists. For small lists it is perfectly fine, and the standard library has a better tool for big queues.

%% question q-queue-choice | choice
Which call removes the first item of a list and gives it back?
%% choice
`items.pop()`
%% choice correct
`items.pop(0)`
%% choice
`items.remove(0)`
%% choice
`del items[-1]`
%% explain
`pop(0)` removes and returns the item at index 0. `pop()` takes the last item. `remove(0)` looks for a value equal to 0, and `del items[-1]` deletes the last item without returning it.
%% end

## Recipe: finding every position

The method `index` finds only the first match. To find **all** the positions, use `enumerate` and keep the numbers of the matching items:

```python run
letters = ["a", "b", "a", "c", "a"]
positions = []
for i, letter in enumerate(letters):
    if letter == "a":
        positions.append(i)
print(positions)
```

## Recipe: slicing with a step

A slice can have a third number, the **step**. A negative step walks backwards, and `[::-1]` is the classic way to reverse a list or a string:

```python run
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(numbers[::2])
print(numbers[1::2])
print(numbers[::-1])
print(numbers[7:2:-2])
```

Reversing also gives a quick test for palindromes, which are words that read the same in both directions:

```python run
word = "level"
print(word == word[::-1])
```

%% question q-slice-step | predict
What does this program print?

```python
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(numbers[::3])
```
%% answer
[0, 3, 6, 9]
%% explain
With no start and no stop, the slice takes every third item, beginning at index 0: the items at the indexes 0, 3, 6 and 9.
%% end

## Recipe: rotating

To rotate a list to the left by `k` places, take the items from `k` onwards and put the first `k` items after them:

```python run
items = [1, 2, 3, 4, 5]
k = 2
print(items[k:] + items[:k])
```

## Recipe: sorting records

When a list holds tuples, `sort` compares the first item of each tuple, then the second if the first items are equal. To rank players by score, put the score **first**:

```python run
players = [("Ada", 91), ("Grace", 85), ("Linus", 91), ("Margaret", 78)]
flipped = []
for name, score in players:
    flipped.append((score, name))
flipped.sort(reverse=True)
for score, name in flipped:
    print(name, score)
```

Two players have 91, so the names decide, and in a reverse sort the later name comes first. Later you will learn how to say "sort by this part" directly, with a key function.

## A complete program: a to-do list

This program understands three commands: `add` something, mark something `done`, and show the `list`. It combines a `while True` loop, slicing for the command words, a list that grows and shrinks, and `enumerate`:

```python run stdin="add milk\nadd eggs\nadd bread\ndone eggs\nlist\nquit"
todo = []
while True:
    command = input("> ")
    if command == "quit":
        break
    elif command[:4] == "add ":
        todo.append(command[4:])
    elif command[:5] == "done ":
        item = command[5:]
        if item in todo:
            todo.remove(item)
    elif command == "list":
        for number, item in enumerate(todo, start=1):
            print(number, item)
```

Read the program once more and notice how few lines it needs. Almost every line is one of the recipes from this module. Add a new command, such as `clear`, to practise.

## Your turn

%% exercise unique-words | Unique words
Read a line of words. Print the words without repeats, keeping the first appearance of each, on one line separated by spaces. For the input `to be or not to be` the program prints:

```output
to be or not
```
%% stdin
to be or not to be
%% starter
# Keep each word the first time it appears.

%% solution
words = input().split()
unique = []
for word in words:
    if word not in unique:
        unique.append(word)
print(" ".join(unique))
%% tests
expect_output("to be or not")
check(rerun("a a a").strip() == "a", "one word repeated")
check(rerun("x y z").strip() == "x y z", "no repeats")
check(rerun("b a b c a").strip() == "b a c", "the order is kept")
%% hint
Build a second list. Add a word only when it is not in that list yet.
%% hint
The test is `if word not in unique:`.
%% hint
Finish with `print(" ".join(unique))`.
%% end

%% exercise undo-editor | Undo editor
Read lines until a line says `end`. Every other line is a command. The line `undo` removes the last word that was added (and does nothing when there are no words). The line `clear` removes all the words. Any other line is a word to add. At the end print the words on one line separated by spaces, or `(empty)` when there are none. For the input `red`, `blue`, `undo`, `green` and `end` the program prints:

```output
red green
```
%% stdin
red
blue
undo
green
end
%% starter
# Read commands until end.

%% solution
words = []
while True:
    line = input()
    if line == "end":
        break
    if line == "undo":
        if words:
            words.pop()
    elif line == "clear":
        words.clear()
    else:
        words.append(line)
if words:
    print(" ".join(words))
else:
    print("(empty)")
%% tests
expect_output("red green")
check(rerun("a\nclear\nend").strip() == "(empty)", "clear removes everything")
check(rerun("undo\nend").strip() == "(empty)", "undo on an empty list does nothing")
check(rerun("x\ny\nclear\nz\nend").strip() == "z", "words can be added after a clear")
%% hint
Use `while True` with a `break` when the line is `end`.
%% hint
Guard `pop()` with `if words:`, so that an empty list does not cause an error.
%% hint
At the end, print `" ".join(words)` when the list has items, and `(empty)` otherwise.
%% end

%% exercise rotate-left | Rotate left
Read a line of words, then a whole number `k`. Move the first `k` words to the end, and print the words on one line separated by spaces. For the input `1 2 3 4 5` and `2` the program prints:

```output
3 4 5 1 2
```
%% stdin
1 2 3 4 5
2
%% starter
# Slice the list in two parts and swap them.

%% solution
items = input().split()
k = int(input())
print(" ".join(items[k:] + items[:k]))
%% tests
expect_output("3 4 5 1 2")
check(rerun("1 2 3 4 5\n0").strip() == "1 2 3 4 5", "a rotation of 0")
check(rerun("a b c\n1").strip() == "b c a", "one place")
check(rerun("a b c\n3").strip() == "a b c", "a full turn")
%% hint
Two slices cover the whole list: everything from `k` onwards, and everything before `k`.
%% hint
Add the two slices in the other order: `items[k:] + items[:k]`.
%% hint
Join the result with spaces before you print it.
%% end

%% exercise median | Challenge: Median
Read a line of whole numbers. Print their **median**, the middle value after sorting. If the count is odd, print the middle number. If the count is even, print the average of the two middle numbers (this prints as a float). For the input `5 1 3` the program prints:

```output
3
```
%% stdin
5 1 3
%% starter
# Sort the numbers, then find the middle.

%% solution
numbers = []
for text in input().split():
    numbers.append(int(text))
numbers.sort()
n = len(numbers)
middle = n // 2
if n % 2 == 1:
    print(numbers[middle])
else:
    print((numbers[middle - 1] + numbers[middle]) / 2)
%% tests
expect_output("3")
check(rerun("4 1 3 2").strip() == "2.5", "an even count")
check(rerun("7").strip() == "7", "a single number")
check(rerun("10 20").strip() == "15.0", "two numbers")
check(rerun("9 1 5 5 2 8").strip() == "5.0", "six numbers")
%% hint
Convert the numbers and sort the list first.
%% hint
For an odd count the median is at index `len(numbers) // 2`.
%% hint
For an even count, average the items at `middle - 1` and `middle`.
%% end

## What you learned

- Filtering keeps the items that pass a test. Removing repeats uses `if item not in result:`.
- A stack uses `append` and `pop()`, so the last item in is the first out. A queue uses `append` and `pop(0)`, so the first item in is the first out. Check that a list is not empty before you pop.
- `enumerate` finds every position of a value. Slices accept a step, and `[::-1]` reverses a list or a string.
- Rotating a list is `items[k:] + items[:k]`.
- Tuples sort by their first item, then by the second. Put the number you want to rank by first.
- A small command loop with `while True`, slices and a list can already be a useful program, such as a to-do list.
