"""Seed the leaderboard with realistic users so it looks real in dev/demo.

This inserts users, progress rows, completions (using real challenge ids from
the registry, so XP and badge computation are consistent with the app), and
attempts. It is idempotent: users that already exist (by github_login) are
skipped, and existing data is never overwritten.

Only the top 1-2 users get a large XP / badge footprint (the "legendary"
leaders); everyone else tapers off naturally so the board reads clean and real.

Usage:
    python tools/seed_leaderboard.py
"""

from __future__ import annotations

import random
import sqlite3
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from registry import ChallengeRegistry  # noqa: E402

DB_PATH = ROOT / "backend" / "climbug.sqlite3"
DATA_FILE = ROOT / "src" / "data.ts"

random.seed(1337)  # deterministic seed -> same users every run


def now_iso(dt: datetime) -> str:
    return dt.isoformat()


# (name, github_login, target_xp, streak, member_days_ago)
# target_xp drives the whole profile: solves are generated to reach it.
SEED_USERS = [
    ("Ava Sterling", "ava-sterling", 11800, 34, 210),
    ("Kenji Watanabe", "kenji-watanabe", 8600, 21, 180),
    ("Priya Malhotra", "priya-malhotra", 6400, 14, 150),
    ("Lucas Ferreira", "lucas-ferreira", 4900, 9, 120),
    ("Mei Lin", "mei-lin", 3700, 7, 110),
    ("Omar Haddad", "omar-haddad", 2800, 5, 95),
    ("Sofia Rossi", "sofia-rossi", 2200, 4, 80),
    ("Ethan Walker", "ethan-walker", 1800, 3, 70),
    ("Noor Ahmed", "noor-ahmed", 1400, 2, 60),
    ("Ivan Petrov", "ivan-petrov", 1100, 1, 55),
    ("Grace Kim", "grace-kim", 850, 1, 45),
    ("Diego Alvarez", "diego-alvarez", 600, 0, 40),
    ("Fatima Zahra", "fatima-zahra", 450, 0, 30),
    ("Liam O'Connor", "liam-oconnor", 300, 0, 25),
    ("Anya Petrova", "anya-petrova", 180, 0, 20),
    ("Ravi Shankar", "ravi-shankar", 90, 0, 12),
    ("Chloe Martin", "chloe-martin", 30, 0, 6),
    ("Yusuf Demir", "yusuf-demir", 0, 0, 2),
]

# Difficulty -> how likely a solve is at that difficulty for mid/high users.
# Nightmare stays rare so the top users feel elite.
DIFF_POOL = ["Beginner", "Intermediate", "Advanced", "Nightmare"]
DIFF_WEIGHTS = [0.28, 0.42, 0.24, 0.06]
AVG_XP = 180

# guild_name -> list of github_logins (must match SEED_USERS). The first login
# of each guild is the guild leader.
GUILDS = {
    "Code Rangers": ["ava-sterling", "mei-lin", "omar-haddad", "sofia-rossi", "noor-ahmed", "g_rishabdixit402"],
    "Null Pointers": ["kenji-watanabe", "lucas-ferreira", "ethan-walker", "ivan-petrov", "grace-kim", "tester"],
    "Stack Overflowers": ["priya-malhotra", "diego-alvarez", "fatima-zahra", "ravi-shankar", "being-souL1230"],
}

# Which seeded users are friends with the local demo accounts that already
# exist in the DB (by github_login). Friendships are symmetric (A->B and B->A).
FRIENDS_WITH = {
    "being-souL1230": ["ava-sterling", "kenji-watanabe", "priya-malhotra", "lucas-ferreira"],
    "g_rishabdixit402": ["ava-sterling", "mei-lin", "sofia-rossi"],
    "tester": ["ethan-walker", "noor-ahmed"],
}


def pick_challenges(registry: ChallengeRegistry, target_xp: int) -> list[int]:
    """Choose a distinct set of real challenge ids that sum to ~target_xp."""
    pool = {d: [] for d in DIFF_POOL}
    for cid, meta in registry.all().items():
        pool.setdefault(meta.difficulty, []).append(cid)

    chosen: list[int] = []
    total = 0
    guard = 0
    while total < target_xp and guard < 600:
        guard += 1
        diff = random.choices(DIFF_POOL, weights=DIFF_WEIGHTS)[0]
        bucket = pool.get(diff, [])
        if not bucket:
            continue
        cid = random.choice(bucket)
        if cid in chosen:
            continue
        meta = registry.get(cid)
        if meta is None:
            continue
        chosen.append(cid)
        total += meta.xp
        if target_xp - total < 120 and random.random() < 0.5:
            break
    return chosen


def seed_guilds(conn: sqlite3.Connection, today: datetime) -> None:
    """Idempotently create guilds + memberships, and friend connections."""
    # ---- Guilds ----
    for name, logins in GUILDS.items():
        row = conn.execute("SELECT id FROM guilds WHERE name = ?", (name,)).fetchone()
        if row is None:
            cur = conn.execute("INSERT INTO guilds (name, tag, created_at) VALUES (?, ?, ?)",
                               (name, name[:3].upper(), today.isoformat()))
            guild_id = cur.lastrowid
            for i, login in enumerate(logins):
                u = conn.execute("SELECT id FROM users WHERE github_login = ?", (login,)).fetchone()
                if u is None:
                    continue
                role = "leader" if i == 0 else "member"
                conn.execute("INSERT OR IGNORE INTO guild_members (guild_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)",
                             (guild_id, u["id"], role, today.isoformat()))
            print(f"  • guild '{name}' seeded ({len(logins)} members)")
        else:
            guild_id = row["id"]
            for i, login in enumerate(logins):
                u = conn.execute("SELECT id FROM users WHERE github_login = ?", (login,)).fetchone()
                if u is None:
                    continue
                conn.execute("INSERT OR IGNORE INTO guild_members (guild_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)",
                             (guild_id, u["id"], "leader" if i == 0 else "member", today.isoformat()))
            print(f"  • guild '{name}' already exists — members ensured")

    # ---- Friendships (symmetric) ----
    for my_login, friends in FRIENDS_WITH.items():
        me = conn.execute("SELECT id FROM users WHERE github_login = ?", (my_login,)).fetchone()
        if me is None:
            continue
        for f_login in friends:
            friend = conn.execute("SELECT id FROM users WHERE github_login = ?", (f_login,)).fetchone()
            if friend is None:
                continue
            conn.execute("INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)",
                         (me["id"], friend["id"], today.isoformat()))
            conn.execute("INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)",
                         (friend["id"], me["id"], today.isoformat()))
    print("  • friendships seeded")


def main() -> None:
    registry = ChallengeRegistry(DATA_FILE)
    all_meta = registry.all()
    print(f"Registry loaded: {len(all_meta)} challenges\n")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    today = datetime.now(timezone.utc)

    created = 0
    skipped = 0
    for name, login, target_xp, streak, member_days_ago in SEED_USERS:
        exists = conn.execute("SELECT 1 FROM users WHERE github_login = ?", (login,)).fetchone()
        if exists:
            print(f"  • {login:<18} already exists — skipped")
            skipped += 1
            continue

        # ── user row ──
        created_at = (today - timedelta(days=member_days_ago)).isoformat()
        cur = conn.execute(
            """INSERT INTO users (github_login, name, avatar_url, html_url, public_repos,
                                  followers, following, created_at, updated_at, email, auth_provider)
               VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?, ?, 'github')""",
            (
                login,
                name,
                f"https://i.pravatar.cc/120?img={random.randint(1, 70)}",
                f"https://github.com/{login}",
                created_at,
                created_at,
                f"{login}@example.com",
            ),
        )
        user_id = cur.lastrowid

        # ── progress row ──
        xp = target_xp
        level = xp // 500 + 1
        last_active = (today - timedelta(days=1 if streak else random.randint(2, 6))).isoformat()
        conn.execute(
            "INSERT INTO progress (user_id, xp, level, streak, last_active) VALUES (?, ?, ?, ?, ?)",
            (user_id, xp, level, streak, last_active),
        )

        # ── completions (real challenge ids, real XP values) ──
        chosen = pick_challenges(registry, xp)
        n = len(chosen)
        # Spread solves across the member's history; active days are clustered
        # for the top users so streak/same-day badges unlock.
        span_days = max(3, member_days_ago)
        timestamps: list[datetime] = []
        for i in range(n):
            # Recent solves for users with a streak (keeps last_active honest)
            if streak >= 5 and i >= n - 6:
                day_offset = i - (n - 6)
                timestamps.append(today - timedelta(days=day_offset))
            else:
                timestamps.append(today - timedelta(days=random.randint(0, span_days)))
        # Cluster a handful of solves on the same day for the top 2 (badge 2/3)
        if target_xp >= 8000 and n >= 8:
            cluster_day = today - timedelta(days=random.randint(2, 10))
            for i in range(6):
                timestamps[i] = cluster_day

        for cid, ts in zip(chosen, timestamps):
            meta = registry.get(cid)
            if meta is None:
                continue
            conn.execute(
                """INSERT INTO completions (user_id, challenge_id, track_slug, difficulty,
                                            xp_awarded, completed_at, time_taken_sec)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    user_id,
                    cid,
                    meta.track_slug,
                    meta.difficulty,
                    meta.xp,
                    now_iso(ts),
                    random.choice([None, None, None, 45, 120, 300, 480, 660]),
                ),
            )

        # ── attempts (realistic open counts; most challenges solved in 1-3 tries) ──
        for cid in chosen:
            conn.execute(
                """INSERT INTO attempts (user_id, challenge_id, count, last_attempted_at)
                   VALUES (?, ?, ?, ?)""",
                (
                    user_id,
                    cid,
                    random.randint(1, 4 if target_xp < 5000 else 2),
                    now_iso(today - timedelta(days=random.randint(0, 6))),
                ),
            )

        conn.commit()
        created += 1
        print(f"  • {login:<18} created  xp={xp:<6} level={level:<3} solves={n}")

    # Guilds + friendships run after all users exist so every member resolves.
    conn.commit()
    print("\nSeeding guilds + friendships…")
    seed_guilds(conn, today)
    conn.commit()

    conn.close()
    print(f"\nDone: {created} users created, {skipped} skipped (already present).")


if __name__ == "__main__":
    main()
