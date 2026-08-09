from __future__ import annotations

import hashlib
import os
import random
import sqlite3
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path
from typing import Any, Callable

import requests
from flask import Flask, jsonify, redirect, request, session
from flask_cors import CORS

from registry import ChallengeRegistry, DIFFICULTIES, normalize_code


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.environ.get("CLIMBUG_DB", ROOT / "backend" / "climbug.sqlite3"))
DATA_FILE = ROOT / "src" / "data.ts"


def load_env() -> None:
    env_paths = [ROOT / "backend" / ".env", ROOT / ".env"]
    for env_path in env_paths:
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k.strip() not in os.environ:
                        os.environ[k.strip()] = v.strip().strip("'").strip('"')

load_env()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5000")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

app = Flask(__name__)
app.secret_key = os.environ.get("CLIMBUG_SECRET") or os.environ.get("SESSION_SECRET", "dev-only-change-this-secret")
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SEND_FILE_MAX_AGE_DEFAULT=31536000,  # 1 year cache for static assets
)
CORS(
    app,
    supports_credentials=True,
    origins=os.environ.get("CLIMBUG_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5000,http://127.0.0.1:5000").split(","),
)

registry = ChallengeRegistry(DATA_FILE)


@app.after_request
def add_cache_headers(response: Any) -> Any:
    """Add cache headers for static assets (images, etc)"""
    if request.path.startswith("/images/"):
        # Cache images for 1 year (immutable assets)
        response.cache_control.max_age = 31536000
        response.cache_control.public = True
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              github_login TEXT UNIQUE,
              name TEXT,
              avatar_url TEXT,
              html_url TEXT,
              public_repos INTEGER DEFAULT 0,
              followers INTEGER DEFAULT 0,
              following INTEGER DEFAULT 0,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              email TEXT,
              auth_provider TEXT DEFAULT 'github',
              google_id TEXT
            );

            CREATE TABLE IF NOT EXISTS progress (
              user_id INTEGER PRIMARY KEY,
              xp INTEGER NOT NULL DEFAULT 0,
              level INTEGER NOT NULL DEFAULT 1,
              streak INTEGER NOT NULL DEFAULT 0,
              last_active TEXT,
              FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS completions (
              user_id INTEGER NOT NULL,
              challenge_id INTEGER NOT NULL,
              track_slug TEXT,
              difficulty TEXT,
              xp_awarded INTEGER NOT NULL,
              completed_at TEXT NOT NULL,
              PRIMARY KEY(user_id, challenge_id),
              FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS profiles (
              user_id INTEGER PRIMARY KEY,
              email TEXT,
              phone TEXT,
              qualification TEXT,
              about TEXT,
              github_url TEXT,
              linkedin_url TEXT,
              leetcode_url TEXT,
              gitlab_url TEXT,
              twitter_url TEXT,
              portfolio_url TEXT,
              stackoverflow_url TEXT,
              devto_url TEXT,
              updated_at TEXT,
              FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS attempts (
              user_id INTEGER NOT NULL,
              challenge_id INTEGER NOT NULL,
              count INTEGER NOT NULL DEFAULT 0,
              last_attempted_at TEXT,
              PRIMARY KEY(user_id, challenge_id),
              FOREIGN KEY(user_id) REFERENCES users(id)
            );
            """
        )
        # Run schema migrations for existing DB
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(users)")
        cols = [row[1] for row in cursor.fetchall()]
        if "email" not in cols:
            cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
        if "auth_provider" not in cols:
            cursor.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'github'")
        if "google_id" not in cols:
            cursor.execute("ALTER TABLE users ADD COLUMN google_id TEXT")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def current_user_id() -> int | None:
    uid = session.get("user_id")
    return int(uid) if uid else None


def require_auth(fn: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(fn)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        if current_user_id() is None:
            return jsonify({"error": "Authentication required"}), 401
        return fn(*args, **kwargs)
    return wrapper


def serialize_user(row: sqlite3.Row) -> dict[str, Any]:
    keys = row.keys()
    login = row["github_login"] if "github_login" in keys and row["github_login"] else (row["email"] if "email" in keys and row["email"] else f"user_{row['id']}")
    provider = row["auth_provider"] if "auth_provider" in keys and row["auth_provider"] else "github"
    email = row["email"] if "email" in keys else None
    return {
        "login": login,
        "name": row["name"],
        "avatar_url": row["avatar_url"],
        "html_url": row["html_url"] if "html_url" in keys and row["html_url"] else "",
        "public_repos": row["public_repos"] if "public_repos" in keys and row["public_repos"] else 0,
        "followers": row["followers"] if "followers" in keys and row["followers"] else 0,
        "following": row["following"] if "following" in keys and row["following"] else 0,
        "email": email,
        "provider": provider,
    }


def get_progress(conn: sqlite3.Connection, user_id: int) -> dict[str, Any]:
    row = conn.execute("SELECT * FROM progress WHERE user_id = ?", (user_id,)).fetchone()
    if row is None:
        conn.execute("INSERT INTO progress (user_id) VALUES (?)", (user_id,))
        row = conn.execute("SELECT * FROM progress WHERE user_id = ?", (user_id,)).fetchone()
    completed = [
        r["challenge_id"]
        for r in conn.execute("SELECT challenge_id FROM completions WHERE user_id = ? ORDER BY completed_at", (user_id,))
    ]
    attempts = {
        r["challenge_id"]: r["count"]
        for r in conn.execute("SELECT challenge_id, count FROM attempts WHERE user_id = ?", (user_id,))
    }
    return {
        "xp": row["xp"],
        "level": row["level"],
        "streak": row["streak"],
        "lastActive": row["last_active"] or "",
        "completed": completed,
        "attempts": attempts,
    }


@app.before_request
def _ensure_db() -> None:
    init_db()


@app.get("/")
def index() -> Any:
    return jsonify({
        "message": "Climbug Backend API is running!",
        "version": "1.0.0",
        "endpoints": ["/api/auth/github-username", "/api/auth/google", "/api/me", "/api/progress", "/api/challenges/<id>/submit"]
    })

@app.get("/api/health")
def health() -> Any:
    return jsonify({
        "ok": True,
        "registry_size": len(registry.all()),
        "github_oauth": bool(GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET),
        "google_oauth": bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET),
    })


@app.get("/api/auth/config")
def auth_config() -> Any:
    return jsonify({
        "github_configured": bool(GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET),
        "google_configured": bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET),
        "github_client_id": GITHUB_CLIENT_ID,
        "google_client_id": GOOGLE_CLIENT_ID,
    })


def get_github_redirect_uri() -> str:
    if os.environ.get("GITHUB_REDIRECT_URI"):
        return os.environ["GITHUB_REDIRECT_URI"]
    req_uri = request.args.get("redirect_uri")
    if req_uri:
        return req_uri
    return f"{BACKEND_URL}/api/auth/github/callback"


def get_google_redirect_uri() -> str:
    if os.environ.get("GOOGLE_REDIRECT_URI"):
        return os.environ["GOOGLE_REDIRECT_URI"]
    req_uri = request.args.get("redirect_uri")
    if req_uri:
        return req_uri
    return f"{BACKEND_URL}/api/auth/google/callback"


# --- REAL GITHUB OAUTH 2.0 FLOW ---
@app.get("/api/auth/github/login")
def github_oauth_login() -> Any:
    if not GITHUB_CLIENT_ID:
        return jsonify({"error": "GitHub Client ID is missing"}), 400
    redirect_uri = get_github_redirect_uri()
    github_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={requests.utils.quote(redirect_uri)}"
        f"&scope=read:user%20user:email"
    )
    return redirect(github_url)


@app.get("/api/auth/github/callback")
def github_oauth_callback() -> Any:
    code = request.args.get("code")
    if not code:
        return redirect(f"{FRONTEND_URL}/#/login?error=GitHub+authorization+canceled")

    redirect_uri = get_github_redirect_uri()
    token_resp = requests.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri,
        },
        headers={"Accept": "application/json"},
        timeout=10,
    )
    if not token_resp.ok:
        return redirect(f"{FRONTEND_URL}/#/login?error=Failed+to+exchange+GitHub+code")

    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    if not access_token:
        err_desc = token_data.get("error_description", "Invalid GitHub authorization code")
        return redirect(f"{FRONTEND_URL}/#/login?error={requests.utils.quote(err_desc)}")

    user_resp = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"},
        timeout=10,
    )
    if not user_resp.ok:
        return redirect(f"{FRONTEND_URL}/#/login?error=Failed+to+fetch+GitHub+user")

    gh_user = user_resp.json()
    email = gh_user.get("email")
    if not email:
        email_resp = requests.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"},
            timeout=8,
        )
        if email_resp.ok:
            emails = email_resp.json()
            primary = next((e["email"] for e in emails if e.get("primary")), None)
            email = primary or (emails[0]["email"] if emails else None)

    timestamp = now_iso()
    login = gh_user["login"]

    with db() as conn:
        conn.execute(
            """
            INSERT INTO users (github_login, name, avatar_url, html_url, public_repos, followers, following, created_at, updated_at, email, auth_provider)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'github')
            ON CONFLICT(github_login) DO UPDATE SET
              name=excluded.name,
              avatar_url=excluded.avatar_url,
              html_url=excluded.html_url,
              public_repos=excluded.public_repos,
              followers=excluded.followers,
              following=excluded.following,
              email=COALESCE(excluded.email, users.email),
              updated_at=excluded.updated_at
            """,
            (
                login, gh_user.get("name"), gh_user.get("avatar_url"), gh_user.get("html_url"),
                gh_user.get("public_repos", 0), gh_user.get("followers", 0), gh_user.get("following", 0),
                timestamp, timestamp, email,
            ),
        )
        user = conn.execute("SELECT * FROM users WHERE github_login = ?", (login,)).fetchone()
        assert user is not None
        conn.execute("INSERT OR IGNORE INTO progress (user_id) VALUES (?)", (user["id"],))
        session["user_id"] = user["id"]

    return redirect(f"{FRONTEND_URL}/#/dashboard")


# --- REAL GOOGLE OAUTH 2.0 FLOW ---
@app.get("/api/auth/google/login")
def google_oauth_login() -> Any:
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Google Client ID is missing"}), 400
    redirect_uri = get_google_redirect_uri()
    google_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={requests.utils.quote(redirect_uri)}"
        f"&response_type=code"
        f"&scope={requests.utils.quote('openid email profile')}"
        f"&access_type=offline"
        f"&prompt=consent"
    )
    return redirect(google_url)


@app.get("/api/auth/google/callback")
def google_oauth_callback() -> Any:
    code = request.args.get("code")
    if not code:
        return redirect(f"{FRONTEND_URL}/#/login?error=Google+authorization+canceled")

    redirect_uri = get_google_redirect_uri()
    token_resp = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        },
        timeout=10,
    )
    if not token_resp.ok:
        return redirect(f"{FRONTEND_URL}/#/login?error=Failed+to+exchange+Google+code")

    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    if not access_token:
        return redirect(f"{FRONTEND_URL}/#/login?error=Invalid+Google+OAuth+response")

    user_resp = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    if not user_resp.ok:
        return redirect(f"{FRONTEND_URL}/#/login?error=Failed+to+fetch+Google+userinfo")

    g_user = user_resp.json()
    google_id = g_user.get("sub")
    email = g_user.get("email", "").lower()
    name = g_user.get("name") or (email.split("@")[0] if email else "Google User")
    avatar_url = g_user.get("picture") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}"

    if not email:
        return redirect(f"{FRONTEND_URL}/#/login?error=Google+account+has+no+email")

    timestamp = now_iso()
    login_handle = email.split("@")[0]

    with db() as conn:
        user = conn.execute("SELECT * FROM users WHERE email = ? OR google_id = ?", (email, google_id)).fetchone()
        if user is None:
            conn.execute(
                """
                INSERT INTO users (github_login, name, avatar_url, html_url, public_repos, followers, following, created_at, updated_at, email, auth_provider, google_id)
                VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?, ?, 'google', ?)
                """,
                (f"g_{login_handle}", name, avatar_url, f"mailto:{email}", timestamp, timestamp, email, google_id),
            )
            user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        else:
            conn.execute(
                """
                UPDATE users SET name = ?, avatar_url = ?, google_id = ?, updated_at = ? WHERE id = ?
                """,
                (name, avatar_url, google_id, timestamp, user["id"]),
            )
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()

        assert user is not None
        conn.execute("INSERT OR IGNORE INTO progress (user_id) VALUES (?)", (user["id"],))
        session["user_id"] = user["id"]

    return redirect(f"{FRONTEND_URL}/#/dashboard")


@app.post("/api/auth/github-username")
def github_username_auth() -> Any:
    payload = request.get_json(silent=True) or {}
    username = str(payload.get("username", "")).strip().lstrip("@")
    if not username:
        return jsonify({"error": "GitHub username is required"}), 400

    gh = requests.get(
        f"https://api.github.com/users/{username}",
        headers={"Accept": "application/vnd.github+json"},
        timeout=8,
    )
    if gh.status_code == 404:
        return jsonify({"error": f"GitHub user '{username}' not found"}), 404
    if not gh.ok:
        return jsonify({"error": f"GitHub API error ({gh.status_code})"}), 502
    data = gh.json()
    timestamp = now_iso()

    with db() as conn:
        conn.execute(
            """
            INSERT INTO users (github_login, name, avatar_url, html_url, public_repos, followers, following, created_at, updated_at, auth_provider)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'github')
            ON CONFLICT(github_login) DO UPDATE SET
              name=excluded.name,
              avatar_url=excluded.avatar_url,
              html_url=excluded.html_url,
              public_repos=excluded.public_repos,
              followers=excluded.followers,
              following=excluded.following,
              updated_at=excluded.updated_at
            """,
            (
                data["login"], data.get("name"), data.get("avatar_url"), data.get("html_url"),
                data.get("public_repos", 0), data.get("followers", 0), data.get("following", 0),
                timestamp, timestamp,
            ),
        )
        user = conn.execute("SELECT * FROM users WHERE github_login = ?", (data["login"],)).fetchone()
        assert user is not None
        conn.execute("INSERT OR IGNORE INTO progress (user_id) VALUES (?)", (user["id"],))
        session["user_id"] = user["id"]
        return jsonify({"user": serialize_user(user), "progress": get_progress(conn, user["id"])})


@app.post("/api/auth/google")
def google_auth() -> Any:
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()
    name = str(payload.get("name", "")).strip() or email.split("@")[0].replace(".", " ").title()
    avatar_url = str(payload.get("avatar_url", "")).strip() or f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}"
    google_id = str(payload.get("google_id", "")).strip() or f"google_{email}"

    if not email or "@" not in email:
        return jsonify({"error": "Valid Google email is required"}), 400

    timestamp = now_iso()
    login_handle = email.split("@")[0]

    with db() as conn:
        user = conn.execute("SELECT * FROM users WHERE email = ? OR google_id = ?", (email, google_id)).fetchone()
        if user is None:
            conn.execute(
                """
                INSERT INTO users (github_login, name, avatar_url, html_url, public_repos, followers, following, created_at, updated_at, email, auth_provider, google_id)
                VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?, ?, 'google', ?)
                """,
                (f"g_{login_handle}", name, avatar_url, f"mailto:{email}", timestamp, timestamp, email, google_id),
            )
            user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        else:
            conn.execute(
                """
                UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?
                """,
                (name, avatar_url, timestamp, user["id"]),
            )
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()

        assert user is not None
        conn.execute("INSERT OR IGNORE INTO progress (user_id) VALUES (?)", (user["id"],))
        session["user_id"] = user["id"]
        return jsonify({"user": serialize_user(user), "progress": get_progress(conn, user["id"])})


@app.post("/api/auth/logout")
def logout() -> Any:
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/me")
def me() -> Any:
    uid = current_user_id()
    if uid is None:
        return jsonify({"user": None, "progress": None})
    with db() as conn:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
        if user is None:
            session.clear()
            return jsonify({"user": None, "progress": None})
        return jsonify({"user": serialize_user(user), "progress": get_progress(conn, uid)})


@app.get("/api/progress")
@require_auth
def progress() -> Any:
    uid = current_user_id()
    assert uid is not None
    with db() as conn:
        return jsonify(get_progress(conn, uid))


@app.get("/api/daily")
@require_auth
def daily_challenges() -> Any:
    """One deterministic challenge per difficulty, seeded by the calendar date.

    The same user sees the same set all day; it rotates every day. The frontend
    resolves titles/icons locally via findChallenge(id) — this endpoint only
    decides WHICH ids are today's picks and whether the user already solved them.
    """
    uid = current_user_id()
    assert uid is not None
    today = datetime.now(timezone.utc).date().isoformat()

    by_diff: dict[str, list[int]] = {d: [] for d in DIFFICULTIES}
    for cid, meta in registry.all().items():
        by_diff.setdefault(meta.difficulty, []).append(cid)

    seed = int(hashlib.md5(today.encode("utf-8")).hexdigest()[:8], 16)
    rng = random.Random(seed)
    picked: list[int] = []
    for diff in DIFFICULTIES:
        pool = by_diff.get(diff, [])
        if pool:
            picked.append(rng.choice(pool))
    picked = list(dict.fromkeys(picked))

    with db() as conn:
        completed = set(get_progress(conn, uid)["completed"])

    result = []
    for cid in picked:
        meta = registry.get(cid)
        result.append({
            "id": cid,
            "xp": meta.xp if meta else 0,
            "difficulty": meta.difficulty if meta else "Beginner",
            "trackSlug": meta.track_slug if meta else "",
            "solved": cid in completed,
        })
    return jsonify({"date": today, "challenges": result})


@app.post("/api/challenges/<int:challenge_id>/attempt")
@require_auth
def register_attempt(challenge_id: int) -> Any:
    """Record that the user opened (attempted) a challenge.

    Increments a per-user, per-challenge counter so the UI can show how many
    times a problem was started — including 'start -> leave -> come back' loops
    that otherwise look like a single clean attempt.
    """
    uid = current_user_id()
    assert uid is not None
    meta = registry.get(challenge_id)
    if meta is None:
        return jsonify({"error": "Unknown challenge"}), 404

    timestamp = now_iso()
    with db() as conn:
        conn.execute(
            """
            INSERT INTO attempts (user_id, challenge_id, count, last_attempted_at)
            VALUES (?, ?, 1, ?)
            ON CONFLICT(user_id, challenge_id) DO UPDATE SET
              count = count + 1,
              last_attempted_at = excluded.last_attempted_at
            """,
            (uid, challenge_id, timestamp),
        )
        row = conn.execute(
            "SELECT count FROM attempts WHERE user_id = ? AND challenge_id = ?",
            (uid, challenge_id),
        ).fetchone()
        count = row["count"] if row else 0
    return jsonify({"ok": True, "challengeId": challenge_id, "attempts": count})


@app.post("/api/challenges/<int:challenge_id>/submit")
@require_auth
def submit_challenge(challenge_id: int) -> Any:
    uid = current_user_id()
    assert uid is not None
    payload = request.get_json(silent=True) or {}
    code = normalize_code(str(payload.get("code", "")))
    xp_penalty = max(0, int(payload.get("xpPenalty", 0) or 0))
    meta = registry.get(challenge_id)
    if meta is None:
        return jsonify({"ok": False, "error": "Unknown challenge"}), 404

    solved = meta.check_key.strip() in code
    if not solved:
        return jsonify({"ok": False, "solved": False, "message": "Check key not found in submitted code"}), 200

    awarded = max(0, meta.xp - xp_penalty)
    timestamp = now_iso()
    with db() as conn:
        exists = conn.execute(
            "SELECT 1 FROM completions WHERE user_id = ? AND challenge_id = ?",
            (uid, challenge_id),
        ).fetchone()
        if exists is None:
            conn.execute(
                "INSERT INTO completions (user_id, challenge_id, track_slug, difficulty, xp_awarded, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
                (uid, challenge_id, meta.track_slug, meta.difficulty, awarded, timestamp),
            )
            p = conn.execute("SELECT * FROM progress WHERE user_id = ?", (uid,)).fetchone()
            new_xp = (p["xp"] if p else 0) + awarded
            new_level = (new_xp // 500) + 1
            today = datetime.now().date().isoformat()
            last = p["last_active"] if p else None
            streak = p["streak"] if p else 0
            if last != today:
                streak = streak + 1 if last else 1
            conn.execute(
                "UPDATE progress SET xp = ?, level = ?, streak = ?, last_active = ? WHERE user_id = ?",
                (new_xp, new_level, streak, today, uid),
            )
        return jsonify({"ok": True, "solved": True, "xpAwarded": awarded, "progress": get_progress(conn, uid)})


@app.get("/api/skills")
@require_auth
def skills() -> Any:
    uid = current_user_id()
    assert uid is not None
    with db() as conn:
        rows = conn.execute(
            "SELECT track_slug, COUNT(*) AS solved, COALESCE(SUM(xp_awarded), 0) AS xp FROM completions WHERE user_id = ? GROUP BY track_slug",
            (uid,),
        ).fetchall()
    return jsonify({"skills": [dict(r) for r in rows]})


@app.get("/api/badges")
@require_auth
def badges() -> Any:
    uid = current_user_id()
    assert uid is not None
    with db() as conn:
        p = get_progress(conn, uid)
    solved_count = len(p["completed"])
    return jsonify({
        "unlocked": {
            "first_blood": solved_count >= 1,
            "bug_streak_i": solved_count >= 3,
            "week_warrior": p["streak"] >= 7,
            "century_club": solved_count >= 100,
        }
    })


@app.get("/api/profile")
@require_auth
def get_profile() -> Any:
    uid = current_user_id()
    assert uid is not None
    with db() as conn:
        row = conn.execute("SELECT * FROM profiles WHERE user_id = ?", (uid,)).fetchone()
    if row is None:
        return jsonify({})
    return jsonify({k: row[k] for k in row.keys() if k != "user_id"})


@app.put("/api/profile")
@require_auth
def update_profile() -> Any:
    uid = current_user_id()
    assert uid is not None
    payload = request.get_json(silent=True) or {}
    fields = ["email", "phone", "qualification", "about", "github_url",
              "linkedin_url", "leetcode_url", "gitlab_url", "twitter_url",
              "portfolio_url", "stackoverflow_url", "devto_url"]
    values = {f: str(payload[f]).strip() if payload.get(f) else None for f in fields}
    values["updated_at"] = now_iso()
    values["user_id"] = uid
    with db() as conn:
        conn.execute(
            f"""
            INSERT INTO profiles (user_id, {', '.join(fields)}, updated_at)
            VALUES (:user_id, {', '.join(':' + f for f in fields)}, :updated_at)
            ON CONFLICT(user_id) DO UPDATE SET
              {', '.join(f + '=excluded.' + f for f in fields)},
              updated_at=excluded.updated_at
            """,
            values,
        )
    return jsonify({"ok": True})


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=True)
