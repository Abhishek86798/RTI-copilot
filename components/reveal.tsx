"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

/**
 * The OS-level motion preference, read as an external store rather than
 * copied into state by an effect. That keeps the server snapshot honest and
 * means a change to the setting applies immediately, not at the next reload.
 */
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

/** True only once the browser has taken over from the server-rendered HTML. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Reveals a block once as it scrolls into view.
 *
 * Three things keep a scroll animation from becoming an accessibility problem
 * on a page people need to read.
 *
 * It never hides content the browser has not confirmed it can show again: the
 * hiding classes are applied only after hydration, so the server-rendered HTML
 * — and therefore a no-JavaScript reader, a crawler, and the moment before the
 * bundle arrives on a slow connection — shows everything.
 *
 * Anyone who has asked their OS to reduce motion gets the finished state with
 * no animation at all.
 *
 * And there is a backstop. IntersectionObserver does the work, but a scroll
 * and resize listener re-checks geometry in case the observer misses — a
 * smooth-scroll library swallowing events, a throttled background tab, a
 * layout that shifted after observation. Losing the animation costs nothing;
 * leaving a citizen looking at a blank section is a broken website.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Component = "div",
}: {
  children: React.ReactNode;
  /** Stagger, in ms. Keep under ~200 or a list feels like it is loading. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  /*
   * A callback ref rather than `useRef` + `ref={ref}`: the rendered tag varies
   * (div / section / li), so an object ref would have to satisfy the
   * intersection of all three element types and does not typecheck. A callback
   * taking the common `HTMLElement` supertype does, and runs before effects.
   */
  const element = useRef<HTMLElement | null>(null);
  const setElement = (node: HTMLElement | null) => {
    element.current = node;
  };

  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  const animate = hydrated && !reduced;

  useEffect(() => {
    if (!animate) return;
    if (!element.current) return;
    // Re-bound as a non-nullable const: inside the closures below TypeScript
    // widens `element.current` back to `HTMLElement | null` on every read.
    const node: HTMLElement = element.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          cleanup();
        }
      },
      // Fire a little before the block reaches the fold, so the movement has
      // finished by the time it is actually being read.
      { rootMargin: "0px 0px -12% 0px", threshold: 0 }
    );

    function check() {
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        setShown(true);
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

  const hidden = animate && !shown;

  return (
    <Component
      ref={setElement}
      className={cn(
        animate && "transition-[opacity,transform] duration-700 ease-out",
        hidden ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100",
        className
      )}
      style={hidden ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
