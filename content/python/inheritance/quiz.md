---
title: Inheritance: module quiz
pass: 70
---
Twelve questions on everything in this module: subclasses and `super()`, polymorphism and abstract classes, composition and mixins, the MRO, custom exceptions and enums. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | choice
Which pair of classes fits **inheritance** (an is-a relationship)?
%% choice
`Library` and `Book`
%% choice
`Car` and `Wheel`
%% choice correct
`Teacher` and `Person`
%% choice
`Order` and `Customer`
%% explain
A teacher **is a** person, so `Teacher(Person)` makes sense. A library has books, a car has wheels, and an order has a customer, so those pairs are better as composition: one object holds the other in an attribute.
%% end

%% question q2 | predict
What does this program print?

```python
class A:
    def hello(self):
        return "A"

class B(A):
    def hello(self):
        return super().hello() + "B"

class C(B):
    def hello(self):
        return super().hello() + "C"

print(C().hello())
```
%% answer
ABC
%% explain
`C.hello` asks `super()` for the result of `B.hello`, which asks `super()` for `A.hello`. The `A` method returns `"A"`, then `B` adds `"B"`, and `C` adds `"C"`.
%% end

%% question q3 | predict
What does this program print?

```python
class Base:
    def __init__(self):
        self.items = ["base"]

class Child(Base):
    def __init__(self):
        super().__init__()
        self.items.append("child")

print(Child().items)
```
%% answer
['base', 'child']
%% explain
`super().__init__()` runs first and creates the list with `"base"` in it. Then the child's own line adds `"child"`. If the call to `super()` were missing, the attribute `items` would not exist and the program would stop with an `AttributeError`.
%% end

%% question q4 | multi
The classes `Dog(Animal)` and `Cat(Animal)` exist, and `rex = Dog()`. Select every expression that is `True`.
%% choice correct
`isinstance(rex, Animal)`
%% choice correct
`issubclass(Cat, Animal)`
%% choice correct
`issubclass(Dog, object)`
%% choice
`isinstance(rex, Cat)`
%% choice
`type(rex) is Animal`
%% explain
A dog is an animal, a cat class is a subclass of `Animal`, and every class descends from `object`. But `rex` is not a cat, and its exact type is `Dog`, not `Animal`.
%% end

%% question q5 | predict
What does this program print?

```python
class Shape:
    def area(self):
        raise NotImplementedError

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

class Blob(Shape):
    pass

for shape in [Square(3), Blob()]:
    try:
        print(shape.area())
    except NotImplementedError:
        print("no area")
```
%% answer
9
no area
%% explain
`Square` overrides `area`, so it returns 9. `Blob` inherits the method of `Shape`, which raises `NotImplementedError`, and the `except` clause prints the words `no area`. Both objects were created without a problem, because the error only shows when the method is called.
%% end

%% question q6 | choice
A class `Shape(ABC)` has an `@abstractmethod` called `area`. What happens when a program runs `Shape()`?
%% choice
It creates a shape, and `area` returns `None`
%% choice correct
Python raises a `TypeError`, because the class still has an abstract method
%% choice
Python raises a `NotImplementedError` when `area` is called later
%% choice
Nothing, because abstract methods are only comments
%% explain
A class with an abstract method left cannot be created at all. The mistake shows at the moment of creation, which is earlier and clearer than a failure deep inside the program. `NotImplementedError` belongs to the other approach, where the parent's method raises when it is called.
%% end

%% question q7 | multi
Select every true statement about composition, inheritance and mixins.
%% choice correct
A `Stack` that inherits from `list` also inherits methods such as `insert`, which can break the rules of a stack.
%% choice correct
In `class C(A, B)`, Python searches `A` before `B`.
%% choice correct
A mixin is a small class that adds one ability to other classes.
%% choice
`super()` always means the direct parent class.
%% choice
A mixin should normally be created on its own as a finished object.
%% explain
`super()` means the **next class in the MRO**, which in a diamond is not always the direct parent. A mixin adds an ability to the classes that list it, and it is not meant to be created alone.
%% end

%% question q8 | predict
What does this program print?

```python
class A:
    def run(self):
        return ["A"]

class B(A):
    def run(self):
        return ["B"] + super().run()

class C(A):
    def run(self):
        return ["C"] + super().run()

class D(C, B):
    def run(self):
        return ["D"] + super().run()

print(D().run())
```
%% answer
['D', 'C', 'B', 'A']
%% explain
The MRO of `D` is `D`, `C`, `B`, `A`, `object`, because the parents keep the order of the brackets and `A` comes after both. Each `super()` goes to the next class in that line, so `C` hands over to `B` and not to `A`, and each class adds its letter once.
%% end

%% question q9 | fill
Fill in the blank so that the program prints `AppError boom`.

```python
class AppError(___):
    pass

try:
    raise AppError("boom")
except Exception as e:
    print(type(e).__name__, e)
```
%% answer
Exception
%% expected
AppError boom
%% explain
A custom exception inherits from `Exception`, or from one of its children. Then it can be raised and caught like any other exception, and `type(e).__name__` shows the name of your class.
%% end

%% question q10 | order
Put the lines in order so that the program prints `down 7`. One line does not belong.
%% lines
class AppError(Exception):
    pass
class DbError(AppError):
    code = 7
try:
    raise DbError("down")
except AppError as e:
    print(e, e.code)
%% distractors
except ValueError as e:
%% expected
down 7
%% explain
The parent class comes first, then the child with its attribute `code`. A `DbError` is an `AppError`, so `except AppError` catches it, and `e.code` is the attribute of the child. The `except ValueError` line does not belong: a `DbError` is not a `ValueError`, so that clause would not catch it.
%% end

%% question q11 | predict
What does this program print?

```python
from enum import Enum

class Colour(Enum):
    RED = 1
    GREEN = 2

print(Colour(1).name, Colour["GREEN"].value, Colour.RED is Colour(1))
```
%% answer
RED 2 True
%% explain
`Colour(1)` looks up the member by value, and its name is `RED`. `Colour["GREEN"]` looks it up by name, and its value is `2`. Looking up the value 1 twice gives the same unique member, so `is` is true.
%% end

%% question q12 | choice
You model the permissions of a file: read, write and execute, in any combination. Which kind of enum fits best?
%% choice
A plain `Enum`, with one member for each combination
%% choice
An `IntEnum`, so the members can be compared with `<`
%% choice correct
A `Flag`, because its members can be combined with `|` and tested with `in`
%% choice
A list of strings such as `"read"` and `"write"`
%% explain
A `Flag` is made for options that combine. Its members are separate switches, `Permission.READ | Permission.WRITE` joins two of them, and `Permission.READ in mine` tests one. Strings would allow typos, and a plain `Enum` needs a member for every combination.
%% end
