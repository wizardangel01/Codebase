---
title: Defining functions
---
You have used functions since your first program. `print` shows text, `len` counts items, `input` reads a line and `sorted` puts a list in order. Each of them has a **name**, takes some **inputs**, does one **job**, and sometimes gives a **result** back. In this lesson you build functions of your own. A function gives a name to a few lines of code, so that you can run them whenever you like, with different inputs each time, without copying them again.

## The trouble with repeated code

Look at this program, which prints a frame around some messages:

```python run
print("*" * 20)
print("Level 1 complete")
print("*" * 20)
print("Next: Level 2")
print("*" * 20)
print("Level 2 complete")
print("*" * 20)
```

It works, but the frame lines appear several times. To change the border character, or to make the frame wider, you would have to edit every copy, and you might miss one. Programmers follow a rule for this: **don't repeat yourself**. When you notice the same lines twice, give them a name and write them once.

## Your first function

A function is defined with the word `def`, and it runs when you **call** it:

```python run
def banner(text):
    print("*" * 20)
    print(text)
    print("*" * 20)

banner("Level 1 complete")
print("Next: Level 2")
banner("Level 2 complete")
```

Look at the definition piece by piece:

- `def` starts the definition, and `banner` is the name that you chose for the function.
- The brackets hold the **parameters**, the names for the inputs. Here there is one, `text`.
- The colon ends the first line, and the lines that belong to the function are **indented**. They are the **body**.
- Each call, such as `banner("Level 1 complete")`, runs the body once, and the value in the brackets is stored in `text` for that call.

%% key A definition only creates the function
`def` stores the lines under a name and does **not** run them. The body runs each time that you call the function by writing its name, followed by brackets.
%% end

A function does not need inputs. Then the brackets stay empty, both in the definition and in the call:

```python run
def hello():
    print("Hello from a function!")

hello()
hello()
```

Python reads a program from top to bottom, so a function has to be defined **before** the line that calls it:

```python run error
greet()

def greet():
    print("Hello!")
```

Python reports a **NameError**: at the moment of the call, the name `greet` does not exist yet.

%% question q-define-predict | predict
What does this program print?

```python
def hello():
    print("Hello!")

print("Start")
```
%% answer
Start
%% explain
The program defines `hello` but never calls it, so its body never runs. Only the line `print("Start")` produces output.
%% end

## Parameters and arguments

The two words are often mixed up. A **parameter** is a name in the definition, a placeholder for an input. An **argument** is the real value that you pass in a call. A function can have several parameters, and the arguments are matched to them **by position**:

```python run
def rectangle_area(width, height):
    print(width * height)

rectangle_area(3, 4)
rectangle_area(10, 2)
```

If the number of arguments is wrong, Python tells you what is missing:

```python run error
def rectangle_area(width, height):
    print(width * height)

rectangle_area(3)
```

The names of the parameters belong to the function. They exist only while the function runs, so they cannot clash with variables of the same name elsewhere in your program.

## return: giving an answer back

So far the functions only **showed** something. A function that shows its answer with `print` is a dead end, because the rest of the program cannot use the answer. With `return`, a function hands a value back to the place where it was called:

```python run
def area(width, height):
    return width * height

small = area(2, 3)
big = area(10, 20)
print(small, big, small + big)
```

The call `area(2, 3)` is replaced by the value that the function returns, so you can store it, add it, compare it or pass it to another function. The difference between `print` and `return` matters a lot, so compare them side by side:

```python run
def show_double(n):
    print(n * 2)

def get_double(n):
    return n * 2

a = show_double(5)
b = get_double(5)
print("a is", a)
print("b is", b)
```

The first function printed 10 on the screen but gave nothing back, so `a` is `None`. The second function printed nothing and gave 10 back, so `b` is 10.

%% warn print shows a value, return hands it back
If you write `print` inside a function when you meant `return`, the program seems to work on the screen, but every calculation that uses the result fails or prints `None`. A function that calculates something should `return` it. Let the part of the program that calls the function decide whether to print it.
%% end

When a function ends without reaching a `return`, it gives back the special value `None`. To test for `None`, use the operator `is`, which asks whether two names refer to the very same thing. Write `is None` and `is not None`:

```python run
def find_first_even(numbers):
    for n in numbers:
        if n % 2 == 0:
            return n

result = find_first_even([3, 5, 8, 9])
print(result)
result = find_first_even([3, 5])
print(result)
if result is None:
    print("No even number found")
```

The first call returns 8 from inside the loop. The second call finds no even number, the loop ends, the function ends without a `return`, and the result is `None`.

%% question q-none-choice | choice
What does a function give back when it ends without running a `return` statement?
%% choice
`0`
%% choice
An empty string
%% choice correct
`None`
%% choice
An error is raised.
%% explain
A function without a `return` still finishes normally, and the call is replaced by `None`. That is why `a = show_double(5)` stores `None` in `a`.
%% end

## Following a call step by step

Press the step button to watch a call. The panel shows the **frame** of the function, which is its own set of variables. When the function returns, its frame disappears and the value lands where the call was written:

```python trace title="A call and its return"
def double(n):
    return n * 2

answer = double(21)
print(answer)
```

Now follow a function that calls another function. Every call gets its own frame, so `a` and `b` of `sum_of_squares` and `n` of `square` do not disturb each other:

```python trace title="One function calls another"
def square(n):
    return n * n

def sum_of_squares(a, b):
    return square(a) + square(b)

print(sum_of_squares(3, 4))
```

## Early return

A `return` ends the function at once, and the lines after it never run. This is useful when the answer is known early, for example when the input is not valid. Putting the special cases first, each with its own `return`, keeps the main part of the function flat:

```python run
def sign(n):
    if n < 0:
        return "negative"
    if n == 0:
        return "zero"
    return "positive"

for value in [-5, 0, 7]:
    print(value, "is", sign(value))
```

Here is another example, a division that refuses to divide by zero:

```python run
def safe_divide(a, b):
    if b == 0:
        return None
    return a / b

print(safe_divide(10, 4))
print(safe_divide(10, 0))
```

%% question q-return-predict | predict
What does this program print?

```python
def f(n):
    return n + 1
    print("done")

print(f(1))
```
%% answer
2
%% explain
`return n + 1` ends the function with the value 2. The line `print("done")` comes after the `return`, so it never runs. The outer `print` shows the returned 2.
%% end

## Documenting a function

A string on the first line of the body, in triple quotes, is the **docstring**. It says what the function does, for the next person who reads the code, and Python keeps it with the function:

```python run
def area(width, height):
    """Return the area of a rectangle."""
    return width * height

print(area.__doc__)
```

A good docstring is one short sentence that starts with a verb. Write one whenever the name alone does not tell the whole story.

## Functions that call functions

Real programs are built from many small functions that call each other. Each function does one job, and the bigger jobs combine them:

```python run
def to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32

def describe(celsius):
    fahrenheit = to_fahrenheit(celsius)
    return f"{celsius} C is {fahrenheit:.1f} F"

for temperature in [0, 21.5, 100]:
    print(describe(temperature))
```

You can test and understand each small function on its own, and you can reuse `to_fahrenheit` in any other program. This is the real reason for functions: they let you break a big problem into pieces that are small enough to think about.

## Good names, good jobs

- Name a function after what it **does**: `calculate_tax`, `count_vowels`, `print_report`. A function that answers yes or no is often named `is_...` or `has_...`, such as `is_even`.
- Use lowercase words joined by underscores, like your variables.
- Give each function **one job**. If you need the word "and" to describe it, think about splitting it in two.
- A function that calculates should `return` its answer. A function whose job is to show something may `print`.

%% question q-return-fill | fill
Fill in the blank so that the program prints `10`.

```python
def add(a, b):
    ___ a + b

print(add(2, 3) * 2)
```
%% answer
return
%% expected
10
%% explain
`return a + b` hands the sum, 5, back to the call, so `add(2, 3) * 2` is 10. With `print` in its place, the call would give `None` and the multiplication would fail.
%% end

## A small project: the receipt

Three tiny functions and a loop make a working receipt. The program reads a price and a quantity for each item, and a price of 0 ends the list:

```python run stdin="250\n3\n1200\n1\n0"
def line_total(price, quantity):
    return price * quantity

def add_tax(amount, rate):
    return amount * (1 + rate)

def money(amount):
    return f"{amount:.2f}"

subtotal = 0
while True:
    price = int(input("Price (0 to finish): "))
    if price == 0:
        break
    quantity = int(input("Quantity: "))
    subtotal += line_total(price, quantity)
print("Subtotal:", money(subtotal))
print("With tax:", money(add_tax(subtotal, 0.075)))
```

The main part of the program now reads like a short story, and each function can be improved without touching the others. Try a different tax rate, or add a function that formats the receipt line for each item.

%% question q-order-define | order
Put the lines in order so that the program prints `8`. One line does not belong.
%% lines
def double(n):
    return n * 2
print(double(4))
%% distractors
    print(n * 2)
%% expected
8
%% explain
The definition comes first, with the indented `return` inside it, and the call comes after the definition. With `print(n * 2)` as the body, the function would print 8 itself and return `None`, so the outer `print` would show an extra `None`.
%% end

## Your turn

%% exercise cube | Cube
Define a function `cube(n)` that **returns** `n * n * n`. Then read an integer and print its cube by calling the function. For the input `3` the program prints:

```output
27
```
%% stdin
3
%% starter
# Define cube(n), then use it.

%% solution
def cube(n):
    return n * n * n

number = int(input())
print(cube(number))
%% tests
expect_output("27")
check(defines("cube"), "defines a function called cube")
expect(cube(4), 64, "cube(4)")
expect(cube(-2), -8, "cube(-2)")
check(rerun("5").strip() == "125", "another input")
%% hint
Start with `def cube(n):` and indent the body.
%% hint
The body is one line: `return n * n * n`.
%% hint
After the definition, read the number with `int(input())` and print `cube(number)`.
%% end

%% exercise count-evens | Count the even numbers
Define a function `is_even(n)` that returns `True` when `n` is even and `False` otherwise. Read a line of integers separated by spaces, and use the function to count the even ones. For the input `3 8 10 7 4` the program prints:

```output
3
```
%% stdin
3 8 10 7 4
%% starter
# Define is_even(n) first.

%% solution
def is_even(n):
    return n % 2 == 0

count = 0
for text in input().split():
    if is_even(int(text)):
        count += 1
print(count)
%% tests
expect_output("3")
check(defines("is_even"), "defines a function called is_even")
expect(is_even(10), True, "is_even(10)")
expect(is_even(7), False, "is_even(7)")
expect(is_even(0), True, "is_even(0)")
check(rerun("1 3 5").strip() == "0", "no even numbers")
%% hint
An even number leaves the remainder 0 when you divide it by 2.
%% hint
`return n % 2 == 0` hands back the result of the comparison, which is already `True` or `False`.
%% hint
In the loop, call `is_even(int(text))` in an `if`, and add 1 to a counter when it is true.
%% end

%% exercise discount-price | Discount price
Define a function `discount_price(price, percent)` that returns the price after taking `percent` per cent off. Read a price and a percentage (whole numbers, one per line) and print the new price with two decimals. For the input `200` and `15` the program prints:

```output
170.00
```
%% stdin
200
15
%% starter
# Define discount_price(price, percent) and use it.

%% solution
def discount_price(price, percent):
    return price * (100 - percent) / 100

price = int(input())
percent = int(input())
print(f"{discount_price(price, percent):.2f}")
%% tests
expect_output("170.00")
check(defines("discount_price"), "defines a function called discount_price")
expect(discount_price(200, 10), 180, "discount_price(200, 10)", approx=0.001)
expect(discount_price(80, 25), 60, "discount_price(80, 25)", approx=0.001)
expect(discount_price(50, 0), 50, "discount_price(50, 0)", approx=0.001)
check(rerun("100\n50").strip() == "50.00", "half price")
%% hint
Taking 15 per cent off means that you pay 85 per cent of the price.
%% hint
The new price is `price * (100 - percent) / 100`. Return it, and do not print inside the function.
%% hint
Print with an f-string and a format: `print(f"{discount_price(price, percent):.2f}")`.
%% end

%% exercise first-negative | Challenge: First negative
Define a function `first_negative(numbers)` that returns the first negative number of a list, or `None` when the list has none. Read a line of integers separated by spaces. Print the first negative number, or `none` if there is no negative number. For the input `4 -2 7 -9` the program prints:

```output
-2
```
%% stdin
4 -2 7 -9
%% starter
# Define first_negative(numbers). It should stop as soon as it finds a negative number.

%% solution
def first_negative(numbers):
    for n in numbers:
        if n < 0:
            return n
    return None

numbers = []
for text in input().split():
    numbers.append(int(text))
result = first_negative(numbers)
if result is None:
    print("none")
else:
    print(result)
%% tests
expect_output("-2")
check(defines("first_negative"), "defines a function called first_negative")
expect(first_negative([3, -1, -5]), -1, "first_negative([3, -1, -5])")
expect(first_negative([1, 2]), None, "first_negative([1, 2])")
expect(first_negative([]), None, "first_negative([])")
check(rerun("1 2 3").strip() == "none", "no negative number in the input")
%% hint
Loop over the numbers and test each one with `if n < 0:`.
%% hint
Use `return n` inside the loop, so the function stops at the first negative number. After the loop, return `None`.
%% hint
In the main part, store the result of the call, and print `none` when `result is None`.
%% end

## What you learned

- A function is defined with `def name(parameters):` and an indented body. The definition only stores it, and a call such as `name(arguments)` runs it.
- Parameters are the names in the definition. Arguments are the values in a call, matched by position.
- `return` hands a value back and ends the function at once. `print` only shows a value. A function that ends without a `return` gives back `None`, and you test for it with `is None`.
- Each call has its own frame of variables, and you can watch it in the trace panel.
- A docstring on the first line of the body describes the function. Name functions after what they do, and give each one a single job.
- Small functions that call each other make a program easier to read, test and reuse.
