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

/* splitDraftItems — the edited textarea must round-trip back to items, or an
 * edit shows on screen and in the clipboard but never reaches the PDF. */
{
  const { splitDraftItems } = await import("../lib/client/filing.ts");

  const items = ["First request.", "Second request."];
  const joined = items.map((t, i) => `${i + 1}. ${t}`).join("\n");
  assert.deepEqual(splitDraftItems(joined), items, "round trip must be lossless");

  assert.deepEqual(
    splitDraftItems("1. Kept.\n2. Edited wording here."),
    ["Kept.", "Edited wording here."],
    "edits must survive"
  );

  // A wrapped line belongs to the item above it, not a new request.
  assert.deepEqual(
    splitDraftItems("1. A request that\ncontinues on the next line.\n2. Second."),
    ["A request that continues on the next line.", "Second."],
    "continuation lines must merge upward"
  );

  assert.deepEqual(splitDraftItems("1) Paren style."), ["Paren style."]);
  assert.deepEqual(splitDraftItems("No numbering at all."), ["No numbering at all."]);
  assert.deepEqual(splitDraftItems("\n\n"), [], "empty text yields no items");
}

console.log("splitDraftItems: all checks passed");

/* Deadline email templates — these are the only words a citizen may ever read
 * about their lapsed deadline, so the legal claims in them must be right. */
{
  const { deadlineLapsedMail, appealWindowClosingMail } = await import("../lib/server/email.ts");

  const lapsed = deadlineLapsedMail({
    to: "a@example.com",
    name: "Test Applicant",
    authorityName: "EPFO",
    filedAtLabel: "1 July 2026",
    deadlineLabel: "31 July 2026",
    appealDeadlineLabel: "30 August 2026",
    url: "https://example.com/applications/1",
  });
  assert.match(lapsed.text, /Section 7\(2\)/, "must cite deemed refusal");
  assert.match(lapsed.text, /Section 19\(1\)/, "must cite the appeal clause");
  assert.match(lapsed.text, /no fee|not have to pay/i, "must say a first appeal is free");
  assert.match(lapsed.text, /30 August 2026/, "must state the appeal deadline");
  assert.match(lapsed.text, /not legal advice/i, "must carry the disclaimer");

  const closing = appealWindowClosingMail({
    to: "a@example.com",
    name: "Test Applicant",
    authorityName: "EPFO",
    appealDeadlineLabel: "30 August 2026",
    daysLeft: 5,
    url: "https://example.com/applications/1",
  });
  assert.match(closing.subject, /5 days/, "subject must state days left");
  assert.match(closing.text, /condone/i, "must explain what lapsing costs");
  assert.match(closing.text, /not legal advice/i, "must carry the disclaimer");
}

console.log("email templates: all checks passed");
