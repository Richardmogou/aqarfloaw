# AqarFlow API v1 Reference

Base URL (local): `http://localhost:8000/api/v1`  
Interactive OpenAPI / Swagger UI: `http://localhost:8000/docs`

All state-changing requests (`POST`, `PATCH`, `PUT`, `DELETE`) require header `X-Requested-With: aqarflow`. Authenticated endpoints require the `aqarflow_session` `HttpOnly` cookie set by `POST /api/v1/auth/login`.

---

## 1. Health & Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | Returns service and PostgreSQL connectivity status (`{"status":"ok","database":"up"}`) |
| `POST` | `/api/v1/auth/login` | Public | Authenticates email/password and sets `aqarflow_session` cookie |
| `POST` | `/api/v1/auth/logout` | User | Revokes the current session and clears cookie |
| `POST` | `/api/v1/auth/logout-all` | User | Revokes all active sessions for the current user |
| `GET` | `/api/v1/auth/me` | User | Returns the authenticated user's profile (`id`, `agency_id`, `full_name`, `email`, `role`) |

---

## 2. Team & Users (`/api/v1/users`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/agents` | User | Lists active members (`admin` and `agent`) in the caller's agency for assignment dropdowns |
| `GET` | `/api/v1/users` | Admin | Lists all members (active and inactive) in the caller's agency |
| `POST` | `/api/v1/users` | Admin | Creates a new agent or admin in the caller's agency |
| `PATCH` | `/api/v1/users/{user_id}` | Admin | Updates `full_name`, `role`, or `is_active` (deactivating revokes all active sessions) |

---

## 3. Properties & Media (`/api/v1/properties`, `/api/v1/media`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/properties` | User | Paginated workspace property list with filters (`q`, `status`, `purpose`, `property_type`, `city`, `is_published`, `assigned_agent_id`, `min_price`, `max_price`, `bedrooms`) |
| `POST` | `/api/v1/properties` | User | Creates a property listing with auto-generated `reference_code` and `slug` |
| `GET` | `/api/v1/properties/{property_id}` | User | Returns full property details and ordered `media` gallery |
| `PATCH` | `/api/v1/properties/{property_id}` | User | Updates property fields (Agents may only edit properties assigned to them) |
| `DELETE` | `/api/v1/properties/{property_id}` | Admin | Soft-archives a property listing |
| `POST` | `/api/v1/properties/{property_id}/media` | User | Uploads a photo (`multipart/form-data`, `JPEG`/`PNG`/`WebP`, max 10 MB) |
| `PATCH` | `/api/v1/properties/{property_id}/media/{media_id}` | User | Sets cover photo (`is_cover`) or updates `sort_order` |
| `DELETE` | `/api/v1/properties/{property_id}/media/{media_id}` | User | Deletes a property photo |
| `GET` | `/api/v1/media/{media_id}` | Public/User | Streams media file (public only if parent property is published; workspace users can view draft media in their agency) |

---

## 4. Public Portal & Lead Capture (`/api/v1/public`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/public/properties` | Public | Paginated catalog of published, non-archived properties (`q`, `city`, `purpose`, `property_type`, `bedrooms`, `min_price`, `max_price`, `sort`) |
| `GET` | `/api/v1/public/properties/{slug}` | Public | Public property detail by slug including public agent contact card |
| `POST` | `/api/v1/public/inquiries` | Public | Submits a buyer/tenant inquiry; normalizes phone, upserts `Contact`, creates `Lead` (`stage="new"`), and logs an `inquiry` activity |

### Example: Submit Public Inquiry
```bash
curl -X POST http://localhost:8000/api/v1/public/inquiries \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: aqarflow" \
  -d '{
    "property_slug": "panoramic-margalla-view-duplex-penthouse-f7-isb-dup-001",
    "name": "Kamran Akmal",
    "phone": "0300-7788990",
    "email": "kamran.akmal@example.com",
    "message": "Interested in viewing this property this weekend.",
    "consent": true
  }'
```

---

## 5. Contacts & CRM Leads (`/api/v1/contacts`, `/api/v1/leads`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/contacts` | User | Paginated contact directory (`q`, `contact_type`) |
| `POST` | `/api/v1/contacts` | User | Creates a contact (deduplicates by normalized phone within the agency) |
| `GET` | `/api/v1/contacts/{contact_id}` | User | Returns contact details |
| `PATCH` | `/api/v1/contacts/{contact_id}` | User | Updates contact fields |
| `GET` | `/api/v1/leads` | User | Paginated leads list (`q`, `stage`, `source`, `property_id`, `assigned_agent_id`, `unassigned`, `sort`); Agents see only their assigned leads |
| `POST` | `/api/v1/leads` | User | Creates a lead and upserts the associated contact by normalized phone |
| `GET` | `/api/v1/leads/{lead_id}` | User | Returns lead details, linked contact, linked property, and chronological `activities` timeline |
| `PATCH` | `/api/v1/leads/{lead_id}` | User | Updates lead stage, source, budget, preferred location, or follow-up timestamp |
| `POST` | `/api/v1/leads/{lead_id}/assign` | Admin | Assigns or unassigns a lead to an agency member and logs an `assignment` activity |
| `POST` | `/api/v1/leads/{lead_id}/activities` | User | Appends a `note` or `call` activity entry to the lead timeline |

---

## 6. Property Visits (`/api/v1/visits`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/visits` | User | Lists visits with status/property/lead/agent filters, per-visit `has_conflict` and `conflicting_visit_ids`, and summary counts (`upcoming_count`, `completed_count`, `cancelled_count`, `conflict_count`) |
| `POST` | `/api/v1/visits` | User | Schedules a visit, computes overlap conflicts for the agent, advances lead stage to `visit_scheduled`, and logs a `visit` activity |
| `GET` | `/api/v1/visits/{visit_id}` | User | Returns visit details with conflict status |
| `PATCH` | `/api/v1/visits/{visit_id}` | User | Updates visit time window, status, agent (Admin only), meeting point, notes, or outcome |
| `POST` | `/api/v1/visits/{visit_id}/complete` | User | Marks a visit `completed`, `cancelled`, or `no_show`, records `outcome`, and logs a lead activity |

---

## 7. Deals & Pipeline (`/api/v1/deals`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/deals` | User | Lists deals with filters (`stage`, `property_id`, `lead_id`, `agent_id`) and pipeline summary totals (`open_count`, `closed_won_count`, `pipeline_value`) |
| `POST` | `/api/v1/deals` | User | Creates a deal linked to a property, lead, buyer contact, and agent; records initial `DealEvent` and syncs lead stage |
| `GET` | `/api/v1/deals/{deal_id}` | User | Returns deal details and chronological `events` stage history |
| `PATCH` | `/api/v1/deals/{deal_id}` | User | Updates deal amounts, close date, notes, stage, or agent (Admin only) |
| `POST` | `/api/v1/deals/{deal_id}/stage` | User | Transitions deal stage (`inquiry` through `closed_won`/`closed_lost`), appends a `DealEvent`, and prevents duplicate `closed_won` deals on the same property (`HTTP 409`) |
