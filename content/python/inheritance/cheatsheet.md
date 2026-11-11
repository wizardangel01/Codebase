---
title: Inheritance: cheat sheet
---
## Subclasses

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Dog(Animal):                    # a Dog is an Animal
    def __init__(self, name, breed):
        super().__init__(name)        # run the parent's setup first, without self
        self.breed = breed

    def speak(self):                  # overrides the parent's method
        return "Woof"

rex = Dog("Rex", "Collie")
print(isinstance(rex, Animal), issubclass(Dog, Animal), type(rex) is Dog)
```

- Python looks for a name in the object, then in its class, then in the parents. The first match wins.
- A child that writes its own `__init__` normally starts with `super().__init__(...)`. Without it, the parent's attributes are missing.
- `super().method()` lets a child add to the parent's result.
- `isinstance(obj, Class)` is true for the class and its children, `type(obj) is Class` only for the exact class.
- Every class descends from `object`, which provides `__str__`, `__repr__` and `__eq__` until you override them.
- Before you write `class B(A)`, say "a B **is an** A".

## Polymorphism and duck typing

One method name, many behaviours: the caller does not ask for the type.

```python
for animal in [Dog("Rex", "Collie"), Animal("Generic")]:
    print(animal.speak())             # each object uses its own version

def talk(thing):
    try:
        return thing.speak()          # duck typing: any object with speak() works
    except AttributeError:
        return "(silence)"
```

| Tool | What it does |
| --- | --- |
| `hasattr(obj, "name")` | looks first: does the object have this attribute? |
| `try` with `except AttributeError` | tries first, handles the failure |
| `raise NotImplementedError` | the parent's method refuses to run, and the mistake shows when it is called |

## Abstract base classes

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):                   # every child must provide this
        pass

    def describe(self):               # a normal method, inherited by all
        return f"{type(self).__name__}: {self.area():.2f}"
```

- A class with an abstract method left cannot be created: `TypeError: Can't instantiate abstract class ...`.
- A misspelt method name in a child is caught at that moment, as the abstract method is still missing.
- `NotImplementedError` is an exception you raise. `NotImplemented` is a value that `__eq__` and `__lt__` return.
- A **protocol** is an agreement about methods without a parent class, such as "anything with `write(text)`".

## Composition, multiple inheritance and the MRO

| Relationship | Use | Example |
| --- | --- | --- |
| is-a | inheritance | a `Manager` is an `Employee` |
| has-a | composition and delegation | a `Car` has an `Engine`, and `Car.start()` calls `self.engine.start()` |

```python
class Duck(Swimmer, Flyer):           # several parents: Swimmer is searched first
    pass

for cls in Duck.__mro__:              # the method resolution order
    print(cls.__name__)               # Duck, Swimmer, Flyer, object
```

1. A class comes **before** its parents.
2. Parents keep the **order of the brackets**.
3. Every class appears **once**. An order that cannot satisfy the rules is a `TypeError`.

- `super()` means "the **next class in the MRO**", which in a diamond is not always the direct parent. When every method calls `super()`, each class runs exactly once. Do not call a parent by its name in such a family.
- A **mixin** is a small class that adds one ability, usually with no `__init__` and no data. List mixins first and the main base class last: `class Lamp(SwitchMixin, DimMixin, Device)`.
- `vars(obj)` returns the dictionary of an object's attributes.
- Avoid deep families. Do not inherit only to reuse code (a `Stack(list)` has `insert` too).

## Custom exceptions

```python
class BankError(Exception):                      # the base of the family
    pass

class InsufficientFundsError(BankError):
    def __init__(self, needed, available):
        super().__init__(f"need {needed}, have {available}")
        self.needed = needed                     # facts for the handler
        self.available = available

class NegativeAmountError(ValueError):           # a kind of ValueError
    pass

try:
    raise InsufficientFundsError(80, 50)
except InsufficientFundsError as e:              # specific first
    print(e, e.needed - e.available)
except BankError as e:                           # the whole family
    print("bank problem", e)

try:
    settings["volume"]
except KeyError as e:
    raise MissingSettingError("no volume") from e    # e is stored in __cause__
```

## Enums

```python
from enum import Enum, IntEnum, Flag, auto

class Colour(Enum):
    RED = 1
    GREEN = 2

Colour.RED.name, Colour.RED.value      # "RED", 1
Colour(2)                              # by value: Colour.GREEN
Colour["RED"]                          # by name: Colour.RED
Colour.RED is Colour(1)                # True: members are unique
Colour.RED == 1                        # False: a member is not its value
for colour in Colour:                  # in the order of the definition
    print(colour.name)
```

| Kind | Use it for |
| --- | --- |
| `Enum` | a fixed set of choices without an order |
| `auto()` | let Python choose the values (1, 2, 3, ...) |
| `IntEnum` | members that are also integers, so `<` and arithmetic work |
| `Flag` | options that combine (join them with the or operator, test with `in`, keep some with `&`) |

- A wrong value, as in `Colour(5)`, raises `ValueError`. A wrong name, as in `Colour.PURPLE`, raises `AttributeError`.
- Members can be used as dictionary keys, and an enum can have methods.
