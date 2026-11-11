import os
import uuid

import pytest

from app.core.config import settings
from app.services import storage
from tests.conftest import CSRF, login, make_user

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32


@pytest.fixture(autouse=True)
def media_root(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "media_root", str(tmp_path))
    return tmp_path


def create_with_photo(client, **overrides) -> tuple[dict, str]:
    payload = {"reference_code": f"AF-{uuid.uuid4().hex[:6]}", "title": "Modern villa", "purpose": "sale",
               "property_type": "villa", "price": "185000000", "city": "Islamabad", **overrides}
    prop = client.post("/api/v1/properties", json=payload, headers=CSRF).json()
    image = client.post(f"/api/v1/properties/{prop['id']}/media", headers=CSRF,
                        files=[("files", ("a.png", PNG, "image/png"))]).json()[0]
    return prop, image["url"]


def test_published_photo_is_public_with_safe_headers(client, db):
    make_user(db, "admin@example.com", role="admin")
    login(client, "admin@example.com")
    _, url = create_with_photo(client, status="available", is_published=True)
    client.cookies.clear()
    response = client.get(url)
    assert response.status_code == 200 and response.content == PNG
    assert response.headers["content-type"] == "image/png"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["cache-control"].startswith("public")


def test_draft_photo_is_visible_to_own_agency_only(client, db):
    make_user(db, "admin@example.com", role="admin")
    login(client, "admin@example.com")
    _, url = create_with_photo(client)
    response = client.get(url)
    assert response.status_code == 200 and response.headers["cache-control"].startswith("private")

    client.cookies.clear()
    assert client.get(url).status_code == 404
    make_user(db, "rival@example.com", role="admin")
    login(client, "rival@example.com")
    assert client.get(url).status_code == 404


def test_deleted_property_photo_is_hidden_from_public(client, db):
    make_user(db, "admin@example.com", role="admin")
    login(client, "admin@example.com")
    prop, url = create_with_photo(client, status="available", is_published=True)
    client.delete(f"/api/v1/properties/{prop['id']}", headers=CSRF)
    client.cookies.clear()
    assert client.get(url).status_code == 404


def test_unknown_or_traversal_keys_return_404(client):
    assert client.get("/api/v1/media/properties/unknown.png").status_code == 404
    assert client.get("/api/v1/media/..%2F..%2F.env").status_code == 404


@pytest.mark.skipif(not os.environ.get("TEST_S3_ENDPOINT_URL"), reason="TEST_S3_ENDPOINT_URL is not set: no S3/MinIO server to test against")
def test_s3_storage_round_trip(monkeypatch):
    monkeypatch.setattr(settings, "s3_endpoint_url", os.environ["TEST_S3_ENDPOINT_URL"])
    monkeypatch.setattr(settings, "s3_access_key", os.environ["TEST_S3_ACCESS_KEY"])
    monkeypatch.setattr(settings, "s3_secret_key", os.environ["TEST_S3_SECRET_KEY"])
    monkeypatch.setattr(settings, "s3_bucket", os.environ.get("TEST_S3_BUCKET", settings.s3_bucket))
    s3 = storage.S3Storage()
    key = f"tests/{uuid.uuid4().hex}.png"
    s3.put(key, PNG, "image/png")
    try:
        assert s3.get(key) == PNG
        assert s3.client.head_object(Bucket=s3.bucket, Key=key)["ContentType"] == "image/png"
    finally:
        s3.delete(key)
    with pytest.raises(storage.StoredObjectMissing):
        s3.get(key)
