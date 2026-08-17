#!/usr/bin/env bash

set -euo pipefail

echo "Starting containerized application stack..."
docker compose up --build --force-recreate -d

echo "Checking database migration..."

migration_container="$(
    docker compose ps -a -q migrate
)"

if [[ -z "$migration_container" ]]; then
    echo "Migration container was not created."
    docker compose ps -a
    exit 1
fi

migration_status=""

for _ in {1..30}; do
    migration_status="$(
        docker inspect \
            --format '{{.State.Status}}' \
            "$migration_container"
    )"

    if [[ "$migration_status" == "exited" ]]; then
        break
    fi

    sleep 1
done

if [[ "$migration_status" != "exited" ]]; then
    echo "Migration container did not complete."
    docker compose logs migrate
    exit 1
fi

migration_exit_code="$(
    docker inspect \
        --format '{{.State.ExitCode}}' \
        "$migration_container"
)"

if [[ "$migration_exit_code" != "0" ]]; then
    echo "Database migration failed with exit code ${migration_exit_code}."
    docker compose logs migrate
    exit 1
fi

echo "Waiting for backend health..."

backend_status=""

for attempt in {1..30}; do
    backend_container="$(
        docker compose ps -q backend
    )"

    if [[ -n "$backend_container" ]]; then
        backend_status="$(
            docker inspect \
                --format '{{.State.Health.Status}}' \
                "$backend_container"
        )"
    fi

    if [[ "$backend_status" == "healthy" ]]; then
        break
    fi

    sleep 1
done

if [[ "$backend_status" != "healthy" ]]; then
    echo "Backend did not become healthy."
    docker compose logs backend
    exit 1
fi

echo "Waiting for frontend health..."

frontend_status=""

for _ in {1..30}; do
    frontend_container="$(
        docker compose ps -q frontend
    )"

    if [[ -n "$frontend_container" ]]; then
        frontend_status="$(
            docker inspect \
                --format '{{.State.Health.Status}}' \
                "$frontend_container"
        )"
    fi

    if [[ "$frontend_status" == "healthy" ]]; then
        break
    fi

    sleep 1
done

if [[ "$frontend_status" != "healthy" ]]; then
    echo "Frontend did not become healthy."
    docker compose logs frontend
    exit 1
fi

echo "Checking backend API endpoints..."

curl --fail --silent --show-error \
    http://127.0.0.1:8000/health \
    >/dev/null

curl --fail --silent --show-error \
    http://127.0.0.1:8000/applications \
    >/dev/null

echo "Checking frontend application..."

curl --fail --silent --show-error \
    http://127.0.0.1:8080/ \
    >/dev/null

curl --fail --silent --show-error \
    http://127.0.0.1:8080/api/health \
    >/dev/null

curl --fail --silent --show-error \
    http://127.0.0.1:8080/api/applications \
    >/dev/null

echo "Container validation passed."
