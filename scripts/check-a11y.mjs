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

  // ---- Step 1: describe ------------------------------------------------
  //
  // Seeded from a prepared case rather than typed. Routing and drafting call
  // a live model; without API keys the demo cases fall back to their saved
  // responses, which is what makes this audit runnable on any machine.
  await page.goto(`${BASE}/apply?case=pension`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });
  await page.waitForTimeout(400);
  await audit(page, tag("describe"));

  await button("intake.submit").click();

  // ---- Step 2: authority ----------------------------------------------
  // Either label can appear: a low-confidence result changes the wording, and
  // which one shows depends on what the live model returned this run.
  const confirm = button("confirm.submit").or(button("confirm.submitUnsure")).first();
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

  await next.click();
  await page.waitForURL(/\/applications\//, { timeout: 30_000 });
  await page.waitForTimeout(1200);

  // ---- Step 4: file ----------------------------------------------------
  await audit(page, tag("file-empty"));

  /*
   * Located by id suffix rather than by label: the signed-out header carries
   * its own sign-in form with an "Email address" and a "Mobile number" of its
   * own, so a label match is ambiguous on this screen.
   */
  const field = (name) => page.locator(`[id$="-${name}"]:not([id^="login-"])`);
  await field("name").fill("Test Applicant");
  await field("mobile").fill("9876543210");
  await field("address").fill("12 Test Road, Test City");
  await field("state").selectOption({ index: 1 });
  await field("pincode").fill("400001");
  await field("email").fill("test@example.com");
  await field("citizen").check();
  await page.waitForTimeout(400);
  await audit(page, tag("file-filled"));

  // ---- The acknowledgement, which is a modal ---------------------------
  await button("pay.confirm").click();
  await page.locator("dialog[open]").waitFor({ timeout: 30_000 });
  await page.waitForTimeout(400);
  await audit(page, tag("filed-dialog"));

  // Taken deliberately rather than waiting for the countdown to expire.
  await button("receipt.dashboard").click();
  await page.waitForFunction(() => location.pathname === "/applications", null, {
    timeout: 20_000,
  });
  await page.waitForTimeout(800);
  await audit(page, tag("list-populated"));

  // ---- Status, the lapsed state, and the appeal ------------------------
  const id = await page.evaluate(() => {
    const raw = localStorage.getItem("rti-copilot:applications");
    return raw ? JSON.parse(raw).applications?.[0]?.id : null;
  });

  await page.goto(`${BASE}/applications/${id}/track`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await audit(page, tag("status"));

  const simulate = button("track.simulate");
  if (await simulate.count()) {
    await simulate.click();
    await page.waitForTimeout(1800);
    await audit(page, tag("status-overdue"));
  }

  await page.goto(`${BASE}/applications/${id}/appeal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await audit(page, tag("appeal"));
}

const browser = await chromium.launch();

try {
  for (const [vpName, viewport] of [
    ["mobile", { width: 375, height: 812 }],
    ["desktop", { width: 1280, height: 900 }],
  ]) {
    for (const locale of ["en", "hi"]) {
      /*
       * Audited with reduced motion.
       *
       * Not to skip anything: the scroll reveals fade text in from
       * transparent, and axe sampling a block mid-fade reported the landing
       * page as a wall of 1.02:1 contrast failures — text against its own
       * background, on about half of runs. The finished colours are the ones
       * a reader sees and the ones worth testing, and reduced motion is
       * exactly the path that renders them immediately.
       */
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
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
