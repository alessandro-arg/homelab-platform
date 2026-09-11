import { useEffect, useState } from "react";
import { getApplicationAnalytics } from "../api/analytics";
import type { ApplicationAnalytics } from "../types/analytics";
import { rejectionReasonLabels } from "../types/application";
import type { ApplicationStatus, RejectionReason } from "../types/application";

const statusLabels: Record<ApplicationStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  rejected: "Rejected",
  offer: "Offer",
};

const monthFormatter = new Intl.DateTimeFormat("en", {
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
              : "An unexpected error occurred while loading analytics.",
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
      <h2 id="analytics-heading">Application analytics</h2>
      <p className="analytics-description">
        All applications · Current stored records
      </p>

      <div role="status">
        {(isInitialLoading || isRefreshing) && (
          <p className="loading-state">
            {isInitialLoading ? "Loading analytics…" : "Updating analytics…"}
          </p>
        )}
      </div>

      {error && (
        <div className="analytics-error">
          <p className="error-message" role="alert">
            {analytics
              ? "Analytics could not be refreshed; displayed figures may be out of date."
              : "Analytics could not be loaded."}{" "}
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRetryVersion((current) => current + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {analytics && (
        <>
          <dl className="analytics-total">
            <dt>Total applications</dt>
            <dd>{analytics.total_applications}</dd>
          </dl>

          {analytics.total_applications === 0 ? (
            <div className="empty-state">
              <h3>No applications to summarize yet</h3>
              <p>Add your first application to see analytics here.</p>
            </div>
          ) : (
            <div className="analytics-grid">
              <section
                className="analytics-panel"
                aria-labelledby="analytics-status-heading"
              >
                <h3 id="analytics-status-heading">
                  Current status distribution
                </h3>
                <p className="analytics-description">
                  Each application counts toward its current status only.
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
                <h3 id="analytics-month-heading">
                  Applications submitted by month
                </h3>
                <p className="analytics-description">
                  Based on application dates. Months without applications are
                  omitted.
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
                  Rejection reason distribution
                </h3>
                {analytics.current_status_counts.rejected === 0 ? (
                  <p className="analytics-description">
                    No rejected applications yet.
                  </p>
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
                        No rejection reasons recorded for the rejected
                        applications.
                      </p>
                    )}
                    {analytics.rejected_without_recorded_reason > 0 && (
                      <>
                        <dl className="analytics-missing-reason">
                          <dt>Rejected without recorded reason</dt>
                          <dd>{analytics.rejected_without_recorded_reason}</dd>
                        </dl>
                        <p className="analytics-description">
                          Missing reasons are counted separately from the recorded
                          “No reason provided” category.
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
