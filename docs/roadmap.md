# Project Roadmap

## Phase 1: Backend Foundation - **Completed**

### Goal

Build the first working version of the Internship Application Tracker backend.

The backend provides a documented REST API that manages internship applications in memory. This phase established a clean Python project structure, request validation, error handling, dependency injection, and automated tests.

Persistent database storage is not included in this phase.

### Completed Deliverables

- A structured Python backend project
- A FastAPI application that starts locally
- A health-check endpoint
- An endpoint to create an internship application
- An endpoint to list all internship applications
- An endpoint to retrieve one internship application
- An endpoint to update an internship application
- An endpoint to delete an internship application
- Request and response validation
- HTTP `404` handling for unknown applications
- An isolated in-memory repository for automated tests
- Automated model and API tests
- Interactive OpenAPI documentation through Swagger
- Documentation explaining how to install, run, test, and use the backend locally

### Definition of Done

- [x] The FastAPI application starts locally without errors
- [x] `GET /health` returns HTTP `200`
- [x] An internship application can be created
- [x] All existing internship applications can be listed
- [x] A single application can be retrieved by its identifier
- [x] An existing application can be updated
- [x] An existing application can be deleted
- [x] Invalid request data produces a clear client error
- [x] Requesting an unknown application produces HTTP `404`
- [x] Application data remains available while the process is running
- [x] Automated tests verify the main API operations
- [x] All automated tests pass
- [x] The complete CRUD flow has been verified manually through Swagger
- [x] The local setup and start commands are documented

### Phase 1 Result

Phase 1 was completed with:

- A working in-memory CRUD API
- Six available HTTP endpoints
- Domain validation using Pydantic
- Repository dependency injection
- Automated test isolation
- 15 passing tests

Application data is intentionally temporary and is deleted when the backend process stops.

## Phase 2: Persistent Storage - **Completed**

### Goal

Replace the temporary in-memory application storage with PostgreSQL while preserving the existing API behavior.

This phase introduced database configuration, SQLAlchemy models, Alembic migrations, a database-backed repository, and automated PostgreSQL integration testing.

### Technical Direction

- PostgreSQL as the relational database
- SQLAlchemy for database access
- Psycopg as the PostgreSQL driver
- Alembic for database migrations
- Environment variables for database configuration
- Separate API models and database models
- Repository-based separation between HTTP and database logic
- Isolated database integration tests

### Completed Deliverables

- A repository contract independent of the storage implementation
- A retained in-memory repository for fast isolated API tests
- Database engine and session configuration
- A SQLAlchemy application table model
- Alembic database migrations
- An initial Alembic migration
- A PostgreSQL-backed application repository
- FastAPI database-session dependency injection
- Persistent CRUD operations
- An isolated PostgreSQL service for integration testing
- Automated PostgreSQL integration testing
- Local database setup and migration documentation

### Definition of Done

- [x] PostgreSQL can be configured without hard-coded credentials
- [x] The database schema can be created from an empty database using Alembic
- [x] All CRUD endpoints store and retrieve data through PostgreSQL
- [x] Existing endpoint paths and response formats remain unchanged
- [x] Application data remains available after restarting the backend
- [x] Unknown application IDs still return HTTP 404
- [x] Tests use isolated database state
- [x] Existing validation behavior remains unchanged
- [x] All automated tests pass
- [x] The persistent CRUD flow is verified manually through Swagger
- [x] Database setup, migrations, and local development commands are documented

### Phase 2 Result

- PostgreSQL-backed persistent application storage
- SQLAlchemy ORM models and repository implementation
- Alembic-managed database schema migrations
- Environment-based database configuration
- FastAPI database-session dependency injection
- Separate fast and PostgreSQL integration test layers
- 30 passing automated tests
- Verified persistence across backend restarts

The API contract established in Phase 1 remains unchanged while application data is now stored persistently in PostgreSQL.

## Phase 3: Containerization

### Goal

### Deliverables

### Definition of Done

## Phase 4: Raspberry Pi Deployment

### Goal

### Deliverables

### Definition of Done

## Phase 5: Automation and CI/CD

### Goal

### Deliverables

### Definition of Done

## Phase 6: Monitoring and Homelab Dashboard

### Goal

### Deliverables

### Definition of Done

## Phase 7: Kubernetes

### Goal

### Deliverables

### Definition of Done
