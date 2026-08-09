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
