"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Sign-in, as one dialog with two panes.
 *
 * A native <dialog> rather than a modal component: focus trapping, Escape to
 * close, inertness of the page behind, and the backdrop all come from the
 * platform, and every one of them is something a hand-rolled modal gets wrong.
 *
 * The flow mirrors the status-check on rtionline.gov.in — email, a human
 * check, then a code — because that is the part of the real portal citizens
 * already recognise. What it does not mirror is their account system: no
 * password, no user id, no security questions. The code is the whole
 * authentication.
 */

type Pane = "identify" | "code";
type Challenge = { question: string; token: string };

export function LoginDialog({
  open,
  onClose,
  onSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignedIn: (email: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pane, setPane] = useState<Pane>("identify");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* Drive the native dialog from the `open` prop. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const loadChallenge = useCallback(
    () =>
      fetch("/api/auth/captcha")
        .then((response) => response.json())
        .then((next: Challenge) => {
          setChallenge(next);
          setCaptchaAnswer("");
        })
        .catch(() => setError("Could not load the verification question.")),
    []
  );

  useEffect(() => {
    if (open && !challenge) void loadChallenge();
  }, [open, challenge, loadChallenge]);

  function reset() {
    setPane("identify");
    setCode("");
    setDevCode(null);
    setError(null);
    setChallenge(null);
  }

  async function requestCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          captchaToken: challenge?.token,
          captchaAnswer,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "Something went wrong.");
        /* A challenge is spent once submitted, right or wrong. */
        void loadChallenge();
        return;
      }
      setDevCode(body.devCode ?? null);
      setPane("code");
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "Something went wrong.");
        return;
      }
      onSignedIn(body.email);
      reset();
      onClose();
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={() => {
        reset();
        onClose();
      }}
      aria-labelledby="login-title"
      className="m-auto w-[min(92vw,30rem)] rounded-xl border border-border bg-card p-0 text-foreground backdrop:bg-black/50"
    >
      <div className="p-8">
        <h2 id="login-title" className="text-2xl font-semibold tracking-tight">
          {pane === "identify" ? "Sign in" : "Enter your code"}
        </h2>
        <p className="mt-2 max-w-[46ch] text-sm leading-relaxed opacity-75">
          {pane === "identify"
            ? "Signing in keeps your applications across devices. You can also use this tool without an account."
            : `We sent a code to ${email}.`}
        </p>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {devCode && (
          <Alert className="mt-6 border-warning/30 bg-warning/10">
            <AlertTitle>Development mode</AlertTitle>
            <AlertDescription>
              Email delivery is not configured, so no message was sent. Your code is{" "}
              <strong className="font-mono">{devCode}</strong>.
            </AlertDescription>
          </Alert>
        )}

        {pane === "identify" ? (
          <form onSubmit={requestCode} className="mt-6 space-y-5">
            <div>
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="login-phone">
                Mobile number <span className="opacity-60">(optional)</span>
              </Label>
              <Input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2"
                aria-describedby="login-phone-help"
              />
              <p id="login-phone-help" className="mt-2 text-sm opacity-75">
                Used on your RTI application. We do not send codes by SMS.
              </p>
            </div>

            <div>
              <Label htmlFor="login-captcha">
                {challenge?.question ?? "Loading verification question…"}
              </Label>
              <Input
                id="login-captcha"
                inputMode="numeric"
                required
                value={captchaAnswer}
                onChange={(event) => setCaptchaAnswer(event.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" size="lg" disabled={busy || !challenge}>
                {busy ? (
                  <Loader2 aria-hidden="true" className="animate-spin" />
                ) : (
                  <Mail aria-hidden="true" />
                )}
                Send code
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitCode} className="mt-6 space-y-5">
            <div>
              <Label htmlFor="login-code">Sign-in code</Label>
              <Input
                id="login-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-2 font-mono text-lg tracking-widest"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" size="lg" disabled={busy}>
                {busy && <Loader2 aria-hidden="true" className="animate-spin" />}
                Sign in
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={reset}>
                Use a different email
              </Button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
