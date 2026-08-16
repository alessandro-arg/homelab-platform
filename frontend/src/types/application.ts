export type ApplicationStatus = "applied" | "interview" | "rejected" | "offer";

export interface ApplicationCreate {
  company_name: string;
  position_title?: string | null;
  status: ApplicationStatus;
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
  application_date: string;
  contact_person?: string | null;
  contact_email?: string | null;
  job_url?: string | null;
  notes?: string | null;
}

export type ApplicationUpdate = ApplicationCreate;
