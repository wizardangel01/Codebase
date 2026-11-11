---
title: Judge modes
engine: judge
---
Intro.

%% level s1 | Script mode
Write `double(n)`.
%% config
mode: script
function: double
par: 2
%% test Doubles numbers
expect(double(4), 8)
expect(double(-1.5), -3.0)
%% test Uses return
check(printed(double, 3) == "", "double() should return the answer, not print it")
%% test hidden Zero
expect(double(0), 0)
%% starter
def double(n):
    pass
%% solution
def double(n):
    return n * 2
%% hint
Return n * 2.
%% hint
Use return.
%% end

%% level s2 | Prelude and files
Count the words in the file `story.txt` and print the number, then print the secret from the prelude.
%% config
mode: io
par: 4
%% file story.txt
one two three
four five
%% prelude
SECRET = "swordfish"
%% in Any input
x
%% out
5
swordfish
%% starter
# open the file
%% solution
with open("story.txt") as f:
    words = f.read().split()
print(len(words))
print(SECRET)
%% hint
Open the file with open().
%% hint
Use .split().
%% end

%% level s3 | Prompts are ignored
Read a name and greet it. Prompts passed to input() are not part of the output.
%% config
mode: io
par: 2
%% in Ada
Ada
%% out
Hi Ada
%% in hidden
Bob
%% out
Hi Bob
%% starter
# go
%% solution
name = input("Your name: ")
print("Hi", name)
%% hint
Use input() once.
%% hint
Print with a comma.
%% end

%% level s4 | Run again and rules
Print `42` using a program that must contain a for loop.
%% config
mode: script
par: 3
require: for
%% test Prints 42
expect(run().strip(), "42")
check(uses("for"), "use a for loop")
%% starter
# print 42
%% solution
for n in range(1):
    print(42)
%% hint
A loop of one turn.
%% hint
range(1).
%% end
