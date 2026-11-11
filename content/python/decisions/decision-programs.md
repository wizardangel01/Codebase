---
title: Programs that decide
---
You now own every tool for making decisions: comparisons, `if`, `elif`, `else`, `and`, `or` and `not`. This lesson puts them to work. You will build four complete programs, the kind you could show to a friend: a report card, a leap-year checker, a login screen and a small text adventure.

Along the way you will pick up the habits that separate a program that works from one that only seems to: planning the cases before you type, ordering your questions with care, checking input before you trust it, and testing the edges where bugs like to hide.

## Plan the cases first

Beginners often start typing the moment they read a task. Experienced programmers reach for a table first. A **decision table** lists every case the program must handle and the answer it must give. This one is for a report card:

| Average mark | Grade |
| --- | --- |
| 90 or more | A |
| 75 to 89 | B |
| 50 to 74 | C |
| below 50 | F |

With the table in front of you, the program nearly writes itself: one branch for each row, from the most demanding row to the least demanding. When a branch misbehaves later, you can point at the row it was supposed to cover.

Follow these four steps for any program that decides:

1. Write down what goes in and what must come out.
2. List the cases in a table, including the awkward ones: zero, the exact limit, an empty answer.
3. Turn each row into a branch, and put the most specific question first.
4. Test every branch, and test the places where two branches meet.

## Program 1: a report card

The program reads a name and two marks, works out the average and chooses the grade from the table. Press **Run** and read the output:

```python run stdin="Ada\n78\n91"
name = input("Name: ")
maths = int(input("Maths mark: "))
english = int(input("English mark: "))

average = (maths + english) / 2

if average >= 90:
    grade = "A"
elif average >= 75:
    grade = "B"
elif average >= 50:
    grade = "C"
else:
    grade = "F"

print(f"{name}: average {average:.1f}, grade {grade}")
```

Notice the shape. First the program collects its input, then it calculates, then it decides, and only at the end does it print. Keeping those jobs in separate blocks, with a blank line between them, makes a program much easier to read and to change. To adjust a grade boundary later, you only touch the decision block.

Change the marks in the code to 95 and 100, and then to 40 and 45, to see the other branches run.

## Program 2: leap years

Almost every programmer meets the leap-year puzzle once. A year is a **leap year** (366 days) when it divides by 4, with one exception: a century year, such as 1900 or 2100, is a leap year only when it also divides by 400. A table of test years makes the rule clear:

| Year | Divides by 4? | By 100? | By 400? | Leap year? |
| --- | --- | --- | --- | --- |
| 2023 | no | no | no | no |
| 2024 | yes | no | no | yes |
| 1900 | yes | yes | no | no |
| 2000 | yes | yes | yes | yes |

The special cases are the most specific, so the program asks about them first. Step through the trace to see which question catches the year 1900:

```python trace title="Which question catches 1900?"
year = 1900
if year % 400 == 0:
    leap = True
elif year % 100 == 0:
    leap = False
elif year % 4 == 0:
    leap = True
else:
    leap = False
print(leap)
```

Python asks about 400 first (no), then about 100 (yes), so it stops there with `leap = False`. The question about 4 is never reached. Now run the full program with a year typed by the user:

```python run stdin="1900"
year = int(input("Year: "))
if year % 400 == 0:
    leap = True
elif year % 100 == 0:
    leap = False
elif year % 4 == 0:
    leap = True
else:
    leap = False
print(year, "is a leap year" if leap else "is not a leap year")
```

If you swapped the first two questions, the year 2000 would divide by 100 and be called "not leap" before the 400 test ever ran. The order of the questions is part of the logic.

%% question q-leap-order | choice
Why does the leap-year chain ask about 400 before it asks about 100?
%% choice
Because 400 is a bigger number than 100.
%% choice correct
Because a year such as 2000 also divides by 100, so the 100 question would answer first and give the wrong result.
%% choice
Because Python always checks the biggest number first.
%% choice
It does not matter, because either order gives the same answers.
%% explain
Every year that divides by 400 also divides by 100. If the 100 question came first, the year 2000 would be caught by it and labelled "not leap". The more specific question has to go first.
%% end

There is a second correct way to write the same decision, using the operators from the last lesson:

```python run stdin="2024"
year = int(input("Year: "))
leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
print(leap)
```

Both versions give the same answers. The chain reads like the rule written in words, which makes it easier to check against the table. The one-liner is shorter, but you have to stop and think about the brackets. When two designs are both correct, choose the one you will still understand in a month.

## Program 3: a login check

A login screen asks two questions at once: is the username right, and is the password right? Both must be true, which is a job for `and`. Run the program, then change the code so that a different password is accepted, and run it again:

```python run stdin="ADA\nswordfish"
username = input("Username: ").strip().lower()
password = input("Password: ")
if username == "ada" and password == "swordfish":
    print("Welcome back, Ada!")
else:
    print("Wrong username or password.")
```

Three details are worth copying. The username is cleaned with `.strip().lower()`, so accidental spaces and capital letters do not lock people out. The password is **not** cleaned, because passwords are case sensitive and a space may be part of one. And the program prints a single message for both kinds of mistake, so it never tells a stranger which half was correct.

%% warn Never keep real passwords in your code
This program stores the password inside the code so that you can practise decisions. A real website never does that, because anyone who can read the code can read the password. Treat this as an exercise, not as a pattern to copy.
%% end

## Check before you convert

Typing `int("abc")` stops a program with a ValueError. You can avoid the crash by checking the text before you convert it. The string method `.isdigit()` answers `True` when a piece of text is made of digits only:

```python run
print("2024".isdigit())
print("20 24".isdigit())
print("3.5".isdigit())
print("-4".isdigit())
print("".isdigit())
```

Only the digits 0 to 9 pass. A space, a decimal point, a minus sign or an empty answer all fail the test, so `.isdigit()` suits whole numbers that cannot be negative, such as an age or a number of tickets. Combined with an `if`, it protects the conversion:

```python run stdin="12a"
text = input("Your age: ").strip()
if text.isdigit():
    age = int(text)
    print("Next year you will be", age + 1)
else:
    print("Please type digits only.")
```

Change the typed answer to `12` in your head and trace the other branch. Later in the course you will meet a more flexible way to handle bad input, but this check is the right tool for now.

%% question q-isdigit | predict
What does this program print?

```python
print("42".isdigit(), "4.2".isdigit(), "".isdigit())
```
%% answer
True False False
%% explain
`"42"` is made of digits only, so the first answer is `True`. `"4.2"` contains a decimal point, which is not a digit. The empty string has no digits at all, so it fails too. `print` separates the three answers with spaces.
%% end

## Separate ifs or one chain?

So far every decision picked **one** outcome. Sometimes several things can be true at the same time, and each one should have its effect. A pizza can have extra cheese and olives. A shopper can be a student and a member of the loyalty club. These are independent questions, so they need separate `if` statements:

```python run stdin="yes\nyes"
price = 2000
extra_cheese = input("Extra cheese? (yes/no) ").strip().lower() == "yes"
olives = input("Olives? (yes/no) ").strip().lower() == "yes"
if extra_cheese:
    price += 300
if olives:
    price += 200
print("Total:", price)
```

If the second `if` were an `elif`, a customer who asked for both extras would pay for the cheese only, because a chain stops at the first match. Here is the rule of thumb:

| Shape | What happens |
| --- | --- |
| `if` ... `elif` ... `else` | exactly one block runs |
| `if` ... `if` ... `if` | every block whose condition is true runs |

%% question q-two-ifs | predict
What does this program print?

```python
bonus = 0
points = 120
if points >= 100:
    bonus += 10
if points >= 50:
    bonus += 5
elif points >= 20:
    bonus += 1
print(bonus)
```
%% answer
15
%% explain
The first `if` is a chain of its own and adds 10. The second `if` starts a new chain: 120 is at least 50, so it adds 5, and its `elif` is skipped. The total is 15.
%% end

## Program 4: a text adventure

Decisions inside decisions make stories. Each `input()` is a choice made by the player, and each branch is a different scene. Before you write a story program, draw it as a map. This is the map of our adventure:

```text
cave
 |-- left  --> chest
 |              |-- open  --> win
 |              |-- leave --> lost
 |              |-- other --> torch goes out
 |-- right --> dragon --> run back
 |-- other --> nothing happens
```

Every arrow in the map becomes a branch in the code, and every extra level of indentation takes the player one step deeper into the story. Play it:

```python run stdin="left\nopen"
print("You wake up in a cave. A tunnel goes left and another goes right.")
choice = input("Which way? (left/right) ").strip().lower()
if choice == "left":
    print("You find a wooden chest.")
    action = input("Open it or leave it? (open/leave) ").strip().lower()
    if action == "open":
        print("Inside is a golden key. You win!")
    elif action == "leave":
        print("You walk on and get lost. The end.")
    else:
        print("You hesitate until your torch goes out. The end.")
elif choice == "right":
    print("You hear a growl. A dragon blocks the way!")
    print("You run back. The end.")
else:
    print("You stand still and nothing happens. The end.")
```

Change the code to play a different path: use `right`, or `left` followed by `leave`, or an answer the author did not plan for. Every reply the player could type has somewhere to go, because each chain finishes with an `else`. That habit matters: an `else` is your safety net for answers you did not expect.

## Test the edges

Most bugs in decision programs sit on the boundary between two cases. Look at this program, which is meant to let in anyone who is 18 or older:

```python run
age = 18
if age > 18:
    print("Come in")
else:
    print("Too young")
```

It turns away an 18-year-old, because `>` leaves the limit out. The fix is `>=`. To catch bugs like this one, test three values around every limit: one below, one on it and one above. For `age >= 18` the test ages are 17, 18 and 19.

Use this checklist for every decision program you write:

- Run each branch at least once, including the `else`.
- Test the exact limits, with one value below and one above.
- Try the awkward answers: zero, a negative number, capital letters, an empty reply.
- Say the expected output aloud before you press **Run**. If the program surprises you, find out why before you change anything.

%% question q-boundary | choice
A cinema admits people aged 18 or over. Which set of test ages checks the boundary best?
%% choice
5, 30 and 60
%% choice correct
17, 18 and 19
%% choice
0, 100 and 1000
%% choice
18, 18 and 18
%% explain
Bugs in decisions hide at the limit, so test the value below it, the limit itself and the value above it. Ages 17, 18 and 19 would expose a `>` that should have been `>=`. The other sets never touch the boundary.
%% end

## Your turn

%% exercise leap-year | Leap year
Read a year and print `leap` if it is a leap year, or `not leap` if it is not. A year is a leap year when it divides by 4, except that a century year (one that divides by 100) must also divide by 400. For the input `2024` the program prints:

```output
leap
```
%% stdin
2024
%% starter
# Read the year and decide.

%% solution
year = int(input())
if year % 400 == 0:
    print("leap")
elif year % 100 == 0:
    print("not leap")
elif year % 4 == 0:
    print("leap")
else:
    print("not leap")
%% tests
expect_output("leap")
check(rerun("2023").strip() == "not leap", "2023 is not a leap year")
check(rerun("1900").strip() == "not leap", "1900 is a century that does not divide by 400")
check(rerun("2000").strip() == "leap", "2000 divides by 400")
check(rerun("2100").strip() == "not leap", "2100 is not a leap year")
check(rerun("1996").strip() == "leap", "1996 is a leap year")
%% hint
Convert the input to a whole number first, then ask the questions in order from the most specific to the least.
%% hint
Ask about 400 first, then about 100, then about 4. Each branch prints either `leap` or `not leap`.
%% hint
`if year % 400 == 0:` prints `leap`, `elif year % 100 == 0:` prints `not leap`, `elif year % 4 == 0:` prints `leap`, and `else:` prints `not leap`.
%% end

%% exercise login-check | Login check
Read a username on the first line and a password on the second line. Access is granted when the username is `admin` (capital letters and spaces around it do not matter) and the password is exactly `Open123`. Print `Access granted` or `Access denied`. For the input `Admin` and `Open123` the program prints:

```output
Access granted
```
%% stdin
Admin
Open123
%% starter
# Read the username, then the password.

%% solution
username = input().strip().lower()
password = input()
if username == "admin" and password == "Open123":
    print("Access granted")
else:
    print("Access denied")
%% tests
expect_output("Access granted")
check(rerun("  ADMIN \nOpen123").strip() == "Access granted", "spaces and capitals in the username are fine")
check(rerun("admin\nopen123").strip() == "Access denied", "the password is case sensitive")
check(rerun("guest\nOpen123").strip() == "Access denied", "a wrong username is refused")
check(rerun("admin\nOpen1234").strip() == "Access denied", "a wrong password is refused")
%% hint
Clean the username with `.strip().lower()`, but leave the password exactly as it was typed.
%% hint
Both checks must pass together, so join them with `and`.
%% hint
`if username == "admin" and password == "Open123":`
%% end

%% exercise safe-age | Safe age
Read one line of text. If it is made of digits only, print `Next year you will be N`, where `N` is the number plus 1. Otherwise print `Digits only, please.` For the input `12` the program prints:

```output
Next year you will be 13
```
%% stdin
12
%% starter
# Check the text before converting it.

%% solution
text = input().strip()
if text.isdigit():
    age = int(text)
    print(f"Next year you will be {age + 1}")
else:
    print("Digits only, please.")
%% tests
expect_output("Next year you will be 13")
check(rerun("abc").strip() == "Digits only, please.", "letters are refused")
check(rerun("3.5").strip() == "Digits only, please.", "a decimal point is not a digit")
check(rerun("-4").strip() == "Digits only, please.", "a minus sign is not a digit")
check(rerun("99").strip() == "Next year you will be 100", "99 becomes 100")
check(calls("isdigit"), "uses isdigit()")
%% hint
The condition is a method call: `text.isdigit()`.
%% hint
Convert with `int(text)` only inside the `if` block, after the check has passed.
%% hint
`print(f"Next year you will be {age + 1}")` goes inside the `if`, and `print("Digits only, please.")` goes in the `else`.
%% end

%% exercise pizza-price | Pizza price
A pizzeria sells three sizes: `small` for 2000 naira, `medium` for 3000 and `large` for 4000. Extra cheese costs 300 and olives cost 200. Read three lines: the size, then `yes` or `no` for extra cheese, then `yes` or `no` for olives. Capital letters do not matter. Print the total as a plain number. If the size is not one of the three, print `Unknown size` instead. For the input `medium`, `yes` and `no` the program prints:

```output
3300
```
%% stdin
medium
yes
no
%% starter
# Read the size, then the two extras.

%% solution
size = input().strip().lower()
extra_cheese = input().strip().lower() == "yes"
olives = input().strip().lower() == "yes"
if size == "small":
    price = 2000
elif size == "medium":
    price = 3000
elif size == "large":
    price = 4000
else:
    price = 0
if price == 0:
    print("Unknown size")
else:
    if extra_cheese:
        price += 300
    if olives:
        price += 200
    print(price)
%% tests
expect_output("3300")
check(rerun("small\nno\nno").strip() == "2000", "a plain small pizza")
check(rerun("large\nyes\nyes").strip() == "4500", "a large pizza with both extras")
check(rerun("small\nno\nyes").strip() == "2200", "olives only")
check(rerun("LARGE\nno\nno").strip() == "4000", "capital letters do not matter")
check(rerun("huge\nyes\nyes").strip() == "Unknown size", "an unknown size")
%% hint
Use an `if`, `elif` and `else` chain for the size, and two separate `if` statements for the extras, because a customer can ask for both.
%% hint
Give `price` a starting value of 0 in the `else` branch. Then you can tell afterwards whether the size was recognised.
%% hint
Add 300 with `if extra_cheese:` and 200 with a second, separate `if olives:`.
%% end

%% exercise fizz-buzz | Challenge: Fizz Buzz
Read a whole number. Print `FizzBuzz` if it divides by both 3 and 5, `Fizz` if it divides by 3 only, `Buzz` if it divides by 5 only, and the number itself in every other case. For the input `9` the program prints:

```output
Fizz
```
%% stdin
9
%% starter
# Decide what to print for one number.

%% solution
n = int(input())
if n % 15 == 0:
    print("FizzBuzz")
elif n % 3 == 0:
    print("Fizz")
elif n % 5 == 0:
    print("Buzz")
else:
    print(n)
%% tests
expect_output("Fizz")
check(rerun("15").strip() == "FizzBuzz", "15 divides by 3 and by 5")
check(rerun("10").strip() == "Buzz", "10 divides by 5 only")
check(rerun("7").strip() == "7", "7 prints itself")
check(rerun("30").strip() == "FizzBuzz", "30 divides by 3 and by 5")
check(rerun("1").strip() == "1", "1 prints itself")
%% hint
A number divides by 3 when `n % 3 == 0`. Think about which case is the most specific.
%% hint
Ask the "both" question first, because a number that divides by 15 also divides by 3 and by 5.
%% hint
Order of the questions: both (`n % 15 == 0`), then 3, then 5, then the `else` that prints `n`.
%% end

## What you learned

- Plan a decision program with a table of cases, then write one branch per row, with the most specific question first.
- The order of questions in an `elif` chain is part of the logic: the leap-year chain asks about 400 before 100.
- `.isdigit()` checks that text is made of digits only, so you can test input before you convert it.
- Use separate `if` statements when several things can be true at once, and an `if`/`elif`/`else` chain when exactly one outcome is wanted.
- Nested decisions build stories, and an `else` at the end of each chain catches answers you did not plan for.
- Test the edges: one value below, one on and one above every limit, and run every branch at least once.
