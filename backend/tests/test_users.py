from tests.conftest import CSRF, login, make_member, make_user


def test_lists_only_active_members_of_own_agency_without_emails(client, db):
    admin = make_user(db, "admin@example.com", role="admin")
    make_member(db, admin, "agent@example.com")
    make_member(db, admin, "gone@example.com", is_active=False)
    make_user(db, "rival@example.com")
    login(client, "agent@example.com")
    members = client.get("/api/v1/users").json()
    assert sorted(member["role"] for member in members) == ["admin", "agent"]
    assert all(set(member) == {"id", "full_name", "role"} for member in members)


def test_requires_authentication(client):
    assert client.get("/api/v1/users").status_code == 401


def test_team_workload_and_admin_member_management(client, db):
    make_user(db, "admin@example.com", role="admin")
    login(client, "admin@example.com")

    created = client.post("/api/v1/users", json={
        "full_name": "Fatima Ali", "email": "Fatima@Example.com",
        "phone": "0300 1234567", "password": "strong-password-123", "role": "agent",
    }, headers=CSRF)
    assert created.status_code == 201
    agent_id = created.json()["id"]

    assert client.post("/api/v1/users", json={
        "full_name": "Duplicate", "email": "fatima@example.com",
        "password": "strong-password-123", "role": "agent",
    }, headers=CSRF).status_code == 409

    client.post("/api/v1/leads", json={
        "name": "Ali Khan", "phone": "0321 1234567", "assigned_agent_id": agent_id,
    }, headers=CSRF)

    team = client.get("/api/v1/users/team").json()
    fatima = next(m for m in team if m["id"] == agent_id)
    assert fatima["leads_count"] == 1 and fatima["properties_count"] == 0

    deactivated = client.patch(f"/api/v1/users/{agent_id}", json={"is_active": False}, headers=CSRF)
    assert deactivated.status_code == 200 and deactivated.json()["is_active"] is False
