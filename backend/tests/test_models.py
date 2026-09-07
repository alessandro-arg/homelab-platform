from datetime import date

import pytest
from pydantic import ValidationError

from internship_tracker.models import (
    Application, ApplicationCreate, ApplicationStatus, RejectionReason,
)


def test_create_valid_application() -> None:
    application = ApplicationCreate(
        company_name="   Example GmbH   ",
        status="applied",
        application_date=date(2026, 8, 2),
    )

    assert application.company_name == "Example GmbH"
    assert application.status.value == "applied"
    assert application.rejection_reason is None


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


@pytest.mark.parametrize("reason", list(RejectionReason))
def test_rejected_application_accepts_supported_reason(reason: RejectionReason):
    application = ApplicationCreate(
        company_name="Example GmbH",
        status="rejected",
        application_date=date(2026, 8, 2),
        rejection_reason=reason.value,
    )

    assert application.rejection_reason is reason
    assert application.model_dump(mode="json")["rejection_reason"] == reason.value


@pytest.mark.parametrize("reason_fields", [{}, {"rejection_reason": None}])
def test_rejected_application_allows_no_reason(reason_fields):
    application = ApplicationCreate(
        company_name="Example GmbH",
        status="rejected",
        application_date=date(2026, 8, 2),
        **reason_fields,
    )

    assert application.rejection_reason is None


@pytest.mark.parametrize("status", [
    ApplicationStatus.APPLIED, ApplicationStatus.INTERVIEW, ApplicationStatus.OFFER,
])
def test_rejection_reason_requires_rejected_status(status: ApplicationStatus):
    with pytest.raises(ValidationError, match="only allowed when status is rejected"):
        ApplicationCreate(
            company_name="Example GmbH",
            status=status,
            application_date=date(2026, 8, 2),
            rejection_reason="no_reason_provided",
        )


@pytest.mark.parametrize("reason", ["unknown", ""])
def test_reject_unknown_rejection_reason(reason: str):
    with pytest.raises(ValidationError):
        ApplicationCreate(
            company_name="Example GmbH",
            status="rejected",
            application_date=date(2026, 8, 2),
            rejection_reason=reason,
        )


def test_application_inherits_rejection_validation():
    with pytest.raises(ValidationError, match="only allowed when status is rejected"):
        Application(
            id=1,
            company_name="Example GmbH",
            status="applied",
            application_date=date(2026, 8, 2),
            rejection_reason="position_filled",
        )
