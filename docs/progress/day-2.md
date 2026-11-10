# Day 2 — Login, roles and protected routes

Users can sign in and out, workspace pages require authentication, and the Admin and Agent roles see different parts of the application. Permissions are enforced by the backend, not only by hiding menu items.

## Login page

The login page is available at `http://localhost:3000/login`.

![Login page](../screenshots/day-2/login-page.png)

Invalid credentials are rejected with a clear error message.

![Login error message](../screenshots/day-2/login-error.png)

## Protected routes

Opening a workspace page without being signed in redirects to the login page.

![Redirect to login when signed out](../screenshots/day-2/unauthenticated-redirect.png)

## Admin view

An Admin sees the full navigation.

![Admin dashboard with full navigation](../screenshots/day-2/admin-dashboard.png)

## Agent view

An Agent sees only the areas allowed by the role rules.

![Agent dashboard with restricted navigation](../screenshots/day-2/agent-dashboard.png)

The backend also refuses Agent requests to Admin-only endpoints (HTTP 403).

![Agent request refused by the API](../screenshots/day-2/agent-forbidden-api.png)

## Authentication API

The authentication endpoints (login, logout, current user) are documented in the interactive API documentation.

![Authentication endpoints in Swagger](../screenshots/day-2/api-auth-docs.png)

## Automated tests

The backend authentication tests pass with `pytest`.

![Backend tests passing](../screenshots/day-2/backend-tests.png)

## Interface preferences

The interface is in English by default and can be switched to French. Light and dark themes are available.

![Dashboard in dark mode](../screenshots/day-2/dashboard-dark.png)

![Dashboard in French](../screenshots/day-2/dashboard-fr.png)

## Continuous integration

The backend and frontend workflows run on every push.

![GitHub Actions checks passing](../screenshots/day-2/ci-checks.png)

## Known limitations

Describe here what is not finished yet.
