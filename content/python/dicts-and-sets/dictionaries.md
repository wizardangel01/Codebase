---
title: Dictionaries
---
A list finds an item by its **position**: the third name, the first score. Many problems are not about positions. You want the phone number **of Ada**, the price **of tea**, the capital **of Kenya**. A **dictionary** stores values under names that you choose, called **keys**, and it finds a value from its key at once. It works like a phone book: look up the name, and read the number.

In this lesson you learn how to create dictionaries, read and change them, loop over them, and combine them. Dictionaries are used in almost every real Python program, so it is worth learning them well.

## Creating a dictionary and reading it

A dictionary is written with curly brackets. Each entry is a **key**, a colon and a **value**, and the entries are separated by commas. You look a value up by writing its key in square brackets:

```python run
phone = {"Ada": "0803-111", "Grace": "0805-222", "Linus": "0807-333"}
print(phone)
print(phone["Grace"])
print(len(phone))
print(type(phone))
```

`len()` counts the entries. A key is unique: it appears once in a dictionary, and it leads to exactly one value. Asking for a key that is not there is an error:

```python run error
phone = {"Ada": "0803-111"}
print(phone["Zed"])
```

Python reports a **KeyError** and shows the missing key.

%% key A dictionary maps keys to values
Think of a dictionary as a set of labelled boxes. The label is the key, and the box holds the value. You always ask for a box by its label, and never by its position.
%% end

## A safer lookup: get

The method `get` returns `None` instead of an error when the key is missing. Give it a second argument and it returns that **default** value instead:

```python run
phone = {"Ada": "0803-111", "Grace": "0805-222"}
print(phone.get("Ada"))
print(phone.get("Zed"))
print(phone.get("Zed", "unknown"))
```

Use `phone[key]` when the key must exist, so that a mistake is noticed at once. Use `phone.get(key, default)` when a missing key is normal.

%% question q-get-fill | fill
Fill in the blank so that the program prints `0`.

```python
prices = {"tea": 300, "bread": 500}
print(prices.___("eggs", 0))
```
%% answer
get
%% expected
0
%% explain
`get` returns the default value when the key is missing. There is no `"eggs"` key, so the answer is the default, 0. Writing `prices["eggs"]` would raise a KeyError.
%% end

## Adding and changing entries

Assigning to a key adds the entry if the key is new, and replaces the value if the key already exists:

```python run
stock = {"apples": 5, "pears": 2}
stock["bananas"] = 12
stock["apples"] = 6
stock["pears"] += 3
print(stock)
```

The shortcut `stock["pears"] += 3` reads the old value, adds 3 and stores the result. It only works when the key already exists.

## Removing entries

```python run
stock = {"apples": 6, "pears": 5, "bananas": 12}
del stock["pears"]
print(stock)
removed = stock.pop("bananas")
print(removed, stock)
print(stock.pop("kiwi", 0))
```

`del` removes an entry and gives nothing back. `pop` removes an entry and returns its value. Give `pop` a default, as in the last line, and a missing key causes no error.

## Is the key there?

The word `in` tests the **keys**. It never looks at the values:

```python run
stock = {"apples": 6, "bananas": 12}
print("apples" in stock)
print(12 in stock)
print("kiwi" not in stock)
```

%% question q-in-keys | choice
What does `10 in {"a": 10}` give?
%% choice
`True`, because 10 is one of the values.
%% choice correct
`False`, because `in` only checks the keys.
%% choice
An error, because 10 is not a string.
%% choice
`None`
%% explain
`in` looks at the keys of a dictionary. The only key here is `"a"`, so the answer is `False`. To test the values, you can write `10 in d.values()`.
%% end

## keys, values and items

Three methods give you a **view** of the contents. Wrap a view in `list()` when you want to see it as a list:

```python run
ages = {"Ada": 36, "Grace": 45, "Linus": 28}
print(list(ages.keys()))
print(list(ages.values()))
print(list(ages.items()))
```

The `items` view holds `(key, value)` tuples. That is exactly what a loop needs.

## Looping over a dictionary

A plain `for` loop visits the **keys**. Use `.items()` to get the key and the value together, and `.values()` when you only need the values:

```python run
ages = {"Ada": 36, "Grace": 45, "Linus": 28}
for name in ages:
    print(name)
for name, age in ages.items():
    print(name, "is", age)
total = 0
for age in ages.values():
    total += age
print("Total age:", total)
```

Dictionaries remember the order in which the keys were added, so these loops always visit the entries in the same order that you created them.

## What can be a key?

A key has to be **immutable**: a string, a number or a tuple. A list cannot be a key, because it could change after it was used. Values can be anything, including lists and other dictionaries:

```python run error
bad = {[1, 2]: "a list as a key"}
```

Python reports **TypeError: unhashable type: 'list'**. Tuples work well as keys, for instance for coordinates:

```python run
treasure = {(0, 0): "start", (3, 4): "treasure"}
print(treasure[(3, 4)])
```

%% question q-key-types | multi
Select every value that can be used as a dictionary key.
%% choice correct
`"name"`
%% choice correct
`42`
%% choice correct
`(1, 2)`
%% choice
`[1, 2]`
%% choice
`{"a": 1}`
%% explain
Strings, numbers and tuples are immutable, so they can be keys. Lists and dictionaries can change, so Python refuses them.
%% end

## Dictionaries inside dictionaries

A value can itself be a dictionary or a list. This lets you describe real things with several fields. Use one pair of brackets for each level:

```python run
students = {
    "Ada": {"age": 17, "marks": [90, 85]},
    "Grace": {"age": 18, "marks": [70, 95]},
}
print(students["Ada"]["age"])
print(students["Grace"]["marks"][1])
students["Ada"]["marks"].append(100)
print(students["Ada"])
```

## Building and combining dictionaries

`dict(zip(keys, values))` builds a dictionary from two lists. The method `update` copies the entries of another dictionary into this one, and the operator `|` joins two dictionaries into a **new** one. When both have the same key, the right-hand value wins:

```python run
names = ["Ada", "Grace", "Linus"]
ages = [36, 45, 28]
people = dict(zip(names, ages))
print(people)
people.update({"Margaret": 50})
print(people)
more = people | {"Ada": 37, "Zed": 20}
print(more)
print(people)
```

The last line shows that `|` left `people` unchanged.

%% question q-merge-predict | predict
What does this program print?

```python
a = {"x": 1, "y": 2}
b = {"y": 20, "z": 30}
print(a | b)
```
%% answer
{'x': 1, 'y': 20, 'z': 30}
%% explain
The merged dictionary has all the keys of both. The key `"y"` is in both, and the value from `b`, the right-hand dictionary, replaces the one from `a`.
%% end

## Your turn

%% exercise phone-lookup | Phone book lookup
The dictionary `phonebook` is set up for you. Read a name and print that person's number, or `Not found` when the name is not in the book. For the input `Grace` the program prints:

```output
0805-222
```
%% stdin
Grace
%% starter
phonebook = {"Ada": "0803-111", "Grace": "0805-222", "Linus": "0807-333"}
# Read the name, then look it up.

%% solution
phonebook = {"Ada": "0803-111", "Grace": "0805-222", "Linus": "0807-333"}
name = input()
print(phonebook.get(name, "Not found"))
%% tests
expect_output("0805-222")
check(rerun("Zed").strip() == "Not found", "a name that is not in the book")
check(rerun("Ada").strip() == "0803-111", "Ada")
check(rerun("ada").strip() == "Not found", "keys are case sensitive")
%% hint
Read the name with `input()` first.
%% hint
`get` takes a second argument that is returned when the key is missing.
%% hint
`print(phonebook.get(name, "Not found"))`
%% end

%% exercise stock-update | Stock update
Read lines of the form `item amount` until a line says `end`. Keep a running total for each item. At the end print one line for each item, in the order in which the items first appeared, in the form `apples: 8`. For the input `apples 5`, `pears 2`, `apples 3` and `end` the program prints:

```output
apples: 8
pears: 2
```
%% stdin
apples 5
pears 2
apples 3
end
%% starter
# Keep the totals in a dictionary.

%% solution
stock = {}
while True:
    line = input()
    if line == "end":
        break
    item, amount = line.split()
    if item in stock:
        stock[item] += int(amount)
    else:
        stock[item] = int(amount)
for item, amount in stock.items():
    print(f"{item}: {amount}")
%% tests
expect_output("apples: 8\npears: 2")
check(rerun("a 1\nend").strip() == "a: 1", "one item")
check(rerun("x 2\ny 3\nx 4\nend").strip() == "x: 6\ny: 3", "two items, one repeated")
check(rerun("end").strip() == "", "nothing to report")
%% hint
Split each line into the item and the amount. The amount has to become a number.
%% hint
Add to the total when the item is already a key. Otherwise create the entry.
%% hint
Print with `for item, amount in stock.items():` after the loop has finished.
%% end

%% exercise build-dict | Build a dictionary
Read two lines. The first holds names separated by spaces, and the second holds ages separated by spaces. Build a dictionary from names to ages (as numbers) and print it. For the input `Ada Grace` and `36 45` the program prints:

```output
{'Ada': 36, 'Grace': 45}
```
%% stdin
Ada Grace
36 45
%% starter
# Names first, then ages.

%% solution
names = input().split()
ages = []
for text in input().split():
    ages.append(int(text))
print(dict(zip(names, ages)))
%% tests
expect_output("{'Ada': 36, 'Grace': 45}")
check(rerun("x\n1").strip() == "{'x': 1}", "one entry")
check(rerun("a b c\n1 2 3").strip() == "{'a': 1, 'b': 2, 'c': 3}", "three entries")
check(calls("zip"), "uses zip()")
%% hint
Convert the ages to numbers with a loop, as you did for lists of numbers.
%% hint
`zip(names, ages)` pairs each name with its age.
%% hint
`dict(...)` turns the pairs into a dictionary.
%% end

%% exercise nested-marks | Challenge: Nested marks
The dictionary `marks` holds the marks of two students. Read a student's name on the first line and a subject on the second line. Print the mark. If the student is not in the dictionary print `No such student`, and if the subject is missing for that student print `No such subject`. For the input `Grace` and `english` the program prints:

```output
95
```
%% stdin
Grace
english
%% starter
marks = {
    "Ada": {"maths": 90, "english": 85},
    "Grace": {"maths": 70, "english": 95},
}
# Read the student, then the subject.

%% solution
marks = {
    "Ada": {"maths": 90, "english": 85},
    "Grace": {"maths": 70, "english": 95},
}
student = input()
subject = input()
if student not in marks:
    print("No such student")
elif subject not in marks[student]:
    print("No such subject")
else:
    print(marks[student][subject])
%% tests
expect_output("95")
check(rerun("Ada\nhistory").strip() == "No such subject", "a missing subject")
check(rerun("Zed\nmaths").strip() == "No such student", "a missing student")
check(rerun("Ada\nmaths").strip() == "90", "Ada's maths mark")
%% hint
Check the student first, because a missing student has no marks to look at.
%% hint
For the subject, test `subject in marks[student]`.
%% hint
Use `if`, `elif` and `else`, so that exactly one message is printed.
%% end

## What you learned

- A dictionary stores `key: value` pairs in curly brackets, and `d[key]` looks a value up. A missing key raises a KeyError, while `d.get(key, default)` gives a default.
- `d[key] = value` adds or replaces an entry. `del d[key]` and `d.pop(key)` remove one.
- `in` tests the keys, `len()` counts the entries, and `.keys()`, `.values()` and `.items()` give views. `for key, value in d.items():` loops over both.
- Keys must be immutable (strings, numbers, tuples), and each key appears once. Dictionaries keep the insertion order.
- Values can be lists or dictionaries, and nested lookups use one pair of brackets per level.
- `dict(zip(keys, values))` builds a dictionary, `update` copies entries in, and `a | b` merges into a new dictionary in which the right side wins.
