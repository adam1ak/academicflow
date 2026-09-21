import pytest
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.orm import Session

import models
from security import create_access_token

@pytest.fixture
def auth_setup(db_session: Session):
    """
    Create user in RAM db with semester schedule.
    Returns auth headers with JWT and created plan object
    """
    user = models.User(
        email="student@academicflow.com",
        name="John Doe",
        hashed_password="hashed_secure_password"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    plan = models.Plan(
        name="Computer Science Year 1",
        max_concurrent=3,
        owner_id=user.id
    )
    db_session.add(plan)
    db_session.commit()
    db_session.refresh(plan)

    token = create_access_token(data={"sub": user.email})
    header = {"Authorization": f"Bearer {token}"}

    return {"headers": header, "plan": plan, "user": user}

@pytest.mark.asyncio
async def test_async_add_subject(async_client: AsyncClient, auth_setup):
    """
    Checks if POST `/plan{id}/subject` endpoint successfully added subject.
    """
    headers = auth_setup["headers"]
    plan = auth_setup["plan"]

    payload = {
        "name": "Data Structures",
        "field": "CS",
        "duration": 3,
        "classroom": "Room 101",
        "dependents": []
    }

    response = await async_client.post(
        f"/api/v1/plans/{plan.id}/subjects",
        json=payload,
        headers=headers
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Data Structures"
    assert data["duration"] == 3
    assert data["classroom"] == "Room 101"

@pytest.mark.asyncio
async def test_async_add_subject_with_dependecies(async_client: AsyncClient, auth_setup):
    """
    Checks creating dependencies relations.
    """
    headers = auth_setup["headers"]
    plan = auth_setup["plan"]

    sub1_payload = {
        "name": "Intro to CS",
        "field": "CS",
        "duration": 2,
        "dependents": []
    }
    res1 = await async_client.post(
        f"/api/v1/plans/{plan.id}/subjects",
        json=sub1_payload,
        headers=headers
    )
    assert res1.status_code == status.HTTP_201_CREATED

    sub2_payload = {
        "name": "Object Oriented Programming",
        "field": "CS",
        "duration": 3,
        "dependents": ["Intro to CS"],
    }
    res2 = await async_client.post(
        f"/api/v1/plans/{plan.id}/subjects",
        json=sub2_payload,
        headers=headers
    )
    assert res2.status_code == status.HTTP_201_CREATED
    assert "Intro to CS" in res2.json()["dependents"]

@pytest.mark.asyncio
async def test_async_toggle_subject_complete(async_client: AsyncClient, auth_setup, db_session: Session):
    """
    Checks if is_completed status toggled boolean value using endpoint PATCH
    """
    headers = auth_setup["headers"]
    plan = auth_setup["plan"]

    subject = models.Subject(
        name="Discrete Math",
        field="Math",
        duration=2,
        is_completed=False,
        plan_id=plan.id
    )
    db_session.add(subject)
    db_session.commit()
    db_session.refresh(subject)

    response = await async_client.patch(
        f"/api/v1/plans/{plan.id}/subjects/{subject.id}/complete",
        headers=headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_completed"] is True

    response_undo = await async_client.patch(
        f"/api/v1/plans/{plan.id}/subjects/{subject.id}/complete",
        headers=headers
    )
    assert response_undo.status_code == status.HTTP_200_OK
    assert response_undo.json()["is_completed"] is False

@pytest.mark.asyncio
async def test_async_subject_idor_protection(async_client: AsyncClient, auth_setup, db_session: Session):
    """
    Checks if different user will receive 404/403 error while trying to get other's user plan
    """
    plan = auth_setup["plan"]

    hacker = models.User(
        email="hacker@hacker.com",
        name="hacker",
        hashed_password="pw"
    )
    db_session.add(hacker)
    db_session.commit()
    db_session.refresh(hacker)

    hacker_token = create_access_token(data={"sub": hacker.email})
    hacker_headers = {"Authorization": f"Bearer {hacker_token}"}
    payload = {
        "name": "Hacked Course",
        "field": "CS",
        "duration": 1,
        "dependents": []
    }

    response = await async_client.post(
        f"/api/v1/plans/{plan.id}/subjects",
        json=payload,
        headers=hacker_headers
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND