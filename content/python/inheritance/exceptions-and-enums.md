---
title: Custom exceptions and enums
---
Python's built-in exceptions describe general problems: a bad value, a missing key, a division by zero. Your own program has problems of its own: "the account has too little money", "the order was already shipped". In this lesson you give those problems **names**, by writing your own exception classes. You will see that this is inheritance at work, because every exception is a class in a family. In the second half you meet **enums**, which replace "magic" strings and numbers such as `"red"` or `3` with named constants that cannot be mistyped.

## Your own exception

An exception is a class that inherits, directly or from far away, from `Exception`. To make your own, write a class that names `Exception` as its parent. The body can be `pass`, because the parent already knows how to carry a message:

```python run
class InsufficientFundsError(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError("not enough money")
    return balance - amount

try:
    withdraw(50, 80)
except InsufficientFundsError as e:
    print("Caught:", e)
```

When nobody catches it, the traceback shows the name of your class, which tells the reader what went wrong:

```python run error
class InsufficientFundsError(Exception):
    pass

raise InsufficientFundsError("need 80, have 50")
```

There are good reasons to write a class instead of raising `ValueError` with a message:

- The **name** says what happened, in the language of your program.
- A caller can catch **exactly** this problem. With `except ValueError`, a handler would also catch unrelated value errors from other lines.
- The class can carry **data** and have **methods**, as you will see in a moment.

By convention the name ends with `Error` (or `Exception`), and it is written in `CapWords`.

%% question q-custom-choice | choice
What is the main reason to write `class PaymentError(Exception):` instead of raising a plain `ValueError`?
%% choice
Python refuses to raise built-in exceptions in your own functions
%% choice correct
The name says what went wrong, and callers can catch exactly this problem
%% choice
A custom exception runs faster
%% choice
`ValueError` cannot have a message
%% explain
Exceptions are about communication. A class with a clear name makes the program easier to read, and `except PaymentError` handles this problem without catching unrelated errors.
%% end

## Families of exceptions

Exceptions form a family tree, as you saw in module 9 (`IndexError` and `KeyError` are both `LookupError`). You can build a tree for your own program: one **base class** for the whole program, and a child for each kind of problem:

```python run
class BankError(Exception):
    """Base class for every problem in the bank program."""

class InsufficientFundsError(BankError):
    pass

class AccountClosedError(BankError):
    pass

def withdraw(balance, amount, closed):
    if closed:
        raise AccountClosedError("the account is closed")
    if amount > balance:
        raise InsufficientFundsError("not enough money")
    return balance - amount

cases = [(50, 20, False), (50, 80, False), (50, 10, True)]
for balance, amount, closed in cases:
    try:
        print(withdraw(balance, amount, closed))
    except InsufficientFundsError:
        print("Please deposit first")
    except BankError as e:
        print("Bank problem:", e)
```

The clauses are checked from the top, and the first that matches wins, so the **specific** error goes first and the **general** one after it. `except BankError` catches the whole family, including the classes that you add next month. A program can handle one problem in detail and everything else in one place.

Choose the parent with care. When your error **is a kind of** a built-in error, inherit from that one. A `NegativeAmountError(ValueError)` is still a `ValueError`, so older code with `except ValueError` keeps working when you start raising the new, more precise error.

%% question q-family-predict | predict
What does this program print?

```python
class AppError(Exception):
    pass

class DbError(AppError):
    pass

try:
    raise DbError("down")
except ValueError:
    print("value")
except AppError as e:
    print("app:", e)
```
%% answer
app: down
%% explain
A `DbError` is not a `ValueError`, so the first clause is skipped. It is an `AppError`, because `DbError` inherits from it, so the second clause catches it and prints the message.
%% end

## Exceptions that carry data

A message is text for people. A program often needs the **facts** too: how much money was missing? You can give an exception its own `__init__`, call `super().__init__` with the message, and store the facts in attributes:

```python run
class InsufficientFundsError(Exception):
    def __init__(self, needed, available):
        super().__init__(f"need {needed}, have {available}")
        self.needed = needed
        self.available = available

try:
    raise InsufficientFundsError(80, 50)
except InsufficientFundsError as e:
    print(e)
    print("Missing:", e.needed - e.available)
    print(e.args)
```

The call to `super().__init__(message)` makes `print(e)` show the message, and the exception keeps its arguments in the attribute `args`. The handler does not need to take numbers out of a sentence. It uses `e.needed` and `e.available` directly. Exception classes are ordinary classes, so everything you know about `__init__` and `super()` applies.

%% question q-data-predict | predict
What does this program print?

```python
class TooBig(Exception):
    def __init__(self, size, limit):
        super().__init__(f"{size} is over {limit}")
        self.over = size - limit

try:
    raise TooBig(12, 10)
except TooBig as e:
    print(e, e.over)
```
%% answer
12 is over 10 2
%% explain
`print(e)` shows the message that was given to `super().__init__`, which is `12 is over 10`. The attribute `over` holds `12 - 10`, which is `2`.
%% end

## Translating errors with raise ... from

Low-level code raises low-level errors. A function that looks a setting up in a dictionary raises `KeyError` when it is missing, but the caller of `get_setting` should not have to know that the settings live in a dictionary. They might live in a file tomorrow. The function can **translate** the error into one of your own, and keep the original as the **cause**:

```python run
class MissingSettingError(Exception):
    pass

settings = {"theme": "dark"}

def get_setting(name):
    try:
        return settings[name]
    except KeyError as e:
        raise MissingSettingError(f"no setting called {name}") from e

print(get_setting("theme"))
try:
    get_setting("volume")
except MissingSettingError as e:
    print("Error:", e)
    print("Caused by:", type(e.__cause__).__name__, e.__cause__)
```

The `from e` part stores the original exception in `__cause__`. When an error is not caught, the traceback shows both, with the line "The above exception was the direct cause of the following exception", so nobody loses the first clue.

## Enums: named constants

Programs are full of values that come from a small, fixed set: the colours of a traffic light, the days of the week, the status of an order. People often write them as text or as numbers, and that goes wrong in a quiet way:

```python run
def describe_light(colour):
    if colour == "red":
        return "stop"
    elif colour == "green":
        return "go"
    return "wait"

print(describe_light("red"))
print(describe_light("Red"))
```

The second call is a typo (a capital letter), and the function does not complain. It answers "wait" for a red light. An **enum** (enumeration) is a class whose members are the only allowed values:

```python run
from enum import Enum

class Colour(Enum):
    RED = 1
    YELLOW = 2
    GREEN = 3

def describe_light(colour):
    if colour is Colour.RED:
        return "stop"
    elif colour is Colour.GREEN:
        return "go"
    return "wait"

print(describe_light(Colour.RED))
print(Colour.GREEN, Colour.GREEN.name, Colour.GREEN.value)
print(repr(Colour.YELLOW))
for colour in Colour:
    print(colour.name, colour.value)
```

Each member has a `name` (the text `GREEN`) and a `value` (the number `3`), and a loop over the class gives the members in the order of their definition. A misspelt member such as `Colour.GRAEN` fails at once with an `AttributeError`, instead of quietly meaning "something else".

Members are **unique objects**, so you compare them with `is` (or `==`). A member is **not equal** to its value, and you can look members up by value or by name:

```python run
from enum import Enum

class Colour(Enum):
    RED = 1
    GREEN = 2

print(Colour(2))
print(Colour["RED"])
print(Colour.RED == 1, Colour.RED is Colour(1))
try:
    Colour(5)
except ValueError as e:
    print("Error:", e)
try:
    print(Colour.PURPLE)
except AttributeError as e:
    print("Error:", e)
```

`Colour(2)` looks up by **value**, and `Colour["RED"]` by **name**. An unknown value gives a `ValueError`, which is handy for checking input that people type. Members cannot be reassigned, and they can be used as dictionary keys and in sets.

%% question q-enum-predict | predict
What does this program print?

```python
from enum import Enum

class Size(Enum):
    SMALL = 1
    LARGE = 2

print(Size(2).name, Size["SMALL"].value, Size.SMALL == 1, Size.SMALL is Size(1))
```
%% answer
LARGE 1 False True
%% explain
`Size(2)` finds the member with the value 2, which is `LARGE`. `Size["SMALL"]` finds the member by name, and its value is 1. The member itself is not equal to the number 1, but `Size(1)` gives back the very same member, so `is` is true.
%% end

## auto(), IntEnum and Flag

You often do not care about the numbers. The helper `auto()` chooses them for you, starting at 1. An `IntEnum` is an enum whose members **are also integers**, so they can be compared and used in arithmetic, which is perfect for things with an order, such as a priority:

```python run
from enum import Enum, IntEnum, auto

class Direction(Enum):
    NORTH = auto()
    EAST = auto()

for d in Direction:
    print(d.name, d.value)

class Priority(IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3

print(Priority.LOW < Priority.HIGH, Priority.HIGH + 1, Priority.HIGH == 3)
print(sorted([Priority.HIGH, Priority.LOW, Priority.MEDIUM]))
```

A plain `Enum` does not allow `<`, because the colours red and green have no natural order. Use `IntEnum` only when the numbers really matter.

A `Flag` enum is for **options that can be combined**, such as the permissions of a file. Its members are powers of two, so each one is a separate "switch", and you combine them with `|` (or), test with `in`, and keep only some with `&` (and):

```python run
from enum import Flag, auto

class Permission(Flag):
    READ = auto()
    WRITE = auto()
    EXECUTE = auto()

mine = Permission.READ | Permission.WRITE
print(mine)
print(Permission.READ in mine, Permission.EXECUTE in mine)
mine = mine | Permission.EXECUTE
print(mine, mine.value)
print(Permission.WRITE & mine)
```

## Enums with methods

An enum is a class, so it can have methods. They are a good place for the rules that belong to the values:

```python run
from enum import Enum

class Light(Enum):
    RED = "stop"
    GREEN = "go"
    YELLOW = "wait"

    def change(self):
        order = [Light.RED, Light.GREEN, Light.YELLOW]
        position = order.index(self)
        return order[(position + 1) % 3]

light = Light.RED
for step in range(4):
    print(light.name, light.value)
    light = light.change()
```

The values here are texts (`"stop"`, `"go"`), which shows that a value can be anything. The `%` operator wraps the position around, so after the last light the cycle starts again.

%% question q-enum-multi | multi
Select every true statement about enums.
%% choice correct
You compare members with `is` or `==`.
%% choice correct
`Colour(1)` looks a member up by value, and `Colour["RED"]` looks it up by name.
%% choice correct
A loop over an enum class gives its members in the order of the definition.
%% choice
A member of a plain `Enum` is equal to its value, so `Colour.RED == 1` is `True`.
%% choice
A misspelt member name quietly gives `None`.
%% explain
Members are unique objects that are different from their values, so `Colour.RED == 1` is `False` for a plain `Enum`. Asking for a member that does not exist raises an `AttributeError`, so a typo cannot hide.
%% end

## A project: an order tracker

Here, custom exceptions and an enum work together. The status of an order can only move forward along allowed paths. An attempt to break the rules raises an `InvalidTransition`, which carries the two statuses:

```python run stdin="pay\nship\nship\ndeliver\ncancel\ndone"
from enum import Enum

class Status(Enum):
    NEW = 1
    PAID = 2
    SHIPPED = 3
    DELIVERED = 4
    CANCELLED = 5

class OrderError(Exception):
    pass

class InvalidTransition(OrderError):
    def __init__(self, current, wanted):
        super().__init__(f"cannot go from {current.name} to {wanted.name}")
        self.current = current
        self.wanted = wanted

ALLOWED = {
    Status.NEW: [Status.PAID, Status.CANCELLED],
    Status.PAID: [Status.SHIPPED, Status.CANCELLED],
    Status.SHIPPED: [Status.DELIVERED],
    Status.DELIVERED: [],
    Status.CANCELLED: [],
}

COMMANDS = {
    "pay": Status.PAID,
    "ship": Status.SHIPPED,
    "deliver": Status.DELIVERED,
    "cancel": Status.CANCELLED,
}

class Order:
    def __init__(self):
        self.status = Status.NEW

    def move_to(self, wanted):
        if wanted not in ALLOWED[self.status]:
            raise InvalidTransition(self.status, wanted)
        self.status = wanted

order = Order()
while True:
    command = input()
    if command == "done":
        break
    try:
        order.move_to(COMMANDS[command])
        print("Now:", order.status.name)
    except OrderError as e:
        print("Error:", e)
```

The rules of the order live in **one table** (`ALLOWED`) that uses enum members as keys, and the class has one short method. The exception tells the user which move was refused and why. If a new status appears, the change is one new member and a few table entries.

## Your turn

%% exercise negative-amount | A negative amount
Write the exception class `NegativeAmountError` as a **child of `ValueError`**, and the function `add_money(balance, amount)`. It returns the new balance, or raises `NegativeAmountError("amount cannot be negative")` when the amount is below 0. The starter reads amounts until `done`, and it handles `ValueError`, so it catches your exception **and** the error that `int` raises for text. For the input below the program prints:

```output
Balance: 50
Error: amount cannot be negative
Error: invalid literal for int() with base 10: 'abc'
Balance: 80
```
%% stdin
50
-20
abc
30
done
%% starter
# Write NegativeAmountError and add_money(balance, amount) here.

balance = 0
while True:
    text = input()
    if text == "done":
        break
    try:
        balance = add_money(balance, int(text))
        print("Balance:", balance)
    except ValueError as e:
        print("Error:", e)

%% solution
class NegativeAmountError(ValueError):
    pass

def add_money(balance, amount):
    if amount < 0:
        raise NegativeAmountError("amount cannot be negative")
    return balance + amount

balance = 0
while True:
    text = input()
    if text == "done":
        break
    try:
        balance = add_money(balance, int(text))
        print("Balance:", balance)
    except ValueError as e:
        print("Error:", e)
%% tests
expect_output("Balance: 50\nError: amount cannot be negative\nError: invalid literal for int() with base 10: 'abc'\nBalance: 80")
check(issubclass(NegativeAmountError, ValueError), "NegativeAmountError is a kind of ValueError")
check(raises(NegativeAmountError, add_money, 10, -1), "a negative amount is refused with your exception")
expect(add_money(10, 5), 15, "adding money")
expect(add_money(10, 0), 10, "zero is allowed")
try:
    add_money(0, -5)
except NegativeAmountError as e:
    message = str(e)
expect(message, "amount cannot be negative", "the message")
%% hint
A class that is a kind of `ValueError` starts with `class NegativeAmountError(ValueError):`. The body can be `pass`.
%% hint
`add_money` checks `amount < 0` first, and raises `NegativeAmountError("amount cannot be negative")`.
%% hint
Otherwise return `balance + amount`. The `except ValueError` in the starter also catches your class, because it is a child of `ValueError`.
%% end

%% exercise bank-errors | A family of bank errors
Write a family of exceptions and an account class:

- `BankError(Exception)` is the base class.
- `InsufficientFundsError(BankError)` is created with `needed` and `available`. It stores both, and its message is `need 90, have 70` (with the numbers).
- `AccountClosedError(BankError)` needs nothing special.
- `Account(balance)` has `close()` and `withdraw(amount)`. A closed account raises `AccountClosedError("the account is closed")`. Otherwise, a withdrawal above the balance raises `InsufficientFundsError(amount, balance)`.

The starter reads the commands. For the input below the program prints:

```output
Balance: 70
Short by 20
Closed
Bank error: the account is closed
```
%% stdin
withdraw 30
withdraw 90
close
withdraw 10
done
%% starter
# Write BankError, InsufficientFundsError, AccountClosedError and Account here.

account = Account(100)
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    try:
        if parts[0] == "withdraw":
            account.withdraw(int(parts[1]))
            print("Balance:", account.balance)
        elif parts[0] == "close":
            account.close()
            print("Closed")
    except InsufficientFundsError as e:
        print(f"Short by {e.needed - e.available}")
    except BankError as e:
        print("Bank error:", e)

%% solution
class BankError(Exception):
    pass

class InsufficientFundsError(BankError):
    def __init__(self, needed, available):
        super().__init__(f"need {needed}, have {available}")
        self.needed = needed
        self.available = available

class AccountClosedError(BankError):
    pass

class Account:
    def __init__(self, balance):
        self.balance = balance
        self.closed = False

    def close(self):
        self.closed = True

    def withdraw(self, amount):
        if self.closed:
            raise AccountClosedError("the account is closed")
        if amount > self.balance:
            raise InsufficientFundsError(amount, self.balance)
        self.balance -= amount

account = Account(100)
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    try:
        if parts[0] == "withdraw":
            account.withdraw(int(parts[1]))
            print("Balance:", account.balance)
        elif parts[0] == "close":
            account.close()
            print("Closed")
    except InsufficientFundsError as e:
        print(f"Short by {e.needed - e.available}")
    except BankError as e:
        print("Bank error:", e)
%% tests
expect_output("Balance: 70\nShort by 20\nClosed\nBank error: the account is closed")
check(issubclass(InsufficientFundsError, BankError) and issubclass(AccountClosedError, BankError), "both errors belong to the BankError family")
check(issubclass(BankError, Exception), "BankError is an exception")
e = InsufficientFundsError(80, 50)
expect(str(e), "need 80, have 50", "the message")
expect(e.needed, 80, "the attribute needed")
expect(e.available, 50, "the attribute available")
a = Account(10)
check(raises(InsufficientFundsError, a.withdraw, 11), "withdrawing too much")
a.withdraw(10)
expect(a.balance, 0, "withdrawing everything")
a.close()
check(raises(AccountClosedError, a.withdraw, 1), "a closed account refuses every withdrawal")
%% hint
`BankError` can be `class BankError(Exception): pass`. The two errors name `BankError` as their parent.
%% hint
`InsufficientFundsError.__init__(self, needed, available)` calls `super().__init__(f"need {needed}, have {available}")` and then stores the two attributes.
%% hint
In `Account.withdraw`, check `self.closed` first and raise `AccountClosedError("the account is closed")`. Then check `amount > self.balance` and raise `InsufficientFundsError(amount, self.balance)`. Subtract only after both checks.
%% end

%% exercise translate-errors | Translate the error
The starter has a dictionary of prices. Write the exception class `UnknownItemError` and the function `price_of(name)`. When the name is not in the dictionary, `price_of` must raise `UnknownItemError` with the message `unknown item: cap` (with the name), and it must do so **from** the original `KeyError`. For the input below the program prints:

```output
Error: unknown item: cap
Total: 14
```
%% stdin
pen
cap
book
done
%% starter
prices = {"pen": 2, "book": 12, "bag": 30}

# Write UnknownItemError and price_of(name) here.

total = 0
while True:
    name = input()
    if name == "done":
        break
    try:
        total += price_of(name)
    except UnknownItemError as e:
        print("Error:", e)
print("Total:", total)

%% solution
prices = {"pen": 2, "book": 12, "bag": 30}

class UnknownItemError(Exception):
    pass

def price_of(name):
    try:
        return prices[name]
    except KeyError as e:
        raise UnknownItemError(f"unknown item: {name}") from e

total = 0
while True:
    name = input()
    if name == "done":
        break
    try:
        total += price_of(name)
    except UnknownItemError as e:
        print("Error:", e)
print("Total:", total)
%% tests
expect_output("Error: unknown item: cap\nTotal: 14")
expect(price_of("bag"), 30, "a known item")
check(issubclass(UnknownItemError, Exception), "UnknownItemError is an exception")
try:
    price_of("zzz")
except UnknownItemError as err:
    cause = err.__cause__
    text = str(err)
else:
    cause = None
    text = ""
check(isinstance(cause, KeyError), "the new exception is raised from the KeyError")
expect(text, "unknown item: zzz", "the message")
check(" from " in source(), "uses raise ... from")
%% hint
Put the dictionary lookup in a `try` block, and handle `KeyError` in an `except KeyError as e:` clause.
%% hint
In the clause, raise the new exception: `raise UnknownItemError(f"unknown item: {name}")`.
%% hint
Add `from e` at the end of the `raise` line, so that the `KeyError` is stored as the cause.
%% end

%% exercise traffic-enum | A traffic light
Write the enum `Light` with the members `RED`, `GREEN` and `YELLOW`, and a method `change()` that returns the **next** light in the cycle: red, then green, then yellow, then red again. The starter reads the colour to start from and a number of steps, and prints every light. For the input below the program prints:

```output
YELLOW
RED
GREEN
YELLOW
```
%% stdin
yellow
3
%% starter
from enum import Enum

# Write the enum Light here, with the members RED, GREEN and YELLOW
# and a method change() that returns the next light.

start = input().upper()
steps = int(input())
light = Light[start]
print(light.name)
for i in range(steps):
    light = light.change()
    print(light.name)

%% solution
from enum import Enum

class Light(Enum):
    RED = 1
    GREEN = 2
    YELLOW = 3

    def change(self):
        if self is Light.RED:
            return Light.GREEN
        if self is Light.GREEN:
            return Light.YELLOW
        return Light.RED

start = input().upper()
steps = int(input())
light = Light[start]
print(light.name)
for i in range(steps):
    light = light.change()
    print(light.name)
%% tests
expect_output("YELLOW\nRED\nGREEN\nYELLOW")
expect(len(list(Light)), 3, "three lights")
check(Light.RED.change() is Light.GREEN, "red changes to green")
check(Light.GREEN.change() is Light.YELLOW, "green changes to yellow")
check(Light.YELLOW.change() is Light.RED, "yellow changes to red")
check(Light["GREEN"] is Light.GREEN, "a light can be found by name")
check(rerun("red\n0").strip() == "RED", "no steps")
check(rerun("green\n2").strip() == "GREEN\nYELLOW\nRED", "two steps from green")
%% hint
An enum is a class that inherits from `Enum`: `class Light(Enum):`. Each member is a line such as `RED = 1`.
%% hint
`change` is a method with `self` as its first parameter. Inside, compare `self` with the members using `is`: `if self is Light.RED:`.
%% hint
Return `Light.GREEN` after red, `Light.YELLOW` after green, and `Light.RED` after yellow (the last `return` can cover yellow).
%% end

%% exercise file-permissions | Challenge: Permissions as flags
Write the enum `Permission(Flag)` with the members `READ`, `WRITE` and `EXECUTE` (use `auto()`), and two functions:

- `parse(code)` turns a code such as `rw-` into one combined permission. The letter `r` is `READ`, `w` is `WRITE`, `x` is `EXECUTE`, and a `-` adds nothing.
- `show(perm)` turns a permission back into the three-letter code, such as `r-x`.

The starter reads pairs `have need` until `done`, and prints both codes and `allowed` when the permission `have` includes everything in `need`, or `denied` otherwise. For the input below the program prints:

```output
rwx r--: allowed
r-- rw-: denied
rw- ---: allowed
--x --x: allowed
```
%% stdin
rwx r--
r-- rw-
rw- ---
--x --x
done
%% starter
from enum import Flag, auto

# Write Permission, parse(code) and show(perm) here.

while True:
    line = input()
    if line == "done":
        break
    have_code, need_code = line.split()
    have = parse(have_code)
    need = parse(need_code)
    answer = "allowed" if need in have else "denied"
    print(f"{show(have)} {show(need)}: {answer}")

%% solution
from enum import Flag, auto

class Permission(Flag):
    READ = auto()
    WRITE = auto()
    EXECUTE = auto()

LETTERS = {"r": Permission.READ, "w": Permission.WRITE, "x": Permission.EXECUTE}

def parse(code):
    perm = Permission(0)
    for letter in code:
        if letter in LETTERS:
            perm = perm | LETTERS[letter]
    return perm

def show(perm):
    text = ""
    for letter in "rwx":
        if LETTERS[letter] in perm:
            text += letter
        else:
            text += "-"
    return text

while True:
    line = input()
    if line == "done":
        break
    have_code, need_code = line.split()
    have = parse(have_code)
    need = parse(need_code)
    answer = "allowed" if need in have else "denied"
    print(f"{show(have)} {show(need)}: {answer}")
%% tests
expect_output("rwx r--: allowed\nr-- rw-: denied\nrw- ---: allowed\n--x --x: allowed")
check(issubclass(Permission, Flag), "Permission is a Flag")
expect(show(parse("rw-")), "rw-", "a round trip")
expect(show(parse("---")), "---", "no permission at all")
check(parse("rwx") == Permission.READ | Permission.WRITE | Permission.EXECUTE, "all three letters")
check(Permission.READ in parse("r-x"), "r means READ")
check(Permission.WRITE not in parse("r-x"), "a dash adds nothing")
check(rerun("r-- r--\ndone").strip() == "r-- r--: allowed", "the same permission")
%% hint
`Permission` has three members, each one `auto()`. Because it is a `Flag`, members can be combined with `|`.
%% hint
In `parse`, start from the empty permission `Permission(0)` and add the member for each letter with `perm = perm | member`. A dictionary from letter to member keeps it short.
%% hint
In `show`, go through the letters `"rwx"`. When the member for that letter is `in` the permission, add the letter to the text, and otherwise add `"-"`.
%% end

## What you learned

- An **exception class** inherits from `Exception`: `class InsufficientFundsError(Exception): pass`. A good name says what went wrong, and callers can catch exactly that problem.
- Build a **family**: one base class for the program and a child for each kind of problem. `except Base` catches the whole family, and the specific clause goes first. Inherit from a built-in error (such as `ValueError`) when your error is a kind of it.
- An exception can carry **data**: give it an `__init__`, call `super().__init__(message)`, and store attributes, so a handler can use the facts without parsing text.
- `raise NewError(...) from e` translates a low-level error into your own, and keeps the original in `__cause__`.
- An **enum** (`from enum import Enum`) is a class of named constants. Members have a `name` and a `value`, are compared with `is`, are looked up with `Colour(1)` or `Colour["RED"]`, and an unknown one raises an error instead of passing quietly.
- `auto()` chooses the values, `IntEnum` members are also integers (so they can be ordered), and `Flag` members combine with `|`, `&` and `in`.
- An enum is a class, so it can have methods for the rules that belong to its values.
