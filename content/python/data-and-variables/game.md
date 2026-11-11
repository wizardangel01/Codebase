---
title: Cargo Bay
engine: judge
---
Welcome to the cargo bay of the space station **Aurora**. Ships arrive all day, and the station computer needs small Python programs to log what they bring. Each level is one job.

How to play:

- Your program reads its information with `input()`. Every call to `input()` reads **one line** of what the test provides.
- It shows its answer with `print()`. The judge compares what you print with the expected output.
- Some tests are **hidden**. They use other values, so typing the answer from the example does not work. Write a program that works for any values.
- Remember that `input()` always gives you **text**. Turn it into a number with `int()` or `float()` when you need to calculate.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Welcome aboard
A passenger steps off a ship. Read their **name**, then print a greeting in exactly this form:

```text
Welcome aboard, Ada!
```

Store what `input()` returns in a variable. Then put that variable into your greeting.
%% config
mode: io
par: 2
%% in Ada
Ada
%% out
Welcome aboard, Ada!
%% in Grace
Grace
%% out
Welcome aboard, Grace!
%% in hidden
Margaret Hamilton
%% out
Welcome aboard, Margaret Hamilton!
%% starter
# Read the name, then print the greeting.

%% solution
name = input()
print(f"Welcome aboard, {name}!")
%% hint
`name = input()` reads one line and stores it in the variable `name`.
%% hint
Then print the greeting. You can join the pieces with `+`, or use an f-string: `f"Welcome aboard, {name}!"`.
%% end

%% level l2 | Crate count
Two cargo bays each report how many crates they hold. Read both numbers (one per line) and print the **total** number of crates.

```text
12 and 30 give 42
```
%% config
mode: io
par: 3
%% in 12 and 30
12
30
%% out
42
%% in Empty bay
0
7
%% out
7
%% in hidden
250
1000
%% out
1250
%% starter
# Careful: input() gives text, and "12" + "30" is "1230".

%% solution
a = int(input())
b = int(input())
print(a + b)
%% hint
`input()` returns text. Adding two pieces of text joins them together, so you get `1230` instead of `42`.
%% hint
Convert each line with `int()` before you add: `a = int(input())`.
%% end

%% level l3 | Fuel bill
A tanker takes on fuel. Read the number of **litres** and the **price per litre** (both can have decimals). Print the total cost with exactly **two decimal places**, in this form:

```text
Total: 45.50
```

An f-string can format a number. Writing `{cost:.2f}` shows `cost` with two digits after the decimal point.
%% config
mode: io
par: 4
%% in 10 litres at 4.55
10
4.55
%% out
Total: 45.50
%% in 2.5 litres at 3
2.5
3
%% out
Total: 7.50
%% in hidden
100
1.299
%% out
Total: 129.90
%% starter
# litres, then price per litre

%% solution
litres = float(input())
price = float(input())
cost = litres * price
print(f"Total: {cost:.2f}")
%% hint
Use `float()` instead of `int()`, because the numbers can have a decimal point.
%% hint
Multiply the two numbers and keep the result in a variable, such as `cost`.
%% hint
Print with an f-string and a format: `print(f"Total: {cost:.2f}")`.
%% end

%% level l4 | Fuel gauge
The tank starts full. A pilot then reports three burns, one after another. After **each** burn, print how much fuel is left.

The first line of input is the fuel at the start. The next three lines are the three burns.
%% config
mode: io
par: 7
%% in 100 minus 20, 35 and 10
100
20
35
10
%% out
80
45
35
%% in A big tank
500
100
100
100
%% out
400
300
200
%% in hidden
60
5
10
15
%% out
55
45
30
%% starter
# The same variable can be updated again and again.

%% solution
fuel = int(input())
fuel -= int(input())
print(fuel)
fuel -= int(input())
print(fuel)
fuel -= int(input())
print(fuel)
%% hint
Keep the fuel in one variable and **update** it after every burn.
%% hint
`fuel = fuel - burn` can be written as `fuel -= burn`. You may do the `int(input())` right inside it.
%% hint
Each burn needs its own `print(fuel)` straight afterwards.
%% end

%% level l5 | Name badges
Crew badges must be neat. Read a full name that may have **extra spaces** and **odd capital letters**. Print the name tidied up as Title Case, and then, on the next line, how many characters the tidy name has.

```text
"  aDA loVElace " becomes
Ada Lovelace
12
```

String methods such as `.strip()` and `.title()` return a changed copy of the text. `len()` counts characters.
%% config
mode: io
par: 3
%% in Messy capitals
  aDA loVElace 
%% out
Ada Lovelace
12
%% in Plain
grace HOPPER
%% out
Grace Hopper
12
%% in hidden
alan turing
%% out
Alan Turing
11
%% starter
# strip() removes spaces from both ends, title() fixes the capitals.

%% solution
name = input().strip().title()
print(name)
print(len(name))
%% hint
You can chain methods: `input().strip()` first cleans the text that `input()` returned.
%% hint
Add `.title()` after `.strip()`, and keep the result in a variable.
%% hint
Print the variable, then print `len(name)` on the next line.
%% end

%% level l6 | Call sign
Every pilot gets a call sign: the **first two letters of the first name** followed by the **last three letters of the last name**, all in capitals. Read the first name and the last name on separate lines.

```text
Ada and Lovelace give
Call sign: ADACE
```

Slices pick parts of a string: `word[:2]` is the first two characters, and `word[-3:]` is the last three.
%% config
mode: io
par: 4
%% in Ada Lovelace
Ada
Lovelace
%% out
Call sign: ADACE
%% in Grace Hopper
Grace
Hopper
%% out
Call sign: GRPER
%% in hidden
Katherine
Johnson
%% out
Call sign: KASON
%% starter
# Slice the first name and the last name, join them, then make them capitals.

%% solution
first = input()
last = input()
sign = first[:2] + last[-3:]
print("Call sign:", sign.upper())
%% hint
`first[:2]` gives the first two letters. Do the same with `last[-3:]` for the last three.
%% hint
Join the two slices with `+`, then use `.upper()` to make the capitals.
%% hint
`print("Call sign:", sign.upper())` prints the label and the sign with a space between them.
%% end

%% level l7 | Mission clock
The mission clock counts **seconds**. Read the total number of seconds and print the time as `hours:minutes:seconds`, where the minutes and seconds always have two digits.

```text
3725 seconds is 1 hour, 2 minutes and 5 seconds
1:02:05
```

Use `//` and `%` to split the seconds. In an f-string, `{minutes:02d}` pads a whole number with zeros to two digits.
%% config
mode: io
par: 5
%% in 3725 seconds
3725
%% out
1:02:05
%% in Under a minute
59
%% out
0:00:59
%% in hidden
86399
%% out
23:59:59
%% in hidden
3600
%% out
1:00:00
%% starter
# 3600 seconds in an hour, 60 in a minute.

%% solution
total = int(input())
hours = total // 3600
minutes = total % 3600 // 60
seconds = total % 60
print(f"{hours}:{minutes:02d}:{seconds:02d}")
%% hint
Hours: how many whole 3600s fit into the total? That is `total // 3600`.
%% hint
Seconds: the leftover after whole minutes, `total % 60`. Minutes: take the part left after the hours, `total % 3600`, and divide it by 60 with `//`.
%% hint
Print with `f"{hours}:{minutes:02d}:{seconds:02d}"`. The `:02d` keeps a leading zero.
%% end

%% level l8 | Final report
Boss level. The station needs an **invoice** for each delivery. Read the item name, the quantity (a whole number) and the unit price (a decimal). Print four lines:

```text
ITEM: FUEL CELL
12 x 4.50 = 54.00
Tax (8%): 4.32
Total due: 58.32
```

The tax is 8 percent of the subtotal, and the total is the subtotal plus the tax. Show every money amount with two decimals.
%% config
mode: io
par: 9
%% in 12 fuel cells at 4.50
fuel cell
12
4.5
%% out
ITEM: FUEL CELL
12 x 4.50 = 54.00
Tax (8%): 4.32
Total due: 58.32
%% in 3 ropes at 2.25
rope
3
2.25
%% out
ITEM: ROPE
3 x 2.25 = 6.75
Tax (8%): 0.54
Total due: 7.29
%% in hidden
oxygen tank
10
2.5
%% out
ITEM: OXYGEN TANK
10 x 2.50 = 25.00
Tax (8%): 2.00
Total due: 27.00
%% in hidden
lamp
5
19.99
%% out
ITEM: LAMP
5 x 19.99 = 99.95
Tax (8%): 8.00
Total due: 107.95
%% starter
# Plan your variables first: item, qty, price, subtotal, tax.

%% solution
item = input().upper()
qty = int(input())
price = float(input())
subtotal = qty * price
tax = subtotal * 0.08
print("ITEM:", item)
print(f"{qty} x {price:.2f} = {subtotal:.2f}")
print(f"Tax (8%): {tax:.2f}")
print(f"Total due: {subtotal + tax:.2f}")
%% hint
Read three inputs. Convert the quantity with `int()` and the price with `float()`, and make the name uppercase with `.upper()`.
%% hint
Work out `subtotal = qty * price` and `tax = subtotal * 0.08` before you print anything.
%% hint
You can calculate inside an f-string: `{subtotal + tax:.2f}` adds first and formats afterwards.
%% end
