---
title: Classes: module quiz
pass: 70
---
Twelve questions on everything in this module: classes and objects, state, special methods, properties and class design. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | choice
In the statement `rex = Dog("Rex")`, what are `Dog` and `rex`?
%% choice correct
`Dog` is a class (the blueprint), and `rex` is an object made from it
%% choice
`Dog` is an object, and `rex` is a class
%% choice
Both are classes
%% choice
`Dog` is a method, and `rex` is a variable that cannot change
%% explain
A class describes a kind of thing, and calling it, as in `Dog("Rex")`, makes one object (an instance). The name `rex` refers to that object, and the object has its own attributes and methods.
%% end

%% question q2 | predict
What does this program print?

```python
class Counter:
    def __init__(self):
        self.n = 0

    def add(self):
        self.n += 1
        return self.n

a = Counter()
b = Counter()
a.add()
a.add()
print(a.add(), b.add())
```
%% answer
3 1
%% explain
Each object has its own attribute `n`, because `__init__` ran once for each object. The object `a` is changed three times and gives `3`. The object `b` is changed once and gives `1`.
%% end

%% question q3 | predict
What does this program print?

```python
class Cat:
    count = 0

    def __init__(self):
        Cat.count += 1

a = Cat()
b = Cat()
b.count = 10
print(Cat.count, a.count, b.count)
```
%% answer
2 2 10
%% explain
The class attribute `count` is shared and was increased by both calls to `Cat()`. The assignment `b.count = 10` does not change the class attribute. It creates a new instance attribute on `b` that hides the class attribute for that object only.
%% end

%% question q4 | multi
Select every true statement about `__str__` and `__repr__`.
%% choice correct
`print(obj)` shows the text that `__str__` returns.
%% choice correct
A list of objects shows each item with `__repr__`.
%% choice correct
If a class has only `__repr__`, then `print(obj)` uses it too.
%% choice
`__str__` must call `print` itself.
%% choice
`__repr__` must return a number.
%% explain
Both methods **return** a string, and they never print. `__str__` is for people and `__repr__` is for programmers. A list uses `__repr__` for its items, and `print` falls back to `__repr__` when `__str__` is missing.
%% end

%% question q5 | predict
What does this program print?

```python
class Player:
    def __init__(self, name):
        self.name = name

a = Player("Ada")
b = a
b.name = "Grace"
c = Player("Grace")
print(a.name, a is b, a is c, a == c)
```
%% answer
Grace True False False
%% explain
The statement `b = a` gives the same object a second name, so changing `b.name` changes `a.name` as well, and `a is b` is `True`. The object `c` is a different object. Without an `__eq__` method, `==` falls back to `is`, so `a == c` is `False` even though the names match.
%% end

%% question q6 | fill
Fill in the blank so that the program prints `True`.

```python
class Money:
    def __init__(self, cents):
        self.cents = cents

    def ___(self, other):
        return self.cents == other.cents

print(Money(5) == Money(5))
```
%% answer
__eq__
%% expected
True
%% explain
Python calls `__eq__` for the `==` operator. The method compares the values inside the two objects, so two `Money` objects with the same cents are equal.
%% end

%% question q7 | predict
What does this program print?

```python
class Card:
    def __init__(self, rank):
        self.rank = rank

    def __lt__(self, other):
        return self.rank < other.rank

    def __repr__(self):
        return f"Card({self.rank})"

print(sorted([Card(9), Card(2), Card(5)]))
print(max(Card(3), Card(7)))
```
%% answer
[Card(2), Card(5), Card(9)]
Card(7)
%% explain
`sorted` and `max` only need the `<` comparison, which `__lt__` provides. The list is shown with `__repr__`, in order of rank, and `max` returns the card with the highest rank.
%% end

%% question q8 | choice
A class has a read-only property `area` (a `@property` without a setter). What happens when a program runs `shape.area = 10`?
%% choice
The value is stored, and `shape.area` shows `10` from then on
%% choice correct
Python raises an `AttributeError`
%% choice
Python raises a `ValueError`
%% choice
Nothing happens, and the line is ignored
%% explain
A property without a setter cannot be assigned to, and Python reports an `AttributeError`. To allow assignment, you add a method with `@area.setter` that checks the new value.
%% end

%% question q9 | fill
Fill in the blank so that the program prints `2026 11 2`.

```python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @___
    def from_text(cls, text):
        year, month, day = text.split("-")
        return cls(int(year), int(month), int(day))

d = Date.from_text("2026-11-02")
print(d.year, d.month, d.day)
```
%% answer
classmethod
%% expected
2026 11 2
%% explain
A class method receives the class as `cls`, so it can make an object with `cls(...)`. This is the usual way to give a class an alternative constructor, which is called on the class itself: `Date.from_text(...)`.
%% end

%% question q10 | order
Put the lines in order so that the program prints `vroom`. One line does not belong.
%% lines
class Engine:
    def start(self):
        return "vroom"
class Car:
    def __init__(self):
        self.engine = Engine()
car = Car()
print(car.engine.start())
%% distractors
print(car.start())
%% expected
vroom
%% explain
The class `Engine` must exist before `Car` builds an engine in `__init__`, and both classes come before the object that uses them. This is composition: a `Car` has an `Engine`. The line `print(car.start())` does not belong, because `Car` has no method `start`, so Python would raise an `AttributeError`.
%% end

%% question q11 | choice
Which statement describes encapsulation?
%% choice correct
An object keeps its data together with the rules for changing it, and other code uses its methods
%% choice
The code of a class is hidden, so nobody can read it
%% choice
Python blocks all access to attributes whose names start with an underscore
%% choice
Every method of a class is copied into each object
%% explain
Encapsulation is a design habit: the class that owns the data also owns its rules, such as "a balance never goes below zero". Python does not enforce privacy, so a leading underscore only tells other programmers that a name is internal.
%% end

%% question q12 | multi
Select every true statement about dataclasses.
%% choice correct
`@dataclass` writes `__init__`, `__repr__` and `__eq__` from the annotated fields.
%% choice correct
A list field needs `field(default_factory=list)` as its default value.
%% choice correct
With `frozen=True` the fields cannot be changed after the object is created.
%% choice
Python rejects `Point("a", "b")` when the fields are annotated as `int`.
%% choice
A dataclass cannot have methods of its own.
%% explain
The annotations are documentation, and Python does not check them at run time. A dataclass can have ordinary methods, and a plain `[]` default is refused, so each object gets its own list from the `default_factory`.
%% end
