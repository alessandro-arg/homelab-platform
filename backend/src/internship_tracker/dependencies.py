from collections.abc import Iterator
from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from internship_tracker.config import Settings
from internship_tracker.database import (
    create_database_engine,
    create_session_factory
)
from internship_tracker.repository import ApplicationRepository
from internship_tracker.sqlalchemy_repository import (
    SqlAlchemyApplicationRepository
)


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_engine() -> Engine:
    settings = get_settings()

    return create_database_engine(settings.get_database_url())


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    return create_session_factory(get_engine())


def get_session() -> Iterator[Session]:
    session_factory = get_session_factory()

    with session_factory() as session:
        yield session


def get_repository(
    session: Annotated[Session, Depends(get_session)],
) -> ApplicationRepository:
    return SqlAlchemyApplicationRepository(session)
