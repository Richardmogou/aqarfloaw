# Architecture, Known Limitations & Handover Notes

## 1. System Architecture Overview

AqarFlow is a multi-tenant real estate operations and public listing platform built around a strict separation between public portal traffic and authenticated agency workspace traffic:

- **Frontend (`frontend/`)**: Next.js 14 App Router (`TypeScript`, `Tailwind CSS`), using Server Components for initial data fetching (`frontend/lib/server-api.ts`) and Client Components for interactive forms, Kanban stage transitions, and media management (`frontend/lib/api.ts`).
- **Reverse-Proxy Cookie Architecture**: Next.js proxies `/api/v1/:path*` to `BACKEND_URL/api/v1/:path*` (`frontend/next.config.mjs`). The browser only communicates with the frontend origin, keeping the `aqarflow_session` cookie strictly first-party (`HttpOnly`, `SameSite=Lax`).
- **Backend (`backend/`)**: FastAPI (`Python 3.12`), SQLAlchemy 2.0 ORM, Pydantic v2 validation schemas, and Alembic migrations.
- **Database (`PostgreSQL 16`)**: Tenant-isolated relational schema (`agencies`, `users`, `sessions`, `properties`, `property_media`, `contacts`, `leads`, `activities`, `visits`, `deals`, `deal_events`) with composite indexes on `(agency_id, ...)` for every operational table.
- **Media Storage (`MinIO / S3-compatible` or `local`)**: Property photos are validated (`JPEG`, `PNG`, `WebP`, magic-byte inspected, max 10 MB) and stored in a private S3 bucket (or local `uploads/` directory during tests) and streamed through `/api/v1/media/{media_id}`.

---

## 2. Security Posture

- **Authentication**: Argon2/bcrypt password hashing via `pwdlib` (`backend/app/core/security.py`). Raw 256-bit session tokens are never stored in PostgreSQL; only their `SHA-256` digest (`sessions.token_hash`) is persisted.
- **CSRF Defense**: Every state-changing request (`POST`, `PATCH`, `PUT`, `DELETE`) requires `X-Requested-With: aqarflow` (`backend/app/api/deps.py`), which cannot be sent cross-origin without an explicit CORS preflight.
- **Multi-Tenant Isolation**: Every query on `Property`, `Contact`, `Lead`, `Activity`, `Visit`, and `Deal` scopes by `user.agency_id`. Cross-agency resource IDs return `404` or `422`.
- **Role-Based Access Control (RBAC)**: Enforced both in Next.js server layouts (`requireUser`, `requireRole("admin")`) and in FastAPI route dependencies (`require_role(Role.ADMIN)` and per-record `assigned_agent_id` / `agent_id` checks).
- **Public Inquiry Hardening**: Honeypot field (`website`) silently discards automated spam bots (`HTTP 201` dummy response without database writes) alongside per-IP sliding-window rate limiting (`backend/app/api/v1/inquiries.py`).

---

## 3. Third-Party Services & Infrastructure Dependencies

| Service | Purpose in MVP | Production Recommendation |
|---|---|---|
| **PostgreSQL 16** | Primary relational datastore for all CRM, inventory, and auth records | Managed PostgreSQL (AWS RDS, Neon, Supabase, or Cloud SQL) with daily automated backups |
| **MinIO / S3 Object Storage** | Private bucket storage (`aqarflow-media`) for property gallery images | AWS S3, Cloudflare R2, or DigitalOcean Spaces (replace `bitnamilegacy/minio` dev container) |
| **OpenStreetMap Embed** | Interactive map preview on public listing detail pages when latitude/longitude are set | Keep OpenStreetMap iframe or upgrade to Mapbox / Google Maps API if custom clustering is needed |

---

## 4. Known Limitations & Phase 2 Roadmap

In accordance with Section 15 of the 7-Day MVP Specification, the following items are intentionally excluded from the Week-1 MVP and scheduled for Phase 2:

1. **Agency Onboarding & Self-Service Registration**:
   - New agencies and their initial Admin user are provisioned via the CLI (`python -m app.cli create-admin` or `python -m app.cli seed-demo`). Self-service agency sign-up, email verification, and password reset flows are Phase 2 items.
2. **External Communications & Notifications**:
   - WhatsApp Business API automation, SMS reminders, email notifications, and external calendar sync (Google/Outlook `.ics`) are not connected in the MVP. Public listing pages provide direct `tel:` and `https://wa.me/` deep links.
3. **Financial Accounting, Payments & Legal E-Signatures**:
   - Deals track `offer_amount`, `agreed_amount`, and stage transitions (`deal_events`), but online payment gateways, commission payroll ledgers, rental invoicing, and legal e-signature workflows are outside MVP scope.
4. **Property Title & Ownership Verification Disclaimer**:
   - AqarFlow stores internal agency records and operational workflows; it does not verify legal title, CDA/DHA allotment letters, or regulatory compliance.
5. **In-Memory Inquiry Rate Limiter**:
   - The public `/api/v1/inquiries` IP rate limiter uses an in-process sliding window suitable for single-instance deployments. Multi-worker production deployments should back rate limiting with Redis or an upstream CDN/WAF.
