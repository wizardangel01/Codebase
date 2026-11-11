"""Helpers shared by every game harness.

The site joins this file and one engine harness (rover.py, judge.py, ...) into a single
program, so the engine files can use everything defined here without importing it.
A harness defines two functions:

    setup(level)  -> {"names": {...}, "modules": {...}}   runs before the learner's code
    finish(ctx)   -> dict                                  runs after it, returns the result

`level` is built from the %% level block in game.md:
    {"id", "title", "config": {...}, "sections": {name: [{"arg", "text"}, ...]}, "starter", "solution"}
`ctx` is {"ns", "ok", "error", "stdout", "stderr", "source", "level", "exit_code"}.
The names `error_info`, `run_source` and `LEARNER_FILE` are provided by the host.
"""
import ast
import io
import math
import tokenize

FRAME_LIMIT = 1500


# --- reading the level ---------------------------------------------------------
def sec(level, name, default=None):
    """Text of the first %% <name> section, or `default`."""
    for s in level.get("sections", {}).get(name, []):
        return s["text"]
    return default


def secs(level, name):
    """All %% <name> sections, in order, as [{"arg": ..., "text": ...}]."""
    return list(level.get("sections", {}).get(name, []))


def cfg(level, key, default=None):
    value = level.get("config", {}).get(key, default)
    return default if value == "" else value


def words(value):
    """'for while, if' -> ['for', 'while', 'if']"""
    if value is None or value is False:
        return []
    if isinstance(value, (list, tuple)):
        return [str(v) for v in value]
    return [w for w in str(value).replace(",", " ").split() if w]


# --- measuring the learner's code ---------------------------------------------------
def code_lines(source):
    """Lines that contain code (blank lines and comment-only lines do not count)."""
    return len([ln for ln in source.splitlines() if ln.strip() and not ln.strip().startswith("#")])


def comment_count(source):
    n = 0
    try:
        for tok in tokenize.generate_tokens(io.StringIO(source).readline):
            if tok.type == tokenize.COMMENT:
                n += 1
    except (tokenize.TokenError, IndentationError, SyntaxError):
        pass
    return n


_KINDS = {
    "for": (ast.For, ast.AsyncFor),
    "while": (ast.While,),
    "if": (ast.If, ast.IfExp),
    "def": (ast.FunctionDef, ast.AsyncFunctionDef),
    "class": (ast.ClassDef,),
    "import": (ast.Import, ast.ImportFrom),
    "lambda": (ast.Lambda,),
    "try": (ast.Try,),
    "with": (ast.With, ast.AsyncWith),
    "return": (ast.Return,),
    "yield": (ast.Yield, ast.YieldFrom),
    "comprehension": (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp),
    "listcomp": (ast.ListComp,),
    "setcomp": (ast.SetComp,),
    "dictcomp": (ast.DictComp,),
    "genexp": (ast.GeneratorExp,),
    "ifexp": (ast.IfExp,),
    "match": (ast.Match,),
    "walrus": (ast.NamedExpr,),
    "star": (ast.Starred,),
    "fstring": (ast.JoinedStr,),
    "list": (ast.List,),
    "dict": (ast.Dict,),
    "set": (ast.Set,),
    "tuple": (ast.Tuple,),
    "slice": (ast.Slice,),
    "global": (ast.Global,),
    "assert": (ast.Assert,),
    "raise": (ast.Raise,),
    "decorator": (),  # handled below
    "await": (ast.Await,),
    "and": (ast.And,),
    "or": (ast.Or,),
    "not": (ast.Not,),
}


_PHRASES = {
    "for": "the `for` statement",
    "while": "the `while` statement",
    "comprehension": "a comprehension",
    "listcomp": "a list comprehension",
    "setcomp": "a set comprehension",
    "dictcomp": "a dictionary comprehension",
    "genexp": "a generator expression",
    "ifexp": "a conditional expression (`a if test else b`)",
    "match": "a `match` statement",
    "walrus": "the walrus operator `:=`",
    "star": "star unpacking (a starred name such as `*rest`)",
    "slice": "slicing (`items[a:b]`)",
}


def phrase(kind):
    """How a rule word reads in a message: a friendly phrase, or the word itself in backticks."""
    return _PHRASES.get(kind) or "`%s`" % kind


def parse_source(source):
    try:
        return ast.parse(source)
    except SyntaxError:
        return None


def uses(source, kind, tree=None):
    """Does the program use this kind of statement or expression?  (for, while, if, def, ...)"""
    tree = tree or parse_source(source)
    if tree is None:
        return False
    if kind == "decorator":
        return any(getattr(n, "decorator_list", None) for n in ast.walk(tree))
    types = _KINDS.get(kind)
    if types is None:
        # any other word is treated as the name of a called function or method
        for n in ast.walk(tree):
            if isinstance(n, ast.Call):
                f = n.func
                if (isinstance(f, ast.Name) and f.id == kind) or (isinstance(f, ast.Attribute) and f.attr == kind):
                    return True
        return False
    return any(isinstance(n, types) for n in ast.walk(tree))


def defined_functions(source):
    tree = parse_source(source)
    if tree is None:
        return []
    return [n.name for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]


def rule_problems(source, level):
    """Check the level's rules (config keys forbid, require, comments, max_lines).
    Returns a list of plain-English problems; empty means the code follows the rules."""
    out = []
    tree = parse_source(source)
    for kind in words(cfg(level, "forbid")):
        if uses(source, kind, tree):
            out.append("This level does not allow %s yet. %s" % (phrase(kind), cfg(level, "forbid_note", "Solve it with the commands in the briefing.")))
    required = words(cfg(level, "require"))
    for kind in required:
        if not uses(source, kind, tree):
            out.append("This level needs you to use %s." % phrase(kind))
    need_comments = cfg(level, "comments", 0)
    if need_comments and comment_count(source) < int(need_comments):
        out.append("Add at least %d comment line%s that start with #." % (int(need_comments), "" if int(need_comments) == 1 else "s"))
    max_lines = cfg(level, "max_lines")
    if max_lines and code_lines(source) > int(max_lines):
        out.append("Your program has %d lines of code but this level allows at most %s." % (code_lines(source), max_lines))
    return out


def stars_for(source, level, solution_ok=True):
    """3 stars at or under `par` lines of code, 2 up to 50% over, otherwise 1."""
    if not solution_ok:
        return 0
    par = cfg(level, "par")
    if not par:
        return 3
    n = code_lines(source)
    par = int(par)
    if n <= par:
        return 3
    if n <= math.ceil(par * 1.5):
        return 2
    return 1


def short(value, n=160):
    s = value if isinstance(value, str) else repr(value)
    return s if len(s) <= n else s[: n - 1] + "…"


def friendly_error(err):
    """One line for an error_info dict."""
    if not err:
        return ""
    where = " on line %s" % err["line"] if err.get("line") else ""
    return "%s%s: %s" % (err.get("type", "Error"), where, err.get("message", ""))
