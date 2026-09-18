import { useId, useRef } from "react";

export type ApplicationSortOption =
  | "date-newest"
  | "date-oldest"
  | "company-asc"
  | "company-desc";

interface ApplicationListControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: ApplicationSortOption;
  onSortChange: (option: ApplicationSortOption) => void;
}

function ApplicationListControls({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
}: ApplicationListControlsProps) {
  const searchId = useId();
  const sortId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="application-list-controls">
      <div className="application-list-control">
        <label htmlFor={searchId}>Unternehmen oder Stelle suchen</label>
        <div className="application-search">
          <input
            ref={searchInputRef}
            id={searchId}
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {searchQuery !== "" && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                searchInputRef.current?.focus();
              }}
            >
              Suche löschen
            </button>
          )}
        </div>
      </div>
      <div className="application-list-control">
        <label htmlFor={sortId}>Sortierung</label>
        <select
          id={sortId}
          value={sortOption}
          onChange={(event) =>
            onSortChange(event.target.value as ApplicationSortOption)
          }
        >
          <option value="date-newest">Bewerbungsdatum: neueste zuerst</option>
          <option value="date-oldest">Bewerbungsdatum: älteste zuerst</option>
          <option value="company-asc">Unternehmen: A-Z</option>
          <option value="company-desc">Unternehmen: Z-A</option>
        </select>
      </div>
    </div>
  );
}

export default ApplicationListControls;
