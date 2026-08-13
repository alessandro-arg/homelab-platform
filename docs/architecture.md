# Architecture

## Current Scope

The current system is a containerized FastAPI backend application for managing internship applications, deployed as a persistent service on an ARM64 Raspberry Pi.

The backend provides a REST API with complete CRUD operations. Application data is stored persistently in PostgreSQL and remains available when the application and database containers are restarted or recreated.

The current architecture includes:

- FastAPI for the HTTP API
- Pydantic for API validation
- A repository abstraction for data access
- SQLAlchemy for database access
- PostgreSQL for persistent storage
- Psycopg as the PostgreSQL driver
- Alembic for database schema migrations
- Dependency injection for repository and database-session management
- Docker for the FastAPI application image
- Docker Compose for application orchestration and networking
- Container health checks and startup dependencies
- Automated unit, API, repository, PostgreSQL integration, and container smoke tests
- ARM64 Raspberry Pi deployment
- Deployment-specific host network bindings
- Docker restart policies for long-running services
- GitHub Actions continuous integration
- GitHub-hosted validation runners
- Ephemeral Tailscale connectivity for deployment
- Automated Raspberry Pi deployment over OpenSSH
- Exact-commit deployment verification
- Automated post-deployment migration and health validation

Authentication, a frontend, and external services are not part of the current architecture.

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
- Committing successful changes
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

`Settings` supports either a complete `DATABASE_URL` or individual PostgreSQL configuration values:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_HOST`
- `DATABASE_PORT`

When a complete `DATABASE_URL` is not supplied, the application constructs the PostgreSQL connection URL using SQLAlchemy's `URL.create()`.

Database credentials are therefore not hard-coded into the application source code.

A local or deployment-specific `.env` file can provide configuration, while `.env.example` documents the expected variables without storing real credentials in Git.

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

### Containerized Runtime Architecture

The application runtime is orchestrated with Docker Compose.

The normal application stack contains three services:

- `postgres` - persistent PostgreSQL database
- `migrate` - Alembic migration service
- `backend` - FastAPI application

A separate `postgres_test` service is available through the `test` Compose profile for isolated PostgreSQL integration testing.

The normal startup sequence is:

```text
PostgreSQL container
        |
        | health check succeeds
        v
Migration container
        |
        | alembic upgrade head
        | exits successfully
        v
FastAPI container
        |
        | health check succeeds
        v
Application ready
```

The migration service is built from the same Dockerfile and application source as the FastAPI service, but overrides the image's default command to execute Alembic.

The backend does not start unless the migration service completes successfully.

Docker Compose provides an internal network and DNS resolution between services.

Host-side development connects to PostgreSQL through:

```text
localhost:5432
```

Inside Docker Compose, the backend and migration services connect through:

```text
postgres:5432
```

The hostname `postgres` is the Docker Compose service name.

Inside the backend container, `localhost` refers to the backend container itself and therefore cannot be used to reach PostgreSQL.

The FastAPI container publishes port `8000` through the configurable `BACKEND_BIND_ADDRESS`.

The default host binding is:

```text
127.0.0.1:8000
```

For the Raspberry Pi deployment, `BACKEND_BIND_ADDRESS` is set to the Raspberry Pi's trusted LAN address so the API can be reached by other devices on the local network.

PostgreSQL remains published only on:

```text
127.0.0.1:5432
```

so the database is not directly exposed to the local network.

The backend health check calls the `/health` endpoint from inside the container. PostgreSQL uses `pg_isready` for its health check.

### Raspberry Pi Deployment Architecture

The production-like homelab deployment runs the Docker Compose stack on an ARM64 Raspberry Pi running Ubuntu Server.

The deployed request path is:

```text
LAN Client
    |
    | HTTP :8000
    v
Raspberry Pi
    |
    v
FastAPI container
    |
    | Docker Compose network
    v
PostgreSQL container
    |
    v
postgres_data named volume
```

The backend is exposed only through the Raspberry Pi's trusted LAN address.

PostgreSQL is not directly exposed to LAN clients. The backend and migration services communicate with PostgreSQL through the internal Docker Compose network using `postgres:5432`.

Deployment-specific credentials are stored in an untracked `.env` file on the Raspberry Pi.

The `backend` and `postgres` services use `restart: unless-stopped`, allowing them to recover automatically when Docker starts after a normal Raspberry Pi reboot.

### CI/CD Architecture

Pull requests and pushes to `main` are validated using GitHub-hosted runners.

The validation pipeline contains three independent jobs:

- Fast Python tests
- PostgreSQL integration testing
- Docker Compose and container smoke validation

Pull requests never receive deployment access.

Deployment occurs only for successful pushes to `main`.

The deployment path is:

```text
GitHub main
    |
    | push
    v
GitHub Actions
    |
    | validation succeeds
    v
Ephemeral Tailscale node
    |
    | TCP 22
    v
OpenSSH on Raspberry Pi
    |
    v
/opt/homelab-platform
    |
    | exact commit verification
    v
Docker Compose
    |
    +--> Alembic migration
    |
    +--> FastAPI
    |
    v
PostgreSQL named volume
```

The GitHub-hosted deployment runner authenticates to Tailscale using OpenID Connect workload identity rather than a persistent self-hosted GitHub runner.

SSH uses a dedicated deployment key and strict host-key verification.

The deployment script refuses to continue when:

- the Raspberry Pi checkout is not on `main`
- the checkout contains local changes
- `origin/main` does not match the GitHub commit being deployed
- the Git history cannot be fast-forwarded
- Alembic migration fails
- the backend does not become healthy
- post-deployment API validation fails

Deployment-specific credentials remain stored in the Raspberry Pi's untracked `.env` file.

The PostgreSQL named volume is not removed during automated deployment.

### PostgreSQL

PostgreSQL is the persistent data store.

In the containerized application stack, PostgreSQL runs as the `postgres` Docker Compose service.

The development database uses the `postgres_data` named volume:

```text
PostgreSQL container
        |
        v
postgres_data named volume
```

The container itself is disposable. Database files are stored in the named volume, allowing application data to remain available when the PostgreSQL container is restarted or recreated.

A separate `postgres_test` service is available for integration testing.

The test database does not use the development database's persistent volume and can be removed safely after integration tests.

### Alembic Migrations

Database schema changes are managed using Alembic.

Migration configuration is stored in:

```text
backend/alembic.ini
backend/migrations/
```

Alembic uses the application's `DATABASE_URL` and SQLAlchemy `Base.metadata`.

The current migration history contains the initial migration that creates the `applications` table with its required schema.

During normal container startup, the `migrate` Compose service executes:

```bash
alembic -c alembic.ini upgrade head
```

The migration service starts only after PostgreSQL becomes healthy.

The FastAPI backend starts only after the migration service exits successfully.

This ensures that the database schema is upgraded before the application begins serving requests.

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

The next phase focuses on monitoring and operational visibility for the deployed homelab services.

Later phases may introduce:

- Monitoring
- A web frontend
- Authentication
- Kubernetes
