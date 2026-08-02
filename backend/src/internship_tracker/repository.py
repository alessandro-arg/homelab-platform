from internship_tracker.models import Application, ApplicationCreate


class ApplicationRepository:
    def __init__(self) -> None:
        self._applications: dict[int, Application] = {}
        self._next_id = 1

    def create(self, application_data: ApplicationCreate) -> Application:
        application = Application(
            id=self._next_id,
            **application_data.model_dump(),
        )

        self._applications[application.id] = application
        self._next_id += 1

        return application
