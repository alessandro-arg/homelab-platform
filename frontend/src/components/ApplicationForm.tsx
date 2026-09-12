import { useState, type FormEvent } from "react";

import { rejectionReasonLabels, statusLabels } from "../types/application";
import type {
  ApplicationCreate,
  ApplicationStatus,
  RejectionReason,
} from "../types/application";

interface ApplicationFormProps {
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: ApplicationCreate;
  onSubmit: (application: ApplicationCreate) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  company_name: string;
  position_title: string;
  status: ApplicationStatus;
  rejection_reason: RejectionReason | "";
  application_date: string;
  contact_person: string;
  contact_email: string;
  job_url: string;
  notes: string;
}

function buildInitialState(initialValues?: ApplicationCreate): FormState {
  return {
    company_name: initialValues?.company_name ?? "",
    position_title: initialValues?.position_title ?? "",
    status: initialValues?.status ?? "applied",
    rejection_reason:
      initialValues?.status === "rejected"
        ? (initialValues.rejection_reason ?? "")
        : "",
    application_date: initialValues?.application_date ?? "",
    contact_person: initialValues?.contact_person ?? "",
    contact_email: initialValues?.contact_email ?? "",
    job_url: initialValues?.job_url ?? "",
    notes: initialValues?.notes ?? "",
  };
}

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function ApplicationForm({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(initialValues),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const application: ApplicationCreate = {
      company_name: form.company_name.trim(),
      position_title: optionalValue(form.position_title),
      status: form.status,
      rejection_reason:
        form.status === "rejected" && form.rejection_reason !== ""
          ? form.rejection_reason
          : null,
      application_date: form.application_date,
      contact_person: optionalValue(form.contact_person),
      contact_email: optionalValue(form.contact_email),
      job_url: optionalValue(form.job_url),
      notes: optionalValue(form.notes),
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(application);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Ein unerwarteter Fehler ist aufgetreten.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="application-form">
      <div className="form-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Unternehmen
            <input
              type="text"
              value={form.company_name}
              onChange={(event) =>
                setForm({ ...form, company_name: event.target.value })
              }
              required
            />
          </label>

          <label>
            Stelle
            <input
              type="text"
              value={form.position_title}
              onChange={(event) =>
                setForm({ ...form, position_title: event.target.value })
              }
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => {
                const status = event.target.value as ApplicationStatus;
                setForm((current) => ({
                  ...current,
                  status,
                  rejection_reason:
                    status === "rejected" ? current.rejection_reason : "",
                }));
              }}
            >
              <option value="applied">{statusLabels.applied}</option>
              <option value="interview">{statusLabels.interview}</option>
              <option value="rejected">{statusLabels.rejected}</option>
              <option value="offer">{statusLabels.offer}</option>
            </select>
          </label>

          {form.status === "rejected" && (
            <label>
              Absagegrund (optional)
              <select
                value={form.rejection_reason}
                onChange={(event) =>
                  setForm({
                    ...form,
                    rejection_reason: event.target.value as
                      | RejectionReason
                      | "",
                  })
                }
              >
                <option value="">Nicht erfasst</option>
                {Object.entries(rejectionReasonLabels).map(
                  ([reason, label]) => (
                    <option key={reason} value={reason}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}

          <label>
            Bewerbungsdatum
            <input
              type="date"
              value={form.application_date}
              onChange={(event) =>
                setForm({ ...form, application_date: event.target.value })
              }
              required
            />
          </label>

          <label>
            Kontaktperson
            <input
              type="text"
              value={form.contact_person}
              onChange={(event) =>
                setForm({ ...form, contact_person: event.target.value })
              }
            />
          </label>

          <label>
            E-Mail-Adresse der Kontaktperson
            <input
              type="email"
              value={form.contact_email}
              onChange={(event) =>
                setForm({ ...form, contact_email: event.target.value })
              }
            />
          </label>

          <label className="full-width">
            Link zur Stellenanzeige
            <input
              type="url"
              value={form.job_url}
              onChange={(event) =>
                setForm({ ...form, job_url: event.target.value })
              }
            />
          </label>

          <label className="full-width">
            Notizen
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
              maxLength={1000}
              rows={4}
            />
          </label>
        </div>

        {submitError && (
          <p role="alert" className="error-message">
            Bewerbung konnte nicht gespeichert werden. {submitError}
          </p>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            Abbrechen
          </button>

          <button
            type="submit"
            className="button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wird gespeichert…" : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ApplicationForm;
