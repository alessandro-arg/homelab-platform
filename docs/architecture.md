# Architecture

## Current Scope

The current system is a containerized internship application tracker deployed as a persistent service on an ARM64 Raspberry Pi with an integrated monitoring stack for host, container, and application observability.

The browser-facing application is a React and TypeScript frontend served by Nginx. Frontend API requests are reverse proxied to the FastAPI backend through the internal Docker Compose network. Application data is stored persistently in PostgreSQL and remains available when the application and database containers are restarted or recreated.

The current architecture includes:

- React and TypeScript for the browser-facing frontend
- Vite for frontend development and production builds
- Nginx for serving the production frontend
- Nginx reverse proxying `/api/*` requests to FastAPI
- Docker-internal frontend-to-backend communication
- FastAPI for the HTTP API
- Pydantic for API validation
- A repository abstraction for data access
- SQLAlchemy for database access
- PostgreSQL for persistent storage
- Psycopg as the PostgreSQL driver
- Alembic for database schema migrations
- Dependency injection for repository and database-session management
- Docker for the frontend and FastAPI application images
- Docker Compose for application orchestration and networking
- Container health checks and startup dependencies
- An unprivileged Nginx runtime for the frontend container
- Automated unit, API, repository, PostgreSQL integration, and container smoke tests
- ARM64 Raspberry Pi deployment
- Deployment-specific host network bindings
- Docker restart policies for long-running services
- GitHub Actions continuous integration
- GitHub-hosted validation runners
- Ephemeral Tailscale connectivity for deployment
- Automated Raspberry Pi deployment over OpenSSH
- Exact-commit deployment verification
- Automated post-deployment migration, backend, and frontend validation
- Prometheus metrics collection and time-series storage
- FastAPI application metrics through `/metrics`
- node_exporter for Raspberry Pi host metrics
- cAdvisor for Docker container metrics
- Grafana for monitoring visualization
- Persistent Prometheus and Grafana storage
- Version-controlled Prometheus and Grafana configuration
- File-provisioned Grafana dashboards
- Monitoring deployment through the existing Docker Compose and CI/CD workflow

Authentication, centralized logging, distributed tracing, trusted remote application access, and Kubernetes are not part of the current architecture.

## Components

### Frontend Application

The browser-facing application is implemented with React and TypeScript and is located in the `frontend` directory.

Vite is used for local frontend development and production builds.

The frontend provides:

- An overview of internship applications
- Application status counts
- Status-based filtering
- Application creation
- Application editing
- Application deletion with confirmation
- Loading, empty, and API-error states

The frontend communicates with FastAPI through relative `/api/*` requests instead of depending directly on a backend host address.

During local development, the Vite development server proxies `/api/*` requests to the configured backend target.

In production, the compiled frontend is served by Nginx. Nginx:

- Serves the static frontend assets
- Provides fallback routing for the single-page application
- Proxies `/api/*` requests to the FastAPI `backend` service
- Uses Docker's internal DNS to resolve `backend`
- Communicates with FastAPI over the Docker Compose network
- Runs as the unprivileged `nginx` user

The production request path is:

```text
Browser
   |
   | HTTP :8080
   v
Frontend / Nginx
   |
   | /api/*
   | Docker Compose network
   v
FastAPI backend
```

The browser does not need direct access to the FastAPI container. On the Raspberry Pi deployment, normal application traffic enters through the frontend service while FastAPI remains bound to the host loopback interface.

### FastAPI Application

The FastAPI application is defined in `main.py` and acts as the application API behind the frontend:

- Exposing HTTP endpoints
- Receiving production application requests proxied by the frontend Nginx service
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
- `GET /metrics`

The backend API paths remain unchanged internally. In normal production browser use, Nginx exposes these application endpoints through the frontend `/api/*` path and removes the `/api` prefix before forwarding the request to FastAPI.

For example:

```text
Browser request:
GET /api/applications

Nginx forwards:
GET /applications

FastAPI handles:
GET /applications
```

The `/metrics` endpoint exposes Prometheus-compatible application metrics.

Metrics include request counts, HTTP status classes, request duration histograms, and Python process metrics.

The `/health` and `/metrics` handlers are excluded from HTTP request statistics so Docker health checks and Prometheus scraping do not pollute application traffic metrics.

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

The normal application stack contains four services:

- `postgres` - persistent PostgreSQL database
- `migrate` - one-shot Alembic migration service
- `backend` - FastAPI application
- `frontend` - React application served by Nginx

A separate `postgres_test` service is available through the `test` Compose profile for isolated PostgreSQL integration testing.

An optional `monitoring` Compose profile adds four long-running monitoring services:

- `prometheus` - metrics collection and local time-series storage
- `node_exporter` - Raspberry Pi host metrics
- `cadvisor` - Docker container resource metrics
- `grafana` - dashboards and visualization

On the Raspberry Pi, `COMPOSE_PROFILES=monitoring` is configured in the deployment-specific `.env`, so the existing deployment workflow automatically includes the monitoring services.

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
Frontend / Nginx container
        |
        | health check succeeds
        v
Application ready
```

The migration service is built from the same Dockerfile and application source as the FastAPI service, but overrides the image's default command to execute Alembic.

The backend does not start unless the migration service completes successfully.

The frontend depends on the backend becoming healthy before it starts.

Docker Compose provides an internal network and DNS resolution between services.

The main internal service communication paths are:

```text
frontend -> backend:8000
backend  -> postgres:5432
migrate  -> postgres:5432
```

The frontend Nginx service uses the Docker Compose service name `backend` to reach FastAPI.

The backend and migration services use the Docker Compose service name `postgres` to reach PostgreSQL.

Inside a container, `localhost` refers to that same container and cannot be used to reach another Compose service.

For host-side development, PostgreSQL is available through:

```text
127.0.0.1:5432
```

The FastAPI container publishes port `8000` through the configurable `BACKEND_BIND_ADDRESS`.

The default backend host binding is:

```text
127.0.0.1:8000
```

The frontend container listens on port `8080` and publishes that port through the configurable `FRONTEND_BIND_ADDRESS`.

The default frontend host binding is:

```text
127.0.0.1:8080
```

On the Raspberry Pi deployment, the bindings are configured as:

```text
frontend   <raspberry-pi-lan-ip>:8080
backend    127.0.0.1:8000
postgres   127.0.0.1:5432
```

The frontend is therefore the normal trusted-LAN application entry point, while FastAPI and PostgreSQL are not directly exposed to other LAN devices.

The frontend container runs Nginx as an unprivileged user and listens on the unprivileged container port `8080`.

Service health is checked at multiple layers:

- PostgreSQL uses `pg_isready`
- FastAPI checks `/health` inside the backend container
- The frontend checks `/api/health` through Nginx, which also verifies that the reverse proxy can reach FastAPI

### Raspberry Pi Deployment Architecture

The homelab deployment runs the Docker Compose stack on an ARM64 Raspberry Pi running Ubuntu Server.

The frontend is the normal application entry point for trusted devices on the local network.

The deployed request path is:

```text
Trusted LAN Client
        |
        | HTTP :8080
        v
Raspberry Pi
        |
        v
Frontend / Nginx container
        |
        | /api/*
        | Docker Compose network
        v
FastAPI backend container
        |
        | postgres:5432
        | Docker Compose network
        v
PostgreSQL container
        |
        v
postgres_data named volume
```

The frontend is published through the Raspberry Pi's trusted LAN address on port `8080`.

The backend is published only on the Raspberry Pi loopback interface:

```text
127.0.0.1:8000
```

PostgreSQL is also published only on the Raspberry Pi loopback interface:

```text
127.0.0.1:5432
```

LAN clients therefore interact with the application through the frontend and cannot directly connect to FastAPI or PostgreSQL.

Nginx forwards frontend `/api/*` requests to the FastAPI `backend` service through the internal Docker Compose network.

The backend and migration services communicate with PostgreSQL through the same Compose network using:

```text
postgres:5432
```

Deployment-specific credentials and host bindings are stored in an untracked `.env` file on the Raspberry Pi.

The long-running frontend, backend, PostgreSQL, and monitoring services use Docker restart policies so they recover automatically when Docker starts after a normal Raspberry Pi reboot.

PostgreSQL application data is stored in the persistent `postgres_data` named volume and survives container recreation and Raspberry Pi restarts.

Automatic frontend, backend, PostgreSQL, and monitoring recovery after a Raspberry Pi reboot has been verified.

### CI/CD Architecture

Pull requests and pushes to `main` are validated using GitHub-hosted runners.

The validation pipeline contains four independent jobs:

- Fast Python tests
- PostgreSQL integration testing
- Frontend validation
- Docker Compose and container smoke validation

Frontend validation installs the frontend dependencies, runs Oxlint, and verifies that the production Vite build succeeds.

Container validation builds and starts the application stack and verifies the backend, frontend, database migration, health checks, and frontend reverse-proxy path.

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
    +--> PostgreSQL
    |
    +--> FastAPI backend
    |
    +--> Frontend / Nginx
    |
    +--> Monitoring services
```

The GitHub-hosted deployment runner authenticates to Tailscale using OpenID Connect workload identity rather than requiring a persistent self-hosted GitHub runner on the Raspberry Pi.

SSH uses a dedicated deployment key and strict host-key verification.

The deployment script refuses to continue when:

- the Raspberry Pi checkout is not on `main`
- the checkout contains local changes
- `origin/main` does not match the GitHub commit being deployed
- the Git history cannot be fast-forwarded
- Alembic migration fails
- the backend does not become healthy
- backend API validation fails
- the frontend does not become healthy
- the frontend application is not reachable
- proxied `/api/health` or `/api/applications` validation fails

The deployed frontend and backend therefore use the same application path that was validated before deployment.

Deployment-specific credentials and host bindings remain stored in the Raspberry Pi's untracked `.env` file.

The PostgreSQL named volume is not removed during automated deployment, so application data is preserved across deployments.

### Monitoring Architecture

The Raspberry Pi deployment includes a lightweight Prometheus-based monitoring stack.

The metrics flow is:

```text
FastAPI /metrics ──────┐
node_exporter ─────────┤
cAdvisor ──────────────┼──> Prometheus ───> Grafana ───> LAN Client
Prometheus ────────────┘
```

Prometheus collects four scrape targets:

```text
backend:8000
prometheus:9090
node_exporter:9100
cadvisor:8080
```

Prometheus therefore monitors:

- FastAPI application behavior
- Raspberry Pi host resources
- Docker container resources, including the frontend container
- Prometheus itself

#### FastAPI Metrics

FastAPI exposes Prometheus-compatible metrics through `/metrics`.

Application metrics include:

- HTTP request count
- Request rate
- HTTP status classes
- Request duration histograms
- Python process metrics

The existing `/health` endpoint remains responsible for simple liveness checking.

#### Host Metrics

node_exporter observes the Raspberry Pi host using read-only host filesystem mounts for `/proc`, `/sys`, and the root filesystem.

This provides host-level metrics including:

- CPU
- memory
- filesystem usage
- load
- uptime
- network activity

node_exporter is reachable only through the internal Docker Compose network and does not publish a host port.

#### Container Metrics

cAdvisor observes the Docker runtime and exposes per-container metrics including:

- CPU usage
- memory usage
- filesystem activity
- network traffic

The frontend container is automatically included in cAdvisor container metrics, so its CPU, memory, filesystem, and network activity are visible through the existing monitoring stack without requiring a separate frontend exporter.

Docker Compose service labels are retained in the metrics so Grafana can display readable service names such as `frontend`, `backend`, `postgres`, `prometheus`, and `grafana`.

cAdvisor does not publish port `8080` to the host.

#### Prometheus

Prometheus stores recent metrics in the persistent `prometheus_data` Docker volume.

Retention is bounded to:

```text
7 days
1 GiB maximum
```

Prometheus is bound only to:

```text
127.0.0.1:9090
```

and is therefore not directly exposed to LAN clients.

Prometheus configuration is stored in:

```text
monitoring/prometheus/prometheus.yml
```

The deployment script restarts Prometheus when monitoring is active so changes to the bind-mounted configuration are loaded during deployment.

#### Grafana

Grafana is the monitoring interface exposed to the trusted local network.

The Raspberry Pi deployment binds Grafana through the configured `GRAFANA_BIND_ADDRESS` on port `3000`.

Grafana uses the persistent `grafana_data` Docker volume.

The Prometheus data source is provisioned from:

```text
monitoring/grafana/provisioning/datasources/prometheus.yml
```

Dashboard provisioning is configured through:

```text
monitoring/grafana/provisioning/dashboards/default.yml
```

The version-controlled dashboard is:

```text
monitoring/grafana/dashboards/homelab-overview.json
```

`Homelab Overview` uses the Grafana V2 resource schema and contains:

- Raspberry Pi CPU, memory, load, root disk usage, and uptime
- Docker container CPU, memory, and network usage
- FastAPI request rate
- HTTP status classes
- request latency percentiles
- FastAPI process memory

The deployed dashboard is file-provisioned with UI updates disabled. Git is therefore the source of truth for the deployed dashboard.

#### Monitoring Network Exposure

The deployment intentionally exposes only the interfaces required by users:

```text
LAN:
FastAPI     :8000
Grafana     :3000

Loopback only:
PostgreSQL  :5432
Prometheus  :9090

Internal Docker network only:
node_exporter :9100
cAdvisor      :8080
```

This keeps raw monitoring endpoints unavailable directly from the trusted LAN while Grafana provides the intended visualization interface.

#### Monitoring Persistence and Recovery

Prometheus and Grafana data are stored in persistent Docker volumes.

The monitoring services use Docker restart policies and were verified to recover automatically after a Raspberry Pi reboot.

After reboot:

- FastAPI returned healthy
- Prometheus became ready
- Grafana became available
- node_exporter and cAdvisor restarted
- all four Prometheus scrape targets returned `up = 1`
- the provisioned Grafana dashboard became available without manual intervention

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

Later phases may introduce:

- A web frontend
- Authentication
- Kubernetes
- Centralized logging
- Alerting
- Distributed tracing
