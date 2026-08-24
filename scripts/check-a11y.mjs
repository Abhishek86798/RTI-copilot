/**
 * Accessibility pass: runs axe-core over every screen state, in both
 * languages, at mobile and desktop, and fails on any WCAG 2.1 A/AA violation.
 *
 * The static routes alone do not cover the app. Most of the journey — the
 * authority choice, the draft, the comparison panel, the receipt, the lapsed
 * deadline and the appeal — only exists after several steps of interaction, and
 * those are exactly the screens carrying status colour, tinted alerts and
 * muted labels. So the walk below drives the real wizard and audits each state
 * as it arrives.
 *
 * Hindi is audited too, not as a formality: Devanagari sets at a different
 * optical size to Latin, and a label that fits in English can wrap or clip.
 *
 *   pnpm dev
 *   node scripts/check-a11y.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

/**
 * Read the interface strings straight out of the app rather than restating
 * them here.
 *
 * Hand-written selectors were the first version of this script and they were
 * wrong within an hour: a label changes, the regex still matches nothing, and
 * the walk fails somewhere unrelated to what actually broke. Parsing the real
 * table means a renamed button either keeps working or fails on the line that
 * renamed it.
 *
 * The parse is deliberately dumb — the file is a pair of flat object literals
 * of string keys to string values, so a line scanner is enough and does not
 * need the file to be importable from Node.
 */
function loadStrings() {
  const source = readFileSync(new URL("../lib/client/i18n.tsx", import.meta.url), "utf8");
  const lines = source.split("\n");
  const tables = { en: {}, hi: {} };
  let current = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    const table = line.match(/^const (en|hi)\b/);
    if (table) {
      current = table[1];
      continue;
    }
    if (current && line.startsWith("};")) {
      current = null;
      continue;
    }
    if (!current) continue;

    // Value on the same line as the key.
    const inline = line.match(/^\s*"([^"]+)":\s*"(.*)",\s*$/);
    if (inline) {
      tables[current][inline[1]] = inline[2];
      continue;
    }

    // Long values wrap: the key sits alone and the string starts on the next
    // line. Only the first line is taken, which is enough to match on.
    const wrapped = line.match(/^\s*"([^"]+)":\s*$/);
    if (wrapped) {
      const next = lines[i + 1]?.match(/^\s*"(.*?)"/);
      if (next) tables[current][wrapped[1]] = next[1];
    }
  }

  return tables;
}

const STRINGS = loadStrings();

/** Exact-text matcher for a translated label, in the locale under test. */
function label(locale, key) {
  const value = STRINGS[locale][key];
  if (!value) throw new Error(`check-a11y: no ${locale} string for "${key}"`);
  return value;
}

const GRIEVANCE =
  "My EPS-95 pension has not been credited for four months. I submitted form 10D " +
  "at the regional office in March and my PPO number is PPO/2019/004512. Nobody " +
  "at the office will tell me what happened to the file.";

const violations = [];

/** Run axe against the current page state and collect anything it finds. */
async function audit(page, label) {
  await page.evaluate(AXE_SOURCE);
  const result = await page.evaluate(async () => {
    // WCAG 2.1 A and AA only — the bar the project claims to hold.
    return await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
  });

  for (const violation of result.violations) {
    for (const node of violation.nodes) {
      violations.push(
        `${label}: ${violation.id} (${violation.impact}) — ${node.failureSummary
          ?.split("\n")
          .join(" ")} [${node.target.join(", ")}]`
      );
    }
  }
  return result.violations.length === 0;
}

/**
 * Walk the whole journey once, auditing each state.
 *
 * Every wait is on an element rather than a fixed delay wherever possible: the
 * routing and drafting steps call a live model, so a timeout tuned to a fast
 * response would make this script flaky rather than strict.
 */
async function walk(page, viewport, locale) {
  const tag = (name) => `${viewport}-${locale}/${name}`;
  const button = (key) =>
    page.getByRole("button", { name: label(locale, key), exact: false }).first();

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await audit(page, tag("landing"));

  await page.goto(`${BASE}/how-it-works`, { waitUntil: "networkidle" });
  await audit(page, tag("how-it-works"));

  await page.goto(`${BASE}/applications`, { waitUntil: "networkidle" });
  await audit(page, tag("list-empty"));

  // ---- Step 1: intake -------------------------------------------------
  await page.goto(`${BASE}/apply`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await audit(page, tag("intake"));

  await page.getByRole("textbox").first().fill(GRIEVANCE);
  await button("intake.submit").click();

  // ---- Step 2: authority ----------------------------------------------
  // Either label can appear: a low-confidence result changes the wording, and
  // which one shows depends on what the live model returned this run.
  const confirm = page
    .getByRole("button", {
      name: new RegExp(
        [label(locale, "confirm.submit"), label(locale, "confirm.submitUnsure")]
          .map((text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|")
      ),
    })
    .first();
  await confirm.waitFor({ state: "visible", timeout: 120_000 });
  await page.waitForTimeout(500);
  await audit(page, tag("authority"));

  // The confidence explainer is a disclosure; open it so its panel is audited.
  const explain = button("confidence.explain");
  if (await explain.count()) {
    await explain.click();
    await page.waitForTimeout(300);
    await audit(page, tag("authority-confidence-open"));
  }

  await confirm.click();

  // ---- Step 3: draft ---------------------------------------------------
  const next = button("draft.submit");
  await next.waitFor({ state: "visible", timeout: 120_000 });
  await page.waitForTimeout(800);
  await audit(page, tag("draft"));

  // The side-by-side comparison is collapsed by default and carries the two
  // markers that the redesign restyled, so it has to be opened to be audited.
  const compare = button("draft.compare");
  if (await compare.count()) {
    await compare.click();
    await page.waitForTimeout(300);
    await audit(page, tag("draft-compare-open"));
  }

  await next.click();
  await page.waitForURL(/\/applications\//, { timeout: 30_000 });
  await page.waitForTimeout(1200);

  // ---- Step 4: filing --------------------------------------------------
  await audit(page, tag("detail-unfiled"));

  await page.getByLabel(label(locale, "file.name"), { exact: false }).fill("Test Applicant");
  await page
    .getByLabel(label(locale, "file.address"), { exact: false })
    .fill("12 Test Road, Test City");
  await page
    .getByLabel(label(locale, "file.email"), { exact: false })
    .fill("test@example.com");
  await page.waitForTimeout(400);
  await audit(page, tag("filing-guide-filled"));

  const start = button("file.confirm");
  await start.waitFor({ timeout: 15_000 });
  await start.click();
  await page.waitForTimeout(1500);

  // ---- Step 5: tracking, then the lapsed state and the appeal ----------
  await audit(page, tag("tracking"));

  const simulate = button("track.simulate");
  if (await simulate.count()) {
    await simulate.click();
    await page.waitForTimeout(2000);
    await audit(page, tag("tracking-overdue-and-appeal"));
  }

  // The dashboard, now that it holds a real row rather than the empty state.
  await page.goto(`${BASE}/applications`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await audit(page, tag("list-populated"));
}

const browser = await chromium.launch();

try {
  for (const [vpName, viewport] of [
    ["mobile", { width: 375, height: 812 }],
    ["desktop", { width: 1280, height: 900 }],
  ]) {
    for (const locale of ["en", "hi"]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();

      // The language toggle persists to localStorage, so seeding it before the
      // first paint audits Hindi from the very first render rather than after
      // a switch that could mask a server-rendered problem.
      await page.addInitScript((value) => {
        try {
          window.localStorage.setItem("rti-copilot:locale", value);
        } catch {
          // Private browsing: the app falls back to English, which is still
          // a valid state to audit.
        }
      }, locale);

      await walk(page, vpName, locale);
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (violations.length > 0) {
  console.error(`a11y: ${violations.length} WCAG 2.1 AA violation(s)\n`);
  for (const line of violations) console.error(`  - ${line}`);
  process.exit(1);
}

console.log("a11y: zero WCAG 2.1 AA violations across every screen state, both languages");
