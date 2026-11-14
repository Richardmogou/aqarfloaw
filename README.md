# AqarFlow (MVP)

**Author**: Nchifor Richard

Pakistan-first real estate inventory, public property portal, CRM lead capture, visit scheduling, and deal pipeline platform.

---

## 1. Architecture & Project Structure

```text
aqarflow/
  backend/                  FastAPI API (Python 3.12), SQLAlchemy 2.0 ORM, Alembic migrations, pytest suite
    app/
      api/v1/               REST endpoints (auth, users, properties, media, public, inquiries, contacts, leads, visits, deals)
      core/                 Configuration, database session, Argon2/SHA-256 security helpers
      models/               SQLAlchemy relational models (multi-tenant agency_id scoped)
      permissions/          Role definitions (admin, agent)
      schemas/              Pydantic v2 request/response schemas
      services/             S3/local media storage, image validation, E.164 phone normalization
      cli.py                CLI for provisioning admins, agents, and idempotent demo data
    migrations/             Alembic schema migrations
    tests/                  64 automated integration & acceptance tests
  frontend/                 Next.js 14 App Router (TypeScript, Tailwind CSS)
    app/
      (public)/             Public portal (/, /listings, /listings/[slug], /contact, /agents, /agencies)
      (workspace)/          Protected agency workspace (/dashboard, /properties, /leads, /visits, /deals, /team)
      login/                Staff sign-in page
    components/             Shared UI, layout, navigation drawer, and public portal components
    features/               Domain modules (properties, leads, visits, deals, team)
    lib/                    Typed API clients, server-side session helpers, i18n (EN/FR), formatting utilities
  docs/
    api/                    REST API v1 reference & payload examples
    architecture/           Security design, known limitations & Phase 2 handover notes
    user-guides/            Admin & Agent operational guide and RBAC matrix
    progress/               Day 1 – Day 7 engineering reports
    screenshots/            Visual verification captures for Days 1 – 7
  docker-compose.yml        Full-stack container orchestration (PostgreSQL 16, MinIO, FastAPI, Next.js)
  .env.example              Environment variable template (no secrets)
```

---

## 2. Environment Variables

Copy `.env.example` to `.env` in the repository root (and `backend/.env` when running `uvicorn` outside Docker):

| Variable | Description | Example (Local Dev) |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL username | `aqarflow` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `aqarflow_dev` |
| `POSTGRES_DB` | Primary database name | `aqarflow` |
| `DATABASE_URL` | SQLAlchemy connection URL | `postgresql+psycopg://aqarflow:aqarflow_dev@localhost:5433/aqarflow` |
| `TEST_DATABASE_URL` | Dedicated pytest database (dropped & recreated per test run) | `postgresql+psycopg://aqarflow:aqarflow_dev@localhost:5433/aqarflow_test` |
| `SECRET_KEY` | Backend cryptographic secret key | `change-me-in-production` |
| `CORS_ORIGINS` | Allowed frontend origin(s) | `http://localhost:3000` |
| `STORAGE_BACKEND` | `s3` (MinIO/S3 private bucket) or `local` (`MEDIA_ROOT`) | `s3` |
| `S3_ENDPOINT_URL` | S3 endpoint URL | `http://localhost:9000` |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | S3 / MinIO credentials | `minioadmin` / `minioadmin` |
| `S3_BUCKET` | Private bucket for property images | `aqarflow-media` |
| `BACKEND_URL` | Target of Next.js `/api/v1` rewrite proxy | `http://localhost:8000` |

---

## 3. Local Setup & Demo Data

### 3.1 Start Infrastructure & Backend
```bash
cp .env.example .env
docker compose up -d db minio

cd backend
python3.12 -m venv .venv
# Linux/macOS: source .venv/bin/activate | Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head

# Seed idempotent MVP demo data (1 Admin, 2 Agents, 4 Properties, 3 Leads, 3 Visits, 2 Deals)
python -m app.cli seed-demo

uvicorn app.main:app --reload --port 8000
```

### 3.2 Demo Credentials (created by `python -m app.cli seed-demo`)
- **Agency**: `Islamabad Capital Towers`
- **Admin**: `admin@aqarflow.pk` / `AqarFlowDemo!2026`
- **Agent 1**: `usman.riaz@aqarflow.pk` / `AqarFlowDemo!2026`
- **Agent 2**: `zainab.baloch@aqarflow.pk` / `AqarFlowDemo!2026`

### 3.3 Start Frontend
```bash
cd frontend
npm install
npm run dev    # http://localhost:3000
```

- **Public Portal**: `http://localhost:3000` & `http://localhost:3000/listings`
- **Staff Workspace**: `http://localhost:3000/login` -> `http://localhost:3000/dashboard`
- **Swagger / OpenAPI Docs**: `http://localhost:8000/docs`
- **Health Check**: `GET http://localhost:8000/api/v1/health` -> `{"status":"ok","database":"up"}`

---

## 4. Full Docker Deployment

To build and run the entire stack (`db`, `minio`, `backend`, `frontend`) in containers:

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.cli seed-demo
```

---

## 5. Automated Tests & Quality Checks

```bash
# Backend integration & MVP acceptance suite (requires PostgreSQL test database)
cd backend
export TEST_DATABASE_URL="postgresql+psycopg://aqarflow:aqarflow_dev@localhost:5433/aqarflow_test"
pytest tests -v

# Frontend TypeScript & ESLint verification
cd ../frontend
npx tsc --noEmit
npm run lint
```

---

## 6. Documentation & Daily Progress

- **API Reference**: [`docs/api/endpoints.md`](docs/api/endpoints.md)
- **Admin & Agent User Guide**: [`docs/user-guides/admin-and-agent-guide.md`](docs/user-guides/admin-and-agent-guide.md)
- **Architecture, Known Limitations & Handover**: [`docs/architecture/handover-and-limitations.md`](docs/architecture/handover-and-limitations.md)

| Day | Topic |
|---|---|
| [Day 1](docs/progress/day-1.md) | Foundation: frontend, API, database and migrations |
| [Day 2](docs/progress/day-2.md) | Authentication, roles and protected routes, interface preferences |
| [Day 3](docs/progress/day-3.md) | Properties interface and public landing page |
| [Day 4](docs/progress/day-4.md) | Public portal: property catalog, listing explorer, detail page, lead capture and honeypot anti-spam |
| [Day 5](docs/progress/day-5.md) | CRM, leads, contacts, activity timeline and team management |
| [Day 6](docs/progress/day-6.md) | Visits scheduling, conflict detection, deals Kanban pipeline and live dashboard |
| [Day 7](docs/progress/day-7.md) | QA, responsive verification, idempotent demo seeding, deployment and handover docs |
