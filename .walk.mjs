import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const rail = () => page.locator("nav[aria-label^='Step'] ol").innerText();
const activeNav = () =>
  page.locator("nav[aria-label='Main'] a[aria-current='page']").allInnerTexts();

try {
  /* 1-3 — describe, authority, draft ------------------------------------ */
  await page.goto(`${BASE}/apply?case=pension`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 20000 });
  let r = await rail();
  assert.ok(!/TRACK/i.test(r), `step rail must not mention Track: ${r}`);
  assert.equal((await page.locator("nav[aria-label^='Step'] ol > li").count()), 4);
  assert.match(await page.locator("main").innerText(), /\/ 04/, "the step marker counts to four");
  assert.deepEqual(await activeNav(), ["Initiate Requisition"]);

  await page.getByRole("button", { name: /Identify Public Authority/i }).click();
  await page.getByRole("button", { name: /Generate Statutory Draft/i }).click();
  const forward = page.getByRole("button", { name: /Proceed to Filing Directives/i });
  await forward.waitFor({ timeout: 60000 });
  const draftText = await page.getByRole("textbox").first().inputValue();
  assert.deepEqual(await activeNav(), ["Initiate Requisition"]);

  /* 4 — filing ----------------------------------------------------------- */
  await forward.click();
  await page.waitForURL(/\/applications\/[^/]+$/, { timeout: 30000 });
  const fileUrl = page.url();
  const id = fileUrl.split("/").pop();
  await page.waitForTimeout(1200);

  assert.deepEqual(await activeNav(), ["Initiate Requisition"], "filing stays under Initiate Requisition");
  r = await rail();
  assert.ok(!/TRACK/i.test(r), `filing rail must not mention Track: ${r}`);
  assert.match(r, /04\s*\n?FILE\s*\n?CURRENT STEP/i, `04 FILE should be current: ${r}`);
  const back = page.getByRole("link", { name: /Back to the previous step/i });
  assert.equal(await back.count(), 1, "one back-to-previous-step link");
  assert.equal(
    await page.locator("main").getByRole("link", { name: /Dashboard/i }).count(),
    0,
    "the unfiled filing screen offers no dashboard shortcut, only Back"
  );

  /* back to step 3, and forward again ------------------------------------ */
  await back.click();
  await page.waitForFunction((want) => location.search === `?draft=${want}`, id, { timeout: 20000 });
  await page.waitForTimeout(1200);
  r = await rail();
  assert.match(r, /03\s*\n?DRAFT\s*\n?CURRENT STEP/i, `back should land on step 3: ${r}`);
  assert.equal(
    await page.getByRole("textbox").first().inputValue(),
    draftText,
    "the draft must come back intact"
  );
  assert.equal(await page.evaluate(() => window.scrollY), 0, "back starts at the top");

  await page.getByRole("button", { name: /Proceed to Filing Directives/i }).click();
  await page.waitForURL(/\/applications\/[^/]+$/, { timeout: 20000 });
  await page.waitForTimeout(1000);
  const rows = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rti-copilot:applications")).applications.length
  );
  assert.equal(rows, 1, "going back and forward must not create a second application");

  /* 5 — pay and file ----------------------------------------------------- */
  await page.getByLabel(/Full name/i).fill("Test Applicant");
  await page.getByLabel(/Mobile number/i).fill("9876543210");
  await page.getByLabel(/Postal address/i).fill("12 Test Road, Test City");
  await page.getByLabel(/^State$/i).selectOption({ index: 1 });
  await page.getByLabel(/PIN code/i).fill("400001");
  await page.getByLabel(/Email address/i).fill("test@example.com");
  await page.getByLabel(/I am a citizen of India/i).check();
  await page.getByRole("button", { name: /Pay ₹10 and file/i }).click();

  const dialog = page.locator("dialog[open]");
  await dialog.waitFor({ timeout: 20000 });
  const dialogText = await dialog.innerText();
  assert.match(dialogText, /\/E\/\d{2}\/\d+/, `registration number in the dialog: ${dialogText}`);
  assert.ok(!/track/i.test(dialogText), `no tracking offered in the dialog: ${dialogText}`);
  assert.equal(
    await dialog.getByRole("link", { name: /Go to Applicant Dashboard/i }).count(),
    1
  );
  // Focus must be inside the dialog, and the page behind must be pinned.
  assert.ok(
    await page.evaluate(() => document.querySelector("dialog[open]").contains(document.activeElement)),
    "focus moves into the dialog"
  );
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(600);
  assert.equal(await page.evaluate(() => window.scrollY), 0, "background must not scroll");
  await page.screenshot({ path: ".shot-dialog.png" });

  /* Escape closes it, and the page underneath has handed over ------------ */
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  assert.equal(await page.locator("dialog[open]").count(), 0, "Escape closes the dialog");
  const under = await page.locator("main").innerText();
  assert.match(under, /already been filed/i);
  assert.ok(!/track/i.test(under), `no tracking on the filing page: ${under}`);
  assert.equal(
    await page.locator("main").getByRole("link", { name: /Go to Applicant Dashboard/i }).count(),
    1
  );

  /* 6 — tracking is reached from the dashboard --------------------------- */
  await page.locator("main").getByRole("link", { name: /Go to Applicant Dashboard/i }).click();
  await page.waitForURL(/\/applications$/, { timeout: 15000 });
  await page.getByRole("link", { name: /Open/i }).first().click();
  await page.waitForURL(/\/track$/, { timeout: 15000 });
  await page.waitForTimeout(800);
  assert.equal(
    await page.locator("nav[aria-label^='Step']").count(),
    0,
    "the status page is not a step of the wizard"
  );
  assert.deepEqual(await activeNav(), ["Applicant Dashboard"]);
  assert.equal(await page.evaluate(() => window.scrollY), 0);
  await page.screenshot({ path: ".shot-track.png", fullPage: true });

  const real = errors.filter((e) => !/favicon|manifest|500 \(Internal Server Error\)/i.test(e));
  assert.deepEqual(real, [], `console errors: ${real.join(" | ")}`);
  console.log("PASS — describe → authority → draft → file → dialog → dashboard → status");
} finally {
  await browser.close();
}
