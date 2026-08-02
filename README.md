# Homelab Platform

A self-hosted platform for managing internship applications and, later, homelab services.

## Current Status

Phase 1: Backend Foundation

The project currently provides:

- A FastAPI backend
- A health-check endpoint
- Automated testing with pytest

## Project Goals

- Build an internship application tracker
- Learn backend development with Python and FastAPI
- Containerize the application with Podman
- Deploy it to a Raspberry Pi
- Add automation, CI/CD, monitoring, and Kubernetes later

## Repository Structure

```text
homelab-platform/
├── backend/
├── docs/
├── infrastructure/
└── README.md
```

## Local Development

### Requirements

- Python 3.12 or newer

### Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --editable ".[dev]"
```

### Run the API

```bash
python -m uvicorn internship_tracker.main:app --reload
```

The API is available at:

- API root: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

### Run Tests

```bash
python -m pytest -v
```

## Documentation

- [Project Definition](docs/project.md)
- [Project Roadmap](docs/roadmap.md)
- [Domain Model](docs/domain-model.md)

## License

A license has not yet been selected.
