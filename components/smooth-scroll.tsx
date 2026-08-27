"use client";

import { useEffect } from "react";
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
export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let frame = 0;
    let observer: MutationObserver | null = null;

    function start() {
      if (lenis) return;
      lenis = new Lenis({
        // Short enough that the page still feels directly manipulated.
        duration: 0.9,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        // Touch devices already have excellent native inertia, and overriding
        // it on Android is what makes a site feel sluggish rather than smooth.
        syncTouch: false,
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      }
      frame = requestAnimationFrame(raf);

      // Fix for random scroll locking: React's dynamic DOM updates (like wizard step changes)
      // sometimes happen too fast or outside ResizeObserver's catch. This forces Lenis
      // to recalculate the page height whenever the DOM mutates.
      observer = new MutationObserver(() => {
        lenis?.resize();
      });
      observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        characterData: true 
      });
    }

    function stop() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
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

  return null;
}
