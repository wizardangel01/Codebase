---
title: Text recipes
---
%% file server.log
2026-03-04 08:15:02 INFO server started on port 8080
2026-03-04 08:15:09 INFO user ada logged in
2026-03-04 08:16:40 WARN disk almost full: 91 percent
2026-03-04 08:17:13 ERROR cannot open /data/report.csv
2026-03-04 08:17:15 INFO user grace logged in
2026-03-04 08:19:01 ERROR payment 4821 failed after 3 retries
2026-03-04 08:20:44 INFO user ada logged out
%% end

You now have a full toolbox for text: string methods, files, CSV and JSON. This lesson turns the tools into **recipes**, small programs that solve problems that come up again and again: counting words, checking palindromes and anagrams, cleaning messy input, filling in templates, and finding patterns with **regular expressions**. It ends with a log file analyser, which is a real job for these tools.

## Word frequency

Which words does a text use most? The recipe has three steps: make the text lower case, remove the punctuation, and count the words in a dictionary:

```python run
text = "The cat and the hat. The end!"
cleaned = ""
for ch in text.lower():
    if ch.isalpha() or ch == " ":
        cleaned += ch
counts = {}
for word in cleaned.split():
    counts[word] = counts.get(word, 0) + 1
for word in sorted(counts, key=counts.get, reverse=True):
    print(word, counts[word])
```

Words with the same count keep the order in which they first appeared, because `sorted` is stable.

## The longest word

`max` with `key=len` finds the longest word, and the first one wins a tie. To order by length first and alphabetically second, use a **tuple** as the key. Python compares the first items, and only looks at the second when the first are equal. The minus sign makes the longer words come first:

```python run
words = "the quick brown fox jumps over the lazy dog".split()
print(max(words, key=len))
print(sorted(words, key=lambda w: (-len(w), w)))
```

## Palindromes and anagrams

A palindrome reads the same in both directions. To test a whole phrase, throw away everything that is not a letter or a digit, and compare the result with its reverse:

```python run
def is_palindrome(text):
    letters = ""
    for ch in text.lower():
        if ch.isalnum():
            letters += ch
    return letters == letters[::-1]

for phrase in ["A man, a plan, a canal: Panama", "Hello", "Was it a car or a cat I saw?"]:
    print(is_palindrome(phrase), phrase)
```

Two words are **anagrams** when they use exactly the same letters. If you sort the letters of both words, anagrams give the same list:

```python run
print(sorted("listen") == sorted("silent"))
print(sorted("listen") == sorted("listed"))
```

%% question q-anagram-predict | predict
What does this program print?

```python
print(sorted("listen") == sorted("silent"))
```
%% answer
True
%% explain
Both words contain the letters e, i, l, n, s and t once each, so the sorted lists are the same. Two words are anagrams exactly when their sorted letters are equal.
%% end

The same idea groups a whole list of words. The sorted letters, joined into one string, make a perfect **key** for a dictionary:

```python run
words = ["listen", "silent", "enlist", "google", "gogole", "cat", "act"]
groups = {}
for word in words:
    key = "".join(sorted(word))
    groups.setdefault(key, []).append(word)
for key, group in groups.items():
    print(key, group)
```

## Cleaning messy input

Data from people is messy: extra spaces, odd capitals, symbols in phone numbers. Cleaning is nearly always the first step, and the string methods do most of the work:

```python run
raw = "  (0803) 111-2222  "
digits = ""
for ch in raw:
    if ch.isdigit():
        digits += ch
print(digits)

messy = "ADA   lovelace,London ,  uk"
cleaned = []
for part in messy.split(","):
    cleaned.append(" ".join(part.split()).title())
print(cleaned)
```

## Templates

A **template** is text with holes. With `format`, the holes are names in curly brackets, and the `**` operator spreads a dictionary into keyword arguments, so that every record can fill the same template:

```python run
template = "Dear {name}, you owe {amount:.2f} by {date}."
people = [
    {"name": "Ada", "amount": 12.5, "date": "Friday"},
    {"name": "Grace", "amount": 7, "date": "Monday"},
]
for person in people:
    print(template.format(**person))
```

## Regular expressions

String methods are good for fixed text. To find text by its **shape**, such as "four digits, a dash, two digits" or "a capital letter followed by lower case letters", you describe the shape with a **regular expression** (a **regex**), which is a small language of its own. Python's `re` module reads it. Write every pattern as a **raw string**, `r"..."`, so that Python leaves the backslashes alone.

`re.search(pattern, text)` looks for the first match anywhere in the text. It returns a **match object**, or `None` when nothing matches:

```python run
import re

text = "Order 4821 shipped on 2026-03-04"
match = re.search(r"\d+", text)
print(match)
print(match.group())
print(match.start(), match.end())
print(re.search(r"\d{5}", text))
```

`re.findall` returns **all** the matches as a list of strings, and `re.sub` replaces every match:

```python run
import re

text = "Order 4821 shipped on 2026-03-04 to box 17"
print(re.findall(r"\d+", text))
print(re.findall(r"[A-Z][a-z]+", "Ada met Grace in London"))
print(re.sub(r"\s+", " ", "too    many   spaces"))
print(re.sub(r"\d", "#", "card 4111 2222"))
```

%% question q-findall-predict | predict
What does this program print?

```python
import re

print(re.findall(r"\d+", "a1b22c333"))
```
%% answer
['1', '22', '333']
%% explain
The pattern `\d+` matches one or more digits in a row. The three runs of digits are `1`, `22` and `333`, and `findall` returns them as strings in a list.
%% end

## The building blocks

These pieces cover most patterns that you will write:

| Pattern | Matches |
| --- | --- |
| `.` | any character except a line break |
| `\d`, `\w`, `\s` | a digit, a word character (letter, digit or underscore), a white space character |
| `[aeiou]`, `[a-z]`, `[^0-9]` | one character from the set, from the range, or not from the set |
| `*`, `+`, `?` | zero or more, one or more, zero or one of the thing before |
| `{3}`, `{2,4}` | exactly three, or from two to four |
| `^`, `$` | the start and the end of the text |
| `(...)` | a **group**, which captures part of the match |

Two options written with a vertical bar, such as `cat|dog`, match either word. A backslash in front of a special character, such as `\.`, makes it match itself.

## Groups

Round brackets mark the parts that you want to take out of the match. `group(1)` is the text of the first pair of brackets, and `groups()` gives all of them:

```python run
import re

line = "2026-03-04 08:17:13 ERROR cannot open /data/report.csv"
match = re.search(r"(\d{4})-(\d{2})-(\d{2})", line)
print(match.group(0))
print(match.group(1), match.group(2), match.group(3))
print(match.groups())
```

## Greedy and lazy

Quantifiers such as `+` and `*` are **greedy**: they take as much text as they can. Adding a `?` after them makes them **lazy**, so that they take as little as possible:

```python run
import re

html = "<b>bold</b> and <i>italic</i>"
print(re.findall(r"<.+>", html))
print(re.findall(r"<.+?>", html))
```

The greedy pattern swallows everything from the first `<` to the very last `>`. The lazy pattern stops at the first `>` that it can.

%% question q-greedy-choice | choice
What does `re.findall(r"<.+?>", "<b>hi</b>")` return?
%% choice
`['<b>hi</b>']`
%% choice correct
`['<b>', '</b>']`
%% choice
`['b', '/b']`
%% choice
`[]`
%% explain
The `?` makes `.+` lazy, so each match ends at the first `>`. That gives the two tags `<b>` and `</b>`. The text `hi` between them is not inside any `<...>`. Without the `?`, the pattern would be greedy and return the whole text as one match.
%% end

## Validating a pattern

`re.fullmatch` succeeds only when the **whole** text fits the pattern, which is what validation needs:

```python run
import re

def valid_postcode(text):
    return re.fullmatch(r"[A-Z]{2}\d{2} \d[A-Z]{2}", text) is not None

for code in ["AB12 3CD", "ab12 3cd", "AB123CD"]:
    print(code, valid_postcode(code))
```

%% question q-fullmatch-multi | multi
Select every text that `re.fullmatch(r"[A-Z]{2}\d{2}", text)` accepts.
%% choice correct
`"AB12"`
%% choice correct
`"ZZ99"`
%% choice
`"ab12"`
%% choice
`"AB123"`
%% choice
`"A12"`
%% explain
The pattern wants exactly two capital letters followed by exactly two digits. Small letters, a third digit or a single letter do not fit, and `fullmatch` needs the whole text to fit.
%% end

## A small project: the log analyser

A server writes one line for every event, and `server.log` holds a few of them. Each line has a date, a time, a level and a message. The program counts the lines for each level, and lists the errors. The pattern `(\S+) (\S+) (\w+) (.*)` has four groups: two blocks without spaces, one word, and the rest of the line:

```python run
import re

counts = {}
errors = []
with open("server.log") as f:
    for line in f:
        match = re.match(r"(\S+) (\S+) (\w+) (.*)", line.strip())
        if match is None:
            continue
        date, time, level, message = match.groups()
        counts[level] = counts.get(level, 0) + 1
        if level == "ERROR":
            errors.append(time + " " + message)

for level in sorted(counts):
    print(level, counts[level])
print("Errors:")
for error in errors:
    print(" ", error)
```

`re.match` is like `search`, but the match must start at the **beginning** of the text. The line `if match is None: continue` skips lines that do not have the right shape, such as blank lines, instead of crashing. A short program such as this one is how real log files get summarised every day.

## Your turn

%% exercise word-counter | Different words
Read a line of text. Print how many **different** words it contains. Ignore capital letters and punctuation, so `The` and `the` are the same word, and a word such as `hat!` counts as `hat`. For the input `The cat, the hat!` the program prints:

```output
3
```
%% stdin
The cat, the hat!
%% starter
# Lower case, keep only letters and spaces, then count the different words.

%% solution
text = input().lower()
cleaned = ""
for ch in text:
    if ch.isalpha() or ch == " ":
        cleaned += ch
print(len(set(cleaned.split())))
%% tests
expect_output("3")
check(rerun("Hello, hello! HELLO.").strip() == "1", "capital letters and punctuation do not matter")
check(rerun("a b c").strip() == "3", "three different words")
check(rerun("Go go go, GO!").strip() == "1", "one word repeated")
%% hint
Make the text lower case first, and build a new text from the letters and spaces only.
%% hint
`cleaned.split()` gives the list of words.
%% hint
A set keeps each word once, so `len(set(words))` counts the different words.
%% end

%% exercise anagram-check | Anagram check
Read two lines. Print `anagrams` if the two texts use exactly the same letters, ignoring capital letters, spaces and punctuation, and `not anagrams` otherwise. For the input `Listen` and `Silent` the program prints:

```output
anagrams
```
%% stdin
Listen
Silent
%% starter
# Compare the sorted letters of both texts.

%% solution
def letters_of(text):
    letters = ""
    for ch in text.lower():
        if ch.isalpha():
            letters += ch
    return sorted(letters)

first = input()
second = input()
if letters_of(first) == letters_of(second):
    print("anagrams")
else:
    print("not anagrams")
%% tests
expect_output("anagrams")
check(rerun("Dormitory\nDirty room").strip() == "anagrams", "spaces are ignored")
check(rerun("abc\nabd").strip() == "not anagrams", "different letters")
check(rerun("aab\nab").strip() == "not anagrams", "same letters but different counts")
%% hint
Keep only the letters, in lower case, from each text.
%% hint
`sorted(letters)` gives a list that is the same for anagrams.
%% hint
Compare the two sorted lists with `==` and print the right answer.
%% end

%% exercise sum-numbers | Sum the numbers
Read a line of text and use the `re` module to find all the whole numbers in it (runs of digits). Print their sum, or `0` if there are none. A minus sign does not count as part of a number. For the input `I have 3 cats and 12 dogs` the program prints:

```output
15
```
%% stdin
I have 3 cats and 12 dogs
%% starter
import re

# re.findall(r"\d+", text) finds the runs of digits.

%% solution
import re

total = 0
for text in re.findall(r"\d+", input()):
    total += int(text)
print(total)
%% tests
expect_output("15")
check(calls("findall"), "uses re.findall")
check(rerun("no numbers here").strip() == "0", "no numbers")
check(rerun("a-5 and 7").strip() == "12", "a minus sign is ignored")
check(rerun("007 and 3").strip() == "10", "leading zeros are fine")
%% hint
The pattern `\d+` matches one or more digits in a row.
%% hint
`re.findall(r"\d+", line)` returns a list of strings. Convert each one with `int`.
%% hint
Add the numbers in a loop. When there are no matches, the total stays 0.
%% end

%% exercise log-summary | Challenge: Log summary
Read the name of a log file. Each line of the file has a date, a time, a level and a message, like the lines of `server.log` in this lesson. Print how many lines each level has, with the levels in alphabetical order, in the form `ERROR 2`. Then print the time of the first `ERROR` line in the form `First error at 08:17:13`. For the input `server.log` the program prints:

```output
ERROR 2
INFO 4
WARN 1
First error at 08:17:13
```
%% stdin
server.log
%% file other.log
2026-05-01 10:00:00 ERROR disk failure
2026-05-01 10:00:05 ERROR retry failed
2026-05-01 10:01:00 INFO recovered
%% starter
import re

# Read the file name, then go through the lines of that file.

%% solution
import re

name = input()
counts = {}
first_error = None
with open(name) as f:
    for line in f:
        match = re.match(r"(\S+) (\S+) (\w+) (.*)", line.strip())
        if match is None:
            continue
        date, time, level, message = match.groups()
        counts[level] = counts.get(level, 0) + 1
        if level == "ERROR" and first_error is None:
            first_error = time
for level in sorted(counts):
    print(level, counts[level])
print("First error at", first_error)
%% tests
expect_output("ERROR 2\nINFO 4\nWARN 1\nFirst error at 08:17:13")
check(rerun("other.log").strip() == "ERROR 2\nINFO 1\nFirst error at 10:00:00", "works for another file")
check(calls("open"), "opens the file")
%% hint
Open the file whose name was typed. Use the lines of the file, and split each into date, time, level and message.
%% hint
Count the levels in a dictionary. Remember the time of the first `ERROR` line only: store it when the variable is still `None`.
%% hint
After the loop, print the counts with `for level in sorted(counts):`, then the line with the time of the first error.
%% end

## What you learned

- Counting words is cleaning (lower case, letters only), splitting, and counting in a dictionary. `max(words, key=len)` finds the longest word, and a tuple key sorts by two criteria.
- Palindromes compare a cleaned text with its reverse. Anagrams have equal sorted letters, which also makes a good dictionary key for grouping.
- Cleaning messy input uses `strip`, `split`, `join`, `title` and loops over the characters. A template with `{name}` holes is filled with `template.format(**record)`.
- A regular expression describes the shape of text: `\d`, `\w`, `\s`, sets like `[a-z]`, quantifiers `*`, `+`, `?`, `{n}`, anchors `^` and `$`, and groups `( )`. Write patterns as raw strings.
- `re.search` and `re.match` return a match object or `None`, `re.findall` returns all matches, `re.sub` replaces them, and `re.fullmatch` checks the whole text.
- Quantifiers are greedy by default, and a `?` after them makes them lazy.
- A log analyser reads a file line by line, takes the lines apart with groups, and counts in a dictionary.
