# Amora — Personal Organization App

<div align="center">

**A mobile-first single-user productivity app** with calendar, habit tracking, notes, and a time-aware welcome dashboard. Deployed as a monolithic Docker container on Railway.

🔗 **[Live App](https://amora-app.up.railway.app/)**

</div>

---

## Overview

Amora is a focused personal organization tool designed for daily mobile use. It combines four lightweight productivity surfaces — events calendar, habit tracker, notes, and settings — behind a soft pastel UI, with a contextual welcome screen that adapts to the time of day and current weather.

The application is deployed as a **single-service monolithic stack on Railway**: the React frontend is built into static assets and served by the same FastAPI process that exposes the JSON API. This eliminates CORS in production, simplifies auth, and reduces hosting cost to one running container with one persistent volume.

## Features

- **Time-aware Welcome Screen** — Greeting and illustration change across four periods (morning, afternoon, evening, night). Rainy weather triggers a dedicated illustration.
- **Weather Widget** — Pulls current conditions from OpenWeatherMap based on the user's configured city (pt-BR locale, metric units).
- **Events Calendar** — Full CRUD with custom color tags, date pickers (`react-day-picker`), and an upcoming-events list on the home dashboard.
- **Habit Tracker** — Daily check-in toggle with streak calculation that breaks if a day is missed (last check-in must be today or yesterday for the streak to remain active).
- **Notes** — Lightweight CRUD ordered by most recently updated.
- **Settings** — Display name customization persisted server-side.
- **Cookie-Based Auth** — Single shared password, `httpOnly` cookie with `Secure` flag conditionally enabled in production.

## Architecture

```
┌─────────────────────────────────────────┐
│   Railway (single service, single domain) │
│                                           │
│   ┌─────────────────────────────────┐    │
│   │  FastAPI (Uvicorn, Python 3.12) │    │
│   │  ┌────────────┬───────────────┐ │    │
│   │  │  /api/*    │   /  (static) │ │    │
│   │  │  JSON API  │   React SPA   │ │    │
│   │  └────────────┴───────────────┘ │    │
│   └────────┬────────────────────────┘    │
│            │                              │
│   ┌────────▼─────────┐  ┌──────────────┐ │
│   │ SQLite (volume)  │  │ OpenWeather  │ │
│   │ /data/amora.db   │  │     API      │ │
│   └──────────────────┘  └──────────────┘ │
│                                           │
└─────────────────────────────────────────┘
```

Static assets are mounted at `/` only when the `static/` directory exists (production). In local dev, Vite serves the frontend on `:5173` and proxies `/api/*` to the FastAPI backend on `:8000`.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, DaisyUI 5, react-day-picker, date-fns | SPA with bottom-nav routing, soft pastel design system |
| **Backend** | Python 3.12, FastAPI, SQLModel, Uvicorn | JSON API under `/api/*`, static frontend mount at `/` |
| **Database** | SQLite via SQLAlchemy / SQLModel | Persisted on Railway volume at `/data` |
| **External APIs** | OpenWeatherMap (`httpx` async client) | Current weather with metric units and pt-BR locale |
| **Auth** | Cookie session (httpOnly, SameSite=Lax, Secure conditional) | In-memory token store, env-var password with timing-safe comparison |
| **DevOps** | Multi-stage Docker, Railway, healthcheck via `railway.json` | Single-service monolithic deploy with persistent volume |

## Project Structure

```
amora/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app, CORS, static mount, /api/health
│       ├── config.py           # Env loading: APP_PASSWORD, IS_PRODUCTION, CORS_ORIGINS
│       ├── database.py         # SQLModel engine + session factory
│       ├── models.py           # Event, Habit, HabitCheckin, Note, Settings
│       └── routes/
│           ├── auth.py         # /auth/login | /auth/logout | /auth/me
│           ├── events.py       # CRUD events
│           ├── habits.py       # Habits + streak calculation + daily toggle
│           ├── notes.py        # CRUD notes
│           ├── settings.py     # Display name persistence
│           └── weather.py      # OpenWeatherMap proxy
├── frontend/
│   ├── package.json
│   └── src/
│       ├── pages/              # Home, Calendar, Habits, Notes, Settings
│       └── components/         # WelcomeCard, BottomNav, EventSheet, WeatherWidget, etc.
├── Dockerfile                  # Multi-stage: node frontend build → python runtime
└── railway.json                # healthcheckPath: /api/health
```

## Local Development

### Prerequisites
- Python 3.12+
- Node 20+
- An [OpenWeatherMap API key](https://openweathermap.org/api) (optional — the weather widget gracefully degrades if not configured)

### Setup

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` in the repo root:

```env
APP_PASSWORD=devpass
SECRET_KEY=devsecret
WEATHER_API_KEY=your_openweathermap_key
DEFAULT_CITY=São Paulo
```

Run the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

In a separate terminal, run the frontend:

```bash
cd frontend
npm install
npm run dev   # Vite on :5173 with /api proxy to :8000
```

Access:
- **Frontend:** http://localhost:5173
- **API docs:** http://localhost:8000/docs
- **Health:** http://localhost:8000/api/health

## Production Deployment (Railway)

The repository is wired to deploy out of the box:

1. **New Project → Deploy from GitHub repo** on Railway. The Dockerfile is auto-detected.
2. **Add a persistent volume** mounted at `/data` (1 GB is plenty — without it, SQLite resets on every redeploy).
3. **Configure env vars**: `APP_PASSWORD`, `SECRET_KEY` (generate with `openssl rand -hex 32`), `WEATHER_API_KEY`, `DEFAULT_CITY`, `DATABASE_URL=sqlite:////data/amora.db`, `IS_PRODUCTION=1`. Leave `CORS_ORIGINS` unset — frontend and API share the same domain.
4. **Generate a public domain** under Networking.

The `/api/health` endpoint is wired into Railway's healthcheck via `railway.json`.

## Technical Highlights

### Monolithic Single-Service Deploy
The frontend is built (`npm run build` → `frontend/dist`) inside a `node:20-alpine` stage and copied into the Python runtime image at `app/static`. FastAPI mounts that directory at `/` with `html=True`, so the React SPA and the JSON API live behind a single domain. **Production runs with zero CORS configuration** — the middleware is only registered when `CORS_ORIGINS` is non-empty, which is the dev-only path.

### Timezone-Safe Datetime Serialization
SQLite does not preserve timezone information, so `datetime` values returned from the database are naive. A `PlainSerializer` (`UtcDatetime` annotated type) attaches `+00:00` on JSON output, ensuring the frontend always receives ISO-8601 strings with explicit UTC offset. All writes use `datetime.now(timezone.utc)`. This avoids a subtle bug where the frontend would interpret naive timestamps as local time and shift events.

### Streak Logic with Active-Window Detection
The habit streak counter does not naively count consecutive check-ins. A streak is only counted if the most recent check-in is today or yesterday — otherwise it resets to 0. This matches user expectation that missing a day breaks the streak immediately, rather than letting an old streak linger silently for weeks.

### Production-Safe Cookie Configuration
Auth cookies are `httpOnly`, `SameSite=Lax`, and `Secure` only when `IS_PRODUCTION=1`. This lets local dev work over plain HTTP without disabling secure flags in production, and avoids the common pitfall of cookies that mysteriously fail when moving from local to HTTPS.

### Dev/Prod Static Mount Symmetry
The static directory mount only happens if the `static/` folder exists. In local dev (frontend on Vite at `:5173`) the folder is absent and FastAPI just exposes the API. In production (after the Docker build copies `frontend/dist` into `app/static`) the folder exists and FastAPI serves the SPA. The same `main.py` works in both modes without conditionals.

## Known Limitations

This is a **single-user personal app**, not a multi-tenant SaaS. Specific intentional tradeoffs:

- **In-memory token store** (`set[str]` in `auth.py`). All sessions invalidate on server restart. Acceptable for one user; would need Redis or DB-backed tokens for multi-tenant.
- **Password lives in an env var** (`APP_PASSWORD`), compared via `secrets.compare_digest` for timing safety. There is no password hash store — the app never persists credentials. For multi-user this would need per-user accounts and a proper hashing scheme (bcrypt/argon2).
- **No CSRF token** — relies on `SameSite=Lax` for CSRF mitigation, which is sufficient for the current scope but not for a public multi-user app.

These are documented intentional choices, not unaddressed bugs.

---

<div align="center">

Made by [Lincoln](https://github.com/lincoln1155)

</div>
