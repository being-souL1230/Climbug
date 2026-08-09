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
