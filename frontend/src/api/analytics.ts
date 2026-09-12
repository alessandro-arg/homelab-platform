import type { ApplicationAnalytics } from "../types/analytics";

export async function getApplicationAnalytics(
  signal?: AbortSignal,
): Promise<ApplicationAnalytics> {
  const response = await fetch("/api/analytics/applications", { signal });

  if (!response.ok) {
    throw new Error(
      `Fehler beim Laden der Statistik: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<ApplicationAnalytics>;
}
