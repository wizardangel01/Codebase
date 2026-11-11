---
title: Inheritance
---
In module 10 you built classes from nothing. Real programs often need **families** of classes that are alike but not identical: dogs and cats are both animals, a circle and a rectangle are both shapes, and a manager is a kind of employee. Copying the shared code into every class works for a day, and then a change has to be made in five places. **Inheritance** lets a new class start from an existing one, take everything that it has, and add or change only what is different.

## The cost of copying

Here are two classes that share most of their code:

```python run
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def describe(self):
        return f"{self.name} is {self.age} years old"

    def speak(self):
        return "Woof"

class Cat:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def describe(self):
        return f"{self.name} is {self.age} years old"

    def speak(self):
        return "Meow"

rex = Dog("Rex", 3)
tom = Cat("Tom", 5)
print(rex.describe(), "and says", rex.speak())
print(tom.describe(), "and says", tom.speak())
```

Both classes store a name and an age, and both have the same `describe` method. Only `speak` differs. If you wanted to add a `birthday()` method, you would write it twice, and a third animal would need it as well. The cure is to write the shared code **once**, in a parent class.

## Parent and child

A class can name another class in brackets. The new class is the **child** (or subclass), and the class in the brackets is the **parent** (or base class, or superclass). The child gets everything that the parent has:

```python run
class Animal:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def describe(self):
        return f"{self.name} is {self.age} years old"

class Dog(Animal):
    def bark(self):
        return "Woof"

class Cat(Animal):
    def purr(self):
        return "Purr"

rex = Dog("Rex", 3)
tom = Cat("Tom", 5)
print(rex.describe())
print(rex.bark())
print(tom.describe(), "and", tom.purr())
```

The line `class Dog(Animal):` says "a Dog **is an** Animal". Neither child writes an `__init__` or a `describe`, and they still work, because Python looks for a name step by step, and the first match wins:

| Python looks for | Where it is found |
| --- | --- |
| `rex.name` | in the object itself (`__init__` stored it) |
| `rex.bark()` | in the class `Dog` |
| `rex.describe()` | not in `Dog`, so in the parent `Animal` |
| `rex.__str__()` | not in `Dog` or `Animal`, so in `object` (see below) |

The relationship goes one way. A child has what its parent has, and the parent does not get the extras of its children, and the two children do not share their extras with each other:

```python run error
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def bark(self):
        return "Woof"

class Cat(Animal):
    pass

print(Dog("Rex").bark())
print(Cat("Tom").bark())
```

The first line works, and the second stops with `AttributeError: 'Cat' object has no attribute 'bark'`.

%% question q-subclass-choice | choice
After `class Cat(Animal):`, which statement is true?
%% choice correct
`Cat` objects can use the methods that `Animal` defines.
%% choice
`Animal` objects can use the methods that `Cat` defines.
%% choice
`Cat` and `Animal` must have exactly the same methods.
%% choice
Python copies the code of `Animal` into `Cat` when the class is created.
%% explain
The child inherits from the parent, and not the other way round. Nothing is copied: when a method is missing from `Cat`, Python looks in `Animal`.
%% end

## Overriding methods

A child can define a method with the **same name** as a method of its parent. Python finds the child's version first, so the child's version **overrides** (replaces) the parent's version for the child's objects:

```python run
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):
        return "Woof"

class Fish(Animal):
    pass

for animal in [Dog("Rex"), Fish("Nemo")]:
    print(animal.name, animal.speak())
```

The `Fish` has no `speak` of its own, so it uses the parent's quiet default. The `Dog` overrides it. This is the main use of inheritance: the parent provides a sensible default, and each child changes only what must be different.

%% question q-override-predict | predict
What does this program print?

```python
class A:
    def hello(self):
        return "A"

class B(A):
    def hello(self):
        return "B"

class C(A):
    pass

print(A().hello(), B().hello(), C().hello())
```
%% answer
A B A
%% explain
`A().hello()` uses the method of `A`. `B` overrides it, so `B().hello()` gives `B`. `C` has no `hello` of its own, so Python finds the one in its parent `A`.
%% end

## super(): using the parent's version

An override often needs to do **what the parent does, plus something more**. The function `super()` gives you access to the parent's version of a method. It is most often used in `__init__`, so that the parent sets up its part of the object, and the child sets up its own part:

```python run
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed

rex = Dog("Rex", "Collie")
print(rex.name, rex.breed)
```

Write `super().__init__(name)` **without** `self`: Python passes the object for you. Step through the next program and watch how the call goes up to the parent and comes back:

```python trace title="Following the call to super().__init__"
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed

rex = Dog("Rex", "Collie")
print(rex.name, rex.breed)
```

If a child defines its own `__init__` and **forgets** to call the parent's, the parent's part of the setup never runs:

```python run error
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        self.breed = breed

rex = Dog("Rex", "Collie")
print(rex.breed)
print(rex.name)
```

The breed is printed, and then Python reports `AttributeError: 'Dog' object has no attribute 'name'`. The rule: when a child writes its own `__init__`, it normally starts with `super().__init__(...)`.

`super()` works in every method, not only `__init__`. A child can build on the parent's answer, and a grandchild can build on the child's:

```python run
class Animal:
    def __init__(self, name):
        self.name = name

    def describe(self):
        return f"{self.name} is an animal"

class Dog(Animal):
    def describe(self):
        return super().describe() + " and a dog"

class Puppy(Dog):
    def describe(self):
        return super().describe() + " and very young"

print(Animal("Generic").describe())
print(Dog("Rex").describe())
print(Puppy("Bit").describe())
```

Each `describe` adds its own piece and leaves the rest to its parent. If the text for animals changes, one method changes and every child follows.

%% question q-super-predict | predict
What does this program print?

```python
class Base:
    def __init__(self):
        print("base")

class Child(Base):
    def __init__(self):
        print("child start")
        super().__init__()
        print("child end")

Child()
```
%% answer
child start
base
child end
%% explain
Creating a `Child` runs `Child.__init__`. It prints `child start`, then `super().__init__()` runs the method of `Base`, which prints `base`, and then the child's method carries on and prints `child end`.
%% end

%% question q-super-fill | fill
Fill in the blank so that the program prints `Rex Collie`.

```python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().___(name)
        self.breed = breed

rex = Dog("Rex", "Collie")
print(rex.name, rex.breed)
```
%% answer
__init__
%% expected
Rex Collie
%% explain
`super().__init__(name)` runs the parent's `__init__`, which stores the name. The child then stores the breed.
%% end

## Classes, objects and the family tree

The functions `isinstance` and `issubclass` ask about the family:

```python run
class Animal:
    pass

class Dog(Animal):
    pass

rex = Dog()
print(isinstance(rex, Dog), isinstance(rex, Animal), isinstance(rex, str))
print(type(rex) is Dog, type(rex) is Animal)
print(issubclass(Dog, Animal), issubclass(Animal, Dog), issubclass(Dog, Dog))
print(issubclass(Dog, object), isinstance(5, object))
```

- `isinstance(obj, Class)` is `True` when the object was made from that class **or from any child of it**. A dog is an animal, so `isinstance(rex, Animal)` is `True`.
- `type(obj) is Class` is stricter: it is `True` only for the exact class.
- `issubclass(A, B)` asks the same question about two classes. Every class counts as a subclass of itself.
- `isinstance(rex, (Dog, Cat))` accepts a tuple of classes, and means "any of these".

At the top of every family is the class `object`. A class written as `class Animal:` has `object` as its parent without saying so, and so do the built-in types such as numbers and text. This is where the unhelpful `print(rex)` text of module 10 came from, because `__str__`, `__repr__` and `__eq__` are all first defined in `object`. A class that defines them **overrides** them, and its children inherit the new versions.

%% question q-family-multi | multi
A class `Dog(Animal)` exists, and `rex = Dog()`. Select every expression that is `True`.
%% choice correct
`isinstance(rex, Animal)`
%% choice correct
`issubclass(Dog, Animal)`
%% choice correct
`type(rex) is Dog`
%% choice
`type(rex) is Animal`
%% choice
`issubclass(Animal, Dog)`
%% explain
`isinstance` accepts the exact class and its parents, and `issubclass(Dog, Animal)` is true because a dog is an animal. The exact class of `rex` is `Dog`, not `Animal`, and the question `issubclass(Animal, Dog)` has the family the wrong way round.
%% end

## The is-a test

Before you write `class B(A):`, say the sentence "**B is an A**" out loud.

- A dog is an animal. A manager is an employee. A square is a rectangle. Inheritance fits.
- A car **has an** engine. A library **has** books. Those are not inheritance: they are objects that **contain** other objects, as in lesson 4 of module 10. The next lessons come back to this choice, and show why "has a" is often the better design.

Inheritance is a strong tool, and it ties the child to the parent: a change in the parent reaches every child. Use it when the sentence is true, and when you want the children to behave like the parent.

## A project: shapes

Here is a small family of three levels. The parent `Shape` has a method `describe` that is written **once**, and it calls `self.area()`. Every child defines its own `area`, so `describe` works for all of them:

```python run
class Shape:
    def __init__(self, name):
        self.name = name

    def area(self):
        return 0

    def describe(self):
        return f"{self.name} with area {self.area():.2f}"

class Circle(Shape):
    def __init__(self, radius):
        super().__init__("Circle")
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("Rectangle")
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

class Square(Rectangle):
    def __init__(self, side):
        super().__init__(side, side)
        self.name = "Square"

shapes = [Circle(1), Rectangle(2, 3), Square(4)]
total = 0
for shape in shapes:
    print(shape.describe())
    total += shape.area()
print(f"Total area: {total:.2f}")
```

Look at three things. `Square` inherits `area` from `Rectangle`, and it calls `super().__init__(side, side)` to reuse the rectangle's setup. The loop treats a circle, a rectangle and a square in the same way. And `describe` finds the right `area` for each object, because `self.area()` starts its search at the class of the object, and not at `Shape`. That last idea is called **polymorphism**, and the next lesson is about it.

## Your turn

%% exercise pet-sounds | Pet sounds
A class `Pet` is in the starter code. Write the classes `Dog` and `Cat`, both **inheriting** from `Pet`. A dog's `speak()` returns `Woof`, a cat's returns `Meow`, and a plain `Pet` says `...`. The children inherit `__init__`, so they do not need their own. For the input below the program prints:

```output
Rex says Woof
Tom says Meow
Nemo says ...
```
%% stdin
dog Rex
cat Tom
fish Nemo
done
%% starter
class Pet:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

# Write the classes Dog and Cat here.

kinds = {"dog": Dog, "cat": Cat, "fish": Pet}
while True:
    line = input()
    if line == "done":
        break
    kind, name = line.split()
    pet = kinds[kind](name)
    print(f"{pet.name} says {pet.speak()}")

%% solution
class Pet:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Dog(Pet):
    def speak(self):
        return "Woof"

class Cat(Pet):
    def speak(self):
        return "Meow"

kinds = {"dog": Dog, "cat": Cat, "fish": Pet}
while True:
    line = input()
    if line == "done":
        break
    kind, name = line.split()
    pet = kinds[kind](name)
    print(f"{pet.name} says {pet.speak()}")
%% tests
expect_output("Rex says Woof\nTom says Meow\nNemo says ...")
check(issubclass(Dog, Pet) and issubclass(Cat, Pet), "Dog and Cat inherit from Pet")
expect(Dog("x").speak(), "Woof", "a dog speaks")
expect(Cat("x").speak(), "Meow", "a cat speaks")
expect(Pet("x").speak(), "...", "a plain pet speaks")
check(source().count("def __init__") == 1, "the children inherit __init__ from Pet, so they need no __init__ of their own")
check(rerun("cat Zed\ndone").strip() == "Zed says Meow", "a single cat")
%% hint
A child class names its parent in brackets: `class Dog(Pet):`.
%% hint
Each child needs only one method, `speak`. It inherits `__init__` from `Pet`.
%% hint
Write `class Dog(Pet):` and `def speak(self): return "Woof"`, then the same for `Cat` with `"Meow"`.
%% end

%% exercise employee-pay | Employees and managers
An `Employee` has a `name` and a `salary`, and a method `pay()` that returns the salary. A `Manager` is an `Employee` with an extra `bonus`: its `pay()` returns the salary plus the bonus. Use `super()` both in `__init__` and in `pay`. The starter code reads the people. For the input below the program prints:

```output
Ada earns 3000
Grace earns 5800
Total: 8800
```
%% stdin
worker Ada 3000
manager Grace 5000 800
done
%% starter
# Write the classes Employee and Manager here.

total = 0
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    if parts[0] == "worker":
        person = Employee(parts[1], int(parts[2]))
    else:
        person = Manager(parts[1], int(parts[2]), int(parts[3]))
    print(f"{person.name} earns {person.pay()}")
    total += person.pay()
print("Total:", total)

%% solution
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def pay(self):
        return self.salary

class Manager(Employee):
    def __init__(self, name, salary, bonus):
        super().__init__(name, salary)
        self.bonus = bonus

    def pay(self):
        return super().pay() + self.bonus

total = 0
while True:
    line = input()
    if line == "done":
        break
    parts = line.split()
    if parts[0] == "worker":
        person = Employee(parts[1], int(parts[2]))
    else:
        person = Manager(parts[1], int(parts[2]), int(parts[3]))
    print(f"{person.name} earns {person.pay()}")
    total += person.pay()
print("Total:", total)
%% tests
expect_output("Ada earns 3000\nGrace earns 5800\nTotal: 8800")
check(issubclass(Manager, Employee), "Manager inherits from Employee")
m = Manager("M", 100, 25)
expect(m.pay(), 125, "a manager's pay")
expect(m.name, "M", "the name is stored")
expect(m.bonus, 25, "the bonus is stored")
expect(Employee("E", 70).pay(), 70, "an employee's pay")
check(calls("super"), "uses super()")
check(source().count("super()") >= 2, "uses super() in __init__ and in pay")
check(rerun("manager Zed 10 5\ndone").strip() == "Zed earns 15\nTotal: 15", "a single manager")
%% hint
`Employee` stores `name` and `salary`, and `pay()` returns the salary. `Manager(Employee)` adds the bonus.
%% hint
In `Manager.__init__`, call `super().__init__(name, salary)` first, and then store `self.bonus = bonus`.
%% hint
In `Manager.pay`, return `super().pay() + self.bonus`, so the salary rule stays in one place.
%% end

%% exercise family-tree | Is it a kind of?
The starter code builds a small family of classes, and a dictionary `classes` that maps each name to its class. Read lines such as `Dog Animal` until `done`. For each line print `Dog is a kind of Animal` when the first class is the same as, or a child of, the second class, and `Dog is not a kind of Animal` otherwise. For the input below the program prints:

```output
Dog is a kind of Animal
Dog is not a kind of Bird
Animal is not a kind of Dog
Eagle is a kind of Eagle
```
%% stdin
Dog Animal
Dog Bird
Animal Dog
Eagle Eagle
done
%% starter
class Animal:
    pass

class Mammal(Animal):
    pass

class Bird(Animal):
    pass

class Dog(Mammal):
    pass

class Eagle(Bird):
    pass

classes = {"Animal": Animal, "Mammal": Mammal, "Bird": Bird, "Dog": Dog, "Eagle": Eagle}

# Read the pairs until "done" and print one line for each pair.

%% solution
class Animal:
    pass

class Mammal(Animal):
    pass

class Bird(Animal):
    pass

class Dog(Mammal):
    pass

class Eagle(Bird):
    pass

classes = {"Animal": Animal, "Mammal": Mammal, "Bird": Bird, "Dog": Dog, "Eagle": Eagle}

while True:
    line = input()
    if line == "done":
        break
    child, parent = line.split()
    if issubclass(classes[child], classes[parent]):
        print(f"{child} is a kind of {parent}")
    else:
        print(f"{child} is not a kind of {parent}")
%% tests
expect_output("Dog is a kind of Animal\nDog is not a kind of Bird\nAnimal is not a kind of Dog\nEagle is a kind of Eagle")
check(calls("issubclass"), "uses issubclass")
check(rerun("Eagle Animal\nBird Mammal\ndone").strip() == "Eagle is a kind of Animal\nBird is not a kind of Mammal", "two other pairs")
check(rerun("Mammal Mammal\nDog Mammal\ndone").strip() == "Mammal is a kind of Mammal\nDog is a kind of Mammal", "a class and its parent")
check(rerun("done").strip() == "", "no pairs, no output")
%% hint
Read a line, stop at `done`, and split the line into two names with `line.split()`.
%% hint
Look the two classes up in the dictionary: `classes[child]` and `classes[parent]`.
%% hint
`issubclass(classes[child], classes[parent])` answers the question. Use it as the condition of an `if` with two `print` branches.
%% end

%% exercise bank-accounts | Challenge: Three kinds of account
Write a class `Account(owner, balance=0)` with `deposit(amount)` and `withdraw(amount)`. A withdrawal of more than the balance raises `ValueError("not enough money")`. Then write two children:

- `SavingsAccount` adds a method `add_interest(percent)` that adds that percentage of the balance to the balance.
- `CheckingAccount(owner, balance=0, overdraft=0)` has an **overdraft** limit. It overrides `withdraw` so that the balance may go down to `-overdraft`. A larger withdrawal raises `ValueError("over the overdraft limit")`.

The code below the classes tries them out. It prints:

```output
220.0
-70
Error: over the overdraft limit
```
%% starter
# Write Account, SavingsAccount and CheckingAccount here.

savings = SavingsAccount("Ada", 200)
savings.add_interest(10)
print(savings.balance)
checking = CheckingAccount("Bob", 50, 100)
checking.withdraw(120)
print(checking.balance)
try:
    checking.withdraw(100)
except ValueError as e:
    print("Error:", e)

%% solution
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

class SavingsAccount(Account):
    def add_interest(self, percent):
        self.balance += self.balance * percent / 100

class CheckingAccount(Account):
    def __init__(self, owner, balance=0, overdraft=0):
        super().__init__(owner, balance)
        self.overdraft = overdraft

    def withdraw(self, amount):
        if amount > self.balance + self.overdraft:
            raise ValueError("over the overdraft limit")
        self.balance -= amount

savings = SavingsAccount("Ada", 200)
savings.add_interest(10)
print(savings.balance)
checking = CheckingAccount("Bob", 50, 100)
checking.withdraw(120)
print(checking.balance)
try:
    checking.withdraw(100)
except ValueError as e:
    print("Error:", e)
%% tests
expect_output("220.0\n-70\nError: over the overdraft limit")
check(issubclass(SavingsAccount, Account) and issubclass(CheckingAccount, Account), "both kinds inherit from Account")
s = SavingsAccount("S", 100)
s.deposit(50)
expect(s.balance, 150, "deposit is inherited")
check(raises(ValueError, s.withdraw, 500), "a savings account cannot go below zero")
expect(s.owner, "S", "the owner is stored")
c = CheckingAccount("C")
expect(c.overdraft, 0, "the default overdraft")
check(raises(ValueError, c.withdraw, 1), "no overdraft, so no withdrawal from an empty account")
d = CheckingAccount("D", 0, 50)
d.withdraw(50)
expect(d.balance, -50, "the balance may reach the limit")
check(raises(ValueError, d.withdraw, 1), "one more is too much")
d.deposit(80)
expect(d.balance, 30, "deposit is inherited")
check(calls("super"), "CheckingAccount uses super() in __init__")
%% hint
`Account` stores the owner and the balance. `withdraw` checks `amount > self.balance` and raises the `ValueError` before it changes anything.
%% hint
`SavingsAccount` needs no `__init__`, only the new method. `CheckingAccount` needs its own `__init__`, which calls `super().__init__(owner, balance)` and then stores `self.overdraft`.
%% hint
The override in `CheckingAccount` raises when `amount > self.balance + self.overdraft`, with the message `over the overdraft limit`. Otherwise it subtracts the amount.
%% end

## What you learned

- **Inheritance** lets a class start from another class: `class Dog(Animal):` means a dog **is an** animal. The child gets all the attributes and methods of the parent, and it can add its own.
- Python looks for a name in the object, then in its class, then in the parents, and the **first match wins**. A child never changes its parent, and two children do not share their extras.
- **Overriding**: a method with the same name in the child replaces the parent's version for the child's objects.
- `super()` gives access to the parent's version. A child that writes its own `__init__` normally starts with `super().__init__(...)`, without `self`, and `super().method()` lets a child add to the parent's result.
- `isinstance(obj, Class)` is true for the class and for its children, `type(obj) is Class` only for the exact class, and `issubclass(A, B)` asks the same question about classes.
- Every class descends from `object`, which is where `__str__`, `__repr__` and `__eq__` come from before you override them.
- Use the **is-a test** ("a B is an A") before you inherit. A method written in the parent that calls `self.area()` finds the version of the child, which is polymorphism, the topic of the next lesson.
