from typing import Annotated

from fastapi import Depends, FastAPI, status

from internship_tracker.models import Application, ApplicationCreate
from internship_tracker.repository import ApplicationRepository


app = FastAPI(title="Internship Application Tracker")

repository = ApplicationRepository()


def get_repository() -> ApplicationRepository:
    return repository


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}


@app.post(
    "/applications",
    response_model=Application,
    status_code=status.HTTP_201_CREATED,
)
def create_application(
    application_data: ApplicationCreate,
    application_repository: Annotated[
	ApplicationRepository,
	Depends(get_repository),
    ],
) -> Application:
    return application_repository.create(application_data)


@app.get(
    "/applications",
    response_model=list[Application],
)
def list_applications(
    application_repository: Annotated[
        ApplicationRepository,
        Depends(get_repository),
    ],
) -> list[Application]:
    return application_repository.list_all()
