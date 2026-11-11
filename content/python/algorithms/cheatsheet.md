---
title: Algorithms: cheat sheet
---
## Efficiency and Big-O

| Big-O | Name | Typical example | When n doubles |
|---|---|---|---|
| O(1) | constant | list index, dict lookup | no change |
| O(log n) | logarithmic | binary search | one more step |
| O(n) | linear | one loop, `x in a_list` | work doubles |
| O(n log n) | linearithmic | merge sort, `sorted` | slightly more than doubles |
| O(n^2) | quadratic | a loop inside a loop | work becomes 4 times |
| O(2^n) | exponential | all subsets, plain `fib` | one more item doubles it |

```python
import time
from timeit import timeit, repeat

start = time.perf_counter()
result = sum(range(1_000_000))
elapsed = time.perf_counter() - start           # only the difference means anything

timeit("x in numbers", globals=globals(), number=100)           # total time of 100 runs
min(repeat("sorted(numbers)", globals=globals(), number=10, repeat=3))   # the smallest repeat is the best
```

- **Count steps, not seconds.** Big-O keeps the shape of the growth and drops constant factors and smaller terms. It usually describes the **worst case**.
- One loop is O(n), a loop in a loop is O(n^2), halving is O(log n), and loops one after the other **add**. Built-ins such as `sum`, `max`, `in` on a list and `sorted` hide a loop.
- The **doubling test**: run it for n and 2n. A ratio near 2 means linear, and near 4 means quadratic.
- Fast code often **spends memory to save time**. A set or a dict gives O(1) lookups. A `deque` is O(1) at both ends, and `list.insert(0, x)` and `list.pop(0)` are O(n).

## Searching

```python
def binary_search(items, target):          # items must be sorted
    low, high = 0, len(items) - 1
    while low <= high:                     # <=, so a range of one item is still checked
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1               # always move by one: low = middle can loop for ever
        else:
            high = middle - 1
    return -1

from bisect import bisect_left, bisect_right, insort

bisect_left([10, 20, 20, 30], 20)          # 1: the first place where 20 fits
bisect_right([10, 20, 20, 30], 20)         # 3: the place after the last 20
insort(sorted_list, 25)                    # insert and keep the list sorted (still O(n) to shift)
"FDCBA"[bisect_right([60, 70, 80, 90], 75)]    # a table of ranges, with no chain of ifs
```

- **Linear search** is O(n) and works on any list. **Binary search** is O(log n) and needs **sorted** data: a billion items need about 30 comparisons.
- Never slice the list to shrink it: a slice copies the items, which costs O(n).

## Sorting

```python
def insertion_sort(items):                 # O(n^2), but O(n) when nearly sorted
    for i in range(1, len(items)):
        key = items[i]
        j = i - 1
        while j >= 0 and items[j] > key:
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = key

def merge(left, right):                    # two sorted lists become one in O(n)
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:            # <= keeps equal items in order (stable)
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    return merged + left[i:] + right[j:]

def merge_sort(items):                     # O(n log n) in every case, O(n) extra memory
    if len(items) <= 1:
        return list(items)
    middle = len(items) // 2
    return merge(merge_sort(items[:middle]), merge_sort(items[middle:]))

sorted(items)                              # a new list (Timsort: stable, O(n log n), O(n) if sorted)
items.sort(key=len, reverse=True)          # in place, sorted by a key function
sorted(people, key=lambda p: (-p[1], p[0]))    # oldest first, ties by name
```

| Algorithm | Best | Average | Worst | Stable |
|---|---|---|---|---|
| bubble (early stop) | O(n) | O(n^2) | O(n^2) | yes |
| selection | O(n^2) | O(n^2) | O(n^2) | no |
| insertion | O(n) | O(n^2) | O(n^2) | yes |
| merge | O(n log n) | O(n log n) | O(n log n) | yes |
| quicksort | O(n log n) | O(n log n) | O(n^2) | in place: no |
| Timsort (`sorted`) | O(n) | O(n log n) | O(n log n) | yes |

- A **stable** sort keeps equal items in their original order, so you can sort by one key after another. Quicksort needs a good pivot (middle or random, not the first item of sorted data).
- **Counting sort** needs no comparisons for small whole numbers: O(n + k).

## Recursion, memoisation and dynamic programming

```python
from functools import cache

@cache                                     # memoisation: remember the answer for each argument
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

fib.cache_info()                           # hits, misses and size

def climb(n):                              # bottom-up: fill a table with a loop, no recursion
    ways = [1, 1] + [0] * (n - 1)
    for step in range(2, n + 1):
        ways[step] = ways[step - 1] + ways[step - 2]
    return ways[n]

def min_coins(coins, amount):              # best[a] = the fewest coins that make a
    unreachable = amount + 1
    best = [0] + [unreachable] * amount
    for total in range(1, amount + 1):
        for coin in coins:
            if coin <= total:
                best[total] = min(best[total], best[total - coin] + 1)
    return best[amount] if best[amount] != unreachable else -1

def knapsack(items, capacity):             # items are (weight, value); each one is used once
    best = [0] * (capacity + 1)
    for weight, value in items:
        for w in range(capacity, weight - 1, -1):      # backwards!
            best[w] = max(best[w], best[w - weight] + value)
    return best[capacity]

def subsets(items):                        # backtracking: choose, explore, un-choose
    result, chosen = [], []
    def explore(position):
        if position == len(items):
            result.append(chosen[:])       # copy: chosen keeps changing
            return
        explore(position + 1)              # leave it out
        chosen.append(items[position])     # put it in
        explore(position + 1)
        chosen.pop()                       # undo
    explore(0)
    return result

def power(base, exponent):                 # divide and conquer: about log n multiplications
    if exponent == 0:
        return 1
    half = power(base, exponent // 2)
    return half * half if exponent % 2 == 0 else half * half * base
```

- The recipe for dynamic programming: define the **subproblem**, write the **recurrence**, set the **base cases**, choose the **order**, read the answer from the table.
- Memoisation needs a **pure** function with **hashable** arguments. It costs memory (one entry per argument).
- Recursion is limited to about **1,000** levels (about 800 through `@cache` on this site). A bottom-up loop has no limit.
- **Pruning** a branch as soon as it cannot work makes backtracking practical (n-queens).

## Stacks, queues and heaps

```python
stack = []
stack.append(x)                            # push
stack[-1]                                  # peek
stack.pop()                                # pop: last in, first out

from collections import deque

queue = deque()
queue.append(x)                            # enqueue at the back
queue.popleft()                            # dequeue from the front: first in, first out

import heapq

heap = []
heapq.heappush(heap, (priority, item))     # O(log n)
heapq.heappop(heap)                        # the smallest first, O(log n)
heap[0]                                    # peek at the smallest, O(1)
heapq.heapify(items)                       # make a list into a heap in O(n)
heapq.nlargest(3, items)                   # the 3 biggest
heapq.heappush(heap, -score)               # a max heap: push negatives
```

- A stack is a list with `append` and `pop`. A queue is a `deque`, because `list.pop(0)` is O(n). Match the structure to the operations that you need.
- A stack of opening brackets checks that brackets are balanced. A queue serves requests in order. A heap serves the most important item first, or keeps the k biggest of a stream.

## Linked lists and trees

```python
class Node:                                # a linked list node
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

class TreeNode:                            # a binary tree node
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(root, value):                   # binary search tree: smaller left, bigger right
    if root is None:
        return TreeNode(value)
    if value < root.value:
        root.left = insert(root.left, value)
    elif value > root.value:
        root.right = insert(root.right, value)
    return root

def inorder(root):                         # left, node, right: sorted order for a BST
    return [] if root is None else inorder(root.left) + [root.value] + inorder(root.right)
```

- A linked list adds at the front in O(1) and finds an item in O(n). A search tree costs O(height) for `insert` and `contains`: O(log n) when balanced, O(n) when it is a chain.
- Walks of a tree: pre-order (node, left, right), in-order (left, node, right), post-order (left, right, node), and level-order with a queue.

## Graphs

```python
graph = {"A": ["B", "C"], "B": ["A"], "C": ["A"]}      # a dictionary of lists of neighbours

from collections import deque

def bfs_path(graph, start, goal):          # fewest roads, O(V + E)
    parent = {start: None}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node == goal:
            path = []
            while node is not None:
                path.append(node)
                node = parent[node]
            return path[::-1]
        for neighbour in graph[node]:
            if neighbour not in parent:
                parent[neighbour] = node
                queue.append(neighbour)
    return None

import heapq

def dijkstra(graph, start):                # graph[node] is a list of (neighbour, cost) pairs
    best = {start: 0}
    heap = [(0, start)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost > best[node]:
            continue                       # a stale entry
        for neighbour, road in graph[node]:
            new_cost = cost + road
            if neighbour not in best or new_cost < best[neighbour]:
                best[neighbour] = new_cost
                heapq.heappush(heap, (new_cost, neighbour))
    return best
```

- **BFS** uses a queue and finds the route with the fewest roads. **DFS** uses a stack or recursion and answers questions of connection. Both mark nodes as seen, so a cycle cannot trap them.
- **Dijkstra** uses a heap and finds the cheapest routes when every cost is positive: O((V + E) log V).
- Use the standard library first: lists, `deque`, `heapq`, dicts, sets and `bisect` cover most needs.
