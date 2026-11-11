---
title: True or False
---
Programs decide by asking questions that have a yes-or-no answer. Is the password right? Is the player's score above the high score? Is it raining? Python answers every such question with one of two values you already know from module 2: `True` or `False`.

In this lesson you learn to ask the questions. In the next lesson you will use the answers to choose what the program does. Getting comfortable with the questions first makes everything after it much smoother.

## Asking a question: comparison operators

A **comparison** puts two values side by side with an operator between them, and Python answers `True` or `False`:

```python run
print(5 > 3)
print(5 < 3)
print(7 == 7)
print(7 != 7)
print(4 <= 4)
print(4 >= 5)
```

Here are the six comparison operators:

| Operator | Asks | Example | Result |
| --- | --- | --- | --- |
| `==` | is it equal to? | `3 == 3` | `True` |
| `!=` | is it different from? | `3 != 3` | `False` |
| `<` | is it smaller than? | `2 < 5` | `True` |
| `>` | is it bigger than? | `2 > 5` | `False` |
| `<=` | is it smaller than or equal to? | `5 <= 5` | `True` |
| `>=` | is it bigger than or equal to? | `4 >= 5` | `False` |

The answer is an ordinary value, so you can store it in a variable like any other:

```python run
age = 12
is_twelve = age == 12
print(is_twelve)
print(type(is_twelve))
```

Python works out the comparison first, and then stores the result. The variable `is_twelve` holds a `bool`.

## One equals sign or two?

Beginners mix up `=` and `==` more than anything else in this module, so let us make the difference very clear.

- `=` is an **assignment**. It stores a value: `age = 12` means "let `age` stand for 12".
- `==` is a **comparison**. It asks a question: `age == 12` means "is `age` equal to 12?"

```python run
score = 10
print(score == 10)
print(score == 11)
print(score)
```

The two comparisons do not change `score`. They only ask. Mixing them up produces an error message, or worse, a program that does something you did not intend. Here is what Python says when you try to compare using a single `=` inside `print`:

```python run error
score = 10
print(score = 10)
```

%% question q-equals | choice
Which line asks whether `score` is equal to 10?
%% choice
`score = 10`
%% choice correct
`score == 10`
%% choice
`score => 10`
%% choice
`score === 10`
%% explain
`==` is the comparison that asks the question. A single `=` stores a value instead. `=>` and `===` do not exist in Python: the operators that include "or equal" are `<=` and `>=`, with the equals sign second.
%% end

## Comparing text

Comparisons work on text too. Two strings are equal only when every character matches, including capital letters:

```python run
print("cat" == "cat")
print("cat" == "Cat")
print("apple" < "banana")
print("Zebra" < "apple")
print("Zebra".lower() < "apple".lower())
```

The `<` and `>` operators compare text in **alphabetical order**, with one surprise on the fourth line. Python puts every capital letter before every small letter, so `"Zebra"` comes before `"apple"`. To compare words fairly, convert both to the same case first with `.lower()`, as the last line does. Remember that a number and a piece of text are never equal, even when they look alike: `5 == "5"` is `False`.

%% question q-text-order | predict
What does this program print?

```python
print("Zebra" < "apple")
```
%% answer
True
%% explain
Python compares the characters by their position in its character table, and all capital letters come before all small letters. The first characters are `Z` and `a`, and `Z` comes first, so the answer is `True`. Converting both words with `.lower()` would give `False`.
%% end

## Is it in between?

You often need to know whether a number lies between two limits. Python lets you chain comparisons in a way that reads like maths:

```python run
temperature = 22
print(15 <= temperature <= 25)
print(0 < temperature < 10)
```

The first line asks "is the temperature at least 15 and at most 25?" and the second asks "is it above 0 and below 10?". This **chained comparison** is true only when every link in the chain is true. Take care with `<` and `<=`: a limit written with `<=` includes the end value, and one written with `<` leaves it out.

## Is it inside? in and not in

The words `in` and `not in` ask whether one piece of text appears inside another:

```python run
word = "Python"
print("thon" in word)
print("Thon" in word)
print("z" not in word)
```

The test is case sensitive, like `==`. You can use `in` to check an email address for an `@` sign, or to see whether a sentence mentions a word.

%% question q-between | fill
Fill in the blank so the program prints `True`.

```python
age = 12
print(10 < age ___ 15)
```
%% answer
<|<=
%% expected
True
%% explain
Both `<` and `<=` work here, because 12 is well inside the limits. The chain `10 < age < 15` means that `age` is above 10 and below 15. A single comparison such as `10 < age` would only test one end.
%% end

## The float trap

Remember from module 2 that floats are stored approximately. That matters when you compare them:

```python run
print(0.1 + 0.2 == 0.3)
print(0.1 + 0.2)
print(round(0.1 + 0.2, 2) == 0.3)
```

The first line prints `False`, because `0.1 + 0.2` is really `0.30000000000000004`. The fix is to round both sides to the number of decimal places that matter before you compare, as in the last line. Never compare floats with `==` unless you have rounded them first.

%% question q-float-compare | choice
Why does `0.1 + 0.2 == 0.3` give `False`?
%% choice
Python cannot add decimal numbers.
%% choice correct
Floats are stored approximately, so the sum is not exactly 0.3.
%% choice
`==` only works on whole numbers.
%% choice
The numbers are text, not numbers.
%% explain
Computers store decimal numbers in binary, and 0.1 and 0.2 cannot be stored exactly. Their sum is a tiny bit more than 0.3, so the two sides differ. Rounding both sides fixes the comparison.
%% end

## Your turn

%% exercise adult-check | Adult check
The variable `age` is set for you. Print whether the person is at least 18 years old. For this age the program must print:

```output
False
```
%% starter
age = 17
# Print whether age is at least 18.

%% solution
age = 17
print(age >= 18)
%% tests
expect_output("False")
check(uses("GtE"), "uses the >= comparison")
%% hint
You need a comparison inside `print(...)`.
%% hint
"At least 18" means 18 or more, so include 18 itself.
%% hint
`print(age >= 18)`
%% end

%% exercise password-check | Password check
The password is `Moon42` and the guess is `moon42`. Print two lines. The first line says whether the guess equals the password exactly. The second line says whether they are equal when capital letters are ignored.

```output
False
True
```
%% starter
secret = "Moon42"
guess = "moon42"
# Print the two comparisons.

%% solution
secret = "Moon42"
guess = "moon42"
print(guess == secret)
print(guess.lower() == secret.lower())
%% tests
expect_output("False\nTrue")
check(calls("lower"), "uses lower() to ignore capital letters")
%% hint
The first line compares the two variables as they are.
%% hint
For the second line, change both variables to the same case before comparing.
%% hint
`print(guess.lower() == secret.lower())`
%% end

%% exercise in-range | In range
Read a whole number and print `True` if it is between 1 and 100, including both ends, or `False` if it is not. Use one chained comparison. For the input `42` the program prints:

```output
True
```
%% stdin
42
%% starter
# Read a number and say whether it is from 1 to 100.

%% solution
number = int(input())
print(1 <= number <= 100)
%% tests
expect_output("True")
check(rerun("1").strip() == "True", "1 is in range")
check(rerun("100").strip() == "True", "100 is in range")
check(rerun("0").strip() == "False", "0 is out of range")
check(rerun("101").strip() == "False", "101 is out of range")
%% hint
Convert the input to a number first.
%% hint
A chained comparison has the shape `low <= value <= high`.
%% hint
`print(1 <= number <= 100)`
%% end

%% exercise sum-check | Challenge: Sum check
Read three decimal numbers, one per line: `a`, `b` and `c`. Print `True` if `a + b` equals `c` when both sides are rounded to 2 decimal places, and `False` otherwise. For the input `0.1`, `0.2`, `0.3` the program prints:

```output
True
```
%% stdin
0.1
0.2
0.3
%% starter
# Read a, b and c. Compare the rounded sums.

%% solution
a = float(input())
b = float(input())
c = float(input())
print(round(a + b, 2) == round(c, 2))
%% tests
expect_output("True")
check(rerun("0.1\n0.2\n0.4").strip() == "False", "0.1 + 0.2 is not 0.4")
check(rerun("1.5\n2.25\n3.75").strip() == "True", "1.5 + 2.25 is 3.75")
check(calls("round"), "uses round() before comparing")
%% hint
Read each number with `float(input())`.
%% hint
Comparing `a + b == c` directly fails for 0.1 + 0.2, so round both sides first.
%% hint
`print(round(a + b, 2) == round(c, 2))`
%% end

## What you learned

- A comparison (`==`, `!=`, `<`, `>`, `<=`, `>=`) gives `True` or `False`, and you can store the answer in a variable.
- `=` stores a value and `==` asks a question. Mixing them up is the most common mistake in this module.
- Text is compared character by character: case matters, capitals come before small letters, and `.lower()` makes comparisons fair.
- A chained comparison such as `0 < x < 10` checks that a value lies between two limits.
- `in` and `not in` ask whether a piece of text appears inside another.
- Never compare floats with `==` without rounding them first.
