import { randomInt, timingSafeEqual } from "node:crypto";

import { canDeliverToAnyone, sendMail } from "@/lib/server/email";

/**
 * One-time codes, held in memory.
 *
 * ponytail: in-process Map, swap for Redis or a `login_codes` table when the
 * app runs on more than one instance. A serverless deployment with several
 * warm lambdas will drop codes issued by a sibling — acceptable for a
 * single-instance demo, not for production.
 *
 * Two deliberate differences from rtionline.gov.in, which this otherwise
 * mirrors:
 *
 *  - Codes expire. The real portal states "OTPs do not expire until they are
 *    used", which turns an intercepted email into a permanent key. Ten
 *    minutes is the usual ceiling and costs the citizen nothing.
 *  - Attempts are capped. Five wrong guesses burn the code, so a 4-digit
 *    space cannot be walked in a loop.
 */

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
/** Resend cooldown, so the button cannot be used to mailbomb an address. */
const RESEND_COOLDOWN_MS = 30 * 1000;

type Entry = { code: string; expiresAt: number; attempts: number; issuedAt: number };

const codes = new Map<string, Entry>();

/**
 * The fixed code, used wherever mail cannot actually be delivered.
 *
 * With no RESEND_API_KEY nothing sends; with the shared `onboarding@resend.dev`
 * sender Resend delivers only to the account owner. A random code the citizen
 * can never receive makes sign-in impossible rather than merely untestable, so
 * those deployments use a known one and the dialog says so out loud.
 *
 * AUTH_DEV_OTP=off forces real random codes; "on" forces the fixed one.
 */
export const DEV_OTP = "1234";

export function isDevOtpActive(): boolean {
  /*
   * "on" forces the fixed code even where mail would send.
   *
   * There was only an "off" switch before, so a deployment that had a Resend
   * key started issuing real six-digit codes by email the moment it was set —
   * which is correct behaviour, and a surprise if what you wanted was a demo
   * anyone can sign into. "off" still forces real codes; unset keeps the
   * automatic behaviour below.
   */
  if (process.env.AUTH_DEV_OTP === "on") return true;
  if (process.env.AUTH_DEV_OTP === "off") return false;

  /*
   * Otherwise: follow whether mail can actually be delivered, which is what
   * the fixed code is for.
   *
   * Checking NODE_ENV and the API key alone missed the case the deployment
   * was actually in — a key set, but the sender still the shared resend.dev
   * address. Resend accepts the request and delivers to nobody but the
   * account owner, so production issued real six-digit codes that no
   * applicant, and no reviewer, ever received. Sign-in was impossible on the
   * deployed site while working perfectly on localhost.
   *
   * Verifying a domain and setting RESEND_FROM switches this off by itself,
   * which is the point: the behaviour tracks the deployment's actual ability
   * to send rather than a flag someone has to remember.
   */
  return !canDeliverToAnyone();
}

export type IssueResult =
  | { ok: true; delivery: "sent" | "logged" | "blocked"; devCode?: string }
  | { ok: false; retryAfterSeconds: number };

export async function issueCode(email: string): Promise<IssueResult> {
  const key = email.toLowerCase();
  const existing = codes.get(key);

  if (existing) {
    const since = Date.now() - existing.issuedAt;
    if (since < RESEND_COOLDOWN_MS) {
      return { ok: false, retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - since) / 1000) };
    }
  }

  const dev = isDevOtpActive();
  const code = dev ? DEV_OTP : String(randomInt(0, 1_000_000)).padStart(6, "0");

  codes.set(key, { code, expiresAt: Date.now() + TTL_MS, attempts: 0, issuedAt: Date.now() });

  const delivery = await sendMail({
    to: email,
    subject: `${code} is your RTI Copilot sign-in code`,
    text:
      `Your sign-in code is ${code}\n\n` +
      `It expires in 10 minutes. If you did not ask to sign in, ignore this email.\n\n` +
      `RTI Copilot is an independent prototype, not a government service.`,
  });

  return { ok: true, delivery, devCode: dev ? code : undefined };
}

export type VerifyResult = "ok" | "invalid" | "expired" | "too-many-attempts";

export function verifyCode(email: string, submitted: string): VerifyResult {
  const key = email.toLowerCase();
  const entry = codes.get(key);
  if (!entry) return "expired";

  if (Date.now() > entry.expiresAt) {
    codes.delete(key);
    return "expired";
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    codes.delete(key);
    return "too-many-attempts";
  }

  entry.attempts += 1;

  const given = Buffer.from(submitted.trim());
  const want = Buffer.from(entry.code);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return "invalid";

  // Single use, always — a code that survives verification is a reusable password.
  codes.delete(key);
  return "ok";
}
