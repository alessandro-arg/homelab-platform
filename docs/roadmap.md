# Project Roadmap

## Phase 1: Backend Foundation

### Goal

Build the first working version of the Internship Application Tracker backend.

The backend should provide a documented REST API that can manage internship applications in memory. This phase should establish a clean Python project structure, basic validation, error handling, and automated tests.

Persistent database storage is not included in this phase.

### Deliverables

- A structured Python backend project
- A FastAPI application that can be started locally
- A health-check endpoint
- An endpoint to create an internship application
- An endpoint to list all internship applications
- An endpoint to view one internship application
- An endpoint to update an internship application
- An endpoint to delete an internship application
- Request and response validation
- Basic handling for missing or invalid applications
- Automated API tests
- Documentation explaining how to install and run the backend locally

### Definition of Done

- The FastAPI application starts locally without errors
- `GET /health` returns HTTP `200`
- An internship application can be created
- All existing internship applications can be listed
- A single application can be retrieved by its identifier
- An existing application can be updated
- An existing application can be deleted
- Invalid request data produces a clear client error
- Requesting an unknown application produces HTTP status `404`
- Application data remains available while the process is running
- Automated tests verify the main API operations
- All automated tests pass
- The local setup and start commands are documented

## Phase 2: Persistent Storage

### Goal

### Deliverables

### Definition of Done

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
