from config import settings

settings.database_url = "sqlite:///./test_database.db"

from fastapi.testclient import TestClient
from api import app, get_current_user
import models
from database import engine
from api import get_db

models.Base.metadata.create_all(bind=engine)
client = TestClient(app)

def override_get_current_user():
    return models.User(id=1, email="test@pytest.com", is_active=True)

app.dependency_overrides[get_current_user] = override_get_current_user

def test_health_check():
    response = client.get("/")

    # OK
    assert response.status_code == 200

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

def test_generate_plan_with_cycle_error():
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

def test_generate_plan_strict_sequential():
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

def test_generate_plan_empty_payload():
    payload = {
        "max_concurrent": 2,
        "subjects": []
    }

    response = client.post("/api/v1/generate-plan", json=payload)
    assert response.status_code == 201
    assert response.json() == []

def test_get_plan_idor_protection():
    db_gen = get_db()
    db = next(db_gen)
    foreign_plan = None

    try :
        foreign_plan = models.Plan(name="Secret Physics Plan", max_concurrent=2, owner_id=999)
        db.add(foreign_plan)
        db.commit()
        db.refresh(foreign_plan)

        response = client.get(f"/api/v1/plans/{foreign_plan.id}")

        assert response.status_code == 404
    finally:
        if foreign_plan and foreign_plan.id:
            db.delete(foreign_plan)
            db.commit()

        try:
            next(db_gen)
        except StopIteration:
            pass
