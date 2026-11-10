import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Connection, create_engine
from sqlalchemy.orm import Session

import app.models  # noqa: F401
from app.core.db import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models import Agency, User

CSRF = {"X-Requested-With": "aqarflow"}
PASSWORD = "correct-horse-battery"


@pytest.fixture(scope="session")
def connection() -> Iterator[Connection]:
    url = os.environ.get("TEST_DATABASE_URL")
    if not url:
        pytest.fail("TEST_DATABASE_URL is not set: database tests need a dedicated PostgreSQL database.")
    engine = create_engine(url)
    with engine.connect() as conn:
        Base.metadata.drop_all(conn)
        Base.metadata.create_all(conn)
        conn.commit()
        yield conn
    engine.dispose()


@pytest.fixture
def db(connection: Connection) -> Iterator[Session]:
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False)
    yield session
    session.close()
    transaction.rollback()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def make_user(db: Session, email: str, role: str = "agent", is_active: bool = True) -> User:
    agency = Agency(name=f"Agency {email}", slug=f"agency-{email.replace('@', '-').replace('.', '-')}")
    db.add(agency)
    db.flush()
    user = User(agency_id=agency.id, full_name="Test User", email=email,
                password_hash=hash_password(PASSWORD), role=role, is_active=is_active)
    db.add(user)
    db.flush()
    return user


def login(client: TestClient, email: str, password: str = PASSWORD):
    return client.post("/api/v1/auth/login", json={"email": email, "password": password}, headers=CSRF)
