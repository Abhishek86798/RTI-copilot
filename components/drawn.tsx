"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

/**
 * Draws a line-art diagram on as it scrolls into view.
 *
 * The technique is `stroke-dashoffset`: every stroke marked `data-draw` in the
 * diagram carries `pathLength={1}`, which normalises its length to 1 no matter
 * how long the path actually is. One dash of length 1, offset by 1, hides the
 * stroke; animating the offset to 0 walks it into existence. Because the
 * length is normalised, every stroke finishes together and the CSS needs no
 * per-path measurement in JavaScript.
 *
 * Only structural strokes are marked. Anything already using a dash pattern
 * for meaning — the transferred-application branches, the appeal window — is
 * left alone, because a drawing animation and a dashed line cannot both own
 * `stroke-dasharray`.
 *
 * The diagram is fully drawn and readable if the animation never runs. It
 * starts hidden only after hydration has confirmed it can be un-hidden, and it
 * is skipped outright for anyone who has asked for reduced motion.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function subscribeMotion(listener: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

export function Drawn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const element = useRef<HTMLDivElement | null>(null);
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const [drawn, setDrawn] = useState(false);

  const animate = hydrated && !reduced;

  useEffect(() => {
    if (!animate) return;
    if (!element.current) return;
    const node: HTMLElement = element.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          cleanup();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    // Same backstop as Reveal: a diagram that stays half-drawn because an
    // observer never fired is worse than one that never animated.
    function check() {
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        setDrawn(true);
        cleanup();
      }
    }

    function cleanup() {
      observer.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    }

    observer.observe(node);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });

    return cleanup;
  }, [animate]);

  return (
    <div
      ref={element}
      className={cn(animate && "drawable", className)}
      data-drawn={animate && drawn ? "true" : undefined}
    >
      {children}
    </div>
  );
}
