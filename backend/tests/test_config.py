from internship_tracker.config import Settings


def test_settings_reads_database_url_from_environment(monkeypatch):
    database_url = (
        "postgresql+psycopg://tracker:tracker@localhost:5432/"
        "internship_tracker"
    )
    monkeypatch.setenv("DATABASE_URL", database_url)

    settings = Settings(_env_file=None)

    assert settings.database_url == database_url
