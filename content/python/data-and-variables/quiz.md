---
title: Data and variables: module quiz
pass: 70
---
Twelve questions on everything in this module: variables, the kinds of data, reading input and working with text. Take your time, and run any snippet in your head before you answer.

%% question q1 | choice
What does the line `x = x + 1` do when `x` currently holds 5?
%% choice
It raises an error, because `x` cannot equal `x + 1`.
%% choice correct
It makes `x` hold 6.
%% choice
It compares `x` with `x + 1`.
%% choice
It adds 1 to a copy and keeps `x` at 5.
%% explain
In Python `=` stores a value. The right-hand side is worked out first (5 + 1), and the result is then stored under the name `x`. In maths the equation would be impossible, but an assignment is an instruction, not a claim.
%% end

%% question q2 | multi
Select every line that stores a value without an error.
%% choice correct
`total_cost = 12`
%% choice
`12 = total_cost`
%% choice
`first name = "Ada"`
%% choice correct
`_count = 0`
%% choice
`max-score = 10`
%% explain
`total_cost = 12` and `_count = 0` follow the rules. A value cannot be a name (`12 = total_cost`), names cannot contain spaces, and `max-score` contains a dash that Python reads as a minus sign.
%% end

%% question q3 | predict
What does this program print?

```python
a = 6
b = 4
a, b = b, a + b
print(a, b)
```
%% answer
4 10
%% explain
The right-hand side is worked out first, using the old values: `b` is 4 and `a + b` is 10. Then the pair is stored, so `a` becomes 4 and `b` becomes 10.
%% end

%% question q4 | fill
Fill in the blank so the program prints `40`.

```python
x = 10
x ___ 4
print(x)
```
%% answer
*=
%% expected
40
%% explain
`x *= 4` means `x = x * 4`, so 10 becomes 40. With `+=` you would get 14, and with `**=` you would get 10000.
%% end

%% question q5 | predict
What does this program print?

```python
print(type(10 / 5))
```
%% answer
<class 'float'>
%% explain
The `/` operator always gives a float, even when the answer is a whole number: `10 / 5` is `2.0`. Use `//` if you want an int.
%% end

%% question q6 | choice
What happens when Python runs `int("7.5")`?
%% choice
It gives 7.
%% choice
It gives 8.
%% choice
It gives 7.5.
%% choice correct
It raises a ValueError.
%% explain
`int()` accepts only text that looks like a whole number. The text `"7.5"` contains a decimal point, so it fails. Use `int(float("7.5"))` if you want 7.
%% end

%% question q7 | fill
Fill in the blank so the program prints `3`.

```python
print(int(___("3.9")))
```
%% answer
float
%% expected
3
%% explain
`float("3.9")` turns the text into 3.9, and `int()` cuts off the decimal part to give 3. The text cannot go straight to `int()`.
%% end

%% question q8 | choice
Which line correctly reads a whole number from the user?
%% choice
`age = input(int)`
%% choice correct
`age = int(input("Age: "))`
%% choice
`age = input("Age: ") + 0`
%% choice
`age = number(input())`
%% explain
`input()` returns text, and `int(...)` converts that text into a whole number. `input(int)` passes a type as the prompt, `+ 0` tries to add a number to text (a TypeError), and `number()` does not exist.
%% end

%% question q9 | predict
What does this program print?

```python
item = "tea"
cost = 2.5
print(f"{item:<6}|{cost:.2f}")
```
%% answer
tea   |2.50
%% explain
`:<6` left-aligns `tea` in a space of 6 characters, so three spaces follow it. `:.2f` shows 2.5 with two decimals. The bar `|` is plain text.
%% end

%% question q10 | predict
What does this program print?

```python
word = "keyboard"
print(word[1:4], word[-3:], word[::-1][:2])
```
%% answer
eyb ard dr
%% explain
`word[1:4]` takes positions 1, 2 and 3: `eyb`. `word[-3:]` is the last three letters: `ard`. Reversed, the word is `"draobyek"`, and its first two letters are `dr`.
%% end

%% question q11 | order
Put the lines in order so that the program prints the tidy name and its length. One line does not belong.
%% lines
name = "  tunde adebayo  "
clean = name.strip().title()
print(clean)
print(len(clean))
%% distractors
print(clean.length)
%% expected
Tunde Adebayo
13
%% explain
The name has to exist before it is cleaned, and the clean version has to exist before it is printed. `clean.length` does not exist in Python: the length of a string comes from the function `len()`.
%% end

%% question q12 | choice
What does `print("5" * 3)` show?
%% choice
`15`
%% choice correct
`555`
%% choice
`5 5 5`
%% choice
An error, because text cannot be multiplied
%% explain
Repeating text is allowed: `"5" * 3` repeats the string three times. The quotes make `"5"` text, so no arithmetic happens. With the number 5 the result would be 15.
%% end
