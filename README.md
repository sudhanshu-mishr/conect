# Tinder Clone (FastAPI + React, single Render Web Service)

Production-ready monorepo where FastAPI serves both API endpoints and the built React SPA.

## Stack
- FastAPI + async SQLAlchemy + Alembic
- PostgreSQL (Render-managed)
- React + Vite + Tailwind CSS
- JWT auth, profile/photo upload, swipe + match flow, WebSocket chat, explore/settings/premium stubs

## Local setup
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd frontend && npm ci && npm run build && cd ..
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

App runs at `http://localhost:8000`.
- API: `/api/*`
- SPA: `/`
- WebSocket: `/api/ws/chat/{match_id}?token=<jwt>`

## Render deployment (single service)
1. Push this repo to GitHub.
2. In Render, create **New Web Service** and connect the repo.
3. Runtime: **Python 3**.
4. Build command:
   ```bash
   pip install -r requirements.txt && cd frontend && npm ci && npm run build && cd ..
   ```
5. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Create/attach a Render PostgreSQL instance.
7. Set environment variables in Render:
   - `DATABASE_URL` (from Render Postgres)
   - `SECRET_KEY` (strong random value)
   - `FRONTEND_URL=https://yourapp.onrender.com`
8. Deploy. Your app is live at `https://yourapp.onrender.com` (SPA + API in one service).

You can also deploy using `render.yaml` in this repository.

## Architecture notes
- All API routers are under `/api`.
- FastAPI mounts static files at `/` from `app/static`.
- SPA route fallback returns `app/static/index.html` for unknown non-API routes.
- React build output writes to `app/static` (`npm run build`).

## Security and scale notes
- Passwords hashed with bcrypt.
- JWT-based auth via Bearer tokens.
- Async DB access with connection pooling.
- Add Redis, rate-limiting, moderation, and object storage (S3/Cloudinary) before production launch.
