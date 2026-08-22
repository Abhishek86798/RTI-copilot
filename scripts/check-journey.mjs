/**
 * Walks the whole citizen journey in a real browser.
 *
 * Covers the path no automated check reaches: intake -> authority -> draft ->
 * edit -> file -> Simulate +31 Days -> First Appeal. The demo checkpoint in
 * docs/phases.md is exactly this walk, and it has only ever been done by hand.
 *
 *   pnpm dev
 *   node scripts/check-journey.mjs
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const shot = (name) => `${process.env.SHOT_DIR ?? "."}/journey-${name}.png`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});

try {
  /* 1 — intake ------------------------------------------------------- */
  await page.goto(`${BASE}/apply`, { waitUntil: "networkidle" });

  const grievance =
    "My father's monthly pension under PPO number 12345 was stopped in April " +
    "with no notice from the EPFO office and nobody there will explain why to us";
  await page.getByRole("textbox").first().fill(grievance);
  await page.getByRole("button", { name: /Find the right authority/i }).click();

  /* 2 — authority ---------------------------------------------------- */
  // Wait for the step itself, not for text — "EPFO" also appears in the
  // grievance textarea, which matched while routing was still in flight.
  const confirmButton = page
    .getByRole("button", { name: /Write my application|Continue anyway/i })
    .first();
  await confirmButton.waitFor({ state: "visible", timeout: 120_000 });
  await page.screenshot({ path: shot("2-authority"), fullPage: true });
  await confirmButton.click();

  /* 3 — draft, and the edit that must survive to print ---------------- */
  const nextButton = page.getByRole("button", { name: /Next: how to file this/i });
  await nextButton.waitFor({ state: "visible", timeout: 120_000 });
  const draftBox = page.getByRole("textbox").first();
  await draftBox.waitFor({ timeout: 30_000 });
  await page.waitForTimeout(1000);

  const original = await draftBox.inputValue();
  assert.ok(original.length > 50, "draft should have content");
  assert.match(original, /1\./, "draft should be itemized");

  const MARKER = "EDIT-MARKER-SURVIVES-TO-PDF";
  await draftBox.fill(`1. ${MARKER}\n2. Second request retained.`);
  await page.waitForTimeout(1200); // let the persist land

  // Editing a seeded case makes it the citizen's own text, which correctly
  // clears isDemo and hides the FR-14 fast-forward. Restore the flag so this
  // one run covers both the edit round-trip and the simulate control.
  await page.evaluate(() => {
    const key = "rti-copilot:applications";
    const envelope = JSON.parse(localStorage.getItem(key));
    envelope.applications[0].isDemo = true;
    localStorage.setItem(key, JSON.stringify(envelope));
  });
  await page.screenshot({ path: shot("3-draft"), fullPage: true });

  await nextButton.click();

  /* 4 — filing ------------------------------------------------------- */
  await page.waitForURL(/\/applications\//, { timeout: 30_000 });
  await page.waitForTimeout(1500);

  // The edit must be what the printed application carries (FR-5 -> FR-6).
  //
  // Asserted against stored state rather than the rendered sheet: the print
  // button opens the browser's print dialog, which blocks in automation. The
  // sheet renders `items`, so `items` carrying the edit is the real claim —
  // this is exactly the bug where only portalText was being saved.
  const stored = await page.evaluate(() => {
    const raw = localStorage.getItem("rti-copilot:applications");
    return raw ? JSON.parse(raw).applications?.[0] : null;
  });
  assert.ok(stored, "the application should be persisted");
  assert.ok(
    stored.items.join(" ").includes(MARKER),
    `the edit must reach items[] (what the PDF prints), got: ${JSON.stringify(stored.items)}`
  );
  assert.ok(
    stored.portalText.includes(MARKER),
    "the edit must also reach portalText (what goes in the portal box)"
  );
  await page.screenshot({ path: shot("4-filing"), fullPage: true });

  /* 5 — mark as filed, starting the statutory clock (FR-7) ----------- */
  // Applicant details are required on the application under the RTI Rules,
  // 2012, and the appeal template reads them, so fill them as a citizen would.
  await page.getByLabel(/Full name/i).fill("Test Applicant");
  await page.getByLabel(/Postal address/i).fill("12 Test Road, Test City");
  await page.getByLabel(/Email address/i).fill("test@example.com");

  const dateInput = page.locator('input[type="date"]').first();
  await dateInput.waitFor({ timeout: 15_000 });
  await page.getByRole("button", { name: /Start the deadline clock/i }).click();
  await page.waitForTimeout(1500);

  const afterFiling = await page.locator("body").innerText();
  assert.match(afterFiling, /30 days|days left|awaiting/i, "a countdown should appear");
  await page.screenshot({ path: shot("5-filed"), fullPage: true });

  /* 6 — the demo fast-forward (FR-14) -------------------------------- */
  const simulate = page.getByRole("button", { name: /Simulate \+31 days/i }).first();
  const hasSimulate = await simulate.isVisible().catch(() => false);
  assert.ok(
    hasSimulate,
    "Simulate +31 Days must be offered on a demo application (FR-14)"
  );
  await simulate.click();
  await page.waitForTimeout(2000);

  /* 7 — the First Appeal must draft itself (FR-9) -------------------- */
  const appealText = await page.locator("body").innerText();
  assert.match(appealText, /overdue|deadline (has )?passed/i, "should read as overdue");
  assert.match(appealText, /Section 19\(1\)|First Appeal/i, "a First Appeal must be drafted");
  await page.screenshot({ path: shot("6-appeal"), fullPage: true });

  const realErrors = consoleErrors.filter(
    (e) => !/favicon|manifest|404 \(Not Found\)/i.test(e)
  );
  assert.deepEqual(realErrors, [], `console errors: ${realErrors.join(" | ")}`);

  console.log("journey: intake -> draft -> edit -> file -> +31 days -> appeal, all passed");
  console.log("screenshots written: journey-*.png");
} finally {
  await browser.close();
}
