---
title: Crystal Canyon
engine: rover
---
Your rover has landed in **Crystal Canyon**, a maze of narrow passages. It cannot see the map the way you can. All it can do is **ask questions** about the squares around it, and then **decide** what to do with the answers.

Every mission is tested on **more than one map**, and your single program has to work on all of them. A fixed list of commands will crash on at least one map. Questions and `if` statements make one program flexible enough for every case.

How to play:

- Read the mission, then write your program in the editor.
- Press **Run**. The board replays what your rover did on the first map, and your program is then tried on the other maps as well.
- Every map must succeed to clear the level. Fewer lines earn more stars.
- The rover's questions are free. Its actions (moves, turns and pick-ups) use battery.
- Stuck? Tap **Hint**. Hints appear one at a time, so you can stop as soon as you have enough.

%% level l1 | Ask the rover
Mission control has a question for your rover: **is the way ahead clear?** The rover can work that out with `front_is_clear()`.

This is a **question**, not a command. It does not move the rover. It answers `True` when the next square is free and `False` when a rock, lava or a locked door is in the way. You can hand the answer to `say()`, and the rover will announce it.

Ask the question, drive two squares onto the pad and ask it again. The rover must say both answers, in that order.

%% config
commands: basic sensors
par: 4
expect_say: ["True", "False"]
%% map
#####
#R.G#
#####
%% starter
# Ask the question, move twice, ask again.

%% solution
say(front_is_clear())
move()
move()
say(front_is_clear())
%% hint
`front_is_clear()` goes inside the brackets of `say()`, like this: `say(front_is_clear())`.
%% hint
Do not put quotation marks around it. With quotation marks the rover would say the words instead of asking the question.
%% hint
Ask once at the start, then `move()` twice, then ask again. The second answer is `False`, because a rock waits behind the pad.
%% end

%% level l2 | Look before you leap
A command does something. A question gives an answer, and an `if` statement lets the rover act on that answer:

```python
if front_is_clear():
    move()
```

The rover moves **only when the answer is `True`**. The indented line belongs to the `if`, and the colon at the end of the first line is required.

This mission is tested on **two maps**. The first two squares are the same on both, but the pad is in a different place. Drive two squares, then look ahead: on one map you are already on the pad, and on the other it is one square further.

%% config
commands: basic sensors
par: 4
require: if
%% map Short corridor
######
#R.G##
######
%% map Long corridor
######
#R..G#
######
%% starter
# Drive two squares, then look before the last move.

%% solution
move()
move()
if front_is_clear():
    move()
%% hint
Both maps start the same way. Write two `move()` commands first.
%% hint
After two moves the rover is either on the pad or one square away from it. Ask `front_is_clear()`: on the short corridor a rock is ahead, on the long corridor the pad is ahead.
%% hint
```python
move()
move()
if front_is_clear():
    move()
```
%% end

%% level l3 | Fork in the road
At a fork the rover must choose a way. Add an `else` to say what happens when the answer to the `if` question is `False`:

```python
if left_is_clear():
    turn_left()
else:
    turn_right()
```

Exactly **one** of the two blocks runs. `else` has no question of its own, but it needs a colon too.

The rover starts facing **north**. After three squares the passage splits. On one map the pad is down the left branch, and on the other map it is down the right branch.

%% config
facing: north
commands: basic sensors
par: 9
require: if
%% map Left branch
#######
#G..###
###.###
###.###
###R###
#######
%% map Right branch
#######
###..G#
###.###
###.###
###R###
#######
%% starter
# Drive to the fork, then choose a branch.

%% solution
move()
move()
move()
if left_is_clear():
    turn_left()
else:
    turn_right()
move()
move()
%% hint
Three `move()` commands bring the rover to the fork. A rock waits straight ahead there.
%% hint
Ask `left_is_clear()`. When it is `True` turn left, otherwise turn right. Then drive two squares along the branch.
%% hint
The turn goes inside the `if` and `else` blocks. The last two `move()` commands come after the whole `if`/`else`, so they are not indented.
%% end

%% level l4 | Crossroads
Some crossroads have **three** choices. Chain a second question to an `if` with `elif`, which is short for "else if":

```python
if left_is_clear():
    turn_left()
elif right_is_clear():
    turn_right()
```

Python asks the first question. Only when the answer is `False` does it ask the next one. When **neither** answer is `True`, nothing happens and the rover keeps going straight on.

The mission is tested on **three maps**: the pad is up the left road, down the right road, or straight ahead. Write one program for all three.

%% config
commands: basic sensors
par: 7
require: if
%% map Left road
#######
###G###
#R..###
#######
#######
%% map Right road
#######
#######
#R..###
###G###
#######
%% map Straight on
#######
#######
#R..G##
#######
#######
%% starter
# Drive to the crossroads, then choose.

%% solution
move()
move()
if left_is_clear():
    turn_left()
elif right_is_clear():
    turn_right()
move()
%% hint
Two moves bring the rover to the crossroads on every map. The last command is a single `move()`.
%% hint
Ask the left question first, then the right question with `elif`. If the rover does not turn, it drives straight on with the final `move()`.
%% hint
```python
if left_is_clear():
    turn_left()
elif right_is_clear():
    turn_right()
```
%% end

%% level l5 | Crystal check
Crystals lie in the corridor, but not always on the same square. Calling `pick_up()` on an empty square wastes one unit of battery, and this rover has only **4 units**. Moves, turns and pick-ups cost one unit each.

Ask `on_crystal()` first, and pick up only when the answer is `True`:

```python
if on_crystal():
    pick_up()
```

Collect the crystal on both maps and park on the pad. A blind program that tries `pick_up()` after every move runs out of battery.

%% config
commands: basic sensors
battery: 4
par: 7
require: if
%% map Near crystal
######
#Rc.G#
######
%% map Far crystal
######
#R.cG#
######
%% starter
# Move, check for a crystal, move, check again, move.

%% solution
move()
if on_crystal():
    pick_up()
move()
if on_crystal():
    pick_up()
move()
%% hint
The pad is three squares away on both maps, so there are three `move()` commands. The crystal is on the first or on the second square you reach.
%% hint
Put an `if on_crystal():` check after the first move and another one after the second move.
%% hint
Count the battery: three moves and one pick-up use exactly four units. Every extra `pick_up()` would be one too many.
%% end

%% level l6 | Careful driver
Join questions with `and`, and flip an answer with `not`. This rule keeps the rover safe: **move only if the way is clear and the rover is not on the pad yet.**

```python
if front_is_clear() and not on_goal():
    move()
```

Both parts must be `True` for the move to happen. `on_goal()` is a question too. It answers `True` while the rover stands on the pad.

The pad is on a different square on each of the three maps, and the rover has to stop on it every time. Drive two squares, then use the rule twice.

%% config
commands: basic sensors
par: 6
require: and not
%% map Pad on the third square
########
#R.G...#
########
%% map Pad on the fourth square
########
#R..G..#
########
%% map Pad on the fifth square
########
#R...G.#
########
%% starter
# Two moves, then the safe rule twice.

%% solution
move()
move()
if front_is_clear() and not on_goal():
    move()
if front_is_clear() and not on_goal():
    move()
%% hint
On every map the pad is at least two squares away, so start with two plain `move()` commands.
%% hint
After that, the rover may need zero, one or two more moves. Write the safe rule twice, one after the other.
%% hint
The rule is `if front_is_clear() and not on_goal():` followed by an indented `move()`.
%% end

%% level l7 | Junction report
Mission control wants a **junction report**. A junction is a square with an opening on the left **or** on the right, or on both sides. Join two questions with `or`:

```python
if left_is_clear() or right_is_clear():
    say("Junction")
```

Drive to the pad. Each time the rover stands on a junction it must say `Junction`, and it must say **nothing else**. Every map has exactly two junctions, but they are in different places, so ask the question after every move.

This program is long and repetitive. That is normal at this stage. In the next module you will learn how to make Python repeat things for you.

%% config
commands: basic sensors
par: 10
require: or
expect_say: ["Junction", "Junction"]
exact_say: true
theme: dungeon
%% map Openings on both sides
#######
##.####
#R...G#
####.##
#######
%% map Two openings above
#######
###..##
#R...G#
###.###
#######
%% map Near the start
#######
###.###
#R...G#
##.####
#######
%% starter
# Move, ask, move, ask, move, ask, move.

%% solution
move()
if left_is_clear() or right_is_clear():
    say("Junction")
move()
if left_is_clear() or right_is_clear():
    say("Junction")
move()
if left_is_clear() or right_is_clear():
    say("Junction")
move()
%% hint
The rover needs four moves to reach the pad. The squares worth checking are the three it passes on the way.
%% hint
After each of the first three moves, ask `left_is_clear() or right_is_clear()` and say `Junction` when the answer is `True`.
%% hint
Do not ask on the starting square or on the pad. No map has an opening there.
%% end

%% level l8 | Canyon run
The final mission uses everything you have learnt. The rover must:

1. Check the first square for a crystal, and collect it if there is one.
2. Choose the left or the right branch at the fork.
3. Drive to the pad and say `Mission complete`, but **only** when it is on the pad **and** no crystals are left.

The crystal may or may not be there, and the pad is up one branch or down the other. That makes four maps, and one program has to cope with all of them.

%% config
commands: basic sensors
par: 12
require: and
expect_say: Mission complete
theme: lab
%% map Up, with a crystal
#####
###G#
###.#
#Rc.#
#####
#####
#####
%% map Up, no crystal
#####
###G#
###.#
#R..#
#####
#####
#####
%% map Down, with a crystal
#####
#####
#####
#Rc.#
###.#
###G#
#####
%% map Down, no crystal
#####
#####
#####
#R..#
###.#
###G#
#####
%% starter
# Crystal check, fork, pad, report.

%% solution
move()
if on_crystal():
    pick_up()
move()
if left_is_clear():
    turn_left()
else:
    turn_right()
move()
move()
if on_goal() and crystals_left() == 0:
    say("Mission complete")
%% hint
Break the mission into three parts: the crystal check after the first move, the fork after the second move, and the report on the pad.
%% hint
The fork is the same one you solved in the third mission. The branch is two squares long.
%% hint
The report needs two questions joined with `and`: `on_goal()` and `crystals_left() == 0`. A comparison gives `True` or `False`, the way a sensor does.
%% end
