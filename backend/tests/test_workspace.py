import pytest
from fastapi.testclient import TestClient

def helper_create_folder(client: TestClient, auth_headers):
    response = client.post(
        "/api/v1/workspace/folders",
        json={"name": "Test Folder"},
        headers=auth_headers
    )
    return response.json()["id"]

def test_create_folder(client: TestClient, auth_headers):
    response = client.post(
        "/api/v1/workspace/folders",
        json={"name": "Test Folder"},
        headers=auth_headers
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["name"] == "Test Folder"
    assert "id" in data

def test_get_folders(client: TestClient, auth_headers):
    # Ensure there is a folder
    helper_create_folder(client, auth_headers)
    
    response = client.get("/api/v1/workspace/folders", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(f["name"] == "Test Folder" for f in data)

def test_update_folder(client: TestClient, auth_headers):
    folder_id = helper_create_folder(client, auth_headers)
    
    response = client.put(
        f"/api/v1/workspace/folders/{folder_id}",
        json={"name": "Updated Folder"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Folder"

def test_delete_folder(client: TestClient, auth_headers):
    folder_id = helper_create_folder(client, auth_headers)
    
    response = client.delete(f"/api/v1/workspace/folders/{folder_id}", headers=auth_headers)
    assert response.status_code == 200

def helper_create_saved_search(client: TestClient, auth_headers):
    response = client.post(
        "/api/v1/workspace/searches",
        json={"name": "Malicious URLs", "query_string": "status:completed risk:high"},
        headers=auth_headers
    )
    return response.json()["id"]

def test_create_saved_search(client: TestClient, auth_headers):
    response = client.post(
        "/api/v1/workspace/searches",
        json={"name": "Malicious URLs", "query_string": "status:completed risk:high"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Malicious URLs"
    assert "id" in data

def test_get_saved_searches(client: TestClient, auth_headers):
    helper_create_saved_search(client, auth_headers)
    response = client.get("/api/v1/workspace/searches", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_update_saved_search(client: TestClient, auth_headers):
    search_id = helper_create_saved_search(client, auth_headers)
    response = client.put(
        f"/api/v1/workspace/searches/{search_id}",
        json={"name": "Updated Search"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Search"

def test_delete_saved_search(client: TestClient, auth_headers):
    search_id = helper_create_saved_search(client, auth_headers)
    response = client.delete(f"/api/v1/workspace/searches/{search_id}", headers=auth_headers)
    assert response.status_code == 200
