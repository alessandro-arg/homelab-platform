from collections.abc import Iterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from pydantic_settings import BaseSettings,  SettingsConfigDict
from sqlalchemy import text

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
def postgres_client(
    monkeypatch: pytest.MonkeyPatch,
) -> Iterator[TestClient]:
    test_settings = IntegrationTestSettings()

    monkeypatch.setenv(
        "DATABASE_URL",
        test_settings.test_database_url,
    )

    get_settings.cache_clear()
    get_engine.cache_clear()
    get_session_factory.cache_clear()

    alembic_config = Config(str(BACKEND_DIR / "alembic.ini"))
    command.upgrade(alembic_config, "head")

    engine = get_engine()

    with engine.begin() as connection:
        connection.execute(
            text(
                "TRUNCATE TABLE applications "
                "RESTART IDENTITY"
            )
        )

    with TestClient(app) as client:
        yield client

    with engine.begin() as connection:
        connection.execute(
            text(
                "TRUNCATE TABLE applications "
                "RESTART IDENTITY"
            )
        )

    engine.dispose()

    get_session_factory.cache_clear()
    get_engine.cache_clear()
    get_settings.cache_clear()


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
