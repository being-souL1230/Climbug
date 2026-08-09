# Climbug — Gamified Debugging Platform

**"Art of Fixing: Debugging literature, gamified."**

Climbug is a full-stack, gamified learning platform that trains developers in the skill most coding platforms ignore: **debugging**. Instead of writing programs from scratch, users are handed intentionally broken code and must find and fix the exact bug. Every fix earns XP, levels, streaks and badges, turning a frustrating skill into an addictive game loop.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & How It Works](#architecture--how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Boss Arena](#boss-arena)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)

---

## Overview

Most coding platforms measure whether you can *write* code. Real developers spend most of their working time *reading, understanding, and fixing* code they did not write. Climbug closes this gap with a library of 600+ deliberately broken programs across 8 languages. Each challenge describes a bug, shows the broken code, and the user must submit a fix containing the exact solution key.

The backend is the **single source of truth**: it verifies solutions, awards XP, computes badges, maintains streaks, and stores every completion. The frontend never awards progress on its own — every solve, badge and leaderboard rank is derived from real server data, so there is no way to fake progress.

## Features

- **600+ debugging challenges** across 8 language tracks (Python, JavaScript, SQL, C, C++, Java, and more), organized into structured tracks with difficulty tiers from Beginner to Nightmare.
- **Daily challenges** — a deterministic set of challenges is picked per calendar date by the backend, so every user sees the same fresh set each day.
- **Full gamification** — XP, levels, day streaks, 50+ collectible badges (with real unlock rules computed server-side), and a rewards page.
- **Skill analytics** — per-track and per-difficulty solve breakdowns shown on the dashboard and public profiles.
- **Leaderboards** — Global, Friends, and Guild scopes computed from real user data, with weekly/monthly XP and trend indicators.
- **Boss Arena** — a weekly, database-backed raid boss. Players get a realtime countdown and limited hearts, and must fix a hard multi-part bug. Leaving mid-fight forfeits the week; the boss can only be fought once per week.
- **Public user profiles** — shareable profile links (username-based), badge collections, solved breakdowns by difficulty and track, and public social links.
- **Friends & Guilds** — user search, friend lists and guild memberships that power the social leaderboard scopes.
- **Authentication** — GitHub OAuth 2.0, Google OAuth 2.0, plus a quick sign-in mode (GitHub username or Google email) for low-friction access.
- **Account management** — a Settings page with profile editing, privacy policy, sign out, and permanent account deletion with double confirmation.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite 7 (single-file production build via `vite-plugin-singlefile`)
- Tailwind CSS 4
- Monaco Editor (`@monaco-editor/react`) for the challenge and boss-fight editors
- React Router 7 (hash-based routing, data router for navigation blocking)
- Lucide icons, anime.js, three.js for the animated experience

**Backend**
- Flask 3 (Python) with a lightweight, hand-rolled REST API
- SQLite (single-file database, `sqlite3` stdlib) — zero external database setup
- Session cookies (HttpOnly) for authentication
- Gunicorn as the production WSGI server

## Architecture & How It Works

The project is a classic client/server split:

1. The **frontend** (React SPA) renders the UI and the Monaco code editor. It reads challenge text from bundled data, but never decides correctness.
2. The **backend** (Flask) exposes REST endpoints. It holds the *answer keys* parsed from the challenge data file at startup and verifies every submission server-side.
3. **Server-authoritative progress** — on a correct submission the backend inserts a completion, awards XP, updates the level and streak, then returns the fresh progress object. Badges are computed on demand from real database rows; nothing is stored client-side except a cached mirror.
4. **Realtime-ish data** — daily challenges, the boss arena state, and leaderboard previews are fetched from the API (with polling where freshness matters).
5. **Boss Arena integrity** — fight state (lives, timer start, attempts) lives in the database. The server enforces the time limit on every request, expires stale fights, and blocks rejoining after defeat, forfeit, or failure.

### Database tables

`users`, `progress`, `completions`, `attempts`, `profiles`, `friendships`, `guilds`, `guild_members`, `bosses`, `boss_attempts`.

## Project Structure

```
climbug-app/
├── index.html              # SPA entry
├── package.json
├── vite.config.ts          # dev proxy /api -> localhost:8000
├── tsconfig.json
├── public/                 # static assets (badge images, service worker)
├── src/
│   ├── main.tsx            # React bootstrap
│   ├── App.tsx             # hash router + routes (data router)
│   ├── api.ts              # API_BASE + fetch wrapper (credentials included)
│   ├── auth.ts             # auth state, sign in/out, account deletion
│   ├── badges.ts           # badge definitions + unlock-state hook
│   ├── progress.ts         # local progress mirror synced from the backend
│   ├── data.ts             # 600+ challenge data + track assembly
│   ├── components/         # Navbar, GameIcon, Logo, Reveal, GridScan, ...
│   ├── hooks/              # useAnimeDetails, ...
│   └── pages/              # Home, Login, Dashboard, Tracks, TrackDetail,
│                           # Challenge, Leaderboard, Rewards, Skills,
│                           # BossArena, Profile, UserProfile, Settings
└── backend/
    ├── app.py              # Flask app: auth, challenges, progress, boss, profiles
    ├── registry.py         # server-side answer-key registry (parsed from data.ts)
    ├── badges.py           # badge rules + computation
    ├── boss.py             # weekly boss generation + solution checking
    └── requirements.txt    # Flask, Flask-Cors, requests, gunicorn
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API runs on `http://localhost:8000`. The SQLite file is created automatically at `backend/climbug.sqlite3` on first run.

### 2. Frontend

In a second terminal:

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5000` and proxies `/api` requests to the backend on port 8000, so no CORS setup is needed locally.

### 3. Sign in

- Quick mode: enter a GitHub username or Google email — works out of the box.
- OAuth 2.0: requires `GITHUB_CLIENT_ID/SECRET` or `GOOGLE_CLIENT_ID/SECRET` in the backend environment (see [Environment Variables](#environment-variables)).

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/github-username` | Quick sign-in via GitHub username `{ username }` |
| POST | `/api/auth/google` | Quick sign-in via Google email `{ email, name, avatar_url }` |
| GET | `/api/auth/github/login` | Start GitHub OAuth 2.0 flow (redirects to GitHub) |
| GET | `/api/auth/github/callback` | GitHub OAuth callback |
| GET | `/api/auth/google/login` | Start Google OAuth 2.0 flow (redirects to Google) |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/auth/logout` | Clear the session |
| DELETE | `/api/auth/account` | Permanently delete the account and all related data |
| GET | `/api/me` | Current user + progress |
| GET | `/api/progress` | XP, level, streak, rank, guild, completions, attempts |
| GET | `/api/daily` | Today's deterministic challenge set |
| POST | `/api/challenges/<id>/attempt` | Record that a challenge was opened |
| POST | `/api/challenges/<id>/submit` | Submit a fix `{ code, xpPenalty?, timeSpent? }`; verifies server-side |
| GET | `/api/skills` | Per-track solved count and XP |
| GET | `/api/badges` | Unlocked badge ids (computed from real data) |
| GET | `/api/leaderboard?scope=` | `global` / `friends` / `guilds` leaderboard |
| GET | `/api/users/search?q=` | Public user search by username/name |
| GET | `/api/users/<login>` | Public profile: stats, solves, badges, public links |
| GET/PUT | `/api/profile` | Read/update the signed-in user's profile |
| GET | `/api/boss` | Current weekly boss + fight state + community stats |
| POST | `/api/boss/start` | Start (or resume) the weekly fight |
| POST | `/api/boss/submit` | Submit a fix `{ code }`; wrong fixes cost a heart |
| POST | `/api/boss/forfeit` | Forfeit `{ reason: "leave" | "time" }`; blocks rejoin |

## Boss Arena

Every week a new boss is generated deterministically from a set of hand-crafted hard bugs (race conditions, null-pointer exceptions, closure pitfalls, SQL row multiplication, buffer overflows, dangling references). Toughness scales weekly: XP reward increases, time limit shrinks, and available lives drop.

A fight is server-authoritative:

- A realtime countdown and heart/lives display drive the UI; the server enforces the same time limit on every submission.
- Solutions require **multiple exact fix fragments** (e.g. `Lock()` plus `with lock` plus `global balance`), making brute-force guessing impractical.
- Leaving the page or tab mid-fight triggers a forfeit (sendBeacon); the player cannot rejoin that week's boss. Defeating the boss awards large XP, a level boost, and progresses toward the legendary **Boss Slayer** badge.

## Environment Variables

### Backend (`backend/.env` or process environment)

| Variable | Default | Purpose |
|---|---|---|
| `CLIMBUG_SECRET` / `SESSION_SECRET` | dev-only | Session signing key; set a long random value in production |
| `FRONTEND_URL` | `http://localhost:5000` | Redirect target after OAuth; the deployed frontend URL |
| `BACKEND_URL` | `http://localhost:8000` | Base URL used to build OAuth redirect URIs |
| `CLIMBUG_CORS_ORIGINS` | localhost dev origins | Comma-separated allowed origins (falls back to `FRONTEND_URL` when unset) |
| `CLIMBUG_DB` | `backend/climbug.sqlite3` | Path to the SQLite file (use a persistent disk path in production) |
| `SESSION_COOKIE_SAMESITE` | `Lax` | Set to `None` for cross-site frontend/backend deployments |
| `SESSION_COOKIE_SECURE` | `false` | Set to `true` in production (required when SameSite=None) |
| `GITHUB_CLIENT_ID/SECRET` | — | GitHub OAuth 2.0 credentials |
| `GOOGLE_CLIENT_ID/SECRET` | — | Google OAuth 2.0 credentials |
| `GITHUB_REDIRECT_URI` / `GOOGLE_REDIRECT_URI` | derived from `BACKEND_URL` | Explicit OAuth callback URLs if needed |
| `PORT` | `8000` | Port the server binds to (Render sets this automatically) |

### Frontend (Vite)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE` | `""` in dev, `https://climbugg.onrender.com` in production build | Backend base URL; empty in dev uses the Vite proxy |

## Deployment

### Frontend — Vercel

1. Push the repository to GitHub and import it into Vercel.
2. Build command: `npm run build`; output: `dist/` (the build is a single HTML file).
3. Optionally set `VITE_API_BASE` to the backend URL (a production default is already compiled in).
4. Deploy — the site is served from the Vercel URL.

### Backend — Render

1. Create a new Web Service from the same repository.
2. Root directory: `backend` (or point the service at a backend-only repo).
3. Build command: `pip install -r requirements.txt`.
4. Start command: `gunicorn --bind 0.0.0.0:$PORT app:app`.
5. Python version: 3.10+.
6. Add the environment variables above (`CLIMBUG_SECRET`, `FRONTEND_URL`, `BACKEND_URL`, `CLIMBUG_CORS_ORIGINS`, `SESSION_COOKIE_SAMESITE=None`, `SESSION_COOKIE_SECURE=true`, and the OAuth credentials).
7. **Persistent disk**: SQLite is a file, so attach a Render persistent disk and point `CLIMBUG_DB` at it (e.g. `/var/data/climbug.sqlite3`) — otherwise data is lost on every redeploy.

### Cross-site notes (Vercel + Render)

- The frontend and backend live on different origins, so set `SESSION_COOKIE_SAMESITE=None` and `SESSION_COOKIE_SECURE=true` together — SameSite=None without Secure is rejected by browsers.
- Register the exact callback URLs in the OAuth providers:
  - GitHub OAuth App: `https://<backend>.onrender.com/api/auth/github/callback`
  - Google Cloud Console: `https://<backend>.onrender.com/api/auth/google/callback`
- GitHub OAuth Apps allow only one callback URL, so switching between local and production requires updating the registered URL (or use the quick sign-in mode locally).

## Security

- Passwords are never stored — authentication is entirely OAuth or public-identifier based.
- Session cookies are HttpOnly; CORS is restricted to configured origins.
- Answer keys live only in the backend registry; the frontend data file never contains hidden correctness logic.
- Public profiles expose only non-sensitive data (stats, badges, chosen social links) — email and phone are never shown to other users.
- Deleting an account (Settings > Delete Account) removes the user row and every related record across all tables.

## License

MIT — use it, learn from it, and keep climbing.
