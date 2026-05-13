from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")

    # OK
    assert response.status_code == 200

    assert response.json() == {
        "status": "ok",
        "message": "AcademicFlow API is running"
    }