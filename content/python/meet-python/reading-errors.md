---
title: Reading error messages
---
Every programmer sees error messages, every single day, from the first week to the twentieth year. They are not a sign that you are bad at this. An error message is Python telling you what it could not do and where it got stuck. Once you can read one, most mistakes take seconds to fix.

This lesson gives you a way to read errors calmly, introduces the five you will meet most often, and ends with a routine you can use whenever your code misbehaves.

## What an error looks like

Run this program. It has a deliberate mistake, so it is marked as one that fails.

```python run error
print("Starting the mission")
print(Launch)
print("Done")
```

Python printed the first line, and then it stopped with a message in red. This site also adds a short explanation in plain language underneath. The red message is Python's own, and it has three parts:

1. **The line number.** `line 2` says where Python noticed the problem. The code from that line is shown below it, with little arrows pointing at the part Python did not like.
2. **The error type.** The last line starts with the name of the error, here `NameError`. The name tells you what *kind* of mistake it is.
3. **The description.** After the colon, Python explains in a few words: `name 'Launch' is not defined`.

Also notice what *did* happen. `Starting the mission` was printed, because line 1 is fine. `Done` was never printed, because Python stops at the first error and does not run the lines after it.

%% key Read the last line first
Start at the bottom of the message. The last line tells you the type of error and what is wrong. Then look at the line number to find where. Then read that line of your code, slowly, and compare it with what the message said.
%% end

## The five errors you will meet most

### SyntaxError: Python cannot read the code

**Syntax** is the grammar of a language. A `SyntaxError` means that a line is not valid Python, like a sentence with a missing full stop. The usual causes are quotation marks or brackets that are not closed. Run both examples.

```python run error
print("Hello)
```

The message says `unterminated string literal`. A string began with a quotation mark but never ended. This one is about brackets:

```python run error
print("one")
print("two"
print("three")
```

Here the message says `'(' was never closed`, and it points at line 2. Every opening bracket needs a closing one.

Now look at the output of that last program. Nothing was printed, not even `one`, and line 1 is perfectly fine. That is the special thing about syntax errors. Python reads the **whole** program before it starts running anything. If any line is not valid Python, it refuses to run any of it.

### NameError: Python does not know that word

```python run error
prnt("Hello")
```

Python looked for something called `prnt` and could not find it. Python is even kind enough to suggest `print`. A `NameError` usually comes from one of three slips: a typing mistake, the wrong capital letters (`Print` is not `print`), or text with its quotation marks missing (`print(Hello)` instead of `print("Hello")`).

### TypeError: the wrong kinds of things

```python run error
print("Age: " + 5)
```

You cannot join text and a number with `+`, as you saw at the end of the calculator lesson. The message says `can only concatenate str (not "int") to str`. Here *str* means a string and *int* means an integer. You fix this one by giving `print()` two separate things with a comma: `print("Age:", 5)`.

### ZeroDivisionError: dividing by zero

```python run error
print(10 / 0)
```

Dividing by zero has no answer in maths, so Python refuses. Look at the number after the `/`, `//` or `%` and ask why it is zero.

### IndentationError: spaces in the wrong place

```python run error
print("Hi")
    print("there")
```

The second line starts with four spaces that should not be there. Python uses the space at the start of a line to understand how lines belong together, and that matters a lot once you meet decisions and loops. For now, every line must start at the left edge.

Here are the five side by side. Keep this table handy.

| Error | What it means | The first thing to check |
| --- | --- | --- |
| `SyntaxError` | Python cannot read the code | Quotation marks and brackets. Is each opening one closed? |
| `NameError` | Python does not know a word | Spelling, capital letters, and missing quotation marks |
| `TypeError` | Values of the wrong kinds were mixed | Did you mix text and numbers? |
| `ZeroDivisionError` | A division by zero | The number after the `/` |
| `IndentationError` | Spaces at the start of a line | Remove spaces from the start of the line |

%% question q-name-error | choice
Python reports `NameError: name 'Hello' is not defined` for the line `print(Hello)`. What is the most likely fix?
%% choice correct
Put quotation marks around `Hello`
%% choice
Add a second pair of brackets
%% choice
Change `print` to `Print`
%% choice
Add a comma after `Hello`
%% explain
Without quotation marks, Python reads `Hello` as the name of something it should already know, and it does not. With quotation marks, `"Hello"` is text. That is the fix.
%% end

%% question q-what-shows | choice
Which of these shows what appears when this program runs?

```python
print("one")
print(10 / 0)
print("three")
```
%% choice
Only an error message
%% choice correct
`one`, followed by an error message
%% choice
`one`, an error message, and then `three`
%% choice
`one` and `three`, because Python ignores the error
%% explain
Python runs line 1 and prints `one`. Line 2 raises a `ZeroDivisionError` and the program stops, so line 3 never runs. A `SyntaxError` is different: Python reads the whole program first, so with a syntax error nothing at all would run.
%% end

## The bug with no message

Sometimes Python runs your whole program without a single complaint, and the answer is still wrong. This is called a **logic error**. Python did exactly what you wrote, which is not what you meant. These are the sneakiest bugs, because there is no red text to guide you.

Suppose you want the average of 4, 6 and 8. The correct answer is 6. Run this program and check its answer.

```python run
# The average of 4, 6 and 8 should be 6
print(4 + 6 + 8 / 3)
```

It prints about `12.67`. Remember the order of operations. The division happens first, so Python worked out `8 / 3` and then added 4 and 6 to it. Brackets fix it, by making the addition happen first.

```python run
print((4 + 6 + 8) / 3)
```

To catch a logic error, you need to know what the right answer should be. Work it out by hand or with a calculator **before** you trust the program. If the two answers differ, check the order of operations, then check each part of the calculation on its own. The **Visualise this code** button in earlier lessons is a good friend here too.

## A calm routine for fixing bugs

When something goes wrong, do these things in this order.

1. **Read the last line** of the error message.
2. **Go to the line number** it mentions. Also look at the line above it, because Python sometimes only notices a missing quotation mark or bracket one line later.
3. **Check the usual suspects.** Spelling, capital letters, quotation marks, brackets, and spaces at the start of the line.
4. **Fix one thing at a time, then run again.** If a new error appears, that is progress: you got past the first one.
5. **Still stuck?** Read the line out loud, slowly. Or switch lines off with `#` until the program runs, then switch them back on one at a time.

%% tip Errors mean progress
An error on line 5 tells you that lines 1 to 4 were fine. Every error you fix teaches you something about how Python thinks, and fast debugging is one of the biggest differences between beginners and experienced programmers.
%% end

%% question q-which-run | multi
Select **every** line that runs without an error.
%% choice correct
`print("Hi")`
%% choice
`Print("Hi")`
%% choice correct
`print('Hi')`
%% choice
`print("Hi"`
%% choice correct
`print(5 + 5)`
%% explain
`Print` with a capital P is a `NameError`, and `print("Hi"` is missing its closing bracket, which is a `SyntaxError`. Single and double quotation marks both work for text, and `5 + 5` is a sum that prints `10`.
%% end

## Your turn

These are fix-it exercises. The starter code is broken on purpose. Run it, read the message, fix **one** thing, and run again.

%% exercise fix-two-bugs | Two mistakes, one at a time
This program should print two lines, but it has two mistakes. Python finds them one at a time. Fix the first error you see, run again, and keep going until the output matches.

```output
Systems check
All systems go
```
%% starter
Print("Systems check")
print("All systems go)
%% solution
print("Systems check")
print("All systems go")
%% tests
expect_output("Systems check\nAll systems go")
check(calls("print"), "uses print()")
%% hint
Run the program and read the red message. It is a `SyntaxError` that points at line 2, and it says a string was never ended.
%% hint
Add the missing closing quotation mark on line 2. Run again and you will meet a different error.
%% hint
The new error is a `NameError` about `Print`. Python is case sensitive, so fix the capital letter.
%% end

%% exercise fix-mission-report | Repair the mission report
This report should print the four lines below, but it contains three different mistakes. The rover shares 100 units of fuel equally between 4 engines. Fix the program so its output matches exactly.

```output
Mission report
Battery: 90
Fuel per engine: 25.0
Done
```
%% starter
print("Mission report")
print("Battery:" + 90)
print("Fuel per engine:", 100 / 0)
print(Done)
%% solution
print("Mission report")
print("Battery:", 90)
print("Fuel per engine:", 100 / 4)
print("Done")
%% tests
expect_output("Mission report\nBattery: 90\nFuel per engine: 25.0\nDone")
check(uses("Div"), "still works out the fuel with a division")
check(source().count("print(") == 4, "still has four print() lines")
%% hint
Python stops at the first error. Run the program, fix what the red message says, and run again. Three mistakes means three rounds.
%% hint
Line 2 mixes text and a number with `+`. Use a comma between them instead.
%% hint
Line 3 divides by zero. The fuel is shared between 4 engines, so what should the divisor be?
%% hint
Line 4 uses `Done` as if Python already knew that word. Text needs quotation marks.
%% end

%% exercise fix-temperature | Challenge: the silent bug
This program should convert 100 degrees Celsius to Fahrenheit. The rule is to multiply by 9, divide by 5, and then add 32. The correct answer is `212.0`.

The program runs without any error, but its answer is wrong. Find the logic error and fix it.

```output
212.0
```
%% starter
print(100 * (9 / 5 + 32))
%% solution
print(100 * 9 / 5 + 32)
%% tests
expect_output("212.0")
check(uses("Mult"), "still multiplies")
check(uses("Div"), "still divides")
check(uses("Add"), "still adds 32")
%% hint
Work it out by hand: 100 times 9 is 900, divided by 5 is 180, plus 32 is 212. Now run the program and compare its answer with that.
%% hint
The brackets make Python add 32 to `9 / 5` **before** multiplying by 100. Which part of the sum should wait until the end?
%% hint
Take the brackets away. Multiplication and division happen before addition anyway.
%% end

## What you learned

- An error message has a line number, an error type and a short description. Read the **last line first**, then go to the line it names.
- Python stops at the first error, so the lines after it never run. A `SyntaxError` is found before anything runs, so nothing is printed.
- The common errors are `SyntaxError` (quotes and brackets), `NameError` (spelling, capitals, missing quotes), `TypeError` (mixed kinds), `ZeroDivisionError` and `IndentationError`.
- A logic error runs without a message but gives the wrong answer. Know the right answer first, so you can spot the difference.
- Fix one thing at a time and run again. A new error means you made progress.
