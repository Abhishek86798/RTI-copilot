import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
await page.goto("http://localhost:3000/apply", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
console.log(await page.evaluate(() => {
  const el = document.createElement("div");
  return {
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    lenisClass: document.documentElement.className,
  };
}));
// simulate the lock the way the dialog does
await page.evaluate(() => document.documentElement.toggleAttribute("data-scroll-locked", true));
console.log(await page.evaluate(() => getComputedStyle(document.documentElement).overflow));
await page.mouse.wheel(0, 600);
await page.waitForTimeout(700);
console.log("scrollY after wheel with attribute:", await page.evaluate(() => window.scrollY));
await browser.close();
