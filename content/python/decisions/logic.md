---
title: and, or, not
---
Real questions are rarely single. "Can this person enter the cinema?" depends on their age and on whether they have a ticket. "Is it a day off?" depends on whether it is Saturday or Sunday. "Should the heating be on?" depends on the room not being warm.

Python lets you combine questions with three small words: `and`, `or` and `not`. They are called **logical operators**. In this lesson you learn how each one works, the order in which Python applies them, and a few surprises that catch nearly every beginner.

## and: both must be true

`and` gives `True` only when **both** sides are true:

```python run
print(True and True)
print(True and False)
print(False and False)
```

Here is a real use. A person may ride the roller coaster only if they are tall enough and old enough:

```python run
height = 140
age = 9
if height >= 120 and age >= 8:
    print("You can ride.")
else:
    print("Sorry, not today.")
```

Change `age` to 7 and run it again. One false side is enough to make the whole `and` false.

## or: at least one is true

`or` gives `True` when **at least one** side is true. It is `False` only when both sides are false:

```python run
print(True or False)
print(False or True)
print(False or False)
```

```python run
day = "Sunday"
if day == "Saturday" or day == "Sunday":
    print("Weekend")
else:
    print("Weekday")
```

Notice that each side of `or` is a complete question: `day == "Saturday"` and `day == "Sunday"`. You will see why that matters in a moment.

## not: flip the answer

`not` turns `True` into `False` and `False` into `True`:

```python run
raining = False
print(not raining)
if not raining:
    print("Leave the umbrella at home.")
```

Here is a summary of all three, called a **truth table**:

| `a` | `b` | `a and b` | `a or b` | `not a` |
| --- | --- | --- | --- | --- |
| `True` | `True` | `True` | `True` | `False` |
| `True` | `False` | `False` | `True` | `False` |
| `False` | `True` | `False` | `True` | `True` |
| `False` | `False` | `False` | `False` | `True` |

## Which comes first?

When a condition mixes the operators, Python applies `not` first, then `and`, then `or`. Brackets override the order, as they do in arithmetic:

```python
print(True or False and False)
print((True or False) and False)
```
```output
True
False
```

In the first line `False and False` is worked out first and gives `False`, and then `True or False` gives `True`. In the second line the brackets force the `or` to go first. Nobody remembers every precedence rule, so add brackets whenever a condition mixes `and` with `or`. They cost nothing, and they tell the reader what you meant.

%% question q-precedence | predict
What does this program print?

```python
a = True
b = False
print(a or b and not a)
```
%% answer
True
%% explain
`not a` is worked out first and gives `False`. Then `b and False` gives `False`. Finally `a or False` gives `True`, because `a` is `True`. Brackets would make this much easier to read: `a or (b and (not a))`.
%% end

## Python stops early

Python reads `and` and `or` from left to right and stops as soon as it knows the answer. This is called **short-circuit evaluation**. With `and`, a false left side makes the whole thing false, so the right side is never looked at. That is useful for protecting a risky calculation:

```python run
x = 0
print(x != 0 and 10 / x > 1)
```

Dividing 10 by 0 would normally cause a ZeroDivisionError, but the left side is already `False`, so Python never tries it. With `or`, a true left side is enough, and the right side is skipped.

## What counts as true?

An `if` does not need a comparison. Python treats every value as true or false. The values that count as **false** are zero (`0` and `0.0`), the empty string `""` and `None`. Everything else is true:

```python run
print(bool(0), bool(7), bool(""), bool("hi"), bool(None), bool(0.0))
```

This is called **truthiness**, and it makes some checks short and natural. An empty reply is false, so you can test for it directly:

```python run
name = ""
if name:
    print("Hello,", name)
else:
    print("Please type a name.")
```

%% question q-falsy | multi
Select every value that counts as false in an `if` statement.
%% choice correct
`0`
%% choice correct
`""`
%% choice correct
`None`
%% choice
`"0"`
%% choice
`"False"`
%% explain
The number zero, the empty string and `None` are false. The text `"0"` and the text `"False"` are strings with characters in them, so they are true, even though they look like false things. Python never reads the meaning of a string.
%% end

## The classic mistake

Many beginners write a condition the way they would say it aloud:

```python run
x = 5
if x == 1 or 2:
    print("This always prints!")
```

It prints, even though `x` is 5. Python reads the condition as `(x == 1) or 2`. The left side is false, but the right side is the number `2`, which is truthy, so the whole condition is true. Each side of `or` must be a full question:

```python run
x = 5
if x == 1 or x == 2:
    print("x is 1 or 2")
else:
    print("x is something else")
```

%% question q-always-true | choice
Why does `if x == 1 or 2:` run its block for every value of `x`?
%% choice
Python cannot compare a number with `or`.
%% choice correct
The `2` on its own is a truthy value, so the right side of `or` is always true.
%% choice
`x == 1` is always true.
%% choice
`or` only checks the second value.
%% explain
The condition is read as `(x == 1) or (2)`. The number 2 is not zero, so it counts as true, and an `or` with one true side is true. The correct version repeats the comparison: `x == 1 or x == 2`.
%% end

## A decision in one line

When a decision only picks between two values, a **conditional expression** keeps it on one line. Its shape is `value_if_true if condition else value_if_false`:

```python run
age = 20
status = "adult" if age >= 18 else "minor"
print(status)
print("even" if age % 2 == 0 else "odd")
```

Use it when both choices are short. For longer actions, a normal `if` statement is clearer.

%% question q-conditional | fill
Fill in the blank so the program prints `odd`.

```python
n = 7
label = "even" ___ n % 2 == 0 else "odd"
print(label)
```
%% answer
if
%% expected
odd
%% explain
The expression `"even" if n % 2 == 0 else "odd"` gives `"even"` when the condition is true and `"odd"` otherwise. Since 7 leaves a remainder of 1, the answer is `"odd"`.
%% end

## Your turn

%% exercise can-ride | Can ride
Read the height in centimetres on the first line and the age on the second line. A rider must be at least 120 cm tall **and** at least 8 years old. Print `Yes` if both are true, otherwise print `No`. For the input `130` and `9` the program prints:

```output
Yes
```
%% stdin
130
9
%% starter
# Read height, then age, then decide.

%% solution
height = int(input())
age = int(input())
if height >= 120 and age >= 8:
    print("Yes")
else:
    print("No")
%% tests
expect_output("Yes")
check(rerun("119\n9").strip() == "No", "too short")
check(rerun("130\n7").strip() == "No", "too young")
check(rerun("120\n8").strip() == "Yes", "exactly on the limits")
check(uses("And"), "uses and")
%% hint
Both conditions must hold at the same time, which is what `and` is for.
%% hint
The condition is `height >= 120 and age >= 8`.
%% hint
Print `Yes` in the `if` block and `No` in the `else` block.
%% end

%% exercise weekend | Weekend or weekday
Read a day name. Print `Weekend` if it is Saturday or Sunday, whatever the capital letters, and `Weekday` for anything else. For the input `Sunday` the program prints:

```output
Weekend
```
%% stdin
Sunday
%% starter
# Read the day and decide.

%% solution
day = input().strip().lower()
if day == "saturday" or day == "sunday":
    print("Weekend")
else:
    print("Weekday")
%% tests
expect_output("Weekend")
check(rerun("saturday").strip() == "Weekend", "works for lower case")
check(rerun("MONDAY").strip() == "Weekday", "Monday is a weekday")
check(rerun("friday").strip() == "Weekday", "Friday is a weekday")
check(uses("Or"), "uses or")
%% hint
Change the text to lower case first so that capital letters do not matter.
%% hint
Remember that both sides of `or` must be full comparisons.
%% hint
`if day == "saturday" or day == "sunday":`
%% end

%% exercise sign-label | Sign label
Read a whole number and print `positive` when it is above zero and `not positive` otherwise. Use a conditional expression, so that the decision is one line. For the input `5` the program prints:

```output
positive
```
%% stdin
5
%% starter
# Use a conditional expression.

%% solution
number = int(input())
print("positive" if number > 0 else "not positive")
%% tests
expect_output("positive")
check(rerun("0").strip() == "not positive", "0 is not positive")
check(rerun("-4").strip() == "not positive", "-4 is not positive")
check(uses("IfExp"), "uses a conditional expression (a if condition else b)")
%% hint
The shape is `value_if_true if condition else value_if_false`.
%% hint
You can put the whole expression inside `print(...)`.
%% hint
`print("positive" if number > 0 else "not positive")`
%% end

%% exercise discount | Challenge: Discount
A shop gives a discount when the customer is a student or at least 60 years old, **and** the bill is at least 5000 naira. Read three lines: the age, the word `yes` or `no` for whether the customer is a student, and the bill. Print `Discount` or `No discount`. For the input `20`, `yes` and `6000` the program prints:

```output
Discount
```
%% stdin
20
yes
6000
%% starter
# Read age, student answer and bill, then decide.

%% solution
age = int(input())
student = input().strip().lower() == "yes"
bill = int(input())
if (student or age >= 60) and bill >= 5000:
    print("Discount")
else:
    print("No discount")
%% tests
expect_output("Discount")
check(rerun("65\nno\n5000").strip() == "Discount", "a senior with a big bill")
check(rerun("20\nyes\n4999").strip() == "No discount", "bill too small")
check(rerun("30\nno\n9000").strip() == "No discount", "neither student nor senior")
check(rerun("59\nno\n7000").strip() == "No discount", "59 is not 60")
%% hint
Turn the student answer into a `True` or `False` value, for example with `== "yes"`.
%% hint
The customer qualifies when (student or age at least 60) and the bill is large enough. Use brackets.
%% hint
`if (student or age >= 60) and bill >= 5000:`
%% end

## What you learned

- `and` is true when both sides are true, `or` is true when at least one side is true, and `not` flips a value.
- Python applies `not` first, then `and`, then `or`. Use brackets whenever you mix `and` with `or`.
- Python stops as soon as the answer is known (short-circuit), which protects risky calculations such as division.
- Zero, `""` and `None` count as false. Everything else is true, including the text `"0"`.
- Each side of `or` must be a full question: write `x == 1 or x == 2`, never `x == 1 or 2`.
- `a if condition else b` picks one of two values in a single line.
