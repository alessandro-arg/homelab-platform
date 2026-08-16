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
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "rejected", label: "Rejected" },
  { value: "offer", label: "Offer" },
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
    <section className="application-overview" aria-label="Application overview">
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
