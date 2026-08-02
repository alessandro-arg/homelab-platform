# Architecture

## Current Scope

The current system is a single FastAPI backend application.

Application data will initially be stored in memory. A persistent database, frontend, container deployment, and external services are not part of the current architecture.

## Components

### FastAPI Application

The FastAPI application:

- Exposes HTTP endpoints
- Validates incoming requests
- Returns JSON responses
- Generates OpenAPI documentation

### Automated Tests

The test suite:

- Uses pytest
- Sends requests directly to the FastAPI application
- Verifies HTTP status codes and response data

## Current Request Flow

```text
Client
  |
  | HTTP request
  v
FastAPI endpoint
  |
  | Python response
  v
JSON response
```

## Project Structure

```text
backend/
├── pyproject.toml
├── src/
│   └── internship_tracker/
│       ├── __init__.py
│       └── main.py
└── tests/
    └── test_health.py
```

## Current Technical Decisions

- Python is used for backend development.
- FastAPI is used to build the REST API.
- pytest is used for automated testing.
- A `src` project layout is used.
- Application data will initially be stored in memory.
- PostgreSQL will be introduced in a later phase.

## Future Architecture

Later phases may introduce:

- PostgreSQL
- Podman containers
- Raspberry Pi deployment
- CI/CD
- Monitoring
- A web frontend
- Kubernetes

