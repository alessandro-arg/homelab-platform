from fastapi.testclient import TestClient

from internship_tracker.main import app


client = TestClient(app)


def test_metrics_endpoint() -> None:
    response = client.get("/metrics")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    assert "http_requests_total" in response.text
