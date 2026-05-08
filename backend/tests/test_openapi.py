from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_openapi_schema_is_served():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")


def test_core_routes_are_registered():
    paths = client.get("/openapi.json").json()["paths"]

    assert "/api/auth/login" in paths
    assert "/api/auth/logout" in paths
    assert "/api/auth/me" in paths
    assert "/api/events/" in paths
    assert "/api/habits/" in paths
    assert "/api/notes/" in paths
    assert "/api/settings/" in paths
    assert "/api/health" in paths
