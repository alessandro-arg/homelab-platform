# Homelab Platform

A self-hosted platform for managing internship applications and, later, homelab services.

## Current Status

Phase 1: Backend Foundation - **Completed**

Phase 2: Persistent Storage - **Completed**

The project currently provides:

- A FastAPI REST API
- An application domain model with Pydantic validation
- Complete CRUD operations for internship applications
- PostgreSQL-backed persistent storage
- SQLAlchemy-based database access
- Alembic database migrations
- Repository-based separation between API and storage logic
- HTTP `404` handling for unknown applications
- Interactive OpenAPI documentation through Swagger UI
- Automated testing with pytest
- Isolated PostgreSQL integration testing

Application data is stored persistently in PostgreSQL and remains available when the FastAPI backend restarts.

## Available API Endpoints

| Method   | Endpoint                         | Description                          |
| -------- | -------------------------------- | ------------------------------------ |
| `GET`    | `/health`                        | Check whether the backend is healthy |
| `POST`   | `/applications`                  | Create an internship application     |
| `GET`    | `/applications`                  | List all internship applications     |
| `GET`    | `/applications/{application_id}` | Retrieve one application             |
| `PUT`    | `/applications/{application_id}` | Replace an existing application      |
| `DELETE` | `/applications/{application_id}` | Delete an application                |

## Project Goals

- Build an internship application tracker
- Learn backend development with Python and FastAPI
- Build the application around persistent PostgreSQL storage
- Containerize the application with Podman
- Deploy it to a Raspberry Pi
- Add automation, CI/CD, monitoring, and Kubernetes later

## Repository Structure

```text
homelab-platform/
├── backend/
│   ├── alembic.ini
│   ├── migrations/
│   │   ├── env.py
│   │   └── versions/
│   ├── pyproject.toml
│   ├── src/
│   │   └── internship_tracker/
│   │       ├── __init__.py
│   │       ├── config.py
│   │       ├── database.py
│   │       ├── database_models.py
│   │       ├── dependencies.py
│   │       ├── main.py
│   │       ├── models.py
│   │       ├── repository.py
│   │       └── sqlalchemy_repository.py
│   └── tests/
│       ├── integration/
│       │   └── test_postgresql.py
│       ├── test_applications.py
│       ├── test_config.py
│       ├── test_database.py
│       ├── test_database_models.py
│       ├── test_health.py
│       ├── test_models.py
│       └── test_sqlalchemy_repository.py
├── docs/
│   ├── architecture.md
│   ├── domain-model.md
│   ├── project.md
│   └── roadmap.md
├── .env.example
├── compose.yaml
└── README.md
```

## Local Development

### Requirements

- Python 3.12 or newer
- Docker with Docker Compose

### Python Setup

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --editable ".[dev]"
cd ..
```

### Database Configuration

Create a local environment file from the example:

```bash
cp .env.example .env
```

Update the values in `.env` with your local PostgreSQL password.

The `.env` file contains credentials and must not be committed to Git.

### Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
```

Check the database container:

```bash
docker compose ps postgres
```

### Run Database Migrations

From the repository root, with the Python virtual environment active:

```bash
alembic -c backend/alembic.ini upgrade head
```

Alembic applies all database migrations required by the current application version.

### Run the API

From the repository root:

```bash
fastapi dev backend/src/internship_tracker/main.py
```

The API is available at:

- Health check: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

### Run Tests

From the repository root:

```bash
cd backend
python -m pytest -v
```

Run only the fast tests:

```bash
python -m pytest -m "not integration" -v
```

Run only the PostgreSQL integration test.

Start the PostgreSQL test database:

```bash
docker compose -f ../compose.yaml up -d postgres_test
```

Then run the integration test:

```bash
python -m pytest -m integration -v
```

## Current Limitations

- Authentication and multiple users are not supported.
- A frontend is not included yet.
- The FastAPI application itself is not containerized yet.
- Deployment to the Raspberry Pi is not implemented yet.
- CI/CD and monitoring are not implemented yet.

## Documentation

- [Project Definition](docs/project.md)
- [Project Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Domain Model](docs/domain-model.md)

## License

A license has not yet been selected.
