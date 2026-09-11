from collections.abc import Iterator
from datetime import date

import pytest
from fastapi.testclient import TestClient

from internship_tracker.dependencies import get_repository
from internship_tracker.main import app
from internship_tracker.models import ApplicationCreate
from internship_tracker.repository import InMemoryApplicationRepository


@pytest.fixture
def repository() -> InMemoryApplicationRepository:
    return InMemoryApplicationRepository()


@pytest.fixture
def client(repository: InMemoryApplicationRepository) -> Iterator[TestClient]:
    app.dependency_overrides[get_repository] = lambda: repository
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


def test_empty_analytics_response(client: TestClient) -> None:
    response = client.get("/analytics/applications")

    assert response.status_code == 200
    assert response.json() == {
        "total_applications": 0,
        "current_status_counts": {
            "applied": 0, "interview": 0, "rejected": 0, "offer": 0,
        },
        "rejection_reason_counts": {
            "no_reason_provided": 0,
            "position_filled": 0,
            "experience_or_qualifications": 0,
            "location": 0,
            "language": 0,
            "salary_or_conditions": 0,
            "timing": 0,
            "other": 0,
        },
        "rejected_without_recorded_reason": 0,
        "applications_by_month": [],
    }


def test_populated_analytics_response(
    client: TestClient,
    repository: InMemoryApplicationRepository,
) -> None:
    for status, reason, application_date in [
        ("applied", None, date(2026, 8, 1)),
        ("rejected", None, date(2026, 7, 1)),
        ("interview", None, date(2026, 8, 2)),
        ("rejected", "no_reason_provided", date(2026, 7, 2)),
        ("offer", None, date(2026, 8, 3)),
        ("rejected", "position_filled", date(2026, 7, 3)),
        ("applied", None, date(2026, 8, 4)),
    ]:
        repository.create(ApplicationCreate(
            company_name="Example GmbH",
            status=status,
            rejection_reason=reason,
            application_date=application_date,
        ))

    response = client.get("/analytics/applications")

    assert response.status_code == 200
    assert response.json() == {
        "total_applications": 7,
        "current_status_counts": {
            "applied": 2, "interview": 1, "rejected": 3, "offer": 1,
        },
        "rejection_reason_counts": {
            "no_reason_provided": 1,
            "position_filled": 1,
            "experience_or_qualifications": 0,
            "location": 0,
            "language": 0,
            "salary_or_conditions": 0,
            "timing": 0,
            "other": 0,
        },
        "rejected_without_recorded_reason": 1,
        "applications_by_month": [
            {"month": "2026-07", "count": 3},
            {"month": "2026-08", "count": 4},
        ],
    }
