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


def test_get_application_by_id(client: TestClient) -> None:
    creation_response = client.post(
        "/applications",
        json={
            "company_name": "Example GmbH",
            "status": "applied",
            "application_date": "2026-08-02",
        },
    )

    assert creation_response.status_code == 201

    application_id = creation_response.json()["id"]
    response = client.get(f"/applications/{application_id}")

    assert response.status_code == 200
    assert response.json()["id"] == application_id
    assert response.json()["company_name"] == "Example GmbH"


def test_get_unknown_application_returns_404(
    client: TestClient,
) -> None:
    response = client.get("/applications/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Application not found"}


def test_update_application(client: TestClient) -> None:
    creation_response = client.post(
        "/applications",
        json={
            "company_name": "Example GmbH",
            "status": "applied",
            "application_date": "2026-08-02",
            "contact_person": "Max Mustermann",
        },
    )

    assert creation_response.status_code == 201

    application_id = creation_response.json()["id"]

    response = client.put(
        f"/applications/{application_id}",
        json={
            "company_name": "Updated GmbH",
            "position_title": "Backend Developer",
            "status": "interview",
            "application_date": "2026-08-02",
            "notes": "Invited to a technical interview.",
        },
    )

    assert response.status_code == 200

    response_data = response.json()

    assert response_data["id"] == application_id
    assert response_data["company_name"] == "Updated GmbH"
    assert response_data["position_title"] == "Backend Developer"
    assert response_data["status"] == "interview"
    assert response_data["contact_person"] is None
    assert response_data["notes"] == "Invited to a technical interview."

    get_response = client.get(f"/applications/{application_id}")

    assert get_response.status_code == 200
    assert get_response.json() == response_data


def test_update_unknown_application_returns_404(
    client: TestClient,
) -> None:
    response = client.put(
        "/applications/999",
        json={
            "company_name": "Example GmbH",
            "status": "applied",
            "application_date": "2026-08-02",
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Application not found"}
