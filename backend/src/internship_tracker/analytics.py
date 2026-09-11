from internship_tracker.models import (
    Application,
    ApplicationAnalytics,
    ApplicationStatus,
    MonthlyApplicationCount,
    RejectionReason,
)


def calculate_application_analytics(
    applications: list[Application],
) -> ApplicationAnalytics:
    """Summarize current records without inferring historical status events."""
    status_counts = {status: 0 for status in ApplicationStatus}
    reason_counts = {reason: 0 for reason in RejectionReason}
    rejected_without_recorded_reason = 0
    month_counts: dict[str, int] = {}

    for application in applications:
        status_counts[application.status] += 1

        if application.status == ApplicationStatus.REJECTED:
            if application.rejection_reason is None:
                rejected_without_recorded_reason += 1
            else:
                reason_counts[application.rejection_reason] += 1

        application_date = application.application_date
        month = f"{application_date.year:04d}-{application_date.month:02d}"
        month_counts[month] = month_counts.get(month, 0) + 1

    return ApplicationAnalytics(
        total_applications=len(applications),
        current_status_counts=status_counts,
        rejection_reason_counts=reason_counts,
        rejected_without_recorded_reason=rejected_without_recorded_reason,
        applications_by_month=[
            MonthlyApplicationCount(month=month, count=month_counts[month])
            for month in sorted(month_counts)
        ],
    )
