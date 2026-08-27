"use client";

import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";

import { LoginDialog } from "@/components/auth/login-dialog";
import { Button } from "@/components/ux4g/button";
import { setStoreMode } from "@/lib/client/store";

/**
 * One button in the header, and the session state behind it.
 *
 * Replaces the previous pair of Clerk buttons. Sign-up does not exist as a
 * separate act here: the first code sent to an address creates the account,
 * so there is nothing for a second button to do, and a citizen who has never
 * used the tool taps the same control as one who filed last month.
 *
 * Signing in is optional throughout. Guest mode keeps working with no account
 * and no network, so this control adds a capability rather than gating one —
 * the label says what it is for rather than demanding it.
 */
export function AuthControls() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  /* Resolve the cookie session once on mount, then mirror it into the store. */
  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((body: { email: string | null }) => {
        if (!active) return;
        setEmail(body.email);
        setStoreMode(body.email ? "account" : "guest");
      })
      .catch(() => {
        /* Offline: stay in guest mode rather than blocking the header. */
      })
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    setEmail(null);
    setStoreMode("guest");
  }

  /*
   * While the session is resolving, hold the button's space rather than
   * rendering nothing. An empty header that grows a button a moment later
   * shifts the layout under the citizen's finger, and `aria-busy` keeps a
   * screen reader from announcing a control that is about to change.
   */
  if (!ready) {
    return <div aria-busy="true" className="h-12 w-28" />;
  }

  if (email) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="hidden max-w-[18ch] truncate text-sm opacity-75 sm:inline"
          title={email}
        >
          {email}
        </span>
        <Button variant="ghost" size="xl" onClick={signOut}>
          <LogOut aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Sign out</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button size="xl" onClick={() => setOpen(true)}>
        <User aria-hidden="true" />
        Sign in
      </Button>
      <LoginDialog
        open={open}
        onClose={() => setOpen(false)}
        onSignedIn={(next) => {
          setEmail(next);
          setStoreMode("account");
        }}
      />
    </>
  );
}
