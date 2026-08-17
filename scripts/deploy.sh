#!/usr/bin/env bash

set -euo pipefail

expected_sha="${1:?Expected deployment commit SHA is required}"
repo_dir="${DEPLOY_REPO_DIR:-/opt/homelab-platform}"

cd "$repo_dir"

echo "Checking deployment repository..."

if [[ "$(git branch --show-current)" != "main" ]]; then
    echo "Deployment repository is not on main."
    exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "Deployment repository has local changes."
    git status --short
    exit 1
fi

echo "Fetching main from GitHub..."
git fetch origin main

remote_sha="$(git rev-parse origin/main)"

if [[ "$remote_sha" != "$expected_sha" ]]; then
    echo "origin/main does not match the validated deployment commit."
    echo "Expected: $expected_sha"
    echo "Found:    $remote_sha"
    exit 1
fi

echo "Updating deployment checkout..."
git merge --ff-only origin/main

if [[ "$(git rev-parse HEAD)" != "$expected_sha" ]]; then
    echo "Deployment checkout does not match the expected commit."
    exit 1
fi

echo "Building and starting application..."
docker compose up --build -d

if docker compose ps --services --status running | grep -qx prometheus; then
    echo "Restarting Prometheus to load current configuration..."
    docker compose restart prometheus

    echo "Waiting for Prometheus readiness..."

    prometheus_ready="false"

    for _ in {1..30}; do
        if curl \
            --fail \
            --silent \
            --show-error \
            "http://127.0.0.1:9090/-/ready" \
            >/dev/null; then
            prometheus_ready="true"
            break
        fi

        sleep 1
    done

    if [[ "$prometheus_ready" != "true" ]]; then
        echo "Prometheus did not become ready."
        docker compose logs prometheus
        exit 1
    fi
fi

echo "Checking database migration..."

migration_container="$(docker compose ps -a -q migrate)"

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

for _ in {1..30}; do
    backend_container="$(docker compose ps -q backend)"

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
    frontend_container="$(docker compose ps -q frontend)"

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

echo "Checking backend API..."

backend_address="$(docker compose port backend 8000)"

curl --fail --silent --show-error \
    "http://${backend_address}/health" \
    >/dev/null

curl --fail --silent --show-error \
    "http://${backend_address}/applications" \
    >/dev/null

echo "Checking frontend application..."

frontend_address="$(docker compose port frontend 80)"

if [[ -z "$frontend_address" ]]; then
    echo "Frontend does not have a published port."
    docker compose ps frontend
    exit 1
fi

curl --fail --silent --show-error \
    "http://${frontend_address}/" \
    >/dev/null

curl --fail --silent --show-error \
    "http://${frontend_address}/api/health" \
    >/dev/null

curl --fail --silent --show-error \
    "http://${frontend_address}/api/applications" \
    >/dev/null

echo "Deployment completed successfully."
