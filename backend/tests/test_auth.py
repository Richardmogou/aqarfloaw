from datetime import datetime, timedelta, timezone

from fastapi import Depends
from sqlalchemy import select

from app.api.deps import require_role
from app.core.config import settings
from app.main import app
from app.models import AuthSession
from app.permissions.roles import Role
from tests.conftest import CSRF, login, make_user


@app.get("/api/v1/_test/admin-only")
def admin_only(user=Depends(require_role(Role.ADMIN))):
    return {"ok": True}


def test_login_sets_httponly_cookie_and_me_returns_user(client, db):
    make_user(db, "admin@example.com", role="admin")
    response = login(client, "  Admin@Example.com ")
    assert response.status_code == 204
    set_cookie = response.headers["set-cookie"]
    assert set_cookie.startswith(f"{settings.session_cookie_name}=")
    assert "HttpOnly" in set_cookie and "SameSite=lax" in set_cookie

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "admin@example.com"
    assert me.json()["role"] == "admin"
    assert "password_hash" not in me.json()


def test_session_token_is_stored_hashed(client, db):
    make_user(db, "agent@example.com")
    login(client, "agent@example.com")
    token = client.cookies[settings.session_cookie_name]
    stored = db.scalars(select(AuthSession.token_hash)).all()
    assert token not in stored and len(stored) == 1


def test_login_failures_are_indistinguishable(client, db):
    make_user(db, "agent@example.com")
    make_user(db, "inactive@example.com", is_active=False)
    responses = [login(client, "agent@example.com", "wrong"),
                 login(client, "nobody@example.com"),
                 login(client, "inactive@example.com")]
    assert {r.status_code for r in responses} == {401}
    assert len({r.text for r in responses}) == 1
    assert all("set-cookie" not in r.headers for r in responses)


def test_me_requires_authentication(client):
    assert client.get("/api/v1/auth/me").status_code == 401
    client.cookies.set(settings.session_cookie_name, "forged-token")
    assert client.get("/api/v1/auth/me").status_code == 401


def test_expired_session_is_rejected(client, db):
    make_user(db, "agent@example.com")
    login(client, "agent@example.com")
    db.query(AuthSession).update({AuthSession.expires_at: datetime.now(timezone.utc) - timedelta(seconds=1)})
    assert client.get("/api/v1/auth/me").status_code == 401


def test_deactivated_user_loses_access(client, db):
    user = make_user(db, "agent@example.com")
    login(client, "agent@example.com")
    user.is_active = False
    db.flush()
    assert client.get("/api/v1/auth/me").status_code == 401


def test_logout_revokes_current_session(client, db):
    make_user(db, "agent@example.com")
    login(client, "agent@example.com")
    token = client.cookies[settings.session_cookie_name]
    assert client.post("/api/v1/auth/logout", headers=CSRF).status_code == 204
    client.cookies.set(settings.session_cookie_name, token)
    assert client.get("/api/v1/auth/me").status_code == 401


def test_logout_all_revokes_every_session(client, db):
    make_user(db, "agent@example.com")
    login(client, "agent@example.com")
    first_token = client.cookies[settings.session_cookie_name]
    login(client, "agent@example.com")
    assert client.post("/api/v1/auth/logout-all", headers=CSRF).status_code == 204
    client.cookies.set(settings.session_cookie_name, first_token)
    assert client.get("/api/v1/auth/me").status_code == 401
    assert db.scalar(select(AuthSession).where(AuthSession.revoked_at.is_(None))) is None


def test_mutation_without_csrf_header_is_forbidden(client, db):
    make_user(db, "agent@example.com")
    response = client.post("/api/v1/auth/login", json={"email": "agent@example.com", "password": "x"})
    assert response.status_code == 403


def test_require_role_blocks_agent_and_allows_admin(client, db):
    make_user(db, "agent@example.com")
    make_user(db, "admin@example.com", role="admin")
    login(client, "agent@example.com")
    assert client.get("/api/v1/_test/admin-only").status_code == 403
    login(client, "admin@example.com")
    assert client.get("/api/v1/_test/admin-only").status_code == 200
