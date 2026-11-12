import pytest

from app.core.config import settings
from tests.conftest import CSRF, login, make_member, make_user

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32


@pytest.fixture(autouse=True)
def media_root(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "media_root", str(tmp_path))


def create(client, **overrides):
    payload = {"reference_code": "AF-1", "title": "Modern villa", "purpose": "sale", "property_type": "villa",
               "price": "185000000", "city": "Islamabad", "locality": "F-7", "bedrooms": 5,
               "status": "available", "is_published": True, **overrides}
    response = client.post("/api/v1/properties", json=payload, headers=CSRF)
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def listings(client, db):
    admin = make_user(db, "admin@example.com", role="admin")
    agent = make_member(db, admin, "agent@example.com")
    login(client, "admin@example.com")
    published = create(client, assigned_agent_id=str(agent.id))
    client.post(f"/api/v1/properties/{published['id']}/media", headers=CSRF, files=[("files", ("a.png", PNG, "image/png"))])
    rental = create(client, reference_code="AF-2", title="City apartment", purpose="rent", property_type="apartment",
                    price="280000", city="Lahore", bedrooms=2)
    draft = create(client, reference_code="AF-3", title="Hidden draft", status="draft", is_published=False)
    deleted = create(client, reference_code="AF-4", title="Removed villa")
    client.delete(f"/api/v1/properties/{deleted['id']}", headers=CSRF)
    client.cookies.clear()
    return {"published": published, "rental": rental, "draft": draft, "deleted": deleted}


def test_lists_only_published_properties_without_authentication(client, listings):
    body = client.get("/api/v1/public/properties").json()
    assert body["total"] == 2
    assert {item["slug"] for item in body["items"]} == {listings["published"]["slug"], listings["rental"]["slug"]}


def test_public_payload_hides_internal_fields(client, listings):
    item = client.get(f"/api/v1/public/properties/{listings['published']['slug']}").json()
    for internal in ("id", "agency_id", "assigned_agent_id", "address", "is_published", "deleted_at", "created_at"):
        assert internal not in item
    assert item["agent"] == {"full_name": "Member", "phone": None}
    assert item["media"][0]["url"].startswith("/api/v1/media/properties/") and "id" not in item["media"][0]


def test_unpublished_and_deleted_slugs_return_404(client, listings):
    for key in ("draft", "deleted"):
        assert client.get(f"/api/v1/public/properties/{listings[key]['slug']}").status_code == 404


def test_public_filters_and_sort(client, listings):
    def slugs(**params):
        return [item["slug"] for item in client.get("/api/v1/public/properties", params=params).json()["items"]]

    assert slugs(purpose="rent") == [listings["rental"]["slug"]]
    assert slugs(city="islamabad", property_type="villa") == [listings["published"]["slug"]]
    assert slugs(min_bedrooms=3) == [listings["published"]["slug"]]
    assert slugs(max_price="300000") == [listings["rental"]["slug"]]
    assert slugs(q="apartment") == [listings["rental"]["slug"]]
    assert slugs(sort="price_asc") == [listings["rental"]["slug"], listings["published"]["slug"]]
    assert client.get("/api/v1/public/properties", params={"sort": "oldest"}).status_code == 422
    assert client.get("/api/v1/public/properties", params={"page_size": 51}).status_code == 422
