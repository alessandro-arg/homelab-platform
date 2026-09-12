import { useEffect, useState } from "react";

import { getApplications, deleteApplication } from "./api/applications";
import type { Application } from "./types/application";

import CreateApplicationForm from "./components/CreateApplicationForm";
import ApplicationItem from "./components/ApplicationItem";
import EditApplicationForm from "./components/EditApplicationForm";
import ApplicationAnalyticsDashboard from "./components/ApplicationAnalyticsDashboard";

import ApplicationOverview, {
  type ApplicationFilter,
} from "./components/ApplicationOverview";

import "./App.css";

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsRefreshVersion, setAnalyticsRefreshVersion] = useState(0);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

  const [activeFilter, setActiveFilter] = useState<ApplicationFilter>("all");
  const filteredApplications =
    activeFilter === "all"
      ? applications
      : applications.filter(
          (application) => application.status === activeFilter,
        );

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
            : "Ein unerwarteter Fehler ist aufgetreten.",
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
          <p className="eyebrow">Homelab-Plattform</p>
          <h1>Bewerbungsübersicht</h1>
          <p className="subtitle">
            Praktikums- und Stellenbewerbungen zentral verwalten.
          </p>
        </div>

        <button
          type="button"
          className="button-primary"
          disabled={isLoading}
          onClick={() => {
            setEditingApplication(null);
            setIsCreateOpen(true);
          }}
        >
          Bewerbung hinzufügen
        </button>
      </header>

      {isCreateOpen && (
        <CreateApplicationForm
          onCreated={(application) => {
            setApplications((current) => [application, ...current]);
            setError(null);
            setIsCreateOpen(false);
            setAnalyticsRefreshVersion((current) => current + 1);
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
            setAnalyticsRefreshVersion((current) => current + 1);
          }}
          onCancel={() => setEditingApplication(null)}
        />
      )}

      <ApplicationAnalyticsDashboard refreshVersion={analyticsRefreshVersion} />

      {!isLoading && !error && applications.length > 0 && (
        <ApplicationOverview
          applications={applications}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      <section className="applications" aria-labelledby="applications-heading">
        <h2 id="applications-heading">Bewerbungen</h2>

        {isLoading && (
          <div className="loading-state" role="status">
            <span className="loading-spinner" aria-hidden="true" />
            <span>Bewerbungen werden geladen…</span>
          </div>
        )}

        {!isLoading && error && (
          <p role="alert" className="error-message">
            Bewerbungen konnten nicht geladen werden. {error}
          </p>
        )}

        {!isLoading && !error && applications.length === 0 && (
          <div className="empty-state">
            <h3>Noch keine Bewerbungen</h3>
            <p>
              Nach dem Hinzufügen erscheint hier die erste Bewerbung.
            </p>
          </div>
        )}

        {!isLoading &&
          !error &&
          applications.length > 0 &&
          filteredApplications.length === 0 && (
            <div className="empty-state">
              <h3>Keine passenden Bewerbungen</h3>
              <p>Es gibt noch keine Bewerbungen mit diesem Status.</p>
            </div>
          )}

        {!isLoading && !error && filteredApplications.length > 0 && (
          <ul className="application-list">
            {filteredApplications.map((application) => (
              <ApplicationItem
                key={application.id}
                application={application}
                onEdit={(application) => {
                  setIsCreateOpen(false);
                  setEditingApplication(application);
                }}
                onDelete={async (application) => {
                  await deleteApplication(application.id);
                  setAnalyticsRefreshVersion((current) => current + 1);

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
