# AqarFlow (MVP)

Real estate management and property operations platform.

## Project structure

```
backend/    FastAPI API, SQLAlchemy models, Alembic migrations, tests
frontend/   Next.js (TypeScript, Tailwind CSS) application
docs/       Architecture notes, daily progress reports, screenshots
```

## Local setup

```bash
cp .env.example .env
docker compose up -d db

# Backend
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload          # http://localhost:8000/docs

# Frontend
cd ../frontend
npm install
npm run dev                            # http://localhost:3000
```

Health check: `GET http://localhost:8000/api/v1/health` should return `{"status":"ok","database":"up"}`.

## Tests

```bash
cd backend
pytest
```

## Daily progress

| Day | Topic |
|---|---|
| [Day 1](docs/progress/day-1.md) | Foundation: frontend, API, database and migrations |
| [Day 2](docs/progress/day-2.md) | Authentication: login page and session endpoints |
| [Day 3](docs/progress/day-3.md) | Properties interface and public landing page |
