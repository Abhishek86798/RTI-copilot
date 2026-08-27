"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Lenis smooth scrolling, with an escape hatch that matters more than the
 * effect does.
 *
 * Smooth scroll replaces the browser's own scrolling with an animated one.
 * That is a nice touch for most people and a genuine problem for some: it is a
 * known vestibular-disorder trigger, and it decouples the scrollbar from where
 * the page actually is. So it runs only for people who have not asked their OS
 * to reduce motion, and it is torn down the moment they change that setting
 * rather than only at the next page load.
 *
 * It is also deliberately restrained — a short duration and a gentle ease. The
 * audience here is filing a legal document, often in a hurry and often on a
 * phone that is already struggling; scrolling that lags behind the thumb reads
 * as the page being broken, not as polish.
 */

/**
 * The live instance, module-scoped so the rest of the app can hand its scroll
 * requests to whatever is actually driving the page.
 *
 * Taking over scrolling means taking over responsibility for it. `window
 * .scrollTo` no longer reliably moves a Lenis page — Lenis reasserts its own
 * position on the next frame — so any code that wants the top of the page has
 * to ask through here or be silently ignored.
 */
let instance: Lenis | null = null;

/**
 * Jump to the top of the page.
 *
 * `immediate` on purpose: this is used for navigation and for wizard steps,
 * where the reader is being shown a different screen, and animating a
 * thousand-pixel scroll to get there is disorienting rather than smooth.
 */
export function scrollPageToTop() {
  if (instance) {
    instance.scrollTo(0, { immediate: true });
    return;
  }
  // Reduced motion, or before Lenis has started.
  window.scrollTo({ top: 0, behavior: "auto" });
}

/**
 * Hold the page still while a modal is open.
 *
 * A native `<dialog>` makes the page behind it inert to clicks and to the
 * accessibility tree, but not to the wheel — and Lenis is intercepting the
 * wheel for the whole document, so without this the background scrolls under
 * an open dialog. Both halves are needed: the attribute stops native
 * scrolling, `stop()` stops the one Lenis is animating.
 */
export function setPageScrollLocked(locked: boolean) {
  document.documentElement.toggleAttribute("data-scroll-locked", locked);
  if (locked) instance?.stop();
  else instance?.start();
}

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let observer: MutationObserver | null = null;

    function start() {
      if (instance) return;
      instance = new Lenis({
        // Short enough that the page still feels directly manipulated.
        duration: 0.9,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        // Touch devices already have excellent native inertia, and overriding
        // it on Android is what makes a site feel sluggish rather than smooth.
        syncTouch: false,
        smoothWheel: true,
      });

      function raf(time: number) {
        instance?.raf(time);
        frame = requestAnimationFrame(raf);
      }
      frame = requestAnimationFrame(raf);

      // React's dynamic DOM updates — a wizard step changing, a panel opening
      // — can land outside what ResizeObserver catches, leaving Lenis with a
      // stale page height and the scroll apparently locked. Recalculate on any
      // mutation.
      observer = new MutationObserver(() => {
        instance?.resize();
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    function stop() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      cancelAnimationFrame(frame);
      instance?.destroy();
      instance = null;
    }

    function sync() {
      if (query.matches) stop();
      else start();
    }

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      stop();
    };
  }, []);

  /*
   * Start every route at the top.
   *
   * Next resets the scroll itself on navigation, but it does so through the
   * window — which Lenis then overrides on its next frame, landing the reader
   * partway down a page they have never seen. Following a link from the foot
   * of the FAQ opened the next page already scrolled past its own heading.
   */
  useEffect(() => {
    scrollPageToTop();
  }, [pathname]);

  return null;
}
