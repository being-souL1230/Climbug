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
