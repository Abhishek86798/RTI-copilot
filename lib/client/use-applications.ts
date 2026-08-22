"use client";

import { useSyncExternalStore } from "react";
import {
  getApplication,
  listApplications,
  subscribe,
  type Application,
} from "./guest-storage";

/**
 * React bindings over the guest store.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` because the store
 * is also written to from other tabs and from event handlers outside React.
 * It also gives us a correct server snapshot, so these hooks can be called from
 * components that server-render without tripping a hydration mismatch.
 */

const emptySnapshot: Application[] = [];

export function useApplications(): Application[] {
  return useSyncExternalStore(
    subscribe,
    listApplications,
    () => emptySnapshot // localStorage does not exist during SSR.
  );
}

export function useApplication(id: string): Application | undefined {
  return useSyncExternalStore(
    subscribe,
    () => getApplication(id),
    () => undefined
  );
}

/**
 * True once the browser has taken over from the server render. Screens that
 * read localStorage use this to show a skeleton on the first paint instead of
 * flashing an "you have no applications" empty state at someone who has three.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
