---
title: Dates and collections
---
This lesson has two halves. The first deals with **time**: what day it is, how many days remain until a deadline, and what 09:00 in London is in Lagos. The second is a set of **containers** that improve on the lists, dictionaries and tuples that you already know: a counter that counts for you, a dictionary that creates its own missing entries, a queue that is quick at both ends, and tuples whose items have names. They live in four modules: `datetime`, `collections`, `itertools` and `heapq`.

## Dates, times and differences

The `datetime` module has a small family of types. A `date` holds a year, a month and a day. A `datetime` adds the time of day. A `timedelta` is a **length of time**, such as "30 days" or "3 hours and 30 minutes". Dates and times are the area where programmers write the most bugs, so it pays to use the tested types instead of doing the arithmetic yourself.

```python run
from datetime import date, timedelta

launch = date(2026, 11, 3)
print(launch)
print(launch.year, launch.month, launch.day)
print(launch.weekday(), launch.strftime("%A"))
print(launch + timedelta(days=30))
print(date(2027, 1, 1) - launch)
print((date(2027, 1, 1) - launch).days)
```

Printing a date shows the international format `year-month-day`. The method `weekday()` counts Monday as `0` and Sunday as `6`. (The method `isoweekday()` counts Monday as `1` and Sunday as `7`.) Subtracting two dates gives a `timedelta`, and adding a `timedelta` to a date gives a new date. Like strings and tuples, dates never change: every calculation makes a new object.

A `timedelta` has a few details to know about:

```python run
from datetime import timedelta

gap = timedelta(days=1, hours=3, minutes=30)
print(gap)
print(gap.days, gap.seconds)
print(gap.total_seconds())
print(gap * 2)
print(timedelta(hours=-5))
```

The attributes `.days` and `.seconds` hold the **parts** of the length: one whole day, and then 12 600 seconds on top of it. To get the whole length as one number, use `total_seconds()`. A negative length is stored with the sign on the days only, which is why `timedelta(hours=-5)` prints as `-1 day, 19:00:00`.

A `datetime` has everything that a `date` has, plus the hour, minute, second and microsecond:

```python run
from datetime import datetime, timedelta

meeting = datetime(2026, 11, 3, 14, 30)
print(meeting)
print(meeting.date())
print(meeting.time())
print(meeting.hour, meeting.minute)
print(meeting + timedelta(hours=10))
```

To see **now**, use `date.today()` and `datetime.now()`. They read the clock of the computer that runs the program (here, your browser), so your output will differ from anyone else's:

```python run
from datetime import date, datetime

today = date.today()
now = datetime.now()
born = date(2000, 5, 17)
age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))
print("Today is", today)
print("Right now:", now.strftime("%H:%M"))
print("Someone born on 17 May 2000 is", age)
```

The age formula subtracts the years and takes off one more when the birthday has not come yet this year. The comparison of the two `(month, day)` tuples gives `True` or `False`, and Python counts those as `1` and `0`.

### Text in, text out

Dates arrive as text (from files, forms and the user) and leave as text. Two methods with similar names do the conversions. Think of the letters: **f** is for **format**, which turns a datetime into text, and **p** is for **parse**, which turns text into a datetime. Both use a pattern of codes that start with a percent sign:

| Code | Meaning | Example |
| --- | --- | --- |
| `%Y` | year with century | 2026 |
| `%m` | month as a number | 11 |
| `%d` | day of the month | 03 |
| `%H` | hour on a 24-hour clock | 14 |
| `%I` and `%p` | hour on a 12-hour clock, and AM or PM | 02 PM |
| `%M` | minute | 30 |
| `%S` | second | 05 |
| `%A` and `%a` | weekday name, long and short | Tuesday, Tue |
| `%B` and `%b` | month name, long and short | November, Nov |
| `%j` | day of the year | 307 |

```python run
from datetime import datetime

meeting = datetime(2026, 11, 3, 14, 30)
print(meeting.strftime("%A %d %B %Y"))
print(meeting.strftime("%H:%M on %d/%m/%Y"))
print(meeting.strftime("%I:%M %p"))

parsed = datetime.strptime("3 Nov 2026 09:15", "%d %b %Y %H:%M")
print(parsed)
print(parsed.year, parsed.minute)
print(datetime.fromisoformat("2026-11-03T09:15:00"))
```

The pattern for `strptime` must describe the text **exactly**. A slash where the pattern has a dash is a `ValueError`:

```python run error
from datetime import datetime

print(datetime.strptime("2026-11-03", "%Y-%m-%d"))
print(datetime.strptime("03/11/2026", "%Y-%m-%d"))
```

When the text is in the international format already, `fromisoformat` needs no pattern at all, and it is available for `date` as well as for `datetime`.

%% question q-midnight-predict | predict
What does this program print?

```python
from datetime import datetime, timedelta

start = datetime(2026, 11, 3, 23, 30)
end = start + timedelta(minutes=45)
print(end.strftime("%d/%m %H:%M"))
```
%% answer
04/11 00:15
%% explain
Thirty minutes bring the clock to midnight, and the other fifteen minutes carry into the next day. So the new datetime is 4 November at 00:15. The pattern writes the day first, then the month, then the hour and the minute, with the two-digit forms that `%d`, `%m`, `%H` and `%M` always give.
%% end

%% question q-timedelta-fill | fill
Fill in the blank so that the program prints `2026-02-02`.

```python
from datetime import date, timedelta

print(date(2026, 1, 30) + ___(days=3))
```
%% answer
timedelta
%% expected
2026-02-02
%% explain
You add a **length of time** to a date, and the type for a length of time is `timedelta`. January has 31 days, so three days after the 30th is the 2nd of February. The module knows about month lengths and leap years, so you never count them yourself.
%% end

### Time zones

A `datetime` made so far knows nothing about where in the world it is. That is called a **naive** datetime. An **aware** datetime carries a time zone in its `tzinfo`. The simplest zone is `timezone.utc`, the universal time that all others are measured from. For any other fixed offset, build a `timezone` from a `timedelta`:

```python run
from datetime import datetime, timedelta, timezone

utc_time = datetime(2026, 11, 3, 9, 0, tzinfo=timezone.utc)
lagos = timezone(timedelta(hours=1), "WAT")
local_time = utc_time.astimezone(lagos)
print(utc_time)
print(local_time)
print(local_time.strftime("%H:%M %Z"))
print(utc_time == local_time)
```

The method `astimezone` converts an aware datetime to another zone. The two datetimes show different clocks, and they are **equal**, because they are the same moment. A naive datetime and an aware one cannot be mixed in arithmetic, because Python cannot know which zone the naive one means:

```python run error
from datetime import datetime, timezone

aware = datetime(2026, 11, 3, 9, 0, tzinfo=timezone.utc)
naive = datetime(2026, 11, 3, 9, 0)
print(aware - naive)
```

A good rule: keep every time inside your program in **UTC**, and convert to a local zone only when you show it to a person. Python also has a module `zoneinfo` for named zones such as `Africa/Lagos`, with the daylight saving rules of each place. It needs a time zone database, which the browser version of Python does not carry, so this course sticks to fixed offsets.

## Counter: counting made short

In module 6 you counted things with a dictionary and an `if` that checks whether the key is there yet. The class `Counter` from `collections` does that work for you. It is a dictionary whose values are counts, and you can build it from anything that you can loop over:

```python run
from collections import Counter

letters = Counter("mississippi")
print(letters)
print(letters.most_common(2))
print(letters["s"], letters["z"])

count = Counter("the cat and the dog and the bird".split())
print(count.most_common(1))
count.update(["cat", "cat"])
print(count["cat"], count.total(), len(count))
print(Counter(a=3, b=1) + Counter(a=1, b=2))
print(Counter(a=3, b=1) - Counter(a=1, b=2))
```

- `most_common(n)` returns a list of `(item, count)` pairs, with the biggest count first. Items with equal counts stay in the order in which they were first seen. Without `n`, it returns all items.
- A missing item has the count `0`. Looking it up does **not** add it, and it does not raise a `KeyError`.
- `update` adds more counts to the ones that exist. `total()` is the sum of all counts, and `len` is the number of **different** items.
- `+` adds two counters. `-` subtracts them and leaves out any item whose count falls to zero or below.

## defaultdict: a dictionary that fills the gaps

Grouping is a very common task: make a dictionary from a key to a **list** of the values that share it. With a plain dictionary, the first value of each key needs special care, or Python raises a `KeyError`:

```python run error
groups = {}
groups["A"].append("Ada")
```

A `defaultdict` takes a **factory**, a function that makes an empty value. When your code uses a key that is missing, the dictionary calls the factory with no arguments, stores the result under the key, and carries on:

```python run
from collections import defaultdict

groups = defaultdict(list)
for name in ["Ada", "Ben", "Amy", "Cy", "Bea"]:
    groups[name[0]].append(name)
print(dict(groups))

counts = defaultdict(int)
for letter in "hello":
    counts[letter] += 1
print(dict(counts))

print(groups["Z"], "Z" in groups)
```

The factory `list` makes `[]`, and `int` makes `0`, so `counts[letter] += 1` works from the first letter. You can also use `set`, `dict`, or your own function, for example `defaultdict(lambda: "unknown")`. The tool from module 6, `groups.setdefault(key, []).append(name)`, does the same job on a plain dictionary, and it is harder to read.

%% warn Reading a key creates it
The last line of the example prints `[] True`. Merely **looking** at `groups["Z"]` added the key `"Z"` with an empty list. To check without changing anything, use `"Z" in groups` or `groups.get("Z")`. A `Counter` behaves the other way round: a lookup of a missing item gives `0` and leaves the counter alone.
%% end

%% question q-counter-predict | predict
What does this program print?

```python
from collections import Counter

print(Counter("banana").most_common(2))
```
%% answer
[('a', 3), ('n', 2)]
%% explain
The letter `a` appears three times, `n` twice and `b` once. `most_common(2)` returns the two biggest pairs, each one as a tuple of the item and its count, with the biggest first.
%% end

%% question q-defaultdict-choice | choice
You loop over a list of words and want a dictionary that maps each first letter to the list of words that start with it. Which tool saves the most code?
%% choice
`Counter`, because it counts the words
%% choice correct
`defaultdict(list)`, because a new letter starts with an empty list
%% choice
`deque`, because it keeps the words in order
%% choice
`namedtuple`, because it gives the groups names
%% explain
A `defaultdict(list)` creates the empty list for a new letter automatically, so `groups[word[0]].append(word)` is the whole body of the loop. A `Counter` holds numbers, not lists of words.
%% end

## deque: a queue with two fast ends

A `list` is quick at the **end**: `append` and `pop()` take the same time however long the list is. At the **front** it is slow, because `insert(0, x)` and `pop(0)` make Python shift every other item along. The class `deque` (say "deck", for double-ended queue) is fast at both ends:

```python run
from collections import deque

line = deque(["Ada", "Ben"])
line.append("Cy")
line.appendleft("Dee")
print(line)
print(line.popleft(), line.pop())
print(line)
line.rotate(1)
print(line)

recent = deque(maxlen=3)
for number in range(1, 6):
    recent.append(number)
print(recent)
print(list(recent), len(recent), recent[0])
```

The methods `append` and `pop` work on the right end, `appendleft` and `popleft` on the left end, and `rotate(n)` moves the items `n` places to the right (a negative `n` moves them left). With `maxlen`, the deque becomes a **window**: when it is full, adding an item on one side pushes the oldest item out on the other. That is perfect for "the last 10 commands" or "the last 5 temperatures". Popping from an empty deque raises an `IndexError`, as popping from an empty list does. Reach for a deque when your program uses the front of a sequence as often as the back. For everything else, a list is the better choice, because indexing in the middle of a deque is slow.

%% question q-deque-predict | predict
What does this program print?

```python
from collections import deque

window = deque(maxlen=3)
for n in range(1, 6):
    window.append(n)
print(window)
```
%% answer
deque([3, 4, 5], maxlen=3)
%% explain
The window holds three items. When 4 arrives, the oldest item (1) drops out, and when 5 arrives, 2 drops out. The printed form shows the `maxlen` as well, so it is not the same as a plain list.
%% end

## namedtuple: tuples with names

A tuple such as `(3, 4)` is compact, and `point[1]` does not say what it means. The function `namedtuple` makes a **new tuple type** whose items have names. It is the lightest way to build a small record:

```python run
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p)
print(p.x, p[1])
x, y = p
print(x + y)
print(p._replace(x=10))
print(p._asdict())
print(p == (3, 4))

Card = namedtuple("Card", "rank suit")
print(Card("K", "hearts"))
```

You give the type a name, then the field names, either as a list of strings or as one string with spaces. The result is a real tuple: it unpacks, it can be indexed, it compares equal to a plain tuple, and it is **immutable**. The method `_replace` makes a modified copy, and `_asdict()` converts it to a dictionary. The leading underscores are there so that the names cannot clash with your field names, and these methods are public.

```python run error
from collections import namedtuple

Point = namedtuple("Point", "x y")
p = Point(3, 4)
p.x = 5
```

Choose a `namedtuple` for a small fixed record such as a point, a card or a row of a table. When the object needs methods, default values that change, or validation, write a class (module 10) or a `@dataclass`.

## itertools: building blocks for loops

The module `itertools` makes sequences of items and combines them. Its functions return **lazy** objects: they make items when something asks for them, and they do not build a whole list in advance. That is why printing one shows only `<itertools.combinations object at 0x...>`. To see the items, loop over them or wrap them in `list(...)`. (Module 13 explains how lazy sequences work.)

```python run
from itertools import chain, combinations, count, cycle, islice, permutations, product

print(list(islice(count(10, 5), 4)))
print(list(islice(cycle("AB"), 5)))
print(list(chain([1, 2], (3,), "ab")))
print(list(combinations("ABCD", 2)))
print(list(permutations("ABC", 2)))
print(list(product("AB", [1, 2])))
```

- `count(start, step)` counts for ever, and `cycle(items)` repeats the items for ever. Both **never end**, so cut them with `islice(iterable, stop)`, which works like a slice for lazy sequences.
- `chain(a, b, ...)` walks through several sequences as if they were one.
- `combinations(items, k)` picks `k` items and does **not** care about the order: `AB` and `BA` are the same pair. For 4 items taken 2 at a time there are 6 (`math.comb(4, 2)` from lesson 2).
- `permutations(items, k)` does care about the order, so `AB` and `BA` both appear. With 3 items taken 2 at a time there are 6 (`math.perm(3, 2)`). Without `k`, every permutation uses all the items, and there are 3 factorial.
- `product(a, b)` pairs every item of `a` with every item of `b`, like two loops, one inside the other. The form `product(a, repeat=3)` takes three items from `a`, with repeats allowed.

Two more functions help with running totals and with groups:

```python run
from itertools import accumulate, groupby

print(list(accumulate([1, 2, 3, 4])))
print(list(accumulate([3, 1, 4, 1, 5], max)))

words = ["apple", "avocado", "banana", "blueberry", "cherry"]
for letter, group in groupby(words, key=lambda word: word[0]):
    print(letter, list(group))
```

`accumulate` returns the running total (or the running result of any function of two values that you give it, such as `max`). `groupby(items, key=...)` makes one group for each run of items that share the same key, and it gives you the key and the group.

The function `groupby` has a trap. It starts a new group every time the key **changes**, so equal keys that are far apart end up in different groups. The second half of this example sorts the data first:

```python run
from itertools import groupby

items = ["a1", "b1", "a2"]
for letter, group in groupby(items, key=lambda item: item[0]):
    print(letter, list(group))
print("sorted first:")
for letter, group in groupby(sorted(items), key=lambda item: item[0]):
    print(letter, list(group))
```

%% warn groupby only groups neighbours
Sort the data with the same key before you call `groupby`, or use a `defaultdict(list)` when the order of the data does not matter. Without sorting, the letter `a` appears twice in the output above.
%% end

%% question q-combinatorics | multi
Select every expression whose items make a list of **exactly 6** results.
%% choice correct
`combinations("ABCD", 2)`
%% choice correct
`permutations("ABC")`
%% choice correct
`product("ABC", "12")`
%% choice
`product("AB", repeat=3)`
%% choice
`combinations("ABCD", 3)`
%% explain
Choosing 2 of 4 without order gives 6 pairs. Putting 3 items in every possible order gives 3 factorial, which is 6. Pairing 3 letters with 2 digits gives 3 times 2, which is 6. But `product("AB", repeat=3)` gives 2 times 2 times 2, which is 8, and choosing 3 of 4 gives only 4.
%% end

### heapq: the smallest comes first

A **heap** is a list that Python keeps arranged so that the **smallest** item is always at index `0`, and so that adding or removing an item is quick. The module `heapq` works on an ordinary list. It is the tool for "give me the next most urgent item":

```python run
import heapq

heap = []
for number in [5, 1, 8, 3]:
    heapq.heappush(heap, number)
print(heap[0])
print(heapq.heappop(heap), heapq.heappop(heap))
print(heapq.nlargest(2, [5, 1, 8, 3]), heapq.nsmallest(2, [5, 1, 8, 3]))

tasks = []
heapq.heappush(tasks, (2, "write"))
heapq.heappush(tasks, (1, "plan"))
heapq.heappush(tasks, (3, "test"))
while tasks:
    print(heapq.heappop(tasks))
```

Only the first item of a heap is guaranteed to be the smallest. The rest of the list is **not** fully sorted, so use `sorted` when you want all items in order. Tuples compare item by item, so `(priority, task)` pairs come out with the lowest priority number first. Module 15 uses this in searching algorithms.

## A project: reading a visitor log

The tools of this lesson work well together. The program below turns lines of text into `namedtuple` records with real datetimes, counts the pages with a `Counter`, groups them by day with a `defaultdict`, and measures the time span with a `timedelta`:

```python run
from collections import Counter, defaultdict, namedtuple
from datetime import datetime

Visit = namedtuple("Visit", "when page")

raw = [
    "2026-11-02 08:15 home",
    "2026-11-02 09:40 lessons",
    "2026-11-02 21:05 home",
    "2026-11-03 07:55 quiz",
    "2026-11-03 08:20 lessons",
    "2026-11-03 08:45 home",
]

visits = []
for line in raw:
    day, clock, page = line.split()
    when = datetime.strptime(day + " " + clock, "%Y-%m-%d %H:%M")
    visits.append(Visit(when, page))

pages = Counter()
by_day = defaultdict(list)
for visit in visits:
    pages[visit.page] += 1
    by_day[visit.when.date()].append(visit.page)

print(pages.most_common(2))
for day in sorted(by_day):
    print(day.strftime("%a %d %b"), by_day[day])
print("Span:", visits[-1].when - visits[0].when)
```

Each tool does one small job, and the program reads almost like a description of the task. That is the benefit of the standard library: the hard parts are already written and tested.

## Your turn

%% exercise weekday-countdown | Weekday and countdown
Read a date written as `YYYY-MM-DD`. Print the name of its weekday. Then print how far it is from **1 January 2027**: `Days to 2027-01-01: N` when the date is on or before that day, and `Days since 2027-01-01: N` when it is later. The number N is never negative. For the input below the program prints:

```output
Weekday: Tuesday
Days to 2027-01-01: 59
```
%% stdin
2026-11-03
%% starter
from datetime import date, datetime

target = date(2027, 1, 1)
# Read the date, then print the weekday and the countdown.

%% solution
from datetime import date, datetime

target = date(2027, 1, 1)
day = datetime.strptime(input(), "%Y-%m-%d").date()
print(f"Weekday: {day.strftime('%A')}")
gap = (target - day).days
if gap >= 0:
    print(f"Days to 2027-01-01: {gap}")
else:
    print(f"Days since 2027-01-01: {-gap}")
%% tests
expect_output("Weekday: Tuesday\nDays to 2027-01-01: 59")
check(rerun("2027-01-01").strip() == "Weekday: Friday\nDays to 2027-01-01: 0", "the day itself")
check(rerun("2027-01-05").strip() == "Weekday: Tuesday\nDays since 2027-01-01: 4", "a later date")
check(rerun("2024-02-29").strip() == "Weekday: Thursday\nDays to 2027-01-01: 1037", "a leap day")
check(calls("strptime"), "parses the text with strptime")
%% hint
`datetime.strptime(text, "%Y-%m-%d")` turns the text into a datetime. Add `.date()` to get a date.
%% hint
Subtracting two dates gives a `timedelta`. Its `.days` is a whole number of days, and it is negative when the first date is the earlier one.
%% hint
Subtract in the order `target - day`. When `.days` is below zero, the date is after the target, so print the positive number `-gap` after `Days since`.
%% end

%% exercise word-census | Word census
Read one line of text. Make it lower case and split it into words. Print the number of words, the number of different words, and then the three most common words, each as `word: count`. When counts are equal, the word that appeared first comes first. For the input below the program prints:

```output
Words: 8
Different: 5
the: 3
and: 2
cat: 1
```
%% stdin
The cat and the dog and THE bird
%% starter
from collections import Counter

# Read the line, count the words, print the report.

%% solution
from collections import Counter

words = input().lower().split()
counts = Counter(words)
print(f"Words: {len(words)}")
print(f"Different: {len(counts)}")
for word, number in counts.most_common(3):
    print(f"{word}: {number}")
%% tests
expect_output("Words: 8\nDifferent: 5\nthe: 3\nand: 2\ncat: 1")
check(rerun("a b a B c c c").strip() == "Words: 7\nDifferent: 3\nc: 3\na: 2\nb: 2", "ties keep the first-seen order")
check(rerun("hello").strip() == "Words: 1\nDifferent: 1\nhello: 1", "one word")
check(rerun("\n").strip() == "Words: 0\nDifferent: 0", "no words")
check(calls("Counter"), "uses Counter")
%% hint
`input().lower().split()` gives the list of lower case words. Its length is the first number.
%% hint
`Counter(words)` counts them, and `len(counter)` is the number of different words.
%% hint
`counter.most_common(3)` gives `(word, count)` pairs. Loop over them with `for word, number in ...` and print each one.
%% end

%% exercise group-by-initial | Group by initial
Read names, one per line, until the line `done`. Group them by their first letter and print one line for each letter, in alphabetical order: the capital letter, a colon, and the names in alphabetical order, separated by commas. Write every name with a capital first letter and lower case after it. For the input below the program prints:

```output
A: Ada, Amy
B: Bea, Ben
C: Cy
```
%% stdin
ada
Ben
amy
cy
bea
done
%% starter
from collections import defaultdict

groups = defaultdict(list)
# Read the names and fill the groups, then print them.

%% solution
from collections import defaultdict

groups = defaultdict(list)
while True:
    name = input().strip()
    if name == "done":
        break
    name = name.capitalize()
    groups[name[0]].append(name)
for letter in sorted(groups):
    names = sorted(groups[letter])
    print(f"{letter}: {', '.join(names)}")
%% tests
expect_output("A: Ada, Amy\nB: Bea, Ben\nC: Cy")
check(rerun("zed\nZOE\nyan\ndone").strip() == "Y: Yan\nZ: Zed, Zoe", "other letters and capitals")
check(rerun("sam\nsam\ndone").strip() == "S: Sam, Sam", "a repeated name stays")
check(rerun("done").strip() == "", "no names")
check(calls("defaultdict"), "uses defaultdict")
%% hint
Read in a `while True` loop, and `break` when the line is `done`. Use `.capitalize()` to fix the case of each name.
%% hint
`groups[name[0]].append(name)` adds the name to the list of its first letter. The `defaultdict(list)` creates that list the first time.
%% hint
Loop over `sorted(groups)` for the letters. Inside, `sorted(groups[letter])` gives the names in order, and `", ".join(names)` puts the commas between them.
%% end

%% exercise fixture-list | Challenge: Fixture list
A league needs a **fixture list**. Read the first match day as `YYYY-MM-DD`, then team names, one per line, until `done`. Every pair of teams plays once, so use `itertools.combinations` to make the pairs, in the order that it gives them. One match is played each day, starting on the first day, but **never on a Sunday**: a match that would fall on a Sunday moves to the Monday. Print one line for each match as `Tue 03 Nov: Ada vs Ben`, then a summary line such as `6 matches, finishing on Mon 09 Nov` (write `1 match` when there is only one). Print `No matches` when there are none. For the input below the program prints:

```output
Tue 03 Nov: Ada vs Ben
Wed 04 Nov: Ada vs Cy
Thu 05 Nov: Ada vs Dee
Fri 06 Nov: Ben vs Cy
Sat 07 Nov: Ben vs Dee
Mon 09 Nov: Cy vs Dee
6 matches, finishing on Mon 09 Nov
```
%% stdin
2026-11-03
Ada
Ben
Cy
Dee
done
%% starter
from datetime import datetime, timedelta
from itertools import combinations

# Read the first day and the teams, then print the fixtures.

%% solution
from datetime import datetime, timedelta
from itertools import combinations

day = datetime.strptime(input(), "%Y-%m-%d").date()
teams = []
while True:
    name = input()
    if name == "done":
        break
    teams.append(name)

played = 0
last = day
for home, away in combinations(teams, 2):
    while day.weekday() == 6:
        day += timedelta(days=1)
    print(f"{day.strftime('%a %d %b')}: {home} vs {away}")
    played += 1
    last = day
    day += timedelta(days=1)

if played == 0:
    print("No matches")
else:
    word = "match" if played == 1 else "matches"
    print(f"{played} {word}, finishing on {last.strftime('%a %d %b')}")
%% tests
expect_output("Tue 03 Nov: Ada vs Ben\nWed 04 Nov: Ada vs Cy\nThu 05 Nov: Ada vs Dee\nFri 06 Nov: Ben vs Cy\nSat 07 Nov: Ben vs Dee\nMon 09 Nov: Cy vs Dee\n6 matches, finishing on Mon 09 Nov")
check(rerun("2026-11-08\nAda\nBen\ndone").strip() == "Mon 09 Nov: Ada vs Ben\n1 match, finishing on Mon 09 Nov", "a Sunday start moves to Monday")
check(rerun("2026-11-03\nAda\ndone").strip() == "No matches", "one team has no matches")
check(rerun("2026-12-30\nA\nB\nC\ndone").strip() == "Wed 30 Dec: A vs B\nThu 31 Dec: A vs C\nFri 01 Jan: B vs C\n3 matches, finishing on Fri 01 Jan", "across the end of a year")
check(calls("combinations"), "uses combinations")
check(calls("timedelta"), "uses timedelta")
%% hint
Read the first line with `strptime`, and collect the team names in a list until the line is `done`.
%% hint
`for home, away in combinations(teams, 2):` visits every pair once. Keep the current match day in a variable, and add `timedelta(days=1)` after every match.
%% hint
Before you print a match, `while day.weekday() == 6:` moves a Sunday forward by one day. Remember the day of the last match for the summary line, and choose `match` or `matches` with a conditional expression.
%% end

## What you learned

- `datetime` has `date`, `datetime`, `timedelta` and `timezone`. Subtracting dates gives a `timedelta`, adding a `timedelta` gives a new date, and `.days` is only the whole-day part of a length (use `total_seconds()` for the rest).
- `strftime` formats a datetime as text (**f** for format) and `strptime` parses text into a datetime (**p** for parse), both with percent codes such as `%Y`, `%m`, `%d`, `%H`, `%M`, `%A` and `%b`. A pattern that does not match the text raises `ValueError`.
- A datetime without a time zone is **naive**, and one with a zone is **aware**. The two cannot be mixed in arithmetic. Keep times in UTC inside a program, and convert with `astimezone` when you show them.
- `Counter` counts anything you can loop over: `most_common(n)`, a count of `0` for a missing item, and `+` and `-` for combining counts.
- `defaultdict(factory)` creates a missing value on first use, which makes grouping short. Reading a missing key adds it.
- `deque` is fast at both ends, and `deque(maxlen=n)` keeps only the last `n` items. `namedtuple` makes a small immutable record whose items have names.
- `itertools` gives lazy building blocks (`count`, `cycle`, `chain`, `islice`, `combinations`, `permutations`, `product`, `accumulate`, `groupby`). `groupby` needs sorted data, and `heapq` keeps the smallest item at the front.
