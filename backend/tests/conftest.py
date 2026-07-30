import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User, Profile
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

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

@pytest.fixture(scope="session")
def auth_token():
    """Creates a test user and returns a valid JWT token."""
    db = TestingSessionLocal()
    # Check if user already exists
    user = db.query(User).filter(User.email == "test@threatlens.ai").first()
    if not user:
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

@pytest.fixture(scope="session")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}
