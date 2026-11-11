---
title: Machine Shop
engine: judge
---
The machines of **Python Station** keep breaking down, and you are the engineer. Every work order asks for a tool that is built from the ideas of this module: closures that remember, decorators that wrap, dataclasses that describe parts, and context managers that tidy up. Read each order with care, then write the code that keeps the station running.

How to play:

- Press **Run**. The result panel lists every test. A red test shows what was expected and what your code gave, or the error that stopped it, together with the line of your code.
- Some tests are **hidden**. They check the edge cases, so follow every rule of the order, and do not only fit the visible examples.
- Every order has a **par**: the number of code lines of a clean solution. Reach it for three stars. Blank lines and comments do not count. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Ticket machine
The station's **ticket machine** prints numbered tickets. Write `make_ticket_machine(prefix)`, which returns a function. Each call of that function returns the next ticket: the prefix, a dash and the next number, starting from 1. Every machine counts for itself.

```text
north = make_ticket_machine("N")
north() returns "N-1"
north() returns "N-2"
south = make_ticket_machine("S")
south() returns "S-1"
```

Keep the count **inside a closure**. This order does not allow a class or a global variable.
%% config
mode: script
function: make_ticket_machine
par: 7
forbid: class global
forbid_note: The count must live in a closure (use nonlocal), not in a class or a global variable.
%% test First tickets
north = make_ticket_machine("N")
expect([north(), north()], ["N-1", "N-2"])
%% test Machines count separately
a = make_ticket_machine("A")
b = make_ticket_machine("B")
a()
a()
expect(b(), "B-1")
expect(a(), "A-3")
%% test hidden A longer prefix
gate = make_ticket_machine("Gate")
expect(gate(), "Gate-1")
%% test hidden A hundred tickets
machine = make_ticket_machine("X")
for _ in range(99):
    machine()
expect(machine(), "X-100")
%% test hidden A function comes back
check(callable(make_ticket_machine("Z")), "make_ticket_machine must return a function")
%% starter
def make_ticket_machine(prefix):
    # Return a function that gives "prefix-1", "prefix-2", ... on each call.
    pass

%% solution
def make_ticket_machine(prefix):
    number = 0

    def ticket():
        nonlocal number
        number += 1
        return f"{prefix}-{number}"

    return ticket
%% hint
The machine is a **closure**: define a counter variable inside `make_ticket_machine`, and an inner function that uses it. Return the inner function.
%% hint
Inside the inner function, write `nonlocal number` before you change `number`. Otherwise Python treats it as a new local variable.
%% hint
Add 1 first, and then build the ticket: `number += 1`, then `return f"{prefix}-{number}"`.
%% end

%% level l2 | Button panel
The control panel has one button for every label in a list, and pressing a button must report **its own label**. Write `make_panel(labels)`, which returns a list of functions, one for each label. Calling a function returns the label followed by ` pressed`.

```text
panel = make_panel(["start", "stop", "reset"])
panel[0]() returns "start pressed"
panel[2]() returns "reset pressed"
```

Beware of the **late-binding trap**: functions that are made in a loop share the loop variable. Give every button **its own copy** of the label.
%% config
mode: script
function: make_panel
par: 2
%% test Three buttons
panel = make_panel(["start", "stop", "reset"])
expect([button() for button in panel], ["start pressed", "stop pressed", "reset pressed"])
%% test One button
expect(make_panel(["go"])[0](), "go pressed")
%% test hidden The order
panel = make_panel(["a", "b", "c", "d"])
expect(len(panel), 4)
expect(panel[1](), "b pressed")
expect(panel[3](), "d pressed")
%% test hidden No buttons
expect(make_panel([]), [])
%% test hidden Pressed twice
panel = make_panel(["x", "y"])
expect(panel[0](), "x pressed")
expect(panel[0](), "x pressed")
%% test hidden The list changes later
labels = ["a", "b"]
panel = make_panel(labels)
labels[0] = "changed"
expect(panel[0](), "a pressed")
%% starter
def make_panel(labels):
    # Return a list of functions. Each one returns its own label and " pressed".
    pass

%% solution
def make_panel(labels):
    return [lambda label=label: f"{label} pressed" for label in labels]
%% hint
A lambda that is made in a loop looks up the loop variable **when it is called**, after the loop has finished, so every button reports the last label.
%% hint
A default argument is worked out **when the lambda is created**: `lambda label=label: ...` gives each button its own copy.
%% hint
Another cure is a small factory function, `make_button(label)`, that returns `lambda: f"{label} pressed"`. Call it for every label.
%% end

%% level l3 | Conveyor belt
Parts travel down a **conveyor belt**. Every **station** on the belt is a function that takes a part and returns the changed part, or `None` when the part is **rejected**. Write `conveyor(*stations)`, which returns a function. That function sends a part through the stations in order. As soon as a station returns `None`, the part is rejected: stop at once, and return `None`. With no stations, the part comes out unchanged.

```text
belt = conveyor(str.strip, lambda s: s or None, str.upper)
belt("  bolt ") returns "BOLT"
belt("   ") returns None
```

Only `None` rejects a part. Every other value, including `0` and an empty list, is a part.
%% config
mode: script
function: conveyor
par: 8
%% test A good part
belt = conveyor(str.strip, lambda s: s or None, str.upper)
expect(belt("  bolt "), "BOLT")
%% test A rejected part
belt = conveyor(str.strip, lambda s: s or None, str.upper)
expect(belt("   "), None)
%% test hidden Stops at once
seen = []
def reject(part):
    seen.append("reject")
    return None
def later(part):
    seen.append("later")
    return part
belt = conveyor(reject, later)
expect(belt(1), None)
expect(seen, ["reject"])
%% test hidden An empty belt
expect(conveyor()(5), 5)
%% test hidden Zero is a part
belt = conveyor(lambda n: n - 1, lambda n: n * 2)
expect(belt(1), 0)
%% test hidden An empty list is a part
belt = conveyor(lambda items: items[:0], len)
expect(belt([1, 2]), 0)
%% test hidden The belt is reusable
belt = conveyor(abs, str)
expect([belt(-1), belt(2)], ["1", "2"])
%% starter
def conveyor(*stations):
    # Return a function that sends a part through every station, and stops at None.
    pass

%% solution
def conveyor(*stations):
    def belt(part):
        for station in stations:
            part = station(part)
            if part is None:
                return None
        return part
    return belt
%% hint
`conveyor` returns an inner function that takes one part. The stations are remembered by the closure.
%% hint
Loop over the stations, and replace `part` with `station(part)` each time.
%% hint
After each station, test `part is None` and return `None` at once. Do not write `if not part`: zero and an empty list are valid parts.
%% end

%% level l4 | Safety wrapper
Every machine on the station must **announce** itself. Write a decorator `announce` that prints `Starting <name>` before the machine runs, and `Stopped <name>` after it, where `<name>` is the name of the function. The `Stopped` line is printed **even when the machine breaks down with an error**, and the error must still reach the caller. The decorated function keeps its name, takes any arguments, and returns what the machine returned. Use `functools.wraps`.

```text
@announce
def drill(depth):
    print("drilling", depth)
    return depth * 2

drill(5) prints:
Starting drill
drilling 5
Stopped drill
and returns 10
```
%% config
mode: script
function: announce
par: 10
require: wraps
%% test A normal run
@announce
def drill(depth):
    print("drilling", depth)
    return depth * 2
expect(printed(drill, 5), "Starting drill\ndrilling 5\nStopped drill\n")
%% test The result comes back
@announce
def double(n):
    return n * 2
result = []
text = printed(lambda: result.append(double(4)))
expect(result, [8])
expect(text, "Starting double\nStopped double\n")
%% test hidden A breakdown
import io, contextlib
@announce
def broken():
    raise ValueError("jam")
buffer = io.StringIO()
message = None
with contextlib.redirect_stdout(buffer):
    try:
        broken()
    except ValueError as error:
        message = str(error)
expect(buffer.getvalue(), "Starting broken\nStopped broken\n")
expect(message, "jam")
%% test hidden Arguments
@announce
def add(a, b=0):
    return a + b
out = []
printed(lambda: out.append(add(1, b=2)))
expect(out, [3])
%% test hidden The name is kept
@announce
def drill():
    """Drill a hole."""
    return 1
expect(drill.__name__, "drill")
expect(drill.__doc__, "Drill a hole.")
%% starter
from functools import wraps

def announce(func):
    # Return a wrapper that prints Starting and Stopped around the call.
    pass

%% solution
from functools import wraps

def announce(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Starting {func.__name__}")
        try:
            return func(*args, **kwargs)
        finally:
            print(f"Stopped {func.__name__}")
    return wrapper
%% hint
A decorator takes a function and returns a wrapper. The wrapper takes `*args, **kwargs`, and passes them on. Put `@wraps(func)` above it.
%% hint
Print the `Starting` line first. Then put the call in a `try:` block with `return func(*args, **kwargs)`.
%% hint
Print the `Stopped` line in a `finally:` block. It runs when the call works, and also when it raises an error, and the error then goes on to the caller.
%% end

%% level l5 | Wear and tear
Machines wear out. Write a decorator **with an argument**, `limit_uses(max_uses)`. The decorated function works for `max_uses` calls. The next call raises `RuntimeError("worn out")` **without running the function**, and so does every call after it. Every decorated function counts its own uses, and keeps its name and docstring.

```text
@limit_uses(2)
def stamp():
    return "stamped"

stamp() returns "stamped"
stamp() returns "stamped"
stamp() raises RuntimeError("worn out")
```
%% config
mode: script
function: limit_uses
par: 13
%% test Two uses
@limit_uses(2)
def stamp():
    return "stamped"
expect(stamp(), "stamped")
expect(stamp(), "stamped")
check(raises(RuntimeError, stamp), "the third call must raise RuntimeError")
%% test The message
@limit_uses(1)
def press():
    return 1
press()
try:
    press()
except RuntimeError as error:
    expect(str(error), "worn out")
else:
    check(False, "the second call must raise RuntimeError")
%% test hidden A worn machine does not run
calls = []
@limit_uses(2)
def work(x):
    calls.append(x)
    return x
work(1)
work(2)
raises(RuntimeError, work, 3)
raises(RuntimeError, work, 4)
expect(calls, [1, 2])
%% test hidden Separate counters
once = limit_uses(1)
@once
def one():
    return "one"
@once
def two():
    return "two"
one()
expect(two(), "two")
check(raises(RuntimeError, one), "one is worn out after its own use")
%% test hidden Arguments, name and docstring
@limit_uses(3)
def add(a, b=0):
    """Add two numbers."""
    return a + b
expect(add(1, b=2), 3)
expect(add.__name__, "add")
expect(add.__doc__, "Add two numbers.")
%% test hidden No uses at all
@limit_uses(0)
def never():
    return 1
check(raises(RuntimeError, never), "with 0 uses, the first call raises")
%% starter
from functools import wraps

def limit_uses(max_uses):
    # Three layers: limit_uses returns a decorator, which returns a wrapper.
    pass

%% solution
from functools import wraps

def limit_uses(max_uses):
    def decorator(func):
        used = 0

        @wraps(func)
        def wrapper(*args, **kwargs):
            nonlocal used
            if used >= max_uses:
                raise RuntimeError("worn out")
            used += 1
            return func(*args, **kwargs)
        return wrapper
    return decorator
%% hint
A decorator with an argument has three layers: `limit_uses(max_uses)` returns a decorator, the decorator takes `func`, and it returns the wrapper.
%% hint
Keep the number of uses in a variable of the decorator layer, one for each decorated function, and change it in the wrapper with `nonlocal`.
%% hint
In the wrapper: when `used >= max_uses`, raise `RuntimeError("worn out")`. Otherwise add 1 to `used` and call the function. Put `@wraps(func)` above the wrapper.
%% end

%% level l6 | Parts bin
The parts bin lists every spare part. Write a **dataclass** `Part` with these fields, in this order:

- `name`, a string,
- `weight`, a float: the weight in kilograms,
- `tags`, a list of strings, **empty by default** and never shared between parts.

The class must also:

- refuse a weight that is not above 0, with `ValueError("weight must be positive")`,
- be sortable: parts compare by name first (`sorted(parts)` puts `bolt` before `gear`),
- have a method `describe()` that returns text such as `gear (2.5 kg)`.

```text
Part("gear", 2.5).describe() returns "gear (2.5 kg)"
Part("gear", 2.5).tags returns []
Part("gear", 0) raises ValueError
```
%% config
mode: script
function: Part
par: 11
%% test A part
part = Part("gear", 2.5)
expect((part.name, part.weight, part.tags), ("gear", 2.5, []))
%% test The description
expect(Part("bolt", 0.1).describe(), "bolt (0.1 kg)")
%% test hidden Separate tag lists
a = Part("a", 1)
b = Part("b", 1)
a.tags.append("x")
expect(b.tags, [])
%% test hidden A bad weight
check(raises(ValueError, Part, "x", 0), "a weight of 0 is refused")
check(raises(ValueError, Part, "x", -2), "a negative weight is refused")
try:
    Part("x", 0)
except ValueError as error:
    expect(str(error), "weight must be positive")
%% test hidden Sorting
parts = [Part("nut", 0.01), Part("bolt", 0.1), Part("gear", 2.5)]
expect([p.name for p in sorted(parts)], ["bolt", "gear", "nut"])
%% test hidden Type hints
hints = Part.__annotations__
expect(hints["name"], str)
expect(hints["weight"], float)
expect(hints["tags"], list[str])
%% test hidden Equal parts
expect(Part("a", 1.0), Part("a", 1.0))
check(Part("a", 1.0) != Part("a", 2.0), "parts with different weights differ")
%% test hidden A dataclass
import dataclasses
check(dataclasses.is_dataclass(Part), "Part must be a dataclass")
%% starter
from dataclasses import dataclass, field

# Write the dataclass Part here.

%% solution
from dataclasses import dataclass, field

@dataclass(order=True)
class Part:
    name: str
    weight: float
    tags: list[str] = field(default_factory=list)

    def __post_init__(self):
        if self.weight <= 0:
            raise ValueError("weight must be positive")

    def describe(self) -> str:
        return f"{self.name} ({self.weight} kg)"
%% hint
`@dataclass(order=True)` above the class writes `__init__`, `__repr__`, `__eq__` and the comparison methods. List the fields with their hints: `name: str`, `weight: float`.
%% hint
A list field needs `field(default_factory=list)`, so that every part gets its own new list: `tags: list[str] = field(default_factory=list)`.
%% hint
Check the weight in `__post_init__` and raise the `ValueError` there. The method `describe` returns an f-string: `f"{self.name} ({self.weight} kg)"`.
%% end

%% level l7 | Lockout
A machine must be **locked** while it is being repaired. A machine is a dictionary with the key `"locked"`. Write a context manager `locked(machine)` (use `@contextmanager`) that sets `machine["locked"] = True` for the length of the `with` block, and puts the **old value** back at the end, **even when an error happens inside the block**. It hands the machine itself to the name after `as`. An error in the block must not be hidden.

```text
press = {"name": "press", "locked": False}
with locked(press) as machine:
    # inside the block, press["locked"] is True
# afterwards, press["locked"] is False again
```
%% config
mode: script
function: locked
par: 9
%% test Locked inside
press = {"name": "press", "locked": False}
with locked(press) as machine:
    inside = press["locked"]
    same = machine is press
expect(inside, True)
check(same, "the name after as is the machine itself")
%% test Unlocked afterwards
press = {"locked": False}
with locked(press):
    pass
expect(press["locked"], False)
%% test hidden After an error
press = {"locked": False}
try:
    with locked(press):
        raise RuntimeError("jam")
except RuntimeError:
    pass
expect(press["locked"], False)
%% test hidden The error goes on
def work(machine):
    with locked(machine):
        raise RuntimeError("jam")
check(raises(RuntimeError, work, {"locked": False}), "the error must not be hidden")
%% test hidden The old value comes back
press = {"locked": True}
with locked(press):
    pass
expect(press["locked"], True)
%% test hidden Nested locks
press = {"locked": False}
with locked(press):
    with locked(press):
        pass
    inside = press["locked"]
expect(inside, True)
expect(press["locked"], False)
%% test hidden A context manager
check(hasattr(locked({"locked": False}), "__enter__"), "locked(...) must work in a with statement")
%% starter
from contextlib import contextmanager

@contextmanager
def locked(machine):
    # Lock the machine, hand it over, and put the old value back in all cases.
    pass

%% solution
from contextlib import contextmanager

@contextmanager
def locked(machine):
    old = machine["locked"]
    machine["locked"] = True
    try:
        yield machine
    finally:
        machine["locked"] = old
%% hint
A `@contextmanager` function is a generator: the code before `yield` runs when the block starts, and the code after it runs when the block ends.
%% hint
Remember the old value first (`old = machine["locked"]`), then set the lock. Write `yield machine` to hand the machine to the name after `as`.
%% hint
Put the `yield` inside `try:` and the restoring line, `machine["locked"] = old`, inside `finally:`. It then runs after an error too, and the error carries on.
%% end

%% level l8 | Retry
Links to the station fail now and then, and a second try often works. Write a decorator **with arguments**, `retry(times, errors=(Exception,))`.

- The decorated function is called **up to `times` times** in all.
- When a call raises one of the `errors`, try again. When a call works, return its result at once.
- When the **last** attempt fails too, let its error through to the caller.
- An error that is **not** one of the `errors` is never retried: it goes straight to the caller.
- The decorated function keeps its name, and passes on all its arguments.

```text
@retry(3, errors=(ConnectionError,))
def fetch():            # imagine that it fails twice, and then works
    ...

fetch() returns "page" (it took 3 calls)
```

The tests use a helper called `flaky(failures)`. It makes a function that fails that many times with a `ConnectionError`, and then returns `"page"`.
%% config
mode: script
function: retry
par: 13
%% prelude
def flaky(failures, error=ConnectionError, result="page"):
    state = {"calls": 0}

    def run(*args, **kwargs):
        state["calls"] += 1
        if state["calls"] <= failures:
            raise error("down")
        return result

    run.state = state
    return run
%% test Works on the third try
machine = flaky(2)
fetch = retry(3, errors=(ConnectionError,))(machine)
expect(fetch(), "page")
expect(machine.state["calls"], 3)
%% test Gives up
machine = flaky(5)
fetch = retry(3, errors=(ConnectionError,))(machine)
check(raises(ConnectionError, fetch), "the last error must reach the caller")
expect(machine.state["calls"], 3)
%% test hidden No retry needed
machine = flaky(0)
fetch = retry(3)(machine)
expect(fetch(), "page")
expect(machine.state["calls"], 1)
%% test hidden Other errors go straight through
machine = flaky(1, error=ValueError)
fetch = retry(5, errors=(ConnectionError,))(machine)
check(raises(ValueError, fetch), "a ValueError is not retried")
expect(machine.state["calls"], 1)
%% test hidden Several kinds of error
machine = flaky(2, error=TimeoutError)
fetch = retry(3, errors=(ConnectionError, TimeoutError))(machine)
expect(fetch(), "page")
%% test hidden The default catches everything
machine = flaky(1, error=KeyError)
fetch = retry(2)(machine)
expect(fetch(), "page")
%% test hidden One attempt only
machine = flaky(10)
fetch = retry(1)(machine)
check(raises(ConnectionError, fetch), "one attempt, and then the error")
expect(machine.state["calls"], 1)
%% test hidden Arguments and name
@retry(2)
def add(a, b=0):
    return a + b
expect(add(1, b=2), 3)
expect(add.__name__, "add")
%% starter
from functools import wraps

def retry(times, errors=(Exception,)):
    # Three layers: retry returns a decorator, which returns a wrapper.
    pass

%% solution
from functools import wraps

def retry(times, errors=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except errors:
                    if attempt == times:
                        raise
        return wrapper
    return decorator
%% hint
There are three layers: `retry(times, errors)` returns a decorator, the decorator takes `func`, and it returns the wrapper. Put `@wraps(func)` above the wrapper.
%% hint
In the wrapper, loop over the attempts, `for attempt in range(1, times + 1):`. In each one, `try:` the call and `return` its result at once when it works.
%% hint
`except errors:` accepts a tuple of error classes, and lets every other error through. In the handler, write `raise` when `attempt == times`, which re-raises the error. Otherwise the loop goes on to the next attempt.
%% end

