---
title: Algorithm Gauntlet
engine: judge
---
The **Guild of Fast Code** guards the last gate of this course, and the guild has one rule: a program that gives the right answer **too slowly** is a wrong program. To pass the gauntlet you must beat eight trials. In each of them the judges feed your function a huge input (a million books, ten thousand parcels, a maze of twenty thousand rooms), and a slow method runs out of budget or out of time while a good one finishes at once. Bring the tools of this module: dictionaries and sets, binary search, merge sort, tables of answers, stacks, queues and heaps.

How to play:

- Press **Run**. The result panel lists every test. A red test shows what was expected and what your code gave, or the error that stopped it, together with the line of your code.
- Trials one to five have a **budget**. The judge counts how many items your code reads, how many comparisons it makes or how many function calls it needs, and it stops a program that goes over the budget with a message that says which. Trials six to eight use the **clock**: a run that takes longer than the time limit is stopped. Count steps, not seconds, and ask how the work grows when the input grows.
- Some tests are **hidden**. They check edge cases and other big inputs, so do not only fit the visible examples.
- Every order has a **par**: the number of code lines of a clean solution. Reach it for three stars. Blank lines and comments do not count. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Matching pair
Customs has a truck full of parcels and one strict rule: two parcels may travel together only if their weights add up to **exactly** the target weight. Write `find_pair(weights, target)`. It returns the positions `(i, j)` of two **different** parcels, with `i < j`, whose weights add up to `target`. When there is no such pair, it returns `None`. When there are several pairs, any one of them is accepted.

```text
find_pair([4, 9, 2, 7], 11) returns (0, 3) or (1, 2)
find_pair([4, 9, 2, 7], 100) returns None
```

A full truck holds **50,000** parcels. Trying every pair is far too slow, so the judge counts how many times your code reads the list and stops a program that reads it more than 30 times for each parcel. Walk through the list **once**, and **remember** what you have seen.
%% config
mode: script
function: find_pair
par: 7
timeout: 6
%% prelude
class TooSlow(Exception):
    """The program used more of its budget than a fast method needs."""

class Reads(list):
    """A list that counts how many of its items the program reads, and stops a program that reads too many."""

    def __init__(self, items, limit, message):
        super().__init__(items)
        self.limit = limit
        self.message = message
        self.used = 0

    def reset(self):
        self.used = 0

    def _spend(self, n=1):
        self.used += n
        if self.used > self.limit:
            raise TooSlow(self.message)

    def __getitem__(self, i):
        if isinstance(i, slice):
            part = list.__getitem__(self, i)
            self._spend(len(part))
            return part
        self.used += 1
        if self.used > self.limit:
            raise TooSlow(self.message)
        return list.__getitem__(self, i)

    def __iter__(self):
        for item in list.__iter__(self):
            self.used += 1
            if self.used > self.limit:
                raise TooSlow(self.message)
            yield item

    def __reversed__(self):
        for item in list.__reversed__(self):
            self._spend()
            yield item

    def __contains__(self, value):
        try:
            self._spend(list.index(self, value) + 1)
        except ValueError:
            self._spend(len(self))
            return False
        return True

    def index(self, value, *where):
        try:
            position = list.index(self, value, *where)
        except ValueError:
            self._spend(len(self))
            raise
        self._spend(position + 1)
        return position

    def count(self, value):
        self._spend(len(self))
        return list.count(self, value)

    def copy(self):
        self._spend(len(self))
        return list(list.__iter__(self))

def full_truck(n=50_000):
    weights = [3 * ((i * 7919) % 50021) for i in range(n)]
    weights[n - 3] = 120_000_001
    weights[n - 1] = 150_000_001
    return weights

FULL_TARGET = 270_000_002

def valid_pair(weights, target, answer):
    if not isinstance(answer, (tuple, list)) or len(answer) != 2:
        return False
    i, j = answer
    if not (isinstance(i, int) and isinstance(j, int)):
        return False
    if not 0 <= i < j < len(weights):
        return False
    return list.__getitem__(weights, i) + list.__getitem__(weights, j) == target
%% test Small trucks
for weights, target in (([4, 9, 2, 7], 11), ([3, 3], 6), ([-5, 10, 5], 0), ([1, 8, 5, 6, 2], 14)):
    got = find_pair(weights, target)
    check(valid_pair(weights, target, got), "find_pair(%s, %d) gave %r, but the answer must be positions (i, j) with i < j whose weights add up to %d" % (weights, target, got, target))
%% test No pair
expect(find_pair([4, 9, 2, 7], 100), None, "no two parcels weigh 100 together")
expect(find_pair([5, 1], 10), None, "a parcel cannot be paired with itself")
%% test A full truck (50,000 parcels)
weights = full_truck()
big = Reads(weights, 30 * len(weights), "The program read the list more than 30 times for each parcel. Comparing every parcel with every other one is too slow for 50,000 parcels. Look at each parcel once and remember what you have seen.")
got = find_pair(big, FULL_TARGET)
check(valid_pair(weights, FULL_TARGET, got), "the truck holds a pair that weighs %d together, but the program gave %r" % (FULL_TARGET, got))
%% test hidden No pair in a full truck
weights = full_truck()
big = Reads(weights, 30 * len(weights), "The program read the list too many times.")
expect(find_pair(big, 1), None)
%% test hidden Tiny and odd trucks
expect(find_pair([], 5), None)
expect(find_pair([5], 5), None)
for weights, target in (([6, 1, 6], 12), ([-3, 8, 12, -9], 3), ([0, 0], 0)):
    got = find_pair(weights, target)
    check(valid_pair(weights, target, got), "a pair exists")
%% starter
def find_pair(weights, target):
    # Return (i, j) with i < j and weights[i] + weights[j] == target, or None.
    pass

%% solution
def find_pair(weights, target):
    seen = {}
    for i, weight in enumerate(weights):
        if target - weight in seen:
            return seen[target - weight], i
        seen[weight] = i
    return None
%% hint
Trying every pair is far too slow. Walk through the list **once**, and for each parcel ask a question: have I already passed the partner that completes the pair?
%% hint
The partner of a parcel that weighs `w` weighs `target - w`. Keep a dictionary `seen` that maps each weight you have passed to its position. A dictionary answers `partner in seen` in one step, however big it is.
%% hint
Use `for i, weight in enumerate(weights):`. If `target - weight` is in `seen`, return `seen[target - weight], i`. Otherwise store `seen[weight] = i`. After the loop, return `None`.
%% end

%% level l2 | Find the book
The **Great Library** keeps the catalogue numbers of its books in one long list, in increasing order, and no number appears twice. Write `find_book(shelf, number)`. It returns the position of `number` in the list `shelf`, or `-1` when the number is not on the shelf.

```text
find_book([3, 8, 15, 21, 40], 15) returns 2
find_book([3, 8, 15, 21, 40], 9) returns -1
```

The real shelf holds **1,000,000** numbers. The judge counts how many entries your code reads, and a search that reads more than 60 of them has run out of budget. Looking at the books one by one will not do: use the **order** of the shelf.
%% config
mode: script
function: find_book
par: 11
timeout: 6
%% prelude
class TooSlow(Exception):
    """The program used more of its budget than a fast method needs."""

class Reads(list):
    """A list that counts how many of its items the program reads, and stops a program that reads too many."""

    def __init__(self, items, limit, message):
        super().__init__(items)
        self.limit = limit
        self.message = message
        self.used = 0

    def reset(self):
        self.used = 0

    def _spend(self, n=1):
        self.used += n
        if self.used > self.limit:
            raise TooSlow(self.message)

    def __getitem__(self, i):
        if isinstance(i, slice):
            part = list.__getitem__(self, i)
            self._spend(len(part))
            return part
        self.used += 1
        if self.used > self.limit:
            raise TooSlow(self.message)
        return list.__getitem__(self, i)

    def __iter__(self):
        for item in list.__iter__(self):
            self.used += 1
            if self.used > self.limit:
                raise TooSlow(self.message)
            yield item

    def __reversed__(self):
        for item in list.__reversed__(self):
            self._spend()
            yield item

    def __contains__(self, value):
        try:
            self._spend(list.index(self, value) + 1)
        except ValueError:
            self._spend(len(self))
            return False
        return True

    def index(self, value, *where):
        try:
            position = list.index(self, value, *where)
        except ValueError:
            self._spend(len(self))
            raise
        self._spend(position + 1)
        return position

    def count(self, value):
        self._spend(len(self))
        return list.count(self, value)

    def copy(self):
        self._spend(len(self))
        return list(list.__iter__(self))
%% test Small shelves
shelf = [3, 8, 15, 21, 40]
expect(find_book(shelf, 15), 2, "15 sits at position 2")
expect(find_book(shelf, 3), 0, "the first book")
expect(find_book(shelf, 40), 4, "the last book")
expect(find_book(shelf, 9), -1, "9 is not on the shelf")
%% test Beyond the ends
expect(find_book([10, 20, 30], 5), -1, "smaller than every number")
expect(find_book([10, 20, 30], 99), -1, "bigger than every number")
%% test A million books
shelf = Reads(range(0, 2_000_000, 2), 60, "One search read more than 60 entries of the shelf. Halving the shelf at each look needs about 20 reads for a million books.")
for number in (0, 1_999_998, 1_000_000, 777_778, 1, 1_999_999, 424_242):
    shelf.reset()
    expect(find_book(shelf, number), number // 2 if number % 2 == 0 else -1, "searching for %d" % number)
%% test hidden One book and no books
expect(find_book([7], 7), 0)
expect(find_book([7], 3), -1)
expect(find_book([], 5), -1)
%% test hidden Hundreds of searches
shelf = Reads(range(0, 2_000_000, 2), 60, "One search read too many entries.")
x = 12345
for _ in range(300):
    x = (x * 1103515245 + 12345) % 2147483648
    number = x % 2_000_001
    shelf.reset()
    expect(find_book(shelf, number), number // 2 if number % 2 == 0 else -1, "searching for %d" % number)
%% starter
def find_book(shelf, number):
    # Return the position of number in the sorted list shelf, or -1.
    pass

%% solution
def find_book(shelf, number):
    low, high = 0, len(shelf) - 1
    while low <= high:
        middle = (low + high) // 2
        if shelf[middle] == number:
            return middle
        if shelf[middle] < number:
            low = middle + 1
        else:
            high = middle - 1
    return -1
%% hint
The shelf is **sorted**. Look at the book in the middle: if its number is too small, everything before it is too small as well, so half of the shelf is gone after one look.
%% hint
Keep two positions, `low` and `high`, that mark the part of the shelf that is still possible. The middle is `(low + high) // 2`. If the middle number is too small, move `low` to `middle + 1`. If it is too big, move `high` to `middle - 1`.
%% hint
Loop `while low <= high:`. Return `middle` when the number matches, and return `-1` when the loop ends without a match. The function `bisect_left` of the `bisect` module also does the halving, but you must still check that the entry it points to is the right one.
%% end

%% level l3 | Sort the parcels
The sorting belt of **Parcel Depot** has broken down. Write `sort_parcels(weights)`, which returns a **new list** with the same weights, from the lightest to the heaviest. The original list must stay as it was. You may not call `sorted()`, `.sort()` or `insort()`: the depot wants your own method.

```text
sort_parcels([5, 2, 9, 1]) returns [1, 2, 5, 9]
sort_parcels([3, 3, 1]) returns [1, 3, 3]
```

A busy day brings **10,000** parcels. The judge counts every **comparison** your code makes and allows 800,000 of them. A fast method needs about 120,000, but a method that compares each parcel with many others needs tens of millions. Think about how merge sort splits the work.
%% config
mode: script
function: sort_parcels
par: 16
timeout: 6
forbid: sorted sort insort
forbid_note: This order asks for your own sorting method. Do not call sorted(), .sort() or insort().
%% prelude
class TooSlow(Exception):
    """The program used more of its budget than a fast method needs."""
import operator

class Weight:
    """A parcel weight that counts every comparison made with it."""
    used = 0
    limit = 0
    message = ""

    def __init__(self, n):
        self.n = n

    def __repr__(self):
        return "Weight(%r)" % (self.n,)

def _comparison(op):
    def compare(self, other):
        Weight.used += 1
        if Weight.used > Weight.limit:
            raise TooSlow(Weight.message)
        return op(self.n, other.n)
    return compare

for _name, _op in (("__lt__", operator.lt), ("__le__", operator.le), ("__gt__", operator.gt), ("__ge__", operator.ge), ("__eq__", operator.eq), ("__ne__", operator.ne)):
    setattr(Weight, _name, _comparison(_op))

def run_sort(sort_function, values, budget=800_000):
    """Give the learner's function a list of Weight objects. Returns the numbers in the order it returned them."""
    Weight.used = 0
    Weight.limit = budget
    Weight.message = "The sort made more than {:,} comparisons for {:,} parcels. A fast method needs about 120,000. Comparing each parcel with many others is too slow: split the list in halves and merge the sorted halves.".format(budget, len(values))
    try:
        result = sort_function([Weight(v) for v in values])
    except RecursionError:
        raise TooSlow("The sort went more than 1,000 levels deep and Python stopped it. A good split halves the list at every level, so about 14 levels are enough for 10,000 parcels.")
    if not isinstance(result, list):
        return result
    return [w.n for w in result]
%% test Small belts
expect(sort_parcels([5, 2, 9, 1]), [1, 2, 5, 9])
expect(sort_parcels([3, 3, 1, 2, 1]), [1, 1, 2, 3, 3], "equal weights stay in the list")
expect(sort_parcels([1]), [1], "one parcel")
%% test A busy day (10,000 parcels)
values = [(i * 7919) % 10007 for i in range(10_000)]
got = run_sort(sort_parcels, values)
check(isinstance(got, list), "sort_parcels must return a list, but it returned %r" % (got,))
expect(got, sorted(values), "the 10,000 weights in order")
%% test Already in order, and backwards
values = list(range(10_000))
got = run_sort(sort_parcels, values)
check(isinstance(got, list), "sort_parcels must return a list, but it returned %r" % (got,))
expect(got, values, "parcels that are already in order")
got = run_sort(sort_parcels, values[::-1])
check(isinstance(got, list), "sort_parcels must return a list, but it returned %r" % (got,))
expect(got, values, "parcels that arrive backwards")
%% test hidden Empty, negative and decimal weights
expect(sort_parcels([]), [])
expect(sort_parcels([2.5, -1, 0, -7.25]), [-7.25, -1, 0, 2.5])
%% test hidden Many equal weights
values = [((i * 7919) % 10007) % 500 for i in range(10_000)]
got = run_sort(sort_parcels, values)
check(isinstance(got, list), "a list must come back")
expect(got, sorted(values))
%% test hidden The original list is kept
original = [4, 1, 3]
result = sort_parcels(original)
expect(original, [4, 1, 3], "the original list must stay as it was")
expect(result, [1, 3, 4])
%% starter
def sort_parcels(weights):
    # Return a new list with the weights from lightest to heaviest.
    # Do not use sorted(), .sort() or insort(): sort with your own method.
    pass

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
    return merged + left[i:] + right[j:]

def sort_parcels(weights):
    if len(weights) <= 1:
        return list(weights)
    middle = len(weights) // 2
    return merge(sort_parcels(weights[:middle]), sort_parcels(weights[middle:]))
%% hint
Sorting by comparing every parcel with many others needs tens of millions of comparisons. **Merge sort** needs about 120,000: split the list in two halves, sort each half, and **merge** the two sorted halves into one.
%% hint
To merge two sorted lists, keep a position `i` in the left list and a position `j` in the right list. Compare `left[i]` with `right[j]`, append the smaller one to a new list and move that position forward. Use `<=`, so that equal weights keep their order.
%% hint
When one half is used up, the rest of the other half is already in order: add it with `merged + left[i:] + right[j:]`. A list of 0 or 1 parcels is already sorted: return a copy of it with `list(weights)`. Otherwise split at `len(weights) // 2` and call your own function on both halves.
%% end

%% level l4 | The long staircase
The **Clock Tower** has a very long staircase. A climber takes **1, 2 or 3 steps** at a time. Write `ways(n)`, which returns the number of different ways to climb exactly `n` steps. Standing at the bottom already counts as one way to climb 0 steps.

```text
ways(3) returns 4     (1+1+1, 1+2, 2+1 and 3)
ways(4) returns 7
```

The real tower has **3,000** steps, and the answer has hundreds of digits. A function that calls itself for the smaller staircases repeats the same work again and again, and 3,000 levels of recursion are too deep for Python. The judge stops a program that makes more than 100,000 function calls.
%% config
mode: script
function: ways
par: 7
timeout: 6
%% prelude
class TooSlow(Exception):
    """The program used more of its budget than a fast method needs."""
import sys

class calls_limit:
    """Use in a with statement: stops the program with TooSlow after `limit` Python function calls."""

    def __init__(self, limit, message):
        self.limit = limit
        self.message = message
        self.used = 0

    def _watch(self, frame, event, arg):
        if event == "call":
            self.used += 1
            if self.used > self.limit:
                sys.setprofile(None)
                raise TooSlow(self.message)

    def __enter__(self):
        self.used = 0
        sys.setprofile(self._watch)
        return self

    def __exit__(self, kind, error, trace):
        sys.setprofile(None)
        return False

def reference_ways(n):
    table = [1] + [0] * n
    for step in range(1, n + 1):
        table[step] = table[step - 1] + (table[step - 2] if step >= 2 else 0) + (table[step - 3] if step >= 3 else 0)
    return table[n]
%% test Small staircases
for steps, answer in ((0, 1), (1, 1), (2, 2), (3, 4), (4, 7), (10, 274)):
    expect(ways(steps), answer, "a staircase of %d steps" % steps)
%% test Thirty steps
with calls_limit(100_000, "The function made more than 100,000 calls for a staircase of 30 steps. It repeats the same sub-problems again and again: remember the answers, or fill a table from the bottom up."):
    got = ways(30)
expect(got, 53_798_080, "a staircase of 30 steps")
%% test The Clock Tower (3,000 steps)
try:
    with calls_limit(100_000, "The function made more than 100,000 calls. Fill a table with a loop instead."):
        got = ways(3000)
except RecursionError:
    check(False, "The function called itself more than 1,000 levels deep, and Python stopped it. Fill a table with a loop instead of calling the function from inside itself.")
expect(got, reference_ways(3000), "a staircase of 3,000 steps")
%% test hidden Mid-sized staircases
for steps in (12, 25, 100, 1500):
    with calls_limit(100_000, "too many calls"):
        got = ways(steps)
    expect(got, reference_ways(steps), "a staircase of %d steps" % steps)
%% starter
def ways(n):
    # Return the number of ways to climb n steps, taking 1, 2 or 3 steps at a time.
    pass

%% solution
def ways(n):
    table = [1] + [0] * n
    for step in range(1, n + 1):
        for jump in (1, 2, 3):
            if jump <= step:
                table[step] += table[step - jump]
    return table[n]
%% hint
To stand on step `n`, the last move of the climber was 1, 2 or 3 steps. So `ways(n)` is `ways(n - 1) + ways(n - 2) + ways(n - 3)`. Check it on the example: `ways(4)` is `4 + 2 + 1`, which is 7.
%% hint
Plain recursion repeats the same sub-problems billions of times, and 3,000 levels is too deep anyway. Fill a **table** from the bottom instead: `table[0] = 1`, and then work out `table[1]`, `table[2]` and so on with a loop.
%% hint
Start with `table = [1] + [0] * n`. For each `step` in `range(1, n + 1)`, add `table[step - jump]` for every `jump` in `(1, 2, 3)` that is not bigger than `step`. Return `table[n]`.
%% end

%% level l5 | Change for the till
At the **Old Mint** the cashier wants to know in how many different ways she can pay an amount with the coins of her drawer. Write `count_change(coins, amount)`, which returns the number of different **combinations** of coins, with any number of each coin, that add up to `amount`. The order does not matter: 1 + 2 and 2 + 1 are the same combination.

```text
count_change([1, 2], 3) returns 2     (1+1+1 and 1+2)
count_change([2], 3) returns 0
count_change([5], 0) returns 1        (paying nothing is one way)
```

The real tills pay amounts up to **10,000**. The judge stops a program that makes more than 200,000 function calls, and recursion that deep would not fit in Python anyway. Fill in a table of answers instead.
%% config
mode: script
function: count_change
par: 6
timeout: 6
%% prelude
class TooSlow(Exception):
    """The program used more of its budget than a fast method needs."""
import sys

class calls_limit:
    """Use in a with statement: stops the program with TooSlow after `limit` Python function calls."""

    def __init__(self, limit, message):
        self.limit = limit
        self.message = message
        self.used = 0

    def _watch(self, frame, event, arg):
        if event == "call":
            self.used += 1
            if self.used > self.limit:
                sys.setprofile(None)
                raise TooSlow(self.message)

    def __enter__(self):
        self.used = 0
        sys.setprofile(self._watch)
        return self

    def __exit__(self, kind, error, trace):
        sys.setprofile(None)
        return False

def reference_change(coins, amount):
    ways = [1] + [0] * amount
    for coin in coins:
        for total in range(coin, amount + 1):
            ways[total] += ways[total - coin]
    return ways[amount]
%% test Small tills
expect(count_change([1, 2], 3), 2, "1+1+1 and 1+2")
expect(count_change([2], 3), 0, "2 cannot make 3")
expect(count_change([5], 0), 1, "paying nothing is one way")
expect(count_change([1, 2, 5], 5), 4, "5, 2+2+1, 2+1+1+1 and 1+1+1+1+1")
%% test The order does not matter
expect(count_change([1, 2], 4), 3, "1+1+1+1, 1+1+2 and 2+2")
expect(count_change([1, 2, 3], 4), 4, "1+1+1+1, 1+1+2, 2+2 and 1+3")
%% test A real till (200)
with calls_limit(200_000, "The function made more than 200,000 calls for the amount 200. It repeats the same sub-problems: fill a table with a loop instead."):
    got = count_change([1, 2, 5, 10, 20, 50, 100, 200], 200)
expect(got, 73_682, "the coins of the Old Mint, amount 200")
%% test A big till (10,000)
coins = [1, 2, 5, 10, 20, 50, 100, 200]
try:
    with calls_limit(200_000, "The function made more than 200,000 calls. Fill a table with a loop instead."):
        got = count_change(coins, 10_000)
except RecursionError:
    check(False, "The function called itself more than 1,000 levels deep, and Python stopped it. Fill a table with a loop instead of calling the function from inside itself.")
expect(got, reference_change(coins, 10_000), "the same coins, amount 10,000")
%% test hidden No coins and big coins
expect(count_change([], 7), 0)
expect(count_change([], 0), 1)
expect(count_change([10, 25], 7), 0)
%% test hidden Odd coins
coins = [3, 7, 11, 13, 17]
with calls_limit(200_000, "too many calls"):
    got = count_change(coins, 5000)
expect(got, reference_change(coins, 5000))
%% starter
def count_change(coins, amount):
    # Return how many different combinations of coins add up to amount.
    pass

%% solution
def count_change(coins, amount):
    ways = [1] + [0] * amount
    for coin in coins:
        for total in range(coin, amount + 1):
            ways[total] += ways[total - coin]
    return ways[amount]
%% hint
Build up from small amounts. Let `ways[t]` be the number of combinations that make the amount `t`. There is exactly one way to make 0: use no coins. So start with `ways = [1] + [0] * amount`.
%% hint
Take the coins **one at a time**. When a coin `c` becomes available, every amount `t >= c` gains the combinations that end with that coin: `ways[t] += ways[t - c]`. Go through the amounts in increasing order, so that a coin can be used again and again.
%% hint
The loops are `for coin in coins:` on the outside and `for total in range(coin, amount + 1):` on the inside. If you put the amounts on the outside, you count the same coins in different orders, and `count_change([1, 2], 3)` gives 3 instead of 2. Return `ways[amount]`.
%% end

%% level l6 | Balanced brackets
The **Typewriter Guild** checks every text before it goes to print. Write `balanced(text)`, which returns `True` when every bracket `(`, `[` and `{` in the text is closed by the **matching** bracket, in the right order, and `False` otherwise. All the other characters are ignored.

```text
balanced("(a[b]{c})") returns True
balanced("(]") returns False
balanced("((") returns False
```

The longest texts of the guild hold **a million** characters, with brackets nested deeply. Deleting pairs such as `()` from the text again and again rewrites the whole text on every round, and that runs out of time. One walk through the text with the right data structure is enough. This trial uses the **clock**: a run that takes longer than 6 seconds is stopped.
%% config
mode: script
function: balanced
par: 10
timeout: 6
%% test Matching pairs
for text in ("", "()", "(a[b]{c})", "{[()()]}", "no brackets at all", "[(x + 1) * 2]"):
    expect(balanced(text), True, "the text %r is balanced" % text)
%% test Wrong order and leftovers
for text in ("(]", "((", "))", "([)]", ")(", "{[}]", "(()", "())"):
    expect(balanced(text), False, "the text %r is not balanced" % text)
%% test A million characters
deep = "(" * 500_000 + ")" * 500_000
expect(balanced(deep), True, "half a million brackets open, then half a million close")
mixed = "([{" * 170_000 + "}])" * 170_000
expect(balanced(mixed), True, "three kinds of brackets, nested")
expect(balanced(deep + "]"), False, "one closing bracket too many at the end")
%% test hidden A mistake deep inside
text = "(" * 300_000 + "]" + ")" * 300_000
expect(balanced(text), False)
text = "[" * 400_000 + "a" + "]" * 400_000
expect(balanced(text), True)
expect(balanced("(" * 400_000), False)
%% test hidden Other characters
expect(balanced("a(b)c"), True)
expect(balanced("x]"), False)
expect(balanced("{ [ ( ) ] } ( )"), True)
%% starter
def balanced(text):
    # Return True when every bracket is closed by the matching bracket, in order.
    pass

%% solution
def balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack
%% hint
Read the text from left to right. An opening bracket has to wait until its partner arrives, and the **last** bracket that was opened must be closed **first**. That is the rule of a **stack**: last in, first out.
%% hint
Use a list as the stack. When you meet `(`, `[` or `{`, use `append`. When you meet a closing bracket, the top of the stack, which `pop()` returns, must be its partner. If the stack is empty or the partner is wrong, return `False`.
%% hint
A dictionary such as `pairs = {")": "(", "]": "[", "}": "{"}` gives the partner of each closing bracket. Ignore every other character. At the end, the text is balanced only when no bracket is left waiting: `return not stack`.
%% end

%% level l7 | Escape the maze
The prisoners of **Maze Castle** plan their escape on a map drawn as a list of text rows. `S` is the start, `E` is the exit, `#` is a wall and `.` is open floor. A prisoner moves one step up, down, left or right, never through a wall and never outside the map. Write `fewest_steps(maze)`, which returns the **smallest number of steps** from `S` to `E`, or `-1` when there is no way out.

```text
maze = ["S.#",
        "..#",
        "#.E"]
fewest_steps(maze) returns 4
```

The real maps have up to 22,500 rooms, and one of them is a corridor that winds back and forth for more than 5,000 steps. Going as deep as possible along one path does not find the shortest way, and recursion that deep does not fit in Python. Search in **waves**, one step further each time. This trial uses the **clock**: a run that takes longer than 6 seconds is stopped.
%% config
mode: script
function: fewest_steps
par: 18
timeout: 6
%% prelude
def open_maze(rows, cols):
    grid = [["."] * cols for _ in range(rows)]
    grid[0][0] = "S"
    grid[rows - 1][cols - 1] = "E"
    return ["".join(row) for row in grid]

def winding_maze(rows, cols):
    grid = [["."] * cols for _ in range(rows)]
    for r in range(1, rows, 2):
        for c in range(cols):
            grid[r][c] = "#"
        grid[r][cols - 1 if (r // 2) % 2 == 0 else 0] = "."
    last = rows // 2
    grid[0][0] = "S"
    grid[rows - 1][cols - 1 if last % 2 == 0 else 0] = "E"
    return ["".join(row) for row in grid]

def walled_maze(rows, cols):
    grid = [["."] * cols for _ in range(rows)]
    for r in range(rows):
        grid[r][cols // 2] = "#"
    grid[0][0] = "S"
    grid[rows - 1][cols - 1] = "E"
    return ["".join(row) for row in grid]

def scatter_maze(rows, cols, seed, walls=28):
    x = seed
    grid = []
    for r in range(rows):
        row = []
        for c in range(cols):
            x = (x * 1103515245 + 12345) % 2147483648
            row.append("#" if (x >> 16) % 100 < walls else ".")
        grid.append(row)
    grid[0][0] = "S"
    grid[rows - 1][cols - 1] = "E"
    return ["".join(row) for row in grid]
%% test A small maze
maze = ["S.#",
        "..#",
        "#.E"]
expect(fewest_steps(maze), 4)
maze = ["S...",
        ".##.",
        "...E"]
expect(fewest_steps(maze), 5)
%% test No way out
expect(fewest_steps(["S#E"]), -1, "a wall closes the only road")
maze = ["S.#E",
        "..#.",
        "..#."]
expect(fewest_steps(maze), -1, "a wall splits the map in two")
%% test A big open yard
try:
    got = fewest_steps(open_maze(150, 150))
except RecursionError:
    check(False, "The search went more than 1,000 levels deep, and Python stopped it. Do not follow a path by recursion: search in waves with a loop and a queue.")
expect(got, 298, "150 x 150 rooms with no walls")
%% test The winding corridor
try:
    got = fewest_steps(winding_maze(101, 101))
except RecursionError:
    check(False, "The search went more than 1,000 levels deep, and Python stopped it. Do not follow a path by recursion: search in waves with a loop and a queue.")
expect(got, 5200, "one corridor that winds back and forth")
%% test hidden Next to the exit
expect(fewest_steps(["SE"]), 1)
expect(fewest_steps(["S", "E"]), 1)
%% test hidden A big yard with a wall
expect(fewest_steps(walled_maze(150, 150)), -1)
%% test hidden Scattered walls
expect(fewest_steps(scatter_maze(120, 120, 41, 37)), 338)
expect(fewest_steps(scatter_maze(100, 140, 20, 38)), 328)
%% starter
from collections import deque

def fewest_steps(maze):
    rows, cols = len(maze), len(maze[0])
    # 1. Find the position of S.
    # 2. Search outwards from S, one step further each time, and remember the rooms you have seen.
    # 3. Return the number of steps when you reach E, or -1 when the search runs dry.
    pass

%% solution
from collections import deque

def fewest_steps(maze):
    rows, cols = len(maze), len(maze[0])
    for r in range(rows):
        for c in range(cols):
            if maze[r][c] == "S":
                start = (r, c)
    queue = deque([(start, 0)])
    seen = {start}
    while queue:
        (r, c), steps = queue.popleft()
        if maze[r][c] == "E":
            return steps
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] != "#" and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append(((nr, nc), steps + 1))
    return -1
%% hint
To find the **shortest** way, explore the maze in waves: first every room one step from `S`, then every room two steps away, and so on. The first time you reach `E`, you have used the fewest steps. A **queue** gives you that order.
%% hint
Put `(position, steps)` pairs in a `deque`. Take one from the left with `popleft()`, look at its four neighbours, and add each neighbour that is inside the map, is not a wall and has not been seen before. Keep the seen positions in a `set`, and add a position when you put it in the queue, not when you take it out.
%% hint
Find `S` with two `for` loops over the rows and the columns. The neighbours of `(r, c)` are `(r + 1, c)`, `(r - 1, c)`, `(r, c + 1)` and `(r, c - 1)`. When the queue is empty, there is no way out: return `-1`.
%% end

%% level l8 | The cheapest crossing
The last trial: the **Marsh of Costs**. A map gives, for every square, the price of stepping onto it, a whole number from 1 to 9. You start in the top-left square and must reach the bottom-right square, moving one step up, down, left or right. Write `cheapest_crossing(costs)`, which returns the **smallest total price** of a crossing. You do not pay for the square where you start, and you pay for every square you step onto, the last one included.

```text
costs = [[1, 9, 1, 1, 1],
         [1, 9, 1, 9, 1],
         [1, 1, 1, 9, 1]]
cheapest_crossing(costs) returns 10
```

The cheapest way here goes down, along the bottom, **back up** the middle column, along the top and down again, so a plan that only moves right and down is not enough. The real marsh has 200 x 200 squares, and a run that takes longer than 8 seconds is stopped. Trying every route is hopeless. Always continue from the cheapest unfinished square: that is a job for a **heap**.
%% config
mode: script
function: cheapest_crossing
par: 17
timeout: 8
%% prelude
def marsh(rows, cols, seed=2024):
    x = seed
    grid = []
    for r in range(rows):
        row = []
        for c in range(cols):
            x = (x * 1103515245 + 12345) % 2147483648
            row.append(1 + (x >> 16) % 9)
        grid.append(row)
    return grid
%% test A small marsh
costs = [[1, 9, 1, 1, 1],
         [1, 9, 1, 9, 1],
         [1, 1, 1, 9, 1]]
expect(cheapest_crossing(costs), 10, "the cheap way goes back up the middle")
expect(cheapest_crossing([[1, 2], [3, 1]]), 3)
%% test One square
expect(cheapest_crossing([[5]]), 0, "you are already there")
%% test The real marsh (200 x 200)
expect(cheapest_crossing(marsh(200, 200)), 1136, "the 200 x 200 marsh")
%% test hidden A long road
road = marsh(1, 50_000, 5)
expect(cheapest_crossing(road), sum(road[0][1:]), "one long road")
%% test hidden A bigger marsh
expect(cheapest_crossing(marsh(250, 250, 77)), 1439)
%% test hidden A tall thin marsh
expect(cheapest_crossing(marsh(300, 3, 11)), 1262)
%% starter
import heapq

def cheapest_crossing(costs):
    rows, cols = len(costs), len(costs[0])
    # Dijkstra: always continue from the cheapest unfinished square.
    pass

%% solution
import heapq

def cheapest_crossing(costs):
    rows, cols = len(costs), len(costs[0])
    best = {(0, 0): 0}
    heap = [(0, 0, 0)]
    while heap:
        total, r, c = heapq.heappop(heap)
        if (r, c) == (rows - 1, cols - 1):
            return total
        if total > best[(r, c)]:
            continue
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols:
                new_total = total + costs[nr][nc]
                if new_total < best.get((nr, nc), float("inf")):
                    best[(nr, nc)] = new_total
                    heapq.heappush(heap, (new_total, nr, nc))
%% hint
The squares have different prices, so a search that counts steps is not enough. **Dijkstra's algorithm** always continues from the unfinished square with the smallest total so far. A **heap** of `(total, row, col)` triples hands you that square quickly.
%% hint
Keep a dictionary `best` with the cheapest total found so far for each square. Add entries with `heapq.heappush` and take the cheapest with `heapq.heappop`. When the square you pop is the bottom-right one, its total is the answer. Skip a popped entry whose total is bigger than `best` for that square, because it is out of date.
%% hint
For each of the four neighbours inside the grid, the new total is `total + costs[nr][nc]`. If it is smaller than `best.get((nr, nc), float("inf"))`, record it and push it onto the heap. Start with `best = {(0, 0): 0}` and `heap = [(0, 0, 0)]`.
%% end

