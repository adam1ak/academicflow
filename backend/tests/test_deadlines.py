from urllib import response

import pytest
from datetime import date, timedelta, UTC, datetime
from api import app, get_current_user
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

def test_create_deadline(client, db_session):
    plan = models.Plan(name="Computer Science BSc", max_concurrent=4, owner_id=1)
    db_session.add(plan)
    db_session.commit()
    db_session.refresh(plan)

    payload = {
        "title": "Machine Learning Assignment",
        "type": "assignment",
        "due_date": str(date.today() + timedelta(days=7)),
        "classroom": "Lab 201",
        "plan_id": plan.id
    }

    response = client.post("/api/v1/deadlines", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Machine Learning Assignment"
    assert data["type"] == "assignment"
    assert data["plan_id"] == plan.id

def test_get_deadlines_list(client, db_session):
    deadline1 = models.Deadline(
        title="Algorithms Exam",
        type="exam",
        due_date=date.today(),
        owner_id=1
    )
    deadline2 = models.Deadline(
        title="Web Development Project",
        type="project",
        due_date=date.today() + timedelta(days=2),
        owner_id=1
    )
    db_session.add_all([deadline1, deadline2])
    db_session.commit()

    response = client.get("/api/v1/deadlines")
    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert any(d["title"] == "Algorithms Exam" for d in data)
    assert any(d["title"] == "Web Development Project" for d in data)

def test_update_deadline(client, db_session):
    deadline = models.Deadline(
        title="Old Assignment Title",
        type="task",
        due_date=date.today(),
        owner_id=1
    )
    db_session.add(deadline)
    db_session.commit()
    db_session.refresh(deadline)

    payload = {
        "title": "New Optimized Title",
        "type": "exam",
        "due_date": str(date.today() + timedelta(days=1))
    }

    response = client.put(f"/api/v1/deadlines/{deadline.id}", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["title"] == "New Optimized Title"
    assert data["type"] == "exam"

def test_delete_deadline(client, db_session):
    deadline = models.Deadline(
        title="Ghost Task",
        type="assignment",
        due_date=date.today(),
        owner_id=1
    )
    db_session.add(deadline)
    db_session.commit()
    db_session.refresh(deadline)

    response = client.delete(f"/api/v1/deadlines/{deadline.id}")
    assert response.status_code == 204

    deleted_dl = db_session.query(models.Deadline).filter(models.Deadline.id == deadline.id).first()
    assert deleted_dl is None

def test_deadline_auto_deletion(client, db_session):
    expired_date = datetime.now(UTC).replace(tzinfo=None) - timedelta(hours=25)
    expired_deadline = models.Deadline(
        title="Expired Assignment",
        type="Assignment",
        due_date=expired_date,
        owner_id=1
    )

    recent_data = datetime.now(UTC).replace(tzinfo=None) - timedelta(hours=25)
    recent_deadline = models.Deadline(
        title="Recent Overdue Assignment",
        type="Assignment",
        due_date=recent_data,
        owner_id=1
    )

    db_session.add_all([expired_deadline, recent_deadline])
    db_session.commit()

    response = client.get("/api/v1/deadlines")
    assert response.status_code == 200
    data = response.json()

    assert not any(d["title"] == "Expired Assignment" for d in data)
    assert any(d["title"] == "Recent Overdue Assignment" for d in data)