---
title: Decorators and types: module quiz
pass: 70
---
Twelve questions on everything in this module: closures, decorators, type hints and dataclasses, context managers and async code. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | predict
What does this program print?

```python
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

a = make_counter()
a()
a()
b = make_counter()
print(a(), b())
```
%% answer
3 1
%% explain
Each call of `make_counter` makes a separate closure with its own `count`. The counter `a` is called twice before the print, so its next call gives 3. The counter `b` is new, so its first call gives 1.
%% end

%% question q2 | multi
Assume that `make_getter(n)` returns `lambda: n`, and that `identity(x)` returns `x`. Select every list that holds three functions which return 0, 1 and 2 when they are called.
%% choice correct
`[lambda i=i: i for i in range(3)]`
%% choice correct
`[make_getter(i) for i in range(3)]`
%% choice correct
`[partial(identity, i) for i in range(3)]`
%% choice
`[lambda: i for i in range(3)]`
%% choice
`[lambda: i for i in [0, 1, 2]]`
%% explain
A default argument, a factory function and `partial` each give every function its own copy of `i`. A plain `lambda: i` looks at the shared variable `i` when it is called, after the loop has finished, so all three functions return 2. The last two options are both of that kind.
%% end

%% question q3 | choice
What does the call `partial(power, exponent=2)` return?
%% choice
The number that `power` gives when `exponent` is 2
%% choice correct
A new function in which `exponent` is always 2
%% choice
The same function `power`, changed in place
%% choice
A list of the arguments that were fixed
%% explain
The function `partial` builds a **new function** from an old one, with some of the arguments already filled in. The original `power` is not changed, and nothing is calculated until you call the new function.
%% end

%% question q4 | predict
What does this program print?

```python
def shout(func):
    def wrapper():
        print("before")
        func()
        print("after")
    return wrapper

@shout
def hello():
    print("hello")

print("defined")
hello()
```
%% answer
defined
before
hello
after
%% explain
The decorator `shout` runs when `hello` is defined, but it prints nothing itself: it only builds and returns the wrapper. So the first line is `defined`. The call `hello()` then runs the wrapper, which prints `before`, calls the original function, and prints `after`.
%% end

%% question q5 | order
Put the lines in order so that the program prints `hi` twice. One line does not belong.
%% lines
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator
@repeat(2)
def hi():
    print("hi")
hi()
%% distractors
        return wrapper()
%% expected
hi
hi
%% explain
The outer function takes the setting, the next one takes the function, and the innermost one is the wrapper that does the repeating. The two `return` lines close the layers from the inside out, and then the decorated function and its call come last. The distractor `return wrapper()` would call the wrapper at once, instead of handing it back, and the decorator would return `None`.
%% end

%% question q6 | predict
What does this program print?

```python
def tag(name):
    def decorator(func):
        def wrapper():
            return f"<{name}>{func()}</{name}>"
        return wrapper
    return decorator

@tag("b")
@tag("i")
def text():
    return "hi"

print(text())
```
%% answer
<b><i>hi</i></b>
%% explain
Decorators are applied from the bottom up, so `tag("i")` wraps the function first, and `tag("b")` wraps that result. The outer wrapper runs first, but it calls the inner one inside its own tags, so the italic tags end up **inside** the bold ones.
%% end

%% question q7 | choice
Which field definition gives every `Cart` object its **own** list of items?
%% choice
`items: list[str] = []`
%% choice correct
`items: list[str] = field(default_factory=list)`
%% choice
`items: list[str] = list`
%% choice
`items: list[str] = None`
%% explain
The first version is refused by `@dataclass` with a `ValueError`, because one list would be shared by every object. The third version makes the default the class `list` itself, and the fourth makes it `None`. Only `default_factory=list` calls `list()` for each new object.
%% end

%% question q8 | fill
Fill in the blank so that the program prints `True`.

```python
from typing import NamedTuple

class Point(___):
    x: int
    y: int

print(Point(1, 2) == (1, 2))
```
%% answer
NamedTuple
%% expected
True
%% explain
A class that inherits from `NamedTuple` is a real tuple with named fields, so it compares equal to a plain tuple with the same items. A dataclass would print `False` here, because a dataclass is not a tuple.
%% end

%% question q9 | predict
What does this program print?

```python
from contextlib import contextmanager

@contextmanager
def tag(name):
    print("open", name)
    yield
    print("close", name)

with tag("a"), tag("b"):
    print("inside")
```
%% answer
open a
open b
inside
close b
close a
%% explain
The managers are entered from left to right, so `a` opens first and `b` second. They are left in the **opposite** order, like a stack of boxes, so `b` closes before `a`.
%% end

%% question q10 | predict
What does this program print?

```python
import asyncio

async def step(name, delay):
    print("start", name)
    await asyncio.sleep(delay)
    print("end", name)

async def main():
    await asyncio.gather(step("a", 0.02), step("b", 0.01))

asyncio.run(main())
```
%% answer
start a
start b
end b
end a
%% explain
The function `gather` starts both coroutines at once, so both `start` lines come first. Each one then waits. The coroutine `b` has the shorter delay, so it ends first.
%% end

%% question q11 | choice
Why is the call `time.sleep(1)` a problem inside a coroutine?
%% choice correct
It blocks the event loop, so no other coroutine can run for that second
%% choice
It raises a `SyntaxError` inside a function that is defined with `async def`
%% choice
It waits for 1 millisecond and not for 1 second
%% choice
It starts a new thread for every call
%% explain
The call `time.sleep` stops the whole thread, and the event loop runs on that thread. While it sleeps, no other coroutine gets a turn. The call `await asyncio.sleep(1)` waits too, but it hands control back to the event loop while it does.
%% end

%% question q12 | multi
Select every statement that is **true**.
%% choice correct
A function that uses `@contextmanager` must contain a `yield`
%% choice correct
In a normal Python file, `await` can only be used inside a function that is defined with `async def`
%% choice correct
`asyncio.gather` returns the results in the order of its arguments, and not in the order in which they finish
%% choice
Async code runs on several processors at the same time
%% choice
The body of a function that is defined with `async def` runs as soon as you call it
%% explain
A generator function with `yield` is what `@contextmanager` needs, `await` belongs in a coroutine, and `gather` keeps the order of its arguments. Async code runs on one thread and fills waiting time, and calling an `async def` function only creates a coroutine object: the body runs when something awaits it.
%% end
