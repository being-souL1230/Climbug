"""Weekly Boss Arena engine.

Bosses are generated deterministically from the ISO week so every player
faces the SAME boss all week, and the fight gets HARDER every week
(toughness scales with the number of weeks since the arena opened).

All fight state lives in SQLite (bosses + boss_attempts tables) so fights are
realtime, persistent and manageable. The frontend never sees the check keys —
only this module knows the exact fix that beats the boss.
"""
from __future__ import annotations

import hashlib
import sqlite3
from dataclasses import dataclass
from datetime import date, datetime, timezone
from typing import Any

# The week the arena opened (first boss week). Toughness is derived from this.
ARENA_EPOCH = date(2026, 8, 9)


@dataclass(frozen=True)
class BossArchetype:
    name: str
    title: str
    lang: str
    monaco: str
    desc: str
    bug: str
    expected_error: str
    starter_code: str
    # Multi-part fix: EVERY substring must be present in the submitted code.
    # This makes brute-forcing useless and the fight genuinely hard.
    check_key_parts: tuple[str, ...]
    base_xp: int
    time_limit_sec: int
    max_lives: int


# ─────────────────────────────────────────────────────────────────────────────
# The boss pool — hand-crafted, genuinely hard bugs. No easy fights.
# ─────────────────────────────────────────────────────────────────────────────

BOSSES: list[BossArchetype] = [
    # 1 — Python: data race + off-by-one + deadlock temptation
    BossArchetype(
        name="RaceKraken",
        title="Kraken of the Broken Queue",
        lang="Python",
        monaco="python",
        desc=(
            "A bank processes 10,000 transactions through a thread pool. "
            "The nightly audit shows a different balance every single run. "
            "Fix the race so every transaction is counted EXACTLY once — no "
            "duplicates, no losses, and the pool must still drain fully."
        ),
        bug=(
            "The shared counter is mutated from many threads with no lock, "
            "and the worker loop exits one transaction early (off-by-one). "
            "Threads also join too eagerly, so the pool races the ledger."
        ),
        expected_error="AssertionError: balance != sum of deposits",
        starter_code=(
            "import threading\n"
            "import random\n"
            "\n"
            "DEPOSITS = [random.randint(1, 100) for _ in range(10_000)]\n"
            "balance = 0\n"
            "\n"
            "\n"
            "def worker(start, end):\n"
            "    global balance\n"
            "    for i in range(start, end - 1):  # sneaky off-by-one\n"
            "        balance += DEPOSITS[i]\n"
            "\n"
            "\n"
            "threads = []\n"
            "N = 10_000\n"
            "STEP = 1_000\n"
            "for start in range(0, N, STEP):\n"
            "    t = threading.Thread(target=worker, args=(start, start + STEP))\n"
            "    threads.append(t)\n"
            "    t.start()\n"
            "    t.join()  # joins inside the loop -> serializes AND races\n"
            "\n"
            "assert balance == sum(DEPOSITS), \"balance != sum of deposits\"\n"
            "print(\"OK\", balance)\n"
        ),
        check_key_parts=("Lock()", "with lock", "global balance"),
        base_xp=900,
        time_limit_sec=900,
        max_lives=4,
    ),
    # 2 — Java: null-deref chain + wrong loop bound
    BossArchetype(
        name="NullPointerius Maximus",
        title="The One Who Nulls",
        lang="Java",
        monaco="java",
        desc=(
            "A payment pipeline maps orders to customers to addresses. Every "
            "few hundred orders the pipeline dies with a NullPointerException. "
            "Make the pipeline null-safe AND keep the address lookup working "
            "for every order — no skipped orders allowed."
        ),
        bug=(
            "orders can have a missing customer, customers can have a missing "
            "address, and the loop that rebuilds the map skips the final order."
        ),
        expected_error="java.lang.NullPointerException: Cannot invoke \"Customer.getAddress()\"",
        starter_code=(
            "import java.util.*;\n"
            "\n"
            "public class Pipeline {\n"
            "    record Order(int id, Customer customer) {}\n"
            "    record Customer(String name, Address address) {}\n"
            "    record Address(String city) {}\n"
            "\n"
            "    static Map<Integer, String> cityByOrderId(List<Order> orders) {\n"
            "        Map<Integer, String> out = new HashMap<>();\n"
            "        for (int i = 0; i < orders.size() - 1; i++) { // skips the last order\n"
            "            Order o = orders.get(i);\n"
            "            Customer c = o.customer();\n"
            "            Address a = c.getAddress();       // NPE when customer is null\n"
            "            out.put(o.id(), a.city());\n"
            "        }\n"
            "        return out;\n"
            "    }\n"
            "}\n"
        ),
        check_key_parts=("isEmpty()", "getAddress()", "orders.size()"),
        base_xp=950,
        time_limit_sec=900,
        max_lives=4,
    ),
    # 3 — JavaScript: closure-in-loop + stale cache
    BossArchetype(
        name="Closurewyrm",
        title="The Serpent of Stale State",
        lang="JavaScript",
        monaco="javascript",
        desc=(
            "A stock ticker renders 12 price feeds, but every feed shows the "
            "LAST row's price, and the cache serves stale quotes after 5s. "
            "Fix the closures and make the cache expire — every feed must "
            "show its own live price."
        ),
        bug=(
            "var i in the loop binds every closure to the final index, and the "
            "quote cache never invalidates entries older than 5 seconds."
        ),
        expected_error="TypeError: Cannot read properties of undefined (reading 'price')",
        starter_code=(
            "const feeds = Array.from({ length: 12 }, (_, k) => ({ id: k, price: 100 + k }));\n"
            "const cache = {};\n"
            "\n"
            "function fetchQuote(id) {\n"
            "    return new Promise((res) => setTimeout(() => res({ id, price: Math.random() * 500 }), 50));\n"
            "}\n"
            "\n"
            "for (var i = 0; i < feeds.length; i++) {\n"
            "    const render = () => renderFeed(feeds[i].id, feeds[i].price); // stale i\n"
            "    setInterval(render, 1000);\n"
            "}\n"
            "\n"
            "async function getQuote(id) {\n"
            "    if (cache[id]) return cache[id].price; // never expires\n"
            "    const q = await fetchQuote(id);\n"
            "    cache[id] = { t: Date.now(), price: q.price };\n"
            "    return q.price;\n"
            "}\n"
            "\n"
            "function renderFeed(id, price) {\n"
            "    const row = feeds.find((f) => f.id === id);\n"
            "    console.log(id, row.price ?? price);\n"
            "}\n"
        ),
        check_key_parts=("let i", "Date.now() - cache[id].t", "f.price"),
        base_xp=1000,
        time_limit_sec=840,
        max_lives=4,
    ),
    # 4 — SQL: broken aggregation + row multiplication
    BossArchetype(
        name="JoinHydra",
        title="The Beast of Multiplied Rows",
        lang="SQL",
        monaco="sql",
        desc=(
            "A reporting query that sums revenue per customer returns 40x the "
            "real totals because a JOIN to a one-to-many table multiplies rows. "
            "Fix the query so each customer shows their TRUE total — no "
            "multiplication, no NULL customers dropped."
        ),
        bug=(
            "The orders JOINed against payments duplicates every order once per "
            "payment, and customers without payments vanish from the report."
        ),
        expected_error="Wrong SUM: revenue inflated by row multiplication",
        starter_code=(
            "-- returns inflated totals\n"
            "SELECT c.id, c.name, SUM(o.amount) AS revenue\n"
            "FROM customers c\n"
            "JOIN orders o ON o.customer_id = c.id\n"
            "JOIN payments p ON p.order_id = o.id\n"
            "WHERE c.active = 1\n"
            "GROUP BY c.id, c.name;\n"
        ),
        check_key_parts=("SUM(", "COUNT(DISTINCT", "LEFT JOIN"),
        base_xp=1000,
        time_limit_sec=840,
        max_lives=4,
    ),
    # 5 — C: stack overflow + wrong boundary check
    BossArchetype(
        name="BufferGorgon",
        title="The Devourer of Stack Frames",
        lang="C",
        monaco="c",
        desc=(
            "A telemetry parser copies a variable-length packet into a fixed "
            "stack buffer. One malformed packet corrupts the return address. "
            "Make the copy bounded and handle the truncated packet safely."
        ),
        bug=(
            "strcpy into a 32-byte buffer, and the length check accepts "
            "packets that are exactly one byte too long."
        ),
        expected_error="stack smashing detected: terminated",
        starter_code=(
            "#include <stdio.h>\n"
            "#include <string.h>\n"
            "\n"
            "char buf[32];\n"
            "\n"
            "void parse_packet(const char *data, size_t len) {\n"
            "    if (len > 32) {           // off-by-one: len == 32 is allowed\n"
            "        puts(\"too long\");\n"
            "        return;\n"
            "    }\n"
            "    strcpy(buf, data);        // no NUL room\n"
            "    printf(\"parsed: %s\\n\", buf);\n"
            "}\n"
            "\n"
            "int main(void) {\n"
            "    const char *pkt = \"A\\0B\\0C\\0D\\0E\\0F\\0G\\0H\\0I\\0J\\0K\\0L\\0M\\0N\\0O\\0P\\0Q\\0R\\0S\\0T\\0U\\0V\\0W\\0X\\0Y\\0Z\\0a\\0b\";\n"
            "    parse_packet(pkt, strlen(pkt));\n"
            "    return 0;\n"
            "}\n"
        ),
        check_key_parts=("snprintf", "sizeof(buf)", "len >= sizeof(buf)"),
        base_xp=1050,
        time_limit_sec=780,
        max_lives=3,
    ),
    # 6 — C++: dangling reference + missed ownership
    BossArchetype(
        name="PhantomRef",
        title="The Ghost of Freed Memory",
        lang="C++",
        monaco="cpp",
        desc=(
            "A renderer keeps a reference to a temporary that dies at the end "
            "of a scope, then reads it — undefined behaviour that sometimes "
            "renders, sometimes crashes. Fix the lifetime so the mesh data "
            "outlives every use."
        ),
        bug=(
            "MeshLoader returns a reference to a stack temporary, and the "
            "scene stores it past its lifetime."
        ),
        expected_error="Segmentation fault (core dumped) / corrupted mesh",
        starter_code=(
            "#include <vector>\n"
            "#include <string>\n"
            "\n"
            "struct Mesh { std::vector<float> verts; std::string name; };\n"
            "\n"
            "const Mesh& loadMesh(const std::string& path) {\n"
            "    Mesh local;                 // dies here\n"
            "    local.name = path;\n"
            "    local.verts = {0.0f, 1.0f, 0.5f};\n"
            "    return local;               // dangling reference\n"
            "}\n"
            "\n"
            "int main() {\n"
            "    const Mesh& scene = loadMesh(\"hero.obj\");\n"
            "    float x = scene.verts[0];   // UB\n"
            "    return (int)(x * 0);\n"
            "}\n"
        ),
        check_key_parts=("unique_ptr", "return std::move", "->verts"),
        base_xp=1100,
        time_limit_sec=780,
        max_lives=3,
    ),
]


def week_key(d: date | None = None) -> str:
    """Stable per-week key, e.g. '2026-W32'."""
    d = d or datetime.now(timezone.utc).date()
    return f"{d.year}-W{d.isocalendar().week:02d}"


def week_number(d: date | None = None) -> int:
    """Ascending week counter (toughness). Week 1 = the arena's opening week."""
    d = d or datetime.now(timezone.utc).date()
    return max(1, (d - ARENA_EPOCH).days // 7 + 1)


def build_boss_for_week(week: str, toughness: int) -> dict[str, Any]:
    """Deterministically pick a boss archetype and scale it for this week."""
    seed = int(hashlib.md5(week.encode("utf-8")).hexdigest()[:8], 16)
    arch = BOSSES[seed % len(BOSSES)]

    # Toughness scaling — every week bites harder:
    # XP reward climbs, the time limit shrinks, and lives cap lower.
    xp_reward = arch.base_xp + (toughness - 1) * 75
    time_limit = max(600, arch.time_limit_sec - (toughness - 1) * 30)
    max_lives = max(2, arch.max_lives - ((toughness - 1) // 3))

    return {
        "week": week,
        "week_number": toughness,
        "name": arch.name,
        "title": arch.title,
        "lang": arch.lang,
        "monaco": arch.monaco,
        "desc": arch.desc,
        "bug": arch.bug,
        "expected_error": arch.expected_error,
        "starter_code": arch.starter_code,
        "check_key_parts": list(arch.check_key_parts),
        "xp_reward": xp_reward,
        "time_limit_sec": time_limit,
        "max_lives": max_lives,
    }


def ensure_week_boss(conn: sqlite3.Connection) -> dict[str, Any]:
    """Make sure the current week's boss exists in the DB and return it.

    The boss row is the source of truth for the frontend + submissions;
    an admin could tweak the row directly in the DB to override the weekly.
    """
    week = week_key()
    toughness = week_number()
    row = conn.execute("SELECT * FROM bosses WHERE week = ?", (week,)).fetchone()
    if row is None:
        boss = build_boss_for_week(week, toughness)
        # INSERT OR IGNORE makes concurrent first-requests safe (week is UNIQUE).
        conn.execute(
            """INSERT OR IGNORE INTO bosses
               (week, week_number, name, title, lang, monaco, desc, bug,
                expected_error, check_key, starter_code, xp_reward,
                time_limit_sec, max_lives)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                boss["week"], boss["week_number"], boss["name"], boss["title"],
                boss["lang"], boss["monaco"], boss["desc"], boss["bug"],
                boss["expected_error"],
                "\x1f".join(boss["check_key_parts"]),  # \x1f never appears in code
                boss["starter_code"], boss["xp_reward"],
                boss["time_limit_sec"], boss["max_lives"],
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM bosses WHERE week = ?", (week,)).fetchone()
    return dict(row)


def public_boss(row: dict[str, Any]) -> dict[str, Any]:
    """Boss payload safe to send to clients — never includes the check key."""
    return {
        "id": row["id"],
        "week": row["week"],
        "weekNumber": row["week_number"],
        "name": row["name"],
        "title": row["title"],
        "lang": row["lang"],
        "monaco": row["monaco"],
        "desc": row["desc"],
        "bug": row["bug"],
        "expectedError": row["expected_error"],
        "starterCode": row["starter_code"],
        "xpReward": row["xp_reward"],
        "timeLimitSec": row["time_limit_sec"],
        "maxLives": row["max_lives"],
    }


def check_solution(boss_row: dict[str, Any], code: str) -> bool:
    """All check-key parts must be present for the fix to count."""
    parts = boss_row["check_key"].split("\x1f") if boss_row["check_key"] else []
    if not parts:
        return False
    return all(part in code for part in parts)
