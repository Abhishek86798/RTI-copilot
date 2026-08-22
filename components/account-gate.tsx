"use client";

import dynamic from "next/dynamic";

import { isAuthConfigured } from "@/lib/client/auth-config";

/**
 * Loads the account-aware pieces only when Clerk is configured.
 *
 * A static import of `@clerk/nextjs` throws on every render when no
 * publishable key is set, which takes the guest journey down with it. Guest
 * mode is a first-class path in the PRD, not a fallback, so it must keep
 * working with no external service at all.
 */

const AccountSync = dynamic(
  () => import("./account-sync").then((m) => m.AccountSync),
  { ssr: false }
);

export function AccountGate() {
  if (!isAuthConfigured) return null;
  return <AccountSync />;
}
