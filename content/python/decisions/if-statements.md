---
title: if, elif and else
---
So far a program has run every line, once, from the top to the bottom. Real programs choose. A game shows "You win!" only when the score is high enough. A website shows a different page when you are logged in. A thermostat switches the heating on only when the room is cold.

In this lesson you give your programs that power with the `if` statement. You will also learn the rule that makes it work: **indentation**, the spaces at the start of a line, tell Python which lines belong together.

## Your first if

Here is a program with a decision in it. Run it, then change `temperature` to 20 and run it again:

```python run
temperature = 31
if temperature > 30:
    print("It is hot today.")
print("Have a nice day.")
```

The line that starts with `if` has three parts: the word `if`, a **condition** (a comparison or any other question with a `True` or `False` answer), and a colon `:`. The indented lines underneath are the **block**. Python runs the block only when the condition is `True`. The last line is not indented, so it does not belong to the block and runs every time.

Step through the program to watch Python skip or enter the block:

```python trace title="Follow the decision"
temperature = 31
if temperature > 30:
    print("It is hot today.")
print("Have a nice day.")
```

Always indent a block with **four spaces**. Every line in a block needs the same indentation, and the editor on this site helps by adding the spaces when you press Tab or Enter after a colon.

Plan decisions as a **flowchart** before you write them. Each diamond is a question, and the arrows show where the program goes next:

```text
        temperature > 30 ?
         /             \
       yes              no
        |                |
  print "It is hot"      |
         \              /
       print "Have a nice day."
```

## else: the other way

An `if` on its own does nothing when the condition is false. Add `else` to say what should happen instead:

```python run
number = 7
if number % 2 == 0:
    print("even")
else:
    print("odd")
```

The condition uses the remainder operator from module 1: a number is even when dividing it by 2 leaves 0. Exactly one of the two blocks runs, never both and never neither. The word `else` has no condition of its own, and it needs a colon too.

%% question q-unindented | choice
In this program, when does `print("Done")` run?

```python
if score > 50:
    print("Pass")
print("Done")
```
%% choice
Only when `score` is above 50.
%% choice correct
Every time, whatever the score is.
%% choice
Only when `score` is 50 or below.
%% choice
Never, because it comes after the block.
%% explain
The last line is not indented, so it is not part of the `if` block. It is an ordinary line that runs after the decision has been made. To make it run only for passing scores, you would indent it under the `if`.
%% end

## elif: more than two choices

Some decisions have several outcomes. A school turns a mark into a letter. Use `elif` (short for "else if") to add more questions:

```python run
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
print("Grade:", grade)
```

Python asks the questions from the top. As soon as one condition is `True`, it runs that block and **skips the rest**. The first match wins. That means the order of your questions matters. Look at what happens when they are in the wrong order:

```python run
score = 95
if score >= 70:
    print("C")
elif score >= 90:
    print("A")
```

A score of 95 prints `C`, because the first condition is already true and Python never reaches the `elif`. When you test ranges, start with the most demanding one.

%% question q-first-match | predict
What does this program print?

```python
mark = 75
if mark >= 50:
    print("Pass")
elif mark >= 70:
    print("Merit")
else:
    print("Fail")
```
%% answer
Pass
%% explain
The first condition, `mark >= 50`, is true for 75, so Python prints `Pass` and skips the rest of the chain. `Merit` can never be printed, because any mark that is 70 or more is also 50 or more. To fix the program, test `mark >= 70` first.
%% end

## Decisions inside decisions

A block can contain any statements, including another `if`. This is called a **nested** `if`. Each level is indented four more spaces:

```python run
age = 20
is_student = True
if age >= 18:
    if is_student:
        print("Adult student ticket")
    else:
        print("Adult ticket")
else:
    print("Child ticket")
```

Read it from the outside in. The outer `if` asks about age. Only when the person is an adult does Python go inside and ask the second question. Two or three levels are fine, but deep nesting becomes hard to read. In the next lesson you will learn how to combine questions in a single line, which often removes a level.

Sometimes you need a block that does nothing yet, for example while you plan a program. A block cannot be empty, so write the word `pass` as a placeholder:

```python run
mark = 40
if mark >= 50:
    pass
else:
    print("Study more")
```

## When things go wrong

Three mistakes account for most `if` problems. Run each one and read what Python says. First, forgetting to indent the block:

```python run error
if 3 > 2:
print("yes")
```

Python reports an **IndentationError** and tells you that it expected an indented block. Second, forgetting the colon:

```python run error
if 3 > 2
    print("yes")
```

This is a **SyntaxError**, and Python points at the place where the colon should be. Third, using `=` where you meant `==`:

```python run error
x = 5
if x = 5:
    print("five")
```

Python even suggests that you may have meant `==`. If your `if` does not do what you expect, check these three things first: the colon, the indentation, and the number of equals signs.

%% question q-colon | fill
Fill in the blank so the program prints `adult`.

```python
age = 20
if age >= 18___
    print("adult")
```
%% answer
:
%% expected
adult
%% explain
Every `if`, `elif` and `else` line ends with a colon. The colon tells Python that an indented block follows. Without it Python stops with a SyntaxError.
%% end

## Your turn

%% exercise hot-or-not | Hot or not
Read the temperature as a whole number. When it is above 30, print `Hot`. Otherwise print nothing at all. For the input `34` the program prints:

```output
Hot
```
%% stdin
34
%% starter
# Read the temperature and decide.

%% solution
temperature = int(input())
if temperature > 30:
    print("Hot")
%% tests
expect_output("Hot")
check(rerun("30").strip() == "", "30 is not above 30, so nothing is printed")
check(rerun("20").strip() == "", "20 prints nothing")
check(rerun("31").strip() == "Hot", "31 prints Hot")
%% hint
Convert the input to a number, then ask the question with `if`.
%% hint
Remember the colon after the condition, and indent the `print` line by four spaces.
%% hint
`if temperature > 30:` followed by an indented `print("Hot")`.
%% end

%% exercise even-or-odd | Even or odd
Read a whole number. Print `even` if it is even, otherwise print `odd`. For the input `10` the program prints:

```output
even
```
%% stdin
10
%% starter
# Read a number and print even or odd.

%% solution
number = int(input())
if number % 2 == 0:
    print("even")
else:
    print("odd")
%% tests
expect_output("even")
check(rerun("7").strip() == "odd", "7 is odd")
check(rerun("0").strip() == "even", "0 is even")
check(rerun("-3").strip() == "odd", "-3 is odd")
check(uses("If"), "uses if")
%% hint
A number is even when the remainder after dividing by 2 is 0.
%% hint
The condition is `number % 2 == 0`. Use `else` for the other case.
%% hint
Two print lines: `print("even")` inside the `if` and `print("odd")` inside the `else`.
%% end

%% exercise ticket-price | Ticket price
A theme park charges by age. Read the age and print the price in naira, as a plain number.

- Under 5: 0
- 5 to 12: 500
- 13 to 59: 1500
- 60 or more: 800

For the input `25` the program prints:

```output
1500
```
%% stdin
25
%% starter
# Read the age and print the price.

%% solution
age = int(input())
if age < 5:
    print(0)
elif age <= 12:
    print(500)
elif age <= 59:
    print(1500)
else:
    print(800)
%% tests
expect_output("1500")
check(rerun("4").strip() == "0", "age 4 is free")
check(rerun("5").strip() == "500", "age 5 pays 500")
check(rerun("12").strip() == "500", "age 12 pays 500")
check(rerun("13").strip() == "1500", "age 13 pays 1500")
check(rerun("59").strip() == "1500", "age 59 pays 1500")
check(rerun("60").strip() == "800", "age 60 pays 800")
%% hint
Use an `if`, then `elif` for each further group, then `else`. Start with the youngest group.
%% hint
Each `elif` only needs the upper limit, because the earlier conditions have already ruled out the younger ages.
%% hint
`if age < 5:` then `elif age <= 12:`, then `elif age <= 59:`, then `else:`.
%% end

%% exercise grade-report | Challenge: Grade report
Read a mark from 0 to 100 and print the grade letter: `A` for 90 or more, `B` for 80 or more, `C` for 70 or more, `D` for 60 or more and `F` for anything lower. If the mark is below 0 or above 100, print `Invalid` instead. For the input `85` the program prints:

```output
B
```
%% stdin
85
%% starter
# Check the mark is valid, then choose the grade.

%% solution
mark = int(input())
if 0 <= mark <= 100:
    if mark >= 90:
        print("A")
    elif mark >= 80:
        print("B")
    elif mark >= 70:
        print("C")
    elif mark >= 60:
        print("D")
    else:
        print("F")
else:
    print("Invalid")
%% tests
expect_output("B")
check(rerun("95").strip() == "A", "95 is an A")
check(rerun("90").strip() == "A", "90 is an A")
check(rerun("70").strip() == "C", "70 is a C")
check(rerun("60").strip() == "D", "60 is a D")
check(rerun("59").strip() == "F", "59 is an F")
check(rerun("101").strip() == "Invalid", "101 is invalid")
check(rerun("-1").strip() == "Invalid", "-1 is invalid")
%% hint
Decide validity first. A chained comparison from lesson 1 does the job in one line.
%% hint
Put the grade chain inside the valid case (a nested `if`) and print `Invalid` in the `else` of the outer `if`.
%% hint
Outer: `if 0 <= mark <= 100:` with the `if/elif/else` chain indented inside it, then `else:` and `print("Invalid")`.
%% end

## What you learned

- `if condition:` runs the indented block only when the condition is `True`. The colon and the four-space indentation are both required.
- `else:` handles the other case, and `elif condition:` adds more questions. Exactly one block of a chain runs, and the first match wins, so order your tests from the most demanding to the least.
- Lines that are not indented are outside the block and always run.
- A block can contain another `if`, which is called nesting. `pass` is a placeholder for a block you have not written yet.
- The usual mistakes are a missing colon, wrong indentation, and `=` instead of `==`.
- A flowchart written as text is a good way to plan a decision before you code it.
