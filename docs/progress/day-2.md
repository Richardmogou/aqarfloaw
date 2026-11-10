# Day 2 — Authentication

Users can sign in to their agency workspace, and the API exposes endpoints to sign in, read the current user and sign out.

## Login page

The login page is available at `http://localhost:3000/login`. It asks for an email and a password, and offers a language switch (EN / FR) and a theme switch (light, dark, system).

![Login page](../screenshots/day-2/aqarflow_loginpage.png)

## Authentication API

The authentication endpoints are available in the interactive API documentation at `http://localhost:8000/docs`.

### Login

`POST /api/v1/auth/login` receives the email and the password as JSON.

![Login endpoint in Swagger](../screenshots/day-2/swagger_login.png)

### Current user

After signing in, `GET /api/v1/auth/me` returns the signed-in user with the `agent` role (HTTP 200).

![Current user endpoint in Swagger](../screenshots/day-2/swagger_auth_me.png)

### Logout

`POST /api/v1/auth/logout` ends the current session (HTTP 204).

![Logout endpoint in Swagger](../screenshots/day-2/swagger_logout.png)

### Logout from all sessions

`POST /api/v1/auth/logout-all` ends all sessions of the user (HTTP 204).

![Logout-all endpoint in Swagger](../screenshots/day-2/swagger_logout_all.png)
