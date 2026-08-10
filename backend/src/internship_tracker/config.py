from sqlalchemy.engine import URL
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str | None = None

    postgres_user: str | None = None
    postgres_password: str | None = None
    postgres_db: str | None = None

    database_host: str = "localhost"
    database_port: int = 5432

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def get_database_url(self) -> str | URL:
        if self.database_url is not None:
            return self.database_url

        if (
            self.postgres_user is None
            or self.postgres_password is None
            or self.postgres_db is None
        ):
            raise ValueError(
                "Database configuration requires DATABASE_URL or "
                "POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB."
            )

        return URL.create(
            drivername="postgresql+psycopg",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.database_host,
            port=self.database_port,
            database=self.postgres_db,
        )
