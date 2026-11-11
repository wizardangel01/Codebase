---
title: Searching and sorting
---
Finding things and putting them in order are the two oldest jobs of computing. Your phone finds one contact among thousands, a shop lists its prices from cheap to dear, and a game sorts its scores. In this lesson you will write the classic algorithms for both jobs, count their steps, and see why one search can be a **million times** faster than another. You will meet linear and binary search, the `bisect` module, three simple sorts, two fast ones (merge sort and quicksort), and the sort that Python itself uses. In real programs you will almost always call `sorted`, but the **ideas** inside these algorithms, such as halving and divide and conquer, appear everywhere.

## Linear search

The simplest search looks at the items **one by one** from the start, and stops when it finds the target. This is a **linear search**. Python does it for you with `in` and `.index()`, and here it is written out, with a counter for the comparisons:

```python run
def linear_search(items, target):
    comparisons = 0
    for position, item in enumerate(items):
        comparisons += 1
        if item == target:
            return position, comparisons
    return -1, comparisons

names = ["Ada", "Ben", "Cleo", "Dev", "Eve"]
print(linear_search(names, "Cleo"))
print(linear_search(names, "Zoe"))

numbers = list(range(1_000_000))
print(linear_search(numbers, 999_999))
```

The function returns the position and the number of comparisons. Finding `"Cleo"` takes 3 comparisons, a missing name takes 5, and the last of a million numbers takes a million. In the worst case, the work is **O(n)**. The good side of linear search is that it works on **any** list, sorted or not.

## Binary search: halving the problem

Think of the game "I am thinking of a number from 1 to 100". You do not guess 1, then 2, then 3. You guess 50, hear "higher", and the numbers 1 to 50 are gone in one step. You guess 75, hear "lower", and half of what is left is gone again. Seven guesses are always enough. That is **binary search**, and it needs one thing: the data must be **sorted**.

```text
Keep a range of positions where the target could still be.
Look at the middle item of the range.
If it is the target, you are done.
If it is too small, the target can only be on the right, so drop the left half.
If it is too big, the target can only be on the left, so drop the right half.
Repeat until you find the target or the range is empty.
```

Step through the program below and watch `low`, `high` and `middle`. The range shrinks to a half in every pass:

```python trace title="Binary search for 23"
def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1

numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binary_search(numbers, 23))
```

The function returns the **index** of the target, or `-1` when the target is missing. Now count its comparisons. A `range` is sorted and takes no memory, so it lets us try sizes that would not fit in a list:

```python run
def binary_search_counted(items, target):
    low, high = 0, len(items) - 1
    comparisons = 0
    while low <= high:
        middle = (low + high) // 2
        comparisons += 1
        if items[middle] == target:
            return middle, comparisons
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1, comparisons

for size in (10, 1_000, 1_000_000, 1_000_000_000):
    items = range(size)
    print(f"{size:>13,} items: {binary_search_counted(items, size - 1)[1]} comparisons (last item)")
```

A billion items need only **30** comparisons, because every comparison throws away half of the data. The work is **O(log n)**. A linear search of a billion items would need a billion comparisons, which is why the choice of algorithm matters more than the speed of the computer.

Binary search is famous for small mistakes, so check these four points whenever you write it:

- The list must be **sorted**. On unsorted data the answer can be wrong, as you will see below.
- The loop condition is `low <= high`. With `<` the search misses a range of one item.
- Always move with `middle + 1` and `middle - 1`. If you write `low = middle`, the range can stop shrinking, and the loop never ends.
- Do not slice the list (`items[middle + 1:]`) to shrink it. A slice **copies** the items, which costs O(n) and destroys the speed.

```python run
def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1

print(binary_search([1, 3, 5, 7, 9], 7))
print(binary_search([5, 3, 9, 1, 7], 1))     # the list is NOT sorted: the 1 is there, but never found
```

Binary search can also be written with recursion. The depth of the recursion is only O(log n), so it never meets the recursion limit, not even for a billion items:

```python run
def binary_search_rec(items, target, low=0, high=None):
    if high is None:
        high = len(items) - 1
    if low > high:
        return -1
    middle = (low + high) // 2
    if items[middle] == target:
        return middle
    if items[middle] < target:
        return binary_search_rec(items, target, middle + 1, high)
    return binary_search_rec(items, target, low, middle - 1)

print(binary_search_rec(range(0, 2_000_000_000, 2), 1_999_999_998))
```

%% question q-binary-predict | predict
What does this program print?

```python
items = [3, 8, 15, 21, 34, 50, 67]
low, high = 0, len(items) - 1
target = 50
while low <= high:
    middle = (low + high) // 2
    print(items[middle])
    if items[middle] == target:
        break
    if items[middle] < target:
        low = middle + 1
    else:
        high = middle - 1
```
%% answer
21
50
%% explain
At first `low` is 0 and `high` is 6, so `middle` is 3 and the item there is 21. That is smaller than 50, so `low` becomes 4. Now `middle` is (4 + 6) // 2 = 5, the item there is 50, the program prints it, and the `break` ends the loop. Only two comparisons were needed in a list of seven.
%% end

%% question q-sorted-choice | choice
Which condition must be true **before** you can use binary search on a list?
%% choice
The list holds only numbers
%% choice correct
The list is sorted
%% choice
The list has an even number of items
%% choice
The list holds no duplicates
%% explain
Binary search throws away half of the list after each comparison, and it can only be sure about that when the items are in order. Text works too, as long as the list is sorted. Duplicates do not break it (it finds one of them), and the length does not matter.
%% end

## The bisect module

Python has binary search in its standard library, in the `bisect` module. The function `bisect_left(items, x)` returns the position where `x` **belongs** in a sorted list: the first position that holds `x`, or where `x` would be inserted. The function `bisect_right` gives the position after the last equal item. And `insort` inserts an item at the right place, which keeps the list sorted:

```python run
from bisect import bisect_left, bisect_right, insort

scores = [10, 20, 20, 20, 30]
print(bisect_left(scores, 20), bisect_right(scores, 20))   # where the 20s start and end
print(bisect_left(scores, 25))                             # where 25 would go

def contains(sorted_items, target):
    position = bisect_left(sorted_items, target)
    return position < len(sorted_items) and sorted_items[position] == target

print(contains(scores, 30), contains(scores, 25))

insort(scores, 25)          # insert 25 and keep the list sorted
print(scores)

def grade(mark):
    breakpoints = [60, 70, 80, 90]
    letters = "FDCBA"
    return letters[bisect_right(breakpoints, mark)]

print([grade(mark) for mark in (45, 60, 69, 75, 89, 90, 100)])
```

The last function shows a neat use of `bisect` that has nothing to do with finding items: a **table of ranges**. The breakpoints split the marks into five bands, and `bisect_right` says which band a mark falls into, without a chain of `if` statements. A note on cost: finding the place is O(log n), but `insort` must then shift the items that come after it, so one insertion is still O(n).

%% question q-insort-fill | fill
Fill in the blank so that the program prints the list in order.

```python
from bisect import insort

numbers = [10, 20, 40]
___(numbers, 30)
print(numbers)
```
%% answer
insort
%% expected
[10, 20, 30, 40]
%% explain
The function `insort(numbers, 30)` finds the right place for 30 with a binary search and inserts it there, so the list stays sorted.
%% end

## Sorting: three simple algorithms

Why sort at all? Because order makes questions cheap. A sorted list can be searched in O(log n) steps, duplicates sit next to each other, and the smallest and biggest items are at the two ends. In practice you will call `sorted()`, but to learn how sorting **works** and what it costs, you should write a few sorts yourself. Start with three simple ones, and count their comparisons.

**Bubble sort** compares neighbours and swaps them when they are in the wrong order. After one pass the biggest item has "bubbled" to the end. Watch the list after every pass:

```python run
def show_bubble_passes(items):
    items = list(items)
    for end in range(len(items) - 1, 0, -1):
        for i in range(end):
            if items[i] > items[i + 1]:
                items[i], items[i + 1] = items[i + 1], items[i]
        print(items)

show_bubble_passes([5, 2, 9, 1, 7])
```

**Selection sort** finds the smallest item of the part that is not sorted yet, and swaps it to the front. It makes at most n swaps, but it **always** compares every pair, even when the list is already sorted.

**Insertion sort** works like sorting playing cards in your hand. It takes the next item and slides it to the left, past every bigger item, until it is in the right place among the items before it. When the list is nearly sorted, an item hardly has to slide, so insertion sort is very fast on such lists.

The next program defines all three, and counts the comparisons on three kinds of input:

```python run
import random

def bubble_sort(items):
    items = list(items)
    comparisons = 0
    for end in range(len(items) - 1, 0, -1):
        swapped = False
        for i in range(end):
            comparisons += 1
            if items[i] > items[i + 1]:
                items[i], items[i + 1] = items[i + 1], items[i]
                swapped = True
        if not swapped:                    # a pass without swaps: already sorted
            break
    return items, comparisons

def selection_sort(items):
    items = list(items)
    comparisons = 0
    for start in range(len(items) - 1):
        smallest = start
        for i in range(start + 1, len(items)):
            comparisons += 1
            if items[i] < items[smallest]:
                smallest = i
        items[start], items[smallest] = items[smallest], items[start]
    return items, comparisons

def insertion_sort(items):
    items = list(items)
    comparisons = 0
    for i in range(1, len(items)):
        key = items[i]
        j = i - 1
        while j >= 0:
            comparisons += 1
            if items[j] <= key:            # in the right place: stop sliding
                break
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = key
    return items, comparisons

print(bubble_sort([5, 2, 9, 1, 7])[0], selection_sort([5, 2, 9, 1, 7])[0], insertion_sort([5, 2, 9, 1, 7])[0])

rng = random.Random(42)
random_list = [rng.randrange(10_000) for _ in range(1000)]
sorted_list = sorted(random_list)
reversed_list = sorted_list[::-1]

print(f"{'':<16}{'random':>10}{'sorted':>10}{'reversed':>10}")
for sort in (bubble_sort, selection_sort, insertion_sort):
    row = [sort(data)[1] for data in (random_list, sorted_list, reversed_list)]
    print(f"{sort.__name__:<16}" + "".join(f"{count:>10,}" for count in row))
```

Read the table. All three need about 500,000 comparisons (n^2 / 2) in the worst case for only **1,000** items. Selection sort does not care about the input, but bubble sort (with the early stop) and insertion sort need only 999 comparisons on a sorted list, because they notice that nothing has to move. On random data insertion sort does about half of the work of the others. All three are **O(n^2)**, so they are fine for a few dozen items and hopeless for a million.

## Merge sort: divide and conquer

To do better, use the idea of **divide and conquer**: split the problem into smaller copies of itself, solve those, and combine the answers. **Merge sort** splits the list in two halves, sorts each half (with merge sort, by recursion), and then **merges** the two sorted halves into one. A list with 0 or 1 items is already sorted, and that is the base case.

The clever part is merging, because two sorted lists can be combined with a single pass: compare the first items of both lists, take the smaller one, and repeat.

```python run
def merge(left, right):
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:           # on a tie, take from the left: equal items keep their order
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])               # one of the two lists is used up; add what is left of the other
    merged.extend(right[j:])
    return merged

def merge_sort(items):
    if len(items) <= 1:
        return list(items)
    middle = len(items) // 2
    return merge(merge_sort(items[:middle]), merge_sort(items[middle:]))

print(merge([1, 4, 9], [2, 3, 10, 11]))
print(merge_sort([5, 2, 9, 1, 7, 3]))
print(merge_sort(list("merge sort")))
```

Why is it fast? Look at what happens to a list of four items:

```text
[5, 2, 9, 1]
[5, 2]   [9, 1]         split: the list halves at every level
[5] [2]  [9] [1]        about log n levels in all
[2, 5]   [1, 9]         merge: every level touches each item once, so n steps
[1, 2, 5, 9]
```

Halving gives about **log n** levels, and every level does about **n** work in the merges, so the total is **O(n log n)**. This holds even in the worst case. For a million items, n log n is about 20 million steps, against a trillion steps for n^2. The price is **memory**: merge sort builds new lists, so it needs O(n) extra space.

## Quicksort: pick a pivot

**Quicksort** is another divide and conquer sort. It picks one item, the **pivot**, and splits the rest into the items that are smaller than the pivot and the items that are bigger. The pivot is then in its final place, and the two parts are sorted with quicksort, again by recursion. There is no merge step, because the parts are already in the right order:

```python run
def quicksort(items):
    if len(items) <= 1:
        return list(items)
    pivot = items[len(items) // 2]                 # the middle item
    smaller = [x for x in items if x < pivot]
    equal = [x for x in items if x == pivot]
    larger = [x for x in items if x > pivot]
    return quicksort(smaller) + equal + quicksort(larger)

print(quicksort([5, 2, 9, 1, 7, 3, 5]))
```

On average quicksort is **O(n log n)**. But everything depends on the pivot. When the pivot splits the list evenly, the levels are few. When it is always the smallest or the biggest item, the parts have sizes 0 and n - 1, there are n levels, and the work is **O(n^2)**. A popular beginner's choice, the **first** item as the pivot, is the worst for a list that is already sorted:

```python run error
def quicksort_first(items):
    if len(items) <= 1:
        return items
    pivot = items[0]
    smaller = [x for x in items[1:] if x < pivot]
    larger = [x for x in items[1:] if x >= pivot]
    return quicksort_first(smaller) + [pivot] + quicksort_first(larger)

print(quicksort_first([5, 2, 9, 1, 7, 3, 5]))
print(len(quicksort_first(list(range(2000)))))
```

The first call works, but on the sorted list of 2,000 numbers the recursion goes 2,000 levels deep, and Python stops it with a `RecursionError`. Good implementations choose the **middle** item, a **random** item, or the **median of three** items, so that no common input is the worst case. They also partition the list **in place** instead of building new lists.

## Racing the sorts

Now put them side by side. To count comparisons for **any** sorting function, we can sort a list of small objects that count every comparison made on them. The class `Counted` below does that, and it will be useful again in the exercises:

```python run
import random

class Counted:
    comparisons = 0
    def __init__(self, value):
        self.value = value
    def __lt__(self, other):
        Counted.comparisons += 1
        return self.value < other.value
    def __le__(self, other):
        Counted.comparisons += 1
        return self.value <= other.value
    def __gt__(self, other):
        Counted.comparisons += 1
        return self.value > other.value
    def __ge__(self, other):
        Counted.comparisons += 1
        return self.value >= other.value
    def __eq__(self, other):
        Counted.comparisons += 1
        return self.value == other.value

def insertion_sort(items):
    items = list(items)
    for i in range(1, len(items)):
        key = items[i]
        j = i - 1
        while j >= 0 and items[j] > key:
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = key
    return items

def merge(left, right):
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    return merged + left[i:] + right[j:]

def merge_sort(items):
    if len(items) <= 1:
        return list(items)
    middle = len(items) // 2
    return merge(merge_sort(items[:middle]), merge_sort(items[middle:]))

def quicksort(items):
    if len(items) <= 1:
        return list(items)
    pivot = items[len(items) // 2]
    smaller = [x for x in items if x < pivot]
    equal = [x for x in items if x == pivot]
    larger = [x for x in items if x > pivot]
    return quicksort(smaller) + equal + quicksort(larger)

def count_comparisons(sort, values):
    Counted.comparisons = 0
    sort([Counted(value) for value in values])
    return Counted.comparisons

rng = random.Random(7)
values = [rng.randrange(1_000_000) for _ in range(1000)]
for sort in (insertion_sort, merge_sort, quicksort, sorted):
    print(f"{sort.__name__:<16}{count_comparisons(sort, values):>10,} comparisons")
```

For 1,000 items, insertion sort makes about **250,000** comparisons, and merge sort makes about **8,700**. Quicksort needs a few more than merge sort here, because this version scans the list three times at each level. The last line is the built-in `sorted`, and it is the best of all. Let us look at why.

## Python's own sort

The built-in `sorted(items)` returns a new sorted list, and `items.sort()` sorts the list in place. Both use **Timsort**, an algorithm that was written for Python in 2002 and is now used by many other languages. Timsort is a hybrid of merge sort and insertion sort that looks for **runs**: stretches that are already in order. It takes advantage of them, so it needs only **O(n)** steps on a list that is sorted or nearly sorted, and **O(n log n)** in the worst case. It is also written in C, which makes it many times faster than any sort that you write in Python.

Two features make it very practical. The first is the `key` argument: a function that is called once for each item, to give the value to sort by. The second is that the sort is **stable**: items that compare as equal keep the order that they had before. Stability lets you sort by several criteria, one after the other:

```python run
people = [("Ben", 30), ("Ada", 25), ("Cleo", 30), ("Dev", 25)]

people.sort(key=lambda person: person[1])         # by age: Ada and Dev (25), then Ben and Cleo (30)
print([name for name, age in people])

people.sort(key=lambda person: person[0])         # by name
print(people)

people.sort(key=lambda person: (-person[1], person[0]))    # oldest first, ties by name
print(people)

words = ["banana", "Apple", "cherry", "apple"]
print(sorted(words))
print(sorted(words, key=str.lower))               # the tie between Apple and apple keeps the original order
print(sorted(words, key=len, reverse=True))
```

Look at the first line of output: Ada comes before Dev, and Ben before Cleo, because the sort is stable and that was their original order. A stable sort never shuffles equal items, which is why `sorted(words, key=str.lower)` leaves `"Apple"` before `"apple"` as in the input.

One more idea, **in passing**. All the sorts above work by **comparing** items, and no comparison sort can beat O(n log n) in the worst case. But when the items are **small whole numbers**, you can sort without comparing anything. **Counting sort** counts how many times each value occurs, and then writes the values out in order. It takes O(n + k) steps, where k is the biggest value:

```python run
def counting_sort(numbers, biggest):
    counts = [0] * (biggest + 1)
    for number in numbers:
        counts[number] += 1
    result = []
    for value, how_many in enumerate(counts):
        result.extend([value] * how_many)
    return result

print(counting_sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5], 9))
```

Here is a summary of the sorts of this lesson. Use `sorted` unless you have a very good reason not to:

| Algorithm | Best case | Average | Worst case | Stable |
|---|---|---|---|---|
| bubble sort (early stop) | O(n) | O(n^2) | O(n^2) | yes |
| selection sort | O(n^2) | O(n^2) | O(n^2) | no |
| insertion sort | O(n) | O(n^2) | O(n^2) | yes |
| merge sort | O(n log n) | O(n log n) | O(n log n) | yes |
| quicksort | O(n log n) | O(n log n) | O(n^2) | no, in place versions |
| Timsort (`sorted`) | O(n) | O(n log n) | O(n log n) | yes |

%% question q-sorts-multi | multi
Select every statement that is **true**.
%% choice correct
Insertion sort needs only about n comparisons on a list that is already sorted
%% choice correct
Merge sort needs about n log n comparisons, whatever the order of the input
%% choice correct
A quicksort that always uses the first item as pivot is slow on a list that is already sorted
%% choice
Selection sort is faster on a sorted list than on a random list
%% choice
Bubble sort is a good choice for sorting a million items
%% explain
Insertion sort slides nothing when every item is already in place, so it makes about one comparison per item. Merge sort always splits and merges in the same way, and quicksort with a first-item pivot makes parts of sizes 0 and n - 1 on a sorted list. Selection sort always makes n^2 / 2 comparisons, and the three simple sorts are all hopeless for a million items.
%% end

%% question q-stable-predict | predict
What does this program print?

```python
people = [("Ben", 30), ("Ada", 25), ("Cleo", 30), ("Dev", 25)]
people.sort(key=lambda person: person[1])
print([name for name, age in people])
```
%% answer
['Ada', 'Dev', 'Ben', 'Cleo']
%% explain
The people are sorted by age, so the two 25-year-olds come first. The sort is **stable**: Ada was before Dev, and Ben was before Cleo in the original list, and equal items keep that order.
%% end

%% question q-binary-order | order
Put the lines in order so that the program prints `2`, the index of 5. One line does not belong.
%% lines
def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1
print(binary_search([1, 3, 5, 7], 5))
%% distractors
            low = middle
%% expected
2
%% explain
The function sets up the range, loops while the range is not empty, looks at the middle item, and returns when it finds the target. Otherwise it drops half of the range: `low = middle + 1` when the item is too small, and `high = middle - 1` when it is too big. The distractor `low = middle` does not shrink the range when `low` and `middle` are equal, so a search could loop forever.
%% end

## Your turn

%% exercise binary-search | Binary search
Write `binary_search(items, target)` for a list that is **sorted from small to big**. Return the **index** of `target`, or `-1` when it is missing. Use a loop that halves the search range, so that a list of 100,000 items needs only about 17 steps. Do not use `in`, `.index()` or the `bisect` module: write the search yourself. The tests count how many times your function reads the list. The program below must print:

```output
3
-1
0
6
```
%% starter
def binary_search(items, target):
    # Keep a range low..high that could still hold the target, and halve it.
    pass

items = [2, 5, 8, 12, 16, 23, 38]
print(binary_search(items, 12))
print(binary_search(items, 7))
print(binary_search(items, 2))
print(binary_search(items, 38))
%% solution
def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1

items = [2, 5, 8, 12, 16, 23, 38]
print(binary_search(items, 12))
print(binary_search(items, 7))
print(binary_search(items, 2))
print(binary_search(items, 38))
%% tests
expect_output("3\n-1\n0\n6")
expect(binary_search([], 1), -1)
expect(binary_search([4], 4), 0)
expect(binary_search([4], 5), -1)
expect(binary_search([1, 3, 5, 7, 9, 11], 11), 5)
expect(binary_search([1, 3, 5, 7, 9, 11], 0), -1)
expect(binary_search([1, 3, 5, 7, 9, 11], 12), -1)
expect(binary_search(["ant", "bee", "cat", "dog"], "cat"), 2)
class Spy(list):
    reads = 0
    def __getitem__(self, index):
        if isinstance(index, slice):
            Spy.reads += len(range(*index.indices(len(self))))
        else:
            Spy.reads += 1
        return list.__getitem__(self, index)
    def __iter__(self):
        for position in range(len(self)):
            Spy.reads += 1
            yield list.__getitem__(self, position)
    def __contains__(self, value):
        Spy.reads += len(self)
        return list.__contains__(self, value)
    def index(self, *args):
        Spy.reads += len(self)
        return list.index(self, *args)
big = Spy(range(0, 200_000, 2))
expect(binary_search(big, 199_998), 99_999)
check(Spy.reads <= 60, "100 000 items are found with a few reads", "your function read the list " + str(Spy.reads) + " times; a binary search needs about 17 steps")
Spy.reads = 0
expect(binary_search(big, 77_777), -1)
check(Spy.reads <= 60, "a missing item is also found with a few reads", "your function read the list " + str(Spy.reads) + " times")
check(not uses("In", "NotIn"), "do not use the in operator: it scans the list")
check(not calls("index") and not calls("bisect_left") and not calls("bisect_right") and not calls("bisect"), "write the search yourself")
%% hint
Keep two positions, `low` and `high`, for the part of the list that could still hold the target. At the start they are 0 and `len(items) - 1`.
%% hint
In a loop that runs while `low <= high`, look at `middle = (low + high) // 2`. When `items[middle]` equals the target, return `middle`.
%% hint
When `items[middle]` is smaller than the target, the target is on the right, so set `low = middle + 1`. Otherwise set `high = middle - 1`. When the loop ends, return `-1`.
%% end

%% exercise insertion-sort | Insertion sort
Write `insertion_sort(items)` that sorts the list **in place**: it changes the list that it receives, and it returns nothing. Take the items one at a time, starting with the second, and slide each one to the left until it is in the right place among the items before it. Do not use `sorted` or `.sort()`. The tests count the comparisons: on a list that is **already sorted**, your function must need only about n of them. The program below must print:

```output
[1, 3, 5, 7, 9]
['apple', 'fig', 'kiwi', 'pear']
```
%% starter
def insertion_sort(items):
    # For each position i, slide items[i] left past every bigger item.
    pass

cards = [7, 3, 9, 1, 5]
insertion_sort(cards)
print(cards)

words = ["pear", "fig", "apple", "kiwi"]
insertion_sort(words)
print(words)
%% solution
def insertion_sort(items):
    for i in range(1, len(items)):
        key = items[i]
        j = i - 1
        while j >= 0 and items[j] > key:
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = key

cards = [7, 3, 9, 1, 5]
insertion_sort(cards)
print(cards)

words = ["pear", "fig", "apple", "kiwi"]
insertion_sort(words)
print(words)
%% tests
expect_output("[1, 3, 5, 7, 9]\n['apple', 'fig', 'kiwi', 'pear']")
data = [5, 2, 8, 2, 9, 1]
insertion_sort(data)
expect(data, [1, 2, 2, 5, 8, 9])
empty = []
insertion_sort(empty)
expect(empty, [])
single = [3]
insertion_sort(single)
expect(single, [3])
backwards = list(range(10, 0, -1))
insertion_sort(backwards)
expect(backwards, list(range(1, 11)))
check(not calls("sorted") and not calls("sort"), "write the sorting yourself, without sorted or .sort()")
class Counted:
    comparisons = 0
    def __init__(self, value):
        self.value = value
    def __lt__(self, other):
        Counted.comparisons += 1
        return self.value < other.value
    def __le__(self, other):
        Counted.comparisons += 1
        return self.value <= other.value
    def __gt__(self, other):
        Counted.comparisons += 1
        return self.value > other.value
    def __ge__(self, other):
        Counted.comparisons += 1
        return self.value >= other.value
    def __eq__(self, other):
        Counted.comparisons += 1
        return self.value == other.value
already = [Counted(i) for i in range(500)]
Counted.comparisons = 0
insertion_sort(already)
check(Counted.comparisons <= 1500, "a sorted list needs only about n comparisons", "your function made " + str(Counted.comparisons) + " comparisons for 500 sorted items; stop sliding as soon as the item is in place")
import random
rng = random.Random(3)
values = [rng.randrange(1000) for _ in range(300)]
mixed = [Counted(value) for value in values]
insertion_sort(mixed)
expect([item.value for item in mixed], sorted(values))
%% hint
Start the outer loop at position 1: the first item alone is already a sorted part of length 1. Save the item in a variable `key`, because its place will be overwritten.
%% hint
Walk left from `j = i - 1` while `j >= 0` and `items[j] > key`. In each step, copy `items[j]` one place to the right (`items[j + 1] = items[j]`), and move `j` one place left.
%% hint
When the walk stops, put `key` into the gap: `items[j + 1] = key`. Because the walk stops at the first item that is not bigger, a sorted list needs only one comparison for each item.
%% end

%% exercise merge-lists | Merge two sorted lists
The heart of merge sort is **merging**. Write `merge(left, right)` for two lists that are each sorted from small to big. Return a **new** list with all the items of both lists, in order, and do not change the two lists. Keep a position in each list, compare the two items there, and take the smaller one. When the items are **equal**, take the one from `left` first, so that equal items keep their order. Do not use `sorted` or `.sort()`. The tests count the comparisons: merging lists with n items in all needs at most n of them. The program below must print:

```output
[1, 2, 3, 4, 9, 10, 11]
[5, 6]
[7]
['a', 'b', 'c', 'd']
```
%% starter
def merge(left, right):
    # Walk through both lists with two positions, and take the smaller item each time.
    pass

print(merge([1, 4, 9], [2, 3, 10, 11]))
print(merge([], [5, 6]))
print(merge([7], []))
print(merge(["a", "c"], ["b", "d"]))
%% solution
def merge(left, right):
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

print(merge([1, 4, 9], [2, 3, 10, 11]))
print(merge([], [5, 6]))
print(merge([7], []))
print(merge(["a", "c"], ["b", "d"]))
%% tests
expect_output("[1, 2, 3, 4, 9, 10, 11]\n[5, 6]\n[7]\n['a', 'b', 'c', 'd']")
expect(merge([], []), [])
expect(merge([1, 2, 3], [4, 5]), [1, 2, 3, 4, 5])
expect(merge([4, 5], [1, 2, 3]), [1, 2, 3, 4, 5])
expect(merge([1, 1, 2], [1, 3]), [1, 1, 1, 2, 3])
first = [1, 3, 5]
second = [2, 4]
merge(first, second)
expect(first, [1, 3, 5])
expect(second, [2, 4])
check(not calls("sorted") and not calls("sort"), "write the merging yourself, without sorted or .sort()")
class Item:
    def __init__(self, key, tag):
        self.key = key
        self.tag = tag
    def __lt__(self, other):
        return self.key < other.key
    def __le__(self, other):
        return self.key <= other.key
    def __gt__(self, other):
        return self.key > other.key
    def __ge__(self, other):
        return self.key >= other.key
    def __eq__(self, other):
        return self.key == other.key
ties = merge([Item(1, "L1"), Item(2, "L2")], [Item(1, "R1"), Item(2, "R2")])
expect([item.tag for item in ties], ["L1", "R1", "L2", "R2"], "equal items: the one from the left list comes first")
class Counted:
    comparisons = 0
    def __init__(self, value):
        self.value = value
    def __lt__(self, other):
        Counted.comparisons += 1
        return self.value < other.value
    def __le__(self, other):
        Counted.comparisons += 1
        return self.value <= other.value
    def __gt__(self, other):
        Counted.comparisons += 1
        return self.value > other.value
    def __ge__(self, other):
        Counted.comparisons += 1
        return self.value >= other.value
    def __eq__(self, other):
        Counted.comparisons += 1
        return self.value == other.value
evens = [Counted(i) for i in range(0, 1000, 2)]
odds = [Counted(i) for i in range(1, 1001, 2)]
Counted.comparisons = 0
joined = merge(evens, odds)
expect([item.value for item in joined], list(range(1000)))
check(Counted.comparisons <= 1000, "one pass is enough: at most n comparisons", "your function made " + str(Counted.comparisons) + " comparisons for 1000 items")
%% hint
Keep one position in each list, `i` and `j`, both starting at 0. While both lists have items left, compare `left[i]` with `right[j]`.
%% hint
Append the smaller one to the result and move only its position forward. Use `<=` for the test `left[i] <= right[j]`, so that on a tie the item of `left` is taken first.
%% hint
When the loop ends, one list is used up and the other may still have items. Add what is left of both: `merged.extend(left[i:])` and `merged.extend(right[j:])`. One of them is empty.
%% end

%% exercise merge-sort | Challenge: Merge sort
Write `merge_sort(items)` that returns a **new** sorted list and leaves the original list unchanged. Split the list in two halves, sort each half with `merge_sort` itself, and combine the halves with the function `merge`, which is already written for you in the starter. A list with 0 or 1 items is already sorted. Do not use `sorted` or `.sort()`. The tests count the comparisons: for 2,000 items your sort needs fewer than 25,000, where an insertion sort needs about a million. The program below must print:

```output
[1, 2, 3, 5, 7, 9]
[]
[' ', 'e', 'e', 'g', 'm', 'o', 'r', 'r', 's', 't']
```
%% starter
def merge(left, right):
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

def merge_sort(items):
    # The base case is a list of 0 or 1 items. Otherwise split, sort the halves, and merge.
    pass

print(merge_sort([5, 2, 9, 1, 7, 3]))
print(merge_sort([]))
print(merge_sort(list("merge sort")))
%% solution
def merge(left, right):
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

def merge_sort(items):
    if len(items) <= 1:
        return list(items)
    middle = len(items) // 2
    return merge(merge_sort(items[:middle]), merge_sort(items[middle:]))

print(merge_sort([5, 2, 9, 1, 7, 3]))
print(merge_sort([]))
print(merge_sort(list("merge sort")))
%% tests
expect_output("[1, 2, 3, 5, 7, 9]\n[]\n[' ', 'e', 'e', 'g', 'm', 'o', 'r', 'r', 's', 't']")
expect(merge_sort([4]), [4])
expect(merge_sort([3, 3, 3]), [3, 3, 3])
expect(merge_sort([9, 8, 7, 6, 5, 4, 3, 2, 1]), [1, 2, 3, 4, 5, 6, 7, 8, 9])
original = [3, 1, 2]
result = merge_sort(original)
expect(original, [3, 1, 2], "the original list is not changed")
expect(result, [1, 2, 3])
check(result is not original, "return a new list")
check(not calls("sorted") and not calls("sort"), "write the sorting yourself, without sorted or .sort()")
class Item:
    def __init__(self, key, tag):
        self.key = key
        self.tag = tag
    def __lt__(self, other):
        return self.key < other.key
    def __le__(self, other):
        return self.key <= other.key
    def __gt__(self, other):
        return self.key > other.key
    def __ge__(self, other):
        return self.key >= other.key
    def __eq__(self, other):
        return self.key == other.key
cards = [Item(2, "a"), Item(1, "b"), Item(2, "c"), Item(1, "d"), Item(2, "e")]
expect([item.tag for item in merge_sort(cards)], ["b", "d", "a", "c", "e"], "equal items keep their order")
class Counted:
    comparisons = 0
    def __init__(self, value):
        self.value = value
    def __lt__(self, other):
        Counted.comparisons += 1
        return self.value < other.value
    def __le__(self, other):
        Counted.comparisons += 1
        return self.value <= other.value
    def __gt__(self, other):
        Counted.comparisons += 1
        return self.value > other.value
    def __ge__(self, other):
        Counted.comparisons += 1
        return self.value >= other.value
    def __eq__(self, other):
        Counted.comparisons += 1
        return self.value == other.value
import random
rng = random.Random(11)
values = [rng.randrange(100_000) for _ in range(2000)]
many = [Counted(value) for value in values]
Counted.comparisons = 0
ordered = merge_sort(many)
expect([item.value for item in ordered], sorted(values))
check(Counted.comparisons < 25_000, "2000 items need about 20 000 comparisons", "your sort made " + str(Counted.comparisons) + " comparisons")
%% hint
The base case: a list with 0 or 1 items is already sorted, so return a copy of it (`list(items)`).
%% hint
Find the middle with `len(items) // 2`. The two halves are `items[:middle]` and `items[middle:]`. Sort each half by calling `merge_sort` on it.
%% hint
Combine the two sorted halves with `merge`: `return merge(merge_sort(left_half), merge_sort(right_half))`. Only the base case and these two lines are needed.
%% end

## What you learned

- A **linear search** looks at the items one by one: O(n), and it works on any list. A **binary search** needs a **sorted** list and halves the range at every step: O(log n), so a billion items need only about 30 comparisons.
- Write binary search with `low`, `high` and `middle = (low + high) // 2`, loop while `low <= high`, and always move with `middle + 1` and `middle - 1`. Never slice the list to shrink it.
- The `bisect` module has binary search ready made: `bisect_left` and `bisect_right` find the place for a value, `insort` inserts and keeps the list sorted (that insertion still moves items, so it is O(n)), and `bisect` is also good for tables of ranges.
- **Bubble, selection and insertion sort** are simple and O(n^2). Insertion sort and bubble sort with an early stop are O(n) on a sorted list, and insertion sort is the best of the three on nearly sorted data.
- **Merge sort** is divide and conquer: split in half, sort the halves, **merge** them. It is O(n log n) in every case, and it needs O(n) extra memory. **Quicksort** splits around a **pivot** and is O(n log n) on average, but O(n^2) with a bad pivot, such as the first item of a sorted list.
- Python's `sorted()` and `.sort()` use **Timsort**: O(n) on sorted data, O(n log n) in the worst case, written in C, and **stable**. Use the `key` argument to choose what to sort by, and use stability to sort by several criteria in turn.
- No sort that compares items can beat O(n log n), but **counting sort** avoids comparing and needs only O(n + k) for small whole numbers.
- A class that counts its own comparisons (`Counted`) is a handy way to measure any sorting algorithm by steps and not by seconds.
