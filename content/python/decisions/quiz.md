---
title: Decisions: module quiz
pass: 70
---
Twelve questions on everything in this module: comparisons, if statements, logic and whole programs that decide. Work out each program in your head before you answer, and use the explanations to learn from any slip.

%% question q1 | choice
What does `3 + 4 == 7` give?
%% choice correct
`True`
%% choice
`False`
%% choice
`7`
%% choice
An error, because `+` and `==` cannot appear in the same line.
%% explain
Python does the arithmetic first, so `3 + 4` becomes 7. Then the comparison asks whether 7 equals 7, and the answer is `True`.
%% end

%% question q2 | predict
What does this program print?

```python
x = 8
print(x > 5 and x < 10, x < 5 or x == 8, not x == 8)
```
%% answer
True True False
%% explain
Both sides of the first `and` are true, so it gives `True`. In the `or`, the left side is false and the right side is true, so the result is `True`. The last `x == 8` is `True`, and `not` flips it to `False`.
%% end

%% question q3 | multi
The variable `n` holds 15. Select every expression that is `True`.
%% choice correct
`n % 5 == 0`
%% choice
`n % 2 == 0`
%% choice correct
`10 < n <= 15`
%% choice
`n != 15`
%% choice correct
`"5" in str(n)`
%% explain
15 divides by 5 with nothing left over, it lies above 10 and at most 15, and the text `"15"` contains a 5. It is odd, so `n % 2 == 0` is `False`, and it equals 15, so `n != 15` is `False`.
%% end

%% question q4 | fill
Fill in the blank so the program prints `Teen`.

```python
age = 15
if age < 13:
    print("Child")
___ age < 20:
    print("Teen")
else:
    print("Adult")
```
%% answer
elif
%% expected
Teen
%% explain
`elif` adds a second question to the chain. Python asks it only when the first condition was false. Fifteen is not below 13, but it is below 20, so `Teen` is printed.
%% end

%% question q5 | order
Put the lines in order so that the program prints `Pass`. One line does not belong.
%% lines
mark = 64
if mark >= 50:
    print("Pass")
else:
    print("Fail")
%% distractors
elseif mark < 50:
%% expected
Pass
%% explain
The variable has to exist before it is tested. The `if` line comes first, then its indented block, then the `else` with its own block. Python has no `elseif`: the keyword is `elif`, and an `else` takes no condition at all.
%% end

%% question q6 | choice
Which condition is `True` for ages 13 to 19, with both ends included, and `False` for every other age?
%% choice correct
`13 <= age <= 19`
%% choice
`age >= 13 or age <= 19`
%% choice
`13 < age < 19`
%% choice
`age = 13 to 19`
%% explain
The chained comparison includes both limits. With `or`, every number satisfies at least one side, so the condition is always true. `13 < age < 19` leaves out the ages 13 and 19, and the last line is not Python.
%% end

%% question q7 | predict
What does this program print?

```python
coins = 5
if coins > 3:
    coins += 2
if coins > 6:
    coins += 3
elif coins > 4:
    coins += 100
print(coins)
```
%% answer
10
%% explain
The first `if` adds 2, so `coins` becomes 7. The second `if` starts a new chain. Seven is above 6, so 3 is added and `coins` becomes 10. The `elif` is skipped because its chain already had a match.
%% end

%% question q8 | choice
Which text makes `text.isdigit()` give `True`?
%% choice correct
`"2024"`
%% choice
`"-17"`
%% choice
`"3.14"`
%% choice
`"1 000"`
%% explain
`.isdigit()` accepts the characters 0 to 9 and nothing else. The minus sign, the decimal point and the space each make the test fail.
%% end

%% question q9 | multi
Each line below is the first line of a decision. Select every line that Python rejects.
%% choice correct
`if age = 18:`
%% choice
`if age == 18:`
%% choice correct
`if age > 18`
%% choice
`if not age < 18:`
%% choice correct
`else age < 18:`
%% explain
A single `=` stores a value, so it cannot sit in a condition. The second rejected line has no colon at the end. An `else` never takes a condition, so `else age < 18:` is a syntax error. The other two lines are valid.
%% end

%% question q10 | predict
What does this program print?

```python
x = 0
if x:
    print("A")
elif x == 0:
    print("B")
else:
    print("C")
```
%% answer
B
%% explain
The number 0 counts as false, so the first condition fails and `A` is skipped. The `elif` asks whether `x == 0`, which is true, so `B` is printed and `else` is never reached.
%% end

%% question q11 | choice
A shop gives a student discount and a loyalty discount, and one customer can receive both. Which structure fits?
%% choice
One `if`/`elif`/`else` chain.
%% choice correct
Two separate `if` statements.
%% choice
One `if` that joins both questions with `and`.
%% choice
An `if` with an `else` inside another `else`.
%% explain
A chain runs only one block, so a customer who qualifies twice would get one discount. Two separate `if` statements are independent questions, so each true condition applies its own discount.
%% end

%% question q12 | fill
Fill in the blank so the program prints `Walk`.

```python
raining = False
if ___ raining:
    print("Walk")
```
%% answer
not
%% expected
Walk
%% explain
The variable holds `False`. The word `not` flips it to `True`, so the block runs. Read the line aloud as "if it is not raining".
%% end
