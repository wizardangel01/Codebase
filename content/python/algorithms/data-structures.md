---
title: Stacks, queues, trees and graphs
---
The best algorithm often starts with a good choice of **data structure**: a way of arranging data so that the questions you ask are cheap to answer. A stack gives you the last thing that you put in. A queue gives you the first. A heap hands you the smallest. A tree keeps data in order and finds it in a few steps, and a graph describes anything that is connected: roads, friends, web pages, game boards. In this lesson you will build all of them in Python, using the tools that you already know: lists, `deque`, `heapq`, classes and dictionaries. You will finish with **breadth-first search** and **Dijkstra's algorithm**, the two algorithms that find the shortest route.

## Stacks: last in, first out

A **stack** works like a pile of plates. You put a plate on the top, and you take a plate from the top, so the plate that went in **last** comes out **first** (LIFO). The operations have traditional names: **push** to add, **pop** to remove, and **peek** to look at the top without removing it. A Python `list` is a good stack, because `append` and `pop()` work at the end of the list, and both take O(1) time:

```python run
stack = []
stack.append("a")                  # push
stack.append("b")
stack.append("c")
print(stack[-1])                   # peek: the top is "c"
print(stack.pop(), stack.pop())    # pop: "c" first, then "b"
print(stack, len(stack) == 0)      # one item is left, so the stack is not empty
```

Stacks are everywhere. The **undo** button of an editor is a stack of changes. The back button of a browser is a stack of pages. And Python itself keeps a **call stack**: every function call is pushed, and the call is popped when the function returns, which is why a recursion that is too deep is called a "stack overflow". A classic job for a stack is checking brackets. Push every opening bracket. For every closing bracket, the top of the stack must be its partner:

```python run
def balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for character in text:
        if character in "([{":
            stack.append(character)
        elif character in pairs:
            if not stack or stack.pop() != pairs[character]:
                return False
    return not stack                       # nothing may be left open

for sample in ("(a + b) * [c]", "(]", "((())", "{[()()]}"):
    print(f"{sample!r:>16} {balanced(sample)}")
```

The function fails in three ways: a closing bracket arrives when the stack is empty, a closing bracket meets the wrong partner, or some opening brackets remain at the end. Notice that the stack remembers **the order** in which the brackets were opened, which a simple counter cannot do.

%% question q-stack-predict | predict
What does this program print?

```python
stack = []
for word in ["red", "green", "blue"]:
    stack.append(word)
stack.pop()
stack.append("pink")
print(stack)
```
%% answer
['red', 'green', 'pink']
%% explain
After the loop, the stack is `['red', 'green', 'blue']` with `blue` on top. The call `pop()` removes `blue`, and `append("pink")` puts `pink` on the top in its place.
%% end

## Queues: first in, first out

A **queue** works like a line at a shop: the first person to arrive is served first (FIFO). You **enqueue** at the back and **dequeue** from the front. Do not use a list for this: `list.pop(0)` must move every other item, so each removal takes O(n) time, as lesson 1 showed. Use `collections.deque`, which is fast at both ends:

```python run
from collections import deque

line = deque()
line.append("Ada")            # enqueue at the back
line.append("Ben")
line.append("Cleo")
print(line.popleft())         # dequeue from the front: Ada
print(line, len(line))

# round robin: every task gets one unit of work in its turn
tasks = deque([("print", 3), ("backup", 1), ("scan", 2)])
turn = 0
while tasks:
    name, left = tasks.popleft()
    turn += 1
    if left > 1:
        tasks.append((name, left - 1))        # not finished: back of the line
    else:
        print(f"turn {turn}: {name} finished")
```

The second half is a tiny model of how an operating system shares a processor between programs. Queues also hold print jobs, web requests, and messages between programs. Soon you will see the queue in its most famous role: it is the heart of **breadth-first search**.

%% question q-structure-choice | choice
A web server must handle the requests in the same order in which they arrive. Which structure fits?
%% choice
A stack
%% choice correct
A queue
%% choice
A binary search tree
%% choice
A set
%% explain
First come, first served is the rule of a queue. A stack would serve the newest request first, so older requests could wait for ever. A tree and a set do not remember the order of arrival at all.
%% end

%% question q-deque-fill | fill
Fill in the blank so that the program prints `Ada`.

```python
from collections import deque

line = deque(["Ada", "Ben", "Cleo"])
print(line.___())
```
%% answer
popleft
%% expected
Ada
%% explain
The method `popleft()` removes and returns the item at the **front** of the deque, and that is the person who has waited longest. The method `pop()` would give the item at the other end, `Cleo`.
%% end

## Priority queues and heaps

Sometimes the next item to serve is not the oldest but the most **important**: an emergency room treats the most serious case first, and a scheduler runs the most urgent task. That is a **priority queue**: `push` adds an item with a priority, and `pop` removes the one with the smallest priority number. A sorted list would work, but then every insertion costs O(n). A **heap** does both jobs in O(log n).

A **heap** is a list that Python keeps arranged so that every item is smaller than or equal to its two "children" (the items at positions `2 * i + 1` and `2 * i + 2`). This puts the smallest item at position 0. The list is not fully sorted, but the arrangement is enough to find the smallest at once, and to restore the order cheaply after a push or a pop. Watch the list as numbers are pushed, and then use the more useful form, with tuples:

```python run
import heapq

heap = []
for number in [5, 3, 8, 1]:
    heapq.heappush(heap, number)
    print(heap)
print(heapq.heappop(heap), heap)             # the smallest comes out first

numbers = [9, 4, 7, 1, 8, 2]
heapq.heapify(numbers)                       # turn a list into a heap in O(n)
print(numbers, numbers[0])                   # numbers[0] is always the smallest

tasks = []
heapq.heappush(tasks, (2, "write report"))
heapq.heappush(tasks, (1, "fix bug"))
heapq.heappush(tasks, (3, "tea"))
heapq.heappush(tasks, (1, "deploy"))
while tasks:
    print(heapq.heappop(tasks))              # lowest priority number first; ties by text
```

Three things to remember. First, `heapq` has no "max heap": to get the **biggest** item first, push the **negative** numbers (`-score`) and negate them again when you pop. Second, tuples compare item by item, so `(priority, item)` pairs sort by priority first, and by the item when the priorities are equal. The items must then be comparable, or you can add a counter as a tie breaker. Third, the cost: `heappush` and `heappop` are O(log n), looking at `heap[0]` is O(1), and `heapify` is O(n).

A heap is also the right tool for "the k biggest items of a long stream". Keep a heap of only `k` items. Each new number goes in, and when the heap holds more than `k` items, the smallest is thrown away. What remains are the k biggest. The work is O(n log k), and the memory is only O(k), however long the stream is:

```python run
import heapq
import random

def top_k(stream, k):
    heap = []
    for number in stream:
        heapq.heappush(heap, number)
        if len(heap) > k:
            heapq.heappop(heap)                # the smallest of the k + 1 has no chance
    return sorted(heap, reverse=True)

rng = random.Random(1)
stream = [rng.randrange(1_000_000) for _ in range(100_000)]
print(top_k(stream, 3) == sorted(stream, reverse=True)[:3])

def heap_sort(items):                          # push all, then pop all: sorted order
    heap = list(items)
    heapq.heapify(heap)
    return [heapq.heappop(heap) for _ in range(len(heap))]

print(heap_sort([5, 2, 9, 1, 7]))
```

The standard library has this already as `heapq.nlargest(k, items)` and `heapq.nsmallest(k, items)`. The last function is **heap sort**: it needs O(n log n) time, like merge sort.

%% question q-heap-predict | predict
What does this program print?

```python
import heapq

heap = []
for number in [5, 3, 8, 1, 9, 2]:
    heapq.heappush(heap, number)
print(heapq.heappop(heap), heapq.heappop(heap))
print(heap[0])
```
%% answer
1 2
3
%% explain
Each `heappop` removes the smallest item, so the first line is `1 2`. The numbers that remain are 3, 5, 8 and 9, and `heap[0]` is always the smallest of them, which is 3.
%% end

## Linked lists

A `list` keeps its items next to each other in memory. A **linked list** does the opposite: every item sits in its own small object, a **node**, and the node holds a link to the next node. The list is only a link to the first node, the **head**:

```text
head -> [3 | next] -> [2 | next] -> [1 | next] -> None
```

The costs are the opposite of an array's. Adding a node at the **front** takes O(1), because you only create a node and change the head. There is no shifting. But finding the item at position `i` takes O(i), because you must follow the links one by one. In everyday Python you should reach for a `list` or a `deque` (which is built from linked blocks) and not write your own. Still, a linked list is the clearest way to learn how **references** work, and the same idea of nodes that point to nodes is behind trees and graphs:

```python run
class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def push_front(self, value):               # O(1): no item has to move
        self.head = Node(value, self.head)
        self.size += 1

    def append(self, value):                   # O(n): walk to the last node
        node = Node(value)
        if self.head is None:
            self.head = node
        else:
            current = self.head
            while current.next is not None:
                current = current.next
            current.next = node
        self.size += 1

    def __iter__(self):                        # a generator, as in Module 13
        current = self.head
        while current is not None:
            yield current.value
            current = current.next

    def __len__(self):
        return self.size

    def reverse(self):                         # turn every link around: O(n)
        previous = None
        current = self.head
        while current is not None:
            following = current.next
            current.next = previous
            previous = current
            current = following
        self.head = previous

numbers = LinkedList()
for value in (3, 2, 1):
    numbers.push_front(value)
numbers.append(4)
print(list(numbers), len(numbers))
numbers.reverse()
print(list(numbers))
```

The method `reverse` is a famous exercise. It walks along the list once, and turns each link around to point at the **previous** node. Read the four lines inside the loop slowly: they save the next node, redirect the link, and then step forward. The order of the lines matters, because after `current.next = previous` the old link would be lost if it had not been saved in `following`.

## Binary trees

A **tree** is made of nodes where each node can have **children**. In a **binary tree** every node has at most two: a **left** child and a **right** child. The top node is the **root**, a node without children is a **leaf**, and the **height** is the number of levels. Trees describe anything that nests: folders in folders, the structure of a web page, the choices in a game.

```text
        1
       / \
      2   3
     / \   \
    4   5   6
```

To visit every node, you walk the tree in some **order**. Three orders go deep first, and differ only in **when the node itself is visited**: **pre-order** (node, left, right), **in-order** (left, node, right) and **post-order** (left, right, node). A fourth order, **level-order**, visits the tree level by level, with a **queue**:

```python run
from collections import deque

class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

tree = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3, None, TreeNode(6)))

def preorder(node):
    return [] if node is None else [node.value] + preorder(node.left) + preorder(node.right)

def inorder(node):
    return [] if node is None else inorder(node.left) + [node.value] + inorder(node.right)

def postorder(node):
    return [] if node is None else postorder(node.left) + postorder(node.right) + [node.value]

def level_order(root):
    order = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node is not None:
            order.append(node.value)
            queue.append(node.left)
            queue.append(node.right)
    return order

print("pre-order:  ", preorder(tree))
print("in-order:   ", inorder(tree))
print("post-order: ", postorder(tree))
print("level-order:", level_order(tree))
```

The three recursive functions are almost identical, and each one has the base case "an empty tree has no values". Every node is visited once, so each walk costs O(n).

## Binary search trees

A **binary search tree** (BST) adds one rule: for every node, **all values in its left subtree are smaller**, and all values in its right subtree are bigger. This is binary search turned into a data structure. To find a value, compare it with the node, and go left or right. You never look at the other branch, so you throw away about half of the tree at every step. To insert, find the empty place where the value would have been, and put a new node there:

```python run
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(root, value):
    if root is None:
        return TreeNode(value)
    if value < root.value:
        root.left = insert(root.left, value)
    elif value > root.value:
        root.right = insert(root.right, value)
    return root                              # an equal value is already there: ignore it

def contains(root, value):
    while root is not None:
        if value == root.value:
            return True
        root = root.left if value < root.value else root.right
    return False

def inorder(root):
    if root is None:
        return []
    return inorder(root.left) + [root.value] + inorder(root.right)

def height(root):
    if root is None:
        return 0
    return 1 + max(height(root.left), height(root.right))

root = None
for value in (50, 30, 70, 20, 40, 60, 80, 30):
    root = insert(root, value)

print(inorder(root))                         # in-order gives the values in sorted order
print(contains(root, 60), contains(root, 65), height(root))

import random
ordered = None
for value in range(1, 301):
    ordered = insert(ordered, value)
values = list(range(1, 301))
random.Random(1).shuffle(values)
shuffled = None
for value in values:
    shuffled = insert(shuffled, value)
print(height(ordered), height(shuffled))
```

Two facts stand out. First, an **in-order** walk of a BST gives the values in **sorted order**. Second, the cost of `contains` and `insert` is O(**height**), and the height depends on the **order of insertion**. The values 1 to 300 inserted in order build a tree that is a plain chain: its height is 300, and a search is as slow as in a list. The same values inserted in random order give a height of only 18. Real systems use **self-balancing** trees (such as AVL and red-black trees) that keep the height near log n by rearranging after each insertion. In everyday Python, dictionaries, sets and the `bisect` module cover most of these needs.

%% question q-inorder-choice | choice
Which walk of a binary search tree lists the values from the smallest to the biggest?
%% choice
Pre-order
%% choice correct
In-order
%% choice
Post-order
%% choice
Level-order
%% explain
In-order visits the left subtree (all the smaller values), then the node, then the right subtree (all the bigger values), so the values come out in sorted order. The other walks mix the levels in other ways.
%% end

## Graphs

A **graph** is a set of **nodes** (also called vertices) joined by **edges**. It is the most general structure of all. A road map is a graph where the cities are nodes and the roads are edges, a social network is a graph of people and friendships, and a game board is a graph of squares and moves. Edges can have a **direction** (a one-way street) and a **weight** (a distance). Trees and linked lists are simple kinds of graph.

The usual way to store a graph in Python is an **adjacency list**: a dictionary that maps each node to a list of its **neighbours**. Build it from a list of edges, adding each road in both directions:

```python run
from collections import deque

roads = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D"), ("D", "E"), ("F", "G")]
graph = {}
for a, b in roads:
    graph.setdefault(a, []).append(b)
    graph.setdefault(b, []).append(a)
print(graph)

def bfs_path(graph, start, goal):
    parent = {start: None}                   # how each node was first reached; also the "seen" set
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node == goal:
            path = []
            while node is not None:          # follow the parents back to the start
                path.append(node)
                node = parent[node]
            return path[::-1]
        for neighbour in graph[node]:
            if neighbour not in parent:
                parent[neighbour] = node
                queue.append(neighbour)
    return None                              # the queue ran empty: no route

print(bfs_path(graph, "A", "E"))
print(bfs_path(graph, "A", "G"))
print(bfs_path(graph, "B", "B"))
```

This is **breadth-first search** (BFS). It explores the graph in **rings**: first the start, then everything one road away, then everything two roads away, and so on. Because the queue serves the nodes in the order in which they were found, the first time that BFS reaches the goal is by a route with the **fewest roads**. That is why BFS finds the **shortest path in an unweighted graph**. Remembering where each node came from (`parent`) lets you rebuild the route, and it also stops the search from visiting a node twice, which would loop for ever on a graph with cycles. The cost is **O(V + E)**: every node and every edge is looked at once.

The other classic walk is **depth-first search** (DFS). It follows one road as far as it can, and only then backs up to try the next one. You can write it with recursion, or with an explicit **stack**. A stack where BFS has a queue is the **only** difference between the two methods. DFS is good for questions of connection, such as "how many separate groups are there?", and for backtracking:

```python run
from collections import deque

roads = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D"), ("D", "E"), ("F", "G")]
graph = {}
for a, b in roads:
    graph.setdefault(a, []).append(b)
    graph.setdefault(b, []).append(a)

def bfs_order(graph, start):
    seen = {start}
    order = []
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in seen:
                seen.add(neighbour)
                queue.append(neighbour)
    return order

def dfs_order(graph, start):
    seen = set()
    order = []

    def visit(node):
        seen.add(node)
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in seen:
                visit(neighbour)

    visit(start)
    return order

def components(graph):                         # how many separate groups of nodes?
    seen = set()
    count = 0
    for start in graph:
        if start not in seen:
            count += 1
            stack = [start]                    # an explicit stack: no recursion limit
            seen.add(start)
            while stack:
                node = stack.pop()
                for neighbour in graph[node]:
                    if neighbour not in seen:
                        seen.add(neighbour)
                        stack.append(neighbour)
    return count

print("breadth first:", bfs_order(graph, "A"))
print("depth first:  ", dfs_order(graph, "A"))
print("groups:", components(graph))
```

The two orders differ. Breadth first visits `A`, then both of its neighbours `B` and `C`, then `D`, and then `E`. Depth first goes from `A` to `B`, and straight on to `D` before it returns for `C`. The graph also falls into **two groups** (`A` to `E`, and `F` with `G`), which the last function counts.

%% question q-bfs-multi | multi
Select every statement that is **true**.
%% choice correct
Breadth-first search uses a queue
%% choice correct
Breadth-first search finds a route with the fewest roads in an unweighted graph
%% choice correct
Depth-first search can be written with a stack or with recursion
%% choice
Breadth-first search only works when the graph is sorted
%% choice
Dijkstra's algorithm works for roads with negative costs
%% explain
A queue makes breadth-first search visit the nodes in rings, which is why it finds the fewest roads. A stack (or the call stack, with recursion) makes the search depth first. A graph does not have to be sorted. And Dijkstra's algorithm assumes that every cost is zero or positive: a negative road could make an already finished node cheaper afterwards.
%% end

## Weighted graphs and Dijkstra's algorithm

When the roads have different lengths, the fewest roads is not the shortest route. A route of 2 long roads can be worse than a route of 5 short ones. **Dijkstra's algorithm** finds the **cheapest** route from one node to all the others. It works like BFS, but the queue is replaced by a **priority queue**: it always continues from the node with the **smallest total cost so far**. At that moment no other route can be cheaper, because every other route starts with something that already costs at least as much. The `heapq` module supplies the priority queue, as `(cost, node)` pairs:

```python run
import heapq

def dijkstra(graph, start):
    best = {start: 0}                            # the cheapest cost found so far
    heap = [(0, start)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost > best[node]:
            continue                             # a stale entry: a cheaper way was found since
        for neighbour, road in graph[node]:
            new_cost = cost + road
            if neighbour not in best or new_cost < best[neighbour]:
                best[neighbour] = new_cost
                heapq.heappush(heap, (new_cost, neighbour))
    return best

roads = {
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1)],
    "C": [("B", 2), ("D", 5)],
    "D": [("E", 3)],
    "E": [],
}
print(dijkstra(roads, "A"))
print(sorted(dijkstra(roads, "D").items()))
```

Follow the answer for `B`. The direct road costs 4, but the program first finds the road through `C` that costs 1 + 2 = 3, and replaces the older number. The heap still holds the old entry `(4, "B")`. When that entry comes out, `cost > best[node]` says that it is stale, and the loop skips it. With a heap, the time is **O((V + E) log V)**. A graph of 30,000 nodes and 90,000 roads takes only a fraction of a second.

This table sums up the structures of the lesson. In every case the right choice is made by asking which **operations** your program needs:

| Structure | Rule | Python tool | Main costs |
|---|---|---|---|
| stack | last in, first out | a list with append and pop | push and pop O(1) |
| queue | first in, first out | collections.deque | append and popleft O(1) |
| priority queue | smallest first | heapq on a list | push and pop O(log n) |
| linked list | each node links to the next | your own Node class | add at the front O(1), find O(n) |
| binary search tree | smaller left, bigger right | your own TreeNode class | search O(height), O(log n) if balanced |
| graph | nodes and edges | a dictionary of lists | BFS and DFS O(V + E) |

%% tip Use the standard library first
Python already has most of these ready made: lists as stacks, `deque` for queues, `heapq` for priority queues, dictionaries and sets instead of balanced trees, and `bisect` for sorted lists. Write your own node classes when you need to learn how they work, or when the problem needs a shape that the library does not have, such as a graph.
%% end

## Your turn

%% exercise postfix | Postfix calculator
In **postfix** notation the operator comes **after** its numbers: `"3 4 + 2 *"` means (3 + 4) * 2, which is 14. Write `evaluate(expression)` that calculates a postfix expression, with the numbers and the operators separated by spaces. Use a **stack**. A number goes onto the stack. An operator takes the **two** numbers on the top of the stack, and the result goes back on the stack. The operators are `+`, `-`, `*` and `/`. Careful with the order: for `"2 5 -"` the left number is 2, so the answer is -3. Do not use `eval`. The program below must print:

```output
14
-3
2.5
42
```
%% starter
def evaluate(expression):
    # Read the tokens from left to right. Numbers go on a stack; an operator pops two numbers.
    pass

print(evaluate("3 4 + 2 *"))
print(evaluate("2 5 -"))
print(evaluate("5 2 /"))
print(evaluate("42"))
%% solution
def evaluate(expression):
    stack = []
    for token in expression.split():
        if token in ("+", "-", "*", "/"):
            right = stack.pop()
            left = stack.pop()
            if token == "+":
                stack.append(left + right)
            elif token == "-":
                stack.append(left - right)
            elif token == "*":
                stack.append(left * right)
            else:
                stack.append(left / right)
        else:
            stack.append(int(token))
    return stack.pop()

print(evaluate("3 4 + 2 *"))
print(evaluate("2 5 -"))
print(evaluate("5 2 /"))
print(evaluate("42"))
%% tests
expect_output("14\n-3\n2.5\n42")
expect(evaluate("1 2 3 * +"), 7)
expect(evaluate("10 2 8 * + 3 -"), 23)
expect(evaluate("8 2 /"), 4)
expect(evaluate("2 -3 *"), -6)
expect(evaluate("100"), 100)
expect(evaluate("1" + " 1 +" * 20000), 20001, "a long expression is evaluated quickly")
check(not calls("eval"), "do not use eval: use a stack")
%% hint
Go through `expression.split()`. Every token is either a number or one of the four operators.
%% hint
For a number, push `int(token)`. For an operator, first `right = stack.pop()` and then `left = stack.pop()`. The order matters for `-` and `/`, because the number that was pushed first is the left one.
%% hint
Push the result of `left + right` (or `-`, `*`, `/`) back on the stack. When all the tokens are used, the stack holds exactly one number: return it.
%% end

%% exercise shortest-path | Fewest roads
Write `shortest_path(graph, start, goal)` for a graph that is a dictionary mapping each node to the list of its neighbours. Return the route as a **list of nodes** from `start` to `goal` that uses the **fewest roads**, or `None` when there is no route. When `start` is the goal, the route is `[start]`. Use **breadth-first search**: a `deque` of nodes to visit, and a dictionary `parent` that remembers how each node was reached. The tests include a grid of 22,500 squares. The program below must print:

```output
3
None
['B']
```
%% starter
from collections import deque

def shortest_path(graph, start, goal):
    # BFS with a queue and a dictionary `parent` that remembers how each node was reached.
    pass

graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C", "E"],
    "E": ["D"],
    "F": ["G"],
    "G": ["F"],
}
print(len(shortest_path(graph, "A", "E")) - 1)
print(shortest_path(graph, "A", "G"))
print(shortest_path(graph, "B", "B"))
%% solution
from collections import deque

def shortest_path(graph, start, goal):
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

graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C", "E"],
    "E": ["D"],
    "F": ["G"],
    "G": ["F"],
}
print(len(shortest_path(graph, "A", "E")) - 1)
print(shortest_path(graph, "A", "G"))
print(shortest_path(graph, "B", "B"))
%% tests
expect_output("3\nNone\n['B']")
def valid(network, path, start, goal):
    return path[0] == start and path[-1] == goal and all(b in network[a] for a, b in zip(path, path[1:]))
def distance(network, start, goal):
    frontier = {start}
    seen = {start}
    steps = 0
    while frontier:
        if goal in frontier:
            return steps
        frontier = {n for node in frontier for n in network[node] if n not in seen}
        seen |= frontier
        steps += 1
    return None
import random
rng = random.Random(2)
nodes = list(range(60))
mesh = {n: [] for n in nodes}
for _ in range(90):
    a, b = rng.sample(nodes, 2)
    if b not in mesh[a]:
        mesh[a].append(b)
        mesh[b].append(a)
bad = []
for _ in range(40):
    a, b = rng.sample(nodes, 2)
    path = shortest_path(mesh, a, b)
    want = distance(mesh, a, b)
    if want is None:
        good = path is None
    else:
        good = path is not None and valid(mesh, path, a, b) and len(path) - 1 == want
    if not good:
        bad.append((a, b))
check(not bad, "finds a shortest route on 40 random pairs of nodes", "wrong for the pairs " + str(bad[:3]))
side = 150
grid = {}
for row in range(side):
    for column in range(side):
        near = []
        if row > 0:
            near.append((row - 1, column))
        if row < side - 1:
            near.append((row + 1, column))
        if column > 0:
            near.append((row, column - 1))
        if column < side - 1:
            near.append((row, column + 1))
        grid[(row, column)] = near
far = shortest_path(grid, (0, 0), (side - 1, side - 1))
check(far is not None and valid(grid, far, (0, 0), (side - 1, side - 1)) and len(far) - 1 == 2 * (side - 1), "a grid of 22 500 squares: the shortest route has 298 roads")
%% hint
Use a `deque` of nodes that still have to be visited, and a dictionary `parent` with `parent[start] = None`. A node is "seen" when it is a key of `parent`.
%% hint
Take a node from the left of the queue. When it is the goal, follow `parent` back to the start, collecting the nodes, and reverse the list. Otherwise, for each neighbour that is not in `parent`, set `parent[neighbour] = node` and add the neighbour to the queue.
%% hint
The queue serves the nodes in the order in which they were found, so the first time that you reach the goal is by a shortest route. When the queue runs empty without reaching the goal, return `None`.
%% end

%% exercise bst | A binary search tree
A **binary search tree** keeps the smaller values on the left of every node, and the bigger values on the right. The class `TreeNode` is given. Write three functions. `insert(root, value)` adds the value to the tree below `root` and returns the root (an empty tree is `None`); a value that is already in the tree is ignored. `contains(root, value)` says whether the value is in the tree, by walking down **one branch** only. `inorder(root)` returns a list of all the values, from the smallest to the biggest. The program below must print:

```output
[20, 30, 40, 50, 60, 70, 80]
True False
30 70
```
%% starter
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(root, value):
    # Smaller values go left, bigger values go right. An empty spot (None) gets a new node.
    pass

def contains(root, value):
    pass

def inorder(root):
    pass

root = None
for number in (50, 30, 70, 20, 40, 60, 80, 30):
    root = insert(root, number)
print(inorder(root))
print(contains(root, 60), contains(root, 65))
print(root.left.value, root.right.value)
%% solution
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(root, value):
    if root is None:
        return TreeNode(value)
    if value < root.value:
        root.left = insert(root.left, value)
    elif value > root.value:
        root.right = insert(root.right, value)
    return root

def contains(root, value):
    while root is not None:
        if value == root.value:
            return True
        root = root.left if value < root.value else root.right
    return False

def inorder(root):
    if root is None:
        return []
    return inorder(root.left) + [root.value] + inorder(root.right)

root = None
for number in (50, 30, 70, 20, 40, 60, 80, 30):
    root = insert(root, number)
print(inorder(root))
print(contains(root, 60), contains(root, 65))
print(root.left.value, root.right.value)
%% tests
expect_output("[20, 30, 40, 50, 60, 70, 80]\nTrue False\n30 70")
expect(inorder(None), [])
expect(contains(None, 5), False)
small = None
for number in (2, 1, 3):
    small = insert(small, number)
expect([small.value, small.left.value, small.right.value], [2, 1, 3], "the first value is the root; smaller goes left, bigger goes right")
check(small.left.left is None and small.left.right is None and small.right.left is None and small.right.right is None, "a new node has no children")
import random
rng = random.Random(8)
numbers = [rng.randrange(1000) for _ in range(500)]
tree = None
for number in numbers:
    tree = insert(tree, number)
expect(inorder(tree), sorted(set(numbers)), "in-order gives the sorted values, without duplicates")
def ordered(node, low, high):
    if node is None:
        return True
    return low < node.value < high and ordered(node.left, low, node.value) and ordered(node.right, node.value, high)
check(ordered(tree, -1, 1000), "every value is on the correct side of all its ancestors")
expect([contains(tree, numbers[0]), contains(tree, -5), contains(tree, 1000)], [True, False, False])
class Counted:
    comparisons = 0
    def __init__(self, value):
        self.value = value
    def __lt__(self, other):
        Counted.comparisons += 1
        return self.value < other.value
    def __gt__(self, other):
        Counted.comparisons += 1
        return self.value > other.value
    def __eq__(self, other):
        Counted.comparisons += 1
        return self.value == other.value
values = rng.sample(range(100_000), 2000)
big = None
for value in values:
    big = insert(big, Counted(value))
queries = rng.sample(values, 100) + [rng.randrange(100_000, 200_000) for _ in range(20)]
Counted.comparisons = 0
answers = [contains(big, Counted(query)) for query in queries]
expect(answers, [True] * 100 + [False] * 20)
check(Counted.comparisons <= 120 * 80, "contains walks down one branch only", "your contains made " + str(Counted.comparisons) + " comparisons for 120 searches in a tree of 2000 values; walking down one branch needs about 3000")
%% hint
An empty spot (`None`) is where a new node belongs, so `insert` returns `TreeNode(value)` there. Otherwise compare `value` with `root.value`.
%% hint
In `insert`, go left for a smaller value and right for a bigger one, and store the result of the recursive call back: `root.left = insert(root.left, value)`. Return `root`. An equal value changes nothing.
%% hint
`contains` needs only one branch: at every node, go left or right, and stop when you find the value or reach `None`. For `inorder`, put the left subtree first, then the node's own value, then the right subtree: `inorder(root.left) + [root.value] + inorder(root.right)`.
%% end

%% exercise cheapest | Challenge: Cheapest routes
Write `cheapest(graph, start)`. The graph is a dictionary that maps each node to a list of `(neighbour, cost)` pairs, and every cost is positive. Return a dictionary with the **cheapest total cost** from `start` to every node that can be reached (the start itself costs 0). Nodes that cannot be reached are left out. Use a **priority queue** (`heapq`) of `(cost so far, node)` pairs, and always continue from the cheapest unfinished node: this is **Dijkstra's algorithm**. The tests include a graph with 30,000 nodes and about 90,000 roads. The program below must print:

```output
[('A', 0), ('B', 3), ('C', 1), ('D', 4), ('E', 7)]
[('D', 0), ('E', 3)]
```
%% starter
import heapq

def cheapest(graph, start):
    # best[node] = the cheapest cost found so far. A heap holds (cost, node) pairs.
    pass

roads = {
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1)],
    "C": [("B", 2), ("D", 5)],
    "D": [("E", 3)],
    "E": [],
}
print(sorted(cheapest(roads, "A").items()))
print(sorted(cheapest(roads, "D").items()))
%% solution
import heapq

def cheapest(graph, start):
    best = {start: 0}
    heap = [(0, start)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost > best[node]:
            continue
        for neighbour, road in graph[node]:
            new_cost = cost + road
            if neighbour not in best or new_cost < best[neighbour]:
                best[neighbour] = new_cost
                heapq.heappush(heap, (new_cost, neighbour))
    return best

roads = {
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1)],
    "C": [("B", 2), ("D", 5)],
    "D": [("E", 3)],
    "E": [],
}
print(sorted(cheapest(roads, "A").items()))
print(sorted(cheapest(roads, "D").items()))
%% tests
expect_output("[('A', 0), ('B', 3), ('C', 1), ('D', 4), ('E', 7)]\n[('D', 0), ('E', 3)]")
sample = {"A": [("B", 4), ("C", 1)], "B": [("D", 1)], "C": [("B", 2), ("D", 5)], "D": [("E", 3)], "E": [], "F": [("A", 1)]}
expect(cheapest(sample, "A"), {"A": 0, "B": 3, "C": 1, "D": 4, "E": 7}, "F cannot be reached from A, so it is left out")
expect(cheapest({"X": []}, "X"), {"X": 0})
check(calls("heappop"), "use a priority queue: heapq.heappop gives the cheapest unfinished node")
def bellman_ford(network, start):
    best = {start: 0}
    for _ in range(len(network)):
        changed = False
        for node in network:
            if node in best:
                for neighbour, cost in network[node]:
                    if neighbour not in best or best[node] + cost < best[neighbour]:
                        best[neighbour] = best[node] + cost
                        changed = True
        if not changed:
            break
    return best
import random
rng = random.Random(6)
bad = []
for _ in range(25):
    size = rng.randrange(2, 30)
    network = {n: [] for n in range(size)}
    for _ in range(rng.randrange(1, 3 * size)):
        network[rng.randrange(size)].append((rng.randrange(size), rng.randrange(1, 20)))
    if cheapest(network, 0) != bellman_ford(network, 0):
        bad.append(size)
check(not bad, "agrees with a slow, simple method on 25 random graphs", "wrong for graphs of these sizes: " + str(bad[:3]))
count = 30_000
chain = {i: [] for i in range(count)}
for i in range(count):
    if i + 1 < count:
        chain[i].append((i + 1, 2))
    if i + 2 < count:
        chain[i].append((i + 2, 3))
    if i + 3 < count:
        chain[i].append((i + 3, 10))
costs = cheapest(chain, 0)
check(len(costs) == count and all(costs[i] == 3 * (i // 2) + 2 * (i % 2) for i in range(count)), "a graph of 30 000 nodes is solved quickly")
%% hint
Keep a dictionary `best` with the cheapest cost found so far for each node, starting with `{start: 0}`, and a heap that starts as `[(0, start)]`.
%% hint
Pop the smallest `(cost, node)` pair from the heap. When `cost` is bigger than `best[node]`, the pair is out of date, so skip it. Otherwise look at every `(neighbour, road)`: the new cost is `cost + road`. When it is better than what you know, store it in `best` and push `(new_cost, neighbour)`.
%% hint
Because heap entries are tuples, `heappop` always returns the smallest cost first. When the heap is empty, `best` holds the answer for every node that can be reached, and nodes that were never reached are not in it.
%% end

## What you learned

- Choose a data structure by the **operations** that your program needs. A **stack** is last in, first out (a list with `append` and `pop`), and a **queue** is first in, first out (a `deque` with `append` and `popleft`, because `list.pop(0)` is O(n)).
- A **heap** (`heapq`) is a list that always has the smallest item first: `heappush` and `heappop` are O(log n), and `heap[0]` is O(1). Use `(priority, item)` tuples for a priority queue, negative numbers for a max heap, and a heap of size k for the k biggest items of a stream.
- A **linked list** is a chain of nodes, each with a link to the next. It adds at the front in O(1) but needs O(n) to find an item. A `list` and a `deque` are better in everyday code, but the idea of nodes that point to nodes is behind trees and graphs.
- A **binary tree** has at most two children per node. Pre-order, in-order and post-order walks go deep first, and level-order uses a queue. In a **binary search tree** the smaller values are on the left, so an in-order walk gives sorted order, and search and insert cost O(height): O(log n) when the tree is balanced, and O(n) when it is a chain.
- A **graph** (nodes and edges) is stored as a dictionary of lists. **Breadth-first search** (a queue) explores in rings and finds the route with the fewest roads. **Depth-first search** (a stack or recursion) goes deep first and answers questions of connection. Both cost O(V + E).
- **Dijkstra's algorithm** finds the cheapest routes in a graph with positive costs: a heap always continues from the cheapest unfinished node, and stale heap entries are skipped. It costs O((V + E) log V).
- The standard library already has most of these tools, so write your own only to learn, or when the problem needs a special shape.
