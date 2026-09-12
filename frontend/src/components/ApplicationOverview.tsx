import { statusLabels } from "../types/application";
import type { Application, ApplicationStatus } from "../types/application";

export type ApplicationFilter = "all" | ApplicationStatus;

interface ApplicationOverviewProps {
  applications: Application[];
  activeFilter: ApplicationFilter;
  onFilterChange: (filter: ApplicationFilter) => void;
}

const filters: {
  value: ApplicationFilter;
  label: string;
}[] = [
  { value: "all", label: "Alle" },
  { value: "applied", label: statusLabels.applied },
  { value: "interview", label: statusLabels.interview },
  { value: "rejected", label: statusLabels.rejected },
  { value: "offer", label: statusLabels.offer },
];

function ApplicationOverview({
  applications,
  activeFilter,
  onFilterChange,
}: ApplicationOverviewProps) {
  function countApplications(filter: ApplicationFilter) {
    if (filter === "all") {
      return applications.length;
    }

    return applications.filter((application) => application.status === filter)
      .length;
  }

  return (
    <section className="application-overview" aria-label="Bewerbungsübersicht">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={`overview-card ${
            activeFilter === filter.value ? "overview-card-active" : ""
          }`}
          aria-pressed={activeFilter === filter.value}
          onClick={() => onFilterChange(filter.value)}
        >
          <span className="overview-label">{filter.label}</span>
          <strong>{countApplications(filter.value)}</strong>
        </button>
      ))}
    </section>
  );
}

export default ApplicationOverview;
