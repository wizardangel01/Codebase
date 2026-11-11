---
title: CSV and JSON
---
%% file grades.csv
name,maths,english
Ada,90,85
Grace,70,95
Linus,60,72
Margaret,88,91
%% end

%% file tricky.csv
name,city
"Smith, John","New York"
Ada,London
%% end

%% file library.json
{
  "name": "City Library",
  "open": true,
  "books": [
    {"title": "Dune", "year": 1965, "tags": ["scifi", "classic"]},
    {"title": "Emma", "year": 1815, "tags": ["classic"]}
  ]
}
%% end

Real data rarely arrives as a neat Python list. It arrives as a **file in a standard format**, and two formats cover most of what you will meet. **CSV** holds tables, such as an export from a spreadsheet. **JSON** holds structured data with lists inside dictionaries, such as the answers of a web service or the settings of an application. Python can read and write both with modules from its standard library, which you load with `import`.

## CSV: a table as text

A CSV file (comma separated values) has one row per line, and the values of a row are separated by commas. The first row usually holds the column names. This is `grades.csv`:

```python run
with open("grades.csv") as f:
    print(f.read())
```

You could cut each line with `split(",")`, and it often works. It fails as soon as a value **contains** a comma. CSV protects such a value with quotation marks, and `split` does not know about them:

```python run
line = '"Smith, John","New York"'
print(line.split(","))
```

The name was cut in two pieces and the quotation marks are still there. The `csv` module understands all the rules, so use it instead of splitting by hand.

## Reading with csv.reader

`csv.reader(f)` gives one **list of strings** for each row. Always open a CSV file with `newline=""`, so that the module sees the line breaks exactly as they are in the file:

```python run
import csv

with open("grades.csv", newline="") as f:
    rows = list(csv.reader(f))
print(rows[0])
print(rows[1])
print(len(rows))
```

Every value is **text**, even the numbers, so convert them before you calculate. The first row is the header, so a loop usually starts at `rows[1:]`:

```python run
import csv

total = 0
with open("grades.csv", newline="") as f:
    rows = list(csv.reader(f))
for row in rows[1:]:
    total += int(row[1])
print("Maths total:", total)
```

The reader also handles the tricky file correctly:

```python run
import csv

with open("tricky.csv", newline="") as f:
    for row in csv.reader(f):
        print(row)
```

## Reading with csv.DictReader

Remembering that the maths mark is `row[1]` is error-prone. `csv.DictReader` uses the header row as **keys**, so each row becomes a dictionary and you ask for columns by name:

```python run
import csv

with open("grades.csv", newline="") as f:
    for row in csv.DictReader(f):
        average = (int(row["maths"]) + int(row["english"])) / 2
        print(f"{row['name']}: {average}")
```

If the order of the columns changes, code that uses names still works. This is why `DictReader` is the usual choice for files with a header.

## Practising without a file

A **StringIO** object from the `io` module is a file made of text that lives in memory. It is perfect for trying things out, and for tests, because no real file is needed:

```python run
import csv
import io

text = "item,price\ntea,3.5\nbread,12.25\n"
for row in csv.DictReader(io.StringIO(text)):
    print(row["item"], float(row["price"]))
```

%% question q-csv-fill | fill
Fill in the blank so that the program prints `Ada`.

```python
import csv
import io

text = "name,age\nAda,36\n"
for row in csv.___(io.StringIO(text)):
    print(row["name"])
```
%% answer
DictReader
%% expected
Ada
%% explain
`DictReader` turns each row into a dictionary whose keys come from the header line, so `row["name"]` works. `csv.reader` would give a list, and a list cannot be indexed with a text key.
%% end

## Writing CSV

`csv.writer(f)` writes rows. The method `writerow` takes one list, and `writerows` takes a list of lists. The writer adds quotation marks when a value needs them:

```python run
import csv

rows = [["name", "city"], ["Smith, John", "New York"], ["Ada", "London"]]
with open("people.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

with open("people.csv") as f:
    print(f.read())
```

With `csv.DictWriter`, each row is a dictionary, and you say which `fieldnames` (columns) to write, in which order:

```python run
import csv

students = [
    {"name": "Ada", "average": 87.5},
    {"name": "Grace", "average": 82.5},
]
with open("report.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "average"])
    writer.writeheader()
    writer.writerows(students)

with open("report.csv") as f:
    print(f.read())
```

%% question q-csv-choice | choice
Why is `csv.reader` safer than `line.split(",")` for reading a CSV file?
%% choice
It converts the numbers automatically.
%% choice correct
It understands values in quotation marks that contain commas.
%% choice
It is the only way to read a file line by line.
%% choice
It sorts the rows.
%% explain
A comma inside a quoted value is part of the value, and not a separator. The `csv` module follows that rule, while `split` cuts at every comma. It does not convert numbers: every value is still text.
%% end

## A small project: the grades report

The pieces fit together in a report. The program reads the marks, calculates the average of each student, prints a table with the best student first, and saves the result as a new CSV file:

```python run
import csv

students = []
with open("grades.csv", newline="") as f:
    for row in csv.DictReader(f):
        maths = int(row["maths"])
        english = int(row["english"])
        students.append({"name": row["name"], "average": (maths + english) / 2})

students.sort(key=lambda s: s["average"], reverse=True)
for s in students:
    print(f"{s['name']:<10}{s['average']:>6.1f}")

with open("report.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "average"])
    writer.writeheader()
    writer.writerows(students)
print("Saved report.csv with", len(students), "students")
```

## JSON: structured data

JSON (JavaScript Object Notation) is a text format that looks very much like Python dictionaries and lists. Web services, apps and configuration files use it everywhere. The `json` module converts between Python values and JSON text:

| Python | JSON |
| --- | --- |
| dict | object, written `{...}` |
| list, tuple | array, written `[...]` |
| str | string, always in double quotes |
| int, float | number |
| True, False | true, false |
| None | null |

The function `json.dumps` ("dump to string") turns a Python value into JSON text, and `json.loads` ("load from string") turns JSON text into a Python value:

```python run
import json

data = {"name": "Ada", "age": 36, "languages": ["Python", "C"], "married": False, "partner": None}
text = json.dumps(data)
print(text)
print(type(text))
back = json.loads(text)
print(back == data)
```

For humans, `indent` spreads the text over several lines, and `sort_keys=True` puts the keys in order:

```python run
import json

data = {"name": "Ada", "languages": ["Python", "C"], "age": 36}
print(json.dumps(data, indent=2, sort_keys=True))
```

## What JSON cannot hold

JSON has fewer types than Python, so a round trip can change a value. A tuple becomes a list, and dictionary keys always become text:

```python run
import json

print(json.dumps({"point": (3, 4), 1: "one"}))
print(json.loads(json.dumps({"point": (3, 4)})))
```

Values with no JSON form, such as a set, raise an error. Malformed JSON, for example with single quotes, also raises one:

```python run error
import json

print(json.dumps({"tags": {"a", "b"}}))
```

```python run error
import json

print(json.loads("{'a': 1}"))
```

%% question q-json-predict | predict
What does this program print?

```python
import json

print(json.dumps({"a": (1, 2), "b": None, "c": True}))
```
%% answer
{"a": [1, 2], "b": null, "c": true}
%% explain
The tuple becomes an array, `None` becomes `null` and `True` becomes `true`. JSON text always uses double quotation marks for strings, and `dumps` writes a comma and a space between the items.
%% end

## JSON and files

For files, use `json.load(f)` and `json.dump(data, f)`, with no `s` at the end. This is `library.json`:

```python run
import json

with open("library.json") as f:
    library = json.load(f)
print(library["name"])
for book in library["books"]:
    print(book["title"], book["year"], len(book["tags"]))
```

The result is ordinary Python data, so you work with it like any other dictionary, with the same bracket paths that you learned for nested containers:

```python run
import json

with open("library.json") as f:
    library = json.load(f)
library["books"].append({"title": "Ulysses", "year": 1922, "tags": ["classic", "hard"]})
classics = []
for book in library["books"]:
    if "classic" in book["tags"]:
        classics.append(book["title"])
print(classics)
```

Writing is the same in the other direction. Reading the file back gives data that equals what you saved:

```python run
import json

settings = {"theme": "dark", "volume": 7, "favourites": ["Python", "Chess"]}
with open("settings.json", "w") as f:
    json.dump(settings, f, indent=2)
with open("settings.json") as f:
    print(f.read())
with open("settings.json") as f:
    print(json.load(f) == settings)
```

%% question q-json-multi | multi
Select every true statement about JSON.
%% choice correct
The keys of a JSON object are always strings.
%% choice correct
A Python tuple is written as a JSON array.
%% choice correct
`json.dumps(data)` returns a string.
%% choice
JSON can store a Python set.
%% choice
JSON text uses single quotation marks for strings.
%% explain
JSON strings and keys use double quotation marks, and a set has no JSON form. Tuples become arrays, which is why they come back as lists after a round trip.
%% end

## Which format should I use?

Use **CSV** for flat tables where every row has the same columns, especially when a spreadsheet is involved. Use **JSON** when the data is nested, when rows can have different fields, or when another program or a website needs it.

## Your turn

%% exercise sales-total | Sales total
The file `sales.csv` has the columns `item`, `qty` and `price`. Use the `csv` module to read it, and print the total revenue, which is the sum of `qty * price` for every row, with two decimals. The program prints:

```output
16.70
```
%% file sales.csv
item,qty,price
tea,3,2.5
bread,2,4
milk,1,1.2
%% starter
import csv

# Read sales.csv with csv.DictReader.

%% solution
import csv

total = 0
with open("sales.csv", newline="") as f:
    for row in csv.DictReader(f):
        total += int(row["qty"]) * float(row["price"])
print(f"{total:.2f}")
%% tests
expect_output("16.70")
check(calls("DictReader") or calls("reader"), "uses the csv module to read the file")
check(calls("open"), "opens the file")
%% hint
`csv.DictReader(f)` gives one dictionary for each row, with the keys `item`, `qty` and `price`.
%% hint
The values are text. Use `int(row["qty"])` and `float(row["price"])` before you multiply.
%% hint
Add `qty * price` to a total inside the loop, and print `f"{total:.2f}"` at the end.
%% end

%% exercise best-student | Best student
The file `grades.csv` from this lesson is in your folder, with the columns `name`, `maths` and `english`. Print the name of the student with the highest total of the two marks. The program prints:

```output
Margaret
```
%% starter
import csv

# Compare the totals maths + english.

%% solution
import csv

best_name = ""
best_total = -1
with open("grades.csv", newline="") as f:
    for row in csv.DictReader(f):
        total = int(row["maths"]) + int(row["english"])
        if total > best_total:
            best_total = total
            best_name = row["name"]
print(best_name)
%% tests
expect_output("Margaret")
check(calls("DictReader") or calls("reader"), "uses the csv module to read the file")
check(calls("open"), "opens the file")
%% hint
Keep the best total so far, and the name that goes with it.
%% hint
For each row, the total is `int(row["maths"]) + int(row["english"])`.
%% hint
When the total is bigger than the best so far, replace both the best total and the best name.
%% end

%% exercise json-profile | Save a profile
The dictionary `profile` is in the starter. Write it to a file called `profile.json` with `indent=2`, then read the file back with `json.load` and print how many hobbies it holds. The program prints:

```output
3
```
%% starter
import json

profile = {"name": "Ada", "age": 36, "hobbies": ["chess", "music", "running"]}
# Write profile.json, then read it back.

%% solution
import json

profile = {"name": "Ada", "age": 36, "hobbies": ["chess", "music", "running"]}
with open("profile.json", "w") as f:
    json.dump(profile, f, indent=2)

with open("profile.json") as f:
    loaded = json.load(f)
print(len(loaded["hobbies"]))
%% tests
import json
content = open("profile.json").read()
expect_output("3")
check(json.loads(content) == {"name": "Ada", "age": 36, "hobbies": ["chess", "music", "running"]}, "profile.json holds the profile")
check(content.count("\n") > 3, "the file is indented (indent=2)")
check(calls("dump"), "uses json.dump to write")
check(calls("load"), "uses json.load to read")
%% hint
`json.dump(profile, f, indent=2)` writes the dictionary into an open file.
%% hint
Open the file for writing with mode `"w"`, and later open it again for reading.
%% hint
`loaded = json.load(f)` gives a dictionary. Print `len(loaded["hobbies"])`.
%% end

%% exercise top-students | Challenge: Top students
Read `grades.csv` with `csv.DictReader`. Write a new file `top.csv` with the columns `name` and `total`, which holds the students whose total of maths and english is at least 170, with the highest total first. Then print how many students were written. The program prints:

```output
2
```
%% starter
import csv

# total = maths + english. Keep totals of 170 or more.

%% solution
import csv

students = []
with open("grades.csv", newline="") as f:
    for row in csv.DictReader(f):
        total = int(row["maths"]) + int(row["english"])
        if total >= 170:
            students.append({"name": row["name"], "total": total})

students.sort(key=lambda s: s["total"], reverse=True)
with open("top.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "total"])
    writer.writeheader()
    writer.writerows(students)
print(len(students))
%% tests
content = open("top.csv", newline="").read()
expect_output("2")
check(content.splitlines() == ["name,total", "Margaret,179", "Ada,175"], "top.csv has the header and the two students, best first")
check(calls("DictReader") or calls("reader"), "reads with the csv module")
check(calls("DictWriter") or calls("writer"), "writes with the csv module")
%% hint
Build a list of dictionaries such as `{"name": ..., "total": ...}` for the students who qualify.
%% hint
`students.sort(key=lambda s: s["total"], reverse=True)` puts the highest total first.
%% hint
Write with `csv.DictWriter(f, fieldnames=["name", "total"])`, then `writeheader()` and `writerows(students)`. Open the file with `newline=""`.
%% end

## What you learned

- CSV files hold tables as text. Use `csv.reader` (lists) or `csv.DictReader` (dictionaries, with the header as keys) to read them, and always open the file with `newline=""`.
- Every CSV value is a string, so convert numbers with `int` or `float`.
- `csv.writer` and `csv.DictWriter` write rows, adding quotation marks where needed. `DictWriter` needs `fieldnames` and `writeheader()`.
- `io.StringIO(text)` is a file made of text, handy for practice and tests.
- JSON turns dictionaries, lists, strings, numbers, booleans and `None` into text and back. `dumps` and `loads` work with strings, `dump` and `load` with files, and `indent` and `sort_keys` make the text readable.
- JSON has no tuples or sets, and its keys are always strings. Choose CSV for flat tables and JSON for nested data.
