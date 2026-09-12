import { useEffect, useState } from "react";
import { getApplicationAnalytics } from "../api/analytics";
import type { ApplicationAnalytics } from "../types/analytics";
import { rejectionReasonLabels, statusLabels } from "../types/application";
import type { ApplicationStatus, RejectionReason } from "../types/application";

const monthFormatter = new Intl.DateTimeFormat("de-DE", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatMonth(month: string): string {
  return monthFormatter.format(new Date(`${month}-01T00:00:00Z`));
}

function CountRow({
  label,
  count,
  maximum,
}: {
  label: string;
  count: number;
  maximum: number;
}) {
  return (
    <li className="analytics-row">
      <div className="analytics-row-label">
        <span>{label}</span>
        <strong>{count}</strong>
      </div>
      <div className="analytics-bar-track" aria-hidden="true">
        <div
          className="analytics-bar"
          style={{ width: `${maximum > 0 ? (count / maximum) * 100 : 0}%` }}
        />
      </div>
    </li>
  );
}

function ApplicationAnalyticsDashboard({
  refreshVersion,
}: {
  refreshVersion: number;
}) {
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalytics() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getApplicationAnalytics(controller.signal);
        if (!controller.signal.aborted) {
          setAnalytics(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Ein unerwarteter Fehler ist aufgetreten.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalytics();
    return () => controller.abort();
  }, [refreshVersion, retryVersion]);

  const isInitialLoading = isLoading && analytics === null;
  const isRefreshing = isLoading && analytics !== null;
  const reasons = (
    Object.keys(rejectionReasonLabels) as RejectionReason[]
  ).filter(
    (reason) => analytics && analytics.rejection_reason_counts[reason] > 0,
  );
  const statusMaximum = analytics
    ? Math.max(0, ...Object.values(analytics.current_status_counts))
    : 0;
  const reasonMaximum = analytics
    ? Math.max(0, ...Object.values(analytics.rejection_reason_counts))
    : 0;
  const monthMaximum = analytics
    ? analytics.applications_by_month.reduce(
        (maximum, month) => Math.max(maximum, month.count),
        0,
      )
    : 0;

  return (
    <section
      className="analytics-dashboard"
      aria-labelledby="analytics-heading"
    >
      <h2 id="analytics-heading">Bewerbungsstatistik</h2>
      <p className="analytics-description">
        Alle Bewerbungen · Aktuell gespeicherte Einträge
      </p>

      <div role="status">
        {(isInitialLoading || isRefreshing) && (
          <p className="loading-state">
            {isInitialLoading
              ? "Statistik wird geladen…"
              : "Statistik wird aktualisiert…"}
          </p>
        )}
      </div>

      {error && (
        <div className="analytics-error">
          <p className="error-message" role="alert">
            {analytics
              ? "Statistik konnte nicht aktualisiert werden. Die angezeigten Zahlen sind möglicherweise veraltet."
              : "Statistik konnte nicht geladen werden."}{" "}
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRetryVersion((current) => current + 1)}
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {analytics && (
        <>
          <dl className="analytics-total">
            <dt>Bewerbungen insgesamt</dt>
            <dd>{analytics.total_applications}</dd>
          </dl>

          {analytics.total_applications === 0 ? (
            <div className="empty-state">
              <h3>Noch keine Bewerbungen zur Auswertung</h3>
              <p>
                Nach dem Hinzufügen der ersten Bewerbung erscheint hier die
                Statistik.
              </p>
            </div>
          ) : (
            <div className="analytics-grid">
              <section
                className="analytics-panel"
                aria-labelledby="analytics-status-heading"
              >
                <h3 id="analytics-status-heading">Aktueller Status</h3>
                <p className="analytics-description">
                  Jede Bewerbung wird nur ihrem aktuellen Status zugeordnet.
                </p>
                <ul className="analytics-rows">
                  {(Object.keys(statusLabels) as ApplicationStatus[]).map(
                    (status) => (
                      <CountRow
                        key={status}
                        label={statusLabels[status]}
                        count={analytics.current_status_counts[status]}
                        maximum={statusMaximum}
                      />
                    ),
                  )}
                </ul>
              </section>

              <section
                className="analytics-panel"
                aria-labelledby="analytics-month-heading"
              >
                <h3 id="analytics-month-heading">Bewerbungen nach Monat</h3>
                <p className="analytics-description">
                  Basiert auf Bewerbungsdatum. Monate ohne Bewerbungen werden
                  nicht angezeigt.
                </p>
                <ul className="analytics-rows">
                  {analytics.applications_by_month.map(({ month, count }) => (
                    <CountRow
                      key={month}
                      label={formatMonth(month)}
                      count={count}
                      maximum={monthMaximum}
                    />
                  ))}
                </ul>
              </section>

              <section
                className="analytics-panel"
                aria-labelledby="analytics-reason-heading"
              >
                <h3 id="analytics-reason-heading">
                  Verteilung der Absagegründe
                </h3>
                {analytics.current_status_counts.rejected === 0 ? (
                  <p className="analytics-description">Noch keine Absagen.</p>
                ) : (
                  <>
                    {reasons.length > 0 ? (
                      <ul className="analytics-rows">
                        {reasons.map((reason) => (
                          <CountRow
                            key={reason}
                            label={rejectionReasonLabels[reason]}
                            count={analytics.rejection_reason_counts[reason]}
                            maximum={reasonMaximum}
                          />
                        ))}
                      </ul>
                    ) : (
                      <p className="analytics-description">
                        Für die abgelehnten Bewerbungen wurden keine
                        Absagegründe erfasst.
                      </p>
                    )}
                    {analytics.rejected_without_recorded_reason > 0 && (
                      <>
                        <dl className="analytics-missing-reason">
                          <dt>Absagen ohne erfassten Grund</dt>
                          <dd>{analytics.rejected_without_recorded_reason}</dd>
                        </dl>
                        <p className="analytics-description">
                          Nicht erfasste Gründe werden getrennt von der
                          Kategorie „Kein Grund genannt“ gezählt.
                        </p>
                      </>
                    )}
                  </>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ApplicationAnalyticsDashboard;
