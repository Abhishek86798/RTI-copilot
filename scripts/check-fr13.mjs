/**
 * Checks FR-13 (Section 7(1) life-or-liberty detection) against data/fr13-fixtures.json.
 *
 * The flag decides which statutory deadline we tell a citizen applies, so it
 * needs more than anecdote behind it. Run against a dev server after touching
 * the drafting prompt:
 *
 *   pnpm dev
 *   node scripts/check-fr13.mjs
 */
import { readFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const { cases } = JSON.parse(readFileSync(new URL("../data/fr13-fixtures.json", import.meta.url)));

let passed = 0;
const failures = [];

for (const { label, expect, authorityId, grievance } of cases) {
  try {
    const res = await fetch(`${BASE}/api/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grievance, authorityId, extractedReferences: [] }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { lifeOrLibertyFlag, lifeOrLibertyReason } = await res.json();
    if (lifeOrLibertyFlag === expect) {
      passed++;
      console.log(`PASS  ${label}`);
      if (lifeOrLibertyFlag) console.log(`      reason: ${lifeOrLibertyReason}`);
    } else {
      failures.push(label);
      console.log(`FAIL  ${label} — expected ${expect}, got ${lifeOrLibertyFlag}`);
      if (lifeOrLibertyFlag) console.log(`      reason: ${lifeOrLibertyReason}`);
    }
  } catch (error) {
    failures.push(label);
    console.log(`ERROR ${label} — ${error.message}`);
  }
}

console.log(`\n${passed}/${cases.length} passed`);
if (failures.length) {
  console.log(`Failed: ${failures.join(", ")}`);
  process.exit(1);
}
