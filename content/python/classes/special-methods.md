---
title: Special methods and properties
---
Think about how natural the built-in types feel. You write `len(items)`, `a + b`, `a < b`, `x in items` and `print(x)`, and they all work. These are not magic that belongs to Python alone. Each of them calls a **special method** with two underscores on each side, such as `__len__` or `__add__`, and your own classes can have the same methods. When they do, your objects feel like part of the language. This lesson also introduces **properties**, which let an attribute run code when it is read or changed, and two more kinds of method: class methods and static methods.

## Python calls special methods for you

You have already met two special methods: `__init__` and `__str__`. Python calls them for you when you create an object or print it. Many operations work in the same way:

| You write | Python calls |
| --- | --- |
| `Point(1, 2)` | `__init__` |
| `print(x)` or `str(x)` | `x.__str__()` |
| `len(x)` | `x.__len__()` |
| `x == y` | `x.__eq__(y)` |
| `x < y` | `x.__lt__(y)` |
| `x + y` | `x.__add__(y)` |
| `x[i]` | `x.__getitem__(i)` |
| `item in x` | `x.__contains__(item)` |
| `bool(x)` or `if x:` | `x.__bool__()` |

People call them **dunder methods**, short for "double underscore". You hardly ever call them yourself. You define the ones that make sense for your class, and the operators do the rest.

## Equality: __eq__

By default, `==` on two objects asks whether they are the very same object. For a `Point`, you want two points with the same coordinates to be equal, so you define `__eq__`:

```python run
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y

a = Point(1, 2)
b = Point(1, 2)
print(a == b, a is b)
print(a != Point(3, 4))
print(a == 5)
```

Python gives you `!=` for free, as the opposite of `==`. The line with `isinstance` protects the method from comparisons with other types, such as `a == 5`. Returning `NotImplemented` (it is not an exception) means "I do not know how to compare with that", and Python then tries the other side and finally answers `False`.

There is one trap. When a class defines `__eq__`, Python stops treating its objects as **hashable**, because two equal objects must have the same hash. That means they cannot be put in a set or used as dictionary keys until you also define `__hash__`, using the same attributes as `__eq__`:

```python run
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))

visited = {Point(1, 2), Point(1, 2), Point(3, 4)}
print(len(visited))
```

The set holds two points, because the first two are equal.

%% question q-eq-predict | predict
What does this program print?

```python
class Money:
    def __init__(self, cents):
        self.cents = cents

    def __eq__(self, other):
        return self.cents == other.cents

print(Money(250) == Money(250), Money(250) == Money(300))
```
%% answer
True False
%% explain
The method compares the attribute `cents` of the two objects. 250 equals 250, so the first comparison is `True`, and 250 is not 300, so the second is `False`.
%% end

## Ordering: __lt__

If your class has `__lt__` ("less than"), then `<` works, and so do `sorted`, `min` and `max`, because they only need to ask which of two objects comes first. The method can compare tuples, which compare their items from left to right:

```python run
class Version:
    def __init__(self, major, minor):
        self.major = major
        self.minor = minor

    def __lt__(self, other):
        return (self.major, self.minor) < (other.major, other.minor)

    def __str__(self):
        return f"{self.major}.{self.minor}"

versions = [Version(2, 1), Version(1, 9), Version(2, 0)]
for v in sorted(versions):
    print(v)
print(Version(1, 2) < Version(1, 10))
print(max(versions))
```

Python can turn `a > b` into `b < a`, so one method is enough for `<` and `>`. It does not do the same for `<=` and `>=`. The standard library has a shortcut, a **decorator** called `total_ordering`, which writes the missing comparisons if you define `__eq__` and one of the others. Here is a first look, because decorators are explained in module 14:

```python preview run
from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, major, minor):
        self.major = major
        self.minor = minor

    def __eq__(self, other):
        return (self.major, self.minor) == (other.major, other.minor)

    def __lt__(self, other):
        return (self.major, self.minor) < (other.major, other.minor)

print(Version(1, 2) <= Version(1, 2), Version(2, 0) >= Version(1, 5))
```

## Behaving like a collection

Three methods make an object act like a sequence. `__len__` answers `len(x)`, `__getitem__` answers `x[i]`, and `__contains__` answers `item in x`. With `__getitem__` in place, a `for` loop and slicing work too:

```python run
class Playlist:
    def __init__(self, name):
        self.name = name
        self.songs = []

    def add(self, song):
        self.songs.append(song)

    def __len__(self):
        return len(self.songs)

    def __getitem__(self, index):
        return self.songs[index]

    def __contains__(self, song):
        return song in self.songs

mix = Playlist("Road trip")
mix.add("Song A")
mix.add("Song B")
mix.add("Song C")
print(len(mix))
print(mix[0], mix[-1])
print(mix[0:2])
print("Song B" in mix, "Song Z" in mix)
for song in mix:
    print("-", song)
```

A `__getitem__` that passes its argument to a list gets negative positions and slices for free. The method `__bool__` decides what `if obj:` means. When a class has no `__bool__` but has `__len__`, an object with length 0 counts as false, exactly like an empty list:

```python run
class Playlist:
    def __init__(self):
        self.songs = []

    def __len__(self):
        return len(self.songs)

class Wallet:
    def __init__(self, money):
        self.money = money

    def __bool__(self):
        return self.money > 0

mix = Playlist()
print(bool(mix))
mix.songs.append("Song A")
print(bool(mix))
print(bool(Wallet(0)), bool(Wallet(5)))
```

%% question q-len-choice | choice
Which special method does `len(x)` call?
%% choice
`__size__`
%% choice correct
`__len__`
%% choice
`__length__`
%% choice
`__count__`
%% explain
`len(x)` calls `x.__len__()`. A class that defines `__len__` can be measured with `len`, and it also becomes false when its length is 0.
%% end

## Arithmetic: __add__ and friends

Operators work the same way. `a + b` calls `a.__add__(b)`, `a - b` calls `__sub__`, and `a * b` calls `__mul__`. The methods should **return a new object** and leave the two operands as they were, as `"ab" + "cd"` does for strings:

```python run
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, factor):
        return Vector(self.x * factor, self.y * factor)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

a = Vector(1, 2)
b = Vector(3, 4)
print(a + b)
print(b - a)
print(a * 3)
print(a + b == Vector(4, 6))
```

The call `a * 3` works, but `3 * a` does not, because Python first asks the number `3`, and it does not know about vectors. A method `__rmul__` handles that order.

%% question q-vector-predict | predict
What does this program print?

```python
class V:
    def __init__(self, n):
        self.n = n

    def __add__(self, other):
        return V(self.n + other.n)

a = V(2)
b = V(5)
c = a + b
print(a.n, b.n, c.n)
```
%% answer
2 5 7
%% explain
`a + b` calls `a.__add__(b)`, which builds a new `V` with `n` equal to 7. The two operands are not changed, so `a.n` is still 2 and `b.n` is still 5.
%% end

## Properties

Sometimes a value should look like an attribute but be **calculated** when it is read. A **property** is a method that you read without brackets. It is created with the decorator `@property`:

```python run
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def fahrenheit(self):
        return self.celsius * 9 / 5 + 32

t = Temperature(100)
print(t.fahrenheit)
t.celsius = 0
print(t.fahrenheit)
```

The value is never stored, so it cannot go out of date: it is worked out from `celsius` every time. A property with no setter is **read-only**, and an attempt to assign to it gives an `AttributeError`.

A property can also guard an attribute. A **setter**, marked with `@name.setter`, runs whenever someone assigns to the attribute, which is the right place to check the value. The value is stored in a second attribute whose name starts with an underscore:

```python run
class Account:
    def __init__(self, balance):
        self.balance = balance

    @property
    def balance(self):
        return self._balance

    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("balance cannot be negative")
        self._balance = value

acc = Account(50)
acc.balance = 80
print(acc.balance)

try:
    acc.balance = -5
except ValueError as e:
    print("Error:", e)
print(acc.balance)

try:
    Account(-1)
except ValueError as e:
    print("Error:", e)
```

Outside the class, `acc.balance` looks and feels like an ordinary attribute. Inside `__init__`, the line `self.balance = balance` already goes through the setter, so a wrong starting value is refused as well. The raised `ValueError` is the same kind of exception that you learned to raise in module 9.

%% question q-property-multi | multi
Select every true statement about `@property`.
%% choice correct
A property is read without brackets: `t.fahrenheit`.
%% choice correct
A property without a setter is read-only.
%% choice
A property must store its value in an attribute with the same name.
%% choice correct
A setter can check a new value and raise an exception.
%% explain
A property is a method that is used like an attribute. It can calculate its answer on every read, and a setter can validate the new value. The stored value, if there is one, needs a different name, such as `_balance`, otherwise the property would call itself forever.
%% end

## Class methods and static methods

So far every method started with `self`. Two other kinds exist.

A **class method** receives the **class** instead of an object, and by convention the parameter is called `cls`. Its best use is an **alternative constructor**: another way to create an object, for example from a text:

```python run
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, text):
        year, month, day = text.split("-")
        return cls(int(year), int(month), int(day))

    def __str__(self):
        return f"{self.day}/{self.month}/{self.year}"

launch = Date.from_string("2026-11-02")
print(launch)
print(launch.month)
```

A **static method** gets neither the object nor the class. It is an ordinary function that lives inside the class because it belongs to the topic. It is called through the class, or through an object:

```python run
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, fahrenheit):
        return cls((fahrenheit - 32) * 5 / 9)

    @staticmethod
    def is_valid(celsius):
        return celsius >= -273.15

    def __str__(self):
        return f"{self.celsius:.1f} C"

body = Temperature.from_fahrenheit(98.6)
print(body)
print(Temperature.is_valid(-300), Temperature.is_valid(20))
```

| Kind | First parameter | Use it for |
| --- | --- | --- |
| instance method | `self`, the object | work that needs the data of one object |
| `@classmethod` | `cls`, the class | alternative constructors, and data of the whole class |
| `@staticmethod` | nothing | a helper that belongs to the class but needs no data |

%% question q-classmethod-fill | fill
Fill in the blank with the name of the decorator so that the program prints `1`.

```python
class Circle:
    def __init__(self, radius):
        self.radius = radius

    @___
    def unit(cls):
        return cls(1)

print(Circle.unit().radius)
```
%% answer
classmethod
%% expected
1
%% explain
The first parameter is `cls`, which receives the class, so the decorator is `@classmethod`. `cls(1)` creates a `Circle` with radius 1, and the method is called on the class itself, as `Circle.unit()`.
%% end

## Names with underscores

Python has no real "private" attributes. Instead, programmers agree on conventions. A name that starts with **one underscore**, such as `_code`, means "this is internal, please do not use it from outside". Nothing stops you, but you were warned. A name that starts with **two underscores**, such as `__secret`, is stored by Python under a longer name, `_Safe__secret`, which avoids accidental clashes between a class and its subclasses. This is called **name mangling**:

```python run
class Safe:
    def __init__(self, code):
        self._code = code
        self.__secret = "gold"

    def open(self, attempt):
        return self.__secret if attempt == self._code else "locked"

s = Safe(1234)
print(s.open(1234), s.open(1))
print(s._code)
print(s._Safe__secret)
try:
    print(s.__secret)
except AttributeError as e:
    print("Error:", e)
```

Mangling is not a security feature, as the third `print` shows. Use the single underscore for "internal", and a property when you want control over reading and writing.

## A project: durations

A video player adds up the lengths of clips, and shows them as `HH:MM`. The class below stores minutes. It gets its value from text with a class method, adds with `+`, compares with `<` and `==`, and prints itself. A property gives the hours:

```python run stdin="01:45\n02:30\n00:20\ndone"
class Duration:
    def __init__(self, minutes):
        self.minutes = minutes

    @classmethod
    def from_string(cls, text):
        hours, minutes = text.split(":")
        return cls(int(hours) * 60 + int(minutes))

    @property
    def hours(self):
        return self.minutes // 60

    def __add__(self, other):
        return Duration(self.minutes + other.minutes)

    def __eq__(self, other):
        return self.minutes == other.minutes

    def __lt__(self, other):
        return self.minutes < other.minutes

    def __str__(self):
        hh = str(self.minutes // 60).zfill(2)
        mm = str(self.minutes % 60).zfill(2)
        return f"{hh}:{mm}"

total = Duration(0)
clips = []
while True:
    line = input()
    if line == "done":
        break
    clip = Duration.from_string(line)
    clips.append(clip)
    total = total + clip

print("Total:", total)
print("Whole hours:", total.hours)
print("Longest:", max(clips))
for clip in sorted(clips):
    print(clip)
```

Notice how short the main program has become. It reads like a description of the task, because the details live in the class.

%% question q-order-property | order
Put the lines in order so that the program prints `9`. One line does not belong.
%% lines
class Square:
    def __init__(self, side):
        self.side = side
    @property
    def area(self):
        return self.side ** 2
print(Square(3).area)
%% distractors
    @staticmethod
%% expected
9
%% explain
The decorator `@property` goes directly above the method `area`, so that `Square(3).area` is read without brackets. A static method would not receive `self`, and the line would fail.
%% end

## Your turn

%% exercise version-compare | Versions in order
Define a class `Version` with a major and a minor number, a `__str__` that gives `major.minor`, an `__eq__`, and an `__lt__` that compares the major number first and then the minor number. Read the versions on one line, written like `2.1 1.9 2.0`. Print them in ascending order, one per line, and then the newest on a line that starts with `Newest:`. For the input `2.1 1.9 2.0` the program prints:

```output
1.9
2.0
2.1
Newest: 2.1
```
%% stdin
2.1 1.9 2.0
%% starter
# Define the class Version with __str__, __eq__ and __lt__.

%% solution
class Version:
    def __init__(self, major, minor):
        self.major = major
        self.minor = minor

    def __eq__(self, other):
        return (self.major, self.minor) == (other.major, other.minor)

    def __lt__(self, other):
        return (self.major, self.minor) < (other.major, other.minor)

    def __str__(self):
        return f"{self.major}.{self.minor}"

versions = []
for text in input().split():
    major, minor = text.split(".")
    versions.append(Version(int(major), int(minor)))

for v in sorted(versions):
    print(v)
print("Newest:", max(versions))
%% tests
expect_output("1.9\n2.0\n2.1\nNewest: 2.1")
check(defines("Version"), "defines a class called Version")
check(Version(1, 2) < Version(1, 10), "1.2 is before 1.10")
check(not (Version(2, 0) < Version(1, 9)), "2.0 is not before 1.9")
check(Version(1, 2) == Version(1, 2), "equal versions")
check(not (Version(1, 2) == Version(1, 3)), "different versions")
expect(str(Version(3, 14)), "3.14", "str(version)")
check(rerun("1.10 1.2 1.9").strip() == "1.2\n1.9\n1.10\nNewest: 1.10", "minor numbers compare as numbers")
%% hint
Store the two numbers as integers, not as text, so that 10 is larger than 9.
%% hint
Compare the tuples: `(self.major, self.minor) < (other.major, other.minor)`.
%% hint
Once `__lt__` exists, `sorted(versions)` and `max(versions)` work. Split each word at the dot with `text.split(".")`.
%% end

%% exercise playlist-class | A playlist that acts like a list
Define a class `Playlist` that keeps songs in a list, and supports `len(playlist)`, `playlist[i]` and `song in playlist`, with the special methods `__len__`, `__getitem__` and `__contains__`. Read song titles, one per line, until `done`, and then one more line with a title to look for. Print the number of songs, the first song, the last song, and whether the title was found. For the input below the program prints:

```output
Songs: 3
First: Blue
Last: Green
Found: True
```
%% stdin
Blue
Red
Green
done
Red
%% starter
# Define the class Playlist with __len__, __getitem__ and __contains__.

%% solution
class Playlist:
    def __init__(self):
        self.songs = []

    def add(self, song):
        self.songs.append(song)

    def __len__(self):
        return len(self.songs)

    def __getitem__(self, index):
        return self.songs[index]

    def __contains__(self, song):
        return song in self.songs

playlist = Playlist()
while True:
    line = input()
    if line == "done":
        break
    playlist.add(line)
wanted = input()
print("Songs:", len(playlist))
print("First:", playlist[0])
print("Last:", playlist[-1])
print("Found:", wanted in playlist)
%% tests
expect_output("Songs: 3\nFirst: Blue\nLast: Green\nFound: True")
check(defines("Playlist"), "defines a class called Playlist")
p = Playlist()
expect(len(p), 0, "an empty playlist")
p.add("A")
p.add("B")
expect(len(p), 2, "two songs")
expect(p[0], "A", "the first song")
expect(p[-1], "B", "the last song")
check("B" in p and "Z" not in p, "the in operator")
check(rerun("Solo\ndone\nNope").strip() == "Songs: 1\nFirst: Solo\nLast: Solo\nFound: False", "one song, not found")
%% hint
Keep the songs in a list inside the object, and add a method `add(song)`.
%% hint
Each special method passes the work to the list: `len(self.songs)`, `self.songs[index]` and `song in self.songs`.
%% hint
In the main part, read lines in a loop until `done`, then read the title to look for with one more `input()`.
%% end

%% exercise vector-class | Adding vectors
Define a class `Vector` with `x` and `y`, and the special methods `__add__`, `__mul__` (a vector times a number), `__eq__` and `__str__`, which gives `(x, y)`. Read two vectors, each as a line `x y`, and print their sum, then the first one times 3, then `True` or `False` for whether the two vectors are equal. For the input `1 2` and `3 4` the program prints:

```output
(4, 6)
(3, 6)
False
```
%% stdin
1 2
3 4
%% starter
# Define the class Vector with __add__, __mul__, __eq__ and __str__.

%% solution
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, factor):
        return Vector(self.x * factor, self.y * factor)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __str__(self):
        return f"({self.x}, {self.y})"

x1, y1 = input().split()
x2, y2 = input().split()
a = Vector(int(x1), int(y1))
b = Vector(int(x2), int(y2))
print(a + b)
print(a * 3)
print(a == b)
%% tests
expect_output("(4, 6)\n(3, 6)\nFalse")
check(defines("Vector"), "defines a class called Vector")
a = Vector(1, 1)
b = Vector(2, 3)
c = a + b
expect(str(c), "(3, 4)", "the sum")
expect(str(a), "(1, 1)", "the operands are not changed")
expect(str(b * 2), "(4, 6)", "a vector times a number")
check(Vector(5, 5) == Vector(5, 5), "equal vectors")
check(rerun("2 2\n2 2").strip() == "(4, 4)\n(6, 6)\nTrue", "equal inputs")
%% hint
`__add__` and `__mul__` must **return a new** `Vector`, and leave `self` unchanged.
%% hint
`__add__` returns `Vector(self.x + other.x, self.y + other.y)`. In `__mul__`, the second argument is a number: `Vector(self.x * factor, self.y * factor)`.
%% hint
`__eq__` compares both coordinates: `self.x == other.x and self.y == other.y`. `__str__` returns the text with brackets, and does not print it.
%% end

%% exercise safe-celsius | A safe temperature
Define a class `Temperature` with a property `celsius`. Its setter raises a `ValueError` with the message `below absolute zero` when the value is lower than -273.15. Add a read-only property `fahrenheit`, which is `celsius * 9 / 5 + 32`. Read a temperature in Celsius, create the object, and print its Fahrenheit value. When the value is refused, print `Error:` and the message. For the input `100` the program prints:

```output
212.0
```
%% stdin
100
%% starter
# Define the class Temperature with two properties.

%% solution
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("below absolute zero")
        self._celsius = value

    @property
    def fahrenheit(self):
        return self.celsius * 9 / 5 + 32

try:
    t = Temperature(float(input()))
    print(t.fahrenheit)
except ValueError as e:
    print("Error:", e)
%% tests
expect_output("212.0")
check(defines("Temperature"), "defines a class called Temperature")
t2 = Temperature(0)
expect(t2.fahrenheit, 32, "0 degrees Celsius")
t2.celsius = 37
expect(t2.celsius, 37, "the setter stores the value")
expect(t2.fahrenheit, 98.6, "37 degrees Celsius", approx=0.001)
check(raises(ValueError, setattr, t2, "celsius", -300), "a value below absolute zero is refused by the setter")
expect(t2.celsius, 37, "a refused value leaves the old one")
check(raises(ValueError, Temperature, -500), "the constructor refuses it too")
check(raises(AttributeError, setattr, t2, "fahrenheit", 50), "fahrenheit is read-only")
check(rerun("-400").strip() == "Error: below absolute zero", "the program shows the error")
%% hint
Store the value in `self._celsius`, and write a getter and a setter for the property `celsius`.
%% hint
The setter is decorated with `@celsius.setter`, it checks `value < -273.15`, and it raises the `ValueError` before it stores anything. In `__init__`, assign `self.celsius = celsius`, so that the setter runs.
%% hint
`fahrenheit` is a property with only a getter. In the main part, put the creation of the object inside `try`, and print `"Error:", e` in `except ValueError as e:`.
%% end

%% exercise duration-class | Challenge: Durations
Write the class `Duration` of the project. It stores `minutes`, and it has a class method `from_string("HH:MM")`, a property `hours` (whole hours), `__add__`, `__eq__`, `__lt__` and a `__str__` that gives `HH:MM` with two digits each. Read durations until `done`. Print the total and the longest duration, in the form below. For the input `01:45`, `02:30`, `00:20` and `done` the program prints:

```output
Total: 04:35
Longest: 02:30
```
%% stdin
01:45
02:30
00:20
done
%% starter
# Define the class Duration, then read the durations.

%% solution
class Duration:
    def __init__(self, minutes):
        self.minutes = minutes

    @classmethod
    def from_string(cls, text):
        hours, minutes = text.split(":")
        return cls(int(hours) * 60 + int(minutes))

    @property
    def hours(self):
        return self.minutes // 60

    def __add__(self, other):
        return Duration(self.minutes + other.minutes)

    def __eq__(self, other):
        return self.minutes == other.minutes

    def __lt__(self, other):
        return self.minutes < other.minutes

    def __str__(self):
        hh = str(self.minutes // 60).zfill(2)
        mm = str(self.minutes % 60).zfill(2)
        return f"{hh}:{mm}"

total = Duration(0)
longest = Duration(0)
while True:
    line = input()
    if line == "done":
        break
    clip = Duration.from_string(line)
    total = total + clip
    if longest < clip:
        longest = clip
print("Total:", total)
print("Longest:", longest)
%% tests
expect_output("Total: 04:35\nLongest: 02:30")
check(defines("Duration"), "defines a class called Duration")
d = Duration.from_string("01:30")
expect(d.minutes, 90, "from_string gives minutes")
expect(d.hours, 1, "the property hours")
expect(str(Duration(125)), "02:05", "two digits for each part")
expect(str(Duration(5)), "00:05", "less than an hour")
expect(str(Duration(60) + Duration(45)), "01:45", "adding")
check(Duration(30) < Duration(31) and not (Duration(31) < Duration(30)), "ordering")
check(Duration(90) == Duration.from_string("01:30"), "equality")
check(rerun("00:59\n00:02\ndone").strip() == "Total: 01:01\nLongest: 00:59", "another run")
check(rerun("done").strip() == "Total: 00:00\nLongest: 00:00", "no clips")
%% hint
Store everything as minutes. `from_string` splits at the colon and returns `cls(hours * 60 + minutes)`.
%% hint
`__str__` needs two digits: `str(self.minutes // 60).zfill(2)` for the hours, and the remainder `self.minutes % 60` for the minutes.
%% hint
Keep `total` and `longest` as `Duration` objects, starting from `Duration(0)`. Add with `total + clip`, and compare with `longest < clip`.
%% end

## What you learned

- Special methods (dunder methods) are called by Python for operators and built-in functions: `__len__` for `len`, `__eq__` for `==`, `__lt__` for `<`, `__add__` for `+`, `__getitem__` for `[ ]`, `__contains__` for `in`, `__bool__` for truth tests.
- Define `__eq__` to compare by value, and add `__hash__` too if objects must go in sets or be dictionary keys. Return `NotImplemented` for types that you do not understand.
- With `__lt__`, the built-in `sorted`, `min` and `max` work on your objects. `functools.total_ordering` writes the missing comparisons.
- With `__len__`, `__getitem__` and `__contains__`, an object acts like a sequence, and loops and slices work.
- Operators such as `+` and `*` should return **new** objects and leave the operands unchanged.
- `@property` turns a method into an attribute that is calculated when it is read. A `@name.setter` validates a new value, and a property without a setter is read-only.
- A `@classmethod` receives `cls` and makes alternative constructors (`Date.from_string(...)`). A `@staticmethod` is a plain function inside the class.
- `_name` means internal by convention. `__name` is mangled to `_Class__name`. Neither makes anything truly private.
