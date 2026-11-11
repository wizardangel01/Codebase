---
title: Code Golf
engine: judge
---
Welcome to the **Pythonic Golf Club**, where the best players never swing twice when once will do. Every hole is a puzzle with a short and elegant answer in Python: a comprehension, a generator, `all` and `zip`, star unpacking, the walrus operator or `match`. Most holes **forbid the long way round** (the `for` statement, for example), so that you practise the short way until it feels natural.

How to play:

- Press **Run**. The result panel lists every test. A red test shows what was expected and what your code gave, or the error that stopped it, together with the line of your code.
- Some tests are **hidden**. They check the edge cases, so follow every rule of the briefing, and do not only fit the visible examples.
- Every hole has a **par**: the number of code lines of a clean solution. Reach it for three stars. Blank lines and comments do not count. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Warm-up swing
The **driving range** opens with a warm-up. The coach reads out the words of a drill, but only words with **four or more letters** deserve a shout. Write `shout(words)`, which returns a list of those words in **capitals**, each followed by an exclamation mark, in the original order.

```text
shout(["go", "stop", "wait", "now"]) returns ["STOP!", "WAIT!"]
```

This hole does not allow the `for` statement or `while`. Use a **list comprehension**: it keeps some of the items and changes each one in a single expression.
%% config
mode: script
function: shout
par: 2
forbid: for while
forbid_note: Build the whole list with one comprehension instead.
require: listcomp
%% test The drill
expect(shout(["go", "stop", "wait", "now"]), ["STOP!", "WAIT!"])
%% test Nothing to shout
expect(shout(["a", "bc", "def"]), [])
%% test hidden Exactly four letters
expect(shout(["four", "tre", "fives"]), ["FOUR!", "FIVES!"])
%% test hidden Order and capitals
expect(shout(["Hello", "hi", "wORLD"]), ["HELLO!", "WORLD!"])
%% test hidden An empty drill
expect(shout([]), [])
%% test hidden The input is left alone
words = ["abcd", "x"]
shout(words)
expect(words, ["abcd", "x"])
%% starter
def shout(words):
    # Return a list: the words with 4 or more letters, in capitals, each with a ! at the end.
    pass

%% solution
def shout(words):
    return [word.upper() + "!" for word in words if len(word) >= 4]
%% hint
A list comprehension has the shape `[expression for item in items if condition]`. The `if` part keeps only some of the items.
%% hint
The condition is `len(word) >= 4`, and the expression that changes each kept word is `word.upper() + "!"`.
%% hint
Put it all in one line after `return`: `return [word.upper() + "!" for word in words if len(word) >= 4]`.
%% end

%% level l2 | Price tags
The **pro shop** has a sale. Every item that costs **more than 50** gets **10 per cent off**, and cheaper items keep their price. Write `mark_down(prices)`, where `prices` is a dictionary from item names to prices. Return a **new dictionary** with the sale prices, **rounded to 2 decimal places**. The original dictionary must not change.

```text
mark_down({"cap": 20, "bag": 80, "putter": 120.5})
returns {"cap": 20, "bag": 72.0, "putter": 108.45}
```

Use a **dictionary comprehension**. A conditional expression (`a if test else b`) inside it chooses the price of each item.
%% config
mode: script
function: mark_down
par: 3
forbid: for while
forbid_note: Build the whole dictionary with one comprehension instead.
require: dictcomp
%% test The sale
expect(mark_down({"cap": 20, "bag": 80, "putter": 120.5}), {"cap": 20, "bag": 72.0, "putter": 108.45})
%% test Nothing over 50
expect(mark_down({"tee": 1.5, "ball": 4}), {"tee": 1.5, "ball": 4})
%% test hidden Exactly 50
expect(mark_down({"glove": 50, "shoes": 51}), {"glove": 50, "shoes": 45.9})
%% test hidden Rounding
expect(mark_down({"x": 77, "y": 99.99}), {"x": 69.3, "y": 89.99})
%% test hidden An empty shop
expect(mark_down({}), {})
%% test hidden A new dictionary
prices = {"a": 100}
result = mark_down(prices)
check(result is not prices, "return a new dictionary")
expect(prices, {"a": 100})
%% starter
def mark_down(prices):
    # Return a new dictionary: 10 per cent off above 50, rounded to 2 decimals.
    pass

%% solution
def mark_down(prices):
    return {item: round(price * 0.9, 2) if price > 50 else price
            for item, price in prices.items()}
%% hint
A dictionary comprehension looks like `{key: value for key, value in something.items()}`.
%% hint
The value is chosen by a conditional expression: `new_price if price > 50 else price`. It goes **before** the `for`, because it says what each value is.
%% hint
`round(price * 0.9, 2)` takes 10 per cent off and rounds to 2 decimals. Use it as the `new_price` part.
%% end

%% level l3 | Battleship grid
The club's scoreboard is a grid, like the board of Battleship. Each square has a column letter and a row number: `a1`, `a2`, `a3`, `b1`, and so on. Write `grid(columns, rows)`, where `columns` is a text of column letters and `rows` is the number of rows. Return the names of **all the squares** as a list. Go through one whole column before the next, and from row 1 upwards in each column.

```text
grid("ab", 3) returns ["a1", "a2", "a3", "b1", "b2", "b3"]
```

One comprehension with **two `for` parts** does the job. The `for` statement is not allowed on this hole.
%% config
mode: script
function: grid
par: 2
forbid: for while
forbid_note: Build the whole list with one comprehension instead.
require: listcomp
%% test A small board
expect(grid("ab", 3), ["a1", "a2", "a3", "b1", "b2", "b3"])
%% test One column
expect(grid("c", 2), ["c1", "c2"])
%% test hidden The order matters
expect(grid("xyz", 2), ["x1", "x2", "y1", "y2", "z1", "z2"])
%% test hidden No rows
expect(grid("ab", 0), [])
%% test hidden No columns
expect(grid("", 5), [])
%% test hidden Two-digit rows
board = grid("a", 10)
expect(len(board), 10)
expect(board[-1], "a10")
%% test hidden A full board
board = grid("abcdefgh", 8)
expect(len(board), 64)
expect(board[0], "a1")
expect(board[8], "b1")
expect(board[-1], "h8")
%% starter
def grid(columns, rows):
    # Return every square name, column by column.
    pass

%% solution
def grid(columns, rows):
    return [col + str(row) for col in columns for row in range(1, rows + 1)]
%% hint
A comprehension can have **two** `for` parts: `[... for a in first for b in second]`. The first `for` is the outer loop, and the second is the inner loop, which turns faster.
%% hint
The outer loop goes over the column letters. The inner loop goes over the row numbers, which are `range(1, rows + 1)`.
%% hint
Each square is the letter joined to the number as text: `col + str(row)`.
%% end

%% level l4 | The endless fairway
A fairway of **triangular numbers** runs out of the clubhouse: 1, 3, 6, 10, 15, and on without an end. Each number is the one before it plus the next step: 1, then 1 + 2, then 3 + 3, then 6 + 4, and so on. Write a **generator function** `triangular()` that yields these numbers **forever**, one at a time.

```text
list(islice(triangular(), 6)) returns [1, 3, 6, 10, 15, 21]
```

A list cannot hold an endless sequence, so the numbers have to be made **lazily**, one for each request. The function `islice` from `itertools` takes the first few items of such a stream, and the tests use it. Golfers: the module `itertools` has a tool for running totals.
%% config
mode: script
function: triangular
par: 7
require: yield
%% test The first numbers
from itertools import islice
expect(list(islice(triangular(), 6)), [1, 3, 6, 10, 15, 21])
%% test A generator
import types
check(isinstance(triangular(), types.GeneratorType), "triangular() must give back a generator: use yield")
%% test hidden Step by step
numbers = triangular()
expect(next(numbers), 1)
expect(next(numbers), 3)
expect(next(numbers), 6)
%% test hidden Resume where it stopped
numbers = triangular()
first = [next(numbers) for _ in range(3)]
later = [next(numbers) for _ in range(3)]
expect(first, [1, 3, 6])
expect(later, [10, 15, 21])
%% test hidden Far down the fairway
from itertools import islice
expect(next(islice(triangular(), 999, None)), 500500)
%% test hidden Two walkers
one = triangular()
two = triangular()
next(one)
next(one)
expect(next(two), 1)
expect(next(one), 6)
%% starter
def triangular():
    # Yield 1, 3, 6, 10, ... for ever.
    pass

%% solution
def triangular():
    total = 0
    step = 1
    while True:
        total += step
        yield total
        step += 1
%% hint
A function that contains `yield` is a generator function. Calling it runs nothing yet: each `next` runs the body until the following `yield`, and the function remembers where it stopped.
%% hint
Keep a running `total` and a `step`. In an endless `while True:` loop, add the step to the total, `yield total`, and then raise the step by 1.
%% hint
The body is: `total = 0`, `step = 1`, then `while True:` with the three lines `total += step`, `yield total` and `step += 1`.
%% end

%% level l5 | Neighbours
The starter's list of tee times must be in order. Write `is_sorted(numbers)`, which returns `True` when **every number is at least as big as the one before it**, and `False` otherwise. Equal neighbours are fine. An empty list, and a list with one number, count as sorted.

```text
is_sorted([1, 2, 2, 5]) returns True
is_sorted([3, 1, 2]) returns False
```

No cheating with `sorted` or `sort`, and no `for` statement. Pair each number with the **next one** using `zip`, and ask `all` whether every pair is in order.
%% config
mode: script
function: is_sorted
par: 2
forbid: sorted sort for while
forbid_note: Compare each number with its neighbour, using all and zip.
require: all zip
%% test In order
expect(is_sorted([1, 2, 3, 4]), True)
%% test Out of order
expect(is_sorted([3, 1, 2]), False)
%% test hidden Equal neighbours
expect(is_sorted([1, 2, 2, 5]), True)
%% test hidden Only the end is wrong
expect(is_sorted([1, 2, 3, 2]), False)
%% test hidden Backwards
expect(is_sorted([9, 5, 1]), False)
%% test hidden Nothing to compare
expect(is_sorted([]), True)
expect(is_sorted([7]), True)
%% test hidden True or False
check(is_sorted([1, 2]) is True, "return True, not another value")
check(is_sorted([2, 1]) is False, "return False, not another value")
%% test hidden A tuple works too
expect(is_sorted((1, 2, 3)), True)
expect(is_sorted((3, 2, 1)), False)
%% starter
def is_sorted(numbers):
    # True when every number is at least as big as the one before it.
    pass

%% solution
def is_sorted(numbers):
    return all(a <= b for a, b in zip(numbers, numbers[1:]))
%% hint
`zip(numbers, numbers[1:])` pairs every number with the **next** one: `(1, 2)`, `(2, 3)`, and so on. It stops when the shorter of the two runs out.
%% hint
A generator expression over those pairs, `a <= b for a, b in zip(...)`, gives one `True` or `False` for each pair.
%% hint
`all(...)` is `True` only when every pair is in order. For a list with no pairs it is `True`, which is the right answer here.
%% end

%% level l6 | Podium
The prize-giving needs the scores in a special shape. Write `podium(scores)`, where `scores` is a list of **at least three** scores, already sorted from best to worst. Return a tuple `(gold, silver, bronze, others)`: the first three scores, and then a **list** with all the remaining scores (an empty list when there are none).

```text
podium([95, 90, 88, 70, 65]) returns (95, 90, 88, [70, 65])
```

Use **star unpacking**: a name with a star on the left of an assignment collects everything that is left. Slicing (`scores[3:]`) is not allowed on this hole.
%% config
mode: script
function: podium
par: 3
forbid: slice
forbid_note: Unpack the list with a starred name instead.
require: star
%% test Five scores
expect(podium([95, 90, 88, 70, 65]), (95, 90, 88, [70, 65]))
%% test Exactly three
expect(podium([9, 8, 7]), (9, 8, 7, []))
%% test hidden A long list
expect(podium(list(range(10, 0, -1))), (10, 9, 8, [7, 6, 5, 4, 3, 2, 1]))
%% test hidden The right types
result = podium([3, 2, 1, 0])
check(type(result) is tuple and len(result) == 4, "return a tuple of four items")
check(type(result[3]) is list, "the fourth item must be a list")
%% test hidden Words
expect(podium(["a", "b", "c", "d"]), ("a", "b", "c", ["d"]))
%% test hidden A tuple as input
expect(podium((5, 4, 3, 2)), (5, 4, 3, [2]))
%% starter
def podium(scores):
    # Unpack the first three scores, and collect the rest with a starred name.
    pass

%% solution
def podium(scores):
    gold, silver, bronze, *others = scores
    return gold, silver, bronze, others
%% hint
A starred name on the left of an assignment collects everything that is left over, as a list: `first, *rest = [1, 2, 3]` gives `rest == [2, 3]`.
%% hint
Name the first three scores, then add a starred name for the others: `gold, silver, bronze, *others = scores`.
%% hint
Return the four names as a tuple: `return gold, silver, bronze, others`.
%% end

%% level l7 | Scorekeeper
Keep score on the course. The program reads the strokes of each hole, **one number per line**, until the line `end`. Then it prints how many holes were played and the total number of strokes, in this form:

```text
Holes: 3
Strokes: 13
```

That is the output for the input lines `4`, `5`, `4` and `end`.

Read the lines with the **walrus operator** in the loop header: `while (line := input()) != "end":` reads a line, keeps it in `line`, and tests it, all in one step.
%% config
mode: io
par: 5
require: walrus
%% in Three holes
4
5
4
end
%% out
Holes: 3
Strokes: 13
%% in One hole
3
end
%% out
Holes: 1
Strokes: 3
%% in hidden
end
%% out
Holes: 0
Strokes: 0
%% in hidden
10
12
end
%% out
Holes: 2
Strokes: 22
%% in hidden
5
4
3
4
4
5
3
4
4
5
4
3
4
4
5
3
4
4
end
%% out
Holes: 18
Strokes: 72
%% in hidden
9
1
end
%% out
Holes: 2
Strokes: 10
%% starter
# Read the strokes until the line "end", then print the two result lines.

%% solution
strokes = []
while (line := input()) != "end":
    strokes.append(int(line))
print(f"Holes: {len(strokes)}")
print(f"Strokes: {sum(strokes)}")
%% hint
The walrus operator `:=` assigns and tests in one step: `while (line := input()) != "end":` keeps the line in `line` and compares it with `"end"`.
%% hint
Inside the loop, turn the line into a number with `int(line)`, and add it to a list.
%% hint
When the loop ends, print `Holes: ` and the length of the list, and then `Strokes: ` and its `sum`.
%% end

%% level l8 | The handicap formula
The club stores its handicap formulas as **nested tuples**, so that members can change them without touching any code. A formula is one of these:

- a **whole number**, which is its own value,
- `("add", a, b)`, the sum of the values of `a` and `b`,
- `("mul", a, b)`, their product,
- `("neg", a)`, the value of `a` with its sign changed.

The parts `a` and `b` can be formulas too. Write `evaluate(formula)`, which returns the value of a formula. Anything else is not a formula, and must raise a `ValueError`.

```text
evaluate(7) returns 7
evaluate(("add", 2, ("mul", 3, 4))) returns 14
evaluate(("neg", ("add", 1, 2))) returns -3
evaluate(("pow", 2, 3)) raises ValueError
```

Use a **`match` statement**. The function calls itself for the parts of a formula.
%% config
mode: script
function: evaluate
par: 12
require: match
%% test A plain number
expect(evaluate(7), 7)
%% test A sum
expect(evaluate(("add", 2, 3)), 5)
%% test Nested parts
expect(evaluate(("add", 2, ("mul", 3, 4))), 14)
expect(evaluate(("neg", ("add", 1, 2))), -3)
%% test hidden A deep formula
formula = ("mul", ("add", 1, 2), ("neg", ("mul", 2, ("add", 1, 1))))
expect(evaluate(formula), -12)
%% test hidden An unknown operation
check(raises(ValueError, evaluate, ("pow", 2, 3)), "an unknown operation must raise ValueError")
%% test hidden The wrong number of parts
check(raises(ValueError, evaluate, ("add", 1)), "a formula with a missing part must raise ValueError")
check(raises(ValueError, evaluate, ("neg", 1, 2)), "a formula with too many parts must raise ValueError")
%% test hidden Not a formula
check(raises(ValueError, evaluate, "seven"), "a text is not a formula: raise ValueError")
%% test hidden A bad part inside
check(raises(ValueError, evaluate, ("add", 1, ("pow", 2, 3))), "a bad part inside a formula must raise ValueError too")
%% starter
def evaluate(formula):
    # Use match: one case for a number, one for each kind of formula, and a last case for the rest.
    pass

%% solution
def evaluate(formula):
    match formula:
        case int():
            return formula
        case ("add", left, right):
            return evaluate(left) + evaluate(right)
        case ("mul", left, right):
            return evaluate(left) * evaluate(right)
        case ("neg", inner):
            return -evaluate(inner)
        case _:
            raise ValueError(f"cannot evaluate {formula!r}")
%% hint
A `match` statement tries its `case` patterns from the top. `case int():` matches any whole number. `case ("add", left, right):` matches a tuple of exactly three items that starts with `"add"`, and **captures** the other two.
%% hint
The value of `("add", left, right)` is `evaluate(left) + evaluate(right)`: the function calls itself for each part. A plain number is the base case that stops the calls.
%% hint
The last case, `case _:`, matches everything that is left. Raise a `ValueError` there. Do the same shape for `mul` (multiply) and `neg` (one part, with a minus sign).
%% end

