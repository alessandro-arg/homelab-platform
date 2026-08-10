from sqlalchemy.engine import URL

from internship_tracker.config import Settings


def test_settings_reads_database_url_from_environment(monkeypatch):
    database_url = (
        "postgresql+psycopg://tracker:tracker@localhost:5432/"
        "internship_tracker"
    )
    monkeypatch.setenv("DATABASE_URL", database_url)

    settings = Settings(_env_file=None)

    assert settings.get_database_url() == database_url


def test_settings_builds_database_url_from_components(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)

    monkeypatch.setenv("POSTGRES_USER", "tracker")
    monkeypatch.setenv(
        "POSTGRES_PASSWORD",
        "p@ss:/%word"
    )
    monkeypatch.setenv("POSTGRES_DB", "internship_tracker")
    monkeypatch.setenv("DATABASE_HOST", "postgres")

    settings = Settings(_env_file=None)

    database_url = settings.get_database_url()

    assert isinstance(database_url, URL)
    assert database_url.drivername == "postgresql+psycopg"
    assert database_url.username == "tracker"
    assert database_url.password == "p@ss:/%word"
    assert database_url.host == "postgres"
    assert database_url.port == 5432
    assert database_url.database == "internship_tracker"
