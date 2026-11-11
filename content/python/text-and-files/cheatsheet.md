---
title: Text and files: cheat sheet
---
## Cutting, joining and searching text

```python
text.split()                  # cut at white space, no empty pieces
text.split(",")               # cut at every comma (empty pieces possible)
text.split(",", 1)            # cut once
text.splitlines()             # cut at line breaks
", ".join(items)              # glue a list of strings
text.partition("=")           # (before, "=", after) or (text, "", "")
text.strip()                  # lstrip() and rstrip() work on one end
text.strip("-")               # a set of characters, not a word
text.replace("old", "new")    # a new string, the original stays
text.find("x")                # position or -1 (index raises ValueError)
text.count("an")              # non-overlapping matches
text.startswith(("a", "b"))   # a tuple of options works too
text.isdigit()                # also isalpha, isalnum, isspace, isupper, islower
```

## Aligning and formatting

```python
"tea".ljust(10)               # left in 10 columns
"tea".rjust(10)               # right in 10 columns
"tea".center(10, "*")         # centred, padded with *
"42".zfill(6)                 # "000042"
f"{name:<10}{price:>8.2f}"    # < left, > right, ^ centre, .2f two decimals
f"{1234.5:,.2f}"              # 1,234.50
"{} has {}".format("Ada", 3)  # the same format language
ord("A")                      # 65
chr(65)                       # "A"
r"C:\new\table"               # a raw string keeps its backslashes
```

## Files

| Mode | Meaning |
| --- | --- |
| `"r"` | read (the default), FileNotFoundError if the file is missing |
| `"w"` | write, and the old content is erased |
| `"a"` | append to the end |

```python
with open("data.txt", encoding="utf-8") as f:
    text = f.read()               # all the text
    lines = f.readlines()         # a list of lines, each ends with \n

with open("data.txt") as f:
    for line in f:                # one line at a time
        print(line.rstrip("\n"))

with open("out.txt", "w") as f:
    f.write("one line\n")         # write adds no line break
    print("another", file=f)      # print does
```

```python
from pathlib import Path

path = Path("notes.txt")
path.exists()                     # True or False
path.read_text()                  # the whole text
path.write_text("hello\n")        # write a whole text
path.name                         # "notes.txt"
path.stem                         # "notes"
path.suffix                       # ".txt"
Path("reports") / "march.txt"     # join path parts
```

## CSV

```python
import csv

with open("grades.csv", newline="") as f:
    for row in csv.DictReader(f):             # row["name"], all values are strings
        total = int(row["maths"]) + int(row["english"])

with open("top.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "total"])
    writer.writeheader()
    writer.writerows(rows)                    # rows is a list of dictionaries
```

`csv.reader(f)` and `csv.writer(f)` use plain lists. `io.StringIO(text)` is a file made of text, for practice.

## JSON

```python
import json

text = json.dumps(data, indent=2, sort_keys=True)   # Python value to text
data = json.loads(text)                             # text to Python value
json.dump(data, f)                                  # to an open file
data = json.load(f)                                 # from an open file
```

| Python | JSON |
| --- | --- |
| dict | object |
| list, tuple | array |
| str | string |
| int, float | number |
| True, False | true, false |
| None | null |

JSON keys are always strings, and sets have no JSON form.

## Regular expressions

```python
import re

re.search(r"\d+", text)         # first match anywhere, or None
re.match(r"\d+", text)          # the match must start at the beginning
re.fullmatch(r"\d{5}", text)    # the whole text must fit
re.findall(r"\d+", text)        # a list of all matches
re.sub(r"\s+", " ", text)       # replace every match
m = re.search(r"(\d+)-(\d+)", text)
m.group(1)                      # the first group
m.groups()                      # all the groups
```

| Pattern | Matches |
| --- | --- |
| `\d` `\w` `\s` | a digit, a word character, a white space character |
| `.` | any character except a line break |
| `[a-z]` `[^0-9]` | one character from a range, or not from a set |
| `*` `+` `?` | zero or more, one or more, zero or one |
| `{3}` `{2,4}` | exactly 3, from 2 to 4 |
| `^` `$` | the start and the end of the text |
| `( )` | a group |

Quantifiers are greedy. Add `?` after them to make them lazy: `<.+>` against `<.+?>`.
