/**
 * Guards the fee text in lib/client/filing.ts.
 *
 * A BPL applicant is exempt under s.7(5). Telling them to "pay the Rs 10 fee"
 * in the steps while the fee line says "No fee payable" makes them pay money
 * the Act exempts them from — and the contradiction is invisible unless the
 * two are read together, which is exactly what this asserts.
 *
 *   node scripts/check-filing.mjs
 */
import assert from "node:assert/strict";
import { buildFilingPlan, RTI_FEE_RUPEES } from "../lib/client/filing.ts";

const central = { id: "c", authorityName: "EPFO", level: "central", verifyAt: "https://x" };
const state = { id: "s", authorityName: "Tehsildar", level: "state", verifyAt: "https://y" };

for (const authority of [central, state]) {
  const where = authority.level;

  const bpl = buildFilingPlan(authority, { isBpl: true, overPortalLimit: false });
  assert.equal(bpl.feeRupees, 0, `${where}: BPL fee must be 0`);
  for (const step of bpl.steps) {
    assert.ok(
      !/pay the ₹/i.test(step),
      `${where}: BPL steps must not instruct payment — got: ${step}`
    );
  }

  const paid = buildFilingPlan(authority, { isBpl: false, overPortalLimit: false });
  assert.equal(paid.feeRupees, RTI_FEE_RUPEES, `${where}: non-BPL fee must be ${RTI_FEE_RUPEES}`);
  assert.ok(
    paid.steps.some((s) => s.includes(`₹${RTI_FEE_RUPEES}`)),
    `${where}: non-BPL steps must state the fee`
  );
}

// State applications filed on the central portal are returned without refund.
assert.ok(
  buildFilingPlan(state, { isBpl: false, overPortalLimit: false }).warning,
  "state filing must warn against rtionline.gov.in"
);

console.log("filing: all checks passed");
