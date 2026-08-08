from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from internship_tracker.database_models import ApplicationRecord
from internship_tracker.models import Application, ApplicationCreate


class SqlAlchemyApplicationRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(
        self,
        application_data: ApplicationCreate,
    ) -> Application:
        record = ApplicationRecord(
            company_name=application_data.company_name,
            position_title=application_data.position_title,
            status=application_data.status.value,
            application_date=application_data.application_date,
            contact_person=application_data.contact_person,
            contact_email=(
                str(application_data.contact_email)
                if application_data.contact_email is not None
                else None
            ),
            job_url=(
                str(application_data.job_url)
                if application_data.job_url is not None
                else None
            ),
            notes=application_data.notes,
        )

        self._session.add(record)
        self._commit()

        return self._to_application(record)

    def list_all(self) -> list[Application]:
        statement = select(ApplicationRecord).order_by(
            ApplicationRecord.id
        )
        records = self._session.scalars(statement).all()

        return [
            self._to_application(record)
            for record in records
        ]

    def get_by_id(
        self,
        application_id: int,
    ) -> Application | None:
        record = self._session.get(
            ApplicationRecord,
            application_id,
        )

        if record is None:
            return None

        return self._to_application(record)

    def update(
        self,
        application_id: int,
        application_data: ApplicationCreate,
    ) -> Application | None:
        record = self._session.get(
            ApplicationRecord,
            application_id,
        )

        if record is None:
            return None

        record.company_name = application_data.company_name
        record.position_title = application_data.position_title
        record.status = application_data.status.value
        record.application_date = application_data.application_date
        record.contact_person = application_data.contact_person
        record.contact_email = (
            str(application_data.contact_email)
            if application_data.contact_email is not None
            else None
        )
        record.job_url = (
            str(application_data.job_url)
            if application_data.job_url is not None
            else None
        )
        record.notes = application_data.notes

        self._commit()

        return self._to_application(record)

    def delete(self, application_id: int) -> bool:
        record = self._session.get(
            ApplicationRecord,
            application_id,
        )

        if record is None:
            return False

        self._session.delete(record)
        self._commit()

        return True

    def _commit(self) -> None:
        try:
            self._session.commit()
        except SQLAlchemyError:
            self._session.rollback()
            raise

    @staticmethod
    def _to_application(
        record: ApplicationRecord,
    ) -> Application:
        return Application(
            id=record.id,
            company_name=record.company_name,
            position_title=record.position_title,
            status=record.status,
            application_date=record.application_date,
            contact_person=record.contact_person,
            contact_email=record.contact_email,
            job_url=record.job_url,
            notes=record.notes,
        )
