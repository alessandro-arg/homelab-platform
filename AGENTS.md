# AGENTS.md

## Project

This repository contains the Homelab Platform / Internship Application Tracker.

The application is a real self-hosted tool used for tracking internship and job applications.

The current stack includes:

- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- Alembic
- pytest
- React
- TypeScript
- Vite
- Docker Compose
- GitHub Actions

The application is deployed to a Raspberry Pi and contains real production data.

Infrastructure established in earlier phases is considered stable and should not be changed unless the current task specifically requires it.

## Working style

Act as a senior software engineer working with a junior developer.

Prefer helping the developer understand the change rather than operating as an autopilot.

For meaningful changes:

1. inspect the existing implementation
2. explain the affected layers
3. propose the smallest appropriate solution
4. identify important tradeoffs or migration risks
5. wait for the requested implementation scope
6. keep the implementation small and reviewable
7. run relevant validation
8. summarize what changed and why

Do not broaden the requested scope without explaining why.

Prefer simple solutions over speculative abstraction or premature optimization.

Do not perform unrelated refactors while implementing a feature.

Do not introduce a new dependency unless it provides clear value and explain why it is required.

## Repository architecture

### Backend

Backend code lives under:

`backend/src/internship_tracker/`

Keep the existing separation between:

- Pydantic API/domain models
- repository abstraction
- in-memory repository used by fast tests
- SQLAlchemy database models
- PostgreSQL repository implementation
- FastAPI routes and dependencies

Do not bypass the repository abstraction by placing database queries directly in FastAPI route handlers.

When changing persisted application data, inspect all affected layers before editing.

Typical affected files may include:

- `models.py`
- `database_models.py`
- `repository.py`
- `sqlalchemy_repository.py`
- Alembic migrations
- API tests
- repository tests
- PostgreSQL integration tests

### Database migrations

Production PostgreSQL data must never be destroyed or silently rewritten.

Existing applied Alembic migrations are historical records and should not be edited.

Create a new migration for schema changes.

Prefer backwards-compatible additive migrations when practical.

Before adding a non-nullable column, changing constraints, or transforming existing rows, explicitly consider existing production data.

Do not infer or fabricate values when migrating old records.

Migration behavior should be verified against PostgreSQL, not only SQLite-based tests.

Do not run destructive production database operations unless explicitly requested.

### Frontend

Frontend code lives under:

`frontend/src/`

The frontend uses React and TypeScript with a deliberately small dependency set.

Preserve the existing shared application form and API/type separation where practical.

Browser API calls should continue using relative `/api/*` URLs.

Do not add a UI or state-management library for functionality that can be implemented clearly with the existing stack.

Consider accessibility when changing forms, dialogs, navigation, keyboard interactions, loading states or error states.

## Tests and validation

Run the smallest relevant validation while developing, then broader validation before considering the change complete.

Backend fast tests:

`cd backend && python -m pytest -m "not integration" -v`

PostgreSQL integration tests require the configured test PostgreSQL environment:

`cd backend && python -m pytest -m integration -v`

Frontend validation:

`cd frontend && npm run lint`

`cd frontend && npm run build`

Repository/container validation may include:

`docker compose config`

`docker compose --profile monitoring config`

and the existing container-validation scripts when the change affects containerized behavior.

Do not claim validation succeeded unless the command actually ran successfully.

Report failures clearly.

## Change hygiene

Keep changes logically scoped.

Avoid modifying unrelated files.

Prefer small commits with clear intent.

Do not commit, push, merge, deploy, or modify GitHub configuration unless explicitly requested.

Before proposing a commit, inspect the diff for:

- accidental changes
- unnecessary abstraction
- backwards-compatibility problems
- missing tests
- migration safety
- unrelated formatting changes

Separate required fixes from optional improvements during code review.

## Production considerations

The application runs on a Raspberry Pi and contains real application-tracking data.

Preserve existing application behavior unless a change is explicitly part of the task.

Infrastructure such as Docker Compose, monitoring, network segmentation, Tailscale, SSH hardening and CI/CD is already established.

Do not redesign this infrastructure merely because another technology could be used.

Kubernetes, microservices, Redis, message queues and similar infrastructure should only be introduced when a real project requirement justifies them.
