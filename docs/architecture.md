# Architecture

## Current Scope

The current system is a single FastAPI backend application for managing internship applications.

The backend provides a REST API with complete CRUD operations. Application data is stored in memory, so it remains available only while the backend process is running.

Persisten sotrage, authentication, a frontend, container deployment, and external services are not part of the current architecture.

## Components

### FastAPI Application

The FastAPI application is defined in `main.py`:

- Exposing HTTP endpoints
- Receiving and validating request data
- Converting repository results into HTTP responses
- Returning HTTP `404` errors for unknown applications
- Generating OpenAPI and Swagger documentation

The API currently exposes:

- `GET /health`
- `POST /applications`
- `GET /applications`
- `GET /applications/{application_id}`
- `PUT /applications/{application_id}`
- `DELETE /applications/{application_id}`

### Domain Models

The application models are defined in `models.py` using Pydantic.

`ApplicationCreate` represents data supplied by an API client.

`Application` extends `ApplicationCreate` and adds the system-generated application ID.

The models validate:

- Required company names
- Allowed application statuses
- Dates
- Email addresses
- URLs
- Optional text fields
- The maximum notes lenght

The available application statuses are:

- `applied`
- `interview`
- `rejected`
- `offer`

### In-Memory Repository

The repository is defined in `repository.py`.

It is responsible for:

- Storing applications
- Generating application IDs
- Creating applications
- Listing applications
- Retrieving one application
- Update an application
- Deleting an application

Applications are stored in a Python dictionary:

```text
application ID -> Application object
```

The repository does not contain HTTP-specific behavior. For example, it returns `None` or `False` when an application does not exist. The FastAPI layer converts those results into HTTP `404` responses.

### Dependency Injection

FastAPI dependency injection provides the repository to API endpoint.

The production application uses one shared in-memory repository instance.

During tests, this dependency is replaced with a fresh repository for each test. This prevents data created in one test from affecting another test.

### Automated Tests

The test suite uses pytest and FastAPI's `TestClient`.

The tests verify:

- Health-check behavior
- Domain-model validation
- Application creation
- Application listing
- Retrieving an application
- Updating an application
- Deleting an application
- HTTP `404` behavior
- Test isolation

## Request Flow

```text
Client
  |
  | HTTP request
  v
FastAPI endpoint
  |
  | validated Pydantic model
  v
ApplicationRepository
  |
  | Application, list, None, or boolean result
  v
FastAPI endpoint
  |
  | HTTP status and JSON response
  v
Client
```

Example creation flow:

```text
POST /applications
        |
        v
ApplicationCreate validation
        |
        v
ApplicationRepository.create()
        |
        v
Application with generated ID
        |
        v
HTTP 201 Created
```

## Project Structure

```text
backend/
├── pyproject.toml
├── src/
│   └── internship_tracker/
│       ├── __init__.py
│       ├── main.py
│       ├── models.py
│       └── repository.py
└── tests/
    ├── test_applications.py
    ├── test_health.py
    └── test_models.py
```

## Current Technical Decisions

### Python and FastAPI

Python is used for backend development, and FastAPI provides the REST API, validation integration, dependency injection, and OpenAPI documentation.

### Pydantic Models

Pydantic models define and validate the data entering and leaving the API.

Separate creation and stored-resource models prevent clients from supplying system-generated IDs.

### Repository Pattern

Data access is separated from HTTP endpoint logic through `ApplicationRepository`.

This makes it easier to replace the in-memory implementation with a database-backed implementation later.

### In-Memory Storage

In-memory storage keeps Phase 1 simple and allows the project to focus on API design, validation, error handling, and testing.

Its limitations are:

- Data is lost when the process stops.
- Multiple backend processes would not share data.
- It is not suitable for production use.

### Full Replacement Updates

`PUT /applications/{application_id}` replaces all editable application fields.

Fields omitted from the request receive their model default values. A future partial-update endpoint would use `PATCH`.

### Source Layout

The backend uses a `src` project layout to keep application code separate from configuration and tests.

### Automated Testing

Every API test receives a fresh repository through dependency overrides. This keeps tests independent and repeatable.

## Future Architecture

Phase 2 will replace in-memory storage with persistent database storage.

Later phases may introduce:

- PostgreSQL
- Database migrations
- Podman containers
- Raspberry Pi deployment
- CI/CD
- Monitoring
- A web frontend
- Authentication
- Kubernetes
