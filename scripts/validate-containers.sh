#!/usr/bin/env bash

set -euo pipefail

echo "Starting containerized application stack..."
docker compose up --build --force-recreate -d

echo "Waiting for backend health..."

backend_status=""

for attempt in {1..30}; do
    backend_status="$(
        docker inspect \
            --format '{{.State.Health.Status}}' \
            "$(docker compose ps -q backend)"
    )"

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

migration_exit_code="$(
    docker inspect \
        --format '{{.State.ExitCode}}' \
        "$(docker compose ps -a -q migrate)"
)"

if [[ "$migration_exit_code" != "0" ]]; then
    echo "Database migration failed."
    docker compose logs migrate
    exit 1
fi

echo "Checking API endpoints..."

curl --fail --silent --show-error \
    http://127.0.0.1:8000/health \
    >/dev/null

curl --fail --silent --show-error \
    http://127.0.0.1:8000/applications \
    >/dev/null

echo "Container validation passed."