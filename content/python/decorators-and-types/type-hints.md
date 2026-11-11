---
title: Type hints and dataclasses
---
Python does not ask you to declare the type of a variable. That keeps small programs short, but in a large program it gets harder and harder to remember what each function expects. Is `scores` a list or a dictionary? Can the function return `None`? **Type hints** let you write the answers down, right in the code. They are labels for people, editors and checking tools. They are not rules that Python enforces, and this lesson shows both sides of that sentence. Then it returns to **dataclasses**, from module 10, and adds the features that professionals use every day.

## Writing a hint

A hint for a parameter goes after a colon. A hint for the **result** goes after an arrow, `->`, before the colon that ends the `def` line. A variable can carry a hint too:

```python run
def greet(name: str, times: int = 1) -> str:
    return ", ".join(["Hello " + name] * times)

age: int = 30                    # a variable with a hint
print(greet("Ada", 2))
print(greet.__annotations__)     # Python keeps the hints in this dictionary
```

The hints appear in a dictionary called `__annotations__`, with the key `"return"` for the arrow. Apart from storing them, Python does nothing with them.

## Hints are not enforced

Python ignores hints when it runs a program. This function is labelled for numbers, but it happily accepts a string and a list:

```python run
def double(x: int) -> int:
    return x * 2

print(double(21))
print(double("ab"))      # runs fine: Python does not check the hint
print(double([1, 2]))
```

So why write hints? There are three good reasons.

- **They document the code.** The signature `find_user(users: dict[int, str], user_id: int) -> str | None` says in one line what goes in and what comes out.
- **Editors use them.** Your editor can suggest the right methods for a `str`, and warn you when you pass a number to a function that wants text.
- **Checkers use them.** Programs such as **mypy** and **pyright** read all the hints in your project, without running it, and report every place where the types do not fit. They run on your own computer, and not in this browser.

%% key Hints describe, they do not enforce
A wrong type is still found only when Python hits an error at run time, or when a checker reads the file before you run it. If you need a **run-time** check, you write it yourself. You will do that in an exercise at the end of this lesson.
%% end

%% question q-notenforced-predict | predict
What does this program print?

```python
def double(x: int) -> int:
    return x * 2

print(double("ab"))
```
%% answer
abab
%% explain
Python does not check the hint `int`. The text `"ab"` is multiplied by 2 as usual, which repeats it, so the program prints `abab` and no error appears.
%% end

## The most common hints

You already know the names of the basic types: `int`, `float`, `str`, `bool`. The containers are written with the type of their items in square brackets, and a few extra forms cover the rest:

| Hint | Meaning |
| --- | --- |
| `list[int]` | a list of whole numbers |
| `dict[str, int]` | a dictionary from text to whole numbers |
| `set[str]` | a set of strings |
| `tuple[int, str]` | a tuple with exactly two items: an int, then a str |
| `tuple[int, ...]` | a tuple of any length that holds ints |
| `str or None` (written with a bar) | a string, or `None` |
| `Callable[[int], str]` | a function that takes an int and returns a str |
| `Iterable[int]` | anything that can be looped over, giving ints |
| `Any` | anything at all: the checker stops checking |

Here is a function whose hints say a lot. The parameter is a dictionary from names to lists of marks, and the result is a pair of numbers:

```python run
def summarise(scores: dict[str, list[int]], pass_mark: int = 50) -> tuple[int, int]:
    passed = 0
    for name, marks in scores.items():
        if sum(marks) / len(marks) >= pass_mark:
            passed += 1
    return passed, len(scores)

print(summarise({"Ada": [90, 80], "Ben": [30, 40]}))
```

The most useful hint of all might be `str | None` (read it as "a string **or** None"). Many functions return `None` when they find nothing, and the hint tells the caller to expect it. A checker will then insist that you deal with the `None` before you use the string:

```python run
def find_user(users: dict[int, str], user_id: int) -> str | None:
    return users.get(user_id)

users = {1: "Ada", 2: "Ben"}
name = find_user(users, 3)
print(name)
if name is not None:             # a checker wants this test before name.upper()
    print(name.upper())
else:
    print("no such user")
```

Functions are values, so they have hints too. `Callable[[int], int]` means "a function that takes one int and returns an int", and `Iterable[int]` means "anything that gives ints when you loop over it". Both are in the module `collections.abc`:

```python run
from collections.abc import Callable, Iterable

def apply_all(func: Callable[[int], int], numbers: Iterable[int]) -> list[int]:
    return [func(n) for n in numbers]

print(apply_all(lambda n: n * n, range(5)))
```

%% question q-optional-choice | choice
What does the hint `str | None` mean?
%% choice
The value must be a string, and nothing else
%% choice correct
The value is a string or `None`
%% choice
The function prints a string, or nothing at all
%% choice
The value is the result of joining a string and `None`
%% explain
The bar between two types reads as "or". A function with the result hint `str | None` may return a string, and may also return `None`, for example when a search finds nothing. Older code writes the same thing as `Optional[str]`.
%% end

## Generics: one function, many types

Look at a function that returns the first item of a list. It works for a list of numbers and for a list of strings. How do you write its hint? With a **type variable**: a placeholder, written in square brackets after the function name, that stands for "whatever type the items have". The checker then knows that a list of ints gives an int, and a list of strings gives a string:

```python run
def first[T](items: list[T]) -> T:
    return items[0]

print(first([3, 1, 2]), first(["a", "b"]))

class Stack[T]:
    def __init__(self) -> None:
        self.items: list[T] = []

    def push(self, item: T) -> None:
        self.items.append(item)

    def pop(self) -> T:
        return self.items.pop()

numbers = Stack[int]()           # a stack that holds ints
numbers.push(1)
numbers.push(2)
print(numbers.pop())
```

The same placeholder `T` is used for the argument and the result, so they are tied together. A class can have one too, and then `Stack[int]` is a stack of ints. This `[T]` syntax is new in Python 3.12. Older code creates the placeholder with `TypeVar("T")` from the module `typing`, and you will see that style in many libraries. A long hint can also be given a short name with a `type` statement:

```python run
type Scores = dict[str, list[int]]       # a name for a long hint

def best(scores: Scores) -> str:
    return max(scores, key=lambda name: sum(scores[name]))

print(best({"Ada": [90, 80], "Ben": [70, 99]}))
```

## More tools from the typing module

The module `typing` has a few more forms, each with a clear job. They do nothing at run time, except that some of them build useful classes:

```python run
from typing import Final, Literal, NamedTuple, Protocol, TypedDict

MAX_PLAYERS: Final = 4                    # a checker warns if you assign it again

def paint(colour: Literal["red", "green", "blue"]) -> str:
    return f"painting {colour}"           # only these three texts are allowed

class Movie(TypedDict):                   # a dictionary with known keys
    title: str
    year: int

class Point(NamedTuple):                  # a tuple with named fields
    x: int
    y: int

class Speaker(Protocol):                  # anything with a speak method fits
    def speak(self) -> str: ...

class Dog:
    def speak(self) -> str:
        return "Woof"

class Robot:
    def speak(self) -> str:
        return "Beep"

def announce(thing: Speaker) -> None:
    print(thing.speak())

movie: Movie = {"title": "Alien", "year": 1979}
print(movie["title"], paint("red"), Point(1, 2).x, MAX_PLAYERS)
print(Point(3, 4), Point(3, 4) == (3, 4))
announce(Dog())
announce(Robot())
```

- **`Final`** says that a name must not be reassigned, like a constant.
- **`Literal`** limits a value to a few exact choices.
- **`TypedDict`** describes a dictionary with fixed keys, such as a record read from JSON. At run time it is an ordinary `dict`.
- **`NamedTuple`** makes a real tuple with named fields: `Point(3, 4)` equals `(3, 4)`, it is immutable, and it prints well.
- **`Protocol`** describes behaviour. Neither `Dog` nor `Robot` inherits from `Speaker`, yet both fit it, because both have a `speak` method. This is the checkers' version of **duck typing**: if it speaks like a speaker, it is a speaker.

## Reading hints while the program runs

Because Python keeps the hints, a program can read them. Two tools help: `typing.get_type_hints` returns the hints with their names resolved, and `inspect.signature` describes the parameters of a function, and can pair them with the arguments of a call:

```python run
import inspect
from typing import get_type_hints

def scale(value: float, factor: float = 2.0) -> float:
    return value * factor

print(get_type_hints(scale))
signature = inspect.signature(scale)
print(signature)
print(list(signature.parameters))

bound = signature.bind(3.0, factor=4.0)      # pair the arguments with the names
print(bound.arguments)
for name, parameter in signature.parameters.items():
    print(name, parameter.annotation, parameter.default)
```

The call `signature.bind(...)` lines up the values that you pass with the names of the parameters, which is exactly what a decorator needs to inspect a call. This is how frameworks such as FastAPI and Pydantic use hints to check data. You will build a small checker of your own in the last exercise.

%% question q-hints-multi | multi
Select every statement about type hints that is **true**.
%% choice correct
Python ignores them when the program runs
%% choice correct
Tools such as mypy and pyright can check them without running the program
%% choice correct
A program can read them through `__annotations__`
%% choice
The line `x: int = "a"` raises a `TypeError`
%% choice
They make the program run faster
%% explain
A hint is stored and then ignored, so `x: int = "a"` runs without a complaint, and the hints cost a little time instead of saving any. They are valuable because of what people and checking tools do with them, and a program can read them from `__annotations__`.
%% end

## Dataclasses with types

In module 10 you met `@dataclass`, which writes `__init__`, `__repr__` and `__eq__` for a class from its **annotated fields**. Those annotations are type hints, so everything above applies. Here are the extra features that make dataclasses so useful in practice:

```python run
from dataclasses import dataclass, field

@dataclass
class Player:
    name: str
    score: int = 0
    badges: list[str] = field(default_factory=list)   # a NEW list for each player

    def __post_init__(self):                          # runs right after the automatic __init__
        if self.score < 0:
            raise ValueError("score cannot be negative")
        self.name = self.name.title()                 # tidy up the value

ada = Player("ada lovelace", 10)
ben = Player("ben")
ada.badges.append("starter")
print(ada)
print(ben)
```

Two features appear here. The function **`field(default_factory=list)`** gives every object its **own** new list. The method **`__post_init__`** runs after the generated `__init__`, which makes it the right place to validate values and to calculate extra attributes. The reason for `default_factory` is the mutable-default trap that you know from functions, and the dataclass refuses to let you fall into it:

```python run error
from dataclasses import dataclass

@dataclass
class Player:
    name: str
    badges: list[str] = []        # one list shared by every player: not allowed
```

A few options of `@dataclass` change what the class can do:

```python run
from dataclasses import dataclass, replace, asdict

@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int = 0

v1 = Version(1, 2)
v2 = Version(1, 10)
print(v1 < v2, max(v1, v2))              # order=True: compares field by field
print(hash(v1) == hash(Version(1, 2)))   # frozen=True: hashable
seen = {v1: "old", v2: "new"}            # so it can be a dictionary key
print(seen[Version(1, 10)])
print(replace(v1, minor=5), asdict(v1))  # a changed copy, and a plain dictionary
try:
    v1.major = 2                         # a frozen object cannot be changed
except AttributeError as error:
    print(type(error).__name__)
```

- **`frozen=True`** makes the objects immutable. Assigning to a field raises `FrozenInstanceError`, which is a kind of `AttributeError`. Frozen objects are hashable, so they can live in sets and be dictionary keys. Use `replace(obj, field=value)` to make a changed copy.
- **`order=True`** adds `<`, `>`, `<=` and `>=`, comparing the fields in the order that you declared them.
- **`slots=True`** stores the fields in a compact way, which saves memory, and it stops code from adding attributes that the class does not declare.
- **`asdict(obj)`** turns an object into a plain dictionary.

%% note A class that names itself
Inside a class body, a hint that refers to the class itself, such as `def moved(self) -> Point:`, fails in Python versions before 3.14, because the name does not exist yet. Write the name in quotes, `-> "Point"`, and every version is happy. Checkers understand the quotes.
%% end

Which tool should you choose for a record? This table gives the usual answer:

| Tool | Can it change? | Has methods? | Best for |
| --- | --- | --- | --- |
| `@dataclass` | yes, unless frozen | yes | records with behaviour and checks |
| `NamedTuple` | no | yes | small, fixed records that behave like tuples |
| `TypedDict` | yes | no | dictionaries with known keys, such as JSON |
| a plain class | yes | yes | full control over everything |

%% question q-factory-predict | predict
What does this program print?

```python
from dataclasses import dataclass, field

@dataclass
class Box:
    items: list[int] = field(default_factory=list)

a = Box()
b = Box()
a.items.append(1)
print(a.items, b.items)
```
%% answer
[1] []
%% explain
The `default_factory` makes a new list for each object, so `a` and `b` have separate lists. Appending to the list of `a` leaves the list of `b` empty.
%% end

%% question q-frozen-predict | predict
What does this program print?

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class P:
    x: int

p = P(1)
try:
    p.x = 2
except AttributeError:
    print("blocked")
print(p.x)
```
%% answer
blocked
1
%% explain
A frozen dataclass refuses every assignment to its fields by raising `FrozenInstanceError`, which is a kind of `AttributeError`, so the `except` line catches it. The value is unchanged, so the last line prints 1.
%% end

%% question q-postinit-fill | fill
Fill in the blank with the name of the method that runs right after the generated `__init__`.

```python
from dataclasses import dataclass

@dataclass
class Temp:
    celsius: float

    def ___(self):
        self.kelvin = self.celsius + 273.15

print(Temp(0).kelvin)
```
%% answer
__post_init__
%% expected
273.15
%% explain
A dataclass calls `__post_init__` at the end of its generated `__init__`, if you define it. It is the place to validate the fields, or to calculate values that depend on them, such as `kelvin` here.
%% end

## Putting it together: a typed order

Here is a small shop with everything from this lesson: dataclasses, `default_factory`, hints on every method, and a result that may be `None`:

```python run
from dataclasses import dataclass, field

@dataclass
class Item:
    name: str
    price: float
    quantity: int = 1

    def total(self) -> float:
        return self.price * self.quantity

@dataclass
class Order:
    customer: str
    items: list[Item] = field(default_factory=list)

    def add(self, item: Item) -> None:
        self.items.append(item)

    def total(self) -> float:
        return sum(item.total() for item in self.items)

    def cheapest(self) -> Item | None:
        return min(self.items, key=lambda item: item.price, default=None)

order = Order("Ada")
order.add(Item("pen", 1.5, 4))
order.add(Item("book", 12.0))
print(order.total())
print(order.cheapest())
print(Order("Ben").cheapest())
```

Read the signatures alone, without the bodies: you can tell what each method needs and what it gives back. That is the value of hints. The dataclass writes the `__init__` and the `__repr__` that print `Item(name='pen', price=1.5, quantity=4)` for free.

## Your turn

%% exercise annotate | Add the hints
Add **type hints** to both functions, using the built-in forms such as `list[float]`. The function `total` takes a list of floats and a tax rate (a float with the default 0.2) and returns a float. The function `find_first_long` takes a list of strings and a minimum length (an int), and returns a string, or `None` when no word is long enough. The program must still print:

```output
36.0
stop
```
%% starter
def total(prices, tax_rate=0.2):
    return round(sum(prices) * (1 + tax_rate), 2)

def find_first_long(words, minimum):
    for word in words:
        if len(word) >= minimum:
            return word
    return None

print(total([10, 20]))
print(find_first_long(["go", "stop", "wait"], 4))
%% solution
def total(prices: list[float], tax_rate: float = 0.2) -> float:
    return round(sum(prices) * (1 + tax_rate), 2)

def find_first_long(words: list[str], minimum: int) -> str | None:
    for word in words:
        if len(word) >= minimum:
            return word
    return None

print(total([10, 20]))
print(find_first_long(["go", "stop", "wait"], 4))
%% tests
expect_output("36.0\nstop")
expect(total.__annotations__, {"prices": list[float], "tax_rate": float, "return": float})
expect(find_first_long.__annotations__, {"words": list[str], "minimum": int, "return": str | None})
expect(total([100], 0.5), 150.0)
expect(find_first_long(["a"], 3), None)
%% hint
A parameter hint goes after a colon: `prices: list[float]`. A default value comes after the hint: `tax_rate: float = 0.2`.
%% hint
The hint for the result goes after an arrow, before the final colon: `def total(...) -> float:`.
%% hint
A result that can be `None` is a union: `str | None`. Use the built-in forms, such as `list[str]`, and not `typing.List`.
%% end

%% exercise student-record | Student record
Write a **dataclass** `Student` with a `name` (a string) and a list of integer `grades`, which is empty by default and is **not** shared between students. In `__post_init__`, raise `ValueError("grade out of range: ...")` with the bad grade, when a grade is not from 0 to 100. Add a method `average()` that returns the mean of the grades **rounded to 1 decimal place**, or `0.0` when there are no grades. The program below must print:

```output
91.7
70.0
0.0
Student(name='Ada', grades=[90, 85, 100])
grade out of range: 101
```
%% starter
from dataclasses import dataclass, field

# Write the dataclass Student here.

ada = Student("Ada", [90, 85, 100])
ben = Student("Ben")
ben.grades.append(70)
print(ada.average())
print(ben.average())
print(Student("Cy").average())
print(ada)
try:
    Student("Dee", [101])
except ValueError as error:
    print(error)
%% solution
from dataclasses import dataclass, field

@dataclass
class Student:
    name: str
    grades: list[int] = field(default_factory=list)

    def __post_init__(self):
        for grade in self.grades:
            if not 0 <= grade <= 100:
                raise ValueError(f"grade out of range: {grade}")

    def average(self) -> float:
        if not self.grades:
            return 0.0
        return round(sum(self.grades) / len(self.grades), 1)

ada = Student("Ada", [90, 85, 100])
ben = Student("Ben")
ben.grades.append(70)
print(ada.average())
print(ben.average())
print(Student("Cy").average())
print(ada)
try:
    Student("Dee", [101])
except ValueError as error:
    print(error)
%% tests
expect_output("91.7\n70.0\n0.0\nStudent(name='Ada', grades=[90, 85, 100])\ngrade out of range: 101")
import dataclasses
check(dataclasses.is_dataclass(Student), "Student must be a dataclass")
first = Student("a")
second = Student("b")
first.grades.append(50)
expect(second.grades, [])
check(raises(ValueError, Student, "x", [10, -1]), "a grade below 0 is refused")
expect(Student("z", [0, 100]).average(), 50.0)
expect(Student("y", [1, 2]).average(), 1.5)
expect([f.name for f in dataclasses.fields(Student)], ["name", "grades"])
%% hint
Start with `@dataclass`, then the fields: `name: str` and `grades: list[int] = field(default_factory=list)`. The factory gives every student a new list.
%% hint
`__post_init__(self)` runs after the generated `__init__`. Loop over `self.grades` there, and raise the `ValueError` for a grade that fails `0 <= grade <= 100`.
%% hint
In `average`, return `0.0` for an empty list first. Otherwise return `round(sum(self.grades) / len(self.grades), 1)`.
%% end

%% exercise frozen-point | Frozen point
Write a **frozen dataclass** `Point` with two float fields, `x` and `y`. Add a method `distance_to(other)` that returns the distance to another point, rounded to 2 decimal places, and a method `moved(dx, dy)` that returns a **new** `Point` (a frozen object cannot be changed). Points that have the same coordinates must be equal, and must work in a set. The program below must print:

```output
5.0
Point(x=4, y=3)
Point(x=3, y=4)
2
frozen
```
%% starter
from dataclasses import dataclass
from math import sqrt

# Write the frozen dataclass Point here.

origin = Point(0, 0)
corner = Point(3, 4)
print(origin.distance_to(corner))
print(corner.moved(1, -1))
print(corner)
visited = {origin, corner, Point(3, 4)}
print(len(visited))
try:
    corner.x = 10
except AttributeError:
    print("frozen")
%% solution
from dataclasses import dataclass
from math import sqrt

@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return round(sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2), 2)

    def moved(self, dx: float, dy: float) -> "Point":
        return Point(self.x + dx, self.y + dy)

origin = Point(0, 0)
corner = Point(3, 4)
print(origin.distance_to(corner))
print(corner.moved(1, -1))
print(corner)
visited = {origin, corner, Point(3, 4)}
print(len(visited))
try:
    corner.x = 10
except AttributeError:
    print("frozen")
%% tests
expect_output("5.0\nPoint(x=4, y=3)\nPoint(x=3, y=4)\n2\nfrozen")
import dataclasses
check(dataclasses.is_dataclass(Point), "Point must be a dataclass")
a = Point(1, 2)
b = Point(1, 2)
expect(a, b)
expect(hash(a), hash(b))
check(raises(AttributeError, setattr, a, "x", 5), "a frozen dataclass cannot be changed")
expect(a.moved(2, 3), Point(3, 5))
expect(a, Point(1, 2))
expect(Point(0, 0).distance_to(Point(1, 1)), 1.41)
expect({a, b, Point(2, 2)}, {Point(1, 2), Point(2, 2)})
%% hint
Write `@dataclass(frozen=True)` above the class, with two fields: `x: float` and `y: float`. The dataclass gives you the equality, the `repr` and the hash.
%% hint
The distance is `sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2)`. Round it with `round(..., 2)`.
%% hint
Because the object is frozen, `moved` must build and return a new one: `return Point(self.x + dx, self.y + dy)`. Inside the class, write the hint as `"Point"` in quotes.
%% end

%% exercise enforce-hints | Challenge: Enforce the hints
Python ignores type hints, so write a decorator that does not. The decorator `enforce` checks the arguments of a call against the hints of the function. For every argument whose parameter has a hint that is a **plain class** (such as `int`, `str` or `float`), check it with `isinstance`. When the type is wrong, raise `TypeError` with the message `<name> must be <type>, got <type>`, for example `times must be int, got str`. Arguments without a hint are not checked, and neither are hints that are not plain classes, such as `list[int]`. The function keeps its name (use `functools.wraps`). The program below must print:

```output
abab
times must be int, got str
Hello, 7
```
%% starter
import inspect
from functools import wraps

def enforce(func):
    # Pair each argument with its name using inspect.signature(func).bind(...),
    # and find its hint in func.__annotations__.
    pass

@enforce
def repeat(text: str, times: int) -> str:
    return text * times

@enforce
def hello(name, count: int = 1) -> str:
    return f"Hello, {name}"

print(repeat("ab", 2))
try:
    repeat("ab", "2")
except TypeError as error:
    print(error)
print(hello(7))
%% solution
import inspect
from functools import wraps

def enforce(func):
    signature = inspect.signature(func)

    @wraps(func)
    def wrapper(*args, **kwargs):
        bound = signature.bind(*args, **kwargs)
        for name, value in bound.arguments.items():
            expected = func.__annotations__.get(name)
            if isinstance(expected, type) and not isinstance(value, expected):
                got = type(value).__name__
                raise TypeError(f"{name} must be {expected.__name__}, got {got}")
        return func(*args, **kwargs)

    return wrapper

@enforce
def repeat(text: str, times: int) -> str:
    return text * times

@enforce
def hello(name, count: int = 1) -> str:
    return f"Hello, {name}"

print(repeat("ab", 2))
try:
    repeat("ab", "2")
except TypeError as error:
    print(error)
print(hello(7))
%% tests
expect_output("abab\ntimes must be int, got str\nHello, 7")
@enforce
def add(a: int, b: int = 0) -> int:
    return a + b
expect(add(1, 2), 3)
expect(add(1), 1)
expect(add(a=4, b=5), 9)
check(raises(TypeError, add, "1", 2), "a str is not an int")
check(raises(TypeError, add, 1, b="x"), "keyword arguments are checked too")
try:
    add(1, 2.5)
except TypeError as error:
    expect(str(error), "b must be int, got float")
@enforce
def label(name: str, tags: list[str], *, strong=False):
    return name + str(len(tags))
expect(label("x", ["a", "b"]), "x2")
expect(label("x", "not a list"), "x10")
check(raises(TypeError, label, 5, []), "name must be a str")
expect(add.__name__, "add")
%% hint
Create `signature = inspect.signature(func)` once, in the decorator. In the wrapper, `signature.bind(*args, **kwargs).arguments` is a dictionary from each parameter name to the value that was passed.
%% hint
`func.__annotations__.get(name)` gives the hint for a name, or `None` when there is none. A plain class passes the test `isinstance(hint, type)`, and `list[int]` does not.
%% hint
When `isinstance(value, hint)` is false, raise `TypeError(f"{name} must be {hint.__name__}, got {type(value).__name__}")`. After the loop, call and return `func(*args, **kwargs)`.
%% end

## What you learned

- A **type hint** is a label: `name: str` for a parameter, `-> int` for a result, and `age: int = 30` for a variable. Python stores the hints in `__annotations__` and **does not enforce them**.
- Hints document the code, help editors, and let checkers such as **mypy** and **pyright** find mistakes without running the program. The checkers run on your own computer.
- Common hints: `list[int]`, `dict[str, int]`, `tuple[int, str]`, `str | None`, `Callable[[int], str]` and `Iterable[int]`. A **type variable** such as `def first[T](items: list[T]) -> T` ties types together.
- The module `typing` adds `Literal`, `Final`, `TypedDict`, `NamedTuple` and `Protocol`. A `TypedDict` is an ordinary dictionary at run time, and a `Protocol` describes behaviour, like duck typing for checkers.
- A program can read the hints: `typing.get_type_hints` and `inspect.signature` (with `bind`) are the tools. They let you write a **run-time** checker, such as a decorator.
- **Dataclasses**: `field(default_factory=list)` gives each object its own list, and `__post_init__` validates after the generated `__init__`. The options `frozen=True` (immutable and hashable), `order=True` (comparisons), and `slots=True` change what the class does. `replace` and `asdict` help to copy and convert.
- Choose `@dataclass` for records with behaviour, `NamedTuple` for small fixed records, `TypedDict` for dictionaries with known keys, and a plain class for full control.
