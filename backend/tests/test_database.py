from sqlalchemy.orm import Session

from internship_tracker.database import (
    create_database_engine,
    create_session_factory
)


DATABASE_URL = "sqlite+pysqlite:///:memory:"


def test_create_database_engine_uses_database_url():
    engine = create_database_engine(DATABASE_URL)

    try:
        assert engine.url.drivername == "sqlite+pysqlite"
        assert engine.url.database == ":memory:"
    finally:
        engine.dispose()


def test_create_session_factory_binds_sessions_to_engine():
    engine = create_database_engine(DATABASE_URL)
    session_factory = create_session_factory(engine)

    try:
        with session_factory() as session:
            assert isinstance(session, Session)
            assert session.get_bind() is engine
            assert session.expire_on_commit is False
    finally:
        engine.dispose()
