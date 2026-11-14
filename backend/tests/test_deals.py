from datetime import datetime, timedelta, timezone

import pytest

from tests.conftest import CSRF, login, make_member, make_user


def property_payload(**overrides) -> dict:
    return {
        "reference_code": "AF-D100",
        "title": "Panoramic Duplex in F-7",
        "purpose": "sale",
        "property_type": "duplex",
        "price": "185000000",
        "city": "Islamabad",
        "locality": "F-7",
        "status": "available",
        "is_published": True,
        **overrides,
    }


def lead_payload(**overrides) -> dict:
    return {
        "name": "Umar Malik",
        "phone": "0300 4445566",
        "email": "umar@example.com",
        "source": "whatsapp",
        "stage": "qualified",
        **overrides,
    }


@pytest.fixture
def deal_setup(client, db):
    admin = make_user(db, "admin@example.com", role="admin")
    agent1 = make_member(db, admin, "agent1@example.com")
    agent2 = make_member(db, admin, "agent2@example.com")
    login(client, "admin@example.com")
    prop = client.post("/api/v1/properties", json=property_payload(), headers=CSRF).json()
    lead1 = client.post("/api/v1/leads", json=lead_payload(
        name="Umar Malik", phone="0300 4445566", property_id=prop["id"], assigned_agent_id=str(agent1.id)
    ), headers=CSRF).json()
    lead2 = client.post("/api/v1/leads", json=lead_payload(
        name="Zainab Sheikh", phone="0300 7778899", property_id=prop["id"], assigned_agent_id=str(agent2.id)
    ), headers=CSRF).json()
    return {
        "admin": admin,
        "agent1": agent1,
        "agent2": agent2,
        "prop": prop,
        "lead1": lead1,
        "lead2": lead2,
    }


def test_create_deal_progress_stages_and_prevent_double_closed_won(client, deal_setup):
    prop = deal_setup["prop"]
    lead1 = deal_setup["lead1"]
    lead2 = deal_setup["lead2"]
    agent1 = deal_setup["agent1"]

    close_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    create_res = client.post("/api/v1/deals", headers=CSRF, json={
        "lead_id": lead1["id"],
        "stage": "offer",
        "offer_amount": "175000000",
        "expected_close_date": close_date,
        "notes": "Initial buyer offer submitted.",
    })
    assert create_res.status_code == 201
    deal1 = create_res.json()
    assert deal1["property_id"] == prop["id"]
    assert deal1["buyer_contact_id"] == lead1["contact_id"]
    assert deal1["agent_id"] == str(agent1.id)
    assert len(deal1["events"]) == 1
    assert deal1["events"][0]["new_stage"] == "offer"

    board = client.get("/api/v1/deals").json()
    assert board["total"] == 1
    assert board["open_count"] == 1
    assert float(board["pipeline_value"]) == 175000000.0

    stage_res = client.post(f"/api/v1/deals/{deal1['id']}/stage", headers=CSRF, json={
        "stage": "closed_won",
        "agreed_amount": "180000000",
    })
    assert stage_res.status_code == 200
    won_deal = stage_res.json()
    assert won_deal["stage"] == "closed_won"
    assert float(won_deal["agreed_amount"]) == 180000000.0
    assert [e["new_stage"] for e in won_deal["events"]] == ["offer", "closed_won"]

    lead_after = client.get(f"/api/v1/leads/{lead1['id']}").json()
    assert lead_after["stage"] == "converted"

    deal2 = client.post("/api/v1/deals", headers=CSRF, json={
        "lead_id": lead2["id"],
        "stage": "negotiation",
        "offer_amount": "182000000",
    }).json()
    conflict_res = client.post(f"/api/v1/deals/{deal2['id']}/stage", headers=CSRF, json={
        "stage": "closed_won",
    })
    assert conflict_res.status_code == 409


def test_agent_permissions_and_cross_agency_isolation_for_deals(client, db, deal_setup):
    lead1 = deal_setup["lead1"]
    agent1 = deal_setup["agent1"]
    agent2 = deal_setup["agent2"]

    deal1 = client.post("/api/v1/deals", headers=CSRF, json={
        "lead_id": lead1["id"],
        "agent_id": str(agent1.id),
        "stage": "inquiry",
    }).json()

    login(client, "agent2@example.com")
    assert client.get("/api/v1/deals").json()["total"] == 0
    assert client.get(f"/api/v1/deals/{deal1['id']}").status_code == 403
    assert client.post(f"/api/v1/deals/{deal1['id']}/stage", headers=CSRF, json={"stage": "visit"}).status_code == 403

    login(client, "agent1@example.com")
    assert client.get("/api/v1/deals").json()["total"] == 1
    updated = client.post(f"/api/v1/deals/{deal1['id']}/stage", headers=CSRF, json={"stage": "qualified"})
    assert updated.status_code == 200 and updated.json()["stage"] == "qualified"

    make_user(db, "rival@example.com", role="admin")
    login(client, "rival@example.com")
    assert client.get("/api/v1/deals").json()["total"] == 0
    assert client.get(f"/api/v1/deals/{deal1['id']}").status_code == 404
