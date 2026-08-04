from sqlalchemy import inspect

from internship_tracker.database import create_database_engine
from internship_tracker.database_models import ApplicationRecord, Base


def test_application_record_uses_applications_table():
    assert ApplicationRecord.__tablename__ == "applications"
    assert Base.metadata.tables["applications"] is ApplicationRecord.__table__


def test_application_table_has_expected_columns():
    table = ApplicationRecord.__table__

    assert set(table.columns.keys()) == {
        "id",
        "company_name",
        "position_title",
        "status",
        "application_date",
        "contact_person",
        "contact_email",
        "job_url",
        "notes",
    }

    assert table.c.id.primary_key is True
    assert table.c.company_name.nullable is False
    assert table.c.status.nullable is False

    assert table.c.position_title.nullable is True
    assert table.c.application_date.nullable is True
    assert table.c.contact_person.nullable is True
    assert table.c.contact_email.nullable is True
    assert table.c.job_url.nullable is True
    assert table.c.notes.nullable is True


def test_application_table_can_be_created():
    engine = create_database_engine("sqlite+pysqlite:///:memory:")

    try:
        Base.metadata.create_all(engine)

        inspector = inspect(engine)

        assert inspector.has_table("applications")
    finally:
        engine.dispose()
