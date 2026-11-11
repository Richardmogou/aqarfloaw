from tests.conftest import login, make_member, make_user


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
