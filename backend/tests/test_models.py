from datetime import date

import pytest
from pydantic import ValidationError

from internship_tracker.models import ApplicationCreate


def test_create_valid_application() -> None:
    application = ApplicationCreate(
        company_name="   Example GmbH   ",
        status="applied",
        application_date=date(2026, 8, 2),
    )

    assert application.company_name == "Example GmbH"
    assert application.status.value == "applied"


def test_reject_empty_company_name() -> None:
    with pytest.raises(ValidationError):
        ApplicationCreate(
            company_name="   ",
            status="applied",
            application_date=date(2026, 8, 2),
        )


def test_reject_unknown_status() -> None:
    with pytest.raises(ValidationError):
        ApplicationCreate(
            company_name="Example GmbH",
            status="waiting",
            application_date=date(2026, 8, 2),
        )


def test_reject_invalid_email() -> None:
    with pytest.raises(ValidationError):
        ApplicationCreate(
            company_name="Example GmbH",
            status="applied",
            application_date=date(2026, 8, 2),
            contact_email="not-an-email",
        )


def test_reject_notes_longer_than_1000_characters() -> None:
    with pytest.raises(ValidationError):
        ApplicationCreate(
            company_name="Example GmbH",
            status="applied",
            application_date=date(2026, 8, 2),
            notes="a" * 1001,
        )
