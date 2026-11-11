---
title: Parameters in depth
---
In the last lesson every parameter had to be filled, in the right order, by every call. Real functions are more flexible. Some values have a sensible default, some calls name their arguments, and some functions accept any number of arguments. You have met all of these already: `print("a", "b", sep="-")` passes a **keyword argument**, and `print("a", "b", "c")` takes as many arguments as you give it. In this lesson you learn to build functions with the same flexibility.

## Positional and keyword arguments

A **positional** argument is matched to a parameter by its place. A **keyword** argument names the parameter that it is meant for, so the order no longer matters:

```python run
def describe(name, age, city):
    return f"{name} is {age} and lives in {city}"

print(describe("Ada", 36, "London"))
print(describe(city="Lagos", name="Grace", age=45))
print(describe("Linus", city="Helsinki", age=28))
```

The third call mixes the two styles. The rule is that positional arguments come **first**, then the keyword arguments. Giving one parameter two values is an error:

```python run error
def describe(name, age, city):
    return f"{name} is {age} and lives in {city}"

print(describe("Ada", name="Grace", age=1, city="Paris"))
```

Python reports **TypeError: describe() got multiple values for argument 'name'**, because `"Ada"` already filled `name`.

%% tip Keywords make calls readable
A call such as `resize(800, 600, True)` does not say what `True` means. The call `resize(800, 600, keep_ratio=True)` does, and it still works if someone later changes the order of the parameters.
%% end

## Default values

Give a parameter a **default value** in the definition, and callers may leave it out:

```python run
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Ada"))
print(greet("Ada", "Welcome"))
print(greet("Ada", greeting="Good morning"))
```

All three calls work. When the caller gives no greeting, the default `"Hello"` is used. Parameters that have a default must come **after** the ones that do not, otherwise Python cannot tell which argument belongs where:

```python run error
def greet(greeting="Hello", name):
    return f"{greeting}, {name}!"
```

Python reports a **SyntaxError**, because the program is rejected before anything runs.

%% question q-default-predict | predict
What does this program print?

```python
def power(base, exponent=2):
    return base ** exponent

print(power(5), power(2, 3))
```
%% answer
25 8
%% explain
`power(5)` uses the default exponent 2, so it gives 25. `power(2, 3)` passes the exponent 3, so it gives 8. `print` shows the two results with a space between them.
%% end

## The mutable default trap

There is one famous trap with defaults. Python creates the default value **once**, when the `def` line runs, and every call that leaves the parameter out shares that one object. For numbers and text this is harmless, because they cannot change. For a list, it is a bug:

```python run
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item("apple"))
print(add_item("pear"))
print(add_item("plum"))
```

You might expect three lists with one item each, but the same list grows with every call. The fix is to use `None` as the default and to make a fresh list inside the function:

```python run
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add_item("apple"))
print(add_item("pear"))
print(add_item("plum", ["fig"]))
```

%% key Never use a list, dictionary or set as a default value
Write `items=None`, and create the new container inside the function with `if items is None:`. The same rule applies to every container that can change.
%% end

%% question q-trap-predict | predict
What does this program print?

```python
def add(item, items=[]):
    items.append(item)
    return items

add(1)
print(add(2))
```
%% answer
[1, 2]
%% explain
The default list is created once, so both calls work on the same list. After `add(1)` it holds `[1]`, and `add(2)` appends to that same list, which gives `[1, 2]`.
%% end

## Any number of arguments with *args

A parameter that starts with a star collects **all the extra positional arguments** into a tuple:

```python run
def total(*numbers):
    print(numbers, type(numbers))
    return sum(numbers)

print(total(1, 2, 3))
print(total(10))
print(total())
```

The name `numbers` is your choice, and `args` is the common one. Inside the function it is an ordinary tuple, so you can loop over it, use `len` and `sum`, or index it. Normal parameters can come before it:

```python run
def log(level, *messages):
    for message in messages:
        print(f"[{level}] {message}")

log("INFO", "started", "loaded 3 files")
log("WARN", "disk is almost full")
```

%% question q-args-choice | choice
Inside the function `def total(*numbers)`, what is `numbers`?
%% choice
A list
%% choice correct
A tuple
%% choice
A dictionary
%% choice
A set
%% explain
The star collects the extra positional arguments into a **tuple**. Extra keyword arguments, which come with two stars, are collected into a dictionary.
%% end

## Any keywords with **kwargs

Two stars collect the extra **keyword** arguments into a dictionary. The keys are the argument names, as text:

```python run
def profile(name, **details):
    print("Profile of", name)
    for key, value in details.items():
        print(" ", key, "=", value)

profile("Ada", age=36, city="London", language="Python")
profile("Grace")
```

Use `*args` and `**kwargs` when a function really has to accept an open-ended list of inputs, for example `print` itself. For everything else, named parameters are clearer, because the definition then documents what the function expects.

## Keyword-only parameters

A parameter that comes after `*args`, or after a lone `*`, can only be given by keyword. This forces the caller to write the name, which suits options:

```python run
def join_words(words, *, separator=" "):
    return separator.join(words)

print(join_words(["to", "be", "or"]))
print(join_words(["to", "be", "or"], separator="-"))
```

The call `join_words(["a"], "-")` would fail with a TypeError, because the separator cannot be given by position.

## The full order of parameters

When a definition uses all the kinds of parameter, they come in this order: ordinary parameters, then `*args`, then keyword-only parameters, then `**kwargs`. Here is a function with one of each, and two calls:

```python run
def show(a, b=2, *args, key="k", **kwargs):
    print(a, b, args, key, kwargs)

show(1)
show(1, 5, 6, 7, key="x", extra=True)
```

In the second call, `1` and `5` fill `a` and `b`, the extra `6` and `7` go into `args`, `key="x"` fills the keyword-only parameter, and `extra=True` is collected by `kwargs`.

%% question q-kwonly-multi | multi
The function is defined as `def f(a, b=1, *, c):`. Select every call that works.
%% choice correct
`f(1, c=3)`
%% choice correct
`f(1, 2, c=3)`
%% choice
`f(1, 2, 3)`
%% choice correct
`f(c=3, a=1)`
%% choice
`f(1)`
%% explain
The parameter `c` comes after the lone star, so it must be given by keyword and it has no default. `f(1, 2, 3)` tries to give it by position, and `f(1)` leaves it out. In the other calls `c` is named, and `a` is given.
%% end

## Unpacking at the call

The stars also work in the **call**. A star in front of a list or tuple spreads its items into separate positional arguments, and two stars in front of a dictionary spread its pairs into keyword arguments:

```python run
def power(base, exponent):
    return base ** exponent

pair = [2, 10]
print(power(*pair))

settings = {"base": 3, "exponent": 4}
print(power(**settings))

options = {"sep": " | ", "end": "!\n"}
print("a", "b", "c", **options)
```

This is handy when the arguments are already in a list, for example after splitting a line of input.

%% question q-unpack-fill | fill
Fill in the blank so that the program prints `7`.

```python
def add(a, b):
    return a + b

pair = [3, 4]
print(add(___pair))
```
%% answer
*
%% expected
7
%% explain
A single star in the call spreads the list into two separate arguments, so `add(*pair)` means `add(3, 4)`. Without the star, the whole list would be one argument and `b` would be missing.
%% end

## Returning several values

A function can return only one object, but that object can be a **tuple**, which holds as many values as you like. Write them with commas after `return`, and unpack them with several names on the left of the call:

```python run
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([4, 9, 2, 7])
print(low, high)

result = min_max([4, 9, 2, 7])
print(result, type(result))
```

The second part shows that `result` is one tuple. You can keep it whole, or unpack it at once into names. Another everyday example splits a full name:

```python run
def split_name(full_name):
    first, last = full_name.split()
    return first, last

first, last = split_name("Ada Lovelace")
print(last + ", " + first)
```

## A small project: statistics

Put the pieces together. The function `stats` accepts any number of values, and it returns five results at once. The main part reads a line of numbers, and the star spreads the list into the call:

```python run stdin="4 8 15 16 23 42"
def stats(*numbers):
    count = len(numbers)
    total = sum(numbers)
    average = total / count
    return count, total, average, min(numbers), max(numbers)

values = []
for text in input("Numbers: ").split():
    values.append(int(text))
count, total, average, smallest, largest = stats(*values)
print("Count:", count)
print("Total:", total)
print(f"Average: {average:.2f}")
print("Smallest:", smallest, "Largest:", largest)
```

Try an empty line of input. The function divides by zero when no numbers arrive. In the exercises you will make a function handle that case.

## Your turn

%% exercise greet-default | Greeting with a default
Define a function `greet(name, greeting="Hello")` that **returns** the text `<greeting>, <name>!`. Read a name and print its greeting, using the default greeting. For the input `Ada` the program prints:

```output
Hello, Ada!
```
%% stdin
Ada
%% starter
# Define greet with a default value for greeting.

%% solution
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet(input()))
%% tests
expect_output("Hello, Ada!")
check(defines("greet"), "defines a function called greet")
expect(greet("Grace"), "Hello, Grace!", "greet(\"Grace\")")
expect(greet("Grace", "Welcome"), "Welcome, Grace!", "greet(\"Grace\", \"Welcome\")")
expect(greet("Zed", greeting="Hi"), "Hi, Zed!", "greet(\"Zed\", greeting=\"Hi\")")
%% hint
The second parameter needs a default value in the definition: `greeting="Hello"`.
%% hint
Build the text with an f-string and return it: `return f"{greeting}, {name}!"`.
%% hint
The main part is one line: print the result of `greet(...)` for the name that `input()` returns.
%% end

%% exercise average-args | Average of any numbers
Define a function `average(*numbers)` that returns the average of all its arguments, or `0` when it gets no arguments. Read a line of numbers separated by spaces, turn them into integers, and print `average(*values)`. For the input `2 4 6` the program prints:

```output
4.0
```
%% stdin
2 4 6
%% starter
# Define average(*numbers) first.

%% solution
def average(*numbers):
    if len(numbers) == 0:
        return 0
    return sum(numbers) / len(numbers)

values = []
for text in input().split():
    values.append(int(text))
print(average(*values))
%% tests
expect_output("4.0")
check(defines("average"), "defines a function called average")
expect(average(2, 4, 6), 4, "average(2, 4, 6)")
expect(average(5), 5, "average(5)")
expect(average(), 0, "average() with no arguments")
expect(average(1, 2), 1.5, "average(1, 2)")
check(rerun("1 2").strip() == "1.5", "another input")
%% hint
`*numbers` collects the arguments into a tuple, so `len` and `sum` work on it.
%% hint
Return `0` first when `len(numbers) == 0`, before you divide.
%% hint
In the main part, call the function with a star: `average(*values)`.
%% end

%% exercise min-max | Smallest and largest
Define a function `min_max(numbers)` that returns the smallest and the largest number of a list as two values. Read a line of integers separated by spaces, unpack the two values, and print them. For the input `5 3 9 1` the program prints:

```output
Smallest: 1
Largest: 9
```
%% stdin
5 3 9 1
%% starter
# Define min_max(numbers) first.

%% solution
def min_max(numbers):
    return min(numbers), max(numbers)

values = []
for text in input().split():
    values.append(int(text))
low, high = min_max(values)
print("Smallest:", low)
print("Largest:", high)
%% tests
expect_output("Smallest: 1\nLargest: 9")
check(defines("min_max"), "defines a function called min_max")
expect(min_max([3, 1, 2]), (1, 3), "min_max([3, 1, 2])")
expect(min_max([5]), (5, 5), "min_max([5])")
expect(min_max([-4, -9, 0]), (-9, 0), "min_max([-4, -9, 0])")
check(rerun("7 7").strip() == "Smallest: 7\nLargest: 7", "two equal numbers")
%% hint
A function can return two values by separating them with a comma: `return a, b`.
%% hint
The built-in functions `min` and `max` do the searching.
%% hint
Unpack the result in the main part: `low, high = min_max(values)`.
%% end

%% exercise add-unique | Challenge: Add without repeats
Define a function `add_unique(item, items=None)`. It adds `item` to the list `items` only when the item is not in the list yet, and it returns the list. When no list is given, it starts a new, empty one. Two calls that give no list must never share a list. The calls at the end of the starter are written for you, and the program must print:

```output
['a'] ['b'] ['a', 'b']
```
%% starter
# Define add_unique(item, items=None) here.

first = add_unique("a")
second = add_unique("b")
both = add_unique("a", ["a", "b"])
print(first, second, both)

%% solution
def add_unique(item, items=None):
    if items is None:
        items = []
    if item not in items:
        items.append(item)
    return items

first = add_unique("a")
second = add_unique("b")
both = add_unique("a", ["a", "b"])
print(first, second, both)
%% tests
expect_output("['a'] ['b'] ['a', 'b']")
check(defines("add_unique"), "defines a function called add_unique")
expect(add_unique("c", ["a"]), ["a", "c"], "a new item is added")
expect(add_unique("x"), ["x"], "a call without a list starts a new list")
expect(add_unique("x"), ["x"], "the next call without a list starts again")
%% hint
Use `None` as the default value, and not `[]`.
%% hint
Inside the function, start with `if items is None:` and create `items = []`.
%% hint
Add the item only when `item not in items`, and return `items` at the end.
%% end

## What you learned

- Arguments are matched by position, or by name with keywords. Positional arguments come first, and a parameter cannot receive two values.
- A default value, `def f(x, y=0)`, makes an argument optional. Parameters with defaults come after the others.
- Never use a list, dictionary or set as a default value. Use `None`, and create the container inside the function.
- `*args` collects extra positional arguments into a tuple, and `**kwargs` collects extra keyword arguments into a dictionary. Parameters after `*` are keyword-only.
- The parameters come in this order: ordinary, `*args`, keyword-only, `**kwargs`.
- At the call, `f(*items)` spreads a list or tuple into positional arguments, and `f(**options)` spreads a dictionary into keyword arguments.
- To return several values, write `return a, b`, which builds a tuple, and unpack it with `x, y = f(...)`.
