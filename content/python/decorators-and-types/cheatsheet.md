---
title: Decorators and types: cheat sheet
---
## Closures and higher-order functions

```python
def make_multiplier(factor):          # a function factory
    def multiply(number):
        return number * factor        # remembers factor: this is a closure
    return multiply

triple = make_multiplier(3)
triple(5)                             # 15

def make_counter():
    count = 0
    def counter():
        nonlocal count                # needed to ASSIGN to a variable of the function around
        count += 1
        return count
    return counter

buttons = [lambda i=i: i for i in range(3)]    # the default argument avoids late binding

from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)   # a new function with exponent fixed
square(7)                             # 49

def compose(*functions):              # a function that takes and returns functions
    def pipeline(value):
        for function in functions:
            value = function(value)
        return value
    return pipeline
```

- A **closure** remembers the **variables** around its definition, not their values at that time.
- **Late binding**: lambdas made in a loop share the loop variable and read it at call time. Cure it with `lambda i=i: ...`, a factory function, or `partial`.
- `nonlocal` is only needed to **assign**. Changing a list with `.append` does not need it.
- A **callback** is a function that you pass in, to be called later. A class with `__call__` makes objects that can be called like functions.

## Decorators

```python
from functools import wraps

def log_calls(func):
    @wraps(func)                           # keep the name and the docstring
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(func.__name__, args, kwargs, "->", result)
        return result                      # pass the result on
    return wrapper

@log_calls                                 # the same as: add = log_calls(add)
def add(a, b):
    return a + b

def repeat(times):                         # a decorator WITH arguments: one more layer
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)                                 # the same as: hello = repeat(3)(hello)
def hello():
    print("hi")

@bold                                      # stacked: applied from the bottom up
@italic
def text():
    return "x"

class CountCalls:                          # a class as a decorator
    def __init__(self, func):
        self.func = func
        self.calls = 0

    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.func(*args, **kwargs)

def register(cls):                         # a decorator for a class
    registry[cls.__name__] = cls
    return cls                             # hand the class back unchanged

from functools import cache

@cache                                     # a ready-made memoizer
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

- The decorator runs **once**, when the function is defined. The wrapper runs at **every call**.
- Always `return` the result of the original, and take `*args, **kwargs`.
- A decorator can also **register** a function and return it unchanged, as `@app.route(...)` does.

## Type hints

```python
def greet(name: str, times: int = 1) -> str: ...

age: int = 30
scores: dict[str, list[int]] = {}
point: tuple[int, int] = (1, 2)
maybe: str | None = None                   # a string, or None

from collections.abc import Callable, Iterable

def apply(func: Callable[[int], int], items: Iterable[int]) -> list[int]: ...

def first[T](items: list[T]) -> T: ...     # a generic function (Python 3.12 or later)

class Stack[T]: ...

type Scores = dict[str, list[int]]         # a name for a long hint

from typing import Final, Literal, NamedTuple, Protocol, TypedDict

MAX: Final = 10
colour: Literal["red", "green"] = "red"

class Movie(TypedDict):                    # a dict with known keys
    title: str
    year: int

class Point(NamedTuple):                   # a tuple with named fields
    x: int
    y: int

class Speaker(Protocol):                   # anything with a speak method fits
    def speak(self) -> str: ...

import inspect
from typing import get_type_hints

get_type_hints(greet)
inspect.signature(greet).bind("Ada", times=2).arguments
```

- Hints are **not enforced** by Python. They document the code, help editors, and let **mypy** and **pyright** find mistakes before the program runs.
- The hints are stored in `__annotations__`, so a program (a decorator, for example) can read them.
- Write `-> "Point"` in quotes inside the class `Point` for versions before Python 3.14.

## Dataclasses

```python
from dataclasses import dataclass, field, replace, asdict

@dataclass
class Player:
    name: str
    score: int = 0
    badges: list[str] = field(default_factory=list)    # a new list for each object

    def __post_init__(self):                           # runs after the generated __init__
        if self.score < 0:
            raise ValueError("score cannot be negative")

@dataclass(frozen=True, order=True, slots=True)
class Version:
    major: int
    minor: int = 0

replace(Version(1, 2), minor=5)            # a changed copy of a frozen object
asdict(Player("Ada"))                      # a plain dictionary
```

- `frozen=True` makes objects immutable and hashable. `order=True` adds the comparisons. `slots=True` saves memory and blocks new attributes.
- A mutable default such as `= []` is refused. Use `field(default_factory=list)`.
- Choose `@dataclass` for records with behaviour, `NamedTuple` for small fixed records, `TypedDict` for dictionaries with known keys, and a plain class for full control.

## Context managers

```python
from contextlib import contextmanager, suppress, redirect_stdout, ExitStack, nullcontext

@contextmanager
def labelled(label):
    print(f"[{label}] start")
    try:
        yield label.upper()                # the value for the name after "as"
    finally:
        print(f"[{label}] done")           # runs even after an error

with labelled("a") as name, labelled("b"):     # left in the opposite order: b, then a
    ...

with suppress(FileNotFoundError):          # ignore one kind of error
    open("missing.txt").read()

with redirect_stdout(buffer):              # capture what print writes
    ...

with ExitStack() as stack:                 # any number of managers
    files = [stack.enter_context(open(n)) for n in names]
```

- Code before `yield` is the entry, and code after it (in `finally`) is the exit. An error in the block is thrown into the generator at the `yield`.
- If the generator **catches** the error, the `with` statement swallows it. Name the exact errors that you expect.

## Async and await

```python
import asyncio

async def fetch(name, delay):              # a coroutine function
    await asyncio.sleep(delay)             # wait without blocking the loop
    return name.upper()

async def main():
    one = await fetch("a", 0.1)            # run one coroutine and wait for it
    many = await asyncio.gather(fetch("b", 0.1), fetch("c", 0.2))   # together, in order
    task = asyncio.create_task(fetch("d", 0.1))                     # start it in the background
    later = await task
    try:
        await asyncio.wait_for(fetch("e", 5), timeout=0.1)          # give up after 0.1 seconds
    except TimeoutError:
        print("too slow")
    gate = asyncio.Semaphore(2)            # at most 2 at a time
    async with gate:
        ...

asyncio.run(main())                        # start the event loop

async def countdown(n):                    # an async generator
    while n > 0:
        yield n
        await asyncio.sleep(0.1)
        n -= 1

async def show():
    async for number in countdown(3):
        print(number)
```

- Calling an `async def` function only creates a **coroutine object**. Nothing runs until it is awaited.
- Forgetting `await` means that the code never runs. Calling `time.sleep` blocks **every** coroutine, so use `await asyncio.sleep`.
- Async helps programs that **wait** for many things (web requests, connections). It does not speed up heavy calculation.
- On this site `await` also works at the top level, and a top-level `asyncio.run(...)` works too. In a normal file, use `asyncio.run(main())`.
