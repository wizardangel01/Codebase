---
title: Python as a calculator
---
Python is very good at arithmetic. You can type a sum straight into `print()` and Python works out the answer for you. In this lesson you will meet the symbols Python uses for maths, learn the order it works things out in, and find out why some answers have a decimal point and others do not.

Programmers do not use a calculator app. They write the sum in their program, so the program can do it again and again, with no typing mistakes.

## Numbers need no quotation marks

In the last lesson you printed text, and text has to sit inside quotation marks. Numbers are different. A number is not a string, so you write it exactly as it is.

```python run
print(42)
print(3.14)
print(-7)
```

Python has two kinds of numbers that you will use all the time:

- An **integer** (`int`) is a whole number, such as `42`, `0` or `-7`.
- A **float** (`float`) is a number with a decimal point, such as `3.14`, `-0.5` or `2.0`.

Now compare these two lines. Run them and look closely.

```python run
print(2024)
print("2024")
```

They look identical on the screen, but Python treats them very differently. The first is a number, so you can do sums with it. The second is text that happens to be made of digits. Python cannot add up text, and you will see why that matters in a moment.

## The arithmetic operators

A symbol that tells Python to calculate something is called an **operator**. Here are the seven you need.

| Operator | What it does | Example | Result |
| --- | --- | --- | --- |
| `+` | add | `7 + 2` | `9` |
| `-` | subtract | `7 - 2` | `5` |
| `*` | multiply | `7 * 2` | `14` |
| `/` | divide | `7 / 2` | `3.5` |
| `//` | divide and drop the remainder | `7 // 2` | `3` |
| `%` | the remainder after dividing | `7 % 2` | `1` |
| `**` | raise to a power | `7 ** 2` | `49` |

Run all seven and check the results against the table.

```python run
print(7 + 2)
print(7 - 2)
print(7 * 2)
print(7 / 2)
print(7 // 2)
print(7 % 2)
print(7 ** 2)
```

Notice that the keyboard has no `×` or `÷` keys, so Python uses `*` for multiplying and `/` for dividing. Spaces around an operator are optional, so `7*2` works too. Most programmers add them because `7 * 2` is easier to read.

%% tip Try your own sums
Change the numbers above and predict the answer before you press **Run**. Guessing first, then checking, is the fastest way to learn what each operator does.
%% end

## Three kinds of division

Division is the one that surprises people, because Python has three operators that do something with it.

- `/` is normal division. It **always** gives a float, even when the answer is a whole number. So `8 / 2` gives `4.0`, not `4`.
- `//` is **floor division**. It tells you how many whole times one number fits inside another and throws away the leftover.
- `%` is the **remainder** (the programmers' word is *modulo*). It tells you what was left over.

Think of sharing 17 biscuits between 5 children. Each child gets 3 whole biscuits, and 2 biscuits are left over.

```python run
print(17 // 5)
print(17 % 5)
print(17 / 5)
print(8 / 2)
```

%% warn The percent sign is not for percentages
In Python, `%` does not work out a percentage. It gives the remainder of a division. If you want 20 percent of something, you multiply by `0.2` instead.
%% end

The remainder is more useful than it first looks. A number is **even** when dividing it by 2 leaves nothing over, so `n % 2` is `0` for even numbers and `1` for odd numbers. You will use that idea again and again when you write decisions and loops.

```python run
print(10 % 2)
print(11 % 2)
print(100 % 7)
```

%% question q-remainder-predict | predict
What does this program print?

```python
print(20 // 6)
print(20 % 6)
```
%% answer
3
2
%% explain
Six fits into twenty three whole times, because 3 x 6 is 18. That is the `//` answer. The leftover is 20 minus 18, which is 2. That is the `%` answer.
%% end

## The order of operations

When a calculation has several operators, which one does Python do first? It follows the same order you learned in maths class. This is sometimes remembered as BODMAS or PEMDAS.

1. Brackets `( )` come first.
2. Powers `**` come next.
3. Multiplication and division (`*`, `/`, `//`, `%`) come after that, working from left to right.
4. Addition and subtraction (`+`, `-`) come last, also from left to right.

Run this and see which answer you get.

```python run
print(2 + 3 * 4)
print((2 + 3) * 4)
```

The first line prints `14`, because the multiplication happens before the addition: `3 * 4` is `12`, and `2 + 12` is `14`. In the second line the brackets force the addition to happen first, so it is `5 * 4`, which is `20`.

Operators that sit at the same level run from left to right. That is why these two lines give different answers:

```python run
print(100 / 10 * 5)
print(100 / (10 * 5))
```

%% key When in doubt, add brackets
Extra brackets never do any harm. They make your intention obvious to anyone who reads the code, including you next week. Write `(a * b) + c` if it helps, even when Python would have done the same without them.
%% end

%% question q-order-choice | choice
What does `print(10 - 4 / 2)` display?
%% choice
`3.0`
%% choice correct
`8.0`
%% choice
`8`
%% choice
`5.0`
%% explain
Division comes before subtraction, so `4 / 2` happens first and gives `2.0`. Then `10 - 2.0` is `8.0`. The answer is a float, because `/` always gives a float. The answer `3.0` is what you would get if you did the subtraction first, which Python does not do.
%% end

## Floats can be a little untidy

Whole numbers are exact. Decimal numbers are a different story. Run this and look at the answers carefully.

```python run
print(0.1 + 0.2)
print(10 / 3)
```

You expected `0.3` and `3.3333333333333335`, or at least something tidier. Computers store decimals in a way that cannot represent every value exactly, so tiny errors creep in at the far end of the number. This is not a Python bug. Nearly every programming language behaves like this.

The fix is to round the answer with the `round()` function. You give it a number and then the number of decimal places to keep.

```python run
print(round(10 / 3, 2))
print(round(0.1 + 0.2, 2))
print(round(9.99))
```

When you leave out the second number, `round()` rounds to the nearest whole number.

## Mixing text and numbers in one print

Often you want a label and an answer on the same line. Give `print()` several things, separated by commas. It prints them one after another, with a space between each.

```python run
print("7 * 6 =", 7 * 6)
print("Seconds in an hour:", 60 * 60)
print("Half of 9 is", 9 / 2)
```

The text goes inside quotation marks, and the calculation does not. Python works the calculation out first and then prints the result.

Text has two operators of its own. `+` joins two pieces of text together, and `*` repeats text.

```python run
print("Py" + "thon")
print("ha" * 3)
print("-" * 20)
```

Do not try to join text and a number with `+`. Python cannot add `"Age: "` to `5`, and it will stop with an error. Use the comma instead, as in `print("Age:", 5)`. The next lessons show how to read errors like that one.

%% question q-power-fill | fill
Fill in the blank so the program prints `8`.

```python
print(2 ___ 3)
```
%% answer
**
%% expected
8
%% explain
`2 ** 3` means 2 multiplied by itself 3 times: 2 x 2 x 2 = 8. The star-star operator raises a number to a power.
%% end

## Your turn

%% exercise seconds-in-a-day | How long is a day?
A day has 24 hours, every hour has 60 minutes, and every minute has 60 seconds.

Write a program that prints how many seconds there are in a day. Let Python do the multiplication, do not type the answer yourself.

```output
86400
```
%% starter
# Print the number of seconds in one day.

%% solution
print(24 * 60 * 60)
%% tests
expect_output("86400")
check(calls("print"), "uses print()")
check(uses("Mult"), "does the sum with the * operator")
%% hint
You need three numbers multiplied together: hours in a day, minutes in an hour and seconds in a minute.
%% hint
Put the calculation inside the brackets of `print()`, with no quotation marks, like this: `print(2 * 3 * 4)`.
%% end

%% exercise add-brackets | Take control with brackets
This program prints `14`. Change it so that it prints `20`. You may only add brackets. Do not change any numbers or operators.

```output
20
```
%% starter
print(2 + 3 * 4)
%% solution
print((2 + 3) * 4)
%% tests
expect_output("20")
check(uses("Add"), "still uses +")
check(uses("Mult"), "still uses *")
%% hint
Which part of the sum needs to happen first for the answer to become 20?
%% hint
Wrap the addition in its own brackets: `(2 + 3)`.
%% end

%% exercise pizza-party | Share the pizza
Seventeen slices of pizza are shared equally between 5 friends. Print how many **whole** slices each friend gets on the first line, and how many slices are **left over** on the second line.

```output
3
2
```

Do not type the answers. Use operators, so the program still works if the numbers change.
%% starter
# Seventeen slices, five friends.

%% solution
print(17 // 5)
print(17 % 5)
%% tests
expect_output("3\n2")
check(uses("FloorDiv"), "uses // for the whole slices")
check(uses("Mod"), "uses % for the leftovers")
%% hint
Each answer needs its own `print()`, so you will write two lines of code.
%% hint
Whole slices each: use `//`. Slices left over: use `%`. Both operators go between 17 and 5.
%% end

%% exercise film-length | Challenge: how long is the film?
A film lasts 137 minutes. Print its length as hours and minutes, exactly like this:

```output
2 hours 17 minutes
```

Work out the numbers with operators, and give `print()` several things separated by commas.
%% starter
# 137 minutes is how many hours and minutes?

%% solution
print(137 // 60, "hours", 137 % 60, "minutes")
%% tests
expect_output("2 hours 17 minutes")
check(uses("FloorDiv"), "uses // to find the hours")
check(uses("Mod"), "uses % to find the minutes")
check(calls("print"), "uses print()")
%% hint
There are 60 minutes in an hour. Which operator tells you how many whole hours fit into 137 minutes?
%% hint
The leftover minutes come from `137 % 60`.
%% hint
Combine everything in one print with commas, like `print(1 + 1, "apples", 2 * 5, "pears")`.
%% end

## What you learned

- Numbers are written without quotation marks. Whole numbers are **integers** and numbers with a decimal point are **floats**.
- The operators are `+`, `-`, `*`, `/`, `//` (floor division), `%` (remainder) and `**` (power).
- `/` always gives a float. `//` gives the whole part and `%` gives the leftover.
- Python follows the usual order of operations: brackets, powers, multiplication and division, then addition and subtraction. Add brackets to take control.
- Floats can be slightly untidy, so use `round(number, places)` to tidy them.
- A comma lets `print()` show several things on one line. `+` joins text and `*` repeats it.
