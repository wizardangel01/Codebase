---
title: Comments and how Python reads code
---
You can already print text and do sums. Before the programs get longer, it is worth learning how Python reads a program, and how to leave notes in your code for yourself and for other people. Both ideas will save you a lot of confusion later.

## Python reads from the top, one line at a time

Python starts at the first line, carries it out, moves to the next line, and keeps going until it reaches the end. It never skips ahead and it never goes back by itself. This is why the order of your lines matters so much.

You can watch it happen. Press **Visualise this code**, then use the arrow buttons (or **Play**) to move through the program one step at a time. The highlighted line is the one Python is **about to run**, and the output panel shows what has been printed so far.

```python trace title="Watch Python read the program"
print("Engines on")
# The next line is a comment, so Python skips it
# print("Engines off")

print("Countdown started")
print("Liftoff!")
```

Look at what Python did. It ran line 1, then jumped straight to line 5. It did not stop on the comment lines or on the blank line. Those are not instructions, so Python ignores them.

%% key One line, one step, top to bottom
Python carries out one instruction at a time, from the first line to the last. To work out what a program prints, put your finger on the first line and follow it down, doing exactly what each line says.
%% end

## Comments are notes for humans

A **comment** is text that Python ignores completely. You write one by starting a line with a hash sign `#`. Everything from the `#` to the end of that line is the comment.

```python run
# This whole line is a comment, so Python ignores it
print("Comments are free")  # a comment can also follow some code
# print("This line is switched off")
```

Run it. Only one line of text is printed. The first line was never an instruction, the third line was written as a comment so it does nothing, and the comment after the `print` is only a note.

There are three common reasons to write comments.

1. **Explain why.** The code shows *what* happens, but only you know *why* you chose it. `# The rocket needs 10 seconds to warm up` is a useful note.
2. **Label sections.** In a longer program, short headings such as `# Print the report` help you find your way around.
3. **Switch a line off for a while.** Putting a `#` at the start of a line stops it running without deleting it. Programmers call this **commenting out** a line. It is handy when you want to test your program without one part of it.

%% tip A shortcut for comments
In the editor boxes on this site, press **Ctrl + /** (or **Cmd + /** on a Mac) to turn the line your cursor is on into a comment, and press it again to turn it back into code. Select several lines first to change all of them at once.
%% end

A good comment adds information that the code does not already show. Compare these two:

```python
# Print "Hello"
print("Hello")
```

```python
# Greet the player when the game starts
print("Hello")
```

The first comment only repeats the code, so it is noise. The second explains the purpose. Aim for the second kind.

%% question q-comment-predict | predict
What does this program print?

```python
print("A")  # print("B")
# print("C")
print("D")
```
%% answer
A
D
%% explain
The `# print("B")` part is a comment that follows the first line of code, so only `print("A")` runs there. The second line is a comment in full, and `print("D")` runs last. Nothing in the comments is printed.
%% end

## Blank lines and spacing

Python ignores blank lines too. Use them to group related lines, the same way you would use paragraphs in an essay.

```python run
# Set the scene
print("The rover lands on a red planet.")
print("It is very quiet.")

# Start the mission
print("Beep. Beep. Beep.")
```

Spaces inside a line are mostly your choice, but spaces at the **start** of a line are not. In Python, a line that starts further to the right than the one before it means something special, which you will learn when you meet decisions and loops. For now, keep every line of your programs flush against the left edge. You will see the error that extra spaces cause in the next lesson.

## Controlling how print() ends a line

So far each `print()` has given you a new line, and each comma has put a space between two things. Both of these are **defaults**, which are the choices Python makes when you do not say otherwise. You can change them with two named options, `sep` and `end`.

**`sep`** is the *separator*, the text placed between the things you print.

```python run
print("red", "green", "blue")
print("red", "green", "blue", sep=", ")
print("red", "green", "blue", sep=" | ")
print("2030", "01", "15", sep="-")
print("a", "b", "c", sep="")
```

The last line uses an empty separator, so the letters are glued together.

**`end`** is the text printed **after** everything else. Normally it is a new line, which is why each `print()` starts on a fresh row. If you set `end` to something else, the next `print()` carries on from the same spot.

```python run
print("Loading", end="...")
print("done")
print("Roger", end=" ")
print("that")
```

The options always come **after** the things you want to print, and they are written as `name=value`. Text values need quotation marks, like any other text.

A new line is really a special character that you can write as `\n`. If you put it inside the text, it starts a new line at that spot, and the whole thing is still one `print()`.

```python run
print("Line one\nLine two\nLine three")
```

%% question q-sep-choice | choice
What does `print("x", "y", sep="")` display?
%% choice
`x y`
%% choice correct
`xy`
%% choice
`x,y`
%% choice
`x` on one line and `y` on the next
%% explain
`sep` is placed between the items. Here it is set to an empty string, so there is nothing between `x` and `y` and they are joined as `xy`. The default separator would have been a single space.
%% end

%% question q-end-predict | predict
What does this program print?

```python
print("Hi", end="!")
print("Bye")
```
%% answer
Hi!Bye
%% explain
The first `print()` ends with `!` instead of a new line, so the second `print()` carries on from the same spot. The result is one line: `Hi!Bye`.
%% end

## Your turn

%% exercise comment-out | Switch a line off
This program is meant to print three lines, but the self-destruct line must **not** run. Do not delete it. Turn it into a comment instead, so the line stays in the file but does nothing.

```output
Mission start
Engine test
Mission complete
```
%% starter
print("Mission start")
print("Engine test")
print("Self destruct")
print("Mission complete")
%% solution
print("Mission start")
print("Engine test")
# print("Self destruct")
print("Mission complete")
%% tests
expect_output("Mission start\nEngine test\nMission complete")
check("Self destruct" in source(), "the self-destruct line is still in the file")
check("#" in source(), "uses a comment")
%% hint
A comment starts with `#`. Put one at the very start of the line you want to switch off.
%% hint
Click on the self-destruct line and press Ctrl + / (Cmd + / on a Mac), or type `# ` in front of it.
%% end

%% exercise add-comments | Explain your code
The program below works, but nobody can tell what it is for. Add at least **two comments** that explain it. For example, give each group of lines a short heading. The output must stay exactly the same.

```output
Rover online
Battery: 100
Rover ready
```
%% starter
print("Rover online")

print("Battery:", 100)

print("Rover ready")
%% solution
# Wake up the rover
print("Rover online")

# Report the battery level
print("Battery:", 100)

# Finish the checks
print("Rover ready")
%% tests
expect_output("Rover online\nBattery: 100\nRover ready")
check(source().count("#") >= 2, "has at least two comments")
check(len([ln for ln in source().splitlines() if ln.strip().startswith("#") and len(ln.strip()) > 4]) >= 2, "the comments are more than a # sign")
%% hint
Start a line with `#` and then write a short sentence about the lines that follow it.
%% hint
Write one comment above each group of lines, such as `# Report the battery level`. Do not change the `print()` lines.
%% end

%% exercise date-sep | Dates with dashes
Print the date 15 January 2030 in this format. Give `print()` three separate pieces of text and use the `sep` option, so you do not type any dashes inside the quotation marks.

```output
2030-01-15
```
%% starter
# Use print() with three pieces of text and sep
%% solution
print("2030", "01", "15", sep="-")
%% tests
expect_output("2030-01-15")
check(uses("keyword"), "uses the sep option")
check(calls("print"), "uses print()")
check("-" not in source().replace('sep="-"', "").replace("sep='-'", ""), "no dashes typed inside the text")
%% hint
Give `print()` the three pieces of text, separated by commas: `"2030"`, `"01"` and `"15"`.
%% hint
After the three pieces, add a named option: `sep="-"`. The dash goes inside its own quotation marks.
%% end

%% exercise countdown | Challenge: countdown on one line
Print a countdown on a **single line**, using four separate `print()` calls, one for each word. Use the `end` option so that each call carries on from the one before.

```output
3... 2... 1... Liftoff!
```
%% starter
# Four print() calls, all on one line of output.

%% solution
print("3...", end=" ")
print("2...", end=" ")
print("1...", end=" ")
print("Liftoff!")
%% tests
expect_output("3... 2... 1... Liftoff!")
check(source().count("print(") >= 4, "uses four print() calls")
check(uses("keyword"), "uses the end option")
%% hint
Each of the first three calls should end with a space instead of a new line.
%% hint
`print("3...", end=" ")` prints `3...` followed by a space and stays on the same line. Do the same for `2...` and `1...`.
%% hint
The last call does not need `end` at all, because the line should finish after `Liftoff!`.
%% end

## What you learned

- Python runs a program from the first line to the last, one line at a time. The order of your lines is the order of the actions.
- A comment starts with `#`. Python ignores it. Use comments to explain *why*, to label sections and to switch a line off.
- Blank lines are ignored, so you can use them to group your code. Keep lines flush with the left edge for now.
- `sep` changes what goes **between** the things you print, and `end` changes what comes **after** them.
- `\n` inside text starts a new line.
