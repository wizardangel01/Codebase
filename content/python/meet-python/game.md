---
title: Launch Control
engine: rover
---
You are the flight controller for a small rover on a faraway planet. The rover cannot think for itself. It does exactly what your Python program says, **one line at a time, from the top to the bottom**.

How to play:

- Read the mission, then write your commands in the editor. Each command goes on its own line.
- Press **Run**. The board replays what your rover did, step by step.
- Reach the green landing pad to clear the level. Fewer lines earn more stars.
- Stuck? Tap **Hint**. Hints appear one at a time, so you can stop as soon as you have enough.

%% level l1 | First steps
Your rover is parked on the left, **facing east** (to the right). The landing pad is three squares away.

The command `move()` drives the rover **one square forward**. Write it once for every square you want to travel. Do not forget the round brackets.

%% config
par: 3
%% map
#######
#.....#
#R..G.#
#.....#
#######
%% starter
# Drive the rover onto the green pad.

%% solution
move()
move()
move()
%% hint
The pad is three squares to the right, so the rover has to move three times.
%% hint
Each `move()` goes on its own line, like this:

```python
move()
move()
```
%% end

%% level l2 | Turning corners
Real routes have corners. `turn_right()` and `turn_left()` turn the rover on the spot, a quarter of a turn. They do not move it.

After a turn the rover **keeps facing the new way**, so the next `move()` drives in that direction. The order of your lines is the whole plan.

%% config
par: 7
%% map
########
#R....##
#####.##
#####G##
########
%% starter
# Drive east along the corridor, turn, then drive to the pad.

%% solution
move()
move()
move()
move()
turn_right()
move()
move()
%% hint
The rover starts facing east. Drive along the top corridor until you are above the pad.
%% hint
Four moves bring the rover to the column of the pad. Then it has to face **south**: that is a right turn.
%% hint
```python
move()   # four of these
turn_right()
move()   # then two of these
```
%% end

%% level l3 | Crystal hunt
Mission control wants the **blue crystal** on the way to the pad. `pick_up()` collects a crystal, but only when the rover is **standing on it**.

Python runs your lines in order, so think about where the rover is at each step. The crystal is on the route, so you can grab it without any detour.

%% config
par: 8
%% map
#######
#R.c..#
#.###.#
#....G#
#######
%% starter
# Collect the crystal, then park on the pad.

%% solution
move()
move()
pick_up()
move()
move()
turn_right()
move()
move()
%% hint
Move until you stand on the crystal. Only then call `pick_up()`.
%% hint
Two moves reach the crystal. After picking it up, drive to the right-hand end of the corridor, turn right and go down to the pad.
%% end

%% level l4 | Say hello
Your rover can talk. `say("text")` shows a message in a speech bubble, and it works like `print()`.

The text goes **between quotation marks**. Python treats it as a *string*, so it has to be spelled exactly as asked, with the same capital letters and punctuation.

Drive to the pad, then say `Hello, Earth!`

%% config
par: 7
expect_say: Hello, Earth!
%% map
#####
#R..#
###.#
###.#
###G#
#####
%% starter
# Drive to the pad, then say hello.

%% solution
move()
move()
turn_right()
move()
move()
move()
say("Hello, Earth!")
%% hint
First the route: two moves east, a right turn, then three moves south.
%% hint
The greeting is a string, so it needs quotation marks: `say("Hello, Earth!")`. Check the capital letters and the exclamation mark.
%% end

%% level l5 | Bug hunt
This program was written in a hurry and has **three bugs**. Run it, read what Python tells you and fix the bugs one at a time.

Python stops at the first problem it finds, so the bugs appear one after another. Some bugs shout (an error message). Others are silent, and you have to notice that the rover did something different from what you wanted.

%% config
par: 6
expect_say: Made it!
theme: lab
%% map
#####
#R..#
###.#
###G#
#####
%% starter
# Three bugs are hiding in this program.
move()
move()
Turn_right()
move()
move
say("Made it!)
%% solution
move()
move()
turn_right()
move()
move()
say("Made it!")
%% hint
Start at the top of the error message. Python tells you the line number and what it found.
%% hint
The text in a string must start **and** end with a quotation mark. Names are case sensitive: `Turn_right` and `turn_right` are different things.
%% hint
If the rover stops one square short, look for a command without round brackets. Writing `move` only names the command. `move()` runs it.
%% end

%% level l6 | Mission log
Good engineers explain their work. A **comment** is a line that starts with `#`. Python ignores it completely, but people can read it.

Write at least **three comment lines** that explain the route, for example one above each part of the journey. Comments do not count as lines of code, so they cost you no stars.

%% config
par: 9
comments: 3
%% map
#######
#R..###
###.###
###c.G#
#######
%% starter
# Mission log
# Write a comment for each part of the route.

%% solution
# Leg 1: drive east
move()
move()
# Leg 2: down to the crystal
turn_right()
move()
move()
pick_up()
# Leg 3: east to the pad
turn_left()
move()
move()
%% hint
Part one is two moves east. Then turn right and drive south to the crystal and pick it up.
%% hint
After the crystal the rover faces south. The pad is to the **east**, which is a left turn from there.
%% hint
Add comments such as `# Leg 1: drive east` on their own lines, above the commands they describe.
%% end

%% level l7 | Lava crossing
A river of lava splits the cave. The rover is **destroyed** if it rolls onto a lava square, and its battery has room for only **12 actions**. Moves, turns and pick-ups all use battery.

Find the gap in the lava, plan the whole route on paper first, then write it down. Every turn counts as an action.

%% config
par: 10
battery: 12
theme: dungeon
%% map
#######
#R.x..#
#..x..#
#.....#
#..x.G#
#######
%% starter
# Cross the lava river through the gap.

%% solution
turn_right()
move()
move()
turn_left()
move()
move()
move()
move()
turn_right()
move()
%% hint
The only safe crossing is the row without lava: the third row of the map.
%% hint
Go down two squares first. Turn so the rover faces east and drive across the gap, then turn south for the last square to the pad.
%% hint
Count your actions: the route needs exactly ten. Moves **and** turns use battery.
%% end

%% level l8 | Launch sequence
The final mission. Collect **both crystals**, then park on the launch pad. The rover must announce two messages **in this order**: `Crystals secured` after the last crystal, then `Liftoff!` on the pad.

Take your time and trace the route with your finger first. Then write the whole program from top to bottom. This is a long program. Later in the course you will learn how Python can do the repeating parts for you.

%% config
par: 16
expect_say: ["Crystals secured", "Liftoff!"]
%% map
#######
#R.c..#
#####.#
#G.c..#
#######
%% starter
# Launch sequence: two crystals, two messages, one pad.

%% solution
move()
move()
pick_up()
move()
move()
turn_right()
move()
move()
turn_right()
move()
move()
pick_up()
say("Crystals secured")
move()
move()
say("Liftoff!")
%% hint
The route is a snake: east along the top row, down on the right, then west along the bottom row.
%% hint
You pick up the first crystal after two moves. The second one is on the bottom row, below the first. The rover faces west there.
%% hint
Say `Crystals secured` right after the second `pick_up()`, and `Liftoff!` when you are on the pad.
%% end
