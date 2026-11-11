---
title: Meet Python cheat sheet
---
## Printing

```python
print("Hello")             # text goes in quotation marks
print(42)                  # numbers do not
print("Total:", 6 * 7)     # a comma shows several things on one line
print("a", "b", sep="-")   # sep: what goes between the things
print("Loading", end="...") # end: what comes after (default is a new line)
print("Line one\nLine two") # \n starts a new line
```

## Numbers and operators

| Operator | Meaning | Example | Result |
| --- | --- | --- | --- |
| `+` | add | `7 + 2` | `9` |
| `-` | subtract | `7 - 2` | `5` |
| `*` | multiply | `7 * 2` | `14` |
| `/` | divide (always a float) | `7 / 2` | `3.5` |
| `//` | whole-number division | `7 // 2` | `3` |
| `%` | remainder | `7 % 2` | `1` |
| `**` | power | `7 ** 2` | `49` |

**Order of operations:** brackets, then powers, then `*` `/` `//` `%` (left to right), then `+` `-` (left to right). Add brackets whenever you want to be sure.

```python
print(2 + 3 * 4)       # 14
print((2 + 3) * 4)     # 20
print(round(10 / 3, 2)) # 3.33  (round to 2 decimal places)
```

## Kinds of values

```python
42        # int: a whole number
3.14      # float: a number with a decimal point
"42"      # str: text (a string), because of the quotation marks
"Py" + "thon"   # joins text: Python
"ha" * 3        # repeats text: hahaha
```

## Comments

```python
# A whole-line comment explains why, or labels a section
print("Hi")   # a comment can follow code
# print("Bye")  <- switched off ("commented out")
```

In the editor: **Ctrl + /** (**Cmd + /** on a Mac) toggles a comment on the current line.

## Reading errors

1. Read the **last line** of the message (the error type and description).
2. Go to the **line number** it names, and check the line above it too.
3. Check spelling, capital letters, quotation marks, brackets and spaces at the start of the line.
4. Fix **one** thing, then run again.

| Error | Usually means |
| --- | --- |
| `SyntaxError` | A quotation mark or bracket was not closed. Nothing runs. |
| `NameError` | A misspelled word, wrong capital letter, or text without quotation marks |
| `TypeError` | Text and numbers were mixed, for example `"Age: " + 5` |
| `ZeroDivisionError` | Something was divided by zero |
| `IndentationError` | Extra spaces at the start of a line |

A **logic error** gives no message. The program runs but the answer is wrong, so know the right answer first.
