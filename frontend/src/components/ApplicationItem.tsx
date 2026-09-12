import { useState } from "react";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const rejectionReason =
    application.status === "rejected" ? application.rejection_reason : null;

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
    <li className="application-item">
      <div className="application-main">
        <div className="application-title">
          <strong>{application.company_name}</strong>
          <span>{application.position_title ?? "Keine Stellenbezeichnung"}</span>
        </div>

        <span className={`status status-${application.status}`}>
          {statusLabels[application.status]}
        </span>
      </div>

      <div className="application-footer">
        <span className="application-date">
          {formatDate(application.application_date)}
        </span>

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
      </div>

      {deleteError && (
        <p role="alert" className="error-message">
          Bewerbung konnte nicht gelöscht werden. {deleteError}
        </p>
      )}

      {(rejectionReason ||
        application.contact_person ||
        application.contact_email ||
        application.job_url ||
        application.notes) && (
        <div className="application-details">
          {rejectionReason && (
            <span>Absagegrund: {rejectionReasonLabels[rejectionReason]}</span>
          )}

          {application.contact_person && (
            <span>Kontakt: {application.contact_person}</span>
          )}

          {application.contact_email && (
            <a href={`mailto:${application.contact_email}`}>
              {application.contact_email}
            </a>
          )}

          {application.job_url && (
            <a href={application.job_url} target="_blank" rel="noreferrer">
              Stellenanzeige
            </a>
          )}

          {application.notes && <p>{application.notes}</p>}
        </div>
      )}
    </li>
  );
}

export default ApplicationItem;
