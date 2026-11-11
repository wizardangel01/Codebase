---
title: Archive Vault
engine: judge
---
Deep under the city lies the **Archive Vault**. Its doors open only for keepers who can read the old records. Every level gives you some files, and your program has to open them, take them apart and report what is inside.

How to play:

- Your program reads the **name of a file** (and sometimes more) with `input()`, and then opens that file with `open()`. All the files of the level are in your program's folder.
- It shows its report with `print()`. The judge compares what you print with the expected output.
- Some tests are **hidden**. They use other files from the same folder, so a program that only fits the examples fails. Write a program that works for every file of that kind.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | The first door
The first door opens when you read the welcome message behind it. Read the **name of a file**, open it, and print everything that it contains. The files `door1.txt`, `door2.txt` and so on are in your folder. Use a `with` block.

```text
door1.txt gives
The vault is open.
Welcome, keeper of the archive.
```
%% config
mode: io
par: 3
require: with
%% file door1.txt
The vault is open.
Welcome, keeper of the archive.
%% file door2.txt
Second door: the hall of scrolls
Mind the step
%% file door3.txt
Third door
The lamps are lit
The stairs go down
%% in First door
door1.txt
%% out
The vault is open.
Welcome, keeper of the archive.
%% in Second door
door2.txt
%% out
Second door: the hall of scrolls
Mind the step
%% in hidden
door3.txt
%% out
Third door
The lamps are lit
The stairs go down
%% starter
# Read the file name, open the file, print its text.

%% solution
name = input()
with open(name) as f:
    print(f.read())
%% hint
`input()` gives you the name of the file as a string. Pass it straight to `open`.
%% hint
`with open(name) as f:` opens the file and closes it again at the end of the block.
%% hint
`f.read()` returns all the text of the file, so `print(f.read())` shows it.
%% end

%% level l2 | Count the scrolls
The scrolls are text files. Read the name of a file, and print how many lines it has and how many words, in this form. A blank line counts as a line, and it holds no words.

```text
scroll1.txt gives
Lines: 3
Words: 11
```
%% config
mode: io
par: 9
require: with
%% file scroll1.txt
The first scroll
tells of the river
and the old bridge
%% file scroll2.txt
One
Two words
Three words here
Four words are here
%% file scroll3.txt
Alpha beta

Gamma delta epsilon
%% in A short scroll
scroll1.txt
%% out
Lines: 3
Words: 11
%% in Four lines
scroll2.txt
%% out
Lines: 4
Words: 10
%% in hidden
scroll3.txt
%% out
Lines: 3
Words: 5
%% starter
# Count the lines and the words while you read the file.

%% solution
name = input()
lines = 0
words = 0
with open(name) as f:
    for line in f:
        lines += 1
        words += len(line.split())
print("Lines:", lines)
print("Words:", words)
%% hint
Start two counters at 0, one for the lines and one for the words.
%% hint
Loop with `for line in f:`. Add 1 to the line counter in every round.
%% hint
`len(line.split())` is the number of words in a line, and it is 0 for a blank line.
%% end

%% level l3 | The longest line
The keeper wants the longest line of a file. Read the name of a file. Print the longest line without its line break, and then its length. When two lines are equally long, the first one wins.

```text
quote2.txt gives
Longest: abcde
Length: 5
```
%% config
mode: io
par: 9
require: with
%% file quote1.txt
Knowledge is power
A book is a dream you hold in your hands
Read on
%% file quote2.txt
abcde
fghij
kl
%% file quote3.txt
To be
or not to be
that is the question
yes
%% in A long line in the middle
quote1.txt
%% out
Longest: A book is a dream you hold in your hands
Length: 40
%% in A tie
quote2.txt
%% out
Longest: abcde
Length: 5
%% in hidden
quote3.txt
%% out
Longest: that is the question
Length: 20
%% starter
# Remember the longest line so far.

%% solution
name = input()
longest = ""
with open(name) as f:
    for line in f:
        line = line.rstrip("\n")
        if len(line) > len(longest):
            longest = line
print("Longest:", longest)
print("Length:", len(longest))
%% hint
Keep a variable `longest`, which starts as an empty string.
%% hint
Remove the line break with `line.rstrip("\n")` before you measure the line.
%% hint
Replace `longest` only when `len(line) > len(longest)`. A tie then keeps the first line.
%% end

%% level l4 | The ledger
The ledger is a CSV file with the header `item,qty,price`. Some item names contain a comma and are written in quotation marks. Read the name of a file, and print the total cost, which is the sum of `qty` times `price` for every row, with two decimals.

```text
item,qty,price
tea,3,2.5
bread,2,4
milk,1,1.2
```

For `ledger1.txt`-style files like this one, the report is `Total: 16.70`.
%% config
mode: io
par: 7
require: with
%% file ledger1.csv
item,qty,price
tea,3,2.5
bread,2,4
milk,1,1.2
%% file ledger2.csv
item,qty,price
"Lamp, brass",1,19.99
Rope,4,2.25
%% file ledger3.csv
item,qty,price
Oil,10,0.5
Wick,100,0.05
Tin,2,3.1
%% in Plain items
ledger1.csv
%% out
Total: 16.70
%% in A comma in a name
ledger2.csv
%% out
Total: 28.99
%% in hidden
ledger3.csv
%% out
Total: 16.20
%% starter
# The csv module understands quoted values.

%% solution
import csv

name = input()
total = 0
with open(name, newline="") as f:
    for row in csv.DictReader(f):
        total += int(row["qty"]) * float(row["price"])
print(f"Total: {total:.2f}")
%% hint
A name such as `"Lamp, brass"` contains a comma, so `split(",")` is not enough. Use the `csv` module.
%% hint
`csv.DictReader(f)` gives each row as a dictionary with the keys `item`, `qty` and `price`.
%% hint
The values are text. Use `int(row["qty"]) * float(row["price"])`, add it to a total, and print with `f"Total: {total:.2f}"`.
%% end

%% level l5 | The visitors' book
The visitors' book has one name on every line, but the clerks were careless: extra spaces, odd capital letters, and even blank lines. Read the name of a file. Two names are the same visitor when they match after `strip()` and `title()`. Ignore blank lines. Print how many different visitors came, and the visitor who came most often with the number of visits. When visitors tie, print the one that comes first in the alphabet.

```text
Different: 3
Most visits: Ada (3)
```
%% config
mode: io
par: 10
require: with
%% file visitors1.txt
Ada
Grace
Ada
Linus
Grace
Ada
%% file visitors2.txt
  ada 
GRACE
Ada

grace  
Linus
%% file visitors3.txt
Zed
zed
Mia
MIA
mia
Kai
%% in A tidy book
visitors1.txt
%% out
Different: 3
Most visits: Ada (3)
%% in A messy book
visitors2.txt
%% out
Different: 3
Most visits: Ada (2)
%% in hidden
visitors3.txt
%% out
Different: 3
Most visits: Mia (3)
%% starter
# Clean every line, then count the names in a dictionary.

%% solution
name = input()
counts = {}
with open(name) as f:
    for line in f:
        visitor = line.strip().title()
        if visitor != "":
            counts[visitor] = counts.get(visitor, 0) + 1
best = sorted(counts, key=lambda v: (-counts[v], v))[0]
print("Different:", len(counts))
print(f"Most visits: {best} ({counts[best]})")
%% hint
`line.strip().title()` cleans a name, and an empty result means a blank line to skip.
%% hint
Count the clean names in a dictionary, with `counts.get(visitor, 0) + 1`.
%% hint
`sorted(counts, key=lambda v: (-counts[v], v))` puts the most frequent name first, and the alphabet breaks ties. Take item `[0]`.
%% end

%% level l6 | Seal the report
The archive wants a sealed report. Read the name of a file that holds one number per line (blank lines may appear). **Write** a file called `report.txt` with three lines: the count, the total and the average of the numbers. The total and the average have one decimal. Then open `report.txt` again, and print its content.

```text
Count: 3
Total: 16.0
Average: 5.3
```
%% config
mode: io
par: 12
require: with
%% file numbers1.txt
4
8
15
16
23
42
%% file numbers2.txt
2.5
3.5

10
%% file numbers3.txt
7
%% in Six numbers
numbers1.txt
%% out
Count: 6
Total: 108.0
Average: 18.0
%% in A blank line
numbers2.txt
%% out
Count: 3
Total: 16.0
Average: 5.3
%% in hidden
numbers3.txt
%% out
Count: 1
Total: 7.0
Average: 7.0
%% starter
# Read the numbers, write report.txt, then read report.txt.

%% solution
name = input()
numbers = []
with open(name) as f:
    for line in f:
        if line.strip():
            numbers.append(float(line))
with open("report.txt", "w") as f:
    print("Count:", len(numbers), file=f)
    print(f"Total: {sum(numbers):.1f}", file=f)
    print(f"Average: {sum(numbers) / len(numbers):.1f}", file=f)
with open("report.txt") as f:
    print(f.read())
%% hint
First collect the numbers in a list. Skip a line when `line.strip()` is empty, and use `float(line)` for the others.
%% hint
Open `report.txt` with mode `"w"`. Inside the block, `print(..., file=f)` writes one line.
%% hint
Use `len(numbers)`, `sum(numbers)` and `sum(numbers) / len(numbers)`. Format the last two with `:.1f`. Then open the file again and print `f.read()`.
%% end

%% level l7 | The guild list
The guild list is a JSON file: a list of members, and each member has a `name`, a `level` and a list of `skills`. Read the name of a file, and then a skill. Print the names of the members who have that skill, in alphabetical order, one per line. Then print `Total:` and the number of those members.

```text
members1.json and python give
Ada
Grace
Total: 2
```
%% config
mode: io
par: 12
require: with
%% file members1.json
[
  {"name": "Ada", "level": 3, "skills": ["python", "chess"]},
  {"name": "Grace", "level": 5, "skills": ["cobol", "python"]},
  {"name": "Linus", "level": 2, "skills": ["c", "git"]}
]
%% file members2.json
[
  {"name": "Zed", "level": 1, "skills": ["art", "music"]},
  {"name": "Mia", "level": 4, "skills": ["art"]},
  {"name": "Kai", "level": 2, "skills": ["music", "chess"]}
]
%% in Python users
members1.json
python
%% out
Ada
Grace
Total: 2
%% in One git user
members1.json
git
%% out
Linus
Total: 1
%% in hidden
members2.json
art
%% out
Mia
Zed
Total: 2
%% in hidden
members1.json
java
%% out
Total: 0
%% starter
# json.load(f) gives a list of dictionaries.

%% solution
import json

name = input()
skill = input()
with open(name) as f:
    members = json.load(f)
names = []
for member in members:
    if skill in member["skills"]:
        names.append(member["name"])
for n in sorted(names):
    print(n)
print("Total:", len(names))
%% hint
`json.load(f)` turns the file into a list of dictionaries.
%% hint
For each member, test `skill in member["skills"]`, and collect `member["name"]`.
%% hint
Print the names with `for n in sorted(names):`, and finish with `print("Total:", len(names))`.
%% end

%% level l8 | The master key
Boss level. The vault log records every use of a key. A line looks like `22:15:09 door 3 opened by key 17`, and a line can say `closed` instead of `opened`. Read the name of a log file. Count how many times each key **opened** a door. Print the keys that opened a door at least twice, one per line, in the form `key 17: 3`. The key with the most openings comes first, and equal counts are ordered by the key number. If no key qualifies, print `none`.

```text
vault1.log gives
key 17: 3
key 5: 2
```
%% config
mode: io
par: 17
require: with
%% file vault1.log
22:15:09 door 3 opened by key 17
22:15:40 door 1 closed by key 17
22:16:02 door 3 opened by key 5
22:17:30 door 2 opened by key 17
22:18:00 door 2 closed by key 5
22:19:12 door 1 opened by key 17
22:20:45 door 3 opened by key 5
%% file vault2.log
09:00:00 door 1 opened by key 8
09:05:00 door 2 opened by key 3
09:06:00 door 1 closed by key 8
%% file vault3.log
10:00:00 door 4 opened by key 12
10:01:00 door 4 opened by key 3
10:02:00 door 5 opened by key 12
10:03:00 door 5 opened by key 3
10:04:00 door 6 opened by key 40
%% file vault4.log
12:00:00 door 9 opened by key 100
12:01:00 door 9 closed by key 100
12:02:00 door 8 opened by key 100
12:03:00 door 7 opened by key 100
%% in Two busy keys
vault1.log
%% out
key 17: 3
key 5: 2
%% in Nobody twice
vault2.log
%% out
none
%% in hidden
vault3.log
%% out
key 3: 2
key 12: 2
%% in hidden
vault4.log
%% out
key 100: 3
%% starter
# A regular expression can take the key number out of a line.

%% solution
import re

name = input()
counts = {}
with open(name) as f:
    for line in f:
        match = re.search(r"opened by key (\d+)", line)
        if match:
            key = int(match.group(1))
            counts[key] = counts.get(key, 0) + 1
ranked = sorted(counts, key=lambda k: (-counts[k], k))
found = False
for key in ranked:
    if counts[key] >= 2:
        print(f"key {key}: {counts[key]}")
        found = True
if not found:
    print("none")
%% hint
`re.search(r"opened by key (\d+)", line)` matches only the lines with `opened`, and the group holds the key number.
%% hint
Turn the key into a number with `int(match.group(1))`, so that 5 sorts before 17. Count the openings in a dictionary.
%% hint
Rank the keys with `sorted(counts, key=lambda k: (-counts[k], k))`. Print the ones with a count of 2 or more, and print `none` if there were none.
%% end

