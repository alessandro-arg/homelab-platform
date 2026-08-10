FROM python:3.14.6-slim-trixie

WORKDIR /app

COPY pyproject.toml .
COPY src ./src

RUN python -m pip install --no-cache-dir .

COPY alembic.ini .
COPY migrations ./migrations

RUN addgroup --system app \
    && adduser --system --ingroup app app

USER app

EXPOSE 8000

CMD ["fastapi", "run", "src/internship_tracker/main.py", "--host", "0.0.0.0", "--port", "8000"]
