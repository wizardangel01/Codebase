---
title: The standard library: cheat sheet
---
## Modules and imports

```python
import math                          # use it as math.sqrt(16)
from math import sqrt, pi            # use the names directly: sqrt(16)
import random as rnd                 # a shorter name
from datetime import datetime as dt

dir(math)                            # every name inside the module
help(math.sqrt)                      # its documentation

# helpers.py: your own module is a file in the same folder
def greet(name):
    return f"Hello, {name}"

if __name__ == "__main__":           # true only when this file is run directly
    print(greet("Ada"))
```

- Python runs a module **once**, the first time it is imported, and keeps it.
- Python looks in the folder of your program first, then in the standard library. A file called `random.py` hides the real `random`, so choose other names.
- Packages from outside the standard library need `pip`, which is not available in the browser.

## math, random and statistics

```python
import math, random, statistics

math.sqrt(144)                       # 12.0
math.floor(-2.5)                     # -3: toward minus infinity
math.ceil(-2.5)                      # -2: toward plus infinity
math.trunc(-2.7)                     # -2: cuts off the decimals
round(2.5)                           # 2: a tie goes to the even neighbour
math.hypot(3, 4)                     # 5.0
math.comb(5, 2)                      # 10: order does not matter
math.perm(5, 2)                      # 20: order matters
math.isclose(0.1 + 0.2, 0.3)         # True: compare floats like this
math.degrees(math.pi)                # 180.0: the trig functions use radians

random.seed(42)                      # the same seed gives the same sequence
random.randint(1, 6)                 # 1 to 6, both ends included
random.randrange(1, 6)               # 1 to 5, like range
random.choice(items)                 # one item
random.choices(items, k=3)           # three items, repeats allowed
random.sample(items, 3)              # three different items
random.shuffle(items)                # changes the list in place and returns None

statistics.mean(data)                # the average
statistics.median(data)              # the middle value
statistics.mode(data)                # the most common value
statistics.stdev(data)               # the spread of a sample (pstdev for a whole population)
```

- `random` follows a formula. For passwords and tokens use `secrets`.
- Too little data raises `StatisticsError`, a kind of `ValueError`. A number outside the domain of a function, as in `math.sqrt(-1)`, raises `ValueError`.
- `Decimal("0.1")` (made from a **string**) is exact, for money. `Fraction(1, 3)` is exact, for ratios.

## datetime

```python
from datetime import date, datetime, timedelta, timezone

day = date(2026, 11, 3)
day.weekday()                        # 1: Monday is 0 and Sunday is 6
day + timedelta(days=30)             # a new date: 2026-12-03
(date(2027, 1, 1) - day).days        # 59: a date minus a date is a timedelta

meeting = datetime(2026, 11, 3, 14, 30)
meeting.strftime("%A %d %B %Y")      # datetime to text: Tuesday 03 November 2026
datetime.strptime("3 Nov 2026", "%d %b %Y")   # text to datetime
datetime.fromisoformat("2026-11-03T09:15:00") # text in the ISO format needs no pattern

lagos = timezone(timedelta(hours=1), "WAT")
meeting.replace(tzinfo=timezone.utc).astimezone(lagos)    # an aware datetime in another zone
```

| Code | Meaning |
| --- | --- |
| `%Y` `%m` `%d` | year, month and day of the month |
| `%H` `%M` `%S` | hour (24-hour clock), minute and second |
| `%I` and `%p` | hour on a 12-hour clock, and AM or PM |
| `%A` and `%a` | weekday name, long and short |
| `%B` and `%b` | month name, long and short |

- **f** is for **format** (`strftime`: datetime to text), and **p** is for **parse** (`strptime`: text to datetime). A pattern that does not match the text raises `ValueError`.
- `date.today()` and `datetime.now()` read the clock of the computer that runs the program.
- A datetime without a zone is **naive**, and one with a zone is **aware**. Mixing them in arithmetic is a `TypeError`. Keep times in UTC, and convert when you show them.

## collections

```python
from collections import Counter, defaultdict, deque, namedtuple

Counter("banana").most_common(2)     # [('a', 3), ('n', 2)]
Counter("banana")["z"]               # 0: a missing item is not an error

groups = defaultdict(list)           # the factory makes the value for a new key
groups["A"].append("Ada")            # no KeyError; reading a key also creates it

line = deque(maxlen=3)               # keeps only the last 3 items
line.append("x")                     # right end; appendleft adds on the left
line.popleft()                       # fast at both ends, unlike list.pop(0)

Point = namedtuple("Point", "x y")
p = Point(3, 4)                      # p.x, p[1], x, y = p
p._replace(x=10)                     # a modified copy; the tuple is immutable
p._asdict()                          # {'x': 3, 'y': 4}
```

## itertools and heapq

```python
from itertools import accumulate, chain, combinations, count, cycle, groupby, islice, permutations, product
import heapq

list(combinations("ABCD", 2))        # 6 pairs: the order does not matter
list(permutations("ABC", 2))         # 6 pairs: the order matters
list(product("AB", [1, 2]))          # every pairing: 4
list(islice(count(10, 5), 4))        # [10, 15, 20, 25]: count and cycle never end
list(accumulate([1, 2, 3, 4]))       # [1, 3, 6, 10]
list(chain([1, 2], "ab"))            # [1, 2, 'a', 'b']

for key, group in groupby(sorted(items), key=keyfunction):   # sort first!
    print(key, list(group))

heap = []
heapq.heappush(heap, (2, "write"))   # tuples compare item by item
heapq.heappop(heap)                  # the smallest item comes out first
heapq.nlargest(2, numbers)           # the 2 biggest; nsmallest for the smallest
```

- These functions are **lazy**: wrap them in `list(...)` to see the items.
- `groupby` only joins neighbours with the same key, so equal keys that are apart end up in different groups.

## pathlib, functools and operator

```python
from pathlib import Path

p = Path("reports/2026/summary.final.txt")
p.name, p.stem, p.suffix, p.parent   # file name, summary.final, .txt, reports/2026
p.with_suffix(".zip")                # a new path with another ending
p.parent / "index.html"              # the slash joins paths

box = Path("box")
box.mkdir(parents=True, exist_ok=True)
sorted(box.glob("*.txt"))            # glob gives no order, so sort; rglob searches below too
p.exists(), p.is_file(), p.is_dir(), p.stat().st_size
p.read_text(), p.write_text("hi"), p.read_bytes(), p.unlink()
```

```python
from functools import reduce, partial
from operator import itemgetter, attrgetter

reduce(lambda a, b: a * b, [1, 2, 3, 4], 1)    # 24: give a starting value
binary = partial(int, base=2)                  # binary("101") is 5
sorted(rows, key=itemgetter("age", "name"))    # a tuple key: age, then name
sorted(people, key=attrgetter("age"))          # for attributes, such as namedtuple fields
```

- Python's sort is **stable**: sort by the minor key first and the major key second.
- `@lru_cache(maxsize=None)` above a function makes it remember its answers. Module 14 explains decorators.

## Text, time, hashes and identifiers

```python
import hashlib, secrets, string, textwrap, time, uuid

textwrap.wrap(text, 30)              # a list of lines; fill gives one string
textwrap.shorten(text, 30, placeholder="...")
textwrap.indent(text, "> ")          # dedent removes the shared indentation
string.ascii_lowercase, string.digits, string.punctuation

start = time.perf_counter()
elapsed = time.perf_counter() - start         # only the difference is meaningful

hashlib.sha256("text".encode()).hexdigest()   # 64 hex characters, cannot be reversed
uuid.uuid4()                                  # a random identifier; uuid5 comes from a name
secrets.token_hex(8)                          # a safe random token
```

- Hashing needs **bytes**: call `.encode()` on a string first.
- A fast hash alone is not a safe way to store passwords.

## Reading the documentation

- `help(thing)` prints the documentation, and `dir(module)` lists the names in a module. The Library Reference at docs.python.org has a page for every module.
- A signature such as `sample(population, k, *, counts=None)`: a parameter without `=` is required, `name=value` is optional, and a bare `*` means that the parameters after it must be given by name.
- Read the first paragraph, then the signature, then try the example. Look for notes such as "Changed in version".
- Not available in the browser: threads, subprocesses, network access and third-party packages.
