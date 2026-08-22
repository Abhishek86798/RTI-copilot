/**
 * Checks authority routing (FR-2) against data/routing-fixtures.json.
 *
 * Misrouting is the failure this product exists to prevent — a wrong authority
 * triggers a Section 6(3) transfer and restarts the citizen's 30-day clock —
 * so routing needs regression coverage, not spot checks.
 *
 * Run against a dev server after touching the routing prompt, the keyword
 * lists, or data/authorities.json:
 *
 *   pnpm dev
 *   node scripts/check-routing.mjs
 */
import { readFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const { cases } = JSON.parse(readFileSync(new URL("../data/routing-fixtures.json", import.meta.url)));

let passed = 0;
const failures = [];

for (const { label, expectId, expectLowConfidence, confusable, grievance } of cases) {
  try {
    const res = await fetch(`${BASE}/api/route-authority`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grievance }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { candidates, lowConfidence } = await res.json();
    const top = candidates[0];

    if (expectLowConfidence) {
      // Out-of-directory grievances must be flagged uncertain rather than
      // forced into whichever listed authority looks least wrong.
      if (lowConfidence) {
        passed++;
        console.log(`PASS  ${label}  (flagged uncertain)`);
      } else {
        failures.push(label);
        console.log(
          `FAIL  ${label} — expected low confidence, got ${top?.authority.id} at ${top?.confidence}`
        );
      }
      continue;
    }

    if (top?.authority.id === expectId && !lowConfidence) {
      passed++;
      const note = confusable ? `  (not confused with ${confusable})` : "";
      console.log(`PASS  ${label} → ${expectId} (${top.confidence})${note}`);
    } else {
      failures.push(label);
      const got = top ? `${top.authority.id} at ${top.confidence}` : "no candidates";
      const flag = lowConfidence ? ", flagged uncertain" : "";
      console.log(`FAIL  ${label} — expected ${expectId}, got ${got}${flag}`);
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
