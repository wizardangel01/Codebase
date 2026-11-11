// The concept gate. docs/CURRICULUM.md is a contract: a lesson, exercise, quiz question or game
// level may only use ideas that the course has already taught. This file turns that rule into a
// check. Python's own parser (ast) looks at every piece of learner-facing code and lists the
// features it uses; TABLE says where in the course each feature is first taught.
//
// A feature is allowed from the lesson that teaches it onwards. Quizzes and games count as coming
// after every lesson of their module. A snippet that deliberately previews a later idea (the map
// asks for these now and then) opts out with the word "preview" on its code fence:
//
//     ```python preview
//     try: ...
//     ```

/** [module number, lesson number] where the idea is first taught, and how to name it in a message. */
const T = (module, lesson, label) => ({ at: [module, lesson], label });

export const TABLE = {
  // ---- syntax
  fstring: T(2, 4, 'an f-string'),
  index: T(2, 4, 'indexing with [ ]'),
  slice: T(2, 4, 'slicing'),
  in_op: T(2, 4, 'the in operator'),
  if: T(3, 2, 'an if statement'),
  pass: T(3, 2, 'pass'),
  ifexp: T(3, 3, 'a conditional expression (a if c else b)'),
  boolop: T(3, 3, 'and / or'),
  not: T(3, 3, 'not'),
  for: T(4, 1, 'a for loop'),
  while: T(4, 2, 'a while loop'),
  break: T(4, 2, 'break or continue'),
  list: T(5, 1, 'a list'),
  del: T(5, 1, 'del'),
  dict: T(6, 1, 'a dictionary'),
  set: T(6, 3, 'a set'),
  def: T(7, 1, 'a function definition'),
  return: T(7, 1, 'return'),
  is_op: T(7, 1, 'is / is not'),
  param_defaults: T(7, 2, 'default parameter values'),
  varargs: T(7, 2, '*args or **kwargs'),
  lambda: T(7, 3, 'lambda'),
  global: T(7, 3, 'global'),
  with: T(8, 2, 'a with statement'),
  try: T(9, 1, 'try / except'),
  raise: T(9, 2, 'raise'),
  assert: T(9, 2, 'assert'),
  class: T(10, 1, 'a class'),
  field_annotation: T(10, 4, 'a class field with a type annotation'),
  comprehension: T(13, 1, 'a comprehension or generator expression'),
  yield: T(13, 2, 'yield'),
  match: T(13, 3, 'match / case'),
  walrus: T(13, 3, 'the walrus operator :='),
  nonlocal: T(14, 1, 'nonlocal'),
  type_hint: T(14, 3, 'type hints'),
  annotation: T(14, 3, 'a variable annotation'),
  async: T(14, 4, 'async / await'),

  // ---- built-in functions and types
  'name:int': T(2, 2, 'int()'),
  'name:float': T(2, 2, 'float()'),
  'name:str': T(2, 2, 'str()'),
  'name:bool': T(2, 2, 'bool()'),
  'name:type': T(2, 2, 'type()'),
  'name:input': T(2, 3, 'input()'),
  'name:len': T(2, 4, 'len()'),
  'name:range': T(4, 1, 'range()'),
  'name:sum': T(4, 1, 'sum()'),
  'name:min': T(5, 1, 'min()'),
  'name:max': T(5, 1, 'max()'),
  'name:sorted': T(5, 1, 'sorted()'),
  'name:list': T(5, 1, 'list()'),
  'name:reversed': T(5, 1, 'reversed()'),
  'name:enumerate': T(5, 2, 'enumerate()'),
  'name:zip': T(5, 2, 'zip()'),
  'name:tuple': T(5, 3, 'tuple()'),
  'name:dict': T(6, 1, 'dict()'),
  'name:set': T(6, 3, 'set()'),
  'name:frozenset': T(6, 3, 'frozenset()'),
  'name:ord': T(8, 1, 'ord()'),
  'name:chr': T(8, 1, 'chr()'),
  'name:open': T(8, 2, 'open()'),
  'name:isinstance': T(10, 1, 'isinstance()'),
  'name:repr': T(10, 2, 'repr()'),
  'name:super': T(11, 1, 'super()'),
  'name:issubclass': T(11, 1, 'issubclass()'),
  'name:dir': T(12, 1, 'dir()'),
  'name:help': T(12, 1, 'help()'),
  'name:iter': T(13, 2, 'iter()'),
  'name:next': T(13, 2, 'next()'),
  'name:map': T(13, 3, 'map()'),
  'name:filter': T(13, 3, 'filter()'),
  'name:any': T(13, 3, 'any()'),
  'name:all': T(13, 3, 'all()'),

  // ---- methods (the name is what comes after the dot)
  'method:split': T(2, 3, '.split()'),
  ...Object.fromEntries(['upper', 'lower', 'title', 'capitalize', 'strip', 'lstrip', 'rstrip', 'replace', 'find', 'startswith', 'endswith', 'isdigit', 'isalpha', 'count'].map((m) => [`method:${m}`, T(2, 4, `.${m}()`)])),
  ...Object.fromEntries(['append', 'extend', 'insert', 'remove', 'pop', 'sort', 'reverse', 'index', 'clear'].map((m) => [`method:${m}`, T(5, 1, `.${m}()`)])),
  'method:join': T(5, 2, '.join()'),
  ...Object.fromEntries(['keys', 'values', 'items', 'get', 'setdefault', 'update'].map((m) => [`method:${m}`, T(6, 1, `.${m}()`)])),
  ...Object.fromEntries(['add', 'discard', 'union', 'intersection', 'difference', 'symmetric_difference', 'issubset', 'issuperset'].map((m) => [`method:${m}`, T(6, 3, `.${m}()`)])),
  'method:format': T(8, 1, '.format()'),
  ...Object.fromEntries(['read', 'readline', 'readlines', 'write'].map((m) => [`method:${m}`, T(8, 2, `.${m}()`)])),
  ...Object.fromEntries(['isalnum', 'isspace', 'partition', 'zfill', 'ljust', 'rjust', 'center', 'splitlines'].map((m) => [`method:${m}`, T(8, 1, `.${m}()`)])),

  // ---- decorators
  'decorator:property': T(10, 3, '@property'),
  'decorator:classmethod': T(10, 3, '@classmethod'),
  'decorator:staticmethod': T(10, 3, '@staticmethod'),
  'decorator:total_ordering': T(10, 3, '@total_ordering'),
  'decorator:dataclass': T(10, 4, '@dataclass'),
  'decorator:abstractmethod': T(11, 2, '@abstractmethod'),
  'decorator:setter': T(10, 3, '@name.setter'),
  'decorator:getter': T(10, 3, '@name.getter'),
  'decorator:deleter': T(10, 3, '@name.deleter'),

  // ---- importing modules
  'import:random': T(4, 4, 'the random module'),
  'import:copy': T(5, 3, 'the copy module'),
  'import:pathlib': T(8, 2, 'the pathlib module'),
  'import:json': T(8, 3, 'the json module'),
  'import:csv': T(8, 3, 'the csv module'),
  'import:io': T(8, 3, 'the io module'),
  'import:re': T(8, 4, 'the re module'),
  'import:traceback': T(9, 1, 'the traceback module'),
  'import:logging': T(9, 3, 'the logging module'),
  'import:unittest': T(9, 4, 'the unittest module'),
  'import:doctest': T(9, 4, 'the doctest module'),
  'import:dataclasses': T(10, 4, 'the dataclasses module'),
  'import:abc': T(11, 2, 'the abc module'),
  'import:enum': T(11, 4, 'the enum module'),
  'import:math': T(12, 2, 'the math module'),
  'import:statistics': T(12, 2, 'the statistics module'),
  'import:datetime': T(12, 3, 'the datetime module'),
  'import:collections': T(12, 3, 'the collections module'),
  'import:itertools': T(12, 3, 'the itertools module'),
  'import:heapq': T(12, 3, 'the heapq module'),
  'import:functools': T(12, 4, 'the functools module'),
  'import:operator': T(12, 4, 'the operator module'),
  'import:textwrap': T(12, 4, 'the textwrap module'),
  'import:string': T(12, 4, 'the string module'),
  'import:time': T(12, 4, 'the time module'),
  'import:hashlib': T(12, 4, 'the hashlib module'),
  'import:uuid': T(12, 4, 'the uuid module'),
  'import:contextlib': T(13, 4, 'the contextlib module'),
  'import:typing': T(14, 3, 'the typing module'),
  'import:asyncio': T(14, 4, 'the asyncio module'),
  'import:bisect': T(15, 2, 'the bisect module'),
};

/** Any decorator that is not listed above is a general decorator, taught in module 14. */
const GENERAL_DECORATOR = T(14, 2, 'a decorator');

/** Python program that lists the features each snippet uses. Reads snippets.json, prints JSON. */
export const ANALYSER = String.raw`
import ast, builtins, json

SIMPLE = {
    'JoinedStr': 'fstring', 'If': 'if', 'IfExp': 'ifexp', 'For': 'for', 'AsyncFor': 'for', 'While': 'while',
    'Break': 'break', 'Continue': 'break', 'Pass': 'pass', 'List': 'list', 'Dict': 'dict', 'Set': 'set',
    'ListComp': 'comprehension', 'DictComp': 'comprehension', 'SetComp': 'comprehension',
    'GeneratorExp': 'comprehension', 'FunctionDef': 'def', 'AsyncFunctionDef': 'def', 'Return': 'return',
    'Lambda': 'lambda', 'Global': 'global', 'Nonlocal': 'nonlocal', 'Try': 'try', 'TryStar': 'try',
    'Raise': 'raise', 'Assert': 'assert', 'With': 'with', 'AsyncWith': 'with', 'ClassDef': 'class',
    'Yield': 'yield', 'YieldFrom': 'yield', 'Match': 'match', 'NamedExpr': 'walrus', 'Delete': 'del',
    'Await': 'async',
}
BUILTINS = set(dir(builtins))


def features(code):
    try:
        tree = ast.parse(code)
    except (SyntaxError, ValueError, MemoryError, RecursionError):
        return None
    defined = set()
    class_fields = set()
    for n in ast.walk(tree):
        if isinstance(n, ast.Name) and isinstance(n.ctx, (ast.Store, ast.Del)):
            defined.add(n.id)
        elif isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            defined.add(n.name)
            if isinstance(n, ast.ClassDef):
                for b in n.body:
                    if isinstance(b, ast.AnnAssign):
                        class_fields.add(id(b))
        elif isinstance(n, ast.arg):
            defined.add(n.arg)
        elif isinstance(n, (ast.Import, ast.ImportFrom)):
            for a in n.names:
                defined.add((a.asname or a.name).split('.')[0])
    out = {}

    def add(key, node):
        if key not in out:
            out[key] = getattr(node, 'lineno', 1)

    for n in ast.walk(tree):
        kind = type(n).__name__
        if kind in SIMPLE:
            add(SIMPLE[kind], n)
        if isinstance(n, ast.BoolOp):
            add('boolop', n)
        elif isinstance(n, ast.UnaryOp) and isinstance(n.op, ast.Not):
            add('not', n)
        elif isinstance(n, ast.Compare):
            for op in n.ops:
                if isinstance(op, (ast.In, ast.NotIn)):
                    add('in_op', n)
                if isinstance(op, (ast.Is, ast.IsNot)):
                    add('is_op', n)
        elif isinstance(n, ast.Subscript):
            add('slice' if isinstance(n.slice, ast.Slice) else 'index', n)
        elif isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute):
            add('method:' + n.func.attr, n)
        elif isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load) and n.id in BUILTINS and n.id not in defined:
            add('name:' + n.id, n)
        elif isinstance(n, ast.Import):
            for a in n.names:
                add('import:' + a.name.split('.')[0], n)
        elif isinstance(n, ast.ImportFrom):
            add('import:' + (n.module or '').split('.')[0], n)
        elif isinstance(n, ast.AnnAssign):
            add('field_annotation' if id(n) in class_fields else 'annotation', n)
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            a = n.args
            if a.vararg or a.kwarg:
                add('varargs', n)
            if a.defaults or any(d is not None for d in a.kw_defaults):
                add('param_defaults', n)
            if n.returns is not None or any(x.annotation is not None for x in a.posonlyargs + a.args + a.kwonlyargs + [x for x in (a.vararg, a.kwarg) if x]):
                add('type_hint', n)
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            for d in n.decorator_list:
                target = d.func if isinstance(d, ast.Call) else d
                name = target.id if isinstance(target, ast.Name) else getattr(target, 'attr', '?')
                add('decorator:' + name, d)
    return out


snippets = json.load(open('snippets.json'))
print(json.dumps([features(s) for s in snippets]))
`;

/**
 * @param runPython  async (code, files) => { stdout, error }
 * @param snippets   [{ code, where, base }]  where = "file:line" text, base = line number of the fence
 * @returns          [[{ key, label, lines: number[], first: [module, lesson] }]]  one list per snippet
 */
export async function findLeaks(runPython, snippets, at) {
  if (!snippets.length) return [];
  const res = await runPython(ANALYSER, { 'snippets.json': JSON.stringify(snippets.map((s) => s.code)) });
  if (res.error) throw new Error(`concept gate failed: ${res.error.type}: ${res.error.message}`);
  const all = JSON.parse(res.stdout);
  return all.map((features, i) => {
    if (!features) return []; // does not parse (a deliberate error example): nothing to judge
    const found = [];
    for (const [key, line] of Object.entries(features)) {
      const rule = TABLE[key] || (key.startsWith('decorator:') ? GENERAL_DECORATOR : null);
      if (!rule) continue;
      const [m, l] = rule.at;
      if (at.module > m || (at.module === m && at.lesson >= l)) continue;
      found.push({ key, label: rule.label, line: (snippets[i].base || 0) + line, first: rule.at });
    }
    return found;
  });
}
