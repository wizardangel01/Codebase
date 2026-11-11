---
title: Context managers and async
---
This lesson is about two kinds of **tidiness** in a program. The first is tidiness in **resources**: a file that must be closed, a setting that must be put back, a lock that must be released, even when something goes wrong in the middle. That is the job of the `with` statement and the **context managers** behind it. The second is tidiness in **time**: a program that waits for a slow answer (a web page, a database, a timer) should not sit idle while it could do something else. That is the job of **async** code, with `async`, `await` and the module `asyncio`. Both ideas build on the decorators and generators that you already know.

## Context managers again

You have used `with open(...) as f:` since module 8, and you wrote a context manager class with `__enter__` and `__exit__` in module 13. Remember the promise: the cleanup code runs **whatever happens** inside the block, even when it raises an error. Writing a whole class for a small job is long, so the module `contextlib` offers a shorter way. The decorator `@contextmanager` turns a **generator function** into a context manager:

```python run
from contextlib import contextmanager

@contextmanager
def labelled(label):
    print(f"[{label}] start")     # runs when the with block starts
    try:
        yield                     # the body of the with block runs here
    finally:
        print(f"[{label}] done")  # runs when the block ends, whatever happens

with labelled("backup"):
    print("working...")
```

The code before `yield` plays the part of `__enter__`, and the code after it plays the part of `__exit__`. At the `yield`, the generator pauses and the body of the `with` block runs. If the body raises an error, the error is thrown back **into the generator at the `yield`**, which is why the `try` and `finally` are there. They guarantee that the closing line runs:

```python run
from contextlib import contextmanager

@contextmanager
def labelled(label):
    print(f"[{label}] start")
    try:
        yield
    finally:
        print(f"[{label}] done")

try:
    with labelled("risky"):
        print("about to fail")
        raise RuntimeError("boom")
except RuntimeError as error:
    print("caught:", error)
```

A context manager can also **hand a value** to the name after `as`: whatever you write after `yield` is that value. This one changes some settings for the length of a block, and puts them back afterwards, even after an error:

```python run
from contextlib import contextmanager

settings = {"debug": False, "colour": "blue"}

@contextmanager
def override(**changes):
    saved = {key: settings[key] for key in changes}
    settings.update(changes)
    try:
        yield settings            # this value goes to the name after "as"
    finally:
        settings.update(saved)    # put the old values back

print(settings)
with override(debug=True, colour="red") as current:
    print(current)
print(settings)

try:
    with override(debug=True):
        raise RuntimeError("boom")
except RuntimeError:
    print("after the error:", settings)
```

%% question q-tag-predict | predict
What does this program print?

```python
from contextlib import contextmanager

@contextmanager
def tag(name):
    print(f"<{name}>")
    try:
        yield
    finally:
        print(f"</{name}>")

try:
    with tag("p"):
        print("text")
        raise ValueError
except ValueError:
    print("error")
```
%% answer
<p>
text
</p>
error
%% explain
The opening tag is printed first, and then the body prints `text` and raises the error. The error is thrown into the generator at the `yield`, so the `finally` part prints the closing tag. After that the error goes on to the `except` line outside the `with`, which prints `error`.
%% end

%% question q-cm-order | order
Put the lines in order so that the program prints `start`, `middle` and `end`, one on each line. One line does not belong.
%% lines
from contextlib import contextmanager
@contextmanager
def quiet():
    print("start")
    try:
        yield
    finally:
        print("end")
with quiet():
    print("middle")
%% distractors
@contextmanager()
%% expected
start
middle
end
%% explain
The import comes first, then the decorator line right above the `def`, then the body of the generator: the opening message, the `try` with the `yield`, and the `finally` with the closing message. The `with` statement that uses the manager comes last. The distractor `@contextmanager()` has brackets, so it would call `contextmanager` with no argument and raise a `TypeError`.
%% end

### Swallowing an error on purpose

When the generator **catches** the error that was thrown in at the `yield`, the `with` statement carries on after the block as if nothing had happened. This is how `contextlib.suppress` is written, and you can write your own:

```python run
from contextlib import contextmanager

@contextmanager
def ignore(*kinds):
    try:
        yield
    except kinds as error:
        print("ignored", type(error).__name__)

with ignore(ZeroDivisionError, KeyError):
    print(1 / 0)
    print("never printed")
print("carried on")
```

Use this with care. An `except` that hides every error makes bugs hard to find, so name the exact kinds of error that you expect, as `suppress(FileNotFoundError)` does.

## More tools in contextlib

The module has a few ready-made managers that you will use again and again:

```python run
import io
from contextlib import redirect_stdout, nullcontext, ExitStack

# redirect_stdout: send everything that print writes into a buffer
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("captured!")
    print("also captured")
print(repr(buffer.getvalue()))

# nullcontext: a manager that does nothing, for code that sometimes needs one
with nullcontext("plain") as value:
    print(value)

# ExitStack: open as many managers as you need, and close them all at the end
names = ["one.txt", "two.txt", "three.txt"]
with ExitStack() as stack:
    files = [stack.enter_context(open(name, "w")) for name in names]
    for number, f in enumerate(files, start=1):
        f.write(f"file {number}\n")
print([f.closed for f in files])
```

A single `with` can also hold several managers, separated by commas. They are entered from left to right, and left again in the **opposite** order, like a stack of boxes:

```python run
from contextlib import contextmanager

@contextmanager
def labelled(label):
    print(f"[{label}] start")
    try:
        yield
    finally:
        print(f"[{label}] done")

with labelled("outer"), labelled("inner"):
    print("both are open")
```

## Waiting without wasting time

Now for the second kind of tidiness. Imagine a cook who puts a pot on the stove, and then stands and stares at it for ten minutes. Better: put the pot on, chop the vegetables while the water heats, and come back when it boils. The cook is still one person doing one thing at a time, but no time is wasted waiting.

Programs often wait: for a web server to answer, for a file to arrive, for a timer. A normal program waits **doing nothing**. **Asynchronous** code lets the program start something slow, and **switch to other work** while it waits. This is called **concurrency**. It is not the same as running on several processors at once, which is called parallelism. With async, one thread does one thing at a time, and the gain comes from filling the waiting time.

The tools are `async def`, `await` and the module `asyncio`:

- A function defined with **`async def`** is a **coroutine function**. Calling it does **not** run it. It gives back a **coroutine object**, a recipe that is waiting to be run.
- The keyword **`await`** runs a coroutine, and **pauses** the current one until the answer is ready. While it is paused, other coroutines get a turn.
- The **event loop** is the manager that decides whose turn it is. The call `asyncio.run(main())` starts the loop and runs `main` to the end.

```python run
import asyncio

async def hello():
    return "hello"

coroutine = hello()             # nothing has run yet
print(type(coroutine).__name__)
print(asyncio.run(coroutine))   # now the event loop runs it
```

You can only use `await` inside an `async def` function (with one exception, described at the end of this lesson). The next program shows the gain. Making tea and coffee takes time, and `asyncio.sleep` is the polite way to wait, because it **hands control back** to the event loop:

```python run
import asyncio
import time

async def make_tea(name, seconds):
    print(f"{name}: start")
    await asyncio.sleep(seconds)
    print(f"{name}: ready")
    return name

async def main():
    start = time.perf_counter()
    await make_tea("tea", 0.3)
    await make_tea("coffee", 0.2)
    print(f"one after the other: {time.perf_counter() - start:.1f} s")

    start = time.perf_counter()
    drinks = await asyncio.gather(make_tea("tea", 0.3), make_tea("coffee", 0.2))
    print(drinks, f"together: {time.perf_counter() - start:.1f} s")

asyncio.run(main())
```

Two awaits **in a row** take the sum of the times, about 0.5 seconds. The function `asyncio.gather` runs several coroutines **together** and returns their results in a list, in the order that you gave them. Together they take as long as the slowest one, about 0.3 seconds. Look at the order of the messages: both drinks start before either one is ready.

%% key await is where the switching happens
A coroutine runs without interruption until it reaches an `await` that has to wait. Only at that point can another coroutine take its turn. So code that **never awaits** never lets anyone else run.
%% end

### Tasks

The function `gather` is the most common tool, but you can also start a coroutine in the background with `asyncio.create_task`. It begins to run at the next chance, and you collect the result later with `await`:

```python run
import asyncio

async def worker(name, delay):
    await asyncio.sleep(delay)
    print(name, "finished")

async def main():
    first = asyncio.create_task(worker("first", 0.2))
    second = asyncio.create_task(worker("second", 0.1))
    print("both started")
    await first
    await second
    print("all done")

asyncio.run(main())
```

The program prints `both started` before anything finishes, and `second` finishes before `first`, because its delay is shorter, although it was started later.

### Timeouts

Waiting for ever is a bug. The call `asyncio.wait_for(coroutine, timeout)` gives up after a number of seconds, and raises `TimeoutError`:

```python run
import asyncio

async def slow():
    await asyncio.sleep(5)
    return "finished"

async def main():
    try:
        result = await asyncio.wait_for(slow(), timeout=0.1)
    except TimeoutError:
        result = "gave up"
    print(result)

asyncio.run(main())
```

## Two classic mistakes

**Mistake 1: forgetting `await`.** Calling a coroutine function without `await` only creates the coroutine object, and nothing runs. Python warns you that the coroutine was never awaited, but the program carries on:

```python run
import asyncio

async def save(name):
    print("saving", name)

async def main():
    save("report")            # forgotten await: this line does nothing
    await save("invoice")

asyncio.run(main())
```

Only the invoice is saved. Look for the warning `coroutine ... was never awaited` in the red text under the output.

**Mistake 2: blocking the loop.** The ordinary `time.sleep` stops the **whole** thread, so no other coroutine can run while it sleeps. Compare two tickers that run together. With `await asyncio.sleep` they take turns. With `time.sleep` the first one hogs the loop until it has finished:

```python run
import asyncio
import time

async def polite(name):
    for i in range(3):
        print(name, i)
        await asyncio.sleep(0.01)    # hands control back

async def rude(name):
    for i in range(3):
        print(name, i)
        time.sleep(0.01)             # blocks every other coroutine

async def main():
    print("polite:")
    await asyncio.gather(polite("a"), polite("b"))
    print("rude:")
    await asyncio.gather(rude("a"), rude("b"))

asyncio.run(main())
```

The same warning applies to any slow call that has no `await`: a long calculation, or a library that reads the network in the normal way, blocks everything. Async helps with **waiting**. It does nothing for code that is busy calculating.

%% question q-noawait-choice | choice
What happens when you call a coroutine function, such as `save("report")`, without `await` in front of it?
%% choice
The body runs at once, but the program does not wait for the result
%% choice correct
A coroutine object is created, and the body does not run at all
%% choice
Python raises a `SyntaxError` before the program starts
%% choice
The body runs later, when the event loop is free
%% explain
Calling a function that is defined with `async def` only builds a coroutine object. The body starts when something awaits that object, or when `asyncio.run` or a task runs it. Without that, the code never runs, and Python prints a warning that the coroutine was never awaited.
%% end

%% question q-tasks-predict | predict
What does this program print?

```python
import asyncio

async def say(word, delay):
    await asyncio.sleep(delay)
    print(word)

async def main():
    first = asyncio.create_task(say("one", 0.02))
    second = asyncio.create_task(say("two", 0.01))
    print("started")
    await first
    await second

asyncio.run(main())
```
%% answer
started
two
one
%% explain
Creating a task does not wait for it, so `started` is printed first. Both tasks are sleeping at the same time. The task `two` has the shorter delay, so it prints first, and `one` follows. Awaiting `first` before `second` only decides when `main` continues, and not when the tasks finish.
%% end

## async for and async with

Two more pieces of syntax have an `async` version. An **async generator** is a function with both `async def` and `yield`. You loop over it with **`async for`**, and the loop can wait for each item:

```python run
import asyncio

async def countdown(n):
    while n > 0:
        yield n                      # an async generator
        await asyncio.sleep(0.01)    # it may wait between the items
        n -= 1

async def main():
    async for number in countdown(3):
        print(number)

asyncio.run(main())
```

And **`async with`** is a context manager whose entering and leaving may have to wait. A useful one is the **semaphore**, a counter of free places. It lets only a few coroutines into a block at the same time, which is how a program avoids sending a hundred requests at once:

```python run
import asyncio

active = 0
peak = 0

async def job(number, gate):
    global active, peak
    async with gate:                   # at most 2 jobs are inside at a time
        active += 1
        peak = max(peak, active)
        await asyncio.sleep(0.05)
        active -= 1
    return number * number

async def main():
    gate = asyncio.Semaphore(2)
    results = await asyncio.gather(*(job(n, gate) for n in range(6)))
    print(results, "peak:", peak)

asyncio.run(main())
```

Six jobs were started, but the semaphore only let two of them in at a time, so the peak is 2. The results still come back in the order of the jobs.

%% note Running async code on this site
On your own computer, a program starts the event loop with `asyncio.run(main())`, and that works here too. This site also allows `await` at the **top level** of a program, which a normal Python file does not. So `number = await fetch_number()` works in the editor. Remember that it is a convenience of this site, and that in a real file you need `asyncio.run`.
%% end

```python run
import asyncio

async def fetch_number():
    await asyncio.sleep(0.05)
    return 42

number = await fetch_number()        # allowed on this site, at the top level
print(number)
```

## When is async worth it?

Use async when your program spends most of its time **waiting**, and when it has **many** things to wait for: many web requests, many connections from users, many timers. A chat server that talks to thousands of people is the classic case. Do not use it to speed up heavy calculation: for that you need more processors, and async gives you none. Do not use it when a program does one thing at a time anyway, because it only adds `async` and `await` to the code. Note also that the web libraries for async code are separate from the usual ones. On your own computer you would use packages such as `aiohttp` or `httpx`, which are not available in this browser.

%% question q-when-multi | multi
Select every job where async code is a **good** fit.
%% choice correct
Downloading fifty web pages, where most of the time is spent waiting for the servers
%% choice correct
A chat server that keeps thousands of connections open and waits for messages
%% choice correct
Showing a countdown timer next to a slow answer from a server, without freezing
%% choice
Adding up the numbers from 1 to a billion
%% choice
Making one calculation faster by calling `time.sleep` inside a coroutine
%% explain
Async gains time when a program **waits**, because other work can happen in the meantime. A long calculation does not wait: it keeps the processor busy, so async cannot help. The call `time.sleep` blocks the loop, so it makes things worse.
%% end

%% question q-await-fill | fill
Fill in the blank so that the program prints `42`.

```python
import asyncio

async def answer():
    await asyncio.sleep(0.01)
    return 42

async def main():
    value = ___ answer()
    print(value)

asyncio.run(main())
```
%% answer
await
%% expected
42
%% explain
The keyword `await` runs the coroutine and pauses `main` until the answer is ready. Without it, `value` would hold a coroutine object, and Python would warn that it was never awaited.
%% end

## Your turn

%% exercise labelled-section | A tidy section
Write a context manager with the decorator `@contextmanager`. The function `section(title)` prints `== title ==` when the block starts, and `-- title done --` when it ends, **even if the block raises an error**. It also gives the title **in capitals** to the name after `as`. The program below must print:

```output
== Setup ==
loading data for SETUP
-- Setup done --
== Cleanup ==
-- Cleanup done --
Error caught: disk full
```
%% starter
from contextlib import contextmanager

@contextmanager
def section(title):
    # Print "== title ==", then yield the title in capitals, then print "-- title done --".
    pass

with section("Setup") as name:
    print("loading data for", name)

try:
    with section("Cleanup"):
        raise OSError("disk full")
except OSError as error:
    print("Error caught:", error)
%% solution
from contextlib import contextmanager

@contextmanager
def section(title):
    print(f"== {title} ==")
    try:
        yield title.upper()
    finally:
        print(f"-- {title} done --")

with section("Setup") as name:
    print("loading data for", name)

try:
    with section("Cleanup"):
        raise OSError("disk full")
except OSError as error:
    print("Error caught:", error)
%% tests
expect_output("== Setup ==\nloading data for SETUP\n-- Setup done --\n== Cleanup ==\n-- Cleanup done --\nError caught: disk full")
import io, contextlib
buffer = io.StringIO()
with contextlib.redirect_stdout(buffer):
    with section("x") as value:
        print("inside", value)
expect(buffer.getvalue(), "== x ==\ninside X\n-- x done --\n")
buffer = io.StringIO()
with contextlib.redirect_stdout(buffer):
    try:
        with section("y"):
            raise ValueError("bad")
    except ValueError:
        print("caught")
expect(buffer.getvalue(), "== y ==\n-- y done --\ncaught\n")
%% hint
`@contextmanager` turns a generator function into a context manager. The code before `yield` runs when the block starts, and the code after it runs when the block ends.
%% hint
Put the `yield` inside `try:` and the closing line inside `finally:`, so that the closing line is also printed when the block raises an error.
%% hint
Whatever you write after `yield` goes to the name after `as`. Use `yield title.upper()`.
%% end

%% exercise coffee-steps | Coffee in steps
Write two coroutines, `grind(beans)` and `brew(grounds)`. Each one waits a moment with `await asyncio.sleep(0.01)` and then returns a text: `grind` returns `ground ` followed by the beans, and `brew` returns `brewed from ` followed by the grounds. Then write `main()`, which awaits the two steps one after the other, and prints each result, and then a last line that starts with `Enjoy: `. The program below must print:

```output
ground arabica
brewed from ground arabica
Enjoy: brewed from ground arabica
```
%% starter
import asyncio

async def grind(beans):
    # Wait a moment, then return "ground " and the beans.
    pass

async def brew(grounds):
    # Wait a moment, then return "brewed from " and the grounds.
    pass

async def main():
    # Await the steps one after the other and print the three lines.
    pass

asyncio.run(main())
%% solution
import asyncio

async def grind(beans):
    await asyncio.sleep(0.01)
    return f"ground {beans}"

async def brew(grounds):
    await asyncio.sleep(0.01)
    return f"brewed from {grounds}"

async def main():
    grounds = await grind("arabica")
    print(grounds)
    coffee = await brew(grounds)
    print(coffee)
    print("Enjoy:", coffee)

asyncio.run(main())
%% tests
expect_output("ground arabica\nbrewed from ground arabica\nEnjoy: brewed from ground arabica")
import inspect
check(inspect.iscoroutinefunction(grind), "grind must be defined with async def")
check(inspect.iscoroutinefunction(brew), "brew must be defined with async def")
check(inspect.iscoroutinefunction(main), "main must be defined with async def")
check(uses("Await"), "use await")
check("time.sleep" not in source(), "wait with await asyncio.sleep, not time.sleep")
%% hint
Define each step with `async def`, wait with `await asyncio.sleep(0.01)`, and then `return` the text. Use an f-string, such as `f"ground {beans}"`.
%% hint
In `main`, call each step with `await`: `grounds = await grind("arabica")`. Without `await`, you get a coroutine object and not a text.
%% hint
Print `grounds`, then call `coffee = await brew(grounds)` and print it, and finally `print("Enjoy:", coffee)`.
%% end

%% exercise fetch-all | Fetch them all
The coroutine `fetch(name, delay)` below pretends to download something: it records when it starts and ends, waits for `delay` seconds, and returns the length of the name. Write `fetch_all(requests)`, where `requests` is a list of `(name, delay)` pairs. It must run **all the fetches at the same time**, and return the list of results **in the order of the requests**. The program prints the results and the order of the events, so you can see that the fetches overlap:

```output
[5, 2, 3]
['start alpha', 'start be', 'start cat', 'end be', 'end cat', 'end alpha']
```
%% starter
import asyncio

events = []

async def fetch(name, delay):
    events.append(f"start {name}")
    await asyncio.sleep(delay)
    events.append(f"end {name}")
    return len(name)

async def fetch_all(requests):
    # Start every fetch at the same time. Return the results in the order of the requests.
    pass

async def main():
    results = await fetch_all([("alpha", 0.03), ("be", 0.01), ("cat", 0.02)])
    print(results)
    print(events)

asyncio.run(main())
%% solution
import asyncio

events = []

async def fetch(name, delay):
    events.append(f"start {name}")
    await asyncio.sleep(delay)
    events.append(f"end {name}")
    return len(name)

async def fetch_all(requests):
    return await asyncio.gather(*(fetch(name, delay) for name, delay in requests))

async def main():
    results = await fetch_all([("alpha", 0.03), ("be", 0.01), ("cat", 0.02)])
    print(results)
    print(events)

asyncio.run(main())
%% tests
expect_output("[5, 2, 3]\n['start alpha', 'start be', 'start cat', 'end be', 'end cat', 'end alpha']")
import inspect
check(inspect.iscoroutinefunction(fetch_all), "fetch_all must be defined with async def")
check("time.sleep" not in source(), "do not use time.sleep")
%% hint
If you await the fetches one after the other, each one finishes before the next one starts, and the events do not overlap. They must all start before any of them ends.
%% hint
`asyncio.gather(a, b, c)` runs coroutines together and returns their results in the order that you gave them. To pass a whole list, put a star before it: `asyncio.gather(*coroutines)`.
%% hint
Build the coroutines with a generator expression, `(fetch(name, delay) for name, delay in requests)`, and `await asyncio.gather(*...)` of it. Return the result.
%% end

%% exercise polite-crawler | Challenge: A polite crawler
A crawler that downloads a hundred pages at the same time will be blocked by most websites. Write `crawl(urls, fetch, limit)`: it downloads every page with the coroutine function `fetch(url)`, with **at most `limit` downloads running at the same time**, and returns the pages **in the order of `urls`**. The program below measures the highest number of downloads that were running together (`peak`), and must print:

```output
['A.COM', 'B.COM', 'C.COM', 'D.COM', 'E.COM']
peak: 2
```
%% starter
import asyncio

running = 0
peak = 0

async def fetch(url):
    global running, peak
    running += 1
    peak = max(peak, running)
    await asyncio.sleep(0.02)
    running -= 1
    return url.upper()

async def crawl(urls, fetch, limit):
    # Run fetch(url) for every url, with at most `limit` running at the same time.
    # Return the pages in the order of the urls.
    pass

async def main():
    urls = ["a.com", "b.com", "c.com", "d.com", "e.com"]
    pages = await crawl(urls, fetch, 2)
    print(pages)
    print("peak:", peak)

asyncio.run(main())
%% solution
import asyncio

running = 0
peak = 0

async def fetch(url):
    global running, peak
    running += 1
    peak = max(peak, running)
    await asyncio.sleep(0.02)
    running -= 1
    return url.upper()

async def crawl(urls, fetch, limit):
    gate = asyncio.Semaphore(limit)

    async def polite_fetch(url):
        async with gate:
            return await fetch(url)

    return await asyncio.gather(*(polite_fetch(url) for url in urls))

async def main():
    urls = ["a.com", "b.com", "c.com", "d.com", "e.com"]
    pages = await crawl(urls, fetch, 2)
    print(pages)
    print("peak:", peak)

asyncio.run(main())
%% tests
expect_output("['A.COM', 'B.COM', 'C.COM', 'D.COM', 'E.COM']\npeak: 2")
import inspect
check(inspect.iscoroutinefunction(crawl), "crawl must be defined with async def")
check("time.sleep" not in source(), "do not use time.sleep")
check(calls("Semaphore"), "limit the downloads with asyncio.Semaphore")
%% hint
A **semaphore** is a counter of free places: `gate = asyncio.Semaphore(limit)`. The code inside `async with gate:` runs only when a place is free, and gives the place back when it ends.
%% hint
Write a small inner coroutine, `async def polite_fetch(url):`, that does `async with gate:` and then `return await fetch(url)`.
%% hint
Run them all with `await asyncio.gather(*(polite_fetch(url) for url in urls))`. The results come back in the order of `urls`, and the semaphore makes sure that only `limit` of them are inside at a time.
%% end

## What you learned

- A **context manager** guarantees cleanup. `@contextmanager` turns a generator function into one: the code before `yield` is the entry, the code after it (in `finally`) is the exit, and a value after `yield` goes to the name after `as`. An error in the block is thrown into the generator at the `yield`.
- `contextlib` also offers `suppress`, `redirect_stdout`, `nullcontext` and `ExitStack`. One `with` can hold several managers, and they are left in the opposite order.
- **Async** code fills waiting time: while one coroutine waits, another runs. This is **concurrency**, and it gives no speed-up to code that is busy calculating.
- `async def` makes a **coroutine function**. Calling it gives a coroutine object and runs nothing. `await` runs it and pauses the current coroutine until the answer is ready, and `asyncio.run(main())` starts the event loop.
- `asyncio.gather` runs coroutines together and returns the results in order. `asyncio.create_task` starts one in the background, and `asyncio.wait_for` adds a timeout.
- Two classic mistakes: forgetting `await` (the code never runs), and calling a blocking function such as `time.sleep` (it stops every coroutine).
- `async for` loops over an async generator, and `async with` enters an async context manager, such as an `asyncio.Semaphore` that limits how many coroutines work at once.
- Async fits programs that **wait for many things**, such as web requests and connections. On this site, `await` also works at the top level, but a normal Python file needs `asyncio.run`.
