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

## Phase 5: Automation and CI/CD - **Completed**

### Goal

Automate validation and deployment of the existing application using GitHub Actions.

Pull requests and changes to `main` should be validated automatically before deployment. Successfully validated changes merged into `main` should be deployed to the Raspberry Pi without requiring the normal manual update procedure.

The automated workflow must preserve the application architecture, persistent PostgreSQL data, deployment-specific configuration, and migration behavior established in the previous phases.

### Technical Direction

- GitHub Actions for continuous integration
- GitHub-hosted runners for pull request and application validation
- Automated fast and PostgreSQL integration tests
- Automated Docker Compose and container smoke validation
- GitHub-hosted deployment jobs connecting securely to the Raspberry Pi through Tailscale
- Ephemeral Tailscale connectivity for deployment jobs
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
- Secure GitHub Actions connectivity to the Raspberry Pi through Tailscale
- Automatic deployment of successfully validated `main` changes
- Automatic Alembic migration execution through the existing migration service
- Post-deployment application health validation
- Protection against deployment after failed validation
- Documented CI/CD architecture and operating procedure
- Documented manual deployment fallback procedure

### Non-Goals

- Kubernetes
- Container registry-based deployment
- Multi-architecture image publishing
- Infrastructure as Code
- Zero-downtime or blue-green deployment
- Automatic rollback
- External secret-management systems
- Monitoring and dashboards
- Automated database backups
- Public Internet exposure

### Definition of Done

- [x] Pull requests automatically trigger CI
- [x] Pushes to `main` automatically trigger CI
- [x] Fast tests run successfully in GitHub Actions
- [x] PostgreSQL integration tests run successfully in GitHub Actions
- [x] Docker Compose configuration is validated automatically
- [x] The containerized application is automatically smoke-tested
- [x] Failed validation produces a failed GitHub check
- [x] Failed validation does not trigger Raspberry Pi deployment
- [x] GitHub Actions can securely reach the Raspberry Pi through Tailscale
- [x] Deployment connectivity does not require a persistent GitHub Actions runner on the Raspberry Pi
- [x] Successfully validated changes to `main` automatically update the Raspberry Pi deployment
- [x] Deployment preserves the existing Raspberry Pi `.env` configuration
- [x] Alembic migrations complete successfully during automated deployment
- [x] The backend becomes healthy after automated deployment
- [x] `GET /health` returns HTTP `200` after automated deployment
- [x] PostgreSQL application data survives automated deployment
- [x] The manual deployment procedure remains available as a fallback
- [x] CI/CD setup, operation, and troubleshooting are documented

### Phase 5 Result

Phase 5 was completed with:

- GitHub Actions validation for pull requests and pushes to `main`
- Automated fast Python tests
- Automated PostgreSQL integration testing
- Automated Docker Compose configuration validation
- Automated container smoke testing
- Deployment blocked when validation fails
- Secure Raspberry Pi connectivity through ephemeral Tailscale GitHub Actions nodes
- OpenID Connect workload identity for Tailscale authentication
- Normal OpenSSH deployment over the encrypted Tailscale network
- Dedicated SSH deployment credentials and strict host-key verification
- Automatic deployment of validated `main` commits
- Exact Git commit verification before deployment
- Fast-forward-only Raspberry Pi repository updates
- Automatic Docker Compose rebuild and deployment
- Automatic Alembic migration verification
- Automatic backend health and API validation
- Preserved Raspberry Pi deployment configuration
- Verified PostgreSQL persistence across automated redeployment
- Verified repeatable deployment of the same commit
- Retained manual deployment fallback procedure

The application now has a complete CI/CD path from pull-request validation through automatic deployment to the Raspberry Pi.

Untrusted pull-request code runs only on GitHub-hosted runners and cannot access the deployment path. Successfully validated changes merged into `main` are deployed through temporary Tailscale connectivity without requiring a persistent self-hosted GitHub Actions runner on the Raspberry Pi.

## Phase 6: Monitoring and Homelab Dashboard

### Goal

Add lightweight monitoring and operational visibility to the Raspberry Pi deployment.

The monitoring system should collect host, container, and FastAPI application metrics, retain recent metrics over time, and provide a Grafana dashboard for inspecting the health and behavior of the homelab platform.

The existing `/health` endpoint remains responsible for simple service health checking, while metrics provide historical operational visibility.

### Technical Direction

- Prometheus for metrics collection and time-series storage
- Grafana for dashboards and visualization
- node_exporter for Raspberry Pi host metrics
- cAdvisor for Docker container resource metrics
- Prometheus-compatible FastAPI application metrics exposed through `/metrics`
- Docker Compose for monitoring service orchestration
- A dedicated Compose monitoring profile
- Monitoring enabled on the Raspberry Pi through deployment-specific configuration
- Internal Docker networking between monitoring components
- Grafana exposed only to the trusted local network
- Prometheus and exporter endpoints not unnecessarily exposed to the LAN
- Persistent Docker volumes for Prometheus and Grafana data
- Bounded Prometheus retention appropriate for the Raspberry Pi
- Version-controlled Prometheus and Grafana configuration
- Grafana credentials supplied through deployment-specific configuration outside Git
- Existing application health checks and deployment architecture retained

### Deliverables

- Prometheus service
- Grafana service
- node_exporter service
- cAdvisor service
- FastAPI `/metrics` endpoint
- Prometheus scrape configuration for application, host, container, and Prometheus metrics
- Persistent Prometheus metric storage
- Persistent Grafana storage
- Provisioned Grafana Prometheus data source
- Version-controlled homelab Grafana dashboard
- Raspberry Pi host metrics including CPU, memory, disk, load, uptime, and network activity
- Docker container CPU, memory, and network metrics
- FastAPI request count, status, and latency metrics
- Monitoring deployment through the existing Docker Compose workflow
- Documentation for starting, inspecting, operating, and troubleshooting monitoring

### Non-Goals

- Kubernetes
- Loki or centralized log aggregation
- Elasticsearch
- OpenTelemetry
- Distributed tracing
- Alertmanager or automated alert delivery
- Long-term remote metrics storage
- High-availability monitoring
- Deep PostgreSQL monitoring or postgres_exporter
- A custom monitoring frontend
- Public Internet exposure of monitoring services

### Definition of Done

- [x] FastAPI exposes Prometheus-compatible metrics through `/metrics`
- [x] Existing `/health` behavior remains unchanged
- [x] Existing backend tests continue to pass
- [x] Prometheus starts successfully through Docker Compose
- [x] Grafana starts successfully through Docker Compose
- [x] node_exporter exposes Raspberry Pi host metrics
- [x] cAdvisor exposes Docker container metrics
- [x] Prometheus successfully scrapes the FastAPI backend
- [x] Prometheus successfully scrapes node_exporter
- [x] Prometheus successfully scrapes cAdvisor
- [x] Prometheus successfully monitors itself
- [x] Grafana uses Prometheus as its configured data source
- [x] Grafana displays Raspberry Pi host metrics
- [x] Grafana displays Docker container metrics
- [x] Grafana displays FastAPI request and latency metrics
- [x] Grafana credentials are not committed to Git
- [x] Prometheus metric data survives container recreation
- [x] Grafana configuration and data survive container recreation
- [x] Monitoring services recover after a Raspberry Pi reboot
- [x] Only required monitoring interfaces are exposed to the trusted LAN
- [x] Existing PostgreSQL application data remains unaffected
- [x] Existing CI/CD deployment remains functional
- [x] Raspberry Pi monitoring resource usage is measured and documented
- [x] Monitoring architecture, operation, and troubleshooting are documented

### Phase 6 Result

Phase 6 was completed with:

- Prometheus metrics collection and bounded local time-series storage
- FastAPI Prometheus metrics exposed through `/metrics`
- Health-check and metrics traffic excluded from application request statistics
- Raspberry Pi host metrics collected through node_exporter
- Docker container CPU, memory, and network metrics collected through cAdvisor
- Prometheus self-monitoring
- Grafana visualization available on the trusted local network
- Provisioned Prometheus Grafana data source
- Version-controlled Grafana dashboard provisioning
- Version-controlled `Homelab Overview` dashboard using the Grafana V2 resource schema
- Host CPU, memory, load, disk usage, and uptime visualization
- Container CPU, memory, and network visualization
- FastAPI request rate, status, latency, and process-memory visualization
- Seven-day Prometheus retention with a 1 GiB storage limit
- Persistent Prometheus and Grafana Docker volumes
- Monitoring services isolated from unnecessary LAN exposure
- Automatic Prometheus configuration reload during deployment
- Monitoring-aware CI validation
- Automatic deployment of the monitoring stack to the Raspberry Pi
- Verified Prometheus and Grafana persistence across container recreation
- Verified recovery of the complete monitoring stack after a Raspberry Pi reboot
- Verified all Prometheus scrape targets recover successfully after reboot

A point-in-time Raspberry Pi resource measurement showed approximately 348 MiB of memory used by the monitoring services:

- Grafana: approximately 176 MiB
- Prometheus: approximately 101 MiB
- cAdvisor: approximately 62 MiB
- node_exporter: approximately 9 MiB

At the same measurement point, the monitoring containers used approximately 10% aggregate Docker CPU, primarily from cAdvisor. These values are operational snapshots rather than fixed resource limits.

The monitoring stack provides historical visibility into the host, containers, and FastAPI application while preserving the existing `/health` endpoint for simple liveness checks.

Prometheus, node_exporter, and cAdvisor remain unavailable directly from the trusted LAN. Grafana is the primary monitoring interface exposed to LAN clients.

The complete monitoring stack and Grafana dashboard were verified to recover automatically after a Raspberry Pi reboot without manual intervention.

## Phase 7: Frontend Application UI

### Goal

Build a small, polished frontend for the Internship Application Tracker so the application can be used through a normal web interface instead of primarily through Swagger or direct API requests.

The frontend should run as part of the existing Raspberry Pi Docker Compose deployment and be accessible from trusted LAN devices.

The browser should use a single frontend entry point. API requests should be proxied from the frontend service to the FastAPI backend through the internal Docker network rather than requiring clients to communicate with the backend directly.

The phase should remain intentionally focused. The goal is to make the existing application practical to use while gaining more experience with Docker Compose, container networking, reverse proxying, deployment, and frontend operations.

### Technical Direction

- React with TypeScript for the frontend application
- Vite for frontend development and production builds
- Frontend hosted on the Raspberry Pi as a Docker container
- Multi-stage frontend container build
- Unprivileged Nginx for serving the production frontend and reverse proxying API requests
- Reverse proxy from `/api/*` requests to the FastAPI backend through the Docker network
- A single trusted-LAN frontend entry point for normal application use
- FastAPI restricted to the Raspberry Pi loopback interface after frontend proxying is verified
- Existing FastAPI backend retained as the application API
- Existing PostgreSQL storage retained unchanged
- Existing Docker Compose deployment architecture extended with the frontend service
- Existing GitHub Actions CI/CD pipeline extended to validate and deploy the frontend
- Existing cAdvisor monitoring used to provide container-level visibility for the frontend
- Responsive interface suitable for desktop and smaller screens
- No public Internet exposure

### Deliverables

- React and TypeScript frontend application
- Vite-based frontend development and build configuration
- Application overview with useful application counts
- Application list
- Application status display
- Status filtering
- Create-application interface
- Edit-application interface
- Delete-application workflow with confirmation
- Loading state
- Empty state
- API error handling
- Responsive application layout
- Production frontend Docker image
- Frontend service in Docker Compose
- Internal frontend-to-backend Docker networking
- Reverse proxy for frontend API requests
- Trusted-LAN frontend access
- Unprivileged Nginx production runtime
- Direct backend LAN exposure removed
- Polished frontend visual design and interaction styling
- Frontend build validation in CI
- Automatic frontend deployment through the existing deployment workflow
- Frontend container health check
- Post-deployment frontend availability validation
- Documentation for frontend architecture, development, deployment, and operation

### Non-Goals

- Kubernetes
- Public Internet exposure
- User accounts or multi-user support
- Authentication or authorization
- Tailscale remote application access
- Internet-facing TLS termination
- Server-side rendering
- Next.js or another full-stack frontend framework
- A separate frontend backend or API layer
- Replacing the existing FastAPI API
- Replacing PostgreSQL
- Complex frontend state-management frameworks unless demonstrated necessary
- Advanced analytics or reporting
- Notifications
- File uploads
- Complex search
- Pagination unless application scale demonstrates a need
- A large design system or extensive animation framework

### Definition of Done

- [x] React and TypeScript frontend is implemented with Vite
- [x] Frontend visual design and interaction polish are completed
- [x] Frontend can retrieve and display applications from FastAPI
- [x] Application overview displays useful status counts
- [x] Applications can be filtered by status
- [x] Applications can be created through the frontend
- [x] Applications can be edited through the frontend
- [x] Applications can be deleted through the frontend with confirmation
- [x] Loading, empty, and API-error states are handled
- [x] Frontend is usable on desktop and smaller screens
- [x] Frontend has a reproducible production Docker image
- [x] Frontend runs through the existing Docker Compose project
- [x] Frontend proxies API requests to FastAPI through the internal Docker network
- [x] Normal browser use requires only the frontend LAN entry point
- [x] Direct backend LAN exposure is removed after frontend proxying is verified
- [x] Existing backend and PostgreSQL behavior remains unchanged
- [x] Existing backend and integration tests continue to pass
- [x] Existing monitoring remains functional
- [x] Frontend container is visible through the existing container monitoring
- [x] CI validates the frontend production build
- [x] CI validates the frontend production container
- [x] Frontend container reports healthy through Docker Compose
- [x] Automated deployment verifies the frontend is reachable after deployment
- [x] Successfully validated frontend changes deploy automatically to the Raspberry Pi
- [x] Frontend and backend recover automatically after a Raspberry Pi reboot
- [x] PostgreSQL application data remains unaffected by frontend deployment
- [x] Frontend architecture, development, deployment, and operation are documented
- [x] No public Internet exposure is introduced

## Phase 8: Network Security and Private Remote Access

### Goal

Understand, verify, and strengthen the network security boundaries of the Raspberry Pi deployment, then provide secure remote access to the Internship Application Tracker through Tailscale without exposing the application publicly to the Internet.

The phase should begin with observation rather than configuration changes. Existing host listeners, Docker-published ports, Docker-internal communication, LAN exposure, Tailscale connectivity, firewall state, and router exposure should be inspected and understood before deciding which security changes are necessary.

The final architecture should preserve trusted LAN access while allowing authorized Tailscale devices to reach the frontend remotely. FastAPI, PostgreSQL, Prometheus, and exporter services should remain unavailable as normal client-facing services.

The phase should also improve practical understanding of Linux networking, Docker Compose networking, service discovery, port publishing, network boundaries, private remote access, and least-privilege access control.

### Technical Direction

- Audit-first approach before making network or firewall changes
- Linux socket and network-interface inspection on the Raspberry Pi
- Docker Compose network and published-port inspection
- Docker DNS and service-name resolution verification
- Explicit documentation of container, host, LAN, Tailscale, and Internet network boundaries
- Existing frontend retained as the normal application entry point
- FastAPI retained as an internal application service
- PostgreSQL retained as an internal data service
- Prometheus and monitoring exporters retained without unnecessary client exposure
- Review of Docker network segmentation where it provides meaningful isolation
- Review and intentional configuration of Raspberry Pi host firewall behavior
- Verification that the home router does not provide unintended public ingress
- Tailscale for trusted remote application access
- Private Tailscale HTTPS access where appropriate
- Least-privilege Tailscale authorization for trusted users and devices
- Existing GitHub Actions deployment connectivity through Tailscale retained
- No public Internet application exposure

### Deliverables

- Raspberry Pi network-interface inventory
- Raspberry Pi listening-port inventory
- Docker published-port inventory
- Docker-internal service communication map
- Service exposure matrix covering loopback, LAN, Tailscale, and public Internet access
- Verified Docker DNS and service-name communication
- Documented frontend-to-backend and backend-to-PostgreSQL network paths
- Review of unnecessary container-to-container connectivity
- Docker network segmentation where justified by the audit
- Raspberry Pi firewall review and intentional configuration
- Home-router public-exposure verification
- Tailscale configuration review
- Private remote access to the frontend from trusted Tailscale devices
- Tailscale access-control review and least-privilege authorization
- Manual positive and negative network-access tests
- Verification that existing CI/CD deployment through Tailscale remains functional
- Updated network and security architecture documentation
- Network-security troubleshooting and verification documentation

### Non-Goals

- Public Internet application exposure
- Router port forwarding for the application
- Tailscale Funnel
- Public portfolio hosting
- Kubernetes
- Cloudflare Tunnel or another public ingress tunnel
- Traefik or another general-purpose ingress platform
- Application user accounts
- Application authentication or authorization
- Centralized logging
- Distributed tracing
- Automated backups
- External secret-management platforms
- Replacing Docker Compose
- Replacing the existing frontend reverse proxy architecture

### Definition of Done

- [ ] Raspberry Pi network interfaces are inspected and understood
- [ ] Host listening TCP and UDP ports are inventoried
- [ ] Every Docker-published host port is identified and understood
- [ ] Docker-internal-only service ports are identified
- [ ] LAN-accessible services are explicitly documented
- [ ] Loopback-only services are verified to remain inaccessible from another LAN machine
- [ ] Docker DNS and service-name resolution are manually verified
- [ ] Required container-to-container communication paths are documented
- [ ] Unnecessary container communication is reduced where practical
- [ ] Docker network segmentation is evaluated and implemented where it provides meaningful isolation
- [ ] Raspberry Pi firewall state is reviewed and intentionally configured
- [ ] Home-router configuration is checked for unintended application port forwarding
- [ ] No application or monitoring service is unintentionally exposed to the public Internet
- [ ] Tailscale configuration and existing deployment connectivity are reviewed
- [ ] A trusted remote Tailscale device can securely reach the frontend
- [ ] Remote application access does not require router port forwarding
- [ ] Tailscale authorization is restricted appropriately for trusted access
- [ ] FastAPI remains unavailable as a normal LAN or remote client-facing service
- [ ] PostgreSQL remains unavailable to LAN and remote clients
- [ ] Prometheus and monitoring exporters remain unavailable to normal LAN and remote clients
- [ ] Existing trusted-LAN frontend access continues to work
- [ ] Existing Grafana trusted-LAN access continues to work
- [ ] Existing GitHub Actions deployment through Tailscale continues to work
- [ ] Existing application and integration tests continue to pass
- [ ] Existing monitoring remains functional
- [ ] PostgreSQL application data remains unaffected
- [ ] Positive and negative network-access cases are manually verified
- [ ] Network security, private remote access, and troubleshooting procedures are documented
