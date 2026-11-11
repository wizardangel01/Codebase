---
title: Decisions: cheat sheet
---
## Comparisons

| Operator | Asks | Example |
| --- | --- | --- |
| `==` | equal? | `age == 18` |
| `!=` | different? | `name != "Ada"` |
| `<`, `<=` | smaller, smaller or equal? | `score < 50` |
| `>`, `>=` | bigger, bigger or equal? | `score >= 50` |
| `in`, `not in` | inside the text? | `"@" in email` |

```python
18 <= age <= 65         # chained: between two limits, both included
0.1 + 0.2 == 0.3        # False! round both sides before comparing floats
"Zebra" < "apple"       # True: capitals sort before small letters
```

`=` stores a value. `==` asks a question.

## if, elif, else

```python
if mark >= 70:
    grade = "A"
elif mark >= 50:
    grade = "B"
else:
    grade = "C"
```

- A colon ends the `if`, `elif` and `else` lines. Indent the block by four spaces.
- The first true condition wins and the rest of the chain is skipped, so put the most demanding or most specific question first.
- Separate `if` statements are separate questions, so several blocks can run.
- `pass` is a placeholder for a block you have not written yet.

## and, or, not

| `a` | `b` | `a and b` | `a or b` | `not a` |
| --- | --- | --- | --- | --- |
| `True` | `True` | `True` | `True` | `False` |
| `True` | `False` | `False` | `True` | `False` |
| `False` | `True` | `False` | `True` | `True` |
| `False` | `False` | `False` | `False` | `True` |

Python applies `not` first, then `and`, then `or`. Use brackets when you mix `and` with `or`. Python stops as soon as the answer is known, so `x != 0 and 10 / x > 1` never divides by zero.

## True and false values

Zero (`0`, `0.0`), the empty string `""` and `None` count as false. Everything else is true, including `"0"` and `"False"`.

```python
if name:                      # an empty answer is false
    print("Hello,", name)
```

## One-line decisions

```python
label = "even" if n % 2 == 0 else "odd"
```

## Checking input

```python
text = input().strip().lower()
if text.isdigit():            # digits only: no minus sign, no decimal point
    number = int(text)
```

## Common mistakes

| Mistake | Fix |
| --- | --- |
| `if x = 5:` | `if x == 5:` |
| `if x == 1 or 2:` | `if x == 1 or x == 2:` |
| forgetting the colon | end `if`, `elif` and `else` lines with `:` |
| block not indented | indent by four spaces |
| `elif` chain in the wrong order | most demanding or most specific question first |
| `>` where `>=` was meant | test one value below, on and above every limit |
| `a + b == c` with floats | round both sides first |
