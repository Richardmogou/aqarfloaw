from datetime import datetime, timedelta, timezone

import pytest

from tests.conftest import CSRF, login, make_member, make_user


def property_payload(**overrides) -> dict:
    return {
        "reference_code": "AF-V100",
        "title": "Modern villa in F-7",
        "purpose": "sale",
        "property_type": "villa",
        "price": "185000000",
        "city": "Islamabad",
        "locality": "F-7",
        "status": "available",
        "is_published": True,
        **overrides,
    }


def lead_payload(**overrides) -> dict:
    return {
        "name": "Ayesha Khan",
        "phone": "0300 1234567",
        "email": "ayesha@example.com",
        "source": "website",
        **overrides,
    }


@pytest.fixture
def visit_setup(client, db):
    admin = make_user(db, "admin@example.com", role="admin")
    agent1 = make_member(db, admin, "agent1@example.com")
    agent2 = make_member(db, admin, "agent2@example.com")
    login(client, "admin@example.com")
    prop1 = client.post("/api/v1/properties", json=property_payload(reference_code="AF-V1"), headers=CSRF).json()
    prop2 = client.post("/api/v1/properties", json=property_payload(reference_code="AF-V2", title="Apartment in Gulberg"), headers=CSRF).json()
    lead1 = client.post("/api/v1/leads", json=lead_payload(
        name="Client One", phone="0300 1111111", property_id=prop1["id"], assigned_agent_id=str(agent1.id)
    ), headers=CSRF).json()
    lead2 = client.post("/api/v1/leads", json=lead_payload(
        name="Client Two", phone="0300 2222222", property_id=prop2["id"], assigned_agent_id=str(agent1.id)
    ), headers=CSRF).json()
    return {
        "admin": admin,
        "agent1": agent1,
        "agent2": agent2,
        "prop1": prop1,
        "prop2": prop2,
        "lead1": lead1,
        "lead2": lead2,
    }


def test_create_visit_detects_conflict_and_completes_with_outcome(client, visit_setup):
    prop1 = visit_setup["prop1"]
    prop2 = visit_setup["prop2"]
    lead1 = visit_setup["lead1"]
    lead2 = visit_setup["lead2"]
    agent1 = visit_setup["agent1"]

    base_start = (datetime.now(timezone.utc) + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0)

    v1_res = client.post("/api/v1/visits", headers=CSRF, json={
        "property_id": prop1["id"],
        "lead_id": lead1["id"],
        "agent_id": str(agent1.id),
        "starts_at": base_start.isoformat(),
        "duration_minutes": 60,
        "status": "confirmed",
        "meeting_point": "Main gate, Street 12",
    })
    assert v1_res.status_code == 201
    v1 = v1_res.json()
    assert v1["has_conflict"] is False
    assert v1["duration_minutes"] == 60

    lead_after = client.get(f"/api/v1/leads/{lead1['id']}").json()
    assert lead_after["stage"] == "visit_scheduled"

    overlapping_start = base_start + timedelta(minutes=30)
    v2_res = client.post("/api/v1/visits", headers=CSRF, json={
        "property_id": prop2["id"],
        "lead_id": lead2["id"],
        "agent_id": str(agent1.id),
        "starts_at": overlapping_start.isoformat(),
        "duration_minutes": 60,
        "status": "requested",
    })
    assert v2_res.status_code == 201
    v2 = v2_res.json()
    assert v2["has_conflict"] is True
    assert v1["id"] in v2["conflicting_visit_ids"]

    page = client.get("/api/v1/visits").json()
    assert page["total"] == 2
    assert page["upcoming_count"] == 2
    assert page["conflict_count"] == 2

    complete_res = client.post(f"/api/v1/visits/{v1['id']}/complete", headers=CSRF, json={
        "status": "completed",
        "outcome": "Client liked the layout and requested a formal offer.",
    })
    assert complete_res.status_code == 200
    completed = complete_res.json()
    assert completed["status"] == "completed"
    assert completed["outcome"] == "Client liked the layout and requested a formal offer."
    assert completed["has_conflict"] is False

    page_after = client.get("/api/v1/visits").json()
    assert page_after["upcoming_count"] == 1
    assert page_after["completed_count"] == 1
    assert page_after["conflict_count"] == 0


def test_agent_permissions_and_cross_agency_isolation_for_visits(client, db, visit_setup):
    prop1 = visit_setup["prop1"]
    lead1 = visit_setup["lead1"]
    agent1 = visit_setup["agent1"]
    agent2 = visit_setup["agent2"]

    start = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    v1 = client.post("/api/v1/visits", headers=CSRF, json={
        "property_id": prop1["id"],
        "lead_id": lead1["id"],
        "agent_id": str(agent1.id),
        "starts_at": start,
        "duration_minutes": 45,
    }).json()

    login(client, "agent2@example.com")
    assert client.get("/api/v1/visits").json()["total"] == 0
    assert client.get(f"/api/v1/visits/{v1['id']}").status_code == 403
    assert client.post(f"/api/v1/visits/{v1['id']}/complete", headers=CSRF, json={"status": "completed"}).status_code == 403

    login(client, "agent1@example.com")
    assert client.get("/api/v1/visits").json()["total"] == 1
    assert client.patch(f"/api/v1/visits/{v1['id']}", headers=CSRF, json={"agent_id": str(agent2.id)}).status_code == 403

    make_user(db, "rival@example.com", role="admin")
    login(client, "rival@example.com")
    assert client.get("/api/v1/visits").json()["total"] == 0
    assert client.get(f"/api/v1/visits/{v1['id']}").status_code == 404
