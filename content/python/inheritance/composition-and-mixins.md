---
title: Composition, mixins and the MRO
---
Inheritance is a strong way to reuse code, and it is often **not** the best way. A class that inherits from another is tied to it for life: it gets every method of the parent, wanted or not, and every change to the parent reaches it. This lesson compares inheritance with **composition**, which is often the better choice. Then it looks at what happens when a class has **several** parents, which Python calls multiple inheritance, and at the **mixin**, the safe and useful form of it.

## Is-a or has-a?

Two sentences help you choose. "A dog **is an** animal" suggests inheritance. "A car **has an** engine" suggests composition: the car holds an engine object in an attribute. The sentences are only a start, because a wrong inheritance can still pass the is-a test. Here is a stack, the "last in, first out" pile, built by inheriting from `list`:

```python run
class Stack(list):
    def push(self, item):
        self.append(item)

    def peek(self):
        return self[-1]

s = Stack()
s.push(1)
s.push(2)
s.push(3)
s.insert(0, 99)
print(s.pop(), s.peek())
print(s)
```

It works, and it is a bad stack. A stack should allow only `push`, `pop` and `peek`, but this one is a full `list`, so `insert`, `sort`, `reverse` and dozens of other methods are inherited. The line `s.insert(0, 99)` slipped a value in at the **bottom**, and nothing in the class protects the rule. A stack is not a list. It **uses** a list. With composition, the list is hidden inside an attribute, and the class offers only what you choose:

```python run
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        return self._items.pop()

    def peek(self):
        return self._items[-1]

    def __len__(self):
        return len(self._items)

s = Stack()
s.push(1)
s.push(2)
print(s.pop(), s.peek(), len(s))
try:
    s.insert(0, 99)
except AttributeError as e:
    print("Error:", e)
```

The inside of the stack can change tomorrow (a different container, a size limit) and no user of the class will notice, because they only know three methods.

%% question q-hasa-choice | choice
For which pair is **composition** (an attribute that holds an object) the best fit?
%% choice
`Dog` and `Animal`
%% choice
`Manager` and `Employee`
%% choice correct
`Car` and `Engine`
%% choice
`Square` and `Rectangle`
%% explain
A car is not a kind of engine, and an engine is not a kind of car: a car **has** an engine. The other pairs are is-a relationships: a dog is an animal, a manager is an employee, and a square is a rectangle.
%% end

## Composition and delegation

An object that holds another object often **delegates** work to it: the outer object receives a request, and passes it on to the inner object. The car below does not know how an engine starts. It asks its engine:

```python run
class PetrolEngine:
    def start(self):
        return "The engine coughs, then roars"

class ElectricEngine:
    def start(self):
        return "The motor hums"

class Car:
    def __init__(self, name, engine):
        self.name = name
        self.engine = engine

    def start(self):
        return f"{self.name}: {self.engine.start()}"

cars = [Car("Classic", PetrolEngine()), Car("Modern", ElectricEngine())]
for car in cars:
    print(car.start())

cars[0].engine = ElectricEngine()
print(cars[0].start())
```

This design has three advantages over a family of `PetrolCar` and `ElectricCar` classes. The two engines are unrelated classes that share only the method name, which is duck typing from the last lesson. You can **change the engine while the program runs**, as the last two lines show. And the number of classes stays small: with inheritance, every new combination (petrol car with GPS, electric car with GPS) would need its own class.

A rule of thumb that experienced programmers share: **prefer composition, and use inheritance for true is-a relationships** where the child really is a specialised version of the parent, and can be used wherever the parent can.

## Multiple inheritance

A class may name **several** parents. It gets the methods of all of them:

```python run
class Swimmer:
    def swim(self):
        return "paddling"

class Flyer:
    def fly(self):
        return "flapping"

class Duck(Swimmer, Flyer):
    pass

d = Duck()
print(d.swim(), d.fly())
print(isinstance(d, Swimmer), isinstance(d, Flyer))
```

When two parents have a method with the **same name**, the parent written first wins:

```python run
class A:
    def hello(self):
        return "A"

class B:
    def hello(self):
        return "B"

class C(A, B):
    pass

class D(B, A):
    pass

print(C().hello(), D().hello())
```

%% question q-who-predict | predict
What does this program print?

```python
class A:
    def who(self):
        return "A"

class B:
    def who(self):
        return "B"

class C(B, A):
    pass

print(C().who())
```
%% answer
B
%% explain
Python searches the parents from left to right. `B` is written first in `class C(B, A)`, so its `who` is found first.
%% end

## The method resolution order

For every class, Python builds one **line** of classes, in the order in which it searches them for a name. This line is the **method resolution order**, or **MRO**, and you can see it in the attribute `__mro__`:

```python run
class A:
    pass

class B(A):
    pass

class C(A):
    pass

class D(B, C):
    pass

for cls in D.__mro__:
    print(cls.__name__)
```

The shape of these classes is a diamond: `D` has two parents, and both of them have the same parent `A`. The MRO follows three rules:

1. A class comes **before** its parents, so `D` is first, and `object` (the root of everything) is last.
2. When a class has several parents, they keep the **order of the brackets**: `B` before `C`.
3. Every class appears **once**, even when it can be reached in two ways. `A` is behind both `B` and `C`, so it comes after both of them.

The "diamond problem" asks which `A` method runs when both `B` and `C` inherit it. Python's answer is that there is only one `A` in the line, and the line says where it is.

```python run
class A:
    pass

class B(A):
    pass

try:
    class C(A, B):
        pass
except TypeError as e:
    print("Error:", e)
```

This last program shows a mistake that the rules forbid. `A` must come before `B` according to the brackets, but `B` is a child of `A`, so it must come first according to rule 1. No order can satisfy both rules, and Python refuses to create the class.

%% question q-mro-predict | predict
What does this program print?

```python
class A:
    pass

class B(A):
    pass

class C(A):
    pass

class D(C, B):
    pass

names = []
for cls in D.__mro__:
    names.append(cls.__name__)
print(names)
```
%% answer
['D', 'C', 'B', 'A', 'object']
%% explain
`D` comes first, then its parents in the order of the brackets, `C` and then `B`. Their shared parent `A` comes after both of them, and `object` ends every line.
%% end

## super() follows the MRO

Now you can see what `super()` really means. It is **not** "my parent". It means "**the next class in the MRO** of the object". For a single line of inheritance, the next class is the parent. For a diamond, it is more interesting:

```python run
class A:
    def setup(self):
        print("A.setup")

class B(A):
    def setup(self):
        print("B.setup")
        super().setup()

class C(A):
    def setup(self):
        print("C.setup")
        super().setup()

class D(B, C):
    def setup(self):
        print("D.setup")
        super().setup()

D().setup()
```

Every class runs exactly once, and `A` is last. Look at `B.setup`: it calls `super().setup()`, and the next class after `B` in the MRO of a `D` object is `C`, not `A`. If `B` called `A.setup(self)` **by name**, `C` would be skipped, and if both `B` and `C` did it, `A` would run twice. This is why the rule is: in a family that uses multiple inheritance, every method calls `super()`. Step through the program and follow the calls:

```python trace title="super() visits every class once"
class A:
    def setup(self):
        print("A.setup")

class B(A):
    def setup(self):
        print("B.setup")
        super().setup()

class C(A):
    def setup(self):
        print("C.setup")
        super().setup()

class D(B, C):
    def setup(self):
        print("D.setup")
        super().setup()

D().setup()
```

%% question q-super-chain-predict | predict
What does this program print?

```python
class A:
    def go(self):
        print("A")

class B(A):
    def go(self):
        print("B")
        super().go()

class C(A):
    def go(self):
        print("C")
        super().go()

class D(B, C):
    pass

D().go()
```
%% answer
B
C
A
%% explain
`D` has no `go`, so the search finds `B.go` first. Its `super()` is the next class in the MRO of a `D`, which is `C`, and `C`'s `super()` is `A`. Each class prints once.
%% end

## Mixins

Multiple inheritance is hard to follow when it joins big, independent classes. It is safe and very useful in one form: the **mixin**. A mixin is a **small class that adds one ability** to the classes that list it as a parent. It is not meant to be created on its own, it usually has no `__init__` and no data of its own, and it works with whatever attributes the host class has. By convention its name ends with `Mixin`.

Every object keeps its attributes in a dictionary, and `vars(obj)` returns it. That makes a nice first mixin, one that writes a useful `__repr__` for any class, and another that compares objects by their attributes:

```python run
class ReprMixin:
    def __repr__(self):
        parts = []
        for name, value in vars(self).items():
            parts.append(f"{name}={repr(value)}")
        text = ", ".join(parts)
        return f"{type(self).__name__}({text})"

class EqMixin:
    def __eq__(self, other):
        if type(self) is not type(other):
            return NotImplemented
        return vars(self) == vars(other)

class Point(ReprMixin, EqMixin):
    def __init__(self, x, y):
        self.x = x
        self.y = y

class User(ReprMixin, EqMixin):
    def __init__(self, name, admin=False):
        self.name = name
        self.admin = admin

print(Point(1, 2))
print(Point(1, 2) == Point(1, 2), Point(1, 2) == Point(2, 1))
print(User("Ada"), User("Ada") == User("Ada", True))
```

Both mixins were written once, and two unrelated classes use them. When a class also has a real parent, the usual order is **mixins first, the main base class last**, so that the mixins can adjust what the base class offers.

%% question q-mixin-multi | multi
Select every true statement about mixins.
%% choice correct
A mixin is a small class that adds one ability to other classes.
%% choice correct
A mixin is usually not created on its own.
%% choice correct
The same mixin can be used by classes that have nothing else in common.
%% choice
A mixin must always be the last parent in the brackets.
%% choice
A class can use at most one mixin.
%% explain
Mixins are small, focused and reusable, and they are normally listed **before** the main base class. A class may list as many mixins as it needs.
%% end

## A project: smart devices

Here is a small design that uses a base class, two mixins and the MRO. Each device has a name from the base class. The `SwitchMixin` can turn a device on and off, and the `DimMixin` can set a brightness. A lamp can do both, and a kettle only the first:

```python run
class Device:
    def __init__(self, name):
        self.name = name

class SwitchMixin:
    def turn_on(self):
        self.on = True

    def turn_off(self):
        self.on = False

    def state(self):
        return "on" if self.on else "off"

class DimMixin:
    def dim(self, level):
        self.level = max(0, min(100, level))

class Lamp(SwitchMixin, DimMixin, Device):
    def __init__(self, name):
        super().__init__(name)
        self.on = False
        self.level = 100

class Kettle(SwitchMixin, Device):
    def __init__(self, name):
        super().__init__(name)
        self.on = False

lamp = Lamp("Desk lamp")
kettle = Kettle("Kettle")
lamp.turn_on()
lamp.dim(40)
kettle.turn_off()
for device in (lamp, kettle):
    print(device.name, device.state())
print(lamp.level, hasattr(kettle, "dim"))

names = []
for cls in Lamp.__mro__:
    names.append(cls.__name__)
print(" > ".join(names))
```

The call `super().__init__(name)` in `Lamp` finds the `__init__` of `Device`, because neither mixin has one, and the MRO line `Lamp > SwitchMixin > DimMixin > Device > object` shows the search order. Adding a new ability, such as a timer, means writing one more mixin. The existing classes do not change.

## Pitfalls

- **Deep families are hard to read.** When a method is defined five classes up, a reader has to climb through all of them. Prefer flat families with few levels.
- **Do not inherit only to reuse code.** The `Stack(list)` example had a working class and a broken design. Ask whether the object **is** the parent, or **uses** it.
- **Keep multiple inheritance to mixins**, which have no state of their own. Several big parents with different `__init__` signatures are difficult to combine.
- **Calling a parent by name** (`A.setup(self)`) in a family with several parents breaks the cooperation of `super()`. Use `super()`.
- **A change in a parent reaches every child.** Renaming an attribute in a base class can break classes that you have forgotten. This is the price of the tight link, and it is another reason to prefer composition when you can.

## Your turn

%% exercise stack-composition | A stack that is not a list
Write the class `Stack` by **composition**: it keeps its values in a list that is stored in an attribute, and it does not inherit from `list`. It has the methods `push(value)`, `pop()`, `peek()` and `size()`. The methods `pop` and `peek` raise `ValueError("stack is empty")` when there is no value. The starter reads the commands. For the input below the program prints:

```output
9
9
4
Error: stack is empty
0
```
%% stdin
push 4
push 9
peek
pop
pop
pop
size
done
%% starter
# Write the class Stack here.

stack = Stack()
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    try:
        if parts[0] == "push":
            stack.push(int(parts[1]))
        elif parts[0] == "pop":
            print(stack.pop())
        elif parts[0] == "peek":
            print(stack.peek())
        else:
            print(stack.size())
    except ValueError as e:
        print("Error:", e)

%% solution
class Stack:
    def __init__(self):
        self.items = []

    def push(self, value):
        self.items.append(value)

    def pop(self):
        if not self.items:
            raise ValueError("stack is empty")
        return self.items.pop()

    def peek(self):
        if not self.items:
            raise ValueError("stack is empty")
        return self.items[-1]

    def size(self):
        return len(self.items)

stack = Stack()
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    try:
        if parts[0] == "push":
            stack.push(int(parts[1]))
        elif parts[0] == "pop":
            print(stack.pop())
        elif parts[0] == "peek":
            print(stack.peek())
        else:
            print(stack.size())
    except ValueError as e:
        print("Error:", e)
%% tests
expect_output("9\n9\n4\nError: stack is empty\n0")
check(not issubclass(Stack, list), "a Stack should hold a list, and not inherit from list")
s = Stack()
check(not hasattr(s, "insert"), "a stack has no insert method")
s.push("a")
s.push("b")
expect(s.size(), 2, "size after two pushes")
expect(s.peek(), "b", "peek shows the top")
expect(s.size(), 2, "peek does not remove")
expect(s.pop(), "b", "pop returns the top")
expect(s.pop(), "a", "then the next one")
check(raises(ValueError, s.pop), "pop on an empty stack")
check(raises(ValueError, s.peek), "peek on an empty stack")
%% hint
In `__init__`, create the empty list in an attribute: `self.items = []`. The class has no parent.
%% hint
`push` appends, `size` returns `len(self.items)`, and `peek` returns `self.items[-1]`. Each method has `self` first.
%% hint
In `pop` and `peek`, check `if not self.items:` first and raise `ValueError("stack is empty")`. In `pop`, return `self.items.pop()` after the check.
%% end

%% exercise car-engines | Cars with engines
The starter has two engine classes. Write the class `Car(name, engine)` that **has** an engine. Its method `trip_cost(km)` asks the engine for the cost, and its method `swap_engine(engine)` replaces the engine. For the code below the program prints:

```output
Zoom: 12.00
Zoom: 4.00
```
%% starter
class PetrolEngine:
    def cost(self, km):
        return km * 0.12

class ElectricEngine:
    def cost(self, km):
        return km * 0.04

# Write the class Car here.

car = Car("Zoom", PetrolEngine())
print(f"{car.name}: {car.trip_cost(100):.2f}")
car.swap_engine(ElectricEngine())
print(f"{car.name}: {car.trip_cost(100):.2f}")

%% solution
class PetrolEngine:
    def cost(self, km):
        return km * 0.12

class ElectricEngine:
    def cost(self, km):
        return km * 0.04

class Car:
    def __init__(self, name, engine):
        self.name = name
        self.engine = engine

    def trip_cost(self, km):
        return self.engine.cost(km)

    def swap_engine(self, engine):
        self.engine = engine

car = Car("Zoom", PetrolEngine())
print(f"{car.name}: {car.trip_cost(100):.2f}")
car.swap_engine(ElectricEngine())
print(f"{car.name}: {car.trip_cost(100):.2f}")
%% tests
expect_output("Zoom: 12.00\nZoom: 4.00")
class Free:
    def cost(self, km):
        return 0
c = Car("T", Free())
expect(c.trip_cost(50), 0, "any object with cost() works as an engine")
c.swap_engine(PetrolEngine())
expect(c.trip_cost(10), 1.2, "after a swap", approx=0.0001)
check(not issubclass(Car, (PetrolEngine, ElectricEngine)), "a car has an engine, it is not an engine")
check(isinstance(c.engine, PetrolEngine), "the engine is stored in the attribute engine")
%% hint
`Car.__init__` stores both values: `self.name = name` and `self.engine = engine`.
%% hint
`trip_cost` does not calculate anything. It **delegates**: `return self.engine.cost(km)`.
%% hint
`swap_engine` assigns the new engine to `self.engine`.
%% end

%% exercise mixin-practice | A comparison mixin
Write a mixin `ComparableMixin` that gives a class the four operators `<`, `<=`, `>` and `>=`. Each one compares `self.key()` with `other.key()`, so a class that uses the mixin only needs to define `key()`. Then write two classes that use it:

- `Version(major, minor)`, whose key is the tuple `(major, minor)`.
- `Book(title, pages)`, whose key is the number of pages.

The code in the starter uses them. It prints:

```output
1.9
2.0
2.1
True True
B
True False
```
%% starter
# Write ComparableMixin, Version and Book here.

versions = [Version(2, 1), Version(1, 9), Version(2, 0)]
for v in sorted(versions):
    print(f"{v.major}.{v.minor}")
print(Version(1, 2) < Version(1, 10), Version(3, 0) >= Version(3, 0))
books = [Book("A", 120), Book("B", 450), Book("C", 300)]
print(max(books).title)
print(Book("A", 5) > Book("B", 3), Book("A", 5) <= Book("B", 3))

%% solution
class ComparableMixin:
    def __lt__(self, other):
        return self.key() < other.key()

    def __le__(self, other):
        return self.key() <= other.key()

    def __gt__(self, other):
        return self.key() > other.key()

    def __ge__(self, other):
        return self.key() >= other.key()

class Version(ComparableMixin):
    def __init__(self, major, minor):
        self.major = major
        self.minor = minor

    def key(self):
        return (self.major, self.minor)

class Book(ComparableMixin):
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages

    def key(self):
        return self.pages

versions = [Version(2, 1), Version(1, 9), Version(2, 0)]
for v in sorted(versions):
    print(f"{v.major}.{v.minor}")
print(Version(1, 2) < Version(1, 10), Version(3, 0) >= Version(3, 0))
books = [Book("A", 120), Book("B", 450), Book("C", 300)]
print(max(books).title)
print(Book("A", 5) > Book("B", 3), Book("A", 5) <= Book("B", 3))
%% tests
expect_output("1.9\n2.0\n2.1\nTrue True\nB\nTrue False")
check(issubclass(Version, ComparableMixin) and issubclass(Book, ComparableMixin), "both classes use the mixin")
class Temp(ComparableMixin):
    def __init__(self, degrees):
        self.degrees = degrees

    def key(self):
        return self.degrees
expect(Temp(5) < Temp(9), True, "less than")
expect(Temp(9) <= Temp(9), True, "less than or equal")
expect(Temp(5) > Temp(9), False, "greater than")
expect(Temp(9) >= Temp(10), False, "greater than or equal")
check(defines("key"), "the classes define key()")
%% hint
The mixin has four methods, `__lt__`, `__le__`, `__gt__` and `__ge__`. Each one returns a comparison of `self.key()` and `other.key()`.
%% hint
`class Version(ComparableMixin):` lists the mixin as the parent. The class stores its values in `__init__` and defines `key(self)`.
%% hint
The key of a `Version` is a tuple, `(self.major, self.minor)`. Tuples compare item by item, so `(1, 9)` is less than `(2, 0)`. The key of a `Book` is `self.pages`.
%% end

%% exercise diamond-fix | Challenge: One build step each
The starter builds a bike from a diamond of four classes, and the output shows a bug: the step `Base` runs **twice**, because the methods call their parents by name. Change the three `build` methods that call `Base.build(self)`, `Frame.build(self)` and `Wheels.build(self)` so that they use `super()` and every step runs **exactly once**. The program must print:

```output
Bike > Frame > Wheels > Base
```
%% starter
steps = []

class Base:
    def build(self):
        steps.append("Base")

class Frame(Base):
    def build(self):
        steps.append("Frame")
        Base.build(self)

class Wheels(Base):
    def build(self):
        steps.append("Wheels")
        Base.build(self)

class Bike(Frame, Wheels):
    def build(self):
        steps.append("Bike")
        Frame.build(self)
        Wheels.build(self)

Bike().build()
print(" > ".join(steps))

%% solution
steps = []

class Base:
    def build(self):
        steps.append("Base")

class Frame(Base):
    def build(self):
        steps.append("Frame")
        super().build()

class Wheels(Base):
    def build(self):
        steps.append("Wheels")
        super().build()

class Bike(Frame, Wheels):
    def build(self):
        steps.append("Bike")
        super().build()

Bike().build()
print(" > ".join(steps))
%% tests
expect_output("Bike > Frame > Wheels > Base")
check(source().count("super()") >= 3, "uses super() in three methods")
check("Base.build(self)" not in source() and "Frame.build(self)" not in source() and "Wheels.build(self)" not in source(), "no parent is called by its name any more")
steps.clear()
Wheels().build()
expect(steps, ["Wheels", "Base"], "a Wheels object on its own")
steps.clear()
Frame().build()
expect(steps, ["Frame", "Base"], "a Frame object on its own")
%% hint
Run the starter and read the output: `Base` appears twice. `Frame` and `Wheels` both call `Base.build(self)`, and `Bike` calls both of them.
%% hint
In a diamond, each method should call `super().build()` **once**. Then the MRO of a `Bike` (`Bike`, `Frame`, `Wheels`, `Base`, `object`) decides who comes next.
%% hint
Replace `Base.build(self)` with `super().build()` in `Frame` and in `Wheels`. In `Bike`, remove the two calls by name and write a single `super().build()`.
%% end

## What you learned

- **Is-a or has-a?** Use inheritance for a true is-a relationship. Use **composition** (an attribute that holds another object) when one object **uses** another. A stack that inherits from `list` offers dozens of unwanted methods.
- **Delegation**: the outer object passes a request to the inner object, as `Car.start()` calls `self.engine.start()`. The inner part can be swapped, even while the program runs.
- **Multiple inheritance**: `class C(A, B)` gets the methods of both parents, and the parent written first wins.
- The **MRO** (`C.__mro__`) is the single line of classes that Python searches. A class comes before its parents, the order of the brackets is kept, and every class appears once. An order that cannot be satisfied gives a `TypeError`.
- `super()` means "the next class in the MRO", not "my parent". When every method in a diamond calls `super()`, each class runs exactly once.
- A **mixin** is a small class that adds one ability, usually without its own `__init__` or data. List the mixins first and the main base class last. `vars(obj)` returns the dictionary of an object's attributes.
- Avoid deep families, inheriting only to reuse code, and calling parents by name in multiple inheritance.
