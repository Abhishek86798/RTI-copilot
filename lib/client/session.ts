"use client";

import { setStoreMode } from "./store";

/**
 * Who is signed in, in one place.
 *
 * The header resolved the session on mount and kept the answer to itself, so
 * signing in from anywhere else — the gate on the landing page, most of all —
 * left the header still offering "Sign in" to somebody who had just signed in.
 * Nothing was wrong with the session; two components were each holding their
 * own idea of it and only one had been told.
 *
 * An external store rather than context: `useSyncExternalStore` keeps reads
 * synchronous, the value is one nullable string, and a provider around the
 * whole app to carry it would be more machinery than the fact deserves.
 *
 * Setting the session also swaps the application store's backing mode, since
 * the two answers are the same answer.
 */
let email: string | null = null;
let loaded = false;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionEmail(): string | null {
  return email;
}

/** False until the cookie has been resolved, so the header can hold its space. */
export function isSessionLoaded(): boolean {
  return loaded;
}

export function setSession(next: string | null) {
  email = next;
  loaded = true;
  setStoreMode(next ? "account" : "guest");
  emit();
}

/**
 * Resolve the cookie once. Concurrent callers share the flight — the header
 * mounts and the landing page's gate can both ask within the same tick.
 */
let inFlight: Promise<string | null> | null = null;

export function loadSession(): Promise<string | null> {
  if (inFlight) return inFlight;

  inFlight = fetch("/api/auth/session")
    .then((response) => response.json())
    .then((body: { email: string | null }) => {
      setSession(body.email);
      return body.email;
    })
    .catch(() => {
      /* Offline: guest mode is the working state, not an error state. */
      loaded = true;
      emit();
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
