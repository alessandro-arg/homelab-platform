from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status

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


@app.get(
    "/applications/{application_id}",
    response_model=Application,
)
def get_application(
    application_id: int,
    application_repository: Annotated[
        ApplicationRepository,
        Depends(get_repository),
    ],
) -> Application:
    application = application_repository.get_by_id(application_id)

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return application


@app.put(
    "/applications/{application_id}",
    response_model=Application,
)
def update_application(
    application_id: int,
    application_data: ApplicationCreate,
    application_repository: Annotated[
        ApplicationRepository,
        Depends(get_repository),
    ],
) -> Application:
    application = application_repository.update(
        application_id,
        application_data,
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return application
