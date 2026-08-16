import { useEffect, useState } from "react";

import { getApplications, deleteApplication } from "./api/applications";
import type { Application } from "./types/application";

import CreateApplicationForm from "./components/CreateApplicationForm";
import ApplicationItem from "./components/ApplicationItem";
import EditApplicationForm from "./components/EditApplicationForm";

import "./App.css";

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

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

        <button
          type="button"
          onClick={() => {
            setEditingApplication(null);
            setIsCreateOpen(true);
          }}
        >
          Add application
        </button>
      </header>

      {isCreateOpen && (
        <CreateApplicationForm
          onCreated={(application) => {
            setApplications((current) => [application, ...current]);
            setIsCreateOpen(false);
          }}
          onCancel={() => setIsCreateOpen(false)}
        />
      )}

      {editingApplication && (
        <EditApplicationForm
          application={editingApplication}
          onUpdated={(updatedApplication) => {
            setApplications((current) =>
              current.map((application) =>
                application.id === updatedApplication.id
                  ? updatedApplication
                  : application,
              ),
            );

            setEditingApplication(null);
          }}
          onCancel={() => setEditingApplication(null)}
        />
      )}

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
              <ApplicationItem
                key={application.id}
                application={application}
                onEdit={(application) => {
                  setIsCreateOpen(false);
                  setEditingApplication(application);
                }}
                onDelete={async (application) => {
                  await deleteApplication(application.id);

                  setApplications((current) =>
                    current.filter((item) => item.id !== application.id),
                  );

                  if (editingApplication?.id === application.id) {
                    setEditingApplication(null);
                  }
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
