---
title: Variables
---
A calculator forgets everything the moment it shows an answer. A program does not have to. It can remember your score, the price of a ticket or the name of a player, and use them again ten lines later.

The tool for remembering is the **variable**: a name that you give to a value. Almost every program you will ever read or write is full of them, so this lesson is worth going slowly. By the end you will be able to store values, change them, choose good names, and watch Python keep track of everything one step at a time.

## A name for a value

Here are two lines of Python that you could not write in module 1:

```python run
price = 250
print(price)
```

The first line is an **assignment**. It tells Python: "let the name `price` stand for the number 250". The name goes on the left, the value on the right, and the `=` sign sits between them. The second line prints whatever `price` stands for, so you see `250`.

Read `=` as "gets" or "is set to", never as "equals". In maths, `x = 5` states a fact. In Python it is an instruction that does something: it stores a value.

A good picture is a box with a label. The label is the variable name and the box holds one value. Once the label is on the box, you can use the name anywhere you could use the value:

```python run
price = 250
print(price * 3)
print(price + 50)
```

Change `250` to `400` and run it again. Every line that uses `price` now uses the new number. That is the whole point of a variable: you change a value in one place instead of in every line.

## Choosing names

Python lets you pick almost any name, within a few rules:

- Use letters, digits and underscores only: `score`, `player_2`, `_hidden`.
- A name cannot start with a digit, so `2nd_place` is an error.
- Capital letters matter: `Score` and `score` are two different names.
- No spaces or dashes: `total price` and `total-price` do not work.
- A few words belong to Python itself, such as `for`, `if` and `class`. You cannot use those as names.

Beyond the rules there is a habit that nearly every Python programmer shares. Names are written in **snake_case**: lower-case words joined by underscores, like `ticket_price`, `goals_scored` and `number_of_players`. A good name says what the value means. `ticket_price` tells the reader something; `x` makes them guess.

```python run
ticket_price = 1500
number_of_tickets = 4
print(ticket_price * number_of_tickets)
```

Now spell a name differently on two lines. Capital letters matter, so Python treats these as two different names:

```python run error
my_score = 10
print(my_Score)
```

The result is a **NameError**: Python has never heard of anything called `my_Score`. Python often suggests the name you probably meant, so read the message before you start hunting for the mistake.

%% question q-valid-names | multi
Select every valid variable name.
%% choice correct
`player_1`
%% choice correct
`max_speed`
%% choice
`1st_place`
%% choice
`total-cost`
%% choice
`class`
%% explain
`player_1` and `max_speed` follow the rules: letters, digits and underscores, and no digit at the start. `1st_place` starts with a digit. `total-cost` contains a dash, which Python reads as a minus sign, so it looks like a subtraction. `class` is a reserved word that Python uses to build classes (you will meet them in module 10), so it cannot be a name.
%% end

## Changing a variable

A variable holds one value at a time, and you can replace it whenever you like:

```python run
score = 0
print(score)
score = 10
print(score)
```

The second assignment throws the old value away. Python keeps no history. It is like crossing out what was in the box and writing something new.

The right-hand side of an assignment may use the variable itself, which looks odd the first time you see it. Step through this program and watch:

```python trace title="Watch score change"
score = 0
score = score + 10
score = score + 5
print(score)
```

On the second line Python works out the right-hand side first: the current value of `score` (0) plus 10 gives 10. Only then does it store 10 under the name `score`. The next line does the same again: 10 plus 5 gives 15. The right way to read `score = score + 10` is "the new score is the old score plus 10".

One more fact catches nearly everybody once. A variable stores a **value**, not a formula:

```python run
price = 5
quantity = 3
total = price * quantity
price = 10
print(total)
```

Run it before you read on. `total` was worked out once, when the third line ran, and it stays 15. Changing `price` afterwards does not recalculate it. If you want the new total, you have to write the calculation again.

%% question q-stale-total | predict
What does this program print?

```python
width = 4
height = 3
area = width * height
width = 10
print(area)
```
%% answer
12
%% explain
`area` was worked out on the third line, when `width` was 4, so it holds 12. Changing `width` to 10 later does not touch `area`. A variable keeps the value it was given, not the recipe that made it.
%% end

## Shortcuts for updating

Updating a variable from its own value is so common that Python has a shorter way to write it:

```python run
lives = 3
lives -= 1
print(lives)
lives += 5
print(lives)
```

`lives -= 1` means `lives = lives - 1`. It is called an **augmented assignment**. There is one for every arithmetic operator you know:

| Shortcut | Same as | Result when x starts at 10 |
| --- | --- | --- |
| `x += 3` | `x = x + 3` | 13 |
| `x -= 3` | `x = x - 3` | 7 |
| `x *= 3` | `x = x * 3` | 30 |
| `x /= 4` | `x = x / 4` | 2.5 |
| `x //= 3` | `x = x // 3` | 3 |
| `x %= 3` | `x = x % 3` | 1 |
| `x **= 2` | `x = x ** 2` | 100 |

Try several in a row. Work out the answer on paper first, then run it:

```python run
cookies = 20
cookies -= 4
cookies *= 2
cookies //= 5
print(cookies)
```

Each line changes the number the line before it left behind: 20 becomes 16, then 32, then 6.

%% question q-augment-fill | fill
Fill in the blank so the program prints `7`.

```python
lives = 10
lives ___ 3
print(lives)
```
%% answer
-=
%% expected
7
%% explain
`lives -= 3` is `lives = lives - 3`, so 10 becomes 7. With `+=` you would get 13, and a plain `=` would replace the value with 3.
%% end

## Several at once, and swapping

You can assign several names in one line, as long as there are as many names as values:

```python run
width, height = 8, 5
print(width * height)
```

You can also give several names the same starting value:

```python run
red = green = blue = 0
print(red, green, blue)
```

The first form leads to a neat trick. Two friends swap seats, and you need to swap what two variables hold. In many languages you need a third, temporary variable. In Python you do not, because the whole right-hand side is worked out before anything is stored:

```python trace title="Swap two values"
left = "tea"
right = "coffee"
left, right = right, left
print(left, right)
```

Step through the third line. Python first collects the pair `"coffee"` and `"tea"` from the right-hand side, and only then stores them back into `left` and `right`. Nothing is overwritten too early.

## Constants and tidy programs

Look at this program and ask yourself what the number 250 means:

```python run
meal = 3200
print(meal + 250)
```

A reader cannot tell. Is it a tip, a tax or a mistake? Programmers call a number that appears from nowhere a **magic number**. Give it a name and the mystery disappears:

```python run
SERVICE_CHARGE = 250
meal = 3200
print(meal + SERVICE_CHARGE)
```

By convention a value that should never change while the program runs is written in UPPER_CASE. This is a **constant**. Python does not enforce it: you could change `SERVICE_CHARGE` later and nothing would stop you. The capital letters are a message to people, "treat this as fixed", so a constant is a promise rather than a lock. If the charge rises to 300, you change one line instead of hunting for every 250.

Finally, remember from module 1 that Python reads from the top down. Using a name before it has been assigned is a NameError too:

```python run error
print(total)
total = 5
```

At the first line `total` does not exist yet. The fix is to assign before you use.

%% question q-constant | choice
Why does the program above use `SERVICE_CHARGE` instead of typing 250 wherever it is needed?
%% choice
Python only accepts capital letters for numbers that never change.
%% choice correct
The name says what the number means, and you can change it in one place.
%% choice
Constants make a program run faster.
%% choice
Python would refuse to run without it.
%% explain
A name explains the number and removes repetition. The capital letters are a habit that tells readers the value is fixed, but Python accepts any name and does not run faster or slower because of it.
%% end

## Your turn

%% exercise ticket-total | Ticket total
Tickets cost 1500 naira each. Store the price in a variable called `ticket_price`, then print the cost of 4 tickets.

```output
6000
```
%% starter
# Store the price in ticket_price, then print the cost of 4 tickets.

%% solution
ticket_price = 1500
print(ticket_price * 4)
%% tests
expect_output("6000")
check(ns.get("ticket_price") == 1500, "stores 1500 in ticket_price")
check(uses("Mult"), "multiplies the price by the number of tickets")
%% hint
Begin with the assignment: the name `ticket_price` on the left and the number on the right.
%% hint
Then print the price multiplied by 4.
%% hint
`print(ticket_price * 4)`
%% end

%% exercise score-keeper | Score keeper
A game starts with `score = 0`. Use augmented assignments (`+=`, `*=` and friends) to add 10, then add 25, then double the score. Print the final score.

```output
70
```
%% starter
score = 0
# Add 10, add 25, then double the score.

%% solution
score = 0
score += 10
score += 25
score *= 2
print(score)
%% tests
expect_output("70")
check(uses("AugAssign"), "uses an augmented assignment such as +=")
check(ns.get("score") == 70, "the variable score ends at 70")
%% hint
Each change is one line, and each line can use `+=` or `*=`.
%% hint
Adding 10 and then 25 makes 35. Doubling means multiplying by 2.
%% hint
The three changes are `score += 10`, `score += 25` and `score *= 2`. Print at the end.
%% end

%% exercise swap-seats | Swap seats
Ada sits in seat A and Tunde in seat B. Swap them so that `seat_a` holds `"Tunde"` and `seat_b` holds `"Ada"`, **without** typing either name a second time. Then print both seats on one line.

```output
Tunde Ada
```
%% starter
seat_a = "Ada"
seat_b = "Tunde"
# Swap the seats here, then print them.

%% solution
seat_a = "Ada"
seat_b = "Tunde"
seat_a, seat_b = seat_b, seat_a
print(seat_a, seat_b)
%% tests
expect_output("Tunde Ada")
check(ns.get("seat_a") == "Tunde" and ns.get("seat_b") == "Ada", "the seats are swapped")
check(source().count("Ada") == 1 and source().count("Tunde") == 1, "each name is typed only once")
%% hint
You need to change both variables in a single line.
%% hint
Remember `a, b = 1, 2`. What happens if the values on the right are the variables themselves?
%% hint
`seat_a, seat_b = seat_b, seat_a`
%% end

%% exercise pocket-money | Challenge: Pocket money
Zainab starts the week with 120 naira in `pocket_money`. Write a program that:

1. adds 50 naira for chores (use `+=`),
2. stores the price of a snack, 25, in a constant called `SNACK_PRICE`,
3. buys 3 snacks (use `-=` and `SNACK_PRICE`),
4. gives half of what is left to her sister with `//= 2`,
5. prints what Zainab has left.

```output
47
```
%% starter
pocket_money = 120
# Follow the five steps.

%% solution
pocket_money = 120
pocket_money += 50
SNACK_PRICE = 25
pocket_money -= 3 * SNACK_PRICE
pocket_money //= 2
print(pocket_money)
%% tests
expect_output("47")
check(ns.get("SNACK_PRICE") == 25, "stores 25 in SNACK_PRICE")
check(uses("AugAssign"), "uses augmented assignments")
check(uses("FloorDiv"), "halves the money with //=")
%% hint
After the chores money Zainab has 170. Take the snacks away from that, and write the snack price as a constant first.
%% hint
Three snacks cost `3 * SNACK_PRICE`, so the line is `pocket_money -= 3 * SNACK_PRICE`.
%% hint
Finish with `pocket_money //= 2` and then print the variable.
%% end

## What you learned

- A **variable** is a name for a value, created by assignment: `price = 250`.
- Names use letters, digits and underscores, cannot start with a digit, and are case sensitive. Write them in snake_case and make them say what the value means.
- A variable holds one value at a time. Assigning again replaces the old value, and the right-hand side is worked out before the new value is stored.
- A variable stores a value, not a formula. It does not update by itself when other variables change.
- `+=`, `-=`, `*=`, `/=`, `//=`, `%=` and `**=` update a variable from its own value.
- `a, b = 1, 2` assigns several names at once, and `a, b = b, a` swaps two values.
- UPPER_CASE names mark constants, and they replace magic numbers with names that explain themselves.
