---
title: Working with text
---
Text is everywhere in programs: the names on a badge, the messages on a screen, the lines in a file, the words in a chat. Almost every program you write will build, clean or pick apart some text, so a few good tools here pay off for the rest of the course.

In this lesson you will build messages with **f-strings**, format numbers so they look neat, pick out single letters and slices of a string, and use string **methods** to clean and change text. At the end you will use all of it, together with `input()`, in one small program that prints a name badge.

## Text with holes: f-strings

In lesson 2 you joined text and numbers with `+` and `str()`. It works, but it is clumsy. Compare the two lines below:

```python run
name = "Tunde"
goals = 3
print(name + " scored " + str(goals) + " goals.")
print(f"{name} scored {goals} goals.")
```

They print the same sentence. The second one is an **f-string**. Put the letter `f` straight before the opening quote, and anything inside curly brackets `{}` is worked out and placed into the text. The `f` stands for "formatted". There is no `str()` and no `+`, so the line reads almost like the sentence it produces.

The brackets can hold any expression, not only a name:

```python run
price = 250
print(f"Three tickets cost {price * 3} naira.")
print(f"Half of {price} is {price // 2}.")
```

## Formatting numbers

By default an f-string shows a number exactly as Python holds it, which is rarely what you want for money. After the value you can add a colon and a **format specification** that says how to display it:

```python run
price = 1234.5
print(f"{price:.2f}")
print(f"{price:,.2f}")
print(f"{3.14159:.3f}")
print(f"{7:02d}")
```

Here is what each specification does:

| Specification | Meaning | Result for the example |
| --- | --- | --- |
| `:.2f` | exactly two digits after the decimal point | `1234.50` |
| `:,` | commas between the thousands | `1,234.50` with `:,.2f` |
| `:02d` | a whole number padded with zeros to a width of 2 | `07` |
| `:05.1f` | width 5, one decimal, padded with zeros | `003.1` for 3.14159 |

The `f` means "number with a decimal point" and the `d` means "whole number". A colon followed by `>`, `<` or `^` and a width lines text up to the right, left or centre of a space of that width:

```python run
print(f"|{'hi':>8}|")
print(f"|{'hi':<8}|")
print(f"|{'hi':^8}|")
```

The bars show where each space of 8 characters begins and ends. Alignment is what makes a table of prices line up:

```python run
print(f"{'Rice':<10}{1250:>8,}")
print(f"{'Beans':<10}{980:>8,}")
print(f"{'Total':<10}{2230:>8,}")
```

%% question q-format-fill | fill
Fill in the blank so the program prints `Price: 4.50`.

```python
price = 4.5
print(f"Price: {price:___}")
```
%% answer
.2f
%% expected
Price: 4.50
%% explain
`.2f` means two digits after the decimal point, so 4.5 is shown as `4.50`. Without a specification the f-string would print `4.5`.
%% end

## Length and positions

Every character in a string has a position, called its **index**, and counting starts at 0. The built-in `len()` tells you how many characters a string has, including spaces:

```python run
word = "Python"
print(len(word))
print(word[0])
print(word[5])
print(word[-1])
```

Square brackets after a string pick out one character. A negative index counts from the end, so `-1` is always the last character. Here is the whole word with both numbering schemes:

```text
 P  y  t  h  o  n
 0  1  2  3  4  5
-6 -5 -4 -3 -2 -1
```

Ask for a position that does not exist and Python stops with an **IndexError**:

```python run error
word = "Python"
print(word[6])
```

The word has six characters, numbered 0 to 5, so there is no position 6. The mistake of being one out is so common that it has a name, the off-by-one error, and you will meet it again in module 4.

## Slices

A **slice** takes a piece of a string. Write two numbers in the brackets with a colon between them: the position to start at and the position to stop **before**.

```python
word = "Python"
print(word[1:4])
print(word[:2])
print(word[3:])
print(word[-3:])
print(word[::2])
print(word[::-1])
```
```output
yth
Py
hon
hon
Pto
nohtyP
```

Go through the lines one at a time. `word[1:4]` takes the positions 1, 2 and 3, and stops before 4. Leaving out the first number means "from the start", and leaving out the second means "to the end", so `word[:2]` is the first two letters and `word[3:]` is everything from position 3. A negative start counts from the end, so `word[-3:]` is the last three letters. A third number is the **step**: `word[::2]` takes every second letter, and a step of `-1` walks backwards, which reverses the string.

%% question q-slice-predict | predict
What does this program print?

```python
word = "orchestra"
print(word[2:5], word[::-1][:3])
```
%% answer
che art
%% explain
`word[2:5]` takes the positions 2, 3 and 4, which are the letters `c`, `h` and `e`. Then `word[::-1]` reverses the word to `"artsehcro"`, and `[:3]` takes the first three letters of that: `art`. The comma makes `print` put a space between the two pieces.
%% end

## Strings never change

Try to change one letter of a string and Python refuses:

```python run error
word = "Python"
word[0] = "J"
```

Strings are **immutable**: once made, they cannot be altered. To get a different string you build a new one, and slices are the perfect tool for that:

```python run
word = "Python"
new_word = "J" + word[1:]
print(new_word)
print(word)
```

The original is untouched. The keyword `in` asks whether one piece of text appears inside another, and answers with `True` or `False`:

```python run
word = "Python"
print("thon" in word)
print("z" in word)
```

## String methods

A **method** is a function that belongs to a value. You write the value, a dot, the method name and brackets, as you did with `split()` in the last lesson. Strings have dozens of methods. These three change the case of the letters:

```python run
shout = "tunde adebayo"
print(shout.upper())
print(shout.title())
print(shout.capitalize())
print(shout)
```

Look at the last line. The original text did not change. A method never alters a string, because strings cannot be altered. It **returns a new string**, and you decide what to do with it, for example by storing it in a variable.

%% question q-immutable | choice
After these two lines run, what does `word` hold?

```python
word = "cat"
word.upper()
```
%% choice
`"CAT"`
%% choice correct
`"cat"`
%% choice
`None`
%% choice
An error stops the program
%% explain
`word.upper()` creates a new string `"CAT"`, but the line throws it away because nothing stores it. The variable `word` still points at `"cat"`. To keep the result you would write `word = word.upper()`.
%% end

Some methods clean text and others search it:

```python run
text = "  banana split  "
print(text.strip())
print(text.replace("a", "o"))
print(text.count("a"))
print(text.find("split"))
print(text.strip().startswith("ban"))
print(text.strip().endswith("it"))
```

The first line removes the spaces at both ends. `replace` swaps every `"a"` for an `"o"`. `count` says how many times a piece appears (three, all in `banana`). `find` gives the position where a piece starts, and it gives `-1` when the piece is not there. `startswith` and `endswith` answer with `True` or `False`. Two more methods ask what a string is made of:

```python run
print("2026".isdigit())
print("Ada".isalpha())
print("R2D2".isalpha())
```

| Method | What it does |
| --- | --- |
| `s.upper()`, `s.lower()` | all capitals, all small letters |
| `s.title()` | a capital letter at the start of each word |
| `s.capitalize()` | a capital letter at the start, the rest small |
| `s.strip()` | removes spaces and line breaks at both ends (`lstrip()` the left end, `rstrip()` the right end) |
| `s.replace(old, new)` | swaps every `old` for `new` |
| `s.count(part)` | how many times `part` appears |
| `s.find(part)` | the position of the first `part`, or `-1` |
| `s.startswith(x)`, `s.endswith(x)` | `True` or `False` |
| `s.isdigit()`, `s.isalpha()` | only digits? only letters? |

Because each method returns a string, you can call another method straight on the result. This is called **chaining**, and you read it from left to right:

```python run
raw = "  tunde ADEBAYO "
clean = raw.strip().title()
print(clean)
print(len(clean))
```

%% question q-find-choice | choice
What does `"Python".find("z")` give?
%% choice correct
`-1`
%% choice
`0`
%% choice
`None`
%% choice
An error
%% explain
`find()` reports a missing piece with `-1`. Position 0 would mean "found at the very start", and `None` is not used here. (A related method, `index()`, raises an error instead, but you do not need it yet.)
%% end

Finally, a string in **triple quotes** may run over several lines, and the line breaks become part of the text:

```python run
poem = """Roses are red,
Violets are blue,
Python is fun,
And so are you."""
print(poem)
```

## Putting it together: a name badge

Here is everything from this lesson and the last one in one program. It reads a messy name, cleans it, finds the space between the two names, and prints a badge:

```python run stdin="  amara okafor "
name = input("Full name: ").strip().title()
space = name.find(" ")
initials = name[0] + name[space + 1]
print(f"Badge: {name}")
print(f"Initials: {initials}")
print(f"{len(name)} characters, shouting: {name.upper()}")
```

Walk through it. `input()` returns the messy text, and `.strip().title()` cleans it into `"Amara Okafor"`. The `find` call returns the position of the space, 5. The first initial is the letter at position 0 and the second is the letter right after the space, at position `space + 1`. The three f-strings then show the results. Change the typed name and run it again to watch the program cope.

## Your turn

%% exercise greeting-card | Greeting card
The variables below are ready. Print the sentence with an f-string.

```output
Amara is 12 years old.
```
%% starter
name = "Amara"
age = 12
# Print the sentence with an f-string.

%% solution
name = "Amara"
age = 12
print(f"{name} is {age} years old.")
%% tests
expect_output("Amara is 12 years old.")
check(uses("JoinedStr"), "uses an f-string")
%% hint
An f-string starts with the letter `f` before the opening quote.
%% hint
Put each variable inside curly brackets.
%% hint
`print(f"{name} is {age} years old.")`
%% end

%% exercise price-tag | Price tag
Read a price, which may have decimals, and print it with a dollar sign and exactly two decimal places, using an f-string. When the input is `4.5`, the program prints:

```output
Price: $4.50
```
%% stdin
4.5
%% starter
# Read the price, then print it with two decimal places.

%% solution
price = float(input())
print(f"Price: ${price:.2f}")
%% tests
expect_output("Price: $4.50")
check(uses("JoinedStr"), "uses an f-string")
check(rerun("12").strip() == "Price: $12.00", "12 becomes $12.00")
check(rerun("1999.999").strip() == "Price: $2000.00", "rounds to two decimals")
%% hint
The reply of `input()` is text. Convert it first.
%% hint
Put the number inside curly brackets followed by a colon and the specification for two decimals.
%% hint
`print(f"Price: ${price:.2f}")`
%% end

%% exercise clean-name | Clean name
The variable `full_name` holds messy text. Print three lines: the name tidied into title case with no spaces at the ends, the same name in capitals, and the number of characters in the tidied name.

```output
Ada Lovelace
ADA LOVELACE
12
```
%% starter
full_name = "  ada LOVElace "
# Clean it, then print the three lines.

%% solution
full_name = "  ada LOVElace "
clean = full_name.strip().title()
print(clean)
print(clean.upper())
print(len(clean))
%% tests
expect_output("Ada Lovelace\nADA LOVELACE\n12")
check(calls("strip"), "uses strip()")
check(calls("title"), "uses title()")
check(calls("len"), "uses len()")
%% hint
Chain two methods to get the tidy name, and store it in a variable.
%% hint
`full_name.strip().title()` gives `Ada Lovelace`. The other two lines use that variable.
%% hint
Print `clean`, then `clean.upper()`, then `len(clean)`.
%% end

%% exercise ticket-code | Challenge: Ticket code
A ticket code looks like `NG-2026-lagos`: a two-letter country, a dash, a four-digit year, a dash, and the city in lower case. Read one code and print one line in this form, using slices, `.upper()` and an f-string:

```output
NG | 2026 | LAGOS
```
%% stdin
NG-2026-lagos
%% starter
# Read the code, cut it into three pieces, print one line.

%% solution
code = input()
country = code[:2]
year = code[3:7]
city = code[8:].upper()
print(f"{country} | {year} | {city}")
%% tests
expect_output("NG | 2026 | LAGOS")
check(uses("JoinedStr"), "uses an f-string")
check(uses("Slice"), "uses slices")
check(rerun("GH-2027-accra").strip() == "GH | 2027 | ACCRA", "works for GH-2027-accra")
check(rerun("KE-2030-nairobi").strip() == "KE | 2030 | NAIROBI", "works for a longer city")
%% hint
Count the positions: two letters, a dash, four digits, a dash, then the city. Write each piece's start and stop.
%% hint
The country is `code[:2]` and the year is `code[3:7]`. The city runs from position 8 to the end.
%% hint
`city = code[8:].upper()`, then one f-string with the three variables and the ` | ` separators.
%% end

## What you learned

- An **f-string** (`f"..."`) puts the value of any expression inside `{}` into the text, so you do not need `str()` or `+`.
- After a colon you can add a format specification: `:.2f` for two decimals, `:,` for commas, `:02d` for zero padding, and `:>8`, `:<8`, `:^8` for alignment.
- `len(s)` counts characters. `s[0]` is the first character and `s[-1]` the last. Asking for a position that does not exist is an IndexError.
- A slice `s[start:stop:step]` takes a piece and stops **before** `stop`. `s[::-1]` reverses a string.
- Strings are immutable. Methods such as `upper()`, `strip()`, `replace()` and `title()` return new strings, so store the result if you want to keep it.
- `find()`, `count()`, `startswith()`, `endswith()`, `isdigit()` and `isalpha()` search and test text, and `in` asks whether a piece of text appears inside another.
- Methods can be chained from left to right: `name.strip().title()`.
