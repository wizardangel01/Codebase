---
title: Loops: module quiz
pass: 70
---
Twelve questions on everything in this module: for loops, while loops, nested loops and the loop recipes. Work through each program step by step before you choose an answer, and read the explanations, because they show the reasoning.

%% question q1 | choice
Which numbers does `range(3, 8)` produce?
%% choice
3, 4, 5, 6, 7, 8
%% choice correct
3, 4, 5, 6, 7
%% choice
4, 5, 6, 7, 8
%% choice
3, 5, 7
%% explain
The first number is where counting starts, and the second number is where it stops. The stop number is never included, so the sequence ends at 7.
%% end

%% question q2 | predict
What does this program print?

```python
total = 0
for i in range(1, 5):
    total += i * i
print(total)
```
%% answer
30
%% explain
The loop variable takes the values 1, 2, 3 and 4. The program adds their squares: 1 + 4 + 9 + 16 = 30.
%% end

%% question q3 | multi
Select every loop that runs its body exactly 4 times.
%% choice correct
`for i in range(4):`
%% choice
`for i in range(1, 4):`
%% choice correct
`for i in range(1, 5):`
%% choice correct
`for i in range(0, 8, 2):`
%% choice
`for i in range(4, 0):`
%% explain
`range(4)` gives 0 to 3, `range(1, 5)` gives 1 to 4, and `range(0, 8, 2)` gives 0, 2, 4 and 6. The loop over `range(1, 4)` runs 3 times. The loop over `range(4, 0)` never runs, because counting up from 4 never reaches a stop of 0.
%% end

%% question q4 | fill
Fill in the blank so the program prints `3`.

```python
count = 0
n = 3
while n ___ 0:
    n -= 1
    count += 1
print(count)
```
%% answer
>
%% expected
3
%% explain
The loop must run while `n` is above 0. With `n` equal to 3, 2 and 1 the loop body runs three times, and when `n` reaches 0 the condition is false.
%% end

%% question q5 | order
Put the lines in order so that the program counts down and then prints `Lift off!`. One line does not belong.
%% lines
n = 3
while n > 0:
    print(n)
    n -= 1
print("Lift off!")
%% distractors
n += 1
%% expected
3
2
1
Lift off!
%% explain
The counter is set up first. The `while` line comes next, followed by its indented body, which prints the number and then makes it smaller. The last line is not indented, so it runs once after the loop. The line `n += 1` would make `n` grow and the loop would never end.
%% end

%% question q6 | choice
Which statement ends a loop immediately?
%% choice
`continue`
%% choice correct
`break`
%% choice
`pass`
%% choice
`stop`
%% explain
`break` leaves the loop at once. `continue` only skips the rest of the current round. `pass` does nothing, and `stop` is not a Python keyword.
%% end

%% question q7 | predict
What does this program print?

```python
count = 0
for a in range(1, 4):
    for b in range(a):
        count += 1
print(count)
```
%% answer
6
%% explain
The inner loop runs `a` times, and `a` is 1, 2 and 3 in the three rounds of the outer loop. The body runs 1 + 2 + 3 = 6 times.
%% end

%% question q8 | choice
Which two operations peel the digits off a whole number one at a time?
%% choice
`+ 10` and `- 10`
%% choice correct
`% 10` to get the last digit and `// 10` to remove it
%% choice
`* 10` and `/ 10`
%% choice
`** 10` and `% 2`
%% explain
The remainder after dividing by 10 is the last digit, and whole-number division by 10 throws that digit away. Repeating both steps in a `while` loop visits every digit.
%% end

%% question q9 | predict
What does this program print?

```python
n = 0
total = 0
while n < 6:
    n += 1
    if n % 2 == 0:
        continue
    total += n
print(total)
```
%% answer
9
%% explain
The loop visits n = 1 to 6. Even values are skipped by `continue`, so only 1, 3 and 5 are added: 1 + 3 + 5 = 9.
%% end

%% question q10 | choice
Which line makes `random` produce the same numbers in the same order every time the program runs?
%% choice
`random.repeat(5)`
%% choice correct
`random.seed(5)`
%% choice
`random.fix(5)`
%% choice
`random.randint(5)`
%% explain
`random.seed(x)` starts the generator from a fixed state, so the sequence of numbers is repeatable. The other names do not exist, or they do something else.
%% end

%% question q11 | multi
Select every statement that is true.
%% choice correct
A `for` loop over `range(5)` cannot run for ever.
%% choice correct
A `while` loop checks its condition before each round.
%% choice
In nested loops, a `break` in the inner loop also ends the outer loop.
%% choice correct
`continue` skips the rest of the current round.
%% choice
The stop number in `range(a, b)` is included.
%% explain
A range is finite, so a `for` loop over it ends. A `while` loop tests the condition first. A `break` only ends the innermost loop that contains it, and the stop number of a range is never included.
%% end

%% question q12 | choice
You add up numbers in a loop. Where does the line `total = 0` belong?
%% choice correct
Before the loop
%% choice
Inside the loop, as its first line
%% choice
After the loop
%% choice
It is not needed
%% explain
The accumulator must exist before the loop starts, and it must not be reset in every round. Inside the loop it would be set back to 0 each time, and you would only keep the last number.
%% end
