# Homelab Platform

A self-hosted platform for managing internship applications and, later, homelab services.

## Current Status

Phase 1: Backend Foundation - **Completed**

Phase 2: Persistent Storage - **Completed**

Phase 3: Containerization - **Completed**

Phase 4: Raspberry Pi Deployment - **Completed**

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
- A containerized FastAPI backend
- Docker Compose orchestration for FastAPI and PostgreSQL
- Automatic Alembic migrations during container startup
- Docker health checks for PostgreSQL and FastAPI
- Automated container smoke validation
- ARM64 Raspberry Pi deployment
- Local-network access to the deployed FastAPI backend
- Automatic backend and PostgreSQL recovery after Raspberry Pi reboot

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
- Containerize the application with Docker
- Deploy it to a Raspberry Pi
- Add automation, CI/CD, monitoring, and Kubernetes later

## Repository Structure

```text
homelab-platform/
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
├── docs/
│   ├── architecture.md
│   ├── domain-model.md
│   ├── project.md
│   └── roadmap.md
├── scripts/
│   └── validate-containers.sh
├── .env.example
├── compose.yaml
└── README.md
```

## Containerized Application

The complete application stack can run with Docker Compose.

The stack contains:

- `postgres` - persistent PostgreSQL database
- `migrate` - one-shot Alembic migration service
- `backend` - FastAPI application
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
Application ready
```

Check the current state:

```bash
docker compose ps -a
```

The backend is available at:

- Health check: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

Inspect service logs:

```bash
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

1. Builds the backend image.
2. Recreates the application containers.
3. Waits for the FastAPI backend to become healthy.
4. Verifies that Alembic migrations completed successfully.
5. Checks the /health and /applications endpoints.

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
- FastAPI exposed only on the trusted local network
- PostgreSQL exposed only on the Raspberry Pi loopback interface

### Deployment Configuration

Create a deployment-specific `.env` file on the Raspberry Pi.

The `.env` file is ignored by Git and must contain the real deployment credentials:

```text
BACKEND_BIND_ADDRESS=<raspberry-pi-lan-ip>

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
```

### Local Network Access

The FastAPI backend is bound to the Raspberry Pi LAN address configured through `BACKEND_BIND_ADDRESS`.

The API can therefore be accessed by trusted devices on the local network:

```text
http://<raspberry-pi-lan-ip>:8000
```

PostgreSQL remains bound to:

```text
127.0.0.1:5432
```

and is not directly exposed to other LAN devices.

### Updating the Deployment

Application changes are developed, tested, committed, and pushed from the development workstation.

Update the Raspberry Pi deployment with:

```bash
cd /opt/homelab-platform

git status
git pull

docker compose up --build -d
docker compose ps -a
```

`docker compose up --build -d` rebuilds changed application images and recreates services when required.

The PostgreSQL named volume is preserved during normal redeployment.

Do not use:

```bash
docker compose down -v
```

unless the persistent PostgreSQL data should intentionally be deleted.

### Reboot Recovery

The long-running `backend` and `postgres` services use Docker restart policies.

Docker starts automatically with Ubuntu, allowing the application stack to recover after a normal Raspberry Pi reboot.

The PostgreSQL named volume preserves application data across container and host restarts.

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
- Deployment to the Raspberry Pi is not implemented yet.
- CI/CD and monitoring are not implemented yet.

## Documentation

- [Project Definition](docs/project.md)
- [Project Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Domain Model](docs/domain-model.md)

## License

A license has not yet been selected.
