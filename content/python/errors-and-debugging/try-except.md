---
title: try and except
---
%% file readings.txt
21.5
22.0
n/a
23.4
error
24.1
%% end

Sooner or later, every program meets something that it did not expect: a person types `abc` where a number belongs, a file is missing, a list is shorter than the code assumed. When Python meets a problem that it cannot solve, it stops the program and reports an **exception**. In module 1 you saw your first error messages. This lesson teaches you to read them completely, shows how the main kinds of exception are related, and, most important, shows how to **handle** an exception, so that one mistake does not end the whole program.

%% note A calm way to think about errors
An exception is not a punishment. It is Python telling you exactly what went wrong and where. Programmers read exceptions all day, and reading them calmly is worth more than any trick for avoiding them.
%% end

## Reading a traceback

When an exception ends a program, Python prints a **traceback**: the story of how the program arrived at the problem. Here three functions work together, and the last one fails:

```python run error
def average(numbers):
    return sum(numbers) / len(numbers)

def report(data):
    print("Average:", average(data))

report([])
```

Read the output from the **bottom up**.

- The **last line** is the most important one: `ZeroDivisionError: division by zero`. It gives the **type** of the exception, a colon, and a **message** in words.
- Above it, every pair of lines is a **frame**: a place where the program was working. A frame shows the file, the line number, the name of the function, and the line of code. The marks `~~~^^^` underline the part of the line that failed.
- The frames are listed with the **oldest call first**, which is why the text says "most recent call last". The first frame is the main program (`<module>`), which called `report`, which called `average`. The last frame is where the exception happened.

A good routine for any traceback is: read the last line, then look at the last frame to find the line in your own code, and if the cause is not clear there, climb up the frames to see who passed the bad value. Here the last frame divides by `len(numbers)`, which is 0, because `report([])` sent an empty list.

%% question q-trace-choice | choice
In a traceback, where do you find the type and the message of the exception?
%% choice
In the first line
%% choice correct
In the last line
%% choice
In the line with `File "main.py"`
%% choice
Nowhere, you have to guess
%% explain
The last line always names the exception and says what went wrong. The frames above it tell you where it happened and how the program got there.
%% end

## The common exceptions

You will meet the same few exceptions again and again. Learn their names, because the name decides how you handle them.

| Exception | Raised when | Example |
| --- | --- | --- |
| `ValueError` | the type is right, but the value is not | `int("abc")` |
| `TypeError` | an operation gets the wrong type | `"5" + 5` |
| `ZeroDivisionError` | something is divided by zero | `10 / 0` |
| `IndexError` | a list position does not exist | `[1, 2][5]` |
| `KeyError` | a dictionary key is missing | `{"a": 1}["b"]` |
| `NameError` | a name has not been created | `print(total)` before `total` exists |
| `AttributeError` | an object has no such method | `"abc".push("d")` |
| `FileNotFoundError` | a file to read does not exist | `open("missing.txt")` |

Exceptions form a **family tree**. A parent catches all of its children, which is useful later in this lesson. This is the part of the tree that you will use most:

```text
BaseException
├── KeyboardInterrupt        (the person pressed Ctrl+C)
├── SystemExit               (the program asked to exit)
└── Exception                (the parent of the errors in your programs)
    ├── ArithmeticError
    │   └── ZeroDivisionError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── OSError
    │   └── FileNotFoundError
    ├── ValueError
    ├── TypeError
    ├── NameError
    └── AttributeError
```

## try and except

Without any protection, one bad input ends the program:

```python run error
text = "forty-two"
age = int(text)
print("Next year you will be", age + 1)
print("The program continues")
```

A `try` statement attempts some code and says what to do if a particular exception happens:

```python run
text = "forty-two"
try:
    age = int(text)
    print("Next year you will be", age + 1)
except ValueError:
    print("That is not a whole number")
print("The program continues")
```

Here is exactly what Python does:

1. It runs the `try` block line by line.
2. If **no exception** happens, the `except` block is skipped.
3. If an exception happens, the rest of the `try` block is **skipped**, and Python looks for an `except` clause that matches the type of the exception. When it finds one, it runs that block.
4. The program then continues after the whole `try` statement.
5. If no clause matches, the exception goes on upward and the program ends with a traceback, as before.

Notice that the line `print("Next year you will be", age + 1)` did not run. The exception happened on the line before it, so the rest of the block was skipped.

%% question q-flow-predict | predict
What does this program print?

```python
try:
    print("A")
    print(int("x"))
    print("B")
except ValueError:
    print("C")
print("D")
```
%% answer
A
C
D
%% explain
`A` is printed first. Then `int("x")` raises a `ValueError`, so `B` never runs and Python jumps to the `except` block, which prints `C`. After the `try` statement the program carries on and prints `D`.
%% end

Keep the `try` block **small**. Put in it only the lines that can raise the exception you expect. A long `try` block can catch a problem that you did not mean to catch, and then the wrong message appears.

## Several except clauses

A `try` statement can have more than one `except` clause, one for each kind of problem, and each gets its own reaction:

```python run
def divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "cannot divide by zero"
    except TypeError:
        return "numbers only, please"

print(divide(10, 4))
print(divide(10, 0))
print(divide(10, "2"))
```

When two exceptions deserve the same reaction, name them together in a **tuple**:

```python run
for text in ["12", "abc", None]:
    try:
        number = int(text)
    except (ValueError, TypeError):
        number = 0
    print(number)
```

Python checks the clauses **from top to bottom** and uses the **first** one that matches. Since a parent matches all of its children, put the specific clause before the general one:

```python run
try:
    print([1, 2, 3][5])
except LookupError:
    print("a lookup problem")
except IndexError:
    print("an index problem, but this clause can never run")
```

Both `IndexError` and `KeyError` are `LookupError`s, so the first clause already caught the exception. Swap the two clauses and the more precise message appears.

## The exception object: as e

The exception is an object, and `as e` gives it a name inside the `except` block. Printing it shows the message, and `type(e).__name__` is the name of its type:

```python run
try:
    int("abc")
except ValueError as e:
    print("Type:", type(e).__name__)
    print("Message:", e)
```

The message is written for people, so it is a good thing to show in a log or to the person using your program. Here is a gallery that triggers many different exceptions on purpose, so that you can see their names and messages next to the code that causes them:

```python run
tests = [
    lambda: int("abc"),
    lambda: "5" + 5,
    lambda: 10 / 0,
    lambda: [1, 2][5],
    lambda: {"a": 1}["b"],
    lambda: undefined_name,
    lambda: "abc".push("d"),
    lambda: open("missing.txt"),
]
for test in tests:
    try:
        test()
    except Exception as e:
        print(type(e).__name__ + ":", e)
```

The `traceback` module can also give you the full traceback as text, which is useful when you want to store the details of a problem and not only show the message:

```python run
import traceback

try:
    int("abc")
except ValueError:
    details = traceback.format_exc()
    print(details.splitlines()[-1])
```

## else and finally

Two more clauses complete the statement. The `else` clause runs only when **no exception** happened, and the `finally` clause runs **always**, at the very end:

| Clause | Runs when |
| --- | --- |
| `try` | always, and first |
| `except` | an exception of that kind happened in the `try` block |
| `else` | the `try` block finished without any exception |
| `finally` | always, last, even after a `return` or an exception that nothing caught |

Step through this function twice, once with a good text and once with a bad one, and watch which blocks run:

```python trace title="Which blocks run?"
def convert(text):
    try:
        number = int(text)
    except ValueError:
        return None
    else:
        return number * 2
    finally:
        print("checked", text)

print(convert("21"))
print(convert("x"))
```

Why use `else` when the code could go at the end of the `try` block? Because it keeps the `try` block small. Code in `else` that fails is **not** caught by the `except` clauses above it, so a mistake there is not hidden. `finally` is the place for clean-up that must always happen, such as printing a closing message or releasing something that you opened. For files, a `with` block is usually the tidier choice, but `finally` shows the idea clearly:

```python run
for name in ["readings.txt", "missing.txt"]:
    try:
        with open(name) as f:
            text = f.read()
    except FileNotFoundError:
        print(name, "- no such file")
    else:
        print(name, "-", len(text.split()), "words")
    finally:
        print("finished with", name)
```

%% question q-finally-predict | predict
What does this program print?

```python
def f():
    try:
        return "A"
    finally:
        print("B")

print(f())
```
%% answer
B
A
%% explain
The `return` prepares the value `"A"`, but the `finally` block always runs before the function really leaves. It prints `B` first, and then the call hands back `"A"`, which the outer `print` shows.
%% end

%% question q-finally-fill | fill
Fill in the blank so that the program prints `cleanup` and then `try`.

```python
def f():
    try:
        return "try"
    ___:
        print("cleanup")

print(f())
```
%% answer
finally
%% expected
cleanup
try
%% explain
Only `finally` runs no matter how the `try` block ends, even when it ends with a `return`. An `else` clause could not follow a `try` that has no `except` clause at all.
%% end

## Why a bare except is a bad idea

You can write `except:` with no type, and it catches **everything**, including the exceptions that are caused by your own typing mistakes. Look at this program. It has a typo in the name of the function:

```python run
def average(numbers):
    return sum(numbers) / len(numbers)

try:
    result = averge([2, 4, 6])
except:
    result = 0
print("Result:", result)
```

The program prints `Result: 0` and nothing complains, so you would never learn that `averge` does not exist. Remove the `try` and you get `NameError: name 'averge' is not defined. Did you mean: 'average'?` at once, with the exact line. A bare `except:` also catches `KeyboardInterrupt`, so the person cannot stop the program with Ctrl+C.

Follow these rules:

1. **Name the exceptions you expect**, and only those: `except ValueError:`.
2. **Keep the try block small**, so that you know which line caused the exception.
3. Use `except Exception as e:` only at the top of a program that must keep running (a server, a game loop), and **report** what was caught.
4. Never write an `except` block that only says `pass`, unless you can explain why silence is correct. An empty handler hides problems.

%% question q-bare-multi | multi
Select every true statement about `except:` with no exception type.
%% choice correct
It catches mistakes such as a misspelt name, and hides them.
%% choice correct
It also catches `KeyboardInterrupt`.
%% choice
It is the recommended way to make a program safe.
%% choice
It only catches `ValueError`.
%% explain
A bare `except:` catches every exception, including the ones that point at bugs in your own code. That is exactly why it is not recommended. Name the exceptions that you expect.
%% end

## Look before you leap, or ask forgiveness

There are two styles of safe code. **LBYL** means "look before you leap": test the situation first with an `if`. **EAFP** means "easier to ask forgiveness than permission": try the operation, and handle the exception if it happens. Both work well for a dictionary:

```python run
prices = {"tea": 2.5, "bread": 4.0}
item = "milk"

if item in prices:
    print(prices[item])
else:
    print("unknown item")

try:
    print(prices[item])
except KeyError:
    print("unknown item")
```

The two styles differ when the rules for "valid" are complicated. Here a look-first check with `isdigit()` is compared with a `try`:

```python run
def look_first(text):
    if text.isdigit():
        return int(text)
    return None

def ask_forgiveness(text):
    try:
        return int(text)
    except ValueError:
        return None

for text in ["42", "-5", " 7 ", "3.5", "abc"]:
    print("[" + text + "]", look_first(text), ask_forgiveness(text))
```

The check `isdigit()` rejects `-5` and ` 7 `, although Python reads both as numbers. The `try` version asks Python itself, so it can never disagree with `int`. The same idea protects you from changes in the world: a file that exists when you check may be gone when you open it, but trying to open it and handling `FileNotFoundError` is always right.

Python programmers use EAFP a lot. Use a plain `if` when the test is simple and failure is common, and use `try` when the check is hard to write or the situation can change.

## Retry loops

A `try` inside a `while` loop makes a program that keeps asking until the answer is good. The `else` clause is the perfect place for `break`: it runs only when the conversion worked.

```python run stdin="abc\n3.5\n-2\n41"
while True:
    try:
        age = int(input("Age: "))
    except ValueError:
        print("Please type a whole number.")
    else:
        if age < 0:
            print("An age cannot be negative.")
        else:
            break
print("Age:", age)
```

The same pattern works for any input: keep asking, report what was wrong, and leave the loop only when the value is acceptable.

## A project: a forgiving calculator

This calculator reads lines of the form `number operator number`. It must survive wrong shapes, words instead of numbers and division by zero, and it carries on after each one:

```python run stdin="4 + 5\n10 / 0\nsix * 2\n3 ^ 2\n7 plus\n2.5 * 4\nquit"
while True:
    line = input("calc> ")
    if line == "quit":
        break
    try:
        left, op, right = line.split()
        left = float(left)
        right = float(right)
        if op == "+":
            answer = left + right
        elif op == "-":
            answer = left - right
        elif op == "*":
            answer = left * right
        elif op == "/":
            answer = left / right
        else:
            print("Unknown operator:", op)
            continue
    except ValueError:
        print("Use the form: number operator number")
    except ZeroDivisionError:
        print("Cannot divide by zero")
    else:
        print(answer)
```

Both a bad number (`six`) and a wrong number of parts (`7 plus`) raise a `ValueError`, so one clause answers both. Each line of input is handled on its own, and one bad line never ends the program.

The same idea cleans up a messy data file. This one reads the temperatures in `readings.txt`, skips the lines that are not numbers, and reports how many were skipped:

```python run
good = []
skipped = 0
with open("readings.txt") as f:
    for line in f:
        try:
            good.append(float(line))
        except ValueError:
            skipped += 1
print("Readings:", good)
print("Skipped:", skipped)
```

%% question q-as-fill | fill
Fill in the blank so that the program prints `invalid`.

```python
try:
    number = int("abc")
except ValueError ___ e:
    print("invalid")
```
%% answer
as
%% expected
invalid
%% explain
`except ValueError as e:` gives the exception object the name `e`. Without `as e` the name `e` would not exist, but the clause would still catch the exception.
%% end

%% question q-order-try | order
Put the lines in order so that the program prints `7`. One line does not belong.
%% lines
try:
    number = int("7")
except ValueError:
    number = 0
print(number)
%% distractors
    number = int("x")
%% expected
7
%% explain
The `try` line comes first, then the statement that might fail, then the `except` clause with its reaction, and `print` at the end. The line with `int("x")` would raise a `ValueError`, so the program would print `0`.
%% end

## Your turn

%% exercise to-int | A forgiving converter
Define a function `to_int(text)` that returns the whole number written in `text`, or `None` when the text is not a whole number. Use `try` and `except`. Then read one line of text and print `to_int` of it. For the input `42` the program prints:

```output
42
```
%% stdin
42
%% starter
# Define to_int(text) with try and except.

%% solution
def to_int(text):
    try:
        return int(text)
    except ValueError:
        return None

print(to_int(input()))
%% tests
expect_output("42")
check(defines("to_int"), "defines a function called to_int")
expect(to_int("17"), 17, "to_int('17')")
expect(to_int(" 8 "), 8, "spaces around the number")
expect(to_int("-3"), -3, "a negative number")
expect(to_int("abc"), None, "to_int('abc')")
expect(to_int("2.5"), None, "to_int('2.5')")
expect(to_int(""), None, "to_int('')")
check(rerun("abc").strip() == "None", "a program run with abc prints None")
check(uses("Try"), "uses try and except")
%% hint
Put `return int(text)` inside a `try` block.
%% hint
The clause `except ValueError:` handles the text that is not a number.
%% hint
Return `None` in the `except` block. In the main part, print `to_int(input())`.
%% end

%% exercise safe-average | Average of an empty list
Define a function `average(numbers)` that returns the average of a list of numbers, or `0` for an empty list. Do it with `try` and `except ZeroDivisionError`, not with an `if`. Read a line of numbers separated by spaces, turn them into floats, and print `average` of the list. For the input `2 4 6` the program prints:

```output
4.0
```
%% stdin
2 4 6
%% starter
# Define average(numbers) with try and except ZeroDivisionError.

%% solution
def average(numbers):
    try:
        return sum(numbers) / len(numbers)
    except ZeroDivisionError:
        return 0

values = []
for text in input().split():
    values.append(float(text))
print(average(values))
%% tests
expect_output("4.0")
check(defines("average"), "defines a function called average")
expect(average([2, 4, 6]), 4, "average([2, 4, 6])")
expect(average([5]), 5, "average([5])")
expect(average([]), 0, "average([]) is 0")
expect(average([1, 2]), 1.5, "average([1, 2])")
check(rerun("1 2").strip() == "1.5", "another input")
check(uses("Try"), "uses try and except")
%% hint
`sum(numbers) / len(numbers)` fails with a `ZeroDivisionError` when the list is empty.
%% hint
Put the division in a `try` block and catch `ZeroDivisionError`.
%% hint
Return `0` in the `except` block. The main part builds the list with `float(text)` for each word of `input().split()`.
%% end

%% exercise ask-age | Ask until it is a number
Read lines of text until one of them is a whole number from 0 to 120. For every wrong line print `Try again`. Then print `Age:` and the number. Use `input()` without a prompt. For the input `abc`, `200` and `34` the program prints:

```output
Try again
Try again
Age: 34
```
%% stdin
abc
200
34
%% starter
# Keep asking until the age is valid.

%% solution
while True:
    text = input()
    try:
        age = int(text)
    except ValueError:
        print("Try again")
    else:
        if 0 <= age <= 120:
            break
        print("Try again")
print("Age:", age)
%% tests
expect_output("Try again\nTry again\nAge: 34")
check(rerun("20").strip() == "Age: 20", "a valid first answer")
check(rerun("x\n-1\n0").strip() == "Try again\nTry again\nAge: 0", "text, then a negative number, then 0")
check(rerun("121\n120").strip() == "Try again\nAge: 120", "121 is too big and 120 is allowed")
check(uses("Try"), "uses try and except")
check(uses("While"), "uses a while loop")
%% hint
Use `while True:` and read a line at the top of the loop.
%% hint
Put `int(text)` in a `try` block, and print `Try again` in the `except ValueError` clause.
%% hint
When the conversion works, check the range with `0 <= age <= 120`. Leave the loop with `break` only when the age is in range, and print `Try again` when it is not.
%% end

%% exercise price-lookup | Price lookup
The dictionary `prices` is in the starter code. Read item names, one per line, until the line `done`. For every item print its price, or `unknown` when the shop does not sell it. Ask forgiveness: use `try` and `except KeyError`. For the input `tea`, `juice`, `bread` and `done` the program prints:

```output
2.5
unknown
4.0
```
%% stdin
tea
juice
bread
done
%% starter
prices = {"tea": 2.5, "bread": 4.0, "milk": 1.2}
# Read item names until the line done.

%% solution
prices = {"tea": 2.5, "bread": 4.0, "milk": 1.2}
while True:
    item = input()
    if item == "done":
        break
    try:
        print(prices[item])
    except KeyError:
        print("unknown")
%% tests
expect_output("2.5\nunknown\n4.0")
check(rerun("done").strip() == "", "no items at all")
check(rerun("milk\ncoffee\ndone").strip() == "1.2\nunknown", "another shopping list")
check(uses("Try"), "uses try and except")
%% hint
Read a line in a `while True:` loop, and leave the loop with `break` when the line is `done`.
%% hint
Put `print(prices[item])` in a `try` block.
%% hint
The clause `except KeyError:` prints `unknown`.
%% end

%% exercise score-file | Challenge: The messy score file
A file holds one score on each line, in the form `Ada 90`: a name, a space and a whole number. Some lines are wrong. Read the **name of the file** from the keyboard. Count the valid lines and the bad lines, and print the best score. Use `try` and `except`. A bad line is any line that is not exactly a name and a whole number. For the input `scores.txt` the program prints:

```output
Valid: 3
Bad: 2
Best: Ada 90
```
%% stdin
scores.txt
%% file scores.txt
Ada 90
Grace 85
Linus x
Alan
Margaret 77
%% file scores2.txt
Zed 7
Mia 3 4
Kai 5
%% starter
# Read the file name, then go through the lines of the file.

%% solution
name = input()
scores = {}
bad = 0
with open(name) as f:
    for line in f:
        try:
            who, number = line.split()
            scores[who] = int(number)
        except ValueError:
            bad += 1
best = max(scores, key=scores.get)
print("Valid:", len(scores))
print("Bad:", bad)
print("Best:", best, scores[best])
%% tests
expect_output("Valid: 3\nBad: 2\nBest: Ada 90")
check(rerun("scores2.txt").strip() == "Valid: 2\nBad: 1\nBest: Zed 7", "a second file")
check(uses("Try"), "uses try and except")
check(calls("open"), "opens the file")
%% hint
Go through the file with `for line in f:`, and put the work on each line in a `try` block.
%% hint
`who, number = line.split()` fails with a `ValueError` when the line does not have exactly two parts, and `int(number)` fails with a `ValueError` when the second part is not a whole number.
%% hint
Count the failures in the `except ValueError:` clause. Keep the valid scores in a dictionary, and find the best name with `max(scores, key=scores.get)`.
%% end

## What you learned

- An unhandled exception ends the program with a traceback. Read it from the **bottom**: the last line has the type and the message, and the frames above show where it happened and who called whom.
- The common exceptions are `ValueError`, `TypeError`, `ZeroDivisionError`, `IndexError`, `KeyError`, `NameError`, `AttributeError` and `FileNotFoundError`. A parent such as `LookupError` or `Exception` catches all of its children.
- `try` attempts code, and `except SomeError:` handles that one problem while the program carries on. Name the exceptions together in a tuple when they need the same reaction, and put the specific clause before the general one.
- `except SomeError as e:` gives you the exception object. `str(e)` or `print(e)` shows the message, and `type(e).__name__` is the name of its type.
- `else` runs when nothing went wrong, and `finally` always runs last, even after a `return`.
- Never write a bare `except:`. It hides typing mistakes and catches Ctrl+C. Name what you expect, and keep the `try` block small.
- **LBYL** checks first with an `if`. **EAFP** tries and handles the exception. Choose EAFP when the check is hard to write or the situation can change.
- A `try` inside a `while True:` loop makes a retry loop: leave it with `break` in the `else` clause when the input is good.
