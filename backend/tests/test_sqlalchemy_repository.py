from collections.abc import Iterator
from datetime import date

import pytest

from internship_tracker.database import (
    create_database_engine,
    create_session_factory,
)
from internship_tracker.database_models import Base
from internship_tracker.models import ApplicationCreate, ApplicationStatus
from internship_tracker.sqlalchemy_repository import (
    SqlAlchemyApplicationRepository,
)


@pytest.fixture
def repository() -> Iterator[SqlAlchemyApplicationRepository]:
    engine = create_database_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    session_factory = create_session_factory(engine)

    with session_factory() as session:
        yield SqlAlchemyApplicationRepository(session)

    engine.dispose()


def create_application_data(
    company_name: str = "Example GmbH",
    status: ApplicationStatus = ApplicationStatus.APPLIED,
) -> ApplicationCreate:
    return ApplicationCreate(
        company_name=company_name,
        position_title="Python Developer",
        status=status,
        application_date=date(2026, 8, 6),
        contact_person="Max Mustermann",
        contact_email="jobs@example.com",
        job_url="https://example.com/jobs/python-developer",
        notes="Application submitted.",
    )


def test_create_application(
    repository: SqlAlchemyApplicationRepository,
) -> None:
    application = repository.create(create_application_data())

    assert application.id == 1
    assert application.company_name == "Example GmbH"
    assert application.status == ApplicationStatus.APPLIED
    assert application.application_date == date(2026, 8, 6)
    assert application.contact_email == "jobs@example.com"
    assert str(application.job_url) == (
        "https://example.com/jobs/python-developer"
    )


def test_list_applications_returns_records_in_id_order(
    repository: SqlAlchemyApplicationRepository,
) -> None:
    repository.create(create_application_data("First GmbH"))
    repository.create(create_application_data("Second GmbH"))

    applications = repository.list_all()

    assert [application.id for application in applications] == [1, 2]
    assert [application.company_name for application in applications] == [
        "First GmbH",
        "Second GmbH",
    ]


def test_get_application_by_id(
    repository: SqlAlchemyApplicationRepository,
) -> None:
    created_application = repository.create(create_application_data())

    application = repository.get_by_id(created_application.id)

    assert application is not None
    assert application.id == created_application.id
    assert application.company_name == "Example GmbH"


def test_get_unknown_application_returns_none(
    repository: SqlAlchemyApplicationRepository,
) -> None:
    assert repository.get_by_id(999) is None


def test_update_application(
    repository: SqlAlchemyApplicationRepository,
) -> None:
    created_application = repository.create(create_application_data())

    updated_data = ApplicationCreate(
        company_name="Updated GmbH",
        status=ApplicationStatus.INTERVIEW,
        application_date=date(2026, 8, 7),
    )

    application = repository.update(
        created_application.id,
        updated_data,
    )

    assert application is not None
    assert application.id == created_application.id
    assert application.company_name == "Updated GmbH"
    assert application.status == ApplicationStatus.INTERVIEW
    assert application.application_date == date(2026, 8, 7)
    assert application.position_title is None
    assert application.contact_person is None


def test_update_unknown_application_returns_none(
    repository: SqlAlchemyApplicationRepository,
) -> None:
    result = repository.update(
        999,
        create_application_data(),
    )

    assert result is None


def test_delete_application(
    repository: SqlAlchemyApplicationRepository,
) -> None:
    created_application = repository.create(create_application_data())

    deleted = repository.delete(created_application.id)

    assert deleted is True
    assert repository.get_by_id(created_application.id) is None


def test_delete_unknown_application_returns_false(
    repository: SqlAlchemyApplicationRepository,
) -> None:
    assert repository.delete(999) is False
