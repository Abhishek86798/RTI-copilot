"use client";

import { useSyncExternalStore } from "react";
import {
  getApplication,
  isLoaded,
  listApplications,
  subscribe,
  type Application,
} from "./store";

/**
 * React bindings over the store.
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
 * True once the browser has taken over from the server render AND the store
 * has rows to show. Screens use this to hold a skeleton on the first paint
 * instead of flashing "you have no applications" at someone who has three —
 * which matters more when signed in, where the rows arrive over the network.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isLoaded(),
    () => false
  );
}
