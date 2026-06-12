import pytest
import models

TEST_EMAIL = "new_user@flow.edu"
TEST_PASSWORD = "StrongPassword123!"

def test_register_new_account(client):
    response = client.post("/api/v1/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })

    assert response.status_code == 201
    assert response.json()["email"] == TEST_EMAIL


def test_login_success_and_get_token(client):
    response = client.post("/api/v1/token", data={
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    })

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_access_protected_endpoint_with_token(client):
    login_resp = client.post("/api/v1/token", data={
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["user"] == TEST_EMAIL


def test_login_wrong_password(client):
    response = client.post("/api/v1/token", data={
        "username": TEST_EMAIL,
        "password": "WrongPassword999!"
    })

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_register_weak_password_validation(client):
    payload = {
        "email": "password_test@flow.edu",
        "password": "onlyletters"
    }
    response = client.post("/api/v1/register", json=payload)

    assert response.status_code == 422
    assert "one digit" in response.json()["detail"][0]["msg"]
