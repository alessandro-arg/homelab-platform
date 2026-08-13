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

## Phase 3: Containerization - **Completed**

### Goal

Containerize the FastAPI backend and run the complete application stack with Docker Compose.

FastAPI and PostgreSQL should run as separate containers and communicate through the Docker Compose network. The containerized setup must preserve the existing API behavior and PostgreSQL persistence established in Phase 2.

### Completed Deliverables

- A Docker image for the FastAPI backend
- A backend service added to `compose.yaml`
- Container-specific database configuration using the PostgreSQL Compose service name
- Docker Compose networking between FastAPI and PostgreSQL
- Database migrations that can be executed against the containerized PostgreSQL service
- Startup ordering and health checks for the application stack
- Persistent PostgreSQL storage through the existing Docker volume
- Automated validation of the containerized backend
- Manual verification of CRUD operations through the containerized API
- Documentation for building, starting, stopping, inspecting, and rebuilding the containerized stack

### Definition of Done

- [x] The FastAPI backend image builds successfully
- [x] The FastAPI backend starts successfully as a Docker Compose service
- [x] PostgreSQL starts successfully as a Docker Compose service
- [x] FastAPI connects to PostgreSQL through the Docker Compose network
- [x] The backend does not depend on `localhost` for communication with PostgreSQL inside containers
- [x] Alembic migrations can initialize an empty containerized PostgreSQL database
- [x] `GET /health` returns HTTP `200` through the exposed backend container port
- [x] All CRUD endpoints work while FastAPI and PostgreSQL are containerized
- [x] Application data remains available after restarting the backend container
- [x] PostgreSQL data remains available after recreating the PostgreSQL container
- [x] Existing automated tests continue to pass
- [x] Container-specific automated validation passes
- [x] The complete containerized workflow has been verified manually
- [x] Build, startup, shutdown, migration, testing, and troubleshooting commands are documented

### Phase 3 Result

Phase 3 was completed with:

- A Docker image for the FastAPI backend
- Docker Compose orchestration for FastAPI and PostgreSQL
- Internal Compose networking using postgres:5432
- Automatic Alembic migrations before backend startup
- PostgreSQL and FastAPI container health checks
- Startup dependencies based on service health and migration completion
- Persistent PostgreSQL storage through the postgres_data named volume
- An optional isolated PostgreSQL test service
- Automated container smoke validation
- 30 passing fast tests
- 1 passing PostgreSQL integration test
- Verified CRUD operations through the containerized API
- Verified persistence across backend restarts and PostgreSQL container recreation
- Verified initialization from an empty PostgreSQL volume

The complete application backend can now be built and started with Docker Compose while preserving the API behavior and persistent storage established in the previous phases.

## Phase 4: Raspberry Pi Deployment - **Completed**

### Goal

Deploy the existing containerized FastAPI and PostgreSQL application stack to the Raspberry Pi and operate it reliably as a persistent service on the local network.

The deployment should preserve the container architecture established in Phase 3, keep credentials outside Git, expose only the services that actually need LAN access, survive normal container and Raspberry Pi restarts, and provide documented procedures for deployment and basic operation.

### Completed Deliverables

- Raspberry Pi prepared to run Docker workloads
- Docker Engine and Docker Compose available on the Raspberry Pi
- Application repository deployed to the Raspberry Pi
- Deployment-specific environment configuration stored outside Git
- FastAPI, migration, and PostgreSQL services running on the Raspberry Pi
- PostgreSQL accessible only where required by the application stack
- FastAPI accessible from the trusted local network
- Successful container operation on the Raspberry Pi architecture
- Persistent PostgreSQL storage on the Raspberry Pi
- Reliable application recovery after Raspberry Pi restart
- Manual deployment and update workflow
- Deployment validation from another machine on the local network
- Raspberry Pi deployment and operational documentation

### Definition of Done

- [x] Docker Engine and Docker Compose run successfully on the Raspberry Pi
- [x] The repository can be deployed to the Raspberry Pi from a clean checkout
- [x] Deployment credentials and secrets are not committed to Git
- [x] The complete application stack builds and starts successfully on the Raspberry Pi
- [x] PostgreSQL becomes healthy before migrations run
- [x] Alembic migrations complete successfully before the backend starts
- [x] The FastAPI backend becomes healthy
- [x] The API can be reached from the Fedora development machine over the trusted LAN
- [x] PostgreSQL is not unnecessarily exposed to the local network
- [x] `GET /health` returns HTTP 200 from another LAN machine
- [x] Application CRUD operations work through the Raspberry Pi deployment
- [x] Application data persists after container restart
- [x] Application data persists after Raspberry Pi reboot
- [x] The application stack returns to a healthy state after a Raspberry Pi reboot
- [x] Logs and container status can be inspected on the Raspberry Pi
- [x] A manual application update/redeployment procedure has been verified
- [x] Raspberry Pi deployment, operation, and troubleshooting are documented

### Phase 4 Result

Phase 4 was completed with:

- Docker Engine and Docker Compose running on the ARM64 Raspberry Pi
- The application deployed from Git to `/opt/homelab-platform`
- Deployment credentials stored in an untracked `.env` file
- Native ARM64 backend container images
- FastAPI exposed to the trusted local network
- PostgreSQL restricted to the Raspberry Pi loopback interface
- Automatic PostgreSQL health checking before migrations
- Automatic Alembic migrations before normal backend startup
- A persistent PostgreSQL named volume
- Docker restart policies for the long-running `backend` and `postgres` services
- Verified complete CRUD operations over the local network
- Verified application persistence across backend restarts
- Verified application persistence across a Raspberry Pi reboot
- Verified automatic service recovery after a Raspberry Pi reboot
- Verified manual Git pull and Docker Compose redeployment workflow
- Raspberry Pi deployment and operational documentation

The application backend now runs as a persistent self-hosted service on the Raspberry Pi while remaining accessible from trusted devices on the local network.

## Phase 5: Automation and CI/CD

### Goal

Automate validation and deployment of the existing application using GitHub Actions.

Pull requests and changes to `main` should be validated automatically before deployment. Successfully validated changes merged into `main` should be deployed to the Raspberry Pi without requiring the normal manual update procedure.

The automated workflow must preserve the application architecture, persistent PostgreSQL data, deployment-specific configuration, and migration behavior established in the previous phases.

### Technical Direction

- GitHub Actions for continuous integration
- GitHub-hosted runners for pull request and application validation
- Automated fast and PostgreSQL integration tests
- Automated Docker Compose and container smoke validation
- A self-hosted GitHub Actions runner on the Raspberry Pi for deployment
- Deployment only from trusted changes on `main`
- Existing Docker Compose deployment architecture retained
- Existing Raspberry Pi `.env` retained outside Git
- Existing manual deployment procedure retained as a fallback

### Deliverables

- GitHub Actions continuous integration workflow
- Automatic fast test execution
- Automatic PostgreSQL integration test execution
- Automatic Docker Compose configuration validation
- Automatic container smoke validation
- CI execution for pull requests
- CI execution for changes to `main`
- Raspberry Pi self-hosted deployment runner
- Automatic deployment of successfully validated `main` changes
- Automatic Alembic migration execution through the existing migration service
- Post-deployment application health validation
- Protection against deployment after failed validation
- Documented CI/CD architecture and operating procedure
- Documented manual deployment fallback procedure

### Non-Goals

- Kubernetes
- Container registry based deployment
- Multi-architecture image publishing
- Infrastructure as Code
- Zero-downtime or blue-green deployment
- Automatic rollback
- External secret-management systems
- Monitoring and dashboards
- Automated database backups
- Public Internet exposure

### Definition of Done

- [ ] Pull requests automatically trigger CI
- [ ] Pushes to `main` automatically trigger CI
- [ ] Fast tests run successfully in GitHub Actions
- [ ] PostgreSQL integration tests run successfully in GitHub Actions
- [ ] Docker Compose configuration is validated automatically
- [ ] The containerized application is automatically smoke-tested
- [ ] Failed validation produces a failed GitHub check
- [ ] Failed validation does not trigger Raspberry Pi deployment
- [ ] A self-hosted GitHub Actions runner operates on the Raspberry Pi
- [ ] The deployment runner starts automatically after Raspberry Pi reboot
- [ ] Successfully validated changes to `main` automatically update the Raspberry Pi deployment
- [ ] Deployment preserves the existing Raspberry Pi `.env` configuration
- [ ] Alembic migrations complete successfully during automated deployment
- [ ] The backend becomes healthy after automated deployment
- [ ] `GET /health` returns HTTP `200` after automated deployment
- [ ] PostgreSQL application data survives automated deployment
- [ ] The manual deployment procedure remains available as a fallback
- [ ] CI/CD setup, operation, and troubleshooting are documented

## Phase 6: Monitoring and Homelab Dashboard

### Goal

### Deliverables

### Definition of Done

## Phase 7: Kubernetes

### Goal

### Deliverables

### Definition of Done
