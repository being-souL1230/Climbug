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
