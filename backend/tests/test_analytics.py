from datetime import date

from internship_tracker.analytics import calculate_application_analytics
from internship_tracker.models import (
    Application,
    ApplicationStatus,
    MonthlyApplicationCount,
    RejectionReason,
)


def test_empty_analytics() -> None:
    analytics = calculate_application_analytics([])

    assert analytics.total_applications == 0
    assert analytics.current_status_counts == {
        status: 0 for status in ApplicationStatus
    }
    assert analytics.rejection_reason_counts == {
        reason: 0 for reason in RejectionReason
    }
    assert analytics.rejected_without_recorded_reason == 0
    assert analytics.applications_by_month == []


def test_mixed_applications_and_consistency() -> None:
    applications = [
        Application(
            id=application_id,
            company_name=company,
            status=status,
            rejection_reason=reason,
            application_date=date(2026, 8, application_id),
        )
        for application_id, (company, status, reason) in enumerate([
            ("First GmbH", ApplicationStatus.APPLIED, None),
            ("Second GmbH", ApplicationStatus.APPLIED, None),
            ("Third GmbH", ApplicationStatus.INTERVIEW, None),
            ("Fourth GmbH", ApplicationStatus.OFFER, None),
            ("Legacy GmbH", ApplicationStatus.REJECTED, None),
            ("Another GmbH", ApplicationStatus.REJECTED, None),
            ("Silent GmbH", ApplicationStatus.REJECTED,
             RejectionReason.NO_REASON_PROVIDED),
            ("Filled GmbH", ApplicationStatus.REJECTED,
             RejectionReason.POSITION_FILLED),
            ("Filled Again GmbH", ApplicationStatus.REJECTED,
             RejectionReason.POSITION_FILLED),
        ], start=1)
    ]
    before = [application.model_dump() for application in applications]

    analytics = calculate_application_analytics(applications)

    assert analytics.total_applications == 9
    assert analytics.current_status_counts == {
        ApplicationStatus.APPLIED: 2,
        ApplicationStatus.INTERVIEW: 1,
        ApplicationStatus.REJECTED: 5,
        ApplicationStatus.OFFER: 1,
    }
    assert analytics.rejection_reason_counts == {
        **{reason: 0 for reason in RejectionReason},
        RejectionReason.NO_REASON_PROVIDED: 1,
        RejectionReason.POSITION_FILLED: 2,
    }
    assert analytics.rejected_without_recorded_reason == 2
    assert analytics.applications_by_month == [
        MonthlyApplicationCount(month="2026-08", count=9),
    ]
    assert sum(analytics.current_status_counts.values()) == analytics.total_applications
    assert sum(month.count for month in analytics.applications_by_month) == (
        analytics.total_applications
    )
    assert (
        sum(analytics.rejection_reason_counts.values())
        + analytics.rejected_without_recorded_reason
        == analytics.current_status_counts[ApplicationStatus.REJECTED]
    )
    assert [application.model_dump() for application in applications] == before


def test_every_explicit_rejection_reason_is_counted() -> None:
    applications = [
        Application(
            id=application_id,
            company_name="Example GmbH",
            status=ApplicationStatus.REJECTED,
            rejection_reason=reason,
            application_date=date(2026, 8, 1),
        )
        for application_id, reason in enumerate(RejectionReason, start=1)
    ]

    analytics = calculate_application_analytics(applications)

    assert analytics.total_applications == len(RejectionReason)
    assert analytics.current_status_counts == {
        ApplicationStatus.APPLIED: 0,
        ApplicationStatus.INTERVIEW: 0,
        ApplicationStatus.REJECTED: len(RejectionReason),
        ApplicationStatus.OFFER: 0,
    }
    assert analytics.rejection_reason_counts == {
        reason: 1 for reason in RejectionReason
    }
    assert analytics.rejected_without_recorded_reason == 0


def test_months_are_grouped_by_year_and_sorted_without_filling_gaps() -> None:
    applications = [
        Application(
            id=application_id,
            company_name="Example GmbH",
            status=ApplicationStatus.APPLIED,
            application_date=application_date,
        )
        for application_id, application_date in enumerate([
            date(2026, 3, 1),
            date(2025, 12, 31),
            date(2026, 1, 1),
            date(2025, 1, 31),
            date(2026, 1, 31),
        ], start=1)
    ]

    analytics = calculate_application_analytics(applications)

    assert analytics.applications_by_month == [
        MonthlyApplicationCount(month="2025-01", count=1),
        MonthlyApplicationCount(month="2025-12", count=1),
        MonthlyApplicationCount(month="2026-01", count=2),
        MonthlyApplicationCount(month="2026-03", count=1),
    ]
    assert sum(month.count for month in analytics.applications_by_month) == (
        analytics.total_applications
    )
