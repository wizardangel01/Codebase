---
title: More batteries
---
The standard library has hundreds of modules, and nobody remembers them all. What matters is to know that a tool **exists**, so that you search for it before you write it yourself. This lesson visits seven more modules that earn a place in everyday programs: `pathlib` for files and folders, `functools` and `operator` for working with functions, `textwrap` and `string` for text, `time` for measuring, and `hashlib` with `uuid` and `secrets` for fingerprints and identifiers. The last part shows how to **learn any module on your own**, which is the skill that makes all the others possible.

## pathlib: files and folders

Module 8 introduced `Path` for joining names and for reading and writing small files. A `Path` can do much more. First, it takes a path apart into pieces:

```python run
from pathlib import Path

report = Path("reports/2026/summary.final.txt")
print(report.name, report.stem, report.suffix, report.parent)
print(report.parts)
print(report.with_suffix(".zip"))
print(report.parent / "index.html")
print(Path("README").suffix == "", Path("README").parent)
```

The `name` is the last part, and the `stem` is the name without its **last** suffix, which is why `summary.final.txt` has the stem `summary.final`. The `parent` is the folder that holds the path, and the parent of a bare name is `.`, the current folder. The method `with_suffix` makes a new path with another ending, and the slash operator builds longer paths. None of these touch the disk: a `Path` is only a description of a place, and the place does not have to exist.

Other methods do touch the disk. They make folders, list them, and ask about files:

```python run
from pathlib import Path

box = Path("box")
box.mkdir(exist_ok=True)
(box / "a.txt").write_text("buy milk\n")
(box / "b.txt").write_text("call Ada\n")
(box / "notes.md").write_text("# notes\n")

for path in sorted(box.glob("*.txt")):
    print(path.name, path.stat().st_size, path.is_file())

names = []
for item in box.iterdir():
    names.append(item.name)
print(sorted(names))
print(box.is_dir(), (box / "zzz").exists())

(box / "b.txt").unlink()
print(len(list(box.glob("*.txt"))))
```

- `mkdir()` makes a folder. With `exist_ok=True` it does nothing when the folder is there already, and with `parents=True` it also makes any missing folders above it.
- `glob("*.txt")` finds the entries that match a pattern: `*` stands for any characters and `?` for exactly one. `rglob("*.txt")` also searches every folder below. The results arrive in **no particular order**, so wrap them in `sorted(...)` whenever the order matters.
- `iterdir()` lists everything in a folder. `is_file()`, `is_dir()` and `exists()` ask what a path is, and `stat().st_size` is the size in bytes.
- `unlink()` deletes a file, and `rename(new_path)` moves or renames it.

The program makes a folder that exists already when you run it twice, and the plain `mkdir()` refuses:

```python run error
from pathlib import Path

Path("box").mkdir()
Path("box").mkdir()
```

The browser keeps the files of a program only while it runs, and every run starts in a fresh, empty folder. On your own computer the files stay on the disk, and you can see them in your file manager.

%% question q-path-predict | predict
What does this program print?

```python
from pathlib import Path

p = Path("reports/2026/summary.final.txt")
print(p.stem, p.suffix, p.parent.name)
```
%% answer
summary.final .txt 2026
%% explain
The stem drops only the last suffix, so `summary.final` stays whole, and the suffix is `.txt`. The parent is the path `reports/2026`, and the `name` of that path is its last part, `2026`.
%% end

## functools: tools for functions

The module `functools` has helpers that take a function and give you another one. Three are worth knowing.

The function `reduce(function, items, start)` **folds** a sequence into a single value. It calls the function on the first two items, then on that result and the third item, and so on:

```python run
from functools import reduce

print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))
print(reduce(lambda total, n: total + n, [1, 2, 3], 10))
print(reduce(max, [3, 9, 2]))
print(reduce(lambda a, b: a + b, [], 0))
```

The third argument is the **starting value**. It is where the folding begins, and it is what you get back when the list is empty. Without it, an empty list raises a `TypeError`. For sums and products, `sum` and `math.prod` already exist. `reduce` is for the other kinds of folding, such as merging a list of dictionaries into one.

The function `partial(function, ...)` **fills in some arguments in advance** and gives you a new function that takes the rest:

```python run
from functools import partial

binary = partial(int, base=2)
hexadecimal = partial(int, base=16)
print(binary("101"), binary("1111"))
print(hexadecimal("ff"), hexadecimal("10"))

def volume(length, width, height):
    return length * width * height

tall_box = partial(volume, 10)
print(tall_box(2, 3))
```

Here `binary("101")` means `int("101", base=2)`. Writing `binary` is shorter, and its name says what it does. The function `partial(volume, 10)` fixes the first argument, `length`, so `tall_box(2, 3)` calls `volume(10, 2, 3)`.

The third helper is `lru_cache`, which makes a function **remember** its answers. The classic example is the Fibonacci function, where every number is the sum of the two before it. The plain recursive version calls itself again and again for the same numbers: finding the 40th number would take over 330 million calls. With a cache, each number is worked out once:

```python preview run
from functools import lru_cache

calls = []

@lru_cache(maxsize=None)
def fib(n):
    calls.append(n)
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(40))
print(len(calls))
print(fib.cache_info())
```

The line that starts with `@` is a **decorator**. Module 14 explains how decorators work, and for now it is enough to read the line as "remember the answers of this function". The program asks for the 40th number and gets it from only 41 calls, because every repeated question is answered from the cache. The method `cache_info()` reports how many answers came from the cache (the `hits`) and how many had to be worked out (the `misses`).

%% question q-partial-predict | predict
What does this program print?

```python
from functools import partial

binary = partial(int, base=2)
print(binary("101"), binary("1111"))
```
%% answer
5 15
%% explain
The call `binary("101")` is the same as `int("101", base=2)`. The text `101` read in base 2 is 4 + 0 + 1, which is 5, and `1111` is 8 + 4 + 2 + 1, which is 15.
%% end

## operator: operators as functions

The module `operator` has a function for every operator (`add` for `+`, `mul` for `*`, and so on). They are useful wherever Python wants a **function** and you would otherwise write a `lambda`. The two most used are `itemgetter` and `attrgetter`. The first picks items by index or key, and the second picks attributes. Both are made for `key=` arguments:

```python run
from collections import namedtuple
from functools import reduce
from operator import add, attrgetter, itemgetter, mul

people = [
    {"name": "Ben", "age": 31},
    {"name": "Ada", "age": 36},
    {"name": "Cy", "age": 22},
]
youngest_first = sorted(people, key=itemgetter("age"))
print(youngest_first[0]["name"], youngest_first[-1]["name"])
print(itemgetter("name", "age")(people[0]))

Person = namedtuple("Person", "name age")
team = [Person("Ben", 31), Person("Ada", 36), Person("Cy", 22)]
for person in sorted(team, key=attrgetter("age"), reverse=True):
    print(person.name, person.age)

print(reduce(mul, [1, 2, 3, 4]))
print(reduce(add, [1, 2, 3], 10))
```

The expression `itemgetter("age")` does the same work as `lambda row: row["age"]`, and it is a little shorter and faster. Given several keys, as in `itemgetter("name", "age")`, it returns a **tuple** of the values, so `sorted(rows, key=itemgetter("age", "name"))` sorts by age and then by name. Python's sorting is **stable**: items with equal keys stay in their earlier order. That means you can sort by a minor key first and a major key second, a trick that the exercises use.

%% question q-itemgetter-fill | fill
Fill in the blank so that the program prints `Ada`.

```python
from operator import itemgetter

people = [{"name": "Ben", "age": 31}, {"name": "Ada", "age": 36}, {"name": "Cy", "age": 22}]
oldest = sorted(people, key=___("age"), reverse=True)[0]
print(oldest["name"])
```
%% answer
itemgetter
%% expected
Ada
%% explain
`itemgetter("age")` returns a function that picks the `"age"` of a dictionary, so the list is sorted by age. With `reverse=True` the oldest person comes first, and that is Ada, who is 36.
%% end

## textwrap and string: text helpers

Text that is too long for its place needs to be **wrapped** into lines. The `textwrap` module does that and also shortens, indents and cleans up text:

```python run
import textwrap

text = "Python comes with batteries included, and the standard library is the biggest battery"
print(textwrap.wrap("Python comes with batteries included", 14))
print(textwrap.fill(text, 30))
print(textwrap.shorten(text, 30))
print(textwrap.shorten(text, 30, placeholder="..."))
print(textwrap.indent("one\ntwo", "> "))
```

- `wrap(text, width)` returns a **list** of lines, each one no longer than `width`, and `fill` returns the same lines joined into one string.
- `shorten(text, width)` collapses the spaces, cuts the text at a word boundary, and adds `[...]`, or the `placeholder` that you choose, when it had to cut something off.
- `indent(text, prefix)` adds a prefix to every line, and `dedent(text)` removes the indentation that all lines share. It is useful for the triple-quoted strings in an indented function.

The module `string` holds **constants**: ready-made strings of characters. They save you from typing the alphabet, and from forgetting a character:

```python run
import string

print(string.ascii_lowercase)
print(string.digits)
print(string.punctuation)

password = "tr0ub4dor&3"
digits = 0
symbols = 0
for char in password:
    if char in string.digits:
        digits += 1
    if char in string.punctuation:
        symbols += 1
print(digits, symbols)
```

Besides `ascii_lowercase`, `ascii_uppercase`, `ascii_letters`, `digits` and `punctuation`, the module has `whitespace`, `hexdigits` and `octdigits`.

## time: measuring how long

The function `time.perf_counter()` is the clock for measuring. It returns seconds as a float, and only the **difference** between two readings means something. Take a reading before and one after the work that you want to measure:

```python run
import time

def slow_fib(n):
    if n < 2:
        return n
    return slow_fib(n - 1) + slow_fib(n - 2)

start = time.perf_counter()
answer = slow_fib(27)
elapsed = time.perf_counter() - start
print(answer)
print(f"slow_fib(27) took {elapsed:.3f} seconds on this computer")
```

The number of seconds depends on your computer, so yours will be different from anyone else's, and it changes a little from run to run. Measure the same work several times, and compare timings only on the same computer. Two more functions are good to know. `time.sleep(seconds)` pauses the program, and `time.time()` gives the number of seconds since 1 January 1970, the moment that computers use as their starting point. Remember that a program in this course stops after 10 seconds.

## hashlib, uuid and secrets: fingerprints and identifiers

A **hash function** turns any amount of data into a short, fixed-length **fingerprint**, which is called a digest. The module `hashlib` has the standard ones. The most used today is SHA-256, which gives 64 hexadecimal characters:

```python run
import hashlib

message = "hello world"
digest = hashlib.sha256(message.encode()).hexdigest()
print(digest)
print(len(digest))
print(hashlib.sha256("hello world!".encode()).hexdigest()[:16])
print(hashlib.sha256("hello world".encode()).hexdigest() == digest)
```

Hashing works on **bytes**, not on text, so the string goes through `.encode()` first. (Handing text straight to `sha256` is a `TypeError`.) Four properties make hashes useful:

1. The same data always gives the same digest.
2. A tiny change, such as one added `!`, gives a completely different digest.
3. The digest has the same length for any input, from one letter to a whole film.
4. You cannot work **backwards** from a digest to the data.

People use them as checksums (the author of a download publishes the digest, and you compare it with your own), to find duplicate files, and as keys for caches. A fast hash is **not** enough on its own to store passwords, because an attacker can try billions of guesses a second. Real systems use special slow hash functions, and they are handled by a library made for that job.

For identifiers and secrets, there are two more modules. The `uuid` module makes **universally unique identifiers**. A `uuid4` is random, and a `uuid5` is calculated from a name, so the same name always gives the same identifier. The `secrets` module makes random values that are safe to use as passwords and tokens:

```python run
import secrets
import uuid

ticket = uuid.uuid4()
print(len(str(ticket)), ticket.version)
print(uuid.uuid5(uuid.NAMESPACE_DNS, "python.org"))
print(uuid.uuid5(uuid.NAMESPACE_DNS, "python.org") == uuid.uuid5(uuid.NAMESPACE_DNS, "python.org"))
token = secrets.token_hex(8)
print(len(token))
```

The function `secrets.token_hex(8)` returns 8 random bytes as 16 hexadecimal characters. The module `random` from lesson 2 is **not** suitable for secrets, because it follows a formula, and someone who sees enough of its numbers can predict the next ones.

%% question q-hash-multi | multi
Select every true statement about `hashlib.sha256`.
%% choice correct
The same bytes always give the same digest.
%% choice correct
Changing one letter of the input changes the digest completely.
%% choice correct
The digest has the same length however long the input is.
%% choice
You can recover the original text from the digest.
%% choice
You can pass a normal `str` directly, without `.encode()`.
%% explain
Hashes are repeatable, they react strongly to any change, and they have a fixed length. They only work one way, so the text cannot be recovered. And they need bytes: a `str` raises a `TypeError` until you call `.encode()` on it.
%% end

%% question q-token-choice | choice
Your program makes a one-time login code that nobody must be able to guess. Which module should make it?
%% choice
`random`, because it is fast and can be seeded
%% choice correct
`secrets`, because it is made for passwords and tokens
%% choice
`uuid.uuid5`, because the same name always gives the same value
%% choice
`textwrap`, because it can shorten the code
%% explain
The numbers of `random` come from a formula, and with enough of them an attacker can predict the next ones. The `secrets` module uses the best source of randomness that the computer offers. A `uuid5` is predictable by design, because it is calculated from a name.
%% end

## Reading the documentation

The most useful skill in this lesson has no new module in it. Most of what you will use, you will have to look up, and the official **documentation** at docs.python.org is written for that. Its Library Reference has a page for every module of the standard library, and the page of a module is organised the same way every time: a first paragraph that says what the module is for, then the functions, classes and constants, each with its **signature** and a description, and very often an example.

You can read the same information inside Python, without a web page, with `help` and `dir`:

```python run
import inspect
import textwrap

help(textwrap.shorten)
print(inspect.signature(textwrap.wrap))

public = []
for name in dir(textwrap):
    if not name.startswith("_"):
        public.append(name)
print(public)
```

The function `help(thing)` prints the documentation string of a function, class or module. The function `dir(module)` lists every name in it, and the loop above keeps those that do not begin with an underscore, since a leading underscore marks a name as private. The listing includes the helper `re`, which `textwrap` itself imports.

A signature is a compact description of how to call a function. Take `random.sample(population, k, *, counts=None)`:

- `population` and `k` have **no default**, so you must give them.
- `counts=None` has a default, so it is optional.
- The bare `*` means that every parameter **after** it must be given by name, as `counts=[...]`. (You met keyword-only parameters in module 7.)

A routine that works for any module:

1. Read the first paragraph, to learn what the module is for.
2. Find the function you need, by name or with the search box.
3. Read its signature, and which of the parameters are required.
4. Copy the example into the playground and change it, to see what each part does.
5. Look for the notes such as "Changed in version 3.12", which explain why an old example may not work.

%% question q-signature-choice | choice
The documentation gives the signature `random.sample(population, k, *, counts=None)`. What does the `*` mean?
%% choice
The function accepts any number of populations
%% choice correct
Every parameter after the `*` must be passed by name
%% choice
The parameter `k` is optional
%% choice
The function returns several values
%% explain
A bare star in a signature ends the positional parameters. What follows it, here `counts`, is keyword-only: you write `counts=[...]`. The parameter `k` has no default, so it is required.
%% end

### What the browser cannot do

The Python in this course runs inside your browser, and a browser protects you by not letting a web page start programs, run threads, or open network connections the way a normal computer program can. A few modules of the standard library therefore cannot do their job here:

```python run
import sys

print(sys.platform)
try:
    import subprocess
    subprocess.run(["echo", "hi"])
except Exception as error:
    print("subprocess:", type(error).__name__)
try:
    import threading
    threading.Thread(target=print).start()
except Exception as error:
    print("threading:", type(error).__name__)
```

The platform shows as `emscripten`, which is the technology that runs Python in the browser. Starting a program with `subprocess` and starting a thread with `threading` both fail. The same holds for network modules such as `urllib` and `socket`, so a program here cannot download a web page. Packages that come from outside the standard library, such as `requests` or `numpy`, are also missing, because the course has no `pip`. On your own computer all of these work, and you will use them in the next stage of your learning. Everything in this course runs without them.

## A project: a duplicate file finder

The modules of this lesson combine well. The program below makes a folder of notes, then measures each file, fingerprints its contents with a hash, lists the files in size order with `itemgetter`, and finds files with identical contents by grouping the names under their digests with a `defaultdict`:

```python run
from collections import defaultdict
from hashlib import sha256
from operator import itemgetter
from pathlib import Path

folder = Path("notes")
folder.mkdir(exist_ok=True)
(folder / "a.txt").write_text("buy milk\n")
(folder / "b.txt").write_text("call Ada\n")
(folder / "copy-of-a.txt").write_text("buy milk\n")

records = []
for path in sorted(folder.glob("*.txt")):
    digest = sha256(path.read_bytes()).hexdigest()
    records.append({"name": path.name, "size": path.stat().st_size, "hash": digest[:8]})

for record in sorted(records, key=itemgetter("size", "name")):
    print(f"{record['name']:<14} {record['size']:>3} {record['hash']}")

by_hash = defaultdict(list)
for record in records:
    by_hash[record["hash"]].append(record["name"])
for names in by_hash.values():
    if len(names) > 1:
        print("duplicates:", ", ".join(names))
```

Two files with the same hash have, for all practical purposes, the same contents, even when their names differ. A real tool does exactly this on a whole disk, with `rglob("*")` in place of `glob("*.txt")`.

## Your turn

%% exercise file-parts | File parts
Read a file path as text. Using `pathlib`, print its name, its stem, its suffix (or `(none)` when it has no suffix), its folder, and the same path with the suffix changed to `.zip`. A bare name has the folder `.`. For the input below the program prints:

```output
Name: summary.final.txt
Stem: summary.final
Suffix: .txt
Folder: reports/2026
Zipped: reports/2026/summary.final.zip
```
%% stdin
reports/2026/summary.final.txt
%% starter
from pathlib import Path

# Read the path, then print the five lines.

%% solution
from pathlib import Path

path = Path(input().strip())
print(f"Name: {path.name}")
print(f"Stem: {path.stem}")
if path.suffix:
    print(f"Suffix: {path.suffix}")
else:
    print("Suffix: (none)")
print(f"Folder: {path.parent}")
print(f"Zipped: {path.with_suffix('.zip')}")
%% tests
expect_output("Name: summary.final.txt\nStem: summary.final\nSuffix: .txt\nFolder: reports/2026\nZipped: reports/2026/summary.final.zip")
check(rerun("README").strip() == "Name: README\nStem: README\nSuffix: (none)\nFolder: .\nZipped: README.zip", "a bare name")
check(rerun("a/b.tar.gz").strip() == "Name: b.tar.gz\nStem: b.tar\nSuffix: .gz\nFolder: a\nZipped: a/b.tar.zip", "two suffixes")
check(calls("Path"), "uses Path")
%% hint
`Path(text)` turns the text into a path object. The attributes `.name`, `.stem`, `.suffix` and `.parent` hold the pieces.
%% hint
When a path has no suffix, `path.suffix` is an empty string, so `if path.suffix:` is false and you can print `(none)` instead.
%% hint
`path.with_suffix(".zip")` makes the new path, and an f-string can print a `Path` directly.
%% end

%% exercise leaderboard | Leaderboard
Read lines of the form `name score` until the line `done`. Print the leaderboard with the **highest score first**. Players with the same score appear in alphabetical order. Each line shows the rank, the name and the score, as in `1. Ada 92`. Use `operator.itemgetter` for the sort keys. For the input below the program prints:

```output
1. Ada 92
2. Dee 85
3. Ben 78
4. Cy 78
```
%% stdin
Ben 78
Ada 92
Cy 78
Dee 85
done
%% starter
from operator import itemgetter

rows = []
# Read the lines until "done", then sort and print the leaderboard.

%% solution
from operator import itemgetter

rows = []
while True:
    line = input()
    if line == "done":
        break
    name, score = line.split()
    rows.append((name, int(score)))

rows.sort(key=itemgetter(0))
rows.sort(key=itemgetter(1), reverse=True)
for rank, (name, score) in enumerate(rows, start=1):
    print(f"{rank}. {name} {score}")
%% tests
expect_output("1. Ada 92\n2. Dee 85\n3. Ben 78\n4. Cy 78")
check(rerun("Zed 5\nAmy 5\ndone").strip() == "1. Amy 5\n2. Zed 5", "equal scores are alphabetical")
check(rerun("Solo 10\ndone").strip() == "1. Solo 10", "one player")
check(rerun("done").strip() == "", "nobody")
check(rerun("A 9\nB 10\nC 9\nD 10\ndone").strip() == "1. B 10\n2. D 10\n3. A 9\n4. C 9", "two groups of ties")
check(calls("itemgetter"), "uses itemgetter")
%% hint
Collect `(name, score)` tuples in a list, and convert the score with `int`.
%% hint
Python's sort is **stable**, so items with equal keys keep their earlier order. Sort by the name first, and then sort again by the score with `reverse=True`.
%% hint
`itemgetter(0)` picks the name and `itemgetter(1)` picks the score. For the numbers, loop with `enumerate(rows, start=1)`.
%% end

%% exercise verify-checksums | Verify the checksums
A download comes with a published **checksum** so that you can see whether it changed. Here the downloads are short messages. Read pairs of lines until the message line is `done`: the message, then its published checksum, which is the first 8 characters of the SHA-256 digest in hexadecimal. Ignore the case of the published checksum. Print `OK` when the message matches its checksum, and otherwise `CHANGED (real checksum xxxxxxxx)` with the real one. For the input below the program prints:

```output
OK
CHANGED (real checksum 7509e5bd)
```
%% stdin
hello world
b94d27b9
hello world!
b94d27b9
done
%% starter
import hashlib

# Read the messages and their checksums, and compare them.

%% solution
import hashlib

while True:
    message = input()
    if message == "done":
        break
    published = input().strip().lower()
    real = hashlib.sha256(message.encode()).hexdigest()[:8]
    if real == published:
        print("OK")
    else:
        print(f"CHANGED (real checksum {real})")
%% tests
expect_output("OK\nCHANGED (real checksum 7509e5bd)")
check(rerun("hello\n2cf24dba\ndone").strip() == "OK", "another message")
check(rerun("hello\n2CF24DBA\ndone").strip() == "OK", "capital letters in the checksum")
check(rerun("\ne3b0c442\ndone").strip() == "OK", "an empty message")
check(rerun("hello\n00000000\ndone").strip() == "CHANGED (real checksum 2cf24dba)", "a wrong checksum")
check(calls("sha256"), "uses sha256")
%% hint
A hash works on **bytes**, so turn the text into bytes first with `.encode()`.
%% hint
`hashlib.sha256(data).hexdigest()` gives 64 characters. A slice such as `[:8]` keeps the first 8.
%% hint
Read the message with `input()`, and the checksum with a second `input()` inside the same loop. Compare after `.strip().lower()`.
%% end

%% exercise duplicate-finder | Challenge: Duplicate finder
Read lines of the form `name=text` until the line `done`. The text can contain `=` signs too. Save each text in its own file `box/<name>.txt`: make the folder `box` first, and do not fail when it exists already. Then scan the folder with `glob`, read each file as **bytes**, and group the file names by the SHA-256 digest of the contents. For every group with more than one file, print `same: ` and the names, sorted and separated by commas. The groups come in alphabetical order of their first name. The last line is `N files, M different`, where N is the number of files and M is the number of different contents. For the input below the program prints:

```output
same: a, c
same: b, d
5 files, 3 different
```
%% stdin
a=buy milk
b=call Ada
c=buy milk
d=call Ada
e=water the plants
done
%% starter
import hashlib
from collections import defaultdict
from pathlib import Path

# Save the files, then group them by digest.

%% solution
import hashlib
from collections import defaultdict
from pathlib import Path

box = Path("box")
box.mkdir(exist_ok=True)
while True:
    line = input()
    if line == "done":
        break
    name, text = line.split("=", 1)
    (box / f"{name}.txt").write_text(text + "\n")

groups = defaultdict(list)
for path in sorted(box.glob("*.txt")):
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    groups[digest].append(path.stem)

shared = []
total = 0
for names in groups.values():
    total += len(names)
    if len(names) > 1:
        shared.append(sorted(names))
shared.sort()
for names in shared:
    print("same: " + ", ".join(names))
print(f"{total} files, {len(groups)} different")
%% tests
expect_output("same: a, c\nsame: b, d\n5 files, 3 different")
check(rerun("x=1\ny=1\nz=2\ndone").strip() == "same: x, y\n3 files, 2 different", "one group")
check(rerun("p=a=b\nq=a=b\ndone").strip() == "same: p, q\n2 files, 1 different", "an equals sign in the text")
check(rerun("m=1\nn=2\ndone").strip() == "2 files, 2 different", "no duplicates")
check(rerun("done").strip() == "0 files, 0 different", "no files")
check(calls("sha256"), "uses sha256")
check(calls("glob"), "scans the folder with glob")
%% hint
Split each line with `line.split("=", 1)`: the second argument stops after the first `=`, so the text keeps any other signs. Write the file with `(box / f"{name}.txt").write_text(...)`.
%% hint
Loop over `sorted(box.glob("*.txt"))`. A `defaultdict(list)` can group the names: `groups[digest].append(path.stem)`.
%% hint
Collect the sorted name lists of the groups that have two or more names, and sort that list of lists, which puts the groups in the order of their first names. The totals come from `len(names)` for each group and `len(groups)` for the digests.
%% end

## What you learned

- `Path` takes a path apart (`name`, `stem`, `suffix`, `parent`, `parts`, `with_suffix`) without touching the disk. Other methods work on the disk: `mkdir(parents=True, exist_ok=True)`, `glob` and `rglob` (in no guaranteed order, so use `sorted`), `iterdir`, `stat().st_size`, `unlink` and `rename`.
- `functools.reduce` folds a sequence into one value (give it a starting value), `partial` fixes some arguments of a function in advance, and `lru_cache` makes a function remember its answers. The `@` line above a function is a decorator, which module 14 explains.
- `operator.itemgetter` and `attrgetter` make `key=` functions for sorting. Sorting is stable, so you can sort by a minor key first and a major key second.
- `textwrap` has `wrap`, `fill`, `shorten`, `indent` and `dedent`, and `string` has constants such as `ascii_lowercase`, `digits` and `punctuation`.
- `time.perf_counter()` measures elapsed time, and only the difference between two readings is meaningful.
- `hashlib.sha256(data.encode()).hexdigest()` gives a fixed-length fingerprint that cannot be reversed. `uuid` makes identifiers, and `secrets` (not `random`) makes passwords and tokens.
- Learn any module with its documentation page, `help()` and `dir()`: read the first paragraph, then the signature, then try the example. Threads, subprocesses, network access and third-party packages are not available in the browser.
