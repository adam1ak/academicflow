import pytest
from fastapi.testclient import TestClient
from api import app, get_current_user, get_db
import models


def override_get_current_user():
    return models.User(id=1, email="test@pytest.com", is_active=True)

@pytest.fixture(autouse=True)
def mock_auth(db_session):
    user = models.User(id=1, email="test@pytest.com", is_active=True)
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()

def test_health_check(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "AcademicFlow API is running"
    }


def test_generate_plan(client):
    payload = {
        "max_concurrent" : 2,
        "subjects": [
            {
                "name": "Calculus1",
                "field": "Math",
                "duration": 5,
                "dependents": ["Calculus2"]
            },
            {
                "name": "Calculus2",
                "field": "Math",
                "duration": 2,
                "dependents": []
            }
        ]
    }

    response = client.post("/api/v1/generate-plan", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert len(data) == 2
    assert data[0]["name"] == "Calculus1"
    assert data[0]["start_time"] == 0
    assert data[0]["end_time"] == 5

    assert data[1]["name"] == "Calculus2"
    assert data[1]["start_time"] == 5
    assert data[1]["end_time"] == 7

def test_generate_plan_with_cycle_error(client):
    payload = {
        "max_concurrent": 2,
        "subjects": [
            {
                "name": "Math 1",
                "field": "Math",
                "duration": 4,
                "dependents": ["Math 2"]
            },
            {
                "name": "Math 2",
                "field": "Math",
                "duration": 4,
                "dependents": ["Math 1"]
            }
        ]
    }

    response = client.post("api/v1/generate-plan", json=payload)
    assert response.status_code == 400
    assert "Cycle detected" in response.json()["detail"]

def test_generate_plan_strict_sequential(client):
    payload = {
        "max_concurrent": 1,
        "subjects": [
            {
                "name": "Programming 1",
                "field": "IT",
                "duration": 3,
                "dependents": []
            },
            {
                "name": "Physics 1",
                "field": "Science",
                "duration": 4,
                "dependents": []
            }
        ]
    }

    response = client.post("/api/v1/generate-plan", json=payload)
    assert response.status_code == 201
    data = response.json()

    first_subject = data[0]
    second_subject = data[1]
    assert second_subject["start_time"] == first_subject["end_time"]

def test_generate_plan_empty_payload(client):
    payload = {
        "max_concurrent": 2,
        "subjects": []
    }

    response = client.post("/api/v1/generate-plan", json=payload)
    assert response.status_code == 201
    assert response.json() == []

def test_generate_plan_invalid_duration_validation(client):
    payload = {
        "max_concurrent": 2,
        "subjects": [
            {
                "name": "Błędny Przedmiot",
                "field": "IT",
                "duration": -5,
                "dependents": []
            }
        ]
    }

    response = client.post("/api/v1/generate-plan", json=payload)
    assert response.status_code == 422

def test_generate_plan_duplicate_subject_names_validation(client):
    payload = {
        "max_concurrent": 2,
        "subjects": [
            {"name": "Math 1", "field": "Math", "duration": 3, "dependents": []},
            {"name": "Math 1", "field": "Math", "duration": 5, "dependents": []}
        ]
    }

    response = client.post("/api/v1/generate-plan", json=payload)
    assert response.status_code == 400
    assert "unique" in response.json()["detail"]

def test_get_plan_idor_protection(client, db_session):
    user_a = models.User(email="user_a@academic.com", is_active=True)
    user_b = models.User(email="user_b@academic.com", is_active=True)
    db_session.add_all([user_a, user_b])
    db_session.commit()
    db_session.refresh(user_a)
    db_session.refresh(user_b)

    plan_a = models.Plan(name="User A Private Plan", max_concurrent=3, owner_id=int(user_a.id))
    db_session.add(plan_a)
    db_session.commit()
    db_session.refresh(plan_a)

    app.dependency_overrides[get_current_user] = lambda: user_b

    response_get = client.get(f"/api/v1/plans/{plan_a.id}")
    assert response_get.status_code == 404

    subject_payload = {
        "name": "Calculus2",
        "field": "Math",
        "duration": 4,
        "dependents": []
    }
    response_post = client.post(f"/api/v1/plans/{plan_a.id}/subjects", json=subject_payload)
    assert response_post.status_code == 404

    response_delete = client.delete(f"/api/v1/plans/{plan_a.id}")
    assert response_delete.status_code == 404


def test_update_plan_details(client, db_session):
    plan = models.Plan(name="Old Name", max_concurrent=2, owner_id=1)
    db_session.add(plan)
    db_session.commit()
    db_session.refresh(plan)

    payload = {"name": "New Name", "max_concurrent": 3}

    response = client.patch(f"/api/v1/plans/{plan.id}", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["max_concurrent"] == 3
    assert "schedule" in data