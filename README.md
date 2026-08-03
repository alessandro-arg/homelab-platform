# Homelab Platform

A self-hosted platform for managing internship applications and, later, homelab services.

## Current Status

Phase 1: Backend Foundation - **Completed**

The project currently provides:

- A FastAPI REST API
- An application domain model with validation
- In-memory application storage
- Complete CRUD operations for internship applications
- HTTP `404` handling for unknown applications
- Interactive OpenAPI documentation through Swagger
- Automated testing with pytest

Application data is currently stored only in memory and is cleared whenever the backend process restarts.

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
- Add persistent database storage
- Containerize the application with Podman
- Deploy it to a Raspberry Pi
- Add automation, CI/CD, monitoring, and Kubernetes later

## Repository Structure

```text
homelab-platform/
├── backend/
│   ├── pyproject.toml
│   ├── src/
│   │   └── internship_tracker/
│   │       ├── __init__.py
│   │       ├── main.py
│   │       ├── models.py
│   │       └── repository.py
│   └── tests/
│       ├── test_applications.py
│       ├── test_health.py
│       └── test_models.py
├── docs/
│   ├── architecture.md
│   ├── domain-model.md
│   ├── project.md
│   └── roadmap.md
├── infrastructure/
└── README.md
```

## Local Development

### Requirements

- Python 3.12 or newer

### Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --editable ".[dev]"
```

### Run the API

From the `backend` directory:

```bash
python -m uvicorn internship_tracker.main:app --reload
```

The API is available at:

- Health check: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

### Run Tests

From the repository root, with the virtual environment active:

```bash
python -m pytest -v
```

## Current Limitations

- Application data is not persistent.
- Restarting the backend clears all stored applications.
- Authentication and multiple users are not supported.
- A frontend is not included yet.

Persistent storage will be introduced in Phase 2.

## Documentation

- [Project Definition](docs/project.md)
- [Project Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Domain Model](docs/domain-model.md)

## License

A license has not yet been selected.
