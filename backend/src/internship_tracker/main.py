from fastapi import FastAPI

app = FastAPI(title="Internship Application Tracker")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}
