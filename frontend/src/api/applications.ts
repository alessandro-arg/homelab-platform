import type { Application } from "../types/application";

export async function getApplications(
  signal?: AbortSignal,
): Promise<Application[]> {
  const response = await fetch("/api/applications", { signal });

  if (!response.ok) {
    throw new Error(
      `Failed to load applications: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<Application[]>;
}
