---
title: Decorators
---
You have been using decorators already: `@property`, `@classmethod`, `@staticmethod` and `@dataclass` all are. A **decorator** wraps a function (or a class) with extra behaviour, without changing the code of the function itself. With one line above a `def`, you can add logging, timing, caching or checking to it. A decorator is built from exactly the two ideas of the last lesson: a function that **takes a function** and a closure that **remembers** it. By the end of this lesson you will write your own decorators, with and without arguments, and read the decorators in other people's code with confidence.

## A function that wraps a function

Start without any special syntax. The function `loud` takes a function, and returns a **new** function that calls the old one between two messages:

```python run
def loud(func):
    def wrapper():
        print("Before the call")
        func()
        print("After the call")
    return wrapper

def greet():
    print("Hello!")

greet = loud(greet)      # replace greet with the wrapped version
greet()
```

The name `greet` now points at `wrapper`, which remembers the original `greet` in the variable `func`. That is a closure. The line `greet = loud(greet)` is the whole idea of a decorator, and Python has a shorthand for it. Writing `@loud` above the definition means the same thing:

```python run
def loud(func):
    def wrapper():
        print("Before the call")
        func()
        print("After the call")
    return wrapper

@loud                    # the same as: greet = loud(greet)
def greet():
    print("Hello!")

greet()
```

%% key Two moments to keep apart
The decorator itself runs **once**, when Python reaches the `def` line. The **wrapper** that it returns runs **every time** that you call the function. Mixing these two up is the most common source of confusion with decorators.
%% end

The next program prints a message in each place, so you can see the two moments:

```python run
def announce(func):
    print("decorating", func.__name__)       # runs once, when the def is executed
    def wrapper():
        print("calling", func.__name__)      # runs at every call
        return func()
    return wrapper

@announce
def ping():
    print("pong")

print("--- defined")
ping()
ping()
```

Notice that `decorating ping` appears **before** the line `--- defined`, even though the function was never called.

## Wrappers for any function

The wrapper above works only for functions with no parameters. A useful decorator should work for **any** function, so the wrapper accepts `*args` and `**kwargs` (module 7), passes them on, and returns whatever the original returns:

```python run
def log_calls(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(f"{func.__name__} called with {args} and {kwargs}, result {result}")
        return result            # do not forget to pass the result on
    return wrapper

@log_calls
def add(a, b=0):
    return a + b

add(2, 3)
add(5)
print(add(b=1, a=1) * 10)
```

The decorator knows nothing about `add`, so the same `@log_calls` works on any function. Forgetting `return result` is a classic mistake: the wrapper would return `None`, and the arithmetic in the last line would fail.

## Keeping the name: functools.wraps

There is a side effect. After decoration, the name `add` points at the **wrapper**, so it loses the name and the docstring of the original:

```python run
def plain(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@plain
def add(a, b):
    """Return a + b."""
    return a + b

print(add.__name__, add.__doc__)
```

The function now calls itself `wrapper`, and `help(add)` would show nothing useful. The cure is another decorator, `functools.wraps`, which copies the name, the docstring and the other details of the original onto the wrapper. Put it above the wrapper, and give it the original function:

```python run
from functools import wraps

def polite(func):
    @wraps(func)                       # copy the name and docstring onto wrapper
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@polite
def add(a, b):
    """Return a + b."""
    return a + b

print(add.__name__, add.__doc__)
print(add.__wrapped__(1, 2))           # wraps keeps a link to the original
help(add)
```

From now on, every decorator in this lesson uses `@wraps(func)`. It is a habit worth keeping, because tools, error messages and `help` all rely on the name.

%% question q-wraps-fill | fill
Fill in the blank so that the program prints `add`.

```python
from functools import wraps

def polite(func):
    @___(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@polite
def add(a, b):
    return a + b

print(add.__name__)
```
%% answer
wraps
%% expected
add
%% explain
The decorator `wraps(func)` copies the name, the docstring and other details of `func` onto `wrapper`. Without it, the program would print `wrapper`.
%% end

## Decorators that you will really use

Four patterns cover most of the decorators in real programs. The first one **times** a function. It reads the clock, calls the function, reads the clock again, and reports the difference:

```python run
import time
from functools import wraps

def timed(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.3f} seconds")
        return result
    return wrapper

@timed
def slow_sum(n):
    return sum(range(n))

print(slow_sum(1_000_000))
```

The second one **counts** the calls. A function is an object, so the wrapper can carry an attribute that remembers the count:

```python run
from functools import wraps

def count_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0              # an attribute on the function object
    return wrapper

@count_calls
def hello():
    return "hi"

hello()
hello()
hello()
print(hello.calls)
```

The third one **caches** results, so that a slow function never does the same work twice. This is called **memoization**. The wrapper keeps a dictionary that maps the arguments to the answer, and a closure keeps that dictionary alive:

```python run
from functools import wraps

def memoize(func):
    cache = {}                       # one cache for this function, kept by the closure
    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(80))
```

Without the cache, `fib(80)` would make more calls than there are seconds in the age of the universe. With it, each value is worked out once. The standard library already has this tool, as `functools.cache` (and `lru_cache`, which also limits the memory). It even reports how well it works:

```python run
from functools import cache

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
print(fib.cache_info())
```

The fourth pattern **checks** the arguments before the function runs, and refuses to go on when they are wrong:

```python run error
from functools import wraps

def positive(func):
    @wraps(func)
    def wrapper(*args):
        for value in args:
            if value <= 0:
                raise ValueError(f"{func.__name__}: {value} is not positive")
        return func(*args)
    return wrapper

@positive
def area(width, height):
    return width * height

print(area(3, 4))
print(area(3, -4))
```

The checking code is written once, and the functions that need it only add a line. Notice that the error message uses `func.__name__`, which is one more reason to keep the name with `wraps`.

## Decorators with arguments

Sometimes the decorator itself needs a setting, such as how many times to repeat. You write `@repeat(3)`, with brackets. This works with **one more layer**: `repeat(3)` is a call that returns the real decorator, and that decorator is then applied to the function:

```python run
from functools import wraps

def repeat(times):                        # layer 1: takes the setting
    def decorator(func):                  # layer 2: takes the function
        @wraps(func)
        def wrapper(*args, **kwargs):     # layer 3: runs at every call
            result = None
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)                                # the same as: cheer = repeat(3)(cheer)
def cheer(name):
    print(f"Go, {name}!")

cheer("Ada")
```

Read the three layers from the outside in: the setting, the function, the call. It looks like a lot of nesting, but each layer has one clear job, and a closure carries `times` and `func` down to the wrapper.

%% question q-repeat-choice | choice
Which line does `@repeat(3)` above `def cheer(name):` stand for?
%% choice
`cheer = repeat(cheer, 3)`
%% choice correct
`cheer = repeat(3)(cheer)`
%% choice
`cheer = repeat(3, cheer)`
%% choice
`cheer = repeat(3).cheer`
%% explain
First `repeat(3)` is called, and it returns the decorator. That decorator is then called with the function, and its result replaces the name `cheer`. So the shorthand means `cheer = repeat(3)(cheer)`.
%% end

## Stacking decorators

You can put several decorators above one function. They are applied from the **bottom up**: the one nearest to the `def` wraps the function first, and the next one wraps the result:

```python run
def bold(func):
    def wrapper():
        return "<b>" + func() + "</b>"
    return wrapper

def italic(func):
    def wrapper():
        return "<i>" + func() + "</i>"
    return wrapper

@bold
@italic
def hello():
    return "hello"          # the same as: hello = bold(italic(hello))

print(hello())
```

The result is `<b><i>hello</i></b>`: the `italic` wrapper is **inside** and the `bold` wrapper is **outside**. When a call is made, the outer wrapper runs first and calls the inner one. The order matters whenever the decorators do different things to the result.

%% question q-stack-predict | predict
What does this program print?

```python
def add_one(func):
    def wrapper(x):
        return func(x) + 1
    return wrapper

def double(func):
    def wrapper(x):
        return func(x) * 2
    return wrapper

@add_one
@double
def value(x):
    return x

print(value(5))
```
%% answer
11
%% explain
The decorator nearest to the `def`, `double`, wraps first. So `value` is `add_one(double(value))`. A call runs the outer wrapper `add_one`, which calls the inner wrapper `double`, which calls the original. The original gives 5, `double` makes it 10, and then `add_one` makes it 11.
%% end

## Classes as decorators

A decorator only has to be something that can be **called** with a function. A class with `__call__` (from the last lesson) qualifies, and it keeps its state in plain attributes, which some people find clearer than a closure:

```python run
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.calls = 0

    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.func(*args, **kwargs)

@CountCalls
def greet(name):
    return f"Hello, {name}"

print(greet("Ada"), greet("Ben"))
print(greet.calls)
```

Here `@CountCalls` creates an **object** from the function, and the name `greet` now points at that object. Each call of `greet(...)` runs its `__call__` method.

A decorator can also be applied to a **class**. It receives the class, and usually hands it back unchanged after doing something with it. That is how `@dataclass` works. A simple version is a **registry** that records every class that it decorates:

```python run
registry = {}

def register(cls):
    registry[cls.__name__.lower()] = cls    # remember the class
    return cls                              # hand the class back unchanged

@register
class Circle:
    def area(self):
        return 3.14

@register
class Square:
    def area(self):
        return 1

print(sorted(registry))
shape = registry["circle"]()                # make an object from the stored class
print(shape.area())
```

## The decorators that Python gives you

Every decorator that you met earlier is **only a function** (or class) applied to the thing below it. They follow the same rule as the ones that you write:

| Decorator | What it does |
| --- | --- |
| `@property` | a method that is read like an attribute |
| `@classmethod` | a method that receives the class |
| `@staticmethod` | a function that lives inside a class |
| `@dataclass` | writes `__init__`, `__repr__` and more for a class |
| `@abstractmethod` | a method that subclasses must write |
| `@functools.wraps` | copies the name and docstring onto a wrapper |
| `@functools.cache` | remembers the results of a function |
| `@contextmanager` | turns a generator function into a context manager (lesson 4) |

When you see an unfamiliar decorator in a library, read it as an ordinary call: `name = decorator(name)`. Then look at what the decorator is, and what it returns.

## Putting it together: a route registry

Web frameworks use decorators to connect addresses to functions: you write `@app.route("/about")` above a function, and the framework calls it when a visitor asks for that address. Here is the idea in a few lines. The decorator does **not** wrap the function. It stores it in a dictionary, and returns it unchanged:

```python run
routes = {}

def route(path):
    def decorator(func):
        routes[path] = func          # register the function under its address
        return func                  # no wrapper needed
    return decorator

@route("/")
def home():
    return "Welcome home"

@route("/about")
def about():
    return "About us"

def handle(path):
    handler = routes.get(path)
    if handler is None:
        return "404 Not found"
    return handler()

for path in ["/", "/about", "/missing"]:
    print(path, "->", handle(path))
print(home())                        # the function still works as normal
```

%% question q-decor-multi | multi
Select every statement about decorators that is **true**.
%% choice correct
`@decorator` above `def f():` is shorthand for `f = decorator(f)`
%% choice correct
A decorator can return the original function unchanged, for example when it only registers it
%% choice correct
A decorator that takes arguments needs one more layer: a function that returns the decorator
%% choice
The decorator function runs again every time that the decorated function is called
%% choice
Without `functools.wraps`, a decorated function no longer works
%% explain
The decorator itself runs once, when the function is defined. It is the **wrapper** that it returns which runs at each call. Without `wraps` the function still works, but it loses its name and docstring.
%% end

%% question q-name-predict | predict
What does this program print?

```python
def plain(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@plain
def greet():
    pass

print(greet.__name__)
```
%% answer
wrapper
%% explain
The name `greet` now points at the function `wrapper` that `plain` returned, and nothing copied the original name onto it. Adding `@wraps(func)` above `def wrapper` would make this print `greet`.
%% end

## Your turn

%% exercise call-counter | Call counter
Write a decorator `count_calls` that counts how many times the decorated function is called. The count is kept in an attribute `calls` of the decorated function, and it starts at 0. The decorated function must keep its own name (use `functools.wraps`). The program below must print:

```output
0
2
say_hi
```
%% starter
from functools import wraps

def count_calls(func):
    # Wrap func, count the calls in wrapper.calls, and keep the name with @wraps.
    pass

@count_calls
def say_hi(name):
    return f"Hi, {name}"

print(say_hi.calls)
say_hi("Ada")
say_hi("Ben")
print(say_hi.calls)
print(say_hi.__name__)
%% solution
from functools import wraps

def count_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def say_hi(name):
    return f"Hi, {name}"

print(say_hi.calls)
say_hi("Ada")
say_hi("Ben")
print(say_hi.calls)
print(say_hi.__name__)
%% tests
expect_output("0\n2\nsay_hi")
@count_calls
def add(a, b=0):
    return a + b
expect(add(2, b=3), 5)
expect(add(4), 4)
expect(add.calls, 2)
expect(add.__name__, "add")
@count_calls
def other():
    return None
expect(other.calls, 0)
%% hint
The wrapper needs `*args` and `**kwargs`, and it must return whatever `func` returns.
%% hint
A function is an object, so it can have an attribute: set `wrapper.calls = 0` after the definition of `wrapper`, and add 1 to `wrapper.calls` inside it.
%% hint
Put `@wraps(func)` on the line above `def wrapper`, so that the decorated function keeps its name. Do not forget `return wrapper` at the end.
%% end

%% exercise repeat-n | Repeat n times
Write a decorator **with an argument**, `repeat(times)`. The decorated function runs `times` times for each call, and the call returns a **list** with all of the results. Keep the name of the function with `functools.wraps`. The program below must print:

```output
[4, 4, 4]
Hello, Ada
Hello, Ada
[3, 3]
```
%% starter
from functools import wraps

def repeat(times):
    # Three layers: repeat(times) returns a decorator, which returns a wrapper.
    pass

@repeat(3)
def roll():
    return 4

print(roll())

@repeat(2)
def greet(name):
    print("Hello,", name)
    return len(name)

print(greet("Ada"))
%% solution
from functools import wraps

def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return [func(*args, **kwargs) for _ in range(times)]
        return wrapper
    return decorator

@repeat(3)
def roll():
    return 4

print(roll())

@repeat(2)
def greet(name):
    print("Hello,", name)
    return len(name)

print(greet("Ada"))
%% tests
expect_output("[4, 4, 4]\nHello, Ada\nHello, Ada\n[3, 3]")
@repeat(0)
def nothing():
    return 1
expect(nothing(), [])
seen = []
@repeat(4)
def record(x):
    seen.append(x)
    return x * 2
expect(record(5), [10, 10, 10, 10])
expect(len(seen), 4)
expect(record.__name__, "record")
@repeat(2)
def combine(a, b=1):
    return a + b
expect(combine(1, b=5), [6, 6])
%% hint
`repeat(times)` must return a **decorator**: a function that takes `func`. That decorator returns the wrapper, so there are three nested functions.
%% hint
The wrapper takes `*args, **kwargs`, calls `func(*args, **kwargs)` a number of times equal to `times`, and returns the results.
%% hint
A list comprehension does the repeating: `[func(*args, **kwargs) for _ in range(times)]`.
%% end

%% exercise command-registry | Command registry
Write a decorator `command(*names)` that stores the function in the dictionary `COMMANDS` under **every** name that it is given, and returns the function **unchanged**. Then write `run(line)`: it splits the line into words, finds the command named by the first word (in lower case), and calls it with the other words as arguments, **printing** the result. For an unknown command it prints `Unknown command: ` and the word as typed. A blank line does nothing. The program below must print:

```output
Hello, Ada!
Hello, stranger!
42
Unknown command: jump
```
%% starter
COMMANDS = {}

def command(*names):
    # Register the function under every name, and return it unchanged.
    pass

def run(line):
    # Split the line, look up the first word, and call the command with the other words.
    pass

@command("hello", "hi")
def hello(name="stranger"):
    return f"Hello, {name}!"

@command("add")
def add(a, b):
    return int(a) + int(b)

run("hello Ada")
run("HI")
run("add 2 40")
run("jump")
run("")
%% solution
COMMANDS = {}

def command(*names):
    def decorator(func):
        for name in names:
            COMMANDS[name] = func
        return func
    return decorator

def run(line):
    words = line.split()
    if not words:
        return
    name, *arguments = words
    func = COMMANDS.get(name.lower())
    if func is None:
        print(f"Unknown command: {name}")
    else:
        print(func(*arguments))

@command("hello", "hi")
def hello(name="stranger"):
    return f"Hello, {name}!"

@command("add")
def add(a, b):
    return int(a) + int(b)

run("hello Ada")
run("HI")
run("add 2 40")
run("jump")
run("")
%% tests
expect_output("Hello, Ada!\nHello, stranger!\n42\nUnknown command: jump")
expect(sorted(COMMANDS), ["add", "hello", "hi"])
check(COMMANDS["hi"] is COMMANDS["hello"], "both names lead to the same function")
expect(hello("Ben"), "Hello, Ben!")
@command("shout")
def shout(*words):
    return " ".join(words).upper()
check(COMMANDS["shout"] is shout, "the decorator returns the function unchanged")
import io, contextlib
buffer = io.StringIO()
with contextlib.redirect_stdout(buffer):
    run("SHOUT go now")
    run("   ")
    run("Nothing here")
expect(buffer.getvalue(), "GO NOW\nUnknown command: Nothing\n")
%% hint
`command(*names)` returns a decorator. The decorator stores `func` in `COMMANDS[name]` for every name, and then returns `func` itself: this decorator needs no wrapper.
%% hint
In `run`, check for an empty line first. Then `name, *arguments = line.split()` takes the first word and keeps the rest in a list.
%% hint
Look the command up with `COMMANDS.get(name.lower())`. When you get `None`, print the unknown-command message. Otherwise print `func(*arguments)`.
%% end

%% exercise smart-cache | Challenge: A smart cache
Write a decorator `memoize` that remembers the results of a function. When the function is called again with the **same arguments**, the stored result is returned, and the function does not run again. It must work with positional **and** keyword arguments. The decorated function gets two attributes: `hits`, the number of calls that were answered from the memory, and `misses`, the number of calls that had to run the function. Keep the name and docstring (use `functools.wraps`). Write the cache yourself: do not use `functools.cache` or `lru_cache`. The program below must print:

```output
1548008755920
58 61
1548008755920 59
```
%% starter
from functools import wraps

def memoize(func):
    # Keep a dictionary of results. Count the hits and misses on the wrapper.
    pass

@memoize
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(60))
print(fib.hits, fib.misses)
print(fib(60), fib.hits)
%% solution
from functools import wraps

def memoize(func):
    cache = {}

    @wraps(func)
    def wrapper(*args, **kwargs):
        key = (args, tuple(sorted(kwargs.items())))
        if key in cache:
            wrapper.hits += 1
        else:
            wrapper.misses += 1
            cache[key] = func(*args, **kwargs)
        return cache[key]

    wrapper.hits = 0
    wrapper.misses = 0
    return wrapper

@memoize
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(60))
print(fib.hits, fib.misses)
print(fib(60), fib.hits)
%% tests
expect_output("1548008755920\n58 61\n1548008755920 59")
calls = []
@memoize
def square(n):
    """Return n squared."""
    calls.append(n)
    return n * n
expect(square(4), 16)
expect(square(4), 16)
expect(square(5), 25)
expect(calls, [4, 5])
expect((square.hits, square.misses), (1, 2))
expect(square.__name__, "square")
expect(square.__doc__, "Return n squared.")
@memoize
def power(base, exponent=2):
    return base ** exponent
expect(power(3, exponent=3), 27)
expect(power(3, exponent=3), 27)
expect(power(3), 9)
expect((power.hits, power.misses), (1, 2))
@memoize
def joined(*words):
    return "-".join(words)
expect(joined("a", "b"), "a-b")
expect(joined("a", "b"), "a-b")
expect(joined.hits, 1)
text = source()
check("lru_cache" not in text and "import cache" not in text and "functools.cache" not in text, "write the cache yourself, without functools.cache or lru_cache")
%% hint
Keep a dictionary `cache` in the decorator, outside the wrapper, so that every call of one function shares it. A good key is `(args, tuple(sorted(kwargs.items())))`, because a tuple can be a dictionary key.
%% hint
Count with attributes of the wrapper: set `wrapper.hits = 0` and `wrapper.misses = 0` before you return it, and add 1 inside the wrapper.
%% hint
If the key is in the cache, add 1 to `hits`. Otherwise add 1 to `misses`, call the function, and store the result. At the end, return the stored result. Put `@wraps(func)` above the wrapper.
%% end

## What you learned

- A **decorator** is a function that takes a function and returns a replacement, usually a **wrapper** that calls the original. The line `@decorator` above a `def` means `name = decorator(name)`.
- The decorator runs **once**, when the function is defined. The wrapper that it returns runs at **every call**.
- A general wrapper takes `*args` and `**kwargs`, passes them on, and **returns** the result of the original.
- Put `@functools.wraps(func)` above the wrapper, so that the decorated function keeps its name and docstring.
- Useful patterns: **timing**, **counting calls** (an attribute on the wrapper), **caching** (`functools.cache` does it for you) and **checking** the arguments. A decorator can also **register** a function and return it unchanged, as a route registry does.
- A decorator **with arguments**, such as `@repeat(3)`, has one more layer: `repeat(3)` returns the real decorator, so it means `name = repeat(3)(name)`.
- Stacked decorators apply from the **bottom up**: the one nearest to the `def` is the innermost wrapper.
- A class with `__call__` can be a decorator, and a decorator can be applied to a **class**. The built-in decorators, such as `@property` and `@dataclass`, follow the same rule.
