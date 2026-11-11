---
title: Scope and functions as values
---
Two questions come up as soon as a program has several functions. **Where does a variable live**, and which parts of the program can see it? And since a function is a name for some code, **can a function itself be handed around like a number or a string**? This lesson answers both. The first answer keeps your functions from interfering with each other, and the second gives you a powerful way to build flexible programs.

## Local variables

A name that a function creates, including its parameters, is **local** to that function. It is created when the call starts and it disappears when the call ends. The rest of the program cannot see it:

```python run error
def make_total():
    total = 10
    return total

make_total()
print(total)
```

Python reports a **NameError**, because `total` only existed inside the call. Every call starts with a fresh set of local variables, which is why a function does not remember anything between calls:

```python run
def counter_demo():
    count = 0
    count += 1
    return count

print(counter_demo())
print(counter_demo())
```

Both calls print 1. This is a good thing: a function that depends only on its parameters gives the same answer for the same arguments, so you can understand and test it on its own.

## Global variables can be read

A name that you create at the top of the file, outside every function, is **global**. A function may **read** a global name:

```python run
rate = 0.2

def add_tax(price):
    return price * (1 + rate)

print(add_tax(100))
rate = 0.5
print(add_tax(100))
```

The function looks up `rate` when it **runs**, so changing the global changes the answer of the same call. That is a hidden input, and it makes bugs hard to find. Passing `rate` as a parameter, as you did in the receipt of the first lesson, keeps all the inputs visible.

## Assigning makes a name local

Reading a global is allowed, but **assigning** is different. As soon as a function assigns to a name, with `=`, `+=` or any other form, that name is local for the **whole** function:

```python run
name = "global"

def show():
    name = "local"
    print("inside:", name)

show()
print("outside:", name)
```

The function created its own local `name`, and the global one stayed untouched. The next program shows the trap that catches most beginners:

```python run error
count = 0

def increase():
    count = count + 1

increase()
```

Python reports an **UnboundLocalError**. Because the function assigns to `count`, Python treats `count` as local everywhere inside it. The right-hand side then reads the local `count` before it has any value.

%% key Assigning to a name inside a function makes it local
Reading a global name is fine. When the function assigns to the name, that name is local in the whole function, and the global of the same name is not touched.
%% end

%% question q-scope-predict | predict
What does this program print?

```python
x = 10

def f():
    x = 20
    return x

print(f(), x)
```
%% answer
20 10
%% explain
The assignment inside `f` creates a local `x` with the value 20, and `f` returns it. The global `x` is never changed, so the second value is still 10.
%% end

## Where Python looks: LEGB

When Python meets a name, it searches four places, in this order, and the first match wins:

| Letter | Scope | What lives there |
| --- | --- | --- |
| L | Local | the parameters and variables of the running function |
| E | Enclosing | the variables of a function that contains this one |
| G | Global | the names created at the top of the file |
| B | Built-in | `print`, `len`, `sorted` and the other built-in names |

For now you only need L, G and B. Functions defined inside other functions, the E in the table, come back in a later module.

## The global keyword, and why to avoid it

The word `global` lets a function assign to a global name:

```python run
total = 0

def add(amount):
    global total
    total += amount

add(5)
add(7)
print(total)
```

It works, but it has a price. Any function can now change `total` from anywhere, so to understand the program you have to read all of them, and you cannot test `add` without setting up the global first. The better habit is to pass values **in** and return the result **out**:

```python run
def add(total, amount):
    return total + amount

total = 0
total = add(total, 5)
total = add(total, 7)
print(total)
```

%% warn Prefer parameters and return over global
A function that gets everything through its parameters and gives everything back with `return` is clear to read and straightforward to test and reuse. Use `global` only in small throwaway scripts, and even there, think twice.
%% end

%% question q-unbound-choice | choice
Why does `count = count + 1` fail inside a function when `count` was created at the top of the file?
%% choice correct
The assignment makes `count` local, and the local `count` has no value yet when the right-hand side is read.
%% choice
Global variables can never be read inside a function.
%% choice
`count` is a reserved word.
%% choice
Python does not allow `+` on numbers inside functions.
%% explain
Python decides before it runs the function that `count` is local, because the function assigns to it. Reading that local name before it has a value gives an UnboundLocalError. Passing `count` in as a parameter, and returning the new value, avoids the problem.
%% end

## Shadowing a built-in by accident

Built-in names such as `list`, `sum`, `max`, `min`, `len`, `str` and `input` are looked up last, in the B scope. If you create a variable with one of these names, yours is found first, and the built-in is hidden:

```python run error
list = [1, 2, 3]
print(list("abc"))
```

Python reports **TypeError: 'list' object is not callable**, because `list` now means your list. Choose descriptive names such as `numbers`, `total` or `biggest` instead. If you hide a built-in by accident, delete your name with `del`, and the built-in comes back:

```python run
sum = 100
del sum
print(sum([1, 2, 3]))
```

## Functions are values

In Python a function is an object like any other. A name can refer to it, and you can give it a second name, store it in a list or a dictionary, or pass it to another function:

```python run
def shout(text):
    return text.upper() + "!"

say = shout
print(say("hello"))
print(type(shout))
```

Storing functions in a dictionary gives a **lookup table of actions**. The names of the keys choose which function to run:

```python run
def shout(text):
    return text.upper() + "!"

def whisper(text):
    return text.lower() + "..."

styles = {"shout": shout, "whisper": whisper}
for name, style in styles.items():
    print(name, "->", style("Hello"))
```

You can also pass a function **into** another function, which then calls it:

```python run
def apply_twice(function, value):
    return function(function(value))

def add_one(n):
    return n + 1

def double(n):
    return n * 2

print(apply_twice(add_one, 5))
print(apply_twice(double, 5))
print(apply_twice(abs, -5))
```

You have done this before. In `sorted(words, key=len)` the function `len` is handed to `sorted`, which calls it for every word:

```python run
words = ["pear", "fig", "banana"]
print(sorted(words, key=len))
print(max(words, key=len))
```

%% key Brackets call the function, no brackets pass it
`len` is the function as a value. `len(words)` **calls** it and gives a number. When you hand a function to another function, write its name without brackets.
%% end

%% question q-key-choice | choice
Which line sorts the list `words` by the length of its items?
%% choice
`sorted(words, key=len())`
%% choice correct
`sorted(words, key=len)`
%% choice
`sorted(words, key="len")`
%% choice
`sorted(words, key=len(words))`
%% explain
The `key` option needs the function itself, so you write `len` without brackets. With brackets, Python would call `len` straight away, with the wrong arguments.
%% end

## lambda: a small function without a name

Sometimes a function is so small that a `def` with a name feels heavy. A **lambda** is a function written as one expression:

```python run
double = lambda n: n * 2
print(double(4))
```

The word `lambda` is followed by the parameters, a colon, and **one expression** whose value is returned automatically. Lambdas are mostly used on the spot, as the `key` of `sorted`, `min` or `max`:

```python run
players = [("Ada", 91), ("Grace", 85), ("Linus", 78)]
print(sorted(players, key=lambda player: player[1]))
print(max(players, key=lambda player: player[1]))
print(min(["pear", "fig", "banana"], key=lambda word: len(word)))
```

The lambda in the first line receives one player, a tuple, and returns its score. `sorted` uses these scores to put the players in order. A lambda cannot hold several statements. When the code needs more than one expression, or a name that the reader should understand, write a normal `def`.

%% question q-lambda-fill | fill
Fill in the blank so that the program prints `['fig', 'pear', 'banana']`.

```python
words = ["pear", "fig", "banana"]
print(sorted(words, key=___ w: len(w)))
```
%% answer
lambda
%% expected
['fig', 'pear', 'banana']
%% explain
`lambda w: len(w)` is a tiny function that returns the length of a word. `sorted` uses it to compare the words, so the shortest word comes first.
%% end

## Callbacks

A **callback** is a function that you give to another function, to be called at the right moment. The caller decides **when**, and your function decides **what**:

```python run
def repeat(action, times):
    for number in range(times):
        action(number)

def say_number(n):
    print("Round", n)

repeat(say_number, 3)
repeat(lambda n: print("*" * (n + 1)), 4)
```

The function `repeat` does not know what the action is. It only knows how to call it. The same idea gives you a general filter, where the caller supplies the rule:

```python run
def keep(numbers, rule):
    result = []
    for n in numbers:
        if rule(n):
            result.append(n)
    return result

def is_even(n):
    return n % 2 == 0

print(keep([1, 2, 3, 4, 5, 6], is_even))
print(keep([1, 2, 3, 4, 5, 6], lambda n: n > 3))
```

%% question q-lambda-predict | predict
What does this program print?

```python
f = lambda a, b: a * b + 1
print(f(3, 4))
```
%% answer
13
%% explain
The lambda returns `a * b + 1`. For the arguments 3 and 4 that is 3 * 4 + 1, which is 13.
%% end

## A small project: the calculator

A dictionary of functions replaces a long chain of `elif` statements. Each key is a command, and each value is the function that carries it out:

```python run stdin="add 2 3\nmul 4 5\ndiv 7 2\npow 2 3\nend"
operations = {
    "add": lambda a, b: a + b,
    "sub": lambda a, b: a - b,
    "mul": lambda a, b: a * b,
    "div": lambda a, b: a / b,
}
while True:
    line = input("> ")
    if line == "end":
        break
    name, x, y = line.split()
    if name in operations:
        print(operations[name](int(x), int(y)))
    else:
        print("unknown operation")
```

To add a new operation you add one entry to the dictionary, and the loop does not change. The expression `operations[name]` finds the function, and the brackets after it call it.

## Your turn

%% exercise fix-total | Fix the total
The program below fails with an UnboundLocalError. Fix it **without** the `global` keyword. Change `add_to_total` so that it takes the current total and an amount, and returns the new total, and change the calls to match. The program must print:

```output
12
```
%% starter
total = 0

def add_to_total(amount):
    total = total + amount

add_to_total(5)
add_to_total(7)
print(total)

%% solution
total = 0

def add_to_total(current, amount):
    return current + amount

total = add_to_total(total, 5)
total = add_to_total(total, 7)
print(total)
%% tests
expect_output("12")
check(not uses("Global"), "does not use the global keyword")
expect(add_to_total(10, 5), 15, "add_to_total(10, 5)")
expect(add_to_total(0, 0), 0, "add_to_total(0, 0)")
%% hint
The function needs to **receive** the current total, so it needs a second parameter.
%% hint
Make the body `return current + amount`, and no longer assign to a name that exists outside.
%% hint
Store each result: `total = add_to_total(total, 5)`.
%% end

%% exercise apply-to-all | Apply to all
Define a function `apply_to_all(function, items)` that returns a **new list** with the result of calling `function` on every item. Read a line of words and print the list of their lengths, using `apply_to_all(len, words)`. For the input `apple fig banana` the program prints:

```output
[5, 3, 6]
```
%% stdin
apple fig banana
%% starter
# Define apply_to_all(function, items) first.

%% solution
def apply_to_all(function, items):
    results = []
    for item in items:
        results.append(function(item))
    return results

words = input().split()
print(apply_to_all(len, words))
%% tests
expect_output("[5, 3, 6]")
check(defines("apply_to_all"), "defines a function called apply_to_all")
expect(apply_to_all(len, ["a", "bb"]), [1, 2], "apply_to_all(len, ['a', 'bb'])")
expect(apply_to_all(abs, [-1, 2, -3]), [1, 2, 3], "apply_to_all(abs, [-1, 2, -3])")
expect(apply_to_all(abs, []), [], "an empty list")
check(rerun("a bb ccc").strip() == "[1, 2, 3]", "another input")
%% hint
Start with an empty list, and loop over `items`.
%% hint
Inside the loop, `function(item)` calls the function that was passed in.
%% hint
Append each result to the new list, and return the list after the loop.
%% end

%% exercise sort-by-score | Sort by score
Read lines of the form `name score` until a line says `end`. Print the players from the lowest score to the highest, one per line, in the form `Grace: 85`. Players with the same score keep the order in which they were typed. Use `sorted` with a **lambda** as the key. For the input `Ada 91`, `Grace 85`, `Linus 91` and `end` the program prints:

```output
Grace: 85
Ada: 91
Linus: 91
```
%% stdin
Ada 91
Grace 85
Linus 91
end
%% starter
# Store each player as a pair, then sort the pairs.

%% solution
players = []
while True:
    line = input()
    if line == "end":
        break
    name, score = line.split()
    players.append((name, int(score)))
for name, score in sorted(players, key=lambda player: player[1]):
    print(f"{name}: {score}")
%% tests
expect_output("Grace: 85\nAda: 91\nLinus: 91")
check(uses("Lambda"), "uses a lambda as the key")
check(rerun("A 3\nB 1\nC 2\nend").strip() == "B: 1\nC: 2\nA: 3", "three players")
check(rerun("X 5\nY 5\nend").strip() == "X: 5\nY: 5", "equal scores keep their order")
%% hint
Keep each player as a tuple `(name, score)`, with the score as a number.
%% hint
The key function receives one tuple, so `lambda player: player[1]` returns its score.
%% hint
Loop over `sorted(players, key=...)` and print each pair with an f-string.
%% end

%% exercise text-commands | Challenge: Text commands
Read lines until a line says `end`. Each line is a command followed by some text, for example `upper hello world`. The commands are `upper`, `lower`, `reverse` (the text backwards) and `length` (the number of characters). Print the result of each command. An unknown command prints `unknown command`. Keep the commands in a **dictionary of functions**. For the input below the program prints:

```output
HELLO WORLD
cba
6
unknown command
```
%% stdin
upper hello world
reverse abc
length python
dance now
end
%% starter
# A dictionary from command name to a function that takes the text.

%% solution
commands = {
    "upper": lambda text: text.upper(),
    "lower": lambda text: text.lower(),
    "reverse": lambda text: text[::-1],
    "length": lambda text: len(text),
}
while True:
    line = input()
    if line == "end":
        break
    parts = line.split()
    command = parts[0]
    text = " ".join(parts[1:])
    if command in commands:
        print(commands[command](text))
    else:
        print("unknown command")
%% tests
expect_output("HELLO WORLD\ncba\n6\nunknown command")
check(rerun("lower HeLLo\nend").strip() == "hello", "lower")
check(rerun("length a b\nend").strip() == "3", "length counts spaces in the text")
check(rerun("reverse ab cd\nend").strip() == "dc ba", "reverse keeps the whole text")
check(uses("Dict"), "keeps the commands in a dictionary")
%% hint
Split the line into words. The first word is the command, and `" ".join(parts[1:])` is the rest of the text.
%% hint
Build `commands = {"upper": ..., "lower": ..., ...}` where every value is a function of one argument. Lambdas are a good fit.
%% hint
`commands[command](text)` finds the function and calls it. Test `command in commands` first, for unknown commands.
%% end

## What you learned

- Names created in a function, including its parameters, are local. They vanish when the call ends, and each call starts fresh.
- A function may read a global name. Assigning to a name makes it local for the whole function, which causes an UnboundLocalError when the name was meant to be global.
- Python searches Local, Enclosing, Global and Built-in scopes, in that order (LEGB). Do not name your variables after built-ins such as `list` or `sum`.
- `global` lets a function assign to a global name, but passing values in and returning the result is clearer and easier to test.
- Functions are values. You can store them in variables, lists and dictionaries, and pass them to other functions. `f` is the function, and `f()` calls it.
- `lambda parameters: expression` is a small unnamed function, mostly used as a `key` for `sorted`, `min` and `max`. A callback is a function that you hand to another function to call later.
