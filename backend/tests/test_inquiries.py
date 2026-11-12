import pytest
from sqlalchemy import select

from app.core.config import settings
from app.models import Contact, Lead
from app.services.phone import normalize_phone
from tests.conftest import CSRF, login, make_user

URL = "/api/v1/public/inquiries"


def inquiry(**overrides) -> dict:
    return {"name": "Ali Khan", "phone": "0300 1234567", "email": "Ali@Example.com",
            "message": "I would like to visit this property.", "consent": True, **overrides}


def create_property(client, **overrides) -> dict:
    payload = {"reference_code": "AF-1", "title": "Modern villa", "purpose": "sale", "property_type": "villa",
               "price": "185000000", "city": "Islamabad", "status": "available", "is_published": True, **overrides}
    return client.post("/api/v1/properties", json=payload, headers=CSRF).json()


@pytest.fixture
def listing(client, db) -> dict:
    make_user(db, "admin@example.com", role="admin")
    login(client, "admin@example.com")
    prop = create_property(client)
    client.cookies.clear()
    return prop


def test_inquiry_creates_lead_linked_to_property_and_agency(client, db, listing):
    response = client.post(URL, json=inquiry(property_slug=listing["slug"]), headers=CSRF)
    assert response.status_code == 201 and response.json() == {"status": "received"}
    lead = db.scalar(select(Lead))
    assert str(lead.property_id) == listing["id"]
    assert lead.stage == "new" and lead.source == "website" and lead.assigned_agent_id is None
    assert lead.message == "I would like to visit this property."
    contact = db.get(Contact, lead.contact_id)
    assert contact.agency_id == lead.agency_id
    assert contact.phone_normalized == "+923001234567" and contact.email == "ali@example.com"


def test_same_phone_reuses_contact_without_overwriting_it(client, db, listing):
    client.post(URL, json=inquiry(property_slug=listing["slug"]), headers=CSRF)
    client.post(URL, json=inquiry(property_slug=listing["slug"], name="Someone Else", phone="+92 300 123 4567"), headers=CSRF)
    contacts = db.scalars(select(Contact)).all()
    assert len(contacts) == 1 and contacts[0].name == "Ali Khan"
    assert len(db.scalars(select(Lead)).all()) == 2


def test_unpublished_or_unknown_property_is_rejected(client, db):
    make_user(db, "admin@example.com", role="admin")
    login(client, "admin@example.com")
    draft = create_property(client, status="draft", is_published=False)
    client.cookies.clear()
    for slug in (draft["slug"], "does-not-exist"):
        assert client.post(URL, json=inquiry(property_slug=slug), headers=CSRF).status_code == 404
    assert db.scalar(select(Lead)) is None


def test_validation_rejects_bad_input(client, listing):
    bad = [{"consent": False}, {"phone": "12"}, {"email": "not-an-email"}, {"message": "short"},
           {"name": "A"}, {"agency_id": "00000000-0000-0000-0000-000000000000"}]
    for override in bad:
        response = client.post(URL, json=inquiry(property_slug=listing["slug"], **override), headers=CSRF)
        assert response.status_code == 422, override


def test_honeypot_pretends_success_but_saves_nothing(client, db, listing):
    response = client.post(URL, json=inquiry(property_slug=listing["slug"], website="http://spam.example"), headers=CSRF)
    assert response.status_code == 201
    assert db.scalar(select(Lead)) is None and db.scalar(select(Contact)) is None


def test_requires_csrf_header(client, listing):
    assert client.post(URL, json=inquiry(property_slug=listing["slug"])).status_code == 403


def test_general_inquiry_goes_to_the_single_agency(client, db):
    admin = make_user(db, "admin@example.com", role="admin")
    assert client.post(URL, json=inquiry(), headers=CSRF).status_code == 201
    lead = db.scalar(select(Lead))
    assert lead.agency_id == admin.agency_id and lead.property_id is None


def test_general_inquiry_needs_configuration_when_several_agencies(client, db, monkeypatch):
    make_user(db, "first@example.com", role="admin")
    second = make_user(db, "second@example.com", role="admin")
    assert client.post(URL, json=inquiry(), headers=CSRF).status_code == 503
    agency_slug = "agency-second-example-com"
    monkeypatch.setattr(settings, "public_agency_slug", agency_slug)
    assert client.post(URL, json=inquiry(), headers=CSRF).status_code == 201
    assert db.scalar(select(Lead)).agency_id == second.agency_id


@pytest.mark.parametrize("raw, expected", [
    ("0300 1234567", "+923001234567"), ("+92 300 1234567", "+923001234567"), ("00923001234567", "+923001234567"),
    ("923001234567", "+923001234567"), ("+44 20 7946 0958", "+442079460958"), ("12", None), ("abc", None),
])
def test_normalize_phone(raw, expected):
    assert normalize_phone(raw) == expected
