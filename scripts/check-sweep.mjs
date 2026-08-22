/**
 * End-to-end check of the deadline sweep against the real database.
 *
 * Seeds an application filed 40 days ago, runs the sweep, and asserts that the
 * appeal was drafted, the notice sent once, and a second run stays silent.
 * The re-run matters most: a cron that emails the same person every morning
 * about the same lapsed deadline is worse than one that never fires.
 *
 *   pnpm dev
 *   node scripts/check-sweep.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const sql = neon(process.env.DATABASE_URL);
const id = `sweep-check-${Date.now()}`;
const userId = "sweep-check-user";

const filedAt = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);

await sql.query(
  `INSERT INTO applications
     (id, user_id, grievance, authority, extracted_references, items, full_text,
      portal_text, life_or_liberty_flag, life_or_liberty_reason, applicant,
      status, filed_at, via_apio, is_demo)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,'',$9,'filed',$10,false,false)`,
  [
    id,
    userId,
    "Pension stopped without notice.",
    JSON.stringify({
      id: "epfo-pension",
      authorityName: "EPFO",
      pioDesignation: "CPIO, EPFO",
      appellateAuthority: "First Appellate Authority, EPFO",
      filingAddress: "EPFO Regional Office",
      level: "central",
      domain: "pension",
      keywords: [],
    }),
    JSON.stringify([]),
    JSON.stringify(["The order recording the decision to stop the pension."]),
    "1. The order recording the decision to stop the pension.",
    "1. The order recording the decision to stop the pension.",
    JSON.stringify({
      fullName: "Test Applicant",
      address: "Test Address",
      phone: "",
      email: "sweep-check@example.com",
      isBpl: false,
    }),
    filedAt.toISOString(),
  ]
);

try {
  const headers = process.env.CRON_SECRET
    ? { authorization: `Bearer ${process.env.CRON_SECRET}` }
    : {};

  const first = await fetch(`${BASE}/api/cron/sweep`, { headers });
  assert.equal(first.status, 200, `sweep returned ${first.status}`);
  const firstBody = await first.json();
  assert.deepEqual(firstBody.failures, [], `sweep reported failures: ${firstBody.failures}`);
  assert.ok(firstBody.deadlineNotices >= 1, "expected at least one deadline notice");

  const [row] = await sql.query(
    `SELECT status, appeal, deadline_notified_at FROM applications WHERE id = $1`,
    [id]
  );
  assert.equal(row.status, "overdue", "status must become overdue");
  assert.ok(row.appeal?.text?.includes("Section 19(1)"), "appeal must be drafted");
  assert.ok(
    row.appeal.text.includes("Test Applicant"),
    "appeal must carry the applicant's details"
  );
  assert.ok(row.deadline_notified_at, "notification must be recorded");

  // The re-run is the point: notifications must not repeat.
  const second = await fetch(`${BASE}/api/cron/sweep`, { headers });
  const secondBody = await second.json();
  assert.equal(
    secondBody.deadlineNotices,
    0,
    "a second sweep must not re-notify the same application"
  );

  console.log("sweep: all checks passed (notice sent once, appeal drafted, re-run silent)");
} finally {
  await sql.query(`DELETE FROM applications WHERE id = $1`, [id]);
}
