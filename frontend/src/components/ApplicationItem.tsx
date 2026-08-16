import { useState } from "react";
import type { Application } from "../types/application";

interface ApplicationItemProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => Promise<void>;
}

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

function ApplicationItem({
  application,
  onEdit,
  onDelete,
}: ApplicationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete the application for ${application.company_name}?`,
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
          : "An unexpected error occurred while deleting the application.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <li className="application-item">
      <div className="application-primary">
        <strong>{application.company_name}</strong>
        <span>{application.position_title ?? "No position title"}</span>
      </div>

      <div className="application-meta">
        <span className={`status status-${application.status}`}>
          {formatStatus(application.status)}
        </span>

        <span>{formatDate(application.application_date)}</span>
      </div>

      <div className="application-actions">
        <button
          type="button"
          onClick={() => onEdit(application)}
          disabled={isDeleting}
        >
          Edit
        </button>

        <button type="button" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {deleteError && (
        <p role="alert" className="error-message">
          {deleteError}
        </p>
      )}

      {(application.contact_person ||
        application.contact_email ||
        application.job_url ||
        application.notes) && (
        <div className="application-details">
          {application.contact_person && (
            <span>Contact: {application.contact_person}</span>
          )}

          {application.contact_email && (
            <a href={`mailto:${application.contact_email}`}>
              {application.contact_email}
            </a>
          )}

          {application.job_url && (
            <a href={application.job_url} target="_blank" rel="noreferrer">
              Job posting
            </a>
          )}

          {application.notes && <p>{application.notes}</p>}
        </div>
      )}
    </li>
  );
}

export default ApplicationItem;
