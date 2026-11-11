"""CodeQuest Python host.

Loaded once into every Pyodide instance (the browser worker and the Node validator use
this same file). JavaScript calls `await __cq_run(json_request)` and gets a JSON string
back. See docs/ARCHITECTURE.md for the request/response shapes.

Modes
  run    run the learner's program, capture stdout/stderr
  test   run the program, then run an exercise's `tests` script against its namespace
  trace  run under sys.settrace and record one step per executed line
  game   run the program with a game harness (see docs/GAMES.md)
"""
import ast
import builtins
import importlib
import inspect
import io
import json
import linecache
import os
import random
import shutil
import sys
import tempfile
import time
import traceback
import types

from pyodide.ffi import can_run_sync, run_sync

LEARNER = "main.py"
TESTS = "<tests>"
HARNESS = "<harness>"
MAX_OUTPUT = 400_000
HOME = "/home/pyodide"
TRACE_LIMIT = 400
_ADDR = __import__("re").compile(r" at 0x[0-9a-fA-F]+")

_DEFAULT_RECURSION = sys.getrecursionlimit()
_emit_cb = None
_input_cb = None


def __cq_configure(emit, request_input):
    global _emit_cb, _input_cb
    _emit_cb = emit
    _input_cb = request_input


def _emit(kind, text):
    if _emit_cb is not None:
        _emit_cb(kind, text)


# ---------------------------------------------------------------------------
# Output capture and stdin
# ---------------------------------------------------------------------------
class _Capture:
    """Collects the output of one execution and (optionally) streams it to the UI."""

    def __init__(self, forward=True, limit=MAX_OUTPUT):
        self.out = []
        self.err = []
        self.size = 0
        self.stdout_len = 0
        self.truncated = False
        self.forward = forward
        self.limit = limit

    def write(self, kind, s):
        n = len(s)
        if not n:
            return 0
        self.size += n
        if self.size > self.limit:
            if not self.truncated:
                self.truncated = True
                if self.forward:
                    _emit("stderr", "\n... output limit reached, the rest is not shown ...\n")
            return n
        if kind == "stdout":
            self.out.append(s)
            self.stdout_len += n
        else:
            self.err.append(s)
        if self.forward:
            _emit(kind, s)
        return n

    def echo(self, s):
        if self.forward:
            _emit("echo", s)

    @property
    def stdout(self):
        return "".join(self.out)

    @property
    def stderr(self):
        return "".join(self.err)


class _Out(io.TextIOBase):
    def __init__(self, cap, kind):
        self._cap = cap
        self._kind = kind

    def write(self, s):
        if not isinstance(s, str):
            raise TypeError("write() argument must be str, not " + type(s).__name__)
        return self._cap.write(self._kind, s)

    def writable(self):
        return True

    def flush(self):
        pass

    def isatty(self):
        return False

    encoding = "utf-8"
    errors = "strict"


class _Session:
    """Everything one run needs for input()."""

    def __init__(self, stdin_lines, interactive, cap):
        self.queue = list(stdin_lines)
        self.interactive = bool(interactive)
        self.cap = cap
        self.asked = False

    def can_prompt(self):
        return self.interactive and can_run_sync()

    def next_line(self, prompt=""):
        """Return the next input line, or None at end of input."""
        self.asked = True
        if self.queue:
            line = self.queue.pop(0)
            self.cap.echo(line + "\n")
            return line
        if self.can_prompt():
            reply = run_sync(_input_cb(str(prompt)))
            if reply is None:
                return None
            return str(reply)
        return None

    def input(self, prompt=""):
        if prompt is not None and prompt != "":
            sys.stdout.write(str(prompt))
        line = self.next_line(prompt)
        if line is None:
            raise EOFError("EOF when reading a line")
        return line


class _Stdin(io.TextIOBase):
    def __init__(self, session):
        self._s = session

    def readline(self, size=-1):
        line = self._s.next_line("")
        return "" if line is None else line + "\n"

    def read(self, size=-1):
        parts = []
        while True:
            line = self._s.next_line("")
            if line is None:
                break
            parts.append(line + "\n")
        return "".join(parts)

    def readlines(self, hint=-1):
        return self.read().splitlines(True)

    def __iter__(self):
        return self

    def __next__(self):
        line = self.readline()
        if not line:
            raise StopIteration
        return line

    def readable(self):
        return True

    def isatty(self):
        return False

    encoding = "utf-8"


class _Redirect:
    def __init__(self, cap, session):
        self.cap = cap
        self.session = session

    def __enter__(self):
        self.saved = (sys.stdout, sys.stderr, sys.stdin, builtins.input, sys.argv, sys.gettrace())
        sys.stdout = _Out(self.cap, "stdout")
        sys.stderr = _Out(self.cap, "stderr")
        sys.stdin = _Stdin(self.session)
        builtins.input = self.session.input
        sys.argv = [LEARNER]
        return self

    def __exit__(self, *exc):
        sys.settrace(None)
        sys.stdout, sys.stderr, sys.stdin, builtins.input, sys.argv, _ = self.saved
        sys.setrecursionlimit(_DEFAULT_RECURSION)
        return False


# ---------------------------------------------------------------------------
# Sandbox: every run happens in a fresh temporary working directory
# ---------------------------------------------------------------------------
_MAIN_SAVED = []


def _new_main(names=None):
    """Make the namespace the learner's program runs in, and install it as `sys.modules["__main__"]`.

    The program has to run inside a real module named __main__ (not a bare dict) because some
    standard-library tools find the program by that name: unittest.main(), doctest.testmod(),
    pickle, and dataclasses or typing.get_type_hints() for classes the program defines.
    _Sandbox puts the previous __main__ module back when the run is over."""
    mod = types.ModuleType("__main__")
    ns = mod.__dict__
    ns["__file__"] = LEARNER
    ns["__builtins__"] = builtins
    if names:
        ns.update(names)
    _MAIN_SAVED.append((sys.modules.get("__main__"), mod))
    sys.modules["__main__"] = mod
    return ns


def _reset_logging():
    """Put the logging module back to its starting state.

    logging keeps global state: handlers hold on to the stderr object of the run that created
    them, and basicConfig() does nothing when a handler already exists. Without this, the second
    run of a program that configures logging would print nothing."""
    lg = sys.modules.get("logging")
    if lg is None:
        return
    try:
        root = lg.getLogger()
        manager = root.manager
        manager.disable = 0
        root.handlers[:] = []
        root.filters[:] = []
        root.setLevel(lg.WARNING)
        for obj in list(manager.loggerDict.values()):
            if isinstance(obj, lg.Logger):
                obj.handlers[:] = []
                obj.filters[:] = []
                obj.setLevel(lg.NOTSET)
                obj.propagate = True
                obj.disabled = False
    except Exception:
        pass


class _Sandbox:
    def __init__(self, files):
        self.files = files or {}

    def __enter__(self):
        _reset_logging()
        self.main_depth = len(_MAIN_SAVED)
        self.before = set(sys.modules)
        self.dir = tempfile.mkdtemp(prefix="cq_")
        os.chdir(self.dir)
        sys.path.insert(0, self.dir)
        for path, content in self.files.items():
            full = os.path.join(self.dir, path)
            os.makedirs(os.path.dirname(full) or self.dir, exist_ok=True)
            with open(full, "w", encoding="utf-8", newline="") as f:
                f.write(content)
        return self

    def __exit__(self, *exc):
        _reset_logging()
        while len(_MAIN_SAVED) > self.main_depth:
            old, _mod = _MAIN_SAVED.pop()
            if old is None:
                sys.modules.pop("__main__", None)
            else:
                sys.modules["__main__"] = old
        try:
            sys.path.remove(self.dir)
        except ValueError:
            pass
        try:
            os.chdir(HOME)
        except OSError:
            os.chdir("/")
        for name in [n for n in sys.modules if n not in self.before]:
            f = getattr(sys.modules.get(name), "__file__", None) or ""
            if f.startswith(self.dir):
                sys.modules.pop(name, None)
        importlib.invalidate_caches()
        shutil.rmtree(self.dir, ignore_errors=True)
        return False


# ---------------------------------------------------------------------------
# Compiling: asyncio.run(...) at top level becomes `await ...`, because the event
# loop is already running inside the page.
# ---------------------------------------------------------------------------
class _AsyncRunRewriter(ast.NodeTransformer):
    def visit_FunctionDef(self, node):
        return node

    visit_AsyncFunctionDef = visit_FunctionDef
    visit_ClassDef = visit_FunctionDef
    visit_Lambda = visit_FunctionDef

    def visit_Call(self, node):
        self.generic_visit(node)
        f = node.func
        if isinstance(f, ast.Attribute) and node.args:
            is_run = f.attr == "run" and isinstance(f.value, ast.Name) and f.value.id == "asyncio"
            if is_run or f.attr == "run_until_complete":
                return ast.copy_location(ast.Await(value=node.args[0]), node)
        return node


def _register_source(code, filename=LEARNER):
    linecache.cache[filename] = (len(code), None, code.splitlines(True), filename)


def _compile(code, filename=LEARNER):
    _register_source(code, filename)
    tree = ast.parse(code, filename, "exec")
    tree = _AsyncRunRewriter().visit(tree)
    ast.fix_missing_locations(tree)
    return compile(tree, filename, "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT, dont_inherit=True)


# ---------------------------------------------------------------------------
# Errors
# ---------------------------------------------------------------------------
def _filter_te(te, seen=None):
    seen = seen if seen is not None else set()
    if id(te) in seen:
        return
    seen.add(id(te))
    te.stack = traceback.StackSummary.from_list([fs for fs in te.stack if fs.filename == LEARNER])
    for sub in (te.__cause__, te.__context__):
        if sub is not None:
            _filter_te(sub, seen)
    for sub in getattr(te, "exceptions", None) or []:
        _filter_te(sub, seen)


def _error_info(e, kind="runtime"):
    info = {"type": type(e).__name__, "message": str(e), "kind": kind}
    try:
        if isinstance(e, SyntaxError):
            info["kind"] = "syntax"
            info["message"] = e.msg
            if e.filename == LEARNER:
                info["line"] = e.lineno
                info["col"] = e.offset
                info["text"] = (e.text or "").rstrip("\n")
        else:
            frames = [fs for fs in traceback.extract_tb(e.__traceback__) if fs.filename == LEARNER]
            if frames:
                info["line"] = frames[-1].lineno
                info["text"] = (frames[-1].line or "").strip()
        te = traceback.TracebackException.from_exception(e)
        _filter_te(te)
        info["trace"] = "".join(te.format()).rstrip("\n")
    except Exception:
        info["trace"] = "{}: {}".format(type(e).__name__, e)
    return info


# ---------------------------------------------------------------------------
# Running learner code
# ---------------------------------------------------------------------------
async def _exec(code, ns, cap, tracer=None):
    """Run `code` in `ns`. Returns (ok, error_info, exit_code)."""
    try:
        co = _compile(code)
    except BaseException as e:  # SyntaxError and friends
        return False, _error_info(e), None
    if tracer is not None:
        sys.settrace(tracer)
    try:
        result = eval(co, ns)
        if co.co_flags & inspect.CO_COROUTINE:
            await result
        return True, None, None
    except SystemExit as e:
        sys.settrace(None)
        c = e.code
        if c is None or c == 0:
            return True, None, 0
        if isinstance(c, str):
            cap.write("stderr", c + "\n")
            return True, None, 1
        return True, None, c if isinstance(c, int) else 1
    except BaseException as e:
        sys.settrace(None)
        return False, _error_info(e), None
    finally:
        sys.settrace(None)


def _exec_sync(code, files=None, stdin=None):
    """Synchronous re-run used by tests (`rerun`). Cannot use top-level await."""
    cap = _Capture(forward=False)
    session = _Session(_lines(stdin), False, cap)
    with _Sandbox(files), _Redirect(cap, session):
        try:
            co = _compile(code)
            if co.co_flags & inspect.CO_COROUTINE:
                raise RuntimeError("rerun() does not support top-level await")
            ns = _new_main()
            eval(co, ns)
        except SystemExit:
            pass
        except BaseException as e:
            return cap.stdout, _error_info(e)
    return cap.stdout, None


def _run_source(source, names=None, files=None, stdin=None):
    """Harness helper: run learner code again, silently, with extra names in its namespace.
    Returns {"ns", "stdout", "stderr", "error"} (error is an error_info dict or None)."""
    cap = _Capture(forward=False)
    session = _Session(_lines(stdin), False, cap)
    err = None
    ns = {}
    with _Sandbox(files), _Redirect(cap, session):
        ns = _new_main(names)
        try:
            co = _compile(source)
            if co.co_flags & inspect.CO_COROUTINE:
                raise RuntimeError("top-level await is not supported in this check")
            eval(co, ns)
        except SystemExit:
            pass
        except BaseException as e:
            err = _error_info(e)
    return {"ns": ns, "stdout": cap.stdout, "stderr": cap.stderr, "error": err}


def _lines(stdin):
    if stdin is None or stdin == "":
        return []
    if isinstance(stdin, (list, tuple)):
        return [str(x) for x in stdin]
    parts = str(stdin).replace("\r\n", "\n").split("\n")
    if parts and parts[-1] == "":
        parts.pop()
    return parts


# ---------------------------------------------------------------------------
# Test helpers (used by exercise `%% tests` sections)
# ---------------------------------------------------------------------------
def _short(r, n=200):
    s = r if isinstance(r, str) else repr(r)
    return s if len(s) <= n else s[: n - 1] + "…"


class _TestKit:
    def __init__(self, ns, cap, code, files):
        self.ns = ns
        self.cap = cap
        self.code = code
        self.files = files
        self.results = []
        self._tree = None

    # --- recording ---------------------------------------------------------
    def _add(self, ok, label, detail=None, hidden=False):
        if hidden and not ok:
            label, detail = "A hidden test failed", None
        self.results.append({"ok": bool(ok), "label": label, "detail": None if ok else detail})
        return bool(ok)

    def check(self, condition, label="", detail=None, hidden=False):
        return self._add(condition, label or "check", detail, hidden)

    def expect(self, actual, expected, label="", approx=None, hidden=False):
        try:
            if approx is not None:
                ok = abs(actual - expected) <= approx
            else:
                ok = actual == expected
        except Exception:
            ok = False
        label = label or "value is {}".format(_short(expected, 80))
        detail = "expected {} but got {}".format(_short(expected), _short(actual))
        return self._add(ok, label, detail, hidden)

    def expect_output(self, expected, label="", strip=True, ignore_case=False, hidden=False):
        got = self.cap.stdout.replace("\r\n", "\n")
        want = str(expected).replace("\r\n", "\n")
        if strip:
            norm = lambda t: "\n".join(line.rstrip() for line in t.strip().split("\n"))
            got, want = norm(got), norm(want)
        if ignore_case:
            got, want = got.lower(), want.lower()
        detail = "the program should print:\n{}\nbut it printed:\n{}".format(want, got if got else "(nothing)")
        return self._add(got == want, label or "prints the expected output", detail, hidden)

    def expect_in_output(self, text, label="", ignore_case=True, hidden=False):
        got = self.cap.stdout
        needle = str(text)
        if ignore_case:
            got, needle = got.lower(), needle.lower()
        return self._add(needle in got, label or "output mentions {}".format(_short(text, 60)), "the output should include {} but it printed:\n{}".format(_short(text, 80), self.cap.stdout or "(nothing)"), hidden)

    def raises(self, exc, fn, *args, **kwargs):
        try:
            fn(*args, **kwargs)
        except exc:
            return True
        except BaseException:
            return False
        return False

    def output(self):
        return self.cap.stdout

    def stdout_lines(self):
        return [ln for ln in self.cap.stdout.split("\n") if ln.strip()]

    def source(self):
        return self.code

    def _ast(self):
        if self._tree is None:
            self._tree = ast.parse(self.code)
        return self._tree

    def uses(self, *names):
        wanted = set(names)
        return any(type(n).__name__ in wanted for n in ast.walk(self._ast()))

    def calls(self, name):
        for n in ast.walk(self._ast()):
            if isinstance(n, ast.Call):
                f = n.func
                if (isinstance(f, ast.Name) and f.id == name) or (isinstance(f, ast.Attribute) and f.attr == name):
                    return True
        return False

    def defines(self, name):
        return any(isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and n.name == name for n in ast.walk(self._ast()))

    def count_lines(self):
        return len([ln for ln in self.code.splitlines() if ln.strip() and not ln.strip().startswith("#")])

    def rerun(self, stdin=None):
        out, err = _exec_sync(self.code, self.files, stdin)
        return out

    def namespace(self):
        env = {
            "check": self.check,
            "expect": self.expect,
            "expect_output": self.expect_output,
            "expect_in_output": self.expect_in_output,
            "raises": self.raises,
            "output": self.output,
            "stdout_lines": self.stdout_lines,
            "source": self.source,
            "uses": self.uses,
            "calls": self.calls,
            "defines": self.defines,
            "count_lines": self.count_lines,
            "rerun": self.rerun,
            "ns": self.ns,
        }
        return env


def _describe_test_error(e):
    frames = [fs for fs in traceback.extract_tb(e.__traceback__) if fs.filename == LEARNER]
    where = " (your code, line {})".format(frames[-1].lineno) if frames else ""
    if isinstance(e, AssertionError):
        return (str(e) or "assertion failed") + where
    return "{}: {}{}".format(type(e).__name__, e, where)


def _run_tests(tests_code, kit):
    tns = dict(kit.ns)
    tns.update(kit.namespace())
    tree = ast.parse(tests_code, TESTS, "exec")
    failed_targets = set()
    for stmt in tree.body:
        seg = (ast.get_source_segment(tests_code, stmt) or "").strip().split("\n")[0]
        try:
            exec(compile(ast.Module([stmt], []), TESTS, "exec"), tns)
            if isinstance(stmt, ast.Assert):
                label = ast.get_source_segment(tests_code, stmt.msg) if stmt.msg is not None else seg
                kit._add(True, label.strip("'\"") if label else seg)
        except BaseException as e:
            names = {n.id for n in ast.walk(stmt) if isinstance(n, ast.Name)}
            if isinstance(e, NameError) and names & failed_targets:
                kit._add(False, _short(seg, 90), "skipped because an earlier step failed")
            else:
                kit._add(False, _short(seg, 90), _describe_test_error(e))
            for n in ast.walk(stmt):
                if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store):
                    failed_targets.add(n.id)


# ---------------------------------------------------------------------------
# Trace mode
# ---------------------------------------------------------------------------
def _vars(frame):
    out = {}
    for k, v in list(frame.f_locals.items()):
        if k.startswith("__") or isinstance(v, types.ModuleType):
            continue
        try:
            if isinstance(v, types.FunctionType):
                r = "function " + v.__name__
            elif isinstance(v, type):
                r = "class " + v.__name__
            elif isinstance(v, types.BuiltinFunctionType):
                continue
            else:
                r = _ADDR.sub("", repr(v))
        except Exception:
            r = "<unprintable>"
        if len(r) > 90:
            r = r[:89] + "…"
        out[k] = [type(v).__name__, r]
        if len(out) >= 40:
            break
    return out


def _make_tracer(steps, cap, state, limit):
    def tracer(frame, event, arg):
        if frame.f_code.co_filename != LEARNER:
            return None
        if state["stop"]:
            return None
        if event in ("line", "return", "exception"):
            if len(steps) >= limit:
                state["stop"] = True
                state["truncated"] = True
                return None
            chain = []
            f = frame
            while f is not None:
                if f.f_code.co_filename == LEARNER:
                    chain.append(f)
                f = f.f_back
            chain.reverse()
            step = {
                "line": frame.f_lineno,
                "ev": event,
                "func": frame.f_code.co_name,
                "frames": [{"name": "Global" if c.f_code.co_name == "<module>" else c.f_code.co_name, "vars": _vars(c)} for c in chain],
                "out": cap.stdout_len,
            }
            if event == "return":
                try:
                    step["ret"] = _short(arg, 90)
                except Exception:
                    step["ret"] = "?"
            elif event == "exception":
                step["exc"] = "{}: {}".format(arg[0].__name__, arg[1])
            steps.append(step)
        return tracer

    return tracer


# ---------------------------------------------------------------------------
# The entry point
# ---------------------------------------------------------------------------
def _json(obj):
    return json.dumps(obj, default=repr, ensure_ascii=False)


async def __cq_run(req_json):
    t0 = time.perf_counter()
    req = json.loads(req_json)
    mode = req.get("mode", "run")
    code = req.get("code", "")
    cap = _Capture(forward=req.get("forward", True))
    session = _Session(_lines(req.get("stdin")), req.get("interactive", False), cap)
    res = {"mode": mode, "ok": True, "error": None, "exit_code": None}
    ns = {}
    harness = None
    injected_modules = []
    try:
        seed = req.get("seed")
        if seed is None and mode in ("test", "game"):
            seed = 1234
        if seed is not None:
            random.seed(seed)
        with _Sandbox(req.get("files")), _Redirect(cap, session):
            ns = _new_main()
            if mode == "game":
                H = {"__name__": "harness", "__builtins__": builtins, "error_info": _error_info, "LEARNER_FILE": LEARNER, "run_source": _run_source}
                exec(compile(req["harness"], HARNESS, "exec"), H)
                harness = H
                setup = H.get("setup")
                if setup is not None:
                    inj = setup(req.get("level") or {}) or {}
                    for name, attrs in (inj.get("modules") or {}).items():
                        mod = attrs if isinstance(attrs, types.ModuleType) else types.ModuleType(name)
                        if isinstance(attrs, dict):
                            mod.__dict__.update(attrs)
                        sys.modules[name] = mod
                        injected_modules.append(name)
                    ns.update(inj.get("names") or {})
            tracer = None
            steps = []
            tstate = {"stop": False, "truncated": False}
            if mode == "trace":
                tracer = _make_tracer(steps, cap, tstate, req.get("trace_limit", TRACE_LIMIT))
            ok, err, exit_code = await _exec(code, ns, cap, tracer)
            res["ok"], res["error"], res["exit_code"] = ok, err, exit_code
            if mode == "trace":
                final = {"line": None, "ev": "end", "func": "<module>", "frames": [], "out": cap.stdout_len}
                final["frames"] = [{"name": "Global", "vars": _vars_ns(ns)}]
                steps.append(final)
                res["steps"] = steps
                res["trace_truncated"] = tstate["truncated"]
            elif mode == "test":
                kit = _TestKit(ns, cap, code, req.get("files"))
                if ok:
                    try:
                        _run_tests(req.get("tests", ""), kit)
                    except BaseException as e:  # bad test script (author error)
                        kit._add(False, "The tests could not run", "{}: {}".format(type(e).__name__, e))
                res["tests"] = kit.results
                res["tests_ok"] = bool(ok and kit.results and all(r["ok"] for r in kit.results))
            elif mode == "game":
                ctx = {"ns": ns, "ok": ok, "error": err, "stdout": cap.stdout, "stderr": cap.stderr, "source": code, "level": req.get("level") or {}, "exit_code": exit_code}
                try:
                    g = harness["finish"](ctx)
                    if inspect.isawaitable(g):
                        g = await g
                    res["game"] = g
                except BaseException as e:
                    res["game"] = {"passed": False, "harness_error": "".join(traceback.format_exception(e))[-1500:]}
    except BaseException as e:
        res["ok"] = False
        res["error"] = {"type": type(e).__name__, "message": str(e), "kind": "internal", "trace": "".join(traceback.format_exception(e))[-1500:]}
    finally:
        for name in injected_modules:
            sys.modules.pop(name, None)
        linecache.cache.pop(LEARNER, None)
    res["stdout"] = cap.stdout
    res["stderr"] = cap.stderr
    res["truncated"] = cap.truncated
    res["asked_input"] = session.asked
    res["ms"] = round((time.perf_counter() - t0) * 1000)
    return _json(res)


def _vars_ns(ns):
    class _F:
        f_locals = ns

    return _vars(_F)


def __cq_info():
    return _json({"python": sys.version.split()[0], "can_run_sync": False})
