---
title: Debugging
---
Every programmer writes bugs, beginners and experts alike. What separates them is how they **find** a bug. An expert does not stare at the code and hope. An expert follows a method, one calm step after another. This lesson teaches that method, the tools that go with it, and a field guide to the bugs that you will meet most often.

There are two kinds of bug. A **crash** stops the program and gives you a traceback, which names the line (you learned to read one in lesson 1). A **silent bug** runs to the end and gives a wrong answer, with no message at all. Silent bugs are harder, because you must first notice that something is wrong, and then discover where.

## A method, not a guess

Guessing and changing things at random feels busy, but it often adds new bugs. Use these four steps instead:

1. **Reproduce.** Find an input that makes the bug happen every time, and make it as small as you can. A bug that you cannot repeat cannot be fixed.
2. **Isolate.** Narrow down where the problem lives. Which function? Which loop? Which line?
3. **Hypothesise.** Form one clear guess about the cause: "I think `count` also goes up for negative numbers."
4. **Test.** Check the guess by printing a value or by changing **one** thing. If the guess was wrong, you have still learnt something, so form a new one.

Here is a function that should return the average of the **positive** numbers in a list. Two of its answers are right and one is wrong:

```python run
def average_positive(numbers):
    total = 0
    count = 0
    for n in numbers:
        if n > 0:
            total += n
        count += 1
    return total / count

print(average_positive([2, 4, 6]))
print(average_positive([2, -4, 6]))
print(average_positive([-4, 2]))
```

The second answer should be `4.0`, but it is `2.6666666666666665`. Follow the method.

**Reproduce:** the smallest failing input is `[-4, 2]`. It should give `2.0`, and it gives `1.0`.

**Isolate and test:** the function has only a few variables, so print them in the loop. Give the debugging prints a label, such as `DEBUG`, so that you can find them again and delete them later:

```python run
def average_positive(numbers):
    total = 0
    count = 0
    for n in numbers:
        if n > 0:
            total += n
        count += 1
        print("DEBUG n =", n, "total =", total, "count =", count)
    return total / count

print(average_positive([-4, 2]))
```

**Hypothesise:** `total` is correct (it is 2), but `count` is 2, and it should be 1. The negative number was counted. The line `count += 1` is **outside** the `if`, so every number is counted, not only the positive ones.

**Test the fix:** indent the line so that it belongs to the `if`, and run all three cases again. Run the cases that worked before as well, because a fix can break something that was fine. Also think about the list with no positive numbers, where the division would fail:

```python run
def average_positive(numbers):
    total = 0
    count = 0
    for n in numbers:
        if n > 0:
            total += n
            count += 1
    if count == 0:
        return 0
    return total / count

print(average_positive([2, 4, 6]))
print(average_positive([2, -4, 6]))
print(average_positive([-4, 2]))
print(average_positive([-1, -2]))
```

%% question q-method-choice | choice
A friend says: "your program sometimes gives a wrong total". What should you do first?
%% choice
Rewrite the program from the beginning
%% choice
Change lines until the total looks right
%% choice correct
Find an input that makes the wrong total appear every time
%% choice
Add `except:` around everything
%% explain
You can only fix a bug that you can repeat. A small input that fails every time lets you isolate the cause and check your fix. Rewriting, random changes and a bare `except:` hide the problem or add new ones.
%% end

## Print debugging

The simplest tool is the one that you used above: put `print` lines in the program to see what is happening. A few habits make it work well:

- **Label every print**, so that you know which line produced it: `print("before loop:", total)`, not `print(total)`.
- **Print values together with their types** when something looks right but behaves wrongly: `print(value, type(value))`. A `5` and a `"5"` look the same in many outputs.
- **Print at the boundaries** of the suspicious part: what goes in, what comes out.
- **Remove the prints** when you have finished. Or use `logging`, which is described below, so that you can switch them off without deleting them.

You can also let the lesson's **Step through this code** blocks do the work. They show each line as it runs, with the variables beside it. This is what a debugger does. Watch the total in this program, which should add up the cost of three items:

```python trace title="Why is the total wrong?"
lines = ["tea,2.5,3", "bread,4,1", "milk,1.2,2"]
total = 0
for line in lines:
    name, price, qty = line.split(",")
    cost = float(price) * int(qty)
    total = cost
print("Total:", total)
```

The variable `total` is **replaced** by each cost instead of being increased, so only the last cost is left. The fix is `total += cost`.

## Narrowing it down

When a program has several stages, check the result of **each stage** on its own, from the start. The first stage that gives a wrong result is where the bug is. This is called bisecting, because you keep cutting the search area in half. Here the program should count the colour `green`, and it finds none:

```python run
def clean(text):
    return text.strip().lower()

def split_words(text):
    return text.split(",")

text = "  Red, green,Blue  "
words = split_words(clean(text))
print(words.count("green"))
```

Print the result of each stage to see where it first goes wrong:

```python run
def clean(text):
    return text.strip().lower()

def split_words(text):
    return text.split(",")

text = "  Red, green,Blue  "
step1 = clean(text)
print(step1)
step2 = split_words(step1)
print(step2)
```

The first stage is fine. In the second stage the item `' green'` has a space in front of it, so it is not equal to `'green'`. The bug is in `split_words`, which must strip each word. Here is the repair:

```python run
def clean(text):
    return text.strip().lower()

def split_words(text):
    words = []
    for part in text.split(","):
        words.append(part.strip())
    return words

text = "  Red, green,Blue  "
print(split_words(clean(text)).count("green"))
```

Two more tricks work in the same spirit. **Comment out** a part of the program (put `#` in front of its lines) to find out whether the bug is still there without it. And try **rubber-duck debugging**: explain the code, line by line and aloud, to a rubber duck, a friend or an empty chair. Saying what each line really does, and not what you meant it to do, often shows the mistake before you finish the sentence.

## A field guide to common bugs

Most bugs belong to a small number of families. Learn to recognise them, and you will find many of your own bugs in minutes.

### Off by one

Loops and slices count from 0, and `range` and slices **stop before** their end value. A wrong start or stop skips the first or last item:

```python run
items = ["a", "b", "c", "d"]
for i in range(1, len(items)):
    print(i, items[i])
```

The item `"a"` is missing, because the loop starts at 1. Use `range(len(items))`, or loop over the items directly. The same care applies to `range(1, n)`, which stops at `n - 1`, so a sum of the numbers from 1 to 5 needs `range(1, 6)`.

### = versus ==

A single `=` assigns, and a double `==` compares. In an `if`, mixing them up is reported as a syntax error, which helps:

```python run error
score = 10
if score = 10:
    print("ten")
```

The opposite mistake is silent. Writing a comparison where an assignment belongs is legal Python, and it changes nothing:

```python run
score = 10
score == 20
print(score)
```

### Text versus numbers from input()

The function `input()` always returns **text**. Adding two texts glues them together, and comparing two texts compares them letter by letter, so `"10"` comes before `"9"`:

```python run stdin="10\n9"
a = input()
b = input()
print(a + b)
print(a > b)
```

Convert with `int()` or `float()` straight away: `a = int(input())`. When a result looks like repeated text, such as `'2.52.52.5'` for `"2.5" * 3`, a number was never converted.

### Changing a list while looping over it

When you remove items from a list during a `for` loop over the same list, the loop moves on to the next **position**, and the items shift left. Some items are never looked at:

```python run
numbers = [2, 4, 6, 8, 1]
for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)
```

Three even numbers are still there. The fix is to loop over a **copy** with `numbers[:]`, or to build a new list of the items that you want to keep:

```python run
numbers = [2, 4, 6, 8, 1]
for n in numbers[:]:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)
```

### A mutable default argument

A default value is created **once**, when the function is defined. A list used as a default is therefore shared by every call:

```python run
def add_item(item, basket=[]):
    basket.append(item)
    return basket

print(add_item("tea"))
print(add_item("milk"))
```

The second basket still contains the tea. The usual cure is the default `None`, and a new list inside the function:

```python run
def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(add_item("tea"))
print(add_item("milk"))
```

### Shadowing a built-in name

If you give a variable the name of a built-in function (`sum`, `max`, `list`, `input`, `str`, `len`), your variable **hides** the function from then on:

```python run error
sum = 0
for n in [1, 2, 3]:
    sum += n
print(sum)
print(sum([4, 5, 6]))
```

The first `print` works. The second fails with `TypeError: 'int' object is not callable`, because `sum` is now the number 6. Choose names such as `total`. The same happens when a local variable has the same name as a global one: the inner name hides the outer one inside the function.

### Wrong scope

A name that you assign to inside a function is **local** to that function. If the same function also reads the name before assigning it, Python reports an `UnboundLocalError`:

```python run error
count = 0

def add_one():
    count = count + 1

add_one()
print(count)
```

The better repair is to pass the value in and **return** the result, as lesson 3 of module 7 showed: `count = add_one(count)`.

### Forgetting to return

A function without a `return` gives back `None`. The calculation happens, and the answer is thrown away:

```python run
def double(n):
    result = n * 2

print(double(4))
```

### Comparing floats with ==

Floating-point numbers are stored with a tiny rounding error, so numbers that should be equal sometimes are not. Compare with a small tolerance instead:

```python run
print(0.1 + 0.2 == 0.3)
print(0.1 + 0.2)
print(abs((0.1 + 0.2) - 0.3) < 0.000001)
```

A summary of the symptoms helps when you are searching:

| Symptom | Likely cause |
| --- | --- |
| the first or last item is skipped | off by one in `range` or a slice |
| numbers glue together, or a number prints as repeated text | `input()` text was not converted |
| items remain in a list that should be gone | the list was changed during the loop |
| a function remembers things from earlier calls | a mutable default argument |
| `'int' object is not callable` | a variable has the name of a function |
| `UnboundLocalError` | a name is assigned and read inside a function without a value first |
| the answer prints as `None` | a missing `return` |
| two numbers that should be equal are not | floating-point rounding |

%% question q-eq-predict | predict
What does this program print?

```python
score = 10
score == 20
print(score)
```
%% answer
10
%% explain
The second line is a comparison, and its result (`False`) is thrown away. It does not assign anything, so `score` is still 10. To change the value, write `score = 20`.
%% end

%% question q-list-predict | predict
What does this program print?

```python
numbers = [2, 4, 6, 8, 1]
for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)
```
%% answer
[4, 8, 1]
%% explain
After `2` is removed, the list shifts left, and the loop moves on to the next position, which now holds `6`. So `4` is skipped, and the same happens with `8`. The loop never sees them, and they stay in the list.
%% end

%% question q-default-predict | predict
What does this program print?

```python
def add(item, basket=[]):
    basket.append(item)
    return basket

add("a")
print(add("b"))
```
%% answer
['a', 'b']
%% explain
The default list is created once, when the function is defined, and every call that does not pass a basket uses that same list. The first call put `"a"` in it, so the second call returns both items.
%% end

%% question q-range-fill | fill
Fill in the blank so that the program prints `15`, the sum of the numbers from 1 to 5.

```python
total = 0
for n in range(1, ___):
    total += n
print(total)
```
%% answer
6
%% expected
15
%% explain
`range(1, 6)` produces 1, 2, 3, 4 and 5, because the stop value is not included. With `range(1, 5)` the loop would stop at 4 and the sum would be 10. This kind of mistake is called an off-by-one error.
%% end

%% question q-shadow-choice | choice
After the line `max = 10`, the call `max([3, 7, 2])` fails. Why?
%% choice
The function `max` only works on strings
%% choice correct
The name `max` now refers to the number 10, which cannot be called
%% choice
Lists cannot be given to `max`
%% choice
Python allows only one variable per program to be named `max`
%% explain
Assigning to `max` replaced the built-in function in your program. The number 10 is not callable, so Python reports `TypeError: 'int' object is not callable`. A different variable name avoids the problem.
%% end

## Logging instead of print

Print debugging has one weakness: the prints must be deleted before the program is finished, and you add them again for the next bug. The **logging** module solves that. A log message has a **level** that says how important it is, and the program decides which levels to show:

| Level | Number | Use it for |
| --- | --- | --- |
| `DEBUG` | 10 | details that help you find bugs |
| `INFO` | 20 | normal events ("file loaded") |
| `WARNING` | 30 | something unexpected, but the program goes on |
| `ERROR` | 40 | something failed |
| `CRITICAL` | 50 | the program cannot go on |

```python run
import logging

logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")

def average_positive(numbers):
    total = 0
    count = 0
    for n in numbers:
        logging.debug("n=%s total=%s count=%s", n, total, count)
        if n > 0:
            total += n
            count += 1
    if count == 0:
        logging.warning("no positive numbers in %s", numbers)
        return 0
    return total / count

print(average_positive([2, -4, 6]))
print(average_positive([-1, -2]))
```

%% note Log messages are shown in red here
By default, `logging` writes to the **error stream**, and this site shows that stream in red. It does not mean that something is wrong. Your results, written by `print`, appear in the normal colour.
%% end

The `basicConfig` call sets the lowest level to show, and the format of each line. Without it, only `WARNING` and above are shown. Change `level=logging.DEBUG` to `level=logging.WARNING` and every `debug` line disappears, while the program stays the same. The placeholders `%s` are filled from the extra arguments, and Python fills them in only when the message is really shown.

Inside an `except` block, `logging.exception("message")` records the message **and the traceback**, and the program carries on:

```python run
import logging

logging.basicConfig(format="%(levelname)s: %(message)s")

try:
    int("abc")
except ValueError:
    logging.exception("could not read the number")
print("the program goes on")
```

On a real computer, `basicConfig(filename="app.log")` writes the messages to a file, with the time if you add `%(asctime)s` to the format. That is how programs keep a record of what happened while nobody was watching.

%% question q-logging-multi | multi
Select every true statement about the `logging` module.
%% choice correct
A level such as `DEBUG` or `WARNING` says how important a message is.
%% choice correct
Changing the level in `basicConfig` can hide all debug messages without deleting any code.
%% choice correct
`logging.exception` records the traceback.
%% choice
Log messages must be deleted before the program is finished.
%% explain
Levels, a configurable threshold and tracebacks are the strengths of logging. Unlike temporary prints, log lines can stay in the program, because the level decides whether they are shown.
%% end

## What a debugger is

A **debugger** is a tool that runs your program under your control. It can pause at a **breakpoint**, run **one line at a time**, show the value of every variable, and let you try expressions while the program is paused. It is the print-debugging method with the printing built in.

Python has one called `pdb`. Writing `breakpoint()` in a program pauses it at that line and opens a prompt, where `n` runs the next line, `s` steps into a function, `p total` prints a variable, `c` continues and `q` quits. A session looks like this:

```text
> app.py(6)average_positive()
-> if n > 0:
(Pdb) p total
0
(Pdb) n
> app.py(7)average_positive()
-> total += n
(Pdb) p n
2
```

Editors such as VS Code and PyCharm offer the same tool with buttons, and you click next to a line to set a breakpoint. A debugger needs a terminal or an editor that can talk to it, so it is **not available in a web page like this one**. Here you have prints, `logging` and the step-through blocks, and they are enough for everything in this course. When you move to your own computer, learn the debugger of your editor: it saves a great deal of time.

## A project: the three bugs in the receipt

A shop program reads one item per line, in the form `name,price,quantity`, until the line `done`. It must print each cost and the total. It was typed in a hurry, and it contains three bugs of different families:

```text
total = 0
while True:
    line = input()
    if line = "done":
        break
    name, price, qty = line.split(",")
    cost = price * qty
    total = cost
    print(name, cost)
print(f"Total: {total:.2f}")
```

The method says: fix **one** bug, run again, and read the next message. Python reports the first problem on the `if` line, as a syntax error, so the first repair is `==`. The next run fails with `TypeError: can't multiply sequence by non-int of type 'str'`, because `split` gives text. Converting the values with `float(price)` and `int(qty)` repairs that. The program now runs to the end, but the total shows only the last cost, so it is a silent bug that needs the print and the trace of the earlier example, and the repair `total += cost`. This is the working version:

```python run stdin="tea,2.5,3\nbread,4,1\nmilk,1.2,2\ndone"
total = 0
while True:
    line = input()
    if line == "done":
        break
    name, price, qty = line.split(",")
    cost = float(price) * int(qty)
    total += cost
    print(name, cost)
print(f"Total: {total:.2f}")
```

Notice that the three bugs showed themselves in three different ways: a message before the program started, a message in the middle of the run, and no message at all. To find bugs of every kind, you need all of the tools above.

%% question q-order-copy | order
Put the lines in order so that the program prints `[1]`. One line does not belong.
%% lines
numbers = [2, 4, 6, 1]
for n in numbers[:]:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)
%% distractors
for n in numbers:
%% expected
[1]
%% explain
Looping over the copy `numbers[:]` means that the loop is not disturbed when `remove` changes the original, so every even number is removed. The distractor loops over the list itself, which skips items and would leave `[4, 1]`.
%% end

## Your turn

%% exercise fix-average | Fix the average
The function `average_positive` should return the average of the **positive** numbers only, and `0` when there are none. In the starter code it gives `2.6666666666666665` for `[2, -4, 6]`. Find the bug and fix it, so that the program prints:

```output
4.0
```
%% starter
def average_positive(numbers):
    total = 0
    count = 0
    for n in numbers:
        if n > 0:
            total += n
        count += 1
    return total / count

print(average_positive([2, -4, 6]))

%% solution
def average_positive(numbers):
    total = 0
    count = 0
    for n in numbers:
        if n > 0:
            total += n
            count += 1
    if count == 0:
        return 0
    return total / count

print(average_positive([2, -4, 6]))
%% tests
expect_output("4.0")
expect(average_positive([2, -4, 6]), 4, "[2, -4, 6]")
expect(average_positive([-4, 2]), 2, "[-4, 2]")
expect(average_positive([5]), 5, "[5]")
expect(average_positive([-1, -2]), 0, "no positive numbers")
expect(average_positive([]), 0, "an empty list")
%% hint
Print `n`, `total` and `count` inside the loop and compare them with what you expect for `[-4, 2]`.
%% hint
`count` goes up for every number, and it should go up only for positive numbers. Look at the indentation of `count += 1`.
%% hint
Move `count += 1` into the `if` block. Then handle `count == 0` before the division, and return `0`.
%% end

%% exercise fix-evens | Remove the even numbers
The program reads whole numbers separated by spaces, removes every even number from the list, and prints the list. It has a bug: for the input `2 4 6 8 1 3 5 10` it prints `[4, 8, 1, 3, 5]`. Fix it, so that it prints:

```output
[1, 3, 5]
```
%% stdin
2 4 6 8 1 3 5 10
%% starter
numbers = []
for text in input().split():
    numbers.append(int(text))

for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)

%% solution
numbers = []
for text in input().split():
    numbers.append(int(text))

for n in numbers[:]:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)
%% tests
expect_output("[1, 3, 5]")
check(rerun("2 2 2 2").strip() == "[]", "only even numbers")
check(rerun("1 3").strip() == "[1, 3]", "only odd numbers")
check(rerun("4 6 7 8").strip() == "[7]", "four numbers")
check(rerun("5").strip() == "[5]", "one number")
%% hint
Remove items from a list while looping over the same list, and the loop skips some of them.
%% hint
You can loop over a copy of the list, `numbers[:]`, and remove items from the original.
%% hint
Another way: build a new list called `odd`, and append only the numbers where `n % 2 == 1`. Then print `odd`.
%% end

%% exercise fix-default | The shared basket
The function `add_item` should put an item in a basket and return it. When no basket is given, each call must start with a **new** empty basket. In the starter code the second call returns `['tea', 'milk']`. Fix the function, so that the program prints:

```output
['tea']
['milk']
```
%% starter
def add_item(item, basket=[]):
    basket.append(item)
    return basket

print(add_item("tea"))
print(add_item("milk"))

%% solution
def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(add_item("tea"))
print(add_item("milk"))
%% tests
expect_output("['tea']\n['milk']")
expect(add_item("a"), ["a"], "the first call")
expect(add_item("b"), ["b"], "the second call has its own basket")
expect(add_item("c", ["x"]), ["x", "c"], "a basket that is passed in")
%% hint
The default value `[]` is created once and shared by all the calls.
%% hint
Use `None` as the default value: `def add_item(item, basket=None):`.
%% hint
At the start of the function, write `if basket is None:` and give `basket` a new list inside it.
%% end

%% exercise fix-input | Numbers from the keyboard
The program reads two whole numbers, one per line. It should print their sum, and then `True` when the first number is larger than the second, and `False` otherwise. For the input `10` and `9` it should print:

```output
19
True
```
But the starter code prints `109` and `False`. Fix it.
%% stdin
10
9
%% starter
first = input()
second = input()
print(first + second)
print(first > second)

%% solution
first = int(input())
second = int(input())
print(first + second)
print(first > second)
%% tests
expect_output("19\nTrue")
check(rerun("5\n20").strip() == "25\nFalse", "5 and 20")
check(rerun("100\n99").strip() == "199\nTrue", "100 and 99")
check(rerun("-3\n-4").strip() == "-7\nTrue", "negative numbers")
check(calls("int"), "converts the input with int()")
%% hint
`input()` gives text. Adding two texts glues them together, and comparing two texts compares letter by letter.
%% hint
Convert each value with `int(...)`.
%% hint
Write `first = int(input())` and `second = int(input())`. The two `print` lines can stay as they are.
%% end

%% exercise three-bugs | Challenge: Three bugs in the receipt
The receipt program from the lesson has three bugs. Fix them one at a time, running the program after each repair. For the input `tea,2.5,3`, `bread,4,1`, `milk,1.2,2` and `done` it must print:

```output
tea 7.5
bread 4.0
milk 2.4
Total: 13.90
```
%% stdin
tea,2.5,3
bread,4,1
milk,1.2,2
done
%% starter
total = 0
while True:
    line = input()
    if line = "done":
        break
    name, price, qty = line.split(",")
    cost = price * qty
    total = cost
    print(name, cost)
print(f"Total: {total:.2f}")

%% solution
total = 0
while True:
    line = input()
    if line == "done":
        break
    name, price, qty = line.split(",")
    cost = float(price) * int(qty)
    total += cost
    print(name, cost)
print(f"Total: {total:.2f}")
%% tests
expect_output("tea 7.5\nbread 4.0\nmilk 2.4\nTotal: 13.90")
check(rerun("pen,1.5,2\ncap,2,4\ndone").strip() == "pen 3.0\ncap 8.0\nTotal: 11.00", "two other items")
check(rerun("done").strip() == "Total: 0.00", "no items")
%% hint
Python reports one problem at a time. The first message is about the `if` line: a comparison needs a different operator.
%% hint
After that, Python complains about multiplying text. The values from `split` are strings, so convert the price with `float` and the quantity with `int`.
%% hint
The last bug is silent: the total shows only the last cost. Use `total += cost`, so that each cost is added.
%% end

## What you learned

- Debug with a **method**: reproduce the bug with a small input, isolate where it happens, form one hypothesis, and test it by changing or printing one thing. Run the old cases again after a fix.
- **Print debugging** works best with labelled prints of values and types at the boundaries of the suspicious part. Step-through blocks show what a debugger shows.
- Check each stage of a program on its own (**bisecting**), comment code out to see whether the bug disappears, and explain the code to a rubber duck.
- Common bugs: off-by-one errors, `=` versus `==`, text from `input()` that is not converted, changing a list while looping over it, a mutable default argument, shadowing a built-in name, a wrong scope, a missing `return`, and comparing floats with `==`.
- The `logging` module has levels (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`). `basicConfig(level=...)` chooses what to show, and `logging.exception` records a traceback. Log lines can stay in the program.
- A debugger such as `pdb` or the one in your editor pauses a program and steps through it line by line. It needs a terminal or an editor, so it is not available in the browser.
