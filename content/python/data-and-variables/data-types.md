---
title: Kinds of data
---
The numbers `7` and `7.0` and the text `"7"` look almost the same on the page. To Python they are three different kinds of thing, and they behave differently. Add two of the first kind and you get 14. Add two of the last kind and you get 77.

Python calls these kinds **data types**, or **types** for short. Knowing which type you have, and how to turn one into another, saves you from a whole family of confusing mistakes. In this lesson you will meet the four basic types, learn to ask Python which one you are holding, and learn to convert between them.

## Asking Python: type()

The built-in function `type()` tells you what kind of value you have:

```python run
print(type(42))
print(type(3.14))
print(type("hello"))
print(type(True))
```

Four values, four types:

| Name | Short for | What it holds | Examples |
| --- | --- | --- | --- |
| `int` | integer | whole numbers | `42`, `-7`, `0` |
| `float` | floating-point number | numbers with a decimal point | `3.14`, `-0.5`, `2.0` |
| `str` | string | text | `"hello"`, `'Ada'`, `""` |
| `bool` | Boolean | `True` or `False` | `True`, `False` |

The output says `<class 'int'>` and so on. "Class" is Python's word for a kind of thing. You will build your own classes in module 10, and for now you can read `<class 'int'>` as "the type is int".

The type belongs to the **value**, not to the variable. A variable can hold an integer now and text a moment later:

```python run
thing = 7
print(type(thing))
thing = "seven"
print(type(thing))
```

## Whole numbers: int

An `int` is a whole number with no decimal point. Python's integers have no fixed size limit, so they can grow as large as your computer's memory allows. Most languages cannot do this:

```python
print(2 ** 100)
```
```output
1267650600228229401496703205376
```

Long numbers are hard to read, so Python lets you put underscores inside them. The underscores are ignored when the program runs:

```python run
population = 1_400_000_000
print(population)
print(population // 1_000_000)
```

Two operators from module 1 deserve a second look. `//` (floor division) and `%` (remainder) both give an `int` when you start with ints, which is why they are so useful for counting whole things, like slices of pizza or coins.

```python run
print(17 // 5)
print(17 % 5)
print(type(17 // 5))
```

## Decimal numbers: float

A `float` has a decimal point. A number such as `2.0` is a float even though its value is whole, and the `/` operator always gives a float:

```python run
print(10 / 2)
print(type(10 / 2))
print(type(10 // 2))
```

Floats come with a catch that surprises every beginner. Run this and look at the last digits:

```python
print(0.1 + 0.2)
```
```output
0.30000000000000004
```

This is not a Python bug. Computers store floats in binary, and a number like 0.1 cannot be written exactly in binary, in the same way that one third cannot be written exactly with decimal digits (0.3333...). Every programming language has the same behaviour. The answer is very close to 0.3, and `round()` tidies it up:

```python run
print(round(0.1 + 0.2, 2))
print(round(3.14159, 2))
```

For money, many programs avoid the problem by counting in the smallest unit, such as kobo or pence, with whole numbers. You will see why that works when you build the receipts in later modules.

%% warn round() and halves
`round()` sends a number that is exactly halfway to the nearest **even** number, so `round(2.5)` is 2 and `round(3.5)` is 4. It is not a mistake. It keeps the rounding fair over thousands of numbers.
%% end

```python
print(round(2.5), round(3.5))
```
```output
2 4
```

%% question q-float-types | multi
Select every expression that gives a float.
%% choice correct
`3.0`
%% choice
`3`
%% choice
`"3.0"`
%% choice correct
`10 / 5`
%% choice
`10 // 5`
%% explain
`3.0` has a decimal point. `10 / 5` uses `/`, which always gives a float (the answer is `2.0`). `3` and `10 // 5` are whole numbers, so they are ints. `"3.0"` is in quotes, so it is text.
%% end

## Text: str

A **string** is text, written between quotes. Single and double quotes work the same way. Anything between the quotes is text, even if it looks like a number:

```python run
print(7 + 7)
print("7" + "7")
print("7" * 3)
```

The first line adds numbers. The second joins two pieces of text, and the third repeats text. The text `"7"` has no numeric value at all. It is a character, like the letter `a`.

So what happens when you mix the two? Python refuses to guess:

```python run error
print("Age: " + 12)
```

It reports a **TypeError**: you cannot add a number to text, because Python cannot tell whether you mean arithmetic or joining. You decide, by converting one of them. The next section shows how.

## True, False and None

A `bool` (named after the mathematician George Boole) has only two possible values: `True` and `False`. They are written with a capital letter and no quotes. They answer yes-or-no questions, and in module 3 you will use them to make programs choose what to do.

In arithmetic, `True` counts as 1 and `False` counts as 0. You will rarely add them up on purpose, but it explains why this works instead of raising an error:

```python run
print(True + True)
print(type(False))
```

There is one more special value. `None` means "no value": nothing has been chosen, nothing has been found yet. It has its own type, `NoneType`:

```python run
winner = None
print(winner)
print(type(winner))
```

Think of `None` as an empty seat with a name card on it. The seat exists, but nobody is sitting there.

%% question q-quoted-true | choice
What is the type of the value `"True"` (with quotes)?
%% choice
`bool`
%% choice correct
`str`
%% choice
`int`
%% choice
`NoneType`
%% explain
The quotes make it text, so it is a `str`. A `bool` is written without quotes: `True`. Python never looks inside a string to work out what it "means".
%% end

## Converting between kinds

Three functions convert a value to another type. Their names are the type names: `int()`, `float()` and `str()`.

```python run
print(int("42") + 8)
print(float("3.5") * 2)
print(str(2026) + " is the year")
```

The first line turns the text `"42"` into the number 42, so the addition works. The last line turns a number into text so that `+` can join it. That is the fix for the TypeError you saw above: `"Age: " + str(12)`.

Converting a float to an int **truncates**: it cuts the decimal part off and does not round.

```python
print(int(3.9), int(-3.9), round(3.9))
```
```output
3 -3 4
```

Use `round()` when you want the nearest whole number, and `int()` when you want the whole part. Conversions can also fail, because not every piece of text is a number:

```python run error
print(int("abc"))
```

A **ValueError** means: the type is acceptable, but this particular value is not. There is a second surprise. The text `"3.5"` looks like a perfectly good number, and `int("3.5")` still fails with a ValueError, because the text contains a decimal point. Convert it in two steps instead:

```python run
print(int(float("3.5")))
```

%% question q-int-truncate | choice
What does `int(7.99)` give?
%% choice correct
`7`
%% choice
`8`
%% choice
`7.99`
%% choice
An error
%% explain
`int()` cuts off the decimal part, so 7.99 becomes 7. It does not round up. If you want the nearest whole number, use `round(7.99)`, which gives 8.
%% end

%% question q-str-fill | fill
Fill in the blank so the program prints `Age: 12`.

```python
print("Age: " + ___(12))
```
%% answer
str
%% expected
Age: 12
%% explain
`+` joins two pieces of text, so the number has to become text first. `str(12)` gives `"12"`. `int(12)` and `float(12)` would still be numbers, and the join would fail with a TypeError.
%% end

## Your turn

%% exercise type-detective | Type detective
Print the type of each of these four values, one per line, in this order: `2026`, `2.026`, `"2026"` and `False`.

```output
<class 'int'>
<class 'float'>
<class 'str'>
<class 'bool'>
```
%% starter
# Print the type of each value on its own line.

%% solution
print(type(2026))
print(type(2.026))
print(type("2026"))
print(type(False))
%% tests
expect_output("<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>")
check(calls("type"), "uses type()")
%% hint
Each line looks like `print(type(...))`.
%% hint
Put the value inside the brackets of `type()`. Remember the quotes round `"2026"`.
%% hint
`print(type(2026))` is the first line.
%% end

%% exercise fruit-count | Fruit count
`apples` is 3 and `pears` is 4. Print the sentence below. Let Python work out the 7: do not type it. You will need `str()`.

```output
I have 7 fruits.
```
%% starter
apples = 3
pears = 4
# Print: I have 7 fruits.

%% solution
apples = 3
pears = 4
print("I have " + str(apples + pears) + " fruits.")
%% tests
expect_output("I have 7 fruits.")
check(calls("str"), "converts the number with str()")
check("7" not in source(), "works out the 7 instead of typing it")
%% hint
You need to join three pieces of text with `+`. The middle piece is a number.
%% hint
Add the two variables first, then convert the sum to text.
%% hint
`print("I have " + str(apples + pears) + " fruits.")`
%% end

%% exercise shop-total | Shop total
A shop's till gives you the price and the quantity as text: `price_text = "19.99"` and `quantity_text = "3"`. Convert the price with `float()` and the quantity with `int()`, multiply them, and print the total rounded to 2 decimal places.

```output
59.97
```
%% starter
price_text = "19.99"
quantity_text = "3"
# Convert, multiply, round and print.

%% solution
price_text = "19.99"
quantity_text = "3"
price = float(price_text)
quantity = int(quantity_text)
print(round(price * quantity, 2))
%% tests
expect_output("59.97")
check(calls("float"), "converts the price with float()")
check(calls("int"), "converts the quantity with int()")
check(calls("round"), "rounds the answer with round()")
%% hint
Convert each piece of text into a number first.
%% hint
Multiply the two numbers, and put the product inside `round(..., 2)`.
%% hint
`print(round(float(price_text) * int(quantity_text), 2))` also works.
%% end

%% exercise minutes-lived | Challenge: Minutes lived
A user typed their age as text: `age_text = "12"`. Work out roughly how many minutes they have been alive (365 days a year, 24 hours a day, 60 minutes an hour). Print the number of minutes, and then print its type on the next line.

```output
6307200
<class 'int'>
```
%% starter
age_text = "12"
# Convert, calculate, print the minutes, then print their type.

%% solution
age_text = "12"
age = int(age_text)
minutes = age * 365 * 24 * 60
print(minutes)
print(type(minutes))
%% tests
expect_output("6307200\n<class 'int'>")
check(calls("int"), "converts the text with int()")
check(calls("type"), "prints the type with type()")
%% hint
The age is text, so it must become a number before you can multiply it.
%% hint
Multiply the age by 365, then 24, then 60. Store the result in a variable so you can print it and also ask for its type.
%% hint
`minutes = int(age_text) * 365 * 24 * 60`
%% end

## What you learned

- Every value has a **type**, and `type()` tells you which one: `int`, `float`, `str`, `bool` or `NoneType`.
- Python integers can be as large as you like, and underscores (`1_000_000`) make long numbers readable.
- `/` always gives a float. Floats are approximate (`0.1 + 0.2` is `0.30000000000000004`), and `round()` tidies them up. `round()` sends exact halves to the nearest even number.
- Quotes make text. `"7" + "7"` is `"77"`, and `7 + "7"` is a TypeError.
- `True` and `False` are booleans, and `None` means "no value yet".
- `int()`, `float()` and `str()` convert between types. `int()` truncates, and it raises a ValueError when the text is not a whole number, even for `"3.5"`.
