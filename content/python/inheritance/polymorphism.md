---
title: Polymorphism and duck typing
---
The last lesson ended with a loop that treated a circle, a rectangle and a square in the same way: `shape.area()` worked for each of them, and each object did its own calculation. That idea has a name. **Polymorphism** is Greek for "many forms": one message, such as `area()`, and many different behaviours, depending on the object that receives it. It is the reason that inheritance and classes make large programs smaller, and this lesson shows how to use it, how Python goes a step further with **duck typing**, and how to write down a contract with **abstract base classes**.

## One message, many forms

Look at the loop in this program. It does not know, and does not ask, what kind of animal it has:

```python run
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):
        return "Woof"

class Cat(Animal):
    def speak(self):
        return "Meow"

class Cow(Animal):
    def speak(self):
        return "Moo"

def chorus(animals):
    for animal in animals:
        print(f"{animal.name}: {animal.speak()}")

chorus([Dog("Rex"), Cat("Tom"), Cow("Daisy"), Animal("Generic")])
```

Step through a smaller version and watch the **same line** do three different things:

```python trace title="One line, three behaviours"
class Dog:
    def speak(self):
        return "Woof"

class Cat:
    def speak(self):
        return "Meow"

for pet in [Dog(), Cat(), Dog()]:
    print(pet.speak())
```

Without polymorphism, the function would have to ask about the type of each object:

```python
def sound(animal):
    if isinstance(animal, Dog):
        return "Woof"
    elif isinstance(animal, Cat):
        return "Meow"
    elif isinstance(animal, Cow):
        return "Moo"
    else:
        return "..."
```

That long chain has to be edited for every new kind of animal, in every function that uses it, and one forgotten edit is a bug. With polymorphism, the knowledge about each kind lives in **its own class**, and the code that uses the objects stays short and stable.

%% question q-poly-choice | choice
What is the main benefit of polymorphism?
%% choice
Objects use less memory
%% choice correct
Code can use many kinds of object through one method name, without asking what kind each one is
%% choice
A child class can never change what its parent does
%% choice
Every class needs exactly one method
%% explain
When every class has its own version of `speak()` or `area()`, the code that calls the method does not need `if` chains on the type, and a new kind of object can be added without editing that code.
%% end

## Adding a new kind costs nothing

Here is a function that adds up areas. After it is written and used, a **new** shape appears, and the function needs no change:

```python run
class Square:
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

def total_area(shapes):
    total = 0
    for shape in shapes:
        total += shape.area()
    return total

print(total_area([Square(2), Rectangle(2, 3)]))

class Triangle:
    def __init__(self, base, height):
        self.base = base
        self.height = height

    def area(self):
        return self.base * self.height / 2

print(total_area([Square(2), Rectangle(2, 3), Triangle(4, 5)]))
```

Notice something strange in this program: the three classes have **no parent in common**. There is no `Shape` class at all, and `total_area` works anyway.

## Duck typing

Python does not check the class of an argument. It only **tries the operation**, and the operation works when the object has the method. The saying is: "if it walks like a duck and quacks like a duck, it is a duck". The function `total_area` does not need a `Shape`. It needs something that has an `area()` method.

```python run
class Duck:
    def speak(self):
        return "Quack"

class Robot:
    def speak(self):
        return "Beep"

class Stone:
    pass

def talk(thing):
    return thing.speak()

print(talk(Duck()))
print(talk(Robot()))
try:
    print(talk(Stone()))
except AttributeError as e:
    print("Error:", e)
```

A duck and a robot are unrelated, and both can talk. A stone cannot, and Python reports that **at the moment** the missing method is used, with an `AttributeError`. You have two ways to deal with it, which you know from module 9. You can **look first** with `hasattr(obj, "name")`, which tells you whether an object has an attribute, or you can **try and handle the error**:

```python run
class Stone:
    pass

class Robot:
    def speak(self):
        return "Beep"

def talk_look_first(thing):
    if hasattr(thing, "speak"):
        return thing.speak()
    return "(silence)"

def talk_try_first(thing):
    try:
        return thing.speak()
    except AttributeError:
        return "(silence)"

for thing in [Robot(), Stone()]:
    print(talk_look_first(thing), talk_try_first(thing))
```

Python programmers usually prefer the second style, "easier to ask forgiveness than permission", unless a check is cheap and clear. You have used duck typing all along. The function `len()` does not check for a list. It calls `__len__`, so it works for text, lists, dictionaries, and the collection class that you wrote in module 10. A `for` loop works for anything that can be looped over, and `print` works for anything that has a text form.

%% question q-duck-predict | predict
What does this program print?

```python
class Bell:
    def ring(self):
        return "Ding"

class Phone:
    def ring(self):
        return "Brrr"

class Book:
    pass

for thing in [Bell(), Book(), Phone()]:
    try:
        print(thing.ring())
    except AttributeError:
        print("silent")
```
%% answer
Ding
silent
Brrr
%% explain
`Bell` and `Phone` are unrelated classes, and both have a `ring` method, so duck typing accepts them. `Book` has no such method, so the attribute error is caught and the word `silent` is printed. The loop carries on with the next object.
%% end

## Abstract base classes

Duck typing is flexible, but the agreement is only in your head. If a programmer who writes a new `Triangle` types `aria` instead of `area`, nothing complains until the wrong moment, deep inside the program. An **abstract base class** writes the agreement down, and Python **enforces** it when an object is created. You import `ABC` and `abstractmethod` from the module `abc`:

```python run
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

    def describe(self):
        return f"{type(self).__name__} with area {self.area():.2f}"

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

class Triangle(Shape):
    def aria(self):
        return 0

print(Square(3).describe())
for kind in (Shape, Triangle):
    try:
        kind()
    except TypeError as e:
        print("Error:", e)
```

Read the rules from this program:

- A class that inherits from `ABC` can mark methods with `@abstractmethod`. An abstract method has no real body (`pass` is enough). It says: "every child **must** provide this".
- You **cannot create** an object of a class that still has abstract methods. Not `Shape()`, and not `Triangle()`, which did not override `area` (a typo of the name does not count).
- The ordinary methods of the abstract class, such as `describe`, are inherited and work normally. `describe` is written once, and it uses `self.area()`, which the children provide. This pattern is called a **template method**.
- Abstract classes are used as the common **parent** of the real classes. They are not meant to be created themselves.

%% question q-abc-fill | fill
Fill in the blank so that the program prints `blocked`.

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @___
    def area(self):
        pass

try:
    Shape()
except TypeError:
    print("blocked")
```
%% answer
abstractmethod
%% expected
blocked
%% explain
The decorator `@abstractmethod` marks `area` as a method that children must provide. A class with an abstract method left cannot be created, and Python raises a `TypeError`.
%% end

## NotImplementedError

Before the `abc` module was popular, and still in many programs, the parent's method refuses to work. It raises `NotImplementedError`, which means "a subclass should have written this":

```python run
class Shape:
    def area(self):
        raise NotImplementedError("subclasses must define area()")

class Blob(Shape):
    pass

blob = Blob()
print("created")
try:
    blob.area()
except NotImplementedError as e:
    print("Error:", e)
```

The program creates the `Blob` happily, and fails only when the method is **called**. Compare the two ways:

| | `ABC` and `@abstractmethod` | `raise NotImplementedError` |
| --- | --- | --- |
| When does the mistake show? | when the object is **created** | when the method is **called** |
| Is the parent usable? | no, it cannot be created | yes, which is useful for a default or an optional method |
| Typical use | a contract that must be kept | a quick base class, or a step that children may skip |

%% warn Two similar names
`NotImplementedError` is an **exception** that you raise. `NotImplemented` (without `Error`) is a special **value** that `__eq__` and `__lt__` return when they do not understand the other object, as you saw in module 10. They have different jobs.
%% end

## Protocols: agreements without a parent

An agreement about which methods an object must have is called an **interface** or a **protocol**. The built-in `len()` has one: "give me `__len__`". A function that writes a report can have another: "give me something with a `write(text)` method". Files have such a method, the screen (`sys.stdout`) has it, and so does any class that you write yourself:

```python run
import sys

class ListWriter:
    def __init__(self):
        self.lines = []

    def write(self, text):
        self.lines.append(text)

def report(out):
    out.write("Report\n")
    out.write("Done\n")

writer = ListWriter()
report(writer)
print(writer.lines)
report(sys.stdout)
```

The function `report` works with the writer that collects text and with the screen, and neither of them inherits from the other. That is very useful for **testing**: you can pass in a harmless fake object, and look at what the code did. Python also has a way to write a protocol down for tools that check types, called `typing.Protocol`, which module 14 shows. Until then, the plain agreement ("an object with a `write` method") is enough.

## A project: payment methods

An abstract class, three children and a dictionary of ready-made objects make a small system that grows without trouble. Each payment method has its own fee, and the parent knows how to calculate a total from the fee:

```python run stdin="card 100\ncash 40\ntransfer 250\ncheque 10\ndone"
from abc import ABC, abstractmethod

class Payment(ABC):
    @abstractmethod
    def fee(self, amount):
        pass

    def total(self, amount):
        return amount + self.fee(amount)

class Card(Payment):
    def fee(self, amount):
        return amount * 0.02

class Cash(Payment):
    def fee(self, amount):
        return 0

class Transfer(Payment):
    def fee(self, amount):
        return 1.5

methods = {"card": Card(), "cash": Cash(), "transfer": Transfer()}
while True:
    line = input()
    if line == "done":
        break
    name, amount = line.split()
    if name in methods:
        print(f"{name}: {methods[name].total(float(amount)):.2f}")
    else:
        print(f"Unknown method: {name}")
```

To support a new method, such as a gift card, you write one new class and add one entry to the dictionary. The loop, the `total` method and the other classes stay as they are.

## Your turn

%% exercise talk-to-anything | Talk to anything
The starter has the classes `Duck` and `Robot`, which can `speak()`, and `Stone`, which cannot. Write the function `talk(thing)` that returns what the thing says, or the text `(silence)` when it cannot speak. For the input below the program prints:

```output
duck: Quack
robot: Beep
stone: (silence)
```
%% stdin
duck
robot
stone
done
%% starter
class Duck:
    def speak(self):
        return "Quack"

class Robot:
    def speak(self):
        return "Beep"

class Stone:
    pass

# Write the function talk(thing) here.

things = {"duck": Duck(), "robot": Robot(), "stone": Stone()}
while True:
    name = input()
    if name == "done":
        break
    print(f"{name}: {talk(things[name])}")

%% solution
class Duck:
    def speak(self):
        return "Quack"

class Robot:
    def speak(self):
        return "Beep"

class Stone:
    pass

def talk(thing):
    try:
        return thing.speak()
    except AttributeError:
        return "(silence)"

things = {"duck": Duck(), "robot": Robot(), "stone": Stone()}
while True:
    name = input()
    if name == "done":
        break
    print(f"{name}: {talk(things[name])}")
%% tests
expect_output("duck: Quack\nrobot: Beep\nstone: (silence)")
expect(talk(Duck()), "Quack", "a duck talks")
expect(talk(Stone()), "(silence)", "a stone does not")
class Parrot:
    def speak(self):
        return "Hello"
expect(talk(Parrot()), "Hello", "any object with speak() works, even a new class")
check(not calls("isinstance"), "duck typing does not ask for the class")
%% hint
Call `thing.speak()`. A thing without that method raises an `AttributeError`.
%% hint
Put the call in a `try` block, and handle `AttributeError` in an `except` clause that returns the text `(silence)`.
%% hint
Another way: `if hasattr(thing, "speak"):` return the call, otherwise return `"(silence)"`. Do not use `isinstance`, because a new class with `speak` must work too.
%% end

%% exercise area-ranking | Ranking the shapes
Write the classes `Circle(radius)`, `Rectangle(width, height)` and `Triangle(base, height)`, each with an `area()` method (use 3.14159 for pi). The starter reads shapes until `done` and prints them from the **largest area to the smallest**, as `Name: area` with two decimals. For the input below the program prints:

```output
Circle: 12.57
Rectangle: 12.00
Triangle: 10.00
```
%% stdin
tri 4 5
circle 2
rect 3 4
done
%% starter
# Write the classes Circle, Rectangle and Triangle here.

shapes = []
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    if parts[0] == "circle":
        shapes.append(Circle(float(parts[1])))
    elif parts[0] == "rect":
        shapes.append(Rectangle(float(parts[1]), float(parts[2])))
    else:
        shapes.append(Triangle(float(parts[1]), float(parts[2])))

shapes.sort(key=lambda shape: shape.area(), reverse=True)
for shape in shapes:
    print(f"{type(shape).__name__}: {shape.area():.2f}")

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

class Triangle:
    def __init__(self, base, height):
        self.base = base
        self.height = height

    def area(self):
        return self.base * self.height / 2

shapes = []
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    if parts[0] == "circle":
        shapes.append(Circle(float(parts[1])))
    elif parts[0] == "rect":
        shapes.append(Rectangle(float(parts[1]), float(parts[2])))
    else:
        shapes.append(Triangle(float(parts[1]), float(parts[2])))

shapes.sort(key=lambda shape: shape.area(), reverse=True)
for shape in shapes:
    print(f"{type(shape).__name__}: {shape.area():.2f}")
%% tests
expect_output("Circle: 12.57\nRectangle: 12.00\nTriangle: 10.00")
expect(Rectangle(2, 5).area(), 10, "area of a rectangle")
expect(Triangle(4, 5).area(), 10, "area of a triangle")
expect(Circle(1).area(), 3.14159, "area of a circle", approx=0.00001)
check(rerun("rect 1 1\ncircle 1\ndone").strip() == "Circle: 3.14\nRectangle: 1.00", "two shapes")
check(rerun("done").strip() == "", "no shapes, no output")
%% hint
Each class stores its measurements in `__init__` and calculates the answer in `area()`.
%% hint
Circle: `3.14159 * self.radius ** 2`. Rectangle: `self.width * self.height`. Triangle: `self.base * self.height / 2`.
%% hint
The starter already sorts the objects with `shape.area()`, and prints `type(shape).__name__`, so the class names must be exactly `Circle`, `Rectangle` and `Triangle`.
%% end

%% exercise discounts | Discounts in a row
A shop applies discounts one after another. Write the abstract class `Discount` with the abstract method `apply(price)`, which returns the new price, and three children:

- `Percent(p)` takes `p` percent off the price.
- `Fixed(amount)` takes `amount` off, but the price never goes below `0`.
- `NoDiscount()` returns the price unchanged.

The starter reads a price, then discounts until `done`, and prints the price after each discount. For the input below the program prints:

```output
72.00
67.00
67.00
0.00
Final: 0.00
```
%% stdin
80
percent 10
fixed 5
none
fixed 100
done
%% starter
from abc import ABC, abstractmethod

# Write Discount (abstract), Percent, Fixed and NoDiscount here.

price = float(input())
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    if parts[0] == "percent":
        discount = Percent(float(parts[1]))
    elif parts[0] == "fixed":
        discount = Fixed(float(parts[1]))
    else:
        discount = NoDiscount()
    price = discount.apply(price)
    print(f"{price:.2f}")
print(f"Final: {price:.2f}")

%% solution
from abc import ABC, abstractmethod

class Discount(ABC):
    @abstractmethod
    def apply(self, price):
        pass

class Percent(Discount):
    def __init__(self, percent):
        self.percent = percent

    def apply(self, price):
        return price * (100 - self.percent) / 100

class Fixed(Discount):
    def __init__(self, amount):
        self.amount = amount

    def apply(self, price):
        return max(0, price - self.amount)

class NoDiscount(Discount):
    def apply(self, price):
        return price

price = float(input())
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    if parts[0] == "percent":
        discount = Percent(float(parts[1]))
    elif parts[0] == "fixed":
        discount = Fixed(float(parts[1]))
    else:
        discount = NoDiscount()
    price = discount.apply(price)
    print(f"{price:.2f}")
print(f"Final: {price:.2f}")
%% tests
expect_output("72.00\n67.00\n67.00\n0.00\nFinal: 0.00")
check(raises(TypeError, Discount), "Discount is abstract, so it cannot be created")
check(issubclass(Percent, Discount) and issubclass(Fixed, Discount) and issubclass(NoDiscount, Discount), "the three kinds inherit from Discount")
expect(Percent(25).apply(80), 60, "25 percent off 80")
expect(Fixed(10).apply(50), 40, "10 off 50")
expect(Fixed(10).apply(5), 0, "the price never goes below zero")
expect(NoDiscount().apply(7), 7, "no discount")
check("abstractmethod" in source(), "uses @abstractmethod")
check(rerun("20\nnone\ndone").strip() == "20.00\nFinal: 20.00", "only the unchanged price")
%% hint
`Discount(ABC)` has one method marked with `@abstractmethod`. Each child overrides `apply(self, price)` and returns a number.
%% hint
`Percent` stores the percentage in `__init__`. Its `apply` returns `price * (100 - self.percent) / 100`.
%% hint
`Fixed.apply` returns `max(0, price - self.amount)`, and `NoDiscount.apply` returns the price as it is.
%% end

%% exercise log-outputs | Challenge: Outputs that fit anywhere
The function `log(out, messages)` in the starter writes every message to `out`, and it works with **any object that has a `write(text)` method**. Write three classes, which need no common parent:

- `ListOut` keeps every text in a list called `items`.
- `ConsoleOut` prints every text.
- `UpperOut(target)` writes every text in capitals to another output, `target`.

The code at the bottom of the starter tries them out. It prints:

```output
['start', 'stop']
hello
world
['QUIET', 'WORDS']
LOUD
WORDS
```
%% starter
def log(out, messages):
    for message in messages:
        out.write(message)

# Write ListOut, ConsoleOut and UpperOut here.

items = ListOut()
log(items, ["start", "stop"])
print(items.items)
log(ConsoleOut(), ["hello", "world"])
shout = ListOut()
log(UpperOut(shout), ["quiet", "words"])
print(shout.items)
log(UpperOut(ConsoleOut()), ["loud", "words"])

%% solution
def log(out, messages):
    for message in messages:
        out.write(message)

class ListOut:
    def __init__(self):
        self.items = []

    def write(self, text):
        self.items.append(text)

class ConsoleOut:
    def write(self, text):
        print(text)

class UpperOut:
    def __init__(self, target):
        self.target = target

    def write(self, text):
        self.target.write(text.upper())

items = ListOut()
log(items, ["start", "stop"])
print(items.items)
log(ConsoleOut(), ["hello", "world"])
shout = ListOut()
log(UpperOut(shout), ["quiet", "words"])
print(shout.items)
log(UpperOut(ConsoleOut()), ["loud", "words"])
%% tests
expect_output("['start', 'stop']\nhello\nworld\n['QUIET', 'WORDS']\nLOUD\nWORDS")
box = ListOut()
box.write("a")
expect(box.items, ["a"], "ListOut keeps the text")
upper = UpperOut(box)
upper.write("b")
expect(box.items, ["a", "B"], "UpperOut passes capitals to its target")
import io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    ConsoleOut().write("hi")
expect(buf.getvalue(), "hi\n", "ConsoleOut prints the text")
check(defines("ListOut") and defines("ConsoleOut") and defines("UpperOut"), "defines the three classes")
two = UpperOut(UpperOut(ListOut()))
two.write("x")
expect(two.target.target.items, ["X"], "outputs can be wrapped in each other")
%% hint
All three classes need a method `write(self, text)`. They do not inherit from anything.
%% hint
`ListOut.write` appends to `self.items`, and `ConsoleOut.write` prints. `ListOut` needs an `__init__` that creates the empty list.
%% hint
`UpperOut.__init__` stores the target in `self.target`. Its `write` calls `self.target.write(text.upper())`, so it works with any output, even another `UpperOut`.
%% end

## What you learned

- **Polymorphism**: one method name, many behaviours. The code that calls the method does not ask for the kind of object, and a new kind can be added without changing it.
- A method written in a parent that calls `self.method()` uses the version of the **object's own class**. This is the template method pattern.
- **Duck typing**: Python does not check classes, it uses the methods that exist. Unrelated classes can be used in the same loop. `hasattr(obj, "name")` looks first, and `try` with `except AttributeError` handles the failure.
- **Abstract base classes** (`from abc import ABC, abstractmethod`) write the contract down. A class with an abstract method left cannot be created, and a typo in a method name is caught at that moment with a `TypeError`.
- `raise NotImplementedError` is the lighter way: the parent is usable, and the mistake shows only when the method is called. It is a different thing from the value `NotImplemented`.
- A **protocol** is an agreement about methods, without a parent class. A function that needs only `write(text)` works with files, the screen and fake objects for tests.
