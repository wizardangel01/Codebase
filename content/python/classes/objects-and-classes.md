---
title: Objects and classes
---
Until now, you have kept data in variables and behaviour in functions, and the two lived apart: a list of students in one place, a function `average(students)` in another. A **class** lets you bundle the data and the behaviour that belong together into one thing, called an **object**. Programs that model the real world, such as a bank, a game or a school, become much easier to organise this way. You have been using objects from the first lesson, and this lesson shows you where they come from and how to build your own.

## Everything is an object

Every value in Python has a **type**, and the type decides what the value can do. Strings, lists, numbers and even `None` are all objects:

```python run
text = "hello"
numbers = [3, 1, 2]

print(type(text))
print(type(numbers))
print(type(3.5), type(True), type(None))

print(text.upper())
numbers.sort()
print(numbers)
```

The word `str` in `<class 'str'>` is the name of a **class**, which is a blueprint for one kind of object. The text `"hello"` is an **object** (also called an **instance**) made from that blueprint. An object carries its own data, and it has **methods**: functions that belong to it, called with a dot. `text.upper()` is a method of a string, and `numbers.sort()` is a method of a list. A string cannot sort itself, because the `str` class has no `sort` method.

The function `isinstance` asks whether an object was made from a class:

```python run
print(isinstance(5, int), isinstance("5", int), isinstance([1], list))
```

Here are the words of this lesson in one table:

| Word | Meaning |
| --- | --- |
| **class** | a blueprint that describes one kind of object, such as `Dog` |
| **object** or **instance** | one thing made from a class, such as the dog called Rex |
| **attribute** | a variable that belongs to an object, such as `rex.name` |
| **method** | a function that belongs to a class and works on an object, such as `rex.bark()` |

## Your first class

Python has no built-in `Dog` type, so you define one. A class is written with the keyword `class`, and its methods are functions indented inside it:

```python run
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        print(self.name, "says woof!")

rex = Dog("Rex", 3)
fido = Dog("Fido", 5)
rex.bark()
fido.bark()
print(rex.name, rex.age)
```

Go through it piece by piece:

- `class Dog:` starts the class. Class names use CapitalisedWords, so that you can tell them from variables.
- `__init__` (two underscores on each side) is a **special method** that Python calls automatically when a new object is created. It is the place to give the object its starting data. People call it the **constructor** or the initialiser.
- `self` is the first parameter of every method. It means "the object that this method is working on". You never pass it yourself: Python does.
- `self.name = name` creates an **attribute**. The attribute lives inside the object, and it stays there after `__init__` has finished.
- `Dog("Rex", 3)` creates an object. The arguments go to `__init__`, after `self`.
- `rex.bark()` calls a method. Python passes `rex` as `self`.

When Python runs `rex = Dog("Rex", 3)`, it creates a new empty object, calls `Dog.__init__` with that object as `self` and with `"Rex"` and `3` as the other arguments, and finally hands the finished object back, so that the name `rex` refers to it. Step through it and watch the two objects appear:

```python trace title="Creating two dogs"
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

rex = Dog("Rex", 3)
fido = Dog("Fido", 5)
print(rex.name, fido.name)
```

%% key A class is a blueprint, an object is a thing
You write the class once. Then you can create as many objects from it as you need, and each object has its **own** attributes.
%% end

## Objects are independent

Each object has its own copy of the attributes. Changing one object does not touch another:

```python run
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

rex = Dog("Rex", 3)
fido = Dog("Fido", 5)
rex.age = 4
print(rex.age, fido.age)
```

If you print an object that has no instructions for printing, Python shows its type and a number that says where it lives in memory. The next lesson shows how to make objects print nicely:

```python run
class Dog:
    def __init__(self, name):
        self.name = name

rex = Dog("Rex")
print(rex)
print(type(rex))
print(isinstance(rex, Dog))
```

Notice `__main__.Dog`: the class `Dog` was defined in the main program, which Python calls `__main__`.

%% question q-self-choice | choice
What does `self` mean inside a method?
%% choice
The name of the class
%% choice correct
The object that the method was called on
%% choice
The first argument that you must always pass yourself
%% choice
A special word that only works in `__init__`
%% explain
When you write `rex.bark()`, Python calls the method with `rex` as `self`. That is why the method can reach the data of that particular object, such as `self.name`.
%% end

%% question q-counter-predict | predict
What does this program print?

```python
class Counter:
    def __init__(self):
        self.count = 0

    def add(self):
        self.count += 1

a = Counter()
b = Counter()
a.add()
a.add()
b.add()
print(a.count, b.count)
```
%% answer
2 1
%% explain
Each object has its own `count`, which starts at 0. The object `a` was increased twice and `b` once, so the program prints `2 1`.
%% end

## Methods use the data of the object

A method can read and change the attributes of its object through `self`. Here is a bank account. It also uses what you learnt in module 9: a method can `raise` an exception when a request makes no sense.

```python run
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

account = BankAccount("Ada", 100)
account.deposit(50)
account.withdraw(30)
print(account.owner, account.balance)

try:
    account.withdraw(500)
except ValueError as e:
    print("Error:", e)
```

There is nothing magic about the dot. A method is a function that takes the object as its first argument, and the two calls below do exactly the same thing:

```python run
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

account = BankAccount("Ada", 100)
account.deposit(50)
BankAccount.deposit(account, 50)
print(account.balance)
```

A method can calculate something from the data and return it, as a function does. A `Point` on a map is a small example:

```python run
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def distance_to_origin(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def describe(self):
        return f"({self.x}, {self.y})"

p = Point(3, 4)
print(p.describe(), p.distance_to_origin())
```

A method can also receive **another object** as an argument, which is useful when two objects interact. Here the method `distance_to` compares `self` with `other`:

```python run
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def distance_to(self, other):
        dx = self.x - other.x
        dy = self.y - other.y
        return (dx ** 2 + dy ** 2) ** 0.5

home = Point(0, 0)
shop = Point(6, 8)
print(home.distance_to(shop))
```

## The mistakes with self

Almost everyone makes these mistakes at first, so learn the messages. The first one is a method without `self`:

```python run error
class Dog:
    def __init__(self, name):
        self.name = name

    def bark():
        print("Woof!")

Dog("Rex").bark()
```

Python passes the object as the first argument, but the method has no parameter to receive it: `Dog.bark() takes 0 positional arguments but 1 was given`. The second mistake is to forget `self.` when storing data. The line `name = name` creates an ordinary local variable that disappears when `__init__` ends:

```python run error
class Dog:
    def __init__(self, name):
        name = name

    def bark(self):
        print(self.name, "says woof")

Dog("Rex").bark()
```

The object never received the attribute, so Python reports `'Dog' object has no attribute 'name'`. The third mistake is the opposite: reading a name inside a method without `self.`, which gives a `NameError`, because `name` is not a variable of the method. The rule is simple: **data of the object is always reached through `self`**.

%% question q-fill-self | fill
Fill in the blank so that the program prints `Tom`.

```python
class Cat:
    def __init__(___, name):
        self.name = name

print(Cat("Tom").name)
```
%% answer
self
%% expected
Tom
%% explain
The first parameter of a method receives the object, and by convention it is called `self`. The body of the method uses the same name, `self.name`, so the blank must be `self`.
%% end

## A project: a bank at the command line

Put the pieces together. The program reads commands, and every command talks to the same `BankAccount` object. Errors raised by the object are caught by the loop, so that a wrong request does not end the program:

```python run stdin="deposit 50\nwithdraw 20\nwithdraw 100\ndeposit -5\nbalance\nquit"
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

account = BankAccount("Ada")
while True:
    parts = input("> ").split()
    if parts[0] == "quit":
        break
    try:
        if parts[0] == "deposit":
            account.deposit(int(parts[1]))
        elif parts[0] == "withdraw":
            account.withdraw(int(parts[1]))
        print("Balance:", account.balance)
    except ValueError as e:
        print("Error:", e)
```

Look at how the work is divided. The **class** knows the rules of a bank account: what a deposit is, and when a withdrawal is refused. The **loop** only reads commands and shows results. If you later build a website for the same bank, you can reuse the class and replace the loop.

%% question q-class-multi | multi
Select every true statement about classes and objects.
%% choice correct
One class can be used to create many objects.
%% choice correct
Each object has its own attributes.
%% choice
All the objects of a class share one `self`.
%% choice correct
`__init__` runs automatically when an object is created.
%% explain
A class is a blueprint, so you can make as many objects from it as you like, each with its own data. `self` is different in every call, because it is the object that the method works on. And `__init__` is called by Python during creation.
%% end

%% question q-order-class | order
Put the lines in order so that the program prints `7`. One line does not belong.
%% lines
class Point:
    def __init__(self, x):
        self.x = x
p = Point(7)
print(p.x)
%% distractors
        x = x
%% expected
7
%% explain
The class must be defined before an object is made from it, and `print` comes last. The line `x = x` only creates a local variable, so the attribute `p.x` would not exist and the program would fail.
%% end

## Your turn

%% exercise dog-class | Your first class
Define a class `Dog` whose `__init__` takes a `name` and an `age`, and that has a method `describe()` which returns the text `<name> is <age> years old`. Read a name and an age, create a `Dog`, and print its description. For the input `Rex` and `3` the program prints:

```output
Rex is 3 years old
```
%% stdin
Rex
3
%% starter
# Define the class Dog first.

%% solution
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def describe(self):
        return f"{self.name} is {self.age} years old"

name = input()
age = int(input())
print(Dog(name, age).describe())
%% tests
expect_output("Rex is 3 years old")
check(defines("Dog"), "defines a class called Dog")
d = Dog("Fido", 7)
expect(d.describe(), "Fido is 7 years old", "describe()")
expect(d.name, "Fido", "the attribute name")
expect(d.age, 7, "the attribute age")
check(rerun("Max\n12").strip() == "Max is 12 years old", "another input")
%% hint
Start with `class Dog:` and a method `def __init__(self, name, age):`.
%% hint
Inside `__init__`, store the values as attributes: `self.name = name` and `self.age = age`.
%% hint
`describe` returns `f"{self.name} is {self.age} years old"`. In the main part, convert the age with `int(input())`.
%% end

%% exercise rectangle | A rectangle
Define a class `Rectangle` with a width and a height, and these methods: `area()`, `perimeter()` and `is_square()`, which returns `True` when the width equals the height. Read the width and the height, and print the three results, one per line. For the input `3` and `4` the program prints:

```output
12
14
False
```
%% stdin
3
4
%% starter
# Define the class Rectangle first.

%% solution
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def is_square(self):
        return self.width == self.height

shape = Rectangle(int(input()), int(input()))
print(shape.area())
print(shape.perimeter())
print(shape.is_square())
%% tests
expect_output("12\n14\nFalse")
check(defines("Rectangle"), "defines a class called Rectangle")
r = Rectangle(5, 5)
expect(r.area(), 25, "area of 5 by 5")
expect(r.perimeter(), 20, "perimeter of 5 by 5")
expect(r.is_square(), True, "5 by 5 is a square")
expect(Rectangle(2, 7).is_square(), False, "2 by 7 is not a square")
check(rerun("6\n6").strip() == "36\n24\nTrue", "a square input")
%% hint
`__init__(self, width, height)` stores both numbers as attributes.
%% hint
Each method returns its answer, using `self.width` and `self.height`.
%% hint
`is_square` can return the comparison directly: `return self.width == self.height`.
%% end

%% exercise two-points | Distance between points
Define a class `Point` with attributes `x` and `y`, and a method `distance_to(other)` that returns the distance between the two points: the square root of `dx` squared plus `dy` squared, which you calculate with `** 0.5`. Read four numbers: `x` and `y` of the first point, then `x` and `y` of the second. Print the distance. For the input `0`, `0`, `3` and `4` the program prints:

```output
5.0
```
%% stdin
0
0
3
4
%% starter
# Define the class Point with a method distance_to(other).

%% solution
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def distance_to(self, other):
        dx = self.x - other.x
        dy = self.y - other.y
        return (dx ** 2 + dy ** 2) ** 0.5

first = Point(int(input()), int(input()))
second = Point(int(input()), int(input()))
print(first.distance_to(second))
%% tests
expect_output("5.0")
check(defines("Point"), "defines a class called Point")
expect(Point(1, 1).distance_to(Point(1, 1)), 0, "the same point")
expect(Point(-3, 0).distance_to(Point(0, 4)), 5, "points on both sides")
expect(Point(2, 2).distance_to(Point(5, 6)), Point(5, 6).distance_to(Point(2, 2)), "the distance is the same in both directions")
check(rerun("1\n1\n4\n5").strip() == "5.0", "another input")
%% hint
`distance_to` has two parameters: `self` is the first point and `other` is the second.
%% hint
Calculate `dx = self.x - other.x` and `dy = self.y - other.y`.
%% hint
Return `(dx ** 2 + dy ** 2) ** 0.5`. In the main part, create the two points from four calls to `int(input())`.
%% end

%% exercise fix-self | Fix the class
The class `Cat` in the starter code has three mistakes that involve `self`. Find them and fix them, so that the program prints:

```output
Tom is 2 years old and says meow
```
%% starter
class Cat:
    def __init__(self, name, age):
        name = name
        self.age = age

    def speak():
        return "meow"

    def describe(self):
        return f"{name} is {self.age} years old and says {self.speak()}"

tom = Cat("Tom", 2)
print(tom.describe())

%% solution
class Cat:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def speak(self):
        return "meow"

    def describe(self):
        return f"{self.name} is {self.age} years old and says {self.speak()}"

tom = Cat("Tom", 2)
print(tom.describe())
%% tests
expect_output("Tom is 2 years old and says meow")
c = Cat("Kit", 5)
expect(c.speak(), "meow", "speak()")
expect(c.describe(), "Kit is 5 years old and says meow", "describe()")
expect(c.name, "Kit", "the attribute name")
%% hint
Run it and read the error message. Fix one mistake at a time.
%% hint
Every method needs `self` as its first parameter, and the data of the object is reached with `self.`.
%% hint
Three changes: `self.name = name`, `def speak(self):`, and `{self.name}` in the f-string.
%% end

%% exercise bank-account | Challenge: The class behind the bank
Define a class `BankAccount` that starts with a balance of 0, and has the methods `deposit(amount)` and `withdraw(amount)`. Both raise a `ValueError` with the message `amount must be positive` when the amount is 0 or less. `withdraw` also raises a `ValueError` with the message `not enough money` when the amount is more than the balance. The program reads commands, `deposit N` or `withdraw N`, until `quit`. After each command it prints `Balance:` and the balance, or `Error:` and the message. For the input below the program prints:

```output
Balance: 50
Balance: 30
Error: not enough money
Error: amount must be positive
```
%% stdin
deposit 50
withdraw 20
withdraw 100
deposit -5
quit
%% starter
# Define the class BankAccount, then read the commands.

%% solution
class BankAccount:
    def __init__(self):
        self.balance = 0

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

account = BankAccount()
while True:
    parts = input().split()
    if parts[0] == "quit":
        break
    try:
        if parts[0] == "deposit":
            account.deposit(int(parts[1]))
        elif parts[0] == "withdraw":
            account.withdraw(int(parts[1]))
        print("Balance:", account.balance)
    except ValueError as e:
        print("Error:", e)
%% tests
expect_output("Balance: 50\nBalance: 30\nError: not enough money\nError: amount must be positive")
check(defines("BankAccount"), "defines a class called BankAccount")
acc = BankAccount()
expect(acc.balance, 0, "a new account is empty")
acc.deposit(40)
acc.withdraw(15)
expect(acc.balance, 25, "balance after a deposit and a withdrawal")
check(raises(ValueError, acc.withdraw, 100), "withdrawing too much raises a ValueError")
check(raises(ValueError, acc.deposit, 0), "depositing 0 raises a ValueError")
expect(acc.balance, 25, "a refused request leaves the balance as it was")
check(rerun("withdraw 5\ndeposit 10\nwithdraw 10\nquit").strip() == "Error: not enough money\nBalance: 10\nBalance: 0", "another run")
%% hint
`__init__` takes only `self` and sets `self.balance = 0`.
%% hint
Check the amount first, then the balance, and `raise ValueError("...")` with the exact messages. Change `self.balance` only after the checks.
%% hint
In the loop, call the method inside `try`. Print `"Balance:", account.balance` when no exception happened, and `"Error:", e` in `except ValueError as e:`.
%% end

## What you learned

- Every value is an **object** with a **type** (its class) and **methods**. `type(x)` shows the class, and `isinstance(x, SomeClass)` asks whether an object was made from it.
- A **class** is a blueprint, and an **object** (or instance) is one thing made from it. You write `class Name:` and create objects with `Name(arguments)`.
- `__init__` runs when an object is created. It gives the object its attributes, with `self.attribute = value`.
- Every method has `self` as its first parameter, which is the object that the method works on. `rex.bark()` is the same as `Dog.bark(rex)`.
- Each object has its own attributes, so changing one object does not change another.
- The usual mistakes: a method without `self`, `name = name` instead of `self.name = name`, and a bare `name` where `self.name` is needed.
- A class holds the rules of a thing (what a deposit is), and the rest of the program only uses it.
