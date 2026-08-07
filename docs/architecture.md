# Architecture

## Current Scope

The current system is a FastAPI backend application for managing internship applications.

The backend provides a REST API with complete CRUD operations. Application data is stored persistently in PostgreSQL and remains available when the backend process restarts.

The current architecture includes:

- FastAPI for the HTTP API
- Pydantic for API validation
- A repository abstraction for data access
- SQLAlchemy for database access
- PostgreSQL for persistent storage
- Psycopg as the PostgreSQL driver
- Alembic for database schema migrations
- Dependency injection for repository and database-session management
- Automated unit, API, repository, and PostgreSQL integration tests

Authentication, a frontend, application containerization, deployment, and external services are not part of the current architecture.

## Components

### FastAPI Application

The FastAPI application is defined in `main.py`:

- Exposing HTTP endpoints
- Receiving and validating request data
- Calling the application repository
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

The HTTP layer does not directly contain SQL or database-specific logic.

### API Models

The API models are defined in `models.py` using Pydantic.

`ApplicationCreate` represents data supplied by an API client.

`Application` extends the application data with the system-generated application ID.

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

The models represent the API contract and are kept separate from the SQLAlchemy database model.

### Repository Contract

The repository contract is defined in `repository.py`.

The FastAPI endpoints depend on this contract instead of depending directly on PostgreSQL or SQLAlchemy.

The repository defines operations for:

- Creating applications
- Listing applications
- Retrieving an application
- Updating an application
- Deleting an application

This keeps HTTP behavior separate from storage behavior.

Two repository implementations are currently used:

- `InMemoryApplicationRepository`
- `SqlAlchemyApplicationRepository`

### In-Memory Repository

The in-memory repository is retained for fast and isolated API tests.

Applications are stored in a Python dictionary while the repository instance exists.

It is not used as the application's persistent production storage.

Keeping this implementation allows API endpoint behavior to be tested without requiring PostgreSQL for every test.

### SQLAlchemy Repository

The PostgreSQL-backed repository is implemented in `sqlalchemy_repository.py`

`SqlAlchemyApplicationRepository` uses a SQLAlchemy `Session` to perform application CRUD operations.

It is responsible for:

- Converting API models into database records
- Creating database records
- Querying applications
- Updating records
- Deleting records
- Committing successfull changes
- Rolling back failed database transactions
- Converting database records back into API models

The repository does not contain HTTP-specific behavior.

For example, an unknown application returns `None` or `False`. The FastAPI layer converts those results into HTTP `404` responses.

### Database Model

The database model is defined in `database_models.py`.

`ApplicationRecord` maps the `applications` PostgreSQL table using SQLAlchemy ORM.

The database model is separate from the Pydantic API models.

This separation allows the API contract and database representation to evolve independently.

### Database Configuration

Database configuration is defined in `config.py`.

`Settings` reads the database connection URL from the `DATABASE_URL` environment variable.

Database credentials are therefore not hard-coded into the application source code.

A local `.env` file can provide the development configuration, while `.env.example` documents the required variables without storing real credentials in Git.

### Database Engine and Sessions

Database engine and session creation are defined in `database.py`.

SQLAlchemy provides:

- The database engine
- Connection management
- Session creation

The engine is configured with connection health checking using `pool_pre_ping`.

Sessions are created with a shared session factory.

### Dependency Injection

Database dependencies are defined in `dependencies.py`.

The dependency chain is:

```text
Settings
   |
   v
SQLAlchemy Engine
   |
   v
Session Factory
   |
   v
Database Session
   |
   v
SqlAlchemyApplicationRepository
   |
   v
FastAPI Endpoint
```

FastAPI creates a database session for a request and closes it after the request has finished.

The production application receives `SqlAlchemyApplicationRepository`.

During isolated API tests, FastAPI's dependency override mechanism replaces the production repository with a fresh `InMemoryApplicationRepository`.

### PostgreSQL

PostgreSQL is the persistent data store.

For local development, PostgreSQL runs as a Compose service.

The development database uses a named volume so that its data remains available when the PostgreSQL container is restarted or recreated.

A separate PostgreSQL test service is available for integration testing.

The test database does not use the development database's persistent volume and is safe to clean between tests.

### Alembic Migrations

Database schema changes are managed using Alembic.

Migration configuration is stored in:

```text
backend/alembic.ini
backend/migrations/
```

Alembic uses the application's `DATABASE_URL` and SQLAlchemy `Base.metadata`.

This allows the database schema to be created and upgraded from migration files instead of relying on application startup to create tables automatically.

The current migrations create the `applications` table and enforce the required application date.

## Request Flow

A normal application request follows this path:

```text
Client
   |
   | HTTP request
   v
FastAPI endpoint
   |
   | validated Pydantic model
   v
ApplicationRepository contract
   |
   v
SqlAlchemyApplicationRepository
   |
   v
SQLAlchemy Session
   |
   v
PostgreSQL
```

The result travels back through the same layers:

```text
PostgreSQL
   |
   v
SQLAlchemy record
   |
   v
Application model
   |
   v
FastAPI response
   |
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
SqlAlchemyApplicationRepository.create()
        |
        v
ApplicationRecord
        |
        v
SQLAlchemy commit
        |
        v
PostgreSQL
        |
        v
Application response
        |
        v
HTTP 201 Created
```

## Project Structure

```text
backend/
├── alembic.ini
├── migrations/
│   ├── env.py
│   └── versions/
├── pyproject.toml
├── src/
│   └── internship_tracker/
│       ├── __init__.py
│       ├── config.py
│       ├── database.py
│       ├── database_models.py
│       ├── dependencies.py
│       ├── main.py
│       ├── models.py
│       ├── repository.py
│       └── sqlalchemy_repository.py
└── tests/
    ├── integration/
    │   └── test_postgresql.py
    ├── test_applications.py
    ├── test_config.py
    ├── test_database.py
    ├── test_database_models.py
    ├── test_health.py
    ├── test_models.py
    └── test_sqlalchemy_repository.py
```

## Testing Strategy

The test suite uses several levels of testing.

### API Tests

FastAPI endpoint tests use `TestClient` together with a fresh `InMemoryApplicationRepository`.

These tests verify HTTP behavior without requiring a database.

They cover:

- Application creation
- Listing
- Retrieval
- Updating
- Deletion
- HTTP `404` behavior
- Request validation

### Repository Tests

`SqlAlchemyApplicationRepository` is tested using an in-memory SQLite database.

These tests verify the repository's CRUD behavior quickly without starting an external PostgreSQL service.

### PostgreSQL Integration Test

A separate integration test uses a real PostgreSQL test database.

It verifies the complete persistent path:

```text
FastAPI
|
v
SQLAlchemy repository
|
v
Psycopg
|
v
PostgreSQL
```

The integration test also applies the real Alembic migrations before exercising the database.

The test database is cleaned so that integration tests have isolated database state.

Integration tests are marked with:

```text
integration
```

This allows fast tests and database integration tests to be run separately.

## Current Technical Decisions

### Repository Pattern

FastAPI endpoints depend on an application repository contract rather than SQLAlchemy directly.

This keeps HTTP logic independent from storage implementation details and makes isolated API testing straightforward.

### Separate API and Database Models

Pydantic models represent data entering and leaving the API.

SQLAlchemy models represent database tables.

Keeping these responsibilities separate avoids coupling the public API directly to the database schema.

### Environment-Based Configuration

Database connection information is supplied through environment variables.

Real database credentials are kept outside the Git repository.

### Alembic for Schema Management

Database tables are managed through migrations rather than being automatically created when the API starts.

This gives the database schema an explicit and version-controlled history.

### Full Replacement Updates

`PUT /applications/{application_id}` replaces all editable application fields.

Fields omitted from the request receive their model default values.

A future partial-update endpoint would use `PATCH`.

### Source Layout

The backend uses a `src` project layout to keep application code separate from configuration and tests.

### Layered Testing

The project intentionally uses different testing levels:

```text
many fast isolated tests
+
repository tests
+
a small number of real PostgreSQL integration tests
```

This provides useful confidence without making the whole test suite dependent on an external database.

## Future Architecture

The next phase focuses on containerization.

Later phases may introduce:

- Application containers
- Raspberry Pi deployment
- CI/CD
- Monitoring
- A web frontend
- Authentication
- Kubernetes
