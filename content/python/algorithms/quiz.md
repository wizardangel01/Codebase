---
title: Algorithms: module quiz
pass: 70
---
Twelve questions on everything in this module: measuring efficiency, searching and sorting, recursion and dynamic programming, and the classic data structures. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | predict
What does this program print?

```python
def steps(n):
    count = 0
    for i in range(n):
        for j in range(i):
            count += 1
    return count

print(steps(5), steps(10))
```
%% answer
10 45
%% explain
For each `i` the inner loop runs `i` times, so the total is 0 + 1 + 2 + ... + (n - 1), which is n x (n - 1) / 2. For n = 5 that is 10, and for n = 10 it is 45. Doubling n made the work more than four times bigger, which is the sign of an O(n^2) algorithm.
%% end

%% question q2 | multi
Select every operation that takes about the same time however many items the container holds (constant time on average).
%% choice correct
`len(items)` on a list
%% choice correct
`items[-1]` on a list
%% choice correct
`key in some_dict`
%% choice correct
`items.append(x)` on a list
%% choice
`x in some_list`
%% choice
`sorted(items)`
%% choice
`items.pop(0)` on a list
%% explain
A list knows its own length, reads any position directly, and adds at the end in amortised O(1) time. A dictionary finds a key by hashing. Looking for a value in a list means scanning it, `sorted` has to order every item, and `pop(0)` moves all the other items one place to the left.
%% end

%% question q3 | fill
Fill in the blank so that the program prints `True`, because the list holds a duplicate.

```python
names = ["Ada", "Ben", "Ada", "Cleo"]
print(len(___(names)) != len(names))
```
%% answer
set
%% expected
True
%% explain
A `set` keeps only one copy of each value, so `set(names)` has 3 items while the list has 4. Comparing the two lengths finds a duplicate in O(n) steps, with no loop inside a loop.
%% end

%% question q4 | predict
What does this program print?

```python
from bisect import bisect_left, bisect_right

data = [1, 3, 3, 3, 7, 9]
print(bisect_left(data, 3), bisect_right(data, 3), bisect_left(data, 8))
```
%% answer
1 4 5
%% explain
The three 3s sit at positions 1, 2 and 3. The function `bisect_left` gives the position of the first one, 1, and `bisect_right` gives the position after the last one, 4. The number 8 would be inserted between 7 and 9, at position 5.
%% end

%% question q5 | choice
About how many comparisons does a binary search need, at most, to look through 1,000,000 sorted items?
%% choice correct
About 20
%% choice
About 1,000
%% choice
About 500,000
%% choice
About 1,000,000
%% explain
Each comparison halves the range that is left, and a million items can be halved about 20 times before only one is left (2 to the power 20 is a little over a million). A linear search needs up to 1,000,000 comparisons.
%% end

%% question q6 | order
Put the lines in order to make the function `merge`, which joins two sorted lists, so that the program prints `[1, 2, 3, 4]`. One line does not belong.
%% lines
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
print(merge([1, 4], [2, 3]))
%% distractors
    return merged
%% expected
[1, 2, 3, 4]
%% explain
The function prepares an empty result and two positions, and loops while both lists still have items. It takes the smaller of the two front items and moves that position forward. When the loop ends, one list may still have items left, so they are added at the end. The distractor `return merged` would lose those items: `merge([1, 4], [2, 3])` would give `[1, 2, 3]` and forget the 4.
%% end

%% question q7 | predict
What does this program print?

```python
best = [0] + [99] * 4
for amount in range(1, 5):
    for coin in (1, 3):
        if coin <= amount:
            best[amount] = min(best[amount], best[amount - coin] + 1)
print(best)
```
%% answer
[0, 1, 2, 1, 2]
%% explain
Entry `best[a]` is the fewest coins for the amount `a`. Amount 1 needs one 1-coin, and amount 2 needs two. Amount 3 is one 3-coin. Amount 4 is a 3-coin plus a 1-coin, or four 1-coins, and the best is 2 coins.
%% end

%% question q8 | multi
Select every statement that is **true**.
%% choice correct
The arguments of a function decorated with `@cache` must be hashable
%% choice correct
Backtracking undoes each choice after it has explored the consequences of that choice
%% choice correct
A bottom-up solution has no recursion, so it never meets the recursion limit
%% choice
Merge sort is fast because it solves the same subproblems again and again and remembers the answers
%% choice
Taking the biggest coin first always gives the fewest coins
%% explain
The cache stores answers in a dictionary, so the arguments must be hashable. Backtracking follows the pattern of choose, explore and un-choose. A table filled by a loop needs no recursion. The parts of a merge sort are independent, so there is nothing to remember, and a greedy method can fail: with coins 1, 3 and 4, the amount 6 needs 2 coins, but greedy uses 3.
%% end

%% question q9 | choice
A puzzle asks you to **list every arrangement** of the letters of a word. Which technique fits best?
%% choice
Binary search
%% choice correct
Backtracking
%% choice
A bottom-up table that finds the best value
%% choice
Dijkstra's algorithm
%% explain
Listing every arrangement means building each answer one choice at a time, and undoing the choice to try the next one: that is backtracking. Binary search needs sorted data and looks for one item. A table finds a best value or a count, and Dijkstra finds cheapest routes in a graph.
%% end

%% question q10 | predict
What does this program print?

```python
from collections import deque

d = deque([1, 2, 3])
d.append(4)
d.appendleft(0)
d.pop()
d.popleft()
print(list(d))
```
%% answer
[1, 2, 3]
%% explain
The deque goes from `[1, 2, 3]` to `[1, 2, 3, 4]`, then to `[0, 1, 2, 3, 4]`. The call `pop()` removes the item on the right, which is 4, and `popleft()` removes the item on the left, which is 0. What remains is `[1, 2, 3]`.
%% end

%% question q11 | choice
The roads of a map have different lengths, and all of them are positive. Which algorithm finds the **cheapest** route from one place to all the others?
%% choice
Breadth-first search
%% choice
Depth-first search
%% choice correct
Dijkstra's algorithm
%% choice
An in-order walk of a binary search tree
%% explain
Breadth-first search finds the route with the fewest roads, but it does not look at their lengths. Depth-first search does not look for short routes at all. Dijkstra's algorithm uses a priority queue to continue from the cheapest unfinished place, which makes it right for positive lengths.
%% end

%% question q12 | fill
Fill in the blank so that the program prints `2`.

```python
import heapq

heap = []
heapq.___(heap, 5)
heapq.heappush(heap, 2)
print(heap[0])
```
%% answer
heappush
%% expected
2
%% explain
The function `heappush` adds an item and keeps the list arranged as a heap, so that the smallest item is always at position 0. After pushing 5 and 2, `heap[0]` is 2.
%% end
