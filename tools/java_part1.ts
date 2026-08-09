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
