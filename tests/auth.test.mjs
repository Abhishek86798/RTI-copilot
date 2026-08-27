import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

process.env.AUTH_SECRET = "test-secret-not-used-anywhere-real";
process.env.NODE_ENV = "test";

const { createSessionToken, readSessionToken } = await import(
  "../lib/server/auth/session.ts"
);
const { createChallenge, verifyChallenge } = await import(
  "../lib/server/auth/captcha.ts"
);
const { verifyCode, issueCode } = await import("../lib/server/auth/otp.ts");

/*
 * The three things worth a test: a forged cookie must not authenticate, a
 * used code must not work twice, and a wrong CAPTCHA must not pass. Each one
 * is a security boundary where a silent failure is invisible until abused.
 */

test("session round-trips a verified email", () => {
  const token = createSessionToken("citizen@example.com");
  assert.equal(readSessionToken(token), "citizen@example.com");
});

test("session rejects a tampered payload", () => {
  const token = createSessionToken("citizen@example.com");
  const [, issuedAt, signature] = token.split("|");
  const forged = `${Buffer.from("attacker@example.com").toString("base64url")}|${issuedAt}|${signature}`;
  assert.equal(readSessionToken(forged), null);
});

test("session rejects malformed and empty tokens", () => {
  assert.equal(readSessionToken(undefined), null);
  assert.equal(readSessionToken(""), null);
  assert.equal(readSessionToken("garbage"), null);
  assert.equal(readSessionToken("a|b"), null);
});

test("session rejects an expired token", () => {
  /* 31 days old, past the 30-day ceiling. */
  const stale = Date.now() - 31 * 24 * 60 * 60 * 1000;
  const encoded = Buffer.from("citizen@example.com").toString("base64url");
  const payload = `${encoded}|${stale}`;
  const signature = createHmac("sha256", process.env.AUTH_SECRET)
    .update(payload)
    .digest("base64url");
  assert.equal(readSessionToken(`${payload}|${signature}`), null);
});

test("captcha accepts the right answer and rejects the wrong one", () => {
  const { question, token } = createChallenge();
  const [, a, b] = question.match(/What is (\d+) \+ (\d+)\?/);
  const answer = String(Number(a) + Number(b));

  assert.equal(verifyChallenge(token, answer), true);
  assert.equal(verifyChallenge(token, String(Number(answer) + 1)), false);
  assert.equal(verifyChallenge(undefined, answer), false);
  assert.equal(verifyChallenge("forged|123|abc", answer), false);
});

test("a captcha token cannot be replayed", () => {
  const { question, token } = createChallenge();
  const [, a, b] = question.match(/What is (\d+) \+ (\d+)\?/);
  const answer = String(Number(a) + Number(b));

  assert.equal(verifyChallenge(token, answer), true);
  /*
   * Without this, one solved challenge could be replayed for its whole
   * lifetime against a different email each time — the scripted mailing the
   * check exists to stop.
   */
  assert.equal(verifyChallenge(token, answer), false);
});

test("a wrong captcha answer still spends the token", () => {
  const { question, token } = createChallenge();
  const [, a, b] = question.match(/What is (\d+) \+ (\d+)\?/);
  const answer = String(Number(a) + Number(b));

  assert.equal(verifyChallenge(token, "0"), false);
  /* Otherwise a two-digit sum falls to a short guessing loop. */
  assert.equal(verifyChallenge(token, answer), false);
});

test("a code verifies once, then never again", async () => {
  const email = "single-use@example.com";
  const issued = await issueCode(email);
  assert.equal(issued.ok, true);

  assert.equal(verifyCode(email, issued.devCode), "ok");
  /* Second use of the same code must fail — otherwise it is a password. */
  assert.equal(verifyCode(email, issued.devCode), "expired");
});

test("a wrong code does not authenticate", async () => {
  const email = "wrong-code@example.com";
  const issued = await issueCode(email);
  assert.equal(verifyCode(email, "9999"), "invalid");
  /* The real code still works after a failed attempt. */
  assert.equal(verifyCode(email, issued.devCode), "ok");
});

test("brute force burns the code after five attempts", async () => {
  const email = "brute@example.com";
  const issued = await issueCode(email);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal(verifyCode(email, "0000"), "invalid");
  }
  /* Even the correct code is refused once the attempt budget is spent. */
  assert.equal(verifyCode(email, issued.devCode), "too-many-attempts");
});

test("an unknown email has no code to verify", () => {
  assert.equal(verifyCode("never-asked@example.com", "1234"), "expired");
});
