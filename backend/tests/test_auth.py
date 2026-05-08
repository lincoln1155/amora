from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_with_wrong_password_returns_401():
    response = client.post("/api/auth/login", json={"password": "wrong"})
    assert response.status_code == 401


def test_login_with_correct_password_sets_session_cookie():
    response = client.post("/api/auth/login", json={"password": "test_password"})
    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert "session" in response.cookies


def test_me_without_cookie_returns_401():
    fresh_client = TestClient(app)
    response = fresh_client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_with_valid_session_returns_authenticated():
    fresh_client = TestClient(app)
    fresh_client.post("/api/auth/login", json={"password": "test_password"})

    response = fresh_client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json() == {"authenticated": True}


def test_protected_route_rejects_unauthenticated_request():
    fresh_client = TestClient(app)
    response = fresh_client.get("/api/events/")
    assert response.status_code == 401
