"""Judge: run the learner's program against test cases, like an online coding judge.

Used by every game whose `engine` is `judge`.

    %% config    mode (io | function | script), function, par, forbid, require, comments,
                 max_lines, approx, ignore_case, ignore_space, theme
    %% file NAME   (optional, repeatable) a text file the program can open(); it exists for every test
    %% prelude     (optional) hidden Python that runs first. Every name it defines is available to the
                   learner's program and to the tests, for example a data list or a helper class.

    io mode:        pairs of   %% in [hidden] [label]   (lines fed to input())
                               %% out                    (expected printed output)
                    Prompts given to input("...") are not part of the output that is compared.
    function mode:  pairs of   %% call [hidden] [label]  (a Python expression, e.g.  total(3, 4.5) )
                               %% returns                (a Python expression for the expected value)
    script mode:    one        %% test [hidden] [label]   (Python statements that exercise the learner's
                                                           code; the test fails when a check fails)

Test scripts (script mode) can use these helpers, plus every name the learner's program defined:

    check(condition, message)           fail with `message` when the condition is false
    expect(actual, expected, label="")  fail unless the two values are equal (honours `approx`)
    raises(ExcType, fn, *args)          True when calling fn(*args) raises that exception
    printed(fn, *args, **kwargs)        call fn and return everything it printed, as text
    run(stdin="")                       run the learner's whole program again, return what it printed
    source()                            the learner's source code
    uses("for")                         True when the program uses that construct (for, while, if, def,
                                        class, lambda, comprehension, import, ...) or calls that function
"""
import builtins
import sys
import traceback

_STATE = {}


class _Fail(Exception):
    """A test script's check failed. The message is shown to the learner."""


def quiet_input(prompt=""):
    """input() for the tests: the prompt text is not printed, so it never has to match the expected output."""
    return builtins.input()


def parse_label(arg):
    parts = (arg or "").split()
    hidden = "hidden" in [p.lower() for p in parts]
    label = " ".join(p for p in parts if p.lower() != "hidden")
    return label, hidden


def build_cases(level):
    mode = str(cfg(level, "mode", "io")).lower()
    if mode not in ("io", "function", "script"):
        raise ValueError("unknown judge mode %r (use io, function or script)" % mode)
    if mode == "script":
        tests = secs(level, "test")
        if not tests:
            raise ValueError("this judge level needs at least one %% test section")
        cases = []
        for i, t in enumerate(tests):
            label, hidden = parse_label(t["arg"])
            cases.append({"name": label or "Test %d" % (i + 1), "hidden": hidden, "input": t["text"], "expected": ""})
        return mode, cases
    first, second = ("in", "out") if mode == "io" else ("call", "returns")
    a, b = secs(level, first), secs(level, second)
    if len(a) != len(b) or not a:
        raise ValueError("this judge level needs matching %% %s and %% %s sections (found %d and %d)" % (first, second, len(a), len(b)))
    cases = []
    for i, (x, y) in enumerate(zip(a, b)):
        label, hidden = parse_label(x["arg"])
        cases.append({"name": label or "Test %d" % (i + 1), "hidden": hidden, "input": x["text"], "expected": y["text"]})
    return mode, cases


def norm(text, level):
    lines = [ln.rstrip() for ln in str(text).replace("\r\n", "\n").split("\n")]
    while lines and not lines[-1]:
        lines.pop()
    while lines and not lines[0]:
        lines.pop(0)
    out = "\n".join(lines)
    if cfg(level, "ignore_space"):
        out = " ".join(out.split())
    if cfg(level, "ignore_case"):
        out = out.lower()
    return out


def same(a, b, approx):
    if approx is not None and isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) and not isinstance(b, bool):
        return abs(a - b) <= approx
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)) and type(a) is type(b):
        return len(a) == len(b) and all(same(x, y, approx) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k], approx) for k in a)
    return a == b


def _prelude_names(level):
    """Names defined by the hidden %% prelude section (empty when there is none)."""
    code = sec(level, "prelude")
    if not code:
        return {}
    env = {"__name__": "prelude", "__builtins__": builtins}
    exec(compile(code, "<prelude>", "exec"), env)
    return {k: v for k, v in env.items() if not k.startswith("__")}


def setup(level):
    mode, cases = build_cases(level)
    names = _prelude_names(level)
    _STATE.update(mode=mode, cases=cases, prelude=names)
    return {"names": dict(names)}


def _need(name):
    """The message for a missing function or class (a capital letter means a class)."""
    name = name or "?"
    if name[:1].isupper():
        return "Your program needs to define a class called %s." % name
    return "Your program needs to define a function called %s()." % name


def _script_helpers(ctx, files, approx):
    source = ctx["source"]
    names = dict(_STATE["prelude"])
    names["input"] = quiet_input

    def check(condition, message="a check failed"):
        if not condition:
            raise _Fail(str(message))

    def expect(actual, expected, label=""):
        if not same(actual, expected, approx):
            raise _Fail("%sexpected %s but got %s" % (label + ": " if label else "", short(expected), short(actual)))

    def raises(exc, fn, *args, **kwargs):
        try:
            fn(*args, **kwargs)
        except exc:
            return True
        except BaseException:
            return False
        return False

    def printed(fn, *args, **kwargs):
        import io

        buf = io.StringIO()
        saved = sys.stdout
        sys.stdout = buf
        try:
            fn(*args, **kwargs)
        finally:
            sys.stdout = saved
        return buf.getvalue()

    def run(stdin=""):
        res = run_source(source, names=names, files=files, stdin=stdin)
        if res["error"]:
            raise _Fail("Your program stopped with an error: " + friendly_error(res["error"]))
        return res["stdout"]

    return {
        "check": check,
        "expect": expect,
        "raises": raises,
        "printed": printed,
        "run": run,
        "source": lambda: source,
        "uses": lambda kind: uses(source, kind),
    }


def _run_script(case, ctx, files, approx):
    """Run one %% test. Returns (ok, message)."""
    env = dict(ctx["ns"])
    env.update(_script_helpers(ctx, files, approx))
    try:
        exec(compile(case["input"], "<test>", "exec"), env)
        return True, None
    except _Fail as e:
        return False, str(e)
    except BaseException as e:
        frames = [t for t in traceback.extract_tb(e.__traceback__) if t.filename == LEARNER_FILE]
        where = " (in your code, line %d)" % frames[-1].lineno if frames else ""
        return False, "%s: %s%s" % (type(e).__name__, e, where)


def finish(ctx):
    level = ctx["level"]
    source = ctx["source"]
    mode, cases = _STATE["mode"], _STATE["cases"]
    approx = cfg(level, "approx")
    approx = float(approx) if approx not in (None, "") else None
    files = {f["arg"]: f["text"] + "\n" for f in secs(level, "file") if f["arg"]}
    syntax = bool(ctx["error"]) and ctx["error"].get("kind") == "syntax"
    results = []
    for c in cases:
        r = {"name": c["name"], "hidden": c["hidden"], "ok": False, "input": c["input"], "expected": c["expected"], "got": "", "error": None}
        if syntax:
            r["error"] = "Fix the error in your program first."
        elif mode == "io":
            names = dict(_STATE["prelude"])
            names["input"] = quiet_input
            res = run_source(source, names=names, files=files, stdin=c["input"])
            r["got"] = res["stdout"].rstrip("\n")
            if res["error"]:
                r["error"] = friendly_error(res["error"])
                if res["error"].get("type") == "EOFError":
                    r["error"] += " (the test gives your program fewer lines than it asked for)"
            else:
                r["ok"] = norm(res["stdout"], level) == norm(c["expected"], level)
        elif not ctx["ok"]:
            r["error"] = "Your program stopped with an error before the test could run. " + friendly_error(ctx["error"])
        elif mode == "function":
            name = cfg(level, "function")
            if not name or not callable(ctx["ns"].get(name)):
                r["error"] = _need(name)
            else:
                try:
                    want = eval(compile(c["expected"], "<expected>", "eval"), dict(_STATE["prelude"], __builtins__=builtins))
                    got = eval(compile(c["input"], "<test>", "eval"), ctx["ns"])
                    r["expected"] = repr(want)
                    r["got"] = repr(got)
                    r["ok"] = same(got, want, approx)
                except BaseException as e:
                    r["error"] = "%s: %s" % (type(e).__name__, e)
        else:  # script
            name = cfg(level, "function")
            if name and not callable(ctx["ns"].get(name)):
                r["error"] = _need(name)
            else:
                r["ok"], r["error"] = _run_script(c, ctx, files, approx)
        if c["hidden"]:
            r["input"] = ""
            if not r["ok"]:
                r["expected"] = ""
                if mode == "script":
                    r["error"] = None
        results.append(r)
    passed_cases = [r for r in results if r["ok"]]
    problems = rule_problems(source, level)
    passed = len(passed_cases) == len(results) and not problems
    lines = code_lines(source)
    stars = stars_for(source, level, passed)
    failed = [r for r in results if not r["ok"]]
    if problems:
        message = problems[0]
    elif failed:
        message = "%d of %d tests failed." % (len(failed), len(results))
    else:
        message = "All %d tests passed." % len(results)
    detail = ""
    if passed and stars < 3 and cfg(level, "par"):
        detail = "Your program uses %d lines. Solve it in %s or fewer for three stars." % (lines, cfg(level, "par"))
    return {
        "passed": passed,
        "stars": stars,
        "message": message,
        "detail": detail,
        "stats": {"lines": lines, "par": cfg(level, "par")},
        "mode": mode,
        "cases": results,
    }
