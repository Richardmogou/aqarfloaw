# AqarFlow (MVP)

## Local setup

```bash
cp .env.example .env        # then configure the values (a development .env is provided)
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

## Day 1 — checklist and progress

| # | Acceptance criterion | How to verify / evidence | Status |
|---|---|---|---|
| 1 | The frontend starts locally and displays the dashboard. | Run `npm run dev`, then open `http://localhost:3000/dashboard`. [Dashboard screenshot](frontend/public/localhost300light.png) | **Done** |
| 2 | The API starts locally and its documentation is available. | Run `uvicorn app.main:app --reload`, then open `http://localhost:8000/docs`. [API documentation screenshot](frontend/public/localhost8000docs.png) | **Done** |
| 3 | The API confirms its database connection. | `http://localhost:8000/api/v1/health` returns `{"status":"ok","database":"up"}`. [Health check screenshot](frontend/public/localhost8000apiv1health.png) | **Done** |
| 4 | The database schema is created by the Alembic migrations. | `alembic upgrade head` completed without errors. The PostgreSQL screenshot shows 10 application tables plus `alembic_version`. [Alembic screenshot](frontend/public/alembic.png) · [Database tables screenshot](frontend/public/schema.png) | **Done** |
| 5 | The layout has a sidebar, a top bar, and six navigation items, with no broken links. | The layout and six items appear in the [dashboard screenshot](frontend/public/localhost300light.png). Only `/dashboard` currently has a page; the other five linked routes still need to be created. | **Partial** |

Evidence screenshots are stored in [`frontend/public`](frontend/public). Day 1 is complete for the frontend and backend startup, the PostgreSQL connection, and the database migration. The navigation is visually in place, but its remaining pages have not been implemented yet.
