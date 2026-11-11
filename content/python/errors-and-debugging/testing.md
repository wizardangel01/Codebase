---
title: Testing your code
---
How do you know that a function works? Most beginners run it a few times, look at the answers and decide that it is fine. That is **testing by hand**, and it has three weaknesses: it is slow, you forget some of the cases, and you must repeat it all after every change. An **automated test** is a small program that checks your program, and reports the result in a fraction of a second, every time you ask.

## Why write tests

- **Tests find bugs early**, while the code is fresh in your mind and the bug is small.
- **Tests let you change code with confidence.** After an edit, you run the tests, and if they pass, you know that you did not break something that used to work.
- **Writing tests makes you think** about what the function must do, including the strange inputs.
- **Tests explain the code.** A list of examples with the expected results is the clearest description of a function.

You already have the first tool, because `assert` was introduced in lesson 2.

## Tests with assert

The simplest test calls your function and uses `assert` to say what the answer must be. If every assertion is true, nothing happens, and the program carries on:

```python run
def is_even(n):
    return n % 2 == 0

assert is_even(4)
assert not is_even(7)
assert is_even(0), "zero is even"
assert is_even(-2), "negative even numbers count too"
print("All tests passed")
```

When an assertion fails, the program stops at that line with an `AssertionError` and your message. That is the problem with a plain script of assertions: **the first failure hides all the others**. Here the function has a bug, and you learn about only one of the two problems:

```python run error
def is_even(n):
    return n % 2 == 1

assert is_even(4), "4 should be even"
assert not is_even(7), "7 should be odd"
print("All tests passed")
```

A better arrangement is **one function for each behaviour**, and a loop that runs them all, reports each result, and keeps going after a failure. The function below has a bug (it doubles instead of squaring), and the test report shows which tests find it:

```python run
def square(n):
    return n * 2

def test_square_of_positive():
    assert square(3) == 9, "3 squared is 9"

def test_square_of_negative():
    assert square(-3) == 9, "-3 squared is 9"

def test_square_of_zero():
    assert square(0) == 0, "0 squared is 0"

def test_square_of_two():
    assert square(2) == 4, "2 squared is 4"

tests = [test_square_of_positive, test_square_of_negative, test_square_of_zero, test_square_of_two]
for test in tests:
    try:
        test()
    except AssertionError as e:
        print("FAILED:", test.__name__, "-", e)
    else:
        print("passed:", test.__name__)
```

Two tests pass for the wrong reason: doubling and squaring give the same answer for 0 and for 2. A single test, or tests with unlucky values, would have let the bug through. This is why good tests use **several different values**. You have now built the main idea of a testing framework, and the standard library has a ready-made one, which comes next.

%% question q-runner-choice | choice
Why is a runner that tries every test function in turn better than a script of plain `assert` lines?
%% choice
It makes the program run faster
%% choice correct
Every test is run and reported, even when an earlier one fails
%% choice
It makes the assertions true
%% choice
It removes the need for expected values
%% explain
A plain assertion that fails stops the program, so the later checks never run. A runner catches each `AssertionError`, reports it, and goes on, which gives you the whole picture in one run.
%% end

## Which cases to test

Choosing the values matters more than choosing the tool. For every function, ask these questions, and write a test for each answer:

| Ask | Examples |
| --- | --- |
| What is a **typical** input? | `[2, 4, 6]`, `"hello world"` |
| What is the **smallest** input? | an empty list, an empty text, `0` |
| What about **one** item? | `[5]`, a text of one letter |
| Where are the **boundaries**? | the limit values of a range, such as 0 and 100 |
| What about **negative** or **huge** numbers? | `-1`, `10 ** 12` |
| What about **repeats** and **ties**? | `[3, 3, 3]`, two items with the same score |
| What happens with **wrong** input? | does it raise the right exception? |

Here are tests for an `average` function that must refuse an empty list. The test for the exception uses `try`, `except` and `else`, and `assert False` makes the test fail when no exception comes:

```python run
def average(numbers):
    if len(numbers) == 0:
        raise ValueError("average of an empty list")
    return sum(numbers) / len(numbers)

assert average([2, 4, 6]) == 4
assert average([5]) == 5
assert average([-2, 2]) == 0
assert abs(average([1, 2]) - 1.5) < 0.000001

try:
    average([])
except ValueError:
    pass
else:
    assert False, "an empty list should raise ValueError"
print("All tests passed")
```

The fourth line compares a float with a small **tolerance**, because floating-point answers can differ in the last digits, as lesson 3 showed.

%% question q-cases-choice | choice
You are testing a function `largest(numbers)` that returns the largest number in a list. Which set of tests is the best?
%% choice
Only the list `[1, 2, 3]`
%% choice correct
Lists in different orders, a list of one item, a list of negative numbers, and a list where the largest number appears twice
%% choice
Only a list of a hundred numbers
%% choice
Only the empty list
%% explain
Good tests vary the situation: the order, the size, the sign of the numbers and the repeats. One typical list can hide many bugs, such as a function that always returns the last item.
%% end

## unittest

The standard library module `unittest` gives you a framework like the runner above, with a report, and with checking methods that explain failures. A test file has this shape:

```python preview run
import unittest

def average(numbers):
    if len(numbers) == 0:
        raise ValueError("average of an empty list")
    return sum(numbers) / len(numbers)

class TestAverage(unittest.TestCase):
    def test_typical(self):
        self.assertEqual(average([2, 4, 6]), 4)

    def test_one_item(self):
        self.assertEqual(average([5]), 5)

    def test_floats(self):
        self.assertAlmostEqual(average([1, 2]), 1.5)

    def test_empty_list(self):
        with self.assertRaises(ValueError):
            average([])

unittest.main(exit=False, verbosity=2)
```

%% note A first look at a class
The word `class` starts a **class**, which module 10 explains in full. For now, treat the line `class TestAverage(unittest.TestCase):` as a pattern to copy. Each function inside it whose name **starts with `test`** is run as one test, and its first parameter is always `self`, which gives you the checking methods such as `self.assertEqual`.
%% end

The last line, `unittest.main(exit=False, verbosity=2)`, finds the test cases in this file and runs them. Normally `unittest.main()` ends the program when it finishes, so `exit=False` lets the program carry on, and `verbosity=2` lists every test by name. The report is written to the error stream, which this site shows in red, as with `logging`. Red does not mean failure here: the last line of the report says `OK` when every test passed.

The checking methods are the heart of the module:

| Method | The test passes when |
| --- | --- |
| `assertEqual(a, b)` | `a == b` |
| `assertNotEqual(a, b)` | `a != b` |
| `assertTrue(x)` and `assertFalse(x)` | `x` is true, or false |
| `assertIn(a, b)` | `a in b` |
| `assertAlmostEqual(a, b)` | the numbers agree to about 7 decimal places |
| `assertRaises(Error)` | the `with` block raises that exception |

When a test fails, the report names the test, shows the line, and shows the two values that were compared. Here a bug has been added to `average`:

```python preview run
import unittest

def average(numbers):
    return sum(numbers) / len(numbers) + 1

class TestAverage(unittest.TestCase):
    def test_typical(self):
        self.assertEqual(average([2, 4, 6]), 4)

    def test_one_item(self):
        self.assertEqual(average([5]), 5)

unittest.main(exit=False)
```

The message `AssertionError: 5.0 != 4` tells you that the function gave `5.0` where the test expected `4`. Both tests fail, and both are reported.

Professional projects often use a tool called `pytest`, which needs less typing: a test is a plain function with a plain `assert`. It is not part of Python itself, so it is not available here. The ideas are the same, and what you learn with `unittest` carries over.

%% question q-unittest-multi | multi
Select every true statement about `unittest`.
%% choice correct
Each method whose name starts with `test` is run as one test.
%% choice correct
`unittest.main(exit=False)` runs the tests in the current file and lets the program carry on.
%% choice
The first failing test stops all the other tests from running.
%% choice correct
`assertRaises` checks that a block of code raises a given exception.
%% choice
Tests can only be written after all the code is finished.
%% explain
The test runner finds the methods by their names, runs each one on its own, and reports every result. A failure in one test does not stop the others. You may write tests before, during or after the code, and the next section shows why writing them first can be a good idea.
%% end

## doctest

A **docstring** is the text in triple quotes at the top of a function. The `doctest` module finds examples written in the style of an interactive session, a line that starts with `>>>` followed by the answer that Python must show, and it checks them. The examples explain the function to a reader, and they are tested at the same time:

```python run
import doctest

def shout(text):
    """Return the text in capitals, with an exclamation mark at the end.

    >>> shout("hello")
    'HELLO!'
    >>> shout("")
    '!'
    """
    return text.upper() + "!"

print(doctest.testmod())
```

The result `TestResults(failed=0, attempted=2)` means that both examples passed. The expected text must match **exactly**, including the quotation marks that `print` would not show: the answer to `shout("hello")` is the text `'HELLO!'`, and Python displays texts with quotes in this style. When an example fails, `doctest` shows what it expected and what it got. This one fails on purpose, because the last expected answer is wrong:

```python run
import doctest

def double(n):
    """Return n doubled.

    >>> double(4)
    8
    >>> double(-1)
    -2
    >>> double(0)
    1
    """
    return n * 2

print(doctest.testmod())
```

Use `doctest` for short examples that you want to keep truthful, and `unittest` or plain assertions for the longer and stricter tests.

%% question q-doctest-fill | fill
Fill in the expected answer so that the doctest passes.

```python
import doctest

def double(n):
    """
    >>> double(4)
    ___
    """
    return n * 2

print(doctest.testmod())
```
%% answer
8
%% expected
TestResults(failed=0, attempted=1)
%% explain
`double(4)` gives `8`, and the line after `>>>` must show exactly the value that Python would display. With any other value the example fails and the result shows `failed=1`.
%% end

## Test first

Many programmers **write the tests before the code**. The routine has three steps, which people call red, green, refactor:

1. **Red.** Write the test cases for a function that does not exist yet, or does nothing yet. Run them and watch them fail. A test that cannot fail tells you nothing.
2. **Green.** Write the simplest code that makes the tests pass.
3. **Refactor.** Tidy the code, and run the tests again to make sure that they are still green.

Suppose that a website needs a password check: at least 8 characters, at least one digit and at least one capital letter. First, list the cases, including the boundaries (exactly 8 characters) and the empty text. A first attempt, which does nothing yet, fails two of them:

```python run
cases = [
    ("Secret123", True),
    ("secret123", False),
    ("Secretabc", False),
    ("Sec1", False),
    ("", False),
    ("Abcdefg1", True),
]

def check_all(cases):
    failed = 0
    for text, expected in cases:
        if is_valid_password(text) != expected:
            failed += 1
            print("FAIL: [" + text + "] should give", expected)
    print(len(cases) - failed, "of", len(cases), "cases passed")

def is_valid_password(text):
    return False

check_all(cases)
```

Four cases pass by luck, because the correct answer is `False` for them. Now write the real function:

```python run
cases = [
    ("Secret123", True),
    ("secret123", False),
    ("Secretabc", False),
    ("Sec1", False),
    ("", False),
    ("Abcdefg1", True),
]

def check_all(cases):
    failed = 0
    for text, expected in cases:
        if is_valid_password(text) != expected:
            failed += 1
            print("FAIL: [" + text + "] should give", expected)
    print(len(cases) - failed, "of", len(cases), "cases passed")

def is_valid_password(text):
    has_digit = False
    has_upper = False
    for ch in text:
        if ch.isdigit():
            has_digit = True
        if ch.isupper():
            has_upper = True
    return len(text) > 8 and has_digit and has_upper

check_all(cases)
```

One case still fails: `Abcdefg1` has exactly 8 characters, and the code asks for **more than** 8. This is the boundary bug that you would probably have missed without the test. Change `>` to `>=`, and all six cases pass. Keep the cases in the program. When you improve the function next month, they will warn you at once if the improvement breaks something.

## Tests are documentation

Read the cases above again. Without any other explanation, they say that a password needs eight characters, a digit and a capital, and that an empty text is not valid. Tests and doctests are **examples that cannot go out of date**, because a wrong example fails. When you join an unfamiliar project, the tests are the best place to start reading.

%% question q-order-assert | order
Put the lines in order so that the program prints `passed`. One line does not belong.
%% lines
def square(n):
    return n * n
assert square(3) == 9
assert square(-3) == 9
print("passed")
%% distractors
assert square(3) = 9
%% expected
passed
%% explain
The function must exist before the assertions use it, and `print` comes last, so it runs only when every assertion passed. A single `=` assigns, so the line `assert square(3) = 9` is a syntax error.
%% end

%% question q-assert-predict | predict
What does this program print?

```python
def f(n):
    return n + n

try:
    assert f(2) == 4
    assert f(3) == 9, "f(3) should be 9"
    print("done")
except AssertionError as e:
    print("failed:", e)
```
%% answer
failed: f(3) should be 9
%% explain
The first assertion is true, because `f(2)` is 4. The second is false, because `f(3)` is 6, so Python raises an `AssertionError` with the message, and the `print("done")` line never runs.
%% end

## Your turn

%% exercise write-tests | Test the tester
The function `fizzbuzz(n)` is in the starter code. It returns `"Fizz"` for a multiple of 3, `"Buzz"` for a multiple of 5, `"FizzBuzz"` for a multiple of both, and the number as text for any other number. Define a function `test_fizzbuzz(function)` that checks **any version** of the function with `assert` statements, and raises an `AssertionError` when the version is wrong. Check at least the numbers 1, 3, 5 and 15. The program calls it for `fizzbuzz` and prints:

```output
All tests passed
```
%% starter
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

# Define test_fizzbuzz(function) here, above the call.

test_fizzbuzz(fizzbuzz)
print("All tests passed")

%% solution
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

def test_fizzbuzz(function):
    assert function(1) == "1", "1 stays a number"
    assert function(3) == "Fizz", "3 is Fizz"
    assert function(5) == "Buzz", "5 is Buzz"
    assert function(15) == "FizzBuzz", "15 is FizzBuzz"
    assert function(7) == "7", "7 stays a number"

test_fizzbuzz(fizzbuzz)
print("All tests passed")
%% tests
def bad_always_text(n):
    return str(n)
def bad_no_fizzbuzz(n):
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)
def bad_no_buzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    return str(n)
def bad_no_fizz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)
def bad_plain(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return "?"
expect_output("All tests passed")
check(defines("test_fizzbuzz"), "defines a function called test_fizzbuzz")
check(not raises(AssertionError, test_fizzbuzz, fizzbuzz), "the correct function passes your tests")
check(raises(AssertionError, test_fizzbuzz, bad_always_text), "your tests catch a function that never says Fizz or Buzz")
check(raises(AssertionError, test_fizzbuzz, bad_no_fizzbuzz), "your tests catch a function that gives Fizz for 15")
check(raises(AssertionError, test_fizzbuzz, bad_no_buzz), "your tests catch a function that gives 5 as a number")
check(raises(AssertionError, test_fizzbuzz, bad_no_fizz), "your tests catch a function that gives 3 as a number")
check(raises(AssertionError, test_fizzbuzz, bad_plain), "your tests catch a function that changes the plain numbers")
check(uses("Assert"), "uses assert")
%% hint
A test function takes the function to check as its parameter, and calls it: `function(3)`.
%% hint
Write one `assert` for each case: `assert function(3) == "Fizz", "3 is Fizz"`. Include a plain number such as 1 or 7.
%% hint
A good set has the four numbers 1, 3, 5 and 15, because each one catches a different kind of mistake.
%% end

%% exercise write-doctests | Write the doctests
The function `shout` is in the starter code. Add **three** doctest examples to its docstring, each one a line that starts with `>>>` followed by the exact answer, and make sure that they all pass. The last line runs them. The program prints:

```output
TestResults(failed=0, attempted=3)
```
%% starter
import doctest

def shout(text):
    """Return the text in capitals, with an exclamation mark at the end."""
    return text.upper() + "!"

# Add three examples to the docstring above.
print(doctest.testmod())

%% solution
import doctest

def shout(text):
    """Return the text in capitals, with an exclamation mark at the end.

    >>> shout("hello")
    'HELLO!'
    >>> shout("Python 3")
    'PYTHON 3!'
    >>> shout("")
    '!'
    """
    return text.upper() + "!"

print(doctest.testmod())
%% tests
expect_output("TestResults(failed=0, attempted=3)")
check(shout.__doc__.count(">>>") == 3, "the docstring has three examples")
expect(shout("ab"), "AB!", "the function still works")
check(calls("testmod"), "runs doctest.testmod()")
%% hint
An example is two lines inside the docstring: `>>> shout("hello")` and, on the next line, the answer.
%% hint
The answer is a text, so Python shows it with quotes: `'HELLO!'`.
%% hint
Leave one blank line after the first sentence of the docstring, and indent the examples like the rest of the docstring.
%% end

%% exercise vowel-cases | Make the cases pass
The test cases are in the starter code, and `count_vowels` is only a stub that always returns 0. Write the real function. It counts the vowels `a`, `e`, `i`, `o` and `u` in a text, in lower case or upper case. The program prints:

```output
All 6 cases passed
```
%% starter
cases = [
    ("hello", 2),
    ("PYTHON", 1),
    ("", 0),
    ("rhythm", 0),
    ("AEIOU aeiou", 10),
    ("Queueing", 5),
]

def count_vowels(text):
    return 0

failed = 0
for text, expected in cases:
    if count_vowels(text) != expected:
        failed += 1
        print("FAIL:", text)
if failed == 0:
    print("All", len(cases), "cases passed")

%% solution
cases = [
    ("hello", 2),
    ("PYTHON", 1),
    ("", 0),
    ("rhythm", 0),
    ("AEIOU aeiou", 10),
    ("Queueing", 5),
]

def count_vowels(text):
    count = 0
    for ch in text.lower():
        if ch in "aeiou":
            count += 1
    return count

failed = 0
for text, expected in cases:
    if count_vowels(text) != expected:
        failed += 1
        print("FAIL:", text)
if failed == 0:
    print("All", len(cases), "cases passed")
%% tests
expect_output("All 6 cases passed")
expect(count_vowels("Education"), 5, "Education")
expect(count_vowels("xyz"), 0, "xyz")
expect(count_vowels("AEIOU"), 5, "AEIOU")
expect(count_vowels("a e i"), 3, "a e i")
expect(count_vowels("sky"), 0, "sky")
%% hint
Go through the characters of the text, and count the ones that are vowels.
%% hint
Convert the text with `lower()` first, so that capital letters count too. Then test each character with `ch in "aeiou"`.
%% hint
Keep a counter that starts at 0, add 1 for each vowel, and `return` it after the loop.
%% end

%% exercise fails-with | Build assertRaises
Define a function `fails_with(error_type, function, *args)` that calls `function(*args)`. It returns `True` when the call raises `error_type`, and `False` when the call finishes without an error. An error of any other type is **not** caught. This is the idea behind `assertRaises`. The program prints:

```output
True
False
True
```
%% starter
def divide(a, b):
    return a / b

# Define fails_with(error_type, function, *args) here.

print(fails_with(ValueError, int, "abc"))
print(fails_with(ValueError, int, "42"))
print(fails_with(ZeroDivisionError, divide, 1, 0))

%% solution
def divide(a, b):
    return a / b

def fails_with(error_type, function, *args):
    try:
        function(*args)
    except error_type:
        return True
    else:
        return False

print(fails_with(ValueError, int, "abc"))
print(fails_with(ValueError, int, "42"))
print(fails_with(ZeroDivisionError, divide, 1, 0))
%% tests
expect_output("True\nFalse\nTrue")
check(defines("fails_with"), "defines a function called fails_with")
expect(fails_with(KeyError, lambda: {}["a"]), True, "a missing key")
expect(fails_with(KeyError, len, "abc"), False, "no error at all")
expect(fails_with(LookupError, lambda: [][0]), True, "a parent type catches a child error")
check(raises(ZeroDivisionError, fails_with, ValueError, divide, 1, 0), "an error of another type is not caught")
check(uses("Try"), "uses try and except")
%% hint
Call `function(*args)` inside a `try` block. The star unpacks the arguments.
%% hint
`except error_type:` works with a type that is stored in a variable.
%% hint
Return `True` in the `except` block, and `False` in an `else` block, which runs when no error happened.
%% end

%% exercise slugify | Challenge: Test first
A **slug** is a title turned into text for a web address: all lower case, every group of characters that are not letters or digits replaced by a single hyphen, and no hyphen at the start or at the end. The test cases are in the starter code, and `slugify` is only a stub. Write it, so that every case passes. The program prints:

```output
All 7 cases passed
```
%% starter
cases = [
    ("Hello World", "hello-world"),
    ("  Many   spaces  ", "many-spaces"),
    ("C++ & Python!", "c-python"),
    ("Already-a-slug", "already-a-slug"),
    ("", ""),
    ("100% Pure", "100-pure"),
    ("---", ""),
]

def slugify(title):
    return title

failed = 0
for title, expected in cases:
    if slugify(title) != expected:
        failed += 1
        print("FAIL: [" + title + "]")
if failed == 0:
    print("All", len(cases), "cases passed")

%% solution
import re

cases = [
    ("Hello World", "hello-world"),
    ("  Many   spaces  ", "many-spaces"),
    ("C++ & Python!", "c-python"),
    ("Already-a-slug", "already-a-slug"),
    ("", ""),
    ("100% Pure", "100-pure"),
    ("---", ""),
]

def slugify(title):
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower())
    return slug.strip("-")

failed = 0
for title, expected in cases:
    if slugify(title) != expected:
        failed += 1
        print("FAIL: [" + title + "]")
if failed == 0:
    print("All", len(cases), "cases passed")
%% tests
expect_output("All 7 cases passed")
expect(slugify("A  B"), "a-b", "two spaces")
expect(slugify("Python 3.14 Released!"), "python-3-14-released", "dots and a bang")
expect(slugify("x"), "x", "one letter")
expect(slugify("  !!  "), "", "only punctuation")
expect(slugify("Tea & Coffee"), "tea-coffee", "an ampersand")
%% hint
Three jobs: make it lower case, replace each group of other characters with one hyphen, and remove the hyphens at the ends.
%% hint
`re.sub(r"[^a-z0-9]+", "-", text)` replaces every run of characters that are not lower-case letters or digits. Lower the text first.
%% hint
Finish with `.strip("-")`. Without it, a title that ends with `!` would end with a hyphen.
%% end

## What you learned

- An **automated test** checks your code in a fraction of a second, every time you ask. Tests find bugs early, make changes safe, and explain what the code should do.
- Plain `assert` lines are the simplest test, but the first failure hides the others. A runner that calls one test function after another, and catches each `AssertionError`, reports everything.
- Choose cases on purpose: a typical input, the smallest input (empty, zero), one item, the boundaries, negative and huge values, repeats, and wrong input that must raise the right exception. Compare floats with a tolerance.
- `unittest` offers `TestCase` classes, with each method that starts with `test` run as one test, checking methods such as `assertEqual`, `assertAlmostEqual` and `assertRaises`, and `unittest.main(exit=False)` to run them. Its report appears in red here, and the last line says `OK` when everything passed. (Classes are explained in module 10.)
- `doctest` runs the `>>>` examples in docstrings, with `doctest.testmod()`. The expected text must match exactly.
- **Test first** (red, green, refactor): write failing tests, make them pass with the simplest code, then tidy up. Tests and doctests are documentation that cannot go out of date.
