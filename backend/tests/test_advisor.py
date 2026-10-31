import pytest
import models
from starlette.testclient import TestClient

from dependencies import get_current_user
from services.advisor_service import build_academic_context

from api import app

def test_advisor_stream_unauthorized():
    """Ensure unauthenticated users cannot access the advisor stream"""
    unauthed_client = TestClient(app)
    response = unauthed_client.post(
        "/api/v1/ai/advisor/stream",
        json={"message": "What should I study next?"}
    )
    assert response.status_code == 401

def test_build_academic_context_bottlenecks(db_session):
    """Verify that build_academic_context extracts subjects and identifies DAG bottlenecks"""
    empty_context = build_academic_context(db_session, user_id=9999)
    assert "Student currently has no study plans configured" in empty_context

    plan = models.Plan(name="CS", semester="Semester 1", owner_id=1)
    db_session.add(plan)
    db_session.commit()

    sub_a = models.Subject(name="Algebra1", is_completed=False, plan_id=plan.id)
    sub_b = models.Subject(name="Algebra2", is_completed=False, plan_id=plan.id)
    sub_c = models.Subject(name="Algebra3", is_completed=False, plan_id=plan.id)
    db_session.add_all([sub_a, sub_b, sub_c])
    db_session.commit()

    sub_a.dependent_subjects.append(sub_b)
    sub_b.dependent_subjects.append(sub_c)
    db_session.commit()

    context = build_academic_context(db_session, user_id=1, plan_id=plan.id)

    assert "STUDY PLAN: CS" in context
    assert "Algebra1" in context
    assert "CRITICAL: Incomplete! Blocks 2 future courses" in context

def test_advisor_stream_success(client, db_session, monkeypatch):
    """Verify that the advisor stream endpoint authenticates and returns SSE chunks."""
    test_user = models.User(id=1, email="advisor_test@flow.com", is_active=True)
    db_session.add(test_user)
    db_session.commit()

    app.dependency_overrides[get_current_user] = lambda: test_user

    async def mock_stream(message, context):
        yield "data: {\"text\": \"Focus on \"}\n\n"
        yield "data: {\"text\": \"Algebra1!\"}\n\n"

    monkeypatch.setattr("routers.advisor.stream_gemini_response", mock_stream)

    response = client.post(
        "/api/v1/ai/advisor/stream",
        json={"message": "What is my biggest priority?"}
    )

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    assert "Focus on " in response.text
    assert "Algebra1" in response.text