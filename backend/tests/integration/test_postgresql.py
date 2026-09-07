from collections.abc import Iterator
from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from pydantic_settings import BaseSettings,  SettingsConfigDict
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import IntegrityError
from sqlalchemy.schema import CreateSchema, DropSchema

from internship_tracker.dependencies import (
    get_engine, get_session_factory, get_settings
)
from internship_tracker.main import app


BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BACKEND_DIR.parent


class IntegrationTestSettings(BaseSettings):
    test_database_url: str

    model_config = SettingsConfigDict(
        env_file=PROJECT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@pytest.fixture
def postgres_schema(monkeypatch: pytest.MonkeyPatch) -> Iterator[Config]:
    test_settings = IntegrationTestSettings()
    schema = f"test_rejection_{uuid4().hex}"
    admin_engine = create_engine(test_settings.test_database_url)
    with admin_engine.begin() as connection:
        connection.execute(CreateSchema(schema))

    # Exclude public so Alembic cannot find another schema's version table.
    url = make_url(test_settings.test_database_url)
    options = url.query.get("options", "")
    schema_url = url.update_query_dict({
        "options": f"{options} -csearch_path={schema}".strip(),
    })
    monkeypatch.setenv("DATABASE_URL", schema_url.render_as_string(hide_password=False))
    get_settings.cache_clear()
    get_engine.cache_clear()
    get_session_factory.cache_clear()

    try:
        yield Config(str(BACKEND_DIR / "alembic.ini"))
    finally:
        get_engine().dispose()
        get_session_factory.cache_clear()
        get_engine.cache_clear()
        get_settings.cache_clear()
        try:
            with admin_engine.begin() as connection:
                connection.execute(DropSchema(schema, cascade=True))
        finally:
            admin_engine.dispose()


@pytest.fixture
def postgres_client(postgres_schema: Config) -> Iterator[TestClient]:
    command.upgrade(postgres_schema, "head")
    with TestClient(app) as client:
        yield client


@pytest.mark.integration
def test_persistent_crud_flow(
    postgres_client: TestClient,
) -> None:
    create_response = postgres_client.post(
        "/applications",
        json={
            "company_name": "PostgreSQL Test GmbH",
            "position_title": "Backend Developer",
            "status": "applied",
            "application_date": "2026-08-07",
        },
    )

    assert create_response.status_code == 201
    assert create_response.json()["rejection_reason"] is None

    application_id = create_response.json()["id"]

    get_response = postgres_client.get(
        f"/applications/{application_id}"
    )

    assert get_response.status_code == 200
    assert get_response.json()["company_name"] == (
        "PostgreSQL Test GmbH"
    )

    update_response = postgres_client.put(
        f"/applications/{application_id}",
        json={
            "company_name": "PostgreSQL Test GmbH",
            "position_title": "Backend Developer",
            "status": "interview",
            "application_date": "2026-08-07",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["status"] == "interview"

    delete_response = postgres_client.delete(
        f"/applications/{application_id}"
    )

    assert delete_response.status_code == 204

    missing_response = postgres_client.get(
        f"/applications/{application_id}"
    )

    assert missing_response.status_code == 404


@pytest.mark.integration
def test_postgresql_rejection_reason_round_trip(postgres_client: TestClient):
    payload = {
        "company_name": "PostgreSQL Test GmbH",
        "status": "rejected",
        "application_date": "2026-08-07",
        "rejection_reason": "no_reason_provided",
    }
    created = postgres_client.post("/applications", json=payload)
    assert created.status_code == 201
    assert created.json()["rejection_reason"] == "no_reason_provided"
    url = f"/applications/{created.json()['id']}"
    assert postgres_client.get(url).json() == created.json()
    assert postgres_client.get("/applications").json() == [created.json()]

    payload["rejection_reason"] = "position_filled"
    updated = postgres_client.put(url, json=payload)
    assert updated.status_code == 200
    assert updated.json()["rejection_reason"] == "position_filled"
    assert postgres_client.get(url).json() == updated.json()

    payload.pop("rejection_reason")
    cleared = postgres_client.put(url, json=payload)
    assert cleared.status_code == 200
    assert cleared.json()["rejection_reason"] is None
    assert postgres_client.get(url).json() == cleared.json()


@pytest.mark.integration
def test_rejection_migration_preserves_legacy_rows(postgres_schema: Config):
    command.upgrade(postgres_schema, "673d604a8a3c")
    engine = get_engine()
    with engine.begin() as connection:
        connection.execute(text("""
            INSERT INTO applications (
                company_name, position_title, status, application_date,
                contact_person, contact_email, job_url, notes
            ) VALUES (
                'Legacy Rejected GmbH', 'Developer', 'rejected', '2026-08-01',
                'Contact Person', 'jobs@example.com', 'https://example.com/job',
                'Existing rejection notes must remain untouched.'
            ), (
                'Legacy Applied GmbH', NULL, 'applied', '2026-08-02',
                NULL, NULL, NULL, NULL
            )
        """))
        before = [dict(row) for row in connection.execute(
            text("SELECT * FROM applications ORDER BY id")
        ).mappings()]

    command.upgrade(postgres_schema, "head")

    with engine.connect() as connection:
        after = [dict(row) for row in connection.execute(
            text("SELECT * FROM applications ORDER BY id")
        ).mappings()]
    assert after == [{**row, "rejection_reason": None} for row in before]

    columns = {column["name"]: column for column in inspect(engine).get_columns(
        "applications"
    )}
    assert columns["rejection_reason"]["nullable"] is True
    assert columns["rejection_reason"]["default"] is None
    assert columns["rejection_reason"]["type"].length == 50


@pytest.mark.integration
def test_postgresql_rejection_constraints(postgres_schema: Config):
    command.upgrade(postgres_schema, "head")
    engine = get_engine()
    insert = text("""
        INSERT INTO applications (
            company_name, status, application_date, rejection_reason
        ) VALUES ('Constraint Test', :status, '2026-08-07', :reason)
        RETURNING id
    """)
    with engine.begin() as connection:
        for status, reason in [
            ("applied", None), ("rejected", None),
            ("rejected", "no_reason_provided"),
        ]:
            connection.execute(insert, {"status": status, "reason": reason})
        application_id = connection.execute(insert, {
            "status": "rejected", "reason": "position_filled",
        }).scalar_one()

    for status, reason, constraint in [
        ("rejected", "unknown", "ck_applications_rejection_reason"),
        ("applied", "position_filled", "ck_applications_rejection_reason_status"),
        ("unknown", None, "ck_applications_status"),
    ]:
        with pytest.raises(IntegrityError) as error:
            with engine.begin() as connection:
                connection.execute(insert, {"status": status, "reason": reason})
        assert error.value.orig.diag.constraint_name == constraint

    with pytest.raises(IntegrityError) as error:
        with engine.begin() as connection:
            connection.execute(text(
                "UPDATE applications SET status = 'offer' WHERE id = :id"
            ), {"id": application_id})
    assert error.value.orig.diag.constraint_name == (
        "ck_applications_rejection_reason_status"
    )
