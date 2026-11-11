---
title: The standard library: module quiz
pass: 70
---
Twelve questions on everything in this module: importing and writing modules, the number tools, dates, the collections and itertools containers, and the other batteries. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | choice
A module ends with the lines `if __name__ == "__main__":` and `main()`. What is the purpose of that `if` line?
%% choice
It makes the module faster to import
%% choice correct
`main()` runs when the file is run directly, and does not run when another file imports the module
%% choice
It stops other files from importing the module
%% choice
It marks the function that Python must run first, as in other languages
%% explain
Python sets `__name__` to `"__main__"` in the file that you run, and to the module's own name when the file is imported. So the guard keeps the code that belongs to the program from running when someone only wants the functions of the module.
%% end

%% question q2 | predict
What does this program print?

```python
import math

print(math.ceil(-1.5), math.floor(-1.5), math.trunc(-1.5), round(-1.5))
```
%% answer
-1 -2 -1 -2
%% explain
`ceil` rounds toward plus infinity, so `-1.5` becomes `-1`. `floor` goes toward minus infinity, so it gives `-2`. `trunc` cuts off the decimals, which gives `-1`. The built-in `round` sends a tie to the even neighbour, and `-2` is even.
%% end

%% question q3 | multi
Select every call that **can** return the number 5.
%% choice correct
`random.randint(1, 5)`
%% choice correct
`random.choice([1, 3, 5])`
%% choice
`random.randrange(1, 5)`
%% choice
`random.randint(6, 10)`
%% choice
`random.shuffle([1, 3, 5])`
%% explain
`randint` includes both ends, so 5 is possible, and `choice` picks one item of the list. But `randrange(1, 5)` stops at 4, like `range`, and `randint(6, 10)` starts at 6. The function `shuffle` changes a list in place and returns `None`, not a number.
%% end

%% question q4 | predict
What does this program print?

```python
import statistics

data = [2, 4, 4, 10]
print(statistics.mean(data), statistics.median(data), statistics.mode(data))
```
%% answer
5 4.0 4
%% explain
The total is 20 for 4 numbers, so the mean is 5. With an even count, the median is the average of the two middle values, 4 and 4, which Python writes as `4.0`. The value 4 appears twice and every other value once, so 4 is the mode.
%% end

%% question q5 | fill
Fill in the blank so that the program prints `14`.

```python
from datetime import datetime

moment = datetime.___("2026-11-03 14:30", "%Y-%m-%d %H:%M")
print(moment.hour)
```
%% answer
strptime
%% expected
14
%% explain
The method that **parses** text into a datetime is `strptime`, and the pattern describes the text exactly. Its partner `strftime` goes the other way: it formats a datetime as text.
%% end

%% question q6 | predict
What does this program print?

```python
from collections import Counter

votes = Counter(["red", "blue", "red", "green", "blue", "red"])
print(votes.most_common(1), votes["yellow"])
```
%% answer
[('red', 3)] 0
%% explain
`most_common(1)` returns a list with the single biggest pair, which is `red` with 3 votes. A colour that was never counted has the count `0`, and the lookup does not raise a `KeyError`.
%% end

%% question q7 | choice
A program keeps the last 5 temperature readings. When a new reading arrives, the oldest one must drop out. Which tool fits best?
%% choice
`Counter`, because it counts the readings
%% choice
`defaultdict(list)`, because it creates the list by itself
%% choice correct
`deque(maxlen=5)`, because it forgets the oldest item when it is full
%% choice
`namedtuple`, because it gives each reading a name
%% explain
A deque with a `maxlen` is a window: adding a sixth item pushes the first one out, with no extra code. The other tools solve different problems: counting, grouping and naming fields.
%% end

%% question q8 | multi
Select every expression that makes a list of **exactly 12** results when it is turned into a list.
%% choice correct
`product("ABC", "1234")`
%% choice correct
`permutations("ABCD", 2)`
%% choice
`combinations("ABCD", 2)`
%% choice
`permutations("ABCD")`
%% choice
`product("AB", repeat=3)`
%% explain
Pairing 3 letters with 4 digits gives 3 times 4, which is 12. Taking 2 of 4 items with the order mattering gives 4 times 3, which is also 12. Choosing 2 of 4 without order gives only 6, all four items in every order give 24, and `repeat=3` over 2 letters gives 8.
%% end

%% question q9 | predict
What does this program print?

```python
from itertools import groupby

for key, group in groupby([1, 1, 2, 1], key=lambda n: n):
    print(key, len(list(group)))
```
%% answer
1 2
2 1
1 1
%% explain
The function `groupby` makes a new group every time the key **changes**. The data has a run of two 1s, then a 2, then another 1, so there are three groups, and the value 1 appears in two of them. Sorting the data first would join the 1s into one group.
%% end

%% question q10 | order
Put the lines in order so that the program prints `8 True`. One line does not belong.
%% lines
import hashlib
digest = hashlib.sha256("hi".encode()).hexdigest()
short = digest[:8]
print(len(short), short == digest[:8])
%% distractors
digest = hashlib.sha256("hi").hexdigest()
%% expected
8 True
%% explain
The import comes first, then the digest, then the short version that is cut from it, and the `print` comes last. The distractor passes a `str` straight to `sha256`, which raises a `TypeError`, because hashing needs bytes, and `.encode()` makes them.
%% end

%% question q11 | choice
The documentation gives the signature `statistics.stdev(data, xbar=None)`. What does it tell you about the call `statistics.stdev(scores)`?
%% choice
It is a mistake, because the parameter `xbar` is missing
%% choice correct
It is correct: `data` is required, and `xbar` has a default, so you can leave it out
%% choice
It is a mistake, because the value `None` must always be passed
%% choice
It returns the list of deviations, one for each score
%% explain
A parameter written with `=` in a signature has a default value, so it is optional. Only `data` has no default, so only `data` is required. The function returns one number, the standard deviation.
%% end

%% question q12 | predict
What does this program print?

```python
from operator import itemgetter

rows = [("Ben", 31), ("Ada", 36), ("Cy", 22)]
print(sorted(rows, key=itemgetter(1))[0], itemgetter(0, 1)(rows[1]))
```
%% answer
('Cy', 22) ('Ada', 36)
%% explain
Sorting by `itemgetter(1)` orders the rows by age, so the first row is the youngest, `('Cy', 22)`. Given two positions, `itemgetter(0, 1)` returns a tuple of both items of the row, which is `('Ada', 36)` for the second row.
%% end
