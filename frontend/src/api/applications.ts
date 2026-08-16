import type {
  Application,
  ApplicationCreate,
  ApplicationUpdate,
} from "../types/application";

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

export async function createApplication(
  application: ApplicationCreate,
): Promise<Application> {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(application),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create application: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<Application>;
}

export async function updateApplication(
  id: number,
  application: ApplicationUpdate,
): Promise<Application> {
  const response = await fetch(`/api/applications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(application),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update application: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<Application>;
}
