---
title: Errors and debugging: module quiz
pass: 70
---
Twelve questions on everything in this module: reading errors, handling them with `try`, raising your own, debugging with a method, and testing. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | choice
What does the call `int("abc")` raise?
%% choice
`TypeError`
%% choice correct
`ValueError`
%% choice
`NameError`
%% choice
`IndexError`
%% explain
The argument has the right type (a text), but its value cannot be turned into a whole number, which is what `ValueError` means. A `TypeError` would come from a call such as `int(None)`.
%% end

%% question q2 | choice
A list `numbers` has three items, and the program reads `numbers[10]`. Which clause catches that error?
%% choice
`except KeyError:`
%% choice correct
`except LookupError:`
%% choice
`except ValueError:`
%% choice
`except ZeroDivisionError:`
%% explain
The error is an `IndexError`, and `IndexError` is a child of `LookupError`, so a clause for the parent catches it. `KeyError` belongs to dictionaries, and the other two are different families.
%% end

%% question q3 | predict
What does this program print?

```python
def f(x):
    try:
        return 10 / x
    except ZeroDivisionError:
        return -1
    finally:
        print("done")

print(f(2))
print(f(0))
```
%% answer
done
5.0
done
-1
%% explain
The `finally` block runs before the function hands back its value, so `done` is printed first and the number second, in both calls. For `f(0)` the division raises a `ZeroDivisionError`, and the clause returns `-1`.
%% end

%% question q4 | multi
Select every true statement about `try` and `except`.
%% choice correct
`except (ValueError, TypeError):` handles either of the two exceptions.
%% choice correct
Python checks the clauses from top to bottom and uses the first one that matches.
%% choice correct
A bare `except:` also hides mistakes such as a misspelt name.
%% choice
The `else` clause runs when the `try` block raised an exception.
%% choice
The `finally` clause runs only when an exception was caught.
%% explain
A tuple names several types for one reaction, the first matching clause wins, and a bare `except:` catches everything, including your own typing mistakes. `else` runs when **nothing** went wrong, and `finally` runs **always**.
%% end

%% question q5 | fill
Fill in the blank so that the program prints `rejected`.

```python
def set_age(age):
    if age < 0:
        ___ ValueError("negative")
    return age

try:
    set_age(-1)
except ValueError:
    print("rejected")
```
%% answer
raise
%% expected
rejected
%% explain
The `raise` statement creates the exception and stops the function at that line. The caller's `except ValueError` clause then handles it and prints the word.
%% end

%% question q6 | choice
When is `assert` the right tool?
%% choice
To reject a number that a person typed
%% choice
To handle a file that does not exist
%% choice correct
To check something that must be true when your own code is correct
%% choice
To catch every exception in a program
%% explain
An assertion is a bug detector for the programmer, and Python can be run with assertions switched off. Input from people and files is checked with `if` and `raise`, and `try` and `except` handles the problems that come back.
%% end

%% question q7 | predict
What does this program print?

```python
def read(text):
    try:
        return int(text)
    except ValueError:
        print("noted")
        raise

try:
    read("x")
except ValueError:
    print("caught")
```
%% answer
noted
caught
%% explain
The inner `except` prints `noted`, and the bare `raise` sends the same `ValueError` on to the caller. The outer `except` clause catches it and prints `caught`.
%% end

%% question q8 | predict
What does this program print?

```python
def add(x, items=[]):
    items.append(x)
    return len(items)

print(add("a"))
print(add("b"))
print(add("c", []))
```
%% answer
1
2
1
%% explain
The default list is created once and shared by every call that does not pass its own list, so the second call sees two items. The third call passes a new list, so it has one item.
%% end

%% question q9 | multi
Select every true statement about the `logging` module.
%% choice correct
`logging.debug` messages are hidden unless the level is set to `DEBUG`.
%% choice correct
`logging.exception` records the traceback of the exception that is being handled.
%% choice correct
The level of a message says how important it is.
%% choice
A log line must be deleted from the program before it is finished.
%% explain
The default level is `WARNING`, so debug messages need `basicConfig(level=logging.DEBUG)`. Levels and tracebacks are the strengths of logging, and log lines can stay in the program, because the level decides whether they are shown.
%% end

%% question q10 | choice
A function accepts a score from 0 to 100. Which test values are the most useful?
%% choice
Only 50
%% choice correct
0 and 100, and the values next to them outside the range, -1 and 101
%% choice
Only numbers above 1000
%% choice
Only text
%% explain
Bugs hide at the **boundaries**: a `>` that should be `>=`, or a range that stops one value too early. Testing the edge values and their neighbours finds those mistakes.
%% end

%% question q11 | order
Put the lines in order so that the program prints `raised`. One line does not belong.
%% lines
def average(numbers):
    return sum(numbers) / len(numbers)
try:
    average([])
except ZeroDivisionError:
    print("raised")
%% distractors
    print("fine")
%% expected
raised
%% explain
The function must exist before the `try` statement calls it. Dividing by the length of an empty list raises a `ZeroDivisionError`, which the `except` clause turns into the word `raised`. The line that prints `fine` would only fit after the call inside `try`, and it would never run, because the call raises the exception first.
%% end

%% question q12 | fill
Fill in the expected answer so that the doctest passes.

```python
import doctest

def add(a, b):
    """
    >>> add(2, 3)
    ___
    """
    return a + b

print(doctest.testmod())
```
%% answer
5
%% expected
TestResults(failed=0, attempted=1)
%% explain
`add(2, 3)` gives `5`, and the line under the `>>>` example must show exactly the value that Python would display. Any other value would make the example fail.
%% end
