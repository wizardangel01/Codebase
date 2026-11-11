---
title: Your first program
---
A **program** is a list of instructions for a computer. The computer follows them one at a time, in order, exactly as you wrote them. It never gets bored, it never gets tired, and it never guesses what you meant. That last part is the tricky part, and it is also why programming teaches you to think clearly.

**Python** is a language for writing those instructions. It reads a lot like plain English, which makes it a friendly first language. It is also the language behind data science, web servers, automation scripts and much of today's AI work, so what you learn here keeps paying off.

In this module you will run your first programs, learn how Python reads code from top to bottom, and meet the error messages that every programmer sees every day. By the end you will know enough to guide a rover across a planet with a few lines of code.

## How this site works

Each lesson mixes four things. **Examples** are live: press **Run** and Python runs your code right here in your browser. **Questions** check one idea at a time and explain the answer. **Exercises** ask you to write code, and the **Check my code** button tells you which checks pass and which do not. **Hints** wait for you when you are stuck, and they appear one at a time so you can take only as much help as you need.

At the end of every module there is a quiz and a game that you play by writing Python. You earn XP along the way, and everything is saved in this browser, so you can close the page and come back later.

## Run your first line

Everything on this site runs for real. The box below is a complete Python program with a single line. Press **Run**.

```python run
print("Hello, world!")
```

You have now run Python. The very first run can take a few seconds while the Python engine loads into your browser. After that it is quick.

Now look at what you ran:

- `print` is a **function**. A function is a named instruction that Python already knows how to carry out. This one *displays* things.
- The parentheses `( )` hold what you hand to the function. That is its **argument**.
- `"Hello, world!"` is a piece of text. Programmers call text a **string**. The quotation marks show Python where the text starts and ends. They are not printed.

%% tip Every box is live
Change the text between the quotation marks, press **Run**, and see what happens. You cannot break anything. If you get lost, the **Reset** button puts the original code back.
%% end

## Strings can hold any text

Strings can be a word, a sentence or a whole paragraph. They can even be empty. Run this, then change it to say whatever you like.

```python run
print("Python is fun")
print('Single quotes work too')
print("Numbers inside quotes stay text: 2024")
print("")
print("The empty print above left a blank line.")
```

You can use double quotes `"like this"` or single quotes `'like this'`. Pick one style and be consistent. The only rule is that the closing quote must match the opening one.

%% question q-print-quote | choice
Which line displays the word `Python` on the screen?
%% choice
`print(Python)`
%% choice correct
`print("Python")`
%% choice
`Print("Python")`
%% choice
`print "Python"`
%% explain
Text must sit inside quotation marks. Without them, Python thinks `Python` is the name of something it should already know about. `Print` with a capital P does not exist, because Python cares about capital letters. The parentheses are required as well.
%% end

## One print, one line

Each `print()` call puts its text on a new line. Python reads your program from the top and works down, so the first line runs first and the last line runs last.

```python run
print("Ready...")
print("Set...")
print("Go!")
```

Swap two of the lines and run it again. The output changes, because the order of the instructions changed. That sounds clear, but it is the most important idea in this module. You will use it in the game at the end.

%% question q-order-predict | predict
What does this program print?

```python
print("one")
print("two")
print("three")
```
%% answer
one
two
three
%% explain
Each `print()` starts a new line, and the lines run in the order they are written.
%% end

## Capital letters and spelling matter

Python is strict about spelling. `print` works. `Print` does not, and neither does `prnt`. Run the program below to see what a mistake looks like.

```python run error
Print("Hello")
```

Do not panic when you see red text. Errors are normal, even for professionals, and Python is trying to help you. The message names the problem (`NameError`), the line it happened on, and often suggests the fix. A later lesson in this module is all about reading these messages.

## When the text contains quotes

What if the text you want to print has quotation marks inside it? Python needs a way to tell the quotes that belong to the text apart from the quotes that end it.

The easiest fix is to wrap the text in the *other* kind of quote.

```python run
print('She said "hello" and smiled.')
print("It's a lovely day.")
```

You can also put a backslash `\` in front of a quote inside the text. The backslash means "this quote is a plain character, not the end of the string".

```python run
print("She said \"hello\" and smiled.")
print('It\'s a lovely day.')
```

%% note Special characters
A backslash can do other jobs too. In a string, `\n` means "start a new line" and `\t` means "insert a tab". You will see them again when you work with text.
%% end

## Your turn

%% exercise first-print | Print a greeting
Write a program that prints exactly this line:

```output
Hello from my first program!
```
%% starter
# Type your code under this line

%% solution
print("Hello from my first program!")
%% tests
expect_output("Hello from my first program!")
check(calls("print"), "uses print()")
%% hint
Use the `print` function and put the text inside parentheses.
%% hint
The text must be inside quotation marks, and it must match the line shown above, including the capital H and the exclamation mark.
%% end

%% exercise star-steps | Build a staircase
Use four `print()` calls to draw this staircase of stars:

```output
*
**
***
****
```
%% starter
# one print() for each row of the staircase

%% solution
print("*")
print("**")
print("***")
print("****")
%% tests
expect_output("*\n**\n***\n****")
check(len(stdout_lines()) == 4, "prints four lines")
%% hint
Each row needs its own `print()`. The first row is a single `*`.
%% hint
The second row is `"**"`, the third is `"***"`, and the fourth is `"****"`.
%% end

%% exercise quotes-challenge | Challenge: quotes inside quotes
Print this line exactly, including all three quotation marks and the apostrophe:

```output
Python's "print" function
```
%% starter
# Use the other kind of quote, or a backslash

%% solution
print('Python\'s "print" function')
%% tests
expect_output('Python\'s "print" function')
check(calls("print"), "uses print()")
check(len(stdout_lines()) == 1, "prints exactly one line")
%% hint
The text contains both a single quote (apostrophe) and double quotes, so neither kind of quote can wrap it without help.
%% hint
Wrap the text in single quotes, and put a backslash before the apostrophe: `\'`. Or wrap it in double quotes and put a backslash before each double quote inside.
%% end

## What you learned

- A program is a list of instructions that Python carries out from top to bottom.
- `print()` displays text. The text goes inside parentheses and quotation marks.
- Text in quotes is called a **string**. Single and double quotes both work if they match.
- Spelling and capital letters matter: `print` is not `Print`.
- Use the other kind of quote, or a backslash, when the text itself contains quotes.
