---
title: Choosing the right container
---
You now know four containers: the list, the tuple, the dictionary and the set. They all hold several values, but each one holds them in its own way. The right choice often makes a program shorter, clearer and faster, and the wrong choice can make a simple job awkward. In this lesson you learn how to choose, how to combine containers to describe real data, and how to copy nested data safely. At the end you build a small contact book, and then an inventory of your own.

## The four containers side by side

| Feature | List | Tuple | Dictionary | Set |
|---|---|---|---|---|
| Written with | `[1, 2]` | `(1, 2)` | `{"a": 1}` | `{1, 2}` |
| Empty one | `[]` | `()` | `{}` | `set()` |
| Keeps an order | yes | yes | yes, the order of insertion | no |
| Can change after creation | yes | no | yes | yes |
| Duplicates | allowed | allowed | keys are unique | items are unique |
| You find an item by | its position | its position | its key | asking `in` |

Two rows of the table decide most choices. The first is **how you want to find an item**: by its position (list and tuple), by a name that you chose (dictionary), or by asking whether it is there (set). The second is **whether the data changes**. A list, a dictionary and a set can grow and shrink while the program runs. A tuple is fixed for its whole life, and that is useful: it tells the reader that these values belong together and will not change.

## Four questions that choose for you

Ask these questions in this order, and stop at the first "yes":

1. Do you need to look values up by a name, such as a product, a person or a word? Use a **dictionary**.
2. Do you only need to know whether something is there, or to keep only the different items? Use a **set**.
3. Is it a small, fixed group of values that belong together, such as a point `(x, y)` or a date? Use a **tuple**.
4. Otherwise, you have items in an order, with repeats allowed, and you add or remove them as the program runs. Use a **list**.

Here is one tiny example of each container doing the job that it is best at:

```python run
# A list: ordered items, repeats allowed, changes over time
queue = ["Ada", "Grace", "Ada"]
queue.append("Linus")
print(queue)

# A tuple: one fixed group of values
point = (3, 4)
x, y = point
print(x, y)

# A dictionary: look up by name
price = {"tea": 300, "bread": 500}
print(price["bread"])

# A set: only "is it there?" matters
tickets = {"A1", "B7", "C3"}
print("B7" in tickets)
```

%% question q-which-container | choice
A website must remember which user IDs have already logged in today, and it must check this quickly for every new login. No other data is stored. Which container fits best?
%% choice
A list, because the IDs arrive one after another.
%% choice
A tuple, because the IDs never change.
%% choice correct
A set, because only "has this ID been seen?" matters and every ID counts once.
%% choice
A dictionary, because each ID needs a key.
%% explain
The program only asks whether an ID is present, and an ID that logs in twice is still one ID. That is exactly what a set stores and checks quickly. A dictionary would need a value for every key, and a list would search the items one by one.
%% end

## Why keys and set items must be immutable

Python finds a dictionary key or a set item by computing a number from it. If the item could change later, its number would change too, and Python could no longer find the entry that it stored. That is why a list is not allowed as a key or as a set item, and a tuple is:

```python run error
bad = {[1, 2], [3, 4]}
```

Python reports **TypeError: unhashable type: 'list'**. When you need a list-like key, turn the list into a tuple first:

```python run
seen_orders = set()
order = ["tea", "bread"]
seen_orders.add(tuple(order))
print(("tea", "bread") in seen_orders)
```

A tuple is only allowed as a key when everything inside it is immutable too. A tuple that holds a list is still rejected.

## Describing real data by nesting

Real data has a shape. A shop has a name, an opening state and many products, and each product has a name, a price and some tags. You describe it by putting containers inside each other: dictionaries for things with named fields, lists for sequences of things, and sets for tags that must be unique:

```python run
shop = {
    "name": "Corner Shop",
    "open": True,
    "products": [
        {"name": "tea", "price": 300, "tags": {"drink", "hot"}},
        {"name": "bread", "price": 500, "tags": {"food"}},
    ],
}
print(shop["name"])
print(shop["products"][1]["name"])
for product in shop["products"]:
    print(product["name"], product["price"])
print("hot" in shop["products"][0]["tags"])
```

Read the path `shop["products"][1]["name"]` from left to right: the dictionary `shop`, then the list under `"products"`, then item 1 of the list, which is a dictionary, then its `"name"`. Data in this shape, built from dictionaries, lists, strings, numbers and `True` or `False`, is how most programs on the internet exchange information. A format called JSON writes it as text, and a later module shows you how to read and write it.

A dictionary of dictionaries works well as a small database that you look up by name:

```python run
catalogue = {
    "tea": {"price": 300, "stock": 12},
    "bread": {"price": 500, "stock": 0},
    "milk": {"price": 450, "stock": 7},
}
value = 0
for name, info in catalogue.items():
    value += info["price"] * info["stock"]
    if info["stock"] == 0:
        print(name, "is sold out")
print("Stock value:", value)
```

%% question q-nested-fill | fill
Fill in the blank so that the program prints `bread`.

```python
shop = {"products": [{"name": "tea"}, {"name": "bread"}]}
print(shop["products"][___]["name"])
```
%% answer
1
%% expected
bread
%% explain
`shop["products"]` is a list, and `bread` is its second item, at position 1. The item at position 1 is a dictionary, and its `"name"` is `bread`.
%% end

## Which container for this job?

With practice the choice becomes quick. Here are some jobs and the container that suits each one best:

- The seven days of the week, which never change: a **tuple**.
- The words of a sentence, in order, with repeats: a **list**.
- Phone numbers by contact name: a **dictionary**.
- How many times each word is used: a **dictionary** from word to count.
- All the different words in a text: a **set**.
- The (row, column) position of a square on a board: a **tuple**.
- Students grouped by class: a **dictionary of lists**, or of sets when a student must not appear twice.
- The positions that a robot has already visited: a **set of tuples**.

%% question q-dict-jobs | multi
Select every job that a dictionary does best.
%% choice correct
Prices by product name.
%% choice correct
How many times each letter appears in a text.
%% choice correct
Students grouped by their class.
%% choice
The (x, y) position of one point.
%% choice
A list of all the different visitors, with no other data.
%% explain
Prices, counts and groups all map one thing to another, which is the job of a dictionary. One point is a fixed pair, so a tuple fits it. A group of different visitors with no other data is a set.
%% end

## Copying nested containers

In an earlier lesson you saw that `copy()` makes a new container. With nesting there is a catch: the copy is **shallow**. The outer container is new, but the containers inside it are shared between the original and the copy:

```python run
original = {"name": "Ada", "marks": [90, 85]}
shallow = original.copy()
shallow["marks"].append(100)
print(original["marks"])
```

The original list changed, because both dictionaries hold the very same list. When you need a fully separate copy, use `deepcopy` from the `copy` module. It copies every level:

```python run
import copy

original = {"name": "Ada", "marks": [90, 85]}
deep = copy.deepcopy(original)
deep["marks"].append(100)
print(original["marks"])
print(deep["marks"])
```

%% question q-shallow-predict | predict
What does this program print?

```python
a = {"items": [1, 2]}
b = a.copy()
b["items"].append(3)
print(len(a["items"]))
```
%% answer
3
%% explain
`copy()` is shallow: `a` and `b` are two dictionaries that share one list. Appending to the list through `b` also changes it in `a`, so the list in `a` now has three items.
%% end

## A small project: the contact book

A contact book reads commands from the user and keeps the contacts in a dictionary. The loop reads a line, splits it into words, and acts on the first word:

```python run stdin="add Ada 0803-111\nadd Grace 0805-222\nfind Ada\nfind Zed\nlist\nquit"
contacts = {}
while True:
    parts = input("> ").split()
    command = parts[0]
    if command == "quit":
        break
    elif command == "add":
        contacts[parts[1]] = parts[2]
        print("Saved", parts[1])
    elif command == "find":
        print(contacts.get(parts[1], "No such contact"))
    elif command == "list":
        for name in sorted(contacts):
            print(name, contacts[name])
    else:
        print("Unknown command")
```

Try it with your own commands. Then improve it: what happens when you press Enter on an empty line? `parts[0]` fails with an IndexError, because the list is empty. A line `if not parts:` followed by `continue` would fix that. You could also add a `delete` command that uses `pop`.

## Your turn

%% exercise visitor-log | Visitor log
Read names, one per line, until a line says `stop`. For each name print `Hello, <name>` the first time you see it, and `Welcome back, <name>` every time after that. After `stop`, print how many different visitors came. For the input `ada`, `grace`, `ada` and `stop` the program prints:

```output
Hello, ada
Hello, grace
Welcome back, ada
Different visitors: 2
```
%% stdin
ada
grace
ada
stop
%% starter
# A set remembers who has been here.

%% solution
seen = set()
while True:
    name = input()
    if name == "stop":
        break
    if name in seen:
        print("Welcome back,", name)
    else:
        print("Hello,", name)
        seen.add(name)
print("Different visitors:", len(seen))
%% tests
expect_output("Hello, ada\nHello, grace\nWelcome back, ada\nDifferent visitors: 2")
check(rerun("x\nstop").strip() == "Hello, x\nDifferent visitors: 1", "one visitor")
check(rerun("a\na\na\nstop").strip() == "Hello, a\nWelcome back, a\nWelcome back, a\nDifferent visitors: 1", "the same visitor three times")
check(rerun("stop").strip() == "Different visitors: 0", "nobody came")
%% hint
Create an empty set with `set()` before the loop.
%% hint
Test `name in seen` before you add the name to the set.
%% hint
After the loop, `len(seen)` is the number of different visitors.
%% end

%% exercise safe-backup | Safe backup
The dictionary `team` holds a name and a list of members. Make a backup named `backup` that stays unchanged when `team` changes later. The last lines of the program add a member to `team` and print the length of both member lists. The program must print:

```output
3
2
```
%% starter
import copy

team = {"name": "Rockets", "members": ["Ada", "Grace"]}
# Make backup here.

team["members"].append("Linus")
print(len(team["members"]))
print(len(backup["members"]))

%% solution
import copy

team = {"name": "Rockets", "members": ["Ada", "Grace"]}
backup = copy.deepcopy(team)

team["members"].append("Linus")
print(len(team["members"]))
print(len(backup["members"]))
%% tests
expect_output("3\n2")
check(ns["backup"]["members"] == ["Ada", "Grace"], "the backup keeps the original members")
check(ns["team"]["members"] == ["Ada", "Grace", "Linus"], "the team has the new member")
check("deepcopy" in source(), "uses copy.deepcopy")
%% hint
A shallow copy shares the inner list, so adding a member to `team` would also change the backup.
%% hint
The `copy` module has a function that copies every level of a nested container.
%% hint
`backup = copy.deepcopy(team)`
%% end

%% exercise inventory | Inventory
A shop reads commands until a line says `end`. The command `add item amount` puts more of an item into stock. The command `sell item amount` takes the amount out of stock when enough is there, and otherwise prints `Not enough <item>` and changes nothing. When the commands end, print each item that was ever added with its amount, in the order in which it was first added, in the form `apples: 7`. For the input below the program prints:

```output
Not enough pears
Not enough apples
apples: 7
pears: 4
```
%% stdin
add apples 10
sell apples 3
sell pears 1
add pears 4
sell apples 20
end
%% starter
# Keep the stock in a dictionary from item to amount.

%% solution
stock = {}
while True:
    line = input()
    if line == "end":
        break
    command, item, amount = line.split()
    amount = int(amount)
    if command == "add":
        stock[item] = stock.get(item, 0) + amount
    elif stock.get(item, 0) >= amount:
        stock[item] -= amount
    else:
        print(f"Not enough {item}")
for item, amount in stock.items():
    print(f"{item}: {amount}")
%% tests
expect_output("Not enough pears\nNot enough apples\napples: 7\npears: 4")
check(rerun("add a 2\nsell a 2\nend").strip() == "a: 0", "selling everything leaves zero")
check(rerun("sell x 1\nend").strip() == "Not enough x", "selling an item that was never added")
check(rerun("add a 1\nadd b 2\nadd a 3\nend").strip() == "a: 4\nb: 2", "adding to an item twice")
%% hint
Split each line into the command, the item and the amount, and turn the amount into a number.
%% hint
For `add`, the new amount is `stock.get(item, 0) + amount`, which also works for an item that is not in stock yet.
%% hint
For `sell`, compare `stock.get(item, 0)` with the amount first. Subtract only when there is enough, and print the message otherwise.
%% end

%% exercise subject-groups | Challenge: Students by subject
Read lines of the form `student subject` until a line says `end`. A student may appear on several lines, and the same pair may even be typed twice. Print one line for each subject, in alphabetical order, in the form `maths: Ada Grace`, where the students of the subject are in alphabetical order and each student appears once. For the input below the program prints:

```output
art: Grace
maths: Ada Grace
```
%% stdin
Ada maths
Grace art
Grace maths
Ada maths
end
%% starter
# A dictionary of sets: subject -> students.

%% solution
groups = {}
while True:
    line = input()
    if line == "end":
        break
    student, subject = line.split()
    groups.setdefault(subject, set()).add(student)
for subject in sorted(groups):
    names = " ".join(sorted(groups[subject]))
    print(f"{subject}: {names}")
%% tests
expect_output("art: Grace\nmaths: Ada Grace")
check(rerun("Zed art\nend").strip() == "art: Zed", "one student, one subject")
check(rerun("B x\nA x\nA x\nend").strip() == "x: A B", "a repeated pair counts once and the names are sorted")
check(rerun("A y\nA x\nend").strip() == "x: A\ny: A", "one student in two subjects")
%% hint
Use a dictionary from the subject to a **set** of students, so that a repeated pair is stored once.
%% hint
`groups.setdefault(subject, set()).add(student)` creates the set when the subject is new.
%% hint
Loop over `sorted(groups)` for the subjects, and join `sorted(groups[subject])` for the students.
%% end

## What you learned

- A list keeps ordered items and allows repeats, a tuple is a fixed group of values, a dictionary maps keys to values, and a set keeps different items and answers "is it there?" quickly.
- To choose: look-ups by a name need a dictionary, "is it there?" or "different items" needs a set, a fixed group needs a tuple, and ordered items that change need a list.
- Dictionary keys and set items must be immutable (strings, numbers, tuples). Turn a list into a tuple with `tuple(...)` when you need it as a key.
- Containers can be nested to describe real data: dictionaries of dictionaries, lists of dictionaries, dictionaries of lists or of sets. Read a path such as `shop["products"][1]["name"]` from left to right.
- `copy()` is shallow and shares the inner containers. `copy.deepcopy(...)` copies every level.
- A loop that reads commands and updates a dictionary is the heart of many small programs, such as a contact book or an inventory.
