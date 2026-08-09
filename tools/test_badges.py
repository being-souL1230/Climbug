"""Quick functional test for backend/badges.py.

Creates a temp sqlite DB with synthetic users/completions and asserts that the
badge engine unlocks exactly the badges the data should earn.
"""

import sqlite3
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from badges import BadgeContext, compute_badges  # noqa: E402
from registry import ChallengeRegistry  # noqa: E402

DATA = Path(__file__).resolve().parents[1] / "src" / "data.ts"
registry = ChallengeRegistry(DATA)


def make_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(tempfile.mkstemp(suffix=".sqlite3")[1])
    conn.row_factory = sqlite3.Row
    conn.executescript(
        """
        CREATE TABLE users (id INTEGER PRIMARY KEY, created_at TEXT);
        CREATE TABLE progress (user_id INTEGER PRIMARY KEY, xp INTEGER, level INTEGER, streak INTEGER);
        CREATE TABLE completions (
          user_id INTEGER, challenge_id INTEGER, track_slug TEXT, difficulty TEXT,
          xp_awarded INTEGER, completed_at TEXT, time_taken_sec INTEGER
        );
        CREATE TABLE attempts (user_id INTEGER, challenge_id INTEGER, count INTEGER);
        """
    )
    return conn


def add_user(conn, uid: int, xp: int, streak: int = 0, created_at: str | None = None) -> None:
    conn.execute("INSERT INTO users (id, created_at) VALUES (?, ?)", (uid, created_at or now_iso()))
    conn.execute("INSERT INTO progress (user_id, xp, level, streak) VALUES (?, ?, ?, ?)", (uid, xp, (xp // 500) + 1, streak))


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def add_solve(conn, uid: int, cid: int, when: str | None = None, time_taken: int | None = None, penalty: int = 0) -> None:
    meta = registry.get(cid)
    assert meta, f"challenge {cid} not in registry"
    conn.execute(
        "INSERT INTO completions (user_id, challenge_id, track_slug, difficulty, xp_awarded, completed_at, time_taken_sec) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (uid, cid, meta.track_slug, meta.difficulty, max(0, meta.xp - penalty), when or now_iso(), time_taken),
    )


def badges_for(conn, uid: int) -> dict[int, bool]:
    return compute_badges(BadgeContext(conn, uid, registry))


def seed_users(conn, start_uid: int, count: int, xp: int) -> None:
    """Add `count` filler users with the given XP so leaderboard ranks are real."""
    for i in range(count):
        add_user(conn, start_uid + i, xp=xp)


def check(label: str, cond: bool) -> None:
    status = "OK " if cond else "FAIL"
    print(f"[{status}] {label}")
    assert cond, label


def main() -> None:
    conn = make_conn()
    try:
        # ---- Seed a big leaderboard so rank badges mean something ----
        # 1000 filler users (xp=100), 20 mid-tier users (xp=3000)
        seed_users(conn, 100, 1000, xp=100)
        seed_users(conn, 2000, 20, xp=3000)

        # ---- User A: heavy early user ----
        add_user(conn, 1, xp=500, streak=7, created_at=(datetime.now(timezone.utc) - timedelta(days=400)).isoformat())
        day1 = (datetime.now(timezone.utc) - timedelta(days=2)).strftime("%Y-%m-%dT12:00:00")
        # 10 python solves on one day -> Bug Streak I + Python Novice; first_blood
        for cid in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10):
            add_solve(conn, 1, cid, when=day1, time_taken=90)
        # a fast solve under 2 min -> Speedrunner I (90s < 120s)
        # an Advanced solve under its 8-min limit -> counts toward Time Lord
        add_solve(conn, 1, 21, when=day1, time_taken=300, penalty=10)  # 1 hint used
        add_solve(conn, 1, 131, when=day1, time_taken=400)  # nightmare under 660

        b1 = badges_for(conn, 1)
        check("First Blood (1)", b1[1])
        check("Bug Streak I (2)", b1[2])
        check("Week Warrior (5)", b1[5])
        check("Python Novice (21)", b1[21])
        check("Python Master (22) NOT yet", not b1[22])
        check("Speedrunner I (11)", b1[11])
        check("Century Club (7) NOT yet", not b1[7])
        check("Nightmare Slayer (28) NOT yet", not b1[28])
        check("Perfect Run (18) (6/7 solves clean)", b1[18])
        check("No Hints Needed (17) (11 hint-free solves)", b1[17])
        check("One Shot (16)", b1[16])  # attempts table empty -> count defaults to 1
        check("Anniversary (42)", b1[42])  # 400 days old
        # A has 12 solves, rank 21 of 1021 users -> top 100 yes, top 10 no
        check("Leaderboard Climber (37) for rank-21 A", b1[37])
        check("Global Legend (38) NOT for rank-21 A", not b1[38])

        # add attempt rows so one solve has attempts=2 -> one_shot still true via others
        conn.execute("INSERT INTO attempts (user_id, challenge_id, count) VALUES (1, 1, 2)")
        b1b = badges_for(conn, 1)
        check("One Shot still true (16)", b1b[16])

        # ---- User B: top of leaderboard, 10 nightmare solves ----
        add_user(conn, 2, xp=6000, streak=31)  # rank 1 of 1023 users
        for cid in (31, 32, 33, 34, 35, 36, 37, 38, 39, 40):
            add_solve(conn, 2, cid, time_taken=30)
        b2 = badges_for(conn, 2)
        check("Global Legend top10 (38)", b2[38])
        check("Nightmare Slayer (28)", b2[28])
        check("Lightning Hands (13)", b2[13])  # 10 solves under 60s
        check("Month Legend (6)", b2[6])
        check("Code Phantom (48) NOT (xp too high)", not b2[48])

        # User A: 21 users ahead (B + 20 mid-tier) -> rank 22, top 100 but NOT top 10
        b1c = badges_for(conn, 1)
        check("Leaderboard Climber (37) for A", b1c[37])
        check("Global Legend (38) NOT for rank-22 user", not b1c[38])

        # ---- User C: brand new, no solves ----
        add_user(conn, 3, xp=0)
        b3 = badges_for(conn, 3)
        check("New user has nothing (1)", not b3[1])
        check("New user NO Leaderboard Climber (37)", not b3[37])
        check("New user NO Global Legend (38)", not b3[38])
        check("Feature-less badges stay locked (29/31/33/43)", not (b3[29] or b3[31] or b3[33] or b3[43]))

        print("ALL BADGE TESTS PASSED")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
