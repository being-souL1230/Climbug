# Climbug Flask Backend

This backend is the source of truth for users, sessions, XP, challenge solves,
skills, and badges. The frontend should never award XP or mark challenges as
complete without calling the backend.

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python app.py
```

Server runs at `http://localhost:5000`.

## API

- `POST /api/auth/github-username` `{ "username": "octocat" }`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/progress`
- `POST /api/challenges/<id>/submit` `{ "code": "...", "xpPenalty": 10 }`
- `GET /api/skills`
- `GET /api/badges`
