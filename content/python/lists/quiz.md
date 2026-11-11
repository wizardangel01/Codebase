---
title: Lists: module quiz
pass: 70
---
Twelve questions on everything in this module: lists, loops over lists, tuples, copies and the list recipes. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | choice
Which expression gives the last item of any list `items` that is not empty?
%% choice correct
`items[-1]`
%% choice
`items[len(items)]`
%% choice
`items[1]`
%% choice
`items[-0]`
%% explain
Index -1 always means the last item. `items[len(items)]` is one position too far and raises an IndexError, and `-0` is the same as 0, which is the first item.
%% end

%% question q2 | predict
What does this program print?

```python
items = [5, 3, 8]
items.append(1)
items.sort()
print(items)
```
%% answer
[1, 3, 5, 8]
%% explain
`append` adds 1 at the end, giving `[5, 3, 8, 1]`. `sort()` then sorts the list in place, so it becomes `[1, 3, 5, 8]`.
%% end

%% question q3 | multi
Select every line that changes the list `a` itself, in place.
%% choice correct
`a.append(4)`
%% choice
`b = a + [4]`
%% choice correct
`a.sort()`
%% choice
`b = sorted(a)`
%% choice correct
`a[0] = 9`
%% explain
`append`, `sort()` and an assignment to an index all change `a`. The `+` operator and `sorted` build new lists and leave `a` alone.
%% end

%% question q4 | fill
Fill in the blank so that the program prints `['Ada', 'Linus']`.

```python
crew = ["Ada", "Grace", "Linus"]
crew.___("Grace")
print(crew)
```
%% answer
remove
%% expected
['Ada', 'Linus']
%% explain
`remove(value)` deletes the first item that equals the value. `pop` takes a position, not a value, so `pop("Grace")` would fail.
%% end

%% question q5 | order
Put the lines in order so that the program prints `[3, 6, 9]`. One line does not belong.
%% lines
numbers = [1, 2, 3]
tripled = []
for n in numbers:
    tripled.append(n * 3)
print(tripled)
%% distractors
tripled.add(n * 3)
%% expected
[3, 6, 9]
%% explain
Both lists have to exist before the loop starts. The `append` line is inside the loop, and the `print` is outside it. A list has no `add` method: items are added with `append`.
%% end

%% question q6 | choice
What does the line `b = a` do when `a` is a list?
%% choice
It makes a copy of the list.
%% choice correct
It gives the same list a second name.
%% choice
It sorts the list.
%% choice
It raises an error.
%% explain
Assignment never copies a list. Both names refer to one list, so a change made through either name is visible through the other. To get a separate list, use `a.copy()`, `a[:]` or `list(a)`.
%% end

%% question q7 | predict
What does this program print?

```python
words = ["pear", "fig", "banana"]
print(sorted(words, key=len)[0], len(words))
```
%% answer
fig 3
%% explain
Sorting by length puts the shortest word first, so index 0 is `"fig"`. The list `words` itself is unchanged and still has 3 items.
%% end

%% question q8 | choice
Which call turns the list `["a", "b", "c"]` into the text `a-b-c`?
%% choice
`items.join("-")`
%% choice correct
`"-".join(items)`
%% choice
`join(items, "-")`
%% choice
`"-".split(items)`
%% explain
`join` is a string method. The text that goes between the items comes first, and the list is the argument: `"-".join(items)`.
%% end

%% question q9 | predict
What does this program print?

```python
first, *rest = [4, 5, 6, 7]
print(len(rest), rest[-1])
```
%% answer
3 7
%% explain
`first` takes 4, and the starred name collects the other three items into the list `[5, 6, 7]`. Its length is 3 and its last item is 7.
%% end

%% question q10 | choice
What is wrong with `board = [[0] * 3] * 3` when you want a 3 by 3 board?
%% choice
Nothing, it makes three separate rows.
%% choice
It makes only two rows.
%% choice correct
All three rows are the same list, so a change in one row shows in every row.
%% choice
Python does not allow `*` on lists.
%% explain
The inner `[0] * 3` is built once, and the outer `* 3` repeats a reference to it. Build the rows in a loop with `board.append([0] * 3)`, so that every row is a new list.
%% end

%% question q11 | multi
Select every statement that is true.
%% choice
A tuple can be changed after it is created.
%% choice correct
`zip` stops when the shorter list runs out.
%% choice correct
`enumerate(items, start=1)` numbers the items from 1.
%% choice
`items.sort()` returns the sorted list.
%% choice correct
`items.pop()` removes the last item and gives it back.
%% explain
Tuples are immutable. `sort()` sorts in place and returns `None`, so `sorted(items)` is the call that gives a sorted list. The other three statements are correct.
%% end

%% question q12 | predict
What does this program print?

```python
queue = ["a", "b", "c"]
queue.append("d")
first = queue.pop(0)
print(first, queue)
```
%% answer
a ['b', 'c', 'd']
%% explain
`append` adds `"d"` at the end. `pop(0)` removes and returns the first item, `"a"`. What is left is `['b', 'c', 'd']`.
%% end
