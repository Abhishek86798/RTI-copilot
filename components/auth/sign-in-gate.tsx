"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { LoginDialog } from "@/components/auth/login-dialog";
import {
  getSessionEmail,
  isSessionLoaded,
  loadSession,
  setSession,
} from "@/lib/client/session";

/**
 * Sign in first, then continue where you were going.
 *
 * The two entry points on the landing page — "Start my application" and the
 * demo — are where someone commits to the journey, so that is where the
 * account question belongs. Asking in the header instead means a citizen fills
 * in a whole application as a guest and only then discovers the tool could
 * have kept it for them.
 *
 * It is the same dialog the header opens, so there is one sign-in in the
 * product and not two. The destination is held while the dialog is up and
 * followed the moment the code verifies, so signing in never costs the click
 * that started it.
 */
export function useSignInGate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [demo, setDemo] = useState(false);
  const pending = useRef<string | null>(null);

  const start = useCallback(
    async (href: string, options?: { demo?: boolean }) => {
      /*
       * Usually already resolved: the header asks on mount, and both callers
       * share the flight. Offline this answers null, and the dialog opens —
       * which is the same thing the header would do.
       */
      const email = isSessionLoaded() ? getSessionEmail() : await loadSession();

      if (email) {
        router.push(href);
        return;
      }

      pending.current = href;
      setDemo(options?.demo ?? false);
      setOpen(true);
    },
    [router]
  );

  const dialog = (
    <LoginDialog
      /*
       * Keyed on the mode so the dialog remounts when it changes. Its fields
       * start from `demo` on first render, and the gate renders it long before
       * either button is pressed — without the key the demo details would be
       * decided while the answer was still "not a demo".
       */
      key={demo ? "demo" : "own"}
      open={open}
      demo={demo}
      onClose={() => setOpen(false)}
      onSignedIn={(email) => {
        setSession(email);
        const href = pending.current;
        pending.current = null;
        setOpen(false);
        if (href) router.push(href);
      }}
    />
  );

  return { start, dialog };
}
