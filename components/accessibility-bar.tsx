"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Contrast, Type } from "lucide-react";

import { Frame } from "@/components/editorial";
import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

/**
 * The reader controls: text size and high contrast.
 *
 * GIGW 3.0 expects these on a government site, and the reason is practical
 * rather than box-ticking. Browser zoom satisfies WCAG 1.4.4 on paper, but a
 * reader who does not know where their browser keeps zoom cannot use it — and
 * this product's audience skews older, often on a borrowed or unfamiliar
 * phone. An on-page control is the one they will actually find.
 *
 * High contrast is a separate axis from dark mode. The ordinary palette passes
 * AA; this is for the reader for whom AA still is not enough.
 *
 * Both write an attribute on <html> and persist the choice, and both are read
 * back before first paint by the inline script in `app/layout.tsx` — otherwise
 * the page renders at the default and visibly jumps on hydration.
 */

const SIZE_KEY = "rti-copilot:text-size";
const CONTRAST_KEY = "rti-copilot:contrast";

export type TextSize = "normal" | "large" | "larger";

const SIZES: TextSize[] = ["normal", "large", "larger"];

/*
 * Preferences live in an external store rather than component state.
 *
 * The value is already on <html> before React runs, set by the boot script, so
 * copying it into state inside an effect would mean rendering the wrong button
 * as pressed and then correcting it — a cascading render the React compiler
 * rightly rejects. `useSyncExternalStore` reads it where it actually lives and
 * gives a correct server snapshot for free.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function readSize(): TextSize {
  const value = document.documentElement.getAttribute("data-text-size");
  return value === "large" || value === "larger" ? value : "normal";
}

function readContrast(): boolean {
  return document.documentElement.getAttribute("data-contrast") === "high";
}

export function setTextSize(size: TextSize) {
  const root = document.documentElement;
  if (size === "normal") root.removeAttribute("data-text-size");
  else root.setAttribute("data-text-size", size);
  try {
    window.localStorage.setItem(SIZE_KEY, size);
  } catch {
    // Not remembering it is survivable; applying it is not.
  }
  emit();
}

export function setContrast(high: boolean) {
  const root = document.documentElement;
  if (high) root.setAttribute("data-contrast", "high");
  else root.removeAttribute("data-contrast");
  try {
    window.localStorage.setItem(CONTRAST_KEY, high ? "high" : "normal");
  } catch {
    // As above.
  }
  emit();
}

export function AccessibilityBar() {
  const { t } = useI18n();
  // Server snapshots are the defaults, which is what the boot script also
  // produces when nothing is stored — so the first paint always agrees.
  const size = useSyncExternalStore(subscribe, readSize, () => "normal" as TextSize);
  const high = useSyncExternalStore(subscribe, readContrast, () => false);

  return (
    <div data-print="hide" className="border-b border-border bg-card">
      <Frame className="flex min-h-11 flex-wrap items-center justify-end gap-x-4 gap-y-1 py-1">
        <Link
          href="/accessibility"
          className="text-xs underline-offset-4 opacity-75 hover:underline hover:opacity-100"
        >
          {t("a11y.statement")}
        </Link>

        <div role="group" aria-label={t("a11y.textSize")} className="flex items-center gap-1">
          <Type aria-hidden="true" className="size-3.5 opacity-75" />
          {SIZES.map((value, index) => (
            <button
              key={value}
              type="button"
              onClick={() => setTextSize(value)}
              aria-pressed={size === value}
              /*
               * The glyphs A− A A+ are a visual shorthand, not something a
               * screen reader can make sense of, so each button carries a real
               * name and the +/− sign itself is hidden from the reader.
               */
              aria-label={t(`a11y.size.${value}` as "a11y.size.normal")}
              title={t(`a11y.size.${value}` as "a11y.size.normal")}
              className={cn(
                "grid min-h-9 min-w-9 cursor-pointer place-items-center rounded-md leading-none font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                index === 0 && "text-xs",
                index === 1 && "text-sm",
                index === 2 && "text-base",
                size === value
                  ? "bg-primary text-primary-foreground"
                  : "opacity-75 hover:bg-muted hover:opacity-100"
              )}
            >
              A
              <span aria-hidden="true" className="text-[0.6em]">
                {index === 0 ? "−" : index === 2 ? "+" : ""}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setContrast(!high)}
          aria-pressed={high}
          className={cn(
            "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            high
              ? "bg-primary text-primary-foreground"
              : "opacity-75 hover:bg-muted hover:opacity-100"
          )}
        >
          <Contrast aria-hidden="true" className="size-3.5" />
          {t("a11y.contrast")}
        </button>
      </Frame>
    </div>
  );
}
