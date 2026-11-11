---
title: Reading and writing files
---
%% file notes.txt
first line
second line
third line
%% end

%% file poem.txt
Roses are red
Violets are blue
Sugar is sweet
And so are you
%% end

Until now, everything that your programs knew disappeared when they ended. A variable lives only while the program runs. **Files** are how a program keeps information for later, reads information that someone else prepared, and hands its results to other programs. In this lesson you learn to read text files, to write them, and to avoid the usual mistakes.

%% note How files work on this site
Each run on this site starts in a fresh, private, empty folder, and everything that your program writes there disappears when it ends. Lessons and exercises supply the files that they need, which is why `notes.txt` and `poem.txt` are available in the examples below. On your own computer the same code works with real files, which stay in the folder next to your program.
%% end

## Opening and reading a file

The built-in function `open` takes the name of a file and gives you a **file object**. Its method `read()` returns the whole content as one string. When you have finished, you must `close` the file:

```python run
f = open("notes.txt")
text = f.read()
f.close()
print(text)
print(len(text))
```

If the program stops with an error before it reaches `close()`, the file stays open. The fix is the **with** statement, which closes the file for you when its block ends, even after an error:

```python run
with open("notes.txt") as f:
    text = f.read()
print(f.closed)
print(text.splitlines())
```

Make `with open(...) as f:` your habit. Everything that you do with the file goes inside the indented block, and the file is closed automatically when the block ends.

%% key Always open files with with
`with open(name) as f:` closes the file when the block ends, however it ends. You never have to remember to call `close()`.
%% end

## Reading line by line

A file object can be used in a `for` loop, and it gives one line at a time. Every line still has its line break at the end, so `print` adds a second one, and the output looks double spaced:

```python run
with open("notes.txt") as f:
    for line in f:
        print(line)
```

Remove the break with `rstrip("\n")`, or with `strip()` if you also want to drop spaces at both ends:

```python run
with open("notes.txt") as f:
    for line in f:
        print(line.rstrip("\n"))
```

There are two more ways to read. `readline()` returns one line at a time, and `readlines()` returns a list of all the remaining lines:

```python run
with open("notes.txt") as f:
    first = f.readline()
    rest = f.readlines()
print(first.strip())
print(rest)
```

The list in the output shows the `\n` at the end of each line. For a small file, `f.read().splitlines()` is a tidy way to get a list of lines without the breaks. For a big file, the `for` loop is best, because it never holds more than one line in memory.

%% question q-lines-predict | predict
What does this program print?

```python
with open("a.txt", "w") as f:
    f.write("one")
    f.write("two")
with open("a.txt") as f:
    print(f.read())
```
%% answer
onetwo
%% explain
`write` does not add a line break, so the two pieces of text sit next to each other in the file. To start a new line, you must write `"\n"` yourself.
%% end

## Writing files

The second argument of `open` is the **mode**. Mode `"w"` opens a file for writing. If the file does not exist, it is created, and **if it exists, its old content is erased**. The method `write` writes exactly the text that you give it, so you add the line breaks yourself. A `print` with `file=f` is an alternative that adds the break for you:

```python run
with open("shopping.txt", "w") as f:
    f.write("milk\n")
    f.write("eggs\n")
    print("bread", file=f)

with open("shopping.txt") as f:
    print(f.read())
```

The three common modes are in this table:

| Mode | Meaning | The file exists | The file does not exist |
| --- | --- | --- | --- |
| `"r"` | read (the default) | you read it | FileNotFoundError |
| `"w"` | write | the old content is erased | the file is created |
| `"a"` | append | new text goes at the end | the file is created |

Opening with `"w"` twice shows how quickly data can be lost:

```python run
with open("data.txt", "w") as f:
    f.write("version 1\n")
with open("data.txt", "w") as f:
    f.write("version 2\n")
with open("data.txt") as f:
    print(f.read())
```

When you want to add to a file without destroying it, use mode `"a"`:

```python run
with open("log.txt", "w") as f:
    f.write("start\n")
with open("log.txt", "a") as f:
    f.write("next\n")
with open("log.txt") as f:
    print(f.read())
```

%% question q-mode-fill | fill
Fill in the blank so that the program prints `2`.

```python
with open("log.txt", "w") as f:
    f.write("start\n")
with open("log.txt", "___") as f:
    f.write("next\n")
with open("log.txt") as f:
    print(f.read().count("\n"))
```
%% answer
a
%% expected
2
%% explain
Mode `"a"` appends to the end of the file, so both lines stay in it and there are two line breaks. Mode `"w"` would erase `start` first, and only one line break would be left.
%% end

## Text encodings

A file holds bytes, and an **encoding** says how characters become bytes. Name it explicitly when you open a text file, because the default depends on the computer. `"utf-8"` is the right choice nearly always, and it handles every alphabet:

```python run
with open("menu.txt", "w", encoding="utf-8") as f:
    f.write("café 3.50\n")
with open("menu.txt", encoding="utf-8") as f:
    print(f.read())
```

## Paths with pathlib

A file name can be more than a name. It can include folders, and different systems write them differently. The `pathlib` module has a `Path` class that works the same everywhere. A `Path` can answer questions about a file, and it can read or write a whole text file in one call:

```python run
from pathlib import Path

path = Path("notes.txt")
print(path.exists(), path.name, path.stem, path.suffix)
print(path.read_text().splitlines())
Path("hello.txt").write_text("Hello!\n")
print(Path("hello.txt").read_text())
print(Path("reports") / "march.txt")
```

The slash operator joins parts of a path. `read_text` and `write_text` are convenient for small files, while `open` with a `for` loop is better for large ones. A `Path` also tells you whether a file exists, which lets a program choose what to do:

```python run
from pathlib import Path

if Path("settings.txt").exists():
    print("Loading the settings")
else:
    print("No settings yet, using the defaults")
```

## When the file is missing

Opening a file for reading that does not exist is an error:

```python run error
with open("missing.txt") as f:
    print(f.read())
```

Python reports a **FileNotFoundError**. A program can also catch such an error and carry on, with a `try` statement, which module 9 explains properly. Here is a first look, so that you recognise it:

```python preview
try:
    with open("missing.txt") as f:
        text = f.read()
except FileNotFoundError:
    text = ""
    print("No such file, starting empty")
```

The block after `try` is attempted, and when that error happens, the block after `except` runs instead of stopping the program. Until then, you can use `Path(name).exists()` to check first.

%% question q-with-multi | multi
Select every true statement about `with open(...) as f:`.
%% choice correct
The file is closed automatically when the block ends.
%% choice correct
The file is closed even when an error happens inside the block.
%% choice
Files cannot be opened without it.
%% choice
It reads the whole file into memory at once.
%% explain
`with` takes care of closing. You can open a file without it, but then closing is your job. Opening a file does not read it: reading is done by `read`, by a loop or by `readlines`.
%% end

## A small project: file statistics

Combine the pieces to measure a text file: the number of lines, words and characters, and the longest line:

```python run
lines = 0
words = 0
characters = 0
longest = ""
with open("poem.txt") as f:
    for line in f:
        line = line.rstrip("\n")
        lines += 1
        words += len(line.split())
        characters += len(line)
        if len(line) > len(longest):
            longest = line
print("Lines:", lines)
print("Words:", words)
print("Characters:", characters)
print("Longest line:", longest)
```

The same program works for any text file, which is the point of reading files: the program stays the same, and the data changes.

## A second project: the guest book

A program can also **remember** what it was told. The guest book appends every name to a file, and lists the file on request. The commands arrive from the keyboard:

```python run stdin="add Ada\nadd Grace\nlist\nquit"
from pathlib import Path

book = Path("guests.txt")
while True:
    command = input("> ").split()
    if command[0] == "quit":
        break
    if command[0] == "add":
        with open("guests.txt", "a") as f:
            print(command[1], file=f)
    elif command[0] == "list":
        if book.exists():
            for name in book.read_text().splitlines():
                print("-", name)
        else:
            print("No guests yet")
```

On your own computer, the guest book would still be there the next time that you run the program.

%% question q-order-write | order
Put the lines in order so that the program prints `hello`. One line does not belong.
%% lines
with open("greeting.txt", "w") as f:
    f.write("hello\n")
with open("greeting.txt") as f:
    print(f.read().strip())
%% distractors
    f.write(hello)
%% expected
hello
%% explain
The file has to be written before it is read, and each `with` block holds the lines that use its file. The line `f.write(hello)` fails, because `hello` without quotes is a name that does not exist.
%% end

## Your turn

%% exercise count-lines | Count the lines
The file `shopping.txt` is in your folder. Open it with a `with` block, and print how many lines it has. The program prints:

```output
4
```
%% file shopping.txt
milk
eggs
bread
butter
%% starter
# Open shopping.txt with a with block.

%% solution
with open("shopping.txt") as f:
    lines = f.readlines()
print(len(lines))
%% tests
expect_output("4")
check(calls("open"), "opens the file with open()")
check(uses("With"), "uses a with block")
%% hint
Start with `with open("shopping.txt") as f:`.
%% hint
`f.readlines()` gives a list with one item for each line.
%% hint
Print `len(lines)` after the `with` block.
%% end

%% exercise squares-file | Squares in a file
Write the squares of the numbers 1 to 5 into a file called `squares.txt`, one number per line. Then read the file back, add up the numbers in it, and print the sum. The program prints:

```output
55
```
%% starter
# Write squares.txt first, then read it back.

%% solution
with open("squares.txt", "w") as f:
    for n in range(1, 6):
        f.write(f"{n * n}\n")

total = 0
with open("squares.txt") as f:
    for line in f:
        total += int(line)
print(total)
%% tests
content = open("squares.txt").read()
expect_output("55")
check(content.splitlines() == ["1", "4", "9", "16", "25"], "squares.txt holds 1, 4, 9, 16 and 25, one per line")
check(calls("open"), "uses open()")
%% hint
Open `squares.txt` with mode `"w"` and write `f"{n * n}\n"` for each n from 1 to 5.
%% hint
Open the file again for reading, in a second `with` block.
%% hint
`int(line)` turns a line such as `"4\n"` into the number 4, because `int` ignores the line break. Add each number to a total.
%% end

%% exercise append-log | Append to the log
The file `log.txt` has the lines `start` and `running`. Append the line `stopped` to it, without losing the old lines. Then read the file and print every line in upper case. The program prints:

```output
START
RUNNING
STOPPED
```
%% file log.txt
start
running
%% starter
# Append first (mode "a"), then read the whole file.

%% solution
with open("log.txt", "a") as f:
    f.write("stopped\n")

with open("log.txt") as f:
    for line in f:
        print(line.strip().upper())
%% tests
content = open("log.txt").read()
expect_output("START\nRUNNING\nSTOPPED")
check(content.splitlines() == ["start", "running", "stopped"], "log.txt ends with the new line and keeps the old ones")
check(calls("open"), "uses open()")
%% hint
Mode `"a"` adds to the end of the file instead of erasing it.
%% hint
Write `"stopped\n"` so that the line ends properly.
%% hint
Read the file again in a second `with` block, and print `line.strip().upper()` for each line.
%% end

%% exercise clean-copy | Challenge: A clean copy
The file `messy.txt` has blank lines, lines with only spaces, and extra spaces around the words. Write a clean copy to `clean.txt`: skip every line that is blank, strip the others, and number them in the form `1. apples`. Then print how many lines were written. The program prints:

```output
3
```
%% file messy.txt
  apples  

bananas
   
  cherries
%% starter
# Read messy.txt and write clean.txt in the same program.

%% solution
count = 0
with open("messy.txt") as source:
    with open("clean.txt", "w") as target:
        for line in source:
            line = line.strip()
            if line != "":
                count += 1
                target.write(f"{count}. {line}\n")
print(count)
%% tests
content = open("clean.txt").read()
expect_output("3")
check(content.splitlines() == ["1. apples", "2. bananas", "3. cherries"], "clean.txt has the numbered lines without blanks")
check(calls("open"), "uses open()")
%% hint
You can have two `with` blocks inside each other: one to read `messy.txt`, one to write `clean.txt`.
%% hint
`line.strip()` removes the line break and the spaces. If the result is an empty string, skip the line.
%% hint
Keep a counter. For each kept line, add 1, and write `f"{count}. {line}\n"`.
%% end

## What you learned

- `open(name)` gives a file object, and `with open(name) as f:` closes it for you. Always use `with`.
- `f.read()` returns all the text, `for line in f:` goes through the lines, `readline()` reads one, and `readlines()` returns a list. Each line keeps its `\n`, so use `rstrip("\n")` or `strip()`.
- Mode `"r"` reads, `"w"` writes and **erases** the old content, and `"a"` appends. `write` adds no line break, while `print(text, file=f)` does.
- Name the encoding with `encoding="utf-8"` when the text can contain more than plain English letters.
- `Path` from `pathlib` handles file names, folders, `exists()`, `read_text()` and `write_text()`.
- A missing file raises a FileNotFoundError, which `try` and `except` can catch (more in module 9).
- On this site every run starts in an empty folder, and lessons supply the files they need.
