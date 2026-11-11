// Turns a Python error into plain language. Input is the `error` object produced by
// the Python host: { type, message, line, text, kind }.
// Output: { title, body, tips[] } where every string is plain text (no HTML).

const MODULES_HINT = new Set(['math', 'random', 'datetime', 'time', 'json', 'os', 'sys', 'string', 'collections', 'itertools', 'functools', 're', 'statistics', 'csv', 'pathlib', 'dataclasses', 'typing', 'asyncio', 'enum', 'decimal', 'fractions', 'textwrap', 'copy', 'heapq', 'bisect']);

function q(s) {
  return `“${s}”`;
}

export function explainError(err, source = '') {
  if (!err) return null;
  const type = err.type || 'Error';
  const msg = String(err.message || '');
  const line = err.line;
  const where = line ? ` on line ${line}` : '';
  let m;

  if (err.kind === 'timeout') {
    return {
      title: 'Your program ran too long and was stopped',
      body: `Python stopped it after ${err.seconds || 10} seconds. That usually means a loop that never ends.`,
      tips: [
        'Check every while loop: does something inside it change so the condition eventually becomes False?',
        'A for loop over range() always ends; a while True loop needs a break.',
        'If the program is meant to wait (for example time.sleep), use shorter waits here.',
      ],
    };
  }
  if (err.kind === 'stopped') {
    return { title: 'Stopped', body: 'You stopped the program before it finished.', tips: [] };
  }
  if (err.kind === 'crash') {
    if (/call stack|recursion/i.test(msg)) {
      return {
        title: 'The recursion went too deep',
        body: 'A function called itself so many times that the engine ran out of room, before Python could raise a RecursionError. The engine has been restarted and is ready to run again.',
        tips: ['Python allows about 1,000 nested calls. For deeper work, use a loop, or build the answer from the bottom up in a list.', 'Check that every call moves closer to the base case, so that the chain of calls ends.'],
      };
    }
    return {
      title: 'The Python engine restarted',
      body: 'The program used too much memory or crashed the engine. It has been restarted and is ready to run again.',
      tips: ['Look for a loop that keeps adding to a list, or a function that calls itself without stopping.'],
    };
  }

  if (type === 'EOFError') {
    return {
      title: 'The program asked for input, but none was given',
      body: `input() waits for you to type something${where}. This run had no input to give it.`,
      tips: ['Type your answers in the Input box (one line per input() call) and run again.', 'In browsers that support it, the program pauses and lets you type right in the output panel.'],
    };
  }

  if (type === 'IndentationError' || /expected an indented block|unexpected indent|unindent does not match/.test(msg)) {
    return {
      title: 'The spaces at the start of a line are wrong',
      body: `Python uses indentation to know which lines belong together${where}. ${msg}`,
      tips: ['After a line ending in a colon (:), the next line must be indented by 4 spaces.', 'Lines in the same block must start with exactly the same number of spaces.', 'Don’t mix tabs and spaces.'],
    };
  }

  if (err.kind === 'syntax' || type === 'SyntaxError' || type === 'TabError') {
    const tips = [];
    let body = `Python could not read your code${where}. ${msg}.`;
    if (/was never closed/.test(msg)) tips.push('Every opening ( [ { needs a matching closing one. Count them on the line shown (and the line before).');
    if (/unterminated string literal|unterminated triple-quoted/.test(msg)) tips.push('A string must start and end with the same kind of quote: "like this" or ' + "'like this'" + '.');
    if (/expected ':'/.test(msg)) tips.push('Lines that start with if, elif, else, for, while, def, class, try or except must end with a colon (:).');
    if (/invalid syntax/.test(msg)) tips.push('Look at the line shown and the one just above it: a missing quote, bracket, comma or colon is the usual cause.');
    if (/Missing parentheses in call to 'print'|Did you mean print/.test(msg)) tips.push('In Python 3, print is a function: print("hello") with brackets.');
    if (/cannot assign to|assign to literal|assign to expression/.test(msg)) tips.push('= stores a value in a name (name = 5). To compare two values, use == instead.');
    if (/invalid decimal literal|leading zeros/.test(msg)) tips.push('Names cannot start with a digit, and numbers cannot have leading zeros.');
    if (/f-string/.test(msg)) tips.push('Inside an f-string, put values in {curly braces} and keep quotes balanced.');
    if (/'=' is not|expected '=='|Maybe you meant/.test(msg)) tips.push('Use == to compare and = to assign.');
    if (!tips.length) tips.push('Read the line shown and the line above it; look for a missing quote, bracket, comma or colon.');
    return { title: 'Python can’t understand this line (SyntaxError)', body, tips };
  }

  if (type === 'NameError' || type === 'UnboundLocalError') {
    m = /name '([^']+)' is not defined/.exec(msg) || /cannot access local variable '([^']+)'/.exec(msg) || /local variable '([^']+)'/.exec(msg);
    const name = m ? m[1] : 'that name';
    const tips = [];
    if (type === 'UnboundLocalError') {
      tips.push(`Inside a function, if you assign to ${q(name)} anywhere, Python treats it as a local variable. Give it a value before you use it, or pass it in as a parameter.`);
      return { title: `${q(name)} is used before it has a value`, body: `${msg}${where}.`, tips };
    }
    tips.push('Check the spelling and capitalisation: Python treats name and Name as different things.');
    tips.push('A name must be created (name = …) on an earlier line before you use it.');
    if (MODULES_HINT.has(name)) tips.unshift(`${q(name)} is a module. Add  import ${name}  at the top of your program.`);
    tips.push('If you meant text, put it in quotes: "hello" is text, hello is a name.');
    return { title: `Python doesn’t know the name ${q(name)}`, body: `${msg}${where}.`, tips };
  }

  if (type === 'TypeError') {
    const tips = [];
    let title = 'A value has the wrong type for this operation';
    if ((m = /unsupported operand type\(s\) for ([^:]+): '(\w+)' and '(\w+)'/.exec(msg))) {
      title = `You can’t use ${m[1].trim()} between a ${m[2]} and a ${m[3]}`;
      if ([m[2], m[3]].includes('str')) tips.push('Convert first: int("5") makes text into a whole number, str(5) turns a number into text.');
      if ([m[2], m[3]].includes('NoneType')) tips.push('A value is None, often because a function forgot to return something.');
    } else if ((m = /can only concatenate str \(not "(\w+)"\) to str/.exec(msg)) || (m = /must be str, not (\w+)/.exec(msg))) {
      title = `You can’t join text and a ${m[1]} with +`;
      tips.push('Turn the number into text with str(), or use an f-string: f"Total: {total}".');
    } else if ((m = /'(\w+)' object is not callable/.exec(msg))) {
      title = `You tried to call a ${m[1]} as if it were a function`;
      tips.push('Did you reuse a function name for a variable (like  print = 5  or  sum = 0 )? Rename the variable.');
      tips.push('Missing operator? 2(3) is a call; write 2 * 3.');
    } else if ((m = /'(\w+)' object is not iterable/.exec(msg))) {
      title = `A ${m[1]} can’t be looped over`;
      tips.push('for loops need a list, string, range(…), dictionary or other collection. To repeat n times, use  for i in range(n).');
    } else if ((m = /'(\w+)' object is not subscriptable/.exec(msg))) {
      title = `You can’t use [ ] on a ${m[1]}`;
      tips.push('[ ] works on lists, strings, tuples and dictionaries. Check what the variable really holds with print(type(x)).');
      if (m[1] === 'NoneType') tips.push('The value is None. A function may be missing a return, or a method like list.sort() returned None.');
    } else if ((m = /(\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/.exec(msg)) || (m = /(\w+)\(\) missing (\d+) required positional arguments?/.exec(msg))) {
      title = `Wrong number of arguments for ${m[1]}()`;
      tips.push('Count the values in the call and the parameters in the def line. They must match (unless you used defaults).');
      tips.push('Inside a class, every method needs self as its first parameter.');
    } else if (/got an unexpected keyword argument/.test(msg)) {
      title = 'That function doesn’t have a parameter with that name';
      tips.push('Check the spelling of the name before the = in the call.');
    } else if (/object cannot be interpreted as an integer/.test(msg)) {
      title = 'A whole number was needed here';
      tips.push('range() and indexes need int values. Convert with int(), or use // for whole-number division.');
    } else if (/must be str, not|expected str instance/.test(msg)) {
      title = 'Text was needed here';
      tips.push('Convert with str().');
    } else tips.push('Print the types of the values involved: print(type(x)).');
    return { title, body: `${type}: ${msg}${where}.`, tips };
  }

  if (type === 'ValueError') {
    const tips = [];
    let title = 'A value has the right type but a wrong content';
    if ((m = /invalid literal for int\(\) with base 10: (.*)/.exec(msg))) {
      title = `${m[1]} can’t be turned into a whole number`;
      tips.push('int() only accepts digits like "42". Text such as "4.5", "forty" or an empty string fails.');
      tips.push('For decimals use float("4.5"). Remember input() always gives text, so convert it first.');
    } else if (/could not convert string to float/.test(msg)) {
      title = 'That text can’t be turned into a number';
      tips.push('float() accepts text like "3.14". Remove letters and spaces first.');
    } else if (/not enough values to unpack|too many values to unpack/.test(msg)) {
      title = 'The number of values doesn’t match the number of names';
      tips.push('In  a, b = something  the right side must contain exactly two items.');
    } else if (/math domain error/.test(msg)) {
      title = 'That number isn’t allowed in this maths function';
      tips.push('For example, math.sqrt() needs a value of 0 or more.');
    } else if (/list\.remove|not in list/.test(msg)) {
      title = 'That item isn’t in the list';
      tips.push('Check with  if item in my_list  before removing.');
    } else tips.push('Print the value just before this line to see what it really contains.');
    return { title, body: `${type}: ${msg}${where}.`, tips };
  }

  if (type === 'IndexError') {
    return {
      title: 'That position doesn’t exist',
      body: `${msg}${where}.`,
      tips: ['Positions start at 0. A list with 3 items has positions 0, 1 and 2, so [3] is too far.', 'Use len(my_list) to see how many items there are, and [-1] to get the last one.', 'If it happens inside a loop, check the range: range(len(items)) stops at the last valid position.'],
    };
  }
  if (type === 'KeyError') {
    return {
      title: `The key ${msg} isn’t in the dictionary`,
      body: `A dictionary lookup failed${where}.`,
      tips: ['Check the spelling and capitalisation of the key.', 'Use my_dict.get(key) to get None instead of an error, or  if key in my_dict  first.', 'print(my_dict.keys()) shows what is really there.'],
    };
  }
  if (type === 'AttributeError') {
    const tips = ['Check the spelling of the method or attribute (dot names are case sensitive).', 'Print type(x) to see what kind of object you actually have.'];
    if (/'NoneType' object has no attribute/.test(msg)) tips.unshift('The value is None. A function may be missing a return, or a method such as list.append() or list.sort() returned None. Don’t assign their result.');
    if (/has no attribute '(\w+)'/.test(msg) && /'str'|'int'|'list'|'dict'|'float'/.test(msg)) tips.push('Each type has its own methods: strings have .upper(), lists have .append(), dictionaries have .get().');
    return { title: 'That object doesn’t have that attribute or method', body: `${msg}${where}.`, tips };
  }
  if (type === 'ZeroDivisionError') {
    return { title: 'You can’t divide by zero', body: `${msg}${where}.`, tips: ['Check the number you divide by. Print it just before the division.', 'Guard it:  if divisor != 0:  …'] };
  }
  if (type === 'ModuleNotFoundError' || type === 'ImportError') {
    m = /No module named '([^']+)'/.exec(msg);
    const tips = ['Check the spelling of the module name.'];
    if (m && /^(numpy|pandas|matplotlib|requests|scipy|flask|django|pygame|tkinter|turtle)/.test(m[1])) tips.unshift(`${q(m[1])} isn’t available in this in-browser Python. This course uses only the standard library.`);
    return { title: `Python can’t import ${m ? q(m[1]) : 'that module'}`, body: `${msg}${where}.`, tips };
  }
  if (type === 'FileNotFoundError') {
    return { title: 'That file doesn’t exist here', body: `${msg}${where}.`, tips: ['Each run starts in a fresh, empty folder. Create the file in your program first (open(name, "w")) before reading it.', 'Check the file name and extension.'] };
  }
  if (type === 'RecursionError') {
    return { title: 'A function kept calling itself and never stopped', body: `${msg}${where}.`, tips: ['Every recursive function needs a base case: a situation where it returns without calling itself.', 'Make sure each call moves closer to the base case.'] };
  }
  if (type === 'StopIteration') {
    return { title: 'There is nothing left to take', body: `next() was called on an exhausted iterator${where}.`, tips: ['Iterators and generators can only be used once. Create a new one, or loop with for.'] };
  }
  if (type === 'AssertionError') {
    return { title: 'An assert check failed', body: `${msg || 'The condition after assert was False'}${where}.`, tips: ['Print the values in the failing condition to see which part is wrong.'] };
  }
  if (type === 'KeyboardInterrupt') {
    return { title: 'Stopped', body: 'The program was interrupted.', tips: [] };
  }
  if (type === 'MemoryError') {
    return { title: 'The program needs too much memory', body: `${msg}${where}.`, tips: ['Look for a list or string that keeps growing inside a loop.'] };
  }
  if (type === 'OverflowError') {
    return { title: 'A number got too big', body: `${msg}${where}.`, tips: ['Floating-point numbers have a limit. Integers do not, so prefer int arithmetic.'] };
  }
  if (type === 'RuntimeError' && /Output limit/.test(msg)) {
    return { title: 'Too much output', body: 'The program printed more than this page can show.', tips: ['Look for a loop that prints forever.'] };
  }
  if (type === 'NotImplementedError') {
    return { title: 'This part isn’t written yet', body: `${msg || 'A method raised NotImplementedError'}${where}.`, tips: ['Replace the raise NotImplementedError line with your own code.'] };
  }
  if (type === 'SystemExit') {
    return { title: 'The program exited', body: `exit() or sys.exit() was called${where}.`, tips: [] };
  }
  return {
    title: `${type}`,
    body: `${msg || 'The program raised an error'}${where}.`,
    tips: ['Read the last line of the message first: it names the problem.', 'Then look at the line number shown and the line above it.'],
  };
}
