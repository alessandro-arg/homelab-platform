import { Fragment, useLayoutEffect, useRef, type RefObject } from "react";

interface ApplicationPaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  fallbackFocusRef: RefObject<HTMLElement | null>;
}

function ApplicationPagination({
  currentPage,
  pageCount,
  onPageChange,
  fallbackFocusRef,
}: ApplicationPaginationProps) {
  const focusedButtonRef = useRef<HTMLButtonElement>(null);
  const currentPageButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const focusedButton = focusedButtonRef.current;
    if (
      !focusedButton ||
      (focusedButton.isConnected && !focusedButton.disabled)
    ) {
      return;
    }

    focusedButtonRef.current = null;
    const activeElement = document.activeElement;
    if (
      activeElement === focusedButton ||
      activeElement === document.body ||
      activeElement === document.documentElement
    ) {
      (currentPageButtonRef.current ?? fallbackFocusRef.current)?.focus();
    }
  }, [currentPage, pageCount, fallbackFocusRef]);

  if (pageCount <= 1) {
    return null;
  }

  const showAllPages = pageCount <= 5;
  const firstVisiblePage = showAllPages ? 1 : Math.max(2, currentPage - 1);
  const lastVisiblePage = showAllPages
    ? pageCount
    : Math.min(pageCount - 1, currentPage + 1);
  const visiblePages = Array.from(
    { length: lastVisiblePage - firstVisiblePage + 1 },
    (_, index) => firstVisiblePage + index,
  );
  const pages = showAllPages ? visiblePages : [1, ...visiblePages, pageCount];

  return (
    <nav
      className="application-pagination"
      aria-label="Bewerbungsseiten"
      onFocus={(event) => {
        if (event.target instanceof HTMLButtonElement) {
          focusedButtonRef.current = event.target;
        }
      }}
      onBlur={() => {
        const button = focusedButtonRef.current;
        // Retain the reference if the update disabled or removed the control.
        if (button?.isConnected && !button.disabled) {
          focusedButtonRef.current = null;
        }
      }}
    >
      <button
        type="button"
        aria-label="Vorherige Seite"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M5 12h14" />
        </svg>
      </button>

      {pages.map((page, index) => (
        <Fragment key={page}>
          {index > 0 && page - pages[index - 1] > 1 && (
            <span className="application-pagination-gap" aria-hidden="true">
              …
            </span>
          )}
          <button
            type="button"
            ref={page === currentPage ? currentPageButtonRef : undefined}
            aria-label={`Seite ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        </Fragment>
      ))}

      <button
        type="button"
        aria-label="Nächste Seite"
        disabled={currentPage === pageCount}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

export default ApplicationPagination;
