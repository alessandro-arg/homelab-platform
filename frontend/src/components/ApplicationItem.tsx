import { useId, useState } from "react";
import { rejectionReasonLabels, statusLabels } from "../types/application";
import type { Application } from "../types/application";

interface ApplicationItemProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => Promise<void>;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function ApplicationItem({
  application,
  onEdit,
  onDelete,
}: ApplicationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = useId();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const hasDetails = Boolean(
    application.status === "rejected" ||
    application.contact_person ||
    application.contact_email ||
    application.job_url ||
    application.notes,
  );

  async function handleDelete() {
    const confirmed = window.confirm(
      `Bewerbung bei ${application.company_name} löschen?`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onDelete(application);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Ein unerwarteter Fehler ist aufgetreten.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <li className="application-item" data-expanded={isExpanded}>
      <div className="application-main">
        <div className="application-title">
          <strong className="application-company">
            {application.company_name}
          </strong>
          {application.position_title && (
            <span className="application-position">
              {application.position_title}
            </span>
          )}
        </div>

        <span className={`status status-${application.status}`}>
          {statusLabels[application.status]}
        </span>
      </div>

      <div className="application-footer">
        <time
          className="application-date"
          dateTime={application.application_date}
        >
          {formatDate(application.application_date)}
        </time>

        <button
          type="button"
          className="application-disclosure"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          aria-label={`Details ${isExpanded ? "ausblenden" : "anzeigen"} für Bewerbung bei ${application.company_name}`}
          onClick={() => setIsExpanded((current) => !current)}
          disabled={isDeleting}
        >
          <span>{isExpanded ? "Details ausblenden" : "Details anzeigen"}</span>
          <span aria-hidden="true">{isExpanded ? "▴" : "▾"}</span>
        </button>
      </div>

      <div id={detailsId} className="application-details" hidden={!isExpanded}>
        {hasDetails && (
          <dl className="application-detail-fields">
            {application.status === "rejected" && (
              <div className="application-detail-field">
                <dt>Absagegrund</dt>
                <dd>
                  {application.rejection_reason == null
                    ? "Nicht erfasst"
                    : rejectionReasonLabels[application.rejection_reason]}
                </dd>
              </div>
            )}

            {application.contact_person && (
              <div className="application-detail-field">
                <dt>Kontakt</dt>
                <dd>{application.contact_person}</dd>
              </div>
            )}

            {application.contact_email && (
              <div className="application-detail-field">
                <dt>E-Mail</dt>
                <dd>
                  <a href={`mailto:${application.contact_email}`}>
                    {application.contact_email}
                  </a>
                </dd>
              </div>
            )}

            {application.job_url && (
              <div className="application-detail-field">
                <dt>Stellenanzeige</dt>
                <dd>
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Link öffnen ↗
                  </a>
                </dd>
              </div>
            )}

            {application.notes && (
              <div className="application-detail-field">
                <dt>Notizen</dt>
                <dd className="application-notes">{application.notes}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="application-actions">
          <button
            type="button"
            onClick={() => onEdit(application)}
            disabled={isDeleting}
          >
            Bearbeiten
          </button>

          <button
            type="button"
            className="button-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Wird gelöscht…" : "Löschen"}
          </button>
        </div>

        {deleteError && (
          <p role="alert" className="error-message">
            Bewerbung konnte nicht gelöscht werden. {deleteError}
          </p>
        )}
      </div>
    </li>
  );
}

export default ApplicationItem;
