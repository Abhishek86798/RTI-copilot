/**
 * Files an application through the UI, end to end (FR-15..FR-19).
 *
 * This is the step that was missing: intake -> draft -> details -> pay ->
 * registration number, without leaving the product. It asserts the things that
 * would silently break — that the simulated-filing disclosure is actually on
 * screen, and that the registration number reaching the citizen matches the
 * portal's format.
 *
 *   pnpm dev
 *   node scripts/check-file-journey.mjs
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DIR = process.env.SHOT_DIR ?? ".";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

try {
  await page.goto(`${BASE}/apply?case=pension`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Find the right authority/i }).click();

  const confirm = page.getByRole("button", { name: /Write my application|Continue anyway/i }).first();
  await confirm.waitFor({ state: "visible", timeout: 120_000 });
  await confirm.click();

  const next = page.getByRole("button", { name: /Next: how to file this/i });
  await next.waitFor({ state: "visible", timeout: 120_000 });
  await next.click();

  await page.waitForURL(/\/applications\//, { timeout: 30_000 });
  await page.waitForTimeout(1200);

  /* Applicant details, including the fields the API rejects a filing without. */
  await page.getByLabel(/Full name/i).fill("Test Applicant");
  await page.getByLabel(/Postal address/i).fill("12 Test Road, Test City");
  await page.getByLabel(/^State$/i).selectOption("Maharashtra");
  await page.getByLabel(/PIN code/i).fill("400001");
  await page.getByLabel(/Email address/i).fill("test@example.com");
  await page.waitForTimeout(800);

  /* FR-19: the disclosure must be on the screen, before the action. */
  const beforeFiling = await page.locator("body").innerText();
  assert.match(
    beforeFiling,
    /simulated filing/i,
    "the payment screen must disclose that filing is simulated"
  );

  await page.screenshot({ path: `${DIR}/file-1-pay.png`, fullPage: true });

  /* Mock settlement, then submission. */
  const pay = page.getByRole("button", { name: /Pay ₹10 and file/i });
  await pay.waitFor({ state: "visible", timeout: 15_000 });
  await pay.click();

  /* The receipt: a registration number in the portal's own format. */
  const regLabel = page.getByText(/Registration number/i).first();
  await regLabel.waitFor({ timeout: 30_000 });
  await page.waitForTimeout(600);

  const receiptText = await page.locator("body").innerText();
  const match = receiptText.match(/[A-Z]{5}\/R\/E\/\d{2}\/\d{5}/);
  assert.ok(match, `no portal-format registration number on the receipt:\n${receiptText.slice(0, 400)}`);

  assert.match(receiptText, /Reply due by/i, "the receipt must state when a reply is due");
  assert.match(
    receiptText,
    /simulated filing/i,
    "the receipt must disclose that it is simulated"
  );

  await page.screenshot({ path: `${DIR}/file-2-receipt.png`, fullPage: true });

  const realErrors = consoleErrors.filter((e) => !/favicon|manifest|404/i.test(e));
  assert.deepEqual(realErrors, [], `console errors: ${realErrors.join(" | ")}`);

  console.log(`filing journey: filed as ${match[0]}, receipt shown, disclosure present`);
} finally {
  await browser.close();
}
