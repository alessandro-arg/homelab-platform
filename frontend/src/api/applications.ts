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
      `Fehler beim Laden der Bewerbungen: ${response.status} ${response.statusText}`,
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
      `Fehler beim Anlegen der Bewerbung: ${response.status} ${response.statusText}`,
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
      `Fehler beim Aktualisieren der Bewerbung: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<Application>;
}

export async function deleteApplication(id: number): Promise<void> {
  const response = await fetch(`/api/applications/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Fehler beim Löschen der Bewerbung: ${response.status} ${response.statusText}`,
    );
  }
}
