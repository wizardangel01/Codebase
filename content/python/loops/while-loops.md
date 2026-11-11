---
title: while loops
---
A `for` loop is perfect when you know how many rounds you need. Often you do not. A game keeps running until the player quits. A login screen keeps asking until the password is right. A savings plan keeps going until the money reaches a target. For jobs like these Python has the `while` loop, which repeats **as long as a condition is true**.

In this lesson you learn how a `while` loop works, how to avoid loops that never end, how to leave a loop early with `break` and `continue`, and how to read input until it is valid.

## Repeat while a condition is true

A `while` loop looks like an `if` statement, with `while` in place of `if`. Run it:

```python run
count = 1
while count <= 3:
    print("Round", count)
    count += 1
print("Done")
```

Python checks the condition before **every** round, including the first one. While it is true, the indented body runs again. When it becomes false, Python moves on to the first line after the loop. Step through the program to see the checks:

```python trace title="Follow the condition"
count = 1
while count <= 3:
    print("Round", count)
    count += 1
print("Done")
```

A `while` loop has three ingredients. The variable that the condition looks at must be **set up** before the loop (`count = 1`). The condition **tests** it (`count <= 3`). And the body must **change** it (`count += 1`), so that the condition can eventually become false. If the condition is false at the very start, the body never runs at all.

## Loops that never end

What happens if the body forgets to change anything? The condition stays true for ever, and the program repeats the body without stopping. This is an **infinite loop**:

```python
count = 1
while count <= 3:
    print("Round", count)
# Nothing changes count, so this never ends!
```

On this site a program that runs for more than 10 seconds is stopped automatically and you see a message. On your own computer you stop a runaway program by pressing **Ctrl+C** in the terminal. Infinite loops are a bug that every programmer meets, so learn the three usual causes:

- The update line is missing, as above.
- The update changes the wrong variable.
- The update goes the wrong way, for example `n += 1` in a loop that waits for `n` to fall below zero.

%% question q-infinite | choice
Why does this program never finish?

```python
n = 10
while n > 0:
    print(n)
```
%% choice
Because `print` cannot be used inside a loop.
%% choice correct
Because nothing in the body changes `n`, so the condition stays true.
%% choice
Because `n > 0` is not a valid condition.
%% choice
Because the loop needs a `for` first.
%% explain
The value of `n` is 10 in every round, and 10 is always greater than 0. Adding `n -= 1` inside the loop would make `n` shrink until the condition becomes false.
%% end

## When you do not know the number of rounds

Some questions cannot be turned into a fixed count. How many times can you halve 100 before you reach 1? How many years until savings double? A `while` loop keeps going until the answer is found:

```python run
amount = 100
while amount > 1:
    amount = amount // 2
    print(amount)
```

```python run
balance = 1000
years = 0
while balance < 2000:
    balance = balance * 1.1
    years += 1
print("At 10% a year the money doubles after", years, "years.")
```

The second program is a good model for many tasks: set a counter, loop until the goal is reached, and report the counter at the end.

%% question q-while-predict | predict
What does this program print?

```python
n = 1
while n < 20:
    n *= 3
print(n)
```
%% answer
27
%% explain
The value of `n` goes 1, 3, 9 and 27. After 27 the condition `n < 20` is false, so the loop ends and the program prints 27. Notice that the loop overshoots the limit: 27 is the first value that is not below 20.
%% end

## break: leave the loop now

The statement `break` ends the loop immediately, even when the condition is still true. It is perfect for a search that can stop as soon as it finds what it wants:

```python run
number = 1
while number < 100:
    if number % 7 == 0 and number % 5 == 0:
        print("First multiple of both 5 and 7:", number)
        break
    number += 1
```

Without `break` the program would carry on counting to 99 for no reason. With it, the loop stops at 35.

## continue: skip to the next round

The statement `continue` skips the rest of the body and jumps to the next round. It works in `for` loops and `while` loops alike:

```python run
for n in range(1, 10):
    if n % 3 == 0:
        continue
    print(n)
```

The multiples of 3 are skipped, so the output is 1, 2, 4, 5, 7 and 8.

%% question q-continue | predict
What does this program print?

```python
total = 0
for n in range(1, 6):
    if n == 3:
        continue
    total += n
print(total)
```
%% answer
12
%% explain
Without `continue` the total would be 1 + 2 + 3 + 4 + 5 = 15. In the round where `n` is 3, `continue` skips the addition, so the total is 15 - 3 = 12. Changing `continue` to `break` would stop the loop at 3 and give 1 + 2 = 3.
%% end

## Reading until you are told to stop

Programs that talk to people often use `while True`. The condition `True` is never false, so the loop runs for ever, until a `break` inside it ends the job. This is how you read input until the user types a special word, called a **sentinel**:

```python run stdin="4\n6\n10\nstop"
total = 0
while True:
    text = input("Number (or stop): ")
    if text == "stop":
        break
    total += int(text)
print("Total:", total)
```

The same pattern repeats a question until the answer is acceptable. Combine it with `.isdigit()` from the last module:

```python run stdin="abc\n-5\n42"
while True:
    text = input("Your age: ")
    if text.isdigit():
        age = int(text)
        break
    print("Digits only, please.")
print("Age accepted:", age)
```

The two wrong answers are rejected with a message, and the loop asks again. Only a valid answer reaches the `break`. Programs that never trust the first answer from a user are much harder to crash.

## for or while?

Both loops repeat, so how do you choose?

| Question | Use |
| --- | --- |
| Do I know how many rounds there are? | `for` with `range` |
| Do I visit every character of a string? | `for` |
| Do I repeat until something happens? | `while` |
| Do I wait for a valid answer? | `while True` with `break` |

A `for` loop is safer because it cannot run for ever. Use `while` when the number of rounds depends on what happens along the way.

%% question q-which-loop | choice
Which loop is the best fit for "ask the user for a password until it is correct"?
%% choice
`for i in range(10):`
%% choice correct
`while True:` with a `break` when the password is correct
%% choice
`for letter in password:`
%% choice
`for i in range(1, 100):`
%% explain
Nobody knows how many attempts the user will need, so a counted `for` loop does not fit. A `while` loop keeps asking until the answer is right, and the `break` leaves the loop at that moment.
%% end

## Your turn

%% exercise first-over | First power of two
Read a whole number `target`. Start with `n = 1` and keep doubling it while it is **not greater than** the target. Print the first value of `n` that is greater than the target. For the input `100` the program prints:

```output
128
```
%% stdin
100
%% starter
# Keep doubling n until it is bigger than the target.

%% solution
target = int(input())
n = 1
while n <= target:
    n *= 2
print(n)
%% tests
expect_output("128")
check(rerun("1").strip() == "2", "a target of 1")
check(rerun("1000").strip() == "1024", "a target of 1000")
check(rerun("0").strip() == "1", "a target of 0: the loop never runs")
check(uses("While"), "uses a while loop")
%% hint
The loop keeps going while `n <= target`.
%% hint
The body doubles `n`. You can write `n *= 2`.
%% hint
Print `n` after the loop, not inside it.
%% end

%% exercise sum-until-zero | Sum until zero
Read whole numbers, one per line, until the number 0 appears. Print the sum of all the numbers before the 0. For the input `5`, `3` and `0` the program prints:

```output
8
```
%% stdin
5
3
0
%% starter
# Read numbers until 0, then print the total.

%% solution
total = 0
number = int(input())
while number != 0:
    total += number
    number = int(input())
print(total)
%% tests
expect_output("8")
check(rerun("0").strip() == "0", "an empty list of numbers")
check(rerun("10\n20\n30\n0").strip() == "60", "10, 20 and 30")
check(rerun("-4\n4\n0").strip() == "0", "negative numbers cancel")
check(uses("While"), "uses a while loop")
%% hint
Read the first number before the loop, and read the next number at the end of every round.
%% hint
The loop condition is `number != 0`. The body adds `number` to the total.
%% hint
Do not forget the last line of the body: `number = int(input())`. Without it the loop never ends.
%% end

%% exercise valid-pin | Valid PIN
Read lines of text until a line is exactly `1234`. For every wrong line print `Wrong PIN`. When the right PIN arrives, print `Welcome`. For the input `1111`, `2222` and `1234` the program prints:

```output
Wrong PIN
Wrong PIN
Welcome
```
%% stdin
1111
2222
1234
%% starter
# Keep reading until the PIN is right.

%% solution
pin = input()
while pin != "1234":
    print("Wrong PIN")
    pin = input()
print("Welcome")
%% tests
expect_output("Wrong PIN\nWrong PIN\nWelcome")
check(rerun("1234").strip() == "Welcome", "the right PIN at once")
check(rerun("0000\n1234").strip() == "Wrong PIN\nWelcome", "one wrong try")
check(rerun("1234 \n1234").strip() == "Wrong PIN\nWelcome", "a trailing space makes the PIN wrong")
%% hint
Read one line before the loop, and read again at the end of every round.
%% hint
The loop runs while the PIN is **not** `"1234"`. Print `Wrong PIN` inside it.
%% hint
Print `Welcome` after the loop has finished.
%% end

%% exercise halvings | Challenge: Halvings
Read a whole number `n` that is at least 1. Count how many times you can halve it with `//` 2 before it reaches 1, and print the count. For 100 the steps are 100, 50, 25, 12, 6, 3 and 1, which is 6 halvings. For the input `100` the program prints:

```output
6
```
%% stdin
100
%% starter
# Count the halvings.

%% solution
n = int(input())
count = 0
while n > 1:
    n = n // 2
    count += 1
print(count)
%% tests
expect_output("6")
check(rerun("1").strip() == "0", "1 needs no halvings")
check(rerun("2").strip() == "1", "2 needs one halving")
check(rerun("1024").strip() == "10", "1024 needs ten halvings")
check(rerun("1000").strip() == "9", "1000 needs nine halvings")
%% hint
You need a counter that starts at 0 and a loop that runs while `n > 1`.
%% hint
Inside the loop, halve `n` with `n = n // 2` and add 1 to the counter.
%% hint
Print the counter after the loop.
%% end

## What you learned

- `while condition:` repeats its block for as long as the condition is true. The condition is checked before every round.
- The variable in the condition must be set up before the loop and changed inside it. If nothing changes it, the loop never ends.
- On this site a program is stopped after 10 seconds. On your own computer, Ctrl+C stops a runaway loop.
- `break` leaves the loop at once. `continue` skips to the next round.
- `while True` with a `break` is the pattern for reading until a sentinel word, or until the input is valid.
- Use `for` when you know the number of rounds, and `while` when you repeat until something happens.
