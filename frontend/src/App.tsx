import { useEffect, useState } from "react";

import { getApplications } from "./api/applications";
import type { Application } from "./types/application";

import "./App.css";

function formatStatus(status: Application["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplications() {
      try {
        const data = await getApplications(controller.signal);
        setApplications(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading applications.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Homelab Platform</p>
          <h1>Internship Tracker</h1>
          <p className="subtitle">
            Manage internship and job applications from one place.
          </p>
        </div>

        <button type="button" disabled>
          Add application
        </button>
      </header>

      <section className="applications" aria-labelledby="applications-heading">
        <h2 id="applications-heading">Applications</h2>

        {isLoading && <p>Loading applications...</p>}

        {!isLoading && error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {!isLoading && !error && applications.length === 0 && (
          <div className="empty-state">
            <h3>No applications yet</h3>
            <p>
              Your applications will appear here after you add your first one.
            </p>
          </div>
        )}

        {!isLoading && !error && applications.length > 0 && (
          <ul className="application-list">
            {applications.map((application) => (
              <li key={application.id}>
                <strong>{application.company_name}</strong>
                <span>{application.position_title ?? "No position title"}</span>
                <span>{formatStatus(application.status)}</span>
                <span>{formatDate(application.application_date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
