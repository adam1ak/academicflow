import models
from security import get_password_hash

TEST_EMAIL = "new_user@flow.edu"
TEST_PASSWORD = "StrongPassword123!"

def test_register_new_account(client):
    response = client.post("/api/v1/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })

    assert response.status_code == 201
    assert response.json()["email"] == TEST_EMAIL


def test_login_success_and_get_token(client, db_session):
    hashed_password = get_password_hash(TEST_PASSWORD)
    user = models.User(email=TEST_EMAIL, hashed_password=hashed_password, is_active=True)
    db_session.add(user)
    db_session.commit()

    response = client.post("/api/v1/token", data={
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    })

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_access_protected_endpoint_with_token(client, db_session):
    hashed_password = get_password_hash(TEST_PASSWORD)
    user = models.User(email=TEST_EMAIL, hashed_password=hashed_password, is_active=True)
    db_session.add(user)
    db_session.commit()

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


def test_login_wrong_password(client, db_session):
    hashed_password = get_password_hash(TEST_PASSWORD)
    user = models.User(email=TEST_EMAIL, hashed_password=hashed_password, is_active=True)
    db_session.add(user)
    db_session.commit()

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

def test_refresh_token_flow(client, db_session):
    client.post("/api/v1/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    login_response = client.post("/api/v1/token", data={"username": TEST_EMAIL, "password": TEST_PASSWORD})
    refresh_token = login_response.json()["refresh_token"]

    response = client.post("/api/v1/refresh", json={"refresh_token": refresh_token})

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_logout_and_revoke_token_flow(client, db_session):
    client.post("/api/v1/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    login_response = client.post("/api/v1/token", data={"username": TEST_EMAIL, "password": TEST_PASSWORD})
    refresh_token = login_response.json()["refresh_token"]

    logout_response = client.post("/api/v1/logout", json={"refresh_token": refresh_token})
    assert logout_response.status_code == 200
    assert logout_response.json()["message"] == "Successfully logged out"

    retry_response = client.post("/api/v1/refresh", json={"refresh_token": refresh_token})
    assert retry_response.status_code == 401
    assert "invalid, revoked, or expired" in retry_response.json()["detail"].lower()