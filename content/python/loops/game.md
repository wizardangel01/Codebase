---
title: Asteroid Maze
engine: rover
---
Your rover has crash-landed in an **asteroid field**. The passages are long, and typing `move()` fifty times is no way to get home. You now have a much better tool: **loops**. A loop repeats lines for you, so a few lines of Python can drive the rover along a very long route.

Every mission is tested on the maps shown in its tabs, and one program has to work on all of them. The battery is limited, so a wasteful program will run out of power.

How to play:

- Read the mission, then write your program in the editor.
- Press **Run**. The board replays what your rover did on the first map, and your program is then tried on the other maps as well.
- Every map must succeed to clear the level. Fewer lines earn more stars.
- Stuck? Tap **Hint**. Hints appear one at a time, so you can stop as soon as you have enough.

%% level l1 | Repeat after me
The corridor is **eight squares** long. You could write `move()` eight times, but a `for` loop can do the repeating for you. Everything that is indented under the `for` line is repeated:

```python
for _ in range(3):
    move()
```

This loop runs `move()` three times. The underscore `_` is a name for "a number I do not need". Change the number so that the rover reaches the pad. A loop needs only two lines, so it earns the most stars.

%% config
par: 2
require: for
%% map
###########
#R.......G#
###########
%% starter
# Use a for loop to drive to the pad.

%% solution
for _ in range(8):
    move()
%% hint
The pad is eight squares away, so the loop has to run eight times.
%% hint
The number inside `range()` says how many times the loop runs. Keep the `move()` indented underneath the `for` line.
%% hint
```python
for _ in range(8):
    move()
```
%% end

%% level l2 | Staircase
A loop can repeat **several lines** at once. The route to the pad is a staircase, and every step is made of the same four commands: east, turn, south, turn back.

Find the pattern, count the steps and let a loop do the work. The rover starts facing east, and it must end up on the pad.

%% config
par: 5
require: for
%% map
#######
#R.####
##..###
###..##
####..#
#####G#
#######
%% starter
# One step of the staircase, repeated.

%% solution
for _ in range(4):
    move()
    turn_right()
    move()
    turn_left()
%% hint
One step is: move east, turn right, move south, turn left to face east again.
%% hint
Count the steps from the start to the pad. There are four of them.
%% hint
Put all four commands under one `for` line, each indented by the same amount.
%% end

%% level l3 | Until the wall
How long is the corridor? On each of these three maps it has a different length, so a loop with a fixed number cannot work for all of them.

A **`while` loop** repeats for as long as a question has the answer `True`:

```python
while <question>:
    <commands to repeat>
```

The rover's question `front_is_clear()` is `True` while the next square is free. The pad is at the end of the corridor on every map. Write one loop that reaches it on all three.

%% config
commands: basic sensors
par: 2
require: while
%% map Short corridor
#############
#R..G########
#############
%% map Medium corridor
#############
#R.....G#####
#############
%% map Long corridor
#############
#R.........G#
#############
%% starter
# Keep moving while the way is clear.

%% solution
while front_is_clear():
    move()
%% hint
Use the question `front_is_clear()` as the condition of a `while` loop.
%% hint
The body of the loop is a single `move()`. The loop stops by itself when a wall appears in front of the rover.
%% hint
```python
while front_is_clear():
    move()
```
%% end

%% level l4 | Find the pad
Now the road is always the same length, and the pad can be anywhere along it. The road carries on **past** the pad, so `front_is_clear()` would drive the rover straight over the target.

Ask a different question. `on_goal()` is `True` when the rover is standing on the pad. Put `not` in front of it to say "repeat until I have arrived", and use it as the condition of a `while` loop.

%% config
commands: basic sensors
par: 2
require: while
%% map Pad early
#############
#R..G.......#
#############
%% map Pad in the middle
#############
#R......G...#
#############
%% map Pad at the end
#############
#R.........G#
#############
%% starter
# Keep moving until the rover is on the pad.

%% solution
while not on_goal():
    move()
%% hint
The loop must run while the rover is **not** on the pad.
%% hint
The condition is `not on_goal()`. The body is a single `move()`.
%% hint
```python
while not on_goal():
    move()
```
%% end

%% level l5 | Crystal sweep
Crystals lie along the corridor, but never on the same squares. The battery holds only **12 units**, and every move and every pick-up costs one. The corridor needs 8 moves and each map has 3 crystals, so you have exactly one unit to spare. A rover that calls `pick_up()` on every square runs out of power.

Put a decision **inside** the loop. After each move, ask `on_crystal()`, and pick up only when the answer is `True`. Loops and `if` statements work together: the loop supplies the repeating, and the `if` supplies the choosing.

%% config
commands: basic sensors
battery: 12
par: 4
require: if
theme: lab
%% map Crystals early
###########
#Rc.c..c.G#
###########
%% map Crystals in the middle
###########
#R.c.cc..G#
###########
%% map Crystals at both ends
###########
#Rcc....cG#
###########
%% starter
# Repeat: move, then pick up only when standing on a crystal.

%% solution
while not on_goal():
    move()
    if on_crystal():
        pick_up()
%% hint
The loop can stop when the rover reaches the pad, so `while not on_goal():` fits again.
%% hint
Inside the loop, first `move()`. Then use an `if` to check `on_crystal()`.
%% hint
The `pick_up()` goes inside the `if`, so it is indented twice: once for the `while` and once for the `if`.
%% end

%% level l6 | Laps
The rover must drive once around a block of rock. Each side of the ring is **three squares** long. The crystals sit on two corners, and the pad is on the third corner.

The route repeats a pattern three times: drive three squares, pick up, turn. Inside that pattern, "drive three squares" repeats as well. That is a **loop inside a loop**. This mission allows only **5 lines**, so you have to nest your loops.

%% config
par: 5
max_lines: 5
require: for
theme: lab
%% map
######
#R..c#
#.##.#
#.##.#
#G..c#
######
%% starter
# Three sides: each side is three moves, a pick-up and a turn.

%% solution
for _ in range(3):
    for _ in range(3):
        move()
    pick_up()
    turn_right()
%% hint
The outer loop repeats once for each side of the ring that you drive. The rover starts facing east.
%% hint
The inner loop is `for _ in range(3):` with a single `move()` inside it. After it come `pick_up()` and `turn_right()`.
%% hint
The pad is on the third corner, so the outer loop runs three times. Calling `pick_up()` on the pad is harmless.
%% end

%% level l7 | Wall follower
Mazes can be solved without ever seeing the map: **keep your right hand on the wall**. At every step the rover asks three questions, always in this order:

1. Is the right side clear? Then turn right and move.
2. Otherwise, is the front clear? Then move forward.
3. Otherwise, turn left.

Wrap those questions in a `while` loop that runs until the rover is on the pad, and one short program solves both mazes. The rover may take a long walk around dead ends, so the battery is generous.

%% config
commands: basic sensors
battery: 250
par: 8
require: while
theme: dungeon
%% map Maze one
#########
#R.......#
#.#.###.#
#.#...#.#
#.###.#.#
#...#.#G#
#########
%% map Maze two
#########
#...#..R#
#.#.#.###
#.#.....#
#.#.###.#
#G#.#...#
#########
%% starter
# Follow the wall on the right-hand side.

%% solution
while not on_goal():
    if right_is_clear():
        turn_right()
        move()
    elif front_is_clear():
        move()
    else:
        turn_left()
%% hint
The loop condition is `not on_goal()`. Inside it you need an `if`, an `elif` and an `else`, one for each of the three questions.
%% hint
The first branch asks `right_is_clear()`, and its body has two commands: `turn_right()` and `move()`.
%% hint
```python
while not on_goal():
    if right_is_clear():
        turn_right()
        move()
    elif front_is_clear():
        move()
    else:
        turn_left()
```
%% end

%% level l8 | Asteroid Maze
The final maze hides **crystals** in its corners and dead ends. Mission control wants all of them, and then the rover has to park on the pad.

Use the wall follower again, and add a crystal check. This time the loop must not stop the first time the rover touches the pad. It should stop only when **both** things are true: the rover is on the pad **and** no crystals are left. The sensor `crystals_left()` tells you how many remain, so you can compare it with `0`.

The right-hand rule walks around the whole maze, so the rover will come back to the pad after it has collected everything.

%% config
commands: basic sensors
battery: 400
par: 10
require: while
theme: dungeon
%% map Maze one with crystals
#########
#R....c.#
#.#.###.#
#.#...#.#
#.###.#.#
#..c#c#G#
#########
%% map Maze two with crystals
#########
#...#..R#
#.#.#.###
#c#....c#
#.#.###.#
#G#c#...#
#########
%% starter
# Wall follower plus a crystal check.

%% solution
while not (on_goal() and crystals_left() == 0):
    if on_crystal():
        pick_up()
    if right_is_clear():
        turn_right()
        move()
    elif front_is_clear():
        move()
    else:
        turn_left()
%% hint
Start from your wall follower. Add an `if on_crystal(): pick_up()` at the top of the loop body.
%% hint
The loop condition describes when to stop. Say "stop when on the pad and no crystals are left", and then put `not` in front of the whole thing.
%% hint
`while not (on_goal() and crystals_left() == 0):` keeps the loop going until both conditions are true together.
%% end
