---
title: Text and files: module quiz
pass: 70
---
Twelve questions on everything in this module: string methods, files, CSV, JSON, regular expressions and the text recipes. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | predict
What does this program print?

```python
print("name=Ada=Lovelace".partition("="))
```
%% answer
('name', '=', 'Ada=Lovelace')
%% explain
`partition` cuts at the **first** separator only. It returns a tuple of three parts: the text before it, the separator itself, and everything after it, even when that contains more separators.
%% end

%% question q2 | choice
Which call removes every dash from the text `"0803-111-2222"`?
%% choice
`.strip("-")`
%% choice correct
`.replace("-", "")`
%% choice
`.split("-")`
%% choice
`.remove("-")`
%% explain
`replace` swaps every occurrence of a text for another one, and an empty replacement deletes it. `strip` only touches the two ends, `split` returns a list, and strings have no `remove` method.
%% end

%% question q3 | multi
Select every expression that gives `True`.
%% choice correct
`"Banana".lower().startswith("ban")`
%% choice correct
`"x1".isalnum()`
%% choice
`"12.5".isdigit()`
%% choice
`"".isspace()`
%% choice correct
`"abc".endswith(("c", "d"))`
%% explain
The first one lowers the text before it tests the start, `x1` has only letters and digits, and `endswith` accepts a tuple of options. The text `12.5` has a dot, which is not a digit, and an empty string gives `False` for `isspace`.
%% end

%% question q4 | fill
Fill in the blank so that the program prints `3.14`.

```python
print(f"{3.14159:___}")
```
%% answer
.2f
%% expected
3.14
%% explain
In the format spec, `.2f` means a fixed-point number with two digits after the decimal point. The number 3.14159 is rounded to 3.14.
%% end

%% question q5 | order
Put the lines in order so that the program prints `3`. One line does not belong.
%% lines
with open("data.txt", "w") as f:
    f.write("a\nb\nc\n")
with open("data.txt") as f:
    print(len(f.readlines()))
%% distractors
    f.write(a, b, c)
%% expected
3
%% explain
The file has to be written before it is read, and each `with` block holds the lines that use its file. `write` takes one string, so `f.write(a, b, c)` fails. `readlines` returns one item for each line, and there are three lines.
%% end

%% question q6 | choice
A file `log.txt` holds lines that must be kept. Which mode adds a new line at the end without erasing the old ones?
%% choice
`"w"`
%% choice correct
`"a"`
%% choice
`"r"`
%% choice
`"n"`
%% explain
Mode `"a"` appends. Mode `"w"` erases the old content first, mode `"r"` only reads, and `"n"` is not a mode.
%% end

%% question q7 | predict
What does this program print?

```python
import json

data = json.loads('{"a": [1, 2, {"b": 3}]}')
print(data["a"][2]["b"] + len(data["a"]))
```
%% answer
6
%% explain
`data["a"]` is the list `[1, 2, {"b": 3}]`. Its item at position 2 is a dictionary, and `["b"]` gives 3. The list has 3 items, so the sum is 3 + 3, which is 6.
%% end

%% question q8 | multi
Select every true statement about CSV files and the `csv` module.
%% choice correct
Every value that is read from a CSV file is a string.
%% choice correct
`csv.DictReader` uses the header row as the keys of each dictionary.
%% choice correct
A CSV file should be opened with `newline=""`.
%% choice
`csv.reader` converts numbers automatically.
%% choice
`line.split(",")` handles commas inside quoted values correctly.
%% explain
The module gives you strings, and you convert them yourself. It uses the header for the keys, and `newline=""` lets it see the line breaks exactly as they are. Plain `split` cuts at every comma, quoted or not.
%% end

%% question q9 | predict
What does this program print?

```python
import re

print(re.sub(r"\d+", "#", "room 42, floor 7"))
```
%% answer
room #, floor #
%% explain
The pattern `\d+` matches each run of digits. `sub` replaces the run `42` and the run `7` with a `#`, and leaves the rest of the text as it was.
%% end

%% question q10 | choice
Which pattern makes `re.fullmatch` accept a text only when it is exactly five digits?
%% choice correct
`\d{5}`
%% choice
`\d+`
%% choice
`\d{1,5}`
%% choice
`\w{5}`
%% explain
`\d{5}` means exactly five digits. `\d+` and `\d{1,5}` accept shorter texts, and `\w{5}` accepts letters and underscores as well.
%% end

%% question q11 | fill
Fill in the blank so that the program prints `c`.

```python
print(chr(ord("a") + ___))
```
%% answer
2
%% expected
c
%% explain
`ord("a")` is 97. Adding 2 gives 99, and `chr(99)` is the letter `c`, which is two places after `a` in the alphabet.
%% end

%% question q12 | predict
What does this program print?

```python
smile = chr(128512)
print(len(smile), len(smile.encode("utf-8")))
```
%% answer
1 4
%% explain
The emoji is **one character**, so `len` gives 1. In UTF-8 it takes four bytes, so the encoded form has length 4. Characters and bytes are different things.
%% end
