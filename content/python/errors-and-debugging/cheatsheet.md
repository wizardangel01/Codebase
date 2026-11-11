---
title: Errors and debugging: cheat sheet
---
## Reading a traceback

Read from the **bottom**. The last line has the type and the message. The frames above show where it happened, with the oldest call first.

```text
Traceback (most recent call last):
  File "main.py", line 8, in <module>      the main program called report
    report([])
  File "main.py", line 3, in average        the line that failed
    return sum(numbers) / len(numbers)
ZeroDivisionError: division by zero         the type and the message
```

| Exception | Raised when |
| --- | --- |
| `ValueError` | the type is right, the value is not: `int("abc")` |
| `TypeError` | the wrong type: `"5" + 5` |
| `ZeroDivisionError` | dividing by zero |
| `IndexError` and `KeyError` | a list position or a dictionary key is missing (both are `LookupError`) |
| `NameError` | a name does not exist |
| `AttributeError` | an object has no such method |
| `FileNotFoundError` | a file to read does not exist |

## try, except, else, finally

```python
try:
    number = int(text)              # keep the try block small
except (ValueError, TypeError) as e:
    print("Problem:", e)            # first matching clause wins
except LookupError:
    print("A lookup failed")        # a parent catches its children
else:
    print("No error happened")      # runs only when nothing was raised
finally:
    print("Always runs, last")      # even after a return
```

- Never write a bare `except:`. Name what you expect. Use `except Exception as e:` only at the top of a program, and report `e`.
- `type(e).__name__` is the name of the exception type, and `str(e)` is its message.
- **EAFP** (try it, handle the exception) or **LBYL** (check with an `if` first). Choose EAFP when the check is hard to write or the situation can change.
- A retry loop: `while True:`, then `try:` to convert, `except` to complain, and `else:` to `break`.

## Raising

```python
raise ValueError(f"percent must be between 0 and 100, got {percent}")

try:
    risky()
except ValueError:
    print("noted")
    raise                                   # send the same exception on

try:
    int(text)
except ValueError as e:
    raise RuntimeError("bad text") from e   # chain: e.__cause__ is the original

assert total >= 0, "total can never be negative"   # a bug detector, not input checking
```

| Use `raise` for | Use `assert` for |
| --- | --- |
| input from people, files and callers | mistakes in your own logic |
| problems that must always be reported | checks while you develop and test |

A good message says what was wrong, includes the value that was received, and says what was expected. Return `None` only when "nothing found" is a normal result.

## Debugging

1. **Reproduce** it with a small input, every time.
2. **Isolate** where it happens (check each stage, comment code out).
3. **Hypothesise** one cause.
4. **Test** the guess by printing or changing one thing. Run the old cases again after a fix.

| Symptom | Likely cause |
| --- | --- |
| the first or last item is skipped | off by one in `range` or a slice |
| numbers glue together | `input()` text was not converted with `int` or `float` |
| items remain in a list that should be gone | the list was changed during the loop (loop over `items[:]`) |
| a function remembers earlier calls | a mutable default argument (use `None`) |
| `'int' object is not callable` | a variable has the name of a function (`sum`, `max`) |
| `UnboundLocalError` | assigning and reading a name inside a function |
| the answer prints `None` | a missing `return` |
| equal floats are not equal | use `abs(a - b) < 0.000001` |
| `=` where `==` was meant | a comparison written as an assignment, or the reverse |

```python
import logging

logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")
logging.debug("n=%s total=%s", n, total)    # DEBUG 10, INFO 20, WARNING 30, ERROR 40, CRITICAL 50
logging.exception("could not read")         # inside except: message and traceback
```

A debugger (`pdb`, `breakpoint()`, or the one in your editor) steps through a program line by line. It is not available in the browser.

## Testing

```python
assert is_even(4)
assert not is_even(7), "7 is odd"
assert abs(average([1, 2]) - 1.5) < 0.000001      # floats need a tolerance
```

Test the typical input, the smallest (empty, zero), one item, the boundaries, negative and huge values, repeats, and wrong input that must raise.

```python preview
import unittest

class TestAverage(unittest.TestCase):
    def test_typical(self):
        self.assertEqual(average([2, 4, 6]), 4)

    def test_empty(self):
        with self.assertRaises(ValueError):
            average([])

unittest.main(exit=False)
```

| Method | Passes when |
| --- | --- |
| `assertEqual(a, b)` | `a == b` |
| `assertTrue(x)` and `assertFalse(x)` | `x` is true or false |
| `assertIn(a, b)` | `a in b` |
| `assertAlmostEqual(a, b)` | equal to about 7 decimal places |
| `assertRaises(Error)` | the `with` block raises that error |

```python
import doctest

def shout(text):
    """Return the text in capitals, with an exclamation mark.

    >>> shout("hi")
    'HI!'
    """
    return text.upper() + "!"

print(doctest.testmod())
```

**Test first:** red (write tests that fail), green (the simplest code that passes), refactor (tidy, run again).
