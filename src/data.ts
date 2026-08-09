import type { IconName } from "./components/GameIcon";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Nightmare";

export interface Challenge {
  id: number;
  title: string;
  desc: string;
  xp: number;
  timeMin: number;
  lang: string; // The display name (e.g. "Flask", "C", "C++")
  monacoLang: string; // The technical ID for Monaco
  difficulty: Difficulty;
  code: string;
  solution: string;
  bug: string;
  expectedError: string;
  hints: string[];
  checkKey: string;
}

export interface Track {
  slug: string;
  name: string;
  icon: IconName;
  desc: string;
  done: number;
  total: number;
  accent: string;
  challenges: Challenge[];
}

function ch(
  id: number, title: string, desc: string, xp: number, timeMin: number,
  lang: string, difficulty: Difficulty,
  code: string, solution: string, bug: string, expectedError: string,
  hints: string[], checkKey: string,
  monacoLangOverride?: string
): Challenge {
  const monacoLang = monacoLangOverride || lang.toLowerCase();
  return { id, title, desc, xp, timeMin, lang, monacoLang, difficulty, code, solution, bug, expectedError, hints, checkKey };
}

/* ========= PYTHON TRACK ========= */
const pythonBeginner: Challenge[] = [
  ch(1, "Sliced Too Thin", "The slice chops off one character too many.", 45, 3, "python", "Beginner",
    `def first_n(text, n):
    return text[:n - 1]

print(first_n("hello world", 5))`,
    `def first_n(text, n):
    return text[:n]`,
    "Off-by-one in the slice end — n-1 cuts one short",
    "Output: 'hell' instead of 'hello'",
    ["Slice ends are exclusive — [:n] includes index n-1", "Drop the -1"],
    "text[:n]"
  ),
  ch(2, "Division Rounding", "Averages come out as whole numbers.", 50, 3, "python", "Beginner",
    `def mean(values):
    return sum(values) // len(values)

print(mean([1, 2, 3, 4]))`,
    `def mean(values):
    return sum(values) / len(values)`,
    "// floors the result instead of doing true division",
    "Output: 2 instead of 2.5",
    ["// is integer (floor) division", "A single / returns a float"],
    "sum(values) / len"
  ),
  ch(3, "Typo Comparison", "A single = where == should be.", 45, 3, "python", "Beginner",
    `def is_adult(age):
    if age = 18:
        return "exactly adult"
    return "not exactly"

print(is_adult(18))`,
    `    if age == 18:`,
    "= assigns instead of comparing",
    "SyntaxError: invalid syntax",
    ["= assigns, == compares", "Fix the condition to use =="],
    "age == 18"
  ),
  ch(4, "Missing Conversion", "Concatenating a string and a number crashes.", 45, 3, "python", "Beginner",
    `player = "Kai"
score = 42
print("Score for " + player + ": " + score)`,
    `print("Score for " + player + ": " + str(score))`,
    "str and int cannot be concatenated directly",
    "TypeError: can only concatenate str",
    ["Convert the number with str()", "Or use an f-string"],
    "str(score)"
  ),
  ch(5, "Runs Off the End", "The loop reads one item past the list.", 55, 4, "python", "Beginner",
    `def has_adjacent_duplicates(items):
    for i in range(len(items)):
        if items[i] == items[i + 1]:
            return True
    return False

print(has_adjacent_duplicates([1, 2, 2, 3]))`,
    `    for i in range(len(items) - 1):`,
    "items[i + 1] goes out of bounds on the last iteration",
    "IndexError: list index out of range",
    ["The last valid pair ends at len(items)-2", "Stop one early: range(len(items) - 1)"],
    "range(len(items) - 1)"
  ),
  ch(6, "Overzealous Filter", "Falsy values get dropped along with None.", 50, 3, "python", "Beginner",
    `def drop_missing(values):
    return [v for v in values if v]

print(drop_missing([0, 1, "", "a", None, 2]))`,
    `def drop_missing(values):
    return [v for v in values if v is not None]`,
    "if v filters out 0 and '' along with None",
    "Output: [1, 'a', 2] — 0 and '' missing",
    ["Only None should be removed", "Test identity: v is not None"],
    "v is not None"
  ),
  ch(7, "No Such Method", "Strings do not have that method.", 45, 3, "python", "Beginner",
    `def flip(word):
    return word.reverse()

print(flip("stressed"))`,
    `def flip(word):
    return word[::-1]`,
    "str has no .reverse() — that is a list method",
    "AttributeError: 'str' object has no attribute 'reverse'",
    ["Use a slice with step -1", "word[::-1] reverses a string"],
    "word[::-1]"
  ),
  ch(8, "Discarded Update", "The result of the addition was never stored.", 50, 3, "python", "Beginner",
    `def cart_total(items):
    total = 0
    for item in items:
        total + item["price"]
    return total

print(cart_total([{"price": 10}, {"price": 5}]))`,
    `        total += item["price"]`,
    "total + price computes a value that is thrown away",
    "Output: 0 instead of 15",
    ["Use += to assign back", "total += x means total = total + x"],
    "total += item"
  ),
  ch(9, "Silent Return", "The function prints but never returns a result.", 45, 3, "python", "Beginner",
    `def first_positive(numbers):
    for num in numbers:
        if num > 0:
            print(num)
            break

print(first_positive([-3, 7, 2]))`,
    `        if num > 0:
            return num`,
    "The value is printed, never returned",
    "Output: None (after printing 7)",
    ["Return the number instead of printing it", "break after return is dead code"],
    "return num"
  ),
  ch(10, "One Past the End", "Indexing with len() is out of range.", 45, 3, "python", "Beginner",
    `def last_element(items):
    return items[len(items)]

print(last_element([1, 2, 3]))`,
    `    return items[-1]`,
    "len(items) is one past the last valid index",
    "IndexError: list index out of range",
    ["Indexes run from 0 to len-1", "Use -1 for the last element"],
    "items[-1]"
  ),
];

const pythonIntermediate: Challenge[] = [
  ch(11, "Unhashable Tally", "A list sneaks into a dict as a key.", 140, 5, "python", "Intermediate",
    `def tally(sessions):
    counts = {}
    for s in sessions:
        tags = s["tags"]
        counts[tags] = counts.get(tags, 0) + 1
    return counts

print(tally([{"tags": ["python"]}, {"tags": ["python"]}]))`,
    `        tags = tuple(s["tags"])`,
    "lists are unhashable — they cannot be dict keys",
    "TypeError: unhashable type: 'list'",
    ["Convert the list to a tuple", "tuple(...) is hashable and can be compared"],
    "tuple(s[\"tags\"])"
  ),
  ch(12, "One-Shot Iterator", "The generator is spent after the first pass.", 150, 5, "python", "Intermediate",
    `def id_stream():
    return (i for i in range(100, 106))

ids = id_stream()
first_batch = [next(ids) for _ in range(3)]
second_batch = list(ids)
print(first_batch, second_batch)`,
    `def id_stream():
    return list(i for i in range(100, 106))`,
    "a generator can only be consumed once",
    "Output: [100, 101, 102] [] — second batch empty",
    ["Generators are single-use iterators", "Materialize with list() if you need it twice"],
    "list(i for"
  ),
  ch(13, "Skips While Removing", "Deleting items while iterating skips neighbors.", 145, 5, "python", "Intermediate",
    `users = ["alice", "banned_bob", "carol", "banned_dave"]
for user in users:
    if user.startswith("banned"):
        users.remove(user)
print(users)`,
    `users = [u for u in users if not u.startswith("banned")]`,
    "removing during iteration shifts elements past the loop",
    "Output: ['alice', 'carol', 'banned_dave'] — dave survived",
    ["Never mutate a list you are iterating", "Filter with a comprehension instead"],
    "u for u in users if not"
  ),
  ch(14, "Shared Shopping List", "A class attribute is shared by every instance.", 135, 5, "python", "Intermediate",
    `class Cart:
    items = []

    def __init__(self, owner):
        self.owner = owner

    def add(self, item):
        self.items.append(item)

a = Cart("alice")
b = Cart("bob")
a.add("keyboard")
print(b.items)`,
    `    def __init__(self, owner):
        self.owner = owner
        self.items = []`,
    "items = [] at class level is one list for every cart",
    "Output: ['keyboard'] — bob has alice's item",
    ["Move items into __init__", "self.items = [] creates a per-instance list"],
    "self.items = []"
  ),
  ch(15, "Loop Closure Trap", "Every lambda sees the final loop value.", 160, 6, "python", "Intermediate",
    `def multipliers():
    funcs = []
    for factor in range(1, 4):
        funcs.append(lambda x: x * factor)
    return funcs

for f in multipliers():
    print(f(10))`,
    `        funcs.append(lambda x, f=factor: x * f)`,
    "the closure captures the variable, not its value",
    "Output: 30, 30, 30 instead of 10, 20, 30",
    ["Bind the value as a default argument", "lambda x, f=factor: ... snapshots factor"],
    "f=factor"
  ),
  ch(16, "Case-Sensitive Sort", "Capitalized names sort before lowercase ones.", 130, 5, "python", "Intermediate",
    `cities = ["Mumbai", "delhi", "Bengaluru", "chennai"]
cities.sort()
print(cities)`,
    `cities.sort(key=str.lower)`,
    "ASCII ordering puts uppercase letters first",
    "Output: ['Bengaluru', 'Mumbai', 'chennai', 'delhi']",
    ["Compare case-insensitively", "sort(key=str.lower) normalizes the comparison"],
    "key=str.lower"
  ),
  ch(17, "Shallow Backup", "Copying the outer list still shares the inner ones.", 140, 5, "python", "Intermediate",
    `matrix = [[1, 2], [3, 4]]
backup = matrix[:]
backup[0].append(99)
print(matrix)`,
    `import copy
backup = copy.deepcopy(matrix)`,
    "slicing copies only the top level of the list",
    "Output: [[1, 2, 99], [3, 4]] — original mutated",
    ["deepcopy() recurses into nested structures", "Slicing is fine for flat lists only"],
    "deepcopy(matrix)"
  ),
  ch(18, "Float on the Edge", "Exact equality fails for computed floats.", 135, 5, "python", "Intermediate",
    `def within_budget(price, budget):
    return price == budget

print(within_budget(10.1 + 0.2, 10.3))`,
    `import math

def within_budget(price, budget):
    return math.isclose(price, budget, rel_tol=1e-9)`,
    "10.1 + 0.2 is not exactly 10.3 in binary floating point",
    "Output: False — budget check fails",
    ["Use math.isclose() for float comparisons", "rel_tol sets the allowed relative error"],
    "math.isclose(price, budget"
  ),
  ch(19, "Sneaky OR Precedence", "and binds tighter than or — access leaks.", 145, 5, "python", "Intermediate",
    `def can_access(user):
    return user["admin"] or user["role"] == "owner" and not user["banned"]

print(can_access({"admin": True, "role": "guest", "banned": True}))`,
    `    return (user["admin"] or user["role"] == "owner") and not user["banned"]`,
    "without parens, admin alone bypasses the ban check",
    "Output: True — a banned admin gets in",
    ["Group the OR branch in parentheses", "(a or b) and not banned"],
    ') and not user["banned"]'
  ),
  ch(20, "Bare Except", "The catch-all also swallows Ctrl+C and real bugs.", 130, 5, "python", "Intermediate",
    `def parse_count(text):
    try:
        return int(text)
    except:
        return 0

print(parse_count("1.5"))`,
    `    except ValueError:
        return 0`,
    "a bare except catches everything, hiding genuine errors",
    "Output: 0 — 1.5 silently becomes zero",
    ["Catch the specific error: except ValueError:", "Bare except also eats KeyboardInterrupt"],
    "except ValueError:"
  ),
];

const pythonAdvanced: Challenge[] = [
  ch(21, "Crossed Locks", "Two threads grab the locks in opposite order.", 260, 8, "python", "Advanced",
    `import threading

lock_a = threading.Lock()
lock_b = threading.Lock()

def worker1():
    lock_a.acquire()
    lock_b.acquire()
    print("worker1 done")
    lock_b.release()
    lock_a.release()

def worker2():
    lock_b.acquire()
    lock_a.acquire()
    print("worker2 done")
    lock_a.release()
    lock_b.release()

t1 = threading.Thread(target=worker1)
t2 = threading.Thread(target=worker2)
t1.start()
t2.start()`,
    `def worker1():
    with lock_a:
        with lock_b:
            print("worker1 done")

def worker2():
    with lock_a:
        with lock_b:
            print("worker2 done")`,
    "locks are acquired in different orders — a classic deadlock",
    "Program hangs forever",
    ["Always acquire every lock in the same order", "The with statement also releases on exceptions"],
    "with lock_a:"
  ),
  ch(22, "Lost Updates", "Concurrent increments drop writes.", 250, 8, "python", "Advanced",
    `import threading

counter = {"count": 0}

def increment():
    for _ in range(10000):
        counter["count"] = counter["count"] + 1

t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)
t1.start(); t2.start(); t1.join(); t2.join()
print(counter["count"])`,
    `import threading

lock = threading.Lock()

def increment():
    for _ in range(10000):
        with lock:
            counter["count"] = counter["count"] + 1`,
    "read-modify-write is not atomic — threads interleave",
    "Output is less than 20000 on every run",
    ["Serialize the critical section with a Lock", "with lock: makes the update atomic"],
    "with lock:"
  ),
  ch(23, "Threads Don't Speed Up", "The GIL serializes CPU-bound work.", 240, 7, "python", "Advanced",
    `import threading
import time

def crunch(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

start = time.time()
t1 = threading.Thread(target=crunch, args=(30_000_000,))
t2 = threading.Thread(target=crunch, args=(30_000_000,))
t1.start(); t2.start(); t1.join(); t2.join()
print(f"{time.time() - start:.2f}s")`,
    `import multiprocessing

if __name__ == "__main__":
    with multiprocessing.Pool(2) as pool:
        pool.map(crunch, [30_000_000, 30_000_000])`,
    "the GIL only lets one thread run Python code at a time",
    "Two threads take as long as one — sometimes longer",
    ["Use multiprocessing for CPU-bound work", "multiprocessing.Pool runs true parallel processes"],
    "multiprocessing.Pool"
  ),
  ch(24, "Property Feedback Loop", "The getter reads itself forever.", 250, 8, "python", "Advanced",
    `class User:
    def __init__(self, name):
        self.name = name

    @property
    def name(self):
        return self.name

u = User("ada")
print(u.name)`,
    `class User:
    def __init__(self, name):
        self._name = name

    @property
    def name(self):
        return self._name`,
    "self.name inside the name getter calls the getter again",
    "RecursionError: maximum recursion depth exceeded",
    ["Back the property with a private attribute", "self._name is a plain attribute, not a property"],
    "self._name"
  ),
  ch(25, "Read-Only Field", "A descriptor without __set__ swallows writes.", 245, 8, "python", "Advanced",
    `class Lowered:
    def __get__(self, obj, objtype=None):
        return getattr(obj, "_value", None)

class Config:
    key = Lowered()

c = Config()
c.key = "SECRET"
print(c.key)`,
    `class Lowered:
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, "_value", None)

    def __set__(self, obj, value):
        obj._value = value.lower()`,
    "without __set__, assignment replaces the descriptor entirely",
    "Output: 'SECRET' instead of the lowered 'secret'",
    ["Data descriptors need __set__ to intercept writes", "Store the normalized value on the instance"],
    "def __set__(self, obj, value):"
  ),
  ch(26, "Blocking the Loop", "A sync call freezes the entire event loop.", 240, 8, "python", "Advanced",
    `import asyncio
import time

async def fetch():
    await asyncio.sleep(0.1)
    return "data"

async def slow():
    time.sleep(3)
    return "done"

async def main():
    a = asyncio.create_task(fetch())
    b = asyncio.create_task(slow())
    print(await asyncio.gather(a, b))

asyncio.run(main())`,
    `async def slow():
    await asyncio.sleep(3)
    return "done"`,
    "time.sleep blocks the loop — no other task can run",
    "fetch() also takes 3 seconds",
    ["Use await asyncio.sleep() inside coroutines", "time.sleep() belongs only in sync code"],
    "await asyncio.sleep(3)"
  ),
  ch(27, "Erased Metadata", "The decorator hides the function's identity.", 230, 7, "python", "Advanced",
    `def timed(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@timed
def process():
    """Handles the payload."""
    return 42

print(process.__name__)
print(process.__doc__)`,
    `import functools

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper`,
    "wrapper is returned bare — __name__ and __doc__ are lost",
    "Output: wrapper, None",
    ["Decorate the wrapper with @functools.wraps(func)", "wraps() copies __name__, __doc__, __module__"],
    "functools.wraps(func)"
  ),
  ch(28, "Lost Cause Chain", "Raising from an except drops the original error.", 220, 7, "python", "Advanced",
    `def load_file():
    raise ValueError("corrupt file")

def run():
    try:
        load_file()
    except ValueError:
        raise RuntimeError("load failed")

try:
    run()
except RuntimeError as e:
    print(type(e.__cause__).__name__ if e.__cause__ else "No cause")`,
    `    except ValueError as e:
        raise RuntimeError("load failed") from e`,
    "without 'from e' the root cause is only implicit context",
    "Output: No cause — a debugging dead end",
    ["Chain with raise ... from e", "e.__cause__ then points at the original error"],
    "from e"
  ),
  ch(29, "Generator Left Open", "A half-consumed generator holds its frame alive.", 225, 7, "python", "Advanced",
    `def lines_from(handle):
    for line in handle:
        yield line.rstrip()

src = ["a", "b", "c"]
gen = lines_from(iter(src))
print(next(gen))
print(next(gen))
# never exhausted — the frame and handle stay alive`,
    `gen = lines_from(iter(src))
print(next(gen))
print(next(gen))
gen.close()`,
    "an abandoned generator keeps its locals until garbage collection",
    "ResourceWarning: unclosed generator",
    ["Close it explicitly when you stop early", "gen.close() releases the frame immediately"],
    "gen.close()"
  ),
  ch(30, "Context Leak Across Tasks", "ContextVars do not follow gather() coroutines.", 270, 9, "python", "Advanced",
    `import asyncio
from contextvars import ContextVar

request_id = ContextVar("request_id", default="none")

async def process():
    print(f"handling {request_id.get()}")
    await asyncio.sleep(0.1)

async def main():
    request_id.set("req-42")
    await asyncio.gather(process(), process())

asyncio.run(main())`,
    `async def main():
    request_id.set("req-42")
    t1 = asyncio.create_task(process())
    t2 = asyncio.create_task(process())
    await asyncio.gather(t1, t2)`,
    "gather() runs coroutines in the caller's context instead of fresh task contexts",
    "Output: handling none, handling none — context lost",
    ["Use asyncio.create_task() to give each task a context", "Each task inherits a snapshot of the current context"],
    "asyncio.create_task(process())"
  ),
];

const pythonNightmare: Challenge[] = [
  ch(31, "Memory Sabotage", "ctypes writes over a CPython interned integer.", 350, 12, "python", "Nightmare",
    `import ctypes

def sabotage():
    x = 42
    ctypes.c_int.from_address(id(x)).value = 0
    return x

print(sabotage())`,
    `def sabotage():
    value = 42
    return value

print(sabotage())`,
    "ctypes corrupts the object that all 42s share",
    "Segmentation fault / interpreter crash",
    ["Never poke Python internals with ctypes", "Return the value normally"],
    "value = 42"
  ),
  ch(32, "Circular Imports", "Top-level circular imports crash at startup.", 300, 10, "python", "Nightmare",
    `# module_a.py
from module_b import process_b

def process_a(data):
    return process_b(data) + "_a"

# module_b.py
from module_a import process_a

def process_b(data):
    return process_a(data) + "_b"`,
    `# module_a.py
from module_b import process_b

def process_a(data):
    return process_b(data) + "_a"

# module_b.py
def process_b(data):
    return data + "_b"`,
    "each module imports the other at the top level",
    "ImportError: partially initialized module",
    ["Break the cycle — module_b never needs module_a", "Drop the back-import"],
    "return data + \"_b\""
  ),
  ch(33, "Recursion Overflow", "Deep nesting exceeds Python's recursion limit.", 300, 10, "python", "Nightmare",
    `def flatten(nested):
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

deep = []
current = deep
for _ in range(2000):
    new = []
    current.append(new)
    current = new

flatten(deep)`,
    `def flatten(nested):
    result = []
    stack = [nested]
    while stack:
        current = stack.pop()
        for item in current:
            if isinstance(item, list):
                stack.append(item)
            else:
                result.append(item)
    return result`,
    "nesting depth exceeds the default limit of 1000 frames",
    "RecursionError: maximum recursion depth exceeded",
    ["Convert recursion into an explicit stack", "A while loop with push/pop avoids the limit"],
    "stack = [nested]"
  ),
  ch(34, "Shifty Hash Order", "Dict order varies with the hash seed.", 290, 10, "python", "Nightmare",
    `import hashlib

def signature(config):
    result = ""
    for key, value in config.items():
        result += f"{key}={value};"
    return hashlib.md5(result.encode()).hexdigest()

config = {"host": "localhost", "port": 8080, "debug": True}
print(signature(config))`,
    `def signature(config):
    result = ""
    for key in sorted(config.keys()):
        result += f"{key}={config[key]};"
    return hashlib.md5(result.encode()).hexdigest()`,
    "PYTHONHASHSEED makes dict iteration order non-deterministic",
    "A different MD5 hash on every run",
    ["Sort the keys before serializing", "sorted(config.keys()) gives a stable order"],
    "sorted(config.keys())"
  ),
  ch(35, "Process Explosion", "os.fork without a depth guard multiplies processes.", 340, 10, "python", "Nightmare",
    `import os
import sys

def worker():
    for i in range(3):
        pid = os.fork()
        if pid == 0:
            worker()
            sys.exit(0)

worker()`,
    `from multiprocessing import Process

def worker(level=0):
    if level >= 3:
        return
    for i in range(2):
        p = Process(target=worker, args=(level + 1,))
        p.start()
        p.join()`,
    "every child also forks, so processes multiply exponentially",
    "System becomes unresponsive",
    ["Use multiprocessing.Process with a depth limit", "Always join() children and bound the recursion"],
    "multiprocessing"
  ),
  ch(36, "Uncollectable Cycle", "__del__ plus a reference cycle defeats the GC.", 300, 10, "python", "Nightmare",
    `import gc

class Node:
    def __init__(self):
        self.child = None
    def __del__(self):
        print(f"deleting {id(self)}")

a = Node()
b = Node()
a.child = b
b.child = a
del a
del b
gc.collect()
print("done")`,
    `class Node:
    def __init__(self):
        self.child = None
    def close(self):
        self.child = None`,
    "__del__ in a reference cycle means the GC gives up on it",
    "Objects are never collected — memory leaks",
    ["Prefer explicit cleanup like close()", "Or use weakref for back-references"],
    "def close(self):"
  ),
  ch(37, "Exponential Fib", "Naive recursion makes 2^50 calls.", 320, 10, "python", "Nightmare",
    `import sys

sys.setrecursionlimit(100000)

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(50))`,
    `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fibonacci(50))`,
    "each call spawns two more — the tree explodes even with a high limit",
    "C stack overflow / never finishes",
    ["Switch to an iterative loop", "Or memoize with @functools.lru_cache"],
    "a, b = 0, 1"
  ),
  ch(38, "Racy Shutdown", "A plain flag races between threads.", 330, 11, "python", "Nightmare",
    `import signal
import threading

shutdown = False

def handle_signal(sig, frame):
    global shutdown
    shutdown = True

def worker():
    global shutdown
    while not shutdown:
        pass

t = threading.Thread(target=worker)
t.start()`,
    `shutdown = threading.Event()

def handle_signal(sig, frame):
    shutdown.set()

def worker():
    while not shutdown.is_set():
        shutdown.wait(timeout=0.1)`,
    "the flag is not visible reliably across threads",
    "Worker never stops — busy-spins at 100% CPU",
    ["Use threading.Event for thread-safe signaling", "Event.wait(timeout) avoids the busy loop"],
    "threading.Event()"
  ),
  ch(39, "Dataclass Default Trap", "A mutable default is shared by every instance.", 280, 9, "python", "Nightmare",
    `from dataclasses import dataclass

@dataclass
class Task:
    tags: list = []
    name: str = ""

t1 = Task(name="A")
t1.tags.append("urgent")
t2 = Task(name="B")
print(t2.tags)`,
    `from dataclasses import dataclass, field

@dataclass
class Task:
    tags: list = field(default_factory=list)
    name: str = ""`,
    "dataclasses evaluate defaults once, so the list is shared",
    "Output: ['urgent'] — t2 inherits t1's tag",
    ["Use field(default_factory=list)", "Mutable defaults must be produced per instance"],
    "field(default_factory=list)"
  ),
  ch(40, "Trust the Singleton", "This code is actually correct — recognize it.", 310, 10, "python", "Nightmare",
    `class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class A(metaclass=Singleton): pass
class B(metaclass=Singleton): pass

print(type(A()))
print(type(B()))`,
    `class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]`,
    "each class correctly gets its own singleton — there is no bug",
    "Everything runs fine",
    ["The pattern is right: each class has its own _instances entry", "Sometimes the code needs no fix — submit it as-is"],
    "_instances"
  ),
];
/* ========= JAVASCRIPT TRACK ========= */
const jsBeginner: Challenge[] = [
  ch(101, "Property of Null", "Accessing a property on null crashes.", 40, 3, "javascript", "Beginner",
    `const user = getUser();
console.log(user.name);

function getUser() {
    return null;
}`,
    `const user = getUser();
if (user) {
    console.log(user.name);
}`,
    "Reading .name from null throws",
    "TypeError: Cannot read properties of null",
    ["Guard the access before reading", "Optional chaining user?.name also works"],
    "if (user)"
  ),
  ch(102, "Hoisted Ghost", "The variable exists but has no value yet.", 45, 3, "javascript", "Beginner",
    `console.log(score);
var score = 100;`,
    `let score = 100;
console.log(score);`,
    "var is hoisted, so score is undefined at the log",
    "Output: undefined",
    ["var hoists the declaration, not the value", "Declare before use and prefer let/const"],
    "let score = 100;"
  ),
  ch(103, "Return Line Break", "ASI turns return into return; undefined.", 55, 3, "javascript", "Beginner",
    `function getValue() {
    return
    {
        value: 42
    };
}

console.log(getValue());`,
    `function getValue() {
    return {
        value: 42
    };
}`,
    "a newline after return inserts a semicolon",
    "Output: undefined instead of { value: 42 }",
    ["The object must start on the return line", "return { opens the object on the same line"],
    "return {"
  ),
  ch(104, "Loose Coercion", "== silently converts types before comparing.", 45, 3, "javascript", "Beginner",
    `console.log(0 == "0");
console.log(0 == false);
console.log("" == false);`,
    `console.log(0 === "0");
console.log(0 === false);
console.log("" === false);`,
    "== coerces both sides to a common type",
    "Output: true, true, true",
    ["=== compares value and type", "Avoid == except when coercion is intended"],
    "==="
  ),
  ch(105, "Lexicographic Sort", "sort() orders numbers like strings.", 50, 3, "javascript", "Beginner",
    `const nums = [10, 9, 100, 3];
nums.sort();
console.log(nums);`,
    `const nums = [10, 9, 100, 3];
nums.sort((a, b) => a - b);
console.log(nums);`,
    "the default comparator converts values to strings",
    "Output: [10, 100, 3, 9]",
    ["Pass a numeric comparator", "(a, b) => a - b sorts ascending"],
    "(a, b) => a - b"
  ),
  ch(106, "NaN Escapes Equality", "NaN never equals anything, even itself.", 55, 3, "javascript", "Beginner",
    `function isValid(num) {
    if (num !== NaN) {
        return "valid";
    }
    return "invalid";
}

console.log(isValid(NaN));`,
    `function isValid(num) {
    if (!Number.isNaN(num)) {
        return "valid";
    }
    return "invalid";
}`,
    "NaN !== NaN is always true, so the check never fires",
    "Output: valid — the NaN case slips through",
    ["Use Number.isNaN() to test for NaN", "Any comparison with NaN returns false"],
    "Number.isNaN"
  ),
  ch(107, "Only First Match", "replace() fixes a single occurrence.", 45, 3, "javascript", "Beginner",
    `const tag = "a-b-c";
const fixed = tag.replace("-", "+");
console.log(fixed);`,
    `const tag = "a-b-c";
const fixed = tag.replace(/-/g, "+");
console.log(fixed);`,
    "replace() only replaces the first match",
    "Output: a+b-c",
    ["Use a global regex /-/g", "Or replaceAll('-', '+')"],
    "/-/g"
  ),
  ch(108, "Reference Copy", "Assigning an object copies the reference.", 50, 3, "javascript", "Beginner",
    `const a = { x: 1 };
const b = a;
b.x = 99;
console.log(a.x);`,
    `const a = { x: 1 };
const b = { ...a };
b.x = 99;
console.log(a.x);`,
    "b and a point at the same object",
    "Output: 99 — a was mutated through b",
    ["Spread creates a shallow copy", "{ ...a } is a brand-new object"],
    "{ ...a }"
  ),
  ch(109, "parseInt Truncates", "parseInt stops at the decimal point.", 45, 3, "javascript", "Beginner",
    `const price = parseInt("39.99", 10);
console.log(price);`,
    `const price = parseFloat("39.99");
console.log(price);`,
    "parseInt reads digits until the dot, then stops",
    "Output: 39",
    ["parseFloat keeps the fraction", "Or Number('39.99')"],
    "parseFloat"
  ),
  ch(110, "Length Truncation", "Assigning length mutates the array in place.", 50, 3, "javascript", "Beginner",
    `const arr = [1, 2, 3, 4, 5];
arr.length = 3;
console.log(arr);`,
    `const arr = [1, 2, 3, 4, 5];
const sliced = arr.slice(0, 3);
console.log(sliced);`,
    "arr.length = 3 deletes elements permanently",
    "Output: [1, 2, 3] — the original array was destroyed",
    ["Use slice() to get a new array", "arr.length = n truncates in place"],
    ".slice(0, 3)"
  ),
];

const jsIntermediate: Challenge[] = [
  ch(111, "Buttons All Say i", "Every handler closes over the same var.", 220, 5, "javascript", "Intermediate",
    `const buttons = document.querySelectorAll('.btn');
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
        console.log('Clicked button #' + i);
    });
}`,
    `for (let i = 0; i < buttons.length; i++) {`,
    "var is function-scoped — all handlers share one i",
    "Every button logs the same final number",
    ["let is block-scoped per iteration", "Each iteration captures its own i"],
    "let i = 0"
  ),
  ch(112, "This Goes Missing", "The method loses its this as a callback.", 180, 5, "javascript", "Intermediate",
    `const user = {
    name: "Alice",
    greet() {
        console.log("Hello, " + this.name);
    }
};

setTimeout(user.greet, 100);`,
    `setTimeout(() => user.greet(), 100);`,
    "user.greet is detached — this becomes undefined",
    "Output: 'Hello, undefined'",
    ["Wrap it in an arrow function", "Arrows keep the surrounding this"],
    "() => user.greet()"
  ),
  ch(113, "Unreturned Promise", "The chain runs but nothing is returned.", 160, 5, "javascript", "Intermediate",
    `function fetchData() {
    fetch('/api/data')
        .then(r => r.json())
        .then(data => {
            console.log(data);
            return data;
        });
}

const result = fetchData();
console.log(result);`,
    `function fetchData() {
    return fetch('/api/data')
        .then(r => r.json())
        .then(data => {
            console.log(data);
            return data;
        });
}`,
    "without return the caller gets undefined",
    "Output: undefined instead of a promise",
    ["Return the whole chain", "return fetch(...) lets callers await it"],
    "return fetch"
  ),
  ch(114, "forEach Discards", "forEach always returns undefined.", 140, 5, "javascript", "Intermediate",
    `const numbers = [1, 2, 3, 4];
const doubled = numbers.forEach(n => n * 2);
console.log(doubled);`,
    `const doubled = numbers.map(n => n * 2);`,
    "forEach is for side effects, not transforms",
    "Output: undefined",
    ["map() builds a new array", "The return of forEach is ignored"],
    ".map("
  ),
  ch(115, "Assign Mutates", "Object.assign writes into its first argument.", 140, 5, "javascript", "Intermediate",
    `const defaults = { theme: 'dark', lang: 'en' };
const userPrefs = { theme: 'light' };
const merged = Object.assign(defaults, userPrefs);
console.log(defaults.theme);`,
    `const merged = Object.assign({}, defaults, userPrefs);`,
    "defaults is the target — it gets overwritten",
    "Output: 'light' — defaults was modified",
    ["Pass {} as the target", "Object.assign({}, target, source) copies without mutation"],
    "{}, defaults"
  ),
  ch(116, "Forgotten Await", "fetch returns a promise, not data.", 150, 5, "javascript", "Intermediate",
    `async function getUser() {
    const user = fetch('/api/user');
    console.log(user.name);
}

getUser();`,
    `async function getUser() {
    const user = await fetch('/api/user');
    const data = await user.json();
    console.log(data.name);
}`,
    "await is missing on both the fetch and the JSON",
    "Output: undefined — user is a Promise",
    ["await the fetch call", "Also await .json()"],
    "await fetch"
  ),
  ch(117, "Reverse Side Effect", "reverse() mutates the original array.", 130, 5, "javascript", "Intermediate",
    `const nums = [1, 2, 3];
const reversed = nums.reverse();
console.log(nums);`,
    `const reversed = [...nums].reverse();`,
    "reverse() works in place and returns the same array",
    "Output: [3, 2, 1] — nums was flipped too",
    ["Copy first with spread", "[...nums].reverse() keeps nums intact"],
    "[...nums].reverse()"
  ),
  ch(118, "Month Off-By-One", "JavaScript months are 0-indexed.", 130, 5, "javascript", "Intermediate",
    `const d = new Date(1990, 5, 15);
console.log(d.getMonth());`,
    `const month = d.getMonth() + 1;
console.log(month);`,
    "getMonth() returns 0-11, where 5 is June",
    "Output: 5 instead of 6",
    ["Add 1 for the human-readable month", "January is 0, December is 11"],
    "getMonth() + 1"
  ),
  ch(119, "Timer Loop Trap", "All timeouts see the final loop value.", 160, 6, "javascript", "Intermediate",
    `for (var i = 1; i <= 3; i++) {
    setTimeout(() => console.log(i), i * 100);
}`,
    `for (let i = 1; i <= 3; i++) {
    setTimeout(() => console.log(i), i * 100);
}`,
    "var hoists one i that all callbacks share",
    "Output: 4, 4, 4 instead of 1, 2, 3",
    ["let gives each iteration its own binding", "Or wrap the body in an IIFE"],
    "let i = 1"
  ),
  ch(120, "Reference Equality", "Two objects with the same shape are not equal.", 150, 5, "javascript", "Intermediate",
    `const a = { x: 1, y: 2 };
const b = { x: 1, y: 2 };
console.log(a === b);`,
    `function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
console.log(deepEqual(a, b));`,
    "objects are compared by reference, not content",
    "Output: false",
    ["Compare values with JSON.stringify", "Or a deepEqual helper for nested data"],
    "JSON.stringify(a)"
  ),
];

const jsAdvanced: Challenge[] = [
  ch(121, "Starved Event Loop", "A long loop freezes the whole page.", 240, 8, "javascript", "Advanced",
    `const queue = [/* many items */];

function processQueue() {
    while (queue.length > 0) {
        const item = queue.shift();
        process(item);
    }
}

button.addEventListener('click', processQueue);`,
    `function processQueue() {
    const item = queue.shift();
    if (item) {
        process(item);
        setTimeout(processQueue, 0);
    }
}`,
    "the while loop never yields to the event loop",
    "UI freezes until every item is done",
    ["Process one item per tick", "setTimeout(processQueue, 0) yields between chunks"],
    "setTimeout(processQueue"
  ),
  ch(122, "Polluted Prototype", "A naive merge overwrites __proto__.", 250, 8, "javascript", "Advanced",
    `function merge(target, source) {
    for (const key in source) {
        target[key] = source[key];
    }
    return target;
}

const payload = JSON.parse('{"__proto__": {"admin": true}}');
merge({}, payload);
console.log({}.admin);`,
    `function merge(target, source) {
    for (const key in source) {
        if (key === '__proto__' || key === 'constructor') continue;
        target[key] = source[key];
    }
    return target;
}`,
    "assigning __proto__ silently changes the prototype chain",
    "Output: true — every object now reports admin",
    ["Skip __proto__ and constructor keys", "Or use Object.create(null) for untrusted keys"],
    "key === '__proto__'"
  ),
  ch(123, "Vanished WeakRef", "deref() can return undefined after GC.", 250, 8, "javascript", "Advanced",
    `class Component {
    constructor(el) {
        this.element = new WeakRef(el);
    }
    update() {
        const el = this.element.deref();
        el.textContent = 'updated';
    }
}`,
    `    update() {
        const el = this.element.deref();
        if (el) {
            el.textContent = 'updated';
        }
    }`,
    "the referenced object may already be collected",
    "TypeError: Cannot set properties of undefined",
    ["Guard with if (el)", "WeakRef gives no liveness guarantee"],
    "if (el)"
  ),
  ch(124, "Silent Proxy Writes", "No set trap means writes are not intercepted.", 260, 8, "javascript", "Advanced",
    `const handler = {
    get(target, prop) {
        console.log('reading ' + prop);
        return target[prop];
    }
};

const obj = new Proxy({ name: 'test' }, handler);
obj.name = 'changed';
console.log(obj.name);`,
    `const handler = {
    get(target, prop) {
        console.log('reading ' + prop);
        return target[prop];
    },
    set(target, prop, value) {
        console.log('writing ' + prop + ' = ' + value);
        target[prop] = value;
        return true;
    }
};`,
    "without a set trap, assignments bypass the proxy",
    "No 'writing' log appears",
    ["Add a set trap to the handler", "set(target, prop, value) intercepts writes"],
    "set(target, prop, value):"
  ),
  ch(125, "Generator Hoarding", "Buffering defeats the point of a generator.", 220, 7, "javascript", "Advanced",
    `function* generateData() {
    const results = [];
    for (let i = 0; i < 1000000; i++) {
        results.push(i * 2);
        yield results[results.length - 1];
    }
}

for (const val of generateData()) {
    console.log(val);
}`,
    `function* generateData() {
    for (let i = 0; i < 1000000; i++) {
        yield i * 2;
    }
}`,
    "every yielded value is also stored forever",
    "Memory grows to hold 1M values",
    ["Yield directly", "yield i * 2 without the array"],
    "yield i * 2"
  ),
  ch(126, "Shallow Freeze", "Object.freeze does not freeze nested objects.", 240, 8, "javascript", "Advanced",
    `const config = Object.freeze({
    theme: 'dark',
    options: { debug: true }
});

config.options.debug = false;
console.log(config.options.debug);`,
    `const deepFreeze = (obj) => {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            deepFreeze(obj[key]);
        }
    });
    return Object.freeze(obj);
};`,
    "freeze is shallow — nested objects stay writable",
    "Output: false — the nested option changed",
    ["Recursively freeze nested values", "deepFreeze walks the whole tree"],
    "deepFreeze"
  ),
  ch(127, "Unique Symbols", "Each Symbol() call creates a different key.", 220, 7, "javascript", "Advanced",
    `const KEY = Symbol('key');
const obj = { [KEY]: 'value' };
console.log(obj[Symbol('key')]);`,
    `console.log(obj[KEY]);`,
    "Symbol('key') is never equal to another Symbol('key')",
    "Output: undefined",
    ["Reuse the stored Symbol variable", "Descriptions are only for debugging"],
    "obj[KEY]"
  ),
  ch(128, "Boolean Comparator", "sort() expects a number, not a boolean.", 230, 7, "javascript", "Advanced",
    `const nums = [5, 2, 9, 1];
nums.sort((a, b) => a < b);
console.log(nums);`,
    `nums.sort((a, b) => a - b);`,
    "the boolean is coerced to 0 or 1 — order is wrong",
    "Output: [2, 1, 5, 9] — scrambled",
    ["Return a negative/positive number", "(a, b) => a - b is the correct comparator"],
    "a - b"
  ),
  ch(129, "Fresh Every Access", "A getter that rebuilds objects breaks identity checks.", 240, 8, "javascript", "Advanced",
    `class Store {
    get settings() {
        return { theme: 'dark' };
    }
}

const s = new Store();
console.log(s.settings === s.settings);`,
    `class Store {
    constructor() {
        this._settings = { theme: 'dark' };
    }
    get settings() {
        return this._settings;
    }
}`,
    "every access builds a new object",
    "Output: false — the two reads are different objects",
    ["Cache the object once", "Return this._settings, not a fresh literal"],
    "this._settings"
  ),
  ch(130, "Trust the Order", "This code is correct — submit it as-is.", 230, 7, "javascript", "Advanced",
    `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
    `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
    "microtasks run before macrotasks — this is the expected order",
    "Output: 1, 4, 3, 2",
    ["Promises (microtasks) beat setTimeout (macrotasks)", "The code is right — no fix needed"],
    "setTimeout"
  ),
];

const jsNightmare: Challenge[] = [
  ch(131, "Hidden Class Split", "A late property breaks V8's shape assumption.", 350, 12, "javascript", "Nightmare",
    `class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const points = [];
for (let i = 0; i < 100000; i++) {
    points.push(new Point(i, i));
}
points[0].z = 0;`,
    `class Point {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}`,
    "adding a property after the fact forces a hidden-class transition",
    "Performance cliff — the whole loop deoptimizes",
    ["Declare every property in the constructor", "Use a default parameter for optional ones"],
    "this.z = z"
  ),
  ch(132, "Busy-Wait Burn", "A spin loop eats an entire CPU core.", 340, 11, "javascript", "Nightmare",
    `const buffer = new SharedArrayBuffer(4);
const view = new Int32Array(buffer);

Atomics.store(view, 0, 1);
while (Atomics.load(view, 0) === 0) { /* spin */ }
console.log('Done');`,
    `Atomics.store(view, 0, 1);
Atomics.notify(view, 0);

while (Atomics.load(view, 0) === 0) {
    Atomics.wait(view, 0, 0);
}
console.log('Done');`,
    "the loop spins at 100% CPU while it waits",
    "Worker 2 pegs a full core",
    ["Atomics.wait() blocks without spinning", "Pair it with Atomics.notify()"],
    "Atomics.wait"
  ),
  ch(133, "Unregisterable", "Cleanup cannot be cancelled without a token.", 300, 10, "javascript", "Nightmare",
    `const registry = new FinalizationRegistry(key => {
    console.log('cleaned up: ' + key);
});

let a = { name: 'a' };
registry.register(a, 'a');
a = null;`,
    `const registry = new FinalizationRegistry(key => {
    console.log('cleaned up: ' + key);
});

let a = { name: 'a' };
const token = {};
registry.register(a, 'a', token);
// later, if still needed:
// registry.unregister(token);`,
    "no unregister token means cleanup can never be cancelled",
    "The object is finalized even when you still need it",
    ["Pass a token to register()", "registry.unregister(token) cancels cleanup"],
    "registry.unregister(token)"
  ),
  ch(134, "Tiny Wasm Heap", "The module runs out of memory at startup.", 320, 10, "javascript", "Nightmare",
    `const memory = new WebAssembly.Memory({ initial: 1 });
const view = new Uint8Array(memory.buffer);
view.set(loadDataset());`,
    `const memory = new WebAssembly.Memory({ initial: 256 });`,
    "a single 64KB page cannot hold the dataset",
    "RangeError: Out of memory (wasm memory)",
    ["Grow the initial pages", "initial: 256 reserves 16MB"],
    "initial: 256"
  ),
  ch(135, "Lost CAS Updates", "Load-then-store is not atomic.", 330, 11, "javascript", "Nightmare",
    `const buffer = new SharedArrayBuffer(4);
const view = new Int32Array(buffer);

function increment() {
    Atomics.store(view, 0, Atomics.load(view, 0) + 1);
}`,
    `function increment() {
    let oldVal;
    do {
        oldVal = Atomics.load(view, 0);
    } while (Atomics.compareExchange(view, 0, oldVal, oldVal + 1) !== oldVal);
}`,
    "two threads can read the same value and both write it back",
    "Lost increments under concurrency",
    ["Use a compare-exchange loop", "CAS retries until the update wins"],
    "compareExchange"
  ),
  ch(136, "Uncloneable Handlers", "structuredClone rejects functions and DOM nodes.", 290, 9, "javascript", "Nightmare",
    `const config = {
    name: 'app',
    handler: () => console.log('click'),
    element: document.getElementById('app')
};

const copy = structuredClone(config);
console.log(copy.handler);`,
    `const config = { name: 'app' };
const copy = structuredClone(config);
console.log(copy.name);`,
    "functions and DOM nodes are not structured-cloneable",
    "DataCloneError",
    ["Keep only serializable data", "Move handlers and DOM refs out of the payload"],
    "name: 'app' }"
  ),
  ch(137, "WeakMap By Identity", "WeakMap keys compare by reference, not value.", 280, 9, "javascript", "Nightmare",
    `const cache = new WeakMap();
const key1 = { id: 1 };
const key2 = { id: 1 };

cache.set(key1, 'data');
console.log(cache.get(key2));`,
    `const cache = new Map();
const key1 = { id: 1 };
cache.set(key1.id, 'data');
console.log(cache.get(1));`,
    "key1 and key2 are different objects, so the lookup misses",
    "Output: undefined",
    ["WeakMap uses reference identity", "Use primitive keys with a regular Map"],
    "cache.set(key1.id"
  ),
  ch(138, "Static Import Map", "Import maps cannot change after parse.", 300, 10, "javascript", "Nightmare",
    `// import map declared once in HTML
// cannot be updated after the page parses`,
    `const module = await import('https://cdn.example.com/lodash@4.17.21');`,
    "the mapping is fixed at parse time",
    "Runtime updates are impossible",
    ["Use dynamic import() for runtime flexibility", "Import maps are read once"],
    "await import("
  ),
  ch(139, "Missing Paint Metrics", "The observer only watches navigation entries.", 310, 10, "javascript", "Nightmare",
    `const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log(entry.name, entry.duration);
    }
});
observer.observe({ type: 'navigation', buffered: true });`,
    `observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });`,
    "paint and resource entries are never delivered",
    "First paint is never reported",
    ["Observe multiple entry types", "Add 'paint' to entryTypes"],
    "'paint'"
  ),
  ch(140, "JSON Eats Functions", "JSON round-trips drop functions and undefined.", 300, 10, "javascript", "Nightmare",
    `const config = {
    name: 'api',
    retries: 3,
    timeout: undefined,
    retry() { return this.retries; }
};

const copy = JSON.parse(JSON.stringify(config));
console.log(copy.retry, copy.timeout);`,
    `const copy = structuredClone(config);
console.log(copy.retry, copy.timeout);`,
    "JSON.stringify silently discards functions and undefined",
    "Output: undefined undefined",
    ["structuredClone preserves more types", "Keep functions out of serialized state"],
    "structuredClone(config)"
  ),
];
/* ========= SQL TRACK ========= */
const sqlBeginner: Challenge[] = [
  ch(201, "Update Everything", "An UPDATE without WHERE hits every row.", 50, 3, "sql", "Beginner",
    `UPDATE users SET active = false;`,
    `UPDATE users SET active = false WHERE id = 42;`,
    "no WHERE clause means every row is affected",
    "All users deactivated at once",
    ["Always scope UPDATE with WHERE", "WHERE id = 42 targets one row"],
    "WHERE id = 42"
  ),
  ch(202, "Bare String", "Unquoted text is read as a column name.", 45, 3, "sql", "Beginner",
    `SELECT * FROM users WHERE status = active;`,
    `SELECT * FROM users WHERE status = 'active';`,
    "'active' is parsed as an identifier, not a literal",
    "Unknown column 'active'",
    ["Strings need single quotes", "WHERE status = 'active'"],
    "status = 'active'"
  ),
  ch(203, "Count vs Sum", "COUNT tallies rows, not amounts.", 50, 3, "sql", "Beginner",
    `SELECT COUNT(amount) AS total FROM orders;`,
    `SELECT SUM(amount) AS total FROM orders;`,
    "COUNT counts non-null values instead of adding them",
    "Returns 100 (rows) instead of 5000 (sum)",
    ["SUM adds numeric values", "COUNT is for row counts"],
    "SUM(amount)"
  ),
  ch(204, "NULL Never Equals", "= NULL is always unknown, never true.", 55, 3, "sql", "Beginner",
    `SELECT * FROM users WHERE deleted_at = NULL;`,
    `SELECT * FROM users WHERE deleted_at IS NULL;`,
    "comparing with = NULL yields no rows",
    "Returns zero rows",
    ["Use IS NULL", "NULL comparisons need IS, not ="],
    "IS NULL"
  ),
  ch(205, "Arbitrary Ten", "LIMIT without ORDER BY is a dice roll.", 50, 3, "sql", "Beginner",
    `SELECT * FROM products LIMIT 10;`,
    `SELECT * FROM products ORDER BY id LIMIT 10;`,
    "the database picks whichever rows it wants",
    "Different rows on different runs",
    ["Always pair LIMIT with ORDER BY", "ORDER BY id makes it deterministic"],
    "ORDER BY id LIMIT 10"
  ),
  ch(206, "LIKE Without Wildcard", "LIKE 'alice' is just a slow equality.", 45, 3, "sql", "Beginner",
    `SELECT * FROM users WHERE name LIKE 'alice';`,
    `SELECT * FROM users WHERE name = 'alice';`,
    "LIKE without % or _ cannot use indexes well",
    "Works, but slowly and unnecessarily",
    ["Use = for exact matches", "LIKE is for patterns"],
    "name = 'alice'"
  ),
  ch(207, "Duplicated Tag", "INSERT happily creates duplicates.", 55, 3, "sql", "Beginner",
    `INSERT INTO tags (name) VALUES ('python');`,
    `INSERT OR IGNORE INTO tags (name) VALUES ('python');`,
    "there is no uniqueness guard on this insert",
    "Multiple 'python' rows accumulate",
    ["Use INSERT OR IGNORE", "Or add a UNIQUE constraint"],
    "INSERT OR IGNORE"
  ),
  ch(208, "Aggregate Without Group", "A bare aggregate mixes one row with many.", 50, 3, "sql", "Beginner",
    `SELECT city, COUNT(*) FROM users;`,
    `SELECT city, COUNT(*) FROM users GROUP BY city;`,
    "COUNT(*) collapses the table but city stays ungrouped",
    "Error or nonsense rows depending on the engine",
    ["Group by the non-aggregated column", "GROUP BY city"],
    "GROUP BY city"
  ),
  ch(209, "Number in a Text Column", "The comparison forces a type conversion.", 50, 3, "sql", "Beginner",
    `SELECT * FROM users WHERE phone_number = 5551234;`,
    `SELECT * FROM users WHERE phone_number = '5551234';`,
    "VARCHAR compared to a number converts every value",
    "Indexes get ignored; matches may be missed",
    ["Quote string data", "phone_number is VARCHAR — use quotes"],
    "= '5551234'"
  ),
  ch(210, "Log Purge Gone Wrong", "DELETE without WHERE wipes the table.", 55, 3, "sql", "Beginner",
    `DELETE FROM logs;`,
    `DELETE FROM logs WHERE created_at < '2024-01-01';`,
    "no filter means every log row is removed",
    "All logs are gone",
    ["Always filter destructive statements", "WHERE created_at < '2024-01-01'"],
    "WHERE created_at"
  ),
];

const sqlIntermediate: Challenge[] = [
  ch(211, "Vanishing Customers", "INNER JOIN drops customers without orders.", 130, 5, "sql", "Intermediate",
    `SELECT c.name, COUNT(o.id) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;`,
    `SELECT c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;`,
    "customers with zero orders disappear from the report",
    "Missing rows instead of 0",
    ["LEFT JOIN keeps the left table's rows", "COUNT(o.id) counts only matched orders"],
    "LEFT JOIN orders"
  ),
  ch(212, "WHERE Can't Aggregate", "Filtering a SUM inside WHERE fails.", 140, 5, "sql", "Intermediate",
    `SELECT customer_id, SUM(total)
FROM orders
WHERE SUM(total) > 100
GROUP BY customer_id;`,
    `SELECT customer_id, SUM(total)
FROM orders
GROUP BY customer_id
HAVING SUM(total) > 100;`,
    "WHERE runs before grouping, so aggregates are illegal there",
    "Error: aggregate function not allowed in WHERE",
    ["Filter groups with HAVING", "HAVING runs after GROUP BY"],
    "HAVING SUM(total) > 100"
  ),
  ch(213, "Blank Phone Numbers", "NULLs leak into the export.", 125, 5, "sql", "Intermediate",
    `SELECT name, phone FROM users;`,
    `SELECT name, COALESCE(phone, 'N/A') AS phone FROM users;`,
    "NULL phone values show up empty",
    "Rows with empty phone fields",
    ["COALESCE supplies a default", "COALESCE(phone, 'N/A')"],
    "COALESCE(phone"
  ),
  ch(214, "Function on Column", "YEAR() hides the index from the planner.", 145, 5, "sql", "Intermediate",
    `SELECT * FROM orders WHERE YEAR(created_at) = 2024;`,
    `SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';`,
    "wrapping the column prevents index use",
    "Full table scan on a big orders table",
    ["Compare the raw column to a range", ">= start AND < next-start"],
    "created_at >= '2024-01-01'"
  ),
  ch(215, "Subquery Returns Many", "= with a multi-row subquery errors out.", 135, 5, "sql", "Intermediate",
    `SELECT * FROM orders
WHERE user_id = (SELECT id FROM users WHERE active = true);`,
    `SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE active = true);`,
    "the subquery may return more than one row",
    "Error: subquery returns more than 1 row",
    ["IN accepts a list", "= needs exactly one value"],
    "IN (SELECT"
  ),
  ch(216, "COUNT Skips NULLs", "COUNT(commission) ignores null commissions.", 130, 5, "sql", "Intermediate",
    `SELECT COUNT(commission) FROM sales;`,
    `SELECT COUNT(*) FROM sales WHERE commission IS NOT NULL;`,
    "COUNT(col) only counts non-null values",
    "A lower number than the real row count",
    ["COUNT(*) counts all rows", "Filter explicitly when you mean non-null"],
    "commission IS NOT NULL"
  ),
  ch(217, "Half a Name", "Concatenating a NULL yields NULL.", 130, 5, "sql", "Intermediate",
    `SELECT first || ' ' || last AS full_name FROM users;`,
    `SELECT COALESCE(first, '') || ' ' || COALESCE(last, '') AS full_name FROM users;`,
    "one NULL poisons the whole concatenation",
    "full_name is NULL whenever last is NULL",
    ["COALESCE the pieces first", "COALESCE(last, '') keeps the output non-null"],
    "COALESCE(last"
  ),
  ch(218, "DISTINCT Ordering", "ORDER BY needs the DISTINCT column.", 130, 5, "sql", "Intermediate",
    `SELECT DISTINCT department FROM employees ORDER BY salary;`,
    `SELECT DISTINCT department FROM employees ORDER BY department;`,
    "salary is not part of the DISTINCT output",
    "Error: ORDER BY expression must appear in select list",
    ["Order by a selected column", "DISTINCT and ORDER BY must agree"],
    "ORDER BY department"
  ),
  ch(219, "Uncommitted Transfer", "The transaction never commits.", 140, 5, "sql", "Intermediate",
    `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;`,
    `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;`,
    "without COMMIT the work rolls back",
    "The transfer vanishes",
    ["Finish with COMMIT;", "Or ROLLBACK if something failed"],
    "COMMIT;"
  ),
  ch(220, "Self-Join Explosion", "Missing ON multiplies every row by every row.", 140, 5, "sql", "Intermediate",
    `SELECT a.name AS emp, b.name AS manager
FROM employees a
JOIN employees b;`,
    `SELECT a.name AS emp, b.name AS manager
FROM employees a
JOIN employees b ON a.manager_id = b.id;`,
    "a join with no condition is a cartesian product",
    "100 employees become 10,000 rows",
    ["Always supply the join condition", "ON a.manager_id = b.id"],
    "ON a.manager_id = b.id"
  ),
];

const sqlAdvanced: Challenge[] = [
  ch(221, "Per-User Counts", "A correlated subquery runs once per row.", 240, 8, "sql", "Advanced",
    `SELECT c.name,
  (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders
FROM customers c;`,
    `SELECT c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;`,
    "the subquery executes for every customer",
    "Slow on large customer tables",
    ["Rewrite as a LEFT JOIN with GROUP BY", "Set-based work beats row-by-row"],
    "LEFT JOIN orders"
  ),
  ch(222, "Missing Partition", "The window spans the whole table.", 230, 8, "sql", "Advanced",
    `SELECT name, department, salary,
       MAX(salary) OVER () AS dept_max
FROM employees;`,
    `SELECT name, department, salary,
       MAX(salary) OVER (PARTITION BY department) AS dept_max
FROM employees;`,
    "OVER () computes a global maximum",
    "dept_max is the same for every row",
    ["Add PARTITION BY department", "Windows need explicit partitioning"],
    "PARTITION BY department"
  ),
  ch(223, "Blocked Delete", "Foreign keys refuse the delete.", 220, 7, "sql", "Advanced",
    `DELETE FROM departments WHERE id = 3;`,
    `DELETE FROM employees WHERE department_id = 3;
DELETE FROM departments WHERE id = 3;`,
    "employees still reference the department",
    "Error: foreign key constraint failed",
    ["Remove children first", "Or define ON DELETE CASCADE"],
    "DELETE FROM employees WHERE department_id = 3"
  ),
  ch(224, "Portable Upsert", "UPDATE...JOIN syntax is engine-specific.", 240, 8, "sql", "Advanced",
    `UPDATE orders JOIN customers ON orders.customer_id = customers.id
SET orders.status = 'vip'
WHERE customers.tier = 'gold';`,
    `UPDATE orders SET status = 'vip'
WHERE customer_id IN (SELECT id FROM customers WHERE tier = 'gold');`,
    "UPDATE...JOIN works on MySQL but not SQLite/Postgres",
    "Syntax error on other engines",
    ["Use a subquery instead", "WHERE customer_id IN (SELECT ...)"],
    "IN (SELECT id FROM customers WHERE tier = 'gold')"
  ),
  ch(225, "Unstable Pages", "Ties reshuffle across pages.", 225, 7, "sql", "Advanced",
    `SELECT * FROM items ORDER BY score LIMIT 10 OFFSET 20;`,
    `SELECT * FROM items ORDER BY score, id LIMIT 10 OFFSET 20;`,
    "equal scores can be ordered differently per query",
    "Rows are skipped or repeated between pages",
    ["Add a unique tiebreaker", "ORDER BY score, id"],
    "ORDER BY score, id"
  ),
  ch(226, "Leading Wildcard", "LIKE '%phone' cannot use an index.", 215, 7, "sql", "Advanced",
    `SELECT * FROM products WHERE name LIKE '%phone';`,
    `SELECT * FROM products WHERE name LIKE 'phone%';`,
    "a leading % forces a full scan",
    "Slow searches as the table grows",
    ["Anchor the pattern on the left", "name LIKE 'phone%' can use an index"],
    "name LIKE 'phone%'"
  ),
  ch(227, "NOT IN and NULL", "A NULL in the list empties the result.", 230, 7, "sql", "Advanced",
    `SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM banned);`,
    `SELECT * FROM users u
WHERE NOT EXISTS (SELECT 1 FROM banned b WHERE b.user_id = u.id);`,
    "NULL in the subquery makes NOT IN return nothing",
    "Every user vanishes from the result",
    ["Use NOT EXISTS", "NOT IN with NULLs is always empty"],
    "NOT EXISTS"
  ),
  ch(228, "Truncated Prices", "CAST to INT chops off the cents.", 210, 7, "sql", "Advanced",
    `SELECT name, CAST(price AS INT) AS price FROM products;`,
    `SELECT name, ROUND(price, 2) AS price FROM products;`,
    "casting to integer discards the fraction",
    "19.99 becomes 19",
    ["ROUND keeps the precision you want", "Store money as NUMERIC, not INT"],
    "ROUND(price"
  ),
  ch(229, "Loose Grouping", "One ungrouped column ruins the query.", 220, 7, "sql", "Advanced",
    `SELECT customer_id, order_date, SUM(total)
FROM orders
GROUP BY customer_id;`,
    `SELECT customer_id, order_date, SUM(total)
FROM orders
GROUP BY customer_id, order_date;`,
    "order_date is neither grouped nor aggregated",
    "Error in strict mode; arbitrary values otherwise",
    ["Group by every plain column", "GROUP BY customer_id, order_date"],
    "GROUP BY customer_id, order_date"
  ),
  ch(230, "Repeatable Archive", "Re-running the INSERT duplicates rows.", 230, 7, "sql", "Advanced",
    `INSERT INTO archive SELECT * FROM orders WHERE created_at < '2023-01-01';`,
    `INSERT OR IGNORE INTO archive SELECT * FROM orders WHERE created_at < '2023-01-01';`,
    "a second run inserts the same rows again",
    "Duplicate archive rows",
    ["Make the insert idempotent", "INSERT OR IGNORE skips existing keys"],
    "INSERT OR IGNORE INTO archive"
  ),
];

const sqlNightmare: Challenge[] = [
  ch(231, "Read-Then-Write Race", "Two transactions can read the same balance.", 330, 11, "sql", "Nightmare",
    `BEGIN;
SELECT balance FROM accounts WHERE id = 1;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;`,
    `BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;`,
    "the read and the write are not atomic together",
    "Two debits both see 1000 — one credit is lost",
    ["Lock the row during the read", "SELECT ... FOR UPDATE"],
    "FOR UPDATE"
  ),
  ch(232, "Autovacuum Blind Spot", "Append-only tables bloat silently.", 290, 9, "sql", "Nightmare",
    `CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    action TEXT,
    timestamp TIMESTAMP
);`,
    `ALTER TABLE audit_log SET (autovacuum_vacuum_threshold = 50000, autovacuum_analyze_threshold = 50000);`,
    "the default thresholds never trigger for a huge log table",
    "Table bloat — dead rows pile up",
    ["Tune autovacuum per table", "ALTER TABLE SET (autovacuum_vacuum_threshold ...)"],
    "autovacuum_vacuum_threshold"
  ),
  ch(233, "Pruning Without Constraints", "Parent CHECKs do not help partitions prune.", 300, 10, "sql", "Nightmare",
    `CREATE TABLE events (
    id SERIAL,
    event_date DATE,
    CHECK (event_date >= '2024-01-01' AND event_date < '2025-01-01')
) PARTITION BY RANGE (event_date);`,
    `CREATE TABLE events_y2024 (
    CHECK (event_date >= '2024-01-01' AND event_date < '2025-01-01')
) PARTITION OF events;`,
    "partition pruning needs per-partition constraints",
    "Every query scans all partitions",
    ["Add CHECK constraints to each partition", "Constraints on children enable pruning"],
    "PARTITION OF events"
  ),
  ch(234, "Standby Conflict", "Long queries collide with WAL replay.", 310, 10, "sql", "Nightmare",
    `BEGIN;
SELECT * FROM large_table;`,
    `SET statement_timeout = '5min';
SELECT * FROM large_table;`,
    "an open snapshot blocks replication on the standby",
    "Canceling statement due to conflict with recovery",
    ["Cap query time with statement_timeout", "Long reads on replicas cause conflicts"],
    "statement_timeout"
  ),
  ch(235, "Injectable WHERE", "String-built SQL lets input rewrite the query.", 330, 11, "sql", "Nightmare",
    `-- built with string interpolation
SELECT * FROM users WHERE name = '<input>';`,
    `-- parameterized
SELECT * FROM users WHERE name = ?;`,
    "user input can close the quote and inject SQL",
    "Data exfiltration or destruction",
    ["Use bound parameters", "Never interpolate input into SQL"],
    "name = ?"
  ),
  ch(236, "Endless Hierarchy", "A cyclic org chart never terminates.", 320, 10, "sql", "Nightmare",
    `WITH RECURSIVE org AS (
    SELECT id, name, manager_id FROM employees WHERE id = 1
    UNION ALL
    SELECT e.id, e.name, e.manager_id FROM employees e
    JOIN org o ON e.manager_id = o.id
)
SELECT * FROM org;`,
    `WITH RECURSIVE org AS (
    SELECT id, name, manager_id, 1 AS depth FROM employees WHERE id = 1
    UNION ALL
    SELECT e.id, e.name, e.manager_id, o.depth + 1 FROM employees e
    JOIN org o ON e.manager_id = o.id WHERE o.depth < 10
)
SELECT * FROM org;`,
    "a reporting loop makes the recursion infinite",
    "The query never returns",
    ["Track depth and cap it", "WHERE o.depth < 10 bounds the walk"],
    "o.depth < 10"
  ),
  ch(237, "Missing FK Index", "Deletes on the parent scan the child.", 290, 9, "sql", "Nightmare",
    `CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);`,
    `CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
CREATE INDEX idx_orders_customer ON orders(customer_id);`,
    "no index backs the foreign key column",
    "Child scans on every parent delete",
    ["Index the referencing column", "CREATE INDEX idx_orders_customer ..."],
    "idx_orders_customer"
  ),
  ch(238, "SELECT * Overhead", "Unneeded columns break covering-index plans.", 280, 9, "sql", "Nightmare",
    `SELECT * FROM users WHERE email = 'a@b.com';`,
    `SELECT id FROM users WHERE email = 'a@b.com';`,
    "every column is fetched even when only the id is needed",
    "Wasted IO on hot lookups",
    ["List only the columns you need", "A covering index can serve this"],
    "SELECT id FROM users WHERE email"
  ),
  ch(239, "Accidental Case-Fold", "Collation makes 'Admin' match 'admin'.", 300, 10, "sql", "Nightmare",
    `SELECT * FROM users WHERE username = 'Admin';`,
    `SELECT * FROM users WHERE username = 'Admin' COLLATE BINARY;`,
    "a case-insensitive collation hides the distinction",
    "The wrong account is returned",
    ["Force a binary collation", "COLLATE BINARY for exact matches"],
    "COLLATE BINARY"
  ),
  ch(240, "Trust the Window", "This query is correct — submit it as-is.", 290, 9, "sql", "Nightmare",
    `SELECT name, salary, department,
       RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk
FROM employees;`,
    `SELECT name, salary, department,
       RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk
FROM employees;`,
    "per-department ranking with RANK() is right",
    "Works correctly",
    ["RANK() skips ranks after ties", "The query is fine — no fix needed"],
    "RANK() OVER (PARTITION BY department ORDER BY salary DESC)"
  ),
];
/* ========= AUTO-GENERATED TRACKS HELPER ========= */
// Generates challenges for a tech stack from explicit per-difficulty problem pools.
// Every difficulty level gets its own genuinely different problems — nothing is recycled.

interface StackProblem {
  title: string;
  desc: string;
  bug: string;
  code: string;
  solution: string;
  checkKey: string;
  hints: string[];
  expectedError: string;
}

interface StackTemplate {
  slug: string;
  name: string;
  icon: IconName;
  desc: string;
  accent: string;
  lang: string; // The display name
  monacoLang: string; // The technical ID
  problems: Record<Difficulty, StackProblem[]>;
}

const nextIdBase = { current: 1000 };

function buildTrack(tmpl: StackTemplate): Track {
  const order: Difficulty[] = ["Beginner", "Intermediate", "Advanced", "Nightmare"];
  const xpByDiff = { Beginner: 50, Intermediate: 140, Advanced: 250, Nightmare: 320 };
  const timeByDiff = { Beginner: 3, Intermediate: 5, Advanced: 8, Nightmare: 11 };

  const challenges: Challenge[] = [];
  order.forEach((diff) => {
    (tmpl.problems[diff] || []).forEach((p, i) => {
      nextIdBase.current += 1;
      challenges.push({
        id: nextIdBase.current,
        title: p.title,
        desc: p.desc,
        xp: xpByDiff[diff] + i * 4,
        timeMin: timeByDiff[diff],
        lang: tmpl.lang,
        monacoLang: tmpl.monacoLang,
        difficulty: diff,
        code: p.code,
        solution: p.solution,
        bug: p.bug,
        expectedError: p.expectedError,
        hints: p.hints,
        checkKey: p.checkKey,
      });
    });
  });

  return {
    slug: tmpl.slug,
    name: tmpl.name,
    icon: tmpl.icon,
    desc: tmpl.desc,
    done: 0,
    total: challenges.length,
    accent: tmpl.accent,
    challenges,
  };
}

/* ========= NEW STACK TEMPLATES ========= */

const stackTemplates: StackTemplate[] = [
  {
    slug: "flask", name: "Flask", icon: "flask", desc: "Fix broken Flask web applications", accent: "#ef4444", lang: "Flask", monacoLang: "python",
    problems: {
      Beginner: [
        { title: "Missing Route Method", desc: "The POST route only answers GET requests.", bug: "methods=['POST'] is missing", code: `@app.route('/users')\ndef create_user():\n    return 'created'`, solution: `@app.route('/users', methods=['POST'])\ndef create_user():\n    return 'created'`, checkKey: "methods=['POST']", hints: ["POST needs to be listed", "Add methods=['POST'] to the route"], expectedError: "405 Method Not Allowed" },
        { title: "Template Not Found", desc: "Jinja cannot locate the page.", bug: "wrong template name", code: `return render_template('user_profile.html')`, solution: `return render_template('profile.html')`, checkKey: "'profile.html'", hints: ["Check the templates/ folder", "Match the actual filename"], expectedError: "TemplateNotFound" },
        { title: "Wrong Endpoint Name", desc: "url_for points at a missing endpoint.", bug: "stale endpoint name", code: `return redirect(url_for('homepage'))`, solution: `return redirect(url_for('index'))`, checkKey: "url_for('index')", hints: ["Endpoint names come from def names", "Rename to url_for('index')"], expectedError: "BuildError" },
      ],
      Intermediate: [
        { title: "SQL String Building", desc: "User input is pasted into the query.", bug: "f-string in SQL", code: `cur.execute(f"SELECT * FROM users WHERE name = '{name}'")`, solution: `cur.execute("SELECT * FROM users WHERE name = ?", (name,))`, checkKey: "(name,)", hints: ["Use parameter placeholders", "Pass values as a tuple"], expectedError: "SQL injection hole" },
        { title: "CORS Blocked", desc: "The browser rejects API calls.", bug: "no CORS configuration", code: `app = Flask(__name__)`, solution: `from flask_cors import CORS\napp = Flask(__name__)\nCORS(app)`, checkKey: "CORS(app)", hints: ["Install flask-cors", "Wrap the app with CORS()"], expectedError: "CORS error in the browser" },
        { title: "Blueprint Without Prefix", desc: "Routes 404 under /api.", bug: "url_prefix missing", code: `app.register_blueprint(api)`, solution: `app.register_blueprint(api, url_prefix='/api')`, checkKey: "url_prefix='/api'", hints: ["Prefix the blueprint", "url_prefix='/api'"], expectedError: "404 on /api/*" },
      ],
      Advanced: [
        { title: "JSON Payload Is None", desc: "The wrong content type nulls the body.", bug: "request.json without force", code: `data = request.json\nname = data['name']`, solution: `data = request.get_json(force=True)\nname = data['name']`, checkKey: "get_json(force=True)", hints: ["Use request.get_json()", "force=True parses any content type"], expectedError: "AttributeError: NoneType" },
        { title: "Session Without Secret", desc: "Sessions crash without a secret key.", bug: "no secret_key", code: `app = Flask(__name__)\n\n@app.route('/')\ndef index():\n    session['hits'] = session.get('hits', 0) + 1\n    return 'ok'`, solution: `app = Flask(__name__)\napp.secret_key = 'change-me'\n\n@app.route('/')\ndef index():\n    session['hits'] = session.get('hits', 0) + 1\n    return 'ok'`, checkKey: "secret_key", hints: ["Sessions need a key", "Set app.secret_key"], expectedError: "RuntimeError: session unavailable" },
        { title: "Unserializable Response", desc: "A set cannot be JSON-encoded.", bug: "raw set in dict", code: `return {'users': user_set}`, solution: `return {'users': list(user_set)}`, checkKey: "list(user_set)", hints: ["Convert containers first", "list(user_set) is JSON-safe"], expectedError: "TypeError: Object of type set is not JSON serializable" },
      ],
      Nightmare: [
        { title: "Racy Cache", desc: "The in-memory cache races under threads.", bug: "unsynchronized dict", code: `cache = {}\n\ndef get(key):\n    if key not in cache:\n        cache[key] = expensive(key)\n    return cache[key]`, solution: `import threading\n\ncache = {}\nlock = threading.Lock()\n\ndef get(key):\n    with lock:\n        if key not in cache:\n            cache[key] = expensive(key)\n        return cache[key]`, checkKey: "threading.Lock()", hints: ["Serialize the cache access", "with lock: guards read-modify-write"], expectedError: "Lost updates / crash" },
        { title: "N+1 in Route Loop", desc: "A query fires per order.", bug: "queries inside a loop", code: `for order in orders:\n    items = db.execute(\n        "SELECT * FROM items WHERE order_id = ?", (order["id"],)\n    ).fetchall()`, solution: `ids = [o["id"] for o in orders]\nplaceholders = ",".join("?" * len(ids))\nrows = db.execute(\n    f"SELECT * FROM items WHERE order_id IN ({placeholders})", ids\n).fetchall()`, checkKey: "order_id IN (", hints: ["Fetch once with IN", "One query beats N"], expectedError: "Slow endpoint" },
        { title: "Autoescape Off", desc: "User input renders as raw HTML.", bug: "autoescape disabled", code: `app.jinja_env.autoescape = False\n\n@app.route('/show')\ndef show():\n    return render_template('show.html', title=user_input)`, solution: `from markupsafe import escape\n\n@app.route('/show')\ndef show():\n    return render_template('show.html', title=escape(user_input))`, checkKey: "escape(user_input)", hints: ["Escape untrusted input", "escape() neutralizes markup"], expectedError: "Stored XSS" },
      ],
    },
  },
  {
    slug: "django", name: "Django", icon: "django", desc: "Fix Django models, views, and ORM issues", accent: "#10b981", lang: "Django", monacoLang: "python",
    problems: {
      Beginner: [
        { title: "CSRF Rejected", desc: "The form post is blocked.", bug: "no csrf token", code: `<form method="post">\n    <input name="title">\n</form>`, solution: `<form method="post">\n    {% csrf_token %}\n    <input name="title">\n</form>`, checkKey: "{% csrf_token %}", hints: ["Add the token tag", "Required for POST"], expectedError: "403 Forbidden" },
        { title: "Column Missing", desc: "The model changed but the DB did not.", bug: "no migration", code: `# model edited, no migration made`, solution: `python manage.py makemigrations\npython manage.py migrate`, checkKey: "makemigrations", hints: ["Generate migrations", "Then apply them"], expectedError: "no such column" },
        { title: "Reverse Miss", desc: "The URL name does not resolve.", bug: "wrong name", code: `return redirect(reverse('user-detail'))`, solution: `return redirect(reverse('users:detail'))`, checkKey: "'users:detail'", hints: ["Include the namespace", "Check app_name in urls.py"], expectedError: "NoReverseMatch" },
      ],
      Intermediate: [
        { title: "N+1 Templates", desc: "Each row fires a fresh query.", bug: "no select_related", code: `books = Book.objects.all()\nfor book in books:\n    print(book.author.name)`, solution: `books = Book.objects.select_related('author').all()\nfor book in books:\n    print(book.author.name)`, checkKey: "select_related('author')", hints: ["select_related for FKs", "prefetch_related for M2M"], expectedError: "N+1 queries" },
        { title: "Frozen Timestamp", desc: "updated_at never changes on edits.", bug: "auto_now_add", code: `updated_at = models.DateTimeField(auto_now_add=True)`, solution: `updated_at = models.DateTimeField(auto_now=True)`, checkKey: "auto_now=True", hints: ["auto_now updates on save", "auto_now_add is create-only"], expectedError: "Stale timestamp" },
        { title: "Committed Secret", desc: "SECRET_KEY sits in settings.py.", bug: "hardcoded", code: `SECRET_KEY = 'abc123'`, solution: `import os\nSECRET_KEY = os.environ['SECRET_KEY']`, checkKey: "os.environ['SECRET_KEY']", hints: ["Read from the environment", "Never commit secrets"], expectedError: "Security risk" },
      ],
      Advanced: [
        { title: "Redundant .all()", desc: "Chaining .all() then filter is wasteful.", bug: "extra .all()", code: `User.objects.all().filter(active=True)`, solution: `User.objects.filter(active=True)`, checkKey: "User.objects.filter", hints: ["Filter directly on the manager", ".all() is redundant here"], expectedError: "Slower query" },
        { title: "Stock Oversell", desc: "Two orders read the same stock.", bug: "read-modify-write", code: `product = Product.objects.get(pk=id)\nproduct.stock -= quantity\nproduct.save()`, solution: `Product.objects.filter(pk=id, stock__gte=quantity).update(stock=F('stock') - quantity)`, checkKey: "F('stock')", hints: ["Update atomically with F()", "Check stock in the filter"], expectedError: "Negative stock" },
        { title: "Half a Transfer", desc: "A crash leaves accounts inconsistent.", bug: "no transaction", code: `a.balance -= 100\na.save()\nb.balance += 100\nb.save()`, solution: `from django.db import transaction\n\nwith transaction.atomic():\n    a.balance -= 100\n    a.save()\n    b.balance += 100\n    b.save()`, checkKey: "transaction.atomic()", hints: ["Wrap multi-step writes", "Atomic blocks roll back together"], expectedError: "Partial updates" },
      ],
      Nightmare: [
        { title: "Mass Assignment", desc: "User input flows straight into fields.", bug: "setattr loop", code: `user = User.objects.get(pk=id)\nfor key, value in request.POST.items():\n    setattr(user, key, value)\nuser.save()`, solution: `user = UserForm(request.POST, instance=user)\nuser.save()`, checkKey: "UserForm(request.POST", hints: ["Bind the form instead", "Only whitelisted fields change"], expectedError: "Privilege escalation" },
        { title: "Stale Instance", desc: "F() bypasses the in-memory object.", bug: "no refresh", code: `Product.objects.filter(pk=id).update(stock=F('stock') - 1)\nprint(product.stock)  # stale`, solution: `Product.objects.filter(pk=id).update(stock=F('stock') - 1)\nproduct.refresh_from_db()\nprint(product.stock)`, checkKey: "refresh_from_db()", hints: ["update() skips the instance", "refresh_from_db() reloads"], expectedError: "Stale value" },
        { title: "Debug in Prod", desc: "DEBUG=True ships a backdoor.", bug: "hardcoded DEBUG", code: `DEBUG = True`, solution: `import os\nDEBUG = os.environ.get('DJANGO_DEBUG') == '1'`, checkKey: "DJANGO_DEBUG", hints: ["Drive DEBUG from the env", "Debug pages leak internals"], expectedError: "Security risk" },
      ],
    },
  },
  {
    slug: "git", name: "Git", icon: "git", desc: "Fix Git configuration and workflow errors", accent: "#f97316", lang: "Git", monacoLang: "shell",
    problems: {
      Beginner: [
        { title: "Secret in History", desc: "An API key is committed.", bug: "secret pushed", code: `git add .env\ngit commit -m "add env"`, solution: `git rm --cached .env\necho ".env" >> .gitignore\ngit filter-branch --index-filter "git rm --cached --ignore-unmatch .env" HEAD`, checkKey: "filter-branch", hints: ["Rewrite history", "Rotate the secret afterwards"], expectedError: "Exposed credentials" },
        { title: "Detached Work", desc: "Commits made off any branch.", bug: "no branch", code: `git checkout abc123\n# commits made here`, solution: `git checkout -b my-fix abc123`, checkKey: "checkout -b", hints: ["Create a branch first", "Otherwise commits can be lost"], expectedError: "Lost commits" },
        { title: "Conflict Leftovers", desc: "Merge markers are still in the code.", bug: "unresolved markers", code: `<<<<<<< HEAD\nflag = true\n=======\nflag = false\n>>>>>>> branch`, solution: `flag = read_flag()`, checkKey: "read_flag()", hints: ["Resolve the conflict", "Replace the marked block"], expectedError: "Syntax error" },
      ],
      Intermediate: [
        { title: "Force Push Wipe", desc: "A force push erased teammates' work.", bug: "--force", code: `git push --force`, solution: `git push --force-with-lease`, checkKey: "--force-with-lease", hints: ["--force-with-lease is safer", "Refuses if the remote moved"], expectedError: "Lost commits" },
        { title: "Wrong Author", desc: "Commits carry the wrong identity.", bug: "bad config", code: `git commit -m "fix"`, solution: `git config user.email "me@example.com"\ngit commit --amend --reset-author`, checkKey: "--amend --reset-author", hints: ["Set user.email", "Amend resets the author"], expectedError: "Wrong contributor" },
        { title: "Ignored, Not Ignored", desc: "gitignore does not apply to tracked files.", bug: "already tracked", code: `# .gitignore added but file still tracked`, solution: `git rm --cached file.log\necho "file.log" >> .gitignore`, checkKey: "git rm --cached", hints: ["Untrack it first", "Then ignore it"], expectedError: "File keeps changing" },
      ],
      Advanced: [
        { title: "Rebasing Shared", desc: "Rebase rewrites public history.", bug: "rebase on shared", code: `git checkout feature\ngit rebase main\ngit push --force-with-lease`, solution: `git checkout main\ngit merge feature`, checkKey: "git merge feature", hints: ["Never rebase shared branches", "Merge to integrate"], expectedError: "Diverged history" },
        { title: "Hard Reset Damage", desc: "git reset --hard threw away work.", bug: "hard reset", code: `git reset --hard HEAD~3`, solution: `git reset --hard HEAD~3\n# recover with\ngit reflog`, checkKey: "git reflog", hints: ["reflog keeps old commits", "Find the SHA and reset back"], expectedError: "Lost commits" },
        { title: "Shallow Clone", desc: "History stops at the depth limit.", bug: "shallow clone", code: `git clone --depth 1 repo.git`, solution: `git clone --depth 1 repo.git\ncd repo\ngit fetch --unshallow`, checkKey: "--unshallow", hints: ["Shallow clones lack history", "git fetch --unshallow completes it"], expectedError: "Missing history" },
      ],
      Nightmare: [
        { title: "Dangling Submodule", desc: "The submodule pointer moved.", bug: "stale pointer", code: `git submodule update --init`, solution: `git submodule update --remote`, checkKey: "submodule update --remote", hints: ["--remote pulls latest", "Or commit the pointer bump"], expectedError: "Wrong submodule version" },
        { title: "Cherry-Pick Rerun", desc: "Re-applying an already merged commit.", bug: "duplicate apply", code: `git cherry-pick abc123`, solution: `git cherry-pick -x abc123`, checkKey: "cherry-pick -x", hints: ["-x records the source", "Check git log for duplicates"], expectedError: "Duplicate change" },
        { title: "LFS Bypassed", desc: "Big files are not stored in LFS.", bug: "no LFS tracking", code: `git add model.bin`, solution: `git lfs track "*.bin"\ngit add .gitattributes model.bin`, checkKey: "git lfs track", hints: ["Track patterns with LFS", "Commit .gitattributes"], expectedError: "Bloated repository" },
      ],
    },
  },
  {
    slug: "node", name: "Node.js", icon: "node", desc: "Debug Node.js server-side code", accent: "#22c55e", lang: "Node.js", monacoLang: "javascript",
    problems: {
      Beginner: [
        { title: "Unhandled Rejection", desc: "A failed promise crashes the process.", bug: "no catch", code: `fetchData().then(handle);`, solution: `fetchData().then(handle).catch(console.error);`, checkKey: ".catch(", hints: ["Always attach .catch()", "Or try/catch with await"], expectedError: "UnhandledPromiseRejection" },
        { title: "Blocking Read", desc: "readFileSync freezes the server.", bug: "sync API", code: `const data = fs.readFileSync(f);`, solution: `const data = await fs.promises.readFile(f);`, checkKey: "await fs.promises.readFile", hints: ["Use the async API", "Never block the event loop"], expectedError: "Server freezes" },
        { title: "Await Forgotten", desc: "fetch returns a promise, not data.", bug: "missing await", code: `const data = fetch(url);\nconsole.log(data.body);`, solution: `const data = await fetch(url);\nconsole.log(data.body);`, checkKey: "await fetch", hints: ["Add await before fetch", "data is a Promise otherwise"], expectedError: "undefined property" },
      ],
      Intermediate: [
        { title: "Callback Pyramid", desc: "Nested callbacks are unreadable.", bug: "nested callbacks", code: `fs.readFile(a, (e, d) => {\n    fs.readFile(b, (e2, d2) => {\n        console.log(d, d2);\n    });\n});`, solution: `const d = await fs.promises.readFile(a);\nconst d2 = await fs.promises.readFile(b);\nconsole.log(d, d2);`, checkKey: "await fs.promises", hints: ["Use promises + async/await", "Flat is better than nested"], expectedError: "Unreadable code" },
        { title: "Undefined Port", desc: "An env var that is not set.", bug: "no fallback", code: `const port = process.env.PORT;\nserver.listen(port);`, solution: `const port = process.env.PORT || 3000;\nserver.listen(port);`, checkKey: "|| 3000", hints: ["Provide a default", "Env vars may be undefined"], expectedError: "listen EADDRINUSE / undefined" },
        { title: "CJS in ESM", desc: "require() fails in a module scope.", bug: "require in ESM", code: `const x = require('foo');`, solution: `import x from 'foo';`, checkKey: "import x from", hints: ["Use import in ESM", "Or rename the file to .cjs"], expectedError: "require is not defined" },
      ],
      Advanced: [
        { title: "Listener Pileup", desc: "The emitter never removes listeners.", bug: "no removal", code: `emitter.on('data', handler);`, solution: `emitter.once('data', handler);`, checkKey: "emitter.once", hints: ["Use .once() for one-shots", "Or removeListener"], expectedError: "MaxListenersExceededWarning" },
        { title: "Abrupt Exit", desc: "process.exit drops in-flight work.", bug: "force exit", code: `server.listen(3000);\nprocess.on('SIGTERM', () => process.exit(0));`, solution: `server.listen(3000);\nprocess.on('SIGTERM', () => {\n    server.close(() => process.exit(0));\n});`, checkKey: "server.close(", hints: ["Close before exiting", "Let requests drain"], expectedError: "Truncated requests" },
        { title: "Unhandled Global", desc: "A stray rejection kills the app.", bug: "no global handler", code: `app.get('/x', async (req, res) => {\n    throw new Error('boom');\n});`, solution: `process.on('unhandledRejection', (err) => console.error(err));`, checkKey: "unhandledRejection", hints: ["Catch at the process level", "Or wrap routes in try/catch"], expectedError: "Process crash" },
      ],
      Nightmare: [
        { title: "Zombie Child", desc: "A child process outlives the parent.", bug: "orphaned child", code: `const child = spawn('long-task');`, solution: `const child = spawn('long-task');\nprocess.on('exit', () => child.kill());`, checkKey: "child.kill()", hints: ["Kill children on exit", "Avoid detached processes"], expectedError: "Orphan process" },
        { title: "No Backpressure", desc: "A fast reader overwhelms a slow writer.", bug: "manual piping", code: `reader.on('data', (c) => writer.write(c));`, solution: `stream.pipeline(reader, writer, (err) => console.error(err));`, checkKey: "stream.pipeline", hints: ["pipeline handles backpressure", "It also propagates errors"], expectedError: "Memory blow-up" },
        { title: "Polluted JSON", desc: "__proto__ lands in parsed objects.", bug: "unsafe parse", code: `const user = JSON.parse(raw);\nmerge(config, user);`, solution: `const user = JSON.parse(raw);\nmerge(Object.create(null), user);`, checkKey: "Object.create(null)", hints: ["Null-prototype objects resist pollution", "Guard merge keys too"], expectedError: "Prototype pollution" },
      ],
    },
  },
  {
    slug: "aspnet", name: "ASP.NET", icon: "aspnet", desc: "Fix ASP.NET Core web APIs and MVC apps", accent: "#8b5cf6", lang: "ASP.NET", monacoLang: "csharp",
    problems: {
      Beginner: [
        { title: "No ApiController", desc: "Model validation is never automatic.", bug: "missing attribute", code: `public class UsersController : ControllerBase { }`, solution: `[ApiController]\npublic class UsersController : ControllerBase { }`, checkKey: "[ApiController]", hints: ["Add [ApiController]", "Auto-validates model state"], expectedError: "Manual checks needed" },
        { title: "Scoped as Singleton", desc: "The DbContext is captured once.", bug: "AddSingleton", code: `services.AddSingleton<IUserService, UserService>();`, solution: `services.AddScoped<IUserService, UserService>();`, checkKey: "AddScoped", hints: ["Scoped per request", "Singletons capture DbContext"], expectedError: "Cannot resolve scoped service" },
        { title: "Blocking Async", desc: ".Result deadlocks or stalls.", bug: "sync over async", code: `public User Get() {\n    return _repo.LoadAsync(id).Result;\n}`, solution: `public async Task<User> Get() {\n    return await _repo.LoadAsync(id);\n}`, checkKey: "async Task<User>", hints: ["Await all the way up", "Never call .Result"], expectedError: "Deadlock" },
      ],
      Intermediate: [
        { title: "async void Crash", desc: "Exceptions in async void kill the app.", bug: "async void", code: `async void Save() {\n    await _db.SaveChangesAsync();\n}`, solution: `async Task Save() {\n    await _db.SaveChangesAsync();\n}`, checkKey: "async Task Save()", hints: ["Return Task, not void", "Exceptions then flow to the caller"], expectedError: "Unobserved exception" },
        { title: "Entity Leak", desc: "Database entities cross the wire.", bug: "returns entity", code: `return Ok(user);`, solution: `return Ok(user.ToDto());`, checkKey: "ToDto()", hints: ["Expose DTOs", "Hide internal fields"], expectedError: "Overexposed data" },
        { title: "CORS Blocked", desc: "The SPA cannot reach the API.", bug: "no CORS", code: `app.UseRouting();`, solution: `app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader());\napp.UseRouting();`, checkKey: "UseCors", hints: ["Add UseCors before routing", "Configure a named policy"], expectedError: "CORS error" },
      ],
      Advanced: [
        { title: "Captured Scope", desc: "A singleton holds a scoped service.", bug: "ctor injection in singleton", code: `public class EmailSender {\n    private readonly DbContext _db;\n    public EmailSender(DbContext db) { _db = db; }\n}`, solution: `public class EmailSender {\n    private readonly IServiceScopeFactory _scopeFactory;\n    public EmailSender(IServiceScopeFactory f) { _scopeFactory = f; }\n\n    public async Task Send() {\n        using var scope = _scopeFactory.CreateScope();\n        var db = scope.ServiceProvider.GetRequiredService<DbContext>();\n    }\n}`, checkKey: "IServiceScopeFactory", hints: ["Create a scope per operation", "Never inject scoped into singleton"], expectedError: "Stale/closed DbContext" },
        { title: "String SQL", desc: "User input is interpolated into SQL.", bug: "string concat", code: `var sql = $"SELECT * FROM Users WHERE Name = '{name}'";`, solution: `var users = _db.Users.FromSqlInterpolated($"SELECT * FROM Users WHERE Name = {name}").ToList();`, checkKey: "FromSqlInterpolated", hints: ["Parameterize with interpolation", "EF compiles safe parameters"], expectedError: "SQL injection" },
        { title: "Unvalidated Input", desc: "Bad payloads pass straight through.", bug: "no ModelState check", code: `[HttpPost]\npublic IActionResult Create(UserDto dto) {\n    return Ok(_service.Create(dto));\n}`, solution: `[HttpPost]\npublic IActionResult Create(UserDto dto) {\n    if (!ModelState.IsValid) return BadRequest(ModelState);\n    return Ok(_service.Create(dto));\n}`, checkKey: "ModelState.IsValid", hints: ["Check ModelState", "Return 400 on invalid"], expectedError: "Invalid data accepted" },
      ],
      Nightmare: [
        { title: "Sync Over Async", desc: "GetAwaiter can deadlock the UI thread.", bug: ".GetAwaiter().GetResult()", code: `var data = _svc.FetchAsync().GetAwaiter().GetResult();`, solution: `var data = await _svc.FetchAsync().ConfigureAwait(false);`, checkKey: "ConfigureAwait(false)", hints: ["ConfigureAwait(false) avoids capture", "Better: await all the way"], expectedError: "Deadlock" },
        { title: "Hosted Scope", desc: "Background services misuse scoped DI.", bug: "inject scoped in hosted", code: `public class Worker : BackgroundService {\n    private readonly DbContext _db;\n    public Worker(DbContext db) { _db = db; }\n}`, solution: `public class Worker : BackgroundService {\n    private readonly IServiceScopeFactory _scopeFactory;\n    public Worker(IServiceScopeFactory f) { _scopeFactory = f; }\n\n    protected override async Task ExecuteAsync(CancellationToken ct) {\n        using var scope = _scopeFactory.CreateScope();\n        var db = scope.ServiceProvider.GetRequiredService<DbContext>();\n    }\n}`, checkKey: "CreateScope()", hints: ["Hosted services are singletons", "Create a scope per iteration"], expectedError: "DbContext disposed" },
        { title: "Cancellation Ignored", desc: "Requests keep running after disconnect.", bug: "no token", code: `public async Task<IActionResult> Long() {\n    await Task.Delay(TimeSpan.FromMinutes(5));\n    return Ok();\n}`, solution: `public async Task<IActionResult> Long(CancellationToken ct) {\n    await Task.Delay(TimeSpan.FromMinutes(5), ct);\n    return Ok();\n}`, checkKey: "CancellationToken ct", hints: ["Accept the token", "Pass it to async calls"], expectedError: "Resource leak" },
      ],
    },
  },
  {
    slug: "rust", name: "Rust", icon: "rust", desc: "Fix ownership, borrowing, and lifetime issues", accent: "#ea580c", lang: "Rust", monacoLang: "rust",
    problems: {
      Beginner: [
        { title: "Move Afterwards", desc: "Using a value after moving it fails.", bug: "use after move", code: `let s = String::from("hi");\nlet t = s;\nprintln!("{}", s);`, solution: `let s = String::from("hi");\nlet t = s.clone();\nprintln!("{}", s);`, checkKey: "s.clone()", hints: ["clone() keeps the original", "Or borrow with &s"], expectedError: "borrow of moved value" },
        { title: "Index Panic", desc: "Indexing past the end panics.", bug: "raw index", code: `let items = vec![1, 2, 3];\nprintln!("{}", items[5]);`, solution: `let items = vec![1, 2, 3];\nprintln!("{:?}", items.get(5));`, checkKey: "items.get(5)", hints: ["get() returns Option", "Handle the None case"], expectedError: "index out of bounds" },
        { title: "Stuck Counter", desc: "The loop never advances.", bug: "missing increment", code: `let mut i = 0;\nwhile i < 10 {\n    println!("{i}");\n}`, solution: `let mut i = 0;\nwhile i < 10 {\n    println!("{i}");\n    i += 1;\n}`, checkKey: "i += 1", hints: ["Increment the counter", "Otherwise it loops forever"], expectedError: "Infinite loop" },
      ],
      Intermediate: [
        { title: "Borrow Conflict", desc: "Mutating while iterating by value.", bug: "iter instead of iter_mut", code: `for x in items.iter() {\n    *x += 1;\n}`, solution: `for x in items.iter_mut() {\n    *x += 1;\n}`, checkKey: "iter_mut()", hints: ["iter_mut yields &mut", "iter yields shared refs"], expectedError: "cannot borrow as mutable" },
        { title: "Reallocation", desc: "Growth invalidates held references.", bug: "reference into vec", code: `let mut v = vec![1, 2, 3];\nlet first = &v[0];\nv.push(4);\nprintln!("{}", first);`, solution: `let mut v = Vec::with_capacity(10);\nlet first = &v[0];\nv.push(4);\nprintln!("{}", first);`, checkKey: "Vec::with_capacity(10)", hints: ["push can reallocate", "Reserve capacity up front"], expectedError: "borrow error / dangling" },
        { title: "Immutable Bind", desc: "Rebinding a variable needs mut.", bug: "shadowing mistake", code: `let count = 0;\ncount += 1;\nprintln!("{count}");`, solution: `let mut count = 0;\ncount += 1;\nprintln!("{count}");`, checkKey: "let mut count", hints: ["Variables are immutable by default", "Add mut to mutate"], expectedError: "cannot assign to immutable" },
      ],
      Advanced: [
        { title: "Lifetime Escape", desc: "A function returns a local borrow.", bug: "dangling return", code: `fn prefix(s: &str) -> &str {\n    let local = s.trim();\n    &local[..2]\n}`, solution: `fn prefix(s: &str) -> String {\n    s.trim()[..2].to_string()\n}`, checkKey: "-> String", hints: ["Return owned data", "The local dies on return"], expectedError: "lifetime error" },
        { title: "Rc Cycle", desc: "A reference cycle leaks memory.", bug: "Rc back-reference", code: `struct Node {\n    next: Option<Rc<Node>>,\n    prev: Option<Rc<Node>>,\n}`, solution: `struct Node {\n    next: Option<Rc<Node>>,\n    prev: Option<Weak<Node>>,\n}`, checkKey: "Weak<Node>", hints: ["Weak breaks the cycle", "Use downgrade() for back-links"], expectedError: "Memory leak" },
        { title: "Unsafe Shortcut", desc: "Raw pointers where safe code works.", bug: "unnecessary unsafe", code: `let ptr = &mut items[0] as *mut i32;\nunsafe { *ptr = 99; }`, solution: `items[0] = 99;`, checkKey: "items[0] = 99", hints: ["Safe indexing works here", "Limit unsafe to real need"], expectedError: "UB risk" },
      ],
      Nightmare: [
        { title: "Cross-Thread Rc", desc: "Rc is not Send — threads reject it.", bug: "Rc across threads", code: `let shared = Rc::new(42);\nthread::spawn(move || println!("{}", shared));`, solution: `let shared = Arc<Mutex<i32>>::new(42);\nlet c = Arc::clone(&shared);\nthread::spawn(move || println!("{}", *c.lock().unwrap()));`, checkKey: "Arc<Mutex>", hints: ["Arc is the atomic Rc", "Mutex adds interior mutability"], expectedError: "Rc cannot be sent" },
        { title: "Release Overflow", desc: "Arithmetic wraps silently in release.", bug: "wrapping add", code: `let total: u32 = a + b;`, solution: `let total = a.saturating_add(b);`, checkKey: "saturating_add", hints: ["Overflow panics in debug only", "Use saturating or checked"], expectedError: "Silent wrap" },
        { title: "Leaking Recursion", desc: "Deep recursion blows the stack.", bug: "recursive walk", code: `fn depth(n: u32) -> u32 {\n    if n == 0 { return 0; }\n    1 + depth(n - 1)\n}`, solution: `fn depth(n: u32) -> u32 {\n    let mut d = 0;\n    let mut cur = n;\n    while cur > 0 {\n        d += 1;\n        cur -= 1;\n    }\n    d\n}`, checkKey: "while cur > 0", hints: ["Frames are finite", "Iterate instead of recurse"], expectedError: "stack overflow" },
      ],
    },
  },
  {
    slug: "go", name: "Go", icon: "go", desc: "Fix goroutines, channels, and Go idioms", accent: "#22d3ee", lang: "Go", monacoLang: "go",
    problems: {
      Beginner: [
        { title: "Index Out of Range", desc: "Reading past the slice panics.", bug: "off-by-one", code: `items := []int{1, 2, 3}\nfmt.Println(items[len(items)])`, solution: `items := []int{1, 2, 3}\nfmt.Println(items[len(items)-1])`, checkKey: "len(items)-1", hints: ["Valid indexes end at len-1", "Or use items[len(items)-1]"], expectedError: "index out of range" },
        { title: "Nil Map Write", desc: "Writing to an uninitialized map panics.", bug: "no make", code: `var counts map[string]int\ncounts["a"] = 1`, solution: `counts := make(map[string]int)\ncounts["a"] = 1`, checkKey: "make(map[string]int)", hints: ["Maps need make()", "Nil maps are read-only"], expectedError: "assignment to entry in nil map" },
        { title: "Trim Too Much", desc: "Trim cuts a set of characters, not a suffix.", bug: "Trim misuse", code: `file := "photo.jpg"\nfmt.Println(strings.Trim(file, ".jpg"))`, solution: `fmt.Println(strings.TrimSuffix(file, ".jpg"))`, checkKey: "TrimSuffix", hints: ["Trim removes a cutset, not a suffix", "TrimSuffix removes one ending"], expectedError: "Over-trimmed" },
      ],
      Intermediate: [
        { title: "Racy Counter", desc: "Concurrent goroutines lose updates.", bug: "unsynchronized", code: `count := 0\nfor i := 0; i < 100; i++ {\n    go func() { count++ }()\n}`, solution: `var mu sync.Mutex\ncount := 0\nfor i := 0; i < 100; i++ {\n    go func() {\n        mu.Lock()\n        count++\n        mu.Unlock()\n    }()\n}`, checkKey: "sync.Mutex", hints: ["Protect shared writes", "Use a mutex or atomic"], expectedError: "Data race" },
        { title: "Channel Jam", desc: "An unbuffered send blocks forever.", bug: "no receiver", code: `ch := make(chan int)\nch <- 1\nfmt.Println("sent")`, solution: `ch := make(chan int, 1)\nch <- 1\nfmt.Println("sent")`, checkKey: "make(chan int, 1)", hints: ["Buffer the channel", "Or pair it with a reader"], expectedError: "Deadlock" },
        { title: "Shared Backing", desc: "Slices share the same array.", bug: "subslice mutation", code: `a := []int{1, 2, 3, 4}\nb := a[:2]\nb[0] = 99\nfmt.Println(a)`, solution: `a := []int{1, 2, 3, 4}\nb := make([]int, 2)\ncopy(b, a[:2])\nb[0] = 99\nfmt.Println(a)`, checkKey: "copy(b, a[:2])", hints: ["Subslices share storage", "copy() makes it independent"], expectedError: "Mutation leaks" },
      ],
      Advanced: [
        { title: "Goroutine Leak", desc: "A blocked goroutine never exits.", bug: "no timeout", code: `for {\n    select {\n    case v := <-ch:\n        handle(v)\n    }\n}`, solution: `ctx, cancel := context.WithTimeout(context.Background(), time.Second)\ndefer cancel()\nfor {\n    select {\n    case v := <-ch:\n        handle(v)\n    case <-ctx.Done():\n        return\n    }\n}`, checkKey: "context.WithTimeout", hints: ["Give work a deadline", "Select on ctx.Done()"], expectedError: "Goroutine leak" },
        { title: "Loop Variable Share", desc: "Goroutines capture the same variable.", bug: "range capture", code: `for _, v := range items {\n    go func() { fmt.Println(v) }()\n}`, solution: `for _, v := range items {\n    v := v\n    go func() { fmt.Println(v) }()\n}`, checkKey: "v := v", hints: ["The loop var is reused", "Shadow it per iteration"], expectedError: "All print the last value" },
        { title: "Pointer Logging", desc: "%v prints an address, not the value.", bug: "%v on pointer", code: `u := &User{Name: "ada"}\nfmt.Printf("%v\\n", u)`, solution: `u := &User{Name: "ada"}\nfmt.Printf("%+v\\n", u)`, checkKey: '"%+v"', hints: ["%+v prints struct fields", "Pointers need %+v or deref"], expectedError: "&{...} only" },
      ],
      Nightmare: [
        { title: "Atomic Miss", desc: "Mixed atomic and plain access is racy.", bug: "non-atomic increment", code: `var counter int64\ncounter++\nfmt.Println(atomic.LoadInt64(&counter))`, solution: `var counter int64\natomic.AddInt64(&counter, 1)\nfmt.Println(atomic.LoadInt64(&counter))`, checkKey: "atomic.AddInt64", hints: ["Increment atomically", "Mixed access is racy"], expectedError: "Data race" },
        { title: "time.After Leak", desc: "time.After allocates until it fires.", bug: "timer in loop", code: `for {\n    select {\n    case <-time.After(time.Second):\n        poll()\n    }\n}`, solution: `ticker := time.NewTicker(time.Second)\ndefer ticker.Stop()\nfor {\n    select {\n    case <-ticker.C:\n        poll()\n    }\n}`, checkKey: "time.NewTicker", hints: ["time.After leaks until fire", "Use a ticker and Stop() it"], expectedError: "Memory growth" },
        { title: "Panic in Goroutine", desc: "One panic takes down the whole binary.", bug: "no recover", code: `go func() {\n    panic("boom")\n}()\ntime.Sleep(time.Second)`, solution: `go func() {\n    defer func() {\n        if r := recover(); r != nil {\n            log.Println("recovered:", r)\n        }\n    }()\n    panic("boom")\n}()\ntime.Sleep(time.Second)`, checkKey: "recover()", hints: ["Recover at the goroutine top", "A panic kills the process otherwise"], expectedError: "Process crash" },
      ],
    },
  },
  {
    slug: "docker", name: "Docker", icon: "docker", desc: "Fix Dockerfile and container issues", accent: "#38bdf8", lang: "Docker", monacoLang: "dockerfile",
    problems: {
      Beginner: [
        { title: "No Start Command", desc: "The container exits instantly.", bug: "missing CMD", code: `FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt`, solution: `FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nCMD ["python", "app.py"]`, checkKey: 'CMD ["python", "app.py"]', hints: ["Every image needs CMD", "Use exec form"], expectedError: "Exited(0) immediately" },
        { title: "node_modules Copied", desc: "Local dependencies bloat the image.", bug: "no dockerignore", code: `COPY . .\nRUN npm install`, solution: `# .dockerignore\nnode_modules\n\nCOPY . .\nRUN npm install`, checkKey: ".dockerignore", hints: ["Exclude local node_modules", "Install inside the build"], expectedError: "Huge image" },
        { title: "Full Base Image", desc: "A heavy base wastes space.", bug: "python:latest", code: `FROM python:latest`, solution: `FROM python:3.12-slim`, checkKey: "3.12-slim", hints: ["Slim images cut size", "Pin the version too"], expectedError: "1GB+ image" },
      ],
      Intermediate: [
        { title: "Cache Ordering", desc: "Source changes invalidate the npm cache.", bug: "copy all first", code: `COPY . .\nRUN npm install`, solution: `COPY package.json package-lock.json ./\nRUN npm install\nCOPY . .`, checkKey: "COPY package.json", hints: ["Copy manifests first", "npm install is cached then"], expectedError: "Slow rebuilds" },
        { title: "Running as Root", desc: "The container runs with full privileges.", bug: "no USER", code: `FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nCMD ["node", "server.js"]`, solution: `FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nUSER node\nCMD ["node", "server.js"]`, checkKey: "USER node", hints: ["Drop privileges", "The node image ships a user"], expectedError: "Security risk" },
        { title: "Unpinned Packages", desc: "apt installs drift across builds.", bug: "no version pins", code: `RUN apt-get update && apt-get install -y curl`, solution: `RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*`, checkKey: "--no-install-recommends", hints: ["Skip recommended packages", "Clean apt lists"], expectedError: "Reproducibility issues" },
      ],
      Advanced: [
        { title: "Fat Single Stage", desc: "Build tools ship to production.", bug: "one stage", code: `FROM golang:1.22\nWORKDIR /app\nCOPY . .\nRUN go build -o server .\nCMD ["./server"]`, solution: `FROM golang:1.22 AS builder\nWORKDIR /app\nCOPY . .\nRUN go build -o server .\n\nFROM alpine:3.20\nCOPY --from=builder /app/server /server\nCMD ["/server"]`, checkKey: "AS builder", hints: ["Build in one stage", "Copy only the binary out"], expectedError: "Huge production image" },
        { title: "Secret in ENV", desc: "Keys are baked into the image.", bug: "ENV secret", code: `ENV API_KEY=sk-123`, solution: `# inject at runtime instead\nENV API_KEY=""`, checkKey: 'ENV API_KEY=""', hints: ["Never bake secrets", "Inject at runtime"], expectedError: "Leaked credentials" },
        { title: "Nginx Not Foreground", desc: "nginx exits without a daemon flag.", bug: "daemon on", code: `FROM nginx:alpine\nCOPY site /usr/share/nginx/html\nCMD ["nginx"]`, solution: `FROM nginx:alpine\nCOPY site /usr/share/nginx/html\nCMD ["nginx", "-g", "daemon off;"]`, checkKey: "daemon off", hints: ["Containers need foreground", "daemon off keeps nginx alive"], expectedError: "Exited immediately" },
      ],
      Nightmare: [
        { title: "No Healthcheck", desc: "Orchestrators cannot see failures.", bug: "missing HEALTHCHECK", code: `FROM node:20-alpine\nCMD ["node", "server.js"]`, solution: `FROM node:20-alpine\nHEALTHCHECK CMD wget -qO- http://localhost:3000/health || exit 1\nCMD ["node", "server.js"]`, checkKey: "HEALTHCHECK", hints: ["Add a probe", "Orchestrators restart on failure"], expectedError: "Serving 500s silently" },
        { title: "Layer Bloat", desc: "Package caches survive into layers.", bug: "unmounted cache", code: `RUN apt-get update && apt-get install -y curl`, solution: `RUN --mount=type=cache,target=/var/cache/apt apt-get update && apt-get install -y curl`, checkKey: "--mount=type=cache", hints: ["BuildKit cache mounts", "Cache stays out of layers"], expectedError: "Fat layers" },
        { title: "All Capabilities", desc: "The container can do anything.", bug: "no cap drop", code: `docker run --name app image`, solution: `docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE --name app image`, checkKey: "--cap-drop=ALL", hints: ["Drop every capability", "Add back only what is needed"], expectedError: "Escape risk" },
      ],
    },
  },

  {
    slug: "kubernetes", name: "Kubernetes", icon: "kubernetes", desc: "Fix pods, services, and deployment issues", accent: "#3b82f6", lang: "Kubernetes", monacoLang: "yaml",
    problems: {
      Beginner: [
        { title: "Always Pull Policy", desc: "The image is not pulled as expected.", bug: "wrong policy", code: `containers:\n  - name: app\n    image: myapp:1.2.3`, solution: `containers:\n  - name: app\n    image: myapp:1.2.3\n    imagePullPolicy: IfNotPresent`, checkKey: "imagePullPolicy", hints: ["Pin a policy", "IfNotPresent saves pulls"], expectedError: "ImageNotFound" },
        { title: "No Liveness Probe", desc: "A hung pod is never restarted.", bug: "missing probe", code: `containers:\n  - name: app\n    image: myapp`, solution: `containers:\n  - name: app\n    image: myapp\n    livenessProbe:\n      httpGet:\n        path: /health\n        port: 8080`, checkKey: "livenessProbe", hints: ["Probe for liveness", "Kubelet restarts on failure"], expectedError: "Zombie pod" },
        { title: "Secret Not Wired", desc: "The pod cannot read the secret.", bug: "no envFrom", code: `env:\n  - name: API_KEY\n    value: "hardcoded"`, solution: `env:\n  - name: API_KEY\n    valueFrom:\n      secretKeyRef:\n        name: app-secrets\n        key: api-key`, checkKey: "secretKeyRef", hints: ["Reference the secret", "Never hardcode values"], expectedError: "Missing secret" },
      ],
      Intermediate: [
        { title: "Unlimited Pods", desc: "One pod can starve the node.", bug: "no resources", code: `containers:\n  - name: app\n    image: myapp`, solution: `containers:\n  - name: app\n    image: myapp\n    resources:\n      requests:\n        cpu: 100m\n        memory: 128Mi\n      limits:\n        memory: 256Mi`, checkKey: "resources:", hints: ["Set requests and limits", "Scheduler uses requests"], expectedError: "Node starvation" },
        { title: "Readiness Missing", desc: "Traffic hits a pod that is not ready.", bug: "no readiness", code: `containers:\n  - name: app\n    image: myapp\n    livenessProbe:\n      httpGet: { path: /health, port: 8080 }`, solution: `containers:\n  - name: app\n    image: myapp\n    livenessProbe:\n      httpGet: { path: /health, port: 8080 }\n    readinessProbe:\n      httpGet: { path: /ready, port: 8080 }`, checkKey: "readinessProbe", hints: ["Readiness gates traffic", "Liveness gates restarts"], expectedError: "Request failures" },
        { title: "Config Not Mounted", desc: "The configmap value is missing.", bug: "no configMapKeyRef", code: `env:\n  - name: MODE\n    value: "prod"`, solution: `env:\n  - name: MODE\n    valueFrom:\n      configMapKeyRef:\n        name: app-config\n        key: mode`, checkKey: "configMapKeyRef", hints: ["Source from the ConfigMap", "Keep config out of the pod"], expectedError: "Wrong config" },
      ],
      Advanced: [
        { title: "Downtime Rollout", desc: "All pods restart at once.", bug: "default maxUnavailable", code: `spec:\n  replicas: 3`, solution: `spec:\n  replicas: 3\n  strategy:\n    rollingUpdate:\n      maxUnavailable: 0\n      maxSurge: 1`, checkKey: "maxUnavailable: 0", hints: ["Keep capacity during rollout", "maxSurge adds first"], expectedError: "Rollout downtime" },
        { title: "Wrong Service Port", desc: "The service targets a dead port.", bug: "mismatched port", code: `spec:\n  ports:\n    - port: 80\n      targetPort: 8080`, solution: `spec:\n  ports:\n    - port: 80\n      targetPort: 3000`, checkKey: "targetPort: 3000", hints: ["targetPort matches the container", "Check the app's listen port"], expectedError: "Connection refused" },
        { title: "Stateless Needs State", desc: "Stateful data on a Deployment.", bug: "Deployment for DB", code: `kind: Deployment\nmetadata:\n  name: postgres`, solution: `kind: StatefulSet\nmetadata:\n  name: postgres`, checkKey: "kind: StatefulSet", hints: ["StatefulSet gives stable IDs", "Deployments are for stateless"], expectedError: "Data loss" },
      ],
      Nightmare: [
        { title: "Root Container", desc: "Pods run as root by default.", bug: "no securityContext", code: `containers:\n  - name: app\n    image: myapp`, solution: `containers:\n  - name: app\n    image: myapp\n    securityContext:\n      runAsNonRoot: true\n      seccompProfile:\n        type: RuntimeDefault`, checkKey: "seccompProfile", hints: ["Run as non-root", "Use a default seccomp profile"], expectedError: "Escalation risk" },
        { title: "Reclaimed PVC", desc: "Delete deletes the data too.", bug: "default reclaim", code: `kind: PersistentVolumeClaim\nmetadata:\n  name: data`, solution: `kind: PersistentVolume\nmetadata:\n  name: data-pv\nspec:\n  persistentVolumeReclaimPolicy: Retain`, checkKey: "persistentVolumeReclaimPolicy: Retain", hints: ["Retain keeps the volume", "Delete wipes it"], expectedError: "Data loss" },
        { title: "No PDB", desc: "A node drain kills everything.", bug: "missing budget", code: `kind: Deployment\nmetadata:\n  name: api`, solution: `kind: PodDisruptionBudget\nmetadata:\n  name: api-pdb\nspec:\n  minAvailable: 1\n  selector:\n    matchLabels:\n      app: api`, checkKey: "minAvailable: 1", hints: ["PDB caps voluntary disruption", "Drains respect the budget"], expectedError: "Full outage" },
      ],
    },
  },
  {
    slug: "linux", name: "Linux", icon: "linux", desc: "Fix Linux commands and shell scripting", accent: "#facc15", lang: "Linux", monacoLang: "shell",
    problems: {
      Beginner: [
        { title: "World-Readable Key", desc: "Permissions leak a private key.", bug: "chmod 644", code: `chmod 644 ~/.ssh/id_rsa`, solution: `chmod 600 ~/.ssh/id_rsa`, checkKey: "chmod 600", hints: ["Private keys need 600", "ssh rejects loose keys"], expectedError: "UNPROTECTED PRIVATE KEY" },
        { title: "Grep Exit Code", desc: "grep prints but does not branch.", bug: "no -q", code: `if grep "error" app.log; then\n    echo "found"\nfi`, solution: `if grep -q "error" app.log; then\n    echo "found"\nfi`, checkKey: "grep -q", hints: ["-q silences output", "Exit status still works"], expectedError: "Spammy logs" },
        { title: "Globbed Pattern", desc: "The shell expanded the wildcard.", bug: "unquoted pattern", code: `find /var/log -name *.log`, solution: `find /var/log -name "*.log"`, checkKey: '-name "*.log"', hints: ["Quote the pattern", "Prevent shell globbing"], expectedError: "Wrong files" },
      ],
      Intermediate: [
        { title: "SIGKILL First", desc: "kill -9 skips graceful shutdown.", bug: "immediate -9", code: `kill -9 $(pgrep mysqld)`, solution: `kill $(pgrep mysqld)\n# wait, then escalate\nsleep 10\nkill -9 $(pgrep mysqld) 2>/dev/null`, checkKey: "kill -9 $(pgrep mysqld) 2>/dev/null", hints: ["SIGTERM first", "Escalate to -9 only after a grace period"], expectedError: "Corrupted data" },
        { title: "Extract Elsewhere", desc: "tar unpacks into the current dir.", bug: "no -C", code: `tar -xzf app.tar.gz`, solution: `tar -xzf app.tar.gz -C /opt/app`, checkKey: "-C /opt/app", hints: ["Target a directory", "Avoid dumping in place"], expectedError: "File clutter" },
        { title: "Stale Mirror", desc: "rsync never removes deleted files.", bug: "no --delete", code: `rsync -avz ./dist/ user@host:/var/www/`, solution: `rsync -avz --delete ./dist/ user@host:/var/www/`, checkKey: "--delete", hints: ["--delete mirrors exactly", "Removed files vanish remotely"], expectedError: "Old files linger" },
      ],
      Advanced: [
        { title: "FD Exhaustion", desc: "The process runs out of file descriptors.", bug: "low ulimit", code: `# server keeps failing with EMFILE`, solution: `ulimit -n 65535\n# persist in /etc/security/limits.conf`, checkKey: "ulimit -n 65535", hints: ["Raise the soft limit", "Persist in limits.conf"], expectedError: "Too many open files" },
        { title: "Cron Without PATH", desc: "cron cannot find the binaries.", bug: "minimal env", code: `*/5 * * * * backup.sh`, solution: `*/5 * * * * PATH=/usr/local/bin:$PATH backup.sh`, checkKey: "PATH=/usr/local/bin:$PATH", hints: ["cron env is minimal", "Set PATH in the job"], expectedError: "command not found" },
        { title: "Lost Variable", desc: "A subshell never sees the export.", bug: "no export", code: `VAR=hello\nbash -c 'echo $VAR'`, solution: `export VAR=hello\nbash -c 'echo $VAR'`, checkKey: "export VAR", hints: ["export passes to children", "Plain assignment is local"], expectedError: "Empty output" },
      ],
      Nightmare: [
        { title: "No Process Cap", desc: "Users can fork-bomb the box.", bug: "unlimited nproc", code: `# /etc/security/limits.conf\n# no nproc limit set`, solution: `# /etc/security/limits.conf\n* hard nproc 512`, checkKey: "hard nproc", hints: ["Cap process count", "Prevents fork bombs"], expectedError: "System hang" },
        { title: "Overlapping Cron", desc: "A slow job starts again mid-run.", bug: "no lock", code: `*/5 * * * * /usr/local/bin/sync.sh`, solution: `*/5 * * * * /usr/bin/flock -n /tmp/sync.lock /usr/local/bin/sync.sh`, checkKey: "flock", hints: ["Lock the job", "-n fails fast on contention"], expectedError: "Double execution" },
        { title: "Runaway Logs", desc: "journald fills the disk.", bug: "unbounded journal", code: `# /etc/systemd/journald.conf\n# no size cap`, solution: `# /etc/systemd/journald.conf\nSystemMaxUse=1G`, checkKey: "SystemMaxUse", hints: ["Cap journal size", "SystemMaxUse=1G"], expectedError: "Disk full" },
      ],
    },
  },
  {
    slug: "aws", name: "AWS", icon: "aws", desc: "Fix AWS services and infrastructure issues", accent: "#f59e0b", lang: "AWS", monacoLang: "yaml",
    problems: {
      Beginner: [
        { title: "Private Bucket", desc: "Objects 403 for anonymous users.", bug: "no public policy", code: `# bucket with no bucket policy`, solution: `# bucket policy\n{\n  "Statement": [{\n    "Effect": "Allow",\n    "Principal": "*",\n    "Action": "s3:GetObject",\n    "Resource": "arn:aws:s3:::my-bucket/*"\n  }]\n}`, checkKey: '"Principal": "*"', hints: ["Add a public-read policy", "Or use CloudFront OAC"], expectedError: "403 AccessDenied" },
        { title: "Open Security Group", desc: "SSH is open to the whole internet.", bug: "0.0.0.0/0", code: `"CidrIp": "0.0.0.0/0"`, solution: `"CidrIp": "10.0.0.0/8"`, checkKey: '"CidrIp": "10.0.0.0/8"', hints: ["Restrict the source", "Allow only trusted CIDRs"], expectedError: "Exposed port" },
        { title: "Lambda Timeout", desc: "Cold starts kill the function.", bug: "3s timeout", code: `"Timeout": 3`, solution: `"Timeout": 300`, checkKey: '"Timeout": 300', hints: ["Give enough headroom", "Cold starts need seconds"], expectedError: "Task timed out" },
      ],
      Intermediate: [
        { title: "No Versioning", desc: "Overwrites are unrecoverable.", bug: "versioning off", code: `# bucket created without versioning`, solution: `aws s3api put-bucket-versioning \\\n  --bucket my-bucket --versioning-configuration Status=Enabled`, checkKey: "Status=Enabled", hints: ["Enable versioning", "Recover overwrites"], expectedError: "Lost object versions" },
        { title: "Single-AZ DB", desc: "The DB dies with the AZ.", bug: "no Multi-AZ", code: `"Multi-AZ": false`, solution: `"Multi-AZ": true`, checkKey: '"Multi-AZ": true', hints: ["Multi-AZ gives failover", "Standby in another AZ"], expectedError: "Outage" },
        { title: "Wrong Health Path", desc: "Healthy backends get deregistered.", bug: "health path 404", code: `"HealthCheck": {\n  "Target": "HTTP:80/"\n}`, solution: `"HealthCheck": {\n  "Target": "HTTP:80/health"\n}`, checkKey: 'HTTP:80/health', hints: ["Point at a real endpoint", "404 means unhealthy"], expectedError: "All targets unhealthy" },
      ],
      Advanced: [
        { title: "Cold Start Parade", desc: "Every invoke spins a new sandbox.", bug: "no provisioned concurrency", code: `# no ProvisionedConcurrencyConfig`, solution: `aws lambda put-provisioned-concurrency-config \\\n  --function-name api \\\n  --qualifier prod \\\n  --provisioned-concurrent-executions 10`, checkKey: "provisioned-concurrent-executions", hints: ["Pre-warm instances", "For steady traffic"], expectedError: "Latency spikes" },
        { title: "Redelivered Work", desc: "Consumers get the same message twice.", bug: "short visibility", code: `"VisibilityTimeout": 0`, solution: `"VisibilityTimeout": 300`, checkKey: '"VisibilityTimeout": 300', hints: ["Hide in-flight messages", "Long enough to process"], expectedError: "Duplicate processing" },
        { title: "Stale CDN", desc: "Users keep the old JS bundle.", bug: "no invalidation", code: `# deploy happened, cache not cleared`, solution: `aws cloudfront create-invalidation \\\n  --distribution-id ABC123 \\\n  --paths "/*"`, checkKey: "create-invalidation", hints: ["Purge cached paths", "Or versioned filenames"], expectedError: "Old assets served" },
      ],
      Nightmare: [
        { title: "Wildcard Principal", desc: "Anyone with a key can read the bucket.", bug: "* principal", code: `"Principal": "*"`, solution: `"Principal": { "AWS": "arn:aws:iam::123456789012:root" }`, checkKey: "arn:aws:iam", hints: ["Scope to your account", "Never use * for data"], expectedError: "Data exposure" },
        { title: "Stale Keys", desc: "KMS keys never rotate.", bug: "rotation off", code: `# key created without rotation`, solution: `aws kms enable-key-rotation --key-id alias/my-key`, checkKey: "enable-key-rotation", hints: ["Rotate annually", "Automate it"], expectedError: "Long-lived keys" },
        { title: "Blind VPC", desc: "No one sees the network traffic.", bug: "no flow logs", code: `# VPC without Flow Logs`, solution: `aws ec2 create-flow-logs \\\n  --resource-type VPC \\\n  --resource-ids vpc-123 \\\n  --traffic-type ALL \\\n  --log-group-name /aws/vpc/flow`, checkKey: "create-flow-logs", hints: ["Log all traffic", "ALL captures both directions"], expectedError: "Invisible incidents" },
      ],
    },
  },
  {
    slug: "reactnative", name: "React Native", icon: "reactnative", desc: "Debug mobile app crashes and RN quirks", accent: "#22d3ee", lang: "React Native", monacoLang: "javascript",
    problems: {
      Beginner: [
        { title: "Missing Key", desc: "FlatList warns and misrenders.", bug: "no keyExtractor", code: `<FlatList\n  data={items}\n  renderItem={({ item }) => <Text>{item.title}</Text>}\n/>`, solution: `<FlatList\n  data={items}\n  keyExtractor={(item) => item.id}\n  renderItem={({ item }) => <Text>{item.title}</Text>}\n/>`, checkKey: "keyExtractor", hints: ["Give rows stable keys", "Use item.id"], expectedError: "Warning + broken rows" },
        { title: "Inline Styles", desc: "Styles re-create every render.", bug: "inline style objects", code: `<Text style={{ color: 'red', fontSize: 16 }}>Hi</Text>`, solution: `const styles = StyleSheet.create({\n  text: { color: 'red', fontSize: 16 },\n});\n// <Text style={styles.text}>Hi</Text>`, checkKey: "StyleSheet.create", hints: ["Create styles once", "Improves performance"], expectedError: "Jank on re-render" },
        { title: "State Outside", desc: "setState is called outside the component.", bug: "module-level state", code: `let count = 0;\n// incremented in an event handler`, solution: `const [count, setCount] = useState(0);`, checkKey: "useState(0)", hints: ["useState lives in components", "UI should not read globals"], expectedError: "Stale UI" },
      ],
      Intermediate: [
        { title: "List Re-Renders", desc: "Every row updates on each render.", bug: "no memo", code: `<FlatList data={items} renderItem={({ item }) => <ItemRow item={item} />} />`, solution: `const ItemRow = React.memo(({ item }) => (\n  <View>{item.title}</View>\n));`, checkKey: "React.memo", hints: ["Memoize rows", "Skip unchanged props"], expectedError: "Slow scrolling" },
        { title: "Missing Deps", desc: "The effect uses stale values.", bug: "empty deps", code: `useEffect(() => {\n  loadUser(userId);\n}, []);`, solution: `useEffect(() => {\n  loadUser(userId);\n}, [userId]);`, checkKey: "[userId]", hints: ["List every dependency", "userId drives the fetch"], expectedError: "Stale data" },
        { title: "Keyboard Hides Input", desc: "The form vanishes behind the keyboard.", bug: "no avoidance", code: `<View>{/* inputs */}</View>`, solution: `<KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>\n  {/* inputs */}\n</KeyboardAvoidingView>`, checkKey: "KeyboardAvoidingView", hints: ["Wrap the form", "Padding shifts it up"], expectedError: "Hidden fields" },
      ],
      Advanced: [
        { title: "Focus Listener Leak", desc: "Listeners stack across focuses.", bug: "addListener in effect", code: `useEffect(() => {\n  navigation.addListener('focus', onFocus);\n}, []);`, solution: `useFocusEffect(React.useCallback(() => {\n  onFocus();\n}, [onFocus]));`, checkKey: "useFocusEffect", hints: ["useFocusEffect cleans up", "It re-runs per focus"], expectedError: "Duplicate calls" },
        { title: "Unmounted SetState", desc: "Updates after unmount leak.", bug: "no cancellation", code: `useEffect(() => {\n  api.fetch(userId).then(setData);\n}, [userId]);`, solution: `useEffect(() => {\n  const controller = new AbortController();\n  api.fetch(userId, { signal: controller.signal }).then(setData);\n  return () => controller.abort();\n}, [userId]);`, checkKey: "AbortController", hints: ["Abort on cleanup", "Guard the update"], expectedError: "State on unmounted" },
        { title: "Inline Callback", desc: "Handlers recreate every render.", bug: "new function each time", code: `onPress={() => handlePress(item.id)}`, solution: `const onPress = useCallback((id) => handlePress(id), [handlePress]);`, checkKey: "useCallback", hints: ["Stable callbacks", "Matters inside memoized lists"], expectedError: "Re-renders" },
      ],
      Nightmare: [
        { title: "Timer Zombies", desc: "Intervals keep firing off-screen.", bug: "no clearInterval", code: `useEffect(() => {\n  const t = setInterval(tick, 1000);\n}, []);`, solution: `useEffect(() => {\n  const t = setInterval(tick, 1000);\n  return () => clearInterval(t);\n}, []);`, checkKey: "clearInterval(t)", hints: ["Clean up timers", "Return the teardown"], expectedError: "Battery drain" },
        { title: "Native Driver Off", desc: "Animated runs on the JS thread.", bug: "no native driver", code: `Animated.timing(anim, {\n  toValue: 1,\n  duration: 300,\n}).start();`, solution: `Animated.timing(anim, {\n  toValue: 1,\n  duration: 300,\n  useNativeDriver: true,\n}).start();`, checkKey: "useNativeDriver", hints: ["Run on the UI thread", "useNativeDriver: true"], expectedError: "Janky animations" },
        { title: "Token in Storage", desc: "Tokens sit in plain AsyncStorage.", bug: "insecure storage", code: `await AsyncStorage.setItem('token', token);`, solution: `await Keychain.setGenericPassword('session', token);`, checkKey: "Keychain", hints: ["Use the Keychain", "Tokens need secure storage"], expectedError: "Credential theft" },
      ],
    },
  },
  {
    slug: "flutter", name: "Flutter", icon: "flutter", desc: "Fix Flutter/Dart widget and state issues", accent: "#38bdf8", lang: "Flutter", monacoLang: "dart",
    problems: {
      Beginner: [
        { title: "SetState After Die", desc: "Updating a disposed widget throws.", bug: "no mounted guard", code: `setState(() { _value = result; });`, solution: `if (!mounted) return;\nsetState(() { _value = result; });`, checkKey: "!mounted", hints: ["Check mounted first", "After await, the widget may be gone"], expectedError: "setState() called after dispose" },
        { title: "List Builds All", desc: "ListView constructs every item.", bug: "children list", code: `ListView(children: items.map((i) => Item(i)).toList())`, solution: `ListView.builder(itemCount: items.length, itemBuilder: (c, i) => Item(items[i]))`, checkKey: "ListView.builder", hints: ["Builder builds lazily", "Only visible rows"], expectedError: "Jank / memory" },
        { title: "Text Overflows", desc: "Long text breaks the layout.", bug: "no ellipsis", code: `Text(post.title)`, solution: `Text(post.title, maxLines: 2, overflow: TextOverflow.ellipsis)`, checkKey: "TextOverflow.ellipsis", hints: ["Cap the lines", "Ellipsize the rest"], expectedError: "Render overflow" },
      ],
      Intermediate: [
        { title: "FutureBuilder Spin", desc: "No waiting state means a flash.", bug: "missing ConnectionState", code: `FutureBuilder(\n  future: future,\n  builder: (c, snap) => Text(snap.data ?? ''),\n)`, solution: `FutureBuilder(\n  future: future,\n  builder: (c, snap) {\n    if (snap.connectionState == ConnectionState.waiting) {\n      return const CircularProgressIndicator();\n    }\n    return Text(snap.data ?? '');\n  },\n)`, checkKey: "ConnectionState", hints: ["Handle the waiting state", "Return a spinner"], expectedError: "Empty flash" },
        { title: "No Keys", desc: "Reorder crashes state tracking.", bug: "missing keys", code: `ListView.builder(itemCount: items.length, itemBuilder: (c, i) => Item(items[i]))`, solution: `ListView.builder(itemCount: items.length, itemBuilder: (c, i) => Item(key: ValueKey(items[i].id), items[i]))`, checkKey: "ValueKey", hints: ["Stable identity per row", "ValueKey(items[i].id)"], expectedError: "Wrong state reuse" },
        { title: "Controller Leak", desc: "Controllers are never disposed.", bug: "no dispose", code: `final _controller = TextEditingController();`, solution: `final _controller = TextEditingController();\n\n@override\nvoid dispose() {\n  _controller.dispose();\n  super.dispose();\n}`, checkKey: "_controller.dispose()", hints: ["Dispose controllers", "Avoid leaks"], expectedError: "Leak" },
      ],
      Advanced: [
        { title: "Work in Build", desc: "Side effects run every rebuild.", bug: "fetch in build", code: `@override\nWidget build(context) {\n  api.fetch();\n  return Text('hi');\n}`, solution: `@override\nvoid initState() {\n  super.initState();\n  api.fetch();\n}\n\n@override\nWidget build(context) {\n  return Text('hi');\n}`, checkKey: "initState", hints: ["initState runs once", "Keep build pure"], expectedError: "Repeated fetches" },
        { title: "Missing Const", desc: "The widget rebuilds needlessly.", bug: "no const", code: `return Padding(\n  padding: EdgeInsets.all(8),\n  child: Text('hi'),\n);`, solution: `return const Padding(\n  padding: EdgeInsets.all(8),\n  child: Text('hi'),\n);`, checkKey: "const Padding", hints: ["Const widgets are canonical", "Flutter skips rebuilding them"], expectedError: "Extra rebuilds" },
        { title: "Heavy Parse", desc: "JSON parsing blocks the UI thread.", bug: "sync parse", code: `final list = jsonDecode(raw) as List;`, solution: `final list = await compute(parseJson, raw);`, checkKey: "compute(", hints: ["Run it on an isolate", "compute() returns a Future"], expectedError: "UI freeze" },
      ],
      Nightmare: [
        { title: "EventChannel Leak", desc: "Native streams are never cancelled.", bug: "no cancel", code: `_channel.receiveBroadcastStream().listen(onEvent);`, solution: `_sub ??= _channel.receiveBroadcastStream().listen(onEvent);\n// later\n_sub?.cancel();`, checkKey: ".cancel()", hints: ["Cancel the subscription", "On dispose or teardown"], expectedError: "Native leak" },
        { title: "Image Pop-In", desc: "Images flash in after load.", bug: "no precache", code: `Image.network(url)`, solution: `precacheImage(NetworkImage(url), context);`, checkKey: "precacheImage", hints: ["Preload ahead of time", "Smooth transitions"], expectedError: "Flicker" },
        { title: "Pagination Race", desc: "Double-scroll loads the same page.", bug: "no in-flight guard", code: `scrollController.addListener(() {\n  if (position.pixels > maxScrollExtent - 200) {\n    loadMore();\n  }\n});`, solution: `if (_isLoading) return;\n_isLoading = true;\n// load page, then _isLoading = false`, checkKey: "_isLoading", hints: ["Guard re-entrancy", "Reset after the fetch"], expectedError: "Duplicate pages" },
      ],
    },
  },
  {
    slug: "angular", name: "Angular", icon: "angular", desc: "Fix Angular components, RxJS, and DI", accent: "#ef4444", lang: "Angular", monacoLang: "typescript",
    problems: {
      Beginner: [
        { title: "Observable Not Async", desc: "The template shows the object, not data.", bug: "no async pipe", code: `users$ = service.getUsers();\n// template: {{ users$ }}`, solution: `// template:\n<li *ngFor="let u of users$ | async">{{ u.name }}</li>`, checkKey: "| async", hints: ["Unwrap with | async", "It also unsubscribes"], expectedError: "[object Object]" },
        { title: "Broken Two-Way", desc: "The input never updates the model.", bug: "one-way binding", code: `<input [value]="name">`, solution: `<input [(ngModel)]="name">`, checkKey: "[(ngModel)]", hints: ["Two-way needs the banana box", "[(ngModel)]"], expectedError: "Stale value" },
        { title: "All Rows Rebuild", desc: "ngFor recreates every row.", bug: "no trackBy", code: `<li *ngFor="let u of users">{{ u.name }}</li>`, solution: `<li *ngFor="let u of users; trackBy: trackById">{{ u.name }}</li>`, checkKey: "trackBy: trackById", hints: ["Give rows identity", "trackBy reduces rebuilds"], expectedError: "DOM churn" },
      ],
      Intermediate: [
        { title: "Eager Changes", desc: "Every event triggers a full check.", bug: "default strategy", code: `@Component({\n  selector: 'app-card',\n  template: '...'\n})`, solution: `@Component({\n  selector: 'app-card',\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: '...'\n})`, checkKey: "OnPush", hints: ["OnPush checks only on input change", "Helps big trees"], expectedError: "Perf hits" },
        { title: "Subscription Leak", desc: "Observables never unsubscribe.", bug: "raw subscribe", code: `ngOnInit() {\n  service.getData().subscribe(d => this.data = d);\n}`, solution: `ngOnInit() {\n  service.getData().pipe(takeUntil(this.destroy$)).subscribe(d => this.data = d);\n}\n\nngOnDestroy() {\n  this.destroy$.next();\n  this.destroy$.complete();\n}`, checkKey: "takeUntil", hints: ["takeUntil the destroy subject", "Complete it on destroy"], expectedError: "Memory leak" },
        { title: "Stale Params", desc: "The route change is ignored.", bug: "read params once", code: `ngOnInit() {\n  const id = this.route.snapshot.paramMap.get('id');\n  this.load(id);\n}`, solution: `ngOnInit() {\n  this.route.paramMap.pipe(\n    switchMap(params => this.load(params.get('id')))\n  ).subscribe();\n}`, checkKey: "switchMap", hints: ["React to param changes", "switchMap cancels stale calls"], expectedError: "Wrong data" },
      ],
      Advanced: [
        { title: "Per-Module Service", desc: "Each lazy module gets its own copy.", bug: "providedIn in module", code: `@Injectable()\nexport class ApiService { }\n// provided in a lazy module`, solution: `@Injectable({ providedIn: 'root' })\nexport class ApiService { }`, checkKey: "providedIn: 'root'", hints: ["providedIn root = singleton", "Lazy modules re-provide otherwise"], expectedError: "Multiple instances" },
        { title: "Eager Routes", desc: "Everything loads on startup.", bug: "no lazy loading", code: `{ path: 'admin', component: AdminComponent }`, solution: `{ path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }`, checkKey: "loadChildren", hints: ["Code-split routes", "import() lazily"], expectedError: "Big initial bundle" },
        { title: "Impure Timing", desc: "The pipe never recomputes.", bug: "pure default", code: `@Pipe({ name: 'sort' })\nexport class SortPipe { }`, solution: `@Pipe({ name: 'sort', pure: false })\nexport class SortPipe { }`, checkKey: "pure: false", hints: ["Pure pipes cache", "impure re-runs on each check"], expectedError: "Stale output" },
      ],
      Nightmare: [
        { title: "Wrong Flattening", desc: "mergeMap stacks requests without limit.", bug: "mergeMap flood", code: `search$.pipe(mergeMap(q => api.search(q))).subscribe(...)`, solution: `search$.pipe(\n  debounceTime(300),\n  switchMap(q => api.search(q))\n).subscribe(...)`, checkKey: "debounceTime(300)", hints: ["Debounce keystrokes", "switchMap cancels the old call"], expectedError: "Request flood" },
        { title: "Detector Overwork", desc: "Off-screen components keep checking.", bug: "never detached", code: `@Component({ selector: 'app-offscreen', template: '...' })`, solution: `// after the data is ready:\nthis.cd.detach();`, checkKey: "cd.detach()", hints: ["Detach from change detection", "Re-attach when needed"], expectedError: "Perf drain" },
        { title: "Interceptor Order", desc: "Auth never runs before requests.", bug: "wrong provider order", code: `providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]`, solution: `providers: [\n  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },\n  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true }\n]`, checkKey: "LoggingInterceptor", hints: ["multi allows stacking", "Order defines the chain"], expectedError: "Interceptors skipped" },
      ],
    },
  },
  {
    slug: "vue", name: "Vue", icon: "vue", desc: "Fix Vue 3 reactivity and component issues", accent: "#10b981", lang: "Vue", monacoLang: "html",
    problems: {
      Beginner: [
        { title: "Prop Mutated", desc: "Changing a prop breaks the flow.", bug: "v-model on prop", code: `props: ['modelValue']\n// <input v-model="modelValue">`, solution: `props: ['modelValue']\n// <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">`, checkKey: "update:modelValue", hints: ["Emit updates", "Props are read-only"], expectedError: "Vue warning" },
        { title: "Keyless Loop", desc: "Rows get reused wrongly.", bug: "no :key", code: `<li v-for="item in items">{{ item.name }}</li>`, solution: `<li v-for="item in items" :key="item.id">{{ item.name }}</li>`, checkKey: ':key="item.id"', hints: ["Give rows keys", "Stable identity"], expectedError: "Wrong state reuse" },
        { title: "Undefined Access", desc: "The object may be null.", bug: "no v-if guard", code: `<p>{{ user.name }}</p>`, solution: `<p v-if="user">{{ user.name }}</p>`, checkKey: 'v-if="user"', hints: ["Guard before access", "Or use optional chaining"], expectedError: "Cannot read properties of null" },
      ],
      Intermediate: [
        { title: "Shallow Watch", desc: "Nested changes are missed.", bug: "no deep watch", code: `watch(obj, handler);`, solution: `watch(obj, handler, { deep: true });`, checkKey: "deep: true", hints: ["deep watches nested fields", "Add { deep: true }"], expectedError: "Missed updates" },
        { title: "Dom Not Ready", desc: "Measuring happens too early.", bug: "no nextTick", code: `show() {\n  this.visible = true;\n  const h = this.$refs.box.offsetHeight;\n}`, solution: `async show() {\n  this.visible = true;\n  await this.$nextTick();\n  const h = this.$refs.box.offsetHeight;\n}`, checkKey: "$nextTick()", hints: ["Wait for the DOM flush", "await this.$nextTick()"], expectedError: "0 height" },
        { title: "Listener Ghost", desc: "Window listeners never die.", bug: "no cleanup", code: `mounted() {\n  window.addEventListener('resize', this.onResize);\n}`, solution: `mounted() {\n  window.addEventListener('resize', this.onResize);\n}\n\nunmounted() {\n  window.removeEventListener('resize', this.onResize);\n}`, checkKey: "unmounted()", hints: ["Remove on unmount", "Match the exact handler"], expectedError: "Listener leak" },
      ],
      Advanced: [
        { title: "v-model Passthrough", desc: "The wrapper breaks the contract.", bug: "manual bridging", code: `props: ['modelValue']\n// manually forwarding value/events`, solution: `props: ['modelValue']\n// <Child v-model="modelValue" /> works via defineModel`, checkKey: "defineModel", hints: ["defineModel simplifies", "Clean two-way wrappers"], expectedError: "Broken v-model" },
        { title: "Sync Lazy Load", desc: "The heavy component ships always.", bug: "static import", code: `import Chart from './Chart.vue'`, solution: `const Chart = defineAsyncComponent(() => import('./Chart.vue'));`, checkKey: "defineAsyncComponent", hints: ["Lazy-load heavy parts", "Code-split routes"], expectedError: "Big bundle" },
        { title: "Missing Default", desc: "inject() throws without a provider.", bug: "no fallback", code: `const api = inject('api');\napi.fetch();`, solution: `const api = inject('api', defaultApi);\napi.fetch();`, checkKey: "inject('api', defaultApi)", hints: ["Provide a fallback", "Or guard for undefined"], expectedError: "inject() warning" },
      ],
      Nightmare: [
        { title: "Lost Reactivity", desc: "Destructuring severs the proxy.", bug: "destructured reactive", code: `const { user } = reactive({ user: 'ada' });`, solution: `const state = reactive({ user: 'ada' });\nconst { user } = toRefs(state);`, checkKey: "toRefs", hints: ["toRefs keeps refs live", "Destructuring plain proxies is one-way"], expectedError: "Stale value" },
        { title: "Watcher Zombie", desc: "Watchers run after unmount.", bug: "no manual stop", code: `setup() {\n  watch(source, handler);\n}`, solution: `setup() {\n  const stop = watch(source, handler);\n  onUnmounted(stop);\n}`, checkKey: "onUnmounted(stop)", hints: ["watch returns a stopper", "Stop it on unmount"], expectedError: "Leak" },
        { title: "Teleport Target", desc: "The modal renders inside the app.", bug: "no Teleport", code: `<div class="modal">...</div>`, solution: `<Teleport to="body">\n  <div class="modal">...</div>\n</Teleport>`, checkKey: 'to="body"', hints: ["Teleport to body", "Escapes overflow contexts"], expectedError: "Clipped modal" },
      ],
    },
  },
  {
    slug: "react", name: "React + TSX", icon: "react", desc: "Fix React hooks, TypeScript, and rendering bugs", accent: "#22d3ee", lang: "React + TSX", monacoLang: "typescript",
    problems: {
      Beginner: [
        { title: "Missing Keys", desc: "React warns and misorders rows.", bug: "no key", code: `{items.map((item) => <li>{item.name}</li>)}`, solution: `{items.map((item) => <li key={item.id}>{item.name}</li>)}`, checkKey: "key={item.id}", hints: ["Give rows identity", "Avoid index keys when possible"], expectedError: "Warning + wrong reuse" },
        { title: "DOM Directly", desc: "Mutating the DOM outside React.", bug: "document.getElementById", code: `function Toast({ msg }) {\n  document.getElementById('toast').textContent = msg;\n  return null;\n}`, solution: `function Toast({ msg }) {\n  return <div>{msg}</div>;\n}`, checkKey: "return <div>{msg}</div>", hints: ["Render, do not mutate", "State drives the DOM"], expectedError: "Stale UI" },
        { title: "Props Mutated", desc: "Modifying props breaks purity.", bug: "props.push", code: `function List({ items }) {\n  items.push({ id: 99, name: 'x' });\n  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;\n}`, solution: `function List({ items }) {\n  const next = [...items, { id: 99, name: 'x' }];\n  return <ul>{next.map(i => <li key={i.id}>{i.name}</li>)}</ul>;\n}`, checkKey: "[...items]", hints: ["Copy before changing", "Never mutate props"], expectedError: "Side effects" },
      ],
      Intermediate: [
        { title: "Stale Closure", desc: "The interval sees an old count.", bug: "missing dep", code: `useEffect(() => {\n  const t = setInterval(() => setCount(count + 1), 1000);\n  return () => clearInterval(t);\n}, []);`, solution: `useEffect(() => {\n  const t = setInterval(() => setCount(c => c + 1), 1000);\n  return () => clearInterval(t);\n}, []);`, checkKey: "c => c + 1", hints: ["Use the functional update", "setCount(c => c + 1)"], expectedError: "Stuck at 1" },
        { title: "Listener Leak", desc: "Window listeners outlive the component.", bug: "no cleanup", code: `useEffect(() => {\n  window.addEventListener('resize', onResize);\n}, []);`, solution: `useEffect(() => {\n  window.addEventListener('resize', onResize);\n  return () => window.removeEventListener('resize', onResize);\n}, []);`, checkKey: "removeEventListener('resize', onResize)", hints: ["Return the cleanup", "Mirror add/remove"], expectedError: "Listener leak" },
        { title: "Unmemoized Row", desc: "Every parent render redraws rows.", bug: "no React.memo", code: `function Row({ item }) { return <li>{item.name}</li>; }`, solution: `const Row = React.memo(function Row({ item }) {\n  return <li>{item.name}</li>;\n});`, checkKey: "React.memo", hints: ["Memoize stable rows", "Skip unchanged props"], expectedError: "Re-render storm" },
      ],
      Advanced: [
        { title: "Async SetState", desc: "A stale fetch overwrites newer data.", bug: "race between calls", code: `useEffect(() => {\n  fetchData(userId).then(setData);\n}, [userId]);`, solution: `useEffect(() => {\n  let cancelled = false;\n  fetchData(userId).then(d => { if (!cancelled) setData(d); });\n  return () => { cancelled = true; };\n}, [userId]);`, checkKey: "cancelled", hints: ["Guard the late response", "Cleanup flips the flag"], expectedError: "Wrong data shown" },
        { title: "New Callback Each Time", desc: "Handlers change identity every render.", bug: "inline arrow", code: `onClick={() => save(id)}`, solution: `const handleSave = useCallback(() => save(id), [id, save]);`, checkKey: "useCallback", hints: ["Stabilize callbacks", "Helps memoized children"], expectedError: "Re-renders" },
        { title: "Controlled Drift", desc: "The input becomes read-only.", bug: "value without onChange", code: `<input value={text} />`, solution: `<input value={text} onChange={(e) => setText(e.target.value)} />`, checkKey: "onChange={(e) => setText(e.target.value)}", hints: ["Controlled needs onChange", "Or use defaultValue"], expectedError: "Type nothing" },
      ],
      Nightmare: [
        { title: "Context Storm", desc: "Every consumer re-renders.", bug: "single context", code: `const AppContext = createContext(state);\n// the whole tree consumes it`, solution: `const settings = useMemo(() => ({ theme, lang }), [theme, lang]);\n// narrow contexts per concern`, checkKey: "useMemo", hints: ["Split contexts", "Memoize the value"], expectedError: "Render storm" },
        { title: "Lazy Never Loads", desc: "The big page ships up front.", bug: "static import", code: `import AdminPage from './AdminPage';`, solution: `const AdminPage = React.lazy(() => import('./AdminPage'));\n// <Suspense fallback={<Spinner />}>`, checkKey: "React.lazy", hints: ["Code-split the route", "Wrap in Suspense"], expectedError: "Big bundle" },
        { title: "StrictMode Double", desc: "Effects run twice and leak.", bug: "unclean setup", code: `useEffect(() => {\n  socket.connect();\n}, []);`, solution: `useEffect(() => {\n  socket.connect();\n  return () => socket.disconnect();\n}, []);`, checkKey: "socket.disconnect()", hints: ["StrictMode replays effects", "Return a symmetric cleanup"], expectedError: "Double connections" },
      ],
    },
  },
  {
    slug: "html", name: "HTML", icon: "html", desc: "Fix semantic HTML and accessibility issues", accent: "#f97316", lang: "HTML", monacoLang: "html",
    problems: {
      Beginner: [
        { title: "Missing Alt", desc: "Screen readers get nothing.", bug: "no alt attribute", code: `<img src="logo.png">`, solution: `<img src="logo.png" alt="Climbug logo">`, checkKey: 'alt="Climbug logo"', hints: ["Describe the image", "Decorative ones can be alt=''"], expectedError: "Inaccessible" },
        { title: "Unclosed Section", desc: "The layout bleeds into siblings.", bug: "missing </div>", code: `<main>\n  <div class="content">\n    <p>Hi</p>\n</main>`, solution: `<main>\n  <div class="content">\n    <p>Hi</p>\n  </div>\n</main>`, checkKey: "</div>", hints: ["Close every div", "Match the nesting"], expectedError: "Broken layout" },
        { title: "Illegal Nesting", desc: "A p inside a p is invalid.", bug: "p in p", code: `<p>Outer <p>Inner</p> text</p>`, solution: `<p>Outer <span>Inner</span> text</p>`, checkKey: "<span>Inner</span>", hints: ["Use span for inline", "p cannot nest p"], expectedError: "Split paragraphs" },
      ],
      Intermediate: [
        { title: "Duplicate Id", desc: "Two elements share an id.", bug: "id twice", code: `<h1 id="title">A</h1>\n<h2 id="title">B</h2>`, solution: `<h1 id="main-title">A</h1>\n<h2 id="sub-title">B</h2>`, checkKey: 'id="main-title"', hints: ["Ids must be unique", "Use classes for groups"], expectedError: "Broken anchors" },
        { title: "Form Submits", desc: "A button reloads the page.", bug: "default type=submit", code: `<button>Save draft</button>`, solution: `<button type="button">Save draft</button>`, checkKey: 'type="button"', hints: ["Outside forms or without type", "type=button prevents submit"], expectedError: "Unexpected reload" },
        { title: "Table Unclear", desc: "Headers do not map to columns.", bug: "no scope", code: `<th>Name</th><th>Score</th>`, solution: `<th scope="col">Name</th><th scope="col">Score</th>`, checkKey: 'scope="col"', hints: ["scope labels the axis", "Helps screen readers"], expectedError: "Confusing tables" },
      ],
      Advanced: [
        { title: "Unlabeled Input", desc: "The field has no accessible name.", bug: "no label", code: `<input id="email" type="email">`, solution: `<label for="email">Email</label>\n<input id="email" type="email">`, checkKey: 'for="email"', hints: ["Pair label and input", "for matches the id"], expectedError: "No field name" },
        { title: "Skipped Heading", desc: "The outline jumps from h1 to h4.", bug: "missing levels", code: `<h1>Site</h1>\n<h4>News</h4>`, solution: `<h1>Site</h1>\n<h2>News</h2>`, checkKey: "<h2>News</h2>", hints: ["Keep the order", "h1 > h2 > h3..."], expectedError: "Broken outline" },
        { title: "Nameless Select", desc: "The value never submits.", bug: "no name", code: `<select><option value="a">A</option></select>`, solution: `<select name="choice"><option value="a">A</option></select>`, checkKey: 'name="choice"', hints: ["Controls need names", "The name goes in the query"], expectedError: "Missing field" },
      ],
      Nightmare: [
        { title: "Silent Updates", desc: "Dynamic content hides from AT.", bug: "no aria-live", code: `<div id="status">Saved</div>`, solution: `<div id="status" aria-live="polite">Saved</div>`, checkKey: 'aria-live="polite"', hints: ["Announce updates", "polite for non-urgent"], expectedError: "Invisible changes" },
        { title: "Zoom Locked", desc: "Mobile users cannot zoom.", bug: "no viewport", code: `<head>\n  <title>App</title>\n</head>`, solution: `<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>App</title>\n</head>`, checkKey: "width=device-width", hints: ["Add the viewport meta", "Fixes mobile scaling"], expectedError: "Tiny page" },
        { title: "Language Unknown", desc: "Assistive tech guesses the voice.", bug: "no lang attr", code: `<html>`, solution: `<html lang="en">`, checkKey: 'lang="en"', hints: ["Declare the language", "Affects pronunciation"], expectedError: "Wrong voice" },
      ],
    },
  },
  {
    slug: "css", name: "CSS", icon: "css", desc: "Fix CSS layout, specificity, and responsive bugs", accent: "#60a5fa", lang: "CSS", monacoLang: "css",
    problems: {
      Beginner: [
        { title: "Flex Never Applied", desc: "The child layout is missing.", bug: "no display", code: `.row {\n  gap: 12px;\n}`, solution: `.row {\n  display: flex;\n  gap: 12px;\n}`, checkKey: "display: flex", hints: ["gap needs a flex/grid parent", "Add display: flex"], expectedError: "No spacing" },
        { title: "Centering Fail", desc: "margin auto needs a block.", bug: "auto margins on inline", code: `img {\n  margin: 0 auto;\n}`, solution: `img {\n  display: block;\n  margin: 0 auto;\n}`, checkKey: "display: block", hints: ["auto margins need block", "Or use flex centering"], expectedError: "Left-aligned" },
        { title: "Z-Index Ignored", desc: "The overlay hides behind cards.", bug: "no position", code: `.overlay {\n  z-index: 100;\n}`, solution: `.overlay {\n  position: fixed;\n  z-index: 100;\n}`, checkKey: "position: fixed", hints: ["z-index needs positioning", "Add position: fixed"], expectedError: "Hidden overlay" },
      ],
      Intermediate: [
        { title: "Specificity War", desc: "!important loses to nothing cleanly.", bug: "!important", code: `.btn {\n  color: blue !important;\n}\n.header .btn {\n  color: red;\n}`, solution: `button.btn {\n  color: red;\n}\n// remove the !important`, checkKey: "button.btn", hints: ["Raise specificity properly", "Avoid !important"], expectedError: "Wrong color" },
        { title: "Shrinking Sidebar", desc: "flex squashes the column.", bug: "no flex-shrink", code: `.sidebar {\n  width: 260px;\n}`, solution: `.sidebar {\n  width: 260px;\n  flex-shrink: 0;\n}`, checkKey: "flex-shrink: 0", hints: ["Flex shrinks by default", "flex-shrink: 0 locks it"], expectedError: "Narrow sidebar" },
        { title: "Transition All", desc: "Everything animates, even layout.", bug: "transition: all", code: `.card {\n  transition: all 0.3s;\n}`, solution: `.card {\n  transition: transform 0.3s;\n}`, checkKey: "transition: transform", hints: ["Animate specific properties", "Layout props cause jank"], expectedError: "Janky hover" },
      ],
      Advanced: [
        { title: "Fluid Type", desc: "Text scales poorly across devices.", bug: "fixed px", code: `h1 {\n  font-size: 48px;\n}`, solution: `h1 {\n  font-size: clamp(1.75rem, 4vw, 3rem);\n}`, checkKey: "clamp(", hints: ["clamp scales fluidly", "min, preferred, max"], expectedError: "Too big/small" },
        { title: "Physical Sides", desc: "RTL layouts break margins.", bug: "left/right", code: `.label {\n  margin-left: 8px;\n}`, solution: `.label {\n  margin-inline-start: 8px;\n}`, checkKey: "margin-inline-start", hints: ["Logical properties flip with RTL", "Use inline-start"], expectedError: "Broken RTL" },
        { title: "Layout Animation", desc: "Animating position causes reflows.", bug: "animating top/left", code: `.chip {\n  transition: top 0.3s;\n}`, solution: `.chip {\n  transition: transform 0.3s;\n  transform: translateX(var(--offset));\n}`, checkKey: "translateX", hints: ["Animate transforms", "They run on the compositor"], expectedError: "Jank" },
      ],
      Nightmare: [
        { title: "Query Too Late", desc: "Media queries miss component widths.", bug: "viewport media", code: `@media (max-width: 600px) {\n  .card { flex-direction: column; }\n}`, solution: `@container (max-width: 600px) {\n  .card { flex-direction: column; }\n}\n// .card { container-type: inline-size }`, checkKey: "@container", hints: ["Container queries respond to parents", "container-type enables them"], expectedError: "Wrong breakpoints" },
        { title: "Light Theme Flash", desc: "Dark UI renders white first.", bug: "no color-scheme", code: `html {\n  background: #0b0b13;\n}`, solution: `html {\n  color-scheme: dark;\n  background: #0b0b13;\n}`, checkKey: "color-scheme: dark", hints: ["color-scheme drives UA widgets", "Prevents flash"], expectedError: "White flash" },
        { title: "Grid Rows Manually", desc: "Subgrid would keep alignment.", bug: "hardcoded row", code: `.fields {\n  grid-template-rows: 40px 40px;\n}`, solution: `.fields {\n  grid-template-rows: subgrid;\n  grid-row: span 2;\n}`, checkKey: "subgrid", hints: ["subgrid inherits tracks", "Keeps rows aligned"], expectedError: "Misaligned rows" },
      ],
    },
  },
  {
    slug: "springboot", name: "Spring Boot", icon: "springboot", desc: "Fix Spring Boot config, DI, and JPA issues", accent: "#22c55e", lang: "Spring Boot", monacoLang: "java",
    problems: {
      Beginner: [
        { title: "View Instead of JSON", desc: "The API returns a view name.", bug: "@Controller", code: `@Controller\npublic class ApiController { }`, solution: `@RestController\npublic class ApiController { }`, checkKey: "@RestController", hints: ["@RestController auto-serializes", "Adds @ResponseBody everywhere"], expectedError: "Whitelabel error" },
        { title: "Literal @Value", desc: "The placeholder never resolves.", bug: "missing ${}", code: `@Value("my.key")\nprivate String key;`, solution: `@Value("\${my.key}")\nprivate String key;`, checkKey: "${my.key}", hints: ["Placeholders need ${}", "Otherwise it is a literal"], expectedError: "Literal string" },
        { title: "Null Path Var", desc: "The URL segment is not bound.", bug: "no @PathVariable", code: `@GetMapping("/users/{id}")\npublic User get(Long id) { }`, solution: `@GetMapping("/users/{id}")\npublic User get(@PathVariable Long id) { }`, checkKey: "@PathVariable Long id", hints: ["Bind the segment", "@PathVariable Long id"], expectedError: "id is null" },
      ],
      Intermediate: [
        { title: "Shared Singleton", desc: "One bean carries state across users.", bug: "default scope", code: `@Component\npublic class CounterService {\n    private int count;\n}`, solution: `@Component\n@Scope("prototype")\npublic class CounterService {\n    private int count;\n}`, checkKey: '"prototype"', hints: ["Singletons share state", "prototype per injection"], expectedError: "Cross-user state" },
        { title: "Scan Miss", desc: "Beans are never discovered.", bug: "wrong base package", code: `@SpringBootApplication\npublic class MyApp { }`, solution: `@SpringBootApplication(scanBasePackages = "com.myapp")\npublic class MyApp { }`, checkKey: 'scanBasePackages = "com.myapp"', hints: ["Point the scan at the beans", "Or align the package"], expectedError: "Bean not found" },
        { title: "Partial Writes", desc: "A failure leaves half the update.", bug: "no @Transactional", code: `public void transfer() {\n    from.debit();\n    to.credit();\n}`, solution: `@Transactional\npublic void transfer() {\n    from.debit();\n    to.credit();\n}`, checkKey: "@Transactional", hints: ["Wrap multi-step writes", "Rolls back together"], expectedError: "Partial updates" },
      ],
      Advanced: [
        { title: "N+1 Through JPA", desc: "Each relation fires a query.", bug: "lazy fetch in loop", code: `for (Order o : orders) {\n    o.getCustomer().getName();\n}`, solution: `@EntityGraph(attributePaths = "customer")\nList<Order> findAllWithCustomer();`, checkKey: "@EntityGraph", hints: ["Fetch join the graph", "EntityGraph avoids N+1"], expectedError: "N+1 queries" },
        { title: "Entity Leak", desc: "Internal fields cross the wire.", bug: "returns entity", code: `@GetMapping("/users/{id}")\npublic User get(@PathVariable Long id) {\n    return repo.findById(id).orElseThrow();\n}`, solution: `@GetMapping("/users/{id}")\npublic UserDto get(@PathVariable Long id) {\n    return toDto(repo.findById(id).orElseThrow());\n}`, checkKey: "toDto(", hints: ["Return DTOs", "Hide internal fields"], expectedError: "Overexposed data" },
        { title: "In-Memory in Prod", desc: "Data evaporates on restart.", bug: "H2 default", code: `spring.datasource.url=jdbc:h2:mem:testdb`, solution: `spring.datasource.url=jdbc:postgresql://prod:5432/app`, checkKey: "jdbc:postgresql", hints: ["Use a real database", "Config per environment"], expectedError: "Data loss" },
      ],
      Nightmare: [
        { title: "No Actuator", desc: "Orchestration cannot probe health.", bug: "missing starter", code: `<!-- pom.xml has no actuator -->`, solution: `<dependency>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-actuator</artifactId>\n</dependency>\n# management.endpoints.web.exposure.include=health`, checkKey: "spring-boot-starter-actuator", hints: ["Add the starter", "Expose the health endpoint"], expectedError: "No /actuator/health" },
        { title: "Bean Cycle", desc: "Two beans need each other.", bug: "constructor cycle", code: `class A { A(B b) { } }\nclass B { B(A a) { } }`, solution: `class A { A(@Lazy B b) { } }\nclass B { B(A a) { } }`, checkKey: "@Lazy B b", hints: ["@Lazy breaks the cycle", "Or refactor the dependency"], expectedError: "BeanCurrentlyInCreationException" },
        { title: "Unvalidated Body", desc: "Bad payloads reach the service.", bug: "no @Valid", code: `@PostMapping\ndef create(@RequestBody UserDto dto) { }`, solution: `@PostMapping\ndef create(@Valid @RequestBody UserDto dto) { }`, checkKey: "@Valid @RequestBody", hints: ["Add @Valid", "Triggers Bean Validation"], expectedError: "Invalid data accepted" },
      ],
    },
  },
];
/* ========= C TRACK ========= */
const cBeginner: Challenge[] = [
  ch(241, "Missing Semicolons", "The compiler chokes on two missing semicolons.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    int x = 5
    printf("%d", x)
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int x = 5;
    printf("%d", x);
    return 0;
}`,
    "every statement must end with a semicolon",
    "compile error: expected ';' before 'printf'",
    ["Each C statement ends with a semicolon", "Add ; after the declaration and after printf"],
    "int x = 5;"
  ),
  ch(242, "Warm Garbage", "An uninitialized variable is read before it has a value.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    int total;
    total = total + 10;
    printf("%d", total);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int total = 0;
    total = total + 10;
    printf("%d", total);
    return 0;
}`,
    "total is read before it is ever initialized",
    "garbage output (undefined value)",
    ["Reading an uninitialized local is undefined behavior", "Initialize total to 0"],
    "int total = 0;"
  ),
  ch(243, "Assign or Compare", "A single = inside an if makes the condition always true.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    int x = 5;
    if (x = 10)
        printf("ten");
    else
        printf("not ten");
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int x = 5;
    if (x == 10)
        printf("ten");
    else
        printf("not ten");
    return 0;
}`,
    "= assigns 10 to x instead of comparing, so the branch is always taken",
    "Output: 'ten' even though x is 5",
    ["= assigns, == compares", "Use == inside the condition"],
    "if (x == 10)"
  ),
  ch(244, "One Step Too Far", "The loop reads one element past the array.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    int arr[3] = {1, 2, 3};
    for (int i = 0; i <= 3; i++)
        printf("%d ", arr[i]);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int arr[3] = {1, 2, 3};
    for (int i = 0; i < 3; i++)
        printf("%d ", arr[i]);
    return 0;
}`,
    "valid indexes are 0..2, but the loop runs i=3 too",
    "reads memory past the array (undefined behavior)",
    ["Array indexes run 0..n-1", "Use i < 3, never i <= 3"],
    "for (int i = 0; i < 3;"
  ),
  ch(245, "Specifier Swap", "printf gets a specifier that does not match the argument.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    double pi = 3.14;
    printf("%d", pi);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    double pi = 3.14;
    printf("%.2f", pi);
    return 0;
}`,
    "%d expects an int but pi is a double",
    "garbage or undefined output",
    ["Match the specifier to the type", "%d is for int, %f is for double"],
    "printf(\"%.2f\", pi)"
  ),
  ch(246, "Forgot the Ampersand", "scanf writes into a garbage location.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    int age;
    printf("Age: ");
    scanf("%d", age);
    printf("%d", age);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int age;
    printf("Age: ");
    scanf("%d", &age);
    printf("%d", age);
    return 0;
}`,
    "scanf needs the address of the variable, not its value",
    "program crashes or reads garbage",
    ["scanf writes through a pointer", "Pass &age, not age"],
    "scanf(\"%d\", &age)"
  ),
  ch(247, "Boundary Buster", "A write lands past the end of the array.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    int nums[3] = {10, 20, 30};
    nums[3] = 99;
    printf("%d", nums[3]);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int nums[3] = {10, 20, 30};
    nums[2] = 99;
    printf("%d", nums[2]);
    return 0;
}`,
    "a 3-element array has valid indexes 0, 1 and 2 only",
    "corrupts adjacent memory / undefined behavior",
    ["The last valid index is size - 1", "Use index 2 for a 3-element array"],
    "nums[2] = 99;"
  ),
  ch(248, "Truncated Average", "Integer division drops the fraction before it is stored.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    int sum = 9, count = 2;
    double avg = sum / count;
    printf("%.1f", avg);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int sum = 9, count = 2;
    double avg = (double) sum / count;
    printf("%.1f", avg);
    return 0;
}`,
    "int / int is integer division — it truncates before the result reaches the double",
    "Output: 4.0 instead of 4.5",
    ["Cast one operand to double first", "(double) sum forces floating-point division"],
    "avg = (double) sum / count;"
  ),
  ch(249, "Lone Character", "A char is compared to a string literal.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    char grade = 'A';
    if (grade == "A")
        printf("passed");
    else
        printf("failed");
    return 0;
}`,
    `#include <stdio.h>

int main() {
    char grade = 'A';
    if (grade == 'A')
        printf("passed");
    else
        printf("failed");
    return 0;
}`,
    "\"A\" is a string (a pointer), but grade is a char — the comparison is wrong",
    "comparing a char against a pointer, wrong result",
    ["Single quotes hold exactly one character", "Double quotes make a string (char*) — use 'A'"],
    "grade == 'A'"
  ),
  ch(250, "Stuck Loop", "The loop variable never changes, so the loop never ends.", 50, 3, "C", "Beginner",
    `#include <stdio.h>

int main() {
    int n = 3;
    while (n > 0) {
        printf("%d ", n);
    }
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int n = 3;
    while (n > 0) {
        printf("%d ", n);
        n--;
    }
    return 0;
}`,
    "n is never decremented, so the condition never fails",
    "program prints forever",
    ["The loop body must change n", "Add n-- inside the loop"],
    "n--;"
  ),
];
const cIntermediate: Challenge[] = [
  ch(251, "Buffer Blast", "A string is copied into a buffer that is too small.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>
#include <string.h>

int main() {
    char name[4];
    strcpy(name, "Rusty");
    printf("%s", name);
    return 0;
}`,
    `#include <stdio.h>
#include <string.h>

int main() {
    char name[6];
    strcpy(name, "Rusty");
    printf("%s", name);
    return 0;
}`,
    "\"Rusty\" needs 6 bytes including the NUL terminator, but the buffer holds only 4",
    "stack corruption / segmentation fault",
    ["A string always needs room for the '\\0' terminator", "Size the buffer to strlen + 1"],
    "char name[6];"
  ),
  ch(252, "Leaky Malloc", "Heap memory is allocated but never released.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(100 * sizeof(int));
    p[0] = 42;
    printf("%d", p[0]);
    return 0;
}`,
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(100 * sizeof(int));
    p[0] = 42;
    printf("%d", p[0]);
    free(p);
    return 0;
}`,
    "the heap block is never released",
    "memory leak",
    ["Every malloc needs a matching free", "Free the block before the program ends"],
    "free(p);"
  ),
  ch(253, "Silent NULL", "The return of malloc is used without checking.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(100000000 * sizeof(int));
    *p = 7;
    printf("%d", *p);
    free(p);
    return 0;
}`,
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(100000000 * sizeof(int));
    if (p == NULL) {
        printf("out of memory");
        return 1;
    }
    *p = 7;
    printf("%d", *p);
    free(p);
    return 0;
}`,
    "malloc can return NULL when memory is exhausted, and dereferencing NULL crashes",
    "Segmentation fault under low memory",
    ["Always check the result of malloc", "Guard the use of p with if (p == NULL)"],
    "if (p == NULL)"
  ),
  ch(254, "StrCmp Trap", "Two string arrays are compared with ==", 140, 5, "C", "Intermediate",
    `#include <stdio.h>
#include <string.h>

int main() {
    char a[] = "mango";
    char b[] = "mango";
    if (a == b)
        printf("same");
    else
        printf("different");
    return 0;
}`,
    `#include <stdio.h>
#include <string.h>

int main() {
    char a[] = "mango";
    char b[] = "mango";
    if (strcmp(a, b) == 0)
        printf("same");
    else
        printf("different");
    return 0;
}`,
    "== compares the array addresses, not the contents",
    "Output: 'different' even though the strings match",
    ["Array names decay to pointers in comparisons", "Use strcmp(a, b) == 0 to compare contents"],
    "strcmp(a, b) == 0"
  ),
  ch(255, "No Base Case", "A recursive function never stops calling itself.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>

int fact(int n) {
    return n * fact(n - 1);
}

int main() {
    printf("%d", fact(5));
    return 0;
}`,
    `#include <stdio.h>

int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}

int main() {
    printf("%d", fact(5));
    return 0;
}`,
    "fact() has no base case, so the recursion never unwinds",
    "stack overflow (segmentation fault)",
    ["Recursion needs a stopping condition", "Return 1 when n <= 1"],
    "if (n <= 1) return 1;"
  ),
  ch(256, "Sized Right", "sizeof inside a function measures the pointer, not the array.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>

void print_size(int arr[4]) {
    printf("%zu", sizeof(arr) / sizeof(arr[0]));
}

int main() {
    int nums[4] = {1, 2, 3, 4};
    print_size(nums);
    return 0;
}`,
    `#include <stdio.h>

void print_size(int *arr, int n) {
    printf("%d", n);
}

int main() {
    int nums[4] = {1, 2, 3, 4};
    print_size(nums, 4);
    return 0;
}`,
    "an array parameter decays to a pointer, so sizeof measures the pointer",
    "Output: 2 (pointer size / int size) instead of 4",
    ["Array parameters are really pointers", "Pass the length as a separate argument"],
    "int *arr, int n"
  ),
  ch(257, "Read-Only String", "A string literal is modified through a pointer.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>

int main() {
    char *msg = "hello";
    msg[0] = 'H';
    printf("%s", msg);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    char msg[] = "hello";
    msg[0] = 'H';
    printf("%s", msg);
    return 0;
}`,
    "string literals may live in read-only memory; writing through them is undefined behavior",
    "Segmentation fault on many systems",
    ["A char* pointing at a literal is read-only", "Use a mutable array: char msg[] = \"hello\""],
    "char msg[] = \"hello\";"
  ),
  ch(258, "Negative Modulo", "The remainder of a negative number comes out negative.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>

int main() {
    int n = -7;
    int mod = n % 3;
    printf("%d", mod);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int n = -7;
    int mod = ((n % 3) + 3) % 3;
    printf("%d", mod);
    return 0;
}`,
    "C's % takes the sign of the dividend, so -7 % 3 is -1",
    "Output: -1 instead of 2",
    ["C remainder keeps the dividend's sign", "Add the modulus, then take % again, for a non-negative result"],
    "((n % 3) + 3) % 3"
  ),
  ch(259, "Unbounded Input", "gets() reads input with no size limit.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>

int main() {
    char buf[16];
    gets(buf);
    printf("hi %s", buf);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    char buf[16];
    fgets(buf, sizeof(buf), stdin);
    printf("hi %s", buf);
    return 0;
}`,
    "gets() has no bounds check and will overflow the buffer",
    "buffer overflow / stack smashing",
    ["gets() is removed from modern C", "Use fgets with a size limit"],
    "fgets(buf, sizeof(buf), stdin)"
  ),
  ch(260, "Shadowed Global", "A local variable hides the global it should update.", 140, 5, "C", "Intermediate",
    `#include <stdio.h>

int total = 100;

int main() {
    int total = 1;
    total = total + 5;
    printf("%d", total);
    return 0;
}`,
    `#include <stdio.h>

int total = 100;

int main() {
    total += 5;
    printf("%d", total);
    return 0;
}`,
    "the local declaration shadows the global, so the global is never updated",
    "Output: 6 instead of 105",
    ["A local variable hides the global with the same name", "Remove the local to update the global"],
    "total += 5;"
  ),
];
const cAdvanced: Challenge[] = [
  ch(261, "Double Free", "The same heap block is freed twice.", 250, 8, "C", "Advanced",
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));
    *p = 5;
    printf("%d", *p);
    free(p);
    free(p);
    return 0;
}`,
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));
    *p = 5;
    printf("%d", *p);
    free(p);
    p = NULL;
    return 0;
}`,
    "freeing the same block twice corrupts the allocator's bookkeeping",
    "heap corruption / double free detected",
    ["Each block is freed exactly once", "Null the pointer after free to catch repeats"],
    "p = NULL;"
  ),
  ch(262, "Use After Free", "Freed memory is dereferenced afterwards.", 250, 8, "C", "Advanced",
    `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char *p = malloc(16);
    strcpy(p, "hello");
    free(p);
    printf("%s", p);
    return 0;
}`,
    `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char *p = malloc(16);
    strcpy(p, "hello");
    free(p);
    p = NULL;
    return 0;
}`,
    "the pointer dangles after free, and reading through it is undefined behavior",
    "garbage output or crash",
    ["Never dereference freed memory", "Set the pointer to NULL after free"],
    "p = NULL;"
  ),
  ch(263, "Dangling Return", "A function returns the address of a local variable.", 250, 8, "C", "Advanced",
    `#include <stdio.h>

int *make(void) {
    int x = 42;
    return &x;
}

int main() {
    int *p = make();
    printf("%d", *p);
    return 0;
}`,
    `#include <stdio.h>

int *make(void) {
    static int x = 42;
    return &x;
}

int main() {
    int *p = make();
    printf("%d", *p);
    return 0;
}`,
    "x dies when make() returns, so the returned pointer dangles",
    "garbage value or crash",
    ["Automatic locals are destroyed on return", "Use static storage (or heap) to keep the value alive"],
    "static int x = 42;"
  ),
  ch(264, "Unsigned Forever", "An unsigned counter makes the loop condition never fail.", 250, 8, "C", "Advanced",
    `#include <stdio.h>
#include <string.h>

int main() {
    char *s = "climb";
    for (size_t i = strlen(s); i >= 0; i--)
        printf("%c", s[i]);
    return 0;
}`,
    `#include <stdio.h>
#include <string.h>

int main() {
    char *s = "climb";
    for (int i = (int) strlen(s); i >= 0; i--)
        printf("%c", s[i]);
    return 0;
}`,
    "size_t is unsigned, so i >= 0 is always true and i underflows after 0",
    "infinite loop / out-of-bounds access",
    ["Unsigned values never go below zero", "Use a signed loop index"],
    "int i = (int) strlen(s);"
  ),
  ch(265, "Realloc Overwrite", "A failed realloc silently loses the original pointer.", 250, 8, "C", "Advanced",
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(4 * sizeof(int));
    p[0] = 1;
    p = realloc(p, 100000000 * sizeof(int));
    printf("%d", p[0]);
    return 0;
}`,
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(4 * sizeof(int));
    p[0] = 1;
    int *tmp = realloc(p, 100000000 * sizeof(int));
    if (tmp != NULL)
        p = tmp;
    printf("%d", p[0]);
    return 0;
}`,
    "realloc can fail and return NULL — overwriting p there leaks the original block",
    "memory leak or crash when realloc fails",
    ["Keep the old pointer until realloc succeeds", "Assign through a temporary and check it"],
    "int *tmp = realloc(p,"
  ),
  ch(266, "Overlapping Copy", "memcpy is used on regions that overlap.", 250, 8, "C", "Advanced",
    `#include <stdio.h>
#include <string.h>

int main() {
    char buf[32];
    strcpy(buf, "0123456789");
    memcpy(buf + 2, buf, 10);
    printf("%s", buf);
    return 0;
}`,
    `#include <stdio.h>
#include <string.h>

int main() {
    char buf[32];
    strcpy(buf, "0123456789");
    memmove(buf + 2, buf, 10);
    printf("%s", buf);
    return 0;
}`,
    "memcpy requires the regions not to overlap; here they do, which is undefined behavior",
    "corrupted or unexpected content",
    ["memcpy assumes non-overlapping regions", "Use memmove when the regions can overlap"],
    "memmove(buf + 2, buf, 10);"
  ),
  ch(267, "Const Stripped", "A cast is used to write through a const-qualified pointer.", 250, 8, "C", "Advanced",
    `#include <stdio.h>

void shout(const char *s) {
    char *p = (char *) s;
    p[0] = 'B';
    printf("%s", p);
}

int main() {
    char msg[] = "boo";
    shout(msg);
    return 0;
}`,
    `#include <stdio.h>

void shout(const char *s) {
    printf("%c%s", 'B', s + 1);
}

int main() {
    char msg[] = "boo";
    shout(msg);
    return 0;
}`,
    "casting away const to write is undefined behavior if the object was truly const",
    "undefined behavior (crash if the object is read-only)",
    ["const promises not to modify", "Build a new string instead of mutating through the cast"],
    "printf(\"%c%s\", 'B', s + 1);"
  ),
  ch(268, "Wrong Callback", "A function pointer is assigned with a mismatched signature.", 250, 8, "C", "Advanced",
    `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    int (*fn)(int) = add;
    printf("%d", fn(3));
    return 0;
}`,
    `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    int (*fn)(int, int) = add;
    printf("%d", fn(3, 4));
    return 0;
}`,
    "add takes two ints but the pointer type says one — the call is undefined",
    "compile warning and garbage result (undefined behavior)",
    ["The function pointer signature must match exactly", "Declare int (*fn)(int, int) and call fn(3, 4)"],
    "int (*fn)(int, int) = add;"
  ),
  ch(269, "Floating Equal", "Two floats are compared with ==", 250, 8, "C", "Advanced",
    `#include <stdio.h>

int main() {
    double a = 0.1 + 0.2;
    if (a == 0.3)
        printf("equal");
    else
        printf("not equal");
    return 0;
}`,
    `#include <stdio.h>
#include <math.h>

int main() {
    double a = 0.1 + 0.2;
    if (fabs(a - 0.3) < 1e-9)
        printf("equal");
    else
        printf("not equal");
    return 0;
}`,
    "0.1 + 0.2 is not exactly 0.3 in binary floating point",
    "Output: 'not equal'",
    ["Binary floats cannot represent 0.1 or 0.2 exactly", "Compare with an epsilon: fabs(a - b) < 1e-9"],
    "fabs(a - 0.3) < 1e-9"
  ),
  ch(270, "Racy Counter", "Two threads increment a shared counter without a lock.", 250, 8, "C", "Advanced",
    `#include <stdio.h>
#include <pthread.h>

int counter = 0;

void *bump(void *arg) {
    for (int i = 0; i < 100000; i++)
        counter++;
    return NULL;
}

int main() {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, bump, NULL);
    pthread_create(&t2, NULL, bump, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("%d", counter);
    return 0;
}`,
    `#include <stdio.h>
#include <pthread.h>

int counter = 0;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

void *bump(void *arg) {
    for (int i = 0; i < 100000; i++) {
        pthread_mutex_lock(&lock);
        counter++;
        pthread_mutex_unlock(&lock);
    }
    return NULL;
}

int main() {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, bump, NULL);
    pthread_create(&t2, NULL, bump, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("%d", counter);
    return 0;
}`,
    "counter++ is not atomic — the two threads clobber each other's increments",
    "Output: less than 200000 (lost updates)",
    ["Read-modify-write is a race between threads", "Protect the increment with a mutex"],
    "pthread_mutex_lock(&lock);"
  ),
];
const cNightmare: Challenge[] = [
  ch(271, "Aliasing Crime", "A float is read through an int pointer, violating strict aliasing.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>
#include <stdint.h>

int main() {
    float f = 1.0f;
    uint32_t bits = *(uint32_t *) &f;
    printf("%u", bits);
    return 0;
}`,
    `#include <stdio.h>
#include <string.h>

int main() {
    float f = 1.0f;
    uint32_t bits;
    memcpy(&bits, &f, sizeof(bits));
    printf("%u", bits);
    return 0;
}`,
    "reading a float through an unrelated pointer type violates the strict-aliasing rule",
    "undefined behavior (optimizer may reorder or produce garbage)",
    ["Only char* and the object's own type may alias", "Use memcpy to inspect raw bytes safely"],
    "memcpy(&bits, &f, sizeof(bits));"
  ),
  ch(272, "Format Injection", "User-controlled input becomes the format string.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    char *name = getenv("USER");
    printf(name);
    return 0;
}`,
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    char *name = getenv("USER");
    printf("%s", name);
    return 0;
}`,
    "if name contains %n or %x, printf reads and writes the stack",
    "memory disclosure or crash (format string attack)",
    ["Never pass data as the format argument", "Use printf(\"%s\", name) so it is treated as plain text"],
    "printf(\"%s\", name);"
  ),
  ch(273, "Uninitialized Read", "Heap memory is read before anything is written to it.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(4 * sizeof(int));
    printf("%d", p[0]);
    free(p);
    return 0;
}`,
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = calloc(4, sizeof(int));
    printf("%d", p[0]);
    free(p);
    return 0;
}`,
    "malloc leaves the memory uninitialized and its contents are indeterminate",
    "garbage output (may leak stale heap data)",
    ["malloc does not initialize memory", "Use calloc to zero-fill, or write before reading"],
    "calloc(4, sizeof(int))"
  ),
  ch(274, "Longjmp Leak", "longjmp jumps out and skips the cleanup.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>
#include <setjmp.h>
#include <stdlib.h>

jmp_buf env;

void risky(void) {
    int *p = malloc(sizeof(int));
    *p = 7;
    if (*p > 0)
        longjmp(env, 1);
    free(p);
}

int main() {
    if (setjmp(env) == 0)
        risky();
    else
        printf("recovered");
    return 0;
}`,
    `#include <stdio.h>
#include <setjmp.h>
#include <stdlib.h>

jmp_buf env;

void risky(void) {
    int *p = malloc(sizeof(int));
    *p = 7;
    if (*p > 0) {
        free(p);
        longjmp(env, 1);
    }
    free(p);
}

int main() {
    if (setjmp(env) == 0)
        risky();
    else
        printf("recovered");
    return 0;
}`,
    "longjmp unwinds to setjmp without running the free() below it",
    "memory leak every time the jump is taken",
    ["longjmp skips all code between the call and the target", "Free resources before jumping"],
    "free(p);\n        longjmp(env, 1);"
  ),
  ch(275, "Signal Unsafe", "A signal handler calls printf, which is not async-signal-safe.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>
#include <signal.h>
#include <unistd.h>

void on_sig(int sig) {
    printf("interrupted\\n");
}

int main() {
    signal(SIGINT, on_sig);
    while (1) { }
    return 0;
}`,
    `#include <stdio.h>
#include <signal.h>
#include <unistd.h>

volatile sig_atomic_t flag = 0;

void on_sig(int sig) {
    flag = 1;
}

int main() {
    signal(SIGINT, on_sig);
    while (!flag) { }
    printf("interrupted\\n");
    return 0;
}`,
    "printf is not async-signal-safe — calling it inside a handler is undefined behavior",
    "deadlock or corrupted stdio state",
    ["Handlers may only call async-signal-safe functions", "Set a volatile sig_atomic_t flag and act in main"],
    "volatile sig_atomic_t flag = 0;"
  ),
  ch(276, "Endian Flip", "Byte-level bit tricks assume a specific byte order.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>

unsigned long mix(unsigned long x) {
    unsigned char *bytes = (unsigned char *) &x;
    bytes[0] = bytes[0] + 1;
    return x;
}

int main() {
    printf("%lu", mix(1));
    return 0;
}`,
    `#include <stdio.h>

unsigned long mix(unsigned long x) {
    unsigned char *bytes = (unsigned char *) &x;
    size_t i = 0;
    while (i < sizeof(x) && bytes[i] == 255) {
        bytes[i] = 0;
        i++;
    }
    if (i < sizeof(x)) bytes[i]++;
    return x;
}`,
    "on little-endian machines byte 0 is the least significant, on big-endian it is the most",
    "different results on different hardware",
    ["Byte order varies between architectures", "Do arithmetic on the integer, not on its bytes"],
    "while (i < sizeof(x) && bytes[i] == 255)"
  ),
  ch(277, "NaN Trap", "A NaN never compares equal to anything — even itself.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>
#include <math.h>

int main() {
    double x = 0.0 / 0.0;
    if (x == x)
        printf("valid");
    else
        printf("invalid");
    return 0;
}`,
    `#include <stdio.h>
#include <math.h>

int main() {
    double x = 0.0 / 0.0;
    if (isnan(x))
        printf("invalid");
    else
        printf("valid");
    return 0;
}`,
    "x is NaN, and NaN != NaN by definition",
    "Output: 'invalid' — the equality self-check fails",
    ["NaN never equals anything, including itself", "Test with isnan(x) instead of x == x"],
    "isnan(x)"
  ),
  ch(278, "Shared Scratch", "A static buffer is reused, so the second call overwrites the first.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>

char *month(int m) {
    static char buf[16];
    switch (m) {
        case 1: snprintf(buf, sizeof buf, "jan"); break;
        case 2: snprintf(buf, sizeof buf, "feb"); break;
        default: snprintf(buf, sizeof buf, "???");
    }
    return buf;
}

int main() {
    char *a = month(1);
    char *b = month(2);
    printf("%s %s", a, b);
    return 0;
}`,
    `#include <stdio.h>

const char *month(int m) {
    switch (m) {
        case 1: return "jan";
        case 2: return "feb";
        default: return "???";
    }
}

int main() {
    const char *a = month(1);
    const char *b = month(2);
    printf("%s %s", a, b);
    return 0;
}`,
    "both a and b point at the same static buffer, and the second call overwrites it",
    "Output: 'feb feb' instead of 'jan feb'",
    ["Static buffers are shared between calls", "Return string literals or caller-owned buffers"],
    "const char *month(int m)"
  ),
  ch(279, "Shifted Off", "Shifting by the full width of the type is undefined behavior.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>

int main() {
    unsigned int x = 1;
    x <<= 32;
    printf("%u", x);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    unsigned int x = 1;
    x <<= 31;
    printf("%u", x);
    return 0;
}`,
    "shifting a 32-bit value by 32 is undefined behavior in C",
    "undefined result (often 0, but the compiler is free to do anything)",
    ["The shift amount must be less than the width", "A 32-bit type accepts shifts 0..31"],
    "x <<= 31;"
  ),
  ch(280, "Paranoid Peek", "The code looks suspicious, but it is actually correct.", 320, 10, "C", "Nightmare",
    `#include <stdio.h>

int main() {
    int a = 5;
    int *p = &a;
    *p = *p + 1;
    printf("%d", a);
    return 0;
}`,
    `#include <stdio.h>

int main() {
    int a = 5;
    int *p = &a;
    *p = *p + 1;
    printf("%d", a);
    return 0;
}`,
    "nothing is wrong — the pointer update is valid and intended",
    "Output: 6",
    ["Not every pointer use is a bug", "This is a legal mutation through a valid pointer"],
    "*p = *p + 1;"
  ),
];
/* ========= C++ TRACK ========= */
const cppBeginner: Challenge[] = [
  ch(281, "Missing Header", "std::string is used without including <string>.", 50, 3, "C++", "Beginner",
    `#include <iostream>

int main() {
    std::string name = "Climbug";
    std::cout << name;
    return 0;
}`,
    `#include <iostream>
#include <string>

int main() {
    std::string name = "Climbug";
    std::cout << name;
    return 0;
}`,
    "std::string is declared in <string>, which is never included",
    "compile error: 'string' is not a member of 'std'",
    ["Include the header that declares the type you use", "Add #include <string>"],
    "#include <string>"
  ),
  ch(282, "Naked cout", "cout is used without the std:: prefix or a using declaration.", 50, 3, "C++", "Beginner",
    `#include <iostream>

int main() {
    cout << "hello";
    return 0;
}`,
    `#include <iostream>

int main() {
    std::cout << "hello";
    return 0;
}`,
    "cout lives in the std namespace and is not visible here",
    "compile error: 'cout' was not declared in this scope",
    ["Standard names live in the std namespace", "Write std::cout (or add using namespace std)"],
    "std::cout << \"hello\";"
  ),
  ch(283, "Copied Out", "The function takes a copy, so the caller's variable never changes.", 50, 3, "C++", "Beginner",
    `#include <iostream>

void raise(int x) {
    x += 10;
}

int main() {
    int score = 5;
    raise(score);
    std::cout << score;
    return 0;
}`,
    `#include <iostream>

void raise(int &x) {
    x += 10;
}

int main() {
    int score = 5;
    raise(score);
    std::cout << score;
    return 0;
}`,
    "x is a copy, so the increment is lost when the function returns",
    "Output: 5 instead of 15",
    ["By-value parameters copy the argument", "Pass by reference (int &x) to modify the caller's variable"],
    "void raise(int &x)"
  ),
  ch(284, "One Past the End", "The loop visits an index past the last element.", 50, 3, "C++", "Beginner",
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    for (int i = 0; i <= v.size(); i++)
        std::cout << v[i] << " ";
    return 0;
}`,
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    for (int i = 0; i < v.size(); i++)
        std::cout << v[i] << " ";
    return 0;
}`,
    "valid indexes are 0..2, but the loop runs i=3 too",
    "reads past the buffer (undefined behavior)",
    ["Indexes run 0..size()-1", "Use i < v.size(), never i <= v.size()"],
    "for (int i = 0; i < v.size();"
  ),
  ch(285, "Lone Character", "A string is compared to a char literal.", 50, 3, "C++", "Beginner",
    `#include <iostream>
#include <string>

int main() {
    std::string grade = "A";
    if (grade == 'A')
        std::cout << "passed";
    else
        std::cout << "failed";
    return 0;
}`,
    `#include <iostream>
#include <string>

int main() {
    std::string grade = "A";
    if (grade == "A")
        std::cout << "passed";
    else
        std::cout << "failed";
    return 0;
}`,
    "'A' is a single char but grade is a string — the types do not compare",
    "compile error: no match for operator==",
    ["Single quotes hold one char", "Compare a string to a string: use \"A\""],
    "grade == \"A\""
  ),
  ch(286, "Forgotten Return", "A non-void function returns without a value.", 50, 3, "C++", "Beginner",
    `#include <iostream>

int max_of(int a, int b) {
    if (a > b)
        return a;
}

int main() {
    std::cout << max_of(3, 7);
    return 0;
}`,
    `#include <iostream>

int max_of(int a, int b) {
    if (a > b)
        return a;
    return b;
}

int main() {
    std::cout << max_of(3, 7);
    return 0;
}`,
    "when a <= b the function falls off the end with no return",
    "garbage return value (undefined behavior)",
    ["Every path in a non-void function must return", "Add return b; for the else path"],
    "return b;"
  ),
  ch(287, "Truncated Average", "Integer division drops the fraction.", 50, 3, "C++", "Beginner",
    `#include <iostream>

int main() {
    int sum = 9, count = 2;
    double avg = sum / count;
    std::cout << avg;
    return 0;
}`,
    `#include <iostream>

int main() {
    int sum = 9, count = 2;
    double avg = static_cast<double>(sum) / count;
    std::cout << avg;
    return 0;
}`,
    "int / int truncates before the result reaches the double",
    "Output: 4 instead of 4.5",
    ["Cast one operand to double first", "static_cast<double>(sum) forces floating division"],
    "static_cast<double>(sum) / count"
  ),
  ch(288, "Assign in While", "The loop condition assigns instead of comparing.", 50, 3, "C++", "Beginner",
    `#include <iostream>

int main() {
    int lives = 3;
    while (lives = 0) {
        std::cout << "playing";
        lives--;
    }
    return 0;
}`,
    `#include <iostream>

int main() {
    int lives = 3;
    while (lives == 0) {
        std::cout << "playing";
        lives--;
    }
    return 0;
}`,
    "lives = 0 assigns zero, which is falsy, so the loop never runs",
    "the loop body is skipped entirely",
    ["= assigns, == compares", "Use lives == 0 in the condition"],
    "while (lives == 0)"
  ),
  ch(289, "printf Handoff", "A std::string is passed to printf with %s.", 50, 3, "C++", "Beginner",
    `#include <cstdio>
#include <string>

int main() {
    std::string name = "Rusty";
    printf("%s", name);
    return 0;
}`,
    `#include <cstdio>
#include <string>

int main() {
    std::string name = "Rusty";
    printf("%s", name.c_str());
    return 0;
}`,
    "printf expects a C string (const char*), not a std::string object",
    "garbage output or crash",
    ["%s needs a pointer to a NUL-terminated array", "Use name.c_str() for printf"],
    "printf(\"%s\", name.c_str())"
  ),
  ch(290, "Uninitialized Member", "A struct member is never initialized.", 50, 3, "C++", "Beginner",
    `#include <iostream>

struct Player {
    int score;
    int level;
};

int main() {
    Player p;
    p.score = 10;
    std::cout << p.level;
    return 0;
}`,
    `#include <iostream>

struct Player {
    int score = 0;
    int level = 1;
};

int main() {
    Player p;
    p.score = 10;
    std::cout << p.level;
    return 0;
}`,
    "p.level is never set, and reading an uninitialized int is undefined behavior",
    "garbage value for level",
    ["Members of a default-initialized struct are uninitialized", "Give members defaults: int level = 1;"],
    "int level = 1;"
  ),
];
const cppIntermediate: Challenge[] = [
  ch(291, "Erase While Iterating", "Elements are erased from a vector while looping over it.", 140, 5, "C++", "Intermediate",
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 0, 2, 0, 3};
    for (auto it = v.begin(); it != v.end(); ++it) {
        if (*it == 0)
            v.erase(it);
    }
    for (int x : v) std::cout << x << " ";
    return 0;
}`,
    `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {1, 0, 2, 0, 3};
    v.erase(std::remove(v.begin(), v.end(), 0), v.end());
    for (int x : v) std::cout << x << " ";
    return 0;
}`,
    "erase invalidates the iterator, and skipping forward can jump over elements",
    "undefined behavior or elements left behind",
    ["Never modify a container while iterating it", "Use the erase-remove idiom"],
    "std::remove(v.begin(), v.end(), 0)"
  ),
  ch(292, "Reallocation Dart", "A pointer into a vector dangles after push_back.", 140, 5, "C++", "Intermediate",
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    int *p = &v[0];
    v.push_back(4);
    std::cout << *p;
    return 0;
}`,
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    v.reserve(100);
    int *p = &v[0];
    v.push_back(4);
    std::cout << *p;
    return 0;
}`,
    "push_back can reallocate the buffer, invalidating all existing pointers",
    "dangling pointer / undefined behavior",
    ["Reallocation moves the elements to a new buffer", "Reserve enough capacity up front"],
    "v.reserve(100);"
  ),
  ch(293, "Dangling Reference", "A function returns a reference to a local variable.", 140, 5, "C++", "Intermediate",
    `#include <iostream>

int &get() {
    int x = 5;
    return x;
}

int main() {
    int &r = get();
    std::cout << r;
    return 0;
}`,
    `#include <iostream>

int get() {
    int x = 5;
    return x;
}

int main() {
    int r = get();
    std::cout << r;
    return 0;
}`,
    "x dies when get() returns, so the reference dangles",
    "garbage value or crash",
    ["Automatic locals are destroyed on return", "Return by value instead of by reference"],
    "int get()"
  ),
  ch(294, "Non-Virtual Dtor", "Deleting through a base pointer skips the derived destructor.", 140, 5, "C++", "Intermediate",
    `#include <iostream>

class Base {
public:
    ~Base() {}
};

class Derived : public Base {
public:
    ~Derived() { std::cout << "cleanup"; }
};

int main() {
    Base *p = new Derived();
    delete p;
    return 0;
}`,
    `#include <iostream>

class Base {
public:
    virtual ~Base() {}
};

class Derived : public Base {
public:
    ~Derived() { std::cout << "cleanup"; }
};

int main() {
    Base *p = new Derived();
    delete p;
    return 0;
}`,
    "without a virtual destructor, deleting via Base* never calls ~Derived",
    "derived cleanup is skipped (leak / undefined behavior)",
    ["Base destructors must be virtual for polymorphic deletion", "Add virtual to ~Base"],
    "virtual ~Base()"
  ),
  ch(295, "Unchecked Stoi", "stoi throws when the input is not a number.", 140, 5, "C++", "Intermediate",
    `#include <iostream>
#include <string>

int main() {
    std::string input = "abc";
    int n = std::stoi(input);
    std::cout << n;
    return 0;
}`,
    `#include <iostream>
#include <string>

int main() {
    std::string input = "abc";
    try {
        int n = std::stoi(input);
        std::cout << n;
    } catch (const std::invalid_argument &) {
        std::cout << "not a number";
    }
    return 0;
}`,
    "stoi raises std::invalid_argument when the string has no digits",
    "unhandled exception: std::invalid_argument",
    ["Conversions from user input can fail", "Wrap stoi in a try/catch"],
    "catch (const std::invalid_argument &)"
  ),
  ch(296, "Shallow Copy", "The default copy copies the pointer, so both objects free the same memory.", 140, 5, "C++", "Intermediate",
    `#include <iostream>

class Buffer {
public:
    Buffer() { data = new int[10]; }
    ~Buffer() { delete[] data; }
    int *data;
};

int main() {
    Buffer a;
    Buffer b = a;
    return 0;
}`,
    `#include <iostream>

class Buffer {
public:
    Buffer() : data(new int[10]) {}
    Buffer(const Buffer &other) {
        data = new int[10];
        for (int i = 0; i < 10; i++) data[i] = other.data[i];
    }
    ~Buffer() { delete[] data; }
    int *data;
};

int main() {
    Buffer a;
    Buffer b = a;
    return 0;
}`,
    "the compiler-generated copy shares the pointer, so both destructors free it",
    "double free / heap corruption",
    ["The default copy constructor copies pointers", "Provide a real copy constructor (rule of three)"],
    "Buffer(const Buffer &other)"
  ),
  ch(297, "auto Strips Ref", "auto silently copies instead of keeping a reference.", 140, 5, "C++", "Intermediate",
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    auto x = v[0];
    v[0] = 99;
    std::cout << x;
    return 0;
}`,
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    auto &x = v[0];
    v[0] = 99;
    std::cout << x;
    return 0;
}`,
    "auto deduces int (a copy), so x never sees the later change",
    "Output: 1 instead of 99",
    ["auto drops reference qualifiers", "Use auto &x to bind to the element itself"],
    "auto &x = v[0];"
  ),
  ch(298, "Flipped Sort", "The comparator returns true in the wrong order.", 140, 5, "C++", "Intermediate",
    `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {3, 1, 2};
    std::sort(v.begin(), v.end(), [](int a, int b) { return a >= b; });
    for (int x : v) std::cout << x << " ";
    return 0;
}`,
    `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {3, 1, 2};
    std::sort(v.begin(), v.end(), [](int a, int b) { return a < b; });
    for (int x : v) std::cout << x << " ";
    return 0;
}`,
    "a >= b violates strict weak ordering (equal elements compare both ways)",
    "sort may crash, loop forever, or produce a wrong order",
    ["Comparators must be a strict weak ordering", "Use a < b for ascending order"],
    "return a < b;"
  ),
  ch(299, "Muted Capture", "A lambda captures by value and then tries to modify the captured variable.", 140, 5, "C++", "Intermediate",
    `#include <iostream>

int main() {
    int count = 0;
    auto bump = [count]() { count++; };
    bump();
    bump();
    std::cout << count;
    return 0;
}`,
    `#include <iostream>

int main() {
    int count = 0;
    auto bump = [count]() mutable { count++; };
    bump();
    bump();
    std::cout << count;
    return 0;
}`,
    "by-value captures are const inside a non-mutable lambda",
    "compile error: cannot assign to a variable captured by copy",
    ["Captured copies are const by default", "Mark the lambda mutable to modify its copy"],
    "auto bump = [count]() mutable"
  ),
  ch(300, "C-Style Spill", "A C-style buffer overflow sneaks into C++.", 140, 5, "C++", "Intermediate",
    `#include <iostream>
#include <cstring>

int main() {
    char buf[4];
    std::strcpy(buf, "Rusty");
    std::cout << buf;
    return 0;
}`,
    `#include <iostream>
#include <string>

int main() {
    std::string buf = "Rusty";
    std::cout << buf;
    return 0;
}`,
    "strcpy writes 6 bytes into a 4-byte buffer",
    "stack corruption / segmentation fault",
    ["Avoid C string functions in C++", "Use std::string and let it manage the memory"],
    "std::string buf = \"Rusty\";"
  ),
];
const cppAdvanced: Challenge[] = [
  ch(301, "Use After Move", "An object is used after its contents were moved away.", 250, 8, "C++", "Advanced",
    `#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string a = "hello";
    std::string b = std::move(a);
    std::cout << a.size();
    return 0;
}`,
    `#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string a = "hello";
    std::string b = std::move(a);
    std::cout << b.size();
    return 0;
}`,
    "after the move, a is in a valid-but-unspecified state, and reading it is fragile",
    "Output: 0 (or another unspecified value) instead of 5",
    ["A moved-from object must be treated as empty", "Use the moved-to object b, not the source a"],
    "std::cout << b.size();"
  ),
  ch(302, "noexcept Growth", "A throwing move breaks vector reallocation.", 250, 8, "C++", "Advanced",
    `#include <iostream>
#include <vector>

struct Widget {
    Widget() {}
    Widget(const Widget &other) { throw 1; }
    Widget(Widget &&other) noexcept { }
};

int main() {
    std::vector<Widget> v;
    v.emplace_back();
    v.emplace_back();
    return 0;
}`,
    `#include <iostream>
#include <vector>

struct Widget {
    Widget() {}
    Widget(const Widget &other) { throw 1; }
    Widget(Widget &&other) noexcept { }
};

int main() {
    std::vector<Widget> v;
    v.reserve(4);
    v.emplace_back();
    v.emplace_back();
    return 0;
}`,
    "when the buffer grows, vector prefers the move, but if the move is noexcept and the copy throws, std::terminate fires",
    "std::terminate called",
    ["noexcept moves let vector reallocate safely", "Reserve capacity so growth never happens mid-operation"],
    "v.reserve(4);"
  ),
  ch(303, "Static Init Order", "One translation unit reads a static from another before it is built.", 250, 8, "C++", "Advanced",
    `#include <iostream>
#include <string>

std::string greeting();

int main() {
    std::cout << greeting();
    return 0;
}

// in another file:
// std::string msg = "hello";
// std::string greeting() { return msg; }`,
    `#include <iostream>
#include <string>

std::string &greeting() {
    static std::string msg = "hello";
    return msg;
}

int main() {
    std::cout << greeting();
    return 0;
}`,
    "global statics across files initialize in an unspecified order",
    "reading an empty string (or crash) depending on link order",
    ["Cross-file static initialization order is unspecified", "Use a function-local static (Meyers singleton)"],
    "static std::string msg = \"hello\";"
  ),
  ch(304, "Silent Override Miss", "A base virtual is not overridden because the signature does not match.", 250, 8, "C++", "Advanced",
    `#include <iostream>

class Shape {
public:
    virtual double area() const { return 0; }
};

class Square : public Shape {
public:
    double area() { return 4.0; }
};

int main() {
    Shape *s = new Square();
    std::cout << s->area();
    return 0;
}`,
    `#include <iostream>

class Shape {
public:
    virtual double area() const { return 0; }
};

class Square : public Shape {
public:
    double area() const override { return 4.0; }
};

int main() {
    Shape *s = new Square();
    std::cout << s->area();
    return 0;
}`,
    "Square::area is missing const, so it does not override and hides the base",
    "Output: 0 (the base version is called)",
    ["The derived signature must match exactly", "Mark overrides with override to catch mismatches"],
    "double area() const override"
  ),
  ch(305, "Move-Only Emplace", "A unique_ptr is copied instead of moved into a container.", 250, 8, "C++", "Advanced",
    `#include <iostream>
#include <memory>
#include <vector>

int main() {
    auto w = std::make_unique<int>(7);
    std::vector<std::unique_ptr<int>> v;
    v.push_back(w);
    std::cout << *w;
    return 0;
}`,
    `#include <iostream>
#include <memory>
#include <vector>

int main() {
    auto w = std::make_unique<int>(7);
    std::vector<std::unique_ptr<int>> v;
    v.push_back(std::move(w));
    return 0;
}`,
    "unique_ptr is move-only — push_back(w) tries to copy it",
    "compile error: use of deleted function",
    ["unique_ptr cannot be copied", "Move it: v.push_back(std::move(w))"],
    "v.push_back(std::move(w));"
  ),
  ch(306, "Leak on Throw", "Raw memory is allocated, then an exception escapes.", 250, 8, "C++", "Advanced",
    `#include <iostream>
#include <stdexcept>

void run() {
    int *buf = new int[100];
    if (buf[0] < 0)
        throw std::runtime_error("negative");
    delete[] buf;
}

int main() {
    try {
        run();
    } catch (const std::exception &) {
        std::cout << "caught";
    }
    return 0;
}`,
    `#include <iostream>
#include <memory>
#include <stdexcept>

void run() {
    std::unique_ptr<int[]> buf(new int[100]);
    if (buf[0] < 0)
        throw std::runtime_error("negative");
}

int main() {
    try {
        run();
    } catch (const std::exception &) {
        std::cout << "caught";
    }
    return 0;
}`,
    "if the throw fires, delete[] is skipped and the buffer leaks",
    "memory leak on every exception path",
    ["Raw new/delete is not exception-safe", "Wrap the buffer in std::unique_ptr for automatic cleanup"],
    "std::unique_ptr<int[]> buf(new int[100]);"
  ),
  ch(307, "Deduction Mismatch", "A template parameter deduced as value cannot bind a reference.", 250, 8, "C++", "Advanced",
    `#include <iostream>

template <typename T>
void pass(T x) {
    x += 1;
}

int main() {
    int score = 5;
    pass(score);
    std::cout << score;
    return 0;
}`,
    `#include <iostream>

template <typename T>
void pass(T &x) {
    x += 1;
}

int main() {
    int score = 5;
    pass(score);
    std::cout << score;
    return 0;
}`,
    "T is deduced as int, so the parameter is a copy and the change is lost",
    "Output: 5 instead of 6",
    ["Deduced T by value copies the argument", "Use T &x to take the parameter by reference"],
    "void pass(T &x)"
  ),
  ch(308, "Dependent Name", "A dependent type needs typename, otherwise parsing fails.", 250, 8, "C++", "Advanced",
    `#include <iostream>
#include <vector>

template <typename T>
T second(const std::vector<T> &v) {
    std::vector<T>::const_iterator it = v.begin();
    ++it;
    return *it;
}

int main() {
    std::cout << second(std::vector<int>{10, 20, 30});
    return 0;
}`,
    `#include <iostream>
#include <vector>

template <typename T>
T second(const std::vector<T> &v) {
    typename std::vector<T>::const_iterator it = v.begin();
    ++it;
    return *it;
}

int main() {
    std::cout << second(std::vector<int>{10, 20, 30});
    return 0;
}`,
    "const_iterator is a dependent type and must be marked with typename",
    "compile error: missing 'typename' before dependent type",
    ["Dependent types need the typename keyword", "Write typename std::vector<T>::const_iterator"],
    "typename std::vector<T>::const_iterator"
  ),
  ch(309, "Racy shared_ptr", "A shared_ptr is read and written from two threads at once.", 250, 8, "C++", "Advanced",
    `#include <iostream>
#include <memory>
#include <thread>

int main() {
    std::shared_ptr<int> p = std::make_shared<int>(1);
    std::thread t1([&p] { p = std::make_shared<int>(2); });
    std::thread t2([&p] { std::cout << *p; });
    t1.join();
    t2.join();
    return 0;
}`,
    `#include <iostream>
#include <memory>
#include <thread>
#include <mutex>

int main() {
    std::shared_ptr<int> p = std::make_shared<int>(1);
    std::mutex m;
    std::thread t1([&] { std::lock_guard<std::mutex> g(m); p = std::make_shared<int>(2); });
    std::thread t2([&] { std::lock_guard<std::mutex> g(m); std::cout << *p; });
    t1.join();
    t2.join();
    return 0;
}`,
    "shared_ptr itself is not thread-safe for concurrent writes",
    "data race / crash or corrupted pointer",
    ["The refcount is atomic, but the pointer is not", "Guard shared_ptr access with a mutex"],
    "std::lock_guard<std::mutex> g(m);"
  ),
  ch(310, "Temp Reference Member", "A class stores a reference to a temporary that dies immediately.", 250, 8, "C++", "Advanced",
    `#include <iostream>
#include <string>

class Label {
    const std::string &text;
public:
    Label(const std::string &t) : text(t) {}
    void print() const { std::cout << text; }
};

int main() {
    Label l("temp");
    l.print();
    return 0;
}`,
    `#include <iostream>
#include <string>
#include <utility>

class Label {
    std::string text;
public:
    Label(std::string t) : text(std::move(t)) {}
    void print() const { std::cout << text; }
};

int main() {
    Label l("temp");
    l.print();
    return 0;
}`,
    "the temporary string dies after the constructor, leaving the reference dangling",
    "garbage output or crash",
    ["References to constructor arguments can dangle", "Store by value and move the argument in"],
    "Label(std::string t) : text(std::move(t))"
  ),
];
const cppNightmare: Challenge[] = [
  ch(311, "Pointer Truncation", "A pointer is stuffed into an int, losing half the address.", 320, 10, "C++", "Nightmare",
    `#include <iostream>

int main() {
    int value = 42;
    int *p = &value;
    int addr = reinterpret_cast<int>(p);
    std::cout << addr;
    return 0;
}`,
    `#include <iostream>
#include <cstdint>

int main() {
    int value = 42;
    int *p = &value;
    std::uintptr_t addr = reinterpret_cast<std::uintptr_t>(p);
    std::cout << addr;
    return 0;
}`,
    "int is 32-bit but pointers are 64-bit, so the cast truncates",
    "truncated address (lost bits)",
    ["Pointers are as wide as the platform (often 64 bits)", "Use uintptr_t to hold an address as an integer"],
    "reinterpret_cast<std::uintptr_t>(p)"
  ),
  ch(312, "Throwing Destructor", "An exception escapes from a destructor.", 320, 10, "C++", "Nightmare",
    `#include <iostream>
#include <stdexcept>

class Resource {
public:
    ~Resource() {
        throw std::runtime_error("close failed");
    }
};

int main() {
    try {
        Resource r;
    } catch (const std::exception &) {
        std::cout << "caught";
    }
    return 0;
}`,
    `#include <iostream>
#include <stdexcept>

class Resource {
public:
    ~Resource() noexcept {
        try {
            // attempt close, swallow failures
        } catch (...) {
            std::cout << "logged";
        }
    }
};

int main() {
    try {
        Resource r;
    } catch (const std::exception &) {
        std::cout << "caught";
    }
    return 0;
}`,
    "a destructor that throws during stack unwinding calls std::terminate",
    "std::terminate called (program aborts)",
    ["Destructors are noexcept by default", "Never let an exception escape — catch and log instead"],
    "~Resource() noexcept"
  ),
  ch(313, "const_cast Crash", "The const is cast away from memory that is genuinely read-only.", 320, 10, "C++", "Nightmare",
    `#include <iostream>

int main() {
    const char *s = "fixed";
    char *p = const_cast<char *>(s);
    p[0] = 'F';
    std::cout << p;
    return 0;
}`,
    `#include <iostream>

int main() {
    char buf[] = "fixed";
    char *p = buf;
    p[0] = 'F';
    std::cout << p;
    return 0;
}`,
    "const_cast is fine for removing const, but writing to truly const memory is undefined",
    "Segmentation fault (string literal in read-only memory)",
    ["const_cast cannot make read-only memory writable", "Copy the literal into a mutable array first"],
    "char buf[] = \"fixed\";"
  ),
  ch(314, "Diamond Ambiguity", "Two bases carry the same member, and the derived class is ambiguous.", 320, 10, "C++", "Nightmare",
    `#include <iostream>

class A {
public:
    int id = 1;
};

class B : public A { };
class C : public A { };

class D : public B, public C {
public:
    int get() { return id; }
};

int main() {
    D d;
    std::cout << d.get();
    return 0;
}`,
    `#include <iostream>

class A {
public:
    int id = 1;
};

class B : public virtual A { };
class C : public virtual A { };

class D : public B, public C {
public:
    int get() { return id; }
};

int main() {
    D d;
    std::cout << d.get();
    return 0;
}`,
    "D inherits two copies of A, so id is ambiguous",
    "compile error: request for member 'id' is ambiguous",
    ["Non-virtual inheritance duplicates the base", "Use virtual inheritance to share one A subobject"],
    "class B : public virtual A"
  ),
  ch(315, "Captured Temp", "A lambda captures a temporary by reference and outlives it.", 320, 10, "C++", "Nightmare",
    `#include <iostream>
#include <functional>
#include <string>

std::function<void()> make_printer() {
    std::string msg = "hello";
    return [&msg]() { std::cout << msg; };
}

int main() {
    auto f = make_printer();
    f();
    return 0;
}`,
    `#include <iostream>
#include <functional>
#include <string>

std::function<void()> make_printer() {
    std::string msg = "hello";
    return [msg]() { std::cout << msg; };
}

int main() {
    auto f = make_printer();
    f();
    return 0;
}`,
    "msg is destroyed when make_printer returns, but the lambda still refers to it",
    "dangling reference / undefined behavior",
    ["A captured reference dangles once the local dies", "Capture by value ([msg]) to own the data"],
    "return [msg]()"
  ),
  ch(316, "Signed Overflow", "Signed integer overflow is undefined behavior.", 320, 10, "C++", "Nightmare",
    `#include <iostream>
#include <limits>

int main() {
    int max = std::numeric_limits<int>::max();
    max += 1;
    std::cout << max;
    return 0;
}`,
    `#include <iostream>
#include <limits>

int main() {
    int max = std::numeric_limits<int>::max();
    long long result = static_cast<long long>(max) + 1;
    std::cout << result;
    return 0;
}`,
    "adding 1 to INT_MAX overflows a signed int — undefined behavior",
    "undefined (optimizer may assume it never happens)",
    ["Signed overflow is UB, unlike unsigned wraparound", "Widen to long long before the addition"],
    "static_cast<long long>(max) + 1"
  ),
  ch(317, "Placement New", "Placement-new storage is never destroyed.", 320, 10, "C++", "Nightmare",
    `#include <iostream>
#include <new>

struct Token {
    int n;
    Token(int x) : n(x) {}
    ~Token() { std::cout << "destroyed"; }
};

int main() {
    alignas(Token) char raw[sizeof(Token)];
    Token *t = new (raw) Token(7);
    std::cout << t->n;
    return 0;
}`,
    `#include <iostream>
#include <new>

struct Token {
    int n;
    Token(int x) : n(x) {}
    ~Token() { std::cout << "destroyed"; }
};

int main() {
    alignas(Token) char raw[sizeof(Token)];
    Token *t = new (raw) Token(7);
    std::cout << t->n;
    t->~Token();
    return 0;
}`,
    "placement new must be matched by an explicit destructor call",
    "destructor never runs (leaked resources)",
    ["Placement new does not pair with delete", "Call t->~Token() explicitly before reusing the storage"],
    "t->~Token();"
  ),
  ch(318, "Unfenced Init", "A lazy singleton is built outside any synchronization.", 320, 10, "C++", "Nightmare",
    `#include <iostream>
#include <thread>
#include <vector>

struct Heavy {
    Heavy() { std::cout << "init "; }
};

Heavy *g = nullptr;

Heavy *get_heavy() {
    if (g == nullptr)
        g = new Heavy();
    return g;
}

int main() {
    std::vector<std::thread> ts;
    for (int i = 0; i < 8; i++)
        ts.emplace_back([] { get_heavy(); });
    for (auto &t : ts) t.join();
    return 0;
}`,
    `#include <iostream>
#include <thread>
#include <vector>

struct Heavy {
    Heavy() { std::cout << "init "; }
};

Heavy &get_heavy() {
    static Heavy h;
    return h;
}

int main() {
    std::vector<std::thread> ts;
    for (int i = 0; i < 8; i++)
        ts.emplace_back([] { get_heavy(); });
    for (auto &t : ts) t.join();
    return 0;
}`,
    "the pointer is checked and assigned without a lock or barrier — a data race",
    "multiple 'init' prints or a torn pointer (data race)",
    ["Unsynchronized lazy initialization races", "Use a function-local static — C++11 guarantees exactly one init"],
    "static Heavy h;"
  ),
  ch(319, "Binding the Temp", "An rvalue reference extends nothing when it is a member.", 320, 10, "C++", "Nightmare",
    `#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string &&r = std::string("oops");
    std::string copy = r;
    r = "changed";
    std::cout << copy << " " << r;
    return 0;
}`,
    `#include <iostream>
#include <string>

int main() {
    std::string copy = "oops";
    std::cout << copy;
    return 0;
}`,
    "r is an lvalue expression naming the temporary — writing to it works, but reading copy shows the original is unchanged",
    "confusing output because the temporary and the copy diverge",
    ["rvalue references are lvalue expressions once named", "Do not build logic around mutated temporaries"],
    "std::string copy = \"oops\";"
  ),
  ch(320, "Innocent Loop", "Everything here is correct — the loop is fine as written.", 320, 10, "C++", "Nightmare",
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 4, 3, 2, 1};
    for (auto &x : v)
        x *= 2;
    for (int x : v) std::cout << x << " ";
    return 0;
}`,
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 4, 3, 2, 1};
    for (auto &x : v)
        x *= 2;
    for (int x : v) std::cout << x << " ";
    return 0;
}`,
    "nothing is wrong — doubling in place via auto& is exactly right",
    "Output: 10 8 6 4 2",
    ["auto& binds to each element, not a copy", "This is idiomatic, correct C++"],
    "for (auto &x : v)"
  ),
];
/* ========= JAVA TRACK ========= */
const javaBeginner: Challenge[] = [
  ch(321, "Missing Semicolon", "The compiler stops at a statement without a semicolon.", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String[] args) {
        int score = 100
        System.out.println(score);
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        int score = 100;
        System.out.println(score);
    }
}`,
    "the declaration is missing its terminating semicolon",
    "compile error: ';' expected",
    ["Every statement ends with a semicolon", "Add ; after the declaration"],
    "int score = 100;"
  ),
  ch(322, "Wrong Entry Point", "The main method signature does not match what the JVM looks for.", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String args) {
        System.out.println("hello");
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        System.out.println("hello");
    }
}`,
    "main must take String[] — a single String is not the entry point",
    "error: Main method not found in class Main",
    ["The JVM calls main(String[] args)", "Use String[] args (or String... args)"],
    "main(String[] args)"
  ),
  ch(323, "Reference Check", "Two strings are compared with == instead of .equals().", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String[] args) {
        String a = new String("bug");
        String b = new String("bug");
        if (a == b)
            System.out.println("same");
        else
            System.out.println("different");
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        String a = new String("bug");
        String b = new String("bug");
        if (a.equals(b))
            System.out.println("same");
        else
            System.out.println("different");
    }
}`,
    "== compares references, and the two objects are distinct",
    "Output: 'different' even though the values match",
    ["== checks identity, not value", "Use a.equals(b) to compare string contents"],
    "a.equals(b)"
  ),
  ch(324, "Past the Edge", "An index past the end of the array is read.", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        System.out.println(nums[3]);
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        System.out.println(nums[2]);
    }
}`,
    "valid indexes are 0..2, but the code reads index 3",
    "ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3",
    ["Valid indexes run 0..length-1", "Use index 2 for a 3-element array"],
    "nums[2]"
  ),
  ch(325, "Integer Division", "int / int drops the fractional part.", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String[] args) {
        int sum = 9, count = 2;
        double avg = sum / count;
        System.out.println(avg);
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        int sum = 9, count = 2;
        double avg = (double) sum / count;
        System.out.println(avg);
    }
}`,
    "both operands are int, so Java performs integer division first",
    "Output: 4.0 instead of 4.5",
    ["Cast one operand to double first", "(double) sum forces floating-point division"],
    "avg = (double) sum / count;"
  ),
  ch(326, "Null Method Call", "A method is invoked on a null reference.", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String[] args) {
        String name = null;
        System.out.println(name.length());
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        String name = null;
        System.out.println(name == null ? 0 : name.length());
    }
}`,
    "name is null, so calling length() on it crashes",
    "NullPointerException",
    ["Calling a method on null throws", "Check with a null guard before the call"],
    "name == null ? 0 : name.length()"
  ),
  ch(327, "Void Returns Value", "A void method tries to return a value.", 50, 3, "Java", "Beginner",
    `public class Main {
    static void greet() {
        return "hello";
    }

    public static void main(String[] args) {
        System.out.println(greet());
    }
}`,
    `public class Main {
    static String greet() {
        return "hello";
    }

    public static void main(String[] args) {
        System.out.println(greet());
    }
}`,
    "greet is declared void, so it cannot return a value",
    "compile error: incompatible types",
    ["A void method returns nothing", "Declare the return type String to return a value"],
    "static String greet()"
  ),
  ch(328, "Missing Import", "A collection type is used without importing it.", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<>();
        names.add("rishi");
        System.out.println(names);
    }
}`,
    `import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<>();
        names.add("rishi");
        System.out.println(names);
    }
}`,
    "ArrayList lives in java.util, which is not imported here",
    "compile error: cannot find symbol ArrayList",
    ["java.util classes need an import", "Add import java.util.ArrayList;"],
    "import java.util.ArrayList;"
  ),
  ch(329, "Char vs String", "A string is compared to a character literal.", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String[] args) {
        String grade = "A";
        if (grade.equals('A'))
            System.out.println("passed");
        else
            System.out.println("failed");
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        String grade = "A";
        if (grade.equals("A"))
            System.out.println("passed");
        else
            System.out.println("failed");
    }
}`,
    "equals takes an Object, and a char 'A' is never equal to a String \"A\"",
    "Output: 'failed'",
    ["Single quotes hold a char", "Compare a String to a String: use \"A\""],
    "grade.equals(\"A\")"
  ),
  ch(330, "Runaway Loop", "The loop condition never changes, so the loop never ends.", 50, 3, "Java", "Beginner",
    `public class Main {
    public static void main(String[] args) {
        int n = 3;
        while (n > 0) {
            System.out.println(n);
        }
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        int n = 3;
        while (n > 0) {
            System.out.println(n);
            n--;
        }
    }
}`,
    "n is never decremented, so the condition never fails",
    "program prints forever",
    ["The loop body must change the condition variable", "Add n-- inside the loop"],
    "n--;"
  ),
];
const javaIntermediate: Challenge[] = [
  ch(331, "Remove While Iterating", "Elements are removed from a list inside a for-each loop.", 140, 5, "Java", "Intermediate",
    `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> users = new ArrayList<>();
        users.add("alice");
        users.add("banned_bob");
        for (String u : users) {
            if (u.startsWith("banned"))
                users.remove(u);
        }
        System.out.println(users);
    }
}`,
    `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> users = new ArrayList<>();
        users.add("alice");
        users.add("banned_bob");
        users.removeIf(u -> u.startsWith("banned"));
        System.out.println(users);
    }
}`,
    "for-each holds a cursor, and removing from the list invalidates it",
    "ConcurrentModificationException",
    ["Never mutate a list you are iterating", "Use removeIf (or an Iterator's remove())"],
    "users.removeIf(u -> u.startsWith(\"banned\"))"
  ),
  ch(332, "Autobox Cache", "Two boxed Integers are compared with == beyond the cache range.", 140, 5, "Java", "Intermediate",
    `public class Main {
    public static void main(String[] args) {
        Integer a = 200;
        Integer b = 200;
        if (a == b)
            System.out.println("equal");
        else
            System.out.println("not equal");
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        Integer a = 200;
        Integer b = 200;
        if (a.equals(b))
            System.out.println("equal");
        else
            System.out.println("not equal");
    }
}`,
    "Integer caches -128..127; 200 creates two distinct objects",
    "Output: 'not equal'",
    ["== on wrappers compares references", "The cache only covers -128..127 — use equals()"],
    "a.equals(b)"
  ),
  ch(333, "Leaked Handle", "A file reader is closed manually and can be skipped.", 140, 5, "Java", "Intermediate",
    `import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        FileReader r = new FileReader("data.txt");
        int c = r.read();
        System.out.println(c);
        r.close();
    }
}`,
    `import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        try (FileReader r = new FileReader("data.txt")) {
            int c = r.read();
            System.out.println(c);
        }
    }
}`,
    "if read() throws, close() is never reached and the handle leaks",
    "leaked file handle on exception paths",
    ["Manual close is not exception-safe", "Use try-with-resources to auto-close"],
    "try (FileReader r = new FileReader(\"data.txt\"))"
  ),
  ch(334, "Slow Concat", "String concatenation inside a loop is quadratic.", 140, 5, "Java", "Intermediate",
    `public class Main {
    public static void main(String[] args) {
        String[] parts = {"a", "b", "c", "d"};
        String out = "";
        for (String s : parts) {
            out += s;
        }
        System.out.println(out);
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        String[] parts = {"a", "b", "c", "d"};
        StringBuilder sb = new StringBuilder();
        for (String s : parts) {
            sb.append(s);
        }
        System.out.println(sb.toString());
    }
}`,
    "Strings are immutable, so += copies the whole string every time",
    "O(n^2) time for large inputs",
    ["Each += allocates a brand new String", "Accumulate with StringBuilder.append"],
    "StringBuilder sb = new StringBuilder();"
  ),
  ch(335, "Unboxing Explosion", "A null wrapper is unboxed into a primitive.", 140, 5, "Java", "Intermediate",
    `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("alice", 10);
        int alice = scores.get("alice");
        int bob = scores.get("bob");
        System.out.println(alice + bob);
    }
}`,
    `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("alice", 10);
        int alice = scores.getOrDefault("alice", 0);
        int bob = scores.getOrDefault("bob", 0);
        System.out.println(alice + bob);
    }
}`,
    "get returns null for a missing key, and unboxing null to int throws",
    "NullPointerException",
    ["get() can return null for absent keys", "Use getOrDefault(key, 0) to supply a default"],
    "scores.getOrDefault(\"bob\", 0)"
  ),
  ch(336, "Static via Instance", "A static field is accessed through an instance, hiding the real problem.", 140, 5, "Java", "Intermediate",
    `public class Counter {
    static int total = 100;

    public static void main(String[] args) {
        Counter c1 = new Counter();
        c1.total = 50;
        System.out.println(total);
    }
}`,
    `public class Counter {
    static int total = 100;

    public static void main(String[] args) {
        total = 50;
        System.out.println(total);
    }
}`,
    "static members belong to the class, not the instance — the instance access is misleading",
    "Output: 50 (works by accident, but is confusing)",
    ["Static fields are shared across all instances", "Access static members through the class name"],
    "total = 50;"
  ),
  ch(337, "IndexOf -1", "A check treats the 'not found' sentinel as a valid position.", 140, 5, "Java", "Intermediate",
    `public class Main {
    public static void main(String[] args) {
        String path = "/home/user";
        if (path.indexOf("@") > 0)
            System.out.println("has at-sign");
        else
            System.out.println("no at-sign");
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        String path = "/home/user";
        if (path.indexOf("@") != -1)
            System.out.println("has at-sign");
        else
            System.out.println("no at-sign");
    }
}`,
    "indexOf returns -1 when absent and 0 when the match is at the very start",
    "a match at index 0 is reported as missing",
    ["indexOf returns -1 for 'not found'", "Check != -1 (and remember 0 is a valid position)"],
    "path.indexOf(\"@\") != -1"
  ),
  ch(338, "Casting Down", "A Double is cast to Integer, which throws at runtime.", 140, 5, "Java", "Intermediate",
    `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Object> data = new HashMap<>();
        data.put("level", Double.valueOf(4.0));
        Integer level = (Integer) data.get("level");
        System.out.println(level);
    }
}`,
    `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Object> data = new HashMap<>();
        data.put("level", Double.valueOf(4.0));
        Integer level = ((Number) data.get("level")).intValue();
        System.out.println(level);
    }
}`,
    "Double and Integer are unrelated classes — the cast is illegal",
    "ClassCastException: Double cannot be cast to Integer",
    ["A cast only works within the same type hierarchy", "Go through Number and use intValue()"],
    "((Number) data.get(\"level\")).intValue()"
  ),
  ch(339, "Reversed Sort", "The comparator sorts in the opposite direction.", 140, 5, "Java", "Intermediate",
    `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Integer[] nums = {3, 1, 2};
        Arrays.sort(nums, (a, b) -> a - b);
        System.out.println(Arrays.toString(nums));
    }
}`,
    `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Integer[] nums = {3, 1, 2};
        Arrays.sort(nums, (a, b) -> b - a);
        System.out.println(Arrays.toString(nums));
    }
}`,
    "a - b yields ascending order, but the intent was descending",
    "Output: [1, 2, 3] instead of [3, 2, 1]",
    ["a - b sorts ascending", "Swap to b - a (or use Comparator.reverseOrder()) for descending"],
    "Arrays.sort(nums, (a, b) -> b - a);"
  ),
  ch(340, "Split Drops Tail", "Trailing empty strings vanish when splitting.", 140, 5, "Java", "Intermediate",
    `public class Main {
    public static void main(String[] args) {
        String csv = "a,b,";
        String[] cells = csv.split(",");
        System.out.println(cells.length);
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        String csv = "a,b,";
        String[] cells = csv.split(",", -1);
        System.out.println(cells.length);
    }
}`,
    "split by default removes trailing empty strings",
    "Output: 2 instead of 3 (the trailing cell is lost)",
    ["split strips trailing empties by default", "Pass a negative limit (-1) to keep them"],
    "csv.split(\",\", -1)"
  ),
];
const javaAdvanced: Challenge[] = [
  ch(341, "Broken Hash Contract", "equals is overridden but hashCode is not.", 250, 8, "Java", "Advanced",
    `import java.util.HashMap;
import java.util.Map;

class Key {
    int id;
    Key(int id) { this.id = id; }

    public boolean equals(Object o) {
        return o instanceof Key k && k.id == id;
    }
}

public class Main {
    public static void main(String[] args) {
        Map<Key, String> map = new HashMap<>();
        map.put(new Key(1), "one");
        System.out.println(map.get(new Key(1)));
    }
}`,
    `import java.util.HashMap;
import java.util.Map;

class Key {
    int id;
    Key(int id) { this.id = id; }

    public boolean equals(Object o) {
        return o instanceof Key k && k.id == id;
    }

    public int hashCode() {
        return Integer.hashCode(id);
    }
}

public class Main {
    public static void main(String[] args) {
        Map<Key, String> map = new HashMap<>();
        map.put(new Key(1), "one");
        System.out.println(map.get(new Key(1)));
    }
}`,
    "equal objects must have equal hash codes, or hash maps put/put in the wrong bucket",
    "Output: null (lookup misses)",
    ["Equal objects need equal hashes", "Override hashCode whenever you override equals"],
    "public int hashCode()"
  ),
  ch(342, "Mutable Key", "A key object is changed after it is placed in a map.", 250, 8, "Java", "Advanced",
    `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<StringBuilder, String> map = new HashMap<>();
        StringBuilder key = new StringBuilder("route");
        map.put(key, "main");
        key.append("/home");
        System.out.println(map.get(key));
        System.out.println(map.get(new StringBuilder("route")));
    }
}`,
    `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, String> map = new HashMap<>();
        map.put("route", "main");
        System.out.println(map.get("route"));
    }
}`,
    "mutating a key changes its hash after insertion, stranding the entry",
    "lookups return null — the entry is lost in the wrong bucket",
    ["Map keys should be immutable", "Use String, not a mutable StringBuilder"],
    "Map<String, String> map"
  ),
  ch(343, "Thread Rumble", "An ArrayList is shared between two threads without synchronization.", 250, 8, "Java", "Advanced",
    `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) throws Exception {
        List<Integer> list = new ArrayList<>();
        Thread t1 = new Thread(() -> { for (int i = 0; i < 10000; i++) list.add(i); });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 10000; i++) list.add(i); });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(list.size());
    }
}`,
    `import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) throws Exception {
        List<Integer> list = new CopyOnWriteArrayList<>();
        Thread t1 = new Thread(() -> { for (int i = 0; i < 10000; i++) list.add(i); });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 10000; i++) list.add(i); });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(list.size());
    }
}`,
    "ArrayList is not thread-safe; concurrent add can corrupt its size and array",
    "Output: less than 20000 (or ArrayIndexOutOfBoundsException)",
    ["ArrayList offers no thread safety", "Use CopyOnWriteArrayList (or synchronize access)"],
    "new CopyOnWriteArrayList<>()"
  ),
  ch(344, "Static Blast", "A static counter is incremented from many threads.", 250, 8, "Java", "Advanced",
    `public class Main {
    static int counter = 0;

    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> { for (int i = 0; i < 100000; i++) counter++; });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 100000; i++) counter++; });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(counter);
    }
}`,
    `import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static AtomicInteger counter = new AtomicInteger();

    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> { for (int i = 0; i < 100000; i++) counter.incrementAndGet(); });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 100000; i++) counter.incrementAndGet(); });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(counter.get());
    }
}`,
    "counter++ is a read-modify-write that races across threads",
    "Output: less than 200000 (lost updates)",
    ["Static mutable state shared by threads is a race", "Use AtomicInteger (or synchronize the increment)"],
    "AtomicInteger counter"
  ),
  ch(345, "Half Locked", "Double-checked locking without volatile can publish a half-built object.", 250, 8, "Java", "Advanced",
    `public class Config {
    private static Config instance;

    public static Config get() {
        if (instance == null) {
            synchronized (Config.class) {
                if (instance == null)
                    instance = new Config();
            }
        }
        return instance;
    }
}`,
    `public class Config {
    private static volatile Config instance;

    public static Config get() {
        if (instance == null) {
            synchronized (Config.class) {
                if (instance == null)
                    instance = new Config();
            }
        }
        return instance;
    }
}`,
    "without volatile, another thread can see a partially constructed instance",
    "partially constructed object visible to other threads",
    ["The double-check needs a memory barrier", "Mark the field volatile (or use an enum/static holder)"],
    "private static volatile Config instance;"
  ),
  ch(346, "DateFormat Race", "A shared SimpleDateFormat is used from multiple threads.", 250, 8, "Java", "Advanced",
    `import java.text.SimpleDateFormat;
import java.util.Date;

public class Main {
    static final SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd");

    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> System.out.println(fmt.format(new Date())));
        Thread t2 = new Thread(() -> System.out.println(fmt.format(new Date())));
        t1.start();
        t2.start();
        t1.join();
        t2.join();
    }
}`,
    `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Main {
    static final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> System.out.println(LocalDate.now().format(fmt)));
        Thread t2 = new Thread(() -> System.out.println(LocalDate.now().format(fmt)));
        t1.start();
        t2.start();
        t1.join();
        t2.join();
    }
}`,
    "SimpleDateFormat keeps mutable calendar state and is not thread-safe",
    "garbage dates or NumberFormatException under load",
    ["SimpleDateFormat is not thread-safe", "Use java.time DateTimeFormatter (immutable and safe)"],
    "DateTimeFormatter fmt"
  ),
  ch(347, "Raw List", "A raw List is cast to a parameterized type unchecked.", 250, 8, "Java", "Advanced",
    `import java.util.ArrayList;
import java.util.List;

public class Main {
    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        List raw = new ArrayList();
        raw.add("text");
        raw.add(42);
        List<String> strings = raw;
        for (String s : strings)
            System.out.println(s.length());
    }
}`,
    `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        strings.add("text");
        for (String s : strings)
            System.out.println(s.length());
    }
}`,
    "erasure makes the cast invisible, so the Integer surfaces as a ClassCastException at use",
    "ClassCastException: Integer cannot be cast to String",
    ["Raw types bypass generic checks entirely", "Create the list with its element type from the start"],
    "List<String> strings = new ArrayList<>();"
  ),
  ch(348, "Overload Not Override", "A helper equals takes the concrete type, so it never overrides Object.equals.", 250, 8, "Java", "Advanced",
    `import java.util.HashSet;
import java.util.Set;

class Item {
    int id;
    Item(int id) { this.id = id; }

    public boolean equals(Item other) {
        return other != null && other.id == id;
    }
}

public class Main {
    public static void main(String[] args) {
        Set<Item> set = new HashSet<>();
        set.add(new Item(7));
        System.out.println(set.contains(new Item(7)));
    }
}`,
    `import java.util.HashSet;
import java.util.Set;

class Item {
    int id;
    Item(int id) { this.id = id; }

    public boolean equals(Object o) {
        return o instanceof Item other && other.id == id;
    }
}

public class Main {
    public static void main(String[] args) {
        Set<Item> set = new HashSet<>();
        set.add(new Item(7));
        System.out.println(set.contains(new Item(7)));
    }
}`,
    "equals(Item) is an overload, not an override — Object.equals is still identity",
    "Output: false",
    ["The parameter must be Object to override", "Use equals(Object o) with instanceof"],
    "public boolean equals(Object o)"
  ),
  ch(349, "Boxing Churn", "Primitives are boxed in a hot loop, allocating thousands of objects.", 250, 8, "Java", "Advanced",
    `public class Main {
    public static void main(String[] args) {
        Long total = 0L;
        for (long i = 0; i < 1_000_000; i++)
            total += i;
        System.out.println(total);
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        long total = 0L;
        for (long i = 0; i < 1_000_000; i++)
            total += i;
        System.out.println(total);
    }
}`,
    "Long is a wrapper — every += allocates a new Long object",
    "millions of heap allocations; slow and GC-heavy",
    ["Autoboxing happens silently in loops", "Use the primitive long for hot counters"],
    "long total = 0L;"
  ),
  ch(350, "Overflowing Comparator", "A comparator built from subtraction overflows for large values.", 250, 8, "Java", "Advanced",
    `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Integer[] nums = {Integer.MIN_VALUE, 1};
        Arrays.sort(nums, (a, b) -> a - b);
        System.out.println(Arrays.toString(nums));
    }
}`,
    `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Integer[] nums = {Integer.MIN_VALUE, 1};
        Arrays.sort(nums, Integer::compare);
        System.out.println(Arrays.toString(nums));
    }
}`,
    "MIN_VALUE - 1 overflows to MAX_VALUE, inverting the comparison",
    "wrong sort order (works by accident in some cases, breaks in others)",
    ["Subtraction can overflow and flip signs", "Use Integer.compare (or Comparator.comparingInt)"],
    "Integer::compare"
  ),
];
const javaNightmare: Challenge[] = [
  ch(351, "Money in Doubles", "Currency math is done with binary floating point.", 320, 10, "Java", "Nightmare",
    `public class Main {
    public static void main(String[] args) {
        double total = 0.0;
        total += 0.1;
        total += 0.2;
        System.out.println(total);
    }
}`,
    `import java.math.BigDecimal;

public class Main {
    public static void main(String[] args) {
        BigDecimal total = BigDecimal.ZERO;
        total = total.add(new BigDecimal("0.1"));
        total = total.add(new BigDecimal("0.2"));
        System.out.println(total);
    }
}`,
    "0.1 and 0.2 are not exact in binary, so the sum drifts",
    "Output: 0.30000000000000004",
    ["Doubles cannot represent cents exactly", "Use BigDecimal for monetary values"],
    "new BigDecimal(\"0.1\")"
  ),
  ch(352, "Inner Class Leak", "A non-static inner class keeps a reference to the outer instance forever.", 320, 10, "Java", "Nightmare",
    `import java.util.ArrayList;
import java.util.List;

class Cache {
    class Entry {
        String key;
    }

    List<Entry> entries = new ArrayList<>();

    Entry add(String key) {
        Entry e = new Entry();
        e.key = key;
        entries.add(e);
        return e;
    }
}

public class Main {
    public static void main(String[] args) {
        Cache cache = new Cache();
        for (int i = 0; i < 100000; i++)
            cache.add("k" + i);
        System.out.println(cache.entries.size());
    }
}`,
    `import java.util.ArrayList;
import java.util.List;

class Cache {
    static class Entry {
        String key;
    }

    List<Entry> entries = new ArrayList<>();

    Entry add(String key) {
        Entry e = new Entry();
        e.key = key;
        entries.add(e);
        return e;
    }
}

public class Main {
    public static void main(String[] args) {
        Cache cache = new Cache();
        for (int i = 0; i < 100000; i++)
            cache.add("k" + i);
        System.out.println(cache.entries.size());
    }
}`,
    "every non-static Entry silently holds the whole Cache (and its entries) alive",
    "out-of-memory once the cache grows",
    ["Non-static inner classes capture their outer instance", "Make the entry class static when it needs no outer state"],
    "static class Entry"
  ),
  ch(353, "Equals Asymmetry", "A subclass breaks the equals contract with its parent.", 320, 10, "Java", "Nightmare",
    `import java.util.HashSet;
import java.util.Set;

class Base {
    int x;
    Base(int x) { this.x = x; }

    public boolean equals(Object o) {
        return o instanceof Base b && b.x == x;
    }
}

class Derived extends Base {
    int y;
    Derived(int x, int y) { super(x); this.y = y; }

    public boolean equals(Object o) {
        return o instanceof Derived d && d.y == y;
    }
}

public class Main {
    public static void main(String[] args) {
        Set<Base> set = new HashSet<>();
        set.add(new Base(1));
        System.out.println(set.contains(new Derived(1, 2)));
    }
}`,
    `import java.util.HashSet;
import java.util.Set;

class Base {
    int x;
    Base(int x) { this.x = x; }

    public boolean equals(Object o) {
        return o instanceof Base b && b.x == x;
    }
}

public class Main {
    public static void main(String[] args) {
        Set<Base> set = new HashSet<>();
        set.add(new Base(1));
        System.out.println(set.contains(new Base(1)));
    }
}`,
    "equals stops being symmetric — Base.equals(Derived) is true but Derived.equals(Base) is false",
    "set lookups behave inconsistently (contract violation)",
    ["Inheritance and equals rarely mix", "Prefer composition, or never make subclasses of a key type"],
    "set.contains(new Base(1))"
  ),
  ch(354, "Deadlock Twins", "Two threads lock the same two resources in opposite orders.", 320, 10, "Java", "Nightmare",
    `public class Main {
    static final Object lockA = new Object();
    static final Object lockB = new Object();

    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                try { Thread.sleep(50); } catch (InterruptedException e) { }
                synchronized (lockB) { }
            }
        });
        Thread t2 = new Thread(() -> {
            synchronized (lockB) {
                try { Thread.sleep(50); } catch (InterruptedException e) { }
                synchronized (lockA) { }
            }
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("done");
    }
}`,
    `public class Main {
    static final Object lockA = new Object();
    static final Object lockB = new Object();

    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                try { Thread.sleep(50); } catch (InterruptedException e) { }
                synchronized (lockB) { }
            }
        });
        Thread t2 = new Thread(() -> {
            synchronized (lockA) {
                try { Thread.sleep(50); } catch (InterruptedException e) { }
                synchronized (lockB) { }
            }
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("done");
    }
}`,
    "t1 takes A then B; t2 takes B then A — each waits on the other's lock",
    "the program hangs forever",
    ["Lock ordering must be consistent everywhere", "Always acquire locks in the same global order"],
    "synchronized (lockA) {"
  ),
  ch(355, "Version Drift", "A serialized class is deserialized after its serialVersionUID changed.", 320, 10, "Java", "Nightmare",
    `import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

class Payload implements Serializable {
    int version = 1;
}

public class Main {
    public static void main(String[] args) throws Exception {
        Payload p = new Payload();
        byte[] bytes;
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(p);
            bytes = baos.toByteArray();
        }
        // simulated newer build with a different class shape
        try (ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            Object read = ois.readObject();
            System.out.println(read.getClass());
        }
    }
}`,
    `import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

class Payload implements Serializable {
    private static final long serialVersionUID = 1L;
    int version = 1;
}

public class Main {
    public static void main(String[] args) throws Exception {
        Payload p = new Payload();
        byte[] bytes;
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(p);
            bytes = baos.toByteArray();
        }
        try (ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            Object read = ois.readObject();
            System.out.println(read.getClass());
        }
    }
}`,
    "without a fixed serialVersionUID, any class change alters the computed UID and breaks reads",
    "InvalidClassException: incompatible serialVersionUID",
    ["Java computes the UID from the class shape", "Declare a private static final serialVersionUID explicitly"],
    "private static final long serialVersionUID = 1L;"
  ),
  ch(356, "NaN Escape", "NaN never equals itself, so identity checks silently pass.", 320, 10, "Java", "Nightmare",
    `public class Main {
    public static void main(String[] args) {
        double x = 0.0 / 0.0;
        if (x == x)
            System.out.println("valid");
        else
            System.out.println("invalid");
        if (x != x)
            System.out.println("confirmed NaN");
    }
}`,
    `public class Main {
    public static void main(String[] args) {
        double x = 0.0 / 0.0;
        if (Double.isNaN(x))
            System.out.println("invalid");
        else
            System.out.println("valid");
    }
}`,
    "x is NaN — NaN != NaN, so the 'valid' check fails and the self-inequality is the only sign",
    "Output: 'invalid' followed by 'confirmed NaN'",
    ["NaN compares unequal to everything, even itself", "Use Double.isNaN(x) for a clear test"],
    "Double.isNaN(x)"
  ),
  ch(357, "Swallowed Error", "The exception is caught and silently ignored.", 320, 10, "Java", "Nightmare",
    `import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        String config = readConfig("settings.txt");
        System.out.println("port = " + config);
    }

    static String readConfig(String path) {
        try (FileReader r = new FileReader(path)) {
            StringBuilder sb = new StringBuilder();
            int c;
            while ((c = r.read()) != -1)
                sb.append((char) c);
            return sb.toString();
        } catch (IOException e) {
            // ignore and continue
        }
        return "";
    }
}`,
    `import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        try {
            String config = readConfig("settings.txt");
            System.out.println("port = " + config);
        } catch (IOException e) {
            System.err.println("config missing: " + e.getMessage());
            System.exit(1);
        }
    }

    static String readConfig(String path) throws IOException {
        try (FileReader r = new FileReader(path)) {
            StringBuilder sb = new StringBuilder();
            int c;
            while ((c = r.read()) != -1)
                sb.append((char) c);
            return sb.toString();
        }
    }
}`,
    "the IO failure is swallowed, and the program runs with empty config",
    "silent misconfiguration — the app starts with defaults",
    ["Empty catch blocks hide real failures", "Rethrow or at least log the exception"],
    "throws IOException"
  ),
  ch(358, "ThreadLocal Leak", "A ThreadLocal value is never removed in a pooled thread.", 320, 10, "Java", "Nightmare",
    `import java.util.HashMap;
import java.util.Map;

public class Main {
    static final ThreadLocal<Map<String, Object>> ctx =
        ThreadLocal.withInitial(HashMap::new);

    public static void main(String[] args) throws Exception {
        for (int i = 0; i < 1000; i++) {
            Thread t = new Thread(() -> ctx.get().put("big", new byte[1024 * 1024]));
            t.start();
            t.join();
        }
        System.out.println("done");
    }
}`,
    `import java.util.HashMap;
import java.util.Map;

public class Main {
    static final ThreadLocal<Map<String, Object>> ctx =
        ThreadLocal.withInitial(HashMap::new);

    public static void main(String[] args) throws Exception {
        for (int i = 0; i < 1000; i++) {
            Thread t = new Thread(() -> {
                ctx.get().put("big", new byte[1024 * 1024]);
                ctx.remove();
            });
            t.start();
            t.join();
        }
        System.out.println("done");
    }
}`,
    "in a real thread pool the worker threads never die, so their ThreadLocal maps pile up",
    "out-of-memory in long-running servers",
    ["ThreadLocal values live as long as the thread", "Always call remove() (or use try/finally)"],
    "ctx.remove();"
  ),
  ch(359, "Erasure Clash", "Two methods differ only by generic type parameter — the same erasure.", 320, 10, "Java", "Nightmare",
    `import java.util.List;

public class Main {
    static void handle(List<String> items) {
        System.out.println("strings");
    }

    static void handle(List<Integer> items) {
        System.out.println("ints");
    }

    public static void main(String[] args) {
        System.out.println("clash");
    }
}`,
    `import java.util.List;

public class Main {
    static void handleStrings(List<String> items) {
        System.out.println("strings");
    }

    static void handleInts(List<Integer> items) {
        System.out.println("ints");
    }

    public static void main(String[] args) {
        System.out.println("clash");
    }
}`,
    "after erasure both methods are handle(List) — a duplicate definition",
    "compile error: name clash; both methods have the same erasure",
    ["Generics are erased at compile time", "Give the overloads distinct method names"],
    "static void handleStrings(List<String> items)"
  ),
  ch(360, "Clean as Written", "This class is correct — nothing needs to change.", 320, 10, "Java", "Nightmare",
    `public class Main {
    static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(add(2, 3));
    }
}`,
    `public class Main {
    static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(add(2, 3));
    }
}`,
    "everything checks out — the method, the entry point, and the call are all fine",
    "Output: 5",
    ["Not every file hides a bug", "This one is ready to ship"],
    "return a + b;"
  ),
];

const cTrack: Track = {
  slug: "c",
  name: "C",
  icon: "c",
  desc: "Fix segfaults, leaks, and pointer bugs in C",
  done: 0,
  total: 40,
  accent: "#3b82f6",
  challenges: [...cBeginner, ...cIntermediate, ...cAdvanced, ...cNightmare].map(c => ({ ...c, lang: "C", monacoLang: "c" })),
};

const cppTrack: Track = {
  slug: "cpp",
  name: "C++",
  icon: "cpp",
  desc: "Debug modern C++ code, STL, and templates",
  done: 0,
  total: 40,
  accent: "#60a5fa",
  challenges: [...cppBeginner, ...cppIntermediate, ...cppAdvanced, ...cppNightmare].map(c => ({ ...c, lang: "C++", monacoLang: "cpp" })),
};

const javaTrack: Track = {
  slug: "java",
  name: "Java",
  icon: "java",
  desc: "Fix Java code and enterprise patterns",
  done: 0,
  total: 40,
  accent: "#f97316",
  challenges: [...javaBeginner, ...javaIntermediate, ...javaAdvanced, ...javaNightmare].map(c => ({ ...c, lang: "Java", monacoLang: "java" })),
};

/* ========= ASSEMBLE TRACKS ========= */
const pythonTrack: Track = {
  slug: "python",
  name: "Python",
  icon: "python",
  desc: "Debug Python scripts and applications",
  done: 0,
  total: 40,
  accent: "#3b82f6",
  challenges: [...pythonBeginner, ...pythonIntermediate, ...pythonAdvanced, ...pythonNightmare].map(c => ({ ...c, lang: "Python", monacoLang: "python" })),
};

const javascriptTrack: Track = {
  slug: "javascript",
  name: "JavaScript",
  icon: "javascript",
  desc: "Hunt down JS bugs and runtime errors",
  done: 0,
  total: 40,
  accent: "#eab308",
  challenges: [...jsBeginner, ...jsIntermediate, ...jsAdvanced, ...jsNightmare].map(c => ({ ...c, lang: "JavaScript", monacoLang: "javascript" })),
};

const sqlTrack: Track = {
  slug: "sql",
  name: "SQL",
  icon: "sql",
  desc: "Repair broken database queries",
  done: 0,
  total: 40,
  accent: "#818cf8",
  challenges: [...sqlBeginner, ...sqlIntermediate, ...sqlAdvanced, ...sqlNightmare].map(c => ({ ...c, lang: "SQL", monacoLang: "sql" })),
};

export const tracks: Track[] = [
  pythonTrack,
  javascriptTrack,
  sqlTrack,
  cTrack,
  cppTrack,
  javaTrack,
  ...stackTemplates.map(buildTrack),
];

export const dailyChallenges = [
  { icon: "javascript" as IconName, title: "Closure Confusion", xp: 220, progress: "0/1" },
  { icon: "node" as IconName, title: "Infinite Recursion", xp: 200, progress: "0/1" },
  { icon: "sql" as IconName, title: "N+1 Apocalypse", xp: 160, progress: "0/1" },
];

export const difficultyStyles: Record<Difficulty, { text: string; border: string; bg: string }> = {
  Beginner: { text: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-500/10" },
  Intermediate: { text: "text-sky-400", border: "border-sky-500/50", bg: "bg-sky-500/10" },
  Advanced: { text: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-500/10" },
  Nightmare: { text: "text-rose-400", border: "border-rose-500/50", bg: "bg-rose-500/10" },
};

export function findChallenge(id: number): { challenge: Challenge; track: Track } | null {
  for (const track of tracks) {
    const challenge = track.challenges.find((c) => c.id === id);
    if (challenge) return { challenge, track };
  }
  return null;
}

/* ========= XP TRACKING ========= */
const STORAGE_KEY = "climbug_progress";

export interface PlayerProgress {
  xp: number;
  level: number;
  completed: number[];
  streak: number;
  lastActive: string;
  /** challengeId -> how many times the user has opened/attempted it */
  attempts: Record<number, number>;
}

export function loadProgress(): PlayerProgress {
  const defaults: PlayerProgress = { xp: 0, level: 1, completed: [], streak: 0, lastActive: "", attempts: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaults;
}

export function saveProgress(p: PlayerProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function completeChallenge(id: number, xpEarned: number): PlayerProgress {
  const p = loadProgress();
  if (p.completed.includes(id)) return p;
  p.completed.push(id);
  p.xp += xpEarned;
  p.level = Math.floor(p.xp / 500) + 1;
  const today = new Date().toDateString();
  if (p.lastActive !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    p.streak = p.lastActive === yesterday ? p.streak + 1 : 1;
    p.lastActive = today;
  }
  saveProgress(p);
  return p;
}
