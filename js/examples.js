// Starter programs for the playground. tools/validate.mjs runs every one of these, so
// they are guaranteed to work. `stdin` lines are only used by the validator and as the
// prefilled Input box content.

export const EXAMPLES = [
  {
    id: 'hello',
    title: 'Hello, world',
    code: `# Your first program
print("Hello, world!")
print("Python is running in your browser.")
`,
  },
  {
    id: 'greeter',
    title: 'Ask for your name',
    stdin: 'Ada',
    code: `name = input("What is your name? ")
print(f"Nice to meet you, {name}!")
print("Your name has", len(name), "letters.")
`,
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    code: `for n in range(1, 21):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)
`,
  },
  {
    id: 'guess',
    title: 'Guess the number',
    stdin: '50\n25\n37\n43\n40\n41\n42', // the secret is 42 with seed 7
    code: `import random

random.seed(7)  # remove this line for a different number every time
secret = random.randint(1, 100)
tries = 0

while True:
    guess = int(input("Guess a number from 1 to 100: "))
    tries += 1
    if guess < secret:
        print("Too low")
    elif guess > secret:
        print("Too high")
    else:
        print(f"Got it in {tries} tries!")
        break
`,
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci numbers',
    code: `def fibonacci(count):
    a, b = 0, 1
    numbers = []
    for _ in range(count):
        numbers.append(a)
        a, b = b, a + b
    return numbers

print(fibonacci(15))
`,
  },
  {
    id: 'words',
    title: 'Count the words',
    code: `text = """the quick brown fox jumps over the lazy dog
the dog barks and the fox runs away"""

counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1

for word, n in sorted(counts.items(), key=lambda item: (-item[1], item[0])):
    print(f"{word:<8} {'#' * n} {n}")
`,
  },
  {
    id: 'class',
    title: 'A small class',
    code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Not enough money")
        self.balance -= amount
        return self.balance

account = BankAccount("Ada", 100)
account.deposit(50)
print(account.owner, account.balance)
try:
    account.withdraw(500)
except ValueError as error:
    print("Error:", error)
`,
  },
  {
    id: 'table',
    title: 'Multiplication table',
    code: `size = 9
print("    " + "".join(f"{n:4}" for n in range(1, size + 1)))
print("    " + "-" * (size * 4))
for row in range(1, size + 1):
    cells = "".join(f"{row * col:4}" for col in range(1, size + 1))
    print(f"{row:2} |{cells}")
`,
  },
];
