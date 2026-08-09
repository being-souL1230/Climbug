from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from typing import Any, Callable

from registry import ChallengeRegistry

# Time limit per difficulty (seconds) — mirrors timeByDiff in src/data.ts.
# Used by the "beat the timer" badge for hard challenges.
DIFF_TIME_LIMIT = {"Advanced": 480, "Nightmare": 660}


class BadgeContext:
    """Precomputed snapshot of a user's data used to evaluate badge rules."""

    def __init__(self, conn: Any, user_id: int, registry: ChallengeRegistry) -> None:
        self.registry = registry
        self.user_id = user_id

        prog = conn.execute("SELECT xp, level, streak FROM progress WHERE user_id = ?", (user_id,)).fetchone()
        self.xp: int = prog["xp"] if prog else 0
        self.level: int = prog["level"] if prog else 1
        self.streak: int = prog["streak"] if prog else 0

        user = conn.execute("SELECT created_at FROM users WHERE id = ?", (user_id,)).fetchone()
        self.created_at: str | None = user["created_at"] if user else None

        rows = conn.execute(
            "SELECT challenge_id, track_slug, difficulty, xp_awarded, completed_at, time_taken_sec "
            "FROM completions WHERE user_id = ?",
            (user_id,),
        ).fetchall()
        self.solves: list[dict[str, Any]] = [dict(r) for r in rows]

        attempt_rows = conn.execute(
            "SELECT challenge_id, count FROM attempts WHERE user_id = ?", (user_id,)
        ).fetchall()
        self.attempts: dict[int, int] = {r["challenge_id"]: r["count"] for r in attempt_rows}

        # ---- Global facts ----
        first_solve = conn.execute("SELECT MIN(completed_at) AS d FROM completions").fetchone()
        self.launch_day: str | None = None
        if first_solve and first_solve["d"]:
            try:
                self.launch_day = datetime.fromisoformat(first_solve["d"]).date().isoformat()
            except Exception:
                pass

        rank_row = conn.execute(
            "SELECT COUNT(*) AS ahead FROM progress p "
            "WHERE p.xp > (SELECT COALESCE(xp, 0) FROM progress WHERE user_id = ?)",
            (user_id,),
        ).fetchone()
        self.rank: int = (rank_row["ahead"] if rank_row else 0) + 1

        # How many registered users exist. Rank badges must not unlock while the
        # platform is tiny (e.g. 3 users -> everyone is "top 10").
        user_count = conn.execute("SELECT COUNT(*) AS n FROM users").fetchone()
        self.total_users: int = user_count["n"] if user_count else 0

        # ---- Aggregates over this user's solves ----
        self.total: int = len(self.solves)
        self.by_track: Counter[str] = Counter(r["track_slug"] for r in self.solves)
        self.by_diff: Counter[str] = Counter(r["difficulty"] for r in self.solves)
        self.track_count: int = len(self.by_track)
        self.total_challenges: int = len(self.registry.all())
        self.track_totals: Counter[str] = Counter(m.track_slug for m in self.registry.all().values())

        def _dt(iso: str) -> datetime | None:
            """Parse completed_at (stored as UTC) into the server's local time so
            time-of-day badges (night owl, dawn raider, midnight, halloween)
            match the user's local clock, not UTC."""
            try:
                return datetime.fromisoformat(iso).astimezone()
            except Exception:
                return None

        self.times: list[datetime | None] = [_dt(r["completed_at"]) for r in self.solves]
        self.timed: list[dict[str, Any]] = [r for r in self.solves if r["time_taken_sec"] is not None]
        self.per_day: Counter[str] = Counter()
        self.per_hour: Counter[str] = Counter()
        self.night: int = 0       # solves 12am-6am
        self.dawn: int = 0        # solves 5am-9am
        self.midnight: bool = False
        self.jan_solves: int = 0
        self.halloween_solves: int = 0
        self.on_launch_day: bool = False
        for r, dt in zip(self.solves, self.times):
            if dt is None:
                continue
            day = dt.strftime("%Y-%m-%d")
            self.per_day[day] += 1
            self.per_hour[dt.strftime("%Y-%m-%d %H")] += 1
            if 0 <= dt.hour < 6:
                self.night += 1
            if 5 <= dt.hour < 9:
                self.dawn += 1
            if dt.hour == 0 and dt.minute == 0:
                self.midnight = True
            if dt.month == 1:
                self.jan_solves += 1
            if dt.month == 10 and dt.day == 31:
                self.halloween_solves += 1
            if self.launch_day and day == self.launch_day:
                self.on_launch_day = True

        self.member_days: int | None = None
        if self.created_at:
            try:
                created = datetime.fromisoformat(self.created_at)
                self.member_days = (datetime.now(timezone.utc) - created).days
            except Exception:
                pass

        # ---- Per-solve derived stats ----
        self.hint_free: int = 0     # solves with 0 hints (hint == 10 XP penalty)
        self.perfect_runs: int = 0  # solves with 0 XP penalty
        self.one_shots: int = 0     # solves where the challenge was opened exactly once
        self.fast_under_10: int = 0
        self.fast_under_5: int = 0
        self.fast_under_2: int = 0
        self.fast_under_1: int = 0
        self.hard_on_time: int = 0  # Advanced/Nightmare solves inside the timer
        # Speed badges only credit Advanced/Nightmare solves — speed must be
        # earned on hard problems, not trivially fast beginner ones.
        self.fast_hard_under_10: int = 0
        self.fast_hard_under_5: int = 0
        self.fast_hard_under_2: int = 0
        for r in self.solves:
            meta = self.registry.get(r["challenge_id"])
            base_xp = meta.xp if meta else r["xp_awarded"]
            penalty = max(0, base_xp - r["xp_awarded"])
            hints = penalty // 10
            if hints == 0:
                self.hint_free += 1
            if penalty == 0:
                self.perfect_runs += 1
            if self.attempts.get(r["challenge_id"], 1) == 1:
                self.one_shots += 1
            t = r["time_taken_sec"]
            if t is not None:
                if t < 600:
                    self.fast_under_10 += 1
                if t < 300:
                    self.fast_under_5 += 1
                if t < 120:
                    self.fast_under_2 += 1
                if t < 60:
                    self.fast_under_1 += 1
                limit = DIFF_TIME_LIMIT.get(r["difficulty"])
                if limit is not None and t < limit:
                    self.hard_on_time += 1
                if r["difficulty"] in ("Advanced", "Nightmare"):
                    if t < 600:
                        self.fast_hard_under_10 += 1
                    if t < 300:
                        self.fast_hard_under_5 += 1
                    if t < 120:
                        self.fast_hard_under_2 += 1

        avg = [r["time_taken_sec"] for r in self.timed]
        self.avg_time: float | None = (sum(avg) / len(avg)) if avg else None


def _make_rules() -> dict[int, Callable[[BadgeContext], bool]]:
    """Badge id -> unlock rule. Ids match the Badge[] definitions in src/badges.ts.

    Badges tied to features that don't exist yet (guilds, community,
    boss battles, events) stay locked until those features land.
    """

    def most_per_day(c: BadgeContext) -> int:
        return max(c.per_day.values(), default=0)

    def most_per_hour(c: BadgeContext) -> int:
        return max(c.per_hour.values(), default=0)

    return {
        1:  lambda c: c.total >= 1,
        2:  lambda c: most_per_day(c) >= 3,
        3:  lambda c: most_per_day(c) >= 7,
        4:  lambda c: most_per_day(c) >= 15,
        5:  lambda c: c.streak >= 7,
        6:  lambda c: c.streak >= 30,
        7:  lambda c: c.total >= 100,
        8:  lambda c: c.fast_hard_under_10 >= 5,
        9:  lambda c: c.night >= 10,
        10: lambda c: c.dawn >= 10,
        11: lambda c: c.fast_hard_under_2 >= 1,
        12: lambda c: c.fast_hard_under_5 >= 10,
        13: lambda c: c.fast_under_1 >= 3,
        14: lambda c: most_per_hour(c) >= 5,
        15: lambda c: most_per_day(c) >= 25,
        16: lambda c: c.one_shots >= 5,
        17: lambda c: c.hint_free >= 20,
        18: lambda c: c.perfect_runs >= 5,
        19: lambda c: c.hard_on_time >= 20,
        20: lambda c: len(c.timed) >= 10 and c.avg_time is not None and c.avg_time < 180,
        21: lambda c: c.by_track.get("python", 0) >= 10,
        22: lambda c: c.by_track.get("python", 0) >= c.track_totals.get("python", 40),
        23: lambda c: c.by_track.get("javascript", 0) >= 10,
        24: lambda c: c.by_track.get("javascript", 0) >= c.track_totals.get("javascript", 40),
        25: lambda c: c.by_track.get("sql", 0) >= 10,
        26: lambda c: c.by_track.get("sql", 0) >= c.track_totals.get("sql", 40),
        27: lambda c: c.track_count >= 3,
        28: lambda c: c.by_diff.get("Nightmare", 0) >= 10,
        29: lambda c: False,  # boss battles not implemented yet
        30: lambda c: c.total >= 100,
        31: lambda c: False,  # guilds not implemented
        32: lambda c: False,  # guilds not implemented
        33: lambda c: False,  # mentoring not implemented
        34: lambda c: False,  # community votes not implemented
        35: lambda c: False,  # bug reporting not implemented
        36: lambda c: False,  # events not implemented
        37: lambda c: c.total >= 1 and c.total_users >= 100 and c.rank <= 100,
        38: lambda c: c.total >= 1 and c.total_users >= 1000 and c.rank <= 10,
        39: lambda c: c.on_launch_day,
        40: lambda c: c.halloween_solves >= 20,
        41: lambda c: c.jan_solves >= 31,
        42: lambda c: c.member_days is not None and c.member_days >= 365,
        43: lambda c: False,  # pre-launch beta only
        44: lambda c: False,  # community hunt winners
        45: lambda c: False,  # seasonal event completion
        46: lambda c: c.hint_free >= 50,
        47: lambda c: c.midnight,
        48: lambda c: c.level >= 30,
        49: lambda c: c.streak >= 100,
        50: lambda c: c.total >= c.total_challenges,
        # ---- Milestones (51-58) — new badge artwork added with the app ----
        51: lambda c: c.total >= 15,
        52: lambda c: c.track_count >= 2,
        53: lambda c: c.by_diff.get("Advanced", 0) >= 3,
        54: lambda c: c.level >= 5,
        55: lambda c: most_per_day(c) >= 5,
        56: lambda c: c.total >= 150,
        57: lambda c: c.fast_under_1 >= 10,
        58: lambda c: c.perfect_runs >= 25,
    }


_RULES = _make_rules()
BADGE_COUNT = len(_RULES)


def compute_badges(ctx: BadgeContext) -> dict[int, bool]:
    """Return {badge_id: unlocked} for every defined badge."""
    return {bid: rule(ctx) for bid, rule in _RULES.items()}
