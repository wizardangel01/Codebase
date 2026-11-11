"""Rover world: the learner programs a small robot on a grid.

Used by every game whose `engine` is `rover`. Level data (see docs/GAMES.md):

    %% config      facing, commands, battery, win, expect_say, exact_say, par, forbid, require, comments, max_lines, theme
    %% map [name]  the grid (repeat the section to test the same program on several maps)

Map symbols:  # rock   . floor   R rover start   G goal pad   x lava   c crystal   k key   D locked door
"""
import sys
import types

DIRS = [(0, -1), (1, 0), (0, 1), (-1, 0)]
DIR_NAMES = ["north", "east", "south", "west"]

BASIC = ["move", "turn_left", "turn_right", "pick_up", "say"]
SENSORS = ["front_is_clear", "left_is_clear", "right_is_clear", "on_goal", "on_crystal", "has_key", "crystals_left", "facing", "position"]


class RoverCrash(Exception):
    """The rover could not do what the program asked (for example it bumped into rock)."""


class RoverLost(BaseException):
    """The rover was destroyed. The mission is over."""


class BatteryDead(BaseException):
    """The battery ran out. The mission is over."""


class World:
    def __init__(self, text, level, name):
        self.name = name
        self.level = level
        rows = [r.rstrip() for r in text.split("\n")]
        self.h = len(rows)
        self.w = max(len(r) for r in rows)
        rows = [r.ljust(self.w, "#") for r in rows]
        self.rock, self.lava, self.goals = set(), set(), set()
        self.crystals, self.keys, self.doors = {}, {}, {}
        self.start = None
        tiles = []
        for y, row in enumerate(rows):
            line = ""
            for x, ch in enumerate(row):
                base = "."
                if ch == "#":
                    base = "#"
                    self.rock.add((x, y))
                elif ch == "G":
                    base = "G"
                    self.goals.add((x, y))
                elif ch == "x":
                    base = "x"
                    self.lava.add((x, y))
                elif ch == "R":
                    if self.start is not None:
                        raise ValueError("map '%s' has more than one R" % name)
                    self.start = (x, y)
                elif ch == "c":
                    self.crystals["c%d" % len(self.crystals)] = (x, y)
                elif ch == "k":
                    self.keys["k%d" % len(self.keys)] = (x, y)
                elif ch == "D":
                    self.doors["d%d" % len(self.doors)] = (x, y)
                elif ch in ". ":
                    pass
                else:
                    raise ValueError("map '%s': unknown symbol %r at column %d, row %d" % (name, ch, x + 1, y + 1))
                line += base
            tiles.append(line)
        if self.start is None:
            raise ValueError("map '%s' has no R (rover start)" % name)
        self.tiles = tiles
        self.x, self.y = self.start
        facing = str(cfg(level, "facing", "east")).lower()
        self.dir = DIR_NAMES.index(facing) if facing in DIR_NAMES else 1
        self.battery = int(cfg(level, "battery", 150))
        self.battery_max = self.battery
        self.actions = 0
        self.held_keys = 0
        self.collected = 0
        self.total_crystals = len(self.crystals)
        self.said = []
        self.dead = None  # reason text when the mission cannot continue
        self.frames = []
        self.total_keys = len(self.keys)
        self.snap("Ready at column %d, row %d, facing %s." % (self.x + 1, self.y + 1, DIR_NAMES[self.dir]))

    # --- recording --------------------------------------------------------------
    def scene(self):
        return {"cols": self.w, "rows": self.h, "tiles": self.tiles, "theme": cfg(self.level, "theme", "space")}

    def hud(self):
        out = {"battery": "%d" % self.battery}
        if self.total_crystals:
            out["crystals"] = "%d / %d" % (self.collected, self.total_crystals)
        if self.total_keys:
            out["keys"] = "%d" % self.held_keys
        return out

    def snap(self, msg="", fx=None, say=None):
        if len(self.frames) >= FRAME_LIMIT:
            return
        ents = []
        for i, p in self.doors.items():
            ents.append([i, "door", p[0], p[1]])
        for i, p in self.keys.items():
            ents.append([i, "key", p[0], p[1]])
        for i, p in self.crystals.items():
            ents.append([i, "crystal", p[0], p[1]])
        ents.append(["rover", "rover", self.x, self.y, {"dir": self.dir}])
        frame = {"ents": ents, "msg": msg, "hud": self.hud()}
        if fx:
            frame["fx"] = fx
        if say is not None:
            frame["say"] = ["rover", say]
        self.frames.append(frame)

    def spend(self):
        if self.dead:
            raise BatteryDead(self.dead)
        if self.battery <= 0:
            self.dead = "The battery ran out after %d actions. Plan a shorter route or use a loop." % self.actions
            self.snap(self.dead, fx=["dead"])
            raise BatteryDead(self.dead)
        self.battery -= 1
        self.actions += 1

    # --- helpers ----------------------------------------------------------------------
    def tile_blocked(self, x, y):
        if x < 0 or y < 0 or x >= self.w or y >= self.h:
            return "the edge of the map"
        if (x, y) in self.rock:
            return "a rock"
        if (x, y) in self.doors.values() and self.held_keys <= 0:
            return "a locked door"
        return None

    def ahead(self, turn=0):
        d = DIRS[(self.dir + turn) % 4]
        return self.x + d[0], self.y + d[1]

    # --- commands -----------------------------------------------------------------------
    def move(self):
        self.spend()
        nx, ny = self.ahead()
        why = self.tile_blocked(nx, ny)
        if why:
            msg = "The rover bumped into %s at column %d, row %d." % (why, nx + 1, ny + 1)
            self.snap(msg, fx=["bump"])
            raise RoverCrash(msg + " Turn first, or choose a different route.")
        for i, p in list(self.doors.items()):
            if p == (nx, ny):
                del self.doors[i]
                self.held_keys -= 1
        self.x, self.y = nx, ny
        if (nx, ny) in self.lava:
            self.dead = "The rover rolled into lava at column %d, row %d." % (nx + 1, ny + 1)
            self.snap(self.dead, fx=["burn"])
            raise RoverLost(self.dead)
        # picking up keys is automatic
        for i, p in list(self.keys.items()):
            if p == (nx, ny):
                del self.keys[i]
                self.held_keys += 1
        self.snap("Moved to column %d, row %d." % (nx + 1, ny + 1))

    def turn_left(self):
        self.spend()
        self.dir = (self.dir - 1) % 4
        self.snap("Turned left. Now facing %s." % DIR_NAMES[self.dir])

    def turn_right(self):
        self.spend()
        self.dir = (self.dir + 1) % 4
        self.snap("Turned right. Now facing %s." % DIR_NAMES[self.dir])

    def pick_up(self):
        self.spend()
        for i, p in list(self.crystals.items()):
            if p == (self.x, self.y):
                del self.crystals[i]
                self.collected += 1
                self.snap("Picked up a crystal.", fx=["pick"])
                return
        self.snap("There was nothing to pick up here.")

    def say(self, *parts, sep=" "):
        text = sep.join(str(p) for p in parts)
        print(text)
        self.said.append(text)
        self.snap('The rover says "%s".' % text, say=text)

    # --- sensors (free: they do not use battery) -------------------------------------------------
    def _clear(self, turn):
        nx, ny = self.ahead(turn)
        if self.tile_blocked(nx, ny):
            return False
        return (nx, ny) not in self.lava

    def front_is_clear(self):
        return self._clear(0)

    def left_is_clear(self):
        return self._clear(-1)

    def right_is_clear(self):
        return self._clear(1)

    def on_goal(self):
        return (self.x, self.y) in self.goals

    def on_crystal(self):
        return (self.x, self.y) in self.crystals.values()

    def has_key(self):
        return self.held_keys > 0

    def crystals_left(self):
        return len(self.crystals)

    def facing(self):
        return DIR_NAMES[self.dir]

    def position(self):
        return (self.x + 1, self.y + 1)


def expand_commands(level):
    raw = words(cfg(level, "commands", "basic"))
    out = []
    for w in raw:
        if w == "basic":
            out += BASIC
        elif w == "sensors":
            out += SENSORS
        elif w == "all":
            out += BASIC + SENSORS
        else:
            out.append(w)
    return out


def make_api(world, level):
    allowed = set(expand_commands(level))
    every = {n: getattr(world, n) for n in BASIC + SENSORS}
    return {k: v for k, v in every.items() if k in allowed}


class _Modules:
    """Temporarily publish the commands as a module called `rover` (for `from rover import *`)."""

    def __init__(self, api):
        self.api = api

    def __enter__(self):
        mod = types.ModuleType("rover")
        mod.__dict__.update(self.api)
        mod.RoverCrash = RoverCrash
        self.old = sys.modules.get("rover")
        sys.modules["rover"] = mod

    def __exit__(self, *a):
        if self.old is None:
            sys.modules.pop("rover", None)
        else:
            sys.modules["rover"] = self.old


_STATE = {}


def setup(level):
    maps = secs(level, "map")
    if not maps:
        raise ValueError("this rover level has no %% map section")
    worlds = [World(m["text"], level, (m["arg"] or "").strip() or ("Map %d" % (i + 1))) for i, m in enumerate(maps)]
    _STATE["worlds"] = worlds
    api = make_api(worlds[0], level)
    return {"names": api, "modules": {"rover": dict(api, RoverCrash=RoverCrash)}}


def wins_needed(world, level):
    win = words(cfg(level, "win"))
    if win:
        return win
    need = []
    if world.goals:
        need.append("goal")
    if world.total_crystals:
        need.append("crystals")
    return need


def judge(world, level, ok, error):
    """Return (passed, message) for one finished run on one world."""
    if world.dead:
        return False, world.dead
    if error:
        if error.get("type") == "RoverCrash":
            return False, "The program stopped because the rover could not follow a command. %s" % error.get("message", "")
        return False, "Your program stopped with an error. %s" % friendly_error(error)
    need = wins_needed(world, level)
    if "goal" in need and (world.x, world.y) not in world.goals:
        return False, "The rover finished at column %d, row %d, not on the goal pad." % (world.x + 1, world.y + 1)
    if "crystals" in need and world.crystals:
        n = len(world.crystals)
        return False, "%d crystal%s still on the map. Pick up every crystal." % (n, " is" if n == 1 else "s are")
    say = cfg(level, "expect_say")
    if say not in (None, "", []):
        wanted = [str(s).strip() for s in (say if isinstance(say, list) else [say])]
        if cfg(level, "exact_say"):
            # exact_say: the rover must say these messages and nothing else
            spoken = [s.strip() for s in world.said]
            if spoken != wanted:
                heard = ", ".join('"%s"' % s for s in spoken) if spoken else "nothing"
                return False, "The rover said %s. Mission control wants exactly %s, nothing more and nothing less." % (heard, ", then ".join('"%s"' % w for w in wanted))
        said = iter(s.strip() for s in world.said)
        # the wanted messages must appear in this order (other messages in between are fine)
        if not all(any(w == s for s in said) for w in wanted):
            if len(wanted) == 1:
                return False, 'The rover needs to say "%s" (spelled exactly like that).' % wanted[0]
            return False, "The rover needs to say %s, in that order, spelled exactly like that." % ", then ".join('"%s"' % w for w in wanted)
    if cfg(level, "say_on_goal") and not any(w for w in world.said):
        return False, "The rover should say something when the mission is done."
    return True, "Mission complete."


def finish(ctx):
    level = ctx["level"]
    source = ctx["source"]
    worlds = _STATE["worlds"]
    scenarios = []
    ok_all = True
    first = worlds[0]
    passed, msg = judge(first, level, ctx["ok"], ctx["error"])
    scenarios.append((first, passed, msg))
    syntax = bool(ctx["error"]) and ctx["error"].get("kind") == "syntax"
    for w in worlds[1:]:
        if syntax:
            scenarios.append((w, False, "Fix the error in your program first."))
            continue
        api = make_api(w, level)
        with _Modules(api):
            res = run_source(source, names=api)
        p, m = judge(w, level, res["error"] is None, res["error"])
        scenarios.append((w, p, m))
    for w, p, m in scenarios:
        w.snap(("Mission complete." if p else m), fx=["win" if p else "fail"])
    ok_all = all(p for _, p, _ in scenarios)
    problems = rule_problems(source, level)
    passed = ok_all and not problems
    lines = code_lines(source)
    stars = stars_for(source, level, passed)
    if problems:
        message = problems[0]
    elif not ok_all:
        bad = [(w, m) for w, p, m in scenarios if not p]
        message = bad[0][1] if len(scenarios) == 1 else "%s: %s" % (bad[0][0].name, bad[0][1])
    else:
        message = "Mission complete."
    detail = ""
    if passed and stars < 3 and cfg(level, "par"):
        detail = "Your program uses %d lines. Solve it in %s or fewer for three stars." % (lines, cfg(level, "par"))
    return {
        "passed": passed,
        "stars": stars,
        "message": message,
        "detail": detail,
        "stats": {"lines": lines, "actions": sum(w.actions for w, _, _ in scenarios), "par": cfg(level, "par")},
        "scenarios": [{"name": w.name, "passed": p, "message": m, "scene": w.scene(), "frames": w.frames} for w, p, m in scenarios],
    }
