"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Contrast, Type } from "lucide-react";

import { Frame } from "@/components/editorial";
import { ThemeToggle } from "@/components/theme-toggle";
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

/** The pages you consult while filing, as opposed to the ones you file on. */
const UTILITY_LINKS = [
  { href: "/manual", labelKey: "nav.manual" },
  { href: "/contact", labelKey: "nav.contact" },
  { href: "/faq", labelKey: "nav.faq" },
  { href: "/payment-reconciliation", labelKey: "nav.payment" },
] as const;

export function AccessibilityBar() {
  const { t } = useI18n();
  // Server snapshots are the defaults, which is what the boot script also
  // produces when nothing is stored — so the first paint always agrees.
  const size = useSyncExternalStore(subscribe, readSize, () => "normal" as TextSize);
  const high = useSyncExternalStore(subscribe, readContrast, () => false);

  return (
    <div data-print="hide" className="border-b border-border bg-card">
      {/*
        A utility strip, not a second navigation bar. It stays above the main
        header because that is where a reader who needs it looks first and
        where GIGW-conforming sites put it — but it is kept to a single tight
        row, right-aligned, with hairline-separated groups, so it reads as
        chrome rather than competing with the nav beneath it.
      */}
      <Frame className="flex min-h-9 flex-wrap items-center justify-between gap-y-0.5 py-0.5 text-xs">
        {/*
          The help pages live up here rather than in the main nav.

          Seven phrase-length items did not fit the page measure: "Fees" was
          rendering underneath the language toggle, invisible, on every screen.
          Splitting them by kind fixes it without shrinking anything — the
          three things you came to do stay in the nav below, and the four you
          consult while doing them sit in the strip that was already here and
          half empty. It is also the shape most government portals use.
        */}
        <nav aria-label={t("nav.utility")} className="hidden items-center xl:flex">
          {UTILITY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-8 items-center px-2 underline-offset-4 opacity-75 hover:underline hover:opacity-100"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-y-0.5">
        <Link
          href="/accessibility"
          className="inline-flex min-h-8 items-center px-2 underline-offset-4 opacity-75 hover:underline hover:opacity-100"
        >
          {t("a11y.statement")}
        </Link>

        <div
          role="group"
          aria-label={t("a11y.textSize")}
          className="ml-2 flex items-center gap-0.5 border-l border-border pl-3"
        >
          <Type aria-hidden="true" className="mr-1 size-3.5 shrink-0 opacity-75" />
          {SIZES.map((value, index) => (
            <button
              key={value}
              type="button"
              onClick={() => setTextSize(value)}
              aria-pressed={size === value}
              /*
               * The glyphs A− A A+ are a visual shorthand, not something a
               * screen reader can make sense of, so each button carries a real
               * name and the sign itself is hidden from the reader.
               */
              aria-label={t(`a11y.size.${value}` as "a11y.size.normal")}
              title={t(`a11y.size.${value}` as "a11y.size.normal")}
              className={cn(
                /*
                 * A fixed 32px box with the glyph centred inside it. The
                 * letters step up in size to show what each button does, so
                 * the box has to stay constant — otherwise the three chips are
                 * different heights and the selected one looks like a mistake.
                 */
                "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md leading-none font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                size === value
                  ? "bg-primary text-primary-foreground"
                  : "opacity-75 hover:bg-muted hover:opacity-100"
              )}
            >
              {/*
                Baseline-aligned inline row. As grid children the letter and
                the sign stacked vertically, which put the − and + underneath
                the A and made every chip too tall.
              */}
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex items-baseline",
                  index === 0 && "text-[0.7rem]",
                  index === 1 && "text-[0.85rem]",
                  index === 2 && "text-[1rem]"
                )}
              >
                A
                {index !== 1 && (
                  <span className="text-[0.6em] leading-none">
                    {index === 0 ? "−" : "+"}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* The separator belongs to the group, not to the control — a border
            on the button itself would cut across its own rounded corner. */}
        <div className="ml-2 flex items-center border-l border-border pl-3">
          <button
            type="button"
            onClick={() => setContrast(!high)}
            aria-pressed={high}
            className={cn(
              "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              high
                ? "bg-primary text-primary-foreground"
                : "opacity-75 hover:bg-muted hover:opacity-100"
            )}
          >
            <Contrast aria-hidden="true" className="size-3.5 shrink-0" />
            {/*
              Icon-only below sm. With the label shown, the strip wrapped onto
              a second row at 390px, which left a dangling separator and spent
              two rows of a small screen on chrome. The button keeps its
              accessible name either way.
            */}
            <span className="sr-only sm:not-sr-only">{t("a11y.contrast")}</span>
          </button>
        </div>

        {/*
          Theme sits with the other display preferences rather than in the
          main bar below.

          It is the same kind of setting as contrast and text size — how the
          page looks, chosen once and rarely revisited — and it was costing
          150px in a bar that needed 1427px to fit 1408px of container, which
          pushed the last nav item under the controls. Here it costs nothing:
          this strip is a single right-aligned row with room to spare, and it
          already wraps gracefully on a phone.
        */}
        <div className="ml-2 flex items-center border-l border-border pl-3">
          <ThemeToggle compact />
        </div>
        </div>
      </Frame>
    </div>
  );
}
