---
title: Designing with classes
---
Writing a class takes only a few lines. Deciding **which** classes a program should have is the harder question, and it comes first. A good design makes the program feel natural: each class stands for a thing from the problem, it knows its own rules, and the pieces fit together without tangles. A poor design makes every change painful. In this lesson you learn a simple way to turn a problem into classes, how objects can contain other objects, how `dataclass` removes repetitive code, and how to rewrite older code in an object style.

## From a problem to classes

Start with the description of the problem in plain words, and mark its parts:

- The **nouns** are candidates for classes (or for attributes).
- The **verbs** are candidates for methods.
- The facts about a noun (a title, a price) are its attributes.

Take this description: "A library has books. A member can borrow a book, and a book can be borrowed by one member at a time. The library can tell which books are available."

| Noun | Becomes | Attributes | Methods (verbs) |
| --- | --- | --- | --- |
| book | class `Book` | title, author, available | `borrow`, `give_back` |
| member | class `Member` | name, books they hold | `borrow`, `return` |
| library | class `Library` | a list of books and members | `add`, `find`, `list_available` |

Not every noun deserves a class. "Title" is only a piece of text, so it is an attribute of `Book`. Ask: does it have its own data **and** its own behaviour? If not, a plain value is enough. And you do not have to get the design perfect in the first attempt. Make a first version, use it, and change it when it feels awkward.

## Encapsulation

**Encapsulation** means that an object keeps its data and the rules for changing it **together**. Other code should ask the object to do things, through methods, and not reach inside to change attributes. Here, outside code breaks a rule of the account, and nothing stops it:

```python run
class Account:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

acc = Account(100)
acc.balance -= 500
print(acc.balance)
```

The balance is now -400, because the code went around the method. The rule exists only when everybody uses `withdraw`. Python does not stop you (there is no truly private attribute), so encapsulation is a **habit**: use the methods, and treat names that start with an underscore as internal. A property, as in lesson 3, can make the rule impossible to avoid.

%% question q-nouns-choice | choice
A description says: "A school has teachers and classes. A teacher teaches a class." Which are the best candidates for classes?
%% choice
`has` and `teaches`
%% choice correct
`School`, `Teacher` and `Class`
%% choice
Only `School`
%% choice
`a` and `the`
%% explain
The nouns that have their own data and behaviour become classes: school, teacher and class. The verbs, such as "teaches", become methods.
%% end

## Composition: objects that contain objects

Real things are made of other things. A library **has** books. An object that holds other objects in its attributes is an example of **composition**, and it is the main way to build bigger classes from smaller ones. The `Library` below keeps a list of `Book` objects, and it uses the methods of the books:

```python run
class Book:
    def __init__(self, title, author):
        self.title = title
        self.author = author
        self.available = True

    def __str__(self):
        state = "in" if self.available else "out"
        return f"{self.title} by {self.author} [{state}]"

class Library:
    def __init__(self):
        self.books = []

    def add(self, book):
        self.books.append(book)

    def find(self, title):
        for book in self.books:
            if book.title == title:
                return book
        return None

    def borrow(self, title):
        book = self.find(title)
        if book is None:
            raise ValueError(f"no book called {title}")
        if not book.available:
            raise ValueError(f"{title} is already out")
        book.available = False

library = Library()
library.add(Book("Dune", "Frank Herbert"))
library.add(Book("Emma", "Jane Austen"))
library.borrow("Dune")
for book in library.books:
    print(book)

try:
    library.borrow("Dune")
except ValueError as e:
    print("Error:", e)
```

Every class has one clear job. A `Book` knows about itself, and a `Library` knows how to manage many books. Because `Library.borrow` uses `find`, the search is written once. Module 11 compares composition with inheritance, which is another way of building classes from other classes.

## Dataclasses

Some classes mostly **hold data**. Writing `__init__`, `__repr__` and `__eq__` for them by hand is repetitive, and every new attribute must be added in three places. The decorator `@dataclass` from the module `dataclasses` writes those methods for you from a list of **fields**. A field is a name with a **type annotation**, which is a colon and a type:

```python run
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

p = Point(3, 4)
print(p)
print(p == Point(3, 4))
p.x = 10
print(p)
```

The class got an `__init__` that takes `x` and `y`, a `__repr__` that prints the field names and values, and an `__eq__` that compares the fields. The annotation `int` is documentation for the reader. Python does not check it, so `Point("a", "b")` would be accepted.

A field can have a **default value**. Fields with defaults must come after the fields without defaults. For a list or another mutable default, you must use `field(default_factory=...)`, which makes a new list for every object. Python refuses a plain `[]` to protect you from the shared-list bug of module 9:

```python run
from dataclasses import dataclass, field

@dataclass
class Student:
    name: str
    score: int = 0
    courses: list = field(default_factory=list)

    def enrol(self, course):
        self.courses.append(course)

a = Student("Ada")
b = Student("Grace", 90)
a.enrol("Maths")
print(a)
print(b)

try:
    @dataclass
    class Bad:
        items: list = []
except ValueError as e:
    print("Error:", e)
```

A dataclass can still have methods, as `enrol` shows. Two options change its behaviour. With `order=True` the objects can be compared with `<`, field by field from left to right, and so they can be sorted. With `frozen=True` the fields cannot be changed after creation, and the objects can be used in sets and as dictionary keys:

```python run
from dataclasses import dataclass

@dataclass(order=True)
class Version:
    major: int
    minor: int

print(sorted([Version(2, 1), Version(1, 9), Version(2, 0)]))
print(Version(1, 2) < Version(1, 10))

@dataclass(frozen=True)
class Colour:
    red: int
    green: int
    blue: int

c = Colour(255, 0, 0)
try:
    c.red = 0
except AttributeError as e:
    print(type(e).__name__, e)
print(len({c, Colour(255, 0, 0)}))
```

| You write | You get |
| --- | --- |
| `@dataclass` | `__init__`, `__repr__` and `__eq__` |
| `name: type = default` | a field with a default value |
| `field(default_factory=list)` | a new empty list for each object |
| `@dataclass(order=True)` | `<`, `<=`, `>` and `>=` that compare the fields in order |
| `@dataclass(frozen=True)` | fields that cannot be changed, and hashable objects |

Choose a dataclass when the class is mostly a record of values (a point, a student, a colour, an order). Choose an ordinary class when the object has a lot of its own logic and the `__init__` does real work.

%% question q-dataclass-predict | predict
What does this program print?

```python
from dataclasses import dataclass

@dataclass
class P:
    x: int
    y: int = 0

print(P(5))
print(P(1, 2) == P(1, 2))
```
%% answer
P(x=5, y=0)
True
%% explain
The generated `__repr__` shows the class name, then each field as `name=value`, and the default fills in `y=0`. The generated `__eq__` compares the fields, so two objects with the same values are equal.
%% end

%% question q-factory-fill | fill
Fill in the blank so that the program prints `0`.

```python
from dataclasses import dataclass, field

@dataclass
class Team:
    name: str
    members: list = field(default_factory=___)

a = Team("A")
b = Team("B")
a.members.append("Ada")
print(len(b.members))
```
%% answer
list
%% expected
0
%% explain
`default_factory=list` calls `list()` for every new `Team`, so each team has its own empty list. Adding Ada to team A does not touch team B, whose list stays empty.
%% end

## Refactoring: from dictionaries to classes

You will often meet code that keeps its data in dictionaries and its behaviour in functions that receive the dictionary. It works, and it is a fair way to start, but it grows messy. Compare:

```python run
students = [
    {"name": "Ada", "scores": [90, 85]},
    {"name": "Grace", "scores": [70, 95]},
]

def average(student):
    return sum(student["scores"]) / len(student["scores"])

def best(students):
    return max(students, key=average)

print(best(students)["name"])
print(average(students[1]))
```

Here is the same program as classes:

```python run
from dataclasses import dataclass, field

@dataclass
class Student:
    name: str
    scores: list = field(default_factory=list)

    def average(self):
        return sum(self.scores) / len(self.scores)

class Gradebook:
    def __init__(self):
        self.students = []

    def add(self, student):
        self.students.append(student)

    def best(self):
        return max(self.students, key=lambda s: s.average())

book = Gradebook()
book.add(Student("Ada", [90, 85]))
book.add(Student("Grace", [70, 95]))
print(book.best().name)
print(book.students[1].average())
```

The refactoring recipe has four steps, and the program must give the **same output** at each step:

1. **Find the data that travels together** (the dictionary keys) and make it the attributes of a class.
2. **Find the functions** whose first parameter is that data, and move them into the class as methods.
3. **Replace** `student["scores"]` with `self.scores`. A misspelt key in a dictionary fails at run time, but most editors flag a misspelt attribute name before you run anything.
4. **Run the program again**, and compare the output with the old one.

%% question q-compose-multi | multi
Select every true statement about class design.
%% choice correct
The nouns in a description are candidates for classes, and the verbs are candidates for methods.
%% choice correct
A `Library` that keeps a list of `Book` objects is an example of composition.
%% choice
Every noun must become a class.
%% choice correct
A dataclass can still have ordinary methods.
%% explain
Nouns suggest classes and verbs suggest methods, but a plain value such as a title is only an attribute. An object that contains other objects is composition, and `@dataclass` only writes the boring methods for you, so you can add your own.
%% end

## A project: tic-tac-toe

Here is a complete small design. A `Board` knows the rules of the game: where a mark can go, who has won, and when the board is full. The loop that reads the moves knows nothing about rows and columns. Empty squares are shown with a dot:

```python run stdin="0 0\n1 0\n0 0\n0 1\n1 1\n0 2"
WINS = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]

class Board:
    def __init__(self):
        self.cells = ["."] * 9

    def place(self, row, col, mark):
        if not (0 <= row < 3 and 0 <= col < 3):
            raise ValueError("that square is not on the board")
        if self.cells[row * 3 + col] != ".":
            raise ValueError("that square is taken")
        self.cells[row * 3 + col] = mark

    def winner(self):
        for a, b, c in WINS:
            if self.cells[a] != "." and self.cells[a] == self.cells[b] == self.cells[c]:
                return self.cells[a]
        return None

    def is_full(self):
        return "." not in self.cells

    def __str__(self):
        rows = []
        for start in (0, 3, 6):
            rows.append("|".join(self.cells[start:start + 3]))
        return "\n-+-+-\n".join(rows)

board = Board()
player = "X"
while board.winner() is None and not board.is_full():
    row, col = input().split()
    try:
        board.place(int(row), int(col), player)
    except ValueError as e:
        print("Error:", e)
        continue
    player = "O" if player == "X" else "X"

print(board)
if board.winner():
    print(board.winner(), "wins")
else:
    print("Draw")
```

Count what this design gives you. The move `0 0` was refused the second time with a clear message, and the player kept the turn. The table `WINS` lists the eight lines that can win (three rows, three columns and two diagonals) as positions in the flat list of nine squares, so `winner` is a short loop over data. A row and a column become one position with `row * 3 + col`. If you wanted a bigger board, or a game for the web, you would change the class, and the rest of the program would stay almost the same.

%% question q-order-dataclass | order
Put the lines in order so that the program prints `Point(x=1, y=2)`. One line does not belong.
%% lines
from dataclasses import dataclass
@dataclass
class Point:
    x: int
    y: int
print(Point(1, 2))
%% distractors
    self.x = x
%% expected
Point(x=1, y=2)
%% explain
The import comes first, then the decorator directly above the class, then the two annotated fields. The line `self.x = x` belongs inside an `__init__` method, and a dataclass writes that method for you.
%% end

## Your turn

%% exercise dataclass-book | A dataclass for books
Define a dataclass `Book` with the fields `title`, `author` and `pages` (a whole number). Read two books, each on a line `title,author,pages`. Print the first book, and then `True` or `False` for whether the two books are equal. For the input below the program prints:

```output
Book(title='Dune', author='Frank Herbert', pages=412)
False
```
%% stdin
Dune,Frank Herbert,412
Emma,Jane Austen,474
%% starter
# Define the dataclass Book, then read the two lines.

%% solution
from dataclasses import dataclass

@dataclass
class Book:
    title: str
    author: str
    pages: int

def read_book():
    title, author, pages = input().split(",")
    return Book(title, author, int(pages))

first = read_book()
second = read_book()
print(first)
print(first == second)
%% tests
expect_output("Book(title='Dune', author='Frank Herbert', pages=412)\nFalse")
check(defines("Book"), "defines a class called Book")
check(uses("ClassDef") and "dataclass" in source(), "uses @dataclass")
b = Book("A", "B", 3)
expect(repr(b), "Book(title='A', author='B', pages=3)", "the repr")
check(b == Book("A", "B", 3), "equal books")
check(b != Book("A", "B", 4), "different books")
check(rerun("X,Y,1\nX,Y,1").strip() == "Book(title='X', author='Y', pages=1)\nTrue", "two equal books")
%% hint
Start with `from dataclasses import dataclass`, and put `@dataclass` above the class.
%% hint
The fields are annotated names: `title: str`, `author: str` and `pages: int`.
%% hint
Read each line with `input().split(",")`, and convert the pages with `int(...)` before you create the `Book`.
%% end

%% exercise inventory | An inventory
Define a dataclass `Item` with a `name`, a `price` and a `quantity`, and a class `Inventory` that keeps its items in a dictionary by name. The method `add(name, price, quantity)` creates the item, or adds to the quantity when the item exists. The method `remove(name, quantity)` raises a `ValueError` with the message `unknown item` when the name does not exist, and `not enough stock` when the quantity is too large. The method `total_value()` returns the sum of price times quantity. The program reads commands until `quit`: `add NAME PRICE QUANTITY`, `remove NAME QUANTITY` and `value`. For `value` it prints the total with two decimals. A refused request prints `Error:` and the message. For the input below the program prints:

```output
Value: 12.50
Error: not enough stock
Error: unknown item
Value: 7.50
```
%% stdin
add pen 2.5 5
value
remove pen 9
remove ink 1
remove pen 2
value
quit
%% starter
# Define Item (a dataclass) and Inventory, then read the commands.

%% solution
from dataclasses import dataclass

@dataclass
class Item:
    name: str
    price: float
    quantity: int

class Inventory:
    def __init__(self):
        self.items = {}

    def add(self, name, price, quantity):
        if name in self.items:
            self.items[name].quantity += quantity
        else:
            self.items[name] = Item(name, price, quantity)

    def remove(self, name, quantity):
        if name not in self.items:
            raise ValueError("unknown item")
        if quantity > self.items[name].quantity:
            raise ValueError("not enough stock")
        self.items[name].quantity -= quantity

    def total_value(self):
        total = 0
        for item in self.items.values():
            total += item.price * item.quantity
        return total

inventory = Inventory()
while True:
    parts = input().split()
    if parts[0] == "quit":
        break
    try:
        if parts[0] == "add":
            inventory.add(parts[1], float(parts[2]), int(parts[3]))
        elif parts[0] == "remove":
            inventory.remove(parts[1], int(parts[2]))
        elif parts[0] == "value":
            print(f"Value: {inventory.total_value():.2f}")
    except ValueError as e:
        print("Error:", e)
%% tests
expect_output("Value: 12.50\nError: not enough stock\nError: unknown item\nValue: 7.50")
check(defines("Item") and defines("Inventory"), "defines Item and Inventory")
inv = Inventory()
inv.add("a", 2, 3)
inv.add("a", 2, 4)
expect(inv.total_value(), 14, "adding to an existing item")
inv.remove("a", 7)
expect(inv.total_value(), 0, "removing all the stock")
check(raises(ValueError, inv.remove, "a", 1), "removing from an empty item")
check(raises(ValueError, inv.remove, "zzz", 1), "an unknown item")
check(rerun("add x 1.5 4\nadd y 0.25 4\nvalue\nquit").strip() == "Value: 7.00", "two items")
%% hint
`Item` is a dataclass with three fields. `Inventory` keeps a dictionary `self.items` that maps a name to an `Item`.
%% hint
In `add`, test `name in self.items`. If it is there, increase its `quantity`, and otherwise create a new `Item`.
%% hint
In `remove`, check the name first, then the quantity, and raise the `ValueError` before you change anything. `total_value` adds up `item.price * item.quantity` in a loop.
%% end

%% exercise refactor-account | Refactor into a class
The starter code keeps an account in a dictionary, with two functions. Rewrite it with a class `Account` (an `owner` and a `balance`) and the methods `deposit` and `withdraw`, so that the program prints exactly the same:

```output
Ada 120
Error: not enough money
```
%% starter
account = {"owner": "Ada", "balance": 100}

def deposit(account, amount):
    account["balance"] += amount

def withdraw(account, amount):
    if amount > account["balance"]:
        raise ValueError("not enough money")
    account["balance"] -= amount

deposit(account, 50)
withdraw(account, 30)
print(account["owner"], account["balance"])
try:
    withdraw(account, 500)
except ValueError as e:
    print("Error:", e)

%% solution
class Account:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

account = Account("Ada", 100)
account.deposit(50)
account.withdraw(30)
print(account.owner, account.balance)
try:
    account.withdraw(500)
except ValueError as e:
    print("Error:", e)
%% tests
expect_output("Ada 120\nError: not enough money")
check(defines("Account"), "defines a class called Account")
a = Account("Zed", 10)
a.deposit(5)
expect(a.balance, 15, "deposit")
a.withdraw(15)
expect(a.balance, 0, "withdraw")
check(raises(ValueError, a.withdraw, 1), "withdrawing too much raises a ValueError")
expect(a.owner, "Zed", "the attribute owner")
check("deposit" not in ns and "withdraw" not in ns, "deposit and withdraw are methods now, not functions")
check("account[" not in source(), "no dictionary access is left")
%% hint
The dictionary keys become attributes: `self.owner` and `self.balance`, set in `__init__`.
%% hint
Each function becomes a method. The parameter `account` is replaced by `self`.
%% hint
Replace the dictionary with `account = Account("Ada", 100)`, and the calls with `account.deposit(50)` and `account.withdraw(30)`.
%% end

%% exercise shapes | Shapes
Define the classes `Circle(radius)`, `Rectangle(width, height)` and `Square(side)`, each with a method `area()`. Use 3.14159 for pi. Read lines until `done`: `circle 2`, `rect 3 4` or `square 5`. Print the area of each shape with two decimals, and at the end the total area with two decimals. For the input below the program prints:

```output
12.57
12.00
25.00
Total: 49.57
```
%% stdin
circle 2
rect 3 4
square 5
done
%% starter
# Define Circle, Rectangle and Square, then read the shapes.

%% solution
class Circle:
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

class Square:
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

shapes = []
while True:
    parts = input().split()
    if parts[0] == "done":
        break
    if parts[0] == "circle":
        shapes.append(Circle(float(parts[1])))
    elif parts[0] == "rect":
        shapes.append(Rectangle(float(parts[1]), float(parts[2])))
    elif parts[0] == "square":
        shapes.append(Square(float(parts[1])))

total = 0
for shape in shapes:
    print(f"{shape.area():.2f}")
    total += shape.area()
print(f"Total: {total:.2f}")
%% tests
expect_output("12.57\n12.00\n25.00\nTotal: 49.57")
check(defines("Circle") and defines("Rectangle") and defines("Square"), "defines the three classes")
expect(Square(3).area(), 9, "area of a square")
expect(Rectangle(2, 5).area(), 10, "area of a rectangle")
expect(Circle(1).area(), 3.14159, "area of a circle", approx=0.00001)
check(rerun("square 2\ndone").strip() == "4.00\nTotal: 4.00", "a single square")
check(rerun("done").strip() == "Total: 0.00", "no shapes")
%% hint
Each class stores its measurements in `__init__` and calculates the answer in `area()`.
%% hint
Circle: `3.14159 * self.radius ** 2`. Rectangle: `self.width * self.height`. Square: `self.side ** 2`.
%% hint
Keep all the shape objects in one list. Loop over it to print `shape.area()` with `:.2f` and to add up the total.
%% end

%% exercise tic-tac-toe | Challenge: Tic-tac-toe
The main loop of a tic-tac-toe game is in the starter code. Write the class `Board`. Its method `place(row, col, mark)` raises a `ValueError` with the message `that square is not on the board` when the row or column is not 0, 1 or 2, and `that square is taken` when the square is not empty. Its method `winner()` returns `"X"`, `"O"` or `None`. Its method `is_full()` tells whether there is no empty square, and `str(board)` shows three rows separated by `-+-+-`, with a dot for an empty square. For the input below the program prints:

```output
Error: that square is taken
X|X|X
-+-+-
O|O|.
-+-+-
.|.|.
X wins
```
%% stdin
0 0
1 0
0 0
0 1
1 1
0 2
%% starter
# Write the class Board above the loop.

board = Board()
player = "X"
while board.winner() is None and not board.is_full():
    row, col = input().split()
    try:
        board.place(int(row), int(col), player)
    except ValueError as e:
        print("Error:", e)
        continue
    player = "O" if player == "X" else "X"

print(board)
if board.winner():
    print(board.winner(), "wins")
else:
    print("Draw")

%% solution
WINS = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]

class Board:
    def __init__(self):
        self.cells = ["."] * 9

    def place(self, row, col, mark):
        if not (0 <= row < 3 and 0 <= col < 3):
            raise ValueError("that square is not on the board")
        if self.cells[row * 3 + col] != ".":
            raise ValueError("that square is taken")
        self.cells[row * 3 + col] = mark

    def winner(self):
        for a, b, c in WINS:
            if self.cells[a] != "." and self.cells[a] == self.cells[b] == self.cells[c]:
                return self.cells[a]
        return None

    def is_full(self):
        return "." not in self.cells

    def __str__(self):
        rows = []
        for start in (0, 3, 6):
            rows.append("|".join(self.cells[start:start + 3]))
        return "\n-+-+-\n".join(rows)

board = Board()
player = "X"
while board.winner() is None and not board.is_full():
    row, col = input().split()
    try:
        board.place(int(row), int(col), player)
    except ValueError as e:
        print("Error:", e)
        continue
    player = "O" if player == "X" else "X"

print(board)
if board.winner():
    print(board.winner(), "wins")
else:
    print("Draw")
%% tests
expect_output("Error: that square is taken\nX|X|X\n-+-+-\nO|O|.\n-+-+-\n.|.|.\nX wins")
check(defines("Board"), "defines a class called Board")
b = Board()
expect(b.winner(), None, "an empty board has no winner")
check(not b.is_full(), "an empty board is not full")
b.place(0, 2, "O")
b.place(1, 1, "O")
b.place(2, 0, "O")
expect(b.winner(), "O", "the diagonal from the top right")
check(raises(ValueError, b.place, 1, 1, "X"), "a taken square")
check(raises(ValueError, b.place, 3, 0, "X"), "a row outside the board")
check(raises(ValueError, b.place, 0, -1, "X"), "a column outside the board")
c = Board()
c.place(0, 0, "X")
c.place(1, 0, "X")
c.place(2, 0, "X")
expect(c.winner(), "X", "the first column")
expect(str(Board()), ".|.|.\n-+-+-\n.|.|.\n-+-+-\n.|.|.", "the empty board")
draw = "0 0\n0 1\n0 2\n1 1\n1 0\n1 2\n2 1\n2 0\n2 2"
check(rerun(draw).strip() == "X|O|X\n-+-+-\nX|O|O\n-+-+-\nO|X|X\nDraw", "a draw")
%% hint
Keep the nine squares in one list filled with `"."`. A row and a column become a position with `row * 3 + col`.
%% hint
`winner` checks eight lines: three rows, three columns and two diagonals. Write each line once as a triple of positions, such as `(0, 1, 2)`, in a list. A line wins when its three squares are equal and not `"."`.
%% hint
`__str__` joins the squares of each row with `"|"` (a slice such as `self.cells[0:3]` gives one row), and joins the three rows with `"\n-+-+-\n"`. Return the text, and do not print it.
%% end

## What you learned

- To design with classes, read the description of the problem: **nouns** are candidates for classes, **verbs** for methods, and the facts about a noun are its attributes. A plain value does not need a class.
- **Encapsulation**: keep the data of an object and the rules for changing it together, and use the methods from outside. Python relies on habit (and `_underscore` names) for this.
- **Composition**: an object can hold other objects in its attributes (a `Library` has a list of `Book` objects). Each class has one clear job.
- `@dataclass` writes `__init__`, `__repr__` and `__eq__` from annotated fields. Fields can have defaults, mutable defaults need `field(default_factory=list)`, `order=True` allows sorting, and `frozen=True` makes the objects unchangeable and hashable.
- To **refactor** dictionaries and functions into a class, make the keys into attributes, make the functions into methods, replace the dictionary access with attribute access, and check that the output has not changed.
- A small game such as tic-tac-toe shows the result: the `Board` class knows the rules, and the main loop only reads moves and shows results.
