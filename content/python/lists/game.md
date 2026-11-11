---
title: Crew Roster
engine: judge
---
Welcome to the crew quarters of the space station **Aurora**. The captain keeps a roster of everyone on board, and the station computer needs Python programs to keep it in order. Each level is one job, and every job is about **lists**.

How to play:

- Your program reads its information with `input()`. Every call to `input()` reads **one line** of what the test provides.
- It shows its answer with `print()`. The judge compares what you print with the expected output.
- Some tests are **hidden**. They use other values, so typing the answer from the example does not work. Write a program that works for any values.
- A line of names such as `Ada Grace Linus` becomes a list with `input().split()`. The items are still text, so use `int()` when you need numbers.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Second in command
Three crew members report for duty, **one name per line**. Read the three names into a list, and print the **second** one.

```text
Ada, Grace and Linus give Grace
```

Remember that the first item of a list has index 0.
%% config
mode: io
par: 2
%% in Ada, Grace and Linus
Ada
Grace
Linus
%% out
Grace
%% in Zed, Yuri and Xena
Zed
Yuri
Xena
%% out
Yuri
%% in hidden
Mia
Kit
Tom
%% out
Kit
%% starter
# Read three names into a list, then print the second one.

%% solution
crew = [input(), input(), input()]
print(crew[1])
%% hint
A list can be written with an `input()` call for each item: `crew = [input(), input(), input()]`.
%% hint
The second name has index 1, so print `crew[1]`.
%% end

%% level l2 | Last aboard
One line holds the names of the whole crew, separated by spaces. Print the **last** name on the first line, and the **number of names** on the second line.

```text
Ada Grace Linus
```

prints

```text
Linus
3
```
%% config
mode: io
par: 3
%% in Three names
Ada Grace Linus
%% out
Linus
3
%% in One name
Zed
%% out
Zed
1
%% in hidden
Kai Lee Mo Ng Ola
%% out
Ola
5
%% starter
# Split the line into a list of names.

%% solution
crew = input().split()
print(crew[-1])
print(len(crew))
%% hint
`input().split()` turns the line into a list of names.
%% hint
The index -1 is always the last item, and `len()` counts the items.
%% end

%% level l3 | Alphabetical order
The captain wants the roster in **alphabetical order**. Read a line of names and print them sorted, separated by single spaces. Every name starts with a capital letter, so the normal sort order is correct.

```text
Linus Ada Grace
```

prints `Ada Grace Linus`.
%% config
mode: io
par: 2
%% in Three names
Linus Ada Grace
%% out
Ada Grace Linus
%% in Two names
Zoe Yan
%% out
Yan Zoe
%% in hidden
Bo Al Cy Di
%% out
Al Bo Cy Di
%% starter
# Sort the names, then join them with spaces.

%% solution
crew = input().split()
print(" ".join(sorted(crew)))
%% hint
`sorted(crew)` gives a new list in alphabetical order.
%% hint
`print` would show brackets and quotes. Use `" ".join(...)` to make one line of text.
%% end

%% level l4 | Numbered roster
Print the roster as a numbered list. Read a line of names, and print each name on its own line, with its number **starting from 1**, a full stop and a space:

```text
1. Ada
2. Grace
3. Linus
```
%% config
mode: io
par: 3
%% in Three names
Ada Grace Linus
%% out
1. Ada
2. Grace
3. Linus
%% in One name
Solo
%% out
1. Solo
%% in hidden
a b c d
%% out
1. a
2. b
3. c
4. d
%% starter
# Number the names, starting at 1.

%% solution
crew = input().split()
for number, name in enumerate(crew, start=1):
    print(f"{number}. {name}")
%% hint
`enumerate(crew, start=1)` gives each name together with its number.
%% hint
`for number, name in enumerate(crew, start=1):` and an f-string inside the loop.
%% end

%% level l5 | Payroll
The first line holds the daily pay of each crew member, as whole numbers separated by spaces. Print the **total** on the first line and the **highest** pay on the second line, like this:

```text
Total: 450
Highest: 200
```
%% config
mode: io
par: 5
%% in Three pay slips
100 150 200
%% out
Total: 450
Highest: 200
%% in One pay slip
75
%% out
Total: 75
Highest: 75
%% in hidden
10 20 30 40 50
%% out
Total: 150
Highest: 50
%% starter
# Convert the words to numbers, then use sum and max.

%% solution
pay = []
for text in input().split():
    pay.append(int(text))
print("Total:", sum(pay))
print("Highest:", max(pay))
%% hint
The words from `split()` are text. Build a list of numbers with a loop and `int()`.
%% hint
`sum(pay)` and `max(pay)` do the calculations for you.
%% end

%% level l6 | Long shifts
Two lines arrive. The first holds the **names**, and the second holds the **hours** that each person worked (whole numbers, in the same order). Print the names of everyone who worked **at least 8 hours**, one per line, in the original order. If nobody did, print `Nobody`.

```text
Ada Grace Linus
9 7 8
```

prints

```text
Ada
Linus
```
%% config
mode: io
par: 8
%% in Two long shifts
Ada Grace Linus
9 7 8
%% out
Ada
Linus
%% in Nobody
Zed Yan
3 4
%% out
Nobody
%% in hidden
A B C D
8 8 2 10
%% out
A
B
D
%% starter
# zip walks through the names and the hours together.

%% solution
names = input().split()
hours = input().split()
chosen = []
for name, h in zip(names, hours):
    if int(h) >= 8:
        chosen.append(name)
print("\n".join(chosen) if chosen else "Nobody")
%% hint
Use `zip(names, hours)` to get each name together with its hours.
%% hint
Filter pattern: keep a second list, and append the name when `int(h) >= 8`.
%% hint
At the end print each chosen name on its own line, or `Nobody` when the list is empty. You can loop, or use `"\n".join(chosen)`.
%% end

%% level l7 | Duplicate badges
Badge numbers are scanned at the airlock, but some crew members scan twice. Read a line of badge numbers. Print the numbers **without repeats**, keeping the first scan of each, on the first line. On the second line print how many repeats were removed:

```text
7 3 7 9 3
```

prints

```text
7 3 9
Removed: 2
```
%% config
mode: io
par: 7
%% in Two repeats
7 3 7 9 3
%% out
7 3 9
Removed: 2
%% in No repeats
1 2 3
%% out
1 2 3
Removed: 0
%% in hidden
5 5 5 5
%% out
5
Removed: 3
%% starter
# Keep a badge only the first time you see it.

%% solution
badges = input().split()
unique = []
for badge in badges:
    if badge not in unique:
        unique.append(badge)
print(" ".join(unique))
print("Removed:", len(badges) - len(unique))
%% hint
Build a second list, and append a badge only when it is `not in` that list.
%% hint
The number of removed repeats is the original length minus the new length.
%% end

%% level l8 | Boss: Final roster
The captain wants the final duty roster. The **first line** holds the names, and some names appear more than once because people signed twice. The **second line** is a whole number `k`.

1. Remove the repeats, keeping the first appearance of each name. Print the names joined by commas.
2. Rotate that list **left by `k` places** and print it, joined by commas. The number `k` can be bigger than the number of names, so use the remainder after dividing by the length.
3. Print `Captain:` followed by the first name of the rotated list.

```text
Ada Grace Ada Linus Grace
1
```

prints

```text
Ada,Grace,Linus
Grace,Linus,Ada
Captain: Grace
```
%% config
mode: io
par: 11
%% in One place
Ada Grace Ada Linus Grace
1
%% out
Ada,Grace,Linus
Grace,Linus,Ada
Captain: Grace
%% in A big k
Zed Yan Xia
5
%% out
Zed,Yan,Xia
Xia,Zed,Yan
Captain: Xia
%% in hidden
Mo Mo Mo
4
%% out
Mo
Mo
Captain: Mo
%% in hidden
a b c d
0
%% out
a,b,c,d
a,b,c,d
Captain: a
%% starter
# Remove the repeats, rotate, report.

%% solution
names = input().split()
k = int(input())
crew = []
for name in names:
    if name not in crew:
        crew.append(name)
k = k % len(crew)
rotated = crew[k:] + crew[:k]
print(",".join(crew))
print(",".join(rotated))
print("Captain:", rotated[0])
%% hint
Combine two recipes: removing repeats, and rotating with `crew[k:] + crew[:k]`.
%% hint
Replace `k` with `k % len(crew)` before you rotate, so that a big `k` wraps around.
%% hint
Print with `",".join(...)`. The captain is the first item of the rotated list: `rotated[0]`.
%% end
