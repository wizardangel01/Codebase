---
title: Arena Tournament
engine: judge
---
The Arena Master is building a team for the big tournament, and every fighter is a **class**. In each level you start from a few ready-made classes and grow the family: new kinds of fighter, special moves, a weapon rack, shields, abilities, rules, and in the last level a referee that runs a whole match.

How to play:

- Press **Run**. The result panel lists every test. A red test shows what was expected and what your code gave, or the error that stopped it, together with the line of your code.
- Some tests are **hidden**. They check the edge cases, so follow every rule of the briefing, and do not only fit the visible examples.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Recruits
The arena has one basic kind of fighter, `Fighter`, shown in the starter code. Recruit two new kinds as **children** of `Fighter`:

| Kind | Health | Power |
| --- | --- | --- |
| `Archer` | 80 | 15 |
| `Tank` | 150 | 8 |

Everything else (the name, `attack` and `is_alive`) must be **inherited**, not copied. Start each `__init__` with `super().__init__(name)`, and then change the two numbers.
%% config
mode: script
par: 19
%% test An archer
a = Archer("Ann")
expect(a.name, "Ann")
expect(a.health, 80)
expect(a.power, 15)
%% test A tank
t = Tank("Tom")
expect(t.name, "Tom")
expect(t.health, 150)
expect(t.power, 8)
%% test They are fighters
check(isinstance(Archer("a"), Fighter), "an Archer is a Fighter")
check(isinstance(Tank("t"), Fighter), "a Tank is a Fighter")
%% test hidden Inherited attacks
a = Archer("Ann")
t = Tank("Tom")
a.attack(t)
expect(t.health, 135)
t.attack(a)
expect(a.health, 72)
check(a.is_alive(), "Ann is alive")
%% test hidden Attack is written only once
check(source().count("def attack") == 1, "attack is inherited, so write it only once")
%% starter
class Fighter:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.power = 10

    def attack(self, target):
        target.health = max(0, target.health - self.power)

    def is_alive(self):
        return self.health > 0

# Write the classes Archer and Tank here.

%% solution
class Fighter:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.power = 10

    def attack(self, target):
        target.health = max(0, target.health - self.power)

    def is_alive(self):
        return self.health > 0

class Archer(Fighter):
    def __init__(self, name):
        super().__init__(name)
        self.health = 80
        self.power = 15

class Tank(Fighter):
    def __init__(self, name):
        super().__init__(name)
        self.health = 150
        self.power = 8
%% hint
A child names its parent in brackets: `class Archer(Fighter):`. It needs its own `__init__(self, name)`.
%% hint
Inside `__init__`, call `super().__init__(name)` first. That sets the name, the health 100 and the power 10.
%% hint
After the call to `super()`, overwrite the two numbers: `self.health = 80` and `self.power = 15` for the archer, and 150 and 8 for the tank.
%% end

%% level l2 | Special moves
Fighters get special moves. Write two children of `Fighter` that **override** `attack`, and reuse the normal attack with `super().attack(target)`:

- `Knight`: makes a normal attack, and then **heals itself by 5** health (never above 100).
- `Mage`: attacks **twice** in one turn.
%% config
mode: script
par: 17
require: super
%% test A knight heals
k = Knight("K")
k.health = 50
d = Fighter("D")
k.attack(d)
expect(d.health, 90)
expect(k.health, 55)
%% test The knight's limit
k = Knight("K")
k.health = 98
k.attack(Fighter("D"))
expect(k.health, 100)
%% test A mage hits twice
m = Mage("M")
d = Fighter("D")
m.attack(d)
expect(d.health, 80)
%% test hidden The mage can finish a fighter
m = Mage("M")
d = Fighter("D")
d.health = 15
m.attack(d)
expect(d.health, 0)
%% test hidden The mage uses its own power
m = Mage("M")
m.power = 30
d = Fighter("D")
m.attack(d)
expect(d.health, 40)
%% test hidden They are fighters
check(isinstance(Knight("K"), Fighter) and isinstance(Mage("M"), Fighter), "both kinds are Fighters")
%% starter
class Fighter:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.power = 10

    def attack(self, target):
        target.health = max(0, target.health - self.power)

    def is_alive(self):
        return self.health > 0

# Write the classes Knight and Mage here.

%% solution
class Fighter:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.power = 10

    def attack(self, target):
        target.health = max(0, target.health - self.power)

    def is_alive(self):
        return self.health > 0

class Knight(Fighter):
    def attack(self, target):
        super().attack(target)
        self.health = min(100, self.health + 5)

class Mage(Fighter):
    def attack(self, target):
        super().attack(target)
        super().attack(target)
%% hint
Each child needs one method, `attack(self, target)`. It replaces the parent's method for that kind.
%% hint
Inside the override, `super().attack(target)` runs the normal attack of `Fighter`. For the mage, call it twice.
%% hint
For the knight, call `super().attack(target)` and then set `self.health = min(100, self.health + 5)`.
%% end

%% level l3 | Gang up
Several fighters, of different kinds, attack one target together. The kinds from the last level are in the starter code. Write the function `gang_up(team, target)`:

- Every **living** fighter in `team` attacks `target`, in order.
- Stop as soon as the target is beaten (health 0).
- Return the number of attacks that were made. A mage's double hit counts as **one** attack.

Do not ask what kind each fighter is. Every kind already knows how to attack, and that is the point of polymorphism.
%% config
mode: script
function: gang_up
par: 24
forbid: isinstance
%% test A mixed team
team = [Fighter("A"), Mage("M"), Knight("K")]
target = Fighter("T")
expect(gang_up(team, target), 3)
expect(target.health, 60)
%% test Stop when the target is beaten
team = [Fighter("A"), Mage("M"), Knight("K")]
target = Fighter("T")
target.health = 25
expect(gang_up(team, target), 2)
expect(target.health, 0)
%% test Beaten fighters do not attack
a = Fighter("A")
b = Fighter("B")
a.health = 0
target = Fighter("T")
expect(gang_up([a, b], target), 1)
expect(target.health, 90)
%% test hidden An empty team
expect(gang_up([], Fighter("T")), 0)
%% test hidden Knights heal while they attack
k = Knight("K")
k.health = 50
gang_up([k], Fighter("T"))
expect(k.health, 55)
%% test hidden A target that is already beaten
t = Fighter("T")
t.health = 0
expect(gang_up([Fighter("A")], t), 0)
%% starter
class Fighter:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.power = 10

    def attack(self, target):
        target.health = max(0, target.health - self.power)

    def is_alive(self):
        return self.health > 0

class Knight(Fighter):
    def attack(self, target):
        super().attack(target)
        self.health = min(100, self.health + 5)

class Mage(Fighter):
    def attack(self, target):
        super().attack(target)
        super().attack(target)

# Write the function gang_up(team, target) here.

%% solution
class Fighter:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.power = 10

    def attack(self, target):
        target.health = max(0, target.health - self.power)

    def is_alive(self):
        return self.health > 0

class Knight(Fighter):
    def attack(self, target):
        super().attack(target)
        self.health = min(100, self.health + 5)

class Mage(Fighter):
    def attack(self, target):
        super().attack(target)
        super().attack(target)

def gang_up(team, target):
    attacks = 0
    for fighter in team:
        if target.is_alive() and fighter.is_alive():
            fighter.attack(target)
            attacks += 1
    return attacks
%% hint
Loop over the team. For each fighter, make the attack with `fighter.attack(target)`, and count it.
%% hint
Before each attack, check `target.is_alive()` and `fighter.is_alive()`. A beaten target ends the fight, and a beaten fighter is skipped.
%% hint
Keep a counter that starts at 0, add 1 for every attack, and return it after the loop.
%% end

%% level l4 | Weapon rack
The weapon rack needs a **contract**. Write these classes:

- The abstract class `Weapon(name)`. It has an **abstract** method `damage()`, and an ordinary method `describe()` that returns text such as `Longsword deals 15`.
- `Sword(name, sharpness)` deals `sharpness * 3`.
- `Bow(name, tension)` deals `tension + 5`.
- `Hammer(name)` always deals `12`.

Nobody may create a plain `Weapon`, and a new kind of weapon that forgets `damage()` must be refused.
%% config
mode: script
par: 24
require: decorator
%% test A sword
s = Sword("Longsword", 5)
expect(s.damage(), 15)
expect(s.describe(), "Longsword deals 15")
%% test A bow
b = Bow("Elm", 7)
expect(b.damage(), 12)
expect(b.describe(), "Elm deals 12")
%% test A hammer
h = Hammer("Thor")
expect(h.damage(), 12)
expect(h.describe(), "Thor deals 12")
%% test Weapon is abstract
check(raises(TypeError, Weapon, "x"), "a plain Weapon cannot be created")
%% test hidden All are weapons
for w in [Sword("a", 1), Bow("b", 1), Hammer("c")]:
    check(isinstance(w, Weapon), "every kind is a Weapon")
%% test hidden A child must provide damage
class Broken(Weapon):
    pass
check(raises(TypeError, Broken, "x"), "a kind without damage() cannot be created")
%% test hidden describe is written once
check(source().count("def describe") == 1, "describe() belongs in Weapon, and the children inherit it")
%% starter
from abc import ABC, abstractmethod

# Write Weapon (abstract), Sword, Bow and Hammer here.

%% solution
from abc import ABC, abstractmethod

class Weapon(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def damage(self):
        pass

    def describe(self):
        return f"{self.name} deals {self.damage()}"

class Sword(Weapon):
    def __init__(self, name, sharpness):
        super().__init__(name)
        self.sharpness = sharpness

    def damage(self):
        return self.sharpness * 3

class Bow(Weapon):
    def __init__(self, name, tension):
        super().__init__(name)
        self.tension = tension

    def damage(self):
        return self.tension + 5

class Hammer(Weapon):
    def damage(self):
        return 12
%% hint
`class Weapon(ABC):` stores the name in `__init__`. Mark `damage` with `@abstractmethod` and give it the body `pass`.
%% hint
`describe` is an ordinary method of `Weapon`. It calls `self.damage()`, which every child provides: `f"{self.name} deals {self.damage()}"`.
%% hint
`Sword` and `Bow` need their own `__init__` that calls `super().__init__(name)` and stores the extra number. `Hammer` needs only `damage`, so it inherits `__init__`.
%% end

%% level l5 | Shields
A fighter **has a** shield, so this is a job for composition. Write two classes:

- `Shield(strength)` with a method `absorb(damage)` that returns the damage that **gets through**: `damage - strength`, but never below 0.
- `Fighter(name, shield)` with `health` 100 and the attribute `shield`. Its method `take_damage(amount)` asks the shield how much gets through (**delegate**, and do not calculate it in the fighter) and lowers the health by that amount, never below 0. The method `swap_shield(shield)` replaces the shield.

Any object that has an `absorb` method must work as a shield.
%% config
mode: script
par: 15
%% test A shield absorbs
expect(Shield(3).absorb(10), 7)
expect(Shield(3).absorb(2), 0)
%% test A shielded fighter
f = Fighter("F", Shield(4))
f.take_damage(10)
expect(f.health, 94)
%% test Health never goes below zero
f = Fighter("F", Shield(0))
f.take_damage(500)
expect(f.health, 0)
%% test Swapping shields
f = Fighter("F", Shield(0))
f.swap_shield(Shield(10))
f.take_damage(15)
expect(f.health, 95)
%% test hidden Any object with absorb works
class Mirror:
    def absorb(self, damage):
        return 0
f = Fighter("F", Mirror())
f.take_damage(50)
expect(f.health, 100)
%% test hidden The fighter holds the shield
s = Shield(2)
f = Fighter("F", s)
check(f.shield is s, "store the shield in the attribute shield")
check(not issubclass(Fighter, Shield), "a fighter has a shield, it is not a shield")
%% starter
# Write the classes Shield and Fighter here.

%% solution
class Shield:
    def __init__(self, strength):
        self.strength = strength

    def absorb(self, damage):
        return max(0, damage - self.strength)

class Fighter:
    def __init__(self, name, shield):
        self.name = name
        self.health = 100
        self.shield = shield

    def take_damage(self, amount):
        through = self.shield.absorb(amount)
        self.health = max(0, self.health - through)

    def swap_shield(self, shield):
        self.shield = shield
%% hint
`Shield` stores its strength in `__init__`. `absorb` returns `max(0, damage - self.strength)`.
%% hint
`Fighter.__init__` stores the name, the health 100 and the shield: `self.shield = shield`.
%% hint
In `take_damage`, do not subtract the strength yourself. Ask the shield: `through = self.shield.absorb(amount)`, and then lower the health by `through`.
%% end

%% level l6 | Mixin workshop
Abilities are added to units with **mixins**. The class `Unit` is in the starter code. Write:

- `HealMixin` with a method `heal(amount)` that raises `health` by `amount`, but never above `max_health`.
- `RageMixin` with a method `rage()` that **doubles** `power`.
- `Medic` (can heal), `Brute` (can rage) and `Hero` (can do both). Write each one with its mixin or mixins **first** and `Unit` **last**. In this order the heal ability comes before the rage ability for the hero. The class bodies can be `pass`.
%% config
mode: script
par: 18
%% test A medic heals
m = Medic("M")
m.health = 50
m.heal(30)
expect(m.health, 80)
%% test The healing limit
m = Medic("M")
m.health = 90
m.heal(30)
expect(m.health, 100)
%% test A brute rages
b = Brute("B")
b.rage()
expect(b.power, 20)
%% test Abilities are not shared
check(not hasattr(Medic("M"), "rage"), "a medic cannot rage")
check(not hasattr(Brute("B"), "heal"), "a brute cannot heal")
%% test hidden A hero has both
h = Hero("H")
h.health = 10
h.heal(5)
h.rage()
h.rage()
expect(h.health, 15)
expect(h.power, 40)
%% test hidden The method resolution order
names = []
for cls in Hero.__mro__:
    names.append(cls.__name__)
expect(names, ["Hero", "HealMixin", "RageMixin", "Unit", "object"])
%% test hidden Everyone is a unit
check(isinstance(Medic("a"), Unit) and isinstance(Brute("b"), Unit) and isinstance(Hero("c"), Unit), "all three are Units")
%% starter
class Unit:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.max_health = 100
        self.power = 10

# Write HealMixin, RageMixin, Medic, Brute and Hero here.

%% solution
class Unit:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.max_health = 100
        self.power = 10

class HealMixin:
    def heal(self, amount):
        self.health = min(self.max_health, self.health + amount)

class RageMixin:
    def rage(self):
        self.power *= 2

class Medic(HealMixin, Unit):
    pass

class Brute(RageMixin, Unit):
    pass

class Hero(HealMixin, RageMixin, Unit):
    pass
%% hint
A mixin is an ordinary small class with no `__init__`. Its method uses attributes that the `Unit` provides, such as `self.health`.
%% hint
`heal` sets `self.health = min(self.max_health, self.health + amount)`, and `rage` sets `self.power *= 2`.
%% hint
List the mixins before `Unit`: `class Hero(HealMixin, RageMixin, Unit):` followed by `pass`.
%% end

%% level l7 | Rule breakers
The arena has rules, and rules need exceptions. Write this family:

- `ArenaError(Exception)` is the base class.
- `DeadFighterError(ArenaError)` is raised with a message.
- `NotEnoughEnergyError(ArenaError)` is created with `needed` and `available`. Its message is `needs 5 energy, has 3` (with the numbers), and it stores both numbers in attributes with the same names.

The starter has `Fighter(name)` with `health` 100 and `energy` 10. Write its method `attack(target)`, which checks **in this order**:

1. The attacker is alive, or raise `DeadFighterError("<attacker name> is out of the fight")`.
2. The target is alive, or raise `DeadFighterError("<target name> is already beaten")`.
3. The attacker has at least 5 energy, or raise `NotEnoughEnergyError(5, energy)`.

A legal attack costs 5 energy and takes 10 health from the target, never below 0. A refused attack must change nothing.
%% config
mode: script
par: 23
%% test A legal attack
a = Fighter("A")
t = Fighter("T")
a.attack(t)
expect(t.health, 90)
expect(a.energy, 5)
%% test Not enough energy
a = Fighter("A")
t = Fighter("T")
a.energy = 3
try:
    a.attack(t)
except NotEnoughEnergyError as e:
    got = (e.needed, e.available, str(e))
else:
    got = None
expect(got, (5, 3, "needs 5 energy, has 3"))
%% test A beaten attacker
a = Fighter("A")
a.health = 0
try:
    a.attack(Fighter("T"))
except DeadFighterError as e:
    got = str(e)
else:
    got = None
expect(got, "A is out of the fight")
%% test A beaten target
t = Fighter("T")
t.health = 0
try:
    Fighter("A").attack(t)
except DeadFighterError as e:
    got = str(e)
else:
    got = None
expect(got, "T is already beaten")
%% test hidden The family
check(issubclass(DeadFighterError, ArenaError), "DeadFighterError belongs to the family")
check(issubclass(NotEnoughEnergyError, ArenaError), "NotEnoughEnergyError belongs to the family")
check(issubclass(ArenaError, Exception), "ArenaError is an exception")
%% test hidden A refused attack changes nothing
a = Fighter("A")
t = Fighter("T")
a.energy = 3
check(raises(ArenaError, a.attack, t), "the attack is refused")
expect(a.energy, 3)
expect(t.health, 100)
%% test hidden The order of the checks
a = Fighter("A")
a.health = 0
a.energy = 0
check(raises(DeadFighterError, a.attack, Fighter("T")), "a beaten attacker is reported before the energy")
%% test hidden Health never goes below zero
a = Fighter("A")
t = Fighter("T")
t.health = 4
a.attack(t)
expect(t.health, 0)
%% starter
class Fighter:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.energy = 10

    # Write attack(self, target) here.

# Write ArenaError, DeadFighterError and NotEnoughEnergyError here.

%% solution
class ArenaError(Exception):
    pass

class DeadFighterError(ArenaError):
    pass

class NotEnoughEnergyError(ArenaError):
    def __init__(self, needed, available):
        super().__init__(f"needs {needed} energy, has {available}")
        self.needed = needed
        self.available = available

class Fighter:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.energy = 10

    def attack(self, target):
        if self.health == 0:
            raise DeadFighterError(f"{self.name} is out of the fight")
        if target.health == 0:
            raise DeadFighterError(f"{target.name} is already beaten")
        if self.energy < 5:
            raise NotEnoughEnergyError(5, self.energy)
        self.energy -= 5
        target.health = max(0, target.health - 10)
%% hint
The family: `class ArenaError(Exception): pass`, then two classes that name `ArenaError` as their parent. Only `NotEnoughEnergyError` needs an `__init__`.
%% hint
In `NotEnoughEnergyError.__init__(self, needed, available)`, call `super().__init__(f"needs {needed} energy, has {available}")` and store the two attributes.
%% hint
In `attack`, write the three checks in the order of the briefing, each with its own `raise`. Change the energy and the health only after all three checks passed.
%% end

%% level l8 | The tournament
The final match! Two fighters meet, and **you** build the fighters. The referee code is already in the starter. It reads two lines `kind name`, runs up to 10 rounds, and decides the winner.

Write these parts, which the referee uses:

- The enum `Move` with the members `ATTACK` and `HEAL`.
- The abstract class `Fighter(name)`. A fighter starts with `health` 60, and has the **abstract** method `choose(number)`, where `number` is the round (1, 2, 3, ...). It returns a `Move`.
- Three kinds of fighter, each a child of `Fighter`:

| Kind | Its choice in every round |
| --- | --- |
| `Aggressive` | always `Move.ATTACK` |
| `Cautious` | `Move.HEAL` when its health is below 30, otherwise `Move.ATTACK` |
| `Steady` | `Move.ATTACK` in odd rounds (1, 3, 5, ...), `Move.HEAL` in even rounds |

A heal gives 10 health (up to 60), an attack takes 15 health from the other fighter. In one round, both heals happen first, then both attacks. The match ends when a fighter has 0 health or less, or after round 10.

For the input

```text
aggressive Ana
cautious Bo
```

the program prints

```text
Round 1: Ana ATTACK, Bo ATTACK -> 45/45
Round 2: Ana ATTACK, Bo ATTACK -> 30/30
Round 3: Ana ATTACK, Bo ATTACK -> 15/15
Round 4: Ana ATTACK, Bo HEAL -> 15/10
Round 5: Ana ATTACK, Bo HEAL -> 15/5
Round 6: Ana ATTACK, Bo HEAL -> 15/0
Ana wins
```
%% config
mode: io
par: 51
%% in Aggressive against cautious
aggressive Ana
cautious Bo
%% out
Round 1: Ana ATTACK, Bo ATTACK -> 45/45
Round 2: Ana ATTACK, Bo ATTACK -> 30/30
Round 3: Ana ATTACK, Bo ATTACK -> 15/15
Round 4: Ana ATTACK, Bo HEAL -> 15/10
Round 5: Ana ATTACK, Bo HEAL -> 15/5
Round 6: Ana ATTACK, Bo HEAL -> 15/0
Ana wins
%% in Two steady fighters
steady Kim
steady Lou
%% out
Round 1: Kim ATTACK, Lou ATTACK -> 45/45
Round 2: Kim HEAL, Lou HEAL -> 55/55
Round 3: Kim ATTACK, Lou ATTACK -> 40/40
Round 4: Kim HEAL, Lou HEAL -> 50/50
Round 5: Kim ATTACK, Lou ATTACK -> 35/35
Round 6: Kim HEAL, Lou HEAL -> 45/45
Round 7: Kim ATTACK, Lou ATTACK -> 30/30
Round 8: Kim HEAL, Lou HEAL -> 40/40
Round 9: Kim ATTACK, Lou ATTACK -> 25/25
Round 10: Kim HEAL, Lou HEAL -> 35/35
Draw
%% in hidden
cautious Dee
steady Ed
%% out
Round 1: Dee ATTACK, Ed ATTACK -> 45/45
Round 2: Dee ATTACK, Ed HEAL -> 45/40
Round 3: Dee ATTACK, Ed ATTACK -> 30/25
Round 4: Dee ATTACK, Ed HEAL -> 30/20
Round 5: Dee ATTACK, Ed ATTACK -> 15/5
Round 6: Dee HEAL, Ed HEAL -> 25/15
Round 7: Dee HEAL, Ed ATTACK -> 20/15
Round 8: Dee HEAL, Ed HEAL -> 30/25
Round 9: Dee ATTACK, Ed ATTACK -> 15/10
Round 10: Dee HEAL, Ed HEAL -> 25/20
Dee wins
%% in hidden
aggressive Fay
aggressive Gus
%% out
Round 1: Fay ATTACK, Gus ATTACK -> 45/45
Round 2: Fay ATTACK, Gus ATTACK -> 30/30
Round 3: Fay ATTACK, Gus ATTACK -> 15/15
Round 4: Fay ATTACK, Gus ATTACK -> 0/0
Draw
%% in hidden
steady Hal
aggressive Ivy
%% out
Round 1: Hal ATTACK, Ivy ATTACK -> 45/45
Round 2: Hal HEAL, Ivy ATTACK -> 40/45
Round 3: Hal ATTACK, Ivy ATTACK -> 25/30
Round 4: Hal HEAL, Ivy ATTACK -> 20/30
Round 5: Hal ATTACK, Ivy ATTACK -> 5/15
Round 6: Hal HEAL, Ivy ATTACK -> 0/15
Ivy wins
%% starter
from abc import ABC, abstractmethod
from enum import Enum

# Write the enum Move, the abstract class Fighter and the three kinds here.

kinds = {"aggressive": Aggressive, "cautious": Cautious, "steady": Steady}
fighters = []
for i in range(2):
    kind, name = input().split()
    fighters.append(kinds[kind](name))

a, b = fighters
for number in range(1, 11):
    move_a = a.choose(number)
    move_b = b.choose(number)
    if move_a is Move.HEAL:
        a.health = min(60, a.health + 10)
    if move_b is Move.HEAL:
        b.health = min(60, b.health + 10)
    if move_a is Move.ATTACK:
        b.health -= 15
    if move_b is Move.ATTACK:
        a.health -= 15
    print(f"Round {number}: {a.name} {move_a.name}, {b.name} {move_b.name} -> {a.health}/{b.health}")
    if a.health <= 0 or b.health <= 0:
        break
if a.health > b.health:
    print(a.name, "wins")
elif b.health > a.health:
    print(b.name, "wins")
else:
    print("Draw")

%% solution
from abc import ABC, abstractmethod
from enum import Enum

class Move(Enum):
    ATTACK = 1
    HEAL = 2

class Fighter(ABC):
    def __init__(self, name):
        self.name = name
        self.health = 60

    @abstractmethod
    def choose(self, number):
        pass

class Aggressive(Fighter):
    def choose(self, number):
        return Move.ATTACK

class Cautious(Fighter):
    def choose(self, number):
        if self.health < 30:
            return Move.HEAL
        return Move.ATTACK

class Steady(Fighter):
    def choose(self, number):
        if number % 2 == 1:
            return Move.ATTACK
        return Move.HEAL

kinds = {"aggressive": Aggressive, "cautious": Cautious, "steady": Steady}
fighters = []
for i in range(2):
    kind, name = input().split()
    fighters.append(kinds[kind](name))

a, b = fighters
for number in range(1, 11):
    move_a = a.choose(number)
    move_b = b.choose(number)
    if move_a is Move.HEAL:
        a.health = min(60, a.health + 10)
    if move_b is Move.HEAL:
        b.health = min(60, b.health + 10)
    if move_a is Move.ATTACK:
        b.health -= 15
    if move_b is Move.ATTACK:
        a.health -= 15
    print(f"Round {number}: {a.name} {move_a.name}, {b.name} {move_b.name} -> {a.health}/{b.health}")
    if a.health <= 0 or b.health <= 0:
        break
if a.health > b.health:
    print(a.name, "wins")
elif b.health > a.health:
    print(b.name, "wins")
else:
    print("Draw")
%% hint
The enum is `class Move(Enum):` with `ATTACK = 1` and `HEAL = 2`. The base class is `class Fighter(ABC):`, with `__init__` storing the name and `health = 60`, and `choose` marked with `@abstractmethod`.
%% hint
Each kind overrides `choose(self, number)` and returns a member of the enum, such as `Move.ATTACK`. Only `Cautious` needs to look at `self.health`.
%% hint
For `Steady`, the test `number % 2 == 1` is true in odd rounds. Return `Move.ATTACK` then, and `Move.HEAL` otherwise.
%% end

