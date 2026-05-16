import os

os.environ["DATABASE_URL"] = "sqlite:///./test_database.db"

from fastapi.testclient import TestClient

from api import app, get_current_user
import models

client = TestClient(app)

def override_get_current_user():
    return models.User(id=1, email="test@pytest.com", is_active=True)

app.dependency_overrides[get_current_user] = override_get_current_user

def test_health_check():
    response = client.get("/")

    # OK
    assert response.status_code == 201

    assert response.json() == {
        "status": "ok",
        "message": "AcademicFlow API is running"
    }


def test_generate_plan():
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