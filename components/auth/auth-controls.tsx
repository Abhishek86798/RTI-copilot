"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";

import { LoginDialog } from "@/components/auth/login-dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/client/i18n";
import { setStoreMode } from "@/lib/client/store";
import { cn } from "@/lib/utils";

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
  const { t } = useI18n();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /*
   * Close the account menu on an outside click or Escape. Without both, the
   * only way out is the button that opened it — which a keyboard user cannot
   * guess and a touch user expects to dismiss by tapping away.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

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
    return <div aria-busy="true" className="h-9 w-24" />;
  }

  if (email) {
    return (
      <div ref={menuRef} className="relative">
        {/*
          An avatar, not the address. The email ran to 18 characters in the
          bar beside a "Sign out" button, which is a lot of width spent
          telling someone something they already know. The initial identifies
          the account at a glance; the address itself is one tap away, where
          it matters — when you are checking which account you are in.
        */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className={cn(
            "grid size-9 cursor-pointer place-items-center rounded-full border border-border bg-card text-sm font-semibold uppercase transition-colors",
            "hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          {/* The letter is decorative; the button's name carries the account. */}
          <span aria-hidden="true">{email.trim().charAt(0)}</span>
          <span className="sr-only">{t("auth.account", { email })}</span>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border bg-card p-1 shadow-lg"
          >
            <p className="truncate px-3 py-2 text-sm opacity-75" title={email}>
              {email}
            </p>
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                void signOut();
              }}
              className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <LogOut aria-hidden="true" className="size-4" />
              {t("auth.signOut")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/*
        36px, and the only filled control left in the header.

        At 56px it pushed the control group 16px past a 320px viewport with the
        largest text setting — a horizontal scrollbar on every page, from the
        control that exists to prevent exactly that. It is also the only thing
        in the chrome still carrying the accent, now that the four toggles
        beside it have given theirs up, so it does not need size as well.
      */}
      <Button size="default" className="whitespace-nowrap" onClick={() => setOpen(true)}>
        <User aria-hidden="true" />
        {/*
          Icon-only on a phone. `sr-only` rather than `hidden`, so the button
          keeps its accessible name — the icon beside it is aria-hidden, and
          dropping the label outright would leave a button called nothing.
        */}
        <span className="sr-only sm:not-sr-only">{t("auth.signIn")}</span>
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
