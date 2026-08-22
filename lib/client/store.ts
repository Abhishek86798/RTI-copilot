"use client";

import {
  createApplication as guestCreate,
  deleteApplication as guestDelete,
  listApplications as guestList,
  subscribe as guestSubscribe,
  updateApplication as guestUpdate,
  type Application,
  type NewApplicationInput,
} from "./guest-storage";

/**
 * One store the whole UI reads, backed by localStorage or by the account.
 *
 * Signed-in mode is not a different screen — it is the same screens against a
 * different backing store, which is why the swap lives here rather than in
 * every page. Guest mode stays exactly as it was: no account, no network.
 *
 * The server is the source of truth when signed in, but reads stay synchronous
 * so `useSyncExternalStore` keeps working. Rows are mirrored into an in-memory
 * cache, refreshed on mount and after every write.
 */

let mode: "guest" | "account" = "guest";
let cache: Application[] = [];
let loaded = false;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const unsubscribeGuest = guestSubscribe(listener);
  return () => {
    listeners.delete(listener);
    unsubscribeGuest();
  };
}

/** Called by the provider when Clerk's auth state resolves or changes. */
export function setStoreMode(next: "guest" | "account") {
  if (mode === next) return;
  mode = next;
  cache = [];
  loaded = false;
  emit();
  if (next === "account") void refresh();
}

export function getStoreMode() {
  return mode;
}

/** True once the account's rows have arrived, so the UI can hold the skeleton. */
export function isLoaded() {
  return mode === "guest" || loaded;
}

export async function refresh(): Promise<void> {
  if (mode !== "account") return;
  try {
    const response = await fetch("/api/applications");
    if (response.ok) {
      const body = await response.json();
      cache = body.applications ?? [];
    }
  } catch {
    // Offline or a failed request leaves the last known rows in place rather
    // than blanking a list the citizen is reading.
  } finally {
    loaded = true;
    emit();
  }
}

/* ---------------------------------------------------------------- */
/* Reads — synchronous, so useSyncExternalStore stays valid           */
/* ---------------------------------------------------------------- */

export function listApplications(): Application[] {
  return mode === "account" ? cache : guestList();
}

export function getApplication(id: string): Application | undefined {
  return listApplications().find((a) => a.id === id);
}

/* ---------------------------------------------------------------- */
/* Writes                                                             */
/* ---------------------------------------------------------------- */

export function createApplication(input: NewApplicationInput): Application {
  // Created locally first either way, so the UI can navigate immediately and
  // a slow network never costs someone the draft they just waited on.
  const application = guestCreate(input);
  if (mode === "account") {
    void fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application }),
    })
      .then(() => refresh())
      .catch(() => {});
  }
  return application;
}

export function updateApplication(
  id: string,
  patch: Partial<Omit<Application, "id" | "createdAt">>
): Application | undefined {
  const updated = guestUpdate(id, patch);

  if (mode === "account") {
    // Patch the cached row so the screen reflects the edit before the round
    // trip lands; refresh() reconciles with whatever the server stored.
    cache = cache.map((a) => (a.id === id ? { ...a, ...patch } : a));
    emit();
    void fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patch }),
    })
      .then(() => refresh())
      .catch(() => {});
    return cache.find((a) => a.id === id);
  }

  return updated;
}

export function deleteApplication(id: string): void {
  guestDelete(id);
  if (mode === "account") {
    cache = cache.filter((a) => a.id !== id);
    emit();
    void fetch(`/api/applications/${id}`, { method: "DELETE" })
      .then(() => refresh())
      .catch(() => {});
  }
}

// Pure helpers over an Application — re-exported so screens have one import.
export { canSimulate, deriveStatus } from "./guest-storage";
export type { Application };
