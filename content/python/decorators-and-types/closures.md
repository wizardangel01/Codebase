---
title: Closures and higher-order functions
---
In Python a function is a **value**, like a number or a string. You can store it in a variable, put it in a list, pass it to another function, and return it from a function. This one fact is behind many of the most powerful tools in the language. In this lesson you will pass functions around, build functions that **build other functions**, and write functions that **remember** values from the place where they were created. These ideas, called higher-order functions and closures, are the foundation of the decorators in the next lesson.

## Functions are values

A function name written **without brackets** is the function itself. Written **with brackets** it is a call. So `double` is the function, and `double(7)` is the number that it gives back:

```python run
def double(n):
    return n * 2

def square(n):
    return n * n

operations = {"double": double, "square": square}   # functions stored in a dictionary
for name, operation in operations.items():
    print(name, operation(7))

action = double              # a second name for the same function
print(action(21), action is double)
print(type(double).__name__)
```

The dictionary holds two functions, and the loop calls whichever one it is looking at. The variable `action` is not a copy: it is another name for the same function object, which is why `action is double` is `True`.

## Higher-order functions

A function that **takes a function as an argument**, or **returns a function**, is a **higher-order function**. You have used some already: `sorted(words, key=len)` receives the function `len`, and `map` and `filter` receive a function to apply. Writing your own is no harder:

```python run
def apply_twice(func, value):
    return func(func(value))

def double(n):
    return n * 2

print(apply_twice(double, 5))                       # double(double(5))
print(apply_twice(str.upper, "hi"))                 # a method is a function too
print(apply_twice(lambda text: text + "!", "wow"))  # and so is a lambda
```

The function `apply_twice` does not care what `func` does. It only needs something that it can call with one value. That freedom is what makes higher-order functions so useful: the **what** is passed in, and the **how many times** stays inside.

%% question q-hof-multi | multi
Select every item that is a **higher-order function**: it takes a function as an argument, or it returns a function.
%% choice correct
`map`, which applies a function to every item of a list
%% choice correct
`filter`, which keeps the items for which a function is true
%% choice correct
A function `make_multiplier(factor)` that returns a new function
%% choice
`len`, which counts the items of a list
%% choice
`print`, which shows text on the screen
%% explain
Both `map` and `filter` receive a function, and `make_multiplier` returns one, so all three are higher-order. The functions `len` and `print` work on ordinary data: they never receive or return a function.
%% end

## Functions inside functions

A `def` is a statement like any other, so it can appear **inside** another function. The inner function is created each time that the outer function runs, and its name exists only inside the outer function:

```python run error
def make_report(title):
    def underline(text):
        return text + "\n" + "-" * len(text)
    return underline(title)

print(make_report("Sales"))
print(underline("Costs"))
```

The first `print` works. The second fails with a `NameError`, because `underline` belongs to `make_report` and nobody outside can see it. An inner function **can** read the variables of the function around it, which is the key to everything that follows:

```python run
def make_report(title):
    stars = "*" * len(title)            # belongs to make_report
    def banner():
        return f"{stars}\n{title}\n{stars}"   # reads stars and title from outside itself
    return banner()

print(make_report("Sales"))
```

## Closures: functions that remember

Now for the surprising part. What if the outer function **returns** the inner function, instead of calling it? The outer function is finished, and its local variables should be gone. But the inner function still works:

```python run
def make_multiplier(factor):
    def multiply(number):
        return number * factor      # factor comes from make_multiplier
    return multiply

triple = make_multiplier(3)
tenfold = make_multiplier(10)
print(triple(5), tenfold(5))

print(triple.__closure__[0].cell_contents)   # the remembered value, kept in a cell
print(triple.__code__.co_freevars)           # the names that it remembers
```

When `make_multiplier(3)` returns, Python keeps the variable `factor` alive in a small box called a **cell**, because `multiply` still needs it. A function together with the outside variables that it remembers is called a **closure**. Every call of `make_multiplier` creates a **new** closure with its **own** `factor`, so `triple` and `tenfold` never disturb each other.

%% key A closure remembers variables, not only values
The inner function does not copy the value of `factor`. It keeps a link to the **variable** itself. Most of the time the difference does not matter, but later in this lesson you will meet a trap that comes from exactly this.
%% end

%% question q-adder-predict | predict
What does this program print?

```python
def make_adder(n):
    def add(x):
        return x + n
    return add

add5 = make_adder(5)
add10 = make_adder(10)
print(add5(1), add10(1))
```
%% answer
6 11
%% explain
Each call of `make_adder` makes a separate closure. The function `add5` remembers `n = 5`, so `add5(1)` is 6, and `add10` remembers `n = 10`, so `add10(1)` is 11.
%% end

## nonlocal: closures that change their memory

A closure can also **change** what it remembers, which lets it keep a count or a total between calls. Here the keyword `nonlocal` is needed:

```python run
def make_counter():
    count = 0
    def counter():
        nonlocal count          # count belongs to make_counter, not to counter
        count += 1
        return count
    return counter

first = make_counter()
second = make_counter()
print(first(), first(), first())
print(second())                 # a separate counter, starting from zero
```

Every counter has its own `count`, which survives between calls because the closure keeps it. Without the `nonlocal` line, Python reads `count += 1` as the creation of a **new local variable** inside `counter`, which does not exist yet:

```python run error
def make_counter():
    count = 0
    def counter():
        count += 1              # Python decides that count is local to counter
        return count
    return counter

counter = make_counter()
counter()
```

The rule is the same one that you met with `global` in module 7: **assigning** to a name inside a function makes it local, unless you say otherwise. The word `nonlocal` says "this name lives in the enclosing function". Use `global` for a name at the top of the file, and `nonlocal` for a name in a function around you.

%% warn Changing is not the same as assigning
`nonlocal` is only needed when you **assign** a new value (`count += 1` or `count = 0`). Changing an object that the closure remembers needs nothing special. If the remembered variable is a list, the call `items.append(5)` works without `nonlocal`, because it modifies the same list and never assigns to the name `items`.
%% end

%% question q-counter-predict | predict
What does this program print?

```python
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

a = make_counter()
b = make_counter()
print(a(), a(), b(), a())
```
%% answer
1 2 1 3
%% explain
The counters `a` and `b` are two separate closures, and each one has its own `count`. The calls give 1 and 2 for `a`, then 1 for the fresh counter `b`, and then 3 for `a` again.
%% end

%% question q-nonlocal-choice | choice
This function raises an `UnboundLocalError` when you call `add(5)`. What is the best fix?

```python
def make_total():
    total = 0
    def add(amount):
        total += amount
        return total
    return add
```
%% choice correct
Write `nonlocal total` as the first line inside `add`
%% choice
Write `global total` as the first line inside `add`
%% choice
Move the line `total = 0` inside `add`
%% choice
Rename the variable `total` to `Total`
%% explain
The statement `total += amount` assigns to `total`, so Python treats it as a local variable of `add`, and reading it before it has a value fails. The line `nonlocal total` tells Python that the variable belongs to `make_total`. With `global` Python would look for a variable at the top of the file, and moving the line into `add` would reset the total at every call.
%% end

## Function factories

A function that builds and returns other functions is called a **function factory**. Each function that it makes is customised by the arguments of the factory. They are a neat way to create small, specific tools:

```python run
def make_checker(low, high):
    def check(value):
        return low <= value <= high
    return check

is_teen = make_checker(13, 19)
is_percent = make_checker(0, 100)

ages = [8, 13, 15, 19, 20, 41]
print(list(filter(is_teen, ages)))      # a factory-made function used with filter
print(is_percent(101))
```

Another good use is building the `key` function for `sorted`. The factory `by` makes a function that picks one field of a record:

```python run
def by(field):
    def key(record):
        return record[field]
    return key

people = [
    {"name": "Ada", "age": 36},
    {"name": "Ben", "age": 28},
    {"name": "Cy", "age": 41},
]
print([p["name"] for p in sorted(people, key=by("age"))])
print([p["name"] for p in sorted(people, key=by("name"), reverse=True)])
```

## Closure or class?

A closure that keeps a count does the same job as a small class. A class can also be made **callable**, so that its objects are used like functions. All it needs is a method called `__call__`:

```python run
class Counter:
    def __init__(self):
        self.count = 0

    def __call__(self):
        self.count += 1
        return self.count

tally = Counter()
print(tally(), tally(), tally.count)    # tally() runs __call__
print(callable(tally), callable(Counter), callable(5))
```

Which one should you choose? A closure is short and keeps its memory out of sight, so it suits **one behaviour with a little private state**. A class is better when you need several behaviours, attributes that other code can read (like `tally.count`), or inheritance. You will meet `__call__` again in the next lesson, where it lets a class act as a decorator.

## The late-binding trap

Remember that a closure remembers the **variable**, and not the value that it had at the time. This catches almost everybody once. Look at a loop that builds three buttons, each meant to return its own number:

```python run
buttons = []
for number in range(3):
    buttons.append(lambda: number)      # every lambda uses the same variable number

print([button() for button in buttons])
```

You expect `[0, 1, 2]`, but you get `[2, 2, 2]`. All three lambdas look at the **same** variable `number`, and they look at it **later**, when they are called. By then the loop has finished, and `number` is 2. This is called **late binding**: the name is looked up when the function runs, not when it is created. There are three standard cures. Each one gives every function **its own copy** of the value:

```python run
from functools import partial

# Cure 1: a default argument is worked out NOW, when the lambda is created
buttons = [lambda number=number: number for number in range(3)]
print([button() for button in buttons])

# Cure 2: a factory function gives each closure its own variable
def make_button(number):
    return lambda: number

buttons = [make_button(number) for number in range(3)]
print([button() for button in buttons])

# Cure 3: partial pre-fills the argument (more on partial next)
def show(number):
    return number

buttons = [partial(show, number) for number in range(3)]
print([button() for button in buttons])
```

%% question q-late-predict | predict
What does this program print?

```python
funcs = []
for i in range(3):
    funcs.append(lambda: i * 10)

print([f() for f in funcs])
```
%% answer
[20, 20, 20]
%% explain
All three lambdas share the one variable `i`, and they read it after the loop has ended, when `i` is 2. So each call gives `2 * 10`, which is 20. This is the late-binding trap.
%% end

## functools.partial

The third cure used `partial`, which deserves its own introduction. The function `functools.partial(func, ...)` takes a function and some of its arguments, and returns a **new function** with those arguments already filled in. It is a ready-made, tiny function factory:

```python run
from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)      # exponent is fixed
cube = partial(power, exponent=3)
print(square(7), cube(2))
print(square.func.__name__, square.keywords)

two_to = partial(power, 2)               # a positional argument is fixed: base = 2
print(two_to(10))

print(list(map(partial(power, exponent=2), [1, 2, 3])))
```

The result remembers the original function (`square.func`) and the arguments that you fixed (`square.keywords`). Compared with writing a closure by hand, `partial` is shorter when you only need to fix some arguments. Use a closure when the new function needs its own logic.

%% question q-partial-fill | fill
Fill in the blank so that `cube(2)` gives 8.

```python
from functools import partial

def power(base, exponent):
    return base ** exponent

cube = ___(power, exponent=3)
print(cube(2))
```
%% answer
partial
%% expected
8
%% explain
The call `partial(power, exponent=3)` makes a new function in which `exponent` is always 3. Calling it with 2 runs `power(2, exponent=3)`, which is 8.
%% end

## Callbacks

A **callback** is a function that you hand to another function, so that it can be called **later**, when something happens. The code that makes the call does not need to know what the callback does:

```python run
def download(names, on_done, on_error):
    for name in names:
        if name.endswith(".txt"):
            on_done(name)           # the callbacks decide what happens next
        else:
            on_error(name)

def show_done(name):
    print("downloaded", name)

errors = []
download(["a.txt", "b.png", "c.txt"], on_done=show_done, on_error=errors.append)
print("errors:", errors)
```

The callback `show_done` is an ordinary function. The callback `errors.append` is a **method** of a list, and it works equally well, because a method is also a value that can be passed around. Programs that react to events, such as buttons, web requests and timers, are built from callbacks. A small **event registry** shows the idea:

```python run
handlers = {}

def register(event, handler):
    handlers.setdefault(event, []).append(handler)

def fire(event, *args):
    for handler in handlers.get(event, []):
        handler(*args)

register("login", lambda user: print("Welcome,", user))
register("login", lambda user: print("Logging", user))
register("logout", lambda user: print("Bye,", user))

fire("login", "Ada")
fire("logout", "Ada")
fire("unknown")                 # nobody is listening: nothing happens
```

## Putting it together: a pipeline builder

Here is a higher-order function that returns a closure. The function `compose` takes any number of functions and returns a **pipeline**: a new function that passes a value through all of them, one after the other. The pipeline remembers the tuple of functions that it was given:

```python run
def compose(*functions):
    def pipeline(value):
        for function in functions:
            value = function(value)
        return value
    return pipeline

def remove_punctuation(text):
    return "".join(ch for ch in text if ch.isalnum() or ch == " ")

clean = compose(str.strip, str.lower, remove_punctuation, str.split)
print(clean("  Hello, World! It's me.  "))

print(compose(len, str)("abcd"), compose()("unchanged"))
```

Read the line that builds `clean` as a recipe: strip the spaces, make it lower case, remove the punctuation, split it into words. Each step is a small function that can be tested alone, and the recipe is plain to read. This style, small functions that are joined by a higher-order function, is the heart of **functional programming**.

## Your turn

%% exercise make-counter | Make a counter
Write a function `make_counter(start=0, step=1)` that returns a function. The returned function gives `start` the first time that it is called, and then adds `step` to the number at each following call. Every counter keeps its own count. The program below must print:

```output
10
15
20
0
1
```
%% starter
def make_counter(start=0, step=1):
    # Return a function that gives start, then start + step, then start + 2 * step, ...
    pass

by_five = make_counter(10, 5)
print(by_five())
print(by_five())
print(by_five())

plain = make_counter()
print(plain())
print(plain())
%% solution
def make_counter(start=0, step=1):
    current = start

    def counter():
        nonlocal current
        result = current
        current += step
        return result

    return counter

by_five = make_counter(10, 5)
print(by_five())
print(by_five())
print(by_five())

plain = make_counter()
print(plain())
print(plain())
%% tests
expect_output("10\n15\n20\n0\n1")
first = make_counter(1)
second = make_counter(100, -10)
expect([first(), first(), first()], [1, 2, 3])
expect([second(), second()], [100, 90])
expect(first(), 4)
check(not uses("Global"), "use a variable of make_counter, not a global one")
%% hint
The counter needs a variable that lives in `make_counter`, outside the inner function, so that it survives between calls.
%% hint
Inside the inner function, write `nonlocal current` before you change `current`. Otherwise Python treats `current` as a new local variable.
%% hint
Return the **old** value and then move on: `result = current`, then `current += step`, then `return result`.
%% end

%% exercise fix-adders | Fix the adders
The program below should build three functions that add 1, 2 and 3 to a number. But all of them add 3, because of the **late-binding trap**. Fix the program, keeping the loop, so that it prints `11 12 13`.

```output
11 12 13
```
%% starter
adders = []
for n in range(1, 4):
    adders.append(lambda x: x + n)

print(adders[0](10), adders[1](10), adders[2](10))
%% solution
adders = []
for n in range(1, 4):
    adders.append(lambda x, n=n: x + n)

print(adders[0](10), adders[1](10), adders[2](10))
%% tests
expect_output("11 12 13")
expect([adder(100) for adder in adders], [101, 102, 103])
check(len(adders) == 3, "there are three adders")
check(uses("For", "ListComp"), "build the adders in a loop or a comprehension")
%% hint
Each lambda looks up `n` **when it is called**, after the loop has finished, so `n` is 3 for all of them.
%% hint
Give every lambda its own copy of `n`. A default parameter, `lambda x, n=n: x + n`, is worked out when the lambda is created.
%% hint
Another cure is a small factory function, `make_adder(n)`, that returns `lambda x: x + n`. Call it inside the loop.
%% end

%% exercise compose | Compose
Write a function `compose(*functions)` that returns a **new function**. The new function passes its argument through every function of `functions`, from left to right, and returns the final result. With no functions at all, it returns its argument unchanged. The program below must print:

```output
HELLO!
6
unchanged
```
%% starter
def compose(*functions):
    # Return a function that applies every function in order, left to right.
    pass

shout = compose(str.strip, str.upper, lambda text: text + "!")
print(shout("  hello "))
print(compose(len, lambda n: n * 2)("abc"))
print(compose()("unchanged"))
%% solution
def compose(*functions):
    def pipeline(value):
        for function in functions:
            value = function(value)
        return value
    return pipeline

shout = compose(str.strip, str.upper, lambda text: text + "!")
print(shout("  hello "))
print(compose(len, lambda n: n * 2)("abc"))
print(compose()("unchanged"))
%% tests
expect_output("HELLO!\n6\nunchanged")
expect(compose(abs, str)(-5), "5")
expect(compose()(7), 7)
expect(compose(len)([1, 2, 3]), 3)
double_then_str = compose(lambda n: n * 2, str)
expect(double_then_str(4), "8")
expect(double_then_str(5), "10")
%% hint
`compose` returns an inner function that takes one value.
%% hint
Inside the inner function, loop over `functions` and replace `value` with `function(value)` each time. Then return `value`.
%% hint
With no functions, the loop does nothing, so the value comes back unchanged without any special case.
%% end

%% exercise tiny-bank | Challenge: A bank without a class
Write a function `make_account(balance=0)` that returns a **dictionary of three functions**, with no class and no global variables:

- `"deposit"(amount)` adds money and returns the new balance,
- `"withdraw"(amount)` takes money out and returns the new balance,
- `"balance"()` returns the current balance.

The rules: an amount must be more than 0, otherwise raise `ValueError("amount must be positive")`. Withdrawing more than the balance raises `ValueError("insufficient funds")` and changes nothing. A starting balance below 0 raises `ValueError("balance cannot be negative")`. Every account keeps its own money. The program below must print:

```output
150
120
Error: insufficient funds
120
```
%% starter
def make_account(balance=0):
    # Return a dictionary with the keys "deposit", "withdraw" and "balance".
    pass

wallet = make_account(100)
print(wallet["deposit"](50))
print(wallet["withdraw"](30))
try:
    wallet["withdraw"](500)
except ValueError as error:
    print("Error:", error)
print(wallet["balance"]())
%% solution
def make_account(balance=0):
    if balance < 0:
        raise ValueError("balance cannot be negative")

    def check_amount(amount):
        if amount <= 0:
            raise ValueError("amount must be positive")

    def deposit(amount):
        nonlocal balance
        check_amount(amount)
        balance += amount
        return balance

    def withdraw(amount):
        nonlocal balance
        check_amount(amount)
        if amount > balance:
            raise ValueError("insufficient funds")
        balance -= amount
        return balance

    def current():
        return balance

    return {"deposit": deposit, "withdraw": withdraw, "balance": current}

wallet = make_account(100)
print(wallet["deposit"](50))
print(wallet["withdraw"](30))
try:
    wallet["withdraw"](500)
except ValueError as error:
    print("Error:", error)
print(wallet["balance"]())
%% tests
expect_output("150\n120\nError: insufficient funds\n120")
one = make_account(10)
two = make_account()
expect(one["deposit"](5), 15)
expect(two["balance"](), 0)
expect(one["balance"](), 15)
expect(one["withdraw"](15), 0)
check(raises(ValueError, one["deposit"], 0), "a deposit of 0 is refused")
check(raises(ValueError, one["withdraw"], -3), "a negative withdrawal is refused")
check(raises(ValueError, make_account, -5), "a negative starting balance is refused")
try:
    two["withdraw"](1)
except ValueError as error:
    check(str(error) == "insufficient funds", "the message is: insufficient funds")
expect(two["balance"](), 0)
try:
    one["deposit"](-1)
except ValueError as error:
    check(str(error) == "amount must be positive", "the message is: amount must be positive")
check(not uses("ClassDef"), "no class: use closures")
check(not uses("Global"), "no global variables: use closures")
%% hint
The parameter `balance` is a local variable of `make_account`, and the three inner functions can share it. Define `deposit`, `withdraw` and a small function that returns the balance, and then return them in a dictionary.
%% hint
`deposit` and `withdraw` change `balance`, so each of them needs `nonlocal balance`. A shared helper that raises the error for a bad amount keeps both of them short.
%% hint
In `withdraw`, test the amount against the balance **before** you change anything, so that a refused withdrawal leaves the balance as it was.
%% end

## What you learned

- A function is a **value**. `double` is the function, and `double(7)` is a call. You can store functions in variables, lists and dictionaries, pass them to other functions, and return them.
- A **higher-order function** takes a function as an argument or returns one. `sorted(key=...)`, `map` and `filter` are examples, and so is your own `apply_twice`.
- A function defined inside another function can read the outer function's variables. When it is **returned**, it still remembers them. The pair of function and remembered variables is a **closure**, and each call of the outer function makes a new one.
- `nonlocal name` lets an inner function **assign** to a variable of the enclosing function, which gives a closure memory that changes between calls. Changing a mutable object, such as a list, does not need it.
- A **function factory** builds functions that are customised by its arguments, such as `make_checker(13, 19)`. A class with `__call__` makes objects that can be called like functions.
- The **late-binding trap**: closures in a loop all share the loop variable, and read it at call time. Cure it with a default argument (`lambda n=n: ...`), a factory function, or `functools.partial`.
- `functools.partial(func, ...)` fixes some arguments of a function and returns a new function. A **callback** is a function that you pass in, to be called later.
- Higher-order functions and closures are the foundation of **decorators**, which you meet in the next lesson.
