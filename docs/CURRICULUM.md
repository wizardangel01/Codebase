# Curriculum map: Python from Zero to Pro

This is the teaching order for the whole course. **It is a contract.** When you write a lesson, quiz, exercise or game, use only what is listed for the modules **before** yours and for the lessons **before** yours in your own module. Never use a later idea, even in a throwaway line of example code. If a module needs a tiny preview of something later, the map says so ("preview" or "mentioned"), and it must be one short paragraph that tells the learner a later module covers it properly.

The course has five **lines** (groups of modules, drawn as lines on a transit map), fifteen **modules**, four **lessons** in each module (plus a quiz, a cheat sheet and a game), and a **game** that ends every module.

| # | Module (folder) | Line | Level | Game | Engine |
| --- | --- | --- | --- | --- | --- |
| 1 | Meet Python (`meet-python`) | Foundations | beginner | Launch Control | rover |
| 2 | Data and variables (`data-and-variables`) | Foundations | beginner | Cargo Bay | judge |
| 3 | Decisions (`decisions`) | Foundations | beginner | Crystal Canyon | rover |
| 4 | Loops (`loops`) | Flow | beginner | Asteroid Maze | rover |
| 5 | Lists (`lists`) | Flow | beginner | Crew Roster | judge |
| 6 | Dictionaries and sets (`dicts-and-sets`) | Flow | intermediate | Signal Decoder | judge |
| 7 | Functions (`functions`) | Functions | intermediate | Pixel Painter | canvas |
| 8 | Text and files (`text-and-files`) | Functions | intermediate | Archive Vault | judge |
| 9 | Errors and debugging (`errors-and-debugging`) | Functions | intermediate | Bug Hunt | judge |
| 10 | Classes (`classes`) | Objects | intermediate | Robot Arena | arena |
| 11 | Inheritance (`inheritance`) | Objects | intermediate | Arena Tournament | arena |
| 12 | The standard library (`standard-library`) | Objects | intermediate | Data Detective | judge |
| 13 | Pythonic code (`pythonic-code`) | Pro | advanced | Code Golf | judge |
| 14 | Decorators and types (`decorators-and-types`) | Pro | advanced | Machine Shop | judge |
| 15 | Algorithms (`algorithms`) | Pro | advanced | Algorithm Gauntlet | judge |

## Module by module

### 1. Meet Python (`content/python/meet-python/`)

*Foundations line, beginner.* Run your first program, learn how Python reads your code line by line, and meet your first error messages.

**Assumed knowledge:** none. The learner has never programmed.

**Status: written.** What it covers: print() with strings and numbers; quotation marks and escapes (\n, \", \'); integers and floats; + - * / // % ** and order of operations; round(); comments (#); blank lines; print(sep=, end=); text + and * (join/repeat); how Python runs top to bottom; error messages (SyntaxError, NameError, TypeError, ZeroDivisionError, IndentationError) and logic errors.

**Game:** Launch Control (rover). Written. 8 levels: sequences of move() and turn_left()/turn_right(), say().

### 2. Data and variables (`content/python/data-and-variables/`)

*Foundations line, beginner.* Store information in variables, learn the basic kinds of data, and write programs that talk to the user.

**Assumed knowledge:** everything in module 1.

**Learners can afterwards:**

- Store values in variables and give them clear names
- Tell integers, floats, strings and booleans apart, and convert between them
- Read what a user types with input() and use it in calculations
- Build messages with f-strings and format numbers neatly
- Pick text apart with indexing, slicing and string methods

**Lessons** (file names are `<id>.md`):

1. `variables`, "Variables" (about 18 minutes). Give values names, change them, and watch Python keep track.
   *Covers:* assignment with =; naming rules and snake_case; reassigning; variables in expressions; augmented assignment (+= -= *= /= //= %= **=); multiple assignment (a, b = 1, 2) and swapping; a = b = 0; UPPER_CASE constants by convention; using python trace blocks to watch variables change; NameError from using a name before it exists.
2. `data-types`, "Kinds of data" (about 18 minutes). Meet integers, floats, strings and booleans, and convert between them.
   *Covers:* type(); int, float, str, bool, None; big integers and 1_000_000 underscores; True/False; True + True; converting with int(), float(), str(); int(3.9) truncates; ValueError from int("abc"); round().
3. `input`, "Talking to the user" (about 16 minutes). Read what the user types, convert it, and build small interactive programs.
   *Covers:* input(prompt) always returns text; int(input()), float(input()); reading several values from one line with .split() and converting each; small interactive programs (tip calculator, BMI, temperature converter, age in days); how the site feeds input (stdin="..." on run blocks).
4. `text-basics`, "Working with text" (about 20 minutes). Format output with f-strings, pick text apart with indexes and slices, and use string methods.
   *Covers:* f-strings and expressions inside {}; format specs (:.2f, :, :>8 :<8 :^8, :02d, :05.1f); len(); indexing s[0] s[-1]; slicing s[1:4] s[:3] s[::2] s[::-1]; strings are immutable; in for substrings; methods upper lower title capitalize strip lstrip rstrip replace count find startswith endswith isdigit isalpha; chaining methods; triple-quoted strings.

**Game:** "Cargo Bay", engine `judge`. Run the cargo bay of a space station: read details with input(), calculate, and print neat reports.

*Game notes:* ALREADY WRITTEN as content/python/data-and-variables/game.md (8 levels, judge io mode). Do not change it. Your lessons must teach everything it needs: int()/float() on input(), f-string formats :.2f and :02d, -= updates, .strip().title(), len(), slicing [:2] [-3:], .upper(), // and %.

### 3. Decisions (`content/python/decisions/`)

*Foundations line, beginner.* Make programs choose what to do, using comparisons, if statements and logic.

**Assumed knowledge:** everything in modules 1 to 2, all of the above.

**Learners can afterwards:**

- Compare values and get True or False
- Choose between actions with if, elif and else
- Combine conditions with and, or and not
- Write programs that respond differently to what the user types
- Avoid the usual mistakes: = instead of ==, wrong indentation, a missing colon

**Lessons** (file names are `<id>.md`):

1. `comparisons`, "True or False" (about 16 minutes). Compare values with ==, !=, <, > and friends, and meet the booleans.
   *Covers:* bool values; == != < > <= >=; = versus ==; comparing text (alphabetical, case-sensitive); chained comparisons 0 < x < 10; in and not in with strings; the float comparison trap (0.1 + 0.2 == 0.3) with round().
2. `if-statements`, "if, elif and else" (about 20 minutes). Run different code depending on a condition, and learn how indentation groups lines.
   *Covers:* the colon and 4-space indentation; if; else; elif chains (first match wins; order matters); nested if; pass; IndentationError and the missing-colon SyntaxError; even/odd with %; ticket price and grade-letter examples; planning with flowcharts written as text.
3. `logic`, "and, or, not" (about 18 minutes). Combine conditions, and learn what Python treats as true or false.
   *Covers:* and, or, not; truth tables; precedence (not, and, or) and parentheses; short-circuit evaluation; truthiness (0, "", None are false; if name:); the x == 1 or 2 mistake; conditional expressions (a if cond else b).
4. `decision-programs`, "Programs that decide" (about 20 minutes). Put it all together in small programs: grades, leap years, login checks and text adventures.
   *Covers:* design before coding; boundary testing; programs: grade calculator, ticket price, leap year, number classifier, login check, rock-paper-scissors for two typed answers, a small choose-your-own-adventure; input validation with if; a one-paragraph mention that match/case exists and is taught in module 13.

**Game:** "Crystal Canyon", engine `rover`. Your rover must cope with whatever it finds. Use if and sensors so one program works on every map.

*Game notes:* You write it. Rover engine (see docs/GAMES.md) with commands: sensors. Every level has two or three %% map sections (the same program is run on each; tabs show each map), so a fixed list of moves fails and a program that uses if/else succeeds. Cover: if on_crystal(): pick_up(); if/else with front_is_clear(); elif chains; and/or/not; has_key() and doors; nested if. NO loops (not taught yet), so keep maps short and the program a fixed list of if statements.

### 4. Loops (`content/python/loops/`)

*Flow line, beginner.* Repeat work without repeating yourself, with for loops, while loops and the patterns built from them.

**Assumed knowledge:** everything in modules 1 to 3, all of the above.

**Learners can afterwards:**

- Repeat code a set number of times with for and range()
- Keep going until a condition changes with while
- Use break and continue to control a loop
- Nest loops to draw grids and tables
- Apply loop patterns such as counting, totalling and searching

**Lessons** (file names are `<id>.md`):

1. `for-loops`, "for loops and range()" (about 18 minutes). Repeat code with for, and count with range().
   *Covers:* for i in range(n); range(start, stop, step); the loop variable; looping over the characters of a string; accumulating totals (total += i); _ as a throwaway name; counting down with a negative step; sum(range(...)); off-by-one errors; tracing loops with python trace.
2. `while-loops`, "while loops" (about 18 minutes). Repeat while a condition is true, and learn how to stop.
   *Covers:* while condition; counters; infinite loops (and the 10-second limit on this site); break; continue; while True with break; retry-until-valid input loops; sentinel values; choosing for versus while.
3. `nested-loops`, "Loops inside loops" (about 16 minutes). Nest one loop inside another to build tables, grids and patterns.
   *Covers:* nested for loops; multiplication tables; star patterns and pyramids; print(end=""); how many times the inner body runs (n * m); break and continue affect only the innermost loop.
4. `loop-patterns`, "Loop patterns" (about 20 minutes). Learn the handful of loop recipes behind most programs.
   *Covers:* counting matches; sums and averages; finding the largest and smallest by hand; building a string in a loop; searching with a found flag; FizzBuzz; prime check; digit sum; Collatz; the first use of import: import random, random.randint, random.seed (explain import in one paragraph; module 12 covers modules properly); a guess-the-number game; planning a loop by asking what changes each time.

**Game:** "Asteroid Maze", engine `rover`. Steer through asteroid mazes with loops. A few lines can cover a long route.

*Game notes:* You write it. Rover engine. Use for _ in range(n), while front_is_clear(), while not on_goal(), nested loops, loops with if inside, wall-following. Use config battery to make long hand-written routes impossible, par to reward short programs, and forbid/require (forbid: for/while in level 1 only if useful; require: while in later levels) to make learners practise loops. Use multiple maps per level so the program must be general.

### 5. Lists (`content/python/lists/`)

*Flow line, beginner.* Keep many values together in lists and tuples, change them, and loop over them.

**Assumed knowledge:** everything in modules 1 to 4, all of the above.

**Learners can afterwards:**

- Create lists and read or change items by position
- Add, remove, sort and search the items in a list
- Loop over lists with for, enumerate and zip
- Slice and copy lists without surprises
- Group related values in tuples and unpack them

**Lessons** (file names are `<id>.md`):

1. `list-basics`, "Lists" (about 20 minutes). Create lists, read items by position, and change them.
   *Covers:* list literals; indexing from 0 and negative indexes; len(); slicing; lists are mutable (item assignment); append extend insert remove pop clear; del; in; + and *; index() and count(); sort() and sorted(); reverse(); min max sum; lists of mixed types; IndexError.
2. `looping-lists`, "Looping over lists" (about 18 minutes). Visit every item, with positions, in pairs, and build new lists as you go.
   *Covers:* for item in items; why range(len(items)) is usually the wrong tool; enumerate(items, start=1); zip; building a new list in a loop (the filter and map patterns); sorted(items, reverse=True); sorted(words, key=len); creating a list from input().split(); " ".join(items).
3. `tuples-and-copies`, "Tuples, copies and nested lists" (about 18 minutes). Meet tuples, understand aliasing, and work with lists of lists.
   *Covers:* tuples (immutable, one-item tuple needs a comma); unpacking including a, *rest = items; swapping; tuples as records; returning more than one value (preview only); aliasing: b = a shares one list; copying with a[:], list(a), a.copy(); shallow copies of nested lists (copy.deepcopy mentioned); lists of lists as grids and grid[row][col]; the [[0] * 3] * 3 trap.
4. `list-recipes`, "List recipes" (about 20 minutes). Filtering, removing duplicates, stacks, queues and sorting records.
   *Covers:* filtering with a loop and if; removing duplicates while keeping order; list as a stack (append/pop) and queue (pop(0)); counting and searching; rotating and reversing; slicing with steps [::2] [::-1]; sorting lists of tuples; a mini project such as a to-do list or gradebook that reads input.

**Game:** "Crew Roster", engine `judge`. Keep the crew roster in order: build, sort, filter and search lists of names and numbers.

*Game notes:* You write it. Judge engine in io mode (see docs/GAMES.md): read lines or a line of numbers with input().split(), build lists, process them, print results. 8 levels from "print the second name" up to a boss level. NO functions or dicts (not taught yet).

### 6. Dictionaries and sets (`content/python/dicts-and-sets/`)

*Flow line, intermediate.* Look things up by name with dictionaries, and handle unique values with sets.

**Assumed knowledge:** everything in modules 1 to 5, all of the above.

**Learners can afterwards:**

- Store and look up data with dictionaries
- Add, change and remove entries safely
- Count and group data using dictionaries
- Use sets for unique values and fast membership tests
- Choose between lists, tuples, dictionaries and sets

**Lessons** (file names are `<id>.md`):

1. `dictionaries`, "Dictionaries" (about 20 minutes). Store values under keys, look them up, and loop over them.
   *Covers:* dict literals; d[key]; KeyError; get(key, default); adding and updating; del and pop; in checks keys; len; keys() values() items(); for k, v in d.items(); allowed key types (str, int, tuple); insertion order; nested dictionaries; dict(zip(a, b)); update(); merging with |.
2. `dict-patterns`, "Dictionary patterns" (about 20 minutes). Count, group, invert and sort: the recipes you will use all the time.
   *Covers:* counting with counts[k] = counts.get(k, 0) + 1; grouping into lists with setdefault; inverting a dictionary; max(d, key=d.get); sorted(d, key=d.get, reverse=True); lookup tables instead of long elif chains; a word-frequency project; dictionaries as records and lists of records.
3. `sets`, "Sets" (about 16 minutes). Keep only unique values and compare groups with set operations.
   *Covers:* set literals and set(); the empty-set trap {} is a dict; uniqueness; add remove discard; in is fast; | & - ^ and the union/intersection/difference/symmetric_difference/issubset methods; removing duplicates with set(items); sets have no order or index; sorted(a_set); sets of tuples; frozenset mentioned only.
4. `choosing-containers`, "Choosing the right container" (about 18 minutes). Pick the best of lists, tuples, dictionaries and sets, and model real data.
   *Covers:* a comparison table of list, tuple, dict and set; mutability and hashing; nesting containers to model real data (JSON-like); "which container for this job?" exercises; a mini project such as a contact book or inventory with an input loop; copying nested containers (deepcopy).

**Game:** "Signal Decoder", engine `judge`. Decode secret messages and track passengers with dictionaries and sets.

*Game notes:* You write it. Judge engine in io mode. 8 levels: look-ups, counting letters, grouping, inverting, unique visitors, set operations between two groups, a final decoder. NO functions yet.

### 7. Functions (`content/python/functions/`)

*Functions line, intermediate.* Package code into reusable functions with parameters and return values, and learn where names live.

**Assumed knowledge:** everything in modules 1 to 6, all of the above.

**Learners can afterwards:**

- Define and call functions with parameters
- Return values and tell return from print
- Use default, keyword and variable-length arguments
- Explain local and global scope
- Write a recursive function with a base case

**Lessons** (file names are `<id>.md`):

1. `defining-functions`, "Defining functions" (about 20 minutes). Name a block of code, give it inputs, and get an answer back.
   *Covers:* why functions (do not repeat yourself); def, calling, parameters versus arguments; return versus print; a function with no return gives None; early return; docstrings; functions calling functions; naming; tracing calls with python trace (frames panel).
2. `parameters`, "Parameters in depth" (about 20 minutes). Defaults, keywords, *args and **kwargs, and returning several values.
   *Covers:* positional and keyword arguments; default values; the mutable default trap; *args and **kwargs; keyword-only parameters; unpacking with *items and **options at the call; returning several values as a tuple and unpacking them.
3. `scope`, "Scope and functions as values" (about 18 minutes). Where names live, and how to pass functions around.
   *Covers:* local and global scope; the LEGB rule; the global keyword (and why to avoid it); shadowing built-ins by accident (list = [...]); functions are values (assign them, pass them in, store them in lists and dicts); lambda for small key functions with sorted/min/max; simple callbacks. (nonlocal and closures wait for module 14.)
4. `recursion`, "Recursion" (about 18 minutes). Functions that call themselves, and the call stack that makes it work.
   *Covers:* a function calling itself; base case and recursive case; factorial, countdown, sum of a list, palindromes, Fibonacci and why the naive version is slow; the call stack shown with python trace; RecursionError; Tower of Hanoi; when a loop is better.

**Game:** "Pixel Painter", engine `canvas`. Draw with code. Write functions that paint shapes, then reuse them to make pictures.

*Game notes:* Written by the canvas engine agent, who also writes this game.md (module.json lessons are yours).

### 8. Text and files (`content/python/text-and-files/`)

*Functions line, intermediate.* Process text like a pro, and read and write files, CSV and JSON data.

**Assumed knowledge:** everything in modules 1 to 7, all of the above.

**Learners can afterwards:**

- Clean, split and join text with string methods
- Read and write text files with open() and with
- Work with CSV and JSON data
- Search text with simple regular expressions
- Turn a text file into a summary report

**Lessons** (file names are `<id>.md`):

1. `string-methods`, "String methods" (about 20 minutes). Split, join, search and reshape text.
   *Covers:* split and join; splitlines; strip variants; find, index, rfind; replace; count; startswith/endswith (including a tuple of options); isalnum isspace and friends; partition; zfill ljust rjust center; str.format versus f-strings; ord and chr; a Caesar-cipher project; characters versus bytes (emoji); raw strings.
2. `files`, "Reading and writing files" (about 20 minutes). Open files safely, read them line by line, and write results.
   *Covers:* open(path, mode); modes r w a; the with statement; read(), readline(), readlines(); looping over a file; stripping newlines; write() and print(file=); encoding="utf-8"; pathlib.Path basics; handling FileNotFoundError (preview of try/except, explain in one short paragraph); how files work on this site: each run gets a fresh private folder, and lessons supply files with %% file blocks.
3. `csv-and-json`, "CSV and JSON" (about 20 minutes). Read and write the two most common data formats.
   *Covers:* csv.reader, DictReader, writer, DictWriter; io.StringIO to practise without files; converting strings to numbers; json.loads, dumps, load, dump; indent and sort_keys; how Python types map to JSON; nested data; a grades CSV report project.
4. `text-recipes`, "Text recipes" (about 18 minutes). Word counts, palindromes, anagrams, cleaning data and a first taste of regular expressions.
   *Covers:* word frequency with dicts; longest word; palindromes and anagrams (sorted, sets); cleaning messy input; templates; re.search, re.findall, re.sub, character classes, groups and greedy versus lazy; validating simple patterns; parsing a log file project.

**Game:** "Archive Vault", engine `judge`. Crack open the archive: read files, parse records and write clean reports.

*Game notes:* You write it. Judge engine in io mode with %% file sections providing the archive files (see docs/GAMES.md). 8 levels: count lines, find words, parse CSV rows, build JSON text, clean data, regex finds, a final report.

### 9. Errors and debugging (`content/python/errors-and-debugging/`)

*Functions line, intermediate.* Handle errors gracefully, find bugs methodically, and test your code.

**Assumed knowledge:** everything in modules 1 to 8, all of the above.

**Learners can afterwards:**

- Catch and handle exceptions with try and except
- Raise exceptions and validate input
- Debug with prints, the trace tool and a systematic method
- Write assert statements and small automatic tests
- Recognise the most common bug patterns

**Lessons** (file names are `<id>.md`):

1. `try-except`, "try and except" (about 20 minutes). Catch errors so a mistake does not end the program.
   *Covers:* reading a multi-frame traceback; the common exception types and their hierarchy; try/except/else/finally; except A and except (A, B); as e; why a bare except is a bad idea; EAFP versus LBYL; retry loops for input.
2. `raising`, "Raising exceptions" (about 18 minutes). Signal problems on purpose and check your inputs.
   *Covers:* raise ValueError("message"); re-raising; exception chaining with from; validating function arguments; assert with a message; raise or return None?; writing useful error messages. (Custom exception classes wait for module 11.)
3. `debugging`, "Debugging" (about 20 minutes). A calm, step-by-step method for finding and fixing bugs.
   *Covers:* reproduce, isolate, hypothesise, test; print debugging; the trace tool; rubber-duck explaining; commenting out to bisect; common bugs (off-by-one, wrong scope, changing a list while looping over it, mutable default argument, shadowing, = versus ==, text versus number from input()); logging module basics versus print; what a debugger (pdb) is, and that it is not available in the browser.
4. `testing`, "Testing your code" (about 18 minutes). Prove your functions work with assert, unittest and doctest.
   *Covers:* why test; assert-based tests; unittest.TestCase with assertEqual/assertRaises and unittest.main(exit=False); doctest; test-first development in a small project; edge cases (empty, zero, negative, huge, wrong type); tests as documentation.

**Game:** "Bug Hunt", engine `judge`. The station software is full of bugs. Fix the code, and handle the errors it should expect.

*Game notes:* You write it. Judge engine, mostly script mode (see docs/GAMES.md). Each level starts with buggy starter code the learner must repair or harden; hidden tests probe edge cases and error handling (raises, try/except behaviour).

### 10. Classes (`content/python/classes/`)

*Objects line, intermediate.* Model things with classes: bundle data and behaviour into objects.

**Assumed knowledge:** everything in modules 1 to 9, all of the above.

**Learners can afterwards:**

- Define classes and create objects from them
- Use __init__, attributes and methods
- Customise printing and comparison with special methods
- Use properties, class methods and static methods
- Design a small program around objects

**Lessons** (file names are `<id>.md`):

1. `objects-and-classes`, "Objects and classes" (about 20 minutes). Meet objects, then build your own kinds of object.
   *Covers:* everything is an object (strings and lists have methods); class, __init__, self, attributes, methods; instances are independent; type() and isinstance(); examples Dog, BankAccount, Point; the forgotten self error.
2. `methods-and-state`, "Methods and state" (about 20 minutes). Objects that remember things and change over time.
   *Covers:* methods that change attributes; methods calling methods; class attributes versus instance attributes; __str__ and __repr__; default parameter values; objects inside lists and dicts; passing objects to functions; is versus ==.
3. `special-methods`, "Special methods and properties" (about 20 minutes). Make your objects work with len(), +, ==, < and friends, and guard attributes with properties.
   *Covers:* __eq__ __lt__ __len__ __getitem__ __contains__ __add__ __bool__ (and functools.total_ordering); @property with getter and setter; @classmethod for alternative constructors; @staticmethod; naming conventions _x and __x (name mangling).
4. `class-design`, "Designing with classes" (about 20 minutes). Turn a problem into classes, and use dataclasses to cut the boilerplate.
   *Covers:* nouns become classes and verbs become methods; encapsulation; composition (a Library has Books); @dataclass (fields, defaults, field(default_factory=...), order, frozen); refactoring procedural code into classes; mini projects: inventory, bank, shapes, tic-tac-toe board.

**Game:** "Robot Arena", engine `arena`. Build your own fighter class and send it into the arena.

*Game notes:* Written by the arena engine agent, who also writes this game.md (module.json lessons are yours). Learners define a class with __init__, attributes and methods that the arena calls.

### 11. Inheritance (`content/python/inheritance/`)

*Objects line, intermediate.* Reuse and extend classes with inheritance, polymorphism and composition.

**Assumed knowledge:** everything in modules 1 to 10, all of the above.

**Learners can afterwards:**

- Create subclasses and override methods
- Call parent behaviour with super()
- Use polymorphism and duck typing
- Write abstract base classes, custom exceptions and enums
- Choose between inheritance and composition

**Lessons** (file names are `<id>.md`):

1. `inheritance-basics`, "Inheritance" (about 20 minutes). Build new classes from existing ones.
   *Covers:* parent and child classes; class B(A); inherited attributes and methods; overriding; super() and super().__init__; isinstance and issubclass; object as the root; the is-a test; Animal to Dog and Cat, Shape to Circle and Rectangle.
2. `polymorphism`, "Polymorphism and duck typing" (about 18 minutes). Different objects, one interface.
   *Covers:* the same method name with different behaviour; loops over mixed objects; duck typing; abc.ABC and @abstractmethod; NotImplementedError; informal interfaces and protocols.
3. `composition-and-mixins`, "Composition, mixins and the MRO" (about 20 minutes). When not to inherit, and how multiple inheritance really works.
   *Covers:* has-a versus is-a; delegation; multiple inheritance; the method resolution order (__mro__); the diamond problem; mixin classes; super() with several parents; common pitfalls.
4. `exceptions-and-enums`, "Custom exceptions and enums" (about 18 minutes). Your own exception classes and named constants.
   *Covers:* class MyError(Exception); exception hierarchies; adding attributes to exceptions; raise ... from; enum.Enum, auto(), IntEnum, Flag basics; comparing enum members.

**Game:** "Arena Tournament", engine `arena`. Subclass your fighter, override its moves and win the tournament.

*Game notes:* Written by the arena engine agent, who also writes this game.md (module.json lessons are yours). Learners subclass a given or their own fighter, override methods and use super().

### 12. The standard library (`content/python/standard-library/`)

*Objects line, intermediate.* Meet the batteries that come with Python: modules, maths, dates, collections and more.

**Assumed knowledge:** everything in modules 1 to 11, all of the above.

**Learners can afterwards:**

- Import modules and write one of your own
- Use math, random and statistics for calculations
- Work with dates and times
- Use collections such as Counter, defaultdict and deque
- Read the documentation to learn a new module

**Lessons** (file names are `<id>.md`):

1. `modules-and-imports`, "Modules and imports" (about 18 minutes). Use other people's code, and organise your own.
   *Covers:* import, from ... import, as; dir() and help(); if __name__ == "__main__"; writing your own module (supply helpers.py in a lesson with %% file so import helpers works); packages in one paragraph; the file-named-random.py trap; the standard library versus third-party packages (pip is not available in the browser).
2. `math-random-statistics`, "Numbers: math, random and statistics" (about 18 minutes). Maths functions, random numbers and summary statistics.
   *Covers:* math (sqrt pi floor ceil isclose log trig gcd factorial comb); random (random randint choice choices shuffle sample seed); statistics (mean median mode stdev); decimal and fractions briefly; float comparison with math.isclose.
3. `dates-and-collections`, "Dates and collections" (about 20 minutes). datetime, Counter, defaultdict, deque, namedtuple and itertools.
   *Covers:* datetime date time datetime timedelta; strftime and strptime; weekday; timezone.utc; collections.Counter, defaultdict, deque, namedtuple; itertools (count cycle chain combinations permutations product groupby islice accumulate); heapq briefly.
4. `more-batteries`, "More batteries" (about 18 minutes). pathlib, functools, operator, textwrap, hashlib and how to read the docs.
   *Covers:* pathlib; functools (reduce partial lru_cache); operator.itemgetter and attrgetter; textwrap; string constants; time.perf_counter for timing; hashlib and uuid basics; reading docs.python.org effectively; what is not available in the browser (network, subprocess, threads).

**Game:** "Data Detective", engine `judge`. Solve cases with the standard library: dates, counters, random seeds and clever tools.

*Game notes:* You write it. Judge engine, script or function mode with %% prelude data (see docs/GAMES.md). 8 levels, each needs a different standard library tool.

### 13. Pythonic code (`content/python/pythonic-code/`)

*Pro line, advanced.* Write compact, idiomatic Python with comprehensions, generators, functional tools and clean style.

**Assumed knowledge:** everything in modules 1 to 12, all of the above.

**Learners can afterwards:**

- Build lists, dicts and sets with comprehensions
- Create lazy sequences with iterators and generators
- Use any, all, zip, map, filter and lambda fluently
- Apply pattern matching and unpacking
- Write clean code that follows PEP 8 and Python idioms

**Lessons** (file names are `<id>.md`):

1. `comprehensions`, "Comprehensions" (about 20 minutes). Build lists, dictionaries and sets in one expression.
   *Covers:* list comprehensions as map and filter; conditional expressions inside; nested loops in a comprehension; dict and set comprehensions; generator expressions; when a comprehension hurts readability; replacing loops.
2. `iterators-generators`, "Iterators and generators" (about 20 minutes). Produce values one at a time, lazily.
   *Covers:* iterable versus iterator; iter() and next(); StopIteration; how for works; yield and generator functions; infinite generators; yield from; generator pipelines; memory benefits; class-based iterators with __iter__ and __next__; itertools recap.
3. `functional-tools`, "Functional tools and pattern matching" (about 20 minutes). lambda, map, filter, any, all, unpacking, the walrus operator and match.
   *Covers:* lambda; map filter reduce; sorted and max with key; any and all; zip, enumerate and reversed; star unpacking in calls and assignments; the walrus operator :=; match/case with literal, sequence, mapping and class patterns and guards.
4. `clean-python`, "Clean, readable Python" (about 18 minutes). Style, docstrings and the idioms that make code a pleasure to read.
   *Covers:* PEP 8 (naming, spacing, line length); docstrings; small functions; magic numbers and constants; the with statement and writing context managers with __enter__/__exit__ and contextlib.contextmanager; the __main__ guard; f-string = debugging; truthiness idioms; a refactoring from messy to clean.

**Game:** "Code Golf", engine `judge`. Solve puzzles in as few lines as possible, using comprehensions and generators.

*Game notes:* You write it. Judge engine, script or function mode (see docs/GAMES.md). 8 levels where par is small and require/forbid push learners toward comprehensions, generators, any/all, zip and match.

### 14. Decorators and types (`content/python/decorators-and-types/`)

*Pro line, advanced.* Treat functions as values with closures and decorators, then describe your code with type hints.

**Assumed knowledge:** everything in modules 1 to 13, all of the above.

**Learners can afterwards:**

- Write closures that remember values
- Write and apply decorators, including ones with arguments
- Add type hints and know what they do and do not do
- Use dataclasses and the typing tools
- Use context managers and async/await at a basic level

**Lessons** (file names are `<id>.md`):

1. `closures`, "Closures and higher-order functions" (about 18 minutes). Functions that remember, and functions that build functions.
   *Covers:* first-class functions revisited; nested functions; closures capturing variables; nonlocal; function factories; the late-binding trap in loops; functions that take and return functions; functools.partial; callbacks.
2. `decorators`, "Decorators" (about 22 minutes). Wrap functions to add behaviour without changing them.
   *Covers:* a decorator is a function that wraps a function; the @ syntax; wrappers with *args and **kwargs; functools.wraps; timing, logging, caching and validation decorators; decorators with arguments; stacking decorators; class-based decorators; built-in decorators recap (property, staticmethod, classmethod, lru_cache).
3. `type-hints`, "Type hints and dataclasses" (about 20 minutes). Say what your code expects, and let tools check it.
   *Covers:* annotation syntax; list[int], dict[str, int], X | None, Callable, TypeVar and the def f[T](x: T) syntax, Protocol, TypedDict, Literal, Final; hints are not enforced at runtime; __annotations__; static checkers (mypy, pyright) run outside the browser; dataclasses with types (field, __post_init__, frozen, slots); NamedTuple.
4. `context-and-async`, "Context managers and async" (about 20 minutes). with statements for tidy resources, and a first look at async and await.
   *Covers:* what with does; contextlib.contextmanager, suppress; async def and await; asyncio.run, gather, sleep, tasks; async with and async for briefly; when async helps (waiting on I/O) and when not; pitfalls; top-level await works on this site.

**Game:** "Machine Shop", engine `judge`. Build decorators, closures and typed helpers that keep the station machines running.

*Game notes:* You write it. Judge engine in script mode (see docs/GAMES.md); tests use printed() and call counters to check decorators. 8 levels.

### 15. Algorithms (`content/python/algorithms/`)

*Pro line, advanced.* Think about speed and memory, and learn the classic ways to search, sort and solve problems.

**Assumed knowledge:** everything in modules 1 to 14, all of the above.

**Learners can afterwards:**

- Estimate how the work of an algorithm grows (Big-O)
- Implement linear and binary search
- Implement and compare basic sorting algorithms
- Solve problems with recursion, memoisation and dynamic programming
- Use stacks, queues, heaps, trees and graphs

**Lessons** (file names are `<id>.md`):

1. `efficiency`, "Measuring efficiency" (about 18 minutes). How to tell a fast algorithm from a slow one.
   *Covers:* what an algorithm is; counting operations; Big-O intuition (constant, log n, n, n log n, n squared, 2 to the n); timing with time.perf_counter and timeit; growth experiments; time versus memory; costs of common list, set and dict operations.
2. `search-and-sort`, "Searching and sorting" (about 22 minutes). Linear and binary search, and the classic sorting algorithms.
   *Covers:* linear search; binary search (iterative and recursive) and bisect; bubble, selection and insertion sort; merge sort; quicksort; Timsort and sorted(); stability; sorting with keys; counting sort in passing.
3. `recursion-and-dp`, "Recursion, memoisation and dynamic programming" (about 22 minutes). Solve big problems by solving small ones once.
   *Covers:* recursion trees; memoisation with a dict and functools.cache; bottom-up dynamic programming; Fibonacci, climbing stairs, coin change, longest common subsequence, knapsack; backtracking (permutations, subsets, a small n-queens); divide and conquer.
4. `data-structures`, "Stacks, queues, trees and graphs" (about 22 minutes). The structures behind most real programs.
   *Covers:* stack with a list; queue with collections.deque; priority queue with heapq; a linked list class; a binary tree class and its traversals; binary search trees; graphs as dict of lists; breadth-first and depth-first search; shortest path in an unweighted graph; Dijkstra with heapq introduced.

**Game:** "Algorithm Gauntlet", engine `judge`. Beat the gauntlet with correct and fast algorithms. Slow solutions run out of time.

*Game notes:* You write it. Judge engine, script or function mode (see docs/GAMES.md). Hidden tests use large inputs so naive solutions time out or hit recursion limits. 8 levels, the last is a boss that combines several techniques. Keep the whole run well under the 10 second limit for correct solutions.
