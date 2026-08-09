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
