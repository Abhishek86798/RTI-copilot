import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Sessions as a signed cookie, with no session table and no auth SDK.
 *
 * The whole identity model here is one verified email. That fits in a cookie,
 * so it lives in one — signed with HMAC-SHA256 so the browser can hold it but
 * not forge it. No database round trip on the hot path, and nothing to expire
 * server-side beyond the timestamp baked into the value.
 *
 * AUTH_SECRET is required in production. In development a per-process random
 * secret is generated instead, which means restarting the dev server signs
 * everyone out — an acceptable trade to keep `git clone && pnpm dev` working
 * with no setup, and far better than shipping a hardcoded fallback that could
 * reach production.
 */

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const SESSION_COOKIE = "rti_session";

function secret(): string {
  const configured = process.env.AUTH_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is required in production. Generate one with: openssl rand -base64 32"
    );
  }
  DEV_SECRET ??= randomBytes(32).toString("hex");
  return DEV_SECRET;
}

let DEV_SECRET: string | undefined;

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/**
 * `email|issuedAt|signature`. The timestamp is inside the signed payload, so
 * a client cannot extend its own session by editing the cookie.
 */
export function createSessionToken(email: string): string {
  const payload = `${Buffer.from(email).toString("base64url")}|${Date.now()}`;
  return `${payload}|${sign(payload)}`;
}

/** Returns the verified email, or null for anything malformed, forged, or expired. */
export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;

  const [encodedEmail, issuedAt, signature] = parts;
  const expected = sign(`${encodedEmail}|${issuedAt}`);

  /*
   * Constant-time compare. A plain `===` leaks how much of the signature
   * matched through timing, which is enough to forge one byte at a time.
   */
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SECONDS * 1000) return null;

  return Buffer.from(encodedEmail, "base64url").toString("utf8");
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
} as const;
