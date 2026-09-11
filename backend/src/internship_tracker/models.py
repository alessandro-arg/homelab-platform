from datetime import date
from enum import Enum
from typing import Annotated, Self

from pydantic import BaseModel, EmailStr, HttpUrl, StringConstraints, model_validator


NonEmptyString = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    OFFER = "offer"


class RejectionReason(str, Enum):
    NO_REASON_PROVIDED = "no_reason_provided"
    POSITION_FILLED = "position_filled"
    EXPERIENCE_OR_QUALIFICATIONS = "experience_or_qualifications"
    LOCATION = "location"
    LANGUAGE = "language"
    SALARY_OR_CONDITIONS = "salary_or_conditions"
    TIMING = "timing"
    OTHER = "other"


class ApplicationCreate(BaseModel):
    company_name: NonEmptyString
    position_title: NonEmptyString | None = None
    status: ApplicationStatus
    rejection_reason: RejectionReason | None = None
    application_date: date
    contact_person: NonEmptyString | None = None
    contact_email: EmailStr | None = None
    job_url: HttpUrl | None = None
    notes: Annotated[str, StringConstraints(max_length=1000)] | None = None

    @model_validator(mode="after")
    def validate_rejection_reason(self) -> Self:
        if (
            self.rejection_reason is not None
            and self.status != ApplicationStatus.REJECTED
        ):
            raise ValueError(
                "rejection_reason is only allowed when status is rejected"
            )
        return self


class Application(ApplicationCreate):
    id: int


class MonthlyApplicationCount(BaseModel):
    month: str
    count: int


class ApplicationAnalytics(BaseModel):
    total_applications: int
    current_status_counts: dict[ApplicationStatus, int]
    rejection_reason_counts: dict[RejectionReason, int]
    rejected_without_recorded_reason: int
    applications_by_month: list[MonthlyApplicationCount]
