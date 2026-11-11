---
title: Robot Arena
engine: judge
---
The **Robot League** needs a programmer. Its robots are built from classes, and you will write them: a first robot, then energy, fights, scoreboards, rankings, batteries and a robot factory. In the last level, your classes run a whole tournament.

How to play:

- Press **Run**. The result panel lists every test. A red test shows what was expected and what your code gave, or the error that stopped it, together with the line of your code.
- Some tests are **hidden**. They check the edge cases, so build the class to follow the rules in the briefing, and do not only fit the visible examples.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Meet Bolt
Every robot in the league needs a record. Write a class `Robot`:

- `__init__` takes a `name` and stores it as `self.name`.
- Every new robot starts with `self.health` set to `100`.
- The method `status()` **returns** (it does not print) the text `Bolt (100 HP)` for a robot called Bolt, and `Ada (40 HP)` for a robot called Ada with 40 health.
%% config
mode: script
function: Robot
par: 6
%% test A robot has a name
bolt = Robot("Bolt")
expect(bolt.name, "Bolt")
%% test Full health
expect(Robot("Bolt").health, 100)
%% test The status text
expect(Robot("Bolt").status(), "Bolt (100 HP)")
%% test hidden Robots are independent
a = Robot("Ada")
b = Robot("Bit")
a.health = 40
expect(b.health, 100)
expect(a.status(), "Ada (40 HP)")
expect(b.name, "Bit")
%% test hidden The status is returned, not printed
check(printed(Robot("Z").status) == "", "status() should return the text, not print it")
%% starter
class Robot:
    # Write __init__ and status here.
    pass

%% solution
class Robot:
    def __init__(self, name):
        self.name = name
        self.health = 100

    def status(self):
        return f"{self.name} ({self.health} HP)"
%% hint
A class starts with `class Robot:`. Its first method is `def __init__(self, name):`, and the method body is indented one more step.
%% hint
Inside `__init__`, store the values with `self.name = name` and `self.health = 100`.
%% hint
`status` returns an f-string: `f"{self.name} ({self.health} HP)"`. Use `return`, not `print`.
%% end

%% level l2 | Power cells
Robots run on energy. Add it to the class:

- A new robot starts with `energy` set to `10`.
- `charge(amount)` adds energy, but a robot can hold **at most 20**. It returns the new energy.
- `use(amount)` spends energy. When the robot has enough, it subtracts the amount and returns `True`. When it does not have enough, **nothing changes** and it returns `False`.
%% config
mode: script
function: Robot
par: 13
%% test A new robot has energy
expect(Robot("Bolt").energy, 10)
%% test Charging
r = Robot("Bolt")
expect(r.charge(5), 15)
expect(r.energy, 15)
%% test Spending energy
r = Robot("Bolt")
expect(r.use(4), True)
expect(r.energy, 6)
%% test Not enough energy
r = Robot("Bolt")
expect(r.use(11), False)
expect(r.energy, 10, "a failed use must not change the energy")
%% test hidden The battery limit
r = Robot("Bolt")
expect(r.charge(50), 20)
expect(r.energy, 20)
%% test hidden Spending everything
r = Robot("Bolt")
expect(r.use(10), True)
expect(r.energy, 0)
expect(r.use(1), False)
%% starter
class Robot:
    def __init__(self, name):
        self.name = name
        self.health = 100

    # Add energy, charge() and use() here.

%% solution
class Robot:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.energy = 10

    def charge(self, amount):
        self.energy = min(20, self.energy + amount)
        return self.energy

    def use(self, amount):
        if amount > self.energy:
            return False
        self.energy -= amount
        return True
%% hint
Add `self.energy = 10` to `__init__`. Then write the two methods, each with `self` first.
%% hint
`charge` can use `min`: the new energy is the smaller of 20 and `self.energy + amount`. Store it, and return it.
%% hint
`use` first checks `amount > self.energy`. In that case return `False` before changing anything. Otherwise subtract and return `True`.
%% end

%% level l3 | First strike
Time to fight. Change `Robot` so that:

- `Robot(name, power=10)` takes a `power`, the damage of one attack, and stores it as `self.power`.
- `attack(target)` takes `power` health away from the **target** robot. Health never goes below `0`.
- `is_alive()` returns `True` while the health is above `0`.
%% config
mode: script
function: Robot
par: 9
%% test A default attack
a = Robot("Ada")
b = Robot("Bit")
a.attack(b)
expect(b.health, 90)
expect(a.health, 100, "the attacker is not hurt")
%% test A strong robot
a = Robot("Ada", 35)
b = Robot("Bit")
a.attack(b)
a.attack(b)
expect(b.health, 30)
%% test Alive or not
b = Robot("Bit")
check(b.is_alive(), "a new robot is alive")
b.health = 0
check(not b.is_alive(), "a robot with 0 health is not alive")
%% test hidden Health never goes below zero
a = Robot("Ada", 60)
b = Robot("Bit")
a.attack(b)
a.attack(b)
expect(b.health, 0)
check(not b.is_alive(), "two strong attacks defeat Bit")
%% test hidden Two attackers
a = Robot("Ada", 30)
b = Robot("Bit", 25)
c = Robot("Cog")
a.attack(c)
b.attack(c)
expect(c.health, 45)
expect(a.health, 100)
expect(b.health, 100)
%% starter
class Robot:
    def __init__(self, name):
        self.name = name
        self.health = 100

    # Add power, attack() and is_alive() here.

%% solution
class Robot:
    def __init__(self, name, power=10):
        self.name = name
        self.power = power
        self.health = 100

    def attack(self, target):
        target.health = max(0, target.health - self.power)

    def is_alive(self):
        return self.health > 0
%% hint
Give `__init__` a second parameter with a default value, `power=10`, and store it with `self.power = power`.
%% hint
In `attack`, the thing that changes is `target.health`, not `self.health`.
%% hint
Use `max(0, ...)` to stop the health at zero: `target.health = max(0, target.health - self.power)`. `is_alive` returns `self.health > 0`.
%% end

%% level l4 | Name tags
The crowd wants to read the scoreboard, but `print(robot)` shows a memory address. Add the two special methods:

- `__str__` returns the text for people: `Bolt: 80 HP`
- `__repr__` returns the text for programmers, which looks like the code that makes the robot: `Robot('Bolt', 80)`

Both methods **return** a string. They never print.
%% config
mode: script
function: Robot
par: 8
%% test str gives the friendly text
expect(str(Robot("Bolt", 80)), "Bolt: 80 HP")
%% test repr gives the code-like text
expect(repr(Robot("Bolt", 80)), "Robot('Bolt', 80)")
%% test A robot with full health
expect(str(Robot("Rusty")), "Rusty: 100 HP")
%% test hidden Lists show the repr
team = [Robot("A", 1), Robot("B", 2)]
expect(str(team), "[Robot('A', 1), Robot('B', 2)]")
%% test hidden print and f-strings use str
r = Robot("Zed", 7)
expect(f"{r}", "Zed: 7 HP")
check(printed(print, r) == "Zed: 7 HP\n", "print(r) should show Zed: 7 HP")
%% starter
class Robot:
    def __init__(self, name, health=100):
        self.name = name
        self.health = health

    # Add __str__ and __repr__ here.

%% solution
class Robot:
    def __init__(self, name, health=100):
        self.name = name
        self.health = health

    def __str__(self):
        return f"{self.name}: {self.health} HP"

    def __repr__(self):
        return f"Robot('{self.name}', {self.health})"
%% hint
The two methods are called `__str__` and `__repr__`, and each one takes only `self`.
%% hint
`__str__` returns `f"{self.name}: {self.health} HP"`.
%% hint
`__repr__` returns an f-string that spells out the call, with quotes around the name: `f"Robot('{self.name}', {self.health})"`.
%% end

%% level l5 | League table
The league ranks its robots by health. Give `Robot(name, health)` two special methods:

- `__eq__`: two robots are equal when they have the **same name and the same health**. Comparing a robot with something that is not a robot, such as `robot == "Bolt"`, must give `False` and must not crash.
- `__lt__`: a robot is less than another robot when its health is **lower**.

Then `sorted`, `min` and `max` work on lists of robots.
%% config
mode: script
function: Robot
par: 10
%% test Equal robots
expect(Robot("Bolt", 50) == Robot("Bolt", 50), True)
%% test Different robots
expect(Robot("Bolt", 50) == Robot("Bolt", 60), False)
expect(Robot("Bolt", 50) == Robot("Rusty", 50), False)
%% test Less than
expect(Robot("A", 10) < Robot("B", 20), True)
expect(Robot("A", 30) < Robot("B", 20), False)
%% test Sorting
robots = [Robot("A", 30), Robot("B", 10), Robot("C", 20)]
names = []
for r in sorted(robots):
    names.append(r.name)
expect(names, ["B", "C", "A"])
%% test hidden The strongest and the weakest
robots = [Robot("A", 30), Robot("B", 90), Robot("C", 20)]
expect(max(robots).name, "B")
expect(min(robots).name, "C")
%% test hidden A robot is not a text
check(Robot("A", 1) != "A", "a robot is not equal to a text")
check(not (Robot("A", 1) == 1), "a robot is not equal to a number")
%% starter
class Robot:
    def __init__(self, name, health):
        self.name = name
        self.health = health

    # Add __eq__ and __lt__ here.

%% solution
class Robot:
    def __init__(self, name, health):
        self.name = name
        self.health = health

    def __eq__(self, other):
        if not isinstance(other, Robot):
            return NotImplemented
        return self.name == other.name and self.health == other.health

    def __lt__(self, other):
        return self.health < other.health
%% hint
Python calls `__eq__(self, other)` for `==` and `__lt__(self, other)` for `<`. Both return `True` or `False`.
%% hint
For `__lt__`, compare the health values: `self.health < other.health`.
%% hint
In `__eq__`, start with `if not isinstance(other, Robot): return NotImplemented`. Then compare both the names and the health values.
%% end

%% level l6 | Battery pack
A robot battery must never hold a charge that is impossible. Write the class `Battery`, which is created with a charge, as in `Battery(80)`.

- `charge` is a **property** with a setter. A value below `0` or above `100` raises a `ValueError`, and the old charge stays. The check also applies when the battery is created.
- `state` is a **read-only property**: `"empty"` when the charge is `0`, `"full"` when it is `100`, and `"ok"` for anything between.

Store the real value in `self._charge`.
%% config
mode: script
function: Battery
par: 18
require: decorator
%% test A normal charge
b = Battery(80)
expect(b.charge, 80)
%% test Setting a new charge
b = Battery(80)
b.charge = 30
expect(b.charge, 30)
%% test Too much charge
b = Battery(50)
check(raises(ValueError, setattr, b, "charge", 101), "101 is too much")
expect(b.charge, 50, "a refused value must not be stored")
%% test The state
expect(Battery(0).state, "empty")
expect(Battery(100).state, "full")
expect(Battery(55).state, "ok")
%% test hidden Negative charge
check(raises(ValueError, Battery, -1), "a new battery cannot start with a negative charge")
b = Battery(5)
check(raises(ValueError, setattr, b, "charge", -5), "-5 is refused")
%% test hidden The state is read-only
b = Battery(10)
check(raises(AttributeError, setattr, b, "state", "full"), "state cannot be assigned")
expect(b.state, "ok")
%% test hidden The edges are allowed
b = Battery(0)
b.charge = 100
expect(b.state, "full")
b.charge = 0
expect(b.state, "empty")
%% starter
class Battery:
    def __init__(self, charge):
        self.charge = charge

    # Turn charge into a property with a setter.
    # Then add the read-only property state.

%% solution
class Battery:
    def __init__(self, charge):
        self.charge = charge

    @property
    def charge(self):
        return self._charge

    @charge.setter
    def charge(self, value):
        if value < 0 or value > 100:
            raise ValueError("charge must be between 0 and 100")
        self._charge = value

    @property
    def state(self):
        if self.charge == 0:
            return "empty"
        if self.charge == 100:
            return "full"
        return "ok"
%% hint
Keep `self.charge = charge` in `__init__`. When `charge` is a property, that line calls the setter, so the check also runs for a new battery.
%% hint
Write `@property def charge(self): return self._charge`, then `@charge.setter def charge(self, value):` with the check, and store the value in `self._charge`.
%% hint
The setter raises `ValueError` when `value < 0 or value > 100`, before it stores anything. `state` is a second `@property` with no setter, so assigning to it fails by itself.
%% end

%% level l7 | Factory line
The factory builds robots from text orders such as `Bolt:80` (a name, a colon and a health). Extend `Robot(name, health=100)`:

- A **class attribute** `built` counts the robots that were made. It starts at `0`, and every new robot adds `1`.
- A **class method** `from_text(text)` turns an order into a robot, with the health as a whole number. Build the robot with `cls(...)`.
- A **static method** `valid_name(name)` returns `True` when the name is made of letters only. An empty name is not valid.
%% config
mode: script
function: Robot
par: 13
%% test From text
r = Robot.from_text("Bolt:80")
expect(r.name, "Bolt")
expect(r.health, 80)
check(type(r) is Robot, "from_text should return a Robot")
%% test The health is a number
expect(Robot.from_text("Rusty:55").health + 1, 56)
%% test Counting robots
before = Robot.built
Robot("A")
Robot.from_text("B:10")
expect(Robot.built, before + 2)
%% test Valid names
check(Robot.valid_name("Bolt"), "Bolt is valid")
check(not Robot.valid_name("R2D2"), "digits are not allowed")
check(not Robot.valid_name(""), "an empty name is not valid")
%% test hidden The counter is shared
a = Robot("A")
b = Robot("B")
expect(a.built, b.built)
before = Robot.built
Robot("C")
expect(a.built, before + 1)
%% test hidden A name check builds nothing
before = Robot.built
check(Robot.valid_name("Zed") is True, "valid_name returns True for Zed")
expect(Robot.built, before, "valid_name must not build a robot")
%% starter
class Robot:
    def __init__(self, name, health=100):
        self.name = name
        self.health = health

    # Add built, from_text() and valid_name() here.

%% solution
class Robot:
    built = 0

    def __init__(self, name, health=100):
        self.name = name
        self.health = health
        Robot.built += 1

    @classmethod
    def from_text(cls, text):
        name, health = text.split(":")
        return cls(name, int(health))

    @staticmethod
    def valid_name(name):
        return name.isalpha()
%% hint
Write `built = 0` in the class body, above `__init__`, and add `Robot.built += 1` inside `__init__`.
%% hint
A class method has `@classmethod` above it and `cls` as its first parameter. Split the text on `":"`, convert the health with `int`, and return `cls(name, health)`.
%% hint
A static method has `@staticmethod` above it and no `self`. The string method `isalpha()` already gives `False` for an empty text.
%% end

%% level l8 | The arena
The league final is a **knockout tournament**, and your program is the referee.

The first line of the input is the number of robots, from 2 to 8. Then there is one line per robot: `name health power`. Health and power are whole numbers, and power is at least 1.

- The first robot is the **champion**. It duels the second robot, then the winner duels the third robot, and so on. The champion **keeps its remaining health** from duel to duel.
- In a duel the champion attacks first, and then the two robots take turns. An attack takes `power` health from the other robot, and health never goes below 0. The duel ends when a robot has 0 health.
- After every duel print `champion vs challenger: winner wins with N HP left`, using the names of the two robots and the health that the winner has left.
- At the end print `Champion: name`.

```text
3
Bolt 30 20
Rusty 25 10
Zed 40 15
```

gives

```text
Bolt vs Rusty: Bolt wins with 20 HP left
Bolt vs Zed: Bolt wins with 5 HP left
Champion: Bolt
```

The starter has the reading code. Add the methods `attack` and `is_alive`, write a function `duel`, and run the tournament.
%% config
mode: io
par: 28
%% in The example
3
Bolt 30 20
Rusty 25 10
Zed 40 15
%% out
Bolt vs Rusty: Bolt wins with 20 HP left
Bolt vs Zed: Bolt wins with 5 HP left
Champion: Bolt
%% in The champion changes
3
Ada 30 5
Zed 40 25
Kit 40 10
%% out
Ada vs Zed: Zed wins with 30 HP left
Zed vs Kit: Zed wins with 20 HP left
Champion: Zed
%% in hidden
2
Tiny 5 1
Big 10 3
%% out
Tiny vs Big: Big wins with 8 HP left
Champion: Big
%% in hidden
2
Bolt 10 100
Rusty 100 1
%% out
Bolt vs Rusty: Bolt wins with 10 HP left
Champion: Bolt
%% in hidden
5
Neo 60 7
Max 20 12
Pip 35 9
Rex 50 11
Ivy 45 14
%% out
Neo vs Max: Neo wins with 36 HP left
Neo vs Pip: Pip wins with 7 HP left
Pip vs Rex: Rex wins with 41 HP left
Rex vs Ivy: Ivy wins with 12 HP left
Champion: Ivy
%% starter
class Robot:
    def __init__(self, name, health, power):
        self.name = name
        self.health = health
        self.power = power

    # Add attack(target) and is_alive() here.

def read_robot():
    name, health, power = input().split()
    return Robot(name, int(health), int(power))

count = int(input())
champion = read_robot()
# Write the function duel(champion, challenger).
# Then read the other robots and run the duels.

%% solution
class Robot:
    def __init__(self, name, health, power):
        self.name = name
        self.health = health
        self.power = power

    def attack(self, target):
        target.health = max(0, target.health - self.power)

    def is_alive(self):
        return self.health > 0

def read_robot():
    name, health, power = input().split()
    return Robot(name, int(health), int(power))

def duel(champion, challenger):
    attacker, target = champion, challenger
    while champion.is_alive() and challenger.is_alive():
        attacker.attack(target)
        attacker, target = target, attacker
    if champion.is_alive():
        return champion
    return challenger

count = int(input())
champion = read_robot()
for i in range(count - 1):
    challenger = read_robot()
    winner = duel(champion, challenger)
    print(f"{champion.name} vs {challenger.name}: {winner.name} wins with {winner.health} HP left")
    champion = winner
print("Champion:", champion.name)
%% hint
`attack(self, target)` lowers `target.health` by `self.power`, with `max(0, ...)` so that it never goes below zero. `is_alive` returns `self.health > 0`.
%% hint
In `duel`, keep two names, `attacker` and `target`. Loop while both robots are alive: the attacker attacks, then the two names swap with `attacker, target = target, attacker`. Return the robot that is still alive.
%% hint
Read the challengers with `for i in range(count - 1):`. Print the line before you replace the champion, because the line needs the names of both robots. Then set `champion = winner`.
%% end

