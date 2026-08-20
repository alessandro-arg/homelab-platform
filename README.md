# Homelab Platform

A self-hosted platform for managing internship applications and, later, homelab services.

## Current Status

Phase 1: Backend Foundation - **Completed**

Phase 2: Persistent Storage - **Completed**

Phase 3: Containerization - **Completed**

Phase 4: Raspberry Pi Deployment - **Completed**

Phase 5: Automation and CI/CD - **Completed**

Phase 6: Monitoring and Homelab Dashboard - **Completed**

Phase 7: Frontend Application UI - **Completed**

Phase 8: Network Security and Private Remote Access - **Completed**

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
- A React and TypeScript frontend built with Vite
- Internship application overview, filtering, and CRUD workflows
- A production multi-stage frontend Docker image
- Unprivileged Nginx serving the production frontend
- Nginx reverse proxying `/api/*` requests to FastAPI
- Docker-internal frontend-to-backend communication
- Trusted-LAN frontend access plus private Tailscale HTTPS access
- Frontend health checks and automated deployment validation
- Automated testing with pytest
- Isolated PostgreSQL integration testing
- Containerized React frontend and FastAPI backend
- Docker Compose orchestration for the frontend, FastAPI, and PostgreSQL
- Automatic Alembic migrations during container startup
- Docker health checks for PostgreSQL, FastAPI, and the frontend
- Automated container smoke validation
- ARM64 Raspberry Pi deployment
- Local-network access to the deployed frontend
- FastAPI restricted to the Raspberry Pi loopback interface
- Automatic frontend, backend, PostgreSQL, and monitoring recovery after Raspberry Pi reboot
- GitHub Actions continuous integration
- Automatic fast and PostgreSQL integration testing
- Automatic Docker Compose and container smoke validation
- Secure GitHub Actions deployment through Tailscale
- Automatic deployment of validated `main` changes to the Raspberry Pi
- Exact-commit deployment verification
- Post-deployment migration and health validation
- Prometheus metrics collection and bounded time-series retention
- FastAPI application metrics through `/metrics`
- Raspberry Pi host monitoring with node_exporter
- Docker container monitoring with cAdvisor
- Grafana dashboards on the trusted local network
- Persistent Prometheus and Grafana storage
- Provisioned Prometheus Grafana data source
- Version-controlled `Homelab Overview` Grafana dashboard
- Automatic monitoring-stack deployment through the existing CI/CD workflow
- Explicit Docker Compose network segmentation for application, data, monitoring, and test traffic
- Reduced unnecessary container-to-container reachability
- Raspberry Pi host firewall with deny-by-default incoming policy
- SSH public-key authentication for manual administration
- SSH password authentication and root SSH login disabled
- Private Tailscale HTTPS access to the frontend
- Tailscale Serve proxying through a loopback-only frontend entry point
- Least-privilege Tailscale grants for personal frontend access, Fedora administration, and GitHub Actions deployment
- No application router port forwarding or public Internet ingress

Application data is stored persistently in PostgreSQL and remains available when the FastAPI backend restarts.

## Available API Endpoints

| Method   | Endpoint                         | Description                               |
| -------- | -------------------------------- | ----------------------------------------- |
| `GET`    | `/health`                        | Check whether the backend is healthy      |
| `POST`   | `/applications`                  | Create an internship application          |
| `GET`    | `/applications`                  | List all internship applications          |
| `GET`    | `/applications/{application_id}` | Retrieve one application                  |
| `PUT`    | `/applications/{application_id}` | Replace an existing application           |
| `DELETE` | `/applications/{application_id}` | Delete an application                     |
| `GET`    | `/metrics`                       | Prometheus-compatible application metrics |

## Project Goals

- Build a complete internship application tracker
- Learn backend development with Python and FastAPI
- Build persistent application storage with PostgreSQL
- Build a React and TypeScript frontend
- Containerize the application with Docker
- Deploy and operate it on a Raspberry Pi
- Learn CI/CD, monitoring, networking, and self-hosting practices
- Continue improving Docker and container operations before introducing Kubernetes
- Evaluate Kubernetes later when it provides meaningful learning value

## Repository Structure

```text
homelab-platform/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── .dockerignore
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
├── frontend/
│   ├── src/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
├── docs/
│   ├── architecture.md
│   ├── domain-model.md
│   ├── project.md
│   └── roadmap.md
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       ├── dashboards/
│       │   └── homelab-overview.json
│       └── provisioning/
│           ├── dashboards/
│           │   └── default.yml
│           └── datasources/
│               └── prometheus.yml
├── scripts/
│   ├── deploy.sh
│   └── validate-containers.sh
├── .env.example
├── compose.yaml
└── README.md
```

## Containerized Application

The complete application stack can run with Docker Compose.

The normal application stack contains:

- `postgres` - persistent PostgreSQL database
- `migrate` - one-shot Alembic migration service
- `backend` - FastAPI application
- `frontend` - React application served by unprivileged Nginx
- `postgres_test` - optional isolated PostgreSQL service for integration tests

Start the application stack from the repository root:

```bash
docker compose up --build -d
```

Docker Compose starts the services in the following order:

```text
PostgreSQL
    |
    | health check passes
    v
Alembic migrations
    |
    | exit successfully
    v
FastAPI backend
    |
    | health check passes
    v
Frontend / Nginx
    |
    | frontend health check passes
    v
Application ready
```

Check the current state:

```bash
docker compose ps -a
```

When the Docker Compose stack is running locally, the frontend is available at:

- Application UI: `http://127.0.0.1:8080`

The backend remains available locally at:

- Health check: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

Normal browser use goes through the frontend. Requests under `/api/*` are proxied by Nginx to the FastAPI backend through the Docker Compose network.

Inspect service logs:

```bash
docker compose logs frontend
docker compose logs backend
docker compose logs migrate
docker compose logs postgres
```

Stop and remove the application containers and Compose network:

```bash
docker compose down
```

The PostgreSQL named volume is preserved by this command, so application data remains available on the next startup.

Do not use `docker compose down -v` unless the PostgreSQL data should intentionally be deleted.

### Container Database Configuration

Host-side development connects to PostgreSQL through the published host port:

```text
localhost:5432
```

Containers communicate through the internal Docker Compose network instead.

The FastAPI and migration containers connect to PostgreSQL using the Compose service name:

```text
postgres:5432
```

Inside a container, `localhost` refers to that same container and cannot be used to reach the PostgreSQL container.

### Database Migrations

Migrations run automatically when the normal Compose stack starts.

They can also be executed manually with:

```bash
docker compose run --rm migrate
```

Check the current Alembic revision from the backend container:

```bash
docker compose exec backend alembic -c alembic.ini current
```

### Container Validation

Run the automated container smoke validation from the repository root:

```bash
./scripts/validate-containers.sh
```

The validation:

1. Builds the backend and frontend images.
2. Recreates the application containers.
3. Verifies that Alembic migrations completed successfully.
4. Waits for the FastAPI backend to become healthy.
5. Waits for the frontend container to become healthy.
6. Checks the backend health and applications endpoints.
7. Checks the frontend application entry point.
8. Checks `/api/health` and `/api/applications` through the Nginx reverse proxy.

The PostgreSQL named volume is preserved during validation.

### Container Troubleshooting

Check the state of all application services:

```bash
docker compose ps -a
```

Inspect service logs:

```bash
docker compose logs backend
docker compose logs migrate
docker compose logs postgres
```

Follow backend logs while the application is running:

```bash
docker compose logs -f backend
```

Rebuild and recreate the application containers:

```bash
docker compose up --build --force-recreate -d
```

If the backend does not start, check whether the migration service completed successfully:

```bash
docker compose ps -a migrate
docker compose logs migrate
```

Check the database migration revision from the running backend container:

```bash
docker compose exec backend alembic -c alembic.ini current
```

If PostgreSQL is unavailable, verify that it is healthy:

```bash
docker compose ps postgres
docker compose logs postgres
```

The application containers and Compose network can be recreated without deleting persistent PostgreSQL data:

```bash
docker compose down
docker compose up --build -d
```

The `postgres_data` named volume is preserved by `docker compose down`.

Using `docker compose down -v` also removes the persistent database volume and should only be used when the development database is intentionally being reset.

## Raspberry Pi Deployment

The containerized application can be deployed to an ARM64 Raspberry Pi running Ubuntu Server.

The current homelab deployment uses:

- Raspberry Pi with Ubuntu Server 24.04 LTS
- ARM64 (`aarch64`)
- Docker Engine and Docker Compose
- A Git checkout at `/opt/homelab-platform`
- A persistent PostgreSQL Docker volume
- Frontend exposed only on the trusted local network
- FastAPI exposed only on the Raspberry Pi loopback interface
- PostgreSQL exposed only on the Raspberry Pi loopback interface
- Nginx proxying frontend `/api/*` requests to FastAPI through Docker networking

### Deployment Configuration

Create a deployment-specific `.env` file on the Raspberry Pi.

The `.env` file is ignored by Git and must contain the real deployment credentials:

```text
BACKEND_BIND_ADDRESS=127.0.0.1
FRONTEND_BIND_ADDRESS=<raspberry-pi-lan-ip>

POSTGRES_USER=tracker
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=internship_tracker
```

Protect the file:

```bash
chmod 600 .env
```

Do not commit deployment credentials to Git.

### Initial Deployment

Clone the repository to the Raspberry Pi:

```bash
sudo mkdir -p /opt/homelab-platform
sudo chown "$USER:$USER" /opt/homelab-platform

git clone https://github.com/alessandro-arg/homelab-platform.git /opt/homelab-platform
cd /opt/homelab-platform
```

Start the application:

```bash
docker compose up --build -d
```

Verify the deployment:

```bash
docker compose ps -a
docker compose logs migrate
```

The expected runtime state is:

```text
postgres   running and healthy
migrate    exited successfully
backend    running and healthy
frontend   running and healthy
```

### Local Network Access

The frontend is the single application entry point for trusted devices on the local network.

It is bound to the Raspberry Pi LAN address through `FRONTEND_BIND_ADDRESS`:

```text
http://<raspberry-pi-lan-ip>:8080
```

Browser API requests use `/api/*`. Nginx forwards those requests to the FastAPI `backend` service through the internal Docker Compose network.

The backend remains bound to:

```text
127.0.0.1:8000
```

PostgreSQL remains bound to:

```text
127.0.0.1:5432
```

Neither FastAPI nor PostgreSQL is directly exposed to other LAN devices.

### Automatic Deployment

Changes merged into `main` are deployed automatically through GitHub Actions after validation succeeds.

The deployment pipeline performs:

```text
Push to main
    |
    v
Fast tests
PostgreSQL integration test
Frontend validation
Container validation
    |
    | all validation succeeds
    v
Temporary Tailscale connection
    |
    v
SSH to Raspberry Pi
    |
    v
Verify clean deployment checkout
    |
    v
Verify origin/main matches the validated GitHub commit
    |
    v
Fast-forward deployment checkout
    |
    v
docker compose up --build -d
    |
    v
Verify Alembic migration
    |
    v
Verify backend health
    |
    v
Verify frontend health
    |
    v
Verify backend API endpoints
    |
    v
Verify frontend and proxied API endpoints
```

The Raspberry Pi deployment keeps its existing untracked `.env` file and persistent PostgreSQL named volume.

A failed CI validation prevents the deployment job from running.

### Manual Deployment Fallback

If automated deployment is unavailable, the Raspberry Pi can still be updated manually:

```bash
cd /opt/homelab-platform

git status
git fetch origin main
git merge --ff-only origin/main

docker compose up --build -d
docker compose ps -a
```

Do not use:

```bash
docker compose down -v
```

unless persistent PostgreSQL data should intentionally be destroyed.

### CI/CD Troubleshooting

If a deployment does not complete, first inspect the failed GitHub Actions job.

A failed validation job prevents the deployment job from running.

For deployment failures, check:

- Whether the Tailscale connection succeeded
- Whether SSH authentication succeeded
- Whether the Raspberry Pi deployment checkout is clean and on `main`
- Whether the deployed commit matches `origin/main`
- Whether the migration service exited successfully
- Whether PostgreSQL, the backend, and the frontend are healthy

On the Raspberry Pi, inspect the deployment with:

```bash
cd /opt/homelab-platform

git status
git log -1 --oneline

docker compose ps -a
docker compose logs migrate
docker compose logs frontend
docker compose logs backend
docker compose logs postgres
```

Verify the API manually with:

```bash
curl --fail "http://<raspberry-pi-lan-ip>:8080/api/health"
```

Do not use `docker compose down -v` while troubleshooting unless deleting the PostgreSQL data is intentional.

### Reboot Recovery

The long-running `frontend`, `backend`, `postgres`, and monitoring services use Docker restart policies.

Docker starts automatically with Ubuntu, allowing the application stack to recover after a normal Raspberry Pi reboot.

The PostgreSQL named volume preserves application data across container and host restarts. Frontend, backend, PostgreSQL, and monitoring recovery after a Raspberry Pi reboot has been verified.

## Monitoring

The optional monitoring stack runs through the Docker Compose `monitoring` profile.

It contains:

- `prometheus` - metrics collection and time-series storage
- `node_exporter` - Raspberry Pi host metrics
- `cadvisor` - Docker container metrics
- `grafana` - dashboards and visualization

FastAPI exposes Prometheus-compatible application metrics through:

```text
/metrics
```

The `/health` and `/metrics` endpoints are excluded from HTTP request statistics so health checks and Prometheus scraping do not appear as application traffic.

### Monitoring Architecture

```text
FastAPI /metrics ──────┐
node_exporter ─────────┤
cAdvisor ──────────────┼──> Prometheus ───> Grafana
Prometheus ────────────┘
```

Prometheus retains up to seven days of metrics with a maximum local storage size of 1 GiB.

Prometheus and Grafana use persistent Docker volumes.

### Start Monitoring

Monitoring can be enabled explicitly with:

```bash
docker compose --profile monitoring up --build -d
```

On the Raspberry Pi, the deployment-specific `.env` contains:

```text
COMPOSE_PROFILES=monitoring
```

so the existing deployment workflow automatically includes the monitoring services.

### Network Exposure

The Raspberry Pi deployment exposes:

```text
Frontend   <raspberry-pi-lan-ip>:8080
Grafana    <raspberry-pi-lan-ip>:3000
```

The following interfaces are not exposed directly to the LAN:

```text
FastAPI      127.0.0.1:8000
PostgreSQL   127.0.0.1:5432
Prometheus   127.0.0.1:9090
node_exporter internal Docker network only
cAdvisor      internal Docker network only
```

### Grafana Dashboard

Grafana uses a provisioned Prometheus data source.

The `Homelab Overview` dashboard is stored in Git at:

```text
monitoring/grafana/dashboards/homelab-overview.json
```

and displays:

- Raspberry Pi CPU, memory, load, root filesystem usage, and uptime
- Container CPU, memory, and network activity
- FastAPI request rate
- HTTP status classes
- Request latency percentiles
- FastAPI process memory

The dashboard is file-provisioned and cannot be permanently modified through the deployed Grafana UI.

### Monitoring Troubleshooting

Check monitoring services:

```bash
docker compose ps
```

Inspect logs:

```bash
docker compose logs prometheus
docker compose logs grafana
docker compose logs node_exporter
docker compose logs cadvisor
```

Verify Prometheus readiness:

```bash
curl --fail http://127.0.0.1:9090/-/ready
```

Verify scrape targets:

```bash
curl --silent \
  'http://127.0.0.1:9090/api/v1/query?query=up'
```

The expected monitored targets are:

```text
backend:8000
prometheus:9090
node_exporter:9100
cadvisor:8080
```

All should report up = 1.

## Local Development

### Requirements

- Python 3.12 or newer
- Node.js with npm
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

### Run the Frontend

With the backend running locally, install the frontend dependencies:

```bash
cd frontend
npm ci
```

Start the Vite development server:

```bash
npm run dev
```

The frontend uses relative `/api/*` requests. During development, the Vite dev server proxies these requests to the FastAPI backend and removes the `/api` prefix before forwarding them.

By default, API requests are forwarded to:

```text
http://127.0.0.1:8000
```

To use a different backend address, create `frontend/.env.local`:

```env
API_PROXY_TARGET=http://<backend-address>:8000
```

For example, when developing the frontend against a backend running on another trusted machine, set `API_PROXY_TARGET` to that machine's reachable address.

The local environment file is machine-specific and must not be committed to Git.

Validate frontend changes before committing:

```bash
npm run lint
npm run build
```

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
docker compose -f ../compose.yaml up -d --wait postgres_test
```

Then run the integration test:

```bash
python -m pytest -m integration -v
```

Stop and remove the isolated test database after the integration test:

```bash
docker compose -f ../compose.yaml stop postgres_test
docker compose -f ../compose.yaml rm -f postgres_test
```

## Current Limitations

- Authentication and multiple users are not supported.
- A frontend is not included yet.

## Documentation

- [Project Definition](docs/project.md)
- [Project Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Domain Model](docs/domain-model.md)

## License

A license has not yet been selected.
