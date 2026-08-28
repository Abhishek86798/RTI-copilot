import { randomInt, timingSafeEqual } from "node:crypto";

import { sendMail } from "@/lib/server/email";

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
 * The fixed development code.
 *
 * Real mail cannot leave this deployment yet: RESEND_API_KEY is unset, and the
 * shared `onboarding@resend.dev` sender only delivers to the Resend account
 * owner. A random code the citizen can never receive would make login
 * untestable, so development uses a known one and the UI says so out loud.
 *
 * Set AUTH_DEV_OTP=off to force real random codes once a domain is verified.
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
  return process.env.NODE_ENV !== "production" || !process.env.RESEND_API_KEY;
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
