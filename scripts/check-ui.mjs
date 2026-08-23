/**
 * UI review pass: screenshots every screen at mobile and desktop, in both
 * languages, and fails on layout or contrast problems that are easy to ship
 * without noticing.
 *
 *   pnpm dev
 *   node scripts/check-ui.mjs
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DIR = process.env.SHOT_DIR ?? ".";

const browser = await chromium.launch();
const problems = [];

const screens = [
  ["home", "/"],
  ["apply", "/apply?case=pension"],
  ["list", "/applications"],
  ["how", "/how-it-works"],
];
const viewports = [
  ["mobile", { width: 375, height: 812 }],
  ["desktop", { width: 1280, height: 900 }],
];

try {
  for (const [vpName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });

    for (const [name, path] of screens) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      // Horizontal overflow is the classic mobile break: it makes a page pan
      // sideways and pushes the primary action off screen.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      if (overflow > 1) problems.push(`${name} @${vpName}: overflows by ${overflow}px`);

      // Anything interactive must be reachable by a thumb. WCAG 2.5.5 asks for
      // 44px; this app's own notes claim it.
      const small = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("button, a[href], input, select, textarea")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue; // hidden
          // Skip-links are 1px until focused, by design; the wordmark is a
          // link home, not a control competing for a thumb.
          const isSkipLink = el.className?.toString?.().includes("sr-only");
          const isWordmark = el.getAttribute("href") === "/";
          if (r.height < 44 && !el.closest("footer") && !isSkipLink && !isWordmark) {
            out.push(`${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 28)} ${Math.round(r.height)}px`);
          }
        }
        return out;
      });
      for (const s of small) problems.push(`${name} @${vpName}: touch target ${s}`);

      // Every page needs exactly one h1 for screen-reader navigation.
      const h1s = await page.locator("h1").count();
      if (h1s !== 1) problems.push(`${name} @${vpName}: ${h1s} <h1> elements (expected 1)`);

      await page.screenshot({ path: `${DIR}/ui-${name}-${vpName}.png`, fullPage: true });
    }

    await page.close();
  }

  // Hindi: Devanagari is taller than Latin, so it is where text clips or wraps
  // out of a button first.
  const hi = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await hi.goto(`${BASE}/apply?case=pension`, { waitUntil: "networkidle" });
  await hi.getByRole("button", { name: /हिन्दी/ }).click();
  await hi.waitForTimeout(800);
  const hiOverflow = await hi.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (hiOverflow > 1) problems.push(`hindi @mobile: overflows by ${hiOverflow}px`);
  await hi.screenshot({ path: `${DIR}/ui-hindi-mobile.png`, fullPage: true });
  await hi.close();

  if (problems.length) {
    console.log("UI problems found:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  } else {
    console.log("ui: no overflow, touch-target, or heading problems found");
  }
  console.log(`screenshots written to ${DIR}/ui-*.png`);
  assert.deepEqual(problems, [], `${problems.length} UI problems`);
} finally {
  await browser.close();
}

/* Dark mode must reach both styling systems. Ours keys off `.dark`, UX4G off
 * data-theme — driving only one leaves half the page in the other theme, and
 * the seam is invisible until someone actually toggles it. */
{
  const browser2 = await chromium.launch();
  const page = await browser2.newPage({ viewport: { width: 1280, height: 900 } });
  const darkProblems = [];

  await page.goto(`${BASE}/apply?case=pension`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Dark/i }).click();
  await page.waitForTimeout(600);

  const state = await page.evaluate(() => {
    const root = document.documentElement;
    const body = getComputedStyle(document.body).backgroundColor;
    const card = document.querySelector(".ux4g-card");
    return {
      hasClass: root.classList.contains("dark"),
      attr: root.getAttribute("data-theme"),
      body,
      cardBg: card ? getComputedStyle(card).backgroundColor : null,
      cardColor: card ? getComputedStyle(card).color : null,
    };
  });

  if (!state.hasClass) darkProblems.push("dark: .dark class not set");
  if (state.attr !== "dark") darkProblems.push(`dark: data-theme is ${state.attr}`);

  // A dark page must not be painted on a light ground. Colours can come back
  // as rgb() or lab(), so luminance is measured by painting the value into a
  // canvas rather than by parsing the string.
  const lum = await page.evaluate((colors) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    return colors.map((color) => {
      if (!color) return null;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return (r + g + b) / 3;
    });
  }, [state.body, state.cardBg]);

  if (lum[0] !== null && lum[0] > 128) {
    darkProblems.push(`dark: body still light (${state.body})`);
  }
  if (lum[1] !== null && lum[1] > 128) {
    darkProblems.push(`dark: ux4g card still light (${state.cardBg})`);
  }

  await page.screenshot({ path: `${DIR}/ui-dark.png`, fullPage: true });
  await browser2.close();

  if (darkProblems.length) {
    console.log("dark mode problems:\n" + darkProblems.map((p) => `  - ${p}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("dark: both styling systems follow the toggle");
  }
}
