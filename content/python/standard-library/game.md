---
title: Data Detective
engine: judge
---
The **Data Detective Agency** takes the cases that the police cannot crack. Every case arrives as a pile of data, and every case is solved with a different tool from Python's standard library: random seeds, counters, statistics, dates, special dictionaries, queues, combinations and fingerprints. Read each briefing with care, because the tool that it names is the key to the case.

How to play:

- Press **Run**. The result panel lists every test. A red test shows what was expected and what your code gave, or the error that stopped it, together with the line of your code.
- Some tests are **hidden**. They check the edge cases, so follow every rule of the briefing, and do not only fit the visible examples.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Replay the draw
The Crown Lottery says that its draw is fair. You suspect that the organisers used a **fixed seed**, so that anybody who knows it can predict the numbers. To prove it, write a function `replay(seed, count)` that reproduces a draw:

1. Start the generator with `random.seed(seed)`.
2. Pick `count` **different** numbers from 1 to 49 with `random.sample`.
3. Return them as a list in **ascending order**.

```text
replay(2026, 6) returns [7, 8, 21, 33, 42, 47]
```
%% config
mode: script
function: replay
par: 4
require: sample
%% test The first draw
expect(replay(2026, 6), [7, 8, 21, 33, 42, 47])
%% test A short draw
expect(replay(7, 3), [10, 21, 26])
%% test hidden Another seed
expect(replay(99, 6), [12, 13, 15, 25, 26, 39])
%% test hidden One number
expect(replay(1, 1), [9])
expect(replay(2, 1), [4])
%% test hidden The same seed repeats
check(replay(5, 6) == replay(5, 6), "the same seed must give the same draw")
expect(replay(5, 6), [17, 23, 34, 40, 42, 45])
%% test hidden Different numbers in range
for seed in range(20):
    draw = replay(seed, 6)
    check(len(set(draw)) == 6, "the six numbers must be different")
    check(draw == sorted(draw), "the numbers must be in ascending order")
    check(draw[0] >= 1 and draw[-1] <= 49, "the numbers must be from 1 to 49")
%% starter
import random

def replay(seed, count):
    # Start the generator with the seed, draw the numbers, return them in order.
    pass

%% solution
import random

def replay(seed, count):
    random.seed(seed)
    return sorted(random.sample(range(1, 50), count))
%% hint
A generator that starts from the same **seed** gives the same numbers every time. Call `random.seed(seed)` before you draw.
%% hint
`random.sample(population, k)` picks `k` different items. The numbers 1 to 49 are `range(1, 50)`, because the end of a range is not included.
%% hint
Wrap the result in `sorted(...)` to put the numbers in ascending order, and return it.
%% end

%% level l2 | The usual suspects
Witnesses reported the licence plate of the getaway car, and they do not agree. The plate that was reported **most often** is probably the right one. Write `top_plate(reports)`, where `reports` is a list of plate texts. It returns a **tuple** `(plate, count)` for the most reported plate.

- Two reports are the same plate when they differ only in capital letters or in spaces at the two ends. Return the plate in **capitals**, without the extra spaces.
- When two plates have the same count, the one that was reported **first** wins.
- With no reports at all, return `(None, 0)`.

```text
top_plate(["kja 482", "LMN 007", " KJA 482 "]) returns ("KJA 482", 2)
```
%% config
mode: script
function: top_plate
par: 8
require: Counter
%% test A clear winner
expect(top_plate(["KJA 482", "LMN 007", "KJA 482"]), ("KJA 482", 2))
%% test Capitals and spaces
expect(top_plate(["kja 482", " KJA 482 ", "lmn 007", "KJA 482"]), ("KJA 482", 3))
%% test hidden A tie
expect(top_plate(["B 2", "A 1", "A 1", "B 2"]), ("B 2", 2))
%% test hidden One report
expect(top_plate(["x 9"]), ("X 9", 1))
%% test hidden No reports
expect(top_plate([]), (None, 0))
%% starter
from collections import Counter

def top_plate(reports):
    # Count the plates (in capitals, without spaces at the ends), then return the top one.
    pass

%% solution
from collections import Counter

def top_plate(reports):
    plates = Counter()
    for report in reports:
        plates[report.strip().upper()] += 1
    if not plates:
        return (None, 0)
    return plates.most_common(1)[0]
%% hint
Make an empty `Counter()` and add one for each report: `plates[plate] += 1`. Clean the plate first with `.strip().upper()`.
%% hint
`plates.most_common(1)` is a list that holds one `(plate, count)` pair, so `[0]` gives the pair itself. Equal counts keep the order in which they were first seen, so ties are handled for you.
%% hint
An empty counter would make `[0]` fail, so check `if not plates:` first and return `(None, 0)`.
%% end

%% level l3 | Fishy numbers
The bank says that its daily takings are honest. A day is **fishy** when its number is more than **2 standard deviations** away from the mean of all the days, on either side. Write `fishy(values)`, which returns a list of the fishy numbers in their **original order**.

- Use `statistics.mean` and `statistics.stdev` (the sample version).
- With fewer than 3 numbers there is not enough data, so return an empty list.
- When all the numbers are equal, nothing is fishy.

```text
fishy([10, 12, 11, 9, 10, 11, 60]) returns [60]
```
%% config
mode: script
function: fishy
par: 11
require: stdev
%% test One fake day
expect(fishy([10, 12, 11, 9, 10, 11, 60]), [60])
%% test Honest data
expect(fishy([5, 6, 5, 7, 6, 5]), [])
%% test hidden Fakes on both sides
expect(fishy([48, 50, 52, 49, 51, 50, 50, 49, 51, 50, 52, 48, 50, 51, 49, 50, 20, 85]), [20, 85])
%% test hidden The order is kept
expect(fishy([85, 50, 50, 49, 51, 50, 52, 48, 50, 51, 49, 50, 20, 48, 52, 49, 51, 50]), [85, 20])
%% test hidden Too little data
expect(fishy([]), [])
expect(fishy([5]), [])
expect(fishy([1, 100]), [])
%% test hidden Equal numbers
expect(fishy([4, 4, 4, 4]), [])
%% starter
import statistics

def fishy(values):
    # Work out the mean and the standard deviation, then collect the fishy values.
    pass

%% solution
import statistics

def fishy(values):
    if len(values) < 3:
        return []
    mean = statistics.mean(values)
    spread = statistics.stdev(values)
    result = []
    for value in values:
        if abs(value - mean) > 2 * spread:
            result.append(value)
    return result
%% hint
`statistics.mean(values)` and `statistics.stdev(values)` give the two numbers that you need. Check the number of values first, because `stdev` needs at least two.
%% hint
A value is fishy when `abs(value - mean) > 2 * spread`. The `abs` takes care of both sides.
%% hint
Loop over the values in their original order, `append` the fishy ones to a result list, and return it. Return `[]` straight away for fewer than 3 values.
%% end

%% level l4 | Time window
A camera saw the suspect at one time, and the crime happened at another. The alibi fails when the sighting was close to the crime. Write `within(seen, crime, minutes)`, where `seen` and `crime` are texts such as `"2026-03-14 22:15"` (year, month, day, hour and minute). It returns `True` when the two moments are **at most** `minutes` minutes apart, **before or after**, and `False` otherwise.

```text
within("2026-03-14 21:40", "2026-03-14 22:00", 30) returns True
within("2026-03-14 18:00", "2026-03-14 22:00", 30) returns False
```

Watch out for midnight and for the end of a month: a clock that goes from `23:50` to `00:10` has moved only 20 minutes.
%% config
mode: script
function: within
par: 5
require: strptime
%% test Twenty minutes before
expect(within("2026-03-14 21:40", "2026-03-14 22:00", 30), True)
%% test Hours too early
expect(within("2026-03-14 18:00", "2026-03-14 22:00", 30), False)
%% test After the crime
expect(within("2026-03-14 22:25", "2026-03-14 22:00", 30), True)
%% test hidden Exactly on the limit
expect(within("2026-03-14 22:30", "2026-03-14 22:00", 30), True)
expect(within("2026-03-14 22:31", "2026-03-14 22:00", 30), False)
%% test hidden Across midnight
expect(within("2026-03-15 00:10", "2026-03-14 23:50", 30), True)
expect(within("2026-03-14 23:50", "2026-03-15 00:10", 15), False)
%% test hidden Across a month end
expect(within("2026-04-01 00:05", "2026-03-31 23:55", 15), True)
%% test hidden Zero minutes
expect(within("2026-03-14 22:00", "2026-03-14 22:00", 0), True)
expect(within("2026-03-14 22:01", "2026-03-14 22:00", 0), False)
%% starter
from datetime import datetime, timedelta

def within(seen, crime, minutes):
    # Turn both texts into datetimes, then compare the gap between them with the limit.
    pass

%% solution
from datetime import datetime, timedelta

def within(seen, crime, minutes):
    pattern = "%Y-%m-%d %H:%M"
    gap = datetime.strptime(seen, pattern) - datetime.strptime(crime, pattern)
    return abs(gap) <= timedelta(minutes=minutes)
%% hint
Use one pattern for both texts: `"%Y-%m-%d %H:%M"`. The call `datetime.strptime(text, pattern)` turns a text into a datetime.
%% hint
Subtracting two datetimes gives a `timedelta`. `abs(gap)` ignores whether the sighting came before or after the crime.
%% hint
Compare with a `timedelta` made from the limit: `return abs(gap) <= timedelta(minutes=minutes)`. A gap of exactly the limit counts.
%% end

%% level l5 | Case index
The detectives have the transcript of an interview, one text for each line. To find out who said what, they need an **index**: for every word, the **line numbers** where it appears. Write `build_index(lines)`, which returns a dictionary from each word to a list of line numbers.

- Line numbers start at **1**. Each number appears **once** in the list, in ascending order, even when the word is used twice on the same line.
- Words are separated by spaces. Ignore capital letters, and ignore a full stop, comma, question mark or exclamation mark at the **end** of a word.
- A `defaultdict(list)` makes this short, and you may return it as it is.

```text
build_index(["The butler saw Ada.", "Ada was in the garden."]) gives
{"the": [1, 2], "butler": [1], "saw": [1], "ada": [1, 2], "was": [2], "in": [2], "garden": [2]}
```
%% config
mode: script
function: build_index
par: 9
require: defaultdict
%% test A short transcript
index = build_index(["The butler saw Ada.", "Ada was in the garden."])
expect(dict(index), {"the": [1, 2], "butler": [1], "saw": [1], "ada": [1, 2], "was": [2], "in": [2], "garden": [2]})
%% test Punctuation
index = build_index(["Where was Ada?", "In the garden, said Ada!"])
expect(dict(index), {"where": [1], "was": [1], "ada": [1, 2], "in": [2], "the": [2], "garden": [2], "said": [2]})
%% test hidden Twice on one line
expect(dict(build_index(["go go go", "stop", "Go"])), {"go": [1, 3], "stop": [2]})
%% test hidden Nothing to index
expect(dict(build_index([])), {})
expect(dict(build_index(["", "   "])), {})
%% test hidden Several marks
expect(dict(build_index(["Wait... what?!"])), {"wait": [1], "what": [1]})
%% starter
from collections import defaultdict

def build_index(lines):
    # Go through the lines with their numbers, and collect the words.
    pass

%% solution
from collections import defaultdict

def build_index(lines):
    index = defaultdict(list)
    for number, line in enumerate(lines, start=1):
        for word in line.lower().split():
            word = word.strip(".,?!")
            if number not in index[word]:
                index[word].append(number)
    return index
%% hint
Create `index = defaultdict(list)`. Loop with `for number, line in enumerate(lines, start=1):` to get the line numbers.
%% hint
`line.lower().split()` gives the words in lower case. Clean each word with `.strip(".,?!")`.
%% hint
Add the line number only when it is not in the list yet: `if number not in index[word]:`, and then `index[word].append(number)`.
%% end

%% level l6 | The last lines
The night guard keeps a long log in the file `log.txt`. When something goes wrong, you only need the **last few lines**. Read a number `n`, and print the last `n` lines of `log.txt`, in their original order. When the log has fewer than `n` lines, print all of them.

Use a `deque` with a `maxlen`. It forgets the oldest line by itself, so the program never has to keep the whole log.

```text
2 gives
09:02 alarm test
09:10 doors locked
```
%% config
mode: io
par: 8
require: deque
%% file log.txt
08:00 doors unlocked
08:05 guard A arrives
08:12 camera 3 offline
08:15 delivery at the back gate
08:31 camera 3 online
08:47 guard B arrives
09:02 alarm test
09:10 doors locked
%% in The last three
3
%% out
08:47 guard B arrives
09:02 alarm test
09:10 doors locked
%% in The last line
1
%% out
09:10 doors locked
%% in hidden
8
%% out
08:00 doors unlocked
08:05 guard A arrives
08:12 camera 3 offline
08:15 delivery at the back gate
08:31 camera 3 online
08:47 guard B arrives
09:02 alarm test
09:10 doors locked
%% in hidden
20
%% out
08:00 doors unlocked
08:05 guard A arrives
08:12 camera 3 offline
08:15 delivery at the back gate
08:31 camera 3 online
08:47 guard B arrives
09:02 alarm test
09:10 doors locked
%% in hidden
0
%% out

%% starter
from collections import deque

n = int(input())
# Read log.txt line by line, and keep only the last n lines.

%% solution
from collections import deque

count = int(input())
recent = deque(maxlen=count)
with open("log.txt") as f:
    for line in f:
        recent.append(line.rstrip())
for line in recent:
    print(line)
%% hint
Read the number first, and make `recent = deque(maxlen=count)`. When the deque is full, adding a line pushes the oldest one out.
%% hint
Open `log.txt` with a `with` block, and loop over the file. Use `recent.append(line.rstrip())`, so that the line ends are removed.
%% hint
After the loop, print every line that is left in the deque.
%% end

%% level l7 | The vault
The vault has a keypad with the digits **1 to 5**, and its code has **4 digits**. Nobody remembers the code, so you will try them all. The function `try_code(code)` is already there for you: it takes a text such as `"1234"` and returns `True` when the vault opens.

Write `crack()`. It tries every possible code and returns the one that opens the vault. When no code opens it, return `None`.

Four nested loops would work, but the right tool is `itertools.product`, which makes every combination of digits in one go. Turn each tuple of digits into a text with `"".join(...)`. The tests change the secret code between the checks.
%% config
mode: script
function: crack
par: 6
require: product
%% prelude
_vault = {"secret": "3142", "tries": 0}

def try_code(code):
    _vault["tries"] += 1
    return code == _vault["secret"]

def _set_secret(code):
    _vault["secret"] = code
    _vault["tries"] = 0

def _tries():
    return _vault["tries"]
%% test The first vault
_set_secret("3142")
expect(crack(), "3142")
%% test Another vault
_set_secret("5555")
expect(crack(), "5555")
%% test hidden The edges of the keypad
_set_secret("1111")
expect(crack(), "1111")
_set_secret("2345")
expect(crack(), "2345")
_set_secret("5432")
expect(crack(), "5432")
%% test hidden No code opens it
_set_secret("9999")
expect(crack(), None)
%% test hidden Not too many tries
_set_secret("5555")
crack()
check(_tries() <= 625, "there are only 625 codes to try")
%% starter
from itertools import product

def crack():
    # Try every code that is made of the digits 1 to 5 and is 4 digits long.
    pass

%% solution
from itertools import product

def crack():
    for digits in product("12345", repeat=4):
        code = "".join(digits)
        if try_code(code):
            return code
%% hint
`product("12345", repeat=4)` gives every combination of four digits, one tuple at a time, such as `('1', '2', '3', '4')`.
%% hint
Join each tuple into a text with `"".join(digits)`, and ask `try_code(code)` whether it opens the vault.
%% hint
Return the code as soon as `try_code` says `True`. When the loop ends without a match, the function returns `None` by itself.
%% end

%% level l8 | Tamper check
The evidence room keeps text files, and its log records a **SHA-256 fingerprint** of each file from the day when it was collected. Somebody may have edited a file since then. Write `find_tampered(expected)`, where `expected` is a dictionary from a file name to its fingerprint (64 hexadecimal characters). All the files are in the current folder.

Return a **sorted list** with the names of the files that have **changed** or are **missing**. Files that still match are not listed.

- Read each file as **bytes** with `Path.read_bytes()`, and fingerprint it with `hashlib.sha256(...).hexdigest()`.
- A name in `expected` that has no file in the folder counts as tampered.
- The tests make their own files, so you can read in the visible tests how it is done.
%% config
mode: script
function: find_tampered
par: 11
require: sha256
%% test Nothing changed
from pathlib import Path
import hashlib
Path("a.txt").write_text("alibi of Ada\n")
Path("b.txt").write_text("gate log\n")
expected = {}
for name in ["a.txt", "b.txt"]:
    expected[name] = hashlib.sha256(Path(name).read_bytes()).hexdigest()
expect(find_tampered(expected), [])
%% test One file was edited
from pathlib import Path
import hashlib
Path("a.txt").write_text("alibi of Ada\n")
Path("b.txt").write_text("gate log\n")
expected = {}
for name in ["a.txt", "b.txt"]:
    expected[name] = hashlib.sha256(Path(name).read_bytes()).hexdigest()
Path("b.txt").write_text("gate log (edited)\n")
expect(find_tampered(expected), ["b.txt"])
%% test hidden A missing file
from pathlib import Path
import hashlib
Path("keep.txt").write_text("still here\n")
expected = {"keep.txt": hashlib.sha256(Path("keep.txt").read_bytes()).hexdigest(), "ghost.txt": "0" * 64}
expect(find_tampered(expected), ["ghost.txt"])
%% test hidden The result is sorted
from pathlib import Path
import hashlib
expected = {}
for name in ["z.txt", "m.txt", "a.txt"]:
    Path(name).write_text("original " + name + "\n")
    expected[name] = hashlib.sha256(Path(name).read_bytes()).hexdigest()
Path("z.txt").write_text("changed\n")
Path("m.txt").write_text("changed\n")
expect(find_tampered(expected), ["m.txt", "z.txt"])
%% test hidden The same length
from pathlib import Path
import hashlib
Path("n.txt").write_text("12345\n")
expected = {"n.txt": hashlib.sha256(Path("n.txt").read_bytes()).hexdigest()}
Path("n.txt").write_text("12346\n")
expect(find_tampered(expected), ["n.txt"])
%% test hidden No evidence
expect(find_tampered({}), [])
%% starter
import hashlib
from pathlib import Path

def find_tampered(expected):
    # Fingerprint every file, and list the names that do not match.
    pass

%% solution
import hashlib
from pathlib import Path

def find_tampered(expected):
    bad = []
    for name in sorted(expected):
        path = Path(name)
        if not path.exists():
            bad.append(name)
        elif hashlib.sha256(path.read_bytes()).hexdigest() != expected[name]:
            bad.append(name)
    return bad
%% hint
Loop over `sorted(expected)`: when the names are visited in order, the result is sorted too.
%% hint
`Path(name).exists()` tells you whether the file is there. A missing file goes straight onto the list.
%% hint
`hashlib.sha256(Path(name).read_bytes()).hexdigest()` is the fingerprint of the file now. When it is not equal to `expected[name]`, the file was changed.
%% end

