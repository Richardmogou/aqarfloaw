# Day 4 — Authentication fixes, build errors, login page redesign and i18n

The authentication flow is fully operational end-to-end. Build errors blocking the Vercel deployment are resolved. The login page was redesigned. All workspace and public pages are fully internationalised (EN/FR).

## Authentication fixes

### CSRF guard scoped correctly

The `csrf_guard` dependency was applied globally to the entire `/api/v1` router, blocking `POST /auth/login` before any session existed. The fix registers `/auth/login` on a separate router that bypasses the guard, while all other mutating endpoints remain protected.

`POST /api/v1/auth/login` now returns `204` from Swagger without requiring the `X-Requested-With` header.

### CSRF header exposed in Swagger

The `csrf_guard` dependency was refactored to declare `X-Requested-With` as a FastAPI `Header` parameter. Swagger UI now renders it as a visible input field on protected endpoints (`/logout`, `/logout-all`), making manual testing possible without a custom curl command.

### Password field masked in Swagger

The `password` field in `LoginRequest` is annotated with `json_schema_extra={"format": "password"}`. Swagger UI renders it as a masked input.

## Demo account

A one-click **demo login** button was added to the login form. It calls a local Next.js API route (`POST /api/demo-login`) that sets a mock session cookie. `getCurrentUser` intercepts the demo token and returns a hardcoded `Demo Admin` user without calling the backend. This allows full navigation of the workspace interface before the backend is connected.

A `seed-demo` CLI command was added to the backend for when the database is ready:

```bash
python -m app.cli seed-demo
# demo@aqarflow.com / Demo1234567!  →  Admin
# agent@aqarflow.com / Demo1234567!  →  Agent
```

## Build errors resolved

Three TypeScript/config errors were blocking the Vercel deployment:

- `layout.tsx` was passing a `role` prop to `<Sidebar />` which did not accept it — prop removed.
- `mobile-nav.tsx` was importing `SidebarNav` which was not exported from `sidebar.tsx` — import corrected. `Sidebar` was updated to accept optional `onNavigate` and `className` props for the mobile portal.
- `dictionaries.ts` had a duplicate `description` key inside `workspace.properties` — renamed to `sectionDescription`.

## Login page redesign

The right-hand section of the login page was redesigned:

- **Radial gradient background** using the primary blue colour variable.
- **Animated floating shapes** — three blurred circles with staggered `animate-pulse` delays.
- **Glassmorphism card** wrapping the form — `backdrop-blur-md`, semi-transparent background, subtle border.
- **AqarFlow brand badge** visible on mobile (hidden on large screens where the left panel shows).
- **SVG background** (`background-loginform.svg`) pinned to the bottom of the section at very low opacity as a subtle texture.

## Public navbar — mobile login button

The **Agency portal** button was hidden on screens below `lg` (1024 px). It is now visible from `md` (768 px) and the mobile burger menu includes a distinct styled login link at the bottom of the menu list.

## i18n — full EN/FR coverage

`DEFAULT_LOCALE = "en"` confirmed. Both EN and FR dictionaries cover all sections:

| Section | Keys |
|---|---|
| `nav` | All navigation labels |
| `common` | Theme, language, menu controls |
| `topbar` | Search placeholder |
| `home` | Hero, search, featured, city/type counts |
| `card` | Sale/rent badges, favourites, per month |
| `type` | Villa, Apartment, Duplex, House |
| `auth` | Login form, errors, demo |
| `workspace.dashboard` | KPI cards, tasks, CTA |
| `workspace.properties` | List, detail, form labels |
| `workspace.leads` | List filters, table columns, detail, pipeline |
| `workspace.visits` | Tabs, stat cards, table columns, conflict warning |
| `workspace.deals` | Placeholder |
| `workspace.team` | Placeholder |
| `public` | Listing detail, contact, specs |

Server components use `getT()` from `lib/i18n/server.ts`. Client components use `useT()` from `lib/i18n/provider.tsx`. Locale is stored in a `locale` cookie.

`LeadsTable` and `VisitsView` were migrated from hardcoded French to `useT()`.

## Docker — backend service added

`docker-compose.yml` now includes the `backend` service:

- Builds from `./backend/Dockerfile`.
- `DATABASE_URL` is overridden in `environment` to point to the `db` hostname inside Docker (not `localhost`).
- `MEDIA_ROOT` is set to `/app/uploads`.
- A named `uploads` volume persists property photos across `docker compose down`.

```bash
docker compose up -d          # starts db + backend
docker compose up -d db       # db only (for local backend dev)
```

## Vercel 500 fix

`serverApi` was throwing a raw `Error` when the backend was unreachable, causing Next.js to render a generic 500 page with no useful information. The fix:

- Wraps `fetch` in a `try/catch` and logs the real cause server-side via `console.error`.
- Throws a clean user-facing message instead of the internal URL.
- Errors from non-OK responses are also logged and replaced with a generic message.

The root cause on Vercel was `BACKEND_URL` not being set in the project environment variables, causing `fetch` to target `http://localhost:8000` which is unreachable from Vercel's edge.

## Known limitations

- Property photos are stored on the local filesystem; no cloud storage (S3/R2) yet.
- The `InquiryForm` on public listing pages submits to a backend endpoint not yet implemented.
- Agent-specific sidebar restrictions are enforced by the backend but not yet reflected in the navigation UI.
