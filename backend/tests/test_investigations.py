"""
Phase 5A — Integration tests for Investigation CRUD + Dashboard API.

Uses an in-memory SQLite database for speed; no Supabase credentials needed.
Run with:  python -m pytest tests/test_investigations.py -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User, Profile
from app.models.investigation import Investigation
from app.core.security import get_password_hash, create_access_token

# ── SQLite in-memory test database ───────────────────────────────────── #

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_threatlens.db"

engine_test = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# ── Fixtures ─────────────────────────────────────────────────────────── #

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def auth_token():
    """Creates a test user and returns a valid JWT token."""
    db = TestingSessionLocal()
    user = User(
        email="test@threatlens.ai",
        username="testuser",
        hashed_password=get_password_hash("Test@1234"),
        is_active=True,
    )
    db.add(user)
    db.flush()
    profile = Profile(user_id=user.id, first_name="Test", last_name="User")
    db.add(profile)
    db.commit()
    db.refresh(user)
    token = create_access_token(subject=user.id)
    db.close()
    return token


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ── Tests ─────────────────────────────────────────────────────────────── #

class TestInvestigationCRUD:

    def test_submit_url_investigation(self, client, auth_headers):
        """POST /url should save a record and return InvestigationResponse."""
        resp = client.post(
            "/api/v1/investigation/url",
            json={"url": "https://example.com"},
            headers=auth_headers,
        )
        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert data["type"] == "URL"
        assert data["target"] == "https://example.com"
        assert data["status"] == "COMPLETED"
        assert "id" in data
        assert "result_data" in data

    def test_list_investigations(self, client, auth_headers):
        """GET / should return a paginated list including the submitted investigation."""
        resp = client.get("/api/v1/investigation/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1
        assert data["page"] == 1

    def test_list_with_type_filter(self, client, auth_headers):
        """GET /?type=URL should return only URL investigations."""
        resp = client.get("/api/v1/investigation/?type=URL", headers=auth_headers)
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert all(item["type"] == "URL" for item in items)

    def test_list_with_status_filter(self, client, auth_headers):
        """GET /?status=COMPLETED should return only completed investigations."""
        resp = client.get("/api/v1/investigation/?status=COMPLETED", headers=auth_headers)
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert all(item["status"] == "COMPLETED" for item in items)

    def test_get_single_investigation(self, client, auth_headers):
        """GET /{id} should return the exact record."""
        # First submit one
        post_resp = client.post(
            "/api/v1/investigation/url",
            json={"url": "https://google.com"},
            headers=auth_headers,
        )
        assert post_resp.status_code == 201
        inv_id = post_resp.json()["id"]

        get_resp = client.get(f"/api/v1/investigation/{inv_id}", headers=auth_headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == inv_id

    def test_get_nonexistent_investigation_returns_404(self, client, auth_headers):
        """GET /{fake-id} should return 404."""
        resp = client.get("/api/v1/investigation/nonexistent-id-xyz", headers=auth_headers)
        assert resp.status_code == 404

    def test_delete_investigation(self, client, auth_headers):
        """DELETE /{id} should soft-delete; subsequent GET should return 404."""
        post_resp = client.post(
            "/api/v1/investigation/url",
            json={"url": "https://delete-me.com"},
            headers=auth_headers,
        )
        assert post_resp.status_code == 201
        inv_id = post_resp.json()["id"]

        del_resp = client.delete(f"/api/v1/investigation/{inv_id}", headers=auth_headers)
        assert del_resp.status_code == 204

        get_resp = client.get(f"/api/v1/investigation/{inv_id}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_delete_nonexistent_returns_404(self, client, auth_headers):
        resp = client.delete("/api/v1/investigation/does-not-exist", headers=auth_headers)
        assert resp.status_code == 404

    def test_pagination(self, client, auth_headers):
        """Pagination params should be respected."""
        resp = client.get("/api/v1/investigation/?page=1&limit=1", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) <= 1
        assert data["limit"] == 1


class TestDashboardEndpoints:

    def test_stats_returns_correct_shape(self, client, auth_headers):
        resp = client.get("/api/v1/dashboard/stats", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "malicious" in data
        assert "safe" in data
        assert "pending" in data
        assert data["total"] >= 0

    def test_activity_returns_7_days(self, client, auth_headers):
        resp = client.get("/api/v1/dashboard/activity", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 7
        assert all("name" in d and "malicious" in d and "safe" in d for d in data)

    def test_recent_returns_list(self, client, auth_headers):
        resp = client.get("/api/v1/dashboard/recent", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)


class TestAuthRequired:

    def test_investigation_requires_auth(self, client):
        resp = client.get("/api/v1/investigation/")
        assert resp.status_code in (401, 403)

    def test_dashboard_requires_auth(self, client):
        resp = client.get("/api/v1/dashboard/stats")
        assert resp.status_code in (401, 403)

    def test_invalid_url_rejected(self, client, auth_headers):
        resp = client.post(
            "/api/v1/investigation/url",
            json={"url": "not-a-url"},
            headers=auth_headers,
        )
        assert resp.status_code == 400
