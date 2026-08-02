from datetime import date
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, EmailStr, HttpUrl, StringConstraints


NonEmptyString = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    OFFER = "offer"


class ApplicationCreate(BaseModel):
    company_name: NonEmptyString
    position_title: NonEmptyString | None = None
    status: ApplicationStatus
    application_date: date
    contact_person: NonEmptyString | None = None
    contact_email: EmailStr | None = None
    job_url: HttpUrl | None = None
    notes: Annotated[str, StringConstraints(max_length=1000)] | None = None


class Application(ApplicationCreate):
    id: int
