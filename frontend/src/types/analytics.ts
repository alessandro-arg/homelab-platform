import type { ApplicationStatus, RejectionReason } from "./application";

export interface MonthlyApplicationCount {
  month: string;
  count: number;
}

export interface ApplicationAnalytics {
  total_applications: number;
  current_status_counts: Record<ApplicationStatus, number>;
  rejection_reason_counts: Record<RejectionReason, number>;
  rejected_without_recorded_reason: number;
  applications_by_month: MonthlyApplicationCount[];
}
