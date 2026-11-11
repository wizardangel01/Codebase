---
title: Bug Hunt
engine: judge
---
The **Aurora** space station runs on Python, and its software is full of bugs. Every level gives you real station code with the bugs still in it. Your job is to run it, read what the tests tell you, and **repair** it. Some levels also ask you to **harden** the code, so that it handles the errors that it should expect.

How to play:

- Press **Run**. The result panel lists every test. A red test shows what was expected and what your code gave, or the error that stopped it, together with the line of your code.
- Some tests are **hidden**. They check the edge cases where bugs like to hide, so look for the cause of the bug, and do not only patch the visible examples.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Air check
The station's air monitor turns the oxygen percentage into a status word. The rules are:

| Oxygen | Status |
| --- | --- |
| below 19 | `"low"` |
| 19 to 23, **including both numbers** | `"normal"` |
| above 23 | `"high"` |

The function `air_status(percent)` is in the starter code, and it gives wrong answers at the edges. Press **Run**, read the failing tests, and fix it.
%% config
mode: script
function: air_status
par: 7
%% test A normal reading
expect(air_status(21), "normal")
%% test Low air
expect(air_status(12), "low")
%% test The lower edge
expect(air_status(19), "normal", "19 is normal")
%% test The upper edge
expect(air_status(23), "normal", "23 is normal")
%% test hidden Just outside the edges
expect(air_status(18.9), "low")
expect(air_status(23.1), "high")
%% test hidden The extremes
expect(air_status(0), "low")
expect(air_status(100), "high")
%% starter
def air_status(percent):
    if percent <= 19:
        return "low"
    elif percent < 23:
        return "normal"
    else:
        return "high"

%% solution
def air_status(percent):
    if percent < 19:
        return "low"
    elif percent <= 23:
        return "normal"
    else:
        return "high"
%% hint
Press Run and read the failing tests. Which numbers get the wrong word?
%% hint
The two edge numbers, 19 and 23, belong to `normal`. Look at the comparison signs in the two conditions.
%% hint
Use `percent < 19` for low, and `percent <= 23` for normal.
%% end

%% level l2 | Door code
The airlock keypad sends the code that a crew member typed. The door opens only for the code `4721`. Read the code, and print `OPEN` when it is right and `LOCKED` otherwise.

The starter never opens the door, and it would crash if someone typed letters. Convert the code to a number, and use `try` and `except` so that letters cannot stop the program.

```text
4721 gives OPEN
abc gives LOCKED
```
%% config
mode: io
par: 9
require: try
%% in The right code
4721
%% out
OPEN
%% in A wrong code
1234
%% out
LOCKED
%% in hidden
abc
%% out
LOCKED
%% in hidden
47.21
%% out
LOCKED
%% in hidden
-4721
%% out
LOCKED
%% starter
code = input()
if code == 4721:
    print("OPEN")
else:
    print("LOCKED")

%% solution
code = input()
try:
    number = int(code)
except ValueError:
    number = 0
if number == 4721:
    print("OPEN")
else:
    print("LOCKED")
%% hint
`input()` gives text, and the text `"4721"` is not equal to the number 4721.
%% hint
Convert with `int(code)`. It fails with a `ValueError` for letters, so put it in a `try` block.
%% hint
In the `except ValueError:` clause give the number a value that cannot open the door, such as 0. Then compare the number with 4721.
%% end

%% level l3 | Sensor log
The hull sensors send one temperature per line. Some lines are damaged and hold text such as `n/a`. Read lines until the line `end`. Print the **average of the good readings** with one decimal, and then the number of bad lines.

When there is no good reading at all, print `No data` instead of the average.

```text
12.5
n/a
14.5
end
```

gives

```text
Average: 13.5
Bad lines: 1
```

The starter crashes on the first damaged line.
%% config
mode: io
par: 17
require: try
%% in One damaged line
12.5
n/a
14.5
end
%% out
Average: 13.5
Bad lines: 1
%% in All good
20
22
24
26
end
%% out
Average: 23.0
Bad lines: 0
%% in hidden
n/a
???
end
%% out
No data
Bad lines: 2
%% in hidden
end
%% out
No data
Bad lines: 0
%% in hidden
1
x
2
y
3
z
end
%% out
Average: 2.0
Bad lines: 3
%% starter
total = 0
count = 0
while True:
    line = input()
    if line == "end":
        break
    total += float(line)
    count += 1
print(f"Average: {total / count:.1f}")

%% solution
total = 0
count = 0
bad = 0
while True:
    line = input()
    if line == "end":
        break
    try:
        total += float(line)
        count += 1
    except ValueError:
        bad += 1
if count == 0:
    print("No data")
else:
    print(f"Average: {total / count:.1f}")
print("Bad lines:", bad)
%% hint
`float(line)` raises a `ValueError` for text such as `n/a`. Catch that error, and count the damaged line.
%% hint
Put the two lines that use the reading in a `try` block, and add 1 to a `bad` counter in the `except` clause.
%% hint
When no reading was good, `count` is 0, and dividing by it raises a `ZeroDivisionError`. Test `count == 0` before the division.
%% end

%% level l4 | Fuel pump
The fuel pump must refuse nonsense. `fuel_needed(distance, efficiency)` returns the litres needed to fly `distance` kilometres with an engine that flies `efficiency` kilometres on one litre.

Make the function **raise a `ValueError`** in these two cases, and check the distance first:

| Problem | Message |
| --- | --- |
| the distance is negative | `distance cannot be negative, got ` and the distance |
| the efficiency is 0 or less | `efficiency must be more than 0, got ` and the efficiency |

A distance of 0 is allowed. For example, a distance of -5 gives the message `distance cannot be negative, got -5`.
%% config
mode: script
function: fuel_needed
par: 6
require: raise
%% test A normal trip
expect(fuel_needed(100, 25), 4)
%% test No distance
expect(fuel_needed(0, 10), 0)
%% test A negative distance
check(raises(ValueError, fuel_needed, -5, 10), "a negative distance should raise a ValueError")
%% test Zero efficiency
check(raises(ValueError, fuel_needed, 50, 0), "zero efficiency should raise a ValueError, not a ZeroDivisionError")
%% test hidden A negative efficiency
check(raises(ValueError, fuel_needed, 50, -2), "a negative efficiency should raise a ValueError")
%% test hidden The messages
try:
    fuel_needed(-5, 10)
except ValueError as e:
    expect(str(e), "distance cannot be negative, got -5")
else:
    check(False, "no exception for a negative distance")
try:
    fuel_needed(50, 0)
except ValueError as e:
    expect(str(e), "efficiency must be more than 0, got 0")
else:
    check(False, "no exception for zero efficiency")
%% starter
def fuel_needed(distance, efficiency):
    return distance / efficiency

%% solution
def fuel_needed(distance, efficiency):
    if distance < 0:
        raise ValueError(f"distance cannot be negative, got {distance}")
    if efficiency <= 0:
        raise ValueError(f"efficiency must be more than 0, got {efficiency}")
    return distance / efficiency
%% hint
Check the bad values before the division, and use `raise ValueError(...)` for each one.
%% hint
The message is an f-string that includes the bad value: `f"distance cannot be negative, got {distance}"`.
%% hint
Write two `if` statements, one for each rule, and keep the `return` as the last line.
%% end

%% level l5 | Cargo hold
The cargo hold keeps its weights in a list. `remove_heavy(weights, limit)` must **remove every weight above the limit from the list itself** and return that same list. A weight equal to the limit stays.

The starter skips some of the heavy items. Find out why, and repair it.
%% config
mode: script
function: remove_heavy
par: 5
%% test One heavy item
data = [5, 12, 3]
remove_heavy(data, 10)
expect(data, [5, 3])
%% test Two in a row
data = [5, 20, 30, 3]
expect(remove_heavy(data, 10), [5, 3])
%% test The list itself changes
data = [50, 60, 70]
result = remove_heavy(data, 10)
expect(data, [])
check(result is data, "return the same list that was passed in")
%% test hidden Equal to the limit stays
expect(remove_heavy([10, 10, 11, 10], 10), [10, 10, 10])
%% test hidden Nothing is heavy
expect(remove_heavy([1, 2, 3], 10), [1, 2, 3])
%% test hidden An empty hold
expect(remove_heavy([], 10), [])
%% test hidden A long run of heavy items
expect(remove_heavy([20, 30, 5, 40, 50, 6, 60], 10), [5, 6])
%% starter
def remove_heavy(weights, limit):
    for w in weights:
        if w > limit:
            weights.remove(w)
    return weights

%% solution
def remove_heavy(weights, limit):
    for w in weights[:]:
        if w > limit:
            weights.remove(w)
    return weights
%% hint
Add `print(w)` inside the loop to see which items it visits. Some of them never appear.
%% hint
Removing items from the list that the loop is walking along makes the loop skip the item that moves into the gap.
%% hint
Loop over a copy of the list, `for w in weights[:]:`, and remove the items from the original.
%% end

%% level l6 | Hull stress log
The stress monitor keeps a history of readings. `track(reading, history)` adds the reading to the history list, and returns a pair `(count, peak)`: the number of readings in the history, and the highest one. When the caller gives no history, every call must start with a **new, empty** one.

The starter has two different bugs. Press **Run** and read the error message first. When the first bug is gone, the second one shows itself in the tests.
%% config
mode: script
function: track
par: 5
%% test The first reading
expect(track(7.5), (1, 7.5))
%% test Two separate calls
expect(track(3), (1, 3))
expect(track(9), (1, 9), "a call without a history starts again")
%% test The caller's own history
h = [4, 8]
expect(track(6, h), (3, 8))
expect(h, [4, 8, 6])
%% test hidden The peak changes
h = []
track(2, h)
track(9, h)
expect(track(5, h), (3, 9))
%% test hidden A negative reading
expect(track(-3), (1, -3))
%% test hidden Calls do not share data
a = track(1)
b = track(2)
expect(a, (1, 1))
expect(b, (1, 2))
%% starter
def track(reading, history=[]):
    history.append(reading)
    max = history[0]
    for r in history:
        if r > max:
            max = r
    return len(history), max(history)

%% solution
def track(reading, history=None):
    if history is None:
        history = []
    history.append(reading)
    return len(history), max(history)
%% hint
The error says that a number is not callable. Which of your variables has the name of a built-in function?
%% hint
The variable `max` hides the function `max`. Rename the variable, or drop the loop and call `max(history)`.
%% hint
The second bug: a list used as a default value is created once and shared by all the calls. Use `history=None`, and create the list inside the function.
%% end

%% level l7 | Power meter
The battery software has two functions, and both must **give back** the new battery level.

- `charge(level, amount)` returns the level after charging. A battery never holds more than 100.
- `drain(level, amount)` returns the level after draining. It raises a `ValueError` with the message `not enough power` when the amount is more than the level.

Each function has its own bug. Read the error message and the failing tests, and repair both.
%% config
mode: script
function: charge
par: 8
%% test Charging
expect(charge(50, 20), 70)
%% test A full battery
expect(charge(90, 30), 100)
%% test Draining
expect(drain(80, 30), 50)
%% test Not enough power
check(raises(ValueError, drain, 10, 20), "draining more than the level should raise a ValueError")
%% test hidden Exactly empty
expect(drain(20, 20), 0)
%% test hidden Exactly full
expect(charge(70, 30), 100)
%% test hidden Nothing to add
expect(charge(40, 0), 40)
expect(drain(40, 0), 40)
%% test hidden The message
try:
    drain(5, 9)
except ValueError as e:
    expect(str(e), "not enough power")
else:
    check(False, "no exception")
%% starter
def charge(level, amount):
    if level + amount > 100:
        new_level = 100
    return new_level

def drain(level, amount):
    if amount > level:
        raise ValueError("not enough power")
    level - amount

%% solution
def charge(level, amount):
    if level + amount > 100:
        return 100
    return level + amount

def drain(level, amount):
    if amount > level:
        raise ValueError("not enough power")
    return level - amount
%% hint
In `charge`, the name `new_level` gets a value only when the battery overflows. What should the answer be in the other case?
%% hint
Decide what `charge` returns when the sum is 100 or less, and return it. A second `return` at the end does the job.
%% hint
In `drain`, the last line calculates `level - amount` and throws the answer away. A function that gives an answer needs `return`.
%% end

%% level l8 | Airlock controller
Final level. The airlock controller has three doors, numbered 1, 2 and 3, and they start **closed**. It reads one command per line until `quit`.

| Command | What it does |
| --- | --- |
| `open N` | opens door N and prints `Door N is now open` |
| `close N` | closes door N and prints `Door N is now closed` |
| `status` | prints one line for each door, such as `Door 1: closed` |

The crew make mistakes, and the controller must never crash. For a mistake it prints `Error:` and a message, and carries on with the next command:

| Mistake | Message |
| --- | --- |
| the door is already in that state | `door N is already open` or `door N is already closed` |
| there is no such door | `there is no door N` |
| no door number was given | `the command needs a door number` |
| the door number is not a whole number | `the door number must be a whole number` |
| any other command, such as `hello` | `unknown command: hello` |

The starter handles only the happy path, and it even invents doors that do not exist. Raise a `ValueError` for each mistake, and catch it in one place.
%% config
mode: io
par: 31
require: try raise
%% in Open and close
open 1
open 2
close 1
status
quit
%% out
Door 1 is now open
Door 2 is now open
Door 1 is now closed
Door 1: closed
Door 2: open
Door 3: closed
%% in Mistakes
open 2
open 2
close 3
open 7
open
open x
hello 1
status
quit
%% out
Door 2 is now open
Error: door 2 is already open
Error: door 3 is already closed
Error: there is no door 7
Error: the command needs a door number
Error: the door number must be a whole number
Error: unknown command: hello
Door 1: closed
Door 2: open
Door 3: closed
%% in hidden
open 1
open 3
close 2
close 1
open 4
open 1.5
status
quit
%% out
Door 1 is now open
Door 3 is now open
Error: door 2 is already closed
Door 1 is now closed
Error: there is no door 4
Error: the door number must be a whole number
Door 1: closed
Door 2: closed
Door 3: open
%% in hidden
open 0
open -1
quit
%% out
Error: there is no door 0
Error: there is no door -1
%% in hidden
quit
%% out

%% starter
doors = {1: "closed", 2: "closed", 3: "closed"}

while True:
    parts = input().split()
    command = parts[0]
    if command == "quit":
        break
    if command == "status":
        for number in doors:
            print(f"Door {number}: {doors[number]}")
    elif command == "open":
        number = int(parts[1])
        doors[number] = "open"
        print(f"Door {number} is now open")
    elif command == "close":
        number = int(parts[1])
        doors[number] = "closed"
        print(f"Door {number} is now closed")

%% solution
doors = {1: "closed", 2: "closed", 3: "closed"}

def change(parts, wanted):
    if len(parts) < 2:
        raise ValueError("the command needs a door number")
    try:
        number = int(parts[1])
    except ValueError:
        raise ValueError("the door number must be a whole number")
    if number not in doors:
        raise ValueError(f"there is no door {number}")
    if doors[number] == wanted:
        raise ValueError(f"door {number} is already {wanted}")
    doors[number] = wanted
    print(f"Door {number} is now {wanted}")

while True:
    parts = input().split()
    command = parts[0]
    if command == "quit":
        break
    try:
        if command == "status":
            for number in doors:
                print(f"Door {number}: {doors[number]}")
        elif command == "open":
            change(parts, "open")
        elif command == "close":
            change(parts, "closed")
        else:
            raise ValueError(f"unknown command: {command}")
    except ValueError as e:
        print("Error:", e)
%% hint
Put the work of `open` and `close` in one function, `change(parts, wanted)`, that raises a `ValueError` with the right message for each mistake.
%% hint
Inside it, check in this order: the command has a number, the number is a whole number (`int` in a `try` block), the door exists (`number not in doors`), and the door is not already in the wanted state.
%% hint
In the main loop, put the whole command handling in `try`, raise `ValueError(f"unknown command: {command}")` in the final `else`, and print `"Error:", e` in `except ValueError as e:`.
%% end

