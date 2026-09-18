import { useEffect, useRef, useState } from "react";

import { getApplications, deleteApplication } from "./api/applications";
import type { Application } from "./types/application";

import CreateApplicationForm from "./components/CreateApplicationForm";
import ApplicationItem from "./components/ApplicationItem";
import EditApplicationForm from "./components/EditApplicationForm";
import ApplicationAnalyticsDashboard from "./components/ApplicationAnalyticsDashboard";
import ApplicationListControls, {
  type ApplicationSortOption,
} from "./components/ApplicationListControls";

import ApplicationOverview, {
  type ApplicationFilter,
} from "./components/ApplicationOverview";

import "./App.css";

const companyCollator = new Intl.Collator("de-DE", {
  usage: "sort",
  sensitivity: "base",
});

function compareApplications(
  a: Application,
  b: Application,
  sortOption: ApplicationSortOption,
) {
  const companyOrder = companyCollator.compare(a.company_name, b.company_name);
  const dateOrder =
    a.application_date < b.application_date
      ? -1
      : a.application_date > b.application_date
        ? 1
        : 0;
  const idOrder = a.id - b.id;

  switch (sortOption) {
    case "date-newest":
      return -dateOrder || companyOrder || idOrder;
    case "date-oldest":
      return dateOrder || companyOrder || idOrder;
    case "company-asc":
      return companyOrder || -dateOrder || idOrder;
    case "company-desc":
      return -companyOrder || -dateOrder || idOrder;
  }
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsRefreshVersion, setAnalyticsRefreshVersion] = useState(0);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ApplicationFilter>("all");
  const [sortOption, setSortOption] =
    useState<ApplicationSortOption>("date-newest");
  const resultSummaryRef = useRef<HTMLParagraphElement>(null);
  const deletionFocusRef = useRef<Element | null>(null);

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de-DE");
  const searchMatches = applications.filter(
    (application) =>
      application.company_name
        .toLocaleLowerCase("de-DE")
        .includes(normalizedQuery) ||
      (application.position_title ?? "")
        .toLocaleLowerCase("de-DE")
        .includes(normalizedQuery),
  );
  const statusMatches =
    activeFilter === "all"
      ? searchMatches
      : searchMatches.filter(
          (application) => application.status === activeFilter,
        );
  const visibleApplications = [...statusMatches].sort((a, b) =>
    compareApplications(a, b, sortOption),
  );
  const canResetView =
    searchQuery !== "" ||
    activeFilter !== "all" ||
    sortOption !== "date-newest";

  useEffect(() => {
    const previousFocus = deletionFocusRef.current;
    deletionFocusRef.current = null;

    if (
      previousFocus &&
      !previousFocus.isConnected &&
      (document.activeElement === document.body ||
        document.activeElement === document.documentElement)
    ) {
      resultSummaryRef.current?.focus();
    }
  }, [applications]);

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

        {!isLoading && !error && (
          <>
            <ApplicationListControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
            <div className="application-results">
              <p
                ref={resultSummaryRef}
                className="application-result-summary"
                role="status"
                aria-atomic="true"
                tabIndex={-1}
              >
                {visibleApplications.length} von {applications.length}{" "}
                {applications.length === 1 ? "Bewerbung" : "Bewerbungen"}{" "}
                angezeigt
              </p>
              {canResetView && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                    setSortOption("date-newest");
                    resultSummaryRef.current?.focus();
                  }}
                >
                  Ansicht zurücksetzen
                </button>
              )}
            </div>
          </>
        )}

        {!isLoading && !error && applications.length === 0 && (
          <div className="empty-state">
            <h3>Noch keine Bewerbungen</h3>
            <p>Nach dem Hinzufügen erscheint hier die erste Bewerbung.</p>
          </div>
        )}

        {!isLoading &&
          !error &&
          applications.length > 0 &&
          visibleApplications.length === 0 && (
            <div className="empty-state">
              <h3>Keine passenden Bewerbungen</h3>
              <p>
                Die aktuelle Suche oder der Statusfilter ergibt keine Treffer.
              </p>
            </div>
          )}

        {!isLoading && !error && visibleApplications.length > 0 && (
          <ul className="application-list">
            {visibleApplications.map((application) => (
              <ApplicationItem
                key={application.id}
                application={application}
                onEdit={(application) => {
                  setIsCreateOpen(false);
                  setEditingApplication(application);
                }}
                onDelete={async (application) => {
                  const focusedElement = document.activeElement;
                  await deleteApplication(application.id);
                  deletionFocusRef.current = focusedElement;
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

      <ApplicationAnalyticsDashboard refreshVersion={analyticsRefreshVersion} />
    </main>
  );
}

export default App;
