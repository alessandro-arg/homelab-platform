export type ApplicationStatus = "applied" | "interview" | "rejected" | "offer";

export const statusLabels: Record<ApplicationStatus, string> = {
  applied: "Beworben",
  interview: "Gespräch",
  rejected: "Absage",
  offer: "Angebot",
};

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
  no_reason_provided: "Kein Grund genannt",
  position_filled: "Stelle bereits besetzt",
  experience_or_qualifications: "Erfahrung oder Qualifikationen",
  location: "Standort",
  language: "Sprache",
  salary_or_conditions: "Gehalt oder Bedingungen",
  timing: "Zeitpunkt",
  other: "Sonstiges",
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
