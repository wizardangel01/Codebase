---
title: String methods
---
Text is the most common kind of data in programs: names, messages, web pages, log files and every line that arrives from a keyboard or a file. Strings come with a large toolbox of methods for cleaning, searching, cutting and reshaping text. You already know a few of them, such as `upper`, `strip` and `split`. This lesson fills in the rest of the toolbox, shows the tools that make tidy tables, and finishes with a secret code, the Caesar cipher.

Keep one fact in mind all the way through: a string **cannot be changed**. Every method returns a **new** string and leaves the old one as it was:

```python run
word = "python"
shout = word.upper()
print(word, shout)
word.upper()
print(word)
```

The call `word.upper()` on its own line makes a new string and throws it away, because nothing stores it. To keep a result, assign it to a name.

## Splitting text into pieces

`split()` with no argument cuts at any run of white space, and it never produces empty pieces. `split(",")` with a separator cuts at **every** separator, and empty pieces appear when two separators touch:

```python run
text = "  to   be  or "
print(text.split())
print(text.split(" "))
print("a,b,,c".split(","))
```

A second argument limits the number of cuts. This is handy when only the first separator matters:

```python run
line = "name=Ada Lovelace=London"
print(line.split("=", 1))
```

`splitlines()` cuts at line breaks. Compare it with splitting at the newline character yourself:

```python run
poem = "Roses are red\nViolets are blue\n"
print(poem.splitlines())
print(poem.split("\n"))
```

`splitlines()` does not leave an empty piece after the last line break, which makes it the right choice for the text of a file.

%% question q-split-predict | predict
What does this program print?

```python
print("a,b,,c".split(","))
```
%% answer
['a', 'b', '', 'c']
%% explain
There are two commas in a row, so the piece between them is an empty string. `split(",")` keeps empty pieces, unlike `split()` with no argument.
%% end

## Joining pieces back together

`join` is the opposite of `split`. The text in front of the dot is the **glue**, and the list is the pieces. The glue can be anything, including an empty string or a line break:

```python run
words = ["to", "be", "or", "not"]
print(" ".join(words))
print("-".join(words))
print("".join(words))
print("\n".join(words))
```

All the items must be strings. To join numbers, turn them into text first with `str`.

## Strip: removing the edges

`strip()` removes white space from both ends, `lstrip()` from the left end only and `rstrip()` from the right end only. You can also give a string of characters to remove:

```python run
text = "  hello  "
print("[" + text.strip() + "]")
print("[" + text.lstrip() + "]")
print("[" + text.rstrip() + "]")
print("--hi--".strip("-"))
print("abcba".strip("ab"))
```

Look at the last line. The argument is a **set of characters**, not a word. `strip("ab")` removes any `a` or `b` from both ends, in any order, until a different character appears, so `abcba` becomes `c`.

%% question q-strip-predict | predict
What does this program print?

```python
print("abcba".strip("ab"))
```
%% answer
c
%% explain
`strip("ab")` removes every `a` and `b` from both ends. From the left it takes off `a` and `b`, and stops at `c`. From the right it takes off `a` and `b`, and stops at `c`. Only `c` is left.
%% end

## Searching

`find` returns the position of the first match, or -1 when there is none. `rfind` searches from the right, and `count` counts the matches that do not overlap:

```python run
text = "banana"
print(text.find("an"))
print(text.rfind("an"))
print(text.find("x"))
print(text.count("an"))
print("nan" in text)
```

`index` works like `find`, but a missing text is an error instead of -1. Use `find` when "not there" is a normal answer, and `index` when it would be a mistake:

```python run error
print("banana".index("x"))
```

To test the beginning or the end of a text, use `startswith` and `endswith`. Both accept a **tuple** of options, so one call can check several endings:

```python run
filename = "report.PDF"
print(filename.lower().endswith(".pdf"))
print(filename.lower().endswith((".pdf", ".docx")))
url = "https://example.com"
print(url.startswith(("http://", "https://")))
```

%% question q-find-choice | choice
What does `"hello".find("z")` return?
%% choice
`None`
%% choice
`0`
%% choice correct
`-1`
%% choice
It raises a ValueError.
%% explain
`find` returns -1 when the text is missing. `index` is the method that raises a ValueError. The value 0 would mean that the text starts at the first position.
%% end

## Replacing

`replace(old, new)` swaps every occurrence of `old` for `new`. It is case sensitive, and an optional third argument limits how many replacements happen. Because strings cannot change, the original stays as it was:

```python run
text = "I like cats. Cats are great."
print(text.replace("cats", "dogs"))
print(text.replace("Cats", "Dogs"))
print(text.lower().replace("cats", "dogs"))
print("aaa".replace("a", "b", 2))
print(text)
```

Replacing with an empty string deletes the text, which is a quick way to clean a phone number:

```python run
phone = "0803-111-2222"
print(phone.replace("-", ""))
```

## What kind of text is it?

A group of methods answers yes or no questions about a whole string: `isdigit`, `isalpha`, `isalnum` (letters or digits), `isspace`, `isupper` and `islower`. An empty string gives `False` for all of them:

```python run
for text in ["2026", "hello", "abc123", "   ", "HELLO", "", "3.14"]:
    print("[" + text + "]", text.isdigit(), text.isalpha(), text.isalnum(), text.isspace())
```

Notice that `"3.14"` is not made of digits only, because the dot is not a digit. These tests are perfect for checking what a user typed before you convert it:

```python run stdin="12a"
answer = input("How old are you? ")
if answer.isdigit():
    print("Next year you will be", int(answer) + 1)
else:
    print("Please type a whole number.")
```

%% question q-kind-multi | multi
Select every expression that gives `True`.
%% choice correct
`"Python".startswith(("Py", "py"))`
%% choice correct
`"abc".isalpha()`
%% choice
`"abc1".isalpha()`
%% choice correct
`"   ".isspace()`
%% choice
`"".isdigit()`
%% explain
The tuple lets `startswith` try both spellings, `abc` has only letters and the string of spaces is all white space. `abc1` contains a digit, and an empty string gives `False` for every one of these tests.
%% end

## partition: cutting once

`partition(separator)` cuts the text at the **first** separator and gives a tuple of three parts: the text before, the separator itself, and the text after. When the separator is missing, the whole text comes first and the other two parts are empty:

```python run
print("name=Ada".partition("="))
print("novalue".partition("="))
key, sep, value = "colour=blue=green".partition("=")
print(key, value)
```

This is the neat way to read settings of the form `key=value`, because an empty separator tells you at once that the line has no `=`.

%% question q-partition-fill | fill
Fill in the blank so that the program prints `blue`.

```python
key, sep, value = "colour=blue".___("=")
print(value)
```
%% answer
partition
%% expected
blue
%% explain
`partition("=")` returns the three parts `colour`, `=` and `blue`, and the unpacking stores the last one in `value`.
%% end

## Padding and aligning

`ljust`, `rjust` and `center` pad a string to a width, and `zfill` pads a number with zeros on the left:

```python run
print("tea".ljust(10) + "|")
print("tea".rjust(10) + "|")
print("tea".center(10, "*"))
print("42".zfill(6))
print("-5".zfill(4))
```

Together they make tidy columns:

```python run
items = [("tea", 3.5), ("bread", 12.25), ("milk", 0.99)]
for name, price in items:
    print(name.ljust(8) + str(price).rjust(6))
```

## Formatting numbers and text

An f-string can align and format its values in the same way. After the colon in `{value:...}` you can write a fill character, an alignment (`<` left, `>` right, `^` centre), a width, a comma for thousands, and a precision with a type:

```python run
name = "Ada"
price = 1234.5
print(f"[{name:<8}]")
print(f"[{name:>8}]")
print(f"[{name:^8}]")
print(f"[{name:*^8}]")
print(f"{price:,.2f}")
print(f"{0.256:.1%}")
print(f"{7:03d}")
```

The older `format` method uses the same mini language, and it is the better choice when the template is stored in a variable or comes from outside the program, because an f-string must be written in the code:

```python run
template = "{} scored {:.1f} points"
print(template.format("Ada", 91.456))
print("{name} is {age} years old".format(name="Grace", age=45))
```

## Characters are numbers

Every character has a number, its **code point**. `ord` turns a character into its number, and `chr` turns a number back into a character:

```python run
print(ord("A"), ord("a"), ord("0"))
print(chr(65), chr(97), chr(8364))
print(ord("b") - ord("a"))
```

The letters of the alphabet are in a row, so `ord(letter) - ord("a")` is the position of the letter in the alphabet, counting from 0. That is the key to the Caesar cipher.

## A small project: the Caesar cipher

Julius Caesar is said to have hidden his messages by moving every letter a fixed number of places along the alphabet. A shift of 3 turns `a` into `d`. The program below shifts each letter, keeps the capital letters capital, wraps around from `z` to `a` with `%`, and leaves everything else alone:

```python run stdin="Hello, World!\n3"
text = input("Text: ")
shift = int(input("Shift: "))
result = ""
for ch in text:
    if ch.isalpha():
        base = ord("A") if ch.isupper() else ord("a")
        result += chr((ord(ch) - base + shift) % 26 + base)
    else:
        result += ch
print(result)
```

To read a message, you shift by the same amount in the other direction. Try the shift 23 on the output, or change the program to shift backwards.

## Characters versus bytes

`len` counts characters. A file or a network message stores **bytes**, and the number of bytes per character depends on the encoding. The usual encoding, UTF-8, uses one byte for plain English letters, two for letters such as `é`, and up to four for emoji:

```python run
for text in ["cafe", "café", chr(128512)]:
    print(text, len(text), len(text.encode("utf-8")))
```

This is why programs that save text should always say which encoding they use. You will meet that in the next lesson.

## Raw strings

In a normal string, a backslash starts an **escape**: `\n` is a new line and `\t` is a tab. That is a problem for Windows file names and, later, for regular expressions. A string that starts with `r` is **raw**, and its backslashes are kept as they are:

```python run
print("C:\new\table")
print(r"C:\new\table")
```

%% question q-zfill-choice | choice
What does `"7".zfill(3)` give?
%% choice
`"700"`
%% choice
`"  7"`
%% choice correct
`"007"`
%% choice
`"7  "`
%% explain
`zfill` pads a text with zeros **on the left** until it has the given width. To pad with spaces on the left, use `rjust`.
%% end

## Your turn

%% exercise tidy-name | Tidy name
Read a name that may have extra spaces around and between the words and odd capital letters. Print it with single spaces and Title Case. For the input `   aDA    loVElace  ` the program prints:

```output
Ada Lovelace
```
%% stdin
   aDA    loVElace  
%% starter
# split() with no argument removes the extra spaces.

%% solution
print(" ".join(input().split()).title())
%% tests
expect_output("Ada Lovelace")
check(rerun("  grace   HOPPER ").strip() == "Grace Hopper", "another name")
check(rerun("x").strip() == "X", "a single letter")
%% hint
`input().split()` cuts the line into words and drops all the extra spaces.
%% hint
Join the words again with single spaces: `" ".join(...)`.
%% hint
Finish with `.title()` to fix the capital letters.
%% end

%% exercise price-table | Price table
Read lines of the form `name price` until a line says `end`. Print each item on one line, with the name left-aligned in 10 columns and the price right-aligned in 8 columns with two decimals. For the input `tea 3.5`, `bread 12.25` and `end` the program prints:

```output
tea           3.50
bread        12.25
```
%% stdin
tea 3.5
bread 12.25
end
%% starter
# Use ljust and rjust, or the format spec of an f-string.

%% solution
while True:
    line = input()
    if line == "end":
        break
    name, price = line.split()
    print(f"{name:<10}{float(price):>8.2f}")
%% tests
expect_output("tea".ljust(10) + "3.50".rjust(8) + "\n" + "bread".ljust(10) + "12.25".rjust(8))
check(rerun("pie 100\nend").strip() == "pie".ljust(10) + "100.00".rjust(8), "a whole number price gets two decimals")
check(rerun("end").strip() == "", "nothing to print for an empty list")
%% hint
Split each line into the name and the price, and turn the price into a number with `float`.
%% hint
In an f-string, `{name:<10}` left-aligns in 10 columns, and `{price:>8.2f}` right-aligns in 8 columns with two decimals.
%% hint
`print(f"{name:<10}{float(price):>8.2f}")` inside a loop that stops at `end`.
%% end

%% exercise key-value | Key and value
Read lines until a line says `end`. A line of the form `key=value` is printed as `key -> value`. Only the first `=` counts, so the value may contain more of them. A line without any `=` prints `invalid: ` followed by the line. For the input below the program prints:

```output
name -> Ada
colour -> blue=green
invalid: bad line
```
%% stdin
name=Ada
colour=blue=green
bad line
end
%% starter
# partition() gives three parts: before, the separator, after.

%% solution
while True:
    line = input()
    if line == "end":
        break
    key, sep, value = line.partition("=")
    if sep == "":
        print("invalid: " + line)
    else:
        print(key + " -> " + value)
%% tests
expect_output("name -> Ada\ncolour -> blue=green\ninvalid: bad line")
check(rerun("a=\nend").strip() == "a ->", "an empty value is still valid")
check(rerun("=x\nend").strip() == "-> x", "an empty key is still valid")
check(rerun("novalue\nend").strip() == "invalid: novalue", "a line without an equals sign")
%% hint
`line.partition("=")` gives `(key, separator, value)`.
%% hint
When the separator is missing, the middle part is an empty string. Test `sep == ""`.
%% hint
Print `key + " -> " + value` for valid lines, and `"invalid: " + line` for the others.
%% end

%% exercise caesar-decode | Challenge: Decode the cipher
Read a shift on the first line and a secret message on the second line. The message was made by shifting every letter **forward** by that shift, as in the Caesar cipher above. Print the original message. Capital letters stay capital, and characters that are not letters stay as they are. For the input `3` and `Khoor, Zruog!` the program prints:

```output
Hello, World!
```
%% stdin
3
Khoor, Zruog!
%% starter
# To decode, shift every letter backwards by the same amount.

%% solution
shift = int(input())
text = input()
result = ""
for ch in text:
    if ch.isalpha():
        base = ord("A") if ch.isupper() else ord("a")
        result += chr((ord(ch) - base - shift) % 26 + base)
    else:
        result += ch
print(result)
%% tests
expect_output("Hello, World!")
check(rerun("13\nUryyb").strip() == "Hello", "a shift of 13")
check(rerun("25\nGdkkn").strip() == "Hello", "a shift of 25 wraps around")
check(rerun("0\nabc xyz!").strip() == "abc xyz!", "a shift of 0 changes nothing")
%% hint
The encrypted letter was moved forward, so subtract the shift. Keep the capitals by using `ord("A")` or `ord("a")` as the base.
%% hint
The formula is `chr((ord(ch) - base - shift) % 26 + base)`. The `%` makes the alphabet wrap around, even for negative numbers.
%% hint
Only change a character when `ch.isalpha()` is true, and copy all the others unchanged.
%% end

## What you learned

- Strings cannot change. Every method returns a new string, so you store the result.
- `split()` cuts at white space, `split(sep)` at every separator (empty pieces included), `split(sep, 1)` at the first one only, and `splitlines()` at line breaks. `join` glues a list of strings together.
- `strip`, `lstrip` and `rstrip` remove characters from the edges, and the argument is a set of characters.
- `find`, `rfind` and `count` search (with -1 for no match), `index` raises an error instead, and `startswith` and `endswith` accept a tuple of options. `replace` swaps text.
- `isdigit`, `isalpha`, `isalnum`, `isspace` and friends test a whole string, and `partition` cuts it once into three parts.
- `ljust`, `rjust`, `center`, `zfill` and the format spec of f-strings and `format` line up text and numbers. `ord` and `chr` convert between characters and numbers.
- `len` counts characters, while files store bytes, and the number of bytes depends on the encoding. A raw string `r"..."` keeps its backslashes.
