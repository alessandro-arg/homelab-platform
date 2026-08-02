from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from internship_tracker.main import app, get_repository
from internship_tracker.repository import ApplicationRepository


@pytest.fixture
def client() -> Iterator[TestClient]:
    test_repository = ApplicationRepository()

    app.dependency_overrides[get_repository] = lambda: test_repository

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_create_application(client: TestClient) -> None:
    response = client.post(
        "/applications",
        json={
            "company_name": "Example GmbH",
            "position_title": "Python Developer",
            "status": "applied",
            "application_date": "2026-08-02",
            "contact_email": "jobs@example.com",
            "notes": "Application submitted through the company website.",
        },
    )

    assert response.status_code == 201

    response_data = response.json()

    assert response_data["id"] == 1
    assert response_data["company_name"] == "Example GmbH"
    assert response_data["position_title"] == "Python Developer"
    assert response_data["status"] == "applied"
    assert response_data["application_date"] == "2026-08-02"


def test_list_applications_returns_empty_list(
    client: TestClient,
) -> None:
    response = client.get("/applications")

    assert response.status_code == 200
    assert response.json() == []


def test_list_applications_returns_created_applications(
    client: TestClient,
) -> None:
    creation_response = client.post(
        "/applications",
	json={
	    "company_name": "Example GmbH",
	    "status": "applied",
	    "application_date": "2026-08-02",
	},
    )

    assert creation_response.status_code == 201

    response = client.get("/applications")

    assert response.status_code == 200

    applications = response.json()

    assert len(applications) == 1
    assert applications[0]["id"] == 1
    assert applications[0]["company_name"] == "Example GmbH"
    assert applications[0]["status"] == "applied"
