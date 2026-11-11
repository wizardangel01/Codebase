---
title: Classes: cheat sheet
---
## Classes and objects

A **class** is a blueprint. An **object** (an instance) is one thing made from it. Every method has `self` as its first parameter, and `self` is the object the method works on.

```python
class Dog:
    sound = "Woof"                      # class attribute: shared by all dogs

    def __init__(self, name, age=1):    # runs when you write Dog(...)
        self.name = name                # instance attributes: one set per dog
        self.age = age

    def speak(self):                    # a method
        return f"{self.name} says {self.sound}"

rex = Dog("Rex")                        # make an object
print(rex.speak())                      # same as Dog.speak(rex)
print(type(rex), isinstance(rex, Dog))
```

| Mistake | What goes wrong |
| --- | --- |
| `def speak():` without `self` | `TypeError: takes 0 positional arguments but 1 was given` |
| `name = name` in `__init__` | nothing is stored, because it is only a local variable |
| `name` instead of `self.name` in a method | `NameError`, or the wrong variable |
| `Dog.speak()` when you meant `rex.speak()` | the method has no object to work on |
| `items = []` in the class body | one list shared by all the objects, so create it in `__init__` |
| `def __init__(self, items=[])` | one default list shared by every call, so use `None` |

## State, aliases and copies

```python
a = Dog("Rex")
b = a                  # a second name for the same object
b.name = "Max"         # changes a.name too
print(a is b)          # True: the same object
print(a == Dog("Max")) # False: == means "is" until you define __eq__

import copy
c = copy.copy(a)       # an independent copy of the top level
```

- A function that receives an object can change it.
- Assigning through an object (`b.count = 10`) creates an **instance** attribute. It never changes the class attribute, which you change with `Dog.count += 1`.
- Objects can live in lists and dictionaries, and `sorted(items, key=lambda d: d.age)` sorts them.

## Printing

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):               # for people: print and f-strings
        return f"({self.x}, {self.y})"

    def __repr__(self):              # for programmers: repr() and lists
        return f"Point({self.x}, {self.y})"
```

Both methods **return** a string and do not print. With only `__repr__`, `print` uses it as well, so write `__repr__` first.

## Special methods

| You write | Python calls | Notes |
| --- | --- | --- |
| `a == b` | `a.__eq__(b)` | return `NotImplemented` for types you do not know |
| `a < b` | `a.__lt__(b)` | gives you `sorted`, `min` and `max` |
| `a + b` | `a.__add__(b)` | return a **new** object |
| `len(a)` | `a.__len__()` | a whole number |
| `a[i]` | `a.__getitem__(i)` | gives you loops and slices too |
| `x in a` | `a.__contains__(x)` | true or false |
| `if a:` | `a.__bool__()` | falls back to `__len__` |
| `hash(a)` | `a.__hash__()` | define it with `__eq__` for sets and dictionary keys |

`functools.total_ordering` writes the other comparisons when you define `__eq__` and one of `<`, `<=`, `>`, `>=`.

## Properties, class methods and static methods

```python
class Account:
    def __init__(self, balance):
        self.balance = balance       # goes through the setter below

    @property
    def balance(self):               # read: acc.balance
        return self._balance

    @balance.setter
    def balance(self, value):        # write: acc.balance = 5
        if value < 0:
            raise ValueError("balance cannot be negative")
        self._balance = value

class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_text(cls, text):        # an alternative constructor
        y, m, d = text.split("-")
        return cls(int(y), int(m), int(d))

    @staticmethod
    def is_leap(year):               # a plain function inside the class
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
```

| Decorator | First parameter | Use it for |
| --- | --- | --- |
| none (a normal method) | `self`, the object | work that needs the object |
| `@property` | `self` | a value that is calculated when it is read |
| `@classmethod` | `cls`, the class | alternative constructors |
| `@staticmethod` | nothing special | a helper that belongs to the topic of the class |

A property without a setter is read-only: assigning to it raises `AttributeError`.

## Underscores

| Name | Meaning |
| --- | --- |
| `_name` | internal, by convention only |
| `__name` | mangled to `_Class__name`, which avoids clashes in subclasses |
| `__name__` | a special name that belongs to Python, so do not invent your own |

Nothing in Python is truly private. It is a habit: use the methods of an object, and leave the underscore names alone.

## Designing with classes

1. Read the problem. **Nouns** are candidates for classes, **verbs** for methods, and facts about a noun for attributes.
2. A plain value (a title, a price) does not need its own class.
3. **Encapsulation**: the class that owns the data owns the rules for changing it.
4. **Composition**: an object can hold other objects (`self.engine = Engine()`, a `Library` with a list of `Book` objects).
5. **Refactor** dictionaries and functions into a class: keys become attributes, functions become methods, and the output must not change.

```python
from dataclasses import dataclass, field

@dataclass(order=True)               # also: frozen=True
class Student:
    name: str
    score: int = 0                   # fields with defaults come last
    courses: list = field(default_factory=list)

    def enrol(self, course):
        self.courses.append(course)

print(Student("Ada", 90))            # Student(name='Ada', score=90, courses=[])
```

| Option | You get |
| --- | --- |
| `@dataclass` | `__init__`, `__repr__` and `__eq__` |
| `order=True` | `<`, `<=`, `>` and `>=` that compare the fields from left to right |
| `frozen=True` | fields that cannot be changed, and hashable objects |
| `field(default_factory=list)` | a new empty list for each object |

The annotations (`name: str`) are for readers. Python does not check them.
