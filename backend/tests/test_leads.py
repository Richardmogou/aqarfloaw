from pathlib import Path

import pytest

from app.core.config import settings
from tests.conftest import CSRF, login, make_member, make_user

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32


@pytest.fixture(autouse=True)
def media_root(tmp_path, monkeypatch) -> Path:
    monkeypatch.setattr(settings, "media_root", str(tmp_path))
    return tmp_path


def property_payload(**overrides) -> dict:
    return {"reference_code": "AF-100", "title": "Modern villa in F-7", "purpose": "sale",
            "property_type": "villa", "price": "185000000", "city": "Islamabad", "locality": "F-7",
            "status": "available", "is_published": True, **overrides}


def lead_payload(**overrides) -> dict:
    return {"name": "Ali Khan", "phone": "0300 1234567", "email": "Ali@Example.com",
            "source": "phone", "budget_min": "150000000", "budget_max": "200000000",
            "preferred_location": "F-7, Islamabad", "message": "Looking for a 5-bedroom villa.", **overrides}


@pytest.fixture
def agency_setup(client, db):
    admin = make_user(db, "admin@example.com", role="admin")
    agent1 = make_member(db, admin, "agent1@example.com")
    agent2 = make_member(db, admin, "agent2@example.com")
    login(client, "admin@example.com")
    prop = client.post("/api/v1/properties", json=property_payload(), headers=CSRF).json()
    client.post(f"/api/v1/properties/{prop['id']}/media", headers=CSRF,
                files=[("files", ("cover.png", PNG, "image/png"))])
    return {"admin": admin, "agent1": agent1, "agent2": agent2, "property": prop}


def test_public_inquiry_appears_in_leads_and_can_be_assigned_and_progressed(client, agency_setup):
    prop = agency_setup["property"]
    agent1 = agency_setup["agent1"]
    client.cookies.clear()

    inquiry_res = client.post("/api/v1/public/inquiries", headers=CSRF, json={
        "name": "Zainab Sheikh", "phone": "0321 9876543", "email": "zainab@example.com",
        "message": "Interested in visiting this villa.", "property_slug": prop["slug"], "consent": True,
    })
    assert inquiry_res.status_code == 201

    login(client, "admin@example.com")
    listing = client.get("/api/v1/leads", params={"unassigned": True}).json()
    assert listing["total"] == 1
    lead = listing["items"][0]
    assert lead["stage"] == "new" and lead["source"] == "website"
    assert lead["contact"]["name"] == "Zainab Sheikh"
    assert lead["contact"]["phone_normalized"] == "+923219876543"
    assert lead["property"]["id"] == prop["id"]

    assign_res = client.post(f"/api/v1/leads/{lead['id']}/assign",
                             json={"assigned_agent_id": str(agent1.id)}, headers=CSRF)
    assert assign_res.status_code == 200
    assigned = assign_res.json()
    assert assigned["assigned_agent_id"] == str(agent1.id)
    assert any(a["activity_type"] == "assignment" and a["body"] == agent1.full_name for a in assigned["activities"])

    login(client, "agent1@example.com")
    agent_leads = client.get("/api/v1/leads").json()
    assert agent_leads["total"] == 1 and agent_leads["items"][0]["id"] == lead["id"]

    note_res = client.post(f"/api/v1/leads/{lead['id']}/activities",
                           json={"activity_type": "note", "body": "Called client, scheduling visit for Friday."},
                           headers=CSRF)
    assert note_res.status_code == 201
    assert note_res.json()["user_name"] == agent1.full_name

    stage_res = client.patch(f"/api/v1/leads/{lead['id']}", json={"stage": "contacted"}, headers=CSRF)
    assert stage_res.status_code == 200
    detail = stage_res.json()
    assert detail["stage"] == "contacted"
    types = [a["activity_type"] for a in detail["activities"]]
    assert "note" in types and "stage_change" in types and "assignment" in types


def test_agent_only_sees_assigned_leads_and_cannot_reassign(client, agency_setup):
    agent1 = agency_setup["agent1"]
    agent2 = agency_setup["agent2"]

    unassigned = client.post("/api/v1/leads", json=lead_payload(phone="0300 1111111"), headers=CSRF).json()
    assigned_1 = client.post("/api/v1/leads", json=lead_payload(
        name="Client One", phone="0300 2222222", assigned_agent_id=str(agent1.id)), headers=CSRF).json()
    assigned_2 = client.post("/api/v1/leads", json=lead_payload(
        name="Client Two", phone="0300 3333333", assigned_agent_id=str(agent2.id)), headers=CSRF).json()

    login(client, "agent1@example.com")
    visible = client.get("/api/v1/leads").json()
    assert [item["id"] for item in visible["items"]] == [assigned_1["id"]]

    assert client.get(f"/api/v1/leads/{unassigned['id']}").status_code == 403
    assert client.get(f"/api/v1/leads/{assigned_2['id']}").status_code == 403
    assert client.patch(f"/api/v1/leads/{assigned_2['id']}", json={"stage": "contacted"}, headers=CSRF).status_code == 403
    assert client.post(f"/api/v1/leads/{assigned_2['id']}/activities",
                       json={"body": "Sneaky note"}, headers=CSRF).status_code == 403

    assert client.post(f"/api/v1/leads/{assigned_1['id']}/assign",
                       json={"assigned_agent_id": str(agent2.id)}, headers=CSRF).status_code == 403
    assert client.patch(f"/api/v1/leads/{assigned_1['id']}",
                        json={"assigned_agent_id": str(agent2.id)}, headers=CSRF).status_code == 403


def test_agent_creating_lead_assigns_it_to_self(client, agency_setup):
    agent1 = agency_setup["agent1"]
    agent2 = agency_setup["agent2"]
    login(client, "agent1@example.com")

    assert client.post("/api/v1/leads", json=lead_payload(
        assigned_agent_id=str(agent2.id)), headers=CSRF).status_code == 403

    created = client.post("/api/v1/leads", json=lead_payload(), headers=CSRF)
    assert created.status_code == 201
    assert created.json()["assigned_agent_id"] == str(agent1.id)


def test_cross_agency_isolation_for_leads_and_contacts(client, db, agency_setup):
    lead = client.post("/api/v1/leads", json=lead_payload(), headers=CSRF).json()
    contact_id = lead["contact_id"]

    make_user(db, "rival@example.com", role="admin")
    login(client, "rival@example.com")
    assert client.get("/api/v1/leads").json()["total"] == 0
    assert client.get(f"/api/v1/leads/{lead['id']}").status_code == 404
    assert client.patch(f"/api/v1/leads/{lead['id']}", json={"stage": "lost"}, headers=CSRF).status_code == 404
    assert client.get(f"/api/v1/contacts/{contact_id}").status_code == 404


def test_lead_filters_and_validation(client, agency_setup):
    prop = agency_setup["property"]
    agent1 = agency_setup["agent1"]

    client.post("/api/v1/leads", json=lead_payload(
        name="Sara Noor", phone="0300 4444444", source="whatsapp", stage="qualified",
        property_id=prop["id"], assigned_agent_id=str(agent1.id)), headers=CSRF)
    client.post("/api/v1/leads", json=lead_payload(
        name="Bilal Tariq", phone="0300 5555555", source="instagram", stage="new"), headers=CSRF)

    assert client.get("/api/v1/leads", params={"stage": "qualified"}).json()["total"] == 1
    assert client.get("/api/v1/leads", params={"source": "instagram"}).json()["total"] == 1
    assert client.get("/api/v1/leads", params={"property_id": prop["id"]}).json()["total"] == 1
    assert client.get("/api/v1/leads", params={"unassigned": True}).json()["total"] == 1
    assert client.get("/api/v1/leads", params={"q": "Sara"}).json()["total"] == 1
    assert client.get("/api/v1/leads", params={"q": "AF-100"}).json()["total"] == 1

    bad_budget = client.post("/api/v1/leads", json=lead_payload(
        budget_min="300000000", budget_max="100000000"), headers=CSRF)
    assert bad_budget.status_code == 422


def test_contacts_crud_and_duplicate_phone_check(client, agency_setup):
    res = client.post("/api/v1/contacts", json={
        "name": "Umar Malik", "phone": "0333 1234567", "email": "Umar@Example.com",
        "contact_type": "buyer", "notes": "Prefers WhatsApp",
    }, headers=CSRF)
    assert res.status_code == 201
    contact = res.json()
    assert contact["phone_normalized"] == "+923331234567" and contact["email"] == "umar@example.com"

    dup = client.post("/api/v1/contacts", json={
        "name": "Duplicate", "phone": "+92 333 123 4567",
    }, headers=CSRF)
    assert dup.status_code == 409

    updated = client.patch(f"/api/v1/contacts/{contact['id']}", json={"notes": "VIP client"}, headers=CSRF)
    assert updated.status_code == 200 and updated.json()["notes"] == "VIP client"
    assert client.get("/api/v1/contacts", params={"q": "Umar"}).json()["total"] == 1
