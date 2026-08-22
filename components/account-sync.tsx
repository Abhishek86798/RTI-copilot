"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

import { setStoreMode } from "@/lib/client/store";

/**
 * Keeps the store's backing mode in step with Clerk's auth state.
 *
 * Imports `@clerk/nextjs`, so like `clerk-controls.tsx` this file is only ever
 * reached behind the `isAuthConfigured` check. Do not import it directly.
 */
export function AccountSync() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    setStoreMode(isSignedIn ? "account" : "guest");
  }, [isLoaded, isSignedIn]);

  return null;
}
