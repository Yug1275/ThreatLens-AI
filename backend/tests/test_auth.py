import pytest
from fastapi.testclient import TestClient

def test_register_user(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data

def test_register_existing_email(client: TestClient):
    # Already registered in previous test or fixture
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "exist@example.com",
            "username": "exist_user",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
    )
    
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "exist@example.com",
            "username": "exist_user_2",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
    )
    assert response.status_code == 400
    assert "email already exists" in response.json()["detail"].lower()

def test_login_success(client: TestClient):
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginuser@example.com",
            "username": "loginuser",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
    )
    
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "loginuser@example.com",
            "password": "Password123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "loginuser@example.com",
            "password": "WrongPassword!"
        }
    )
    assert response.status_code == 401

def test_get_me(client: TestClient, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@threatlens.ai"

def test_update_profile(client: TestClient, auth_headers):
    response = client.put(
        "/api/v1/auth/profile",
        json={"first_name": "Updated", "last_name": "Name"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Updated"
    assert data["last_name"] == "Name"

def test_forgot_password(client: TestClient):
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "test@threatlens.ai"}
    )
    assert response.status_code == 200
    assert "email" in response.json()["message"].lower()

