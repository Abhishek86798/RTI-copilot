"use client";

import dynamic from "next/dynamic";

import { isAuthConfigured } from "@/lib/client/auth-config";

/**
 * Clerk's header controls, loaded only when Clerk is actually configured.
 *
 * The import is dynamic and browser-only for the same reason the provider is
 * deferred in the root layout: pulling `@clerk/nextjs` into the module graph
 * throws when no publishable key is set, and that would take the whole guest
 * journey down with it. Guest mode is a shipped path, not a fallback, so the
 * app has to render fully on a clone with no auth keys at all.
 */
const ClerkControls = dynamic(
  () => import("@/components/clerk-controls").then((m) => m.ClerkControls),
  { ssr: false }
);

export function AuthControls() {
  if (!isAuthConfigured) return null;
  return <ClerkControls />;
}
