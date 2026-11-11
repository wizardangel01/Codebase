---
title: Signal Decoder
engine: judge
---
You are the signal officer on the deep-space listening post **Echo**. Codes, messages, badges and crew lists arrive all day, and each one needs a small Python program that sorts it out. Dictionaries and sets are your tools.

How to play:

- Your program reads its information with `input()`. Every call to `input()` reads **one line** of what the test provides.
- It shows its answer with `print()`. The judge compares what you print with the expected output.
- Some tests are **hidden**. They use other values, so a program that only fits the examples fails. Write a program that works for any values.
- Many levels end their input with a line such as `end` or `stop`. Read the level text to see how your program knows that the input is over.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | Morse look-up
A letter arrives from the antenna. The dictionary `code` in your starter holds the Morse code of eight letters. Read one letter and print its code. A letter that is not in the table prints `?`.

```text
S gives ...
Z gives ?
```
%% config
mode: io
par: 3
%% in S
S
%% out
...
%% in B
B
%% out
-...
%% in hidden
Z
%% out
?
%% in hidden
T
%% out
-
%% starter
code = {"A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "O": "---", "S": "...", "T": "-"}
# Read the letter, then look it up.

%% solution
code = {"A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "O": "---", "S": "...", "T": "-"}
letter = input()
print(code.get(letter, "?"))
%% hint
Read the letter with `input()` and keep it in a variable.
%% hint
`code[letter]` works for the letters in the table, but a letter that is missing raises a KeyError.
%% hint
`code.get(letter, "?")` gives `?` for a missing letter, so you can print it directly.
%% end

%% level l2 | Decode a word
Now the antenna sends a whole word, written as Morse codes separated by spaces. The dictionary `letters` in your starter turns a code into a letter. Decode the word. A code that is not in the table becomes `?`.

```text
... --- ... gives SOS
```
%% config
mode: io
par: 5
%% in SOS
... --- ...
%% out
SOS
%% in BOAT
-... --- .- -
%% out
BOAT
%% in hidden
-.-. --- -.. .
%% out
CODE
%% in hidden
.- ..-. -
%% out
A?T
%% starter
letters = {".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "---": "O", "...": "S", "-": "T"}
# Split the line into codes, look each one up, and build the word.

%% solution
letters = {".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "---": "O", "...": "S", "-": "T"}
word = ""
for symbol in input().split():
    word += letters.get(symbol, "?")
print(word)
%% hint
`input().split()` gives the list of codes. Loop over it with `for`.
%% hint
Start with an empty text, `word = ""`, and add one letter in every round of the loop.
%% hint
`letters.get(symbol, "?")` is the letter for a code, or `?` when the code is unknown.
%% end

%% level l3 | Signal census
Signals arrive one per line until a line says `end`. Count how often each signal appears. Then print the census in alphabetical order, one signal per line, in the form `alpha 3`.

```text
beta, alpha, beta, end give
alpha 1
beta 2
```
%% config
mode: io
par: 8
%% in Two signals
beta
alpha
beta
end
%% out
alpha 1
beta 2
%% in One signal
ping
ping
ping
end
%% out
ping 3
%% in hidden
x
y
z
y
x
x
end
%% out
x 3
y 2
z 1
%% starter
# A dictionary from signal to count.

%% solution
counts = {}
while True:
    name = input()
    if name == "end":
        break
    counts[name] = counts.get(name, 0) + 1
for name in sorted(counts):
    print(name, counts[name])
%% hint
Start with an empty dictionary, and read lines in a `while True` loop that stops at `end`.
%% hint
The new count is `counts.get(name, 0) + 1`. Store it back under the same key.
%% hint
After the loop, `for name in sorted(counts):` visits the keys in alphabetical order.
%% end

%% level l4 | Channel groups
Messages arrive as `channel word`, for example `3 hello`, until a line says `end`. Group the words by channel. Print one line for each channel, with the smallest channel number first, in the form `3: hello world`. The words of a channel keep the order in which they arrived. Remember that channel 2 comes before channel 10.

```text
3 hello, 1 ping, 3 world, end give
1: ping
3: hello world
```
%% config
mode: io
par: 10
%% in Three messages
3 hello
1 ping
3 world
end
%% out
1: ping
3: hello world
%% in Big channel numbers
2 b
10 a
2 c
end
%% out
2: b c
10: a
%% in hidden
7 x
5 y
7 z
5 w
9 q
end
%% out
5: y w
7: x z
9: q
%% starter
# A dictionary from channel (a number) to a list of words.

%% solution
groups = {}
while True:
    line = input()
    if line == "end":
        break
    channel, word = line.split()
    groups.setdefault(int(channel), []).append(word)
for channel in sorted(groups):
    words = " ".join(groups[channel])
    print(f"{channel}: {words}")
%% hint
Split each line into the channel and the word. Turn the channel into a number with `int()`, so that 2 sorts before 10.
%% hint
`groups.setdefault(int(channel), []).append(word)` creates the list for a new channel and adds the word.
%% hint
After the loop, loop over `sorted(groups)` and join each list of words with `" ".join(...)`.
%% end

%% level l5 | Reverse directory
The station keeps a directory of `name code` lines, for example `alpha 17`, until a line says `end`. Every name has its own code, and no two names share a code. After that come lines that hold only a **code**, until a line says `stop`. For each code, print the name that owns it, or `unknown` if no name has that code.

```text
alpha 17, beta 4, end, then 4, 17, 99, stop give
beta
alpha
unknown
```
%% config
mode: io
par: 12
%% in Three lookups
alpha 17
beta 4
end
4
17
99
stop
%% out
beta
alpha
unknown
%% in Same code twice
sun 1
moon 2
star 3
end
3
3
1
stop
%% out
star
star
sun
%% in hidden
a 10
b 20
end
20
30
10
stop
%% out
b
unknown
a
%% starter
# Turn the directory around: a dictionary from code to name.

%% solution
names = {}
while True:
    line = input()
    if line == "end":
        break
    name, code = line.split()
    names[code] = name
while True:
    code = input()
    if code == "stop":
        break
    print(names.get(code, "unknown"))
%% hint
You need to look up a name from a code, so store the codes as the **keys**: `names[code] = name`.
%% hint
Two loops, one after the other. The first reads the directory until `end`, and the second answers the codes until `stop`.
%% hint
`names.get(code, "unknown")` is the name, or `unknown` for a code that nobody owns.
%% end

%% level l6 | Airlock log
The airlock logs the badge of everyone who passes through, one badge per line, until a line says `end`. Many people pass several times. Print how many **different** badges were logged, and on the next line the different badges in alphabetical order, separated by spaces.

```text
B7, A3, B7, C1, end give
Different: 3
A3 B7 C1
```
%% config
mode: io
par: 8
%% in Four passes
B7
A3
B7
C1
end
%% out
Different: 3
A3 B7 C1
%% in One badge
X
X
X
end
%% out
Different: 1
X
%% in hidden
K9
D2
K9
M5
D2
A1
end
%% out
Different: 4
A1 D2 K9 M5
%% starter
# A set keeps each badge once.

%% solution
seen = set()
while True:
    badge = input()
    if badge == "end":
        break
    seen.add(badge)
print("Different:", len(seen))
print(" ".join(sorted(seen)))
%% hint
Create an empty set with `set()`. Writing `{}` would make a dictionary.
%% hint
Add every badge with `seen.add(badge)`. A badge that is already there changes nothing.
%% hint
After the loop, `len(seen)` is the count, and `" ".join(sorted(seen))` is the sorted line.
%% end

%% level l7 | Two shifts
Two shifts work on the station. The first input line holds the crew of the **day** shift, and the second line the crew of the **night** shift, with names separated by spaces. A person can work both shifts, and a name can be typed more than once. Print four lines: who works both shifts, who works days only, who works nights only, and how many different people there are in total. Names are in alphabetical order, separated by spaces.

```text
Both: Grace Linus
Day only: Ada
Night only: Margaret Zed
Everyone: 5
```
%% config
mode: io
par: 6
%% in Shared crew
Ada Grace Linus
Grace Linus Margaret Zed
%% out
Both: Grace Linus
Day only: Ada
Night only: Margaret Zed
Everyone: 5
%% in No shared crew
Ada Bo
Cy Di
%% out
Both:
Day only: Ada Bo
Night only: Cy Di
Everyone: 4
%% in hidden
Zed Ada Zed Mia
Mia Ada Kai
%% out
Both: Ada Mia
Day only: Zed
Night only: Kai
Everyone: 4
%% starter
# Turn each line into a set, then use | & and -.

%% solution
day = set(input().split())
night = set(input().split())
print("Both:", " ".join(sorted(day & night)))
print("Day only:", " ".join(sorted(day - night)))
print("Night only:", " ".join(sorted(night - day)))
print("Everyone:", len(day | night))
%% hint
`set(input().split())` turns a line of names into a set, and a name typed twice counts once.
%% hint
`&` gives the people on both shifts, `-` gives one shift without the other, and `|` gives everyone.
%% hint
Print each line with `" ".join(sorted(...))`. The last line only needs `len(...)`.
%% end

%% level l8 | Final decoder
Boss level. A transmission arrives in two lines. The first line is a **codebook** of pairs `symbol=letter` separated by spaces, for example `a=H b=E`. The second line is the message, written with symbols and spaces. Print the decoded message: every known symbol becomes its letter, a space stays a space, and an unknown symbol becomes `?`. Then print `Unknown:` followed by the different unknown symbols in alphabetical order, separated by spaces. If every symbol was known, print `All symbols known` instead.

```text
a=H b=E c=L d=O and abccd give
HELLO
All symbols known
```
%% config
mode: io
par: 19
%% in Hello
a=H b=E c=L d=O
abccd
%% out
HELLO
All symbols known
%% in One unknown
s=S o=O
sos zo
%% out
SOS ?O
Unknown: z
%% in hidden
x=A y=B
xyz qzx
%% out
AB? ??A
Unknown: q z
%% in hidden
a=X
azaz zz
%% out
X?X? ??
Unknown: z
%% starter
# Build the codebook first. Then decode, and collect the unknown symbols in a set.

%% solution
book = {}
for pair in input().split():
    symbol, letter = pair.split("=")
    book[symbol] = letter
text = ""
unknown = set()
for symbol in input():
    if symbol == " ":
        text += " "
    elif symbol in book:
        text += book[symbol]
    else:
        text += "?"
        unknown.add(symbol)
print(text)
if unknown:
    print("Unknown:", " ".join(sorted(unknown)))
else:
    print("All symbols known")
%% hint
Split the first line into pairs, and split each pair at `=` with `pair.split("=")`. Store `book[symbol] = letter`.
%% hint
Loop over the characters of the second line. A space stays a space, a symbol in `book` becomes its letter, and anything else becomes `?` and goes into a set.
%% hint
At the end, print the text. Then print the sorted unknown symbols, or `All symbols known` when the set is empty.
%% end
