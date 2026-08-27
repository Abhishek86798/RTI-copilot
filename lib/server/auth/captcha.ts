import { createHmac, randomInt } from "node:crypto";

/**
 * A human check that a screen reader can pass.
 *
 * rtionline.gov.in uses a distorted-image CAPTCHA with an audio button beside
 * it. Images are the wrong default for this product: a large share of RTI
 * filers use assistive tech, and an image challenge makes the login the least
 * accessible screen in an app whose whole premise is widening access.
 *
 * A short arithmetic question is plain text, so it reaches a screen reader
 * with no audio track to record, and stops the naive scripted submissions this
 * is actually here for. It will not stop a determined bot — nothing at this
 * tier does, and pretending otherwise is the mistake image CAPTCHAs make.
 *
 * ponytail: arithmetic challenge, swap for Turnstile if abuse ever appears.
 *
 * The answer is never stored. It is HMAC'd into the token the client sends
 * back, so verification needs no server state and survives a restart.
 *
 * Spent tokens are remembered, though, and that part cannot be stateless: a
 * signature stays valid for its whole ten minutes, so without a record of use
 * one solved challenge could be replayed against a different email address
 * every time — which is exactly the scripted mailing this check exists to
 * stop. The set holds only used tokens until they expire.
 *
 * ponytail: in-process Set, same swap as the OTP store if this ever runs on
 * more than one instance.
 */

const TTL_MS = 10 * 60 * 1000;

const spent = new Set<string>();

/** Drop expired entries so the set cannot grow without bound. */
function sweep() {
  const now = Date.now();
  for (const token of spent) {
    if (Number(token.split("|")[1]) < now) spent.delete(token);
  }
}

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-captcha-secret";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export type Challenge = { question: string; token: string };

export function createChallenge(): Challenge {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${a + b}|${expiresAt}`;

  return {
    question: `What is ${a} + ${b}?`,
    token: `${payload}|${sign(payload)}`,
  };
}

export function verifyChallenge(token: string | undefined, answer: string): boolean {
  if (!token) return false;
  const parts = token.split("|");
  if (parts.length !== 3) return false;

  const [expected, expiresAt, signature] = parts;
  if (sign(`${expected}|${expiresAt}`) !== signature) return false;
  if (Date.now() > Number(expiresAt)) return false;
  if (spent.has(token)) return false;

  /*
   * Spend the token on any answered attempt, right or wrong. Burning it only
   * on success would leave the challenge open to a guessing loop, which for a
   * two-digit sum is a handful of requests.
   */
  sweep();
  spent.add(token);

  return answer.trim() === expected;
}
