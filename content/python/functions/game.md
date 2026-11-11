---
title: Pixel Painter
engine: judge
---
Welcome to the **Pixel Painter** studio. The studio paints pictures with letters and symbols, and every picture is made by Python code. The art is only as good as the code behind it, so your job is to write **functions**: small named painters that you can use again and again.

How to play:

- Your program reads its information with `input()` and paints with `print()`. The judge compares your picture with the expected picture, **character by character**. Spaces at the start of a line matter.
- Many levels ask you to define a function. The level text says when, and the judge checks that your code really contains a `def`.
- Some tests are **hidden**. They use other sizes, so a program that only fits the examples fails. Write a program that works for any size.
- Fewer lines earn more stars. Stuck? Tap **Hint**, one hint at a time.

%% level l1 | First brush
The studio needs a test card. Read one character, the **paint**, and print a square that is 3 characters wide and 3 rows high, made of that paint. Print every row with its own `print`.

```text
# gives
###
###
###
```

Typing the same line three times is tiring. The next levels fix that with functions.
%% config
mode: io
par: 4
%% in Hash
#
%% out
###
###
###
%% in Star
*
%% out
***
***
***
%% in hidden
@
%% out
@@@
@@@
@@@
%% starter
# Read the paint, then print three rows.

%% solution
paint = input()
print(paint * 3)
print(paint * 3)
print(paint * 3)
%% hint
`paint * 3` repeats the text three times, so it makes one row.
%% hint
A square has three rows, so you need three `print` lines.
%% hint
`print(paint * 3)` three times is the whole answer. Notice the repetition: functions remove it in the next levels.
%% end

%% level l2 | A painter with a name
Typing the same lines again and again is tiring, so give them a name. Define a function called `square()` that prints a 3 by 3 square of `#`, followed by an empty line (`print()` with nothing inside the brackets). Then read a number `n` and paint `n` squares by calling the function `n` times. You must use `def`.

```text
2 gives
###
###
###

###
###
###
```
%% config
mode: io
par: 7
require: def
%% in One square
1
%% out
###
###
###
%% in Two squares
2
%% out
###
###
###

###
###
###
%% in hidden
3
%% out
###
###
###

###
###
###

###
###
###
%% starter
# Define square(), then call it n times.

%% solution
def square():
    print("###")
    print("###")
    print("###")
    print()

for _ in range(int(input())):
    square()
%% hint
Start with `def square():` and indent the body: three prints for the rows and an empty `print()`.
%% hint
A call is the name with brackets: `square()`.
%% hint
Read the number with `int(input())`, and loop with `for _ in range(n):` to call the function once in every round.
%% end

%% level l3 | Any size
A function can take inputs. Define `square(size)` that prints a square with `size` rows of `size` characters `#`, followed by an empty line. Read one line of sizes separated by spaces, and paint one square for each size. You must use `def`.

```text
2 3 gives
##
##

###
###
###
```
%% config
mode: io
par: 6
require: def
%% in Two sizes
2 3
%% out
##
##

###
###
###
%% in One and four
1 4
%% out
#

####
####
####
####
%% in hidden
5
%% out
#####
#####
#####
#####
#####
%% in hidden
4 2 1
%% out
####
####
####
####

##
##

#
%% starter
# square(size) prints size rows, then an empty line.

%% solution
def square(size):
    for _ in range(size):
        print("#" * size)
    print()

for text in input().split():
    square(int(text))
%% hint
The parameter `size` is both the number of rows and the width of each row.
%% hint
`print("#" * size)` prints one row. Put it in a loop that runs `size` times, and end the function with an empty `print()`.
%% hint
Split the input with `input().split()`, and call `square(int(text))` for each piece.
%% end

%% level l4 | Choose your paint
Define `rectangle(width, height, paint="#")`. It prints `height` rows of `width` characters of `paint`, followed by an empty line. Every input line holds a width and a height, and **sometimes** a third word, the paint. When the paint is missing, the function uses `#`. The input ends with a line that says `end`. You must use `def`.

```text
4 2, 3 1 * and end give
####
####

***
```
%% config
mode: io
par: 13
require: def
%% in Two rectangles
4 2
3 1 *
end
%% out
####
####

***
%% in Custom paint
2 3 o
end
%% out
oo
oo
oo
%% in hidden
5 1
1 2 @
end
%% out
#####

@
@
%% starter
# rectangle(width, height, paint="#") first. Then read lines until end.

%% solution
def rectangle(width, height, paint="#"):
    for _ in range(height):
        print(paint * width)
    print()

while True:
    line = input()
    if line == "end":
        break
    parts = line.split()
    if len(parts) == 3:
        rectangle(int(parts[0]), int(parts[1]), parts[2])
    else:
        rectangle(int(parts[0]), int(parts[1]))
%% hint
A parameter with a default value is written `paint="#"` in the definition, and it comes last.
%% hint
Split each line. With three parts, pass the third one as the paint. With two parts, leave the paint out.
%% hint
`rectangle(4, 2)` uses the default paint, and `rectangle(4, 2, "*")` replaces it.
%% end

%% level l5 | Frame it
Define a function `row(width, paint)` that **returns** a row of `width` characters of `paint`. It must return the text, not print it. Use it to paint a **frame**: the first and the last row are full of `#`, and every row in between has a `#` at each end and spaces in the middle. Read the width on the first line and the height on the second. The width is at least 3 and the height at least 2. You must use `def` and `return`.

```text
5 and 4 give
#####
#   #
#   #
#####
```
%% config
mode: io
par: 8
require: def return
%% in Five by four
5
4
%% out
#####
#   #
#   #
#####
%% in Three by three
3
3
%% out
###
# #
###
%% in hidden
8
2
%% out
########
########
%% in hidden
6
5
%% out
######
#    #
#    #
#    #
######
%% starter
# row(width, paint) returns text. The main part prints the frame.

%% solution
def row(width, paint):
    return paint * width

width = int(input())
height = int(input())
print(row(width, "#"))
for _ in range(height - 2):
    print("#" + row(width - 2, " ") + "#")
print(row(width, "#"))
%% hint
`row` must **return** its text, so that the main part can print it or join it with other text.
%% hint
The first and last rows are `row(width, "#")`. For the rows in between you need `height - 2` of them.
%% hint
A middle row is `"#"`, then `row(width - 2, " ")` for the spaces, then `"#"`.
%% end

%% level l6 | Pattern press
The pattern press paints a block of `width` by `height` cells. A **rule** is a function `rule(x, y, width, height)` that returns the character for the cell in column `x` and row `y`, counting from 0. The starter already has the painter `paint(width, height, rule)`, which calls the rule for every cell. Read a pattern name, the width and the height, one per line, and paint the pattern that was asked for:

- `checker`: `#` when `x + y` is even, otherwise `.`
- `stripes`: `#` when `x` is even, otherwise `.`
- `border`: `#` on the outer edge of the block, otherwise `.`

Keep the rules in a **dictionary** and hand the chosen rule to `paint`. Do not put brackets after a rule when you pass it.

```text
checker, 4 and 3 give
#.#.
.#.#
#.#.
```
%% config
mode: io
par: 15
require: dict
%% in Checker
checker
4
3
%% out
#.#.
.#.#
#.#.
%% in Border
border
5
4
%% out
#####
#...#
#...#
#####
%% in hidden
stripes
6
2
%% out
#.#.#.
#.#.#.
%% in hidden
checker
5
5
%% out
#.#.#
.#.#.
#.#.#
.#.#.
#.#.#
%% starter
def paint(width, height, rule):
    for y in range(height):
        line = ""
        for x in range(width):
            line += rule(x, y, width, height)
        print(line)

# Write the rules, keep them in a dictionary, then paint the pattern that was asked for.

%% solution
def paint(width, height, rule):
    for y in range(height):
        line = ""
        for x in range(width):
            line += rule(x, y, width, height)
        print(line)

patterns = {
    "checker": lambda x, y, w, h: "#" if (x + y) % 2 == 0 else ".",
    "stripes": lambda x, y, w, h: "#" if x % 2 == 0 else ".",
    "border": lambda x, y, w, h: "#" if x in (0, w - 1) or y in (0, h - 1) else ".",
}
name = input()
width = int(input())
height = int(input())
paint(width, height, patterns[name])
%% hint
Each rule takes `x, y, width, height` and returns `"#"` or `"."`. A `def` rule works, and so does a `lambda`.
%% hint
checker: `(x + y) % 2 == 0`. stripes: `x % 2 == 0`. border: `x` is `0` or `width - 1`, or `y` is `0` or `height - 1`.
%% hint
`patterns = {"checker": checker, ...}` stores the rules, and `paint(width, height, patterns[name])` paints one of them.
%% end

%% level l7 | The village
Build a village. Write three functions that **return** lists of lines: `roof(h)`, `body(h)` and `house(h)`. A house of size `h` has a roof of `h` rows of `^`: row 1 has one `^`, and every row adds two more. The roof rows are centred over the body, and every row is padded with spaces to the width of the body, which is `2 * h - 1`. The body is two rows of `#`, each `2 * h - 1` wide. Read `h`, then the number `n` of houses, and print `n` houses side by side with one space between them. You must use `def` and `return`.

```text
3 and 1 give
  ^
 ^^^
^^^^^
#####
#####
```
%% config
mode: io
par: 14
require: def return
%% in Two small houses
2
2
%% out
 ^   ^
^^^ ^^^
### ###
### ###
%% in One big house
3
1
%% out
  ^
 ^^^
^^^^^
#####
#####
%% in hidden
1
3
%% out
^ ^ ^
# # #
# # #
%% in hidden
3
2
%% out
  ^     ^
 ^^^   ^^^
^^^^^ ^^^^^
##### #####
##### #####
%% starter
# roof(h) and body(h) return lists of lines. house(h) joins them.

%% solution
def roof(h):
    lines = []
    for i in range(1, h + 1):
        pad = " " * (h - i)
        lines.append(pad + "^" * (2 * i - 1) + pad)
    return lines

def body(h):
    return ["#" * (2 * h - 1)] * 2

def house(h):
    return roof(h) + body(h)

h = int(input())
n = int(input())
for line in house(h):
    print(" ".join([line] * n))
%% hint
Make each function **return** a list of lines, so that `house` can join the two lists with `+`.
%% hint
Roof row `i`, counting from 1, has `2 * i - 1` carets and `h - i` spaces on **both** sides, so that every row is as wide as the body, `2 * h - 1`.
%% hint
To place `n` houses side by side, join the same line `n` times with one space: `" ".join([line] * n)`.
%% end

%% level l8 | Triangle of triangles
Boss level. A triangle of **order 0** is a single `*`. A triangle of order `n` is made of a triangle of order `n - 1` placed on top, and two copies of it side by side underneath, with one space between the copies. The triangle on top is padded with `2 ** (n - 1)` spaces on **both** sides, so that every line has the same width. Write a function that **returns** the triangle as a list of lines, and print it. Read the order `n`. You must use `def` and `return`.

```text
2 gives
   *
  * *
 *   *
* * * *
```
%% config
mode: io
par: 13
require: def return
%% in Order 2
2
%% out
   *
  * *
 *   *
* * * *
%% in Order 3
3
%% out
       *
      * *
     *   *
    * * * *
   *       *
  * *     * *
 *   *   *   *
* * * * * * * *
%% in hidden
0
%% out
*
%% in hidden
4
%% out
               *
              * *
             *   *
            * * * *
           *       *
          * *     * *
         *   *   *   *
        * * * * * * * *
       *               *
      * *             * *
     *   *           *   *
    * * * *         * * * *
   *       *       *       *
  * *     * *     * *     * *
 *   *   *   *   *   *   *   *
* * * * * * * * * * * * * * * *
%% starter
# A triangle of order n is built from the triangle of order n - 1.

%% solution
def triangle(n):
    if n == 0:
        return ["*"]
    smaller = triangle(n - 1)
    pad = " " * (2 ** (n - 1))
    top = []
    bottom = []
    for line in smaller:
        top.append(pad + line + pad)
        bottom.append(line + " " + line)
    return top + bottom

for line in triangle(int(input())):
    print(line)
%% hint
Start with the base case: for order 0 the function returns `["*"]`, a list with one line.
%% hint
For order `n`, call the function with `n - 1` to get the smaller triangle. Loop over its lines: the top lines are the line padded on both sides, and the bottom lines are the line, a space, and the same line again.
%% hint
Return `top + bottom`. The padding is `" " * (2 ** (n - 1))`.
%% end

