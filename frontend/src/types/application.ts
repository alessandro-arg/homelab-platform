export type ApplicationStatus = "applied" | "interview" | "rejected" | "offer";

export type RejectionReason =
  | "no_reason_provided"
  | "position_filled"
  | "experience_or_qualifications"
  | "location"
  | "language"
  | "salary_or_conditions"
  | "timing"
  | "other";

export const rejectionReasonLabels: Record<RejectionReason, string> = {
  no_reason_provided: "No reason provided",
  position_filled: "Position filled",
  experience_or_qualifications: "Experience or qualifications",
  location: "Location",
  language: "Language",
  salary_or_conditions: "Salary or conditions",
  timing: "Timing",
  other: "Other",
};

export interface ApplicationCreate {
  company_name: string;
  position_title?: string | null;
  status: ApplicationStatus;
  rejection_reason?: RejectionReason | null;
  application_date: string;
  contact_person?: string | null;
  contact_email?: string | null;
  job_url?: string | null;
  notes?: string | null;
}

export interface Application {
  id: number;
  company_name: string;
  position_title?: string | null;
  status: ApplicationStatus;
  rejection_reason?: RejectionReason | null;
  application_date: string;
  contact_person?: string | null;
  contact_email?: string | null;
  job_url?: string | null;
  notes?: string | null;
}

export type ApplicationUpdate = ApplicationCreate;
