/**
 * Checks the simulated submission portal (FR-15..FR-18).
 *
 * These rules decide whether a citizen's fee and thirty days survive, so each
 * one the real portal enforces is asserted here — especially the ones it only
 * reveals after payment.
 *
 * Driven over HTTP rather than by importing the module: the service reaches the
 * authority dataset through a bundler alias Node cannot resolve, and going
 * through the route also exercises the status codes the UI depends on.
 *
 *   pnpm dev
 *   node scripts/check-filing-service.mjs
 */
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PORTAL_CHAR_LIMIT = 3000;

async function file(filing) {
  const res = await fetch(`${BASE}/api/file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filing }),
  });
  return { status: res.status, body: await res.json() };
}

async function problemsFor(filing) {
  const { status, body } = await file(filing);
  return status === 422 ? body.problems : [];
}

const fieldsOf = (problems) => problems.map((p) => p.field).sort();

const valid = {
  authorityId: "epfo-pension",
  requestText: "1. The order recording the decision to stop the pension.",
  applicant: {
    fullName: "Test Applicant",
    address: "12 Test Road, Test City",
    state: "Maharashtra",
    pincode: "400001",
    email: "test@example.com",
    phone: "9876543210",
    isCitizen: true,
    isBpl: false,
  },
};

assert.deepEqual(await problemsFor(valid), [], "a valid filing must be accepted");

// Section 3 — the right belongs to citizens of India.
assert.deepEqual(
  fieldsOf(await problemsFor({ ...valid, applicant: { ...valid.applicant, isCitizen: false } })),
  ["isCitizen"],
  "non-citizens must be refused under s.3"
);

// The trap the real portal springs only after the fee is taken.
const stateProblems = await problemsFor({ ...valid, authorityId: "revenue-land-records" });
assert.ok(
  stateProblems.some((p) => p.field === "authorityId" && /State/i.test(p.message)),
  "a State authority must be refused before payment, not after"
);

// s.7(5) — the exemption depends on the certificate, not the claim.
const bplNoCert = await problemsFor({
  ...valid,
  applicant: { ...valid.applicant, isBpl: true },
});
assert.ok(
  bplNoCert.some((p) => p.field === "bplCertificateRef"),
  "a BPL claim without a certificate must be refused"
);
assert.deepEqual(
  await problemsFor({
    ...valid,
    applicant: { ...valid.applicant, isBpl: true, bplCertificateRef: "BPL/2026/1" },
  }),
  [],
  "a BPL claim with a certificate must be accepted"
);

// The 3,000-character request field.
const overLong = await problemsFor({ ...valid, requestText: "x".repeat(PORTAL_CHAR_LIMIT + 1) });
assert.ok(
  overLong.some((p) => p.field === "requestText"),
  "text over the portal limit must be refused"
);
assert.deepEqual(
  await problemsFor({ ...valid, requestText: "x".repeat(PORTAL_CHAR_LIMIT) }),
  [],
  "text exactly at the limit must be accepted"
);

// Contact details, required by s.6(1) because the reply is posted to them.
assert.deepEqual(
  fieldsOf(
    await problemsFor({
      ...valid,
      applicant: { ...valid.applicant, pincode: "12", email: "not-an-email" },
    })
  ),
  ["email", "pincode"],
  "bad contact details must be named individually"
);

// Every problem at once, not one per reload.
const empty = await problemsFor({
  authorityId: "epfo-pension",
  requestText: "",
  applicant: {
    fullName: "", address: "", state: "", pincode: "", email: "",
    isCitizen: false, isBpl: false,
  },
});
assert.ok(empty.length >= 6, `an empty form must report every problem, got ${empty.length}`);

// A successful submission issues a portal-format registration number, and the
// clock starts from the server rather than a date typed in afterwards.
{
  const { status, body } = await file(valid);
  assert.equal(status, 200, `expected 200, got ${status}`);
  assert.equal(body.simulated, true, "the response must declare itself simulated");

  const r = body.receipt;
  assert.match(
    r.registrationNumber,
    /^[A-Z]{5}\/R\/E\/\d{2}\/\d{5}$/,
    `unexpected registration number: ${r.registrationNumber}`
  );
  assert.equal(r.feePaidRupees, 10);
  assert.equal(r.feeBasis, "paid");
  assert.ok(r.ministry, "a Central authority must carry its ministry");

  const days = Math.round((new Date(r.responseDueBy) - new Date(r.filedAt)) / 86400000);
  assert.equal(days, 30, `reply must be due in 30 days under s.7(1), got ${days}`);

  const bpl = await file({
    ...valid,
    applicant: { ...valid.applicant, isBpl: true, bplCertificateRef: "BPL/2026/1" },
  });
  assert.equal(bpl.body.receipt.feePaidRupees, 0, "a BPL applicant pays nothing");
  assert.equal(bpl.body.receipt.feeBasis, "bpl-exempt");
}

console.log("filing service: all checks passed");
