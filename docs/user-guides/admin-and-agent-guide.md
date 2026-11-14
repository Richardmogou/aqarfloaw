# Admin & Agent User Guide (AqarFlow MVP)

This guide covers the core daily workflows and role permissions for Agency Administrators and Real Estate Agents in AqarFlow.

---

## 1. Role Permissions Matrix

| Module / Capability | Agency Admin (`admin`) | Agency Agent (`agent`) | Public Visitor |
|---|---|---|---|
| Public portal (`/`, `/listings`, `/listings/[slug]`) | Read + submit inquiry | Read + submit inquiry | Read + submit inquiry |
| Sign in / sign out / revoke all sessions | Yes | Yes | — |
| Dashboard KPIs & Recent Activity (`/dashboard`) | Agency-wide totals | Own assigned portfolio | — |
| Properties (`/properties`) | Full CRUD, publish/unpublish, assign any agent, upload/delete/reorder media | Create & edit own assigned properties, upload/delete/reorder media on own properties | — |
| CRM Leads (`/leads`, `/leads/[id]`) | View all agency leads, create, edit stage/budget, assign/reassign to any agent, log notes & calls | View own assigned leads, create leads (assigned to self), edit stage/budget, log notes & calls | — |
| Contacts (`/api/v1/contacts`) | Full agency contact directory | Agency contact directory (read/create/update) | — |
| Visits (`/visits`, `/visits/new`) | View all agency visits, schedule for any agent, confirm/cancel/complete, view conflict alerts | View own visits, schedule for self, confirm/cancel/complete, view conflict alerts | — |
| Deals (`/deals`, `/deals/new`, `/deals/[id]`) | View all agency deals, create for any agent, update stage/amounts, reassign agent | View own deals, create for self, update stage/amounts | — |
| Team Management (`/team`) | Create agents, activate/deactivate accounts | Restricted (`403` / `/forbidden`) | — |

---

## 2. Agency Administrator Workflows

### 2.1 Managing the Team (`/team`)
1. Open **Team** in the left navigation.
2. Fill in **Full name**, **Email**, and a temporary password (minimum 12 characters) under **Add a team member** to create a new Agent account.
3. Use the **Deactivate / Reactivate** toggle on any agent row to immediately revoke or restore workspace access. Deactivating an agent automatically revokes all of their active login sessions.

### 2.2 Managing Property Inventory (`/properties`)
1. Click **+ New property** to create a listing with title, sale/rent purpose, property type (`house`, `apartment`, `villa`, `commercial`, `plot`), price in PKR, area (`marla`, `kanal`, `sqft`, `sqyd`), bedrooms/bathrooms, city, locality, and assigned agent.
2. Upload property photos (JPEG, PNG, or WebP) on the property edit page, set the cover image, or reorder gallery items.
3. Toggle **Published on public portal** (`is_published`) to control whether the listing appears on `/listings` and the public home page.

### 2.3 Triage & Assignment of Public Inquiries (`/leads`)
1. When a visitor submits the inquiry form on a public listing (`/listings/[slug]`), AqarFlow normalizes their Pakistan phone number (`+92...`), deduplicates or creates a `Contact`, creates a `Lead` in stage `new`, and logs an initial inquiry activity.
2. Open **Leads** (`/leads`), filter by **Unassigned** or **Stage: New**, and open the lead detail view.
3. In the **Actions** panel, assign the lead to an active Agent. An assignment activity is automatically recorded in the timeline.

---

## 3. Real Estate Agent Workflows

### 3.1 Qualifying Leads & Logging Activities (`/leads/[id]`)
1. Sign in at `/login` and open **Leads** to view leads assigned to you.
2. Open a lead to inspect their contact details, linked property, and budget range.
3. Use the **Activity timeline** composer to log phone calls (`call`) or meeting notes (`note`).
4. Advance the lead stage (`new` -> `contacted` -> `qualified` -> `visit_scheduled` -> `negotiation` -> `converted` / `lost`) as qualification progresses.

### 3.2 Scheduling Visits & Resolving Conflicts (`/visits`)
1. From a lead detail page (click **Schedule a visit**) or from **Visits -> + Schedule a visit**, select the property, prospect, date/time, duration, status (`requested` or `confirmed`), and meeting point.
2. Scheduling a visit automatically advances leads in `new`, `contacted`, or `qualified` to `visit_scheduled`.
3. If two active visits (`requested` or `confirmed`) overlap in time for the same agent, AqarFlow highlights both rows and displays an alert banner at the top of `/visits` and on the Dashboard KPI card.
4. After the viewing takes place, click **Log result** to mark the visit `completed`, `cancelled`, or `no_show` and record the buyer's feedback.

### 3.3 Tracking Deals from Inquiry to Closing (`/deals`)
1. From a lead detail page (click **Create a deal**) or from **Deals -> + New deal**, select the lead, property, initial pipeline stage, offer amount (PKR), agreed amount (PKR), and expected close date.
2. Use the 9-stage Kanban board (`inquiry`, `qualified`, `visit`, `offer`, `negotiation`, `booking`, `documentation`, `closed_won`, `closed_lost`) to move deals across stages or open `/deals/[id]` to update amounts and inspect the full `Stage history` audit log.
3. Marking a deal `closed_won` automatically converts the linked lead (`converted`) and blocks any duplicate `closed_won` deal on the same property (`HTTP 409 Conflict`).
