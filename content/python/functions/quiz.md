---
title: Functions: module quiz
pass: 70
---
Twelve questions on everything in this module: defining functions, parameters, scope, functions as values and recursion. Work out each program on paper before you answer, and read the explanations to see where a slip came from.

%% question q1 | predict
What does this program print?

```python
def f(a, b=10):
    return a + b

print(f(1), f(1, 2))
```
%% answer
11 3
%% explain
`f(1)` uses the default `b=10`, so it returns 11. `f(1, 2)` replaces the default, so it returns 3. `print` shows the two results with a space between them.
%% end

%% question q2 | choice
A function calculates a tax amount, and several parts of a program will use that amount. What should the function do with the result?
%% choice correct
Return it.
%% choice
Print it, so that the user sees it.
%% choice
Store it in a global variable called `tax`.
%% choice
Print it and return `None`.
%% explain
A function that calculates something should `return` the answer. The caller can then print it, store it, add it to other amounts or pass it to another function. A printed value is gone as soon as it is shown.
%% end

%% question q3 | multi
The function is defined as `def f(a, b=2, *, c=3):`. Select every call that runs without an error.
%% choice correct
`f(1)`
%% choice correct
`f(1, 5)`
%% choice
`f(1, 5, 7)`
%% choice correct
`f(1, c=9)`
%% choice
`f(b=1)`
%% explain
`a` is required, and `b` and `c` have defaults. The parameter `c` comes after the lone star, so it can only be given by keyword. `f(1, 5, 7)` tries to give it by position, and `f(b=1)` leaves out the required `a`.
%% end

%% question q4 | fill
Fill in the blank so that the program prints `6`.

```python
def total(___numbers):
    return sum(numbers)

print(total(1, 2, 3))
```
%% answer
*
%% expected
6
%% explain
A star in front of a parameter collects all the extra positional arguments into a tuple. Here `numbers` becomes `(1, 2, 3)`, and `sum` adds the items to give 6.
%% end

%% question q5 | order
Put the lines in order so that the program prints `[1] [2]`. One line does not belong.
%% lines
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
print(add_item(1), add_item(2))
%% distractors
def add_item(item, items=[]):
%% expected
[1] [2]
%% explain
With `items=None`, every call that gives no list creates a fresh one, so the two results are separate lists. The header `items=[]` would share one list between the calls, and the output would be `[1] [1, 2]`.
%% end

%% question q6 | choice
Which is the safest way to let a function change a total that belongs to the part of the program that calls it?
%% choice correct
Take the total as a parameter, and return the new total.
%% choice
Use the `global` keyword in every function.
%% choice
Give the total the same name as a built-in function.
%% choice
Use a list as the default value of a parameter.
%% explain
Passing values in and returning the result keeps every input and output visible, so the function is clear to read and straightforward to test. `global` hides the connection, and the other two options create bugs.
%% end

%% question q7 | predict
What does this program print?

```python
x = 5

def change():
    x = 99

change()
print(x)
```
%% answer
5
%% explain
The assignment inside `change` creates a new local `x`. The global `x` is never touched, so it is still 5.
%% end

%% question q8 | multi
Select every true statement about functions as values.
%% choice correct
A function can be stored in a list or a dictionary.
%% choice correct
`sorted(words, key=len)` passes the function `len` without calling it.
%% choice correct
A function can be given to another function as an argument.
%% choice
`len` and `len()` mean the same thing.
%% choice
A lambda can contain several statements.
%% explain
A function is an object like any other. `len` is the function, while `len()` calls it, and here it would fail because no argument is given. A lambda is one expression, and for several statements you need `def`.
%% end

%% question q9 | predict
What does this program print?

```python
pairs = [("a", 3), ("b", 1), ("c", 2)]
print(min(pairs, key=lambda p: p[1]))
```
%% answer
('b', 1)
%% explain
The lambda returns the second item of each pair, so `min` compares the numbers 3, 1 and 2. The smallest is 1, and `min` returns the whole pair that it belongs to, `('b', 1)`.
%% end

%% question q10 | choice
What is the job of the base case in a recursive function?
%% choice correct
It answers the smallest version of the problem directly, so that the calls stop.
%% choice
It makes the function run faster.
%% choice
It stores earlier results in a dictionary.
%% choice
It starts the recursion.
%% explain
Without a base case, a function keeps calling itself until Python stops it with a RecursionError. The base case is the one situation where the function returns without another call.
%% end

%% question q11 | predict
What does this program print?

```python
def f(n):
    if n == 0:
        return 0
    return n + f(n - 1)

print(f(4))
```
%% answer
10
%% explain
`f(4)` is 4 + f(3), which is 4 + 3 + f(2), and so on down to `f(0)`, which is 0. The sum 4 + 3 + 2 + 1 + 0 is 10.
%% end

%% question q12 | choice
Why is the plain recursive Fibonacci function slow for big values of `n`?
%% choice correct
It calculates the same values again and again.
%% choice
Python allows only ten calls at a time.
%% choice
Recursive functions cannot use `return`.
%% choice
It reads global variables.
%% explain
Every call makes two more calls, and the same small values are worked out many times, so the number of calls grows very fast. Remembering the answers in a dictionary, or using a loop, removes the repeated work.
%% end
