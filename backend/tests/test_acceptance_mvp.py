from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.cli import seed_demo_data
from tests.conftest import CSRF, login, make_member, make_user


def test_seed_demo_data_is_idempotent(db: Session) -> None:
    first = seed_demo_data(db, password="AqarFlowDemo!2026")
    second = seed_demo_data(db, password="AqarFlowDemo!2026")
    assert first == {"users": 3, "properties": 4, "leads": 3}
    assert second == first


def test_end_to_end_mvp_journey_and_acceptance_criteria(client: TestClient, db: Session) -> None:
    admin = make_user(db, "admin@acceptance.pk", role="admin")
    agent1 = make_member(db, admin, "agent1@acceptance.pk", role="agent")
    agent2 = make_member(db, admin, "agent2@acceptance.pk", role="agent")
    db.commit()

    assert client.get("/api/v1/properties").status_code == 401
    assert client.get("/api/v1/leads").status_code == 401
    assert client.get("/api/v1/visits").status_code == 401
    assert client.get("/api/v1/deals").status_code == 401

    assert login(client, admin.email).status_code == 204

    published_prop = client.post(
        "/api/v1/properties",
        json={
            "reference_code": "DHA-HOU-001",
            "title": "Executive 1 Kanal House in DHA Phase 2",
            "description": "Designer residence with double-height lobby.",
            "purpose": "sale",
            "property_type": "house",
            "price": "145000000",
            "area_value": "1",
            "area_unit": "kanal",
            "bedrooms": 5,
            "bathrooms": 6,
            "city": "Islamabad",
            "locality": "DHA Phase 2",
            "status": "available",
            "is_published": True,
            "assigned_agent_id": str(agent1.id),
        },
        headers=CSRF,
    )
    assert published_prop.status_code == 201
    prop_data = published_prop.json()
    prop_id = prop_data["id"]

    draft_prop = client.post(
        "/api/v1/properties",
        json={
            "reference_code": "BE-PLT-002",
            "title": "Private Draft Plot in Bahria Enclave",
            "purpose": "sale",
            "property_type": "plot",
            "price": "38000000",
            "area_value": "10",
            "area_unit": "marla",
            "city": "Islamabad",
            "locality": "Sector A, Bahria Enclave",
            "status": "draft",
            "is_published": False,
        },
        headers=CSRF,
    )
    assert draft_prop.status_code == 201

    public_list = client.get("/api/v1/public/properties?city=Islamabad&purpose=sale")
    assert public_list.status_code == 200
    public_items = public_list.json()["items"]
    assert len(public_items) == 1
    assert public_items[0]["reference_code"] == "DHA-HOU-001"
    prop_slug = public_items[0]["slug"]
    public_detail = client.get(f"/api/v1/public/properties/{prop_slug}")
    assert public_detail.status_code == 200
    assert public_detail.json()["reference_code"] == "DHA-HOU-001"

    client.cookies.clear()
    inquiry = client.post(
        "/api/v1/public/inquiries",
        json={
            "property_slug": prop_slug,
            "name": "Kamran Akmal",
            "phone": "0300-7788990",
            "email": "kamran.akmal@example.com",
            "message": "Can we inspect the property this weekend?",
            "consent": True,
        },
        headers=CSRF,
    )
    assert inquiry.status_code == 201
    assert inquiry.json()["status"] == "received"

    assert login(client, admin.email).status_code == 204
    leads_page = client.get("/api/v1/leads").json()
    assert leads_page["total"] == 1
    lead_id = leads_page["items"][0]["id"]
    assign_res = client.post(
        f"/api/v1/leads/{lead_id}/assign",
        json={"assigned_agent_id": str(agent1.id)},
        headers=CSRF,
    )
    assert assign_res.status_code == 200
    assert assign_res.json()["assigned_agent_id"] == str(agent1.id)

    assert login(client, agent2.email).status_code == 204
    assert client.get(f"/api/v1/leads/{lead_id}").status_code == 403

    assert login(client, agent1.email).status_code == 204
    lead_detail = client.get(f"/api/v1/leads/{lead_id}")
    assert lead_detail.status_code == 200

    note_res = client.post(
        f"/api/v1/leads/{lead_id}/activities",
        json={"activity_type": "call", "body": "Confirmed buyer budget and weekend availability."},
        headers=CSRF,
    )
    assert note_res.status_code == 201

    stage_res = client.patch(
        f"/api/v1/leads/{lead_id}",
        json={"stage": "qualified"},
        headers=CSRF,
    )
    assert stage_res.status_code == 200
    assert stage_res.json()["stage"] == "qualified"

    starts_1 = (datetime.now(timezone.utc) + timedelta(days=2)).replace(hour=14, minute=0, second=0, microsecond=0)
    starts_2 = (datetime.now(timezone.utc) + timedelta(days=2)).replace(hour=14, minute=30, second=0, microsecond=0)

    visit_1 = client.post(
        "/api/v1/visits",
        json={
            "property_id": prop_id,
            "lead_id": lead_id,
            "starts_at": starts_1.isoformat(),
            "duration_minutes": 60,
            "status": "confirmed",
            "meeting_point": "Gate 1, DHA Phase 2",
        },
        headers=CSRF,
    )
    assert visit_1.status_code == 201
    v1_data = visit_1.json()
    assert v1_data["has_conflict"] is False

    visit_2 = client.post(
        "/api/v1/visits",
        json={
            "property_id": prop_id,
            "lead_id": lead_id,
            "starts_at": starts_2.isoformat(),
            "duration_minutes": 60,
            "status": "requested",
        },
        headers=CSRF,
    )
    assert visit_2.status_code == 201
    v2_data = visit_2.json()
    assert v2_data["has_conflict"] is True
    assert v1_data["id"] in v2_data["conflicting_visit_ids"]

    complete_v1 = client.post(
        f"/api/v1/visits/{v1_data['id']}/complete",
        json={"status": "completed", "outcome": "Client ready to submit formal offer."},
        headers=CSRF,
    )
    assert complete_v1.status_code == 200
    assert complete_v1.json()["status"] == "completed"

    deal_res = client.post(
        "/api/v1/deals",
        json={
            "property_id": prop_id,
            "lead_id": lead_id,
            "stage": "offer",
            "offer_amount": "140000000",
            "notes": "Initial token offer submitted.",
        },
        headers=CSRF,
    )
    assert deal_res.status_code == 201
    deal_id = deal_res.json()["id"]

    win_res = client.post(
        f"/api/v1/deals/{deal_id}/stage",
        json={"stage": "closed_won", "agreed_amount": "142500000"},
        headers=CSRF,
    )
    assert win_res.status_code == 200
    assert win_res.json()["stage"] == "closed_won"

    dup_win = client.post(
        "/api/v1/deals",
        json={
            "property_id": prop_id,
            "lead_id": lead_id,
            "stage": "closed_won",
            "agreed_amount": "143000000",
        },
        headers=CSRF,
    )
    assert dup_win.status_code == 409

    assert login(client, admin.email).status_code == 204
    deals_summary = client.get("/api/v1/deals").json()
    assert deals_summary["total"] == 1
    assert deals_summary["closed_won_count"] == 1
    assert deals_summary["open_count"] == 0

    visits_summary = client.get("/api/v1/visits").json()
    assert visits_summary["total"] == 2
    assert visits_summary["completed_count"] == 1
    assert visits_summary["upcoming_count"] == 1
    assert visits_summary["conflict_count"] == 0
