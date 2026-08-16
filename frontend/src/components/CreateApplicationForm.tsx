import { useState, type FormEvent } from "react";

import { createApplication } from "../api/applications";
import type {
  Application,
  ApplicationCreate,
  ApplicationStatus,
} from "../types/application";

interface CreateApplicationFormProps {
  onCreated: (application: Application) => void;
  onCancel: () => void;
}

interface FormState {
  company_name: string;
  position_title: string;
  status: ApplicationStatus;
  application_date: string;
  contact_person: string;
  contact_email: string;
  job_url: string;
  notes: string;
}

const initialFormState: FormState = {
  company_name: "",
  position_title: "",
  status: "applied",
  application_date: "",
  contact_person: "",
  contact_email: "",
  job_url: "",
  notes: "",
};

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function CreateApplicationForm({
  onCreated,
  onCancel,
}: CreateApplicationFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const application: ApplicationCreate = {
      company_name: form.company_name.trim(),
      position_title: optionalValue(form.position_title),
      status: form.status,
      application_date: form.application_date,
      contact_person: optionalValue(form.contact_person),
      contact_email: optionalValue(form.contact_email),
      job_url: optionalValue(form.job_url),
      notes: optionalValue(form.notes),
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdApplication = await createApplication(application);
      onCreated(createdApplication);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="create-application">
      <div className="form-heading">
        <div>
          <h2>Add application</h2>
          <p>Record a new internship or job application.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Company
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
            Position
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
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value as ApplicationStatus,
                })
              }
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="offer">Offer</option>
            </select>
          </label>

          <label>
            Application date
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
            Contact person
            <input
              type="text"
              value={form.contact_person}
              onChange={(event) =>
                setForm({ ...form, contact_person: event.target.value })
              }
            />
          </label>

          <label>
            Contact email
            <input
              type="email"
              value={form.contact_email}
              onChange={(event) =>
                setForm({ ...form, contact_email: event.target.value })
              }
            />
          </label>

          <label className="full-width">
            Job URL
            <input
              type="url"
              value={form.job_url}
              onChange={(event) =>
                setForm({ ...form, job_url: event.target.value })
              }
            />
          </label>

          <label className="full-width">
            Notes
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
            {submitError}
          </p>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save application"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateApplicationForm;
