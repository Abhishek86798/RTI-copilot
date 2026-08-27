import assert from "node:assert/strict";
import test from "node:test";

const { stepProblems, canReach, FILING_STEPS } = await import(
  "../lib/client/filing-steps.ts"
);

/*
 * The gate has one job: never trap someone on a step they cannot complete,
 * and never let an incomplete step through to the fee. Both directions are
 * worth a test, because only one of them is visible in normal use.
 */

const complete = {
  id: "a1",
  authority: { id: "epfo-pension", name: "EPFO", level: "central" },
  applicant: {
    fullName: "A Citizen",
    address: "1 Road",
    state: "Maharashtra",
    pincode: "400001",
    email: "a@b.com",
    phone: "9876543210",
    isCitizen: true,
    isBpl: false,
  },
};

const withApplicant = (patch) => ({
  ...complete,
  applicant: { ...complete.applicant, ...patch },
});

test("a fully filled application clears every step", () => {
  for (const step of FILING_STEPS) {
    assert.deepEqual(stepProblems(step, complete, "Some request text"), [], step);
  }
});

test("authority is required", () => {
  assert.deepEqual(
    stepProblems("authority", { ...complete, authority: undefined }, "x"),
    ["authorityId"]
  );
});

test("applicant reports every missing field at once", () => {
  const problems = stepProblems(
    "applicant",
    withApplicant({ fullName: "", address: "", state: "", pincode: "", email: "" }),
    "x"
  );
  /* All at once, not one per attempt — the server does the same. */
  assert.deepEqual(problems, ["fullName", "address", "state", "pincode", "email"]);
});

test("pincode must be six digits", () => {
  assert.deepEqual(stepProblems("applicant", withApplicant({ pincode: "40001" }), "x"), [
    "pincode",
  ]);
  assert.deepEqual(stepProblems("applicant", withApplicant({ pincode: "4000011" }), "x"), [
    "pincode",
  ]);
});

test("phone is optional but must be valid when given", () => {
  assert.deepEqual(stepProblems("applicant", withApplicant({ phone: "" }), "x"), []);
  assert.deepEqual(stepProblems("applicant", withApplicant({ phone: "12345" }), "x"), [
    "phone",
  ]);
  /* A leading +91 is accepted, as on the real form. */
  assert.deepEqual(
    stepProblems("applicant", withApplicant({ phone: "+91 9876543210" }), "x"),
    []
  );
});

test("s.3 citizenship is required to advance", () => {
  assert.deepEqual(
    stepProblems("declaration", withApplicant({ isCitizen: false }), "x"),
    ["isCitizen"]
  );
});

test("s.7(5) BPL exemption needs the certificate reference", () => {
  assert.deepEqual(
    stepProblems("declaration", withApplicant({ isBpl: true, bplCertificateRef: "" }), "x"),
    ["bplCertificateRef"]
  );
  assert.deepEqual(
    stepProblems("declaration", withApplicant({ isBpl: true, bplCertificateRef: "BPL/1" }), "x"),
    []
  );
});

test("an empty request cannot advance", () => {
  assert.deepEqual(stepProblems("request", complete, "   "), ["requestText"]);
  assert.deepEqual(stepProblems("request", complete, "Give me the order"), []);
});

test("pay has nothing of its own to complete", () => {
  assert.deepEqual(stepProblems("pay", withApplicant({ fullName: "" }), ""), []);
});

test("canReach gates on every earlier step", () => {
  assert.equal(canReach("authority", complete, ""), true, "first step always reachable");
  /* Empty request only blocks what comes after it. */
  assert.equal(canReach("request", complete, ""), true);
  assert.equal(canReach("pay", complete, ""), false);
  assert.equal(canReach("pay", complete, "text"), true);
  /* A missing name blocks everything downstream of the applicant step. */
  assert.equal(canReach("declaration", withApplicant({ fullName: "" }), "text"), false);
});
