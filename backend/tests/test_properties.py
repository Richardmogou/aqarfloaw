from pathlib import Path

import pytest

from app.core.config import settings
from app.models import Property, PropertyMedia, User
from app.services.media import MAX_IMAGE_BYTES
from app.services.storage import StoredObjectMissing, get_storage
from tests.conftest import CSRF, login, make_member, make_user

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 32


@pytest.fixture(autouse=True)
def media_root(tmp_path, monkeypatch) -> Path:
    monkeypatch.setattr(settings, "media_root", str(tmp_path))
    return tmp_path


def property_payload(**overrides) -> dict:
    return {"reference_code": "AF-0001", "title": "Modern villa with pool", "purpose": "sale",
            "property_type": "villa", "price": "185000000", "city": "Islamabad", "locality": "F-7",
            "area_value": "506", "bedrooms": 5, "bathrooms": 5, **overrides}


def create_property(client, **overrides):
    return client.post("/api/v1/properties", json=property_payload(**overrides), headers=CSRF)


@pytest.fixture
def admin(client, db) -> User:
    user = make_user(db, "admin@example.com", role="admin")
    login(client, "admin@example.com")
    return user


def test_admin_creates_property_with_server_side_agency_and_currency(client, db, admin):
    response = create_property(client, agency_id="00000000-0000-0000-0000-000000000000", currency="USD")
    assert response.status_code == 422

    response = create_property(client)
    assert response.status_code == 201
    body = response.json()
    assert body["currency"] == "PKR" and body["status"] == "draft" and body["is_published"] is False
    assert body["slug"].startswith("modern-villa-with-pool-")
    assert db.get(Property, body["id"]).agency_id == admin.agency_id


def test_property_endpoints_require_authentication(client):
    assert client.get("/api/v1/properties").status_code == 401
    assert client.post("/api/v1/properties", json=property_payload(), headers=CSRF).status_code == 401


def test_mutation_without_csrf_header_is_forbidden(client, admin):
    assert client.post("/api/v1/properties", json=property_payload()).status_code == 403


def test_agent_can_read_but_not_write(client, db, admin):
    property_id = create_property(client).json()["id"]
    make_member(db, admin, "agent@example.com")
    login(client, "agent@example.com")
    assert client.get("/api/v1/properties").json()["total"] == 1
    assert client.get(f"/api/v1/properties/{property_id}").status_code == 200
    assert create_property(client, reference_code="AF-0002").status_code == 403
    assert client.patch(f"/api/v1/properties/{property_id}", json={"price": "1"}, headers=CSRF).status_code == 403
    assert client.delete(f"/api/v1/properties/{property_id}", headers=CSRF).status_code == 403


def test_other_agency_property_is_invisible(client, db, admin):
    property_id = create_property(client).json()["id"]
    make_user(db, "rival@example.com", role="admin")
    login(client, "rival@example.com")
    assert client.get(f"/api/v1/properties/{property_id}").status_code == 404
    assert client.patch(f"/api/v1/properties/{property_id}", json={"price": "1"}, headers=CSRF).status_code == 404
    assert client.get("/api/v1/properties").json()["total"] == 0


def test_duplicate_reference_code_in_same_agency_conflicts(client, db, admin):
    assert create_property(client).status_code == 201
    assert create_property(client).status_code == 409
    make_user(db, "rival@example.com", role="admin")
    login(client, "rival@example.com")
    assert create_property(client).status_code == 201


def test_assigned_agent_must_be_active_member_of_agency(client, db, admin):
    agent = make_member(db, admin, "agent@example.com")
    inactive = make_member(db, admin, "gone@example.com", is_active=False)
    outsider = make_user(db, "outsider@example.com")
    assert create_property(client, assigned_agent_id=str(outsider.id)).status_code == 422
    assert create_property(client, assigned_agent_id=str(inactive.id)).status_code == 422
    response = create_property(client, assigned_agent_id=str(agent.id))
    assert response.status_code == 201 and response.json()["assigned_agent_id"] == str(agent.id)


def test_publish_and_unpublish(client, admin):
    property_id = create_property(client).json()["id"]
    url = f"/api/v1/properties/{property_id}"
    assert client.patch(url, json={"is_published": True}, headers=CSRF).status_code == 422

    published = client.patch(url, json={"status": "available", "is_published": True}, headers=CSRF).json()
    assert published["is_published"] is True and published["published_at"] is not None
    assert client.patch(url, json={"status": "inactive"}, headers=CSRF).status_code == 422

    unpublished = client.patch(url, json={"is_published": False}, headers=CSRF).json()
    assert unpublished["is_published"] is False and unpublished["published_at"] is None


def test_update_rejects_null_for_required_fields(client, admin):
    property_id = create_property(client).json()["id"]
    url = f"/api/v1/properties/{property_id}"
    assert client.patch(url, json={"title": None}, headers=CSRF).status_code == 422
    response = client.patch(url, json={"locality": None, "price": "190000000.50"}, headers=CSRF)
    assert response.status_code == 200
    assert response.json()["locality"] is None and response.json()["price"] == "190000000.50"


def test_list_filters_search_sort_and_pagination(client, admin):
    create_property(client, reference_code="AF-1", title="Sea view penthouse", city="Karachi",
                    property_type="apartment", price="270000000")
    create_property(client, reference_code="AF-2", title="Family house", city="Lahore",
                    purpose="rent", property_type="house", price="450000")
    create_property(client, reference_code="AF-3", title="City apartment", city="Lahore",
                    purpose="rent", property_type="apartment", price="280000", status="available")

    def listing(**params):
        return client.get("/api/v1/properties", params=params).json()

    assert listing(city="lahore")["total"] == 2
    assert listing(purpose="rent", property_type="apartment")["total"] == 1
    assert listing(status="available")["items"][0]["reference_code"] == "AF-3"
    assert listing(q="penthouse")["items"][0]["reference_code"] == "AF-1"
    assert listing(q="100%")["total"] == 0
    assert listing(min_price="300000", max_price="500000")["total"] == 1
    assert [item["reference_code"] for item in listing(sort="price_asc")["items"]] == ["AF-3", "AF-2", "AF-1"]
    page = listing(sort="price_asc", page=2, page_size=2)
    assert page["total"] == 3 and [item["reference_code"] for item in page["items"]] == ["AF-1"]
    assert client.get("/api/v1/properties", params={"page_size": 101}).status_code == 422


def test_soft_deleted_property_disappears(client, db, admin):
    property_id = create_property(client, status="available", is_published=True).json()["id"]
    assert client.delete(f"/api/v1/properties/{property_id}", headers=CSRF).status_code == 204
    assert client.get(f"/api/v1/properties/{property_id}").status_code == 404
    assert client.get("/api/v1/properties").json()["total"] == 0
    deleted = db.get(Property, property_id)
    assert deleted.deleted_at is not None and deleted.is_published is False


def test_upload_images_sets_first_as_cover(client, admin):
    property_id = create_property(client).json()["id"]
    response = client.post(f"/api/v1/properties/{property_id}/media", headers=CSRF,
                           files=[("files", ("a.png", PNG, "image/png")), ("files", ("b.jpg", JPEG, "image/jpeg"))])
    assert response.status_code == 201
    images = response.json()
    assert [image["is_cover"] for image in images] == [True, False]
    assert images[0]["url"].startswith(f"/api/v1/media/properties/{property_id}/") and images[0]["url"].endswith(".png")
    assert client.get(images[0]["url"]).content == PNG

    detail = client.get(f"/api/v1/properties/{property_id}").json()
    assert [image["id"] for image in detail["media"]] == [image["id"] for image in images]


def test_upload_rejects_spoofed_and_oversized_files(client, db, admin):
    property_id = create_property(client).json()["id"]
    url = f"/api/v1/properties/{property_id}/media"
    spoofed = client.post(url, headers=CSRF, files=[("files", ("evil.png", b"<script>alert(1)</script>", "image/png"))])
    assert spoofed.status_code == 422
    oversized = client.post(url, headers=CSRF, files=[("files", ("big.png", PNG + b"\x00" * MAX_IMAGE_BYTES, "image/png"))])
    assert oversized.status_code == 413
    mixed = client.post(url, headers=CSRF, files=[("files", ("ok.png", PNG, "image/png")),
                                                  ("files", ("bad.gif", b"GIF89a", "image/gif"))])
    assert mixed.status_code == 422
    assert client.get(f"/api/v1/properties/{property_id}").json()["media"] == []
    assert db.query(PropertyMedia).count() == 0


def test_change_cover_and_delete_image(client, admin):
    property_id = create_property(client).json()["id"]
    first, second = client.post(f"/api/v1/properties/{property_id}/media", headers=CSRF,
                                files=[("files", ("a.png", PNG, "image/png")), ("files", ("b.png", PNG, "image/png"))]).json()
    media_url = f"/api/v1/properties/{property_id}/media"

    response = client.patch(f"{media_url}/{second['id']}", json={"is_cover": True, "caption": "Garden"}, headers=CSRF)
    assert response.status_code == 200 and response.json()["caption"] == "Garden"
    covers = {image["id"]: image["is_cover"] for image in client.get(f"/api/v1/properties/{property_id}").json()["media"]}
    assert covers == {first["id"]: False, second["id"]: True}

    assert client.delete(f"{media_url}/{second['id']}", headers=CSRF).status_code == 204
    remaining = client.get(f"/api/v1/properties/{property_id}").json()["media"]
    assert [(image["id"], image["is_cover"]) for image in remaining] == [(first["id"], True)]
    with pytest.raises(StoredObjectMissing):
        get_storage().get(second["url"].removeprefix("/api/v1/media/"))


def test_media_of_other_agency_property_is_not_reachable(client, db, admin):
    property_id = create_property(client).json()["id"]
    image = client.post(f"/api/v1/properties/{property_id}/media", headers=CSRF,
                        files=[("files", ("a.png", PNG, "image/png"))]).json()[0]
    make_user(db, "rival@example.com", role="admin")
    login(client, "rival@example.com")
    media_url = f"/api/v1/properties/{property_id}/media"
    assert client.post(media_url, headers=CSRF, files=[("files", ("a.png", PNG, "image/png"))]).status_code == 404
    assert client.delete(f"{media_url}/{image['id']}", headers=CSRF).status_code == 404
