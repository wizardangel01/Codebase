---
title: Raising exceptions
---
In the last lesson Python raised the exceptions and you handled them. Now you take the other side: **you** raise an exception when your own function receives something that it cannot accept. A function that stops loudly, with a clear message, is far better than one that carries on with nonsense and breaks something somewhere else, much later.

## The raise statement

The `raise` statement creates an exception and starts it on its way, exactly as if Python had raised it. You give the type and, in brackets, a message:

```python run error
def set_age(age):
    if age < 0:
        raise ValueError("age cannot be negative")
    return age

print(set_age(30))
print(set_age(-5))
```

The first call works. The second one raises the exception, the function stops at the `raise` line (nothing after it runs), and the traceback ends with `ValueError: age cannot be negative`. Everything that you learned about handling exceptions works the same for the ones that you raise:

```python run
def set_age(age):
    if age < 0:
        raise ValueError("age cannot be negative")
    return age

for value in [30, -5, 12]:
    try:
        print("Age set to", set_age(value))
    except ValueError as e:
        print("Rejected:", e)
```

Choose the **type** that describes the problem. You do not need to invent new types, because the built-in ones cover most cases (module 11 shows how to write your own):

| Situation | Raise |
| --- | --- |
| the right kind of value, but not an acceptable one (a negative age) | `ValueError` |
| the wrong kind of value (text where a number is needed) | `TypeError` |
| a missing item in a lookup that your code does | `KeyError` or `IndexError` |
| something that fits none of them | `RuntimeError` |

%% question q-which-raise | choice
A function `set_volume(level)` accepts the numbers 0 to 10. Which exception fits the call `set_volume(15)`?
%% choice correct
`ValueError`, because the value is a number but outside the range
%% choice
`TypeError`, because 15 is not a valid type
%% choice
`ZeroDivisionError`
%% choice
`NameError`
%% explain
The argument is the right kind of thing (a number) with an unacceptable value, which is what `ValueError` means. A `TypeError` would fit a call such as `set_volume("loud")`.
%% end

## Validate early

The best moment to reject a bad value is the moment it **enters** your code. Look at what happens when nobody checks. Nothing here is an error for Python, yet the result is nonsense:

```python run
def total_price(price, quantity):
    return price * quantity

def receipt(price, quantity):
    total = total_price(price, quantity)
    return "Total: " + str(round(total, 2))

print(receipt(2.5, 4))
print(receipt(2.5, -3))
```

A shop that prints a negative total has a bug, and the bug would be hard to find if the receipt went into a long report. Guard clauses at the top of the function stop the problem at its source:

```python run
def total_price(price, quantity):
    if price < 0:
        raise ValueError(f"price cannot be negative, got {price}")
    if quantity < 1:
        raise ValueError(f"quantity must be at least 1, got {quantity}")
    return price * quantity

for quantity in [4, -3]:
    try:
        print(total_price(2.5, quantity))
    except ValueError as e:
        print("Error:", e)
```

This is called **failing early**. The error points at the real cause, the function that received the bad value, and not at a place far away where the bad value finally did damage.

## Writing useful error messages

Someone will read your message when something has gone wrong, perhaps at night and in a hurry. Make it work for them:

1. **Say what is wrong**: `percent must be between 0 and 100`.
2. **Include the value that was received**: `, got 130`. Then the reader does not have to search for it.
3. **Say what is expected** when it is not obvious.
4. Python's own messages start with a small letter and have no full stop at the end. Follow that habit, so that your messages look like the rest.

Compare `ValueError("bad input")` with `ValueError("percent must be between 0 and 100, got 130")`. The second tells the reader what to fix without opening the code.

## Re-raising an exception

Sometimes a function wants to **react** to a problem, for instance by writing a note, and still let the caller deal with it. A bare `raise` inside an `except` block sends the same exception on its way:

```python run
def read_number(text):
    try:
        return int(text)
    except ValueError:
        print("read_number could not read", text)
        raise

try:
    read_number("abc")
except ValueError as e:
    print("The caller caught it:", e)
```

Use a bare `raise`, with no name after it. It keeps the original traceback, so the line that really failed is still shown. A bare `raise` works only inside an `except` block, because that is where an exception is being handled.

## Chaining with from

Another time the low-level error is too technical, and you want to raise a better one while remembering what happened underneath. Write `raise NewError(...) from original`:

```python run error
def load_price(text):
    try:
        return float(text)
    except ValueError as e:
        raise ValueError(f"bad price: {text}") from e

load_price("12,5")
```

The traceback now shows **both** exceptions, with the sentence "The above exception was the direct cause of the following exception". Nothing is lost: the reader sees the friendly message and the technical cause. A program can also reach the cause through the `__cause__` attribute:

```python run
def load_price(text):
    try:
        return float(text)
    except ValueError as e:
        raise ValueError(f"bad price: {text}") from e

try:
    load_price("12,5")
except ValueError as e:
    print(e)
    print("Caused by:", e.__cause__)
```

If you raise a new exception inside an `except` block **without** `from`, Python still links the two, with the words "During handling of the above exception, another exception occurred". Using `from e` says that the link is on purpose.

%% question q-reraise-choice | choice
What does a bare `raise` inside an `except` block do?
%% choice
It ends the program silently
%% choice correct
It sends the same exception on to the caller
%% choice
It creates a new `RuntimeError`
%% choice
It ignores the exception
%% explain
A bare `raise` re-raises the exception that is being handled, with its original traceback. The caller can catch it as if the `except` block had not been there.
%% end

## assert: a check for bugs

The `assert` statement checks something that **must be true** if your program is correct. When the condition is false, it raises an `AssertionError`, and an optional message after a comma explains it:

```python run
def average(numbers):
    assert len(numbers) > 0, "average needs at least one number"
    return sum(numbers) / len(numbers)

print(average([2, 4]))
try:
    print(average([]))
except AssertionError as e:
    print("AssertionError:", e)
```

An `assert` is a **tool for the programmer**. Use it for situations that should be impossible: after you sort a list, `assert result == sorted(result)`. Python can be started in a mode that **removes** every `assert`, so never use it to check input that comes from a person or a file. For those, use `if` and `raise`:

| Use `raise` for | Use `assert` for |
| --- | --- |
| input from a person, a file or another program | mistakes in your own logic |
| a caller that passed a wrong value | something that "can never happen" |
| problems that must always be reported | checks while you develop and test |

%% question q-assert-predict | predict
What does this program print?

```python
x = 5
try:
    assert x > 10, "x is too small"
    print("fine")
except AssertionError as e:
    print(e)
```
%% answer
x is too small
%% explain
The condition `x > 10` is false, so the `assert` raises an `AssertionError` with the message after the comma. The `print("fine")` line is skipped, and the `except` clause prints the message.
%% end

## Raise, or return None?

When a function cannot do its job, it has three choices: raise an exception, return a special value such as `None`, or return a sensible default. Both of the first two are used in real code, and the right choice depends on **what the caller can reasonably expect**.

- If "nothing found" is a normal result, return a special value. A search that finds no match, or `prices.get("milk")`, is not an error.
- If the caller made a mistake or the function cannot continue, raise. A negative age is not a normal result.

The danger of a special value is that the caller can **forget** to check it. Then the problem appears far from its cause:

```python run error
def find_age(name):
    ages = {"ada": 36, "grace": 45}
    return ages.get(name)

age = find_age("alan")
print(age + 1)
```

The exception, `TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'`, points at the `print` line, but the real cause is in `find_age`. A function that raises makes the problem impossible to miss:

```python run
def find_age(name):
    ages = {"ada": 36, "grace": 45}
    if name not in ages:
        raise KeyError(f"no person called {name}")
    return ages[name]

for name in ["ada", "alan"]:
    try:
        print(name, find_age(name) + 1)
    except KeyError as e:
        print("Problem:", e)
```

A good habit is to **write down**, in a comment at the top of the function, what it does when it fails, so that callers know what to expect.

## A project: a careful bank account

The functions below validate their arguments and raise `ValueError` with clear messages. The loop reads commands, and a single `except` clause turns every problem into a message, so the program never crashes:

```python run stdin="deposit 50\nwithdraw 20\nwithdraw 100\ndeposit -5\ndeposit abc\nwithdraw\nbalance\nquit"
def deposit(balance, amount):
    if amount <= 0:
        raise ValueError(f"a deposit must be more than 0, got {amount}")
    return balance + amount

def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError(f"a withdrawal must be more than 0, got {amount}")
    if amount > balance:
        raise ValueError(f"not enough money: balance {balance}, requested {amount}")
    return balance - amount

balance = 0
while True:
    parts = input("> ").split()
    if parts[0] == "quit":
        break
    try:
        if parts[0] == "deposit":
            balance = deposit(balance, int(parts[1]))
        elif parts[0] == "withdraw":
            balance = withdraw(balance, int(parts[1]))
        elif parts[0] != "balance":
            print("Unknown command:", parts[0])
            continue
    except ValueError as e:
        print("Error:", e)
    except IndexError:
        print("Error: the command needs an amount")
    else:
        print("Balance:", balance)
```

The failed commands leave the balance unchanged, because the functions raise **before** anything is stored. A line such as `deposit abc` fails inside `int`, and it is caught by the same `ValueError` clause, which shows Python's own message.

%% question q-from-fill | fill
Fill in the blank so that the program prints `ValueError`.

```python
def read(text):
    try:
        return int(text)
    except ValueError as e:
        raise RuntimeError("bad text") ___ e

try:
    read("x")
except RuntimeError as r:
    print(type(r.__cause__).__name__)
```
%% answer
from
%% expected
ValueError
%% explain
`raise ... from e` records `e` as the **cause** of the new exception, and the cause can be read from `__cause__`. The cause here is the original `ValueError` from `int("x")`.
%% end

%% question q-raise-multi | multi
Select every true statement about `raise` and `assert`.
%% choice correct
Code after a `raise` in the same block does not run.
%% choice correct
A good error message includes the value that was rejected.
%% choice
`assert` is the best way to check what a person typed.
%% choice correct
An `AssertionError` can be caught with `except AssertionError`.
%% explain
A `raise` ends the block at once, and a useful message names the rejected value. An `AssertionError` is an ordinary exception and can be caught. Assertions can be switched off, so they must not be used to check input.
%% end

%% question q-order-raise | order
Put the lines in order so that the program prints `error: negative`. One line does not belong.
%% lines
try:
    raise ValueError("negative")
except ValueError as e:
    print("error:", e)
%% distractors
    raise ValueError, "negative"
%% expected
error: negative
%% explain
The `try` block raises the exception, and the `except` clause names it and prints the message. The line with a comma is the old Python 2 form of `raise`, and it is a syntax error today.
%% end

## Your turn

%% exercise check-positive | Reject zero and below
Define a function `check_positive(n)` that returns `n` when it is more than 0, and raises a `ValueError` with the message `must be positive` otherwise. Read a whole number. Print it when it is accepted, or print `Error:` and the message when it is not. For the input `5` the program prints:

```output
5
```
%% stdin
5
%% starter
# Define check_positive(n) first.

%% solution
def check_positive(n):
    if n <= 0:
        raise ValueError("must be positive")
    return n

try:
    print(check_positive(int(input())))
except ValueError as e:
    print("Error:", e)
%% tests
expect_output("5")
check(defines("check_positive"), "defines a function called check_positive")
expect(check_positive(3), 3, "check_positive(3)")
check(raises(ValueError, check_positive, 0), "0 raises a ValueError")
check(raises(ValueError, check_positive, -1), "-1 raises a ValueError")
try:
    check_positive(-1)
    message = ""
except ValueError as e:
    message = str(e)
check(message == "must be positive", "the message is: must be positive")
check(rerun("-2").strip() == "Error: must be positive", "a negative input prints the error")
check(uses("Raise"), "uses raise")
%% hint
Test the bad case first: `if n <= 0:`.
%% hint
Inside the `if`, write `raise ValueError("must be positive")`. After it, `return n`.
%% hint
In the main part, call the function inside `try`, and print `"Error:", e` in `except ValueError as e:`.
%% end

%% exercise discount | A discount with checks
Define `discount(price, percent)` that returns the price after the discount (`price * (100 - percent) / 100`). It raises a `ValueError` with the message `price cannot be negative` for a negative price, and `percent must be between 0 and 100, got N` when the percent is outside 0 to 100, where `N` is the percent that was received. Read the price and the percent from two lines. Print the new price, or `Error:` and the message. For the input `80` and `25` the program prints:

```output
60.0
```
%% stdin
80
25
%% starter
# Define discount(price, percent) with two checks.

%% solution
def discount(price, percent):
    if price < 0:
        raise ValueError("price cannot be negative")
    if not 0 <= percent <= 100:
        raise ValueError(f"percent must be between 0 and 100, got {percent}")
    return price * (100 - percent) / 100

try:
    print(discount(int(input()), int(input())))
except ValueError as e:
    print("Error:", e)
%% tests
expect_output("60.0")
check(defines("discount"), "defines a function called discount")
expect(discount(200, 50), 100, "discount(200, 50)")
expect(discount(10, 0), 10, "discount(10, 0)")
expect(discount(10, 100), 0, "discount(10, 100)")
try:
    discount(-5, 10)
    m1 = ""
except ValueError as e:
    m1 = str(e)
check(m1 == "price cannot be negative", "message for a negative price")
try:
    discount(50, 130)
    m2 = ""
except ValueError as e:
    m2 = str(e)
check(m2 == "percent must be between 0 and 100, got 130", "message for percent 130")
check(rerun("80\n130").strip() == "Error: percent must be between 0 and 100, got 130", "the program shows the error")
check(rerun("-1\n10").strip() == "Error: price cannot be negative", "a negative price")
%% hint
Write one `if` for each rule, and raise a `ValueError` inside it.
%% hint
For the percent, `if not 0 <= percent <= 100:` is a short way to say "outside the range". The message is an f-string: `f"percent must be between 0 and 100, got {percent}"`.
%% hint
When both checks pass, `return price * (100 - percent) / 100`. In the main part, use `try` and `except ValueError as e:` to print `"Error:", e`.
%% end

%% exercise leap-checks | Check your own function
The function `is_leap(year)` is in the starter code. Add four `assert` statements, each with a message, that check these years: 2000 is a leap year, 1900 is not, 2024 is a leap year, and 2023 is not. After the checks print `All checks passed`. The program prints:

```output
All checks passed
```
%% starter
def is_leap(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

# Add four assert statements here, then print the final message.

%% solution
def is_leap(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

assert is_leap(2000), "2000 is a leap year"
assert not is_leap(1900), "1900 is not a leap year"
assert is_leap(2024), "2024 is a leap year"
assert not is_leap(2023), "2023 is not a leap year"
print("All checks passed")
%% tests
expect_output("All checks passed")
check(source().count("assert") >= 4, "has at least four assert statements")
check(uses("Assert"), "uses assert")
check(source().count("2000") >= 1 and source().count("1900") >= 1, "checks 2000 and 1900")
check(source().count("2024") >= 1 and source().count("2023") >= 1, "checks 2024 and 2023")
check(source().count(', "') + source().count(", '") >= 4, "every assert has a message after a comma")
%% hint
An assert has the form `assert condition, "message"`.
%% hint
Use `assert is_leap(2000), "..."` for a leap year, and `assert not is_leap(1900), "..."` for a year that is not.
%% hint
Write the four lines in a row after the function, and `print("All checks passed")` last.
%% end

%% exercise reraise-note | Note it, then pass it on
Define `parse_age(text)` that returns `int(text)`. When the conversion fails, it must first print `Cannot parse:` and the text, and then **re-raise** the same exception. The main part reads one line, prints the age when it works, and prints `Failed` when `parse_age` raises. For the input `abc` the program prints:

```output
Cannot parse: abc
Failed
```
%% stdin
abc
%% starter
# Define parse_age(text). Print a note in the except block, then raise again.

%% solution
def parse_age(text):
    try:
        return int(text)
    except ValueError:
        print("Cannot parse:", text)
        raise

try:
    print(parse_age(input()))
except ValueError:
    print("Failed")
%% tests
expect_output("Cannot parse: abc\nFailed")
check(defines("parse_age"), "defines a function called parse_age")
check(rerun("12").strip() == "12", "a good age is printed")
check(rerun("x1").strip() == "Cannot parse: x1\nFailed", "another bad text")
check(uses("Raise"), "uses raise")
check(uses("Try"), "uses try and except")
%% hint
Put `return int(text)` in a `try` block, and catch `ValueError` inside the function.
%% hint
In the `except` block, print the note first. Then write a bare `raise` on its own line.
%% hint
In the main part, wrap `print(parse_age(input()))` in `try`, and print `Failed` in `except ValueError:`.
%% end

%% exercise withdraw-loop | Challenge: A careful withdrawal
Define `withdraw(balance, amount)` that returns the new balance. It raises a `ValueError` with the message `amount must be more than 0` when the amount is 0 or less, and with the message `not enough money` when the amount is larger than the balance. The program starts with a balance of 100 and reads amounts, one per line, until the line `stop`. For every amount it prints `Balance:` and the new balance, or `Error:` and the message. A failed withdrawal leaves the balance as it was. For the input `30`, `0`, `90`, `70` and `stop` the program prints:

```output
Balance: 70
Error: amount must be more than 0
Error: not enough money
Balance: 0
```
%% stdin
30
0
90
70
stop
%% starter
# Define withdraw(balance, amount), then read amounts until stop.

%% solution
def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be more than 0")
    if amount > balance:
        raise ValueError("not enough money")
    return balance - amount

balance = 100
while True:
    line = input()
    if line == "stop":
        break
    try:
        balance = withdraw(balance, int(line))
        print("Balance:", balance)
    except ValueError as e:
        print("Error:", e)
%% tests
expect_output("Balance: 70\nError: amount must be more than 0\nError: not enough money\nBalance: 0")
check(defines("withdraw"), "defines a function called withdraw")
expect(withdraw(100, 30), 70, "withdraw(100, 30)")
expect(withdraw(50, 50), 0, "withdraw(50, 50)")
check(raises(ValueError, withdraw, 10, 0), "0 raises a ValueError")
check(raises(ValueError, withdraw, 10, -4), "a negative amount raises a ValueError")
check(raises(ValueError, withdraw, 10, 11), "an amount above the balance raises a ValueError")
check(rerun("stop").strip() == "", "no amounts at all")
check(rerun("-5\n100\n1\nstop").strip() == "Error: amount must be more than 0\nBalance: 0\nError: not enough money", "a different run")
check(uses("Raise"), "uses raise")
%% hint
In `withdraw`, check the amount first, then the balance, and `raise ValueError("...")` with the exact messages.
%% hint
In the loop, update the balance with `balance = withdraw(balance, int(line))` inside a `try` block. If the function raises, the assignment never happens, so the balance stays.
%% hint
Print `"Balance:", balance` after a successful withdrawal, and `"Error:", e` in `except ValueError as e:`. Leave the loop with `break` when the line is `stop`.
%% end

## What you learned

- `raise ValueError("message")` creates an exception and stops the current block. Pick the built-in type that describes the problem: `ValueError` for an unacceptable value, `TypeError` for the wrong kind of value, `KeyError` or `IndexError` for lookups, `RuntimeError` when nothing else fits.
- **Validate early.** Guard clauses at the top of a function reject bad values at the place where they enter, and the error points at the real cause.
- A useful message says what was wrong, includes the value that was received, and says what was expected.
- A bare `raise` inside `except` re-raises the same exception with its original traceback. `raise NewError(...) from e` chains a new exception to the one that caused it, and `e.__cause__` shows the cause.
- `assert condition, "message"` checks that something which must be true really is. It is for catching your own bugs, and it can be switched off, so use `if` and `raise` for input from outside.
- Return `None` (or another special value) when "nothing found" is a normal result. Raise when the caller made a mistake or the function cannot go on, because a forgotten check on `None` causes errors far from their source.
