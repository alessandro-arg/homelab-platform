from datetime import date

from sqlalchemy import CheckConstraint, Date, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ApplicationRecord(Base):
    __tablename__ = "applications"

    __table_args__ = (
        CheckConstraint(
            "status IN ('applied', 'interview', 'rejected', 'offer')",
            name="ck_applications_status",
        ),
        CheckConstraint(
            "rejection_reason IS NULL OR rejection_reason IN ("
            "'no_reason_provided', 'position_filled', "
            "'experience_or_qualifications', 'location', 'language', "
            "'salary_or_conditions', 'timing', 'other')",
            name="ck_applications_rejection_reason",
        ),
        CheckConstraint(
            "rejection_reason IS NULL OR status = 'rejected'",
            name="ck_applications_rejection_reason_status",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    company_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    position_title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    rejection_reason: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    application_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    contact_person: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(320),
        nullable=True,
    )

    job_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
