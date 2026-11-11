---
title: Recursion
---
A function can call other functions. It can also call **itself**. This sounds like a trick that must go on forever, but it is one of the most useful ideas in programming. A recursive function solves a problem by solving a **smaller version of the same problem**, and it stops when the problem is small enough to answer directly. Think of a set of nesting dolls: to count the dolls, you open the first one and count the dolls inside it, and you stop at the doll that is empty.

## A function that calls itself

Here is a countdown. Each call prints one number and then hands the rest of the work to a smaller countdown:

```python run
def countdown(n):
    if n == 0:
        print("Liftoff!")
    else:
        print(n)
        countdown(n - 1)

countdown(3)
```

The call `countdown(3)` prints 3 and calls `countdown(2)`. That call prints 2 and calls `countdown(1)`, which prints 1 and calls `countdown(0)`. The last call finds `n == 0` and prints `Liftoff!` without calling anything.

## The base case and the recursive case

Every recursive function needs two parts:

- A **base case**: a situation so small that the function answers directly, without calling itself. In the countdown it is `n == 0`.
- A **recursive case**: the function calls itself with a **smaller** problem, one step closer to the base case. In the countdown it is `countdown(n - 1)`.

If there is no base case, or the calls never get closer to it, the function calls itself again and again:

```python run error
def forever(n):
    return forever(n + 1)

forever(1)
```

Python reports a **RecursionError: maximum recursion depth exceeded**. Python stops a chain of calls after about a thousand levels, to protect your computer's memory. The error is a safety net, and it nearly always means that the base case is missing or that the argument moves away from it.

%% key A recursive function needs a base case, and every call must move towards it
Before you write the recursive call, write the base case. Then check that the argument of the call is smaller, shorter or closer to the base case than the current one.
%% end

## Factorial and the call stack

The factorial of a number is the product of all the whole numbers from 1 up to it. So 5! is 5 x 4 x 3 x 2 x 1, which is 120. The definition is already recursive: `n!` is `n` times `(n - 1)!`, and the factorial of 1 (or 0) is 1:

```python run
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
print(factorial(10))
```

Press the step button in the next program to watch what happens. Every call waits in its own frame, and the frames pile up like plates, which is why Python calls this the **call stack**. Only when the base case returns 1 can the waiting calls finish, one after another, from the top of the pile downwards:

```python trace title="The call stack grows, then shrinks"
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(4))
```

%% question q-fact-predict | predict
What does this program print?

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```
%% answer
120
%% explain
`factorial(5)` is 5 * 4 * 3 * 2 * 1, which is 120. The chain of calls runs down to `factorial(1)`, which returns 1, and the waiting calls multiply the results on the way back.
%% end

## Recursion on lists and text

A list is either empty (the base case) or a first item followed by a **smaller list** (the recursive case). The slice `numbers[1:]` is that smaller list:

```python run
def total(numbers):
    if len(numbers) == 0:
        return 0
    return numbers[0] + total(numbers[1:])

print(total([4, 8, 15, 16]))
```

Text works in the same way. A word is a **palindrome** when it reads the same backwards. A text of zero or one letters is a palindrome (base case). Otherwise, the first and last letters must match, and the text between them must be a palindrome too:

```python run
def is_palindrome(text):
    if len(text) <= 1:
        return True
    if text[0] != text[-1]:
        return False
    return is_palindrome(text[1:-1])

for word in ["level", "python", "noon", "a"]:
    print(word, is_palindrome(word))
```

## Before or after the call

The place of a `print` relative to the recursive call changes the order of the output. Compare these two functions:

```python run
def down(n):
    if n == 0:
        return
    print(n)
    down(n - 1)

def up(n):
    if n == 0:
        return
    up(n - 1)
    print(n)

down(3)
up(3)
```

`down` prints **before** it calls itself, so the numbers come out as 3, 2, 1. `up` prints **after** the call comes back, and the deepest call finishes first, so the numbers come out as 1, 2, 3. A `return` with no value ends the function and gives back nothing useful.

%% question q-order-choice | choice
Look at the function `up` above. What does `up(4)` print, one number per line?
%% choice
4, 3, 2, 1
%% choice correct
1, 2, 3, 4
%% choice
4 only
%% choice
Nothing, because the function returns at once.
%% explain
`up(4)` calls `up(3)` before it prints anything, and so on down to `up(0)`, which returns. The calls then finish in the reverse order, and each one prints its own number, starting with 1.
%% end

## Fibonacci and the cost of naive recursion

In the Fibonacci sequence 0, 1, 1, 2, 3, 5, 8, 13, each number is the sum of the two before it. The recursive version looks like the definition itself, but it hides a problem. Count how many calls it makes:

```python run
calls = [0]

def fib(n):
    calls[0] += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10), "after", calls[0], "calls")
calls[0] = 0
print(fib(20), "after", calls[0], "calls")
```

(The list `calls` is only a counter that lives outside the function, so that the example does not need `global`.) Going from `fib(10)` to `fib(20)` multiplies the work by more than a hundred, because every call makes **two** more calls and the same small values are calculated again and again. `fib(40)` would need hundreds of millions of calls.

There are two ways out. You can write the loop version, or you can **remember** the answers that you have already found in a dictionary:

```python run
def fib_fast(n, seen):
    if n in seen:
        return seen[n]
    if n < 2:
        return n
    seen[n] = fib_fast(n - 1, seen) + fib_fast(n - 2, seen)
    return seen[n]

print(fib_fast(50, {}))

def fib_loop(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fib_loop(50))
```

Both give the same answer at once. Remembering answers like this is called **memoisation**.

## The depth limit

Because every call needs a frame, a recursion that goes too deep runs out of room, even when the base case exists:

```python run error
def count_up(n):
    if n == 0:
        return 0
    return 1 + count_up(n - 1)

print(count_up(100000))
```

A loop does not have this limit. That brings us to an honest question.

## When a loop is better

Factorial, the sum of a list and the countdown are all clearer, shorter and faster as loops, and they never hit the depth limit. Use recursion when the problem itself has a **nested or branching shape**: folders inside folders, lists inside lists, the moves of a game, or a picture made of smaller copies of itself. Here is a list that may contain other lists, flattened into one list. A loop alone would not know how deep to go:

```python run
def flatten(items):
    flat = []
    for item in items:
        if type(item) == list:
            flat.extend(flatten(item))
        else:
            flat.append(item)
    return flat

print(flatten([1, [2, [3, 4]], 5, [[6]]]))
```

The famous puzzle of the **Tower of Hanoi** has the same flavour. To move `n` disks from peg A to peg C, you move `n - 1` disks out of the way to peg B, you move the biggest disk, and you move the `n - 1` disks from B on top of it. Each of those moves is the same puzzle with fewer disks:

```python run
def hanoi(n, source, target, spare):
    if n == 0:
        return
    hanoi(n - 1, source, spare, target)
    print(f"Move disk {n} from {source} to {target}")
    hanoi(n - 1, spare, target, source)

hanoi(3, "A", "C", "B")
```

Three disks need 7 moves. In general, `n` disks need 2^n - 1 moves, so 20 disks already need more than a million.

## A small project: binary numbers

To write a number in binary, divide it by 2 again and again, and read the remainders backwards. That is recursive: the binary form of `n` is the binary form of `n // 2`, followed by the last digit `n % 2`:

```python run stdin="37"
def to_binary(n):
    if n < 2:
        return str(n)
    return to_binary(n // 2) + str(n % 2)

number = int(input("Number: "))
print(number, "in binary is", to_binary(number))
```

%% question q-base-multi | multi
Select every statement that is true about a recursive function.
%% choice correct
It needs a base case that returns without calling itself.
%% choice correct
Each recursive call should work on a smaller or simpler problem.
%% choice
It is always faster than a loop.
%% choice correct
Calling itself without ever reaching the base case ends in a RecursionError.
%% choice
It cannot return a value.
%% explain
A base case, progress towards it and a depth limit are the key facts. Recursion is often slower than a loop, because every call costs a frame, and recursive functions return values all the time, such as `factorial` above.
%% end

## Your turn

%% exercise countdown | Countdown
Define a recursive function `countdown(n)` that prints the numbers from `n` down to 1, one per line, and then prints `Liftoff!`. Read `n` and call the function. For the input `3` the program prints:

```output
3
2
1
Liftoff!
```
%% stdin
3
%% starter
# countdown(n) must call itself.

%% solution
def countdown(n):
    if n == 0:
        print("Liftoff!")
    else:
        print(n)
        countdown(n - 1)

countdown(int(input()))
%% tests
expect_output("3\n2\n1\nLiftoff!")
check(defines("countdown"), "defines a function called countdown")
check(source().count("countdown(") >= 3, "countdown calls itself")
check(rerun("1").strip() == "1\nLiftoff!", "countdown from 1")
check(rerun("0").strip() == "Liftoff!", "countdown from 0")
%% hint
The base case is `n == 0`: print `Liftoff!` and do not call the function again.
%% hint
In the other case, print `n` first.
%% hint
Then call `countdown(n - 1)`, and finally call `countdown(int(input()))` from the main part.
%% end

%% exercise power | Power
Define a recursive function `power(base, exponent)` that returns `base` multiplied by itself `exponent` times, without using `**` or `pow`. The exponent is a whole number that is 0 or more. Read the base and the exponent (one per line) and print the result. For the input `2` and `10` the program prints:

```output
1024
```
%% stdin
2
10
%% starter
# power(base, exponent) must call itself.

%% solution
def power(base, exponent):
    if exponent == 0:
        return 1
    return base * power(base, exponent - 1)

base = int(input())
exponent = int(input())
print(power(base, exponent))
%% tests
expect_output("1024")
check(defines("power"), "defines a function called power")
check(not uses("Pow"), "does not use the ** operator")
check(not calls("pow"), "does not use pow()")
check(source().count("power(") >= 3, "power calls itself")
expect(power(5, 0), 1, "power(5, 0)")
expect(power(3, 3), 27, "power(3, 3)")
expect(power(-2, 3), -8, "power(-2, 3)")
%% hint
The base case is `exponent == 0`: anything to the power 0 is 1.
%% hint
Otherwise, `base` to the power `exponent` is `base` times `base` to the power `exponent - 1`.
%% hint
`return base * power(base, exponent - 1)`
%% end

%% exercise digit-sum | Sum of digits
Define a recursive function `digit_sum(n)` that returns the sum of the digits of a whole number `n`, for example 1234 gives 10. Use `//` and `%` and do not turn the number into text. Read `n` and print the result. For the input `1234` the program prints:

```output
10
```
%% stdin
1234
%% starter
# digit_sum(n) must call itself. The last digit is n % 10.

%% solution
def digit_sum(n):
    if n < 10:
        return n
    return n % 10 + digit_sum(n // 10)

print(digit_sum(int(input())))
%% tests
expect_output("10")
check(defines("digit_sum"), "defines a function called digit_sum")
check(not calls("str"), "uses // and % instead of text")
check(source().count("digit_sum(") >= 3, "digit_sum calls itself")
expect(digit_sum(7), 7, "digit_sum(7)")
expect(digit_sum(1000), 1, "digit_sum(1000)")
expect(digit_sum(99), 18, "digit_sum(99)")
%% hint
A number with only one digit (`n < 10`) is its own digit sum. That is the base case.
%% hint
`n % 10` is the last digit, and `n // 10` is the number without its last digit.
%% hint
`return n % 10 + digit_sum(n // 10)`
%% end

%% exercise pascal-row | Challenge: Pascal's triangle
In Pascal's triangle, every row starts and ends with 1, and every number in between is the sum of the two numbers above it. Row 0 is `[1]`, row 1 is `[1, 1]`, row 2 is `[1, 2, 1]` and row 4 is `[1, 4, 6, 4, 1]`. Define a recursive function `pascal_row(n)` that returns row `n` as a list, using the previous row. Read `n` and print the row. For the input `4` the program prints:

```output
[1, 4, 6, 4, 1]
```
%% stdin
4
%% starter
# pascal_row(n) must call itself for row n - 1.

%% solution
def pascal_row(n):
    if n == 0:
        return [1]
    previous = pascal_row(n - 1)
    row = [1]
    for i in range(len(previous) - 1):
        row.append(previous[i] + previous[i + 1])
    row.append(1)
    return row

print(pascal_row(int(input())))
%% tests
expect_output("[1, 4, 6, 4, 1]")
check(defines("pascal_row"), "defines a function called pascal_row")
check(source().count("pascal_row(") >= 3, "pascal_row calls itself")
expect(pascal_row(0), [1], "pascal_row(0)")
expect(pascal_row(1), [1, 1], "pascal_row(1)")
expect(pascal_row(6), [1, 6, 15, 20, 15, 6, 1], "pascal_row(6)")
%% hint
Row 0 is the base case: return `[1]`.
%% hint
Get the previous row with `previous = pascal_row(n - 1)`. The new row starts with 1.
%% hint
Add `previous[i] + previous[i + 1]` for every neighbouring pair, then add a final 1 and return the row.
%% end

## What you learned

- A recursive function calls itself, and each call works on a smaller version of the same problem.
- Every recursive function needs a **base case** that answers without recursing, and a **recursive case** that moves towards it. Without them, Python stops with a RecursionError after about a thousand nested calls.
- Each call has its own frame on the **call stack**. The calls finish in the reverse order, so a `print` placed after the recursive call runs on the way back.
- Recursion fits lists, text, nested data and puzzles such as the Tower of Hanoi, where a problem contains smaller copies of itself.
- Naive recursion can repeat the same work, as `fib` does. Remember answers in a dictionary (memoisation), or use a loop.
- When a loop does the job, a loop is usually clearer and faster. Choose recursion when the problem has a nested or branching shape.
