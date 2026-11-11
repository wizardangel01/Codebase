---
title: Meet Python: module quiz
pass: 70
---
Twelve questions on everything in this module. You need 70 percent to pass, and you can try as many times as you like. Read each question carefully. Where there is code, work out the answer in your head before you choose.

%% question q-program | choice
What is a program?
%% choice
A box on the screen where you type words
%% choice correct
A list of instructions that the computer carries out in order
%% choice
A message that Python shows when something goes wrong
%% choice
A kind of number with a decimal point
%% explain
A program is a list of instructions. Python reads it from the top and carries out one instruction at a time.
%% end

%% question q-order-lines | order
Put these lines in the right order so that the program prints `Ready`, then `Set`, then `Go!`. One of the lines does not belong in the program.
%% lines
print("Ready")
print("Set")
print("Go!")
%% distractors
Print("Stop")
%% expected
Ready
Set
Go!
%% explain
Python runs the lines from top to bottom, so the order you write them is the order they happen. The line with a capital `P` would cause a `NameError`, so it must be left out.
%% end

%% question q-division | predict
What does this program print?

```python
print(7 // 2)
print(7 % 2)
print(7 / 2)
```
%% answer
3
1
3.5
%% explain
Two fits into seven three whole times (`//`), with 1 left over (`%`). Ordinary division with `/` gives the exact answer, `3.5`.
%% end

%% question q-text-join | predict
What does this program print?

```python
print("5" + "5")
print(5 + 5)
```
%% answer
55
10
%% explain
Inside quotation marks, `"5"` is text, and `+` joins two pieces of text together to make `55`. Without quotation marks, 5 is a number, so `+` adds them and the answer is `10`.
%% end

%% question q-floats | multi
Which of these values are **floats**? Select all that apply.
%% choice correct
`3.14`
%% choice
`7`
%% choice correct
`2.0`
%% choice
`"1.5"`
%% choice correct
`9 / 3`
%% explain
A float has a decimal point, so `3.14` and `2.0` are floats. The value `7` is an integer, and `"1.5"` is text because it has quotation marks. Division with `/` always gives a float, so `9 / 3` is `3.0`.
%% end

%% question q-power-order | predict
What does this program print?

```python
print(2 + 3 * 4 ** 2)
print((2 + 3) * 4 ** 2)
```
%% answer
50
80
%% explain
Powers come first: `4 ** 2` is 16. In the first line, multiplication comes before addition, so it is 2 + (3 x 16) = 50. In the second line the brackets make the addition happen first, so it is 5 x 16 = 80.
%% end

%% question q-remainder | choice
Which operator gives you the **remainder** after a division?
%% choice
`//`
%% choice
`/`
%% choice correct
`%`
%% choice
`**`
%% explain
The percent sign `%` gives the remainder, so `17 % 5` is `2`. The operator `//` gives the whole number of times it fits, which would be `3`.
%% end

%% question q-comment-fill | fill
Fill in the blank so that the first line becomes a comment and the program prints only `Hi`.

```python
___ print("Bye")
print("Hi")
```
%% answer
#
%% expected
Hi
%% explain
A line that starts with `#` is a comment, so Python ignores it. This is how you switch a line off without deleting it.
%% end

%% question q-sep-fill | fill
Fill in the blank so the program prints `a-b-c`.

```python
print("a", "b", "c", ___="-")
```
%% answer
sep
%% expected
a-b-c
%% explain
The `sep` option sets the separator, which is the text that goes between the things you print. Its default is a single space.
%% end

%% question q-end-predict | predict
What does this program print?

```python
print("A", end="-")
print("B", end="-")
print("C")
```
%% answer
A-B-C
%% explain
The first two calls end with a dash instead of a new line, so the next print carries on from the same spot. The last call uses the normal ending, so the line finishes after `C`.
%% end

%% question q-syntax-first | choice
Which kind of error is found **before** any line of the program has run?
%% choice
`NameError`
%% choice correct
`SyntaxError`
%% choice
`ZeroDivisionError`
%% choice
`TypeError`
%% explain
Python reads the whole program before it starts. If a line is not valid Python, such as a quotation mark that never ends, it reports a `SyntaxError` and runs nothing at all. The other errors only happen when Python reaches the line that causes them.
%% end

%% question q-logic | choice
A program runs without any error message, but it prints the wrong answer. What kind of mistake is this?
%% choice
A syntax error
%% choice correct
A logic error
%% choice
A name error
%% choice
A comment
%% explain
A logic error is a mistake in the *meaning* of your code. Python does exactly what you wrote, but that is not what you intended. To find one, you need to know what the right answer should be.
%% end
