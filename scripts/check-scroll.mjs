/**
 * Every navigation opens at the top of the page.
 *
 * This is not as automatic as it sounds. Three separate mechanisms can each
 * leave a reader partway down a screen they have never seen, and all three
 * have happened here:
 *
 *   - Lenis drives the scroll, so `window.scrollTo` — which is what Next uses
 *     to reset on a route change — is reasserted away on the next frame.
 *   - `usePathname` does not change for a query-only move, so
 *     /applications/<id> to /apply?draft=<id> was not seen as a navigation.
 *   - The browser restores a scroll position on back/forward, and a step that
 *     scrolled its own heading into view left the page header above the fold.
 *
 * None of those is visible in a screenshot of the finished page, which is why
 * this walks the real thing: it scrolls to the bottom, clicks, and asks where
 * it landed.
 *
 *   pnpm dev
 *   node scripts/check-scroll.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

/** Anything under this is the top; sub-pixel rounding is not a failure. */
const TOLERANCE = 4;

const ROUTES = [
  "/",
  "/apply",
  "/applications",
  "/appeal",
  "/manual",
  "/contact",
  "/faq",
  "/payment-reconciliation",
  "/how-it-works",
  "/accessibility",
  "/policies",
  "/sitemap",
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const field = (name) => page.locator(`[id$="-${name}"]:not([id^="login-"])`);
const next = () => page.getByRole("button", { name: /^Next$/ });
const back = () => page.getByRole("button", { name: /^Back$/ });

async function toBottom() {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
}

const failures = [];
async function landed(what) {
  await page.waitForTimeout(900);
  const y = await page.evaluate(() => Math.round(window.scrollY));
  if (y > TOLERANCE) failures.push(`${what}: landed at ${y}px`);
}

try {
  /* ---- every internal link, clicked from the foot of its page ---------- */
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const hrefs = await page.evaluate(() =>
      [
        ...new Set(
          [...document.querySelectorAll("a[href^='/']")].map((a) =>
            a.getAttribute("href")
          )
        ),
      ].filter((href) => href && href !== "#")
    );

    for (const href of hrefs) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      await toBottom();
      const link = page.locator(`a[href="${href}"]`).first();
      if (!(await link.count())) continue;
      await link.scrollIntoViewIfNeeded();
      await link.click({ timeout: 5000 }).catch(() => {});
      await landed(`${route} -> ${href}`);
    }
  }

  /* ---- the journey, step by step -------------------------------------- */
  await page.goto(`${BASE}/apply?case=pension`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });

  await toBottom();
  await page.getByRole("button", { name: /Find the right office/i }).click();
  const draft = page.getByRole("button", { name: /Write my application/i });
  await draft.waitFor({ timeout: 60_000 });
  await landed("describe -> authority");

  await toBottom();
  await draft.click();
  const toFiling = page.getByRole("button", { name: /Continue to filing/i });
  await toFiling.waitFor({ timeout: 60_000 });
  await landed("authority -> draft");

  await toBottom();
  await back().click();
  await landed("draft -> authority (Back)");

  await draft.click();
  await toFiling.waitFor({ timeout: 60_000 });
  await toBottom();
  await toFiling.click();
  await page.waitForURL(/\/applications\/[^/]+$/, { timeout: 30_000 });
  const id = page.url().split("/").pop();
  await landed("draft -> filing");

  /*
   * The sub-steps. These are the ones that broke: they are not route changes,
   * so nothing in the router resets them.
   */
  await toBottom();
  await next().click();
  await landed("filing: authority -> your details");

  await field("name").fill("Test Applicant");
  await field("mobile").fill("9876543210");
  await field("address").fill("12 Test Road, Test City");
  await field("state").selectOption({ index: 1 });
  await field("pincode").fill("400001");
  await field("email").fill("test@example.com");

  await toBottom();
  await next().click();
  await landed("filing: your details -> declaration");

  await toBottom();
  await back().click();
  await landed("filing: declaration -> your details (Back)");

  await toBottom();
  await page.getByRole("button", { name: /Declaration/i }).first().click();
  await landed("filing: chip -> declaration");

  await field("citizen").check();
  await toBottom();
  await next().click();
  await landed("filing: declaration -> request");

  await toBottom();
  await next().click();
  await landed("filing: request -> fee");

  /*
   * Back out to the draft. Four Backs walk the sub-steps down to the first;
   * the fifth leaves the route entirely, changing only the query string —
   * which is the navigation `usePathname` alone does not see.
   */
  await toBottom();
  for (let i = 0; i < 5; i += 1) {
    await back().click();
    await page.waitForTimeout(600);
  }
  await page.waitForFunction((want) => location.search === `?draft=${want}`, id, {
    timeout: 20_000,
  });
  await landed("filing -> draft (query-only navigation)");

  /* ---- filing through to the dashboard, then the later screens --------- */
  await page.getByRole("button", { name: /Continue to filing/i }).click();
  await page.waitForURL(/\/applications\/[^/]+$/, { timeout: 20_000 });
  await page.waitForTimeout(700);
  for (let i = 0; i < 4; i += 1) {
    await next().click();
    await page.waitForTimeout(400);
  }
  await toBottom();
  await page.getByRole("button", { name: /Pay ₹10 and file/i }).click();
  await page.locator("dialog[open]").waitFor({ timeout: 20_000 });
  await page.waitForURL(/\/applications$/, { timeout: 25_000 });
  await landed("receipt -> dashboard");

  await toBottom();
  // The row's own link, not a nav item.
  await page.locator('main a[href$="/track"]').first().click();
  await page.waitForFunction(() => location.pathname.endsWith("/track"), null, {
    timeout: 20_000,
  });
  await landed("dashboard -> status");

  const simulate = page.getByRole("button", { name: /Simulate/i });
  if (await simulate.count()) {
    await simulate.click();
    await page.waitForTimeout(1500);
  }
  await toBottom();
  const toAppeal = page.getByRole("link", { name: /Submit First Appeal/i }).last();
  if (await toAppeal.count()) {
    await toAppeal.click();
    await page.waitForFunction(() => location.pathname.endsWith("/appeal"), null, {
      timeout: 20_000,
    });
    await landed("status -> appeal");
  }

  /* ---- and the two the browser owns ------------------------------------ */
  await toBottom();
  await page.goBack();
  await landed("browser back");
  await toBottom();
  await page.goForward();
  await landed("browser forward");

  if (failures.length) {
    console.error("scroll: navigations that did not open at the top");
    for (const line of failures) console.error(`  ${line}`);
    process.exitCode = 1;
  } else {
    console.log("scroll: every navigation opens at the top");
  }
} finally {
  await browser.close();
}
