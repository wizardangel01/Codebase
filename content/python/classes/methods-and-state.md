---
title: Methods and state
---
An object is more than a bundle of values. It **remembers**, and it **changes** as the program runs. A bank account has a balance that goes up and down, a player in a game loses health, a counter counts. The values that an object holds at a moment are called its **state**, and methods are the way in which the state is read and changed. This lesson shows you how to write objects that behave well over time, how to print them, and how they travel through lists, dictionaries and functions.

## Methods that change state

A method changes the state when it assigns to an attribute of `self`:

```python run
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1

    def reset(self):
        self.count = 0

clicks = Counter()
clicks.increment()
clicks.increment()
print(clicks.count)
clicks.reset()
print(clicks.count)
```

A good class **protects its own rules**. A player's health must never go below zero or above 100, and the easiest place to keep that promise is inside the methods, so that no other part of the program has to remember it:

```python run
class Player:
    def __init__(self, name):
        self.name = name
        self.health = 100

    def take_damage(self, amount):
        self.health -= amount
        if self.health < 0:
            self.health = 0

    def heal(self, amount):
        self.health = min(100, self.health + amount)

    def is_alive(self):
        return self.health > 0

hero = Player("Ada")
hero.take_damage(30)
hero.heal(10)
print(hero.health, hero.is_alive())
hero.take_damage(500)
print(hero.health, hero.is_alive())
```

## Methods that call methods

A method can use the other methods of the same object, by calling them on `self`. This keeps each rule in one place. Below, `attack` does not repeat the rule about health, because it asks the other player to `take_damage`:

```python run
class Player:
    def __init__(self, name, power):
        self.name = name
        self.power = power
        self.health = 100

    def take_damage(self, amount):
        self.health = max(0, self.health - amount)

    def is_alive(self):
        return self.health > 0

    def attack(self, other):
        other.take_damage(self.power)
        if not other.is_alive():
            print(self.name, "defeated", other.name)

ada = Player("Ada", 40)
bob = Player("Bob", 25)
ada.attack(bob)
ada.attack(bob)
ada.attack(bob)
print(bob.health, bob.is_alive())
```

%% question q-health-predict | predict
What does this program print?

```python
class Tank:
    def __init__(self):
        self.level = 50

    def drain(self, amount):
        self.level = max(0, self.level - amount)

tank = Tank()
tank.drain(30)
tank.drain(30)
print(tank.level)
```
%% answer
0
%% explain
The first call leaves 20 in the tank. The second call would give -10, but `max(0, ...)` keeps the level at 0, so the program prints `0`.
%% end

## Class attributes and instance attributes

An attribute created with `self.` inside `__init__` belongs to **one object**. An attribute written directly in the class body belongs to the **class**, and every object can see it. Class attributes are good for constants and for numbers that the whole class shares, such as a count of the objects that were created:

```python run
class Dog:
    species = "Canis familiaris"
    count = 0

    def __init__(self, name):
        self.name = name
        Dog.count += 1

rex = Dog("Rex")
fido = Dog("Fido")
print(rex.species, fido.species)
print(Dog.count)
print(rex.count)
```

To change a class attribute, assign through the **class** (`Dog.count += 1`). If you assign through an object, Python creates a new instance attribute that hides the class attribute for that object only:

```python run
class Dog:
    species = "dog"

rex = Dog()
fido = Dog()
rex.species = "wolf"
print(rex.species, fido.species, Dog.species)
```

There is a trap that you may recognise from lesson 3 of module 9. A **list** written in the class body is a class attribute, so every object shares the same list:

```python run
class Basket:
    items = []

    def add(self, item):
        self.items.append(item)

a = Basket()
b = Basket()
a.add("tea")
print(b.items)
```

The second basket contains the tea. Data that belongs to one object must be created in `__init__`, with `self.items = []`:

```python run
class Basket:
    def __init__(self):
        self.items = []

    def add(self, item):
        self.items.append(item)

a = Basket()
b = Basket()
a.add("tea")
print(a.items, b.items)
```

%% question q-class-attr-fill | fill
Fill in the blank so that the program prints `2`.

```python
class Dog:
    count = 0

    def __init__(self):
        ___.count += 1

Dog()
Dog()
print(Dog.count)
```
%% answer
Dog
%% expected
2
%% explain
`Dog.count += 1` changes the attribute of the class, so all the objects share one count. Each of the two calls adds 1, and the program prints 2.
%% end

## Printing objects: __str__ and __repr__

You saw that `print(rex)` shows an unhelpful text with a memory address. Two special methods fix that. `__str__` returns the text for **people**, which `print` and f-strings use. `__repr__` returns an **unambiguous** text for programmers, ideally one that looks like the code that creates the object. The function `repr()` calls it, and so does a list when it shows its items:

```python run
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
print(p)
print(str(p), repr(p))
print([p, Point(1, 2)])
print(f"The point is {p}")
```

Both methods **return** a string, and they do not print. If a class has only `__repr__`, `print` uses it as well, so when you write only one of the two, write `__repr__`.

%% question q-str-predict | predict
What does this program print?

```python
class P:
    def __init__(self, n):
        self.n = n

    def __str__(self):
        return "P" + str(self.n)

    def __repr__(self):
        return "P(" + str(self.n) + ")"

items = [P(1), P(2)]
print(items[0])
print(items)
```
%% answer
P1
[P(1), P(2)]
%% explain
`print(items[0])` uses `__str__`, which gives `P1`. A list shows its items with `__repr__`, so printing the whole list gives `[P(1), P(2)]`.
%% end

## Default values in __init__

The parameters of `__init__` can have default values, as in any function, so that callers give only what is different:

```python run
class Account:
    def __init__(self, owner, balance=0, currency="NGN"):
        self.owner = owner
        self.balance = balance
        self.currency = currency

    def __str__(self):
        return f"{self.owner}: {self.balance} {self.currency}"

print(Account("Ada"))
print(Account("Grace", 250))
print(Account("Linus", 80, "USD"))
```

Remember the rule from module 9: never use a mutable value such as `[]` as a default. Use `None` and create the list inside `__init__`:

```python run
class Team:
    def __init__(self, name, members=None):
        self.name = name
        if members is None:
            members = []
        self.members = members

a = Team("Red")
b = Team("Blue")
a.members.append("Ada")
print(a.members, b.members)
```

## Objects in lists and dictionaries

Objects are values like any other, so you can keep them in lists and dictionaries, loop over them, and sort them by an attribute:

```python run
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def __str__(self):
        return f"{self.name}: {self.score}"

students = [Student("Ada", 91), Student("Grace", 78), Student("Linus", 85)]
for s in students:
    print(s)

total = 0
for s in students:
    total += s.score
print("Average:", round(total / len(students), 1))

best = max(students, key=lambda s: s.score)
print("Best:", best.name)

for s in sorted(students, key=lambda s: s.score, reverse=True):
    print(s.name)

by_name = {}
for s in students:
    by_name[s.name] = s
print(by_name["Grace"].score)
```

The `key` function tells `max` and `sorted` which attribute to compare, because Python does not know how to rank two students until you say so (lesson 3 shows another way).

## Passing objects to functions

When you pass an object to a function, the function receives **the same object**, not a copy. If it changes the attributes, the caller sees the change:

```python run
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

def birthday(dog):
    dog.age += 1

rex = Dog("Rex", 3)
birthday(rex)
print(rex.age)
```

The same is true for assignment. `c = a` does not copy the object, it gives it a second name. Two names for one object are called **aliases**. The operator `is` asks "are these the same object?", and `==` asks "are they equal?". For your own classes, `==` means the same as `is` until you define what equality means (lesson 3):

```python run
import copy

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

a = Point(1, 2)
b = Point(1, 2)
c = a
print(a == b, a is b)
print(a == c, a is c)

c.x = 99
print(a.x)

d = copy.copy(a)
d.x = 5
print(a.x, d.x)
```

The objects `a` and `b` have the same values, but they are two different objects, so `a == b` is `False`. The name `c` is another name for `a`, so changing `c.x` changed `a.x`. To get an independent copy, use `copy.copy`, as you did for lists in module 5.

%% question q-eq-choice | choice
A class `Point` has no `__eq__` method. After `a = Point(1, 2)` and `b = Point(1, 2)`, what is the value of `a == b`?
%% choice
`True`, because the values are the same
%% choice correct
`False`, because they are two different objects
%% choice
An error, because `==` needs `__eq__`
%% choice
`None`
%% explain
By default, `==` compares identity, like `is`. Two objects that were created separately are different, even when their attributes are the same. A method `__eq__` (lesson 3) can change that.
%% end

## A project: a virtual pet

Here is a pet that gets hungry and tired. All the rules live in the class, and `__str__` reports the state. Notice that `__str__` calls the method `mood`, and that `play` refuses politely when the pet has no energy:

```python run stdin="feed\nplay\nplay\nplay\nsleep\nstatus\nquit"
class Pet:
    def __init__(self, name):
        self.name = name
        self.hunger = 5
        self.energy = 5

    def feed(self):
        self.hunger = max(0, self.hunger - 3)

    def play(self):
        if self.energy < 2:
            print(self.name, "is too tired to play")
            return
        self.energy -= 2
        self.hunger = min(10, self.hunger + 1)

    def sleep(self):
        self.energy = 10
        self.hunger = min(10, self.hunger + 2)

    def mood(self):
        if self.hunger >= 7:
            return "hungry"
        if self.energy <= 2:
            return "tired"
        if self.hunger <= 3 and self.energy >= 4:
            return "happy"
        return "okay"

    def __str__(self):
        return f"{self.name}: hunger {self.hunger}, energy {self.energy}, mood {self.mood()}"

pet = Pet("Milo")
print(pet)
while True:
    command = input("> ")
    if command == "quit":
        break
    if command == "feed":
        pet.feed()
    elif command == "play":
        pet.play()
    elif command == "sleep":
        pet.sleep()
    print(pet)
```

Try other commands in the input box. The numbers stay between 0 and 10 whatever you type, because the methods guard them.

%% question q-state-multi | multi
Select every true statement about attributes.
%% choice correct
A variable written in the class body is shared by all the objects of the class.
%% choice correct
Assigning to `self.name` in `__init__` makes an attribute that belongs to one object.
%% choice
A list written in the class body is a separate list for each object.
%% choice correct
Writing `rex.species = "wolf"` creates an attribute only for `rex`.
%% explain
Class attributes are shared, which is why a list in the class body is shared too and causes surprises. Instance attributes belong to one object, and assigning through an object never changes the class.
%% end

%% question q-order-counter | order
Put the lines in order so that the program prints `1`. One line does not belong.
%% lines
class Counter:
    def __init__(self):
        self.count = 0
    def add(self):
        self.count += 1
c = Counter()
c.add()
print(c.count)
%% distractors
        count = 0
%% expected
1
%% explain
The class has to be complete before an object is created, and `__init__` comes before `add`. The line `count = 0` makes only a local variable, so `self.count` would not exist.
%% end

## Your turn

%% exercise step-counter | A step counter
Define a class `Counter` with an attribute `value` that starts at 0, and the methods `increment()` and `reset()`. Read one line of commands separated by spaces. For `inc`, call `increment()`. For `reset`, call `reset()`. For `show`, print the value. For the input `inc inc show reset inc show` the program prints:

```output
2
1
```
%% stdin
inc inc show reset inc show
%% starter
# Define the class Counter, then run the commands.

%% solution
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

    def reset(self):
        self.value = 0

counter = Counter()
for command in input().split():
    if command == "inc":
        counter.increment()
    elif command == "reset":
        counter.reset()
    elif command == "show":
        print(counter.value)
%% tests
expect_output("2\n1")
check(defines("Counter"), "defines a class called Counter")
c = Counter()
expect(c.value, 0, "a new counter starts at 0")
c.increment()
c.increment()
c.increment()
expect(c.value, 3, "after three increments")
c.reset()
expect(c.value, 0, "after reset")
check(rerun("show inc inc inc show").strip() == "0\n3", "another list of commands")
%% hint
`__init__` sets `self.value = 0`. The two methods change `self.value`.
%% hint
In the main part, create one `Counter`, and loop over `input().split()`.
%% hint
Use `if command == "inc":`, `elif command == "reset":` and `elif command == "show":`, and call the methods on the same object each time.
%% end

%% exercise book-str | Print a book
Define a class `Book` with a title, an author and a number of pages. Its `__str__` returns the text `"Title" by Author (N pages)`, with the quotation marks around the title, and its `__repr__` returns `Book('Title', 'Author', N)`. Read the three values and print the book. For the input `Dune`, `Frank Herbert` and `412` the program prints:

```output
"Dune" by Frank Herbert (412 pages)
```
%% stdin
Dune
Frank Herbert
412
%% starter
# Define the class Book with __str__ and __repr__.

%% solution
class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages

    def __str__(self):
        return f'"{self.title}" by {self.author} ({self.pages} pages)'

    def __repr__(self):
        return f"Book('{self.title}', '{self.author}', {self.pages})"

title = input()
author = input()
pages = int(input())
print(Book(title, author, pages))
%% tests
expect_output('"Dune" by Frank Herbert (412 pages)')
check(defines("Book"), "defines a class called Book")
b = Book("Emma", "Jane Austen", 474)
expect(str(b), '"Emma" by Jane Austen (474 pages)', "str(book)")
expect(repr(b), "Book('Emma', 'Jane Austen', 474)", "repr(book)")
expect(repr([b]), "[Book('Emma', 'Jane Austen', 474)]", "a list of books")
check(rerun("Ulysses\nJames Joyce\n730").strip() == '"Ulysses" by James Joyce (730 pages)', "another book")
%% hint
`__str__` and `__repr__` must `return` the text, not print it.
%% hint
For `__str__` use an f-string, and put the quotation marks inside single quotes: `f'"{self.title}" by ...'`.
%% hint
For `__repr__` write `f"Book('{self.title}', '{self.author}', {self.pages})"`. The pages are a number, so they have no quotation marks.
%% end

%% exercise robot-count | Count the robots
Define a class `Robot` with an attribute `name`, and a **class attribute** `count` that starts at 0 and goes up by 1 each time a robot is created. Read one line of names separated by spaces, and create a `Robot` for each name. Then print `Robots:` and the count. For the input `R2 C3 BB8` the program prints:

```output
Robots: 3
```
%% stdin
R2 C3 BB8
%% starter
# Define the class Robot with a class attribute count.

%% solution
class Robot:
    count = 0

    def __init__(self, name):
        self.name = name
        Robot.count += 1

for name in input().split():
    Robot(name)
print("Robots:", Robot.count)
%% tests
expect_output("Robots: 3")
check(defines("Robot"), "defines a class called Robot")
before = Robot.count
r = Robot("X1")
expect(r.name, "X1", "the attribute name")
expect(Robot.count, before + 1, "one more robot after creating one")
Robot("X2")
Robot("X3")
expect(Robot.count, before + 3, "three more robots")
check(rerun("A").strip() == "Robots: 1", "one robot")
check("count" not in r.__dict__, "count is a class attribute, not an instance attribute")
%% hint
Write `count = 0` in the class body, outside `__init__`.
%% hint
Inside `__init__`, add 1 to the class attribute: `Robot.count += 1`.
%% hint
In the main part, loop over `input().split()` and create `Robot(name)` for each name. Print `Robot.count` at the end.
%% end

%% exercise student-list | Best student
Define a class `Student` with a name and a score. Read lines of the form `name score` until the line `done`, and make a `Student` object for each one. Then print the name of the best student, and the average score with one decimal. When two students have the best score, the first one wins. For the input below the program prints:

```output
Best: Ada
Average: 84.7
```
%% stdin
Ada 91
Grace 78
Linus 85
done
%% starter
# Define the class Student, then read the lines.

%% solution
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

students = []
while True:
    line = input()
    if line == "done":
        break
    name, score = line.split()
    students.append(Student(name, int(score)))

best = max(students, key=lambda s: s.score)
total = 0
for s in students:
    total += s.score
print("Best:", best.name)
print(f"Average: {total / len(students):.1f}")
%% tests
expect_output("Best: Ada\nAverage: 84.7")
check(defines("Student"), "defines a class called Student")
s = Student("Zed", 50)
expect(s.name, "Zed", "the attribute name")
expect(s.score, 50, "the attribute score")
check(rerun("Mia 70\nKai 70\ndone").strip() == "Best: Mia\nAverage: 70.0", "a tie: the first wins")
check(rerun("Solo 60\ndone").strip() == "Best: Solo\nAverage: 60.0", "one student")
%% hint
Keep the `Student` objects in a list while you read the lines.
%% hint
`max(students, key=lambda s: s.score)` finds the best student, and it returns the first one when there is a tie.
%% hint
Add up the scores with a loop over the list, then print the total divided by `len(students)` with `:.1f`.
%% end

%% exercise library-loans | Challenge: Library loans
A library has three books: `Dune`, `Emma` and `Ulysses`. Define a class `Book` with a `title` and an attribute `borrowed` that starts as `False`. Its method `borrow()` raises a `ValueError` with the message `already borrowed` when the book is out, and otherwise marks it as borrowed. Its method `give_back()` raises a `ValueError` with the message `not borrowed` when the book is in, and otherwise marks it as available. The program reads commands until `quit`: `borrow TITLE`, `return TITLE` and `list`. It prints `TITLE borrowed` or `TITLE returned`, and for `list` one line for each book in the order above, such as `Dune: available` or `Dune: borrowed`. A mistake prints `Error:` and the message. When the title is not one of the three books, the message is `no book called TITLE`. For the input below the program prints:

```output
Dune borrowed
Error: already borrowed
Dune: borrowed
Emma: available
Ulysses: available
Dune returned
Error: not borrowed
Error: no book called Hamlet
```
%% stdin
borrow Dune
borrow Dune
list
return Dune
return Dune
borrow Hamlet
quit
%% starter
# Define the class Book, create the three books, then read the commands.

%% solution
class Book:
    def __init__(self, title):
        self.title = title
        self.borrowed = False

    def borrow(self):
        if self.borrowed:
            raise ValueError("already borrowed")
        self.borrowed = True

    def give_back(self):
        if not self.borrowed:
            raise ValueError("not borrowed")
        self.borrowed = False

    def __str__(self):
        state = "borrowed" if self.borrowed else "available"
        return f"{self.title}: {state}"

books = {}
for title in ["Dune", "Emma", "Ulysses"]:
    books[title] = Book(title)

while True:
    parts = input().split()
    if parts[0] == "quit":
        break
    try:
        if parts[0] == "list":
            for book in books.values():
                print(book)
            continue
        title = parts[1]
        if title not in books:
            raise ValueError(f"no book called {title}")
        if parts[0] == "borrow":
            books[title].borrow()
            print(title, "borrowed")
        elif parts[0] == "return":
            books[title].give_back()
            print(title, "returned")
    except ValueError as e:
        print("Error:", e)
%% tests
expect_output("Dune borrowed\nError: already borrowed\nDune: borrowed\nEmma: available\nUlysses: available\nDune returned\nError: not borrowed\nError: no book called Hamlet")
check(defines("Book"), "defines a class called Book")
b = Book("Test")
expect(b.title, "Test", "the attribute title")
expect(b.borrowed, False, "a new book is available")
b.borrow()
expect(b.borrowed, True, "after borrow()")
check(raises(ValueError, b.borrow), "borrowing twice raises a ValueError")
b.give_back()
expect(b.borrowed, False, "after give_back()")
check(raises(ValueError, b.give_back), "returning twice raises a ValueError")
check(rerun("borrow Emma\nborrow Ulysses\nlist\nquit").strip() == "Emma borrowed\nUlysses borrowed\nDune: available\nEmma: borrowed\nUlysses: borrowed", "another run")
%% hint
A `Book` needs `__init__(self, title)`, with `self.borrowed = False`.
%% hint
`borrow` and `give_back` check the state first and `raise ValueError(...)` for a wrong request, and otherwise change `self.borrowed`. A `__str__` that returns `Title: available` or `Title: borrowed` makes `list` short.
%% hint
Keep the books in a dictionary by title. Check `title not in books` before you call a method, and put the commands in `try` with `except ValueError as e:` to print `Error:` and the message.
%% end

## What you learned

- The **state** of an object is the values of its attributes. Methods change it, and a good class keeps its own rules (health never below 0) inside its methods.
- A method can call the other methods of its object with `self.method()`, and it can receive other objects as arguments (`attacker.attack(target)`).
- A **class attribute** is written in the class body and shared by all the objects (`Dog.count += 1`). An **instance attribute** is made with `self.` in `__init__`. Assigning through an object never changes the class attribute, and a list in the class body is shared, so create lists in `__init__`.
- `__str__` returns the text that `print` and f-strings show. `__repr__` returns the unambiguous text that `repr()` and lists show. Both return a string and do not print.
- `__init__` parameters can have defaults, but never a mutable default: use `None` and create the list inside.
- Objects can be kept in lists and dictionaries, and sorted or compared with a `key` function such as `lambda s: s.score`.
- A function that receives an object can change it. `c = a` makes a second name, not a copy, `is` tests for the same object, and by default `==` does the same. Use `copy.copy` for an independent copy.
