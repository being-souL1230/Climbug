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
  ch(1, "Off By One", "A loop skips the last element of the list.", 40, 3, "python", "Beginner",
    `def get_last_users(users, limit=10):
    result = []
    for i in range(limit - 1):
        result.append(users[i])
    return result

data = ["alice", "bob", "charlie", "dave", "eve"]
print(get_last_users(data, len(data)))`,
    `for i in range(limit):`,
    "range(limit - 1) skips the last element",
    "Missing last element",
    ["range(n) goes 0 to n-1", "Remove the -1 from range()"],
    "range(limit)"
  ),
  ch(2, "Mutable Default Trap", "A function keeps remembering values across calls.", 60, 3, "python", "Beginner",
    `def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item("a"))
print(add_item("b"))
print(add_item("c"))`,
    `def add_item(item, items=None):
    if items is None:
        items = []`,
    "Mutable default argument shared across calls",
    "['a'] then ['a','b'] then ['a','b','c']",
    ["Defaults evaluated once, not per-call", "Use None and create new list inside"],
    "items is None"
  ),
  ch(3, "String Immutability", "Modifying a character by index crashes.", 50, 3, "python", "Beginner",
    `def fix_typos(text):
    text[0] = text[0].upper()
    return text

print(fix_typos("hello"))`,
    `def fix_typos(text):
    text = text.capitalize()
    return text`,
    "Strings are immutable",
    "TypeError: str does not support item assignment",
    ["Strings can't be modified in-place", "Use capitalize() method"],
    "capitalize()"
  ),
  ch(4, "Integer Division Trap", "Floor division gives wrong averages.", 50, 3, "python", "Beginner",
    `def average(numbers):
    return sum(numbers) // len(numbers)

print(average([1, 2, 3, 4, 5]))`,
    `return sum(numbers) / len(numbers)`,
    "// is floor division, truncates decimals",
    "Output: 3, Expected: 3.0",
    ["// truncates the decimal part", "Use / for float division"],
    "sum(numbers) / len"
  ),
  ch(5, "Wrong Comparison", "Assignment used instead of comparison.", 45, 3, "python", "Beginner",
    `def check_password(password):
    if len(password) = 8:
        return True
    return False

print(check_password("short"))`,
    `if len(password) == 8:`,
    "= is assignment, == is comparison",
    "SyntaxError: invalid syntax",
    ["= assigns, == compares", "Change = to =="],
    "len(password) =="
  ),
  ch(6, "Scope Shadowing", "Local variable hides global config.", 55, 3, "python", "Beginner",
    `config = {"debug": True}

def get_config():
    config = {}
    return config["debug"]

print(get_config())`,
    `def get_config():
    global config
    return config["debug"]`,
    "Local config = {} shadows the global one",
    "KeyError: 'debug'",
    ["Use global keyword to access outer variable", "Or pass config as a parameter"],
    "global config"
  ),
  ch(7, "Tuple Unpacking Error", "Too few values to unpack.", 50, 3, "python", "Beginner",
    `def get_user():
    return "alice", "admin"

name, role, level = get_user()
print(f"{name} is {role}, level {level}")`,
    `return "alice", "admin", 5`,
    "Returns 2 values but unpacks 3",
    "ValueError: not enough values to unpack",
    ["Count return values vs variables", "Add a third return value"],
    '"admin", 5'
  ),
  ch(8, "Type Confusion", "String + int concatenation crashes.", 45, 3, "python", "Beginner",
    `user = "Player"
score = 42
print("Hello " + user + ", score: " + score)`,
    `print("Hello " + user + ", score: " + str(score))`,
    "Cannot concatenate str and int directly",
    "TypeError: can only concatenate str",
    ["Convert number to string with str()", "Or use f-string"],
    "str(score)"
  ),
  ch(9, "Infinite Loop", "Counter never decremented.", 55, 4, "python", "Beginner",
    `def countdown(n):
    while n > 0:
        print(n)
    print("Done!")

countdown(3)`,
    `while n > 0:
        print(n)
        n -= 1`,
    "The counter n is never decremented",
    "3, 3, 3... forever",
    ["Add n -= 1 inside the loop body", "Without decrement, loop never ends"],
    "n -= 1"
  ),
  ch(10, "Early Return", "Return inside loop returns too soon.", 45, 3, "python", "Beginner",
    `def find_even(numbers):
    for num in numbers:
        if num % 2 == 0:
            return num
        else:
            return None

print(find_even([1, 3, 4, 5]))`,
    `def find_even(numbers):
    for num in numbers:
        if num % 2 == 0:
            return num
    return None`,
    "return None is inside the for loop",
    "Returns None on first odd number",
    ["De-indent return None", "It should be after the loop finishes"],
    "return None\n"
  ),
];

const pythonIntermediate: Challenge[] = [
  ch(11, "KeyError Chaos", "Dict lookup crashes on missing keys.", 120, 5, "python", "Intermediate",
    `def get_user_field(user, field):
    return user[field]

user = {"name": "Alice", "email": "alice@test.com"}
print(get_user_field(user, "phone"))`,
    `return user.get(field, "N/A")`,
    "Direct dict[key] raises KeyError",
    "KeyError: 'phone'",
    ["Use dict.get() instead of direct indexing", "get(key, default) never raises KeyError"],
    ".get(field"
  ),
  ch(12, "Generator Exhaustion", "Generator used twice — second call empty.", 150, 5, "python", "Intermediate",
    `def get_numbers():
    return (x for x in range(5))

gen = get_numbers()
print(sum(gen))
print(list(gen))`,
    `return list(x for x in range(5))`,
    "Generator is exhausted after first iteration",
    "10 then []",
    ["Convert to list() if you need to reuse", "Generators are single-use iterators"],
    "list(x for"
  ),
  ch(13, "List Modification During Iteration", "Removing while iterating skips elements.", 140, 5, "python", "Intermediate",
    `numbers = [1, 2, 3, 4, 5, 6]
for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)`,
    `numbers = [n for n in numbers if n % 2 != 0]`,
    "Modifying list while iterating skips items",
    "[1, 3, 5, 6] — 6 was not removed!",
    ["Never modify a list during iteration", "Use list comprehension to filter instead"],
    "[n for n in numbers if n % 2 != 0]"
  ),
  ch(14, "Class vs Instance Variable", "Class attribute shared across all instances.", 130, 5, "python", "Intermediate",
    `class Player:
    inventory = []
    def __init__(self, name):
        self.name = name
    def add_item(self, item):
        self.inventory.append(item)

p1 = Player("Alice")
p2 = Player("Bob")
p1.add_item("sword")
print(p2.inventory)`,
    `class Player:
    def __init__(self, name):
        self.name = name
        self.inventory = []`,
    "inventory = [] at class level is shared by all",
    "Bob has Alice's sword!",
    ["Move inventory into __init__", "self.inventory = [] makes it per-instance"],
    "self.inventory = []"
  ),
  ch(15, "Late Binding Closures", "Lambda in loop captures final value only.", 160, 6, "python", "Intermediate",
    `def make_functions():
    funcs = []
    for i in range(3):
        funcs.append(lambda: i)
    return funcs

for f in make_functions():
    print(f())`,
    `funcs.append(lambda i=i: i)`,
    "Lambda captures i by reference — all see final i=2",
    "2, 2, 2 instead of 0, 1, 2",
    ["Use default arg: lambda i=i: i", "Default args are evaluated at definition time"],
    "lambda i=i: i"
  ),
  ch(16, "Float Comparison", "Comparing floats with == is unreliable.", 130, 5, "python", "Intermediate",
    `result = 0.1 + 0.2
if result == 0.3:
    print("Equal!")
else:
    print(f"Not equal: {result}")`,
    `import math

result = 0.1 + 0.2
if math.isclose(result, 0.3):`,
    "0.1 + 0.2 != 0.3 in floating point",
    "Not equal: 0.30000000000000004",
    ["Floating point has precision issues", "Use math.isclose() for float comparison"],
    "math.isclose"
  ),
  ch(17, "Shallow Copy Pitfall", "Slice copy doesn't deep copy nested lists.", 140, 5, "python", "Intermediate",
    `original = [[1, 2], [3, 4]]
copy = original[:]
copy[0][0] = 99
print(original)`,
    `import copy

copy = copy.deepcopy(original)`,
    "Slicing [:] creates a shallow copy only",
    "[[99, 2], [3, 4]] — original was mutated!",
    ["Use copy.deepcopy() for nested structures", "Slicing only copies the outer list"],
    "deepcopy"
  ),
  ch(18, "File Not Closed", "File opened but never closed on error.", 120, 4, "python", "Intermediate",
    `def read_config():
    f = open("config.txt", "r")
    data = f.read()
    return data

print(read_config())`,
    `def read_config():
    with open("config.txt", "r") as f:
        data = f.read()
    return data`,
    "No context manager — file leaks on error",
    "ResourceWarning: unclosed file",
    ["Use 'with' statement for safe file handling", "with open() automatically closes the file"],
    "with open"
  ),
  ch(19, "Boolean Precedence", "and/or grouping differs from intent.", 135, 5, "python", "Intermediate",
    `def check(user):
    if not user.active and user.role == "admin" or user.bypass:
        return "Access granted"
    return "Access denied"

class U:
    active = False
    role = "guest"
    bypass = False
print(check(U()))`,
    `if not user.active and (user.role == "admin" or user.bypass):`,
    "and binds tighter than or in Python",
    "'Access granted' for guest — wrong!",
    ["Add parentheses around the OR condition", "not active and (role==admin or bypass)"],
    'and (user.role == "admin"'
  ),
  ch(20, "Bare Except", "Catches ALL exceptions including SystemExit.", 130, 5, "python", "Intermediate",
    `def parse_number(text):
    try:
        return int(text)
    except:
        return 0

print(parse_number(1.5))`,
    `    except ValueError:
        return 0`,
    "Bare except: hides every possible error",
    "1.5 silently returns 0 — real error hidden",
    ["Catch specific exceptions: except ValueError:", "Never use bare except:"],
    "except ValueError:"
  ),
];

const pythonAdvanced: Challenge[] = [
  ch(21, "Deadlocked Threads", "Two threads wait on each other forever.", 260, 8, "python", "Advanced",
    `import threading

lock_a = threading.Lock()
lock_b = threading.Lock()

def worker1():
    lock_a.acquire()
    lock_b.acquire()
    print("Worker 1 done")
    lock_b.release()
    lock_a.release()

def worker2():
    lock_b.acquire()
    lock_a.acquire()
    print("Worker 2 done")
    lock_a.release()
    lock_b.release()

t1 = threading.Thread(target=worker1)
t2 = threading.Thread(target=worker2)
t1.start()
t2.start()`,
    `def worker1():
    with lock_a:
        with lock_b:
            print("Worker 1 done")

def worker2():
    with lock_a:
        with lock_b:
            print("Worker 2 done")`,
    "Different lock acquisition order = deadlock",
    "Program hangs forever",
    ["Both threads acquire locks in different orders", "Always lock A then B, use 'with'"],
    "with lock_a:"
  ),
  ch(22, "GIL Contention", "Threading doesn't speed up CPU work.", 240, 7, "python", "Advanced",
    `import threading
import time

def cpu_task(n):
    s = 0
    for i in range(n):
        s += i * i
    return s

start = time.time()
t1 = threading.Thread(target=cpu_task, args=(50_000_000,))
t2 = threading.Thread(target=cpu_task, args=(50_000_000,))
t1.start()
t2.start()
t1.join()
t2.join()
print(f"Time: {time.time() - start:.2f}s")`,
    `import multiprocessing

with multiprocessing.Pool(2) as pool:
    results = pool.map(cpu_task, [50_000_000, 50_000_000])`,
    "GIL prevents true parallelism in threads",
    "Threading is SLOWER than sequential for CPU tasks",
    ["Use multiprocessing for CPU-bound tasks", "multiprocessing.Pool spawns separate processes"],
    "multiprocessing"
  ),
  ch(23, "Memory Leak in Closures", "Circular ref prevents garbage collection.", 230, 7, "python", "Advanced",
    `import gc

def make_handler():
    data = list(range(100000))
    def handler():
        return len(data)
    handler.data_ref = data
    return handler

handlers = [make_handler() for _ in range(100)]
print(gc.get_count())`,
    `    def handler():
        return len(data)
    return handler`,
    "handler.data_ref = data creates reference cycle",
    "Memory grows — 100 handlers * 100K items never freed",
    ["Remove the explicit reference", "The closure already captures data"],
    "handler()"
  ),
  ch(24, "Metaclass __new__ Bug", "type.__new__ breaks the metaclass chain.", 280, 10, "python", "Advanced",
    `class Meta(type):
    def __new__(mcs, name, bases, namespace):
        namespace["created_at"] = "now"
        return type.__new__(mcs, name, bases, namespace)

class Base(metaclass=Meta):
    pass

class Derived(Base):
    pass

print(Derived.created_at)`,
    `        return super().__new__(mcs, name, bases, namespace)`,
    "type.__new__ bypasses the metaclass chain",
    "Derived has no created_at attribute",
    ["Use super().__new__ to maintain the chain", "This ensures Derived also gets the Meta treatment"],
    "super().__new__"
  ),
  ch(25, "Missing __set__ Descriptor", "Descriptor missing __set__ makes attr read-only.", 250, 8, "python", "Advanced",
    `class Validated:
    def __get__(self, obj, objtype=None):
        return getattr(obj, "_value", None)
    def __set_name__(self, owner, name):
        self._name = name

class Config:
    threshold = Validated()
    def __init__(self):
        self._value = 50

c = Config()
c.threshold = 100
print(c.threshold)`,
    `class Validated:
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, "_value", None)
    def __set__(self, obj, value):
        obj._value = value
    def __set_name__(self, owner, name):
        self._name = name`,
    "Missing __set__ — assignment replaces descriptor entirely",
    "threshold replaced with integer 100",
    ["Add __set__(self, obj, value) to enable writing", "Without it, assignment overwrites the descriptor"],
    "def __set__(self, obj, value):"
  ),
  ch(26, "Asyncio Blocking Call", "time.sleep blocks entire event loop.", 240, 8, "python", "Advanced",
    `import asyncio
import time

async def fetch_data():
    await asyncio.sleep(0.1)
    return "data"

async def blocking_task():
    time.sleep(3)
    return "done"

async def main():
    t1 = asyncio.create_task(fetch_data())
    t2 = asyncio.create_task(blocking_task())
    results = await asyncio.gather(t1, t2)
    print(results)

asyncio.run(main())`,
    `    await asyncio.sleep(3)`,
    "time.sleep is synchronous — blocks the event loop",
    "fetch_data waits 3 seconds even though it needs 0.1s",
    ["Use await asyncio.sleep() in async code", "time.sleep blocks the whole event loop"],
    "await asyncio.sleep(3)"
  ),
  ch(27, "Pickle Can't Handle Lambda", "Lambda can't be serialized with pickle.", 220, 7, "python", "Advanced",
    `import pickle

def make_processor():
    threshold = 50
    process = lambda x: x > threshold
    return process

processor = make_processor()
data = {"fn": processor}

with open("data.pkl", "wb") as f:
    pickle.dump(data, f)`,
    `import dill

with open("data.pkl", "wb") as f:
    dill.dump(data, f)`,
    "pickle can't serialize lambda functions",
    "AttributeError: Can't pickle local object",
    ["Use dill library which extends pickle", "dill can serialize lambdas and closures"],
    "import dill"
  ),
  ch(28, "Race Condition in Dict", "Shared dict updated without lock.", 260, 8, "python", "Advanced",
    `import threading

shared = {"count": 0}

def increment():
    for _ in range(10000):
        shared["count"] = shared["count"] + 1

t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)
t1.start()
t2.start()
t1.join()
t2.join()
print(shared["count"])`,
    `import threading

lock = threading.Lock()

def increment():
    for _ in range(10000):
        with lock:
            shared["count"] = shared["count"] + 1`,
    "read-modify-write on shared dict is not atomic",
    "Output < 20000 — lost updates due to race",
    ["Wrap the operation in threading.Lock()", "with lock: makes it atomic"],
    "with lock:"
  ),
  ch(29, "Missing Abstract Method", "Subclass doesn't implement all abstract methods.", 230, 7, "python", "Advanced",
    `from abc import ABC, abstractmethod

class Database(ABC):
    @abstractmethod
    def connect(self):
        pass
    @abstractmethod
    def query(self, sql):
        pass
    @abstractmethod
    def close(self):
        pass

class MySQL(Database):
    def connect(self):
        pass
    def query(self, sql):
        pass

db = MySQL()
print("Connected")`,
    `    def close(self):
        pass`,
    "MySQL class doesn't implement the close() method",
    "TypeError: Can't instantiate abstract class MySQL",
    ["Implement the close() method", "All @abstractmethod methods must be overridden"],
    "def close(self):"
  ),
  ch(30, "Contextvars in Async Tasks", "Context lost between concurrent async tasks.", 270, 9, "python", "Advanced",
    `import asyncio
from contextvars import ContextVar

request_id = ContextVar("request_id")

async def process():
    print(f"Processing: {request_id.get()}")
    await asyncio.sleep(0.1)

async def main():
    request_id.set("req-123")
    await asyncio.gather(process(), process())

asyncio.run(main())`,
    `    t1 = asyncio.create_task(process())
    t2 = asyncio.create_task(process())
    await asyncio.gather(t1, t2)`,
    "Context may not propagate to gather coroutines directly",
    "Context shared or lost between concurrent tasks",
    ["Use create_task() to create proper task contexts", "Each task gets its own copy of context variables"],
    "create_task"
  ),
];

const pythonNightmare: Challenge[] = [
  ch(31, "Ctypes Memory Corruption", "Modifying Python internals causes segfault.", 350, 12, "python", "Nightmare",
    `import ctypes
import sys

def evil_modify():
    x = 42
    id_x = id(x)
    ctypes.c_int.from_address(id_x).value = 0
    return x

print(evil_modify())`,
    `def safe_modify():
    x = 42
    return x

print(safe_modify())`,
    "ctypes modifies Python object memory directly",
    "Segmentation fault / interpreter crash",
    ["Never use ctypes on Python object internals", "Just return the value normally"],
    "def safe_modify"
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
    `def process_a(data):
    from module_b import process_b
    return process_b(data) + "_a"

# module_b.py
def process_b(data):
    from module_a import process_a
    return process_a(data) + "_b"`,
    "Top-level circular imports between modules",
    "ImportError: partially initialized module",
    ["Move imports inside functions (lazy imports)", "Lazy imports break the circular dependency"],
    "from module_b import"
  ),
  ch(33, "Recursion Overflow", "Deep nesting exceeds recursion limit.", 300, 10, "python", "Nightmare",
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
    "Deep nesting exceeds Python's recursion limit of 1000",
    "RecursionError: maximum recursion depth exceeded",
    ["Convert recursion to iteration with an explicit stack", "while loop with push/pop avoids the limit"],
    "stack = [nested]"
  ),
  ch(34, "Hash Randomization", "Dict order varies — hash is non-deterministic.", 290, 10, "python", "Nightmare",
    `import hashlib

def serialize_config(config):
    result = ""
    for key, value in config.items():
        result += f"{key}={value};"
    return hashlib.md5(result.encode()).hexdigest()

config = {"host": "localhost", "port": 8080, "debug": True}
print(serialize_config(config))`,
    `    for key in sorted(config.keys()):
        result += f"{key}={config[key]};"`,
    "Dict iteration order varies with PYTHONHASHSEED",
    "Different MD5 hash on each run",
    ["Sort keys before serialization for deterministic output", "sorted(config.keys()) guarantees consistent order"],
    "sorted(config.keys())"
  ),
  ch(35, "Fork Bomb", "os.fork without exit creates exponential processes.", 340, 10, "python", "Nightmare",
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
    "os.fork duplicates the process — child also forks",
    "Exponential process creation — system unresponsive",
    ["Use multiprocessing.Process instead of os.fork", "Always join() child processes and limit depth"],
    "multiprocessing"
  ),
  ch(36, "__del__ + Reference Cycle", "__del__ prevents GC from collecting cycles.", 300, 10, "python", "Nightmare",
    `import gc

class Node:
    def __init__(self):
        self.child = None
    def __del__(self):
        print(f"Deleting {id(self)}")

a = Node()
b = Node()
a.child = b
b.child = a
del a
del b
gc.collect()
print("Done")`,
    `class Node:
    def __init__(self):
        self.child = None
    def close(self):
        self.child = None`,
    "__del__ + reference cycle = GC can't collect",
    "Objects never collected — memory leak",
    ["Use explicit cleanup (close()) instead of __del__", "Or use weakref for back-references"],
    "def close(self):"
  ),
  ch(37, "C-Stack Overflow", "High recursionlimit causes C stack crash.", 320, 10, "python", "Nightmare",
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
    "fib(50) naive recursion = 2^50 calls even with high limit",
    "C stack overflow",
    ["Use iterative approach for fibonacci", "Or @functools.lru_cache for memoization"],
    "a, b = 0, 1"
  ),
  ch(38, "Signal Handler Race", "Signal handler races with worker thread.", 330, 11, "python", "Nightmare",
    `import signal
import threading
import sys

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
    "Signal handlers run in main thread only — race with worker",
    "Race condition on shutdown flag",
    ["Use threading.Event for thread-safe signaling", "Event.wait(timeout) avoids busy-waiting"],
    "threading.Event()"
  ),
  ch(39, "Mutable Dataclass Default", "Mutable class default shared in dataclass.", 280, 9, "python", "Nightmare",
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
    "dataclass mutable default shared across instances",
    "t2.tags = ['urgent'] — shared between instances!",
    ["Use field(default_factory=list) in dataclass", "Never use mutable defaults in dataclass"],
    "field(default_factory=list)"
  ),
  ch(40, "Singleton Metaclass", "Singleton pattern with inheritance issues.", 310, 10, "python", "Nightmare",
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
    "Actually correct — each class gets its own instance",
    "Code is correct — recognize when there's no bug!",
    ["The Singleton pattern here is actually correct", "Sometimes the code is already right — no fix needed"],
    "_instances"
  ),
];

/* ========= JAVASCRIPT TRACK ========= */
const jsBeginner: Challenge[] = [
  ch(101, "Undefined Property", "Accessing property on undefined crashes.", 40, 3, "javascript", "Beginner",
    `const user = getUser();\nconsole.log(user.name);\n\nfunction getUser() {\n    return null;\n}`,
    `const user = getUser();\nif (user) {\n    console.log(user.name);\n}`,
    "Accessing .name on null",
    "TypeError: Cannot read property 'name' of null",
    ["Check if user exists first", "Use optional chaining user?.name"],
    "if (user)"
  ),
  ch(102, "Var Hoisting", "Variable used before declaration gives undefined.", 50, 3, "javascript", "Beginner",
    `console.log(score);\nvar score = 100;`,
    `let score = 100;\nconsole.log(score);`,
    "var hoisted, value is undefined at console.log",
    "undefined",
    ["var is hoisted, let/const are not", "Declare before use"],
    "let score"
  ),
  ch(103, "Missing Semicolon ASI", "Automatic semicolon insertion breaks return.", 55, 3, "javascript", "Beginner",
    `function getValue() {\n    return\n    {\n        value: 42\n    };\n}\n\nconsole.log(getValue());`,
    `function getValue() {\n    return {\n        value: 42\n    };\n}`,
    "return on its own line returns undefined",
    "undefined instead of {value: 42}",
    ["Return with newline = return undefined", "Put return value on same line"],
    "return {"
  ),
  ch(104, "Type Coercion", "== does type coercion giving wrong results.", 45, 3, "javascript", "Beginner",
    `console.log(0 == "0");\nconsole.log(0 == false);\nconsole.log("" == false);`,
    `console.log(0 === "0");\nconsole.log(0 === false);\nconsole.log("" === false);`,
    "== does implicit type coercion",
    "true, true, true — all coerce to same",
    ["Use === for strict comparison", "=== checks value AND type"],
    "==="
  ),
  ch(105, "Array Length Confusion", "Setting array.length truncates the array.", 50, 3, "javascript", "Beginner",
    `const arr = [1, 2, 3, 4, 5];\narr.length = 3;\nconsole.log(arr);`,
    `const arr = [1, 2, 3, 4, 5];\nconst sliced = arr.slice(0, 3);\nconsole.log(sliced);`,
    "Setting length mutates original array in-place",
    "[1,2,3] — original array was modified",
    ["Use slice() to avoid mutation", "arr.length = n truncates in-place"],
    ".slice(0"
  ),
  ch(106, "NaN Comparison", "NaN !== NaN — always true.", 55, 3, "javascript", "Beginner",
    `function isValid(num) {\n    if (num !== NaN) {\n        return "Valid";\n    }\n    return "Invalid";\n}\n\nconsole.log(isValid(5));\nconsole.log(isValid(NaN));`,
    `function isValid(num) {\n    if (!Number.isNaN(num)) {\n        return "Valid";\n    }\n    return "Invalid";\n}`,
    "NaN never equals anything, even itself",
    "Both return 'Valid' — NaN case wrong",
    ["NaN !== NaN is always true", "Use Number.isNaN() to check"],
    "Number.isNaN"
  ),
  ch(107, "String Split Gotcha", "split on empty string creates [''].", 45, 3, "javascript", "Beginner",
    `const csv = "a,b,c";\nconst items = csv.split(",");\nconsole.log(items.length);\n\nconst empty = "";\nconst emptyItems = empty.split(",");\nconsole.log(emptyItems.length);`,
    `const emptyItems = empty.length > 0 ? empty.split(",") : [];`,
    '"".split(\',\') returns [\'\'] not []',
    "1 instead of 0",
    ["Check string length before splitting", "Empty string split returns ['']"],
    "empty.length > 0"
  ),
  ch(108, "Object Reference", "Assigning object copies reference, not value.", 50, 3, "javascript", "Beginner",
    `const a = { x: 1 };\nconst b = a;\nb.x = 99;\nconsole.log(a.x);`,
    `const a = { x: 1 };\nconst b = { ...a };\nb.x = 99;\nconsole.log(a.x);`,
    "Object assignment copies reference",
    "99 — a was mutated through b",
    ["Use spread operator for shallow copy", "{ ...a } creates a new object"],
    "{ ...a }"
  ),
  ch(109, "Loose Equality", "Comparing different types with == gives surprises.", 50, 3, "javascript", "Beginner",
    `function check(value) {\n    if (value == 0) {\n        return "zero";\n    }\n    return "not zero";\n}\n\nconsole.log(check("0"));\nconsole.log(check(false));\nconsole.log(check([]));`,
    `function check(value) {\n    if (value === 0) {\n        return "zero";\n    }\n    return "not zero";\n}`,
    "== coerces types — 0 == false == '' all true",
    "All return 'zero' incorrectly",
    ["Use === for strict comparison", "=== doesn't coerce types"],
    "==="
  ),
  ch(110, "Floating Point", "0.1 + 0.2 !== 0.3 in JavaScript too.", 50, 3, "javascript", "Beginner",
    `console.log(0.1 + 0.2 === 0.3);\nconsole.log(0.1 + 0.2);`,
    `console.log(Math.abs(0.1 + 0.2 - 0.3) < 0.0001);\nconsole.log((0.1 + 0.2).toFixed(1));`,
    "0.1 + 0.2 = 0.30000000000000004",
    "false, 0.30000000000000004",
    ["Floating point precision issue", "Use toFixed() or epsilon comparison"],
    "toFixed"
  ),
];

const jsIntermediate: Challenge[] = [
  ch(111, "Closure in Loop", "Closure captures loop variable by reference.", 220, 5, "javascript", "Intermediate",
    `const buttons = document.querySelectorAll('.btn');\nfor (var i = 0; i < buttons.length; i++) {\n    buttons[i].addEventListener('click', function() {\n        console.log('Clicked button #' + i);\n    });\n}`,
    `for (let i = 0; i < buttons.length; i++) {`,
    "var is function-scoped, all handlers see final i",
    "All buttons log the same number",
    ["Use let instead of var", "let is block-scoped — each iteration gets its own i"],
    "let i = 0"
  ),
  ch(112, "This Binding Lost", "Method loses this when passed as callback.", 180, 5, "javascript", "Intermediate",
    `const user = {\n    name: "Alice",\n    greet() {\n        console.log("Hello, " + this.name);\n    }\n};\n\nsetTimeout(user.greet, 100);`,
    `setTimeout(() => user.greet(), 100);`,
    "this is lost when method passed as callback",
    "'Hello, undefined'",
    ["Wrap in arrow function to preserve context", "Arrow functions don't rebind this"],
    "user.greet()"
  ),
  ch(113, "Promise Not Returned", "Async function doesn't return the promise chain.", 160, 5, "javascript", "Intermediate",
    `function fetchData() {\n    fetch('/api/data')\n        .then(r => r.json())\n        .then(data => {\n            console.log(data);\n            return data;\n        });\n}\n\nconst result = fetchData();\nconsole.log(result);`,
    `function fetchData() {\n    return fetch('/api/data')\n        .then(r => r.json())\n        .then(data => {\n            console.log(data);\n            return data;\n        });\n}`,
    "Missing return on fetch chain",
    "undefined — promise not returned",
    ["Add return before fetch()", "The promise chain must be returned from the function"],
    "return fetch"
  ),
  ch(114, "Array forEach Return", "forEach doesn't return a new array.", 140, 5, "javascript", "Intermediate",
    `const numbers = [1, 2, 3, 4];\nconst doubled = numbers.forEach(n => n * 2);\nconsole.log(doubled);`,
    `const doubled = numbers.map(n => n * 2);`,
    "forEach always returns undefined",
    "undefined",
    ["Use map() to transform arrays", "forEach always returns undefined"],
    ".map("
  ),
  ch(115, "Event Listener Memory Leak", "Listeners added but never removed.", 170, 6, "javascript", "Intermediate",
    `function setupListeners() {\n    window.addEventListener('resize', handleResize);\n    window.addEventListener('scroll', handleScroll);\n}\n\nfunction cleanup() {\n    // listeners never removed\n}`,
    `function cleanup() {\n    window.removeEventListener('resize', handleResize);\n    window.removeEventListener('scroll', handleScroll);\n}`,
    "Event listeners never removed",
    "Memory leak — handlers pile up",
    ["Use removeEventListener to clean up", "Match exact function references"],
    "removeEventListener"
  ),
  ch(116, "Async/Await Missing Await", "Forgot await — got promise instead of value.", 150, 5, "javascript", "Intermediate",
    `async function getUser() {\n    const user = fetch('/api/user');\n    console.log(user.name);\n}\n\ngetUser();`,
    `async function getUser() {\n    const user = await fetch('/api/user');\n    const data = await user.json();\n    console.log(data.name);\n}`,
    "fetch returns a Promise, need await",
    "undefined — user is a Promise object",
    ["Add await before fetch()", "Also need to await .json()"],
    "await fetch"
  ),
  ch(117, "Object.assign Mutates", "Object.assign modifies the first argument in-place.", 140, 5, "javascript", "Intermediate",
    `const defaults = { theme: 'dark', lang: 'en' };\nconst userPrefs = { theme: 'light' };\nconst merged = Object.assign(defaults, userPrefs);\nconsole.log(defaults.theme);`,
    `const merged = Object.assign({}, defaults, userPrefs);`,
    "Object.assign mutates the first argument",
    "'light' — defaults was modified!",
    ["Pass {} as first argument for non-mutating merge", "Object.assign({}, target, source)"],
    "{}, defaults"
  ),
  ch(118, "Date Month Off-By-One", "JavaScript months are 0-indexed.", 130, 5, "javascript", "Intermediate",
    `const birthday = new Date(1990, 5, 15);\nconsole.log(birthday.getMonth());\nconsole.log(birthday.getMonth() + 1);`,
    `const month = birthday.getMonth() + 1;\nconsole.log(month);`,
    "getMonth() returns 0-11, not 1-12",
    "5 instead of 6 for June",
    ["getMonth() is 0-indexed", "Add 1 for human-readable month"],
    "getMonth() + 1"
  ),
  ch(119, "SetTimeout in Loop", "setTimeout captures final loop value.", 160, 6, "javascript", "Intermediate",
    `for (var i = 1; i <= 3; i++) {\n    setTimeout(function() {\n        console.log(i);\n    }, i * 1000);\n}`,
    `for (let i = 1; i <= 3; i++) {\n    setTimeout(function() {\n        console.log(i);\n    }, i * 1000);\n}`,
    "var hoisted, all timeouts see final i=4",
    "4, 4, 4 instead of 1, 2, 3",
    ["Use let for block scope in the for loop", "Or use an IIFE to capture i"],
    "let i"
  ),
  ch(120, "Deep Equality", "Comparing objects with == always false.", 150, 5, "javascript", "Intermediate",
    `const a = { x: 1, y: 2 };\nconst b = { x: 1, y: 2 };\nconsole.log(a == b);\nconsole.log(a === b);`,
    `function deepEqual(a, b) {\n    return JSON.stringify(a) === JSON.stringify(b);\n}\nconsole.log(deepEqual(a, b));`,
    "Objects compared by reference, not value",
    "false, false — same content, different objects",
    ["Objects compared by reference, not value", "Use JSON.stringify for deep comparison"],
    "JSON.stringify"
  ),
];

const jsAdvanced: Challenge[] = [
  ch(121, "Event Loop Starvation", "Sync code starves the event loop.", 240, 8, "javascript", "Advanced",
    `function processQueue() {\n    while (queue.length > 0) {\n        const item = queue.shift();\n        process(item);\n    }\n}\n\nbutton.addEventListener('click', processQueue);`,
    `function processQueue() {\n    const item = queue.shift();\n    if (item) {\n        process(item);\n        setTimeout(processQueue, 0);\n    }\n}`,
    "While loop blocks the entire event loop",
    "UI freezes during processing",
    ["Break into chunks with setTimeout", "Process one item per tick"],
    "setTimeout(processQueue"
  ),
  ch(122, "Prototype Chain", "Modifying prototype affects all instances.", 230, 7, "javascript", "Advanced",
    `function Widget() {\n    this.data = [];\n}\n\nWidget.prototype.addData = function(item) {\n    this.data.push(item);\n};\n\nconst w1 = new Widget();\nconst w2 = new Widget();\nw1.addData("test");\nconsole.log(w2.data);`,
    `function Widget() {\n    this.data = [];\n}\n\nWidget.prototype.addData = function(item) {\n    this.data.push(item);\n};`,
    "Actually correct — this.data is per-instance",
    "[] — each instance has its own data array. Code is correct.",
    ["The code is actually correct", "this.data in constructor is per-instance"],
    "this.data = []"
  ),
  ch(123, "WeakRef Garbage Collection", "WeakRef may return undefined after GC.", 250, 8, "javascript", "Advanced",
    `class Component {\n    constructor(el) {\n        this.element = new WeakRef(el);\n    }\n    update() {\n        const el = this.element.deref();\n        el.textContent = 'updated';\n    }\n}`,
    `class Component {\n    constructor(el) {\n        this.element = new WeakRef(el);\n    }\n    update() {\n        const el = this.element.deref();\n        if (el) {\n            el.textContent = 'updated';\n        }\n    }\n}`,
    "WeakRef may be undefined after garbage collection",
    "TypeError: Cannot set property of undefined",
    ["Check if deref() returns undefined", "Guard the access with if (el)"],
    "if (el)"
  ),
  ch(124, "Proxy Handler Trap", "Proxy handler doesn't intercept all operations.", 260, 8, "javascript", "Advanced",
    `const handler = {\n    get(target, prop) {\n        console.log('Reading ' + prop);\n        return target[prop];\n    }\n};\n\nconst obj = new Proxy({ name: 'test' }, handler);\nobj.name = 'changed';\nconsole.log(obj.name);`,
    `const handler = {\n    get(target, prop) {\n        console.log('Reading ' + prop);\n        return target[prop];\n    },\n    set(target, prop, value) {\n        console.log('Writing ' + prop + ' = ' + value);\n        target[prop] = value;\n        return true;\n    }\n};`,
    "No set trap — assignments not intercepted",
    "No 'Writing' log for assignment",
    ["Add set trap to the handler object", "set(target, prop, value) intercepts writes"],
    "set(target, prop, value):"
  ),
  ch(125, "Generator Memory", "Generator stores all yielded values in memory.", 220, 7, "javascript", "Advanced",
    `function* generateData() {\n    const results = [];\n    for (let i = 0; i < 1000000; i++) {\n        results.push(i * 2);\n        yield results[results.length - 1];\n    }\n}\n\nfor (const val of generateData()) {\n    console.log(val);\n}`,
    `function* generateData() {\n    for (let i = 0; i < 1000000; i++) {\n        yield i * 2;\n    }\n}`,
    "Storing all values in array defeats generator purpose",
    "MemoryError — storing 1M values",
    ["Don't store results in an array", "Yield directly: yield i * 2"],
    "yield i * 2"
  ),
  ch(126, "Microtask Queue Order", "Promise microtasks run before setTimeout callbacks.", 230, 7, "javascript", "Advanced",
    `console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);`,
    `console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);`,
    "Actually correct — demonstrates event loop order",
    "Output: 1, 4, 3, 2 — microtasks before macrotasks",
    ["Microtasks (Promise) run before macrotasks (setTimeout)", "Output order: 1, 4, 3, 2"],
    "setTimeout"
  ),
  ch(127, "Object Freeze Mutation", "Object.freeze doesn't prevent nested mutation.", 240, 8, "javascript", "Advanced",
    `const config = Object.freeze({\n    theme: 'dark',\n    options: { debug: true }\n});\n\nconfig.options.debug = false;\nconsole.log(config.options.debug);`,
    `const deepFreeze = (obj) => {\n    Object.keys(obj).forEach(key => {\n        if (typeof obj[key] === 'object' && obj[key] !== null) {\n            deepFreeze(obj[key]);\n        }\n    });\n    return Object.freeze(obj);\n};`,
    "Object.freeze only shallow freezes objects",
    "false — nested object still mutable!",
    ["Object.freeze is shallow only", "Recursively freeze nested objects with deepFreeze"],
    "deepFreeze"
  ),
  ch(128, "Symbol Collision", "Symbols with same description are different.", 220, 7, "javascript", "Advanced",
    `const KEY = Symbol('key');\nconst obj = { [KEY]: 'value' };\nconsole.log(obj[Symbol('key')]);`,
    `const KEY = Symbol('key');\nconst obj = { [KEY]: 'value' };\nconsole.log(obj[KEY]);`,
    "Each Symbol('key') creates a unique symbol instance",
    "undefined — different symbol instances",
    ["Symbols with same description are different", "Store Symbol in variable and reuse it"],
    "obj[KEY]"
  ),
  ch(129, "Reflect vs Direct", "Using Reflect for proper prototype chain handling.", 250, 8, "javascript", "Advanced",
    `const handler = {\n    get(target, prop, receiver) {\n        return target[prop];\n    }\n};\n\nconst obj = new Proxy({}, handler);\nObject.setPrototypeOf(obj, { x: 1 });\nconsole.log(obj.x);`,
    `const handler = {\n    get(target, prop, receiver) {\n        return Reflect.get(target, prop, receiver);\n    }\n};`,
    "Direct property access doesn't respect proxy receiver",
    "undefined — prototype chain broken through proxy",
    ["Use Reflect.get(target, prop, receiver)", "Reflect preserves the correct 'this' binding"],
    "Reflect.get"
  ),
  ch(130, "Async Iterator Memory", "Async generator holds references preventing GC.", 260, 8, "javascript", "Advanced",
    `async function* streamData() {\n    const buffer = [];\n    for await (const chunk of source) {\n        buffer.push(chunk);\n        yield buffer[buffer.length - 1];\n    }\n}\n\nfor await (const item of streamData()) {\n    console.log(item);\n}`,
    `async function* streamData() {\n    for await (const chunk of source) {\n        yield chunk;\n    }\n}`,
    "Buffer accumulates all chunks in memory",
    "Memory leak — buffer never cleared",
    ["Yield directly without buffering", "Remove the buffer array"],
    "yield chunk"
  ),
];

const jsNightmare: Challenge[] = [
  ch(131, "V8 Optimizer Bug", "V8 deopts on hidden class change.", 350, 12, "javascript", "Nightmare",
    `class Point {\n    constructor(x, y) {\n        this.x = x;\n        this.y = y;\n    }\n}\n\nconst points = [];\nfor (let i = 0; i < 100000; i++) {\n    points.push(new Point(i, i));\n}\npoints[0].z = 0;`,
    `class Point {\n    constructor(x, y, z = 0) {\n        this.x = x;\n        this.y = y;\n        this.z = z;\n    }\n}`,
    "Adding property after construction breaks V8 hidden class",
    "Performance cliff — V8 deoptimizes the whole loop",
    ["Define all properties in the constructor", "Use default values for optional properties"],
    "z = 0"
  ),
  ch(132, "SharedArrayBuffer Race", "Race condition on shared memory between workers.", 340, 11, "javascript", "Nightmare",
    `const buffer = new SharedArrayBuffer(4);\nconst view = new Int32Array(buffer);\n\nAtomics.store(view, 0, 1);\nwhile (Atomics.load(view, 0) === 0) { /* spin */ }\nconsole.log('Done');`,
    `Atomics.store(view, 0, 1);\nAtomics.notify(view, 0);\n\nwhile (Atomics.load(view, 0) === 0) {\n    Atomics.wait(view, 0, 0);\n}\nconsole.log('Done');`,
    "Busy-wait spin wastes 100% CPU",
    "100% CPU usage on worker 2",
    ["Use Atomics.wait() and Atomics.notify()", "Atomics.wait blocks without spinning"],
    "Atomics.wait"
  ),
  ch(133, "FinalizationRegistry Order", "FinalizationRegistry doesn't guarantee cleanup order.", 300, 10, "javascript", "Nightmare",
    `const registry = new FinalizationRegistry(key => {\n    console.log('Cleaned up:', key);\n});\n\nlet a = { name: 'a' };\nlet b = { name: 'b' };\nregistry.register(a, 'a');\nregistry.register(b, 'b');\na = null;\nb = null;`,
    `const registry = new FinalizationRegistry(key => {\n    console.log('Cleaned up:', key);\n});`,
    "FinalizationRegistry timing is unpredictable",
    "Order and timing of cleanup is not guaranteed",
    ["FinalizationRegistry is best-effort only", "Don't rely on specific cleanup order"],
    "FinalizationRegistry"
  ),
  ch(134, "WebAssembly Memory", "Wasm memory grows but doesn't shrink automatically.", 320, 10, "javascript", "Nightmare",
    `const memory = new WebAssembly.Memory({ initial: 256, maximum: 512 });\nconst view = new Uint8Array(memory.buffer);\n\nfor (let i = 0; i < view.length; i++) view[i] = i % 256;\nview.fill(0);\nconsole.log(memory.buffer.byteLength);`,
    `const memory = new WebAssembly.Memory({ initial: 256, maximum: 512 });`,
    "Wasm memory can never be shrunk",
    "byteLength still 256 pages — can't shrink",
    ["Wasm memory only grows, never shrinks", "Create new Memory instance to effectively shrink"],
    "new WebAssembly.Memory"
  ),
  ch(135, "Atomics CompareExchange", "Lock-free counter using compareExchange has race window.", 330, 11, "javascript", "Nightmare",
    `const buffer = new SharedArrayBuffer(4);\nconst view = new Int32Array(buffer);\n\nfunction increment() {\n    Atomics.store(view, 0, Atomics.load(view, 0) + 1);\n}`,
    `function increment() {\n    let oldVal;\n    do {\n        oldVal = Atomics.load(view, 0);\n    } while (Atomics.compareExchange(view, 0, oldVal, oldVal + 1) !== oldVal);\n}`,
    "Load-then-store is not atomic",
    "Lost updates when multiple threads increment",
    ["Use compareExchange loop for atomic increment", "CAS (Compare-And-Swap) is the atomic operation"],
    "compareExchange"
  ),
  ch(136, "Structured Clone Bug", "structuredClone can't clone functions or DOM nodes.", 290, 9, "javascript", "Nightmare",
    `const config = {\n    name: 'app',\n    handler: () => console.log('click'),\n    element: document.getElementById('app')\n};\n\nconst copy = structuredClone(config);\nconsole.log(copy.handler);`,
    `const config = {\n    name: 'app',\n};`,
    "structuredClone can't clone functions or DOM nodes",
    "DataCloneError",
    ["structuredClone only handles serializable data", "Remove functions and DOM references"],
    "name: 'app'"
  ),
  ch(137, "Temporal API Precision", "Date precision loss in arithmetic operations.", 280, 9, "javascript", "Nightmare",
    `const now = new Date();\nconst later = new Date(now.getTime() + 86400000);\nconsole.log(now.toISOString());\nconsole.log(later.toISOString());`,
    `const now = new Date();\nconst later = new Date(now.getTime() + 86400000);`,
    "Actually correct for day arithmetic",
    "Wrong time on DST transition days",
    ["Date arithmetic doesn't account for DST", "Use UTC methods or a library like date-fns"],
    "getTime()"
  ),
  ch(138, "Import Map Caching", "Import maps can't be updated at runtime.", 300, 10, "javascript", "Nightmare",
    `// Import map set once at page load\n// Can't be updated dynamically`,
    `const module = await import('https://cdn.example.com/lodash@4.17.21');`,
    "Import maps are static — can't change after parse",
    "Can't update import map at runtime",
    ["Use dynamic import() for runtime flexibility", "Import maps are only parsed once"],
    "await import("
  ),
  ch(139, "WeakMap Key Identity", "WeakMap uses object identity, not equality.", 280, 9, "javascript", "Nightmare",
    `const cache = new WeakMap();\nconst key1 = { id: 1 };\nconst key2 = { id: 1 };\n\ncache.set(key1, 'data');\nconsole.log(cache.get(key2));`,
    `const cache = new Map();\nconst key1 = { id: 1 };\ncache.set(key1.id, 'data');\nconsole.log(cache.get(1));`,
    "WeakMap keys are compared by identity, not value",
    "undefined — different object references",
    ["WeakMap compares keys by reference identity", "Use primitive keys with regular Map for value comparison"],
    "cache.set(key1.id"
  ),
  ch(140, "Performance Observer", "PerformanceObserver doesn't catch all metrics.", 310, 10, "javascript", "Nightmare",
    `const observer = new PerformanceObserver((list) => {\n    for (const entry of list.getEntries()) {\n        console.log(entry.name, entry.duration);\n    }\n});\nobserver.observe({ type: 'navigation', buffered: true });`,
    `observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });`,
    "Only observing navigation, missing paint events",
    "First paint not reported",
    ["Observe multiple entry types", "Add 'paint' to entryTypes array"],
    "'paint'"
  ),
];

/* ========= SQL TRACK ========= */
const sqlBeginner: Challenge[] = [
  ch(201, "Missing WHERE Clause", "Query affects all rows instead of one.", 50, 3, "sql", "Beginner",
    `UPDATE users SET active = false;`,
    `UPDATE users SET active = false WHERE id = 42;`,
    "No WHERE clause — every row gets updated",
    "All users deactivated!",
    ["Always add WHERE to UPDATE statements", "WHERE id = 42 targets a specific row"],
    "WHERE id = 42"
  ),
  ch(202, "String Quotes", "Unquoted string treated as column name.", 45, 3, "sql", "Beginner",
    `SELECT * FROM users WHERE status = active;`,
    `SELECT * FROM users WHERE status = 'active';`,
    "'active' treated as column name, not a string literal",
    "Unknown column 'active'",
    ["Strings need quotes in SQL", "WHERE status = 'active'"],
    "'active'"
  ),
  ch(203, "COUNT vs SUM", "COUNT counts rows, not sums values.", 50, 3, "sql", "Beginner",
    `SELECT COUNT(amount) AS total FROM orders;`,
    `SELECT SUM(amount) AS total FROM orders;`,
    "COUNT returns the number of rows",
    "Returns 100 (rows) instead of 5000 (sum)",
    ["Use SUM for adding numeric values", "COUNT only counts non-null rows"],
    "SUM(amount)"
  ),
  ch(204, "NULL Comparison", "NULL compared with = always returns unknown.", 55, 3, "sql", "Beginner",
    `SELECT * FROM users WHERE deleted_at = NULL;`,
    `SELECT * FROM users WHERE deleted_at IS NULL;`,
    "NULL = NULL is unknown, not true",
    "Returns no rows at all",
    ["Use IS NULL, not = NULL", "NULL comparisons need the IS operator"],
    "IS NULL"
  ),
  ch(205, "LIMIT Without ORDER", "LIMIT without ORDER BY returns arbitrary rows.", 50, 3, "sql", "Beginner",
    `SELECT * FROM products LIMIT 10;`,
    `SELECT * FROM products ORDER BY id LIMIT 10;`,
    "No ORDER BY — results are unpredictable",
    "Different rows returned each time",
    ["Always pair LIMIT with ORDER BY", "ORDER BY id for consistent results"],
    "ORDER BY"
  ),
  ch(206, "LIKE Without Wildcard", "LIKE without % acts like = but slower.", 45, 3, "sql", "Beginner",
    `SELECT * FROM users WHERE name LIKE 'alice';`,
    `SELECT * FROM users WHERE name = 'alice';`,
    "LIKE without wildcard is inefficient equivalent of =",
    "Works but can't use index efficiently",
    ["Use = for exact matches", "LIKE is for patterns with % or _"],
    "= 'alice'"
  ),
  ch(207, "Duplicate INSERT", "INSERT without uniqueness check creates duplicates.", 55, 3, "sql", "Beginner",
    `INSERT INTO tags (name) VALUES ('python');`,
    `INSERT OR IGNORE INTO tags (name) VALUES ('python');`,
    "No uniqueness constraint — duplicate entries created",
    "Multiple 'python' tags created",
    ["Use INSERT OR IGNORE or INSERT ... ON CONFLICT", "Add UNIQUE constraint on the column"],
    "INSERT OR IGNORE"
  ),
  ch(208, "Implicit Conversion", "Comparing string column with number forces conversion.", 50, 3, "sql", "Beginner",
    `SELECT * FROM users WHERE phone_number = 5551234;`,
    `SELECT * FROM users WHERE phone_number = '5551234';`,
    "String compared to number — implicit type conversion",
    "May miss matches or use wrong index",
    ["Quote numbers that are string data", "phone_number is VARCHAR — use quotes"],
    "'5551234'"
  ),
  ch(209, "SELECT * Anti-Pattern", "SELECT * returns unnecessary columns.", 45, 3, "sql", "Beginner",
    `SELECT * FROM users;`,
    `SELECT id, name, email FROM users;`,
    "SELECT * fetches all columns wastefully",
    "Extra data transferred over the network",
    ["Specify only the columns you need", "SELECT id, name, email"],
    "SELECT id, name, email"
  ),
  ch(210, "Missing GROUP BY", "Aggregate without GROUP BY returns one row.", 55, 3, "sql", "Beginner",
    `SELECT department, COUNT(*) FROM employees;`,
    `SELECT department, COUNT(*) FROM employees GROUP BY department;`,
    "Mixing aggregate and non-aggregate columns",
    "One row with wrong department name",
    ["Add GROUP BY for non-aggregate columns", "GROUP BY department"],
    "GROUP BY department"
  ),
];

const sqlIntermediate: Challenge[] = [
  ch(211, "N+1 Query Problem", "Loop fires one query per row.", 160, 5, "sql", "Intermediate",
    `SELECT id, name FROM users;\nSELECT COUNT(*) FROM orders WHERE user_id = ?;`,
    `SELECT u.id, u.name, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id, u.name;`,
    "N+1 queries — one per user",
    "400 queries for 400 users",
    ["Use JOIN with GROUP BY", "A single query replaces all N queries"],
    "LEFT JOIN orders"
  ),
  ch(212, "Cross Join Explosion", "Missing join condition creates Cartesian product.", 150, 5, "sql", "Intermediate",
    `SELECT u.name, o.total\nFROM users u, orders o;`,
    `SELECT u.name, o.total\nFROM users u\nJOIN orders o ON o.user_id = u.id;`,
    "No join condition = Cartesian product of all rows",
    "users × orders rows returned",
    ["Add ON clause for the join condition", "JOIN ... ON specifies the relationship"],
    "JOIN orders o ON"
  ),
  ch(213, "Subquery Returns Multiple", "Subquery used where scalar expected.", 140, 5, "sql", "Intermediate",
    `SELECT * FROM products\nWHERE category_id = (SELECT id FROM categories WHERE name = 'Electronics');`,
    `SELECT * FROM products\nWHERE category_id IN (SELECT id FROM categories WHERE name = 'Electronics');`,
    "Subquery might return multiple rows",
    "Subquery returns more than 1 row error",
    ["Use IN instead of = for multi-row subquery", "= expects exactly one row"],
    "IN (SELECT"
  ),
  ch(214, "HAVING vs WHERE", "Filtering aggregate result with WHERE.", 140, 5, "sql", "Intermediate",
    `SELECT department, AVG(salary)\nFROM employees\nWHERE AVG(salary) > 50000\nGROUP BY department;`,
    `SELECT department, AVG(salary)\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 50000;`,
    "WHERE can't filter aggregate results",
    "Aggregate functions not allowed in WHERE clause",
    ["Use HAVING for aggregate filters", "WHERE filters rows, HAVING filters groups"],
    "HAVING AVG(salary)"
  ),
  ch(215, "Self Join Alias", "Joining table to itself needs LEFT JOIN.", 130, 5, "sql", "Intermediate",
    `SELECT e1.name, e2.name as manager\nFROM employees e1\nJOIN employees e2 ON e1.manager_id = e2.id;`,
    `SELECT e1.name, e2.name as manager\nFROM employees e1\nLEFT JOIN employees e2 ON e1.manager_id = e2.id;`,
    "Regular JOIN misses employees without managers",
    "CEO (no manager) not in results",
    ["Use LEFT JOIN for optional relationships", "LEFT JOIN keeps all left table rows"],
    "LEFT JOIN"
  ),
  ch(216, "OR Precedence with AND", "OR/AND precedence groups differently than intended.", 150, 5, "sql", "Intermediate",
    `SELECT * FROM users\nWHERE status = 'active' AND role = 'admin' OR created_at > '2024-01-01';`,
    `SELECT * FROM users\nWHERE status = 'active' AND (role = 'admin' OR created_at > '2024-01-01');`,
    "AND binds tighter than OR in SQL",
    "Returns inactive users created after Jan 2024",
    ["Add parentheses around the OR condition", "AND has higher precedence than OR"],
    "AND (role"
  ),
  ch(217, "CASE Missing ELSE", "CASE expression without ELSE returns NULL.", 120, 5, "sql", "Intermediate",
    `SELECT name,\n    CASE WHEN score >= 90 THEN 'A'\n         WHEN score >= 80 THEN 'B'\n    END as grade\nFROM students;`,
    `SELECT name,\n    CASE WHEN score >= 90 THEN 'A'\n         WHEN score >= 80 THEN 'B'\n         ELSE 'C'\n    END as grade\nFROM students;`,
    "No ELSE clause — unmatched rows get NULL",
    "Students with score < 80 get NULL grade",
    ["Add an ELSE clause", "ELSE handles all unmatched cases"],
    "ELSE"
  ),
  ch(218, "DISTINCT on Join", "DISTINCT hides the real problem of row multiplication.", 140, 5, "sql", "Intermediate",
    `SELECT DISTINCT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id;`,
    `SELECT u.name, SUM(o.total) as total\nFROM users u\nJOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.name;`,
    "DISTINCT masks multiple order rows per user",
    "Multiple rows per user if they have multiple orders",
    ["Aggregate with GROUP BY instead of DISTINCT", "Use SUM() with GROUP BY"],
    "SUM(o.total)"
  ),
  ch(219, "Window Function Percentage", "Window function correct but missing percentage calc.", 160, 6, "sql", "Intermediate",
    `SELECT name, salary, MAX(salary) OVER (PARTITION BY department)\nFROM employees;`,
    `SELECT name, salary,\n    MAX(salary) OVER (PARTITION BY department) as dept_max,\n    salary * 100.0 / MAX(salary) OVER (PARTITION BY department) as pct_of_max\nFROM employees;`,
    "Can't calculate percentage without the comparison",
    "Missing percentage of department max",
    ["Add the percentage calculation", "Divide salary by dept_max * 100"],
    "pct_of_max"
  ),
  ch(220, "Index Not Used", "Function on indexed column prevents index usage.", 150, 5, "sql", "Intermediate",
    `SELECT * FROM users WHERE YEAR(created_at) = 2024;`,
    `SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';`,
    "YEAR() function prevents index usage (full scan)",
    "Full table scan instead of index seek",
    ["Don't wrap indexed column in a function", "Use range comparison for index usage"],
    "created_at >="
  ),
];

const sqlAdvanced: Challenge[] = [
  ch(221, "Deadlock via Update Order", "Two transactions update rows in different order.", 260, 8, "sql", "Advanced",
    `-- Transaction 1\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\n\n-- Transaction 2\nUPDATE accounts SET balance = balance - 50 WHERE id = 2;\nUPDATE accounts SET balance = balance + 50 WHERE id = 1;`,
    `UPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;`,
    "Different update order between transactions = deadlock",
    "Deadlock detected — one transaction killed",
    ["Always update rows in the same order", "Order by ID: always lock row 1 before row 2"],
    "WHERE id = 1"
  ),
  ch(222, "Transaction Isolation", "Phantom reads in REPEATABLE READ mode.", 240, 7, "sql", "Advanced",
    `SELECT COUNT(*) FROM orders;`,
    `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;`,
    "REPEATABLE READ prevents seeing new committed rows",
    "Second count still 100 — phantom reads blocked",
    ["Change isolation level to READ COMMITTED", "READ COMMITTED sees committed changes"],
    "READ COMMITTED"
  ),
  ch(223, "Recursive CTE Infinite", "Recursive CTE without termination condition.", 250, 8, "sql", "Advanced",
    `WITH RECURSIVE org_tree AS (\n    SELECT id, name, manager_id FROM employees WHERE manager_id IS NULL\n    UNION ALL\n    SELECT e.id, e.name, e.manager_id\n    FROM employees e\n    JOIN org_tree o ON e.manager_id = o.id\n)\nSELECT * FROM org_tree;`,
    `WITH RECURSIVE org_tree AS (\n    SELECT id, name, manager_id, 0 as depth FROM employees WHERE manager_id IS NULL\n    UNION ALL\n    SELECT e.id, e.name, e.manager_id, o.depth + 1\n    FROM employees e\n    JOIN org_tree o ON e.manager_id = o.id\n    WHERE o.depth < 10\n)\nSELECT * FROM org_tree;`,
    "No depth limit — cycles cause infinite recursion",
    "Infinite loop on circular manager references",
    ["Add a depth counter to track recursion level", "WHERE depth < 10 prevents infinite cycles"],
    "depth < 10"
  ),
  ch(224, "Materialized View Stale", "Materialized view not refreshed after data changes.", 230, 7, "sql", "Advanced",
    `CREATE MATERIALIZED VIEW mv_sales AS\nSELECT department, SUM(amount) as total FROM sales GROUP BY department;\n\nINSERT INTO sales VALUES (...);\n\nSELECT * FROM mv_sales;`,
    `REFRESH MATERIALIZED VIEW mv_sales;\nSELECT * FROM mv_sales;`,
    "Materialized views don't auto-update",
    "Stale data shown after INSERT",
    ["Manually refresh the materialized view", "REFRESH MATERIALIZED VIEW"],
    "REFRESH MATERIALIZED VIEW"
  ),
  ch(225, "Partial Index Miss", "Query doesn't match partial index condition.", 240, 8, "sql", "Advanced",
    `CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';\n\nSELECT * FROM users WHERE email = 'test@example.com' AND status != 'deleted';`,
    `SELECT * FROM users WHERE email = 'test@example.com' AND status = 'active';`,
    "Query filter doesn't match the partial index condition",
    "Full scan — partial index not used",
    ["Query WHERE must match index WHERE condition", "Use status = 'active' to match the partial index"],
    "status = 'active'"
  ),
  ch(226, "Lock Escalation", "Mass update escalates row locks to table lock.", 260, 8, "sql", "Advanced",
    `UPDATE inventory SET quantity = quantity - 1\nWHERE product_id IN (SELECT id FROM products WHERE category = 'electronics');`,
    `UPDATE inventory SET quantity = quantity - 1\nWHERE id IN (SELECT i.id FROM inventory i\n    JOIN products p ON i.product_id = p.id\n    WHERE p.category = 'electronics'\n    LIMIT 100);`,
    "Mass update escalates to table-level lock",
    "Table lock blocks all other transactions",
    ["Update in batches with LIMIT clause", "Avoid updating thousands of rows at once"],
    "LIMIT 100"
  ),
  ch(227, "NULL in NOT IN", "NOT IN with NULL subquery returns no rows.", 250, 8, "sql", "Advanced",
    `SELECT * FROM products\nWHERE category_id NOT IN (SELECT category_id FROM excluded_categories);`,
    `SELECT * FROM products\nWHERE category_id NOT IN (SELECT category_id FROM excluded_categories WHERE category_id IS NOT NULL);`,
    "NOT IN with any NULL in subquery returns zero rows",
    "Zero rows if subquery contains any NULL",
    ["NOT IN with NULL always evaluates to false", "Filter NULL out from the subquery"],
    "IS NOT NULL"
  ),
  ch(228, "Correlated Subquery Performance", "Correlated subquery runs once per outer row.", 240, 7, "sql", "Advanced",
    `SELECT u.name,\n    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count\nFROM users u;`,
    `SELECT u.name, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id, u.name;`,
    "Correlated subquery = one extra query per user",
    "N+1 performance problem",
    ["Replace with JOIN + GROUP BY", "A single query is much faster"],
    "LEFT JOIN orders"
  ),
  ch(229, "Trigger Side Effects", "Trigger causes cascading updates unintentionally.", 260, 8, "sql", "Advanced",
    `CREATE TRIGGER update_timestamp\nAFTER UPDATE ON orders\nFOR EACH ROW\nBEGIN\n    UPDATE customers SET updated_at = NOW()\n    WHERE id = NEW.customer_id;\nEND;`,
    `CREATE TRIGGER update_timestamp\nAFTER UPDATE ON orders\nFOR EACH ROW\nWHEN (OLD.status IS DISTINCT FROM NEW.status)\nBEGIN\n    UPDATE customers SET updated_at = NOW()\n    WHERE id = NEW.customer_id;\nEND;`,
    "Trigger fires on every update, even trivial ones",
    "customers table hammered on every order change",
    ["Add WHEN clause to limit trigger scope", "Only fire when status actually changes"],
    "WHEN"
  ),
  ch(230, "Partition Pruning Fail", "Query function prevents partition pruning.", 250, 8, "sql", "Advanced",
    `SELECT * FROM sales WHERE EXTRACT(YEAR FROM sale_date) = 2024;`,
    `SELECT * FROM sales WHERE sale_date >= '2024-01-01' AND sale_date < '2025-01-01';`,
    "EXTRACT function prevents partition pruning",
    "All partitions scanned instead of just 2024",
    ["Don't wrap partition key in a function", "Use range comparison for pruning"],
    "sale_date >="
  ),
];

const sqlNightmare: Challenge[] = [
  ch(231, "MVCC Bloat", "Long transactions prevent vacuum cleanup.", 300, 10, "sql", "Nightmare",
    `BEGIN;\nSELECT * FROM large_table;\n-- (transaction stays open while doing other work)`,
    `BEGIN;\nSELECT * FROM large_table;\nCOMMIT;\n\n-- Process other work outside transaction`,
    "Long open transactions prevent dead row cleanup",
    "Table bloat — disk usage grows unbounded",
    ["Keep transactions as short as possible", "Commit before doing non-DB work"],
    "COMMIT"
  ),
  ch(232, "Index B-Tree Split", "Sequential inserts cause B-tree page splits.", 280, 9, "sql", "Nightmare",
    `CREATE TABLE logs (\n    id SERIAL PRIMARY KEY,\n    message TEXT,\n    created_at TIMESTAMP DEFAULT NOW()\n);`,
    `CREATE TABLE logs (\n    id SERIAL PRIMARY KEY,\n    message TEXT,\n    created_at TIMESTAMP DEFAULT NOW()\n) WITH (fillfactor = 70);`,
    "Pages fill to 100% then split on every insert",
    "Frequent B-tree page splits degrade performance",
    ["Set fillfactor below 100% to leave room for growth", "WITH (fillfactor = 70) prevents constant splitting"],
    "fillfactor"
  ),
  ch(233, "Lock Timeout Cascade", "No lock timeout — transactions wait forever.", 320, 10, "sql", "Nightmare",
    `BEGIN;\nUPDATE accounts SET balance = 1000 WHERE id = 1;`,
    `SET lock_timeout = '5s';\nBEGIN;\nUPDATE accounts SET balance = 2000 WHERE id = 1;`,
    "No lock timeout — transactions wait indefinitely",
    "Indefinite wait or application-level timeout",
    ["Set lock_timeout at the session level", "SET lock_timeout = '5s' prevents forever waits"],
    "lock_timeout"
  ),
  ch(234, "Connection Pool Exhaustion", "Leaked connections exhaust the pool.", 310, 10, "sql", "Nightmare",
    `for i in range(1000):\n    conn = psycopg2.connect(dsn)\n    cur = conn.cursor()\n    cur.execute("SELECT 1")`,
    `for i in range(1000):\n    with psycopg2.connect(dsn) as conn:\n        with conn.cursor() as cur:\n            cur.execute("SELECT 1")`,
    "Connections never closed — pool exhausted",
    "FATAL: too many connections for role",
    ["Use context managers (with) for auto-cleanup", "with auto-closes connections"],
    "with psycopg2.connect"
  ),
  ch(235, "Replication Lag", "Reading from replica immediately after write.", 300, 10, "sql", "Nightmare",
    `INSERT INTO orders (user_id, total) VALUES (1, 99.99);\nSELECT * FROM orders WHERE user_id = 1;`,
    `INSERT INTO orders (user_id, total) VALUES (1, 99.99);\nSELECT * FROM orders WHERE user_id = 1;`,
    "Replica hasn't received the write yet",
    "Empty result — replication lag",
    ["Read from primary after a write", "Or use read-your-writes consistency"],
    "primary"
  ),
  ch(236, "Query Plan Cache Poison", "Cached plan bad for some parameter values.", 290, 9, "sql", "Nightmare",
    `PREPARE get_users(int) AS\nSELECT * FROM users WHERE status = $1;`,
    `EXECUTE get_users('deleted');`,
    "Generic plan may be suboptimal for some parameter values",
    "Sequential scan when index would be faster",
    ["Use custom plan for specific parameter values", "SET plan_cache_mode = force_custom_plan"],
    "force_custom_plan"
  ),
  ch(237, "TOAST Table Bloat", "Large text columns in TOAST grow unbounded.", 280, 9, "sql", "Nightmare",
    `CREATE TABLE documents (\n    id SERIAL PRIMARY KEY,\n    content TEXT,\n    updated_at TIMESTAMP\n);`,
    `CREATE TABLE documents (\n    id SERIAL PRIMARY KEY,\n    content TEXT,\n    updated_at TIMESTAMP\n) WITH (toast_tuple_target = 2048);`,
    "TOAST storage for large columns bloats over time",
    "Disk usage grows even after updates",
    ["Adjust toast_tuple_target for large text columns", "Schedule regular VACUUM FULL"],
    "toast_tuple_target"
  ),
  ch(238, "Hot Standby Conflict", "Long query on standby conflicts with WAL replay.", 310, 10, "sql", "Nightmare",
    `BEGIN;\nSELECT * FROM large_table;`,
    `SET statement_timeout = '5min';\nSELECT * FROM large_table;`,
    "Long query conflicts with WAL replay on standby",
    "Canceling statement due to conflict with recovery",
    ["Set statement_timeout to keep queries short", "Long queries on replicas cause conflicts"],
    "statement_timeout"
  ),
  ch(239, "Autovacuum Threshold", "Autovacuum doesn't run on rarely-updated tables.", 290, 9, "sql", "Nightmare",
    `CREATE TABLE audit_log (\n    id SERIAL PRIMARY KEY,\n    action TEXT,\n    timestamp TIMESTAMP\n);`,
    `ALTER TABLE audit_log SET (autovacuum_vacuum_threshold = 50000, autovacuum_analyze_threshold = 50000);`,
    "Default autovacuum thresholds too high for append-only table",
    "Table bloat — dead rows never cleaned",
    ["Lower autovacuum thresholds per-table", "ALTER TABLE SET (autovacuum...)"],
    "autovacuum_vacuum_threshold"
  ),
  ch(240, "Partitioned Table Constraint", "CHECK constraint on parent ignored by partitions.", 300, 10, "sql", "Nightmare",
    `CREATE TABLE events (\n    id SERIAL,\n    event_date DATE,\n    CHECK (event_date >= '2024-01-01' AND event_date < '2025-01-01')\n) PARTITION BY RANGE (event_date);`,
    `CREATE TABLE events_y2024 (\n    CHECK (event_date >= '2024-01-01' AND event_date < '2025-01-01')\n) PARTITION OF events;`,
    "CHECK on parent doesn't apply to child partitions",
    "Partition pruning doesn't work",
    ["Add CHECK constraints to each partition", "Each partition needs its own constraint for pruning"],
    "PARTITION BY RANGE"
  ),
];

/* ========= AUTO-GENERATED TRACKS HELPER ========= */
// Generates 40 realistic-looking practice challenges (10 per difficulty) for a new tech stack.
// Each challenge has a starter buggy snippet, a fix, and a `checkKey` used by the challenge validator.

interface StackTemplate {
  slug: string;
  name: string;
  icon: IconName;
  desc: string;
  accent: string;
  lang: string; // The display name
  monacoLang: string; // The technical ID
  problems: Array<{
    title: string;
    desc: string;
    bug: string;
    code: string;
    solution: string;
    checkKey: string;
    hints: string[];
    expectedError: string;
  }>;
}

const nextIdBase = { current: 1000 };

function buildTrack(tmpl: StackTemplate): Track {
  const perDiff = 10;
  const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced", "Nightmare"];
  const xpByDiff = { Beginner: 50, Intermediate: 140, Advanced: 250, Nightmare: 320 };
  const timeByDiff = { Beginner: 3, Intermediate: 5, Advanced: 8, Nightmare: 11 };

  const challenges: Challenge[] = [];
  difficulties.forEach((diff, di) => {
    for (let i = 0; i < perDiff; i++) {
      const src = tmpl.problems[(di * perDiff + i) % tmpl.problems.length];
      nextIdBase.current += 1;
      challenges.push({
        id: nextIdBase.current,
        title: src.title,
        desc: src.desc,
        xp: xpByDiff[diff] + i * 4,
        timeMin: timeByDiff[diff],
        lang: tmpl.lang,
        monacoLang: tmpl.monacoLang,
        difficulty: diff,
        code: src.code,
        solution: src.solution,
        bug: src.bug,
        expectedError: src.expectedError,
        hints: src.hints,
        checkKey: src.checkKey,
      });
    }
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
    problems: [
      { title: "Missing Route Method", desc: "POST route only accepts GET requests.", bug: "methods=['POST'] missing", code: `@app.route('/users')\ndef create():\n    return 'ok'`, solution: `@app.route('/users', methods=['POST'])\ndef create():\n    return 'ok'`, checkKey: "methods=['POST']", hints: ["Add methods parameter", "POST needs to be in methods list"], expectedError: "405 Method Not Allowed" },
      { title: "Request JSON None", desc: "request.json returns None on wrong content-type.", bug: "No force parsing", code: `data = request.json\nname = data['name']`, solution: `data = request.get_json(force=True)\nname = data['name']`, checkKey: "get_json(force=True)", hints: ["Use get_json()", "Force parameter"], expectedError: "AttributeError: NoneType" },
      { title: "Missing CORS", desc: "Frontend can't reach the API.", bug: "No CORS config", code: `app = Flask(__name__)`, solution: `from flask_cors import CORS\napp = Flask(__name__)\nCORS(app)`, checkKey: "CORS(app)", hints: ["Install flask-cors", "Wrap app in CORS()"], expectedError: "CORS error in browser" },
      { title: "Template Not Found", desc: "Jinja can't find the HTML file.", bug: "Missing folder", code: `return render_template('home.html')`, solution: `return render_template('home.html')  # ensure templates/ folder exists`, checkKey: "render_template('home.html')", hints: ["Templates folder required", "Check filename"], expectedError: "TemplateNotFound" },
      { title: "Session Without Secret", desc: "Sessions crash without secret_key.", bug: "No secret_key", code: `app = Flask(__name__)`, solution: `app = Flask(__name__)\napp.secret_key = 'change-me'`, checkKey: "secret_key", hints: ["Sessions need secret key", "Set app.secret_key"], expectedError: "RuntimeError: session unavailable" },
      { title: "SQL Injection Risk", desc: "Query concatenates user input.", bug: "f-string in SQL", code: `db.execute(f\"SELECT * FROM t WHERE name='{name}'\")`, solution: `db.execute(\"SELECT * FROM t WHERE name=?\", (name,))`, checkKey: "(name,)", hints: ["Use parameterized queries", "Placeholders with tuple"], expectedError: "SQL injection vulnerability" },
      { title: "Blueprint No Prefix", desc: "Blueprint routes not prefixed.", bug: "Missing url_prefix", code: `app.register_blueprint(api)`, solution: `app.register_blueprint(api, url_prefix='/api')`, checkKey: "url_prefix='/api'", hints: ["Pass url_prefix", "Prefix all blueprint routes"], expectedError: "404 on /api/*" },
      { title: "Debug Mode in Prod", desc: "debug=True exposes debugger.", bug: "debug=True", code: `app.run(debug=True)`, solution: `app.run(debug=False)`, checkKey: "debug=False", hints: ["Never debug=True in prod", "Set debug=False"], expectedError: "Security warning" },
      { title: "Missing Error Handler", desc: "500 errors show ugly HTML.", bug: "No handler", code: `@app.route('/x')\ndef x():\n    return None['a']`, solution: `@app.errorhandler(Exception)\ndef err(e):\n    return {'error': str(e)}, 500`, checkKey: "errorhandler", hints: ["Register error handler", "Return JSON for API"], expectedError: "HTML 500 page" },
      { title: "Static File Path", desc: "Static folder misconfigured.", bug: "Wrong folder name", code: `app = Flask(__name__, static_folder='assets')`, solution: `app = Flask(__name__, static_folder='static')`, checkKey: "static_folder='static'", hints: ["Use default 'static'", "Match actual folder"], expectedError: "404 on /static/*" },
      { title: "Missing @app.route", desc: "Function not registered as route.", bug: "No decorator", code: `def home():\n    return 'hi'`, solution: `@app.route('/')\ndef home():\n    return 'hi'`, checkKey: "@app.route('/')", hints: ["Add @app.route decorator", "Path required"], expectedError: "404 Not Found" },
      { title: "Response Wrong Type", desc: "Returning dict fails on older Flask.", bug: "Return dict directly", code: `return {'a': 1}`, solution: `from flask import jsonify\nreturn jsonify({'a': 1})`, checkKey: "jsonify", hints: ["Use jsonify()", "Wraps dict as JSON response"], expectedError: "TypeError on old Flask" },
    ],
  },
  {
    slug: "c", name: "C", icon: "c", desc: "Fix segfaults, leaks, and pointer bugs in C", accent: "#3b82f6", lang: "C", monacoLang: "c",
    problems: [
      { title: "Null Pointer Deref", desc: "Dereferencing NULL crashes the program.", bug: "No null check", code: `int *p = NULL;\nprintf(\"%d\", *p);`, solution: `int *p = NULL;\nif (p) printf(\"%d\", *p);`, checkKey: "if (p)", hints: ["Always check for NULL", "Guard the deref"], expectedError: "Segmentation fault" },
      { title: "Uninitialized Var", desc: "Using variable before assigning.", bug: "No init", code: `int x;\nprintf(\"%d\", x);`, solution: `int x = 0;\nprintf(\"%d\", x);`, checkKey: "int x = 0", hints: ["Initialize to 0", "Undefined behavior otherwise"], expectedError: "Garbage value printed" },
      { title: "Missing free()", desc: "Memory leak after malloc.", bug: "No free", code: `int *p = malloc(sizeof(int));\n*p = 5;`, solution: `int *p = malloc(sizeof(int));\n*p = 5;\nfree(p);`, checkKey: "free(p)", hints: ["Free every malloc", "Prevent leaks"], expectedError: "Memory leak" },
      { title: "Buffer Overflow", desc: "Writing past array bounds.", bug: "Off-by-one", code: `char buf[5];\nstrcpy(buf, \"hello\");`, solution: `char buf[6];\nstrcpy(buf, \"hello\");`, checkKey: "char buf[6]", hints: ["Include null terminator", "Size = strlen + 1"], expectedError: "Buffer overflow / stack smashing" },
      { title: "Wrong printf Format", desc: "Format string mismatches type.", bug: "%d for float", code: `float x = 3.14;\nprintf(\"%d\", x);`, solution: `float x = 3.14;\nprintf(\"%f\", x);`, checkKey: '"%f"', hints: ["Match format to type", "%f for float, %d for int"], expectedError: "Undefined output" },
      { title: "Integer Overflow", desc: "int can't hold large value.", bug: "int too small", code: `int x = 2147483647;\nx++;`, solution: `long long x = 2147483647;\nx++;`, checkKey: "long long x", hints: ["Use larger type", "long long for big numbers"], expectedError: "Overflow to negative" },
      { title: "Missing Return", desc: "Non-void function has no return.", bug: "No return", code: `int add(int a, int b) {\n    int c = a + b;\n}`, solution: `int add(int a, int b) {\n    return a + b;\n}`, checkKey: "return a + b", hints: ["Add return statement", "Non-void must return"], expectedError: "Undefined return value" },
      { title: "Double Free", desc: "Freeing pointer twice crashes.", bug: "Free called twice", code: `free(p);\nfree(p);`, solution: `free(p);\np = NULL;`, checkKey: "p = NULL", hints: ["Set to NULL after free", "Prevents double-free"], expectedError: "Double free detected" },
      { title: "Array Decay", desc: "sizeof on array parameter is wrong.", bug: "sizeof on pointer", code: `void f(int arr[]) {\n    int n = sizeof(arr)/sizeof(int);\n}`, solution: `void f(int arr[], int n) {\n    // use n directly\n}`, checkKey: "int n)", hints: ["Pass size as parameter", "Arrays decay to pointers"], expectedError: "Wrong size calculation" },
      { title: "Missing #include", desc: "Function not declared.", bug: "No stdio.h", code: `int main() {\n    printf(\"hi\");\n}`, solution: `#include <stdio.h>\nint main() {\n    printf(\"hi\");\n}`, checkKey: "#include <stdio.h>", hints: ["Include the header", "printf needs stdio.h"], expectedError: "Implicit declaration warning" },
      { title: "Assignment vs Compare", desc: "Using = instead of ==.", bug: "= in if", code: `if (x = 5) { }`, solution: `if (x == 5) { }`, checkKey: "x == 5", hints: ["= assigns, == compares", "Common typo"], expectedError: "Always true" },
      { title: "String Not Null Term", desc: "String missing null terminator.", bug: "No \\0", code: `char s[3] = {'h','i'};`, solution: `char s[3] = {'h','i','\\0'};`, checkKey: "'\\\\0'", hints: ["C strings need \\0", "Otherwise reads garbage"], expectedError: "Undefined string output" },
    ],
  },
  {
    slug: "cpp", name: "C++", icon: "cpp", desc: "Debug modern C++ code, STL, and templates", accent: "#60a5fa", lang: "C++", monacoLang: "cpp",
    problems: [
      { title: "Iterator Invalidation", desc: "Modifying vector during iteration.", bug: "erase in loop", code: `for (auto it = v.begin(); it != v.end(); ++it)\n    if (*it == 0) v.erase(it);`, solution: `v.erase(std::remove(v.begin(), v.end(), 0), v.end());`, checkKey: "std::remove", hints: ["Use erase-remove idiom", "Never modify while iterating"], expectedError: "Iterator invalidation crash" },
      { title: "Slicing Object", desc: "Copying derived to base slices data.", bug: "Value copy", code: `Base b = derived;`, solution: `Base& b = derived;`, checkKey: "Base& b", hints: ["Use reference or pointer", "Value copy slices"], expectedError: "Object slicing" },
      { title: "Missing Virtual Dtor", desc: "Base class dtor not virtual.", bug: "No virtual", code: `class Base { ~Base(){} };`, solution: `class Base { virtual ~Base(){} };`, checkKey: "virtual ~Base", hints: ["Base dtor must be virtual", "Otherwise leaks derived data"], expectedError: "Derived dtor not called" },
      { title: "Raw new/delete", desc: "Manual memory management leaks.", bug: "new without delete", code: `Widget *w = new Widget();`, solution: `auto w = std::make_unique<Widget>();`, checkKey: "make_unique", hints: ["Use smart pointers", "make_unique is safe"], expectedError: "Memory leak" },
      { title: "Reference to Temp", desc: "Reference to local var goes dangling.", bug: "Return local ref", code: `int& f() { int x = 5; return x; }`, solution: `int f() { int x = 5; return x; }`, checkKey: "int f()", hints: ["Return by value", "Local vars die on return"], expectedError: "Dangling reference" },
      { title: "auto Type Wrong", desc: "auto deduces unexpected type.", bug: "auto strips ref", code: `auto x = getRef();  // strips reference`, solution: `auto& x = getRef();`, checkKey: "auto& x", hints: ["Use auto& for reference", "auto strips ref/const"], expectedError: "Unnecessary copy" },
      { title: "std::move Misuse", desc: "Using moved-from object.", bug: "Use after move", code: `auto b = std::move(a);\ncout << a.data;`, solution: `auto b = std::move(a);\n// don't touch a`, checkKey: "// don't touch a", hints: ["Moved-from is empty", "Never use after move"], expectedError: "Undefined behavior" },
      { title: "Template Deduction", desc: "Template can't deduce type.", bug: "No explicit type", code: `auto x = std::max(1, 2.5);`, solution: `auto x = std::max<double>(1, 2.5);`, checkKey: "max<double>", hints: ["Specify template arg", "Mixed types fail deduction"], expectedError: "Template ambiguity" },
      { title: "Uninitialized Member", desc: "Class member never initialized.", bug: "No init", code: `class W { int x; };`, solution: `class W { int x = 0; };`, checkKey: "int x = 0", hints: ["Init in class body", "Or in constructor"], expectedError: "Garbage value" },
      { title: "Copy vs Move", desc: "Expensive copy where move works.", bug: "Copy in return", code: `vector<int> f() { vector<int> v; return v; }`, solution: `vector<int> f() { vector<int> v; return std::move(v); }`, checkKey: "std::move(v)", hints: ["Move on return", "Avoids copy"], expectedError: "Slow performance" },
      { title: "const Correctness", desc: "Method should be const.", bug: "Missing const", code: `int get() { return x; }`, solution: `int get() const { return x; }`, checkKey: "const {", hints: ["Add const after ()", "Marks method as read-only"], expectedError: "Can't call on const object" },
      { title: "Include Guard Missing", desc: "Header included multiple times.", bug: "No guard", code: `// widget.h\nclass Widget {};`, solution: `#pragma once\nclass Widget {};`, checkKey: "#pragma once", hints: ["Add #pragma once", "Or use ifndef guards"], expectedError: "Redefinition error" },
    ],
  },
  {
    slug: "java", name: "Java", icon: "java", desc: "Fix Java code and enterprise patterns", accent: "#f97316", lang: "Java", monacoLang: "java",
    problems: [
      { title: "NullPointerException", desc: "Calling method on null.", bug: "No null check", code: `String s = null;\nint n = s.length();`, solution: `String s = null;\nint n = (s != null) ? s.length() : 0;`, checkKey: "s != null", hints: ["Check for null first", "Or use Optional"], expectedError: "NullPointerException" },
      { title: "String == Compare", desc: "== compares references, not values.", bug: "Using ==", code: `if (a == b) { }`, solution: `if (a.equals(b)) { }`, checkKey: ".equals(b)", hints: ["Use .equals() for strings", "== is reference compare"], expectedError: "Wrong comparison result" },
      { title: "Integer Division", desc: "int/int loses decimals.", bug: "Both operands int", code: `double avg = sum / count;`, solution: `double avg = (double) sum / count;`, checkKey: "(double)", hints: ["Cast to double", "Prevents int truncation"], expectedError: "Truncated result" },
      { title: "ConcurrentModification", desc: "Modifying list during iteration.", bug: "list.remove in loop", code: `for (String s : list) if (s.isEmpty()) list.remove(s);`, solution: `list.removeIf(String::isEmpty);`, checkKey: "removeIf", hints: ["Use removeIf()", "Or Iterator.remove()"], expectedError: "ConcurrentModificationException" },
      { title: "Autoboxing Cache", desc: "Integer == fails outside cache.", bug: "== on Integer", code: `Integer a = 200, b = 200;\nif (a == b) { }`, solution: `Integer a = 200, b = 200;\nif (a.equals(b)) { }`, checkKey: "a.equals(b)", hints: ["Use equals() for Integer", "Cache is -128 to 127"], expectedError: "Fails for values > 127" },
      { title: "Try-With-Resources", desc: "Resource not closed on exception.", bug: "Manual close", code: `FileReader r = new FileReader(f);\nr.read();\nr.close();`, solution: `try (FileReader r = new FileReader(f)) {\n    r.read();\n}`, checkKey: "try (FileReader", hints: ["Use try-with-resources", "Auto-closes on exit"], expectedError: "Leaked file handle" },
      { title: "Missing @Override", desc: "Method doesn't actually override.", bug: "Typo, no annotation", code: `public void toStrng() { }`, solution: `@Override\npublic String toString() { return \"\"; }`, checkKey: "@Override", hints: ["Add @Override annotation", "Compiler catches typos"], expectedError: "Method not overriding" },
      { title: "Static Field Race", desc: "Static field accessed unsynchronized.", bug: "No sync", code: `static int count;\nvoid inc() { count++; }`, solution: `static AtomicInteger count = new AtomicInteger();\nvoid inc() { count.incrementAndGet(); }`, checkKey: "AtomicInteger", hints: ["Use AtomicInteger", "Or synchronized block"], expectedError: "Race condition" },
      { title: "Exception Swallow", desc: "Catch block does nothing.", bug: "Empty catch", code: `try { } catch (Exception e) { }`, solution: `try { } catch (Exception e) { logger.error(e); throw e; }`, checkKey: "throw e", hints: ["Log and rethrow", "Never silently swallow"], expectedError: "Silent failures" },
      { title: "Immutable Broken", desc: "Class exposes internal list.", bug: "Return direct ref", code: `List<String> getItems() { return items; }`, solution: `List<String> getItems() { return Collections.unmodifiableList(items); }`, checkKey: "unmodifiableList", hints: ["Return unmodifiable view", "Or defensive copy"], expectedError: "External mutation possible" },
      { title: "Wrong Collection", desc: "Using ArrayList for lookups.", bug: "O(n) lookup", code: `List<String> ids = new ArrayList<>();\nboolean has = ids.contains(x);`, solution: `Set<String> ids = new HashSet<>();\nboolean has = ids.contains(x);`, checkKey: "HashSet", hints: ["Use Set for lookups", "O(1) contains"], expectedError: "Slow performance" },
      { title: "String Concat Loop", desc: "Building string with + in loop.", bug: "String +", code: `String s = \"\";\nfor (int i=0;i<n;i++) s += i;`, solution: `StringBuilder sb = new StringBuilder();\nfor (int i=0;i<n;i++) sb.append(i);\nString s = sb.toString();`, checkKey: "StringBuilder", hints: ["Use StringBuilder", "String is immutable"], expectedError: "O(n^2) performance" },
    ],
  },
  {
    slug: "django", name: "Django", icon: "django", desc: "Fix Django models, views, and ORM issues", accent: "#10b981", lang: "Django", monacoLang: "python",
    problems: [
      { title: "N+1 in Template", desc: "Template loops trigger DB queries.", bug: "No select_related", code: `books = Book.objects.all()`, solution: `books = Book.objects.select_related('author').all()`, checkKey: "select_related", hints: ["Use select_related for FK", "prefetch_related for M2M"], expectedError: "N+1 queries" },
      { title: "Missing CSRF", desc: "Form submission blocked by CSRF.", bug: "No csrf_token", code: `<form method='post'>`, solution: `<form method='post'>{% csrf_token %}`, checkKey: "{% csrf_token %}", hints: ["Add csrf_token tag", "Required for POST"], expectedError: "403 Forbidden" },
      { title: "Migration Not Applied", desc: "Model changed but no migration.", bug: "No makemigrations", code: `# model changed`, solution: `python manage.py makemigrations\npython manage.py migrate`, checkKey: "makemigrations", hints: ["Run makemigrations", "Then migrate"], expectedError: "Column doesn't exist" },
      { title: "URL Reverse Error", desc: "URL name doesn't match.", bug: "Wrong name", code: `reverse('user-detail')`, solution: `reverse('users:detail')`, checkKey: "'users:detail'", hints: ["Include namespace", "Check urls.py app_name"], expectedError: "NoReverseMatch" },
      { title: "Manager vs QuerySet", desc: "Calling .all() unnecessarily.", bug: "Extra .all()", code: `User.objects.all().filter(active=True)`, solution: `User.objects.filter(active=True)`, checkKey: "User.objects.filter", hints: ["Filter directly", ".all() is redundant"], expectedError: "Slower query" },
      { title: "auto_now_add on Update", desc: "Timestamp doesn't update.", bug: "auto_now_add", code: `updated = models.DateTimeField(auto_now_add=True)`, solution: `updated = models.DateTimeField(auto_now=True)`, checkKey: "auto_now=True", hints: ["auto_now for updates", "auto_now_add is create-only"], expectedError: "Timestamp never updates" },
      { title: "SECRET_KEY Committed", desc: "Secret in settings.py.", bug: "Hardcoded", code: `SECRET_KEY = 'abc123'`, solution: `import os\nSECRET_KEY = os.environ['SECRET_KEY']`, checkKey: "os.environ['SECRET_KEY']", hints: ["Use environment var", "Never commit secrets"], expectedError: "Security risk" },
      { title: "DEBUG in Production", desc: "DEBUG=True in production.", bug: "DEBUG=True", code: `DEBUG = True`, solution: `DEBUG = False`, checkKey: "DEBUG = False", hints: ["Set DEBUG=False in prod", "Exposes stack traces"], expectedError: "Info disclosure" },
      { title: "Missing Related Name", desc: "Reverse relation ambiguous.", bug: "No related_name", code: `author = models.ForeignKey(User, on_delete=CASCADE)`, solution: `author = models.ForeignKey(User, on_delete=CASCADE, related_name='books')`, checkKey: "related_name='books'", hints: ["Add related_name", "Enables user.books.all()"], expectedError: "Related manager unclear" },
      { title: "get() Multiple Objects", desc: "get() finds more than one.", bug: "get() when many match", code: `User.objects.get(city='NY')`, solution: `User.objects.filter(city='NY').first()`, checkKey: ".filter(city='NY').first()", hints: ["Use filter().first()", "get() throws on multiple"], expectedError: "MultipleObjectsReturned" },
      { title: "Signal Loop", desc: "post_save signal saves again.", bug: "Infinite loop", code: `@receiver(post_save, sender=User)\ndef h(sender, instance, **kw):\n    instance.save()`, solution: `@receiver(post_save, sender=User)\ndef h(sender, instance, created, **kw):\n    if created:\n        User.objects.filter(pk=instance.pk).update(x=1)`, checkKey: ".update(x=1)", hints: ["Use .update() not .save()", "Or check 'created' flag"], expectedError: "Infinite recursion" },
      { title: "Static Files 404", desc: "Static files not served.", bug: "No STATIC_URL", code: `# no config`, solution: `STATIC_URL = '/static/'\nSTATICFILES_DIRS = [BASE_DIR / 'static']`, checkKey: "STATIC_URL = '/static/'", hints: ["Set STATIC_URL", "Configure STATICFILES_DIRS"], expectedError: "404 on /static/*" },
    ],
  },
  {
    slug: "git", name: "Git", icon: "git", desc: "Fix Git configuration and workflow errors", accent: "#f97316", lang: "Git", monacoLang: "shell",
    problems: [
      { title: "Committed Secret", desc: "API key pushed to repo.", bug: "Secret in history", code: `git add .env\ngit commit -m 'add'`, solution: `git rm --cached .env\necho '.env' >> .gitignore\ngit filter-branch --index-filter 'git rm --cached --ignore-unmatch .env' HEAD`, checkKey: "filter-branch", hints: ["Rewrite history", "Rotate the secret too"], expectedError: "Secret exposed" },
      { title: "Detached HEAD", desc: "Committing without a branch.", bug: "Detached", code: `git checkout abc123\n# make commits`, solution: `git checkout -b my-fix abc123`, checkKey: "checkout -b", hints: ["Create branch first", "Commits get lost otherwise"], expectedError: "Commits lost on switch" },
      { title: "Merge Conflict Left", desc: "<<<<<<< marker in code.", bug: "Unresolved conflict", code: `<<<<<<< HEAD\nfoo\n=======\nbar\n>>>>>>> branch`, solution: `foo\nbar`, checkKey: "foo\\nbar", hints: ["Manually resolve", "Remove markers"], expectedError: "Syntax error" },
      { title: "Force Push Disaster", desc: "git push --force overwrote work.", bug: "--force", code: `git push --force`, solution: `git push --force-with-lease`, checkKey: "--force-with-lease", hints: ["Use --force-with-lease", "Safer than --force"], expectedError: "Team lost commits" },
      { title: "Wrong Author", desc: "Commit author is wrong.", bug: "Wrong config", code: `git commit -m 'x'`, solution: `git config user.email 'me@example.com'\ngit commit --amend --reset-author`, checkKey: "--amend --reset-author", hints: ["Set user.email", "Amend to fix author"], expectedError: "Wrong contributor" },
      { title: "Rebase Onto Main", desc: "Feature branch behind main.", bug: "Not rebased", code: `git checkout feature\n# no rebase`, solution: `git checkout feature\ngit rebase main`, checkKey: "git rebase main", hints: ["Rebase onto main", "Keeps history linear"], expectedError: "Merge conflicts on PR" },
      { title: "Untracked in gitignore", desc: "gitignore has no effect.", bug: "Already tracked", code: `# .gitignore ignored`, solution: `git rm --cached file.log\necho 'file.log' >> .gitignore`, checkKey: "rm --cached", hints: ["Untrack first", "Then add to gitignore"], expectedError: ".gitignore ignored for tracked files" },
      { title: "Stash Lost", desc: "git stash pop gave conflicts.", bug: "Lost stash", code: `git stash pop\n# conflicts`, solution: `git stash list\ngit stash apply stash@{0}`, checkKey: "stash apply", hints: ["Use apply not pop", "Keeps stash intact"], expectedError: "Stash removed on conflict" },
      { title: "Wrong Remote URL", desc: "Pushing to wrong repo.", bug: "Bad remote", code: `git remote -v\n# origin: wrong.git`, solution: `git remote set-url origin git@github.com:me/right.git`, checkKey: "remote set-url", hints: ["Update remote URL", "Verify with -v"], expectedError: "Push fails or wrong destination" },
      { title: "Commit on Main", desc: "Should be on feature branch.", bug: "Direct commit", code: `# committed to main`, solution: `git branch feature\ngit reset --hard origin/main\ngit checkout feature`, checkKey: "reset --hard origin/main", hints: ["Save commit on branch", "Reset main to remote"], expectedError: "Main has WIP" },
      { title: "Submodule Empty", desc: "Cloned repo has empty submodules.", bug: "No --recurse", code: `git clone url.git`, solution: `git clone --recurse-submodules url.git`, checkKey: "--recurse-submodules", hints: ["Add --recurse-submodules", "Or git submodule init"], expectedError: "Submodule folders empty" },
      { title: "Line Ending Mess", desc: "CRLF vs LF causing diffs.", bug: "No .gitattributes", code: `# no config`, solution: `echo '* text=auto' > .gitattributes`, checkKey: "text=auto", hints: ["Add .gitattributes", "Normalizes line endings"], expectedError: "Whole file marked changed" },
    ],
  },
  {
    slug: "node", name: "Node.js", icon: "node", desc: "Debug Node.js server-side code", accent: "#22c55e", lang: "Node.js", monacoLang: "javascript",
    problems: [
      { title: "Callback Hell", desc: "Nested callbacks are unreadable.", bug: "Nested callbacks", code: `fs.readFile(a, (e,d) => fs.readFile(b, (e,d2) => { }));`, solution: `const d = await fs.promises.readFile(a);\nconst d2 = await fs.promises.readFile(b);`, checkKey: "await fs.promises", hints: ["Use promises + async/await", "Flat is better"], expectedError: "Unreadable code" },
      { title: "Unhandled Promise", desc: "Promise rejection crashes process.", bug: "No .catch", code: `fetchData().then(handle);`, solution: `fetchData().then(handle).catch(console.error);`, checkKey: ".catch(", hints: ["Always add .catch()", "Or try/catch with await"], expectedError: "UnhandledPromiseRejection" },
      { title: "Sync in Async", desc: "readFileSync blocks event loop.", bug: "Sync API", code: `const d = fs.readFileSync(f);`, solution: `const d = await fs.promises.readFile(f);`, checkKey: "await fs.promises.readFile", hints: ["Use async API", "Never block event loop"], expectedError: "Server freezes" },
      { title: "Missing await", desc: "Function returns Promise, not value.", bug: "Forgot await", code: `const data = fetch(url);\nconsole.log(data.body);`, solution: `const data = await fetch(url);\nconsole.log(data.body);`, checkKey: "await fetch", hints: ["Add await before fetch", "data is a Promise otherwise"], expectedError: "undefined property" },
      { title: "Event Listener Leak", desc: "Listeners added forever.", bug: "No remove", code: `emitter.on('data', h);`, solution: `emitter.once('data', h);`, checkKey: "emitter.once", hints: ["Use .once() for one-time", "Or removeListener"], expectedError: "MaxListenersExceeded" },
      { title: "process.env Missing", desc: "Env var is undefined.", bug: "No fallback", code: `const port = process.env.PORT;`, solution: `const port = process.env.PORT || 3000;`, checkKey: "|| 3000", hints: ["Provide default", "Env vars may be undefined"], expectedError: "Undefined port" },
      { title: "require() in ESM", desc: "Mixing CommonJS and ESM.", bug: "require in .mjs", code: `const x = require('foo');`, solution: `import x from 'foo';`, checkKey: "import x from", hints: ["Use import in ESM", "Or rename to .cjs"], expectedError: "require not defined" },
      { title: "Streams Not Piped", desc: "Buffering entire file in memory.", bug: "readFile then write", code: `const d = await fs.promises.readFile(a);\nawait fs.promises.writeFile(b, d);`, solution: `fs.createReadStream(a).pipe(fs.createWriteStream(b));`, checkKey: "createReadStream", hints: ["Use streams for large files", "pipe() avoids memory"], expectedError: "Out of memory" },
      { title: "Path Traversal", desc: "User input in file path.", bug: "No validation", code: `res.sendFile(req.query.name);`, solution: `res.sendFile(path.join(__dirname, path.basename(req.query.name)));`, checkKey: "path.basename", hints: ["Sanitize path", "Use path.basename"], expectedError: "Directory traversal attack" },
      { title: "Missing CORS", desc: "Browser blocks API calls.", bug: "No CORS", code: `app.get('/api', handler);`, solution: `const cors = require('cors');\napp.use(cors());`, checkKey: "app.use(cors())", hints: ["Install cors package", "app.use(cors())"], expectedError: "CORS error" },
      { title: "JSON Parse Crash", desc: "Invalid JSON crashes server.", bug: "No try/catch", code: `const data = JSON.parse(body);`, solution: `let data;\ntry { data = JSON.parse(body); } catch { return res.status(400).end(); }`, checkKey: "try { data = JSON.parse", hints: ["Wrap in try/catch", "Return 400 on bad input"], expectedError: "SyntaxError: Unexpected token" },
      { title: "Missing helmet", desc: "No security headers.", bug: "No helmet", code: `app.use(express.json());`, solution: `const helmet = require('helmet');\napp.use(helmet());\napp.use(express.json());`, checkKey: "app.use(helmet())", hints: ["Add helmet middleware", "Sets security headers"], expectedError: "Missing X-Frame-Options etc" },
    ],
  },
  {
    slug: "aspnet", name: "ASP.NET", icon: "aspnet", desc: "Fix ASP.NET Core web APIs and MVC apps", accent: "#8b5cf6", lang: "ASP.NET", monacoLang: "csharp",
    problems: [
      { title: "Missing [ApiController]", desc: "Model validation not automatic.", bug: "No attribute", code: `public class UsersController : ControllerBase { }`, solution: `[ApiController]\npublic class UsersController : ControllerBase { }`, checkKey: "[ApiController]", hints: ["Add [ApiController]", "Auto-validates model state"], expectedError: "Manual ModelState checks needed" },
      { title: "DI Scope Wrong", desc: "Scoped service in singleton.", bug: "AddSingleton", code: `services.AddSingleton<IUserService, UserService>();`, solution: `services.AddScoped<IUserService, UserService>();`, checkKey: "AddScoped", hints: ["Use AddScoped for DB services", "Singleton captures DB context"], expectedError: "Cannot resolve scoped service" },
      { title: "Await Async in Ctor", desc: "Can't await in constructor.", bug: "Blocking .Result", code: `public Ctor() { var x = LoadAsync().Result; }`, solution: `public static async Task<Class> CreateAsync() { var x = await LoadAsync(); return new Class(x); }`, checkKey: "async Task<Class>", hints: ["Use static factory", "Ctors can't be async"], expectedError: "Deadlock in .NET Framework" },
      { title: "Missing CORS Policy", desc: "Frontend blocked.", bug: "No CORS", code: `services.AddControllers();`, solution: `services.AddCors(o => o.AddDefaultPolicy(b => b.AllowAnyOrigin()));\napp.UseCors();`, checkKey: "AddCors", hints: ["Add CORS service", "Call app.UseCors()"], expectedError: "CORS error" },
      { title: "Config Not Loaded", desc: "appsettings.json ignored.", bug: "Wrong path", code: `var s = config['MyKey'];`, solution: `var s = config.GetValue<string>(\"MyKey\");`, checkKey: "GetValue<string>", hints: ["Use GetValue<T>", "Or GetSection"], expectedError: "Null value" },
      { title: "Sync Over Async", desc: "Calling .Result blocks thread.", bug: ".Result", code: `var r = fetchAsync().Result;`, solution: `var r = await fetchAsync();`, checkKey: "await fetchAsync", hints: ["Use await", "Never .Result in async"], expectedError: "Thread pool exhaustion" },
      { title: "Missing [FromBody]", desc: "POST body not deserialized.", bug: "No attribute", code: `public IActionResult Post(User u) { }`, solution: `public IActionResult Post([FromBody] User u) { }`, checkKey: "[FromBody]", hints: ["Add [FromBody]", "Explicit binding source"], expectedError: "Model is null" },
      { title: "DbContext Not Disposed", desc: "Manual new of DbContext.", bug: "Not disposed", code: `var ctx = new AppDbContext();`, solution: `using var ctx = new AppDbContext();`, checkKey: "using var ctx", hints: ["Use 'using' declaration", "Or inject via DI"], expectedError: "Connection leak" },
      { title: "Missing Authorize", desc: "Endpoint exposed to public.", bug: "No [Authorize]", code: `public IActionResult GetSecret() { }`, solution: `[Authorize]\npublic IActionResult GetSecret() { }`, checkKey: "[Authorize]", hints: ["Add [Authorize]", "Restricts to logged-in"], expectedError: "Unauthenticated access" },
      { title: "SQL Injection", desc: "String concat in query.", bug: "String interpolation", code: `ctx.Users.FromSqlRaw($\"SELECT * FROM Users WHERE Name='{name}'\");`, solution: `ctx.Users.FromSqlRaw(\"SELECT * FROM Users WHERE Name={0}\", name);`, checkKey: "FromSqlRaw(\"SELECT * FROM Users WHERE Name={0}\"", hints: ["Use parameterized queries", "Placeholders + args"], expectedError: "SQL injection" },
      { title: "Options Pattern", desc: "Hardcoded config.", bug: "Direct read", code: `var url = \"https://api.example.com\";`, solution: `services.Configure<ApiOpts>(config.GetSection(\"Api\"));`, checkKey: "services.Configure<ApiOpts>", hints: ["Use IOptions<T>", "Bind config section"], expectedError: "Not configurable" },
      { title: "Circular Reference JSON", desc: "Serialization loop crashes.", bug: "Nav prop loop", code: `return Ok(user); // has Posts, Posts have User`, solution: `services.AddControllers().AddJsonOptions(o => o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);`, checkKey: "ReferenceHandler.IgnoreCycles", hints: ["Configure JSON options", "Ignore cycles"], expectedError: "JsonException on cycle" },
    ],
  },
  {
    slug: "rust", name: "Rust", icon: "rust", desc: "Fix ownership, borrowing, and lifetime issues", accent: "#ea580c", lang: "Rust", monacoLang: "rust",
    problems: [
      { title: "Move After Use", desc: "Value moved and used again.", bug: "Use after move", code: `let s = String::from(\"hi\");\nlet t = s;\nprintln!(\"{}\", s);`, solution: `let s = String::from(\"hi\");\nlet t = s.clone();\nprintln!(\"{}\", s);`, checkKey: "s.clone()", hints: ["Clone or borrow", "String is not Copy"], expectedError: "borrow of moved value" },
      { title: "Mutable Borrow Conflict", desc: "Two mutable borrows.", bug: "Two &mut", code: `let mut v = vec![1];\nlet a = &mut v;\nlet b = &mut v;`, solution: `let mut v = vec![1];\nlet a = &mut v;\na.push(2);\nlet b = &mut v;`, checkKey: "a.push(2);\\nlet b", hints: ["Only one &mut at a time", "Or use RefCell"], expectedError: "cannot borrow as mutable more than once" },
      { title: "Lifetime Missing", desc: "Compiler needs lifetime.", bug: "No 'a", code: `fn f(x: &str, y: &str) -> &str { x }`, solution: `fn f<'a>(x: &'a str, y: &str) -> &'a str { x }`, checkKey: "<'a>", hints: ["Add lifetime parameter", "Tie return to input"], expectedError: "missing lifetime specifier" },
      { title: "Unwrap on None", desc: "Panic on Option::None.", bug: ".unwrap()", code: `let x: Option<i32> = None;\nlet v = x.unwrap();`, solution: `let x: Option<i32> = None;\nlet v = x.unwrap_or(0);`, checkKey: ".unwrap_or(0)", hints: ["Use unwrap_or", "Or match on Some/None"], expectedError: "thread panicked: called Option::unwrap on None" },
      { title: "String vs &str", desc: "Wrong type in function.", bug: "String param", code: `fn greet(name: String) { }\ngreet(&s);`, solution: `fn greet(name: &str) { }\ngreet(&s);`, checkKey: "name: &str", hints: ["Accept &str", "More flexible"], expectedError: "expected String, found &str" },
      { title: "Vec Reallocation", desc: "Push invalidates references.", bug: "Ref then push", code: `let mut v = vec![1,2];\nlet r = &v[0];\nv.push(3);\nprintln!(\"{}\", r);`, solution: `let mut v = vec![1,2];\nv.push(3);\nlet r = &v[0];\nprintln!(\"{}\", r);`, checkKey: "v.push(3);\\nlet r", hints: ["Push before borrowing", "Or reserve capacity"], expectedError: "cannot borrow as mutable" },
      { title: "Missing derive", desc: "Can't print struct.", bug: "No Debug derive", code: `struct P { x: i32 }\nprintln!(\"{:?}\", P{x:1});`, solution: `#[derive(Debug)]\nstruct P { x: i32 }\nprintln!(\"{:?}\", P{x:1});`, checkKey: "#[derive(Debug)]", hints: ["Add #[derive(Debug)]", "Enables {:?} format"], expectedError: "Debug not implemented" },
      { title: "Recursive Type", desc: "Infinite size struct.", bug: "Direct recursion", code: `struct Node { next: Node }`, solution: `struct Node { next: Box<Node> }`, checkKey: "Box<Node>", hints: ["Wrap in Box", "Box has fixed size"], expectedError: "recursive type has infinite size" },
      { title: "Shared Mutable", desc: "Mutating through shared ref.", bug: "&mut inside &", code: `let mut v = vec![1];\nfor x in &v { v.push(*x); }`, solution: `let mut v = vec![1];\nlet copy = v.clone();\nfor x in &copy { v.push(*x); }`, checkKey: "let copy = v.clone()", hints: ["Clone the iteration source", "Or use indices"], expectedError: "cannot borrow as mutable" },
      { title: "Result Not Handled", desc: "Ignoring Result::Err.", bug: ".unwrap()", code: `let f = File::open(\"a\").unwrap();`, solution: `let f = File::open(\"a\")?;`, checkKey: "File::open(\"a\")?", hints: ["Use ? operator", "Propagates error"], expectedError: "Panic on missing file" },
      { title: "Async Without .await", desc: "Future dropped without polling.", bug: "No .await", code: `let f = fetch();`, solution: `let f = fetch().await;`, checkKey: ".await", hints: ["Add .await", "Futures do nothing until polled"], expectedError: "Future never runs" },
      { title: "Cargo Missing Feature", desc: "Function requires feature flag.", bug: "No feature", code: `# Cargo.toml\ntokio = \"1\"`, solution: `# Cargo.toml\ntokio = { version = \"1\", features = [\"full\"] }`, checkKey: 'features = ["full"]', hints: ["Enable features in Cargo.toml", "tokio needs 'full'"], expectedError: "Function not found" },
    ],
  },
  {
    slug: "go", name: "Go", icon: "go", desc: "Fix goroutines, channels, and Go idioms", accent: "#22d3ee", lang: "Go", monacoLang: "go",
    problems: [
      { title: "Goroutine Leak", desc: "Goroutine blocks forever.", bug: "No cancel", code: `go func() { <-ch }()`, solution: `go func() { select { case <-ch: case <-ctx.Done(): } }()`, checkKey: "case <-ctx.Done()", hints: ["Use context for cancellation", "Add select with Done"], expectedError: "Goroutines pile up" },
      { title: "Race Condition", desc: "Concurrent map access.", bug: "No sync", code: `m := map[string]int{}\ngo func(){ m[\"a\"]=1 }()\ngo func(){ m[\"b\"]=2 }()`, solution: `var mu sync.Mutex\nm := map[string]int{}\ngo func(){ mu.Lock(); m[\"a\"]=1; mu.Unlock() }()`, checkKey: "mu.Lock()", hints: ["Wrap access in Mutex", "Or use sync.Map"], expectedError: "concurrent map writes" },
      { title: "Nil Pointer Deref", desc: "Struct pointer is nil.", bug: "No check", code: `var u *User\nfmt.Println(u.Name)`, solution: `var u *User\nif u != nil { fmt.Println(u.Name) }`, checkKey: "if u != nil", hints: ["Check for nil", "Guard the access"], expectedError: "nil pointer dereference" },
      { title: "Error Ignored", desc: "Not handling returned error.", bug: "_ = err", code: `data, _ := os.ReadFile(f)`, solution: `data, err := os.ReadFile(f)\nif err != nil { return err }`, checkKey: "if err != nil", hints: ["Always check errors", "Return or handle"], expectedError: "Silent failure" },
      { title: "Deferred Loop", desc: "defer inside loop stacks up.", bug: "defer in loop", code: `for _, f := range files {\n    fd, _ := os.Open(f)\n    defer fd.Close()\n}`, solution: `for _, f := range files {\n    func() {\n        fd, _ := os.Open(f)\n        defer fd.Close()\n    }()\n}`, checkKey: "func() {\\n        fd", hints: ["Wrap in closure", "defer runs at function end"], expectedError: "File handles leak" },
      { title: "Slice Sharing", desc: "Modifying slice affects original.", bug: "Shared backing array", code: `a := []int{1,2,3}\nb := a[:2]\nb[0] = 99`, solution: `a := []int{1,2,3}\nb := append([]int{}, a[:2]...)\nb[0] = 99`, checkKey: "append([]int{}, a[:2]...)", hints: ["Copy slice explicitly", "Slices share arrays"], expectedError: "a[0] also becomes 99" },
      { title: "Wrong Loop Var", desc: "Goroutine captures loop var.", bug: "Shared i", code: `for i := 0; i < 3; i++ {\n    go func() { fmt.Println(i) }()\n}`, solution: `for i := 0; i < 3; i++ {\n    go func(i int) { fmt.Println(i) }(i)\n}`, checkKey: "func(i int)", hints: ["Pass i as argument", "Or copy: i := i"], expectedError: "All print 3" },
      { title: "Channel Never Closed", desc: "Range on channel blocks forever.", bug: "No close", code: `for v := range ch { }`, solution: `close(ch)\nfor v := range ch { }`, checkKey: "close(ch)", hints: ["Close channel when done", "Range exits on close"], expectedError: "Deadlock" },
      { title: "String Concat Loop", desc: "+= is O(n^2).", bug: "String +=", code: `s := \"\"\nfor _, x := range xs { s += x }`, solution: `var b strings.Builder\nfor _, x := range xs { b.WriteString(x) }\ns := b.String()`, checkKey: "strings.Builder", hints: ["Use strings.Builder", "Avoids allocations"], expectedError: "Slow performance" },
      { title: "Map Access Twice", desc: "Checking existence and value separately.", bug: "Two lookups", code: `if _, ok := m[k]; ok {\n    v := m[k]\n}`, solution: `if v, ok := m[k]; ok {\n    _ = v\n}`, checkKey: "if v, ok := m[k]", hints: ["Comma-ok in one line", "Avoids double lookup"], expectedError: "Slow, redundant" },
      { title: "Interface Nil Trap", desc: "Interface holding nil pointer isn't nil.", bug: "Wrong check", code: `var e error = (*MyErr)(nil)\nif e == nil { }`, solution: `var e error\nif ptr != nil { e = ptr }\nif e == nil { }`, checkKey: "if ptr != nil", hints: ["Check pointer before assigning", "Typed nil != nil interface"], expectedError: "e is not nil despite nil ptr" },
      { title: "Context Not Passed", desc: "Function ignores context.", bug: "No ctx", code: `func fetch(url string) { }`, solution: `func fetch(ctx context.Context, url string) { }`, checkKey: "ctx context.Context", hints: ["Pass ctx as first arg", "Enables cancellation"], expectedError: "Can't cancel operation" },
    ],
  },
  {
    slug: "docker", name: "Docker", icon: "docker", desc: "Fix Dockerfile and container issues", accent: "#38bdf8", lang: "Docker", monacoLang: "dockerfile",
    problems: [
      { title: "Root User", desc: "Container runs as root.", bug: "No USER", code: `FROM node:20\nCOPY . /app`, solution: `FROM node:20\nRUN useradd -m app\nUSER app\nCOPY . /app`, checkKey: "USER app", hints: ["Add non-root USER", "Security best practice"], expectedError: "Security warning" },
      { title: "Missing .dockerignore", desc: "node_modules copied into image.", bug: "Copies everything", code: `COPY . .`, solution: `# .dockerignore\nnode_modules\n.git\n# Dockerfile\nCOPY . .`, checkKey: "node_modules", hints: ["Create .dockerignore", "Exclude node_modules"], expectedError: "Bloated image" },
      { title: "Not Multi-Stage", desc: "Build tools in final image.", bug: "Single stage", code: `FROM node:20\nRUN npm install && npm run build`, solution: `FROM node:20 AS build\nRUN npm install && npm run build\nFROM node:20-slim\nCOPY --from=build /app/dist /app`, checkKey: "FROM node:20 AS build", hints: ["Use multi-stage build", "Slim final image"], expectedError: "Huge image size" },
      { title: "Latest Tag", desc: "Unpinned base image.", bug: ":latest", code: `FROM node:latest`, solution: `FROM node:20.10.0`, checkKey: "node:20.10.0", hints: ["Pin exact version", "Reproducible builds"], expectedError: "Non-reproducible" },
      { title: "Cache Bust", desc: "npm install runs every build.", bug: "COPY . before install", code: `COPY . .\nRUN npm install`, solution: `COPY package*.json ./\nRUN npm install\nCOPY . .`, checkKey: "COPY package*.json ./\\nRUN npm install", hints: ["Copy package.json first", "Then install, then rest"], expectedError: "Slow rebuilds" },
      { title: "EXPOSE Missing", desc: "Port not documented.", bug: "No EXPOSE", code: `CMD [\"node\", \"server.js\"]`, solution: `EXPOSE 3000\nCMD [\"node\", \"server.js\"]`, checkKey: "EXPOSE 3000", hints: ["Add EXPOSE directive", "Documents port"], expectedError: "Unclear port" },
      { title: "Wrong CMD Syntax", desc: "Shell form doesn't handle signals.", bug: "Shell form", code: `CMD npm start`, solution: `CMD [\"npm\", \"start\"]`, checkKey: 'CMD ["npm", "start"]', hints: ["Use exec form (JSON array)", "Handles SIGTERM properly"], expectedError: "SIGTERM ignored" },
      { title: "No Health Check", desc: "Orchestrator can't detect crashes.", bug: "No HEALTHCHECK", code: `EXPOSE 3000`, solution: `HEALTHCHECK CMD curl -f http://localhost:3000 || exit 1\nEXPOSE 3000`, checkKey: "HEALTHCHECK", hints: ["Add HEALTHCHECK", "Curl your endpoint"], expectedError: "K8s can't tell if alive" },
      { title: "Volume Wrong Path", desc: "Data lost on container remove.", bug: "No volume", code: `docker run mydb`, solution: `docker run -v db-data:/var/lib/db mydb`, checkKey: "-v db-data:/var/lib/db", hints: ["Mount named volume", "Persists across containers"], expectedError: "Data loss" },
      { title: "Missing --restart", desc: "Container doesn't restart on crash.", bug: "No policy", code: `docker run myapp`, solution: `docker run --restart unless-stopped myapp`, checkKey: "--restart unless-stopped", hints: ["Add --restart flag", "unless-stopped is common"], expectedError: "Downtime on crash" },
      { title: "Layers Too Many", desc: "Each RUN is a new layer.", bug: "Multiple RUN", code: `RUN apt update\nRUN apt install curl\nRUN apt clean`, solution: `RUN apt update && apt install -y curl && apt clean`, checkKey: "&& apt install", hints: ["Combine RUN commands", "Fewer layers"], expectedError: "Bloated image" },
      { title: "Secret in Image", desc: "API key baked into image.", bug: "ENV SECRET=", code: `ENV API_KEY=abc123`, solution: `# Pass at runtime\ndocker run -e API_KEY=abc123 myapp`, checkKey: "-e API_KEY=abc123", hints: ["Use runtime env vars", "Or Docker secrets"], expectedError: "Secret leaked in image" },
    ],
  },
  {
    slug: "kubernetes", name: "Kubernetes", icon: "kubernetes", desc: "Fix pods, services, and deployment issues", accent: "#3b82f6", lang: "Kubernetes", monacoLang: "yaml",
    problems: [
      { title: "Missing Resource Limits", desc: "Pod eats all node memory.", bug: "No limits", code: `spec:\n  containers:\n  - name: app`, solution: `spec:\n  containers:\n  - name: app\n    resources:\n      limits:\n        memory: 512Mi\n        cpu: 500m`, checkKey: "limits:\\n        memory: 512Mi", hints: ["Set resource limits", "Prevents noisy neighbors"], expectedError: "Node OOM" },
      { title: "No Liveness Probe", desc: "K8s can't detect hung pod.", bug: "No probe", code: `containers:\n- name: app`, solution: `containers:\n- name: app\n  livenessProbe:\n    httpGet:\n      path: /health\n      port: 8080`, checkKey: "livenessProbe:", hints: ["Add livenessProbe", "K8s restarts hung pods"], expectedError: "Hung pod stays running" },
      { title: "Wrong Service Type", desc: "Cluster-internal service exposed to public.", bug: "LoadBalancer everywhere", code: `type: LoadBalancer`, solution: `type: ClusterIP`, checkKey: "type: ClusterIP", hints: ["Use ClusterIP internally", "LoadBalancer costs money"], expectedError: "Extra cost, security risk" },
      { title: "ConfigMap Not Mounted", desc: "App can't read config.", bug: "Not referenced", code: `# ConfigMap exists but not used`, solution: `volumeMounts:\n- name: config\n  mountPath: /etc/app\nvolumes:\n- name: config\n  configMap:\n    name: app-config`, checkKey: "configMap:\\n    name: app-config", hints: ["Mount as volume", "Or reference as env"], expectedError: "Config file missing" },
      { title: "Secret in ConfigMap", desc: "Password stored as plaintext.", bug: "ConfigMap for secrets", code: `data:\n  password: \"hunter2\"`, solution: `# Use Secret instead\nkind: Secret\ntype: Opaque\ndata:\n  password: aHVudGVyMg==`, checkKey: "kind: Secret", hints: ["Use Secret, not ConfigMap", "Base64 encode value"], expectedError: "Password in plaintext" },
      { title: "No Rolling Update", desc: "Downtime during deploy.", bug: "Recreate strategy", code: `strategy:\n  type: Recreate`, solution: `strategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1\n    maxUnavailable: 0`, checkKey: "type: RollingUpdate", hints: ["Use RollingUpdate", "maxUnavailable: 0 for zero downtime"], expectedError: "Downtime on deploy" },
      { title: "Latest Image Tag", desc: "Can't roll back.", bug: ":latest", code: `image: myapp:latest`, solution: `image: myapp:v1.2.3`, checkKey: "myapp:v1.2.3", hints: ["Pin image version", "Enables rollback"], expectedError: "Can't roll back reliably" },
      { title: "Missing HPA", desc: "Traffic spikes crash app.", bug: "No autoscaler", code: `# just Deployment`, solution: `kind: HorizontalPodAutoscaler\nspec:\n  minReplicas: 2\n  maxReplicas: 10\n  targetCPUUtilizationPercentage: 70`, checkKey: "HorizontalPodAutoscaler", hints: ["Add HPA", "Auto-scales on CPU"], expectedError: "Overload on spikes" },
      { title: "No PodDisruptionBudget", desc: "Node drain kills all replicas.", bug: "No PDB", code: `# Deployment only`, solution: `kind: PodDisruptionBudget\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: myapp`, checkKey: "PodDisruptionBudget", hints: ["Add PDB", "Prevents mass eviction"], expectedError: "All pods evicted at once" },
      { title: "Wrong Namespace", desc: "Resources in default namespace.", bug: "No namespace", code: `metadata:\n  name: myapp`, solution: `metadata:\n  name: myapp\n  namespace: production`, checkKey: "namespace: production", hints: ["Specify namespace", "Isolate environments"], expectedError: "Clashes in default ns" },
      { title: "Ingress Missing TLS", desc: "HTTP-only ingress.", bug: "No TLS", code: `spec:\n  rules:\n  - host: myapp.com`, solution: `spec:\n  tls:\n  - hosts: [myapp.com]\n    secretName: myapp-tls\n  rules:\n  - host: myapp.com`, checkKey: "tls:\\n  - hosts:", hints: ["Add TLS section", "Reference cert Secret"], expectedError: "Insecure HTTP" },
      { title: "Missing readinessProbe", desc: "Traffic sent before app ready.", bug: "Only liveness", code: `livenessProbe:\n  httpGet:\n    path: /`, solution: `readinessProbe:\n  httpGet:\n    path: /ready\nlivenessProbe:\n  httpGet:\n    path: /`, checkKey: "readinessProbe:", hints: ["Add readinessProbe", "Blocks traffic until ready"], expectedError: "500 errors on rollout" },
    ],
  },
  {
    slug: "linux", name: "Linux", icon: "linux", desc: "Fix Linux commands and shell scripting", accent: "#facc15", lang: "Linux", monacoLang: "shell",
    problems: [
      { title: "Missing Quotes", desc: "Filename with spaces breaks.", bug: "Unquoted $var", code: `cp $file /tmp/`, solution: `cp \"$file\" /tmp/`, checkKey: '"$file"', hints: ["Quote variables", "Handles spaces safely"], expectedError: "cp: too many arguments" },
      { title: "rm -rf Danger", desc: "One space away from disaster.", bug: "Unsafe rm", code: "rm -rf $DIR/*", solution: 'rm -rf "${DIR:?}"/*', checkKey: '"${DIR:?}"', hints: ["Use :? to fail if unset", "Quote variable"], expectedError: "rm -rf / if $DIR is empty" },
      { title: "Missing Shebang", desc: "Script runs with wrong shell.", bug: "No #!", code: `echo hi`, solution: `#!/usr/bin/env bash\necho hi`, checkKey: "#!/usr/bin/env bash", hints: ["Add shebang line", "Use env for portability"], expectedError: "Runs in sh not bash" },
      { title: "chmod Too Open", desc: "777 exposes sensitive files.", bug: "chmod 777", code: `chmod 777 secret.key`, solution: `chmod 600 secret.key`, checkKey: "chmod 600", hints: ["Use 600 for secrets", "Owner read/write only"], expectedError: "World-readable secrets" },
      { title: "Cron Path", desc: "Cron job can't find binary.", bug: "No PATH", code: `* * * * * mybin`, solution: `* * * * * /usr/local/bin/mybin`, checkKey: "/usr/local/bin/mybin", hints: ["Use full path in cron", "Cron has minimal PATH"], expectedError: "command not found" },
      { title: "Not Trapping Signals", desc: "Script leaves temp files on Ctrl+C.", bug: "No trap", code: `mktemp > /tmp/a`, solution: `trap 'rm -f /tmp/a' EXIT\nmktemp > /tmp/a`, checkKey: "trap 'rm -f", hints: ["Add trap for cleanup", "EXIT catches all exits"], expectedError: "Temp files leak" },
      { title: "grep in Log Loop", desc: "Grepping same file 1000 times.", bug: "grep in loop", code: `for line in $(cat file); do echo $line; done`, solution: `while read line; do echo \"$line\"; done < file`, checkKey: "while read line", hints: ["Use while read", "Faster and safer"], expectedError: "Slow and word-splitting" },
      { title: "Path Traversal", desc: "User input in file path.", bug: "No sanitize", code: `cat /var/data/$user`, solution: `case \"$user\" in *..*|*/*) exit 1;; esac\ncat \"/var/data/$user\"`, checkKey: "case \"$user\" in *..*", hints: ["Validate input", "Reject .. and /"], expectedError: "Directory traversal" },
      { title: "sudo Without Reason", desc: "Whole script runs as root.", bug: "sudo everywhere", code: `sudo cp a b\nsudo chmod +x b`, solution: `sudo sh -c 'cp a b && chmod +x b'`, checkKey: "sudo sh -c", hints: ["Batch sudo calls", "Fewer password prompts"], expectedError: "Too many prompts" },
      { title: "&& vs ;", desc: "Second command runs on failure.", bug: "Using ;", code: `cd /tmp; rm -rf *`, solution: `cd /tmp && rm -rf *`, checkKey: "cd /tmp &&", hints: ["Use && for dependency", "; runs always"], expectedError: "Runs rm even if cd failed" },
      { title: "Missing set -e", desc: "Script continues on error.", bug: "No set -e", code: `#!/bin/bash\ncp a b\nrm a`, solution: `#!/bin/bash\nset -euo pipefail\ncp a b\nrm a`, checkKey: "set -euo pipefail", hints: ["Add set -e for strict mode", "u for unset vars, pipefail for pipes"], expectedError: "Errors ignored" },
      { title: "df in Cron", desc: "Cron mail floods on disk full.", bug: "No filter", code: `df -h`, solution: `df -h | awk '$5+0 > 90 {print}'`, checkKey: "awk '$5+0 > 90'", hints: ["Filter output", "Only alert when threshold exceeded"], expectedError: "Cron spam" },
    ],
  },
  {
    slug: "aws", name: "AWS", icon: "aws", desc: "Fix AWS services and infrastructure issues", accent: "#f59e0b", lang: "AWS", monacoLang: "yaml",
    problems: [
      { title: "S3 Public Bucket", desc: "Bucket exposed to internet.", bug: "Public ACL", code: `aws s3api put-bucket-acl --acl public-read`, solution: `aws s3api put-bucket-acl --acl private\naws s3api put-public-access-block --public-access-block-configuration BlockPublicAcls=true`, checkKey: "BlockPublicAcls=true", hints: ["Block public access", "Use signed URLs instead"], expectedError: "Data leak via public bucket" },
      { title: "IAM Wildcards", desc: "Policy allows *:* on all resources.", bug: "Action: '*'", code: `{ \"Action\": \"*\", \"Resource\": \"*\" }`, solution: `{ \"Action\": [\"s3:GetObject\"], \"Resource\": \"arn:aws:s3:::my-bucket/*\" }`, checkKey: '"Action": ["s3:GetObject"]', hints: ["Least privilege", "Scope actions and resources"], expectedError: "Over-permissioned" },
      { title: "Lambda Timeout", desc: "Function times out at 3s default.", bug: "Default timeout", code: `# Timeout: 3`, solution: `Timeout: 30\nMemorySize: 512`, checkKey: "Timeout: 30", hints: ["Increase timeout", "Match your workload"], expectedError: "Task timed out after 3s" },
      { title: "RDS Public Access", desc: "Database open to internet.", bug: "PubliclyAccessible: true", code: `PubliclyAccessible: true`, solution: `PubliclyAccessible: false\nVpcSecurityGroups: [sg-private]`, checkKey: "PubliclyAccessible: false", hints: ["Set false", "Use VPC + private SG"], expectedError: "DB reachable from internet" },
      { title: "EC2 SG Wide Open", desc: "Port 22 open to 0.0.0.0/0.", bug: "0.0.0.0/0 for SSH", code: `SSH from 0.0.0.0/0`, solution: `SSH from 10.0.0.0/8 or your.office.ip/32`, checkKey: "your.office.ip/32", hints: ["Restrict SSH", "Use bastion or SSM"], expectedError: "Anyone can SSH" },
      { title: "No CloudWatch Alarms", desc: "No alerts on errors.", bug: "No alarm", code: `# Just Lambda`, solution: `AWS::CloudWatch::Alarm\n  MetricName: Errors\n  Threshold: 5`, checkKey: "MetricName: Errors", hints: ["Add CloudWatch alarm", "Alert on error spikes"], expectedError: "Silent failures" },
      { title: "S3 No Versioning", desc: "Accidental delete = data loss.", bug: "No versioning", code: `# bucket without versioning`, solution: `aws s3api put-bucket-versioning --versioning-configuration Status=Enabled`, checkKey: "Status=Enabled", hints: ["Enable versioning", "Recover deleted files"], expectedError: "No recovery from delete" },
      { title: "Hardcoded Credentials", desc: "Access keys in code.", bug: "Keys in code", code: `const AWS = require('aws-sdk');\nnew AWS.S3({ accessKeyId: 'AKIA...' })`, solution: `// Use IAM role or env vars\nnew AWS.S3()`, checkKey: "new AWS.S3()", hints: ["Use IAM roles", "Or environment variables"], expectedError: "Credentials leaked" },
      { title: "No Multi-AZ RDS", desc: "Single AZ = downtime on failure.", bug: "MultiAZ: false", code: `MultiAZ: false`, solution: `MultiAZ: true`, checkKey: "MultiAZ: true", hints: ["Enable Multi-AZ", "Auto failover"], expectedError: "Downtime on AZ failure" },
      { title: "Lambda Cold Start", desc: "First request is slow.", bug: "No provisioned concurrency", code: `# nothing`, solution: `ProvisionedConcurrency: 5`, checkKey: "ProvisionedConcurrency", hints: ["Use provisioned concurrency", "Or keep warm"], expectedError: "1-3s cold start" },
      { title: "No S3 Encryption", desc: "Data at rest unencrypted.", bug: "No SSE", code: `s3.putObject({ Body: data })`, solution: `s3.putObject({ Body: data, ServerSideEncryption: 'AES256' })`, checkKey: "ServerSideEncryption: 'AES256'", hints: ["Enable SSE", "AES256 or KMS"], expectedError: "Unencrypted at rest" },
      { title: "CloudFront No HTTPS", desc: "Distribution serves HTTP.", bug: "AllowAllProtocols", code: `ViewerProtocolPolicy: allow-all`, solution: `ViewerProtocolPolicy: redirect-to-https`, checkKey: "redirect-to-https", hints: ["Redirect HTTP to HTTPS", "Enforce TLS"], expectedError: "Insecure HTTP served" },
    ],
  },
  {
    slug: "reactnative", name: "React Native", icon: "reactnative", desc: "Debug mobile app crashes and RN quirks", accent: "#22d3ee", lang: "React Native", monacoLang: "javascript",
    problems: [
      { title: "FlatList Key Missing", desc: "React warns about keys.", bug: "No keyExtractor", code: `<FlatList data={items} renderItem={...} />`, solution: `<FlatList data={items} keyExtractor={i => i.id} renderItem={...} />`, checkKey: "keyExtractor={i => i.id}", hints: ["Add keyExtractor", "Or key prop on items"], expectedError: "Each child needs unique key" },
      { title: "State Update Loop", desc: "setState in render infinite loop.", bug: "setState in render", code: `render() { this.setState({x: 1}); }`, solution: `componentDidMount() { this.setState({x: 1}); }`, checkKey: "componentDidMount", hints: ["Move to useEffect or lifecycle", "Never setState in render"], expectedError: "Too many re-renders" },
      { title: "Image No Dimensions", desc: "Network image has 0 size.", bug: "No width/height", code: `<Image source={{uri}} />`, solution: `<Image source={{uri}} style={{width: 100, height: 100}} />`, checkKey: "width: 100, height: 100", hints: ["Set width and height", "Network images need dims"], expectedError: "Image not visible" },
      { title: "AsyncStorage Sync", desc: "Reading AsyncStorage synchronously.", bug: "Not awaited", code: `const v = AsyncStorage.getItem('k');`, solution: `const v = await AsyncStorage.getItem('k');`, checkKey: "await AsyncStorage.getItem", hints: ["It's async", "Add await"], expectedError: "v is a Promise" },
      { title: "Touch Missing", desc: "onPress not firing on Image.", bug: "No touchable", code: `<Image onPress={handle} />`, solution: `<TouchableOpacity onPress={handle}><Image /></TouchableOpacity>`, checkKey: "<TouchableOpacity onPress={handle}>", hints: ["Wrap in TouchableOpacity", "Image has no onPress"], expectedError: "onPress ignored" },
      { title: "iOS Safe Area", desc: "Content behind notch.", bug: "No safe area", code: `<View><Text>Hi</Text></View>`, solution: `import { SafeAreaView } from 'react-native-safe-area-context';\n<SafeAreaView><Text>Hi</Text></SafeAreaView>`, checkKey: "SafeAreaView", hints: ["Use SafeAreaView", "Respects notch"], expectedError: "Content hidden by notch" },
      { title: "Keyboard Covers Input", desc: "TextInput hidden by keyboard.", bug: "No avoiding view", code: `<TextInput />`, solution: `<KeyboardAvoidingView behavior='padding'>\n  <TextInput />\n</KeyboardAvoidingView>`, checkKey: "KeyboardAvoidingView", hints: ["Wrap in KeyboardAvoidingView", "Pushes content up"], expectedError: "Input hidden" },
      { title: "Missing Permissions", desc: "Camera crash on iOS.", bug: "No plist entry", code: `# Info.plist missing`, solution: `<key>NSCameraUsageDescription</key>\n<string>We need camera for photos</string>`, checkKey: "NSCameraUsageDescription", hints: ["Add usage description", "Required for camera"], expectedError: "App crashes on camera" },
      { title: "Fetch No Timeout", desc: "Hanging network request.", bug: "No timeout", code: `fetch(url)`, solution: `const c = new AbortController();\nsetTimeout(() => c.abort(), 5000);\nfetch(url, { signal: c.signal });`, checkKey: "AbortController", hints: ["Use AbortController", "Set timeout"], expectedError: "Hangs on slow network" },
      { title: "Style Not Applied", desc: "Style prop is object not StyleSheet.", bug: "Inline style", code: `<View style={{f: 1}}>`, solution: `<View style={styles.container}>\nconst styles = StyleSheet.create({ container: { flex: 1 } });`, checkKey: "StyleSheet.create", hints: ["Use StyleSheet.create", "Better performance"], expectedError: "Slow re-renders" },
      { title: "Missing Alt for A11y", desc: "Screen reader can't read image.", bug: "No accessibilityLabel", code: `<Image source={logo} />`, solution: `<Image source={logo} accessibilityLabel='Company logo' />`, checkKey: "accessibilityLabel", hints: ["Add accessibilityLabel", "For screen readers"], expectedError: "Inaccessible" },
      { title: "Text Outside Text Component", desc: "String rendered directly in View.", bug: "String in View", code: `<View>Hello</View>`, solution: `<View><Text>Hello</Text></View>`, checkKey: "<Text>Hello</Text>", hints: ["Wrap text in <Text>", "RN requires Text component"], expectedError: "Text strings must be rendered within Text" },
    ],
  },
  {
    slug: "flutter", name: "Flutter", icon: "flutter", desc: "Fix Flutter/Dart widget and state issues", accent: "#38bdf8", lang: "Flutter", monacoLang: "dart",
    problems: [
      { title: "setState After Dispose", desc: "Widget disposed but setState called.", bug: "No mounted check", code: `setState(() { x = 1; });`, solution: `if (mounted) setState(() { x = 1; });`, checkKey: "if (mounted)", hints: ["Check mounted first", "Avoids errors after dispose"], expectedError: "setState() called after dispose()" },
      { title: "ListView Not Scrollable", desc: "Column with ListView crashes.", bug: "Nested unbounded", code: `Column(children: [ListView(...)])`, solution: `Column(children: [Expanded(child: ListView(...))])`, checkKey: "Expanded(child: ListView", hints: ["Wrap in Expanded", "Or use Flexible"], expectedError: "RenderFlex overflowed" },
      { title: "Missing const", desc: "Widget rebuilds unnecessarily.", bug: "No const", code: `Text('hi')`, solution: `const Text('hi')`, checkKey: "const Text('hi')", hints: ["Add const constructor", "Prevents rebuilds"], expectedError: "Extra rebuilds" },
      { title: "Async in initState", desc: "await in initState fails.", bug: "async initState", code: `void initState() async { await load(); }`, solution: `void initState() { super.initState(); load().then((_) => setState(() {})); }`, checkKey: "load().then", hints: ["Don't make initState async", "Use .then() or Future"], expectedError: "initState is void" },
      { title: "Missing Key in ListView", desc: "State lost on reorder.", bug: "No key", code: `ListView(children: items.map((i) => Card()).toList())`, solution: `ListView(children: items.map((i) => Card(key: ValueKey(i.id))).toList())`, checkKey: "key: ValueKey", hints: ["Add ValueKey", "Preserves state"], expectedError: "State scrambled on reorder" },
      { title: "Padding Wrong Widget", desc: "Trying to add padding on Container.", bug: "Extra Container", code: `Container(padding: EdgeInsets.all(8), child: Text('a'))`, solution: `Padding(padding: EdgeInsets.all(8), child: Text('a'))`, checkKey: "Padding(padding: EdgeInsets.all(8)", hints: ["Use Padding widget", "Lighter than Container"], expectedError: "Unnecessary wrapper" },
      { title: "MediaQuery in build", desc: "Rebuilds on every keyboard change.", bug: "Full MediaQuery.of", code: `final size = MediaQuery.of(context).size;`, solution: `final size = MediaQuery.sizeOf(context);`, checkKey: "MediaQuery.sizeOf", hints: ["Use .sizeOf() etc.", "Scoped to only that property"], expectedError: "Excessive rebuilds" },
      { title: "Future Not Awaited", desc: "Loading indicator never dismisses.", bug: "No await", code: `void save() { api.save(); setState(...); }`, solution: `Future<void> save() async { await api.save(); setState(...); }`, checkKey: "await api.save()", hints: ["Add await", "Then update state"], expectedError: "State updates before save done" },
      { title: "Global Key Reuse", desc: "Same GlobalKey used twice.", bug: "Duplicate key", code: `final key = GlobalKey();\nWidget a = Foo(key: key);\nWidget b = Bar(key: key);`, solution: `final key1 = GlobalKey();\nfinal key2 = GlobalKey();`, checkKey: "final key1 = GlobalKey()", hints: ["GlobalKey must be unique", "One per widget"], expectedError: "Duplicate GlobalKey" },
      { title: "Setter for Immutable", desc: "Trying to modify final field.", bug: "Modify final", code: `class W { final int x = 0; }\nw.x = 1;`, solution: `class W { int x = 0; }\nw.x = 1;`, checkKey: "int x = 0;", hints: ["Remove 'final'", "Or use copyWith pattern"], expectedError: "'x' can't be used as setter" },
      { title: "Provider Not Above", desc: "Provider.of throws no context.", bug: "Provider below widget", code: `MyWidget()  // uses Provider\nMultiProvider(providers: [...])`, solution: `MultiProvider(providers: [...], child: MyWidget())`, checkKey: "MultiProvider(providers: [...], child: MyWidget())", hints: ["Provider must be ancestor", "Move above widget tree"], expectedError: "Could not find Provider" },
      { title: "Image No Error Handler", desc: "Broken URL crashes UI.", bug: "No errorBuilder", code: `Image.network(url)`, solution: `Image.network(url, errorBuilder: (_, __, ___) => Icon(Icons.error))`, checkKey: "errorBuilder:", hints: ["Add errorBuilder", "Fallback on load fail"], expectedError: "Ugly error widget" },
    ],
  },
  {
    slug: "angular", name: "Angular", icon: "angular", desc: "Fix Angular components, RxJS, and DI", accent: "#ef4444", lang: "Angular", monacoLang: "typescript",
    problems: [
      { title: "Subscription Leak", desc: "Component destroyed but observable still running.", bug: "No unsubscribe", code: `ngOnInit() { this.sub = obs$.subscribe(...); }`, solution: `ngOnDestroy() { this.sub.unsubscribe(); }`, checkKey: "this.sub.unsubscribe()", hints: ["Unsubscribe in ngOnDestroy", "Or use takeUntil"], expectedError: "Memory leak" },
      { title: "ChangeDetection Slow", desc: "Component re-renders on every event.", bug: "Default strategy", code: `@Component({ ... })`, solution: `@Component({ changeDetection: ChangeDetectionStrategy.OnPush })`, checkKey: "ChangeDetectionStrategy.OnPush", hints: ["Use OnPush", "Detects only on input changes"], expectedError: "Slow performance" },
      { title: "Async Pipe Missing", desc: "Manual subscribe in template.", bug: "Manual", code: `this.data = obs$.subscribe(d => this.data = d);`, solution: `<!-- template -->\n{{ data$ | async }}`, checkKey: "| async", hints: ["Use async pipe", "Auto-unsubscribes"], expectedError: "Memory leak, manual code" },
      { title: "Provider Missing", desc: "Service can't be injected.", bug: "No providedIn", code: `@Injectable() class MyService { }`, solution: `@Injectable({ providedIn: 'root' }) class MyService { }`, checkKey: "providedIn: 'root'", hints: ["Add providedIn", "Or add to module providers"], expectedError: "NullInjectorError" },
      { title: "trackBy Missing", desc: "*ngFor rebuilds all items.", bug: "No trackBy", code: `<div *ngFor='let item of items'>`, solution: `<div *ngFor='let item of items; trackBy: trackById'>`, checkKey: "trackBy: trackById", hints: ["Add trackBy function", "Prevents full rebuild"], expectedError: "Slow list updates" },
      { title: "Two-way Binding Wrong", desc: "[(ngModel)] not working.", bug: "Missing FormsModule", code: `<input [(ngModel)]='name' />`, solution: `// module.ts\nimport { FormsModule } from '@angular/forms';\n@NgModule({ imports: [FormsModule] })`, checkKey: "imports: [FormsModule]", hints: ["Import FormsModule", "Required for ngModel"], expectedError: "Can't bind to ngModel" },
      { title: "HttpClient Wrong", desc: "http.get returns Observable, not data.", bug: "Not subscribed", code: `const data = this.http.get(url);`, solution: `this.http.get(url).subscribe(d => this.data = d);`, checkKey: ".subscribe(d", hints: ["Subscribe to observable", "Or use async pipe"], expectedError: "data is Observable, not object" },
      { title: "Zone.js Leak", desc: "setInterval keeps zone alive.", bug: "Inside zone", code: `setInterval(poll, 1000);`, solution: `this.ngZone.runOutsideAngular(() => setInterval(poll, 1000));`, checkKey: "runOutsideAngular", hints: ["Use ngZone.runOutsideAngular", "Prevents change detection thrash"], expectedError: "Constant change detection" },
      { title: "ViewChild Undefined", desc: "Accessing @ViewChild in ngOnInit.", bug: "Too early", code: `ngOnInit() { this.child.method(); }`, solution: `ngAfterViewInit() { this.child.method(); }`, checkKey: "ngAfterViewInit()", hints: ["Use ngAfterViewInit", "ViewChild not ready in ngOnInit"], expectedError: "Cannot read property of undefined" },
      { title: "Router Link Wrong", desc: "Absolute path required.", bug: "String href", code: `<a href='/users'>Users</a>`, solution: `<a routerLink='/users'>Users</a>`, checkKey: "routerLink='/users'", hints: ["Use routerLink", "SPA navigation"], expectedError: "Full page reload" },
      { title: "Standalone Missing", desc: "Angular 15+ requires standalone or module.", bug: "No decorator config", code: `@Component({ selector: 'x' })`, solution: `@Component({ selector: 'x', standalone: true, imports: [CommonModule] })`, checkKey: "standalone: true", hints: ["Mark as standalone", "Import needed modules"], expectedError: "Component not part of any module" },
      { title: "OnInit Not Implemented", desc: "ngOnInit doesn't fire.", bug: "Missing implements", code: `export class MyComp { ngOnInit() { } }`, solution: `export class MyComp implements OnInit { ngOnInit() { } }`, checkKey: "implements OnInit", hints: ["Add implements OnInit", "Import from @angular/core"], expectedError: "Lifecycle not enforced" },
    ],
  },
  {
    slug: "vue", name: "Vue", icon: "vue", desc: "Fix Vue 3 reactivity and component issues", accent: "#10b981", lang: "Vue", monacoLang: "html",
    problems: [
      { title: "Reactivity Lost", desc: "Object property not reactive.", bug: "Destructure ref", code: `const { name } = state;`, solution: `const { name } = toRefs(state);`, checkKey: "toRefs(state)", hints: ["Use toRefs()", "Preserves reactivity on destructure"], expectedError: "name doesn't update UI" },
      { title: "Ref Access Wrong", desc: "Accessing ref value directly.", bug: "No .value", code: `count + 1  // in script`, solution: `count.value + 1  // in script`, checkKey: "count.value + 1", hints: ["Use .value in script", "Template auto-unwraps"], expectedError: "NaN in script" },
      { title: "v-for Missing key", desc: "Vue warns about missing key.", bug: "No :key", code: `<li v-for='item in items'>`, solution: `<li v-for='item in items' :key='item.id'>`, checkKey: ":key='item.id'", hints: ["Add :key", "Vue needs unique id"], expectedError: "v-for requires key" },
      { title: "Emit Not Typed", desc: "Emit works but no type safety.", bug: "No defineEmits", code: `emit('save', data);`, solution: `const emit = defineEmits<{ save: [data: Data] }>();\nemit('save', data);`, checkKey: "defineEmits<{", hints: ["Use defineEmits", "Add TS types"], expectedError: "No type safety" },
      { title: "Composition API Missing", desc: "Using this in <script setup>.", bug: "Options syntax in setup", code: `<script setup>\nexport default { data() { return {} } }`, solution: `<script setup>\nconst count = ref(0);`, checkKey: "const count = ref(0)", hints: ["Use Composition API", "No 'this' in setup"], expectedError: "this is undefined" },
      { title: "Watch No Immediate", desc: "watch doesn't run on init.", bug: "No immediate", code: `watch(source, cb);`, solution: `watch(source, cb, { immediate: true });`, checkKey: "immediate: true", hints: ["Add immediate: true", "Runs cb on init"], expectedError: "cb not run initially" },
      { title: "Router Push Wrong", desc: "Programmatic nav fails.", bug: "String path", code: `router.push('/user/' + id);`, solution: `router.push({ name: 'user', params: { id } });`, checkKey: "name: 'user', params:", hints: ["Use named routes", "Safer than string paths"], expectedError: "Route not found" },
      { title: "Prop Mutation", desc: "Modifying prop directly.", bug: "Mutating prop", code: `props.count++;`, solution: `const emit = defineEmits(['update:count']);\nemit('update:count', props.count + 1);`, checkKey: "emit('update:count'", hints: ["Emit event to parent", "Or use v-model"], expectedError: "Prop mutation warning" },
      { title: "Async Setup Wrong", desc: "Component doesn't render.", bug: "async setup no Suspense", code: `<script setup>\nconst data = await fetch();`, solution: `<!-- parent -->\n<Suspense><MyComp /></Suspense>`, checkKey: "<Suspense>", hints: ["Wrap in Suspense", "Or use onMounted"], expectedError: "Component invisible" },
      { title: "Slot Fallback Missing", desc: "Empty slot shows nothing.", bug: "No fallback", code: `<slot />`, solution: `<slot>Default content</slot>`, checkKey: "<slot>Default content</slot>", hints: ["Add fallback content", "Between slot tags"], expectedError: "Blank on missing slot" },
      { title: "Computed Not Cached", desc: "Method used instead of computed.", bug: "Method in template", code: `<div>{{ fullName() }}</div>`, solution: `const fullName = computed(() => first + ' ' + last);\n<div>{{ fullName }}</div>`, checkKey: "const fullName = computed", hints: ["Use computed()", "Caches result"], expectedError: "Re-runs on every render" },
      { title: "v-model on Custom", desc: "Custom component doesn't sync.", bug: "No modelValue", code: `props: ['value'], emits: ['input']`, solution: `defineProps<{ modelValue: string }>();\ndefineEmits<{ 'update:modelValue': [v: string] }>();`, checkKey: "update:modelValue", hints: ["Use modelValue + update:modelValue", "Vue 3 convention"], expectedError: "v-model doesn't work" },
    ],
  },
  {
    slug: "react", name: "React + TSX", icon: "react", desc: "Fix React hooks, TypeScript, and rendering bugs", accent: "#22d3ee", lang: "React + TSX", monacoLang: "typescript",
    problems: [
      { title: "useState Stale Closure", desc: "Handler sees old state.", bug: "Missing dep", code: `useEffect(() => { const t = setInterval(() => setCount(count+1), 1000); }, []);`, solution: `useEffect(() => { const t = setInterval(() => setCount(c => c+1), 1000); }, []);`, checkKey: "setCount(c => c+1)", hints: ["Use functional setState", "Avoids stale closure"], expectedError: "count stuck at 1" },
      { title: "Missing Dep in Effect", desc: "Effect uses stale value.", bug: "Empty deps", code: `useEffect(() => { fetch(url); }, []);`, solution: `useEffect(() => { fetch(url); }, [url]);`, checkKey: "[url]", hints: ["Add all deps used inside", "Or ESLint plugin catches this"], expectedError: "Doesn't refetch on url change" },
      { title: "Key on Wrong Element", desc: "Key inside instead of on top.", bug: "Wrong key placement", code: `items.map(i => <div><li key={i.id}>{i}</li></div>)`, solution: `items.map(i => <div key={i.id}><li>{i}</li></div>)`, checkKey: "<div key={i.id}>", hints: ["Key on top-level element", "In the map callback"], expectedError: "Each child needs key" },
      { title: "TS any Type", desc: "Using 'any' defeats TypeScript.", bug: "any type", code: `function fetch(data: any) { }`, solution: `function fetch<T>(data: T) { }`, checkKey: "<T>(data: T)", hints: ["Use generics", "Or specific type"], expectedError: "No type safety" },
      { title: "useEffect Cleanup", desc: "Subscription not cleaned up.", bug: "No cleanup", code: `useEffect(() => { const s = subscribe(); }, []);`, solution: `useEffect(() => { const s = subscribe(); return () => s.unsubscribe(); }, []);`, checkKey: "return () => s.unsubscribe()", hints: ["Return cleanup function", "Runs on unmount"], expectedError: "Memory leak" },
      { title: "useCallback Missing", desc: "Child re-renders on every render.", bug: "New function each time", code: `<Child onClick={() => handle(id)} />`, solution: `const cb = useCallback(() => handle(id), [id]);\n<Child onClick={cb} />`, checkKey: "useCallback", hints: ["Wrap in useCallback", "Stable reference"], expectedError: "Unnecessary re-renders" },
      { title: "Props Any", desc: "Props not typed.", bug: "No interface", code: `function Card(props) { }`, solution: `interface Props { title: string }\nfunction Card(props: Props) { }`, checkKey: "interface Props", hints: ["Define Props interface", "Type the component"], expectedError: "No autocomplete" },
      { title: "Direct DOM Mutation", desc: "Modifying DOM outside React.", bug: "document.getElementById", code: `document.getElementById('x').innerText = 'hi';`, solution: `<div ref={ref}>{text}</div>`, checkKey: "ref={ref}", hints: ["Use refs and state", "Never touch DOM directly"], expectedError: "React overwrites changes" },
      { title: "Conditional Hook", desc: "useState inside if.", bug: "Conditional call", code: `if (x) { const [s] = useState(); }`, solution: `const [s] = useState();\nif (x) { /* use s */ }`, checkKey: "const [s] = useState();\\nif (x)", hints: ["Hooks at top level", "No conditions/loops"], expectedError: "React Hook rules violated" },
      { title: "Missing return in JSX map", desc: "map body has statement not expression.", bug: "No return", code: `items.map(i => { <div>{i}</div> })`, solution: `items.map(i => <div>{i}</div>)`, checkKey: "items.map(i => <div>{i}</div>)", hints: ["Remove braces or return", "Arrow body vs expression"], expectedError: "Nothing rendered" },
      { title: "TS Event Type", desc: "Event handler typed as any.", bug: "any event", code: `const onChange = (e: any) => { }`, solution: `const onChange = (e: React.ChangeEvent<HTMLInputElement>) => { }`, checkKey: "React.ChangeEvent<HTMLInputElement>", hints: ["Type the event", "React provides types"], expectedError: "No type safety on e" },
      { title: "State Batching Missed", desc: "Two setState calls in async.", bug: "Non-batched", code: `setTimeout(() => { setA(1); setB(2); }, 0);`, solution: `import { unstable_batchedUpdates } from 'react-dom';\nsetTimeout(() => unstable_batchedUpdates(() => { setA(1); setB(2); }), 0);`, checkKey: "unstable_batchedUpdates", hints: ["React 18 auto-batches", "Or use batchedUpdates"], expectedError: "Two re-renders" },
    ],
  },
  {
    slug: "html", name: "HTML", icon: "html", desc: "Fix semantic HTML and accessibility issues", accent: "#f97316", lang: "HTML", monacoLang: "html",
    problems: [
      { title: "Missing alt", desc: "Image has no alt attribute.", bug: "No alt", code: `<img src='logo.png'>`, solution: `<img src='logo.png' alt='Company logo'>`, checkKey: "alt='Company logo'", hints: ["Add alt attribute", "Screen readers need it"], expectedError: "Fails a11y audit" },
      { title: "Wrong Doctype", desc: "Old doctype triggers quirks mode.", bug: "HTML 4 doctype", code: `<!DOCTYPE html PUBLIC ...>`, solution: `<!DOCTYPE html>`, checkKey: "<!DOCTYPE html>", hints: ["Use HTML5 doctype", "Simple and modern"], expectedError: "Quirks mode CSS bugs" },
      { title: "Div for Button", desc: "Using div with onclick.", bug: "Non-semantic", code: `<div onclick='save()'>Save</div>`, solution: `<button type='button' onclick='save()'>Save</button>`, checkKey: "<button type='button'", hints: ["Use <button>", "Focusable, accessible"], expectedError: "Not keyboard accessible" },
      { title: "Missing lang", desc: "No lang attribute on html.", bug: "No lang", code: `<html>`, solution: `<html lang='en'>`, checkKey: "lang='en'", hints: ["Add lang attribute", "Helps screen readers"], expectedError: "a11y warning" },
      { title: "Inline Style", desc: "Style attribute for everything.", bug: "style=", code: `<p style='color:red'>`, solution: `<p class='error'>\n// CSS: .error { color: red; }`, checkKey: "class='error'", hints: ["Use CSS class", "Separation of concerns"], expectedError: "Hard to maintain" },
      { title: "Missing viewport", desc: "No mobile viewport meta.", bug: "No meta", code: `<head></head>`, solution: `<head>\n<meta name='viewport' content='width=device-width, initial-scale=1'>\n</head>`, checkKey: 'name="viewport"', hints: ["Add viewport meta", "Required for mobile"], expectedError: "Zoomed out on mobile" },
      { title: "Form No Labels", desc: "Input without label.", bug: "No label", code: `<input type='text' name='email'>`, solution: `<label for='email'>Email</label>\n<input id='email' type='text' name='email'>`, checkKey: "<label for='email'>", hints: ["Associate label", "Improves a11y"], expectedError: "Screen readers confused" },
      { title: "Table for Layout", desc: "Using table for page layout.", bug: "Layout table", code: `<table><tr><td>Header</td></tr></table>`, solution: `<header>Header</header>`, checkKey: "<header>", hints: ["Use semantic elements", "Table is for tabular data"], expectedError: "Bad semantics" },
      { title: "Nested Interactive", desc: "Button inside link.", bug: "a > button", code: `<a href='/x'><button>Click</button></a>`, solution: `<a href='/x' class='btn-link'>Click</a>`, checkKey: "class='btn-link'", hints: ["Don't nest interactive", "Style link like button"], expectedError: "Invalid HTML" },
      { title: "SVG No title", desc: "SVG icon has no title.", bug: "No title", code: `<svg>...</svg>`, solution: `<svg role='img' aria-labelledby='icon-title'><title id='icon-title'>Save icon</title>...</svg>`, checkKey: "<title id='icon-title'>", hints: ["Add <title> inside SVG", "Or aria-label"], expectedError: "Icon invisible to a11y" },
      { title: "Missing Charset", desc: "Special characters garbled.", bug: "No meta charset", code: `<head></head>`, solution: `<head><meta charset='utf-8'></head>`, checkKey: "charset='utf-8'", hints: ["Add charset meta", "First in head"], expectedError: "Garbled characters" },
      { title: "iframe No title", desc: "Iframe has no accessible name.", bug: "No title attr", code: `<iframe src='...'>`, solution: `<iframe src='...' title='Video player'>`, checkKey: "title='Video player'", hints: ["Add title attribute", "Names the iframe"], expectedError: "a11y audit fails" },
    ],
  },
  {
    slug: "css", name: "CSS", icon: "css", desc: "Fix CSS layout, specificity, and responsive bugs", accent: "#60a5fa", lang: "CSS", monacoLang: "css",
    problems: [
      { title: "Flex Not Wrapping", desc: "Items overflow container.", bug: "No wrap", code: `.container { display: flex; }`, solution: `.container { display: flex; flex-wrap: wrap; }`, checkKey: "flex-wrap: wrap", hints: ["Add flex-wrap: wrap", "Items wrap to new line"], expectedError: "Overflow" },
      { title: "Center Not Working", desc: "text-align not centering div.", bug: "text-align on block", code: `.parent { text-align: center; }\n.child { }`, solution: `.parent { display: flex; justify-content: center; }`, checkKey: "justify-content: center", hints: ["Use flexbox", "text-align only for text"], expectedError: "Div still left-aligned" },
      { title: "Z-Index No Effect", desc: "z-index doesn't work.", bug: "No positioning", code: `.el { z-index: 10; }`, solution: `.el { position: relative; z-index: 10; }`, checkKey: "position: relative;", hints: ["Set position (not static)", "Then z-index works"], expectedError: "Element still behind" },
      { title: "Margin Collapse", desc: "Vertical margins merge.", bug: "Adjacent margins", code: `<div style='margin: 20px'>a</div>\n<div style='margin: 20px'>b</div>`, solution: `.container { display: flex; flex-direction: column; gap: 20px; }`, checkKey: "gap: 20px", hints: ["Use gap in flex/grid", "Avoids margin collapse"], expectedError: "20px instead of 40px" },
      { title: "Not Mobile First", desc: "Desktop styles override mobile.", bug: "Desktop first", code: `@media (max-width: 768px) { ... }`, solution: `/* mobile default */\n@media (min-width: 768px) { /* desktop */ }`, checkKey: "@media (min-width: 768px)", hints: ["Mobile first", "Use min-width media queries"], expectedError: "Complex overrides" },
      { title: "px Not rem", desc: "Font sizes in px ignore user prefs.", bug: "px units", code: `body { font-size: 16px; }`, solution: `html { font-size: 100%; }\nbody { font-size: 1rem; }`, checkKey: "1rem", hints: ["Use rem for accessibility", "Respects user zoom"], expectedError: "Ignores user font size" },
      { title: "!important Chain", desc: "Overriding !important with !important.", bug: "Escalating !important", code: `.a { color: red !important; }\n.b { color: blue !important; }`, solution: `/* Increase specificity */\n.parent .b { color: blue; }`, checkKey: ".parent .b", hints: ["Increase specificity", "Avoid !important"], expectedError: "Specificity war" },
      { title: "Overflow Hidden Everywhere", desc: "Cutting off tooltips.", bug: "overflow: hidden", code: `.parent { overflow: hidden; }`, solution: `.parent { overflow: visible; }`, checkKey: "overflow: visible", hints: ["Only clip when needed", "Tooltips need overflow visible"], expectedError: "Tooltip clipped" },
      { title: "100vh Mobile Issue", desc: "100vh includes URL bar on mobile.", bug: "100vh", code: `.hero { height: 100vh; }`, solution: `.hero { height: 100dvh; }`, checkKey: "100dvh", hints: ["Use dvh (dynamic vh)", "Excludes URL bar"], expectedError: "Height jumps on scroll" },
      { title: "Missing box-sizing", desc: "Padding adds to width.", bug: "content-box default", code: `.card { width: 100%; padding: 20px; }`, solution: `* { box-sizing: border-box; }\n.card { width: 100%; padding: 20px; }`, checkKey: "box-sizing: border-box", hints: ["Set border-box globally", "Padding included in width"], expectedError: "Overflow horizontal" },
      { title: "Grid Not Responsive", desc: "Fixed columns overflow mobile.", bug: "Fixed cols", code: `.grid { grid-template-columns: 200px 200px 200px; }`, solution: `.grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }`, checkKey: "repeat(auto-fit", hints: ["Use auto-fit + minmax", "Responsive by default"], expectedError: "Overflow on small screens" },
      { title: "Missing focus style", desc: "Removed outline with no replacement.", bug: "outline: none", code: `button:focus { outline: none; }`, solution: `button:focus-visible { outline: 2px solid blue; outline-offset: 2px; }`, checkKey: ":focus-visible", hints: ["Provide focus style", "Use focus-visible"], expectedError: "Keyboard users lost" },
    ],
  },
  {
    slug: "springboot", name: "Spring Boot", icon: "springboot", desc: "Fix Spring Boot config, DI, and JPA issues", accent: "#22c55e", lang: "Spring Boot", monacoLang: "java",
    problems: [
      { title: "N+1 with JPA", desc: "Loading list triggers per-row queries.", bug: "Lazy load in loop", code: `@OneToMany(fetch = FetchType.LAZY) private List<Item> items;`, solution: `@EntityGraph(attributePaths = \"items\")\nList<Order> findAll();`, checkKey: "@EntityGraph(attributePaths = \"items\")", hints: ["Use @EntityGraph", "Or JOIN FETCH in JPQL"], expectedError: "N+1 queries" },
      { title: "Missing @Transactional", desc: "Update commits partially.", bug: "No @Transactional", code: `public void transfer() { }`, solution: `@Transactional\npublic void transfer() { }`, checkKey: "@Transactional", hints: ["Add @Transactional", "Wraps in transaction"], expectedError: "Partial updates" },
      { title: "Autowired Field", desc: "Field injection is hard to test.", bug: "@Autowired field", code: `@Autowired private UserRepo repo;`, solution: `private final UserRepo repo;\npublic MyService(UserRepo repo) { this.repo = repo; }`, checkKey: "public MyService(UserRepo repo)", hints: ["Use constructor injection", "Easier to test"], expectedError: "Hard to unit test" },
      { title: "Component Scan Wrong", desc: "Beans not discovered.", bug: "Wrong package", code: `@SpringBootApplication\npublic class MyApp { }`, solution: `@SpringBootApplication(scanBasePackages = \"com.myapp\")`, checkKey: 'scanBasePackages = "com.myapp"', hints: ["Set scanBasePackages", "Or move App to root pkg"], expectedError: "Bean not found" },
      { title: "Config Not Loaded", desc: "@Value doesn't inject.", bug: "Wrong syntax", code: '@Value("my.key") private String key;', solution: '@Value("${my.key}") private String key;', checkKey: '${my.key}', hints: ["Use ${} for property", "Not just key name"], expectedError: "Literal string 'my.key'" },
      { title: "Missing @RestController", desc: "Method returns view name.", bug: "@Controller only", code: `@Controller\npublic class ApiCtrl { }`, solution: `@RestController\npublic class ApiCtrl { }`, checkKey: "@RestController", hints: ["Use @RestController for APIs", "Auto @ResponseBody"], expectedError: "Returns view name, not JSON" },
      { title: "PathVariable Missing", desc: "Method arg not bound.", bug: "No @PathVariable", code: `@GetMapping(\"/users/{id}\")\npublic User get(Long id) { }`, solution: `@GetMapping(\"/users/{id}\")\npublic User get(@PathVariable Long id) { }`, checkKey: "@PathVariable Long id", hints: ["Add @PathVariable", "Binds URL segment"], expectedError: "id is null" },
      { title: "H2 in Prod", desc: "In-memory DB in production.", bug: "H2 default", code: `spring.datasource.url=jdbc:h2:mem:testdb`, solution: `spring.datasource.url=jdbc:postgresql://prod:5432/app`, checkKey: "jdbc:postgresql", hints: ["Use real DB", "Config per env"], expectedError: "Data lost on restart" },
      { title: "No Actuator", desc: "No health endpoint.", bug: "No actuator", code: `# pom.xml missing`, solution: `spring-boot-starter-actuator\n# application.properties\nmanagement.endpoints.web.exposure.include=health`, checkKey: "spring-boot-starter-actuator", hints: ["Add actuator dependency", "Expose health endpoint"], expectedError: "K8s can't check health" },
      { title: "Missing @Valid", desc: "Request body not validated.", bug: "No @Valid", code: `public User create(@RequestBody User u) { }`, solution: `public User create(@Valid @RequestBody User u) { }`, checkKey: "@Valid @RequestBody", hints: ["Add @Valid", "Triggers Bean Validation"], expectedError: "Invalid data accepted" },
      { title: "Circular Dependency", desc: "Two beans need each other.", bug: "Cycle", code: `class A { @Autowired B b; }\nclass B { @Autowired A a; }`, solution: `class A { @Autowired @Lazy B b; }\nclass B { @Autowired A a; }`, checkKey: "@Lazy B b", hints: ["Add @Lazy to break cycle", "Or refactor"], expectedError: "BeanCurrentlyInCreationException" },
      { title: "Missing Exception Handler", desc: "Unhandled exception returns 500 HTML.", bug: "No handler", code: `throw new RuntimeException(\"bad\");`, solution: `@ControllerAdvice\npublic class GlobalHandler {\n  @ExceptionHandler(RuntimeException.class)\n  public ResponseEntity<?> h(RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }\n}`, checkKey: "@ControllerAdvice", hints: ["Add @ControllerAdvice", "Handle exceptions globally"], expectedError: "HTML error page" },
    ],
  },
];

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
  ...stackTemplates.map(buildTrack),
];

export const dailyChallenges = [
  { icon: "javascript" as IconName, title: "Closure Confusion", xp: 220, progress: "0/1" },
  { icon: "node" as IconName, title: "Infinite Recursion", xp: 200, progress: "0/1" },
  { icon: "sql" as IconName, title: "N+1 Apocalypse", xp: 160, progress: "0/1" },
];

export const skills = [
  { icon: "python" as IconName, name: "Python", pct: 0 },
  { icon: "javascript" as IconName, name: "JavaScript", pct: 0 },
  { icon: "sql" as IconName, name: "SQL", pct: 0 },
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
}

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { xp: 0, level: 1, completed: [], streak: 0, lastActive: "" };
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
