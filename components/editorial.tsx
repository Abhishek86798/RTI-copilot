"use client";

import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

/**
 * The editorial layer that sits on top of the UX4G design system.
 *
 * UX4G supplies the tokens, the controls and the accessibility floor. What it
 * does not supply is a shared sense of rhythm — so the spacing scale lives
 * here, in one file, and every page composes from it. That is the point of the
 * module: when a page hand-rolls its own padding, the app stops feeling like
 * one product by the third screen.
 *
 * The structure is Swiss. A 1px hairline in `--border` does the work cards and
 * shadows would otherwise do, headings run large and tightly tracked, and
 * labels are small spaced capitals. Quiet, and cheap in ink.
 *
 * THE SCALE — compose from these rather than inventing a value:
 *   Frame      horizontal measure, one for the whole app
 *   PAGE_LAYOUT  standard tool-page wrapper classes
 *   Stack      vertical rhythm between blocks inside a page
 *   Band       full-bleed section, hairline-separated
 */

/** Horizontal measure. Every page and band aligns to this and nothing else. */
export function Frame({
  children,
  className,
  width = "wide",
}: {
  children: React.ReactNode;
  className?: string;
  /** `wide` for landing bands, `text` for reading and form pages. */
  width?: "wide" | "text";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        width === "wide" ? "max-w-[88rem]" : "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * The layout every tool page uses for its outer wrapper.
 *
 * Exported as a class string rather than a component because these pages each
 * own their root element for other reasons; what they must not own is their
 * own idea of spacing. Before this, four routes carried four different values
 * (py-8, py-10, py-14, py-16) and the app quietly stopped feeling like one
 * product by the third screen.
 *
 * Gutters match `Frame`, so a form page and a landing band align to the same
 * measure at every breakpoint.
 */
export const PAGE_LAYOUT =
  "mx-auto w-full max-w-4xl px-6 py-12 sm:px-12 sm:py-20 lg:px-16 lg:py-28";

/**
 * Vertical rhythm between blocks. Three steps, deliberately few — a scale with
 * eight options is a scale nobody follows.
 */
export function Stack({
  children,
  gap = "md",
  className,
}: {
  children: React.ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        { sm: "space-y-6", md: "space-y-12", lg: "space-y-16 lg:space-y-24" }[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/** Full-bleed band. `frame` draws the hairline that separates it from the next. */
export function Band({
  id,
  children,
  className,
  tone = "default",
  frame = true,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "alt" | "invert";
  frame?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        frame && "border-t border-border",
        tone === "alt" && "bg-card",
        tone === "invert" && "border-foreground bg-foreground text-background",
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * "01 THE PROBLEM / 05". Small, tracked, and paired with the count so a reader
 * can see how much of the argument is left before committing to it.
 */
export function Marker({
  index,
  total,
  label,
  className,
  dim = true,
}: {
  index?: number;
  total?: number;
  label: string;
  className?: string;
  /**
   * Markers are muted by default. Pass false when the caller has given the
   * marker a status colour — `--destructive` and `--success` are mid-tone
   * already, and dimming them to 75% drops the label under 4.5:1.
   */
  dim?: boolean;
}) {
  return (
    <p
      className={cn(
        "flex items-baseline gap-3 font-mono text-[0.68rem] tracking-[0.18em] uppercase",
        className
      )}
    >
      {index !== undefined && <span>{String(index).padStart(2, "0")}</span>}
      <span className={dim ? "opacity-75" : undefined}>{label}</span>
      {total !== undefined && (
        <span className="opacity-72">/ {String(total).padStart(2, "0")}</span>
      )}
    </p>
  );
}

/**
 * Display heading. Capped near 19 characters a line — a long headline set
 * across the full measure is unreadable no matter how large it is.
 */
export function Display({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      className={cn(
        "max-w-[19ch] text-[2.15rem] leading-[1.02] font-bold tracking-[-0.02em] text-balance",
        "sm:text-[2.75rem] lg:text-[3.4rem]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A page-level title, for the routes that are tools rather than argument.
 * Smaller than `Display`, so a form screen does not shout at someone who is
 * already mid-task.
 */
export function PageTitle({
  children,
  lead,
  marker,
  className,
}: {
  children: React.ReactNode;
  lead?: React.ReactNode;
  marker?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-border pb-8", className)}>
      {marker && <div className="mb-5">{marker}</div>}
      <h1 className="max-w-[24ch] text-[1.75rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
        {children}
      </h1>
      {lead && (
        <p className="mt-5 max-w-[58ch] text-base leading-relaxed opacity-75 sm:text-lg">
          {lead}
        </p>
      )}
    </header>
  );
}

/**
 * A statistic. The numeral is the point, so it gets display size; the source
 * is a required prop, because an unsourced figure on a page about government
 * accountability undercuts the argument it is making.
 */
export function Stat({
  value,
  label,
  source,
  className,
}: {
  value: string;
  label: string;
  source: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-[2.25rem] leading-[1] font-bold tracking-[-0.03em] tabular-nums sm:text-[2.9rem]">
        {value}
      </p>
      <p className="mt-4 text-sm leading-snug font-medium">{label}</p>
      <p className="mt-2 text-xs leading-relaxed opacity-75">{source}</p>
    </div>
  );
}

/**
 * A row of cells divided by hairlines rather than gaps.
 *
 * Dividers are left borders on every cell after the first, suppressed at each
 * row start, so the grid stays correct as it reflows from four columns to two
 * to one. The first cell of each row also loses its left padding, which keeps
 * every row flush with the page measure instead of floating inside it.
 */
export function RuleGrid({
  children,
  cols = 4,
  className,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const layout = {
    2: "sm:grid-cols-2 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0 [&>*:nth-child(2n+1)]:sm:pl-0",
    3: "sm:grid-cols-2 lg:grid-cols-3 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0 [&>*:nth-child(2n+1)]:sm:pl-0 [&>*:nth-child(2n+1)]:lg:border-l [&>*:nth-child(2n+1)]:lg:pl-8 [&>*:nth-child(3n+1)]:lg:border-l-0 [&>*:nth-child(3n+1)]:lg:pl-0",
    4: "sm:grid-cols-2 lg:grid-cols-4 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0 [&>*:nth-child(2n+1)]:sm:pl-0 [&>*:nth-child(2n+1)]:lg:border-l [&>*:nth-child(2n+1)]:lg:pl-8 [&>*:nth-child(4n+1)]:lg:border-l-0 [&>*:nth-child(4n+1)]:lg:pl-0",
  }[cols];

  return (
    <div
      className={cn(
        "grid grid-cols-1 [&>*]:border-border [&>*]:border-b [&>*]:py-9 sm:[&>*]:border-b-0",
        "[&>*]:sm:px-8",
        layout,
        className
      )}
    >
      {children}
    </div>
  );
}

/** A hairline. Its own component so pages never hand-roll a border. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-border", className)} />;
}

/** Reveal re-exported so pages import their layout vocabulary from one place. */
export { Reveal };
