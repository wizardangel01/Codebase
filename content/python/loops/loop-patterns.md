---
title: Loop patterns
---
You now know both kinds of loops. The next step is to notice that most loops in real programs follow a handful of **recipes**. Learn each recipe once, and you will recognise it everywhere: in a shopping basket, in a game score, in a search box. This lesson collects the recipes you will use most, and it ends with a complete guessing game.

## Plan a loop with four questions

Before you write a loop, answer four questions. They turn a vague idea into code:

| Question | Example: "add up the marks" |
| --- | --- |
| What do I repeat? | read one mark and add it |
| What changes in every round? | the mark, and the running total |
| When do I stop? | after all the marks have been read |
| What do I have at the end? | the total |

The answers tell you what belongs before the loop (the set-up), inside it (the repeated work) and after it (the report).

## Recipe: counting matches

To count how many things pass a test, start a counter at 0 and add 1 whenever the test is true. This program counts the vowels in a sentence:

```python run
sentence = "Programming is fun"
vowels = 0
for letter in sentence.lower():
    if letter in "aeiou":
        vowels += 1
print("Vowels:", vowels)
```

Converting to lower case first means that capital letters are counted too.

## Recipe: totals and averages

Totalling is the accumulator from the first lesson. An average is the total divided by the number of values, so you only need to know how many numbers there were:

```python run stdin="3\n70\n85\n90"
count = int(input("How many marks? "))
total = 0
for _ in range(count):
    total += int(input("Mark: "))
print("Average:", round(total / count, 1))
```

## Recipe: largest and smallest

Finding the biggest value by hand means remembering the best one so far. Start with the **first** value, and replace the champion whenever a better value turns up:

```python run stdin="4\n12\n7\n30\n18"
count = int(input("How many numbers? "))
largest = int(input("Number: "))
smallest = largest
for _ in range(count - 1):
    number = int(input("Number: "))
    if number > largest:
        largest = number
    if number < smallest:
        smallest = number
print("Largest:", largest)
print("Smallest:", smallest)
```

%% warn Do not start the champion at 0
If you began with `largest = 0`, a list of negative numbers would report 0 as the largest value, although 0 was never in the list. Start with a real value from the data.
%% end

%% question q-largest-start | choice
Why does the program above set `largest` to the first number that is read, instead of 0?
%% choice
Because Python does not allow the number 0 in a variable.
%% choice correct
Because every number might be negative, and then 0 would wrongly beat all of them.
%% choice
Because the loop would not run otherwise.
%% choice
Because the first number is always the largest.
%% explain
A starting value must come from the data. With `largest = 0`, the numbers -5, -2 and -9 would give the answer 0, which is not in the data. Starting with the first number is correct for every input.
%% end

## Recipe: building a string

Strings cannot be changed, but you can build a **new** one in a loop. Start with an empty string and add to it. Putting each new letter at the front reverses a word:

```python run
word = "python"
backwards = ""
for letter in word:
    backwards = letter + backwards
print(backwards)
```

## Recipe: searching with a flag

To find out whether something exists in the data, use a **flag**: a variable that starts as `False` and becomes `True` when the search succeeds. Add a `break` so that the loop stops at the first success:

```python run
password = "tiger77"
has_digit = False
for letter in password:
    if letter.isdigit():
        has_digit = True
        break
print("Contains a digit:", has_digit)
```

## Recipe: FizzBuzz

FizzBuzz is a famous warm-up problem. Count from 1 to 15, but print `Fizz` for multiples of 3, `Buzz` for multiples of 5 and `FizzBuzz` for multiples of both. You wrote the decision in module 3. Now a loop applies it to many numbers:

```python run
for n in range(1, 16):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)
```

## Recipe: prime numbers

A prime number is a whole number above 1 that has no divisors except 1 and itself. To test it, try every possible divisor. If any of them divides the number exactly, it is not prime:

```python run stdin="29"
n = int(input("Number: "))
is_prime = n > 1
for divisor in range(2, n):
    if n % divisor == 0:
        is_prime = False
        break
print(n, "is prime:", is_prime)
```

The flag starts as `True` for numbers above 1, and it is switched off by the first divisor that is found. This program tries every candidate, which is fine for small numbers. Clever programs stop much earlier, a trick you will meet when you study algorithms.

## Recipe: taking numbers apart

The remainder `% 10` gives the last digit of a number, and `// 10` removes it. A `while` loop can peel off the digits one by one, which is the way to add them up:

```python run stdin="4096"
n = int(input("Number: "))
total = 0
while n > 0:
    total += n % 10
    n = n // 10
print("Digit sum:", total)
```

%% question q-digit-predict | predict
What does this program print?

```python
n = 123
total = 0
while n > 0:
    total += n % 10
    n = n // 10
print(total)
```
%% answer
6
%% explain
The loop peels off 3, then 2, then 1, and adds them: 3 + 2 + 1 = 6. After the digit 1 is removed, `n` is 0 and the loop ends.
%% end

## Recipe: a sequence that stops by itself

Some loops run until the data reaches a special state. The Collatz sequence is a famous example. Start with any positive whole number. If it is even, halve it. If it is odd, triple it and add 1. Repeat. Mathematicians believe that every start reaches 1, but nobody has proved it:

```python run stdin="6"
n = int(input("Start: "))
steps = 0
while n != 1:
    if n % 2 == 0:
        n = n // 2
    else:
        n = 3 * n + 1
    steps += 1
print("Reached 1 after", steps, "steps")
```

## Your first import: random numbers

Python comes with a large library of ready-made tools, organised into **modules**. The line `import random` loads the module for random numbers. After that you use its tools by writing the module name, a dot and the tool name. A later module explains imports properly. For now, treat it as the first line of the program.

The function `random.randint(a, b)` gives a random whole number from `a` to `b`, **including both ends**. The function `random.seed(x)` makes the sequence repeatable, which is useful for testing. Run the next program twice and you will see the same numbers each time. Delete the `seed` line and the numbers change on every run:

```python run
import random
random.seed(7)
print(random.randint(1, 6))
print(random.randint(1, 6))
print(random.randint(1, 6))
```

%% question q-randint | choice
Which numbers can `random.randint(1, 6)` give?
%% choice
Only 2, 3, 4 and 5
%% choice
0, 1, 2, 3, 4, 5
%% choice
1, 2, 3, 4, 5, 6 and also 7
%% choice correct
1, 2, 3, 4, 5 and 6
%% explain
Unlike `range`, the function `randint` includes both ends, so it behaves like a six-sided die. If you write `random.randint(1, 6)`, the numbers 1 and 6 are both possible.
%% end

## Putting it together: a guessing game

A guessing game uses a counter, a `while True` loop, a decision and a `break`. The computer picks a secret number, and the player guesses until the answer is right. The seed is fixed here so that the example always has the same secret:

```python run stdin="50\n31"
import random
random.seed(3)
secret = random.randint(1, 100)
tries = 0
while True:
    guess = int(input("Guess (1-100): "))
    tries += 1
    if guess < secret:
        print("Too low")
    elif guess > secret:
        print("Too high")
    else:
        print("Correct! Tries:", tries)
        break
```

In a real game you would delete the `random.seed(3)` line, so that the secret is different every time. Think about the best strategy: each wrong guess cuts the possible numbers in half if you always guess in the middle, so seven tries are always enough for a number between 1 and 100.

## Your turn

%% exercise count-vowels | Count the vowels
Read a line of text and print how many vowels it contains. The vowels are `a`, `e`, `i`, `o` and `u`, in lower case or upper case. For the input `Programming is fun` the program prints:

```output
5
```
%% stdin
Programming is fun
%% starter
# Count the vowels in the sentence.

%% solution
text = input().lower()
count = 0
for letter in text:
    if letter in "aeiou":
        count += 1
print(count)
%% tests
expect_output("5")
check(rerun("xyz").strip() == "0", "no vowels")
check(rerun("AEIOU").strip() == "5", "capital vowels count too")
check(rerun("Python").strip() == "1", "one vowel")
check(uses("For"), "uses a for loop")
%% hint
Convert the text to lower case first, so that you only test for five letters.
%% hint
Start a counter at 0 and add 1 for every letter that is in `"aeiou"`.
%% hint
`if letter in "aeiou":` goes inside `for letter in text:`.
%% end

%% exercise average-marks | Average mark
Read a whole number `n`, and then read `n` marks, one per line. Print their average, rounded to 1 decimal place. For the input `3`, `70`, `85` and `90` the program prints:

```output
81.7
```
%% stdin
3
70
85
90
%% starter
# Read n, then n marks, then print the average.

%% solution
n = int(input())
total = 0
for _ in range(n):
    total += int(input())
print(round(total / n, 1))
%% tests
expect_output("81.7")
check(rerun("2\n10\n20").strip() == "15.0", "an average of 15.0")
check(rerun("1\n55").strip() == "55.0", "a single mark")
check(uses("For"), "uses a for loop")
%% hint
Add the marks up with an accumulator, as in the first lesson.
%% hint
Read each mark inside the loop: `total += int(input())`.
%% hint
After the loop, print `round(total / n, 1)`.
%% end

%% exercise prime-check | Prime check
Read a whole number and print `prime` if it is a prime number, or `not prime` if it is not. Remember that 1 and numbers below 1 are not prime. For the input `29` the program prints:

```output
prime
```
%% stdin
29
%% starter
# Test every possible divisor.

%% solution
n = int(input())
is_prime = n > 1
for divisor in range(2, n):
    if n % divisor == 0:
        is_prime = False
        break
print("prime" if is_prime else "not prime")
%% tests
expect_output("prime")
check(rerun("2").strip() == "prime", "2 is prime")
check(rerun("1").strip() == "not prime", "1 is not prime")
check(rerun("30").strip() == "not prime", "30 is not prime")
check(rerun("97").strip() == "prime", "97 is prime")
check(rerun("91").strip() == "not prime", "91 is 7 times 13")
%% hint
Use a flag that starts as `True` when the number is above 1.
%% hint
Try every divisor from 2 up to `n - 1`. When one divides `n` exactly, switch the flag off.
%% hint
`for divisor in range(2, n):` with `if n % divisor == 0:` inside it. Print the answer after the loop.
%% end

%% exercise guess-game | Guess the number
The secret number is 42. Read guesses, one per line, until a guess is right. For a guess below 42 print `Too low`, and for a guess above 42 print `Too high`. When the guess is right, print `Correct! Tries: N`, where `N` is the number of guesses so far, and stop. For the input `50`, `30` and `42` the program prints:

```output
Too high
Too low
Correct! Tries: 3
```
%% stdin
50
30
42
%% starter
secret = 42
# Read guesses until one is right.

%% solution
secret = 42
tries = 0
while True:
    guess = int(input())
    tries += 1
    if guess < secret:
        print("Too low")
    elif guess > secret:
        print("Too high")
    else:
        print("Correct! Tries:", tries)
        break
%% tests
expect_output("Too high\nToo low\nCorrect! Tries: 3")
check(rerun("42").strip() == "Correct! Tries: 1", "right at once")
check(rerun("1\n99\n42").strip() == "Too low\nToo high\nCorrect! Tries: 3", "low, high, right")
check(uses("While"), "uses a while loop")
%% hint
You do not know how many guesses are needed, so use `while True` with a `break`.
%% hint
Count the guesses in a variable that goes up by 1 after every `input()`.
%% hint
Inside the loop use an `if`/`elif`/`else` chain. The `else` branch prints the result and runs `break`.
%% end

%% exercise digital-root | Challenge: Digital root
Read a positive whole number. Add up its digits. If the result has more than one digit, add up the digits of the result, and keep going until a single digit remains. Print that digit. For the input `9875` the digits add up to 29, then 2 + 9 is 11, then 1 + 1 is 2, so the program prints:

```output
2
```
%% stdin
9875
%% starter
# Repeat the digit sum until one digit is left.

%% solution
n = int(input())
while n >= 10:
    total = 0
    while n > 0:
        total += n % 10
        n = n // 10
    n = total
print(n)
%% tests
expect_output("2")
check(rerun("7").strip() == "7", "a single digit stays the same")
check(rerun("99").strip() == "9", "99 gives 9")
check(rerun("12345").strip() == "6", "12345 gives 6")
check(rerun("10").strip() == "1", "10 gives 1")
check(uses("While"), "uses while loops")
%% hint
The outer loop runs while the number has more than one digit, which means `n >= 10`.
%% hint
Inside it, an inner `while` loop adds the digits of `n` into `total`, as in the digit-sum recipe.
%% hint
When the inner loop is finished, replace `n` with `total`, so that the outer loop can test it again.
%% end

## What you learned

- Plan a loop with four questions: what repeats, what changes, when to stop, and what you have at the end.
- Counting matches, totalling, averaging, finding the largest, building a string and searching with a flag are recipes that you will reuse in many programs.
- Start a "largest so far" variable with a real value from the data, not with 0.
- `% 10` and `// 10` take numbers apart digit by digit.
- `import random` loads a module. `random.randint(a, b)` includes both ends, and `random.seed(x)` makes the numbers repeatable.
- A guessing game combines `while True`, a counter, an `if`/`elif`/`else` chain and `break`.
