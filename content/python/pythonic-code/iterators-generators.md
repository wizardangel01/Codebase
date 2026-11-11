---
title: Iterators and generators
---
Every `for` loop that you have written has relied on a mechanism that you never saw. In this lesson you look inside it. Then you use the same mechanism to write functions that produce values **one at a time**, only when somebody asks for the next one. Such **lazy** sequences can be huge, or even infinite, and they use almost no memory. They also explain the objects that you met in module 12, such as `combinations` and `islice`, which printed as strange objects until you wrapped them in `list(...)`.

## Iterables and iterators

An **iterable** is anything that a `for` loop can go through: a list, a string, a tuple, a dictionary, a set, a `range` or a file. When a loop starts, Python asks the iterable for an **iterator** with the built-in `iter`. The iterator is a small object that remembers **where it is**. Each call of `next(iterator)` gives the next item and moves on:

```python run
numbers = [10, 20, 30]
iterator = iter(numbers)
print(next(iterator))
print(next(iterator))
print(next(iterator))
print(next(iterator, "no more"))
```

The second argument of `next` is a **default**. Without it, asking for an item that does not exist raises a `StopIteration` error. That error is not a mistake: it is the signal that tells a loop "there are no more items":

```python run error
iterator = iter([10, 20])
print(next(iterator))
print(next(iterator))
print(next(iterator))
```

A `for` loop is a `while` loop that does this work for you. The two loops below print the same numbers. The second one is what Python does behind the scenes:

```python run
numbers = [10, 20, 30]

for n in numbers:
    print(n)

iterator = iter(numbers)
while True:
    try:
        n = next(iterator)
    except StopIteration:
        break
    print(n)
```

There is one important difference between the two kinds of object. A list is an **iterable**: every `iter(numbers)` gives you a **fresh** iterator that starts from the beginning. An **iterator** can be used **once**. When it reaches the end, it is exhausted, and it stays empty:

```python run
numbers = [1, 2, 3]
iterator = iter(numbers)

print(iter(iterator) is iterator)
print(iter(numbers) is numbers)
print(list(iterator), list(iterator))
print(list(numbers), list(numbers))
print(type(range(3)).__name__, type(iter(range(3))).__name__)
print(type(zip([1], [2])).__name__, type(enumerate("ab")).__name__, type(reversed([1, 2])).__name__)
```

An iterator is itself iterable (`iter(iterator)` gives back the same object), which is why you can put one in a `for` loop. Notice the last two lines. A `range` is an iterable, and it gives a new `range_iterator` each time. But `zip`, `enumerate` and `reversed` return **iterators** straight away, which is why you often wrap them in `list(...)` to see the items. A file object is an iterator too, over its lines, as you saw in module 8.

%% question q-iter-predict | predict
What does this program print?

```python
it = iter("abc")
print(next(it), next(it))
print(list(it))
```
%% answer
a b
['c']
%% explain
The first `print` takes two items from the iterator, `'a'` and `'b'`. The iterator remembers its place, so `list(it)` gets only what is left, which is `['c']`.
%% end

## Generator functions

Writing your own iterator class is a lot of work (you will see it later in this lesson). Python has a much shorter way: a **generator function**. It looks like a normal function, but it uses `yield` where a normal function would use `return`:

```python run
def count_up_to(limit):
    n = 1
    while n <= limit:
        yield n
        n += 1

counter = count_up_to(3)
print(type(counter).__name__)
print(next(counter))
print(next(counter))
print(next(counter))
print(next(counter, "done"))

print(list(count_up_to(5)))
for n in count_up_to(3):
    print("n is", n)
```

Calling a generator function does **not** run its body. It returns a **generator object**, which is an iterator. The body starts to run when you ask for the first item with `next` (or with a `for` loop). It runs up to the first `yield`, hands out that value, and **pauses**. All its local variables stay alive. The next request resumes it right after the `yield`. When the function reaches its end, or a `return`, the generator signals `StopIteration`. The prints in this example show the order in which things happen:

```python run
def noisy():
    print("start")
    yield "first"
    print("middle")
    yield "second"
    print("end")

gen = noisy()
print("created")
print(next(gen))
print("between")
print(next(gen))
print(next(gen, "finished"))
```

Nothing is printed by `noisy` when the generator is created. The word `start` appears only at the first `next`, and the function pauses at each `yield` while the main program carries on.

%% question q-pause-predict | predict
What does this program print?

```python
def gen():
    print("A")
    yield 1
    print("B")
    yield 2

g = gen()
print(next(g))
print(next(g))
```
%% answer
A
1
B
2
%% explain
Creating `g` runs nothing. The first `next` runs the body up to the first `yield`, so it prints `A` and then hands out 1, which the outer `print` shows. The second `next` resumes after that `yield`, prints `B`, and hands out 2.
%% end

## Infinite generators

Because a generator makes each value only when it is needed, it can describe a sequence that **never ends**. A list could never do that. The consumer decides when to stop, with a `break`, or with `islice` from module 12:

```python run
from itertools import islice

def naturals():
    n = 1
    while True:
        yield n
        n += 1

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(islice(naturals(), 5)))
print(list(islice(fibonacci(), 10)))

for number in fibonacci():
    if number > 50:
        break
    print(number, end=" ")
print()
```

The loop inside `fibonacci` has no end, and the program still finishes, because the `for` loop in the main program stops asking. Never call `list(...)` on an infinite generator: the program would try to collect infinitely many items.

A generator expression, from lesson 1, is the short form for a generator that maps or filters another sequence. Use a **generator function** when you need more than one expression: state that carries from one item to the next, several `yield` statements, or a loop with some logic inside.

## yield from

A generator often needs to hand out **all the items of another iterable**. The statement `yield from other` does that, and it replaces a loop of `for item in other: yield item`. It also makes **recursive** generators short to write, because a generator can delegate to itself:

```python run
def flatten(items):
    for item in items:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

print(list(flatten([1, [2, [3, 4]], 5, [[6]]])))

def chain_two(first, second):
    yield from first
    yield from second

print(list(chain_two("ab", [1, 2])))
```

The function `flatten` can go through lists nested to any depth. This is something that the flattening comprehension of lesson 1, with its fixed two levels, could not do.

%% question q-yieldfrom-predict | predict
What does this program print?

```python
def letters():
    yield "a"
    yield from "bc"
    yield "d"

print("".join(letters()))
```
%% answer
abcd
%% explain
The generator hands out `"a"`, then every item of the string `"bc"`, which are `"b"` and `"c"`, and finally `"d"`. The method `join` collects them into the text `abcd`.
%% end

## Pipelines and memory

Generators fit together like pieces of a pipe. Each stage takes an iterator, and yields its own values. **Nothing runs until the end of the pipe asks for a value**, and then each value travels through all the stages before the next one starts:

```python run
def numbers(limit):
    for n in range(limit):
        print("  making", n)
        yield n

def squares(source):
    for n in source:
        yield n * n

def only_even(source):
    for n in source:
        if n % 2 == 0:
            yield n

pipeline = only_even(squares(numbers(5)))
print("pipeline built, nothing has run yet")
for value in pipeline:
    print("got", value)
```

Read the output in order. The number 0 is made, squared and passed on before the number 1 is made. The odd squares are dropped by `only_even`, so you see `making 1` and `making 2` after each other, and then `got 4`. At no moment does the pipeline hold more than one number. That is the benefit of **lazy** processing: you can read a file of many gigabytes line by line, filter the lines, and count them, with only one line in memory at any time. The same program with lists would try to hold every intermediate list at once.

```python run
import sys

def million():
    n = 0
    while n < 1_000_000:
        yield n
        n += 1

total = 0
for n in million():
    total += n
print(total)
print(sys.getsizeof(million()) < 1_000)
print(sys.getsizeof(list(range(1_000_000))) > 1_000_000)
```

The generator object takes a few dozen bytes however long the sequence is. The list of the same numbers takes millions of bytes.

%% question q-memory-choice | choice
A program has to count the lines that contain the word `ERROR` in a log file of 20 gigabytes. Why is a generator pipeline over the file a good solution?
%% choice
It makes Python read the file faster than any other method
%% choice correct
It holds only one line in memory at a time, so the file does not have to fit in memory
%% choice
It sorts the lines, so that the errors come first
%% choice
It stores all the lines in a list that can be used again
%% explain
A generator pipeline is lazy. Each line is read, tested and counted, and then it is forgotten before the next one is read. A list of all the lines would need about 20 gigabytes of memory.
%% end

## Writing an iterator class

Under the hood, an iterator is any object with two special methods from module 10: `__iter__`, which returns the iterator itself, and `__next__`, which returns the next item or raises `StopIteration`. A generator function writes both for you. Here is the same idea written by hand, so that you can see what the generator saves you from:

```python run
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

print(list(Countdown(3)))
for n in Countdown(2):
    print(n)
```

The state lives in `self.current`, and each call of `__next__` changes it. The generator version of the same idea needs only the loop and a `yield`.

A **collection** class does not have to be an iterator itself. It only has to be **iterable**, which means that `__iter__` returns a *new* iterator each time. The shortest way to write that method is as a generator:

```python run
class Playlist:
    def __init__(self, songs):
        self.songs = songs

    def __iter__(self):
        for song in self.songs:
            yield song.title()

mix = Playlist(["blue", "red", "green"])
print(list(mix))
print(list(mix))
print(len(list(mix)))
```

Because every `for` loop or `list` call starts a fresh generator, the playlist can be used again and again, as a list can. A bare iterator would give an empty list the second time.

%% question q-iterators-multi | multi
Select every true statement.
%% choice correct
A list is iterable, but it is not an iterator.
%% choice correct
Calling a generator function runs none of its body until the first `next`.
%% choice correct
An iterator can be looped over only once.
%% choice
Calling `next` on an exhausted iterator returns `None`.
%% choice
`yield` and `return` do the same thing in a function.
%% explain
A list gives a fresh iterator each time, and an iterator is used up after one pass. A generator function only builds the generator object when you call it. Asking an exhausted iterator for another item raises `StopIteration`, unless you give `next` a default. And `yield` **pauses** a function and keeps its state, while `return` ends it.
%% end

%% question q-yield-fill | fill
Fill in the blank so that the function becomes a generator and the program prints `[1, 2, 3]`.

```python
def one_two_three():
    for n in (1, 2, 3):
        ___ n

print(list(one_two_three()))
```
%% answer
yield
%% expected
[1, 2, 3]
%% explain
With `yield`, the function hands out one number at a time and pauses, and `list` collects all three. A `return` would stop the function at the first number.
%% end

## The tools of itertools

The functions of `itertools` from module 12 are all **iterators**, and now you know why they behave the way that they do. They work with your generators as well. Here is a generator of prime numbers, cut in two different ways:

```python run
from itertools import count, islice, takewhile

def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            return False
    return True

def primes():
    for n in count(2):
        if is_prime(n):
            yield n

print(list(islice(primes(), 10)))
print(list(takewhile(lambda p: p < 40, primes())))
```

The function `islice` takes the **first ten** primes, and `takewhile` takes primes **as long as** a test holds. The generator `primes` never ends, and each tool decides where to stop. Two more are worth knowing: `dropwhile` skips items while a test holds, and `chain.from_iterable` joins a sequence of iterables, as a lazy flattening.

## Your turn

%% exercise countdown | Countdown
Write a **generator function** `countdown(n)` that yields `n`, `n - 1`, and so on down to 1. The program reads `n`, prints the numbers on one line separated by spaces, and then prints `Liftoff!`. For the input below the program prints:

```output
5 4 3 2 1
Liftoff!
```
%% stdin
5
%% starter
def countdown(n):
    # Yield n, n - 1, ... down to 1. A generator function uses yield.
    pass

n = int(input())
# Print the numbers on one line, and then Liftoff!
%% solution
def countdown(n):
    while n > 0:
        yield n
        n -= 1

n = int(input())
print(" ".join(str(value) for value in countdown(n)))
print("Liftoff!")
%% tests
expect_output("5 4 3 2 1\nLiftoff!")
check(rerun("1").strip() == "1\nLiftoff!", "one number")
check(rerun("0").strip() == "Liftoff!", "nothing to count")
check(list(countdown(3)) == [3, 2, 1], "countdown(3) gives 3, 2, 1")
import types
check(isinstance(countdown(2), types.GeneratorType), "countdown is a generator function")
check(uses("Yield"), "uses yield")
%% hint
A generator function contains `yield`. Use a loop that counts down: `while n > 0:`.
%% hint
Inside the loop, `yield n` hands out the number, and then `n -= 1` moves on.
%% hint
Turn the numbers into text and join them: `" ".join(str(value) for value in countdown(n))`.
%% end

%% exercise fibonacci-below | Fibonacci below a limit
Write an **infinite** generator function `fibonacci()` that yields 0, 1, 1, 2, 3, 5, and so on. The program reads a limit and prints, on one line, every Fibonacci number **below** the limit. Use a `for` loop over the generator, and stop it with `break`. For the input below the program prints:

```output
0 1 1 2 3 5 8 13 21 34 55 89
```
%% stdin
100
%% starter
def fibonacci():
    # Yield the Fibonacci numbers for ever: 0, 1, 1, 2, 3, 5, ...
    pass

limit = int(input())
# Print every Fibonacci number below the limit, on one line.
%% solution
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

limit = int(input())
found = []
for number in fibonacci():
    if number >= limit:
        break
    found.append(str(number))
print(" ".join(found))
%% tests
expect_output("0 1 1 2 3 5 8 13 21 34 55 89")
check(rerun("1").strip() == "0", "only zero is below 1")
check(rerun("0").strip() == "", "nothing is below 0")
check(rerun("1000").strip().split()[-1] == "987", "the last number below 1000")
from itertools import islice
check(list(islice(fibonacci(), 8)) == [0, 1, 1, 2, 3, 5, 8, 13], "the first eight numbers")
check(uses("Yield"), "uses yield")
%% hint
Keep two numbers, `a` and `b`, and start them at 0 and 1. A `while True:` loop inside the generator never ends, and that is fine.
%% hint
In the loop, `yield a` and then `a, b = b, a + b` move to the next pair.
%% hint
In the main program, loop over `fibonacci()`. Stop with `break` when the number is `>= limit`, and collect the others as text for `" ".join(...)`.
%% end

%% exercise batches | Batches
Write a generator function `batches(items, size)` that yields the items in **lists of at most `size` items**. The last list may be shorter. The program reads a line of words and a batch size, and prints each batch on its own line. For the input below the program prints:

```output
Batch 1: a b c
Batch 2: d e f
Batch 3: g
```
%% stdin
a b c d e f g
3
%% starter
def batches(items, size):
    # Yield the items in lists of at most size items.
    pass

words = input().split()
size = int(input())
# Print every batch as: Batch 1: a b c
%% solution
def batches(items, size):
    for start in range(0, len(items), size):
        yield items[start:start + size]

words = input().split()
size = int(input())
for number, batch in enumerate(batches(words, size), start=1):
    print(f"Batch {number}: {' '.join(batch)}")
%% tests
expect_output("Batch 1: a b c\nBatch 2: d e f\nBatch 3: g")
check(list(batches([1, 2, 3, 4, 5], 2)) == [[1, 2], [3, 4], [5]], "batches of two")
check(list(batches([], 3)) == [], "no items, no batches")
check(rerun("x y\n5").strip() == "Batch 1: x y", "one short batch")
check(uses("Yield"), "uses yield")
%% hint
`range(0, len(items), size)` gives the start index of every batch: 0, `size`, `2 * size`, and so on.
%% hint
A slice `items[start:start + size]` is one batch. A slice past the end is shorter, which is what the last batch needs.
%% hint
Yield each slice. In the main program, `enumerate(batches(words, size), start=1)` gives the batch numbers, and `" ".join(batch)` makes the text.
%% end

%% exercise log-pipeline | Challenge: A log pipeline
Build a **pipeline** of three generator functions. `read_lines()` yields the lines that the user types (with `input()`) until the line `end`, and it does not yield `end`. `errors(lines)` yields only the lines that start with `ERROR` (capital letters). `numbered(items)` yields each item as `1. text`, `2. text`, and so on. The program joins the three stages, prints every numbered error, and then prints `Total:` and the number of errors. For the input below the program prints:

```output
1. ERROR disk full
2. ERROR network down
Total: 2
```
%% stdin
INFO start
ERROR disk full
INFO retry
ERROR network down
end
%% starter
def read_lines():
    # Yield the lines from input() until the line "end".
    pass

def errors(lines):
    # Yield only the lines that start with ERROR.
    pass

def numbered(items):
    # Yield "1. first", "2. second", and so on.
    pass

total = 0
# Connect the three stages, print every result, and count them.
%% solution
def read_lines():
    while True:
        line = input()
        if line == "end":
            return
        yield line

def errors(lines):
    for line in lines:
        if line.startswith("ERROR"):
            yield line

def numbered(items):
    for number, item in enumerate(items, start=1):
        yield f"{number}. {item}"

total = 0
for line in numbered(errors(read_lines())):
    print(line)
    total += 1
print(f"Total: {total}")
%% tests
expect_output("1. ERROR disk full\n2. ERROR network down\nTotal: 2")
check(list(errors(["INFO a", "ERROR b", "ERROR c"])) == ["ERROR b", "ERROR c"], "errors keeps only the ERROR lines")
check(list(numbered(["x", "y"])) == ["1. x", "2. y"], "numbered adds the numbers")
check(rerun("end").strip() == "Total: 0", "no lines")
check(rerun("error lower\nERROR Upper\nend").strip() == "1. ERROR Upper\nTotal: 1", "ERROR is case sensitive")
import ast
found = 0
for node in ast.walk(ast.parse(source())):
    if isinstance(node, ast.Yield):
        found += 1
check(found >= 3, "each stage is a generator function that uses yield")
%% hint
`read_lines` can use `while True:`. Read a line with `input()`, `return` when it is `"end"`, and `yield` it otherwise.
%% hint
`errors` loops over the lines it receives and yields the ones with `line.startswith("ERROR")`. `numbered` can loop with `enumerate(items, start=1)` and yield an f-string.
%% hint
Connect the stages like pipes: `numbered(errors(read_lines()))`. Loop over that, print each line, and add 1 to `total`.
%% end

## What you learned

- An **iterable** can be looped over, and `iter(iterable)` gives an **iterator** that remembers its place. `next(iterator)` gives the next item, and `StopIteration` signals the end (or `next` returns its default). A `for` loop is a `while` loop that calls `next` for you.
- An iterator can be used **once**. Lists, strings, dictionaries and ranges are iterables that give a fresh iterator each time. `zip`, `enumerate`, `reversed`, files and everything in `itertools` are iterators.
- A function with `yield` is a **generator function**. Calling it runs nothing. Each `next` runs it up to the next `yield` and pauses, with its local variables intact.
- Generators can be **infinite**, and the consumer decides when to stop (with `break`, `islice` or `takewhile`). `yield from` hands out every item of another iterable, which also makes recursive generators short to write.
- **Pipelines** of generators process one item at a time through all the stages, so they use almost no memory, whatever the size of the data.
- A class becomes an iterator with `__iter__` and `__next__`. The shortest way to make a class **iterable** is a `__iter__` method that is a generator.
