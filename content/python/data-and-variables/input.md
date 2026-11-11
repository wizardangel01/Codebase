---
title: Talking to the user
---
So far every program you wrote knew all its facts before it started. Real programs ask. A ticket machine asks how many tickets you want, a quiz asks for your answer, and a converter asks for the temperature you are curious about.

In this lesson your programs learn to listen. You will read what a person types, turn it into the right type of data, and build small programs that behave differently for every user. Everything from the first two lessons comes back, because a program that talks needs variables and types all the time.

## Asking a question with input()

The built-in function `input()` pauses the program, shows a message, waits for the user to type a line and press Enter, and then hands back what they typed:

```python run stdin="Ada"
name = input("What is your name? ")
print("Hello,", name)
print("Nice to meet you,", name)
```

The text inside the brackets is the **prompt**. The reply is stored in the variable `name`, so you can use it as many times as you like.

On this website the program stops at `input()` and waits for you to type in the console under the code, like a real terminal. In the examples of these lessons a reply is already filled in, so you can press **Run** straight away. Type something else and run it again to see how the program reacts.

%% tip Prompts are part of the output
Whatever you put inside `input("...")` is shown in the console, so it becomes part of what the program prints. The checks in the exercises below compare the whole output, so they ask you to leave the brackets of `input()` empty.
%% end

## input() always gives text

Here is a program that tries to add two numbers. Run it and look at the answer:

```python run stdin="3\n4"
first = input("First number: ")
second = input("Second number: ")
print(first + second)
print(type(first))
```

Python printed `34`, not `7`. Whatever the user types arrives as a **string**, even when it looks like a number, and `+` on two strings joins them, as you saw in the last lesson. The last line confirms it: the type is `str`.

%% question q-input-type | choice
A user types `12` when this line runs: `n = input()`. What does `n` hold?
%% choice
The whole number 12
%% choice correct
The text `"12"`
%% choice
The decimal number 12.0
%% choice
Nothing, because `input()` only prints
%% explain
`input()` always returns a string. The characters `1` and `2` arrive as the text `"12"`. To do arithmetic with it you must convert it first, with `int()` or `float()`.
%% end

## Converting what you read

The fix is to convert the text as soon as you receive it:

```python run stdin="3\n4"
first = int(input("First number: "))
second = int(input("Second number: "))
print(first + second)
```

Read the conversion from the inside out. `input(...)` runs first and returns the text `"3"`. Then `int(...)` turns that text into the number 3, and the variable stores the number.

Use `int()` for whole numbers such as ages and counts, and `float()` for numbers that may have a decimal part, such as prices and lengths:

```python run stdin="12.5"
side = float(input("Side of the square in cm: "))
print("Area:", side * side)
```

What if the user types something that is not a number? Then the conversion fails, exactly as it did in the last lesson:

```python run error stdin="twelve"
age = int(input("Age: "))
print(age + 1)
```

Handling a bad reply politely needs ideas from later modules: `if` in module 3 and `try` in module 9. Until then the programs in this course expect the kind of reply that they ask for.

%% question q-concat-predict | predict
What does this program print?

```python
a = "10"
b = "5"
print(a + b)
```
%% answer
105
%% explain
Both variables hold text, so `+` joins them: `"10"` followed by `"5"` is `"105"`. The result looks like a number, but it is still a string. Convert with `int()` first if you want 15.
%% end

## Several values on one line

Sometimes you want two or three values from a single line: a width and a height, or a first name and a surname. Text has built-in tools called **methods**. You call one by writing a dot after the value, then the method name and brackets. The method `split()` cuts text into pieces at every space:

```python run stdin="8 5"
width, height = input("Width and height: ").split()
print(width, height)
print(int(width) * int(height))
```

Here is what happens. `input()` returns the text `"8 5"`. Then `.split()` cuts it into two pieces, `"8"` and `"5"`. Finally the trick from lesson 1, `a, b = ...`, stores one piece in each name. The pieces are still text, so each one needs `int()` before you multiply.

The number of names must match the number of pieces, or Python raises a ValueError. If the values are separated by something other than spaces, such as a comma, put that character between the quotes of `split()`:

```python run stdin="Ada,36"
name, age = input("Name and age: ").split(",")
print(name, "is", age)
```

%% question q-float-fill | fill
Fill in the blank so the program prints `9.0`.

```python
price_text = "4.5"
price = ___(price_text)
print(price * 2)
```
%% answer
float
%% expected
9.0
%% explain
The text `"4.5"` has a decimal point, so it needs `float()`. `int("4.5")` would raise a ValueError, as you saw in the last lesson. And `str()` would leave you with text: `"4.5" * 2` is `"4.54.5"`.
%% end

## A recipe for programs that talk

Almost every small interactive program follows the same four steps: ask, convert, calculate, show. A good habit is to plan the steps as comments first and then write the code under each one:

```python run stdin="100"
# 1. Ask for the temperature in degrees Celsius.
celsius = float(input("Degrees Celsius: "))
# 2. Work out the same temperature in Fahrenheit.
fahrenheit = celsius * 9 / 5 + 32
# 3. Show the answer.
print(celsius, "degrees Celsius is", fahrenheit, "degrees Fahrenheit")
```

Here are three more programs built the same way. The first adds a tip to a restaurant bill. Notice how `round()` from module 1 keeps the money tidy:

```python run stdin="4500\n10"
bill = float(input("Bill in naira: "))
tip_percent = float(input("Tip percentage: "))
tip = bill * tip_percent / 100
print("Tip:", round(tip, 2))
print("Total:", round(bill + tip, 2))
```

The second works out a body mass index. The exponent `**` is worked out before the division, so `height ** 2` is the height squared:

```python run stdin="70\n1.75"
weight = float(input("Weight in kg: "))
height = float(input("Height in metres: "))
bmi = weight / height ** 2
print("BMI:", round(bmi, 1))
```

The third uses a constant, as in lesson 1, so the number 365 has a name:

```python run stdin="12"
DAYS_IN_YEAR = 365
age = int(input("Age in years: "))
print("You have lived about", age * DAYS_IN_YEAR, "days.")
```

The message lines use commas to put text and numbers side by side. In the next lesson you will meet a neater way to build messages.

## Your turn

%% exercise greeter | Greeter
Ask for the user's name with `input()` and greet them. Leave the brackets of `input()` empty, so that no prompt text appears in the output. When the name is `Ada`, the program must print:

```output
Hello, Ada!
```
%% stdin
Ada
%% starter
# Ask for a name, then greet the person.

%% solution
name = input()
print("Hello, " + name + "!")
%% tests
expect_output("Hello, Ada!")
check(rerun("Grace").strip() == "Hello, Grace!", "works for another name")
%% hint
Store the reply of `input()` in a variable first.
%% hint
Join three pieces of text with `+`: the greeting, the name and the exclamation mark.
%% hint
`print("Hello, " + name + "!")`
%% end

%% exercise double-it | Double it
Read a whole number and print double its value. When the input is `21`, the program must print:

```output
42
```
%% stdin
21
%% starter
# Read a whole number and print twice its value.

%% solution
number = int(input())
print(number * 2)
%% tests
expect_output("42")
check(rerun("5").strip() == "10", "works for 5")
check(rerun("-3").strip() == "-6", "works for a negative number")
%% hint
Whatever `input()` returns is text. Convert it before doing arithmetic.
%% hint
Wrap the call: `int(input())`.
%% hint
`number = int(input())` and then `print(number * 2)`.
%% end

%% exercise rectangle | Rectangle
Read the width and the height of a rectangle from **one line**, for example `8 5`. Print the area on the first line and the perimeter on the second line. With the input `8 5` the output is:

```output
40
26
```
%% stdin
8 5
%% starter
# Read both numbers from one line.

%% solution
width, height = input().split()
width = int(width)
height = int(height)
print(width * height)
print(2 * (width + height))
%% tests
expect_output("40\n26")
check(calls("split"), "uses split() to read both numbers from one line")
check(rerun("3 4").split() == ["12", "14"], "works for 3 and 4")
%% hint
`input().split()` gives you two pieces of text. Store them in two names, as in `a, b = 1, 2`.
%% hint
Convert each piece with `int()` before you calculate anything.
%% hint
The perimeter is `2 * (width + height)`. Print the area first and the perimeter second.
%% end

%% exercise fahrenheit | Challenge: Fahrenheit
Read a temperature in degrees Celsius. It may have a decimal part. Print the same temperature in Fahrenheit, rounded to one decimal place, and print only that number. The formula is `celsius * 9 / 5 + 32`. For the input `37` the program prints:

```output
98.6
```
%% stdin
37
%% starter
# Ask, convert, calculate, show.

%% solution
celsius = float(input())
print(round(celsius * 9 / 5 + 32, 1))
%% tests
expect_output("98.6")
check(rerun("100").strip() == "212.0", "100 degrees gives 212.0")
check(rerun("-40").strip() == "-40.0", "-40 degrees gives -40.0")
check(rerun("36.6").strip() == "97.9", "36.6 degrees gives 97.9")
%% hint
Follow the four steps: ask, convert, calculate, show. The temperature may have decimals, so choose the right conversion.
%% hint
Use `float(input())`, apply the formula, and put the result inside `round(..., 1)`.
%% hint
`print(round(celsius * 9 / 5 + 32, 1))`
%% end

## What you learned

- `input("prompt")` pauses the program, shows the prompt and returns what the user typed.
- `input()` **always** returns text. Convert it at once: `int(input(...))` for whole numbers and `float(input(...))` for decimals.
- Typing something that cannot be converted raises a ValueError. Later modules show how to handle that.
- `.split()` cuts text into pieces at spaces, and `.split(",")` cuts at commas. Combine it with `a, b = ...` to read several values from one line.
- Small programs follow four steps: ask, convert, calculate, show. Planning them as comments first keeps the code tidy.
